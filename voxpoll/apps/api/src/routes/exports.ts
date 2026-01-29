// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - EXPORT ROUTES
// Route definitions for export operations
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { auth } from '../middleware/auth'
import { rateLimit, RATE_LIMITS } from '../middleware/rate-limit'
import { exportController } from '../controllers/export.controller'
import type { AppEnv } from '../types'

export const exportRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Export List
// ─────────────────────────────────────────────────────────────────────────────

// GET /exports - Get user's exports
exportRoutes.get(
  '/',
  auth,
  (c) => exportController.getUserExports(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Poll Exports
// ─────────────────────────────────────────────────────────────────────────────

// POST /exports/polls/:id - Export poll results
exportRoutes.post(
  '/polls/:id',
  auth,
  rateLimit(RATE_LIMITS.exportData),
  (c) => exportController.exportPollResults(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Survey Exports
// ─────────────────────────────────────────────────────────────────────────────

// POST /exports/surveys/:id - Export survey responses
exportRoutes.post(
  '/surveys/:id',
  auth,
  rateLimit(RATE_LIMITS.exportData),
  (c) => exportController.exportSurveyResponses(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Test Exports
// ─────────────────────────────────────────────────────────────────────────────

// POST /exports/tests/:id - Export test results
exportRoutes.post(
  '/tests/:id',
  auth,
  rateLimit(RATE_LIMITS.exportData),
  (c) => exportController.exportTestResults(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Export Status & Download
// ─────────────────────────────────────────────────────────────────────────────

// GET /exports/:id - Get export status
exportRoutes.get(
  '/:id',
  auth,
  (c) => exportController.getExportStatus(c)
)

// GET /exports/:id/download - Download export
exportRoutes.get(
  '/:id/download',
  auth,
  (c) => exportController.downloadExport(c)
)
