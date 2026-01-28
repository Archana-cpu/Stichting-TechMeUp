// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - GAMIFICATION CONTROLLER
// HTTP request/response handling for gamification operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { gamificationService, type LeaderboardPeriod } from '../services/gamification.service'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Gamification Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class GamificationControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /gamification/profile - Get user profile
  // ─────────────────────────────────────────────────────────────────────────────

  async getProfile(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const profile = await gamificationService.getProfile(userId)

    return c.json({
      success: true,
      data: profile,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /gamification/badges - Get all available badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getAllBadges(c: Context<AppEnv>) {
    const category = c.req.query('category')
    const badges = await gamificationService.getAllBadges(category)

    return c.json({
      success: true,
      data: badges,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /gamification/badges/earned - Get user earned badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserBadges(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const badges = await gamificationService.getUserBadges(userId)

    return c.json({
      success: true,
      data: badges,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /gamification/leaderboard - Get leaderboard
  // ─────────────────────────────────────────────────────────────────────────────

  async getLeaderboard(c: Context<AppEnv>) {
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )
    const period = (query['period'] as LeaderboardPeriod) || 'allTime'

    const result = await gamificationService.getLeaderboard(page, limit, period)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /gamification/xp-history - Get XP history
  // ─────────────────────────────────────────────────────────────────────────────

  async getXPHistory(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const result = await gamificationService.getXPHistory(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }
}

// Export singleton
export const gamificationController = new GamificationControllerClass()

// Export class for testing
export { GamificationControllerClass as GamificationController }
