// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - ORGANIZATION SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, json, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import {
  organizationTypeEnum,
  organizationPlanEnum,
  organizationRoleEnum,
} from './enums'
import { users } from './users'

// ─────────────────────────────────────────────────────────────────────────────
// Organizations Table
// ─────────────────────────────────────────────────────────────────────────────

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),

  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),

  type: organizationTypeEnum('type').notNull(),

  logoUrl: text('logoUrl'),
  bannerUrl: text('bannerUrl'),
  website: varchar('website', { length: 255 }),
  description: varchar('description', { length: 1000 }),

  plan: organizationPlanEnum('plan').default('STARTER').notNull(),

  settings: json('settings').default({}).notNull(),
  brandingSettings: json('brandingSettings').default({}).notNull(),

  contentApprovalEnabled: boolean('contentApprovalEnabled').default(false).notNull(),
  contentApprovalSettings: json('contentApprovalSettings').default({}).notNull(),

  isVerified: boolean('isVerified').default(false).notNull(),
  verifiedAt: timestamp('verifiedAt'),

  stripeCustomerId: text('stripeCustomerId').unique(),
  stripeSubscriptionId: text('stripeSubscriptionId').unique(),
  currentPeriodStart: timestamp('currentPeriodStart'),
  currentPeriodEnd: timestamp('currentPeriodEnd'),

  deletedAt: timestamp('deletedAt'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('organizations_slug_idx').on(table.slug),
  index('organizations_type_idx').on(table.type),
])

// ─────────────────────────────────────────────────────────────────────────────
// Organization Members Table
// ─────────────────────────────────────────────────────────────────────────────

export const organizationMembers = pgTable('organization_members', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),

  role: organizationRoleEnum('role').default('MEMBER').notNull(),

  permissions: json('permissions').default({}).notNull(),

  joinedAt: timestamp('joinedAt').defaultNow().notNull(),
  invitedBy: text('invitedBy'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('organization_members_organizationId_userId_idx').on(table.organizationId, table.userId),
  index('organization_members_userId_idx').on(table.userId),
])

// ─────────────────────────────────────────────────────────────────────────────
// Organization Invitations Table
// ─────────────────────────────────────────────────────────────────────────────

export const organizationInvitations = pgTable('organization_invitations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organizationId').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  email: varchar('email', { length: 255 }).notNull(),
  role: organizationRoleEnum('role').default('MEMBER').notNull(),

  token: varchar('token', { length: 64 }).unique().notNull(),

  invitedById: text('invitedById').notNull(),

  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  respondedAt: timestamp('respondedAt'),
}, (table) => [
  index('organization_invitations_organizationId_idx').on(table.organizationId),
  index('organization_invitations_email_idx').on(table.email),
  index('organization_invitations_token_idx').on(table.token),
])

// ─────────────────────────────────────────────────────────────────────────────
// SSO Configurations Table (Enterprise Feature)
// ─────────────────────────────────────────────────────────────────────────────

export const ssoConfigs = pgTable('sso_configs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organizationId').notNull().unique().references(() => organizations.id, { onDelete: 'cascade' }),

  provider: varchar('provider', { length: 20 }).notNull(),

  issuer: text('issuer').notNull(),
  ssoUrl: text('ssoUrl').notNull(),
  callbackUrl: text('callbackUrl').notNull(),

  certificate: text('certificate'),

  clientId: varchar('clientId', { length: 255 }),
  clientSecret: text('clientSecret'),

  attributeMapping: json('attributeMapping').default({
    email: 'email',
    firstName: 'given_name',
    lastName: 'family_name',
    employeeId: 'employee_id',
  }).notNull(),

  allowedDomains: text('allowedDomains').array().default([]),

  autoProvisionUsers: boolean('autoProvisionUsers').default(true).notNull(),
  defaultRole: organizationRoleEnum('defaultRole').default('MEMBER').notNull(),

  isActive: boolean('isActive').default(false).notNull(),
  testMode: boolean('testMode').default(true).notNull(),

  lastTestedAt: timestamp('lastTestedAt'),
  lastTestResult: json('lastTestResult'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('sso_configs_organizationId_idx').on(table.organizationId),
  index('sso_configs_isActive_idx').on(table.isActive),
])
