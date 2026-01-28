// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - MODERATION ROUTES
// Route definitions for moderation endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth } from '../middleware/auth'
import { moderationController } from '../controllers/moderation.controller'
import {
  createReportSchema,
  resolveReportSchema,
  moderateUserSchema,
  unbanUserSchema,
  bulkAssignSchema,
  bulkResolveReportsSchema,
  bulkResolveQueueSchema,
} from '../validators/moderation.validators'
import { requireRole } from '../middleware/permissions'
import type { AppEnv } from '../types'

export const moderationRoutes = new Hono<AppEnv>()

// All routes require authentication
moderationRoutes.use('/*', auth)

// ─────────────────────────────────────────────────────────────────────────────
// Report Routes (for users)
// ─────────────────────────────────────────────────────────────────────────────

// POST /reports - Create report
moderationRoutes.post(
  '/reports',
  zValidator('json', createReportSchema),
  (c) => moderationController.createReport(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Queue Routes (for moderators)
// ─────────────────────────────────────────────────────────────────────────────

// GET /moderation/queue - Get moderation queue
moderationRoutes.get('/queue', (c) => moderationController.getQueue(c))

// GET /moderation/queue/:id - Get report details
moderationRoutes.get('/queue/:id', (c) => moderationController.getReport(c))

// POST /moderation/queue/:id/assign - Assign report to self
moderationRoutes.post('/queue/:id/assign', (c) => moderationController.assignReport(c))

// POST /moderation/queue/:id/resolve - Resolve report
moderationRoutes.post(
  '/queue/:id/resolve',
  zValidator('json', resolveReportSchema),
  (c) => moderationController.resolveReport(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// User Moderation Routes (for moderators)
// ─────────────────────────────────────────────────────────────────────────────

// POST /moderation/users/:id/suspend - Suspend user
moderationRoutes.post(
  '/users/:id/suspend',
  zValidator('json', moderateUserSchema),
  (c) => moderationController.suspendUser(c)
)

// POST /moderation/users/:id/ban - Ban user
moderationRoutes.post(
  '/users/:id/ban',
  zValidator('json', moderateUserSchema),
  (c) => moderationController.banUser(c)
)

// POST /moderation/users/:id/unban - Unban user
moderationRoutes.post(
  '/users/:id/unban',
  zValidator('json', unbanUserSchema),
  (c) => moderationController.unbanUser(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Stats Routes (for admins)
// ─────────────────────────────────────────────────────────────────────────────

// GET /moderation/stats - Get moderation stats
moderationRoutes.get('/stats', (c) => moderationController.getStats(c))

// ─────────────────────────────────────────────────────────────────────────────
// Bulk Report Routes (for moderators)
// ─────────────────────────────────────────────────────────────────────────────

// POST /moderation/reports/bulk/assign - Bulk assign reports
moderationRoutes.post(
  '/reports/bulk/assign',
  requireRole('MODERATOR'),
  zValidator('json', bulkAssignSchema),
  (c) => moderationController.bulkAssignReports(c)
)

// POST /moderation/reports/bulk/resolve - Bulk resolve reports
moderationRoutes.post(
  '/reports/bulk/resolve',
  requireRole('MODERATOR'),
  zValidator('json', bulkResolveReportsSchema),
  (c) => moderationController.bulkResolveReports(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Bulk Queue Routes (for moderators)
// ─────────────────────────────────────────────────────────────────────────────

// POST /moderation/queue/bulk/assign - Bulk assign queue items
moderationRoutes.post(
  '/queue/bulk/assign',
  requireRole('MODERATOR'),
  zValidator('json', bulkAssignSchema),
  (c) => moderationController.bulkAssignQueue(c)
)

// POST /moderation/queue/bulk/approve - Bulk approve queue items
moderationRoutes.post(
  '/queue/bulk/approve',
  requireRole('MODERATOR'),
  zValidator('json', bulkResolveQueueSchema),
  (c) => moderationController.bulkApproveQueue(c)
)

// POST /moderation/queue/bulk/reject - Bulk reject queue items
moderationRoutes.post(
  '/queue/bulk/reject',
  requireRole('MODERATOR'),
  zValidator('json', bulkResolveQueueSchema),
  (c) => moderationController.bulkRejectQueue(c)
)
