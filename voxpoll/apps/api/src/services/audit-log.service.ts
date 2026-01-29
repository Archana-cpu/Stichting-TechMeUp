// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUDIT LOG SERVICE
// Business logic for audit log operations
// ══════════════════════════════════════════════════════════════════════════════

import { type AuditActorType } from '@voxpoll/database'
import { auditLogRepository, type AuditLogFilters } from '../repositories/audit-log.repository'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LogActionInput {
  actorId: string
  actorType: AuditActorType
  action: string
  entityType: string
  entityId: string
  changes?: object
  previousState?: object
  newState?: object
  ipAddress?: string
  userAgent?: string
  metadata?: object
}

export interface DateRangeFilter {
  startDate?: Date
  endDate?: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log Service Class
// ─────────────────────────────────────────────────────────────────────────────

class AuditLogServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Log Action
  // ─────────────────────────────────────────────────────────────────────────────

  async logAction(input: LogActionInput) {
    const log = await auditLogRepository.create({
      actorId: input.actorId,
      actorType: input.actorType,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      changes: input.changes,
      previousState: input.previousState,
      newState: input.newState,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: input.metadata,
    })

    return log
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Query Logs
  // ─────────────────────────────────────────────────────────────────────────────

  async queryLogs(
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    filters: AuditLogFilters = {}
  ) {
    const result = await auditLogRepository.getLogs(page, limit, filters)

    return {
      items: result.items.map((log) => ({
        id: log.id,
        actorId: log.actorId,
        actorType: log.actorType,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        changes: log.changes,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Moderation History
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserModerationHistory(
    userId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit
  ) {
    const result = await auditLogRepository.getUserModerationHistory(userId, page, limit)

    return {
      items: result.items.map((log) => ({
        id: log.id,
        actorId: log.actorId,
        actorType: log.actorType,
        action: log.action,
        changes: log.changes,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Entity Audit Trail
  // ─────────────────────────────────────────────────────────────────────────────

  async getEntityAuditTrail(
    entityType: string,
    entityId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit
  ) {
    const result = await auditLogRepository.getEntityAuditTrail(entityType, entityId, page, limit)

    return {
      items: result.items.map((log) => ({
        id: log.id,
        actorId: log.actorId,
        actorType: log.actorType,
        action: log.action,
        changes: log.changes,
        previousState: log.previousState,
        newState: log.newState,
        createdAt: log.createdAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Moderator Actions
  // ─────────────────────────────────────────────────────────────────────────────

  async getModeratorActions(
    moderatorId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    dateRange?: DateRangeFilter
  ) {
    const result = await auditLogRepository.getModeratorActions(
      moderatorId,
      page,
      limit,
      dateRange?.startDate,
      dateRange?.endDate
    )

    return {
      items: result.items.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getStats(moderatorId?: string, dateRange?: DateRangeFilter) {
    return auditLogRepository.getStats(
      moderatorId,
      dateRange?.startDate,
      dateRange?.endDate
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const auditLogService = new AuditLogServiceClass()

export { AuditLogServiceClass as AuditLogService }
