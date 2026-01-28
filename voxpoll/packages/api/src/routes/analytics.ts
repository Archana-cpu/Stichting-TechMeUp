// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ANALYTICS ROUTES
// Route definitions for analytics operations
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { auth } from '../middleware/auth'
import { analyticsController } from '../controllers/analytics.controller'
import type { AppEnv } from '../types'

export const analyticsRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// User Analytics
// ─────────────────────────────────────────────────────────────────────────────

// GET /analytics/me - Get user analytics (before /polls/:id to avoid conflict)
analyticsRoutes.get(
  '/me',
  auth,
  (c) => analyticsController.getUserAnalytics(c)
)

// GET /analytics/platform - Get platform stats (admin)
analyticsRoutes.get(
  '/platform',
  auth,
  (c) => analyticsController.getPlatformStats(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Poll Analytics
// ─────────────────────────────────────────────────────────────────────────────

// GET /analytics/polls/:id - Get poll analytics
analyticsRoutes.get(
  '/polls/:id',
  auth,
  (c) => analyticsController.getPollAnalytics(c)
)

// GET /analytics/polls/:id/demographics - Get poll demographics
analyticsRoutes.get(
  '/polls/:id/demographics',
  auth,
  (c) => analyticsController.getPollDemographics(c)
)

// GET /analytics/polls/:id/timeline - Get poll timeline
analyticsRoutes.get(
  '/polls/:id/timeline',
  auth,
  (c) => analyticsController.getPollTimeline(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Survey Analytics
// ─────────────────────────────────────────────────────────────────────────────

// GET /analytics/surveys/:id - Get survey analytics
analyticsRoutes.get(
  '/surveys/:id',
  auth,
  (c) => analyticsController.getSurveyAnalytics(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Test Analytics
// ─────────────────────────────────────────────────────────────────────────────

// GET /analytics/tests/:id - Get test analytics
analyticsRoutes.get(
  '/tests/:id',
  auth,
  (c) => analyticsController.getTestAnalytics(c)
)
