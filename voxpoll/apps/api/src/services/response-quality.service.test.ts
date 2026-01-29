// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - RESPONSE QUALITY SCORING SERVICE TESTS
// Bible: 04-DATA/02-quality-scoring.md, P-055
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest'
import {
  responseQualityService,
  QUALITY_WEIGHTS,
  QUALITY_THRESHOLDS,
  type ResponseQualityInput,
  type QuestionResponse,
} from './response-quality.service'

describe('responseQualityService', () => {
  describe('calculateResponseQuality', () => {
    it('[BIBLE P-055] should use 4 equal-weight components (25% each)', () => {
      expect(QUALITY_WEIGHTS.timing).toBe(0.25)
      expect(QUALITY_WEIGHTS.consistency).toBe(0.25)
      expect(QUALITY_WEIGHTS.engagement).toBe(0.25)
      expect(QUALITY_WEIGHTS.attentionChecks).toBe(0.25)

      const sum =
        QUALITY_WEIGHTS.timing +
        QUALITY_WEIGHTS.consistency +
        QUALITY_WEIGHTS.engagement +
        QUALITY_WEIGHTS.attentionChecks

      expect(sum).toBe(1.0)
    })

    it('[BIBLE P-055] should use correct thresholds (INCLUDE >=70, REVIEW 40-69, EXCLUDE <40)', () => {
      expect(QUALITY_THRESHOLDS.include).toBe(70)
      expect(QUALITY_THRESHOLDS.review).toBe(40)
    })

    it('[BIBLE P-055] should return INCLUDE for high quality response (score >= 70)', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 5000 },
          { questionId: 'q2', value: 2, timeSpentMs: 4000 },
          { questionId: 'q3', value: 3, timeSpentMs: 6000 },
          { questionId: 'q4', value: 4, timeSpentMs: 5500 },
          { questionId: 'q5', value: 5, timeSpentMs: 4500 },
        ],
        totalTimeMs: 25000,
        expectedMinTimeMs: 10000,
        expectedMaxTimeMs: 60000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.overallScore).toBeGreaterThanOrEqual(70)
      expect(result.recommendation).toBe('INCLUDE')
    })

    it('[BIBLE P-055] should return REVIEW for moderate quality (40 <= score < 70)', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 2000 },
          { questionId: 'q2', value: 2, timeSpentMs: 1800 },
          { questionId: 'q3', value: 3, timeSpentMs: 2200 },
          { questionId: 'q4', value: 1, timeSpentMs: 1900 },
          { questionId: 'q5', value: 2, timeSpentMs: 2100 },
        ],
        totalTimeMs: 10000,
        expectedMinTimeMs: 15000,
        expectedMaxTimeMs: 40000,
        attentionChecksPassed: 1,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.overallScore).toBeGreaterThanOrEqual(40)
      expect(result.overallScore).toBeLessThan(70)
      expect(result.recommendation).toBe('REVIEW')
    })

    it('[BIBLE P-055] should return EXCLUDE for low quality (score < 40)', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 500 },
          { questionId: 'q2', value: 1, timeSpentMs: 400 },
          { questionId: 'q3', value: 1, timeSpentMs: 600 },
        ],
        totalTimeMs: 1500,
        expectedMinTimeMs: 10000,
        expectedMaxTimeMs: 30000,
        attentionChecksPassed: 0,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.overallScore).toBeLessThan(40)
      expect(result.recommendation).toBe('EXCLUDE')
    })

    it('[BIBLE P-055] should detect speeding (timing < 30% of minimum)', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 500 },
          { questionId: 'q2', value: 2, timeSpentMs: 600 },
        ],
        totalTimeMs: 1100,
        expectedMinTimeMs: 10000,
        expectedMaxTimeMs: 30000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.timing).toBe(0)
      expect(result.flags).toContain('SPEEDING')
    })

    it('[BIBLE P-055] should detect slowpoke (timing > 3x maximum)', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 100000 },
          { questionId: 'q2', value: 2, timeSpentMs: 110000 },
        ],
        totalTimeMs: 210000,
        expectedMinTimeMs: 10000,
        expectedMaxTimeMs: 30000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.timing).toBe(50)
      expect(result.flags).toContain('EXTREME_SLOWNESS')
    })

    it('[BIBLE P-055] should give perfect timing score (100) for normal response time', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 5000 },
          { questionId: 'q2', value: 2, timeSpentMs: 6000 },
        ],
        totalTimeMs: 15000,
        expectedMinTimeMs: 10000,
        expectedMaxTimeMs: 30000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.timing).toBe(100)
      expect(result.flags).not.toContain('SPEEDING')
      expect(result.flags).not.toContain('EXTREME_SLOWNESS')
    })

    it('[BIBLE P-055] should detect straightlining (all same numeric answers)', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 3, timeSpentMs: 3000 },
          { questionId: 'q2', value: 3, timeSpentMs: 3000 },
          { questionId: 'q3', value: 3, timeSpentMs: 3000 },
          { questionId: 'q4', value: 3, timeSpentMs: 3000 },
          { questionId: 'q5', value: 3, timeSpentMs: 3000 },
        ],
        totalTimeMs: 15000,
        expectedMinTimeMs: 10000,
        expectedMaxTimeMs: 30000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.consistency).toBeLessThan(30)
      expect(result.flags).toContain('STRAIGHT_LINING')
    })

    it('[BIBLE P-055] should give high consistency score for varied numeric answers', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 3000 },
          { questionId: 'q2', value: 5, timeSpentMs: 3000 },
          { questionId: 'q3', value: 2, timeSpentMs: 3000 },
          { questionId: 'q4', value: 4, timeSpentMs: 3000 },
          { questionId: 'q5', value: 3, timeSpentMs: 3000 },
        ],
        totalTimeMs: 15000,
        expectedMinTimeMs: 10000,
        expectedMaxTimeMs: 30000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.consistency).toBeGreaterThanOrEqual(50)
      expect(result.flags).not.toContain('STRAIGHT_LINING')
    })

    it('[BIBLE P-055] should default consistency to 70 for fewer than 5 numeric responses', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 3000 },
          { questionId: 'q2', value: 2, timeSpentMs: 3000 },
          { questionId: 'q3', value: 'text answer', timeSpentMs: 5000 },
        ],
        totalTimeMs: 11000,
        expectedMinTimeMs: 9000,
        expectedMaxTimeMs: 30000,
        attentionChecksPassed: 1,
        attentionChecksTotal: 1,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.consistency).toBe(70)
    })

    it('[BIBLE P-055] should detect low engagement (random clicking, avg < 2s per question)', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 1000 },
          { questionId: 'q2', value: 2, timeSpentMs: 1200 },
          { questionId: 'q3', value: 3, timeSpentMs: 800 },
          { questionId: 'q4', value: 4, timeSpentMs: 900 },
        ],
        totalTimeMs: 3900,
        expectedMinTimeMs: 8000,
        expectedMaxTimeMs: 20000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.engagement).toBeLessThan(100)
      expect(result.flags).toContain('RANDOM_CLICKING')
    })

    it('[BIBLE P-055] should detect gibberish text (consonant ratio > 75%)', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 'qwrtplkjhgfdszxcvbnm', timeSpentMs: 3000 },
          { questionId: 'q2', value: 'dfghjklzxcvbnmqwrtyp', timeSpentMs: 3000 },
        ],
        totalTimeMs: 6000,
        expectedMinTimeMs: 4000,
        expectedMaxTimeMs: 20000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.engagement).toBeLessThan(80)
      expect(result.flags).toContain('GIBBERISH_TEXT')
    })

    it('[BIBLE P-055] should detect repeated characters in text', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 'aaaaaaaaaaaa', timeSpentMs: 3000 },
          { questionId: 'q2', value: 'bbbbbbbbbbbbb', timeSpentMs: 3000 },
        ],
        totalTimeMs: 6000,
        expectedMinTimeMs: 4000,
        expectedMaxTimeMs: 20000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.engagement).toBeLessThan(80)
      expect(result.flags).toContain('GIBBERISH_TEXT')
    })

    it('[BIBLE P-055] should penalize low diversity in numeric responses', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 3000 },
          { questionId: 'q2', value: 1, timeSpentMs: 3000 },
          { questionId: 'q3', value: 1, timeSpentMs: 3000 },
          { questionId: 'q4', value: 2, timeSpentMs: 3000 },
          { questionId: 'q5', value: 1, timeSpentMs: 3000 },
        ],
        totalTimeMs: 15000,
        expectedMinTimeMs: 10000,
        expectedMaxTimeMs: 30000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.engagement).toBeLessThan(100)
    })

    it('[BIBLE P-055] should score 0 for attention checks when pass rate < 50%', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 3000 },
          { questionId: 'q2', value: 2, timeSpentMs: 3000 },
        ],
        totalTimeMs: 6000,
        expectedMinTimeMs: 4000,
        expectedMaxTimeMs: 20000,
        attentionChecksPassed: 1,
        attentionChecksTotal: 3,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.attentionChecks).toBe(0)
      expect(result.flags).toContain('ATTENTION_CHECK_FAIL')
    })

    it('[BIBLE P-055] should give partial score for attention checks when 50% <= pass rate < 75%', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 3000 },
          { questionId: 'q2', value: 2, timeSpentMs: 3000 },
        ],
        totalTimeMs: 6000,
        expectedMinTimeMs: 4000,
        expectedMaxTimeMs: 20000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 3,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.attentionChecks).toBeGreaterThan(0)
      expect(result.components.attentionChecks).toBeLessThan(75)
      expect(result.flags).toContain('ATTENTION_CHECK_FAIL')
    })

    it('[BIBLE P-055] should give perfect attention score when pass rate >= 75%', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 3000 },
          { questionId: 'q2', value: 2, timeSpentMs: 3000 },
        ],
        totalTimeMs: 6000,
        expectedMinTimeMs: 4000,
        expectedMaxTimeMs: 20000,
        attentionChecksPassed: 3,
        attentionChecksTotal: 3,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.attentionChecks).toBe(100)
      expect(result.flags).not.toContain('ATTENTION_CHECK_FAIL')
    })

    it('[BIBLE P-055] should default attention score to 70 when no attention checks exist', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 3000 },
          { questionId: 'q2', value: 2, timeSpentMs: 3000 },
        ],
        totalTimeMs: 6000,
        expectedMinTimeMs: 4000,
        expectedMaxTimeMs: 20000,
        attentionChecksPassed: 0,
        attentionChecksTotal: 0,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.attentionChecks).toBe(70)
      expect(result.flags).not.toContain('ATTENTION_CHECK_FAIL')
    })

    it('[BIBLE P-055] should return all component scores and overall score', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 5000 },
          { questionId: 'q2', value: 3, timeSpentMs: 4000 },
          { questionId: 'q3', value: 5, timeSpentMs: 6000 },
        ],
        totalTimeMs: 15000,
        expectedMinTimeMs: 10000,
        expectedMaxTimeMs: 30000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result).toHaveProperty('overallScore')
      expect(result).toHaveProperty('components')
      expect(result.components).toHaveProperty('timing')
      expect(result.components).toHaveProperty('consistency')
      expect(result.components).toHaveProperty('engagement')
      expect(result.components).toHaveProperty('attentionChecks')
      expect(result).toHaveProperty('flags')
      expect(result).toHaveProperty('recommendation')
    })

    it('[BIBLE P-055] should handle edge case: empty responses array', () => {
      const input: ResponseQualityInput = {
        responses: [],
        totalTimeMs: 1000,
        expectedMinTimeMs: 5000,
        expectedMaxTimeMs: 20000,
        attentionChecksPassed: 0,
        attentionChecksTotal: 0,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.components.engagement).toBe(0)
      expect(result.flags).toContain('RANDOM_CLICKING')
      expect(result.recommendation).toBe('EXCLUDE')
    })

    it('[BIBLE P-055] should handle mixed text and numeric responses', () => {
      const input: ResponseQualityInput = {
        responses: [
          { questionId: 'q1', value: 1, timeSpentMs: 3000 },
          { questionId: 'q2', value: 'Good answer with proper text', timeSpentMs: 5000 },
          { questionId: 'q3', value: 3, timeSpentMs: 4000 },
          { questionId: 'q4', value: 'Another thoughtful response here', timeSpentMs: 6000 },
          { questionId: 'q5', value: 5, timeSpentMs: 3500 },
        ],
        totalTimeMs: 21500,
        expectedMinTimeMs: 15000,
        expectedMaxTimeMs: 40000,
        attentionChecksPassed: 2,
        attentionChecksTotal: 2,
      }

      const result = responseQualityService.calculateResponseQuality(input)

      expect(result.overallScore).toBeGreaterThan(60)
      expect(result.recommendation).not.toBe('EXCLUDE')
    })
  })
})
