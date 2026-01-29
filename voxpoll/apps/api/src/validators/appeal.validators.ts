// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - APPEAL VALIDATORS
// Zod schemas for appeal validation
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Enum Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const appealStatusSchema = z.enum(['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'DENIED'])

export const moderationDecisionTypeSchema = z.enum([
  'REPORT',
  'CONTENT_APPROVAL',
  'USER_ACTION',
  'MODERATION_QUEUE',
])

export const contentTypeSchema = z.enum(['POLL', 'QUICK_POLL', 'LIVE_POLL', 'SURVEY', 'TEST'])

// ─────────────────────────────────────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const submitAppealSchema = z.object({
  moderationDecisionType: moderationDecisionTypeSchema,
  moderationDecisionId: z.string().min(1, 'Decision ID is required'),
  contentType: contentTypeSchema.optional(),
  contentId: z.string().optional(),
  reason: z.string().min(50, 'Reason must be at least 50 characters').max(2000, 'Reason must be at most 2000 characters'),
  evidence: z.array(z.unknown()).max(10, 'Maximum 10 evidence items').optional(),
})

export const acceptAppealSchema = z.object({
  decision: z.string().min(10, 'Decision must be at least 10 characters').max(500, 'Decision must be at most 500 characters'),
  notes: z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
  actionsTaken: z.array(z.string()).max(20).optional(),
})

export const denyAppealSchema = z.object({
  decision: z.string().min(10, 'Decision must be at least 10 characters').max(500, 'Decision must be at most 500 characters'),
  notes: z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Filter Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const appealFilterSchema = z.object({
  status: appealStatusSchema.optional(),
  moderationDecisionType: moderationDecisionTypeSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────────────────────

export type SubmitAppealInput = z.infer<typeof submitAppealSchema>
export type AcceptAppealInput = z.infer<typeof acceptAppealSchema>
export type DenyAppealInput = z.infer<typeof denyAppealSchema>
export type AppealFilterInput = z.infer<typeof appealFilterSchema>
