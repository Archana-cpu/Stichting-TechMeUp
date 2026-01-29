// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SHARE LINK ROUTES
// Route definitions for share link operations
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { auth, optionalAuth } from '../middleware/auth'
import { rateLimit, RATE_LIMITS } from '../middleware/rate-limit'
import { shareController } from '../controllers/share.controller'
import type { AppEnv } from '../types'

export const shareRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /share/:code - Access content via share code
shareRoutes.get(
  '/:code',
  optionalAuth,
  (c) => shareController.accessShareLink(c)
)

// POST /share/:code/verify-password - Verify share link password
shareRoutes.post(
  '/:code/verify-password',
  (c) => shareController.verifyPassword(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /share-links - Create share link
shareRoutes.post(
  '-links',
  auth,
  rateLimit(RATE_LIMITS.api),
  (c) => shareController.createShareLink(c)
)

// GET /share-links/:id - Get share link by ID
shareRoutes.get(
  '-links/:id',
  auth,
  (c) => shareController.getShareLink(c)
)

// GET /share-links/content/:contentType/:contentId - Get share links by content
shareRoutes.get(
  '-links/content/:contentType/:contentId',
  auth,
  (c) => shareController.getShareLinksByContent(c)
)

// PATCH /share-links/:id - Update share link
shareRoutes.patch(
  '-links/:id',
  auth,
  (c) => shareController.updateShareLink(c)
)

// DELETE /share-links/:id - Delete share link
shareRoutes.delete(
  '-links/:id',
  auth,
  (c) => shareController.deleteShareLink(c)
)

// GET /share-links/:id/analytics - Get share link analytics
shareRoutes.get(
  '-links/:id/analytics',
  auth,
  (c) => shareController.getShareLinkAnalytics(c)
)

// POST /share-links/:id/participate - Mark participation
shareRoutes.post(
  '-links/:id/participate',
  optionalAuth,
  (c) => shareController.markParticipation(c)
)
