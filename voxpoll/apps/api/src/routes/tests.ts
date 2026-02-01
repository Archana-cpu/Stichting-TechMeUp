// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TEST ROUTES
// Route definitions with controller delegation
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth, optionalAuth } from '../middleware/auth'
import { rateLimit, RATE_LIMITS } from '../middleware/rate-limit'
import { testController } from '../controllers/test.controller'
import {
  createPersonalityTestSchema,
  createQuizTestSchema,
  updateTestSchema,
  addPersonalityQuestionSchema,
  addQuizQuestionSchema,
  submitPersonalityResultSchema,
  submitQuizAttemptSchema,
  listTestsSchema,
} from '../validators/test.validators'
import { paginationSchema } from '../validators/user.validators'
import type { AppEnv } from '../types'

export const testRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /tests - List tests
testRoutes.get(
  '/',
  optionalAuth,
  zValidator('query', listTestsSchema),
  (c) => testController.listTests(c)
)

// GET /tests/slug/:slug - Get test by slug
testRoutes.get(
  '/slug/:slug',
  optionalAuth,
  (c) => testController.getTestBySlug(c)
)

// GET /tests/:id - Get single test
testRoutes.get(
  '/:id',
  optionalAuth,
  (c) => testController.getTest(c)
)

// GET /tests/:id/leaderboard - Get quiz leaderboard (public)
testRoutes.get(
  '/:id/leaderboard',
  zValidator('query', paginationSchema),
  (c) => testController.getLeaderboard(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes - Create Tests
// ─────────────────────────────────────────────────────────────────────────────

// POST /tests/personality - Create personality test
testRoutes.post(
  '/personality',
  auth,
  rateLimit(RATE_LIMITS.createPoll),
  zValidator('json', createPersonalityTestSchema),
  (c) => testController.createPersonalityTest(c)
)

// POST /tests/quiz - Create quiz test
testRoutes.post(
  '/quiz',
  auth,
  rateLimit(RATE_LIMITS.createPoll),
  zValidator('json', createQuizTestSchema),
  (c) => testController.createQuizTest(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes - Manage Tests
// ─────────────────────────────────────────────────────────────────────────────

// PATCH /tests/:id - Update test
testRoutes.patch(
  '/:id',
  auth,
  zValidator('json', updateTestSchema),
  (c) => testController.updateTest(c)
)

// DELETE /tests/:id - Delete test
testRoutes.delete(
  '/:id',
  auth,
  (c) => testController.deleteTest(c)
)

// POST /tests/:id/publish - Publish test
testRoutes.post(
  '/:id/publish',
  auth,
  (c) => testController.publishTest(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes - Add Questions
// ─────────────────────────────────────────────────────────────────────────────

// POST /tests/:id/questions/personality - Add personality question
testRoutes.post(
  '/:id/questions/personality',
  auth,
  zValidator('json', addPersonalityQuestionSchema),
  (c) => testController.addPersonalityQuestion(c)
)

// POST /tests/:id/questions/quiz - Add quiz question
testRoutes.post(
  '/:id/questions/quiz',
  auth,
  zValidator('json', addQuizQuestionSchema),
  (c) => testController.addQuizQuestion(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes - Take Tests
// ─────────────────────────────────────────────────────────────────────────────

// POST /tests/:id/submit/personality - Submit personality test result
testRoutes.post(
  '/:id/submit/personality',
  auth,
  rateLimit(RATE_LIMITS.vote),
  zValidator('json', submitPersonalityResultSchema),
  (c) => testController.submitPersonalityResult(c)
)

// POST /tests/:id/attempt - Start quiz attempt
testRoutes.post(
  '/:id/attempt',
  auth,
  rateLimit(RATE_LIMITS.vote),
  (c) => testController.startQuizAttempt(c)
)

// POST /tests/:id/submit/quiz - Submit quiz attempt
testRoutes.post(
  '/:id/submit/quiz',
  auth,
  zValidator('json', submitQuizAttemptSchema),
  (c) => testController.submitQuizAttempt(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes - Results
// ─────────────────────────────────────────────────────────────────────────────

// GET /tests/:id/results - Get test results (creator only)
testRoutes.get(
  '/:id/results',
  auth,
  zValidator('query', paginationSchema),
  (c) => testController.getTestResults(c)
)

// GET /tests/badges - Get current user's test badges
testRoutes.get(
  '/badges',
  auth,
  (c) => testController.getUserBadges(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Badge Card Generation
// ─────────────────────────────────────────────────────────────────────────────

// POST /tests/:testId/results/:resultId/share-card - Generate share card
testRoutes.post(
  '/:testId/results/:resultId/share-card',
  optionalAuth,
  rateLimit(RATE_LIMITS.vote),
  (c) => testController.generateShareCard(c)
)
