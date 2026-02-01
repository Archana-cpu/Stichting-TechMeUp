# Technology Stack

> **NyoWorks Standard File** | VoxPoll January 2026

Based on NyoWorks manifesto and CLAUDE.md specifications.

---

## Core Infrastructure

| Layer | Technology | Version | Why |
|-------|------------|---------|-----|
| Runtime | Node.js | 22+ | Native TypeScript, performance |
| Package Manager | pnpm | 9.x | Fast, disk efficient, strict |
| Monorepo | Turborepo | Latest | Incremental builds, caching |
| Language | TypeScript | 5.7+ | Strict mode, type safety |

---

## Backend Stack

### API Framework
- **Hono** - Edge-native, 10x faster than Express
- **Deployment**: Vercel Edge / Railway / Fly.io

### Database
- **PostgreSQL** - Primary database (AWS RDS / Neon / Supabase)
- **Drizzle ORM** - Type-safe queries, zero overhead
- **postgres.js** - Fastest Node.js PostgreSQL driver

### Cache & Queue
- **Redis** - Session store, rate limiting (Upstash / ElastiCache)
- **ioredis** - Redis client
- **BullMQ** - Background job processing

### Authentication & Security
- **JWT** - jose library (Web Crypto API)
- **Argon2id** - Password hashing (T-006)
- **Zod** - Runtime validation + TypeScript inference

### Observability
- **Pino** - Structured JSON logging
- **OpenTelemetry** - Distributed tracing
- **Sentry** - Error tracking

### External Services
- **Stripe** - Payment processing
- **AWS S3 + CloudFront** - File storage + CDN
- **Resend / AWS SES** - Transactional emails
- **Meilisearch / Typesense** - Full-text search

### API Documentation
- **Scalar** - Interactive OpenAPI 3.1 docs

---

## Frontend Stack

### Web App (apps/web)
- **Next.js 16** - App Router, RSC, streaming
- **React 19.1.0** - Concurrent features (pinned version)
- **Tailwind CSS 4** - Utility-first, JIT compilation
- **shadcn/ui** - Accessible component library
- **TanStack Query v5** - Server state management
- **React Hook Form + Zod** - Type-safe forms
- **next-intl** - i18n with type safety

### Mobile App (apps/mobile)
- **React Native 0.81** - iOS + Android
- **Expo SDK 54** - React 19.1, New Architecture
- **Expo Router v6** - File-based routing
- **NativeWind v4** - Tailwind for React Native
- **TanStack Query** - Same state management as web

---

## Shared Packages

### packages/database
- Drizzle schema definitions
- Database migrations
- Type-safe client exports

### packages/validators
- Zod schemas shared between frontend/backend
- Runtime validation + TypeScript types

### packages/shared
- Common types and interfaces
- Utility functions
- Constants and enums

### packages/ui
- React components (shadcn-based)
- Shared between web and mobile where possible

### packages/actions
- Server actions for Next.js
- Type-safe RPC-like calls

### packages/algorithms
- Reliability scoring (T-009)
- Gamification calculations
- Fraud detection logic

### packages/config
- Shared configuration
- Environment variable schemas

---

## DevOps & Infrastructure

### Containers & Orchestration
- **Docker + Docker Compose** - Local dev environment
- **Kubernetes / AWS ECS** - Production scaling

### CI/CD
- **GitHub Actions** - Automated pipelines
- Build, test, deploy automation

### Hosting
- **API**: AWS ECS / Railway / Fly.io
- **Web**: Vercel (edge, ISR, analytics)
- **Database**: AWS RDS / Neon / Supabase
- **Redis**: Upstash / AWS ElastiCache
- **CDN**: CloudFront / Vercel Edge

### Secrets Management
- **AWS Secrets Manager / Doppler** - Secure config

### Monitoring
- **Grafana + Prometheus** - Metrics dashboards
- **BetterStack / Checkly** - Uptime monitoring

---

## Version Pinning Strategy

All packages across monorepo use **exact same versions** via `pnpm.overrides`:

```json
{
  "pnpm": {
    "overrides": {
      "react": "19.1.0",
      "react-dom": "19.1.0",
      "@types/react": "19.1.0",
      "@types/react-dom": "19.1.0"
    }
  }
}
```

**Zero warnings policy** - All peer dependency warnings resolved.

---

## Performance Targets

### API Response Times
| Type | Target | Max |
|------|--------|-----|
| Read (cached) | <20ms | 50ms |
| Read (DB) | <50ms | 200ms |
| Write | <100ms | 500ms |
| Search | <50ms | 200ms |

### Frontend Metrics (Core Web Vitals)
| Metric | Target |
|--------|--------|
| LCP | <2.5s |
| FID | <100ms |
| CLS | <0.1 |
| TTFB | <200ms |

---

## Security Standards

- **TLS 1.3** - Encryption in transit
- **AES-256** - Encryption at rest
- **Argon2id** - Password hashing (T-006)
- **JWT** - 15min access tokens, 7d refresh tokens
- **HttpOnly, Secure, SameSite=Strict** - Cookie flags
- **CSP Headers** - XSS protection
- **Rate Limiting** - Per user/IP
- **Input Validation** - All endpoints (Zod)
- **RBAC** - Role-based access control

---

*Last updated: 2026-01-29*
*NyoWorks Manifesto Compliant*
