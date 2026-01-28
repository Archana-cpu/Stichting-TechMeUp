// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SURVEY CONTROLLER
// HTTP request/response handling for survey operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import {
  surveyService,
  type CreateSurveyInput,
  type UpdateSurveyInput,
  type CreateSectionInput,
  type CreateQuestionInput,
  type SubmitResponseInput,
} from '../services/survey.service'
import type { SurveyFilters, SurveySortOption } from '../repositories/survey.repository'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Survey Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class SurveyControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /surveys - List surveys
  // ─────────────────────────────────────────────────────────────────────────────

  async listSurveys(c: Context<AppEnv>) {
    const { page, limit, sort, organizationId, category } = this.getListParams(c)

    const filters: SurveyFilters = {
      status: 'ACTIVE',
      ...(organizationId && { organizationId }),
      ...(category && { categoryId: category }),
    }

    const result = await surveyService.listSurveys(page, limit, sort, filters)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /surveys/:id - Get single survey
  // ─────────────────────────────────────────────────────────────────────────────

  async getSurvey(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')

    const survey = await surveyService.getSurvey(id, userId)

    return c.json({
      success: true,
      data: survey,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /surveys - Create survey
  // ─────────────────────────────────────────────────────────────────────────────

  async createSurvey(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const body = await c.req.json<CreateSurveyInput>()

    const survey = await surveyService.createSurvey(userId, body)

    return c.json({
      success: true,
      data: survey,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /surveys/:id - Update survey
  // ─────────────────────────────────────────────────────────────────────────────

  async updateSurvey(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<UpdateSurveyInput>()

    const result = await surveyService.updateSurvey(id, userId, body)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /surveys/:id - Delete survey
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteSurvey(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await surveyService.deleteSurvey(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /surveys/:id/publish - Publish survey
  // ─────────────────────────────────────────────────────────────────────────────

  async publishSurvey(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await surveyService.publishSurvey(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /surveys/:id/sections - Add section
  // ─────────────────────────────────────────────────────────────────────────────

  async addSection(c: Context<AppEnv>) {
    const surveyId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<CreateSectionInput>()

    const section = await surveyService.addSection(surveyId, userId, body)

    return c.json({
      success: true,
      data: section,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /surveys/:id/sections/:sectionId/questions - Add question
  // ─────────────────────────────────────────────────────────────────────────────

  async addQuestion(c: Context<AppEnv>) {
    const surveyId = c.req.param('id')
    const sectionId = c.req.param('sectionId')
    const userId = c.get('userId')!
    const body = await c.req.json<CreateQuestionInput>()

    const question = await surveyService.addQuestion(surveyId, sectionId, userId, body)

    return c.json({
      success: true,
      data: question,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /surveys/:id/respond - Submit response
  // ─────────────────────────────────────────────────────────────────────────────

  async submitResponse(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<SubmitResponseInput>()

    const result = await surveyService.submitResponse(id, userId, body)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /surveys/:id/responses - Get responses
  // ─────────────────────────────────────────────────────────────────────────────

  async getResponses(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!
    const { page, limit } = this.getPaginationParams(c)

    const result = await surveyService.getResponses(id, userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /organizations/:orgId/surveys - Get organization surveys
  // ─────────────────────────────────────────────────────────────────────────────

  async getOrganizationSurveys(c: Context<AppEnv>) {
    const organizationId = c.req.param('orgId')
    const userId = c.get('userId')!
    const { page, limit } = this.getPaginationParams(c)

    const result = await surveyService.getOrganizationSurveys(organizationId, userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private getPaginationParams(c: Context) {
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )
    return { page, limit }
  }

  private getListParams(c: Context) {
    const query = c.req.query()
    const { page, limit } = this.getPaginationParams(c)
    const sort = (query['sort'] as SurveySortOption) || 'recent'
    const organizationId = query['organization']
    const category = query['category']

    return { page, limit, sort, organizationId, category }
  }
}

// Export singleton
export const surveyController = new SurveyControllerClass()

// Export class for testing
export { SurveyControllerClass as SurveyController }
