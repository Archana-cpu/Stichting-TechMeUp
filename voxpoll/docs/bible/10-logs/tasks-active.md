# Active Tasks

> NyoWorks Task Management System
> Last Updated: 2026-01-29

---

## TASK-005: Bible Flow Test Coverage (Wave 1: P0 + P1)

```yaml
---
id: TASK-005
title: Bible Flow Test Coverage (Wave 1 - P0 + P1)
priority: P0
status: IN_PROGRESS
claimed_by: Claude TESTER 1 (Senior SaaS Tester)
claimed_at: 2026-01-27 22:22
dependencies: []
estimated_effort: large
tags: [testing, bible-compliance, security, core-features]
bible_refs: [P-057, P-058, P-059, T-009]
expected_completion: 2026-01-28 23:59
---
```

### Description

Comprehensive test coverage for VoxPoll Bible compliance, focusing on critical security and core feature flows.

**Scope:**
- P0 Security: 8 test suites (~180 test cases)
- P1 Core Features: 12 test suites (~250 test cases)
- Target: 100% Bible compliance verification

### Acceptance Criteria

- [ ] All P0 security test suites implemented (8/8)
- [ ] All P1 core feature test suites implemented (12/12)
- [ ] Test coverage for P-057 (Device Fingerprinting)
- [ ] Test coverage for P-058 (Rate Limiting)
- [ ] Test coverage for P-059 (Error Sanitization)
- [ ] Test coverage for T-009 (Reliability Scoring)
- [ ] All tests passing
- [ ] Code coverage >80%
- [ ] Test execution documented in TEST_MASTER_PLAN.md

### Files Affected

- `docs/bible/99-TRACKING/TEST_MASTER_PLAN.md` (created - test strategy)
- `packages/api/src/test/*.test.ts` (20 new test suites planned)
- `docs/bible/99-TRACKING/GAPS.md` (will update as gaps found)
- `docs/bible/99-TRACKING/AUDIT_CHANGELOG.md` (will update per test suite)

### Progress Log

- **2026-01-27 22:22**: Task claimed by Claude TESTER 1
- **2026-01-27 22:30**: TEST_MASTER_PLAN.md created with comprehensive test strategy
- **Status**: Test suite implementation in progress

### Technical Notes

**P0 Security Test Suites (8):**
1. Authentication flow tests
2. Authorization/RBAC tests
3. Rate limiting tests (P-058)
4. Device fingerprinting tests (P-057)
5. Error sanitization tests (P-059)
6. Fraud detection tests
7. OTP verification tests
8. Session management tests

**P1 Core Feature Test Suites (12):**
1. Poll creation tests
2. Poll voting tests
3. Poll results tests
4. Survey creation tests
5. Pre-test flow tests
6. Live poll tests
7. Reliability scoring tests (T-009)
8. User profile tests
9. Notification tests
10. Analytics tests
11. Payment/subscription tests
12. Admin dashboard tests

---

## TASK-006: Database Index Optimization & Performance Audit

```yaml
---
id: TASK-006
title: Database Index Optimization & Performance Audit
priority: P2
status: IN_PROGRESS
claimed_by: Data Architect
claimed_at: 2026-01-29 15:30:00 UTC
dependencies: []
estimated_effort: medium
tags: [schema, performance, indexing, optimization]
bible_refs: [05-TECH/02-database-schema.md, INDEXING_STRATEGY]
expected_completion: 2026-01-29 19:00:00 UTC
---
```

### Description

Comprehensive database index audit and optimization based on Bible INDEXING STRATEGY section. Verify composite indexes, add partial indexes for soft-delete optimization, and benchmark query performance.

**Scope:**
- Verify all Bible-specified composite indexes exist
- Add partial indexes for soft-delete queries (WHERE deletedAt IS NULL)
- Analyze query patterns and missing indexes
- Create migration for index additions
- Document index strategy in Bible

### Acceptance Criteria

- [ ] Composite indexes verified against Bible spec
- [ ] Partial indexes added for polls, surveys, tests, comments (deletedAt)
- [ ] Index coverage report generated
- [ ] Migration script created (0003_add_performance_indexes.sql)
- [ ] Query performance benchmarks documented
- [ ] Bible 05-TECH/02-database-schema.md updated with new indexes

### Files Affected

- `packages/database/drizzle/migrations/0003_add_performance_indexes.sql` (new)
- `packages/database/src/db/schema/*.ts` (index definitions)
- `docs/bible/05-TECH/02-database-schema.md` (documentation update)
- `docs/bible/11-audit/data-architect-2026-01-29.md` (audit log)

### Progress Log

- **2026-01-29 15:30:00 UTC**: Task created and claimed by Data Architect
- **Status**: Starting index audit

### Technical Notes

**Bible-Specified Composite Indexes (to verify):**
1. `idx_polls_feed` (status, visibility, published_at DESC)
2. `idx_polls_user` (creator_id, created_at DESC) WHERE deletedAt IS NULL
3. `idx_surveys_org` (organization_id, status, created_at DESC) WHERE deletedAt IS NULL

**Partial Indexes (to add):**
- polls: WHERE deletedAt IS NULL (feed queries)
- surveys: WHERE deletedAt IS NULL (org queries)
- tests: WHERE deletedAt IS NULL (public listing)
- comments: WHERE deletedAt IS NULL AND isDeleted = false (thread queries)

**Performance Targets:**
- Feed query: <50ms (Bible: <200ms)
- Content listing: <100ms
- Search queries: <200ms

---

## Task Statistics

- **Total Active**: 2
- **P0 Priority**: 1
- **P1 Priority**: 0
- **P2 Priority**: 1
- **P3 Priority**: 0

---

## Legend

**Priority Levels:**
- **P0**: Critical (security, data integrity, blocker bugs)
- **P1**: High (core features, important bugs)
- **P2**: Medium (enhancements, minor bugs)
- **P3**: Low (nice-to-have, optimizations)

**Status Lifecycle:**
- **AVAILABLE**: Ready for claim
- **IN_PROGRESS**: Actively being worked on
- **BLOCKED**: Waiting on dependency or decision
- **REVIEW**: Pending code review or testing
- **DONE**: Completed (move to tasks-completed.md)

**Estimated Effort:**
- **small**: <2 hours
- **medium**: 2-8 hours
- **large**: >8 hours

---

*Migrated from AGENT_COORDINATION.md on 2026-01-29 by NyoWorks PM*
