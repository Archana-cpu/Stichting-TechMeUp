// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUDIT LOG ROUTES
// Route definitions for audit log endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/permissions'
import { auditLogController } from '../controllers/audit-log.controller'
import type { AppEnv } from '../types'

export const auditLogRoutes = new Hono<AppEnv>()

auditLogRoutes.use('/*', auth)
auditLogRoutes.use('/*', requireRole('ADMIN'))

// ─────────────────────────────────────────────────────────────────────────────
// Query Routes (Admin only)
// ─────────────────────────────────────────────────────────────────────────────

auditLogRoutes.get('/', (c) => auditLogController.getLogs(c))

auditLogRoutes.get('/stats', (c) => auditLogController.getStats(c))

auditLogRoutes.get('/user/:userId', (c) => auditLogController.getUserHistory(c))

auditLogRoutes.get('/entity/:type/:id', (c) => auditLogController.getEntityAuditTrail(c))

auditLogRoutes.get('/moderator/:moderatorId', (c) => auditLogController.getModeratorActions(c))
