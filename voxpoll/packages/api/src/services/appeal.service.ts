// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - APPEAL SERVICE
// Business logic for appeal handling
// ══════════════════════════════════════════════════════════════════════════════

import { type AppealStatus, type ContentType, type ReportPriority } from '@voxpoll/database'
import { appealRepository } from '../repositories/appeal.repository'
import { auditLogService } from './audit-log.service'
import { ApiError } from '../middleware/error-handler'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SubmitAppealInput {
  moderationDecisionType: string
  moderationDecisionId: string
  contentType?: ContentType
  contentId?: string
  reason: string
  evidence?: unknown[]
}

export interface AcceptAppealInput {
  decision: string
  notes?: string
  actionsTaken?: string[]
}

export interface DenyAppealInput {
  decision: string
  notes?: string
}

export interface AppealFilters {
  status?: AppealStatus
  moderationDecisionType?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Appeal Service Class
// ─────────────────────────────────────────────────────────────────────────────

class AppealServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Submit Appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async submitAppeal(userId: string, input: SubmitAppealInput) {
    const existingAppeal = await appealRepository.findExistingAppeal(
      userId,
      input.moderationDecisionType,
      input.moderationDecisionId
    )

    if (existingAppeal) {
      throw ApiError.conflict('You have already submitted an appeal for this decision', 'APPEAL_ALREADY_EXISTS')
    }

    const appeal = await appealRepository.create({
      appealerId: userId,
      moderationDecisionType: input.moderationDecisionType,
      moderationDecisionId: input.moderationDecisionId,
      contentType: input.contentType,
      contentId: input.contentId,
      reason: input.reason,
      evidence: input.evidence,
    })

    if (!appeal) {
      throw ApiError.internal('Failed to create appeal', 'APPEAL_CREATE_FAILED')
    }

    await auditLogService.logAction({
      actorId: userId,
      actorType: 'USER',
      action: 'APPEAL_SUBMITTED',
      entityType: 'APPEAL',
      entityId: appeal.id,
      metadata: {
        moderationDecisionType: input.moderationDecisionType,
        moderationDecisionId: input.moderationDecisionId,
      },
    })

    return {
      id: appeal.id,
      status: appeal.status,
      createdAt: appeal.createdAt,
      message: 'Appeal submitted successfully',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Appeals (Moderator View)
  // ─────────────────────────────────────────────────────────────────────────────

  async getAppeals(
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    filters: AppealFilters = {}
  ) {
    const result = await appealRepository.getAppeals(page, limit, filters)

    return {
      items: result.items.map((appeal) => ({
        id: appeal.id,
        moderationDecisionType: appeal.moderationDecisionType,
        moderationDecisionId: appeal.moderationDecisionId,
        contentType: appeal.contentType,
        contentId: appeal.contentId,
        status: appeal.status,
        priority: appeal.priority,
        appealer: appeal.appealer,
        assignedTo: appeal.assignedTo,
        createdAt: appeal.createdAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Appeal Details
  // ─────────────────────────────────────────────────────────────────────────────

  async getAppeal(appealId: string) {
    const appeal = await appealRepository.getById(appealId)

    if (!appeal) {
      throw ApiError.notFound('Appeal not found', 'APPEAL_NOT_FOUND')
    }

    return {
      id: appeal.id,
      moderationDecisionType: appeal.moderationDecisionType,
      moderationDecisionId: appeal.moderationDecisionId,
      contentType: appeal.contentType,
      contentId: appeal.contentId,
      status: appeal.status,
      priority: appeal.priority,
      reason: appeal.reason,
      evidence: appeal.evidence,
      appealer: appeal.appealer,
      assignee: appeal.assignee,
      reviewer: appeal.reviewer,
      decision: appeal.decision,
      decisionNotes: appeal.decisionNotes,
      actionsTaken: appeal.actionsTaken,
      createdAt: appeal.createdAt,
      assignedAt: appeal.assignedAt,
      reviewedAt: appeal.reviewedAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User's Own Appeals
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserAppeals(userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const result = await appealRepository.getUserAppeals(userId, page, limit)

    return {
      items: result.items.map((appeal) => ({
        id: appeal.id,
        moderationDecisionType: appeal.moderationDecisionType,
        moderationDecisionId: appeal.moderationDecisionId,
        contentType: appeal.contentType,
        status: appeal.status,
        decision: appeal.decision,
        decisionNotes: appeal.decisionNotes,
        createdAt: appeal.createdAt,
        reviewedAt: appeal.reviewedAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Assign Appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async assignAppeal(appealId: string, moderatorId: string) {
    const appeal = await appealRepository.getById(appealId)

    if (!appeal) {
      throw ApiError.notFound('Appeal not found', 'APPEAL_NOT_FOUND')
    }

    if (appeal.status !== 'PENDING') {
      throw ApiError.badRequest('Appeal is not pending', 'NOT_PENDING')
    }

    const updated = await appealRepository.assign(appealId, moderatorId)

    if (!updated) {
      throw ApiError.internal('Failed to assign appeal', 'ASSIGN_FAILED')
    }

    return {
      id: updated.id,
      status: updated.status,
      assignedAt: updated.assignedAt,
      message: 'Appeal assigned successfully',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Accept Appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async acceptAppeal(appealId: string, moderatorId: string, input: AcceptAppealInput) {
    const appeal = await appealRepository.getById(appealId)

    if (!appeal) {
      throw ApiError.notFound('Appeal not found', 'APPEAL_NOT_FOUND')
    }

    if (appeal.status !== 'PENDING' && appeal.status !== 'UNDER_REVIEW') {
      throw ApiError.badRequest('Appeal cannot be processed', 'INVALID_STATUS')
    }

    const updated = await appealRepository.accept(
      appealId,
      moderatorId,
      input.decision,
      input.notes,
      input.actionsTaken
    )

    if (!updated) {
      throw ApiError.internal('Failed to accept appeal', 'ACCEPT_FAILED')
    }

    await auditLogService.logAction({
      actorId: moderatorId,
      actorType: 'USER',
      action: 'APPEAL_ACCEPTED',
      entityType: 'APPEAL',
      entityId: appealId,
      metadata: {
        appealerId: appeal.appealerId,
        decision: input.decision,
        actionsTaken: input.actionsTaken,
      },
    })

    return {
      id: updated.id,
      status: updated.status,
      reviewedAt: updated.reviewedAt,
      message: 'Appeal accepted',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Deny Appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async denyAppeal(appealId: string, moderatorId: string, input: DenyAppealInput) {
    const appeal = await appealRepository.getById(appealId)

    if (!appeal) {
      throw ApiError.notFound('Appeal not found', 'APPEAL_NOT_FOUND')
    }

    if (appeal.status !== 'PENDING' && appeal.status !== 'UNDER_REVIEW') {
      throw ApiError.badRequest('Appeal cannot be processed', 'INVALID_STATUS')
    }

    const updated = await appealRepository.deny(
      appealId,
      moderatorId,
      input.decision,
      input.notes
    )

    if (!updated) {
      throw ApiError.internal('Failed to deny appeal', 'DENY_FAILED')
    }

    await auditLogService.logAction({
      actorId: moderatorId,
      actorType: 'USER',
      action: 'APPEAL_DENIED',
      entityType: 'APPEAL',
      entityId: appealId,
      metadata: {
        appealerId: appeal.appealerId,
        decision: input.decision,
      },
    })

    return {
      id: updated.id,
      status: updated.status,
      reviewedAt: updated.reviewedAt,
      message: 'Appeal denied',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Check if User Can Appeal
  // ─────────────────────────────────────────────────────────────────────────────

  async canUserAppeal(userId: string, decisionType: string, decisionId: string) {
    const existingAppeal = await appealRepository.findExistingAppeal(
      userId,
      decisionType,
      decisionId
    )

    return !existingAppeal
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getStats() {
    return appealRepository.getStats()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const appealService = new AppealServiceClass()

export { AppealServiceClass as AppealService }
