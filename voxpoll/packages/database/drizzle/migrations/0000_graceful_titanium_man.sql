CREATE TYPE "public"."ActorType" AS ENUM('USER', 'ORGANIZATION', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."AttemptStatus" AS ENUM('IN_PROGRESS', 'COMPLETED', 'TIMED_OUT', 'ABANDONED');--> statement-breakpoint
CREATE TYPE "public"."AuthProvider" AS ENUM('GOOGLE', 'APPLE', 'E_DEVLET');--> statement-breakpoint
CREATE TYPE "public"."BadgeCategory" AS ENUM('PARTICIPATION', 'CREATION', 'QUALITY', 'SOCIAL', 'STREAK', 'SPECIAL', 'ACHIEVEMENT');--> statement-breakpoint
CREATE TYPE "public"."BadgeRarity" AS ENUM('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');--> statement-breakpoint
CREATE TYPE "public"."BillingPeriod" AS ENUM('MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."CampaignStatus" AS ENUM('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."CancellationReason" AS ENUM('TOO_EXPENSIVE', 'MISSING_FEATURES', 'SWITCHING_SERVICE', 'TEMPORARY_PAUSE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."CheckoutSessionStatus" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."CommentStatus" AS ENUM('VISIBLE', 'HIDDEN', 'DELETED', 'FLAGGED', 'PENDING_REVIEW');--> statement-breakpoint
CREATE TYPE "public"."ContentStatus" AS ENUM('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ENDED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."ContentType" AS ENUM('POLL', 'QUICK_POLL', 'LIVE_POLL', 'SURVEY', 'TEST');--> statement-breakpoint
CREATE TYPE "public"."ContentViewType" AS ENUM('POLL', 'SURVEY', 'TEST', 'USER_PROFILE', 'DISCUSSION');--> statement-breakpoint
CREATE TYPE "public"."ContentVisibility" AS ENUM('PUBLIC', 'UNLISTED', 'PRIVATE', 'FOLLOWERS_ONLY', 'ORGANIZATION_ONLY');--> statement-breakpoint
CREATE TYPE "public"."Currency" AS ENUM('USD', 'TRY');--> statement-breakpoint
CREATE TYPE "public"."DeviceCategory" AS ENUM('DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."DigestFrequency" AS ENUM('DAILY', 'WEEKLY');--> statement-breakpoint
CREATE TYPE "public"."DiscussionStatus" AS ENUM('CLOSED', 'OPEN', 'LOCKED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."EducationLevel" AS ENUM('PRIMARY', 'SECONDARY', 'HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."EmploymentStatus" AS ENUM('EMPLOYED_FULL', 'EMPLOYED_PART', 'SELF_EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."EventSeverity" AS ENUM('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."FeedEventType" AS ENUM('IMPRESSION', 'CLICK', 'PARTICIPATION_START', 'PARTICIPATION_COMPLETE', 'SHARE', 'SKIP', 'HIDE');--> statement-breakpoint
CREATE TYPE "public"."FollowStatus" AS ENUM('PENDING', 'ACTIVE', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."FraudDecision" AS ENUM('ACCEPT', 'REVIEW', 'SOFT_REJECT', 'HARD_REJECT');--> statement-breakpoint
CREATE TYPE "public"."FraudEntityType" AS ENUM('USER_REGISTRATION', 'SESSION', 'POLL_RESPONSE', 'SURVEY_RESPONSE', 'COMMENT');--> statement-breakpoint
CREATE TYPE "public"."Gender" AS ENUM('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');--> statement-breakpoint
CREATE TYPE "public"."IncentiveType" AS ENUM('POINTS', 'BADGE', 'RAFFLE', 'DIRECT_PAYMENT');--> statement-breakpoint
CREATE TYPE "public"."InvitationStatus" AS ENUM('PENDING', 'SENT', 'OPENED', 'STARTED', 'COMPLETED', 'EXPIRED', 'BOUNCED');--> statement-breakpoint
CREATE TYPE "public"."IPType" AS ENUM('RESIDENTIAL', 'MOBILE', 'CORPORATE', 'DATACENTER', 'EDUCATION', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."LivePollStatus" AS ENUM('WAITING', 'ACTIVE', 'PAUSED', 'ENDED');--> statement-breakpoint
CREATE TYPE "public"."MaritalStatus" AS ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'PREFER_NOT_TO_SAY');--> statement-breakpoint
CREATE TYPE "public"."ModerationResolution" AS ENUM('NO_ACTION', 'WARNING_ISSUED', 'CONTENT_REMOVED', 'CONTENT_MODIFIED', 'USER_WARNED', 'USER_SUSPENDED', 'USER_BANNED', 'ESCALATED_TO_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."ModerationStatus" AS ENUM('PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED', 'ESCALATED');--> statement-breakpoint
CREATE TYPE "public"."NotificationCategory" AS ENUM('CONTENT', 'SOCIAL', 'SYSTEM', 'ORGANIZATION', 'MODERATION');--> statement-breakpoint
CREATE TYPE "public"."NotificationPriority" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."NotificationStatus" AS ENUM('UNREAD', 'READ', 'ARCHIVED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."NotificationType" AS ENUM('POLL_PUBLISHED', 'POLL_ENDING_SOON', 'POLL_ENDED', 'POLL_RESULTS_AVAILABLE', 'POLL_VOTE_RECEIVED', 'SURVEY_INVITATION', 'SURVEY_REMINDER', 'SURVEY_ENDED', 'SURVEY_PARTICIPATION', 'TEST_PUBLISHED', 'TEST_RESULTS_AVAILABLE', 'TEST_COMPLETION', 'CONTENT_MILESTONE', 'CONTENT_SHARED', 'RESPONSE_RECEIVED', 'NEW_FOLLOWER', 'FOLLOW_REQUEST', 'FOLLOW_REQUEST_ACCEPTED', 'COMMENT_ON_YOUR_CONTENT', 'REPLY_TO_YOUR_COMMENT', 'MENTION_IN_COMMENT', 'COMMENT_UPVOTED', 'ACCESS_REQUEST_RECEIVED', 'ACCESS_REQUEST_APPROVED', 'ACCESS_REQUEST_DENIED', 'ACCOUNT_VERIFIED', 'VERIFICATION_UPGRADED', 'PASSWORD_CHANGED', 'NEW_DEVICE_LOGIN', 'SECURITY_ALERT', 'ACCOUNT_WARNING', 'SUBSCRIPTION_CHANGED', 'SUBSCRIPTION_RENEWED', 'TRIAL_ENDING_SOON', 'PAYMENT_DUE', 'PAYMENT_FAILED', 'BADGE_EARNED', 'LEVEL_UP', 'STREAK_MILESTONE', 'LEADERBOARD_RANK_CHANGE', 'ORG_INVITATION', 'ORG_ROLE_CHANGED', 'ORG_CONTENT_PUBLISHED', 'ORG_MEMBER_JOINED', 'ORG_MEMBER_LEFT', 'ORG_SURVEY_RESPONSE_MILESTONE', 'CONTENT_REMOVED', 'CONTENT_RESTORED', 'COMMENT_REMOVED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_UNSUSPENDED', 'REPORT_RESOLVED', 'REPORT_RECEIVED', 'SYSTEM_ANNOUNCEMENT', 'MAINTENANCE_SCHEDULED', 'DATA_EXPORT_READY');--> statement-breakpoint
CREATE TYPE "public"."OrganizationPlan" AS ENUM('STARTER', 'PROFESSIONAL', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "public"."OrganizationRole" AS ENUM('OWNER', 'ADMIN', 'MANAGER', 'ANALYST', 'CREATOR', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."OrganizationType" AS ENUM('COMPANY', 'EDUCATIONAL', 'NONPROFIT', 'GOVERNMENT', 'MEDIA', 'RESEARCH');--> statement-breakpoint
CREATE TYPE "public"."PaymentMethodType" AS ENUM('CARD', 'APPLE_PAY', 'GOOGLE_PAY');--> statement-breakpoint
CREATE TYPE "public"."PersonalityQuestionType" AS ENUM('STATEMENT_AGREE_5', 'STATEMENT_AGREE_7', 'AGREE_DISAGREE', 'FORCED_CHOICE', 'THIS_OR_THAT', 'BINARY_CHOICE', 'WORD_PAIR', 'SLIDER', 'SLIDER_BIPOLAR', 'SINGLE_CHOICE', 'IMAGE_CHOICE', 'IMAGE_SCENARIO', 'RANKING', 'SCENARIO_CHOICE', 'HYPOTHETICAL', 'STATEMENT_AGREE_REVERSE');--> statement-breakpoint
CREATE TYPE "public"."PersonalityTestType" AS ENUM('AXIS', 'CHARACTER', 'SPECTRUM');--> statement-breakpoint
CREATE TYPE "public"."PollType" AS ENUM('STANDARD', 'QUICK_POLL', 'LIVE_POLL', 'RANKED_CHOICE', 'DEMOGRAPHIC');--> statement-breakpoint
CREATE TYPE "public"."PreTestContentType" AS ENUM('POLL', 'SURVEY');--> statement-breakpoint
CREATE TYPE "public"."PrivateLinkContentType" AS ENUM('POLL', 'SURVEY', 'TEST');--> statement-breakpoint
CREATE TYPE "public"."PrivateLinkStatus" AS ENUM('ACTIVE', 'EXPIRED', 'EXHAUSTED', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."PushPlatform" AS ENUM('FCM', 'APNS', 'WEB_PUSH');--> statement-breakpoint
CREATE TYPE "public"."QuestionDifficulty" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TYPE "public"."QuestionType" AS ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'RANKING', 'RATING_SCALE', 'OPEN_TEXT', 'SLIDER', 'MATRIX_SINGLE', 'MATRIX_MULTIPLE', 'DATE', 'TIME', 'FILE_UPLOAD', 'NPS', 'LIKERT', 'SEMANTIC_DIFFERENTIAL');--> statement-breakpoint
CREATE TYPE "public"."QuizQuestionType" AS ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_BLANK', 'FILL_BLANK_MULTIPLE', 'MATCHING', 'ORDERING', 'CATEGORIZATION', 'HOTSPOT', 'DRAG_DROP', 'PARTIAL_CREDIT_MULTI', 'WEIGHTED_MULTI');--> statement-breakpoint
CREATE TYPE "public"."QuizType" AS ENUM('KNOWLEDGE', 'TRIVIA', 'EDUCATIONAL', 'SKILL_ASSESSMENT');--> statement-breakpoint
CREATE TYPE "public"."RateLimitType" AS ENUM('IP', 'USER', 'API_KEY', 'GLOBAL');--> statement-breakpoint
CREATE TYPE "public"."RefundCase" AS ENUM('TECHNICAL_ISSUE', 'DUPLICATE_CHARGE', 'FRAUD', 'FIRST_TIME_USER', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."RefundStatus" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED');--> statement-breakpoint
CREATE TYPE "public"."ReportPriority" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."ReportReason" AS ENUM('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'MISINFORMATION', 'INAPPROPRIATE_CONTENT', 'VIOLENCE', 'SELF_HARM', 'ILLEGAL_CONTENT', 'COPYRIGHT', 'IMPERSONATION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."ReportResolution" AS ENUM('NO_VIOLATION', 'WARNING_ISSUED', 'CONTENT_REMOVED', 'CONTENT_MODIFIED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_BANNED', 'ESCALATED_TO_LEGAL');--> statement-breakpoint
CREATE TYPE "public"."ReportStatus" AS ENUM('PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED', 'ESCALATED');--> statement-breakpoint
CREATE TYPE "public"."ReportTargetType" AS ENUM('USER', 'POLL', 'SURVEY', 'TEST', 'COMMENT', 'DISCUSSION');--> statement-breakpoint
CREATE TYPE "public"."ResourceType" AS ENUM('POLL', 'SURVEY', 'TEST', 'COMMENT', 'DISCUSSION', 'BADGE', 'REPORT');--> statement-breakpoint
CREATE TYPE "public"."ResponseStatus" AS ENUM('SCREENING', 'IN_PROGRESS', 'PAUSED', 'SUBMITTED', 'VALIDATED', 'COMPLETED', 'ABANDONED', 'DISQUALIFIED', 'TIMEOUT', 'QUOTA_FULL');--> statement-breakpoint
CREATE TYPE "public"."ResultVisibility" AS ENUM('ALWAYS', 'AFTER_VOTE', 'AFTER_END', 'NEVER');--> statement-breakpoint
CREATE TYPE "public"."ReviewStatus" AS ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'FLAGGED');--> statement-breakpoint
CREATE TYPE "public"."SavedSearchNotifyFreq" AS ENUM('REALTIME', 'DAILY', 'WEEKLY');--> statement-breakpoint
CREATE TYPE "public"."SponsoredContentType" AS ENUM('POLL', 'SURVEY');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionStatus" AS ENUM('ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'TRIALING');--> statement-breakpoint
CREATE TYPE "public"."SurveySessionMode" AS ENUM('SINGLE', 'MULTI', 'OFFLINE');--> statement-breakpoint
CREATE TYPE "public"."SurveyType" AS ENUM('STANDARD', 'LONGITUDINAL', 'PANEL', 'ANONYMOUS', 'INCENTIVIZED');--> statement-breakpoint
CREATE TYPE "public"."TestCategory" AS ENUM('PERSONALITY', 'QUIZ');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION', 'DEACTIVATED', 'DORMANT', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."UserSubscriptionTier" AS ENUM('FREE', 'PLUS', 'PREMIUM');--> statement-breakpoint
CREATE TYPE "public"."VerificationLevel" AS ENUM('NONE', 'BASIC', 'VERIFIED', 'IDENTITY', 'FULLY_VERIFIED');--> statement-breakpoint
CREATE TYPE "public"."VerificationMethod" AS ENUM('EMAIL', 'PHONE', 'GOVERNMENT_ID', 'ORGANIZATION');--> statement-breakpoint
CREATE TYPE "public"."ViewSource" AS ENUM('HOME_FEED', 'EXPLORE_FEED', 'FOLLOWING_FEED', 'CATEGORY_FEED', 'SEARCH', 'DIRECT_LINK', 'NOTIFICATION', 'SHARE');--> statement-breakpoint
CREATE TYPE "public"."VoiceAccessStatus" AS ENUM('PENDING', 'APPROVED', 'DENIED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."VotingSystem" AS ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'RANKED_CHOICE', 'APPROVAL', 'QUADRATIC');--> statement-breakpoint
CREATE TYPE "public"."WebhookDeliveryStatus" AS ENUM('PENDING', 'DELIVERED', 'FAILED', 'RETRYING');--> statement-breakpoint
CREATE TYPE "public"."WebhookEventType" AS ENUM('survey_created', 'survey_published', 'survey_completed', 'survey_response_submitted', 'survey_response_milestone', 'poll_created', 'poll_published', 'poll_ended', 'test_created', 'test_published', 'test_completed', 'organization_member_joined', 'organization_member_left', 'organization_role_changed');--> statement-breakpoint
CREATE TYPE "public"."XPTransactionType" AS ENUM('EARNED', 'BONUS', 'PENALTY', 'ADJUSTMENT');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"provider" "AuthProvider" NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"expiresAt" timestamp,
	"tokenType" varchar(50),
	"scope" text,
	"idToken" text,
	"tcKimlikNo" varchar(11),
	"eDevletVerified" boolean DEFAULT false NOT NULL,
	"eDevletVerifiedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tokenHash" varchar(64) NOT NULL,
	"refreshTokenHash" varchar(64),
	"deviceCategory" "DeviceCategory" DEFAULT 'UNKNOWN' NOT NULL,
	"userAgent" text,
	"ipAddress" varchar(45),
	"expiresAt" timestamp NOT NULL,
	"lastActiveAt" timestamp,
	"isRevoked" boolean DEFAULT false NOT NULL,
	"revokedAt" timestamp,
	"revokedReason" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_tokenHash_unique" UNIQUE("tokenHash"),
	CONSTRAINT "sessions_refreshTokenHash_unique" UNIQUE("refreshTokenHash")
);
--> statement-breakpoint
CREATE TABLE "user_devices" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"deviceCategory" "DeviceCategory" NOT NULL,
	"deviceName" varchar(100),
	"browser" varchar(100),
	"os" varchar(100),
	"lastIpAddress" varchar(45),
	"lastActiveAt" timestamp,
	"isTrusted" boolean DEFAULT false NOT NULL,
	"trustedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_reliability_caches" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"reliabilityScore" double precision DEFAULT 50 NOT NULL,
	"completionRate" double precision DEFAULT 0 NOT NULL,
	"avgQualityScore" double precision DEFAULT 0 NOT NULL,
	"totalResponses" integer DEFAULT 0 NOT NULL,
	"validResponses" integer DEFAULT 0 NOT NULL,
	"lastFullRecalc" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_reliability_caches_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"emailVerified" boolean DEFAULT false NOT NULL,
	"emailVerifiedAt" timestamp,
	"phone" varchar(20),
	"phoneVerified" boolean DEFAULT false NOT NULL,
	"phoneVerifiedAt" timestamp,
	"passwordHash" varchar(255),
	"passwordHistory" text[] DEFAULT '{}',
	"passwordChangedAt" timestamp,
	"failedLoginAttempts" integer DEFAULT 0 NOT NULL,
	"lockedUntil" timestamp,
	"lastFailedLoginAt" timestamp,
	"concurrentSessionLimit" integer DEFAULT 5 NOT NULL,
	"username" varchar(30) NOT NULL,
	"displayName" varchar(50) NOT NULL,
	"avatarUrl" text,
	"bannerUrl" text,
	"bio" varchar(500),
	"location" varchar(100),
	"website" varchar(255),
	"birthDate" timestamp,
	"birthYear" smallint,
	"birthMonth" smallint,
	"gender" "Gender",
	"country" varchar(2),
	"region" varchar(100),
	"city" varchar(100),
	"educationLevel" "EducationLevel",
	"maritalStatus" "MaritalStatus",
	"profession" varchar(100),
	"employmentStatus" "EmploymentStatus",
	"demographicsLockedAt" timestamp,
	"role" "UserRole" DEFAULT 'USER' NOT NULL,
	"status" "UserStatus" DEFAULT 'PENDING_VERIFICATION' NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"verifiedAt" timestamp,
	"verificationLevel" "VerificationLevel" DEFAULT 'NONE' NOT NULL,
	"verificationMethod" "VerificationMethod",
	"responseWeight" double precision DEFAULT 0.5 NOT NULL,
	"trustScoreValue" double precision DEFAULT 50 NOT NULL,
	"subscriptionTier" "UserSubscriptionTier" DEFAULT 'FREE' NOT NULL,
	"subscriptionExpiresAt" timestamp,
	"subscriptionStartedAt" timestamp,
	"lastBillingDate" timestamp,
	"nextBillingDate" timestamp,
	"stripeCustomerId" varchar(255),
	"stripeSubscriptionId" varchar(255),
	"locale" varchar(5) DEFAULT 'tr' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Europe/Istanbul' NOT NULL,
	"privacySettings" json DEFAULT '{}'::json NOT NULL,
	"notificationSettings" json DEFAULT '{}'::json NOT NULL,
	"contentPreferences" json DEFAULT '{}'::json NOT NULL,
	"lastActiveAt" timestamp,
	"lastLoginAt" timestamp,
	"loginCount" integer DEFAULT 0 NOT NULL,
	"suspendedAt" timestamp,
	"suspendedUntil" timestamp,
	"suspensionReason" text,
	"deletedAt" timestamp,
	"deletionRequestedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_stripeCustomerId_unique" UNIQUE("stripeCustomerId"),
	CONSTRAINT "users_stripeSubscriptionId_unique" UNIQUE("stripeSubscriptionId")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"identifier" varchar(255) NOT NULL,
	"tokenHash" varchar(64) NOT NULL,
	"type" varchar(50) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"usedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "OrganizationRole" DEFAULT 'MEMBER' NOT NULL,
	"token" varchar(64) NOT NULL,
	"invitedById" text NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"respondedAt" timestamp,
	CONSTRAINT "organization_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"userId" text NOT NULL,
	"role" "OrganizationRole" DEFAULT 'MEMBER' NOT NULL,
	"permissions" json DEFAULT '{}'::json NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	"invitedBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" "OrganizationType" NOT NULL,
	"logoUrl" text,
	"bannerUrl" text,
	"website" varchar(255),
	"description" varchar(1000),
	"plan" "OrganizationPlan" DEFAULT 'STARTER' NOT NULL,
	"settings" json DEFAULT '{}'::json NOT NULL,
	"brandingSettings" json DEFAULT '{}'::json NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"verifiedAt" timestamp,
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"currentPeriodStart" timestamp,
	"currentPeriodEnd" timestamp,
	"deletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organizations_stripeCustomerId_unique" UNIQUE("stripeCustomerId"),
	CONSTRAINT "organizations_stripeSubscriptionId_unique" UNIQUE("stripeSubscriptionId")
);
--> statement-breakpoint
CREATE TABLE "live_poll_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"pollId" text NOT NULL,
	"hostId" text NOT NULL,
	"joinCode" varchar(6) NOT NULL,
	"joinUrl" text NOT NULL,
	"qrCodeUrl" text,
	"status" "LivePollStatus" DEFAULT 'WAITING' NOT NULL,
	"maxParticipants" integer DEFAULT 10000 NOT NULL,
	"currentParticipants" integer DEFAULT 0 NOT NULL,
	"peakParticipants" integer DEFAULT 0 NOT NULL,
	"spectatorCount" integer DEFAULT 0 NOT NULL,
	"spectatorLimit" integer DEFAULT 1000 NOT NULL,
	"waitingRoomCount" integer DEFAULT 0 NOT NULL,
	"totalVotes" integer DEFAULT 0 NOT NULL,
	"showRealTimeResults" boolean DEFAULT true NOT NULL,
	"allowLateJoin" boolean DEFAULT true NOT NULL,
	"anonymousVoting" boolean DEFAULT true NOT NULL,
	"participantListVisible" boolean DEFAULT false NOT NULL,
	"settings" json DEFAULT '{}'::json NOT NULL,
	"autoCloseMinutes" integer,
	"startedAt" timestamp,
	"pausedAt" timestamp,
	"endedAt" timestamp,
	"hostConnectionId" varchar(64),
	"hostDisconnectedAt" timestamp,
	"autoEndAt" timestamp,
	"orphanModeStarted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "live_poll_sessions_pollId_unique" UNIQUE("pollId"),
	CONSTRAINT "live_poll_sessions_joinCode_unique" UNIQUE("joinCode")
);
--> statement-breakpoint
CREATE TABLE "live_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"deviceId" varchar(64) NOT NULL,
	"optionId" text NOT NULL,
	"votedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"pollId" text NOT NULL,
	"participantHash" varchar(64) NOT NULL,
	"answers" json NOT NULL,
	"startedAt" timestamp NOT NULL,
	"completedAt" timestamp NOT NULL,
	"durationSeconds" integer NOT NULL,
	"expectedDurationSec" integer,
	"deviceCategory" "DeviceCategory" DEFAULT 'UNKNOWN' NOT NULL,
	"qualityScore" double precision,
	"qualityFlags" text[] DEFAULT '{}',
	"fraudScore" double precision,
	"fraudSignals" text[] DEFAULT '{}',
	"fraudRiskLevel" varchar(10),
	"fraudDecision" "FraudDecision",
	"speedRatio" double precision,
	"ipReputation" double precision,
	"ipPrefix" varchar(16),
	"hasNaturalBehavior" boolean DEFAULT true NOT NULL,
	"behavioralSignals" json,
	"demographicSnapshot" json DEFAULT '{}'::json NOT NULL,
	"isValid" boolean DEFAULT true NOT NULL,
	"invalidatedAt" timestamp,
	"invalidReason" text,
	"qualityRecommendation" varchar(20),
	"deletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" text PRIMARY KEY NOT NULL,
	"creatorId" text NOT NULL,
	"organizationId" text,
	"type" "PollType" DEFAULT 'STANDARD' NOT NULL,
	"votingSystem" "VotingSystem" DEFAULT 'SINGLE_CHOICE' NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" varchar(2000),
	"slug" varchar(250) NOT NULL,
	"coverImageUrl" text,
	"status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
	"visibility" "ContentVisibility" DEFAULT 'PUBLIC' NOT NULL,
	"categoryId" text,
	"tags" text[] DEFAULT '{}',
	"startsAt" timestamp,
	"endsAt" timestamp,
	"options" json DEFAULT '[]'::json NOT NULL,
	"allowMultipleVotes" boolean DEFAULT false NOT NULL,
	"maxVotesPerUser" integer DEFAULT 1 NOT NULL,
	"requireAuth" boolean DEFAULT false NOT NULL,
	"showResultsBeforeVote" boolean DEFAULT false NOT NULL,
	"resultVisibility" "ResultVisibility" DEFAULT 'ALWAYS' NOT NULL,
	"isAnonymous" boolean DEFAULT true NOT NULL,
	"hasPreTest" boolean DEFAULT false NOT NULL,
	"preTestQuestions" json DEFAULT '[]'::json NOT NULL,
	"preTestPassingScore" double precision,
	"allowDiscussion" boolean DEFAULT true NOT NULL,
	"participantCount" integer DEFAULT 0 NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"shareCount" integer DEFAULT 0 NOT NULL,
	"commentCount" integer DEFAULT 0 NOT NULL,
	"hotScore" double precision DEFAULT 0 NOT NULL,
	"hotScoreUpdatedAt" timestamp,
	"reliabilityScore" double precision,
	"reliabilityFactors" json DEFAULT '{}'::json NOT NULL,
	"reliabilityUpdatedAt" timestamp,
	"qualityThreshold" double precision DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"premiumLocked" boolean DEFAULT false NOT NULL,
	"editLocked" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"archivedAt" timestamp,
	"deletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "polls_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "survey_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"surveyId" text NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"token" varchar(64) NOT NULL,
	"status" "InvitationStatus" DEFAULT 'PENDING' NOT NULL,
	"sentAt" timestamp,
	"openedAt" timestamp,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"reminderCount" integer DEFAULT 0 NOT NULL,
	"lastReminderAt" timestamp,
	"expiresAt" timestamp NOT NULL,
	"metadata" json DEFAULT '{}'::json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "survey_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "survey_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"sectionId" text NOT NULL,
	"orderIndex" integer NOT NULL,
	"type" "QuestionType" NOT NULL,
	"text" varchar(1000) NOT NULL,
	"description" varchar(2000),
	"imageUrl" text,
	"isRequired" boolean DEFAULT true NOT NULL,
	"options" json DEFAULT '[]'::json NOT NULL,
	"validation" json DEFAULT '{}'::json NOT NULL,
	"displayLogic" json DEFAULT '{}'::json NOT NULL,
	"skipLogic" json DEFAULT '{}'::json NOT NULL,
	"piping" json DEFAULT '{}'::json NOT NULL,
	"isAttentionCheck" boolean DEFAULT false NOT NULL,
	"expectedAnswer" text,
	"settings" json DEFAULT '{}'::json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"surveyId" text NOT NULL,
	"participantHash" varchar(64) NOT NULL,
	"invitationId" text,
	"status" "ResponseStatus" DEFAULT 'IN_PROGRESS' NOT NULL,
	"answers" json NOT NULL,
	"currentSectionIndex" integer DEFAULT 0 NOT NULL,
	"currentQuestionIndex" integer DEFAULT 0 NOT NULL,
	"resumeToken" varchar(64),
	"sessionExpiresAt" timestamp,
	"resumeCount" integer DEFAULT 0 NOT NULL,
	"lastResumedAt" timestamp,
	"startedAt" timestamp NOT NULL,
	"lastActivityAt" timestamp NOT NULL,
	"completedAt" timestamp,
	"durationSeconds" integer,
	"expectedDurationSec" integer,
	"deviceCategory" "DeviceCategory" DEFAULT 'UNKNOWN' NOT NULL,
	"qualityScore" double precision,
	"qualityThreshold" double precision DEFAULT 0.6 NOT NULL,
	"qualityFlags" text[] DEFAULT '{}',
	"qualityRecommendation" varchar(20),
	"timingScore" double precision,
	"patternScore" double precision,
	"attentionScore" double precision,
	"behaviorScore" double precision,
	"fraudScore" double precision,
	"fraudDecision" "FraudDecision",
	"fraudSignals" text[] DEFAULT '{}',
	"attentionChecksPassed" integer DEFAULT 0 NOT NULL,
	"attentionChecksFailed" integer DEFAULT 0 NOT NULL,
	"speedRatio" double precision,
	"straightLineRatio" double precision,
	"perQuestionTimes" json,
	"tabSwitchCount" integer DEFAULT 0 NOT NULL,
	"copyPasteAttempts" integer DEFAULT 0 NOT NULL,
	"ipReputation" double precision,
	"ipPrefix" varchar(16),
	"behavioralSignals" json,
	"demographicSnapshot" json DEFAULT '{}'::json NOT NULL,
	"isValid" boolean DEFAULT true NOT NULL,
	"invalidatedAt" timestamp,
	"invalidReason" text,
	"reviewStatus" "ReviewStatus",
	"reviewedBy" text,
	"reviewedAt" timestamp,
	"reviewNotes" text,
	"metadata" json DEFAULT '{}'::json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "survey_responses_resumeToken_unique" UNIQUE("resumeToken")
);
--> statement-breakpoint
CREATE TABLE "survey_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"surveyId" text NOT NULL,
	"orderIndex" integer NOT NULL,
	"title" varchar(200),
	"description" varchar(1000),
	"isRandomized" boolean DEFAULT false NOT NULL,
	"displayLogic" json DEFAULT '{}'::json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surveys" (
	"id" text PRIMARY KEY NOT NULL,
	"creatorId" text NOT NULL,
	"organizationId" text NOT NULL,
	"type" "SurveyType" DEFAULT 'STANDARD' NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" varchar(2000),
	"slug" varchar(250) NOT NULL,
	"coverImageUrl" text,
	"status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
	"categoryId" text,
	"tags" text[] DEFAULT '{}',
	"startsAt" timestamp,
	"endsAt" timestamp,
	"estimatedMinutes" integer,
	"targetResponseCount" integer,
	"quotas" json DEFAULT '{}'::json NOT NULL,
	"allowAnonymous" boolean DEFAULT false NOT NULL,
	"allowSaveProgress" boolean DEFAULT true NOT NULL,
	"showProgressBar" boolean DEFAULT true NOT NULL,
	"randomizeSections" boolean DEFAULT false NOT NULL,
	"preventBackNavigation" boolean DEFAULT false NOT NULL,
	"incentiveType" "IncentiveType",
	"incentiveValue" double precision,
	"incentiveDescription" varchar(500),
	"hasPreTest" boolean DEFAULT false NOT NULL,
	"preTestQuestions" json DEFAULT '[]'::json NOT NULL,
	"preTestPassingScore" double precision,
	"responseCount" integer DEFAULT 0 NOT NULL,
	"completedCount" integer DEFAULT 0 NOT NULL,
	"abandonedCount" integer DEFAULT 0 NOT NULL,
	"completionRate" double precision,
	"averageCompletionTime" integer,
	"averageQualityScore" double precision,
	"reliabilityScore" double precision,
	"reliabilityFactors" json DEFAULT '{}'::json NOT NULL,
	"reliabilityUpdatedAt" timestamp,
	"qualityThreshold" double precision DEFAULT 0.5 NOT NULL,
	"sessionMode" "SurveySessionMode" DEFAULT 'SINGLE' NOT NULL,
	"sessionExpiryHours" integer DEFAULT 168 NOT NULL,
	"allowOfflineMode" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"archivedAt" timestamp,
	"deletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "surveys_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "personality_test_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"position" integer NOT NULL,
	"text" varchar(500) NOT NULL,
	"imageUrl" text,
	"questionType" "PersonalityQuestionType" NOT NULL,
	"config" json NOT NULL,
	"weight" double precision DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personality_test_results" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"userId" text,
	"sessionId" text,
	"participantHash" varchar(64),
	"testType" "PersonalityTestType" NOT NULL,
	"responses" json NOT NULL,
	"calculatedResult" json NOT NULL,
	"matchedCharacterId" text,
	"matchPercentage" double precision,
	"axisScores" json,
	"coordinates" json,
	"quadrantId" text,
	"typeCode" varchar(10),
	"spectrumPercentage" double precision,
	"segmentId" text,
	"completedAt" timestamp DEFAULT now() NOT NULL,
	"timeSpentSeconds" integer,
	"expectedTimeSeconds" integer,
	"shareableCardUrl" text,
	"shareCount" integer DEFAULT 0 NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"qualityScore" double precision,
	"qualityFlags" text[] DEFAULT '{}',
	"fraudScore" double precision,
	"fraudSignals" text[] DEFAULT '{}',
	"fraudDecision" "FraudDecision",
	"speedRatio" double precision,
	"straightLineRatio" double precision,
	"attentionChecksPassed" integer DEFAULT 0 NOT NULL,
	"attentionChecksFailed" integer DEFAULT 0 NOT NULL,
	"tabSwitchCount" integer DEFAULT 0 NOT NULL,
	"copyPasteAttempts" integer DEFAULT 0 NOT NULL,
	"isValid" boolean DEFAULT true NOT NULL,
	"invalidatedAt" timestamp,
	"invalidReason" text,
	"qualityRecommendation" varchar(20),
	"deviceCategory" "DeviceCategory" DEFAULT 'UNKNOWN' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personality_tests" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"testType" "PersonalityTestType" NOT NULL,
	"settings" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "personality_tests_testId_unique" UNIQUE("testId")
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"userId" text NOT NULL,
	"attemptNumber" integer NOT NULL,
	"status" "AttemptStatus" DEFAULT 'IN_PROGRESS' NOT NULL,
	"answers" json NOT NULL,
	"score" double precision,
	"maxScore" double precision,
	"percentageScore" double precision,
	"passed" boolean,
	"startedAt" timestamp NOT NULL,
	"completedAt" timestamp,
	"timeSpentSeconds" integer,
	"expectedTimeSeconds" integer,
	"questionOrder" integer[] DEFAULT '{}',
	"qualityScore" double precision,
	"qualityFlags" text[] DEFAULT '{}',
	"speedRatio" double precision,
	"fraudScore" double precision,
	"fraudSignals" text[] DEFAULT '{}',
	"fraudDecision" "FraudDecision",
	"tabSwitchCount" integer DEFAULT 0 NOT NULL,
	"copyPasteAttempts" integer DEFAULT 0 NOT NULL,
	"focusLostCount" integer DEFAULT 0 NOT NULL,
	"deviceCategory" "DeviceCategory" DEFAULT 'UNKNOWN' NOT NULL,
	"isValid" boolean DEFAULT true NOT NULL,
	"invalidatedAt" timestamp,
	"invalidReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"orderIndex" integer NOT NULL,
	"type" "QuizQuestionType" NOT NULL,
	"text" varchar(1000) NOT NULL,
	"explanation" varchar(2000),
	"imageUrl" text,
	"options" json DEFAULT '[]'::json NOT NULL,
	"correctAnswer" json NOT NULL,
	"points" double precision DEFAULT 1 NOT NULL,
	"negativePoints" double precision DEFAULT 0 NOT NULL,
	"timeLimitSeconds" integer,
	"difficulty" "QuestionDifficulty" DEFAULT 'MEDIUM' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_tests" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"quizType" "QuizType" NOT NULL,
	"timeLimitMinutes" integer,
	"attemptsAllowed" integer DEFAULT 1 NOT NULL,
	"passingScore" double precision,
	"showCorrectAnswers" boolean DEFAULT true NOT NULL,
	"showScoreImmediately" boolean DEFAULT true NOT NULL,
	"randomizeQuestions" boolean DEFAULT false NOT NULL,
	"randomizeOptions" boolean DEFAULT false NOT NULL,
	"certificateEnabled" boolean DEFAULT false NOT NULL,
	"certificateTemplate" text,
	"startsAt" timestamp,
	"endsAt" timestamp,
	"averageScore" double precision,
	"completionRate" double precision,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_tests_testId_unique" UNIQUE("testId")
);
--> statement-breakpoint
CREATE TABLE "test_axes" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"position" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"negativeLabel" varchar(30) NOT NULL,
	"positiveLabel" varchar(30) NOT NULL,
	"negativeDescription" varchar(200) NOT NULL,
	"positiveDescription" varchar(200) NOT NULL,
	"negativeColor" varchar(7) NOT NULL,
	"positiveColor" varchar(7) NOT NULL,
	"negativeIcon" varchar(50),
	"positiveIcon" varchar(50),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_characters" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"position" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(60) NOT NULL,
	"tagline" varchar(100) NOT NULL,
	"description" varchar(500) NOT NULL,
	"detailedDescription" varchar(1000) NOT NULL,
	"imageUrl" text NOT NULL,
	"thumbnailUrl" text,
	"backgroundColor" varchar(7) NOT NULL,
	"accentColor" varchar(7) NOT NULL,
	"traits" text[] DEFAULT '{}',
	"strengths" text[] DEFAULT '{}',
	"weaknesses" text[] DEFAULT '{}',
	"compatibleWith" text[] DEFAULT '{}',
	"famousQuote" varchar(200),
	"metadata" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_quadrants" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(60) NOT NULL,
	"description" varchar(200) NOT NULL,
	"detailedDescription" varchar(1000) NOT NULL,
	"imageUrl" text,
	"color" varchar(7) NOT NULL,
	"iconName" varchar(50),
	"axisConditions" json NOT NULL,
	"traits" text[] DEFAULT '{}',
	"famousExamples" text[] DEFAULT '{}',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_result_badges" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"userId" text NOT NULL,
	"resultType" "PersonalityTestType" NOT NULL,
	"resultTitle" varchar(100) NOT NULL,
	"resultSubtitle" varchar(200),
	"resultImageUrl" text NOT NULL,
	"axisScores" json,
	"characterName" varchar(100),
	"matchPercentage" double precision,
	"spectrumScore" double precision,
	"spectrumLabel" varchar(100),
	"displayOnProfile" boolean DEFAULT true NOT NULL,
	"pinnedPosition" integer,
	"earnedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_spectrum_segments" (
	"id" text PRIMARY KEY NOT NULL,
	"spectrumId" text NOT NULL,
	"position" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" varchar(200) NOT NULL,
	"detailedDescription" varchar(500) NOT NULL,
	"minPercentage" integer NOT NULL,
	"maxPercentage" integer NOT NULL,
	"traits" text[] DEFAULT '{}',
	"imageUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_spectrums" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"name" varchar(50) NOT NULL,
	"leftLabel" varchar(30) NOT NULL,
	"rightLabel" varchar(30) NOT NULL,
	"leftDescription" varchar(200) NOT NULL,
	"rightDescription" varchar(200) NOT NULL,
	"leftColor" varchar(7) NOT NULL,
	"rightColor" varchar(7) NOT NULL,
	"leftIcon" varchar(50),
	"rightIcon" varchar(50),
	"gradientColors" text[] DEFAULT '{}',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "test_spectrums_testId_unique" UNIQUE("testId")
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" text PRIMARY KEY NOT NULL,
	"creatorId" text NOT NULL,
	"organizationId" text,
	"testCategory" "TestCategory" NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" varchar(2000),
	"slug" varchar(250) NOT NULL,
	"coverImageUrl" text,
	"status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
	"visibility" "ContentVisibility" DEFAULT 'PUBLIC' NOT NULL,
	"categoryId" text,
	"tags" text[] DEFAULT '{}',
	"completionCount" integer DEFAULT 0 NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"shareCount" integer DEFAULT 0 NOT NULL,
	"averageCompletionTime" integer,
	"hotScore" double precision DEFAULT 0 NOT NULL,
	"reliabilityScore" double precision,
	"reliabilityFactors" json DEFAULT '{}'::json NOT NULL,
	"reliabilityUpdatedAt" timestamp,
	"qualityThreshold" double precision DEFAULT 0.7 NOT NULL,
	"publishedAt" timestamp,
	"archivedAt" timestamp,
	"deletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tests_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"blockerId" text NOT NULL,
	"blockedId" text NOT NULL,
	"reason" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"commentId" text NOT NULL,
	"userId" text NOT NULL,
	"value" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"discussionId" text NOT NULL,
	"authorId" text NOT NULL,
	"testId" text,
	"parentId" text,
	"rootId" text,
	"depth" integer DEFAULT 0 NOT NULL,
	"content" varchar(2000) NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"wilsonScore" double precision DEFAULT 0 NOT NULL,
	"controversyScore" double precision DEFAULT 0 NOT NULL,
	"replyCount" integer DEFAULT 0 NOT NULL,
	"isEdited" boolean DEFAULT false NOT NULL,
	"editedAt" timestamp,
	"editHistory" json DEFAULT '[]'::json NOT NULL,
	"isPinned" boolean DEFAULT false NOT NULL,
	"pinnedAt" timestamp,
	"status" "CommentStatus" DEFAULT 'VISIBLE' NOT NULL,
	"hiddenAt" timestamp,
	"hiddenReason" text,
	"reportCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "discussions" (
	"id" text PRIMARY KEY NOT NULL,
	"pollId" text,
	"surveyId" text,
	"status" "DiscussionStatus" DEFAULT 'CLOSED' NOT NULL,
	"minParticipantsForOpen" integer,
	"totalComments" integer DEFAULT 0 NOT NULL,
	"totalParticipants" integer DEFAULT 0 NOT NULL,
	"pinnedCommentId" text,
	"lastActivityAt" timestamp DEFAULT now() NOT NULL,
	"autoLockAt" timestamp,
	"lockedAt" timestamp,
	"lockedBy" text,
	"lockReason" text,
	"settings" json DEFAULT '{}'::json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discussions_pollId_unique" UNIQUE("pollId"),
	CONSTRAINT "discussions_surveyId_unique" UNIQUE("surveyId")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" text PRIMARY KEY NOT NULL,
	"followerId" text NOT NULL,
	"followingId" text NOT NULL,
	"status" "FollowStatus" DEFAULT 'ACTIVE' NOT NULL,
	"requestedAt" timestamp,
	"acceptedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"reporterId" text NOT NULL,
	"targetType" "ReportTargetType" NOT NULL,
	"targetId" text NOT NULL,
	"reportedUserId" text,
	"reason" "ReportReason" NOT NULL,
	"details" varchar(1000),
	"evidence" json DEFAULT '[]'::json NOT NULL,
	"status" "ReportStatus" DEFAULT 'PENDING' NOT NULL,
	"priority" "ReportPriority" DEFAULT 'NORMAL' NOT NULL,
	"assignedTo" text,
	"assignedAt" timestamp,
	"resolvedAt" timestamp,
	"resolution" "ReportResolution",
	"resolutionNotes" varchar(1000),
	"actionsTaken" json DEFAULT '[]'::json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_access_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"discussionId" text NOT NULL,
	"userId" text NOT NULL,
	"reason" varchar(500) NOT NULL,
	"status" "VoiceAccessStatus" DEFAULT 'PENDING' NOT NULL,
	"requestedAt" timestamp DEFAULT now() NOT NULL,
	"reviewedAt" timestamp,
	"reviewedById" text,
	"rejectionReason" text
);
--> statement-breakpoint
CREATE TABLE "notification_aggregations" (
	"id" text PRIMARY KEY NOT NULL,
	"aggregationKey" text NOT NULL,
	"type" "NotificationType" NOT NULL,
	"targetId" text NOT NULL,
	"resourceId" text,
	"actorIds" text[] NOT NULL,
	"actorCount" integer NOT NULL,
	"firstActorId" text NOT NULL,
	"lastActorId" text NOT NULL,
	"metadata" json DEFAULT '{}'::json NOT NULL,
	"windowStart" timestamp NOT NULL,
	"windowEnd" timestamp NOT NULL,
	"isDelivered" boolean DEFAULT false NOT NULL,
	"deliveredAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_aggregations_aggregationKey_unique" UNIQUE("aggregationKey")
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"globalEnabled" boolean DEFAULT true NOT NULL,
	"quietHoursEnabled" boolean DEFAULT false NOT NULL,
	"quietHoursStart" varchar(5) DEFAULT '22:00' NOT NULL,
	"quietHoursEnd" varchar(5) DEFAULT '08:00' NOT NULL,
	"quietHoursTimezone" varchar(50) DEFAULT 'Europe/Istanbul' NOT NULL,
	"quietHoursAllowUrgent" boolean DEFAULT true NOT NULL,
	"categoryPreferences" json DEFAULT '{}'::json NOT NULL,
	"typeOverrides" json DEFAULT '{}'::json NOT NULL,
	"emailDigestEnabled" boolean DEFAULT false NOT NULL,
	"emailDigestFrequency" "DigestFrequency" DEFAULT 'DAILY' NOT NULL,
	"emailDigestDay" integer DEFAULT 1 NOT NULL,
	"emailDigestTime" varchar(5) DEFAULT '09:00' NOT NULL,
	"mutedUserIds" text[] DEFAULT '{}',
	"mutedOrgIds" text[] DEFAULT '{}',
	"mutedContentIds" text[] DEFAULT '{}',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" "NotificationType" NOT NULL,
	"category" "NotificationCategory" NOT NULL,
	"priority" "NotificationPriority" NOT NULL,
	"title" varchar(100) NOT NULL,
	"body" varchar(500) NOT NULL,
	"actorId" text,
	"actorType" "ActorType" NOT NULL,
	"actorName" text,
	"actorAvatarUrl" text,
	"resourceId" text,
	"resourceType" "ResourceType",
	"resourceTitle" text,
	"actionUrl" text,
	"actionLabel" text,
	"imageUrl" text,
	"aggregationId" text,
	"aggregatedCount" integer DEFAULT 1 NOT NULL,
	"metadata" json DEFAULT '{}'::json NOT NULL,
	"status" "NotificationStatus" DEFAULT 'UNREAD' NOT NULL,
	"readAt" timestamp,
	"archivedAt" timestamp,
	"deletedAt" timestamp,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"platform" "PushPlatform" NOT NULL,
	"token" varchar(4096) NOT NULL,
	"deviceId" text NOT NULL,
	"deviceName" varchar(100),
	"deviceModel" varchar(100),
	"osVersion" varchar(50),
	"appVersion" varchar(50),
	"isActive" boolean DEFAULT true NOT NULL,
	"lastUsedAt" timestamp DEFAULT now() NOT NULL,
	"failureCount" integer DEFAULT 0 NOT NULL,
	"lastFailureAt" timestamp,
	"lastFailureReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fraud_detection_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"fingerprintHash" varchar(64) NOT NULL,
	"contentType" "ContentType" NOT NULL,
	"contentId" text NOT NULL,
	"fraudScore" double precision DEFAULT 0 NOT NULL,
	"riskFactors" text[] DEFAULT '{}',
	"behaviorSummary" json,
	"signals" json DEFAULT '[]'::json NOT NULL,
	"riskScore" double precision DEFAULT 0 NOT NULL,
	"decision" "FraudDecision" DEFAULT 'ACCEPT' NOT NULL,
	"deviceCategory" "DeviceCategory" NOT NULL,
	"browserFamily" varchar(50),
	"osFamily" varchar(50),
	"ipType" "IPType" DEFAULT 'UNKNOWN' NOT NULL,
	"isProxy" boolean DEFAULT false NOT NULL,
	"isVPN" boolean DEFAULT false NOT NULL,
	"isTor" boolean DEFAULT false NOT NULL,
	"ipPrefix" varchar(16),
	"country" varchar(2),
	"submissionTimeMs" integer,
	"mouseMovements" integer,
	"keystrokeCount" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fraud_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"entityType" "FraudEntityType" NOT NULL,
	"entityId" text NOT NULL,
	"score" double precision NOT NULL,
	"decision" "FraudDecision" NOT NULL,
	"signals" json NOT NULL,
	"weights" json NOT NULL,
	"deviceScore" double precision,
	"behaviorScore" double precision,
	"responseScore" double precision,
	"networkScore" double precision,
	"riskFactors" text[] DEFAULT '{}',
	"reviewedAt" timestamp,
	"reviewedBy" text,
	"reviewNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ip_reputations" (
	"id" text PRIMARY KEY NOT NULL,
	"ipAddress" varchar(45) NOT NULL,
	"type" "IPType" DEFAULT 'UNKNOWN' NOT NULL,
	"isProxy" boolean DEFAULT false NOT NULL,
	"isVPN" boolean DEFAULT false NOT NULL,
	"isTor" boolean DEFAULT false NOT NULL,
	"isDatacenter" boolean DEFAULT false NOT NULL,
	"country" varchar(2),
	"region" varchar(100),
	"city" varchar(100),
	"isp" varchar(100),
	"asn" varchar(20),
	"reputationScore" double precision DEFAULT 50 NOT NULL,
	"associatedUserCount" integer DEFAULT 0 NOT NULL,
	"suspiciousActivityCount" integer DEFAULT 0 NOT NULL,
	"firstSeenAt" timestamp DEFAULT now() NOT NULL,
	"lastSeenAt" timestamp DEFAULT now() NOT NULL,
	"lastCheckedAt" timestamp DEFAULT now() NOT NULL,
	"isBlocked" boolean DEFAULT false NOT NULL,
	"blockedAt" timestamp,
	"blockReason" text,
	CONSTRAINT "ip_reputations_ipAddress_unique" UNIQUE("ipAddress")
);
--> statement-breakpoint
CREATE TABLE "moderation_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"entityType" varchar(50) NOT NULL,
	"entityId" text NOT NULL,
	"reason" varchar(100) NOT NULL,
	"fraudScore" double precision,
	"qualityScore" double precision,
	"riskFactors" text[] DEFAULT '{}',
	"priority" "ReportPriority" DEFAULT 'NORMAL' NOT NULL,
	"status" "ModerationStatus" DEFAULT 'PENDING' NOT NULL,
	"assignedTo" text,
	"assignedAt" timestamp,
	"resolution" "ModerationResolution",
	"resolutionNotes" varchar(1000),
	"resolvedAt" timestamp,
	"resolvedBy" text,
	"metadata" json DEFAULT '{}'::json NOT NULL,
	"autoFlags" text[] DEFAULT '{}',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_trust_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"overallScore" double precision DEFAULT 50 NOT NULL,
	"accountAge" double precision DEFAULT 0 NOT NULL,
	"verificationLevel" double precision DEFAULT 0 NOT NULL,
	"activityConsistency" double precision DEFAULT 0 NOT NULL,
	"responseQuality" double precision DEFAULT 0 NOT NULL,
	"socialTrust" double precision DEFAULT 0 NOT NULL,
	"reportCount" integer DEFAULT 0 NOT NULL,
	"warningCount" integer DEFAULT 0 NOT NULL,
	"suspensionCount" integer DEFAULT 0 NOT NULL,
	"fraudFlags" text[] DEFAULT '{}',
	"lastCalculatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_trust_scores_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "analytics_time_buckets" (
	"id" text PRIMARY KEY NOT NULL,
	"contentType" "ContentViewType" NOT NULL,
	"contentId" text NOT NULL,
	"bucketStart" timestamp NOT NULL,
	"bucketEnd" timestamp NOT NULL,
	"voteCount" integer DEFAULT 0 NOT NULL,
	"uniqueVoters" integer DEFAULT 0 NOT NULL,
	"optionBreakdown" json DEFAULT '{}'::json NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"shareCount" integer DEFAULT 0 NOT NULL,
	"commentCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anonymous_participations" (
	"id" text PRIMARY KEY NOT NULL,
	"anonymousToken" varchar(64) NOT NULL,
	"ipHash" varchar(64) NOT NULL,
	"deviceCategory" "DeviceCategory" DEFAULT 'UNKNOWN' NOT NULL,
	"contentType" "PrivateLinkContentType" NOT NULL,
	"contentId" text NOT NULL,
	"participatedAt" timestamp DEFAULT now() NOT NULL,
	"convertedToUserId" text,
	"convertedAt" timestamp,
	"qualityScore" double precision,
	CONSTRAINT "anonymous_participations_anonymousToken_unique" UNIQUE("anonymousToken")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actorId" text,
	"actorType" "ActorType" NOT NULL,
	"action" varchar(100) NOT NULL,
	"entityType" varchar(50) NOT NULL,
	"entityId" text NOT NULL,
	"changes" json DEFAULT '{}'::json NOT NULL,
	"previousState" json,
	"newState" json,
	"ipAddress" varchar(45),
	"userAgent" varchar(500),
	"metadata" json DEFAULT '{}'::json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_views" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"sessionId" text,
	"contentType" "ContentViewType" NOT NULL,
	"contentId" text NOT NULL,
	"source" "ViewSource" NOT NULL,
	"viewedAt" timestamp DEFAULT now() NOT NULL,
	"dwellTimeMs" integer,
	"interacted" boolean DEFAULT false NOT NULL,
	"interactionType" text
);
--> statement-breakpoint
CREATE TABLE "feed_events" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"contentType" "ContentViewType" NOT NULL,
	"contentId" text NOT NULL,
	"eventType" "FeedEventType" NOT NULL,
	"feedType" "ViewSource" NOT NULL,
	"position" integer,
	"metadata" json DEFAULT '{}'::json NOT NULL,
	"occurredAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hourly_poll_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"pollId" text NOT NULL,
	"hour" timestamp NOT NULL,
	"responseCount" integer DEFAULT 0 NOT NULL,
	"uniqueParticipants" integer DEFAULT 0 NOT NULL,
	"avgDurationSeconds" double precision,
	"validCount" integer DEFAULT 0 NOT NULL,
	"invalidCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hourly_survey_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"surveyId" text NOT NULL,
	"hour" timestamp NOT NULL,
	"responseCount" integer DEFAULT 0 NOT NULL,
	"completedCount" integer DEFAULT 0 NOT NULL,
	"abandonedCount" integer DEFAULT 0 NOT NULL,
	"avgCompletionTime" double precision,
	"avgQualityScore" double precision,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "popular_searches" (
	"id" text PRIMARY KEY NOT NULL,
	"query" varchar(200) NOT NULL,
	"searchCount" integer DEFAULT 0 NOT NULL,
	"uniqueUserCount" integer DEFAULT 0 NOT NULL,
	"lastSearchedAt" timestamp NOT NULL,
	"trendingScore" double precision DEFAULT 0 NOT NULL,
	"isPromoted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "popular_searches_query_unique" UNIQUE("query")
);
--> statement-breakpoint
CREATE TABLE "population_datasets" (
	"id" text PRIMARY KEY NOT NULL,
	"countryCode" varchar(2) NOT NULL,
	"name" varchar(100) NOT NULL,
	"source" varchar(200) NOT NULL,
	"sourceUrl" varchar(500),
	"year" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"isActive" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "population_distributions" (
	"id" text PRIMARY KEY NOT NULL,
	"datasetId" text NOT NULL,
	"dimension" varchar(50) NOT NULL,
	"category" varchar(100) NOT NULL,
	"percentage" double precision NOT NULL,
	"population" bigint,
	"confidence" double precision,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pre_test_results" (
	"id" text PRIMARY KEY NOT NULL,
	"contentType" "PreTestContentType" NOT NULL,
	"contentId" text NOT NULL,
	"userId" text,
	"sessionId" text,
	"answers" json NOT NULL,
	"score" double precision NOT NULL,
	"passed" boolean NOT NULL,
	"attemptNumber" integer DEFAULT 1 NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "private_links" (
	"id" text PRIMARY KEY NOT NULL,
	"contentType" "PrivateLinkContentType" NOT NULL,
	"contentId" text NOT NULL,
	"code" varchar(16) NOT NULL,
	"creatorId" text NOT NULL,
	"expiresAt" timestamp,
	"maxUses" integer,
	"currentUses" integer DEFAULT 0 NOT NULL,
	"requireAuth" boolean DEFAULT false NOT NULL,
	"allowAnonymous" boolean DEFAULT true NOT NULL,
	"password" varchar(255),
	"trackViews" boolean DEFAULT true NOT NULL,
	"totalViews" integer DEFAULT 0 NOT NULL,
	"uniqueViews" integer DEFAULT 0 NOT NULL,
	"participations" integer DEFAULT 0 NOT NULL,
	"lastAccessedAt" timestamp,
	"status" "PrivateLinkStatus" DEFAULT 'ACTIVE' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "private_links_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "rate_limit_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"endpoint" varchar(100) NOT NULL,
	"windowStart" timestamp NOT NULL,
	"requestCount" integer DEFAULT 1 NOT NULL,
	"limitType" "RateLimitType" DEFAULT 'IP' NOT NULL,
	"isBlocked" boolean DEFAULT false NOT NULL,
	"blockedUntil" timestamp,
	"blockReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_searches" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"query" varchar(200) NOT NULL,
	"filters" json DEFAULT '{}'::json NOT NULL,
	"notificationsEnabled" boolean DEFAULT false NOT NULL,
	"notificationFrequency" "SavedSearchNotifyFreq" DEFAULT 'DAILY' NOT NULL,
	"lastExecutedAt" timestamp,
	"newResultCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_histories" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"query" varchar(200) NOT NULL,
	"normalizedQuery" varchar(200) NOT NULL,
	"resultCount" integer NOT NULL,
	"clickedResults" json DEFAULT '[]'::json NOT NULL,
	"filters" json DEFAULT '{}'::json NOT NULL,
	"searchedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsored_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"name" varchar(200) NOT NULL,
	"contentType" "SponsoredContentType" NOT NULL,
	"contentId" text NOT NULL,
	"status" "CampaignStatus" DEFAULT 'DRAFT' NOT NULL,
	"budget" double precision NOT NULL,
	"spentAmount" double precision DEFAULT 0 NOT NULL,
	"costPerImpression" double precision NOT NULL,
	"costPerParticipation" double precision NOT NULL,
	"targeting" json DEFAULT '{}'::json NOT NULL,
	"startsAt" timestamp NOT NULL,
	"endsAt" timestamp NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"participations" integer DEFAULT 0 NOT NULL,
	"ctr" double precision DEFAULT 0 NOT NULL,
	"participationRate" double precision DEFAULT 0 NOT NULL,
	"dailyBudgetLimit" double precision,
	"dailySpent" double precision DEFAULT 0 NOT NULL,
	"lastDailyReset" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_events" (
	"id" text PRIMARY KEY NOT NULL,
	"eventType" varchar(100) NOT NULL,
	"severity" "EventSeverity" NOT NULL,
	"source" varchar(100) NOT NULL,
	"message" varchar(1000) NOT NULL,
	"details" json DEFAULT '{}'::json NOT NULL,
	"stackTrace" text,
	"correlationId" varchar(64),
	"resolvedAt" timestamp,
	"resolvedBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trending_content" (
	"id" text PRIMARY KEY NOT NULL,
	"contentType" "ContentViewType" NOT NULL,
	"contentId" text NOT NULL,
	"categoryId" text,
	"trendingScore" double precision NOT NULL,
	"velocity" double precision NOT NULL,
	"acceleration" double precision NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"participationCount" integer DEFAULT 0 NOT NULL,
	"commentCount" integer DEFAULT 0 NOT NULL,
	"shareCount" integer DEFAULT 0 NOT NULL,
	"windowStart" timestamp NOT NULL,
	"windowEnd" timestamp NOT NULL,
	"rank" integer,
	"previousRank" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_interest_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"categoryScores" json DEFAULT '{}'::json NOT NULL,
	"tagScores" json DEFAULT '{}'::json NOT NULL,
	"creatorScores" json DEFAULT '{}'::json NOT NULL,
	"preferredContentTypes" json DEFAULT '[]'::json NOT NULL,
	"avgSessionDuration" double precision,
	"avgContentPerSession" double precision,
	"peakActivityHours" integer[] DEFAULT '{}',
	"lastCalculatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_interest_profiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "cancellation_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"subscriptionId" text NOT NULL,
	"tier" "UserSubscriptionTier" NOT NULL,
	"reason" "CancellationReason" NOT NULL,
	"feedback" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"subscriptionId" text,
	"tier" "UserSubscriptionTier" NOT NULL,
	"billingPeriod" "BillingPeriod" NOT NULL,
	"subtotal" integer NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"tax" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"currency" "Currency" DEFAULT 'USD' NOT NULL,
	"paymentMethodType" "PaymentMethodType",
	"cardBrand" varchar(20),
	"cardLast4" varchar(4),
	"cardExpiry" varchar(5),
	"billingCountry" varchar(2),
	"billingPostalCode" varchar(20),
	"billingState" varchar(100),
	"billingCity" varchar(100),
	"billingLine1" varchar(255),
	"billingLine2" varchar(255),
	"status" "CheckoutSessionStatus" DEFAULT 'PENDING' NOT NULL,
	"stripePaymentIntentId" text,
	"iyzicoPaymentId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"expiresAt" timestamp NOT NULL,
	CONSTRAINT "checkout_sessions_stripePaymentIntentId_unique" UNIQUE("stripePaymentIntentId"),
	CONSTRAINT "checkout_sessions_iyzicoPaymentId_unique" UNIQUE("iyzicoPaymentId")
);
--> statement-breakpoint
CREATE TABLE "refund_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"subscriptionId" text NOT NULL,
	"invoiceId" varchar(100),
	"amount" integer NOT NULL,
	"currency" "Currency" DEFAULT 'USD' NOT NULL,
	"reason" varchar(500) NOT NULL,
	"case" "RefundCase" NOT NULL,
	"status" "RefundStatus" DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"processedAt" timestamp,
	"processedBy" text,
	"rejectionReason" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tier" "UserSubscriptionTier" DEFAULT 'FREE' NOT NULL,
	"billingPeriod" "BillingPeriod",
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"iyzicoSubscriptionId" text,
	"currentPeriodStart" timestamp,
	"currentPeriodEnd" timestamp,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"canceledAt" timestamp,
	"status" "SubscriptionStatus" DEFAULT 'ACTIVE' NOT NULL,
	"paymentMethodType" "PaymentMethodType",
	"paymentMethodBrand" varchar(20),
	"paymentMethodLast4" varchar(4),
	"paymentMethodExpiryMonth" integer,
	"paymentMethodExpiryYear" integer,
	"paymentFailedAt" timestamp,
	"dunningRetryCount" integer DEFAULT 0 NOT NULL,
	"lastDunningAttempt" timestamp,
	"pendingTierChange" "UserSubscriptionTier",
	"pendingTierChangeDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscriptions_userId_unique" UNIQUE("userId"),
	CONSTRAINT "user_subscriptions_stripeCustomerId_unique" UNIQUE("stripeCustomerId"),
	CONSTRAINT "user_subscriptions_stripeSubscriptionId_unique" UNIQUE("stripeSubscriptionId"),
	CONSTRAINT "user_subscriptions_iyzicoSubscriptionId_unique" UNIQUE("iyzicoSubscriptionId")
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(500) NOT NULL,
	"iconUrl" text NOT NULL,
	"category" "BadgeCategory" NOT NULL,
	"rarity" "BadgeRarity" NOT NULL,
	"xpReward" integer DEFAULT 0 NOT NULL,
	"criteria" json NOT NULL,
	"isSecret" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"orderIndex" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "badges_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"description" varchar(200),
	"iconName" varchar(50),
	"color" varchar(7),
	"parentId" text,
	"orderIndex" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "consent_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"version" varchar(20) NOT NULL,
	"versionType" varchar(10) NOT NULL,
	"effectiveDate" timestamp NOT NULL,
	"expiryDate" timestamp,
	"privacyPolicyUrl" varchar(500) NOT NULL,
	"termsUrl" varchar(500) NOT NULL,
	"cookiePolicyUrl" varchar(500),
	"consentFormHash" varchar(64) NOT NULL,
	"changeSummary" varchar(1000) NOT NULL,
	"changesJson" json DEFAULT '[]'::json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" text NOT NULL,
	CONSTRAINT "consent_policies_version_unique" UNIQUE("version")
);
--> statement-breakpoint
CREATE TABLE "runtime_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" json NOT NULL,
	"description" varchar(500),
	"active" boolean DEFAULT true NOT NULL,
	"experimentId" varchar(64),
	"variant" varchar(50),
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedBy" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "runtime_configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"badgeId" text NOT NULL,
	"gamificationId" text NOT NULL,
	"earnedAt" timestamp DEFAULT now() NOT NULL,
	"progress" json DEFAULT '{}'::json NOT NULL,
	"isDisplayed" boolean DEFAULT false NOT NULL,
	"displayOrder" integer
);
--> statement-breakpoint
CREATE TABLE "user_consents" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"policyId" text NOT NULL,
	"grantedAt" timestamp DEFAULT now() NOT NULL,
	"withdrawnAt" timestamp,
	"ipAddress" varchar(45),
	"userAgent" varchar(500),
	"consentMethod" varchar(20) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_gamification" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"currentXp" integer DEFAULT 0 NOT NULL,
	"totalXp" integer DEFAULT 0 NOT NULL,
	"pollsCreated" integer DEFAULT 0 NOT NULL,
	"pollsParticipated" integer DEFAULT 0 NOT NULL,
	"surveysCompleted" integer DEFAULT 0 NOT NULL,
	"testsCompleted" integer DEFAULT 0 NOT NULL,
	"commentsWritten" integer DEFAULT 0 NOT NULL,
	"upvotesReceived" integer DEFAULT 0 NOT NULL,
	"currentStreak" integer DEFAULT 0 NOT NULL,
	"longestStreak" integer DEFAULT 0 NOT NULL,
	"lastActivityDate" timestamp,
	"rank" integer,
	"rankUpdatedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_gamification_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"webhookEndpointId" text NOT NULL,
	"event" "WebhookEventType" NOT NULL,
	"payload" json NOT NULL,
	"status" "WebhookDeliveryStatus" DEFAULT 'PENDING' NOT NULL,
	"attempts" json DEFAULT '[]'::json NOT NULL,
	"attemptCount" integer DEFAULT 0 NOT NULL,
	"nextRetryAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_endpoints" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"url" text NOT NULL,
	"secretEncrypted" varchar(255) NOT NULL,
	"secretIv" varchar(32) NOT NULL,
	"secretTag" varchar(32) NOT NULL,
	"events" "WebhookEventType"[] NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"customHeaders" json DEFAULT '{}'::json NOT NULL,
	"customHeadersEncrypted" text,
	"maxRetries" integer DEFAULT 3 NOT NULL,
	"initialDelayMs" integer DEFAULT 5000 NOT NULL,
	"maxDelayMs" integer DEFAULT 300000 NOT NULL,
	"backoffMultiplier" double precision DEFAULT 2 NOT NULL,
	"maxPerMinute" integer DEFAULT 60 NOT NULL,
	"maxPerHour" integer DEFAULT 500 NOT NULL,
	"metadata" json DEFAULT '{}'::json NOT NULL,
	"lastTriggeredAt" timestamp,
	"lastSuccessAt" timestamp,
	"lastFailureAt" timestamp,
	"consecutiveFailures" integer DEFAULT 0 NOT NULL,
	"disabledAt" timestamp,
	"disabledReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xp_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"gamificationId" text NOT NULL,
	"amount" integer NOT NULL,
	"type" "XPTransactionType" NOT NULL,
	"source" varchar(50) NOT NULL,
	"sourceId" text,
	"description" varchar(200),
	"balanceAfter" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reliability_caches" ADD CONSTRAINT "user_reliability_caches_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_poll_sessions" ADD CONSTRAINT "live_poll_sessions_pollId_polls_id_fk" FOREIGN KEY ("pollId") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_poll_sessions" ADD CONSTRAINT "live_poll_sessions_hostId_users_id_fk" FOREIGN KEY ("hostId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_votes" ADD CONSTRAINT "live_votes_sessionId_live_poll_sessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."live_poll_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_responses" ADD CONSTRAINT "poll_responses_pollId_polls_id_fk" FOREIGN KEY ("pollId") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_creatorId_users_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_invitations" ADD CONSTRAINT "survey_invitations_surveyId_surveys_id_fk" FOREIGN KEY ("surveyId") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_sectionId_survey_sections_id_fk" FOREIGN KEY ("sectionId") REFERENCES "public"."survey_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_surveyId_surveys_id_fk" FOREIGN KEY ("surveyId") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_sections" ADD CONSTRAINT "survey_sections_surveyId_surveys_id_fk" FOREIGN KEY ("surveyId") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_creatorId_users_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personality_test_questions" ADD CONSTRAINT "personality_test_questions_testId_personality_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."personality_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personality_test_results" ADD CONSTRAINT "personality_test_results_testId_personality_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."personality_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personality_tests" ADD CONSTRAINT "personality_tests_testId_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_testId_quiz_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."quiz_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_testId_quiz_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."quiz_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_tests" ADD CONSTRAINT "quiz_tests_testId_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_axes" ADD CONSTRAINT "test_axes_testId_personality_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."personality_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_characters" ADD CONSTRAINT "test_characters_testId_personality_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."personality_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_quadrants" ADD CONSTRAINT "test_quadrants_testId_personality_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."personality_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_result_badges" ADD CONSTRAINT "test_result_badges_testId_personality_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."personality_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_result_badges" ADD CONSTRAINT "test_result_badges_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_spectrum_segments" ADD CONSTRAINT "test_spectrum_segments_spectrumId_test_spectrums_id_fk" FOREIGN KEY ("spectrumId") REFERENCES "public"."test_spectrums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_spectrums" ADD CONSTRAINT "test_spectrums_testId_personality_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."personality_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_creatorId_users_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blockerId_users_id_fk" FOREIGN KEY ("blockerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blockedId_users_id_fk" FOREIGN KEY ("blockedId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_votes" ADD CONSTRAINT "comment_votes_commentId_comments_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_votes" ADD CONSTRAINT "comment_votes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_discussionId_discussions_id_fk" FOREIGN KEY ("discussionId") REFERENCES "public"."discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_testId_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_pollId_polls_id_fk" FOREIGN KEY ("pollId") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_users_id_fk" FOREIGN KEY ("followerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_followingId_users_id_fk" FOREIGN KEY ("followingId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_users_id_fk" FOREIGN KEY ("reporterId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reportedUserId_users_id_fk" FOREIGN KEY ("reportedUserId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_access_requests" ADD CONSTRAINT "voice_access_requests_discussionId_discussions_id_fk" FOREIGN KEY ("discussionId") REFERENCES "public"."discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_access_requests" ADD CONSTRAINT "voice_access_requests_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_trust_scores" ADD CONSTRAINT "user_trust_scores_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_events" ADD CONSTRAINT "feed_events_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "population_distributions" ADD CONSTRAINT "population_distributions_datasetId_population_datasets_id_fk" FOREIGN KEY ("datasetId") REFERENCES "public"."population_datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_links" ADD CONSTRAINT "private_links_creatorId_users_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_histories" ADD CONSTRAINT "search_histories_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsored_campaigns" ADD CONSTRAINT "sponsored_campaigns_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interest_profiles" ADD CONSTRAINT "user_interest_profiles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_feedback" ADD CONSTRAINT "cancellation_feedback_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_badges_id_fk" FOREIGN KEY ("badgeId") REFERENCES "public"."badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_gamificationId_user_gamification_id_fk" FOREIGN KEY ("gamificationId") REFERENCES "public"."user_gamification"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_policyId_consent_policies_id_fk" FOREIGN KEY ("policyId") REFERENCES "public"."consent_policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_gamification" ADD CONSTRAINT "user_gamification_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhookEndpointId_webhook_endpoints_id_fk" FOREIGN KEY ("webhookEndpointId") REFERENCES "public"."webhook_endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_gamificationId_user_gamification_id_fk" FOREIGN KEY ("gamificationId") REFERENCES "public"."user_gamification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_idx" ON "accounts" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "sessions_tokenHash_idx" ON "sessions" USING btree ("tokenHash");--> statement-breakpoint
CREATE INDEX "sessions_expiresAt_idx" ON "sessions" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "user_devices_userId_idx" ON "user_devices" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_reliability_caches_reliabilityScore_idx" ON "user_reliability_caches" USING btree ("reliabilityScore");--> statement-breakpoint
CREATE INDEX "user_reliability_caches_lastFullRecalc_idx" ON "user_reliability_caches" USING btree ("lastFullRecalc");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_verificationLevel_idx" ON "users" USING btree ("verificationLevel");--> statement-breakpoint
CREATE INDEX "users_subscriptionTier_idx" ON "users" USING btree ("subscriptionTier");--> statement-breakpoint
CREATE INDEX "users_createdAt_idx" ON "users" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_tokenHash_idx" ON "verification_tokens" USING btree ("tokenHash");--> statement-breakpoint
CREATE INDEX "verification_tokens_identifier_type_idx" ON "verification_tokens" USING btree ("identifier","type");--> statement-breakpoint
CREATE INDEX "organization_invitations_organizationId_idx" ON "organization_invitations" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "organization_invitations_email_idx" ON "organization_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "organization_invitations_token_idx" ON "organization_invitations" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_organizationId_userId_idx" ON "organization_members" USING btree ("organizationId","userId");--> statement-breakpoint
CREATE INDEX "organization_members_userId_idx" ON "organization_members" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organizations_type_idx" ON "organizations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "live_poll_sessions_joinCode_idx" ON "live_poll_sessions" USING btree ("joinCode");--> statement-breakpoint
CREATE INDEX "live_poll_sessions_status_idx" ON "live_poll_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "live_poll_sessions_hostId_idx" ON "live_poll_sessions" USING btree ("hostId");--> statement-breakpoint
CREATE INDEX "live_poll_sessions_orphanModeStarted_autoEndAt_idx" ON "live_poll_sessions" USING btree ("orphanModeStarted","autoEndAt");--> statement-breakpoint
CREATE UNIQUE INDEX "live_votes_sessionId_deviceId_idx" ON "live_votes" USING btree ("sessionId","deviceId");--> statement-breakpoint
CREATE INDEX "live_votes_sessionId_idx" ON "live_votes" USING btree ("sessionId");--> statement-breakpoint
CREATE INDEX "live_votes_optionId_idx" ON "live_votes" USING btree ("optionId");--> statement-breakpoint
CREATE UNIQUE INDEX "poll_responses_pollId_participantHash_idx" ON "poll_responses" USING btree ("pollId","participantHash");--> statement-breakpoint
CREATE INDEX "poll_responses_pollId_isValid_idx" ON "poll_responses" USING btree ("pollId","isValid");--> statement-breakpoint
CREATE INDEX "poll_responses_pollId_isValid_deletedAt_idx" ON "poll_responses" USING btree ("pollId","isValid","deletedAt");--> statement-breakpoint
CREATE INDEX "poll_responses_pollId_createdAt_idx" ON "poll_responses" USING btree ("pollId","createdAt");--> statement-breakpoint
CREATE INDEX "poll_responses_pollId_isValid_fraudScore_idx" ON "poll_responses" USING btree ("pollId","isValid","fraudScore");--> statement-breakpoint
CREATE INDEX "poll_responses_pollId_isValid_qualityScore_idx" ON "poll_responses" USING btree ("pollId","isValid","qualityScore");--> statement-breakpoint
CREATE INDEX "poll_responses_participantHash_idx" ON "poll_responses" USING btree ("participantHash");--> statement-breakpoint
CREATE INDEX "poll_responses_fraudRiskLevel_idx" ON "poll_responses" USING btree ("fraudRiskLevel");--> statement-breakpoint
CREATE INDEX "poll_responses_fraudScore_idx" ON "poll_responses" USING btree ("fraudScore");--> statement-breakpoint
CREATE INDEX "poll_responses_qualityScore_idx" ON "poll_responses" USING btree ("qualityScore");--> statement-breakpoint
CREATE INDEX "poll_responses_isValid_createdAt_idx" ON "poll_responses" USING btree ("isValid","createdAt");--> statement-breakpoint
CREATE INDEX "poll_responses_createdAt_idx" ON "poll_responses" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "polls_creatorId_status_idx" ON "polls" USING btree ("creatorId","status");--> statement-breakpoint
CREATE INDEX "polls_creatorId_status_createdAt_idx" ON "polls" USING btree ("creatorId","status","createdAt");--> statement-breakpoint
CREATE INDEX "polls_organizationId_status_idx" ON "polls" USING btree ("organizationId","status");--> statement-breakpoint
CREATE INDEX "polls_status_visibility_hotScore_idx" ON "polls" USING btree ("status","visibility","hotScore");--> statement-breakpoint
CREATE INDEX "polls_status_visibility_endsAt_idx" ON "polls" USING btree ("status","visibility","endsAt");--> statement-breakpoint
CREATE INDEX "polls_categoryId_status_visibility_idx" ON "polls" USING btree ("categoryId","status","visibility");--> statement-breakpoint
CREATE INDEX "polls_categoryId_status_visibility_hotScore_idx" ON "polls" USING btree ("categoryId","status","visibility","hotScore");--> statement-breakpoint
CREATE INDEX "polls_hotScore_publishedAt_idx" ON "polls" USING btree ("hotScore","publishedAt");--> statement-breakpoint
CREATE INDEX "polls_publishedAt_idx" ON "polls" USING btree ("publishedAt");--> statement-breakpoint
CREATE INDEX "polls_slug_idx" ON "polls" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "polls_deletedAt_idx" ON "polls" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "survey_invitations_surveyId_status_idx" ON "survey_invitations" USING btree ("surveyId","status");--> statement-breakpoint
CREATE INDEX "survey_invitations_token_idx" ON "survey_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "survey_invitations_email_idx" ON "survey_invitations" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "survey_questions_sectionId_orderIndex_idx" ON "survey_questions" USING btree ("sectionId","orderIndex");--> statement-breakpoint
CREATE INDEX "survey_questions_sectionId_idx" ON "survey_questions" USING btree ("sectionId");--> statement-breakpoint
CREATE UNIQUE INDEX "survey_responses_surveyId_participantHash_idx" ON "survey_responses" USING btree ("surveyId","participantHash");--> statement-breakpoint
CREATE INDEX "survey_responses_surveyId_status_isValid_idx" ON "survey_responses" USING btree ("surveyId","status","isValid");--> statement-breakpoint
CREATE INDEX "survey_responses_surveyId_status_qualityScore_idx" ON "survey_responses" USING btree ("surveyId","status","qualityScore");--> statement-breakpoint
CREATE INDEX "survey_responses_surveyId_completedAt_idx" ON "survey_responses" USING btree ("surveyId","completedAt");--> statement-breakpoint
CREATE INDEX "survey_responses_surveyId_isValid_fraudScore_idx" ON "survey_responses" USING btree ("surveyId","isValid","fraudScore");--> statement-breakpoint
CREATE INDEX "survey_responses_surveyId_isValid_qualityScore_idx" ON "survey_responses" USING btree ("surveyId","isValid","qualityScore");--> statement-breakpoint
CREATE INDEX "survey_responses_participantHash_idx" ON "survey_responses" USING btree ("participantHash");--> statement-breakpoint
CREATE INDEX "survey_responses_invitationId_idx" ON "survey_responses" USING btree ("invitationId");--> statement-breakpoint
CREATE INDEX "survey_responses_reviewStatus_idx" ON "survey_responses" USING btree ("reviewStatus");--> statement-breakpoint
CREATE INDEX "survey_responses_fraudScore_idx" ON "survey_responses" USING btree ("fraudScore");--> statement-breakpoint
CREATE INDEX "survey_responses_qualityScore_idx" ON "survey_responses" USING btree ("qualityScore");--> statement-breakpoint
CREATE INDEX "survey_responses_isValid_completedAt_idx" ON "survey_responses" USING btree ("isValid","completedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "survey_sections_surveyId_orderIndex_idx" ON "survey_sections" USING btree ("surveyId","orderIndex");--> statement-breakpoint
CREATE INDEX "survey_sections_surveyId_idx" ON "survey_sections" USING btree ("surveyId");--> statement-breakpoint
CREATE INDEX "surveys_organizationId_status_idx" ON "surveys" USING btree ("organizationId","status");--> statement-breakpoint
CREATE INDEX "surveys_organizationId_status_createdAt_idx" ON "surveys" USING btree ("organizationId","status","createdAt");--> statement-breakpoint
CREATE INDEX "surveys_creatorId_status_idx" ON "surveys" USING btree ("creatorId","status");--> statement-breakpoint
CREATE INDEX "surveys_creatorId_status_createdAt_idx" ON "surveys" USING btree ("creatorId","status","createdAt");--> statement-breakpoint
CREATE INDEX "surveys_status_startsAt_endsAt_idx" ON "surveys" USING btree ("status","startsAt","endsAt");--> statement-breakpoint
CREATE INDEX "surveys_slug_idx" ON "surveys" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "surveys_categoryId_status_idx" ON "surveys" USING btree ("categoryId","status");--> statement-breakpoint
CREATE INDEX "surveys_reliabilityScore_idx" ON "surveys" USING btree ("reliabilityScore");--> statement-breakpoint
CREATE UNIQUE INDEX "personality_test_questions_testId_position_idx" ON "personality_test_questions" USING btree ("testId","position");--> statement-breakpoint
CREATE INDEX "personality_test_questions_testId_idx" ON "personality_test_questions" USING btree ("testId");--> statement-breakpoint
CREATE UNIQUE INDEX "personality_test_results_testId_participantHash_idx" ON "personality_test_results" USING btree ("testId","participantHash");--> statement-breakpoint
CREATE INDEX "personality_test_results_testId_isValid_idx" ON "personality_test_results" USING btree ("testId","isValid");--> statement-breakpoint
CREATE INDEX "personality_test_results_testId_isValid_qualityScore_idx" ON "personality_test_results" USING btree ("testId","isValid","qualityScore");--> statement-breakpoint
CREATE INDEX "personality_test_results_testId_idx" ON "personality_test_results" USING btree ("testId");--> statement-breakpoint
CREATE INDEX "personality_test_results_userId_idx" ON "personality_test_results" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "personality_test_results_testType_idx" ON "personality_test_results" USING btree ("testType");--> statement-breakpoint
CREATE INDEX "personality_test_results_participantHash_idx" ON "personality_test_results" USING btree ("participantHash");--> statement-breakpoint
CREATE INDEX "personality_test_results_fraudScore_idx" ON "personality_test_results" USING btree ("fraudScore");--> statement-breakpoint
CREATE INDEX "personality_test_results_qualityScore_idx" ON "personality_test_results" USING btree ("qualityScore");--> statement-breakpoint
CREATE INDEX "personality_tests_testId_idx" ON "personality_tests" USING btree ("testId");--> statement-breakpoint
CREATE INDEX "personality_tests_testType_idx" ON "personality_tests" USING btree ("testType");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_attempts_testId_userId_attemptNumber_idx" ON "quiz_attempts" USING btree ("testId","userId","attemptNumber");--> statement-breakpoint
CREATE INDEX "quiz_attempts_testId_userId_idx" ON "quiz_attempts" USING btree ("testId","userId");--> statement-breakpoint
CREATE INDEX "quiz_attempts_testId_isValid_qualityScore_idx" ON "quiz_attempts" USING btree ("testId","isValid","qualityScore");--> statement-breakpoint
CREATE INDEX "quiz_attempts_userId_status_idx" ON "quiz_attempts" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "quiz_attempts_fraudScore_idx" ON "quiz_attempts" USING btree ("fraudScore");--> statement-breakpoint
CREATE INDEX "quiz_attempts_qualityScore_idx" ON "quiz_attempts" USING btree ("qualityScore");--> statement-breakpoint
CREATE INDEX "quiz_attempts_isValid_completedAt_idx" ON "quiz_attempts" USING btree ("isValid","completedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_questions_testId_orderIndex_idx" ON "quiz_questions" USING btree ("testId","orderIndex");--> statement-breakpoint
CREATE INDEX "quiz_questions_testId_idx" ON "quiz_questions" USING btree ("testId");--> statement-breakpoint
CREATE INDEX "quiz_tests_testId_idx" ON "quiz_tests" USING btree ("testId");--> statement-breakpoint
CREATE INDEX "quiz_tests_quizType_idx" ON "quiz_tests" USING btree ("quizType");--> statement-breakpoint
CREATE UNIQUE INDEX "test_axes_testId_position_idx" ON "test_axes" USING btree ("testId","position");--> statement-breakpoint
CREATE INDEX "test_axes_testId_idx" ON "test_axes" USING btree ("testId");--> statement-breakpoint
CREATE UNIQUE INDEX "test_characters_testId_position_idx" ON "test_characters" USING btree ("testId","position");--> statement-breakpoint
CREATE UNIQUE INDEX "test_characters_testId_slug_idx" ON "test_characters" USING btree ("testId","slug");--> statement-breakpoint
CREATE INDEX "test_characters_testId_idx" ON "test_characters" USING btree ("testId");--> statement-breakpoint
CREATE INDEX "test_quadrants_testId_idx" ON "test_quadrants" USING btree ("testId");--> statement-breakpoint
CREATE UNIQUE INDEX "test_result_badges_testId_userId_idx" ON "test_result_badges" USING btree ("testId","userId");--> statement-breakpoint
CREATE INDEX "test_result_badges_userId_displayOnProfile_idx" ON "test_result_badges" USING btree ("userId","displayOnProfile");--> statement-breakpoint
CREATE INDEX "test_result_badges_userId_pinnedPosition_idx" ON "test_result_badges" USING btree ("userId","pinnedPosition");--> statement-breakpoint
CREATE UNIQUE INDEX "test_spectrum_segments_spectrumId_position_idx" ON "test_spectrum_segments" USING btree ("spectrumId","position");--> statement-breakpoint
CREATE INDEX "test_spectrum_segments_spectrumId_idx" ON "test_spectrum_segments" USING btree ("spectrumId");--> statement-breakpoint
CREATE INDEX "tests_creatorId_status_idx" ON "tests" USING btree ("creatorId","status");--> statement-breakpoint
CREATE INDEX "tests_creatorId_status_createdAt_idx" ON "tests" USING btree ("creatorId","status","createdAt");--> statement-breakpoint
CREATE INDEX "tests_status_visibility_deletedAt_idx" ON "tests" USING btree ("status","visibility","deletedAt");--> statement-breakpoint
CREATE INDEX "tests_status_visibility_hotScore_idx" ON "tests" USING btree ("status","visibility","hotScore");--> statement-breakpoint
CREATE INDEX "tests_testCategory_idx" ON "tests" USING btree ("testCategory");--> statement-breakpoint
CREATE INDEX "tests_slug_idx" ON "tests" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tests_organizationId_idx" ON "tests" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "tests_organizationId_status_createdAt_idx" ON "tests" USING btree ("organizationId","status","createdAt");--> statement-breakpoint
CREATE INDEX "tests_categoryId_status_idx" ON "tests" USING btree ("categoryId","status");--> statement-breakpoint
CREATE INDEX "tests_categoryId_status_visibility_hotScore_idx" ON "tests" USING btree ("categoryId","status","visibility","hotScore");--> statement-breakpoint
CREATE UNIQUE INDEX "blocks_blockerId_blockedId_idx" ON "blocks" USING btree ("blockerId","blockedId");--> statement-breakpoint
CREATE INDEX "blocks_blockedId_idx" ON "blocks" USING btree ("blockedId");--> statement-breakpoint
CREATE UNIQUE INDEX "comment_votes_commentId_userId_idx" ON "comment_votes" USING btree ("commentId","userId");--> statement-breakpoint
CREATE INDEX "comment_votes_userId_idx" ON "comment_votes" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "comments_discussionId_status_wilsonScore_idx" ON "comments" USING btree ("discussionId","status","wilsonScore");--> statement-breakpoint
CREATE INDEX "comments_discussionId_status_createdAt_idx" ON "comments" USING btree ("discussionId","status","createdAt");--> statement-breakpoint
CREATE INDEX "comments_discussionId_status_controversyScore_idx" ON "comments" USING btree ("discussionId","status","controversyScore");--> statement-breakpoint
CREATE INDEX "comments_discussionId_rootId_status_idx" ON "comments" USING btree ("discussionId","rootId","status");--> statement-breakpoint
CREATE INDEX "comments_authorId_idx" ON "comments" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "comments_authorId_status_createdAt_idx" ON "comments" USING btree ("authorId","status","createdAt");--> statement-breakpoint
CREATE INDEX "comments_parentId_idx" ON "comments" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "comments_parentId_createdAt_idx" ON "comments" USING btree ("parentId","createdAt");--> statement-breakpoint
CREATE INDEX "comments_rootId_idx" ON "comments" USING btree ("rootId");--> statement-breakpoint
CREATE INDEX "comments_testId_idx" ON "comments" USING btree ("testId");--> statement-breakpoint
CREATE INDEX "comments_deletedAt_idx" ON "comments" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "discussions_status_idx" ON "discussions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_followerId_followingId_idx" ON "follows" USING btree ("followerId","followingId");--> statement-breakpoint
CREATE INDEX "follows_followingId_status_idx" ON "follows" USING btree ("followingId","status");--> statement-breakpoint
CREATE INDEX "follows_followerId_status_idx" ON "follows" USING btree ("followerId","status");--> statement-breakpoint
CREATE INDEX "reports_status_priority_createdAt_idx" ON "reports" USING btree ("status","priority","createdAt");--> statement-breakpoint
CREATE INDEX "reports_reportedUserId_status_idx" ON "reports" USING btree ("reportedUserId","status");--> statement-breakpoint
CREATE INDEX "reports_targetType_targetId_idx" ON "reports" USING btree ("targetType","targetId");--> statement-breakpoint
CREATE INDEX "reports_assignedTo_status_idx" ON "reports" USING btree ("assignedTo","status");--> statement-breakpoint
CREATE UNIQUE INDEX "voice_access_requests_discussionId_userId_idx" ON "voice_access_requests" USING btree ("discussionId","userId");--> statement-breakpoint
CREATE INDEX "voice_access_requests_discussionId_status_idx" ON "voice_access_requests" USING btree ("discussionId","status");--> statement-breakpoint
CREATE INDEX "voice_access_requests_userId_status_idx" ON "voice_access_requests" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "notification_aggregations_targetId_type_windowStart_idx" ON "notification_aggregations" USING btree ("targetId","type","windowStart");--> statement-breakpoint
CREATE INDEX "notifications_userId_status_createdAt_idx" ON "notifications" USING btree ("userId","status","createdAt");--> statement-breakpoint
CREATE INDEX "notifications_userId_category_status_idx" ON "notifications" USING btree ("userId","category","status");--> statement-breakpoint
CREATE INDEX "notifications_userId_type_status_idx" ON "notifications" USING btree ("userId","type","status");--> statement-breakpoint
CREATE INDEX "notifications_resourceType_resourceId_idx" ON "notifications" USING btree ("resourceType","resourceId");--> statement-breakpoint
CREATE INDEX "notifications_aggregationId_idx" ON "notifications" USING btree ("aggregationId");--> statement-breakpoint
CREATE INDEX "notifications_expiresAt_idx" ON "notifications" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "notifications_deletedAt_idx" ON "notifications" USING btree ("deletedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "push_tokens_userId_deviceId_platform_idx" ON "push_tokens" USING btree ("userId","deviceId","platform");--> statement-breakpoint
CREATE INDEX "push_tokens_userId_isActive_idx" ON "push_tokens" USING btree ("userId","isActive");--> statement-breakpoint
CREATE INDEX "push_tokens_token_idx" ON "push_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "fraud_detection_logs_fingerprintHash_idx" ON "fraud_detection_logs" USING btree ("fingerprintHash");--> statement-breakpoint
CREATE INDEX "fraud_detection_logs_fingerprintHash_decision_idx" ON "fraud_detection_logs" USING btree ("fingerprintHash","decision");--> statement-breakpoint
CREATE INDEX "fraud_detection_logs_contentType_contentId_idx" ON "fraud_detection_logs" USING btree ("contentType","contentId");--> statement-breakpoint
CREATE INDEX "fraud_detection_logs_contentId_fraudScore_createdAt_idx" ON "fraud_detection_logs" USING btree ("contentId","fraudScore","createdAt");--> statement-breakpoint
CREATE INDEX "fraud_detection_logs_decision_createdAt_idx" ON "fraud_detection_logs" USING btree ("decision","createdAt");--> statement-breakpoint
CREATE INDEX "fraud_detection_logs_fraudScore_idx" ON "fraud_detection_logs" USING btree ("fraudScore");--> statement-breakpoint
CREATE INDEX "fraud_detection_logs_expiresAt_idx" ON "fraud_detection_logs" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "fraud_scores_entityType_entityId_idx" ON "fraud_scores" USING btree ("entityType","entityId");--> statement-breakpoint
CREATE INDEX "fraud_scores_decision_createdAt_idx" ON "fraud_scores" USING btree ("decision","createdAt");--> statement-breakpoint
CREATE INDEX "fraud_scores_score_idx" ON "fraud_scores" USING btree ("score");--> statement-breakpoint
CREATE INDEX "ip_reputations_reputationScore_idx" ON "ip_reputations" USING btree ("reputationScore");--> statement-breakpoint
CREATE INDEX "ip_reputations_country_idx" ON "ip_reputations" USING btree ("country");--> statement-breakpoint
CREATE INDEX "ip_reputations_isBlocked_idx" ON "ip_reputations" USING btree ("isBlocked");--> statement-breakpoint
CREATE INDEX "moderation_queue_status_priority_createdAt_idx" ON "moderation_queue" USING btree ("status","priority","createdAt");--> statement-breakpoint
CREATE INDEX "moderation_queue_assignedTo_status_idx" ON "moderation_queue" USING btree ("assignedTo","status");--> statement-breakpoint
CREATE INDEX "moderation_queue_entityType_entityId_idx" ON "moderation_queue" USING btree ("entityType","entityId");--> statement-breakpoint
CREATE INDEX "moderation_queue_status_createdAt_idx" ON "moderation_queue" USING btree ("status","createdAt");--> statement-breakpoint
CREATE INDEX "user_trust_scores_overallScore_idx" ON "user_trust_scores" USING btree ("overallScore");--> statement-breakpoint
CREATE UNIQUE INDEX "analytics_time_buckets_contentType_contentId_bucketStart_idx" ON "analytics_time_buckets" USING btree ("contentType","contentId","bucketStart");--> statement-breakpoint
CREATE INDEX "analytics_time_buckets_bucketStart_idx" ON "analytics_time_buckets" USING btree ("bucketStart");--> statement-breakpoint
CREATE INDEX "analytics_time_buckets_contentType_bucketStart_idx" ON "analytics_time_buckets" USING btree ("contentType","bucketStart");--> statement-breakpoint
CREATE INDEX "analytics_time_buckets_contentId_bucketStart_idx" ON "analytics_time_buckets" USING btree ("contentId","bucketStart");--> statement-breakpoint
CREATE INDEX "anonymous_participations_contentType_contentId_idx" ON "anonymous_participations" USING btree ("contentType","contentId");--> statement-breakpoint
CREATE INDEX "anonymous_participations_anonymousToken_idx" ON "anonymous_participations" USING btree ("anonymousToken");--> statement-breakpoint
CREATE INDEX "anonymous_participations_convertedToUserId_idx" ON "anonymous_participations" USING btree ("convertedToUserId");--> statement-breakpoint
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs" USING btree ("actorId","createdAt");--> statement-breakpoint
CREATE INDEX "audit_logs_entityType_entityId_createdAt_idx" ON "audit_logs" USING btree ("entityType","entityId","createdAt");--> statement-breakpoint
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs" USING btree ("action","createdAt");--> statement-breakpoint
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "content_views_contentType_contentId_viewedAt_idx" ON "content_views" USING btree ("contentType","contentId","viewedAt");--> statement-breakpoint
CREATE INDEX "content_views_userId_viewedAt_idx" ON "content_views" USING btree ("userId","viewedAt");--> statement-breakpoint
CREATE INDEX "content_views_sessionId_idx" ON "content_views" USING btree ("sessionId");--> statement-breakpoint
CREATE INDEX "feed_events_userId_occurredAt_idx" ON "feed_events" USING btree ("userId","occurredAt");--> statement-breakpoint
CREATE INDEX "feed_events_contentId_idx" ON "feed_events" USING btree ("contentId");--> statement-breakpoint
CREATE INDEX "feed_events_eventType_idx" ON "feed_events" USING btree ("eventType");--> statement-breakpoint
CREATE UNIQUE INDEX "hourly_poll_stats_pollId_hour_idx" ON "hourly_poll_stats" USING btree ("pollId","hour");--> statement-breakpoint
CREATE INDEX "hourly_poll_stats_hour_idx" ON "hourly_poll_stats" USING btree ("hour");--> statement-breakpoint
CREATE INDEX "hourly_poll_stats_pollId_hour_idx2" ON "hourly_poll_stats" USING btree ("pollId","hour");--> statement-breakpoint
CREATE UNIQUE INDEX "hourly_survey_stats_surveyId_hour_idx" ON "hourly_survey_stats" USING btree ("surveyId","hour");--> statement-breakpoint
CREATE INDEX "hourly_survey_stats_hour_idx" ON "hourly_survey_stats" USING btree ("hour");--> statement-breakpoint
CREATE INDEX "hourly_survey_stats_surveyId_hour_idx2" ON "hourly_survey_stats" USING btree ("surveyId","hour");--> statement-breakpoint
CREATE INDEX "popular_searches_trendingScore_idx" ON "popular_searches" USING btree ("trendingScore");--> statement-breakpoint
CREATE INDEX "popular_searches_searchCount_idx" ON "popular_searches" USING btree ("searchCount");--> statement-breakpoint
CREATE UNIQUE INDEX "population_datasets_countryCode_year_version_idx" ON "population_datasets" USING btree ("countryCode","year","version");--> statement-breakpoint
CREATE INDEX "population_datasets_countryCode_isActive_idx" ON "population_datasets" USING btree ("countryCode","isActive");--> statement-breakpoint
CREATE UNIQUE INDEX "population_distributions_datasetId_dimension_category_idx" ON "population_distributions" USING btree ("datasetId","dimension","category");--> statement-breakpoint
CREATE INDEX "population_distributions_datasetId_dimension_idx" ON "population_distributions" USING btree ("datasetId","dimension");--> statement-breakpoint
CREATE INDEX "pre_test_results_contentType_contentId_idx" ON "pre_test_results" USING btree ("contentType","contentId");--> statement-breakpoint
CREATE INDEX "pre_test_results_userId_idx" ON "pre_test_results" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "private_links_contentType_contentId_idx" ON "private_links" USING btree ("contentType","contentId");--> statement-breakpoint
CREATE INDEX "private_links_code_idx" ON "private_links" USING btree ("code");--> statement-breakpoint
CREATE INDEX "private_links_creatorId_idx" ON "private_links" USING btree ("creatorId");--> statement-breakpoint
CREATE INDEX "private_links_status_idx" ON "private_links" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_entries_identifier_endpoint_windowStart_idx" ON "rate_limit_entries" USING btree ("identifier","endpoint","windowStart");--> statement-breakpoint
CREATE INDEX "rate_limit_entries_identifier_windowStart_idx" ON "rate_limit_entries" USING btree ("identifier","windowStart");--> statement-breakpoint
CREATE INDEX "rate_limit_entries_expiresAt_idx" ON "rate_limit_entries" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "rate_limit_entries_isBlocked_blockedUntil_idx" ON "rate_limit_entries" USING btree ("isBlocked","blockedUntil");--> statement-breakpoint
CREATE INDEX "saved_searches_userId_idx" ON "saved_searches" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "saved_searches_notificationsEnabled_notificationFrequency_idx" ON "saved_searches" USING btree ("notificationsEnabled","notificationFrequency");--> statement-breakpoint
CREATE INDEX "search_histories_userId_searchedAt_idx" ON "search_histories" USING btree ("userId","searchedAt");--> statement-breakpoint
CREATE INDEX "search_histories_normalizedQuery_idx" ON "search_histories" USING btree ("normalizedQuery");--> statement-breakpoint
CREATE INDEX "sponsored_campaigns_organizationId_status_idx" ON "sponsored_campaigns" USING btree ("organizationId","status");--> statement-breakpoint
CREATE INDEX "sponsored_campaigns_status_startsAt_endsAt_idx" ON "sponsored_campaigns" USING btree ("status","startsAt","endsAt");--> statement-breakpoint
CREATE INDEX "sponsored_campaigns_contentType_contentId_idx" ON "sponsored_campaigns" USING btree ("contentType","contentId");--> statement-breakpoint
CREATE INDEX "system_events_eventType_severity_createdAt_idx" ON "system_events" USING btree ("eventType","severity","createdAt");--> statement-breakpoint
CREATE INDEX "system_events_severity_createdAt_idx" ON "system_events" USING btree ("severity","createdAt");--> statement-breakpoint
CREATE INDEX "system_events_correlationId_idx" ON "system_events" USING btree ("correlationId");--> statement-breakpoint
CREATE UNIQUE INDEX "trending_content_contentType_contentId_windowStart_idx" ON "trending_content" USING btree ("contentType","contentId","windowStart");--> statement-breakpoint
CREATE INDEX "trending_content_windowStart_trendingScore_idx" ON "trending_content" USING btree ("windowStart","trendingScore");--> statement-breakpoint
CREATE INDEX "trending_content_categoryId_windowStart_trendingScore_idx" ON "trending_content" USING btree ("categoryId","windowStart","trendingScore");--> statement-breakpoint
CREATE INDEX "cancellation_feedback_userId_idx" ON "cancellation_feedback" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "cancellation_feedback_reason_idx" ON "cancellation_feedback" USING btree ("reason");--> statement-breakpoint
CREATE INDEX "checkout_sessions_userId_status_idx" ON "checkout_sessions" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "checkout_sessions_status_expiresAt_idx" ON "checkout_sessions" USING btree ("status","expiresAt");--> statement-breakpoint
CREATE INDEX "refund_requests_userId_idx" ON "refund_requests" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "refund_requests_status_createdAt_idx" ON "refund_requests" USING btree ("status","createdAt");--> statement-breakpoint
CREATE INDEX "user_subscriptions_tier_status_idx" ON "user_subscriptions" USING btree ("tier","status");--> statement-breakpoint
CREATE INDEX "user_subscriptions_currentPeriodEnd_idx" ON "user_subscriptions" USING btree ("currentPeriodEnd");--> statement-breakpoint
CREATE INDEX "badges_category_isActive_idx" ON "badges" USING btree ("category","isActive");--> statement-breakpoint
CREATE INDEX "badges_rarity_idx" ON "badges" USING btree ("rarity");--> statement-breakpoint
CREATE INDEX "categories_parentId_idx" ON "categories" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "consent_policies_effectiveDate_idx" ON "consent_policies" USING btree ("effectiveDate");--> statement-breakpoint
CREATE INDEX "consent_policies_version_idx" ON "consent_policies" USING btree ("version");--> statement-breakpoint
CREATE INDEX "runtime_configs_key_active_idx" ON "runtime_configs" USING btree ("key","active");--> statement-breakpoint
CREATE INDEX "runtime_configs_experimentId_idx" ON "runtime_configs" USING btree ("experimentId");--> statement-breakpoint
CREATE UNIQUE INDEX "user_badges_userId_badgeId_idx" ON "user_badges" USING btree ("userId","badgeId");--> statement-breakpoint
CREATE INDEX "user_badges_gamificationId_idx" ON "user_badges" USING btree ("gamificationId");--> statement-breakpoint
CREATE INDEX "user_badges_badgeId_earnedAt_idx" ON "user_badges" USING btree ("badgeId","earnedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "user_consents_userId_policyId_idx" ON "user_consents" USING btree ("userId","policyId");--> statement-breakpoint
CREATE INDEX "user_consents_userId_isActive_idx" ON "user_consents" USING btree ("userId","isActive");--> statement-breakpoint
CREATE INDEX "user_consents_policyId_idx" ON "user_consents" USING btree ("policyId");--> statement-breakpoint
CREATE INDEX "user_gamification_level_totalXp_idx" ON "user_gamification" USING btree ("level","totalXp");--> statement-breakpoint
CREATE INDEX "user_gamification_rank_idx" ON "user_gamification" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_webhookEndpointId_status_idx" ON "webhook_deliveries" USING btree ("webhookEndpointId","status");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_status_nextRetryAt_idx" ON "webhook_deliveries" USING btree ("status","nextRetryAt");--> statement-breakpoint
CREATE INDEX "webhook_endpoints_organizationId_isActive_idx" ON "webhook_endpoints" USING btree ("organizationId","isActive");--> statement-breakpoint
CREATE INDEX "webhook_endpoints_isActive_consecutiveFailures_idx" ON "webhook_endpoints" USING btree ("isActive","consecutiveFailures");--> statement-breakpoint
CREATE INDEX "xp_transactions_gamificationId_createdAt_idx" ON "xp_transactions" USING btree ("gamificationId","createdAt");--> statement-breakpoint
CREATE INDEX "xp_transactions_type_createdAt_idx" ON "xp_transactions" USING btree ("type","createdAt");