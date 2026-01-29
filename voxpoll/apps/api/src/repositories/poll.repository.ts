// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - POLL REPOSITORY
// Data access layer for poll operations
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, or, desc, asc, sql, isNull, ilike } from '@voxpoll/database'
import { polls, pollResponses, users, categories } from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import { buildPaginationMeta, type PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Poll = InferSelectModel<typeof polls>
export type PollResponse = InferSelectModel<typeof pollResponses>

type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'ARCHIVED'
type ContentVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'FOLLOWERS_ONLY' | 'ORGANIZATION_ONLY'

export interface PollOption {
  id: string
  text: string
  imageUrl?: string
  order: number
  voteCount: number
}

export interface CreatePollData {
  creatorId: string
  title: string
  description?: string
  slug: string
  type: string
  visibility: string
  options: PollOption[]
  categoryId?: string
  tags?: string[]
  endsAt?: Date
  allowMultipleVotes?: boolean
  maxVotesPerUser?: number
  showResultsBeforeVote?: boolean
  allowDiscussion?: boolean
}

export interface PollFilters {
  status?: ContentStatus
  visibility?: ContentVisibility
  creatorId?: string
  categoryId?: string
  tags?: string[]
  search?: string
}

export type PollSortOption = 'recent' | 'popular' | 'trending'

export interface UpdatePollData {
  title?: string
  description?: string
  status?: ContentStatus
  visibility?: ContentVisibility
  options?: PollOption[]
  categoryId?: string | null
  tags?: string[]
  endsAt?: Date | null
  allowMultipleVotes?: boolean
  maxVotesPerUser?: number
  showResultsBeforeVote?: boolean
  allowDiscussion?: boolean
  updatedAt?: Date
  publishedAt?: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// Poll Repository
// ─────────────────────────────────────────────────────────────────────────────

class PollRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Find By ID
  // ─────────────────────────────────────────────────────────────────────────────

  async findById(id: string) {
    const result = await db
      .select({
        poll: polls,
        creator: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          verificationLevel: users.verificationLevel,
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
      .where(eq(polls.id, id))
      .limit(1)

    if (!result[0]) return null

    const { poll, creator, category } = result[0]

    // Get response count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pollResponses)
      .where(eq(pollResponses.pollId, id))

    return {
      ...poll,
      creator,
      category,
      _count: {
        responses: countResult[0]?.count ?? 0,
      },
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Find By Slug
  // ─────────────────────────────────────────────────────────────────────────────

  async findBySlug(slug: string) {
    const result = await db
      .select({
        poll: polls,
        creator: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          verificationLevel: users.verificationLevel,
        },
        category: categories,
      })
      .from(polls)
      .leftJoin(users, eq(polls.creatorId, users.id))
      .leftJoin(categories, eq(polls.categoryId, categories.id))
      .where(eq(polls.slug, slug))
      .limit(1)

    if (!result[0]) return null

    const { poll, creator, category } = result[0]

    // Get response count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pollResponses)
      .where(eq(pollResponses.pollId, poll.id))

    return {
      ...poll,
      creator,
      category,
      _count: {
        responses: countResult[0]?.count ?? 0,
      },
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Find Many with Pagination
  // ─────────────────────────────────────────────────────────────────────────────

  async findMany(
    filters: PollFilters,
    page: number,
    limit: number,
    sort: PollSortOption = 'recent'
  ) {
    const offset = (page - 1) * limit

    // Build where conditions
    const conditions: ReturnType<typeof eq>[] = [isNull(polls.deletedAt)]

    if (filters.status) {
      conditions.push(eq(polls.status, filters.status))
    }
    if (filters.visibility) {
      conditions.push(eq(polls.visibility, filters.visibility))
    }
    if (filters.creatorId) {
      conditions.push(eq(polls.creatorId, filters.creatorId))
    }
    if (filters.categoryId) {
      conditions.push(eq(polls.categoryId, filters.categoryId))
    }

    // Build the base where clause
    let whereClause = and(...conditions)

    // Handle search with OR conditions
    if (filters.search) {
      const searchCondition = or(
        ilike(polls.title, `%${filters.search}%`),
        ilike(polls.description, `%${filters.search}%`)
      )
      whereClause = and(whereClause, searchCondition)
    }

    // Determine sort order
    const orderBy =
      sort === 'popular'
        ? desc(polls.participantCount)
        : sort === 'trending'
          ? desc(polls.hotScore)
          : desc(polls.createdAt)

    const [items, countResult] = await Promise.all([
      db
        .select({
          poll: polls,
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
        .where(whereClause)
        .orderBy(orderBy)
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(whereClause),
    ])

    // Get response counts for all polls
    const pollIds = items.map((item) => item.poll.id)
    const responseCounts =
      pollIds.length > 0
        ? await db
            .select({
              pollId: pollResponses.pollId,
              count: sql<number>`count(*)::int`,
            })
            .from(pollResponses)
            .where(sql`${pollResponses.pollId} = ANY(${pollIds})`)
            .groupBy(pollResponses.pollId)
        : []

    const responseCountMap = new Map(
      responseCounts.map((rc) => [rc.pollId, rc.count])
    )

    const formattedItems = items.map(({ poll, creator, category }) => ({
      ...poll,
      creator,
      category,
      _count: {
        responses: responseCountMap.get(poll.id) ?? 0,
      },
    }))

    return {
      items: formattedItems,
      meta: buildPaginationMeta(page, limit, countResult[0]?.count ?? 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Poll
  // ─────────────────────────────────────────────────────────────────────────────

  async create(data: CreatePollData) {
    const result = await db
      .insert(polls)
      .values({
        creatorId: data.creatorId,
        title: data.title,
        description: data.description,
        slug: data.slug,
        type: data.type as Poll['type'],
        visibility: data.visibility as Poll['visibility'],
        status: 'ACTIVE',
        options: data.options,
        categoryId: data.categoryId,
        tags: data.tags || [],
        endsAt: data.endsAt,
        allowMultipleVotes: data.allowMultipleVotes ?? false,
        maxVotesPerUser: data.maxVotesPerUser ?? 1,
        showResultsBeforeVote: data.showResultsBeforeVote ?? false,
        allowDiscussion: data.allowDiscussion ?? true,
        publishedAt: new Date(),
      })
      .returning()

    const poll = result[0]

    // Fetch creator details
    const creatorResult = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, data.creatorId))
      .limit(1)

    return {
      ...poll,
      creator: creatorResult[0] ?? null,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Poll
  // ─────────────────────────────────────────────────────────────────────────────

  async update(id: string, data: UpdatePollData) {
    const result = await db
      .update(polls)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(polls.id, id))
      .returning()

    const poll = result[0]

    if (!poll) return null

    // Fetch creator and category
    const [creatorResult, categoryResult] = await Promise.all([
      db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(eq(users.id, poll.creatorId))
        .limit(1),
      poll.categoryId
        ? db.select().from(categories).where(eq(categories.id, poll.categoryId)).limit(1)
        : Promise.resolve([]),
    ])

    return {
      ...poll,
      creator: creatorResult[0] ?? null,
      category: categoryResult[0] ?? null,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Soft Delete
  // ─────────────────────────────────────────────────────────────────────────────

  async softDelete(id: string) {
    const result = await db
      .update(polls)
      .set({
        status: 'ARCHIVED',
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(polls.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Check Response Exists
  // ─────────────────────────────────────────────────────────────────────────────

  async findResponse(pollId: string, participantHash: string) {
    const result = await db
      .select()
      .from(pollResponses)
      .where(
        and(
          eq(pollResponses.pollId, pollId),
          eq(pollResponses.participantHash, participantHash)
        )
      )
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Record Vote
  // ─────────────────────────────────────────────────────────────────────────────

  async recordVote(
    pollId: string,
    participantHash: string,
    optionId: string,
    updatedOptions: PollOption[]
  ) {
    const now = new Date()

    // Use a transaction to ensure atomicity
    return db.transaction(async (tx) => {
      const responseResult = await tx
        .insert(pollResponses)
        .values({
          pollId,
          participantHash,
          answers: { optionId },
          startedAt: now,
          completedAt: now,
          durationSeconds: 0,
        })
        .returning()

      const pollResult = await tx
        .update(polls)
        .set({
          options: updatedOptions,
          participantCount: sql`${polls.participantCount} + 1`,
          updatedAt: now,
        })
        .where(eq(polls.id, pollId))
        .returning()

      return [responseResult[0], pollResult[0]]
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Poll Results
  // ─────────────────────────────────────────────────────────────────────────────

  async getResults(pollId: string) {
    const result = await db
      .select({
        id: polls.id,
        title: polls.title,
        options: polls.options,
        participantCount: polls.participantCount,
        reliabilityScore: polls.reliabilityScore,
        reliabilityFactors: polls.reliabilityFactors,
      })
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1)

    const poll = result[0]

    if (!poll) return null

    const options = poll.options as unknown as PollOption[]
    const totalVotes = options.reduce((sum, opt) => sum + opt.voteCount, 0)

    return {
      pollId: poll.id,
      title: poll.title,
      participantCount: poll.participantCount,
      reliabilityScore: poll.reliabilityScore,
      reliabilityFactors: poll.reliabilityFactors,
      options: options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        voteCount: opt.voteCount,
        percentage: totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0,
      })),
      totalVotes,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Increment View Count
  // ─────────────────────────────────────────────────────────────────────────────

  async incrementViewCount(id: string) {
    const result = await db
      .update(polls)
      .set({
        viewCount: sql`${polls.viewCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(polls.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Polls
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserPolls(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit

    const whereClause = and(
      eq(polls.creatorId, userId),
      isNull(polls.deletedAt)
    )

    const [items, countResult] = await Promise.all([
      db
        .select({
          poll: polls,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(polls)
        .leftJoin(categories, eq(polls.categoryId, categories.id))
        .where(whereClause)
        .orderBy(desc(polls.createdAt))
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(whereClause),
    ])

    // Get response counts for all polls
    const pollIds = items.map((item) => item.poll.id)
    const responseCounts =
      pollIds.length > 0
        ? await db
            .select({
              pollId: pollResponses.pollId,
              count: sql<number>`count(*)::int`,
            })
            .from(pollResponses)
            .where(sql`${pollResponses.pollId} = ANY(${pollIds})`)
            .groupBy(pollResponses.pollId)
        : []

    const responseCountMap = new Map(
      responseCounts.map((rc) => [rc.pollId, rc.count])
    )

    const formattedItems = items.map(({ poll, category }) => ({
      ...poll,
      category,
      _count: {
        responses: responseCountMap.get(poll.id) ?? 0,
      },
    }))

    return {
      items: formattedItems,
      meta: buildPaginationMeta(page, limit, countResult[0]?.count ?? 0),
    }
  }
}

// Export singleton
export const pollRepository = new PollRepositoryClass()

// Export class for testing
export { PollRepositoryClass as PollRepository }
