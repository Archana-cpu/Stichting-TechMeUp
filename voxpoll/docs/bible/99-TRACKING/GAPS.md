# ═══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - KNOWN GAPS & ISSUES
# ═══════════════════════════════════════════════════════════════════════════════
# This file tracks known inconsistencies, missing implementations, and their
# resolutions between the bible documentation and actual code.
# ═══════════════════════════════════════════════════════════════════════════════

## Summary

| Status | Count |
|--------|-------|
| [ ] Open | 6 |
| [x] Resolved | 15 |
| [~] Deferred | 0 |

---

## Open Gaps

## [GAP-011] Missing FRAUD_DETECTION_SALT [OPEN]
- **Date**: 2026-01-27 22:35
- **Status**: [ ] Open
- **Bible Source**: 08-AUTHORITATIVE/final-decisions.md#P-057
- **Code Location**: packages/api/src/lib/hash.ts
- **Description**: Bible P-057 requires TWO separate HMAC salts for privacy-preserving fraud detection:
  1. `PARTICIPANT_HASH_SALT` - for participant anonymization (exists at hash.ts:56-75)
  2. `FRAUD_DETECTION_SALT` - for fraud log fingerprint hashing (MISSING)

  Current implementation only has PARTICIPANT_HASH_SALT. The fraud service should hash device fingerprints with a SEPARATE salt (different from participant hashing) to ensure FraudDetectionLog cannot be correlated with participant data.
- **Impact**:
  - Low security risk (fraud logs still use hashing)
  - Medium privacy risk (same salt could allow correlation)
  - High Bible compliance issue (P-057 requirement)
- **Required Action**:
  1. Add FRAUD_DETECTION_SALT environment variable
  2. Create `generateFraudDetectionHash(deviceFingerprint: string): string` function in hash.ts
  3. Update fraud.service.ts to use separate hash for FraudDetectionLog.fingerprintHash
  4. Ensure NO linkability between participant hashes and fraud hashes
- **Priority**: Medium
- **Found By**: Claude TESTER 1 during P1-009 test suite creation
- **Test Coverage**: Documented in packages/api/src/test/fraud-detection.test.ts (GAPS IDENTIFIED section)

## [GAP-012] Device Fingerprint in Pretest Schema [P2]
- **Date**: 2026-01-27
- **Status**: [ ] Open
- **Priority**: P2 - Medium (Privacy Architecture)
- **Bible Source**: 08-AUTHORITATIVE/final-decisions.md#P-057
- **Code Location**: packages/database/src/db/schema/polls.ts:290
- **Description**: Bible P-057 privacy architecture specifies device fingerprints should only be stored in FraudDetectionLog (hashed, 30-day expiry). The `pretestAttempts` table still has `deviceFingerprint: varchar('deviceFingerprint', { length: 64 })` field.
- **Impact**: Privacy architecture violation - retains fingerprints longer than necessary
- **Required Action**:
  1. Remove `deviceFingerprint` field from `pretestAttempts` table
  2. Add `deviceCategory` enum field instead
  3. Create migration to remove existing deviceFingerprint data

## [GAP-013] OTP Verification Rate Limit Missing [RESOLVED]
- **Date**: 2026-01-27
- **Resolution Date**: 2026-01-27 23:45
- **Status**: [x] Resolved
- **Priority**: P0 - Critical (Security)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058
- **Code Location**: packages/api/src/middleware/rate-limit.ts:127
- **Description**: Bible P-058 specifies OTP verification must be rate-limited to 3 attempts per 10 minutes. No rate limit existed.
- **Resolution**: Added `otpVerify: { limit: 3, window: 600, prefix: 'rl:auth:otp-verify' }` to RATE_LIMITS at line 127

## [GAP-014] Premium Poll Creation Limit Clarification Needed
- **Date**: 2026-01-27
- **Status**: [ ] Open
- **Priority**: Clarification Needed
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058 vs packages/api/src/constants/limits.ts:115
- **Code Location**: packages/api/src/constants/limits.ts:115
- **Description**:
  - Bible P-058 says: "Premium: 50 polls/day"
  - Code implements: `pollsPerDay: -1 // P-058: unlimited`
- **Impact**: Conflicting specifications - need Product Manager decision
- **Required Action**: DECISION NEEDED:
  1. **Option A**: Update Bible P-058 to say "Premium: unlimited polls"
  2. **Option B**: Update code to `pollsPerDay: 50`
- **Recommendation**: Option A (keep unlimited) - Premium users expect unlimited as premium benefit

## [GAP-015] Live Poll Creation Window Incorrect [P2]
- **Date**: 2026-01-27
- **Status**: [ ] Open
- **Priority**: P2 - Medium (Business Logic)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058
- **Code Location**: packages/api/src/middleware/rate-limit.ts:45
- **Description**: Bible P-058 specifies "5 live polls per day", but code implements `window: 3600` (5 per hour).
- **Impact**: Users can create 120 live polls/day instead of 5
- **Required Action**: Change `livePollCreate: { limit: 5, window: 3600 }` to `{ limit: 5, window: 86400 }`

## [GAP-016] Live Poll Join Rate Incorrect [P2]
- **Date**: 2026-01-27
- **Status**: [ ] Open
- **Priority**: P2 - Medium (Business Logic)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058
- **Code Location**: packages/api/src/middleware/rate-limit.ts:46
- **Description**: Bible P-058 specifies "10 live poll joins per minute", but code implements `limit: 30`.
- **Impact**: Users can join 30 live polls/min instead of 10
- **Required Action**: Change `livePollJoin: { limit: 30, window: 60 }` to `{ limit: 10, window: 60 }`

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

## [GAP-021] Exponential Backoff Not Implemented [P1]
- **Date**: 2026-01-27
- **Status**: [ ] Open
- **Priority**: P1 - High (Security Enhancement)
- **Bible Source**: 00-MASTER/DECISIONS.md#P-058
- **Code Location**: packages/api/src/constants/limits.ts:44
- **Description**: Bible P-058 mentions "exponential backoff" for live poll code guessing and authentication. Comment exists in code but no implementation: `// 5 per 5 min + exponential backoff`
- **Impact**: Missing security enhancement - allows consistent attack rate
- **Required Action**: Implement exponential backoff for:
  1. Live poll code guessing (after each failed attempt)
  2. Authentication failures (progressive lockout)

---

## Resolved Gaps

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

- **Last Updated**: 2026-01-27 23:50
- **Total Gaps**: 21
- **Open**: 6
- **Resolved**: 15
- **Deferred**: 0

---

# ═══════════════════════════════════════════════════════════════════════════════
# END OF GAPS
# ═══════════════════════════════════════════════════════════════════════════════
