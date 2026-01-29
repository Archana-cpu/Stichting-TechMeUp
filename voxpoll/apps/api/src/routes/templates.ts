// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TEMPLATE ROUTES
// Route definitions for template operations
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { auth } from '../middleware/auth'
import { rateLimit, RATE_LIMITS } from '../middleware/rate-limit'
import { templateController } from '../controllers/template.controller'
import type { AppEnv } from '../types'

export const templateRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /templates/featured - Get featured templates (before /:id to avoid conflict)
templateRoutes.get(
  '/featured',
  (c) => templateController.getFeaturedTemplates(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /templates - List templates
templateRoutes.get(
  '/',
  auth,
  (c) => templateController.listTemplates(c)
)

// POST /templates - Create template
templateRoutes.post(
  '/',
  auth,
  rateLimit(RATE_LIMITS.createPoll),
  (c) => templateController.createTemplate(c)
)

// POST /templates/from-poll/:pollId - Create template from poll (before /:id)
templateRoutes.post(
  '/from-poll/:pollId',
  auth,
  rateLimit(RATE_LIMITS.createPoll),
  (c) => templateController.createTemplateFromPoll(c)
)

// GET /templates/:id - Get template by ID
templateRoutes.get(
  '/:id',
  auth,
  (c) => templateController.getTemplate(c)
)

// PATCH /templates/:id - Update template
templateRoutes.patch(
  '/:id',
  auth,
  (c) => templateController.updateTemplate(c)
)

// DELETE /templates/:id - Delete template
templateRoutes.delete(
  '/:id',
  auth,
  (c) => templateController.deleteTemplate(c)
)

// POST /templates/:id/use - Create poll from template
templateRoutes.post(
  '/:id/use',
  auth,
  rateLimit(RATE_LIMITS.createPoll),
  (c) => templateController.useTemplate(c)
)
