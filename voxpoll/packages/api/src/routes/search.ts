// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SEARCH ROUTES
// Global search functionality for polls, users, and tags
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { optionalAuth } from '../middleware/auth'
import { rateLimit } from '../middleware/rate-limit'
import { searchService } from '../services/search.service'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Validators
// ─────────────────────────────────────────────────────────────────────────────

const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['all', 'polls', 'users', 'tags']).optional().default('all'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
})

const tagSearchSchema = z.object({
  q: z.string().min(1).max(50),
  limit: z.coerce.number().min(1).max(20).optional().default(10),
})

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

export const searchRoutes = new Hono<AppEnv>()

// GET /search - Global search
searchRoutes.get(
  '/',
  optionalAuth,
  rateLimit({ limit: 30, window: 60, prefix: 'rl:search' }),
  zValidator('query', searchQuerySchema),
  async (c) => {
    const { q, type, page, limit } = c.req.valid('query')
    const userId = c.get('userId')

    const result = await searchService.search(q, type, page, limit, userId)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }
)

// GET /search/tags - Search tags
searchRoutes.get(
  '/tags',
  rateLimit({ limit: 60, window: 60, prefix: 'rl:search:tags' }),
  zValidator('query', tagSearchSchema),
  async (c) => {
    const { q, limit } = c.req.valid('query')

    const result = await searchService.searchTags(q, limit)

    return c.json({
      success: true,
      data: result,
    })
  }
)

// GET /search/suggestions - Get search suggestions
searchRoutes.get(
  '/suggestions',
  rateLimit({ limit: 120, window: 60, prefix: 'rl:search:suggestions' }),
  zValidator('query', tagSearchSchema),
  async (c) => {
    const { q, limit } = c.req.valid('query')

    const result = await searchService.getSuggestions(q, limit)

    return c.json({
      success: true,
      data: result,
    })
  }
)
