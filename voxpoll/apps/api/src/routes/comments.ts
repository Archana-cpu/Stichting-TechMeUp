// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - COMMENT ROUTES
// Route definitions with controller delegation
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth } from '../middleware/auth'
import { rateLimit, RATE_LIMITS } from '../middleware/rate-limit'
import { commentController } from '../controllers/comment.controller'
import {
  createCommentSchema,
  updateCommentSchema,
  voteCommentSchema,
  voiceAccessRequestSchema,
  listCommentsSchema,
} from '../validators/comment.validators'
import type { AppEnv } from '../types'

export const commentRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Discussion Comments Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /discussions/:id/comments - Get comments for discussion
commentRoutes.get(
  '/discussions/:id/comments',
  zValidator('query', listCommentsSchema),
  (c) => commentController.getComments(c)
)

// POST /discussions/:id/comments - Create comment
commentRoutes.post(
  '/discussions/:id/comments',
  auth,
  rateLimit(RATE_LIMITS.comment),
  zValidator('json', createCommentSchema),
  (c) => commentController.createComment(c)
)

// POST /discussions/:id/voice-access - Request voice access
commentRoutes.post(
  '/discussions/:id/voice-access',
  auth,
  zValidator('json', voiceAccessRequestSchema),
  (c) => commentController.requestVoiceAccess(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Individual Comment Routes
// ─────────────────────────────────────────────────────────────────────────────

// PATCH /comments/:id - Update comment
commentRoutes.patch(
  '/:id',
  auth,
  zValidator('json', updateCommentSchema),
  (c) => commentController.updateComment(c)
)

// DELETE /comments/:id - Delete comment
commentRoutes.delete(
  '/:id',
  auth,
  (c) => commentController.deleteComment(c)
)

// POST /comments/:id/vote - Vote on comment
commentRoutes.post(
  '/:id/vote',
  auth,
  rateLimit(RATE_LIMITS.vote),
  zValidator('json', voteCommentSchema),
  (c) => commentController.voteComment(c)
)
