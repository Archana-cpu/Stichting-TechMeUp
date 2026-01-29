// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - CONTENT APPROVAL VALIDATORS
// Zod schemas for content approval validation
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Enum Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const contentTypeSchema = z.enum(['POLL', 'QUICK_POLL', 'LIVE_POLL', 'SURVEY', 'TEST'])

export const approvalStatusSchema = z.enum([
  'NONE',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'REVISION_REQUESTED',
])

// ─────────────────────────────────────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const submitForApprovalSchema = z.object({
  contentType: contentTypeSchema,
  contentId: z.string().min(1, 'Content ID is required'),
})

export const approveContentSchema = z.object({
  notes: z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
})

export const rejectContentSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason must be at most 500 characters'),
  notes: z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
})

export const requestRevisionSchema = z.object({
  instructions: z.string().min(20, 'Instructions must be at least 20 characters').max(2000, 'Instructions must be at most 2000 characters'),
  notes: z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
})

export const bulkApproveSchema = z.object({
  approvalIds: z.array(z.string()).min(1, 'At least one approval ID required').max(100, 'Maximum 100 approvals per request'),
  notes: z.string().max(500).optional(),
})

export const bulkRejectSchema = z.object({
  approvalIds: z.array(z.string()).min(1, 'At least one approval ID required').max(100, 'Maximum 100 approvals per request'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason must be at most 500 characters'),
})

// ─────────────────────────────────────────────────────────────────────────────
// Filter Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const approvalFilterSchema = z.object({
  status: approvalStatusSchema.optional(),
  contentType: contentTypeSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────────────────────

export type SubmitForApprovalInput = z.infer<typeof submitForApprovalSchema>
export type ApproveContentInput = z.infer<typeof approveContentSchema>
export type RejectContentInput = z.infer<typeof rejectContentSchema>
export type RequestRevisionInput = z.infer<typeof requestRevisionSchema>
export type BulkApproveInput = z.infer<typeof bulkApproveSchema>
export type BulkRejectInput = z.infer<typeof bulkRejectSchema>
export type ApprovalFilterInput = z.infer<typeof approvalFilterSchema>
