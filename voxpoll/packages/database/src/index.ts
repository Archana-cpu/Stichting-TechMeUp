// ════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════

import type { InferSelectModel, InferInsertModel } from "drizzle-orm"
import type {
  users,
  sessions,
  accounts,
  organizations,
  organizationMembers,
  polls,
  pollResponses,
  surveys,
  surveyResponses,
  tests,
  comments,
  reports,
  notifications,
  userSubscriptions,
  refundRequests,
  cancellationFeedback,
  badges,
  xpTransactions,
  moderationQueue,
  checkoutSessions,
  notificationPreferences,
  appeals,
  contentApprovals,
  autoApprovalRules,
  fraudDetectionLogs,
  livePollSessions,
  auditLogs,
  profileVisits,
} from "./db/schema"

// ────────────────────────────────────────────────────────────────────────────
// Database Client & Schema
// ────────────────────────────────────────────────────────────────────────────

export { db, client } from "./client"

export * from "./db/schema"

// ────────────────────────────────────────────────────────────────────────────
// Drizzle Operators
// ────────────────────────────────────────────────────────────────────────────

export { eq, ne, gt, gte, lt, lte, and, or, not, inArray, notInArray, isNull, isNotNull, like, ilike, sql, desc, asc } from "drizzle-orm"

export type { InferSelectModel, InferInsertModel } from "drizzle-orm"

// ────────────────────────────────────────────────────────────────────────────
// Entity Types (for use in services/controllers)
// ────────────────────────────────────────────────────────────────────────────

export type User = InferSelectModel<typeof users>
export type Session = InferSelectModel<typeof sessions>
export type Account = InferSelectModel<typeof accounts>
export type Organization = InferSelectModel<typeof organizations>
export type OrganizationMember = InferSelectModel<typeof organizationMembers>
export type Poll = InferSelectModel<typeof polls>
export type PollResponse = InferSelectModel<typeof pollResponses>
export type Survey = InferSelectModel<typeof surveys>
export type SurveyResponse = InferSelectModel<typeof surveyResponses>
export type Test = InferSelectModel<typeof tests>
export type Comment = InferSelectModel<typeof comments>
export type Report = InferSelectModel<typeof reports>
export type Notification = InferSelectModel<typeof notifications>
export type Subscription = InferSelectModel<typeof userSubscriptions>
export type RefundRequest = InferSelectModel<typeof refundRequests>
export type CancellationFeedback = InferSelectModel<typeof cancellationFeedback>

// ────────────────────────────────────────────────────────────────────────────
// Enum Types (re-export for convenience)
// ────────────────────────────────────────────────────────────────────────────

export type UserStatus = User["status"]
export type UserRole = User["role"]
export type PollStatus = Poll["status"]
export type PollType = Poll["type"]
export type SurveyStatus = Survey["status"]
export type ReportStatus = Report["status"]
export type ReportResolution = Report["resolution"]
export type ReportTargetType = Report["targetType"]
export type ReportReason = Report["reason"]
export type NotificationType = Notification["type"]
export type NotificationCategory = Notification["category"]
export type NotificationPriority = Notification["priority"]
export type OrganizationType = Organization["type"]
export type OrganizationRole = OrganizationMember["role"]
export type UserSubscriptionTier = User["subscriptionTier"]
export type BillingPeriod = Subscription["billingPeriod"]
export type CancellationReason = CancellationFeedback["reason"]
export type RefundCase = RefundRequest["case"]

// Additional entity types
export type Badge = InferSelectModel<typeof badges>
export type XpTransaction = InferSelectModel<typeof xpTransactions>
export type ModerationQueueItem = InferSelectModel<typeof moderationQueue>
export type CheckoutSession = InferSelectModel<typeof checkoutSessions>
export type NotificationPreference = InferSelectModel<typeof notificationPreferences>

// Additional enum types
export type BadgeCategory = Badge["category"]
export type BadgeRarity = Badge["rarity"]
export type XpTransactionType = XpTransaction["type"]
export type ModerationStatus = ModerationQueueItem["status"]
export type ModerationResolution = ModerationQueueItem["resolution"]
export type ReportPriority = Report["priority"]
export type ActorType = Notification["actorType"]
export type ResourceType = Notification["resourceType"]
export type DigestFrequency = NotificationPreference["emailDigestFrequency"]
export type SubscriptionStatus = Subscription["status"]
export type Currency = CheckoutSession["currency"]
export type CheckoutSessionStatus = CheckoutSession["status"]
export type RefundStatus = RefundRequest["status"]
export type ContentStatus = Poll["status"]
export type ContentVisibility = Poll["visibility"]

export type Appeal = InferSelectModel<typeof appeals>
export type ContentApproval = InferSelectModel<typeof contentApprovals>
export type AutoApprovalRule = InferSelectModel<typeof autoApprovalRules>
export type FraudDetectionLog = InferSelectModel<typeof fraudDetectionLogs>
export type LivePollSession = InferSelectModel<typeof livePollSessions>
export type AuditLog = InferSelectModel<typeof auditLogs>
export type ProfileVisit = InferSelectModel<typeof profileVisits>

export type AppealStatus = Appeal["status"]
export type ContentType = ContentApproval["contentType"]
export type ApprovalStatus = ContentApproval["status"]
export type FraudDecision = FraudDetectionLog["decision"]
export type LivePollStatus = LivePollSession["status"]
export type AuditActorType = AuditLog["actorType"]
export type ProfileVisitSource = ProfileVisit["source"]

// ────────────────────────────────────────────────────────────────────────────
// Enum Value Constants (for type-safe enum usage: EnumName.VALUE)
// ────────────────────────────────────────────────────────────────────────────

export const UserStatusValues = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  DEACTIVATED: 'DEACTIVATED',
  DORMANT: 'DORMANT',
  DELETED: 'DELETED',
} as const

export const ContentStatusValues = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED',
  ARCHIVED: 'ARCHIVED',
} as const

export const ReportStatusValues = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
  ESCALATED: 'ESCALATED',
} as const

export const ModerationStatusValues = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
  ESCALATED: 'ESCALATED',
} as const
