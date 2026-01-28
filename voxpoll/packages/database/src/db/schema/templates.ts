// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - TEMPLATES & JOBS SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, integer, json, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { organizations } from './organizations'

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const templateTypeEnum = pgEnum('TemplateType', [
  'POLL',
  'SURVEY',
  'TEST',
])

export const templateVisibilityEnum = pgEnum('TemplateVisibility', [
  'PRIVATE',
  'ORGANIZATION',
  'PUBLIC',
])

export const jobTypeEnum = pgEnum('JobType', [
  'PUBLISH_POLL',
  'CLOSE_POLL',
  'PUBLISH_SURVEY',
  'CLOSE_SURVEY',
  'PUBLISH_TEST',
  'SEND_REMINDER',
  'SEND_DIGEST',
  'CLEANUP_EXPIRED',
])

export const jobStatusEnum = pgEnum('JobStatus', [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
])

export const exportFormatEnum = pgEnum('ExportFormat', [
  'JSON',
  'CSV',
  'XLSX',
  'PDF',
])

export const exportStatusEnum = pgEnum('ExportStatus', [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'EXPIRED',
])

export const exportEntityTypeEnum = pgEnum('ExportEntityType', [
  'POLL',
  'POLL_RESPONSES',
  'SURVEY',
  'SURVEY_RESPONSES',
  'TEST',
  'TEST_RESULTS',
  'ANALYTICS',
  'USER_DATA',
])

// ─────────────────────────────────────────────────────────────────────────────
// Poll Templates Table
// ─────────────────────────────────────────────────────────────────────────────

export const pollTemplates = pgTable('poll_templates', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  creatorId: text('creatorId').notNull().references(() => users.id),
  organizationId: text('organizationId').references(() => organizations.id),

  name: varchar('name', { length: 200 }).notNull(),
  description: varchar('description', { length: 1000 }),

  templateType: templateTypeEnum('templateType').default('POLL').notNull(),
  visibility: templateVisibilityEnum('visibility').default('PRIVATE').notNull(),

  // Template content (poll structure)
  title: varchar('title', { length: 200 }),
  pollDescription: varchar('pollDescription', { length: 2000 }),
  options: json('options').default([]).notNull(),
  settings: json('settings').default({}).notNull(),

  // Metadata
  category: varchar('category', { length: 100 }),
  tags: text('tags').array().default([]),
  thumbnailUrl: text('thumbnailUrl'),

  // Stats
  usageCount: integer('usageCount').default(0).notNull(),
  lastUsedAt: timestamp('lastUsedAt'),

  // Flags
  isFeatured: boolean('isFeatured').default(false).notNull(),
  isActive: boolean('isActive').default(true).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('poll_templates_creatorId_idx').on(table.creatorId),
  index('poll_templates_organizationId_idx').on(table.organizationId),
  index('poll_templates_visibility_isActive_idx').on(table.visibility, table.isActive),
  index('poll_templates_category_idx').on(table.category),
  index('poll_templates_isFeatured_usageCount_idx').on(table.isFeatured, table.usageCount),
])

// ─────────────────────────────────────────────────────────────────────────────
// Poll Template Usages Table
// ─────────────────────────────────────────────────────────────────────────────

export const pollTemplateUsages = pgTable('poll_template_usages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  templateId: text('templateId').notNull().references(() => pollTemplates.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id),

  // Created content reference
  contentType: templateTypeEnum('contentType').notNull(),
  contentId: text('contentId').notNull(),

  usedAt: timestamp('usedAt').defaultNow().notNull(),
}, (table) => [
  index('poll_template_usages_templateId_idx').on(table.templateId),
  index('poll_template_usages_userId_idx').on(table.userId),
  index('poll_template_usages_contentType_contentId_idx').on(table.contentType, table.contentId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Share Link Views Table (Detailed tracking)
// ─────────────────────────────────────────────────────────────────────────────

export const shareLinkViews = pgTable('share_link_views', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  linkId: text('linkId').notNull(),

  viewedAt: timestamp('viewedAt').defaultNow().notNull(),

  // Visitor info (anonymized)
  ipHash: varchar('ipHash', { length: 64 }),
  userAgent: varchar('userAgent', { length: 500 }),
  referrer: varchar('referrer', { length: 500 }),

  // Geo (from IP)
  country: varchar('country', { length: 2 }),
  region: varchar('region', { length: 100 }),

  // Conversion tracking
  participated: boolean('participated').default(false).notNull(),
  participatedAt: timestamp('participatedAt'),

  // User reference (if authenticated)
  userId: text('userId'),
}, (table) => [
  index('share_link_views_linkId_viewedAt_idx').on(table.linkId, table.viewedAt),
  index('share_link_views_linkId_participated_idx').on(table.linkId, table.participated),
  index('share_link_views_country_idx').on(table.country),
])

// ─────────────────────────────────────────────────────────────────────────────
// Scheduled Jobs Table
// ─────────────────────────────────────────────────────────────────────────────

export const scheduledJobs = pgTable('scheduled_jobs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  jobType: jobTypeEnum('jobType').notNull(),

  // Target entity
  entityType: varchar('entityType', { length: 50 }).notNull(),
  entityId: text('entityId').notNull(),

  // Scheduling
  scheduledFor: timestamp('scheduledFor').notNull(),
  timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),

  // Execution
  status: jobStatusEnum('status').default('PENDING').notNull(),
  startedAt: timestamp('startedAt'),
  completedAt: timestamp('completedAt'),

  // Error handling
  error: text('error'),
  retryCount: integer('retryCount').default(0).notNull(),
  maxRetries: integer('maxRetries').default(3).notNull(),
  lastRetryAt: timestamp('lastRetryAt'),

  // Metadata
  payload: json('payload').default({}).notNull(),
  result: json('result'),

  // Creator
  createdBy: text('createdBy').notNull().references(() => users.id),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('scheduled_jobs_status_scheduledFor_idx').on(table.status, table.scheduledFor),
  index('scheduled_jobs_entityType_entityId_idx').on(table.entityType, table.entityId),
  index('scheduled_jobs_jobType_status_idx').on(table.jobType, table.status),
  index('scheduled_jobs_createdBy_idx').on(table.createdBy),
])

// ─────────────────────────────────────────────────────────────────────────────
// Data Exports Table
// ─────────────────────────────────────────────────────────────────────────────

export const dataExports = pgTable('data_exports', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  userId: text('userId').notNull().references(() => users.id),
  organizationId: text('organizationId').references(() => organizations.id),

  // Export target
  entityType: exportEntityTypeEnum('entityType').notNull(),
  entityId: text('entityId'),

  // Export config
  format: exportFormatEnum('format').notNull(),
  filters: json('filters').default({}).notNull(),
  columns: text('columns').array(),

  // Status
  status: exportStatusEnum('status').default('PENDING').notNull(),

  // Progress
  totalRecords: integer('totalRecords'),
  processedRecords: integer('processedRecords').default(0).notNull(),

  // Output
  fileUrl: text('fileUrl'),
  fileSize: integer('fileSize'),
  fileName: varchar('fileName', { length: 255 }),

  // Error
  error: text('error'),

  // Expiration
  expiresAt: timestamp('expiresAt'),

  // Timestamps
  startedAt: timestamp('startedAt'),
  completedAt: timestamp('completedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  index('data_exports_userId_status_idx').on(table.userId, table.status),
  index('data_exports_entityType_entityId_idx').on(table.entityType, table.entityId),
  index('data_exports_status_createdAt_idx').on(table.status, table.createdAt),
  index('data_exports_expiresAt_idx').on(table.expiresAt),
])
