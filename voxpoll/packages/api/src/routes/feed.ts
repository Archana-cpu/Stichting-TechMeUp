// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - FEED ROUTES
// User feed and trending content
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { auth, optionalAuth } from '../middleware/auth'
import { rateLimit } from '../middleware/rate-limit'
import { feedService } from '../services/feed.service'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Validators
// ─────────────────────────────────────────────────────────────────────────────

const feedQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  categoryId: z.string().optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

export const feedRoutes = new Hono<AppEnv>()

// GET /feed - Get personalized feed (requires auth)
feedRoutes.get(
  '/',
  auth,
  rateLimit({ limit: 60, window: 60, prefix: 'rl:feed' }),
  zValidator('query', feedQuerySchema),
  async (c) => {
    const { page, limit, categoryId } = c.req.valid('query')
    const userId = c.get('userId')!

    const result = await feedService.getPersonalizedFeed(userId, page, limit, categoryId)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }
)

// GET /feed/trending - Get trending content (public)
feedRoutes.get(
  '/trending',
  optionalAuth,
  rateLimit({ limit: 60, window: 60, prefix: 'rl:feed:trending' }),
  zValidator('query', feedQuerySchema),
  async (c) => {
    const { page, limit, categoryId } = c.req.valid('query')

    const result = await feedService.getTrendingFeed(page, limit, categoryId)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }
)

// GET /feed/following - Get content from followed users
feedRoutes.get(
  '/following',
  auth,
  rateLimit({ limit: 60, window: 60, prefix: 'rl:feed:following' }),
  zValidator('query', feedQuerySchema),
  async (c) => {
    const { page, limit } = c.req.valid('query')
    const userId = c.get('userId')!

    const result = await feedService.getFollowingFeed(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }
)
