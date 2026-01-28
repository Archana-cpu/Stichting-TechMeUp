// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - MODERATION CONTROLLER
// HTTP request/response handling for moderation operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { moderationService } from '../services/moderation.service'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Moderation Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class ModerationControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /reports - Create report
  // ─────────────────────────────────────────────────────────────────────────────

  async createReport(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const input = c.req.valid('json' as never)

    const result = await moderationService.createReport(userId, input)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /moderation/reports - Get reports (for moderators)
  // ─────────────────────────────────────────────────────────────────────────────

  async getReports(c: Context<AppEnv>) {
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const filters = {
      status: query['status'] as 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED' | 'ESCALATED' | undefined,
      reason: query['reason'] as 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'MISINFORMATION' | 'INAPPROPRIATE_CONTENT' | 'VIOLENCE' | 'SELF_HARM' | 'ILLEGAL_CONTENT' | 'COPYRIGHT' | 'IMPERSONATION' | 'OTHER' | undefined,
      targetType: query['targetType'] as 'USER' | 'POLL' | 'SURVEY' | 'TEST' | 'COMMENT' | 'DISCUSSION' | undefined,
      assignedTo: query['assignedTo'],
    }

    const result = await moderationService.getReports(page, limit, filters)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /moderation/reports/:id - Get report details
  // ─────────────────────────────────────────────────────────────────────────────

  async getReport(c: Context<AppEnv>) {
    const reportId = c.req.param('id')

    const result = await moderationService.getReport(reportId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/reports/:id/assign - Assign report
  // ─────────────────────────────────────────────────────────────────────────────

  async assignReport(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const reportId = c.req.param('id')

    const result = await moderationService.assignReport(reportId, moderatorId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/reports/:id/resolve - Resolve report
  // ─────────────────────────────────────────────────────────────────────────────

  async resolveReport(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const reportId = c.req.param('id')
    const input = c.req.valid('json' as never)

    const result = await moderationService.resolveReport(reportId, moderatorId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /moderation/queue - Get moderation queue (auto-flagged content)
  // ─────────────────────────────────────────────────────────────────────────────

  async getQueue(c: Context<AppEnv>) {
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const filters = {
      status: query['status'] as 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED' | 'ESCALATED' | undefined,
      entityType: query['entityType'],
      assignedTo: query['assignedTo'],
    }

    const result = await moderationService.getModerationQueue(page, limit, filters)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/queue/:id/assign - Assign queue item
  // ─────────────────────────────────────────────────────────────────────────────

  async assignQueueItem(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const itemId = c.req.param('id')

    const result = await moderationService.assignModerationQueueItem(itemId, moderatorId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/queue/:id/resolve - Resolve queue item
  // ─────────────────────────────────────────────────────────────────────────────

  async resolveQueueItem(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const itemId = c.req.param('id')
    const input = c.req.valid('json' as never)

    const result = await moderationService.resolveModerationQueueItem(itemId, moderatorId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/users/:id/suspend - Suspend user
  // ─────────────────────────────────────────────────────────────────────────────

  async suspendUser(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const targetUserId = c.req.param('id')
    const input = c.req.valid('json' as never)

    const result = await moderationService.suspendUser(targetUserId, moderatorId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/users/:id/ban - Ban user
  // ─────────────────────────────────────────────────────────────────────────────

  async banUser(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const targetUserId = c.req.param('id')
    const input = c.req.valid('json' as never)

    const result = await moderationService.banUser(targetUserId, moderatorId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/users/:id/unban - Unban user
  // ─────────────────────────────────────────────────────────────────────────────

  async unbanUser(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const targetUserId = c.req.param('id')
    const input = c.req.valid('json' as never) as { reason: string }

    const result = await moderationService.unbanUser(targetUserId, moderatorId, input.reason)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /moderation/stats - Get moderation stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getStats(c: Context<AppEnv>) {
    const result = await moderationService.getStats()

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/reports/bulk/assign - Bulk assign reports
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkAssignReports(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const input = c.req.valid('json' as never) as { ids: string[]; moderatorId?: string }

    const targetModeratorId = input.moderatorId ?? moderatorId

    const result = await moderationService.bulkAssignReports(input.ids, targetModeratorId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/reports/bulk/resolve - Bulk resolve reports
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkResolveReports(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const input = c.req.valid('json' as never) as {
      ids: string[]
      status: 'RESOLVED' | 'DISMISSED'
      resolution?: string
      resolutionNotes?: string
      actionsTaken?: string[]
    }

    const result = await moderationService.bulkResolveReports(input.ids, moderatorId, {
      status: input.status,
      resolution: input.resolution as 'NO_VIOLATION' | 'WARNING_ISSUED' | 'CONTENT_REMOVED' | 'CONTENT_MODIFIED' | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_BANNED' | 'ESCALATED_TO_LEGAL' | undefined,
      resolutionNotes: input.resolutionNotes,
      actionsTaken: input.actionsTaken,
    })

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/queue/bulk/assign - Bulk assign queue items
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkAssignQueue(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const input = c.req.valid('json' as never) as { ids: string[]; moderatorId?: string }

    const targetModeratorId = input.moderatorId ?? moderatorId

    const result = await moderationService.bulkAssignModerationQueue(input.ids, targetModeratorId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/queue/bulk/approve - Bulk approve queue items
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkApproveQueue(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const input = c.req.valid('json' as never) as {
      ids: string[]
      resolution?: 'NO_ACTION' | 'WARNING_ISSUED' | 'CONTENT_REMOVED' | 'CONTENT_MODIFIED' | 'USER_WARNED' | 'USER_SUSPENDED' | 'USER_BANNED' | 'ESCALATED_TO_ADMIN'
      resolutionNotes?: string
    }

    const result = await moderationService.bulkApproveModerationQueue(input.ids, moderatorId, {
      resolution: input.resolution,
      resolutionNotes: input.resolutionNotes,
    })

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /moderation/queue/bulk/reject - Bulk reject queue items
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkRejectQueue(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const input = c.req.valid('json' as never) as {
      ids: string[]
      resolution?: 'NO_ACTION' | 'WARNING_ISSUED' | 'CONTENT_REMOVED' | 'CONTENT_MODIFIED' | 'USER_WARNED' | 'USER_SUSPENDED' | 'USER_BANNED' | 'ESCALATED_TO_ADMIN'
      resolutionNotes?: string
    }

    const result = await moderationService.bulkRejectModerationQueue(input.ids, moderatorId, {
      resolution: input.resolution,
      resolutionNotes: input.resolutionNotes,
    })

    return c.json({
      success: true,
      data: result,
    })
  }
}

// Export singleton
export const moderationController = new ModerationControllerClass()

// Export class for testing
export { ModerationControllerClass as ModerationController }
