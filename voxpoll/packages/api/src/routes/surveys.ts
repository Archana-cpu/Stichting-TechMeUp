// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SURVEY ROUTES
// Route definitions with controller delegation
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth, optionalAuth } from '../middleware/auth'
import { rateLimit, RATE_LIMITS } from '../middleware/rate-limit'
import { surveyController } from '../controllers/survey.controller'
import {
  createSurveySchema,
  updateSurveySchema,
  createSectionSchema,
  createQuestionSchema,
  submitResponseSchema,
  listSurveysSchema,
} from '../validators/survey.validators'
import { paginationSchema } from '../validators/user.validators'
import type { AppEnv } from '../types'

export const surveyRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /surveys - List active surveys
surveyRoutes.get(
  '/',
  optionalAuth,
  zValidator('query', listSurveysSchema),
  (c) => surveyController.listSurveys(c)
)

// GET /surveys/:id - Get single survey
surveyRoutes.get(
  '/:id',
  optionalAuth,
  (c) => surveyController.getSurvey(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /surveys - Create survey
surveyRoutes.post(
  '/',
  auth,
  rateLimit(RATE_LIMITS.createPoll), // reuse poll limit for surveys
  zValidator('json', createSurveySchema),
  (c) => surveyController.createSurvey(c)
)

// PATCH /surveys/:id - Update survey
surveyRoutes.patch(
  '/:id',
  auth,
  zValidator('json', updateSurveySchema),
  (c) => surveyController.updateSurvey(c)
)

// DELETE /surveys/:id - Delete survey
surveyRoutes.delete(
  '/:id',
  auth,
  (c) => surveyController.deleteSurvey(c)
)

// POST /surveys/:id/publish - Publish survey
surveyRoutes.post(
  '/:id/publish',
  auth,
  (c) => surveyController.publishSurvey(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Section Routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /surveys/:id/sections - Add section to survey
surveyRoutes.post(
  '/:id/sections',
  auth,
  zValidator('json', createSectionSchema),
  (c) => surveyController.addSection(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Question Routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /surveys/:id/sections/:sectionId/questions - Add question to section
surveyRoutes.post(
  '/:id/sections/:sectionId/questions',
  auth,
  zValidator('json', createQuestionSchema),
  (c) => surveyController.addQuestion(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Response Routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /surveys/:id/respond - Submit response to survey
surveyRoutes.post(
  '/:id/respond',
  auth,
  rateLimit(RATE_LIMITS.vote), // reuse vote limit for responses
  zValidator('json', submitResponseSchema),
  (c) => surveyController.submitResponse(c)
)

// GET /surveys/:id/responses - Get survey responses (creator/org admin only)
surveyRoutes.get(
  '/:id/responses',
  auth,
  zValidator('query', paginationSchema),
  (c) => surveyController.getResponses(c)
)
