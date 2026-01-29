// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - STATS ROUTES
// Route definitions for platform statistics
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { auth } from '../middleware/auth'
import { statsController } from '../controllers/stats.controller'
import type { AppEnv } from '../types'

export const statsRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /stats/platform - Get platform-wide statistics
statsRoutes.get(
  '/platform',
  (c) => statsController.getPlatformStats(c)
)

// GET /stats/trending - Get trending topics/tags
statsRoutes.get(
  '/trending',
  (c) => statsController.getTrending(c)
)

// GET /stats/leaderboard - Top users leaderboard
statsRoutes.get(
  '/leaderboard',
  (c) => statsController.getLeaderboard(c)
)

// GET /stats/polls/:id - Detailed poll statistics
statsRoutes.get(
  '/polls/:id',
  (c) => statsController.getPollStatistics(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /stats/me - Get current user's statistics
statsRoutes.get(
  '/me',
  auth,
  (c) => statsController.getMyStats(c)
)

// GET /stats/me/activity - Get user's activity summary
statsRoutes.get(
  '/me/activity',
  auth,
  (c) => statsController.getMyActivity(c)
)

// GET /stats/me/trust-score - Get user's trust score breakdown
statsRoutes.get(
  '/me/trust-score',
  auth,
  (c) => statsController.getMyTrustScore(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /stats/admin/overview - Admin dashboard statistics
statsRoutes.get(
  '/admin/overview',
  auth,
  (c) => statsController.getAdminOverview(c)
)

// GET /stats/admin/users - User statistics for admin
statsRoutes.get(
  '/admin/users',
  auth,
  (c) => statsController.getAdminUserStats(c)
)

// GET /stats/admin/content - Content statistics for admin
statsRoutes.get(
  '/admin/content',
  auth,
  (c) => statsController.getAdminContentStats(c)
)
