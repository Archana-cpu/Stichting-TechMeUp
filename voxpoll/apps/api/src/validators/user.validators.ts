// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - USER VALIDATORS
// Zod validation schemas for user endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Profile Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name cannot be empty')
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .optional(),
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .nullable(),
  website: z
    .string()
    .url('Invalid website URL')
    .optional()
    .nullable(),
  location: z
    .string()
    .max(100, 'Location must be at most 100 characters')
    .optional()
    .nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Settings Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const profileVisibilitySchema = z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE'])

export const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  profileVisibility: profileVisibilitySchema.optional(),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Username Param Schema
// ─────────────────────────────────────────────────────────────────────────────

export const usernameParamSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
})

// ─────────────────────────────────────────────────────────────────────────────
// Search Schema
// ─────────────────────────────────────────────────────────────────────────────

export const searchUsersSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

// ─────────────────────────────────────────────────────────────────────────────
// Pagination Query Schema
// ─────────────────────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

// ─────────────────────────────────────────────────────────────────────────────
// Profile Visit Schemas (Bible: 03-FEATURES/08-social.md)
// ─────────────────────────────────────────────────────────────────────────────

export const profileVisitSourceSchema = z.enum([
  'SEARCH',
  'FEED',
  'COMMENT',
  'MENTION',
  'DIRECT',
  'EXTERNAL',
])

export const trackVisitSchema = z.object({
  source: profileVisitSourceSchema.optional().default('DIRECT'),
  anonymous: z.coerce.boolean().optional().default(false),
})
