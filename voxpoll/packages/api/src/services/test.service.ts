// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TEST SERVICE
// Business logic for test operations (personality tests & quizzes)
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and } from '@voxpoll/database'
import { organizationMembers } from '@voxpoll/database'
import {
  testRepository,
  type TestFilters,
  type TestSortOption,
  type TestCategory,
} from '../repositories/test.repository'
import { cacheService } from './cache.service'
import { ApiError } from '../middleware/error-handler'
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { PAGINATION } from '../constants/limits'
import { generateParticipantHash } from '../lib/hash'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateTestInput {
  testCategory: TestCategory
  title: string
  description?: string
  organizationId?: string
  categoryId?: string
  tags?: string[]
  coverImageUrl?: string
}

export interface CreatePersonalityTestInput extends CreateTestInput {
  testCategory: 'PERSONALITY'
  testType: 'AXIS' | 'CHARACTER' | 'SPECTRUM'
  settings: object
}

export interface CreateQuizTestInput extends CreateTestInput {
  testCategory: 'QUIZ'
  quizType: 'KNOWLEDGE' | 'TRIVIA' | 'EDUCATIONAL' | 'SKILL_ASSESSMENT'
  timeLimitMinutes?: number
  attemptsAllowed?: number
  passingScore?: number
  showCorrectAnswers?: boolean
  showScoreImmediately?: boolean
  randomizeQuestions?: boolean
  randomizeOptions?: boolean
  startsAt?: string
  endsAt?: string
}

export interface UpdateTestInput {
  title?: string
  description?: string
  tags?: string[]
  coverImageUrl?: string
  categoryId?: string
}

export interface AddPersonalityQuestionInput {
  text: string
  questionType: string
  config: object
  weight?: number
  imageUrl?: string
}

export interface AddQuizQuestionInput {
  type: string
  text: string
  explanation?: string
  options: object
  correctAnswer: object
  points?: number
  negativePoints?: number
  timeLimitSeconds?: number
  difficulty?: string
  imageUrl?: string
}

export interface SubmitPersonalityResultInput {
  responses: object
  timeSpentSeconds?: number
}

export interface SubmitQuizAnswerInput {
  questionIndex: number
  answer: unknown
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 200)
  const random = Math.random().toString(36).substring(2, 8)
  return `${base}-${random}`
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j] as T, shuffled[i] as T]
  }
  return shuffled
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Service Class
// ─────────────────────────────────────────────────────────────────────────────

class TestServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // List Tests
  // ─────────────────────────────────────────────────────────────────────────────

  async listTests(
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    sort: TestSortOption = 'recent',
    filters: TestFilters = {}
  ) {
    const result = await testRepository.findMany(filters, page, limit, sort)

    return {
      items: result.items.map((test) => ({
        id: test.id,
        testCategory: test.testCategory,
        title: test.title,
        description: test.description,
        slug: test.slug,
        status: test.status,
        coverImageUrl: test.coverImageUrl,
        creator: test.creator,
        organization: test.organization,
        category: test.category,
        completionCount: test.completionCount,
        viewCount: test.viewCount,
        averageCompletionTime: test.averageCompletionTime,
        createdAt: test.createdAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Test
  // ─────────────────────────────────────────────────────────────────────────────

  async getTest(id: string, currentUserId?: string) {
    const test = await testRepository.findById(id)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    // Increment view count
    await testRepository.incrementViewCount(id)

    // Check if user has completed this test
    let hasCompleted = false
    if (currentUserId) {
      if (test.testCategory === 'PERSONALITY' && test.personalityTest) {
        const participantHash = generateParticipantHash(currentUserId, test.personalityTest.id)
        const result = await testRepository.getPersonalityResult(test.personalityTest.id, participantHash)
        hasCompleted = !!result
      } else if (test.testCategory === 'QUIZ' && test.quizTest) {
        const attempt = await testRepository.getQuizAttempt(test.quizTest.id, currentUserId)
        hasCompleted = attempt?.status === 'COMPLETED'
      }
    }

    return {
      id: test.id,
      testCategory: test.testCategory,
      title: test.title,
      description: test.description,
      slug: test.slug,
      status: test.status,
      visibility: test.visibility,
      coverImageUrl: test.coverImageUrl,
      creator: test.creator,
      organization: test.organization,
      category: test.category,
      completionCount: test.completionCount,
      viewCount: test.viewCount,
      averageCompletionTime: test.averageCompletionTime,
      reliabilityScore: test.reliabilityScore,
      createdAt: test.createdAt,
      publishedAt: test.publishedAt,
      personalityTest: test.personalityTest,
      quizTest: test.quizTest,
      hasCompleted,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Test by Slug
  // ─────────────────────────────────────────────────────────────────────────────

  async getTestBySlug(slug: string, currentUserId?: string) {
    const test = await testRepository.findBySlug(slug)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    return this.getTest(test.id, currentUserId)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Personality Test
  // ─────────────────────────────────────────────────────────────────────────────

  async createPersonalityTest(creatorId: string, input: CreatePersonalityTestInput) {
    // If organizationId provided, verify membership
    if (input.organizationId) {
      const membershipResult = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, creatorId)
          )
        )
        .limit(1)

      const membership = membershipResult[0]

      if (!membership) {
        throw ApiError.forbidden('You must be a member of the organization', 'NOT_ORG_MEMBER')
      }
    }

    const slug = generateSlug(input.title)

    // Create base test
    const test = await testRepository.create({
      creatorId,
      organizationId: input.organizationId,
      testCategory: 'PERSONALITY',
      title: input.title,
      description: input.description,
      slug,
      categoryId: input.categoryId,
      tags: input.tags,
      coverImageUrl: input.coverImageUrl,
    })
    if (!test || !test.id) {
      throw ApiError.internal('Failed to create test', 'TEST_CREATE_FAILED')
    }

    // Create personality test configuration
    await testRepository.createPersonalityTest(test.id, {
      testType: input.testType,
      settings: input.settings,
    })

    return {
      id: test.id,
      title: test.title,
      slug: test.slug,
      testCategory: test.testCategory,
      status: test.status,
      creator: test.creator,
      organization: test.organization,
      createdAt: test.createdAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Quiz Test
  // ─────────────────────────────────────────────────────────────────────────────

  async createQuizTest(creatorId: string, input: CreateQuizTestInput) {
    // If organizationId provided, verify membership
    if (input.organizationId) {
      const membershipResult = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, creatorId)
          )
        )
        .limit(1)

      const membership = membershipResult[0]

      if (!membership) {
        throw ApiError.forbidden('You must be a member of the organization', 'NOT_ORG_MEMBER')
      }
    }

    const slug = generateSlug(input.title)

    // Create base test
    const test = await testRepository.create({
      creatorId,
      organizationId: input.organizationId,
      testCategory: 'QUIZ',
      title: input.title,
      description: input.description,
      slug,
      categoryId: input.categoryId,
      tags: input.tags,
      coverImageUrl: input.coverImageUrl,
    })
    if (!test || !test.id) {
      throw ApiError.internal('Failed to create test', 'TEST_CREATE_FAILED')
    }

    // Create quiz test configuration
    await testRepository.createQuizTest(test.id, {
      quizType: input.quizType,
      timeLimitMinutes: input.timeLimitMinutes,
      attemptsAllowed: input.attemptsAllowed,
      passingScore: input.passingScore,
      showCorrectAnswers: input.showCorrectAnswers,
      showScoreImmediately: input.showScoreImmediately,
      randomizeQuestions: input.randomizeQuestions,
      randomizeOptions: input.randomizeOptions,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
    })

    return {
      id: test.id,
      title: test.title,
      slug: test.slug,
      testCategory: test.testCategory,
      status: test.status,
      creator: test.creator,
      organization: test.organization,
      createdAt: test.createdAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Test
  // ─────────────────────────────────────────────────────────────────────────────

  async updateTest(testId: string, userId: string, input: UpdateTestInput) {
    const test = await testRepository.findById(testId)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    // Check permission
    await this.checkEditPermission(test, userId)

    // P-106: Tests CANNOT be edited after publishing
    if (test.status !== 'DRAFT') {
      throw ApiError.badRequest('Cannot edit test after publishing', 'TEST_LOCKED')
    }

    const updatedTest = await testRepository.update(testId, input)
    if (!updatedTest) {
      throw ApiError.internal('Failed to update test', 'TEST_UPDATE_FAILED')
    }

    return {
      id: updatedTest.id,
      title: updatedTest.title,
      slug: updatedTest.slug,
      message: SUCCESS_MESSAGES.TEST_UPDATED,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete Test
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteTest(testId: string, userId: string) {
    const test = await testRepository.findById(testId)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    // Check permission
    await this.checkEditPermission(test, userId)

    await testRepository.softDelete(testId)

    return { message: SUCCESS_MESSAGES.TEST_DELETED }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Publish Test
  // ─────────────────────────────────────────────────────────────────────────────

  async publishTest(testId: string, userId: string) {
    const test = await testRepository.findById(testId)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    // Check permission
    await this.checkEditPermission(test, userId)

    // Validate test has questions
    if (test.testCategory === 'PERSONALITY' && test.personalityTest) {
      if (test.personalityTest.questions.length === 0) {
        throw ApiError.badRequest('Test must have at least one question to publish', 'NO_QUESTIONS')
      }
    } else if (test.testCategory === 'QUIZ' && test.quizTest) {
      if (test.quizTest.questions.length === 0) {
        throw ApiError.badRequest('Quiz must have at least one question to publish', 'NO_QUESTIONS')
      }
    }

    await testRepository.publish(testId)

    return { message: SUCCESS_MESSAGES.TEST_PUBLISHED }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Add Personality Question
  // ─────────────────────────────────────────────────────────────────────────────

  async addPersonalityQuestion(testId: string, userId: string, input: AddPersonalityQuestionInput) {
    const test = await testRepository.findById(testId)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    if (test.testCategory !== 'PERSONALITY' || !test.personalityTest) {
      throw ApiError.badRequest('This is not a personality test', 'NOT_PERSONALITY_TEST')
    }

    await this.checkEditPermission(test, userId)

    const position = test.personalityTest.questions.length

    const question = await testRepository.addPersonalityQuestion(test.personalityTest.id, {
      position,
      text: input.text,
      questionType: input.questionType,
      config: input.config,
      weight: input.weight,
      imageUrl: input.imageUrl,
    })

    return question
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Add Quiz Question
  // ─────────────────────────────────────────────────────────────────────────────

  async addQuizQuestion(testId: string, userId: string, input: AddQuizQuestionInput) {
    const test = await testRepository.findById(testId)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    if (test.testCategory !== 'QUIZ' || !test.quizTest) {
      throw ApiError.badRequest('This is not a quiz test', 'NOT_QUIZ_TEST')
    }

    await this.checkEditPermission(test, userId)

    const orderIndex = test.quizTest.questions.length

    const question = await testRepository.addQuizQuestion(test.quizTest.id, {
      orderIndex,
      type: input.type,
      text: input.text,
      explanation: input.explanation,
      options: input.options,
      correctAnswer: input.correctAnswer,
      points: input.points,
      negativePoints: input.negativePoints,
      timeLimitSeconds: input.timeLimitSeconds,
      difficulty: input.difficulty,
      imageUrl: input.imageUrl,
    })

    return question
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Submit Personality Test Result
  // ─────────────────────────────────────────────────────────────────────────────

  async submitPersonalityResult(testId: string, userId: string, input: SubmitPersonalityResultInput) {
    const test = await testRepository.findById(testId)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    if (test.status !== 'ACTIVE') {
      throw ApiError.badRequest('This test is not currently active', 'TEST_NOT_ACTIVE')
    }

    if (test.testCategory !== 'PERSONALITY' || !test.personalityTest) {
      throw ApiError.badRequest('This is not a personality test', 'NOT_PERSONALITY_TEST')
    }

    const participantHash = generateParticipantHash(userId, test.personalityTest.id)

    // Check if already completed
    const existingResult = await testRepository.getPersonalityResult(test.personalityTest.id, participantHash)
    if (existingResult) {
      throw ApiError.conflict('You have already completed this test', 'ALREADY_COMPLETED')
    }

    const calculatedResult = this.calculatePersonalityResult(test.personalityTest, input.responses)

    const result = await testRepository.submitPersonalityResult(test.personalityTest.id, {
      userId,
      participantHash,
      testType: test.personalityTest.testType,
      responses: input.responses,
      calculatedResult: calculatedResult.result,
      matchedCharacterId: calculatedResult.matchedCharacterId,
      matchPercentage: calculatedResult.matchPercentage,
      axisScores: calculatedResult.axisScores,
      coordinates: calculatedResult.coordinates,
      quadrantId: calculatedResult.quadrantId,
      typeCode: calculatedResult.typeCode,
      spectrumPercentage: calculatedResult.spectrumPercentage,
      segmentId: calculatedResult.segmentId,
      timeSpentSeconds: input.timeSpentSeconds,
    })
    if (!result) {
      throw ApiError.internal('Failed to submit personality result', 'RESULT_SUBMIT_FAILED')
    }

    // Increment completion count
    await testRepository.incrementCompletionCount(testId)

    // Create badge if user is logged in
    if (calculatedResult.badgeData) {
      await testRepository.createResultBadge({
        testId: test.personalityTest.id,
        userId,
        resultType: test.personalityTest.testType,
        resultTitle: calculatedResult.badgeData.title,
        resultSubtitle: calculatedResult.badgeData.subtitle,
        resultImageUrl: calculatedResult.badgeData.imageUrl,
        axisScores: calculatedResult.axisScores,
        characterName: calculatedResult.badgeData.characterName,
        matchPercentage: calculatedResult.matchPercentage,
        spectrumScore: calculatedResult.spectrumPercentage,
        spectrumLabel: calculatedResult.badgeData.spectrumLabel,
      })
    }

    return {
      id: result.id,
      testType: result.testType,
      calculatedResult: result.calculatedResult,
      matchPercentage: result.matchPercentage,
      typeCode: result.typeCode,
      completedAt: result.completedAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Start Quiz Attempt
  // ─────────────────────────────────────────────────────────────────────────────

  async startQuizAttempt(testId: string, userId: string) {
    const test = await testRepository.findById(testId)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    if (test.status !== 'ACTIVE') {
      throw ApiError.badRequest('This test is not currently active', 'TEST_NOT_ACTIVE')
    }

    if (test.testCategory !== 'QUIZ' || !test.quizTest) {
      throw ApiError.badRequest('This is not a quiz test', 'NOT_QUIZ_TEST')
    }

    // Check time constraints
    if (test.quizTest.startsAt && test.quizTest.startsAt > new Date()) {
      throw ApiError.badRequest('This quiz has not started yet', 'QUIZ_NOT_STARTED')
    }

    if (test.quizTest.endsAt && test.quizTest.endsAt < new Date()) {
      throw ApiError.badRequest('This quiz has ended', 'QUIZ_ENDED')
    }

    // Check attempt limit
    const attemptCount = await testRepository.getUserAttemptCount(test.quizTest.id, userId)
    if (attemptCount >= test.quizTest.attemptsAllowed) {
      throw ApiError.badRequest('You have reached the maximum number of attempts', 'MAX_ATTEMPTS_REACHED')
    }

    // Check for existing in-progress attempt
    const existingAttempt = await testRepository.getQuizAttempt(test.quizTest.id, userId)
    if (existingAttempt?.status === 'IN_PROGRESS') {
      return {
        attemptId: existingAttempt.id,
        attemptNumber: existingAttempt.attemptNumber,
        status: existingAttempt.status,
        startedAt: existingAttempt.startedAt,
        questionOrder: existingAttempt.questionOrder,
        timeLimitMinutes: test.quizTest.timeLimitMinutes,
        questions: this.getQuizQuestionsForAttempt(test.quizTest, existingAttempt.questionOrder as number[]),
      }
    }

    // Create question order (shuffle if configured)
    let questionOrder = test.quizTest.questions.map((_, i) => i)
    if (test.quizTest.randomizeQuestions) {
      questionOrder = shuffleArray(questionOrder)
    }

    const attempt = await testRepository.startQuizAttempt(
      test.quizTest.id,
      userId,
      attemptCount + 1,
      questionOrder
    )
    if (!attempt) {
      throw ApiError.internal('Failed to start quiz attempt', 'ATTEMPT_START_FAILED')
    }

    return {
      attemptId: attempt.id,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      questionOrder: attempt.questionOrder,
      timeLimitMinutes: test.quizTest.timeLimitMinutes,
      questions: this.getQuizQuestionsForAttempt(test.quizTest, questionOrder),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Submit Quiz Attempt
  // ─────────────────────────────────────────────────────────────────────────────

  async submitQuizAttempt(testId: string, userId: string, answers: Record<string, unknown>, timeSpentSeconds?: number) {
    const test = await testRepository.findById(testId)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    if (test.testCategory !== 'QUIZ' || !test.quizTest) {
      throw ApiError.badRequest('This is not a quiz test', 'NOT_QUIZ_TEST')
    }

    // Get current attempt
    const attempt = await testRepository.getQuizAttempt(test.quizTest.id, userId)
    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      throw ApiError.badRequest('No active attempt found', 'NO_ACTIVE_ATTEMPT')
    }

    // Check time limit
    if (test.quizTest.timeLimitMinutes) {
      const timeLimitMs = test.quizTest.timeLimitMinutes * 60 * 1000
      const elapsed = Date.now() - attempt.startedAt.getTime()
      if (elapsed > timeLimitMs + 30000) { // 30 second grace period
        await testRepository.updateQuizAttempt(attempt.id, {
          status: 'TIMED_OUT',
          completedAt: new Date(),
        })
        throw ApiError.badRequest('Time limit exceeded', 'TIME_LIMIT_EXCEEDED')
      }
    }

    // Calculate score
    const { score, maxScore, passed, detailedResults } = this.calculateQuizScore(test.quizTest, answers)
    const percentageScore = maxScore > 0 ? (score / maxScore) * 100 : 0

    await testRepository.updateQuizAttempt(attempt.id, {
      answers,
      status: 'COMPLETED',
      score,
      maxScore,
      percentageScore,
      passed: test.quizTest.passingScore ? percentageScore >= test.quizTest.passingScore : undefined,
      completedAt: new Date(),
      timeSpentSeconds,
    })

    // Increment completion count
    await testRepository.incrementCompletionCount(testId)

    return {
      attemptId: attempt.id,
      score,
      maxScore,
      percentageScore,
      passed,
      showCorrectAnswers: test.quizTest.showCorrectAnswers,
      detailedResults: test.quizTest.showCorrectAnswers ? detailedResults : undefined,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Test Results (for creator)
  // ─────────────────────────────────────────────────────────────────────────────

  async getTestResults(testId: string, userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const test = await testRepository.findById(testId)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    await this.checkEditPermission(test, userId)

    if (test.testCategory === 'PERSONALITY' && test.personalityTest) {
      return testRepository.getPersonalityResults(test.personalityTest.id, page, limit)
    }

    throw ApiError.badRequest('Results not available for this test type', 'INVALID_TEST_TYPE')
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Quiz Leaderboard
  // ─────────────────────────────────────────────────────────────────────────────

  async getQuizLeaderboard(testId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const test = await testRepository.findById(testId)

    if (!test || test.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.TEST_NOT_FOUND, ERROR_CODES.TEST_NOT_FOUND)
    }

    if (test.testCategory !== 'QUIZ' || !test.quizTest) {
      throw ApiError.badRequest('This is not a quiz test', 'NOT_QUIZ_TEST')
    }

    return testRepository.getQuizLeaderboard(test.quizTest.id, page, limit)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserBadges(userId: string, displayOnly: boolean = false) {
    return testRepository.getUserBadges(userId, displayOnly)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private async checkEditPermission(
    test: NonNullable<Awaited<ReturnType<typeof testRepository.findById>>>,
    userId: string
  ) {
    if (test.creatorId !== userId) {
      if (test.organizationId) {
        const membershipResult = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, test.organizationId),
              eq(organizationMembers.userId, userId)
            )
          )
          .limit(1)

        const membership = membershipResult[0]

        if (!membership || !['OWNER', 'ADMIN', 'EDITOR'].includes(membership.role)) {
          throw ApiError.forbidden('You do not have permission to edit this test', 'NOT_AUTHORIZED')
        }
      } else {
        throw ApiError.forbidden('You do not have permission to edit this test', 'NOT_AUTHORIZED')
      }
    }
  }

  private calculatePersonalityResult(
    personalityTest: NonNullable<NonNullable<Awaited<ReturnType<typeof testRepository.findById>>>['personalityTest']>,
    responses: object
  ) {
    const result: {
      result: object
      matchedCharacterId?: string
      matchPercentage?: number
      axisScores?: object
      coordinates?: object
      quadrantId?: string
      typeCode?: string
      spectrumPercentage?: number
      segmentId?: string
      badgeData?: {
        title: string
        subtitle?: string
        imageUrl: string
        characterName?: string
        spectrumLabel?: string
      }
    } = {
      result: responses,
    }

    const userResponses = responses as Record<string, number | string>

    if (personalityTest.testType === 'CHARACTER' && personalityTest.characters.length > 0) {
      const characterScores = this.calculateCharacterScores(
        personalityTest.questions,
        personalityTest.characters,
        userResponses
      )

      const bestMatch = characterScores.reduce(
        (best, current) => (current.score > best.score ? current : best),
        { characterId: '', score: 0 }
      )

      const character = personalityTest.characters.find(c => c.id === bestMatch.characterId)
      if (character) {
        const maxPossibleScore = personalityTest.questions.length
        const matchPercentage = maxPossibleScore > 0
          ? Math.round((bestMatch.score / maxPossibleScore) * 100)
          : 0

        result.matchedCharacterId = character.id
        result.matchPercentage = Math.min(100, Math.max(0, matchPercentage))
        result.badgeData = {
          title: character.name,
          subtitle: character.tagline,
          imageUrl: character.imageUrl,
          characterName: character.name,
        }
      }
    } else if (personalityTest.testType === 'AXIS' && personalityTest.axes.length > 0) {
      const axisScores = this.calculateAxisScores(
        personalityTest.questions,
        personalityTest.axes,
        userResponses
      )
      result.axisScores = axisScores

      const coordinates: Record<string, number> = {}
      personalityTest.axes.forEach((axis) => {
        coordinates[axis.name] = axisScores[axis.name] ?? 50
      })
      result.coordinates = coordinates

      const typeCode = personalityTest.axes
        .map((axis) => {
          const score = axisScores[axis.name] ?? 50
          return score > 50 ? axis.positiveLabel[0] : axis.negativeLabel[0]
        })
        .join('')
      result.typeCode = typeCode

      if (personalityTest.quadrants.length > 0) {
        const matchedQuadrant = this.findMatchingQuadrant(
          personalityTest.quadrants,
          coordinates,
          personalityTest.axes
        )
        if (matchedQuadrant) {
          result.quadrantId = matchedQuadrant.id
        }
      }

      result.badgeData = {
        title: typeCode,
        subtitle: 'Personality Type',
        imageUrl: '/badges/personality-type.png',
      }
    } else if (personalityTest.testType === 'SPECTRUM' && personalityTest.spectrum) {
      const percentage = this.calculateSpectrumPercentage(
        personalityTest.questions,
        userResponses
      )
      result.spectrumPercentage = percentage

      const segment = personalityTest.spectrum.segments
        .sort((a, b) => a.minPercentage - b.minPercentage)
        .find((s) => percentage >= s.minPercentage && percentage <= s.maxPercentage)

      if (segment) {
        result.segmentId = segment.id
        result.badgeData = {
          title: segment.name,
          subtitle: segment.description,
          imageUrl: segment.imageUrl || '/badges/spectrum.png',
          spectrumLabel: segment.name,
        }
      }
    }

    return result
  }

  private calculateCharacterScores(
    questions: Array<{ id: string; config: unknown }>,
    characters: Array<{ id: string; metadata?: unknown }>,
    responses: Record<string, number | string>
  ): Array<{ characterId: string; score: number }> {
    return characters.map((character) => {
      let score = 0
      const metadata = (character.metadata || {}) as { traitWeights?: Record<string, number> }
      const weights = metadata.traitWeights || {}

      questions.forEach((question) => {
        const response = responses[question.id]
        if (response === undefined) return

        const config = question.config as { traitId?: string; answerWeights?: Record<string, Record<string, number>> }

        if (config.answerWeights && typeof response === 'string') {
          const answerWeight = config.answerWeights[response]
          if (answerWeight && character.id in answerWeight) {
            score += answerWeight[character.id] || 0
          }
        } else if (config.traitId && typeof response === 'number') {
          const traitWeight = weights[config.traitId] || 0
          score += response * traitWeight
        }
      })

      return { characterId: character.id, score }
    })
  }

  private calculateAxisScores(
    questions: Array<{ id: string; config: unknown; weight?: number }>,
    axes: Array<{ id: string; name: string }>,
    responses: Record<string, number | string>
  ): Record<string, number> {
    const axisScores: Record<string, { total: number; count: number }> = {}
    axes.forEach((axis) => {
      axisScores[axis.name] = { total: 0, count: 0 }
    })

    questions.forEach((question) => {
      const response = responses[question.id]
      if (response === undefined) return

      const config = question.config as { axisId?: string; direction?: number }
      const weight = question.weight ?? 1

      if (config.axisId) {
        const axis = axes.find((a) => a.id === config.axisId)
        if (axis && typeof response === 'number') {
          const direction = config.direction ?? 1
          const normalizedScore = (response - 1) / 4 * 100
          const adjustedScore = direction > 0 ? normalizedScore : 100 - normalizedScore

          const axisData = axisScores[axis.name]
          if (axisData) {
            axisData.total += adjustedScore * weight
            axisData.count += weight
          }
        }
      }
    })

    const result: Record<string, number> = {}
    axes.forEach((axis) => {
      const data = axisScores[axis.name]
      if (data && data.count > 0) {
        result[axis.name] = Math.round(data.total / data.count)
      } else {
        result[axis.name] = 50
      }
    })

    return result
  }

  private findMatchingQuadrant(
    quadrants: Array<{ id: string; axisConditions: unknown }>,
    coordinates: Record<string, number>,
    axes: Array<{ id: string; name: string }>
  ): { id: string } | null {
    for (const quadrant of quadrants) {
      const conditions = quadrant.axisConditions as Record<string, { min?: number; max?: number }>
      if (!conditions) continue

      let matches = true
      for (const axis of axes) {
        const condition = conditions[axis.id]
        const value = coordinates[axis.name] ?? 50

        if (condition) {
          if (condition.min !== undefined && value < condition.min) matches = false
          if (condition.max !== undefined && value > condition.max) matches = false
        }
      }

      if (matches) return { id: quadrant.id }
    }
    return null
  }

  private calculateSpectrumPercentage(
    questions: Array<{ id: string; config: unknown; weight?: number }>,
    responses: Record<string, number | string>
  ): number {
    let totalScore = 0
    let totalWeight = 0

    questions.forEach((question) => {
      const response = responses[question.id]
      if (response === undefined || typeof response !== 'number') return

      const weight = question.weight ?? 1
      const config = question.config as { direction?: number; maxValue?: number }
      const direction = config.direction ?? 1
      const maxValue = config.maxValue ?? 5

      const normalizedScore = ((response - 1) / (maxValue - 1)) * 100
      const adjustedScore = direction > 0 ? normalizedScore : 100 - normalizedScore

      totalScore += adjustedScore * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50
  }

  private calculateQuizScore(
    quizTest: NonNullable<NonNullable<Awaited<ReturnType<typeof testRepository.findById>>>['quizTest']>,
    answers: Record<string, unknown>
  ) {
    let score = 0
    let maxScore = 0
    const detailedResults: Array<{
      questionIndex: number
      correct: boolean
      points: number
      userAnswer: unknown
      correctAnswer: unknown
    }> = []

    quizTest.questions.forEach((question, index) => {
      maxScore += question.points
      const userAnswer = answers[String(index)]
      const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)

      if (isCorrect) {
        score += question.points
      } else if (question.negativePoints > 0 && userAnswer !== undefined) {
        score -= question.negativePoints
      }

      detailedResults.push({
        questionIndex: index,
        correct: isCorrect,
        points: isCorrect ? question.points : (userAnswer !== undefined ? -question.negativePoints : 0),
        userAnswer,
        correctAnswer: question.correctAnswer,
      })
    })

    const passed = quizTest.passingScore
      ? (maxScore > 0 ? (score / maxScore) * 100 : 0) >= quizTest.passingScore
      : undefined

    return { score: Math.max(0, score), maxScore, passed, detailedResults }
  }

  private getQuizQuestionsForAttempt(
    quizTest: NonNullable<NonNullable<Awaited<ReturnType<typeof testRepository.findById>>>['quizTest']>,
    questionOrder: number[]
  ) {
    return questionOrder.map((index) => {
      const question = quizTest.questions[index]
      if (!question) return null

      let options: unknown = question.options
      if (quizTest.randomizeOptions && Array.isArray(options)) {
        options = shuffleArray(options)
      }

      return {
        index,
        type: question.type,
        text: question.text,
        imageUrl: question.imageUrl,
        options,
        points: question.points,
        timeLimitSeconds: question.timeLimitSeconds,
        difficulty: question.difficulty,
      }
    }).filter(Boolean)
  }
}

// Export singleton
export const testService = new TestServiceClass()

// Export class for testing
export { TestServiceClass as TestService }
