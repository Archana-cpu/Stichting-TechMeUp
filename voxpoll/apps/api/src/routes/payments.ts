// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PAYMENT ROUTES
// Route definitions for payment endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth } from '../middleware/auth'
import { paymentController } from '../controllers/payment.controller'
import { createCheckoutSchema } from '../validators/payment.validators'
import type { AppEnv } from '../types'

export const paymentRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes (no auth)
// ─────────────────────────────────────────────────────────────────────────────

// GET /payments/plans - Get available plans
paymentRoutes.get('/plans', (c) => paymentController.getPlans(c))

// POST /payments/webhook - Handle webhook (no auth, verified by signature)
paymentRoutes.post('/webhook', (c) => paymentController.handleWebhook(c))

// ─────────────────────────────────────────────────────────────────────────────
// Protected Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /payments/subscription - Get subscription status
paymentRoutes.get('/subscription', auth, (c) => paymentController.getSubscription(c))

// POST /payments/checkout - Create checkout session
paymentRoutes.post(
  '/checkout',
  auth,
  zValidator('json', createCheckoutSchema),
  (c) => paymentController.createCheckout(c)
)

// POST /payments/cancel - Cancel subscription
paymentRoutes.post('/cancel', auth, (c) => paymentController.cancelSubscription(c))

// POST /payments/resume - Resume subscription
paymentRoutes.post('/resume', auth, (c) => paymentController.resumeSubscription(c))

// GET /payments/history - Get payment history
paymentRoutes.get('/history', auth, (c) => paymentController.getPaymentHistory(c))
