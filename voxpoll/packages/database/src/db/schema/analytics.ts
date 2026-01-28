// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - ANALYTICS & FEED SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, integer, doublePrecision, json, index, uniqueIndex, bigint } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import {
  contentViewTypeEnum,
  viewSourceEnum,
  feedEventTypeEnum,
  savedSearchNotifyFreqEnum,
  preTestContentTypeEnum,
  privateLinkContentTypeEnum,
  privateLinkStatusEnum,
  sponsoredContentTypeEnum,
  campaignStatusEnum,
  rateLimitTypeEnum,
  eventSeverityEnum,
  actorTypeEnum,
  deviceCategoryEnum,
  profileVisitSourceEnum,
} from './enums'
import { users } from './users'
import { organizations } from './organizations'

// ─────────────────────────────────────────────────────────────────────────────
// User Interest Profiles Table
// ─────────────────────────────────────────────────────────────────────────────

export const userInterestProfiles = pgTable('user_interest_profiles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),

  categoryScores: json('categoryScores').default({}).notNull(),
  tagScores: json('tagScores').default({}).notNull(),
  creatorScores: json('creatorScores').default({}).notNull(),

  preferredContentTypes: json('preferredContentTypes').default([]).notNull(),

  avgSessionDuration: doublePrecision('avgSessionDuration'),
  avgContentPerSession: doublePrecision('avgContentPerSession'),
  peakActivityHours: integer('peakActivityHours').array().default([]),

  lastCalculatedAt: timestamp('lastCalculatedAt').defaultNow().notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Content Views Table
// ─────────────────────────────────────────────────────────────────────────────

export const contentViews = pgTable('content_views', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  userId: text('userId'),
  sessionId: text('sessionId'),

  contentType: contentViewTypeEnum('contentType').notNull(),
  contentId: text('contentId').notNull(),

  source: viewSourceEnum('source').notNull(),

  viewedAt: timestamp('viewedAt').defaultNow().notNull(),
  dwellTimeMs: integer('dwellTimeMs'),

  interacted: boolean('interacted').default(false).notNull(),
  interactionType: text('interactionType'),
}, (table) => [
  index('content_views_contentType_contentId_viewedAt_idx').on(table.contentType, table.contentId, table.viewedAt),
  index('content_views_userId_viewedAt_idx').on(table.userId, table.viewedAt),
  index('content_views_sessionId_idx').on(table.sessionId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Trending Content Table
// ─────────────────────────────────────────────────────────────────────────────

export const trendingContent = pgTable('trending_content', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  contentType: contentViewTypeEnum('contentType').notNull(),
  contentId: text('contentId').notNull(),
  categoryId: text('categoryId'),

  trendingScore: doublePrecision('trendingScore').notNull(),
  velocity: doublePrecision('velocity').notNull(),
  acceleration: doublePrecision('acceleration').notNull(),

  viewCount: integer('viewCount').default(0).notNull(),
  participationCount: integer('participationCount').default(0).notNull(),
  commentCount: integer('commentCount').default(0).notNull(),
  shareCount: integer('shareCount').default(0).notNull(),

  windowStart: timestamp('windowStart').notNull(),
  windowEnd: timestamp('windowEnd').notNull(),

  rank: integer('rank'),
  previousRank: integer('previousRank'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('trending_content_contentType_contentId_windowStart_idx').on(table.contentType, table.contentId, table.windowStart),
  index('trending_content_windowStart_trendingScore_idx').on(table.windowStart, table.trendingScore),
  index('trending_content_categoryId_windowStart_trendingScore_idx').on(table.categoryId, table.windowStart, table.trendingScore),
])

// ─────────────────────────────────────────────────────────────────────────────
// Search History Table
// ─────────────────────────────────────────────────────────────────────────────

export const searchHistories = pgTable('search_histories', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  query: varchar('query', { length: 200 }).notNull(),
  normalizedQuery: varchar('normalizedQuery', { length: 200 }).notNull(),

  resultCount: integer('resultCount').notNull(),
  clickedResults: json('clickedResults').default([]).notNull(),

  filters: json('filters').default({}).notNull(),

  searchedAt: timestamp('searchedAt').defaultNow().notNull(),
}, (table) => [
  index('search_histories_userId_searchedAt_idx').on(table.userId, table.searchedAt),
  index('search_histories_normalizedQuery_idx').on(table.normalizedQuery),
])

// ─────────────────────────────────────────────────────────────────────────────
// Popular Searches Table
// ─────────────────────────────────────────────────────────────────────────────

export const popularSearches = pgTable('popular_searches', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  query: varchar('query', { length: 200 }).unique().notNull(),

  searchCount: integer('searchCount').default(0).notNull(),
  uniqueUserCount: integer('uniqueUserCount').default(0).notNull(),

  lastSearchedAt: timestamp('lastSearchedAt').notNull(),

  trendingScore: doublePrecision('trendingScore').default(0).notNull(),

  isPromoted: boolean('isPromoted').default(false).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('popular_searches_trendingScore_idx').on(table.trendingScore),
  index('popular_searches_searchCount_idx').on(table.searchCount),
])

// ─────────────────────────────────────────────────────────────────────────────
// Saved Searches Table
// ─────────────────────────────────────────────────────────────────────────────

export const savedSearches = pgTable('saved_searches', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 100 }).notNull(),
  query: varchar('query', { length: 200 }).notNull(),
  filters: json('filters').default({}).notNull(),

  notificationsEnabled: boolean('notificationsEnabled').default(false).notNull(),
  notificationFrequency: savedSearchNotifyFreqEnum('notificationFrequency').default('DAILY').notNull(),

  lastExecutedAt: timestamp('lastExecutedAt'),
  newResultCount: integer('newResultCount').default(0).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('saved_searches_userId_idx').on(table.userId),
  index('saved_searches_notificationsEnabled_notificationFrequency_idx').on(table.notificationsEnabled, table.notificationFrequency),
])

// ─────────────────────────────────────────────────────────────────────────────
// Feed Events Table
// ─────────────────────────────────────────────────────────────────────────────

export const feedEvents = pgTable('feed_events', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  contentType: contentViewTypeEnum('contentType').notNull(),
  contentId: text('contentId').notNull(),

  eventType: feedEventTypeEnum('eventType').notNull(),
  feedType: viewSourceEnum('feedType').notNull(),

  position: integer('position'),
  metadata: json('metadata').default({}).notNull(),

  occurredAt: timestamp('occurredAt').defaultNow().notNull(),
}, (table) => [
  index('feed_events_userId_occurredAt_idx').on(table.userId, table.occurredAt),
  index('feed_events_contentId_idx').on(table.contentId),
  index('feed_events_eventType_idx').on(table.eventType),
])

// ─────────────────────────────────────────────────────────────────────────────
// Pre-Test Results Table
// ─────────────────────────────────────────────────────────────────────────────

export const preTestResults = pgTable('pre_test_results', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  contentType: preTestContentTypeEnum('contentType').notNull(),
  contentId: text('contentId').notNull(),

  userId: text('userId'),
  sessionId: text('sessionId'),

  answers: json('answers').notNull(),
  score: doublePrecision('score').notNull(),
  passed: boolean('passed').notNull(),

  attemptNumber: integer('attemptNumber').default(1).notNull(),

  completedAt: timestamp('completedAt').defaultNow().notNull(),
}, (table) => [
  index('pre_test_results_contentType_contentId_idx').on(table.contentType, table.contentId),
  index('pre_test_results_userId_idx').on(table.userId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Private Links Table
// ─────────────────────────────────────────────────────────────────────────────

export const privateLinks = pgTable('private_links', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  contentType: privateLinkContentTypeEnum('contentType').notNull(),
  contentId: text('contentId').notNull(),

  code: varchar('code', { length: 16 }).unique().notNull(),

  creatorId: text('creatorId').notNull().references(() => users.id),

  expiresAt: timestamp('expiresAt'),
  maxUses: integer('maxUses'),
  currentUses: integer('currentUses').default(0).notNull(),

  requireAuth: boolean('requireAuth').default(false).notNull(),
  allowAnonymous: boolean('allowAnonymous').default(true).notNull(),
  password: varchar('password', { length: 255 }),
  trackViews: boolean('trackViews').default(true).notNull(),

  totalViews: integer('totalViews').default(0).notNull(),
  uniqueViews: integer('uniqueViews').default(0).notNull(),
  participations: integer('participations').default(0).notNull(),
  lastAccessedAt: timestamp('lastAccessedAt'),

  status: privateLinkStatusEnum('status').default('ACTIVE').notNull(),
  isActive: boolean('isActive').default(true).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('private_links_contentType_contentId_idx').on(table.contentType, table.contentId),
  index('private_links_code_idx').on(table.code),
  index('private_links_creatorId_idx').on(table.creatorId),
  index('private_links_status_idx').on(table.status),
])

// ─────────────────────────────────────────────────────────────────────────────
// Sponsored Campaigns Table
// ─────────────────────────────────────────────────────────────────────────────

export const sponsoredCampaigns = pgTable('sponsored_campaigns', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organizationId').notNull().references(() => organizations.id),

  name: varchar('name', { length: 200 }).notNull(),

  contentType: sponsoredContentTypeEnum('contentType').notNull(),
  contentId: text('contentId').notNull(),

  status: campaignStatusEnum('status').default('DRAFT').notNull(),

  budget: doublePrecision('budget').notNull(),
  spentAmount: doublePrecision('spentAmount').default(0).notNull(),
  costPerImpression: doublePrecision('costPerImpression').notNull(),
  costPerParticipation: doublePrecision('costPerParticipation').notNull(),

  targeting: json('targeting').default({}).notNull(),

  startsAt: timestamp('startsAt').notNull(),
  endsAt: timestamp('endsAt').notNull(),

  impressions: integer('impressions').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  participations: integer('participations').default(0).notNull(),
  ctr: doublePrecision('ctr').default(0).notNull(),
  participationRate: doublePrecision('participationRate').default(0).notNull(),

  dailyBudgetLimit: doublePrecision('dailyBudgetLimit'),
  dailySpent: doublePrecision('dailySpent').default(0).notNull(),
  lastDailyReset: timestamp('lastDailyReset'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('sponsored_campaigns_organizationId_status_idx').on(table.organizationId, table.status),
  index('sponsored_campaigns_status_startsAt_endsAt_idx').on(table.status, table.startsAt, table.endsAt),
  index('sponsored_campaigns_contentType_contentId_idx').on(table.contentType, table.contentId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Analytics Time Buckets Table
// ─────────────────────────────────────────────────────────────────────────────

export const analyticsTimeBuckets = pgTable('analytics_time_buckets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  contentType: contentViewTypeEnum('contentType').notNull(),
  contentId: text('contentId').notNull(),

  bucketStart: timestamp('bucketStart').notNull(),
  bucketEnd: timestamp('bucketEnd').notNull(),

  voteCount: integer('voteCount').default(0).notNull(),
  uniqueVoters: integer('uniqueVoters').default(0).notNull(),
  optionBreakdown: json('optionBreakdown').default({}).notNull(),

  viewCount: integer('viewCount').default(0).notNull(),
  shareCount: integer('shareCount').default(0).notNull(),
  commentCount: integer('commentCount').default(0).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('analytics_time_buckets_contentType_contentId_bucketStart_idx').on(table.contentType, table.contentId, table.bucketStart),
  index('analytics_time_buckets_bucketStart_idx').on(table.bucketStart),
  index('analytics_time_buckets_contentType_bucketStart_idx').on(table.contentType, table.bucketStart),
  index('analytics_time_buckets_contentId_bucketStart_idx').on(table.contentId, table.bucketStart),
])

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit Entries Table
// ─────────────────────────────────────────────────────────────────────────────

export const rateLimitEntries = pgTable('rate_limit_entries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  identifier: varchar('identifier', { length: 255 }).notNull(),
  endpoint: varchar('endpoint', { length: 100 }).notNull(),

  windowStart: timestamp('windowStart').notNull(),
  requestCount: integer('requestCount').default(1).notNull(),

  limitType: rateLimitTypeEnum('limitType').default('IP').notNull(),
  isBlocked: boolean('isBlocked').default(false).notNull(),
  blockedUntil: timestamp('blockedUntil'),
  blockReason: text('blockReason'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
}, (table) => [
  uniqueIndex('rate_limit_entries_identifier_endpoint_windowStart_idx').on(table.identifier, table.endpoint, table.windowStart),
  index('rate_limit_entries_identifier_windowStart_idx').on(table.identifier, table.windowStart),
  index('rate_limit_entries_expiresAt_idx').on(table.expiresAt),
  index('rate_limit_entries_isBlocked_blockedUntil_idx').on(table.isBlocked, table.blockedUntil),
])

// ─────────────────────────────────────────────────────────────────────────────
// Hourly Poll Stats Table
// ─────────────────────────────────────────────────────────────────────────────

export const hourlyPollStats = pgTable('hourly_poll_stats', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  pollId: text('pollId').notNull(),
  hour: timestamp('hour').notNull(),

  responseCount: integer('responseCount').default(0).notNull(),
  uniqueParticipants: integer('uniqueParticipants').default(0).notNull(),
  avgDurationSeconds: doublePrecision('avgDurationSeconds'),
  validCount: integer('validCount').default(0).notNull(),
  invalidCount: integer('invalidCount').default(0).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('hourly_poll_stats_pollId_hour_idx').on(table.pollId, table.hour),
  index('hourly_poll_stats_hour_idx').on(table.hour),
  index('hourly_poll_stats_pollId_hour_idx2').on(table.pollId, table.hour),
])

// ─────────────────────────────────────────────────────────────────────────────
// Hourly Survey Stats Table
// ─────────────────────────────────────────────────────────────────────────────

export const hourlySurveyStats = pgTable('hourly_survey_stats', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  surveyId: text('surveyId').notNull(),
  hour: timestamp('hour').notNull(),

  responseCount: integer('responseCount').default(0).notNull(),
  completedCount: integer('completedCount').default(0).notNull(),
  abandonedCount: integer('abandonedCount').default(0).notNull(),
  avgCompletionTime: doublePrecision('avgCompletionTime'),
  avgQualityScore: doublePrecision('avgQualityScore'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('hourly_survey_stats_surveyId_hour_idx').on(table.surveyId, table.hour),
  index('hourly_survey_stats_hour_idx').on(table.hour),
  index('hourly_survey_stats_surveyId_hour_idx2').on(table.surveyId, table.hour),
])

// ─────────────────────────────────────────────────────────────────────────────
// Audit Logs Table
// ─────────────────────────────────────────────────────────────────────────────

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  actorId: text('actorId'),
  actorType: actorTypeEnum('actorType').notNull(),

  action: varchar('action', { length: 100 }).notNull(),

  entityType: varchar('entityType', { length: 50 }).notNull(),
  entityId: text('entityId').notNull(),

  changes: json('changes').default({}).notNull(),
  previousState: json('previousState'),
  newState: json('newState'),

  ipAddress: varchar('ipAddress', { length: 45 }),
  userAgent: varchar('userAgent', { length: 500 }),

  metadata: json('metadata').default({}).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  index('audit_logs_actorId_createdAt_idx').on(table.actorId, table.createdAt),
  index('audit_logs_entityType_entityId_createdAt_idx').on(table.entityType, table.entityId, table.createdAt),
  index('audit_logs_action_createdAt_idx').on(table.action, table.createdAt),
  index('audit_logs_createdAt_idx').on(table.createdAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// System Events Table
// ─────────────────────────────────────────────────────────────────────────────

export const systemEvents = pgTable('system_events', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  eventType: varchar('eventType', { length: 100 }).notNull(),
  severity: eventSeverityEnum('severity').notNull(),

  source: varchar('source', { length: 100 }).notNull(),

  message: varchar('message', { length: 1000 }).notNull(),

  details: json('details').default({}).notNull(),

  stackTrace: text('stackTrace'),

  correlationId: varchar('correlationId', { length: 64 }),

  resolvedAt: timestamp('resolvedAt'),
  resolvedBy: text('resolvedBy'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  index('system_events_eventType_severity_createdAt_idx').on(table.eventType, table.severity, table.createdAt),
  index('system_events_severity_createdAt_idx').on(table.severity, table.createdAt),
  index('system_events_correlationId_idx').on(table.correlationId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Anonymous Participations Table
// ─────────────────────────────────────────────────────────────────────────────

export const anonymousParticipations = pgTable('anonymous_participations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  anonymousToken: varchar('anonymousToken', { length: 64 }).unique().notNull(),
  ipHash: varchar('ipHash', { length: 64 }).notNull(),

  deviceCategory: deviceCategoryEnum('deviceCategory').default('UNKNOWN').notNull(),

  contentType: privateLinkContentTypeEnum('contentType').notNull(),
  contentId: text('contentId').notNull(),

  participatedAt: timestamp('participatedAt').defaultNow().notNull(),

  convertedToUserId: text('convertedToUserId'),
  convertedAt: timestamp('convertedAt'),

  qualityScore: doublePrecision('qualityScore'),
}, (table) => [
  index('anonymous_participations_contentType_contentId_idx').on(table.contentType, table.contentId),
  index('anonymous_participations_anonymousToken_idx').on(table.anonymousToken),
  index('anonymous_participations_convertedToUserId_idx').on(table.convertedToUserId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Population Datasets Table
// ─────────────────────────────────────────────────────────────────────────────

export const populationDatasets = pgTable('population_datasets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  countryCode: varchar('countryCode', { length: 2 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  source: varchar('source', { length: 200 }).notNull(),
  sourceUrl: varchar('sourceUrl', { length: 500 }),
  year: integer('year').notNull(),
  version: integer('version').default(1).notNull(),

  isActive: boolean('isActive').default(false).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  createdBy: text('createdBy').notNull(),
}, (table) => [
  uniqueIndex('population_datasets_countryCode_year_version_idx').on(table.countryCode, table.year, table.version),
  index('population_datasets_countryCode_isActive_idx').on(table.countryCode, table.isActive),
])

// ─────────────────────────────────────────────────────────────────────────────
// Population Distributions Table
// ─────────────────────────────────────────────────────────────────────────────

export const populationDistributions = pgTable('population_distributions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  datasetId: text('datasetId').notNull().references(() => populationDatasets.id, { onDelete: 'cascade' }),

  dimension: varchar('dimension', { length: 50 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  percentage: doublePrecision('percentage').notNull(),
  population: bigint('population', { mode: 'number' }),
  confidence: doublePrecision('confidence'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('population_distributions_datasetId_dimension_category_idx').on(table.datasetId, table.dimension, table.category),
  index('population_distributions_datasetId_dimension_idx').on(table.datasetId, table.dimension),
])

// ─────────────────────────────────────────────────────────────────────────────
// Profile Visits Table (Bible: 03-FEATURES/08-social.md)
// ─────────────────────────────────────────────────────────────────────────────

export const profileVisits = pgTable('profile_visits', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  visitorId: text('visitorId').references(() => users.id, { onDelete: 'cascade' }),
  profileId: text('profileId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  source: profileVisitSourceEnum('source').default('DIRECT').notNull(),
  isAnonymous: boolean('isAnonymous').default(false).notNull(),

  visitedAt: timestamp('visitedAt').defaultNow().notNull(),
}, (table) => [
  index('profile_visits_profileId_visitedAt_idx').on(table.profileId, table.visitedAt),
  index('profile_visits_visitorId_visitedAt_idx').on(table.visitorId, table.visitedAt),
  index('profile_visits_profileId_isAnonymous_idx').on(table.profileId, table.isAnonymous),
])
