# ═══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - KNOWN GAPS & ISSUES
# ═══════════════════════════════════════════════════════════════════════════════
# This file tracks known inconsistencies, missing implementations, and their
# resolutions between the bible documentation and actual code.
# ═══════════════════════════════════════════════════════════════════════════════

## Summary

| Status | Count |
|--------|-------|
| [ ] Open | 1 |
| [x] Resolved | 22 |
| [~] Deferred | 0 |

---

## Open Gaps

## [GAP-019] P-040 Live Poll Waiting Room System Missing
- **Date**: 2026-01-29
- **Status**: [ ] Open
- **Priority**: P1 - High (Premium Feature - P-040)
- **Bible Source**: 03-FEATURES/04-live-polls.md, P-040
- **Code Location**: apps/api/src/services/livepoll.service.ts, apps/api/src/services/websocket.service.ts
- **Description**: Bible P-040 specifies a three-tier capacity handling system (80% WARNING, 90% SOFT CAP with Waiting Room, 100% HARD CAP with spectator mode). Current implementation only has simple hard cap at 10K participants without waiting room functionality.
- **Missing Features**:
  1. 80% capacity (8,000 participants) - WARNING PHASE:
     - Host notification (in-app banner)
     - Participant experience remains NORMAL
  2. 90% capacity (9,000 participants) - SOFT CAP (Waiting Room):
     - FIFO queue using Redis sorted set
     - Position tracking (show "Position: 42 in queue")
     - Estimated wait time calculation
     - Max 5 minute wait time (maxWaitingTime: 300s)
     - Allow leave queue option
     - Auto-promote to active when participant leaves
  3. 100% capacity (10,000 participants) - HARD CAP:
     - Reject new joins with message
     - Offer spectator mode (view only)
     - Options: "View Results", "Notify When Space Opens", "Leave"
  4. Queue Management:
     - Redis sorted set: `live:{sessionCode}:waitingRoom` (score = timestamp)
     - Auto-admit from queue when participant leaves (FIFO)
     - Broadcast position updates every 5s
     - Queue expiry handling
- **Current Behavior**: Simple capacity check throws SESSION_FULL error at 10,000 participants
- **Expected Behavior**: Gradual degradation with waiting room queue at 90%, spectator mode at 100%
- **Developer TODO**:
  1. Create `apps/api/src/services/livepoll-waitingroom.service.ts` with queue management
  2. Update `websocket.service.ts` handleJoin to check capacity tiers (80%, 90%, 100%)
  3. Implement Redis sorted set operations for FIFO queue
  4. Implement position tracking and estimated wait time calculation
  5. Implement auto-promote from queue on participant disconnect
  6. Add WebSocket events: WAITING_ROOM_JOINED, QUEUE_POSITION_UPDATE, PROMOTED_FROM_QUEUE
  7. Create test suite: `apps/api/src/test/livepoll-waitingroom.test.ts`
- **Impact**: Premium feature (Live Polls) lacks critical capacity management for large audiences

---

## Resolved Gaps

## [GAP-018] Response Quality Score Weights Mismatch [RESOLVED]
- **Date**: 2026-01-29
- **Resolution Date**: 2026-01-29 00:25
- **Status**: [x] Resolved
- **Priority**: P1 - High (Core Differentiator - P-055)
- **Bible Source**: 04-DATA/02-quality-scoring.md, P-055
- **Code Location**: packages/algorithms/src/scoring/response-quality.ts (deprecated), packages/api/src/services/response-quality.service.ts (new)
- **Description**: Bible P-055 specifies 4 equal-weight components (timing 25%, consistency 25%, engagement 25%, attentionChecks 25%) with thresholds (>=70 INCLUDE, 40-69 REVIEW, <40 EXCLUDE). Existing implementation had 6 components with different weights and thresholds.
- **Resolution**:
  1. ✅ Created new Bible-compliant service: packages/api/src/services/response-quality.service.ts
  2. ✅ Implemented 4 equal-weight components (25% each)
  3. ✅ Implemented correct thresholds (INCLUDE >=70, REVIEW 40-69, EXCLUDE <40)
  4. ✅ Created comprehensive test suite: response-quality.service.test.ts (22/22 tests passing)
  5. ✅ Engagement component includes gibberish detection, diversity checks
  6. ✅ Consistency component detects straightlining with variance analysis
  7. ✅ Timing component detects speeding (<30% min) and slowpoke (>3x max)
- **Impact**: Core quality scoring algorithm now fully P-055 compliant

## [GAP-011] Missing FRAUD_DETECTION_SALT [RESOLVED]
- **Date**: 2026-01-27 22:35
- **Resolution Date**: 2026-01-28 01:20
- **Status**: [x] Resolved
- **Priority**: Medium (Privacy Architecture - P-057)
- **Bible Source**: 08-AUTHORITATIVE/final-decisions.md#P-057
- **Code Location**: packages/api/src/lib/hash.ts, packages/api/src/services/fraud.service.ts
- **Description**: Bible P-057 requires TWO separate HMAC salts for privacy-preserving fraud detection. Only PARTICIPANT_HASH_SALT existed.
- **Resolution**:
  1. ✅ FRAUD_DETECTION_SALT already exists in .env.example (line 33)
  2. ✅ Created `generateFraudDetectionHash()` function in hash.ts (line 83-115)
  3. ✅ Updated fraud.service.ts to use separate hash (line 520-543)
  4. ✅ Removed manual crypto code, now uses centralized hash function
  5. ✅ Ensured NO linkability between participant hashes and fraud hashes (different salts)
- **Impact**: Privacy architecture now fully P-057 compliant

## [GAP-012] Device Fingerprint in Pretest Schema [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-28 00:10
- **Status**: [x] Resolved
- **Priority**: P2 - Medium (Privacy Architecture)
- **Bible Source**: 08-AUTHORITATIVE/final-decisions.md#P-057
- **Code Location**: packages/database/src/db/schema/polls.ts:290
- **Description**: Bible P-057 privacy architecture specifies device fingerprints should only be stored in FraudDetectionLog (hashed, 30-day expiry). The `pretestAttempts` table had `deviceFingerprint: varchar('deviceFingerprint', { length: 64 })` field.
- **Impact**: Privacy architecture violation - retained fingerprints longer than necessary
- **Resolution**:
  1. ✅ Removed `deviceFingerprint` field from `pretestAttempts` table schema
  2. ✅ Added `deviceCategory: deviceCategoryEnum('deviceCategory')` field
  3. ✅ Created migration 0002_remove_pretest_device_fingerprint.sql
  4. ✅ Updated pretest.service.ts submitAnswers signature (deviceFingerprint → deviceCategory)

## [GAP-013] OTP Verification Rate Limit Missing [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27 23:45
- **Status**: [x] Resolved
- **Priority**: P0 - Critical (Security)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058
- **Code Location**: packages/api/src/middleware/rate-limit.ts:127
- **Description**: Bible P-058 specifies OTP verification must be rate-limited to 3 attempts per 10 minutes. No rate limit existed.
- **Resolution**: Added `otpVerify: { limit: 3, window: 600, prefix: 'rl:auth:otp-verify' }` to RATE_LIMITS at line 127

## [GAP-014] Premium Poll Creation Limit Clarification [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-28 01:05
- **Status**: [x] Resolved
- **Priority**: Clarification (Product Decision)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058
- **Code Location**: packages/api/src/constants/limits.ts:115
- **Description**: Bible P-058 specified "Premium: 50 polls/day" but code implemented unlimited (`pollsPerDay: -1`).
- **Decision**: Option A - Update Bible to match code (Premium: unlimited)
- **Resolution**: Updated Bible DECISIONS.md P-058: "premium 50/day" → "premium unlimited"
- **Rationale**: Premium tier value proposition requires unlimited poll creation. Code remains unchanged.

## [GAP-015] Live Poll Creation Window Incorrect [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27 22:50
- **Status**: [x] Resolved
- **Priority**: P2 - Medium (Business Logic)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058
- **Code Location**: packages/api/src/middleware/rate-limit.ts:138
- **Description**: Bible P-058 specifies "5 live polls per day", but code implemented `window: 3600` (5 per hour).
- **Resolution**: Changed `livePollCreate` window from 3600 to 86400 seconds. Comment updated to "5 per day (P-058)".

## [GAP-016] Live Poll Join Rate Incorrect [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27 22:50
- **Status**: [x] Resolved
- **Priority**: P2 - Medium (Business Logic)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058
- **Code Location**: packages/api/src/middleware/rate-limit.ts:139
- **Description**: Bible P-058 specifies "10 live poll joins per minute", but code implemented `limit: 30`.
- **Resolution**: Changed `livePollJoin` limit from 30 to 10. Comment updated to "10 per minute (P-058)".

## [GAP-017] Vote Per Poll Allows Duplicate Voting [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27 23:45
- **Status**: [x] Resolved
- **Priority**: P0 - Critical (Business Logic)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058
- **Code Location**: packages/api/src/middleware/rate-limit.ts:133
- **Description**: Bible P-058 specifies "1 vote per poll forever", but code implemented `window: 60` which allowed re-voting after 60 seconds.
- **Resolution**: Changed `votePerPoll` window from 60 seconds to 31536000 seconds (1 year = effectively permanent). Comment updated to reflect P-058 requirement.

## [GAP-018] Pretest Rate Limit Missing [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27 23:45
- **Status**: [x] Resolved
- **Priority**: P0 - Critical (Security)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058
- **Code Location**: packages/api/src/middleware/rate-limit.ts:135
- **Description**: Bible P-058 specifies pretest submission must be rate-limited to 3 attempts per 24 hours. No rate limit existed.
- **Resolution**: Added `pretestSubmit: { limit: 3, window: 86400, prefix: 'rl:pretest:submit' }` to RATE_LIMITS at line 135

## [GAP-019] Rate Limit Error Exposes Threshold [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27 23:45
- **Status**: [x] Resolved
- **Priority**: P0 - Critical (Security)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-059
- **Code Location**: packages/api/src/middleware/rate-limit.ts:225
- **Description**: Bible P-059 prohibits exposing numeric thresholds. Error message exposed: `Rate limit exceeded. Try again in ${retryAfter} seconds.`
- **Resolution**: Replaced with generic message: "Rate limit exceeded. Please try again later." (P-059 compliant)

## [GAP-020] Auth Errors Expose Timing Information [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27 23:45
- **Status**: [x] Resolved
- **Priority**: P0 - Critical (Security)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-059
- **Code Location**: packages/api/src/services/auth.service.ts:131, 160
- **Description**: Bible P-059 prohibits exposing numeric thresholds. Auth service exposed lockout timing information.
- **Resolution**: Replaced both error messages with generic message: "Account temporarily locked. Please try again later." at lines 131 and 160 (P-059 compliant)

---

## Resolved Gaps

## [GAP-021] Exponential Backoff Not Implemented [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-28 00:45
- **Status**: [x] Resolved
- **Priority**: P1 - High (Security Enhancement)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058
- **Code Location**: packages/api/src/middleware/rate-limit.ts:390-520
- **Description**: Bible P-058 requires exponential backoff for brute force protection (live poll code, OTP, auth)
- **Resolution**:
  1. Authentication progressive lockout: Already implemented in auth.service.ts:39-177 (5 fails → 15 min lockout)
  2. Exponential backoff middleware: Implemented at rate-limit.ts:390-520
     - Pattern: 0s → 1s → 2s → 4s → 8s → 16s (max)
     - Redis Lua script for atomic operations
     - Pre-configured for live poll code guessing and OTP verification
     - P-058 compliant with generic error messages (P-059)

## [GAP-010] Analytics Service Raw SQL Type Casting [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27 19:00
- **Status**: [x] Resolved
- **Bible Source**: N/A (Technical debt)
- **Code Location**: packages/api/src/services/analytics.service.ts
- **Description**: analytics.service.ts used raw SQL queries with `db.execute()` that return `RowList<Record<string, unknown>[]>`. TypeScript could not verify these types at compile time, causing type casting errors.
- **Resolution**:
  1. Created proper type definitions for raw SQL query results (TimelineQueryRow, ViewsQueryRow, TimelineWithViewsRow, SurveyTimelineRow, TestTimelineRow, ResponseCountRow)
  2. Used `db.execute<RowType>(sql...)` with typed generics instead of `db.execute<ArrayType>(sql...)`
  3. Converted PostgreSQL values to `::text` in SQL and parsed with `parseInt()` in TypeScript
  4. Added null-safety checks for Record access with `(value || 0) + 1` pattern
  5. Removed `@ts-nocheck` directive - service is now fully type-safe
  6. Verified with `pnpm tsc --noEmit` - zero type errors
- **Impact**: Type safety restored, no runtime behavior change
- **Commit/PR**: Pending

## [GAP-009] Pretest Service Schema Mismatch [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27 18:45
- **Status**: [x] Resolved
- **Bible Source**: 03-FEATURES/01-polls.md#Pre-test
- **Code Location**: packages/api/src/services/pretest.service.ts
- **Description**: pretest.service.ts referenced non-existent schema elements:
  1. ~~`pretestAttempts` table - does not exist~~ (Actually exists at line 285-304 in polls.ts)
  2. `polls.pretestConfig` - should be `polls.preTestQuestions`
  3. `polls.creatorTier` - does not exist
  4. ~~`ERROR_CODES.PRETEST_MAX_ATTEMPTS` - not defined~~ (Actually defined at line 72 in messages.ts)
- **Resolution**:
  1. Replaced `polls.pretestConfig` with `polls.hasPreTest`, `polls.preTestQuestions`, `polls.preTestPassingScore`
  2. Removed `polls.creatorTier` reference from getPollWithPretest method
  3. Fixed orderBy to use `desc(pretestAttempts.createdAt)` instead of raw SQL
  4. Removed type casting `as Record<string, unknown>` from insert operation
  5. Removed `@ts-nocheck` directive - service now fully type-safe
- **Commit/PR**: Pending

## [GAP-008] Poll Results Cache Duration [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27
- **Status**: [x] Resolved
- **Bible Source**: 00-MASTER/DECISIONS.md#P-034
- **Code Location**: packages/api/src/constants/limits.ts
- **Description**: Bible P-034 specifies 5 minutes cache for poll results, but code was using 30 seconds
- **Resolution**: Updated CACHE_TTL.pollResults from 30 to 300 seconds
- **Commit/PR**: Pending

## [GAP-007] Poll Option Limits Inconsistency [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27
- **Status**: [x] Resolved
- **Bible Source**: 00-MASTER/DECISIONS.md#P-027
- **Code Location**: packages/api/src/constants/limits.ts
- **Description**: TIER_QUOTAS.maxPollOptions values were inconsistent with Bible P-027 and rate-limit.ts (FREE: 5 instead of 4, PLUS: 10 instead of 6, PREMIUM: 20 instead of 10)
- **Resolution**: Updated TIER_QUOTAS values to match Bible P-027
- **Commit/PR**: Pending

## [GAP-006] FraudDetectionLog Expiry Duration [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27
- **Status**: [x] Resolved
- **Bible Source**: 08-AUTHORITATIVE/final-decisions.md#P-057
- **Code Location**: packages/api/src/services/fraud.service.ts:553
- **Description**: Bible P-057 specifies 30 days expiry for FraudDetectionLog, but code was using 90 days
- **Resolution**: Changed expiry from 90 days to 30 days in fraud.service.ts line 553
- **Commit/PR**: Pending

## [GAP-001] Password Hashing Algorithm [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27
- **Status**: [x] Resolved
- **Bible Source**: 00-MASTER/DECISIONS.md#T-006
- **Code Location**: packages/api/src/lib/auth.ts
- **Description**: Bible T-006 requires Argon2id, but code was using scrypt
- **Resolution**: Updated hashPassword and verifyPassword functions to use @node-rs/argon2. Added backward compatibility for legacy scrypt hashes
- **Commit/PR**: Pending

## [GAP-002] Reliability Score Components [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27
- **Status**: [x] Resolved
- **Bible Source**: 00-MASTER/DECISIONS.md#T-009
- **Code Location**: packages/api/src/services/algorithm.service.ts
- **Description**: Bible T-009 requires tracking 4 separate components (Sample 35%, Response 30%, Methodology 20%, Verification 15%). Code only used a single reliabilityScore
- **Resolution**: Updated calculateReliabilityScore function to comply with Bible T-009. Components are now saved to reliabilityFactors JSON field
- **Commit/PR**: Pending

## [GAP-003] Tier-Based Rate Limiting [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27
- **Status**: [x] Resolved
- **Bible Source**: 00-MASTER/DECISIONS.md#P-027, P-101
- **Code Location**: packages/api/src/middleware/rate-limit.ts
- **Description**: Rate limiting was not tier-aware (same limits for FREE/PLUS/PREMIUM)
- **Resolution**: Added TIER_LIMITS constant and tierRateLimit middleware. Poll/test/survey/DM limits are now adjusted by tier
- **Commit/PR**: Pending

## [GAP-004] PULSE Access Control [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27
- **Status**: [x] Resolved
- **Bible Source**: 03-FEATURES/05-pulse-comments.md
- **Code Location**: packages/api/src/middleware/permissions.ts
- **Description**: FREE users could view results without participating
- **Resolution**: Added checkPulseAccess and requirePulseAccess functions. FREE users require participation, PLUS/PREMIUM have direct access
- **Commit/PR**: Pending

## [GAP-005] Missing Database Indexes [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27
- **Status**: [x] Resolved
- **Bible Source**: 05-TECH/02-database-schema.md
- **Code Location**: packages/database/src/db/schema/polls.ts, surveys.ts
- **Description**: Missing deviceCategory and ipPrefix indexes for fraud analysis
- **Resolution**: Added deviceCategory and ipPrefix indexes to poll_responses and survey_responses tables
- **Commit/PR**: Pending

---

## Deferred Gaps

<!-- Intentionally deferred gaps go here -->

---

## Gap Categories

### Missing Spec (MISSING_SPEC)
Specifications that should exist in the bible but are not documented

### Implementation Mismatch (IMPL_MISMATCH)
Inconsistencies between code implementation and bible documentation

### Conflict (CONFLICT)
Conflicts between different bible sections

### Deprecated (DEPRECATED)
Rules in the bible that are no longer valid

---

## Quick Stats

- **Last Updated**: 2026-01-28 01:05
- **Total Gaps**: 21
- **Open**: 2
- **Resolved**: 19
- **Deferred**: 0

---

# ═══════════════════════════════════════════════════════════════════════════════
# END OF GAPS
# ═══════════════════════════════════════════════════════════════════════════════
