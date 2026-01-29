// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PAYMENT VALIDATORS
// Zod validation schemas for payment endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Enums (matching Drizzle schema)
// ─────────────────────────────────────────────────────────────────────────────

export const subscriptionTierSchema = z.enum(['FREE', 'PLUS', 'PREMIUM'])
export const billingPeriodSchema = z.enum(['MONTHLY', 'YEARLY'])
export const cancellationReasonSchema = z.enum([
  'TOO_EXPENSIVE',
  'MISSING_FEATURES',
  'SWITCHING_SERVICE',
  'TEMPORARY_PAUSE',
  'OTHER',
])
export const refundCaseSchema = z.enum([
  'TECHNICAL_ISSUE',
  'DUPLICATE_CHARGE',
  'FRAUD',
  'FIRST_TIME_USER',
  'OTHER',
])

// ─────────────────────────────────────────────────────────────────────────────
// Create Checkout Schema
// ─────────────────────────────────────────────────────────────────────────────

export const createCheckoutSchema = z.object({
  tier: subscriptionTierSchema.refine(
    (tier) => tier !== 'FREE',
    { message: 'Cannot checkout for free tier' }
  ),
  billingPeriod: billingPeriodSchema,
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
})

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Cancel Subscription Schema
// ─────────────────────────────────────────────────────────────────────────────

export const cancelSubscriptionSchema = z.object({
  reason: cancellationReasonSchema,
  feedback: z
    .string()
    .max(500, 'Feedback must be at most 500 characters')
    .optional(),
  immediately: z.boolean().optional().default(false),
})

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Request Refund Schema
// ─────────────────────────────────────────────────────────────────────────────

export const requestRefundSchema = z.object({
  case: refundCaseSchema,
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be at most 500 characters'),
})

export type RequestRefundInput = z.infer<typeof requestRefundSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Webhook Event Schema (basic validation)
// ─────────────────────────────────────────────────────────────────────────────

export const webhookEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
})

export type WebhookEventInput = z.infer<typeof webhookEventSchema>
