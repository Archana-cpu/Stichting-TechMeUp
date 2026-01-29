// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - NOTIFICATION VALIDATORS
// Zod validation schemas for notification endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Update Preferences Schema
// ─────────────────────────────────────────────────────────────────────────────

export const updateNotificationPreferencesSchema = z.object({
  globalEnabled: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
  quietHoursTimezone: z.string().max(50).optional(),
  quietHoursAllowUrgent: z.boolean().optional(),
  categoryPreferences: z.record(z.string(), z.boolean()).optional(),
  emailDigestEnabled: z.boolean().optional(),
  emailDigestFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
})

export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>

// ─────────────────────────────────────────────────────────────────────────────
// List Notifications Query Schema
// ─────────────────────────────────────────────────────────────────────────────

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  unread: z.enum(['true', 'false']).optional(),
})

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>
