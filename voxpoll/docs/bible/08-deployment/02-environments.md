# Environments

> **NyoWorks Standard File** | VoxPoll Deployment Environments

Environment configuration for development, staging, and production.

---

## Environment Overview

VoxPoll uses 3 environments:

| Environment | Purpose | URL | Database |
|-------------|---------|-----|----------|
| **Development** | Local development | `http://localhost:3000` | Local PostgreSQL |
| **Staging** | Pre-production testing | `https://staging.voxpoll.com` | AWS RDS (staging) |
| **Production** | Live system | `https://voxpoll.com` | AWS RDS (production) |

---

## Development Environment

### Local Setup

**Requirements:**
- Node.js 22+
- pnpm 9.x
- Docker (for PostgreSQL, Redis)
- PostgreSQL 16+
- Redis 7+

**Setup Steps:**
```bash
# Clone repository
git clone https://github.com/voxpoll/voxpoll.git
cd voxpoll

# Install dependencies
pnpm install

# Start Docker services
docker-compose -f docker-compose.dev.yml up -d

# Setup database
pnpm db:push
pnpm db:seed

# Start development servers
pnpm dev
```

**Services:**
- API: `http://localhost:3001`
- Web: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### Environment Variables (.env.local)

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voxpoll_dev
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=dev-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret

# AWS S3 (local MinIO)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_BUCKET=voxpoll-dev
AWS_S3_REGION=us-east-1
AWS_S3_ENDPOINT=http://localhost:9000

# Email (development)
EMAIL_PROVIDER=console
EMAIL_FROM=noreply@voxpoll.local

# Feature Flags
FEATURE_LIVE_POLLS=true
FEATURE_GAMIFICATION=true
FEATURE_SOCIAL=true

# Logging
LOG_LEVEL=debug
```

---

## Staging Environment

### Purpose
- Pre-production testing
- QA validation
- Integration testing
- Performance testing
- Client demos

### Deployment
- **Platform**: Vercel (frontend), Railway (API)
- **Database**: AWS RDS (t3.medium)
- **Redis**: Upstash
- **CDN**: Vercel Edge
- **Domain**: `staging.voxpoll.com`

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@staging-db.amazonaws.com:5432/voxpoll_staging
REDIS_URL=redis://:pass@staging-redis.upstash.io:6379

# Auth
JWT_SECRET=<staging-secret-from-secrets-manager>
JWT_REFRESH_SECRET=<staging-refresh-secret>

# AWS S3
AWS_ACCESS_KEY_ID=<staging-access-key>
AWS_SECRET_ACCESS_KEY=<staging-secret-key>
AWS_S3_BUCKET=voxpoll-staging
AWS_S3_REGION=eu-west-1
AWS_CLOUDFRONT_URL=https://cdn-staging.voxpoll.com

# Email
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@staging.voxpoll.com
RESEND_API_KEY=<staging-resend-key>

# Payments (Stripe test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
SENTRY_DSN=<staging-sentry-dsn>
SENTRY_ENVIRONMENT=staging

# Feature Flags
FEATURE_LIVE_POLLS=true
FEATURE_GAMIFICATION=true
FEATURE_SOCIAL=true

# Logging
LOG_LEVEL=info
```

### Access
- **Frontend**: `https://staging.voxpoll.com`
- **API**: `https://api-staging.voxpoll.com`
- **API Docs**: `https://api-staging.voxpoll.com/docs`
- **Admin**: `https://staging.voxpoll.com/admin`

### Database
- **Instance**: AWS RDS t3.medium
- **Storage**: 100 GB
- **Backups**: Daily
- **Multi-AZ**: No
- **Public access**: No (VPC only)

### Monitoring
- **Uptime**: BetterStack
- **Errors**: Sentry (staging project)
- **Logs**: CloudWatch Logs
- **Metrics**: Vercel Analytics

---

## Production Environment

### Purpose
- Live system serving real users
- High availability
- Data durability
- Security hardening

### Deployment
- **Platform**: Vercel (frontend), AWS ECS Fargate (API)
- **Database**: AWS RDS (r6g.xlarge, Multi-AZ)
- **Redis**: AWS ElastiCache (Multi-AZ)
- **CDN**: CloudFront
- **Domain**: `voxpoll.com`

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@prod-db.amazonaws.com:5432/voxpoll_prod
DATABASE_REPLICA_URL=postgresql://user:pass@prod-db-replica.amazonaws.com:5432/voxpoll_prod
REDIS_URL=redis://:pass@prod-redis.cache.amazonaws.com:6379

# Auth
JWT_SECRET=<prod-secret-from-secrets-manager>
JWT_REFRESH_SECRET=<prod-refresh-secret>

# AWS S3
AWS_ACCESS_KEY_ID=<prod-access-key>
AWS_SECRET_ACCESS_KEY=<prod-secret-key>
AWS_S3_BUCKET=voxpoll-prod
AWS_S3_REGION=eu-west-1
AWS_CLOUDFRONT_URL=https://cdn.voxpoll.com

# Email
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@voxpoll.com
RESEND_API_KEY=<prod-resend-key>

# Payments (Stripe live mode)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
SENTRY_DSN=<prod-sentry-dsn>
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# Feature Flags
FEATURE_LIVE_POLLS=true
FEATURE_GAMIFICATION=true
FEATURE_SOCIAL=true

# Logging
LOG_LEVEL=warn

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000

# Security
ALLOWED_ORIGINS=https://voxpoll.com,https://www.voxpoll.com
CORS_ENABLED=true
HELMET_ENABLED=true
```

### Access
- **Frontend**: `https://voxpoll.com`
- **API**: `https://api.voxpoll.com`
- **API Docs**: `https://api.voxpoll.com/docs`
- **Admin**: `https://voxpoll.com/admin` (IP-restricted)

### Infrastructure
- **API**: AWS ECS Fargate (2 vCPU, 4 GB RAM) - Auto-scaling 2-10 tasks
- **Database**: AWS RDS r6g.xlarge (4 vCPU, 32 GB RAM) - Multi-AZ with read replica
- **Redis**: AWS ElastiCache r6g.large (2 vCPU, 13 GB RAM) - Multi-AZ
- **Storage**: AWS S3 Standard-IA with CloudFront
- **Load Balancer**: Application Load Balancer (ALB)

### High Availability
- **API**: Multi-AZ deployment, auto-scaling
- **Database**: Multi-AZ primary, cross-region read replica
- **Redis**: Multi-AZ with automatic failover
- **CDN**: CloudFront with 90+ edge locations

### Backup Strategy
- **Database**: Automated daily backups (retained 30 days), manual snapshots before deployments
- **S3**: Versioning enabled, cross-region replication
- **Point-in-time recovery**: Enabled (5-minute granularity)

### Disaster Recovery
- **RTO (Recovery Time Objective)**: 1 hour
- **RPO (Recovery Point Objective)**: 5 minutes
- **DR Region**: us-east-1 (primary: eu-west-1)

### Monitoring & Alerts
- **Uptime**: BetterStack (1-minute checks)
- **Errors**: Sentry (error rate alerts)
- **Logs**: CloudWatch Logs (retention: 30 days)
- **Metrics**: CloudWatch Metrics + Grafana
- **APM**: OpenTelemetry + Jaeger
- **Alerts**: PagerDuty integration

**Alert Thresholds:**
- API error rate > 5%
- Response time P95 > 500ms
- Database CPU > 80%
- Redis memory > 90%
- Disk usage > 85%

---

## Environment Parity

Staging and production environments maintain parity:
- ✅ Same database schema
- ✅ Same infrastructure setup
- ✅ Same environment variables (different values)
- ✅ Same monitoring tools
- ✅ Same feature flags

**Differences:**
- ❌ Staging uses smaller instance sizes
- ❌ Staging uses test payment gateway
- ❌ Staging has lower rate limits
- ❌ Staging allows test accounts

---

## Secrets Management

**Development**: `.env.local` (not committed)
**Staging/Production**: AWS Secrets Manager

**Secret Rotation:**
- JWT secrets: Every 90 days
- Database passwords: Every 180 days
- API keys: Every 365 days or on compromise

---

## Environment Promotion

Code promotion flow:
```
feature branch
    ↓ (PR merge)
main branch
    ↓ (auto-deploy)
Staging
    ↓ (manual approval)
Production
```

See [03-ci-cd.md](./03-ci-cd.md) for deployment pipeline details.

---

*For infrastructure details, see [01-infrastructure.md](./01-infrastructure.md)*
