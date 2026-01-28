// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SHARE LINK SERVICE
// Business logic for share link operations
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, sql, desc, isNull, gt, lt, or } from '@voxpoll/database'
import { privateLinks, shareLinkViews, polls, surveys, tests, users } from '@voxpoll/database'
import { ApiError } from '../middleware/error-handler'
import { hashPassword, verifyPassword } from '../lib/auth'
import { generateShareToken } from '../lib/hash'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ContentType = 'POLL' | 'SURVEY' | 'TEST'

interface CreateShareLinkInput {
  contentType: ContentType
  contentId: string
  creatorId: string
  expiresAt?: Date
  maxUses?: number
  requireAuth?: boolean
  allowAnonymous?: boolean
  password?: string
  trackViews?: boolean
}

interface UpdateShareLinkInput {
  expiresAt?: Date | null
  maxUses?: number | null
  requireAuth?: boolean
  allowAnonymous?: boolean
  password?: string | null
  isActive?: boolean
}

interface ShareLinkWithStats {
  id: string
  code: string
  contentType: string
  contentId: string
  expiresAt: Date | null
  maxUses: number | null
  currentUses: number
  requireAuth: boolean
  allowAnonymous: boolean
  hasPassword: boolean
  trackViews: boolean
  totalViews: number
  uniqueViews: number
  participations: number
  status: string
  isActive: boolean
  createdAt: Date
  lastAccessedAt: Date | null
}

interface TrackViewInput {
  linkId: string
  ipHash?: string
  userAgent?: string
  referrer?: string
  country?: string
  region?: string
  userId?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Share Link Service Class
// ─────────────────────────────────────────────────────────────────────────────

class ShareLinkServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Create Share Link
  // ─────────────────────────────────────────────────────────────────────────────

  async createShareLink(input: CreateShareLinkInput): Promise<ShareLinkWithStats> {
    const contentExists = await this.validateContentExists(input.contentType, input.contentId)
    if (!contentExists) {
      throw ApiError.notFound('Content not found', 'CONTENT_NOT_FOUND')
    }

    const code = await this.generateUniqueCode()
    const hashedPassword = input.password ? await hashPassword(input.password) : null

    const [link] = await db
      .insert(privateLinks)
      .values({
        contentType: input.contentType,
        contentId: input.contentId,
        code,
        creatorId: input.creatorId,
        expiresAt: input.expiresAt || null,
        maxUses: input.maxUses || null,
        requireAuth: input.requireAuth ?? false,
        allowAnonymous: input.allowAnonymous ?? true,
        password: hashedPassword,
        trackViews: input.trackViews ?? true,
        status: 'ACTIVE',
        isActive: true,
      })
      .returning()

    return this.formatShareLink(link!)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Share Link by Code
  // ─────────────────────────────────────────────────────────────────────────────

  async getShareLinkByCode(code: string): Promise<ShareLinkWithStats | null> {
    const [link] = await db
      .select()
      .from(privateLinks)
      .where(eq(privateLinks.code, code))
      .limit(1)

    if (!link) return null
    return this.formatShareLink(link)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Share Link by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getShareLinkById(id: string): Promise<ShareLinkWithStats | null> {
    const [link] = await db
      .select()
      .from(privateLinks)
      .where(eq(privateLinks.id, id))
      .limit(1)

    if (!link) return null
    return this.formatShareLink(link)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Share Links by Content
  // ─────────────────────────────────────────────────────────────────────────────

  async getShareLinksByContent(
    contentType: ContentType,
    contentId: string,
    creatorId: string
  ): Promise<ShareLinkWithStats[]> {
    const links = await db
      .select()
      .from(privateLinks)
      .where(
        and(
          eq(privateLinks.contentType, contentType),
          eq(privateLinks.contentId, contentId),
          eq(privateLinks.creatorId, creatorId)
        )
      )
      .orderBy(desc(privateLinks.createdAt))

    return links.map(link => this.formatShareLink(link))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Share Link
  // ─────────────────────────────────────────────────────────────────────────────

  async updateShareLink(
    linkId: string,
    creatorId: string,
    input: UpdateShareLinkInput
  ): Promise<ShareLinkWithStats> {
    const existing = await this.getShareLinkById(linkId)
    if (!existing) {
      throw ApiError.notFound('Share link not found', 'SHARE_LINK_NOT_FOUND')
    }

    const [ownerCheck] = await db
      .select({ creatorId: privateLinks.creatorId })
      .from(privateLinks)
      .where(eq(privateLinks.id, linkId))
      .limit(1)

    if (ownerCheck?.creatorId !== creatorId) {
      throw ApiError.forbidden('You can only update your own share links', 'NOT_OWNER')
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (input.expiresAt !== undefined) {
      updateData['expiresAt'] = input.expiresAt
    }
    if (input.maxUses !== undefined) {
      updateData['maxUses'] = input.maxUses
    }
    if (input.requireAuth !== undefined) {
      updateData['requireAuth'] = input.requireAuth
    }
    if (input.allowAnonymous !== undefined) {
      updateData['allowAnonymous'] = input.allowAnonymous
    }
    if (input.password !== undefined) {
      updateData['password'] = input.password ? await hashPassword(input.password) : null
    }
    if (input.isActive !== undefined) {
      updateData['isActive'] = input.isActive
      updateData['status'] = input.isActive ? 'ACTIVE' : 'DISABLED'
    }

    const [updated] = await db
      .update(privateLinks)
      .set(updateData)
      .where(eq(privateLinks.id, linkId))
      .returning()

    return this.formatShareLink(updated!)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete Share Link
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteShareLink(linkId: string, creatorId: string): Promise<void> {
    const [ownerCheck] = await db
      .select({ creatorId: privateLinks.creatorId })
      .from(privateLinks)
      .where(eq(privateLinks.id, linkId))
      .limit(1)

    if (!ownerCheck) {
      throw ApiError.notFound('Share link not found', 'SHARE_LINK_NOT_FOUND')
    }

    if (ownerCheck.creatorId !== creatorId) {
      throw ApiError.forbidden('You can only delete your own share links', 'NOT_OWNER')
    }

    await db
      .delete(privateLinks)
      .where(eq(privateLinks.id, linkId))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Verify Password
  // ─────────────────────────────────────────────────────────────────────────────

  async verifyPassword(code: string, password: string): Promise<boolean> {
    const [link] = await db
      .select({ password: privateLinks.password })
      .from(privateLinks)
      .where(eq(privateLinks.code, code))
      .limit(1)

    if (!link || !link.password) {
      return false
    }

    return verifyPassword(password, link.password)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Access Share Link
  // ─────────────────────────────────────────────────────────────────────────────

  async accessShareLink(code: string, userId?: string, password?: string): Promise<{
    contentType: ContentType
    contentId: string
  }> {
    const link = await this.getShareLinkByCode(code)

    if (!link) {
      throw ApiError.notFound('Share link not found', 'SHARE_LINK_NOT_FOUND')
    }

    if (!link.isActive || link.status !== 'ACTIVE') {
      throw ApiError.forbidden('This share link is no longer active', 'LINK_INACTIVE')
    }

    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      throw ApiError.forbidden('This share link has expired', 'LINK_EXPIRED')
    }

    if (link.maxUses && link.currentUses >= link.maxUses) {
      throw ApiError.forbidden('This share link has reached its usage limit', 'LINK_EXHAUSTED')
    }

    if (link.requireAuth && !userId) {
      throw ApiError.unauthorized('Authentication required to access this link', 'AUTH_REQUIRED')
    }

    if (!link.allowAnonymous && !userId) {
      throw ApiError.unauthorized('Anonymous access is not allowed', 'ANONYMOUS_NOT_ALLOWED')
    }

    if (link.hasPassword) {
      if (!password) {
        throw ApiError.forbidden('Password required to access this link', 'PASSWORD_REQUIRED')
      }
      const isValid = await this.verifyPassword(code, password)
      if (!isValid) {
        throw ApiError.forbidden('Invalid password', 'INVALID_PASSWORD')
      }
    }

    await db
      .update(privateLinks)
      .set({
        currentUses: sql`${privateLinks.currentUses} + 1`,
        lastAccessedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(privateLinks.code, code))

    return {
      contentType: link.contentType as ContentType,
      contentId: link.contentId,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Track View
  // ─────────────────────────────────────────────────────────────────────────────

  async trackView(input: TrackViewInput): Promise<void> {
    const [link] = await db
      .select({ trackViews: privateLinks.trackViews })
      .from(privateLinks)
      .where(eq(privateLinks.id, input.linkId))
      .limit(1)

    if (!link || !link.trackViews) return

    await db.insert(shareLinkViews).values({
      linkId: input.linkId,
      ipHash: input.ipHash || null,
      userAgent: input.userAgent?.slice(0, 500) || null,
      referrer: input.referrer?.slice(0, 500) || null,
      country: input.country?.slice(0, 2) || null,
      region: input.region?.slice(0, 100) || null,
      userId: input.userId || null,
    })

    const isNewVisitor = input.ipHash ? await this.isNewVisitor(input.linkId, input.ipHash) : true

    await db
      .update(privateLinks)
      .set({
        totalViews: sql`${privateLinks.totalViews} + 1`,
        uniqueViews: isNewVisitor
          ? sql`${privateLinks.uniqueViews} + 1`
          : privateLinks.uniqueViews,
        updatedAt: new Date(),
      })
      .where(eq(privateLinks.id, input.linkId))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Mark Participation
  // ─────────────────────────────────────────────────────────────────────────────

  async markParticipation(linkId: string, viewId?: string): Promise<void> {
    await db
      .update(privateLinks)
      .set({
        participations: sql`${privateLinks.participations} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(privateLinks.id, linkId))

    if (viewId) {
      await db
        .update(shareLinkViews)
        .set({
          participated: true,
          participatedAt: new Date(),
        })
        .where(eq(shareLinkViews.id, viewId))
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Share Link Analytics
  // ─────────────────────────────────────────────────────────────────────────────

  async getShareLinkAnalytics(linkId: string, creatorId: string): Promise<{
    link: ShareLinkWithStats
    viewsByDay: Array<{ date: string; views: number; uniqueViews: number }>
    viewsByCountry: Array<{ country: string; views: number }>
    topReferrers: Array<{ referrer: string; views: number }>
    conversionRate: number
  }> {
    const link = await this.getShareLinkById(linkId)
    if (!link) {
      throw ApiError.notFound('Share link not found', 'SHARE_LINK_NOT_FOUND')
    }

    const [ownerCheck] = await db
      .select({ creatorId: privateLinks.creatorId })
      .from(privateLinks)
      .where(eq(privateLinks.id, linkId))
      .limit(1)

    if (ownerCheck?.creatorId !== creatorId) {
      throw ApiError.forbidden('You can only view analytics for your own links', 'NOT_OWNER')
    }

    const viewsByDayResult = await db.execute(sql`
      SELECT
        DATE(viewed_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT ip_hash) as unique_views
      FROM share_link_views
      WHERE link_id = ${linkId}
      GROUP BY DATE(viewed_at)
      ORDER BY date DESC
      LIMIT 30
    `)

    const viewsByCountryResult = await db.execute(sql`
      SELECT
        COALESCE(country, 'Unknown') as country,
        COUNT(*) as views
      FROM share_link_views
      WHERE link_id = ${linkId}
      GROUP BY country
      ORDER BY views DESC
      LIMIT 10
    `)

    const topReferrersResult = await db.execute(sql`
      SELECT
        COALESCE(referrer, 'Direct') as referrer,
        COUNT(*) as views
      FROM share_link_views
      WHERE link_id = ${linkId}
      GROUP BY referrer
      ORDER BY views DESC
      LIMIT 10
    `)

    const conversionRate = link.totalViews > 0
      ? (link.participations / link.totalViews) * 100
      : 0

    return {
      link,
      viewsByDay: viewsByDayResult as unknown as Array<{ date: string; views: number; uniqueViews: number }>,
      viewsByCountry: viewsByCountryResult as unknown as Array<{ country: string; views: number }>,
      topReferrers: topReferrersResult as unknown as Array<{ referrer: string; views: number }>,
      conversionRate: Math.round(conversionRate * 100) / 100,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Generate Unique Code
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateUniqueCode(): Promise<string> {
    let code: string
    let attempts = 0
    const maxAttempts = 10

    do {
      code = generateShareToken().slice(0, 12)
      const existing = await db
        .select({ id: privateLinks.id })
        .from(privateLinks)
        .where(eq(privateLinks.code, code))
        .limit(1)

      if (existing.length === 0) {
        return code
      }
      attempts++
    } while (attempts < maxAttempts)

    throw ApiError.internal('Failed to generate unique code', 'CODE_GENERATION_FAILED')
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Validate Content Exists
  // ─────────────────────────────────────────────────────────────────────────────

  private async validateContentExists(contentType: ContentType, contentId: string): Promise<boolean> {
    let result: { id: string }[] = []

    switch (contentType) {
      case 'POLL':
        result = await db
          .select({ id: polls.id })
          .from(polls)
          .where(and(eq(polls.id, contentId), isNull(polls.deletedAt)))
          .limit(1)
        break
      case 'SURVEY':
        result = await db
          .select({ id: surveys.id })
          .from(surveys)
          .where(and(eq(surveys.id, contentId), isNull(surveys.deletedAt)))
          .limit(1)
        break
      case 'TEST':
        result = await db
          .select({ id: tests.id })
          .from(tests)
          .where(and(eq(tests.id, contentId), isNull(tests.deletedAt)))
          .limit(1)
        break
    }

    return result.length > 0
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Check if New Visitor
  // ─────────────────────────────────────────────────────────────────────────────

  private async isNewVisitor(linkId: string, ipHash: string): Promise<boolean> {
    const existing = await db
      .select({ id: shareLinkViews.id })
      .from(shareLinkViews)
      .where(
        and(
          eq(shareLinkViews.linkId, linkId),
          eq(shareLinkViews.ipHash, ipHash)
        )
      )
      .limit(1)

    return existing.length === 0
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Format Share Link
  // ─────────────────────────────────────────────────────────────────────────────

  private formatShareLink(link: typeof privateLinks.$inferSelect): ShareLinkWithStats {
    return {
      id: link.id,
      code: link.code,
      contentType: link.contentType,
      contentId: link.contentId,
      expiresAt: link.expiresAt,
      maxUses: link.maxUses,
      currentUses: link.currentUses,
      requireAuth: link.requireAuth,
      allowAnonymous: link.allowAnonymous,
      hasPassword: !!link.password,
      trackViews: link.trackViews,
      totalViews: link.totalViews,
      uniqueViews: link.uniqueViews,
      participations: link.participations,
      status: link.status,
      isActive: link.isActive,
      createdAt: link.createdAt,
      lastAccessedAt: link.lastAccessedAt,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const shareService = new ShareLinkServiceClass()
export type { CreateShareLinkInput, UpdateShareLinkInput, ShareLinkWithStats, ContentType }
