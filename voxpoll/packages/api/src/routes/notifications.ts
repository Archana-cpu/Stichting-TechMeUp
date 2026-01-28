// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - NOTIFICATION ROUTES
// Route definitions with controller delegation
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth } from '../middleware/auth'
import { notificationController } from '../controllers/notification.controller'
import {
  updateNotificationPreferencesSchema,
  listNotificationsSchema,
} from '../validators/notification.validators'
import type { AppEnv } from '../types'

export const notificationRoutes = new Hono<AppEnv>()

// All notification routes require authentication
notificationRoutes.use('*', auth)

// ─────────────────────────────────────────────────────────────────────────────
// Notification Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /notifications - Get notifications
notificationRoutes.get(
  '/',
  zValidator('query', listNotificationsSchema),
  (c) => notificationController.getNotifications(c)
)

// GET /notifications/unread-count - Get unread count
notificationRoutes.get(
  '/unread-count',
  (c) => notificationController.getUnreadCount(c)
)

// POST /notifications/:id/read - Mark as read
notificationRoutes.post(
  '/:id/read',
  (c) => notificationController.markAsRead(c)
)

// POST /notifications/read-all - Mark all as read
notificationRoutes.post(
  '/read-all',
  (c) => notificationController.markAllAsRead(c)
)

// DELETE /notifications/:id - Delete notification
notificationRoutes.delete(
  '/:id',
  (c) => notificationController.deleteNotification(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Preference Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /notifications/preferences - Get preferences
notificationRoutes.get(
  '/preferences',
  (c) => notificationController.getPreferences(c)
)

// PATCH /notifications/preferences - Update preferences
notificationRoutes.patch(
  '/preferences',
  zValidator('json', updateNotificationPreferencesSchema),
  (c) => notificationController.updatePreferences(c)
)
