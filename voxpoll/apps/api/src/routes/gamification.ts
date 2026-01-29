// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - GAMIFICATION ROUTES
// Route definitions for gamification endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { gamificationController } from '../controllers/gamification.controller'
import { auth } from '../middleware/auth'

// ─────────────────────────────────────────────────────────────────────────────
// Router Instance
// ─────────────────────────────────────────────────────────────────────────────

export const gamificationRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Protected Routes (require authentication)
// ─────────────────────────────────────────────────────────────────────────────

gamificationRoutes.use('/*', auth)

// ─────────────────────────────────────────────────────────────────────────────
// Profile Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /gamification/profile - Get current user's gamification profile
gamificationRoutes.get('/profile', (c) => gamificationController.getProfile(c))

// ─────────────────────────────────────────────────────────────────────────────
// Badge Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /gamification/badges - Get all available badges
gamificationRoutes.get('/badges', (c) => gamificationController.getAllBadges(c))

// GET /gamification/badges/earned - Get user's earned badges
gamificationRoutes.get('/badges/earned', (c) => gamificationController.getUserBadges(c))

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /gamification/leaderboard - Get leaderboard
gamificationRoutes.get('/leaderboard', (c) => gamificationController.getLeaderboard(c))

// ─────────────────────────────────────────────────────────────────────────────
// XP History Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /gamification/xp-history - Get user's XP transaction history
gamificationRoutes.get('/xp-history', (c) => gamificationController.getXPHistory(c))
