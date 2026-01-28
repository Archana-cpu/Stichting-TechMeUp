// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - PAYMENT & SUBSCRIPTION SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, boolean, timestamp, integer, json, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import {
  userSubscriptionTierEnum,
  subscriptionStatusEnum,
  billingPeriodEnum,
  paymentMethodTypeEnum,
  currencyEnum,
  checkoutSessionStatusEnum,
  cancellationReasonEnum,
  refundCaseEnum,
  refundStatusEnum,
} from './enums'
import { users } from './users'

// ─────────────────────────────────────────────────────────────────────────────
// User Subscriptions Table
// ─────────────────────────────────────────────────────────────────────────────

export const userSubscriptions = pgTable('user_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),

  tier: userSubscriptionTierEnum('tier').default('FREE').notNull(),
  billingPeriod: billingPeriodEnum('billingPeriod'),

  stripeCustomerId: text('stripeCustomerId').unique(),
  stripeSubscriptionId: text('stripeSubscriptionId').unique(),
  iyzicoSubscriptionId: text('iyzicoSubscriptionId').unique(),

  currentPeriodStart: timestamp('currentPeriodStart'),
  currentPeriodEnd: timestamp('currentPeriodEnd'),

  cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').default(false).notNull(),
  canceledAt: timestamp('canceledAt'),

  status: subscriptionStatusEnum('status').default('ACTIVE').notNull(),

  paymentMethodType: paymentMethodTypeEnum('paymentMethodType'),
  paymentMethodBrand: varchar('paymentMethodBrand', { length: 20 }),
  paymentMethodLast4: varchar('paymentMethodLast4', { length: 4 }),
  paymentMethodExpiryMonth: integer('paymentMethodExpiryMonth'),
  paymentMethodExpiryYear: integer('paymentMethodExpiryYear'),

  paymentFailedAt: timestamp('paymentFailedAt'),
  dunningRetryCount: integer('dunningRetryCount').default(0).notNull(),
  lastDunningAttempt: timestamp('lastDunningAttempt'),

  pendingTierChange: userSubscriptionTierEnum('pendingTierChange'),
  pendingTierChangeDate: timestamp('pendingTierChangeDate'),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}, (table) => [
  index('user_subscriptions_tier_status_idx').on(table.tier, table.status),
  index('user_subscriptions_currentPeriodEnd_idx').on(table.currentPeriodEnd),
])

// ─────────────────────────────────────────────────────────────────────────────
// Checkout Sessions Table
// ─────────────────────────────────────────────────────────────────────────────

export const checkoutSessions = pgTable('checkout_sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: text('subscriptionId'),

  tier: userSubscriptionTierEnum('tier').notNull(),
  billingPeriod: billingPeriodEnum('billingPeriod').notNull(),

  subtotal: integer('subtotal').notNull(),
  discount: integer('discount').default(0).notNull(),
  tax: integer('tax').default(0).notNull(),
  total: integer('total').notNull(),
  currency: currencyEnum('currency').default('USD').notNull(),

  paymentMethodType: paymentMethodTypeEnum('paymentMethodType'),
  cardBrand: varchar('cardBrand', { length: 20 }),
  cardLast4: varchar('cardLast4', { length: 4 }),
  cardExpiry: varchar('cardExpiry', { length: 5 }),

  billingCountry: varchar('billingCountry', { length: 2 }),
  billingPostalCode: varchar('billingPostalCode', { length: 20 }),
  billingState: varchar('billingState', { length: 100 }),
  billingCity: varchar('billingCity', { length: 100 }),
  billingLine1: varchar('billingLine1', { length: 255 }),
  billingLine2: varchar('billingLine2', { length: 255 }),

  status: checkoutSessionStatusEnum('status').default('PENDING').notNull(),

  stripePaymentIntentId: text('stripePaymentIntentId').unique(),
  iyzicoPaymentId: text('iyzicoPaymentId').unique(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  completedAt: timestamp('completedAt'),
  expiresAt: timestamp('expiresAt').notNull(),
}, (table) => [
  index('checkout_sessions_userId_status_idx').on(table.userId, table.status),
  index('checkout_sessions_status_expiresAt_idx').on(table.status, table.expiresAt),
])

// ─────────────────────────────────────────────────────────────────────────────
// Cancellation Feedback Table
// ─────────────────────────────────────────────────────────────────────────────

export const cancellationFeedback = pgTable('cancellation_feedback', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: text('subscriptionId').notNull(),

  tier: userSubscriptionTierEnum('tier').notNull(),
  reason: cancellationReasonEnum('reason').notNull(),
  feedback: varchar('feedback', { length: 500 }),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table) => [
  index('cancellation_feedback_userId_idx').on(table.userId),
  index('cancellation_feedback_reason_idx').on(table.reason),
])

// ─────────────────────────────────────────────────────────────────────────────
// Refund Requests Table
// ─────────────────────────────────────────────────────────────────────────────

export const refundRequests = pgTable('refund_requests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: text('subscriptionId').notNull(),

  invoiceId: varchar('invoiceId', { length: 100 }),
  amount: integer('amount').notNull(),
  currency: currencyEnum('currency').default('USD').notNull(),

  reason: varchar('reason', { length: 500 }).notNull(),
  case: refundCaseEnum('case').notNull(),

  status: refundStatusEnum('status').default('PENDING').notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  processedAt: timestamp('processedAt'),
  processedBy: text('processedBy'),
  rejectionReason: varchar('rejectionReason', { length: 500 }),
}, (table) => [
  index('refund_requests_userId_idx').on(table.userId),
  index('refund_requests_status_createdAt_idx').on(table.status, table.createdAt),
])
