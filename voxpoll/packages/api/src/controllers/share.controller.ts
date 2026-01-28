// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SHARE LINK CONTROLLER
// HTTP request/response handling for share link operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { shareService, type CreateShareLinkInput, type UpdateShareLinkInput, type ContentType } from '../services/share.service'
import type { AppEnv } from '../types'
import { sha256 } from '../lib/hash'

// ─────────────────────────────────────────────────────────────────────────────
// Share Link Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class ShareControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /share-links - Create share link
  // ─────────────────────────────────────────────────────────────────────────────

  async createShareLink(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const body = await c.req.json<{
      contentType: ContentType
      contentId: string
      expiresAt?: string
      maxUses?: number
      requireAuth?: boolean
      allowAnonymous?: boolean
      password?: string
      trackViews?: boolean
    }>()

    const link = await shareService.createShareLink({
      contentType: body.contentType,
      contentId: body.contentId,
      creatorId: userId,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      maxUses: body.maxUses,
      requireAuth: body.requireAuth,
      allowAnonymous: body.allowAnonymous,
      password: body.password,
      trackViews: body.trackViews,
    })

    return c.json({
      success: true,
      data: link,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /share-links/:id - Get share link by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getShareLink(c: Context<AppEnv>) {
    const id = c.req.param('id')

    const link = await shareService.getShareLinkById(id)

    if (!link) {
      return c.json({
        success: false,
        error: { code: 'SHARE_LINK_NOT_FOUND', message: 'Share link not found' },
      }, 404)
    }

    return c.json({
      success: true,
      data: link,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /share/:code - Access content via share code
  // ─────────────────────────────────────────────────────────────────────────────

  async accessShareLink(c: Context<AppEnv>) {
    const code = c.req.param('code')
    const userId = c.get('userId')
    const password = c.req.header('X-Share-Password')

    const result = await shareService.accessShareLink(code, userId, password)

    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    const userAgent = c.req.header('user-agent')
    const referrer = c.req.header('referer')

    const link = await shareService.getShareLinkByCode(code)
    if (link) {
      shareService.trackView({
        linkId: link.id,
        ipHash: sha256(ip),
        userAgent,
        referrer,
        userId,
      }).catch(() => {})
    }

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /share-links/content/:contentType/:contentId - Get share links by content
  // ─────────────────────────────────────────────────────────────────────────────

  async getShareLinksByContent(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const contentType = c.req.param('contentType') as ContentType
    const contentId = c.req.param('contentId')

    const links = await shareService.getShareLinksByContent(contentType, contentId, userId)

    return c.json({
      success: true,
      data: links,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /share-links/:id - Update share link
  // ─────────────────────────────────────────────────────────────────────────────

  async updateShareLink(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<{
      expiresAt?: string | null
      maxUses?: number | null
      requireAuth?: boolean
      allowAnonymous?: boolean
      password?: string | null
      isActive?: boolean
    }>()

    const input: UpdateShareLinkInput = {}
    if (body.expiresAt !== undefined) input.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    if (body.maxUses !== undefined) input.maxUses = body.maxUses
    if (body.requireAuth !== undefined) input.requireAuth = body.requireAuth
    if (body.allowAnonymous !== undefined) input.allowAnonymous = body.allowAnonymous
    if (body.password !== undefined) input.password = body.password
    if (body.isActive !== undefined) input.isActive = body.isActive

    const link = await shareService.updateShareLink(id, userId, input)

    return c.json({
      success: true,
      data: link,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /share-links/:id - Delete share link
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteShareLink(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    await shareService.deleteShareLink(id, userId)

    return c.json({
      success: true,
      message: 'Share link deleted successfully',
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /share-links/:code/verify-password - Verify share link password
  // ─────────────────────────────────────────────────────────────────────────────

  async verifyPassword(c: Context<AppEnv>) {
    const code = c.req.param('code')
    const body = await c.req.json<{ password: string }>()

    const isValid = await shareService.verifyPassword(code, body.password)

    return c.json({
      success: true,
      data: { isValid },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /share-links/:id/analytics - Get share link analytics
  // ─────────────────────────────────────────────────────────────────────────────

  async getShareLinkAnalytics(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const analytics = await shareService.getShareLinkAnalytics(id, userId)

    return c.json({
      success: true,
      data: analytics,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /share-links/:id/participate - Mark participation
  // ─────────────────────────────────────────────────────────────────────────────

  async markParticipation(c: Context<AppEnv>) {
    const id = c.req.param('id')

    await shareService.markParticipation(id)

    return c.json({
      success: true,
      message: 'Participation recorded',
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const shareController = new ShareControllerClass()
