// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - NOTIFICATION SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, integer, json, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import {
  notificationTypeEnum,
  notificationCategoryEnum,
  notificationPriorityEnum,
  notificationStatusEnum,
  actorTypeEnum,
  resourceTypeEnum,
  digestFrequencyEnum,
  pushPlatformEnum,
} from './enums'
import { users } from './users'

// ─────────────────────────────────────────────────────────────────────────────
// Notifications Table
// ─────────────────────────────────────────────────────────────────────────────

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  type: notificationTypeEnum('type').notNull(),
  category: notificationCategoryEnum('category').notNull(),
  priority: notificationPriorityEnum('priority').notNull(),

  title: varchar('title', { length: 100 }).notNull(),
  body: varchar('body', { length: 500 }).notNull(),

  actorId: text('actorId'),
  actorType: actorTypeEnum('actorType').notNull(),
  actorName: text('actorName'),
  actorAvatarUrl: text('actorAvatarUrl'),

  resourceId: text('resourceId'),
  resourceType: resourceTypeEnum('resourceType'),
  resourceTitle: text('resourceTitle'),

  actionUrl: text('actionUrl'),
  actionLabel: text('actionLabel'),
  imageUrl: text('imageUrl'),

  aggregationId: text('aggregationId'),
  aggregatedCount: integer('aggregatedCount').default(1).notNull(),

  metadata: json('metadata').default({}).notNull(),

  status: notificationStatusEnum('status').default('UNREAD').notNull(),
  readAt: timestamp('readAt'),
  archivedAt: timestamp('archivedAt'),
  deletedAt: timestamp('deletedAt'),

  expiresAt: timestamp('expiresAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('notifications_userId_status_createdAt_idx').on(table.userId, table.status, table.createdAt),
  index('notifications_userId_category_status_idx').on(table.userId, table.category, table.status),
  index('notifications_userId_type_status_idx').on(table.userId, table.type, table.status),
  index('notifications_userId_priority_createdAt_idx').on(table.userId, table.priority, table.createdAt),
  index('notifications_resourceType_resourceId_idx').on(table.resourceType, table.resourceId),
  index('notifications_aggregationId_idx').on(table.aggregationId),
  index('notifications_expiresAt_idx').on(table.expiresAt),
  index('notifications_deletedAt_idx').on(table.deletedAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Notification Aggregations Table
// ─────────────────────────────────────────────────────────────────────────────

export const notificationAggregations = pgTable('notification_aggregations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  aggregationKey: text('aggregationKey').unique().notNull(),
  type: notificationTypeEnum('type').notNull(),
  targetId: text('targetId').notNull(),
  resourceId: text('resourceId'),

  actorIds: text('actorIds').array().notNull(),
  actorCount: integer('actorCount').notNull(),
  firstActorId: text('firstActorId').notNull(),
  lastActorId: text('lastActorId').notNull(),

  metadata: json('metadata').default({}).notNull(),

  windowStart: timestamp('windowStart').notNull(),
  windowEnd: timestamp('windowEnd').notNull(),

  isDelivered: boolean('isDelivered').default(false).notNull(),
  deliveredAt: timestamp('deliveredAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('notification_aggregations_targetId_type_windowStart_idx').on(table.targetId, table.type, table.windowStart),
])

// ─────────────────────────────────────────────────────────────────────────────
// Notification Preferences Table
// ─────────────────────────────────────────────────────────────────────────────

export const notificationPreferences = pgTable('notification_preferences', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),

  globalEnabled: boolean('globalEnabled').default(true).notNull(),

  quietHoursEnabled: boolean('quietHoursEnabled').default(false).notNull(),
  quietHoursStart: varchar('quietHoursStart', { length: 5 }).default('22:00').notNull(),
  quietHoursEnd: varchar('quietHoursEnd', { length: 5 }).default('08:00').notNull(),
  quietHoursTimezone: varchar('quietHoursTimezone', { length: 50 }).default('Europe/Istanbul').notNull(),
  quietHoursAllowUrgent: boolean('quietHoursAllowUrgent').default(true).notNull(),

  categoryPreferences: json('categoryPreferences').default({}).notNull(),
  typeOverrides: json('typeOverrides').default({}).notNull(),

  emailDigestEnabled: boolean('emailDigestEnabled').default(false).notNull(),
  emailDigestFrequency: digestFrequencyEnum('emailDigestFrequency').default('DAILY').notNull(),
  emailDigestDay: integer('emailDigestDay').default(1).notNull(),
  emailDigestTime: varchar('emailDigestTime', { length: 5 }).default('09:00').notNull(),

  mutedUserIds: text('mutedUserIds').array().default([]),
  mutedOrgIds: text('mutedOrgIds').array().default([]),
  mutedContentIds: text('mutedContentIds').array().default([]),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Push Tokens Table
// ─────────────────────────────────────────────────────────────────────────────

export const pushTokens = pgTable('push_tokens', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  platform: pushPlatformEnum('platform').notNull(),
  token: varchar('token', { length: 4096 }).notNull(),
  deviceId: text('deviceId').notNull(),
  deviceName: varchar('deviceName', { length: 100 }),
  deviceModel: varchar('deviceModel', { length: 100 }),
  osVersion: varchar('osVersion', { length: 50 }),
  appVersion: varchar('appVersion', { length: 50 }),

  isActive: boolean('isActive').default(true).notNull(),
  lastUsedAt: timestamp('lastUsedAt').defaultNow().notNull(),

  failureCount: integer('failureCount').default(0).notNull(),
  lastFailureAt: timestamp('lastFailureAt'),
  lastFailureReason: text('lastFailureReason'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('push_tokens_userId_deviceId_platform_idx').on(table.userId, table.deviceId, table.platform),
  index('push_tokens_userId_isActive_idx').on(table.userId, table.isActive),
  index('push_tokens_token_idx').on(table.token),
])
