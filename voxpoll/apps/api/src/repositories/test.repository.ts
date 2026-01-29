// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TEST REPOSITORY
// Data access layer for test operations
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  or,
  desc,
  asc,
  sql,
  isNull,
  ilike,
  inArray,
  tests,
  personalityTests,
  personalityTestQuestions,
  personalityTestResults,
  testAxes,
  testQuadrants,
  testCharacters,
  testSpectrums,
  testSpectrumSegments,
  quizTests,
  quizQuestions,
  quizAttempts,
  testResultBadges,
  users,
  organizations,
  categories,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import type { PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Test = InferSelectModel<typeof tests>
export type PersonalityTest = InferSelectModel<typeof personalityTests>
export type QuizTest = InferSelectModel<typeof quizTests>
export type QuizAttempt = InferSelectModel<typeof quizAttempts>
export type PersonalityTestResult = InferSelectModel<typeof personalityTestResults>
export type TestResultBadge = InferSelectModel<typeof testResultBadges>

export type TestSortOption = 'recent' | 'popular' | 'trending'
export type TestCategory = 'PERSONALITY' | 'QUIZ'

export interface TestFilters {
  status?: string
  visibility?: string
  testCategory?: TestCategory
  categoryId?: string
  creatorId?: string
  organizationId?: string
  search?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Repository Class
// ─────────────────────────────────────────────────────────────────────────────

class TestRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Find Tests
  // ─────────────────────────────────────────────────────────────────────────────

  async findMany(filters: TestFilters, page: number, limit: number, sort: TestSortOption = 'recent') {
    const skip = (page - 1) * limit

    const conditions = [isNull(tests.deletedAt)]
    if (filters.status) conditions.push(eq(tests.status, filters.status as 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'ARCHIVED'))
    if (filters.visibility) conditions.push(eq(tests.visibility, filters.visibility as 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'FOLLOWERS_ONLY' | 'ORGANIZATION_ONLY'))
    if (filters.testCategory) conditions.push(eq(tests.testCategory, filters.testCategory))
    if (filters.categoryId) conditions.push(eq(tests.categoryId, filters.categoryId))
    if (filters.creatorId) conditions.push(eq(tests.creatorId, filters.creatorId))
    if (filters.organizationId) conditions.push(eq(tests.organizationId, filters.organizationId))
    if (filters.search) {
      conditions.push(
        or(
          ilike(tests.title, `%${filters.search}%`),
          ilike(tests.description, `%${filters.search}%`)
        )!
      )
    }

    const orderBy =
      sort === 'popular' ? desc(tests.completionCount) :
      sort === 'trending' ? desc(tests.hotScore) :
      desc(tests.createdAt)

    const [items, countResult] = await Promise.all([
      db
        .select({
          test: tests,
          creator: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
          organization: {
            id: organizations.id,
            name: organizations.name,
            slug: organizations.slug,
            logoUrl: organizations.logoUrl,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(tests)
        .leftJoin(users, eq(tests.creatorId, users.id))
        .leftJoin(organizations, eq(tests.organizationId, organizations.id))
        .leftJoin(categories, eq(tests.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(orderBy)
        .offset(skip)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tests)
        .where(and(...conditions)),
    ])

    const total = countResult[0]?.count ?? 0

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }

    return {
      items: items.map(item => ({
        ...item.test,
        creator: item.creator,
        organization: item.organization,
        category: item.category,
      })),
      meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Find Test by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async findById(id: string) {
    const testResults = await db
      .select({
        test: tests,
        creator: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
        organization: {
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          logoUrl: organizations.logoUrl,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(tests)
      .leftJoin(users, eq(tests.creatorId, users.id))
      .leftJoin(organizations, eq(tests.organizationId, organizations.id))
      .leftJoin(categories, eq(tests.categoryId, categories.id))
      .where(eq(tests.id, id))
      .limit(1)

    const result = testResults[0]
    if (!result) return null

    // Get personality test data if exists
    const personalityTestData = await db
      .select()
      .from(personalityTests)
      .where(eq(personalityTests.testId, id))
      .limit(1)

    let personalityTest = null
    const pt = personalityTestData[0]
    if (pt) {
      const [questions, axes, quadrants, characters, spectrumData] = await Promise.all([
        db.select().from(personalityTestQuestions).where(eq(personalityTestQuestions.testId, pt.id)).orderBy(asc(personalityTestQuestions.position)),
        db.select().from(testAxes).where(eq(testAxes.testId, pt.id)).orderBy(asc(testAxes.position)),
        db.select().from(testQuadrants).where(eq(testQuadrants.testId, pt.id)),
        db.select().from(testCharacters).where(eq(testCharacters.testId, pt.id)).orderBy(asc(testCharacters.position)),
        db.select().from(testSpectrums).where(eq(testSpectrums.testId, pt.id)).limit(1),
      ])

      let spectrum = null
      const spectrumItem = spectrumData[0]
      if (spectrumItem) {
        const segments = await db
          .select()
          .from(testSpectrumSegments)
          .where(eq(testSpectrumSegments.spectrumId, spectrumItem.id))
          .orderBy(asc(testSpectrumSegments.position))
        spectrum = { ...spectrumItem, segments }
      }

      personalityTest = {
        ...pt,
        questions,
        axes,
        quadrants,
        characters,
        spectrum,
      }
    }

    // Get quiz test data if exists
    const quizTestData = await db
      .select()
      .from(quizTests)
      .where(eq(quizTests.testId, id))
      .limit(1)

    let quizTest = null
    const qt = quizTestData[0]
    if (qt) {
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.testId, qt.id))
        .orderBy(asc(quizQuestions.orderIndex))

      quizTest = { ...qt, questions }
    }

    return {
      ...result.test,
      creator: result.creator,
      organization: result.organization,
      category: result.category,
      personalityTest,
      quizTest,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Find Test by Slug
  // ─────────────────────────────────────────────────────────────────────────────

  async findBySlug(slug: string) {
    const testResults = await db
      .select({
        test: tests,
        creator: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
        organization: {
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          logoUrl: organizations.logoUrl,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(tests)
      .leftJoin(users, eq(tests.creatorId, users.id))
      .leftJoin(organizations, eq(tests.organizationId, organizations.id))
      .leftJoin(categories, eq(tests.categoryId, categories.id))
      .where(eq(tests.slug, slug))
      .limit(1)

    const result = testResults[0]
    if (!result) return null
    const id = result.test.id

    // Get personality test data if exists
    const personalityTestData = await db
      .select()
      .from(personalityTests)
      .where(eq(personalityTests.testId, id))
      .limit(1)

    let personalityTest = null
    const pt = personalityTestData[0]
    if (pt) {
      const [questions, axes, quadrants, characters, spectrumData] = await Promise.all([
        db.select().from(personalityTestQuestions).where(eq(personalityTestQuestions.testId, pt.id)).orderBy(asc(personalityTestQuestions.position)),
        db.select().from(testAxes).where(eq(testAxes.testId, pt.id)).orderBy(asc(testAxes.position)),
        db.select().from(testQuadrants).where(eq(testQuadrants.testId, pt.id)),
        db.select().from(testCharacters).where(eq(testCharacters.testId, pt.id)).orderBy(asc(testCharacters.position)),
        db.select().from(testSpectrums).where(eq(testSpectrums.testId, pt.id)).limit(1),
      ])

      let spectrum = null
      const spectrumItem = spectrumData[0]
      if (spectrumItem) {
        const segments = await db
          .select()
          .from(testSpectrumSegments)
          .where(eq(testSpectrumSegments.spectrumId, spectrumItem.id))
          .orderBy(asc(testSpectrumSegments.position))
        spectrum = { ...spectrumItem, segments }
      }

      personalityTest = {
        ...pt,
        questions,
        axes,
        quadrants,
        characters,
        spectrum,
      }
    }

    // Get quiz test data if exists
    const quizTestData = await db
      .select()
      .from(quizTests)
      .where(eq(quizTests.testId, id))
      .limit(1)

    let quizTest = null
    const qt = quizTestData[0]
    if (qt) {
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.testId, qt.id))
        .orderBy(asc(quizQuestions.orderIndex))

      quizTest = { ...qt, questions }
    }

    return {
      ...result.test,
      creator: result.creator,
      organization: result.organization,
      category: result.category,
      personalityTest,
      quizTest,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Base Test
  // ─────────────────────────────────────────────────────────────────────────────

  async create(data: {
    creatorId: string
    organizationId?: string
    testCategory: TestCategory
    title: string
    description?: string
    slug: string
    categoryId?: string
    tags?: string[]
    coverImageUrl?: string
  }) {
    const result = await db
      .insert(tests)
      .values({
        creatorId: data.creatorId,
        organizationId: data.organizationId,
        testCategory: data.testCategory,
        title: data.title,
        description: data.description,
        slug: data.slug,
        categoryId: data.categoryId,
        tags: data.tags || [],
        coverImageUrl: data.coverImageUrl,
      })
      .returning()

    const test = result[0]

    // Get creator and organization
    const creatorResult = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, data.creatorId))
      .limit(1)

    let org = null
    if (data.organizationId) {
      const orgResult = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          logoUrl: organizations.logoUrl,
        })
        .from(organizations)
        .where(eq(organizations.id, data.organizationId))
        .limit(1)
      org = orgResult[0] ?? null
    }

    return {
      ...test,
      creator: creatorResult[0] ?? null,
      organization: org,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Personality Test
  // ─────────────────────────────────────────────────────────────────────────────

  async createPersonalityTest(testId: string, data: {
    testType: string
    settings: object
  }) {
    const result = await db
      .insert(personalityTests)
      .values({
        testId,
        testType: data.testType as 'AXIS' | 'CHARACTER' | 'SPECTRUM',
        settings: data.settings,
      })
      .returning()

    return result[0]
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Quiz Test
  // ─────────────────────────────────────────────────────────────────────────────

  async createQuizTest(testId: string, data: {
    quizType: string
    timeLimitMinutes?: number
    attemptsAllowed?: number
    passingScore?: number
    showCorrectAnswers?: boolean
    showScoreImmediately?: boolean
    randomizeQuestions?: boolean
    randomizeOptions?: boolean
    startsAt?: Date
    endsAt?: Date
  }) {
    const result = await db
      .insert(quizTests)
      .values({
        testId,
        quizType: data.quizType as 'KNOWLEDGE' | 'TRIVIA' | 'EDUCATIONAL' | 'SKILL_ASSESSMENT',
        timeLimitMinutes: data.timeLimitMinutes,
        attemptsAllowed: data.attemptsAllowed ?? 1,
        passingScore: data.passingScore,
        showCorrectAnswers: data.showCorrectAnswers ?? true,
        showScoreImmediately: data.showScoreImmediately ?? true,
        randomizeQuestions: data.randomizeQuestions ?? false,
        randomizeOptions: data.randomizeOptions ?? false,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
      })
      .returning()

    return result[0]
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Test
  // ─────────────────────────────────────────────────────────────────────────────

  async update(id: string, data: Partial<{
    title: string
    description: string
    tags: string[]
    coverImageUrl: string
    categoryId: string
  }>) {
    const result = await db
      .update(tests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tests.id, id))
      .returning()

    const test = result[0]
    if (!test) return null

    const creatorResult = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, test.creatorId))
      .limit(1)

    return {
      ...test,
      creator: creatorResult[0] ?? null,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Soft Delete Test
  // ─────────────────────────────────────────────────────────────────────────────

  async softDelete(id: string) {
    const result = await db
      .update(tests)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(tests.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Publish Test
  // ─────────────────────────────────────────────────────────────────────────────

  async publish(id: string) {
    const result = await db
      .update(tests)
      .set({
        status: 'ACTIVE',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tests.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Add Personality Test Question
  // ─────────────────────────────────────────────────────────────────────────────

  async addPersonalityQuestion(testId: string, data: {
    position: number
    text: string
    questionType: string
    config: object
    weight?: number
    imageUrl?: string
  }) {
    const result = await db
      .insert(personalityTestQuestions)
      .values({
        testId,
        position: data.position,
        text: data.text,
        questionType: data.questionType as 'STATEMENT_AGREE_5' | 'STATEMENT_AGREE_7' | 'AGREE_DISAGREE' | 'FORCED_CHOICE',
        config: data.config,
        weight: data.weight ?? 1,
        imageUrl: data.imageUrl,
      })
      .returning()

    return result[0]
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Add Quiz Question
  // ─────────────────────────────────────────────────────────────────────────────

  async addQuizQuestion(testId: string, data: {
    orderIndex: number
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
  }) {
    const result = await db
      .insert(quizQuestions)
      .values({
        testId,
        orderIndex: data.orderIndex,
        type: data.type as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE',
        text: data.text,
        explanation: data.explanation,
        options: data.options,
        correctAnswer: data.correctAnswer,
        points: data.points ?? 1,
        negativePoints: data.negativePoints ?? 0,
        timeLimitSeconds: data.timeLimitSeconds,
        difficulty: (data.difficulty as 'EASY' | 'MEDIUM' | 'HARD') ?? 'MEDIUM',
        imageUrl: data.imageUrl,
      })
      .returning()

    return result[0]
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Submit Personality Test Result
  // ─────────────────────────────────────────────────────────────────────────────

  async submitPersonalityResult(testId: string, data: {
    userId?: string
    sessionId?: string
    participantHash?: string
    testType: string
    responses: object
    calculatedResult: object
    matchedCharacterId?: string
    matchPercentage?: number
    axisScores?: object
    coordinates?: object
    quadrantId?: string
    typeCode?: string
    spectrumPercentage?: number
    segmentId?: string
    timeSpentSeconds?: number
    qualityScore?: number
    qualityFlags?: string[]
  }) {
    const result = await db
      .insert(personalityTestResults)
      .values({
        testId,
        userId: data.userId,
        sessionId: data.sessionId,
        participantHash: data.participantHash,
        testType: data.testType as 'AXIS' | 'CHARACTER' | 'SPECTRUM',
        responses: data.responses,
        calculatedResult: data.calculatedResult,
        matchedCharacterId: data.matchedCharacterId,
        matchPercentage: data.matchPercentage,
        axisScores: data.axisScores,
        coordinates: data.coordinates,
        quadrantId: data.quadrantId,
        typeCode: data.typeCode,
        spectrumPercentage: data.spectrumPercentage,
        segmentId: data.segmentId,
        timeSpentSeconds: data.timeSpentSeconds,
        qualityScore: data.qualityScore,
        qualityFlags: data.qualityFlags || [],
      })
      .returning()

    return result[0]
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Start Quiz Attempt
  // ─────────────────────────────────────────────────────────────────────────────

  async startQuizAttempt(testId: string, userId: string, attemptNumber: number, questionOrder: number[]) {
    const result = await db
      .insert(quizAttempts)
      .values({
        testId,
        userId,
        attemptNumber,
        status: 'IN_PROGRESS',
        answers: {},
        startedAt: new Date(),
        questionOrder,
      })
      .returning()

    return result[0]
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Quiz Attempt
  // ─────────────────────────────────────────────────────────────────────────────

  async updateQuizAttempt(attemptId: string, data: {
    answers?: object
    status?: string
    score?: number
    maxScore?: number
    percentageScore?: number
    passed?: boolean
    completedAt?: Date
    timeSpentSeconds?: number
    qualityScore?: number
    qualityFlags?: string[]
    tabSwitchCount?: number
  }) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (data.answers !== undefined) updateData['answers'] = data.answers
    if (data.status) updateData['status'] = data.status as 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT' | 'ABANDONED'
    if (data.score !== undefined) updateData['score'] = data.score
    if (data.maxScore !== undefined) updateData['maxScore'] = data.maxScore
    if (data.percentageScore !== undefined) updateData['percentageScore'] = data.percentageScore
    if (data.passed !== undefined) updateData['passed'] = data.passed
    if (data.completedAt) updateData['completedAt'] = data.completedAt
    if (data.timeSpentSeconds !== undefined) updateData['timeSpentSeconds'] = data.timeSpentSeconds
    if (data.qualityScore !== undefined) updateData['qualityScore'] = data.qualityScore
    if (data.qualityFlags) updateData['qualityFlags'] = data.qualityFlags
    if (data.tabSwitchCount !== undefined) updateData['tabSwitchCount'] = data.tabSwitchCount

    const result = await db
      .update(quizAttempts)
      .set(updateData)
      .where(eq(quizAttempts.id, attemptId))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Quiz Attempt
  // ─────────────────────────────────────────────────────────────────────────────

  async getQuizAttempt(testId: string, userId: string, attemptNumber?: number) {
    if (attemptNumber) {
      const result = await db
        .select()
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.testId, testId),
            eq(quizAttempts.userId, userId),
            eq(quizAttempts.attemptNumber, attemptNumber)
          )
        )
        .limit(1)
      return result[0] ?? null
    }

    // Get latest attempt
    const result = await db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.testId, testId), eq(quizAttempts.userId, userId)))
      .orderBy(desc(quizAttempts.attemptNumber))
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Attempt Count
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserAttemptCount(testId: string, userId: string) {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.testId, testId), eq(quizAttempts.userId, userId)))

    return result[0]?.count ?? 0
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Personality Test Result
  // ─────────────────────────────────────────────────────────────────────────────

  async getPersonalityResult(testId: string, participantHash: string) {
    const result = await db
      .select()
      .from(personalityTestResults)
      .where(
        and(
          eq(personalityTestResults.testId, testId),
          eq(personalityTestResults.participantHash, participantHash)
        )
      )
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Test Results (for creator)
  // ─────────────────────────────────────────────────────────────────────────────

  async getPersonalityResults(testId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const conditions = [
      eq(personalityTestResults.testId, testId),
      eq(personalityTestResults.isValid, true),
    ]

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: personalityTestResults.id,
          testType: personalityTestResults.testType,
          calculatedResult: personalityTestResults.calculatedResult,
          matchedCharacterId: personalityTestResults.matchedCharacterId,
          matchPercentage: personalityTestResults.matchPercentage,
          axisScores: personalityTestResults.axisScores,
          typeCode: personalityTestResults.typeCode,
          spectrumPercentage: personalityTestResults.spectrumPercentage,
          completedAt: personalityTestResults.completedAt,
          timeSpentSeconds: personalityTestResults.timeSpentSeconds,
          qualityScore: personalityTestResults.qualityScore,
        })
        .from(personalityTestResults)
        .where(and(...conditions))
        .orderBy(desc(personalityTestResults.completedAt))
        .offset(skip)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(personalityTestResults)
        .where(and(...conditions)),
    ])

    const total = countResult[0]?.count ?? 0

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }

    return { items, meta }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Quiz Leaderboard
  // ─────────────────────────────────────────────────────────────────────────────

  async getQuizLeaderboard(testId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const conditions = [
      eq(quizAttempts.testId, testId),
      eq(quizAttempts.status, 'COMPLETED'),
      eq(quizAttempts.isValid, true),
    ]

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(quizAttempts)
        .where(and(...conditions))
        .orderBy(desc(quizAttempts.percentageScore), asc(quizAttempts.timeSpentSeconds))
        .offset(skip)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(quizAttempts)
        .where(and(...conditions)),
    ])

    // Get user info separately
    const userIds = [...new Set(items.map((i) => i.userId))]
    const usersData = userIds.length > 0
      ? await db
          .select({
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          })
          .from(users)
          .where(inArray(users.id, userIds))
      : []

    const userMap = new Map(usersData.map((u) => [u.id, u]))

    const total = countResult[0]?.count ?? 0

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }

    return {
      items: items.map((item, index) => ({
        rank: skip + index + 1,
        user: userMap.get(item.userId),
        score: item.percentageScore,
        timeSpentSeconds: item.timeSpentSeconds,
        completedAt: item.completedAt,
      })),
      meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Increment View Count
  // ─────────────────────────────────────────────────────────────────────────────

  async incrementViewCount(id: string) {
    const result = await db
      .update(tests)
      .set({ viewCount: sql`${tests.viewCount} + 1`, updatedAt: new Date() })
      .where(eq(tests.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Increment Completion Count
  // ─────────────────────────────────────────────────────────────────────────────

  async incrementCompletionCount(id: string) {
    const result = await db
      .update(tests)
      .set({ completionCount: sql`${tests.completionCount} + 1`, updatedAt: new Date() })
      .where(eq(tests.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Test Result Badge
  // ─────────────────────────────────────────────────────────────────────────────

  async createResultBadge(data: {
    testId: string
    userId: string
    resultType: string
    resultTitle: string
    resultSubtitle?: string
    resultImageUrl: string
    axisScores?: object
    characterName?: string
    matchPercentage?: number
    spectrumScore?: number
    spectrumLabel?: string
  }) {
    // Check if exists
    const existing = await db
      .select()
      .from(testResultBadges)
      .where(
        and(
          eq(testResultBadges.testId, data.testId),
          eq(testResultBadges.userId, data.userId)
        )
      )
      .limit(1)

    const existingBadge = existing[0]
    if (existingBadge) {
      // Update
      const result = await db
        .update(testResultBadges)
        .set({
          resultType: data.resultType as 'AXIS' | 'CHARACTER' | 'SPECTRUM',
          resultTitle: data.resultTitle,
          resultSubtitle: data.resultSubtitle,
          resultImageUrl: data.resultImageUrl,
          axisScores: data.axisScores,
          characterName: data.characterName,
          matchPercentage: data.matchPercentage,
          spectrumScore: data.spectrumScore,
          spectrumLabel: data.spectrumLabel,
          earnedAt: new Date(),
        })
        .where(eq(testResultBadges.id, existingBadge.id))
        .returning()
      return result[0]
    } else {
      // Create
      const result = await db
        .insert(testResultBadges)
        .values({
          testId: data.testId,
          userId: data.userId,
          resultType: data.resultType as 'AXIS' | 'CHARACTER' | 'SPECTRUM',
          resultTitle: data.resultTitle,
          resultSubtitle: data.resultSubtitle,
          resultImageUrl: data.resultImageUrl,
          axisScores: data.axisScores,
          characterName: data.characterName,
          matchPercentage: data.matchPercentage,
          spectrumScore: data.spectrumScore,
          spectrumLabel: data.spectrumLabel,
        })
        .returning()
      return result[0]
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Test Badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserBadges(userId: string, displayOnly: boolean = false) {
    const conditions = [eq(testResultBadges.userId, userId)]
    if (displayOnly) conditions.push(eq(testResultBadges.displayOnProfile, true))

    const badgesData = await db
      .select()
      .from(testResultBadges)
      .where(and(...conditions))
      .orderBy(asc(testResultBadges.pinnedPosition), desc(testResultBadges.earnedAt))

    // Get test info for each badge
    const badgesWithTests = await Promise.all(
      badgesData.map(async (badge) => {
        const ptResult = await db
          .select()
          .from(personalityTests)
          .where(eq(personalityTests.id, badge.testId))
          .limit(1)

        let testInfo = null
        const ptItem = ptResult[0]
        if (ptItem) {
          const testResult = await db
            .select({ id: tests.id, title: tests.title, slug: tests.slug })
            .from(tests)
            .where(eq(tests.id, ptItem.testId))
            .limit(1)
          testInfo = testResult[0] ?? null
        }

        return {
          ...badge,
          test: {
            test: testInfo,
          },
        }
      })
    )

    return badgesWithTests
  }
}

// Export singleton
export const testRepository = new TestRepositoryClass()

// Export class for testing
export { TestRepositoryClass as TestRepository }
