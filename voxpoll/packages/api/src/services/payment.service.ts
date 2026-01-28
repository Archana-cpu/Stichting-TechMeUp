// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PAYMENT SERVICE
// Business logic for payment operations (Stripe integration)
// ══════════════════════════════════════════════════════════════════════════════

import { type UserSubscriptionTier, type BillingPeriod, type CancellationReason, type RefundCase } from '@voxpoll/database'
import { paymentRepository } from '../repositories/payment.repository'
import { ApiError } from '../middleware/error-handler'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateCheckoutInput {
  tier: UserSubscriptionTier
  billingPeriod: BillingPeriod
  successUrl: string
  cancelUrl: string
}

export interface WebhookEvent {
  type: string
  data: {
    object: Record<string, unknown>
  }
}

export interface CancelSubscriptionInput {
  reason: CancellationReason
  feedback?: string
  immediately?: boolean
}

export interface RequestRefundInput {
  case: RefundCase
  reason: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment Service Class
// ─────────────────────────────────────────────────────────────────────────────

class PaymentServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Get Subscription Status
  // ─────────────────────────────────────────────────────────────────────────────

  async getSubscription(userId: string) {
    const subscription = await paymentRepository.getSubscriptionByUser(userId)

    if (!subscription) {
      return {
        hasSubscription: false,
        tier: 'FREE' as UserSubscriptionTier,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      }
    }

    return {
      hasSubscription: true,
      tier: subscription.tier,
      status: subscription.status,
      billingPeriod: subscription.billingPeriod,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Available Plans
  // ─────────────────────────────────────────────────────────────────────────────

  async getPlans() {
    const pricing = paymentRepository.getTierPricing()

    return [
      {
        id: 'FREE',
        name: 'Free',
        description: 'Basic features for getting started',
        monthlyPrice: pricing.FREE.monthly,
        yearlyPrice: pricing.FREE.yearly,
        features: pricing.FREE.features,
      },
      {
        id: 'PLUS',
        name: 'Plus',
        description: 'More features for growing needs',
        monthlyPrice: pricing.PLUS.monthly,
        yearlyPrice: pricing.PLUS.yearly,
        features: pricing.PLUS.features,
      },
      {
        id: 'PREMIUM',
        name: 'Premium',
        description: 'Full access for professionals',
        monthlyPrice: pricing.PREMIUM.monthly,
        yearlyPrice: pricing.PREMIUM.yearly,
        features: pricing.PREMIUM.features,
      },
    ]
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Checkout Session
  // ─────────────────────────────────────────────────────────────────────────────

  async createCheckout(userId: string, input: CreateCheckoutInput) {
    // Check if user already has active subscription at same or higher tier
    const existing = await paymentRepository.getSubscriptionByUser(userId)
    if (existing && existing.status === 'ACTIVE') {
      const tierOrder: Record<UserSubscriptionTier, number> = { FREE: 0, PLUS: 1, PREMIUM: 2 }
      if (tierOrder[existing.tier] >= tierOrder[input.tier]) {
        throw ApiError.conflict('Already subscribed to this tier or higher', 'ALREADY_SUBSCRIBED')
      }
    }

    // Get pricing
    const pricing = paymentRepository.getTierPricing()
    const tierPricing = pricing[input.tier]
    if (!tierPricing || input.tier === 'FREE') {
      throw ApiError.badRequest('Invalid subscription tier', 'INVALID_TIER')
    }

    const price = input.billingPeriod === 'YEARLY' ? tierPricing.yearly : tierPricing.monthly

    // Create checkout session
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    const session = await paymentRepository.createCheckoutSession({
      userId,
      tier: input.tier,
      billingPeriod: input.billingPeriod ?? 'MONTHLY',
      subtotal: price,
      discount: 0,
      tax: 0,
      total: price,
      expiresAt,
    })

    if (!session) {
      throw ApiError.internal('Failed to create checkout session', 'SESSION_CREATE_FAILED')
    }

    // In production, integrate with Stripe:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const stripeSession = await stripe.checkout.sessions.create({...})

    return {
      sessionId: session.id,
      checkoutUrl: `${input.successUrl}?session_id=${session.id}`,
      expiresAt: session.expiresAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Cancel Subscription
  // ─────────────────────────────────────────────────────────────────────────────

  async cancelSubscription(userId: string, input: CancelSubscriptionInput) {
    const subscription = await paymentRepository.getSubscriptionByUser(userId)

    if (!subscription) {
      throw ApiError.notFound('No active subscription', 'NO_SUBSCRIPTION')
    }

    if (subscription.status === 'CANCELED') {
      throw ApiError.badRequest('Subscription already canceled', 'ALREADY_CANCELED')
    }

    // Record cancellation feedback
    await paymentRepository.createCancellationFeedback({
      userId,
      subscriptionId: subscription.id,
      tier: subscription.tier,
      reason: input.reason,
      feedback: input.feedback,
    })

    // In production, integrate with Stripe:
    // await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    //   cancel_at_period_end: !input.immediately
    // })

    if (input.immediately) {
      await paymentRepository.updateSubscription(subscription.id, {
        status: 'CANCELED',
        canceledAt: new Date(),
      })

      await paymentRepository.updateUserSubscriptionTier(userId, 'FREE')

      return { canceled: true, effectiveDate: new Date() }
    }

    await paymentRepository.updateSubscription(subscription.id, {
      cancelAtPeriodEnd: true,
    })

    return {
      canceled: false,
      cancelAtPeriodEnd: true,
      effectiveDate: subscription.currentPeriodEnd,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Resume Subscription (undo cancellation)
  // ─────────────────────────────────────────────────────────────────────────────

  async resumeSubscription(userId: string) {
    const subscription = await paymentRepository.getSubscriptionByUser(userId)

    if (!subscription) {
      throw ApiError.notFound('No subscription found', 'NO_SUBSCRIPTION')
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw ApiError.badRequest('Subscription is not set to cancel', 'NOT_CANCELING')
    }

    // In production, integrate with Stripe
    await paymentRepository.updateSubscription(subscription.id, {
      cancelAtPeriodEnd: false,
    })

    return { resumed: true }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Request Refund
  // ─────────────────────────────────────────────────────────────────────────────

  async requestRefund(userId: string, input: RequestRefundInput) {
    const subscription = await paymentRepository.getSubscriptionByUser(userId)

    if (!subscription) {
      throw ApiError.notFound('No subscription found', 'NO_SUBSCRIPTION')
    }

    // Check if subscription is recent (within 7 days for refund eligibility)
    const subscriptionAge = Date.now() - new Date(subscription.createdAt).getTime()
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    if (subscriptionAge > sevenDays) {
      throw ApiError.badRequest('Refund window has expired (7 days)', 'REFUND_WINDOW_EXPIRED')
    }

    const pricing = paymentRepository.getTierPricing()
    const tierPricing = pricing[subscription.tier]
    const amount = subscription.billingPeriod === 'YEARLY' ? tierPricing.yearly : tierPricing.monthly

    const refund = await paymentRepository.createRefundRequest({
      userId,
      subscriptionId: subscription.id,
      amount,
      reason: input.reason,
      case: input.case,
    })

    if (!refund) {
      throw ApiError.internal('Failed to create refund request', 'REFUND_CREATE_FAILED')
    }

    return {
      id: refund.id,
      status: refund.status,
      amount: refund.amount,
      createdAt: refund.createdAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Payment History (Checkout Sessions)
  // ─────────────────────────────────────────────────────────────────────────────

  async getPaymentHistory(userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const result = await paymentRepository.getCheckoutHistory(userId, page, limit)

    return {
      items: result.items.map((session) => ({
        id: session.id,
        tier: session.tier,
        billingPeriod: session.billingPeriod,
        amount: session.total,
        currency: session.currency,
        status: session.status,
        completedAt: session.completedAt,
        createdAt: session.createdAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Process Webhook
  // ─────────────────────────────────────────────────────────────────────────────

  async processWebhook(event: WebhookEvent) {
    const { type, data } = event
    const obj = data.object

    switch (type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(obj)
        break

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(obj)
        break

      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(obj)
        break

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(obj)
        break

      default:
        // Ignore unhandled events
        break
    }

    return { received: true }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Handle Subscription Update
  // ─────────────────────────────────────────────────────────────────────────────

  private async handleSubscriptionUpdate(obj: Record<string, unknown>) {
    const stripeSubscriptionId = obj['id'] as string
    const status = obj['status'] as string
    const currentPeriodStart = new Date((obj['current_period_start'] as number) * 1000)
    const currentPeriodEnd = new Date((obj['current_period_end'] as number) * 1000)
    const cancelAtPeriodEnd = obj['cancel_at_period_end'] as boolean

    const subscription = await paymentRepository.getSubscriptionByStripeId(stripeSubscriptionId)

    if (subscription) {
      const mappedStatus = this.mapStripeStatus(status)
      await paymentRepository.updateSubscription(subscription.id, {
        status: mappedStatus,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
      })

      // Update user subscription tier
      const isActive = ['ACTIVE', 'TRIALING'].includes(mappedStatus)
      if (isActive) {
        await paymentRepository.updateUserSubscriptionTier(
          subscription.user.id,
          subscription.tier,
          currentPeriodEnd
        )
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Handle Subscription Deleted
  // ─────────────────────────────────────────────────────────────────────────────

  private async handleSubscriptionDeleted(obj: Record<string, unknown>) {
    const stripeSubscriptionId = obj['id'] as string

    const subscription = await paymentRepository.getSubscriptionByStripeId(stripeSubscriptionId)

    if (subscription) {
      await paymentRepository.updateSubscription(subscription.id, {
        status: 'CANCELED',
        canceledAt: new Date(),
      })

      await paymentRepository.updateUserSubscriptionTier(subscription.user.id, 'FREE')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Handle Checkout Completed
  // ─────────────────────────────────────────────────────────────────────────────

  private async handleCheckoutCompleted(obj: Record<string, unknown>) {
    const sessionId = obj['client_reference_id'] as string
    const stripeSubscriptionId = obj['subscription'] as string
    const stripeCustomerId = obj['customer'] as string

    if (sessionId) {
      const session = await paymentRepository.getCheckoutSession(sessionId)

      if (session && session.status === 'PENDING') {
        // Update checkout session
        await paymentRepository.updateCheckoutSession(sessionId, {
          status: 'COMPLETED',
          completedAt: new Date(),
        })

        // Create or update subscription
        const currentPeriodEnd = new Date()
        if (session.billingPeriod === 'YEARLY') {
          currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
        } else {
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
        }

        await paymentRepository.upsertSubscription(session.userId, {
          tier: session.tier,
          billingPeriod: session.billingPeriod,
          stripeCustomerId,
          stripeSubscriptionId,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd,
        })

        // Update user tier
        await paymentRepository.updateUserSubscriptionTier(
          session.userId,
          session.tier,
          currentPeriodEnd
        )
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Handle Payment Failed
  // ─────────────────────────────────────────────────────────────────────────────

  private async handlePaymentFailed(obj: Record<string, unknown>) {
    const stripeCustomerId = obj['customer'] as string

    if (stripeCustomerId) {
      const subscription = await paymentRepository.getSubscriptionByStripeCustomerId(stripeCustomerId)

      if (subscription) {
        await paymentRepository.updateSubscription(subscription.id, {
          status: 'PAST_DUE',
        })
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Map Stripe Status
  // ─────────────────────────────────────────────────────────────────────────────

  private mapStripeStatus(stripeStatus: string): 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' {
    const statusMap: Record<string, 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE'> = {
      active: 'ACTIVE',
      trialing: 'TRIALING',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      incomplete: 'INCOMPLETE',
      unpaid: 'PAST_DUE', // Map unpaid to PAST_DUE
      paused: 'CANCELED', // Map paused to CANCELED
    }

    return statusMap[stripeStatus] || 'CANCELED'
  }
}

// Export singleton
export const paymentService = new PaymentServiceClass()

// Export class for testing
export { PaymentServiceClass as PaymentService }
