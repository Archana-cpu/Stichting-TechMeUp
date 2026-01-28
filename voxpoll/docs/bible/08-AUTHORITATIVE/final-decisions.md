# final-decisions.md
> Source: bible-031.md
> Status: [AUTHORITATIVE] - These specifications are FINAL and OVERRIDE any conflicting content

# ══════════════════════════════════════════════════════════════════════════════
# QUALITY SCORE TERMINOLOGY CLARIFICATION
# ══════════════════════════════════════════════════════════════════════════════

## Problem Statement

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CONFUSION: "Response Quality" Has Two Meanings               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  DOCUMENT 1 (Bible-003):                                                        │
│  • ResponseQualityScore with 4 components:                                      │
│    - timing (25%)                                                               │
│    - consistency (25%)                                                          │
│    - engagement (25%)                                                           │
│    - attentionChecks (25%)                                                      │
│                                                                                 │
│  DOCUMENT 2 (Bible-004):                                                        │
│  • ReliabilityFactors.responseQuality with 3 components:                        │
│    - completionRate                                                             │
│    - responseTimeValidity                                                       │
│    - attentionCheckPassRate                                                     │
│                                                                                 │
│  QUESTION: Which is correct? Are these conflicting?                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Resolution: Two Different Concepts

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CLARIFICATION: THESE ARE DIFFERENT SCORES                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  INDIVIDUAL RESPONSE QUALITY (Bible-003)                                │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  Purpose: Evaluate a SINGLE response's quality                          │   │
│  │  Scope: Per-response                                                    │   │
│  │  Used for: Filtering bad responses, flagging for review                 │   │
│  │                                                                          │   │
│  │  Components:                                                             │   │
│  │  • timing (25%) - Was response too fast/slow?                           │   │
│  │  • consistency (25%) - Are similar questions answered consistently?     │   │
│  │  • engagement (25%) - Is there straight-lining or random clicking?      │   │
│  │  • attentionChecks (25%) - Did they pass attention check questions?     │   │
│  │                                                                          │   │
│  │  Output: INCLUDE / REVIEW / EXCLUDE                                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│                              ▼ Aggregated into ▼                               │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  CONTENT RELIABILITY SCORE (Bible-004)                                  │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  Purpose: Evaluate overall reliability of CONTENT results               │   │
│  │  Scope: Per-content (poll, test, survey)                                │   │
│  │  Used for: Displaying confidence badges, statistical validity           │   │
│  │                                                                          │   │
│  │  Categories (with total weights):                                        │   │
│  │  • sampleQuality (35%) - Sample size, response rate, demographics       │   │
│  │  • responseQuality (30%) - AGGREGATE of individual response scores      │   │
│  │  • methodology (20%) - Sampling method, question quality, pretest       │   │
│  │  • participantVerification (15%) - User verification, fraud rates       │   │
│  │                                                                          │   │
│  │  Output: Excellent / Good / Moderate / Limited / Low                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Official Terminology (P-055)

**DECISION P-055: Quality Score Terminology**

| Term | Scope | Document | Purpose |
|------|-------|----------|---------|
| `ResponseQualityScore` | Per-response | Bible-003 | Flag/filter individual responses |
| `ReliabilityScore` | Per-content | Bible-004 | Overall content confidence level |
| `ReliabilityFactors.responseQuality` | Aggregate | Bible-004 | Average response quality across all responses |

**Relationship:**
```
ResponseQualityScore (per-response)
       │
       │ AVG() across all valid responses
       ▼
ReliabilityFactors.responseQuality.completionRate    = % responses with INCLUDE status
ReliabilityFactors.responseQuality.responseTimeValidity = AVG(timing score)
ReliabilityFactors.responseQuality.attentionCheckPassRate = % passed attention checks
```

**CONCLUSION: NO CONFLICT - These are complementary systems at different levels.**


# ══════════════════════════════════════════════════════════════════════════════
# REAL-TIME TECHNOLOGY DECISION
# ══════════════════════════════════════════════════════════════════════════════

## Final Decision (P-056)

**DECISION P-056: Real-time Technology Stack**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    REAL-TIME TECHNOLOGY FINAL DECISION                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  SSE (Server-Sent Events) - via Vercel/Next.js                          │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  USE FOR:                                                                │   │
│  │  • PULSE updates (new comments, reactions)                              │   │
│  │  • Notification delivery                                                │   │
│  │  • Feed refresh signals                                                 │   │
│  │  • Non-critical real-time updates                                       │   │
│  │                                                                          │   │
│  │  WHY: Simpler, one-way, built into Next.js, no extra infrastructure     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Partykit (Edge WebSocket) - Cloudflare Workers                         │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  USE FOR:                                                                │   │
│  │  • Live Poll real-time voting                                           │   │
│  │  • Live Poll result streaming                                           │   │
│  │  • Live Poll participant presence                                       │   │
│  │  • Host controls (pause, resume, end)                                   │   │
│  │                                                                          │   │
│  │  WHY: Bidirectional, edge-native, auto-scaling, handles 10K+ concurrent │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  FALLBACK STRATEGY                                                      │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  1. SSE connection fails → Long polling (5s intervals)                  │   │
│  │  2. Partykit connection fails → HTTP polling (1s for Live Poll)         │   │
│  │  3. All WebSocket blocked → Graceful degradation message                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Reference:** Bible-002.md 2.1.7 (lines 136-141) - This decision was already documented, just not prominently. This confirms it as AUTHORITATIVE.


# ══════════════════════════════════════════════════════════════════════════════
# DEVICE FINGERPRINT CONFIRMATION
# ══════════════════════════════════════════════════════════════════════════════

## Confirmation (P-057)

**DECISION P-057: Device Fingerprint Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    DEVICE FINGERPRINT: BIBLE-028 IS AUTHORITATIVE               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CONFIRMED: Bible-028.md Section 28.1 OVERRIDES Bible-013 schema               │
│                                                                                 │
│  IMPLEMENTATION REQUIREMENTS:                                                   │
│                                                                                 │
│  1. REMOVE deviceFingerprint field from:                                       │
│     • PollResponse model                                                        │
│     • SurveyResponse model                                                      │
│     • TestResponse model                                                        │
│     • QuickPollResponse model                                                   │
│                                                                                 │
│  2. ADD deviceCategory enum field (DESKTOP/MOBILE/TABLET/UNKNOWN)              │
│     • Non-identifying general classification only                               │
│                                                                                 │
│  3. CREATE FraudDetectionLog table (Bible-028 28.1.3)                         │
│     • Separate from responses                                                   │
│     • NO responseId field (unlinkable)                                          │
│     • 30-day auto-expiry                                                        │
│                                                                                 │
│  4. USE separate HMAC salts:                                                    │
│     • PARTICIPANT_HASH_SALT for participantHash                                │
│     • FRAUD_DETECTION_SALT for fingerprintHash                                 │
│     • These MUST be different values                                           │
│                                                                                 │
│  MIGRATION NOTE:                                                                │
│  • Run schema migration BEFORE any response data is collected                  │
│  • This is a pre-launch requirement, no data migration needed                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# RATE LIMITING THRESHOLDS
# ══════════════════════════════════════════════════════════════════════════════

## Complete Rate Limit Specification (P-058)

**DECISION P-058: Rate Limiting Values**

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RATE LIMIT CONFIGURATION
// [AUTHORITATIVE] All rate limits for VoxPoll API
// ══════════════════════════════════════════════════════════════════════════════

export const RATE_LIMITS = {
  // ─────────────────────────────────────────────────────────────────────────────
  // GLOBAL LIMITS (per IP)
  // ─────────────────────────────────────────────────────────────────────────────
  global: {
    anonymous: { requests: 100, window: "1m" },    // 100 req/min for anonymous
    authenticated: { requests: 300, window: "1m" }, // 300 req/min for logged in
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTHENTICATION ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────
  auth: {
    login: { requests: 5, window: "15m" },           // 5 attempts per 15 min
    register: { requests: 3, window: "1h" },         // 3 registrations per hour (per IP)
    passwordReset: { requests: 3, window: "1h" },    // 3 reset requests per hour
    otpVerify: { requests: 3, window: "10m" },       // 3 OTP attempts per 10 min
    emailVerify: { requests: 5, window: "1h" },      // 5 verification emails per hour
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTENT CREATION (per user)
  // ─────────────────────────────────────────────────────────────────────────────
  creation: {
    poll: {
      free: { requests: 3, window: "24h" },          // Free: 3 polls/day
      plus: { requests: 10, window: "24h" },         // Plus: 10 polls/day
      premium: { requests: 50, window: "24h" },      // Premium: 50 polls/day
    },
    quickPoll: {
      free: { requests: 5, window: "24h" },          // Free: 5 quick polls/day
      plus: { requests: 20, window: "24h" },         // Plus: 20 quick polls/day
      premium: { requests: 100, window: "24h" },     // Premium: 100 quick polls/day
    },
    test: {
      free: { requests: 3, window: "7d" },           // Free: 3 tests/week
      plus: { requests: 10, window: "7d" },          // Plus: 10 tests/week
      premium: { requests: 50, window: "7d" },       // Premium: 50 tests/week
    },
    survey: {
      // Surveys are B2B only - organization limits
      organization: { requests: 100, window: "30d" }, // 100 surveys/month per org
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PARTICIPATION (per user per content)
  // ─────────────────────────────────────────────────────────────────────────────
  participation: {
    vote: { requests: 1, window: "forever" },        // 1 vote per content (enforced by hash)
    pretest: { requests: 3, window: "24h" },         // 3 pretest attempts, then 24h cooldown
    comment: { requests: 30, window: "1h" },         // 30 comments per hour
    reaction: { requests: 100, window: "1h" },       // 100 reactions per hour
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // LIVE POLL (per user)
  // ─────────────────────────────────────────────────────────────────────────────
  livePoll: {
    create: { requests: 5, window: "24h" },          // 5 live polls per day
    join: { requests: 10, window: "1m" },            // 10 join attempts per minute
    codeGuess: { requests: 5, window: "5m" },        // 5 wrong codes, then exponential backoff
    vote: { requests: 60, window: "1m" },            // 60 votes/min (1 per second max)
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SOCIAL FEATURES (per user)
  // ─────────────────────────────────────────────────────────────────────────────
  social: {
    dm: {
      free: { requests: 0, window: "24h" },          // Free: No DMs
      plus: { requests: 25, window: "24h" },         // Plus: 25 DMs/day
      premium: { requests: 1000, window: "24h" },    // Premium: 1000 DMs/day (effectively unlimited)
    },
    follow: { requests: 100, window: "1h" },         // 100 follow actions per hour
    block: { requests: 50, window: "1h" },           // 50 block actions per hour
    report: { requests: 10, window: "1h" },          // 10 reports per hour
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SEARCH & FEED
  // ─────────────────────────────────────────────────────────────────────────────
  search: {
    query: { requests: 30, window: "1m" },           // 30 searches per minute
    autocomplete: { requests: 60, window: "1m" },    // 60 autocomplete per minute
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FILE UPLOADS
  // ─────────────────────────────────────────────────────────────────────────────
  upload: {
    image: { requests: 20, window: "1h" },           // 20 image uploads per hour
    avatar: { requests: 5, window: "24h" },          // 5 avatar changes per day
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // API KEYS (for B2B integrations)
  // ─────────────────────────────────────────────────────────────────────────────
  api: {
    standard: { requests: 1000, window: "1h" },      // 1000 req/hour
    premium: { requests: 10000, window: "1h" },      // 10000 req/hour
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPONENTIAL BACKOFF FOR BRUTE FORCE PROTECTION
// ─────────────────────────────────────────────────────────────────────────────

export const BACKOFF_CONFIG = {
  livePollCode: {
    maxAttempts: 5,
    baseDelay: 1000,        // 1 second
    maxDelay: 60000,        // 60 seconds max
    multiplier: 2,          // 2^n exponential
    // After 5 failures: 1s, 2s, 4s, 8s, 16s, 32s, 60s (capped)
  },
  login: {
    maxAttempts: 5,
    baseDelay: 5000,        // 5 seconds
    maxDelay: 900000,       // 15 minutes max
    multiplier: 2,
  },
  otp: {
    maxAttempts: 3,
    baseDelay: 60000,       // 1 minute
    maxDelay: 3600000,      // 1 hour max
    multiplier: 2,
  },
}
```

## Rate Limit Response Format

```typescript
// When rate limit exceeded, return this response:

interface RateLimitResponse {
  error: {
    code: "RATE_LIMIT_EXCEEDED"
    message: string                    // User-friendly message (Turkish)
    retryAfter: number                 // Seconds until retry allowed
  }
}

// Example response:
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Cok fazla istek gonderdiniz. Lutfen biraz bekleyin.",
    "retryAfter": 60
  }
}

// HTTP Headers to include:
// Retry-After: 60
// X-RateLimit-Limit: 100
// X-RateLimit-Remaining: 0
// X-RateLimit-Reset: 1706000000 (Unix timestamp)
```


# ══════════════════════════════════════════════════════════════════════════════
# ERROR MESSAGE SANITIZATION
# ══════════════════════════════════════════════════════════════════════════════

## Problem Statement

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SECURITY ISSUE: INTERNAL DATA EXPOSURE                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PROBLEM:                                                                       │
│  Some error messages expose internal calculation details that could be          │
│  used to game the system.                                                       │
│                                                                                 │
│  BAD EXAMPLE:                                                                   │
│  "Tamamlama suresi beklenenin %15'i. Minimum %20 gerekli."                     │
│  → User now knows exact timing threshold to game                               │
│                                                                                 │
│  BAD EXAMPLE:                                                                   │
│  "Fraud score: 0.85. Threshold: 0.70."                                         │
│  → User knows exactly how much they exceeded limit                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Resolution: Sanitized Error Messages (P-059)

**DECISION P-059: Error Message Sanitization Rules**

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ERROR MESSAGE RULES
// [AUTHORITATIVE] Never expose internal calculations to users
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// RULE 1: NO NUMERIC THRESHOLDS IN USER-FACING MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

// BAD
"Yanit sureniz cok kisa (12 saniye). Minimum 30 saniye gerekli."

// GOOD
"Yanitiniz beklenenden hizli tamamlandi. Lutfen sorulari dikkatli okuyun."


// ─────────────────────────────────────────────────────────────────────────────
// RULE 2: NO SCORE VALUES IN MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

// BAD
"Kalite puaniniz 35/100. Minimum 40 gerekli."

// GOOD
"Yanitlarinizda tutarsizlik tespit edildi. Lutfen dikkatlice cevaplayin."


// ─────────────────────────────────────────────────────────────────────────────
// RULE 3: NO FRAUD DETECTION DETAILS
// ─────────────────────────────────────────────────────────────────────────────

// BAD
"Ayni cihazdan daha once oy kullanildi."

// GOOD
"Bu ankete zaten katildiniz."


// ─────────────────────────────────────────────────────────────────────────────
// RULE 4: NO ALGORITHM HINTS
// ─────────────────────────────────────────────────────────────────────────────

// BAD
"Tum sorulara ayni secenegi isaretlediniz (straight-lining tespit edildi)."

// GOOD
"Yanit kalitesi yeterli degil. Lutfen her soruyu ayri degerlendirin."


// ═══════════════════════════════════════════════════════════════════════════
// SANITIZED ERROR MESSAGE CATALOG
// ═══════════════════════════════════════════════════════════════════════════

export const SANITIZED_ERRORS = {
  // Response Quality Issues
  RESPONSE_TOO_FAST: "Yanitiniz beklenenden hizli tamamlandi. Sorulari dikkatli okudugunuzdan emin olun.",
  RESPONSE_TOO_SLOW: "Yanit suresi doldu. Lutfen tekrar deneyin.",
  RESPONSE_INCONSISTENT: "Yanitlarinizda tutarsizlik tespit edildi.",
  RESPONSE_LOW_QUALITY: "Yanit kalitesi yeterli degil. Lutfen sorulari dikkatle cevaplayin.",

  // Attention Check Failures
  ATTENTION_CHECK_FAILED: "Kontrol sorusunu yanlis cevapladiniz. Lutfen sorulari dikkatli okuyun.",

  // Duplicate Attempts
  ALREADY_PARTICIPATED: "Bu ankete/oylamaya zaten katildiniz.",
  DUPLICATE_DEVICE: "Bu cihazdan zaten katilim yapildi.",

  // Pre-test Failures
  PRETEST_FAILED: "On test basarisiz. Konuyu daha iyi anlayarak tekrar deneyebilirsiniz.",
  PRETEST_COOLDOWN: "Cok fazla basarisiz deneme. Daha sonra tekrar deneyin.",

  // Rate Limiting
  TOO_MANY_ATTEMPTS: "Cok fazla deneme yaptiniz. Lutfen biraz bekleyin.",

  // Fraud Detection (generic)
  SUBMISSION_REJECTED: "Yanitiniz kabul edilemedi. Lutfen daha sonra tekrar deneyin.",
  SUSPICIOUS_ACTIVITY: "Olagandisi aktivite tespit edildi. Destek ile iletisime gecin.",

  // Account Issues
  ACCOUNT_RESTRICTED: "Hesabiniz gecici olarak kisitlandi.",
}


// ═══════════════════════════════════════════════════════════════════════════
// LOGGING: Full details go to logs, NOT to user
// ═══════════════════════════════════════════════════════════════════════════

function handleLowQualityResponse(
  response: Response,
  qualityScore: number,
  factors: QualityFactors
) {
  // Log full details for debugging/analysis
  logger.warn("Low quality response detected", {
    responseId: response.id,
    contentId: response.contentId,
    qualityScore,           // e.g., 35
    threshold: 40,          // Internal threshold
    factors: {
      timing: factors.timing,           // e.g., 0.15
      consistency: factors.consistency, // e.g., 0.45
      engagement: factors.engagement,   // e.g., 0.30
    },
    recommendation: "EXCLUDE",
  })

  // Return sanitized message to user
  throw new UserFacingError(
    SANITIZED_ERRORS.RESPONSE_LOW_QUALITY,
    "QUALITY_001"
  )
}
```


# ══════════════════════════════════════════════════════════════════════════════
# PLUS TIER PULSE/COMMENTS CLARIFICATION
# ══════════════════════════════════════════════════════════════════════════════

## Plus Tier Exact Capabilities (P-060)

**DECISION P-060: Plus Tier Access Rules**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PLUS TIER: PULSE & COMMENTS ACCESS RULES                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  QUESTION: Can Plus users access PULSE/COMMENTS without participating?         │
│  ANSWER: YES, with the following specific rules:                               │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  PULSE ACCESS                                                           │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  Free User: Must participate first to see PULSE                         │   │
│  │  Plus User: Can view PULSE immediately without participating            │   │
│  │  Premium User: Same as Plus                                             │   │
│  │                                                                          │   │
│  │  PULSE = Real-time demographic breakdown of responses                   │   │
│  │  Shows: % by age, gender, location, etc.                                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  COMMENTS (Read) ACCESS                                                 │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  Free User: Must participate first to read comments                     │   │
│  │  Plus User: Can read comments immediately without participating         │   │
│  │  Premium User: Same as Plus                                             │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  COMMENTS (Write) ACCESS                                                │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  Free User: Must participate + request access (100 char justification)  │   │
│  │  Plus User: Must STILL participate to write comments                    │   │
│  │  Premium User: Must STILL participate to write comments                 │   │
│  │                                                                          │   │
│  │  RATIONALE: Writing comments should require having an opinion (vote)    │   │
│  │  Plus/Premium only bypasses READ access, not WRITE access               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Access Matrix

| Feature | Free (no participation) | Free (participated) | Plus (no participation) | Plus (participated) | Premium |
|---------|------------------------|---------------------|------------------------|--------------------|---------|
| View Results | No | Yes | Yes | Yes | Yes |
| View PULSE | No | Yes | Yes | Yes | Yes |
| Read Comments | No | Yes | Yes | Yes | Yes |
| Write Comments | No | Request Required | No | Yes | Yes |

**Note:** "Request Required" means Free user can request access with 100+ character justification, creator can approve/deny.


# ══════════════════════════════════════════════════════════════════════════════
# DECISION INDEX
# ══════════════════════════════════════════════════════════════════════════════

## Decisions in This Document

| ID | Decision | Section | Status |
|----|----------|---------|--------|
| P-055 | Quality Score Terminology Clarification | 31.1.3 | FINAL |
| P-056 | Real-time Technology Stack (SSE + Partykit) | 31.2.1 | FINAL |
| P-057 | Device Fingerprint Architecture Confirmation | 31.3.1 | FINAL |
| P-058 | Rate Limiting Thresholds | 31.4.1 | FINAL |
| P-059 | Error Message Sanitization Rules | 31.5.2 | FINAL |
| P-060 | Plus Tier PULSE/COMMENTS Access Rules | 31.6.1 | FINAL |


# ══════════════════════════════════════════════════════════════════════════════
# IMPLEMENTATION CHECKLIST
# ══════════════════════════════════════════════════════════════════════════════

## Pre-Code Verification

Before writing any code, verify:

- [ ] Database schema uses `deviceCategory` enum, NOT `deviceFingerprint` string
- [ ] FraudDetectionLog table exists with 30-day auto-expiry
- [ ] Two separate HMAC salts configured (PARTICIPANT_HASH_SALT, FRAUD_DETECTION_SALT)
- [ ] Rate limit middleware configured with values from P-058
- [ ] Error messages use sanitized versions from P-059
- [ ] SSE configured for PULSE, Partykit for Live Poll
- [ ] Plus tier access logic distinguishes READ vs WRITE for comments

## Environment Variables Required

```env
# Separate salts for privacy (MUST be different values)
PARTICIPANT_HASH_SALT=<random-32-bytes-hex>
FRAUD_DETECTION_SALT=<different-random-32-bytes-hex>

# Rate limiting
UPSTASH_REDIS_REST_URL=<url>
UPSTASH_REDIS_REST_TOKEN=<token>

# Real-time
PARTYKIT_HOST=<partykit-project>.partykit.dev
```

---
*Last Updated: 2026-01-23*
