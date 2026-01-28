// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - SOCIAL & DISCUSSION SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, integer, doublePrecision, json, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import {
  discussionStatusEnum,
  commentStatusEnum,
  followStatusEnum,
  voiceAccessStatusEnum,
  reportTargetTypeEnum,
  reportReasonEnum,
  reportStatusEnum,
  reportPriorityEnum,
  reportResolutionEnum,
  conversationStatusEnum,
  messageStatusEnum,
} from './enums'
import { users } from './users'
import { polls } from './polls'
import { tests } from './tests'

// ─────────────────────────────────────────────────────────────────────────────
// Discussions Table
// ─────────────────────────────────────────────────────────────────────────────

export const discussions = pgTable('discussions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  pollId: text('pollId').unique().references(() => polls.id, { onDelete: 'cascade' }),
  surveyId: text('surveyId').unique(),

  status: discussionStatusEnum('status').default('CLOSED').notNull(),

  minParticipantsForOpen: integer('minParticipantsForOpen'),
  totalComments: integer('totalComments').default(0).notNull(),
  totalParticipants: integer('totalParticipants').default(0).notNull(),

  pinnedCommentId: text('pinnedCommentId'),

  lastActivityAt: timestamp('lastActivityAt').defaultNow().notNull(),

  autoLockAt: timestamp('autoLockAt'),
  lockedAt: timestamp('lockedAt'),
  lockedBy: text('lockedBy'),
  lockReason: text('lockReason'),

  settings: json('settings').default({}).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt'),
}, (table) => [
  index('discussions_status_idx').on(table.status),
  index('discussions_lastActivityAt_idx').on(table.lastActivityAt),
  index('discussions_status_lastActivityAt_idx').on(table.status, table.lastActivityAt),
  index('discussions_deletedAt_idx').on(table.deletedAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Comments Table
// ─────────────────────────────────────────────────────────────────────────────

export const comments = pgTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  discussionId: text('discussionId').notNull().references(() => discussions.id, { onDelete: 'cascade' }),
  authorId: text('authorId').notNull().references(() => users.id),

  testId: text('testId').references(() => tests.id, { onDelete: 'cascade' }),

  parentId: text('parentId'),
  rootId: text('rootId'),
  depth: integer('depth').default(0).notNull(),

  content: varchar('content', { length: 2000 }).notNull(),

  upvotes: integer('upvotes').default(0).notNull(),
  downvotes: integer('downvotes').default(0).notNull(),

  wilsonScore: doublePrecision('wilsonScore').default(0).notNull(),
  controversyScore: doublePrecision('controversyScore').default(0).notNull(),

  replyCount: integer('replyCount').default(0).notNull(),

  isEdited: boolean('isEdited').default(false).notNull(),
  editedAt: timestamp('editedAt'),
  editHistory: json('editHistory').default([]).notNull(),

  isPinned: boolean('isPinned').default(false).notNull(),
  pinnedAt: timestamp('pinnedAt'),

  status: commentStatusEnum('status').default('VISIBLE').notNull(),
  hiddenAt: timestamp('hiddenAt'),
  hiddenReason: text('hiddenReason'),

  reportCount: integer('reportCount').default(0).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt'),
}, (table) => [
  index('comments_discussionId_status_wilsonScore_idx').on(table.discussionId, table.status, table.wilsonScore),
  index('comments_discussionId_status_createdAt_idx').on(table.discussionId, table.status, table.createdAt),
  index('comments_discussionId_status_controversyScore_idx').on(table.discussionId, table.status, table.controversyScore),
  index('comments_discussionId_rootId_status_idx').on(table.discussionId, table.rootId, table.status),
  index('comments_authorId_idx').on(table.authorId),
  index('comments_authorId_status_createdAt_idx').on(table.authorId, table.status, table.createdAt),
  index('comments_parentId_idx').on(table.parentId),
  index('comments_parentId_createdAt_idx').on(table.parentId, table.createdAt),
  index('comments_rootId_idx').on(table.rootId),
  index('comments_testId_idx').on(table.testId),
  index('comments_deletedAt_idx').on(table.deletedAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Comment Votes Table
// ─────────────────────────────────────────────────────────────────────────────

export const commentVotes = pgTable('comment_votes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  commentId: text('commentId').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  value: integer('value').notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('comment_votes_commentId_userId_idx').on(table.commentId, table.userId),
  index('comment_votes_userId_idx').on(table.userId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Voice Access Requests Table
// ─────────────────────────────────────────────────────────────────────────────

export const voiceAccessRequests = pgTable('voice_access_requests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  discussionId: text('discussionId').notNull().references(() => discussions.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  reason: varchar('reason', { length: 500 }).notNull(),

  status: voiceAccessStatusEnum('status').default('PENDING').notNull(),

  requestedAt: timestamp('requestedAt').defaultNow().notNull(),
  reviewedAt: timestamp('reviewedAt'),
  reviewedById: text('reviewedById'),
  rejectionReason: text('rejectionReason'),
}, (table) => [
  uniqueIndex('voice_access_requests_discussionId_userId_idx').on(table.discussionId, table.userId),
  index('voice_access_requests_discussionId_status_idx').on(table.discussionId, table.status),
  index('voice_access_requests_userId_status_idx').on(table.userId, table.status),
])

// ─────────────────────────────────────────────────────────────────────────────
// Follows Table
// ─────────────────────────────────────────────────────────────────────────────

export const follows = pgTable('follows', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  followerId: text('followerId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: text('followingId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  status: followStatusEnum('status').default('ACTIVE').notNull(),

  requestedAt: timestamp('requestedAt'),
  acceptedAt: timestamp('acceptedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('follows_followerId_followingId_idx').on(table.followerId, table.followingId),
  index('follows_followingId_status_idx').on(table.followingId, table.status),
  index('follows_followerId_status_idx').on(table.followerId, table.status),
])

// ─────────────────────────────────────────────────────────────────────────────
// Blocks Table
// ─────────────────────────────────────────────────────────────────────────────

export const blocks = pgTable('blocks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  blockerId: text('blockerId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  blockedId: text('blockedId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  reason: varchar('reason', { length: 500 }),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('blocks_blockerId_blockedId_idx').on(table.blockerId, table.blockedId),
  index('blocks_blockedId_idx').on(table.blockedId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Reports Table
// ─────────────────────────────────────────────────────────────────────────────

export const reports = pgTable('reports', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  reporterId: text('reporterId').notNull().references(() => users.id),

  targetType: reportTargetTypeEnum('targetType').notNull(),
  targetId: text('targetId').notNull(),

  reportedUserId: text('reportedUserId').references(() => users.id),

  reason: reportReasonEnum('reason').notNull(),
  details: varchar('details', { length: 1000 }),

  evidence: json('evidence').default([]).notNull(),

  status: reportStatusEnum('status').default('PENDING').notNull(),

  priority: reportPriorityEnum('priority').default('NORMAL').notNull(),

  assignedTo: text('assignedTo'),
  assignedAt: timestamp('assignedAt'),

  resolvedAt: timestamp('resolvedAt'),
  resolution: reportResolutionEnum('resolution'),
  resolutionNotes: varchar('resolutionNotes', { length: 1000 }),

  actionsTaken: json('actionsTaken').default([]).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('reports_status_priority_createdAt_idx').on(table.status, table.priority, table.createdAt),
  index('reports_reportedUserId_status_idx').on(table.reportedUserId, table.status),
  index('reports_targetType_targetId_idx').on(table.targetType, table.targetId),
  index('reports_assignedTo_status_idx').on(table.assignedTo, table.status),
])

// ─────────────────────────────────────────────────────────────────────────────
// Conversations Table (Bible: P-022)
// ─────────────────────────────────────────────────────────────────────────────

export const conversations = pgTable('conversations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  participant1Id: text('participant1Id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  participant2Id: text('participant2Id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  status: conversationStatusEnum('status').default('ACTIVE').notNull(),

  lastMessageAt: timestamp('lastMessageAt'),
  lastMessagePreview: varchar('lastMessagePreview', { length: 100 }),

  participant1LastReadAt: timestamp('participant1LastReadAt'),
  participant2LastReadAt: timestamp('participant2LastReadAt'),

  participant1UnreadCount: integer('participant1UnreadCount').default(0).notNull(),
  participant2UnreadCount: integer('participant2UnreadCount').default(0).notNull(),

  participant1ArchivedAt: timestamp('participant1ArchivedAt'),
  participant2ArchivedAt: timestamp('participant2ArchivedAt'),

  participant1DeletedAt: timestamp('participant1DeletedAt'),
  participant2DeletedAt: timestamp('participant2DeletedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('conversations_participants_idx').on(table.participant1Id, table.participant2Id),
  index('conversations_participant1Id_status_lastMessageAt_idx').on(table.participant1Id, table.status, table.lastMessageAt),
  index('conversations_participant2Id_status_lastMessageAt_idx').on(table.participant2Id, table.status, table.lastMessageAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Direct Messages Table (Bible: P-022)
// ─────────────────────────────────────────────────────────────────────────────

export const directMessages = pgTable('direct_messages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  conversationId: text('conversationId').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('senderId').notNull().references(() => users.id),

  content: varchar('content', { length: 2000 }).notNull(),

  status: messageStatusEnum('status').default('SENT').notNull(),

  deliveredAt: timestamp('deliveredAt'),
  readAt: timestamp('readAt'),

  senderDeletedAt: timestamp('senderDeletedAt'),
  recipientDeletedAt: timestamp('recipientDeletedAt'),

  expiresAt: timestamp('expiresAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('direct_messages_conversationId_createdAt_idx').on(table.conversationId, table.createdAt),
  index('direct_messages_senderId_createdAt_idx').on(table.senderId, table.createdAt),
  index('direct_messages_expiresAt_idx').on(table.expiresAt),
])
