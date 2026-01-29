// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - MODERATION VALIDATORS
// Zod validation schemas for moderation endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Enums (matching Drizzle schema)
// ─────────────────────────────────────────────────────────────────────────────

export const reportTargetTypeSchema = z.enum([
  'USER',
  'POLL',
  'SURVEY',
  'TEST',
  'COMMENT',
  'DISCUSSION',
])

export const reportReasonSchema = z.enum([
  'SPAM',
  'HARASSMENT',
  'HATE_SPEECH',
  'MISINFORMATION',
  'INAPPROPRIATE_CONTENT',
  'VIOLENCE',
  'SELF_HARM',
  'ILLEGAL_CONTENT',
  'COPYRIGHT',
  'IMPERSONATION',
  'OTHER',
])

export const reportStatusSchema = z.enum([
  'PENDING',
  'IN_REVIEW',
  'RESOLVED',
  'DISMISSED',
  'ESCALATED',
])

export const reportResolutionSchema = z.enum([
  'NO_VIOLATION',
  'WARNING_ISSUED',
  'CONTENT_REMOVED',
  'CONTENT_MODIFIED',
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_BANNED',
  'ESCALATED_TO_LEGAL',
])

export const moderationStatusSchema = z.enum([
  'PENDING',
  'IN_REVIEW',
  'RESOLVED',
  'DISMISSED',
  'ESCALATED',
])

// ─────────────────────────────────────────────────────────────────────────────
// Create Report Schema
// ─────────────────────────────────────────────────────────────────────────────

export const createReportSchema = z.object({
  targetType: reportTargetTypeSchema,
  targetId: z.string().min(1, 'Target ID is required'),
  reportedUserId: z.string().optional(),
  reason: reportReasonSchema,
  details: z
    .string()
    .max(1000, 'Details must be at most 1000 characters')
    .optional(),
  evidence: z.array(z.unknown()).optional(),
})

export type CreateReportInput = z.infer<typeof createReportSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Resolve Report Schema
// ─────────────────────────────────────────────────────────────────────────────

export const resolveReportSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED']),
  resolution: reportResolutionSchema.optional(),
  resolutionNotes: z
    .string()
    .max(1000, 'Resolution notes must be at most 1000 characters')
    .optional(),
  actionsTaken: z.array(z.string()).optional(),
})

export type ResolveReportInput = z.infer<typeof resolveReportSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Moderate User Schema
// ─────────────────────────────────────────────────────────────────────────────

export const moderateUserSchema = z.object({
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be at most 500 characters'),
  duration: z
    .number()
    .int()
    .positive()
    .max(8760, 'Duration must be at most 8760 hours (1 year)')
    .optional(), // in hours, for suspension
})

export type ModerateUserInput = z.infer<typeof moderateUserSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Unban User Schema
// ─────────────────────────────────────────────────────────────────────────────

export const unbanUserSchema = z.object({
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be at most 500 characters'),
})

export type UnbanUserInput = z.infer<typeof unbanUserSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Queue Filter Schema
// ─────────────────────────────────────────────────────────────────────────────

export const reportFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: reportStatusSchema.optional(),
  reason: reportReasonSchema.optional(),
  targetType: reportTargetTypeSchema.optional(),
  assignedTo: z.string().optional(),
})

export type ReportFilterInput = z.infer<typeof reportFilterSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Moderation Queue Filter Schema
// ─────────────────────────────────────────────────────────────────────────────

export const queueFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: moderationStatusSchema.optional(),
  entityType: z.string().optional(),
  assignedTo: z.string().optional(),
})

export type QueueFilterInput = z.infer<typeof queueFilterSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Resolve Moderation Queue Item Schema
// ─────────────────────────────────────────────────────────────────────────────

export const moderationResolutionSchema = z.enum([
  'NO_ACTION',
  'WARNING_ISSUED',
  'CONTENT_REMOVED',
  'CONTENT_MODIFIED',
  'USER_WARNED',
  'USER_SUSPENDED',
  'USER_BANNED',
  'ESCALATED_TO_ADMIN',
])

export const resolveQueueItemSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  resolution: moderationResolutionSchema.optional(),
  resolutionNotes: z
    .string()
    .max(1000, 'Resolution notes must be at most 1000 characters')
    .optional(),
})

export type ResolveQueueItemInput = z.infer<typeof resolveQueueItemSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Bulk Operations Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const bulkIdsSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, 'At least one ID is required')
    .max(100, 'Maximum 100 items per bulk operation'),
})

export type BulkIdsInput = z.infer<typeof bulkIdsSchema>

export const bulkAssignSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, 'At least one ID is required')
    .max(100, 'Maximum 100 items per bulk operation'),
  moderatorId: z.string().optional(),
})

export type BulkAssignInput = z.infer<typeof bulkAssignSchema>

export const bulkResolveReportsSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, 'At least one ID is required')
    .max(100, 'Maximum 100 items per bulk operation'),
  status: z.enum(['RESOLVED', 'DISMISSED']),
  resolution: reportResolutionSchema.optional(),
  resolutionNotes: z
    .string()
    .max(1000, 'Resolution notes must be at most 1000 characters')
    .optional(),
  actionsTaken: z.array(z.string()).optional(),
})

export type BulkResolveReportsInput = z.infer<typeof bulkResolveReportsSchema>

export const bulkResolveQueueSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, 'At least one ID is required')
    .max(100, 'Maximum 100 items per bulk operation'),
  resolution: moderationResolutionSchema.optional(),
  resolutionNotes: z
    .string()
    .max(1000, 'Resolution notes must be at most 1000 characters')
    .optional(),
})

export type BulkResolveQueueInput = z.infer<typeof bulkResolveQueueSchema>
