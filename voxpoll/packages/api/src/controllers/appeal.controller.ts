// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - APPEAL CONTROLLER
// HTTP request/response handling for appeal operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { appealService } from '../services/appeal.service'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Appeal Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class AppealControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /appeals - Submit appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async submitAppeal(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const input = c.req.valid('json' as never)

    const result = await appealService.submitAppeal(userId, input)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /appeals - Get appeals (for moderators)
  // ─────────────────────────────────────────────────────────────────────────────

  async getAppeals(c: Context<AppEnv>) {
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const filters = {
      status: query['status'] as 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'DENIED' | undefined,
      moderationDecisionType: query['moderationDecisionType'],
    }

    const result = await appealService.getAppeals(page, limit, filters)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /appeals/my - Get user's own appeals
  // ─────────────────────────────────────────────────────────────────────────────

  async getMyAppeals(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const result = await appealService.getUserAppeals(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /appeals/:id - Get appeal details
  // ─────────────────────────────────────────────────────────────────────────────

  async getAppeal(c: Context<AppEnv>) {
    const appealId = c.req.param('id')

    const result = await appealService.getAppeal(appealId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /appeals/:id/assign - Assign appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async assignAppeal(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const appealId = c.req.param('id')

    const result = await appealService.assignAppeal(appealId, moderatorId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /appeals/:id/accept - Accept appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async acceptAppeal(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const appealId = c.req.param('id')
    const input = c.req.valid('json' as never)

    const result = await appealService.acceptAppeal(appealId, moderatorId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /appeals/:id/deny - Deny appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async denyAppeal(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const appealId = c.req.param('id')
    const input = c.req.valid('json' as never)

    const result = await appealService.denyAppeal(appealId, moderatorId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /appeals/stats - Get appeal stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getStats(c: Context<AppEnv>) {
    const result = await appealService.getStats()

    return c.json({
      success: true,
      data: result,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const appealController = new AppealControllerClass()

export { AppealControllerClass as AppealController }
