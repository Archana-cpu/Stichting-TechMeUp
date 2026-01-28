// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - MISCELLANEOUS SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, integer, doublePrecision, json, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import {
  badgeCategoryEnum,
  badgeRarityEnum,
  xpTransactionTypeEnum,
  webhookEventTypeEnum,
  webhookDeliveryStatusEnum,
} from './enums'
import { users } from './users'
import { organizations } from './organizations'

// ─────────────────────────────────────────────────────────────────────────────
// Categories Table
// ─────────────────────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  name: varchar('name', { length: 50 }).notNull(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),

  description: varchar('description', { length: 200 }),
  iconName: varchar('iconName', { length: 50 }),
  color: varchar('color', { length: 7 }),

  parentId: text('parentId'),

  orderIndex: integer('orderIndex').default(0).notNull(),

  isActive: boolean('isActive').default(true).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('categories_parentId_idx').on(table.parentId),
  index('categories_slug_idx').on(table.slug),
])

// ─────────────────────────────────────────────────────────────────────────────
// User Gamification Table
// ─────────────────────────────────────────────────────────────────────────────

export const userGamification = pgTable('user_gamification', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),

  level: integer('level').default(1).notNull(),
  currentXp: integer('currentXp').default(0).notNull(),
  totalXp: integer('totalXp').default(0).notNull(),

  pollsCreated: integer('pollsCreated').default(0).notNull(),
  pollsParticipated: integer('pollsParticipated').default(0).notNull(),
  surveysCompleted: integer('surveysCompleted').default(0).notNull(),
  testsCompleted: integer('testsCompleted').default(0).notNull(),

  commentsWritten: integer('commentsWritten').default(0).notNull(),
  upvotesReceived: integer('upvotesReceived').default(0).notNull(),

  currentStreak: integer('currentStreak').default(0).notNull(),
  longestStreak: integer('longestStreak').default(0).notNull(),
  lastActivityDate: timestamp('lastActivityDate'),

  rank: integer('rank'),
  rankUpdatedAt: timestamp('rankUpdatedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('user_gamification_level_totalXp_idx').on(table.level, table.totalXp),
  index('user_gamification_rank_idx').on(table.rank),
])

// ─────────────────────────────────────────────────────────────────────────────
// Badges Table
// ─────────────────────────────────────────────────────────────────────────────

export const badges = pgTable('badges', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  code: varchar('code', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),

  iconUrl: text('iconUrl').notNull(),

  category: badgeCategoryEnum('category').notNull(),
  rarity: badgeRarityEnum('rarity').notNull(),

  xpReward: integer('xpReward').default(0).notNull(),

  criteria: json('criteria').notNull(),

  isSecret: boolean('isSecret').default(false).notNull(),
  isActive: boolean('isActive').default(true).notNull(),

  orderIndex: integer('orderIndex').default(0).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('badges_category_isActive_idx').on(table.category, table.isActive),
  index('badges_rarity_idx').on(table.rarity),
])

// ─────────────────────────────────────────────────────────────────────────────
// User Badges Table
// ─────────────────────────────────────────────────────────────────────────────

export const userBadges = pgTable('user_badges', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeId: text('badgeId').notNull().references(() => badges.id),
  gamificationId: text('gamificationId').notNull().references(() => userGamification.id),

  earnedAt: timestamp('earnedAt').defaultNow().notNull(),

  progress: json('progress').default({}).notNull(),

  isDisplayed: boolean('isDisplayed').default(false).notNull(),
  displayOrder: integer('displayOrder'),
}, (table) => [
  uniqueIndex('user_badges_userId_badgeId_idx').on(table.userId, table.badgeId),
  index('user_badges_gamificationId_idx').on(table.gamificationId),
  index('user_badges_badgeId_earnedAt_idx').on(table.badgeId, table.earnedAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// XP Transactions Table
// ─────────────────────────────────────────────────────────────────────────────

export const xpTransactions = pgTable('xp_transactions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  gamificationId: text('gamificationId').notNull().references(() => userGamification.id, { onDelete: 'cascade' }),

  amount: integer('amount').notNull(),
  type: xpTransactionTypeEnum('type').notNull(),

  source: varchar('source', { length: 50 }).notNull(),
  sourceId: text('sourceId'),

  description: varchar('description', { length: 200 }),

  balanceAfter: integer('balanceAfter').notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  index('xp_transactions_gamificationId_createdAt_idx').on(table.gamificationId, table.createdAt),
  index('xp_transactions_type_createdAt_idx').on(table.type, table.createdAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Webhook Endpoints Table
// ─────────────────────────────────────────────────────────────────────────────

export const webhookEndpoints = pgTable('webhook_endpoints', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  url: text('url').notNull(),

  secretEncrypted: varchar('secretEncrypted', { length: 255 }).notNull(),
  secretIv: varchar('secretIv', { length: 32 }).notNull(),
  secretTag: varchar('secretTag', { length: 32 }).notNull(),

  events: webhookEventTypeEnum('events').array().notNull(),

  isActive: boolean('isActive').default(true).notNull(),

  customHeaders: json('customHeaders').default({}).notNull(),
  customHeadersEncrypted: text('customHeadersEncrypted'),

  maxRetries: integer('maxRetries').default(3).notNull(),
  initialDelayMs: integer('initialDelayMs').default(5000).notNull(),
  maxDelayMs: integer('maxDelayMs').default(300000).notNull(),
  backoffMultiplier: doublePrecision('backoffMultiplier').default(2).notNull(),

  maxPerMinute: integer('maxPerMinute').default(60).notNull(),
  maxPerHour: integer('maxPerHour').default(500).notNull(),

  metadata: json('metadata').default({}).notNull(),

  lastTriggeredAt: timestamp('lastTriggeredAt'),
  lastSuccessAt: timestamp('lastSuccessAt'),
  lastFailureAt: timestamp('lastFailureAt'),
  consecutiveFailures: integer('consecutiveFailures').default(0).notNull(),

  disabledAt: timestamp('disabledAt'),
  disabledReason: text('disabledReason'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('webhook_endpoints_organizationId_isActive_idx').on(table.organizationId, table.isActive),
  index('webhook_endpoints_isActive_consecutiveFailures_idx').on(table.isActive, table.consecutiveFailures),
])

// ─────────────────────────────────────────────────────────────────────────────
// Webhook Deliveries Table
// ─────────────────────────────────────────────────────────────────────────────

export const webhookDeliveries = pgTable('webhook_deliveries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  webhookEndpointId: text('webhookEndpointId').notNull().references(() => webhookEndpoints.id, { onDelete: 'cascade' }),

  event: webhookEventTypeEnum('event').notNull(),
  payload: json('payload').notNull(),

  status: webhookDeliveryStatusEnum('status').default('PENDING').notNull(),

  attempts: json('attempts').default([]).notNull(),
  attemptCount: integer('attemptCount').default(0).notNull(),

  nextRetryAt: timestamp('nextRetryAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('webhook_deliveries_webhookEndpointId_status_idx').on(table.webhookEndpointId, table.status),
  index('webhook_deliveries_status_nextRetryAt_idx').on(table.status, table.nextRetryAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Runtime Config Table
// ─────────────────────────────────────────────────────────────────────────────

export const runtimeConfigs = pgTable('runtime_configs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  key: varchar('key', { length: 255 }).unique().notNull(),
  value: json('value').notNull(),

  description: varchar('description', { length: 500 }),
  active: boolean('active').default(true).notNull(),

  experimentId: varchar('experimentId', { length: 64 }),
  variant: varchar('variant', { length: 50 }),

  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedBy: text('updatedBy'),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('runtime_configs_key_active_idx').on(table.key, table.active),
  index('runtime_configs_experimentId_idx').on(table.experimentId),
])


// ─────────────────────────────────────────────────────────────────────────────
// Consent Policies Table
// ─────────────────────────────────────────────────────────────────────────────

export const consentPolicies = pgTable('consent_policies', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  version: varchar('version', { length: 20 }).unique().notNull(),
  versionType: varchar('versionType', { length: 10 }).notNull(),

  effectiveDate: timestamp('effectiveDate').notNull(),
  expiryDate: timestamp('expiryDate'),

  privacyPolicyUrl: varchar('privacyPolicyUrl', { length: 500 }).notNull(),
  termsUrl: varchar('termsUrl', { length: 500 }).notNull(),
  cookiePolicyUrl: varchar('cookiePolicyUrl', { length: 500 }),

  consentFormHash: varchar('consentFormHash', { length: 64 }).notNull(),
  changeSummary: varchar('changeSummary', { length: 1000 }).notNull(),
  changesJson: json('changesJson').default([]).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  createdBy: text('createdBy').notNull(),
}, (table) => [
  index('consent_policies_effectiveDate_idx').on(table.effectiveDate),
  index('consent_policies_version_idx').on(table.version),
])

// ─────────────────────────────────────────────────────────────────────────────
// User Consents Table
// ─────────────────────────────────────────────────────────────────────────────

export const userConsents = pgTable('user_consents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  policyId: text('policyId').notNull().references(() => consentPolicies.id),

  grantedAt: timestamp('grantedAt').defaultNow().notNull(),
  withdrawnAt: timestamp('withdrawnAt'),

  ipAddress: varchar('ipAddress', { length: 45 }),
  userAgent: varchar('userAgent', { length: 500 }),
  consentMethod: varchar('consentMethod', { length: 20 }).notNull(),

  isActive: boolean('isActive').default(true).notNull(),
}, (table) => [
  uniqueIndex('user_consents_userId_policyId_idx').on(table.userId, table.policyId),
  index('user_consents_userId_isActive_idx').on(table.userId, table.isActive),
  index('user_consents_policyId_idx').on(table.policyId),
])
