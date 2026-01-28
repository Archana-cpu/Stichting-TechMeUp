// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - MODERATION & TRUST SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, integer, doublePrecision, json, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import {
  contentTypeEnum,
  deviceCategoryEnum,
  ipTypeEnum,
  fraudDecisionEnum,
  fraudEntityTypeEnum,
  reportPriorityEnum,
  moderationStatusEnum,
  moderationResolutionEnum,
  approvalStatusEnum,
  appealStatusEnum,
  moderationActionTypeEnum,
} from './enums'
import { users } from './users'
import { organizations } from './organizations'

// ─────────────────────────────────────────────────────────────────────────────
// User Trust Scores Table
// ─────────────────────────────────────────────────────────────────────────────

export const userTrustScores = pgTable('user_trust_scores', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),

  overallScore: doublePrecision('overallScore').default(50).notNull(),

  accountAge: doublePrecision('accountAge').default(0).notNull(),
  verificationLevel: doublePrecision('verificationLevel').default(0).notNull(),
  activityConsistency: doublePrecision('activityConsistency').default(0).notNull(),
  responseQuality: doublePrecision('responseQuality').default(0).notNull(),
  socialTrust: doublePrecision('socialTrust').default(0).notNull(),

  reportCount: integer('reportCount').default(0).notNull(),
  warningCount: integer('warningCount').default(0).notNull(),
  suspensionCount: integer('suspensionCount').default(0).notNull(),

  fraudFlags: text('fraudFlags').array().default([]),

  lastCalculatedAt: timestamp('lastCalculatedAt').defaultNow().notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('user_trust_scores_overallScore_idx').on(table.overallScore),
])

// ─────────────────────────────────────────────────────────────────────────────
// Fraud Detection Logs Table
// ─────────────────────────────────────────────────────────────────────────────

export const fraudDetectionLogs = pgTable('fraud_detection_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  fingerprintHash: varchar('fingerprintHash', { length: 64 }).notNull(),

  contentType: contentTypeEnum('contentType').notNull(),
  contentId: text('contentId').notNull(),

  fraudScore: doublePrecision('fraudScore').default(0).notNull(),
  riskFactors: text('riskFactors').array().default([]),
  behaviorSummary: json('behaviorSummary'),

  signals: json('signals').default([]).notNull(),
  riskScore: doublePrecision('riskScore').default(0).notNull(),
  decision: fraudDecisionEnum('decision').default('ACCEPT').notNull(),

  deviceCategory: deviceCategoryEnum('deviceCategory').notNull(),
  browserFamily: varchar('browserFamily', { length: 50 }),
  osFamily: varchar('osFamily', { length: 50 }),

  ipType: ipTypeEnum('ipType').default('UNKNOWN').notNull(),
  isProxy: boolean('isProxy').default(false).notNull(),
  isVPN: boolean('isVPN').default(false).notNull(),
  isTor: boolean('isTor').default(false).notNull(),
  ipPrefix: varchar('ipPrefix', { length: 16 }),
  country: varchar('country', { length: 2 }),

  submissionTimeMs: integer('submissionTimeMs'),
  mouseMovements: integer('mouseMovements'),
  keystrokeCount: integer('keystrokeCount'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
}, (table) => [
  index('fraud_detection_logs_fingerprintHash_idx').on(table.fingerprintHash),
  index('fraud_detection_logs_fingerprintHash_decision_idx').on(table.fingerprintHash, table.decision),
  index('fraud_detection_logs_contentType_contentId_idx').on(table.contentType, table.contentId),
  index('fraud_detection_logs_contentId_fraudScore_createdAt_idx').on(table.contentId, table.fraudScore, table.createdAt),
  index('fraud_detection_logs_decision_createdAt_idx').on(table.decision, table.createdAt),
  index('fraud_detection_logs_fraudScore_idx').on(table.fraudScore),
  index('fraud_detection_logs_expiresAt_idx').on(table.expiresAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Moderation Queue Table
// ─────────────────────────────────────────────────────────────────────────────

export const moderationQueue = pgTable('moderation_queue', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  entityType: varchar('entityType', { length: 50 }).notNull(),
  entityId: text('entityId').notNull(),

  reason: varchar('reason', { length: 100 }).notNull(),
  fraudScore: doublePrecision('fraudScore'),
  qualityScore: doublePrecision('qualityScore'),
  riskFactors: text('riskFactors').array().default([]),

  priority: reportPriorityEnum('priority').default('NORMAL').notNull(),

  status: moderationStatusEnum('status').default('PENDING').notNull(),
  assignedTo: text('assignedTo'),
  assignedAt: timestamp('assignedAt'),

  resolution: moderationResolutionEnum('resolution'),
  resolutionNotes: varchar('resolutionNotes', { length: 1000 }),
  resolvedAt: timestamp('resolvedAt'),
  resolvedBy: text('resolvedBy'),

  metadata: json('metadata').default({}).notNull(),
  autoFlags: text('autoFlags').array().default([]),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('moderation_queue_status_priority_createdAt_idx').on(table.status, table.priority, table.createdAt),
  index('moderation_queue_assignedTo_status_idx').on(table.assignedTo, table.status),
  index('moderation_queue_entityType_entityId_idx').on(table.entityType, table.entityId),
  index('moderation_queue_status_createdAt_idx').on(table.status, table.createdAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// IP Reputation Table
// ─────────────────────────────────────────────────────────────────────────────

export const ipReputations = pgTable('ip_reputations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  ipAddress: varchar('ipAddress', { length: 45 }).unique().notNull(),

  type: ipTypeEnum('type').default('UNKNOWN').notNull(),

  isProxy: boolean('isProxy').default(false).notNull(),
  isVPN: boolean('isVPN').default(false).notNull(),
  isTor: boolean('isTor').default(false).notNull(),
  isDatacenter: boolean('isDatacenter').default(false).notNull(),

  country: varchar('country', { length: 2 }),
  region: varchar('region', { length: 100 }),
  city: varchar('city', { length: 100 }),
  isp: varchar('isp', { length: 100 }),
  asn: varchar('asn', { length: 20 }),

  reputationScore: doublePrecision('reputationScore').default(50).notNull(),

  associatedUserCount: integer('associatedUserCount').default(0).notNull(),
  suspiciousActivityCount: integer('suspiciousActivityCount').default(0).notNull(),

  firstSeenAt: timestamp('firstSeenAt').defaultNow().notNull(),
  lastSeenAt: timestamp('lastSeenAt').defaultNow().notNull(),
  lastCheckedAt: timestamp('lastCheckedAt').defaultNow().notNull(),

  isBlocked: boolean('isBlocked').default(false).notNull(),
  blockedAt: timestamp('blockedAt'),
  blockReason: text('blockReason'),
}, (table) => [
  index('ip_reputations_reputationScore_idx').on(table.reputationScore),
  index('ip_reputations_country_idx').on(table.country),
  index('ip_reputations_isBlocked_idx').on(table.isBlocked),
])

// ─────────────────────────────────────────────────────────────────────────────
// Fraud Scores Table
// ─────────────────────────────────────────────────────────────────────────────

export const fraudScores = pgTable('fraud_scores', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  entityType: fraudEntityTypeEnum('entityType').notNull(),
  entityId: text('entityId').notNull(),

  score: doublePrecision('score').notNull(),
  decision: fraudDecisionEnum('decision').notNull(),

  signals: json('signals').notNull(),
  weights: json('weights').notNull(),

  deviceScore: doublePrecision('deviceScore'),
  behaviorScore: doublePrecision('behaviorScore'),
  responseScore: doublePrecision('responseScore'),
  networkScore: doublePrecision('networkScore'),

  riskFactors: text('riskFactors').array().default([]),

  reviewedAt: timestamp('reviewedAt'),
  reviewedBy: text('reviewedBy'),
  reviewNotes: text('reviewNotes'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  index('fraud_scores_entityType_entityId_idx').on(table.entityType, table.entityId),
  index('fraud_scores_decision_createdAt_idx').on(table.decision, table.createdAt),
  index('fraud_scores_score_idx').on(table.score),
])

// ─────────────────────────────────────────────────────────────────────────────
// Content Approvals Table
// ─────────────────────────────────────────────────────────────────────────────

export const contentApprovals = pgTable('content_approvals', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  contentType: contentTypeEnum('contentType').notNull(),
  contentId: text('contentId').notNull(),

  status: approvalStatusEnum('status').default('PENDING_APPROVAL').notNull(),

  version: integer('version').default(1).notNull(),

  submittedById: text('submittedById').notNull().references(() => users.id),
  submittedAt: timestamp('submittedAt').defaultNow().notNull(),

  reviewerId: text('reviewerId').references(() => users.id),
  reviewedAt: timestamp('reviewedAt'),

  decisionNotes: varchar('decisionNotes', { length: 2000 }),
  rejectionReason: varchar('rejectionReason', { length: 500 }),
  revisionInstructions: varchar('revisionInstructions', { length: 2000 }),

  autoApproved: boolean('autoApproved').default(false).notNull(),
  autoApprovalReason: varchar('autoApprovalReason', { length: 200 }),

  metadata: json('metadata').default({}).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('content_approvals_contentType_contentId_version_idx').on(table.contentType, table.contentId, table.version),
  index('content_approvals_status_createdAt_idx').on(table.status, table.createdAt),
  index('content_approvals_submittedById_status_idx').on(table.submittedById, table.status),
  index('content_approvals_reviewerId_status_idx').on(table.reviewerId, table.status),
  index('content_approvals_contentType_status_idx').on(table.contentType, table.status),
])

// ─────────────────────────────────────────────────────────────────────────────
// Appeals Table
// ─────────────────────────────────────────────────────────────────────────────

export const appeals = pgTable('appeals', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  appealerId: text('appealerId').notNull().references(() => users.id),

  moderationDecisionType: varchar('moderationDecisionType', { length: 50 }).notNull(),
  moderationDecisionId: text('moderationDecisionId').notNull(),

  contentType: contentTypeEnum('contentType'),
  contentId: text('contentId'),

  status: appealStatusEnum('status').default('PENDING').notNull(),

  reason: varchar('reason', { length: 2000 }).notNull(),
  evidence: json('evidence').default([]).notNull(),

  priority: reportPriorityEnum('priority').default('NORMAL').notNull(),

  assignedTo: text('assignedTo').references(() => users.id),
  assignedAt: timestamp('assignedAt'),

  reviewerId: text('reviewerId').references(() => users.id),
  reviewedAt: timestamp('reviewedAt'),

  decision: varchar('decision', { length: 500 }),
  decisionNotes: varchar('decisionNotes', { length: 2000 }),

  actionsTaken: json('actionsTaken').default([]).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('appeals_appealerId_status_idx').on(table.appealerId, table.status),
  index('appeals_status_priority_createdAt_idx').on(table.status, table.priority, table.createdAt),
  index('appeals_assignedTo_status_idx').on(table.assignedTo, table.status),
  index('appeals_moderationDecisionType_moderationDecisionId_idx').on(table.moderationDecisionType, table.moderationDecisionId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Auto Approval Rules Table
// ─────────────────────────────────────────────────────────────────────────────

export const autoApprovalRules = pgTable('auto_approval_rules', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  organizationId: text('organizationId').references(() => organizations.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }),

  contentType: contentTypeEnum('contentType'),

  minTrustScore: doublePrecision('minTrustScore'),
  requiresVerification: boolean('requiresVerification').default(false).notNull(),
  minAccountAgeDays: integer('minAccountAgeDays'),
  maxPendingReports: integer('maxPendingReports'),

  conditions: json('conditions').default({}).notNull(),

  isActive: boolean('isActive').default(true).notNull(),
  priority: integer('priority').default(0).notNull(),

  createdBy: text('createdBy').notNull().references(() => users.id),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('auto_approval_rules_organizationId_isActive_idx').on(table.organizationId, table.isActive),
  index('auto_approval_rules_contentType_isActive_priority_idx').on(table.contentType, table.isActive, table.priority),
])
