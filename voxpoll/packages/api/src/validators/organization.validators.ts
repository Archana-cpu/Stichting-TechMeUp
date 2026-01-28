// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ORGANIZATION VALIDATORS
// Zod validation schemas for organization endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Enums (matching Drizzle schema)
// ─────────────────────────────────────────────────────────────────────────────

export const organizationTypeSchema = z.enum([
  'COMPANY',
  'EDUCATIONAL',
  'NONPROFIT',
  'GOVERNMENT',
  'MEDIA',
  'RESEARCH',
])

export const organizationRoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'MANAGER',
  'ANALYST',
  'CREATOR',
  'MEMBER',
])

// ─────────────────────────────────────────────────────────────────────────────
// Create Organization Schema
// ─────────────────────────────────────────────────────────────────────────────

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
  website: z.string().url('Invalid website URL').optional(),
  type: organizationTypeSchema,
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Update Organization Schema
// ─────────────────────────────────────────────────────────────────────────────

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .optional()
    .nullable(),
  logoUrl: z.string().url('Invalid logo URL').optional().nullable(),
  website: z.string().url('Invalid website URL').optional().nullable(),
  settings: z.record(z.unknown()).optional(),
})

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Invite Member Schema
// ─────────────────────────────────────────────────────────────────────────────

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: organizationRoleSchema.refine(
    (role) => role !== 'OWNER',
    { message: 'Cannot invite as owner' }
  ),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Update Member Role Schema
// ─────────────────────────────────────────────────────────────────────────────

export const updateMemberRoleSchema = z.object({
  role: organizationRoleSchema,
})

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Query Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const orgIdParamSchema = z.object({
  id: z.string().min(1, 'Organization ID is required'),
})

export const memberIdParamSchema = z.object({
  id: z.string().min(1, 'Organization ID is required'),
  userId: z.string().min(1, 'User ID is required'),
})

export const invitationTokenParamSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})
