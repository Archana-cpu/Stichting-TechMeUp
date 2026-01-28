# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                         VOXPOLL PROJECT BIBLE                              █
# █                    025: DevOps & Infrastructure                            █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████

**Version:** 1.0.0
**Last Updated:** January 22, 2026
**Status:** COMPLETE
**Owner:** Platform Team



# ══════════════════════════════════════════════════════════════════════════════
# TABLE OF CONTENTS
# ══════════════════════════════════════════════════════════════════════════════

# PART I: CONTAINERIZATION (Docker)
# 25.1 Docker Strategy
# 25.2 Dockerfile Specifications
# 25.3 Docker Compose (Local Development)

# PART II: CI/CD (GitHub Actions)
# 25.4 Pipeline Architecture
# 25.5 CI Workflows
# 25.6 CD Workflows

# PART III: AWS INFRASTRUCTURE
# 25.7 Architecture Overview
# 25.8 Compute (ECS/Fargate)
# 25.9 Database (RDS + ElastiCache)
# 25.10 Storage & CDN (S3 + CloudFront)
# 25.11 Networking (VPC + ALB + Route53)
# 25.12 Security (IAM + Secrets Manager)

# PART IV: OPERATIONS
# 25.13 Monitoring & Alerting (CloudWatch)
# 25.14 Logging & Tracing
# 25.15 Disaster Recovery & Backup



# ══════════════════════════════════════════════════════════════════════════════
# PART I: CONTAINERIZATION (Docker)
# ══════════════════════════════════════════════════════════════════════════════

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.1 DOCKER STRATEGY                                                        │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.1.1 Container Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VOXPOLL CONTAINER ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   voxpoll-web   │  │  voxpoll-api    │  │ voxpoll-worker  │             │
│  │   (Next.js)     │  │  (Next.js API)  │  │ (Background)    │             │
│  │   Port: 3000    │  │  Port: 3001     │  │ No port         │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│           └────────────────────┼────────────────────┘                       │
│                                │                                            │
│                    ┌───────────▼───────────┐                                │
│                    │    Shared Services    │                                │
│                    │  PostgreSQL | Redis   │                                │
│                    └───────────────────────┘                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 25.1.2 Image Naming Convention

```typescript
const DOCKER_IMAGE_CONFIG = {
  registry: "ghcr.io",  // GitHub Container Registry
  namespace: "voxpoll",

  images: {
    web: "ghcr.io/voxpoll/web",
    api: "ghcr.io/voxpoll/api",
    worker: "ghcr.io/voxpoll/worker",
    migrator: "ghcr.io/voxpoll/migrator"
  },

  // Tag strategy
  tags: {
    // Production: semantic version
    production: "v{major}.{minor}.{patch}",  // v1.2.3

    // Staging: commit SHA
    staging: "sha-{short_sha}",  // sha-abc1234

    // Development: branch name
    development: "dev-{branch}",  // dev-feature-auth

    // Always tag latest for each environment
    latest: "{env}-latest"  // prod-latest, staging-latest
  }
} as const
```

## 25.1.3 Base Image Strategy

```typescript
const BASE_IMAGE_CONFIG = {
  // Use official Node.js Alpine for smaller size
  nodeVersion: "22-alpine3.19",

  // Image sizes (approximate)
  sizes: {
    "node:22": "~1.1GB",
    "node:22-slim": "~250MB",
    "node:22-alpine": "~180MB",  // ✓ Selected
  },

  // Security: Always pin to specific digest in production
  productionImage: "node:22-alpine3.19@sha256:xxxx",

  // Update schedule
  baseImageUpdate: "monthly",
  securityPatchUpdate: "within 24 hours"
} as const
```


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.2 DOCKERFILE SPECIFICATIONS                                              │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.2.1 Web Application Dockerfile

```dockerfile
# ============================================================================
# VOXPOLL WEB - Multi-stage Dockerfile
# ============================================================================

# ----------------------------------------------------------------------------
# Stage 1: Dependencies
# ----------------------------------------------------------------------------
FROM node:22-alpine3.19 AS deps
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install pnpm and dependencies
RUN corepack enable pnpm && \
    pnpm install --frozen-lockfile --prefer-offline

# ----------------------------------------------------------------------------
# Stage 2: Builder
# ----------------------------------------------------------------------------
FROM node:22-alpine3.19 AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_SENTRY_DSN

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN

# Generate Drizzle client
RUN npx drizzle-kit generate

# Build application
RUN corepack enable pnpm && \
    pnpm build

# Remove dev dependencies
RUN pnpm prune --prod

# ----------------------------------------------------------------------------
# Stage 3: Runner (Production)
# ----------------------------------------------------------------------------
FROM node:22-alpine3.19 AS runner
WORKDIR /app

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Drizzle ORM is bundled with the application, no separate runtime files needed

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"]
```

## 25.2.2 API Service Dockerfile

```dockerfile
# ============================================================================
# VOXPOLL API - Multi-stage Dockerfile
# ============================================================================

FROM node:22-alpine3.19 AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ----------------------------------------------------------------------------
FROM node:22-alpine3.19 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx drizzle-kit generate
RUN corepack enable pnpm && pnpm build:api
RUN pnpm prune --prod

# ----------------------------------------------------------------------------
FROM node:22-alpine3.19 AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 voxpoll

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN chown -R voxpoll:nodejs /app
USER voxpoll

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/api/server.js"]
```

## 25.2.3 Worker Service Dockerfile

```dockerfile
# ============================================================================
# VOXPOLL WORKER - Background Jobs
# ============================================================================

FROM node:22-alpine3.19 AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ----------------------------------------------------------------------------
FROM node:22-alpine3.19 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx drizzle-kit generate
RUN corepack enable pnpm && pnpm build:worker
RUN pnpm prune --prod

# ----------------------------------------------------------------------------
FROM node:22-alpine3.19 AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 voxpoll

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN chown -R voxpoll:nodejs /app
USER voxpoll

# No port exposed - worker connects outbound only

# Health check via file touch
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD test $(find /tmp/worker-heartbeat -mmin -1 2>/dev/null | wc -l) -gt 0 || exit 1

CMD ["node", "dist/worker/index.js"]
```

## 25.2.4 Database Migrator Dockerfile

```dockerfile
# ============================================================================
# VOXPOLL MIGRATOR - Database Migrations
# ============================================================================

FROM node:22-alpine3.19 AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ----------------------------------------------------------------------------
FROM node:22-alpine3.19 AS runner
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY drizzle ./drizzle
COPY src/db/schema ./src/db/schema
COPY package.json ./

# Migration script
COPY scripts/migrate.sh ./
RUN chmod +x migrate.sh

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 voxpoll
RUN chown -R voxpoll:nodejs /app
USER voxpoll

# Run migrations and exit
CMD ["./migrate.sh"]
```

```bash
#!/bin/sh
# scripts/migrate.sh

set -e

echo "🔄 Running database migrations..."

# Wait for database to be ready
until pg_isready -h $DB_HOST -p $DB_PORT 2>/dev/null; do
  echo "⏳ Waiting for database..."
  sleep 2
done

echo "✅ Database is ready"

# Run migrations
npx drizzle-kit push

echo "✅ Migrations complete"

# Optional: Run seeds in non-production
if [ "$NODE_ENV" != "production" ]; then
  echo "🌱 Running seeds..."
  npx tsx src/db/seed.ts
  echo "✅ Seeds complete"
fi

exit 0
```


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.3 DOCKER COMPOSE (Local Development)                                     │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.3.1 Development Compose File

```yaml
# docker-compose.yml - Local Development
version: "3.9"

services:
  # ═══════════════════════════════════════════════════════════════════════════
  # APPLICATION SERVICES
  # ═══════════════════════════════════════════════════════════════════════════

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
      target: deps  # Stop at deps for dev (use volume mounts)
    container_name: voxpoll-web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://voxpoll:voxpoll@postgres:5432/voxpoll
      - REDIS_URL=redis://redis:6379
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: pnpm dev
    networks:
      - voxpoll-network

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
      target: deps
    container_name: voxpoll-api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://voxpoll:voxpoll@postgres:5432/voxpoll
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret-change-in-production
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: pnpm dev:api
    networks:
      - voxpoll-network

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
      target: deps
    container_name: voxpoll-worker
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://voxpoll:voxpoll@postgres:5432/voxpoll
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: pnpm dev:worker
    networks:
      - voxpoll-network

  # ═══════════════════════════════════════════════════════════════════════════
  # DATA SERVICES
  # ═══════════════════════════════════════════════════════════════════════════

  postgres:
    image: postgres:16-alpine
    container_name: voxpoll-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: voxpoll
      POSTGRES_PASSWORD: voxpoll
      POSTGRES_DB: voxpoll
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U voxpoll -d voxpoll"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - voxpoll-network

  redis:
    image: redis:7-alpine
    container_name: voxpoll-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - voxpoll-network

  # ═══════════════════════════════════════════════════════════════════════════
  # DEVELOPMENT TOOLS
  # ═══════════════════════════════════════════════════════════════════════════

  mailhog:
    image: mailhog/mailhog:latest
    container_name: voxpoll-mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    networks:
      - voxpoll-network

  minio:
    image: minio/minio:latest
    container_name: voxpoll-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data
    networks:
      - voxpoll-network

# ═══════════════════════════════════════════════════════════════════════════
# VOLUMES & NETWORKS
# ═══════════════════════════════════════════════════════════════════════════

volumes:
  postgres-data:
  redis-data:
  minio-data:

networks:
  voxpoll-network:
    driver: bridge
```

## 25.3.2 Production Compose File (for reference/testing)

```yaml
# docker-compose.prod.yml - Production-like local testing
version: "3.9"

services:
  web:
    image: ghcr.io/voxpoll/web:${VERSION:-latest}
    container_name: voxpoll-web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production.local
    depends_on:
      - api
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M

  api:
    image: ghcr.io/voxpoll/api:${VERSION:-latest}
    container_name: voxpoll-api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production.local
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 1G

  worker:
    image: ghcr.io/voxpoll/worker:${VERSION:-latest}
    container_name: voxpoll-worker
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production.local
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
```

## 25.3.3 Docker Commands Reference

```typescript
const DOCKER_COMMANDS = {
  // Development
  dev: {
    start: "docker compose up -d",
    startWithBuild: "docker compose up -d --build",
    stop: "docker compose down",
    logs: "docker compose logs -f",
    logsService: "docker compose logs -f {service}",
    shell: "docker compose exec {service} sh",
    restart: "docker compose restart {service}",
    rebuild: "docker compose up -d --build {service}",
    clean: "docker compose down -v --remove-orphans"
  },

  // Build
  build: {
    web: "docker build -t voxpoll-web:dev -f Dockerfile.web .",
    api: "docker build -t voxpoll-api:dev -f Dockerfile.api .",
    worker: "docker build -t voxpoll-worker:dev -f Dockerfile.worker .",
    all: "docker compose build"
  },

  // Database
  database: {
    migrate: "docker compose exec api npx drizzle-kit push",
    migrateCreate: "docker compose exec api npx drizzle-kit generate",
    seed: "docker compose exec api npx tsx src/db/seed.ts",
    studio: "docker compose exec api npx drizzle-kit studio",
    reset: "docker compose exec api npx drizzle-kit drop && npx drizzle-kit push"
  },

  // Debugging
  debug: {
    ps: "docker compose ps",
    stats: "docker stats",
    inspect: "docker inspect {container}",
    networkInspect: "docker network inspect voxpoll-network"
  }
} as const
```

## 25.3.4 .dockerignore

```
# .dockerignore

# Dependencies
node_modules
.pnpm-store

# Build outputs
.next
dist
build
out

# Development
.git
.gitignore
*.md
!README.md

# IDE
.vscode
.idea
*.swp
*.swo

# Environment files
.env
.env.*
!.env.example

# Test files
coverage
.nyc_output
*.test.ts
*.spec.ts
__tests__
__mocks__

# Misc
.DS_Store
Thumbs.db
*.log
npm-debug.log*

# Docker files (don't need to copy these into image)
docker-compose*.yml
Dockerfile*
.dockerignore
```



# ══════════════════════════════════════════════════════════════════════════════
# PART II: CI/CD (GitHub Actions)
# ══════════════════════════════════════════════════════════════════════════════

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.4 PIPELINE ARCHITECTURE                                                  │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.4.1 Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VOXPOLL CI/CD PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TRIGGER: Push/PR to main, develop, feature/*                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        CI PIPELINE                                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │  Lint    │→ │  Type    │→ │  Test    │→ │  Build   │            │   │
│  │  │          │  │  Check   │  │  (Jest)  │  │  (Next)  │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  │       ↓             ↓             ↓             ↓                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │ Security │  │ License  │  │ Coverage │  │  Docker  │            │   │
│  │  │  Scan    │  │  Check   │  │  Report  │  │  Build   │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                         (only on main/develop)                              │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        CD PIPELINE                                   │   │
│  │                                                                      │   │
│  │   develop branch          main branch                               │   │
│  │        │                       │                                     │   │
│  │        ↓                       ↓                                     │   │
│  │   ┌──────────┐           ┌──────────┐                               │   │
│  │   │ Deploy   │           │ Deploy   │→ Manual Approval → Production │   │
│  │   │ Staging  │           │ Staging  │                               │   │
│  │   └──────────┘           └──────────┘                               │   │
│  │        │                                                             │   │
│  │        ↓                                                             │   │
│  │   ┌──────────┐                                                       │   │
│  │   │  E2E     │                                                       │   │
│  │   │  Tests   │                                                       │   │
│  │   └──────────┘                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 25.4.2 Branch Strategy

```typescript
const BRANCH_STRATEGY = {
  // Main branches
  branches: {
    main: {
      protected: true,
      requirePR: true,
      requiredApprovals: 2,
      requireStatusChecks: ["ci", "security", "e2e"],
      deployTo: "production",  // After manual approval
      autoDeployStaging: true  // Deploy to staging automatically
    },
    develop: {
      protected: true,
      requirePR: true,
      requiredApprovals: 1,
      requireStatusChecks: ["ci"],
      deployTo: "staging",
      autoDeployStaging: true
    }
  },

  // Feature branches
  featureBranches: {
    pattern: "feature/*",
    base: "develop",
    deployTo: null,  // No auto-deploy
    previewDeploy: true  // Vercel preview
  },

  // Hotfix branches
  hotfixBranches: {
    pattern: "hotfix/*",
    base: "main",
    deployTo: "staging",  // Auto-deploy for testing
    fastTrack: true  // Reduced approval requirements
  }
} as const
```


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.5 CI WORKFLOWS                                                           │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.5.1 Main CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: "22"
  PNPM_VERSION: "9"

jobs:
  # ═══════════════════════════════════════════════════════════════════════════
  # LINT & TYPE CHECK
  # ═══════════════════════════════════════════════════════════════════════════
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Drizzle Client
        run: pnpm drizzle-kit generate

      - name: Lint
        run: pnpm lint

      - name: Type Check
        run: pnpm type-check

      - name: Format Check
        run: pnpm format:check

  # ═══════════════════════════════════════════════════════════════════════════
  # UNIT TESTS
  # ═══════════════════════════════════════════════════════════════════════════
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
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
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Drizzle Client
        run: pnpm drizzle-kit generate

      - name: Run migrations
        run: pnpm drizzle-kit push
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/voxpoll_test

      - name: Run tests
        run: pnpm test:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/voxpoll_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false
          token: ${{ secrets.CODECOV_TOKEN }}

  # ═══════════════════════════════════════════════════════════════════════════
  # BUILD
  # ═══════════════════════════════════════════════════════════════════════════
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Drizzle Client
        run: pnpm drizzle-kit generate

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: |
            .next
            dist
          retention-days: 1

  # ═══════════════════════════════════════════════════════════════════════════
  # DOCKER BUILD
  # ═══════════════════════════════════════════════════════════════════════════
  docker:
    name: Docker Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: github.event_name == 'push'
    permissions:
      contents: read
      packages: write

    strategy:
      matrix:
        image: [web, api, worker]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/${{ matrix.image }}
          tags: |
            type=sha,prefix=sha-
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.${{ matrix.image }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NEXT_PUBLIC_API_URL=${{ vars.NEXT_PUBLIC_API_URL }}
            NEXT_PUBLIC_SENTRY_DSN=${{ secrets.SENTRY_DSN }}

  # ═══════════════════════════════════════════════════════════════════════════
  # SECURITY SCAN
  # ═══════════════════════════════════════════════════════════════════════════
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: [docker]
    if: github.event_name == 'push'
    permissions:
      security-events: write

    strategy:
      matrix:
        image: [web, api, worker]

    steps:
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/${{ github.repository }}/${{ matrix.image }}:sha-${{ github.sha }}
          format: "sarif"
          output: "trivy-results-${{ matrix.image }}.sarif"
          severity: "CRITICAL,HIGH"

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: "trivy-results-${{ matrix.image }}.sarif"
```

## 25.5.2 PR Checks Workflow

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  # ═══════════════════════════════════════════════════════════════════════════
  # PR TITLE VALIDATION
  # ═══════════════════════════════════════════════════════════════════════════
  pr-title:
    name: PR Title
    runs-on: ubuntu-latest
    steps:
      - name: Validate PR title
        uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            style
            refactor
            perf
            test
            chore
            revert
          requireScope: false
          subjectPattern: ^(?![A-Z]).+$
          subjectPatternError: |
            Subject must not start with uppercase letter

  # ═══════════════════════════════════════════════════════════════════════════
  # LICENSE CHECK
  # ═══════════════════════════════════════════════════════════════════════════
  license:
    name: License Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check licenses
        run: |
          npx license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;0BSD;CC0-1.0;Unlicense" --excludePrivatePackages

  # ═══════════════════════════════════════════════════════════════════════════
  # DEPENDENCY AUDIT
  # ═══════════════════════════════════════════════════════════════════════════
  audit:
    name: Dependency Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Run audit
        run: pnpm audit --audit-level=high

  # ═══════════════════════════════════════════════════════════════════════════
  # BUNDLE SIZE CHECK
  # ═══════════════════════════════════════════════════════════════════════════
  bundle-size:
    name: Bundle Size
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Drizzle Client
        run: pnpm drizzle-kit generate

      - name: Build
        run: pnpm build

      - name: Analyze bundle
        run: pnpm analyze
        continue-on-error: true

      - name: Comment bundle size
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('.next/analyze/client.html', 'utf8');
            // Parse and comment on PR
            // (simplified - actual implementation would extract key metrics)
```


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.6 CD WORKFLOWS                                                           │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.6.1 Deploy to Staging

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop, main]
  workflow_dispatch:

concurrency:
  group: deploy-staging
  cancel-in-progress: false

env:
  AWS_REGION: eu-central-1
  ECS_CLUSTER: voxpoll-staging
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.eu-central-1.amazonaws.com

jobs:
  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      # ─────────────────────────────────────────────────────────────────────
      # RUN DATABASE MIGRATIONS
      # ─────────────────────────────────────────────────────────────────────
      - name: Run migrations
        run: |
          aws ecs run-task \
            --cluster ${{ env.ECS_CLUSTER }} \
            --task-definition voxpoll-migrator-staging \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[${{ secrets.PRIVATE_SUBNET_IDS }}],securityGroups=[${{ secrets.ECS_SECURITY_GROUP }}]}" \
            --wait

      # ─────────────────────────────────────────────────────────────────────
      # DEPLOY SERVICES
      # ─────────────────────────────────────────────────────────────────────
      - name: Deploy Web Service
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service voxpoll-web-staging \
            --force-new-deployment \
            --wait

      - name: Deploy API Service
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service voxpoll-api-staging \
            --force-new-deployment \
            --wait

      - name: Deploy Worker Service
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service voxpoll-worker-staging \
            --force-new-deployment \
            --wait

      # ─────────────────────────────────────────────────────────────────────
      # HEALTH CHECK
      # ─────────────────────────────────────────────────────────────────────
      - name: Wait for deployment
        run: |
          echo "Waiting for services to stabilize..."
          aws ecs wait services-stable \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services voxpoll-web-staging voxpoll-api-staging

      - name: Health check
        run: |
          for i in {1..30}; do
            if curl -sf https://staging.voxpoll.com/api/health; then
              echo "Health check passed!"
              exit 0
            fi
            echo "Attempt $i failed, retrying..."
            sleep 10
          done
          echo "Health check failed after 30 attempts"
          exit 1

      # ─────────────────────────────────────────────────────────────────────
      # NOTIFY
      # ─────────────────────────────────────────────────────────────────────
      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "${{ job.status == 'success' && '✅' || '❌' }} Staging deployment ${{ job.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Staging Deployment*\nStatus: ${{ job.status }}\nCommit: `${{ github.sha }}`\nBranch: `${{ github.ref_name }}`"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  # ═══════════════════════════════════════════════════════════════════════════
  # E2E TESTS
  # ═══════════════════════════════════════════════════════════════════════════
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: deploy

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps chromium

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          BASE_URL: https://staging.voxpoll.com

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

## 25.6.2 Deploy to Production

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      version:
        description: "Version to deploy (e.g., v1.2.3)"
        required: true
        type: string
      skip_approval:
        description: "Skip manual approval (emergency only)"
        required: false
        type: boolean
        default: false

concurrency:
  group: deploy-production
  cancel-in-progress: false

env:
  AWS_REGION: eu-central-1
  ECS_CLUSTER: voxpoll-production

jobs:
  # ═══════════════════════════════════════════════════════════════════════════
  # PRE-DEPLOYMENT CHECKS
  # ═══════════════════════════════════════════════════════════════════════════
  pre-checks:
    name: Pre-deployment Checks
    runs-on: ubuntu-latest
    outputs:
      image_tag: ${{ steps.verify.outputs.image_tag }}

    steps:
      - name: Verify version exists
        id: verify
        run: |
          # Check if Docker images exist for this version
          if aws ecr describe-images \
            --repository-name voxpoll/web \
            --image-ids imageTag=${{ inputs.version }} \
            --region ${{ env.AWS_REGION }} > /dev/null 2>&1; then
            echo "image_tag=${{ inputs.version }}" >> $GITHUB_OUTPUT
          else
            echo "❌ Image not found for version ${{ inputs.version }}"
            exit 1
          fi
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Check staging deployment
        run: |
          # Verify this version was deployed to staging first
          echo "Checking staging deployment history..."
          # Implementation: Check deployment records

  # ═══════════════════════════════════════════════════════════════════════════
  # MANUAL APPROVAL
  # ═══════════════════════════════════════════════════════════════════════════
  approval:
    name: Manual Approval
    runs-on: ubuntu-latest
    needs: pre-checks
    if: ${{ !inputs.skip_approval }}
    environment: production-approval

    steps:
      - name: Approval granted
        run: echo "Production deployment approved"

  # ═══════════════════════════════════════════════════════════════════════════
  # DEPLOY
  # ═══════════════════════════════════════════════════════════════════════════
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [pre-checks, approval]
    if: always() && needs.pre-checks.result == 'success' && (needs.approval.result == 'success' || inputs.skip_approval)
    environment: production

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ inputs.version }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      # ─────────────────────────────────────────────────────────────────────
      # BLUE-GREEN DEPLOYMENT
      # ─────────────────────────────────────────────────────────────────────
      - name: Start blue-green deployment
        id: deploy
        run: |
          # Update task definitions with new image
          NEW_TASK_DEF=$(aws ecs describe-task-definition \
            --task-definition voxpoll-web-production \
            --query 'taskDefinition' \
            | jq --arg IMG "${{ needs.pre-checks.outputs.image_tag }}" \
              '.containerDefinitions[0].image = "ghcr.io/voxpoll/web:" + $IMG')

          # Register new task definition
          aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEF"

          # Create CodeDeploy deployment (blue-green)
          DEPLOYMENT_ID=$(aws deploy create-deployment \
            --application-name voxpoll-production \
            --deployment-group-name voxpoll-web \
            --revision '{"revisionType":"AppSpecContent","appSpecContent":{"content":"{\"version\":\"0.0\",\"Resources\":[{\"TargetService\":{\"Type\":\"AWS::ECS::Service\"}}]}"}}' \
            --query 'deploymentId' \
            --output text)

          echo "deployment_id=$DEPLOYMENT_ID" >> $GITHUB_OUTPUT

      - name: Wait for deployment
        run: |
          aws deploy wait deployment-successful \
            --deployment-id ${{ steps.deploy.outputs.deployment_id }}

      # ─────────────────────────────────────────────────────────────────────
      # POST-DEPLOYMENT
      # ─────────────────────────────────────────────────────────────────────
      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

      - name: Create Sentry release
        run: |
          curl -sL https://sentry.io/get-cli/ | bash
          sentry-cli releases new ${{ inputs.version }}
          sentry-cli releases set-commits ${{ inputs.version }} --auto
          sentry-cli releases finalize ${{ inputs.version }}
          sentry-cli releases deploys ${{ inputs.version }} new -e production
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: voxpoll
          SENTRY_PROJECT: voxpoll-web

      - name: Create GitHub release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: ${{ inputs.version }}
          generate_release_notes: true

  # ═══════════════════════════════════════════════════════════════════════════
  # ROLLBACK (on failure)
  # ═══════════════════════════════════════════════════════════════════════════
  rollback:
    name: Rollback
    runs-on: ubuntu-latest
    needs: deploy
    if: failure()

    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Rollback deployment
        run: |
          echo "🔄 Rolling back deployment..."
          aws deploy stop-deployment \
            --deployment-id ${{ needs.deploy.outputs.deployment_id }} \
            --auto-rollback-enabled

      - name: Notify failure
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "🚨 Production deployment FAILED and rolled back",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Deployment Failed*\nVersion: `${{ inputs.version }}`\nStatus: Rolled back\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View logs>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 25.6.3 Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - "v*.*.*"

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get version
        id: version
        run: echo "version=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT

      - name: Build Docker images
        run: |
          docker build -t ghcr.io/voxpoll/web:${{ steps.version.outputs.version }} -f Dockerfile.web .
          docker build -t ghcr.io/voxpoll/api:${{ steps.version.outputs.version }} -f Dockerfile.api .
          docker build -t ghcr.io/voxpoll/worker:${{ steps.version.outputs.version }} -f Dockerfile.worker .

      - name: Push to GHCR
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/voxpoll/web:${{ steps.version.outputs.version }}
          docker push ghcr.io/voxpoll/api:${{ steps.version.outputs.version }}
          docker push ghcr.io/voxpoll/worker:${{ steps.version.outputs.version }}

      - name: Generate changelog
        id: changelog
        uses: orhun/git-cliff-action@v3
        with:
          config: cliff.toml
          args: --latest --strip header

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.content }}
          draft: false
          prerelease: ${{ contains(steps.version.outputs.version, '-') }}
```

## 25.6.4 Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2

updates:
  # NPM dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Europe/Istanbul"
    open-pull-requests-limit: 10
    groups:
      production-deps:
        patterns:
          - "*"
        exclude-patterns:
          - "@types/*"
          - "eslint*"
          - "prettier*"
          - "*test*"
          - "*jest*"
          - "*playwright*"
      dev-deps:
        patterns:
          - "@types/*"
          - "eslint*"
          - "prettier*"
          - "*test*"
          - "*jest*"
    ignore:
      - dependency-name: "typescript"
        update-types: ["version-update:semver-major"]

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  # Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```



# ══════════════════════════════════════════════════════════════════════════════
# PART III: AWS INFRASTRUCTURE
# ══════════════════════════════════════════════════════════════════════════════

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.7 ARCHITECTURE OVERVIEW                                                  │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.7.1 AWS Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              VOXPOLL AWS ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                              EDGE LAYER                                  │   │
│  │  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐      │   │
│  │  │ Route 53  │───▶│CloudFront │───▶│    WAF    │───▶│  Shield   │      │   │
│  │  │   (DNS)   │    │   (CDN)   │    │(Firewall) │    │  (DDoS)   │      │   │
│  │  └───────────┘    └─────┬─────┘    └───────────┘    └───────────┘      │   │
│  └─────────────────────────┼───────────────────────────────────────────────┘   │
│                            │                                                    │
│  ┌─────────────────────────┼───────────────────────────────────────────────┐   │
│  │  VPC (10.0.0.0/16)      │                                               │   │
│  │                         ▼                                                │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │ PUBLIC SUBNETS (10.0.1.0/24, 10.0.2.0/24)                       │    │   │
│  │  │  ┌───────────────────────────────────────────────────────┐      │    │   │
│  │  │  │              Application Load Balancer                 │      │    │   │
│  │  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐               │      │    │   │
│  │  │  │  │:443/web │  │:443/api │  │:443/ws  │               │      │    │   │
│  │  │  │  └────┬────┘  └────┬────┘  └────┬────┘               │      │    │   │
│  │  │  └───────┼────────────┼────────────┼────────────────────┘      │    │   │
│  │  │          │            │            │                            │    │   │
│  │  │  ┌───────┴────────────┴────────────┴───────┐  ┌──────────┐     │    │   │
│  │  │  │              NAT Gateway                 │  │ Bastion  │     │    │   │
│  │  │  └─────────────────────────────────────────┘  └──────────┘     │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                         │                                                │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │ PRIVATE SUBNETS (10.0.10.0/24, 10.0.11.0/24)                    │    │   │
│  │  │                                                                  │    │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐    │    │   │
│  │  │  │                    ECS FARGATE CLUSTER                   │    │    │   │
│  │  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │    │    │   │
│  │  │  │  │   Web    │  │   API    │  │  Worker  │              │    │    │   │
│  │  │  │  │ Service  │  │ Service  │  │ Service  │              │    │    │   │
│  │  │  │  │  x2-4    │  │  x2-6    │  │  x1-2    │              │    │    │   │
│  │  │  │  └──────────┘  └──────────┘  └──────────┘              │    │    │   │
│  │  │  └─────────────────────────────────────────────────────────┘    │    │   │
│  │  │                         │                                        │    │   │
│  │  │  ┌──────────────────────┼──────────────────────────────────┐    │    │   │
│  │  │  │               DATA LAYER                                 │    │    │   │
│  │  │  │  ┌──────────────┐    │    ┌──────────────┐              │    │    │   │
│  │  │  │  │  RDS Aurora  │◀───┼───▶│ ElastiCache  │              │    │    │   │
│  │  │  │  │ PostgreSQL   │         │   (Redis)    │              │    │    │   │
│  │  │  │  │  Multi-AZ    │         │   Cluster    │              │    │    │   │
│  │  │  │  └──────────────┘         └──────────────┘              │    │    │   │
│  │  │  └─────────────────────────────────────────────────────────┘    │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │ ISOLATED SUBNETS (10.0.20.0/24, 10.0.21.0/24) - No internet     │    │   │
│  │  │  ┌────────────────────────────────────────────────────────┐     │    │   │
│  │  │  │                  Secrets Manager                        │     │    │   │
│  │  │  │                  Parameter Store                        │     │    │   │
│  │  │  └────────────────────────────────────────────────────────┘     │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         EXTERNAL SERVICES                                 │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐             │   │
│  │  │   S3   │  │  SES   │  │  SNS   │  │  SQS   │  │ Lambda │             │   │
│  │  │(Media) │  │(Email) │  │(Notif) │  │(Queue) │  │(Tasks) │             │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘             │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 25.7.2 Environment Configuration

```typescript
const AWS_ENVIRONMENTS = {
  production: {
    region: "eu-central-1",  // Frankfurt (GDPR compliance)
    account: "111111111111",
    domain: "voxpoll.com",
    vpc: {
      cidr: "10.0.0.0/16",
      azCount: 3,
      natGateways: 2  // High availability
    },
    scaling: {
      web: { min: 2, max: 10, target: 70 },
      api: { min: 2, max: 20, target: 70 },
      worker: { min: 1, max: 5, target: 80 }
    },
    database: {
      instanceClass: "db.r6g.xlarge",
      multiAz: true,
      readReplicas: 2
    },
    redis: {
      nodeType: "cache.r6g.large",
      numCacheClusters: 3
    }
  },

  staging: {
    region: "eu-central-1",
    account: "222222222222",
    domain: "staging.voxpoll.com",
    vpc: {
      cidr: "10.1.0.0/16",
      azCount: 2,
      natGateways: 1
    },
    scaling: {
      web: { min: 1, max: 3, target: 70 },
      api: { min: 1, max: 5, target: 70 },
      worker: { min: 1, max: 2, target: 80 }
    },
    database: {
      instanceClass: "db.t4g.medium",
      multiAz: false,
      readReplicas: 0
    },
    redis: {
      nodeType: "cache.t4g.small",
      numCacheClusters: 1
    }
  }
} as const
```

## 25.7.3 Cost Estimation (Monthly)

```typescript
const AWS_COST_ESTIMATE = {
  production: {
    compute: {
      ecs_fargate: "$450-800",      // Variable based on load
      lambda: "$50-100"
    },
    database: {
      rds_aurora: "$600-800",       // Multi-AZ + read replicas
      elasticache: "$300-400"
    },
    storage: {
      s3: "$100-200",               // Media storage
      ebs: "$50-100"
    },
    networking: {
      cloudfront: "$100-300",       // CDN bandwidth
      alb: "$50-100",
      nat_gateway: "$100",
      data_transfer: "$200-500"
    },
    security: {
      waf: "$50-100",
      shield: "$0",                 // Standard (free)
      secrets_manager: "$20-50"
    },
    monitoring: {
      cloudwatch: "$100-200",
      xray: "$50-100"
    },
    total: {
      minimum: "$2,000",
      expected: "$3,500",
      maximum: "$5,000"
    }
  },

  staging: {
    total: {
      minimum: "$300",
      expected: "$500",
      maximum: "$800"
    }
  }
} as const
```


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.8 COMPUTE (ECS/Fargate)                                                  │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.8.1 ECS Cluster Configuration

```typescript
const ECS_CLUSTER_CONFIG = {
  clusterName: "voxpoll-{environment}",

  // Capacity providers
  capacityProviders: ["FARGATE", "FARGATE_SPOT"],

  // Default capacity strategy
  defaultCapacityProviderStrategy: [
    { capacityProvider: "FARGATE", weight: 2, base: 1 },
    { capacityProvider: "FARGATE_SPOT", weight: 1, base: 0 }
  ],

  // Container Insights for monitoring
  settings: {
    containerInsights: "enabled"
  },

  // Service Connect for service mesh
  serviceConnectDefaults: {
    namespace: "voxpoll.local"
  }
} as const
```

## 25.8.2 Task Definitions

```typescript
// Web Service Task Definition
const WEB_TASK_DEFINITION = {
  family: "voxpoll-web-{environment}",
  networkMode: "awsvpc",
  requiresCompatibilities: ["FARGATE"],

  cpu: "512",      // 0.5 vCPU
  memory: "1024",  // 1 GB

  executionRoleArn: "arn:aws:iam::{account}:role/voxpoll-ecs-execution",
  taskRoleArn: "arn:aws:iam::{account}:role/voxpoll-web-task",

  containerDefinitions: [
    {
      name: "web",
      image: "ghcr.io/voxpoll/web:{version}",
      essential: true,

      portMappings: [
        { containerPort: 3000, protocol: "tcp" }
      ],

      environment: [
        { name: "NODE_ENV", value: "production" },
        { name: "PORT", value: "3000" }
      ],

      secrets: [
        {
          name: "DATABASE_URL",
          valueFrom: "arn:aws:secretsmanager:{region}:{account}:secret:voxpoll/{env}/database-url"
        },
        {
          name: "REDIS_URL",
          valueFrom: "arn:aws:secretsmanager:{region}:{account}:secret:voxpoll/{env}/redis-url"
        }
      ],

      healthCheck: {
        command: ["CMD-SHELL", "wget -q --spider http://localhost:3000/api/health || exit 1"],
        interval: 30,
        timeout: 5,
        retries: 3,
        startPeriod: 60
      },

      logConfiguration: {
        logDriver: "awslogs",
        options: {
          "awslogs-group": "/ecs/voxpoll-web-{environment}",
          "awslogs-region": "{region}",
          "awslogs-stream-prefix": "web"
        }
      }
    }
  ]
}

// API Service Task Definition
const API_TASK_DEFINITION = {
  family: "voxpoll-api-{environment}",
  cpu: "1024",     // 1 vCPU
  memory: "2048",  // 2 GB

  containerDefinitions: [
    {
      name: "api",
      image: "ghcr.io/voxpoll/api:{version}",

      portMappings: [
        { containerPort: 3001, protocol: "tcp" }
      ],

      // API needs more resources for request handling
      ulimits: [
        { name: "nofile", softLimit: 65536, hardLimit: 65536 }
      ],

      // Same secrets and logging as web...
    }
  ]
}

// Worker Service Task Definition
const WORKER_TASK_DEFINITION = {
  family: "voxpoll-worker-{environment}",
  cpu: "512",
  memory: "1024",

  containerDefinitions: [
    {
      name: "worker",
      image: "ghcr.io/voxpoll/worker:{version}",

      // No port mappings - worker doesn't accept incoming connections

      environment: [
        { name: "WORKER_CONCURRENCY", value: "10" }
      ],

      // Worker heartbeat health check
      healthCheck: {
        command: ["CMD-SHELL", "test $(find /tmp/worker-heartbeat -mmin -1 | wc -l) -gt 0"],
        interval: 30,
        timeout: 5,
        retries: 3
      }
    }
  ]
}
```

## 25.8.3 Service Definitions

```typescript
const ECS_SERVICE_CONFIG = {
  web: {
    serviceName: "voxpoll-web-{environment}",
    desiredCount: 2,
    launchType: "FARGATE",

    deploymentConfiguration: {
      maximumPercent: 200,
      minimumHealthyPercent: 100,
      deploymentCircuitBreaker: {
        enable: true,
        rollback: true
      }
    },

    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: ["private-subnet-1", "private-subnet-2"],
        securityGroups: ["ecs-web-sg"],
        assignPublicIp: "DISABLED"
      }
    },

    loadBalancers: [
      {
        targetGroupArn: "web-target-group-arn",
        containerName: "web",
        containerPort: 3000
      }
    ],

    serviceRegistries: [
      {
        registryArn: "arn:aws:servicediscovery:{region}:{account}:service/srv-xxx",
        containerName: "web"
      }
    ]
  }
} as const
```

## 25.8.4 Auto Scaling Configuration

```typescript
const AUTO_SCALING_CONFIG = {
  web: {
    minCapacity: 2,
    maxCapacity: 10,

    scalingPolicies: [
      {
        policyName: "cpu-scaling",
        policyType: "TargetTrackingScaling",
        targetTrackingScalingPolicyConfiguration: {
          targetValue: 70,
          predefinedMetricSpecification: {
            predefinedMetricType: "ECSServiceAverageCPUUtilization"
          },
          scaleInCooldown: 300,
          scaleOutCooldown: 60
        }
      },
      {
        policyName: "memory-scaling",
        policyType: "TargetTrackingScaling",
        targetTrackingScalingPolicyConfiguration: {
          targetValue: 80,
          predefinedMetricSpecification: {
            predefinedMetricType: "ECSServiceAverageMemoryUtilization"
          }
        }
      },
      {
        policyName: "request-count-scaling",
        policyType: "TargetTrackingScaling",
        targetTrackingScalingPolicyConfiguration: {
          targetValue: 1000,  // requests per target
          predefinedMetricSpecification: {
            predefinedMetricType: "ALBRequestCountPerTarget",
            resourceLabel: "app/voxpoll-alb/xxx/targetgroup/web-tg/yyy"
          }
        }
      }
    ],

    // Scheduled scaling for predictable traffic patterns
    scheduledActions: [
      {
        scheduledActionName: "scale-up-morning",
        schedule: "cron(0 8 * * ? *)",  // 08:00 UTC
        minCapacity: 4,
        maxCapacity: 10
      },
      {
        scheduledActionName: "scale-down-night",
        schedule: "cron(0 22 * * ? *)", // 22:00 UTC
        minCapacity: 2,
        maxCapacity: 6
      }
    ]
  }
} as const
```


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.9 DATABASE (RDS + ElastiCache)                                           │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.9.1 RDS Aurora PostgreSQL

```typescript
const RDS_CONFIG = {
  production: {
    // Cluster configuration
    cluster: {
      clusterIdentifier: "voxpoll-production",
      engine: "aurora-postgresql",
      engineVersion: "16.1",
      databaseName: "voxpoll",
      masterUsername: "voxpoll_admin",
      // masterPassword from Secrets Manager

      // Networking
      dbSubnetGroupName: "voxpoll-db-subnet-group",
      vpcSecurityGroupIds: ["sg-rds-production"],
      port: 5432,

      // Storage
      storageEncrypted: true,
      kmsKeyId: "arn:aws:kms:{region}:{account}:key/xxx",

      // Backup
      backupRetentionPeriod: 35,  // 35 days
      preferredBackupWindow: "03:00-04:00",
      preferredMaintenanceWindow: "sun:04:00-sun:05:00",

      // High availability
      enableHttpEndpoint: false,  // Disable Data API for security
      deletionProtection: true,
      copyTagsToSnapshot: true
    },

    // Writer instance
    writerInstance: {
      instanceClass: "db.r6g.xlarge",  // 4 vCPU, 32 GB RAM
      availabilityZone: "eu-central-1a",
      autoMinorVersionUpgrade: true,
      performanceInsightsEnabled: true,
      performanceInsightsRetentionPeriod: 7
    },

    // Reader instances
    readerInstances: [
      {
        instanceClass: "db.r6g.large",
        availabilityZone: "eu-central-1b",
        promotionTier: 1
      },
      {
        instanceClass: "db.r6g.large",
        availabilityZone: "eu-central-1c",
        promotionTier: 2
      }
    ],

    // Parameter groups
    clusterParameterGroup: {
      family: "aurora-postgresql16",
      parameters: {
        "shared_preload_libraries": "pg_stat_statements,auto_explain",
        "log_statement": "ddl",
        "log_min_duration_statement": "1000",  // Log queries > 1s
        "max_connections": "1000",
        "work_mem": "256MB",
        "maintenance_work_mem": "1GB"
      }
    }
  },

  staging: {
    cluster: {
      clusterIdentifier: "voxpoll-staging",
      engineVersion: "16.1",
      backupRetentionPeriod: 7,
      deletionProtection: false
    },
    writerInstance: {
      instanceClass: "db.t4g.medium"
    },
    readerInstances: []  // No read replicas in staging
  }
} as const
```

## 25.9.2 ElastiCache Redis

```typescript
const ELASTICACHE_CONFIG = {
  production: {
    replicationGroup: {
      replicationGroupId: "voxpoll-redis-production",
      replicationGroupDescription: "VoxPoll Production Redis Cluster",
      engine: "redis",
      engineVersion: "7.1",

      // Node configuration
      nodeType: "cache.r6g.large",  // 2 vCPU, 13 GB RAM
      numCacheClusters: 3,          // 1 primary + 2 replicas

      // Cluster mode
      automaticFailoverEnabled: true,
      multiAzEnabled: true,

      // Networking
      cacheSubnetGroupName: "voxpoll-redis-subnet-group",
      securityGroupIds: ["sg-redis-production"],
      port: 6379,

      // Security
      atRestEncryptionEnabled: true,
      transitEncryptionEnabled: true,
      authToken: "{{from_secrets_manager}}",

      // Maintenance
      snapshotRetentionLimit: 7,
      snapshotWindow: "03:00-04:00",
      preferredMaintenanceWindow: "sun:05:00-sun:06:00",

      // Performance
      autoMinorVersionUpgrade: true
    },

    parameterGroup: {
      family: "redis7",
      parameters: {
        "maxmemory-policy": "volatile-lru",
        "notify-keyspace-events": "Ex",  // For key expiration events
        "timeout": "0",
        "tcp-keepalive": "300"
      }
    }
  },

  staging: {
    replicationGroup: {
      replicationGroupId: "voxpoll-redis-staging",
      nodeType: "cache.t4g.small",
      numCacheClusters: 1,
      automaticFailoverEnabled: false,
      multiAzEnabled: false
    }
  }
} as const
```

## 25.9.3 Connection Pooling (RDS Proxy)

```typescript
const RDS_PROXY_CONFIG = {
  production: {
    dbProxyName: "voxpoll-proxy-production",
    engineFamily: "POSTGRESQL",
    requireTLS: true,
    idleClientTimeout: 1800,

    auth: [
      {
        authScheme: "SECRETS",
        iamAuth: "REQUIRED",
        secretArn: "arn:aws:secretsmanager:{region}:{account}:secret:voxpoll/prod/db-creds"
      }
    ],

    vpcSubnetIds: ["private-subnet-1", "private-subnet-2"],
    vpcSecurityGroupIds: ["sg-rds-proxy"],

    // Connection pooling
    connectionPoolConfig: {
      connectionBorrowTimeout: 120,
      maxConnectionsPercent: 100,
      maxIdleConnectionsPercent: 50
    }
  }
} as const
```


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.10 STORAGE & CDN (S3 + CloudFront)                                       │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.10.1 S3 Buckets

```typescript
const S3_BUCKETS = {
  media: {
    bucketName: "voxpoll-media-{environment}",
    acl: "private",

    // Versioning
    versioningConfiguration: {
      status: "Enabled"
    },

    // Encryption
    serverSideEncryptionConfiguration: {
      rules: [{
        applyServerSideEncryptionByDefault: {
          sseAlgorithm: "aws:kms",
          kmsMasterKeyId: "alias/voxpoll-s3-key"
        }
      }]
    },

    // Lifecycle rules
    lifecycleConfiguration: {
      rules: [
        {
          id: "move-to-ia",
          status: "Enabled",
          transitions: [
            { days: 90, storageClass: "STANDARD_IA" },
            { days: 365, storageClass: "GLACIER" }
          ]
        },
        {
          id: "delete-temp",
          status: "Enabled",
          filter: { prefix: "temp/" },
          expiration: { days: 1 }
        },
        {
          id: "cleanup-multipart",
          status: "Enabled",
          abortIncompleteMultipartUpload: { daysAfterInitiation: 7 }
        }
      ]
    },

    // CORS for direct uploads
    corsConfiguration: {
      corsRules: [{
        allowedHeaders: ["*"],
        allowedMethods: ["GET", "PUT", "POST"],
        allowedOrigins: ["https://voxpoll.com", "https://staging.voxpoll.com"],
        exposeHeaders: ["ETag"],
        maxAgeSeconds: 3600
      }]
    },

    // Block public access
    publicAccessBlockConfiguration: {
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true
    }
  },

  logs: {
    bucketName: "voxpoll-logs-{environment}",
    lifecycleConfiguration: {
      rules: [{
        id: "expire-logs",
        status: "Enabled",
        expiration: { days: 90 }
      }]
    }
  },

  backups: {
    bucketName: "voxpoll-backups-{environment}",
    versioningConfiguration: { status: "Enabled" },
    lifecycleConfiguration: {
      rules: [{
        id: "glacier-after-30-days",
        status: "Enabled",
        transitions: [
          { days: 30, storageClass: "GLACIER" }
        ],
        expiration: { days: 365 }
      }]
    }
  }
} as const
```

## 25.10.2 CloudFront Distribution

```typescript
const CLOUDFRONT_CONFIG = {
  distribution: {
    // Origins
    origins: [
      {
        id: "web-origin",
        domainName: "voxpoll-alb-xxx.eu-central-1.elb.amazonaws.com",
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: "https-only",
          originSslProtocols: ["TLSv1.2"]
        }
      },
      {
        id: "media-origin",
        domainName: "voxpoll-media-production.s3.eu-central-1.amazonaws.com",
        s3OriginConfig: {
          originAccessIdentity: "origin-access-identity/cloudfront/XXXXX"
        }
      }
    ],

    // Default cache behavior (web)
    defaultCacheBehavior: {
      targetOriginId: "web-origin",
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
      cachedMethods: ["GET", "HEAD"],
      compress: true,

      // Cache policy - dynamic content
      cachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",  // CachingDisabled

      // Origin request policy - forward all
      originRequestPolicyId: "216adef6-5c7f-47e4-b989-5492eafa07d3",

      // Response headers policy - security headers
      responseHeadersPolicyId: "67f7725c-6f97-4210-82d7-5512b31e9d03"  // SecurityHeaders
    },

    // Cache behaviors
    cacheBehaviors: [
      {
        pathPattern: "/static/*",
        targetOriginId: "web-origin",
        viewerProtocolPolicy: "redirect-to-https",
        cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",  // CachingOptimized
        ttl: { default: 86400, max: 31536000, min: 0 }
      },
      {
        pathPattern: "/media/*",
        targetOriginId: "media-origin",
        viewerProtocolPolicy: "redirect-to-https",
        cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
        ttl: { default: 86400, max: 31536000 }
      },
      {
        pathPattern: "/api/*",
        targetOriginId: "web-origin",
        viewerProtocolPolicy: "redirect-to-https",
        cachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",  // No cache
        allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      }
    ],

    // SSL certificate
    viewerCertificate: {
      acmCertificateArn: "arn:aws:acm:us-east-1:{account}:certificate/xxx",
      sslSupportMethod: "sni-only",
      minimumProtocolVersion: "TLSv1.2_2021"
    },

    // Domain aliases
    aliases: ["voxpoll.com", "www.voxpoll.com"],

    // Geo restrictions (none)
    restrictions: {
      geoRestriction: { restrictionType: "none" }
    },

    // Logging
    logging: {
      enabled: true,
      bucket: "voxpoll-logs-production.s3.amazonaws.com",
      prefix: "cloudfront/"
    },

    // WAF
    webAclId: "arn:aws:wafv2:us-east-1:{account}:global/webacl/voxpoll-waf/xxx",

    // Price class
    priceClass: "PriceClass_100",  // US, Canada, Europe

    // Enable HTTP/3
    httpVersion: "http3"
  }
} as const
```


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.11 NETWORKING (VPC + ALB + Route53)                                      │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.11.1 VPC Configuration

```typescript
const VPC_CONFIG = {
  production: {
    cidrBlock: "10.0.0.0/16",
    enableDnsSupport: true,
    enableDnsHostnames: true,

    subnets: {
      public: [
        { cidr: "10.0.1.0/24", az: "eu-central-1a", name: "public-1a" },
        { cidr: "10.0.2.0/24", az: "eu-central-1b", name: "public-1b" },
        { cidr: "10.0.3.0/24", az: "eu-central-1c", name: "public-1c" }
      ],
      private: [
        { cidr: "10.0.10.0/24", az: "eu-central-1a", name: "private-1a" },
        { cidr: "10.0.11.0/24", az: "eu-central-1b", name: "private-1b" },
        { cidr: "10.0.12.0/24", az: "eu-central-1c", name: "private-1c" }
      ],
      isolated: [
        { cidr: "10.0.20.0/24", az: "eu-central-1a", name: "isolated-1a" },
        { cidr: "10.0.21.0/24", az: "eu-central-1b", name: "isolated-1b" }
      ]
    },

    natGateways: {
      count: 2,  // One per active AZ
      elasticIps: true
    },

    vpcEndpoints: [
      { service: "s3", type: "Gateway" },
      { service: "dynamodb", type: "Gateway" },
      { service: "ecr.api", type: "Interface" },
      { service: "ecr.dkr", type: "Interface" },
      { service: "logs", type: "Interface" },
      { service: "secretsmanager", type: "Interface" },
      { service: "ssm", type: "Interface" }
    ]
  }
} as const
```

## 25.11.2 Security Groups

```typescript
const SECURITY_GROUPS = {
  alb: {
    name: "voxpoll-alb-sg",
    description: "ALB security group",
    ingress: [
      { protocol: "tcp", port: 443, source: "0.0.0.0/0", description: "HTTPS" },
      { protocol: "tcp", port: 80, source: "0.0.0.0/0", description: "HTTP (redirect)" }
    ],
    egress: [
      { protocol: "-1", port: 0, destination: "0.0.0.0/0" }
    ]
  },

  ecsWeb: {
    name: "voxpoll-ecs-web-sg",
    description: "ECS Web service security group",
    ingress: [
      { protocol: "tcp", port: 3000, source: "alb-sg", description: "From ALB" }
    ],
    egress: [
      { protocol: "-1", port: 0, destination: "0.0.0.0/0" }
    ]
  },

  ecsApi: {
    name: "voxpoll-ecs-api-sg",
    description: "ECS API service security group",
    ingress: [
      { protocol: "tcp", port: 3001, source: "alb-sg", description: "From ALB" },
      { protocol: "tcp", port: 3001, source: "ecs-web-sg", description: "From Web" }
    ],
    egress: [
      { protocol: "-1", port: 0, destination: "0.0.0.0/0" }
    ]
  },

  rds: {
    name: "voxpoll-rds-sg",
    description: "RDS security group",
    ingress: [
      { protocol: "tcp", port: 5432, source: "ecs-api-sg", description: "From API" },
      { protocol: "tcp", port: 5432, source: "ecs-worker-sg", description: "From Worker" },
      { protocol: "tcp", port: 5432, source: "bastion-sg", description: "From Bastion" }
    ],
    egress: []
  },

  redis: {
    name: "voxpoll-redis-sg",
    description: "ElastiCache security group",
    ingress: [
      { protocol: "tcp", port: 6379, source: "ecs-api-sg", description: "From API" },
      { protocol: "tcp", port: 6379, source: "ecs-worker-sg", description: "From Worker" }
    ],
    egress: []
  },

  bastion: {
    name: "voxpoll-bastion-sg",
    description: "Bastion host security group",
    ingress: [
      { protocol: "tcp", port: 22, source: "OFFICE_IP/32", description: "SSH from office" }
    ],
    egress: [
      { protocol: "-1", port: 0, destination: "0.0.0.0/0" }
    ]
  }
} as const
```

## 25.11.3 Application Load Balancer

```typescript
const ALB_CONFIG = {
  loadBalancer: {
    name: "voxpoll-alb-{environment}",
    scheme: "internet-facing",
    type: "application",
    ipAddressType: "dualstack",
    subnets: ["public-subnet-1", "public-subnet-2", "public-subnet-3"],
    securityGroups: ["alb-sg"],

    attributes: {
      "idle_timeout.timeout_seconds": 60,
      "routing.http2.enabled": true,
      "routing.http.drop_invalid_header_fields.enabled": true,
      "access_logs.s3.enabled": true,
      "access_logs.s3.bucket": "voxpoll-logs-{environment}",
      "access_logs.s3.prefix": "alb"
    }
  },

  listeners: {
    https: {
      port: 443,
      protocol: "HTTPS",
      sslPolicy: "ELBSecurityPolicy-TLS13-1-2-2021-06",
      certificates: [{ arn: "arn:aws:acm:{region}:{account}:certificate/xxx" }],

      defaultAction: {
        type: "forward",
        targetGroupArn: "web-target-group"
      },

      rules: [
        {
          priority: 10,
          conditions: [{ pathPattern: "/api/*" }],
          actions: [{ type: "forward", targetGroupArn: "api-target-group" }]
        },
        {
          priority: 20,
          conditions: [{ pathPattern: "/ws/*" }],
          actions: [{ type: "forward", targetGroupArn: "ws-target-group" }]
        }
      ]
    },

    http: {
      port: 80,
      protocol: "HTTP",
      defaultAction: {
        type: "redirect",
        redirectConfig: {
          protocol: "HTTPS",
          port: "443",
          statusCode: "HTTP_301"
        }
      }
    }
  },

  targetGroups: {
    web: {
      name: "voxpoll-web-tg",
      protocol: "HTTP",
      port: 3000,
      targetType: "ip",
      healthCheck: {
        path: "/api/health",
        protocol: "HTTP",
        healthyThreshold: 2,
        unhealthyThreshold: 3,
        timeout: 5,
        interval: 30,
        matcher: "200"
      },
      deregistrationDelay: 30,
      stickiness: { enabled: false }
    },

    api: {
      name: "voxpoll-api-tg",
      protocol: "HTTP",
      port: 3001,
      targetType: "ip",
      healthCheck: {
        path: "/health",
        healthyThreshold: 2,
        unhealthyThreshold: 3
      }
    }
  }
} as const
```

## 25.11.4 Route 53

```typescript
const ROUTE53_CONFIG = {
  hostedZone: {
    name: "voxpoll.com",
    comment: "VoxPoll production zone"
  },

  records: [
    // A record - CloudFront distribution
    {
      name: "voxpoll.com",
      type: "A",
      aliasTarget: {
        hostedZoneId: "Z2FDTNDATAQYW2",  // CloudFront zone ID
        dnsName: "dxxxxx.cloudfront.net",
        evaluateTargetHealth: false
      }
    },

    // AAAA record - CloudFront (IPv6)
    {
      name: "voxpoll.com",
      type: "AAAA",
      aliasTarget: {
        hostedZoneId: "Z2FDTNDATAQYW2",
        dnsName: "dxxxxx.cloudfront.net",
        evaluateTargetHealth: false
      }
    },

    // www subdomain
    {
      name: "www.voxpoll.com",
      type: "A",
      aliasTarget: {
        dnsName: "voxpoll.com",
        evaluateTargetHealth: false
      }
    },

    // API subdomain (direct to ALB, bypassing CloudFront for WebSocket)
    {
      name: "api.voxpoll.com",
      type: "A",
      aliasTarget: {
        hostedZoneId: "ZXXXXX",  // ALB zone ID
        dnsName: "voxpoll-alb-xxx.eu-central-1.elb.amazonaws.com",
        evaluateTargetHealth: true
      }
    },

    // Staging
    {
      name: "staging.voxpoll.com",
      type: "A",
      aliasTarget: {
        dnsName: "staging-cloudfront.cloudfront.net"
      }
    },

    // Mail records
    {
      name: "voxpoll.com",
      type: "MX",
      ttl: 3600,
      records: ["10 inbound-smtp.eu-west-1.amazonaws.com"]
    },

    // SPF, DKIM, DMARC
    {
      name: "voxpoll.com",
      type: "TXT",
      ttl: 3600,
      records: ['"v=spf1 include:amazonses.com ~all"']
    },
    {
      name: "_dmarc.voxpoll.com",
      type: "TXT",
      ttl: 3600,
      records: ['"v=DMARC1; p=quarantine; rua=mailto:dmarc@voxpoll.com"']
    }
  ],

  healthChecks: [
    {
      name: "voxpoll-web-health",
      type: "HTTPS",
      fqdn: "voxpoll.com",
      port: 443,
      resourcePath: "/api/health",
      requestInterval: 30,
      failureThreshold: 3,
      enableSNI: true
    }
  ]
} as const
```


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.12 SECURITY (IAM + Secrets Manager + WAF)                                │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.12.1 IAM Roles

```typescript
const IAM_ROLES = {
  // ECS Task Execution Role
  ecsExecution: {
    roleName: "voxpoll-ecs-execution",
    assumeRolePolicy: {
      Version: "2012-10-17",
      Statement: [{
        Effect: "Allow",
        Principal: { Service: "ecs-tasks.amazonaws.com" },
        Action: "sts:AssumeRole"
      }]
    },
    managedPolicies: [
      "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
    ],
    inlinePolicies: {
      SecretsAccess: {
        Version: "2012-10-17",
        Statement: [{
          Effect: "Allow",
          Action: [
            "secretsmanager:GetSecretValue",
            "kms:Decrypt"
          ],
          Resource: [
            "arn:aws:secretsmanager:{region}:{account}:secret:voxpoll/*",
            "arn:aws:kms:{region}:{account}:key/*"
          ]
        }]
      }
    }
  },

  // ECS Task Role (application permissions)
  ecsTaskWeb: {
    roleName: "voxpoll-web-task",
    assumeRolePolicy: {
      Version: "2012-10-17",
      Statement: [{
        Effect: "Allow",
        Principal: { Service: "ecs-tasks.amazonaws.com" },
        Action: "sts:AssumeRole"
      }]
    },
    inlinePolicies: {
      S3Access: {
        Version: "2012-10-17",
        Statement: [{
          Effect: "Allow",
          Action: [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject"
          ],
          Resource: "arn:aws:s3:::voxpoll-media-*/*"
        }]
      },
      SESAccess: {
        Version: "2012-10-17",
        Statement: [{
          Effect: "Allow",
          Action: ["ses:SendEmail", "ses:SendRawEmail"],
          Resource: "*",
          Condition: {
            StringEquals: {
              "ses:FromAddress": ["noreply@voxpoll.com", "support@voxpoll.com"]
            }
          }
        }]
      }
    }
  },

  // GitHub Actions deployment role
  githubActions: {
    roleName: "voxpoll-github-actions",
    assumeRolePolicy: {
      Version: "2012-10-17",
      Statement: [{
        Effect: "Allow",
        Principal: { Federated: "arn:aws:iam::{account}:oidc-provider/token.actions.githubusercontent.com" },
        Action: "sts:AssumeRoleWithWebIdentity",
        Condition: {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          StringLike: {
            "token.actions.githubusercontent.com:sub": "repo:voxpoll/voxpoll:*"
          }
        }
      }]
    },
    inlinePolicies: {
      DeploymentAccess: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: [
              "ecs:UpdateService",
              "ecs:DescribeServices",
              "ecs:DescribeTaskDefinition",
              "ecs:RegisterTaskDefinition",
              "ecs:RunTask"
            ],
            Resource: "*"
          },
          {
            Effect: "Allow",
            Action: ["ecr:GetAuthorizationToken"],
            Resource: "*"
          },
          {
            Effect: "Allow",
            Action: [
              "ecr:BatchCheckLayerAvailability",
              "ecr:GetDownloadUrlForLayer",
              "ecr:BatchGetImage",
              "ecr:PutImage",
              "ecr:InitiateLayerUpload",
              "ecr:UploadLayerPart",
              "ecr:CompleteLayerUpload"
            ],
            Resource: "arn:aws:ecr:{region}:{account}:repository/voxpoll/*"
          },
          {
            Effect: "Allow",
            Action: ["iam:PassRole"],
            Resource: [
              "arn:aws:iam::{account}:role/voxpoll-ecs-*",
              "arn:aws:iam::{account}:role/voxpoll-*-task"
            ]
          }
        ]
      }
    }
  }
} as const
```

## 25.12.2 Secrets Manager

```typescript
const SECRETS_CONFIG = {
  secrets: [
    {
      name: "voxpoll/{env}/database",
      description: "Database connection credentials",
      secretStructure: {
        host: "string",
        port: "number",
        username: "string",
        password: "string",
        dbname: "string"
      },
      rotation: {
        enabled: true,
        automaticallyAfterDays: 30,
        rotationLambdaARN: "arn:aws:lambda:{region}:{account}:function:SecretsManagerRDSPostgreSQLRotation"
      }
    },
    {
      name: "voxpoll/{env}/redis",
      description: "Redis AUTH token",
      rotation: { enabled: false }  // ElastiCache manages this
    },
    {
      name: "voxpoll/{env}/jwt-secret",
      description: "JWT signing secret",
      rotation: {
        enabled: true,
        automaticallyAfterDays: 90
      }
    },
    {
      name: "voxpoll/{env}/oauth",
      description: "OAuth provider credentials",
      secretStructure: {
        google_client_id: "string",
        google_client_secret: "string",
        apple_client_id: "string",
        apple_team_id: "string",
        apple_key_id: "string",
        apple_private_key: "string"
      }
    },
    {
      name: "voxpoll/{env}/external-services",
      description: "Third-party service credentials",
      secretStructure: {
        sentry_dsn: "string",
        stripe_secret_key: "string",
        stripe_webhook_secret: "string",
        firebase_service_account: "json"
      }
    }
  ],

  // Resource policy for cross-account access (if needed)
  resourcePolicy: {
    Version: "2012-10-17",
    Statement: [{
      Effect: "Deny",
      Principal: "*",
      Action: "secretsmanager:GetSecretValue",
      Resource: "*",
      Condition: {
        StringNotEquals: {
          "aws:PrincipalAccount": "{account}"
        }
      }
    }]
  }
} as const
```

## 25.12.3 WAF Configuration

```typescript
const WAF_CONFIG = {
  webAcl: {
    name: "voxpoll-waf",
    description: "VoxPoll Web Application Firewall",
    scope: "CLOUDFRONT",  // For CloudFront distribution

    defaultAction: { allow: {} },

    rules: [
      // AWS Managed Rules
      {
        name: "AWS-AWSManagedRulesCommonRuleSet",
        priority: 10,
        statement: {
          managedRuleGroupStatement: {
            vendorName: "AWS",
            name: "AWSManagedRulesCommonRuleSet",
            excludedRules: []
          }
        },
        overrideAction: { none: {} },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: "CommonRuleSet",
          sampledRequestsEnabled: true
        }
      },
      {
        name: "AWS-AWSManagedRulesKnownBadInputsRuleSet",
        priority: 20,
        statement: {
          managedRuleGroupStatement: {
            vendorName: "AWS",
            name: "AWSManagedRulesKnownBadInputsRuleSet"
          }
        },
        overrideAction: { none: {} }
      },
      {
        name: "AWS-AWSManagedRulesSQLiRuleSet",
        priority: 30,
        statement: {
          managedRuleGroupStatement: {
            vendorName: "AWS",
            name: "AWSManagedRulesSQLiRuleSet"
          }
        },
        overrideAction: { none: {} }
      },

      // Rate limiting
      {
        name: "RateLimitRule",
        priority: 40,
        statement: {
          rateBasedStatement: {
            limit: 2000,  // requests per 5 minutes
            aggregateKeyType: "IP"
          }
        },
        action: { block: {} },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: "RateLimitRule",
          sampledRequestsEnabled: true
        }
      },

      // API-specific rate limiting
      {
        name: "APIRateLimitRule",
        priority: 50,
        statement: {
          rateBasedStatement: {
            limit: 500,  // Lower limit for API
            aggregateKeyType: "IP",
            scopeDownStatement: {
              byteMatchStatement: {
                fieldToMatch: { uriPath: {} },
                positionalConstraint: "STARTS_WITH",
                searchString: "/api/",
                textTransformations: [{ type: "LOWERCASE", priority: 0 }]
              }
            }
          }
        },
        action: { block: {} }
      },

      // Geographic blocking (example: block certain countries)
      {
        name: "GeoBlockRule",
        priority: 60,
        statement: {
          geoMatchStatement: {
            countryCodes: ["RU", "CN", "KP"]  // Example blocked countries
          }
        },
        action: { block: {} }
      }
    ],

    visibilityConfig: {
      cloudWatchMetricsEnabled: true,
      metricName: "voxpoll-waf",
      sampledRequestsEnabled: true
    }
  }
} as const
```



# ══════════════════════════════════════════════════════════════════════════════
# PART IV: OPERATIONS
# ══════════════════════════════════════════════════════════════════════════════

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.13 MONITORING & ALERTING (CloudWatch)                                    │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.13.1 CloudWatch Alarms

```typescript
const CLOUDWATCH_ALARMS = {
  // CRITICAL ALARMS (PagerDuty)
  critical: [
    {
      alarmName: "voxpoll-prod-high-error-rate",
      alarmDescription: "5XX error rate exceeds 5%",
      metricName: "HTTPCode_Target_5XX_Count",
      namespace: "AWS/ApplicationELB",
      threshold: 50,
      evaluationPeriods: 3,
      alarmActions: ["arn:aws:sns:{region}:{account}:voxpoll-critical-alerts"]
    },
    {
      alarmName: "voxpoll-prod-high-latency",
      alarmDescription: "P99 latency exceeds 2 seconds",
      metricName: "TargetResponseTime",
      statistic: "p99",
      threshold: 2,
      evaluationPeriods: 5
    },
    {
      alarmName: "voxpoll-prod-rds-cpu-critical",
      alarmDescription: "RDS CPU exceeds 90%",
      metricName: "CPUUtilization",
      namespace: "AWS/RDS",
      threshold: 90,
      evaluationPeriods: 3
    },
    {
      alarmName: "voxpoll-prod-redis-memory-critical",
      alarmDescription: "Redis memory exceeds 90%",
      metricName: "DatabaseMemoryUsagePercentage",
      namespace: "AWS/ElastiCache",
      threshold: 90
    },
    {
      alarmName: "voxpoll-prod-ecs-no-running-tasks",
      alarmDescription: "No running tasks in ECS service",
      metricName: "RunningTaskCount",
      threshold: 1,
      comparisonOperator: "LessThanThreshold"
    }
  ],

  // WARNING ALARMS (Slack)
  warning: [
    {
      alarmName: "voxpoll-prod-elevated-error-rate",
      threshold: 10,
      alarmActions: ["arn:aws:sns:{region}:{account}:voxpoll-warning-alerts"]
    },
    {
      alarmName: "voxpoll-prod-ecs-cpu-high",
      metricName: "CPUUtilization",
      namespace: "AWS/ECS",
      threshold: 70
    },
    {
      alarmName: "voxpoll-prod-cache-hit-low",
      metricName: "CacheHitRate",
      threshold: 80,
      comparisonOperator: "LessThanThreshold"
    }
  ]
} as const
```

## 25.13.2 SNS Topics

```typescript
const SNS_CONFIG = {
  topics: [
    {
      topicName: "voxpoll-critical-alerts",
      subscriptions: [
        { protocol: "email", endpoint: "oncall@voxpoll.com" },
        { protocol: "https", endpoint: "https://events.pagerduty.com/integration/xxx/enqueue" }
      ]
    },
    {
      topicName: "voxpoll-warning-alerts",
      subscriptions: [
        { protocol: "https", endpoint: "https://hooks.slack.com/services/xxx" }
      ]
    }
  ]
} as const
```


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.14 LOGGING & TRACING                                                     │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.14.1 CloudWatch Logs

```typescript
const CLOUDWATCH_LOGS_CONFIG = {
  logGroups: [
    { logGroupName: "/ecs/voxpoll-web-production", retentionInDays: 30 },
    { logGroupName: "/ecs/voxpoll-api-production", retentionInDays: 30 },
    { logGroupName: "/ecs/voxpoll-worker-production", retentionInDays: 30 },
    { logGroupName: "/aws/rds/cluster/voxpoll-production/postgresql", retentionInDays: 90 }
  ],

  // Metric filters
  metricFilters: [
    {
      filterName: "ErrorCount",
      filterPattern: '[timestamp, requestId, level="ERROR", ...]',
      metricName: "ApplicationErrors"
    },
    {
      filterName: "SlowQueries",
      filterPattern: '[timestamp, requestId, level, message="*query took*", duration>1000]',
      metricName: "SlowQueries"
    }
  ]
} as const
```

## 25.14.2 X-Ray Tracing

```typescript
const XRAY_CONFIG = {
  samplingRules: [
    { ruleName: "Default", fixedRate: 0.05, reservoirSize: 5 },
    { ruleName: "HealthChecks", fixedRate: 0, urlPath: "/health*" },
    { ruleName: "APIEndpoints", fixedRate: 0.1, urlPath: "/api/*" }
  ]
} as const
```


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 25.15 DISASTER RECOVERY & BACKUP                                            │
# └─────────────────────────────────────────────────────────────────────────────┘

## 25.15.1 Backup Strategy

```typescript
const BACKUP_STRATEGY = {
  database: {
    automated: { retentionPeriod: 35, copyToRegion: "eu-west-1" },
    manual: { frequency: "weekly", retention: "90 days" },
    pitr: { enabled: true, retentionPeriod: 7 }
  },
  redis: { snapshotRetentionLimit: 7 },
  s3: { versioning: true, crossRegionReplication: true }
} as const
```

## 25.15.2 Disaster Recovery

```typescript
const DISASTER_RECOVERY = {
  objectives: {
    RTO: "4 hours",  // Recovery Time Objective
    RPO: "1 hour"    // Recovery Point Objective
  },

  drRegion: {
    primary: "eu-central-1",
    secondary: "eu-west-1"
  },

  scenarios: {
    singleAzFailure: { rto: "< 5 minutes", action: "Automatic failover" },
    regionFailure: { rto: "< 4 hours", action: "Manual DR activation" },
    databaseCorruption: { rto: "< 2 hours", action: "Point-in-time recovery" }
  },

  testing: { frequency: "quarterly", types: ["Tabletop", "Component failover", "Full DR drill"] }
} as const
```

## 25.15.3 SLA & Performance Targets

```typescript
const SLA_CONFIG = {
  availability: { target: "99.9%", measurement: "monthly" },

  performance: {
    api: { p50: "100ms", p95: "500ms", p99: "1000ms" },
    web: { ttfb: "200ms", lcp: "2.5s", tti: "3.5s" },
    database: { queryP95: "100ms" },
    cache: { hitRate: "> 85%", latencyP99: "5ms" }
  },

  capacity: {
    concurrentUsers: 10000,
    requestsPerSecond: 5000,
    databaseConnections: 500
  }
} as const
```



# ══════════════════════════════════════════════════════════════════════════════
# END OF BIBLE-025: DevOps & Infrastructure
# ══════════════════════════════════════════════════════════════════════════════


