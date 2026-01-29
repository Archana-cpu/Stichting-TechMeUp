// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUDIT LOG REPOSITORY
// Data access layer for audit log operations
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  desc,
  sql,
  gte,
  lte,
  auditLogs,
  users,
  type AuditActorType,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import type { PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AuditLog = InferSelectModel<typeof auditLogs>

export interface AuditLogFilters {
  actorId?: string
  actorType?: AuditActorType
  action?: string
  entityType?: string
  entityId?: string
  startDate?: Date
  endDate?: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log Repository Class
// ─────────────────────────────────────────────────────────────────────────────

class AuditLogRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Create Audit Log
  // ─────────────────────────────────────────────────────────────────────────────

  async create(data: {
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
  }) {
    const [result] = await db
      .insert(auditLogs)
      .values({
        actorId: data.actorId,
        actorType: data.actorType,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes ?? {},
        previousState: data.previousState ?? {},
        newState: data.newState ?? {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata ?? {},
      })
      .returning()

    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Audit Logs
  // ─────────────────────────────────────────────────────────────────────────────

  async getLogs(page: number, limit: number, filters: AuditLogFilters) {
    const skip = (page - 1) * limit

    const conditions = []
    if (filters.actorId) conditions.push(eq(auditLogs.actorId, filters.actorId))
    if (filters.actorType) conditions.push(eq(auditLogs.actorType, filters.actorType))
    if (filters.action) conditions.push(eq(auditLogs.action, filters.action))
    if (filters.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType))
    if (filters.entityId) conditions.push(eq(auditLogs.entityId, filters.entityId))
    if (filters.startDate) conditions.push(gte(auditLogs.createdAt, filters.startDate))
    if (filters.endDate) conditions.push(lte(auditLogs.createdAt, filters.endDate))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const items = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(whereClause)

    const total = totalResult?.count ?? 0

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
  // Get User Moderation History
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserModerationHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const items = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entityType, 'USER'),
          eq(auditLogs.entityId, userId)
        )
      )
      .orderBy(desc(auditLogs.createdAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entityType, 'USER'),
          eq(auditLogs.entityId, userId)
        )
      )

    const total = totalResult?.count ?? 0

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
  // Get Entity Audit Trail
  // ─────────────────────────────────────────────────────────────────────────────

  async getEntityAuditTrail(entityType: string, entityId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const items = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entityType, entityType),
          eq(auditLogs.entityId, entityId)
        )
      )
      .orderBy(desc(auditLogs.createdAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entityType, entityType),
          eq(auditLogs.entityId, entityId)
        )
      )

    const total = totalResult?.count ?? 0

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
  // Get Moderator Actions
  // ─────────────────────────────────────────────────────────────────────────────

  async getModeratorActions(
    moderatorId: string,
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const skip = (page - 1) * limit

    const conditions = [
      eq(auditLogs.actorId, moderatorId),
      eq(auditLogs.actorType, 'USER'),
    ]
    if (startDate) conditions.push(gte(auditLogs.createdAt, startDate))
    if (endDate) conditions.push(lte(auditLogs.createdAt, endDate))

    const whereClause = and(...conditions)

    const items = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(whereClause)

    const total = totalResult?.count ?? 0

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
  // Get Stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getStats(moderatorId?: string, startDate?: Date, endDate?: Date) {
    const conditions = []
    if (moderatorId) {
      conditions.push(eq(auditLogs.actorId, moderatorId))
      conditions.push(eq(auditLogs.actorType, 'USER'))
    }
    if (startDate) conditions.push(gte(auditLogs.createdAt, startDate))
    if (endDate) conditions.push(lte(auditLogs.createdAt, endDate))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(whereClause)

    const actionCounts = await db
      .select({
        action: auditLogs.action,
        count: sql<number>`count(*)::int`,
      })
      .from(auditLogs)
      .where(whereClause)
      .groupBy(auditLogs.action)

    return {
      total: totalResult?.count ?? 0,
      byAction: Object.fromEntries(actionCounts.map((a) => [a.action, a.count])),
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const auditLogRepository = new AuditLogRepositoryClass()

export { AuditLogRepositoryClass as AuditLogRepository }
