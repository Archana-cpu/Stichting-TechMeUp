// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SURVEY REPOSITORY
// Data access layer for survey operations
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  desc,
  asc,
  sql,
  isNull,
  surveys,
  surveySections,
  surveyQuestions,
  surveyResponses,
  users,
  organizations,
  categories,
  type ContentStatus,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import { buildPaginationMeta, type PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Survey = InferSelectModel<typeof surveys>
export type SurveySection = InferSelectModel<typeof surveySections>
export type SurveyQuestion = InferSelectModel<typeof surveyQuestions>
export type SurveyResponse = InferSelectModel<typeof surveyResponses>

export interface SurveyFilters {
  status?: ContentStatus
  organizationId?: string
  creatorId?: string
  categoryId?: string
}

export type SurveySortOption = 'recent' | 'responses' | 'completion'

// ─────────────────────────────────────────────────────────────────────────────
// Survey Repository
// ─────────────────────────────────────────────────────────────────────────────

class SurveyRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Find By ID
  // ─────────────────────────────────────────────────────────────────────────────

  async findById(id: string) {
    // Get survey with creator and organization
    const surveyResults = await db
      .select({
        survey: surveys,
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
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(surveys)
      .leftJoin(users, eq(surveys.creatorId, users.id))
      .leftJoin(organizations, eq(surveys.organizationId, organizations.id))
      .leftJoin(categories, eq(surveys.categoryId, categories.id))
      .where(eq(surveys.id, id))
      .limit(1)

    const result = surveyResults[0]
    if (!result) return null

    const sectionsData = await db
      .select()
      .from(surveySections)
      .where(eq(surveySections.surveyId, id))
      .orderBy(asc(surveySections.orderIndex))

    const sectionsWithQuestions = await Promise.all(
      sectionsData.map(async (section) => {
        const questions = await db
          .select()
          .from(surveyQuestions)
          .where(eq(surveyQuestions.sectionId, section.id))
          .orderBy(asc(surveyQuestions.orderIndex))
        return { ...section, questions }
      })
    )

    // Get response count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, id))

    return {
      ...result.survey,
      creator: result.creator,
      organization: result.organization,
      category: result.category,
      sections: sectionsWithQuestions,
      _count: {
        responses: countResult[0]?.count ?? 0,
      },
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Find By Slug
  // ─────────────────────────────────────────────────────────────────────────────

  async findBySlug(slug: string) {
    const surveyResults = await db
      .select({
        survey: surveys,
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
        },
      })
      .from(surveys)
      .leftJoin(users, eq(surveys.creatorId, users.id))
      .leftJoin(organizations, eq(surveys.organizationId, organizations.id))
      .where(eq(surveys.slug, slug))
      .limit(1)

    const result = surveyResults[0]
    if (!result) return null

    const sectionsData = await db
      .select()
      .from(surveySections)
      .where(eq(surveySections.surveyId, result.survey.id))
      .orderBy(asc(surveySections.orderIndex))

    const sectionsWithQuestions = await Promise.all(
      sectionsData.map(async (section) => {
        const questions = await db
          .select()
          .from(surveyQuestions)
          .where(eq(surveyQuestions.sectionId, section.id))
          .orderBy(asc(surveyQuestions.orderIndex))
        return { ...section, questions }
      })
    )

    return {
      ...result.survey,
      creator: result.creator,
      organization: result.organization,
      sections: sectionsWithQuestions,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Find Many with Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  async findMany(
    filters: SurveyFilters,
    page: number,
    limit: number,
    sort: SurveySortOption = 'recent'
  ) {
    const skip = (page - 1) * limit

    const conditions = [isNull(surveys.deletedAt)]
    if (filters.status) conditions.push(eq(surveys.status, filters.status))
    if (filters.organizationId) conditions.push(eq(surveys.organizationId, filters.organizationId))
    if (filters.creatorId) conditions.push(eq(surveys.creatorId, filters.creatorId))
    if (filters.categoryId) conditions.push(eq(surveys.categoryId, filters.categoryId))

    const orderBy =
      sort === 'responses'
        ? desc(surveys.responseCount)
        : sort === 'completion'
          ? desc(surveys.completionRate)
          : desc(surveys.createdAt)

    const [items, countResult] = await Promise.all([
      db
        .select({
          survey: surveys,
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
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(surveys)
        .leftJoin(users, eq(surveys.creatorId, users.id))
        .leftJoin(organizations, eq(surveys.organizationId, organizations.id))
        .leftJoin(categories, eq(surveys.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(orderBy)
        .offset(skip)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(surveys)
        .where(and(...conditions)),
    ])

    // Get counts for each survey
    const itemsWithCounts = await Promise.all(
      items.map(async (item) => {
        const [responseCount, sectionCount] = await Promise.all([
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(surveyResponses)
            .where(eq(surveyResponses.surveyId, item.survey.id)),
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(surveySections)
            .where(eq(surveySections.surveyId, item.survey.id)),
        ])

        return {
          ...item.survey,
          creator: item.creator,
          organization: item.organization,
          category: item.category,
          _count: {
            responses: responseCount[0]?.count ?? 0,
            sections: sectionCount[0]?.count ?? 0,
          },
        }
      })
    )

    const total = countResult[0]?.count ?? 0

    return {
      items: itemsWithCounts,
      meta: buildPaginationMeta(page, limit, total),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Survey
  // ─────────────────────────────────────────────────────────────────────────────

  async create(data: {
    creatorId: string
    organizationId: string
    title: string
    description?: string
    slug: string
    type?: string
    categoryId?: string
    tags?: string[]
  }) {
    const result = await db
      .insert(surveys)
      .values({
        creatorId: data.creatorId,
        organizationId: data.organizationId,
        title: data.title,
        description: data.description,
        slug: data.slug,
        type: (data.type as 'STANDARD' | 'LONGITUDINAL' | 'PANEL' | 'ANONYMOUS' | 'INCENTIVIZED') || 'STANDARD',
        categoryId: data.categoryId,
        tags: data.tags || [],
        status: 'DRAFT',
      })
      .returning()

    const survey = result[0]

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

    const orgResult = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
      })
      .from(organizations)
      .where(eq(organizations.id, data.organizationId))
      .limit(1)

    return {
      ...survey,
      creator: creatorResult[0] ?? null,
      organization: orgResult[0] ?? null,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Survey
  // ─────────────────────────────────────────────────────────────────────────────

  async update(id: string, data: Partial<Survey>) {
    const result = await db
      .update(surveys)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(surveys.id, id))
      .returning()

    const survey = result[0]
    if (!survey) return null

    // Get creator
    const creatorResult = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, survey.creatorId))
      .limit(1)

    // Get sections with questions
    const sectionsData = await db
      .select()
      .from(surveySections)
      .where(eq(surveySections.surveyId, id))
      .orderBy(asc(surveySections.orderIndex))

    const sectionsWithQuestions = await Promise.all(
      sectionsData.map(async (section) => {
        const questions = await db
          .select()
          .from(surveyQuestions)
          .where(eq(surveyQuestions.sectionId, section.id))
          .orderBy(asc(surveyQuestions.orderIndex))
        return { ...section, questions }
      })
    )

    return {
      ...survey,
      creator: creatorResult[0] ?? null,
      sections: sectionsWithQuestions,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Soft Delete
  // ─────────────────────────────────────────────────────────────────────────────

  async softDelete(id: string) {
    const result = await db
      .update(surveys)
      .set({
        status: 'ARCHIVED',
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Publish Survey
  // ─────────────────────────────────────────────────────────────────────────────

  async publish(id: string) {
    const result = await db
      .update(surveys)
      .set({
        status: 'ACTIVE',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Section Operations
  // ─────────────────────────────────────────────────────────────────────────────

  async createSection(surveyId: string, data: {
    title?: string
    description?: string
    orderIndex: number
  }) {
    const result = await db
      .insert(surveySections)
      .values({
        surveyId,
        title: data.title,
        description: data.description,
        orderIndex: data.orderIndex,
      })
      .returning()

    const section = result[0]
    if (!section) throw new Error('Failed to create section')

    const questions = await db
      .select()
      .from(surveyQuestions)
      .where(eq(surveyQuestions.sectionId, section.id))

    return { ...section, questions }
  }

  async updateSection(sectionId: string, data: Partial<SurveySection>) {
    const result = await db
      .update(surveySections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(surveySections.id, sectionId))
      .returning()

    const section = result[0]
    if (!section) return null

    const questions = await db
      .select()
      .from(surveyQuestions)
      .where(eq(surveyQuestions.sectionId, sectionId))
      .orderBy(asc(surveyQuestions.orderIndex))

    return { ...section, questions }
  }

  async deleteSection(sectionId: string) {
    const result = await db
      .delete(surveySections)
      .where(eq(surveySections.id, sectionId))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Question Operations
  // ─────────────────────────────────────────────────────────────────────────────

  async createQuestion(sectionId: string, data: {
    type: string
    text: string
    description?: string
    orderIndex: number
    isRequired?: boolean
    options?: object
    validation?: object
  }) {
    const result = await db
      .insert(surveyQuestions)
      .values({
        sectionId,
        type: data.type as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'RANKING' | 'RATING_SCALE' | 'OPEN_TEXT' | 'SLIDER' | 'MATRIX_SINGLE' | 'MATRIX_MULTIPLE' | 'DATE' | 'TIME' | 'FILE_UPLOAD' | 'NPS' | 'LIKERT' | 'SEMANTIC_DIFFERENTIAL',
        text: data.text,
        description: data.description,
        orderIndex: data.orderIndex,
        isRequired: data.isRequired ?? false,
        options: (data.options as object) || [],
        validation: (data.validation as object) || {},
      })
      .returning()

    return result[0]
  }

  async updateQuestion(questionId: string, data: Partial<SurveyQuestion>) {
    const result = await db
      .update(surveyQuestions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(surveyQuestions.id, questionId))
      .returning()

    return result[0] ?? null
  }

  async deleteQuestion(questionId: string) {
    const result = await db
      .delete(surveyQuestions)
      .where(eq(surveyQuestions.id, questionId))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Response Operations
  // ─────────────────────────────────────────────────────────────────────────────

  async findResponse(surveyId: string, participantHash: string) {
    const result = await db
      .select()
      .from(surveyResponses)
      .where(
        and(
          eq(surveyResponses.surveyId, surveyId),
          eq(surveyResponses.participantHash, participantHash)
        )
      )
      .limit(1)

    return result[0] ?? null
  }

  async createResponse(data: {
    surveyId: string
    participantHash: string
    answers: object
  }) {
    const now = new Date()
    const result = await db
      .insert(surveyResponses)
      .values({
        surveyId: data.surveyId,
        participantHash: data.participantHash,
        answers: data.answers,
        status: 'COMPLETED',
        startedAt: now,
        completedAt: now,
        lastActivityAt: now,
      })
      .returning()

    return result[0]
  }

  async getResponses(surveyId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(surveyResponses)
        .where(eq(surveyResponses.surveyId, surveyId))
        .orderBy(desc(surveyResponses.createdAt))
        .offset(skip)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(surveyResponses)
        .where(eq(surveyResponses.surveyId, surveyId)),
    ])

    const total = countResult[0]?.count ?? 0

    return {
      items,
      meta: buildPaginationMeta(page, limit, total),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Organization Surveys
  // ─────────────────────────────────────────────────────────────────────────────

  async getOrganizationSurveys(organizationId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const conditions = [
      eq(surveys.organizationId, organizationId),
      isNull(surveys.deletedAt),
    ]

    const [items, countResult] = await Promise.all([
      db
        .select({
          survey: surveys,
          creator: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(surveys)
        .leftJoin(users, eq(surveys.creatorId, users.id))
        .where(and(...conditions))
        .orderBy(desc(surveys.createdAt))
        .offset(skip)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(surveys)
        .where(and(...conditions)),
    ])

    // Get counts for each survey
    const itemsWithCounts = await Promise.all(
      items.map(async (item) => {
        const [responseCount, sectionCount] = await Promise.all([
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(surveyResponses)
            .where(eq(surveyResponses.surveyId, item.survey.id)),
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(surveySections)
            .where(eq(surveySections.surveyId, item.survey.id)),
        ])

        return {
          ...item.survey,
          creator: item.creator,
          _count: {
            responses: responseCount[0]?.count ?? 0,
            sections: sectionCount[0]?.count ?? 0,
          },
        }
      })
    )

    const total = countResult[0]?.count ?? 0

    return {
      items: itemsWithCounts,
      meta: buildPaginationMeta(page, limit, total),
    }
  }
}

// Export singleton
export const surveyRepository = new SurveyRepositoryClass()

// Export class for testing
export { SurveyRepositoryClass as SurveyRepository }
