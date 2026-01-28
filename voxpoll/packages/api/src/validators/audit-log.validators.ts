// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUDIT LOG VALIDATORS
// Zod schemas for audit log validation
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Filter Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const auditLogFilterSchema = z.object({
  actorId: z.string().optional(),
  actorType: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export const moderatorActionsFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────────────────────

export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>
export type ModeratorActionsFilterInput = z.infer<typeof moderatorActionsFilterSchema>
