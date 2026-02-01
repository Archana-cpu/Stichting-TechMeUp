# CI/CD Pipeline

> **NyoWorks Standard File** | Continuous Integration & Deployment

Automated build, test, and deployment workflows.

---

## CI/CD Overview

VoxPoll uses **GitHub Actions** for CI/CD automation.

```
Push to branch
    ↓
Lint & Type Check
    ↓
Unit Tests
    ↓
Build
    ↓
Integration Tests
    ↓
Deploy to Staging (if main branch)
    ↓ (manual approval)
Deploy to Production
```

---

## GitHub Actions Workflows

### 1. CI Workflow (.github/workflows/ci.yml)

Runs on every push and pull request.

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit
      - run: pnpm test:integration
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            apps/api/dist
            apps/web/.next
```

### 2. Deploy Staging (.github/workflows/deploy-staging.yml)

Auto-deploys to staging on push to `main`.

```yaml
name: Deploy Staging

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build --filter=api

      # Deploy to Railway
      - uses: railwayapp/railway-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
          service: voxpoll-api-staging
          environment: staging

  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile

      # Deploy to Vercel
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: apps/web

  smoke-tests:
    runs-on: ubuntu-latest
    needs: [deploy-api, deploy-web]
    steps:
      - uses: actions/checkout@v4
      - run: pnpm test:e2e:staging
```

### 3. Deploy Production (.github/workflows/deploy-production.yml)

Manual approval required for production deployment.

```yaml
name: Deploy Production

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy'
        required: true

jobs:
  approval:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://voxpoll.com
    steps:
      - name: Wait for approval
        run: echo "Deployment to production requires manual approval"

  backup-database:
    runs-on: ubuntu-latest
    needs: approval
    steps:
      - name: Create database snapshot
        run: |
          aws rds create-db-snapshot \
            --db-instance-identifier voxpoll-prod \
            --db-snapshot-identifier pre-deploy-$(date +%Y%m%d-%H%M%S)

  deploy-api:
    runs-on: ubuntu-latest
    needs: backup-database
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build --filter=api

      # Deploy to AWS ECS
      - uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ecs-task-definition.json
          service: voxpoll-api-prod
          cluster: voxpoll-prod
          wait-for-service-stability: true

  deploy-web:
    runs-on: ubuntu-latest
    needs: deploy-api
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile

      # Deploy to Vercel
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_PROD }}
          vercel-args: '--prod'
          working-directory: apps/web
          alias-domains: voxpoll.com,www.voxpoll.com

  run-migrations:
    runs-on: ubuntu-latest
    needs: deploy-api
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_PROD }}

  smoke-tests:
    runs-on: ubuntu-latest
    needs: [deploy-web, run-migrations]
    steps:
      - uses: actions/checkout@v4
      - run: pnpm test:e2e:production

  notify:
    runs-on: ubuntu-latest
    needs: smoke-tests
    steps:
      - name: Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed ✅'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Branch Strategy

### Git Flow

```
main (production)
    ↑
    └─ release/v1.0.0
         ↑
         └─ develop (staging)
              ↑
              ├─ feature/user-auth
              ├─ feature/live-polls
              └─ fix/login-bug
```

### Branch Protections

**main branch:**
- ✅ Require pull request reviews (2 approvals)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require signed commits
- ❌ Allow force pushes
- ❌ Allow deletions

**develop branch:**
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ❌ Allow force pushes
- ❌ Allow deletions

---

## Deployment Process

### Staging Deployment
1. Merge feature branch to `develop`
2. CI pipeline runs automatically
3. If all checks pass, auto-deploy to staging
4. Smoke tests run on staging
5. QA team validates

### Production Deployment
1. Create release branch from `develop`
2. Run final QA on release branch
3. Merge release branch to `main` via PR
4. Create GitHub release with version tag
5. Trigger production deployment workflow (manual)
6. Wait for approval (2 team members)
7. Database backup created automatically
8. Deploy API to AWS ECS
9. Run database migrations
10. Deploy web to Vercel
11. Smoke tests run on production
12. Slack notification sent

---

## Rollback Strategy

### API Rollback (AWS ECS)
```bash
# Revert to previous task definition
aws ecs update-service \
  --cluster voxpoll-prod \
  --service voxpoll-api-prod \
  --task-definition voxpoll-api:previous

# Monitor rollback
aws ecs wait services-stable \
  --cluster voxpoll-prod \
  --services voxpoll-api-prod
```

### Web Rollback (Vercel)
```bash
# Via Vercel dashboard: Deployments → Previous → Promote to Production
# Or via CLI:
vercel rollback https://voxpoll.com
```

### Database Rollback
```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier voxpoll-prod-restored \
  --db-snapshot-identifier pre-deploy-YYYYMMDD-HHMMSS

# Point application to restored instance
# (requires DNS update and application restart)
```

---

## Quality Gates

### Required Checks Before Deployment

| Check | Staging | Production |
|-------|---------|------------|
| Linting | ✅ | ✅ |
| Type checking | ✅ | ✅ |
| Unit tests (>80% coverage) | ✅ | ✅ |
| Integration tests | ✅ | ✅ |
| E2E tests | ✅ | ✅ |
| Build succeeds | ✅ | ✅ |
| Security scan | ✅ | ✅ |
| Performance tests | ⚠️ | ✅ |
| Manual QA | ⚠️ | ✅ |
| Approvals | - | ✅ (2x) |

---

## Secrets Management

GitHub Actions secrets:
- `RAILWAY_TOKEN` - Railway deployment
- `VERCEL_TOKEN` - Vercel deployment
- `VERCEL_ORG_ID` - Vercel organization
- `VERCEL_PROJECT_ID` - Staging project
- `VERCEL_PROJECT_ID_PROD` - Production project
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials
- `DATABASE_URL_PROD` - Production database
- `SLACK_WEBHOOK` - Deployment notifications
- `CODECOV_TOKEN` - Code coverage reporting

---

## Performance Testing

### Load Testing (Production Only)

Uses [k6](https://k6.io/) for load testing:

```javascript
import http from 'k6/http'
import { check } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Steady state
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% < 500ms
    http_req_failed: ['rate<0.05'],   // Error rate < 5%
  },
}

export default function () {
  const res = http.get('https://api.voxpoll.com/api/polls/trending')
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
}
```

Run before production deployment:
```bash
k6 run --out cloud loadtest.js
```

---

## Monitoring After Deployment

### Health Checks
- API health endpoint: `GET /api/health`
- Expected response time: <100ms
- Check frequency: Every 30 seconds

### Deployment Metrics
- API deployment duration: ~5 minutes
- Web deployment duration: ~2 minutes
- Database migration duration: <30 seconds
- Total deployment window: ~10 minutes

### Alerts
- Error rate spike (>5% in 5 minutes) → PagerDuty
- Response time P95 > 500ms → Slack
- Deployment failure → PagerDuty + Slack

---

## Deployment Schedule

- **Staging**: Continuous deployment (every push to main)
- **Production**: Scheduled releases
  - Major releases: Monthly (first Tuesday)
  - Minor releases: Bi-weekly (Tuesdays, Thursdays)
  - Hotfixes: As needed (any time)

**Deployment Windows:**
- Preferred: Tuesday/Thursday 10:00-16:00 UTC
- Avoided: Friday afternoons, weekends, holidays
- Hotfixes: Any time (with approval)

---

## Changelog Generation

Automatic changelog generation from conventional commits:

```bash
# Generate changelog
pnpm changelog

# Commit types:
# feat: New feature
# fix: Bug fix
# docs: Documentation
# refactor: Code refactoring
# test: Tests
# chore: Build/CI changes
```

Example commit:
```
feat(polls): add pre-test capability

Implements P-007 and P-030 from Bible.
Allows poll creators to test audience targeting before full deployment.

Closes #123
```

---

*For environment details, see [02-environments.md](./02-environments.md)*
*For infrastructure, see [01-infrastructure.md](./01-infrastructure.md)*
