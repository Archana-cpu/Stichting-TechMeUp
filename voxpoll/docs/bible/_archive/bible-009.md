# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 09                                    █
# █                     BOT & FRAUD DETECTION SYSTEM                           █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████
#
# [CROSS-REFERENCES]
# → Bible-028 §28.1: Device Fingerprint Privacy Architecture (AUTHORITATIVE)
# → Bible-028 §28.4: Async Fraud Detection - Two-Phase (AUTHORITATIVE)
# → Bible-031 §31.3: Device Fingerprint Confirmation (AUTHORITATIVE)
# → Bible-031 §31.5: Error Message Sanitization (AUTHORITATIVE)




# ══════════════════════════════════════════════════════════════════════════════
# 9.1 FRAUD DETECTION ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 9.1.1 Multi-Layer Detection Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FRAUD DETECTION ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 1: REGISTRATION GATE                       │   │
│  │              (Prevents fraudulent account creation)                 │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • Phone number verification (SMS OTP)                              │   │
│  │  • Device fingerprint collection                                    │   │
│  │  • IP reputation check                                              │   │
│  │  • Browser/client validation                                        │   │
│  │  • Rate limiting on registration attempts                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 2: SESSION MONITORING                      │   │
│  │              (Real-time behavioral analysis)                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • Mouse movement patterns                                          │   │
│  │  • Keystroke dynamics                                               │   │
│  │  • Scroll behavior                                                  │   │
│  │  • Touch patterns (mobile)                                          │   │
│  │  • Focus/blur events                                                │   │
│  │  • Time between interactions                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 3: RESPONSE ANALYSIS                       │   │
│  │              (Post-submission quality checks)                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • Completion time analysis (speeder detection)                     │   │
│  │  • Answer pattern detection (straight-lining)                       │   │
│  │  • Text quality analysis (gibberish detection)                      │   │
│  │  • Consistency checks (trap questions)                              │   │
│  │  • Cross-response correlation                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 4: NETWORK ANALYSIS                        │   │
│  │              (Cross-account fraud farm detection)                   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • Device fingerprint clustering                                    │   │
│  │  • IP subnet analysis                                               │   │
│  │  • Response similarity detection                                    │   │
│  │  • Timing correlation analysis                                      │   │
│  │  • Account linking patterns                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 9.1.2 Fraud Score vs Quality Score Usage Matrix

### [DECISION P-035] Score System Usage Matrix

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// SCORE SYSTEM USAGE MATRIX
// [AUTHORITATIVE] Defines when to use Fraud Score vs Quality Score
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * TWO SCORING SYSTEMS:
 *
 * 1. FRAUD SCORE (0-100)
 *    - 0 = Definitely fraudulent
 *    - 100 = Definitely legitimate
 *    - Focus: Is this a real person or a bot/fraud?
 *
 * 2. QUALITY SCORE (0-100)
 *    - 0 = Low quality response
 *    - 100 = High quality response
 *    - Focus: Is this response thoughtful and reliable?
 *
 * These scores are INDEPENDENT - a real person can give low quality answers,
 * and quality can only be measured after fraud is ruled out.
 */

const SCORE_USAGE_MATRIX = {
  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIO → WHICH SCORE TO USE
  // ─────────────────────────────────────────────────────────────────────────────

  scenarios: {
    // REGISTRATION & LOGIN
    registration: {
      primaryScore: "FRAUD",
      secondaryScore: null,
      reason: "Validate identity before account creation"
    },
    login: {
      primaryScore: "FRAUD",
      secondaryScore: null,
      reason: "Detect account takeover attempts"
    },

    // CONTENT PARTICIPATION
    pollVote: {
      primaryScore: "FRAUD",
      secondaryScore: "QUALITY",
      reason: "Quick Poll = fraud only, Extended Poll = both"
    },
    surveyResponse: {
      primaryScore: "QUALITY",
      secondaryScore: "FRAUD",
      reason: "Enterprise surveys need quality assessment"
    },
    testCompletion: {
      primaryScore: "QUALITY",
      secondaryScore: "FRAUD",
      reason: "Pattern detection more important than fraud"
    },

    // SOCIAL FEATURES
    commentPosting: {
      primaryScore: "FRAUD",
      secondaryScore: null,
      reason: "Prevent spam and bot comments"
    },
    voting: {
      primaryScore: "FRAUD",
      secondaryScore: null,
      reason: "Prevent vote manipulation"
    },

    // ANALYTICS
    feedRanking: {
      primaryScore: "QUALITY",
      secondaryScore: null,
      reason: "Show high-quality content first"
    },
    resultReliability: {
      primaryScore: "QUALITY",
      secondaryScore: "FRAUD",
      reason: "Weight responses by quality"
    },

    // REPORTING
    creatorDashboard: {
      primaryScore: "BOTH",
      secondaryScore: null,
      reason: "Show both fraud and quality metrics"
    },
    enterpriseReporting: {
      primaryScore: "QUALITY",
      secondaryScore: "FRAUD",
      reason: "Quality is primary concern, fraud for audit"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SCORE COMBINATION RULES
  // ─────────────────────────────────────────────────────────────────────────────

  combinationRules: {
    // When both scores are used, how to combine them

    // Method 1: Sequential (fraud first, then quality)
    sequential: {
      fraudThreshold: 70,           // Must pass fraud check first
      qualityAppliesIf: "FRAUD_PASSED",
      description: "Fraud check gates quality assessment"
    },

    // Method 2: Weighted combination
    weighted: {
      fraudWeight: 0.3,
      qualityWeight: 0.7,
      formula: "combinedScore = (fraud * 0.3) + (quality * 0.7)",
      useCase: "Feed ranking, reliability scoring"
    },

    // Method 3: Minimum (both must pass)
    minimum: {
      fraudMin: 50,
      qualityMin: 40,
      pass: "BOTH >= thresholds",
      useCase: "Enterprise survey inclusion"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTENT TYPE SPECIFIC RULES
  // [REFERENCE: BIBLE-023 Section 23.3.1 quality.thresholds]
  // ─────────────────────────────────────────────────────────────────────────────

  contentRules: {
    QUICK_POLL: {
      fraudOnly: true,
      fraudThreshold: 70,
      qualityThreshold: null,
      description: "Simple engagement, fraud check sufficient"
    },
    EXTENDED_POLL: {
      fraudOnly: false,
      fraudThreshold: 50,
      qualityThreshold: 40,
      description: "More serious polling, quality matters"
    },
    SURVEY: {
      fraudOnly: false,
      fraudThreshold: 50,
      qualityThreshold: 60,
      description: "Enterprise research, highest standards"
    },
    TEST: {
      fraudOnly: false,
      fraudThreshold: 50,
      qualityThreshold: 40,
      description: "Pattern detection weighted higher"
    }
  }
}

// Determine which score(s) to use for a given scenario
function getScoreStrategy(
  scenario: keyof typeof SCORE_USAGE_MATRIX.scenarios,
  contentType?: "QUICK_POLL" | "EXTENDED_POLL" | "SURVEY" | "TEST"
): ScoreStrategy {
  const scenarioConfig = SCORE_USAGE_MATRIX.scenarios[scenario]

  if (contentType && SCORE_USAGE_MATRIX.contentRules[contentType]) {
    const contentConfig = SCORE_USAGE_MATRIX.contentRules[contentType]
    return {
      useFraud: true,
      useQuality: !contentConfig.fraudOnly,
      fraudThreshold: contentConfig.fraudThreshold,
      qualityThreshold: contentConfig.qualityThreshold
    }
  }

  return {
    useFraud: scenarioConfig.primaryScore === "FRAUD" || scenarioConfig.primaryScore === "BOTH",
    useQuality: scenarioConfig.primaryScore === "QUALITY" || scenarioConfig.primaryScore === "BOTH",
    fraudThreshold: 50,  // Default
    qualityThreshold: 40 // Default
  }
}

interface ScoreStrategy {
  useFraud: boolean
  useQuality: boolean
  fraudThreshold: number | null
  qualityThreshold: number | null
}

export { SCORE_USAGE_MATRIX, getScoreStrategy }
export type { ScoreStrategy }
```


## 9.1.2.1 Three Scoring Systems Relationship

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              VOXPOLL SCORING SYSTEMS RELATIONSHIP                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    1. FRAUD SCORE (0-100)                            │   │
│  │                    [AUTHORITATIVE: BIBLE-009]                        │   │
│  │                                                                      │   │
│  │  Purpose: Detect bots, fake accounts, manipulation                   │   │
│  │  Scope: USER/RESPONSE level                                          │   │
│  │  Applied: At registration, login, every submission                   │   │
│  │  Components: IP, device fingerprint, behavior, velocity              │   │
│  │  0 = Definitely fraudulent | 100 = Definitely legitimate             │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│                                 │ GATES (must pass fraud first)             │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    2. QUALITY SCORE (0-100)                          │   │
│  │                    [AUTHORITATIVE: BIBLE-009]                        │   │
│  │                                                                      │   │
│  │  Purpose: Measure response thoughtfulness and engagement             │   │
│  │  Scope: RESPONSE level                                               │   │
│  │  Applied: After fraud check passes, per-response                     │   │
│  │  Components: Timing patterns, answer consistency, attention signals  │   │
│  │  0 = Low quality response | 100 = High quality response              │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│                                 │ AGGREGATES INTO                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    3. RELIABILITY SCORE (0-100)                      │   │
│  │                    [AUTHORITATIVE: BIBLE-004]                        │   │
│  │                                                                      │   │
│  │  Purpose: Indicate overall trustworthiness of CONTENT results        │   │
│  │  Scope: CONTENT level (Poll/Survey/Test)                             │   │
│  │  Applied: Calculated from aggregated response quality                │   │
│  │  Components:                                                         │   │
│  │    - Response Quality (40%): Mean quality scores                     │   │
│  │    - Respondent Diversity (25%): Demographic spread                  │   │
│  │    - Statistical Validity (20%): Sample size, margin of error        │   │
│  │    - Fraud-Free Rate (15%): Percentage of clean responses            │   │
│  │  0 = Unreliable results | 100 = Highly reliable results              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                         SCORING FLOW SUMMARY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Submits Response                                                      │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────┐                                                          │
│  │ Fraud Score  │────► Block if < 50 (configurable per content type)       │
│  └──────┬───────┘                                                          │
│         │ Pass                                                              │
│         ▼                                                                   │
│  ┌──────────────┐                                                          │
│  │Quality Score │────► Flag for review if < threshold                      │
│  └──────┬───────┘                                                          │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │ Content Reliability Score = f(all quality scores, demographics,  │      │
│  │                              sample size, fraud-free rate)        │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// SCORING SYSTEMS QUICK REFERENCE
// ═══════════════════════════════════════════════════════════════════════════════

const SCORING_SYSTEMS_OVERVIEW = {
  fraudScore: {
    authoritative: "BIBLE-009",
    range: [0, 100],
    scope: "USER_OR_RESPONSE",
    question: "Is this a real person?",
    higherIsBetter: true,
    typicalThreshold: 50,
    usedFor: [
      "Blocking bot submissions",
      "Account creation validation",
      "Login anomaly detection",
      "Vote manipulation prevention"
    ]
  },

  qualityScore: {
    authoritative: "BIBLE-009",
    range: [0, 100],
    scope: "RESPONSE",
    question: "Is this response thoughtful and reliable?",
    higherIsBetter: true,
    typicalThresholds: {
      survey: 60,
      poll: 40,
      test: 40
    },
    usedFor: [
      "Response inclusion/exclusion in analytics",
      "Weighting responses in aggregations",
      "Flagging low-effort responses",
      "Creator dashboard insights"
    ]
  },

  reliabilityScore: {
    authoritative: "BIBLE-004",
    range: [0, 100],
    scope: "CONTENT",
    question: "How trustworthy are these poll/survey/test results?",
    higherIsBetter: true,
    displayThresholds: {
      low: { max: 49, label: "Low", color: "red" },
      moderate: { min: 50, max: 69, label: "Moderate", color: "yellow" },
      good: { min: 70, max: 84, label: "Good", color: "light_green" },
      excellent: { min: 85, max: 100, label: "Excellent", color: "green" }
    },
    usedFor: [
      "Feed ranking",
      "Public trust indicator",
      "Enterprise data quality badge",
      "Creator reputation"
    ]
  }
} as const

/**
 * IMPORTANT RELATIONSHIPS:
 *
 * 1. Fraud Score GATES Quality Score
 *    - A response must pass fraud check before quality is assessed
 *    - Fraudulent responses are excluded entirely, not given quality scores
 *
 * 2. Quality Score AGGREGATES INTO Reliability Score
 *    - Individual response quality scores contribute to overall content reliability
 *    - Reliability = 40% quality + 25% diversity + 20% statistical + 15% fraud-free
 *
 * 3. All scores use 0-100 scale but mean different things
 *    - Fraud: legitimacy probability
 *    - Quality: response effort/thoughtfulness
 *    - Reliability: content result trustworthiness
 */

export { SCORING_SYSTEMS_OVERVIEW }
```


## 9.1.3 Detection Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRAUD DETECTION PIPELINE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  REQUEST                                                                    │
│     │                                                                       │
│     ▼                                                                       │
│  ┌──────────────┐    BLOCK     ┌──────────────┐                            │
│  │   IP Check   │─────────────►│   REJECTED   │                            │
│  └──────┬───────┘              └──────────────┘                            │
│         │ PASS                                                              │
│         ▼                                                                   │
│  ┌──────────────┐    BLOCK     ┌──────────────┐                            │
│  │Device Check  │─────────────►│   REJECTED   │                            │
│  └──────┬───────┘              └──────────────┘                            │
│         │ PASS                                                              │
│         ▼                                                                   │
│  ┌──────────────┐    BLOCK     ┌──────────────┐                            │
│  │ Rate Limit   │─────────────►│   REJECTED   │                            │
│  └──────┬───────┘              └──────────────┘                            │
│         │ PASS                                                              │
│         ▼                                                                   │
│  ┌──────────────┐                                                          │
│  │   ALLOWED    │──────► Process Request                                   │
│  └──────┬───────┘                                                          │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │              ASYNC: Behavioral Signal Collection                  │      │
│  │  • Mouse/touch events  • Scroll patterns  • Timing data          │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │              POST-SUBMISSION: Response Analysis                   │      │
│  │  • Pattern detection  • Quality scoring  • Fraud flagging        │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 9.2 DEVICE FINGERPRINTING
# ══════════════════════════════════════════════════════════════════════════════

## 9.2.1 Fingerprint Components

```typescript
const DeviceFingerprintComponentsSchema = z.object({
  canvas: z.string().max(64),
  webgl: z.string().max(64),
  webglVendor: z.string().max(128),
  webglRenderer: z.string().max(256),

  audioContext: z.string().max(64),

  screen: z.object({
    width: z.number().int().min(0).max(10000),
    height: z.number().int().min(0).max(10000),
    colorDepth: z.number().int().min(1).max(48),
    pixelRatio: z.number().min(0.1).max(10)
  }),

  timezone: z.string().max(64),
  timezoneOffset: z.number().int().min(-840).max(840),

  languages: z.array(z.string().max(16)).max(20),

  platform: z.string().max(64),
  userAgent: z.string().max(512),

  hardwareConcurrency: z.number().int().min(1).max(128).nullable(),
  deviceMemory: z.number().min(0.25).max(512).nullable(),

  touchSupport: z.object({
    maxTouchPoints: z.number().int().min(0).max(20),
    touchEvent: z.boolean(),
    touchStart: z.boolean()
  }),

  plugins: z.array(z.string().max(128)).max(50),

  fonts: z.array(z.string().max(64)).max(200),

  webrtcIPs: z.array(z.string().ip()).max(10),

  storageAvailable: z.object({
    localStorage: z.boolean(),
    sessionStorage: z.boolean(),
    indexedDB: z.boolean(),
    cookies: z.boolean()
  }),

  doNotTrack: z.boolean().nullable(),
  adBlocker: z.boolean()
})

type DeviceFingerprintComponents = z.infer<typeof DeviceFingerprintComponentsSchema>
```


## 9.2.2 Fingerprint Generation

```typescript
const FINGERPRINT_WEIGHTS = {
  canvas: 0.15,
  webgl: 0.12,
  audioContext: 0.10,
  screen: 0.08,
  timezone: 0.06,
  fonts: 0.12,
  plugins: 0.08,
  webrtcIPs: 0.10,
  hardware: 0.07,
  platform: 0.06,
  touch: 0.06
} as const

const FingerprintResultSchema = z.object({
  hash: z.string().length(64),
  confidence: z.number().min(0).max(1),
  components: DeviceFingerprintComponentsSchema,
  collectedAt: z.date(),
  version: z.string()
})

type FingerprintResult = z.infer<typeof FingerprintResultSchema>


async function generateDeviceFingerprint(
  components: DeviceFingerprintComponents
): Promise<FingerprintResult> {
  const normalizedComponents = normalizeComponents(components)

  const componentStrings = [
    normalizedComponents.canvas,
    normalizedComponents.webgl,
    normalizedComponents.webglVendor,
    normalizedComponents.audioContext,
    `${normalizedComponents.screen.width}x${normalizedComponents.screen.height}x${normalizedComponents.screen.colorDepth}`,
    normalizedComponents.timezone,
    normalizedComponents.languages.sort().join(","),
    normalizedComponents.platform,
    normalizedComponents.fonts.sort().join(","),
    normalizedComponents.plugins.sort().join(",")
  ]

  const fingerprintString = componentStrings.join("|")
  const hash = await sha256(fingerprintString)

  const confidence = calculateConfidence(components)

  return {
    hash,
    confidence,
    components,
    collectedAt: new Date(),
    version: "1.0.0"
  }
}


function normalizeComponents(
  components: DeviceFingerprintComponents
): DeviceFingerprintComponents {
  return {
    ...components,
    userAgent: normalizeUserAgent(components.userAgent),
    languages: components.languages.map(l => l.toLowerCase()),
    fonts: components.fonts.map(f => f.toLowerCase().trim()),
    plugins: components.plugins.map(p => p.toLowerCase().trim())
  }
}


function normalizeUserAgent(ua: string): string {
  return ua
    .replace(/Chrome\/[\d.]+/g, "Chrome/X")
    .replace(/Firefox\/[\d.]+/g, "Firefox/X")
    .replace(/Safari\/[\d.]+/g, "Safari/X")
    .replace(/Version\/[\d.]+/g, "Version/X")
}


function calculateConfidence(components: DeviceFingerprintComponents): number {
  let score = 0
  let maxScore = 0

  if (components.canvas && components.canvas.length > 10) {
    score += FINGERPRINT_WEIGHTS.canvas
  }
  maxScore += FINGERPRINT_WEIGHTS.canvas

  if (components.webgl && components.webgl.length > 10) {
    score += FINGERPRINT_WEIGHTS.webgl
  }
  maxScore += FINGERPRINT_WEIGHTS.webgl

  if (components.audioContext && components.audioContext.length > 10) {
    score += FINGERPRINT_WEIGHTS.audioContext
  }
  maxScore += FINGERPRINT_WEIGHTS.audioContext

  if (components.screen.width > 0 && components.screen.height > 0) {
    score += FINGERPRINT_WEIGHTS.screen
  }
  maxScore += FINGERPRINT_WEIGHTS.screen

  if (components.fonts.length >= 10) {
    score += FINGERPRINT_WEIGHTS.fonts
  } else if (components.fonts.length >= 5) {
    score += FINGERPRINT_WEIGHTS.fonts * 0.5
  }
  maxScore += FINGERPRINT_WEIGHTS.fonts

  if (components.webrtcIPs.length > 0) {
    score += FINGERPRINT_WEIGHTS.webrtcIPs
  }
  maxScore += FINGERPRINT_WEIGHTS.webrtcIPs

  return maxScore > 0 ? score / maxScore : 0
}


async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

export {
  DeviceFingerprintComponentsSchema,
  FingerprintResultSchema,
  FINGERPRINT_WEIGHTS,
  generateDeviceFingerprint,
  normalizeComponents,
  normalizeUserAgent,
  calculateConfidence
}
export type {
  DeviceFingerprintComponents,
  FingerprintResult
}
```


## 9.2.3 Fingerprint Storage & Comparison

```typescript
const FINGERPRINT_SIMILARITY_THRESHOLD = 0.85
const FINGERPRINT_EXACT_MATCH_THRESHOLD = 0.98

const FingerprintComparisonResultSchema = z.object({
  similarity: z.number().min(0).max(1),
  isExactMatch: z.boolean(),
  isSimilar: z.boolean(),
  matchedComponents: z.array(z.string()),
  differingComponents: z.array(z.string())
})

type FingerprintComparisonResult = z.infer<typeof FingerprintComparisonResultSchema>


function compareFingerprints(
  fp1: DeviceFingerprintComponents,
  fp2: DeviceFingerprintComponents
): FingerprintComparisonResult {
  const matchedComponents: string[] = []
  const differingComponents: string[] = []
  let totalWeight = 0
  let matchedWeight = 0

  if (fp1.canvas === fp2.canvas) {
    matchedComponents.push("canvas")
    matchedWeight += FINGERPRINT_WEIGHTS.canvas
  } else {
    differingComponents.push("canvas")
  }
  totalWeight += FINGERPRINT_WEIGHTS.canvas

  if (fp1.webgl === fp2.webgl) {
    matchedComponents.push("webgl")
    matchedWeight += FINGERPRINT_WEIGHTS.webgl
  } else {
    differingComponents.push("webgl")
  }
  totalWeight += FINGERPRINT_WEIGHTS.webgl

  if (fp1.audioContext === fp2.audioContext) {
    matchedComponents.push("audioContext")
    matchedWeight += FINGERPRINT_WEIGHTS.audioContext
  } else {
    differingComponents.push("audioContext")
  }
  totalWeight += FINGERPRINT_WEIGHTS.audioContext

  const screenMatch =
    fp1.screen.width === fp2.screen.width &&
    fp1.screen.height === fp2.screen.height &&
    fp1.screen.colorDepth === fp2.screen.colorDepth
  if (screenMatch) {
    matchedComponents.push("screen")
    matchedWeight += FINGERPRINT_WEIGHTS.screen
  } else {
    differingComponents.push("screen")
  }
  totalWeight += FINGERPRINT_WEIGHTS.screen

  if (fp1.timezone === fp2.timezone) {
    matchedComponents.push("timezone")
    matchedWeight += FINGERPRINT_WEIGHTS.timezone
  } else {
    differingComponents.push("timezone")
  }
  totalWeight += FINGERPRINT_WEIGHTS.timezone

  const fontSimilarity = calculateArraySimilarity(fp1.fonts, fp2.fonts)
  if (fontSimilarity > 0.9) {
    matchedComponents.push("fonts")
    matchedWeight += FINGERPRINT_WEIGHTS.fonts * fontSimilarity
  } else {
    differingComponents.push("fonts")
  }
  totalWeight += FINGERPRINT_WEIGHTS.fonts

  const pluginSimilarity = calculateArraySimilarity(fp1.plugins, fp2.plugins)
  if (pluginSimilarity > 0.9) {
    matchedComponents.push("plugins")
    matchedWeight += FINGERPRINT_WEIGHTS.plugins * pluginSimilarity
  } else {
    differingComponents.push("plugins")
  }
  totalWeight += FINGERPRINT_WEIGHTS.plugins

  const similarity = totalWeight > 0 ? matchedWeight / totalWeight : 0

  return {
    similarity,
    isExactMatch: similarity >= FINGERPRINT_EXACT_MATCH_THRESHOLD,
    isSimilar: similarity >= FINGERPRINT_SIMILARITY_THRESHOLD,
    matchedComponents,
    differingComponents
  }
}


function calculateArraySimilarity(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 1
  if (arr1.length === 0 || arr2.length === 0) return 0

  const set1 = new Set(arr1)
  const set2 = new Set(arr2)

  let intersection = 0
  for (const item of set1) {
    if (set2.has(item)) {
      intersection++
    }
  }

  const union = set1.size + set2.size - intersection
  return union > 0 ? intersection / union : 0
}

export {
  FINGERPRINT_SIMILARITY_THRESHOLD,
  FINGERPRINT_EXACT_MATCH_THRESHOLD,
  FingerprintComparisonResultSchema,
  compareFingerprints,
  calculateArraySimilarity
}
export type {
  FingerprintComparisonResult
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 9.3 BEHAVIORAL ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

## 9.3.1 Behavioral Signal Collection

```typescript
const MouseEventSchema = z.object({
  type: z.enum(["move", "click", "scroll"]),
  x: z.number().int(),
  y: z.number().int(),
  timestamp: z.number().int(),
  target: z.string().max(128).optional()
})

const KeystrokeEventSchema = z.object({
  keyCode: z.number().int().min(0).max(255),
  duration: z.number().int().min(0).max(10000),
  timestamp: z.number().int(),
  isSpecialKey: z.boolean()
})

const TouchEventSchema = z.object({
  type: z.enum(["start", "move", "end"]),
  touches: z.array(z.object({
    x: z.number().int(),
    y: z.number().int(),
    force: z.number().min(0).max(1).optional()
  })).max(10),
  timestamp: z.number().int()
})

const BehavioralSignalsSchema = z.object({
  sessionId: z.string().cuid(),

  mouseEvents: z.array(MouseEventSchema).max(10000),
  keystrokeEvents: z.array(KeystrokeEventSchema).max(5000),
  touchEvents: z.array(TouchEventSchema).max(5000),

  scrollEvents: z.array(z.object({
    scrollTop: z.number().int(),
    scrollHeight: z.number().int(),
    timestamp: z.number().int()
  })).max(1000),

  focusEvents: z.array(z.object({
    type: z.enum(["focus", "blur"]),
    timestamp: z.number().int()
  })).max(500),

  pageVisibility: z.array(z.object({
    visible: z.boolean(),
    timestamp: z.number().int()
  })).max(500),

  windowResize: z.array(z.object({
    width: z.number().int(),
    height: z.number().int(),
    timestamp: z.number().int()
  })).max(100),

  collectionStartedAt: z.number().int(),
  collectionEndedAt: z.number().int()
})

type MouseEvent = z.infer<typeof MouseEventSchema>
type KeystrokeEvent = z.infer<typeof KeystrokeEventSchema>
type TouchEvent = z.infer<typeof TouchEventSchema>
type BehavioralSignals = z.infer<typeof BehavioralSignalsSchema>
```


## 9.3.2 Behavioral Analysis Engine

```typescript
const BehavioralScoreSchema = z.object({
  humanScore: z.number().min(0).max(100),
  botScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),

  signals: z.object({
    mouseNaturalness: z.number().min(0).max(100),
    keystrokeDynamics: z.number().min(0).max(100),
    scrollBehavior: z.number().min(0).max(100),
    timingPatterns: z.number().min(0).max(100),
    interactionConsistency: z.number().min(0).max(100)
  }),

  flags: z.array(z.enum([
    "LINEAR_MOUSE_MOVEMENT",
    "CONSTANT_KEYSTROKE_TIMING",
    "NO_MOUSE_MOVEMENT",
    "SUSPICIOUS_SCROLL_PATTERN",
    "INHUMAN_SPEED",
    "PROGRAMMATIC_TIMING",
    "NO_FOCUS_CHANGES",
    "COPY_PASTE_DETECTED"
  ])),

  analyzedAt: z.date()
})

type BehavioralScore = z.infer<typeof BehavioralScoreSchema>


const BEHAVIORAL_THRESHOLDS = {
  MIN_MOUSE_EVENTS: 10,
  MIN_KEYSTROKE_EVENTS: 5,
  MIN_SESSION_DURATION_MS: 5000,

  MAX_LINEAR_MOUSE_RATIO: 0.7,
  MIN_MOUSE_VELOCITY_VARIANCE: 0.1,

  MIN_KEYSTROKE_VARIANCE_MS: 20,
  MAX_CONSTANT_TIMING_RATIO: 0.8,

  MIN_SCROLL_STOPS: 2,
  MAX_SCROLL_SPEED: 10000,

  BOT_THRESHOLD: 60,
  HUMAN_THRESHOLD: 40
} as const


function analyzeBehavioralSignals(signals: BehavioralSignals): BehavioralScore {
  const flags: BehavioralScore["flags"] = []

  const mouseScore = analyzeMouseBehavior(signals.mouseEvents, flags)
  const keystrokeScore = analyzeKeystrokeDynamics(signals.keystrokeEvents, flags)
  const scrollScore = analyzeScrollBehavior(signals.scrollEvents, flags)
  const timingScore = analyzeTimingPatterns(signals, flags)
  const consistencyScore = analyzeInteractionConsistency(signals, flags)

  const weights = {
    mouse: 0.25,
    keystroke: 0.20,
    scroll: 0.15,
    timing: 0.25,
    consistency: 0.15
  }

  const humanScore =
    mouseScore * weights.mouse +
    keystrokeScore * weights.keystroke +
    scrollScore * weights.scroll +
    timingScore * weights.timing +
    consistencyScore * weights.consistency

  const botScore = 100 - humanScore

  const totalEvents =
    signals.mouseEvents.length +
    signals.keystrokeEvents.length +
    signals.touchEvents.length +
    signals.scrollEvents.length

  const sessionDuration = signals.collectionEndedAt - signals.collectionStartedAt

  let confidence = 0.5
  if (totalEvents > 100 && sessionDuration > 30000) {
    confidence = 0.9
  } else if (totalEvents > 50 && sessionDuration > 15000) {
    confidence = 0.75
  } else if (totalEvents > 20 && sessionDuration > 5000) {
    confidence = 0.6
  }

  return {
    humanScore: Math.round(humanScore),
    botScore: Math.round(botScore),
    confidence,
    signals: {
      mouseNaturalness: Math.round(mouseScore),
      keystrokeDynamics: Math.round(keystrokeScore),
      scrollBehavior: Math.round(scrollScore),
      timingPatterns: Math.round(timingScore),
      interactionConsistency: Math.round(consistencyScore)
    },
    flags,
    analyzedAt: new Date()
  }
}


function analyzeMouseBehavior(
  events: MouseEvent[],
  flags: BehavioralScore["flags"]
): number {
  if (events.length < BEHAVIORAL_THRESHOLDS.MIN_MOUSE_EVENTS) {
    flags.push("NO_MOUSE_MOVEMENT")
    return 30
  }

  let score = 100

  let linearCount = 0
  for (let i = 2; i < events.length; i++) {
    const p1 = events[i - 2]
    const p2 = events[i - 1]
    const p3 = events[i]

    if (isLinear(p1, p2, p3)) {
      linearCount++
    }
  }

  const linearRatio = linearCount / (events.length - 2)
  if (linearRatio > BEHAVIORAL_THRESHOLDS.MAX_LINEAR_MOUSE_RATIO) {
    flags.push("LINEAR_MOUSE_MOVEMENT")
    score -= 30
  }

  const velocities: number[] = []
  for (let i = 1; i < events.length; i++) {
    const dx = events[i].x - events[i - 1].x
    const dy = events[i].y - events[i - 1].y
    const dt = events[i].timestamp - events[i - 1].timestamp
    if (dt > 0) {
      velocities.push(Math.sqrt(dx * dx + dy * dy) / dt)
    }
  }

  const velocityVariance = calculateVariance(velocities)
  if (velocityVariance < BEHAVIORAL_THRESHOLDS.MIN_MOUSE_VELOCITY_VARIANCE) {
    score -= 20
  }

  return Math.max(0, score)
}


function analyzeKeystrokeDynamics(
  events: KeystrokeEvent[],
  flags: BehavioralScore["flags"]
): number {
  if (events.length < BEHAVIORAL_THRESHOLDS.MIN_KEYSTROKE_EVENTS) {
    return 50
  }

  let score = 100

  const durations = events.map(e => e.duration)
  const durationVariance = calculateVariance(durations)

  if (durationVariance < BEHAVIORAL_THRESHOLDS.MIN_KEYSTROKE_VARIANCE_MS) {
    flags.push("CONSTANT_KEYSTROKE_TIMING")
    score -= 40
  }

  const intervals: number[] = []
  for (let i = 1; i < events.length; i++) {
    intervals.push(events[i].timestamp - events[i - 1].timestamp)
  }

  const intervalVariance = calculateVariance(intervals)
  if (intervalVariance < BEHAVIORAL_THRESHOLDS.MIN_KEYSTROKE_VARIANCE_MS) {
    score -= 20
  }

  let constantCount = 0
  for (let i = 1; i < intervals.length; i++) {
    if (Math.abs(intervals[i] - intervals[i - 1]) < 10) {
      constantCount++
    }
  }

  const constantRatio = constantCount / intervals.length
  if (constantRatio > BEHAVIORAL_THRESHOLDS.MAX_CONSTANT_TIMING_RATIO) {
    flags.push("PROGRAMMATIC_TIMING")
    score -= 30
  }

  return Math.max(0, score)
}


function analyzeScrollBehavior(
  events: Array<{ scrollTop: number; scrollHeight: number; timestamp: number }>,
  flags: BehavioralScore["flags"]
): number {
  if (events.length < 3) {
    return 50
  }

  let score = 100

  let stopCount = 0
  for (let i = 1; i < events.length - 1; i++) {
    const prevDelta = events[i].scrollTop - events[i - 1].scrollTop
    const nextDelta = events[i + 1].scrollTop - events[i].scrollTop

    if (Math.abs(prevDelta) > 50 && Math.abs(nextDelta) < 10) {
      stopCount++
    }
  }

  if (stopCount < BEHAVIORAL_THRESHOLDS.MIN_SCROLL_STOPS) {
    flags.push("SUSPICIOUS_SCROLL_PATTERN")
    score -= 20
  }

  for (let i = 1; i < events.length; i++) {
    const delta = Math.abs(events[i].scrollTop - events[i - 1].scrollTop)
    const dt = events[i].timestamp - events[i - 1].timestamp
    if (dt > 0) {
      const speed = delta / dt * 1000
      if (speed > BEHAVIORAL_THRESHOLDS.MAX_SCROLL_SPEED) {
        flags.push("INHUMAN_SPEED")
        score -= 30
        break
      }
    }
  }

  return Math.max(0, score)
}


function analyzeTimingPatterns(
  signals: BehavioralSignals,
  flags: BehavioralScore["flags"]
): number {
  let score = 100

  const sessionDuration = signals.collectionEndedAt - signals.collectionStartedAt

  if (sessionDuration < BEHAVIORAL_THRESHOLDS.MIN_SESSION_DURATION_MS) {
    flags.push("INHUMAN_SPEED")
    score -= 40
  }

  if (signals.focusEvents.length < 2) {
    flags.push("NO_FOCUS_CHANGES")
    score -= 15
  }

  const allTimestamps = [
    ...signals.mouseEvents.map(e => e.timestamp),
    ...signals.keystrokeEvents.map(e => e.timestamp),
    ...signals.scrollEvents.map(e => e.timestamp)
  ].sort((a, b) => a - b)

  if (allTimestamps.length > 10) {
    const intervals: number[] = []
    for (let i = 1; i < allTimestamps.length; i++) {
      intervals.push(allTimestamps[i] - allTimestamps[i - 1])
    }

    const intervalVariance = calculateVariance(intervals)
    if (intervalVariance < 50) {
      flags.push("PROGRAMMATIC_TIMING")
      score -= 25
    }
  }

  return Math.max(0, score)
}


function analyzeInteractionConsistency(
  signals: BehavioralSignals,
  flags: BehavioralScore["flags"]
): number {
  let score = 100

  const hasMouseEvents = signals.mouseEvents.length > 0
  const hasTouchEvents = signals.touchEvents.length > 0
  const hasKeystrokeEvents = signals.keystrokeEvents.length > 0

  if (!hasMouseEvents && !hasTouchEvents) {
    score -= 30
  }

  if (hasMouseEvents && hasTouchEvents) {
    const mouseTimestamps = signals.mouseEvents.map(e => e.timestamp)
    const touchTimestamps = signals.touchEvents.map(e => e.timestamp)

    let overlapping = 0
    for (const mt of mouseTimestamps) {
      for (const tt of touchTimestamps) {
        if (Math.abs(mt - tt) < 100) {
          overlapping++
        }
      }
    }

    if (overlapping > 5) {
      score -= 20
    }
  }

  return Math.max(0, score)
}


function isLinear(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): boolean {
  const area = Math.abs(
    (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)
  )
  return area < 100
}


function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
}

export {
  MouseEventSchema,
  KeystrokeEventSchema,
  TouchEventSchema,
  BehavioralSignalsSchema,
  BehavioralScoreSchema,
  BEHAVIORAL_THRESHOLDS,
  analyzeBehavioralSignals,
  analyzeMouseBehavior,
  analyzeKeystrokeDynamics,
  analyzeScrollBehavior,
  analyzeTimingPatterns,
  analyzeInteractionConsistency
}
export type {
  MouseEvent,
  KeystrokeEvent,
  TouchEvent,
  BehavioralSignals,
  BehavioralScore
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 9.4 RESPONSE PATTERN DETECTION
# ══════════════════════════════════════════════════════════════════════════════

## 9.4.1 Pattern Detection Types

```typescript
const PatternTypeSchema = z.enum([
  "STRAIGHT_LINING",
  "DIAGONAL_LINING",
  "CHRISTMAS_TREE",
  "ZIGZAG",
  "RANDOM_CLICKING",
  "SPEEDING",
  "EXTREME_SLOWNESS",
  "GIBBERISH_TEXT",
  "COPY_PASTE_TEXT",
  "ATTENTION_CHECK_FAIL",
  "INCONSISTENT_ANSWERS",
  "REPEATED_PATTERNS"
])

const PatternDetectionResultSchema = z.object({
  patternType: PatternTypeSchema,
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  confidence: z.number().min(0).max(1),
  affectedQuestions: z.array(z.string()),
  description: z.string(),
  score: z.number().min(0).max(100)
})

const ResponsePatternAnalysisSchema = z.object({
  responseId: z.string().cuid(),
  totalScore: z.number().min(0).max(100),
  patterns: z.array(PatternDetectionResultSchema),
  recommendation: z.enum(["ACCEPT", "REVIEW", "REJECT"]),
  analyzedAt: z.date()
})

type PatternType = z.infer<typeof PatternTypeSchema>
type PatternDetectionResult = z.infer<typeof PatternDetectionResultSchema>
type ResponsePatternAnalysis = z.infer<typeof ResponsePatternAnalysisSchema>
```


## 9.4.2 Straight-Lining Detection

```typescript
const STRAIGHT_LINE_THRESHOLDS = {
  MIN_QUESTIONS_FOR_DETECTION: 5,
  SAME_ANSWER_RATIO_WARNING: 0.6,
  SAME_ANSWER_RATIO_CRITICAL: 0.8,
  POSITION_BIAS_THRESHOLD: 0.7
} as const


function detectStraightLining(
  answers: Array<{
    questionId: string
    questionType: string
    value: unknown
    options?: Array<{ id: string; position: number }>
  }>
): PatternDetectionResult | null {
  const scaleAnswers = answers.filter(a =>
    ["SINGLE_CHOICE", "LIKERT", "RATING", "LINEAR_SCALE"].includes(a.questionType)
  )

  if (scaleAnswers.length < STRAIGHT_LINE_THRESHOLDS.MIN_QUESTIONS_FOR_DETECTION) {
    return null
  }

  const valueCounts = new Map<string, number>()
  for (const answer of scaleAnswers) {
    const key = String(answer.value)
    valueCounts.set(key, (valueCounts.get(key) ?? 0) + 1)
  }

  const maxCount = Math.max(...valueCounts.values())
  const sameAnswerRatio = maxCount / scaleAnswers.length

  if (sameAnswerRatio < STRAIGHT_LINE_THRESHOLDS.SAME_ANSWER_RATIO_WARNING) {
    return null
  }

  let severity: PatternDetectionResult["severity"] = "LOW"
  let score = 20

  if (sameAnswerRatio >= STRAIGHT_LINE_THRESHOLDS.SAME_ANSWER_RATIO_CRITICAL) {
    severity = "CRITICAL"
    score = 50
  } else if (sameAnswerRatio >= STRAIGHT_LINE_THRESHOLDS.SAME_ANSWER_RATIO_WARNING) {
    severity = "MEDIUM"
    score = 35
  }

  const positionBias = detectPositionBias(scaleAnswers)
  if (positionBias > STRAIGHT_LINE_THRESHOLDS.POSITION_BIAS_THRESHOLD) {
    severity = severity === "LOW" ? "MEDIUM" : severity
    score += 10
  }

  const affectedQuestions = scaleAnswers
    .filter(a => String(a.value) === [...valueCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0][0])
    .map(a => a.questionId)

  return {
    patternType: "STRAIGHT_LINING",
    severity,
    confidence: Math.min(0.95, sameAnswerRatio),
    affectedQuestions,
    description: `${Math.round(sameAnswerRatio * 100)}% of scale questions have the same answer`,
    score: Math.min(100, score)
  }
}


function detectPositionBias(
  answers: Array<{
    questionId: string
    value: unknown
    options?: Array<{ id: string; position: number }>
  }>
): number {
  const answersWithPosition = answers.filter(a => a.options && a.options.length > 0)

  if (answersWithPosition.length < 5) {
    return 0
  }

  const positions: number[] = []
  for (const answer of answersWithPosition) {
    const selectedOption = answer.options?.find(o => o.id === String(answer.value))
    if (selectedOption) {
      const normalizedPosition = selectedOption.position / (answer.options!.length - 1)
      positions.push(normalizedPosition)
    }
  }

  if (positions.length < 5) {
    return 0
  }

  const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length

  const firstPositionCount = positions.filter(p => p === 0).length
  const lastPositionCount = positions.filter(p => p === 1).length

  const extremeBias = Math.max(firstPositionCount, lastPositionCount) / positions.length

  return Math.max(extremeBias, Math.abs(avgPosition - 0.5) * 2)
}

export {
  STRAIGHT_LINE_THRESHOLDS,
  detectStraightLining,
  detectPositionBias
}
```


## 9.4.3 Speeding Detection

```typescript
const SPEEDING_THRESHOLDS = {
  MIN_SECONDS_PER_QUESTION: 2,
  MIN_SECONDS_PER_CHARACTER_READ: 0.05,
  MIN_TOTAL_COMPLETION_SECONDS: 30,
  WARNING_SPEED_MULTIPLIER: 0.5,
  CRITICAL_SPEED_MULTIPLIER: 0.25
} as const


interface QuestionTiming {
  questionId: string
  questionType: string
  textLength: number
  optionCount: number
  timeSpentMs: number
  expectedMinTimeMs: number
}


function calculateExpectedMinTime(
  questionType: string,
  textLength: number,
  optionCount: number
): number {
  const readingTimeMs = textLength * SPEEDING_THRESHOLDS.MIN_SECONDS_PER_CHARACTER_READ * 1000

  let answeringTimeMs = SPEEDING_THRESHOLDS.MIN_SECONDS_PER_QUESTION * 1000

  switch (questionType) {
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      answeringTimeMs += optionCount * 500
      break
    case "LIKERT":
    case "RATING":
    case "LINEAR_SCALE":
      answeringTimeMs += 1000
      break
    case "SHORT_TEXT":
      answeringTimeMs += 3000
      break
    case "LONG_TEXT":
      answeringTimeMs += 10000
      break
    case "MATRIX":
      answeringTimeMs += optionCount * 1500
      break
    case "RANKING":
      answeringTimeMs += optionCount * 1000
      break
  }

  return readingTimeMs + answeringTimeMs
}


function detectSpeeding(
  timings: QuestionTiming[],
  totalCompletionTimeMs: number
): PatternDetectionResult | null {
  if (timings.length < 3) {
    return null
  }

  const totalExpectedMinTime = timings.reduce((sum, t) => sum + t.expectedMinTimeMs, 0)
  const overallSpeedRatio = totalCompletionTimeMs / totalExpectedMinTime

  let speedingQuestions: string[] = []
  let severeSpeedingCount = 0

  for (const timing of timings) {
    const questionSpeedRatio = timing.timeSpentMs / timing.expectedMinTimeMs

    if (questionSpeedRatio < SPEEDING_THRESHOLDS.CRITICAL_SPEED_MULTIPLIER) {
      speedingQuestions.push(timing.questionId)
      severeSpeedingCount++
    } else if (questionSpeedRatio < SPEEDING_THRESHOLDS.WARNING_SPEED_MULTIPLIER) {
      speedingQuestions.push(timing.questionId)
    }
  }

  const speedingRatio = speedingQuestions.length / timings.length

  if (speedingRatio < 0.2 && overallSpeedRatio > SPEEDING_THRESHOLDS.WARNING_SPEED_MULTIPLIER) {
    return null
  }

  let severity: PatternDetectionResult["severity"] = "LOW"
  let score = 15

  if (overallSpeedRatio < SPEEDING_THRESHOLDS.CRITICAL_SPEED_MULTIPLIER || speedingRatio > 0.5) {
    severity = "CRITICAL"
    score = 45
  } else if (overallSpeedRatio < SPEEDING_THRESHOLDS.WARNING_SPEED_MULTIPLIER || speedingRatio > 0.3) {
    severity = "HIGH"
    score = 35
  } else if (speedingRatio > 0.2) {
    severity = "MEDIUM"
    score = 25
  }

  const confidence = Math.min(0.95, 0.5 + speedingRatio * 0.5)

  return {
    patternType: "SPEEDING",
    severity,
    confidence,
    affectedQuestions: speedingQuestions,
    description: `Completed ${Math.round((1 - overallSpeedRatio) * 100)}% faster than expected minimum time`,
    score
  }
}

export {
  SPEEDING_THRESHOLDS,
  calculateExpectedMinTime,
  detectSpeeding
}
export type {
  QuestionTiming
}
```


## 9.4.4 Text Quality Analysis

```typescript
const TEXT_QUALITY_THRESHOLDS = {
  MIN_TEXT_LENGTH_FOR_ANALYSIS: 20,
  GIBBERISH_CONSONANT_RATIO: 0.75,
  GIBBERISH_VOWEL_RATIO: 0.15,
  MIN_WORD_LENGTH: 2,
  MAX_AVG_WORD_LENGTH: 15,
  REPEATED_CHAR_THRESHOLD: 4,
  KEYBOARD_SMASH_PATTERNS: ["asdf", "qwer", "zxcv", "hjkl", "uiop"]
} as const


function analyzeTextQuality(
  answers: Array<{
    questionId: string
    value: string
  }>
): PatternDetectionResult[] {
  const results: PatternDetectionResult[] = []

  const textAnswers = answers.filter(
    a => typeof a.value === "string" &&
         a.value.length >= TEXT_QUALITY_THRESHOLDS.MIN_TEXT_LENGTH_FOR_ANALYSIS
  )

  const gibberishQuestions: string[] = []

  for (const answer of textAnswers) {
    const text = answer.value.toLowerCase()

    const consonants = (text.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length
    const vowels = (text.match(/[aeiou]/g) || []).length
    const letters = consonants + vowels

    if (letters > 0) {
      const consonantRatio = consonants / letters
      const vowelRatio = vowels / letters

      if (consonantRatio > TEXT_QUALITY_THRESHOLDS.GIBBERISH_CONSONANT_RATIO ||
          vowelRatio < TEXT_QUALITY_THRESHOLDS.GIBBERISH_VOWEL_RATIO) {
        gibberishQuestions.push(answer.questionId)
        continue
      }
    }

    const words = text.split(/\s+/).filter(w => w.length > 0)
    if (words.length > 0) {
      const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length

      if (avgWordLength > TEXT_QUALITY_THRESHOLDS.MAX_AVG_WORD_LENGTH ||
          avgWordLength < TEXT_QUALITY_THRESHOLDS.MIN_WORD_LENGTH) {
        gibberishQuestions.push(answer.questionId)
        continue
      }
    }

    const repeatedChars = text.match(new RegExp(`(.)\\1{${TEXT_QUALITY_THRESHOLDS.REPEATED_CHAR_THRESHOLD},}`, "g"))
    if (repeatedChars && repeatedChars.length > 0) {
      gibberishQuestions.push(answer.questionId)
      continue
    }

    for (const pattern of TEXT_QUALITY_THRESHOLDS.KEYBOARD_SMASH_PATTERNS) {
      if (text.includes(pattern)) {
        gibberishQuestions.push(answer.questionId)
        break
      }
    }
  }

  if (gibberishQuestions.length > 0) {
    const ratio = gibberishQuestions.length / textAnswers.length

    let severity: PatternDetectionResult["severity"] = "LOW"
    let score = 15

    if (ratio > 0.5) {
      severity = "CRITICAL"
      score = 40
    } else if (ratio > 0.3) {
      severity = "HIGH"
      score = 30
    } else if (ratio > 0.1) {
      severity = "MEDIUM"
      score = 20
    }

    results.push({
      patternType: "GIBBERISH_TEXT",
      severity,
      confidence: 0.8,
      affectedQuestions: gibberishQuestions,
      description: `${gibberishQuestions.length} of ${textAnswers.length} text answers appear to be gibberish`,
      score
    })
  }

  return results
}

export {
  TEXT_QUALITY_THRESHOLDS,
  analyzeTextQuality
}
```


## 9.4.5 Attention Check (Trap Question) Detection

```typescript
const AttentionCheckResultSchema = z.object({
  questionId: z.string(),
  checkType: z.enum([
    "INSTRUCTED_RESPONSE",
    "CONSISTENCY_CHECK",
    "REVERSED_ITEM",
    "OPEN_ENDED_TRAP",
    "TIME_TRAP"
  ]),
  passed: z.boolean(),
  expectedValue: z.unknown(),
  actualValue: z.unknown()
})

type AttentionCheckResult = z.infer<typeof AttentionCheckResultSchema>


function evaluateAttentionChecks(
  responses: Array<{
    questionId: string
    value: unknown
    timeSpentMs: number
  }>,
  attentionCheckConfig: Array<{
    questionId: string
    checkType: AttentionCheckResult["checkType"]
    expectedValue?: unknown
    relatedQuestionId?: string
    minTimeMs?: number
  }>
): PatternDetectionResult | null {
  const results: AttentionCheckResult[] = []

  for (const config of attentionCheckConfig) {
    const response = responses.find(r => r.questionId === config.questionId)
    if (!response) continue

    let passed = false

    switch (config.checkType) {
      case "INSTRUCTED_RESPONSE":
        passed = response.value === config.expectedValue
        break

      case "CONSISTENCY_CHECK":
        if (config.relatedQuestionId) {
          const relatedResponse = responses.find(r => r.questionId === config.relatedQuestionId)
          if (relatedResponse) {
            passed = response.value === relatedResponse.value
          }
        }
        break

      case "REVERSED_ITEM":
        if (config.relatedQuestionId) {
          const relatedResponse = responses.find(r => r.questionId === config.relatedQuestionId)
          if (relatedResponse && typeof response.value === "number" && typeof relatedResponse.value === "number") {
            const diff = Math.abs(response.value - relatedResponse.value)
            passed = diff >= 3
          }
        }
        break

      case "OPEN_ENDED_TRAP":
        if (typeof response.value === "string") {
          passed = response.value.toLowerCase().includes(String(config.expectedValue).toLowerCase())
        }
        break

      case "TIME_TRAP":
        if (config.minTimeMs) {
          passed = response.timeSpentMs >= config.minTimeMs
        }
        break
    }

    results.push({
      questionId: config.questionId,
      checkType: config.checkType,
      passed,
      expectedValue: config.expectedValue,
      actualValue: response.value
    })
  }

  if (results.length === 0) {
    return null
  }

  const failedChecks = results.filter(r => !r.passed)

  if (failedChecks.length === 0) {
    return null
  }

  const failureRate = failedChecks.length / results.length

  let severity: PatternDetectionResult["severity"] = "LOW"
  let score = 20

  if (failureRate >= 0.75) {
    severity = "CRITICAL"
    score = 50
  } else if (failureRate >= 0.5) {
    severity = "HIGH"
    score = 40
  } else if (failureRate >= 0.25) {
    severity = "MEDIUM"
    score = 30
  }

  return {
    patternType: "ATTENTION_CHECK_FAIL",
    severity,
    confidence: 0.95,
    affectedQuestions: failedChecks.map(c => c.questionId),
    description: `Failed ${failedChecks.length} of ${results.length} attention checks`,
    score
  }
}

export {
  AttentionCheckResultSchema,
  evaluateAttentionChecks
}
export type {
  AttentionCheckResult
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 9.5 IP & NETWORK ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

## 9.5.1 IP Reputation System

```typescript
const IPReputationScoreSchema = z.object({
  ip: z.string().ip(),
  score: z.number().min(0).max(100),

  flags: z.array(z.enum([
    "VPN_DETECTED",
    "PROXY_DETECTED",
    "TOR_EXIT_NODE",
    "DATACENTER_IP",
    "KNOWN_SPAM_SOURCE",
    "HIGH_RISK_COUNTRY",
    "RESIDENTIAL_IP",
    "MOBILE_CARRIER",
    "BUSINESS_IP"
  ])),

  metadata: z.object({
    country: z.string().length(2),
    region: z.string().max(128).nullable(),
    city: z.string().max(128).nullable(),
    asn: z.number().int().nullable(),
    asnOrg: z.string().max(256).nullable(),
    isp: z.string().max(256).nullable()
  }),

  riskFactors: z.array(z.object({
    factor: z.string(),
    weight: z.number().min(0).max(1),
    description: z.string()
  })),

  checkedAt: z.date(),
  cacheExpiresAt: z.date()
})

type IPReputationScore = z.infer<typeof IPReputationScoreSchema>


const IP_RISK_WEIGHTS = {
  VPN_DETECTED: 0.25,
  PROXY_DETECTED: 0.30,
  TOR_EXIT_NODE: 0.40,
  DATACENTER_IP: 0.35,
  KNOWN_SPAM_SOURCE: 0.50,
  HIGH_RISK_COUNTRY: 0.15,
  RESIDENTIAL_IP: -0.10,
  MOBILE_CARRIER: -0.05,
  BUSINESS_IP: 0.00
} as const

const IP_CACHE_TTL_MS = 24 * 60 * 60 * 1000


async function checkIPReputation(ip: string): Promise<IPReputationScore> {
  const cachedResult = await getIPReputationFromCache(ip)
  if (cachedResult && cachedResult.cacheExpiresAt > new Date()) {
    return cachedResult
  }

  const [geoData, asnData, threatData] = await Promise.all([
    fetchGeoIPData(ip),
    fetchASNData(ip),
    fetchThreatIntelData(ip)
  ])

  const flags: IPReputationScore["flags"] = []
  const riskFactors: IPReputationScore["riskFactors"] = []

  if (threatData.isVPN) {
    flags.push("VPN_DETECTED")
    riskFactors.push({
      factor: "VPN_DETECTED",
      weight: IP_RISK_WEIGHTS.VPN_DETECTED,
      description: "IP is associated with a VPN service"
    })
  }

  if (threatData.isProxy) {
    flags.push("PROXY_DETECTED")
    riskFactors.push({
      factor: "PROXY_DETECTED",
      weight: IP_RISK_WEIGHTS.PROXY_DETECTED,
      description: "IP is associated with a proxy service"
    })
  }

  if (threatData.isTor) {
    flags.push("TOR_EXIT_NODE")
    riskFactors.push({
      factor: "TOR_EXIT_NODE",
      weight: IP_RISK_WEIGHTS.TOR_EXIT_NODE,
      description: "IP is a known Tor exit node"
    })
  }

  if (asnData.isDatacenter) {
    flags.push("DATACENTER_IP")
    riskFactors.push({
      factor: "DATACENTER_IP",
      weight: IP_RISK_WEIGHTS.DATACENTER_IP,
      description: "IP belongs to a datacenter/hosting provider"
    })
  }

  if (threatData.isKnownSpamSource) {
    flags.push("KNOWN_SPAM_SOURCE")
    riskFactors.push({
      factor: "KNOWN_SPAM_SOURCE",
      weight: IP_RISK_WEIGHTS.KNOWN_SPAM_SOURCE,
      description: "IP is listed in spam/fraud databases"
    })
  }

  if (asnData.isResidential) {
    flags.push("RESIDENTIAL_IP")
    riskFactors.push({
      factor: "RESIDENTIAL_IP",
      weight: IP_RISK_WEIGHTS.RESIDENTIAL_IP,
      description: "IP is a residential connection (lower risk)"
    })
  }

  if (asnData.isMobileCarrier) {
    flags.push("MOBILE_CARRIER")
    riskFactors.push({
      factor: "MOBILE_CARRIER",
      weight: IP_RISK_WEIGHTS.MOBILE_CARRIER,
      description: "IP belongs to a mobile carrier (lower risk)"
    })
  }

  const totalRisk = riskFactors.reduce((sum, rf) => sum + rf.weight, 0)
  const score = Math.max(0, Math.min(100, Math.round((1 - totalRisk) * 100)))

  const result: IPReputationScore = {
    ip,
    score,
    flags,
    metadata: {
      country: geoData.country,
      region: geoData.region,
      city: geoData.city,
      asn: asnData.asn,
      asnOrg: asnData.org,
      isp: asnData.isp
    },
    riskFactors,
    checkedAt: new Date(),
    cacheExpiresAt: new Date(Date.now() + IP_CACHE_TTL_MS)
  }

  await cacheIPReputation(result)

  return result
}


async function getIPReputationFromCache(ip: string): Promise<IPReputationScore | null> {
  return null
}

async function cacheIPReputation(result: IPReputationScore): Promise<void> {
}

async function fetchGeoIPData(ip: string): Promise<{
  country: string
  region: string | null
  city: string | null
}> {
  return { country: "US", region: null, city: null }
}

async function fetchASNData(ip: string): Promise<{
  asn: number | null
  org: string | null
  isp: string | null
  isDatacenter: boolean
  isResidential: boolean
  isMobileCarrier: boolean
}> {
  return {
    asn: null,
    org: null,
    isp: null,
    isDatacenter: false,
    isResidential: true,
    isMobileCarrier: false
  }
}

async function fetchThreatIntelData(ip: string): Promise<{
  isVPN: boolean
  isProxy: boolean
  isTor: boolean
  isKnownSpamSource: boolean
}> {
  return {
    isVPN: false,
    isProxy: false,
    isTor: false,
    isKnownSpamSource: false
  }
}

export {
  IPReputationScoreSchema,
  IP_RISK_WEIGHTS,
  IP_CACHE_TTL_MS,
  checkIPReputation
}
export type {
  IPReputationScore
}
```


## 9.5.2 Fraud Ring Detection

```typescript
const FraudRingIndicatorSchema = z.object({
  clusterId: z.string().cuid(),

  linkedAccounts: z.array(z.object({
    userId: z.string().cuid(),
    linkType: z.enum([
      "SAME_DEVICE",
      "SAME_IP",
      "SAME_SUBNET",
      "SIMILAR_FINGERPRINT",
      "SIMILAR_RESPONSE_PATTERN",
      "TEMPORAL_CORRELATION"
    ]),
    confidence: z.number().min(0).max(1)
  })),

  sharedAttributes: z.object({
    deviceFingerprints: z.array(z.string()),
    ipAddresses: z.array(z.string().ip()),
    subnets: z.array(z.string()),
    userAgents: z.array(z.string())
  }),

  behavioralSimilarities: z.array(z.object({
    metric: z.string(),
    similarity: z.number().min(0).max(1),
    description: z.string()
  })),

  riskScore: z.number().min(0).max(100),
  detectedAt: z.date()
})

type FraudRingIndicator = z.infer<typeof FraudRingIndicatorSchema>


const FRAUD_RING_THRESHOLDS = {
  MIN_CLUSTER_SIZE: 3,
  FINGERPRINT_SIMILARITY_FOR_LINK: 0.85,
  RESPONSE_PATTERN_SIMILARITY: 0.90,
  TEMPORAL_CORRELATION_WINDOW_MS: 60 * 60 * 1000,
  SAME_SUBNET_MASK: 24
} as const


async function detectFraudRings(
  contentId: string,
  timeWindowMs: number = 7 * 24 * 60 * 60 * 1000
): Promise<FraudRingIndicator[]> {
  const responses = await getRecentResponses(contentId, timeWindowMs)

  if (responses.length < FRAUD_RING_THRESHOLDS.MIN_CLUSTER_SIZE) {
    return []
  }

  const deviceClusters = clusterByDevice(responses)
  const ipClusters = clusterByIPSubnet(responses)
  const patternClusters = clusterByResponsePattern(responses)
  const temporalClusters = clusterByTiming(responses)

  const mergedClusters = mergeClusters([
    deviceClusters,
    ipClusters,
    patternClusters,
    temporalClusters
  ])

  const fraudRings: FraudRingIndicator[] = []

  for (const cluster of mergedClusters) {
    if (cluster.members.length < FRAUD_RING_THRESHOLDS.MIN_CLUSTER_SIZE) {
      continue
    }

    const riskScore = calculateClusterRiskScore(cluster)

    if (riskScore > 50) {
      fraudRings.push({
        clusterId: generateClusterId(),
        linkedAccounts: cluster.members.map(m => ({
          userId: m.userId,
          linkType: m.primaryLinkType,
          confidence: m.confidence
        })),
        sharedAttributes: {
          deviceFingerprints: [...new Set(cluster.members.map(m => m.deviceFingerprint))],
          ipAddresses: [...new Set(cluster.members.map(m => m.ipAddress))],
          subnets: [...new Set(cluster.members.map(m => getSubnet(m.ipAddress)))],
          userAgents: [...new Set(cluster.members.map(m => m.userAgent))]
        },
        behavioralSimilarities: cluster.similarities,
        riskScore,
        detectedAt: new Date()
      })
    }
  }

  return fraudRings
}


function clusterByDevice(
  responses: Array<{
    userId: string
    deviceFingerprint: string
    ipAddress: string
    userAgent: string
    submittedAt: Date
  }>
): Map<string, typeof responses> {
  const clusters = new Map<string, typeof responses>()

  for (const response of responses) {
    const existing = clusters.get(response.deviceFingerprint) ?? []
    existing.push(response)
    clusters.set(response.deviceFingerprint, existing)
  }

  return clusters
}


function clusterByIPSubnet(
  responses: Array<{
    userId: string
    deviceFingerprint: string
    ipAddress: string
    userAgent: string
    submittedAt: Date
  }>
): Map<string, typeof responses> {
  const clusters = new Map<string, typeof responses>()

  for (const response of responses) {
    const subnet = getSubnet(response.ipAddress)
    const existing = clusters.get(subnet) ?? []
    existing.push(response)
    clusters.set(subnet, existing)
  }

  return clusters
}


function clusterByResponsePattern(
  responses: Array<{
    userId: string
    answers: Array<{ questionId: string; value: unknown }>
  }>
): Map<string, typeof responses> {
  return new Map()
}


function clusterByTiming(
  responses: Array<{
    userId: string
    submittedAt: Date
  }>
): Map<string, typeof responses> {
  return new Map()
}


function mergeClusters(
  clusterSets: Array<Map<string, unknown[]>>
): Array<{
  members: Array<{
    userId: string
    deviceFingerprint: string
    ipAddress: string
    userAgent: string
    primaryLinkType: FraudRingIndicator["linkedAccounts"][0]["linkType"]
    confidence: number
  }>
  similarities: FraudRingIndicator["behavioralSimilarities"]
}> {
  return []
}


function calculateClusterRiskScore(cluster: {
  members: unknown[]
  similarities: unknown[]
}): number {
  return 0
}


function generateClusterId(): string {
  return `cluster_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}


function getSubnet(ip: string): string {
  const parts = ip.split(".")
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/${FRAUD_RING_THRESHOLDS.SAME_SUBNET_MASK}`
  }
  return ip
}


async function getRecentResponses(
  contentId: string,
  timeWindowMs: number
): Promise<Array<{
  userId: string
  deviceFingerprint: string
  ipAddress: string
  userAgent: string
  submittedAt: Date
  answers: Array<{ questionId: string; value: unknown }>
}>> {
  return []
}

export {
  FraudRingIndicatorSchema,
  FRAUD_RING_THRESHOLDS,
  detectFraudRings,
  clusterByDevice,
  clusterByIPSubnet
}
export type {
  FraudRingIndicator
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 9.6 FRAUD SCORING & DECISION ENGINE
# ══════════════════════════════════════════════════════════════════════════════

## 9.6.1 Composite Fraud Score

```typescript
const FraudScoreComponentsSchema = z.object({
  behavioral: z.number().min(0).max(100),
  pattern: z.number().min(0).max(100),
  device: z.number().min(0).max(100),
  ip: z.number().min(0).max(100),
  network: z.number().min(0).max(100)
})

const CompositeFraudScoreSchema = z.object({
  responseId: z.string().cuid(),

  totalScore: z.number().min(0).max(100),

  components: FraudScoreComponentsSchema,

  weights: z.object({
    behavioral: z.number().min(0).max(1),
    pattern: z.number().min(0).max(1),
    device: z.number().min(0).max(1),
    ip: z.number().min(0).max(1),
    network: z.number().min(0).max(1)
  }),

  decision: z.enum(["ACCEPT", "REVIEW", "SOFT_REJECT", "HARD_REJECT"]),

  confidence: z.number().min(0).max(1),

  primaryFactors: z.array(z.object({
    factor: z.string(),
    contribution: z.number().min(0).max(100),
    description: z.string()
  })).max(5),

  calculatedAt: z.date()
})

type FraudScoreComponents = z.infer<typeof FraudScoreComponentsSchema>
type CompositeFraudScore = z.infer<typeof CompositeFraudScoreSchema>


const DEFAULT_FRAUD_WEIGHTS = {
  behavioral: 0.25,
  pattern: 0.30,
  device: 0.20,
  ip: 0.15,
  network: 0.10
} as const

const FRAUD_DECISION_THRESHOLDS = {
  ACCEPT: 30,
  REVIEW: 50,
  SOFT_REJECT: 70,
  HARD_REJECT: 85
} as const


function calculateCompositeFraudScore(
  responseId: string,
  components: FraudScoreComponents,
  weights: typeof DEFAULT_FRAUD_WEIGHTS = DEFAULT_FRAUD_WEIGHTS
): CompositeFraudScore {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  const normalizedWeights = {
    behavioral: weights.behavioral / totalWeight,
    pattern: weights.pattern / totalWeight,
    device: weights.device / totalWeight,
    ip: weights.ip / totalWeight,
    network: weights.network / totalWeight
  }

  const totalScore =
    components.behavioral * normalizedWeights.behavioral +
    components.pattern * normalizedWeights.pattern +
    components.device * normalizedWeights.device +
    components.ip * normalizedWeights.ip +
    components.network * normalizedWeights.network

  let decision: CompositeFraudScore["decision"]
  if (totalScore >= FRAUD_DECISION_THRESHOLDS.HARD_REJECT) {
    decision = "HARD_REJECT"
  } else if (totalScore >= FRAUD_DECISION_THRESHOLDS.SOFT_REJECT) {
    decision = "SOFT_REJECT"
  } else if (totalScore >= FRAUD_DECISION_THRESHOLDS.REVIEW) {
    decision = "REVIEW"
  } else {
    decision = "ACCEPT"
  }

  const contributionEntries = [
    { factor: "Behavioral Analysis", contribution: components.behavioral * normalizedWeights.behavioral, description: "Mouse, keyboard, and interaction patterns" },
    { factor: "Response Patterns", contribution: components.pattern * normalizedWeights.pattern, description: "Answer quality and consistency" },
    { factor: "Device Fingerprint", contribution: components.device * normalizedWeights.device, description: "Device and browser characteristics" },
    { factor: "IP Reputation", contribution: components.ip * normalizedWeights.ip, description: "IP address risk assessment" },
    { factor: "Network Analysis", contribution: components.network * normalizedWeights.network, description: "Cross-account correlation" }
  ]

  const primaryFactors = contributionEntries
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5)

  const maxComponent = Math.max(...Object.values(components))
  const minComponent = Math.min(...Object.values(components))
  const variance = maxComponent - minComponent
  const confidence = variance < 30 ? 0.9 : variance < 50 ? 0.75 : 0.6

  return {
    responseId,
    totalScore: Math.round(totalScore),
    components,
    weights: normalizedWeights,
    decision,
    confidence,
    primaryFactors,
    calculatedAt: new Date()
  }
}

export {
  FraudScoreComponentsSchema,
  CompositeFraudScoreSchema,
  DEFAULT_FRAUD_WEIGHTS,
  FRAUD_DECISION_THRESHOLDS,
  calculateCompositeFraudScore
}
export type {
  FraudScoreComponents,
  CompositeFraudScore
}
```


## 9.6.2 Decision Actions

```typescript
const FraudDecisionActionSchema = z.object({
  decision: z.enum(["ACCEPT", "REVIEW", "SOFT_REJECT", "HARD_REJECT"]),

  responseAction: z.enum([
    "INCLUDE_IN_RESULTS",
    "FLAG_FOR_REVIEW",
    "EXCLUDE_FROM_RESULTS",
    "DELETE_RESPONSE"
  ]),

  accountAction: z.enum([
    "NO_ACTION",
    "ADD_WARNING",
    "REDUCE_TRUST_SCORE",
    "TEMPORARY_RESTRICTION",
    "PERMANENT_BAN"
  ]).nullable(),

  notificationAction: z.enum([
    "NO_NOTIFICATION",
    "NOTIFY_CONTENT_CREATOR",
    "NOTIFY_ADMIN",
    "NOTIFY_BOTH"
  ]),

  requiresManualReview: z.boolean(),

  appealable: z.boolean()
})

type FraudDecisionAction = z.infer<typeof FraudDecisionActionSchema>


const DECISION_ACTION_MAP: Record<CompositeFraudScore["decision"], FraudDecisionAction> = {
  ACCEPT: {
    decision: "ACCEPT",
    responseAction: "INCLUDE_IN_RESULTS",
    accountAction: null,
    notificationAction: "NO_NOTIFICATION",
    requiresManualReview: false,
    appealable: false
  },
  REVIEW: {
    decision: "REVIEW",
    responseAction: "FLAG_FOR_REVIEW",
    accountAction: null,
    notificationAction: "NOTIFY_CONTENT_CREATOR",
    requiresManualReview: true,
    appealable: true
  },
  SOFT_REJECT: {
    decision: "SOFT_REJECT",
    responseAction: "EXCLUDE_FROM_RESULTS",
    accountAction: "ADD_WARNING",
    notificationAction: "NOTIFY_BOTH",
    requiresManualReview: true,
    appealable: true
  },
  HARD_REJECT: {
    decision: "HARD_REJECT",
    responseAction: "DELETE_RESPONSE",
    accountAction: "REDUCE_TRUST_SCORE",
    notificationAction: "NOTIFY_ADMIN",
    requiresManualReview: false,
    appealable: true
  }
}


async function executeDecisionActions(
  responseId: string,
  fraudScore: CompositeFraudScore
): Promise<void> {
  const actions = DECISION_ACTION_MAP[fraudScore.decision]

  switch (actions.responseAction) {
    case "INCLUDE_IN_RESULTS":
      await markResponseAsValid(responseId)
      break
    case "FLAG_FOR_REVIEW":
      await flagResponseForReview(responseId, fraudScore)
      break
    case "EXCLUDE_FROM_RESULTS":
      await excludeResponseFromResults(responseId)
      break
    case "DELETE_RESPONSE":
      await softDeleteResponse(responseId)
      break
  }

  if (actions.accountAction) {
    const userId = await getUserIdFromResponse(responseId)
    if (userId) {
      await applyAccountAction(userId, actions.accountAction, fraudScore)
    }
  }

  if (actions.notificationAction !== "NO_NOTIFICATION") {
    await sendFraudNotifications(responseId, fraudScore, actions.notificationAction)
  }

  await logFraudDecision(responseId, fraudScore, actions)
}


async function markResponseAsValid(responseId: string): Promise<void> {
  await db.update(responses)
    .set({ status: "VALIDATED" })
    .where(eq(responses.id, responseId))
}

async function flagResponseForReview(
  responseId: string,
  fraudScore: CompositeFraudScore
): Promise<void> {
  await db.update(responses)
    .set({
      status: "FRAUD_FLAGGED",
      fraudScore: fraudScore.totalScore
    })
    .where(eq(responses.id, responseId))

  await db.insert(fraudReviewQueue)
    .values({
      responseId,
      fraudScore: fraudScore.totalScore,
      primaryFactors: fraudScore.primaryFactors,
      status: "PENDING"
    })
}

async function excludeResponseFromResults(responseId: string): Promise<void> {
  await db.update(responses)
    .set({
      status: "INVALID",
      excludedFromResults: true
    })
    .where(eq(responses.id, responseId))
}

async function softDeleteResponse(responseId: string): Promise<void> {
  await db.update(responses)
    .set({
      status: "INVALID",
      deletedAt: new Date()
    })
    .where(eq(responses.id, responseId))
}

async function getUserIdFromResponse(responseId: string): Promise<string | null> {
  const [response] = await db.select({ userId: responses.userId })
    .from(responses)
    .where(eq(responses.id, responseId))
  return response?.userId ?? null
}

async function applyAccountAction(
  userId: string,
  action: NonNullable<FraudDecisionAction["accountAction"]>,
  fraudScore: CompositeFraudScore
): Promise<void> {
  switch (action) {
    case "ADD_WARNING":
      await db.insert(userWarnings)
        .values({
          userId,
          type: "FRAUD_WARNING",
          reason: `Fraud score: ${fraudScore.totalScore}`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
      break

    case "REDUCE_TRUST_SCORE":
      await db.update(users)
        .set({
          trustScore: sql`${users.trustScore} - 10`
        })
        .where(eq(users.id, userId))
      break

    case "TEMPORARY_RESTRICTION":
      await db.update(users)
        .set({
          restrictedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        .where(eq(users.id, userId))
      break

    case "PERMANENT_BAN":
      await db.update(users)
        .set({
          status: "BANNED",
          bannedAt: new Date(),
          bannedReason: "Automated fraud detection"
        })
        .where(eq(users.id, userId))
      break
  }
}

async function sendFraudNotifications(
  responseId: string,
  fraudScore: CompositeFraudScore,
  notificationType: FraudDecisionAction["notificationAction"]
): Promise<void> {
}

async function logFraudDecision(
  responseId: string,
  fraudScore: CompositeFraudScore,
  actions: FraudDecisionAction
): Promise<void> {
  await db.insert(fraudDecisionLogs)
    .values({
      responseId,
      decision: fraudScore.decision,
      totalScore: fraudScore.totalScore,
      components: fraudScore.components,
      actions: actions,
      decidedAt: new Date()
    })
}

export {
  FraudDecisionActionSchema,
  DECISION_ACTION_MAP,
  executeDecisionActions
}
export type {
  FraudDecisionAction
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 9.7 FRAUD DATA MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 9.7.1 Drizzle Fraud Models

```typescript
// Drizzle schema
model DeviceFingerprint {
  id                    String          @id @default(cuid())
  hash                  String          @unique @db.VarChar(64)

  components            Json
  confidence            Float

  firstSeenAt           DateTime        @default(now())
  lastSeenAt            DateTime        @default(now())

  seenCount             Int             @default(1)

  linkedUserIds         String[]

  riskScore             Int?            @db.SmallInt

  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  @@index([hash])
  @@index([lastSeenAt])
  @@index([riskScore])
}


model IPReputation {
  id                    String          @id @default(cuid())
  ip                    String          @unique @db.VarChar(45)

  score                 Int             @db.SmallInt
  flags                 String[]

  country               String          @db.VarChar(2)
  region                String?         @db.VarChar(128)
  city                  String?         @db.VarChar(128)
  asn                   Int?
  asnOrg                String?         @db.VarChar(256)
  isp                   String?         @db.VarChar(256)

  riskFactors           Json

  checkedAt             DateTime
  expiresAt             DateTime

  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  @@index([ip])
  @@index([expiresAt])
  @@index([score])
}


model BehavioralSignal {
  id                    String          @id @default(cuid())
  responseId            String

  humanScore            Int             @db.SmallInt
  botScore              Int             @db.SmallInt
  confidence            Float

  signals               Json
  flags                 String[]

  rawDataUrl            String?         @db.VarChar(500)

  analyzedAt            DateTime

  createdAt             DateTime        @default(now())

  response              Response        @relation(fields: [responseId], references: [id], onDelete: Cascade)

  @@unique([responseId])
  @@index([responseId])
  @@index([humanScore])
  @@index([botScore])
}


model FraudScore {
  id                    String          @id @default(cuid())
  responseId            String

  totalScore            Int             @db.SmallInt

  behavioralScore       Int             @db.SmallInt
  patternScore          Int             @db.SmallInt
  deviceScore           Int             @db.SmallInt
  ipScore               Int             @db.SmallInt
  networkScore          Int             @db.SmallInt

  decision              FraudDecision
  confidence            Float

  primaryFactors        Json

  calculatedAt          DateTime

  createdAt             DateTime        @default(now())

  response              Response        @relation(fields: [responseId], references: [id], onDelete: Cascade)

  @@unique([responseId])
  @@index([responseId])
  @@index([totalScore])
  @@index([decision])
}


model FraudReviewQueue {
  id                    String          @id @default(cuid())
  responseId            String

  fraudScore            Int             @db.SmallInt
  primaryFactors        Json

  status                ReviewStatus    @default(PENDING)

  reviewedBy            String?
  reviewedAt            DateTime?
  reviewDecision        FraudDecision?
  reviewNotes           String?         @db.Text

  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  response              Response        @relation(fields: [responseId], references: [id], onDelete: Cascade)
  reviewer              User?           @relation(fields: [reviewedBy], references: [id], onDelete: SetNull)

  @@unique([responseId])
  @@index([status])
  @@index([createdAt])
  @@index([reviewedBy])
}


model FraudDecisionLog {
  id                    String          @id @default(cuid())
  responseId            String

  decision              FraudDecision
  totalScore            Int             @db.SmallInt

  components            Json
  actions               Json

  decidedAt             DateTime

  createdAt             DateTime        @default(now())

  @@index([responseId])
  @@index([decision])
  @@index([decidedAt])
}


model FraudRing {
  id                    String          @id @default(cuid())
  clusterId             String          @unique

  contentId             String

  linkedAccountCount    Int
  linkedAccounts        Json
  sharedAttributes      Json
  behavioralSimilarities Json

  riskScore             Int             @db.SmallInt

  status                FraudRingStatus @default(DETECTED)

  investigatedBy        String?
  investigatedAt        DateTime?
  investigationNotes    String?         @db.Text

  detectedAt            DateTime

  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  @@index([contentId])
  @@index([status])
  @@index([riskScore])
  @@index([detectedAt])
}


model UserWarning {
  id                    String          @id @default(cuid())
  userId                String

  type                  WarningType
  reason                String          @db.Text

  isActive              Boolean         @default(true)
  expiresAt             DateTime?

  acknowledgedAt        DateTime?

  createdAt             DateTime        @default(now())

  user                  User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@index([isActive])
  @@index([expiresAt])
}


enum FraudDecision {
  ACCEPT
  REVIEW
  SOFT_REJECT
  HARD_REJECT
}

enum ReviewStatus {
  PENDING
  IN_REVIEW
  APPROVED
  REJECTED
  ESCALATED
}

enum FraudRingStatus {
  DETECTED
  INVESTIGATING
  CONFIRMED
  FALSE_POSITIVE
  RESOLVED
}

enum WarningType {
  FRAUD_WARNING
  SPEED_WARNING
  PATTERN_WARNING
  QUALITY_WARNING
  ABUSE_WARNING
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 9.8 FRAUD DETECTION CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

## 9.8.1 Per-Content Configuration

```typescript
const FraudDetectionConfigSchema = z.object({
  enabled: z.boolean().default(true),

  strictnessLevel: z.enum(["LOW", "MEDIUM", "HIGH", "MAXIMUM"]).default("MEDIUM"),

  enabledChecks: z.object({
    deviceFingerprinting: z.boolean().default(true),
    behavioralAnalysis: z.boolean().default(true),
    ipReputation: z.boolean().default(true),
    patternDetection: z.boolean().default(true),
    networkAnalysis: z.boolean().default(true)
  }),

  thresholds: z.object({
    acceptBelow: z.number().min(0).max(100).default(30),
    reviewBetween: z.tuple([z.number(), z.number()]).default([30, 70]),
    rejectAbove: z.number().min(0).max(100).default(70)
  }),

  weights: z.object({
    behavioral: z.number().min(0).max(1).default(0.25),
    pattern: z.number().min(0).max(1).default(0.30),
    device: z.number().min(0).max(1).default(0.20),
    ip: z.number().min(0).max(1).default(0.15),
    network: z.number().min(0).max(1).default(0.10)
  }),

  specialRules: z.object({
    allowVPN: z.boolean().default(false),
    allowTor: z.boolean().default(false),
    allowDatacenterIPs: z.boolean().default(false),
    maxResponsesPerDevice: z.number().int().min(1).default(1),
    maxResponsesPerIP: z.number().int().min(1).default(5),
    minCompletionTimeSeconds: z.number().int().min(0).default(30)
  }),

  attentionChecks: z.object({
    enabled: z.boolean().default(false),
    count: z.number().int().min(0).max(5).default(0),
    failureThreshold: z.number().min(0).max(1).default(0.5)
  })
})

type FraudDetectionConfig = z.infer<typeof FraudDetectionConfigSchema>


const STRICTNESS_PRESETS: Record<FraudDetectionConfig["strictnessLevel"], Partial<FraudDetectionConfig>> = {
  LOW: {
    thresholds: {
      acceptBelow: 50,
      reviewBetween: [50, 80],
      rejectAbove: 80
    },
    specialRules: {
      allowVPN: true,
      allowTor: false,
      allowDatacenterIPs: true,
      maxResponsesPerDevice: 3,
      maxResponsesPerIP: 10,
      minCompletionTimeSeconds: 15
    }
  },
  MEDIUM: {
    thresholds: {
      acceptBelow: 30,
      reviewBetween: [30, 70],
      rejectAbove: 70
    },
    specialRules: {
      allowVPN: false,
      allowTor: false,
      allowDatacenterIPs: false,
      maxResponsesPerDevice: 1,
      maxResponsesPerIP: 5,
      minCompletionTimeSeconds: 30
    }
  },
  HIGH: {
    thresholds: {
      acceptBelow: 20,
      reviewBetween: [20, 50],
      rejectAbove: 50
    },
    specialRules: {
      allowVPN: false,
      allowTor: false,
      allowDatacenterIPs: false,
      maxResponsesPerDevice: 1,
      maxResponsesPerIP: 3,
      minCompletionTimeSeconds: 60
    },
    attentionChecks: {
      enabled: true,
      count: 2,
      failureThreshold: 0.5
    }
  },
  MAXIMUM: {
    thresholds: {
      acceptBelow: 15,
      reviewBetween: [15, 40],
      rejectAbove: 40
    },
    specialRules: {
      allowVPN: false,
      allowTor: false,
      allowDatacenterIPs: false,
      maxResponsesPerDevice: 1,
      maxResponsesPerIP: 1,
      minCompletionTimeSeconds: 120
    },
    attentionChecks: {
      enabled: true,
      count: 3,
      failureThreshold: 0.33
    }
  }
}

export {
  FraudDetectionConfigSchema,
  STRICTNESS_PRESETS
}
export type {
  FraudDetectionConfig
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 9.9 PERFORMANCE & SCALABILITY
# ══════════════════════════════════════════════════════════════════════════════

## 9.9.1 Performance Optimization Strategies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FRAUD DETECTION PERFORMANCE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SYNCHRONOUS CHECKS                               │   │
│  │                  (Must complete before response)                    │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Target Latency: < 50ms total                                       │   │
│  │                                                                     │   │
│  │  • IP reputation lookup (cached)           ~5ms                     │   │
│  │  • Device fingerprint comparison           ~10ms                    │   │
│  │  • Rate limit check                        ~5ms                     │   │
│  │  • Basic validation                        ~5ms                     │   │
│  │                                                                     │   │
│  │  Optimization: Redis caching, bloom filters, connection pooling    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   ASYNCHRONOUS CHECKS                               │   │
│  │                (Queue for background processing)                    │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Target Processing Time: < 5 seconds per response                   │   │
│  │                                                                     │   │
│  │  • Behavioral signal analysis              ~500ms                   │   │
│  │  • Response pattern detection              ~200ms                   │   │
│  │  • Text quality analysis                   ~100ms                   │   │
│  │  • Cross-response correlation              ~1000ms                  │   │
│  │  • Fraud ring detection                    ~2000ms                  │   │
│  │                                                                     │   │
│  │  Optimization: Worker pools, batch processing, incremental updates │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    BATCH PROCESSING                                 │   │
│  │                 (Scheduled background jobs)                         │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Schedule: Every 15 minutes for active content                      │   │
│  │                                                                     │   │
│  │  • Network analysis for fraud rings                                 │   │
│  │  • IP reputation refresh                                            │   │
│  │  • Device fingerprint clustering                                    │   │
│  │  • Historical pattern analysis                                      │   │
│  │                                                                     │   │
│  │  Optimization: Partitioned processing, incremental updates          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 9.9.2 Caching Strategy

```typescript
const FRAUD_CACHE_CONFIG = {
  IP_REPUTATION: {
    prefix: "fraud:ip:",
    ttlSeconds: 24 * 60 * 60,
    maxSize: 100000
  },

  DEVICE_FINGERPRINT: {
    prefix: "fraud:device:",
    ttlSeconds: 7 * 24 * 60 * 60,
    maxSize: 500000
  },

  RATE_LIMIT: {
    prefix: "fraud:rate:",
    ttlSeconds: 60 * 60,
    maxSize: 1000000
  },

  FRAUD_SCORE: {
    prefix: "fraud:score:",
    ttlSeconds: 30 * 60,
    maxSize: 100000
  },

  BEHAVIORAL_MODEL: {
    prefix: "fraud:model:",
    ttlSeconds: 24 * 60 * 60,
    maxSize: 1000
  }
} as const


const FRAUD_INDEX_DEFINITIONS = {
  DEVICE_FINGERPRINT_HASH: {
    table: "DeviceFingerprint",
    columns: ["hash"],
    type: "BTREE",
    unique: true
  },

  IP_REPUTATION_IP: {
    table: "IPReputation",
    columns: ["ip"],
    type: "BTREE",
    unique: true
  },

  IP_REPUTATION_EXPIRES: {
    table: "IPReputation",
    columns: ["expiresAt"],
    type: "BTREE",
    unique: false
  },

  FRAUD_SCORE_RESPONSE: {
    table: "FraudScore",
    columns: ["responseId"],
    type: "BTREE",
    unique: true
  },

  FRAUD_SCORE_DECISION: {
    table: "FraudScore",
    columns: ["decision", "calculatedAt"],
    type: "BTREE",
    unique: false
  },

  FRAUD_RING_CONTENT: {
    table: "FraudRing",
    columns: ["contentId", "detectedAt"],
    type: "BTREE",
    unique: false
  },

  FRAUD_REVIEW_STATUS: {
    table: "FraudReviewQueue",
    columns: ["status", "createdAt"],
    type: "BTREE",
    unique: false
  }
} as const

export {
  FRAUD_CACHE_CONFIG,
  FRAUD_INDEX_DEFINITIONS
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 9.10 DEVICE FINGERPRINTING - PRIVACY & COLLISION HANDLING
# ══════════════════════════════════════════════════════════════════════════════

## 9.10.1 GDPR/KVKK Privacy Compliance

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT PRIVACY COMPLIANCE
// [REFERENCE] GDPR Article 6 (Legitimate Interest), KVKK Madde 5
// ══════════════════════════════════════════════════════════════════════════════

const FINGERPRINT_PRIVACY_CONFIG = {
  // Legal basis: Legitimate interest for fraud prevention
  LEGAL_BASIS: "LEGITIMATE_INTEREST" as const,

  // Retention periods (GDPR requirement)
  RETENTION: {
    ACTIVE_FINGERPRINT_DAYS: 90,        // Keep active fingerprints for 90 days
    ANONYMIZED_STATS_DAYS: 365,         // Aggregated stats for 1 year
    FRAUD_EVIDENCE_DAYS: 730,           // Fraud cases: 2 years for legal proceedings
    DELETE_ON_ACCOUNT_DELETION: true    // GDPR Right to Erasure
  },

  // Data minimization
  MINIMIZATION: {
    HASH_ONLY_STORAGE: true,            // Store hash, not raw components
    NO_PERSISTENT_IDENTIFIERS: true,    // Don't store IPs in fingerprint
    COMPONENT_TRUNCATION: {
      userAgent: 128,                   // Truncate to reduce uniqueness
      fonts: 50,                        // Max 50 fonts stored
      plugins: 20                       // Max 20 plugins stored
    }
  },

  // User rights
  USER_RIGHTS: {
    VIEW_OWN_FINGERPRINT: true,         // User can see their fingerprint hash
    REQUEST_DELETION: true,             // User can request deletion
    OPT_OUT_AVAILABLE: false,           // Cannot opt out (fraud prevention)
    EXPLANATION_REQUIRED: true          // Must explain why we collect
  },

  // Consent not required for fraud prevention under legitimate interest,
  // but transparency is required
  TRANSPARENCY: {
    PRIVACY_POLICY_SECTION: "device-fingerprinting",
    COOKIE_BANNER_MENTION: true,
    FIRST_LOGIN_NOTICE: true
  }
} as const


// Privacy-compliant fingerprint storage
interface StoredFingerprint {
  id: string
  userId: string
  fingerprintHash: string           // Only hash stored, not components
  confidence: number
  firstSeenAt: Date
  lastSeenAt: Date
  usageCount: number
  isTrusted: boolean                // Marked as trusted by user
  metadata: {
    approximateLocation?: string    // Country-level only
    deviceCategory: "MOBILE" | "DESKTOP" | "TABLET"
    browserFamily: string           // Chrome, Firefox, Safari (no version)
  }
}


// Auto-cleanup job for GDPR compliance
async function cleanupExpiredFingerprints(): Promise<void> {
  const now = new Date()

  // Delete fingerprints older than retention period
  const retentionCutoff = new Date(
    now.getTime() - FINGERPRINT_PRIVACY_CONFIG.RETENTION.ACTIVE_FINGERPRINT_DAYS * 24 * 60 * 60 * 1000
  )

  await db.delete(deviceFingerprints)
    .where(and(
      lt(deviceFingerprints.lastSeenAt, retentionCutoff),
      // Keep fraud evidence longer
      eq(deviceFingerprints.flaggedForFraud, false)
    ))

  // Anonymize old fraud evidence (keep for legal, but remove user link)
  const fraudRetentionCutoff = new Date(
    now.getTime() - FINGERPRINT_PRIVACY_CONFIG.RETENTION.FRAUD_EVIDENCE_DAYS * 24 * 60 * 60 * 1000
  )

  await db.update(deviceFingerprints)
    .set({
      userId: null,   // Anonymize
      metadata: {}    // Remove metadata
    })
    .where(and(
      lt(deviceFingerprints.lastSeenAt, fraudRetentionCutoff),
      eq(deviceFingerprints.flaggedForFraud, true)
    ))
}


// GDPR Right to Erasure implementation
async function deleteUserFingerprints(userId: string): Promise<void> {
  // Delete all fingerprints associated with user
  await db.delete(deviceFingerprints)
    .where(eq(deviceFingerprints.userId, userId))

  // Log deletion for audit trail (GDPR requirement)
  await db.insert(auditLogs)
    .values({
      action: "FINGERPRINT_ERASURE",
      entityType: "DeviceFingerprint",
      performedBy: userId,
      reason: "USER_REQUEST_GDPR",
      timestamp: new Date()
    })
}

export { FINGERPRINT_PRIVACY_CONFIG, cleanupExpiredFingerprints, deleteUserFingerprints }
```


## 9.10.2 Collision Handling for Shared Devices

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT COLLISION HANDLING
// Handles cases where multiple users share the same device
// ══════════════════════════════════════════════════════════════════════════════

const COLLISION_CONFIG = {
  // Thresholds
  MAX_USERS_PER_FINGERPRINT: 5,         // Max users sharing same fingerprint
  SUSPICIOUS_USER_COUNT: 3,              // Flag if 3+ users on same device
  FAMILY_ACCOUNT_LIMIT: 4,               // Allowed for family devices

  // Time windows
  CONCURRENT_SESSION_WINDOW_MS: 300000,  // 5 minutes
  SWITCH_COOLDOWN_MS: 60000,             // 1 minute between user switches

  // Actions
  BLOCK_ON_EXCESSIVE_SHARING: true,
  REQUIRE_VERIFICATION_ON_NEW_USER: true
} as const


interface FingerprintCollisionResult {
  isCollision: boolean
  existingUsers: string[]
  collisionType: "NONE" | "FAMILY" | "SUSPICIOUS" | "FRAUD_LIKELY"
  recommendation: "ALLOW" | "VERIFY" | "BLOCK" | "FLAG_FOR_REVIEW"
  evidence: {
    userCount: number
    concurrentSessions: boolean
    rapidSwitching: boolean
    sameContent: boolean
  }
}


async function handleFingerprintCollision(
  fingerprintHash: string,
  newUserId: string,
  contentId?: string
): Promise<FingerprintCollisionResult> {
  // Find all users with this fingerprint
  const existingFingerprints = await db.select()
    .from(deviceFingerprints)
    .leftJoin(users, eq(deviceFingerprints.userId, users.id))
    .where(and(
      eq(deviceFingerprints.fingerprintHash, fingerprintHash),
      ne(deviceFingerprints.userId, newUserId)
    ))
    .orderBy(desc(deviceFingerprints.lastSeenAt))

  const existingUsers = existingFingerprints.map(f => f.userId).filter(Boolean) as string[]
  const userCount = existingUsers.length + 1 // +1 for new user

  if (userCount === 1) {
    return {
      isCollision: false,
      existingUsers: [],
      collisionType: "NONE",
      recommendation: "ALLOW",
      evidence: {
        userCount: 1,
        concurrentSessions: false,
        rapidSwitching: false,
        sameContent: false
      }
    }
  }

  // Check for concurrent sessions (multiple users active within 5 minutes)
  const recentCutoff = new Date(Date.now() - COLLISION_CONFIG.CONCURRENT_SESSION_WINDOW_MS)
  const concurrentSessions = existingFingerprints.some(f => f.lastSeenAt > recentCutoff)

  // Check for rapid user switching
  const rapidSwitching = existingFingerprints.some(f =>
    Date.now() - f.lastSeenAt.getTime() < COLLISION_CONFIG.SWITCH_COOLDOWN_MS
  )

  // Check if users voted on same content (fraud indicator)
  let sameContent = false
  if (contentId) {
    const [{ count: votesOnSameContent }] = await db.select({ count: sql<number>`count(*)` })
      .from(participations)
      .where(and(
        eq(participations.contentId, contentId),
        inArray(participations.userId, existingUsers)
      ))
    sameContent = votesOnSameContent > 0
  }

  // Determine collision type and recommendation
  let collisionType: FingerprintCollisionResult["collisionType"]
  let recommendation: FingerprintCollisionResult["recommendation"]

  if (sameContent && concurrentSessions) {
    // Multiple users on same device voting on same content = fraud
    collisionType = "FRAUD_LIKELY"
    recommendation = "BLOCK"
  } else if (userCount > COLLISION_CONFIG.MAX_USERS_PER_FINGERPRINT) {
    // Too many users = suspicious
    collisionType = "SUSPICIOUS"
    recommendation = "FLAG_FOR_REVIEW"
  } else if (userCount >= COLLISION_CONFIG.SUSPICIOUS_USER_COUNT) {
    // Multiple users but within limit = verify
    collisionType = "SUSPICIOUS"
    recommendation = "VERIFY"
  } else {
    // 2 users, no red flags = likely family/shared device
    collisionType = "FAMILY"
    recommendation = "ALLOW"
  }

  return {
    isCollision: true,
    existingUsers,
    collisionType,
    recommendation,
    evidence: {
      userCount,
      concurrentSessions,
      rapidSwitching,
      sameContent
    }
  }
}


// Handle legitimate shared device scenarios
async function markAsTrustedSharedDevice(
  fingerprintHash: string,
  userId: string,
  verificationMethod: "SMS" | "EMAIL" | "ADMIN"
): Promise<void> {
  await db.update(deviceFingerprints)
    .set({
      isTrusted: true,
      trustedAt: new Date(),
      trustedVia: verificationMethod
    })
    .where(and(
      eq(deviceFingerprints.fingerprintHash, fingerprintHash),
      eq(deviceFingerprints.userId, userId)
    ))

  // Don't flag this fingerprint for collision in future
  await db.insert(trustedSharedDevices)
    .values({
      fingerprintHash,
      verifiedUserIds: [userId],
      maxUsers: COLLISION_CONFIG.FAMILY_ACCOUNT_LIMIT,
      reason: "VERIFIED_SHARED_DEVICE",
      createdAt: new Date()
    })
}

export {
  COLLISION_CONFIG,
  handleFingerprintCollision,
  markAsTrustedSharedDevice
}
export type { FingerprintCollisionResult }
```


## 9.10.3 Browser Update Handling

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT STABILITY ACROSS BROWSER UPDATES
// Handles fingerprint drift when browsers update
// ══════════════════════════════════════════════════════════════════════════════

const STABILITY_CONFIG = {
  // Similarity threshold for "same device, different version"
  BROWSER_UPDATE_SIMILARITY: 0.75,

  // Components that change frequently (lower weight for matching)
  VOLATILE_COMPONENTS: ["userAgent", "plugins", "webglRenderer"] as const,

  // Components that rarely change (higher weight for matching)
  STABLE_COMPONENTS: ["canvas", "screen", "timezone", "fonts", "audioContext"] as const,

  // Max fingerprint versions to track per user
  MAX_VERSIONS_PER_USER: 5,

  // Time window for considering fingerprints as "same device evolving"
  EVOLUTION_WINDOW_DAYS: 30
} as const


interface FingerprintEvolution {
  currentHash: string
  previousHashes: string[]
  stableComponents: Record<string, string>
  volatileChanges: {
    component: string
    oldValue: string
    newValue: string
    changedAt: Date
  }[]
  evolutionScore: number // 0-1, how much has device "evolved"
}


async function trackFingerprintEvolution(
  userId: string,
  newFingerprint: FingerprintResult
): Promise<{
  isKnownDevice: boolean
  evolution?: FingerprintEvolution
  linkedHashes: string[]
}> {
  // Get user's recent fingerprints
  const recentFingerprints = await db.select()
    .from(deviceFingerprints)
    .where(and(
      eq(deviceFingerprints.userId, userId),
      gte(deviceFingerprints.createdAt, new Date(Date.now() - STABILITY_CONFIG.EVOLUTION_WINDOW_DAYS * 24 * 60 * 60 * 1000))
    ))
    .orderBy(desc(deviceFingerprints.createdAt))
    .limit(STABILITY_CONFIG.MAX_VERSIONS_PER_USER)

  if (recentFingerprints.length === 0) {
    return { isKnownDevice: false, linkedHashes: [] }
  }

  // Compare with each previous fingerprint
  for (const existing of recentFingerprints) {
    const comparison = compareFingerprints(
      newFingerprint.components,
      existing.components as DeviceFingerprintComponents
    )

    // Check stable component similarity
    const stableSimilarity = calculateStableComponentSimilarity(
      newFingerprint.components,
      existing.components as DeviceFingerprintComponents
    )

    if (stableSimilarity >= STABILITY_CONFIG.BROWSER_UPDATE_SIMILARITY) {
      // Same device, just updated
      const evolution: FingerprintEvolution = {
        currentHash: newFingerprint.hash,
        previousHashes: recentFingerprints.map(f => f.fingerprintHash),
        stableComponents: extractStableComponents(newFingerprint.components),
        volatileChanges: detectVolatileChanges(
          existing.components as DeviceFingerprintComponents,
          newFingerprint.components
        ),
        evolutionScore: 1 - stableSimilarity
      }

      // Link new fingerprint to user's device chain
      await db.insert(fingerprintChains)
        .values({
          userId,
          currentHash: newFingerprint.hash,
          previousHash: existing.fingerprintHash,
          similarity: stableSimilarity,
          linkedAt: new Date()
        })

      return {
        isKnownDevice: true,
        evolution,
        linkedHashes: [existing.fingerprintHash, ...recentFingerprints.slice(1).map(f => f.fingerprintHash)]
      }
    }
  }

  return { isKnownDevice: false, linkedHashes: [] }
}


function calculateStableComponentSimilarity(
  fp1: DeviceFingerprintComponents,
  fp2: DeviceFingerprintComponents
): number {
  let matchScore = 0
  let totalWeight = 0

  for (const component of STABILITY_CONFIG.STABLE_COMPONENTS) {
    const weight = FINGERPRINT_WEIGHTS[component as keyof typeof FINGERPRINT_WEIGHTS] ?? 0.1
    totalWeight += weight

    switch (component) {
      case "canvas":
        if (fp1.canvas === fp2.canvas) matchScore += weight
        break
      case "screen":
        if (fp1.screen.width === fp2.screen.width &&
            fp1.screen.height === fp2.screen.height) {
          matchScore += weight
        }
        break
      case "timezone":
        if (fp1.timezone === fp2.timezone) matchScore += weight
        break
      case "fonts":
        const fontOverlap = fp1.fonts.filter(f => fp2.fonts.includes(f)).length
        const fontSimilarity = fontOverlap / Math.max(fp1.fonts.length, fp2.fonts.length, 1)
        matchScore += weight * fontSimilarity
        break
      case "audioContext":
        if (fp1.audioContext === fp2.audioContext) matchScore += weight
        break
    }
  }

  return totalWeight > 0 ? matchScore / totalWeight : 0
}


function extractStableComponents(fp: DeviceFingerprintComponents): Record<string, string> {
  return {
    canvas: fp.canvas,
    screen: `${fp.screen.width}x${fp.screen.height}`,
    timezone: fp.timezone,
    audioContext: fp.audioContext
  }
}


function detectVolatileChanges(
  oldFp: DeviceFingerprintComponents,
  newFp: DeviceFingerprintComponents
): FingerprintEvolution["volatileChanges"] {
  const changes: FingerprintEvolution["volatileChanges"] = []

  for (const component of STABILITY_CONFIG.VOLATILE_COMPONENTS) {
    const oldValue = oldFp[component as keyof DeviceFingerprintComponents]
    const newValue = newFp[component as keyof DeviceFingerprintComponents]

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        component,
        oldValue: String(oldValue),
        newValue: String(newValue),
        changedAt: new Date()
      })
    }
  }

  return changes
}

export {
  STABILITY_CONFIG,
  trackFingerprintEvolution,
  calculateStableComponentSimilarity
}
export type { FingerprintEvolution }
```



# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 09
# ══════════════════════════════════════════════════════════════════════════════
# Status: COMPLETE
# Last Updated: January 2026
# Dependencies: SECTION 07 (Responses), SECTION 13 (Database)
#
# Device Fingerprinting Summary:
# - 9.2: Core fingerprint collection & generation
# - 9.2.3: Fingerprint storage & comparison
# - 9.10: Privacy compliance (GDPR/KVKK)
# - 9.10.2: Collision handling for shared devices
# - 9.10.3: Browser update stability
# ══════════════════════════════════════════════════════════════════════════════
