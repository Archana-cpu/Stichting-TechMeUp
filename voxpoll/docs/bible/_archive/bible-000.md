# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - PROJECT BIBLE INDEX
# ══════════════════════════════════════════════════════════════════════════════
# Version: 4.0.0 (Production Ready)
# Last Updated: January 2026
# Language: English
# Status: COMPLETE ✅
# ══════════════════════════════════════════════════════════════════════════════


# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                            TABLE OF CONTENTS                                │
# ├─────────────────────────────────────────────────────────────────────────────┤
# │                                                                             │
# │  BIBLE-001: EXECUTIVE SUMMARY & PROJECT VISION ................ [UPDATED]  │
# │             - Live Polling moved to Core Features                           │
# │             - New decisions P-011 to P-026 added                           │
# │                                                                             │
# │  BIBLE-002: TECHNICAL ARCHITECTURE & STACK .................... [COMPLETE] │
# │  BIBLE-003: SURVEY METHODOLOGY & DATA QUALITY ................. [COMPLETE] │
# │  BIBLE-004: RELIABILITY & TRUST SCORING SYSTEM ................ [COMPLETE] │
# │                                                                             │
# │  BIBLE-005: USER & ORGANIZATION MANAGEMENT .................... [UPDATED]  │
# │             - New subscription tiers: Free/Plus/Premium                     │
# │             - Locked demographics system added                              │
# │                                                                             │
# │  BIBLE-006: CONTENT TYPES (POLL / SURVEY / TEST) .............. [UPDATED]  │
# │             - Survey = B2B SaaS ONLY (organizations)                        │
# │             - Live Poll feature added (Premium)                             │
# │             - Pre-test for polls (Premium)                                  │
# │             - Private link sharing                                          │
# │             - Test badge system for profiles                                │
# │             - §6.9 Draft Auto-Save System (P-045)                           │
# │                                                                             │
# │  BIBLE-007: RESPONSE & DATA COLLECTION ........................ [COMPLETE] │
# │  BIBLE-008: ANALYTICS & REPORTING ............................. [COMPLETE] │
# │  BIBLE-009: BOT & FRAUD DETECTION SYSTEM ...................... [COMPLETE] │
# │                                                                             │
# │  BIBLE-010: PULSE + COMMENTS (RESULTS + DISCUSSION) ........... [UPDATED]  │
# │             - PULSE: Spotify Wrap-style result visualization               │
# │             - COMMENTS: Reddit/Instagram/YouTube hybrid discussion         │
# │             - P-022 Updated: DMs enabled, social features added            │
# │                                                                             │
# │  BIBLE-011: FEED & DISCOVERY ALGORITHM ........................ [UPDATED]  │
# │             - Discover feed for sponsored corporate content                 │
# │             - Sponsored campaign system                                     │
# │                                                                             │
# │  BIBLE-012: NOTIFICATION SYSTEM ............................... [UPDATED]  │
# │             - §12.13 Notification Deduplication System (P-046)             │
# │  BIBLE-013: DATABASE SCHEMA (DRIZZLE ORM) ..................... [UPDATED]  │
# │             - Section 13.14: Database indexing strategy added             │
# │             - Section 13.15: Database security specifications             │
# │  BIBLE-014: API CONTRACTS (SERVER ACTIONS + ZOD) .............. [COMPLETE] │
# │  BIBLE-015: BUSINESS LOGIC RULES .............................. [COMPLETE] │
# │  BIBLE-016: EDGE CASES & ERROR HANDLING ....................... [COMPLETE] │
# │  BIBLE-017: SECURITY & COMPLIANCE (GDPR/KVKK) ................. [COMPLETE] │
# │  BIBLE-018: TEST SPECIFICATIONS (VITEST + PLAYWRIGHT) ......... [COMPLETE] │
# │  BIBLE-019: SURVEY METHODOLOGIES & ALGORITHMS ................. [COMPLETE] │
# │  BIBLE-020: ENTERPRISE RESEARCH FRAMEWORK ..................... [COMPLETE] │
# │                                                                             │
# │  BIBLE-021: LINK-BASED PARTICIPATION & SHARING ................ [UPDATED]  │
# │             - Private link sharing with friends                            │
# │             - Live Poll join system (no auth required)                     │
# │             - QR code generation                                           │
# │             - Anonymous participation tracking                             │
# │             - §21.10 Offline Behavior Specification (P-048)                │
# │                                                                             │
# │  BIBLE-022: USER FLOWS, UI/UX & NAVIGATION .................... [UPDATED]  │
# │             - Complete user type hierarchy & permissions                   │
# │             - Page structure & navigation components                       │
# │             - Authentication flows (register, login)                       │
# │             - Content creation flows (poll, test, survey)                  │
# │             - Content participation flows                                  │
# │             - PULSE + COMMENTS experience flows                            │
# │             - Organization survey builder                                  │
# │             - Mobile-specific flows & gestures                             │
# │             - Error states & empty states                                  │
# │             - Design tokens & component specs                              │
# │             - Accessibility (WCAG 2.1 AA)                                  │
# │             - §22.20 Content Scheduling UI Flows (P-047)                   │
# │                                                                             │
# │  BIBLE-023: CONFIGURATION, i18n & SCALABILITY ................ [NEW]      │
# │             - Centralized configuration system                             │
# │             - Environment variables schema                                 │
# │             - Runtime configuration store                                  │
# │             - i18n/Internationalization (TR/EN)                            │
# │             - All hardcoded values externalized                            │
# │             - Edge case safeguards                                         │
# │             - Graceful degradation patterns                                │
# │             - Circuit breaker, fallback strategies                         │
# │             - Capacity management & waiting rooms                          │
# │                                                                             │
# │  BIBLE-024: PAYMENT & SUBSCRIPTION FLOWS ..................... [NEW]      │
# │             - Subscription purchase flow (Free→Plus→Premium)               │
# │             - Pricing page & checkout experience                           │
# │             - Payment processing (Stripe/Iyzico)                           │
# │             - Upgrade/downgrade flows with proration                       │
# │             - Cancellation & reactivation flows                            │
# │             - Payment method management                                    │
# │             - Billing history & invoices                                   │
# │             - Failed payment recovery (dunning)                            │
# │             - Refund policy & exception handling                           │
# │             - B2B organization billing                                     │
# │             - Webhook handling (Stripe events)                             │
# │                                                                             │
# │  BIBLE-025: DEVOPS & INFRASTRUCTURE .......................... [NEW]       │
# │             - Docker containerization                                       │
# │             - CI/CD pipelines (GitHub Actions)                             │
# │             - AWS deployment architecture                                   │
# │             - Monitoring & observability                                    │
# │                                                                             │
# │  BIBLE-026: UI/UX SPECIFICATIONS ............................. [NEW]       │
# │             - Live poll UI flows                                            │
# │             - Organization creation wizard                                  │
# │             - Admin dashboard                                               │
# │             - Moderator queue UI                                            │
# │                                                                             │
# │  BIBLE-027: FAILURE MODES & RESILIENCE ....................... [NEW]       │
# │             - User behavior edge cases                                      │
# │             - Scale & load scenarios                                        │
# │             - Third-party integration failures                             │
# │             - Concurrency & race conditions                                 │
# │             - Security attack vectors                                       │
# │             - Network & offline handling                                    │
# │             - Incident response playbooks                                   │
# │                                                                             │
# │  BIBLE-028: IMPLEMENTATION CRITICAL FIXES .................... [NEW]       │
# │             - §28.1 Device Fingerprint Privacy Architecture                │
# │             - §28.2 Live Poll WebSocket Scaling (Redis Pub/Sub)            │
# │             - §28.3 P-016 Plus/Premium Feature Clarification               │
# │             - §28.4 Async Fraud Detection (Two-Phase)                      │
# │             - §28.5 Database Index Additions                               │
# │             [AUTHORITATIVE] Overrides conflicting specs                    │
# │                                                                             │
# │  BIBLE-013 ADDENDUM: Database Indexing & Security ............ [ADDED]     │
# │             - Section 13.14: Performance indexes (feed, search, etc.)      │
# │             - Section 13.15: Row Level Security (RLS)                      │
# │             - Encryption specifications                                    │
# │             - Audit logging                                                │
# │             - SQL injection prevention                                     │
# │                                                                             │
# │  BIBLE-029: PRE-LAUNCH CRITICAL SPECIFICATIONS .............. [COMPLETE]  │
# │             - Resolved inconsistencies (anonymous voting, schema)          │
# │             - Security fixes (crypto random, permission cache, XSS)        │
# │             - Complete user flows (disconnect, conversion, downgrade)      │
# │             - Payment edge cases (proration, dunning, tier conflicts)      │
# │             - N+1 query prevention patterns                                │
# │             [AUTHORITATIVE] Overrides conflicting specs                    │
# │                                                                             │
# │  BIBLE-030: UNIFIED TYPE DEFINITIONS & SCHEMAS .............. [COMPLETE]  │
# │             - Unified Response model (PollResponse, SurveyResponse, etc.)  │
# │             - Content State Machines (DRAFT→PUBLISHED→CLOSED)              │
# │             - Complete Permission Matrix (all roles × all actions)         │
# │             - PreTest unified model                                         │
# │             - API Response schemas                                          │
# │             [AUTHORITATIVE] Single source of truth for types               │
# │                                                                             │
# │  BIBLE-031: CRITICAL CLARIFICATIONS & FINAL DECISIONS ....... [COMPLETE]  │
# │             - P-055: Quality Score Terminology                             │
# │             - P-056: Real-time Technology (SSE + Partykit)                 │
# │             - P-057: Device Fingerprint Architecture                       │
# │             - P-058: Rate Limiting Thresholds                              │
# │             - P-059: Error Message Sanitization                            │
# │             - P-060: Plus Tier PULSE/COMMENTS Access Rules                 │
# │             [AUTHORITATIVE] Final decisions before implementation          │
# │                                                                             │
# ├─────────────────────────────────────────────────────────────────────────────┤
# │                                                                             │
# │                        API IMPLEMENTATION DOCS                              │
# │                                                                             │
# ├─────────────────────────────────────────────────────────────────────────────┤
# │                                                                             │
# │  BIBLE-API-ROUTES: API ROUTE MAP ................................ [NEW]    │
# │             - Complete endpoint index with HTTP methods                    │
# │             - Authentication requirements (🔓/🔐/👤)                        │
# │             - Rate limiting specifications                                 │
# │             - Implementation status tracking (✅/⏳)                        │
# │             - Query parameters & response formats                          │
# │             - Error codes reference                                        │
# │             - WebSocket events (future)                                    │
# │             - Implementation priority phases                               │
# │                                                                             │
# │  BIBLE-API-FLOWS: USER FLOWS & REQUEST INDEX ................... [NEW]    │
# │             - User role & verification matrix                              │
# │             - Guest user flows (anonymous)                                 │
# │             - Unverified user flows (Level 0)                              │
# │             - Basic user flows (Level 1, Free tier)                        │
# │             - Plus & Premium user flows                                    │
# │             - Organization member/admin flows                              │
# │             - Moderator & Super Admin flows                                │
# │             - Authentication state flows                                   │
# │             - Verification upgrade paths                                   │
# │             - Content lifecycle flows                                      │
# │             - Complete endpoint index by role                              │
# │                                                                             │
# └─────────────────────────────────────────────────────────────────────────────┘


# ══════════════════════════════════════════════════════════════════════════════
# VERSION 3.0 KEY CHANGES SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
#
# NEW PRODUCT DECISIONS (P-011 to P-017):
#
#   P-011: LIVE POLL feature for real-time participation with link-join
#   P-012: Demographics are LOCKED after registration (except marital/profession)
#   P-013: PULSE + COMMENTS = Result visualization + Discussion area
#   P-014: Pre-test support for Polls requires PREMIUM tier
#   P-015: Surveys are EXCLUSIVELY B2B SaaS (organizations only)
#   P-016: Plus tier grants PULSE/COMMENTS access without participation
#   P-017: Test results create profile BADGES
#
# SUBSCRIPTION TIERS (Individuals):
#   - Free: Basic access, 3 polls/day, 3 tests/week
#   - Plus ($4.99/mo): PULSE/COMMENTS access without participation, 10 polls/day, 10 tests/week
#   - Premium ($9.99/mo): Unlimited polls/day & tests/week, target audience, pre-tests, live polls, themes
#
# CONTENT OWNERSHIP:
#   - POLLS: Any user (with Premium features for paid users)
#   - SURVEYS: B2B SaaS organizations ONLY
#   - TESTS: Any user (badge creation for all)
#
# ══════════════════════════════════════════════════════════════════════════════


# ══════════════════════════════════════════════════════════════════════════════
# DOCUMENT CONVENTIONS
# ══════════════════════════════════════════════════════════════════════════════
#
# Requirement Levels:
#   [MUST]     - Mandatory requirement, no exceptions allowed
#   [SHOULD]   - Strongly recommended, exceptions require written justification
#   [MAY]      - Optional, left to implementation discretion
#   [NEVER]    - Explicitly prohibited under all circumstances
#
# Markers:
#   [EDGE CASE]    - Edge case requiring special handling
#   [SECURITY]     - Security-critical consideration
#   [PERFORMANCE]  - Performance-related note
#   [REFERENCE]    - Scientific or external reference
#   [DECISION]     - Finalized decision (no further discussion)
#   [VERIFY]       - Requires additional verification
#
# Code Style:
#   - No semicolons at end of statements
#   - No comment lines except section dividers
#   - Exports always at the end of files
#   - Clear section separation in all documents
#
# ══════════════════════════════════════════════════════════════════════════════




# ══════════════════════════════════════════════════════════════════════════════
# DECISION INDEX - ALL P-### DECISIONS
# ══════════════════════════════════════════════════════════════════════════════
#
# This index tracks ALL product decisions made throughout the bible documents.
# Use [DECISION P-###] tags to reference these in other documents.
#
# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                         DECISION INDEX                                       │
# ├─────────────────────────────────────────────────────────────────────────────┤
# │                                                                             │
# │  P-001: Survey requires organization context (B2B only)    [BIBLE-006]     │
# │  P-002: Poll is standalone content type for individuals    [BIBLE-006]     │
# │  P-003: Discussion write access requires participation     [BIBLE-010]     │
# │  P-004: Free users can REQUEST discussion access (100+ chars) [BIBLE-010]  │
# │  P-005: Test results are personalized (not aggregate)      [BIBLE-006]     │
# │  P-006: Three test types: AXIS, CHARACTER, SPECTRUM        [BIBLE-006]     │
# │  P-007: Screening questions use branching logic            [BIBLE-006]     │
# │  P-008: Target audience filtering by demographics          [BIBLE-006]     │
# │  P-009: Anonymous participation with device fingerprint    [BIBLE-007]     │
# │  P-010: Content visibility levels (PUBLIC/PRIVATE/ORG)     [BIBLE-006]     │
# │                                                                             │
# │  P-011: LIVE POLL for real-time participation (Premium)    [BIBLE-006]     │
# │         - 6-char join code, no auth required for voters                    │
# │         - WebSocket real-time updates                                      │
# │         - Max 10,000 concurrent participants                               │
# │         [REFERENCE] BIBLE-021 for link-based participation                 │
# │                                                                             │
# │  P-012: Demographics LOCKED after registration             [BIBLE-005]     │
# │         - IMMUTABLE: birthYear, gender, country, education                 │
# │         - MUTABLE: maritalStatus, profession, employmentStatus             │
# │         - Exception: support ticket with ID verification                   │
# │                                                                             │
# │  P-013: PULSE + COMMENTS (Result + Discussion)             [BIBLE-010]     │
# │         - PULSE: Spotify Wrap-style animated results visualization         │
# │         - COMMENTS: Reddit/Instagram style threaded discussions            │
# │         - Upvote/downvote with Wilson score                                │
# │         - Images and GIFs supported in comments                            │
# │                                                                             │
# │  P-014: Pre-test for POLLS requires PREMIUM tier           [BIBLE-006]     │
# │         - Filter voters by knowledge/qualification                         │
# │         - Multiple choice screening questions                              │
# │         - Pass/fail threshold configurable                                 │
# │                                                                             │
# │  P-015: Surveys are EXCLUSIVELY B2B SaaS                   [BIBLE-006]     │
# │         - organizationId is REQUIRED (not null)                            │
# │         - Individual users cannot create surveys                           │
# │         - Surveys appear in Discover feed (sponsored)                      │
# │                                                                             │
# │  P-016: Plus tier grants PULSE/COMMENTS access w/o participation [BIBLE-010]│
# │         - Key monetization feature                                         │
# │         - Read discussions, post comments, vote                            │
# │         - View results without taking poll/test                            │
# │                                                                             │
# │  P-017: Test results create profile BADGES                 [BIBLE-006]     │
# │         - Automatic badge creation on test completion                      │
# │         - Display on user profile (max 5 pinned)                           │
# │         - Shareable to social media                                        │
# │         - Optional display toggle per badge                                │
# │                                                                             │
# │  P-018: Multiple link types for participation              [BIBLE-021]     │
# │         - PUBLIC: voxpoll.com/p/{id}                                       │
# │         - PRIVATE: voxpoll.com/share/{code}                                │
# │         - LIVE: voxpoll.com/live/{code}                                    │
# │         - EMBED: voxpoll.com/embed/{id}                                    │
# │         - ORG: {subdomain}.voxpoll.com/s/{id}                              │
# │                                                                             │
# │  P-019: Live Join requires NO authentication               [BIBLE-021]     │
# │         - Participants vote without account                                │
# │         - Device fingerprint for duplicate prevention                      │
# │         - Prompted to create account after participation                   │
# │                                                                             │
# │  P-020: White Label for Enterprise organizations           [BIBLE-005]     │
# │         - Custom domain, logo, colors                                      │
# │         - Content isolation from public VoxPoll                            │
# │         - SSO integration required                                         │
# │                                                                             │
# │  P-021: Anonymity rejection option for content creators    [BIBLE-006]     │
# │         - allowAnonymousParticipation: boolean                             │
# │         - requireVerificationLevel: 0-4                                    │
# │         - Custom rejection message                                         │
# │                                                                             │
# │  P-022: Social features with DM and follow system          [BIBLE-005]     │
# │         - Direct messaging (DMs) between users ENABLED                     │
# │         - Follow system (one-way) with followers/following sections        │
# │         - Mutual follows = Friends (bidirectional relationship)            │
# │         - Profile visits tracked, public profiles viewable                 │
# │         - @mentions allowed in COMMENTS discussions                        │
# │                                                                             │
# │  P-023: All hardcoded values MUST be externalized          [BIBLE-023]     │
# │         - Pricing, limits, thresholds in config system                     │
# │         - Environment variables for deployment settings                    │
# │         - Runtime config for A/B testing                                   │
# │         - No magic numbers in codebase                                     │
# │                                                                             │
# │  P-024: Multi-language support (i18n) for TR/EN            [BIBLE-023]     │
# │         - All user-facing strings in locale files                          │
# │         - Pluralization, number/date formatting                            │
# │         - RTL support ready for future expansion                           │
# │         - Default locale: Turkish (tr)                                     │
# │                                                                             │
# │  P-025: Graceful degradation for all services              [BIBLE-023]     │
# │         - Circuit breaker for external services                            │
# │         - Fallback strategies with cached data                             │
# │         - Waiting room for capacity overflow                               │
# │         - Feature flags for gradual rollout                                │
# │                                                                             │
# │  P-026: Edge case safeguards for worst-case scenarios      [BIBLE-023]     │
# │         - Dynamic milestones for viral content                             │
# │         - BigInt for overflow protection                                   │
# │         - Adaptive fraud detection (false positive mitigation)             │
# │         - Database retry with exponential backoff                          │
# │                                                                             │
# │  P-027: Tier-based poll option limits                       [BIBLE-023]     │
# │         - Free/Plus: 2-4 options (Quick Poll)                              │
# │         - Premium/Org: 2-10 options (Extended Poll)                        │
# │                                                                             │
# │  P-028: Unified quality thresholds by content type          [BIBLE-023]     │
# │         - SURVEY: include >= 60, review 40-59, exclude < 40                │
# │         - POLL/TEST: include >= 40, review 20-39, exclude < 20             │
# │         - QUICK_POLL: fraud-only check (no quality threshold)              │
# │                                                                             │
# │  P-029: Anonymous to user conversion policy                 [BIBLE-021]     │
# │         - Migrate responses and quality scores                             │
# │         - Don't migrate badges or XP                                       │
# │         - 30-day conversion window, device match required                  │
# │                                                                             │
# │  P-030: Pre-test failure handling policy                    [BIBLE-006]     │
# │         - Max 3 attempts, progressive cooldown (1h/2h/24h)                 │
# │         - Never show correct answers                                       │
# │         - Anti-gaming: shuffle questions/options                           │
# │                                                                             │
# │  P-031: Live Poll disconnect resilience                     [BIBLE-021]     │
# │         - Host disconnect: 1 min grace, voting continues                   │
# │         - Participant disconnect: votes preserved, can rejoin              │
# │         - Network glitch: queue votes locally, retry on reconnect          │
# │                                                                             │
# │  P-032: Comment media moderation policy                     [BIBLE-010]     │
# │         - AWS Rekognition auto-moderation                                  │
# │         - 3 reports = auto-hide, user appeal process                       │
# │         - Strike system: 5 strikes = permanent ban                         │
# │                                                                             │
# │  P-033: Organization member offboarding policy              [BIBLE-005]     │
# │         - Anonymize responses, transfer surveys to admin                   │
# │         - Delete personal data after 30-day retention                      │
# │         - GDPR/KVKK compliant                                              │
# │                                                                             │
# │  P-034: Badge lifecycle policy                              [BIBLE-006]     │
# │         - Badges preserved even if test deleted                            │
# │         - User can retake test (max 3 badges, 24h cooldown)                │
# │         - Deleted test badges show "Test unavailable"                      │
# │                                                                             │
# │  P-035: Fraud vs Quality score usage matrix                 [BIBLE-009]     │
# │         - Registration/login: fraud score only                             │
# │         - Survey response: quality primary, fraud secondary                │
# │         - Quick poll: fraud only, no quality check                         │
# │                                                                             │
# │  P-036: Notification channel priority system                [BIBLE-012]     │
# │         - Category-based default priorities                                │
# │         - CRITICAL overrides user preferences                              │
# │         - Fallback chain with retry logic                                  │
# │                                                                             │
# │  P-037: Subscription downgrade policy                       [BIBLE-005]     │
# │         - Existing content preserved                                       │
# │         - Active live polls end gracefully (60 min)                        │
# │         - New content subject to lower tier limits                         │
# │                                                                             │
# │  P-038: UGC language policy                                 [BIBLE-023]     │
# │         - Auto-detect content language (TR/EN)                             │
# │         - No auto-translation in MVP                                       │
# │         - Language-based search boost (50% for user's lang)                │
# │                                                                             │
# │  P-039: Anonymous voting restriction behavior              [BIBLE-006]     │
# │         - Show login wall when anonymousVoting: false                      │
# │         - Live poll viewers can watch but not vote without auth            │
# │         - Session expiry preserves vote intent for re-login                │
# │                                                                             │
# │  P-040: Live Poll capacity overflow handling               [BIBLE-006]     │
# │         - 10K participant cap per live poll                                │
# │         - Waiting room at 90% capacity                                     │
# │         - Graceful overflow messaging                                      │
# │                                                                             │
# │  P-041: Subscription downgrade content handling            [BIBLE-005]     │
# │         - Existing content preserved but read-only                         │
# │         - 30-day grace period before enforcement                           │
# │         - Clear upgrade prompts on restricted actions                      │
# │                                                                             │
# │  P-042: Redis failure fallback strategy                    [BIBLE-015]     │
# │         - In-memory cache with 1-min TTL fallback                          │
# │         - Circuit breaker after 3 consecutive failures                     │
# │         - Graceful degradation to database-only mode                       │
# │                                                                             │
# │  P-043: Account deletion cascade handling                  [BIBLE-005]     │
# │         - 30-day grace period for reactivation                             │
# │         - Content anonymization (creator = "Deleted User")                 │
# │         - Active sessions terminated, badges preserved                     │
# │                                                                             │
# │  P-044: ID Generation Strategy - CUID                     [BIBLE-013]     │
# │         - All primary keys use @default(cuid())                            │
# │         - URL-safe, sortable, collision-resistant                          │
# │         - Client-side generation for optimistic UI                         │
# │         - No MongoDB ObjectId, no auto-increment                           │
# │                                                                             │
# │  P-045: Draft Auto-Save System                            [BIBLE-006]     │
# │         - 2s debounce, 30s max interval                                    │
# │         - Server primary, localStorage backup                              │
# │         - Conflict resolution with user prompt                             │
# │         - State machine: IDLE→DEBOUNCING→SAVING→RETRYING                   │
# │                                                                             │
# │  P-046: Notification Deduplication System                 [BIBLE-012]     │
# │         - Per-type deduplication windows                                   │
# │         - Strategies: FIRST_ONLY, AGGREGATE, MILESTONE_ONLY                │
# │         - Redis key patterns for tracking                                  │
# │         - Aggregation templates for batched notifications                  │
# │                                                                             │
# │  P-047: Content Scheduling UI Flows                       [BIBLE-022]     │
# │         - 5 min minimum, 90 day maximum future scheduling                  │
# │         - Tier-based limits (Free: 3, Plus: 20, Premium: 100)              │
# │         - Timezone-aware with user preference storage                      │
# │         - Reschedule and cancel flows                                      │
# │                                                                             │
# │  P-048: Offline Behavior Specification                    [BIBLE-021]     │
# │         - Network states: ONLINE→DEGRADED→OFFLINE                          │
# │         - Capability matrix per feature                                    │
# │         - Action queue with priority sync                                  │
# │         - Service Worker caching strategies                                │
# │                                                                             │
# │  P-049: Authentication Provider Restrictions              [BIBLE-005/013/017]│
# │         - ONLY Google OAuth, Apple OAuth, e-Devlet supported               │
# │         - Email + Password with verification ALWAYS available              │
# │         - Facebook OAuth: NEVER (privacy/data harvesting concerns)         │
# │         - Twitter OAuth: NEVER (API instability, ownership changes)        │
# │         - No social login buttons for unsupported providers                │
# │                                                                             │
# │  P-050: Test Retake Policy                                [BIBLE-029]      │
# │         - 24h cooldown between attempts                                    │
# │         - Max 3 badges per test (best, most recent, first)                 │
# │         - Question randomization on each attempt                           │
# │                                                                             │
# │  ═══════════════════════════════════════════════════════════════════════   │
# │  FINAL CLARIFICATIONS (P-055 to P-060) - Defined in BIBLE-031              │
# │  ═══════════════════════════════════════════════════════════════════════   │
# │                                                                             │
# │  P-055: Quality Score Terminology                         [BIBLE-031]      │
# │         - ResponseQualityScore = per-response (Bible-003)                  │
# │         - ReliabilityScore = per-content (Bible-004)                       │
# │         - No conflict - complementary systems                              │
# │                                                                             │
# │  P-056: Real-time Technology Stack                        [BIBLE-031]      │
# │         - SSE for PULSE, notifications, feed updates                       │
# │         - Partykit (Edge WebSocket) for Live Poll only                     │
# │         - Fallback: Long polling if WebSocket fails                        │
# │                                                                             │
# │  P-057: Device Fingerprint Architecture                   [BIBLE-028/031]  │
# │         - Remove deviceFingerprint from response models                    │
# │         - Use deviceCategory enum (DESKTOP/MOBILE/TABLET/UNKNOWN)          │
# │         - Separate FraudDetectionLog table, 30-day auto-expiry             │
# │                                                                             │
# │  P-058: Rate Limiting Thresholds                          [BIBLE-031]      │
# │         - Global: 100 req/min (anon), 300 req/min (auth)                   │
# │         - Content creation: Tier-based (Free/Plus/Premium)                 │
# │         - Exponential backoff for brute force protection                   │
# │                                                                             │
# │  P-059: Error Message Sanitization                        [BIBLE-031]      │
# │         - No numeric thresholds in user-facing messages                    │
# │         - No score values exposed                                          │
# │         - No fraud detection algorithm hints                               │
# │                                                                             │
# │  P-060: Plus Tier PULSE/COMMENTS Access                   [BIBLE-031]      │
# │         - Plus: Can VIEW PULSE without participating                       │
# │         - Plus: Can READ comments without participating                    │
# │         - Plus: Must STILL participate to WRITE comments                   │
# │                                                                             │
# ├─────────────────────────────────────────────────────────────────────────────┤
# │                                                                             │
# │  ═══════════════════════════════════════════════════════════════════════   │
# │  PRODUCT BEHAVIOR DECISIONS (P-1xx Series) - Defined in BIBLE-001          │
# │  ═══════════════════════════════════════════════════════════════════════   │
# │                                                                             │
# │  P-101: Tests have UNLIMITED duration (evergreen content)  [BIBLE-001]     │
# │  P-102: Profile badges are OPTIONAL and can be non-serious [BIBLE-001]     │
# │  P-103: Discussion write access requires PARTICIPATION     [BIBLE-001]     │
# │         [ALIAS: Reinforces P-003]                                          │
# │  P-104: Non-participants can REQUEST access (100+ chars)   [BIBLE-001]     │
# │         [ALIAS: Reinforces P-004]                                          │
# │  P-105: NO ADVERTISEMENTS ever (user trust paramount)      [BIBLE-001]     │
# │  P-106: Content CANNOT be edited after publishing          [BIBLE-001]     │
# │  P-107: Minimum participant count set by creator           [BIBLE-001]     │
# │  P-108: Pre-test failure messages are POLITE               [BIBLE-001]     │
# │  P-109: Premium users CANNOT bypass participation req      [BIBLE-001]     │
# │  P-110: Result visibility rules (participants/premium/free)[BIBLE-001]     │
# │                                                                             │
# └─────────────────────────────────────────────────────────────────────────────┘
#
# ══════════════════════════════════════════════════════════════════════════════




# ══════════════════════════════════════════════════════════════════════════════
# SECTION DEPENDENCIES
# ══════════════════════════════════════════════════════════════════════════════
#
# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                    SECTION DEPENDENCY GRAPH                                  │
# ├─────────────────────────────────────────────────────────────────────────────┤
# │                                                                             │
# │  BIBLE-005 (User Management)                                                │
# │    └── Required by: BIBLE-006, BIBLE-007, BIBLE-010, BIBLE-011, BIBLE-021  │
# │                                                                             │
# │  BIBLE-006 (Content Types)                                                  │
# │    ├── Depends on: BIBLE-005                                                │
# │    └── Required by: BIBLE-007, BIBLE-010, BIBLE-011, BIBLE-021             │
# │                                                                             │
# │  BIBLE-007 (Responses)                                                      │
# │    ├── Depends on: BIBLE-005, BIBLE-006                                     │
# │    └── Required by: BIBLE-010, BIBLE-020                                   │
# │                                                                             │
# │  BIBLE-010 (PULSE + COMMENTS - Results + Discussion)                        │
# │    ├── Depends on: BIBLE-005, BIBLE-006, BIBLE-007, BIBLE-012, BIBLE-015   │
# │    └── Required by: (none)                                                  │
# │                                                                             │
# │  BIBLE-011 (Feed/Discovery)                                                 │
# │    ├── Depends on: BIBLE-005, BIBLE-006                                     │
# │    └── Required by: (none)                                                  │
# │                                                                             │
# │  BIBLE-021 (Link-based Participation)                                       │
# │    ├── Depends on: BIBLE-005, BIBLE-006, BIBLE-007                          │
# │    └── Required by: BIBLE-022                                               │
# │                                                                             │
# │  BIBLE-022 (User Flows & UI/UX)                                             │
# │    ├── Depends on: ALL previous sections                                    │
# │    └── Required by: (implementation)                                        │
# │                                                                             │
# │  BIBLE-023 (Configuration, i18n & Scalability)                              │
# │    ├── Depends on: ALL sections (extracts config from all)                  │
# │    └── Required by: ALL implementation files                                │
# │    └── AUTHORITATIVE source for: limits, thresholds, messages              │
# │                                                                             │
# │  BIBLE-024 (Payment & Subscription Flows)                                   │
# │    ├── Depends on: BIBLE-005, BIBLE-023                                     │
# │    └── Required by: (monetization implementation)                           │
# │    └── AUTHORITATIVE source for: payment flows, billing                    │
# │                                                                             │
# │  BIBLE-API-ROUTES (API Route Map)                                           │
# │    ├── Depends on: BIBLE-005, BIBLE-006, BIBLE-014, BIBLE-017               │
# │    └── Required by: BIBLE-API-FLOWS, API implementation                     │
# │    └── AUTHORITATIVE source for: endpoint specs, rate limits               │
# │                                                                             │
# │  BIBLE-API-FLOWS (User Flows & Request Index)                               │
# │    ├── Depends on: BIBLE-API-ROUTES, BIBLE-005, BIBLE-022, BIBLE-030        │
# │    └── Required by: API implementation, testing                             │
# │    └── AUTHORITATIVE source for: role-based endpoint access                │
# │                                                                             │
# └─────────────────────────────────────────────────────────────────────────────┘
#
# ══════════════════════════════════════════════════════════════════════════════