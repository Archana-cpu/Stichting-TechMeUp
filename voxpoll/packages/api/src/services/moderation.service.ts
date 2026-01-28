// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - MODERATION SERVICE
// Business logic for moderation operations
// ══════════════════════════════════════════════════════════════════════════════

import { type ReportReason, type ReportStatus, type ReportTargetType, type ReportResolution, type ModerationStatus, type ModerationResolution } from '@voxpoll/database'
import { moderationRepository } from '../repositories/moderation.repository'
import { ApiError } from '../middleware/error-handler'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateReportInput {
  targetType: ReportTargetType
  targetId: string
  reportedUserId?: string
  reason: ReportReason
  details?: string
  evidence?: Record<string, unknown>
}

export interface ResolveReportInput {
  status: 'RESOLVED' | 'DISMISSED'
  resolution?: ReportResolution
  resolutionNotes?: string
  actionsTaken?: string[]
}

export interface ModerateUserInput {
  reason: string
  duration?: number // in hours, for suspension
}

// ─────────────────────────────────────────────────────────────────────────────
// Moderation Service Class
// ─────────────────────────────────────────────────────────────────────────────

class ModerationServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Create Report
  // ─────────────────────────────────────────────────────────────────────────────

  async createReport(reporterId: string, input: CreateReportInput) {
    // Check for duplicate report
    const existing = await moderationRepository.findExistingReport(input.targetId, reporterId)
    if (existing) {
      throw ApiError.conflict('You have already reported this content', 'DUPLICATE_REPORT')
    }

    // Cannot report yourself
    if (input.reportedUserId === reporterId) {
      throw ApiError.badRequest('Cannot report your own content', 'CANNOT_REPORT_SELF')
    }

    const report = await moderationRepository.createReport({
      reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      reportedUserId: input.reportedUserId,
      reason: input.reason,
      details: input.details,
      evidence: input.evidence as unknown[] | undefined,
    })

    if (!report) {
      throw ApiError.internal('Failed to create report', 'REPORT_CREATE_FAILED')
    }

    return {
      id: report.id,
      status: report.status,
      createdAt: report.createdAt,
      message: 'Report submitted successfully',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Reports (Moderation Queue)
  // ─────────────────────────────────────────────────────────────────────────────

  async getReports(
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    filters: {
      status?: ReportStatus
      reason?: ReportReason
      targetType?: ReportTargetType
      assignedTo?: string
    } = {}
  ) {
    const result = await moderationRepository.getReports(page, limit, filters)

    return {
      items: result.items.map((report) => ({
        id: report.id,
        targetType: report.targetType,
        targetId: report.targetId,
        reason: report.reason,
        status: report.status,
        priority: report.priority,
        reporter: report.reporter,
        reportedUser: report.reportedUser,
        assignedTo: report.assignedTo,
        createdAt: report.createdAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Report Details
  // ─────────────────────────────────────────────────────────────────────────────

  async getReport(reportId: string) {
    const report = await moderationRepository.getReportById(reportId)

    if (!report) {
      throw ApiError.notFound('Report not found', 'REPORT_NOT_FOUND')
    }

    return {
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      details: report.details,
      evidence: report.evidence,
      status: report.status,
      priority: report.priority,
      reporter: report.reporter,
      reportedUser: report.reportedUser,
      assignedTo: report.assignedTo,
      resolution: report.resolution,
      resolutionNotes: report.resolutionNotes,
      actionsTaken: report.actionsTaken,
      createdAt: report.createdAt,
      assignedAt: report.assignedAt,
      resolvedAt: report.resolvedAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Assign Report
  // ─────────────────────────────────────────────────────────────────────────────

  async assignReport(reportId: string, moderatorId: string) {
    const report = await moderationRepository.getReportById(reportId)

    if (!report) {
      throw ApiError.notFound('Report not found', 'REPORT_NOT_FOUND')
    }

    if (report.status !== 'PENDING') {
      throw ApiError.badRequest('Report is not pending', 'REPORT_NOT_PENDING')
    }

    const updated = await moderationRepository.assignReport(reportId, moderatorId)

    if (!updated) {
      throw ApiError.internal('Failed to assign report', 'ASSIGN_FAILED')
    }

    return {
      id: updated.id,
      status: updated.status,
      assignedTo: updated.assignedTo,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Resolve Report
  // ─────────────────────────────────────────────────────────────────────────────

  async resolveReport(reportId: string, moderatorId: string, input: ResolveReportInput) {
    const report = await moderationRepository.getReportById(reportId)

    if (!report) {
      throw ApiError.notFound('Report not found', 'REPORT_NOT_FOUND')
    }

    if (report.status === 'RESOLVED' || report.status === 'DISMISSED') {
      throw ApiError.badRequest('Report already resolved', 'ALREADY_RESOLVED')
    }

    // Only assigned moderator or any moderator if unassigned can resolve
    if (report.assignedTo && report.assignedTo !== moderatorId) {
      throw ApiError.forbidden('Report assigned to another moderator', 'NOT_ASSIGNED')
    }

    const updated = await moderationRepository.resolveReport(reportId, {
      status: input.status,
      resolution: input.resolution,
      resolutionNotes: input.resolutionNotes,
      actionsTaken: input.actionsTaken,
    })

    if (!updated) {
      throw ApiError.internal('Failed to resolve report', 'RESOLVE_FAILED')
    }

    return {
      id: updated.id,
      status: updated.status,
      resolution: updated.resolution,
      resolvedAt: updated.resolvedAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // User Moderation Actions
  // ─────────────────────────────────────────────────────────────────────────────

  async suspendUser(targetUserId: string, moderatorId: string, input: ModerateUserInput) {
    const user = await moderationRepository.getUserById(targetUserId)

    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND')
    }

    if (user.status === 'BANNED') {
      throw ApiError.badRequest('User is already banned', 'USER_BANNED')
    }

    if (user.status === 'SUSPENDED') {
      throw ApiError.conflict('User is already suspended', 'ALREADY_SUSPENDED')
    }

    await moderationRepository.updateUserStatus(targetUserId, 'SUSPENDED')

    // Log action in moderation queue
    await moderationRepository.createModerationQueueItem({
      entityType: 'USER',
      entityId: targetUserId,
      reason: `SUSPEND: ${input.reason}`,
      metadata: {
        moderatorId,
        duration: input.duration,
        action: 'SUSPEND',
      },
    })

    return {
      userId: targetUserId,
      status: 'SUSPENDED',
      duration: input.duration,
    }
  }

  async banUser(targetUserId: string, moderatorId: string, input: ModerateUserInput) {
    const user = await moderationRepository.getUserById(targetUserId)

    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND')
    }

    if (user.status === 'BANNED') {
      throw ApiError.badRequest('User is already banned', 'ALREADY_BANNED')
    }

    await moderationRepository.updateUserStatus(targetUserId, 'BANNED')

    // Log action in moderation queue
    await moderationRepository.createModerationQueueItem({
      entityType: 'USER',
      entityId: targetUserId,
      reason: `BAN: ${input.reason}`,
      metadata: {
        moderatorId,
        action: 'BAN',
      },
    })

    return {
      userId: targetUserId,
      status: 'BANNED',
    }
  }

  async unbanUser(targetUserId: string, moderatorId: string, reason: string) {
    const user = await moderationRepository.getUserById(targetUserId)

    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND')
    }

    if (user.status !== 'BANNED' && user.status !== 'SUSPENDED') {
      throw ApiError.badRequest('User is not banned or suspended', 'NOT_BANNED')
    }

    await moderationRepository.updateUserStatus(targetUserId, 'ACTIVE')

    // Log action in moderation queue
    await moderationRepository.createModerationQueueItem({
      entityType: 'USER',
      entityId: targetUserId,
      reason: `UNBAN: ${reason}`,
      metadata: {
        moderatorId,
        action: 'UNBAN',
      },
    })

    return { success: true }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Moderation Queue (for auto-flagged content)
  // ─────────────────────────────────────────────────────────────────────────────

  async getModerationQueue(
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    filters: {
      status?: ModerationStatus
      entityType?: string
      assignedTo?: string
    } = {}
  ) {
    const result = await moderationRepository.getModerationQueue(page, limit, filters)

    return {
      items: result.items.map((item) => ({
        id: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
        reason: item.reason,
        fraudScore: item.fraudScore,
        qualityScore: item.qualityScore,
        riskFactors: item.riskFactors,
        priority: item.priority,
        status: item.status,
        assignedTo: item.assignedTo,
        createdAt: item.createdAt,
      })),
      meta: result.meta,
    }
  }

  async assignModerationQueueItem(itemId: string, moderatorId: string) {
    const item = await moderationRepository.getModerationQueueItem(itemId)

    if (!item) {
      throw ApiError.notFound('Item not found', 'ITEM_NOT_FOUND')
    }

    if (item.status !== 'PENDING') {
      throw ApiError.badRequest('Item is not pending', 'ITEM_NOT_PENDING')
    }

    const updated = await moderationRepository.assignModerationQueueItem(itemId, moderatorId)

    if (!updated) {
      throw ApiError.internal('Failed to assign item', 'ASSIGN_FAILED')
    }

    return {
      id: updated.id,
      status: updated.status,
      assignedTo: updated.assignedTo,
    }
  }

  async resolveModerationQueueItem(
    itemId: string,
    moderatorId: string,
    input: {
      status: 'APPROVED' | 'REJECTED'
      resolution?: ModerationResolution
      resolutionNotes?: string
    }
  ) {
    const item = await moderationRepository.getModerationQueueItem(itemId)

    if (!item) {
      throw ApiError.notFound('Item not found', 'ITEM_NOT_FOUND')
    }

    if (item.status === 'RESOLVED' || item.status === 'DISMISSED') {
      throw ApiError.badRequest('Item already resolved', 'ALREADY_RESOLVED')
    }

    // Map APPROVED/REJECTED to valid database enum values
    const resolvedStatus = input.status === 'APPROVED' ? 'RESOLVED' : 'DISMISSED'

    const updated = await moderationRepository.resolveModerationQueueItem(itemId, {
      status: resolvedStatus as 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED' | 'ESCALATED',
      resolution: input.resolution,
      resolutionNotes: input.resolutionNotes,
      resolvedBy: moderatorId,
    })

    if (!updated) {
      throw ApiError.internal('Failed to resolve item', 'RESOLVE_FAILED')
    }

    return {
      id: updated.id,
      status: updated.status,
      resolution: updated.resolution,
      resolvedAt: updated.resolvedAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getStats() {
    const [reportStats, queueStats] = await Promise.all([
      moderationRepository.getReportStats(),
      moderationRepository.getModerationQueueStats(),
    ])

    return {
      reports: reportStats,
      moderationQueue: queueStats,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Bulk Report Operations
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkAssignReports(reportIds: string[], moderatorId: string) {
    if (reportIds.length === 0) {
      throw ApiError.badRequest('No report IDs provided', 'EMPTY_IDS')
    }

    if (reportIds.length > 100) {
      throw ApiError.badRequest('Maximum 100 reports per bulk operation', 'TOO_MANY_IDS')
    }

    const results = await moderationRepository.bulkAssignReports(reportIds, moderatorId)

    return {
      assigned: results.length,
      items: results.map((r) => ({ id: r.id, status: r.status })),
    }
  }

  async bulkResolveReports(
    reportIds: string[],
    moderatorId: string,
    input: ResolveReportInput
  ) {
    if (reportIds.length === 0) {
      throw ApiError.badRequest('No report IDs provided', 'EMPTY_IDS')
    }

    if (reportIds.length > 100) {
      throw ApiError.badRequest('Maximum 100 reports per bulk operation', 'TOO_MANY_IDS')
    }

    // Verify reports exist and are resolvable
    const existingReports = await moderationRepository.getReportsByIds(reportIds)
    const existingIds = new Set(existingReports.map((r) => r.id))
    const notFound = reportIds.filter((id) => !existingIds.has(id))

    if (notFound.length > 0) {
      throw ApiError.notFound(`Reports not found: ${notFound.join(', ')}`, 'REPORTS_NOT_FOUND')
    }

    const alreadyResolved = existingReports.filter(
      (r) => r.status === 'RESOLVED' || r.status === 'DISMISSED'
    )

    if (alreadyResolved.length > 0) {
      throw ApiError.badRequest(
        `${alreadyResolved.length} reports already resolved`,
        'ALREADY_RESOLVED'
      )
    }

    const results = await moderationRepository.bulkResolveReports(reportIds, {
      status: input.status,
      resolution: input.resolution,
      resolutionNotes: input.resolutionNotes,
      actionsTaken: input.actionsTaken,
    })

    return {
      resolved: results.length,
      items: results.map((r) => ({
        id: r.id,
        status: r.status,
        resolution: r.resolution,
      })),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Bulk Moderation Queue Operations
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkAssignModerationQueue(itemIds: string[], moderatorId: string) {
    if (itemIds.length === 0) {
      throw ApiError.badRequest('No item IDs provided', 'EMPTY_IDS')
    }

    if (itemIds.length > 100) {
      throw ApiError.badRequest('Maximum 100 items per bulk operation', 'TOO_MANY_IDS')
    }

    const results = await moderationRepository.bulkAssignModerationQueueItems(itemIds, moderatorId)

    return {
      assigned: results.length,
      items: results.map((item) => ({ id: item.id, status: item.status })),
    }
  }

  async bulkApproveModerationQueue(
    itemIds: string[],
    moderatorId: string,
    input: {
      resolution?: ModerationResolution
      resolutionNotes?: string
    }
  ) {
    if (itemIds.length === 0) {
      throw ApiError.badRequest('No item IDs provided', 'EMPTY_IDS')
    }

    if (itemIds.length > 100) {
      throw ApiError.badRequest('Maximum 100 items per bulk operation', 'TOO_MANY_IDS')
    }

    const existingItems = await moderationRepository.getModerationQueueItemsByIds(itemIds)
    const existingIds = new Set(existingItems.map((i) => i.id))
    const notFound = itemIds.filter((id) => !existingIds.has(id))

    if (notFound.length > 0) {
      throw ApiError.notFound(`Items not found: ${notFound.join(', ')}`, 'ITEMS_NOT_FOUND')
    }

    const results = await moderationRepository.bulkResolveModerationQueueItems(itemIds, {
      status: 'RESOLVED',
      resolution: input.resolution,
      resolutionNotes: input.resolutionNotes,
      resolvedBy: moderatorId,
    })

    return {
      approved: results.length,
      items: results.map((item) => ({
        id: item.id,
        status: item.status,
        resolution: item.resolution,
      })),
    }
  }

  async bulkRejectModerationQueue(
    itemIds: string[],
    moderatorId: string,
    input: {
      resolution?: ModerationResolution
      resolutionNotes?: string
    }
  ) {
    if (itemIds.length === 0) {
      throw ApiError.badRequest('No item IDs provided', 'EMPTY_IDS')
    }

    if (itemIds.length > 100) {
      throw ApiError.badRequest('Maximum 100 items per bulk operation', 'TOO_MANY_IDS')
    }

    const existingItems = await moderationRepository.getModerationQueueItemsByIds(itemIds)
    const existingIds = new Set(existingItems.map((i) => i.id))
    const notFound = itemIds.filter((id) => !existingIds.has(id))

    if (notFound.length > 0) {
      throw ApiError.notFound(`Items not found: ${notFound.join(', ')}`, 'ITEMS_NOT_FOUND')
    }

    const results = await moderationRepository.bulkResolveModerationQueueItems(itemIds, {
      status: 'DISMISSED',
      resolution: input.resolution,
      resolutionNotes: input.resolutionNotes,
      resolvedBy: moderatorId,
    })

    return {
      rejected: results.length,
      items: results.map((item) => ({
        id: item.id,
        status: item.status,
        resolution: item.resolution,
      })),
    }
  }
}

// Export singleton
export const moderationService = new ModerationServiceClass()

// Export class for testing
export { ModerationServiceClass as ModerationService }
