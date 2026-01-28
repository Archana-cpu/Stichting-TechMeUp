// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - COMMENT VALIDATORS
// Zod validation schemas for comment endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const commentSortSchema = z.enum(['best', 'newest', 'oldest', 'controversial'])

// ─────────────────────────────────────────────────────────────────────────────
// Create Comment Schema
// ─────────────────────────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be at most 2000 characters'),
  parentId: z.string().optional(),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Update Comment Schema
// ─────────────────────────────────────────────────────────────────────────────

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be at most 2000 characters'),
})

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Vote Comment Schema
// ─────────────────────────────────────────────────────────────────────────────

export const voteCommentSchema = z.object({
  value: z.number().int().min(-1).max(1),
})

export type VoteCommentInput = z.infer<typeof voteCommentSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Voice Access Request Schema
// ─────────────────────────────────────────────────────────────────────────────

export const voiceAccessRequestSchema = z.object({
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be at most 500 characters'),
})

export type VoiceAccessRequestInput = z.infer<typeof voiceAccessRequestSchema>

// ─────────────────────────────────────────────────────────────────────────────
// List Comments Query Schema
// ─────────────────────────────────────────────────────────────────────────────

export const listCommentsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  sort: commentSortSchema.optional().default('best'),
  parentId: z.string().optional(),
})

export type ListCommentsInput = z.infer<typeof listCommentsSchema>
