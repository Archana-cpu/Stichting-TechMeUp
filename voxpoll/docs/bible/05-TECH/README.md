# 05-TECH
> Teknik mimari ve implementasyon detaylari

## Overview
Bu kategori VoxPoll'un "nasil" sorularini yanitlar:
- Tech stack nedir?
- Database schema nasil?
- API nasil tasarlandi?
- Security nasil saglanıyor?

## Files

| File | Content | Status |
|------|---------|--------|
| [01-architecture.md](01-architecture.md) | Tech stack, system design | From bible-002 |
| [02-database-schema.md](02-database-schema.md) | Drizzle schema, relations | From bible-013 |
| [03-api-routes.md](03-api-routes.md) | All API endpoints | From bible-014 |
| [04-api-flows.md](04-api-flows.md) | Role-based API flows | From bible-api-flows |
| [05-security.md](05-security.md) | Auth, GDPR, encryption | From bible-017 |
| [06-configuration.md](06-configuration.md) | Config, i18n, env vars | From bible-023 |
| [07-devops.md](07-devops.md) | CI/CD, deployment | From bible-025 |

## Source References
- **bible-002.md**: Technical Architecture
- **bible-013.md**: Database Schema
- **bible-014.md**: API Contracts
- **bible-017.md**: Security & Compliance
- **bible-023.md**: Configuration, i18n
- **bible-025.md**: DevOps & Infrastructure
- **bible-api-routes.md**: API Routes Reference
- **bible-api-flows.md**: API Flows Reference

## Key Decisions
- T-001: Hono framework
- T-002: Drizzle ORM
- T-003: PostgreSQL
- T-004: Redis cache
- T-005: JWT (jose)
- T-006: Argon2id (NOT bcrypt)
- T-007: CUID2 IDs
- T-008: Pino logging
- T-010: WebSocket + Redis PubSub
- P-035: Rate limiting rules

## Quick Summary

### Tech Stack
| Layer | Technology |
|-------|------------|
| Runtime | Node.js 22+ |
| Framework | Hono |
| Database | PostgreSQL |
| ORM | Drizzle |
| Cache | Redis |
| Auth | JWT (jose) |
| Logging | Pino |
| Email | Resend |
| Payments | Stripe |
| Storage | AWS S3 |
| Search | Meilisearch |

### Database Tables (Core)
- users, accounts, sessions
- polls, poll_options, poll_votes
- surveys, survey_questions, survey_responses
- tests, test_questions, test_results
- organizations, organization_members
- notifications, audit_logs

### API Structure
```
/api/v1/
├── auth/     (register, login, logout, refresh)
├── users/    (profile, settings, devices)
├── polls/    (CRUD, vote, results)
├── surveys/  (CRUD, respond, analytics)
├── tests/    (CRUD, take, results)
├── orgs/     (CRUD, members, roles)
└── ...
```

### Security
- JWT access tokens (15 min)
- Refresh token rotation (7 days)
- HttpOnly cookies
- CORS strict origin
- Rate limiting per endpoint
- Input validation (Zod)

---
*Last Updated: 2026-01-23*
