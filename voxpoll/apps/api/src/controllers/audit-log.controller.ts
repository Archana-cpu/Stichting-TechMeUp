// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUDIT LOG CONTROLLER
// HTTP request/response handling for audit log operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { auditLogService } from '../services/audit-log.service'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class AuditLogControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /audit-logs - Query audit logs (admin only)
  // ─────────────────────────────────────────────────────────────────────────────

  async getLogs(c: Context<AppEnv>) {
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const actorTypeParam = query['actorType']
    const validActorTypes = ['USER', 'ORGANIZATION', 'SYSTEM'] as const
    const actorType = actorTypeParam && validActorTypes.includes(actorTypeParam as typeof validActorTypes[number])
      ? (actorTypeParam as typeof validActorTypes[number])
      : undefined

    const filters = {
      actorId: query['actorId'],
      actorType,
      action: query['action'],
      entityType: query['entityType'],
      entityId: query['entityId'],
      startDate: query['startDate'] ? new Date(query['startDate']) : undefined,
      endDate: query['endDate'] ? new Date(query['endDate']) : undefined,
    }

    const result = await auditLogService.queryLogs(page, limit, filters)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /audit-logs/user/:userId - Get user's moderation history
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserHistory(c: Context<AppEnv>) {
    const userId = c.req.param('userId')
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const result = await auditLogService.getUserModerationHistory(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /audit-logs/entity/:type/:id - Get entity audit trail
  // ─────────────────────────────────────────────────────────────────────────────

  async getEntityAuditTrail(c: Context<AppEnv>) {
    const entityType = c.req.param('type')
    const entityId = c.req.param('id')
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const result = await auditLogService.getEntityAuditTrail(entityType, entityId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /audit-logs/moderator/:moderatorId - Get moderator's actions
  // ─────────────────────────────────────────────────────────────────────────────

  async getModeratorActions(c: Context<AppEnv>) {
    const moderatorId = c.req.param('moderatorId')
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const dateRange = {
      startDate: query['startDate'] ? new Date(query['startDate']) : undefined,
      endDate: query['endDate'] ? new Date(query['endDate']) : undefined,
    }

    const result = await auditLogService.getModeratorActions(moderatorId, page, limit, dateRange)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /audit-logs/stats - Get audit log stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getStats(c: Context<AppEnv>) {
    const query = c.req.query()
    const moderatorId = query['moderatorId']
    const dateRange = {
      startDate: query['startDate'] ? new Date(query['startDate']) : undefined,
      endDate: query['endDate'] ? new Date(query['endDate']) : undefined,
    }

    const result = await auditLogService.getStats(moderatorId, dateRange)

    return c.json({
      success: true,
      data: result,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const auditLogController = new AuditLogControllerClass()

export { AuditLogControllerClass as AuditLogController }
