# Migration Deployment Guide

> **Owner:** Data Architect
> **Last Updated:** 2026-01-29
> **Status:** Production Ready

---

## Purpose

This guide provides step-by-step procedures for safely deploying database migrations to production, with emphasis on zero-downtime strategies and rollback procedures.

---

## General Principles

### Zero-Downtime Requirements

1. **Online Schema Changes**: Use `CREATE INDEX CONCURRENTLY`, `ALTER TABLE` with minimal locks
2. **Backward Compatibility**: Ensure old code works with new schema during deployment
3. **Phased Rollout**: Deploy migrations before application code changes
4. **Monitoring**: Track migration progress and database health metrics
5. **Rollback Ready**: Always have tested rollback procedure

### Pre-Deployment Checklist

- [ ] Migration tested on staging database (same data volume)
- [ ] Rollback SQL prepared and tested
- [ ] Database backup completed and verified
- [ ] Monitoring dashboards ready
- [ ] Team notified (schedule downtime window if needed)
- [ ] Application health check endpoints verified
- [ ] Load testing completed if schema affects hot tables

---

## Migration 0003: Partial Indexes (2026-01-29)

### Overview

- **File:** `packages/database/drizzle/migrations/0003_add_partial_indexes.sql`
- **Type:** Index creation (8 partial indexes)
- **Risk Level:** LOW (read-only operation, CONCURRENTLY flag)
- **Estimated Duration:** 5-15 minutes (depends on table sizes)
- **Downtime:** NONE (concurrent index creation)

### Indexes Being Created

**P1 Priority (Feed Performance):**
1. `idx_polls_feed_active` - (status, visibility, publishedAt DESC) WHERE deletedAt IS NULL
2. `idx_polls_user_active` - (creatorId, createdAt DESC) WHERE deletedAt IS NULL

**P2 Priority (Content Listing):**
3. `idx_surveys_org_active` - (organizationId, status, createdAt DESC) WHERE deletedAt IS NULL
4. `idx_comments_ranked_active` - (discussionId, status, wilsonScore DESC) WHERE deletedAt IS NULL AND status = 'VISIBLE'
5. `idx_comments_recent_active` - (discussionId, createdAt DESC) WHERE deletedAt IS NULL AND status = 'VISIBLE'

**P3 Priority (Analytics):**
6. `idx_discussions_active` - (status, lastActivityAt DESC) WHERE deletedAt IS NULL
7. `idx_poll_responses_valid_active` - (pollId, createdAt DESC) WHERE deletedAt IS NULL AND isValid = true
8. `idx_survey_responses_valid_active` - (surveyId, completedAt DESC) WHERE deletedAt IS NULL AND isValid = true AND status = 'COMPLETED'

### Impact Analysis

**Tables Affected:**
- `polls` (~10K-100K rows expected)
- `surveys` (~1K-10K rows expected)
- `comments` (~50K-500K rows expected)
- `discussions` (~5K-50K rows expected)
- `poll_responses` (~100K-1M rows expected)
- `survey_responses` (~10K-100K rows expected)

**Performance Impact:**
- **During Creation:** Minimal (CONCURRENTLY prevents table locks)
- **After Creation:** 2-5x faster feed/listing queries
- **Index Size:** 50-90% smaller than full table indexes (partial WHERE clause)
- **Maintenance:** Low overhead (deletedAt rarely changes from NULL)

### Pre-Deployment Steps

#### 1. Staging Verification

```bash
# Connect to staging database
psql $STAGING_DATABASE_URL

# Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE tablename IN ('polls', 'surveys', 'comments', 'discussions', 'poll_responses', 'survey_responses')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Estimate index creation time (rule of thumb: ~1-2 min per 100K rows for partial index)
```

#### 2. Backup Production Database

```bash
# Full backup with pg_dump
pg_dump $DATABASE_URL \
  --format=custom \
  --file=backup-pre-migration-0003-$(date +%Y%m%d-%H%M%S).dump \
  --verbose

# Verify backup
pg_restore --list backup-pre-migration-0003-*.dump | head -20

# Upload to S3/backup storage
aws s3 cp backup-pre-migration-0003-*.dump s3://voxpoll-backups/migrations/
```

#### 3. Deploy to Staging

```bash
# Run migration on staging
cd packages/database
pnpm drizzle-kit push

# OR manually apply SQL
psql $STAGING_DATABASE_URL < drizzle/migrations/0003_add_partial_indexes.sql

# Monitor index creation progress
SELECT
  now()::time,
  pid,
  state,
  query_start,
  age(now(), query_start) as duration,
  query
FROM pg_stat_activity
WHERE query LIKE '%CREATE INDEX%';
```

#### 4. Verify Index Usage (Staging)

```bash
# Wait 1-2 hours for statistics to accumulate

# Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE indexname LIKE '%_active'
ORDER BY idx_scan DESC;

# Verify query plans use new indexes
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM polls
WHERE status = 'PUBLISHED' AND visibility = 'PUBLIC' AND deletedAt IS NULL
ORDER BY publishedAt DESC
LIMIT 20;
```

### Production Deployment

#### 1. Maintenance Window (Optional)

For ultra-safe deployment, schedule a low-traffic window:
- **Recommended:** 2AM-5AM UTC (lowest traffic)
- **Duration:** 30 minutes (15 min migration + 15 min buffer)
- **Announcement:** Not required (zero downtime)

#### 2. Execute Migration

```bash
# Connect to production
psql $DATABASE_URL

# Set statement timeout (safety: kill if takes >30 min)
SET statement_timeout = '30min';

# Apply migration (paste SQL content or use file)
\i packages/database/drizzle/migrations/0003_add_partial_indexes.sql

# Monitor progress in another terminal
watch -n 5 "psql $DATABASE_URL -c \"
SELECT
  now()::time as time,
  pid,
  state,
  query_start,
  age(now(), query_start) as duration,
  LEFT(query, 100) as query
FROM pg_stat_activity
WHERE query LIKE '%CREATE INDEX%'
\""
```

#### 3. Real-Time Monitoring

**Database Metrics:**
- CPU usage (should remain <80%)
- Lock waits (should be minimal)
- Connection count (should be normal)
- Replication lag (should be <10s)

**Application Metrics:**
- API response times (should be normal or improving)
- Error rate (should be unchanged)
- Active connections (should be stable)

**Query:**
```sql
-- Monitor lock conflicts
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.query AS blocked_query,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.query AS blocking_query
FROM pg_locks blocked_locks
JOIN pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_locks blocking_locks
  ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

#### 4. Post-Deployment Verification

```bash
# Verify all indexes created
psql $DATABASE_URL -c "
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname LIKE '%_active'
ORDER BY tablename, indexname;
"

# Check index sizes
psql $DATABASE_URL -c "
SELECT
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE indexname LIKE '%_active'
ORDER BY pg_relation_size(indexrelid) DESC;
"

# Verify no invalid indexes
psql $DATABASE_URL -c "
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE indexname LIKE '%_active'
AND indexname IN (
  SELECT indexrelid::regclass::text
  FROM pg_index
  WHERE NOT indisvalid
);
"
# Expected: 0 rows (all indexes valid)
```

#### 5. Performance Benchmarking

```bash
# Run feed query benchmark (before/after comparison)
psql $DATABASE_URL -c "
EXPLAIN (ANALYZE, BUFFERS, TIMING ON)
SELECT * FROM polls
WHERE status = 'PUBLISHED'
  AND visibility = 'PUBLIC'
  AND deletedAt IS NULL
ORDER BY publishedAt DESC
LIMIT 20;
"

# Expected improvement: 2-5x faster execution time

# Run user content query benchmark
psql $DATABASE_URL -c "
EXPLAIN (ANALYZE, BUFFERS, TIMING ON)
SELECT * FROM polls
WHERE creatorId = 'sample_user_id'
  AND deletedAt IS NULL
ORDER BY createdAt DESC
LIMIT 20;
"
```

### Rollback Procedure

**Scenario:** Index creation causes unexpected issues

#### Immediate Rollback (Cancel Index Creation)

If migration is still running and needs to be stopped:

```sql
-- Find index creation PID
SELECT pid, query_start, state, query
FROM pg_stat_activity
WHERE query LIKE '%CREATE INDEX CONCURRENTLY%';

-- Cancel gracefully (PID from above)
SELECT pg_cancel_backend(PID);

-- If cancel doesn't work, terminate (more forceful)
SELECT pg_terminate_backend(PID);
```

#### Full Rollback (Drop Indexes)

If indexes were created but causing issues:

```sql
-- Drop all partial indexes (safe, no data loss)
DROP INDEX CONCURRENTLY IF EXISTS idx_polls_feed_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_polls_user_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_surveys_org_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_comments_ranked_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_comments_recent_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_discussions_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_poll_responses_valid_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_survey_responses_valid_active;
```

**CONCURRENTLY Note:**
- Prevents table locks during drop
- Can take several minutes for large indexes
- Safe to run during production traffic

#### Rollback Verification

```sql
-- Confirm indexes dropped
SELECT indexname
FROM pg_indexes
WHERE indexname LIKE '%_active';
-- Expected: 0 rows

-- Verify application still functions (queries will use existing indexes)
```

### Post-Deployment Tasks

#### 1. Update Documentation

- [ ] Update Bible (05-TECH/02-database-schema.md) status: "Deployed to production"
- [ ] Log deployment in audit trail (11-audit/data-architect-YYYY-MM-DD.md)
- [ ] Update IMPLEMENTATION_STATUS.md (mark TASK-006 as deployed)

#### 2. Monitor for 24 Hours

**Key Metrics:**
- Index usage statistics (pg_stat_user_indexes.idx_scan should increase)
- Query performance (feed/listing queries should be faster)
- Database CPU/memory (should be stable or lower)
- Application errors (should not increase)

**Query to Monitor:**
```sql
-- Run every 6 hours for 24 hours
SELECT
  now() as snapshot_time,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE indexname LIKE '%_active'
ORDER BY idx_scan DESC;
```

#### 3. Performance Report

After 24 hours, generate performance comparison report:

**Metrics to Capture:**
- Average feed query time (before vs after)
- P95 query latency
- Index scan counts
- Database load reduction
- Application response time improvement

**Expected Results:**
- Feed queries: 2-5x faster
- Memory usage: 30-60% lower (partial indexes)
- CPU usage: Stable or slightly lower
- Application satisfaction: Improved

---

## Common Issues & Troubleshooting

### Issue: Index Creation Fails with "Out of Memory"

**Cause:** Large table + insufficient maintenance_work_mem

**Solution:**
```sql
-- Increase maintenance_work_mem temporarily
SET maintenance_work_mem = '2GB';
-- Then retry index creation
```

### Issue: Index Creation is Taking Too Long (>1 hour)

**Cause:** Table locks, slow I/O, or high load

**Solution:**
1. Check for blocking queries: `SELECT * FROM pg_stat_activity WHERE state = 'active'`
2. Verify no locks: `SELECT * FROM pg_locks WHERE NOT granted`
3. Consider running during lower traffic period
4. Increase resources (scale up database temporarily)

### Issue: Application Queries Not Using New Index

**Cause:** Query planner hasn't updated statistics

**Solution:**
```sql
-- Force statistics update
ANALYZE polls;
ANALYZE surveys;
ANALYZE comments;

-- Verify query plan
EXPLAIN SELECT * FROM polls WHERE deletedAt IS NULL AND status = 'PUBLISHED';
```

### Issue: High Database CPU After Deployment

**Cause:** Query planner re-optimizing with new indexes

**Solution:**
- This is normal for 1-2 hours post-deployment
- Monitor and ensure it stabilizes
- If persists >4 hours, consider rolling back

---

## Future Migrations Reference

### Safe Migration Patterns

**Always Safe (Online):**
- `CREATE INDEX CONCURRENTLY`
- `DROP INDEX CONCURRENTLY`
- `ALTER TABLE ADD COLUMN` (with DEFAULT only if database supports it efficiently)
- `CREATE TABLE`
- `ALTER TABLE ADD CONSTRAINT` (validation done separately)

**Requires Careful Planning:**
- `ALTER TABLE DROP COLUMN` (ensure no code references it)
- `ALTER TABLE ALTER COLUMN TYPE` (may require table rewrite)
- `ALTER TABLE ADD CONSTRAINT` with immediate validation (can lock table)

**High Risk (Avoid or Plan Carefully):**
- `DROP TABLE` (ensure no references)
- `ALTER TABLE RENAME` (requires coordinated application deployment)
- Bulk `UPDATE` statements (can lock rows for extended period)

### Migration Testing Checklist Template

```markdown
## Migration: XXXX_description.sql

### Pre-Testing
- [ ] Backup created
- [ ] Rollback SQL prepared
- [ ] Team notified

### Staging Test
- [ ] Migration applied successfully
- [ ] Duration recorded: _____ minutes
- [ ] No errors in logs
- [ ] Application still functional
- [ ] Performance tested (before/after)

### Production Readiness
- [ ] Staging test passed
- [ ] Off-hours window scheduled (if needed)
- [ ] Monitoring dashboards prepared
- [ ] Rollback procedure documented

### Post-Deployment
- [ ] Migration completed successfully
- [ ] Performance metrics captured
- [ ] No errors in application logs
- [ ] 24-hour monitoring plan active
```

---

## Contacts & Resources

**Database Owner:** Data Architect
**Escalation:** DevOps Team
**Emergency Contact:** On-call engineer (PagerDuty)

**Resources:**
- PostgreSQL CONCURRENTLY Docs: https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY
- Drizzle Migration Guide: https://orm.drizzle.team/docs/migrations
- Bible Database Schema: docs/bible/05-TECH/02-database-schema.md

---

*This document should be reviewed and updated after each major migration deployment.*
