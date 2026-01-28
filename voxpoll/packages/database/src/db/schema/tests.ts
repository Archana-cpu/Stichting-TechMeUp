// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - TEST SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, integer, doublePrecision, json, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import {
  testCategoryEnum,
  contentStatusEnum,
  contentVisibilityEnum,
  personalityTestTypeEnum,
  personalityQuestionTypeEnum,
  quizTypeEnum,
  quizQuestionTypeEnum,
  questionDifficultyEnum,
  attemptStatusEnum,
  deviceCategoryEnum,
  fraudDecisionEnum,
  approvalStatusEnum,
} from './enums'
import { users } from './users'
import { organizations } from './organizations'
import { categories } from './misc'

// ─────────────────────────────────────────────────────────────────────────────
// Tests Table (Base)
// ─────────────────────────────────────────────────────────────────────────────

export const tests = pgTable('tests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  creatorId: text('creatorId').notNull().references(() => users.id),
  organizationId: text('organizationId').references(() => organizations.id),

  testCategory: testCategoryEnum('testCategory').notNull(),

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

  // Statistics
  completionCount: integer('completionCount').default(0).notNull(),
  viewCount: integer('viewCount').default(0).notNull(),
  shareCount: integer('shareCount').default(0).notNull(),
  averageCompletionTime: integer('averageCompletionTime'),

  // Scoring & Reliability
  hotScore: doublePrecision('hotScore').default(0).notNull(),

  reliabilityScore: doublePrecision('reliabilityScore'),
  reliabilityFactors: json('reliabilityFactors').default({}).notNull(),
  reliabilityUpdatedAt: timestamp('reliabilityUpdatedAt'),

  // Quality Control
  qualityThreshold: doublePrecision('qualityThreshold').default(0.7).notNull(),

  // Timestamps
  publishedAt: timestamp('publishedAt'),
  archivedAt: timestamp('archivedAt'),
  deletedAt: timestamp('deletedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('tests_creatorId_status_idx').on(table.creatorId, table.status),
  index('tests_creatorId_status_createdAt_idx').on(table.creatorId, table.status, table.createdAt),
  index('tests_status_visibility_deletedAt_idx').on(table.status, table.visibility, table.deletedAt),
  index('tests_status_visibility_hotScore_idx').on(table.status, table.visibility, table.hotScore),
  index('tests_testCategory_idx').on(table.testCategory),
  index('tests_slug_idx').on(table.slug),
  index('tests_organizationId_idx').on(table.organizationId),
  index('tests_organizationId_status_createdAt_idx').on(table.organizationId, table.status, table.createdAt),
  index('tests_categoryId_status_idx').on(table.categoryId, table.status),
  index('tests_categoryId_status_visibility_hotScore_idx').on(table.categoryId, table.status, table.visibility, table.hotScore),
])

// ─────────────────────────────────────────────────────────────────────────────
// Personality Tests Table
// ─────────────────────────────────────────────────────────────────────────────

export const personalityTests = pgTable('personality_tests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  testId: text('testId').unique().notNull().references(() => tests.id, { onDelete: 'cascade' }),

  testType: personalityTestTypeEnum('testType').notNull(),

  settings: json('settings').notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('personality_tests_testId_idx').on(table.testId),
  index('personality_tests_testType_idx').on(table.testType),
])

// ─────────────────────────────────────────────────────────────────────────────
// Test Axes Table
// ─────────────────────────────────────────────────────────────────────────────

export const testAxes = pgTable('test_axes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  testId: text('testId').notNull().references(() => personalityTests.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),

  name: varchar('name', { length: 50 }).notNull(),

  negativeLabel: varchar('negativeLabel', { length: 30 }).notNull(),
  positiveLabel: varchar('positiveLabel', { length: 30 }).notNull(),

  negativeDescription: varchar('negativeDescription', { length: 200 }).notNull(),
  positiveDescription: varchar('positiveDescription', { length: 200 }).notNull(),

  negativeColor: varchar('negativeColor', { length: 7 }).notNull(),
  positiveColor: varchar('positiveColor', { length: 7 }).notNull(),

  negativeIcon: varchar('negativeIcon', { length: 50 }),
  positiveIcon: varchar('positiveIcon', { length: 50 }),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('test_axes_testId_position_idx').on(table.testId, table.position),
  index('test_axes_testId_idx').on(table.testId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Test Quadrants Table
// ─────────────────────────────────────────────────────────────────────────────

export const testQuadrants = pgTable('test_quadrants', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  testId: text('testId').notNull().references(() => personalityTests.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 50 }).notNull(),
  slug: varchar('slug', { length: 60 }).notNull(),
  description: varchar('description', { length: 200 }).notNull(),
  detailedDescription: varchar('detailedDescription', { length: 1000 }).notNull(),

  imageUrl: text('imageUrl'),
  color: varchar('color', { length: 7 }).notNull(),
  iconName: varchar('iconName', { length: 50 }),

  axisConditions: json('axisConditions').notNull(),

  traits: text('traits').array().default([]),
  famousExamples: text('famousExamples').array().default([]),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('test_quadrants_testId_idx').on(table.testId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Test Characters Table
// ─────────────────────────────────────────────────────────────────────────────

export const testCharacters = pgTable('test_characters', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  testId: text('testId').notNull().references(() => personalityTests.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),

  name: varchar('name', { length: 50 }).notNull(),
  slug: varchar('slug', { length: 60 }).notNull(),
  tagline: varchar('tagline', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  detailedDescription: varchar('detailedDescription', { length: 1000 }).notNull(),

  imageUrl: text('imageUrl').notNull(),
  thumbnailUrl: text('thumbnailUrl'),
  backgroundColor: varchar('backgroundColor', { length: 7 }).notNull(),
  accentColor: varchar('accentColor', { length: 7 }).notNull(),

  traits: text('traits').array().default([]),
  strengths: text('strengths').array().default([]),
  weaknesses: text('weaknesses').array().default([]),

  compatibleWith: text('compatibleWith').array().default([]),
  famousQuote: varchar('famousQuote', { length: 200 }),

  metadata: json('metadata'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('test_characters_testId_position_idx').on(table.testId, table.position),
  uniqueIndex('test_characters_testId_slug_idx').on(table.testId, table.slug),
  index('test_characters_testId_idx').on(table.testId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Test Spectrum Table
// ─────────────────────────────────────────────────────────────────────────────

export const testSpectrums = pgTable('test_spectrums', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  testId: text('testId').unique().notNull().references(() => personalityTests.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 50 }).notNull(),

  leftLabel: varchar('leftLabel', { length: 30 }).notNull(),
  rightLabel: varchar('rightLabel', { length: 30 }).notNull(),

  leftDescription: varchar('leftDescription', { length: 200 }).notNull(),
  rightDescription: varchar('rightDescription', { length: 200 }).notNull(),

  leftColor: varchar('leftColor', { length: 7 }).notNull(),
  rightColor: varchar('rightColor', { length: 7 }).notNull(),

  leftIcon: varchar('leftIcon', { length: 50 }),
  rightIcon: varchar('rightIcon', { length: 50 }),

  gradientColors: text('gradientColors').array().default([]),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Test Spectrum Segments Table
// ─────────────────────────────────────────────────────────────────────────────

export const testSpectrumSegments = pgTable('test_spectrum_segments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  spectrumId: text('spectrumId').notNull().references(() => testSpectrums.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),

  name: varchar('name', { length: 50 }).notNull(),
  description: varchar('description', { length: 200 }).notNull(),
  detailedDescription: varchar('detailedDescription', { length: 500 }).notNull(),

  minPercentage: integer('minPercentage').notNull(),
  maxPercentage: integer('maxPercentage').notNull(),

  traits: text('traits').array().default([]),
  imageUrl: text('imageUrl'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('test_spectrum_segments_spectrumId_position_idx').on(table.spectrumId, table.position),
  index('test_spectrum_segments_spectrumId_idx').on(table.spectrumId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Personality Test Questions Table
// ─────────────────────────────────────────────────────────────────────────────

export const personalityTestQuestions = pgTable('personality_test_questions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  testId: text('testId').notNull().references(() => personalityTests.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),

  text: varchar('text', { length: 500 }).notNull(),
  imageUrl: text('imageUrl'),

  questionType: personalityQuestionTypeEnum('questionType').notNull(),
  config: json('config').notNull(),

  weight: doublePrecision('weight').default(1).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('personality_test_questions_testId_position_idx').on(table.testId, table.position),
  index('personality_test_questions_testId_idx').on(table.testId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Personality Test Results Table
// ─────────────────────────────────────────────────────────────────────────────

export const personalityTestResults = pgTable('personality_test_results', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  testId: text('testId').notNull().references(() => personalityTests.id, { onDelete: 'cascade' }),
  userId: text('userId'),
  sessionId: text('sessionId'),

  participantHash: varchar('participantHash', { length: 64 }),

  testType: personalityTestTypeEnum('testType').notNull(),

  responses: json('responses').notNull(),
  calculatedResult: json('calculatedResult').notNull(),

  matchedCharacterId: text('matchedCharacterId'),
  matchPercentage: doublePrecision('matchPercentage'),

  axisScores: json('axisScores'),
  coordinates: json('coordinates'),
  quadrantId: text('quadrantId'),
  typeCode: varchar('typeCode', { length: 10 }),

  spectrumPercentage: doublePrecision('spectrumPercentage'),
  segmentId: text('segmentId'),

  completedAt: timestamp('completedAt').defaultNow().notNull(),
  timeSpentSeconds: integer('timeSpentSeconds'),
  expectedTimeSeconds: integer('expectedTimeSeconds'),

  shareableCardUrl: text('shareableCardUrl'),
  shareCount: integer('shareCount').default(0).notNull(),
  viewCount: integer('viewCount').default(0).notNull(),

  // Quality Control
  qualityScore: doublePrecision('qualityScore'),
  qualityFlags: text('qualityFlags').array().default([]),

  // Fraud Detection
  fraudScore: doublePrecision('fraudScore'),
  fraudSignals: text('fraudSignals').array().default([]),
  fraudDecision: fraudDecisionEnum('fraudDecision'),

  speedRatio: doublePrecision('speedRatio'),
  straightLineRatio: doublePrecision('straightLineRatio'),

  attentionChecksPassed: integer('attentionChecksPassed').default(0).notNull(),
  attentionChecksFailed: integer('attentionChecksFailed').default(0).notNull(),

  tabSwitchCount: integer('tabSwitchCount').default(0).notNull(),
  copyPasteAttempts: integer('copyPasteAttempts').default(0).notNull(),

  isValid: boolean('isValid').default(true).notNull(),
  invalidatedAt: timestamp('invalidatedAt'),
  invalidReason: text('invalidReason'),
  qualityRecommendation: varchar('qualityRecommendation', { length: 20 }),

  deviceCategory: deviceCategoryEnum('deviceCategory').default('UNKNOWN').notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('personality_test_results_testId_participantHash_idx').on(table.testId, table.participantHash),
  index('personality_test_results_testId_isValid_idx').on(table.testId, table.isValid),
  index('personality_test_results_testId_isValid_qualityScore_idx').on(table.testId, table.isValid, table.qualityScore),
  index('personality_test_results_testId_idx').on(table.testId),
  index('personality_test_results_userId_idx').on(table.userId),
  index('personality_test_results_testType_idx').on(table.testType),
  index('personality_test_results_participantHash_idx').on(table.participantHash),
  index('personality_test_results_fraudScore_idx').on(table.fraudScore),
  index('personality_test_results_qualityScore_idx').on(table.qualityScore),
])

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Tests Table
// ─────────────────────────────────────────────────────────────────────────────

export const quizTests = pgTable('quiz_tests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  testId: text('testId').unique().notNull().references(() => tests.id, { onDelete: 'cascade' }),

  quizType: quizTypeEnum('quizType').notNull(),

  timeLimitMinutes: integer('timeLimitMinutes'),
  attemptsAllowed: integer('attemptsAllowed').default(1).notNull(),

  passingScore: doublePrecision('passingScore'),
  showCorrectAnswers: boolean('showCorrectAnswers').default(true).notNull(),
  showScoreImmediately: boolean('showScoreImmediately').default(true).notNull(),

  randomizeQuestions: boolean('randomizeQuestions').default(false).notNull(),
  randomizeOptions: boolean('randomizeOptions').default(false).notNull(),

  certificateEnabled: boolean('certificateEnabled').default(false).notNull(),
  certificateTemplate: text('certificateTemplate'),

  startsAt: timestamp('startsAt'),
  endsAt: timestamp('endsAt'),

  averageScore: doublePrecision('averageScore'),
  completionRate: doublePrecision('completionRate'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('quiz_tests_testId_idx').on(table.testId),
  index('quiz_tests_quizType_idx').on(table.quizType),
])

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Questions Table
// ─────────────────────────────────────────────────────────────────────────────

export const quizQuestions = pgTable('quiz_questions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  testId: text('testId').notNull().references(() => quizTests.id, { onDelete: 'cascade' }),

  orderIndex: integer('orderIndex').notNull(),

  type: quizQuestionTypeEnum('type').notNull(),

  text: varchar('text', { length: 1000 }).notNull(),
  explanation: varchar('explanation', { length: 2000 }),

  imageUrl: text('imageUrl'),

  options: json('options').default([]).notNull(),

  correctAnswer: json('correctAnswer').notNull(),

  points: doublePrecision('points').default(1).notNull(),
  negativePoints: doublePrecision('negativePoints').default(0).notNull(),

  timeLimitSeconds: integer('timeLimitSeconds'),

  difficulty: questionDifficultyEnum('difficulty').default('MEDIUM').notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('quiz_questions_testId_orderIndex_idx').on(table.testId, table.orderIndex),
  index('quiz_questions_testId_idx').on(table.testId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Attempts Table
// ─────────────────────────────────────────────────────────────────────────────

export const quizAttempts = pgTable('quiz_attempts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  testId: text('testId').notNull().references(() => quizTests.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull(),

  attemptNumber: integer('attemptNumber').notNull(),

  status: attemptStatusEnum('status').default('IN_PROGRESS').notNull(),

  answers: json('answers').notNull(),

  score: doublePrecision('score'),
  maxScore: doublePrecision('maxScore'),
  percentageScore: doublePrecision('percentageScore'),

  passed: boolean('passed'),

  startedAt: timestamp('startedAt').notNull(),
  completedAt: timestamp('completedAt'),

  timeSpentSeconds: integer('timeSpentSeconds'),
  expectedTimeSeconds: integer('expectedTimeSeconds'),

  questionOrder: integer('questionOrder').array().default([]),

  // Quality Control
  qualityScore: doublePrecision('qualityScore'),
  qualityFlags: text('qualityFlags').array().default([]),
  speedRatio: doublePrecision('speedRatio'),

  // Fraud Detection
  fraudScore: doublePrecision('fraudScore'),
  fraudSignals: text('fraudSignals').array().default([]),
  fraudDecision: fraudDecisionEnum('fraudDecision'),

  // Behavioral metrics
  tabSwitchCount: integer('tabSwitchCount').default(0).notNull(),
  copyPasteAttempts: integer('copyPasteAttempts').default(0).notNull(),
  focusLostCount: integer('focusLostCount').default(0).notNull(),

  deviceCategory: deviceCategoryEnum('deviceCategory').default('UNKNOWN').notNull(),

  isValid: boolean('isValid').default(true).notNull(),
  invalidatedAt: timestamp('invalidatedAt'),
  invalidReason: text('invalidReason'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('quiz_attempts_testId_userId_attemptNumber_idx').on(table.testId, table.userId, table.attemptNumber),
  index('quiz_attempts_testId_userId_idx').on(table.testId, table.userId),
  index('quiz_attempts_testId_isValid_qualityScore_idx').on(table.testId, table.isValid, table.qualityScore),
  index('quiz_attempts_userId_status_idx').on(table.userId, table.status),
  index('quiz_attempts_fraudScore_idx').on(table.fraudScore),
  index('quiz_attempts_qualityScore_idx').on(table.qualityScore),
  index('quiz_attempts_isValid_completedAt_idx').on(table.isValid, table.completedAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Test Result Badges Table
// ─────────────────────────────────────────────────────────────────────────────

export const testResultBadges = pgTable('test_result_badges', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  testId: text('testId').notNull().references(() => personalityTests.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  resultType: personalityTestTypeEnum('resultType').notNull(),

  resultTitle: varchar('resultTitle', { length: 100 }).notNull(),
  resultSubtitle: varchar('resultSubtitle', { length: 200 }),
  resultImageUrl: text('resultImageUrl').notNull(),

  axisScores: json('axisScores'),
  characterName: varchar('characterName', { length: 100 }),
  matchPercentage: doublePrecision('matchPercentage'),
  spectrumScore: doublePrecision('spectrumScore'),
  spectrumLabel: varchar('spectrumLabel', { length: 100 }),

  displayOnProfile: boolean('displayOnProfile').default(true).notNull(),
  pinnedPosition: integer('pinnedPosition'),

  earnedAt: timestamp('earnedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('test_result_badges_testId_userId_idx').on(table.testId, table.userId),
  index('test_result_badges_userId_displayOnProfile_idx').on(table.userId, table.displayOnProfile),
  index('test_result_badges_userId_pinnedPosition_idx').on(table.userId, table.pinnedPosition),
])
