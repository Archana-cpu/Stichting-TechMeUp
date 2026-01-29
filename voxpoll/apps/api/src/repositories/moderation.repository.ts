// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - MODERATION REPOSITORY
// Data access layer for moderation operations
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  desc,
  asc,
  sql,
  inArray,
  gte,
  reports,
  moderationQueue,
  users,
  type ReportStatus,
  type ReportReason,
  type ReportTargetType,
  type ReportResolution,
  type ModerationStatus,
  type ModerationResolution,
  type ReportPriority,
  type UserStatus,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import type { PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Report = InferSelectModel<typeof reports>
export type ModerationQueueItem = InferSelectModel<typeof moderationQueue>

// ─────────────────────────────────────────────────────────────────────────────
// Moderation Repository Class
// ─────────────────────────────────────────────────────────────────────────────

class ModerationRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Create Report
  // ─────────────────────────────────────────────────────────────────────────────

  async createReport(data: {
    reporterId: string
    targetType: ReportTargetType
    targetId: string
    reportedUserId?: string
    reason: ReportReason
    details?: string
    evidence?: unknown[]
    priority?: ReportPriority
  }) {
    const [result] = await db
      .insert(reports)
      .values({
        reporterId: data.reporterId,
        targetType: data.targetType,
        targetId: data.targetId,
        reportedUserId: data.reportedUserId,
        reason: data.reason,
        details: data.details,
        evidence: data.evidence ?? [],
        priority: data.priority ?? 'NORMAL',
        status: 'PENDING',
      })
      .returning()

    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Report by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getReportById(id: string) {
    const result = await db
      .select({
        report: reports,
        reporter: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
      })
      .from(reports)
      .innerJoin(users, eq(reports.reporterId, users.id))
      .where(eq(reports.id, id))
      .limit(1)

    if (!result[0]) return null

    // Get reported user if exists
    let reportedUser = null
    if (result[0].report.reportedUserId) {
      const reportedUserResult = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        })
        .from(users)
        .where(eq(users.id, result[0].report.reportedUserId))
        .limit(1)

      reportedUser = reportedUserResult[0] ?? null
    }

    return {
      ...result[0].report,
      reporter: result[0].reporter,
      reportedUser,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Reports (Moderation Queue)
  // ─────────────────────────────────────────────────────────────────────────────

  async getReports(
    page: number,
    limit: number,
    filters: {
      status?: ReportStatus
      reason?: ReportReason
      targetType?: ReportTargetType
      assignedTo?: string
    }
  ) {
    const skip = (page - 1) * limit

    const conditions = []
    if (filters.status) conditions.push(eq(reports.status, filters.status))
    if (filters.reason) conditions.push(eq(reports.reason, filters.reason))
    if (filters.targetType) conditions.push(eq(reports.targetType, filters.targetType))
    if (filters.assignedTo) conditions.push(eq(reports.assignedTo, filters.assignedTo))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const items = await db
      .select({
        report: reports,
        reporter: {
          id: users.id,
          username: users.username,
        },
      })
      .from(reports)
      .innerJoin(users, eq(reports.reporterId, users.id))
      .where(whereClause)
      .orderBy(desc(reports.priority), asc(reports.createdAt))
      .offset(skip)
      .limit(limit)

    // Get reported users
    const reportedUserIds = items
      .map((item) => item.report.reportedUserId)
      .filter((id): id is string => id !== null)

    let reportedUsersMap: Map<string, { id: string; username: string }> = new Map()
    if (reportedUserIds.length > 0) {
      const reportedUsers = await db
        .select({
          id: users.id,
          username: users.username,
        })
        .from(users)
        .where(inArray(users.id, reportedUserIds))

      reportedUsersMap = new Map(reportedUsers.map((u) => [u.id, u]))
    }

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(whereClause)

    const total = totalResult?.count ?? 0

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }

    return {
      items: items.map((item) => ({
        ...item.report,
        reporter: item.reporter,
        reportedUser: item.report.reportedUserId
          ? reportedUsersMap.get(item.report.reportedUserId) ?? null
          : null,
      })),
      meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Assign Report
  // ─────────────────────────────────────────────────────────────────────────────

  async assignReport(id: string, moderatorId: string) {
    const [result] = await db
      .update(reports)
      .set({
        assignedTo: moderatorId,
        assignedAt: new Date(),
        status: 'IN_REVIEW',
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Resolve Report
  // ─────────────────────────────────────────────────────────────────────────────

  async resolveReport(id: string, data: {
    status: ReportStatus
    resolution?: ReportResolution
    resolutionNotes?: string
    actionsTaken?: unknown[]
  }) {
    const [result] = await db
      .update(reports)
      .set({
        status: data.status,
        resolution: data.resolution,
        resolutionNotes: data.resolutionNotes,
        actionsTaken: data.actionsTaken ?? [],
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Check Existing Report
  // ─────────────────────────────────────────────────────────────────────────────

  async findExistingReport(targetId: string, reporterId: string) {
    const result = await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.targetId, targetId),
          eq(reports.reporterId, reporterId),
          inArray(reports.status, ['PENDING', 'IN_REVIEW'])
        )
      )
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ModerationQueue Methods
  // ─────────────────────────────────────────────────────────────────────────────

  async createModerationQueueItem(data: {
    entityType: string
    entityId: string
    reason: string
    fraudScore?: number
    qualityScore?: number
    riskFactors?: string[]
    priority?: ReportPriority
    metadata?: object
  }) {
    const [result] = await db
      .insert(moderationQueue)
      .values({
        entityType: data.entityType,
        entityId: data.entityId,
        reason: data.reason,
        fraudScore: data.fraudScore,
        qualityScore: data.qualityScore,
        riskFactors: data.riskFactors ?? [],
        priority: data.priority ?? 'NORMAL',
        status: 'PENDING',
        metadata: data.metadata ?? {},
      })
      .returning()

    return result
  }

  async getModerationQueue(
    page: number,
    limit: number,
    filters: {
      status?: ModerationStatus
      entityType?: string
      assignedTo?: string
    }
  ) {
    const skip = (page - 1) * limit

    const conditions = []
    if (filters.status) conditions.push(eq(moderationQueue.status, filters.status))
    if (filters.entityType) conditions.push(eq(moderationQueue.entityType, filters.entityType))
    if (filters.assignedTo) conditions.push(eq(moderationQueue.assignedTo, filters.assignedTo))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const items = await db
      .select()
      .from(moderationQueue)
      .where(whereClause)
      .orderBy(desc(moderationQueue.priority), asc(moderationQueue.createdAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(moderationQueue)
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

  async getModerationQueueItem(id: string) {
    const result = await db
      .select()
      .from(moderationQueue)
      .where(eq(moderationQueue.id, id))
      .limit(1)

    return result[0] ?? null
  }

  async assignModerationQueueItem(id: string, moderatorId: string) {
    const [result] = await db
      .update(moderationQueue)
      .set({
        assignedTo: moderatorId,
        assignedAt: new Date(),
        status: 'IN_REVIEW',
        updatedAt: new Date(),
      })
      .where(eq(moderationQueue.id, id))
      .returning()

    return result ?? null
  }

  async resolveModerationQueueItem(id: string, data: {
    status: ModerationStatus
    resolution?: ModerationResolution
    resolutionNotes?: string
    resolvedBy: string
  }) {
    const [result] = await db
      .update(moderationQueue)
      .set({
        status: data.status,
        resolution: data.resolution,
        resolutionNotes: data.resolutionNotes,
        resolvedBy: data.resolvedBy,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(moderationQueue.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // User Management
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserById(userId: string) {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        email: users.email,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return result[0] ?? null
  }

  async updateUserStatus(userId: string, status: UserStatus) {
    const [result] = await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getReportStats() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [pendingResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(eq(reports.status, 'PENDING'))

    const [inReviewResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(eq(reports.status, 'IN_REVIEW'))

    const [resolvedTodayResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(
        and(
          inArray(reports.status, ['RESOLVED', 'DISMISSED']),
          gte(reports.resolvedAt, todayStart)
        )
      )

    return {
      pending: pendingResult?.count ?? 0,
      inReview: inReviewResult?.count ?? 0,
      resolvedToday: resolvedTodayResult?.count ?? 0,
    }
  }

  async getModerationQueueStats() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [pendingResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, 'PENDING'))

    const [assignedResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, 'IN_REVIEW'))

    const [resolvedTodayResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(moderationQueue)
      .where(
        and(
          eq(moderationQueue.status, 'RESOLVED'),
          gte(moderationQueue.resolvedAt, todayStart)
        )
      )

    return {
      pending: pendingResult?.count ?? 0,
      assigned: assignedResult?.count ?? 0,
      resolvedToday: resolvedTodayResult?.count ?? 0,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Bulk Report Operations
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkAssignReports(ids: string[], moderatorId: string) {
    const results = await db
      .update(reports)
      .set({
        assignedTo: moderatorId,
        assignedAt: new Date(),
        status: 'IN_REVIEW',
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(reports.id, ids),
          eq(reports.status, 'PENDING')
        )
      )
      .returning()

    return results
  }

  async bulkResolveReports(ids: string[], data: {
    status: ReportStatus
    resolution?: ReportResolution
    resolutionNotes?: string
    actionsTaken?: unknown[]
  }) {
    const results = await db
      .update(reports)
      .set({
        status: data.status,
        resolution: data.resolution,
        resolutionNotes: data.resolutionNotes,
        actionsTaken: data.actionsTaken ?? [],
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(reports.id, ids),
          inArray(reports.status, ['PENDING', 'IN_REVIEW'])
        )
      )
      .returning()

    return results
  }

  async getReportsByIds(ids: string[]) {
    const results = await db
      .select()
      .from(reports)
      .where(inArray(reports.id, ids))

    return results
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Bulk Moderation Queue Operations
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkAssignModerationQueueItems(ids: string[], moderatorId: string) {
    const results = await db
      .update(moderationQueue)
      .set({
        assignedTo: moderatorId,
        assignedAt: new Date(),
        status: 'IN_REVIEW',
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(moderationQueue.id, ids),
          eq(moderationQueue.status, 'PENDING')
        )
      )
      .returning()

    return results
  }

  async bulkResolveModerationQueueItems(ids: string[], data: {
    status: ModerationStatus
    resolution?: ModerationResolution
    resolutionNotes?: string
    resolvedBy: string
  }) {
    const results = await db
      .update(moderationQueue)
      .set({
        status: data.status,
        resolution: data.resolution,
        resolutionNotes: data.resolutionNotes,
        resolvedBy: data.resolvedBy,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(moderationQueue.id, ids),
          inArray(moderationQueue.status, ['PENDING', 'IN_REVIEW'])
        )
      )
      .returning()

    return results
  }

  async getModerationQueueItemsByIds(ids: string[]) {
    const results = await db
      .select()
      .from(moderationQueue)
      .where(inArray(moderationQueue.id, ids))

    return results
  }
}

// Export singleton
export const moderationRepository = new ModerationRepositoryClass()

// Export class for testing
export { ModerationRepositoryClass as ModerationRepository }
