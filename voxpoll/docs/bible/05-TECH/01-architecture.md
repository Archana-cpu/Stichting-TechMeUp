# Technical Architecture & System Design
> Source: bible-002.md, bible-001.md

---

# ══════════════════════════════════════════════════════════════════════════════
# TECHNOLOGY STACK
# ══════════════════════════════════════════════════════════════════════════════

## Core Framework Technologies

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           CORE TECHNOLOGIES                                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Layer              │ Technology      │ Version  │ Purpose                      │
│  ───────────────────┼─────────────────┼──────────┼──────────────────────────────│
│  Web Framework      │ Next.js         │ 16+      │ SSR, Server Actions, PPR     │
│  Mobile Framework   │ React Native    │ 0.81+    │ iOS & Android apps           │
│  Mobile Tooling     │ Expo            │ SDK 54   │ Build, deploy, OTA updates   │
│  Monorepo           │ Turborepo       │ 2.x      │ Build orchestration, caching │
│  Language           │ TypeScript      │ 5.7+     │ Type safety everywhere       │
│  Runtime            │ Node.js         │ 22 LTS   │ Server runtime               │
│  Package Manager    │ pnpm            │ 9.x      │ Fast, disk-efficient         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Frontend Technologies

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND TECHNOLOGIES                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Category           │ Technology      │ Version  │ Purpose                      │
│  ───────────────────┼─────────────────┼──────────┼──────────────────────────────│
│  Styling            │ Tailwind CSS    │ 3.4.x    │ Utility-first CSS            │
│  UI Components      │ shadcn/ui       │ Latest   │ Accessible, customizable     │
│  Icons              │ Lucide React    │ Latest   │ Consistent iconography       │
│  Forms              │ React Hook Form │ 7.x      │ Performant form handling     │
│  Validation         │ Zod             │ 3.x      │ Schema validation            │
│  State (Server)     │ TanStack Query  │ 5.x      │ Server state management      │
│  State (Client)     │ React Context   │ -        │ Client state management      │
│  Charts             │ Recharts        │ 2.x      │ Data visualization           │
│  Animations         │ Framer Motion   │ 11.x     │ Smooth animations            │
│  Date Handling      │ date-fns        │ 4.x      │ Date utilities               │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Backend Technologies

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND TECHNOLOGIES                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Category           │ Technology      │ Version  │ Purpose                      │
│  ───────────────────┼─────────────────┼──────────┼──────────────────────────────│
│  API Framework      │ Hono            │ 4.6+     │ Lightweight REST API         │
│  API Runtime        │ Node.js         │ 22 LTS   │ @hono/node-server            │
│  ORM                │ Drizzle ORM     │ Latest   │ SQL-first, type-safe (~7kb)  │
│  DB Driver          │ postgres        │ 3.x      │ Fastest PostgreSQL driver    │
│  Database           │ PostgreSQL      │ 16+      │ Primary data store           │
│  Cache              │ Redis           │ 7.x      │ Caching, sessions, queues    │
│  Search (Phase 1)   │ PostgreSQL FTS  │ -        │ Full-text search (< 1M docs) │
│  Search (Phase 2)   │ Meilisearch     │ 1.x      │ Scale search (> 1M docs)     │
│  Background Jobs    │ BullMQ          │ 5.x      │ Job queues                   │
│  Scheduled Jobs     │ Inngest         │ 3.x      │ Cron jobs, workflows, events │
│                                                                                  │
│  [DECISION] Hono over Express/Fastify:                                          │
│  - Ultra-lightweight (~14KB), TypeScript-first                                  │
│  - Middleware pattern identical to Express (easy migration)                     │
│  - Built-in Zod validation via @hono/zod-validator                             │
│  - Can run on Edge or Node.js                                                   │
│                                                                                  │
│  [DECISION] Drizzle ORM over Prisma:                                            │
│  - ~7kb bundle size (vs Prisma's ~6.5MB) - 85% smaller                         │
│  - Zero cold start overhead - perfect for serverless/edge                       │
│  - SQL-first approach - full control over queries                               │
│  - Native Redis caching via upstashCache()                                      │
│  - 14x faster complex joins (no N+1 issues)                                     │
│  - TypeScript inference without code generation                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Authentication & Security

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION & SECURITY                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Category           │ Technology      │ Version  │ Purpose                      │
│  ───────────────────┼─────────────────┼──────────┼──────────────────────────────│
│  Authentication     │ Custom JWT      │ -        │ User auth (Argon2id + JWT)   │
│  Password Hashing   │ @node-rs/argon2 │ 2.x      │ Argon2id hashing (T-006)     │
│  Token Management   │ jose            │ 5.x      │ JWT sign/verify              │
│  SMS Verification   │ Twilio Verify   │ -        │ Phone number OTP             │
│  E-Government       │ e-Devlet OAuth  │ -        │ Turkish national ID verify   │
│  Encryption         │ Node.js crypto  │ -        │ Hashing, encryption          │
│  Secrets            │ AWS Secrets Mgr │ -        │ Secure credential storage    │
│  Rate Limiting      │ Custom (Redis)  │ -        │ Token bucket via Redis       │
│                                                                                  │
│  [DECISION] Custom JWT over Clerk:                                              │
│  - Full control over token claims and expiration                                │
│  - No vendor dependency for core auth                                           │
│  - Lower cost at scale (no per-user fees)                                       │
│  - Docker/AWS compatible without Edge requirements                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Infrastructure & DevOps

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                       INFRASTRUCTURE & DEVOPS                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Category           │ Technology      │ Version  │ Purpose                      │
│  ───────────────────┼─────────────────┼──────────┼──────────────────────────────│
│  Container          │ Docker          │ Latest   │ Development & Production     │
│  Container Orch.    │ Docker Compose  │ 3.8+     │ Multi-container management   │
│  Cloud Platform     │ AWS             │ -        │ Production infrastructure    │
│  Compute            │ AWS ECS/Fargate │ -        │ Container hosting            │
│  Database           │ AWS RDS         │ -        │ Managed PostgreSQL           │
│  Cache              │ AWS ElastiCache │ -        │ Managed Redis                │
│  CDN                │ CloudFlare      │ -        │ Edge caching, DDoS protect   │
│  File Storage       │ AWS S3          │ -        │ Media storage                │
│  Image CDN          │ CloudFlare R2   │ -        │ Image optimization           │
│  DNS                │ CloudFlare      │ -        │ DNS management               │
│  SSL                │ CloudFlare      │ -        │ TLS certificates             │
│  CI/CD              │ GitHub Actions  │ -        │ Automated pipelines          │
│  Secrets            │ AWS Secrets Mgr │ -        │ Secure credential storage    │
│                                                                                  │
│  [DECISION] Docker + AWS over Vercel:                                           │
│  - Full control over infrastructure and scaling                                 │
│  - No vendor lock-in for serverless functions                                   │
│  - Better cost predictability at scale                                          │
│  - Hono API runs on Node.js runtime (not Edge)                                  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Monitoring & Analytics

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                       MONITORING & ANALYTICS                                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Category           │ Technology      │ Version  │ Purpose                      │
│  ───────────────────┼─────────────────┼──────────┼──────────────────────────────│
│  Error Tracking     │ Sentry          │ -        │ Error monitoring, alerts     │
│  Product Analytics  │ PostHog         │ -        │ User analytics (self-host)   │
│  Logging            │ Axiom           │ -        │ Log aggregation              │
│  Uptime Monitoring  │ BetterStack     │ -        │ Uptime, status page          │
│  Performance        │ Vercel Analytics│ -        │ Web vitals tracking          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Communication Services

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                       COMMUNICATION SERVICES                                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Category           │ Technology      │ Version  │ Purpose                      │
│  ───────────────────┼─────────────────┼──────────┼──────────────────────────────│
│  Email              │ Resend          │ -        │ Transactional emails         │
│  Push Notifications │ Expo Notif.     │ -        │ Mobile push (expo-notif.)    │
│  Real-time (PULSE)  │ Redis Pub/Sub   │ -        │ Real-time events via Redis   │
│  Real-time (Live)   │ WebSocket + ws  │ -        │ Live Poll via ws library     │
│  SMS (Backup)       │ Twilio          │ -        │ SMS notifications            │
│                                                                                  │
│  [DECISION] Redis Pub/Sub for real-time, Expo Notifications for mobile push     │
│  [RATIONALE] No external vendor dependency, horizontally scalable via Redis     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Testing Technologies

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         TESTING TECHNOLOGIES                                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Category           │ Technology      │ Version  │ Purpose                      │
│  ───────────────────┼─────────────────┼──────────┼──────────────────────────────│
│  Unit Testing       │ Vitest          │ 3.x      │ Fast unit tests              │
│  E2E Testing        │ Playwright      │ Latest   │ Cross-browser E2E            │
│  API Testing        │ Vitest + MSW    │ -        │ API mocking and testing      │
│  Load Testing       │ k6              │ -        │ Performance testing          │
│  Visual Testing     │ Playwright      │ -        │ Screenshot comparison        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# MONOREPO STRUCTURE
# ══════════════════════════════════════════════════════════════════════════════

## Directory Structure

```
voxpoll/
│
├── apps/
│   │
│   ├── web/                          # Main web application
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── (auth)/              # Auth routes (login, register)
│   │   │   ├── (main)/              # Main app routes
│   │   │   │   ├── feed/            # Feed page
│   │   │   │   ├── poll/[id]/       # Poll detail & participation
│   │   │   │   ├── survey/[id]/     # Survey detail & participation
│   │   │   │   ├── test/[id]/       # Test detail & participation
│   │   │   │   ├── create/          # Content creation
│   │   │   │   ├── profile/[username]/ # User profiles
│   │   │   │   ├── settings/        # User settings
│   │   │   │   └── notifications/   # Notification center
│   │   │   ├── (org)/               # Organization routes
│   │   │   │   ├── dashboard/       # Org dashboard
│   │   │   │   ├── surveys/         # Survey management
│   │   │   │   ├── analytics/       # Analytics views
│   │   │   │   ├── members/         # Member management
│   │   │   │   └── settings/        # Org settings
│   │   │   ├── api/                 # API routes (webhooks only)
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/              # Web-specific components
│   │   ├── lib/                     # Web-specific utilities
│   │   ├── public/                  # Static assets
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   ├── mobile/                       # React Native application
│   │   ├── app/                      # Expo Router
│   │   │   ├── (tabs)/              # Tab navigation
│   │   │   │   ├── feed.tsx
│   │   │   │   ├── search.tsx
│   │   │   │   ├── create.tsx
│   │   │   │   ├── notifications.tsx
│   │   │   │   └── profile.tsx
│   │   │   ├── poll/[id].tsx
│   │   │   ├── test/[id].tsx
│   │   │   ├── auth/
│   │   │   └── _layout.tsx
│   │   ├── components/              # Mobile-specific components
│   │   ├── lib/                     # Mobile-specific utilities
│   │   ├── assets/                  # Images, fonts
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── platform/                     # Admin/Platform management
│       ├── app/                      # Next.js App Router
│       │   ├── dashboard/           # Platform metrics
│       │   ├── users/               # User management
│       │   ├── organizations/       # Org management
│       │   ├── content/             # Content moderation
│       │   ├── reports/             # Abuse reports
│       │   └── settings/            # Platform settings
│       └── package.json
│
├── packages/
│   │
│   ├── api/                          # Hono REST API package
│   │   ├── src/
│   │   │   ├── index.ts             # App export
│   │   │   ├── server.ts            # Node.js server entry
│   │   │   ├── types.ts             # API types
│   │   │   ├── lib/                 # Utilities
│   │   │   │   └── auth.ts          # JWT & password utilities
│   │   │   ├── middleware/          # Hono middleware
│   │   │   │   ├── index.ts
│   │   │   │   ├── auth.ts          # JWT auth middleware
│   │   │   │   ├── error-handler.ts # Global error handler
│   │   │   │   └── rate-limit.ts    # Rate limiting
│   │   │   └── routes/              # API routes
│   │   │       ├── index.ts         # Route aggregator
│   │   │       ├── health.ts        # Health check endpoints
│   │   │       ├── auth.ts          # Auth endpoints
│   │   │       ├── users.ts         # User endpoints
│   │   │       └── polls.ts         # Poll endpoints
│   │   └── package.json
│   │
│   ├── database/                     # Database package (Drizzle ORM)
│   │   ├── src/
│   │   │   ├── schema/              # Drizzle schema definitions
│   │   │   │   ├── users.ts         # User & auth tables
│   │   │   │   ├── content.ts       # Poll, Survey, Test tables
│   │   │   │   ├── responses.ts     # Response tables
│   │   │   │   ├── organizations.ts # Organization tables
│   │   │   │   ├── social.ts        # Follow, Block, Comment tables
│   │   │   │   ├── enums.ts         # All pgEnum definitions
│   │   │   │   ├── relations.ts     # All relation definitions
│   │   │   │   └── index.ts         # Schema barrel export
│   │   │   ├── client.ts            # Drizzle client with postgres driver
│   │   │   ├── migrate.ts           # Migration runner
│   │   │   └── index.ts             # Main export
│   │   ├── drizzle/                 # Drizzle Kit output
│   │   │   └── migrations/          # SQL migration files
│   │   ├── drizzle.config.ts        # Drizzle Kit configuration
│   │   └── package.json
│   │
│   ├── shared/                       # Shared utilities
│   │   ├── src/
│   │   │   ├── types/               # Shared TypeScript types
│   │   │   ├── constants/           # Shared constants
│   │   │   ├── utils/               # Shared utilities
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── validators/                   # Zod schemas
│   │   ├── src/
│   │   │   ├── poll.ts              # Poll validation schemas
│   │   │   ├── survey.ts            # Survey validation schemas
│   │   │   ├── test.ts              # Test validation schemas
│   │   │   ├── user.ts              # User validation schemas
│   │   │   ├── response.ts          # Response validation schemas
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                           # Shared UI components
│   │   ├── src/
│   │   │   ├── components/          # shadcn/ui components
│   │   │   ├── primitives/          # Custom primitives
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── algorithms/                   # Scoring & ranking
│   │   ├── src/
│   │   │   ├── reliability/         # Reliability scoring
│   │   │   ├── ranking/             # Ranking algorithms
│   │   │   ├── statistics/          # Statistical functions
│   │   │   ├── fraud-detection/     # Fraud detection
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── actions/                      # Server Actions
│   │   ├── src/
│   │   │   ├── poll/                # Poll actions
│   │   │   ├── survey/              # Survey actions
│   │   │   ├── test/                # Test actions
│   │   │   ├── user/                # User actions
│   │   │   ├── discussion/          # Discussion actions
│   │   │   ├── organization/        # Org actions
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                       # Shared configuration
│       ├── eslint/                  # ESLint configs
│       ├── typescript/              # TypeScript configs
│       ├── tailwind/                # Tailwind configs
│       └── package.json
│
├── tooling/
│   ├── scripts/                     # Build/deploy scripts
│   └── generators/                  # Code generators
│
├── docker/
│   ├── docker-compose.yml           # Local development
│   ├── docker-compose.prod.yml      # Production (optional)
│   └── Dockerfile                   # Base Dockerfile
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                   # CI pipeline
│   │   ├── deploy-web.yml           # Web deployment
│   │   ├── deploy-mobile.yml        # Mobile deployment
│   │   └── release.yml              # Release workflow
│   └── CODEOWNERS
│
├── turbo.json                        # Turborepo configuration
├── pnpm-workspace.yaml               # pnpm workspace config
├── package.json                      # Root package.json
├── tsconfig.json                     # Root TypeScript config
└── README.md
```

## Package Dependencies Graph

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        PACKAGE DEPENDENCY GRAPH                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                              ┌─────────────┐                                   │
│                              │   config    │                                   │
│                              └──────┬──────┘                                   │
│                                     │                                          │
│              ┌──────────────────────┼──────────────────────┐                   │
│              │                      │                      │                   │
│              ▼                      ▼                      ▼                   │
│       ┌─────────────┐        ┌─────────────┐        ┌─────────────┐           │
│       │   shared    │        │  database   │        │ validators  │           │
│       └──────┬──────┘        └──────┬──────┘        └──────┬──────┘           │
│              │                      │                      │                   │
│              └──────────────────────┼──────────────────────┘                   │
│                                     │                                          │
│                                     ▼                                          │
│                              ┌─────────────┐                                   │
│                              │ algorithms  │                                   │
│                              └──────┬──────┘                                   │
│                                     │                                          │
│              ┌──────────────────────┼──────────────────────┐                   │
│              │                      │                      │                   │
│              ▼                      ▼                      ▼                   │
│       ┌─────────────┐        ┌─────────────┐        ┌─────────────┐           │
│       │     ui      │        │   actions   │        │             │           │
│       └──────┬──────┘        └──────┬──────┘        │             │           │
│              │                      │               │             │           │
│              └──────────────────────┼───────────────┘             │           │
│                                     │                             │           │
│              ┌──────────────────────┼──────────────────────┐      │           │
│              │                      │                      │      │           │
│              ▼                      ▼                      ▼      │           │
│       ┌─────────────┐        ┌─────────────┐        ┌─────────────┐           │
│       │     web     │        │   mobile    │        │  platform   │           │
│       └─────────────┘        └─────────────┘        └─────────────┘           │
│                                                                                 │
│  RULES:                                                                        │
│  - Arrows point from dependent to dependency                                   │
│  - No circular dependencies allowed                                            │
│  - Apps depend on packages, packages depend on other packages                  │
│  - config has no dependencies                                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Package Responsibilities

| Package | Responsibility | Exports |
|---------|---------------|----------|
| `api` | Hono REST API (auth, polls, users) | Hono app, route handlers |
| `config` | Shared ESLint, TS, Tailwind configs | Config objects |
| `shared` | Types, constants, utilities | Types, constants, utils |
| `database` | Drizzle schema, client, migrations | Drizzle client, types |
| `validators` | Zod schemas for all entities | Zod schemas |
| `algorithms` | Scoring, ranking, statistics | Calculator functions |
| `ui` | React components (shadcn + custom) | React components |
| `actions` | Server Actions for all operations | Server Action functions |

---

# ══════════════════════════════════════════════════════════════════════════════
# MODULE ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## Domain Modules

The application is organized into domain modules, each with clear boundaries:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DOMAIN MODULES                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │      AUTH       │  │     CONTENT     │  │      USER       │                │
│  │     Module      │  │     Module      │  │     Module      │                │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤                │
│  │ - Registration  │  │ - Poll CRUD     │  │ - Profile mgmt  │                │
│  │ - Login/Logout  │  │ - Survey CRUD   │  │ - Settings      │                │
│  │ - Session mgmt  │  │ - Test CRUD     │  │ - Subscriptions │                │
│  │ - Phone verify  │  │ - Questions     │  │ - Badges        │                │
│  │ - KYC/eGov      │  │ - Pre-tests     │  │ - Following     │                │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                │
│           │                    │                    │                          │
│           └────────────────────┼────────────────────┘                          │
│                                │                                               │
│                    ┌───────────┴───────────┐                                   │
│                    │    SERVICE LAYER      │                                   │
│                    │   (Defined APIs)      │                                   │
│                    └───────────┬───────────┘                                   │
│                                │                                               │
│           ┌────────────────────┼────────────────────┐                          │
│           │                    │                    │                          │
│  ┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐                │
│  │   RESPONSE      │  │   DISCUSSION    │  │   ANALYTICS     │                │
│  │    Module       │  │    Module       │  │    Module       │                │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤                │
│  │ - Participation │  │ - Comments      │  │ - Stats calc    │                │
│  │ - Responses     │  │ - Voting        │  │ - Reliability   │                │
│  │ - Fraud detect  │  │ - Moderation    │  │ - Reporting     │                │
│  │ - Anonymity     │  │ - Access reqs   │  │ - Exports       │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │      FEED       │  │  NOTIFICATION   │  │  ORGANIZATION   │                │
│  │     Module      │  │     Module      │  │     Module      │                │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤                │
│  │ - Feed ranking  │  │ - Push notifs   │  │ - Org CRUD      │                │
│  │ - Discovery     │  │ - Email notifs  │  │ - Members       │                │
│  │ - Search        │  │ - In-app notifs │  │ - Roles         │                │
│  │ - Trending      │  │ - Preferences   │  │ - SSO           │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Module Communication Rules

[MUST] All inter-module communication happens through defined service interfaces.
[NEVER] Direct database queries across module boundaries.
[NEVER] Importing internal module functions from another module.
[MUST] Use events/queues for async cross-module operations.

```typescript
// WRONG: Direct cross-module database access
// In feed module:
const poll = await db.select().from(polls).where(eq(polls.id, id)).then(r => r[0])

// CORRECT: Use content module's service
// In feed module:
import { contentService } from '@voxpoll/actions/content'
const poll = await contentService.getPollById(id)
```

## Service Interface Pattern

Each module exports a service object with all public operations:

```typescript
// packages/actions/src/content/service.ts

export const contentService = {
  createPoll: async (data: CreatePollInput) => { ... },
  getPollById: async (id: string) => { ... },
  getPollsByUser: async (userId: string) => { ... },
  publishPoll: async (id: string) => { ... },

  createSurvey: async (data: CreateSurveyInput) => { ... },

  createTest: async (data: CreateTestInput) => { ... },
}
```

---

# ══════════════════════════════════════════════════════════════════════════════
# CACHING ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## Five-Layer Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        CACHING ARCHITECTURE                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Layer 1: BROWSER CACHE                                                        │
│  ├── Static assets (JS, CSS, images): 1 year (immutable, versioned)           │
│  ├── HTML pages: No cache (dynamic)                                            │
│  └── Service Worker: Offline support for mobile                                │
│                                                                                 │
│  Layer 2: CDN EDGE CACHE (CloudFlare)                                          │
│  ├── Static assets: 1 year                                                     │
│  ├── Public poll listings: 5 min (stale-while-revalidate)                     │
│  ├── Public poll results: 1 min (after completion)                            │
│  ├── User-specific content: No cache (bypass)                                 │
│  └── API responses: Vary by auth header                                        │
│                                                                                 │
│  Layer 3: APPLICATION CACHE (Redis - ElastiCache or local)                     │
│  ├── Session data: 24 hours                                                    │
│  ├── Rate limiting counters: Variable (1min - 1day)                           │
│  ├── Poll metadata: 1 minute                                                   │
│  ├── Poll results (completed): 5 minutes                                       │
│  ├── User profiles: 5 minutes                                                  │
│  ├── Category lists: 10 minutes                                                │
│  ├── Trending content: 30 seconds                                              │
│  ├── Active participant counts: 30 seconds                                     │
│  └── Pre-computed feed: 1 minute (per user)                                   │
│                                                                                 │
│  Layer 4: DATABASE CONNECTION POOL (drizzle-orm/node-postgres)                 │
│  ├── Connection pooling: pg.Pool with custom settings                          │
│  ├── Pool size: max 10 connections per instance                                │
│  ├── Connection timeout: 5000ms                                                │
│  └── Idle timeout: 30000ms                                                     │
│                                                                                 │
│  Layer 5: CLIENT STATE CACHE (TanStack Query)                                  │
│  ├── Stale time: 30 seconds                                                    │
│  ├── Cache time: 5 minutes                                                     │
│  ├── Optimistic updates: For votes, comments                                   │
│  ├── Background refetching: On window focus                                    │
│  └── Infinite query: For feed pagination                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Cache Key Patterns

```typescript
const CACHE_KEYS = {
  session: (sessionId: string) => `session:${sessionId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  userSettings: (userId: string) => `user:settings:${userId}`,

  pollMeta: (pollId: string) => `poll:meta:${pollId}`,
  pollResults: (pollId: string) => `poll:results:${pollId}`,
  surveyMeta: (surveyId: string) => `survey:meta:${surveyId}`,
  testMeta: (testId: string) => `test:meta:${testId}`,
  testResults: (testId: string) => `test:results:${testId}`,

  userFeed: (userId: string, page: number) => `feed:user:${userId}:${page}`,
  trending: (category?: string) => `feed:trending${category ? `:${category}` : ''}`,

  rateLimit: (key: string, window: string) => `ratelimit:${key}:${window}`,

  pollParticipants: (pollId: string) => `count:poll:${pollId}:participants`,
  activeUsers: () => `count:active_users`,
}
```

## Cache Invalidation Strategy

| Event | Invalidate |
|-------|------------|
| Poll created | User's polls list |
| Poll published | Trending, category feeds |
| Response submitted | Poll results, participant count |
| Poll completed | Poll metadata, final results |
| Comment added | Discussion cache |
| User updated profile | User profile cache |
| User followed/unfollowed | User's feed cache |

---

# ══════════════════════════════════════════════════════════════════════════════
# PERFORMANCE REQUIREMENTS
# ══════════════════════════════════════════════════════════════════════════════

## Performance Budgets

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         PERFORMANCE BUDGETS                                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Metric                      │ Budget    │ Priority  │ Measurement              │
│  ────────────────────────────┼───────────┼───────────┼──────────────────────────│
│  Time to First Byte (TTFB)   │ < 100ms   │ Critical  │ Vercel Analytics         │
│  First Contentful Paint      │ < 1.0s    │ Critical  │ Lighthouse               │
│  Largest Contentful Paint    │ < 1.5s    │ Critical  │ Core Web Vitals          │
│  First Input Delay           │ < 50ms    │ High      │ Core Web Vitals          │
│  Cumulative Layout Shift     │ < 0.1     │ High      │ Core Web Vitals          │
│  Time to Interactive         │ < 2.0s    │ High      │ Lighthouse               │
│  Total Blocking Time         │ < 150ms   │ Medium    │ Lighthouse               │
│                                                                                  │
│  API RESPONSE TIMES                                                             │
│  ────────────────────────────┼───────────┼───────────┼──────────────────────────│
│  Simple read (p50)           │ < 50ms    │ Critical  │ APM                      │
│  Simple read (p95)           │ < 150ms   │ Critical  │ APM                      │
│  Simple read (p99)           │ < 300ms   │ High      │ APM                      │
│  Complex query (p50)         │ < 100ms   │ High      │ APM                      │
│  Complex query (p95)         │ < 300ms   │ High      │ APM                      │
│  Write operation (p50)       │ < 100ms   │ High      │ APM                      │
│  Write operation (p95)       │ < 500ms   │ Medium    │ APM                      │
│                                                                                  │
│  BUNDLE SIZES                                                                   │
│  ────────────────────────────┼───────────┼───────────┼──────────────────────────│
│  Initial JS bundle           │ < 100KB   │ Critical  │ Build output             │
│  Per-route JS                │ < 50KB    │ High      │ Build output             │
│  Total JS (lazy loaded)      │ < 500KB   │ Medium    │ Build output             │
│  CSS bundle                  │ < 50KB    │ High      │ Build output             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Database Performance Guidelines

[MUST] All queries must have appropriate indexes.
[MUST] No N+1 queries - use includes/joins appropriately.
[MUST] Paginate all list queries (max 50 items per page).
[SHOULD] Use cursor-based pagination for infinite scroll.
[SHOULD] Denormalize counts that are frequently accessed.
[NEVER] Full table scans on tables > 10K rows.

```typescript
// CORRECT: Cursor-based pagination (Drizzle-style)
const pollsResult = await db.select({
  poll: polls,
  creator: {
    id: users.id,
    username: users.username,
    avatar: users.avatarUrl
  }
})
  .from(polls)
  .leftJoin(users, eq(polls.creatorId, users.id))
  .where(cursor ? lt(polls.id, cursor) : undefined)
  .orderBy(desc(polls.createdAt))
  .limit(20)

// WRONG: Offset pagination on large tables (Drizzle-style)
const pollsResult = await db.select().from(polls)
  .offset(page * 20)
  .limit(20)
```

---

# ══════════════════════════════════════════════════════════════════════════════
# SCALING STRATEGY
# ══════════════════════════════════════════════════════════════════════════════

## Scaling Phases (Docker + AWS)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SCALING PHASES (AWS)                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PHASE 1: 0 - 10K Users (Launch)                                               │
│  ├── Database: AWS RDS PostgreSQL (db.t3.micro)                                │
│  ├── Cache: AWS ElastiCache Redis (cache.t3.micro)                             │
│  ├── Compute: AWS ECS Fargate (0.25 vCPU, 0.5GB RAM)                          │
│  ├── Storage: AWS S3 (minimal)                                                 │
│  └── Estimated cost: $100-200/month                                            │
│                                                                                 │
│  PHASE 2: 10K - 100K Users (Growth)                                            │
│  ├── Database: AWS RDS PostgreSQL (db.t3.medium, Multi-AZ)                    │
│  ├── Cache: AWS ElastiCache Redis (cache.t3.small, cluster mode)              │
│  ├── Compute: AWS ECS Fargate (0.5 vCPU, 1GB RAM, 2-4 tasks)                  │
│  ├── Storage: AWS S3 + CloudFront                                              │
│  ├── Add: RDS Proxy for connection pooling                                     │
│  └── Estimated cost: $500-1000/month                                           │
│                                                                                 │
│  PHASE 3: 100K - 1M Users (Scale)                                              │
│  ├── Database: AWS RDS PostgreSQL (db.r6g.large, read replicas)               │
│  ├── Cache: AWS ElastiCache Redis (cache.r6g.large, cluster mode)             │
│  ├── Compute: AWS ECS Fargate (auto-scaling, 4-16 tasks)                      │
│  ├── Add: Database sharding by organization_id                                 │
│  ├── Add: Dedicated analytics database (ClickHouse/TimescaleDB)               │
│  ├── Add: Meilisearch on EC2 for search (replace PostgreSQL FTS)              │
│  ├── Add: Archive old completed polls (S3 Glacier)                            │
│  └── Estimated cost: $3000-8000/month                                          │
│                                                                                 │
│  PHASE 4: 1M+ Users (Enterprise)                                               │
│  ├── Database: Multi-region Aurora PostgreSQL                                  │
│  ├── Cache: ElastiCache Global Datastore (multi-region)                       │
│  ├── Compute: AWS EKS or ECS multi-region                                      │
│  ├── Add: Geographic sharding                                                  │
│  ├── Add: Meilisearch/Typesense cluster (self-hosted)                         │
│  └── Estimated cost: $15000+/month                                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Database Partitioning Strategy

For Phase 3+, implement table partitioning:

```sql
-- Partition responses by month (high-volume table)
CREATE TABLE responses (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  question_id UUID NOT NULL,
  answer JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE responses_2026_01 PARTITION OF responses
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE responses_2026_02 PARTITION OF responses
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Partition participation by content_id hash (for lookups)
CREATE TABLE participation (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  user_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
) PARTITION BY HASH (content_id);

-- Create hash partitions
CREATE TABLE participation_0 PARTITION OF participation
  FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE participation_1 PARTITION OF participation
  FOR VALUES WITH (MODULUS 4, REMAINDER 1);
```

## Archival Strategy

Content older than retention period moves to cold storage:

| Content Type | Active Period | Archive After | Storage |
|--------------|---------------|---------------|----------|
| Polls | While open + 90 days | 90 days after close | S3 Glacier |
| Surveys | While open + 180 days | 180 days after close | S3 Glacier |
| Tests | Forever (evergreen) | Never | Primary DB |
| Responses | With parent content | With parent | S3 Glacier |
| Discussions | With parent content | With parent | S3 Glacier |

---

# ══════════════════════════════════════════════════════════════════════════════
# INFRASTRUCTURE DIAGRAM
# ══════════════════════════════════════════════════════════════════════════════

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

*Source: bible-002.md, bible-001.md*
