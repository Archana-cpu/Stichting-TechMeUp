// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - RELIABILITY SCORING SERVICE TESTS
// Bible: 04-DATA/03-reliability-scoring.md, T-009, P-055
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest'
import { reliabilityService, WEIGHTS, type ReliabilityFactors } from './reliability.service'

// ─────────────────────────────────────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────────────────────────────────────

const perfectFactors: ReliabilityFactors = {
  sampleQuality: {
    sampleSizeAdequacy: 100,
    responseRate: 100,
    demographicCoverage: 100,
  },
  responseQuality: {
    completionRate: 100,
    responseTimeValidity: 100,
    attentionCheckPassRate: 100,
  },
  methodology: {
    samplingMethod: 100,
    questionQuality: 100,
    pretestUsage: 100,
  },
  participantVerification: {
    userVerificationLevel: 100,
    fraudDetectionPassRate: 100,
  },
}

const moderateFactors: ReliabilityFactors = {
  sampleQuality: {
    sampleSizeAdequacy: 60,
    responseRate: 70,
    demographicCoverage: 65,
  },
  responseQuality: {
    completionRate: 75,
    responseTimeValidity: 80,
    attentionCheckPassRate: 70,
  },
  methodology: {
    samplingMethod: 60,
    questionQuality: 80,
    pretestUsage: 40,
  },
  participantVerification: {
    userVerificationLevel: 60,
    fraudDetectionPassRate: 85,
  },
}

const poorFactors: ReliabilityFactors = {
  sampleQuality: {
    sampleSizeAdequacy: 20,
    responseRate: 30,
    demographicCoverage: 20,
  },
  responseQuality: {
    completionRate: 30,
    responseTimeValidity: 40,
    attentionCheckPassRate: 30,
  },
  methodology: {
    samplingMethod: 20,
    questionQuality: 40,
    pretestUsage: 20,
  },
  participantVerification: {
    userVerificationLevel: 20,
    fraudDetectionPassRate: 50,
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// Score Label Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('ReliabilityService - Score Labels', () => {
  it('[BIBLE T-009] should return "Excellent" for score >= 90', () => {
    const label = reliabilityService.getScoreLabel(95)
    expect(label).toBe('Excellent')
  })

  it('[BIBLE T-009] should return "Good" for score 75-89', () => {
    expect(reliabilityService.getScoreLabel(75)).toBe('Good')
    expect(reliabilityService.getScoreLabel(80)).toBe('Good')
    expect(reliabilityService.getScoreLabel(89)).toBe('Good')
  })

  it('[BIBLE T-009] should return "Moderate" for score 60-74', () => {
    expect(reliabilityService.getScoreLabel(60)).toBe('Moderate')
    expect(reliabilityService.getScoreLabel(67)).toBe('Moderate')
    expect(reliabilityService.getScoreLabel(74)).toBe('Moderate')
  })

  it('[BIBLE T-009] should return "Limited" for score 40-59', () => {
    expect(reliabilityService.getScoreLabel(40)).toBe('Limited')
    expect(reliabilityService.getScoreLabel(50)).toBe('Limited')
    expect(reliabilityService.getScoreLabel(59)).toBe('Limited')
  })

  it('[BIBLE T-009] should return "Low" for score < 40', () => {
    expect(reliabilityService.getScoreLabel(0)).toBe('Low')
    expect(reliabilityService.getScoreLabel(25)).toBe('Low')
    expect(reliabilityService.getScoreLabel(39)).toBe('Low')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Confidence Level Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('ReliabilityService - Confidence Levels', () => {
  it('[BIBLE T-009] should return "High" confidence for score >= 75', () => {
    expect(reliabilityService.getConfidenceLevel(75)).toBe('High')
    expect(reliabilityService.getConfidenceLevel(85)).toBe('High')
    expect(reliabilityService.getConfidenceLevel(100)).toBe('High')
  })

  it('[BIBLE T-009] should return "Medium" confidence for score 50-74', () => {
    expect(reliabilityService.getConfidenceLevel(50)).toBe('Medium')
    expect(reliabilityService.getConfidenceLevel(60)).toBe('Medium')
    expect(reliabilityService.getConfidenceLevel(74)).toBe('Medium')
  })

  it('[BIBLE T-009] should return "Low" confidence for score < 50', () => {
    expect(reliabilityService.getConfidenceLevel(0)).toBe('Low')
    expect(reliabilityService.getConfidenceLevel(30)).toBe('Low')
    expect(reliabilityService.getConfidenceLevel(49)).toBe('Low')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Sample Size Scoring Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('ReliabilityService - Sample Size Scoring', () => {
  it('[BIBLE T-009] should return 100 when n >= recommended', () => {
    const score = reliabilityService.scoreSampleSize(400, 385)
    expect(score).toBe(100)
  })

  it('[BIBLE T-009] should return 0 when n < 30 (absolute minimum)', () => {
    const score = reliabilityService.scoreSampleSize(25, 385)
    expect(score).toBe(0)
  })

  it('[BIBLE T-009] should score >= 80 when n >= 75% of recommended', () => {
    const score = reliabilityService.scoreSampleSize(300, 385)
    expect(score).toBeGreaterThanOrEqual(80)
  })

  it('[BIBLE T-009] should score >= 60 when n >= 50% of recommended', () => {
    const score = reliabilityService.scoreSampleSize(200, 385)
    expect(score).toBeGreaterThanOrEqual(60)
  })

  it('[BIBLE T-009] should score >= 40 when n >= 25% of recommended', () => {
    const score = reliabilityService.scoreSampleSize(100, 385)
    expect(score).toBeGreaterThanOrEqual(40)
  })

  it('[BIBLE T-009] should score >= 20 when n < 25% but >= 30', () => {
    const score = reliabilityService.scoreSampleSize(50, 385)
    expect(score).toBeGreaterThanOrEqual(20)
    expect(score).toBeLessThan(40)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Recommended Sample Size Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('ReliabilityService - Recommended Sample Size', () => {
  it('[BIBLE T-009] should calculate sample size for infinite population (95% CI, +-5%)', () => {
    const size = reliabilityService.calculateRecommendedSampleSize(null, 95, 5)
    expect(size).toBe(385)
  })

  it('[BIBLE T-009] should calculate sample size for large population (>100k)', () => {
    const size = reliabilityService.calculateRecommendedSampleSize(150000, 95, 5)
    expect(size).toBe(385)
  })

  it('[BIBLE T-009] should calculate sample size for finite population', () => {
    const size = reliabilityService.calculateRecommendedSampleSize(5000, 95, 5)
    expect(size).toBeLessThan(385)
    expect(size).toBeGreaterThan(300)
  })

  it('[BIBLE T-009] should support 99% confidence level', () => {
    const size95 = reliabilityService.calculateRecommendedSampleSize(null, 95, 5)
    const size99 = reliabilityService.calculateRecommendedSampleSize(null, 99, 5)
    expect(size99).toBeGreaterThan(size95)
  })

  it('[BIBLE T-009] should support different margin of error', () => {
    const size5 = reliabilityService.calculateRecommendedSampleSize(null, 95, 5)
    const size3 = reliabilityService.calculateRecommendedSampleSize(null, 95, 3)
    expect(size3).toBeGreaterThan(size5)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Overall Score Calculation Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('ReliabilityService - Overall Score Calculation', () => {
  it('[BIBLE T-009] should return 93 for perfect factors with POLL (default)', () => {
    const result = reliabilityService.calculateReliabilityScore(perfectFactors)
    expect(result.overallScore).toBe(93)
    expect(result.label).toBe('Excellent')
    expect(result.confidenceLevel).toBe('High')
  })

  it('[BIBLE T-009] should return >100 for perfect factors with SURVEY multipliers', () => {
    const result = reliabilityService.calculateReliabilityScore(perfectFactors, 'SURVEY')
    expect(result.overallScore).toBeGreaterThanOrEqual(100)
    expect(result.label).toBe('Excellent')
  })

  it('[BIBLE T-009] should calculate moderate score correctly', () => {
    const result = reliabilityService.calculateReliabilityScore(moderateFactors)
    expect(result.overallScore).toBeGreaterThanOrEqual(60)
    expect(result.overallScore).toBeLessThan(75)
    expect(result.label).toBe('Moderate')
  })

  it('[BIBLE T-009] should calculate low score correctly', () => {
    const result = reliabilityService.calculateReliabilityScore(poorFactors)
    expect(result.overallScore).toBeLessThan(40)
    expect(result.label).toBe('Low')
    expect(result.confidenceLevel).toBe('Low')
  })

  it('[BIBLE T-009] should include all category scores in result', () => {
    const result = reliabilityService.calculateReliabilityScore(perfectFactors)
    expect(result.categoryScores.sampleQuality).toBe(100)
    expect(result.categoryScores.responseQuality).toBe(100)
    expect(result.categoryScores.methodology).toBe(100)
    expect(result.categoryScores.participantVerification).toBe(100)
  })

  it('[BIBLE T-009] should preserve original factors in result', () => {
    const result = reliabilityService.calculateReliabilityScore(moderateFactors)
    expect(result.factors).toEqual(moderateFactors)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Weighting Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('ReliabilityService - Weighting (Bible T-009)', () => {
  it('[BIBLE T-009] should apply correct weights: Sample 35%, Response 30%, Method 20%, Verify 15%', () => {
    expect(WEIGHTS.sampleQuality.total).toBe(0.35)
    expect(WEIGHTS.responseQuality.total).toBe(0.30)
    expect(WEIGHTS.methodology.total).toBe(0.20)
    expect(WEIGHTS.participantVerification.total).toBe(0.15)
  })

  it('[BIBLE T-009] should have sub-weights sum to category total', () => {
    const sampleSum = WEIGHTS.sampleQuality.sampleSizeAdequacy +
                      WEIGHTS.sampleQuality.responseRate +
                      WEIGHTS.sampleQuality.demographicCoverage
    expect(sampleSum).toBeCloseTo(WEIGHTS.sampleQuality.total, 2)

    const responseSum = WEIGHTS.responseQuality.completionRate +
                        WEIGHTS.responseQuality.responseTimeValidity +
                        WEIGHTS.responseQuality.attentionCheckPassRate
    expect(responseSum).toBeCloseTo(WEIGHTS.responseQuality.total, 2)

    const methodologySum = WEIGHTS.methodology.samplingMethod +
                           WEIGHTS.methodology.questionQuality +
                           WEIGHTS.methodology.pretestUsage
    expect(methodologySum).toBeCloseTo(WEIGHTS.methodology.total, 2)

    const verifySum = WEIGHTS.participantVerification.userVerificationLevel +
                      WEIGHTS.participantVerification.fraudDetectionPassRate
    expect(verifySum).toBeCloseTo(WEIGHTS.participantVerification.total, 2)
  })

  it('[BIBLE T-009] should have all category weights sum to 100%', () => {
    const totalWeight = WEIGHTS.sampleQuality.total +
                       WEIGHTS.responseQuality.total +
                       WEIGHTS.methodology.total +
                       WEIGHTS.participantVerification.total
    expect(totalWeight).toBeCloseTo(1.0, 2)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Content Type Multipliers Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('ReliabilityService - Content Type Adjustments', () => {
  it('[BIBLE T-009] should apply POLL multipliers (lower methodology weight)', () => {
    const resultPoll = reliabilityService.calculateReliabilityScore(perfectFactors, 'POLL')
    const resultSurvey = reliabilityService.calculateReliabilityScore(perfectFactors, 'SURVEY')
    expect(resultPoll.overallScore).toBeLessThanOrEqual(resultSurvey.overallScore)
  })

  it('[BIBLE T-009] should apply SURVEY multipliers (higher standards)', () => {
    const resultSurvey = reliabilityService.calculateReliabilityScore(perfectFactors, 'SURVEY')
    expect(resultSurvey.overallScore).toBeGreaterThanOrEqual(100)
  })

  it('[BIBLE T-009] should apply TEST multipliers (response quality focus)', () => {
    const testFactors: ReliabilityFactors = {
      ...perfectFactors,
      sampleQuality: {
        sampleSizeAdequacy: 50,
        responseRate: 50,
        demographicCoverage: 50,
      },
      responseQuality: {
        completionRate: 100,
        responseTimeValidity: 100,
        attentionCheckPassRate: 100,
      },
    }

    const resultTest = reliabilityService.calculateReliabilityScore(testFactors, 'TEST')
    expect(resultTest.categoryScores.responseQuality).toBe(100)
  })

  it('[BIBLE T-009] should handle default content type as POLL', () => {
    const resultDefault = reliabilityService.calculateReliabilityScore(perfectFactors)
    const resultPoll = reliabilityService.calculateReliabilityScore(perfectFactors, 'POLL')
    expect(resultDefault.overallScore).toBe(resultPoll.overallScore)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Null Handling Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('ReliabilityService - Null Factor Handling', () => {
  it('[BIBLE T-009] should handle null responseRate (public polls)', () => {
    const factors: ReliabilityFactors = {
      ...perfectFactors,
      sampleQuality: {
        ...perfectFactors.sampleQuality,
        responseRate: null,
      },
    }

    const result = reliabilityService.calculateReliabilityScore(factors)
    expect(result.overallScore).toBeGreaterThan(0)
    expect(result.overallScore).toBeLessThan(100)
  })

  it('[BIBLE T-009] should treat null attentionCheckPassRate as 50 (neutral)', () => {
    const withAttention: ReliabilityFactors = {
      ...perfectFactors,
      responseQuality: {
        ...perfectFactors.responseQuality,
        attentionCheckPassRate: 100,
      },
    }

    const withoutAttention: ReliabilityFactors = {
      ...perfectFactors,
      responseQuality: {
        ...perfectFactors.responseQuality,
        attentionCheckPassRate: null,
      },
    }

    const resultWith = reliabilityService.calculateReliabilityScore(withAttention)
    const resultWithout = reliabilityService.calculateReliabilityScore(withoutAttention)

    expect(resultWithout.overallScore).toBeLessThan(resultWith.overallScore)
    expect(resultWithout.overallScore).toBeGreaterThan(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Edge Cases Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('ReliabilityService - Edge Cases', () => {
  it('[BIBLE T-009] should handle all zero scores', () => {
    const zeroFactors: ReliabilityFactors = {
      sampleQuality: {
        sampleSizeAdequacy: 0,
        responseRate: 0,
        demographicCoverage: 0,
      },
      responseQuality: {
        completionRate: 0,
        responseTimeValidity: 0,
        attentionCheckPassRate: 0,
      },
      methodology: {
        samplingMethod: 0,
        questionQuality: 0,
        pretestUsage: 0,
      },
      participantVerification: {
        userVerificationLevel: 0,
        fraudDetectionPassRate: 0,
      },
    }

    const result = reliabilityService.calculateReliabilityScore(zeroFactors)
    expect(result.overallScore).toBe(0)
    expect(result.label).toBe('Low')
    expect(result.confidenceLevel).toBe('Low')
  })

  it('[BIBLE T-009] should handle mixed high/low factor scores', () => {
    const mixedFactors: ReliabilityFactors = {
      sampleQuality: {
        sampleSizeAdequacy: 100,
        responseRate: 100,
        demographicCoverage: 100,
      },
      responseQuality: {
        completionRate: 0,
        responseTimeValidity: 0,
        attentionCheckPassRate: 0,
      },
      methodology: {
        samplingMethod: 100,
        questionQuality: 100,
        pretestUsage: 100,
      },
      participantVerification: {
        userVerificationLevel: 0,
        fraudDetectionPassRate: 0,
      },
    }

    const result = reliabilityService.calculateReliabilityScore(mixedFactors)
    expect(result.overallScore).toBeGreaterThan(0)
    expect(result.overallScore).toBeLessThan(100)
  })

  it('[BIBLE T-009] should handle boundary sample sizes (exactly 30)', () => {
    const score30 = reliabilityService.scoreSampleSize(30, 385)
    const score29 = reliabilityService.scoreSampleSize(29, 385)
    expect(score30).toBeGreaterThan(0)
    expect(score29).toBe(0)
  })

  it('[BIBLE T-009] should round overall score to integer', () => {
    const result = reliabilityService.calculateReliabilityScore(moderateFactors)
    expect(Number.isInteger(result.overallScore)).toBe(true)
  })
})
