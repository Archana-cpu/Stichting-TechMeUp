# ═══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - TEST MASTER PLAN
# ═══════════════════════════════════════════════════════════════════════════════
# Senior SaaS Tester tarafından olusturuldu
# Bible ile %100 uyumlu test coverage plani
# Created: 2026-01-27 22:22
# ═══════════════════════════════════════════════════════════════════════════════

## ÖZET

| Kategori | Toplam | Tamamlandı | Devam Eden | Beklemede | Coverage |
|----------|--------|------------|------------|-----------|----------|
| P0 - Security | 8 | 2 | 0 | 6 | 25% |
| P1 - Core Features | 12 | 4 | 0 | 8 | 33% |
| P2 - Feature Parity | 10 | 2 | 0 | 8 | 20% |
| P3 - Enhancement | 8 | 0 | 0 | 8 | 0% |
| **TOTAL** | **38** | **8** | **0** | **30** | **21%** |

**Target: 100% Bible Flow Coverage**

---

## TEST WAVE PLANNING

### Wave 1: Critical Security & Core (P0 + P1 Priority)
**Estimated: 20 test suites, ~500 test cases**
**Target: 2026-01-28**

### Wave 2: Feature Parity (P2)
**Estimated: 10 test suites, ~200 test cases**
**Target: 2026-01-29**

### Wave 3: Enhancement & Edge Cases (P3)
**Estimated: 8 test suites, ~150 test cases**
**Target: 2026-01-30**

---

# ═══════════════════════════════════════════════════════════════════════════════
# WAVE 1: CRITICAL SECURITY & CORE
# ═══════════════════════════════════════════════════════════════════════════════

## P0-001: Password Validation Tests
- **Status**: [ ] Pending
- **Bible**: 05-TECH/06-security.md, T-006
- **Test File**: `packages/api/src/services/auth.service.test.ts` (extend)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Min length enforcement (10 chars)
  - [ ] Uppercase requirement
  - [ ] Lowercase requirement
  - [ ] Number requirement
  - [ ] Special char requirement
  - [ ] Common password rejection (list check)
  - [ ] HaveIBeenPwned API integration
  - [ ] Password history check (last 5)
  - [ ] Argon2id hashing verification
  - [ ] Legacy scrypt backward compatibility
- **Bible Compliance**: T-006 (Argon2id, NOT bcrypt)
- **Estimated Cases**: 20

## P0-002: Session Management Tests
- **Status**: [ ] Pending
- **Bible**: 05-TECH/06-security.md, T-005
- **Test File**: `packages/api/src/test/session.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Access token 15min expiry
  - [ ] Refresh token 7day expiry
  - [ ] Max 5 sessions per user
  - [ ] Oldest session revoked on 6th
  - [ ] Session revocation
  - [ ] Concurrent session handling
  - [ ] Token refresh flow
  - [ ] Invalid token rejection
  - [ ] Expired token cleanup
- **Bible Compliance**: T-005, P-035
- **Estimated Cases**: 15

## P0-003: 2FA (TOTP) Tests
- **Status**: [ ] Pending
- **Bible**: 02-USERS/04-verification-levels.md, 05-TECH/06-security.md
- **Test File**: `packages/api/src/test/2fa.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] TOTP secret generation
  - [ ] QR code generation
  - [ ] 2FA enable flow
  - [ ] 2FA verify flow
  - [ ] 2FA disable flow (requires password)
  - [ ] Backup codes generation (10 codes)
  - [ ] Backup code usage (single use)
  - [ ] Invalid TOTP rejection
  - [ ] Time window tolerance (30s)
  - [ ] Rate limiting (3 attempts/10min)
- **Bible Compliance**: P-058 (rate limits)
- **Estimated Cases**: 18

## P0-004: Rate Limiting Tests
- **Status**: [ ] Pending
- **Bible**: 00-MASTER/DECISIONS.md, P-058
- **Test File**: `packages/api/src/test/rate-limit.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Global: anonymous 100/min, authenticated 300/min
  - [ ] Auth: login 5/15min, register 3/hour, passwordReset 3/hour
  - [ ] Creation: poll (free 3/day, plus 10/day, premium 50/day)
  - [ ] Participation: vote 1/forever, pretest 3/24h, comment 30/hour
  - [ ] Live Poll: create 5/day, join 10/min, vote 60/min
  - [ ] DM: free 0, plus 25/day, premium 1000/day
  - [ ] Exponential backoff for brute force
  - [ ] Rate limit headers (X-RateLimit-*)
  - [ ] 429 Too Many Requests response
  - [ ] Tier-based limit differences
- **Bible Compliance**: P-058
- **Estimated Cases**: 25

## P0-005: Tier Quota Enforcement Tests
- **Status**: [ ] Pending
- **Bible**: 02-USERS/01-user-types.md, P-027
- **Test File**: `packages/api/src/test/tier-quota.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] FREE: 3 polls/day, 3 tests/week, 2-4 options
  - [ ] PLUS: 10 polls/day, 10 tests/week, 2-6 options
  - [ ] PREMIUM: unlimited polls, unlimited tests, 2-10 options
  - [ ] Poll option limits enforcement
  - [ ] Tests per week reset logic
  - [ ] DM limits (0/25/1000)
  - [ ] Live poll access (Premium only)
  - [ ] Pre-test access (Premium only)
  - [ ] Quota exceeded error messages
- **Bible Compliance**: P-027, P-014
- **Estimated Cases**: 20

## P0-006: Verification Level Tests
- **Status**: [ ] Pending
- **Bible**: 02-USERS/04-verification-levels.md, P-004
- **Test File**: `packages/api/src/test/verification.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Level 0 (NONE): 0.5x weight
  - [ ] Level 1 (BASIC): 1.0x weight
  - [ ] Level 2 (VERIFIED): 1.1x weight
  - [ ] Level 3 (IDENTITY): 1.2x weight
  - [ ] Level 4 (FULLY_VERIFIED): 1.5x weight
  - [ ] Email verification flow
  - [ ] Phone verification flow (deferred - requires SMS)
  - [ ] e-Devlet integration (Level 3)
  - [ ] Organization verification (Level 4)
  - [ ] Verification upgrade flow
  - [ ] Weight calculation in responses
- **Bible Compliance**: P-004
- **Estimated Cases**: 16

## P0-007: Content Lock Tests
- **Status**: [x] Completed (verify existing)
- **Bible**: 00-MASTER/DECISIONS.md, P-106
- **Test File**: Verify in poll/survey/test service tests
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [x] Poll: Cannot edit after publish (status !== DRAFT)
  - [x] Survey: Cannot edit after publish
  - [x] Test: Cannot edit after publish
  - [x] POLL_LOCKED error code
  - [x] SURVEY_LOCKED error code
  - [x] TEST_LOCKED error code
- **Bible Compliance**: P-106
- **Estimated Cases**: 10 (already exists)

## P0-008: GDPR Compliance Tests
- **Status**: [ ] Pending
- **Bible**: 05-TECH/06-security.md
- **Test File**: `packages/api/src/test/gdpr.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Data export (all user data)
  - [ ] Account deletion request
  - [ ] 30-day grace period
  - [ ] Cancel deletion within grace period
  - [ ] Deletion after grace period (anonymization)
  - [ ] Data portability (JSON format)
  - [ ] Right to be forgotten
  - [ ] Consent tracking
  - [ ] Data retention policies
- **Bible Compliance**: GDPR/KVKK
- **Estimated Cases**: 15

## P1-001: Pre-test Screening Tests
- **Status**: [x] Completed (2026-01-27 22:48)
- **Bible**: 03-FEATURES/01-polls.md, P-007, P-014, P-030, P-108
- **Test File**: `packages/api/src/services/pretest.service.test.ts`
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [x] 1-5 screening questions
  - [x] Passing threshold 50-100% (default 60%)
  - [x] Max 3 attempts with cooldown (60/120/1440 min)
  - [x] Friendly failure messages (no threshold exposure)
  - [x] Premium tier requirement check
  - [x] Question shuffling
  - [x] Min 2s per question enforcement
  - [x] Attempt tracking in DB
  - [x] Cooldown calculation
  - [x] Pass/fail logic
- **Bible Compliance**: P-007, P-014, P-030, P-108
- **Actual Cases**: 31 (all passing)

## P1-002: Reliability Score Tests
- **Status**: [ ] Pending
- **Bible**: 04-DATA/03-reliability-scoring.md, T-009
- **Test File**: `packages/api/src/test/reliability-score.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Sample Quality (35%) calculation
  - [ ] Response Quality (30%) calculation
  - [ ] Methodology (20%) calculation
  - [ ] Participant Verification (15%) calculation
  - [ ] Weighted average (0-100 score)
  - [ ] Score labels (Excellent/Good/Moderate/Limited/Low)
  - [ ] Content-type adjustments (Poll/Survey/Test)
  - [ ] Recommended sample size calculation
  - [ ] Edge cases (zero responses, all invalid)
  - [ ] Reliability factors JSON structure
- **Bible Compliance**: T-009, P-055
- **Estimated Cases**: 22

## P1-003: Response Quality Score Tests
- **Status**: [ ] Pending
- **Bible**: 04-DATA/02-quality-scoring.md, P-055
- **Test File**: `packages/api/src/test/response-quality.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Timing analysis (25%) - speeder/slowpoke detection
  - [ ] Consistency checks (25%) - straightliner detection
  - [ ] Engagement scoring (25%)
  - [ ] Attention checks (25%)
  - [ ] Overall quality score (0-100)
  - [ ] Quality levels (High/Medium/Low/Flagged)
  - [ ] Batch quality analysis
  - [ ] Edge cases (extreme timing, all same answer)
- **Bible Compliance**: P-055
- **Estimated Cases**: 20

## P1-004: Live Poll Waiting Room Tests
- **Status**: [ ] Pending
- **Bible**: 03-FEATURES/04-live-polls.md, P-040
- **Test File**: `packages/api/src/test/livepoll-waitingroom.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] FIFO queue (Redis sorted set)
  - [ ] Position updates every 5s
  - [ ] Spectator mode (view only)
  - [ ] Auto-promote on participant leave
  - [ ] Estimated wait time calculation
  - [ ] 90% soft cap enforcement
  - [ ] 10K hard cap enforcement
  - [ ] Max 5 min wait time
  - [ ] Queue expiry
  - [ ] Concurrent join handling
- **Bible Compliance**: P-040
- **Estimated Cases**: 18

## P1-005: Live Poll Reconnection Tests
- **Status**: [ ] Pending
- **Bible**: 03-FEATURES/04-live-polls.md, P-031
- **Test File**: `packages/api/src/test/livepoll-reconnect.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] 30s grace period (Redis TTL)
  - [ ] Restore vote on reconnect
  - [ ] Grace period expiry
  - [ ] Host disconnect handling (orphan mode)
  - [ ] Grace period remaining calculation
  - [ ] Session cleanup on end
  - [ ] Multiple disconnect/reconnect cycles
  - [ ] Invalid session rejection
- **Bible Compliance**: P-031
- **Estimated Cases**: 15

## P1-006: PULSE System Tests
- **Status**: [ ] Pending
- **Bible**: 03-FEATURES/05-pulse-comments.md, P-013, P-056
- **Test File**: `packages/api/src/test/pulse.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Real-time demographic breakdown (SSE)
  - [ ] Tier-based access (FREE participate, PLUS/PREMIUM immediate)
  - [ ] Personal result with comparison
  - [ ] Aggregate charts with vote counts
  - [ ] Shareable card generation
  - [ ] Highlights (consensus, divided, etc.)
  - [ ] Cache with TTL
  - [ ] Redis pub/sub (pulse:updates channel)
  - [ ] Demographic snapshot from responses
  - [ ] SSE connection handling
- **Bible Compliance**: P-013, P-056, P-060
- **Estimated Cases**: 20

## P1-007: Wilson Score & Comment Ranking Tests
- **Status**: [ ] Pending
- **Bible**: 05-TECH/01-architecture.md, T-002
- **Test File**: `packages/api/src/test/comment-ranking.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Wilson Score Interval calculation
  - [ ] Sort modes: best, top, new, controversial, qa
  - [ ] Time decay (24h half-life)
  - [ ] Engagement bonus (reply count)
  - [ ] Verification bonus (author level + creator badge)
  - [ ] Pinned comments prioritization
  - [ ] Controversial score calculation
  - [ ] Edge cases (zero votes, all downvotes)
- **Bible Compliance**: T-002
- **Estimated Cases**: 18

## P1-008: Comment Access Rules Tests
- **Status**: [ ] Pending
- **Bible**: 03-FEATURES/05-pulse-comments.md, P-060
- **Test File**: `packages/api/src/test/comment-access.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] FREE: Must participate to READ
  - [ ] PLUS/PREMIUM: Immediate READ access
  - [ ] All tiers: Must participate to WRITE
  - [ ] FREE participated: Voice access request (100+ chars)
  - [ ] Voice access approval/rejection
  - [ ] COMMENT_READ_DENIED error
  - [ ] COMMENT_WRITE_DENIED error
  - [ ] checkCommentAccess logic
  - [ ] requireCommentReadAccess middleware
  - [ ] requireCommentWriteAccess middleware
- **Bible Compliance**: P-060, P-109
- **Estimated Cases**: 20

## P1-009: Fraud Detection Tests
- **Status**: [ ] Pending
- **Bible**: 04-DATA/04-fraud-detection.md, P-057
- **Test File**: `packages/api/src/test/fraud-detection.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Phase 1 (preActionCheck): IP blocklist, device blocklist, velocity, trust score, duplicate
  - [ ] Phase 2 (postActionAnalysis): Timing, pattern (straightlining), network
  - [ ] FraudDetectionLog table (no responseId - P-057 privacy)
  - [ ] Two HMAC salts (PARTICIPANT_HASH_SALT vs FRAUD_SALT)
  - [ ] Auto-invalidate (>=70 score)
  - [ ] Auto-flag (>=50 score)
  - [ ] Moderation queue integration
  - [ ] IP prefix truncation (first 3 octets)
  - [ ] 30-day log expiry
  - [ ] Privacy preservation (no linkability)
- **Bible Compliance**: P-057
- **Estimated Cases**: 25

## P1-010: Target Audience Filtering Tests
- **Status**: [ ] Pending
- **Bible**: 03-FEATURES/01-polls.md
- **Test File**: `packages/api/src/test/targeting.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Demographic targeting (age, gender, location, education, employment)
  - [ ] TargetAudienceConfig validation
  - [ ] Eligibility checking with detailed results
  - [ ] Demographic snapshot builder
  - [ ] Reliability score impact calculation
  - [ ] Multiple criteria combination
  - [ ] Edge cases (empty criteria, all users eligible)
- **Bible Compliance**: 03-FEATURES/01-polls.md
- **Estimated Cases**: 16

## P1-011: Survey B2B Exclusive Tests
- **Status**: [ ] Pending
- **Bible**: 02-USERS/02-organization-roles.md, P-015
- **Test File**: `packages/api/src/test/survey-b2b.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] B2C user cannot create survey
  - [ ] Organization CREATOR can create survey
  - [ ] Organization ADMIN can create survey
  - [ ] Organization OWNER can create survey
  - [ ] Organization MEMBER cannot create survey
  - [ ] Organization ANALYST cannot create survey
  - [ ] SURVEY_B2B_REQUIRED error
  - [ ] checkB2BSurveyAccess logic
  - [ ] requireB2BSurveyAccess middleware
- **Bible Compliance**: P-015
- **Estimated Cases**: 12

## P1-012: Organization Role Permission Tests
- **Status**: [ ] Pending
- **Bible**: 02-USERS/02-organization-roles.md, P-102
- **Test File**: `packages/api/src/test/org-permissions.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] OWNER: Full control, billing, deletion (max 1, Level 4)
  - [ ] ADMIN: Members, settings, content, audit (max 5, Level 3)
  - [ ] MANAGER: Create surveys, team, view results
  - [ ] ANALYST: View results, export (read-only)
  - [ ] CREATOR: Create surveys, view own results
  - [ ] MEMBER: Participate only
  - [ ] Role constraints (max count, verification level)
  - [ ] hasOrgPermission() checks
  - [ ] meetsVerificationForRole() checks
  - [ ] Permission escalation prevention
- **Bible Compliance**: P-102, 02-USERS/02-organization-roles.md
- **Estimated Cases**: 22

---

# ═══════════════════════════════════════════════════════════════════════════════
# WAVE 2: FEATURE PARITY
# ═══════════════════════════════════════════════════════════════════════════════

## P2-001: Follow System Tests
- **Status**: [ ] Pending
- **Bible**: 03-FEATURES/08-social.md, P-022
- **Test File**: `packages/api/src/test/follow.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] One-way follows (Twitter-style)
  - [ ] Mutual follows = friends
  - [ ] Private profiles require approval (PENDING)
  - [ ] Follow request accept/reject
  - [ ] Followers/following lists with pagination
  - [ ] getRelationship utility (all states)
  - [ ] Follow notification (deferred)
  - [ ] Unfollow flow
  - [ ] Block removes follows
- **Bible Compliance**: P-022, 03-FEATURES/08-social.md
- **Estimated Cases**: 18

## P2-002: Block System Tests
- **Status**: [ ] Pending
- **Bible**: 03-FEATURES/08-social.md
- **Test File**: `packages/api/src/test/block.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Block user prevents follow
  - [ ] Block auto-removes existing follows
  - [ ] isBlocked check
  - [ ] isBlockedBidirectional check
  - [ ] Block/unblock flow
  - [ ] Blocked users list with pagination
  - [ ] Content visibility (blocked user cannot see blocker's content)
  - [ ] DM blocking (cannot message blocked users)
- **Bible Compliance**: 03-FEATURES/08-social.md
- **Estimated Cases**: 14

## P2-003: DM System Tests
- **Status**: [ ] Pending
- **Bible**: 03-FEATURES/08-social.md, P-022
- **Test File**: `packages/api/src/test/dm.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Text-only (max 2000 chars, no media)
  - [ ] Tier limits (FREE 0, PLUS 25/day, PREMIUM 1000/day)
  - [ ] Read receipts (markAsRead, readAt)
  - [ ] 1 year auto-delete (expiresAt, cleanup)
  - [ ] Conversations table (participants, unread counts)
  - [ ] DirectMessages table (status, delivery)
  - [ ] Block integration (cannot message blocked)
  - [ ] Archive conversation
  - [ ] Delete conversation
  - [ ] checkDMPermission logic
- **Bible Compliance**: P-022, P-058
- **Estimated Cases**: 20

## P2-004: Profile Visits Tests
- **Status**: [ ] Pending (deferred)
- **Bible**: 03-FEATURES/08-social.md
- **Test File**: `packages/api/src/test/profile-visits.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] PLUS/PREMIUM: See who visited
  - [ ] PREMIUM: Anonymous visit option
  - [ ] Visit tracking
  - [ ] Weekly insights email (deferred)
- **Bible Compliance**: 03-FEATURES/08-social.md
- **Estimated Cases**: 10

## P2-005: Hot Score Algorithm Tests
- **Status**: [x] Completed (verify existing)
- **Bible**: 03-FEATURES/06-feed-discovery.md
- **Test File**: Verify in algorithm tests
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [x] Reddit-style hot score (calculateHotScore)
  - [x] Time decay (45000s divisor, 12.5h half-life)
  - [x] Engagement weighting (logarithmic)
  - [x] Controversy score (calculateControversy)
  - [x] Best score (Wilson + time decay)
- **Bible Compliance**: 03-FEATURES/06-feed-discovery.md
- **Estimated Cases**: 12 (already exists)

## P2-006: Feed Algorithm Tests
- **Status**: [x] Completed (verify existing)
- **Bible**: 03-FEATURES/06-feed-discovery.md
- **Test File**: `packages/api/src/services/feed.service.test.ts`
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [x] Personalized feed (boosts followed users)
  - [x] Following feed (only followed users)
  - [x] For You feed (alias for personalized)
  - [x] Trending feed (sorted by hotScore)
  - [x] Discover feed (excludes followed)
  - [x] Category filtering
  - [x] Pagination
- **Bible Compliance**: 03-FEATURES/06-feed-discovery.md
- **Estimated Cases**: 8 (already exists)

## P2-007: Notification Preferences Tests
- **Status**: [ ] Pending (deferred)
- **Bible**: 03-FEATURES/07-notifications.md
- **Test File**: `packages/api/src/test/notification-prefs.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Per-category settings
  - [ ] Push/Email/In-app toggle
  - [ ] Digest frequency (daily/weekly)
- **Bible Compliance**: 03-FEATURES/07-notifications.md
- **Estimated Cases**: 10

## P2-008: Badge System Tests
- **Status**: [ ] Pending (deferred)
- **Bible**: 03-FEATURES/03-tests.md, P-017
- **Test File**: `packages/api/src/test/badges.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Personality test badges
  - [ ] Achievement badges
  - [ ] Shareable badge cards
  - [ ] Badge display on profile
- **Bible Compliance**: P-017
- **Estimated Cases**: 12

## P2-009: Advanced Analytics Tests
- **Status**: [ ] Pending (deferred)
- **Bible**: 03-FEATURES/01-polls.md
- **Test File**: `packages/api/src/test/analytics.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Poll creator analytics dashboard
  - [ ] Demographic breakdown
  - [ ] Time series data
  - [ ] Export (CSV/XLSX/JSON)
- **Bible Compliance**: 03-FEATURES/01-polls.md
- **Estimated Cases**: 15

## P2-010: Admin Dashboard Tests
- **Status**: [ ] Pending (deferred)
- **Bible**: 07-EDGE/01-edge-cases.md
- **Test File**: `packages/api/src/test/admin.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Platform analytics
  - [ ] User moderation
  - [ ] Content moderation queue
  - [ ] Feature flags
- **Bible Compliance**: 07-EDGE
- **Estimated Cases**: 18

---

# ═══════════════════════════════════════════════════════════════════════════════
# WAVE 3: ENHANCEMENT & EDGE CASES
# ═══════════════════════════════════════════════════════════════════════════════

## P3-001: Phone OTP Tests
- **Status**: [ ] Pending (deferred)
- **Bible**: 02-USERS/04-verification-levels.md
- **Test File**: `packages/api/src/test/phone-otp.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] SMS OTP send
  - [ ] 6-digit code, 10 min expiry
  - [ ] Level 1 verification requirement
- **Bible Compliance**: 02-USERS/04-verification-levels.md
- **Estimated Cases**: 10

## P3-002: e-Devlet Integration Tests
- **Status**: [ ] Pending
- **Bible**: 02-USERS/04-verification-levels.md
- **Test File**: `packages/api/src/test/edevlet.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] e-Devlet OAuth flow (initiate, callback)
  - [ ] TC Kimlik No validation (11-digit Luhn)
  - [ ] Link to existing account
  - [ ] Level 3 verification (auto-upgrade)
  - [ ] Birthdate parsing
  - [ ] User provisioning
- **Bible Compliance**: P-004, 02-USERS/04-verification-levels.md
- **Estimated Cases**: 14

## P3-003: Magic Link Tests
- **Status**: [ ] Pending (deferred)
- **Bible**: 05-TECH/06-security.md
- **Test File**: `packages/api/src/test/magic-link.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Magic link generation
  - [ ] 15 min expiry
  - [ ] Single use
  - [ ] Email delivery
- **Bible Compliance**: 05-TECH/06-security.md
- **Estimated Cases**: 8

## P3-004: Passkey/WebAuthn Tests
- **Status**: [ ] Pending (deferred)
- **Bible**: 05-TECH/06-security.md
- **Test File**: `packages/api/src/test/passkey.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] WebAuthn registration
  - [ ] WebAuthn authentication
  - [ ] Multiple passkeys per user
- **Bible Compliance**: 05-TECH/06-security.md
- **Estimated Cases**: 12

## P3-005: SSO (SAML/OIDC) Tests
- **Status**: [ ] Pending
- **Bible**: 05-TECH/06-security.md
- **Test File**: `packages/api/src/test/sso.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] SAML 2.0 flow (parseSAMLResponse, callback)
  - [ ] OIDC flow (getSSOAuthUrl, exchangeSSOCode)
  - [ ] Organization SSO config (ssoConfigs table)
  - [ ] Domain restrictions
  - [ ] Auto user provisioning
  - [ ] SSO error handling
- **Bible Compliance**: 05-TECH/06-security.md
- **Estimated Cases**: 16

## P3-006: Partykit Migration Tests
- **Status**: [ ] Pending (deferred)
- **Bible**: 00-MASTER/DECISIONS.md, P-056
- **Test File**: `packages/api/src/test/partykit.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Partykit WebSocket connection
  - [ ] Edge deployment
  - [ ] 10K+ concurrent support
  - [ ] Fallback to HTTP polling
- **Bible Compliance**: P-056
- **Estimated Cases**: 10

## P3-007: Meilisearch Tests
- **Status**: [ ] Pending (deferred)
- **Bible**: 05-TECH/01-architecture.md, T-013
- **Test File**: `packages/api/src/test/meilisearch.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Index sync (polls/surveys/users)
  - [ ] Real-time search
  - [ ] Faceted search
  - [ ] Search ranking
- **Bible Compliance**: T-013
- **Estimated Cases**: 12

## P3-008: Webhook System Tests
- **Status**: [ ] Pending (deferred)
- **Bible**: 05-TECH/01-architecture.md
- **Test File**: `packages/api/src/test/webhook.test.ts` (new)
- **Coverage Target**: 100%
- **Test Scenarios**:
  - [ ] Webhook endpoint registration
  - [ ] Event delivery with retries
  - [ ] Signature verification
  - [ ] Webhook logs
- **Bible Compliance**: 05-TECH/01-architecture.md
- **Estimated Cases**: 14

---

# ═══════════════════════════════════════════════════════════════════════════════
# TESTING METHODOLOGY
# ═══════════════════════════════════════════════════════════════════════════════

## Test Structure Pattern

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should handle success case', async () => {
      // Arrange
      // Act
      // Assert
    })

    it('should handle error case', async () => {
      // Arrange
      // Act
      // Assert
    })

    it('should comply with Bible rule X', async () => {
      // Bible compliance test
    })
  })
})
```

## Bible Compliance Verification

Her test suite şunları içermeli:
- [ ] Bible section referansı (header comment)
- [ ] Decision ID referansı (P-xxx, T-xxx, B-xxx)
- [ ] Bible kurallarına özel test case'ler
- [ ] Edge case coverage (07-EDGE)

## Coverage Requirements

- **Unit Tests**: >90% for services
- **Integration Tests**: >80% for controllers
- **E2E Tests**: Critical flows only
- **Bible Compliance**: 100%

---

# ═══════════════════════════════════════════════════════════════════════════════
# GAPS IDENTIFIED DURING TESTING
# ═══════════════════════════════════════════════════════════════════════════════

## Known Gaps (from GAPS.md)

### GAP-009: Pretest Service Schema Mismatch
- **Impact**: Cannot test pretest service until schema fixed
- **Action**: Fix schema before P1-001 tests

### GAP-010: Analytics Service Type Safety
- **Impact**: Analytics tests blocked
- **Action**: Convert raw SQL to Drizzle or add types

---

# ═══════════════════════════════════════════════════════════════════════════════
# TRACKING & REPORTING
# ═══════════════════════════════════════════════════════════════════════════════

## Test Execution Log

### Format
```markdown
## [TEST-XXX] YYYY-MM-DD HH:MM - Test Suite Name
- **Status**: STARTED / IN_PROGRESS / COMPLETED / BLOCKED
- **Bible Source**: XX-CATEGORY/file.md
- **Coverage**: X%
- **Cases**: Passed/Total
- **Duration**: Xms
- **Gaps Found**: List of GAP-XXX
- **Notes**: Any observations
```

## Daily Progress Report

Her gün sonunda:
- Total tests written: X
- Total tests passing: X
- Bible compliance: X%
- Gaps identified: X
- Gaps resolved: X

---

# ═══════════════════════════════════════════════════════════════════════════════
# END OF TEST MASTER PLAN
# ═══════════════════════════════════════════════════════════════════════════════
