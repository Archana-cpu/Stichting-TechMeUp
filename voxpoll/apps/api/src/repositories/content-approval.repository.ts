// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - CONTENT APPROVAL REPOSITORY
// Data access layer for content approval operations
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  desc,
  asc,
  sql,
  inArray,
  contentApprovals,
  users,
  polls,
  surveys,
  tests,
  type ApprovalStatus,
  type ContentType,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import type { PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ContentApproval = InferSelectModel<typeof contentApprovals>

export interface ApprovalFilters {
  status?: ApprovalStatus
  contentType?: ContentType
  submittedById?: string
  reviewerId?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Approval Repository Class
// ─────────────────────────────────────────────────────────────────────────────

class ContentApprovalRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Create Content Approval
  // ─────────────────────────────────────────────────────────────────────────────

  async create(data: {
    contentType: ContentType
    contentId: string
    submittedById: string
    version?: number
    autoApproved?: boolean
    autoApprovalReason?: string
    metadata?: object
  }) {
    const [result] = await db
      .insert(contentApprovals)
      .values({
        contentType: data.contentType,
        contentId: data.contentId,
        submittedById: data.submittedById,
        status: data.autoApproved ? 'APPROVED' : 'PENDING_APPROVAL',
        version: data.version ?? 1,
        autoApproved: data.autoApproved ?? false,
        autoApprovalReason: data.autoApprovalReason,
        metadata: data.metadata ?? {},
      })
      .returning()

    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Approval by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getById(id: string) {
    const result = await db
      .select({
        approval: contentApprovals,
        submitter: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
      })
      .from(contentApprovals)
      .innerJoin(users, eq(contentApprovals.submittedById, users.id))
      .where(eq(contentApprovals.id, id))
      .limit(1)

    if (!result[0]) return null

    let reviewer = null
    if (result[0].approval.reviewerId) {
      const reviewerResult = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        })
        .from(users)
        .where(eq(users.id, result[0].approval.reviewerId))
        .limit(1)

      reviewer = reviewerResult[0] ?? null
    }

    return {
      ...result[0].approval,
      submitter: result[0].submitter,
      reviewer,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Approvals List
  // ─────────────────────────────────────────────────────────────────────────────

  async getApprovals(page: number, limit: number, filters: ApprovalFilters) {
    const skip = (page - 1) * limit

    const conditions = []
    if (filters.status) conditions.push(eq(contentApprovals.status, filters.status))
    if (filters.contentType) conditions.push(eq(contentApprovals.contentType, filters.contentType))
    if (filters.submittedById) conditions.push(eq(contentApprovals.submittedById, filters.submittedById))
    if (filters.reviewerId) conditions.push(eq(contentApprovals.reviewerId, filters.reviewerId))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const items = await db
      .select({
        approval: contentApprovals,
        submitter: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
      })
      .from(contentApprovals)
      .innerJoin(users, eq(contentApprovals.submittedById, users.id))
      .where(whereClause)
      .orderBy(desc(contentApprovals.createdAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentApprovals)
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
        ...item.approval,
        submitter: item.submitter,
      })),
      meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Approval Status
  // ─────────────────────────────────────────────────────────────────────────────

  async approve(id: string, reviewerId: string, notes?: string) {
    const [result] = await db
      .update(contentApprovals)
      .set({
        status: 'APPROVED',
        reviewerId,
        reviewedAt: new Date(),
        decisionNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(contentApprovals.id, id))
      .returning()

    return result ?? null
  }

  async reject(id: string, reviewerId: string, reason: string, notes?: string) {
    const [result] = await db
      .update(contentApprovals)
      .set({
        status: 'REJECTED',
        reviewerId,
        reviewedAt: new Date(),
        rejectionReason: reason,
        decisionNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(contentApprovals.id, id))
      .returning()

    return result ?? null
  }

  async requestRevision(id: string, reviewerId: string, instructions: string, notes?: string) {
    const [result] = await db
      .update(contentApprovals)
      .set({
        status: 'REVISION_REQUESTED',
        reviewerId,
        reviewedAt: new Date(),
        revisionInstructions: instructions,
        decisionNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(contentApprovals.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Latest Approval for Content
  // ─────────────────────────────────────────────────────────────────────────────

  async getLatestForContent(contentType: ContentType, contentId: string) {
    const result = await db
      .select()
      .from(contentApprovals)
      .where(
        and(
          eq(contentApprovals.contentType, contentType),
          eq(contentApprovals.contentId, contentId)
        )
      )
      .orderBy(desc(contentApprovals.version))
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Pending Count for Content
  // ─────────────────────────────────────────────────────────────────────────────

  async getPendingForContent(contentType: ContentType, contentId: string) {
    const result = await db
      .select()
      .from(contentApprovals)
      .where(
        and(
          eq(contentApprovals.contentType, contentType),
          eq(contentApprovals.contentId, contentId),
          eq(contentApprovals.status, 'PENDING_APPROVAL')
        )
      )
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Content Approval Status
  // ─────────────────────────────────────────────────────────────────────────────

  async updatePollApprovalStatus(pollId: string, status: ApprovalStatus, approvalId?: string) {
    const [result] = await db
      .update(polls)
      .set({
        approvalStatus: status,
        currentApprovalId: approvalId,
        updatedAt: new Date(),
      })
      .where(eq(polls.id, pollId))
      .returning()

    return result ?? null
  }

  async updateSurveyApprovalStatus(surveyId: string, status: ApprovalStatus, approvalId?: string) {
    const [result] = await db
      .update(surveys)
      .set({
        approvalStatus: status,
        currentApprovalId: approvalId,
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, surveyId))
      .returning()

    return result ?? null
  }

  async updateTestApprovalStatus(testId: string, status: ApprovalStatus, approvalId?: string) {
    const [result] = await db
      .update(tests)
      .set({
        approvalStatus: status,
        currentApprovalId: approvalId,
        updatedAt: new Date(),
      })
      .where(eq(tests.id, testId))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Bulk Operations
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkApprove(ids: string[], reviewerId: string, notes?: string) {
    const results = await db
      .update(contentApprovals)
      .set({
        status: 'APPROVED',
        reviewerId,
        reviewedAt: new Date(),
        decisionNotes: notes,
        updatedAt: new Date(),
      })
      .where(inArray(contentApprovals.id, ids))
      .returning()

    return results
  }

  async bulkReject(ids: string[], reviewerId: string, reason: string) {
    const results = await db
      .update(contentApprovals)
      .set({
        status: 'REJECTED',
        reviewerId,
        reviewedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(inArray(contentApprovals.id, ids))
      .returning()

    return results
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getStats() {
    const [pendingResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentApprovals)
      .where(eq(contentApprovals.status, 'PENDING_APPROVAL'))

    const [approvedTodayResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentApprovals)
      .where(
        and(
          eq(contentApprovals.status, 'APPROVED'),
          sql`${contentApprovals.reviewedAt} >= CURRENT_DATE`
        )
      )

    const [rejectedTodayResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentApprovals)
      .where(
        and(
          eq(contentApprovals.status, 'REJECTED'),
          sql`${contentApprovals.reviewedAt} >= CURRENT_DATE`
        )
      )

    return {
      pending: pendingResult?.count ?? 0,
      approvedToday: approvedTodayResult?.count ?? 0,
      rejectedToday: rejectedTodayResult?.count ?? 0,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const contentApprovalRepository = new ContentApprovalRepositoryClass()

export { ContentApprovalRepositoryClass as ContentApprovalRepository }
