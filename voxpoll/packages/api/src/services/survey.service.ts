// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SURVEY SERVICE
// Business logic for survey operations
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, sql } from '@voxpoll/database'
import { surveys, organizationMembers } from '@voxpoll/database'
import { surveyRepository, type SurveyFilters, type SurveySortOption } from '../repositories/survey.repository'
import { cacheService } from './cache.service'
import { ApiError } from '../middleware/error-handler'
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { PAGINATION } from '../constants/limits'
import { generateParticipantHash } from '../lib/hash'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateSurveyInput {
  organizationId: string
  title: string
  description?: string
  type?: string
  categoryId?: string
  tags?: string[]
}

export interface UpdateSurveyInput {
  title?: string
  description?: string
  tags?: string[]
  estimatedMinutes?: number
  targetResponseCount?: number
  allowAnonymous?: boolean
  allowSaveProgress?: boolean
  showProgressBar?: boolean
}

export interface CreateSectionInput {
  title?: string
  description?: string
}

export interface CreateQuestionInput {
  type: string
  text: string
  description?: string
  isRequired?: boolean
  options?: object
  validation?: object
}

export interface SubmitResponseInput {
  answers: Record<string, unknown>
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

// ─────────────────────────────────────────────────────────────────────────────
// Survey Service Class
// ─────────────────────────────────────────────────────────────────────────────

class SurveyServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // List Surveys
  // ─────────────────────────────────────────────────────────────────────────────

  async listSurveys(
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    sort: SurveySortOption = 'recent',
    filters: SurveyFilters = {}
  ) {
    const result = await surveyRepository.findMany(filters, page, limit, sort)

    return {
      items: result.items.map((survey) => ({
        id: survey.id,
        title: survey.title,
        description: survey.description,
        slug: survey.slug,
        type: survey.type,
        status: survey.status,
        creator: survey.creator,
        organization: survey.organization,
        category: survey.category,
        responseCount: survey.responseCount,
        completedCount: survey.completedCount,
        completionRate: survey.completionRate,
        sectionCount: survey._count.sections,
        estimatedMinutes: survey.estimatedMinutes,
        createdAt: survey.createdAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Survey
  // ─────────────────────────────────────────────────────────────────────────────

  async getSurvey(id: string, currentUserId?: string) {
    const survey = await surveyRepository.findById(id)

    if (!survey || survey.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.SURVEY_NOT_FOUND, ERROR_CODES.SURVEY_NOT_FOUND)
    }

    // Check if user has responded
    let hasResponded = false
    if (currentUserId) {
      const participantHash = generateParticipantHash(currentUserId, id)
      const response = await surveyRepository.findResponse(id, participantHash)
      hasResponded = !!response
    }

    return {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      slug: survey.slug,
      type: survey.type,
      status: survey.status,
      creator: survey.creator,
      organization: survey.organization,
      category: survey.category,
      sections: survey.sections,
      responseCount: survey.responseCount,
      completedCount: survey.completedCount,
      completionRate: survey.completionRate,
      estimatedMinutes: survey.estimatedMinutes,
      allowAnonymous: survey.allowAnonymous,
      showProgressBar: survey.showProgressBar,
      startsAt: survey.startsAt,
      endsAt: survey.endsAt,
      createdAt: survey.createdAt,
      hasResponded,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Survey
  // ─────────────────────────────────────────────────────────────────────────────

  async createSurvey(creatorId: string, input: CreateSurveyInput) {
    // Verify organization membership
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
      throw ApiError.forbidden('You must be a member of the organization to create surveys', 'NOT_ORG_MEMBER')
    }

    const survey = await surveyRepository.create({
      creatorId,
      organizationId: input.organizationId,
      title: input.title,
      description: input.description,
      slug: generateSlug(input.title),
      type: input.type,
      categoryId: input.categoryId,
      tags: input.tags,
    })

    return {
      id: survey.id,
      title: survey.title,
      slug: survey.slug,
      status: survey.status,
      creator: survey.creator,
      organization: survey.organization,
      createdAt: survey.createdAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Survey
  // ─────────────────────────────────────────────────────────────────────────────

  async updateSurvey(surveyId: string, userId: string, input: UpdateSurveyInput) {
    const survey = await surveyRepository.findById(surveyId)

    if (!survey || survey.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.SURVEY_NOT_FOUND, ERROR_CODES.SURVEY_NOT_FOUND)
    }

    // Check permission (creator or org admin)
    if (survey.creatorId !== userId) {
      const membershipResult = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, survey.organizationId),
            eq(organizationMembers.userId, userId)
          )
        )
        .limit(1)

      const membership = membershipResult[0]

      if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
        throw ApiError.forbidden('You do not have permission to update this survey', 'NOT_AUTHORIZED')
      }
    }

    // P-106: Surveys CANNOT be edited after publishing
    if (survey.status !== 'DRAFT') {
      throw ApiError.badRequest('Cannot edit survey after publishing', 'SURVEY_LOCKED')
    }

    const updatedSurvey = await surveyRepository.update(surveyId, input)
    if (!updatedSurvey) {
      throw ApiError.internal('Failed to update survey', 'SURVEY_UPDATE_FAILED')
    }

    return {
      id: updatedSurvey.id,
      title: updatedSurvey.title,
      slug: updatedSurvey.slug,
      message: SUCCESS_MESSAGES.SURVEY_CREATED,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete Survey
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteSurvey(surveyId: string, userId: string) {
    const survey = await surveyRepository.findById(surveyId)

    if (!survey || survey.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.SURVEY_NOT_FOUND, ERROR_CODES.SURVEY_NOT_FOUND)
    }

    // Check permission
    if (survey.creatorId !== userId) {
      const membershipResult = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, survey.organizationId),
            eq(organizationMembers.userId, userId)
          )
        )
        .limit(1)

      const membership = membershipResult[0]

      if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
        throw ApiError.forbidden('You do not have permission to delete this survey', 'NOT_AUTHORIZED')
      }
    }

    await surveyRepository.softDelete(surveyId)

    return { message: 'Survey deleted successfully' }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Publish Survey
  // ─────────────────────────────────────────────────────────────────────────────

  async publishSurvey(surveyId: string, userId: string) {
    const survey = await surveyRepository.findById(surveyId)

    if (!survey || survey.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.SURVEY_NOT_FOUND, ERROR_CODES.SURVEY_NOT_FOUND)
    }

    // Check permission
    if (survey.creatorId !== userId) {
      const membershipResult = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, survey.organizationId),
            eq(organizationMembers.userId, userId)
          )
        )
        .limit(1)

      const membership = membershipResult[0]

      if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
        throw ApiError.forbidden('You do not have permission to publish this survey', 'NOT_AUTHORIZED')
      }
    }

    // Check if survey has at least one section with questions
    const hasQuestions = survey.sections.some((s) => s.questions.length > 0)
    if (!hasQuestions) {
      throw ApiError.badRequest('Survey must have at least one question to publish', 'NO_QUESTIONS')
    }

    await surveyRepository.publish(surveyId)

    return { message: SUCCESS_MESSAGES.SURVEY_PUBLISHED }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Add Section
  // ─────────────────────────────────────────────────────────────────────────────

  async addSection(surveyId: string, userId: string, input: CreateSectionInput) {
    const survey = await surveyRepository.findById(surveyId)

    if (!survey || survey.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.SURVEY_NOT_FOUND, ERROR_CODES.SURVEY_NOT_FOUND)
    }

    // Check permission
    await this.checkEditPermission(survey, userId)

    // Get next order index
    const orderIndex = survey.sections.length

    const section = await surveyRepository.createSection(surveyId, {
      title: input.title,
      description: input.description,
      orderIndex,
    })

    return section
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Add Question
  // ─────────────────────────────────────────────────────────────────────────────

  async addQuestion(surveyId: string, sectionId: string, userId: string, input: CreateQuestionInput) {
    const survey = await surveyRepository.findById(surveyId)

    if (!survey || survey.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.SURVEY_NOT_FOUND, ERROR_CODES.SURVEY_NOT_FOUND)
    }

    // Check permission
    await this.checkEditPermission(survey, userId)

    // Verify section belongs to survey
    const section = survey.sections.find((s) => s.id === sectionId)
    if (!section) {
      throw ApiError.notFound('Section not found', 'SECTION_NOT_FOUND')
    }

    // Get next order index
    const orderIndex = section.questions.length

    const question = await surveyRepository.createQuestion(sectionId, {
      type: input.type,
      text: input.text,
      description: input.description,
      orderIndex,
      isRequired: input.isRequired,
      options: input.options,
      validation: input.validation,
    })

    return question
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Submit Response
  // ─────────────────────────────────────────────────────────────────────────────

  async submitResponse(surveyId: string, userId: string, input: SubmitResponseInput) {
    const survey = await surveyRepository.findById(surveyId)

    if (!survey || survey.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.SURVEY_NOT_FOUND, ERROR_CODES.SURVEY_NOT_FOUND)
    }

    if (survey.status !== 'ACTIVE') {
      throw ApiError.badRequest('This survey is not accepting responses', 'SURVEY_NOT_ACTIVE')
    }

    if (survey.endsAt && survey.endsAt < new Date()) {
      throw ApiError.badRequest('This survey has ended', 'SURVEY_ENDED')
    }

    // Generate participant hash
    const participantHash = generateParticipantHash(userId, surveyId)

    // Check if already responded
    const existingResponse = await surveyRepository.findResponse(surveyId, participantHash)
    if (existingResponse) {
      throw ApiError.conflict('You have already completed this survey', 'ALREADY_RESPONDED')
    }

    // Create response
    await surveyRepository.createResponse({
      surveyId,
      participantHash,
      answers: input.answers,
    })

    // Update survey statistics
    await db
      .update(surveys)
      .set({
        responseCount: sql`${surveys.responseCount} + 1`,
        completedCount: sql`${surveys.completedCount} + 1`,
      })
      .where(eq(surveys.id, surveyId))

    return { message: SUCCESS_MESSAGES.RESPONSE_SUBMITTED }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Responses
  // ─────────────────────────────────────────────────────────────────────────────

  async getResponses(surveyId: string, userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const survey = await surveyRepository.findById(surveyId)

    if (!survey || survey.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.SURVEY_NOT_FOUND, ERROR_CODES.SURVEY_NOT_FOUND)
    }

    // Check permission
    await this.checkEditPermission(survey, userId)

    return surveyRepository.getResponses(surveyId, page, limit)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Organization Surveys
  // ─────────────────────────────────────────────────────────────────────────────

  async getOrganizationSurveys(
    organizationId: string,
    userId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit
  ) {
    // Verify membership
    const membershipResult = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId)
        )
      )
      .limit(1)

    const membership = membershipResult[0]

    if (!membership) {
      throw ApiError.forbidden('You must be a member of the organization', 'NOT_ORG_MEMBER')
    }

    return surveyRepository.getOrganizationSurveys(organizationId, page, limit)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private async checkEditPermission(
    survey: NonNullable<Awaited<ReturnType<typeof surveyRepository.findById>>>,
    userId: string
  ) {
    if (survey.creatorId !== userId) {
      const membershipResult = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, survey.organizationId),
            eq(organizationMembers.userId, userId)
          )
        )
        .limit(1)

      const membership = membershipResult[0]

      if (!membership || !['OWNER', 'ADMIN', 'EDITOR'].includes(membership.role)) {
        throw ApiError.forbidden('You do not have permission to edit this survey', 'NOT_AUTHORIZED')
      }
    }
  }
}

// Export singleton
export const surveyService = new SurveyServiceClass()

// Export class for testing
export { SurveyServiceClass as SurveyService }
