// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - SURVEY SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, integer, doublePrecision, json, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import {
  surveyTypeEnum,
  contentStatusEnum,
  incentiveTypeEnum,
  surveySessionModeEnum,
  questionTypeEnum,
  invitationStatusEnum,
  responseStatusEnum,
  reviewStatusEnum,
  deviceCategoryEnum,
  fraudDecisionEnum,
  approvalStatusEnum,
} from './enums'
import { users } from './users'
import { organizations } from './organizations'
import { categories } from './misc'

// ─────────────────────────────────────────────────────────────────────────────
// Surveys Table
// ─────────────────────────────────────────────────────────────────────────────

export const surveys = pgTable('surveys', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  creatorId: text('creatorId').notNull().references(() => users.id),
  organizationId: text('organizationId').notNull().references(() => organizations.id),

  type: surveyTypeEnum('type').default('STANDARD').notNull(),

  title: varchar('title', { length: 200 }).notNull(),
  description: varchar('description', { length: 2000 }),
  slug: varchar('slug', { length: 250 }).unique().notNull(),

  coverImageUrl: text('coverImageUrl'),

  status: contentStatusEnum('status').default('DRAFT').notNull(),

  approvalStatus: approvalStatusEnum('approvalStatus').default('NONE').notNull(),
  requiresApproval: boolean('requiresApproval').default(false).notNull(),
  currentApprovalId: text('currentApprovalId'),

  categoryId: text('categoryId').references(() => categories.id),
  tags: text('tags').array().default([]),

  // Timing
  startsAt: timestamp('startsAt'),
  endsAt: timestamp('endsAt'),
  estimatedMinutes: integer('estimatedMinutes'),

  // Target
  targetResponseCount: integer('targetResponseCount'),
  quotas: json('quotas').default({}).notNull(),

  // Settings
  allowAnonymous: boolean('allowAnonymous').default(false).notNull(),
  allowSaveProgress: boolean('allowSaveProgress').default(true).notNull(),
  showProgressBar: boolean('showProgressBar').default(true).notNull(),
  randomizeSections: boolean('randomizeSections').default(false).notNull(),
  preventBackNavigation: boolean('preventBackNavigation').default(false).notNull(),

  // Incentives
  incentiveType: incentiveTypeEnum('incentiveType'),
  incentiveValue: doublePrecision('incentiveValue'),
  incentiveDescription: varchar('incentiveDescription', { length: 500 }),

  // Pre-test
  hasPreTest: boolean('hasPreTest').default(false).notNull(),
  preTestQuestions: json('preTestQuestions').default([]).notNull(),
  preTestPassingScore: doublePrecision('preTestPassingScore'),

  // Statistics
  responseCount: integer('responseCount').default(0).notNull(),
  completedCount: integer('completedCount').default(0).notNull(),
  abandonedCount: integer('abandonedCount').default(0).notNull(),
  completionRate: doublePrecision('completionRate'),
  averageCompletionTime: integer('averageCompletionTime'),
  averageQualityScore: doublePrecision('averageQualityScore'),

  // Reliability Score
  reliabilityScore: doublePrecision('reliabilityScore'),
  reliabilityFactors: json('reliabilityFactors').default({}).notNull(),
  reliabilityUpdatedAt: timestamp('reliabilityUpdatedAt'),

  // Quality Control
  qualityThreshold: doublePrecision('qualityThreshold').default(0.5).notNull(),

  // Multi-Session Settings
  sessionMode: surveySessionModeEnum('sessionMode').default('SINGLE').notNull(),
  sessionExpiryHours: integer('sessionExpiryHours').default(168).notNull(),
  allowOfflineMode: boolean('allowOfflineMode').default(false).notNull(),

  // Timestamps
  publishedAt: timestamp('publishedAt'),
  archivedAt: timestamp('archivedAt'),
  deletedAt: timestamp('deletedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('surveys_organizationId_status_idx').on(table.organizationId, table.status),
  index('surveys_organizationId_status_createdAt_idx').on(table.organizationId, table.status, table.createdAt),
  index('surveys_creatorId_status_idx').on(table.creatorId, table.status),
  index('surveys_creatorId_status_createdAt_idx').on(table.creatorId, table.status, table.createdAt),
  index('surveys_status_startsAt_endsAt_idx').on(table.status, table.startsAt, table.endsAt),
  index('surveys_slug_idx').on(table.slug),
  index('surveys_categoryId_status_idx').on(table.categoryId, table.status),
  index('surveys_reliabilityScore_idx').on(table.reliabilityScore),
])

// ─────────────────────────────────────────────────────────────────────────────
// Survey Sections Table
// ─────────────────────────────────────────────────────────────────────────────

export const surveySections = pgTable('survey_sections', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  surveyId: text('surveyId').notNull().references(() => surveys.id, { onDelete: 'cascade' }),

  orderIndex: integer('orderIndex').notNull(),

  title: varchar('title', { length: 200 }),
  description: varchar('description', { length: 1000 }),

  isRandomized: boolean('isRandomized').default(false).notNull(),

  displayLogic: json('displayLogic').default({}).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('survey_sections_surveyId_orderIndex_idx').on(table.surveyId, table.orderIndex),
  index('survey_sections_surveyId_idx').on(table.surveyId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Survey Questions Table
// ─────────────────────────────────────────────────────────────────────────────

export const surveyQuestions = pgTable('survey_questions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sectionId: text('sectionId').notNull().references(() => surveySections.id, { onDelete: 'cascade' }),

  orderIndex: integer('orderIndex').notNull(),

  type: questionTypeEnum('type').notNull(),

  text: varchar('text', { length: 1000 }).notNull(),
  description: varchar('description', { length: 2000 }),

  imageUrl: text('imageUrl'),

  isRequired: boolean('isRequired').default(true).notNull(),

  options: json('options').default([]).notNull(),

  validation: json('validation').default({}).notNull(),

  displayLogic: json('displayLogic').default({}).notNull(),
  skipLogic: json('skipLogic').default({}).notNull(),

  piping: json('piping').default({}).notNull(),

  isAttentionCheck: boolean('isAttentionCheck').default(false).notNull(),
  expectedAnswer: text('expectedAnswer'),

  settings: json('settings').default({}).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('survey_questions_sectionId_orderIndex_idx').on(table.sectionId, table.orderIndex),
  index('survey_questions_sectionId_idx').on(table.sectionId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Survey Invitations Table
// ─────────────────────────────────────────────────────────────────────────────

export const surveyInvitations = pgTable('survey_invitations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  surveyId: text('surveyId').notNull().references(() => surveys.id, { onDelete: 'cascade' }),

  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),

  token: varchar('token', { length: 64 }).unique().notNull(),

  status: invitationStatusEnum('status').default('PENDING').notNull(),

  sentAt: timestamp('sentAt'),
  openedAt: timestamp('openedAt'),
  startedAt: timestamp('startedAt'),
  completedAt: timestamp('completedAt'),

  reminderCount: integer('reminderCount').default(0).notNull(),
  lastReminderAt: timestamp('lastReminderAt'),

  expiresAt: timestamp('expiresAt').notNull(),

  metadata: json('metadata').default({}).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  index('survey_invitations_surveyId_status_idx').on(table.surveyId, table.status),
  index('survey_invitations_token_idx').on(table.token),
  index('survey_invitations_email_idx').on(table.email),
])

// ─────────────────────────────────────────────────────────────────────────────
// Survey Responses Table
// ─────────────────────────────────────────────────────────────────────────────

export const surveyResponses = pgTable('survey_responses', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  surveyId: text('surveyId').notNull().references(() => surveys.id, { onDelete: 'cascade' }),

  participantHash: varchar('participantHash', { length: 64 }).notNull(),
  invitationId: text('invitationId'),

  status: responseStatusEnum('status').default('IN_PROGRESS').notNull(),

  answers: json('answers').notNull(),

  currentSectionIndex: integer('currentSectionIndex').default(0).notNull(),
  currentQuestionIndex: integer('currentQuestionIndex').default(0).notNull(),

  // Multi-Session Support
  resumeToken: varchar('resumeToken', { length: 64 }).unique(),
  sessionExpiresAt: timestamp('sessionExpiresAt'),
  resumeCount: integer('resumeCount').default(0).notNull(),
  lastResumedAt: timestamp('lastResumedAt'),

  startedAt: timestamp('startedAt').notNull(),
  lastActivityAt: timestamp('lastActivityAt').notNull(),
  completedAt: timestamp('completedAt'),

  durationSeconds: integer('durationSeconds'),
  expectedDurationSec: integer('expectedDurationSec'),

  deviceCategory: deviceCategoryEnum('deviceCategory').default('UNKNOWN').notNull(),

  // Quality Control
  qualityScore: doublePrecision('qualityScore'),
  qualityThreshold: doublePrecision('qualityThreshold').default(0.6).notNull(),
  qualityFlags: text('qualityFlags').array().default([]),
  qualityRecommendation: varchar('qualityRecommendation', { length: 20 }),

  // Component scores
  timingScore: doublePrecision('timingScore'),
  patternScore: doublePrecision('patternScore'),
  attentionScore: doublePrecision('attentionScore'),
  behaviorScore: doublePrecision('behaviorScore'),
  fraudScore: doublePrecision('fraudScore'),
  fraudDecision: fraudDecisionEnum('fraudDecision'),
  fraudSignals: text('fraudSignals').array().default([]),

  // Attention checks
  attentionChecksPassed: integer('attentionChecksPassed').default(0).notNull(),
  attentionChecksFailed: integer('attentionChecksFailed').default(0).notNull(),

  // Timing & pattern metrics
  speedRatio: doublePrecision('speedRatio'),
  straightLineRatio: doublePrecision('straightLineRatio'),
  perQuestionTimes: json('perQuestionTimes'),

  // Behavioral signals
  tabSwitchCount: integer('tabSwitchCount').default(0).notNull(),
  copyPasteAttempts: integer('copyPasteAttempts').default(0).notNull(),
  ipReputation: doublePrecision('ipReputation'),
  ipPrefix: varchar('ipPrefix', { length: 16 }),
  behavioralSignals: json('behavioralSignals'),

  demographicSnapshot: json('demographicSnapshot').default({}).notNull(),

  isValid: boolean('isValid').default(true).notNull(),
  invalidatedAt: timestamp('invalidatedAt'),
  invalidReason: text('invalidReason'),

  // Review support
  reviewStatus: reviewStatusEnum('reviewStatus'),
  reviewedBy: text('reviewedBy'),
  reviewedAt: timestamp('reviewedAt'),
  reviewNotes: text('reviewNotes'),

  metadata: json('metadata').default({}).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt'),
}, (table) => [
  uniqueIndex('survey_responses_surveyId_participantHash_idx').on(table.surveyId, table.participantHash),
  index('survey_responses_surveyId_status_isValid_idx').on(table.surveyId, table.status, table.isValid),
  index('survey_responses_surveyId_status_qualityScore_idx').on(table.surveyId, table.status, table.qualityScore),
  index('survey_responses_surveyId_completedAt_idx').on(table.surveyId, table.completedAt),
  index('survey_responses_surveyId_isValid_fraudScore_idx').on(table.surveyId, table.isValid, table.fraudScore),
  index('survey_responses_surveyId_isValid_qualityScore_idx').on(table.surveyId, table.isValid, table.qualityScore),
  index('survey_responses_participantHash_idx').on(table.participantHash),
  index('survey_responses_invitationId_idx').on(table.invitationId),
  index('survey_responses_reviewStatus_idx').on(table.reviewStatus),
  index('survey_responses_fraudScore_idx').on(table.fraudScore),
  index('survey_responses_qualityScore_idx').on(table.qualityScore),
  index('survey_responses_isValid_completedAt_idx').on(table.isValid, table.completedAt),
  index('survey_responses_deviceCategory_idx').on(table.deviceCategory),
  index('survey_responses_ipPrefix_idx').on(table.ipPrefix),
])
