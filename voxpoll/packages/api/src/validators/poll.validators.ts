// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - POLL VALIDATORS
// Zod validation schemas for poll endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const pollTypeSchema = z.enum([
  'STANDARD',
  'QUICK_POLL',
  'LIVE_POLL',
  'RANKED_CHOICE',
  'DEMOGRAPHIC',
])

export const pollVisibilitySchema = z.enum([
  'PUBLIC',
  'UNLISTED',
  'PRIVATE',
  'FOLLOWERS_ONLY',
])

export const pollSortSchema = z.enum(['recent', 'popular', 'trending'])

// ─────────────────────────────────────────────────────────────────────────────
// Create Poll Schema
// ─────────────────────────────────────────────────────────────────────────────

export const createPollSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  type: pollTypeSchema.default('STANDARD'),
  visibility: pollVisibilitySchema.default('PUBLIC'),
  options: z
    .array(
      z.object({
        text: z
          .string()
          .min(1, 'Option text is required')
          .max(500, 'Option text must be at most 500 characters'),
        imageUrl: z.string().url('Invalid image URL').optional(),
      })
    )
    .min(2, 'Poll must have at least 2 options')
    .max(10, 'Poll can have at most 10 options'),
  allowMultipleVotes: z.boolean().default(false),
  maxVotesPerUser: z.number().int().min(1).max(10).default(1),
  showResultsBeforeVote: z.boolean().default(false),
  allowDiscussion: z.boolean().default(true),
  endsAt: z.string().datetime({ message: 'Invalid datetime format' }).optional(),
  categoryId: z.string().cuid('Invalid category ID').optional(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(5, 'Maximum 5 tags allowed')
    .optional(),
})

export type CreatePollInput = z.infer<typeof createPollSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Update Poll Schema
// ─────────────────────────────────────────────────────────────────────────────

export const updatePollSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional()
    .nullable(),
  visibility: pollVisibilitySchema.optional(),
  allowDiscussion: z.boolean().optional(),
  endsAt: z.string().datetime({ message: 'Invalid datetime format' }).optional().nullable(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(5, 'Maximum 5 tags allowed')
    .optional(),
})

export type UpdatePollInput = z.infer<typeof updatePollSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Vote Schema
// ─────────────────────────────────────────────────────────────────────────────

export const voteSchema = z.object({
  optionId: z.string().min(1, 'Option ID is required'),
})

export type VoteInput = z.infer<typeof voteSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Ranked Vote Schema (for ranked choice polls)
// ─────────────────────────────────────────────────────────────────────────────

export const rankedVoteSchema = z.object({
  rankings: z
    .array(
      z.object({
        optionId: z.string(),
        rank: z.number().int().min(1),
      })
    )
    .min(1, 'At least one ranking is required'),
})

export type RankedVoteInput = z.infer<typeof rankedVoteSchema>

// ─────────────────────────────────────────────────────────────────────────────
// List Polls Query Schema
// ─────────────────────────────────────────────────────────────────────────────

export const listPollsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  sort: pollSortSchema.optional().default('recent'),
  category: z.string().optional(),
  search: z.string().max(100).optional(),
  tags: z.string().optional(), // comma-separated
})

export type ListPollsInput = z.infer<typeof listPollsSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Poll ID Param Schema
// ─────────────────────────────────────────────────────────────────────────────

export const pollIdParamSchema = z.object({
  id: z.string().min(1, 'Poll ID is required'),
})

// ─────────────────────────────────────────────────────────────────────────────
// Poll Slug Param Schema
// ─────────────────────────────────────────────────────────────────────────────

export const pollSlugParamSchema = z.object({
  slug: z.string().min(1, 'Poll slug is required'),
})
