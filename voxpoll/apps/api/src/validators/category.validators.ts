// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - CATEGORY VALIDATORS
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// List Categories Query
// ─────────────────────────────────────────────────────────────────────────────

export const listCategoriesSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  parentId: z.string().uuid().optional(),
  includeChildren: z.coerce.boolean().optional().default(false),
})

export type ListCategoriesQuery = z.infer<typeof listCategoriesSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Create Category
// ─────────────────────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
  iconName: z.string().max(50).optional(),
  color: z.string().max(7).regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  parentId: z.string().optional(),
  orderIndex: z.number().int().min(0).optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

// ─────────────────────────────────────────────────────────────────────────────
// Update Category
// ─────────────────────────────────────────────────────────────────────────────

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
  iconName: z.string().max(50).optional(),
  color: z.string().max(7).regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  parentId: z.string().nullable().optional(),
  orderIndex: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
