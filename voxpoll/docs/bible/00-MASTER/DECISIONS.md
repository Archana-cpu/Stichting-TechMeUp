# ═══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - UNIFIED DECISIONS REGISTRY
# ═══════════════════════════════════════════════════════════════════════════════
# Tum P-xxx, T-xxx ve B-xxx kararlari bu dosyada toplanmistir.
# Bu dosya authoritative'dir - celiskilerde bu dosya gecerlidir.
# Son Guncelleme: 2026-01-27
# ═══════════════════════════════════════════════════════════════════════════════

## Decision ID Ranges

| Range | Category | Description |
|-------|----------|-------------|
| P-001 to P-010 | Core Architectural | Temel mimari kararlar |
| P-011 to P-017 | Core Product | Urun davranis kurallari |
| P-027 to P-049 | Feature-specific | Ozellik bazli kararlar |
| P-055 to P-060 | Authoritative | Override eden son kararlar |
| P-101 to P-110 | Product Behavior | Ek urun davranis kurallari |
| T-001 to T-014 | Technical | Teknik kararlar |
| B-001 to B-005 | Business Model | Is modeli kararlari |

---

## Core Architectural Decisions (P-001 - P-010)

### P-001: Single Question Per Poll
- **Decision**: Her poll yalnizca bir soru icerir
- **Rationale**: Simplicity, clear engagement metrics
- **Status**: FINAL

### P-002: Content Types
- **Decision**: Uc temel icerik tipi: Poll, Survey, Test
- **Rationale**: Farkli use case'ler icin optimize edilmis yapilar
- **Status**: FINAL

### P-003: Reliability Score Range
- **Decision**: 0-100 araliginda reliability score
- **Rationale**: Intuitive interpretation
- **Status**: FINAL

### P-004: User Verification Levels
- **Decision**: 0-4 arasi verification seviyeleri
  - Level 0: Email only
  - Level 1: Phone verified
  - Level 2: Phone + Profile
  - Level 3: Phone + e-Devlet
  - Level 4: Phone + e-Devlet + Organization
- **Status**: FINAL

### P-005: Anonymity Architecture
- **Decision**: True anonymity - response ve user ID ayri saklanir
- **Status**: FINAL

### P-006: Minimum Sample Sizes
- **Decision**:
  - Absolute minimum: 30 responses
  - For confidence interval: 100 responses
  - For demographic breakdown: 50 responses
  - Per demographic group: 10 responses
- **Status**: FINAL

### P-007: Pre-test Layer System
- **Decision**: Pre-test 3 layer'a kadar: Demographic, Screening, Knowledge
- **Status**: FINAL

### P-008: Response Storage Pattern
- **Decision**: Anonymous responses icin poll_response + anonymous_demographics ayri tablolar
- **Status**: FINAL

### P-009: Trust Score Visibility
- **Decision**: User Trust Score ASLA kullaniciya gosterilmez, sadece internal kullanim
- **Status**: FINAL

### P-010: Organization Isolation
- **Decision**: Her organizasyon izole - cross-org data erisimi yok
- **Status**: FINAL

---

## Core Product Decisions (P-011 - P-017)

### P-011: Live Poll Feature
- **Decision**: LIVE POLL feature for real-time participation with link-join
- **Rationale**: Streamers, speakers, live audiences need instant feedback
- **Status**: FINAL

### P-012: Demographics Lock
- **Decision**: Demographics are LOCKED after registration (except marital status, profession)
- **Rationale**: Data integrity - prevents gaming surveys by changing demographics
- **Status**: FINAL

### P-013: PULSE + COMMENTS System
- **Decision**: PULSE + COMMENTS = Result + Discussion (Reddit/Insta/YouTube hybrid)
  - PULSE: Spotify-wrap style result visualization
  - COMMENTS: Forum discussion
- **Status**: FINAL

### P-014: Pre-test Premium Requirement
- **Decision**: Pre-test support for Polls requires PREMIUM tier
- **Rationale**: Quality filtering for polls; monetization lever
- **Status**: FINAL

### P-015: Surveys B2B Only
- **Decision**: Surveys are EXCLUSIVELY B2B SaaS (organizations only)
- **Rationale**: Clear product positioning; prevents confusion
- **Status**: FINAL

### P-016: Plus Tier PULSE/COMMENTS Access
- **Decision**: Plus tier grants PULSE/COMMENTS access without participation
- **Rationale**: Monetization for non-participants wanting to discuss
- **Details**: See P-060 for complete access matrix
- **Status**: FINAL

### P-017: Test Badge System
- **Decision**: Test results create profile BADGES displayed on user profile
- **Rationale**: Viral shareability and identity expression
- **Status**: FINAL

---

## Feature-Specific Decisions (P-027 - P-049)

### P-027: Tier-based Poll Option Limits
- **Decision**:
  - Free: 2-4 options (Quick Poll)
  - Plus: 2-4 options (Quick Poll)
  - Premium: 2-10 options (Extended Poll)
- **Status**: FINAL

### P-028: Unified Quality Thresholds
- **Decision**: Content type bazinda quality thresholds
- **Status**: FINAL

### P-029: Anonymous to User Conversion
- **Decision**: Anonymous user kayit olursa onceki responses anonymous kalir
- **Status**: FINAL

### P-030: Pre-test Failure Handling
- **Decision**: Pre-test fail eden user'a friendly message, content gosterilmez
- **Status**: FINAL

### P-031: Live Poll Disconnect Resilience
- **Decision**: 30 saniye timeout, reconnect restore
- **Status**: FINAL

### P-032: Comment Media Moderation
- **Decision**: Images require moderation before display
- **Status**: FINAL

### P-033: Multi-vote Prevention
- **Decision**: Device fingerprint + user ID + IP combination
- **Note**: See P-057 for privacy-preserving implementation
- **Status**: FINAL

### P-034: Result Caching
- **Decision**: 5 dakika cache (300 saniye), invalidate on new response
- **Status**: FINAL

### P-035: Rate Limiting
- **Decision**:
  - Register: 5/hour
  - Login: 10/hour
  - Password reset: 3/hour
  - Email verification: 3/hour
  - API general: 100/minute
- **Note**: See P-058 for complete rate limit specification
- **Status**: FINAL

### P-040: Live Poll Participant Limit
- **Decision**: Maximum 10,000 concurrent participants per live poll session
- **Status**: FINAL

---

## Authoritative Decisions (P-055 - P-060)

> Bu kararlar 08-AUTHORITATIVE klasorunden gelmektedir ve diger kaynaklari override eder.

### P-055: Quality Score Terminology
- **Decision**: Iki farkli kalite skoru sistemi:
  1. `ResponseQualityScore`: Per-response (timing 25%, consistency 25%, engagement 25%, attentionChecks 25%)
  2. `ReliabilityScore`: Per-content (sampleQuality 35%, responseQuality 30%, methodology 20%, participantVerification 15%)
- **Relationship**: ResponseQualityScore'larin AVG'si ReliabilityFactors.responseQuality'ye beslenir
- **Status**: FINAL [AUTHORITATIVE]

### P-056: Real-time Technology Stack
- **Decision**:
  - **SSE (Server-Sent Events)**: PULSE updates, notifications, feed refresh
  - **Partykit (Edge WebSocket)**: Live Poll real-time voting, result streaming, presence
- **Fallback Strategy**:
  1. SSE fails -> Long polling (5s intervals)
  2. Partykit fails -> HTTP polling (1s for Live Poll)
  3. All WebSocket blocked -> Graceful degradation message
- **Status**: FINAL [AUTHORITATIVE]

### P-057: Device Fingerprint Architecture
- **Decision**: Privacy-preserving fingerprint architecture:
  1. REMOVE `deviceFingerprint` field from response models
  2. ADD `deviceCategory` enum (DESKTOP/MOBILE/TABLET/UNKNOWN) - non-identifying
  3. CREATE `FraudDetectionLog` table (separate, unlinkable, 30-day auto-expiry)
  4. USE separate HMAC salts (PARTICIPANT_HASH_SALT != FRAUD_DETECTION_SALT)
- **Rationale**: Prevents deanonymization via device fingerprint correlation
- **Status**: FINAL [AUTHORITATIVE]

### P-058: Rate Limiting Thresholds
- **Decision**: Complete rate limit specification:
  ```
  Global: anonymous 100/min, authenticated 300/min
  Auth: login 5/15min, register 3/hour, passwordReset 3/hour, otpVerify 3/10min
  Creation: poll (free 3/day, plus 10/day, premium 50/day)
  Participation: vote 1/forever, pretest 3/24h, comment 30/hour
  Live Poll: create 5/day, join 10/min, vote 60/min
  Social DM: free 0, plus 25/day, premium 1000/day
  ```
- **Backoff**: Exponential backoff for brute force (login, OTP, live poll code)
- **Status**: FINAL [AUTHORITATIVE]

### P-059: Error Message Sanitization
- **Decision**: Production error messages MUST NOT expose:
  1. Numeric thresholds (timing limits, score values)
  2. Fraud detection details
  3. Algorithm hints
- **Example**: "Yanit sureniz cok kisa (12 saniye)" -> "Yanitiniz beklenenden hizli tamamlandi"
- **Rationale**: Prevents gaming of quality/fraud detection systems
- **Status**: FINAL [AUTHORITATIVE]

### P-060: Plus Tier Access Rules
- **Decision**: Complete access matrix for PULSE/COMMENTS:
  | Feature | Free (no participation) | Free (participated) | Plus | Premium |
  |---------|------------------------|---------------------|------|---------|
  | View Results | No | Yes | Yes | Yes |
  | View PULSE | No | Yes | Yes | Yes |
  | Read Comments | No | Yes | Yes | Yes |
  | Write Comments | No | Request Required (100+ chars) | Must participate | Must participate |
- **Note**: Plus/Premium bypasses READ access requirement, not WRITE access
- **Status**: FINAL [AUTHORITATIVE]

---

## Product Behavior Decisions (P-101 - P-110)

### P-101: Tests Have Unlimited Duration
- **Decision**: Tests have UNLIMITED duration (no expiry)
- **Rationale**: Evergreen content enables long-term viral growth
- **Status**: FINAL

### P-102: Profile Badges Are Optional
- **Decision**: Profile badges are OPTIONAL and can be non-serious
- **Rationale**: User choice; includes fun/non-serious badges for engagement
- **Status**: FINAL

### P-103: Discussion Write Access (ALIAS -> P-003)
- **Decision**: Discussion write access requires PARTICIPATION in the poll/test
- **Rationale**: Ensures quality, prevents drive-by trolling
- **Status**: FINAL

### P-104: Non-participant Access Request (ALIAS -> P-004)
- **Decision**: Non-participants can REQUEST discussion access (min 100 chars)
- **Rationale**: Flexibility with quality control; creator approves
- **Status**: FINAL

### P-105: No Advertisements
- **Decision**: NO ADVERTISEMENTS ever
- **Rationale**: User experience and trust are paramount
- **Status**: FINAL

### P-106: No Post-publish Edits
- **Decision**: Polls/Surveys/Tests CANNOT be edited after publishing
- **Rationale**: Absolute data integrity; prevents manipulation
- **Status**: FINAL

### P-107: Minimum Participant Count
- **Decision**: Minimum participant count is set by creator with consequences
- **Rationale**: Creator accountability with transparent consequences
- **Status**: FINAL

### P-108: Polite Pre-test Failure Messages
- **Decision**: Pre-test failure messages are POLITE and non-judgmental
- **Rationale**: UX priority; no harsh rejections that hurt users
- **Status**: FINAL

### P-109: Premium Cannot Bypass Participation
- **Decision**: Premium users CANNOT bypass participation requirement for writing comments
- **Rationale**: No pay-to-win on quality discussions
- **Status**: FINAL

### P-110: Result Visibility Rules
- **Decision**:
  - Participants see all
  - Premium sees all
  - Free non-participants see title only
- **Rationale**: Incentivize participation; monetization lever
- **Status**: FINAL

---

## Technical Decisions (T-001 - T-014)

### T-001: Framework Choice
- **Decision**: Hono (not Express)
- **Rationale**: 10x faster, edge-native
- **Status**: FINAL

### T-002: ORM Choice
- **Decision**: Drizzle ORM
- **Rationale**: Type-safe, no query overhead
- **Status**: FINAL

### T-003: Database
- **Decision**: PostgreSQL
- **Status**: FINAL

### T-004: Cache Layer
- **Decision**: Redis (ioredis)
- **Status**: FINAL

### T-005: Auth Token
- **Decision**: JWT (jose library)
- **Rationale**: Web Crypto API, modern
- **Status**: FINAL

### T-006: Password Hashing
- **Decision**: Argon2id (NOT bcrypt)
- **Library**: @node-rs/argon2
- **Note**: Migrated to Argon2id on 2026-01-27 with backward compatibility for legacy hashes
- **Status**: FINAL

### T-007: ID Generation
- **Decision**: CUID2
- **Rationale**: Distributed-friendly
- **Status**: FINAL

### T-008: Logging
- **Decision**: Pino
- **Rationale**: Fastest JSON logger
- **Status**: FINAL

### T-009: Reliability Score Calculation
- **Decision**: Weighted average of 4 categories:
  - Sample Quality: 35%
  - Response Quality: 30%
  - Methodology: 20%
  - Participant Verification: 15%
- **Status**: FINAL

### T-010: WebSocket Implementation
- **Decision**:
  - SSE via Vercel/Next.js for PULSE/notifications
  - Partykit for Live Poll (edge-native WebSocket)
  - Fallback: ws + Redis PubSub for self-hosted
- **Status**: FINAL

### T-011: Email Provider
- **Decision**: Resend (primary), AWS SES (fallback)
- **Status**: FINAL

### T-012: File Storage
- **Decision**: AWS S3 + CloudFront
- **Status**: FINAL

### T-013: Search Engine
- **Decision**: Meilisearch (or Typesense)
- **Status**: FINAL

### T-014: API Documentation
- **Decision**: Scalar with OpenAPI 3.1
- **Status**: FINAL

---

## Business Model Decisions (B-001 - B-005)

### B-001: Revenue Split Target
- **Decision**: 70% B2B, 20% B2C, 10% transactions
- **Rationale**: B2B is sustainable revenue; B2C builds user base
- **Status**: FINAL

### B-002: B2C Pricing Tiers
- **Decision**:
  - Free: $0
  - Plus: $4.99/month
  - Premium: $9.99/month
- **Rationale**: Standard SaaS tiering; competitive pricing
- **Status**: FINAL

### B-003: B2B Pricing Tiers
- **Decision**:
  - Starter: $99/month
  - Professional: $299/month
  - Enterprise: Custom pricing
- **Rationale**: Value-based pricing; room for negotiation
- **Status**: FINAL

### B-004: B2B Trial Policy
- **Decision**: No free trial for B2B; Demo upon request
- **Rationale**: Demo-based sales; qualify leads properly
- **Status**: FINAL

### B-005: Add-on Pricing
- **Decision**: Add-on pricing for special features (e-Government, extra responses)
- **Rationale**: Flexibility without overwhelming base price
- **Status**: FINAL

---

## Pending Decisions

| ID | Topic | Status | Owner | Notes |
|----|-------|--------|-------|-------|
| - | No pending decisions | - | - | Tum kararlar finalize edildi |

---

## Decision Change Log

| Date | Decision | Change | Reason |
|------|----------|--------|--------|
| 2026-01-27 | P-055 to P-060 | Added from 08-AUTHORITATIVE | Consolidation |
| 2026-01-27 | P-011 to P-017 | Added from 01-VISION | Consolidation |
| 2026-01-27 | B-001 to B-005 | Added business model decisions | Consolidation |
| 2026-01-27 | T-006 | Confirmed Argon2id implementation | Security best practice |
| 2026-01-27 | P-057 | Device fingerprint privacy arch | Deanonymization prevention |
| 2026-01-27 | All | Consolidated all scattered decisions | Single source of truth |

---

## Quick Reference: Critical Implementation Notes

### Security (Must-Have)
- T-006: Use Argon2id, never bcrypt
- P-057: Device fingerprint is privacy-preserving (deviceCategory enum only)
- P-058: Rate limits must be enforced at all endpoints
- P-059: Never expose thresholds in error messages

### Access Control
- P-060: Plus tier READ access without participation
- P-109: Premium CANNOT bypass participation for WRITE
- P-014: Pre-test requires Premium

### Real-time
- P-056: SSE for PULSE, Partykit for Live Poll
- P-040: Max 10K participants per live session

---

# ═══════════════════════════════════════════════════════════════════════════════
# END OF DECISIONS
# ═══════════════════════════════════════════════════════════════════════════════
