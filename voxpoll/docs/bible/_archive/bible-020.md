# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 20                                    █
# █              ENTERPRISE RESEARCH FRAMEWORK & DATA VALIDITY                 █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████

[AUTHORITY] This document establishes the unified data quality, statistical validity,
and enterprise research standards for ALL content types (Poll, Survey, Test).

[REFERENCE] Integrates with:
- BIBLE-006: Content Type Definitions
- BIBLE-013: Database Schema
- BIBLE-014: API Contracts
- BIBLE-015: Business Rules
- BIBLE-019: Survey Methodologies & Algorithms




# ══════════════════════════════════════════════════════════════════════════════
# 20.1 ENTERPRISE RESEARCH PHILOSOPHY
# ══════════════════════════════════════════════════════════════════════════════

## 20.1.1 Core Principles

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    VOXPOLL ENTERPRISE RESEARCH PRINCIPLES                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. DATA INTEGRITY FIRST                                                        │
│     Every response must pass quality validation before inclusion in results     │
│                                                                                 │
│  2. STATISTICAL RIGOR                                                           │
│     All results include confidence intervals, significance levels, and          │
│     sample size warnings when applicable                                        │
│                                                                                 │
│  3. TRANSPARENCY                                                                │
│     Reliability scores, methodology details, and limitations are always         │
│     visible to data consumers                                                   │
│                                                                                 │
│  4. CONSISTENCY                                                                 │
│     Same quality standards apply proportionally across all content types        │
│                                                                                 │
│  5. ACTIONABLE INSIGHTS                                                         │
│     Results are presented with context that enables decision-making             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 20.1.2 Content Type Research Tiers

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH TIER CLASSIFICATION
// Determines quality requirements and statistical features per content type
// ═══════════════════════════════════════════════════════════════════════════════

const RESEARCH_TIERS = {
  // ─────────────────────────────────────────────────────────────────────────────
  // TIER 1: ENTERPRISE RESEARCH (Surveys Only)
  // Full academic rigor, suitable for business decisions
  // ─────────────────────────────────────────────────────────────────────────────
  ENTERPRISE: {
    contentTypes: ["SURVEY"],
    description: "Full statistical validity for business/academic research",
    requirements: {
      qualityThreshold: 60,
      attentionChecksRequired: true,
      attentionCheckRatio: 0.05,          // 1 check per 20 questions minimum
      straightLiningDetection: true,
      speedingDetection: true,
      screeningRequired: true,
      branchingSupported: true,
      confidenceIntervals: true,
      significanceTesting: true,
      demographicWeighting: true,
      reliabilityScoring: true,
      powerAnalysisGuidance: true
    },
    minimumSampleSize: {
      display: 10,                         // Min to show any results
      reliable: 30,                        // Min for basic statistics
      confident: 100,                      // Min for 95% CI with ±10%
      robust: 384                          // Min for ±5% margin at 95% CI
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TIER 2: VALIDATED ENGAGEMENT (Polls & Tests)
  // Quality-controlled but simplified statistics
  // ─────────────────────────────────────────────────────────────────────────────
  VALIDATED: {
    contentTypes: ["POLL", "TEST"],
    description: "Quality-controlled engagement with basic validity metrics",
    requirements: {
      qualityThreshold: 40,
      attentionChecksRequired: false,      // Optional but recommended
      attentionCheckRatio: 0,
      straightLiningDetection: true,       // For tests with 5+ questions
      speedingDetection: true,
      screeningRequired: false,            // Optional
      branchingSupported: false,           // Limited
      confidenceIntervals: true,           // Basic CI only
      significanceTesting: false,          // Not required
      demographicWeighting: false,         // Not available
      reliabilityScoring: true,
      powerAnalysisGuidance: false
    },
    minimumSampleSize: {
      display: 5,
      reliable: 20,
      confident: 50,
      robust: 200
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TIER 3: QUICK FEEDBACK (Simple Polls)
  // Minimal validation, engagement-focused
  // ─────────────────────────────────────────────────────────────────────────────
  QUICK: {
    contentTypes: ["POLL"],
    description: "Fast engagement with fraud protection only",
    conditions: {
      maxOptions: 4,
      noBranching: true,
      noScreening: true
    },
    requirements: {
      // ═══════════════════════════════════════════════════════════════════════
      // CLARIFICATION: qualityThreshold: 0 does NOT mean "no quality checks"
      // ═══════════════════════════════════════════════════════════════════════
      // It means:
      // - Quality SCORE is still calculated (for analytics)
      // - Quality score is NOT used as a response REJECTION criterion
      // - Only FRAUD score is used for rejection (fraudScoreThreshold: 70)
      //
      // Why: Quick polls prioritize volume and speed over research-grade quality.
      // The fraud score still blocks bots, duplicate submissions, and malicious
      // activity, but allows fast "gut reaction" responses that might fail
      // stricter quality checks (e.g., very fast completion time).
      //
      // Cross-reference: BIBLE-016 §16.4 - All content types have quality SCORING
      // but QUICK polls don't use quality score for response FILTERING.
      // ═══════════════════════════════════════════════════════════════════════
      qualityThreshold: 0,                 // Quality score calculated but not used for filtering
      fraudScoreThreshold: 70,             // Fraud detection always active
      attentionChecksRequired: false,
      straightLiningDetection: false,
      speedingDetection: false,
      screeningRequired: false,
      branchingSupported: false,
      confidenceIntervals: true,           // Always show margin of error
      significanceTesting: false,
      demographicWeighting: false,
      reliabilityScoring: false,
      powerAnalysisGuidance: false
    },
    minimumSampleSize: {
      display: 1,
      reliable: 10,
      confident: 30,
      robust: 100
    }
  }
}

export { RESEARCH_TIERS }
```




# ══════════════════════════════════════════════════════════════════════════════
# 20.2 UNIFIED DATA QUALITY FRAMEWORK
# ══════════════════════════════════════════════════════════════════════════════

## 20.2.1 Quality Score Algorithm

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED QUALITY SCORE CALCULATION
// Applies to ALL content types with type-specific weights
// ═══════════════════════════════════════════════════════════════════════════════

interface QualityScoreInput {
  contentType: "POLL" | "SURVEY" | "TEST"

  // Timing metrics
  totalTimeSeconds: number
  expectedTimeSeconds: number
  perQuestionTimes: number[]              // Time spent on each question

  // Response patterns
  responses: Array<{
    questionId: string
    questionType: string
    value: unknown
    isAttentionCheck?: boolean
    expectedAnswer?: unknown              // For attention checks
  }>

  // Behavioral signals
  tabSwitchCount: number
  copyPasteAttempts: number
  deviceFingerprint: string
  ipReputation: number                    // 0-100 from fraud detection service

  // Historical context
  userPreviousQualityScores: number[]
  userAccountAge: number                  // Days
}

interface QualityScoreResult {
  overallScore: number                    // 0-100
  isValid: boolean
  recommendation: "INCLUDE" | "REVIEW" | "EXCLUDE"

  components: {
    timingScore: number                   // 0-100
    patternScore: number                  // 0-100
    attentionScore: number                // 0-100
    behaviorScore: number                 // 0-100
    fraudScore: number                    // 0-100 (inverted: 100 = no fraud)
  }

  flags: QualityFlag[]

  details: {
    speedRatio: number                    // actual/expected time
    straightLineRatio: number             // % identical consecutive answers
    attentionChecksPassed: number
    attentionChecksFailed: number
    suspiciousPatterns: string[]
  }
}

interface QualityFlag {
  type: QualityFlagType
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  message: string
  impact: number                          // Points deducted
}

type QualityFlagType =
  | "SPEEDING"                            // Completed too fast
  | "SLOWPOKE"                            // Completed suspiciously slow
  | "STRAIGHT_LINING"                     // Same answer repeatedly
  | "PATTERN_DETECTED"                    // Alternating or predictable pattern
  | "ATTENTION_CHECK_FAILED"              // Failed trap question
  | "INCONSISTENT_RESPONSES"              // Contradictory answers
  | "EXCESSIVE_TAB_SWITCHES"              // Left tab too many times
  | "COPY_PASTE_DETECTED"                 // Copied answers
  | "SUSPICIOUS_IP"                       // Known bad IP
  | "NEW_ACCOUNT"                         // Very new account
  | "LOW_HISTORICAL_QUALITY"              // User has history of low quality

// ═══════════════════════════════════════════════════════════════════════════════
// QUALITY SCORE WEIGHTS BY CONTENT TYPE
// ═══════════════════════════════════════════════════════════════════════════════

const QUALITY_WEIGHTS = {
  SURVEY: {
    timing: 0.20,
    pattern: 0.25,
    attention: 0.25,
    behavior: 0.15,
    fraud: 0.15
  },
  POLL: {
    timing: 0.15,
    pattern: 0.10,                        // Less relevant for single question
    attention: 0.00,                      // No attention checks in polls
    behavior: 0.25,
    fraud: 0.50                           // Fraud is primary concern
  },
  TEST: {
    timing: 0.20,
    pattern: 0.30,                        // Important for personality validity
    attention: 0.15,                      // Optional but weighted if present
    behavior: 0.20,
    fraud: 0.15
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUALITY SCORE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

function calculateQualityScore(input: QualityScoreInput): QualityScoreResult {
  const weights = QUALITY_WEIGHTS[input.contentType]
  const flags: QualityFlag[] = []

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. TIMING SCORE
  // ─────────────────────────────────────────────────────────────────────────────
  const speedRatio = input.totalTimeSeconds / input.expectedTimeSeconds
  let timingScore = 100

  if (speedRatio < 0.3) {
    // Extremely fast - likely not reading
    timingScore = 0
    flags.push({
      type: "SPEEDING",
      severity: "CRITICAL",
      message: `Tamamlama süresi beklenenin %${Math.round(speedRatio * 100)}'i`,
      impact: 40
    })
  } else if (speedRatio < 0.5) {
    // Very fast - suspicious
    timingScore = 30
    flags.push({
      type: "SPEEDING",
      severity: "HIGH",
      message: `Tamamlama süresi beklenenin %${Math.round(speedRatio * 100)}'i`,
      impact: 25
    })
  } else if (speedRatio < 0.7) {
    // Fast but possible
    timingScore = 60
    flags.push({
      type: "SPEEDING",
      severity: "MEDIUM",
      message: `Hızlı tamamlama: beklenenin %${Math.round(speedRatio * 100)}'i`,
      impact: 10
    })
  } else if (speedRatio > 5.0) {
    // Extremely slow - may indicate distraction
    timingScore = 70
    flags.push({
      type: "SLOWPOKE",
      severity: "LOW",
      message: "Çok uzun sürede tamamlandı",
      impact: 5
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PATTERN SCORE (Straight-lining & Pattern Detection)
  // ─────────────────────────────────────────────────────────────────────────────
  let patternScore = 100
  const straightLineRatio = calculateStraightLineRatio(input.responses)

  if (straightLineRatio > 0.9) {
    // Almost all same answers
    patternScore = 0
    flags.push({
      type: "STRAIGHT_LINING",
      severity: "CRITICAL",
      message: `Yanıtların %${Math.round(straightLineRatio * 100)}'i aynı`,
      impact: 50
    })
  } else if (straightLineRatio > 0.8) {
    patternScore = 20
    flags.push({
      type: "STRAIGHT_LINING",
      severity: "HIGH",
      message: `Yanıtların %${Math.round(straightLineRatio * 100)}'i aynı`,
      impact: 30
    })
  } else if (straightLineRatio > 0.6) {
    patternScore = 50
    flags.push({
      type: "STRAIGHT_LINING",
      severity: "MEDIUM",
      message: `Yanıtların %${Math.round(straightLineRatio * 100)}'i aynı`,
      impact: 15
    })
  }

  // Check for alternating patterns (1,2,1,2,1,2...)
  const alternatingRatio = detectAlternatingPattern(input.responses)
  if (alternatingRatio > 0.7) {
    patternScore = Math.min(patternScore, 30)
    flags.push({
      type: "PATTERN_DETECTED",
      severity: "HIGH",
      message: "Alternatif yanıt paterni tespit edildi",
      impact: 25
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. ATTENTION CHECK SCORE
  // ─────────────────────────────────────────────────────────────────────────────
  let attentionScore = 100
  const attentionChecks = input.responses.filter(r => r.isAttentionCheck)
  let attentionPassed = 0
  let attentionFailed = 0

  if (attentionChecks.length > 0) {
    for (const check of attentionChecks) {
      if (check.value === check.expectedAnswer) {
        attentionPassed++
      } else {
        attentionFailed++
      }
    }

    const passRate = attentionPassed / attentionChecks.length
    attentionScore = passRate * 100

    if (attentionFailed >= 2) {
      flags.push({
        type: "ATTENTION_CHECK_FAILED",
        severity: "CRITICAL",
        message: `${attentionFailed} dikkat sorusu başarısız`,
        impact: 50
      })
    } else if (attentionFailed === 1) {
      flags.push({
        type: "ATTENTION_CHECK_FAILED",
        severity: "HIGH",
        message: "1 dikkat sorusu başarısız",
        impact: 20
      })
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. BEHAVIOR SCORE
  // ─────────────────────────────────────────────────────────────────────────────
  let behaviorScore = 100

  // Tab switches
  if (input.tabSwitchCount > 10) {
    behaviorScore -= 30
    flags.push({
      type: "EXCESSIVE_TAB_SWITCHES",
      severity: "HIGH",
      message: `${input.tabSwitchCount} sekme değişikliği`,
      impact: 15
    })
  } else if (input.tabSwitchCount > 5) {
    behaviorScore -= 15
    flags.push({
      type: "EXCESSIVE_TAB_SWITCHES",
      severity: "MEDIUM",
      message: `${input.tabSwitchCount} sekme değişikliği`,
      impact: 8
    })
  }

  // Copy-paste attempts
  if (input.copyPasteAttempts > 0) {
    behaviorScore -= input.copyPasteAttempts * 10
    flags.push({
      type: "COPY_PASTE_DETECTED",
      severity: "MEDIUM",
      message: `${input.copyPasteAttempts} kopyala-yapıştır denemesi`,
      impact: input.copyPasteAttempts * 5
    })
  }

  // New account penalty
  if (input.userAccountAge < 1) {
    behaviorScore -= 20
    flags.push({
      type: "NEW_ACCOUNT",
      severity: "LOW",
      message: "Yeni oluşturulmuş hesap",
      impact: 5
    })
  } else if (input.userAccountAge < 7) {
    behaviorScore -= 10
  }

  behaviorScore = Math.max(0, behaviorScore)

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. FRAUD SCORE
  // ─────────────────────────────────────────────────────────────────────────────
  let fraudScore = input.ipReputation  // Start with IP reputation (0-100)

  // Historical quality penalty
  if (input.userPreviousQualityScores.length >= 3) {
    const avgPreviousQuality =
      input.userPreviousQualityScores.reduce((a, b) => a + b, 0) /
      input.userPreviousQualityScores.length

    if (avgPreviousQuality < 40) {
      fraudScore -= 30
      flags.push({
        type: "LOW_HISTORICAL_QUALITY",
        severity: "HIGH",
        message: "Geçmiş yanıt kalitesi düşük",
        impact: 15
      })
    } else if (avgPreviousQuality < 60) {
      fraudScore -= 15
    }
  }

  if (fraudScore < 30) {
    flags.push({
      type: "SUSPICIOUS_IP",
      severity: "HIGH",
      message: "Şüpheli IP adresi veya cihaz",
      impact: 20
    })
  }

  fraudScore = Math.max(0, Math.min(100, fraudScore))

  // ─────────────────────────────────────────────────────────────────────────────
  // FINAL CALCULATION
  // ─────────────────────────────────────────────────────────────────────────────
  const overallScore = Math.round(
    timingScore * weights.timing +
    patternScore * weights.pattern +
    attentionScore * weights.attention +
    behaviorScore * weights.behavior +
    fraudScore * weights.fraud
  )

  // Determine validity and recommendation
  const tier = RESEARCH_TIERS[
    input.contentType === "SURVEY" ? "ENTERPRISE" : "VALIDATED"
  ]

  const isValid = overallScore >= tier.requirements.qualityThreshold

  let recommendation: "INCLUDE" | "REVIEW" | "EXCLUDE"
  if (overallScore >= 70) {
    recommendation = "INCLUDE"
  } else if (overallScore >= tier.requirements.qualityThreshold) {
    recommendation = "REVIEW"
  } else {
    recommendation = "EXCLUDE"
  }

  // Critical flags override
  const hasCriticalFlag = flags.some(f => f.severity === "CRITICAL")
  if (hasCriticalFlag && input.contentType === "SURVEY") {
    recommendation = "EXCLUDE"
  }

  return {
    overallScore,
    isValid,
    recommendation,
    components: {
      timingScore,
      patternScore,
      attentionScore,
      behaviorScore,
      fraudScore
    },
    flags,
    details: {
      speedRatio,
      straightLineRatio,
      attentionChecksPassed: attentionPassed,
      attentionChecksFailed: attentionFailed,
      suspiciousPatterns: flags
        .filter(f => f.type === "PATTERN_DETECTED")
        .map(f => f.message)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function calculateStraightLineRatio(
  responses: Array<{ value: unknown }>
): number {
  if (responses.length < 3) return 0

  let consecutiveSame = 0
  let maxConsecutive = 0

  for (let i = 1; i < responses.length; i++) {
    if (JSON.stringify(responses[i].value) === JSON.stringify(responses[i-1].value)) {
      consecutiveSame++
      maxConsecutive = Math.max(maxConsecutive, consecutiveSame)
    } else {
      consecutiveSame = 0
    }
  }

  return maxConsecutive / (responses.length - 1)
}

function detectAlternatingPattern(
  responses: Array<{ value: unknown }>
): number {
  if (responses.length < 4) return 0

  let alternatingCount = 0
  for (let i = 2; i < responses.length; i++) {
    const current = JSON.stringify(responses[i].value)
    const prev = JSON.stringify(responses[i-1].value)
    const prevPrev = JSON.stringify(responses[i-2].value)

    if (current === prevPrev && current !== prev) {
      alternatingCount++
    }
  }

  return alternatingCount / (responses.length - 2)
}

export { calculateQualityScore, QUALITY_WEIGHTS }
export type { QualityScoreInput, QualityScoreResult, QualityFlag, QualityFlagType }
```




# ══════════════════════════════════════════════════════════════════════════════
# 20.3 FRAUD DETECTION SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 20.3.1 Fraud Score Algorithm

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FRAUD DETECTION SYSTEM
// Multi-signal approach to detect bots, duplicate accounts, and manipulation
// ═══════════════════════════════════════════════════════════════════════════════

interface FraudSignals {
  // Device & Network
  ipAddress: string
  deviceFingerprint: string
  userAgent: string
  screenResolution: string
  timezone: string
  language: string

  // Behavioral
  mouseMovements: boolean                 // Did user move mouse naturally?
  scrollPatterns: boolean                 // Did user scroll like human?
  keystrokePattern: string | null         // For text inputs
  clickTimings: number[]                  // Time between clicks

  // Historical
  accountCreatedAt: Date
  totalParticipations: number
  previousFraudFlags: number
  emailDomain: string
  phoneVerified: boolean

  // Contextual
  participationTime: Date                 // Time of day
  sessionDuration: number                 // Seconds on page before submission
  referrerUrl: string | null
}

interface FraudScoreResult {
  score: number                           // 0-100 (0 = definitely fraud, 100 = definitely legitimate)
  isBlocked: boolean
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  signals: FraudSignal[]
}

interface FraudSignal {
  type: FraudSignalType
  weight: number
  value: string
  contribution: number                    // Points added/subtracted
}

type FraudSignalType =
  | "KNOWN_BAD_IP"
  | "VPN_DETECTED"
  | "TOR_EXIT_NODE"
  | "DATACENTER_IP"
  | "SUSPICIOUS_FINGERPRINT"
  | "DUPLICATE_FINGERPRINT"
  | "BOT_BEHAVIOR"
  | "IMPOSSIBLE_TIMING"
  | "NEW_ACCOUNT"
  | "UNVERIFIED_ACCOUNT"
  | "DISPOSABLE_EMAIL"
  | "PREVIOUS_FRAUD"
  | "UNUSUAL_TIME"
  | "SUSPICIOUS_REFERRER"

// ═══════════════════════════════════════════════════════════════════════════════
// FRAUD SCORE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

const FRAUD_THRESHOLDS = {
  BLOCK: 30,                              // Score < 30 = auto-block
  HIGH_RISK: 50,                          // Score < 50 = high risk
  MEDIUM_RISK: 70,                        // Score < 70 = medium risk
  LOW_RISK: 100                           // Score >= 70 = low risk
}

async function calculateFraudScore(
  signals: FraudSignals
): Promise<FraudScoreResult> {
  let score = 100
  const detectedSignals: FraudSignal[] = []

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. IP REPUTATION CHECK
  // ─────────────────────────────────────────────────────────────────────────────
  const ipReputation = await checkIPReputation(signals.ipAddress)

  if (ipReputation.isKnownBad) {
    score -= 50
    detectedSignals.push({
      type: "KNOWN_BAD_IP",
      weight: 50,
      value: signals.ipAddress,
      contribution: -50
    })
  }

  if (ipReputation.isVPN) {
    score -= 20
    detectedSignals.push({
      type: "VPN_DETECTED",
      weight: 20,
      value: signals.ipAddress,
      contribution: -20
    })
  }

  if (ipReputation.isTor) {
    score -= 40
    detectedSignals.push({
      type: "TOR_EXIT_NODE",
      weight: 40,
      value: signals.ipAddress,
      contribution: -40
    })
  }

  if (ipReputation.isDatacenter) {
    score -= 25
    detectedSignals.push({
      type: "DATACENTER_IP",
      weight: 25,
      value: signals.ipAddress,
      contribution: -25
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. DEVICE FINGERPRINT CHECK
  // ─────────────────────────────────────────────────────────────────────────────
  const fingerprintCheck = await checkFingerprint(signals.deviceFingerprint)

  if (fingerprintCheck.isDuplicate) {
    score -= 30
    detectedSignals.push({
      type: "DUPLICATE_FINGERPRINT",
      weight: 30,
      value: `${fingerprintCheck.duplicateCount} duplicate(s)`,
      contribution: -30
    })
  }

  if (fingerprintCheck.isSuspicious) {
    score -= 15
    detectedSignals.push({
      type: "SUSPICIOUS_FINGERPRINT",
      weight: 15,
      value: fingerprintCheck.reason,
      contribution: -15
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. BEHAVIORAL ANALYSIS
  // ─────────────────────────────────────────────────────────────────────────────
  if (!signals.mouseMovements || !signals.scrollPatterns) {
    score -= 20
    detectedSignals.push({
      type: "BOT_BEHAVIOR",
      weight: 20,
      value: "No natural interaction patterns",
      contribution: -20
    })
  }

  // Check click timing variance (bots often have consistent timing)
  if (signals.clickTimings.length >= 3) {
    const variance = calculateVariance(signals.clickTimings)
    if (variance < 50) {  // Suspiciously consistent
      score -= 15
      detectedSignals.push({
        type: "BOT_BEHAVIOR",
        weight: 15,
        value: "Unnatural click timing pattern",
        contribution: -15
      })
    }
  }

  // Impossible timing
  if (signals.sessionDuration < 2) {
    score -= 30
    detectedSignals.push({
      type: "IMPOSSIBLE_TIMING",
      weight: 30,
      value: `Session: ${signals.sessionDuration}s`,
      contribution: -30
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. ACCOUNT HISTORY
  // ─────────────────────────────────────────────────────────────────────────────
  const accountAgeHours =
    (Date.now() - signals.accountCreatedAt.getTime()) / (1000 * 60 * 60)

  if (accountAgeHours < 1) {
    score -= 25
    detectedSignals.push({
      type: "NEW_ACCOUNT",
      weight: 25,
      value: "Account < 1 hour old",
      contribution: -25
    })
  } else if (accountAgeHours < 24) {
    score -= 15
    detectedSignals.push({
      type: "NEW_ACCOUNT",
      weight: 15,
      value: "Account < 24 hours old",
      contribution: -15
    })
  }

  if (!signals.phoneVerified) {
    score -= 10
    detectedSignals.push({
      type: "UNVERIFIED_ACCOUNT",
      weight: 10,
      value: "Phone not verified",
      contribution: -10
    })
  }

  // Disposable email check
  if (isDisposableEmail(signals.emailDomain)) {
    score -= 20
    detectedSignals.push({
      type: "DISPOSABLE_EMAIL",
      weight: 20,
      value: signals.emailDomain,
      contribution: -20
    })
  }

  // Previous fraud flags
  if (signals.previousFraudFlags > 0) {
    const penalty = Math.min(signals.previousFraudFlags * 15, 45)
    score -= penalty
    detectedSignals.push({
      type: "PREVIOUS_FRAUD",
      weight: penalty,
      value: `${signals.previousFraudFlags} previous flag(s)`,
      contribution: -penalty
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FINAL RESULT
  // ─────────────────────────────────────────────────────────────────────────────
  score = Math.max(0, Math.min(100, score))

  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  if (score < FRAUD_THRESHOLDS.BLOCK) {
    riskLevel = "CRITICAL"
  } else if (score < FRAUD_THRESHOLDS.HIGH_RISK) {
    riskLevel = "HIGH"
  } else if (score < FRAUD_THRESHOLDS.MEDIUM_RISK) {
    riskLevel = "MEDIUM"
  } else {
    riskLevel = "LOW"
  }

  return {
    score,
    isBlocked: score < FRAUD_THRESHOLDS.BLOCK,
    riskLevel,
    signals: detectedSignals
  }
}

// Placeholder functions - would integrate with external services
async function checkIPReputation(ip: string) {
  // Integration with MaxMind, IPQualityScore, or similar
  return {
    isKnownBad: false,
    isVPN: false,
    isTor: false,
    isDatacenter: false
  }
}

async function checkFingerprint(fingerprint: string) {
  // Check against stored fingerprints
  return {
    isDuplicate: false,
    duplicateCount: 0,
    isSuspicious: false,
    reason: ""
  }
}

function isDisposableEmail(domain: string): boolean {
  const disposableDomains = [
    "tempmail.com", "throwaway.email", "guerrillamail.com",
    "10minutemail.com", "mailinator.com", "yopmail.com"
    // ... extensive list
  ]
  return disposableDomains.includes(domain.toLowerCase())
}

function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
  const squareDiffs = numbers.map(n => Math.pow(n - mean, 2))
  return squareDiffs.reduce((a, b) => a + b, 0) / numbers.length
}

export { calculateFraudScore, FRAUD_THRESHOLDS }
export type { FraudSignals, FraudScoreResult, FraudSignal }
```




# ══════════════════════════════════════════════════════════════════════════════
# 20.4 STATISTICAL VALIDITY FRAMEWORK
# ══════════════════════════════════════════════════════════════════════════════

## 20.4.1 Sample Size & Power Analysis

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE SIZE CALCULATIONS & POWER ANALYSIS
// Enterprise-grade statistical guidance
// ═══════════════════════════════════════════════════════════════════════════════

interface SampleSizeRequirement {
  minimumRequired: number
  currentCount: number
  percentageComplete: number
  status: "INSUFFICIENT" | "MINIMAL" | "ADEQUATE" | "ROBUST"
  marginOfError: number                   // At 95% confidence
  confidenceLevel: number
  guidance: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE SIZE FOR PROPORTION ESTIMATION
// Formula: n = (Z² × p × (1-p)) / E²
// Where: Z = z-score, p = expected proportion, E = margin of error
// ═══════════════════════════════════════════════════════════════════════════════

const SAMPLE_SIZE_TABLE = {
  // Margin of error at 95% confidence, assuming p = 0.5 (worst case)
  MARGIN_10_PERCENT: 96,                  // ±10%
  MARGIN_7_PERCENT: 196,                  // ±7%
  MARGIN_5_PERCENT: 384,                  // ±5%
  MARGIN_3_PERCENT: 1067,                 // ±3%
  MARGIN_2_PERCENT: 2401,                 // ±2%
  MARGIN_1_PERCENT: 9604                  // ±1%
}

function calculateSampleSizeRequirement(
  currentSampleSize: number,
  desiredMarginOfError: number = 0.05,    // 5% default
  confidenceLevel: number = 0.95,
  populationSize: number | null = null    // null = infinite
): SampleSizeRequirement {

  // Z-scores for common confidence levels
  const zScores: Record<number, number> = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  }

  const z = zScores[confidenceLevel] || 1.96
  const p = 0.5  // Conservative estimate (maximum variance)

  // Calculate required sample size for infinite population
  let requiredSample = Math.ceil(
    (Math.pow(z, 2) * p * (1 - p)) / Math.pow(desiredMarginOfError, 2)
  )

  // Apply finite population correction if population size known
  if (populationSize !== null && populationSize < requiredSample * 10) {
    requiredSample = Math.ceil(
      requiredSample / (1 + ((requiredSample - 1) / populationSize))
    )
  }

  // Calculate current margin of error
  const currentMarginOfError = currentSampleSize > 0
    ? z * Math.sqrt((p * (1 - p)) / currentSampleSize)
    : 1

  // Determine status
  let status: "INSUFFICIENT" | "MINIMAL" | "ADEQUATE" | "ROBUST"
  let guidance: string

  if (currentSampleSize < 10) {
    status = "INSUFFICIENT"
    guidance = `En az ${requiredSample} yanıt gerekli. Şu an ${currentSampleSize} yanıt var. Sonuçlar istatistiksel olarak güvenilir değil.`
  } else if (currentSampleSize < 30) {
    status = "MINIMAL"
    guidance = `Minimum örnek boyutuna yaklaşıldı. ±${Math.round(currentMarginOfError * 100)}% hata payı ile sınırlı güvenilirlik.`
  } else if (currentSampleSize < requiredSample) {
    status = "ADEQUATE"
    guidance = `Yeterli örnek boyutu. ±${Math.round(currentMarginOfError * 100)}% hata payı (%${Math.round(confidenceLevel * 100)} güven aralığı).`
  } else {
    status = "ROBUST"
    guidance = `Sağlam örnek boyutu. ±${Math.round(currentMarginOfError * 100)}% hata payı (%${Math.round(confidenceLevel * 100)} güven aralığı).`
  }

  return {
    minimumRequired: requiredSample,
    currentCount: currentSampleSize,
    percentageComplete: Math.min(100, Math.round((currentSampleSize / requiredSample) * 100)),
    status,
    marginOfError: Math.round(currentMarginOfError * 1000) / 10,  // As percentage
    confidenceLevel: confidenceLevel * 100,
    guidance
  }
}

export { calculateSampleSizeRequirement, SAMPLE_SIZE_TABLE }
export type { SampleSizeRequirement }
```

## 20.4.2 Confidence Interval Calculation

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// CONFIDENCE INTERVAL CALCULATIONS
// For proportions and means
// ═══════════════════════════════════════════════════════════════════════════════

interface ConfidenceInterval {
  value: number                           // Point estimate
  lowerBound: number
  upperBound: number
  marginOfError: number
  confidenceLevel: number
  sampleSize: number
  interpretation: string
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIDENCE INTERVAL FOR PROPORTION
// Formula: p ± Z × √(p(1-p)/n)
// ─────────────────────────────────────────────────────────────────────────────

function calculateProportionCI(
  successes: number,
  sampleSize: number,
  confidenceLevel: number = 0.95
): ConfidenceInterval {

  if (sampleSize === 0) {
    return {
      value: 0,
      lowerBound: 0,
      upperBound: 0,
      marginOfError: 0,
      confidenceLevel: confidenceLevel * 100,
      sampleSize: 0,
      interpretation: "Veri yok"
    }
  }

  const p = successes / sampleSize
  const z = getZScore(confidenceLevel)

  // Wilson score interval (more accurate for small samples)
  const denominator = 1 + (Math.pow(z, 2) / sampleSize)
  const center = (p + Math.pow(z, 2) / (2 * sampleSize)) / denominator
  const spread = (z / denominator) * Math.sqrt(
    (p * (1 - p) / sampleSize) + (Math.pow(z, 2) / (4 * Math.pow(sampleSize, 2)))
  )

  const lowerBound = Math.max(0, center - spread)
  const upperBound = Math.min(1, center + spread)
  const marginOfError = (upperBound - lowerBound) / 2

  return {
    value: p * 100,
    lowerBound: lowerBound * 100,
    upperBound: upperBound * 100,
    marginOfError: marginOfError * 100,
    confidenceLevel: confidenceLevel * 100,
    sampleSize,
    interpretation: generateProportionInterpretation(p * 100, marginOfError * 100, confidenceLevel)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIDENCE INTERVAL FOR MEAN
// Formula: x̄ ± t × (s/√n)
// ─────────────────────────────────────────────────────────────────────────────

function calculateMeanCI(
  values: number[],
  confidenceLevel: number = 0.95
): ConfidenceInterval {

  const n = values.length
  if (n === 0) {
    return {
      value: 0,
      lowerBound: 0,
      upperBound: 0,
      marginOfError: 0,
      confidenceLevel: confidenceLevel * 100,
      sampleSize: 0,
      interpretation: "Veri yok"
    }
  }

  const mean = values.reduce((a, b) => a + b, 0) / n
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1)
  const stdDev = Math.sqrt(variance)
  const stdError = stdDev / Math.sqrt(n)

  // Use t-distribution for small samples, z for large
  const criticalValue = n < 30 ? getTScore(n - 1, confidenceLevel) : getZScore(confidenceLevel)
  const marginOfError = criticalValue * stdError

  return {
    value: mean,
    lowerBound: mean - marginOfError,
    upperBound: mean + marginOfError,
    marginOfError,
    confidenceLevel: confidenceLevel * 100,
    sampleSize: n,
    interpretation: generateMeanInterpretation(mean, marginOfError, confidenceLevel)
  }
}

function getZScore(confidenceLevel: number): number {
  const zScores: Record<number, number> = {
    0.80: 1.282,
    0.85: 1.440,
    0.90: 1.645,
    0.95: 1.960,
    0.99: 2.576
  }
  return zScores[confidenceLevel] || 1.96
}

function getTScore(df: number, confidenceLevel: number): number {
  // Simplified t-score lookup (would use full table in production)
  // Returns approximate t-score for given degrees of freedom
  if (df >= 120) return getZScore(confidenceLevel)
  if (df >= 60) return getZScore(confidenceLevel) * 1.01
  if (df >= 30) return getZScore(confidenceLevel) * 1.02
  if (df >= 20) return getZScore(confidenceLevel) * 1.03
  if (df >= 10) return getZScore(confidenceLevel) * 1.05
  return getZScore(confidenceLevel) * 1.10
}

function generateProportionInterpretation(
  value: number,
  marginOfError: number,
  confidenceLevel: number
): string {
  return `%${Math.round(confidenceLevel * 100)} güven aralığında, gerçek oran %${value.toFixed(1)} ± ${marginOfError.toFixed(1)} arasındadır.`
}

function generateMeanInterpretation(
  mean: number,
  marginOfError: number,
  confidenceLevel: number
): string {
  return `%${Math.round(confidenceLevel * 100)} güven aralığında, gerçek ortalama ${mean.toFixed(2)} ± ${marginOfError.toFixed(2)} arasındadır.`
}

export { calculateProportionCI, calculateMeanCI }
export type { ConfidenceInterval }
```

## 20.4.3 Significance Testing

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// SIGNIFICANCE TESTING
// For comparing groups and detecting real differences
// ═══════════════════════════════════════════════════════════════════════════════

interface SignificanceTestResult {
  testType: string
  statistic: number
  pValue: number
  isSignificant: boolean
  confidenceLevel: number
  effectSize: number
  effectSizeInterpretation: "NEGLIGIBLE" | "SMALL" | "MEDIUM" | "LARGE"
  interpretation: string
}

// ─────────────────────────────────────────────────────────────────────────────
// CHI-SQUARE TEST
// For comparing observed vs expected frequencies (e.g., poll options)
// ─────────────────────────────────────────────────────────────────────────────

function chiSquareTest(
  observed: number[],
  expected: number[] | null = null,       // null = uniform distribution
  confidenceLevel: number = 0.95
): SignificanceTestResult {

  const n = observed.length
  const total = observed.reduce((a, b) => a + b, 0)

  // Default to uniform distribution if no expected provided
  const expectedFreq = expected || observed.map(() => total / n)

  // Calculate chi-square statistic
  let chiSquare = 0
  for (let i = 0; i < n; i++) {
    chiSquare += Math.pow(observed[i] - expectedFreq[i], 2) / expectedFreq[i]
  }

  // Degrees of freedom
  const df = n - 1

  // Calculate p-value (simplified - would use chi-square distribution table)
  const pValue = chiSquarePValue(chiSquare, df)

  // Effect size (Cramér's V for chi-square)
  const effectSize = Math.sqrt(chiSquare / (total * (n - 1)))

  let effectSizeInterpretation: "NEGLIGIBLE" | "SMALL" | "MEDIUM" | "LARGE"
  if (effectSize < 0.1) effectSizeInterpretation = "NEGLIGIBLE"
  else if (effectSize < 0.3) effectSizeInterpretation = "SMALL"
  else if (effectSize < 0.5) effectSizeInterpretation = "MEDIUM"
  else effectSizeInterpretation = "LARGE"

  const alpha = 1 - confidenceLevel
  const isSignificant = pValue < alpha

  return {
    testType: "Chi-Square Test",
    statistic: chiSquare,
    pValue,
    isSignificant,
    confidenceLevel: confidenceLevel * 100,
    effectSize,
    effectSizeInterpretation,
    interpretation: isSignificant
      ? `Sonuçlar istatistiksel olarak anlamlı (p = ${pValue.toFixed(4)}). Dağılım şans eseri oluşmuş olamaz.`
      : `Sonuçlar istatistiksel olarak anlamlı değil (p = ${pValue.toFixed(4)}). Fark şans eseri olabilir.`
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// T-TEST (Independent Samples)
// For comparing means between two groups
// ─────────────────────────────────────────────────────────────────────────────

function independentTTest(
  group1: number[],
  group2: number[],
  confidenceLevel: number = 0.95
): SignificanceTestResult {

  const n1 = group1.length
  const n2 = group2.length

  const mean1 = group1.reduce((a, b) => a + b, 0) / n1
  const mean2 = group2.reduce((a, b) => a + b, 0) / n2

  const var1 = group1.reduce((acc, val) => acc + Math.pow(val - mean1, 2), 0) / (n1 - 1)
  const var2 = group2.reduce((acc, val) => acc + Math.pow(val - mean2, 2), 0) / (n2 - 1)

  // Pooled variance
  const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2)
  const pooledStdErr = Math.sqrt(pooledVar * (1/n1 + 1/n2))

  // T-statistic
  const t = (mean1 - mean2) / pooledStdErr
  const df = n1 + n2 - 2

  // P-value (simplified)
  const pValue = tTestPValue(Math.abs(t), df)

  // Effect size (Cohen's d)
  const pooledStdDev = Math.sqrt(pooledVar)
  const effectSize = Math.abs(mean1 - mean2) / pooledStdDev

  let effectSizeInterpretation: "NEGLIGIBLE" | "SMALL" | "MEDIUM" | "LARGE"
  if (effectSize < 0.2) effectSizeInterpretation = "NEGLIGIBLE"
  else if (effectSize < 0.5) effectSizeInterpretation = "SMALL"
  else if (effectSize < 0.8) effectSizeInterpretation = "MEDIUM"
  else effectSizeInterpretation = "LARGE"

  const alpha = 1 - confidenceLevel
  const isSignificant = pValue < alpha

  return {
    testType: "Independent Samples T-Test",
    statistic: t,
    pValue,
    isSignificant,
    confidenceLevel: confidenceLevel * 100,
    effectSize,
    effectSizeInterpretation,
    interpretation: isSignificant
      ? `Gruplar arasındaki fark istatistiksel olarak anlamlı (p = ${pValue.toFixed(4)}, d = ${effectSize.toFixed(2)}).`
      : `Gruplar arasındaki fark istatistiksel olarak anlamlı değil (p = ${pValue.toFixed(4)}).`
  }
}

// Simplified p-value approximations (would use full statistical tables in production)
function chiSquarePValue(chiSquare: number, df: number): number {
  // Approximation using Wilson-Hilferty transformation
  const z = Math.pow(chiSquare / df, 1/3) - (1 - 2/(9*df))
  const standardizedZ = z / Math.sqrt(2/(9*df))
  return 1 - normalCDF(standardizedZ)
}

function tTestPValue(t: number, df: number): number {
  // Two-tailed p-value approximation
  const x = df / (df + t * t)
  return incompleteBeta(df/2, 0.5, x)
}

function normalCDF(z: number): number {
  // Approximation of standard normal CDF
  const a1 =  0.254829592
  const a2 = -0.284496736
  const a3 =  1.421413741
  const a4 = -1.453152027
  const a5 =  1.061405429
  const p  =  0.3275911

  const sign = z < 0 ? -1 : 1
  z = Math.abs(z) / Math.sqrt(2)

  const t = 1.0 / (1.0 + p * z)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z)

  return 0.5 * (1.0 + sign * y)
}

// [CRITICAL] Regularized Incomplete Beta Function
// Uses continued fraction expansion (Lentz's algorithm)
// Required for accurate t-test p-value calculations
function incompleteBeta(a: number, b: number, x: number): number {
  if (x < 0 || x > 1) return NaN
  if (x === 0) return 0
  if (x === 1) return 1

  // Use symmetry relation for numerical stability
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - incompleteBeta(b, a, 1 - x)
  }

  // Continued fraction using Lentz's algorithm
  const lnBeta = gammaLn(a) + gammaLn(b) - gammaLn(a + b)
  const front = Math.exp(
    Math.log(x) * a + Math.log(1 - x) * b - lnBeta
  ) / a

  const EPSILON = 1e-14
  const MAX_ITERATIONS = 200

  let f = 1, c = 1, d = 0
  for (let m = 0; m <= MAX_ITERATIONS; m++) {
    const m2 = 2 * m

    // Even step
    let numerator = m === 0
      ? 1
      : (m * (b - m) * x) / ((a + m2 - 1) * (a + m2))
    d = 1 + numerator * d
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + numerator / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d
    f *= c * d

    // Odd step
    numerator = -((a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1))
    d = 1 + numerator * d
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = 1 + numerator / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1 / d
    const delta = c * d
    f *= delta

    if (Math.abs(delta - 1) < EPSILON) break
  }

  return front * (f - 1)
}

// Log-gamma function using Lanczos approximation
function gammaLn(x: number): number {
  const g = 7
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ]

  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - gammaLn(1 - x)
  }

  x -= 1
  let a = c[0]
  for (let i = 1; i < g + 2; i++) {
    a += c[i] / (x + i)
  }
  const t = x + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}

export { chiSquareTest, independentTTest }
export type { SignificanceTestResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 20.5 UNIFIED RELIABILITY SCORING
# ══════════════════════════════════════════════════════════════════════════════

## 20.5.1 Content Reliability Score

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED RELIABILITY SCORE
// Single metric combining sample quality, response quality, and methodology
// Applies to ALL content types with appropriate weights
// ═══════════════════════════════════════════════════════════════════════════════

interface ReliabilityScoreResult {
  overallScore: number                    // 0-100
  grade: "A" | "B" | "C" | "D" | "F"
  components: {
    sampleQuality: number                 // 0-100
    responseQuality: number               // 0-100
    methodologyQuality: number            // 0-100
    creatorTrust: number                  // 0-100
  }
  warnings: ReliabilityWarning[]
  displayable: boolean
  interpretation: string
}

interface ReliabilityWarning {
  type: string
  severity: "INFO" | "WARNING" | "CRITICAL"
  message: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// RELIABILITY WEIGHTS BY CONTENT TYPE
// ═══════════════════════════════════════════════════════════════════════════════

const RELIABILITY_WEIGHTS = {
  SURVEY: {
    sampleQuality: 0.35,
    responseQuality: 0.30,
    methodologyQuality: 0.20,
    creatorTrust: 0.15
  },
  POLL: {
    sampleQuality: 0.40,
    responseQuality: 0.30,
    methodologyQuality: 0.10,             // Limited methodology in polls
    creatorTrust: 0.20
  },
  TEST: {
    sampleQuality: 0.30,
    responseQuality: 0.35,
    methodologyQuality: 0.20,
    creatorTrust: 0.15
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RELIABILITY SCORE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

interface ReliabilityInput {
  contentType: "POLL" | "SURVEY" | "TEST"

  // Sample metrics
  totalResponses: number
  validResponses: number                  // After quality filtering
  targetSampleSize: number | null
  demographicCoverage: number             // 0-100: how well demographics represented

  // Response quality metrics
  averageQualityScore: number             // Average of all response quality scores
  attentionCheckPassRate: number | null   // null if no attention checks
  excludedResponses: number               // Number filtered out

  // Methodology
  hasScreening: boolean
  hasBranching: boolean
  hasAttentionChecks: boolean
  questionCount: number

  // Creator
  creatorTrustScore: number               // 0-100 from user trust system
  organizationVerified: boolean
}

function calculateReliabilityScore(
  input: ReliabilityInput
): ReliabilityScoreResult {

  const weights = RELIABILITY_WEIGHTS[input.contentType]
  const warnings: ReliabilityWarning[] = []

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SAMPLE QUALITY (0-100)
  // ─────────────────────────────────────────────────────────────────────────────
  let sampleQuality = 0

  // Sample size scoring
  const sizeThresholds = [
    { min: 0, max: 9, score: 10 },
    { min: 10, max: 29, score: 30 },
    { min: 30, max: 99, score: 50 },
    { min: 100, max: 299, score: 70 },
    { min: 300, max: 999, score: 85 },
    { min: 1000, max: Infinity, score: 100 }
  ]

  for (const threshold of sizeThresholds) {
    if (input.validResponses >= threshold.min && input.validResponses <= threshold.max) {
      sampleQuality = threshold.score
      break
    }
  }

  // Adjust for demographic coverage
  sampleQuality = sampleQuality * 0.7 + input.demographicCoverage * 0.3

  // Warning for low sample size
  if (input.validResponses < 30) {
    warnings.push({
      type: "LOW_SAMPLE_SIZE",
      severity: input.validResponses < 10 ? "CRITICAL" : "WARNING",
      message: `Örnek boyutu düşük (${input.validResponses} yanıt). Sonuçlar temsili olmayabilir.`
    })
  }

  // Warning for target not met
  if (input.targetSampleSize && input.validResponses < input.targetSampleSize * 0.5) {
    warnings.push({
      type: "TARGET_NOT_MET",
      severity: "WARNING",
      message: `Hedef örnek boyutunun yalnızca %${Math.round((input.validResponses / input.targetSampleSize) * 100)}'i ulaşıldı.`
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. RESPONSE QUALITY (0-100)
  // ─────────────────────────────────────────────────────────────────────────────
  let responseQuality = input.averageQualityScore

  // Adjust for attention check performance
  if (input.attentionCheckPassRate !== null) {
    responseQuality = responseQuality * 0.7 + input.attentionCheckPassRate * 0.3

    if (input.attentionCheckPassRate < 80) {
      warnings.push({
        type: "LOW_ATTENTION",
        severity: input.attentionCheckPassRate < 60 ? "WARNING" : "INFO",
        message: `Dikkat kontrolü başarı oranı: %${Math.round(input.attentionCheckPassRate)}`
      })
    }
  }

  // Penalty for high exclusion rate
  const exclusionRate = input.totalResponses > 0
    ? input.excludedResponses / input.totalResponses
    : 0

  if (exclusionRate > 0.3) {
    responseQuality -= 15
    warnings.push({
      type: "HIGH_EXCLUSION",
      severity: "WARNING",
      message: `Yanıtların %${Math.round(exclusionRate * 100)}'i kalite nedeniyle hariç tutuldu.`
    })
  }

  responseQuality = Math.max(0, Math.min(100, responseQuality))

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. METHODOLOGY QUALITY (0-100)
  // ─────────────────────────────────────────────────────────────────────────────
  let methodologyQuality = 40  // Base score

  if (input.contentType === "SURVEY") {
    // Surveys get full methodology scoring
    if (input.hasScreening) methodologyQuality += 20
    if (input.hasBranching) methodologyQuality += 15
    if (input.hasAttentionChecks) methodologyQuality += 15
    if (input.questionCount >= 10) methodologyQuality += 10
  } else if (input.contentType === "TEST") {
    // Tests have limited methodology
    if (input.hasAttentionChecks) methodologyQuality += 30
    if (input.questionCount >= 15) methodologyQuality += 20
    methodologyQuality += 10  // Base bonus for structured format
  } else {
    // Polls have minimal methodology
    methodologyQuality = 60  // Fixed score for polls
  }

  methodologyQuality = Math.min(100, methodologyQuality)

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. CREATOR TRUST (0-100)
  // ─────────────────────────────────────────────────────────────────────────────
  let creatorTrust = input.creatorTrustScore

  // Bonus for verified organization
  if (input.organizationVerified) {
    creatorTrust = Math.min(100, creatorTrust + 15)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FINAL CALCULATION
  // ─────────────────────────────────────────────────────────────────────────────
  const overallScore = Math.round(
    sampleQuality * weights.sampleQuality +
    responseQuality * weights.responseQuality +
    methodologyQuality * weights.methodologyQuality +
    creatorTrust * weights.creatorTrust
  )

  // Grade assignment
  let grade: "A" | "B" | "C" | "D" | "F"
  if (overallScore >= 90) grade = "A"
  else if (overallScore >= 80) grade = "B"
  else if (overallScore >= 70) grade = "C"
  else if (overallScore >= 60) grade = "D"
  else grade = "F"

  // Displayability check
  const displayable = input.validResponses >= 10

  if (!displayable) {
    warnings.push({
      type: "NOT_DISPLAYABLE",
      severity: "CRITICAL",
      message: "Güvenilirlik skoru için yeterli yanıt yok (minimum 10)."
    })
  }

  return {
    overallScore,
    grade,
    components: {
      sampleQuality: Math.round(sampleQuality),
      responseQuality: Math.round(responseQuality),
      methodologyQuality: Math.round(methodologyQuality),
      creatorTrust: Math.round(creatorTrust)
    },
    warnings,
    displayable,
    interpretation: generateReliabilityInterpretation(overallScore, grade, input.contentType)
  }
}

function generateReliabilityInterpretation(
  score: number,
  grade: string,
  contentType: string
): string {
  const typeLabel = {
    POLL: "anket",
    SURVEY: "araştırma",
    TEST: "test"
  }[contentType]

  if (grade === "A") {
    return `Bu ${typeLabel} yüksek güvenilirliğe sahip. Sonuçlar güvenle kullanılabilir.`
  } else if (grade === "B") {
    return `Bu ${typeLabel} iyi güvenilirliğe sahip. Sonuçlar genel değerlendirmeler için uygundur.`
  } else if (grade === "C") {
    return `Bu ${typeLabel} orta güvenilirliğe sahip. Sonuçlar dikkatli yorumlanmalıdır.`
  } else if (grade === "D") {
    return `Bu ${typeLabel} düşük güvenilirliğe sahip. Sonuçlar yalnızca gösterge niteliğindedir.`
  } else {
    return `Bu ${typeLabel}nin güvenilirliği yetersiz. Sonuçlar karar vermek için uygun değil.`
  }
}

export { calculateReliabilityScore, RELIABILITY_WEIGHTS }
export type { ReliabilityScoreResult, ReliabilityInput, ReliabilityWarning }
```




# ══════════════════════════════════════════════════════════════════════════════
# 20.6 RESULT DISPLAY FRAMEWORK
# ══════════════════════════════════════════════════════════════════════════════

## 20.6.1 Result Display with Validity Context

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// RESULT DISPLAY FRAMEWORK
// Always show results with appropriate statistical context
// ═══════════════════════════════════════════════════════════════════════════════

interface ResultDisplayConfig {
  contentType: "POLL" | "SURVEY" | "TEST"

  // What to show based on sample size
  showConfidenceInterval: boolean
  showMarginOfError: boolean
  showReliabilityScore: boolean
  showSampleSizeWarning: boolean
  showSignificanceIndicator: boolean

  // Formatting
  decimalPlaces: number
  showPercentages: boolean
  showRawCounts: boolean
}

const RESULT_DISPLAY_CONFIG: Record<string, ResultDisplayConfig> = {
  // Polls: Simple display with margin of error
  POLL: {
    contentType: "POLL",
    showConfidenceInterval: true,
    showMarginOfError: true,
    showReliabilityScore: false,          // Only if premium
    showSampleSizeWarning: true,
    showSignificanceIndicator: false,
    decimalPlaces: 0,
    showPercentages: true,
    showRawCounts: true
  },

  // Surveys: Full statistical display
  SURVEY: {
    contentType: "SURVEY",
    showConfidenceInterval: true,
    showMarginOfError: true,
    showReliabilityScore: true,
    showSampleSizeWarning: true,
    showSignificanceIndicator: true,
    decimalPlaces: 1,
    showPercentages: true,
    showRawCounts: true
  },

  // Tests: Result-focused display
  TEST: {
    contentType: "TEST",
    showConfidenceInterval: false,        // Not applicable to personality
    showMarginOfError: false,
    showReliabilityScore: true,
    showSampleSizeWarning: false,
    showSignificanceIndicator: false,
    decimalPlaces: 0,
    showPercentages: true,
    showRawCounts: false
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// POLL RESULT DISPLAY
// ═══════════════════════════════════════════════════════════════════════════════

interface PollResultDisplay {
  pollId: string
  totalVotes: number
  options: Array<{
    optionId: string
    text: string
    voteCount: number
    percentage: number
    confidenceInterval: {
      lower: number
      upper: number
    }
    isLeading: boolean
  }>

  // Statistical context
  marginOfError: number
  sampleSizeStatus: "INSUFFICIENT" | "MINIMAL" | "ADEQUATE" | "ROBUST"
  warning: string | null

  // Display helpers
  formattedResults: string[]              // Pre-formatted for display
}

function formatPollResults(
  results: PollResultData,
  config: ResultDisplayConfig = RESULT_DISPLAY_CONFIG.POLL
): PollResultDisplay {

  const sampleReq = calculateSampleSizeRequirement(results.totalVotes)

  const options = results.options.map(opt => {
    const ci = calculateProportionCI(opt.voteCount, results.totalVotes)

    return {
      optionId: opt.optionId,
      text: opt.text,
      voteCount: opt.voteCount,
      percentage: Math.round(opt.percentage * 10) / 10,
      confidenceInterval: {
        lower: Math.round(ci.lowerBound * 10) / 10,
        upper: Math.round(ci.upperBound * 10) / 10
      },
      isLeading: opt.isLeading
    }
  })

  // Generate warning if needed
  let warning: string | null = null
  if (results.totalVotes < 10) {
    warning = "⚠️ Az sayıda oy. Sonuçlar değişebilir."
  } else if (results.totalVotes < 30) {
    warning = "ℹ️ Sonuçlar ±" + Math.round(sampleReq.marginOfError) + "% hata payı içerir."
  }

  // Format for display
  const formattedResults = options.map(opt => {
    let formatted = `${opt.text}: %${opt.percentage}`
    if (config.showRawCounts) {
      formatted += ` (${opt.voteCount} oy)`
    }
    if (config.showConfidenceInterval && results.totalVotes >= 30) {
      formatted += ` [%${opt.confidenceInterval.lower} - %${opt.confidenceInterval.upper}]`
    }
    return formatted
  })

  return {
    pollId: results.pollId,
    totalVotes: results.totalVotes,
    options,
    marginOfError: sampleReq.marginOfError,
    sampleSizeStatus: sampleReq.status,
    warning,
    formattedResults
  }
}

export { RESULT_DISPLAY_CONFIG, formatPollResults }
export type { ResultDisplayConfig, PollResultDisplay }
```




# ══════════════════════════════════════════════════════════════════════════════
# 20.7 DEMOGRAPHIC ANALYSIS & WEIGHTING
# ══════════════════════════════════════════════════════════════════════════════

## 20.7.1 Demographic Weighting (Surveys Only)

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// DEMOGRAPHIC WEIGHTING
// Adjust results to match target population distribution
// Available for Enterprise Survey tier only
// ═══════════════════════════════════════════════════════════════════════════════

interface DemographicWeight {
  dimension: "AGE_GROUP" | "GENDER" | "REGION" | "EDUCATION" | "INCOME"
  category: string
  targetPercentage: number                // Target population %
  actualPercentage: number                // Sample %
  weight: number                          // Adjustment factor
}

interface WeightedResult {
  original: number                        // Unweighted result
  weighted: number                        // After demographic adjustment
  weightingApplied: boolean
  weights: DemographicWeight[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST-STRATIFICATION WEIGHTING
// Reference: Gallup/Pew Research methodology
// ═══════════════════════════════════════════════════════════════════════════════

interface PopulationTarget {
  dimension: string
  distribution: Array<{
    category: string
    percentage: number
  }>
}

function calculateDemographicWeights(
  sampleDistribution: Array<{
    dimension: string
    category: string
    count: number
  }>,
  populationTargets: PopulationTarget[]
): DemographicWeight[] {

  const weights: DemographicWeight[] = []

  for (const target of populationTargets) {
    const sampleForDimension = sampleDistribution.filter(
      s => s.dimension === target.dimension
    )

    const totalForDimension = sampleForDimension.reduce(
      (sum, s) => sum + s.count, 0
    )

    for (const targetCategory of target.distribution) {
      const sampleCategory = sampleForDimension.find(
        s => s.category === targetCategory.category
      )

      const actualCount = sampleCategory?.count || 0
      const actualPercentage = totalForDimension > 0
        ? (actualCount / totalForDimension) * 100
        : 0

      // Weight = target % / actual %
      // Capped to prevent extreme weights
      let weight = actualPercentage > 0
        ? targetCategory.percentage / actualPercentage
        : 1

      // Cap weights between 0.2 and 5 to prevent instability
      weight = Math.max(0.2, Math.min(5, weight))

      weights.push({
        dimension: target.dimension as DemographicWeight["dimension"],
        category: targetCategory.category,
        targetPercentage: targetCategory.percentage,
        actualPercentage,
        weight
      })
    }
  }

  return weights
}

// Example population targets for Turkey
const TURKEY_POPULATION_TARGETS: PopulationTarget[] = [
  {
    dimension: "AGE_GROUP",
    distribution: [
      { category: "18-24", percentage: 12.5 },
      { category: "25-34", percentage: 17.2 },
      { category: "35-44", percentage: 16.8 },
      { category: "45-54", percentage: 14.1 },
      { category: "55-64", percentage: 11.9 },
      { category: "65+", percentage: 9.5 }
    ]
  },
  {
    dimension: "GENDER",
    distribution: [
      { category: "MALE", percentage: 49.8 },
      { category: "FEMALE", percentage: 50.2 }
    ]
  },
  {
    dimension: "REGION",
    distribution: [
      { category: "MARMARA", percentage: 30.2 },
      { category: "IC_ANADOLU", percentage: 15.5 },
      { category: "EGE", percentage: 12.8 },
      { category: "AKDENIZ", percentage: 12.4 },
      { category: "KARADENIZ", percentage: 8.3 },
      { category: "GUNEYDOGU", percentage: 10.5 },
      { category: "DOGU", percentage: 10.3 }
    ]
  }
]

export { calculateDemographicWeights, TURKEY_POPULATION_TARGETS }
export type { DemographicWeight, WeightedResult, PopulationTarget }
```




# ══════════════════════════════════════════════════════════════════════════════
# 20.8 ENTERPRISE INTEGRATION REQUIREMENTS
# ══════════════════════════════════════════════════════════════════════════════

## 20.8.1 Data Export Standards

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// ENTERPRISE DATA EXPORT
// Standardized formats for business intelligence integration
// ═══════════════════════════════════════════════════════════════════════════════

interface EnterpriseExportConfig {
  format: "CSV" | "XLSX" | "JSON" | "SPSS" | "STATA"
  includeMetadata: boolean
  includeStatistics: boolean
  includeConfidenceIntervals: boolean
  anonymizeResponses: boolean
  dateFormat: string
  encoding: "UTF-8" | "UTF-16" | "ISO-8859-1"
}

interface ExportMetadata {
  exportedAt: Date
  exportedBy: string
  contentType: "POLL" | "SURVEY" | "TEST"
  contentId: string
  contentTitle: string

  // Statistical summary
  totalResponses: number
  validResponses: number
  excludedResponses: number
  reliabilityScore: number
  marginOfError: number
  confidenceLevel: number

  // Collection period
  collectionStarted: Date
  collectionEnded: Date | null

  // Methodology notes
  screeningApplied: boolean
  attentionChecksUsed: number
  qualityThreshold: number

  // Limitations
  warnings: string[]
}

const EXPORT_FORMATS = {
  CSV: {
    extension: ".csv",
    mimeType: "text/csv",
    supportsMultipleSheets: false,
    supportsFormatting: false
  },
  XLSX: {
    extension: ".xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    supportsMultipleSheets: true,
    supportsFormatting: true
  },
  JSON: {
    extension: ".json",
    mimeType: "application/json",
    supportsMultipleSheets: false,
    supportsFormatting: false
  },
  SPSS: {
    extension: ".sav",
    mimeType: "application/x-spss-sav",
    supportsMultipleSheets: false,
    supportsFormatting: true
  },
  STATA: {
    extension: ".dta",
    mimeType: "application/x-stata-dta",
    supportsMultipleSheets: false,
    supportsFormatting: true
  }
}

export { EXPORT_FORMATS }
export type { EnterpriseExportConfig, ExportMetadata }
```

## 20.8.2 Compliance & Audit Requirements

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE FRAMEWORK
// Data governance and audit trail requirements
// ═══════════════════════════════════════════════════════════════════════════════

interface ComplianceConfig {
  // Data Protection
  gdprCompliant: boolean
  kvkkCompliant: boolean                  // Turkish KVKK
  dataRetentionDays: number

  // Consent tracking
  consentRequired: boolean
  consentVersion: string
  consentLanguage: string

  // Anonymization
  anonymizationMethod: "HASH" | "K_ANONYMITY" | "DIFFERENTIAL_PRIVACY"
  minimumKAnonymity: number               // For k-anonymity

  // Audit
  auditLogEnabled: boolean
  auditRetentionDays: number
}

interface AuditLogEntry {
  id: string
  timestamp: Date

  // Who
  actorType: "USER" | "SYSTEM" | "ADMIN"
  actorId: string | null
  actorIp: string

  // What
  action: AuditAction
  resourceType: "POLL" | "SURVEY" | "TEST" | "RESPONSE" | "USER" | "ORGANIZATION"
  resourceId: string

  // Details
  changes: Record<string, { before: unknown; after: unknown }>
  metadata: Record<string, unknown>
}

type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "ARCHIVE"
  | "EXPORT"
  | "VIEW_RESULTS"
  | "RESPONSE_SUBMITTED"
  | "RESPONSE_EXCLUDED"
  | "SETTINGS_CHANGED"
  | "PERMISSION_GRANTED"
  | "PERMISSION_REVOKED"

const COMPLIANCE_DEFAULTS = {
  dataRetentionDays: 365,                 // 1 year default
  auditRetentionDays: 730,                // 2 years for audit logs
  minimumKAnonymity: 5,
  consentVersion: "2024-01"
}

export { COMPLIANCE_DEFAULTS }
export type { ComplianceConfig, AuditLogEntry, AuditAction }
```




# ══════════════════════════════════════════════════════════════════════════════
# 20.9 QUALITY CONTROL MATRIX
# ══════════════════════════════════════════════════════════════════════════════

## 20.9.1 Unified Quality Control Requirements

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          QUALITY CONTROL REQUIREMENTS BY CONTENT TYPE                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                     │
│  QUALITY CONTROL           │    POLL          │    SURVEY           │    TEST                      │
│  ──────────────────────────┼──────────────────┼─────────────────────┼─────────────────────────────  │
│                            │                  │                     │                              │
│  Quality Threshold         │    40            │    60               │    40                        │
│  Fraud Score Threshold     │    30            │    30               │    30                        │
│                            │                  │                     │                              │
│  DETECTION MECHANISMS      │                  │                     │                              │
│  ──────────────────────────┼──────────────────┼─────────────────────┼─────────────────────────────  │
│  Speeding Detection        │    ✓             │    ✓                │    ✓                         │
│    - Threshold             │    0.3x expected │    0.5x expected    │    0.4x expected             │
│    - Action                │    Flag          │    Exclude          │    Flag                      │
│                            │                  │                     │                              │
│  Straight-lining Detection │    N/A           │    ✓                │    ✓                         │
│    - Threshold             │    -             │    0.8 similarity   │    0.7 similarity            │
│    - Min Questions         │    -             │    5                │    5                         │
│    - Action                │    -             │    Exclude          │    Flag                      │
│                            │                  │                     │                              │
│  Attention Checks          │    Optional      │    Required (20+ Q) │    Recommended               │
│    - Ratio                 │    -             │    1 per 20 Q       │    1 per 15 Q                │
│    - Max Failures          │    -             │    2                │    1                         │
│    - Action on Fail        │    -             │    Exclude          │    Flag + Review             │
│                            │                  │                     │                              │
│  Tab Switch Detection      │    ✗             │    ✓                │    ✓                         │
│    - Max Allowed           │    -             │    10               │    5                         │
│    - Action                │    -             │    Flag             │    Flag                      │
│                            │                  │                     │                              │
│  Copy-Paste Prevention     │    ✗             │    ✓                │    ✓                         │
│                            │                  │                     │                              │
│  IP/Device Fingerprint     │    ✓             │    ✓                │    ✓                         │
│                            │                  │                     │                              │
│  Bot Detection             │    ✓             │    ✓                │    ✓                         │
│                            │                  │                     │                              │
│  PRE-PARTICIPATION         │                  │                     │                              │
│  ──────────────────────────┼──────────────────┼─────────────────────┼─────────────────────────────  │
│  Screening Questions       │    Optional      │    Required         │    Optional                  │
│  Target Audience Filter    │    Optional      │    Required         │    Optional                  │
│  Duplicate Prevention      │    ✓ (hash)      │    ✓ (hash)         │    ✓ (attempt limit)         │
│                            │                  │                     │                              │
│  POST-RESPONSE             │                  │                     │                              │
│  ──────────────────────────┼──────────────────┼─────────────────────┼─────────────────────────────  │
│  Quality Score Calc        │    ✓             │    ✓                │    ✓                         │
│  Auto-Exclude              │    Fraud only    │    Quality < 60     │    Optional                  │
│  Manual Review Queue       │    ✗             │    ✓                │    ✗                         │
│  Response Invalidation     │    ✗             │    ✓                │    ✗                         │
│                            │                  │                     │                              │
│  STATISTICAL OUTPUT        │                  │                     │                              │
│  ──────────────────────────┼──────────────────┼─────────────────────┼─────────────────────────────  │
│  Confidence Intervals      │    ✓             │    ✓                │    ✗                         │
│  Significance Testing      │    Basic         │    Full             │    ✗                         │
│  Demographic Weighting     │    ✗             │    ✓ (Enterprise)   │    ✗                         │
│  Reliability Score         │    Basic         │    Full             │    Basic                     │
│                            │                  │                     │                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 20.10 EXTERNALIZED POPULATION DATA SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 20.10.1 Problem Statement

Hardcoded population demographics (e.g., `TURKEY_DEMOGRAPHICS = { "18-24": 0.12 }`)
become stale and cannot be updated without code deployment. Solution: Database-driven
population data with version tracking.

## 20.10.2 Population Data Schema

```typescript
// Drizzle schema
// ══════════════════════════════════════════════════════════════════════════════
// POPULATION DATA MODELS
// Stored in database, cached in Redis, updated via admin panel
// ══════════════════════════════════════════════════════════════════════════════

export const populationDatasets = pgTable('population_datasets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  countryCode: text('country_code').notNull(),    // ISO 3166-1 alpha-2 (TR, US, DE, etc.)
  name: text('name').notNull(),                   // "Turkey Census 2023"
  source: text('source').notNull(),               // "TÜİK", "US Census Bureau", etc.
  sourceUrl: text('source_url'),                  // Link to official source
  year: integer('year').notNull(),                // Year of data
  version: integer('version').default(1).notNull(),
  isActive      Boolean   @default(false)  // Only one active per country
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdBy     String    // Admin who created

  distributions PopulationDistribution[]

  @@unique([countryCode, year, version])
  @@index([countryCode, isActive])
}

model PopulationDistribution {
  id            String    @id @default(cuid())
  datasetId     String
  dataset       PopulationDataset @relation(fields: [datasetId], references: [id])
  dimension     String    // AGE_GROUP, GENDER, REGION, EDUCATION, INCOME
  category      String    // "18-24", "MALE", "ISTANBUL", etc.
  percentage    Float     // 0.0 - 100.0
  population    BigInt?   // Absolute number if available
  confidence    Float?    // Data confidence level

  @@unique([datasetId, dimension, category])
  @@index([datasetId, dimension])
}
```


## 20.10.3 Population Data Service

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// POPULATION DATA SERVICE
// Fetches from DB, caches in Redis, provides API for weighting calculations
// ══════════════════════════════════════════════════════════════════════════════

interface PopulationData {
  countryCode: string
  name: string
  source: string
  year: number
  version: number
  distributions: {
    dimension: string
    categories: Array<{
      category: string
      percentage: number
    }>
  }[]
}

const POPULATION_DATA_CONFIG = {
  // Redis cache settings
  cache: {
    keyPrefix: "population:data",
    ttl: 86400,              // 24 hours
    activeKey: (country: string) => `population:active:${country}`
  },

  // Supported dimensions
  dimensions: [
    "AGE_GROUP",
    "GENDER",
    "REGION",
    "EDUCATION",
    "INCOME"
  ] as const,

  // Default country
  defaultCountry: "TR",

  // Fallback data when DB unavailable
  fallbackEnabled: true
}

class PopulationDataService {
  private redis: Redis
  private db: DrizzleClient

  constructor(redis: Redis, db: DrizzleClient) {
    this.redis = redis
    this.db = db
  }

  // Get active population data for country
  async getPopulationData(countryCode: string): Promise<PopulationData | null> {
    // Check cache first
    const cacheKey = POPULATION_DATA_CONFIG.cache.activeKey(countryCode)
    const cached = await this.redis.get(cacheKey)

    if (cached) {
      return JSON.parse(cached)
    }

    // Fetch from database
    const dataset = await this.db.query.populationDatasets.findFirst({
      where: and(
        eq(populationDatasets.countryCode, countryCode),
        eq(populationDatasets.isActive, true)
      ),
      with: {
        distributions: true
      }
    })

    if (!dataset) {
      // Try fallback
      if (POPULATION_DATA_CONFIG.fallbackEnabled) {
        return this.getFallbackData(countryCode)
      }
      return null
    }

    // Transform to PopulationData format
    const populationData = this.transformDataset(dataset)

    // Cache result
    await this.redis.set(
      cacheKey,
      JSON.stringify(populationData),
      "EX",
      POPULATION_DATA_CONFIG.cache.ttl
    )

    return populationData
  }

  // Get population targets for weighting
  async getWeightingTargets(
    countryCode: string,
    dimensions: string[]
  ): Promise<PopulationTarget[]> {
    const data = await this.getPopulationData(countryCode)

    if (!data) {
      throw new Error(`No population data available for ${countryCode}`)
    }

    return dimensions
      .map(dim => data.distributions.find(d => d.dimension === dim))
      .filter((d): d is PopulationData["distributions"][0] => d !== undefined)
      .map(d => ({
        dimension: d.dimension,
        distribution: d.categories.map(c => ({
          category: c.category,
          percentage: c.percentage
        }))
      }))
  }

  // Admin: Create new dataset
  async createDataset(
    input: {
      countryCode: string
      name: string
      source: string
      sourceUrl?: string
      year: number
      distributions: Array<{
        dimension: string
        category: string
        percentage: number
        population?: bigint
      }>
    },
    adminId: string
  ): Promise<string> {
    // Validate percentages sum to ~100% per dimension
    const byDimension = new Map<string, number>()
    for (const dist of input.distributions) {
      const current = byDimension.get(dist.dimension) || 0
      byDimension.set(dist.dimension, current + dist.percentage)
    }

    for (const [dim, total] of byDimension) {
      if (Math.abs(total - 100) > 1) {
        throw new Error(`${dim} percentages sum to ${total}, expected ~100`)
      }
    }

    // Get next version for this country/year
    const [countResult] = await this.db.select({ count: sql<number>`count(*)` })
      .from(populationDatasets)
      .where(and(
        eq(populationDatasets.countryCode, input.countryCode),
        eq(populationDatasets.year, input.year)
      ))
    const existingVersions = countResult?.count ?? 0

    const [dataset] = await this.db.insert(populationDatasets).values({
      countryCode: input.countryCode,
      name: input.name,
      source: input.source,
      sourceUrl: input.sourceUrl,
      year: input.year,
      version: existingVersions + 1,
      createdBy: adminId,
    }).returning()

    // Insert distributions
    await this.db.insert(populationDistributions).values(
      input.distributions.map(d => ({
        datasetId: dataset.id,
        dimension: d.dimension,
        category: d.category,
        percentage: d.percentage,
        population: d.population
      }))
    )

    return dataset.id
  }

  // Admin: Activate dataset (deactivates others for same country)
  async activateDataset(datasetId: string): Promise<void> {
    const dataset = await this.db.select().from(populationDatasets)
      .where(eq(populationDatasets.id, datasetId))
      .then(r => r[0])

    if (!dataset) {
      throw new Error("Dataset not found")
    }

    await this.db.transaction(async (tx) => {
      // Deactivate all datasets for this country
      await tx.update(populationDatasets)
        .set({ isActive: false })
        .where(eq(populationDatasets.countryCode, dataset.countryCode))
      // Activate the specified dataset
      await tx.update(populationDatasets)
        .set({ isActive: true })
        .where(eq(populationDatasets.id, datasetId))
    })

    // Invalidate cache
    await this.redis.del(
      POPULATION_DATA_CONFIG.cache.activeKey(dataset.countryCode)
    )
  }

  // Fallback data (hardcoded, used only when DB unavailable)
  private getFallbackData(countryCode: string): PopulationData | null {
    const FALLBACK_DATA: Record<string, PopulationData> = {
      TR: {
        countryCode: "TR",
        name: "Turkey Fallback (TÜİK 2023 Estimate)",
        source: "Hardcoded Fallback",
        year: 2023,
        version: 0,
        distributions: [
          {
            dimension: "AGE_GROUP",
            categories: [
              { category: "18-24", percentage: 12.0 },
              { category: "25-34", percentage: 18.0 },
              { category: "35-44", percentage: 17.5 },
              { category: "45-54", percentage: 14.5 },
              { category: "55-64", percentage: 11.0 },
              { category: "65+", percentage: 9.5 },
              { category: "UNDER_18", percentage: 17.5 }
            ]
          },
          {
            dimension: "GENDER",
            categories: [
              { category: "MALE", percentage: 49.9 },
              { category: "FEMALE", percentage: 50.1 }
            ]
          },
          {
            dimension: "REGION",
            categories: [
              { category: "MARMARA", percentage: 31.0 },
              { category: "IC_ANADOLU", percentage: 15.5 },
              { category: "EGE", percentage: 12.5 },
              { category: "AKDENIZ", percentage: 12.0 },
              { category: "KARADENIZ", percentage: 8.5 },
              { category: "GUNEYDOGU", percentage: 10.5 },
              { category: "DOGU", percentage: 10.0 }
            ]
          }
        ]
      }
    }

    return FALLBACK_DATA[countryCode] || null
  }

  private transformDataset(dataset: any): PopulationData {
    const distributionsByDimension = new Map<string, Array<{ category: string; percentage: number }>>()

    for (const dist of dataset.distributions) {
      if (!distributionsByDimension.has(dist.dimension)) {
        distributionsByDimension.set(dist.dimension, [])
      }
      distributionsByDimension.get(dist.dimension)!.push({
        category: dist.category,
        percentage: dist.percentage
      })
    }

    return {
      countryCode: dataset.countryCode,
      name: dataset.name,
      source: dataset.source,
      year: dataset.year,
      version: dataset.version,
      distributions: Array.from(distributionsByDimension.entries()).map(
        ([dimension, categories]) => ({ dimension, categories })
      )
    }
  }
}

export { PopulationDataService, PopulationData, POPULATION_DATA_CONFIG }
```


## 20.10.4 Admin API for Population Data

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ADMIN API - Population Data Management
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/population-data
// Returns all datasets with pagination
async function listPopulationDatasets(
  countryCode?: string,
  page: number = 1,
  pageSize: number = 20
) {
  return db.select({
    dataset: populationDatasets,
    distributionCount: sql<number>`count(${populationDistributions.id})`
  })
    .from(populationDatasets)
    .leftJoin(populationDistributions, eq(populationDatasets.id, populationDistributions.datasetId))
    .where(countryCode ? eq(populationDatasets.countryCode, countryCode) : undefined)
    .groupBy(populationDatasets.id)
    .orderBy(asc(populationDatasets.countryCode), desc(populationDatasets.year), desc(populationDatasets.version))
    .offset((page - 1) * pageSize)
    .limit(pageSize)
}

// POST /api/admin/population-data
// Create new dataset from official source
async function createPopulationDataset(
  body: CreatePopulationDatasetInput,
  adminId: string
) {
  const service = new PopulationDataService(redis, db)
  return service.createDataset(body, adminId)
}

// POST /api/admin/population-data/:id/activate
// Activate dataset (makes it the default for its country)
async function activatePopulationDataset(datasetId: string) {
  const service = new PopulationDataService(redis, db)
  await service.activateDataset(datasetId)
  return { success: true }
}

// DELETE /api/admin/population-data/:id
// Soft delete (cannot delete active dataset)
async function deletePopulationDataset(datasetId: string) {
  const dataset = await db.select().from(populationDatasets)
    .where(eq(populationDatasets.id, datasetId))
    .then(r => r[0])

  if (dataset?.isActive) {
    throw new Error("Cannot delete active dataset. Activate another first.")
  }

  await db.update(populationDatasets)
    .set({ deletedAt: new Date() })
    .where(eq(populationDatasets.id, datasetId))

  return { success: true }
}
```


## 20.10.5 Usage in Weighting Calculations

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// UPDATED WEIGHTING CALCULATION - Uses externalized data
// ══════════════════════════════════════════════════════════════════════════════

async function calculateDemographicWeightsFromDB(
  surveyId: string,
  countryCode: string = "TR",
  dimensions: string[] = ["AGE_GROUP", "GENDER"]
): Promise<DemographicWeight[]> {
  const service = new PopulationDataService(redis, db)

  // Get population targets from database
  const populationTargets = await service.getWeightingTargets(
    countryCode,
    dimensions
  )

  // Get sample distribution from survey responses
  const sampleDistribution = await getSurveyDemographicDistribution(surveyId, dimensions)

  // Calculate weights using existing function
  return calculateDemographicWeights(sampleDistribution, populationTargets)
}

// The existing calculateDemographicWeights function remains unchanged
// It just receives data from DB instead of hardcoded constants
```




# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 20 - ENTERPRISE RESEARCH FRAMEWORK & DATA VALIDITY
# ══════════════════════════════════════════════════════════════════════════════
