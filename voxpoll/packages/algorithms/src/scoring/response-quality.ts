// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL - RESPONSE QUALITY SCORE CALCULATOR
// Bible: 04-DATA, P-055
// Per-response quality scoring for individual poll/survey responses
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type QualityLevel = 'High' | 'Medium' | 'Low' | 'Flagged'

export interface ResponseQualityInput {
  responseTimeSeconds: number
  expectedMinTimeSeconds: number
  expectedMaxTimeSeconds: number

  completionPercent: number

  attentionChecksPassed: number
  attentionChecksTotal: number

  consistencyScore?: number

  verificationLevel: number

  deviceCategory: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  isKnownBot: boolean
  hasValidFingerprint: boolean
}

export interface ResponseQualityResult {
  overallScore: number
  qualityLevel: QualityLevel
  factors: {
    timing: number
    completion: number
    attentionChecks: number
    consistency: number
    verification: number
    device: number
  }
  flags: ResponseQualityFlag[]
  isUsable: boolean
}

export interface ResponseQualityFlag {
  type: 'speeder' | 'slowpoke' | 'straightliner' | 'incomplete' | 'attention_fail' | 'bot_suspected' | 'low_verification'
  severity: 'warning' | 'critical'
  description: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants - Weight Configuration
// ─────────────────────────────────────────────────────────────────────────────

const WEIGHTS = {
  timing: 0.25,
  completion: 0.20,
  attentionChecks: 0.20,
  consistency: 0.15,
  verification: 0.10,
  device: 0.10,
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring Functions
// ─────────────────────────────────────────────────────────────────────────────

function scoreTiming(
  actualTime: number,
  minExpected: number,
  maxExpected: number
): { score: number; flag?: ResponseQualityFlag } {
  const speederThreshold = minExpected * 0.3
  const slowpokeThreshold = maxExpected * 3

  if (actualTime < speederThreshold) {
    return {
      score: 0,
      flag: {
        type: 'speeder',
        severity: 'critical',
        description: `Response completed in ${actualTime}s, expected minimum ${minExpected}s`,
      },
    }
  }

  if (actualTime < minExpected) {
    const ratio = actualTime / minExpected
    return {
      score: Math.round(ratio * 60),
      flag: {
        type: 'speeder',
        severity: 'warning',
        description: `Response time below expected minimum`,
      },
    }
  }

  if (actualTime > slowpokeThreshold) {
    return {
      score: 50,
      flag: {
        type: 'slowpoke',
        severity: 'warning',
        description: `Response took unusually long (${Math.round(actualTime / 60)} minutes)`,
      },
    }
  }

  if (actualTime > maxExpected) {
    const overageRatio = (actualTime - maxExpected) / (slowpokeThreshold - maxExpected)
    return { score: Math.round(100 - overageRatio * 50) }
  }

  return { score: 100 }
}

function scoreCompletion(completionPercent: number): { score: number; flag?: ResponseQualityFlag } {
  if (completionPercent < 50) {
    return {
      score: 0,
      flag: {
        type: 'incomplete',
        severity: 'critical',
        description: `Only ${completionPercent}% completed`,
      },
    }
  }

  if (completionPercent < 80) {
    return {
      score: Math.round(completionPercent * 0.6),
      flag: {
        type: 'incomplete',
        severity: 'warning',
        description: `Response ${completionPercent}% complete`,
      },
    }
  }

  if (completionPercent < 100) {
    return { score: Math.round(60 + (completionPercent - 80) * 2) }
  }

  return { score: 100 }
}

function scoreAttentionChecks(
  passed: number,
  total: number
): { score: number; flag?: ResponseQualityFlag } {
  if (total === 0) {
    return { score: 70 }
  }

  const passRate = passed / total

  if (passRate < 0.5) {
    return {
      score: 0,
      flag: {
        type: 'attention_fail',
        severity: 'critical',
        description: `Failed ${total - passed} of ${total} attention checks`,
      },
    }
  }

  if (passRate < 0.75) {
    return {
      score: Math.round(passRate * 60),
      flag: {
        type: 'attention_fail',
        severity: 'warning',
        description: `Failed ${total - passed} of ${total} attention checks`,
      },
    }
  }

  return { score: Math.round(passRate * 100) }
}

function scoreConsistency(consistencyScore: number | undefined): { score: number; flag?: ResponseQualityFlag } {
  if (consistencyScore === undefined) {
    return { score: 70 }
  }

  if (consistencyScore < 30) {
    return {
      score: consistencyScore,
      flag: {
        type: 'straightliner',
        severity: 'warning',
        description: 'Response shows potential straightlining pattern',
      },
    }
  }

  return { score: consistencyScore }
}

function scoreVerification(level: number): { score: number; flag?: ResponseQualityFlag } {
  const verificationScores: Record<number, number> = {
    0: 30,
    1: 50,
    2: 70,
    3: 90,
    4: 100,
  }

  const score = verificationScores[level] ?? 30

  if (level === 0) {
    return {
      score,
      flag: {
        type: 'low_verification',
        severity: 'warning',
        description: 'Respondent has no verification',
      },
    }
  }

  return { score }
}

function scoreDevice(
  category: ResponseQualityInput['deviceCategory'],
  isKnownBot: boolean,
  hasValidFingerprint: boolean
): { score: number; flag?: ResponseQualityFlag } {
  if (isKnownBot) {
    return {
      score: 0,
      flag: {
        type: 'bot_suspected',
        severity: 'critical',
        description: 'Response from known bot pattern',
      },
    }
  }

  if (!hasValidFingerprint) {
    return {
      score: 40,
      flag: {
        type: 'bot_suspected',
        severity: 'warning',
        description: 'Unable to verify device fingerprint',
      },
    }
  }

  const categoryScores: Record<typeof category, number> = {
    desktop: 100,
    mobile: 95,
    tablet: 90,
    unknown: 60,
  }

  return { score: categoryScores[category] }
}

// ─────────────────────────────────────────────────────────────────────────────
// Quality Level Determination
// ─────────────────────────────────────────────────────────────────────────────

function getQualityLevel(score: number, flags: ResponseQualityFlag[]): QualityLevel {
  const hasCriticalFlag = flags.some(f => f.severity === 'critical')

  if (hasCriticalFlag) return 'Flagged'
  if (score >= 80) return 'High'
  if (score >= 60) return 'Medium'
  return 'Low'
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Calculator Function
// ─────────────────────────────────────────────────────────────────────────────

export function calculateResponseQuality(input: ResponseQualityInput): ResponseQualityResult {
  const flags: ResponseQualityFlag[] = []

  const timingResult = scoreTiming(
    input.responseTimeSeconds,
    input.expectedMinTimeSeconds,
    input.expectedMaxTimeSeconds
  )
  if (timingResult.flag) flags.push(timingResult.flag)

  const completionResult = scoreCompletion(input.completionPercent)
  if (completionResult.flag) flags.push(completionResult.flag)

  const attentionResult = scoreAttentionChecks(
    input.attentionChecksPassed,
    input.attentionChecksTotal
  )
  if (attentionResult.flag) flags.push(attentionResult.flag)

  const consistencyResult = scoreConsistency(input.consistencyScore)
  if (consistencyResult.flag) flags.push(consistencyResult.flag)

  const verificationResult = scoreVerification(input.verificationLevel)
  if (verificationResult.flag) flags.push(verificationResult.flag)

  const deviceResult = scoreDevice(
    input.deviceCategory,
    input.isKnownBot,
    input.hasValidFingerprint
  )
  if (deviceResult.flag) flags.push(deviceResult.flag)

  const overallScore = Math.round(
    timingResult.score * WEIGHTS.timing +
    completionResult.score * WEIGHTS.completion +
    attentionResult.score * WEIGHTS.attentionChecks +
    consistencyResult.score * WEIGHTS.consistency +
    verificationResult.score * WEIGHTS.verification +
    deviceResult.score * WEIGHTS.device
  )

  const qualityLevel = getQualityLevel(overallScore, flags)

  const hasCriticalFlag = flags.some(f => f.severity === 'critical')
  const isUsable = !hasCriticalFlag && overallScore >= 40

  return {
    overallScore,
    qualityLevel,
    factors: {
      timing: timingResult.score,
      completion: completionResult.score,
      attentionChecks: attentionResult.score,
      consistency: consistencyResult.score,
      verification: verificationResult.score,
      device: deviceResult.score,
    },
    flags,
    isUsable,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch Quality Analysis
// ─────────────────────────────────────────────────────────────────────────────

export interface BatchQualityStats {
  totalResponses: number
  usableResponses: number
  usablePercent: number
  averageScore: number
  qualityDistribution: Record<QualityLevel, number>
  flagCounts: Record<string, number>
}

export function analyzeBatchQuality(results: ResponseQualityResult[]): BatchQualityStats {
  if (results.length === 0) {
    return {
      totalResponses: 0,
      usableResponses: 0,
      usablePercent: 0,
      averageScore: 0,
      qualityDistribution: { High: 0, Medium: 0, Low: 0, Flagged: 0 },
      flagCounts: {},
    }
  }

  const usableResponses = results.filter(r => r.isUsable).length
  const averageScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length

  const qualityDistribution: Record<QualityLevel, number> = {
    High: 0,
    Medium: 0,
    Low: 0,
    Flagged: 0,
  }

  const flagCounts: Record<string, number> = {}

  for (const result of results) {
    qualityDistribution[result.qualityLevel]++

    for (const flag of result.flags) {
      flagCounts[flag.type] = (flagCounts[flag.type] || 0) + 1
    }
  }

  return {
    totalResponses: results.length,
    usableResponses,
    usablePercent: Math.round((usableResponses / results.length) * 100),
    averageScore: Math.round(averageScore),
    qualityDistribution,
    flagCounts,
  }
}
