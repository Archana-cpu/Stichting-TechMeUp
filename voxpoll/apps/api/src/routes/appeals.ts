// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - APPEAL ROUTES
// Route definitions for appeal endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth } from '../middleware/auth'
import { requireRole } from '../middleware/permissions'
import { appealController } from '../controllers/appeal.controller'
import {
  submitAppealSchema,
  acceptAppealSchema,
  denyAppealSchema,
} from '../validators/appeal.validators'
import type { AppEnv } from '../types'

export const appealRoutes = new Hono<AppEnv>()

appealRoutes.use('/*', auth)

// ─────────────────────────────────────────────────────────────────────────────
// User Routes
// ─────────────────────────────────────────────────────────────────────────────

appealRoutes.post(
  '/',
  zValidator('json', submitAppealSchema),
  (c) => appealController.submitAppeal(c)
)

appealRoutes.get('/my', (c) => appealController.getMyAppeals(c))

// ─────────────────────────────────────────────────────────────────────────────
// Moderator Routes
// ─────────────────────────────────────────────────────────────────────────────

appealRoutes.get(
  '/',
  requireRole('MODERATOR'),
  (c) => appealController.getAppeals(c)
)

appealRoutes.get(
  '/stats',
  requireRole('MODERATOR'),
  (c) => appealController.getStats(c)
)

appealRoutes.get(
  '/:id',
  requireRole('MODERATOR'),
  (c) => appealController.getAppeal(c)
)

appealRoutes.post(
  '/:id/assign',
  requireRole('MODERATOR'),
  (c) => appealController.assignAppeal(c)
)

appealRoutes.post(
  '/:id/accept',
  requireRole('MODERATOR'),
  zValidator('json', acceptAppealSchema),
  (c) => appealController.acceptAppeal(c)
)

appealRoutes.post(
  '/:id/deny',
  requireRole('MODERATOR'),
  zValidator('json', denyAppealSchema),
  (c) => appealController.denyAppeal(c)
)
