// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - POLL SERVICE
// Business logic for poll operations
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, sql, desc, isNull } from '@voxpoll/database'
import { polls, pollResponses, discussions, comments, users } from '@voxpoll/database'
import { pollRepository, type PollOption, type PollFilters, type PollSortOption } from '../repositories/poll.repository'
import { cacheService } from './cache.service'
import { algorithmService } from './algorithm.service'
import { fraudService } from './fraud.service'
import { ApiError } from '../middleware/error-handler'
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { PAGINATION } from '../constants/limits'
import { generateParticipantHash } from '../lib/hash'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreatePollInput {
  title: string
  description?: string
  type?: string
  visibility?: string
  options: Array<{
    text: string
    imageUrl?: string
  }>
  categoryId?: string
  tags?: string[]
  endsAt?: string
  allowMultipleVotes?: boolean
  maxVotesPerUser?: number
  showResultsBeforeVote?: boolean
  allowDiscussion?: boolean
}

export interface UpdatePollInput {
  title?: string
  description?: string
  visibility?: string
  tags?: string[]
  endsAt?: string
  allowDiscussion?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 200)
  const random = Math.random().toString(36).substring(2, 8)
  return `${base}-${random}`
}

function generateOptionId(): string {
  return `opt_${Math.random().toString(36).substring(2, 10)}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Poll Service Class
// ─────────────────────────────────────────────────────────────────────────────

class PollServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // List Polls
  // ─────────────────────────────────────────────────────────────────────────────

  async listPolls(
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    sort: PollSortOption = 'recent',
    filters: PollFilters = {}
  ) {
    // Default to showing only public active polls
    const defaultFilters: PollFilters = {
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      ...filters,
    }

    const result = await pollRepository.findMany(defaultFilters, page, limit, sort)

    return {
      items: result.items.map((poll) => this.formatPollListItem(poll)),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Poll
  // ─────────────────────────────────────────────────────────────────────────────

  async getPoll(id: string, currentUserId?: string) {
    // Try cache first
    const cacheKey = `poll:${id}`
    const cached = await cacheService.get<ReturnType<typeof pollRepository.findById>>(cacheKey)

    let poll = cached
    if (!poll) {
      poll = await pollRepository.findById(id)
      if (poll) {
        await cacheService.set(cacheKey, poll, 300) // 5 min cache
      }
    }

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    // Check visibility
    if (poll.visibility === 'PRIVATE' && poll.creatorId !== currentUserId) {
      throw ApiError.forbidden('This poll is private', 'POLL_PRIVATE')
    }

    // Increment view count (fire and forget)
    pollRepository.incrementViewCount(id).catch(() => {})

    // Check if user has voted
    let hasVoted = false
    let userAnswer: string | null = null

    if (currentUserId) {
      const participantHash = generateParticipantHash(currentUserId, id)
      const response = await pollRepository.findResponse(id, participantHash)
      if (response) {
        hasVoted = true
        userAnswer = (response.answers as { optionId?: string })?.optionId || null
      }
    }

    return this.formatPollDetail(poll, hasVoted, userAnswer)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Poll By Slug
  // ─────────────────────────────────────────────────────────────────────────────

  async getPollBySlug(slug: string, currentUserId?: string) {
    const poll = await pollRepository.findBySlug(slug)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    // Delegate to getPoll for consistent handling
    return this.getPoll(poll.id, currentUserId)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Poll
  // ─────────────────────────────────────────────────────────────────────────────

  async createPoll(creatorId: string, input: CreatePollInput) {
    // Build options with IDs
    const options: PollOption[] = input.options.map((opt, index) => ({
      id: generateOptionId(),
      text: opt.text,
      imageUrl: opt.imageUrl,
      order: index,
      voteCount: 0,
    }))

    const poll = await pollRepository.create({
      creatorId,
      title: input.title,
      description: input.description,
      slug: generateSlug(input.title),
      type: input.type || 'STANDARD',
      visibility: input.visibility || 'PUBLIC',
      options,
      categoryId: input.categoryId,
      tags: input.tags,
      endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
      allowMultipleVotes: input.allowMultipleVotes,
      maxVotesPerUser: input.maxVotesPerUser,
      showResultsBeforeVote: input.showResultsBeforeVote,
      allowDiscussion: input.allowDiscussion,
    })

    return {
      id: poll.id,
      title: poll.title,
      slug: poll.slug,
      options: poll.options,
      creator: poll.creator,
      createdAt: poll.createdAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Poll
  // ─────────────────────────────────────────────────────────────────────────────

  async updatePoll(pollId: string, userId: string, input: UpdatePollInput) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('You can only update your own polls', 'NOT_POLL_OWNER')
    }

    // P-106: Polls CANNOT be edited after publishing
    if (poll.status !== 'DRAFT') {
      throw ApiError.badRequest('Cannot edit poll after publishing', 'POLL_LOCKED')
    }

    const updatedPoll = await pollRepository.update(pollId, {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.visibility && { visibility: input.visibility as never }),
      ...(input.tags && { tags: input.tags }),
      ...(input.endsAt && { endsAt: new Date(input.endsAt) }),
      ...(input.allowDiscussion !== undefined && { allowDiscussion: input.allowDiscussion }),
    })

    if (!updatedPoll) {
      throw ApiError.internal('Failed to update poll', 'POLL_UPDATE_FAILED')
    }

    // Invalidate cache
    await cacheService.del(`poll:${pollId}`)

    return {
      id: updatedPoll.id,
      title: updatedPoll.title,
      slug: updatedPoll.slug,
      message: SUCCESS_MESSAGES.POLL_UPDATED,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete Poll
  // ─────────────────────────────────────────────────────────────────────────────

  async deletePoll(pollId: string, userId: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('You can only delete your own polls', 'NOT_POLL_OWNER')
    }

    await pollRepository.softDelete(pollId)

    // Invalidate cache
    await cacheService.del(`poll:${pollId}`)

    return { message: SUCCESS_MESSAGES.POLL_DELETED }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Vote on Poll
  // ─────────────────────────────────────────────────────────────────────────────

  async vote(
    pollId: string,
    userId: string,
    optionId: string,
    clientInfo?: { ip?: string; userAgent?: string; deviceFingerprint?: string }
  ) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (poll.status !== 'ACTIVE') {
      throw ApiError.badRequest(ERROR_MESSAGES.POLL_CLOSED, ERROR_CODES.POLL_CLOSED)
    }

    if (poll.endsAt && poll.endsAt < new Date()) {
      throw ApiError.badRequest(ERROR_MESSAGES.POLL_CLOSED, ERROR_CODES.POLL_CLOSED)
    }

    // Verify option exists
    const options = poll.options as unknown as PollOption[]
    const option = options.find((o) => o.id === optionId)
    if (!option) {
      throw ApiError.badRequest(ERROR_MESSAGES.INVALID_OPTION, ERROR_CODES.INVALID_OPTION)
    }

    // Phase 1: Pre-action fraud check
    const fraudCheck = await fraudService.preActionCheck(userId, 'VOTE', {
      ip: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
      deviceFingerprint: clientInfo?.deviceFingerprint,
      contentId: pollId,
      contentType: 'POLL',
    })

    if (fraudCheck.decision === 'HARD_REJECT') {
      throw ApiError.forbidden(
        'This action has been blocked for security reasons.',
        'FRAUD_DETECTED'
      )
    }

    if (fraudCheck.decision === 'SOFT_REJECT') {
      throw ApiError.badRequest(
        'Please verify you are human and try again.',
        'VERIFICATION_REQUIRED'
      )
    }

    // Generate participant hash for privacy
    const participantHash = generateParticipantHash(userId, pollId)

    // Check if already voted
    const existingResponse = await pollRepository.findResponse(pollId, participantHash)
    if (existingResponse) {
      throw ApiError.conflict(ERROR_MESSAGES.ALREADY_VOTED, ERROR_CODES.ALREADY_VOTED)
    }

    // Update option vote count
    const updatedOptions = options.map((o) =>
      o.id === optionId ? { ...o, voteCount: o.voteCount + 1 } : o
    )

    // Record vote
    const [responseRecord] = await pollRepository.recordVote(pollId, participantHash, optionId, updatedOptions)

    // Invalidate cache
    await cacheService.del(`poll:${pollId}`)

    // Update hot score asynchronously (non-blocking)
    algorithmService.updatePollHotScore(pollId).catch((err) => {
      console.error(`[PollService] Failed to update hot score for poll ${pollId}:`, err)
    })

    // Phase 2: Post-action fraud analysis (asynchronous, non-blocking)
    if (responseRecord?.id && (fraudCheck.requiresManualReview || clientInfo)) {
      fraudService.postActionAnalysis(responseRecord.id, 'POLL_RESPONSE', {
        ip: clientInfo?.ip,
        deviceFingerprint: clientInfo?.deviceFingerprint,
        contentId: pollId,
        contentType: 'POLL',
      }).catch((err) => {
        console.error(`[PollService] Failed to run fraud analysis for response ${responseRecord.id}:`, err)
      })
    }

    return { message: SUCCESS_MESSAGES.VOTE_RECORDED }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Poll Results
  // ─────────────────────────────────────────────────────────────────────────────

  async getResults(pollId: string, currentUserId?: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    // Check visibility
    if (poll.visibility === 'PRIVATE' && poll.creatorId !== currentUserId) {
      throw ApiError.forbidden('This poll is private', 'POLL_PRIVATE')
    }

    // Check if user has voted (for result visibility)
    let hasVoted = false
    if (currentUserId) {
      const participantHash = generateParticipantHash(currentUserId, pollId)
      const response = await pollRepository.findResponse(pollId, participantHash)
      hasVoted = !!response
    }

    // Check result visibility settings
    if (!poll.showResultsBeforeVote && !hasVoted && poll.creatorId !== currentUserId) {
      throw ApiError.forbidden('Vote to see results', 'MUST_VOTE_FIRST')
    }

    return pollRepository.getResults(pollId)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User's Polls
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserPolls(userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const result = await pollRepository.getUserPolls(userId, page, limit)

    return {
      items: result.items.map((poll) => ({
        id: poll.id,
        title: poll.title,
        slug: poll.slug,
        type: poll.type,
        status: poll.status,
        visibility: poll.visibility,
        participantCount: poll.participantCount,
        responseCount: poll._count.responses,
        createdAt: poll.createdAt,
        endsAt: poll.endsAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Poll Analytics (Creator Only)
  // ─────────────────────────────────────────────────────────────────────────────

  async getAnalytics(pollId: string, userId: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('Only poll creator can view analytics', 'NOT_POLL_OWNER')
    }

    const options = poll.options as unknown as PollOption[]
    const totalVotes = options.reduce((sum, opt) => sum + opt.voteCount, 0)

    // Get response timeline (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Note: For daily grouping, we need raw SQL
    const dailyResponses = await db
      .select({
        date: sql<Date>`DATE(${pollResponses.completedAt})`.as('date'),
        count: sql<number>`count(*)::int`.as('count'),
      })
      .from(pollResponses)
      .where(
        and(
          eq(pollResponses.pollId, pollId),
          sql`${pollResponses.completedAt} >= ${sevenDaysAgo}`
        )
      )
      .groupBy(sql`DATE(${pollResponses.completedAt})`)
      .orderBy(sql`DATE(${pollResponses.completedAt})`)

    const timeline = dailyResponses.map((d) => ({
      date: d.date,
      count: d.count,
    }))

    // Get statistical analysis from algorithm service
    const statistics = await algorithmService.getPollStatistics(pollId)

    // Calculate reliability score if not already computed
    let reliabilityScore = poll.reliabilityScore
    if (!reliabilityScore || reliabilityScore === 0) {
      const reliability = await algorithmService.calculateReliabilityScore(pollId)
      reliabilityScore = reliability.overallScore
    }

    return {
      pollId: poll.id,
      title: poll.title,
      totalVotes,
      participantCount: poll.participantCount,
      viewCount: poll.viewCount,
      shareCount: poll.shareCount,
      reliabilityScore,
      reliabilityFactors: poll.reliabilityFactors as Record<string, unknown>,
      options: options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        voteCount: opt.voteCount,
        percentage: totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0,
      })),
      timeline,
      statistics,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Retract Vote
  // ─────────────────────────────────────────────────────────────────────────────

  async retractVote(pollId: string, userId: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (poll.status !== 'ACTIVE') {
      throw ApiError.badRequest(ERROR_MESSAGES.POLL_CLOSED, ERROR_CODES.POLL_CLOSED)
    }

    const participantHash = generateParticipantHash(userId, pollId)
    const existingResponse = await pollRepository.findResponse(pollId, participantHash)

    if (!existingResponse) {
      throw ApiError.notFound('You have not voted on this poll', 'NOT_VOTED')
    }

    // Get the voted option ID
    const votedOptionId = (existingResponse.answers as { optionId?: string })?.optionId

    // Update option vote count
    const options = poll.options as unknown as PollOption[]
    const updatedOptions = options.map((o) =>
      o.id === votedOptionId ? { ...o, voteCount: Math.max(0, o.voteCount - 1) } : o
    )

    // Delete response and update poll
    await db.transaction(async (tx) => {
      await tx.delete(pollResponses).where(eq(pollResponses.id, existingResponse.id))
      await tx
        .update(polls)
        .set({
          options: updatedOptions,
          participantCount: sql`${polls.participantCount} - 1`,
        })
        .where(eq(polls.id, pollId))
    })

    // Invalidate cache
    await cacheService.del(`poll:${pollId}`)

    return { message: 'Vote retracted successfully' }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Vote
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserVote(pollId: string, userId: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    const participantHash = generateParticipantHash(userId, pollId)
    const response = await pollRepository.findResponse(pollId, participantHash)

    if (!response) {
      return { hasVoted: false, optionId: null, votedAt: null }
    }

    return {
      hasVoted: true,
      optionId: (response.answers as { optionId?: string })?.optionId || null,
      votedAt: response.completedAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Publish Poll
  // ─────────────────────────────────────────────────────────────────────────────

  async publishPoll(pollId: string, userId: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('Only poll creator can publish', 'NOT_POLL_OWNER')
    }

    if (poll.status !== 'DRAFT') {
      throw ApiError.badRequest('Only draft polls can be published', 'POLL_NOT_DRAFT')
    }

    await pollRepository.update(pollId, {
      status: 'ACTIVE' as never,
      publishedAt: new Date(),
    })

    await cacheService.del(`poll:${pollId}`)

    return { message: 'Poll published successfully' }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Close Poll
  // ─────────────────────────────────────────────────────────────────────────────

  async closePoll(pollId: string, userId: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('Only poll creator can close', 'NOT_POLL_OWNER')
    }

    if (poll.status === 'ENDED') {
      throw ApiError.badRequest('Poll is already ended', 'POLL_ALREADY_ENDED')
    }

    await pollRepository.update(pollId, {
      status: 'ENDED' as never,
    })

    await cacheService.del(`poll:${pollId}`)

    return { message: 'Poll ended successfully' }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Archive Poll
  // ─────────────────────────────────────────────────────────────────────────────

  async archivePoll(pollId: string, userId: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('Only poll creator can archive', 'NOT_POLL_OWNER')
    }

    await pollRepository.update(pollId, {
      status: 'ARCHIVED' as never,
    })

    await cacheService.del(`poll:${pollId}`)

    return { message: 'Poll archived successfully' }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Unarchive Poll
  // ─────────────────────────────────────────────────────────────────────────────

  async unarchivePoll(pollId: string, userId: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('Only poll creator can unarchive', 'NOT_POLL_OWNER')
    }

    if (poll.status !== 'ARCHIVED') {
      throw ApiError.badRequest('Poll is not archived', 'POLL_NOT_ARCHIVED')
    }

    await pollRepository.update(pollId, {
      status: 'ENDED' as never,
    })

    await cacheService.del(`poll:${pollId}`)

    return { message: 'Poll unarchived successfully' }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Generate Share Link
  // ─────────────────────────────────────────────────────────────────────────────

  async generateShareLink(pollId: string, userId: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('Only poll creator can generate share link', 'NOT_POLL_OWNER')
    }

    // Increment share count
    await db
      .update(polls)
      .set({ shareCount: sql`${polls.shareCount} + 1` })
      .where(eq(polls.id, pollId))

    const baseUrl = process.env['FRONTEND_URL'] || 'http://localhost:3000'
    return {
      pollId: poll.id,
      slug: poll.slug,
      shareUrl: `${baseUrl}/poll/${poll.slug}`,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Poll By Share Code
  // ─────────────────────────────────────────────────────────────────────────────

  // Note: Poll uses slug for sharing, not a separate share code
  async getPollByShareCode(slug: string, currentUserId?: string) {
    return this.getPollBySlug(slug, currentUserId)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Comments
  // ─────────────────────────────────────────────────────────────────────────────

  async getComments(pollId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (!poll.allowDiscussion) {
      throw ApiError.forbidden('Comments are disabled for this poll', 'COMMENTS_DISABLED')
    }

    // Find the discussion for this poll
    const discussionResult = await db
      .select()
      .from(discussions)
      .where(eq(discussions.pollId, pollId))
      .limit(1)

    const discussion = discussionResult[0]

    if (!discussion) {
      return {
        items: [],
        meta: { page, limit, total: 0, totalPages: 0, hasMore: false },
      }
    }

    const offset = (page - 1) * limit

    const [commentsResult, totalResult] = await Promise.all([
      db
        .select({
          id: comments.id,
          content: comments.content,
          replyCount: comments.replyCount,
          upvotes: comments.upvotes,
          downvotes: comments.downvotes,
          createdAt: comments.createdAt,
          authorId: users.id,
          authorUsername: users.username,
          authorDisplayName: users.displayName,
          authorAvatarUrl: users.avatarUrl,
        })
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .where(
          and(
            eq(comments.discussionId, discussion.id),
            isNull(comments.parentId),
            eq(comments.status, 'VISIBLE')
          )
        )
        .orderBy(desc(comments.createdAt))
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(comments)
        .where(
          and(
            eq(comments.discussionId, discussion.id),
            isNull(comments.parentId),
            eq(comments.status, 'VISIBLE')
          )
        ),
    ])

    const total = totalResult[0]?.count ?? 0

    return {
      items: commentsResult.map((c) => ({
        id: c.id,
        content: c.content,
        author: {
          id: c.authorId,
          username: c.authorUsername,
          displayName: c.authorDisplayName,
          avatarUrl: c.authorAvatarUrl,
        },
        replyCount: c.replyCount,
        upvotes: c.upvotes,
        downvotes: c.downvotes,
        createdAt: c.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Add Comment
  // ─────────────────────────────────────────────────────────────────────────────

  async addComment(pollId: string, userId: string, content: string, parentId?: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll || poll.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.POLL_NOT_FOUND, ERROR_CODES.POLL_NOT_FOUND)
    }

    if (!poll.allowDiscussion) {
      throw ApiError.forbidden('Comments are disabled for this poll', 'COMMENTS_DISABLED')
    }

    // Find or create discussion for this poll
    let discussionResult = await db
      .select()
      .from(discussions)
      .where(eq(discussions.pollId, pollId))
      .limit(1)

    let discussion = discussionResult[0]

    if (!discussion) {
      const newDiscussion = await db
        .insert(discussions)
        .values({
          pollId,
          status: 'OPEN',
        })
        .returning()
      discussion = newDiscussion[0]
      if (!discussion) {
        throw ApiError.internal('Failed to create discussion', 'DISCUSSION_CREATE_FAILED')
      }
    }

    // Calculate depth and rootId for nested comments
    let depth = 0
    let rootId: string | null = null

    if (parentId) {
      const parentCommentResult = await db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.id, parentId),
            eq(comments.discussionId, discussion.id),
            eq(comments.status, 'VISIBLE')
          )
        )
        .limit(1)

      const parentComment = parentCommentResult[0]
      if (!parentComment) {
        throw ApiError.notFound('Parent comment not found', 'PARENT_COMMENT_NOT_FOUND')
      }
      depth = parentComment.depth + 1
      rootId = parentComment.rootId || parentComment.id

      // Update parent's reply count
      await db
        .update(comments)
        .set({ replyCount: sql`${comments.replyCount} + 1` })
        .where(eq(comments.id, parentId))
    }

    const newCommentResult = await db
      .insert(comments)
      .values({
        discussionId: discussion.id,
        authorId: userId,
        content,
        parentId,
        rootId,
        depth,
      })
      .returning()

    const newComment = newCommentResult[0]
    if (!newComment) {
      throw ApiError.internal('Failed to create comment', 'COMMENT_CREATE_FAILED')
    }

    // Get author info
    const authorResult = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    // Update discussion total comments
    await db
      .update(discussions)
      .set({
        totalComments: sql`${discussions.totalComments} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(discussions.id, discussion.id))

    return {
      id: newComment.id,
      content: newComment.content,
      author: authorResult[0],
      createdAt: newComment.createdAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private formatPollListItem(poll: Awaited<ReturnType<typeof pollRepository.findMany>>['items'][number]) {
    const options = poll.options as unknown as PollOption[]

    return {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      slug: poll.slug,
      type: poll.type,
      visibility: poll.visibility,
      status: poll.status,
      options,
      creator: poll.creator,
      category: poll.category,
      participantCount: poll.participantCount,
      responseCount: poll._count.responses,
      endsAt: poll.endsAt,
      createdAt: poll.createdAt,
    }
  }

  private formatPollDetail(
    poll: NonNullable<Awaited<ReturnType<typeof pollRepository.findById>>>,
    hasVoted: boolean,
    userAnswer: string | null
  ) {
    const options = poll.options as unknown as PollOption[]

    return {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      slug: poll.slug,
      type: poll.type,
      visibility: poll.visibility,
      status: poll.status,
      options,
      creator: poll.creator,
      category: poll.category,
      participantCount: poll.participantCount,
      responseCount: poll._count.responses,
      allowMultipleVotes: poll.allowMultipleVotes,
      maxVotesPerUser: poll.maxVotesPerUser,
      showResultsBeforeVote: poll.showResultsBeforeVote,
      allowDiscussion: poll.allowDiscussion,
      endsAt: poll.endsAt,
      createdAt: poll.createdAt,
      hasVoted,
      userAnswer,
    }
  }
}

// Export singleton
export const pollService = new PollServiceClass()

// Export class for testing
export { PollServiceClass as PollService }
