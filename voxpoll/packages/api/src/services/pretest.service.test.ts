// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PRE-TEST SERVICE TESTS
// Bible: 03-FEATURES/01-polls.md#Pre-test, P-007, P-014, P-030, P-108
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PretestQuestion } from './pretest.service'

// ─────────────────────────────────────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────────────────────────────────────

const mockPollId = 'poll_123'
const mockUserId = 'user_456'
const mockDeviceFingerprint = 'device_abc'

const mockQuestions: PretestQuestion[] = [
  {
    id: 'q1',
    question: 'Have you used React before?',
    options: [
      { id: 'o1', text: 'Yes' },
      { id: 'o2', text: 'No' },
    ],
    correctOptionId: 'o1',
  },
  {
    id: 'q2',
    question: 'What is JSX?',
    options: [
      { id: 'o3', text: 'JavaScript XML' },
      { id: 'o4', text: 'Java Standard Extension' },
    ],
    correctOptionId: 'o3',
  },
]

const mockPollWithPretest = {
  id: mockPollId,
  hasPreTest: true,
  preTestQuestions: mockQuestions,
  preTestPassingScore: 60,
}

const mockPollWithoutPretest = {
  id: mockPollId,
  hasPreTest: false,
  preTestQuestions: [],
  preTestPassingScore: null,
}

// ─────────────────────────────────────────────────────────────────────────────
// Hoisted Mocks
// ─────────────────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
  },
  eq: vi.fn((a, b) => ({ type: 'eq', a, b })),
  and: vi.fn((...args) => ({ type: 'and', args })),
  desc: vi.fn((col) => ({ type: 'desc', col })),
  polls: { id: 'polls.id' },
  pretestAttempts: {
    id: 'pretestAttempts.id',
    pollId: 'pretestAttempts.pollId',
    participantId: 'pretestAttempts.participantId',
    createdAt: 'pretestAttempts.createdAt',
  },
  ApiError: {
    badRequest: vi.fn((message, code) => new Error(`${code}: ${message}`)),
    notFound: vi.fn((message, code) => new Error(`${code}: ${message}`)),
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Apply Mocks
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('@voxpoll/database', () => ({
  db: mocks.db,
  eq: mocks.eq,
  and: mocks.and,
  desc: mocks.desc,
  polls: mocks.polls,
  pretestAttempts: mocks.pretestAttempts,
}))

vi.mock('../middleware/error-handler', () => ({
  ApiError: mocks.ApiError,
}))

vi.mock('../constants/messages', () => ({
  ERROR_CODES: {
    PRETEST_MAX_ATTEMPTS: 'PRETEST_MAX_ATTEMPTS',
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Import Service After Mocks
// ─────────────────────────────────────────────────────────────────────────────

import { pretestService } from './pretest.service'

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('PretestService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // getQuestions
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getQuestions', () => {
    it('[BIBLE P-007] should return shuffled questions for eligible user', async () => {
      mocks.db.orderBy.mockResolvedValueOnce([])
      mocks.db.limit.mockResolvedValueOnce([mockPollWithPretest])

      const result = await pretestService.getQuestions(mockPollId, mockUserId)

      expect(result.questions).toHaveLength(2)
      expect(result.config.totalQuestions).toBe(2)
      expect(result.config.passingThreshold).toBe(60)
      expect(result.questions[0]).toHaveProperty('id')
      expect(result.questions[0]).toHaveProperty('question')
      expect(result.questions[0]).toHaveProperty('options')
      expect(result.questions[0]).not.toHaveProperty('correctOptionId')
    })

    it('[BIBLE P-030] should throw error if user already passed', async () => {
      const passedAttempt = {
        pollId: mockPollId,
        participantId: mockUserId,
        passed: true,
        attemptNumber: 1,
        score: 100,
        createdAt: new Date(),
      }

      mocks.db.orderBy.mockResolvedValueOnce([passedAttempt])

      await expect(
        pretestService.getQuestions(mockPollId, mockUserId)
      ).rejects.toThrow('PRETEST_ALREADY_PASSED')
    })

    it('[BIBLE P-030] should throw error if max attempts reached', async () => {
      const failedAttempts = [
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 1, score: 40, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 2, score: 45, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 3, score: 50, createdAt: new Date(Date.now() - 1000 * 60 * 60) },
      ]

      mocks.db.orderBy.mockResolvedValueOnce(failedAttempts)

      await expect(
        pretestService.getQuestions(mockPollId, mockUserId)
      ).rejects.toThrow('PRETEST_MAX_ATTEMPTS')
    })

    it('[BIBLE P-030] should throw error if user in cooldown period', async () => {
      const recentFailedAttempt = {
        pollId: mockPollId,
        participantId: mockUserId,
        passed: false,
        attemptNumber: 1,
        score: 40,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      }

      mocks.db.orderBy.mockResolvedValueOnce([recentFailedAttempt])

      await expect(
        pretestService.getQuestions(mockPollId, mockUserId)
      ).rejects.toThrow('PRETEST_COOLDOWN')
    })

    it('[BIBLE P-007] should throw error if poll has no pretest configured', async () => {
      mocks.db.orderBy.mockResolvedValueOnce([])
      mocks.db.limit.mockResolvedValueOnce([mockPollWithoutPretest])

      await expect(
        pretestService.getQuestions(mockPollId, mockUserId)
      ).rejects.toThrow('PRETEST_NOT_CONFIGURED')
    })

    it('[BIBLE P-030] should shuffle questions and options (anti-gaming)', async () => {
      mocks.db.orderBy.mockResolvedValueOnce([])
      mocks.db.limit.mockResolvedValueOnce([mockPollWithPretest])

      const result1 = await pretestService.getQuestions(mockPollId, mockUserId)

      vi.clearAllMocks()
      mocks.db.orderBy.mockResolvedValueOnce([])
      mocks.db.limit.mockResolvedValueOnce([mockPollWithPretest])

      const result2 = await pretestService.getQuestions(mockPollId, mockUserId)

      expect(result1.questions[0].options).toHaveLength(2)
      expect(result2.questions[0].options).toHaveLength(2)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // submitAnswers
  // ═══════════════════════════════════════════════════════════════════════════

  describe('submitAnswers', () => {
    const validAnswers = [
      { questionId: 'q1', selectedOptionId: 'o1', timeSpentMs: 3000 },
      { questionId: 'q2', selectedOptionId: 'o3', timeSpentMs: 4000 },
    ]

    it('[BIBLE P-007] should pass user with correct answers above threshold', async () => {
      mocks.db.orderBy.mockResolvedValueOnce([])
      mocks.db.limit.mockResolvedValueOnce([mockPollWithPretest])
      mocks.db.values.mockResolvedValueOnce(undefined)

      const result = await pretestService.submitAnswers(
        mockPollId,
        mockUserId,
        mockDeviceFingerprint,
        validAnswers
      )

      expect(result.passed).toBe(true)
      expect(result.score).toBe(100)
      expect(result.attemptNumber).toBe(1)
      expect(result.attemptsRemaining).toBe(2)
      expect(result.message).toContain('başarılı')
    })

    it('[BIBLE P-007] should fail user with incorrect answers below threshold', async () => {
      const wrongAnswers = [
        { questionId: 'q1', selectedOptionId: 'o2', timeSpentMs: 3000 },
        { questionId: 'q2', selectedOptionId: 'o4', timeSpentMs: 4000 },
      ]

      mocks.db.orderBy.mockResolvedValueOnce([])
      mocks.db.limit.mockResolvedValueOnce([mockPollWithPretest])
      mocks.db.values.mockResolvedValueOnce(undefined)

      const result = await pretestService.submitAnswers(
        mockPollId,
        mockUserId,
        mockDeviceFingerprint,
        wrongAnswers
      )

      expect(result.passed).toBe(false)
      expect(result.score).toBe(0)
      expect(result.attemptNumber).toBe(1)
      expect(result.attemptsRemaining).toBe(2)
      expect(result.cooldownUntil).not.toBeNull()
    })

    it('[BIBLE P-030] should return early if user already passed', async () => {
      const passedAttempt = {
        pollId: mockPollId,
        participantId: mockUserId,
        passed: true,
        attemptNumber: 1,
        score: 100,
        createdAt: new Date(),
      }

      mocks.db.orderBy.mockResolvedValueOnce([passedAttempt])

      const result = await pretestService.submitAnswers(
        mockPollId,
        mockUserId,
        mockDeviceFingerprint,
        validAnswers
      )

      expect(result.passed).toBe(true)
      expect(result.score).toBe(100)
      expect(mocks.db.insert).not.toHaveBeenCalled()
    })

    it('[BIBLE P-030] should reject answers completed too fast (min 2s per question)', async () => {
      const tooFastAnswers = [
        { questionId: 'q1', selectedOptionId: 'o1', timeSpentMs: 1000 },
        { questionId: 'q2', selectedOptionId: 'o3', timeSpentMs: 1500 },
      ]

      mocks.db.orderBy.mockResolvedValueOnce([])
      mocks.db.limit.mockResolvedValueOnce([mockPollWithPretest])

      await expect(
        pretestService.submitAnswers(
          mockPollId,
          mockUserId,
          mockDeviceFingerprint,
          tooFastAnswers
        )
      ).rejects.toThrow('PRETEST_TOO_FAST')
    })

    it('[BIBLE P-030] should enforce max 3 attempts with cooldown', async () => {
      const failedAttempts = [
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 1, score: 40, createdAt: new Date(Date.now() - 1000 * 60 * 70) },
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 2, score: 45, createdAt: new Date(Date.now() - 1000 * 60 * 130) },
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 3, score: 50, createdAt: new Date(Date.now() - 1000 * 60 * 1450) },
      ]

      mocks.db.orderBy.mockResolvedValueOnce(failedAttempts)

      await expect(
        pretestService.submitAnswers(
          mockPollId,
          mockUserId,
          mockDeviceFingerprint,
          validAnswers
        )
      ).rejects.toThrow('PRETEST_MAX_ATTEMPTS')
    })

    it('[BIBLE P-030] should calculate score correctly (percentage based)', async () => {
      const partialCorrect = [
        { questionId: 'q1', selectedOptionId: 'o1', timeSpentMs: 3000 },
        { questionId: 'q2', selectedOptionId: 'o4', timeSpentMs: 4000 },
      ]

      mocks.db.orderBy.mockResolvedValueOnce([])
      mocks.db.limit.mockResolvedValueOnce([mockPollWithPretest])
      mocks.db.values.mockResolvedValueOnce(undefined)

      const result = await pretestService.submitAnswers(
        mockPollId,
        mockUserId,
        mockDeviceFingerprint,
        partialCorrect
      )

      expect(result.score).toBe(50)
      expect(result.passed).toBe(false)
    })

    it('[BIBLE P-030] should enforce progressive cooldown (60/120/1440 min)', async () => {
      const oneFailedAttempt = [
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 1, score: 40, createdAt: new Date(Date.now() - 1000 * 60 * 70) },
      ]

      mocks.db.orderBy.mockResolvedValueOnce(oneFailedAttempt)
      mocks.db.limit.mockResolvedValueOnce([mockPollWithPretest])
      mocks.db.values.mockResolvedValueOnce(undefined)

      const wrongAnswers = [
        { questionId: 'q1', selectedOptionId: 'o2', timeSpentMs: 3000 },
        { questionId: 'q2', selectedOptionId: 'o4', timeSpentMs: 4000 },
      ]

      const result = await pretestService.submitAnswers(
        mockPollId,
        mockUserId,
        mockDeviceFingerprint,
        wrongAnswers
      )

      expect(result.attemptNumber).toBe(2)
      expect(result.cooldownUntil).not.toBeNull()

      if (result.cooldownUntil) {
        const cooldownMinutes = (result.cooldownUntil.getTime() - Date.now()) / (1000 * 60)
        expect(cooldownMinutes).toBeCloseTo(120, 0)
      }
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // getStatus
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getStatus', () => {
    it('[BIBLE P-007] should return initial status for user with no attempts', async () => {
      mocks.db.orderBy.mockResolvedValueOnce([])

      const status = await pretestService.getStatus(mockPollId, mockUserId)

      expect(status.hasAttempted).toBe(false)
      expect(status.passed).toBe(false)
      expect(status.attemptCount).toBe(0)
      expect(status.attemptsRemaining).toBe(3)
      expect(status.canAttempt).toBe(true)
      expect(status.cooldownUntil).toBeNull()
      expect(status.nextAttemptAt).toBeNull()
    })

    it('[BIBLE P-007] should return passed status if user has passed', async () => {
      const passedAttempt = {
        pollId: mockPollId,
        participantId: mockUserId,
        passed: true,
        attemptNumber: 1,
        score: 100,
        createdAt: new Date(),
      }

      mocks.db.orderBy.mockResolvedValueOnce([passedAttempt])

      const status = await pretestService.getStatus(mockPollId, mockUserId)

      expect(status.hasAttempted).toBe(true)
      expect(status.passed).toBe(true)
      expect(status.attemptCount).toBe(1)
      expect(status.attemptsRemaining).toBe(0)
      expect(status.canAttempt).toBe(false)
    })

    it('[BIBLE P-030] should return correct status for failed attempts with cooldown', async () => {
      const failedAttempt = {
        pollId: mockPollId,
        participantId: mockUserId,
        passed: false,
        attemptNumber: 1,
        score: 40,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      }

      mocks.db.orderBy.mockResolvedValueOnce([failedAttempt])

      const status = await pretestService.getStatus(mockPollId, mockUserId)

      expect(status.hasAttempted).toBe(true)
      expect(status.passed).toBe(false)
      expect(status.attemptCount).toBe(1)
      expect(status.attemptsRemaining).toBe(2)
      expect(status.canAttempt).toBe(false)
      expect(status.cooldownUntil).not.toBeNull()
    })

    it('[BIBLE P-030] should allow attempt after cooldown expires', async () => {
      const expiredAttempt = {
        pollId: mockPollId,
        participantId: mockUserId,
        passed: false,
        attemptNumber: 1,
        score: 40,
        createdAt: new Date(Date.now() - 1000 * 60 * 70),
      }

      mocks.db.orderBy.mockResolvedValueOnce([expiredAttempt])

      const status = await pretestService.getStatus(mockPollId, mockUserId)

      expect(status.canAttempt).toBe(true)
      expect(status.cooldownUntil).toBeNull()
    })

    it('[BIBLE P-030] should prevent attempts after max attempts reached', async () => {
      const threeFailedAttempts = [
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 1, score: 40, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 2, score: 45, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 3, score: 50, createdAt: new Date(Date.now() - 1000 * 60 * 60) },
      ]

      mocks.db.orderBy.mockResolvedValueOnce(threeFailedAttempts)

      const status = await pretestService.getStatus(mockPollId, mockUserId)

      expect(status.attemptCount).toBe(3)
      expect(status.attemptsRemaining).toBe(0)
      expect(status.canAttempt).toBe(false)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // validateQuestions
  // ═══════════════════════════════════════════════════════════════════════════

  describe('validateQuestions', () => {
    it('[BIBLE P-007] should validate correct question configuration', () => {
      expect(() => pretestService.validateQuestions(mockQuestions)).not.toThrow()
    })

    it('[BIBLE P-007] should reject too few questions (< 1)', () => {
      expect(() => pretestService.validateQuestions([])).toThrow('INVALID_PRETEST_QUESTION_COUNT')
    })

    it('[BIBLE P-007] should reject too many questions (> 5)', () => {
      const tooMany = Array(6).fill(mockQuestions[0])

      expect(() => pretestService.validateQuestions(tooMany as PretestQuestion[])).toThrow('INVALID_PRETEST_QUESTION_COUNT')
    })

    it('[BIBLE P-007] should reject questions with empty text', () => {
      const invalidQuestion = [{
        id: 'q1',
        question: '',
        options: [{ id: 'o1', text: 'Yes' }, { id: 'o2', text: 'No' }],
        correctOptionId: 'o1',
      }]

      expect(() => pretestService.validateQuestions(invalidQuestion as PretestQuestion[])).toThrow('INVALID_PRETEST_QUESTION')
    })

    it('[BIBLE P-007] should reject questions with < 2 options', () => {
      const invalidQuestion = [{
        id: 'q1',
        question: 'Test question?',
        options: [{ id: 'o1', text: 'Yes' }],
        correctOptionId: 'o1',
      }]

      expect(() => pretestService.validateQuestions(invalidQuestion as PretestQuestion[])).toThrow('INVALID_PRETEST_OPTIONS')
    })

    it('[BIBLE P-007] should reject questions with invalid correctOptionId', () => {
      const invalidQuestion = [{
        id: 'q1',
        question: 'Test question?',
        options: [{ id: 'o1', text: 'Yes' }, { id: 'o2', text: 'No' }],
        correctOptionId: 'o3',
      }]

      expect(() => pretestService.validateQuestions(invalidQuestion as PretestQuestion[])).toThrow('INVALID_PRETEST_CORRECT_ANSWER')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // validatePassingScore
  // ═══════════════════════════════════════════════════════════════════════════

  describe('validatePassingScore', () => {
    it('[BIBLE P-007] should accept valid passing score (50-100)', () => {
      expect(() => pretestService.validatePassingScore(60)).not.toThrow()
      expect(() => pretestService.validatePassingScore(50)).not.toThrow()
      expect(() => pretestService.validatePassingScore(100)).not.toThrow()
    })

    it('[BIBLE P-007] should reject passing score below 50%', () => {
      expect(() => pretestService.validatePassingScore(49)).toThrow('INVALID_PRETEST_THRESHOLD')
    })

    it('[BIBLE P-007] should reject passing score above 100%', () => {
      expect(() => pretestService.validatePassingScore(101)).toThrow('INVALID_PRETEST_THRESHOLD')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // canParticipate
  // ═══════════════════════════════════════════════════════════════════════════

  describe('canParticipate', () => {
    it('[BIBLE P-007] should allow participation if no pretest configured', async () => {
      mocks.db.limit.mockResolvedValueOnce([mockPollWithoutPretest])

      const result = await pretestService.canParticipate(mockPollId, mockUserId)

      expect(result.canParticipate).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('[BIBLE P-007] should allow participation if user passed pretest', async () => {
      const passedAttempt = {
        pollId: mockPollId,
        participantId: mockUserId,
        passed: true,
        attemptNumber: 1,
        score: 100,
        createdAt: new Date(),
      }

      mocks.db.limit.mockResolvedValueOnce([mockPollWithPretest])
      mocks.db.orderBy.mockResolvedValueOnce([passedAttempt])

      const result = await pretestService.canParticipate(mockPollId, mockUserId)

      expect(result.canParticipate).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('[BIBLE P-030] should deny participation if max attempts reached', async () => {
      const threeFailedAttempts = [
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 1, score: 40, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 2, score: 45, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 3, score: 50, createdAt: new Date(Date.now() - 1000 * 60 * 60) },
      ]

      mocks.db.limit.mockResolvedValueOnce([mockPollWithPretest])
      mocks.db.orderBy.mockResolvedValueOnce(threeFailedAttempts)

      const result = await pretestService.canParticipate(mockPollId, mockUserId)

      expect(result.canParticipate).toBe(false)
      expect(result.reason).toContain('maksimum deneme')
    })

    it('[BIBLE P-108] should provide polite rejection message', async () => {
      const threeFailedAttempts = [
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 1, score: 40, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 2, score: 45, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        { pollId: mockPollId, participantId: mockUserId, passed: false, attemptNumber: 3, score: 50, createdAt: new Date(Date.now() - 1000 * 60 * 60) },
      ]

      mocks.db.limit.mockResolvedValueOnce([mockPollWithPretest])
      mocks.db.orderBy.mockResolvedValueOnce(threeFailedAttempts)

      const result = await pretestService.canParticipate(mockPollId, mockUserId)

      expect(result.reason).not.toContain('failed')
      expect(result.reason).not.toContain('reject')
      expect(result.reason).not.toMatch(/\d{1,3}%/)
    })
  })
})
