# ═══════════════════════════════════════════════════════════════════════════════
# FEATURES - Payment & Subscription System
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-024.md
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# PAYMENT SYSTEM OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT SYSTEM ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PAYMENT PROVIDERS:                                                             │
│  ──────────────────                                                             │
│  • Primary: Stripe (International)                                              │
│  • Turkey: Iyzico (Local cards, bank transfer)                                 │
│  • Both: Apple Pay, Google Pay via providers                                   │
│                                                                                 │
│  SUBSCRIPTION TIERS:                                                            │
│  ──────────────────                                                             │
│  ┌─────────────────┬─────────────────┬─────────────────┐                       │
│  │      FREE       │      PLUS       │    PREMIUM      │                       │
│  ├─────────────────┼─────────────────┼─────────────────┤                       │
│  │  $0/month       │  $4.99/month    │  $9.99/month    │                       │
│  │                 │  $49.99/year    │  $99.99/year    │                       │
│  │  Basic features │  Enhanced       │  All features   │                       │
│  └─────────────────┴─────────────────┴─────────────────┘                       │
│                                                                                 │
│  B2B ORGANIZATION TIERS:                                                        │
│  ───────────────────────                                                        │
│  ┌─────────────────┬─────────────────┬─────────────────┐                       │
│  │   STARTER       │  PROFESSIONAL   │   ENTERPRISE    │                       │
│  ├─────────────────┼─────────────────┼─────────────────┤                       │
│  │  $99/month      │  $299/month     │  Custom         │                       │
│  │  5 members      │  25 members     │  Unlimited      │                       │
│  │  10 surveys/mo  │  50 surveys/mo  │  Unlimited      │                       │
│  └─────────────────┴─────────────────┴─────────────────┘                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# SUBSCRIPTION PURCHASE FLOW
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       SUBSCRIPTION PURCHASE FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐                                                            │
│  │  User Clicks    │                                                            │
│  │  "Upgrade"      │                                                            │
│  └────────┬────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────┐                                                            │
│  │  Pricing Page   │ ◄── Shows all tiers with feature comparison                │
│  │  /pricing       │                                                            │
│  └────────┬────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────┐                                                            │
│  │  Select Tier    │ ◄── Plus or Premium                                        │
│  │  & Billing      │ ◄── Monthly or Annual (17% discount)                       │
│  └────────┬────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────┐     ┌──────────────────────────────────────────┐           │
│  │  Checkout Page  │────▶│  Payment Form                            │           │
│  │  /checkout      │     │  • Card number                           │           │
│  │                 │     │  • Expiry date                           │           │
│  │                 │     │  • CVC                                   │           │
│  │                 │     │  • Billing address (country required)    │           │
│  │                 │     │  • [Pay with Apple Pay] [Google Pay]     │           │
│  └────────┬────────┘     └──────────────────────────────────────────┘           │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────┐                                                            │
│  │  3D Secure      │ ◄── If required by card issuer                            │
│  │  Verification   │                                                            │
│  └────────┬────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────┐     ┌──────────────────────────────────────────┐           │
│  │  Payment        │────▶│  Success Screen                          │           │
│  │  Processing     │     │  • "Welcome to Plus/Premium!"            │           │
│  │                 │     │  • Features now unlocked                 │           │
│  │                 │     │  • Next billing date                     │           │
│  │                 │     │  • [Explore New Features]                │           │
│  └─────────────────┘     └──────────────────────────────────────────┘           │
│                                                                                 │
│  POST-PURCHASE ACTIONS:                                                          │
│  ─────────────────────                                                          │
│  1. Email: "Welcome to VoxPoll Plus/Premium"                                    │
│  2. In-app: Features immediately activated                                       │
│  3. Analytics: Track conversion event                                           │
│  4. Database: Update user.subscriptionTier                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Pricing Page Schema

```typescript
interface PricingTier {
  id: 'FREE' | 'PLUS' | 'PREMIUM'
  name: string
  description: string
  monthlyPrice: number          // In cents (0, 499, 999)
  yearlyPrice: number           // In cents (0, 4999, 9999)
  yearlyDiscount: string        // "17% off" display
  currency: 'USD' | 'TRY'
  features: PricingFeature[]
  highlighted: boolean          // PLUS is highlighted (recommended)
  ctaText: string               // "Start Free", "Upgrade to Plus", etc.
}

interface PricingFeature {
  name: string
  included: boolean
  limit?: string                // "3/day", "Unlimited", etc.
  tooltip?: string
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'FREE',
    name: 'Free',
    description: 'Temel ozellikler ile baslayin',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscount: '',
    currency: 'USD',
    highlighted: false,
    ctaText: 'Mevcut Plan',
    features: [
      { name: 'Anket olusturma', included: true, limit: '3/gun' },
      { name: 'Test olusturma', included: true, limit: '3/hafta' },
      { name: 'Sonuc goruntuleme', included: true },
      { name: 'COMMENTS tartisma (katilim sonrasi)', included: true },
      { name: 'Profil ziyareti gorme', included: false },
      { name: 'Katilmadan PULSE/COMMENTS erisimi', included: false },
      { name: 'Canli anket olusturma', included: false },
      { name: 'On test ekleme', included: false },
    ]
  },
  {
    id: 'PLUS',
    name: 'Plus',
    description: 'Daha fazla icerik, daha fazla etkilesim',
    monthlyPrice: 499,
    yearlyPrice: 4999,
    yearlyDiscount: '17% indirim',
    currency: 'USD',
    highlighted: true,           // Recommended tier
    ctaText: 'Plus\'a Yukselt',
    features: [
      { name: 'Anket olusturma', included: true, limit: '10/gun' },
      { name: 'Test olusturma', included: true, limit: '10/hafta' },
      { name: 'Sonuc goruntuleme', included: true },
      { name: 'COMMENTS tartisma (katilim sonrasi)', included: true },
      { name: 'Profil ziyareti gorme', included: true, limit: 'Son 30 gun' },
      { name: 'Katilmadan PULSE/COMMENTS erisimi', included: true },
      { name: 'Canli anket olusturma', included: false },
      { name: 'On test ekleme', included: false },
      { name: 'Genisletilmis secenekler (6)', included: true },
      { name: 'DM limiti', included: true, limit: '25/gun' },
    ]
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    description: 'Profesyoneller icin tam ozellik seti',
    monthlyPrice: 999,
    yearlyPrice: 9999,
    yearlyDiscount: '17% indirim',
    currency: 'USD',
    highlighted: false,
    ctaText: 'Premium\'a Yukselt',
    features: [
      { name: 'Anket olusturma', included: true, limit: 'Sinirsiz' },
      { name: 'Test olusturma', included: true, limit: 'Sinirsiz' },
      { name: 'Sonuc goruntuleme', included: true },
      { name: 'COMMENTS tartisma (katilim sonrasi)', included: true },
      { name: 'Profil ziyareti gorme', included: true, limit: 'Tum zaman' },
      { name: 'Katilmadan PULSE/COMMENTS erisimi', included: true },
      { name: 'Canli anket olusturma', included: true },
      { name: 'On test ekleme', included: true },
      { name: 'Genisletilmis secenekler (10)', included: true },
      { name: 'DM limiti', included: true, limit: 'Sinirsiz' },
      { name: 'Gelismis analitik', included: true },
      { name: 'Oncelikli destek', included: true },
    ]
  }
]

export { PRICING_TIERS }
export type { PricingTier, PricingFeature }
```


## Checkout Flow Schema

```typescript
interface CheckoutSession {
  id: string
  userId: string
  tier: 'PLUS' | 'PREMIUM'
  billingPeriod: 'MONTHLY' | 'YEARLY'

  pricing: {
    subtotal: number            // In cents
    discount: number            // Annual discount amount
    tax: number                 // VAT if applicable
    total: number               // Final amount
    currency: 'USD' | 'TRY'
  }

  paymentMethod: {
    type: 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY'
    cardBrand?: string          // visa, mastercard, amex
    cardLast4?: string
    cardExpiry?: string         // MM/YY
  } | null

  billingAddress: {
    country: string             // ISO 3166-1 alpha-2
    postalCode?: string
    state?: string
    city?: string
    line1?: string
    line2?: string
  } | null

  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

  stripePaymentIntentId?: string
  iyzicoPaymentId?: string

  createdAt: Date
  completedAt?: Date
  expiresAt: Date               // 30 minutes from creation
}

// Checkout initiation
async function createCheckoutSession(
  userId: string,
  tier: 'PLUS' | 'PREMIUM',
  billingPeriod: 'MONTHLY' | 'YEARLY'
): Promise<CheckoutSession> {
  const pricing = calculatePricing(tier, billingPeriod)

  const session = await db.checkoutSession.create({
    data: {
      userId,
      tier,
      billingPeriod,
      pricing,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    }
  })

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: pricing.total,
    currency: pricing.currency.toLowerCase(),
    customer: await getOrCreateStripeCustomer(userId),
    metadata: {
      checkoutSessionId: session.id,
      tier,
      billingPeriod
    }
  })

  return {
    ...session,
    stripePaymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret
  }
}

function calculatePricing(
  tier: 'PLUS' | 'PREMIUM',
  billingPeriod: 'MONTHLY' | 'YEARLY'
): CheckoutSession['pricing'] {
  const prices = {
    PLUS: { monthly: 499, yearly: 4999 },
    PREMIUM: { monthly: 999, yearly: 9999 }
  }

  const basePrice = billingPeriod === 'MONTHLY'
    ? prices[tier].monthly
    : prices[tier].yearly

  const monthlyEquivalent = billingPeriod === 'MONTHLY'
    ? basePrice
    : Math.round(prices[tier].yearly / 12)

  const fullYearlyPrice = prices[tier].monthly * 12
  const discount = billingPeriod === 'YEARLY'
    ? fullYearlyPrice - prices[tier].yearly
    : 0

  // VAT calculation (Turkey: 18%, EU: varies, US: varies by state)
  const tax = 0  // Simplified - handled by Stripe Tax or Iyzico

  return {
    subtotal: basePrice,
    discount,
    tax,
    total: basePrice + tax,
    currency: 'USD'
  }
}

export { createCheckoutSession, calculatePricing }
export type { CheckoutSession }
```


## Payment Processing

```typescript
interface PaymentResult {
  success: boolean
  subscriptionId?: string
  error?: PaymentError
}

interface PaymentError {
  code: string
  message: string
  declineCode?: string
  retryable: boolean
}

// Handle Stripe webhook for payment completion
async function handlePaymentSuccess(
  paymentIntentId: string
): Promise<PaymentResult> {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  const { checkoutSessionId, tier, billingPeriod } = paymentIntent.metadata

  // Create or update subscription
  const subscription = await stripe.subscriptions.create({
    customer: paymentIntent.customer as string,
    items: [{ price: getPriceId(tier, billingPeriod) }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      payment_method_types: ['card'],
      save_default_payment_method: 'on_subscription'
    }
  })

  // Update user in database
  await db.user.update({
    where: { id: paymentIntent.metadata.userId },
    data: {
      subscriptionTier: tier,
      subscriptionId: subscription.id,
      subscriptionStatus: 'ACTIVE',
      subscriptionStartDate: new Date(),
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripeCustomerId: paymentIntent.customer as string
    }
  })

  // Update checkout session
  await db.checkoutSession.update({
    where: { id: checkoutSessionId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date()
    }
  })

  // Send confirmation email
  await sendSubscriptionConfirmationEmail({
    userId: paymentIntent.metadata.userId,
    tier,
    billingPeriod,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency
  })

  // Track analytics event
  await trackEvent('subscription_purchased', {
    userId: paymentIntent.metadata.userId,
    tier,
    billingPeriod,
    amount: paymentIntent.amount
  })

  return {
    success: true,
    subscriptionId: subscription.id
  }
}

// Handle payment failure
async function handlePaymentFailure(
  paymentIntentId: string
): Promise<PaymentResult> {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  const lastError = paymentIntent.last_payment_error

  const error: PaymentError = {
    code: lastError?.code || 'payment_failed',
    message: getPaymentErrorMessage(lastError?.code),
    declineCode: lastError?.decline_code,
    retryable: isRetryableError(lastError?.code)
  }

  // Update checkout session
  await db.checkoutSession.update({
    where: { id: paymentIntent.metadata.checkoutSessionId },
    data: { status: 'FAILED' }
  })

  return {
    success: false,
    error
  }
}

function getPaymentErrorMessage(code?: string): string {
  const messages: Record<string, string> = {
    card_declined: 'Kartiniz reddedildi. Lutfen baska bir kart deneyin.',
    insufficient_funds: 'Yetersiz bakiye. Lutfen bakiyenizi kontrol edin.',
    invalid_card_number: 'Gecersiz kart numarasi. Lutfen kontrol edin.',
    invalid_expiry_month: 'Gecersiz son kullanma tarihi.',
    invalid_expiry_year: 'Gecersiz son kullanma tarihi.',
    invalid_cvc: 'Gecersiz guvenlik kodu (CVC).',
    expired_card: 'Kartinizin suresi dolmus.',
    incorrect_cvc: 'Yanlis guvenlik kodu (CVC).',
    processing_error: 'Islem hatasi. Lutfen tekrar deneyin.',
    authentication_required: '3D Secure dogrulamasi gerekli.',
    default: 'Odeme islemi basarisiz. Lutfen tekrar deneyin.'
  }

  return messages[code || 'default'] || messages.default
}

function isRetryableError(code?: string): boolean {
  const retryableCodes = [
    'processing_error',
    'rate_limit',
    'lock_timeout'
  ]
  return retryableCodes.includes(code || '')
}

export { handlePaymentSuccess, handlePaymentFailure, getPaymentErrorMessage }
export type { PaymentResult, PaymentError }
```


## Post-Purchase Success Screen

```typescript
interface SubscriptionSuccessData {
  tier: 'PLUS' | 'PREMIUM'
  billingPeriod: 'MONTHLY' | 'YEARLY'
  nextBillingDate: Date
  amount: number
  currency: string
  newFeatures: string[]
}

function getNewFeatures(tier: 'PLUS' | 'PREMIUM', fromTier: 'FREE' | 'PLUS'): string[] {
  if (tier === 'PLUS') {
    return [
      'Gunde 10 anket olusturabilirsiniz',
      'Haftada 10 test olusturabilirsiniz',
      'Profil ziyaretlerinizi gorebilirsiniz',
      'Katilmadan COMMENTS tartismalarina erisebilirsiniz',
      '6 secenekli anketler olusturabilirsiniz',
      'Gunde 25 DM gonderebilirsiniz'
    ]
  }

  if (tier === 'PREMIUM' && fromTier === 'FREE') {
    return [
      'Sinirsiz anket ve test olusturabilirsiniz',
      'Canli anket duzenleyebilirsiniz',
      'Anketlerinize on test ekleyebilirsiniz',
      '10 secenekli anketler olusturabilirsiniz',
      'Sinirsiz DM gonderebilirsiniz',
      'Gelismis analitik paneline erisebilirsiniz',
      'Oncelikli destek alabilirsiniz'
    ]
  }

  // PLUS to PREMIUM
  return [
    'Sinirsiz anket ve test olusturabilirsiniz',
    'Canli anket duzenleyebilirsiniz',
    'Anketlerinize on test ekleyebilirsiniz',
    '10 secenekli anketler olusturabilirsiniz',
    'Sinirsiz DM gonderebilirsiniz',
    'Gelismis analitik paneline erisebilirsiniz',
    'Oncelikli destek alabilirsiniz'
  ]
}

export { getNewFeatures }
export type { SubscriptionSuccessData }
```



# ═══════════════════════════════════════════════════════════════════════════════
# SUBSCRIPTION MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════

## Subscription Dashboard UI

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       SUBSCRIPTION MANAGEMENT UI                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SETTINGS > SUBSCRIPTION                                                         │
│  ─────────────────────                                                          │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Current Plan: PREMIUM                                                   │   │
│  │  ─────────────────────────────────────────────────────────────────────   │   │
│  │                                                                         │   │
│  │  Status: Active                                                          │   │
│  │  Billing Period: Monthly                                                 │   │
│  │  Next Billing: February 22, 2026                                         │   │
│  │  Amount: $9.99/month                                                     │   │
│  │                                                                         │   │
│  │  [Change Plan]  [Switch to Annual (Save 17%)]                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  PAYMENT METHOD                                                                  │
│  ─────────────────                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  **** **** **** 4242                                                     │   │
│  │  Visa  |  Expires 12/27                                                  │   │
│  │                                                                         │   │
│  │  [Update Payment Method]                                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  BILLING HISTORY                                                                 │
│  ─────────────────                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Date          Description           Amount       Receipt               │   │
│  │  ────────────────────────────────────────────────────────────────────   │   │
│  │  Jan 22, 2026  Premium Monthly       $9.99        [Download]            │   │
│  │  Dec 22, 2025  Premium Monthly       $9.99        [Download]            │   │
│  │  Nov 22, 2025  Plus Monthly          $4.99        [Download]            │   │
│  │  ...                                                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│  [Cancel Subscription]                                                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Subscription Data Model

```typescript
interface UserSubscription {
  userId: string

  // Current status
  tier: 'FREE' | 'PLUS' | 'PREMIUM'
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'

  // Billing details
  billingPeriod: 'MONTHLY' | 'YEARLY' | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean

  // Payment provider references
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  iyzicoCustomerId: string | null

  // Payment method
  paymentMethod: {
    type: 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY'
    brand: string             // visa, mastercard, etc.
    last4: string
    expiryMonth: number
    expiryYear: number
  } | null

  // History
  createdAt: Date
  updatedAt: Date
  canceledAt: Date | null
}

// Fetch subscription details
async function getSubscriptionDetails(userId: string): Promise<SubscriptionDetails> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionId: true,
      stripeCustomerId: true,
      subscriptionCurrentPeriodEnd: true
    }
  })

  if (!user.stripeCustomerId || !user.subscriptionId) {
    return {
      tier: 'FREE',
      status: 'ACTIVE',
      billingPeriod: null,
      nextBillingDate: null,
      paymentMethod: null,
      canUpgrade: true,
      canDowngrade: false,
      canCancel: false
    }
  }

  // Fetch from Stripe for latest info
  const subscription = await stripe.subscriptions.retrieve(user.subscriptionId)
  const paymentMethod = subscription.default_payment_method
    ? await stripe.paymentMethods.retrieve(subscription.default_payment_method as string)
    : null

  return {
    tier: user.subscriptionTier,
    status: mapStripeStatus(subscription.status),
    billingPeriod: subscription.items.data[0].price.recurring?.interval === 'year'
      ? 'YEARLY'
      : 'MONTHLY',
    nextBillingDate: new Date(subscription.current_period_end * 1000),
    amount: subscription.items.data[0].price.unit_amount,
    currency: subscription.currency.toUpperCase(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    paymentMethod: paymentMethod ? {
      type: 'CARD',
      brand: paymentMethod.card?.brand || 'unknown',
      last4: paymentMethod.card?.last4 || '****',
      expiryMonth: paymentMethod.card?.exp_month || 0,
      expiryYear: paymentMethod.card?.exp_year || 0
    } : null,
    canUpgrade: user.subscriptionTier !== 'PREMIUM',
    canDowngrade: user.subscriptionTier !== 'FREE',
    canCancel: user.subscriptionTier !== 'FREE'
  }
}

interface SubscriptionDetails {
  tier: 'FREE' | 'PLUS' | 'PREMIUM'
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'
  billingPeriod: 'MONTHLY' | 'YEARLY' | null
  nextBillingDate: Date | null
  amount?: number
  currency?: string
  cancelAtPeriodEnd?: boolean
  paymentMethod: {
    type: string
    brand: string
    last4: string
    expiryMonth: number
    expiryYear: number
  } | null
  canUpgrade: boolean
  canDowngrade: boolean
  canCancel: boolean
}

export { getSubscriptionDetails }
export type { UserSubscription, SubscriptionDetails }
```



# ═══════════════════════════════════════════════════════════════════════════════
# SUBSCRIPTION UPGRADE FLOW
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       SUBSCRIPTION UPGRADE FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  UPGRADE PATHS:                                                                  │
│  ─────────────                                                                  │
│  • Free -> Plus                                                                  │
│  • Free -> Premium                                                               │
│  • Plus -> Premium                                                               │
│                                                                                 │
│  PRORATION:                                                                      │
│  ──────────                                                                     │
│  When upgrading mid-cycle, user pays:                                           │
│  • Prorated amount for remaining days at new tier                               │
│  • Credit for unused days at old tier (if paid)                                 │
│                                                                                 │
│  EXAMPLE (Plus -> Premium, day 15 of 30-day month):                              │
│  ───────────────────────────────────────────────────────────────────────────    │
│  • Remaining days: 15                                                           │
│  • Plus daily rate: $4.99 / 30 = $0.166                                        │
│  • Premium daily rate: $9.99 / 30 = $0.333                                     │
│  • Credit for unused Plus: 15 x $0.166 = $2.49                                  │
│  • Cost for Premium remaining: 15 x $0.333 = $5.00                              │
│  • Amount due today: $5.00 - $2.49 = $2.51                                      │
│  • Next full billing: $9.99 on original billing date                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
interface UpgradePreview {
  currentTier: 'FREE' | 'PLUS'
  newTier: 'PLUS' | 'PREMIUM'
  immediateCharge: number       // Prorated amount due today
  credit: number                // Credit from unused current plan
  nextBillingAmount: number     // Full amount at next cycle
  nextBillingDate: Date
  effectiveImmediately: boolean
}

async function previewUpgrade(
  userId: string,
  newTier: 'PLUS' | 'PREMIUM'
): Promise<UpgradePreview> {
  const currentSubscription = await getSubscriptionDetails(userId)

  if (currentSubscription.tier === 'FREE') {
    // No proration for free users
    const price = newTier === 'PLUS' ? 499 : 999
    return {
      currentTier: 'FREE',
      newTier,
      immediateCharge: price,
      credit: 0,
      nextBillingAmount: price,
      nextBillingDate: addMonths(new Date(), 1),
      effectiveImmediately: true
    }
  }

  // Fetch Stripe proration preview
  const subscription = await stripe.subscriptions.retrieve(
    currentSubscription.stripeSubscriptionId
  )

  const prorationPreview = await stripe.invoices.retrieveUpcoming({
    customer: currentSubscription.stripeCustomerId,
    subscription: subscription.id,
    subscription_items: [{
      id: subscription.items.data[0].id,
      price: getPriceId(newTier, currentSubscription.billingPeriod)
    }],
    subscription_proration_behavior: 'create_prorations'
  })

  return {
    currentTier: currentSubscription.tier as 'PLUS',
    newTier,
    immediateCharge: prorationPreview.amount_due,
    credit: Math.abs(prorationPreview.lines.data
      .filter(line => line.amount < 0)
      .reduce((sum, line) => sum + line.amount, 0)),
    nextBillingAmount: newTier === 'PREMIUM' ? 999 : 499,
    nextBillingDate: new Date(subscription.current_period_end * 1000),
    effectiveImmediately: true
  }
}

async function executeUpgrade(
  userId: string,
  newTier: 'PLUS' | 'PREMIUM'
): Promise<{ success: boolean; error?: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      stripeCustomerId: true,
      subscriptionId: true
    }
  })

  // Validate upgrade path
  if (user.subscriptionTier === 'PREMIUM') {
    return { success: false, error: 'Already on Premium tier' }
  }
  if (user.subscriptionTier === 'PLUS' && newTier === 'PLUS') {
    return { success: false, error: 'Already on Plus tier' }
  }

  try {
    if (user.subscriptionTier === 'FREE') {
      // Create new subscription
      return await createNewSubscription(userId, newTier)
    }

    // Upgrade existing subscription
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId)

    await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: subscription.items.data[0].id,
        price: getPriceId(newTier, 'MONTHLY') // Keep same billing period
      }],
      proration_behavior: 'create_prorations'
    })

    // Update database
    await db.user.update({
      where: { id: userId },
      data: { subscriptionTier: newTier }
    })

    // Send confirmation email
    await sendUpgradeConfirmationEmail(userId, newTier)

    // Track analytics
    await trackEvent('subscription_upgraded', {
      userId,
      fromTier: user.subscriptionTier,
      toTier: newTier
    })

    return { success: true }

  } catch (error) {
    console.error('Upgrade failed:', error)
    return { success: false, error: 'Upgrade failed. Please try again.' }
  }
}

export { previewUpgrade, executeUpgrade }
export type { UpgradePreview }
```



# ═══════════════════════════════════════════════════════════════════════════════
# SUBSCRIPTION DOWNGRADE FLOW
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       SUBSCRIPTION DOWNGRADE FLOW                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [DECISION P-037] Subscription Downgrade Policy                                 │
│                                                                                 │
│  DOWNGRADE PATHS:                                                               │
│  ────────────────                                                               │
│  • Premium -> Plus                                                               │
│  • Premium -> Free                                                               │
│  • Plus -> Free                                                                  │
│                                                                                 │
│  TIMING:                                                                         │
│  ───────                                                                        │
│  • Downgrade takes effect at END of current billing period                      │
│  • User retains all features until period ends                                  │
│  • No prorated refunds                                                          │
│                                                                                 │
│  DATA PRESERVATION:                                                              │
│  ──────────────────                                                             │
│  • All existing content remains accessible                                       │
│  • Analytics history preserved                                                   │
│  • Premium features (live polls, pre-tests) become read-only                    │
│  • New content subject to new tier limits                                       │
│                                                                                 │
│  SPECIAL HANDLING:                                                               │
│  ─────────────────                                                              │
│  • Active live polls: Allowed to complete, then feature disabled                │
│  • Scheduled polls with pre-test: Remain scheduled, then disabled               │
│  • DM conversations: Preserved, new DMs subject to new limits                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
interface DowngradePreview {
  currentTier: 'PLUS' | 'PREMIUM'
  newTier: 'FREE' | 'PLUS'
  effectiveDate: Date           // End of current billing period
  featuresLosing: string[]
  dataPreservation: string[]
  activeLivePollsCount: number
  scheduledContentWithPreTest: number
}

async function previewDowngrade(
  userId: string,
  newTier: 'FREE' | 'PLUS'
): Promise<DowngradePreview> {
  const currentSubscription = await getSubscriptionDetails(userId)

  // Count active features that will be affected
  const activeLivePolls = await db.liveSession.count({
    where: {
      hostId: userId,
      status: { in: ['WAITING', 'ACTIVE', 'PAUSED'] }
    }
  })

  const scheduledWithPreTest = await db.poll.count({
    where: {
      creatorId: userId,
      status: 'SCHEDULED',
      preTestId: { not: null }
    }
  })

  const featuresLosing = getFeatureDifference(currentSubscription.tier, newTier)

  return {
    currentTier: currentSubscription.tier as 'PLUS' | 'PREMIUM',
    newTier,
    effectiveDate: currentSubscription.nextBillingDate,
    featuresLosing,
    dataPreservation: [
      'Tum icerikleriniz erisilebilir kalacak',
      'Analitik gecmisiniz korunacak',
      'Mevcut sohbetleriniz silinmeyecek'
    ],
    activeLivePollsCount: activeLivePolls,
    scheduledContentWithPreTest: scheduledWithPreTest
  }
}

function getFeatureDifference(
  currentTier: 'PLUS' | 'PREMIUM',
  newTier: 'FREE' | 'PLUS'
): string[] {
  if (currentTier === 'PREMIUM' && newTier === 'FREE') {
    return [
      'Canli anket olusturma',
      'On test ekleme',
      'Sinirsiz icerik olusturma',
      '10 secenekli anketler',
      'Sinirsiz DM',
      'Gelismis analitik',
      'Oncelikli destek',
      'Katilmadan PULSE/COMMENTS erisimi',
      'Profil ziyareti gorme'
    ]
  }

  if (currentTier === 'PREMIUM' && newTier === 'PLUS') {
    return [
      'Canli anket olusturma',
      'On test ekleme',
      'Sinirsiz icerik olusturma (10/gun limiti olacak)',
      '10 secenekli anketler (6 limite dusecek)',
      'Sinirsiz DM (25/gun limite dusecek)',
      'Gelismis analitik',
      'Oncelikli destek'
    ]
  }

  // Plus -> Free
  return [
    'Gunde 10 anket (3\'e dusecek)',
    'Haftada 10 test (3\'e dusecek)',
    '6 secenekli anketler (4\'e dusecek)',
    '25 DM/gun (5\'e dusecek)',
    'Katilmadan PULSE/COMMENTS erisimi',
    'Profil ziyareti gorme'
  ]
}

async function executeDowngrade(
  userId: string,
  newTier: 'FREE' | 'PLUS'
): Promise<{ success: boolean; effectiveDate: Date; error?: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionId: true
    }
  })

  // Validate downgrade path
  if (user.subscriptionTier === 'FREE') {
    return { success: false, effectiveDate: new Date(), error: 'Already on Free tier' }
  }

  try {
    if (newTier === 'FREE') {
      // Cancel subscription at period end
      const subscription = await stripe.subscriptions.update(user.subscriptionId, {
        cancel_at_period_end: true
      })

      const effectiveDate = new Date(subscription.current_period_end * 1000)

      // Update database
      await db.user.update({
        where: { id: userId },
        data: {
          pendingTierChange: 'FREE',
          pendingTierChangeDate: effectiveDate
        }
      })

      // Send confirmation email
      await sendDowngradeScheduledEmail(userId, effectiveDate)

      return { success: true, effectiveDate }

    } else {
      // Downgrade to Plus (schedule for period end)
      const subscription = await stripe.subscriptions.retrieve(user.subscriptionId)

      await stripe.subscriptions.update(subscription.id, {
        items: [{
          id: subscription.items.data[0].id,
          price: getPriceId('PLUS', 'MONTHLY')
        }],
        proration_behavior: 'none',  // No refund
        billing_cycle_anchor: 'unchanged'
      })

      const effectiveDate = new Date(subscription.current_period_end * 1000)

      // Schedule the tier change
      await db.user.update({
        where: { id: userId },
        data: {
          pendingTierChange: 'PLUS',
          pendingTierChangeDate: effectiveDate
        }
      })

      return { success: true, effectiveDate }
    }

  } catch (error) {
    console.error('Downgrade failed:', error)
    return { success: false, effectiveDate: new Date(), error: 'Downgrade failed. Please try again.' }
  }
}

export { previewDowngrade, executeDowngrade, getFeatureDifference }
export type { DowngradePreview }
```



# ═══════════════════════════════════════════════════════════════════════════════
# SUBSCRIPTION CANCELLATION
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       SUBSCRIPTION CANCELLATION FLOW                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  USER CLICKS "Cancel Subscription"                                               │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  CANCELLATION CONFIRMATION MODAL                                         │    │
│  │  ─────────────────────────────────                                       │    │
│  │                                                                         │    │
│  │  "Aboneliginizi iptal etmek istediginizden emin misiniz?"               │    │
│  │                                                                         │    │
│  │  • Aboneliginiz 22 Subat 2026'ya kadar aktif kalacak                    │    │
│  │  • Bu tarihten sonra Free plana gececeksiniz                            │    │
│  │  • Tum icerikleriniz erisilebilir kalacak                               │    │
│  │                                                                         │    │
│  │  Kaybedecegininiz ozellikler:                                           │    │
│  │  X Canli anket olusturma                                                │    │
│  │  X Sinirsiz icerik                                                      │    │
│  │  X Gelismis analitik                                                    │    │
│  │                                                                         │    │
│  │  [Aboneligi Surdur]  [Iptal Et]                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│           │                                                                      │
│           ▼ (if "Iptal Et")                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  OPTIONAL: CANCELLATION REASON                                           │    │
│  │  ─────────────────────────────────                                       │    │
│  │                                                                         │    │
│  │  Iptal nedeninizi paylasir misiniz? (opsiyonel)                         │    │
│  │                                                                         │    │
│  │  o Cok pahali                                                           │    │
│  │  o Ihtiyacim olan ozellikleri bulamadim                                 │    │
│  │  o Baska bir servise geciyorum                                          │    │
│  │  o Gecici olarak kullanmiyorum                                          │    │
│  │  o Diger: [________________]                                            │    │
│  │                                                                         │    │
│  │  [Iptal Et ve Devam Et]                                                 │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  CANCELLATION CONFIRMED                                                  │    │
│  │  ────────────────────────                                                │    │
│  │                                                                         │    │
│  │  Aboneliginiz iptal edildi                                              │    │
│  │                                                                         │    │
│  │  Premium ozellikleriniz 22 Subat 2026'ya kadar aktif.                   │    │
│  │  Bu tarihten sonra Free plana gececeksiniz.                             │    │
│  │                                                                         │    │
│  │  Fikrinizi degistirirseniz, istediginiz zaman yeniden                    │    │
│  │  abone olabilirsiniz.                                                   │    │
│  │                                                                         │    │
│  │  [Tamam]                                                                 │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  POST-CANCELLATION:                                                              │
│  ──────────────────                                                             │
│  1. Email: "Aboneliginiz iptal edildi" confirmation                             │
│  2. Subscription status: CANCELED (but active until period end)                  │
│  3. Analytics: Track cancellation reason                                         │
│  4. At period end: Execute downgrade to Free tier                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
type CancellationReason =
  | 'TOO_EXPENSIVE'
  | 'MISSING_FEATURES'
  | 'SWITCHING_SERVICE'
  | 'TEMPORARY_PAUSE'
  | 'OTHER'

interface CancellationPreview {
  currentTier: 'PLUS' | 'PREMIUM'
  activeUntil: Date
  featuresLosing: string[]
  contentPreserved: boolean
}

interface CancellationResult {
  success: boolean
  activeUntil?: Date
  error?: string
}

async function previewCancellation(userId: string): Promise<CancellationPreview> {
  const subscription = await getSubscriptionDetails(userId)

  return {
    currentTier: subscription.tier as 'PLUS' | 'PREMIUM',
    activeUntil: subscription.nextBillingDate,
    featuresLosing: getFeatureDifference(subscription.tier as 'PLUS' | 'PREMIUM', 'FREE'),
    contentPreserved: true
  }
}

async function executeCancellation(
  userId: string,
  reason?: CancellationReason,
  feedback?: string
): Promise<CancellationResult> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionId: true,
      subscriptionTier: true
    }
  })

  if (!user.subscriptionId || user.subscriptionTier === 'FREE') {
    return { success: false, error: 'No active subscription to cancel' }
  }

  try {
    // Cancel at period end (no immediate cancellation, no refund)
    const subscription = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true
    })

    const activeUntil = new Date(subscription.current_period_end * 1000)

    // Update database
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'CANCELED',
        subscriptionCanceledAt: new Date(),
        pendingTierChange: 'FREE',
        pendingTierChangeDate: activeUntil
      }
    })

    // Record cancellation reason
    if (reason) {
      await db.cancellationFeedback.create({
        data: {
          userId,
          reason,
          feedback,
          tier: user.subscriptionTier,
          createdAt: new Date()
        }
      })
    }

    // Send confirmation email
    await sendCancellationConfirmationEmail(userId, activeUntil)

    // Track analytics
    await trackEvent('subscription_canceled', {
      userId,
      tier: user.subscriptionTier,
      reason,
      activeUntil: activeUntil.toISOString()
    })

    return {
      success: true,
      activeUntil
    }

  } catch (error) {
    console.error('Cancellation failed:', error)
    return { success: false, error: 'Cancellation failed. Please try again.' }
  }
}

// Reactivate a canceled subscription before it expires
async function reactivateSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionId: true,
      subscriptionStatus: true
    }
  })

  if (user.subscriptionStatus !== 'CANCELED') {
    return { success: false, error: 'Subscription is not in canceled state' }
  }

  try {
    // Remove cancellation
    await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: false
    })

    // Update database
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionCanceledAt: null,
        pendingTierChange: null,
        pendingTierChangeDate: null
      }
    })

    // Send reactivation email
    await sendReactivationConfirmationEmail(userId)

    return { success: true }

  } catch (error) {
    console.error('Reactivation failed:', error)
    return { success: false, error: 'Reactivation failed. Please try again.' }
  }
}

export { previewCancellation, executeCancellation, reactivateSubscription }
export type { CancellationReason, CancellationPreview, CancellationResult }
```



# ═══════════════════════════════════════════════════════════════════════════════
# PAYMENT METHOD MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
async function updatePaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, subscriptionId: true }
  })

  if (!user.stripeCustomerId) {
    return { success: false, error: 'No customer record found' }
  }

  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId
    })

    // Set as default for customer
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    })

    // Update subscription default payment method
    if (user.subscriptionId) {
      await stripe.subscriptions.update(user.subscriptionId, {
        default_payment_method: paymentMethodId
      })
    }

    // Send confirmation email
    await sendPaymentMethodUpdatedEmail(userId)

    return { success: true }

  } catch (error) {
    console.error('Payment method update failed:', error)
    return { success: false, error: 'Failed to update payment method' }
  }
}

async function removePaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
  // Check if this is the default/only payment method
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, subscriptionId: true }
  })

  if (user.subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId)
    if (subscription.default_payment_method === paymentMethodId) {
      return { success: false, error: 'Cannot remove default payment method while subscription is active' }
    }
  }

  try {
    await stripe.paymentMethods.detach(paymentMethodId)
    return { success: true }
  } catch (error) {
    console.error('Payment method removal failed:', error)
    return { success: false, error: 'Failed to remove payment method' }
  }
}

export { updatePaymentMethod, removePaymentMethod }
```



# ═══════════════════════════════════════════════════════════════════════════════
# BILLING HISTORY & INVOICES
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
interface Invoice {
  id: string
  date: Date
  description: string
  amount: number
  currency: string
  status: 'PAID' | 'PENDING' | 'FAILED'
  pdfUrl: string | null
}

async function getBillingHistory(userId: string): Promise<Invoice[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true }
  })

  if (!user.stripeCustomerId) {
    return []
  }

  const invoices = await stripe.invoices.list({
    customer: user.stripeCustomerId,
    limit: 24  // Last 2 years
  })

  return invoices.data.map(invoice => ({
    id: invoice.id,
    date: new Date(invoice.created * 1000),
    description: invoice.lines.data[0]?.description || 'Subscription',
    amount: invoice.amount_paid,
    currency: invoice.currency.toUpperCase(),
    status: mapInvoiceStatus(invoice.status),
    pdfUrl: invoice.invoice_pdf
  }))
}

function mapInvoiceStatus(stripeStatus: string | null): Invoice['status'] {
  switch (stripeStatus) {
    case 'paid': return 'PAID'
    case 'open': return 'PENDING'
    case 'uncollectible': return 'FAILED'
    default: return 'PENDING'
  }
}

async function downloadInvoicePdf(invoiceId: string): Promise<string> {
  const invoice = await stripe.invoices.retrieve(invoiceId)

  if (!invoice.invoice_pdf) {
    throw new Error('Invoice PDF not available')
  }

  return invoice.invoice_pdf
}

export { getBillingHistory, downloadInvoicePdf }
export type { Invoice }
```



# ═══════════════════════════════════════════════════════════════════════════════
# PAYMENT ERROR HANDLING
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const PAYMENT_ERROR_MESSAGES: Record<string, { tr: string; en: string; retryable: boolean }> = {
  // Card errors
  card_declined: {
    tr: 'Kartiniz reddedildi. Lutfen baska bir kart deneyin veya bankanizla iletisime gecin.',
    en: 'Your card was declined. Please try a different card or contact your bank.',
    retryable: true
  },
  insufficient_funds: {
    tr: 'Yetersiz bakiye. Lutfen kartinizin bakiyesini kontrol edin.',
    en: 'Insufficient funds. Please check your card balance.',
    retryable: true
  },
  invalid_card_number: {
    tr: 'Gecersiz kart numarasi. Lutfen kart bilgilerinizi kontrol edin.',
    en: 'Invalid card number. Please check your card details.',
    retryable: true
  },
  invalid_expiry_month: {
    tr: 'Gecersiz son kullanma tarihi. Lutfen ay bilgisini kontrol edin.',
    en: 'Invalid expiry month. Please check the month.',
    retryable: true
  },
  invalid_expiry_year: {
    tr: 'Gecersiz son kullanma tarihi. Lutfen yil bilgisini kontrol edin.',
    en: 'Invalid expiry year. Please check the year.',
    retryable: true
  },
  invalid_cvc: {
    tr: 'Gecersiz guvenlik kodu (CVC). Lutfen kartinizin arkasindaki 3 haneli kodu kontrol edin.',
    en: 'Invalid security code (CVC). Please check the 3-digit code on the back of your card.',
    retryable: true
  },
  expired_card: {
    tr: 'Kartinizin suresi dolmus. Lutfen gecerli bir kart kullanin.',
    en: 'Your card has expired. Please use a valid card.',
    retryable: true
  },
  incorrect_cvc: {
    tr: 'Yanlis guvenlik kodu (CVC). Lutfen tekrar deneyin.',
    en: 'Incorrect security code (CVC). Please try again.',
    retryable: true
  },

  // Processing errors
  processing_error: {
    tr: 'Islem sirasinda bir hata olustu. Lutfen birkac dakika sonra tekrar deneyin.',
    en: 'An error occurred while processing. Please try again in a few minutes.',
    retryable: true
  },
  authentication_required: {
    tr: '3D Secure dogrulamasi gerekli. Lutfen dogrulamayi tamamlayin.',
    en: '3D Secure authentication required. Please complete the verification.',
    retryable: true
  },

  // Account errors
  card_not_supported: {
    tr: 'Bu kart turu desteklenmiyor. Lutfen Visa, Mastercard veya Amex kullanin.',
    en: 'This card type is not supported. Please use Visa, Mastercard, or Amex.',
    retryable: true
  },

  // Rate limiting
  rate_limit: {
    tr: 'Cok fazla deneme. Lutfen birkac dakika bekleyin.',
    en: 'Too many attempts. Please wait a few minutes.',
    retryable: true
  },

  // Default
  default: {
    tr: 'Odeme islemi basarisiz oldu. Lutfen tekrar deneyin veya destek ile iletisime gecin.',
    en: 'Payment failed. Please try again or contact support.',
    retryable: true
  }
}

function getPaymentError(code: string, locale: 'tr' | 'en' = 'tr') {
  const error = PAYMENT_ERROR_MESSAGES[code] || PAYMENT_ERROR_MESSAGES.default
  return {
    message: error[locale],
    retryable: error.retryable
  }
}

export { PAYMENT_ERROR_MESSAGES, getPaymentError }
```



# ═══════════════════════════════════════════════════════════════════════════════
# FAILED PAYMENT RECOVERY (DUNNING)
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const DUNNING_SCHEDULE = {
  // Automatic retry schedule after failed payment
  retryAttempts: [
    { day: 1, action: 'RETRY_PAYMENT' },
    { day: 3, action: 'RETRY_PAYMENT' },
    { day: 5, action: 'RETRY_PAYMENT' },
    { day: 7, action: 'FINAL_RETRY' }
  ],

  // Email notifications
  notifications: [
    { day: 0, template: 'PAYMENT_FAILED' },
    { day: 3, template: 'PAYMENT_REMINDER' },
    { day: 5, template: 'PAYMENT_URGENT' },
    { day: 7, template: 'SUBSCRIPTION_EXPIRED' }
  ],

  // Grace period before downgrade
  gracePeriodDays: 7,

  // Action after grace period
  onGracePeriodEnd: 'DOWNGRADE_TO_FREE'
}

// Handle failed subscription renewal
async function handleFailedRenewal(subscriptionId: string): Promise<void> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata.userId

  // Update database status
  await db.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: 'PAST_DUE',
      paymentFailedAt: new Date()
    }
  })

  // Send immediate notification
  await sendPaymentFailedEmail(userId, {
    amount: subscription.latest_invoice?.amount_due,
    currency: subscription.currency,
    retryDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
  })

  // Track event
  await trackEvent('payment_failed', {
    userId,
    subscriptionId,
    amount: subscription.latest_invoice?.amount_due
  })
}

// Execute grace period expiration
async function executeGracePeriodExpiration(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionId: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      paymentFailedAt: true
    }
  })

  if (user.subscriptionStatus !== 'PAST_DUE') {
    return // Payment recovered or already processed
  }

  const gracePeriodEnd = new Date(user.paymentFailedAt)
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + DUNNING_SCHEDULE.gracePeriodDays)

  if (new Date() < gracePeriodEnd) {
    return // Still in grace period
  }

  // Cancel subscription
  await stripe.subscriptions.cancel(user.subscriptionId)

  // Downgrade to Free
  await db.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStatus: 'EXPIRED',
      subscriptionId: null
    }
  })

  // Send notification
  await sendSubscriptionExpiredEmail(userId)

  // Track event
  await trackEvent('subscription_expired_payment_failure', {
    userId,
    previousTier: user.subscriptionTier
  })
}

export { DUNNING_SCHEDULE, handleFailedRenewal, executeGracePeriodExpiration }
```



# ═══════════════════════════════════════════════════════════════════════════════
# REFUND POLICY
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const REFUND_POLICY = {
  // General policy
  generalPolicy: {
    description: 'Abonelikler icin genel olarak iade yapilmaz.',
    reason: 'Donem sonunda iptal edilebilir, kalan sure kullanilabilir.'
  },

  // Exception cases where refund is allowed
  exceptions: [
    {
      case: 'TECHNICAL_ISSUE',
      description: 'Teknik sorun nedeniyle hizmet kullanilamadi',
      maxRefundDays: 30,
      refundType: 'FULL_OR_PRORATED',
      requiresApproval: true
    },
    {
      case: 'DUPLICATE_CHARGE',
      description: 'Yanlislikla cift odeme alindi',
      maxRefundDays: 90,
      refundType: 'FULL',
      requiresApproval: false
    },
    {
      case: 'FRAUD',
      description: 'Yetkisiz islem (dolandiricilik)',
      maxRefundDays: 120,
      refundType: 'FULL',
      requiresApproval: true
    },
    {
      case: 'FIRST_TIME_USER',
      description: 'Ilk kez abone olan kullanici memnun kalmadi',
      maxRefundDays: 7,
      refundType: 'FULL',
      requiresApproval: false,
      conditions: ['First subscription ever', 'Only once per user']
    }
  ],

  // Processing time
  processingTime: {
    cardRefund: '5-10 is gunu',
    bankTransfer: '3-5 is gunu'
  },

  // Contact for refund requests
  contact: {
    email: 'billing@voxpoll.com',
    inAppForm: true
  }
}

interface RefundRequest {
  id: string
  userId: string
  subscriptionId: string
  invoiceId: string
  amount: number
  reason: string
  case: 'TECHNICAL_ISSUE' | 'DUPLICATE_CHARGE' | 'FRAUD' | 'FIRST_TIME_USER' | 'OTHER'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED'
  createdAt: Date
  processedAt?: Date
  processedBy?: string
  rejectionReason?: string
}

async function requestRefund(
  userId: string,
  invoiceId: string,
  reason: string,
  case_: RefundRequest['case']
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  // Check if refund case is valid
  const exceptionCase = REFUND_POLICY.exceptions.find(e => e.case === case_)

  if (!exceptionCase) {
    return { success: false, error: 'Invalid refund case' }
  }

  // Check time limit
  const invoice = await stripe.invoices.retrieve(invoiceId)
  const invoiceDate = new Date(invoice.created * 1000)
  const daysSinceInvoice = Math.floor((Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceInvoice > exceptionCase.maxRefundDays) {
    return { success: false, error: `Refund must be requested within ${exceptionCase.maxRefundDays} days` }
  }

  // Create refund request
  const request = await db.refundRequest.create({
    data: {
      userId,
      invoiceId,
      subscriptionId: invoice.subscription as string,
      amount: invoice.amount_paid,
      reason,
      case: case_,
      status: exceptionCase.requiresApproval ? 'PENDING' : 'APPROVED'
    }
  })

  if (!exceptionCase.requiresApproval) {
    // Auto-process refund
    await processRefund(request.id)
  } else {
    // Notify support team
    await notifySupportTeam('REFUND_REQUEST', request)
  }

  return { success: true, requestId: request.id }
}

async function processRefund(requestId: string): Promise<void> {
  const request = await db.refundRequest.findUnique({
    where: { id: requestId }
  })

  // Create Stripe refund
  const refund = await stripe.refunds.create({
    payment_intent: (await stripe.invoices.retrieve(request.invoiceId)).payment_intent as string,
    amount: request.amount,
    reason: 'requested_by_customer'
  })

  // Update request status
  await db.refundRequest.update({
    where: { id: requestId },
    data: {
      status: 'PROCESSED',
      processedAt: new Date()
    }
  })

  // Send confirmation email
  await sendRefundProcessedEmail(request.userId, request.amount)
}

export { REFUND_POLICY, requestRefund, processRefund }
export type { RefundRequest }
```



# ═══════════════════════════════════════════════════════════════════════════════
# B2B ORGANIZATION BILLING
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const ORG_SUBSCRIPTION_TIERS = {
  STARTER: {
    name: 'Starter',
    monthlyPrice: 9900,       // $99
    yearlyPrice: 99900,       // $999 (17% discount)
    maxMembers: 5,
    maxSurveysPerMonth: 10,
    maxResponsesPerMonth: 1000,
    features: [
      'Up to 5 team members',
      '10 surveys per month',
      '1,000 responses per month',
      'Basic analytics',
      'Email support'
    ]
  },
  PROFESSIONAL: {
    name: 'Professional',
    monthlyPrice: 29900,      // $299
    yearlyPrice: 299900,      // $2,999 (17% discount)
    maxMembers: 25,
    maxSurveysPerMonth: 50,
    maxResponsesPerMonth: 10000,
    features: [
      'Up to 25 team members',
      '50 surveys per month',
      '10,000 responses per month',
      'Advanced analytics',
      'API access',
      'Priority email support',
      'White-label options'
    ]
  },
  ENTERPRISE: {
    name: 'Enterprise',
    monthlyPrice: null,        // Custom pricing
    yearlyPrice: null,
    maxMembers: null,          // Unlimited
    maxSurveysPerMonth: null,  // Unlimited
    maxResponsesPerMonth: null,// Unlimited
    features: [
      'Unlimited team members',
      'Unlimited surveys',
      'Unlimited responses',
      'Advanced analytics',
      'Full API access',
      'Dedicated support',
      'SSO/SAML integration',
      'Custom SLA',
      'On-premise option'
    ],
    contactSales: true
  }
}

export { ORG_SUBSCRIPTION_TIERS }
```



# ═══════════════════════════════════════════════════════════════════════════════
# STRIPE WEBHOOK HANDLING
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const WEBHOOK_EVENTS = {
  // Subscription events
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,

  // Payment events
  'invoice.payment_succeeded': handlePaymentSucceeded,
  'invoice.payment_failed': handlePaymentFailed,

  // Customer events
  'customer.updated': handleCustomerUpdated,

  // Payment method events
  'payment_method.attached': handlePaymentMethodAttached,
  'payment_method.detached': handlePaymentMethodDetached
}

async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  const handler = WEBHOOK_EVENTS[event.type]

  if (!handler) {
    console.log(`Unhandled webhook event: ${event.type}`)
    return
  }

  await handler(event)
}

async function handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription
  const userId = subscription.metadata.userId

  await db.user.update({
    where: { id: userId },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus: 'ACTIVE',
      subscriptionTier: subscription.metadata.tier,
      subscriptionStartDate: new Date(subscription.start_date * 1000),
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  })
}

async function handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription
  const userId = subscription.metadata.userId

  await db.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: mapStripeStatus(subscription.status),
      subscriptionTier: subscription.metadata.tier,
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  })
}

async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription
  const userId = subscription.metadata.userId

  await db.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStatus: 'EXPIRED',
      subscriptionId: null,
      subscriptionCurrentPeriodEnd: null
    }
  })
}

async function handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice

  if (invoice.billing_reason === 'subscription_cycle') {
    // Subscription renewal succeeded
    const userId = invoice.subscription_details?.metadata?.userId

    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'ACTIVE',
          paymentFailedAt: null
        }
      })

      await sendPaymentReceiptEmail(userId, {
        amount: invoice.amount_paid,
        currency: invoice.currency,
        invoiceUrl: invoice.hosted_invoice_url
      })
    }
  }
}

async function handlePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice

  if (invoice.billing_reason === 'subscription_cycle') {
    await handleFailedRenewal(invoice.subscription as string)
  }
}

export { handleStripeWebhook, WEBHOOK_EVENTS }
```
