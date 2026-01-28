// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - DRIZZLE RELATIONS
// ══════════════════════════════════════════════════════════════════════════════

import { relations } from 'drizzle-orm'

// Users & Auth
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  userDevices,
  userReliabilityCaches,
} from './users'

// Organizations
import {
  organizations,
  organizationMembers,
  organizationInvitations,
} from './organizations'

// Polls
import {
  polls,
  pollResponses,
  livePollSessions,
  liveVotes,
} from './polls'

// Surveys
import {
  surveys,
  surveySections,
  surveyQuestions,
  surveyInvitations,
  surveyResponses,
} from './surveys'

// Tests
import {
  tests,
  personalityTests,
  testAxes,
  testQuadrants,
  testCharacters,
  testSpectrums,
  testSpectrumSegments,
  personalityTestQuestions,
  personalityTestResults,
  quizTests,
  quizQuestions,
  quizAttempts,
  testResultBadges,
} from './tests'

// Social
import {
  discussions,
  comments,
  commentVotes,
  voiceAccessRequests,
  follows,
  blocks,
  reports,
} from './social'

// Notifications
import {
  notifications,
  notificationAggregations,
  notificationPreferences,
  pushTokens,
} from './notifications'

// Moderation
import {
  userTrustScores,
  fraudDetectionLogs,
  moderationQueue,
} from './moderation'

// Analytics
import {
  userInterestProfiles,
  contentViews,
  searchHistories,
  savedSearches,
  feedEvents,
  preTestResults,
  privateLinks,
  sponsoredCampaigns,
  auditLogs,
  populationDatasets,
  populationDistributions,
} from './analytics'

// Payments
import {
  userSubscriptions,
  checkoutSessions,
  cancellationFeedback,
  refundRequests,
} from './payments'

// Misc
import {
  categories,
  userGamification,
  badges,
  userBadges,
  xpTransactions,
  webhookEndpoints,
  webhookDeliveries,
  runtimeConfigs,
  consentPolicies,
  userConsents,
} from './misc'

// Templates, Jobs & Exports
import {
  pollTemplates,
  pollTemplateUsages,
  shareLinkViews,
  scheduledJobs,
  dataExports,
} from './templates'

// ═══════════════════════════════════════════════════════════════════════════════
// USER RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ one, many }) => ({
  // Auth
  accounts: many(accounts),
  sessions: many(sessions),
  verificationTokens: many(verificationTokens),
  devices: many(userDevices),
  pushTokens: many(pushTokens),

  // Profile
  trustScore: one(userTrustScores),
  reliabilityCache: one(userReliabilityCaches),
  interestProfile: one(userInterestProfiles),
  gamification: one(userGamification),

  // Content
  polls: many(polls),
  surveys: many(surveys),
  tests: many(tests),

  // Organizations
  organizationMemberships: many(organizationMembers),

  // Social
  comments: many(comments),
  following: many(follows, { relationName: 'follower' }),
  followers: many(follows, { relationName: 'following' }),
  blocking: many(blocks, { relationName: 'blocker' }),
  blockedBy: many(blocks, { relationName: 'blocked' }),

  // Notifications
  notifications: many(notifications),
  notificationPreferences: one(notificationPreferences),

  // Misc
  badges: many(userBadges),
  searchHistories: many(searchHistories),
  savedSearches: many(savedSearches),
  contentViews: many(contentViews),

  // Subscriptions
  subscription: one(userSubscriptions),
  checkoutSessions: many(checkoutSessions),
  consents: many(userConsents),

  // Templates & Exports
  templates: many(pollTemplates),
  templateUsages: many(pollTemplateUsages),
  scheduledJobs: many(scheduledJobs),
  dataExports: many(dataExports),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, { fields: [verificationTokens.userId], references: [users.id] }),
}))

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, { fields: [userDevices.userId], references: [users.id] }),
}))

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(users, { fields: [pushTokens.userId], references: [users.id] }),
}))

export const userTrustScoresRelations = relations(userTrustScores, ({ one }) => ({
  user: one(users, { fields: [userTrustScores.userId], references: [users.id] }),
}))

export const userReliabilityCachesRelations = relations(userReliabilityCaches, ({ one }) => ({
  user: one(users, { fields: [userReliabilityCaches.userId], references: [users.id] }),
}))

export const userInterestProfilesRelations = relations(userInterestProfiles, ({ one }) => ({
  user: one(users, { fields: [userInterestProfiles.userId], references: [users.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// ORGANIZATION RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  invitations: many(organizationInvitations),
  polls: many(polls),
  surveys: many(surveys),
  tests: many(tests),
}))

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, { fields: [organizationMembers.organizationId], references: [organizations.id] }),
  user: one(users, { fields: [organizationMembers.userId], references: [users.id] }),
}))

export const organizationInvitationsRelations = relations(organizationInvitations, ({ one }) => ({
  organization: one(organizations, { fields: [organizationInvitations.organizationId], references: [organizations.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// POLL RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const pollsRelations = relations(polls, ({ one, many }) => ({
  creator: one(users, { fields: [polls.creatorId], references: [users.id] }),
  organization: one(organizations, { fields: [polls.organizationId], references: [organizations.id] }),
  category: one(categories, { fields: [polls.categoryId], references: [categories.id] }),
  template: one(pollTemplates, { fields: [polls.templateId], references: [pollTemplates.id] }),
  responses: many(pollResponses),
  liveSession: one(livePollSessions),
  discussion: one(discussions),
}))

export const pollResponsesRelations = relations(pollResponses, ({ one }) => ({
  poll: one(polls, { fields: [pollResponses.pollId], references: [polls.id] }),
}))

export const livePollSessionsRelations = relations(livePollSessions, ({ one, many }) => ({
  poll: one(polls, { fields: [livePollSessions.pollId], references: [polls.id] }),
  host: one(users, { fields: [livePollSessions.hostId], references: [users.id] }),
  votes: many(liveVotes),
}))

export const liveVotesRelations = relations(liveVotes, ({ one }) => ({
  session: one(livePollSessions, { fields: [liveVotes.sessionId], references: [livePollSessions.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// SURVEY RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  creator: one(users, { fields: [surveys.creatorId], references: [users.id] }),
  organization: one(organizations, { fields: [surveys.organizationId], references: [organizations.id] }),
  category: one(categories, { fields: [surveys.categoryId], references: [categories.id] }),
  sections: many(surveySections),
  invitations: many(surveyInvitations),
  responses: many(surveyResponses),
}))

export const surveySectionsRelations = relations(surveySections, ({ one, many }) => ({
  survey: one(surveys, { fields: [surveySections.surveyId], references: [surveys.id] }),
  questions: many(surveyQuestions),
}))

export const surveyQuestionsRelations = relations(surveyQuestions, ({ one }) => ({
  section: one(surveySections, { fields: [surveyQuestions.sectionId], references: [surveySections.id] }),
}))

export const surveyInvitationsRelations = relations(surveyInvitations, ({ one }) => ({
  survey: one(surveys, { fields: [surveyInvitations.surveyId], references: [surveys.id] }),
}))

export const surveyResponsesRelations = relations(surveyResponses, ({ one }) => ({
  survey: one(surveys, { fields: [surveyResponses.surveyId], references: [surveys.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// TEST RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const testsRelations = relations(tests, ({ one, many }) => ({
  creator: one(users, { fields: [tests.creatorId], references: [users.id] }),
  organization: one(organizations, { fields: [tests.organizationId], references: [organizations.id] }),
  category: one(categories, { fields: [tests.categoryId], references: [categories.id] }),
  personalityTest: one(personalityTests),
  quizTest: one(quizTests),
  comments: many(comments),
}))

export const personalityTestsRelations = relations(personalityTests, ({ one, many }) => ({
  test: one(tests, { fields: [personalityTests.testId], references: [tests.id] }),
  axes: many(testAxes),
  quadrants: many(testQuadrants),
  characters: many(testCharacters),
  spectrum: one(testSpectrums),
  questions: many(personalityTestQuestions),
  results: many(personalityTestResults),
  badges: many(testResultBadges),
}))

export const testAxesRelations = relations(testAxes, ({ one }) => ({
  personalityTest: one(personalityTests, { fields: [testAxes.testId], references: [personalityTests.id] }),
}))

export const testQuadrantsRelations = relations(testQuadrants, ({ one }) => ({
  personalityTest: one(personalityTests, { fields: [testQuadrants.testId], references: [personalityTests.id] }),
}))

export const testCharactersRelations = relations(testCharacters, ({ one }) => ({
  personalityTest: one(personalityTests, { fields: [testCharacters.testId], references: [personalityTests.id] }),
}))

export const testSpectrumsRelations = relations(testSpectrums, ({ one, many }) => ({
  personalityTest: one(personalityTests, { fields: [testSpectrums.testId], references: [personalityTests.id] }),
  segments: many(testSpectrumSegments),
}))

export const testSpectrumSegmentsRelations = relations(testSpectrumSegments, ({ one }) => ({
  spectrum: one(testSpectrums, { fields: [testSpectrumSegments.spectrumId], references: [testSpectrums.id] }),
}))

export const personalityTestQuestionsRelations = relations(personalityTestQuestions, ({ one }) => ({
  personalityTest: one(personalityTests, { fields: [personalityTestQuestions.testId], references: [personalityTests.id] }),
}))

export const personalityTestResultsRelations = relations(personalityTestResults, ({ one }) => ({
  personalityTest: one(personalityTests, { fields: [personalityTestResults.testId], references: [personalityTests.id] }),
}))

export const quizTestsRelations = relations(quizTests, ({ one, many }) => ({
  test: one(tests, { fields: [quizTests.testId], references: [tests.id] }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}))

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quizTest: one(quizTests, { fields: [quizQuestions.testId], references: [quizTests.id] }),
}))

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  quizTest: one(quizTests, { fields: [quizAttempts.testId], references: [quizTests.id] }),
}))

export const testResultBadgesRelations = relations(testResultBadges, ({ one }) => ({
  personalityTest: one(personalityTests, { fields: [testResultBadges.testId], references: [personalityTests.id] }),
  user: one(users, { fields: [testResultBadges.userId], references: [users.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  poll: one(polls, { fields: [discussions.pollId], references: [polls.id] }),
  comments: many(comments),
  voiceAccessRequests: many(voiceAccessRequests),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  discussion: one(discussions, { fields: [comments.discussionId], references: [discussions.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
  test: one(tests, { fields: [comments.testId], references: [tests.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id], relationName: 'replies' }),
  replies: many(comments, { relationName: 'replies' }),
  votes: many(commentVotes),
}))

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
  comment: one(comments, { fields: [commentVotes.commentId], references: [comments.id] }),
  user: one(users, { fields: [commentVotes.userId], references: [users.id] }),
}))

export const voiceAccessRequestsRelations = relations(voiceAccessRequests, ({ one }) => ({
  discussion: one(discussions, { fields: [voiceAccessRequests.discussionId], references: [discussions.id] }),
  user: one(users, { fields: [voiceAccessRequests.userId], references: [users.id] }),
}))

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id], relationName: 'follower' }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: 'following' }),
}))

export const blocksRelations = relations(blocks, ({ one }) => ({
  blocker: one(users, { fields: [blocks.blockerId], references: [users.id], relationName: 'blocker' }),
  blocked: one(users, { fields: [blocks.blockedId], references: [users.id], relationName: 'blocked' }),
}))

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, { fields: [reports.reporterId], references: [users.id] }),
  reportedUser: one(users, { fields: [reports.reportedUserId], references: [users.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  aggregation: one(notificationAggregations, { fields: [notifications.aggregationId], references: [notificationAggregations.id] }),
}))

export const notificationAggregationsRelations = relations(notificationAggregations, ({ many }) => ({
  notifications: many(notifications),
}))

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, { fields: [notificationPreferences.userId], references: [users.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// MODERATION RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const fraudDetectionLogsRelations = relations(fraudDetectionLogs, ({ }) => ({
  // No direct relations - uses fingerprintHash for tracking
}))

export const moderationQueueRelations = relations(moderationQueue, ({ one }) => ({
  assignedModerator: one(users, { fields: [moderationQueue.assignedTo], references: [users.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const contentViewsRelations = relations(contentViews, ({ one }) => ({
  user: one(users, { fields: [contentViews.userId], references: [users.id] }),
}))

export const searchHistoriesRelations = relations(searchHistories, ({ one }) => ({
  user: one(users, { fields: [searchHistories.userId], references: [users.id] }),
}))

export const savedSearchesRelations = relations(savedSearches, ({ one }) => ({
  user: one(users, { fields: [savedSearches.userId], references: [users.id] }),
}))

export const feedEventsRelations = relations(feedEvents, ({ one }) => ({
  user: one(users, { fields: [feedEvents.userId], references: [users.id] }),
}))

export const preTestResultsRelations = relations(preTestResults, ({ }) => ({
  // Uses contentType/contentId pattern - no direct FK relations
}))

export const privateLinksRelations = relations(privateLinks, ({ one, many }) => ({
  creator: one(users, { fields: [privateLinks.creatorId], references: [users.id] }),
  views: many(shareLinkViews),
}))

export const sponsoredCampaignsRelations = relations(sponsoredCampaigns, ({ one }) => ({
  organization: one(organizations, { fields: [sponsoredCampaigns.organizationId], references: [organizations.id] }),
}))

export const auditLogsRelations = relations(auditLogs, ({ }) => ({
  // actorId can be user or system - uses actorType enum
}))

export const populationDistributionsRelations = relations(populationDistributions, ({ one }) => ({
  dataset: one(populationDatasets, { fields: [populationDistributions.datasetId], references: [populationDatasets.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, { fields: [userSubscriptions.userId], references: [users.id] }),
}))

export const checkoutSessionsRelations = relations(checkoutSessions, ({ one }) => ({
  user: one(users, { fields: [checkoutSessions.userId], references: [users.id] }),
}))

export const cancellationFeedbackRelations = relations(cancellationFeedback, ({ one }) => ({
  user: one(users, { fields: [cancellationFeedback.userId], references: [users.id] }),
}))

export const refundRequestsRelations = relations(refundRequests, ({ one }) => ({
  user: one(users, { fields: [refundRequests.userId], references: [users.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// MISC RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: 'children' }),
  children: many(categories, { relationName: 'children' }),
  polls: many(polls),
  surveys: many(surveys),
  tests: many(tests),
}))

export const userGamificationRelations = relations(userGamification, ({ one }) => ({
  user: one(users, { fields: [userGamification.userId], references: [users.id] }),
}))

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}))

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.userId], references: [users.id] }),
  badge: one(badges, { fields: [userBadges.badgeId], references: [badges.id] }),
}))

export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
  gamification: one(userGamification, { fields: [xpTransactions.gamificationId], references: [userGamification.id] }),
}))

export const webhookEndpointsRelations = relations(webhookEndpoints, ({ one, many }) => ({
  organization: one(organizations, { fields: [webhookEndpoints.organizationId], references: [organizations.id] }),
  deliveries: many(webhookDeliveries),
}))

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  endpoint: one(webhookEndpoints, { fields: [webhookDeliveries.webhookEndpointId], references: [webhookEndpoints.id] }),
}))

export const consentPoliciesRelations = relations(consentPolicies, ({ many }) => ({
  userConsents: many(userConsents),
}))

export const userConsentsRelations = relations(userConsents, ({ one }) => ({
  user: one(users, { fields: [userConsents.userId], references: [users.id] }),
  policy: one(consentPolicies, { fields: [userConsents.policyId], references: [consentPolicies.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const pollTemplatesRelations = relations(pollTemplates, ({ one, many }) => ({
  creator: one(users, { fields: [pollTemplates.creatorId], references: [users.id] }),
  organization: one(organizations, { fields: [pollTemplates.organizationId], references: [organizations.id] }),
  usages: many(pollTemplateUsages),
  polls: many(polls),
}))

export const pollTemplateUsagesRelations = relations(pollTemplateUsages, ({ one }) => ({
  template: one(pollTemplates, { fields: [pollTemplateUsages.templateId], references: [pollTemplates.id] }),
  user: one(users, { fields: [pollTemplateUsages.userId], references: [users.id] }),
}))

export const shareLinkViewsRelations = relations(shareLinkViews, ({ one }) => ({
  link: one(privateLinks, { fields: [shareLinkViews.linkId], references: [privateLinks.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// JOB & EXPORT RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const scheduledJobsRelations = relations(scheduledJobs, ({ one }) => ({
  createdBy: one(users, { fields: [scheduledJobs.createdBy], references: [users.id] }),
}))

export const dataExportsRelations = relations(dataExports, ({ one }) => ({
  user: one(users, { fields: [dataExports.userId], references: [users.id] }),
  organization: one(organizations, { fields: [dataExports.organizationId], references: [organizations.id] }),
}))
