// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - CONTENT APPROVAL CONTROLLER
// HTTP request/response handling for content approval operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { contentApprovalService } from '../services/content-approval.service'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Content Approval Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class ContentApprovalControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /content-approvals/submit - Submit content for approval
  // ─────────────────────────────────────────────────────────────────────────────

  async submitForApproval(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const input = c.req.valid('json' as never)

    const result = await contentApprovalService.submitForApproval(userId, input)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /content-approvals - Get approval requests (for moderators)
  // ─────────────────────────────────────────────────────────────────────────────

  async getApprovals(c: Context<AppEnv>) {
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const filters = {
      status: query['status'] as 'NONE' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED' | undefined,
      contentType: query['contentType'] as 'POLL' | 'QUICK_POLL' | 'LIVE_POLL' | 'SURVEY' | 'TEST' | undefined,
    }

    const result = await contentApprovalService.getApprovals(page, limit, filters)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /content-approvals/my - Get user's own approvals
  // ─────────────────────────────────────────────────────────────────────────────

  async getMyApprovals(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const result = await contentApprovalService.getUserApprovals(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /content-approvals/:id - Get approval details
  // ─────────────────────────────────────────────────────────────────────────────

  async getApproval(c: Context<AppEnv>) {
    const approvalId = c.req.param('id')

    const result = await contentApprovalService.getApproval(approvalId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /content-approvals/:id/approve - Approve content
  // ─────────────────────────────────────────────────────────────────────────────

  async approveContent(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const approvalId = c.req.param('id')
    const input = c.req.valid('json' as never)

    const result = await contentApprovalService.approveContent(approvalId, moderatorId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /content-approvals/:id/reject - Reject content
  // ─────────────────────────────────────────────────────────────────────────────

  async rejectContent(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const approvalId = c.req.param('id')
    const input = c.req.valid('json' as never)

    const result = await contentApprovalService.rejectContent(approvalId, moderatorId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /content-approvals/:id/request-revision - Request revision
  // ─────────────────────────────────────────────────────────────────────────────

  async requestRevision(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const approvalId = c.req.param('id')
    const input = c.req.valid('json' as never)

    const result = await contentApprovalService.requestRevision(approvalId, moderatorId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /content-approvals/bulk/approve - Bulk approve
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkApprove(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const input = c.req.valid('json' as never) as { approvalIds: string[]; notes?: string }

    const result = await contentApprovalService.bulkApprove(input.approvalIds, moderatorId, input.notes)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /content-approvals/bulk/reject - Bulk reject
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkReject(c: Context<AppEnv>) {
    const moderatorId = c.get('userId')!
    const input = c.req.valid('json' as never) as { approvalIds: string[]; reason: string }

    const result = await contentApprovalService.bulkReject(input.approvalIds, moderatorId, input.reason)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /content-approvals/stats - Get approval stats
  // ─────────────────────────────────────────────────────────────────────────────

  async getStats(c: Context<AppEnv>) {
    const result = await contentApprovalService.getStats()

    return c.json({
      success: true,
      data: result,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const contentApprovalController = new ContentApprovalControllerClass()

export { ContentApprovalControllerClass as ContentApprovalController }
