// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - CATEGORY CONTROLLER
// HTTP request/response handling for categories
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { db, eq, and, or, isNull, sql, desc, asc } from '@voxpoll/database'
import { categories, polls, users } from '@voxpoll/database'
import type { AppEnv } from '../types'
import { ApiError } from '../middleware/error-handler'
import { PAGINATION } from '../constants/limits'
import type { CreateCategoryInput, UpdateCategoryInput, ListCategoriesQuery } from '../validators/category.validators'

// ─────────────────────────────────────────────────────────────────────────────
// Category Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class CategoryControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /categories - List all categories
  // ─────────────────────────────────────────────────────────────────────────────

  async listCategories(c: Context<AppEnv>) {
    // GET request - use query params, not JSON body
    const rawQuery = c.req.query()
    const query: Partial<ListCategoriesQuery> = {
      page: rawQuery['page'] ? parseInt(rawQuery['page'], 10) : undefined,
      limit: rawQuery['limit'] ? parseInt(rawQuery['limit'], 10) : undefined,
      parentId: rawQuery['parentId'] || undefined,
      includeChildren: rawQuery['includeChildren'] === 'true',
    }
    const page = query.page || 1
    const limit = Math.min(query.limit || PAGINATION.defaultLimit, PAGINATION.maxLimit)
    const skip = (page - 1) * limit

    // Build where conditions
    const whereConditions = [eq(categories.isActive, true)]
    if (query.parentId) {
      whereConditions.push(eq(categories.parentId, query.parentId))
    } else {
      whereConditions.push(isNull(categories.parentId))
    }

    const whereClause = and(...whereConditions)

    // Get categories and total count in parallel
    const [categoriesResult, countResult] = await Promise.all([
      db.select()
        .from(categories)
        .where(whereClause)
        .orderBy(asc(categories.orderIndex), asc(categories.name))
        .offset(skip)
        .limit(limit),
      db.select({ count: sql<number>`count(*)::int` })
        .from(categories)
        .where(whereClause),
    ])

    const total = countResult[0]?.count ?? 0

    // Get poll counts for all categories
    const categoryIds = categoriesResult.map((cat) => cat.id)
    const pollCounts = categoryIds.length > 0
      ? await db
          .select({
            categoryId: polls.categoryId,
            count: sql<number>`count(*)::int`,
          })
          .from(polls)
          .where(sql`${polls.categoryId} = ANY(${categoryIds})`)
          .groupBy(polls.categoryId)
      : []

    const pollCountMap = new Map(
      pollCounts.map((pc) => [pc.categoryId, pc.count])
    )

    // Get children if requested
    let childrenMap = new Map<string, typeof categoriesResult>()
    if (query.includeChildren && categoryIds.length > 0) {
      const childrenResult = await db.select()
        .from(categories)
        .where(and(
          eq(categories.isActive, true),
          sql`${categories.parentId} = ANY(${categoryIds})`
        ))
        .orderBy(asc(categories.orderIndex), asc(categories.name))

      for (const child of childrenResult) {
        if (child.parentId) {
          const existing = childrenMap.get(child.parentId) || []
          existing.push(child)
          childrenMap.set(child.parentId, existing)
        }
      }
    }

    return c.json({
      success: true,
      data: {
        items: categoriesResult.map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          slug: cat.slug,
          iconName: cat.iconName,
          color: cat.color,
          parentId: cat.parentId,
          pollCount: pollCountMap.get(cat.id) ?? 0,
          children: query.includeChildren ? childrenMap.get(cat.id) : undefined,
        })),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /categories/:idOrSlug - Get single category
  // ─────────────────────────────────────────────────────────────────────────────

  async getCategory(c: Context<AppEnv>) {
    const idOrSlug = c.req.param('idOrSlug')

    // Find category by id or slug
    const categoryResult = await db.select()
      .from(categories)
      .where(and(
        or(
          eq(categories.id, idOrSlug),
          eq(categories.slug, idOrSlug)
        ),
        eq(categories.isActive, true)
      ))
      .limit(1)

    const category = categoryResult[0]

    if (!category) {
      throw ApiError.notFound('Category not found', 'CATEGORY_NOT_FOUND')
    }

    // Get parent if exists
    const parent = category.parentId
      ? await db.select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .where(eq(categories.id, category.parentId))
        .limit(1)
        .then(res => res[0] ?? null)
      : null

    // Get children
    const children = await db.select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      iconName: categories.iconName,
      color: categories.color,
    })
    .from(categories)
    .where(and(
      eq(categories.isActive, true),
      eq(categories.parentId, category.id)
    ))
    .orderBy(asc(categories.orderIndex), asc(categories.name))

    // Get poll count
    const pollCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(polls)
      .where(eq(polls.categoryId, category.id))

    return c.json({
      success: true,
      data: {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        iconName: category.iconName,
        color: category.color,
        parent,
        children,
        pollCount: pollCountResult[0]?.count ?? 0,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /categories/:idOrSlug/polls - Get polls in category
  // ─────────────────────────────────────────────────────────────────────────────

  async getCategoryPolls(c: Context<AppEnv>) {
    const idOrSlug = c.req.param('idOrSlug')
    const query = c.req.query()
    const page = parseInt(query['page'] || '1', 10)
    const limit = Math.min(parseInt(query['limit'] || '20', 10), PAGINATION.maxLimit)
    const skip = (page - 1) * limit
    const sort = query['sort'] || 'recent' // recent, trending, popular

    // Find category first
    const categoryResult = await db.select()
      .from(categories)
      .where(and(
        or(eq(categories.id, idOrSlug), eq(categories.slug, idOrSlug)),
        eq(categories.isActive, true)
      ))
      .limit(1)

    const category = categoryResult[0]

    if (!category) {
      throw ApiError.notFound('Category not found', 'CATEGORY_NOT_FOUND')
    }

    // Determine sort order
    const orderBy = sort === 'trending'
      ? desc(polls.hotScore)
      : sort === 'popular'
        ? desc(polls.participantCount)
        : desc(polls.createdAt)

    const whereClause = and(
      eq(polls.categoryId, category.id),
      eq(polls.status, 'ACTIVE'),
      eq(polls.visibility, 'PUBLIC'),
      isNull(polls.deletedAt)
    )

    const [pollsResult, countResult] = await Promise.all([
      db.select({
        id: polls.id,
        title: polls.title,
        slug: polls.slug,
        type: polls.type,
        participantCount: polls.participantCount,
        hotScore: polls.hotScore,
        createdAt: polls.createdAt,
        endsAt: polls.endsAt,
        creatorId: polls.creatorId,
      })
      .from(polls)
      .where(whereClause)
      .orderBy(orderBy)
      .offset(skip)
      .limit(limit),
      db.select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(whereClause),
    ])

    const total = countResult[0]?.count ?? 0

    // Get creator info for all polls
    const creatorIds = [...new Set(pollsResult.map(p => p.creatorId))]
    const creatorsResult = creatorIds.length > 0
      ? await db.select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(sql`${users.id} = ANY(${creatorIds})`)
      : []

    const creatorMap = new Map(creatorsResult.map(c => [c.id, c]))

    const pollsWithCreators = pollsResult.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      type: p.type,
      participantCount: p.participantCount,
      hotScore: p.hotScore,
      createdAt: p.createdAt,
      endsAt: p.endsAt,
      creator: creatorMap.get(p.creatorId) ?? null,
    }))

    return c.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        items: pollsWithCreators,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
          sort,
        },
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /categories/:idOrSlug/trending - Get trending polls in category
  // ─────────────────────────────────────────────────────────────────────────────

  async getCategoryTrending(c: Context<AppEnv>) {
    const idOrSlug = c.req.param('idOrSlug')
    const query = c.req.query()
    const limit = Math.min(parseInt(query['limit'] || '10', 10), 50)

    // Find category first
    const categoryResult = await db.select()
      .from(categories)
      .where(and(
        or(eq(categories.id, idOrSlug), eq(categories.slug, idOrSlug)),
        eq(categories.isActive, true)
      ))
      .limit(1)

    const category = categoryResult[0]

    if (!category) {
      throw ApiError.notFound('Category not found', 'CATEGORY_NOT_FOUND')
    }

    const trendingPolls = await db.select({
      id: polls.id,
      title: polls.title,
      slug: polls.slug,
      type: polls.type,
      participantCount: polls.participantCount,
      hotScore: polls.hotScore,
      createdAt: polls.createdAt,
      endsAt: polls.endsAt,
      creatorId: polls.creatorId,
    })
    .from(polls)
    .where(and(
      eq(polls.categoryId, category.id),
      eq(polls.status, 'ACTIVE'),
      eq(polls.visibility, 'PUBLIC'),
      isNull(polls.deletedAt)
    ))
    .orderBy(desc(polls.hotScore))
    .limit(limit)

    // Get creator info for all polls
    const creatorIds = [...new Set(trendingPolls.map(p => p.creatorId))]
    const creatorsResult = creatorIds.length > 0
      ? await db.select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(sql`${users.id} = ANY(${creatorIds})`)
      : []

    const creatorMap = new Map(creatorsResult.map(c => [c.id, c]))

    const pollsWithCreators = trendingPolls.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      type: p.type,
      participantCount: p.participantCount,
      hotScore: p.hotScore,
      createdAt: p.createdAt,
      endsAt: p.endsAt,
      creator: creatorMap.get(p.creatorId) ?? null,
    }))

    return c.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        items: pollsWithCreators,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /categories - Create category (admin only)
  // ─────────────────────────────────────────────────────────────────────────────

  async createCategory(c: Context<AppEnv>) {
    const user = c.get('user')!

    // Check if admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Admin access required', 'ADMIN_REQUIRED')
    }

    const body = await c.req.json() as CreateCategoryInput

    // Generate slug if not provided
    const slug = body.slug || body.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100)

    // Check slug uniqueness
    const existingResult = await db.select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1)

    if (existingResult[0]) {
      throw ApiError.conflict('Category slug already exists', 'SLUG_EXISTS')
    }

    const [category] = await db.insert(categories)
      .values({
        name: body.name,
        description: body.description,
        slug,
        iconName: body.iconName,
        color: body.color,
        parentId: body.parentId,
        orderIndex: body.orderIndex ?? 0,
      })
      .returning()

    return c.json({
      success: true,
      data: {
        id: category!.id,
        name: category!.name,
        slug: category!.slug,
        message: 'Category created successfully',
      },
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /categories/:id - Update category (admin only)
  // ─────────────────────────────────────────────────────────────────────────────

  async updateCategory(c: Context<AppEnv>) {
    const user = c.get('user')!

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Admin access required', 'ADMIN_REQUIRED')
    }

    const id = c.req.param('id')
    const body = await c.req.json() as UpdateCategoryInput

    // Check category exists
    const existingResult = await db.select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)

    const existing = existingResult[0]

    if (!existing) {
      throw ApiError.notFound('Category not found', 'CATEGORY_NOT_FOUND')
    }

    // Check slug uniqueness if changing
    if (body.slug && body.slug !== existing.slug) {
      const slugExistsResult = await db.select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, body.slug))
        .limit(1)

      if (slugExistsResult[0]) {
        throw ApiError.conflict('Category slug already exists', 'SLUG_EXISTS')
      }
    }

    const [category] = await db.update(categories)
      .set({
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.slug && { slug: body.slug }),
        ...(body.iconName !== undefined && { iconName: body.iconName }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.parentId !== undefined && { parentId: body.parentId }),
        ...(body.orderIndex !== undefined && { orderIndex: body.orderIndex }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning()

    return c.json({
      success: true,
      data: {
        id: category!.id,
        name: category!.name,
        slug: category!.slug,
        message: 'Category updated successfully',
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /categories/:id - Delete category (admin only)
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteCategory(c: Context<AppEnv>) {
    const user = c.get('user')!

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Admin access required', 'ADMIN_REQUIRED')
    }

    const id = c.req.param('id')

    // Check category exists
    const existingResult = await db.select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)

    const existing = existingResult[0]

    if (!existing) {
      throw ApiError.notFound('Category not found', 'CATEGORY_NOT_FOUND')
    }

    // Count children and polls
    const [childrenCountResult, pollsCountResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(categories)
        .where(eq(categories.parentId, id)),
      db.select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(eq(polls.categoryId, id)),
    ])

    const childrenCount = childrenCountResult[0]?.count ?? 0
    const pollsCount = pollsCountResult[0]?.count ?? 0

    // Don't delete if has children or polls
    if (childrenCount > 0) {
      throw ApiError.badRequest('Cannot delete category with subcategories', 'HAS_CHILDREN')
    }

    if (pollsCount > 0) {
      throw ApiError.badRequest('Cannot delete category with polls. Move polls first.', 'HAS_POLLS')
    }

    await db.delete(categories).where(eq(categories.id, id))

    return c.json({
      success: true,
      data: { message: 'Category deleted successfully' },
    })
  }
}

// Export singleton
export const categoryController = new CategoryControllerClass()

// Export class for testing
export { CategoryControllerClass as CategoryController }
