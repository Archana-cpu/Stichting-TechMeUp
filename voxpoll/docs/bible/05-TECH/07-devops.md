# DevOps & Deployment
> Source: bible-002.md

---

# ══════════════════════════════════════════════════════════════════════════════
# DEPLOYMENT ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      PRODUCTION INFRASTRUCTURE (Docker + AWS)                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                           ┌─────────────────┐                                  │
│                           │    INTERNET     │                                  │
│                           └────────┬────────┘                                  │
│                                    │                                           │
│                           ┌────────┴────────┐                                  │
│                           │   CloudFlare    │                                  │
│                           │   CDN + WAF     │                                  │
│                           │   DDoS Protect  │                                  │
│                           └────────┬────────┘                                  │
│                                    │                                           │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐    │
│  │                         AWS INFRASTRUCTURE                             │    │
│  │                                                                        │    │
│  │    ┌───────────────────────────────────────────────────────────┐     │    │
│  │    │                    AWS ECS / Fargate                       │     │    │
│  │    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │     │    │
│  │    │  │  Next.js    │  │   Hono      │  │   BullMQ    │       │     │    │
│  │    │  │  Web App    │  │   API       │  │   Workers   │       │     │    │
│  │    │  │  (Docker)   │  │  (Docker)   │  │  (Docker)   │       │     │    │
│  │    │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │     │    │
│  │    └─────────┼────────────────┼────────────────┼───────────────┘     │    │
│  │              │                │                │                      │    │
│  │              └────────────────┼────────────────┘                      │    │
│  │                               │                                       │    │
│  │         ┌─────────────────────┼─────────────────────┐                │    │
│  │         │                     │                     │                │    │
│  │         ▼                     ▼                     ▼                │    │
│  │  ┌───────────┐         ┌───────────┐         ┌───────────┐          │    │
│  │  │   AWS     │         │   AWS     │         │   AWS     │          │    │
│  │  │ElastiCache│         │   RDS     │         │    S3     │          │    │
│  │  │  (Redis)  │         │PostgreSQL │         │  Storage  │          │    │
│  │  └───────────┘         └───────────┘         └───────────┘          │    │
│  │                                                                        │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# DOCKER CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

## API Dockerfile

```dockerfile
# ═══════════════════════════════════════════════════════════════════════════
# API DOCKERFILE
# ═══════════════════════════════════════════════════════════════════════════

FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN pnpm fetch

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm install --offline
RUN pnpm turbo build --filter=@voxpoll/api...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api
USER api

COPY --from=builder --chown=api:nodejs /app/packages/api/dist ./dist
COPY --from=builder --chown=api:nodejs /app/packages/api/package.json ./

EXPOSE 3001
CMD ["node", "dist/server.js"]
```

## Docker Compose (Local Development)

```yaml
# ═══════════════════════════════════════════════════════════════════════════
# DOCKER COMPOSE - LOCAL DEVELOPMENT
# ═══════════════════════════════════════════════════════════════════════════

version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: voxpoll
      POSTGRES_PASSWORD: voxpoll
      POSTGRES_DB: voxpoll
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U voxpoll"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  meilisearch:
    image: getmeili/meilisearch:v1.6
    environment:
      MEILI_MASTER_KEY: ${MEILISEARCH_API_KEY:-development_key}
    volumes:
      - meilisearch_data:/meili_data
    ports:
      - "7700:7700"
    profiles:
      - search

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:
```

---

# ══════════════════════════════════════════════════════════════════════════════
# CI/CD PIPELINES
# ══════════════════════════════════════════════════════════════════════════════

## GitHub Actions - CI Pipeline

```yaml
# ═══════════════════════════════════════════════════════════════════════════
# .github/workflows/ci.yml
# ═══════════════════════════════════════════════════════════════════════════

name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: voxpoll_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/voxpoll_test
          REDIS_URL: redis://localhost:6379

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

## GitHub Actions - Deploy Pipeline

```yaml
# ═══════════════════════════════════════════════════════════════════════════
# .github/workflows/deploy.yml
# ═══════════════════════════════════════════════════════════════════════════

name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/voxpoll-api:$IMAGE_TAG -f docker/api.Dockerfile .
          docker push $ECR_REGISTRY/voxpoll-api:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster voxpoll-production \
            --service voxpoll-api \
            --force-new-deployment

  deploy-web:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo build --filter=@voxpoll/web

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

# ══════════════════════════════════════════════════════════════════════════════
# DATABASE MIGRATIONS
# ══════════════════════════════════════════════════════════════════════════════

## Migration Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE MIGRATION STRATEGY                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Development:                                                                   │
│  ─────────────────────────────────────────────────────────────────────────      │
│  1. pnpm db:generate    Generate migration from schema changes                 │
│  2. pnpm db:migrate     Apply migrations to local database                     │
│  3. pnpm db:studio      Open Drizzle Studio for inspection                     │
│                                                                                 │
│  Production:                                                                    │
│  ─────────────────────────────────────────────────────────────────────────      │
│  1. Migrations run automatically on deployment                                 │
│  2. Use separate migration task in ECS                                         │
│  3. Wait for migration success before deploying new code                       │
│  4. Keep migrations backward-compatible                                        │
│                                                                                 │
│  Rollback Strategy:                                                            │
│  ─────────────────────────────────────────────────────────────────────────      │
│  - Each migration has a corresponding down migration                           │
│  - Test rollbacks in staging before production                                 │
│  - Keep previous version deployable for quick rollback                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Drizzle Migration Commands

```bash
# Generate migration from schema changes
pnpm --filter @voxpoll/database db:generate

# Apply pending migrations
pnpm --filter @voxpoll/database db:migrate

# Push schema directly (dev only)
pnpm --filter @voxpoll/database db:push

# Open Drizzle Studio
pnpm --filter @voxpoll/database db:studio
```

---

# ══════════════════════════════════════════════════════════════════════════════
# MONITORING & ALERTING
# ══════════════════════════════════════════════════════════════════════════════

## Health Check Endpoints

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

const healthRoutes = new Hono()

healthRoutes.get("/health", (c) => c.json({ status: "ok" }))

healthRoutes.get("/health/live", (c) => c.json({ status: "ok" }))

healthRoutes.get("/health/ready", async (c) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkRedis()
  ])

  const allHealthy = checks.every(c => c.healthy)

  return c.json(
    { status: allHealthy ? "ok" : "unhealthy", checks },
    allHealthy ? 200 : 503
  )
})

healthRoutes.get("/health/deep", async (c) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    s3: await checkS3(),
    stripe: await checkStripe()
  }

  const allHealthy = Object.values(checks).every(c => c.healthy)

  return c.json(
    { status: allHealthy ? "ok" : "degraded", checks },
    allHealthy ? 200 : 503
  )
})
```

## Alerting Rules

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Error rate | > 1% | > 5% | PagerDuty |
| P95 latency | > 500ms | > 1s | Slack |
| CPU usage | > 70% | > 90% | Auto-scale |
| Memory usage | > 80% | > 95% | Auto-scale |
| Disk usage | > 70% | > 85% | Alert |
| Database connections | > 80% pool | > 95% pool | Alert |

## Sentry Configuration

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// SENTRY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.GIT_SHA,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Postgres()
  ],
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers.authorization
      delete event.request.headers.cookie
    }
    return event
  }
})
```

---

# ══════════════════════════════════════════════════════════════════════════════
# SCALING CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

## ECS Auto Scaling

```json
{
  "scalingPolicies": {
    "cpuTargetTracking": {
      "targetValue": 70,
      "scaleInCooldown": 300,
      "scaleOutCooldown": 60
    },
    "memoryTargetTracking": {
      "targetValue": 80,
      "scaleInCooldown": 300,
      "scaleOutCooldown": 60
    },
    "requestCountTargetTracking": {
      "targetValue": 1000,
      "scaleInCooldown": 300,
      "scaleOutCooldown": 60
    }
  },
  "capacity": {
    "min": 2,
    "max": 20,
    "desired": 2
  }
}
```

## Database Scaling

| Phase | Instance | Read Replicas | Connection Pool |
|-------|----------|---------------|-----------------|
| Launch | db.t3.micro | 0 | 10 |
| Growth | db.t3.medium | 1 | 20 |
| Scale | db.r6g.large | 2 | 50 |
| Enterprise | db.r6g.xlarge | 4+ | 100 |

---

# ══════════════════════════════════════════════════════════════════════════════
# BACKUP & DISASTER RECOVERY
# ══════════════════════════════════════════════════════════════════════════════

## Backup Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BACKUP STRATEGY                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Database (RDS):                                                               │
│  ─────────────────────────────────────────────────────────────────────────      │
│  - Automated daily snapshots (35-day retention)                                │
│  - Point-in-time recovery (5-minute granularity)                               │
│  - Cross-region replication for DR                                             │
│                                                                                 │
│  Redis (ElastiCache):                                                          │
│  ─────────────────────────────────────────────────────────────────────────      │
│  - Daily snapshots (7-day retention)                                           │
│  - Multi-AZ replication                                                        │
│                                                                                 │
│  S3:                                                                           │
│  ─────────────────────────────────────────────────────────────────────────      │
│  - Versioning enabled                                                          │
│  - Cross-region replication                                                    │
│  - Lifecycle policies (Glacier after 90 days)                                  │
│                                                                                 │
│  Recovery Time Objectives:                                                     │
│  ─────────────────────────────────────────────────────────────────────────      │
│  - RTO (Recovery Time Objective): < 4 hours                                    │
│  - RPO (Recovery Point Objective): < 5 minutes                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Disaster Recovery Runbook

| Scenario | Action | RTO |
|----------|--------|-----|
| Single AZ failure | Automatic failover | < 5 min |
| Database corruption | Point-in-time restore | < 30 min |
| Region failure | Cross-region failover | < 4 hours |
| Data breach | Rotate all credentials | < 1 hour |

---

# ══════════════════════════════════════════════════════════════════════════════
# SECURITY HARDENING
# ══════════════════════════════════════════════════════════════════════════════

## Network Security

- VPC with private subnets for databases
- Security groups with minimal required ports
- WAF rules on CloudFlare
- DDoS protection via CloudFlare

## Secrets Management

- AWS Secrets Manager for all credentials
- Automatic rotation for database passwords
- No secrets in code or environment variables in CI logs

## Compliance Checklist

- [ ] GDPR data handling
- [ ] KVKK compliance (Turkey)
- [ ] Regular security audits
- [ ] Penetration testing (quarterly)
- [ ] SOC 2 Type II (planned)

---

*Source: bible-002.md*
