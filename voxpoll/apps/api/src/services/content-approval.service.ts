// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - CONTENT APPROVAL SERVICE
// Business logic for content approval workflow
// ══════════════════════════════════════════════════════════════════════════════

import { type ContentType, type ApprovalStatus } from '@voxpoll/database'
import { contentApprovalRepository } from '../repositories/content-approval.repository'
import { autoApprovalService } from './auto-approval.service'
import { auditLogService } from './audit-log.service'
import { ApiError } from '../middleware/error-handler'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SubmitForApprovalInput {
  contentType: ContentType
  contentId: string
}

export interface ApproveContentInput {
  notes?: string
}

export interface RejectContentInput {
  reason: string
  notes?: string
}

export interface RequestRevisionInput {
  instructions: string
  notes?: string
}

export interface ApprovalFilters {
  status?: ApprovalStatus
  contentType?: ContentType
}

export interface BulkActionResult {
  success: number
  failed: number
  errors: Array<{ id: string; error: string }>
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Approval Service Class
// ─────────────────────────────────────────────────────────────────────────────

class ContentApprovalServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Submit Content for Approval
  // ─────────────────────────────────────────────────────────────────────────────

  async submitForApproval(userId: string, input: SubmitForApprovalInput, organizationId?: string) {
    const existingPending = await contentApprovalRepository.getPendingForContent(
      input.contentType,
      input.contentId
    )

    if (existingPending) {
      throw ApiError.conflict('Content already has a pending approval request', 'ALREADY_PENDING')
    }

    const autoApprovalResult = await autoApprovalService.evaluateContent(
      input.contentType,
      input.contentId,
      userId,
      organizationId
    )

    const latestApproval = await contentApprovalRepository.getLatestForContent(
      input.contentType,
      input.contentId
    )
    const nextVersion = latestApproval ? latestApproval.version + 1 : 1

    const approval = await contentApprovalRepository.create({
      contentType: input.contentType,
      contentId: input.contentId,
      submittedById: userId,
      version: nextVersion,
      autoApproved: autoApprovalResult.approved,
      autoApprovalReason: autoApprovalResult.reason,
    })

    if (!approval) {
      throw ApiError.internal('Failed to create approval request', 'APPROVAL_CREATE_FAILED')
    }

    const status: ApprovalStatus = autoApprovalResult.approved ? 'APPROVED' : 'PENDING_APPROVAL'
    await this.updateContentApprovalStatus(input.contentType, input.contentId, status, approval.id)

    if (autoApprovalResult.approved) {
      await auditLogService.logAction({
        actorId: 'SYSTEM',
        actorType: 'SYSTEM',
        action: 'CONTENT_AUTO_APPROVED',
        entityType: input.contentType,
        entityId: input.contentId,
        metadata: { approvalId: approval.id, reason: autoApprovalResult.reason },
      })
    }

    return {
      id: approval.id,
      status: approval.status,
      autoApproved: autoApprovalResult.approved,
      autoApprovalReason: autoApprovalResult.reason,
      createdAt: approval.createdAt,
      message: autoApprovalResult.approved
        ? 'Content auto-approved based on trust score'
        : 'Content submitted for approval',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Approval Requests (Moderator View)
  // ─────────────────────────────────────────────────────────────────────────────

  async getApprovals(
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    filters: ApprovalFilters = {}
  ) {
    const result = await contentApprovalRepository.getApprovals(page, limit, filters)

    return {
      items: result.items.map((approval) => ({
        id: approval.id,
        contentType: approval.contentType,
        contentId: approval.contentId,
        status: approval.status,
        version: approval.version,
        submitter: approval.submitter,
        autoApproved: approval.autoApproved,
        createdAt: approval.createdAt,
        reviewedAt: approval.reviewedAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Approval Details
  // ─────────────────────────────────────────────────────────────────────────────

  async getApproval(approvalId: string) {
    const approval = await contentApprovalRepository.getById(approvalId)

    if (!approval) {
      throw ApiError.notFound('Approval request not found', 'APPROVAL_NOT_FOUND')
    }

    return {
      id: approval.id,
      contentType: approval.contentType,
      contentId: approval.contentId,
      status: approval.status,
      version: approval.version,
      submitter: approval.submitter,
      reviewer: approval.reviewer,
      autoApproved: approval.autoApproved,
      autoApprovalReason: approval.autoApprovalReason,
      decisionNotes: approval.decisionNotes,
      rejectionReason: approval.rejectionReason,
      revisionInstructions: approval.revisionInstructions,
      createdAt: approval.createdAt,
      submittedAt: approval.submittedAt,
      reviewedAt: approval.reviewedAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User's Own Approvals
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserApprovals(
    userId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit
  ) {
    const result = await contentApprovalRepository.getApprovals(page, limit, {
      submittedById: userId,
    })

    return {
      items: result.items.map((approval) => ({
        id: approval.id,
        contentType: approval.contentType,
        contentId: approval.contentId,
        status: approval.status,
        version: approval.version,
        autoApproved: approval.autoApproved,
        rejectionReason: approval.rejectionReason,
        revisionInstructions: approval.revisionInstructions,
        createdAt: approval.createdAt,
        reviewedAt: approval.reviewedAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Approve Content
  // ─────────────────────────────────────────────────────────────────────────────

  async approveContent(approvalId: string, moderatorId: string, input: ApproveContentInput) {
    const approval = await contentApprovalRepository.getById(approvalId)

    if (!approval) {
      throw ApiError.notFound('Approval request not found', 'APPROVAL_NOT_FOUND')
    }

    if (approval.status !== 'PENDING_APPROVAL') {
      throw ApiError.badRequest('Approval is not pending', 'NOT_PENDING_APPROVAL')
    }

    const updated = await contentApprovalRepository.approve(approvalId, moderatorId, input.notes)

    if (!updated) {
      throw ApiError.internal('Failed to approve content', 'APPROVE_FAILED')
    }

    await this.updateContentApprovalStatus(
      approval.contentType,
      approval.contentId,
      'APPROVED',
      approvalId
    )

    await auditLogService.logAction({
      actorId: moderatorId,
      actorType: 'USER',
      action: 'CONTENT_APPROVED',
      entityType: approval.contentType,
      entityId: approval.contentId,
      metadata: { approvalId, notes: input.notes },
    })

    return {
      id: updated.id,
      status: updated.status,
      reviewedAt: updated.reviewedAt,
      message: 'Content approved successfully',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Reject Content
  // ─────────────────────────────────────────────────────────────────────────────

  async rejectContent(approvalId: string, moderatorId: string, input: RejectContentInput) {
    const approval = await contentApprovalRepository.getById(approvalId)

    if (!approval) {
      throw ApiError.notFound('Approval request not found', 'APPROVAL_NOT_FOUND')
    }

    if (approval.status !== 'PENDING_APPROVAL') {
      throw ApiError.badRequest('Approval is not pending', 'NOT_PENDING_APPROVAL')
    }

    const updated = await contentApprovalRepository.reject(
      approvalId,
      moderatorId,
      input.reason,
      input.notes
    )

    if (!updated) {
      throw ApiError.internal('Failed to reject content', 'REJECT_FAILED')
    }

    await this.updateContentApprovalStatus(
      approval.contentType,
      approval.contentId,
      'REJECTED',
      approvalId
    )

    await auditLogService.logAction({
      actorId: moderatorId,
      actorType: 'USER',
      action: 'CONTENT_REJECTED',
      entityType: approval.contentType,
      entityId: approval.contentId,
      metadata: { approvalId, reason: input.reason, notes: input.notes },
    })

    return {
      id: updated.id,
      status: updated.status,
      reviewedAt: updated.reviewedAt,
      message: 'Content rejected',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Request Revision
  // ─────────────────────────────────────────────────────────────────────────────

  async requestRevision(approvalId: string, moderatorId: string, input: RequestRevisionInput) {
    const approval = await contentApprovalRepository.getById(approvalId)

    if (!approval) {
      throw ApiError.notFound('Approval request not found', 'APPROVAL_NOT_FOUND')
    }

    if (approval.status !== 'PENDING_APPROVAL') {
      throw ApiError.badRequest('Approval is not pending', 'NOT_PENDING_APPROVAL')
    }

    const updated = await contentApprovalRepository.requestRevision(
      approvalId,
      moderatorId,
      input.instructions,
      input.notes
    )

    if (!updated) {
      throw ApiError.internal('Failed to request revision', 'REVISION_REQUEST_FAILED')
    }

    await this.updateContentApprovalStatus(
      approval.contentType,
      approval.contentId,
      'REVISION_REQUESTED',
      approvalId
    )

    await auditLogService.logAction({
      actorId: moderatorId,
      actorType: 'USER',
      action: 'CONTENT_REVISION_REQUESTED',
      entityType: approval.contentType,
      entityId: approval.contentId,
      metadata: { approvalId, instructions: input.instructions, notes: input.notes },
    })

    return {
      id: updated.id,
      status: updated.status,
      reviewedAt: updated.reviewedAt,
      message: 'Revision requested',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Bulk Approve
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkApprove(approvalIds: string[], moderatorId: string, notes?: string): Promise<BulkActionResult> {
    const result: BulkActionResult = { success: 0, failed: 0, errors: [] }

    for (const id of approvalIds) {
      try {
        await this.approveContent(id, moderatorId, { notes })
        result.success++
      } catch (error) {
        result.failed++
        result.errors.push({
          id,
          error: error instanceof ApiError ? error.message : 'Unknown error',
        })
      }
    }

    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Bulk Reject
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkReject(approvalIds: string[], moderatorId: string, reason: string): Promise<BulkActionResult> {
    const result: BulkActionResult = { success: 0, failed: 0, errors: [] }

    for (const id of approvalIds) {
      try {
        await this.rejectContent(id, moderatorId, { reason })
        result.success++
      } catch (error) {
        result.failed++
        result.errors.push({
          id,
          error: error instanceof ApiError ? error.message : 'Unknown error',
        })
      }
    }

    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getStats() {
    return contentApprovalRepository.getStats()
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Update Content Approval Status
  // ─────────────────────────────────────────────────────────────────────────────

  private async updateContentApprovalStatus(
    contentType: ContentType,
    contentId: string,
    status: ApprovalStatus,
    approvalId?: string
  ) {
    switch (contentType) {
      case 'POLL':
      case 'QUICK_POLL':
      case 'LIVE_POLL':
        await contentApprovalRepository.updatePollApprovalStatus(contentId, status, approvalId)
        break
      case 'SURVEY':
        await contentApprovalRepository.updateSurveyApprovalStatus(contentId, status, approvalId)
        break
      case 'TEST':
        await contentApprovalRepository.updateTestApprovalStatus(contentId, status, approvalId)
        break
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const contentApprovalService = new ContentApprovalServiceClass()

export { ContentApprovalServiceClass as ContentApprovalService }
