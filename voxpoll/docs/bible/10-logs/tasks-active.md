# Active Tasks

> NyoWorks Task Management System
> Last Updated: 2026-01-29

---

## TASK-005: Bible Flow Test Coverage (Wave 1: P0 + P1)

```yaml
---
id: TASK-005
title: Bible Flow Test Coverage (Wave 1 - P0 + P1)
priority: P0
status: IN_PROGRESS
claimed_by: Claude TESTER 1 (Senior SaaS Tester)
claimed_at: 2026-01-27 22:22
dependencies: []
estimated_effort: large
tags: [testing, bible-compliance, security, core-features]
bible_refs: [P-057, P-058, P-059, T-009]
expected_completion: 2026-01-28 23:59
---
```

### Description

Comprehensive test coverage for VoxPoll Bible compliance, focusing on critical security and core feature flows.

**Scope:**
- P0 Security: 8 test suites (~180 test cases)
- P1 Core Features: 12 test suites (~250 test cases)
- Target: 100% Bible compliance verification

### Acceptance Criteria

- [ ] All P0 security test suites implemented (8/8)
- [ ] All P1 core feature test suites implemented (12/12)
- [ ] Test coverage for P-057 (Device Fingerprinting)
- [ ] Test coverage for P-058 (Rate Limiting)
- [ ] Test coverage for P-059 (Error Sanitization)
- [ ] Test coverage for T-009 (Reliability Scoring)
- [ ] All tests passing
- [ ] Code coverage >80%
- [ ] Test execution documented in TEST_MASTER_PLAN.md

### Files Affected

- `docs/bible/99-TRACKING/TEST_MASTER_PLAN.md` (created - test strategy)
- `packages/api/src/test/*.test.ts` (20 new test suites planned)
- `docs/bible/99-TRACKING/GAPS.md` (will update as gaps found)
- `docs/bible/99-TRACKING/AUDIT_CHANGELOG.md` (will update per test suite)

### Progress Log

- **2026-01-27 22:22**: Task claimed by Claude TESTER 1
- **2026-01-27 22:30**: TEST_MASTER_PLAN.md created with comprehensive test strategy
- **Status**: Test suite implementation in progress

### Technical Notes

**P0 Security Test Suites (8):**
1. Authentication flow tests
2. Authorization/RBAC tests
3. Rate limiting tests (P-058)
4. Device fingerprinting tests (P-057)
5. Error sanitization tests (P-059)
6. Fraud detection tests
7. OTP verification tests
8. Session management tests

**P1 Core Feature Test Suites (12):**
1. Poll creation tests
2. Poll voting tests
3. Poll results tests
4. Survey creation tests
5. Pre-test flow tests
6. Live poll tests
7. Reliability scoring tests (T-009)
8. User profile tests
9. Notification tests
10. Analytics tests
11. Payment/subscription tests
12. Admin dashboard tests

---

## TASK-007: Profile Visits Routes Implementation

```yaml
---
id: TASK-007
title: Profile Visits Routes Implementation (TypeScript Fix)
priority: P2
status: AVAILABLE
claimed_by: null
claimed_at: null
dependencies: []
estimated_effort: small
tags: [backend, social, typescript-fix, routes]
bible_refs: [03-FEATURES/08-social.md]
expected_completion: 2026-01-30
---
```

### Description

Complete Profile Visits feature by implementing routes and controllers. Schema and service already exist but TypeScript workspace link issue blocks route integration.

**Scope:**
- Fix TypeScript workspace dependency issue
- Implement routes in users.ts
- Implement controller methods in user.controller.ts
- Write integration tests
- Validate tier-based access (FREE: none, PLUS: 7 days, PREMIUM: 30 days + anonymous)

### Acceptance Criteria

- [ ] TypeScript build error resolved
- [ ] GET /users/me/profile-visits route implemented
- [ ] GET /users/:username/visitors route implemented (PLUS/PREMIUM only)
- [ ] POST /users/:username/visit route implemented
- [ ] Tier-based access enforced correctly
- [ ] Anonymous visit tracking works (PREMIUM only)
- [ ] Integration tests passing
- [ ] Bible compliance verified

### Files Affected

- `packages/api/src/routes/users.ts` (add routes)
- `packages/api/src/controllers/user.controller.ts` (add methods)
- `packages/api/src/test/profile-visits.test.ts` (new)

### Technical Notes

**Existing Work:**
- Schema: profileVisits table in analytics.ts ✅
- Service: profilevisit.service.ts with all logic ✅
- Enums: profileVisitSourceEnum ✅

**Pending:**
- Routes integration (blocked by TypeScript workspace issue)
- Controller methods
- Tests

**Fix Strategy:**
1. Run `pnpm install` in workspace root
2. Restart TypeScript server
3. Verify `@voxpoll/database` types resolve
4. Add routes and controller methods
5. Test tier-based access

---

## TASK-008: Badge System Implementation

```yaml
---
id: TASK-008
title: Badge System Implementation
priority: P2
status: AVAILABLE
claimed_by: null
claimed_at: null
dependencies: []
estimated_effort: large
tags: [backend, gamification, badges, social]
bible_refs: [03-FEATURES/09-gamification.md]
expected_completion: 2026-02-05
---
```

### Description

Implement gamification badge system for personality tests, achievements, and milestones.

**Scope:**
- Badge schema (database)
- Badge definitions (personality types, achievements)
- Badge awarding logic (automatic triggers)
- Badge visibility and sharing
- Shareable badge cards (image generation)

### Acceptance Criteria

- [ ] Database schema: badges, userBadges tables
- [ ] Badge type enums defined (PERSONALITY, ACHIEVEMENT, MILESTONE)
- [ ] Personality test badges (16 types based on test results)
- [ ] Achievement badges (First Poll, 100 Votes, Verified, etc.)
- [ ] Badge awarding service with trigger system
- [ ] Badge visibility settings (public, followers, private)
- [ ] Shareable badge card generation (SVG/PNG)
- [ ] GET /users/:username/badges endpoint
- [ ] Badge display in user profile
- [ ] Integration tests
- [ ] Bible compliance verified

### Files Affected

- `packages/database/src/db/schema/gamification.ts` (new tables)
- `packages/database/src/db/schema/enums.ts` (badge enums)
- `packages/api/src/services/gamification.service.ts` (new)
- `packages/api/src/services/badge.service.ts` (new)
- `packages/api/src/routes/users.ts` (badge routes)
- `packages/api/src/controllers/user.controller.ts` (badge methods)
- `packages/api/src/test/badges.test.ts` (new)

### Technical Notes

**Badge Categories:**
1. **Personality Badges** (16 types based on test results)
2. **Achievement Badges** (poll creation, voting milestones)
3. **Verification Badges** (Level 2, 3, 4 verification)
4. **Social Badges** (followers, engagement)
5. **Creator Badges** (poll quality, response rates)

**Trigger Events:**
- Test completion → Personality badge
- Poll creation → Creator badge
- Verification upgrade → Verification badge
- Follower milestone → Social badge

---

## TASK-009: Admin Dashboard APIs

```yaml
---
id: TASK-009
title: Admin Dashboard APIs Implementation
priority: P2
status: AVAILABLE
claimed_by: null
claimed_at: null
dependencies: []
estimated_effort: large
tags: [backend, admin, moderation, analytics]
bible_refs: [07-EDGE/03-business-rules.md, 09-security/01-rbac-matrix.md]
expected_completion: 2026-02-07
---
```

### Description

Implement admin dashboard APIs for platform analytics, user management, content moderation, and feature flags.

**Scope:**
- Platform analytics (users, polls, revenue)
- User management (search, ban, tier changes)
- Content moderation queue
- Feature flags system
- Audit logs

### Acceptance Criteria

- [ ] GET /admin/analytics endpoint (platform metrics)
- [ ] GET /admin/users endpoint (user search and management)
- [ ] PATCH /admin/users/:id endpoint (user actions: ban, tier change)
- [ ] GET /admin/moderation/queue endpoint (flagged content)
- [ ] POST /admin/moderation/:id/action endpoint (approve/reject/delete)
- [ ] GET /admin/feature-flags endpoint
- [ ] PATCH /admin/feature-flags/:key endpoint
- [ ] GET /admin/audit-logs endpoint
- [ ] ADMIN role enforcement (requireRole middleware)
- [ ] Rate limiting for admin endpoints
- [ ] Integration tests
- [ ] Bible compliance verified

### Files Affected

- `packages/api/src/routes/admin.ts` (new)
- `packages/api/src/controllers/admin.controller.ts` (new)
- `packages/api/src/services/admin.service.ts` (new)
- `packages/api/src/services/moderation.service.ts` (enhance)
- `packages/database/src/db/schema/admin.ts` (new - feature flags, audit logs)
- `packages/api/src/middleware/rbac.ts` (requireRole enhancement)
- `packages/api/src/test/admin.test.ts` (new)

### Technical Notes

**Admin Analytics Metrics:**
- Total users by tier (FREE/PLUS/PREMIUM)
- New signups (daily/weekly/monthly)
- Active users (DAU/WAU/MAU)
- Total polls/surveys/tests
- Revenue (MRR, churn rate)
- Top creators
- Fraud detection stats

**Moderation Queue:**
- Flagged content (polls, comments, profiles)
- Fraud detection alerts (>50 score)
- User reports
- Priority sorting

**Feature Flags:**
- Key-value store in database
- Global toggles (maintenance mode, new features)
- Per-tier toggles (beta features)
- A/B testing flags

---

## TASK-010: Advanced Analytics APIs

```yaml
---
id: TASK-010
title: Advanced Analytics APIs
priority: P2
status: AVAILABLE
claimed_by: null
claimed_at: null
dependencies: []
estimated_effort: large
tags: [backend, analytics, data-export]
bible_refs: [03-FEATURES/06-analytics.md, 04-DATA]
expected_completion: 2026-02-10
---
```

### Description

Implement advanced analytics dashboard for poll creators with demographic breakdowns, time series data, and export functionality.

**Scope:**
- Poll/survey analytics dashboard data
- Demographic breakdowns
- Time series vote data
- Response quality analytics
- Export (CSV, XLSX, JSON)

### Acceptance Criteria

- [ ] GET /polls/:id/analytics endpoint (comprehensive metrics)
- [ ] GET /polls/:id/analytics/demographics endpoint
- [ ] GET /polls/:id/analytics/time-series endpoint
- [ ] GET /polls/:id/analytics/quality endpoint
- [ ] POST /polls/:id/export endpoint (CSV/XLSX/JSON)
- [ ] Verification level breakdown
- [ ] Geographic breakdown (if data available)
- [ ] Response quality distribution
- [ ] Time-to-vote analysis
- [ ] Reliability score details
- [ ] Export format validation
- [ ] PREMIUM tier requirement for advanced features
- [ ] Integration tests
- [ ] Bible compliance verified

### Files Affected

- `packages/api/src/services/analytics.service.ts` (enhance)
- `packages/api/src/controllers/poll.controller.ts` (analytics methods)
- `packages/api/src/routes/polls.ts` (analytics routes)
- `packages/api/src/lib/export.ts` (new - CSV/XLSX generation)
- `packages/api/src/test/analytics.test.ts` (new)

### Technical Notes

**Analytics Metrics:**
- Total votes/responses
- Completion rate
- Average time to complete
- Demographic breakdowns (age, gender, location)
- Verification level distribution
- Response quality distribution
- Reliability score components
- Fraud detection pass rate

**Time Series:**
- Votes per hour/day/week
- Response rate over time
- Demographic shifts over time
- Quality trends

**Export Formats:**
- CSV: Simple tabular data
- XLSX: Multiple sheets (overview, responses, demographics)
- JSON: Raw structured data

---

## TASK-011: Phone OTP Verification

```yaml
---
id: TASK-011
title: Phone OTP Verification System
priority: P3
status: AVAILABLE
claimed_by: null
claimed_at: null
dependencies: []
estimated_effort: medium
tags: [backend, auth, verification, sms]
bible_refs: [02-USERS/04-verification-levels.md]
expected_completion: 2026-02-12
---
```

### Description

Implement phone OTP verification for Level 1 verification upgrade.

**Scope:**
- SMS OTP sending (via Twilio or similar)
- 6-digit code generation
- 10-minute expiry
- Rate limiting (max 3 requests per hour)
- Level 1 verification upgrade on success

### Acceptance Criteria

- [ ] POST /auth/phone/send-otp endpoint
- [ ] POST /auth/phone/verify-otp endpoint
- [ ] 6-digit numeric code generation
- [ ] SMS sending via provider (Twilio/AWS SNS)
- [ ] OTP expiry (10 minutes)
- [ ] Rate limiting (3 attempts per hour per phone)
- [ ] Phone number validation (E.164 format)
- [ ] Duplicate phone number prevention
- [ ] Auto-upgrade to Level 1 on verification
- [ ] OTP attempts table (tracking)
- [ ] Integration tests (mock SMS provider)
- [ ] Bible compliance verified

### Files Affected

- `packages/api/src/services/verification.service.ts` (new)
- `packages/api/src/routes/auth.ts` (phone OTP routes)
- `packages/api/src/controllers/auth.controller.ts` (phone methods)
- `packages/database/src/db/schema/users.ts` (phone, phoneVerified fields)
- `packages/database/src/db/schema/verification.ts` (otpAttempts table)
- `packages/api/src/lib/sms.ts` (new - SMS provider integration)
- `packages/api/src/test/phone-otp.test.ts` (new)

### Technical Notes

**Security:**
- Rate limit: 3 OTP requests per hour per phone
- OTP expiry: 10 minutes
- Max 3 verification attempts per OTP
- Account lockout after 5 failed attempts (1 hour)

**SMS Provider Options:**
- Twilio (recommended)
- AWS SNS
- Vonage

---

## TASK-012: Magic Link Authentication

```yaml
---
id: TASK-012
title: Magic Link Authentication
priority: P3
status: AVAILABLE
claimed_by: null
claimed_at: null
dependencies: []
estimated_effort: medium
tags: [backend, auth, passwordless]
bible_refs: [02-USERS/01-user-types.md, 05-TECH/06-security.md]
expected_completion: 2026-02-14
---
```

### Description

Implement passwordless magic link authentication for easier login.

**Scope:**
- Magic link generation (secure token)
- Email sending
- Token validation
- Single-use enforcement
- 15-minute expiry

### Acceptance Criteria

- [ ] POST /auth/magic-link/send endpoint
- [ ] GET /auth/magic-link/verify?token=xxx endpoint
- [ ] Secure token generation (crypto.randomBytes)
- [ ] Email template (magic link email)
- [ ] Token expiry (15 minutes)
- [ ] Single-use token enforcement
- [ ] Rate limiting (3 requests per hour per email)
- [ ] Auto-login on verification
- [ ] Magic link tokens table
- [ ] Integration tests
- [ ] Bible compliance verified

### Files Affected

- `packages/api/src/services/auth.service.ts` (magic link methods)
- `packages/api/src/routes/auth.ts` (magic link routes)
- `packages/api/src/controllers/auth.controller.ts` (magic link methods)
- `packages/database/src/db/schema/auth.ts` (magicLinkTokens table)
- `packages/api/src/lib/email.ts` (magic link template)
- `packages/api/src/test/magic-link.test.ts` (new)

### Technical Notes

**Token Security:**
- 32-byte random token (hex encoded)
- Stored as SHA256 hash in database
- Single-use only (deleted after verification)
- 15-minute expiry
- Rate limit: 3 per hour per email

---

## TASK-013: Passkey/WebAuthn Support

```yaml
---
id: TASK-013
title: Passkey/WebAuthn Authentication
priority: P3
status: AVAILABLE
claimed_by: null
claimed_at: null
dependencies: []
estimated_effort: large
tags: [backend, auth, webauthn, biometric]
bible_refs: [02-USERS/04-verification-levels.md, 05-TECH/06-security.md]
expected_completion: 2026-02-20
---
```

### Description

Implement passwordless authentication using WebAuthn/Passkeys for enhanced security and UX.

**Scope:**
- WebAuthn registration (credential creation)
- WebAuthn authentication
- Multiple passkeys per user
- Passkey management (rename, delete)
- Level 2 verification upgrade

### Acceptance Criteria

- [ ] POST /auth/passkey/register/options endpoint (challenge generation)
- [ ] POST /auth/passkey/register endpoint (credential verification)
- [ ] POST /auth/passkey/login/options endpoint (assertion challenge)
- [ ] POST /auth/passkey/login endpoint (assertion verification)
- [ ] GET /users/me/passkeys endpoint (list passkeys)
- [ ] PATCH /users/me/passkeys/:id endpoint (rename)
- [ ] DELETE /users/me/passkeys/:id endpoint (delete)
- [ ] Multiple passkeys per user support
- [ ] Auto-upgrade to Level 2 on passkey registration
- [ ] WebAuthn credential storage
- [ ] Integration tests (mock authenticator)
- [ ] Bible compliance verified

### Files Affected

- `packages/api/src/services/passkey.service.ts` (new)
- `packages/api/src/routes/auth.ts` (passkey routes)
- `packages/api/src/controllers/auth.controller.ts` (passkey methods)
- `packages/database/src/db/schema/auth.ts` (passkeys table)
- `packages/api/src/lib/webauthn.ts` (new - WebAuthn helpers)
- `packages/api/src/test/passkey.test.ts` (new)

### Technical Notes

**WebAuthn Library:**
- Use `@simplewebauthn/server` (recommended)
- Supports FIDO2, Windows Hello, Touch ID, Face ID

---

## TASK-014: Meilisearch Full Integration

```yaml
---
id: TASK-014
title: Meilisearch Full Integration
priority: P3
status: AVAILABLE
claimed_by: null
claimed_at: null
dependencies: []
estimated_effort: large
tags: [backend, search, performance, indexing]
bible_refs: [05-TECH/01-architecture.md]
expected_completion: 2026-02-25
---
```

### Description

Implement full Meilisearch integration for fast, typo-tolerant search across polls, surveys, tests, and users.

**Scope:**
- Meilisearch instance setup
- Index sync for polls, surveys, tests, users
- Real-time indexing (on create/update)
- Faceted search (filters)
- Typo tolerance
- Search API endpoints

### Acceptance Criteria

- [ ] Meilisearch instance deployed
- [ ] Polls index with facets (category, status, tier)
- [ ] Surveys index with facets
- [ ] Tests index with facets
- [ ] Users index with facets (verified, tier)
- [ ] Real-time index sync on create/update/delete
- [ ] GET /search endpoint (unified search)
- [ ] GET /search/polls, /search/surveys, /search/tests, /search/users endpoints
- [ ] Faceted filtering support
- [ ] Typo tolerance enabled
- [ ] Pagination support
- [ ] Search result highlighting
- [ ] Integration tests
- [ ] Bible compliance verified

### Files Affected

- `packages/api/src/services/search.service.ts` (new)
- `packages/api/src/routes/search.ts` (new)
- `packages/api/src/controllers/search.controller.ts` (new)
- `packages/api/src/lib/meilisearch.ts` (new - client setup)
- `packages/api/src/test/search.test.ts` (new)

### Technical Notes

**Sync Strategy:**
- Bulk initial sync (all existing records)
- Real-time sync on create/update/delete
- Background job for periodic full sync (weekly)

---

## TASK-015: Webhook System for Organizations

```yaml
---
id: TASK-015
title: Webhook System for Organizations
priority: P3
status: AVAILABLE
claimed_by: null
claimed_at: null
dependencies: []
estimated_effort: large
tags: [backend, webhooks, integrations, b2b]
bible_refs: [05-TECH/04-api-routes.md, 02-USERS/02-organization-roles.md]
expected_completion: 2026-02-28
---
```

### Description

Implement webhook system for organizations to receive real-time event notifications.

**Scope:**
- Webhook endpoint registration
- Event delivery with retries
- Signature verification (HMAC)
- Delivery logs
- Webhook management

### Acceptance Criteria

- [ ] POST /organizations/:id/webhooks endpoint (create webhook)
- [ ] GET /organizations/:id/webhooks endpoint (list webhooks)
- [ ] PATCH /organizations/:id/webhooks/:webhookId endpoint (update)
- [ ] DELETE /organizations/:id/webhooks/:webhookId endpoint (delete)
- [ ] GET /organizations/:id/webhooks/:webhookId/deliveries endpoint (logs)
- [ ] Event types: poll.created, poll.completed, survey.response, test.completed
- [ ] Retry logic (3 attempts with exponential backoff)
- [ ] HMAC signature generation (SHA256)
- [ ] Webhook delivery queue (BullMQ)
- [ ] Integration tests
- [ ] Bible compliance verified

### Files Affected

- `packages/api/src/services/webhook.service.ts` (new)
- `packages/api/src/routes/organizations.ts` (webhook routes)
- `packages/database/src/db/schema/webhooks.ts` (new)
- `packages/api/src/queues/webhook.queue.ts` (new)
- `packages/api/src/test/webhook.test.ts` (new)

### Technical Notes

**Retry Strategy:**
- Attempt 1: Immediate
- Attempt 2: 1 minute delay
- Attempt 3: 5 minutes delay
- After 3 failures: Mark as failed

---

## TASK-016: Partykit Live Poll Migration

```yaml
---
id: TASK-016
title: Partykit Live Poll Migration
priority: P3
status: AVAILABLE
claimed_by: null
claimed_at: null
dependencies: []
estimated_effort: very-large
tags: [backend, infrastructure, websocket, scalability]
bible_refs: [03-FEATURES/04-live.md, P-056]
expected_completion: 2026-03-15
---
```

### Description

Migrate Live Poll system from ws to Partykit for edge deployment and 10K+ concurrent user support.

**Scope:**
- Partykit party implementation
- Edge deployment
- Connection state management
- Vote synchronization
- Load testing (10K+ concurrent)

### Acceptance Criteria

- [ ] Partykit party implementation (LivePollParty)
- [ ] WebSocket connection upgrade to Partykit
- [ ] Host controls (start, pause, end)
- [ ] Real-time vote broadcasting
- [ ] Waiting room integration
- [ ] Edge deployment (Cloudflare Workers / Vercel Edge)
- [ ] Load testing results (10K+ concurrent)
- [ ] Integration tests
- [ ] Bible compliance verified

### Files Affected

- `packages/api/src/parties/livepoll.party.ts` (new)
- `packages/api/src/services/livepoll.service.ts` (migrate)
- `packages/api/src/routes/live.ts` (update)
- `packages/api/partykit.json` (new)
- `packages/api/src/test/livepoll-partykit.test.ts` (new)

### Technical Notes

**Migration Strategy:**
1. Implement Partykit party
2. Deploy to edge
3. Feature flag rollout (10% → 50% → 100%)
4. Monitor performance
5. Deprecate ws implementation

---

## Task Statistics

- **Total Active**: 11
- **P0 Priority**: 1
- **P1 Priority**: 0
- **P2 Priority**: 4
- **P3 Priority**: 6

---

## Legend

**Priority Levels:**
- **P0**: Critical (security, data integrity, blocker bugs)
- **P1**: High (core features, important bugs)
- **P2**: Medium (enhancements, minor bugs)
- **P3**: Low (nice-to-have, optimizations)

**Status Lifecycle:**
- **AVAILABLE**: Ready for claim
- **IN_PROGRESS**: Actively being worked on
- **BLOCKED**: Waiting on dependency or decision
- **REVIEW**: Pending code review or testing
- **DONE**: Completed (move to tasks-completed.md)

**Estimated Effort:**
- **small**: <2 hours
- **medium**: 2-8 hours
- **large**: >8 hours

---

*Migrated from AGENT_COORDINATION.md on 2026-01-29 by NyoWorks PM*
