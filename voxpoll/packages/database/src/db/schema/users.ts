// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - USER & AUTH SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, integer, smallint, doublePrecision, json, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import {
  userStatusEnum,
  userRoleEnum,
  authProviderEnum,
  verificationLevelEnum,
  verificationMethodEnum,
  genderEnum,
  educationLevelEnum,
  maritalStatusEnum,
  employmentStatusEnum,
  userSubscriptionTierEnum,
  deviceCategoryEnum,
  pushPlatformEnum,
} from './enums'

// ─────────────────────────────────────────────────────────────────────────────
// Users Table
// ─────────────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  // Authentication & Contact
  email: varchar('email', { length: 255 }).unique(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  emailVerifiedAt: timestamp('emailVerifiedAt'),

  phone: varchar('phone', { length: 20 }).unique(),
  phoneVerified: boolean('phoneVerified').default(false).notNull(),
  phoneVerifiedAt: timestamp('phoneVerifiedAt'),

  // Password Security
  passwordHash: varchar('passwordHash', { length: 255 }),
  passwordHistory: text('passwordHistory').array().default([]),
  passwordChangedAt: timestamp('passwordChangedAt'),

  // Login Security
  failedLoginAttempts: integer('failedLoginAttempts').default(0).notNull(),
  lockedUntil: timestamp('lockedUntil'),
  lastFailedLoginAt: timestamp('lastFailedLoginAt'),
  concurrentSessionLimit: integer('concurrentSessionLimit').default(5).notNull(),

  // Two-Factor Authentication (Bible: 02-USERS, 05-TECH)
  twoFactorEnabled: boolean('twoFactorEnabled').default(false).notNull(),
  twoFactorSecret: varchar('twoFactorSecret', { length: 255 }),
  twoFactorBackupCodes: text('twoFactorBackupCodes').array().default([]),
  twoFactorVerifiedAt: timestamp('twoFactorVerifiedAt'),

  // Profile Information
  username: varchar('username', { length: 30 }).unique().notNull(),
  displayName: varchar('displayName', { length: 50 }).notNull(),
  avatarUrl: text('avatarUrl'),
  bannerUrl: text('bannerUrl'),
  bio: varchar('bio', { length: 500 }),
  location: varchar('location', { length: 100 }),
  website: varchar('website', { length: 255 }),
  birthDate: timestamp('birthDate'),

  // Demographics (IMMUTABLE)
  birthYear: smallint('birthYear'),
  birthMonth: smallint('birthMonth'),
  gender: genderEnum('gender'),
  country: varchar('country', { length: 2 }),
  region: varchar('region', { length: 100 }),
  city: varchar('city', { length: 100 }),
  educationLevel: educationLevelEnum('educationLevel'),

  // Demographics (MUTABLE)
  maritalStatus: maritalStatusEnum('maritalStatus'),
  profession: varchar('profession', { length: 100 }),
  employmentStatus: employmentStatusEnum('employmentStatus'),
  demographicsLockedAt: timestamp('demographicsLockedAt'),

  // Role & Verification
  role: userRoleEnum('role').default('USER').notNull(),
  status: userStatusEnum('status').default('PENDING_VERIFICATION').notNull(),
  isVerified: boolean('isVerified').default(false).notNull(),
  verifiedAt: timestamp('verifiedAt'),
  verificationLevel: verificationLevelEnum('verificationLevel').default('NONE').notNull(),
  verificationMethod: verificationMethodEnum('verificationMethod'),

  // Response Weighting
  responseWeight: doublePrecision('responseWeight').default(0.5).notNull(),
  trustScoreValue: doublePrecision('trustScoreValue').default(50).notNull(),

  // Subscription
  subscriptionTier: userSubscriptionTierEnum('subscriptionTier').default('FREE').notNull(),
  subscriptionExpiresAt: timestamp('subscriptionExpiresAt'),
  subscriptionStartedAt: timestamp('subscriptionStartedAt'),
  lastBillingDate: timestamp('lastBillingDate'),
  nextBillingDate: timestamp('nextBillingDate'),
  stripeCustomerId: varchar('stripeCustomerId', { length: 255 }).unique(),
  stripeSubscriptionId: varchar('stripeSubscriptionId', { length: 255 }).unique(),

  // Localization
  locale: varchar('locale', { length: 5 }).default('tr').notNull(),
  timezone: varchar('timezone', { length: 50 }).default('Europe/Istanbul').notNull(),

  // Settings (JSON)
  privacySettings: json('privacySettings').default({}).notNull(),
  notificationSettings: json('notificationSettings').default({}).notNull(),
  contentPreferences: json('contentPreferences').default({}).notNull(),

  // Activity Tracking
  lastActiveAt: timestamp('lastActiveAt'),
  lastLoginAt: timestamp('lastLoginAt'),
  loginCount: integer('loginCount').default(0).notNull(),

  // Moderation
  suspendedAt: timestamp('suspendedAt'),
  suspendedUntil: timestamp('suspendedUntil'),
  suspensionReason: text('suspensionReason'),
  deletedAt: timestamp('deletedAt'),
  deletionRequestedAt: timestamp('deletionRequestedAt'),

  // Timestamps
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_username_idx').on(table.username),
  index('users_status_idx').on(table.status),
  index('users_verificationLevel_idx').on(table.verificationLevel),
  index('users_subscriptionTier_idx').on(table.subscriptionTier),
  index('users_createdAt_idx').on(table.createdAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Accounts Table (OAuth)
// ─────────────────────────────────────────────────────────────────────────────

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  provider: authProviderEnum('provider').notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),

  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  expiresAt: timestamp('expiresAt'),
  tokenType: varchar('tokenType', { length: 50 }),
  scope: text('scope'),
  idToken: text('idToken'),

  // e-Devlet specific
  tcKimlikNo: varchar('tcKimlikNo', { length: 11 }),
  eDevletVerified: boolean('eDevletVerified').default(false).notNull(),
  eDevletVerifiedAt: timestamp('eDevletVerifiedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('accounts_provider_providerAccountId_idx').on(table.provider, table.providerAccountId),
  index('accounts_userId_idx').on(table.userId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Sessions Table
// ─────────────────────────────────────────────────────────────────────────────

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  tokenHash: varchar('tokenHash', { length: 64 }).unique().notNull(),
  refreshTokenHash: varchar('refreshTokenHash', { length: 64 }).unique(),

  deviceCategory: deviceCategoryEnum('deviceCategory').default('UNKNOWN').notNull(),
  userAgent: text('userAgent'),
  ipAddress: varchar('ipAddress', { length: 45 }),

  expiresAt: timestamp('expiresAt').notNull(),
  lastActiveAt: timestamp('lastActiveAt'),

  isRevoked: boolean('isRevoked').default(false).notNull(),
  revokedAt: timestamp('revokedAt'),
  revokedReason: varchar('revokedReason', { length: 100 }),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  index('sessions_userId_idx').on(table.userId),
  index('sessions_tokenHash_idx').on(table.tokenHash),
  index('sessions_expiresAt_idx').on(table.expiresAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Verification Tokens Table
// ─────────────────────────────────────────────────────────────────────────────

export const verificationTokens = pgTable('verification_tokens', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }),

  identifier: varchar('identifier', { length: 255 }).notNull(),
  tokenHash: varchar('tokenHash', { length: 64 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),

  expiresAt: timestamp('expiresAt').notNull(),
  usedAt: timestamp('usedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('verification_tokens_tokenHash_idx').on(table.tokenHash),
  index('verification_tokens_identifier_type_idx').on(table.identifier, table.type),
])

// ─────────────────────────────────────────────────────────────────────────────
// User Devices Table
// ─────────────────────────────────────────────────────────────────────────────

export const userDevices = pgTable('user_devices', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  deviceCategory: deviceCategoryEnum('deviceCategory').notNull(),
  deviceName: varchar('deviceName', { length: 100 }),
  browser: varchar('browser', { length: 100 }),
  os: varchar('os', { length: 100 }),

  lastIpAddress: varchar('lastIpAddress', { length: 45 }),
  lastActiveAt: timestamp('lastActiveAt'),

  isTrusted: boolean('isTrusted').default(false).notNull(),
  trustedAt: timestamp('trustedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  index('user_devices_userId_idx').on(table.userId),
])



// ─────────────────────────────────────────────────────────────────────────────
// User Reliability Cache Table
// ─────────────────────────────────────────────────────────────────────────────

export const userReliabilityCaches = pgTable('user_reliability_caches', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),

  reliabilityScore: doublePrecision('reliabilityScore').default(50).notNull(),
  completionRate: doublePrecision('completionRate').default(0).notNull(),
  avgQualityScore: doublePrecision('avgQualityScore').default(0).notNull(),
  totalResponses: integer('totalResponses').default(0).notNull(),
  validResponses: integer('validResponses').default(0).notNull(),

  lastFullRecalc: timestamp('lastFullRecalc'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('user_reliability_caches_reliabilityScore_idx').on(table.reliabilityScore),
  index('user_reliability_caches_lastFullRecalc_idx').on(table.lastFullRecalc),
])

