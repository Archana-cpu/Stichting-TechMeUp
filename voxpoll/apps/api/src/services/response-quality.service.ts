// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - RESPONSE QUALITY SCORING SERVICE
// Bible: 04-DATA/02-quality-scoring.md, P-055
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface QuestionResponse {
  questionId: string
  value: number | string
  timeSpentMs: number
}

export interface ResponseQualityInput {
  responses: QuestionResponse[]
  totalTimeMs: number
  expectedMinTimeMs: number
  expectedMaxTimeMs: number
  attentionChecksPassed: number
  attentionChecksTotal: number
}

export interface ResponseQualityScore {
  overallScore: number
  components: {
    timing: number
    consistency: number
    engagement: number
    attentionChecks: number
  }
  flags: string[]
  recommendation: 'INCLUDE' | 'REVIEW' | 'EXCLUDE'
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const QUALITY_WEIGHTS = {
  timing: 0.25,
  consistency: 0.25,
  engagement: 0.25,
  attentionChecks: 0.25,
}

export const QUALITY_THRESHOLDS = {
  include: 70,
  review: 40,
}

const SPEEDING_THRESHOLDS = {
  WARNING_MULTIPLIER: 0.5,
  CRITICAL_MULTIPLIER: 0.3,
}

const CONSISTENCY_THRESHOLDS = {
  MIN_RESPONSES_FOR_DETECTION: 5,
  LOW_VARIANCE_THRESHOLD: 0.5,
  STRAIGHT_LINE_RATIO: 0.8,
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function scoreTimingComponent(
  actualTimeMs: number,
  expectedMinTimeMs: number,
  expectedMaxTimeMs: number
): { score: number; flag: string | null } {
  const actualTimeSec = actualTimeMs / 1000
  const expectedMinTimeSec = expectedMinTimeMs / 1000
  const expectedMaxTimeSec = expectedMaxTimeMs / 1000

  const speedRatio = actualTimeMs / expectedMinTimeMs

  if (speedRatio < SPEEDING_THRESHOLDS.CRITICAL_MULTIPLIER) {
    return {
      score: 0,
      flag: 'SPEEDING',
    }
  }

  if (speedRatio < SPEEDING_THRESHOLDS.WARNING_MULTIPLIER) {
    const speedScore = Math.round(speedRatio / SPEEDING_THRESHOLDS.WARNING_MULTIPLIER * 50)
    return {
      score: speedScore,
      flag: 'SPEEDING',
    }
  }

  if (actualTimeMs <= expectedMaxTimeMs) {
    return { score: 100, flag: null }
  }

  const slowpokeThreshold = expectedMaxTimeMs * 3
  if (actualTimeMs > slowpokeThreshold) {
    return {
      score: 50,
      flag: 'EXTREME_SLOWNESS',
    }
  }

  const overageRatio = (actualTimeMs - expectedMaxTimeMs) / (slowpokeThreshold - expectedMaxTimeMs)
  const score = Math.round(100 - overageRatio * 50)

  return { score, flag: null }
}

function scoreConsistencyComponent(
  responses: QuestionResponse[]
): { score: number; flag: string | null } {
  const numericResponses = responses
    .filter(r => typeof r.value === 'number')
    .map(r => r.value as number)

  if (numericResponses.length < CONSISTENCY_THRESHOLDS.MIN_RESPONSES_FOR_DETECTION) {
    return { score: 70, flag: null }
  }

  const mean = numericResponses.reduce((a, b) => a + b, 0) / numericResponses.length
  const variance =
    numericResponses.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    numericResponses.length

  let maxConsecutive = 1
  let currentConsecutive = 1
  let currentValue = numericResponses[0]

  for (let i = 1; i < numericResponses.length; i++) {
    if (numericResponses[i] === currentValue) {
      currentConsecutive++
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
    } else {
      currentValue = numericResponses[i]
      currentConsecutive = 1
    }
  }

  const straightLineRatio = maxConsecutive / numericResponses.length

  if (
    variance < CONSISTENCY_THRESHOLDS.LOW_VARIANCE_THRESHOLD ||
    straightLineRatio >= CONSISTENCY_THRESHOLDS.STRAIGHT_LINE_RATIO
  ) {
    const penaltyScore = Math.max(0, Math.round(variance * 50))
    return {
      score: penaltyScore,
      flag: 'STRAIGHT_LINING',
    }
  }

  const maxExpectedVariance = 4
  const normalizedVariance = Math.min(variance, maxExpectedVariance) / maxExpectedVariance
  const consistencyScore = Math.round(normalizedVariance * 100)

  return { score: consistencyScore, flag: null }
}

function scoreEngagementComponent(
  responses: QuestionResponse[]
): { score: number; flag: string | null } {
  if (responses.length === 0) {
    return { score: 0, flag: 'RANDOM_CLICKING' }
  }

  let engagementScore = 100
  const flags: string[] = []

  const avgTimePerQuestion =
    responses.reduce((sum, r) => sum + r.timeSpentMs, 0) / responses.length

  if (avgTimePerQuestion < 2000) {
    engagementScore -= 30
    flags.push('RANDOM_CLICKING')
  }

  const textResponses = responses.filter(r => typeof r.value === 'string')
  if (textResponses.length > 0) {
    let gibberishCount = 0

    for (const response of textResponses) {
      const text = String(response.value).toLowerCase()

      if (text.length < 10) {
        gibberishCount++
        continue
      }

      const consonants = (text.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length
      const vowels = (text.match(/[aeiou]/g) || []).length
      const letters = consonants + vowels

      if (letters > 0) {
        const vowelRatio = vowels / letters
        if (vowelRatio < 0.15) {
          gibberishCount++
          continue
        }
      }

      const repeatedChars = text.match(/(.)\1{4,}/g)
      if (repeatedChars && repeatedChars.length > 0) {
        gibberishCount++
      }
    }

    const gibberishRatio = gibberishCount / textResponses.length
    if (gibberishRatio > 0.3) {
      engagementScore -= 40
      flags.push('GIBBERISH_TEXT')
    } else if (gibberishRatio > 0.1) {
      engagementScore -= 20
    }
  }

  const numericResponses = responses.filter(r => typeof r.value === 'number')
  if (numericResponses.length >= 5) {
    const values = numericResponses.map(r => r.value as number)
    const uniqueValues = new Set(values).size
    const diversityRatio = uniqueValues / values.length

    if (diversityRatio < 0.5) {
      engagementScore -= 20
    }
  }

  engagementScore = Math.max(0, engagementScore)

  return {
    score: engagementScore,
    flag: flags.length > 0 ? flags[0] : null,
  }
}

function scoreAttentionChecksComponent(
  passed: number,
  total: number
): { score: number; flag: string | null } {
  if (total === 0) {
    return { score: 70, flag: null }
  }

  const passRate = passed / total

  if (passRate < 0.5) {
    return {
      score: 0,
      flag: 'ATTENTION_CHECK_FAIL',
    }
  }

  if (passRate < 0.75) {
    return {
      score: Math.round(passRate * 60),
      flag: 'ATTENTION_CHECK_FAIL',
    }
  }

  return { score: Math.round(passRate * 100), flag: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Service Functions
// ─────────────────────────────────────────────────────────────────────────────

function calculateResponseQuality(input: ResponseQualityInput): ResponseQualityScore {
  const flags: string[] = []

  const timingResult = scoreTimingComponent(
    input.totalTimeMs,
    input.expectedMinTimeMs,
    input.expectedMaxTimeMs
  )
  if (timingResult.flag) flags.push(timingResult.flag)

  const consistencyResult = scoreConsistencyComponent(input.responses)
  if (consistencyResult.flag) flags.push(consistencyResult.flag)

  const engagementResult = scoreEngagementComponent(input.responses)
  if (engagementResult.flag) flags.push(engagementResult.flag)

  const attentionResult = scoreAttentionChecksComponent(
    input.attentionChecksPassed,
    input.attentionChecksTotal
  )
  if (attentionResult.flag) flags.push(attentionResult.flag)

  const overallScore = Math.round(
    timingResult.score * QUALITY_WEIGHTS.timing +
      consistencyResult.score * QUALITY_WEIGHTS.consistency +
      engagementResult.score * QUALITY_WEIGHTS.engagement +
      attentionResult.score * QUALITY_WEIGHTS.attentionChecks
  )

  let recommendation: 'INCLUDE' | 'REVIEW' | 'EXCLUDE'
  if (overallScore >= QUALITY_THRESHOLDS.include) {
    recommendation = 'INCLUDE'
  } else if (overallScore >= QUALITY_THRESHOLDS.review) {
    recommendation = 'REVIEW'
  } else {
    recommendation = 'EXCLUDE'
  }

  return {
    overallScore,
    components: {
      timing: timingResult.score,
      consistency: consistencyResult.score,
      engagement: engagementResult.score,
      attentionChecks: attentionResult.score,
    },
    flags,
    recommendation,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const responseQualityService = {
  calculateResponseQuality,
}
