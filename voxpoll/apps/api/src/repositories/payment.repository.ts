// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PAYMENT REPOSITORY
// Data access layer for payment operations
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  desc,
  sql,
  userSubscriptions,
  checkoutSessions,
  cancellationFeedback,
  refundRequests,
  users,
  type SubscriptionStatus,
  type UserSubscriptionTier,
  type BillingPeriod,
  type Currency,
  type CheckoutSessionStatus,
  type CancellationReason,
  type RefundCase,
  type RefundStatus,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import type { PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type UserSubscription = InferSelectModel<typeof userSubscriptions>
export type CheckoutSession = InferSelectModel<typeof checkoutSessions>
export type CancellationFeedback = InferSelectModel<typeof cancellationFeedback>
export type RefundRequest = InferSelectModel<typeof refundRequests>

// ─────────────────────────────────────────────────────────────────────────────
// Payment Repository Class
// ─────────────────────────────────────────────────────────────────────────────

class PaymentRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Subscription
  // ─────────────────────────────────────────────────────────────────────────────

  async getSubscriptionByUser(userId: string) {
    const result = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Subscription by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getSubscriptionById(id: string) {
    const result = await db
      .select({
        subscription: userSubscriptions,
        user: {
          id: users.id,
          email: users.email,
          username: users.username,
        },
      })
      .from(userSubscriptions)
      .innerJoin(users, eq(userSubscriptions.userId, users.id))
      .where(eq(userSubscriptions.id, id))
      .limit(1)

    if (!result[0]) return null

    return {
      ...result[0].subscription,
      user: result[0].user,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Subscription by Stripe ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getSubscriptionByStripeId(stripeSubscriptionId: string) {
    const result = await db
      .select({
        subscription: userSubscriptions,
        user: {
          id: users.id,
          email: users.email,
          username: users.username,
        },
      })
      .from(userSubscriptions)
      .innerJoin(users, eq(userSubscriptions.userId, users.id))
      .where(eq(userSubscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .limit(1)

    if (!result[0]) return null

    return {
      ...result[0].subscription,
      user: result[0].user,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Subscription by Stripe Customer ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getSubscriptionByStripeCustomerId(stripeCustomerId: string) {
    const result = await db
      .select({
        subscription: userSubscriptions,
        user: {
          id: users.id,
          email: users.email,
          username: users.username,
        },
      })
      .from(userSubscriptions)
      .innerJoin(users, eq(userSubscriptions.userId, users.id))
      .where(eq(userSubscriptions.stripeCustomerId, stripeCustomerId))
      .limit(1)

    if (!result[0]) return null

    return {
      ...result[0].subscription,
      user: result[0].user,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Subscription
  // ─────────────────────────────────────────────────────────────────────────────

  async createSubscription(data: {
    userId: string
    tier: UserSubscriptionTier
    billingPeriod?: BillingPeriod
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    status: SubscriptionStatus
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
  }) {
    const [result] = await db
      .insert(userSubscriptions)
      .values(data)
      .returning()

    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Subscription
  // ─────────────────────────────────────────────────────────────────────────────

  async updateSubscription(id: string, data: {
    tier?: UserSubscriptionTier
    status?: SubscriptionStatus
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
    cancelAtPeriodEnd?: boolean
    canceledAt?: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }) {
    const [result] = await db
      .update(userSubscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userSubscriptions.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Upsert Subscription
  // ─────────────────────────────────────────────────────────────────────────────

  async upsertSubscription(userId: string, data: {
    tier: UserSubscriptionTier
    billingPeriod?: BillingPeriod
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    status: SubscriptionStatus
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
  }) {
    // Check if exists
    const existing = await this.getSubscriptionByUser(userId)

    if (existing) {
      const [result] = await db
        .update(userSubscriptions)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userSubscriptions.userId, userId))
        .returning()

      return result
    }

    const [result] = await db
      .insert(userSubscriptions)
      .values({ userId, ...data })
      .returning()

    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Checkout Session
  // ─────────────────────────────────────────────────────────────────────────────

  async createCheckoutSession(data: {
    userId: string
    tier: UserSubscriptionTier
    billingPeriod: 'MONTHLY' | 'YEARLY'
    subtotal: number
    discount: number
    tax: number
    total: number
    currency?: Currency
    expiresAt: Date
  }) {
    const [result] = await db
      .insert(checkoutSessions)
      .values({
        userId: data.userId,
        tier: data.tier,
        billingPeriod: data.billingPeriod,
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        total: data.total,
        currency: data.currency,
        expiresAt: data.expiresAt,
        status: 'PENDING',
      })
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Checkout Session
  // ─────────────────────────────────────────────────────────────────────────────

  async getCheckoutSession(id: string) {
    const result = await db
      .select({
        session: checkoutSessions,
        user: {
          id: users.id,
          email: users.email,
          username: users.username,
        },
      })
      .from(checkoutSessions)
      .innerJoin(users, eq(checkoutSessions.userId, users.id))
      .where(eq(checkoutSessions.id, id))
      .limit(1)

    if (!result[0]) return null

    return {
      ...result[0].session,
      user: result[0].user,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Checkout Session
  // ─────────────────────────────────────────────────────────────────────────────

  async updateCheckoutSession(id: string, data: {
    status?: CheckoutSessionStatus
    stripePaymentIntentId?: string
    completedAt?: Date
  }) {
    const [result] = await db
      .update(checkoutSessions)
      .set(data)
      .where(eq(checkoutSessions.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Checkout History
  // ─────────────────────────────────────────────────────────────────────────────

  async getCheckoutHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const items = await db
      .select()
      .from(checkoutSessions)
      .where(eq(checkoutSessions.userId, userId))
      .orderBy(desc(checkoutSessions.createdAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(checkoutSessions)
      .where(eq(checkoutSessions.userId, userId))

    const total = totalResult?.count ?? 0

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }

    return { items, meta }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Cancellation Feedback
  // ─────────────────────────────────────────────────────────────────────────────

  async createCancellationFeedback(data: {
    userId: string
    subscriptionId: string
    tier: UserSubscriptionTier
    reason: CancellationReason
    feedback?: string
  }) {
    const [result] = await db
      .insert(cancellationFeedback)
      .values(data)
      .returning()

    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Refund Request
  // ─────────────────────────────────────────────────────────────────────────────

  async createRefundRequest(data: {
    userId: string
    subscriptionId: string
    amount: number
    reason: string
    case: 'TECHNICAL_ISSUE' | 'DUPLICATE_CHARGE' | 'FRAUD' | 'FIRST_TIME_USER' | 'OTHER'
  }) {
    const [result] = await db
      .insert(refundRequests)
      .values({
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        amount: data.amount,
        reason: data.reason,
        case: data.case,
        status: 'PENDING',
      })
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Refund Request
  // ─────────────────────────────────────────────────────────────────────────────

  async getRefundRequest(id: string) {
    const result = await db
      .select({
        request: refundRequests,
        user: {
          id: users.id,
          email: users.email,
          username: users.username,
        },
      })
      .from(refundRequests)
      .innerJoin(users, eq(refundRequests.userId, users.id))
      .where(eq(refundRequests.id, id))
      .limit(1)

    if (!result[0]) return null

    return {
      ...result[0].request,
      user: result[0].user,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Refund Request
  // ─────────────────────────────────────────────────────────────────────────────

  async updateRefundRequest(id: string, data: {
    status?: RefundStatus
    reviewedAt?: Date
    rejectionReason?: string
  }) {
    const [result] = await db
      .update(refundRequests)
      .set(data)
      .where(eq(refundRequests.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Refund Requests
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserRefundRequests(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const items = await db
      .select()
      .from(refundRequests)
      .where(eq(refundRequests.userId, userId))
      .orderBy(desc(refundRequests.createdAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(refundRequests)
      .where(eq(refundRequests.userId, userId))

    const total = totalResult?.count ?? 0

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }

    return { items, meta }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update User Premium Status
  // ─────────────────────────────────────────────────────────────────────────────

  async updateUserSubscriptionTier(userId: string, tier: UserSubscriptionTier, expiresAt?: Date) {
    const [result] = await db
      .update(users)
      .set({
        subscriptionTier: tier,
        subscriptionExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Tier Pricing
  // ─────────────────────────────────────────────────────────────────────────────

  getTierPricing() {
    // Static pricing - in production, this could come from config or database
    return {
      FREE: { monthly: 0, yearly: 0, features: ['Basic polls', 'Limited responses'] },
      PLUS: { monthly: 999, yearly: 9990, features: ['Unlimited polls', 'More responses', 'Basic analytics'] },
      PREMIUM: { monthly: 2999, yearly: 29990, features: ['All features', 'Priority support', 'Advanced analytics'] },
    }
  }
}

// Export singleton
export const paymentRepository = new PaymentRepositoryClass()

// Export class for testing
export { PaymentRepositoryClass as PaymentRepository }
