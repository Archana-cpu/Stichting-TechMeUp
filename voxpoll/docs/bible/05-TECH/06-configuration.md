# Configuration & Environment
> Source: bible-002.md, bible-001.md

---

# ══════════════════════════════════════════════════════════════════════════════
# ENVIRONMENT VARIABLES
# ══════════════════════════════════════════════════════════════════════════════

## Required Environment Variables

```bash
# ═══════════════════════════════════════════════════════════════════════════
# REQUIRED FOR ALL ENVIRONMENTS
# ═══════════════════════════════════════════════════════════════════════════

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/voxpoll"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-jwt-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"

# Application
NODE_ENV="development" | "staging" | "production"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

## Production-Only Variables

```bash
# ═══════════════════════════════════════════════════════════════════════════
# PRODUCTION ONLY
# ═══════════════════════════════════════════════════════════════════════════

# Error Tracking
SENTRY_DSN="https://xxx@sentry.io/xxx"

# Payments
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
STRIPE_PUBLISHABLE_KEY="pk_live_xxx"

# AWS
AWS_ACCESS_KEY_ID="AKIAXXXX"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_REGION="eu-west-1"
AWS_S3_BUCKET="voxpoll-uploads"

# Email
RESEND_API_KEY="re_xxx"

# SMS
TWILIO_ACCOUNT_SID="ACxxx"
TWILIO_AUTH_TOKEN="xxx"
TWILIO_PHONE_NUMBER="+1234567890"

# OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"
APPLE_CLIENT_ID="com.voxpoll.app"
APPLE_TEAM_ID="xxx"
APPLE_KEY_ID="xxx"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# e-Devlet (Turkey)
EDEVLET_CLIENT_ID="xxx"
EDEVLET_CLIENT_SECRET="xxx"
```

## Optional Variables

```bash
# ═══════════════════════════════════════════════════════════════════════════
# OPTIONAL
# ═══════════════════════════════════════════════════════════════════════════

# Analytics
POSTHOG_API_KEY="phc_xxx"
POSTHOG_HOST="https://app.posthog.com"

# Logging
LOG_LEVEL="info" | "debug" | "warn" | "error"
AXIOM_DATASET="voxpoll-logs"
AXIOM_TOKEN="xat_xxx"

# Search (Phase 2+)
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="xxx"
SEARCH_PROVIDER="postgres" | "meilisearch"

# Feature Flags
FEATURE_FLAGS_ENABLED="true"
```

---

# ══════════════════════════════════════════════════════════════════════════════
# APPLICATION CONSTANTS
# ══════════════════════════════════════════════════════════════════════════════

## Content Limits

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// CONTENT LIMITS
// ═══════════════════════════════════════════════════════════════════════════

const CONTENT_LIMITS = {
  poll: {
    question: { min: 10, max: 500 },
    description: { max: 2000 },
    options: {
      free: { min: 2, max: 4 },
      plus: { min: 2, max: 6 },
      premium: { min: 2, max: 10 }
    },
    optionText: { min: 1, max: 200 },
    duration: {
      quick: { min: 1, max: 10080 },
      extended: { min: 60, max: 43200 },
      live: { min: 1, max: 60 }
    }
  },
  survey: {
    title: { min: 5, max: 200 },
    description: { max: 5000 },
    questions: { min: 1, max: 100 },
    questionText: { min: 5, max: 1000 },
    optionText: { max: 500 }
  },
  test: {
    title: { min: 5, max: 200 },
    description: { max: 3000 },
    questions: { min: 5, max: 50 },
    categories: { min: 2, max: 10 }
  },
  user: {
    username: { min: 3, max: 30, pattern: /^[a-zA-Z0-9_]+$/ },
    displayName: { min: 1, max: 100 },
    bio: { max: 500 }
  },
  comment: {
    body: { min: 1, max: 2000 }
  }
} as const
```

## Subscription Tier Limits

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION TIER LIMITS
// ═══════════════════════════════════════════════════════════════════════════

const SUBSCRIPTION_LIMITS = {
  FREE: {
    pollsPerDay: 3,
    maxPollOptions: 4,
    pollTypes: ["QUICK"],
    canCreateTests: false,
    canCreateSurveys: false,
    canUsePreTest: false,
    canTargetAudience: false,
    analyticsLevel: "BASIC",
    adFree: false,
    priority: 0
  },
  PLUS: {
    pollsPerDay: 10,
    maxPollOptions: 6,
    pollTypes: ["QUICK"],
    canCreateTests: false,
    canCreateSurveys: false,
    canUsePreTest: false,
    canTargetAudience: false,
    analyticsLevel: "EXTENDED",
    adFree: true,
    priority: 1,
    canViewPulseWithoutVoting: true
  },
  PREMIUM: {
    pollsPerDay: Infinity,
    maxPollOptions: 10,
    pollTypes: ["QUICK", "EXTENDED", "LIVE"],
    canCreateTests: true,
    canCreateSurveys: false,
    canUsePreTest: true,
    canTargetAudience: true,
    analyticsLevel: "FULL",
    adFree: true,
    priority: 2
  }
} as const
```

## Organization Tier Limits

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION TIER LIMITS
// ═══════════════════════════════════════════════════════════════════════════

const ORGANIZATION_LIMITS = {
  STARTER: {
    maxMembers: 10,
    maxSurveys: 5,
    maxResponsesPerSurvey: 100,
    ssoEnabled: false,
    auditLogs: false,
    customBranding: false,
    apiAccess: false,
    price: 99
  },
  PROFESSIONAL: {
    maxMembers: 50,
    maxSurveys: 25,
    maxResponsesPerSurvey: 1000,
    ssoEnabled: false,
    auditLogs: true,
    customBranding: true,
    apiAccess: true,
    price: 299
  },
  ENTERPRISE: {
    maxMembers: Infinity,
    maxSurveys: Infinity,
    maxResponsesPerSurvey: Infinity,
    ssoEnabled: true,
    auditLogs: true,
    customBranding: true,
    apiAccess: true,
    dedicatedSupport: true,
    price: "custom"
  }
} as const
```

---

# ══════════════════════════════════════════════════════════════════════════════
# CACHE CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

## Cache TTL Settings

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// CACHE TTL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_TTL = {
  session: 24 * 60 * 60,
  userProfile: 5 * 60,
  userSettings: 5 * 60,

  pollMeta: 60,
  pollResults: 5 * 60,
  surveyMeta: 5 * 60,
  testMeta: 5 * 60,

  categoryList: 10 * 60,
  trending: 30,
  activeUsers: 30,
  userFeed: 60,

  rateLimitCounter: 60
} as const
```

## Cache Key Patterns

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// CACHE KEY PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_KEYS = {
  session: (sessionId: string) => `session:${sessionId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  userSettings: (userId: string) => `user:settings:${userId}`,

  pollMeta: (pollId: string) => `poll:meta:${pollId}`,
  pollResults: (pollId: string) => `poll:results:${pollId}`,
  surveyMeta: (surveyId: string) => `survey:meta:${surveyId}`,
  testMeta: (testId: string) => `test:meta:${testId}`,

  userFeed: (userId: string, page: number) => `feed:user:${userId}:${page}`,
  trending: (category?: string) => `feed:trending${category ? `:${category}` : ''}`,

  rateLimit: (key: string, window: string) => `ratelimit:${key}:${window}`,

  pollParticipants: (pollId: string) => `count:poll:${pollId}:participants`,
  activeUsers: () => `count:active_users`,
}
```

---

# ══════════════════════════════════════════════════════════════════════════════
# FEATURE FLAGS
# ══════════════════════════════════════════════════════════════════════════════

## Feature Flag Structure

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════════════

interface FeatureFlag {
  key: string
  enabled: boolean
  rolloutPercentage?: number
  allowedUsers?: string[]
  allowedOrganizations?: string[]
  allowedTiers?: ("FREE" | "PLUS" | "PREMIUM")[]
  startDate?: Date
  endDate?: Date
}

const DEFAULT_FEATURE_FLAGS: Record<string, FeatureFlag> = {
  "live-polls": {
    key: "live-polls",
    enabled: true,
    allowedTiers: ["PREMIUM"]
  },
  "personality-tests": {
    key: "personality-tests",
    enabled: true,
    allowedTiers: ["PREMIUM"]
  },
  "ai-question-suggestions": {
    key: "ai-question-suggestions",
    enabled: false,
    rolloutPercentage: 10
  },
  "new-analytics-dashboard": {
    key: "new-analytics-dashboard",
    enabled: true,
    rolloutPercentage: 50
  },
  "meilisearch-enabled": {
    key: "meilisearch-enabled",
    enabled: false
  }
}
```

## Feature Flag Evaluation

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// FEATURE FLAG EVALUATION
// ═══════════════════════════════════════════════════════════════════════════

async function isFeatureEnabled(
  flagKey: string,
  context: {
    userId?: string
    organizationId?: string
    subscriptionTier?: string
  }
): Promise<boolean> {
  const flag = await getFeatureFlag(flagKey)

  if (!flag || !flag.enabled) return false

  if (flag.startDate && new Date() < flag.startDate) return false
  if (flag.endDate && new Date() > flag.endDate) return false

  if (flag.allowedUsers?.includes(context.userId ?? "")) return true
  if (flag.allowedOrganizations?.includes(context.organizationId ?? "")) return true

  if (flag.allowedTiers?.length) {
    if (!flag.allowedTiers.includes(context.subscriptionTier as any)) return false
  }

  if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
    const hash = hashString(context.userId ?? "anonymous")
    const bucket = hash % 100
    if (bucket >= flag.rolloutPercentage) return false
  }

  return true
}
```

---

# ══════════════════════════════════════════════════════════════════════════════
# INTERNATIONALIZATION
# ══════════════════════════════════════════════════════════════════════════════

## Supported Languages

| Code | Language | Status |
|------|----------|--------|
| tr | Turkish | Primary |
| en | English | Secondary |
| de | German | Planned |
| fr | French | Planned |

## Language Configuration

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// I18N CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const I18N_CONFIG = {
  defaultLocale: "tr",
  supportedLocales: ["tr", "en"],
  fallbackLocale: "en",

  dateFormat: {
    tr: "dd.MM.yyyy",
    en: "MM/dd/yyyy"
  },
  timeFormat: {
    tr: "HH:mm",
    en: "h:mm a"
  },
  numberFormat: {
    tr: { decimal: ",", thousands: "." },
    en: { decimal: ".", thousands: "," }
  }
}
```

## Error Messages (i18n)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// ERROR MESSAGES
// ═══════════════════════════════════════════════════════════════════════════

const ERROR_MESSAGES = {
  UNAUTHORIZED: {
    tr: "Bu islem icin giris yapmaniz gerekiyor",
    en: "Authentication required for this action"
  },
  FORBIDDEN: {
    tr: "Bu islemi yapmaya yetkiniz yok",
    en: "You don't have permission for this action"
  },
  NOT_FOUND: {
    tr: "Aradiginiz icerik bulunamadi",
    en: "The requested resource was not found"
  },
  RATE_LIMITED: {
    tr: "Cok fazla istek gonderdiniz. Lutfen bekleyin",
    en: "Too many requests. Please wait and try again"
  },
  VALIDATION_ERROR: {
    tr: "Girilen bilgiler gecersiz",
    en: "The provided data is invalid"
  },
  INSUFFICIENT_VERIFICATION: {
    tr: "Bu islem icin daha yuksek dogrulama seviyesi gerekiyor",
    en: "Higher verification level required for this action"
  },
  SUBSCRIPTION_REQUIRED: {
    tr: "Bu ozellik premium abonelik gerektiriyor",
    en: "This feature requires a premium subscription"
  }
}
```

---

# ══════════════════════════════════════════════════════════════════════════════
# LOGGING CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

## Pino Logger Configuration

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// PINO LOGGER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

import pino from "pino"

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ level: label })
  },
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "password",
    "passwordHash",
    "accessToken",
    "refreshToken",
    "*.password",
    "*.secret"
  ],
  transport: process.env.NODE_ENV === "development"
    ? { target: "pino-pretty" }
    : undefined
})
```

## Log Levels

| Level | When to Use |
|-------|-------------|
| fatal | Application crash |
| error | Error that needs attention |
| warn | Unexpected but handled |
| info | Important business events |
| debug | Development debugging |
| trace | Very detailed tracing |

---

# ══════════════════════════════════════════════════════════════════════════════
# EXTERNAL SERVICE CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

## Stripe Configuration

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// STRIPE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const STRIPE_CONFIG = {
  products: {
    PLUS: {
      monthly: "price_plus_monthly",
      yearly: "price_plus_yearly"
    },
    PREMIUM: {
      monthly: "price_premium_monthly",
      yearly: "price_premium_yearly"
    }
  },
  webhookEvents: [
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_failed"
  ]
}
```

## AWS S3 Configuration

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// AWS S3 CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const S3_CONFIG = {
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_REGION,
  maxFileSize: 10 * 1024 * 1024,
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4"
  ],
  paths: {
    avatars: "avatars/",
    pollMedia: "polls/",
    testCovers: "tests/",
    exports: "exports/"
  }
}
```

---

*Source: bible-002.md, bible-001.md*
