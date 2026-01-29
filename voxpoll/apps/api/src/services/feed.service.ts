// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - FEED SERVICE
// Personalized and trending feed generation
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, or, sql, desc, inArray } from '@voxpoll/database'
import { polls, users, follows, categories } from '@voxpoll/database'
import { buildPaginationMeta } from '../repositories/base.repository'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Feed Service Class
// ─────────────────────────────────────────────────────────────────────────────

class FeedServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Get Personalized Feed
  // ─────────────────────────────────────────────────────────────────────────────

  async getPersonalizedFeed(
    userId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    categoryId?: string
  ) {
    const offset = (page - 1) * limit

    const followingIds = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(and(eq(follows.followerId, userId), eq(follows.status, 'ACTIVE')))

    const followingUserIds = followingIds.map((f) => f.followingId)

    const conditions = [
      eq(polls.visibility, 'PUBLIC'),
      eq(polls.status, 'ACTIVE'),
      sql`${polls.deletedAt} IS NULL`,
    ]

    if (categoryId) {
      conditions.push(eq(polls.categoryId, categoryId))
    }

    const [feedPolls, totalResult] = await Promise.all([
      db
        .select({
          poll: {
            id: polls.id,
            title: polls.title,
            slug: polls.slug,
            type: polls.type,
            status: polls.status,
            participantCount: polls.participantCount,
            hotScore: polls.hotScore,
            createdAt: polls.createdAt,
            endsAt: polls.endsAt,
          },
          creator: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(polls)
        .leftJoin(users, eq(polls.creatorId, users.id))
        .leftJoin(categories, eq(polls.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(
          sql`CASE WHEN ${polls.creatorId} = ANY(${followingUserIds.length > 0 ? followingUserIds : ['']}) THEN 0 ELSE 1 END`,
          desc(polls.hotScore),
          desc(polls.createdAt)
        )
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(and(...conditions)),
    ])

    return {
      items: feedPolls.map(({ poll, creator, category }) => ({
        ...poll,
        creator,
        category,
      })),
      meta: buildPaginationMeta(page, limit, totalResult[0]?.count ?? 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Trending Feed
  // ─────────────────────────────────────────────────────────────────────────────

  async getTrendingFeed(page: number = 1, limit: number = PAGINATION.defaultLimit, categoryId?: string) {
    const offset = (page - 1) * limit

    const conditions = [
      eq(polls.visibility, 'PUBLIC'),
      eq(polls.status, 'ACTIVE'),
      sql`${polls.deletedAt} IS NULL`,
    ]

    if (categoryId) {
      conditions.push(eq(polls.categoryId, categoryId))
    }

    const [feedPolls, totalResult] = await Promise.all([
      db
        .select({
          poll: {
            id: polls.id,
            title: polls.title,
            slug: polls.slug,
            type: polls.type,
            status: polls.status,
            participantCount: polls.participantCount,
            hotScore: polls.hotScore,
            createdAt: polls.createdAt,
            endsAt: polls.endsAt,
          },
          creator: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(polls)
        .leftJoin(users, eq(polls.creatorId, users.id))
        .leftJoin(categories, eq(polls.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(desc(polls.hotScore), desc(polls.participantCount))
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(and(...conditions)),
    ])

    return {
      items: feedPolls.map(({ poll, creator, category }) => ({
        ...poll,
        creator,
        category,
      })),
      meta: buildPaginationMeta(page, limit, totalResult[0]?.count ?? 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Discover Feed (New creators, not followed)
  // ─────────────────────────────────────────────────────────────────────────────

  async getDiscoverFeed(
    userId: string | null,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    categoryId?: string
  ) {
    const offset = (page - 1) * limit

    let excludeCreatorIds: string[] = []

    if (userId) {
      const followingIds = await db
        .select({ followingId: follows.followingId })
        .from(follows)
        .where(and(eq(follows.followerId, userId), eq(follows.status, 'ACTIVE')))

      excludeCreatorIds = followingIds.map((f) => f.followingId)
      excludeCreatorIds.push(userId)
    }

    const conditions = [
      eq(polls.visibility, 'PUBLIC'),
      eq(polls.status, 'ACTIVE'),
      sql`${polls.deletedAt} IS NULL`,
    ]

    if (categoryId) {
      conditions.push(eq(polls.categoryId, categoryId))
    }

    if (excludeCreatorIds.length > 0) {
      conditions.push(sql`${polls.creatorId} NOT IN (${sql.join(excludeCreatorIds.map(id => sql`${id}`), sql`, `)})`)
    }

    const [feedPolls, totalResult] = await Promise.all([
      db
        .select({
          poll: {
            id: polls.id,
            title: polls.title,
            slug: polls.slug,
            type: polls.type,
            status: polls.status,
            participantCount: polls.participantCount,
            hotScore: polls.hotScore,
            createdAt: polls.createdAt,
            endsAt: polls.endsAt,
          },
          creator: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(polls)
        .leftJoin(users, eq(polls.creatorId, users.id))
        .leftJoin(categories, eq(polls.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(desc(polls.hotScore), desc(polls.participantCount))
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(and(...conditions)),
    ])

    return {
      items: feedPolls.map(({ poll, creator, category }) => ({
        ...poll,
        creator,
        category,
      })),
      meta: buildPaginationMeta(page, limit, totalResult[0]?.count ?? 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Following Feed
  // ─────────────────────────────────────────────────────────────────────────────

  async getFollowingFeed(userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const offset = (page - 1) * limit

    const followingIds = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(and(eq(follows.followerId, userId), eq(follows.status, 'ACTIVE')))

    const followingUserIds = followingIds.map((f) => f.followingId)

    if (followingUserIds.length === 0) {
      return {
        items: [],
        meta: buildPaginationMeta(page, limit, 0),
      }
    }

    const conditions = [
      inArray(polls.creatorId, followingUserIds),
      eq(polls.visibility, 'PUBLIC'),
      eq(polls.status, 'ACTIVE'),
      sql`${polls.deletedAt} IS NULL`,
    ]

    const [feedPolls, totalResult] = await Promise.all([
      db
        .select({
          poll: {
            id: polls.id,
            title: polls.title,
            slug: polls.slug,
            type: polls.type,
            status: polls.status,
            participantCount: polls.participantCount,
            createdAt: polls.createdAt,
            endsAt: polls.endsAt,
          },
          creator: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(polls)
        .leftJoin(users, eq(polls.creatorId, users.id))
        .leftJoin(categories, eq(polls.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(desc(polls.createdAt))
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(and(...conditions)),
    ])

    return {
      items: feedPolls.map(({ poll, creator, category }) => ({
        ...poll,
        creator,
        category,
      })),
      meta: buildPaginationMeta(page, limit, totalResult[0]?.count ?? 0),
    }
  }
}

// Export singleton
export const feedService = new FeedServiceClass()

// Export class for testing
export { FeedServiceClass as FeedService }
