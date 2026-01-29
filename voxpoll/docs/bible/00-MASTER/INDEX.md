# ═══════════════════════════════════════════════════════════════════════════════
# VOXPOLL PROJECT BIBLE - MASTER INDEX
# ═══════════════════════════════════════════════════════════════════════════════
# Version: 3.0 (NyoWorks Compliant) | Last Updated: 2026-01-29
# ═══════════════════════════════════════════════════════════════════════════════

## Quick Navigation

| Category | Purpose | Key Files | Standard |
|----------|---------|-----------|----------|
| [01-VISION](#01-vision) | Why: Mission, principles | executive-summary, product-principles | VoxPoll |
| [02-APPS](#02-apps) | Applications: Web, mobile, desktop | web-app, mobile-app | NyoWorks |
| [02-USERS](#02-users-voxpoll) | Who: Roles, permissions, verification | user-types, org-roles, verification | VoxPoll |
| [03-FEATURES](#03-features) | What: Feature specifications | polls, surveys, tests, live, social | VoxPoll |
| [04-DATA](#04-data) | Data: Quality, methodology, fraud | quality, reliability, methodology | VoxPoll |
| [05-API](#05-api) | API: Contract, endpoints | api-contract | NyoWorks |
| [05-TECH](#05-tech-voxpoll) | How: Architecture, database, security | architecture, database, api, security | VoxPoll |
| [06-UX](#06-ux) | UX: Flows, UI specs | user-flows, ui-specs, accessibility | VoxPoll |
| [07-TESTING](#07-testing) | Testing: Strategy, plans | test-plan | NyoWorks |
| [07-EDGE](#07-edge-voxpoll) | Edge: Cases, business rules | edge-cases, failure-modes, rules | VoxPoll |
| [08-DEPLOYMENT](#08-deployment) | Deployment: Infrastructure, CI/CD | infrastructure | NyoWorks |
| [08-AUTHORITATIVE](#08-authoritative-voxpoll) | Override: Final decisions | types, critical-fixes, decisions | VoxPoll |
| [09-SECURITY](#09-security) | Security: RBAC, auth | rbac-matrix | NyoWorks |
| [10-LOGS](#10-logs) | Logs: Tasks, bugs, research | tasks-active, tasks-completed | NyoWorks |
| [11-AUDIT](#11-audit) | Audit: Daily activity logs | PM-DATE, DEV-DATE | NyoWorks |
| [98-BACKLOG](#98-backlog) | Backlog: Future features | future-features | NyoWorks |
| [99-TRACKING](#99-tracking-voxpoll) | Tracking: Gaps, status | gaps, implementation-status | VoxPoll |

---

## 01-VISION
> **Purpose**: Projenin varoluş amacı, misyonu ve temel prensipleri

| File | Content | Source |
|------|---------|--------|
| [01-executive-summary.md](../01-VISION/01-executive-summary.md) | Mission, problem statement, market position | bible-001 |
| [02-product-principles.md](../01-VISION/02-product-principles.md) | Core principles, design philosophy | bible-001 |

---

## 02-APPS
> **Purpose**: Application specifications (NyoWorks)

| File | Content | Standard |
|------|---------|----------|
| [01-web-app.md](../02-apps/01-web-app.md) | Next.js 16, React 19.1, Tailwind 4 specs | NyoWorks |
| [02-mobile-app.md](../02-apps/02-mobile-app.md) | React Native + Expo specs | NyoWorks |

---

## 02-USERS (VoxPoll)
> **Purpose**: Kullanici tipleri, roller, izinler ve dogrulama seviyeleri

| File | Content | Source |
|------|---------|--------|
| [01-user-types.md](../02-USERS/01-user-types.md) | B2C: Free/Plus/Premium tiers | bible-005 |
| [02-organization-roles.md](../02-USERS/02-organization-roles.md) | B2B: Owner/Admin/Creator/Analyst/Member | bible-005 |
| [03-platform-roles.md](../02-USERS/03-platform-roles.md) | Admin, Moderator, Support | bible-005 |
| [04-verification-levels.md](../02-USERS/04-verification-levels.md) | Level 0-4, e-Devlet integration | bible-005 |

---

## 03-FEATURES
> **Purpose**: Tum ozellikler ve is mantiklari

| File | Content | Source |
|------|---------|--------|
| [01-polls.md](../03-FEATURES/01-polls.md) | Poll creation, voting, results | bible-006 |
| [02-surveys.md](../03-FEATURES/02-surveys.md) | B2B survey system | bible-006, bible-019, bible-020 |
| [03-tests.md](../03-FEATURES/03-tests.md) | Personality tests, scoring | bible-006 |
| [04-live-polls.md](../03-FEATURES/04-live-polls.md) | Real-time WebSocket polling | bible-006 |
| [05-pulse-comments.md](../03-FEATURES/05-pulse-comments.md) | PULSE results + discussions | bible-010 |
| [06-feed-discovery.md](../03-FEATURES/06-feed-discovery.md) | Feed algorithm, trending | bible-011 |
| [07-notifications.md](../03-FEATURES/07-notifications.md) | Notification system | bible-012 |
| [08-social.md](../03-FEATURES/08-social.md) | Follow, DM, Block | bible-005 |
| [09-payments.md](../03-FEATURES/09-payments.md) | Stripe, subscriptions | bible-024 |

---

## 04-DATA
> **Purpose**: Veri kalitesi, guvenilirlik ve metodoloji

| File | Content | Source |
|------|---------|--------|
| [01-response-collection.md](../04-DATA/01-response-collection.md) | Data collection rules | bible-007 |
| [02-quality-scoring.md](../04-DATA/02-quality-scoring.md) | Response quality metrics | bible-003 |
| [03-reliability-scoring.md](../04-DATA/03-reliability-scoring.md) | Content reliability (0-100) | bible-004 |
| [04-fraud-detection.md](../04-DATA/04-fraud-detection.md) | Bot & fraud prevention | bible-009 |
| [05-survey-methodology.md](../04-DATA/05-survey-methodology.md) | Academic methodology, AAPOR | bible-003, bible-019 |

---

## 05-API
> **Purpose**: API Contract (NyoWorks PHASE A Step 4 - CRITICAL)

| File | Content | Standard |
|------|---------|----------|
| [01-api-contract.md](../05-api/01-api-contract.md) | 155 endpoints, auth, rate limits, Bible refs | NyoWorks |

---

## 05-TECH (VoxPoll)
> **Purpose**: Teknik mimari ve implementasyon detaylari

| File | Content | Source |
|------|---------|--------|
| [01-architecture.md](../05-TECH/01-architecture.md) | Tech stack, system design | bible-002 |
| [02-database-schema.md](../05-TECH/02-database-schema.md) | Drizzle schema, relations | bible-013 |
| [03-database-migration-workflow.md](../05-TECH/03-database-migration-workflow.md) | Drizzle migrations, commands | Native |
| [04-api-routes.md](../05-TECH/04-api-routes.md) | All API endpoints | bible-014, bible-api-routes |
| [05-api-flows.md](../05-TECH/05-api-flows.md) | Role-based API flows | bible-api-flows |
| [06-security.md](../05-TECH/06-security.md) | Auth, GDPR, encryption | bible-017 |
| [07-configuration.md](../05-TECH/07-configuration.md) | Config, i18n, env vars | bible-023 |
| [08-devops.md](../05-TECH/08-devops.md) | CI/CD, deployment | bible-025 |

---

## 06-UX
> **Purpose**: Kullanici deneyimi ve arayuz

| File | Content | Source |
|------|---------|--------|
| [01-user-flows.md](../06-UX/01-user-flows.md) | All user journeys | bible-022 |
| [02-ui-specifications.md](../06-UX/02-ui-specifications.md) | UI specs, components | bible-026, bible-frontend-ui |
| [03-error-states.md](../06-UX/03-error-states.md) | Error handling UX | bible-016 |
| [04-accessibility.md](../06-UX/04-accessibility.md) | WCAG, a11y standards | bible-026 |
| [05-frontend-architecture.md](../06-UX/05-frontend-architecture.md) | Next.js 16 + React 19 + Tailwind 4 + shadcn/ui rules | Native |
| [06-design-themes.md](../06-UX/06-design-themes.md) | 4 themes (Minimal/Soft/Corporate/Vibrant) + fonts + effects | Native |

---

## 07-TESTING
> **Purpose**: Test strategy and coverage (NyoWorks)

| File | Content | Standard |
|------|---------|----------|
| [01-test-plan.md](../07-testing/01-test-plan.md) | Test pyramid, Bible compliance tests, coverage targets | NyoWorks |

---

## 07-EDGE (VoxPoll)
> **Purpose**: Edge case'ler, hata modlari ve is kurallari

| File | Content | Source |
|------|---------|--------|
| [01-edge-cases.md](../07-EDGE/01-edge-cases.md) | All edge cases | bible-016 |
| [02-failure-modes.md](../07-EDGE/02-failure-modes.md) | Resilience patterns | bible-027 |
| [03-business-rules.md](../07-EDGE/03-business-rules.md) | Business logic rules | bible-015 |

---

## 08-DEPLOYMENT
> **Purpose**: Infrastructure and deployment (NyoWorks)

| File | Content | Standard |
|------|---------|----------|
| [01-infrastructure.md](../08-deployment/01-infrastructure.md) | AWS ECS, RDS, Redis, S3, CI/CD pipeline | NyoWorks |

---

## 08-AUTHORITATIVE (VoxPoll)
> **Purpose**: Override eden son kararlar (bu dosyalar diger tum kaynaklari gecersiz kilar)

| File | Content | Source |
|------|---------|--------|
| [types.md](../08-AUTHORITATIVE/types.md) | Unified type definitions | bible-030 |
| [critical-fixes.md](../08-AUTHORITATIVE/critical-fixes.md) | Implementation critical fixes | bible-028 |
| [final-decisions.md](../08-AUTHORITATIVE/final-decisions.md) | Final clarifications | bible-031 |

---

## 09-SECURITY
> **Purpose**: Security and access control (NyoWorks)

| File | Content | Standard |
|------|---------|----------|
| [01-rbac-matrix.md](../09-security/01-rbac-matrix.md) | Role hierarchy, permission matrix, verification levels | NyoWorks |

---

## 10-LOGS
> **Purpose**: Task management and coordination (NyoWorks)

| File | Content | Standard |
|------|---------|----------|
| [tasks-active.md](../10-logs/tasks-active.md) | Active tasks (YAML format) | NyoWorks |
| [tasks-completed.md](../10-logs/tasks-completed.md) | Completed tasks archive | NyoWorks |
| [research-findings.md](../10-logs/research-findings.md) | Research outcomes | NyoWorks |
| [test-failures.md](../10-logs/test-failures.md) | Failed tests tracking | NyoWorks |
| [bugs-discovered.md](../10-logs/bugs-discovered.md) | Bug reports | NyoWorks |

---

## 11-AUDIT
> **Purpose**: Daily activity logs per role (NyoWorks)

| File | Content | Standard |
|------|---------|----------|
| [PM-2026-01-29.md](../11-audit/PM-2026-01-29.md) | Product Manager daily log (example) | NyoWorks |
| *[ROLE]-[DATE].md* | Each agent creates daily log in format ROLE-DATE.md | NyoWorks |

---

## 98-BACKLOG
> **Purpose**: Future features and roadmap (NyoWorks)

| File | Content | Standard |
|------|---------|----------|
| [01-future-features.md](../98-backlog/01-future-features.md) | Product roadmap, P1-P4 features | NyoWorks |

---

## 99-TRACKING (VoxPoll)
> **Purpose**: Dinamik takip dosyalari (duzenlenir, guncellenir)

| File | Content | Purpose |
|------|---------|---------|
| [AUDIT_CHANGELOG.md](../99-TRACKING/AUDIT_CHANGELOG.md) | All audits & changes | Her denetim buraya kaydedilir |
| [GAPS.md](../99-TRACKING/GAPS.md) | Known gaps & fixes | Eksikler ve cozumleri |
| [IMPLEMENTATION_STATUS.md](../99-TRACKING/IMPLEMENTATION_STATUS.md) | Backend/Frontend status | Hangi feature ne durumda |
| [CLAUDE_RULES.md](../99-TRACKING/CLAUDE_RULES.md) | Claude Code bible rules | Claude icin calisma kurallari |

---

## Bible Hierarchy (Override Order)

```
1. 08-AUTHORITATIVE/*     <- EN YUKSEK ONCELIK (override eder - VoxPoll)
2. 00-MASTER/DECISIONS.md <- Tum P-xxx, T-xxx kararlari
3. Feature-specific file  <- Ilgili ozellik dosyasi (VoxPoll or NyoWorks)
4. 99-TRACKING/GAPS.md    <- Bilinen sorunlar/cozumler (VoxPoll)
5. _archive/*             <- Eski dosyalar (sadece referans)
```

## NyoWorks Compliance

**Version**: 3.0 (Hybrid: VoxPoll Domain + NyoWorks Standards)
**Compliance Date**: 2026-01-29
**Migration Status**: COMPLETED

**Key Changes:**
- Added NyoWorks Universal Bible Structure sections (02-apps, 05-api, 07-testing, 08-deployment, 09-security, 10-logs, 11-audit, 98-backlog)
- Preserved VoxPoll domain-specific sections (07-EDGE, 08-AUTHORITATIVE)
- Migrated task coordination from AGENT_COORDINATION.md to 10-logs/tasks-active.md (NyoWorks YAML format)
- Created API Contract (PHASE A Step 4 - CRITICAL)
- Established role-based audit logs (11-audit/[ROLE]-[DATE].md)

**Compliance Rate**: 100% (all NyoWorks mandatory sections present)

---

## Source Mapping (Eski -> Yeni)

| Old File | New Location | Status |
|----------|--------------|--------|
| bible-000.md | 00-MASTER/INDEX.md | Migrated |
| bible-001.md | 01-VISION/* | Migrated |
| bible-002.md | 05-TECH/01-architecture.md | Migrated |
| bible-003.md | 04-DATA/02-quality-scoring.md, 05-survey-methodology.md | Migrated |
| bible-004.md | 04-DATA/03-reliability-scoring.md | Migrated |
| bible-005.md | 02-USERS/* | Migrated |
| bible-006.md | 03-FEATURES/01-polls.md, 02-surveys.md, 03-tests.md | Migrated |
| bible-007.md | 04-DATA/01-response-collection.md | Migrated |
| bible-008.md | 04-DATA/03-reliability-scoring.md (analytics integrated) | Migrated |
| bible-009.md | 04-DATA/04-fraud-detection.md | Migrated |
| bible-010.md | 03-FEATURES/05-pulse-comments.md | Migrated |
| bible-011.md | 03-FEATURES/06-feed-discovery.md | Migrated |
| bible-012.md | 03-FEATURES/07-notifications.md | Migrated |
| bible-013.md | 05-TECH/02-database-schema.md | Migrated |
| bible-014.md | 05-TECH/03-api-routes.md | Migrated |
| bible-015.md | 07-EDGE/03-business-rules.md | Migrated |
| bible-016.md | 07-EDGE/01-edge-cases.md, 06-UX/03-error-states.md | Migrated |
| bible-017.md | 05-TECH/05-security.md | Migrated |
| bible-018.md | 05-TECH/07-devops.md (testing integrated) | Migrated |
| bible-019.md | 04-DATA/05-survey-methodology.md | Migrated |
| bible-020.md | 03-FEATURES/02-surveys.md (enterprise) | Migrated |
| bible-021.md | 03-FEATURES/04-live-polls.md (link participation integrated) | Migrated |
| bible-022.md | 06-UX/01-user-flows.md | Migrated |
| bible-023.md | 05-TECH/06-configuration.md | Migrated |
| bible-024.md | 03-FEATURES/09-payments.md | Migrated |
| bible-025.md | 05-TECH/07-devops.md | Migrated |
| bible-026.md | 06-UX/02-ui-specifications.md | Migrated |
| bible-027.md | 07-EDGE/02-failure-modes.md | Migrated |
| bible-028.md | 08-AUTHORITATIVE/critical-fixes.md | Migrated |
| bible-029.md | 08-AUTHORITATIVE/pre-launch.md | Migrated |
| bible-030.md | 08-AUTHORITATIVE/types.md | Migrated |
| bible-031.md | 08-AUTHORITATIVE/final-decisions.md | Migrated |

---

## How to Use This Bible

### For Development:
1. Feature implement etmeden once ilgili section'i oku
2. 08-AUTHORITATIVE kontrol et (override olabilir)
3. GAPS.md'de bilinen sorun var mi bak
4. Kod yazarken bible ile uyumu kontrol et

### For Review:
1. Her PR'da degisikligin ilgili bible section'i ile uyumunu kontrol et
2. Uyumsuzluk varsa GAPS.md'ye kaydet
3. Duzeltme yapilinca AUDIT_CHANGELOG.md'ye not et

### For Claude:
1. Her islemde once 99-TRACKING/CLAUDE_RULES.md oku
2. Kod degisikligi yapinca ilgili bible section'i kontrol et
3. Uyumsuzluk tespit edince GAPS.md'ye yaz
4. Her oturum sonunda AUDIT_CHANGELOG.md guncelle

---

# ═══════════════════════════════════════════════════════════════════════════════
# END OF MASTER INDEX
# ═══════════════════════════════════════════════════════════════════════════════
