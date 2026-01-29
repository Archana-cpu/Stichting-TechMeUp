// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - COMMENT SERVICE
// Business logic for comment operations
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq } from '@voxpoll/database'
import { commentVotes } from '@voxpoll/database'
import { commentRepository, type CommentSortOption } from '../repositories/comment.repository'
import { algorithmService } from './algorithm.service'
import { ApiError } from '../middleware/error-handler'
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateCommentInput {
  content: string
  parentId?: string
}

export interface UpdateCommentInput {
  content: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Comment Service Class
// ─────────────────────────────────────────────────────────────────────────────

class CommentServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Get Comments
  // ─────────────────────────────────────────────────────────────────────────────

  async getComments(
    discussionId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    sort: CommentSortOption = 'best',
    parentId?: string | null
  ) {
    const discussion = await commentRepository.findDiscussionById(discussionId)
    if (!discussion) {
      throw ApiError.notFound('Discussion not found', 'DISCUSSION_NOT_FOUND')
    }

    const result = await commentRepository.findMany(discussionId, page, limit, sort, parentId)

    return {
      items: result.items.map((comment) => ({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
        replyCount: comment._count.replies,
        isEdited: comment.isEdited,
        isPinned: comment.isPinned,
        createdAt: comment.createdAt,
        editedAt: comment.editedAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Comments for Poll/Survey
  // ─────────────────────────────────────────────────────────────────────────────

  async getCommentsForContent(
    pollId?: string,
    surveyId?: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    sort: CommentSortOption = 'best'
  ) {
    let discussion = await commentRepository.findDiscussion(pollId, surveyId)

    if (!discussion) {
      // Create discussion if it doesn't exist
      const created = await commentRepository.createDiscussion({
        pollId,
        surveyId,
        status: 'OPEN',
      })
      discussion = created ?? null
    }

    if (!discussion) {
      throw ApiError.internal('Failed to create discussion', 'DISCUSSION_CREATE_FAILED')
    }

    return this.getComments(discussion.id, page, limit, sort, null)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Comment
  // ─────────────────────────────────────────────────────────────────────────────

  async createComment(
    discussionId: string,
    userId: string,
    input: CreateCommentInput
  ) {
    const discussion = await commentRepository.findDiscussionById(discussionId)
    if (!discussion) {
      throw ApiError.notFound('Discussion not found', 'DISCUSSION_NOT_FOUND')
    }

    if (discussion.status === 'CLOSED') {
      throw ApiError.forbidden('This discussion is closed', 'DISCUSSION_CLOSED')
    }

    // Check voice access for locked discussions
    if (discussion.status === 'LOCKED') {
      const hasAccess = await commentRepository.hasVoiceAccess(discussionId, userId)
      if (!hasAccess) {
        throw ApiError.forbidden('Voice access required for this discussion', 'VOICE_ACCESS_REQUIRED')
      }
    }

    let parentId: string | undefined
    let rootId: string | undefined
    let depth = 0

    if (input.parentId) {
      const parent = await commentRepository.findById(input.parentId)
      if (!parent || parent.discussionId !== discussionId) {
        throw ApiError.notFound('Parent comment not found', 'PARENT_NOT_FOUND')
      }
      parentId = input.parentId
      rootId = parent.rootId || parent.id
      depth = Math.min((parent.depth || 0) + 1, 5) // Max depth of 5
    }

    const comment = await commentRepository.create({
      discussionId,
      authorId: userId,
      content: input.content,
      parentId,
      rootId,
      depth,
    })

    // Update parent reply count if this is a reply
    if (parentId) {
      await commentRepository.incrementReplyCount(parentId)
    }

    // Update discussion stats
    await commentRepository.updateDiscussionStats(discussionId)

    return {
      id: comment.id,
      content: comment.content,
      author: comment.author,
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
      replyCount: 0,
      createdAt: comment.createdAt,
      message: SUCCESS_MESSAGES.COMMENT_CREATED,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Comment
  // ─────────────────────────────────────────────────────────────────────────────

  async updateComment(commentId: string, userId: string, input: UpdateCommentInput) {
    const comment = await commentRepository.findById(commentId)

    if (!comment || comment.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.COMMENT_NOT_FOUND, ERROR_CODES.COMMENT_NOT_FOUND)
    }

    if (comment.authorId !== userId) {
      throw ApiError.forbidden('You can only edit your own comments', 'NOT_AUTHORIZED')
    }

    // Store edit history
    const existingHistory = Array.isArray(comment.editHistory) ? comment.editHistory : []
    const editHistory: object[] = [
      ...existingHistory.filter((h): h is object => typeof h === 'object' && h !== null),
      {
        content: comment.content,
        editedAt: new Date().toISOString(),
      },
    ]

    const updated = await commentRepository.update(commentId, input.content, editHistory)

    if (!updated) {
      throw ApiError.internal('Failed to update comment', 'COMMENT_UPDATE_FAILED')
    }

    return {
      id: updated.id,
      content: updated.content,
      isEdited: updated.isEdited,
      editedAt: updated.editedAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete Comment
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteComment(commentId: string, userId: string) {
    const comment = await commentRepository.findById(commentId)

    if (!comment || comment.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.COMMENT_NOT_FOUND, ERROR_CODES.COMMENT_NOT_FOUND)
    }

    if (comment.authorId !== userId) {
      // Check if user is a moderator (would need additional logic)
      throw ApiError.forbidden('You can only delete your own comments', 'NOT_AUTHORIZED')
    }

    await commentRepository.softDelete(commentId)
    await commentRepository.updateDiscussionStats(comment.discussionId)

    return { message: SUCCESS_MESSAGES.COMMENT_DELETED }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Vote on Comment
  // ─────────────────────────────────────────────────────────────────────────────

  async voteComment(commentId: string, userId: string, value: number) {
    const comment = await commentRepository.findById(commentId)

    if (!comment || comment.deletedAt) {
      throw ApiError.notFound(ERROR_MESSAGES.COMMENT_NOT_FOUND, ERROR_CODES.COMMENT_NOT_FOUND)
    }

    if (comment.authorId === userId) {
      throw ApiError.badRequest('You cannot vote on your own comment', 'CANNOT_VOTE_OWN')
    }

    const existingVote = await commentRepository.getUserVote(commentId, userId)
    const normalizedValue = value > 0 ? 1 : value < 0 ? -1 : 0

    if (normalizedValue === 0) {
      // Remove vote
      if (existingVote) {
        await commentRepository.deleteVote(commentId, userId)
      }
    } else {
      await commentRepository.upsertVote(commentId, userId, normalizedValue)
    }

    // Recalculate vote counts using Drizzle
    const votes = await db
      .select({ value: commentVotes.value })
      .from(commentVotes)
      .where(eq(commentVotes.commentId, commentId))

    const upvotes = votes.filter((v) => v.value > 0).length
    const downvotes = votes.filter((v) => v.value < 0).length

    await commentRepository.updateVotes(commentId, upvotes, downvotes)

    // Update Wilson score and other rankings asynchronously
    algorithmService.updateCommentRankings(commentId).catch((err) => {
      console.error(`[CommentService] Failed to update rankings for comment ${commentId}:`, err)
    })

    return {
      upvotes,
      downvotes,
      userVote: normalizedValue,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Request Voice Access
  // ─────────────────────────────────────────────────────────────────────────────

  async requestVoiceAccess(discussionId: string, userId: string, reason: string) {
    const discussion = await commentRepository.findDiscussionById(discussionId)
    if (!discussion) {
      throw ApiError.notFound('Discussion not found', 'DISCUSSION_NOT_FOUND')
    }

    if (discussion.status !== 'LOCKED') {
      throw ApiError.badRequest('Voice access is only required for locked discussions', 'NOT_LOCKED')
    }

    const request = await commentRepository.requestVoiceAccess(discussionId, userId, reason)

    if (!request) {
      throw ApiError.internal('Failed to request voice access', 'VOICE_REQUEST_FAILED')
    }

    return {
      id: request.id,
      status: request.status,
      requestedAt: request.requestedAt,
    }
  }
}

// Export singleton
export const commentService = new CommentServiceClass()

// Export class for testing
export { CommentServiceClass as CommentService }
