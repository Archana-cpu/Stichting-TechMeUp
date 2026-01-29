# Database Schema
> Source: bible-002.md, bible-005.md, bible-006.md

---

# ══════════════════════════════════════════════════════════════════════════════
# DATABASE OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

## Database Technology

| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | PostgreSQL 16+ | Primary data store |
| ORM | Drizzle ORM | Type-safe SQL queries |
| Driver | postgres (porsager) | Fastest PostgreSQL driver |
| Migrations | Drizzle Kit | Schema migrations |

## Core Tables Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA OVERVIEW                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  USER DOMAIN                                                                    │
│  ├── users                    Core user accounts                                │
│  ├── accounts                 OAuth provider connections                        │
│  ├── sessions                 Active user sessions                              │
│  ├── user_demographics        Optional demographics data                        │
│  ├── user_badges              Earned badges                                     │
│  └── verification_requests    KYC/verification requests                         │
│                                                                                  │
│  CONTENT DOMAIN                                                                 │
│  ├── polls                    Poll content                                      │
│  ├── poll_options             Poll options                                      │
│  ├── surveys                  Survey content                                    │
│  ├── survey_questions         Survey questions                                  │
│  ├── tests                    Personality test content                          │
│  ├── test_questions           Test questions                                    │
│  ├── test_results             Test result categories                            │
│  └── pre_tests                Pre-test screening config                         │
│                                                                                  │
│  RESPONSE DOMAIN                                                                │
│  ├── poll_votes               Poll vote records                                 │
│  ├── survey_responses         Survey response sessions                          │
│  ├── survey_answers           Individual question answers                       │
│  ├── test_submissions         Test submission records                           │
│  └── participation_records    Anonymized participation tracking                 │
│                                                                                  │
│  SOCIAL DOMAIN                                                                  │
│  ├── follows                  User follow relationships                         │
│  ├── blocks                   User block relationships                          │
│  ├── comments                 Content comments                                  │
│  ├── comment_votes            Comment up/downvotes                              │
│  └── reports                  Content/user reports                              │
│                                                                                  │
│  ORGANIZATION DOMAIN                                                            │
│  ├── organizations            Organization accounts                             │
│  ├── organization_members     Member relationships                              │
│  ├── organization_invitations Pending invitations                               │
│  └── sso_configs              SSO provider configurations                       │
│                                                                                  │
│  SYSTEM DOMAIN                                                                  │
│  ├── categories               Content categories                                │
│  ├── tags                     Content tags                                      │
│  ├── notifications            User notifications                                │
│  ├── audit_logs               System audit trail                                │
│  └── feature_flags            Feature flag configurations                       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# USER DOMAIN SCHEMA
# ══════════════════════════════════════════════════════════════════════════════

## Users Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// USERS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const accountStatusEnum = pgEnum("account_status", [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
  "BANNED",
  "DELETED",
  "DORMANT"
])

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "FREE",
  "PLUS",
  "PREMIUM"
])

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phone: varchar("phone", { length: 20 }).unique(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),

  username: varchar("username", { length: 30 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),

  passwordHash: text("password_hash"),
  lastPasswordChange: timestamp("last_password_change"),

  verificationLevel: integer("verification_level").default(0).notNull(),
  status: accountStatusEnum("status").default("PENDING_VERIFICATION").notNull(),

  subscriptionTier: subscriptionTierEnum("subscription_tier").default("FREE").notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),

  trustScore: integer("trust_score").default(50).notNull(),
  fraudScore: integer("fraud_score").default(0).notNull(),

  lastLoginAt: timestamp("last_login_at"),
  lastActiveAt: timestamp("last_active_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  usernameIdx: index("users_username_idx").on(table.username),
  statusIdx: index("users_status_idx").on(table.status),
}))
```

## Account Status Transitions

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// USER ACCOUNT STATES
// ═══════════════════════════════════════════════════════════════════════════

type AccountStatus =
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "BANNED"
  | "DELETED"
  | "DORMANT"

interface AccountStatusTransition {
  from: AccountStatus
  to: AccountStatus
  allowedBy: "SYSTEM" | "ADMIN" | "USER"
  requiresReason: boolean
}

const ALLOWED_TRANSITIONS: AccountStatusTransition[] = [
  { from: "PENDING_VERIFICATION", to: "ACTIVE", allowedBy: "SYSTEM", requiresReason: false },
  { from: "ACTIVE", to: "SUSPENDED", allowedBy: "ADMIN", requiresReason: true },
  { from: "ACTIVE", to: "DELETED", allowedBy: "USER", requiresReason: false },
  { from: "ACTIVE", to: "DORMANT", allowedBy: "SYSTEM", requiresReason: false },
  { from: "SUSPENDED", to: "ACTIVE", allowedBy: "ADMIN", requiresReason: true },
  { from: "SUSPENDED", to: "BANNED", allowedBy: "ADMIN", requiresReason: true },
  { from: "DORMANT", to: "ACTIVE", allowedBy: "USER", requiresReason: false },
  { from: "DORMANT", to: "DELETED", allowedBy: "SYSTEM", requiresReason: false }
]
```

## Sessions Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// SESSIONS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  refreshToken: text("refresh_token").notNull().unique(),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at").notNull(),

  deviceFingerprint: text("device_fingerprint"),
  deviceType: varchar("device_type", { length: 50 }),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),

  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
}, (table) => ({
  userIdx: index("sessions_user_idx").on(table.userId),
  tokenIdx: index("sessions_token_idx").on(table.refreshToken),
}))
```

## OAuth Accounts Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// OAUTH ACCOUNTS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const oauthProviderEnum = pgEnum("oauth_provider", [
  "GOOGLE",
  "APPLE",
  "EDEVLET"
])

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  provider: oauthProviderEnum("provider").notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),

  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("accounts_user_idx").on(table.userId),
  providerIdx: uniqueIndex("accounts_provider_idx").on(table.provider, table.providerAccountId),
}))
```

---

# ══════════════════════════════════════════════════════════════════════════════
# CONTENT DOMAIN SCHEMA
# ══════════════════════════════════════════════════════════════════════════════

## Polls Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// POLLS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const pollTypeEnum = pgEnum("poll_type", [
  "QUICK",
  "EXTENDED",
  "LIVE"
])

export const contentStatusEnum = pgEnum("content_status", [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "CLOSED",
  "ARCHIVED",
  "DELETED"
])

export const visibilityEnum = pgEnum("visibility", [
  "PUBLIC",
  "UNLISTED",
  "PRIVATE",
  "ORGANIZATION"
])

export const polls = pgTable("polls", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  type: pollTypeEnum("type").default("QUICK").notNull(),
  creatorId: text("creator_id").notNull().references(() => users.id),
  organizationId: text("organization_id").references(() => organizations.id),

  question: text("question").notNull(),
  description: text("description"),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type", { length: 10 }),

  categoryId: text("category_id").references(() => categories.id),

  status: contentStatusEnum("status").default("ACTIVE").notNull(),
  visibility: visibilityEnum("visibility").default("PUBLIC").notNull(),

  totalVotes: integer("total_votes").default(0).notNull(),
  uniqueVoters: integer("unique_voters").default(0).notNull(),
  reliabilityScore: integer("reliability_score"),

  settings: jsonb("settings").$type<PollSettings>(),
  preTestConfig: jsonb("pre_test_config").$type<PreTestConfig>(),
  liveSettings: jsonb("live_settings").$type<LivePollSettings>(),
  targetAudience: jsonb("target_audience").$type<TargetAudienceConfig>(),

  joinCode: varchar("join_code", { length: 8 }).unique(),

  publishedAt: timestamp("published_at"),
  closesAt: timestamp("closes_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  creatorIdx: index("polls_creator_idx").on(table.creatorId),
  statusIdx: index("polls_status_idx").on(table.status),
  categoryIdx: index("polls_category_idx").on(table.categoryId),
  publishedAtIdx: index("polls_published_at_idx").on(table.publishedAt),
  joinCodeIdx: index("polls_join_code_idx").on(table.joinCode),
}))
```

## Poll Options Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// POLL OPTIONS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const pollOptions = pgTable("poll_options", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  pollId: text("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),

  text: varchar("text", { length: 500 }).notNull(),
  imageUrl: text("image_url"),

  position: integer("position").notNull(),
  voteCount: integer("vote_count").default(0).notNull(),

  isOther: boolean("is_other").default(false).notNull(),
  isNoneOfAbove: boolean("is_none_of_above").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pollIdx: index("poll_options_poll_idx").on(table.pollId),
  positionIdx: index("poll_options_position_idx").on(table.pollId, table.position),
}))
```

## Surveys Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// SURVEYS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const surveys = pgTable("surveys", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  creatorId: text("creator_id").notNull().references(() => users.id),
  organizationId: text("organization_id").notNull().references(() => organizations.id),

  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  welcomeMessage: text("welcome_message"),
  thankYouMessage: text("thank_you_message"),

  status: contentStatusEnum("status").default("DRAFT").notNull(),
  visibility: visibilityEnum("visibility").default("ORGANIZATION").notNull(),

  totalResponses: integer("total_responses").default(0).notNull(),
  targetResponses: integer("target_responses"),
  reliabilityScore: integer("reliability_score"),

  settings: jsonb("settings").$type<SurveySettings>(),
  preTestConfig: jsonb("pre_test_config").$type<PreTestConfig>(),

  publishedAt: timestamp("published_at"),
  closesAt: timestamp("closes_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  creatorIdx: index("surveys_creator_idx").on(table.creatorId),
  orgIdx: index("surveys_org_idx").on(table.organizationId),
  statusIdx: index("surveys_status_idx").on(table.status),
}))
```

## Tests (Personality Tests) Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// TESTS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const testResultTypeEnum = pgEnum("test_result_type", [
  "CATEGORY",
  "SPECTRUM",
  "COMPASS",
  "SCORE",
  "PROFILE"
])

export const tests = pgTable("tests", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  creatorId: text("creator_id").notNull().references(() => users.id),
  organizationId: text("organization_id").references(() => organizations.id),

  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),

  resultType: testResultTypeEnum("result_type").default("CATEGORY").notNull(),

  categoryId: text("category_id").references(() => categories.id),

  status: contentStatusEnum("status").default("DRAFT").notNull(),
  visibility: visibilityEnum("visibility").default("PUBLIC").notNull(),

  totalSubmissions: integer("total_submissions").default(0).notNull(),

  settings: jsonb("settings").$type<TestSettings>(),
  resultConfig: jsonb("result_config").$type<TestResultConfig>(),

  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  creatorIdx: index("tests_creator_idx").on(table.creatorId),
  statusIdx: index("tests_status_idx").on(table.status),
  categoryIdx: index("tests_category_idx").on(table.categoryId),
}))
```

---

# ══════════════════════════════════════════════════════════════════════════════
# RESPONSE DOMAIN SCHEMA
# ══════════════════════════════════════════════════════════════════════════════

## Poll Votes Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// POLL VOTES TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const pollVotes = pgTable("poll_votes", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  pollId: text("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  optionId: text("option_id").notNull().references(() => pollOptions.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),

  participantHash: varchar("participant_hash", { length: 64 }).notNull(),
  deviceFingerprint: varchar("device_fingerprint", { length: 64 }),

  responseTime: integer("response_time"),
  qualityScore: integer("quality_score"),
  verificationLevel: integer("verification_level"),
  weight: real("weight").default(1.0).notNull(),

  ipCountry: varchar("ip_country", { length: 2 }),

  isValid: boolean("is_valid").default(true).notNull(),
  invalidReason: varchar("invalid_reason", { length: 50 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pollIdx: index("poll_votes_poll_idx").on(table.pollId),
  optionIdx: index("poll_votes_option_idx").on(table.optionId),
  participantIdx: uniqueIndex("poll_votes_participant_idx").on(table.pollId, table.participantHash),
}))
```

## Survey Responses Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// SURVEY RESPONSES TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const responseStatusEnum = pgEnum("response_status", [
  "SCREENING",
  "IN_PROGRESS",
  "SUBMITTED",
  "VALIDATED",
  "COMPLETED",
  "DISQUALIFIED",
  "EXPIRED",
  "ABANDONED"
])

export const surveyResponses = pgTable("survey_responses", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  surveyId: text("survey_id").notNull().references(() => surveys.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),

  participantHash: varchar("participant_hash", { length: 64 }).notNull(),

  status: responseStatusEnum("status").default("IN_PROGRESS").notNull(),

  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),

  totalTimeSeconds: integer("total_time_seconds"),
  qualityScore: integer("quality_score"),
  fraudScore: integer("fraud_score"),

  deviceInfo: jsonb("device_info").$type<DeviceInfo>(),
  behaviorMetrics: jsonb("behavior_metrics").$type<BehaviorMetrics>(),

  isAnonymous: boolean("is_anonymous").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  surveyIdx: index("survey_responses_survey_idx").on(table.surveyId),
  userIdx: index("survey_responses_user_idx").on(table.userId),
  statusIdx: index("survey_responses_status_idx").on(table.status),
  participantIdx: uniqueIndex("survey_responses_participant_idx").on(table.surveyId, table.participantHash),
}))
```

## Participation Records (Anonymous Tracking)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// PARTICIPATION RECORDS TABLE
// For anonymous participation verification without linking identity
// ═══════════════════════════════════════════════════════════════════════════

export const contentTypeEnum = pgEnum("content_type", [
  "POLL",
  "SURVEY",
  "TEST"
])

export const participationRecords = pgTable("participation_records", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  contentType: contentTypeEnum("content_type").notNull(),
  contentId: text("content_id").notNull(),

  participantHash: varchar("participant_hash", { length: 64 }).notNull(),
  participationType: varchar("participation_type", { length: 20 }).default("COMPLETED").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  contentIdx: index("participation_content_idx").on(table.contentType, table.contentId),
  participantIdx: uniqueIndex("participation_participant_idx").on(table.contentType, table.contentId, table.participantHash),
}))
```

---

# ══════════════════════════════════════════════════════════════════════════════
# ORGANIZATION DOMAIN SCHEMA
# ══════════════════════════════════════════════════════════════════════════════

## Organizations Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATIONS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const organizationTierEnum = pgEnum("organization_tier", [
  "STARTER",
  "PROFESSIONAL",
  "ENTERPRISE"
])

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  ownerId: text("owner_id").notNull().references(() => users.id),

  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),

  tier: organizationTierEnum("tier").default("STARTER").notNull(),

  memberCount: integer("member_count").default(1).notNull(),
  maxMembers: integer("max_members").default(10).notNull(),

  settings: jsonb("settings").$type<OrganizationSettings>(),
  ssoConfig: jsonb("sso_config").$type<SSOConfig>(),

  stripeCustomerId: varchar("stripe_customer_id", { length: 100 }),
  subscriptionId: varchar("subscription_id", { length: 100 }),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),

  isVerified: boolean("is_verified").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  slugIdx: index("organizations_slug_idx").on(table.slug),
  ownerIdx: index("organizations_owner_idx").on(table.ownerId),
}))
```

## Organization Members Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION MEMBERS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const organizationRoleEnum = pgEnum("organization_role", [
  "OWNER",
  "ADMIN",
  "MEMBER",
  "VIEWER"
])

export const organizationMembers = pgTable("organization_members", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  role: organizationRoleEnum("role").default("MEMBER").notNull(),

  department: varchar("department", { length: 100 }),
  title: varchar("title", { length: 100 }),

  invitedBy: text("invited_by").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("org_members_org_idx").on(table.organizationId),
  userIdx: index("org_members_user_idx").on(table.userId),
  uniqueMemberIdx: uniqueIndex("org_members_unique_idx").on(table.organizationId, table.userId),
}))
```

---

# ══════════════════════════════════════════════════════════════════════════════
# SOCIAL DOMAIN SCHEMA
# ══════════════════════════════════════════════════════════════════════════════

## Comments Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// COMMENTS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const comments = pgTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  contentType: contentTypeEnum("content_type").notNull(),
  contentId: text("content_id").notNull(),

  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentId: text("parent_id").references(() => comments.id, { onDelete: "cascade" }),

  body: text("body").notNull(),

  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  wilsonScore: real("wilson_score").default(0).notNull(),

  isEdited: boolean("is_edited").default(false).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),

  replyCount: integer("reply_count").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  contentIdx: index("comments_content_idx").on(table.contentType, table.contentId),
  authorIdx: index("comments_author_idx").on(table.authorId),
  parentIdx: index("comments_parent_idx").on(table.parentId),
  scoreIdx: index("comments_score_idx").on(table.wilsonScore),
}))
```

## Follows Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// FOLLOWS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const follows = pgTable("follows", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  followerId: text("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: text("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  followerIdx: index("follows_follower_idx").on(table.followerId),
  followingIdx: index("follows_following_idx").on(table.followingId),
  uniqueFollowIdx: uniqueIndex("follows_unique_idx").on(table.followerId, table.followingId),
}))
```

---

# ══════════════════════════════════════════════════════════════════════════════
# SYSTEM DOMAIN SCHEMA
# ══════════════════════════════════════════════════════════════════════════════

## Categories Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIES TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  parentId: text("parent_id").references(() => categories.id),

  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),

  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("categories_slug_idx").on(table.slug),
  parentIdx: index("categories_parent_idx").on(table.parentId),
}))
```

## Notifications Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const notificationTypeEnum = pgEnum("notification_type", [
  "NEW_FOLLOWER",
  "NEW_COMMENT",
  "COMMENT_REPLY",
  "POLL_COMPLETED",
  "BADGE_EARNED",
  "SURVEY_INVITE",
  "SYSTEM_ALERT",
  "MENTION"
])

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body"),

  data: jsonb("data").$type<Record<string, unknown>>(),
  actionUrl: text("action_url"),

  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  unreadIdx: index("notifications_unread_idx").on(table.userId, table.isRead),
}))
```

## Audit Logs Table

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOGS TABLE
// ═══════════════════════════════════════════════════════════════════════════

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  actorId: text("actor_id").references(() => users.id),
  actorType: varchar("actor_type", { length: 20 }).notNull(),

  action: varchar("action", { length: 50 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: text("resource_id"),

  changes: jsonb("changes").$type<Record<string, unknown>>(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),

  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  actorIdx: index("audit_logs_actor_idx").on(table.actorId),
  resourceIdx: index("audit_logs_resource_idx").on(table.resourceType, table.resourceId),
  createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
}))
```

---

# ══════════════════════════════════════════════════════════════════════════════
# DATABASE RELATIONS
# ══════════════════════════════════════════════════════════════════════════════

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// DRIZZLE RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  polls: many(polls),
  surveys: many(surveys),
  tests: many(tests),
  comments: many(comments),
  followers: many(follows, { relationName: "followers" }),
  following: many(follows, { relationName: "following" }),
  organizations: many(organizationMembers),
  notifications: many(notifications),
}))

export const pollsRelations = relations(polls, ({ one, many }) => ({
  creator: one(users, {
    fields: [polls.creatorId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [polls.organizationId],
    references: [organizations.id],
  }),
  category: one(categories, {
    fields: [polls.categoryId],
    references: [categories.id],
  }),
  options: many(pollOptions),
  votes: many(pollVotes),
}))

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, {
    fields: [organizations.ownerId],
    references: [users.id],
  }),
  members: many(organizationMembers),
  surveys: many(surveys),
}))
```

---

# ══════════════════════════════════════════════════════════════════════════════
# INDEXING STRATEGY
# ══════════════════════════════════════════════════════════════════════════════

## Critical Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| users | users_email_idx | email | Login lookup |
| users | users_username_idx | username | Profile lookup |
| polls | polls_status_idx | status | Active polls filter |
| polls | polls_published_at_idx | publishedAt | Feed sorting |
| poll_votes | poll_votes_participant_idx | pollId, participantHash | Duplicate prevention |
| comments | comments_content_idx | contentType, contentId | Content comments |
| comments | comments_score_idx | wilsonScore | Ranking |

## Composite Indexes for Common Queries

```sql
-- Feed query optimization
CREATE INDEX idx_polls_feed ON polls (status, visibility, published_at DESC)
WHERE deleted_at IS NULL;

-- User content listing
CREATE INDEX idx_polls_user ON polls (creator_id, created_at DESC)
WHERE deleted_at IS NULL;

-- Organization surveys
CREATE INDEX idx_surveys_org ON surveys (organization_id, status, created_at DESC)
WHERE deleted_at IS NULL;
```

## Partial Indexes (Soft-Delete Optimization)

> **Migration:** 0003_add_partial_indexes.sql (2026-01-29)
> **Performance Target:** 2-5x improvement for feed/listing queries
> **Index Size Reduction:** 50-90% vs full table indexes

### P1 Priority - Critical Feed Performance

```sql
-- Feed query optimization (Bible spec compliance)
CREATE INDEX CONCURRENTLY idx_polls_feed_active
ON polls (status, visibility, publishedAt DESC)
WHERE deletedAt IS NULL;

-- User profile poll listing
CREATE INDEX CONCURRENTLY idx_polls_user_active
ON polls (creatorId, createdAt DESC)
WHERE deletedAt IS NULL;
```

### P2 Priority - Content Listing Optimization

```sql
-- Organization dashboard survey listing
CREATE INDEX CONCURRENTLY idx_surveys_org_active
ON surveys (organizationId, status, createdAt DESC)
WHERE deletedAt IS NULL;

-- Discussion thread ranking (Wilson score)
CREATE INDEX CONCURRENTLY idx_comments_ranked_active
ON comments (discussionId, status, wilsonScore DESC)
WHERE deletedAt IS NULL AND status = 'VISIBLE';

-- Recent comments listing
CREATE INDEX CONCURRENTLY idx_comments_recent_active
ON comments (discussionId, createdAt DESC)
WHERE deletedAt IS NULL AND status = 'VISIBLE';
```

### P3 Priority - Response Analytics Optimization

```sql
-- Active discussions by activity
CREATE INDEX CONCURRENTLY idx_discussions_active
ON discussions (status, lastActivityAt DESC)
WHERE deletedAt IS NULL;

-- Valid poll responses for analytics
CREATE INDEX CONCURRENTLY idx_poll_responses_valid_active
ON poll_responses (pollId, createdAt DESC)
WHERE deletedAt IS NULL AND isValid = true;

-- Completed survey responses
CREATE INDEX CONCURRENTLY idx_survey_responses_valid_active
ON survey_responses (surveyId, completedAt DESC)
WHERE deletedAt IS NULL AND isValid = true AND status = 'COMPLETED';
```

**Performance Notes:**
- Partial indexes exclude soft-deleted records from index maintenance
- CONCURRENTLY prevents table locking during index creation
- Index size reduction: 50-90% for tables with <10% deleted records
- Query performance improvement: 2-5x for WHERE deletedAt IS NULL filters
- Maintenance overhead: Minimal (deletedAt rarely changes once set)

---

*Source: bible-002.md, bible-005.md, bible-006.md*
