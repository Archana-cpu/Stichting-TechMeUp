// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - NOTIFICATION SERVICE
// Business logic for notification operations
// [P-046] Notification deduplication with Redis
// ══════════════════════════════════════════════════════════════════════════════

import { createHash } from 'node:crypto'
import { type NotificationType, type NotificationCategory, type NotificationPriority, type ActorType, type ResourceType, type DigestFrequency } from '@voxpoll/database'
import { notificationRepository } from '../repositories/notification.repository'
import { ApiError } from '../middleware/error-handler'
import { PAGINATION } from '../constants/limits'
import { getRedis } from '../lib/redis'

// ─────────────────────────────────────────────────────────────────────────────
// Deduplication Configuration [P-046]
// TTL in seconds for each notification type
// ─────────────────────────────────────────────────────────────────────────────

const DEDUP_TTL: Partial<Record<NotificationType, number>> = {
  // Social notifications - dedupe for 5 minutes
  POLL_VOTE_RECEIVED: 300,
  REPLY_TO_YOUR_COMMENT: 300,
  MENTION_IN_COMMENT: 300,
  COMMENT_UPVOTED: 300,
  NEW_FOLLOWER: 300,

  // Content notifications - dedupe for 1 hour
  POLL_PUBLISHED: 3600,
  POLL_ENDED: 3600,
  CONTENT_MILESTONE: 3600,
  SURVEY_ENDED: 3600,
  TEST_PUBLISHED: 3600,

  // Achievement notifications - dedupe for 24 hours
  BADGE_EARNED: 86400,
  LEVEL_UP: 86400,
  STREAK_MILESTONE: 86400,
  LEADERBOARD_RANK_CHANGE: 86400,

  // Organization notifications - dedupe for 30 minutes
  ORG_INVITATION: 1800,
  ORG_ROLE_CHANGED: 1800,
  ORG_MEMBER_LEFT: 1800,

  // Payment notifications - minimal dedupe (important)
  SUBSCRIPTION_CHANGED: 60,
  SUBSCRIPTION_RENEWED: 60,
  PAYMENT_FAILED: 60,

  // Moderation notifications - dedupe for 1 hour
  REPORT_RECEIVED: 3600,
  CONTENT_REMOVED: 3600,
}

// Default TTL for unlisted notification types (10 minutes)
const DEFAULT_DEDUP_TTL = 600

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  category: NotificationCategory
  priority?: NotificationPriority
  title: string
  body: string
  actorId?: string
  actorType?: ActorType
  actorName?: string
  actorAvatarUrl?: string
  resourceId?: string
  resourceType?: ResourceType
  resourceTitle?: string
  actionUrl?: string
  actionLabel?: string
  imageUrl?: string
  metadata?: object
}

export interface UpdatePreferencesInput {
  globalEnabled?: boolean
  quietHoursEnabled?: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  quietHoursTimezone?: string
  quietHoursAllowUrgent?: boolean
  categoryPreferences?: object
  emailDigestEnabled?: boolean
  emailDigestFrequency?: DigestFrequency
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Service Class
// ─────────────────────────────────────────────────────────────────────────────

class NotificationServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Get Notifications
  // ─────────────────────────────────────────────────────────────────────────────

  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    unreadOnly: boolean = false
  ) {
    const result = await notificationRepository.findMany(userId, page, limit, unreadOnly)

    return {
      items: result.items.map((n) => ({
        id: n.id,
        type: n.type,
        category: n.category,
        priority: n.priority,
        title: n.title,
        body: n.body,
        actorName: n.actorName,
        actorAvatarUrl: n.actorAvatarUrl,
        resourceId: n.resourceId,
        resourceType: n.resourceType,
        resourceTitle: n.resourceTitle,
        actionUrl: n.actionUrl,
        actionLabel: n.actionLabel,
        imageUrl: n.imageUrl,
        status: n.status,
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Unread Count
  // ─────────────────────────────────────────────────────────────────────────────

  async getUnreadCount(userId: string) {
    const count = await notificationRepository.getUnreadCount(userId)
    return { count }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Mark as Read
  // ─────────────────────────────────────────────────────────────────────────────

  async markAsRead(notificationId: string, userId: string) {
    const notification = await notificationRepository.findById(notificationId)

    if (!notification) {
      throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND')
    }

    if (notification.userId !== userId) {
      throw ApiError.forbidden('Not authorized', 'NOT_AUTHORIZED')
    }

    await notificationRepository.markAsRead(notificationId)
    return { success: true }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Mark All as Read
  // ─────────────────────────────────────────────────────────────────────────────

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId)
    return { success: true }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete Notification
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await notificationRepository.findById(notificationId)

    if (!notification) {
      throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND')
    }

    if (notification.userId !== userId) {
      throw ApiError.forbidden('Not authorized', 'NOT_AUTHORIZED')
    }

    await notificationRepository.softDelete(notificationId)
    return { success: true }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Preferences
  // ─────────────────────────────────────────────────────────────────────────────

  async getPreferences(userId: string) {
    let preferences = await notificationRepository.getPreferences(userId)

    if (!preferences) {
      // Create default preferences
      const created = await notificationRepository.upsertPreferences(userId, {})
      preferences = created ?? null
    }

    if (!preferences) {
      throw ApiError.internal('Failed to get or create preferences', 'PREFERENCES_ERROR')
    }

    return {
      globalEnabled: preferences.globalEnabled,
      quietHoursEnabled: preferences.quietHoursEnabled,
      quietHoursStart: preferences.quietHoursStart,
      quietHoursEnd: preferences.quietHoursEnd,
      quietHoursTimezone: preferences.quietHoursTimezone,
      quietHoursAllowUrgent: preferences.quietHoursAllowUrgent,
      categoryPreferences: preferences.categoryPreferences,
      emailDigestEnabled: preferences.emailDigestEnabled,
      emailDigestFrequency: preferences.emailDigestFrequency,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Preferences
  // ─────────────────────────────────────────────────────────────────────────────

  async updatePreferences(userId: string, input: UpdatePreferencesInput) {
    const preferences = await notificationRepository.upsertPreferences(userId, input)

    if (!preferences) {
      throw ApiError.internal('Failed to update preferences', 'PREFERENCES_UPDATE_ERROR')
    }

    return {
      globalEnabled: preferences.globalEnabled,
      quietHoursEnabled: preferences.quietHoursEnabled,
      quietHoursStart: preferences.quietHoursStart,
      quietHoursEnd: preferences.quietHoursEnd,
      emailDigestEnabled: preferences.emailDigestEnabled,
      emailDigestFrequency: preferences.emailDigestFrequency,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Notification (Internal) [P-046 Deduplication]
  // ─────────────────────────────────────────────────────────────────────────────

  async createNotification(input: CreateNotificationInput, skipDedup: boolean = false) {
    // Check deduplication unless skipped
    if (!skipDedup) {
      const isDuplicate = await this.checkDuplicate(input)
      if (isDuplicate) {
        console.log(`[Notification] Duplicate notification skipped: ${input.type} for user ${input.userId}`)
        return null
      }
    }

    // Create the notification
    const notification = await notificationRepository.create({
      userId: input.userId,
      type: input.type,
      category: input.category,
      priority: input.priority || ('NORMAL' as NotificationPriority),
      title: input.title,
      body: input.body,
      actorId: input.actorId,
      actorType: input.actorType || ('USER' as ActorType),
      actorName: input.actorName,
      actorAvatarUrl: input.actorAvatarUrl,
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      resourceTitle: input.resourceTitle,
      actionUrl: input.actionUrl,
      actionLabel: input.actionLabel,
      imageUrl: input.imageUrl,
      metadata: input.metadata,
    })

    // Mark as sent for deduplication
    if (!skipDedup) {
      await this.markAsSent(input)
    }

    return notification
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Deduplication Helpers [P-046]
  // ─────────────────────────────────────────────────────────────────────────────

  private generateDedupKey(input: CreateNotificationInput): string {
    // Create a unique key based on: user + type + actor + resource
    const keyParts = [
      input.userId,
      input.type,
      input.actorId || 'system',
      input.resourceId || 'none',
      input.resourceType || 'none',
    ]
    const keyString = keyParts.join(':')
    const hash = createHash('sha256').update(keyString).digest('hex').slice(0, 16)
    return `notif:dedup:${hash}`
  }

  private async checkDuplicate(input: CreateNotificationInput): Promise<boolean> {
    try {
      const redis = getRedis()
      const key = this.generateDedupKey(input)
      const exists = await redis.exists(key)
      return exists === 1
    } catch (error) {
      // If Redis fails, allow the notification (fail open)
      console.error('[Notification] Redis dedup check failed:', error)
      return false
    }
  }

  private async markAsSent(input: CreateNotificationInput): Promise<void> {
    try {
      const redis = getRedis()
      const key = this.generateDedupKey(input)
      const ttl = DEDUP_TTL[input.type] || DEFAULT_DEDUP_TTL
      await redis.setex(key, ttl, '1')
    } catch (error) {
      // If Redis fails, log but don't block
      console.error('[Notification] Redis dedup mark failed:', error)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Batch Create Notifications (with deduplication)
  // ─────────────────────────────────────────────────────────────────────────────

  async createNotifications(inputs: CreateNotificationInput[]): Promise<number> {
    let created = 0
    for (const input of inputs) {
      const notification = await this.createNotification(input)
      if (notification) created++
    }
    return created
  }
}

// Export singleton
export const notificationService = new NotificationServiceClass()

// Export class for testing
export { NotificationServiceClass as NotificationService }
