# Infrastructure & Deployment

> VoxPoll Deployment Architecture
> NyoWorks Deployment Standards
> Last Updated: 2026-01-29

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    PRODUCTION                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Web (Vercel Edge)          API (AWS ECS)               │
│  ┌─────────────────┐       ┌─────────────────┐         │
│  │ Next.js 16      │       │ Hono + Node 22  │         │
│  │ React 19.1      │───────│ Auto-scaling    │         │
│  │ CDN Cached      │  API  │ Load Balanced   │         │
│  └─────────────────┘       └─────────────────┘         │
│                                     │                    │
│                                     │                    │
│  Database (AWS RDS)        Cache (Redis/Upstash)        │
│  ┌─────────────────┐       ┌─────────────────┐         │
│  │ PostgreSQL 16   │       │ Redis 7.x       │         │
│  │ Multi-AZ        │       │ Cluster Mode    │         │
│  │ Auto Backup     │       │ Persistence     │         │
│  └─────────────────┘       └─────────────────┘         │
│                                                          │
│  Storage (AWS S3)          CDN (CloudFront)             │
│  ┌─────────────────┐       ┌─────────────────┐         │
│  │ User Uploads    │       │ Static Assets   │         │
│  │ Poll Images     │       │ Global Edge     │         │
│  └─────────────────┘       └─────────────────┘         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| **Development** | Local development | http://localhost:3000 |
| **Staging** | Pre-production testing | https://staging.voxpoll.com |
| **Production** | Live users | https://voxpoll.com |

---

## Infrastructure Components

### Web Application (Vercel)

**Service**: Vercel Edge Network
**Framework**: Next.js 16
**Regions**: Global (auto-distributed)

**Features**:
- Automatic HTTPS
- Edge caching
- ISR (Incremental Static Regeneration)
- Analytics
- Preview deployments (per PR)

**Deployment**:
- Automatic on git push to `main`
- Preview deployments on PR branches
- Rollback: Instant via Vercel dashboard

---

### API Backend (AWS ECS)

**Service**: AWS ECS (Elastic Container Service)
**Orchestration**: Fargate (serverless containers)
**Load Balancer**: Application Load Balancer (ALB)

**Configuration**:
- **Min Instances**: 2 (high availability)
- **Max Instances**: 10 (auto-scaling)
- **CPU**: 1 vCPU per container
- **Memory**: 2 GB per container
- **Health Check**: `GET /health`

**Auto-Scaling Triggers**:
- CPU > 70% → scale up
- CPU < 30% → scale down
- Request count > 1000/min → scale up

**Deployment**:
- Blue/Green deployment
- Zero-downtime rolling updates
- Automatic rollback on health check failure

---

### Database (AWS RDS)

**Service**: AWS RDS PostgreSQL 16
**Instance Type**: db.t4g.medium (production)
**Storage**: 100 GB SSD (auto-scaling up to 500 GB)
**Multi-AZ**: Enabled (high availability)

**Backup**:
- Automated daily backups (retained 7 days)
- Point-in-time recovery (5 minutes granularity)
- Manual snapshots (before major migrations)

**Read Replicas**:
- 1 read replica (analytics queries)
- Cross-region replica (disaster recovery - future)

**Monitoring**:
- CloudWatch metrics (CPU, connections, latency)
- Slow query logs
- Performance Insights

---

### Cache (Redis / Upstash)

**Service**: Upstash Redis (managed)
**Plan**: Production tier (persistent)

**Use Cases**:
- Session storage
- Rate limiting counters
- Live poll data
- Queue (BullMQ)
- Cache layer

**Configuration**:
- **Max Memory**: 1 GB
- **Eviction Policy**: allkeys-lru
- **Persistence**: AOF (Append-Only File)
- **Replication**: Multi-zone

---

### File Storage (AWS S3)

**Service**: AWS S3
**Buckets**:
- `voxpoll-uploads-prod` - User uploads (avatars, poll images)
- `voxpoll-exports-prod` - Data exports (GDPR)

**CDN**: CloudFront distribution (edge caching)

**Lifecycle Policies**:
- Exports: Auto-delete after 7 days
- Uploads: Transition to Glacier after 90 days (if inactive)

**Security**:
- Bucket policy: Private (presigned URLs for access)
- Encryption: AES-256 at rest
- Versioning: Enabled

---

### Email (Resend / AWS SES)

**Provider**: Resend (primary), AWS SES (fallback)

**Email Types**:
- Welcome email
- Email verification
- Password reset
- Notification emails
- Weekly digest

**Monitoring**:
- Bounce rate tracking
- Unsubscribe tracking
- Delivery rate monitoring

---

### Monitoring & Logging

**Application Monitoring**: Sentry
- Error tracking
- Performance monitoring
- Release tracking

**Infrastructure Monitoring**: AWS CloudWatch + Grafana
- CPU, memory, network metrics
- Custom application metrics
- Log aggregation

**Uptime Monitoring**: BetterStack
- HTTP endpoint monitoring (every 1 min)
- SSL certificate expiry alerts
- Incident management

**Logging**:
- Application logs: Pino → CloudWatch Logs
- Access logs: ALB → S3
- Audit logs: Database → CloudWatch Logs

---

## CI/CD Pipeline

### GitHub Actions Workflow

**Trigger**: Push to `main`, Pull Request

**Stages**:

1. **Lint & Type Check** (2 min)
   - ESLint
   - TypeScript compilation
   - Prettier check

2. **Unit Tests** (3 min)
   - Vitest unit tests
   - Coverage report (>80% required)

3. **Integration Tests** (5 min)
   - Testcontainers (PostgreSQL + Redis)
   - API integration tests

4. **Build** (4 min)
   - Docker image build
   - Next.js build
   - Push to ECR (Elastic Container Registry)

5. **E2E Tests** (10 min)
   - Playwright on staging environment
   - Multi-browser testing

6. **Deploy** (5 min)
   - ECS task definition update
   - Blue/Green deployment
   - Health check validation

**Total Pipeline**: ~29 minutes

---

## Deployment Process

### Web (Vercel)

**Automatic**:
```bash
git push origin main
# Vercel auto-deploys
```

**Manual Rollback**:
- Via Vercel dashboard → Select previous deployment → "Promote to Production"

---

### API (AWS ECS)

**Deployment Steps**:

1. **Build Docker Image**
```bash
docker build -t voxpoll-api:latest .
docker tag voxpoll-api:latest <ECR_URL>/voxpoll-api:latest
docker push <ECR_URL>/voxpoll-api:latest
```

2. **Update ECS Task Definition**
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

3. **Deploy to ECS Service**
```bash
aws ecs update-service \
  --cluster voxpoll-prod \
  --service voxpoll-api \
  --task-definition voxpoll-api:latest \
  --force-new-deployment
```

**Rollback**:
```bash
# Revert to previous task definition
aws ecs update-service \
  --cluster voxpoll-prod \
  --service voxpoll-api \
  --task-definition voxpoll-api:<previous_version>
```

---

## Database Migrations

**Tool**: Drizzle Kit

**Process**:

1. **Create Migration** (local)
```bash
pnpm db:generate
# Creates migration SQL in drizzle/migrations/
```

2. **Review Migration**
```bash
cat drizzle/migrations/0001_migration_name.sql
```

3. **Run Migration** (staging)
```bash
pnpm db:migrate:staging
```

4. **Verify** (staging)
```bash
# Test API on staging
```

5. **Run Migration** (production)
```bash
pnpm db:migrate:prod
```

**Rollback**:
- Manual SQL script (prepared before migration)
- Restore from snapshot (last resort)

---

## Secrets Management

**Service**: AWS Secrets Manager

**Secrets Stored**:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `STRIPE_SECRET_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `SENTRY_DSN`

**Rotation**:
- JWT secrets: Manual (every 6 months)
- Database password: Automatic (every 90 days)
- API keys: Manual (per provider requirements)

---

## Disaster Recovery

### Backup Strategy

**Database**:
- Automated daily snapshots (7-day retention)
- Manual snapshots before major changes
- Cross-region replica (future)

**File Storage**:
- S3 versioning enabled
- Cross-region replication (future)

**Recovery Time Objective (RTO)**: 1 hour
**Recovery Point Objective (RPO)**: 5 minutes

### Incident Response

1. **Detection**: Automated alerts (Sentry, BetterStack)
2. **Assessment**: Check health dashboards
3. **Mitigation**: Rollback or hotfix
4. **Communication**: Status page update
5. **Post-Mortem**: Incident report + improvements

---

## Scaling Strategy

### Horizontal Scaling

**API**:
- Auto-scaling ECS tasks (2-10 instances)
- Stateless design (no sticky sessions)

**Database**:
- Read replicas for read-heavy queries
- Connection pooling (Drizzle + postgres.js)

**Cache**:
- Redis cluster mode (sharding)

### Vertical Scaling

**Database**:
- Scale up instance type (db.t4g.medium → db.r6g.large)
- Minimal downtime (Multi-AZ failover)

---

## Cost Optimization

**Monthly Estimates (Production)**:

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (Web) | $20/mo | Pro plan |
| AWS ECS (API) | $50/mo | 2 Fargate tasks |
| AWS RDS (DB) | $100/mo | db.t4g.medium Multi-AZ |
| Upstash (Redis) | $30/mo | Production tier |
| AWS S3 + CloudFront | $20/mo | Storage + bandwidth |
| Resend (Email) | $20/mo | 50k emails/mo |
| Sentry | $26/mo | Team plan |
| **Total** | **~$266/mo** | |

**Cost Optimization Tactics**:
- Reserved instances for predictable workloads
- S3 lifecycle policies (archive old data)
- CloudFront caching (reduce origin requests)
- Right-sizing instances (monitor utilization)

---

## Security

### Network Security
- VPC with private subnets (database, cache)
- Security groups (least privilege)
- NAT Gateway for outbound traffic
- WAF rules (rate limiting, SQL injection protection)

### Application Security
- HTTPS only (TLS 1.3)
- Secure headers (Helmet.js)
- CSP (Content Security Policy)
- CORS configuration

### Compliance
- GDPR compliant (data export, deletion)
- KVKK compliant (Turkey)
- SOC 2 Type II (future goal)

---

## Environment Variables

### Production

```env
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=voxpoll-uploads-prod

# Stripe
STRIPE_SECRET_KEY=sk_live_...

# Monitoring
SENTRY_DSN=...

# Email
RESEND_API_KEY=...
```

---

## Related Documentation

- **API Contract**: [05-api/01-api-contract.md](c:\Users\PC\Documents\naim\projects\voxpoll\docs\bible\05-api\01-api-contract.md)
- **Security**: [09-security/01-rbac-matrix.md](c:\Users\PC\Documents\naim\projects\voxpoll\docs\bible\09-security\01-rbac-matrix.md)

---

*NyoWorks Deployment Documentation - Infrastructure v1*
