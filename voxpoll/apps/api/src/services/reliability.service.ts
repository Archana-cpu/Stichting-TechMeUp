// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - RELIABILITY SCORING SERVICE
// Bible: 04-DATA/03-reliability-scoring.md, T-009
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ContentType = 'POLL' | 'SURVEY' | 'TEST'

export type ScoreLabel = 'Excellent' | 'Good' | 'Moderate' | 'Limited' | 'Low'

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'

export interface ReliabilityFactors {
  sampleQuality: {
    sampleSizeAdequacy: number
    responseRate: number | null
    demographicCoverage: number
  }
  responseQuality: {
    completionRate: number
    responseTimeValidity: number
    attentionCheckPassRate: number | null
  }
  methodology: {
    samplingMethod: number
    questionQuality: number
    pretestUsage: number
  }
  participantVerification: {
    userVerificationLevel: number
    fraudDetectionPassRate: number
  }
}

export interface ReliabilityScoreResult {
  overallScore: number
  categoryScores: {
    sampleQuality: number
    responseQuality: number
    methodology: number
    participantVerification: number
  }
  factors: ReliabilityFactors
  label: ScoreLabel
  confidenceLevel: ConfidenceLevel
}

interface ScoreMultipliers {
  sampleQuality: number
  responseQuality: number
  methodology: number
  participantVerification: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const WEIGHTS = {
  sampleQuality: {
    total: 0.35,
    sampleSizeAdequacy: 0.15,
    responseRate: 0.10,
    demographicCoverage: 0.10
  },
  responseQuality: {
    total: 0.30,
    completionRate: 0.10,
    responseTimeValidity: 0.10,
    attentionCheckPassRate: 0.10
  },
  methodology: {
    total: 0.20,
    samplingMethod: 0.08,
    questionQuality: 0.07,
    pretestUsage: 0.05
  },
  participantVerification: {
    total: 0.15,
    userVerificationLevel: 0.08,
    fraudDetectionPassRate: 0.07
  }
}

const CONTENT_TYPE_MULTIPLIERS: Record<ContentType, ScoreMultipliers> = {
  POLL: {
    sampleQuality: 0.9,
    responseQuality: 1.0,
    methodology: 0.8,
    participantVerification: 1.0
  },
  SURVEY: {
    sampleQuality: 1.1,
    responseQuality: 1.0,
    methodology: 1.1,
    participantVerification: 1.1
  },
  TEST: {
    sampleQuality: 0.8,
    responseQuality: 1.2,
    methodology: 1.0,
    participantVerification: 0.9
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function getScoreLabel(score: number): ScoreLabel {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 60) return 'Moderate'
  if (score >= 40) return 'Limited'
  return 'Low'
}

function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 75) return 'High'
  if (score >= 50) return 'Medium'
  return 'Low'
}

function scoreSampleSize(
  actualSampleSize: number,
  recommendedSampleSize: number
): number {
  if (actualSampleSize < 30) return 0

  const ratio = actualSampleSize / recommendedSampleSize

  if (ratio >= 1) return 100
  if (ratio >= 0.75) return 80 + (ratio - 0.75) * 80
  if (ratio >= 0.50) return 60 + (ratio - 0.50) * 80
  if (ratio >= 0.25) return 40 + (ratio - 0.25) * 80

  return 20 + (ratio / 0.25) * 20
}

function calculateCategoryScore(
  factors: Record<string, number | null>,
  weights: Record<string, number>
): number {
  let totalScore = 0
  let totalWeight = 0

  for (const [key, value] of Object.entries(factors)) {
    if (key === 'total') continue

    const weight = weights[key]
    if (!weight) continue

    if (value === null) {
      if (key === 'attentionCheckPassRate') {
        totalScore += 50 * weight
        totalWeight += weight
      }
      continue
    }

    totalScore += value * weight
    totalWeight += weight
  }

  if (totalWeight === 0) return 0

  return Math.round((totalScore / totalWeight) * 100) / 100
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Service Functions
// ─────────────────────────────────────────────────────────────────────────────

function calculateReliabilityScore(
  factors: ReliabilityFactors,
  contentType: ContentType = 'POLL'
): ReliabilityScoreResult {
  const sampleQualityScore = calculateCategoryScore(
    factors.sampleQuality,
    WEIGHTS.sampleQuality
  )

  const responseQualityScore = calculateCategoryScore(
    factors.responseQuality,
    WEIGHTS.responseQuality
  )

  const methodologyScore = calculateCategoryScore(
    factors.methodology,
    WEIGHTS.methodology
  )

  const participantVerificationScore = calculateCategoryScore(
    factors.participantVerification,
    WEIGHTS.participantVerification
  )

  const multipliers = CONTENT_TYPE_MULTIPLIERS[contentType]

  const overallScore = Math.round(
    sampleQualityScore * WEIGHTS.sampleQuality.total * multipliers.sampleQuality +
    responseQualityScore * WEIGHTS.responseQuality.total * multipliers.responseQuality +
    methodologyScore * WEIGHTS.methodology.total * multipliers.methodology +
    participantVerificationScore * WEIGHTS.participantVerification.total * multipliers.participantVerification
  )

  return {
    overallScore,
    categoryScores: {
      sampleQuality: Math.round(sampleQualityScore),
      responseQuality: Math.round(responseQualityScore),
      methodology: Math.round(methodologyScore),
      participantVerification: Math.round(participantVerificationScore)
    },
    factors,
    label: getScoreLabel(overallScore),
    confidenceLevel: getConfidenceLevel(overallScore)
  }
}

function calculateRecommendedSampleSize(
  populationSize: number | null,
  confidenceLevel: number = 95,
  marginOfError: number = 5
): number {
  const z = confidenceLevel === 99 ? 2.576 : confidenceLevel === 95 ? 1.96 : 1.645
  const p = 0.5

  if (populationSize === null || populationSize > 100000) {
    return Math.ceil((z * z * p * (1 - p)) / ((marginOfError / 100) * (marginOfError / 100)))
  }

  const n0 = (z * z * p * (1 - p)) / ((marginOfError / 100) * (marginOfError / 100))
  return Math.ceil(n0 / (1 + (n0 - 1) / populationSize))
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const reliabilityService = {
  calculateReliabilityScore,
  calculateRecommendedSampleSize,
  scoreSampleSize,
  getScoreLabel,
  getConfidenceLevel,
}
