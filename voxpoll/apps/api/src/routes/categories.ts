// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - CATEGORY ROUTES
// Route definitions for poll categories
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth } from '../middleware/auth'
import { categoryController } from '../controllers/category.controller'
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesSchema,
} from '../validators/category.validators'
import type { AppEnv } from '../types'

export const categoryRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /categories - List all categories
categoryRoutes.get(
  '/',
  zValidator('query', listCategoriesSchema),
  (c) => categoryController.listCategories(c)
)

// GET /categories/:idOrSlug - Get single category
categoryRoutes.get(
  '/:idOrSlug',
  (c) => categoryController.getCategory(c)
)

// GET /categories/:idOrSlug/polls - Get polls in category
categoryRoutes.get(
  '/:idOrSlug/polls',
  (c) => categoryController.getCategoryPolls(c)
)

// GET /categories/:idOrSlug/trending - Get trending polls in category
categoryRoutes.get(
  '/:idOrSlug/trending',
  (c) => categoryController.getCategoryTrending(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /categories - Create category (admin only)
categoryRoutes.post(
  '/',
  auth,
  zValidator('json', createCategorySchema),
  (c) => categoryController.createCategory(c)
)

// PATCH /categories/:id - Update category (admin only)
categoryRoutes.patch(
  '/:id',
  auth,
  zValidator('json', updateCategorySchema),
  (c) => categoryController.updateCategory(c)
)

// DELETE /categories/:id - Delete category (admin only)
categoryRoutes.delete(
  '/:id',
  auth,
  (c) => categoryController.deleteCategory(c)
)
