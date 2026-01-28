# ═══════════════════════════════════════════════════════════════════════════════
# DATA - Fraud Detection System
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-009.md
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# FRAUD DETECTION ARCHITECTURE
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FRAUD DETECTION ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Layer 1: REGISTRATION GATE                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  - Email verification                                               │   │
│  │  - Phone verification (SMS OTP)                                     │   │
│  │  - CAPTCHA/reCAPTCHA                                                │   │
│  │  - IP reputation check                                              │   │
│  │  - Device fingerprinting                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Layer 2: SESSION MONITORING                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  - Behavioral analysis (mouse, keyboard, scroll)                    │   │
│  │  - Timing patterns                                                  │   │
│  │  - Tab visibility tracking                                          │   │
│  │  - Focus/blur detection                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Layer 3: RESPONSE ANALYSIS                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  - Pattern detection (straight-lining, speeding)                    │   │
│  │  - Attention check validation                                       │   │
│  │  - Text quality analysis                                            │   │
│  │  - Consistency verification                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Layer 4: NETWORK ANALYSIS                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  - IP clustering detection                                          │   │
│  │  - VPN/Proxy detection                                              │   │
│  │  - Geographic anomalies                                             │   │
│  │  - Cross-survey pattern matching                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# THREE SCORING SYSTEMS
# ═══════════════════════════════════════════════════════════════════════════════

VOXPOLL uses three distinct scoring systems:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THREE SCORING SYSTEMS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │  FRAUD SCORE    │    │  QUALITY SCORE  │    │ RELIABILITY     │        │
│  │  (0-100)        │    │  (0-100)        │    │ SCORE (0-100)   │        │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤        │
│  │ Per-response    │    │ Per-response    │    │ Per-content     │        │
│  │ detection of    │    │ measure of      │    │ aggregate       │        │
│  │ fraudulent      │    │ engagement      │    │ measure of      │        │
│  │ behavior        │    │ quality         │    │ data quality    │        │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤        │
│  │ HIGH = BAD      │    │ HIGH = GOOD     │    │ HIGH = GOOD     │        │
│  │ (more fraud)    │    │ (more quality)  │    │ (more reliable) │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## Score Usage Matrix

| Scenario | Fraud Score | Quality Score | Reliability Score |
|----------|-------------|---------------|-------------------|
| Accept/Reject response | Primary | Secondary | N/A |
| Weight response in aggregates | N/A | Primary | N/A |
| Display to content viewers | N/A | N/A | Primary |
| Flag for manual review | Primary | Secondary | N/A |
| User trust calculation | Primary | Secondary | N/A |
| Content ranking | N/A | N/A | Primary |



# ═══════════════════════════════════════════════════════════════════════════════
# DEVICE FINGERPRINTING
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DEVICE FINGERPRINT COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const DeviceFingerprintComponentsSchema = z.object({
  canvas: z.string().max(64).nullable(),
  webgl: z.string().max(64).nullable(),
  audioContext: z.string().max(64).nullable(),
  fonts: z.string().max(256).nullable(),
  plugins: z.string().max(512).nullable(),
  timezone: z.string().max(64),
  language: z.string().max(32),
  platform: z.string().max(64),
  screenResolution: z.string().max(32),
  colorDepth: z.number().int(),
  hardwareConcurrency: z.number().int().nullable(),
  deviceMemory: z.number().nullable(),
  touchSupport: z.boolean(),
  cookiesEnabled: z.boolean(),
  doNotTrack: z.boolean().nullable(),
  userAgent: z.string().max(512)
})

const DeviceFingerprintSchema = z.object({
  id: z.string().max(64),
  components: DeviceFingerprintComponentsSchema,
  confidence: z.number().min(0).max(1),
  firstSeenAt: z.date(),
  lastSeenAt: z.date(),
  associatedUserIds: z.array(z.string().cuid())
})

type DeviceFingerprintComponents = z.infer<typeof DeviceFingerprintComponentsSchema>
type DeviceFingerprint = z.infer<typeof DeviceFingerprintSchema>
```


## Fingerprint Generation

```typescript
async function generateFingerprint(
  components: DeviceFingerprintComponents
): Promise<string> {
  const stableComponents = {
    canvas: components.canvas,
    webgl: components.webgl,
    audioContext: components.audioContext,
    fonts: components.fonts,
    plugins: components.plugins,
    timezone: components.timezone,
    platform: components.platform,
    colorDepth: components.colorDepth,
    hardwareConcurrency: components.hardwareConcurrency,
    deviceMemory: components.deviceMemory,
    touchSupport: components.touchSupport
  }

  const componentString = JSON.stringify(stableComponents, Object.keys(stableComponents).sort())
  const hash = await hashSha256(componentString)

  return hash.substring(0, 32)
}
```


## Fingerprint Comparison

```typescript
function compareFingerprints(
  fp1: DeviceFingerprintComponents,
  fp2: DeviceFingerprintComponents
): number {
  let matchCount = 0
  let totalComponents = 0

  const components: (keyof DeviceFingerprintComponents)[] = [
    "canvas", "webgl", "audioContext", "fonts", "plugins",
    "timezone", "platform", "colorDepth", "hardwareConcurrency",
    "deviceMemory", "touchSupport"
  ]

  for (const component of components) {
    if (fp1[component] !== null && fp2[component] !== null) {
      totalComponents++
      if (fp1[component] === fp2[component]) {
        matchCount++
      }
    }
  }

  return totalComponents > 0 ? matchCount / totalComponents : 0
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# BEHAVIORAL ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════

## Behavioral Signal Collection

```typescript
const MouseEventSchema = z.object({
  x: z.number(),
  y: z.number(),
  timestamp: z.number(),
  type: z.enum(["move", "click", "scroll"])
})

const KeystrokeEventSchema = z.object({
  key: z.string().max(32),
  timestamp: z.number(),
  duration: z.number()
})

const TouchEventSchema = z.object({
  x: z.number(),
  y: z.number(),
  timestamp: z.number(),
  pressure: z.number().optional(),
  type: z.enum(["start", "move", "end"])
})

const BehavioralSignalsSchema = z.object({
  sessionId: z.string().cuid(),
  mouseEvents: z.array(MouseEventSchema).max(1000),
  keystrokeEvents: z.array(KeystrokeEventSchema).max(500),
  touchEvents: z.array(TouchEventSchema).max(500),
  scrollEvents: z.array(z.object({
    scrollTop: z.number(),
    scrollHeight: z.number(),
    timestamp: z.number()
  })).max(200),
  focusEvents: z.array(z.object({
    hasFocus: z.boolean(),
    timestamp: z.number()
  })).max(100),
  collectionStartedAt: z.number(),
  collectionEndedAt: z.number()
})

type MouseEvent = z.infer<typeof MouseEventSchema>
type KeystrokeEvent = z.infer<typeof KeystrokeEventSchema>
type TouchEvent = z.infer<typeof TouchEventSchema>
type BehavioralSignals = z.infer<typeof BehavioralSignalsSchema>
```


## Behavioral Analysis Thresholds

```typescript
const BEHAVIORAL_THRESHOLDS = {
  MIN_MOUSE_EVENTS: 10,
  MIN_KEYSTROKE_EVENTS: 5,
  MIN_SESSION_DURATION_MS: 10000,
  MAX_LINEAR_MOUSE_RATIO: 0.8,
  MIN_MOUSE_VELOCITY_VARIANCE: 100,
  MIN_KEYSTROKE_VARIANCE_MS: 20,
  MAX_CONSTANT_TIMING_RATIO: 0.6,
  MIN_SCROLL_STOPS: 2,
  MAX_SCROLL_SPEED: 5000
} as const
```


## Behavioral Analysis Engine

```typescript
const BehavioralScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  components: z.object({
    mouseScore: z.number().min(0).max(100),
    keystrokeScore: z.number().min(0).max(100),
    scrollScore: z.number().min(0).max(100),
    timingScore: z.number().min(0).max(100),
    interactionScore: z.number().min(0).max(100)
  }),
  flags: z.array(z.enum([
    "NO_MOUSE_MOVEMENT",
    "LINEAR_MOUSE_MOVEMENT",
    "CONSTANT_KEYSTROKE_TIMING",
    "PROGRAMMATIC_TIMING",
    "SUSPICIOUS_SCROLL_PATTERN",
    "NO_FOCUS_CHANGES",
    "INHUMAN_SPEED"
  ])),
  isBot: z.boolean(),
  confidence: z.number().min(0).max(1),
  analyzedAt: z.date()
})

type BehavioralScore = z.infer<typeof BehavioralScoreSchema>


function analyzeBehavioralSignals(signals: BehavioralSignals): BehavioralScore {
  const flags: BehavioralScore["flags"] = []

  const mouseScore = analyzeMouseBehavior(signals.mouseEvents, flags)
  const keystrokeScore = analyzeKeystrokeDynamics(signals.keystrokeEvents, flags)
  const scrollScore = analyzeScrollBehavior(signals.scrollEvents, flags)
  const timingScore = analyzeTimingPatterns(signals, flags)
  const interactionScore = analyzeInteractionConsistency(signals, flags)

  const overall = Math.round(
    mouseScore * 0.25 +
    keystrokeScore * 0.25 +
    scrollScore * 0.15 +
    timingScore * 0.20 +
    interactionScore * 0.15
  )

  const isBot = flags.length >= 3 || overall < 40

  return {
    overall,
    components: {
      mouseScore,
      keystrokeScore,
      scrollScore,
      timingScore,
      interactionScore
    },
    flags,
    isBot,
    confidence: flags.length === 0 ? 0.9 : Math.max(0.5, 0.9 - flags.length * 0.1),
    analyzedAt: new Date()
  }
}
```


## Mouse Behavior Analysis

```typescript
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
```


## Keystroke Dynamics Analysis

```typescript
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
```



# ═══════════════════════════════════════════════════════════════════════════════
# IP & NETWORK ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════

## IP Reputation System

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
```


## IP Risk Weights

```typescript
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
```


## IP Reputation Check

```typescript
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
```



# ═══════════════════════════════════════════════════════════════════════════════
# FRAUD DETECTION ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// FRAUD DETECTION ENGINE
// ══════════════════════════════════════════════════════════════════════════════

const FraudIndicatorSchema = z.object({
  type: z.enum([
    "COMPLETION_TOO_FAST",
    "COMPLETION_TOO_SLOW",
    "STRAIGHT_LINING",
    "RANDOM_PATTERN",
    "DUPLICATE_FINGERPRINT",
    "SUSPICIOUS_IP",
    "BOT_LIKE_BEHAVIOR",
    "INCONSISTENT_ANSWERS",
    "GIBBERISH_TEXT"
  ]),
  score: z.number().min(0).max(100),
  details: z.string()
})

const FraudAnalysisResultSchema = z.object({
  totalScore: z.number().min(0).max(100),
  isFlagged: z.boolean(),
  indicators: z.array(FraudIndicatorSchema),
  recommendation: z.enum(["ACCEPT", "REVIEW", "REJECT"])
})

type FraudIndicator = z.infer<typeof FraudIndicatorSchema>
type FraudAnalysisResult = z.infer<typeof FraudAnalysisResultSchema>


const FRAUD_THRESHOLDS = {
  FLAG_THRESHOLD: 50,
  REJECT_THRESHOLD: 80,
  MIN_COMPLETION_TIME_MS: 30 * 1000,
  MAX_COMPLETION_TIME_MS: 4 * 60 * 60 * 1000,
  STRAIGHT_LINE_THRESHOLD: 0.8,
  MIN_TEXT_LENGTH_FOR_ANALYSIS: 20
} as const


async function analyzeFraudIndicators(
  response: {
    id: string
    surveyId: string
    startedAt: Date
    answers: Array<{
      questionId: string
      value: unknown
      timeSpentMs: number
    }>
    deviceFingerprint: string
    metadata: Record<string, unknown>
  }
): Promise<FraudAnalysisResult> {
  const indicators: FraudIndicator[] = []

  const completionTimeIndicator = analyzeCompletionTime(response)
  if (completionTimeIndicator) {
    indicators.push(completionTimeIndicator)
  }

  const straightLiningIndicator = analyzeStraightLining(response.answers)
  if (straightLiningIndicator) {
    indicators.push(straightLiningIndicator)
  }

  const textQualityIndicators = analyzeTextQuality(response.answers)
  indicators.push(...textQualityIndicators)

  const duplicateIndicator = await analyzeDuplicatePatterns(
    response.surveyId,
    response.deviceFingerprint
  )
  if (duplicateIndicator) {
    indicators.push(duplicateIndicator)
  }

  const totalScore = Math.min(
    100,
    indicators.reduce((sum, ind) => sum + ind.score, 0)
  )

  let recommendation: "ACCEPT" | "REVIEW" | "REJECT"
  if (totalScore >= FRAUD_THRESHOLDS.REJECT_THRESHOLD) {
    recommendation = "REJECT"
  } else if (totalScore >= FRAUD_THRESHOLDS.FLAG_THRESHOLD) {
    recommendation = "REVIEW"
  } else {
    recommendation = "ACCEPT"
  }

  return {
    totalScore,
    isFlagged: totalScore >= FRAUD_THRESHOLDS.FLAG_THRESHOLD,
    indicators,
    recommendation
  }
}
```


## Completion Time Analysis

```typescript
function analyzeCompletionTime(
  response: {
    startedAt: Date
    answers: Array<{ timeSpentMs: number }>
  }
): FraudIndicator | null {
  const totalTimeMs = response.answers.reduce(
    (sum, a) => sum + a.timeSpentMs,
    0
  )

  if (totalTimeMs < FRAUD_THRESHOLDS.MIN_COMPLETION_TIME_MS) {
    return {
      type: "COMPLETION_TOO_FAST",
      score: 40,
      details: `Completed in ${Math.round(totalTimeMs / 1000)} seconds, minimum expected is ${FRAUD_THRESHOLDS.MIN_COMPLETION_TIME_MS / 1000} seconds`
    }
  }

  if (totalTimeMs > FRAUD_THRESHOLDS.MAX_COMPLETION_TIME_MS) {
    return {
      type: "COMPLETION_TOO_SLOW",
      score: 10,
      details: `Completion time of ${Math.round(totalTimeMs / 3600000)} hours exceeds expected maximum`
    }
  }

  return null
}
```


## Straight-Lining Analysis

```typescript
function analyzeStraightLining(
  answers: Array<{ questionId: string; value: unknown }>
): FraudIndicator | null {
  const scaleAnswers = answers.filter(
    a => typeof a.value === "number" || typeof a.value === "string"
  )

  if (scaleAnswers.length < 5) {
    return null
  }

  const valueGroups = new Map<string, number>()
  for (const answer of scaleAnswers) {
    const key = String(answer.value)
    valueGroups.set(key, (valueGroups.get(key) ?? 0) + 1)
  }

  const maxSameValue = Math.max(...valueGroups.values())
  const straightLineRatio = maxSameValue / scaleAnswers.length

  if (straightLineRatio >= FRAUD_THRESHOLDS.STRAIGHT_LINE_THRESHOLD) {
    return {
      type: "STRAIGHT_LINING",
      score: 35,
      details: `${Math.round(straightLineRatio * 100)}% of scale questions have the same answer`
    }
  }

  return null
}
```


## Duplicate Pattern Analysis

```typescript
async function analyzeDuplicatePatterns(
  surveyId: string,
  deviceFingerprint: string
): Promise<FraudIndicator | null> {
  const previousResponses = await findResponsesByFingerprint(
    surveyId,
    deviceFingerprint
  )

  if (previousResponses.length > 0) {
    return {
      type: "DUPLICATE_FINGERPRINT",
      score: 50,
      details: `Device fingerprint has ${previousResponses.length} previous response(s) to this survey`
    }
  }

  return null
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
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
  isLinear,
  calculateVariance
}
```
