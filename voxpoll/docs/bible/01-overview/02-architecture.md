# System Architecture

> **NyoWorks Standard File** | Links to VoxPoll-specific documentation

This file follows NyoWorks manifesto structure. For complete architecture details, see:

**Primary Source:** [05-TECH/01-architecture.md](../05-TECH/01-architecture.md)

**Related Documents:**
- [Database Schema](../05-TECH/02-database-schema.md)
- [API Routes](../05-TECH/03-api-routes.md)
- [API Flows](../05-TECH/04-api-flows.md)
- [Frontend Architecture](../06-UX/05-frontend-architecture.md)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  UNIFIED APP                        │
│  (Next.js 16 Web + React Native Cross-Platform)    │
│                                                     │
│  • Individual Users (B2C)                          │
│  • Organization Members (B2B)                      │
│  • Responsive Design                               │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ REST API + WebSocket
                   │
┌──────────────────▼──────────────────────────────────┐
│              HONO API (Edge Runtime)                │
│                                                     │
│  • JWT Authentication                              │
│  • RBAC Authorization                              │
│  • Rate Limiting                                   │
│  • Input Validation (Zod)                         │
└──────────────────┬──────────────────────────────────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
┌──────▼─────┐ ┌──▼──────┐ ┌─▼────────┐
│ PostgreSQL │ │  Redis  │ │   S3     │
│  (Drizzle) │ │ (Cache) │ │ (Files)  │
└────────────┘ └─────────┘ └──────────┘
```

## Monorepo Structure

```
voxpoll/
├── apps/
│   ├── api/          # Hono backend
│   └── web/          # Next.js 16 (App Router)
├── packages/
│   ├── database/     # Drizzle ORM + schemas
│   ├── validators/   # Zod schemas
│   ├── shared/       # Types, utils, constants
│   ├── ui/           # React components (shadcn)
│   ├── actions/      # Server actions
│   ├── algorithms/   # Scoring algorithms
│   └── config/       # Shared config
└── docs/
    └── bible/        # Single source of truth
```

## Key Design Decisions

**DECISION-PM-001:** Single unified app for both B2C and B2B
- No separate "platform" app
- Organization features integrated into main app
- Different UI/UX based on user role

**DECISION-PM-002:** Backend-First, API-First approach
- Complete API contract before frontend
- API documentation via Scalar (OpenAPI 3.1)
- Type-safe client generation

**DECISION-PM-003:** Monorepo with Turborepo
- Shared packages for code reuse
- Incremental builds and caching
- Consistent versioning across packages

**T-006:** Argon2id for password hashing (not bcrypt)

**T-009:** Reliability scoring formula:
- Sample Quality: 35%
- Response Quality: 30%
- Method Quality: 20%
- Verification Level: 15%

See [05-TECH/01-architecture.md](../05-TECH/01-architecture.md) for implementation details.

---

## Technology Stack

See [03-tech-stack.md](./03-tech-stack.md) for complete stack.

---

*For detailed architecture, refer to 05-TECH/ section.*
