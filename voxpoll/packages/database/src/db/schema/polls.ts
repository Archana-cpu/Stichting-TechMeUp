// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - POLL SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, integer, doublePrecision, json, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import {
  pollTypeEnum,
  votingSystemEnum,
  contentStatusEnum,
  contentVisibilityEnum,
  resultVisibilityEnum,
  livePollStatusEnum,
  deviceCategoryEnum,
  fraudDecisionEnum,
  approvalStatusEnum,
} from './enums'
import { users } from './users'
import { organizations } from './organizations'
import { categories } from './misc'

// ─────────────────────────────────────────────────────────────────────────────
// Target Audience Config Type (Bible: 03-FEATURES/01-polls.md)
// ─────────────────────────────────────────────────────────────────────────────

export interface TargetAudienceConfig {
  enabled: boolean
  ageRange?: { min: number; max: number } | null
  genders?: string[] | null
  countries?: string[] | null
  regions?: string[] | null
  educationLevels?: string[] | null
  employmentStatuses?: string[] | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Polls Table
// ─────────────────────────────────────────────────────────────────────────────

export const polls = pgTable('polls', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  creatorId: text('creatorId').notNull().references(() => users.id),
  organizationId: text('organizationId').references(() => organizations.id),

  type: pollTypeEnum('type').default('STANDARD').notNull(),
  votingSystem: votingSystemEnum('votingSystem').default('SINGLE_CHOICE').notNull(),

  title: varchar('title', { length: 200 }).notNull(),
  description: varchar('description', { length: 2000 }),
  slug: varchar('slug', { length: 250 }).unique().notNull(),

  coverImageUrl: text('coverImageUrl'),

  status: contentStatusEnum('status').default('DRAFT').notNull(),
  visibility: contentVisibilityEnum('visibility').default('PUBLIC').notNull(),

  approvalStatus: approvalStatusEnum('approvalStatus').default('NONE').notNull(),
  requiresApproval: boolean('requiresApproval').default(false).notNull(),
  currentApprovalId: text('currentApprovalId'),

  categoryId: text('categoryId').references(() => categories.id),
  tags: text('tags').array().default([]),

  // Timing
  startsAt: timestamp('startsAt'),
  endsAt: timestamp('endsAt'),

  // Scheduling
  scheduledPublishAt: timestamp('scheduledPublishAt'),
  autoCloseAt: timestamp('autoCloseAt'),

  // Template reference
  templateId: text('templateId'),

  // Link-only access
  linkOnlyAccess: boolean('linkOnlyAccess').default(false).notNull(),
  accessPassword: varchar('accessPassword', { length: 255 }),

  // Options
  options: json('options').default([]).notNull(),

  // Settings
  allowMultipleVotes: boolean('allowMultipleVotes').default(false).notNull(),
  maxVotesPerUser: integer('maxVotesPerUser').default(1).notNull(),
  requireAuth: boolean('requireAuth').default(false).notNull(),
  showResultsBeforeVote: boolean('showResultsBeforeVote').default(false).notNull(),
  resultVisibility: resultVisibilityEnum('resultVisibility').default('ALWAYS').notNull(),
  isAnonymous: boolean('isAnonymous').default(true).notNull(),

  // Pre-test
  hasPreTest: boolean('hasPreTest').default(false).notNull(),
  preTestQuestions: json('preTestQuestions').default([]).notNull(),
  preTestPassingScore: doublePrecision('preTestPassingScore'),

  // Discussion
  allowDiscussion: boolean('allowDiscussion').default(true).notNull(),

  // Target Audience (Bible: P1-010)
  targetAudience: json('targetAudience').$type<TargetAudienceConfig | null>(),

  // Statistics
  participantCount: integer('participantCount').default(0).notNull(),
  viewCount: integer('viewCount').default(0).notNull(),
  shareCount: integer('shareCount').default(0).notNull(),
  commentCount: integer('commentCount').default(0).notNull(),

  // Scoring & Reliability
  hotScore: doublePrecision('hotScore').default(0).notNull(),
  hotScoreUpdatedAt: timestamp('hotScoreUpdatedAt'),

  reliabilityScore: doublePrecision('reliabilityScore'),
  reliabilityFactors: json('reliabilityFactors').default({}).notNull(),
  reliabilityUpdatedAt: timestamp('reliabilityUpdatedAt'),

  // Quality Control
  qualityThreshold: doublePrecision('qualityThreshold').default(0).notNull(),

  // Optimistic locking
  version: integer('version').default(1).notNull(),

  // Status flags
  premiumLocked: boolean('premiumLocked').default(false).notNull(),
  editLocked: boolean('editLocked').default(false).notNull(),

  // Timestamps
  publishedAt: timestamp('publishedAt'),
  archivedAt: timestamp('archivedAt'),
  deletedAt: timestamp('deletedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('polls_creatorId_status_idx').on(table.creatorId, table.status),
  index('polls_creatorId_status_createdAt_idx').on(table.creatorId, table.status, table.createdAt),
  index('polls_organizationId_status_idx').on(table.organizationId, table.status),
  index('polls_status_visibility_hotScore_idx').on(table.status, table.visibility, table.hotScore),
  index('polls_status_visibility_endsAt_idx').on(table.status, table.visibility, table.endsAt),
  index('polls_categoryId_status_visibility_idx').on(table.categoryId, table.status, table.visibility),
  index('polls_categoryId_status_visibility_hotScore_idx').on(table.categoryId, table.status, table.visibility, table.hotScore),
  index('polls_hotScore_publishedAt_idx').on(table.hotScore, table.publishedAt),
  index('polls_publishedAt_idx').on(table.publishedAt),
  index('polls_slug_idx').on(table.slug),
  index('polls_deletedAt_idx').on(table.deletedAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Poll Responses Table
// ─────────────────────────────────────────────────────────────────────────────

export const pollResponses = pgTable('poll_responses', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  pollId: text('pollId').notNull().references(() => polls.id, { onDelete: 'cascade' }),

  participantHash: varchar('participantHash', { length: 64 }).notNull(),

  answers: json('answers').notNull(),

  startedAt: timestamp('startedAt').notNull(),
  completedAt: timestamp('completedAt').notNull(),
  durationSeconds: integer('durationSeconds').notNull(),
  expectedDurationSec: integer('expectedDurationSec'),

  deviceCategory: deviceCategoryEnum('deviceCategory').default('UNKNOWN').notNull(),

  // Quality Control
  qualityScore: doublePrecision('qualityScore'),
  qualityFlags: text('qualityFlags').array().default([]),

  // Fraud Detection
  fraudScore: doublePrecision('fraudScore'),
  fraudSignals: text('fraudSignals').array().default([]),
  fraudRiskLevel: varchar('fraudRiskLevel', { length: 10 }),
  fraudDecision: fraudDecisionEnum('fraudDecision'),

  // Timing metrics
  speedRatio: doublePrecision('speedRatio'),

  // Behavioral signals
  ipReputation: doublePrecision('ipReputation'),
  ipPrefix: varchar('ipPrefix', { length: 16 }),
  hasNaturalBehavior: boolean('hasNaturalBehavior').default(true).notNull(),
  behavioralSignals: json('behavioralSignals'),

  demographicSnapshot: json('demographicSnapshot').default({}).notNull(),

  isValid: boolean('isValid').default(true).notNull(),
  invalidatedAt: timestamp('invalidatedAt'),
  invalidReason: text('invalidReason'),
  qualityRecommendation: varchar('qualityRecommendation', { length: 20 }),

  deletedAt: timestamp('deletedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('poll_responses_pollId_participantHash_idx').on(table.pollId, table.participantHash),
  index('poll_responses_pollId_isValid_idx').on(table.pollId, table.isValid),
  index('poll_responses_pollId_isValid_deletedAt_idx').on(table.pollId, table.isValid, table.deletedAt),
  index('poll_responses_pollId_createdAt_idx').on(table.pollId, table.createdAt),
  index('poll_responses_pollId_isValid_fraudScore_idx').on(table.pollId, table.isValid, table.fraudScore),
  index('poll_responses_pollId_isValid_qualityScore_idx').on(table.pollId, table.isValid, table.qualityScore),
  index('poll_responses_participantHash_idx').on(table.participantHash),
  index('poll_responses_fraudRiskLevel_idx').on(table.fraudRiskLevel),
  index('poll_responses_fraudScore_idx').on(table.fraudScore),
  index('poll_responses_qualityScore_idx').on(table.qualityScore),
  index('poll_responses_isValid_createdAt_idx').on(table.isValid, table.createdAt),
  index('poll_responses_createdAt_idx').on(table.createdAt),
  index('poll_responses_deviceCategory_idx').on(table.deviceCategory),
  index('poll_responses_ipPrefix_idx').on(table.ipPrefix),
])

// ─────────────────────────────────────────────────────────────────────────────
// Live Poll Session Table
// ─────────────────────────────────────────────────────────────────────────────

export const livePollSessions = pgTable('live_poll_sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  pollId: text('pollId').unique().notNull().references(() => polls.id, { onDelete: 'cascade' }),
  hostId: text('hostId').notNull().references(() => users.id),

  sessionCode: varchar('sessionCode', { length: 6 }).unique().notNull(),
  joinUrl: text('joinUrl').notNull(),
  qrCodeUrl: text('qrCodeUrl'),

  status: livePollStatusEnum('status').default('WAITING').notNull(),

  // Participant tracking
  maxParticipants: integer('maxParticipants').default(10000).notNull(),
  currentParticipants: integer('currentParticipants').default(0).notNull(),
  peakParticipants: integer('peakParticipants').default(0).notNull(),
  spectatorCount: integer('spectatorCount').default(0).notNull(),
  spectatorLimit: integer('spectatorLimit').default(1000).notNull(),
  waitingRoomCount: integer('waitingRoomCount').default(0).notNull(),
  totalVotes: integer('totalVotes').default(0).notNull(),

  // Settings
  showRealTimeResults: boolean('showRealTimeResults').default(true).notNull(),
  allowLateJoin: boolean('allowLateJoin').default(true).notNull(),
  anonymousVoting: boolean('anonymousVoting').default(true).notNull(),
  participantListVisible: boolean('participantListVisible').default(false).notNull(),
  settings: json('settings').default({}).notNull(),

  autoCloseMinutes: integer('autoCloseMinutes'),
  startedAt: timestamp('startedAt'),
  pausedAt: timestamp('pausedAt'),
  endedAt: timestamp('endedAt'),

  // Disconnect Handling
  hostConnectionId: varchar('hostConnectionId', { length: 64 }),
  hostDisconnectedAt: timestamp('hostDisconnectedAt'),
  autoEndAt: timestamp('autoEndAt'),
  orphanModeStarted: boolean('orphanModeStarted').default(false).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('live_poll_sessions_sessionCode_idx').on(table.sessionCode),
  index('live_poll_sessions_status_idx').on(table.status),
  index('live_poll_sessions_hostId_idx').on(table.hostId),
  index('live_poll_sessions_orphanModeStarted_autoEndAt_idx').on(table.orphanModeStarted, table.autoEndAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Live Vote Table
// ─────────────────────────────────────────────────────────────────────────────

export const liveVotes = pgTable('live_votes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sessionId: text('sessionId').notNull().references(() => livePollSessions.id, { onDelete: 'cascade' }),

  deviceId: varchar('deviceId', { length: 64 }).notNull(),
  optionId: text('optionId').notNull(),

  votedAt: timestamp('votedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('live_votes_sessionId_deviceId_idx').on(table.sessionId, table.deviceId),
  index('live_votes_sessionId_idx').on(table.sessionId),
  index('live_votes_optionId_idx').on(table.optionId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Pre-test Attempts Table (Bible: P-007, P-030)
// ─────────────────────────────────────────────────────────────────────────────

export const pretestAttempts = pgTable('pretest_attempts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  pollId: text('pollId').notNull().references(() => polls.id, { onDelete: 'cascade' }),
  participantId: text('participantId').notNull().references(() => users.id),

  deviceFingerprint: varchar('deviceFingerprint', { length: 64 }),

  attemptNumber: integer('attemptNumber').notNull(),
  score: doublePrecision('score').notNull(),
  passed: boolean('passed').notNull(),

  answersJson: json('answersJson').default([]).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  index('pretest_attempts_pollId_participantId_idx').on(table.pollId, table.participantId),
  index('pretest_attempts_pollId_passed_idx').on(table.pollId, table.passed),
  index('pretest_attempts_participantId_idx').on(table.participantId),
  index('pretest_attempts_createdAt_idx').on(table.createdAt),
])
