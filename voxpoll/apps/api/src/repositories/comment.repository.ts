// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - COMMENT REPOSITORY
// Data access layer for comment operations
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  desc,
  asc,
  sql,
  isNull,
  discussions,
  comments,
  commentVotes,
  voiceAccessRequests,
  users,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import type { PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Discussion = InferSelectModel<typeof discussions>
export type Comment = InferSelectModel<typeof comments>
export type CommentVote = InferSelectModel<typeof commentVotes>
export type VoiceAccessRequest = InferSelectModel<typeof voiceAccessRequests>

export type CommentSortOption = 'best' | 'newest' | 'oldest' | 'controversial'

// ─────────────────────────────────────────────────────────────────────────────
// Comment Repository Class
// ─────────────────────────────────────────────────────────────────────────────

class CommentRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Get Discussion by Poll/Survey ID
  // ─────────────────────────────────────────────────────────────────────────────

  async findDiscussion(pollId?: string, surveyId?: string) {
    const conditions = []
    if (pollId) conditions.push(eq(discussions.pollId, pollId))
    if (surveyId) conditions.push(eq(discussions.surveyId, surveyId))

    if (conditions.length === 0) return null

    const result = await db
      .select()
      .from(discussions)
      .where(and(...conditions))
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Discussion by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async findDiscussionById(id: string) {
    const result = await db
      .select()
      .from(discussions)
      .where(eq(discussions.id, id))
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Discussion
  // ─────────────────────────────────────────────────────────────────────────────

  async createDiscussion(data: {
    pollId?: string
    surveyId?: string
    status?: string
    minParticipantsForOpen?: number
  }) {
    const result = await db
      .insert(discussions)
      .values({
        pollId: data.pollId,
        surveyId: data.surveyId,
        status: (data.status as 'OPEN' | 'CLOSED' | 'LOCKED' | 'ARCHIVED') || 'CLOSED',
        minParticipantsForOpen: data.minParticipantsForOpen,
      })
      .returning()

    return result[0]
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Find Comments
  // ─────────────────────────────────────────────────────────────────────────────

  async findMany(
    discussionId: string,
    page: number,
    limit: number,
    sort: CommentSortOption = 'best',
    parentId?: string | null
  ) {
    const skip = (page - 1) * limit

    const conditions = [
      eq(comments.discussionId, discussionId),
      isNull(comments.deletedAt),
      eq(comments.status, 'VISIBLE'),
    ]

    if (parentId === null) {
      conditions.push(isNull(comments.parentId))
    } else if (parentId !== undefined) {
      conditions.push(eq(comments.parentId, parentId))
    }

    const orderBy =
      sort === 'newest' ? desc(comments.createdAt) :
      sort === 'oldest' ? asc(comments.createdAt) :
      sort === 'controversial' ? desc(comments.controversyScore) :
      desc(comments.wilsonScore) // 'best'

    const [items, countResult] = await Promise.all([
      db
        .select({
          comment: comments,
          author: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(comments)
        .leftJoin(users, eq(comments.authorId, users.id))
        .where(and(...conditions))
        .orderBy(orderBy)
        .offset(skip)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(comments)
        .where(and(...conditions)),
    ])

    // Get reply counts
    const itemsWithCounts = await Promise.all(
      items.map(async (item) => {
        const replyCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(comments)
          .where(eq(comments.parentId, item.comment.id))

        return {
          ...item.comment,
          author: item.author,
          _count: {
            replies: replyCount[0]?.count ?? 0,
          },
        }
      })
    )

    const total = countResult[0]?.count ?? 0

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }

    return { items: itemsWithCounts, meta }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Find Comment by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async findById(id: string) {
    const result = await db
      .select({
        comment: comments,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.id, id))
      .limit(1)

    const item = result[0]
    if (!item) return null

    const discussionResult = await db
      .select()
      .from(discussions)
      .where(eq(discussions.id, item.comment.discussionId))
      .limit(1)

    const replyCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(comments)
      .where(eq(comments.parentId, id))

    return {
      ...item.comment,
      author: item.author,
      discussion: discussionResult[0] ?? null,
      _count: {
        replies: replyCount[0]?.count ?? 0,
      },
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Comment
  // ─────────────────────────────────────────────────────────────────────────────

  async create(data: {
    discussionId: string
    authorId: string
    content: string
    parentId?: string
    rootId?: string
    depth?: number
    testId?: string
  }) {
    const result = await db
      .insert(comments)
      .values({
        discussionId: data.discussionId,
        authorId: data.authorId,
        content: data.content,
        parentId: data.parentId,
        rootId: data.rootId || data.parentId,
        depth: data.depth || 0,
        testId: data.testId,
      })
      .returning()

    const comment = result[0]

    // Get author
    const authorResult = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, data.authorId))
      .limit(1)

    return {
      ...comment,
      author: authorResult[0] ?? null,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Comment
  // ─────────────────────────────────────────────────────────────────────────────

  async update(id: string, content: string, editHistory: object[]) {
    const result = await db
      .update(comments)
      .set({
        content,
        isEdited: true,
        editedAt: new Date(),
        editHistory,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Soft Delete Comment
  // ─────────────────────────────────────────────────────────────────────────────

  async softDelete(id: string) {
    const result = await db
      .update(comments)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Vote on Comment
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserVote(commentId: string, userId: string) {
    const result = await db
      .select()
      .from(commentVotes)
      .where(
        and(
          eq(commentVotes.commentId, commentId),
          eq(commentVotes.userId, userId)
        )
      )
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Upsert Vote
  // ─────────────────────────────────────────────────────────────────────────────

  async upsertVote(commentId: string, userId: string, value: number) {
    // Check if vote exists
    const existing = await db
      .select()
      .from(commentVotes)
      .where(
        and(
          eq(commentVotes.commentId, commentId),
          eq(commentVotes.userId, userId)
        )
      )
      .limit(1)

    const existingVote = existing[0]
    if (existingVote) {
      const result = await db
        .update(commentVotes)
        .set({ value, updatedAt: new Date() })
        .where(eq(commentVotes.id, existingVote.id))
        .returning()
      return result[0] ?? null
    }

    const result = await db
      .insert(commentVotes)
      .values({ commentId, userId, value })
      .returning()
    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete Vote
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteVote(commentId: string, userId: string) {
    await db
      .delete(commentVotes)
      .where(
        and(
          eq(commentVotes.commentId, commentId),
          eq(commentVotes.userId, userId)
        )
      )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Comment Votes
  // ─────────────────────────────────────────────────────────────────────────────

  async updateVotes(id: string, upvotes: number, downvotes: number) {
    const n = upvotes + downvotes
    // Wilson score calculation for ranking
    const p = n > 0 ? upvotes / n : 0
    const z = 1.96 // 95% confidence
    const wilsonScore = n > 0
      ? (p + z * z / (2 * n) - z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)) / (1 + z * z / n)
      : 0

    // Controversy score
    const controversyScore = n > 0 ? Math.min(upvotes, downvotes) / Math.max(upvotes, downvotes) * n : 0

    const result = await db
      .update(comments)
      .set({
        upvotes,
        downvotes,
        wilsonScore,
        controversyScore,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Increment Reply Count
  // ─────────────────────────────────────────────────────────────────────────────

  async incrementReplyCount(id: string) {
    const result = await db
      .update(comments)
      .set({
        replyCount: sql`${comments.replyCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Discussion Stats
  // ─────────────────────────────────────────────────────────────────────────────

  async updateDiscussionStats(discussionId: string) {
    const [totalCommentsResult, participantsResult] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(comments)
        .where(and(eq(comments.discussionId, discussionId), isNull(comments.deletedAt))),
      db
        .selectDistinct({ authorId: comments.authorId })
        .from(comments)
        .where(and(eq(comments.discussionId, discussionId), isNull(comments.deletedAt))),
    ])

    const totalComments = totalCommentsResult[0]?.count ?? 0
    const totalParticipants = participantsResult.length

    const result = await db
      .update(discussions)
      .set({
        totalComments,
        totalParticipants,
        updatedAt: new Date(),
      })
      .where(eq(discussions.id, discussionId))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Check Voice Access
  // ─────────────────────────────────────────────────────────────────────────────

  async hasVoiceAccess(discussionId: string, userId: string) {
    const result = await db
      .select()
      .from(voiceAccessRequests)
      .where(
        and(
          eq(voiceAccessRequests.discussionId, discussionId),
          eq(voiceAccessRequests.userId, userId)
        )
      )
      .limit(1)

    return result[0]?.status === 'APPROVED'
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Request Voice Access
  // ─────────────────────────────────────────────────────────────────────────────

  async requestVoiceAccess(discussionId: string, userId: string, reason: string) {
    // Check if exists
    const existing = await db
      .select()
      .from(voiceAccessRequests)
      .where(
        and(
          eq(voiceAccessRequests.discussionId, discussionId),
          eq(voiceAccessRequests.userId, userId)
        )
      )
      .limit(1)

    const existingRequest = existing[0]
    if (existingRequest) {
      const result = await db
        .update(voiceAccessRequests)
        .set({
          reason,
          status: 'PENDING',
          requestedAt: new Date(),
        })
        .where(eq(voiceAccessRequests.id, existingRequest.id))
        .returning()
      return result[0] ?? null
    }

    const result = await db
      .insert(voiceAccessRequests)
      .values({
        discussionId,
        userId,
        reason,
        status: 'PENDING',
      })
      .returning()
    return result[0] ?? null
  }
}

// Export singleton
export const commentRepository = new CommentRepositoryClass()

// Export class for testing
export { CommentRepositoryClass as CommentRepository }
