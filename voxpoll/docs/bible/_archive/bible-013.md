# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 13                                    █
# █                     DATABASE SCHEMA (DRIZZLE ORM)                          █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████
#
# [CROSS-REFERENCES]
# → Bible-028 §28.1: Remove deviceFingerprint, add deviceCategory enum (AUTHORITATIVE)
# → Bible-028 §28.5: Database Index Additions (AUTHORITATIVE)
# → Bible-029 §29.5: N+1 Query Prevention Patterns (AUTHORITATIVE)
# → Bible-030: Unified Type Definitions (AUTHORITATIVE)
# → Bible-031 §31.3: FraudDetectionLog table with 30-day auto-expiry (AUTHORITATIVE)
#
# [TECH STACK UPDATE - January 2026]
# Prisma ORM has been replaced with Drizzle ORM for the following reasons:
# • ~7kb bundle size vs Prisma's ~6.5MB (85% smaller)
# • Zero cold start overhead - perfect for serverless/edge
# • SQL-first approach - full control over queries
# • Native Redis caching via upstashCache()
# • 14x faster complex joins (no N+1 issues)
# • TypeScript inference without code generation




# ══════════════════════════════════════════════════════════════════════════════
# 13.1 DRIZZLE ORM CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

## 13.1.1 Drizzle Configuration

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Drizzle Kit configuration for migrations and studio                   │
# │ WHY:  Defines database connection and migration output settings             │
# │ FILE: packages/database/drizzle.config.ts                                   │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  verbose: true,
  strict: true
})

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • dialect: "postgresql"                                                     │
// │   └─ Tells Drizzle we're using PostgreSQL                                   │
// │   └─ Other options: "mysql", "sqlite"                                       │
// │                                                                             │
// │ • schema: "./src/schema/index.ts"                                           │
// │   └─ Path to your schema barrel export                                      │
// │   └─ All tables must be exported from this file                             │
// │                                                                             │
// │ • out: "./drizzle/migrations"                                               │
// │   └─ Where Drizzle Kit outputs SQL migration files                          │
// │   └─ These are pure SQL files you can inspect                               │
// │                                                                             │
// │ • verbose: true                                                             │
// │   └─ Shows detailed output during migration generation                      │
// │                                                                             │
// │ • strict: true                                                              │
// │   └─ Fails on warnings (recommended for production)                         │
// └─────────────────────────────────────────────────────────────────────────────┘
```

## 13.1.2 Database Client Setup

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Drizzle client with postgres driver and Redis cache                   │
# │ WHY:  Creates the database connection with caching support                  │
# │ FILE: packages/database/src/client.ts                                       │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { drizzle } from "drizzle-orm/postgres-js"
import { upstashCache } from "drizzle-orm/cache/upstash"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL!

const client = postgres(connectionString, {
  max: 20,
  idle_timeout: 30,
  max_lifetime: 1800,
  connect_timeout: 10
})

export const db = drizzle(client, {
  schema,
  cache: upstashCache()
})

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • postgres(connectionString, options)                                       │
// │   └─ Uses 'postgres' (porsager) - fastest PostgreSQL driver for Node.js    │
// │   └─ max: 20 → Maximum 20 connections in the pool                           │
// │   └─ idle_timeout: 30 → Close idle connections after 30 seconds             │
// │   └─ max_lifetime: 1800 → Max connection age 30 minutes                     │
// │                                                                             │
// │ • drizzle(client, { schema, cache })                                        │
// │   └─ Creates Drizzle instance with schema for type inference                │
// │   └─ cache: upstashCache() → Native Redis caching integration               │
// │                                                                             │
// │ • upstashCache()                                                            │
// │   └─ Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env     │
// │   └─ Automatically caches queries when you use .$withCache()                │
// └─────────────────────────────────────────────────────────────────────────────┘

export type Database = typeof db
export { schema }
```

## 13.1.3 Database Connection Settings

```typescript
const DATABASE_CONFIG = {
  connection: {
    poolSize: {
      min: 5,
      max: 20
    },
    connectionTimeout: 10000,
    idleTimeout: 30000,
    maxLifetime: 1800000
  },

  replica: {
    enabled: true,
    readReplicas: 2,
    loadBalancing: "round-robin"
  },

  ssl: {
    enabled: true,
    rejectUnauthorized: true
  }
}

export { DATABASE_CONFIG }
```

## 13.1.4 ID Generation Strategy (P-044)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ID GENERATION STRATEGY - CUID (Collision-Resistant Unique Identifier)
// Decision: P-044
// ══════════════════════════════════════════════════════════════════════════════

/**
 * VoxPoll uses CUID for all primary keys across all database models.
 *
 * DECISION RATIONALE:
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                     ID GENERATION OPTIONS COMPARISON                        │
 * ├──────────────────┬──────────┬──────────┬───────────┬───────────────────────┤
 * │ Feature          │ CUID     │ UUID v4  │ ObjectId  │ Auto-increment        │
 * ├──────────────────┼──────────┼──────────┼───────────┼───────────────────────┤
 * │ Length           │ 25 chars │ 36 chars │ 24 chars  │ Variable              │
 * │ URL-safe         │ ✅ Yes   │ ❌ No    │ ❌ No     │ ✅ Yes                │
 * │ Sortable by time │ ✅ Yes   │ ❌ No    │ ✅ Yes    │ ✅ Yes                │
 * │ Collision-safe   │ ✅ Yes   │ ✅ Yes   │ ✅ Yes    │ ❌ No (distributed)   │
 * │ No coordination  │ ✅ Yes   │ ✅ Yes   │ ✅ Yes    │ ❌ No                 │
 * │ Timestamp hidden │ ✅ Yes   │ ✅ Yes   │ ❌ Leaks  │ ❌ Leaks              │
 * │ Client-generate  │ ✅ Yes   │ ✅ Yes   │ ❌ Server │ ❌ Server             │
 * │ Index-friendly   │ ✅ Yes   │ ❌ Poor  │ ✅ Yes    │ ✅ Best               │
 * └──────────────────┴──────────┴──────────┴───────────┴───────────────────────┘
 */

const ID_GENERATION_CONFIG = {
  strategy: "CUID",
  drizzlePattern: "text('id').primaryKey().$defaultFn(() => createId())",
  exampleId: "clh3am4fx0000qwer1234abcd",
  charset: "0123456789abcdefghijklmnopqrstuvwxyz",
  length: 25,
  validationRegex: /^c[a-z0-9]{24}$/,
  zodValidation: "z.string().cuid()"
}

export { ID_GENERATION_CONFIG }
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.2 USER & AUTHENTICATION MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.2.1 User Enums

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: User-related enum definitions                                         │
# │ WHY:  PostgreSQL enums provide type safety and validation at DB level       │
# │ SQL:  CREATE TYPE user_role AS ENUM ('USER', 'MODERATOR', ...)              │
# │ FILE: packages/database/src/schema/enums.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

// ══════════════════════════════════════════════════════════════════════════════
// USER ENUMS
// ══════════════════════════════════════════════════════════════════════════════

export const userRoleEnum = pgEnum("user_role", [
  "USER",
  "MODERATOR",
  "ADMIN",
  "SUPER_ADMIN"
])

export const userStatusEnum = pgEnum("user_status", [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
  "BANNED",
  "DELETED",
  "DORMANT"
])

export const verificationMethodEnum = pgEnum("verification_method", [
  "EMAIL",
  "PHONE",
  "GOVERNMENT_ID",
  "ORGANIZATION"
])

export const userSubscriptionTierEnum = pgEnum("user_subscription_tier", [
  "FREE",
  "PLUS",
  "PREMIUM"
])

export const genderEnum = pgEnum("gender", [
  "MALE",
  "FEMALE",
  "NON_BINARY",
  "PREFER_NOT_TO_SAY"
])

export const educationLevelEnum = pgEnum("education_level", [
  "PRIMARY",
  "SECONDARY",
  "HIGH_SCHOOL",
  "ASSOCIATE",
  "BACHELOR",
  "MASTER",
  "DOCTORATE",
  "OTHER"
])

export const incomeRangeEnum = pgEnum("income_range", [
  "RANGE_0_25K",
  "RANGE_25K_50K",
  "RANGE_50K_75K",
  "RANGE_75K_100K",
  "RANGE_100K_150K",
  "RANGE_150K_PLUS",
  "PREFER_NOT_TO_SAY"
])

export const authProviderEnum = pgEnum("auth_provider", [
  "GOOGLE",
  "APPLE",
  "E_DEVLET"
])

export const deviceTypeEnum = pgEnum("device_type", [
  "DESKTOP",
  "MOBILE",
  "TABLET",
  "UNKNOWN"
])

export const ageGroupEnum = pgEnum("age_group", [
  "AGE_18_24",
  "AGE_25_34",
  "AGE_35_44",
  "AGE_45_54",
  "AGE_55_64",
  "AGE_65_PLUS"
])

export const urbanRuralEnum = pgEnum("urban_rural", [
  "URBAN",
  "SUBURBAN",
  "RURAL"
])

export const employmentStatusEnum = pgEnum("employment_status", [
  "EMPLOYED_FULL",
  "EMPLOYED_PART",
  "SELF_EMPLOYED",
  "UNEMPLOYED",
  "STUDENT",
  "RETIRED",
  "OTHER"
])

export const incomeLevelEnum = pgEnum("income_level", [
  "LOW",
  "LOWER_MIDDLE",
  "MIDDLE",
  "UPPER_MIDDLE",
  "HIGH"
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • pgEnum("user_role", [...])                                                │
// │   └─ Creates a PostgreSQL ENUM type                                         │
// │   └─ SQL: CREATE TYPE user_role AS ENUM ('USER', 'MODERATOR', ...)          │
// │   └─ Enums are validated at database level (not just TypeScript)            │
// │                                                                             │
// │ • Why use pgEnum instead of string?                                         │
// │   └─ Database validates values (can't insert invalid status)                │
// │   └─ More efficient storage (integer internally)                            │
// │   └─ Better TypeScript inference                                            │
// │   └─ Self-documenting schema                                                │
// └─────────────────────────────────────────────────────────────────────────────┘
```

## 13.2.2 User Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Main users table - stores all registered user accounts                │
# │ WHY:  Central identity store for authentication and authorization           │
# │ SQL:  CREATE TABLE users (id TEXT PRIMARY KEY, email VARCHAR(255), ...)     │
# │ FILE: packages/database/src/schema/users.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { userRoleEnum, userStatusEnum, verificationMethodEnum, userSubscriptionTierEnum } from "./enums"

// ══════════════════════════════════════════════════════════════════════════════
// USERS TABLE
// ══════════════════════════════════════════════════════════════════════════════

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  // Email authentication
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerifiedAt: timestamp("email_verified_at"),

  // Phone authentication
  phone: varchar("phone", { length: 20 }).unique(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  phoneVerifiedAt: timestamp("phone_verified_at"),

  // Profile information
  username: varchar("username", { length: 30 }).unique().notNull(),
  displayName: varchar("display_name", { length: 50 }).notNull(),
  avatarUrl: text("avatar_url"),
  bio: varchar("bio", { length: 500 }),

  // Password & Security
  passwordHash: varchar("password_hash", { length: 255 }),
  passwordChangedAt: timestamp("password_changed_at"),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  lastFailedLoginAt: timestamp("last_failed_login_at"),
  concurrentSessionLimit: integer("concurrent_session_limit").default(5).notNull(),

  // Role & Status
  role: userRoleEnum("role").default("USER").notNull(),
  status: userStatusEnum("status").default("ACTIVE").notNull(),

  // Verification
  isVerified: boolean("is_verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  verificationMethod: verificationMethodEnum("verification_method"),

  // Subscription
  subscriptionTier: userSubscriptionTierEnum("subscription_tier").default("FREE").notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  subscriptionStartedAt: timestamp("subscription_started_at"),
  lastBillingDate: timestamp("last_billing_date"),
  nextBillingDate: timestamp("next_billing_date"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),

  // Localization
  locale: varchar("locale", { length: 5 }).default("tr").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("Europe/Istanbul").notNull(),

  // Activity tracking
  lastLoginAt: timestamp("last_login_at"),
  lastActiveAt: timestamp("last_active_at"),

  // Suspension
  suspendedAt: timestamp("suspended_at"),
  suspendedUntil: timestamp("suspended_until"),
  suspensionReason: text("suspension_reason"),

  // Soft delete
  deletedAt: timestamp("deleted_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("users_email_idx").on(table.email),
  index("users_phone_idx").on(table.phone),
  index("users_username_idx").on(table.username),
  index("users_status_created_idx").on(table.status, table.createdAt),
  index("users_last_active_idx").on(table.lastActiveAt),
  index("users_deleted_idx").on(table.deletedAt),
  index("users_subscription_idx").on(table.subscriptionTier),
  index("users_stripe_customer_idx").on(table.stripeCustomerId)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • pgTable("users", { ... }, (table) => [...])                               │
// │   └─ First arg: table name in database                                      │
// │   └─ Second arg: column definitions                                         │
// │   └─ Third arg: function returning array of indexes                         │
// │                                                                             │
// │ • text("id").primaryKey().$defaultFn(() => createId())                      │
// │   └─ text("id") → Creates TEXT column named "id"                            │
// │   └─ .primaryKey() → Makes it the primary key                               │
// │   └─ .$defaultFn() → Runs function on INSERT (client-side)                  │
// │   └─ createId() → Generates CUID                                            │
// │                                                                             │
// │ • varchar("email", { length: 255 }).unique()                                │
// │   └─ Creates VARCHAR(255) with UNIQUE constraint                            │
// │   └─ No .notNull() means nullable (email can be null for phone-only auth)   │
// │                                                                             │
// │ • .default(false).notNull()                                                 │
// │   └─ Order matters: default THEN notNull                                    │
// │   └─ SQL: column BOOLEAN NOT NULL DEFAULT false                             │
// │                                                                             │
// │ • userRoleEnum("role").default("USER")                                      │
// │   └─ Uses the pgEnum we defined earlier                                     │
// │   └─ Column name is "role", type is user_role enum                          │
// │                                                                             │
// │ • .$onUpdate(() => new Date())                                              │
// │   └─ Automatically updates timestamp on every UPDATE                        │
// │   └─ Drizzle handles this in application code (not DB trigger)              │
// │                                                                             │
// │ • index("users_email_idx").on(table.email)                                  │
// │   └─ Creates B-tree index for faster email lookups                          │
// │   └─ Name convention: {table}_{column}_idx                                  │
// └─────────────────────────────────────────────────────────────────────────────┘

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles),
  sessions: many(sessions),
  accounts: many(accounts),
  devices: many(userDevices),
  demographic: one(userDemographics),
  gamification: one(userGamification),
  trustScore: one(userTrustScores),
  subscription: one(userSubscriptions),
  notificationPreference: one(notificationPreferences),
  interestProfile: one(userInterestProfiles),
  polls: many(polls),
  surveys: many(surveys),
  tests: many(tests),
  comments: many(comments),
  badges: many(userBadges),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
  blocking: many(blocks, { relationName: "blocker" }),
  blockedBy: many(blocks, { relationName: "blocked" }),
  reports: many(reports, { relationName: "reporter" }),
  reportedIn: many(reports, { relationName: "reported" }),
  notifications: many(notifications),
  pushTokens: many(pushTokens),
  organizationMemberships: many(organizationMembers)
}))

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES - Relations:                                                 │
// │                                                                             │
// │ • relations(users, ({ one, many }) => ({ ... }))                            │
// │   └─ Defines relationships for Drizzle's relational query API               │
// │   └─ Does NOT create foreign keys (those are in the related table)          │
// │   └─ Enables: db.query.users.findMany({ with: { profile: true } })          │
// │                                                                             │
// │ • one(userProfiles)                                                         │
// │   └─ One-to-one relationship                                                │
// │   └─ User has one profile                                                   │
// │                                                                             │
// │ • many(sessions)                                                            │
// │   └─ One-to-many relationship                                               │
// │   └─ User has many sessions                                                 │
// │                                                                             │
// │ • many(follows, { relationName: "follower" })                               │
// │   └─ Self-referential many-to-many through junction table                   │
// │   └─ relationName distinguishes the two sides of the relation               │
// └─────────────────────────────────────────────────────────────────────────────┘
```

## 13.2.3 User Profile Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Extended user profile with personal details                           │
# │ WHY:  Separates frequently-accessed user data from profile details          │
# │ SQL:  CREATE TABLE user_profiles (id TEXT PRIMARY KEY, user_id TEXT, ...)   │
# │ FILE: packages/database/src/schema/users.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { genderEnum, educationLevelEnum, incomeRangeEnum } from "./enums"

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").unique().notNull().references(() => users.id, { onDelete: "cascade" }),

  birthDate: timestamp("birth_date"),
  gender: genderEnum("gender"),

  country: varchar("country", { length: 2 }),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),

  education: educationLevelEnum("education"),
  occupation: varchar("occupation", { length: 100 }),
  industry: varchar("industry", { length: 100 }),

  incomeRange: incomeRangeEnum("income_range"),

  website: varchar("website", { length: 255 }),
  socialLinks: json("social_links").$type<Record<string, string>>().default({}),

  isPublic: boolean("is_public").default(true).notNull(),
  showLocation: boolean("show_location").default(false).notNull(),
  showAge: boolean("show_age").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("user_profiles_country_city_idx").on(table.country, table.city),
  index("user_profiles_gender_idx").on(table.gender),
  index("user_profiles_education_idx").on(table.education)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • .references(() => users.id, { onDelete: "cascade" })                      │
// │   └─ Creates foreign key constraint                                         │
// │   └─ SQL: REFERENCES users(id) ON DELETE CASCADE                            │
// │   └─ When user is deleted, profile is automatically deleted                 │
// │                                                                             │
// │ • json("social_links").$type<Record<string, string>>()                      │
// │   └─ Creates JSONB column with TypeScript type hint                         │
// │   └─ .$type<T>() provides type safety without runtime validation            │
// │                                                                             │
// │ • .default({})                                                              │
// │   └─ Sets default value for JSON column                                     │
// │   └─ Drizzle serializes to '{}' in SQL                                      │
// └─────────────────────────────────────────────────────────────────────────────┘

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id]
  })
}))

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES - Defining the "one" side:                                   │
// │                                                                             │
// │ • one(users, { fields: [...], references: [...] })                          │
// │   └─ fields: columns in THIS table that reference the other                 │
// │   └─ references: columns in the OTHER table being referenced                │
// │   └─ This is the "belongs to" side of the relationship                      │
// └─────────────────────────────────────────────────────────────────────────────┘
```

## 13.2.4 Session Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: User authentication sessions                                          │
# │ WHY:  Tracks active login sessions for security and session management      │
# │ SQL:  CREATE TABLE sessions (id TEXT PRIMARY KEY, token VARCHAR(255), ...)  │
# │ FILE: packages/database/src/schema/auth.ts                                  │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  token: varchar("token", { length: 255 }).unique().notNull(),
  refreshToken: varchar("refresh_token", { length: 255 }).unique(),

  deviceId: text("device_id"),

  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),

  expiresAt: timestamp("expires_at").notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),

  isRevoked: boolean("is_revoked").default(false).notNull(),
  revokedAt: timestamp("revoked_at"),
  revokedReason: text("revoked_reason"),

  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  index("sessions_user_revoked_idx").on(table.userId, table.isRevoked),
  index("sessions_token_idx").on(table.token),
  index("sessions_refresh_token_idx").on(table.refreshToken),
  index("sessions_expires_idx").on(table.expiresAt)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • varchar("ip_address", { length: 45 })                                     │
// │   └─ 45 chars accommodates IPv6 addresses (max 39) + zone ID                │
// │                                                                             │
// │ • Composite index: on(table.userId, table.isRevoked)                        │
// │   └─ Optimizes: WHERE user_id = ? AND is_revoked = false                    │
// │   └─ Column order matters - put most selective first                        │
// └─────────────────────────────────────────────────────────────────────────────┘

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  }),
  device: one(userDevices, {
    fields: [sessions.deviceId],
    references: [userDevices.id]
  })
}))
```

## 13.2.5 Account Table (OAuth)

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: OAuth provider accounts linked to users                               │
# │ WHY:  Enables Google, Apple, e-Devlet login                                 │
# │ SQL:  CREATE TABLE accounts (id TEXT PRIMARY KEY, provider auth_provider)   │
# │ FILE: packages/database/src/schema/auth.ts                                  │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { authProviderEnum } from "./enums"

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  provider: authProviderEnum("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),

  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),

  scope: text("scope"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  uniqueIndex("accounts_provider_account_idx").on(table.provider, table.providerAccountId),
  index("accounts_user_idx").on(table.userId)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • uniqueIndex("...").on(table.provider, table.providerAccountId)            │
// │   └─ Composite unique constraint                                            │
// │   └─ SQL: UNIQUE (provider, provider_account_id)                            │
// │   └─ Same provider account can't link to multiple users                     │
// │                                                                             │
// │ • text("access_token") vs varchar                                           │
// │   └─ OAuth tokens can be very long (>1000 chars)                            │
// │   └─ TEXT has no length limit in PostgreSQL                                 │
// └─────────────────────────────────────────────────────────────────────────────┘

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}))
```

## 13.2.6 User Device Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Tracks devices users have logged in from                              │
# │ WHY:  Security monitoring, trusted device management                        │
# │ SQL:  CREATE TABLE user_devices (fingerprint VARCHAR(64), ...)              │
# │ FILE: packages/database/src/schema/auth.ts                                  │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { deviceTypeEnum } from "./enums"

export const userDevices = pgTable("user_devices", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  fingerprint: varchar("fingerprint", { length: 64 }).notNull(),

  deviceType: deviceTypeEnum("device_type").notNull(),
  platform: varchar("platform", { length: 50 }),
  browser: varchar("browser", { length: 50 }),
  osVersion: varchar("os_version", { length: 50 }),

  deviceName: varchar("device_name", { length: 100 }),

  isTrusted: boolean("is_trusted").default(false).notNull(),
  trustedAt: timestamp("trusted_at"),

  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),

  ipAddresses: text("ip_addresses").array().default([]),

  isBlocked: boolean("is_blocked").default(false).notNull(),
  blockedAt: timestamp("blocked_at"),
  blockReason: text("block_reason")
}, (table) => [
  uniqueIndex("user_devices_user_fingerprint_idx").on(table.userId, table.fingerprint),
  index("user_devices_fingerprint_idx").on(table.fingerprint),
  index("user_devices_last_seen_idx").on(table.lastSeenAt)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • text("ip_addresses").array().default([])                                  │
// │   └─ Creates PostgreSQL TEXT[] array column                                 │
// │   └─ SQL: ip_addresses TEXT[] DEFAULT '{}'                                  │
// │   └─ Stores history of IP addresses used with this device                   │
// │                                                                             │
// │ • uniqueIndex on (userId, fingerprint)                                      │
// │   └─ Same device fingerprint per user = one record                          │
// │   └─ Different users can have same fingerprint (shared device)              │
// └─────────────────────────────────────────────────────────────────────────────┘

export const userDevicesRelations = relations(userDevices, ({ one, many }) => ({
  user: one(users, {
    fields: [userDevices.userId],
    references: [users.id]
  }),
  sessions: many(sessions)
}))
```

## 13.2.7 User Demographic Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Anonymized demographic data for analytics                             │
# │ WHY:  Enables demographic breakdowns without exposing personal details      │
# │ SQL:  CREATE TABLE user_demographics (age_group age_group, ...)             │
# │ FILE: packages/database/src/schema/users.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, timestamp, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { ageGroupEnum, genderEnum, urbanRuralEnum, educationLevelEnum, employmentStatusEnum, incomeLevelEnum } from "./enums"

export const userDemographics = pgTable("user_demographics", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").unique().notNull().references(() => users.id, { onDelete: "cascade" }),

  ageGroup: ageGroupEnum("age_group"),
  gender: genderEnum("gender"),
  region: varchar("region", { length: 50 }),
  urbanRural: urbanRuralEnum("urban_rural"),
  educationLevel: educationLevelEnum("education_level"),
  employmentStatus: employmentStatusEnum("employment_status"),
  incomeLevel: incomeLevelEnum("income_level"),

  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull()
}, (table) => [
  index("user_demographics_age_gender_idx").on(table.ageGroup, table.gender),
  index("user_demographics_region_idx").on(table.region)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • All fields use enums for grouping (ageGroup, not exact age)               │
// │   └─ Privacy: Can't identify individuals from demographic data              │
// │   └─ Analytics: Easy to GROUP BY for demographic reports                    │
// │                                                                             │
// │ • Composite index on (ageGroup, gender)                                     │
// │   └─ Common query: "How did 25-34 males vote?"                              │
// │   └─ Index covers both columns for efficient filtering                      │
// └─────────────────────────────────────────────────────────────────────────────┘

export const userDemographicsRelations = relations(userDemographics, ({ one }) => ({
  user: one(users, {
    fields: [userDemographics.userId],
    references: [users.id]
  })
}))
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.3 ORGANIZATION MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.3.1 Organization Enums

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Organization-related enum definitions                                 │
# │ WHY:  Type safety for organization types, statuses, and roles               │
# │ SQL:  CREATE TYPE organization_type AS ENUM ('CORPORATION', ...)            │
# │ FILE: packages/database/src/schema/enums.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

// ══════════════════════════════════════════════════════════════════════════════
// ORGANIZATION ENUMS
// ══════════════════════════════════════════════════════════════════════════════

export const organizationTypeEnum = pgEnum("organization_type", [
  "CORPORATION",
  "MUNICIPALITY",
  "GOVERNMENT",
  "NGO",
  "EDUCATION",
  "MEDIA",
  "RESEARCH",
  "OTHER"
])

export const organizationStatusEnum = pgEnum("organization_status", [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "DELETED"
])

export const orgMemberRoleEnum = pgEnum("org_member_role", [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "ANALYST",
  "CREATOR",
  "MEMBER"
])

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "FREE",
  "STARTER",
  "PROFESSIONAL",
  "ENTERPRISE",
  "CUSTOM"
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • subscriptionTierEnum vs userSubscriptionTierEnum                          │
// │   └─ Organizations have different tiers than individual users               │
// │   └─ Organization: STARTER ($99), PROFESSIONAL ($299), ENTERPRISE ($999)   │
// │   └─ User: FREE, PLUS, PREMIUM                                              │
// │                                                                             │
// │ • orgMemberRoleEnum defines permissions hierarchy                           │
// │   └─ OWNER: Full control, can delete org                                    │
// │   └─ ADMIN: Can manage members, settings                                    │
// │   └─ MANAGER: Can manage surveys/polls                                      │
// │   └─ ANALYST: Read-only access to analytics                                 │
// │   └─ CREATOR: Can create content                                            │
// │   └─ MEMBER: Basic access                                                   │
// └─────────────────────────────────────────────────────────────────────────────┘
```

## 13.3.2 Organization Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Organizations (companies, NGOs, municipalities)                       │
# │ WHY:  B2B customers who create surveys and manage teams                     │
# │ SQL:  CREATE TABLE organizations (id TEXT PRIMARY KEY, slug VARCHAR(100))   │
# │ FILE: packages/database/src/schema/organizations.ts                         │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { organizationTypeEnum, organizationStatusEnum, subscriptionTierEnum } from "./enums"

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),

  type: organizationTypeEnum("type").notNull(),

  description: varchar("description", { length: 1000 }),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  website: varchar("website", { length: 255 }),

  isVerified: boolean("is_verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  verificationDocuments: json("verification_documents").$type<string[]>().default([]),

  country: varchar("country", { length: 2 }).notNull(),
  city: varchar("city", { length: 100 }),
  address: varchar("address", { length: 500 }),

  taxId: varchar("tax_id", { length: 50 }),

  status: organizationStatusEnum("status").default("PENDING").notNull(),

  settings: json("settings").$type<Record<string, unknown>>().default({}),

  subscriptionTier: subscriptionTierEnum("subscription_tier").default("FREE").notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at")
}, (table) => [
  index("organizations_slug_idx").on(table.slug),
  index("organizations_type_status_idx").on(table.type, table.status),
  index("organizations_verified_idx").on(table.isVerified)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • json("verification_documents").$type<string[]>().default([])              │
// │   └─ Stores array of document URLs in JSONB                                 │
// │   └─ .$type<string[]>() provides TypeScript type                            │
// │   └─ Drizzle serializes [] to '[]' in SQL                                   │
// │                                                                             │
// │ • json("settings").$type<Record<string, unknown>>()                         │
// │   └─ Flexible settings object for org-specific config                       │
// │   └─ Can store SSO settings, branding, etc.                                 │
// │                                                                             │
// │ • Composite index on (type, status)                                         │
// │   └─ Optimizes: "Show all active corporations"                              │
// │   └─ Common admin dashboard query                                           │
// └─────────────────────────────────────────────────────────────────────────────┘

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  surveys: many(surveys),
  polls: many(polls),
  webhookEndpoints: many(webhookEndpoints),
  sponsoredCampaigns: many(sponsoredCampaigns)
}))
```

## 13.3.3 Organization Member Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Junction table linking users to organizations with roles              │
# │ WHY:  Users can belong to multiple orgs with different permissions          │
# │ SQL:  CREATE TABLE organization_members (organization_id TEXT, user_id TEXT)│
# │ FILE: packages/database/src/schema/organizations.ts                         │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { orgMemberRoleEnum } from "./enums"

export const organizationMembers = pgTable("organization_members", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  role: orgMemberRoleEnum("role").default("MEMBER").notNull(),

  permissions: text("permissions").array().default([]),

  invitedBy: text("invited_by"),
  invitedAt: timestamp("invited_at"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),

  isActive: boolean("is_active").default(true).notNull(),
  deactivatedAt: timestamp("deactivated_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  uniqueIndex("org_members_org_user_idx").on(table.organizationId, table.userId),
  index("org_members_user_idx").on(table.userId),
  index("org_members_role_idx").on(table.role)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • uniqueIndex on (organizationId, userId)                                   │
// │   └─ Prevents duplicate memberships                                         │
// │   └─ A user can only be member of an org once                               │
// │                                                                             │
// │ • text("permissions").array()                                               │
// │   └─ PostgreSQL TEXT[] for fine-grained permissions                         │
// │   └─ e.g., ["surveys.create", "surveys.delete", "analytics.view"]           │
// │   └─ Supplements role-based access with specific overrides                  │
// │                                                                             │
// │ • Two foreign keys with onDelete: "cascade"                                 │
// │   └─ If org deleted → membership deleted                                    │
// │   └─ If user deleted → membership deleted                                   │
// └─────────────────────────────────────────────────────────────────────────────┘

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id]
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id]
  })
}))
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.4 CONTENT MODELS (POLL, SURVEY, TEST)
# ══════════════════════════════════════════════════════════════════════════════

## 13.4.1 Content Enums

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Content-related enum definitions for polls, surveys, tests            │
# │ WHY:  Shared status and visibility types across all content types           │
# │ SQL:  CREATE TYPE content_status AS ENUM ('DRAFT', 'SCHEDULED', ...)        │
# │ FILE: packages/database/src/schema/enums.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT ENUMS
// ══════════════════════════════════════════════════════════════════════════════

export const contentStatusEnum = pgEnum("content_status", [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "ARCHIVED",
  "DELETED"
])

export const contentVisibilityEnum = pgEnum("content_visibility", [
  "PUBLIC",
  "UNLISTED",
  "PRIVATE",
  "ORGANIZATION_ONLY"
])

export const resultsVisibilityEnum = pgEnum("results_visibility", [
  "ALWAYS_VISIBLE",
  "AFTER_PARTICIPATION",
  "AFTER_END",
  "CREATOR_ONLY"
])

export const questionTypeEnum = pgEnum("question_type", [
  // Basic Selection
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "YES_NO",
  "IMAGE_CHOICE",
  // Likert Scales
  "LIKERT_AGREEMENT_5",
  "LIKERT_AGREEMENT_7",
  "LIKERT_SATISFACTION_5",
  "LIKERT_SATISFACTION_7",
  "LIKERT_FREQUENCY_5",
  "LIKERT_FREQUENCY_7",
  "LIKERT_IMPORTANCE_5",
  "LIKERT_LIKELIHOOD_5",
  "SEMANTIC_DIFFERENTIAL",
  // Industry Metrics
  "NET_PROMOTER_SCORE",
  "CSAT",
  "CSAT_EMOJI",
  "CUSTOMER_EFFORT_SCORE",
  // Advanced
  "MAXDIFF",
  "CONJOINT",
  "CONSTANT_SUM",
  // Ranking & Rating
  "RANKING",
  "RATING_SCALE",
  "SLIDER",
  "MATRIX_SINGLE",
  "MATRIX_MULTIPLE",
  "MATRIX_LIKERT",
  // Open-ended
  "SHORT_TEXT",
  "LONG_TEXT",
  "NUMBER",
  "DATE",
  "TIME",
  "DATETIME",
  "FILE_UPLOAD",
  "EMAIL",
  "PHONE",
  "URL",
  // Quality Control
  "ATTENTION_CHECK",
  "INSTRUCTED_RESPONSE",
  "CAPTCHA"
])

export const incentiveTypeEnum = pgEnum("incentive_type", [
  "POINTS",
  "BADGE",
  "RAFFLE",
  "DIRECT_PAYMENT"
])

export const invitationStatusEnum = pgEnum("invitation_status", [
  "PENDING",
  "SENT",
  "OPENED",
  "STARTED",
  "COMPLETED",
  "EXPIRED",
  "BOUNCED"
])

export const testCategoryEnum = pgEnum("test_category", [
  "PERSONALITY",
  "QUIZ"
])

export const personalityTestTypeEnum = pgEnum("personality_test_type", [
  "AXIS",
  "CHARACTER",
  "SPECTRUM"
])

export const personalityQuestionTypeEnum = pgEnum("personality_question_type", [
  "STATEMENT_AGREE_5",
  "STATEMENT_AGREE_7",
  "AGREE_DISAGREE",
  "FORCED_CHOICE",
  "THIS_OR_THAT",
  "BINARY_CHOICE",
  "WORD_PAIR",
  "SLIDER",
  "SLIDER_BIPOLAR",
  "SINGLE_CHOICE",
  "IMAGE_CHOICE",
  "IMAGE_SCENARIO",
  "RANKING",
  "SCENARIO_CHOICE",
  "HYPOTHETICAL",
  "STATEMENT_AGREE_REVERSE"
])

export const quizTypeEnum = pgEnum("quiz_type", [
  "KNOWLEDGE",
  "TRIVIA",
  "EDUCATIONAL",
  "SKILL_ASSESSMENT"
])

export const quizQuestionTypeEnum = pgEnum("quiz_question_type", [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "SHORT_ANSWER",
  "FILL_BLANK",
  "FILL_BLANK_MULTIPLE",
  "MATCHING",
  "ORDERING",
  "CATEGORIZATION",
  "HOTSPOT",
  "DRAG_DROP",
  "PARTIAL_CREDIT_MULTI",
  "WEIGHTED_MULTI"
])

export const questionDifficultyEnum = pgEnum("question_difficulty", [
  "EASY",
  "MEDIUM",
  "HARD"
])

export const attemptStatusEnum = pgEnum("attempt_status", [
  "IN_PROGRESS",
  "COMPLETED",
  "TIMED_OUT",
  "ABANDONED"
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • questionTypeEnum has 40+ values                                           │
// │   └─ PostgreSQL handles large enums efficiently                             │
// │   └─ Adding new values: ALTER TYPE question_type ADD VALUE 'NEW_TYPE'       │
// │   └─ Cannot remove values from PostgreSQL enums easily                      │
// │                                                                             │
// │ • Separate enums for personality vs quiz questions                          │
// │   └─ personalityQuestionTypeEnum: Likert, forced choice, etc.               │
// │   └─ quizQuestionTypeEnum: Has correct answers                              │
// │   └─ Different scoring algorithms                                           │
// └─────────────────────────────────────────────────────────────────────────────┘
```

## 13.4.2 Poll Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Public polls for community engagement                                 │
# │ WHY:  Core feature - quick public opinion gathering                         │
# │ SQL:  CREATE TABLE polls (id TEXT PRIMARY KEY, title VARCHAR(200), ...)     │
# │ FILE: packages/database/src/schema/polls.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, real, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { contentStatusEnum, contentVisibilityEnum, resultsVisibilityEnum } from "./enums"

export const polls = pgTable("polls", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  creatorId: text("creator_id").notNull().references(() => users.id),
  organizationId: text("organization_id").references(() => organizations.id),

  title: varchar("title", { length: 200 }).notNull(),
  description: varchar("description", { length: 2000 }),
  slug: varchar("slug", { length: 250 }).unique().notNull(),

  coverImageUrl: text("cover_image_url"),

  status: contentStatusEnum("status").default("DRAFT").notNull(),
  visibility: contentVisibilityEnum("visibility").default("PUBLIC").notNull(),

  categoryId: text("category_id").references(() => categories.id),
  tags: text("tags").array().default([]),

  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at").notNull(),

  resultsVisibility: resultsVisibilityEnum("results_visibility").default("AFTER_PARTICIPATION").notNull(),

  allowComments: boolean("allow_comments").default(true).notNull(),

  targetAudienceRules: json("target_audience_rules").$type<Record<string, unknown>>().default({}),

  participantCount: integer("participant_count").default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  shareCount: integer("share_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),

  reliabilityScore: real("reliability_score"),
  reliabilityFactors: json("reliability_factors").$type<Record<string, unknown>>().default({}),

  hotScore: real("hot_score").default(0).notNull(),
  hotScoreUpdatedAt: timestamp("hot_score_updated_at").defaultNow().notNull(),

  publishedAt: timestamp("published_at"),
  completedAt: timestamp("completed_at"),
  archivedAt: timestamp("archived_at"),
  deletedAt: timestamp("deleted_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("polls_creator_status_idx").on(table.creatorId, table.status),
  index("polls_org_status_idx").on(table.organizationId, table.status),
  index("polls_status_visibility_ends_idx").on(table.status, table.visibility, table.endsAt),
  index("polls_category_idx").on(table.categoryId),
  index("polls_hot_score_idx").on(table.hotScore),
  index("polls_published_idx").on(table.publishedAt),
  index("polls_slug_idx").on(table.slug)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • real("hot_score") vs integer                                              │
// │   └─ real = PostgreSQL REAL (4-byte float)                                  │
// │   └─ Hot score uses Reddit-style decay algorithm                            │
// │   └─ Needs decimal precision for ranking                                    │
// │                                                                             │
// │ • text("tags").array()                                                      │
// │   └─ PostgreSQL TEXT[] for flexible tagging                                 │
// │   └─ Queryable: WHERE 'politics' = ANY(tags)                                │
// │                                                                             │
// │ • denormalized counts (participantCount, viewCount, etc.)                   │
// │   └─ Avoids COUNT(*) queries which are slow on large tables                 │
// │   └─ Updated via triggers or application code                               │
// │   └─ Trade-off: faster reads, slightly complex writes                       │
// └─────────────────────────────────────────────────────────────────────────────┘

export const pollsRelations = relations(polls, ({ one, many }) => ({
  creator: one(users, {
    fields: [polls.creatorId],
    references: [users.id]
  }),
  organization: one(organizations, {
    fields: [polls.organizationId],
    references: [organizations.id]
  }),
  category: one(categories, {
    fields: [polls.categoryId],
    references: [categories.id]
  }),
  questions: many(pollQuestions),
  responses: many(pollResponses),
  discussion: one(discussions),
  liveSession: one(livePollSessions)
}))
```

## 13.4.3 Poll Question Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Questions within a poll                                               │
# │ WHY:  Polls can have multiple questions (multi-question polls)              │
# │ SQL:  CREATE TABLE poll_questions (poll_id TEXT, order_index INT, ...)      │
# │ FILE: packages/database/src/schema/polls.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, json, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { questionTypeEnum } from "./enums"

export const pollQuestions = pgTable("poll_questions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  pollId: text("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),

  orderIndex: integer("order_index").notNull(),

  type: questionTypeEnum("type").notNull(),

  text: varchar("text", { length: 500 }).notNull(),
  description: varchar("description", { length: 1000 }),

  imageUrl: text("image_url"),

  isRequired: boolean("is_required").default(true).notNull(),

  options: json("options").$type<Array<{ id: string, text: string, imageUrl?: string }>>().default([]),

  settings: json("settings").$type<Record<string, unknown>>().default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  uniqueIndex("poll_questions_poll_order_idx").on(table.pollId, table.orderIndex),
  index("poll_questions_poll_idx").on(table.pollId)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • uniqueIndex on (pollId, orderIndex)                                       │
// │   └─ Ensures no duplicate order positions within a poll                     │
// │   └─ Question 1, 2, 3... must be unique per poll                            │
// │                                                                             │
// │ • json("options").$type<Array<...>>()                                       │
// │   └─ Flexible structure for different question types                        │
// │   └─ SINGLE_CHOICE: [{id, text}, {id, text}]                                │
// │   └─ IMAGE_CHOICE: [{id, text, imageUrl}, ...]                              │
// │   └─ Type safety with .$type<>() but no runtime validation                  │
// └─────────────────────────────────────────────────────────────────────────────┘

export const pollQuestionsRelations = relations(pollQuestions, ({ one }) => ({
  poll: one(polls, {
    fields: [pollQuestions.pollId],
    references: [polls.id]
  })
}))
```

## 13.4.4 Survey Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Professional surveys for organizations                                │
# │ WHY:  B2B feature - complex surveys with sections, logic, incentives        │
# │ SQL:  CREATE TABLE surveys (id TEXT PRIMARY KEY, organization_id TEXT, ...) │
# │ FILE: packages/database/src/schema/surveys.ts                               │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, real, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { contentStatusEnum, contentVisibilityEnum, resultsVisibilityEnum, incentiveTypeEnum } from "./enums"

export const surveys = pgTable("surveys", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  creatorId: text("creator_id").notNull().references(() => users.id),
  organizationId: text("organization_id").notNull().references(() => organizations.id),

  title: varchar("title", { length: 200 }).notNull(),
  description: varchar("description", { length: 2000 }),
  slug: varchar("slug", { length: 250 }).unique().notNull(),

  coverImageUrl: text("cover_image_url"),

  status: contentStatusEnum("status").default("DRAFT").notNull(),
  visibility: contentVisibilityEnum("visibility").default("ORGANIZATION_ONLY").notNull(),

  categoryId: text("category_id").references(() => categories.id),
  tags: text("tags").array().default([]),

  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at").notNull(),

  targetResponseCount: integer("target_response_count"),
  maxResponseCount: integer("max_response_count"),

  estimatedDuration: integer("estimated_duration"),

  resultsVisibility: resultsVisibilityEnum("results_visibility").default("CREATOR_ONLY").notNull(),

  allowAnonymous: boolean("allow_anonymous").default(true).notNull(),
  requireVerification: boolean("require_verification").default(false).notNull(),

  targetAudienceRules: json("target_audience_rules").$type<Record<string, unknown>>().default({}),

  incentiveType: incentiveTypeEnum("incentive_type"),
  incentiveAmount: real("incentive_amount"),
  incentiveDescription: text("incentive_description"),

  reminderSettings: json("reminder_settings").$type<Record<string, unknown>>().default({}),

  responseCount: integer("response_count").default(0).notNull(),
  completionCount: integer("completion_count").default(0).notNull(),
  averageDuration: integer("average_duration"),

  reliabilityScore: real("reliability_score"),
  reliabilityFactors: json("reliability_factors").$type<Record<string, unknown>>().default({}),

  publishedAt: timestamp("published_at"),
  completedAt: timestamp("completed_at"),
  archivedAt: timestamp("archived_at"),
  deletedAt: timestamp("deleted_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("surveys_creator_status_idx").on(table.creatorId, table.status),
  index("surveys_org_status_idx").on(table.organizationId, table.status),
  index("surveys_status_ends_idx").on(table.status, table.endsAt),
  index("surveys_slug_idx").on(table.slug)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • organizationId is NOT NULL for surveys                                    │
// │   └─ Surveys are always org-owned (B2B feature)                             │
// │   └─ Polls can be individual or org-owned (organizationId nullable)         │
// │                                                                             │
// │ • incentiveType + incentiveAmount                                           │
// │   └─ Surveys can offer rewards for completion                               │
// │   └─ POINTS: Internal gamification points                                   │
// │   └─ DIRECT_PAYMENT: Real money via payment processor                       │
// │                                                                             │
// │ • estimatedDuration in minutes                                              │
// │   └─ Shown to participants before starting                                  │
// │   └─ Used for speeding detection (actual vs expected)                       │
// └─────────────────────────────────────────────────────────────────────────────┘

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  creator: one(users, {
    fields: [surveys.creatorId],
    references: [users.id]
  }),
  organization: one(organizations, {
    fields: [surveys.organizationId],
    references: [organizations.id]
  }),
  category: one(categories, {
    fields: [surveys.categoryId],
    references: [categories.id]
  }),
  sections: many(surveySections),
  invitations: many(surveyInvitations),
  responses: many(surveyResponses)
}))
```

## 13.4.5 Survey Section Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Sections/pages within a survey                                        │
# │ WHY:  Organizes questions into logical groups with optional randomization   │
# │ SQL:  CREATE TABLE survey_sections (survey_id TEXT, order_index INT, ...)   │
# │ FILE: packages/database/src/schema/surveys.ts                               │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, json, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const surveySections = pgTable("survey_sections", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  surveyId: text("survey_id").notNull().references(() => surveys.id, { onDelete: "cascade" }),

  orderIndex: integer("order_index").notNull(),

  title: varchar("title", { length: 200 }),
  description: varchar("description", { length: 1000 }),

  isRandomized: boolean("is_randomized").default(false).notNull(),

  displayLogic: json("display_logic").$type<Record<string, unknown>>().default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  uniqueIndex("survey_sections_survey_order_idx").on(table.surveyId, table.orderIndex),
  index("survey_sections_survey_idx").on(table.surveyId)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • isRandomized                                                              │
// │   └─ When true, questions in this section are shown in random order         │
// │   └─ Reduces order bias in research surveys                                 │
// │                                                                             │
// │ • displayLogic JSON                                                         │
// │   └─ Conditional section display based on previous answers                  │
// │   └─ e.g., { "showIf": { "q1": "yes" } }                                    │
// └─────────────────────────────────────────────────────────────────────────────┘

export const surveySectionsRelations = relations(surveySections, ({ one, many }) => ({
  survey: one(surveys, {
    fields: [surveySections.surveyId],
    references: [surveys.id]
  }),
  questions: many(surveyQuestions)
}))
```

## 13.4.6 Survey Question Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Questions within survey sections                                      │
# │ WHY:  Complex questions with validation, logic, and piping                  │
# │ SQL:  CREATE TABLE survey_questions (section_id TEXT, order_index INT, ...) │
# │ FILE: packages/database/src/schema/surveys.ts                               │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, json, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { questionTypeEnum } from "./enums"

export const surveyQuestions = pgTable("survey_questions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  sectionId: text("section_id").notNull().references(() => surveySections.id, { onDelete: "cascade" }),

  orderIndex: integer("order_index").notNull(),

  type: questionTypeEnum("type").notNull(),

  text: varchar("text", { length: 1000 }).notNull(),
  description: varchar("description", { length: 2000 }),

  imageUrl: text("image_url"),

  isRequired: boolean("is_required").default(true).notNull(),

  options: json("options").$type<Array<{ id: string, text: string, value?: number }>>().default([]),

  validation: json("validation").$type<Record<string, unknown>>().default({}),

  displayLogic: json("display_logic").$type<Record<string, unknown>>().default({}),
  skipLogic: json("skip_logic").$type<Record<string, unknown>>().default({}),

  piping: json("piping").$type<Record<string, unknown>>().default({}),

  isAttentionCheck: boolean("is_attention_check").default(false).notNull(),
  expectedAnswer: text("expected_answer"),

  settings: json("settings").$type<Record<string, unknown>>().default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  uniqueIndex("survey_questions_section_order_idx").on(table.sectionId, table.orderIndex),
  index("survey_questions_section_idx").on(table.sectionId)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • displayLogic vs skipLogic                                                 │
// │   └─ displayLogic: Show this question if conditions met                     │
// │   └─ skipLogic: After answering, skip to question X                         │
// │                                                                             │
// │ • piping JSON                                                               │
// │   └─ Insert previous answers into question text                             │
// │   └─ e.g., "You said {q1_answer}. Tell us more about that."                 │
// │                                                                             │
// │ • isAttentionCheck + expectedAnswer                                         │
// │   └─ Quality control questions                                              │
// │   └─ "Please select 'Agree' to continue"                                    │
// │   └─ Failed checks flag response for review                                 │
// └─────────────────────────────────────────────────────────────────────────────┘

export const surveyQuestionsRelations = relations(surveyQuestions, ({ one }) => ({
  section: one(surveySections, {
    fields: [surveyQuestions.sectionId],
    references: [surveySections.id]
  })
}))
```

## 13.4.7 Survey Invitation Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Email/SMS invitations to participate in surveys                       │
# │ WHY:  Enables panel-based surveys with tracking                             │
# │ SQL:  CREATE TABLE survey_invitations (survey_id TEXT, token VARCHAR, ...)  │
# │ FILE: packages/database/src/schema/surveys.ts                               │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, timestamp, integer, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { invitationStatusEnum } from "./enums"

export const surveyInvitations = pgTable("survey_invitations", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  surveyId: text("survey_id").notNull().references(() => surveys.id, { onDelete: "cascade" }),

  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),

  token: varchar("token", { length: 64 }).unique().notNull(),

  status: invitationStatusEnum("status").default("PENDING").notNull(),

  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),

  reminderCount: integer("reminder_count").default(0).notNull(),
  lastReminderAt: timestamp("last_reminder_at"),

  expiresAt: timestamp("expires_at").notNull(),

  metadata: json("metadata").$type<Record<string, unknown>>().default({}),

  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  index("survey_invitations_survey_status_idx").on(table.surveyId, table.status),
  index("survey_invitations_token_idx").on(table.token),
  index("survey_invitations_email_idx").on(table.email)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • token: unique access link for each invitation                             │
// │   └─ URL: /survey/abc123?token=xyz789                                       │
// │   └─ Token links response to invitation for tracking                        │
// │                                                                             │
// │ • metadata JSON                                                             │
// │   └─ Custom data from org's CRM (segment, customer_id, etc.)                │
// │   └─ Enables response segmentation by custom attributes                     │
// └─────────────────────────────────────────────────────────────────────────────┘

export const surveyInvitationsRelations = relations(surveyInvitations, ({ one }) => ({
  survey: one(surveys, {
    fields: [surveyInvitations.surveyId],
    references: [surveys.id]
  })
}))
```

## 13.4.8 Category Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Content categories with hierarchy support                             │
# │ WHY:  Organizes polls/surveys/tests for discovery                           │
# │ SQL:  CREATE TABLE categories (slug VARCHAR(50) UNIQUE, parent_id TEXT, ...)│
# │ FILE: packages/database/src/schema/categories.ts                            │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).unique().notNull(),

  description: varchar("description", { length: 200 }),
  iconName: varchar("icon_name", { length: 50 }),
  color: varchar("color", { length: 7 }),

  parentId: text("parent_id").references(() => categories.id),

  orderIndex: integer("order_index").default(0).notNull(),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("categories_parent_idx").on(table.parentId),
  index("categories_slug_idx").on(table.slug)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • Self-referential parentId                                                 │
// │   └─ Enables category hierarchy (Politics > Elections > 2024)               │
// │   └─ references(() => categories.id) - same table                           │
// │                                                                             │
// │ • color VARCHAR(7)                                                          │
// │   └─ Hex color code: #FF5733                                                │
// │   └─ Used for UI category badges                                            │
// └─────────────────────────────────────────────────────────────────────────────┘

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryHierarchy"
  }),
  children: many(categories, { relationName: "categoryHierarchy" }),
  polls: many(polls),
  surveys: many(surveys),
  tests: many(tests)
}))
```

## 13.4.9 Test Table (Base)

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Base test table for personality tests and quizzes                     │
# │ WHY:  Unified base for both test types with type discriminator              │
# │ SQL:  CREATE TABLE tests (id TEXT PRIMARY KEY, test_category test_category) │
# │ FILE: packages/database/src/schema/tests.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, real, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { contentStatusEnum, contentVisibilityEnum, resultsVisibilityEnum, testCategoryEnum } from "./enums"

export const tests = pgTable("tests", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  creatorId: text("creator_id").notNull().references(() => users.id),
  organizationId: text("organization_id").references(() => organizations.id),

  testCategory: testCategoryEnum("test_category").notNull(),

  title: varchar("title", { length: 200 }).notNull(),
  description: varchar("description", { length: 2000 }),
  slug: varchar("slug", { length: 250 }).unique().notNull(),

  coverImageUrl: text("cover_image_url"),
  thumbnailUrl: text("thumbnail_url"),

  status: contentStatusEnum("status").default("DRAFT").notNull(),
  visibility: contentVisibilityEnum("visibility").default("PUBLIC").notNull(),

  categoryId: text("category_id").references(() => categories.id),
  tags: text("tags").array().default([]),

  estimatedDuration: integer("estimated_duration"),

  resultsVisibility: resultsVisibilityEnum("results_visibility").default("AFTER_PARTICIPATION").notNull(),

  participantCount: integer("participant_count").default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  shareCount: integer("share_count").default(0).notNull(),
  averageRating: real("average_rating"),
  ratingCount: integer("rating_count").default(0).notNull(),

  allowRetake: boolean("allow_retake").default(true).notNull(),
  showCorrectAnswers: boolean("show_correct_answers").default(true).notNull(),

  publishedAt: timestamp("published_at"),
  archivedAt: timestamp("archived_at"),
  deletedAt: timestamp("deleted_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("tests_creator_status_idx").on(table.creatorId, table.status),
  index("tests_category_status_idx").on(table.testCategory, table.status),
  index("tests_visibility_published_idx").on(table.visibility, table.publishedAt),
  index("tests_slug_idx").on(table.slug)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • testCategory enum (PERSONALITY | QUIZ)                                    │
// │   └─ Type discriminator for polymorphic tests                               │
// │   └─ PERSONALITY → Join with personalityTests table                         │
// │   └─ QUIZ → Join with quizTests table                                       │
// │                                                                             │
// │ • Single Table Inheritance pattern                                          │
// │   └─ Base fields in tests table                                             │
// │   └─ Type-specific fields in separate tables                                │
// │   └─ Easier querying than multiple base tables                              │
// └─────────────────────────────────────────────────────────────────────────────┘

export const testsRelations = relations(tests, ({ one, many }) => ({
  creator: one(users, {
    fields: [tests.creatorId],
    references: [users.id]
  }),
  organization: one(organizations, {
    fields: [tests.organizationId],
    references: [organizations.id]
  }),
  category: one(categories, {
    fields: [tests.categoryId],
    references: [categories.id]
  }),
  personalityTest: one(personalityTests),
  quizTest: one(quizTests),
  discussion: one(discussions)
}))
```

## 13.4.10 Personality Test Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Personality test specific data (MBTI, Big5, etc.)                     │
# │ WHY:  Stores axis definitions, character types, or spectrum configs         │
# │ SQL:  CREATE TABLE personality_tests (test_id TEXT UNIQUE REFERENCES tests) │
# │ FILE: packages/database/src/schema/tests.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { personalityTestTypeEnum, personalityQuestionTypeEnum } from "./enums"

export const personalityTests = pgTable("personality_tests", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  testId: text("test_id").unique().notNull().references(() => tests.id, { onDelete: "cascade" }),

  personalityType: personalityTestTypeEnum("personality_type").notNull(),

  questionType: personalityQuestionTypeEnum("question_type").notNull(),

  totalQuestions: integer("total_questions").default(0).notNull(),

  showProgressBar: boolean("show_progress_bar").default(true).notNull(),
  allowSkip: boolean("allow_skip").default(false).notNull(),
  randomizeQuestions: boolean("randomize_questions").default(false).notNull(),

  resultShareText: varchar("result_share_text", { length: 280 }),
  resultImageTemplate: text("result_image_template"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("personality_tests_type_idx").on(table.personalityType)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • personalityType determines scoring algorithm                              │
// │   └─ AXIS: 2-4 bipolar dimensions (e.g., MBTI: I/E, S/N, T/F, J/P)          │
// │   └─ CHARACTER: Match to character archetypes                               │
// │   └─ SPECTRUM: Single dimension with gradient                               │
// │                                                                             │
// │ • testId UNIQUE ensures 1:1 relationship with tests table                   │
// │   └─ Each test has at most one personality_tests row                        │
// └─────────────────────────────────────────────────────────────────────────────┘

export const personalityTestsRelations = relations(personalityTests, ({ one, many }) => ({
  test: one(tests, {
    fields: [personalityTests.testId],
    references: [tests.id]
  }),
  questions: many(personalityTestQuestions),
  axes: many(personalityTestAxes),
  characters: many(personalityTestCharacters),
  spectrumConfig: one(personalityTestSpectrumConfigs),
  resultBadges: many(testResultBadges)
}))
```

## 13.4.11 Quiz Test Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Quiz/trivia test specific data                                        │
# │ WHY:  Stores scoring rules, time limits, pass thresholds                    │
# │ SQL:  CREATE TABLE quiz_tests (test_id TEXT UNIQUE REFERENCES tests, ...)   │
# │ FILE: packages/database/src/schema/tests.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, boolean, timestamp, integer, real, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { quizTypeEnum } from "./enums"

export const quizTests = pgTable("quiz_tests", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  testId: text("test_id").unique().notNull().references(() => tests.id, { onDelete: "cascade" }),

  quizType: quizTypeEnum("quiz_type").notNull(),

  totalQuestions: integer("total_questions").default(0).notNull(),
  totalPoints: integer("total_points").default(0).notNull(),

  passingScore: real("passing_score"),
  timeLimitMinutes: integer("time_limit_minutes"),

  shuffleQuestions: boolean("shuffle_questions").default(false).notNull(),
  shuffleOptions: boolean("shuffle_options").default(false).notNull(),

  showAnswersAfter: boolean("show_answers_after").default(true).notNull(),
  showScoreAfter: boolean("show_score_after").default(true).notNull(),

  maxAttempts: integer("max_attempts"),

  leaderboardEnabled: boolean("leaderboard_enabled").default(false).notNull(),

  certificateEnabled: boolean("certificate_enabled").default(false).notNull(),
  certificateTemplate: text("certificate_template"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("quiz_tests_type_idx").on(table.quizType)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • passingScore as real (float)                                              │
// │   └─ Can be percentage (0.7 = 70%) or points threshold                      │
// │   └─ null means no passing requirement                                      │
// │                                                                             │
// │ • maxAttempts limits retakes                                                │
// │   └─ null = unlimited attempts                                              │
// │   └─ 1 = single attempt only                                                │
// └─────────────────────────────────────────────────────────────────────────────┘

export const quizTestsRelations = relations(quizTests, ({ one, many }) => ({
  test: one(tests, {
    fields: [quizTests.testId],
    references: [tests.id]
  }),
  questions: many(quizTestQuestions)
}))
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.5 RESPONSE MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.5.1 Response Enums

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Response-related enum definitions                                     │
# │ WHY:  Type safety for response statuses and quality flags                   │
# │ SQL:  CREATE TYPE response_status AS ENUM ('STARTED', 'COMPLETED', ...)     │
# │ FILE: packages/database/src/schema/enums.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE ENUMS
// ══════════════════════════════════════════════════════════════════════════════

export const responseStatusEnum = pgEnum("response_status", [
  "STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "ABANDONED",
  "TIMED_OUT",
  "DISCARDED"
])

export const qualityFlagEnum = pgEnum("quality_flag", [
  "SPEEDING",
  "STRAIGHTLINING",
  "GIBBERISH",
  "INCONSISTENT",
  "ATTENTION_CHECK_FAILED",
  "DUPLICATE_SUSPECTED",
  "BOT_SUSPECTED"
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • qualityFlagEnum for survey response quality                               │
// │   └─ SPEEDING: Completed too fast (< 1/3 expected time)                     │
// │   └─ STRAIGHTLINING: Same answer for all matrix questions                   │
// │   └─ GIBBERISH: Random text in open-ended questions                         │
// │   └─ INCONSISTENT: Contradictory answers                                    │
// │   └─ ATTENTION_CHECK_FAILED: Failed trap questions                          │
// └─────────────────────────────────────────────────────────────────────────────┘
```

## 13.5.2 Poll Response Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Individual poll response records                                      │
# │ WHY:  Stores each vote with anonymous participant tracking                  │
# │ SQL:  CREATE TABLE poll_responses (poll_id TEXT, participant_hash TEXT, ...)│
# │ FILE: packages/database/src/schema/responses.ts                             │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, json, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const pollResponses = pgTable("poll_responses", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  pollId: text("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => pollQuestions.id, { onDelete: "cascade" }),

  participantHash: varchar("participant_hash", { length: 64 }).notNull(),

  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),

  selectedOptionIds: text("selected_option_ids").array().notNull(),

  answers: json("answers").$type<Record<string, unknown>>().default({}),

  isValid: boolean("is_valid").default(true).notNull(),
  invalidReason: text("invalid_reason"),

  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  deviceFingerprint: varchar("device_fingerprint", { length: 64 }),

  demographicSnapshot: json("demographic_snapshot").$type<Record<string, unknown>>().default({}),

  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  uniqueIndex("poll_responses_poll_participant_idx").on(table.pollId, table.participantHash),
  index("poll_responses_poll_valid_idx").on(table.pollId, table.isValid),
  index("poll_responses_user_idx").on(table.userId),
  index("poll_responses_question_idx").on(table.questionId)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • participantHash for anonymous deduplication                               │
// │   └─ Hash of (userId || deviceFingerprint + ipAddress)                      │
// │   └─ Cannot reverse to identify user                                        │
// │   └─ uniqueIndex prevents double voting                                     │
// │                                                                             │
// │ • selectedOptionIds as TEXT[]                                               │
// │   └─ Supports single and multiple choice                                    │
// │   └─ Single choice: ["opt_a"]                                               │
// │   └─ Multiple choice: ["opt_a", "opt_c"]                                    │
// │                                                                             │
// │ • demographicSnapshot JSON                                                  │
// │   └─ Snapshot of user demographics at vote time                             │
// │   └─ Allows demographic analysis even if user updates profile               │
// └─────────────────────────────────────────────────────────────────────────────┘

export const pollResponsesRelations = relations(pollResponses, ({ one }) => ({
  poll: one(polls, {
    fields: [pollResponses.pollId],
    references: [polls.id]
  }),
  question: one(pollQuestions, {
    fields: [pollResponses.questionId],
    references: [pollQuestions.id]
  }),
  user: one(users, {
    fields: [pollResponses.userId],
    references: [users.id]
  })
}))
```

## 13.5.3 Survey Response Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Survey response sessions with quality scoring                         │
# │ WHY:  Tracks completion progress, duration, and response quality            │
# │ SQL:  CREATE TABLE survey_responses (survey_id TEXT, status response_status)│
# │ FILE: packages/database/src/schema/responses.ts                             │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, real, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { responseStatusEnum, qualityFlagEnum } from "./enums"

export const surveyResponses = pgTable("survey_responses", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  surveyId: text("survey_id").notNull().references(() => surveys.id, { onDelete: "cascade" }),

  participantHash: varchar("participant_hash", { length: 64 }).notNull(),

  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  invitationId: text("invitation_id").references(() => surveyInvitations.id, { onDelete: "set null" }),

  status: responseStatusEnum("status").default("STARTED").notNull(),

  answers: json("answers").$type<Record<string, unknown>>().default({}),

  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),

  durationSeconds: integer("duration_seconds"),

  progressPercent: real("progress_percent").default(0).notNull(),
  lastQuestionId: text("last_question_id"),

  qualityScore: real("quality_score"),
  qualityFlags: qualityFlagEnum("quality_flags").array().default([]),

  isValid: boolean("is_valid").default(true).notNull(),
  invalidReason: text("invalid_reason"),

  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  deviceFingerprint: varchar("device_fingerprint", { length: 64 }),

  demographicSnapshot: json("demographic_snapshot").$type<Record<string, unknown>>().default({}),

  metadata: json("metadata").$type<Record<string, unknown>>().default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("survey_responses_survey_status_idx").on(table.surveyId, table.status),
  index("survey_responses_survey_valid_idx").on(table.surveyId, table.isValid),
  index("survey_responses_user_idx").on(table.userId),
  index("survey_responses_quality_idx").on(table.qualityScore)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • qualityFlags as ENUM[]                                                    │
// │   └─ PostgreSQL array of enum values                                        │
// │   └─ Multiple flags can apply: ["SPEEDING", "STRAIGHTLINING"]               │
// │                                                                             │
// │ • qualityScore (0-100)                                                      │
// │   └─ Calculated from multiple factors                                       │
// │   └─ Duration, attention checks, consistency, etc.                          │
// │   └─ Responses below threshold flagged for review                           │
// │                                                                             │
// │ • progressPercent tracks partial completion                                 │
// │   └─ Enables "continue where you left off"                                  │
// │   └─ lastQuestionId stores resume point                                     │
// └─────────────────────────────────────────────────────────────────────────────┘

export const surveyResponsesRelations = relations(surveyResponses, ({ one }) => ({
  survey: one(surveys, {
    fields: [surveyResponses.surveyId],
    references: [surveys.id]
  }),
  user: one(users, {
    fields: [surveyResponses.userId],
    references: [users.id]
  }),
  invitation: one(surveyInvitations, {
    fields: [surveyResponses.invitationId],
    references: [surveyInvitations.id]
  })
}))
```

## 13.5.4 Personality Test Result Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Personality test results with axis scores or character matches        │
# │ WHY:  Stores calculated personality profile from test responses             │
# │ SQL:  CREATE TABLE personality_test_results (test_id TEXT, user_id TEXT)    │
# │ FILE: packages/database/src/schema/responses.ts                             │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, real, json, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const personalityTestResults = pgTable("personality_test_results", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  testId: text("test_id").notNull().references(() => personalityTests.id, { onDelete: "cascade" }),

  participantHash: varchar("participant_hash", { length: 64 }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),

  axisScores: json("axis_scores").$type<Record<string, number>>().default({}),

  resultCategoryId: text("result_category_id"),
  matchPercentage: real("match_percentage"),

  spectrumScore: real("spectrum_score"),

  rawAnswers: json("raw_answers").$type<Record<string, unknown>>().default({}),

  durationSeconds: integer("duration_seconds"),

  isValid: boolean("is_valid").default(true).notNull(),

  completedAt: timestamp("completed_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  index("personality_results_test_idx").on(table.testId),
  index("personality_results_user_idx").on(table.userId),
  uniqueIndex("personality_results_test_participant_idx").on(table.testId, table.participantHash)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • axisScores JSON for AXIS type tests                                       │
// │   └─ e.g., { "I_E": 0.7, "S_N": 0.3, "T_F": 0.6, "J_P": 0.8 }               │
// │   └─ Values 0-1 representing position on axis                               │
// │                                                                             │
// │ • resultCategoryId + matchPercentage for CHARACTER type                     │
// │   └─ Links to character definition table                                    │
// │   └─ matchPercentage shows how strong the match is                          │
// │                                                                             │
// │ • spectrumScore for SPECTRUM type                                           │
// │   └─ Single value on a continuum (e.g., 0-100)                              │
// └─────────────────────────────────────────────────────────────────────────────┘

export const personalityTestResultsRelations = relations(personalityTestResults, ({ one }) => ({
  test: one(personalityTests, {
    fields: [personalityTestResults.testId],
    references: [personalityTests.id]
  }),
  user: one(users, {
    fields: [personalityTestResults.userId],
    references: [users.id]
  })
}))
```

## 13.5.5 Quiz Attempt Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Quiz attempt records with scoring                                     │
# │ WHY:  Tracks each quiz attempt with score and time                          │
# │ SQL:  CREATE TABLE quiz_attempts (test_id TEXT, score REAL, ...)            │
# │ FILE: packages/database/src/schema/responses.ts                             │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, real, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { attemptStatusEnum } from "./enums"

export const quizAttempts = pgTable("quiz_attempts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  testId: text("test_id").notNull().references(() => quizTests.id, { onDelete: "cascade" }),

  participantHash: varchar("participant_hash", { length: 64 }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),

  attemptNumber: integer("attempt_number").default(1).notNull(),

  status: attemptStatusEnum("status").default("IN_PROGRESS").notNull(),

  score: real("score"),
  maxScore: real("max_score"),
  scorePercent: real("score_percent"),

  correctCount: integer("correct_count"),
  incorrectCount: integer("incorrect_count"),
  skippedCount: integer("skipped_count"),

  answers: json("answers").$type<Record<string, unknown>>().default({}),

  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  durationSeconds: integer("duration_seconds"),

  passed: boolean("passed"),

  certificateUrl: text("certificate_url"),
  certificateIssuedAt: timestamp("certificate_issued_at"),

  isValid: boolean("is_valid").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  index("quiz_attempts_test_status_idx").on(table.testId, table.status),
  index("quiz_attempts_user_idx").on(table.userId),
  index("quiz_attempts_score_idx").on(table.testId, table.scorePercent)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • attemptNumber tracks retakes                                              │
// │   └─ First attempt = 1, second = 2, etc.                                    │
// │   └─ Used with maxAttempts to enforce limits                                │
// │                                                                             │
// │ • score vs scorePercent                                                     │
// │   └─ score: Raw points earned (e.g., 85)                                    │
// │   └─ maxScore: Maximum possible (e.g., 100)                                 │
// │   └─ scorePercent: Calculated (e.g., 0.85)                                  │
// │                                                                             │
// │ • passed boolean                                                            │
// │   └─ Calculated from scorePercent >= passingScore                           │
// │   └─ null if quiz has no passing threshold                                  │
// └─────────────────────────────────────────────────────────────────────────────┘

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  test: one(quizTests, {
    fields: [quizAttempts.testId],
    references: [quizTests.id]
  }),
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id]
  })
}))
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.6 GAMIFICATION MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.6.1 Gamification Enums

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

export const badgeCategoryEnum = pgEnum("badge_category", [
  "PARTICIPATION",
  "CREATION",
  "STREAK",
  "SOCIAL",
  "QUALITY",
  "ACHIEVEMENT",
  "SPECIAL"
])

export const badgeRarityEnum = pgEnum("badge_rarity", [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY"
])
```

## 13.6.2 User Gamification Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: User gamification stats (XP, level, streaks)                          │
# │ WHY:  Tracks progression and engagement metrics                             │
# │ SQL:  CREATE TABLE user_gamification (user_id TEXT UNIQUE, xp INT, ...)     │
# │ FILE: packages/database/src/schema/gamification.ts                          │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const userGamification = pgTable("user_gamification", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").unique().notNull().references(() => users.id, { onDelete: "cascade" }),

  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),

  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActivityDate: timestamp("last_activity_date"),

  totalPolls: integer("total_polls").default(0).notNull(),
  totalSurveys: integer("total_surveys").default(0).notNull(),
  totalTests: integer("total_tests").default(0).notNull(),
  totalVotes: integer("total_votes").default(0).notNull(),
  totalComments: integer("total_comments").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("user_gamification_xp_idx").on(table.xp),
  index("user_gamification_level_idx").on(table.level),
  index("user_gamification_streak_idx").on(table.currentStreak)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • Denormalized counters for performance                                     │
// │   └─ Avoids COUNT(*) on large tables for profile display                    │
// │   └─ Updated via triggers or application events                             │
// │                                                                             │
// │ • Streak tracking                                                           │
// │   └─ currentStreak: Consecutive days active                                 │
// │   └─ longestStreak: All-time record                                         │
// │   └─ lastActivityDate: For streak calculation                               │
// └─────────────────────────────────────────────────────────────────────────────┘

export const userGamificationRelations = relations(userGamification, ({ one }) => ({
  user: one(users, {
    fields: [userGamification.userId],
    references: [users.id]
  })
}))
```

## 13.6.3 Badge Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Badge definitions                                                     │
# │ WHY:  Defines available badges and their criteria                           │
# │ SQL:  CREATE TABLE badges (code VARCHAR(50) UNIQUE, name VARCHAR(100), ...) │
# │ FILE: packages/database/src/schema/gamification.ts                          │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, timestamp, integer, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { badgeCategoryEnum, badgeRarityEnum } from "./enums"

export const badges = pgTable("badges", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  code: varchar("code", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),

  category: badgeCategoryEnum("category").notNull(),
  rarity: badgeRarityEnum("rarity").notNull(),

  iconUrl: text("icon_url"),

  xpReward: integer("xp_reward").default(0).notNull(),

  criteria: json("criteria").$type<Record<string, unknown>>().default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("badges_category_idx").on(table.category),
  index("badges_rarity_idx").on(table.rarity)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • criteria JSON stores unlock conditions                                    │
// │   └─ e.g., { "type": "votes", "threshold": 100 }                            │
// │   └─ Flexible for different badge types                                     │
// └─────────────────────────────────────────────────────────────────────────────┘

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges)
}))
```

## 13.6.4 User Badge Table (Junction)

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Badges earned by users                                                │
# │ WHY:  Many-to-many relationship between users and badges                    │
# │ SQL:  CREATE TABLE user_badges (user_id TEXT, badge_id TEXT, earned_at)     │
# │ FILE: packages/database/src/schema/gamification.ts                          │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const userBadges = pgTable("user_badges", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: text("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),

  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  displayedOnProfile: text("displayed_on_profile").default("false").notNull()
}, (table) => [
  uniqueIndex("user_badges_user_badge_idx").on(table.userId, table.badgeId),
  index("user_badges_user_idx").on(table.userId),
  index("user_badges_earned_idx").on(table.earnedAt)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • uniqueIndex prevents duplicate badge awards                               │
// │   └─ User can only earn each badge once                                     │
// │                                                                             │
// │ • displayedOnProfile for profile showcase                                   │
// │   └─ Users can choose which badges to display                               │
// └─────────────────────────────────────────────────────────────────────────────┘

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id]
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id]
  })
}))
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.7 SOCIAL & DISCUSSION MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.7.1 Discussion & Comment Enums

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

export const discussionStatusEnum = pgEnum("discussion_status", [
  "CLOSED",
  "OPEN",
  "LOCKED",
  "ARCHIVED"
])

export const commentStatusEnum = pgEnum("comment_status", [
  "VISIBLE",
  "HIDDEN",
  "DELETED",
  "FLAGGED",
  "PENDING_REVIEW"
])

export const followStatusEnum = pgEnum("follow_status", [
  "PENDING",
  "ACTIVE",
  "REJECTED"
])
```

## 13.7.2 Discussion Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Discussion threads attached to polls/surveys/tests                    │
# │ WHY:  Enables community discussion about content                            │
# │ SQL:  CREATE TABLE discussions (content_type VARCHAR, content_id TEXT, ...) │
# │ FILE: packages/database/src/schema/social.ts                                │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { discussionStatusEnum } from "./enums"

export const discussions = pgTable("discussions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  contentType: varchar("content_type", { length: 20 }).notNull(),
  contentId: text("content_id").notNull(),

  status: discussionStatusEnum("status").default("OPEN").notNull(),

  totalComments: integer("total_comments").default(0).notNull(),
  totalParticipants: integer("total_participants").default(0).notNull(),

  lastCommentAt: timestamp("last_comment_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  uniqueIndex("discussions_content_idx").on(table.contentType, table.contentId),
  index("discussions_status_last_comment_idx").on(table.status, table.lastCommentAt)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • Polymorphic association via contentType + contentId                       │
// │   └─ contentType: "POLL", "SURVEY", "TEST"                                  │
// │   └─ contentId: ID of the related content                                   │
// │   └─ Allows one discussion model for all content types                      │
// └─────────────────────────────────────────────────────────────────────────────┘

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  poll: one(polls, {
    fields: [discussions.contentId],
    references: [polls.id]
  }),
  comments: many(comments),
  voiceAccessRequests: many(voiceAccessRequests)
}))
```

## 13.7.3 Comment Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Comments with threading and Wilson score ranking                      │
# │ WHY:  Reddit-style nested comments with quality-based sorting               │
# │ SQL:  CREATE TABLE comments (discussion_id TEXT, parent_id TEXT, depth INT) │
# │ FILE: packages/database/src/schema/social.ts                                │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, timestamp, integer, real, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { commentStatusEnum } from "./enums"

export const comments = pgTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  discussionId: text("discussion_id").notNull().references(() => discussions.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id),

  parentId: text("parent_id").references(() => comments.id, { onDelete: "cascade" }),
  rootId: text("root_id"),
  depth: integer("depth").default(0).notNull(),

  content: text("content").notNull(),

  status: commentStatusEnum("status").default("VISIBLE").notNull(),

  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  wilsonScore: real("wilson_score").default(0).notNull(),
  replyCount: integer("reply_count").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at")
}, (table) => [
  index("comments_discussion_wilson_idx").on(table.discussionId, table.status, table.wilsonScore),
  index("comments_discussion_created_idx").on(table.discussionId, table.status, table.createdAt),
  index("comments_author_idx").on(table.authorId),
  index("comments_parent_idx").on(table.parentId),
  index("comments_root_idx").on(table.rootId)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • wilsonScore for ranking                                                   │
// │   └─ Wilson score interval accounts for vote uncertainty                    │
// │   └─ 5 upvotes / 0 downvotes ranks lower than 100/10                        │
// │   └─ Formula: (p + z²/2n - z√(p(1-p)/n + z²/4n²)) / (1 + z²/n)              │
// │                                                                             │
// │ • depth field for limiting nesting                                          │
// │   └─ Maximum depth = 3 (enforced by constraint)                             │
// │   └─ Prevents infinitely nested threads                                     │
// │                                                                             │
// │ • rootId for efficient thread queries                                       │
// │   └─ All replies in a thread share the same rootId                          │
// │   └─ Easy to fetch entire thread                                            │
// └─────────────────────────────────────────────────────────────────────────────┘

export const commentsRelations = relations(comments, ({ one, many }) => ({
  discussion: one(discussions, {
    fields: [comments.discussionId],
    references: [discussions.id]
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id]
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "commentReplies"
  }),
  replies: many(comments, { relationName: "commentReplies" }),
  votes: many(commentVotes)
}))
```

## 13.7.4 Comment Vote Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Upvotes/downvotes on comments                                         │
# │ WHY:  Tracks who voted on what for deduplication                            │
# │ SQL:  CREATE TABLE comment_votes (comment_id TEXT, user_id TEXT, value INT) │
# │ FILE: packages/database/src/schema/social.ts                                │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const commentVotes = pgTable("comment_votes", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  commentId: text("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  value: integer("value").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  uniqueIndex("comment_votes_comment_user_idx").on(table.commentId, table.userId),
  index("comment_votes_user_idx").on(table.userId)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • value: 1 (upvote) or -1 (downvote)                                        │
// │   └─ Constraint: CHECK (value IN (-1, 1))                                   │
// │   └─ Changing vote: UPDATE value, not INSERT                                │
// │                                                                             │
// │ • uniqueIndex prevents multiple votes per user                              │
// │   └─ One vote per user per comment                                          │
// └─────────────────────────────────────────────────────────────────────────────┘

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentVotes.commentId],
    references: [comments.id]
  }),
  user: one(users, {
    fields: [commentVotes.userId],
    references: [users.id]
  })
}))
```

## 13.7.5 Follow Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: User follow relationships                                             │
# │ WHY:  Social graph for following feed                                       │
# │ SQL:  CREATE TABLE follows (follower_id TEXT, following_id TEXT, ...)       │
# │ FILE: packages/database/src/schema/social.ts                                │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { followStatusEnum } from "./enums"

export const follows = pgTable("follows", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  followerId: text("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: text("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  status: followStatusEnum("status").default("ACTIVE").notNull(),

  requestedAt: timestamp("requested_at"),
  acceptedAt: timestamp("accepted_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  uniqueIndex("follows_follower_following_idx").on(table.followerId, table.followingId),
  index("follows_following_status_idx").on(table.followingId, table.status),
  index("follows_follower_status_idx").on(table.followerId, table.status)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • Self-referential user relationship                                        │
// │   └─ follower follows following                                             │
// │   └─ Both reference users table                                             │
// │                                                                             │
// │ • status for follow requests                                                │
// │   └─ PENDING: Awaiting approval (private accounts)                          │
// │   └─ ACTIVE: Following confirmed                                            │
// │   └─ REJECTED: Request denied                                               │
// └─────────────────────────────────────────────────────────────────────────────┘

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower"
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following"
  })
}))
```

## 13.7.6 Block Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: User block relationships                                              │
# │ WHY:  Prevents interaction from blocked users                               │
# │ SQL:  CREATE TABLE blocks (blocker_id TEXT, blocked_id TEXT, ...)           │
# │ FILE: packages/database/src/schema/social.ts                                │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const blocks = pgTable("blocks", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  blockerId: text("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedId: text("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  reason: varchar("reason", { length: 500 }),

  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  uniqueIndex("blocks_blocker_blocked_idx").on(table.blockerId, table.blockedId),
  index("blocks_blocked_idx").on(table.blockedId)
])

export const blocksRelations = relations(blocks, ({ one }) => ({
  blocker: one(users, {
    fields: [blocks.blockerId],
    references: [users.id],
    relationName: "blocker"
  }),
  blocked: one(users, {
    fields: [blocks.blockedId],
    references: [users.id],
    relationName: "blocked"
  })
}))
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.8 TRUST & FRAUD DETECTION MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.8.1 Trust/Fraud Enums

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

export const ipTypeEnum = pgEnum("ip_type", [
  "RESIDENTIAL",
  "MOBILE",
  "CORPORATE",
  "DATACENTER",
  "EDUCATION",
  "UNKNOWN"
])

export const fraudEntityTypeEnum = pgEnum("fraud_entity_type", [
  "USER_REGISTRATION",
  "SESSION",
  "POLL_RESPONSE",
  "SURVEY_RESPONSE",
  "COMMENT"
])

export const fraudDecisionEnum = pgEnum("fraud_decision", [
  "ACCEPT",
  "REVIEW",
  "SOFT_REJECT",
  "HARD_REJECT"
])
```

## 13.8.2 User Trust Score Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Calculated trust score for each user                                  │
# │ WHY:  Response quality weighting and fraud prevention                       │
# │ SQL:  CREATE TABLE user_trust_scores (user_id TEXT UNIQUE, overall_score)   │
# │ FILE: packages/database/src/schema/trust.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, timestamp, integer, real, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const userTrustScores = pgTable("user_trust_scores", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").unique().notNull().references(() => users.id, { onDelete: "cascade" }),

  overallScore: real("overall_score").default(50).notNull(),

  accountAge: real("account_age").default(0).notNull(),
  verificationLevel: real("verification_level").default(0).notNull(),
  activityConsistency: real("activity_consistency").default(0).notNull(),
  responseQuality: real("response_quality").default(0).notNull(),
  socialTrust: real("social_trust").default(0).notNull(),

  reportCount: integer("report_count").default(0).notNull(),
  warningCount: integer("warning_count").default(0).notNull(),
  suspensionCount: integer("suspension_count").default(0).notNull(),

  fraudFlags: text("fraud_flags").array().default([]),

  lastCalculatedAt: timestamp("last_calculated_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("user_trust_scores_overall_idx").on(table.overallScore)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • Component scores (accountAge, verificationLevel, etc.)                    │
// │   └─ Each factor 0-100, weighted to calculate overallScore                  │
// │   └─ Allows transparent trust calculation                                   │
// │                                                                             │
// │ • fraudFlags as TEXT[]                                                      │
// │   └─ List of suspicious behaviors detected                                  │
// │   └─ e.g., ["IP_CHANGE", "DEVICE_FARM", "SPEEDING"]                         │
// └─────────────────────────────────────────────────────────────────────────────┘

export const userTrustScoresRelations = relations(userTrustScores, ({ one }) => ({
  user: one(users, {
    fields: [userTrustScores.userId],
    references: [users.id]
  })
}))
```

## 13.8.3 IP Reputation Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: IP address reputation tracking                                        │
# │ WHY:  Identify VPNs, data centers, and suspicious IPs                       │
# │ SQL:  CREATE TABLE ip_reputations (ip_address VARCHAR(45) UNIQUE, ...)      │
# │ FILE: packages/database/src/schema/trust.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, real, index } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { ipTypeEnum } from "./enums"

export const ipReputations = pgTable("ip_reputations", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  ipAddress: varchar("ip_address", { length: 45 }).unique().notNull(),

  type: ipTypeEnum("type").default("UNKNOWN").notNull(),

  isProxy: boolean("is_proxy").default(false).notNull(),
  isVpn: boolean("is_vpn").default(false).notNull(),
  isTor: boolean("is_tor").default(false).notNull(),
  isDatacenter: boolean("is_datacenter").default(false).notNull(),

  country: varchar("country", { length: 2 }),
  region: varchar("region", { length: 100 }),
  city: varchar("city", { length: 100 }),
  isp: varchar("isp", { length: 100 }),
  asn: varchar("asn", { length: 20 }),

  reputationScore: real("reputation_score").default(50).notNull(),

  associatedUserCount: integer("associated_user_count").default(0).notNull(),
  suspiciousActivityCount: integer("suspicious_activity_count").default(0).notNull(),

  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  lastCheckedAt: timestamp("last_checked_at").defaultNow().notNull(),

  isBlocked: boolean("is_blocked").default(false).notNull(),
  blockedAt: timestamp("blocked_at"),
  blockReason: text("block_reason")
}, (table) => [
  index("ip_reputations_score_idx").on(table.reputationScore),
  index("ip_reputations_country_idx").on(table.country),
  index("ip_reputations_blocked_idx").on(table.isBlocked)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • VPN/Proxy/Tor detection flags                                             │
// │   └─ Populated from IP intelligence APIs (MaxMind, IPHub, etc.)             │
// │   └─ Used to weight response reliability                                    │
// │                                                                             │
// │ • associatedUserCount                                                       │
// │   └─ Many users from same IP = potential fraud farm                         │
// │   └─ Threshold triggers review                                              │
// └─────────────────────────────────────────────────────────────────────────────┘
```

## 13.8.4 Fraud Score Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Fraud scoring for specific actions                                    │
# │ WHY:  Real-time fraud detection with signals breakdown                      │
# │ SQL:  CREATE TABLE fraud_scores (entity_type fraud_entity_type, score REAL) │
# │ FILE: packages/database/src/schema/trust.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, timestamp, real, json, index } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { fraudEntityTypeEnum, fraudDecisionEnum } from "./enums"

export const fraudScores = pgTable("fraud_scores", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  entityType: fraudEntityTypeEnum("entity_type").notNull(),
  entityId: text("entity_id").notNull(),

  score: real("score").notNull(),
  decision: fraudDecisionEnum("decision").notNull(),

  signals: json("signals").$type<Record<string, unknown>>().default({}),
  weights: json("weights").$type<Record<string, unknown>>().default({}),

  deviceScore: real("device_score"),
  behaviorScore: real("behavior_score"),
  responseScore: real("response_score"),
  networkScore: real("network_score"),

  riskFactors: text("risk_factors").array().default([]),

  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes"),

  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  index("fraud_scores_entity_idx").on(table.entityType, table.entityId),
  index("fraud_scores_decision_created_idx").on(table.decision, table.createdAt),
  index("fraud_scores_score_idx").on(table.score)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • signals JSON stores all fraud detection signals                           │
// │   └─ e.g., { "ip_vpn": true, "mouse_straight": false, "typing_bot": 0.2 }   │
// │   └─ weights JSON stores how each signal was weighted                       │
// │                                                                             │
// │ • Component scores for transparency                                         │
// │   └─ deviceScore: Device fingerprint analysis                               │
// │   └─ behaviorScore: Mouse/typing pattern analysis                           │
// │   └─ responseScore: Answer quality analysis                                 │
// │   └─ networkScore: IP/geolocation analysis                                  │
// └─────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.9 NOTIFICATION MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.9.1 Notification Enums

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

export const notificationTypeEnum = pgEnum("notification_type", [
  "POLL_PUBLISHED",
  "POLL_ENDING_SOON",
  "POLL_ENDED",
  "POLL_RESULTS_AVAILABLE",
  "SURVEY_INVITATION",
  "SURVEY_REMINDER",
  "SURVEY_ENDED",
  "TEST_RESULTS_AVAILABLE",
  "NEW_FOLLOWER",
  "FOLLOW_REQUEST",
  "FOLLOW_REQUEST_ACCEPTED",
  "COMMENT_ON_YOUR_CONTENT",
  "REPLY_TO_YOUR_COMMENT",
  "MENTION_IN_COMMENT",
  "COMMENT_UPVOTED",
  "CONTENT_SHARED",
  "ACCESS_REQUEST_RECEIVED",
  "ACCESS_REQUEST_APPROVED",
  "ACCESS_REQUEST_DENIED",
  "ACCOUNT_VERIFIED",
  "BADGE_EARNED",
  "LEVEL_UP",
  "STREAK_MILESTONE",
  "SYSTEM_ANNOUNCEMENT",
  "SECURITY_ALERT",
  "PASSWORD_CHANGED",
  "NEW_DEVICE_LOGIN",
  "ACCOUNT_WARNING",
  "ORG_INVITATION",
  "ORG_ROLE_CHANGED",
  "ORG_CONTENT_PUBLISHED",
  "ORG_MEMBER_JOINED",
  "ORG_SURVEY_RESPONSE_MILESTONE",
  "CONTENT_REMOVED",
  "CONTENT_RESTORED",
  "COMMENT_REMOVED",
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_UNSUSPENDED",
  "REPORT_RESOLVED"
])

export const notificationCategoryEnum = pgEnum("notification_category", [
  "CONTENT",
  "SOCIAL",
  "SYSTEM",
  "ORGANIZATION",
  "MODERATION"
])

export const notificationPriorityEnum = pgEnum("notification_priority", [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT"
])

export const notificationStatusEnum = pgEnum("notification_status", [
  "UNREAD",
  "READ",
  "ARCHIVED",
  "DELETED"
])

export const pushPlatformEnum = pgEnum("push_platform", [
  "FCM",
  "APNS",
  "WEB_PUSH"
])

export const digestFrequencyEnum = pgEnum("digest_frequency", [
  "DAILY",
  "WEEKLY"
])
```

## 13.9.2 Notification Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: User notifications with aggregation support                           │
# │ WHY:  In-app and push notification tracking                                 │
# │ SQL:  CREATE TABLE notifications (user_id TEXT, type notification_type, ...) │
# │ FILE: packages/database/src/schema/notifications.ts                         │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, timestamp, integer, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { notificationTypeEnum, notificationCategoryEnum, notificationPriorityEnum, notificationStatusEnum } from "./enums"

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  type: notificationTypeEnum("type").notNull(),
  category: notificationCategoryEnum("category").notNull(),
  priority: notificationPriorityEnum("priority").notNull(),

  title: varchar("title", { length: 100 }).notNull(),
  body: varchar("body", { length: 500 }).notNull(),

  actorId: text("actor_id"),
  actorName: text("actor_name"),
  actorAvatarUrl: text("actor_avatar_url"),

  resourceId: text("resource_id"),
  resourceType: text("resource_type"),
  resourceTitle: text("resource_title"),

  actionUrl: text("action_url"),
  actionLabel: text("action_label"),
  imageUrl: text("image_url"),

  aggregatedCount: integer("aggregated_count").default(1).notNull(),

  metadata: json("metadata").$type<Record<string, unknown>>().default({}),

  status: notificationStatusEnum("status").default("UNREAD").notNull(),
  readAt: timestamp("read_at"),
  archivedAt: timestamp("archived_at"),
  deletedAt: timestamp("deleted_at"),

  expiresAt: timestamp("expires_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("notifications_user_status_created_idx").on(table.userId, table.status, table.createdAt),
  index("notifications_user_category_status_idx").on(table.userId, table.category, table.status),
  index("notifications_expires_idx").on(table.expiresAt)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • aggregatedCount for notification batching                                 │
// │   └─ "3 people liked your poll" instead of 3 separate notifications         │
// │   └─ Reduces notification fatigue                                           │
// │                                                                             │
// │ • actor fields for display without joins                                    │
// │   └─ Denormalized for fast notification list rendering                      │
// │   └─ actorName/actorAvatarUrl snapshot at notification time                 │
// └─────────────────────────────────────────────────────────────────────────────┘

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}))
```

## 13.9.3 Notification Preferences Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: User notification preferences and quiet hours                         │
# │ WHY:  Customizable notification settings per user                           │
# │ SQL:  CREATE TABLE notification_preferences (user_id TEXT UNIQUE, ...)      │
# │ FILE: packages/database/src/schema/notifications.ts                         │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, json } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { digestFrequencyEnum } from "./enums"

export const notificationPreferences = pgTable("notification_preferences", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").unique().notNull().references(() => users.id, { onDelete: "cascade" }),

  globalEnabled: boolean("global_enabled").default(true).notNull(),

  quietHoursEnabled: boolean("quiet_hours_enabled").default(false).notNull(),
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }).default("22:00").notNull(),
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }).default("08:00").notNull(),
  quietHoursTimezone: varchar("quiet_hours_timezone", { length: 50 }).default("Europe/Istanbul").notNull(),
  quietHoursAllowUrgent: boolean("quiet_hours_allow_urgent").default(true).notNull(),

  categoryPreferences: json("category_preferences").$type<Record<string, unknown>>().default({}),
  typeOverrides: json("type_overrides").$type<Record<string, unknown>>().default({}),

  emailDigestEnabled: boolean("email_digest_enabled").default(false).notNull(),
  emailDigestFrequency: digestFrequencyEnum("email_digest_frequency").default("DAILY").notNull(),
  emailDigestDay: integer("email_digest_day").default(1).notNull(),
  emailDigestTime: varchar("email_digest_time", { length: 5 }).default("09:00").notNull(),

  mutedUserIds: text("muted_user_ids").array().default([]),
  mutedOrgIds: text("muted_org_ids").array().default([]),
  mutedContentIds: text("muted_content_ids").array().default([]),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
})

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id]
  })
}))
```

## 13.9.4 Push Token Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Push notification tokens for mobile/web                               │
# │ WHY:  Enables push notifications across devices                             │
# │ SQL:  CREATE TABLE push_tokens (user_id TEXT, platform push_platform, ...)  │
# │ FILE: packages/database/src/schema/notifications.ts                         │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { pushPlatformEnum } from "./enums"

export const pushTokens = pgTable("push_tokens", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  platform: pushPlatformEnum("platform").notNull(),
  token: varchar("token", { length: 4096 }).notNull(),
  deviceId: text("device_id").notNull(),
  deviceName: varchar("device_name", { length: 100 }),
  deviceModel: varchar("device_model", { length: 100 }),
  osVersion: varchar("os_version", { length: 50 }),
  appVersion: varchar("app_version", { length: 50 }),

  isActive: boolean("is_active").default(true).notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),

  failureCount: integer("failure_count").default(0).notNull(),
  lastFailureAt: timestamp("last_failure_at"),
  lastFailureReason: text("last_failure_reason"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  uniqueIndex("push_tokens_user_device_platform_idx").on(table.userId, table.deviceId, table.platform),
  index("push_tokens_user_active_idx").on(table.userId, table.isActive),
  index("push_tokens_token_idx").on(table.token)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • token VARCHAR(4096)                                                       │
// │   └─ FCM/APNS tokens can be very long                                       │
// │   └─ 4096 accommodates all platforms                                        │
// │                                                                             │
// │ • failureCount for token cleanup                                            │
// │   └─ Tokens disabled after repeated failures                                │
// │   └─ Prevents wasted push attempts                                          │
// └─────────────────────────────────────────────────────────────────────────────┘

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(users, {
    fields: [pushTokens.userId],
    references: [users.id]
  })
}))
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.10 FEED & DISCOVERY MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.10.1 Feed/Discovery Enums

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

export const contentViewTypeEnum = pgEnum("content_view_type", [
  "POLL",
  "SURVEY",
  "TEST",
  "USER_PROFILE",
  "DISCUSSION"
])

export const viewSourceEnum = pgEnum("view_source", [
  "HOME_FEED",
  "EXPLORE_FEED",
  "FOLLOWING_FEED",
  "CATEGORY_FEED",
  "SEARCH",
  "DIRECT_LINK",
  "NOTIFICATION",
  "SHARE"
])
```

## 13.10.2 User Interest Profile Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Calculated user interest profile for personalization                  │
# │ WHY:  Feed personalization based on behavior analysis                       │
# │ SQL:  CREATE TABLE user_interest_profiles (user_id TEXT UNIQUE, ...)        │
# │ FILE: packages/database/src/schema/feed.ts                                  │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, timestamp, real, json, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const userInterestProfiles = pgTable("user_interest_profiles", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").unique().notNull().references(() => users.id, { onDelete: "cascade" }),

  categoryScores: json("category_scores").$type<Record<string, number>>().default({}),
  tagScores: json("tag_scores").$type<Record<string, number>>().default({}),
  creatorScores: json("creator_scores").$type<Record<string, number>>().default({}),

  preferredContentTypes: json("preferred_content_types").$type<string[]>().default([]),

  avgSessionDuration: real("avg_session_duration"),
  avgContentPerSession: real("avg_content_per_session"),
  peakActivityHours: integer("peak_activity_hours").array().default([]),

  lastCalculatedAt: timestamp("last_calculated_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
})

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • categoryScores JSON                                                       │
// │   └─ e.g., { "politics": 0.8, "sports": 0.3, "tech": 0.6 }                  │
// │   └─ Calculated from engagement history                                     │
// │                                                                             │
// │ • peakActivityHours as INT[]                                                │
// │   └─ e.g., [9, 12, 18, 21] - most active hours                              │
// │   └─ Used for optimal notification timing                                   │
// └─────────────────────────────────────────────────────────────────────────────┘

export const userInterestProfilesRelations = relations(userInterestProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userInterestProfiles.userId],
    references: [users.id]
  })
}))
```

## 13.10.3 Content View Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Content view tracking for analytics                                   │
# │ WHY:  Tracks impressions and engagement for feed algorithm                  │
# │ SQL:  CREATE TABLE content_views (content_type, content_id, viewed_at, ...) │
# │ FILE: packages/database/src/schema/feed.ts                                  │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, boolean, timestamp, integer, index } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { contentViewTypeEnum, viewSourceEnum } from "./enums"

export const contentViews = pgTable("content_views", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  userId: text("user_id"),
  sessionId: text("session_id"),

  contentType: contentViewTypeEnum("content_type").notNull(),
  contentId: text("content_id").notNull(),

  source: viewSourceEnum("source").notNull(),

  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  dwellTimeMs: integer("dwell_time_ms"),

  interacted: boolean("interacted").default(false).notNull(),
  interactionType: text("interaction_type")
}, (table) => [
  index("content_views_content_viewed_idx").on(table.contentType, table.contentId, table.viewedAt),
  index("content_views_user_viewed_idx").on(table.userId, table.viewedAt),
  index("content_views_session_idx").on(table.sessionId)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • dwellTimeMs for engagement quality                                        │
// │   └─ Longer dwell time = more engaging content                              │
// │   └─ Used for content recommendation                                        │
// │                                                                             │
// │ • interacted + interactionType                                              │
// │   └─ Did user vote/comment/share after viewing?                             │
// │   └─ Higher interaction = better content quality signal                     │
// └─────────────────────────────────────────────────────────────────────────────┘
```

## 13.10.4 Trending Content Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Pre-calculated trending content scores                                │
# │ WHY:  Fast trending page without real-time aggregation                      │
# │ SQL:  CREATE TABLE trending_content (content_type, trending_score, ...)     │
# │ FILE: packages/database/src/schema/feed.ts                                  │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, timestamp, integer, real, index, uniqueIndex } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { contentViewTypeEnum } from "./enums"

export const trendingContent = pgTable("trending_content", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  contentType: contentViewTypeEnum("content_type").notNull(),
  contentId: text("content_id").notNull(),
  categoryId: text("category_id"),

  trendingScore: real("trending_score").notNull(),
  velocity: real("velocity").notNull(),
  acceleration: real("acceleration").notNull(),

  viewCount: integer("view_count").default(0).notNull(),
  participationCount: integer("participation_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  shareCount: integer("share_count").default(0).notNull(),

  windowStart: timestamp("window_start").notNull(),
  windowEnd: timestamp("window_end").notNull(),

  rank: integer("rank"),
  previousRank: integer("previous_rank"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  uniqueIndex("trending_content_type_id_window_idx").on(table.contentType, table.contentId, table.windowStart),
  index("trending_content_window_score_idx").on(table.windowStart, table.trendingScore),
  index("trending_content_category_window_score_idx").on(table.categoryId, table.windowStart, table.trendingScore)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • velocity + acceleration for trend detection                               │
// │   └─ velocity: Rate of engagement growth                                    │
// │   └─ acceleration: Is velocity increasing or decreasing?                    │
// │   └─ High velocity + high acceleration = breaking trend                     │
// │                                                                             │
// │ • windowStart/windowEnd for time-based trending                             │
// │   └─ Calculated periodically (every 15 mins)                                │
// │   └─ Historical windows kept for trend analysis                             │
// └─────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.11 REPORT & MODERATION MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.11.1 Report Enums

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "USER",
  "POLL",
  "SURVEY",
  "TEST",
  "COMMENT",
  "DISCUSSION"
])

export const reportReasonEnum = pgEnum("report_reason", [
  "SPAM",
  "HARASSMENT",
  "HATE_SPEECH",
  "MISINFORMATION",
  "INAPPROPRIATE_CONTENT",
  "VIOLENCE",
  "SELF_HARM",
  "ILLEGAL_CONTENT",
  "COPYRIGHT",
  "IMPERSONATION",
  "OTHER"
])

export const reportStatusEnum = pgEnum("report_status", [
  "PENDING",
  "IN_REVIEW",
  "RESOLVED",
  "DISMISSED",
  "ESCALATED"
])

export const reportPriorityEnum = pgEnum("report_priority", [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT"
])

export const reportResolutionEnum = pgEnum("report_resolution", [
  "NO_VIOLATION",
  "WARNING_ISSUED",
  "CONTENT_REMOVED",
  "CONTENT_MODIFIED",
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_BANNED",
  "ESCALATED_TO_LEGAL"
])
```

## 13.11.2 Report Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: User reports for content moderation                                   │
# │ WHY:  Community-driven moderation with audit trail                          │
# │ SQL:  CREATE TABLE reports (reporter_id TEXT, target_type report_target_type)│
# │ FILE: packages/database/src/schema/moderation.ts                            │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, timestamp, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { reportTargetTypeEnum, reportReasonEnum, reportStatusEnum, reportPriorityEnum, reportResolutionEnum } from "./enums"

export const reports = pgTable("reports", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  reporterId: text("reporter_id").notNull().references(() => users.id),

  targetType: reportTargetTypeEnum("target_type").notNull(),
  targetId: text("target_id").notNull(),

  reportedUserId: text("reported_user_id").references(() => users.id),

  reason: reportReasonEnum("reason").notNull(),
  details: varchar("details", { length: 1000 }),

  evidence: json("evidence").$type<string[]>().default([]),

  status: reportStatusEnum("status").default("PENDING").notNull(),

  priority: reportPriorityEnum("priority").default("NORMAL").notNull(),

  assignedTo: text("assigned_to"),
  assignedAt: timestamp("assigned_at"),

  resolvedAt: timestamp("resolved_at"),
  resolution: reportResolutionEnum("resolution"),
  resolutionNotes: varchar("resolution_notes", { length: 1000 }),

  actionsTaken: json("actions_taken").$type<string[]>().default([]),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("reports_status_priority_created_idx").on(table.status, table.priority, table.createdAt),
  index("reports_reported_user_status_idx").on(table.reportedUserId, table.status),
  index("reports_target_idx").on(table.targetType, table.targetId),
  index("reports_assigned_status_idx").on(table.assignedTo, table.status)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • evidence JSON array                                                       │
// │   └─ Screenshots, URLs, or other proof                                      │
// │   └─ Stored as array of URLs                                                │
// │                                                                             │
// │ • actionsTaken JSON array                                                   │
// │   └─ List of moderation actions taken                                       │
// │   └─ e.g., ["content_hidden", "user_warned", "user_suspended_3d"]           │
// └─────────────────────────────────────────────────────────────────────────────┘

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "reporter"
  }),
  reportedUser: one(users, {
    fields: [reports.reportedUserId],
    references: [users.id],
    relationName: "reported"
  })
}))
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.12 WEBHOOK MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.12.1 Webhook Enums

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

export const webhookEventTypeEnum = pgEnum("webhook_event_type", [
  "survey_created",
  "survey_published",
  "survey_completed",
  "survey_response_submitted",
  "survey_response_milestone",
  "poll_created",
  "poll_published",
  "poll_ended",
  "test_created",
  "test_published",
  "test_completed",
  "organization_member_joined",
  "organization_member_left",
  "organization_role_changed"
])

export const webhookDeliveryStatusEnum = pgEnum("webhook_delivery_status", [
  "PENDING",
  "DELIVERED",
  "FAILED",
  "RETRYING"
])
```

## 13.12.2 Webhook Endpoint Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Webhook endpoints configured by organizations                         │
# │ WHY:  Real-time event notifications to external systems                     │
# │ SQL:  CREATE TABLE webhook_endpoints (organization_id TEXT, url TEXT, ...)  │
# │ FILE: packages/database/src/schema/webhooks.ts                              │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, real, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { webhookEventTypeEnum } from "./enums"

export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  url: text("url").notNull(),
  secret: varchar("secret", { length: 64 }).notNull(),

  events: webhookEventTypeEnum("events").array().notNull(),

  isActive: boolean("is_active").default(true).notNull(),

  customHeaders: json("custom_headers").$type<Record<string, string>>().default({}),

  maxRetries: integer("max_retries").default(3).notNull(),
  initialDelayMs: integer("initial_delay_ms").default(5000).notNull(),
  maxDelayMs: integer("max_delay_ms").default(300000).notNull(),
  backoffMultiplier: real("backoff_multiplier").default(2).notNull(),

  maxPerMinute: integer("max_per_minute").default(60).notNull(),
  maxPerHour: integer("max_per_hour").default(500).notNull(),

  metadata: json("metadata").$type<Record<string, unknown>>().default({}),

  lastTriggeredAt: timestamp("last_triggered_at"),
  lastSuccessAt: timestamp("last_success_at"),
  lastFailureAt: timestamp("last_failure_at"),
  consecutiveFailures: integer("consecutive_failures").default(0).notNull(),

  disabledAt: timestamp("disabled_at"),
  disabledReason: text("disabled_reason"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("webhook_endpoints_org_active_idx").on(table.organizationId, table.isActive)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • events as ENUM[]                                                          │
// │   └─ Array of event types this endpoint listens for                         │
// │   └─ e.g., ["survey_response_submitted", "survey_completed"]                │
// │                                                                             │
// │ • Exponential backoff configuration                                         │
// │   └─ initialDelayMs: First retry wait (5 seconds)                           │
// │   └─ backoffMultiplier: 2 = 5s, 10s, 20s, 40s...                            │
// │   └─ maxDelayMs: Cap at 5 minutes                                           │
// └─────────────────────────────────────────────────────────────────────────────┘

export const webhookEndpointsRelations = relations(webhookEndpoints, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [webhookEndpoints.organizationId],
    references: [organizations.id]
  }),
  deliveries: many(webhookDeliveries)
}))
```

## 13.12.3 Webhook Delivery Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Webhook delivery attempts and status                                  │
# │ WHY:  Audit trail and retry management for webhooks                         │
# │ SQL:  CREATE TABLE webhook_deliveries (endpoint_id TEXT, event, payload)    │
# │ FILE: packages/database/src/schema/webhooks.ts                              │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, timestamp, integer, json, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { webhookEventTypeEnum, webhookDeliveryStatusEnum } from "./enums"

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  webhookEndpointId: text("webhook_endpoint_id").notNull().references(() => webhookEndpoints.id, { onDelete: "cascade" }),

  event: webhookEventTypeEnum("event").notNull(),
  payload: json("payload").$type<Record<string, unknown>>().default({}),

  status: webhookDeliveryStatusEnum("status").default("PENDING").notNull(),

  attempts: json("attempts").$type<Array<{ at: string, status: number, error?: string }>>().default([]),
  attemptCount: integer("attempt_count").default(0).notNull(),

  nextRetryAt: timestamp("next_retry_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("webhook_deliveries_endpoint_status_idx").on(table.webhookEndpointId, table.status),
  index("webhook_deliveries_status_retry_idx").on(table.status, table.nextRetryAt)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • attempts JSON array stores delivery history                               │
// │   └─ Each attempt: { at: timestamp, status: HTTP status, error?: message }  │
// │   └─ Full audit trail for debugging                                         │
// │                                                                             │
// │ • nextRetryAt for retry scheduling                                          │
// │   └─ Worker queries: WHERE status = 'RETRYING' AND next_retry_at < NOW()    │
// └─────────────────────────────────────────────────────────────────────────────┘

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  endpoint: one(webhookEndpoints, {
    fields: [webhookDeliveries.webhookEndpointId],
    references: [webhookEndpoints.id]
  })
}))
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.13 AUDIT & LOGGING MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.13.1 Audit Enums

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

export const actorTypeEnum = pgEnum("actor_type", [
  "USER",
  "ORGANIZATION",
  "SYSTEM"
])

export const eventSeverityEnum = pgEnum("event_severity", [
  "DEBUG",
  "INFO",
  "WARNING",
  "ERROR",
  "CRITICAL"
])
```

## 13.13.2 Audit Log Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Audit trail for all significant actions                               │
# │ WHY:  Compliance, debugging, and security monitoring                        │
# │ SQL:  CREATE TABLE audit_logs (actor_id TEXT, action VARCHAR, entity_type)  │
# │ FILE: packages/database/src/schema/audit.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, timestamp, json, index } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { actorTypeEnum } from "./enums"

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  actorId: text("actor_id"),
  actorType: actorTypeEnum("actor_type").notNull(),

  action: varchar("action", { length: 100 }).notNull(),

  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: text("entity_id").notNull(),

  changes: json("changes").$type<Record<string, unknown>>().default({}),
  previousState: json("previous_state").$type<Record<string, unknown>>(),
  newState: json("new_state").$type<Record<string, unknown>>(),

  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),

  metadata: json("metadata").$type<Record<string, unknown>>().default({}),

  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  index("audit_logs_actor_created_idx").on(table.actorId, table.createdAt),
  index("audit_logs_entity_created_idx").on(table.entityType, table.entityId, table.createdAt),
  index("audit_logs_action_created_idx").on(table.action, table.createdAt),
  index("audit_logs_created_idx").on(table.createdAt)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • No foreign keys on audit logs                                             │
// │   └─ Audit logs should survive entity deletion                              │
// │   └─ actorId stored but not referenced                                      │
// │                                                                             │
// │ • changes vs previousState/newState                                         │
// │   └─ changes: Delta only (what changed)                                     │
// │   └─ previousState/newState: Full snapshots (for detailed audit)            │
// └─────────────────────────────────────────────────────────────────────────────┘
```

## 13.13.3 System Event Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: System events and errors for monitoring                               │
# │ WHY:  Operational monitoring and alerting                                   │
# │ SQL:  CREATE TABLE system_events (event_type VARCHAR, severity, message)    │
# │ FILE: packages/database/src/schema/audit.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, timestamp, json, index } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { eventSeverityEnum } from "./enums"

export const systemEvents = pgTable("system_events", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  eventType: varchar("event_type", { length: 100 }).notNull(),
  severity: eventSeverityEnum("severity").notNull(),

  source: varchar("source", { length: 100 }).notNull(),

  message: varchar("message", { length: 1000 }).notNull(),

  details: json("details").$type<Record<string, unknown>>().default({}),

  stackTrace: text("stack_trace"),

  correlationId: varchar("correlation_id", { length: 64 }),

  resolvedAt: timestamp("resolved_at"),
  resolvedBy: text("resolved_by"),

  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  index("system_events_type_severity_created_idx").on(table.eventType, table.severity, table.createdAt),
  index("system_events_severity_created_idx").on(table.severity, table.createdAt),
  index("system_events_correlation_idx").on(table.correlationId)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • correlationId for distributed tracing                                     │
// │   └─ Same ID across related events in a request                             │
// │   └─ Links API call to worker jobs to webhooks                              │
// │                                                                             │
// │ • severity enum for alerting                                                │
// │   └─ ERROR/CRITICAL trigger PagerDuty alerts                                │
// │   └─ WARNING triggers Slack notifications                                   │
// └─────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.14 VERSION 3.0 SPECIAL MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 13.14.1 Live Poll Session Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Live/real-time poll sessions                                          │
# │ WHY:  Enables live polling events with QR code join                         │
# │ SQL:  CREATE TABLE live_poll_sessions (poll_id TEXT UNIQUE, join_code)      │
# │ FILE: packages/database/src/schema/live.ts                                  │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgEnum, pgTable, text, varchar, boolean, timestamp, integer, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const livePollStatusEnum = pgEnum("live_poll_status", [
  "WAITING",
  "ACTIVE",
  "PAUSED",
  "ENDED"
])

export const livePollSessions = pgTable("live_poll_sessions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  pollId: text("poll_id").unique().notNull().references(() => polls.id, { onDelete: "cascade" }),

  joinCode: varchar("join_code", { length: 6 }).unique().notNull(),
  joinUrl: text("join_url").notNull(),
  qrCodeUrl: text("qr_code_url"),

  status: livePollStatusEnum("status").default("WAITING").notNull(),

  maxParticipants: integer("max_participants").default(10000).notNull(),
  currentParticipants: integer("current_participants").default(0).notNull(),

  showRealTimeResults: boolean("show_real_time_results").default(true).notNull(),
  allowLateJoin: boolean("allow_late_join").default(true).notNull(),
  anonymousVoting: boolean("anonymous_voting").default(true).notNull(),
  participantListVisible: boolean("participant_list_visible").default(false).notNull(),

  autoCloseMinutes: integer("auto_close_minutes"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => [
  index("live_poll_sessions_join_code_idx").on(table.joinCode),
  index("live_poll_sessions_status_idx").on(table.status)
])

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • joinCode VARCHAR(6) - short memorable code                                │
// │   └─ e.g., "ABC123" - easy to type on mobile                                │
// │   └─ Unique constraint ensures no collisions                                │
// │                                                                             │
// │ • Real-time features                                                        │
// │   └─ showRealTimeResults: Live vote count display                           │
// │   └─ participantListVisible: Show who's in the session                      │
// └─────────────────────────────────────────────────────────────────────────────┘

export const livePollSessionsRelations = relations(livePollSessions, ({ one }) => ({
  poll: one(polls, {
    fields: [livePollSessions.pollId],
    references: [polls.id]
  })
}))
```

## 13.14.2 User Subscription Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Individual user subscriptions (Plus/Premium)                          │
# │ WHY:  Tracks paid subscriptions with Stripe integration                     │
# │ SQL:  CREATE TABLE user_subscriptions (user_id TEXT UNIQUE, tier, ...)      │
# │ FILE: packages/database/src/schema/subscriptions.ts                         │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgEnum, pgTable, text, varchar, boolean, timestamp, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
  "INCOMPLETE",
  "TRIALING"
])

export const userSubscriptions = pgTable("user_subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").unique().notNull().references(() => users.id, { onDelete: "cascade" }),

  tier: userSubscriptionTierEnum("tier").default("FREE").notNull(),

  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),

  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),

  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  canceledAt: timestamp("canceled_at"),

  status: subscriptionStatusEnum("status").default("ACTIVE").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
})

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id]
  })
}))
```

## 13.14.3 Voice Access Request Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Requests to comment on restricted discussions                         │
# │ WHY:  Enables moderated discussions requiring approval to comment           │
# │ SQL:  CREATE TABLE voice_access_requests (discussion_id TEXT, user_id TEXT) │
# │ FILE: packages/database/src/schema/social.ts                                │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgEnum, pgTable, text, varchar, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

export const voiceAccessStatusEnum = pgEnum("voice_access_status", [
  "PENDING",
  "APPROVED",
  "DENIED",
  "EXPIRED"
])

export const voiceAccessRequests = pgTable("voice_access_requests", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  discussionId: text("discussion_id").notNull().references(() => discussions.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  reason: varchar("reason", { length: 500 }).notNull(),

  status: voiceAccessStatusEnum("status").default("PENDING").notNull(),

  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedById: text("reviewed_by_id"),
  rejectionReason: text("rejection_reason")
}, (table) => [
  uniqueIndex("voice_access_discussion_user_idx").on(table.discussionId, table.userId),
  index("voice_access_discussion_status_idx").on(table.discussionId, table.status),
  index("voice_access_user_status_idx").on(table.userId, table.status)
])

export const voiceAccessRequestsRelations = relations(voiceAccessRequests, ({ one }) => ({
  discussion: one(discussions, {
    fields: [voiceAccessRequests.discussionId],
    references: [discussions.id]
  }),
  user: one(users, {
    fields: [voiceAccessRequests.userId],
    references: [users.id]
  })
}))
```

## 13.14.4 Test Result Badge Table

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Personality test result badges for profile display                    │
# │ WHY:  Shareable test results with visual badge                              │
# │ SQL:  CREATE TABLE test_result_badges (test_id TEXT, user_id TEXT, ...)     │
# │ FILE: packages/database/src/schema/tests.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
import { pgTable, text, varchar, boolean, timestamp, integer, real, json, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { personalityTestTypeEnum } from "./enums"

export const testResultBadges = pgTable("test_result_badges", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  testId: text("test_id").notNull().references(() => personalityTests.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  resultType: personalityTestTypeEnum("result_type").notNull(),

  resultTitle: varchar("result_title", { length: 100 }).notNull(),
  resultSubtitle: varchar("result_subtitle", { length: 200 }),
  resultImageUrl: text("result_image_url").notNull(),

  axisScores: json("axis_scores").$type<Record<string, number>>(),
  characterName: varchar("character_name", { length: 100 }),
  matchPercentage: real("match_percentage"),
  spectrumScore: real("spectrum_score"),
  spectrumLabel: varchar("spectrum_label", { length: 100 }),

  displayOnProfile: boolean("display_on_profile").default(true).notNull(),
  pinnedPosition: integer("pinned_position"),

  earnedAt: timestamp("earned_at").defaultNow().notNull()
}, (table) => [
  uniqueIndex("test_result_badges_test_user_idx").on(table.testId, table.userId),
  index("test_result_badges_user_display_idx").on(table.userId, table.displayOnProfile),
  index("test_result_badges_user_pinned_idx").on(table.userId, table.pinnedPosition)
])

export const testResultBadgesRelations = relations(testResultBadges, ({ one }) => ({
  test: one(personalityTests, {
    fields: [testResultBadges.testId],
    references: [personalityTests.id]
  }),
  user: one(users, {
    fields: [testResultBadges.userId],
    references: [users.id]
  })
}))
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.15 SCHEMA BARREL EXPORT
# ══════════════════════════════════════════════════════════════════════════════

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ WHAT: Central export file for all schema definitions                        │
# │ WHY:  Single import point for Drizzle client                                │
# │ FILE: packages/database/src/schema/index.ts                                 │
# └─────────────────────────────────────────────────────────────────────────────┘

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SCHEMA BARREL EXPORT
// packages/database/src/schema/index.ts
// ══════════════════════════════════════════════════════════════════════════════

// Enums
export * from "./enums"

// User & Auth
export * from "./users"
export * from "./auth"

// Organizations
export * from "./organizations"

// Content
export * from "./polls"
export * from "./surveys"
export * from "./tests"
export * from "./categories"

// Responses
export * from "./responses"

// Gamification
export * from "./gamification"

// Social
export * from "./social"

// Trust & Fraud
export * from "./trust"

// Notifications
export * from "./notifications"

// Feed & Discovery
export * from "./feed"

// Moderation
export * from "./moderation"

// Webhooks
export * from "./webhooks"

// Audit
export * from "./audit"

// Subscriptions
export * from "./subscriptions"

// Live Features
export * from "./live"

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • Barrel export pattern                                                     │
// │   └─ Single import: import * as schema from "./schema"                      │
// │   └─ Tree-shaking friendly when using named exports                         │
// │                                                                             │
// │ • File organization                                                         │
// │   └─ Group related tables by domain                                         │
// │   └─ Enums in dedicated file for easy importing                             │
// │   └─ Relations defined in same file as tables                               │
// └─────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 13.16 MIGRATION COMMANDS (DRIZZLE)
# ══════════════════════════════════════════════════════════════════════════════

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DRIZZLE MIGRATION COMMANDS
// ══════════════════════════════════════════════════════════════════════════════

const DRIZZLE_COMMANDS = {
  // Generate migration from schema changes
  generateMigration: "npx drizzle-kit generate",

  // Apply migrations to database
  migrateUp: "npx drizzle-kit migrate",

  // Push schema directly (dev only)
  push: "npx drizzle-kit push",

  // Pull schema from database
  pull: "npx drizzle-kit pull",

  // Open Drizzle Studio (GUI)
  studio: "npx drizzle-kit studio",

  // Check schema validity
  check: "npx drizzle-kit check"
}

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • drizzle-kit generate vs push                                              │
// │   └─ generate: Creates SQL migration files                                  │
// │   └─ push: Applies schema directly (no migration files)                     │
// │   └─ Use generate for production, push for rapid dev                        │
// │                                                                             │
// │ • drizzle-kit studio                                                        │
// │   └─ Web-based database GUI                                                 │
// │   └─ Browse data, run queries, edit records                                 │
// │   └─ No external tools needed                                               │
// └─────────────────────────────────────────────────────────────────────────────┘

export { DRIZZLE_COMMANDS }
```
