# Active Tasks

> NYOWORKS Task Management System v4.0
> Project: VoxPoll
> Project Code: VOX
> Last Updated: 2026-01-29 18:15:00 UTC

## Priority Legend
- P0: Blocker - drop everything
- P1: Critical - complete this phase
- P2: Important - complete this release
- P3: Nice to have - if time permits

## Status Legend
- AVAILABLE: Ready, anyone can claim
- IN_PROGRESS: Actively being worked on
- BLOCKED: Stuck, needs help
- REVIEW: Done, needs verification
- DONE: Complete, move to tasks-completed.md

---

---
id: TASK-20260127-001
created: 2026-01-27 22:22:00 UTC
category: TEST
priority: P0
status: IN_PROGRESS
assigned_to: QA
assigned_at: 2026-01-27 22:22:00 UTC
estimated_hours: 40
dependencies: []
source: MANUAL
tags: [testing, bible-compliance, security, core-features]
bible_refs: [P-057, P-058, P-059, T-009]
---

## Bible Flow Test Coverage (Wave 1 - P0 + P1)

**Description:** Comprehensive test coverage for VoxPoll Bible compliance, focusing on critical security and core feature flows.

**Scope:**
- P0 Security: 8 test suites (~180 test cases)
- P1 Core Features: 12 test suites (~250 test cases)
- Target: 100% Bible compliance verification

**Acceptance Criteria:**
- [ ] All P0 security test suites implemented (8/8)
- [ ] All P1 core feature test suites implemented (12/12)
- [ ] Test coverage for P-057 (Device Fingerprinting)
- [ ] Test coverage for P-058 (Rate Limiting)
- [ ] Test coverage for P-059 (Error Sanitization)
- [ ] Test coverage for T-009 (Reliability Scoring)
- [ ] All tests passing
- [ ] Code coverage >80%
- [ ] Test execution documented in TEST_MASTER_PLAN.md

**Files Affected:**
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md
- apps/api/src/test/*.test.ts
- docs/bible/99-TRACKING/GAPS.md
- docs/bible/99-TRACKING/AUDIT_CHANGELOG.md

**Context:** Test suite implementation in progress. P0 (7/8 complete, 87.5%), P1 (12/12 complete, 100%).

---

---
id: TASK-20260129-003
created: 2026-01-29 11:07:00 UTC
category: FEATURE
priority: P2
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 16
dependencies: []
source: MANUAL
tags: [backend, admin, moderation, analytics]
bible_refs: [07-EDGE/03-business-rules.md, 09-security/01-rbac-matrix.md]
---

## Admin Dashboard APIs Implementation

**Description:** Implement admin dashboard APIs for platform analytics, user management, content moderation, and feature flags.

**Scope:**
- Platform analytics (users, polls, revenue)
- User management (search, ban, tier changes)
- Content moderation queue
- Feature flags system
- Audit logs

**Acceptance Criteria:**
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

**Files Affected:**
- apps/api/src/routes/admin.ts
- apps/api/src/controllers/admin.controller.ts
- apps/api/src/services/admin.service.ts
- apps/api/src/services/moderation.service.ts
- packages/database/src/db/schema/admin.ts
- apps/api/src/middleware/rbac.ts
- apps/api/src/test/admin.test.ts

**Context:** Admin dashboard APIs for platform management.

---

---
id: TASK-20260129-004
created: 2026-01-29 11:08:00 UTC
category: FEATURE
priority: P2
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 12
dependencies: []
source: MANUAL
tags: [backend, analytics, data-export]
bible_refs: [03-FEATURES/06-analytics.md, 04-DATA]
---

## Advanced Analytics APIs

**Description:** Implement advanced analytics dashboard for poll creators with demographic breakdowns, time series data, and export functionality.

**Scope:**
- Poll/survey analytics dashboard data
- Demographic breakdowns
- Time series vote data
- Response quality analytics
- Export (CSV, XLSX, JSON)

**Acceptance Criteria:**
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

**Files Affected:**
- apps/api/src/services/analytics.service.ts
- apps/api/src/controllers/poll.controller.ts
- apps/api/src/routes/polls.ts
- apps/api/src/lib/export.ts
- apps/api/src/test/analytics.test.ts

**Context:** Advanced analytics for poll creators with export functionality.

---

---
id: TASK-20260129-005
created: 2026-01-29 11:09:00 UTC
category: FEATURE
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 6
dependencies: []
source: MANUAL
tags: [backend, auth, verification, sms]
bible_refs: [02-USERS/04-verification-levels.md]
---

## Phone OTP Verification System

**Description:** Implement phone OTP verification for Level 1 verification upgrade.

**Scope:**
- SMS OTP sending (via Twilio or similar)
- 6-digit code generation
- 10-minute expiry
- Rate limiting (max 3 requests per hour)
- Level 1 verification upgrade on success

**Acceptance Criteria:**
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

**Files Affected:**
- apps/api/src/services/verification.service.ts
- apps/api/src/routes/auth.ts
- apps/api/src/controllers/auth.controller.ts
- packages/database/src/db/schema/users.ts
- packages/database/src/db/schema/verification.ts
- apps/api/src/lib/sms.ts
- apps/api/src/test/phone-otp.test.ts

**Context:** Phone OTP verification for Level 1 upgrade. Local test mode available (Mock SMS, no cost).

---

---
id: TASK-20260129-006
created: 2026-01-29 11:10:00 UTC
category: FEATURE
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 6
dependencies: []
source: MANUAL
tags: [backend, auth, passwordless]
bible_refs: [02-USERS/01-user-types.md, 05-TECH/06-security.md]
---

## Magic Link Authentication

**Description:** Implement passwordless magic link authentication for easier login.

**Scope:**
- Magic link generation (secure token)
- Email sending
- Token validation
- Single-use enforcement
- 15-minute expiry

**Acceptance Criteria:**
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

**Files Affected:**
- apps/api/src/services/auth.service.ts
- apps/api/src/routes/auth.ts
- apps/api/src/controllers/auth.controller.ts
- packages/database/src/db/schema/auth.ts
- apps/api/src/lib/email.ts
- apps/api/src/test/magic-link.test.ts

**Context:** Passwordless magic link authentication. Local test mode available (MailHog Docker, no cost).

---

---
id: TASK-20260129-007
created: 2026-01-29 11:11:00 UTC
category: FEATURE
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 12
dependencies: []
source: MANUAL
tags: [backend, auth, webauthn, biometric]
bible_refs: [02-USERS/04-verification-levels.md, 05-TECH/06-security.md]
---

## Passkey/WebAuthn Authentication

**Description:** Implement passwordless authentication using WebAuthn/Passkeys for enhanced security and UX.

**Scope:**
- WebAuthn registration (credential creation)
- WebAuthn authentication
- Multiple passkeys per user
- Passkey management (rename, delete)
- Level 2 verification upgrade

**Acceptance Criteria:**
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

**Files Affected:**
- apps/api/src/services/passkey.service.ts
- apps/api/src/routes/auth.ts
- apps/api/src/controllers/auth.controller.ts
- packages/database/src/db/schema/auth.ts
- apps/api/src/lib/webauthn.ts
- apps/api/src/test/passkey.test.ts

**Context:** WebAuthn/Passkey authentication using @simplewebauthn/server.

---

---
id: TASK-20260129-008
created: 2026-01-29 11:12:00 UTC
category: PERFORMANCE
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 16
dependencies: []
source: MANUAL
tags: [backend, search, performance, indexing]
bible_refs: [05-TECH/01-architecture.md]
---

## Meilisearch Full Integration

**Description:** Implement full Meilisearch integration for fast, typo-tolerant search across polls, surveys, tests, and users.

**Scope:**
- Meilisearch instance setup
- Index sync for polls, surveys, tests, users
- Real-time indexing (on create/update)
- Faceted search (filters)
- Typo tolerance
- Search API endpoints

**Acceptance Criteria:**
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

**Files Affected:**
- apps/api/src/services/search.service.ts
- apps/api/src/routes/search.ts
- apps/api/src/controllers/search.controller.ts
- apps/api/src/lib/meilisearch.ts
- apps/api/src/test/search.test.ts

**Context:** Meilisearch for fast search. Local test mode available (Docker, no cost).

---

---
id: TASK-20260129-009
created: 2026-01-29 11:13:00 UTC
category: FEATURE
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 16
dependencies: []
source: MANUAL
tags: [backend, webhooks, integrations, b2b]
bible_refs: [05-TECH/04-api-routes.md, 02-USERS/02-organization-roles.md]
---

## Webhook System for Organizations

**Description:** Implement webhook system for organizations to receive real-time event notifications.

**Scope:**
- Webhook endpoint registration
- Event delivery with retries
- Signature verification (HMAC)
- Delivery logs
- Webhook management

**Acceptance Criteria:**
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

**Files Affected:**
- apps/api/src/services/webhook.service.ts
- apps/api/src/routes/organizations.ts
- packages/database/src/db/schema/webhooks.ts
- apps/api/src/queues/webhook.queue.ts
- apps/api/src/test/webhook.test.ts

**Context:** Webhook system for B2B organizations with retry and HMAC signature.

---

---
id: TASK-20260129-010
created: 2026-01-29 11:14:00 UTC
category: REFACTOR
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 24
dependencies: []
source: MANUAL
tags: [backend, infrastructure, websocket, scalability]
bible_refs: [03-FEATURES/04-live.md, P-056]
---

## Partykit Live Poll Migration

**Description:** Migrate Live Poll system from ws to Partykit for edge deployment and 10K+ concurrent user support.

**Scope:**
- Partykit party implementation
- Edge deployment
- Connection state management
- Vote synchronization
- Load testing (10K+ concurrent)

**Acceptance Criteria:**
- [ ] Partykit party implementation (LivePollParty)
- [ ] WebSocket connection upgrade to Partykit
- [ ] Host controls (start, pause, end)
- [ ] Real-time vote broadcasting
- [ ] Waiting room integration
- [ ] Edge deployment (Cloudflare Workers / Vercel Edge)
- [ ] Load testing results (10K+ concurrent)
- [ ] Integration tests
- [ ] Bible compliance verified

**Files Affected:**
- apps/api/src/parties/livepoll.party.ts
- apps/api/src/services/livepoll.service.ts
- apps/api/src/routes/live.ts
- apps/api/partykit.json
- apps/api/src/test/livepoll-partykit.test.ts

**Context:** Migrate to Partykit for edge deployment and scalability. Local test mode available (Partykit dev server, no cost).

---

---
id: TASK-20260129-001
created: 2026-01-29 17:50:00 UTC
category: TEST
priority: P1
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 3
dependencies: []
source: MANUAL
tags: [testing, survey, b2b, organization]
bible_refs: [P-015, 02-USERS/02-organization-roles.md]
---

## Survey B2B Exclusive Tests (P1-011)

**Description:** Verify surveys are B2B-exclusive (organization roles only) per Bible P-015.

**Scope:**
- Organization member access (OWNER, ADMIN, MEMBER)
- Individual user blocking
- API endpoint validation
- Error messages

**Acceptance Criteria:**
- [ ] GET /surveys/:id - 403 for individual users
- [ ] POST /surveys - 403 for individual users
- [ ] PUT /surveys/:id - 403 for individual users
- [ ] POST /surveys/:id/responses - 403 for individual users
- [ ] Organization OWNER full access
- [ ] Organization ADMIN full access
- [ ] Organization MEMBER read/respond only
- [ ] Proper error codes (ORGANIZATION_ONLY)
- [ ] Proper error messages
- [ ] Edge cases: deleted org, suspended user
- [ ] 12/12 test cases passing
- [ ] Bible P-015 compliance verified

**Files Affected:**
- apps/api/src/test/survey-b2b-exclusive.test.ts (new)
- apps/api/src/middleware/permissions.ts
- apps/api/src/services/survey.service.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md
- docs/bible/99-TRACKING/GAPS.md

**Context:** Bible P-015 explicitly states surveys are B2B-exclusive feature. Must block all individual user access.

---

---
id: TASK-20260129-002
created: 2026-01-29 17:51:00 UTC
category: TEST
priority: P1
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 5
dependencies: []
source: MANUAL
tags: [testing, rbac, organization, permissions]
bible_refs: [P-102, 02-USERS/02-organization-roles.md]
---

## Organization Role Permission Tests (P1-012)

**Description:** Verify organization role-based permissions per Bible P-102.

**Scope:**
- OWNER permissions (full control)
- ADMIN permissions (no billing)
- MEMBER permissions (read/respond only)
- GUEST permissions (view only)
- Role inheritance and hierarchy
- Cross-role edge cases

**Acceptance Criteria:**
- [ ] OWNER: Create/edit/delete organization
- [ ] OWNER: Billing and payment access
- [ ] OWNER: Member management (invite/remove/change roles)
- [ ] ADMIN: Create/edit surveys (not delete org)
- [ ] ADMIN: View analytics
- [ ] ADMIN: NO billing access
- [ ] MEMBER: View surveys
- [ ] MEMBER: Submit responses
- [ ] MEMBER: NO creation/edit rights
- [ ] GUEST: View only (no responses)
- [ ] Role change mid-session handling
- [ ] Deleted organization handling
- [ ] Suspended user handling
- [ ] Verification level requirements (OWNER/ADMIN Level 2+)
- [ ] 22/22 test cases passing
- [ ] Bible P-102 compliance verified

**Files Affected:**
- apps/api/src/test/organization-role-permissions.test.ts (new)
- apps/api/src/middleware/rbac.ts
- apps/api/src/services/organization.service.ts
- apps/api/src/repositories/organization.repository.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md
- docs/bible/99-TRACKING/GAPS.md

**Context:** Bible P-102 defines strict 4-tier role hierarchy (OWNER > ADMIN > MEMBER > GUEST) with explicit permission matrix.

---

---
id: TASK-20260129-011
created: 2026-01-29 17:55:00 UTC
category: TEST
priority: P2
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 4
dependencies: []
source: MANUAL
tags: [testing, social, follow]
bible_refs: [P-022, 03-FEATURES/08-social.md]
---

## Follow System Tests (P2-001)

**Description:** Comprehensive tests for one-way follow system (Twitter-style).

**Scope:**
- One-way follows
- Mutual follows = friends
- Follow request system (PENDING status)
- Followers/following lists
- Block integration

**Acceptance Criteria:**
- [ ] One-way follow creation
- [ ] Mutual follow detection (friends)
- [ ] Private profile follow requests (PENDING)
- [ ] Accept/reject follow requests
- [ ] Followers list with pagination
- [ ] Following list with pagination
- [ ] getRelationship utility (all relationship states)
- [ ] Follow notification integration (deferred)
- [ ] Unfollow flow
- [ ] Block auto-removes follows
- [ ] Edge cases: deleted user, suspended account
- [ ] 18/18 test cases passing
- [ ] Bible P-022 compliance verified

**Files Affected:**
- apps/api/src/test/follow.test.ts (new)
- apps/api/src/services/follow.service.ts
- apps/api/src/repositories/follow.repository.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Bible P-022 defines one-way follow system. Mutual follows create friendship status.

---

---
id: TASK-20260129-012
created: 2026-01-29 17:56:00 UTC
category: TEST
priority: P2
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 3
dependencies: []
source: MANUAL
tags: [testing, social, block]
bible_refs: [03-FEATURES/08-social.md]
---

## Block System Tests (P2-002)

**Description:** Comprehensive tests for user blocking system.

**Scope:**
- Block/unblock flow
- Follow prevention when blocked
- Auto-removal of existing follows
- Content visibility restrictions
- DM blocking

**Acceptance Criteria:**
- [ ] Block user endpoint
- [ ] Block prevents new follows
- [ ] Block auto-removes existing follows (bidirectional)
- [ ] isBlocked check
- [ ] isBlockedBidirectional check
- [ ] Unblock flow
- [ ] Blocked users list with pagination
- [ ] Content visibility (blocked cannot see blocker)
- [ ] DM blocking (cannot message blocked)
- [ ] Edge cases: self-block prevention, deleted user
- [ ] 14/14 test cases passing
- [ ] Bible compliance verified

**Files Affected:**
- apps/api/src/test/block.test.ts (new)
- apps/api/src/services/block.service.ts
- apps/api/src/repositories/block.repository.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Block system enforces privacy and safety. Blocks are bidirectional for content visibility.

---

---
id: TASK-20260129-013
created: 2026-01-29 17:57:00 UTC
category: TEST
priority: P2
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 5
dependencies: []
source: MANUAL
tags: [testing, social, dm, messaging]
bible_refs: [P-022, P-058, 03-FEATURES/08-social.md]
---

## DM System Tests (P2-003)

**Description:** Comprehensive tests for Direct Message system.

**Scope:**
- Text-only DMs (2000 char max)
- Tier-based rate limits
- Read receipts
- 1-year auto-delete
- Conversation management
- Block integration

**Acceptance Criteria:**
- [ ] Send text-only DM (max 2000 chars, no media)
- [ ] Tier limits (FREE 0/day, PLUS 25/day, PREMIUM 1000/day)
- [ ] Read receipts (markAsRead, readAt timestamp)
- [ ] 1 year auto-delete (expiresAt field, cleanup job)
- [ ] Conversations table (participants array, unread counts)
- [ ] DirectMessages table (status, delivery tracking)
- [ ] Block integration (cannot message blocked users)
- [ ] Archive conversation
- [ ] Delete conversation
- [ ] checkDMPermission logic (tier check, block check)
- [ ] Edge cases: blocked mid-conversation, tier downgrade
- [ ] 20/20 test cases passing
- [ ] Bible P-022, P-058 compliance verified

**Files Affected:**
- apps/api/src/test/dm.test.ts (new)
- apps/api/src/services/dm.service.ts
- apps/api/src/repositories/dm.repository.ts
- packages/database/src/db/schema/social.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Bible P-022 defines text-only DM system with tier limits. Bible P-058 defines rate limits.

---

---
id: TASK-20260129-014
created: 2026-01-29 17:58:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 3
dependencies: []
source: MANUAL
tags: [testing, social, profile-visits, analytics, deferred]
bible_refs: [03-FEATURES/08-social.md]
---

## Profile Visits Tests (P2-004)

**Description:** Test profile visit tracking and analytics (deferred feature).

**Scope:**
- PLUS/PREMIUM tier visit tracking
- PREMIUM anonymous visit option
- Weekly insights email

**Acceptance Criteria:**
- [ ] PLUS/PREMIUM: See who visited profile
- [ ] PREMIUM: Anonymous visit toggle
- [ ] Visit tracking (visitor, timestamp, anonymous flag)
- [ ] Weekly insights email generation (deferred)
- [ ] Edge cases: blocked users not tracked, self-visit ignored
- [ ] 10/10 test cases passing
- [ ] Bible compliance verified

**Files Affected:**
- apps/api/src/test/profile-visits.test.ts (new)
- apps/api/src/services/profile.service.ts
- packages/database/src/db/schema/social.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Profile visit tracking for PLUS/PREMIUM tiers. Feature deferred until social features MVP complete.

---

---
id: TASK-20260129-015
created: 2026-01-29 17:59:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 3
dependencies: []
source: MANUAL
tags: [testing, notifications, preferences, deferred]
bible_refs: [03-FEATURES/07-notifications.md]
---

## Notification Preferences Tests (P2-007)

**Description:** Test notification preference system (deferred).

**Scope:**
- Per-category notification settings
- Channel toggles (push/email/in-app)
- Digest frequency settings

**Acceptance Criteria:**
- [ ] Per-category settings (polls, surveys, social, etc.)
- [ ] Push notification toggle per category
- [ ] Email notification toggle per category
- [ ] In-app notification toggle per category
- [ ] Digest frequency (instant, daily, weekly)
- [ ] Default preferences on signup
- [ ] Update preferences endpoint
- [ ] Edge cases: invalid category, invalid frequency
- [ ] 10/10 test cases passing
- [ ] Bible compliance verified

**Files Affected:**
- apps/api/src/test/notification-prefs.test.ts (new)
- apps/api/src/services/notification.service.ts
- packages/database/src/db/schema/notifications.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Notification preferences for granular control. Feature deferred until notification system implemented.

---

---
id: TASK-20260129-016
created: 2026-01-29 18:00:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 4
dependencies: []
source: MANUAL
tags: [testing, badges, gamification, deferred]
bible_refs: [P-017, 03-FEATURES/03-tests.md]
---

## Badge System Tests (P2-008)

**Description:** Test badge system for personality tests (deferred).

**Scope:**
- Personality test badges
- Achievement badges
- Shareable badge cards
- Profile display

**Acceptance Criteria:**
- [ ] Personality test badge award on completion
- [ ] Achievement badge triggers
- [ ] Badge metadata (icon, name, description, rarity)
- [ ] Shareable badge card generation
- [ ] Badge display on user profile
- [ ] Badge collection endpoint
- [ ] Edge cases: duplicate awards, test retake
- [ ] 12/12 test cases passing
- [ ] Bible P-017 compliance verified

**Files Affected:**
- apps/api/src/test/badges.test.ts (new)
- apps/api/src/services/badge.service.ts
- packages/database/src/db/schema/tests.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Bible P-017 defines badge system for personality tests. Feature deferred until test module complete.

---

---
id: TASK-20260129-017
created: 2026-01-29 18:01:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 5
dependencies: []
source: MANUAL
tags: [testing, analytics, export, deferred]
bible_refs: [03-FEATURES/01-polls.md, 03-FEATURES/06-analytics.md]
---

## Advanced Analytics Tests (P2-009)

**Description:** Test advanced analytics dashboard for poll creators (deferred).

**Scope:**
- Poll/survey analytics dashboard
- Demographic breakdowns
- Time series data
- Export functionality (CSV/XLSX/JSON)

**Acceptance Criteria:**
- [ ] Analytics dashboard data aggregation
- [ ] Demographic breakdown (age, gender, location if available)
- [ ] Time series vote data
- [ ] Response quality analytics
- [ ] Export to CSV format
- [ ] Export to XLSX format
- [ ] Export to JSON format
- [ ] PREMIUM tier requirement for advanced features
- [ ] Edge cases: no data, partial data, large exports
- [ ] 15/15 test cases passing
- [ ] Bible compliance verified

**Files Affected:**
- apps/api/src/test/analytics.test.ts (new)
- apps/api/src/services/analytics.service.ts
- apps/api/src/lib/export.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Advanced analytics for poll creators with export. Feature deferred until core analytics complete.

---

---
id: TASK-20260129-018
created: 2026-01-29 18:02:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 6
dependencies: []
source: MANUAL
tags: [testing, admin, moderation, deferred]
bible_refs: [07-EDGE/01-edge-cases.md]
---

## Admin Dashboard Tests (P2-010)

**Description:** Test admin dashboard and moderation features (deferred).

**Scope:**
- Platform analytics for admins
- User moderation actions
- Content moderation queue
- Feature flags management

**Acceptance Criteria:**
- [ ] Platform analytics endpoint (users, polls, revenue)
- [ ] User moderation (ban, suspend, warn)
- [ ] Content moderation queue (flagged content)
- [ ] Approve/reject/delete moderation actions
- [ ] Feature flags CRUD
- [ ] Audit logs for admin actions
- [ ] ADMIN role requirement enforcement
- [ ] Rate limiting for admin endpoints
- [ ] Edge cases: cascading deletes, feature flag rollback
- [ ] 18/18 test cases passing
- [ ] Bible compliance verified

**Files Affected:**
- apps/api/src/test/admin.test.ts (new)
- apps/api/src/services/admin.service.ts
- apps/api/src/services/moderation.service.ts
- packages/database/src/db/schema/admin.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Admin dashboard for platform management. Feature deferred until core features stable.

---

---
id: TASK-20260129-019
created: 2026-01-29 18:03:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 4
dependencies: []
source: MANUAL
tags: [testing, edevlet, verification, turkey]
bible_refs: [P-004, 02-USERS/04-verification-levels.md]
---

## e-Devlet Integration Tests (P3-002)

**Description:** Test e-Devlet OAuth integration for Level 3 verification.

**Scope:**
- e-Devlet OAuth flow
- TC Kimlik No validation (11-digit Luhn algorithm)
- Account linking
- Level 3 auto-upgrade
- User provisioning

**Acceptance Criteria:**
- [ ] e-Devlet OAuth initiation endpoint
- [ ] e-Devlet OAuth callback handling
- [ ] TC Kimlik No validation (11-digit, Luhn check)
- [ ] Link to existing account flow
- [ ] Create new account flow
- [ ] Level 3 verification auto-upgrade
- [ ] Birthdate parsing from e-Devlet data
- [ ] User data provisioning (name, surname, birthdate)
- [ ] Error handling (invalid TC, OAuth failure)
- [ ] Edge cases: duplicate TC, expired session
- [ ] 14/14 test cases passing
- [ ] Bible P-004 compliance verified

**Files Affected:**
- apps/api/src/test/edevlet.test.ts (new)
- apps/api/src/services/edevlet.service.ts
- apps/api/src/lib/tcno-validator.ts
- packages/database/src/db/schema/users.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Bible P-004 defines e-Devlet as Level 3 verification method for Turkey.

---

---
id: TASK-20260129-020
created: 2026-01-29 18:04:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 5
dependencies: []
source: MANUAL
tags: [testing, sso, saml, oidc, enterprise]
bible_refs: [05-TECH/06-security.md]
---

## SSO (SAML/OIDC) Tests (P3-005)

**Description:** Test SSO integration for B2B organizations (SAML 2.0 and OIDC).

**Scope:**
- SAML 2.0 authentication flow
- OIDC authentication flow
- Organization SSO configuration
- Domain restrictions
- Auto user provisioning

**Acceptance Criteria:**
- [ ] SAML 2.0 login initiation
- [ ] SAML response parsing and validation
- [ ] SAML callback handling
- [ ] OIDC authorization URL generation
- [ ] OIDC code exchange flow
- [ ] OIDC token validation
- [ ] Organization SSO config (ssoConfigs table)
- [ ] Domain restrictions (email domain whitelist)
- [ ] Auto user provisioning on first SSO login
- [ ] SSO error handling (invalid signature, expired assertion)
- [ ] Edge cases: multiple IdPs, SSO logout
- [ ] 16/16 test cases passing
- [ ] Bible compliance verified

**Files Affected:**
- apps/api/src/test/sso.test.ts (new)
- apps/api/src/services/sso.service.ts
- apps/api/src/lib/saml.ts
- apps/api/src/lib/oidc.ts
- packages/database/src/db/schema/sso.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** SSO for enterprise B2B organizations. SAML 2.0 and OIDC support per Bible security standards.

---

---
id: TASK-20260129-021
created: 2026-01-29 18:05:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 3
dependencies: []
source: MANUAL
tags: [testing, phone, otp, sms, deferred]
bible_refs: [02-USERS/04-verification-levels.md]
---

## Phone OTP Tests (P3-001)

**Description:** Test phone OTP verification for Level 1 upgrade (deferred).

**Scope:**
- SMS OTP sending
- 6-digit code generation
- 10-minute expiry
- Rate limiting (3 attempts/hour)
- Level 1 upgrade on success

**Acceptance Criteria:**
- [ ] SMS OTP send endpoint
- [ ] 6-digit numeric code generation
- [ ] OTP expiry (10 minutes)
- [ ] OTP verification endpoint
- [ ] Rate limiting (3 attempts per hour per phone)
- [ ] Phone number validation (E.164 format)
- [ ] Duplicate phone prevention
- [ ] Auto-upgrade to Level 1 on success
- [ ] Mock SMS provider for tests
- [ ] 10/10 test cases passing
- [ ] Bible compliance verified

**Files Affected:**
- apps/api/src/test/phone-otp.test.ts (new)
- apps/api/src/services/verification.service.ts
- apps/api/src/lib/sms.ts
- packages/database/src/db/schema/verification.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Phone OTP for Level 1 verification. Deferred until SMS provider integrated.

---

---
id: TASK-20260129-022
created: 2026-01-29 18:06:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 3
dependencies: []
source: MANUAL
tags: [testing, magic-link, passwordless, deferred]
bible_refs: [05-TECH/06-security.md]
---

## Magic Link Tests (P3-003)

**Description:** Test magic link passwordless authentication (deferred).

**Scope:**
- Secure token generation
- Email delivery
- Token validation
- Single-use enforcement
- 15-minute expiry

**Acceptance Criteria:**
- [ ] Magic link generation (crypto.randomBytes)
- [ ] Magic link send endpoint
- [ ] Email template rendering
- [ ] Token expiry (15 minutes)
- [ ] Single-use token enforcement
- [ ] Token verification endpoint
- [ ] Auto-login on valid token
- [ ] Rate limiting (3 requests per hour per email)
- [ ] Mock email provider for tests
- [ ] 8/8 test cases passing
- [ ] Bible compliance verified

**Files Affected:**
- apps/api/src/test/magic-link.test.ts (new)
- apps/api/src/services/auth.service.ts
- apps/api/src/lib/email.ts
- packages/database/src/db/schema/auth.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Magic link passwordless auth. Deferred until email provider integrated.

---

---
id: TASK-20260129-023
created: 2026-01-29 18:07:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 4
dependencies: []
source: MANUAL
tags: [testing, passkey, webauthn, biometric, deferred]
bible_refs: [05-TECH/06-security.md]
---

## Passkey/WebAuthn Tests (P3-004)

**Description:** Test WebAuthn/Passkey authentication (deferred).

**Scope:**
- WebAuthn registration flow
- WebAuthn authentication flow
- Multiple passkeys per user
- Passkey management (rename, delete)
- Level 2 verification upgrade

**Acceptance Criteria:**
- [ ] WebAuthn registration challenge generation
- [ ] WebAuthn credential verification
- [ ] WebAuthn login challenge generation
- [ ] WebAuthn assertion verification
- [ ] Multiple passkeys per user support
- [ ] Passkey list endpoint
- [ ] Passkey rename endpoint
- [ ] Passkey delete endpoint
- [ ] Auto-upgrade to Level 2 on passkey registration
- [ ] Mock authenticator for tests
- [ ] 12/12 test cases passing
- [ ] Bible compliance verified

**Files Affected:**
- apps/api/src/test/passkey.test.ts (new)
- apps/api/src/services/passkey.service.ts
- apps/api/src/lib/webauthn.ts
- packages/database/src/db/schema/auth.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Passkey/WebAuthn for Level 2 verification. Deferred until @simplewebauthn/server integrated.

---

---
id: TASK-20260129-024
created: 2026-01-29 18:08:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 3
dependencies: []
source: MANUAL
tags: [testing, partykit, websocket, edge, deferred]
bible_refs: [P-056, 00-MASTER/DECISIONS.md]
---

## Partykit Migration Tests (P3-006)

**Description:** Test Partykit migration for Live Poll edge deployment (deferred).

**Scope:**
- Partykit WebSocket connection
- Edge deployment compatibility
- 10K+ concurrent user support
- HTTP polling fallback

**Acceptance Criteria:**
- [ ] Partykit party implementation (LivePollParty)
- [ ] WebSocket connection upgrade
- [ ] Host controls (start, pause, end) via Partykit
- [ ] Real-time vote broadcasting
- [ ] Waiting room integration
- [ ] Edge deployment test (Cloudflare Workers / Vercel Edge)
- [ ] Load test (10K+ concurrent connections)
- [ ] HTTP polling fallback
- [ ] Connection recovery
- [ ] 10/10 test cases passing
- [ ] Bible P-056 compliance verified

**Files Affected:**
- apps/api/src/test/partykit.test.ts (new)
- apps/api/src/parties/livepoll.party.ts
- apps/api/src/services/livepoll.service.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Bible P-056 specifies Partykit for edge deployment. Deferred until Partykit integrated.

---

---
id: TASK-20260129-025
created: 2026-01-29 18:09:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 4
dependencies: []
source: MANUAL
tags: [testing, meilisearch, search, indexing, deferred]
bible_refs: [T-013, 05-TECH/01-architecture.md]
---

## Meilisearch Tests (P3-007)

**Description:** Test Meilisearch integration for fast search (deferred).

**Scope:**
- Index synchronization (polls, surveys, users)
- Real-time search
- Faceted filtering
- Typo tolerance
- Search ranking

**Acceptance Criteria:**
- [ ] Polls index sync (create, update, delete)
- [ ] Surveys index sync
- [ ] Tests index sync
- [ ] Users index sync
- [ ] Real-time search endpoint
- [ ] Faceted filtering (category, status, tier)
- [ ] Typo tolerance enabled
- [ ] Search result highlighting
- [ ] Pagination support
- [ ] Search ranking customization
- [ ] Index rebuild utility
- [ ] 12/12 test cases passing
- [ ] Bible T-013 compliance verified

**Files Affected:**
- apps/api/src/test/meilisearch.test.ts (new)
- apps/api/src/services/search.service.ts
- apps/api/src/lib/meilisearch.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Bible T-013 defines Meilisearch for search. Deferred until Meilisearch instance deployed.

---

---
id: TASK-20260129-026
created: 2026-01-29 18:10:00 UTC
category: TEST
priority: P3
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 5
dependencies: []
source: MANUAL
tags: [testing, webhook, events, b2b, deferred]
bible_refs: [05-TECH/01-architecture.md]
---

## Webhook System Tests (P3-008)

**Description:** Test webhook system for B2B organizations (deferred).

**Scope:**
- Webhook endpoint registration
- Event delivery with retries
- HMAC signature verification
- Delivery logs
- Webhook management

**Acceptance Criteria:**
- [ ] Webhook registration endpoint
- [ ] Webhook list endpoint
- [ ] Webhook update endpoint
- [ ] Webhook delete endpoint
- [ ] Event types (poll.created, survey.response, etc.)
- [ ] Event delivery queue (BullMQ)
- [ ] Retry logic (3 attempts, exponential backoff)
- [ ] HMAC signature generation (SHA256)
- [ ] Signature verification
- [ ] Delivery logs endpoint
- [ ] Webhook testing endpoint (trigger test event)
- [ ] Edge cases: endpoint timeout, invalid signature, max retries
- [ ] 14/14 test cases passing
- [ ] Bible compliance verified

**Files Affected:**
- apps/api/src/test/webhook.test.ts (new)
- apps/api/src/services/webhook.service.ts
- apps/api/src/queues/webhook.queue.ts
- packages/database/src/db/schema/webhooks.ts
- docs/bible/99-TRACKING/TEST_MASTER_PLAN.md

**Context:** Webhook system for B2B event notifications. Deferred until BullMQ queue system implemented.

---

## Task Statistics

- **Total Active**: 27
- **P0 Priority**: 1 (IN_PROGRESS)
- **P1 Priority**: 2 (AVAILABLE)
- **P2 Priority**: 5 (AVAILABLE)
- **P3 Priority**: 19 (AVAILABLE)
- **Available for claim**: 26
- **In progress**: 1

---

*NYOWORKS Task Management System v4.0 - VoxPoll Project*
*Use CLI: python _tools/nyoworksCLI.py task [command]*
*Last migrated: 2026-01-29 18:15:00 UTC by Developer (NYOWORKS v4.0 compliance)*

---
id: TASK-20260129-027
created: 2026-01-29 18:58:02 UTC
category: TEST
priority: P0
status: IN_PROGRESS
assigned_to: QA
assigned_at: 2026-01-29 18:58:08 UTC
estimated_hours: 3
dependencies: []
source: MANUAL
---

## P0-008 GDPR Compliance Tests

**Description:** Implement GDPR compliance tests: data export, account deletion, 30-day grace period, right to be forgotten

**Acceptance Criteria:**
- [ ] Data export tests (5)
- [ ] Account deletion tests (4)
- [ ] Grace period tests (2)
- [ ] Cancel deletion tests (3)
- [ ] Right to be forgotten tests (4)

**Context:** Created by QA

**Files Affected:**
- apps/api/src/test/gdpr.test.ts
