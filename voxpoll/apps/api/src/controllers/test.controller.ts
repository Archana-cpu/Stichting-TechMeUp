// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TEST CONTROLLER
// HTTP request/response handling for test operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import {
  testService,
  type CreatePersonalityTestInput,
  type CreateQuizTestInput,
  type UpdateTestInput,
  type AddPersonalityQuestionInput,
  type AddQuizQuestionInput,
  type SubmitPersonalityResultInput,
} from '../services/test.service'
import type { TestFilters, TestSortOption, TestCategory } from '../repositories/test.repository'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Test Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class TestControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /tests - List tests
  // ─────────────────────────────────────────────────────────────────────────────

  async listTests(c: Context<AppEnv>) {
    const { page, limit, sort, testCategory, categoryId, search } = this.getListParams(c)

    const filters: TestFilters = {
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      ...(testCategory && { testCategory: testCategory as TestCategory }),
      ...(categoryId && { categoryId }),
      ...(search && { search }),
    }

    const result = await testService.listTests(page, limit, sort, filters)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /tests/:id - Get single test
  // ─────────────────────────────────────────────────────────────────────────────

  async getTest(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')

    const test = await testService.getTest(id, userId)

    return c.json({
      success: true,
      data: test,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /tests/slug/:slug - Get test by slug
  // ─────────────────────────────────────────────────────────────────────────────

  async getTestBySlug(c: Context<AppEnv>) {
    const slug = c.req.param('slug')
    const userId = c.get('userId')

    const test = await testService.getTestBySlug(slug, userId)

    return c.json({
      success: true,
      data: test,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /tests/personality - Create personality test
  // ─────────────────────────────────────────────────────────────────────────────

  async createPersonalityTest(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const body = await c.req.json<CreatePersonalityTestInput>()

    const test = await testService.createPersonalityTest(userId, body)

    return c.json({
      success: true,
      data: test,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /tests/quiz - Create quiz test
  // ─────────────────────────────────────────────────────────────────────────────

  async createQuizTest(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const body = await c.req.json<CreateQuizTestInput>()

    const test = await testService.createQuizTest(userId, body)

    return c.json({
      success: true,
      data: test,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /tests/:id - Update test
  // ─────────────────────────────────────────────────────────────────────────────

  async updateTest(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<UpdateTestInput>()

    const result = await testService.updateTest(id, userId, body)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /tests/:id - Delete test
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteTest(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await testService.deleteTest(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /tests/:id/publish - Publish test
  // ─────────────────────────────────────────────────────────────────────────────

  async publishTest(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await testService.publishTest(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /tests/:id/questions/personality - Add personality question
  // ─────────────────────────────────────────────────────────────────────────────

  async addPersonalityQuestion(c: Context<AppEnv>) {
    const testId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<AddPersonalityQuestionInput>()

    const question = await testService.addPersonalityQuestion(testId, userId, body)

    return c.json({
      success: true,
      data: question,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /tests/:id/questions/quiz - Add quiz question
  // ─────────────────────────────────────────────────────────────────────────────

  async addQuizQuestion(c: Context<AppEnv>) {
    const testId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<AddQuizQuestionInput>()

    const question = await testService.addQuizQuestion(testId, userId, body)

    return c.json({
      success: true,
      data: question,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /tests/:id/submit/personality - Submit personality test result
  // ─────────────────────────────────────────────────────────────────────────────

  async submitPersonalityResult(c: Context<AppEnv>) {
    const testId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<SubmitPersonalityResultInput>()

    const result = await testService.submitPersonalityResult(testId, userId, body)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /tests/:id/attempt - Start quiz attempt
  // ─────────────────────────────────────────────────────────────────────────────

  async startQuizAttempt(c: Context<AppEnv>) {
    const testId = c.req.param('id')
    const userId = c.get('userId')!

    const attempt = await testService.startQuizAttempt(testId, userId)

    return c.json({
      success: true,
      data: attempt,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /tests/:id/submit/quiz - Submit quiz attempt
  // ─────────────────────────────────────────────────────────────────────────────

  async submitQuizAttempt(c: Context<AppEnv>) {
    const testId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<{ answers: Record<string, unknown>; timeSpentSeconds?: number }>()

    const result = await testService.submitQuizAttempt(testId, userId, body.answers, body.timeSpentSeconds)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /tests/:id/results - Get test results (creator only)
  // ─────────────────────────────────────────────────────────────────────────────

  async getTestResults(c: Context<AppEnv>) {
    const testId = c.req.param('id')
    const userId = c.get('userId')!
    const { page, limit } = this.getPaginationParams(c)

    const result = await testService.getTestResults(testId, userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /tests/:id/leaderboard - Get quiz leaderboard
  // ─────────────────────────────────────────────────────────────────────────────

  async getLeaderboard(c: Context<AppEnv>) {
    const testId = c.req.param('id')
    const { page, limit } = this.getPaginationParams(c)

    const result = await testService.getQuizLeaderboard(testId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/:username/badges - Get user test badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserBadges(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const displayOnly = c.req.query('display') === 'true'

    const badges = await testService.getUserBadges(userId, displayOnly)

    return c.json({
      success: true,
      data: badges,
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
    const sort = (query['sort'] as TestSortOption) || 'recent'
    const testCategory = query['category'] as TestCategory | undefined
    const categoryId = query['categoryId']
    const search = query['search']

    return { page, limit, sort, testCategory, categoryId, search }
  }
}

// Export singleton
export const testController = new TestControllerClass()

// Export class for testing
export { TestControllerClass as TestController }
