// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL - RELIABILITY SCORE CALCULATOR
// Bible: 04-DATA, T-009
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ContentType = 'POLL' | 'SURVEY' | 'TEST'
export type SamplingMethod = 'PROBABILITY' | 'QUOTA' | 'PURPOSIVE' | 'CONVENIENCE' | 'UNKNOWN'
export type ScoreLabel = 'Excellent' | 'Good' | 'Moderate' | 'Limited' | 'Low'
export type ConfidenceLevel = 'High' | 'Medium' | 'Low'

export interface ReliabilityInput {
  contentType: ContentType

  sampleQuality: {
    actualSampleSize: number
    recommendedSampleSize: number
    responseRate?: number
    demographicCoveragePercent: number
  }

  responseQuality: {
    completionRate: number
    validResponsePercent: number
    attentionCheckPassRate?: number
  }

  methodology: {
    samplingMethod: SamplingMethod
    questionQualityIssues: number
    hasCriticalIssues: boolean
    pretestLayers: number
    hasEligibilityCriteria: boolean
  }

  participantVerification: {
    averageVerificationLevel: number
    fraudDetectionPassRate: number
  }
}

export interface ReliabilityFactors {
  sampleQuality: {
    sampleSizeAdequacy: number
    responseRate: number
    demographicCoverage: number
  }
  responseQuality: {
    completionRate: number
    responseTimeValidity: number
    attentionCheckPassRate: number
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
  meetsMinimum: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants - Base Weights (Bible T-009)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_WEIGHTS = {
  sampleQuality: {
    total: 0.35,
    sampleSizeAdequacy: 0.15,
    responseRate: 0.10,
    demographicCoverage: 0.10,
  },
  responseQuality: {
    total: 0.30,
    completionRate: 0.10,
    responseTimeValidity: 0.10,
    attentionCheckPassRate: 0.10,
  },
  methodology: {
    total: 0.20,
    samplingMethod: 0.08,
    questionQuality: 0.07,
    pretestUsage: 0.05,
  },
  participantVerification: {
    total: 0.15,
    userVerificationLevel: 0.08,
    fraudDetectionPassRate: 0.07,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Content-Type Adjusted Weights
// ─────────────────────────────────────────────────────────────────────────────

function getWeightsForContentType(contentType: ContentType) {
  const weights = structuredClone(BASE_WEIGHTS)

  if (contentType === 'POLL') {
    weights.sampleQuality.sampleSizeAdequacy = 0.12
    weights.sampleQuality.responseRate = 0.00
    weights.sampleQuality.demographicCoverage = 0.08
    weights.methodology.samplingMethod = 0.05
    weights.methodology.pretestUsage = 0.08
  } else if (contentType === 'SURVEY') {
    weights.sampleQuality.responseRate = 0.12
    weights.participantVerification.userVerificationLevel = 0.10
  } else if (contentType === 'TEST') {
    weights.sampleQuality.sampleSizeAdequacy = 0.10
    weights.responseQuality.completionRate = 0.15
  }

  return weights
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring Functions - Sample Quality
// ─────────────────────────────────────────────────────────────────────────────

function scoreSampleSize(actualSize: number, recommendedSize: number): number {
  if (actualSize < 30) return 0

  const ratio = actualSize / recommendedSize
  if (ratio >= 1) return 100
  if (ratio >= 0.75) return 80 + (ratio - 0.75) * 80
  if (ratio >= 0.50) return 60 + (ratio - 0.50) * 80
  if (ratio >= 0.25) return 40 + (ratio - 0.25) * 80
  return 20 + (ratio / 0.25) * 20
}

function scoreResponseRate(rate: number | undefined): number {
  if (rate === undefined) return 50

  if (rate >= 70) return 100
  if (rate >= 50) return 80
  if (rate >= 30) return 60
  if (rate >= 15) return 40
  return 20
}

function scoreDemographicCoverage(coveragePercent: number): number {
  if (coveragePercent >= 100) return 100
  if (coveragePercent >= 80) return 80
  if (coveragePercent >= 60) return 60
  if (coveragePercent >= 40) return 40
  return 20
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring Functions - Response Quality
// ─────────────────────────────────────────────────────────────────────────────

function scoreCompletionRate(rate: number): number {
  if (rate >= 95) return 100
  if (rate >= 85) return 85
  if (rate >= 75) return 70
  if (rate >= 60) return 50
  return 30
}

function scoreResponseTimeValidity(validPercent: number): number {
  if (validPercent >= 98) return 100
  if (validPercent >= 95) return 85
  if (validPercent >= 90) return 70
  if (validPercent >= 80) return 50
  return 30
}

function scoreAttentionCheckPassRate(rate: number | undefined): number {
  if (rate === undefined) return 50

  if (rate >= 95) return 100
  if (rate >= 90) return 85
  if (rate >= 85) return 70
  if (rate >= 75) return 50
  return 30
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring Functions - Methodology
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLING_METHOD_SCORES: Record<SamplingMethod, number> = {
  PROBABILITY: 100,
  QUOTA: 75,
  PURPOSIVE: 60,
  CONVENIENCE: 40,
  UNKNOWN: 20,
}

function scoreSamplingMethod(method: SamplingMethod): number {
  return SAMPLING_METHOD_SCORES[method]
}

function scoreQuestionQuality(issues: number, hasCriticalIssues: boolean): number {
  if (hasCriticalIssues) return 20
  if (issues === 0) return 100
  if (issues <= 2) return issues === 1 ? 80 : 60
  return 40
}

function scorePretestUsage(layers: number, hasEligibilityCriteria: boolean): number {
  if (layers >= 3) return 100
  if (layers === 2) return 80
  if (layers === 1) return 60
  if (hasEligibilityCriteria) return 40
  return 20
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring Functions - Participant Verification
// ─────────────────────────────────────────────────────────────────────────────

function scoreUserVerificationLevel(avgLevel: number): number {
  if (avgLevel >= 3.5) return 100
  if (avgLevel >= 2.5) return 80
  if (avgLevel >= 1.5) return 60
  if (avgLevel >= 0.5) return 40
  return 20
}

function scoreFraudDetectionPassRate(rate: number): number {
  if (rate >= 99) return 100
  if (rate >= 97) return 85
  if (rate >= 95) return 70
  if (rate >= 90) return 50
  return 30
}

// ─────────────────────────────────────────────────────────────────────────────
// Label & Confidence Functions
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Calculator Function
// ─────────────────────────────────────────────────────────────────────────────

export function calculateReliabilityScore(input: ReliabilityInput): ReliabilityScoreResult {
  const weights = getWeightsForContentType(input.contentType)

  const factors: ReliabilityFactors = {
    sampleQuality: {
      sampleSizeAdequacy: scoreSampleSize(
        input.sampleQuality.actualSampleSize,
        input.sampleQuality.recommendedSampleSize
      ),
      responseRate: scoreResponseRate(input.sampleQuality.responseRate),
      demographicCoverage: scoreDemographicCoverage(
        input.sampleQuality.demographicCoveragePercent
      ),
    },
    responseQuality: {
      completionRate: scoreCompletionRate(input.responseQuality.completionRate),
      responseTimeValidity: scoreResponseTimeValidity(
        input.responseQuality.validResponsePercent
      ),
      attentionCheckPassRate: scoreAttentionCheckPassRate(
        input.responseQuality.attentionCheckPassRate
      ),
    },
    methodology: {
      samplingMethod: scoreSamplingMethod(input.methodology.samplingMethod),
      questionQuality: scoreQuestionQuality(
        input.methodology.questionQualityIssues,
        input.methodology.hasCriticalIssues
      ),
      pretestUsage: scorePretestUsage(
        input.methodology.pretestLayers,
        input.methodology.hasEligibilityCriteria
      ),
    },
    participantVerification: {
      userVerificationLevel: scoreUserVerificationLevel(
        input.participantVerification.averageVerificationLevel
      ),
      fraudDetectionPassRate: scoreFraudDetectionPassRate(
        input.participantVerification.fraudDetectionPassRate
      ),
    },
  }

  const sampleQualityScore =
    (factors.sampleQuality.sampleSizeAdequacy * weights.sampleQuality.sampleSizeAdequacy +
      factors.sampleQuality.responseRate * weights.sampleQuality.responseRate +
      factors.sampleQuality.demographicCoverage * weights.sampleQuality.demographicCoverage) /
    weights.sampleQuality.total

  const responseQualityScore =
    (factors.responseQuality.completionRate * weights.responseQuality.completionRate +
      factors.responseQuality.responseTimeValidity * weights.responseQuality.responseTimeValidity +
      factors.responseQuality.attentionCheckPassRate * weights.responseQuality.attentionCheckPassRate) /
    weights.responseQuality.total

  const methodologyScore =
    (factors.methodology.samplingMethod * weights.methodology.samplingMethod +
      factors.methodology.questionQuality * weights.methodology.questionQuality +
      factors.methodology.pretestUsage * weights.methodology.pretestUsage) /
    weights.methodology.total

  const participantVerificationScore =
    (factors.participantVerification.userVerificationLevel * weights.participantVerification.userVerificationLevel +
      factors.participantVerification.fraudDetectionPassRate * weights.participantVerification.fraudDetectionPassRate) /
    weights.participantVerification.total

  const overallScore = Math.round(
    sampleQualityScore * weights.sampleQuality.total +
    responseQualityScore * weights.responseQuality.total +
    methodologyScore * weights.methodology.total +
    participantVerificationScore * weights.participantVerification.total
  )

  const meetsMinimum =
    input.sampleQuality.actualSampleSize >= 30 &&
    input.participantVerification.fraudDetectionPassRate >= 90

  return {
    overallScore: meetsMinimum ? overallScore : 0,
    categoryScores: {
      sampleQuality: Math.round(sampleQualityScore),
      responseQuality: Math.round(responseQualityScore),
      methodology: Math.round(methodologyScore),
      participantVerification: Math.round(participantVerificationScore),
    },
    factors,
    label: meetsMinimum ? getScoreLabel(overallScore) : 'Low',
    confidenceLevel: meetsMinimum ? getConfidenceLevel(overallScore) : 'Low',
    meetsMinimum,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommended Sample Size Calculator (95% CI, ±5% margin)
// ─────────────────────────────────────────────────────────────────────────────

export function calculateRecommendedSampleSize(
  populationSize?: number,
  confidenceLevel: number = 0.95,
  marginOfError: number = 0.05
): number {
  const zScores: Record<number, number> = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  }

  const z = zScores[confidenceLevel] ?? 1.96
  const p = 0.5

  const infiniteSampleSize = Math.ceil((z * z * p * (1 - p)) / (marginOfError * marginOfError))

  if (!populationSize || populationSize >= 100000) {
    return infiniteSampleSize
  }

  return Math.ceil(infiniteSampleSize / (1 + (infiniteSampleSize - 1) / populationSize))
}
