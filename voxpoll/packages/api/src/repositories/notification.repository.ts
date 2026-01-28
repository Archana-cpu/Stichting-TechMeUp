// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - NOTIFICATION REPOSITORY
// Data access layer for notification operations
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  desc,
  sql,
  isNull,
  notifications,
  notificationPreferences,
  type NotificationType,
  type NotificationCategory,
  type NotificationPriority,
  type ActorType,
  type ResourceType,
  type DigestFrequency,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import type { PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Notification = InferSelectModel<typeof notifications>
export type NotificationPreference = InferSelectModel<typeof notificationPreferences>

// ─────────────────────────────────────────────────────────────────────────────
// Notification Repository Class
// ─────────────────────────────────────────────────────────────────────────────

class NotificationRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Find Notifications
  // ─────────────────────────────────────────────────────────────────────────────

  async findMany(userId: string, page: number, limit: number, unreadOnly: boolean = false) {
    const skip = (page - 1) * limit

    const conditions = [
      eq(notifications.userId, userId),
      isNull(notifications.deletedAt),
    ]
    if (unreadOnly) {
      conditions.push(eq(notifications.status, 'UNREAD'))
    }

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .offset(skip)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(and(...conditions)),
    ])

    const total = countResult[0]?.count ?? 0

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }

    return { items, meta }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Unread Count
  // ─────────────────────────────────────────────────────────────────────────────

  async getUnreadCount(userId: string) {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.status, 'UNREAD'),
          isNull(notifications.deletedAt)
        )
      )

    return result[0]?.count ?? 0
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Find Notification by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async findById(id: string) {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Notification
  // ─────────────────────────────────────────────────────────────────────────────

  async create(data: {
    userId: string
    type: NotificationType
    category: NotificationCategory
    priority: NotificationPriority
    title: string
    body: string
    actorId?: string
    actorType: ActorType
    actorName?: string
    actorAvatarUrl?: string
    resourceId?: string
    resourceType?: ResourceType
    resourceTitle?: string
    actionUrl?: string
    actionLabel?: string
    imageUrl?: string
    metadata?: object
  }) {
    const result = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        type: data.type,
        category: data.category,
        priority: data.priority,
        title: data.title,
        body: data.body,
        actorId: data.actorId,
        actorType: data.actorType,
        actorName: data.actorName,
        actorAvatarUrl: data.actorAvatarUrl,
        resourceId: data.resourceId,
        resourceType: data.resourceType,
        resourceTitle: data.resourceTitle,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        imageUrl: data.imageUrl,
        metadata: data.metadata || {},
      })
      .returning()

    return result[0]
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Mark as Read
  // ─────────────────────────────────────────────────────────────────────────────

  async markAsRead(id: string) {
    const result = await db
      .update(notifications)
      .set({
        status: 'READ',
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Mark All as Read
  // ─────────────────────────────────────────────────────────────────────────────

  async markAllAsRead(userId: string) {
    await db
      .update(notifications)
      .set({
        status: 'READ',
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.status, 'UNREAD')
        )
      )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Soft Delete
  // ─────────────────────────────────────────────────────────────────────────────

  async softDelete(id: string) {
    const result = await db
      .update(notifications)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning()

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Preferences
  // ─────────────────────────────────────────────────────────────────────────────

  async getPreferences(userId: string) {
    const result = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Upsert Preferences
  // ─────────────────────────────────────────────────────────────────────────────

  async upsertPreferences(userId: string, data: {
    globalEnabled?: boolean
    quietHoursEnabled?: boolean
    quietHoursStart?: string
    quietHoursEnd?: string
    quietHoursTimezone?: string
    quietHoursAllowUrgent?: boolean
    categoryPreferences?: object
    emailDigestEnabled?: boolean
    emailDigestFrequency?: DigestFrequency
  }) {
    // Check if exists
    const existing = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1)

    if (existing.length > 0) {
      // Update
      const result = await db
        .update(notificationPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, userId))
        .returning()
      return result[0]
    } else {
      // Create
      const result = await db
        .insert(notificationPreferences)
        .values({ userId, ...data })
        .returning()
      return result[0]
    }
  }
}

// Export singleton
export const notificationRepository = new NotificationRepositoryClass()

// Export class for testing
export { NotificationRepositoryClass as NotificationRepository }
