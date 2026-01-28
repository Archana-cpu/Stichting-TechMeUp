// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - GAMIFICATION VALIDATORS
// Zod validation schemas for gamification endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard Period Schema
// ─────────────────────────────────────────────────────────────────────────────

export const leaderboardPeriodSchema = z.enum(['daily', 'weekly', 'monthly', 'allTime'])

export type LeaderboardPeriodInput = z.infer<typeof leaderboardPeriodSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Badge Category Schema
// ─────────────────────────────────────────────────────────────────────────────

export const badgeCategorySchema = z.enum([
  'PARTICIPATION',
  'CREATION',
  'QUALITY',
  'SOCIAL',
  'STREAK',
  'SPECIAL',
  'ACHIEVEMENT',
])

export type BadgeCategoryInput = z.infer<typeof badgeCategorySchema>

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard Query Schema
// ─────────────────────────────────────────────────────────────────────────────

export const leaderboardQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  period: leaderboardPeriodSchema.optional().default('allTime'),
})

export type LeaderboardQueryInput = z.infer<typeof leaderboardQuerySchema>

// ─────────────────────────────────────────────────────────────────────────────
// XP History Query Schema
// ─────────────────────────────────────────────────────────────────────────────

export const xpHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

export type XPHistoryQueryInput = z.infer<typeof xpHistoryQuerySchema>

// ─────────────────────────────────────────────────────────────────────────────
// Badges Query Schema
// ─────────────────────────────────────────────────────────────────────────────

export const badgesQuerySchema = z.object({
  category: badgeCategorySchema.optional(),
})

export type BadgesQueryInput = z.infer<typeof badgesQuerySchema>
