# Glossary

> **Project**: VoxPoll
> **Purpose**: Define all technical terms, acronyms, and domain-specific vocabulary

---

## Technical Terms

### A

**AAPOR**
- American Association for Public Opinion Research
- Survey methodology standards organization
- Reference: 04-DATA/05-survey-methodology.md

**API Contract**
- Formal specification of all API endpoints
- Defines request/response JSON structures
- NyoWorks PHASE A Step 4 (CRITICAL)
- Location: 05-api/01-api-contract.md

**Argon2id**
- Password hashing algorithm (secure alternative to bcrypt)
- Decision: T-006
- Used for all user passwords

### B

**Bible**
- Single source of truth documentation
- Located in `docs/bible/` directory
- Contains all specifications, flows, and decisions

**Backend First**
- NyoWorks principle: API tests must pass 100% before UI work
- Ensures frozen API for frontend development

### C

**CLI (NyoCLI)**
- Command-line interface for workflow automation
- Tool: `_tools/nyoworksCLI.py`
- Manages tasks, bugs, audit logs

**CLAUDE.md**
- Project-specific rules for Claude Code
- Location: Root directory
- Contains coding standards and communication rules

### D

**Drizzle ORM**
- TypeScript ORM for PostgreSQL
- Used for all database operations
- Schema location: `packages/database/src/schema/`

**DRY**
- Don't Repeat Yourself
- Core principle: zero redundancy in code

### E

**e-Devlet**
- Turkish government identity verification system
- Used for verification level 4 (L4)

**Expo**
- React Native development framework
- Used for mobile app (apps/mobile/)

### F

**FOMO Syndrome**
- Fear of Missing Out
- VoxPoll feature: shows trending polls

**Fraud Detection**
- System to detect bots, duplicate votes, coordinated attacks
- Reference: 04-DATA/04-fraud-detection.md

### G

**Gap**
- Discrepancy between Bible documentation and implementation
- Tracked in: 99-TRACKING/GAPS.md

### H

**Hono**
- Fast, lightweight web framework for API
- Used instead of Express
- Location: packages/api/

**Hybrid Architecture**
- VoxPoll approach: Domain-specific + NyoWorks universal standards
- Compliance: 95%

### I

**i18n**
- Internationalization
- Multi-language support (Turkish, English initially)

### J

**JWT**
- JSON Web Token
- Used for authentication (15min access + 7day refresh)

### L

**Live Poll**
- Real-time polling with WebSocket
- Supports up to 10K concurrent users
- Reference: 03-FEATURES/04-live-polls.md

### M

**Monorepo**
- Single repository containing multiple apps and packages
- Managed by Turborepo

**Multi-Tenancy**
- SaaS architecture where organizations share same app
- Implemented via route groups: (individual), (org), (admin)

### N

**NyoWorks**
- Standardized SaaS development framework
- Version: 4.0 (CLI-Integrated Edition)
- Manifesto: docs/bible/nyoworks-standards-manifesto.md

**NyoCLI**
- Command-line tool for NyoWorks workflow automation
- Reduces AI token consumption
- File: `_tools/nyoworksCLI.py`

### O

**OTP**
- One-Time Password
- Used for 2FA (verification level 3)

**Override**
- Bible hierarchy: 08-AUTHORITATIVE/* overrides all other sources

### P

**PHASE A, B, C**
- NyoWorks 12-Step Iron Workflow phases
- A: Architecture (Bible), B: Backend, C: Frontend

**PM**
- Product Manager
- AI agent role responsible for documentation

**PULSE**
- VoxPoll feature: results + comments system
- Reference: 03-FEATURES/05-pulse-comments.md

### Q

**Quality Score**
- 0-100 score for response quality
- Reference: 04-DATA/02-quality-scoring.md

### R

**RBAC**
- Role-Based Access Control
- Matrix: 09-security/01-rbac-matrix.md

**Reliability Score**
- 0-100 score for content reliability
- Formula: Sample 35% + Response 30% + Method 20% + Verify 15%
- Decision: T-009

**RSC**
- React Server Components
- Default in Next.js App Router

### S

**SaaS**
- Software as a Service
- VoxPoll business model (B2B + B2C)

**shadcn/ui**
- React component library (Radix-based)
- Used for all UI components

**SSO**
- Single Sign-On
- Enterprise feature (SAML 2.0, OIDC)

### T

**Turborepo**
- Monorepo build system
- Manages apps and packages

### U

**Unified App**
- Single app serving all user types
- Decision: DECISION-PM-001
- Route groups: (individual), (org), (admin)

### V

**Verification Levels**
- L0: None (anonymous/new user)
- L1: Email verified
- L2: Phone verified (SMS OTP)
- L3: Identity verified (2FA)
- L4: Government verified (e-Devlet)
- Reference: 02-USERS/04-verification-levels.md

**VoxPoll**
- Project name: Voice of the People Poll
- Turkey's most reliable polling platform

### W

**WebSocket**
- Protocol for real-time communication
- Used for live polls

### Y

**YAML Frontmatter**
- Metadata format for tasks
- Example:
```yaml
---
id: TASK-20260129-001
priority: P0
status: IN_PROGRESS
---
```

### Z

**Zod**
- TypeScript schema validation library
- Used for all API input validation

---

## Domain-Specific Terms

### Content Types

**Poll**
- Single-question voting (P-001)
- Public or private
- Multiple choice or ranking

**Survey**
- Multi-question assessment
- Used by organizations (B2B)
- Supports logic branching

**Test**
- Personality/knowledge assessment
- Has scoring algorithm
- Provides results interpretation

**Pre-Test**
- Screening questions before main survey
- Decision: P-007, P-030

**Live Poll**
- Real-time audience polling
- Requires code to join
- WebSocket-based

### User Types

**Individual User**
- B2C customer (Free/Plus/Premium)
- Routes: (individual)/*

**Organization User**
- B2B customer (STARTER/PROFESSIONAL/ENTERPRISE)
- Routes: (org)/[slug]/*
- Roles: OWNER, ADMIN, MANAGER, ANALYST, CREATOR, MEMBER

**Platform Admin**
- VoxPoll internal team
- Routes: (admin)/*
- Full system access

### Subscription Tiers

**B2C Individual**
- Free: Basic features
- Plus: $4.99/month
- Premium: $9.99/month

**B2B Organization**
- STARTER: $99/month
- PROFESSIONAL: $299/month
- ENTERPRISE: $999/month
- CUSTOM: Custom pricing

---

## Acronym Reference

| Acronym | Full Form | Context |
|---------|-----------|---------|
| AAPOR | American Association for Public Opinion Research | Survey standards |
| API | Application Programming Interface | Backend endpoints |
| B2B | Business to Business | Organization customers |
| B2C | Business to Consumer | Individual users |
| CDN | Content Delivery Network | CloudFront |
| CI/CD | Continuous Integration/Deployment | GitHub Actions |
| CLI | Command-Line Interface | NyoCLI tool |
| CSS | Cascading Style Sheets | Tailwind |
| DRY | Don't Repeat Yourself | Code principle |
| E2E | End-to-End | Playwright tests |
| JWT | JSON Web Token | Authentication |
| MVP | Minimum Viable Product | v1.0.0 target |
| ORM | Object-Relational Mapping | Drizzle |
| OTP | One-Time Password | 2FA |
| PM | Product Manager | AI agent role |
| RBAC | Role-Based Access Control | Permission system |
| REST | Representational State Transfer | API architecture |
| RSC | React Server Components | Next.js feature |
| SaaS | Software as a Service | Business model |
| SQL | Structured Query Language | PostgreSQL |
| SSO | Single Sign-On | Enterprise auth |
| UI/UX | User Interface/Experience | Design |
| WCAG | Web Content Accessibility Guidelines | A11y standards |
| YAML | YAML Ain't Markup Language | Config format |

---

## Decision IDs

### Product Decisions (P-xxx)

| ID | Decision | Reference |
|----|----------|-----------|
| P-001 | Every poll has exactly one question | 03-FEATURES/01-polls.md |
| P-003 | Reliability score 0-100 | 04-DATA/03-reliability-scoring.md |
| P-004 | Verification levels 0-4 | 02-USERS/04-verification-levels.md |
| P-007 | Pre-test feature | 03-FEATURES/02-surveys.md |
| P-030 | Pre-test is optional | 03-FEATURES/02-surveys.md |
| P-057 | Device fingerprinting required | 04-DATA/04-fraud-detection.md |
| P-058 | Rate limiting per endpoint | 05-api/01-api-contract.md |
| P-059 | Error message sanitization | 05-TECH/06-security.md |

### Technical Decisions (T-xxx)

| ID | Decision | Reference |
|----|----------|-----------|
| T-006 | Use Argon2id (NOT bcrypt) | 05-TECH/06-security.md |
| T-009 | Reliability formula: 35+30+20+15 | 04-DATA/03-reliability-scoring.md |

### PM Decisions (DECISION-PM-xxx)

| ID | Decision | Reference |
|----|----------|-----------|
| DECISION-PM-001 | Unified app architecture | 05-TECH/01-architecture.md |
| DECISION-PM-002 | Same app, separate screens only | 11-audit/PM-2026-01-29.md |
| DECISION-PM-003 | Unified app confirmed | 11-audit/PM-2026-01-29.md |

---

*This glossary is continuously updated as the project evolves.*
*Last updated: 2026-01-29 by Product Manager*
