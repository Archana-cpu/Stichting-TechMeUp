// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - DRIZZLE ENUMS
// All PostgreSQL enums for VoxPoll database schema
// ══════════════════════════════════════════════════════════════════════════════

import { pgEnum } from 'drizzle-orm/pg-core'

// ─────────────────────────────────────────────────────────────────────────────
// User & Auth Enums
// ─────────────────────────────────────────────────────────────────────────────

export const userStatusEnum = pgEnum('UserStatus', [
  'ACTIVE',
  'SUSPENDED',
  'BANNED',
  'PENDING_VERIFICATION',
  'DEACTIVATED',
  'DORMANT',
  'DELETED',
])

export const userRoleEnum = pgEnum('UserRole', [
  'USER',
  'MODERATOR',
  'ADMIN',
  'SUPER_ADMIN',
])

export const authProviderEnum = pgEnum('AuthProvider', [
  'GOOGLE',
  'APPLE',
  'E_DEVLET',
])

export const verificationMethodEnum = pgEnum('VerificationMethod', [
  'EMAIL',
  'PHONE',
  'GOVERNMENT_ID',
  'ORGANIZATION',
])

export const verificationLevelEnum = pgEnum('VerificationLevel', [
  'NONE',
  'BASIC',
  'VERIFIED',
  'IDENTITY',
  'FULLY_VERIFIED',
])

// ─────────────────────────────────────────────────────────────────────────────
// Demographics Enums
// ─────────────────────────────────────────────────────────────────────────────

export const genderEnum = pgEnum('Gender', [
  'MALE',
  'FEMALE',
  'NON_BINARY',
  'PREFER_NOT_TO_SAY',
])

export const educationLevelEnum = pgEnum('EducationLevel', [
  'PRIMARY',
  'SECONDARY',
  'HIGH_SCHOOL',
  'ASSOCIATE',
  'BACHELOR',
  'MASTER',
  'DOCTORATE',
  'OTHER',
])

export const maritalStatusEnum = pgEnum('MaritalStatus', [
  'SINGLE',
  'MARRIED',
  'DIVORCED',
  'WIDOWED',
  'PREFER_NOT_TO_SAY',
])

export const employmentStatusEnum = pgEnum('EmploymentStatus', [
  'EMPLOYED_FULL',
  'EMPLOYED_PART',
  'SELF_EMPLOYED',
  'UNEMPLOYED',
  'STUDENT',
  'RETIRED',
  'OTHER',
])

// ─────────────────────────────────────────────────────────────────────────────
// Content Status Enums
// ─────────────────────────────────────────────────────────────────────────────

export const contentStatusEnum = pgEnum('ContentStatus', [
  'DRAFT',
  'SCHEDULED',
  'ACTIVE',
  'PAUSED',
  'ENDED',
  'ARCHIVED',
])

export const contentVisibilityEnum = pgEnum('ContentVisibility', [
  'PUBLIC',
  'UNLISTED',
  'PRIVATE',
  'FOLLOWERS_ONLY',
  'ORGANIZATION_ONLY',
])

export const deviceCategoryEnum = pgEnum('DeviceCategory', [
  'DESKTOP',
  'MOBILE',
  'TABLET',
  'UNKNOWN',
])

export const contentTypeEnum = pgEnum('ContentType', [
  'POLL',
  'QUICK_POLL',
  'LIVE_POLL',
  'SURVEY',
  'TEST',
])

// ─────────────────────────────────────────────────────────────────────────────
// Poll Enums
// ─────────────────────────────────────────────────────────────────────────────

export const pollTypeEnum = pgEnum('PollType', [
  'STANDARD',
  'QUICK_POLL',
  'LIVE_POLL',
  'RANKED_CHOICE',
  'DEMOGRAPHIC',
])

export const questionTypeEnum = pgEnum('QuestionType', [
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'RANKING',
  'RATING_SCALE',
  'OPEN_TEXT',
  'SLIDER',
  'MATRIX_SINGLE',
  'MATRIX_MULTIPLE',
  'DATE',
  'TIME',
  'FILE_UPLOAD',
  'NPS',
  'LIKERT',
  'SEMANTIC_DIFFERENTIAL',
])

export const votingSystemEnum = pgEnum('VotingSystem', [
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'RANKED_CHOICE',
  'APPROVAL',
  'QUADRATIC',
])

export const resultVisibilityEnum = pgEnum('ResultVisibility', [
  'ALWAYS',
  'AFTER_VOTE',
  'AFTER_END',
  'NEVER',
])

export const livePollStatusEnum = pgEnum('LivePollStatus', [
  'WAITING',
  'ACTIVE',
  'PAUSED',
  'ENDED',
])

// ─────────────────────────────────────────────────────────────────────────────
// Survey Enums
// ─────────────────────────────────────────────────────────────────────────────

export const surveyTypeEnum = pgEnum('SurveyType', [
  'STANDARD',
  'LONGITUDINAL',
  'PANEL',
  'ANONYMOUS',
  'INCENTIVIZED',
])

export const incentiveTypeEnum = pgEnum('IncentiveType', [
  'POINTS',
  'BADGE',
  'RAFFLE',
  'DIRECT_PAYMENT',
])

export const invitationStatusEnum = pgEnum('InvitationStatus', [
  'PENDING',
  'SENT',
  'OPENED',
  'STARTED',
  'COMPLETED',
  'EXPIRED',
  'BOUNCED',
])

export const surveySessionModeEnum = pgEnum('SurveySessionMode', [
  'SINGLE',
  'MULTI',
  'OFFLINE',
])

// ─────────────────────────────────────────────────────────────────────────────
// Test Enums
// ─────────────────────────────────────────────────────────────────────────────

export const testCategoryEnum = pgEnum('TestCategory', [
  'PERSONALITY',
  'QUIZ',
])

export const personalityTestTypeEnum = pgEnum('PersonalityTestType', [
  'AXIS',
  'CHARACTER',
  'SPECTRUM',
])

export const personalityQuestionTypeEnum = pgEnum('PersonalityQuestionType', [
  'STATEMENT_AGREE_5',
  'STATEMENT_AGREE_7',
  'AGREE_DISAGREE',
  'FORCED_CHOICE',
  'THIS_OR_THAT',
  'BINARY_CHOICE',
  'WORD_PAIR',
  'SLIDER',
  'SLIDER_BIPOLAR',
  'SINGLE_CHOICE',
  'IMAGE_CHOICE',
  'IMAGE_SCENARIO',
  'RANKING',
  'SCENARIO_CHOICE',
  'HYPOTHETICAL',
  'STATEMENT_AGREE_REVERSE',
])

export const quizTypeEnum = pgEnum('QuizType', [
  'KNOWLEDGE',
  'TRIVIA',
  'EDUCATIONAL',
  'SKILL_ASSESSMENT',
])

export const quizQuestionTypeEnum = pgEnum('QuizQuestionType', [
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'SHORT_ANSWER',
  'FILL_BLANK',
  'FILL_BLANK_MULTIPLE',
  'MATCHING',
  'ORDERING',
  'CATEGORIZATION',
  'HOTSPOT',
  'DRAG_DROP',
  'PARTIAL_CREDIT_MULTI',
  'WEIGHTED_MULTI',
])

export const questionDifficultyEnum = pgEnum('QuestionDifficulty', [
  'EASY',
  'MEDIUM',
  'HARD',
])

export const attemptStatusEnum = pgEnum('AttemptStatus', [
  'IN_PROGRESS',
  'COMPLETED',
  'TIMED_OUT',
  'ABANDONED',
])

// ─────────────────────────────────────────────────────────────────────────────
// Response Enums
// ─────────────────────────────────────────────────────────────────────────────

export const responseStatusEnum = pgEnum('ResponseStatus', [
  'SCREENING',
  'IN_PROGRESS',
  'PAUSED',
  'SUBMITTED',
  'VALIDATED',
  'COMPLETED',
  'ABANDONED',
  'DISQUALIFIED',
  'TIMEOUT',
  'QUOTA_FULL',
])

export const reviewStatusEnum = pgEnum('ReviewStatus', [
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'FLAGGED',
])

// ─────────────────────────────────────────────────────────────────────────────
// Social Enums
// ─────────────────────────────────────────────────────────────────────────────

export const discussionStatusEnum = pgEnum('DiscussionStatus', [
  'CLOSED',
  'OPEN',
  'LOCKED',
  'ARCHIVED',
])

export const commentStatusEnum = pgEnum('CommentStatus', [
  'VISIBLE',
  'HIDDEN',
  'DELETED',
  'FLAGGED',
  'PENDING_REVIEW',
])

export const followStatusEnum = pgEnum('FollowStatus', [
  'PENDING',
  'ACTIVE',
  'REJECTED',
])

export const voiceAccessStatusEnum = pgEnum('VoiceAccessStatus', [
  'PENDING',
  'APPROVED',
  'DENIED',
  'EXPIRED',
])

// ─────────────────────────────────────────────────────────────────────────────
// Report Enums
// ─────────────────────────────────────────────────────────────────────────────

export const reportTargetTypeEnum = pgEnum('ReportTargetType', [
  'USER',
  'POLL',
  'SURVEY',
  'TEST',
  'COMMENT',
  'DISCUSSION',
])

export const reportReasonEnum = pgEnum('ReportReason', [
  'SPAM',
  'HARASSMENT',
  'HATE_SPEECH',
  'MISINFORMATION',
  'INAPPROPRIATE_CONTENT',
  'VIOLENCE',
  'SELF_HARM',
  'ILLEGAL_CONTENT',
  'COPYRIGHT',
  'IMPERSONATION',
  'OTHER',
])

export const reportStatusEnum = pgEnum('ReportStatus', [
  'PENDING',
  'IN_REVIEW',
  'RESOLVED',
  'DISMISSED',
  'ESCALATED',
])

export const reportPriorityEnum = pgEnum('ReportPriority', [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT',
])

export const reportResolutionEnum = pgEnum('ReportResolution', [
  'NO_VIOLATION',
  'WARNING_ISSUED',
  'CONTENT_REMOVED',
  'CONTENT_MODIFIED',
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_BANNED',
  'ESCALATED_TO_LEGAL',
])

// ─────────────────────────────────────────────────────────────────────────────
// Gamification Enums
// ─────────────────────────────────────────────────────────────────────────────

export const badgeCategoryEnum = pgEnum('BadgeCategory', [
  'PARTICIPATION',
  'CREATION',
  'QUALITY',
  'SOCIAL',
  'STREAK',
  'SPECIAL',
  'ACHIEVEMENT',
])

export const badgeRarityEnum = pgEnum('BadgeRarity', [
  'COMMON',
  'UNCOMMON',
  'RARE',
  'EPIC',
  'LEGENDARY',
])

export const xpTransactionTypeEnum = pgEnum('XPTransactionType', [
  'EARNED',
  'BONUS',
  'PENALTY',
  'ADJUSTMENT',
])

// ─────────────────────────────────────────────────────────────────────────────
// Notification Enums
// ─────────────────────────────────────────────────────────────────────────────

export const notificationTypeEnum = pgEnum('NotificationType', [
  'POLL_PUBLISHED',
  'POLL_ENDING_SOON',
  'POLL_ENDED',
  'POLL_RESULTS_AVAILABLE',
  'POLL_VOTE_RECEIVED',
  'SURVEY_INVITATION',
  'SURVEY_REMINDER',
  'SURVEY_ENDED',
  'SURVEY_PARTICIPATION',
  'TEST_PUBLISHED',
  'TEST_RESULTS_AVAILABLE',
  'TEST_COMPLETION',
  'CONTENT_MILESTONE',
  'CONTENT_SHARED',
  'RESPONSE_RECEIVED',
  'NEW_FOLLOWER',
  'FOLLOW_REQUEST',
  'FOLLOW_REQUEST_ACCEPTED',
  'COMMENT_ON_YOUR_CONTENT',
  'REPLY_TO_YOUR_COMMENT',
  'MENTION_IN_COMMENT',
  'COMMENT_UPVOTED',
  'ACCESS_REQUEST_RECEIVED',
  'ACCESS_REQUEST_APPROVED',
  'ACCESS_REQUEST_DENIED',
  'ACCOUNT_VERIFIED',
  'VERIFICATION_UPGRADED',
  'PASSWORD_CHANGED',
  'NEW_DEVICE_LOGIN',
  'SECURITY_ALERT',
  'ACCOUNT_WARNING',
  'SUBSCRIPTION_CHANGED',
  'SUBSCRIPTION_RENEWED',
  'TRIAL_ENDING_SOON',
  'PAYMENT_DUE',
  'PAYMENT_FAILED',
  'BADGE_EARNED',
  'LEVEL_UP',
  'STREAK_MILESTONE',
  'LEADERBOARD_RANK_CHANGE',
  'ORG_INVITATION',
  'ORG_ROLE_CHANGED',
  'ORG_CONTENT_PUBLISHED',
  'ORG_MEMBER_JOINED',
  'ORG_MEMBER_LEFT',
  'ORG_SURVEY_RESPONSE_MILESTONE',
  'CONTENT_REMOVED',
  'CONTENT_RESTORED',
  'COMMENT_REMOVED',
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_UNSUSPENDED',
  'REPORT_RESOLVED',
  'REPORT_RECEIVED',
  'CONTENT_PENDING_APPROVAL',
  'CONTENT_APPROVED',
  'CONTENT_REJECTED',
  'CONTENT_REVISION_REQUESTED',
  'APPEAL_SUBMITTED',
  'APPEAL_ACCEPTED',
  'APPEAL_DENIED',
  'MODERATOR_ASSIGNED_APPROVAL',
  'MODERATOR_ASSIGNED_APPEAL',
  'SYSTEM_ANNOUNCEMENT',
  'MAINTENANCE_SCHEDULED',
  'DATA_EXPORT_READY',
])

export const notificationCategoryEnum = pgEnum('NotificationCategory', [
  'CONTENT',
  'SOCIAL',
  'SYSTEM',
  'ORGANIZATION',
  'MODERATION',
])

export const notificationPriorityEnum = pgEnum('NotificationPriority', [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT',
])

export const notificationStatusEnum = pgEnum('NotificationStatus', [
  'UNREAD',
  'READ',
  'ARCHIVED',
  'DELETED',
])

export const actorTypeEnum = pgEnum('ActorType', [
  'USER',
  'ORGANIZATION',
  'SYSTEM',
])

export const resourceTypeEnum = pgEnum('ResourceType', [
  'POLL',
  'SURVEY',
  'TEST',
  'COMMENT',
  'DISCUSSION',
  'BADGE',
  'REPORT',
])

export const digestFrequencyEnum = pgEnum('DigestFrequency', [
  'DAILY',
  'WEEKLY',
])

export const pushPlatformEnum = pgEnum('PushPlatform', [
  'FCM',
  'APNS',
  'WEB_PUSH',
])

// ─────────────────────────────────────────────────────────────────────────────
// Organization Enums
// ─────────────────────────────────────────────────────────────────────────────

export const organizationTypeEnum = pgEnum('OrganizationType', [
  'COMPANY',
  'EDUCATIONAL',
  'NONPROFIT',
  'GOVERNMENT',
  'MEDIA',
  'RESEARCH',
])

export const organizationRoleEnum = pgEnum('OrganizationRole', [
  'OWNER',
  'ADMIN',
  'MANAGER',
  'ANALYST',
  'CREATOR',
  'MEMBER',
])

export const organizationPlanEnum = pgEnum('OrganizationPlan', [
  'STARTER',
  'PROFESSIONAL',
  'ENTERPRISE',
])

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Enums
// ─────────────────────────────────────────────────────────────────────────────

export const userSubscriptionTierEnum = pgEnum('UserSubscriptionTier', [
  'FREE',
  'PLUS',
  'PREMIUM',
])

export const subscriptionStatusEnum = pgEnum('SubscriptionStatus', [
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'INCOMPLETE',
  'TRIALING',
])

export const billingPeriodEnum = pgEnum('BillingPeriod', [
  'MONTHLY',
  'YEARLY',
])

export const paymentMethodTypeEnum = pgEnum('PaymentMethodType', [
  'CARD',
  'APPLE_PAY',
  'GOOGLE_PAY',
])

export const currencyEnum = pgEnum('Currency', [
  'USD',
  'TRY',
])

export const checkoutSessionStatusEnum = pgEnum('CheckoutSessionStatus', [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
])

export const cancellationReasonEnum = pgEnum('CancellationReason', [
  'TOO_EXPENSIVE',
  'MISSING_FEATURES',
  'SWITCHING_SERVICE',
  'TEMPORARY_PAUSE',
  'OTHER',
])

export const refundCaseEnum = pgEnum('RefundCase', [
  'TECHNICAL_ISSUE',
  'DUPLICATE_CHARGE',
  'FRAUD',
  'FIRST_TIME_USER',
  'OTHER',
])

export const refundStatusEnum = pgEnum('RefundStatus', [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'PROCESSED',
])

// ─────────────────────────────────────────────────────────────────────────────
// Private Link Enums
// ─────────────────────────────────────────────────────────────────────────────

export const privateLinkStatusEnum = pgEnum('PrivateLinkStatus', [
  'ACTIVE',
  'EXPIRED',
  'EXHAUSTED',
  'DISABLED',
])

export const privateLinkContentTypeEnum = pgEnum('PrivateLinkContentType', [
  'POLL',
  'SURVEY',
  'TEST',
])

// ─────────────────────────────────────────────────────────────────────────────
// Trust & Fraud Enums
// ─────────────────────────────────────────────────────────────────────────────

export const ipTypeEnum = pgEnum('IPType', [
  'RESIDENTIAL',
  'MOBILE',
  'CORPORATE',
  'DATACENTER',
  'EDUCATION',
  'UNKNOWN',
])

export const fraudEntityTypeEnum = pgEnum('FraudEntityType', [
  'USER_REGISTRATION',
  'SESSION',
  'POLL_RESPONSE',
  'SURVEY_RESPONSE',
  'COMMENT',
])

export const fraudDecisionEnum = pgEnum('FraudDecision', [
  'ACCEPT',
  'REVIEW',
  'SOFT_REJECT',
  'HARD_REJECT',
])

// ─────────────────────────────────────────────────────────────────────────────
// Webhook Enums
// ─────────────────────────────────────────────────────────────────────────────

export const webhookEventTypeEnum = pgEnum('WebhookEventType', [
  'survey_created',
  'survey_published',
  'survey_completed',
  'survey_response_submitted',
  'survey_response_milestone',
  'poll_created',
  'poll_published',
  'poll_ended',
  'test_created',
  'test_published',
  'test_completed',
  'organization_member_joined',
  'organization_member_left',
  'organization_role_changed',
])

export const webhookDeliveryStatusEnum = pgEnum('WebhookDeliveryStatus', [
  'PENDING',
  'DELIVERED',
  'FAILED',
  'RETRYING',
])

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Enums
// ─────────────────────────────────────────────────────────────────────────────

export const sponsoredContentTypeEnum = pgEnum('SponsoredContentType', [
  'POLL',
  'SURVEY',
])

export const campaignStatusEnum = pgEnum('CampaignStatus', [
  'DRAFT',
  'PENDING_APPROVAL',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
])

// ─────────────────────────────────────────────────────────────────────────────
// Feed & Discovery Enums
// ─────────────────────────────────────────────────────────────────────────────

export const contentViewTypeEnum = pgEnum('ContentViewType', [
  'POLL',
  'SURVEY',
  'TEST',
  'USER_PROFILE',
  'DISCUSSION',
])

export const viewSourceEnum = pgEnum('ViewSource', [
  'HOME_FEED',
  'EXPLORE_FEED',
  'FOLLOWING_FEED',
  'CATEGORY_FEED',
  'SEARCH',
  'DIRECT_LINK',
  'NOTIFICATION',
  'SHARE',
])

export const profileVisitSourceEnum = pgEnum('ProfileVisitSource', [
  'SEARCH',
  'FEED',
  'COMMENT',
  'MENTION',
  'DIRECT',
  'EXTERNAL',
])

export const feedEventTypeEnum = pgEnum('FeedEventType', [
  'IMPRESSION',
  'CLICK',
  'PARTICIPATION_START',
  'PARTICIPATION_COMPLETE',
  'SHARE',
  'SKIP',
  'HIDE',
])

export const savedSearchNotifyFreqEnum = pgEnum('SavedSearchNotifyFreq', [
  'REALTIME',
  'DAILY',
  'WEEKLY',
])

export const preTestContentTypeEnum = pgEnum('PreTestContentType', [
  'POLL',
  'SURVEY',
])

// ─────────────────────────────────────────────────────────────────────────────
// Audit Enums
// ─────────────────────────────────────────────────────────────────────────────

export const eventSeverityEnum = pgEnum('EventSeverity', [
  'DEBUG',
  'INFO',
  'WARNING',
  'ERROR',
  'CRITICAL',
])

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting Enums
// ─────────────────────────────────────────────────────────────────────────────

export const rateLimitTypeEnum = pgEnum('RateLimitType', [
  'IP',
  'USER',
  'API_KEY',
  'GLOBAL',
])

// ─────────────────────────────────────────────────────────────────────────────
// Moderation Enums
// ─────────────────────────────────────────────────────────────────────────────

export const moderationStatusEnum = pgEnum('ModerationStatus', [
  'PENDING',
  'ASSIGNED',
  'IN_REVIEW',
  'APPROVED',
  'REJECTED',
  'RESOLVED',
  'DISMISSED',
  'ESCALATED',
])

export const moderationResolutionEnum = pgEnum('ModerationResolution', [
  'NO_ACTION',
  'WARNING_ISSUED',
  'CONTENT_REMOVED',
  'CONTENT_MODIFIED',
  'USER_WARNED',
  'USER_SUSPENDED',
  'USER_BANNED',
  'ESCALATED_TO_ADMIN',
])

export const approvalStatusEnum = pgEnum('ApprovalStatus', [
  'NONE',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'REVISION_REQUESTED',
])

export const appealStatusEnum = pgEnum('AppealStatus', [
  'PENDING',
  'UNDER_REVIEW',
  'ACCEPTED',
  'DENIED',
])

export const moderationActionTypeEnum = pgEnum('ModerationActionType', [
  'CONTENT_APPROVED',
  'CONTENT_REJECTED',
  'CONTENT_REVISION_REQUESTED',
  'USER_WARNED',
  'USER_SUSPENDED',
  'USER_BANNED',
  'USER_UNBANNED',
  'REPORT_RESOLVED',
  'REPORT_DISMISSED',
  'APPEAL_ACCEPTED',
  'APPEAL_DENIED',
  'CONTENT_REMOVED',
  'CONTENT_RESTORED',
  'BULK_ACTION',
])

// ─────────────────────────────────────────────────────────────────────────────
// Direct Message Enums (Bible: P-022)
// ─────────────────────────────────────────────────────────────────────────────

export const conversationStatusEnum = pgEnum('ConversationStatus', [
  'ACTIVE',
  'ARCHIVED',
  'DELETED',
])

export const messageStatusEnum = pgEnum('MessageStatus', [
  'SENT',
  'DELIVERED',
  'READ',
  'DELETED',
])
