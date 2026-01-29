// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - COMMENT CONTROLLER
// HTTP request/response handling for comment operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import {
  commentService,
  type CreateCommentInput,
  type UpdateCommentInput,
} from '../services/comment.service'
import type { CommentSortOption } from '../repositories/comment.repository'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Comment Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class CommentControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /discussions/:id/comments - Get comments
  // ─────────────────────────────────────────────────────────────────────────────

  async getComments(c: Context<AppEnv>) {
    const discussionId = c.req.param('id')
    const { page, limit, sort, parentId } = this.getListParams(c)

    const result = await commentService.getComments(
      discussionId,
      page,
      limit,
      sort,
      parentId === undefined ? null : parentId
    )

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /polls/:id/comments - Get poll comments
  // ─────────────────────────────────────────────────────────────────────────────

  async getPollComments(c: Context<AppEnv>) {
    const pollId = c.req.param('id')
    const { page, limit, sort } = this.getListParams(c)

    const result = await commentService.getCommentsForContent(pollId, undefined, page, limit, sort)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /discussions/:id/comments - Create comment
  // ─────────────────────────────────────────────────────────────────────────────

  async createComment(c: Context<AppEnv>) {
    const discussionId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<CreateCommentInput>()

    const comment = await commentService.createComment(discussionId, userId, body)

    return c.json({
      success: true,
      data: comment,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /comments/:id - Update comment
  // ─────────────────────────────────────────────────────────────────────────────

  async updateComment(c: Context<AppEnv>) {
    const commentId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<UpdateCommentInput>()

    const result = await commentService.updateComment(commentId, userId, body)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /comments/:id - Delete comment
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteComment(c: Context<AppEnv>) {
    const commentId = c.req.param('id')
    const userId = c.get('userId')!

    const result = await commentService.deleteComment(commentId, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /comments/:id/vote - Vote on comment
  // ─────────────────────────────────────────────────────────────────────────────

  async voteComment(c: Context<AppEnv>) {
    const commentId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<{ value: number }>()

    const result = await commentService.voteComment(commentId, userId, body.value)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /discussions/:id/voice-access - Request voice access
  // ─────────────────────────────────────────────────────────────────────────────

  async requestVoiceAccess(c: Context<AppEnv>) {
    const discussionId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<{ reason: string }>()

    const result = await commentService.requestVoiceAccess(discussionId, userId, body.reason)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private getListParams(c: Context) {
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )
    const sort = (query['sort'] as CommentSortOption) || 'best'
    const parentId = query['parentId']

    return { page, limit, sort, parentId }
  }
}

// Export singleton
export const commentController = new CommentControllerClass()

// Export class for testing
export { CommentControllerClass as CommentController }
