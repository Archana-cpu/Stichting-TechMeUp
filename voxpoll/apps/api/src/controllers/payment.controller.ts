// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PAYMENT CONTROLLER
// HTTP request/response handling for payment operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { paymentService } from '../services/payment.service'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Payment Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class PaymentControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /payments/subscription - Get subscription status
  // ─────────────────────────────────────────────────────────────────────────────

  async getSubscription(c: Context<AppEnv>) {
    const userId = c.get('userId')!

    const result = await paymentService.getSubscription(userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /payments/plans - Get available plans
  // ─────────────────────────────────────────────────────────────────────────────

  async getPlans(c: Context<AppEnv>) {
    const result = await paymentService.getPlans()

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /payments/checkout - Create checkout session
  // ─────────────────────────────────────────────────────────────────────────────

  async createCheckout(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const input = c.req.valid('json' as never)

    const result = await paymentService.createCheckout(userId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /payments/cancel - Cancel subscription
  // ─────────────────────────────────────────────────────────────────────────────

  async cancelSubscription(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const input = c.req.valid('json' as never)

    const result = await paymentService.cancelSubscription(userId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /payments/resume - Resume subscription
  // ─────────────────────────────────────────────────────────────────────────────

  async resumeSubscription(c: Context<AppEnv>) {
    const userId = c.get('userId')!

    const result = await paymentService.resumeSubscription(userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /payments/refund - Request refund
  // ─────────────────────────────────────────────────────────────────────────────

  async requestRefund(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const input = c.req.valid('json' as never)

    const result = await paymentService.requestRefund(userId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /payments/history - Get payment history
  // ─────────────────────────────────────────────────────────────────────────────

  async getPaymentHistory(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const result = await paymentService.getPaymentHistory(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /payments/webhook - Handle webhook
  // ─────────────────────────────────────────────────────────────────────────────

  async handleWebhook(c: Context<AppEnv>) {
    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET']

    // CRITICAL: Verify webhook signature in production
    if (!webhookSecret) {
      // Development mode - allow without signature (with warning)
      if (process.env['NODE_ENV'] === 'production') {
        console.error('[SECURITY] STRIPE_WEBHOOK_SECRET is not configured!')
        return c.json({ error: 'Webhook not configured' }, 500)
      }
      console.warn('[DEV] Webhook signature verification skipped - set STRIPE_WEBHOOK_SECRET')
      const event = await c.req.json()
      const result = await paymentService.processWebhook(event)
      return c.json(result)
    }

    // Production: Verify Stripe signature
    const signature = c.req.header('stripe-signature')
    if (!signature) {
      return c.json({ error: 'Missing stripe-signature header' }, 400)
    }

    // Get raw body for signature verification
    const rawBody = await c.req.text()

    try {
      // Verify signature using crypto (Stripe signature format: t=timestamp,v1=signature)
      const crypto = await import('crypto')
      const parts = signature.split(',')
      const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1]
      const signatureHash = parts.find(p => p.startsWith('v1='))?.split('=')[1]

      if (!timestamp || !signatureHash) {
        return c.json({ error: 'Invalid signature format' }, 400)
      }

      // Check timestamp tolerance (5 minutes)
      const timestampMs = parseInt(timestamp, 10) * 1000
      const tolerance = 5 * 60 * 1000 // 5 minutes
      if (Math.abs(Date.now() - timestampMs) > tolerance) {
        return c.json({ error: 'Webhook timestamp too old' }, 400)
      }

      // Compute expected signature
      const signedPayload = `${timestamp}.${rawBody}`
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex')

      // Compare signatures using timing-safe comparison
      const signatureBuffer = Buffer.from(signatureHash, 'hex')
      const expectedBuffer = Buffer.from(expectedSignature, 'hex')

      if (signatureBuffer.length !== expectedBuffer.length ||
          !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
        console.error('[SECURITY] Invalid webhook signature')
        return c.json({ error: 'Invalid signature' }, 400)
      }

      // Signature valid - process event
      const event = JSON.parse(rawBody)
      const result = await paymentService.processWebhook(event)
      return c.json(result)

    } catch (err) {
      console.error('[SECURITY] Webhook signature verification failed:', err)
      return c.json({ error: 'Signature verification failed' }, 400)
    }
  }
}

// Export singleton
export const paymentController = new PaymentControllerClass()

// Export class for testing
export { PaymentControllerClass as PaymentController }
