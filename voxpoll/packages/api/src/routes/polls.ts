// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - POLL ROUTES
// Route definitions with controller delegation
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth, optionalAuth } from '../middleware/auth'
import { rateLimit, combinedRateLimit, perResourceRateLimit, RATE_LIMITS } from '../middleware/rate-limit'
import { pollController } from '../controllers/poll.controller'
import {
  createPollSchema,
  updatePollSchema,
  voteSchema,
  listPollsSchema,
} from '../validators/poll.validators'
import type { AppEnv } from '../types'

export const pollRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes
// IMPORTANT: Specific pattern routes MUST come BEFORE generic /:id to prevent conflicts
// ─────────────────────────────────────────────────────────────────────────────

// GET /polls - List polls
pollRoutes.get(
  '/',
  optionalAuth,
  zValidator('query', listPollsSchema),
  (c) => pollController.listPolls(c)
)

// GET /polls/slug/:slug - Get poll by slug (specific - before /:id)
pollRoutes.get(
  '/slug/:slug',
  optionalAuth,
  (c) => pollController.getPollBySlug(c)
)

// GET /polls/share/:code - Access poll via share code (specific - before /:id)
// Moved here from Sharing section to fix route ordering conflict
pollRoutes.get(
  '/share/:code',
  optionalAuth,
  (c) => pollController.getPollByShareCode(c)
)

// GET /polls/:id - Get single poll (generic - MUST be after specific routes)
pollRoutes.get(
  '/:id',
  optionalAuth,
  (c) => pollController.getPoll(c)
)

// GET /polls/:id/results - Get poll results
pollRoutes.get(
  '/:id/results',
  optionalAuth,
  (c) => pollController.getResults(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /polls - Create poll
pollRoutes.post(
  '/',
  auth,
  rateLimit(RATE_LIMITS.createPoll),
  zValidator('json', createPollSchema),
  (c) => pollController.createPoll(c)
)

// PATCH /polls/:id - Update poll
pollRoutes.patch(
  '/:id',
  auth,
  zValidator('json', updatePollSchema),
  (c) => pollController.updatePoll(c)
)

// DELETE /polls/:id - Delete poll
pollRoutes.delete(
  '/:id',
  auth,
  (c) => pollController.deletePoll(c)
)

// POST /polls/:id/vote - Vote on poll
// Rate limits: 30/hour global + 1 per poll per minute (prevents rapid voting)
pollRoutes.post(
  '/:id/vote',
  auth,
  rateLimit(RATE_LIMITS.vote),
  perResourceRateLimit(RATE_LIMITS.votePerPoll, (c) => c.req.param('id') || 'unknown'),
  zValidator('json', voteSchema),
  (c) => pollController.vote(c)
)

// GET /polls/:id/analytics - Get poll analytics (creator only)
pollRoutes.get(
  '/:id/analytics',
  auth,
  (c) => pollController.getAnalytics(c)
)

// DELETE /polls/:id/vote - Retract vote
pollRoutes.delete(
  '/:id/vote',
  auth,
  (c) => pollController.retractVote(c)
)

// GET /polls/:id/my-vote - Get user's vote on poll
pollRoutes.get(
  '/:id/my-vote',
  auth,
  (c) => pollController.getMyVote(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Poll Lifecycle Management
// ─────────────────────────────────────────────────────────────────────────────

// POST /polls/:id/publish - Publish draft poll
pollRoutes.post(
  '/:id/publish',
  auth,
  (c) => pollController.publishPoll(c)
)

// POST /polls/:id/close - Close poll (stop accepting votes)
pollRoutes.post(
  '/:id/close',
  auth,
  (c) => pollController.closePoll(c)
)

// POST /polls/:id/archive - Archive poll
pollRoutes.post(
  '/:id/archive',
  auth,
  (c) => pollController.archivePoll(c)
)

// POST /polls/:id/unarchive - Restore archived poll
pollRoutes.post(
  '/:id/unarchive',
  auth,
  (c) => pollController.unarchivePoll(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Sharing
// Note: GET /polls/share/:code moved to Public Routes section for correct ordering
// ─────────────────────────────────────────────────────────────────────────────

// POST /polls/:id/share - Generate share link
pollRoutes.post(
  '/:id/share',
  auth,
  (c) => pollController.generateShareLink(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Comments (nested under polls)
// ─────────────────────────────────────────────────────────────────────────────

// GET /polls/:id/comments - Get poll comments
pollRoutes.get(
  '/:id/comments',
  optionalAuth,
  (c) => pollController.getComments(c)
)

// POST /polls/:id/comments - Add comment to poll
pollRoutes.post(
  '/:id/comments',
  auth,
  rateLimit(RATE_LIMITS.comment),
  (c) => pollController.addComment(c)
)
