// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - POLL CONTROLLER
// HTTP request/response handling for poll operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { pollService, type CreatePollInput, type UpdatePollInput } from '../services/poll.service'
import type { PollFilters, PollSortOption } from '../repositories/poll.repository'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Poll Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class PollControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /polls - List polls
  // ─────────────────────────────────────────────────────────────────────────────

  async listPolls(c: Context<AppEnv>) {
    const { page, limit, sort, category, search, tags } = this.getListParams(c)

    const filters: PollFilters = {
      ...(category && { categoryId: category }),
      ...(search && { search }),
      ...(tags?.length && { tags }),
    }

    const result = await pollService.listPolls(page, limit, sort, filters)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /polls/:id - Get single poll
  // ─────────────────────────────────────────────────────────────────────────────

  async getPoll(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')

    const poll = await pollService.getPoll(id, userId)

    return c.json({
      success: true,
      data: poll,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /polls/slug/:slug - Get poll by slug
  // ─────────────────────────────────────────────────────────────────────────────

  async getPollBySlug(c: Context<AppEnv>) {
    const slug = c.req.param('slug')
    const userId = c.get('userId')

    const poll = await pollService.getPollBySlug(slug, userId)

    return c.json({
      success: true,
      data: poll,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /polls - Create poll
  // ─────────────────────────────────────────────────────────────────────────────

  async createPoll(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const body = await c.req.json<CreatePollInput>()

    const poll = await pollService.createPoll(userId, body)

    return c.json({
      success: true,
      data: poll,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /polls/:id - Update poll
  // ─────────────────────────────────────────────────────────────────────────────

  async updatePoll(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<UpdatePollInput>()

    const result = await pollService.updatePoll(id, userId, body)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /polls/:id - Delete poll
  // ─────────────────────────────────────────────────────────────────────────────

  async deletePoll(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await pollService.deletePoll(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /polls/:id/vote - Vote on poll
  // ─────────────────────────────────────────────────────────────────────────────

  async vote(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<{ optionId: string }>()

    const result = await pollService.vote(id, userId, body.optionId)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /polls/:id/results - Get poll results
  // ─────────────────────────────────────────────────────────────────────────────

  async getResults(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')

    const results = await pollService.getResults(id, userId)

    return c.json({
      success: true,
      data: results,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /polls/:id/analytics - Get poll analytics
  // ─────────────────────────────────────────────────────────────────────────────

  async getAnalytics(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const analytics = await pollService.getAnalytics(id, userId)

    return c.json({
      success: true,
      data: analytics,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /polls/:id/vote - Retract vote
  // ─────────────────────────────────────────────────────────────────────────────

  async retractVote(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await pollService.retractVote(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /polls/:id/my-vote - Get user's vote on poll
  // ─────────────────────────────────────────────────────────────────────────────

  async getMyVote(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await pollService.getUserVote(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /polls/:id/publish - Publish draft poll
  // ─────────────────────────────────────────────────────────────────────────────

  async publishPoll(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await pollService.publishPoll(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /polls/:id/close - Close poll
  // ─────────────────────────────────────────────────────────────────────────────

  async closePoll(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await pollService.closePoll(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /polls/:id/archive - Archive poll
  // ─────────────────────────────────────────────────────────────────────────────

  async archivePoll(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await pollService.archivePoll(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /polls/:id/unarchive - Unarchive poll
  // ─────────────────────────────────────────────────────────────────────────────

  async unarchivePoll(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await pollService.unarchivePoll(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /polls/:id/share - Generate share link
  // ─────────────────────────────────────────────────────────────────────────────

  async generateShareLink(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const result = await pollService.generateShareLink(id, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /polls/share/:code - Get poll by share code
  // ─────────────────────────────────────────────────────────────────────────────

  async getPollByShareCode(c: Context<AppEnv>) {
    const code = c.req.param('code')
    const userId = c.get('userId')

    const result = await pollService.getPollByShareCode(code, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /polls/:id/comments - Get poll comments
  // ─────────────────────────────────────────────────────────────────────────────

  async getComments(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const { page, limit } = this.getPaginationParams(c)

    const result = await pollService.getComments(id, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /polls/:id/comments - Add comment to poll
  // ─────────────────────────────────────────────────────────────────────────────

  async addComment(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<{ content: string; parentId?: string }>()

    const result = await pollService.addComment(id, userId, body.content, body.parentId)

    return c.json({
      success: true,
      data: result,
    }, 201)
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
    const sort = (query['sort'] as PollSortOption) || 'recent'
    const category = query['category']
    const search = query['search']
    const tagsStr = query['tags']
    const tags = tagsStr ? tagsStr.split(',').filter(Boolean) : undefined

    return { page, limit, sort, category, search, tags }
  }
}

// Export singleton
export const pollController = new PollControllerClass()

// Export class for testing
export { PollControllerClass as PollController }
