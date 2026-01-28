// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - NOTIFICATION CONTROLLER
// HTTP request/response handling for notification operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import {
  notificationService,
  type UpdatePreferencesInput,
} from '../services/notification.service'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Notification Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class NotificationControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /notifications - Get notifications
  // ─────────────────────────────────────────────────────────────────────────────

  async getNotifications(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )
    const unreadOnly = query['unread'] === 'true'

    const result = await notificationService.getNotifications(userId, page, limit, unreadOnly)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /notifications/unread-count - Get unread count
  // ─────────────────────────────────────────────────────────────────────────────

  async getUnreadCount(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const result = await notificationService.getUnreadCount(userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /notifications/:id/read - Mark as read
  // ─────────────────────────────────────────────────────────────────────────────

  async markAsRead(c: Context<AppEnv>) {
    const notificationId = c.req.param('id')
    const userId = c.get('userId')!

    await notificationService.markAsRead(notificationId, userId)

    return c.json({
      success: true,
      data: { message: 'Notification marked as read' },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /notifications/read-all - Mark all as read
  // ─────────────────────────────────────────────────────────────────────────────

  async markAllAsRead(c: Context<AppEnv>) {
    const userId = c.get('userId')!

    await notificationService.markAllAsRead(userId)

    return c.json({
      success: true,
      data: { message: 'All notifications marked as read' },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /notifications/:id - Delete notification
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteNotification(c: Context<AppEnv>) {
    const notificationId = c.req.param('id')
    const userId = c.get('userId')!

    await notificationService.deleteNotification(notificationId, userId)

    return c.json({
      success: true,
      data: { message: 'Notification deleted' },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /notifications/preferences - Get preferences
  // ─────────────────────────────────────────────────────────────────────────────

  async getPreferences(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const preferences = await notificationService.getPreferences(userId)

    return c.json({
      success: true,
      data: preferences,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /notifications/preferences - Update preferences
  // ─────────────────────────────────────────────────────────────────────────────

  async updatePreferences(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const body = await c.req.json<UpdatePreferencesInput>()

    const preferences = await notificationService.updatePreferences(userId, body)

    return c.json({
      success: true,
      data: preferences,
    })
  }
}

// Export singleton
export const notificationController = new NotificationControllerClass()

// Export class for testing
export { NotificationControllerClass as NotificationController }
