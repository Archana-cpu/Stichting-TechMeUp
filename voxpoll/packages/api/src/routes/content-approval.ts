// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - CONTENT APPROVAL ROUTES
// Route definitions for content approval endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/permissions'
import { contentApprovalController } from '../controllers/content-approval.controller'
import {
  submitForApprovalSchema,
  approveContentSchema,
  rejectContentSchema,
  requestRevisionSchema,
  bulkApproveSchema,
  bulkRejectSchema,
} from '../validators/content-approval.validators'
import type { AppEnv } from '../types'

export const contentApprovalRoutes = new Hono<AppEnv>()

contentApprovalRoutes.use('/*', auth)

// ─────────────────────────────────────────────────────────────────────────────
// User Routes
// ─────────────────────────────────────────────────────────────────────────────

contentApprovalRoutes.post(
  '/submit',
  zValidator('json', submitForApprovalSchema),
  (c) => contentApprovalController.submitForApproval(c)
)

contentApprovalRoutes.get('/my', (c) => contentApprovalController.getMyApprovals(c))

// ─────────────────────────────────────────────────────────────────────────────
// Moderator Routes
// ─────────────────────────────────────────────────────────────────────────────

contentApprovalRoutes.get(
  '/',
  requireRole('MODERATOR'),
  (c) => contentApprovalController.getApprovals(c)
)

contentApprovalRoutes.get(
  '/stats',
  requireRole('MODERATOR'),
  (c) => contentApprovalController.getStats(c)
)

contentApprovalRoutes.get(
  '/:id',
  requireRole('MODERATOR'),
  (c) => contentApprovalController.getApproval(c)
)

contentApprovalRoutes.post(
  '/:id/approve',
  requireRole('MODERATOR'),
  zValidator('json', approveContentSchema),
  (c) => contentApprovalController.approveContent(c)
)

contentApprovalRoutes.post(
  '/:id/reject',
  requireRole('MODERATOR'),
  zValidator('json', rejectContentSchema),
  (c) => contentApprovalController.rejectContent(c)
)

contentApprovalRoutes.post(
  '/:id/request-revision',
  requireRole('MODERATOR'),
  zValidator('json', requestRevisionSchema),
  (c) => contentApprovalController.requestRevision(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Bulk Actions (Moderator)
// ─────────────────────────────────────────────────────────────────────────────

contentApprovalRoutes.post(
  '/bulk/approve',
  requireRole('MODERATOR'),
  zValidator('json', bulkApproveSchema),
  (c) => contentApprovalController.bulkApprove(c)
)

contentApprovalRoutes.post(
  '/bulk/reject',
  requireRole('MODERATOR'),
  zValidator('json', bulkRejectSchema),
  (c) => contentApprovalController.bulkReject(c)
)
