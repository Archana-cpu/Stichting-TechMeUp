# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 02                                    █
# █                   TECHNICAL ARCHITECTURE & STACK                           █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 2.1 TECHNOLOGY STACK
# ══════════════════════════════════════════════════════════════════════════════

## 2.1.1 Core Framework Technologies

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

## 2.1.2 Frontend Technologies

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

## 2.1.3 Backend Technologies

┌──────────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND TECHNOLOGIES                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Category           │ Technology      │ Version  │ Purpose                      │
│  ───────────────────┼─────────────────┼──────────┼──────────────────────────────│
│  API Framework      │ Hono            │ 4.6+     │ Lightweight REST API         │
│  API Runtime        │ Node.js         │ 22 LTS   │ @hono/node-server            │
│  ORM                │ Drizzle ORM     │ Latest   │ SQL-first, type-safe (~7kb)  │
│  DB Driver          │ postgres (porsager)│ 3.x   │ Fastest PostgreSQL driver    │
│  Database           │ PostgreSQL      │ 16+      │ Primary data store           │
│  DB Driver          │ pg              │ 8.13+    │ Node.js PostgreSQL driver    │
│  Cache              │ Redis           │ 7.x      │ Caching, sessions, queues    │
│  Search (Phase 1)   │ PostgreSQL FTS  │ -        │ Full-text search (< 1M docs) │
│  Search (Phase 2)   │ Meilisearch     │ 1.x      │ Scale search (> 1M docs)     │
│  Background Jobs    │ BullMQ          │ 5.x      │ Job queues                   │
│  Scheduled Jobs     │ Inngest         │ 3.x      │ Cron jobs, workflows, events │
│                                                                                  │
│  [DECISION] Hono over Express/Fastify:                                          │
│  • Ultra-lightweight (~14KB), TypeScript-first                                  │
│  • Middleware pattern identical to Express (easy migration)                     │
│  • Built-in Zod validation via @hono/zod-validator                             │
│  • Can run on Edge or Node.js                                                   │
│                                                                                  │
│  [DECISION] Drizzle ORM over Prisma:                                            │
│  • ~7kb bundle size (vs Prisma's ~6.5MB) - 85% smaller                         │
│  • Zero cold start overhead - perfect for serverless/edge                       │
│  • SQL-first approach - full control over queries                               │
│  • Native Redis caching via upstashCache()                                      │
│  • 14x faster complex joins (no N+1 issues)                                     │
│  • TypeScript inference without code generation                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

## 2.1.4 Authentication & Security

┌──────────────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION & SECURITY                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Category           │ Technology      │ Version  │ Purpose                      │
│  ───────────────────┼─────────────────┼──────────┼──────────────────────────────│
│  Authentication     │ Custom JWT      │ -        │ User auth (bcrypt + JWT)     │
│  Password Hashing   │ bcrypt          │ 5.x      │ Secure password storage      │
│  Token Management   │ jose            │ 5.x      │ JWT sign/verify              │
│  SMS Verification   │ Twilio Verify   │ -        │ Phone number OTP             │
│  E-Government       │ e-Devlet OAuth  │ -        │ Turkish national ID verify   │
│  Encryption         │ Node.js crypto  │ -        │ Hashing, encryption          │
│  Secrets            │ AWS Secrets Mgr │ -        │ Secure credential storage    │
│  Rate Limiting      │ Custom (Redis)  │ -        │ Token bucket via Redis       │
│                                                                                  │
│  [DECISION] Custom JWT over Clerk:                                              │
│  • Full control over token claims and expiration                                │
│  • No vendor dependency for core auth                                           │
│  • Lower cost at scale (no per-user fees)                                       │
│  • Docker/AWS compatible without Edge requirements                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

## 2.1.5 Infrastructure & DevOps

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
│  • Full control over infrastructure and scaling                                 │
│  • No vendor lock-in for serverless functions                                   │
│  • Better cost predictability at scale                                          │
│  • Hono API runs on Node.js runtime (not Edge)                                  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

## 2.1.6 Monitoring & Analytics

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

## 2.1.7 Communication Services

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

## 2.1.8 Testing Technologies

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




# ══════════════════════════════════════════════════════════════════════════════
# 2.2 MONOREPO STRUCTURE
# ══════════════════════════════════════════════════════════════════════════════

## 2.2.1 Directory Structure

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
│   │   │   │   ├── content.ts       # Poll, Survey, Test types
│   │   │   │   ├── user.ts          # User, Org types
│   │   │   │   ├── response.ts      # Response types
│   │   │   │   └── index.ts
│   │   │   ├── constants/           # Shared constants
│   │   │   │   ├── limits.ts        # Question limits, etc.
│   │   │   │   ├── categories.ts    # Content categories
│   │   │   │   ├── errors.ts        # Error codes
│   │   │   │   └── index.ts
│   │   │   ├── utils/               # Shared utilities
│   │   │   │   ├── formatting.ts    # Date, number formatting
│   │   │   │   ├── validation.ts    # Common validators
│   │   │   │   └── index.ts
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
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── ... (all shadcn)
│   │   │   ├── primitives/          # Custom primitives
│   │   │   │   ├── poll-card.tsx
│   │   │   │   ├── question-renderer.tsx
│   │   │   │   ├── result-chart.tsx
│   │   │   │   ├── reliability-badge.tsx
│   │   │   │   └── ...
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── algorithms/                   # Scoring & ranking
│   │   ├── src/
│   │   │   ├── reliability/         # Reliability scoring
│   │   │   │   ├── calculator.ts    # Main calculation
│   │   │   │   ├── factors.ts       # Factor definitions
│   │   │   │   └── index.ts
│   │   │   ├── ranking/             # Ranking algorithms
│   │   │   │   ├── wilson-score.ts  # Wilson Score Interval
│   │   │   │   ├── hot.ts           # Hot ranking
│   │   │   │   ├── controversial.ts # Controversial ranking
│   │   │   │   └── index.ts
│   │   │   ├── statistics/          # Statistical functions
│   │   │   │   ├── sample-size.ts   # Sample size calculations
│   │   │   │   ├── margin-error.ts  # Margin of error
│   │   │   │   ├── confidence.ts    # Confidence intervals
│   │   │   │   └── index.ts
│   │   │   ├── fraud-detection/     # Fraud detection
│   │   │   │   ├── speeder.ts       # Speeder detection
│   │   │   │   ├── straightliner.ts # Straight-lining detection
│   │   │   │   ├── patterns.ts      # Pattern analysis
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── actions/                      # Server Actions
│   │   ├── src/
│   │   │   ├── poll/                # Poll actions
│   │   │   │   ├── create.ts
│   │   │   │   ├── participate.ts
│   │   │   │   ├── get.ts
│   │   │   │   └── index.ts
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


## 2.2.2 Package Dependencies Graph

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
│  • Arrows point from dependent to dependency                                   │
│  • No circular dependencies allowed                                            │
│  • Apps depend on packages, packages depend on other packages                  │
│  • config has no dependencies                                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 2.2.3 Package Responsibilities

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




# ══════════════════════════════════════════════════════════════════════════════
# 2.3 MODULE ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 2.3.1 Domain Modules

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
│  │ • Registration  │  │ • Poll CRUD     │  │ • Profile mgmt  │                │
│  │ • Login/Logout  │  │ • Survey CRUD   │  │ • Settings      │                │
│  │ • Session mgmt  │  │ • Test CRUD     │  │ • Subscriptions │                │
│  │ • Phone verify  │  │ • Questions     │  │ • Badges        │                │
│  │ • KYC/eGov      │  │ • Pre-tests     │  │ • Following     │                │
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
│  │ • Participation │  │ • Comments      │  │ • Stats calc    │                │
│  │ • Responses     │  │ • Voting        │  │ • Reliability   │                │
│  │ • Fraud detect  │  │ • Moderation    │  │ • Reporting     │                │
│  │ • Anonymity     │  │ • Access reqs   │  │ • Exports       │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │      FEED       │  │  NOTIFICATION   │  │  ORGANIZATION   │                │
│  │     Module      │  │     Module      │  │     Module      │                │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤                │
│  │ • Feed ranking  │  │ • Push notifs   │  │ • Org CRUD      │                │
│  │ • Discovery     │  │ • Email notifs  │  │ • Members       │                │
│  │ • Search        │  │ • In-app notifs │  │ • Roles         │                │
│  │ • Trending      │  │ • Preferences   │  │ • SSO           │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 2.3.2 Module Communication Rules

[MUST] All inter-module communication happens through defined service interfaces.
[NEVER] Direct database queries across module boundaries.
[NEVER] Importing internal module functions from another module.
[MUST] Use events/queues for async cross-module operations.

```typescript
// ✗ WRONG: Direct cross-module database access
// In feed module:
const poll = await db.select().from(polls).where(eq(polls.id, id)).then(r => r[0])

// ✓ CORRECT: Use content module's service
// In feed module:
import { contentService } from '@voxpoll/actions/content'
const poll = await contentService.getPollById(id)
```


## 2.3.3 Service Interface Pattern

Each module exports a service object with all public operations:

```typescript
// packages/actions/src/content/service.ts

export const contentService = {
  // Poll operations
  createPoll: async (data: CreatePollInput) => { ... },
  getPollById: async (id: string) => { ... },
  getPollsByUser: async (userId: string) => { ... },
  publishPoll: async (id: string) => { ... },
  
  // Survey operations
  createSurvey: async (data: CreateSurveyInput) => { ... },
  // ...
  
  // Test operations
  createTest: async (data: CreateTestInput) => { ... },
  // ...
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 2.4 CACHING ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 2.4.1 Five-Layer Caching Strategy

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


## 2.4.2 Cache Key Patterns

```typescript
// Redis cache key patterns
const CACHE_KEYS = {
  // User-related
  session: (sessionId: string) => `session:${sessionId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  userSettings: (userId: string) => `user:settings:${userId}`,
  
  // Content-related
  pollMeta: (pollId: string) => `poll:meta:${pollId}`,
  pollResults: (pollId: string) => `poll:results:${pollId}`,
  surveyMeta: (surveyId: string) => `survey:meta:${surveyId}`,
  testMeta: (testId: string) => `test:meta:${testId}`,
  testResults: (testId: string) => `test:results:${testId}`,
  
  // Feed-related
  userFeed: (userId: string, page: number) => `feed:user:${userId}:${page}`,
  trending: (category?: string) => `feed:trending${category ? `:${category}` : ''}`,
  
  // Rate limiting
  rateLimit: (key: string, window: string) => `ratelimit:${key}:${window}`,
  
  // Counts
  pollParticipants: (pollId: string) => `count:poll:${pollId}:participants`,
  activeUsers: () => `count:active_users`,
}
```


## 2.4.3 Cache Invalidation Strategy

| Event | Invalidate |
|-------|------------|
| Poll created | User's polls list |
| Poll published | Trending, category feeds |
| Response submitted | Poll results, participant count |
| Poll completed | Poll metadata, final results |
| Comment added | Discussion cache |
| User updated profile | User profile cache |
| User followed/unfollowed | User's feed cache |


## 2.4.4 Cache Key Versioning Strategy

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CACHE KEY VERSIONING
// Enables safe schema changes without cache corruption or stale data issues
// ══════════════════════════════════════════════════════════════════════════════

interface CacheKeyConfig {
  prefix: string
  version: number
  segments: string[]
}

const CACHE_KEY_VERSIONS = {
  // Global version - increment to invalidate ALL caches
  GLOBAL_VERSION: 1,

  // Per-entity versions - increment when entity schema changes
  ENTITY_VERSIONS: {
    user: 2,          // Last change: added verificationLevel field
    poll: 3,          // Last change: added liveMode field
    survey: 1,
    test: 2,          // Last change: badge structure changed
    comment: 1,
    feed: 2,          // Last change: algorithm weights changed
    trending: 3,      // Last change: probabilistic structure added
    session: 1,
    notification: 1
  },

  // Feature-specific versions
  FEATURE_VERSIONS: {
    reliabilityScore: 2,    // Last change: incremental scoring added
    qualityScore: 1,
    fraudScore: 1,
    demographicWeight: 2    // Last change: externalized population data
  }
}

// Cache key builder with versioning
function buildCacheKey(config: CacheKeyConfig): string {
  const globalVersion = CACHE_KEY_VERSIONS.GLOBAL_VERSION
  const entityVersion = config.version

  // Format: v{global}:{prefix}:v{entity}:{segments}
  const versionedPrefix = `v${globalVersion}:${config.prefix}:v${entityVersion}`
  return [versionedPrefix, ...config.segments].join(":")
}

// Versioned cache key patterns
const VERSIONED_CACHE_KEYS = {
  // User-related
  session: (sessionId: string) => buildCacheKey({
    prefix: "session",
    version: CACHE_KEY_VERSIONS.ENTITY_VERSIONS.session,
    segments: [sessionId]
  }),

  userProfile: (userId: string) => buildCacheKey({
    prefix: "user:profile",
    version: CACHE_KEY_VERSIONS.ENTITY_VERSIONS.user,
    segments: [userId]
  }),

  // Content-related
  pollMeta: (pollId: string) => buildCacheKey({
    prefix: "poll:meta",
    version: CACHE_KEY_VERSIONS.ENTITY_VERSIONS.poll,
    segments: [pollId]
  }),

  pollResults: (pollId: string) => buildCacheKey({
    prefix: "poll:results",
    version: CACHE_KEY_VERSIONS.ENTITY_VERSIONS.poll,
    segments: [pollId]
  }),

  // Feed-related
  userFeed: (userId: string, page: number) => buildCacheKey({
    prefix: "feed:user",
    version: CACHE_KEY_VERSIONS.ENTITY_VERSIONS.feed,
    segments: [userId, page.toString()]
  }),

  trending: (category?: string) => buildCacheKey({
    prefix: "feed:trending",
    version: CACHE_KEY_VERSIONS.ENTITY_VERSIONS.trending,
    segments: category ? [category] : []
  }),

  // Scoring-related
  reliabilityScore: (contentId: string) => buildCacheKey({
    prefix: "score:reliability",
    version: CACHE_KEY_VERSIONS.FEATURE_VERSIONS.reliabilityScore,
    segments: [contentId]
  })
}

// Migration helper - invalidates old version keys
async function migrateVersionedCache(
  redis: Redis,
  entity: keyof typeof CACHE_KEY_VERSIONS.ENTITY_VERSIONS,
  oldVersion: number
): Promise<number> {
  const pattern = `v*:${entity}:*:v${oldVersion}:*`
  let cursor = "0"
  let deletedCount = 0

  do {
    const [newCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100)
    cursor = newCursor

    if (keys.length > 0) {
      await redis.del(...keys)
      deletedCount += keys.length
    }
  } while (cursor !== "0")

  return deletedCount
}

// Version bump procedure
const VERSION_BUMP_PROCEDURE = {
  steps: [
    "1. Update ENTITY_VERSIONS or FEATURE_VERSIONS constant",
    "2. Deploy new code (new keys will use new version)",
    "3. Old cache keys auto-expire via TTL",
    "4. Optionally run migrateVersionedCache() to force cleanup"
  ],
  rollback: "Revert version number - old keys still valid if within TTL",
  monitoring: "Track cache hit rate after version bump"
}

export { CACHE_KEY_VERSIONS, VERSIONED_CACHE_KEYS, buildCacheKey, migrateVersionedCache }
```




# ══════════════════════════════════════════════════════════════════════════════
# 2.5 PERFORMANCE REQUIREMENTS
# ══════════════════════════════════════════════════════════════════════════════

## 2.5.1 Performance Budgets

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


## 2.5.2 Database Performance Guidelines

[MUST] All queries must have appropriate indexes.
[MUST] No N+1 queries - use includes/joins appropriately.
[MUST] Paginate all list queries (max 50 items per page).
[SHOULD] Use cursor-based pagination for infinite scroll.
[SHOULD] Denormalize counts that are frequently accessed.
[NEVER] Full table scans on tables > 10K rows.

```typescript
// ✓ CORRECT: Cursor-based pagination (Drizzle-style)
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

// ✗ WRONG: Offset pagination on large tables (Drizzle-style)
const pollsResult = await db.select().from(polls)
  .offset(page * 20)  // Slow for large offsets
  .limit(20)
```




# ══════════════════════════════════════════════════════════════════════════════
# 2.6 SCALING STRATEGY
# ══════════════════════════════════════════════════════════════════════════════

## 2.6.1 Scaling Phases (Docker + AWS)

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


## 2.6.2 Database Partitioning Strategy

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
-- etc.
```


## 2.6.3 Archival Strategy

Content older than retention period moves to cold storage:

| Content Type | Active Period | Archive After | Storage |
|--------------|---------------|---------------|----------|
| Polls | While open + 90 days | 90 days after close | S3 Glacier |
| Surveys | While open + 180 days | 180 days after close | S3 Glacier |
| Tests | Forever (evergreen) | Never | Primary DB |
| Responses | With parent content | With parent | S3 Glacier |
| Discussions | With parent content | With parent | S3 Glacier |


## 2.6.4 Search Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SEARCH SCALING STRATEGY                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PHASE 1: PostgreSQL Full-Text Search (< 1M documents)                          │
│  ├── Use built-in tsvector + GIN indexes                                       │
│  ├── Turkish language support via pg_catalog.turkish                           │
│  ├── Simple, no extra infrastructure                                            │
│  ├── Latency: ~50-100ms for simple queries                                     │
│  └── Cost: $0 (included in database)                                           │
│                                                                                 │
│  TRIGGER: Migrate when:                                                         │
│  • Search latency > 200ms at p95                                               │
│  • Document count > 500K                                                        │
│  • Need advanced features (typo tolerance, faceted search)                     │
│                                                                                 │
│  PHASE 2: Meilisearch Cloud (1M - 10M documents)                                │
│  ├── Instant search (< 50ms)                                                   │
│  ├── Typo tolerance built-in                                                    │
│  ├── Faceted search for categories/tags                                        │
│  ├── Multi-language support                                                     │
│  ├── Sync via database triggers + background job                               │
│  └── Cost: ~$500-2000/month (Meilisearch Cloud)                                │
│                                                                                 │
│  PHASE 3: Self-hosted Meilisearch/Typesense (10M+ documents)                    │
│  ├── Deploy on dedicated instances                                              │
│  ├── Horizontal scaling with replicas                                           │
│  ├── Geographic distribution                                                    │
│  └── Cost: Infrastructure only                                                  │
│                                                                                 │
│  [DECISION] Meilisearch over Elasticsearch because:                            │
│  • 10x faster indexing                                                          │
│  • Simpler deployment (single binary)                                           │
│  • Better developer experience                                                  │
│  • Lower resource usage (RAM/CPU)                                              │
│  • Built-in typo tolerance                                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SEARCH ABSTRACTION LAYER
// Allows switching between PostgreSQL FTS and Meilisearch without code changes
// ══════════════════════════════════════════════════════════════════════════════

interface SearchProvider {
  search(query: string, options: SearchOptions): Promise<SearchResult>
  index(document: Indexable): Promise<void>
  delete(documentId: string): Promise<void>
  bulkIndex(documents: Indexable[]): Promise<void>
}

interface SearchOptions {
  type?: 'poll' | 'test' | 'user' | 'all'
  category?: string
  limit?: number
  offset?: number
  filters?: Record<string, unknown>
}

interface SearchResult {
  hits: SearchHit[]
  totalHits: number
  processingTimeMs: number
  query: string
}

// PostgreSQL FTS implementation (Phase 1)
class PostgresSearchProvider implements SearchProvider {
  async search(query: string, options: SearchOptions): Promise<SearchResult> {
    const startTime = Date.now()

    const results = await db.execute(sql`
      SELECT id, type, title, ts_rank(search_vector, query) AS rank
      FROM content_search,
           plainto_tsquery('turkish', ${query}) query
      WHERE search_vector @@ query
        ${options.type ? sql`AND type = ${options.type}` : sql``}
        ${options.category ? sql`AND category_id = ${options.category}` : sql``}
      ORDER BY rank DESC
      LIMIT ${options.limit || 20}
      OFFSET ${options.offset || 0}
    `)

    return {
      hits: results.map(r => ({ id: r.id, type: r.type, score: r.rank })),
      totalHits: results.length,
      processingTimeMs: Date.now() - startTime,
      query
    }
  }
  // ... index, delete, bulkIndex implementations
}

// Meilisearch implementation (Phase 2+)
class MeilisearchProvider implements SearchProvider {
  private client: MeiliSearch

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST!,
      apiKey: process.env.MEILISEARCH_API_KEY!
    })
  }

  async search(query: string, options: SearchOptions): Promise<SearchResult> {
    const index = this.client.index('content')

    const result = await index.search(query, {
      limit: options.limit || 20,
      offset: options.offset || 0,
      filter: this.buildFilters(options),
      attributesToHighlight: ['title', 'description']
    })

    return {
      hits: result.hits.map(h => ({
        id: h.id,
        type: h.type,
        score: h._rankingScore,
        highlight: h._formatted
      })),
      totalHits: result.estimatedTotalHits,
      processingTimeMs: result.processingTimeMs,
      query
    }
  }

  private buildFilters(options: SearchOptions): string[] {
    const filters: string[] = []
    if (options.type) filters.push(`type = "${options.type}"`)
    if (options.category) filters.push(`categoryId = "${options.category}"`)
    return filters
  }
  // ... index, delete, bulkIndex implementations
}

// Factory function - switches based on config
function getSearchProvider(): SearchProvider {
  const provider = process.env.SEARCH_PROVIDER || 'postgres'

  switch (provider) {
    case 'meilisearch':
      return new MeilisearchProvider()
    case 'postgres':
    default:
      return new PostgresSearchProvider()
  }
}

export { getSearchProvider, SearchProvider, SearchOptions, SearchResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 2.7 INFRASTRUCTURE DIAGRAM
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
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                        EXTERNAL SERVICES                                │  │
│  ├─────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                         │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │  │
│  │  │ Custom  │  │ Twilio  │  │ Resend  │  │Firebase │  │  Expo   │      │  │
│  │  │JWT Auth │  │  SMS    │  │  Email  │  │   FCM   │  │  (EAS)  │      │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │  │
│  │                                                                         │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │  │
│  │  │ Sentry  │  │ PostHog │  │  Axiom  │  │ Inngest │                    │  │
│  │  │ Errors  │  │Analytics│  │  Logs   │  │  Jobs   │                    │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘                    │  │
│  │                                                                         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 2.8 DEVELOPMENT ENVIRONMENT
# ══════════════════════════════════════════════════════════════════════════════

## 2.8.1 Local Development Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  voxpoll:                             # PostgreSQL container
    image: postgres:16-alpine
    container_name: voxpoll
    environment:
      POSTGRES_USER: voxpoll
      POSTGRES_PASSWORD: voxpoll_dev_password
      POSTGRES_DB: voxpoll
    ports:
      - "5434:5432"                    # Host:Container (5434 to avoid conflicts)
    volumes:
      - voxpoll_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U voxpoll"]
      interval: 10s
      timeout: 5s
      retries: 5

  voxpoll-redis:                       # Redis container
    image: redis:7-alpine
    container_name: voxpoll-redis
    ports:
      - "6379:6379"
    volumes:
      - voxpoll_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  mailhog:                             # Email testing (optional)
    image: mailhog/mailhog
    container_name: voxpoll-mailhog
    ports:
      - "1025:1025"                    # SMTP
      - "8025:8025"                    # Web UI

volumes:
  voxpoll_data:
  voxpoll_redis_data:
```

### Drizzle ORM Configuration

```typescript
// packages/database/drizzle.config.ts
import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'
import path from 'node:path'

// Load .env from monorepo root
config({ path: path.join(__dirname, '../../.env') })

const DATABASE_URL = process.env.DATABASE_URL ??
  'postgresql://voxpoll:voxpoll_dev_password@localhost:5434/voxpoll'

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
})
```

```typescript
// packages/database/src/schema/index.ts
import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  // ... additional fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const polls = pgTable('polls', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  options: jsonb('options').notNull(),
  creatorId: uuid('creator_id').references(() => users.id),
  // ... additional fields
})
```

### Drizzle CLI Commands

```bash
# Drizzle CLI commands
pnpm --filter database db:generate    # drizzle-kit generate
pnpm --filter database db:push        # drizzle-kit push
pnpm --filter database db:migrate     # drizzle-kit migrate
pnpm --filter database db:studio      # drizzle-kit studio
```

## 2.8.2 Environment Variables

```bash
# .env (development - monorepo root)

# Database (matches docker-compose port 5434)
DATABASE_URL="postgresql://voxpoll:voxpoll_dev_password@localhost:5434/voxpoll"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# SMS (Twilio)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_VERIFY_SERVICE_SID="VA..."

# Email (Resend)
RESEND_API_KEY="re_..."

# Storage (S3)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="eu-central-1"
AWS_S3_BUCKET="voxpoll-dev"

# Encryption
ENCRYPTION_SECRET="32-byte-secret-key-for-encryption"
PARTICIPATION_SALT="random-salt-for-participation-hashing"
FRAUD_LOG_SALT="different-salt-for-fraud-logging"

# Real-time (Partykit)
NEXT_PUBLIC_PARTYKIT_HOST="localhost:1999"
# Production: NEXT_PUBLIC_PARTYKIT_HOST="voxpoll.partykit.dev"

# Scheduled Jobs (Inngest)
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."
# Production: INNGEST_BASE_URL="https://api.inngest.com"

# Search (Phase 2 - Meilisearch)
SEARCH_PROVIDER="postgres"  # Change to "meilisearch" when scaling
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="..."

# Feature Flags
ENABLE_E_DEVLET=false
ENABLE_PREMIUM_FEATURES=true
```


## 2.8.3 Development Scripts

```json
// package.json (root)
{
  "scripts": {
    "dev": "turbo dev",
    "dev:web": "turbo dev --filter=web",
    "dev:mobile": "turbo dev --filter=mobile",
    "build": "turbo build",
    "test": "turbo test",
    "test:e2e": "turbo test:e2e",
    "lint": "turbo lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "db:generate": "turbo db:generate --filter=database",
    "db:migrate": "turbo db:migrate --filter=database",
    "db:seed": "turbo db:seed --filter=database",
    "db:studio": "turbo db:studio --filter=database",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "clean": "turbo clean && rm -rf node_modules"
  }
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 2.9 CI/CD PIPELINE
# ══════════════════════════════════════════════════════════════════════════════

## 2.9.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
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
      - run: pnpm install
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm turbo typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
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
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm db:generate
      - run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  e2e:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
```


## 2.9.2 Deployment Flow (Docker + AWS)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT FLOW (AWS ECS)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Feature Branch                                                                │
│       │                                                                        │
│       ▼                                                                        │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                      │
│  │ Push to PR  │ ──▶ │   CI Run    │ ──▶ │  Build      │                      │
│  │             │     │ (lint,test) │     │  Docker     │                      │
│  └─────────────┘     └─────────────┘     │  Image      │                      │
│                                          └─────────────┘                      │
│                                                                                 │
│  Merge to develop                                                              │
│       │                                                                        │
│       ▼                                                                        │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐ │
│  │   Merge     │ ──▶ │   CI Run    │ ──▶ │  Push to    │ ──▶ │  Deploy to  │ │
│  │             │     │   + E2E     │     │    ECR      │     │  Staging    │ │
│  └─────────────┘     └─────────────┘     └─────────────┘     │  (ECS)      │ │
│                                                              └─────────────┘ │
│                                                                                 │
│  Merge to main                                                                 │
│       │                                                                        │
│       ▼                                                                        │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐ │
│  │   Merge     │ ──▶ │   CI Run    │ ──▶ │  Push to    │ ──▶ │  Deploy to  │ │
│  │             │     │  + Full E2E │     │    ECR      │     │ Production  │ │
│  └─────────────┘     └─────────────┘     └─────────────┘     │  (ECS)      │ │
│                                                              └──────┬──────┘ │
│                                                                     │         │
│                                                                     ▼         │
│                                                              ┌─────────────┐ │
│                                                              │   Sentry    │ │
│                                                              │  Release    │ │
│                                                              └─────────────┘ │
│                                                                                 │
│  Docker Images: ECR (Elastic Container Registry)                               │
│  Orchestration: ECS Fargate (serverless containers)                           │
│  Load Balancing: ALB (Application Load Balancer)                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 2.8 APPROXIMATE TRENDING WITH PROBABILISTIC DATA STRUCTURES
# ══════════════════════════════════════════════════════════════════════════════

## 2.8.1 Problem Statement

At viral scale, trending content algorithms that scan entire tables create
database bottlenecks. Running trending calculations 2,880 times/day per content
(30-second cache × 24 hours) is unsustainable.

**Solution:** Use probabilistic data structures for O(1) trending operations
with controlled error bounds.


## 2.8.2 Count-Min Sketch for Vote Velocity

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// COUNT-MIN SKETCH - Space-efficient approximate frequency counting
// ══════════════════════════════════════════════════════════════════════════════

interface CountMinSketchConfig {
  // Width of the sketch (columns) - controls accuracy
  width: number
  // Depth of the sketch (rows/hash functions) - controls confidence
  depth: number
  // Error rate: ε = e/width (overcount probability)
  // Confidence: δ = e^(-depth) (probability of exceeding error)
}

const TRENDING_CMS_CONFIG: CountMinSketchConfig = {
  // width=2048 gives ~0.13% error rate
  width: 2048,
  // depth=5 gives 99.3% confidence
  depth: 5
}

class TrendingCountMinSketch {
  private sketch: number[][]
  private seeds: number[]
  private windowStart: number

  constructor(config: CountMinSketchConfig = TRENDING_CMS_CONFIG) {
    this.sketch = Array(config.depth)
      .fill(null)
      .map(() => Array(config.width).fill(0))
    this.seeds = Array(config.depth)
      .fill(null)
      .map(() => Math.floor(Math.random() * 2147483647))
    this.windowStart = Date.now()
  }

  // Hash function using MurmurHash3-style mixing
  private hash(item: string, seed: number, width: number): number {
    let h = seed
    for (let i = 0; i < item.length; i++) {
      h ^= item.charCodeAt(i)
      h = Math.imul(h, 0x5bd1e995)
      h ^= h >>> 15
    }
    return Math.abs(h) % width
  }

  // Increment count for content
  increment(contentId: string, count: number = 1): void {
    for (let i = 0; i < this.sketch.length; i++) {
      const index = this.hash(contentId, this.seeds[i], this.sketch[i].length)
      this.sketch[i][index] += count
    }
  }

  // Get approximate count (returns minimum of all hash positions)
  query(contentId: string): number {
    let min = Infinity
    for (let i = 0; i < this.sketch.length; i++) {
      const index = this.hash(contentId, this.seeds[i], this.sketch[i].length)
      min = Math.min(min, this.sketch[i][index])
    }
    return min
  }

  // Decay all counts by factor (for time-windowed trending)
  decay(factor: number): void {
    for (let i = 0; i < this.sketch.length; i++) {
      for (let j = 0; j < this.sketch[i].length; j++) {
        this.sketch[i][j] = Math.floor(this.sketch[i][j] * factor)
      }
    }
  }

  // Serialize for Redis storage
  serialize(): string {
    return JSON.stringify({
      sketch: this.sketch,
      seeds: this.seeds,
      windowStart: this.windowStart
    })
  }

  // Deserialize from Redis
  static deserialize(data: string): TrendingCountMinSketch {
    const parsed = JSON.parse(data)
    const cms = new TrendingCountMinSketch()
    cms.sketch = parsed.sketch
    cms.seeds = parsed.seeds
    cms.windowStart = parsed.windowStart
    return cms
  }
}
```


## 2.8.3 HyperLogLog for Unique Participant Counting

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// HYPERLOGLOG - Cardinality estimation with 0.81% standard error
// ══════════════════════════════════════════════════════════════════════════════

interface HyperLogLogConfig {
  // Number of registers (2^precision)
  // precision=14 gives 16384 registers, ~0.81% error, ~12KB memory
  precision: number
}

const TRENDING_HLL_CONFIG: HyperLogLogConfig = {
  precision: 14
}

class TrendingHyperLogLog {
  private registers: Uint8Array
  private precision: number
  private alphaMM: number // Bias correction constant

  constructor(config: HyperLogLogConfig = TRENDING_HLL_CONFIG) {
    this.precision = config.precision
    const m = 1 << config.precision
    this.registers = new Uint8Array(m)

    // Calculate bias correction constant
    if (m === 16) this.alphaMM = 0.673 * m * m
    else if (m === 32) this.alphaMM = 0.697 * m * m
    else if (m === 64) this.alphaMM = 0.709 * m * m
    else this.alphaMM = (0.7213 / (1 + 1.079 / m)) * m * m
  }

  // Hash to 64-bit value
  private hash64(item: string): bigint {
    let h = BigInt(0)
    for (let i = 0; i < item.length; i++) {
      h = (h * BigInt(31) + BigInt(item.charCodeAt(i))) & BigInt("0xFFFFFFFFFFFFFFFF")
    }
    return h
  }

  // Count leading zeros after precision bits
  private countLeadingZeros(hash: bigint, precision: number): number {
    const shifted = hash >> BigInt(precision)
    if (shifted === BigInt(0)) return 64 - precision
    let count = 0
    let mask = BigInt(1) << BigInt(63 - precision)
    while ((shifted & mask) === BigInt(0) && count < 64 - precision) {
      count++
      mask >>= BigInt(1)
    }
    return count + 1
  }

  // Add element to set
  add(participantId: string): void {
    const hash = this.hash64(participantId)
    const index = Number(hash & BigInt((1 << this.precision) - 1))
    const rank = this.countLeadingZeros(hash, this.precision)
    this.registers[index] = Math.max(this.registers[index], rank)
  }

  // Estimate cardinality
  count(): number {
    const m = this.registers.length
    let sum = 0
    let zeros = 0

    for (let i = 0; i < m; i++) {
      sum += Math.pow(2, -this.registers[i])
      if (this.registers[i] === 0) zeros++
    }

    let estimate = this.alphaMM / sum

    // Apply small range correction
    if (estimate <= 2.5 * m && zeros > 0) {
      estimate = m * Math.log(m / zeros)
    }

    // Large range correction (not needed for most cases)
    const twoTo32 = Math.pow(2, 32)
    if (estimate > twoTo32 / 30) {
      estimate = -twoTo32 * Math.log(1 - estimate / twoTo32)
    }

    return Math.round(estimate)
  }

  // Merge with another HLL (for distributed counting)
  merge(other: TrendingHyperLogLog): void {
    for (let i = 0; i < this.registers.length; i++) {
      this.registers[i] = Math.max(this.registers[i], other.registers[i])
    }
  }

  // Serialize for Redis
  serialize(): string {
    return Buffer.from(this.registers).toString("base64")
  }

  static deserialize(data: string, config: HyperLogLogConfig = TRENDING_HLL_CONFIG): TrendingHyperLogLog {
    const hll = new TrendingHyperLogLog(config)
    hll.registers = new Uint8Array(Buffer.from(data, "base64"))
    return hll
  }
}
```


## 2.8.4 Trending Score Calculator

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TRENDING SCORE - Combines velocity + reach + recency
// ══════════════════════════════════════════════════════════════════════════════

interface TrendingContentState {
  contentId: string
  // Count-Min Sketch for vote velocity
  voteVelocityCMS: TrendingCountMinSketch
  // HyperLogLog for unique participants
  participantHLL: TrendingHyperLogLog
  // Timestamp of first activity in window
  windowStart: number
  // Last calculated score
  lastScore: number
  // Time windows (5min, 1hr, 24hr)
  windowCounts: {
    "5m": number
    "1h": number
    "24h": number
  }
}

const TRENDING_CONFIG = {
  // Redis keys
  keys: {
    contentState: (contentId: string) => `trending:state:${contentId}`,
    globalCMS: (window: string) => `trending:cms:global:${window}`,
    topN: (category?: string) => `trending:top${category ? `:${category}` : ""}`,
    categorySet: "trending:categories"
  },

  // Scoring weights
  weights: {
    velocity: 0.4,      // Recent activity rate
    reach: 0.3,         // Unique participants
    recency: 0.3        // Time decay factor
  },

  // Time windows
  windows: {
    "5m": 5 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000
  },

  // Decay factor (applied every 5 minutes)
  decayFactor: 0.95,

  // Top N to maintain per category
  topNSize: 100,

  // Background refresh interval
  refreshInterval: 30 * 1000 // 30 seconds
}

async function recordTrendingActivity(
  contentId: string,
  participantId: string,
  category: string
): Promise<void> {
  const redis = getRedisClient()
  const now = Date.now()

  // Get or create content state
  const stateKey = TRENDING_CONFIG.keys.contentState(contentId)
  let stateJson = await redis.get(stateKey)
  let state: TrendingContentState

  if (stateJson) {
    const parsed = JSON.parse(stateJson)
    state = {
      contentId,
      voteVelocityCMS: TrendingCountMinSketch.deserialize(parsed.voteVelocityCMS),
      participantHLL: TrendingHyperLogLog.deserialize(parsed.participantHLL),
      windowStart: parsed.windowStart,
      lastScore: parsed.lastScore,
      windowCounts: parsed.windowCounts
    }
  } else {
    state = {
      contentId,
      voteVelocityCMS: new TrendingCountMinSketch(),
      participantHLL: new TrendingHyperLogLog(),
      windowStart: now,
      lastScore: 0,
      windowCounts: { "5m": 0, "1h": 0, "24h": 0 }
    }
  }

  // Update structures
  state.voteVelocityCMS.increment(contentId)
  state.participantHLL.add(participantId)
  state.windowCounts["5m"]++
  state.windowCounts["1h"]++
  state.windowCounts["24h"]++

  // Calculate new trending score
  const score = calculateTrendingScore(state)
  state.lastScore = score

  // Save state
  await redis.set(stateKey, JSON.stringify({
    voteVelocityCMS: state.voteVelocityCMS.serialize(),
    participantHLL: state.participantHLL.serialize(),
    windowStart: state.windowStart,
    lastScore: state.lastScore,
    windowCounts: state.windowCounts
  }), { ex: 86400 }) // 24 hour TTL

  // Update top N sorted set
  const topKey = TRENDING_CONFIG.keys.topN(category)
  await redis.zadd(topKey, { score, member: contentId })

  // Trim to top N
  await redis.zremrangebyrank(topKey, 0, -(TRENDING_CONFIG.topNSize + 1))

  // Track category
  await redis.sadd(TRENDING_CONFIG.keys.categorySet, category)
}

function calculateTrendingScore(state: TrendingContentState): number {
  const now = Date.now()
  const { weights, windows } = TRENDING_CONFIG

  // Velocity score: weighted sum of time windows
  const velocityScore = (
    (state.windowCounts["5m"] * 10) +  // Recent activity weighted heavily
    (state.windowCounts["1h"] * 2) +
    (state.windowCounts["24h"] * 0.5)
  ) / 12.5 // Normalize

  // Reach score: unique participants (log scale for fairness)
  const uniqueParticipants = state.participantHLL.count()
  const reachScore = Math.log10(uniqueParticipants + 1) * 20 // 0-100 scale

  // Recency score: exponential decay from window start
  const ageMs = now - state.windowStart
  const recencyScore = 100 * Math.exp(-ageMs / windows["24h"])

  // Weighted combination
  const totalScore =
    (velocityScore * weights.velocity) +
    (reachScore * weights.reach) +
    (recencyScore * weights.recency)

  return Math.min(100, Math.max(0, totalScore))
}

// Get trending content (O(log N) from sorted set)
async function getTrendingContent(
  category?: string,
  limit: number = 20
): Promise<Array<{ contentId: string; score: number }>> {
  const redis = getRedisClient()
  const topKey = TRENDING_CONFIG.keys.topN(category)

  const results = await redis.zrange(topKey, 0, limit - 1, {
    rev: true,
    withScores: true
  })

  return results.map(r => ({
    contentId: r.member,
    score: r.score
  }))
}
```


## 2.8.5 Background Maintenance Jobs

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TRENDING MAINTENANCE - Decay and cleanup
// ══════════════════════════════════════════════════════════════════════════════

// Runs every 5 minutes
async function trendingDecayJob(): Promise<void> {
  const redis = getRedisClient()

  // Get all categories
  const categories = await redis.smembers(TRENDING_CONFIG.keys.categorySet)

  for (const category of [...categories, undefined]) {
    const topKey = TRENDING_CONFIG.keys.topN(category)
    const members = await redis.zrange(topKey, 0, -1, { withScores: true })

    const pipeline = redis.pipeline()

    for (const { member: contentId, score } of members) {
      const stateKey = TRENDING_CONFIG.keys.contentState(contentId)
      const stateJson = await redis.get(stateKey)

      if (stateJson) {
        const parsed = JSON.parse(stateJson)
        const state = {
          voteVelocityCMS: TrendingCountMinSketch.deserialize(parsed.voteVelocityCMS),
          participantHLL: TrendingHyperLogLog.deserialize(parsed.participantHLL),
          windowStart: parsed.windowStart,
          lastScore: parsed.lastScore,
          windowCounts: parsed.windowCounts
        }

        // Apply decay
        state.voteVelocityCMS.decay(TRENDING_CONFIG.decayFactor)
        state.windowCounts["5m"] = 0 // Reset 5-min window
        state.windowCounts["1h"] = Math.floor(state.windowCounts["1h"] * 0.9)
        state.windowCounts["24h"] = Math.floor(state.windowCounts["24h"] * 0.95)

        // Recalculate score
        const newScore = calculateTrendingScore({
          contentId,
          ...state
        } as TrendingContentState)

        // Update sorted set
        pipeline.zadd(topKey, { score: newScore, member: contentId })

        // Save updated state
        pipeline.set(stateKey, JSON.stringify({
          voteVelocityCMS: state.voteVelocityCMS.serialize(),
          participantHLL: state.participantHLL.serialize(),
          windowStart: state.windowStart,
          lastScore: newScore,
          windowCounts: state.windowCounts
        }), { ex: 86400 })
      }
    }

    await pipeline.exec()
  }
}

// Cleanup old content (runs daily)
async function trendingCleanupJob(): Promise<void> {
  const redis = getRedisClient()
  const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days

  const categories = await redis.smembers(TRENDING_CONFIG.keys.categorySet)

  for (const category of [...categories, undefined]) {
    const topKey = TRENDING_CONFIG.keys.topN(category)

    // Remove items with score below threshold
    await redis.zremrangebyscore(topKey, 0, 1) // Score < 1 considered inactive
  }
}
```


## 2.8.6 Memory & Error Budgets

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                   PROBABILISTIC STRUCTURE MEMORY BUDGET                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Structure          │ Per Content │ For 100K Content │ Error Rate              │
│  ─────────────────────────────────────────────────────────────────────────────│
│  Count-Min Sketch   │ ~40 KB      │ ~4 GB            │ 0.13% overcount         │
│  HyperLogLog        │ ~12 KB      │ ~1.2 GB          │ 0.81% std error         │
│  Metadata           │ ~1 KB       │ ~100 MB          │ N/A                     │
│  ─────────────────────────────────────────────────────────────────────────────│
│  TOTAL              │ ~53 KB      │ ~5.3 GB          │ Combined < 1%           │
│                                                                                 │
│  Note: In practice, only "hot" content (last 7 days) maintained in memory      │
│  Typical hot set: ~10K items = ~530 MB                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Error Bounds:
- Vote velocity: At most 0.13% overcounting (never undercounts)
- Unique participants: ±0.81% standard error (50K actual = 49.6K-50.4K estimated)
- Trending score: Combined error < 2% deviation from exact calculation
- Acceptable for trending (not billing/analytics)
```




# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 02
# ══════════════════════════════════════════════════════════════════════════════