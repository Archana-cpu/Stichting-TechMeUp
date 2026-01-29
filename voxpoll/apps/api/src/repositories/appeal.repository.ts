// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - APPEAL REPOSITORY
// Data access layer for appeal operations
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  desc,
  asc,
  sql,
  appeals,
  users,
  type AppealStatus,
  type ContentType,
  type ReportPriority,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import type { PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Appeal = InferSelectModel<typeof appeals>

export interface AppealFilters {
  status?: AppealStatus
  appealerId?: string
  assignedTo?: string
  moderationDecisionType?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Appeal Repository Class
// ─────────────────────────────────────────────────────────────────────────────

class AppealRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Create Appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async create(data: {
    appealerId: string
    moderationDecisionType: string
    moderationDecisionId: string
    contentType?: ContentType
    contentId?: string
    reason: string
    evidence?: unknown[]
    priority?: ReportPriority
  }) {
    const [result] = await db
      .insert(appeals)
      .values({
        appealerId: data.appealerId,
        moderationDecisionType: data.moderationDecisionType,
        moderationDecisionId: data.moderationDecisionId,
        contentType: data.contentType,
        contentId: data.contentId,
        reason: data.reason,
        evidence: data.evidence ?? [],
        priority: data.priority ?? 'NORMAL',
        status: 'PENDING',
      })
      .returning()

    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Appeal by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getById(id: string) {
    const result = await db
      .select({
        appeal: appeals,
        appealer: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
      })
      .from(appeals)
      .innerJoin(users, eq(appeals.appealerId, users.id))
      .where(eq(appeals.id, id))
      .limit(1)

    if (!result[0]) return null

    let assignee = null
    if (result[0].appeal.assignedTo) {
      const assigneeResult = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        })
        .from(users)
        .where(eq(users.id, result[0].appeal.assignedTo))
        .limit(1)

      assignee = assigneeResult[0] ?? null
    }

    let reviewer = null
    if (result[0].appeal.reviewerId) {
      const reviewerResult = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        })
        .from(users)
        .where(eq(users.id, result[0].appeal.reviewerId))
        .limit(1)

      reviewer = reviewerResult[0] ?? null
    }

    return {
      ...result[0].appeal,
      appealer: result[0].appealer,
      assignee,
      reviewer,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Appeals List
  // ─────────────────────────────────────────────────────────────────────────────

  async getAppeals(page: number, limit: number, filters: AppealFilters) {
    const skip = (page - 1) * limit

    const conditions = []
    if (filters.status) conditions.push(eq(appeals.status, filters.status))
    if (filters.appealerId) conditions.push(eq(appeals.appealerId, filters.appealerId))
    if (filters.assignedTo) conditions.push(eq(appeals.assignedTo, filters.assignedTo))
    if (filters.moderationDecisionType) {
      conditions.push(eq(appeals.moderationDecisionType, filters.moderationDecisionType))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const items = await db
      .select({
        appeal: appeals,
        appealer: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
      })
      .from(appeals)
      .innerJoin(users, eq(appeals.appealerId, users.id))
      .where(whereClause)
      .orderBy(desc(appeals.priority), asc(appeals.createdAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(appeals)
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
        ...item.appeal,
        appealer: item.appealer,
      })),
      meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Assign Appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async assign(id: string, moderatorId: string) {
    const [result] = await db
      .update(appeals)
      .set({
        assignedTo: moderatorId,
        assignedAt: new Date(),
        status: 'UNDER_REVIEW',
        updatedAt: new Date(),
      })
      .where(eq(appeals.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Accept Appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async accept(id: string, reviewerId: string, decision: string, notes?: string, actionsTaken?: unknown[]) {
    const [result] = await db
      .update(appeals)
      .set({
        status: 'ACCEPTED',
        reviewerId,
        reviewedAt: new Date(),
        decision,
        decisionNotes: notes,
        actionsTaken: actionsTaken ?? [],
        updatedAt: new Date(),
      })
      .where(eq(appeals.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Deny Appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async deny(id: string, reviewerId: string, decision: string, notes?: string) {
    const [result] = await db
      .update(appeals)
      .set({
        status: 'DENIED',
        reviewerId,
        reviewedAt: new Date(),
        decision,
        decisionNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(appeals.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Check Existing Appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async findExistingAppeal(
    appealerId: string,
    moderationDecisionType: string,
    moderationDecisionId: string
  ) {
    const result = await db
      .select()
      .from(appeals)
      .where(
        and(
          eq(appeals.appealerId, appealerId),
          eq(appeals.moderationDecisionType, moderationDecisionType),
          eq(appeals.moderationDecisionId, moderationDecisionId)
        )
      )
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Appeals
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserAppeals(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const items = await db
      .select()
      .from(appeals)
      .where(eq(appeals.appealerId, userId))
      .orderBy(desc(appeals.createdAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(appeals)
      .where(eq(appeals.appealerId, userId))

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
  // Stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getStats() {
    const [pendingResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(appeals)
      .where(eq(appeals.status, 'PENDING'))

    const [underReviewResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(appeals)
      .where(eq(appeals.status, 'UNDER_REVIEW'))

    const [resolvedTodayResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(appeals)
      .where(
        and(
          sql`${appeals.status} IN ('ACCEPTED', 'DENIED')`,
          sql`${appeals.reviewedAt} >= CURRENT_DATE`
        )
      )

    return {
      pending: pendingResult?.count ?? 0,
      underReview: underReviewResult?.count ?? 0,
      resolvedToday: resolvedTodayResult?.count ?? 0,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const appealRepository = new AppealRepositoryClass()

export { AppealRepositoryClass as AppealRepository }
