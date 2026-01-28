# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 23                                    █
# █            CONFIGURATION SYSTEM, i18n & SCALABILITY PATTERNS              █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████

# Version: 1.0.0
# Last Updated: 2026-01-22
# Status: AUTHORITATIVE
# Decision: P-022 - All hardcoded values MUST be externalized to config system

# ══════════════════════════════════════════════════════════════════════════════
# TABLE OF CONTENTS
# ══════════════════════════════════════════════════════════════════════════════
# 23.1  Configuration Architecture Overview
# 23.2  Environment Variables Schema
# 23.3  Runtime Configuration Store
# 23.4  Internationalization (i18n) System
# 23.5  Pricing & Subscription Configuration
# 23.6  Content Limits Configuration
# 23.7  Security & Authentication Configuration
# 23.8  Quality & Fraud Detection Configuration
# 23.9  Statistical Constants Configuration
# 23.10 Media & File Limits Configuration
# 23.11 Text Constraints Configuration
# 23.12 Notification Configuration
# 23.13 Feed & Algorithm Configuration
# 23.14 Gamification Configuration
# 23.15 Live Poll & Real-time Configuration
# 23.16 Database & Cache Configuration
# 23.17 Edge Cases & Worst Case Safeguards
# 23.18 Graceful Degradation Patterns
# 23.19 Configuration Validation
# 23.20 Cross-Reference Index
# ══════════════════════════════════════════════════════════════════════════════



# ══════════════════════════════════════════════════════════════════════════════
# 23.1 CONFIGURATION ARCHITECTURE OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

## 23.1.1 Configuration Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONFIGURATION PRIORITY (Highest → Lowest)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. RUNTIME OVERRIDES (Admin Panel)                                         │
│     └── Real-time changes without deployment                                │
│     └── Stored in database CONFIG table                                     │
│     └── Used for: A/B tests, temporary adjustments, feature flags           │
│                                                                             │
│  2. ENVIRONMENT VARIABLES (.env)                                            │
│     └── Deployment-specific settings                                        │
│     └── Used for: API keys, secrets, URLs, resource limits                  │
│                                                                             │
│  3. DEFAULT VALUES (Code constants)                                         │
│     └── Fallback when env/runtime not set                                   │
│     └── Defined in this bible section                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 23.1.2 Configuration Loading Flow

```typescript
// CONFIG LOADER IMPLEMENTATION
// File: src/config/loader.ts

import { z } from 'zod';
import { db } from '@/db';
import { runtimeConfigs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

type ConfigValue = string | number | boolean | object | null;

interface ConfigSource {
  runtime: Map<string, ConfigValue>;
  env: NodeJS.ProcessEnv;
  defaults: Map<string, ConfigValue>;
}

class ConfigLoader {
  private static instance: ConfigLoader;
  private cache: Map<string, { value: ConfigValue; expiresAt: number }> = new Map();
  private readonly CACHE_TTL_MS = 60_000; // 1 minute cache

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }

    // Priority 1: Runtime override from database
    const runtimeValue = await this.getRuntimeConfig(key);
    if (runtimeValue !== undefined) {
      this.setCache(key, runtimeValue);
      return runtimeValue as T;
    }

    // Priority 2: Environment variable
    const envKey = this.toEnvKey(key);
    const envValue = process.env[envKey];
    if (envValue !== undefined) {
      const parsed = this.parseEnvValue(envValue, typeof defaultValue);
      this.setCache(key, parsed);
      return parsed as T;
    }

    // Priority 3: Default value
    this.setCache(key, defaultValue);
    return defaultValue;
  }

  private toEnvKey(key: string): string {
    // config.pricing.individual.plus.monthly → VOXPOLL_PRICING_INDIVIDUAL_PLUS_MONTHLY
    return 'VOXPOLL_' + key.replace(/\./g, '_').toUpperCase();
  }

  private parseEnvValue(value: string, type: string): ConfigValue {
    if (type === 'number') return parseFloat(value);
    if (type === 'boolean') return value === 'true';
    if (value.startsWith('{') || value.startsWith('[')) {
      try { return JSON.parse(value); } catch { return value; }
    }
    return value;
  }

  private async getRuntimeConfig(key: string): Promise<ConfigValue | undefined> {
    // Database lookup for runtime overrides (Drizzle-style)
    const config = await db.select().from(runtimeConfigs)
      .where(and(eq(runtimeConfigs.key, key), eq(runtimeConfigs.active, true)))
      .then(r => r[0]);
    return config?.value;
  }

  private setCache(key: string, value: ConfigValue): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.CACHE_TTL_MS
    });
  }

  invalidateCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const config = ConfigLoader.getInstance();
```

## 23.1.3 Runtime Config Database Schema

```typescript
// Drizzle schema
// File: src/db/schema/runtimeConfig.ts

export const runtimeConfigs = pgTable('runtime_configs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  active: boolean('active').default(true).notNull(),

  // Audit fields
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // For A/B testing
  experimentId String?
  variant      String?

  @@index([key, active])
  @@index([experimentId])
}
```



# ══════════════════════════════════════════════════════════════════════════════
# 23.2 ENVIRONMENT VARIABLES SCHEMA
# ══════════════════════════════════════════════════════════════════════════════

## 23.2.1 Required Environment Variables

```bash
# .env.example

# ═══════════════════════════════════════════════════════════════
# CORE APPLICATION
# ═══════════════════════════════════════════════════════════════
NODE_ENV=production                      # development | staging | production
VOXPOLL_APP_URL=https://voxpoll.com
VOXPOLL_API_URL=https://api.voxpoll.com
VOXPOLL_CDN_URL=https://cdn.voxpoll.com
VOXPOLL_DEFAULT_LOCALE=tr                # Default language: tr | en

# ═══════════════════════════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════════════════════════
DATABASE_URL=postgresql://...
VOXPOLL_DB_POOL_MIN=5
VOXPOLL_DB_POOL_MAX=20
VOXPOLL_DB_CONNECTION_TIMEOUT=10000
VOXPOLL_DB_IDLE_TIMEOUT=30000

# ═══════════════════════════════════════════════════════════════
# REDIS / CACHE
# ═══════════════════════════════════════════════════════════════
REDIS_URL=redis://...
VOXPOLL_CACHE_TTL_DEFAULT=300            # seconds
VOXPOLL_CACHE_TTL_ANALYTICS=60           # seconds

# ═══════════════════════════════════════════════════════════════
# AUTHENTICATION
# ═══════════════════════════════════════════════════════════════
VOXPOLL_JWT_SECRET=<32+ character secret>
VOXPOLL_JWT_ACCESS_EXPIRY=900            # 15 minutes in seconds
VOXPOLL_JWT_REFRESH_EXPIRY=2592000       # 30 days in seconds
VOXPOLL_SESSION_MAX_CONCURRENT_FREE=5
VOXPOLL_SESSION_MAX_CONCURRENT_PREMIUM=10
VOXPOLL_SESSION_MAX_CONCURRENT_ADMIN=20

# ═══════════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════════
VOXPOLL_RATE_LIMIT_AUTHENTICATED=1000    # requests per minute
VOXPOLL_RATE_LIMIT_ANONYMOUS=100         # requests per minute
VOXPOLL_RATE_LIMIT_LOGIN_ATTEMPTS=10     # per 15 minutes
VOXPOLL_RATE_LIMIT_REGISTER_ATTEMPTS=5   # per hour

# ═══════════════════════════════════════════════════════════════
# FILE STORAGE
# ═══════════════════════════════════════════════════════════════
VOXPOLL_STORAGE_PROVIDER=s3              # s3 | gcs | azure | local
VOXPOLL_MAX_AVATAR_SIZE_MB=2
VOXPOLL_MAX_POLL_IMAGE_SIZE_MB=5
VOXPOLL_MAX_ATTACHMENT_SIZE_MB=10
VOXPOLL_MAX_GIF_SIZE_MB=10

# ═══════════════════════════════════════════════════════════════
# EXTERNAL SERVICES
# ═══════════════════════════════════════════════════════════════
GIPHY_API_KEY=<giphy api key>
SENDGRID_API_KEY=<sendgrid api key>
TWILIO_ACCOUNT_SID=<twilio sid>
TWILIO_AUTH_TOKEN=<twilio token>
STRIPE_SECRET_KEY=<stripe secret>
STRIPE_WEBHOOK_SECRET=<stripe webhook secret>

# ═══════════════════════════════════════════════════════════════
# LIVE POLL / WEBSOCKET
# ═══════════════════════════════════════════════════════════════
VOXPOLL_LIVE_MAX_PARTICIPANTS=10000
VOXPOLL_LIVE_AUTO_CLOSE_MINUTES=240
VOXPOLL_LIVE_JOIN_CODE_LENGTH=6
VOXPOLL_WS_HEARTBEAT_INTERVAL=30000      # milliseconds

# ═══════════════════════════════════════════════════════════════
# FRAUD DETECTION
# ═══════════════════════════════════════════════════════════════
VOXPOLL_FRAUD_BLOCK_THRESHOLD=30
VOXPOLL_FRAUD_HIGH_RISK_THRESHOLD=50
VOXPOLL_FRAUD_MEDIUM_RISK_THRESHOLD=70
VOXPOLL_SPEEDING_THRESHOLD=0.3           # 30% of expected time
```

## 23.2.2 Environment Validation Schema

```typescript
// File: src/config/env.schema.ts

import { z } from 'zod';

export const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  VOXPOLL_APP_URL: z.string().url(),
  VOXPOLL_API_URL: z.string().url(),
  VOXPOLL_CDN_URL: z.string().url(),
  VOXPOLL_DEFAULT_LOCALE: z.enum(['tr', 'en']).default('tr'),

  // Database
  DATABASE_URL: z.string().min(1),
  VOXPOLL_DB_POOL_MIN: z.coerce.number().int().positive().default(5),
  VOXPOLL_DB_POOL_MAX: z.coerce.number().int().positive().default(20),
  VOXPOLL_DB_CONNECTION_TIMEOUT: z.coerce.number().int().positive().default(10000),
  VOXPOLL_DB_IDLE_TIMEOUT: z.coerce.number().int().positive().default(30000),

  // Authentication
  VOXPOLL_JWT_SECRET: z.string().min(32),
  VOXPOLL_JWT_ACCESS_EXPIRY: z.coerce.number().int().positive().default(900),
  VOXPOLL_JWT_REFRESH_EXPIRY: z.coerce.number().int().positive().default(2592000),
  VOXPOLL_SESSION_MAX_CONCURRENT_FREE: z.coerce.number().int().positive().default(5),
  VOXPOLL_SESSION_MAX_CONCURRENT_PREMIUM: z.coerce.number().int().positive().default(10),
  VOXPOLL_SESSION_MAX_CONCURRENT_ADMIN: z.coerce.number().int().positive().default(20),

  // Rate Limiting
  VOXPOLL_RATE_LIMIT_AUTHENTICATED: z.coerce.number().int().positive().default(1000),
  VOXPOLL_RATE_LIMIT_ANONYMOUS: z.coerce.number().int().positive().default(100),
  VOXPOLL_RATE_LIMIT_LOGIN_ATTEMPTS: z.coerce.number().int().positive().default(10),
  VOXPOLL_RATE_LIMIT_REGISTER_ATTEMPTS: z.coerce.number().int().positive().default(5),

  // File Storage
  VOXPOLL_STORAGE_PROVIDER: z.enum(['s3', 'gcs', 'azure', 'local']).default('s3'),
  VOXPOLL_MAX_AVATAR_SIZE_MB: z.coerce.number().positive().default(2),
  VOXPOLL_MAX_POLL_IMAGE_SIZE_MB: z.coerce.number().positive().default(5),
  VOXPOLL_MAX_ATTACHMENT_SIZE_MB: z.coerce.number().positive().default(10),
  VOXPOLL_MAX_GIF_SIZE_MB: z.coerce.number().positive().default(10),

  // Live Poll
  VOXPOLL_LIVE_MAX_PARTICIPANTS: z.coerce.number().int().positive().default(10000),
  VOXPOLL_LIVE_AUTO_CLOSE_MINUTES: z.coerce.number().int().positive().default(240),
  VOXPOLL_LIVE_JOIN_CODE_LENGTH: z.coerce.number().int().min(4).max(12).default(6),
  VOXPOLL_WS_HEARTBEAT_INTERVAL: z.coerce.number().int().positive().default(30000),

  // Fraud Detection
  VOXPOLL_FRAUD_BLOCK_THRESHOLD: z.coerce.number().int().min(0).max(100).default(30),
  VOXPOLL_FRAUD_HIGH_RISK_THRESHOLD: z.coerce.number().int().min(0).max(100).default(50),
  VOXPOLL_FRAUD_MEDIUM_RISK_THRESHOLD: z.coerce.number().int().min(0).max(100).default(70),
  VOXPOLL_SPEEDING_THRESHOLD: z.coerce.number().min(0).max(1).default(0.3),
});

export type Env = z.infer<typeof envSchema>;

// Validate on startup
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    process.exit(1);
  }
  return result.data;
}
```



# ══════════════════════════════════════════════════════════════════════════════
# 23.3 RUNTIME CONFIGURATION STORE
# ══════════════════════════════════════════════════════════════════════════════

## 23.3.1 Default Configuration Object

```typescript
// File: src/config/defaults.ts

export const DEFAULT_CONFIG = {
  // ═══════════════════════════════════════════════════════════════
  // PRICING - Ref: bible-005.md
  // ═══════════════════════════════════════════════════════════════
  pricing: {
    currency: 'USD',
    individual: {
      plus: { monthly: 4.99, yearly: 49.99 },
      premium: { monthly: 9.99, yearly: 99.99 }
    },
    organization: {
      starter: { monthly: 99, yearly: 990 },
      professional: { monthly: 299, yearly: 2990 },
      enterprise: { monthly: 999, yearly: 9990 }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // CONTENT LIMITS - Ref: bible-006.md
  // ═══════════════════════════════════════════════════════════════
  limits: {
    poll: {
      creationDaily: { free: 3, plus: 10, premium: -1, organization: 50 }, // -1 = unlimited
      concurrent: { free: 5, plus: 20, premium: -1, organization: 100 },
      optionsMin: 2,
      // [DECISION P-027] Tier-based poll option limits:
      // Application varies by poll type:
      //
      // QUICK_POLL (all tiers can create):
      //   - HARD CAP: 4 options for ALL tiers (simple engagement, no tier difference)
      //   - This is intentional - Quick Polls are meant to be simple
      //
      // EXTENDED_POLL (Premium/Org can create):
      //   - Free/Plus: Cannot create Extended Polls (tier restriction)
      //   - Premium: 2-10 options
      //   - Organization: 2-10 options
      //
      // LIVE_POLL (Premium/Org can create):
      //   - Same as Extended Poll: 2-10 options for Premium/Org
      //
      // The values below represent the MAXIMUM for the tier when creating Extended/Live polls:
      optionsMax: { free: 4, plus: 4, premium: 10, organization: 10 },
      // Note: Free/Plus users CAN'T create Extended/Live polls anyway (tier restriction)
      // So their optionsMax only applies to Quick Polls (hardcoded 4)
      maxSelectionsDefault: 1
    },
    test: {
      creationWeekly: { free: 3, plus: 10, premium: -1 },
      questionsMin: 5,
      questionsMax: 50
    },
    survey: {
      questionsMin: 1,
      questionsMax: 100,
      monthly: { starter: 10, professional: 50, enterprise: -1 },
      maxResponses: { starter: 1000, professional: 10000, enterprise: 100000 }
    },
    comment: {
      maxDepth: 3,
      maxImagesPerComment: 4,
      maxLengthChars: 2000,
      minLengthChars: 3
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // VERIFICATION SYSTEM - Ref: bible-004.md, bible-005.md
  // ═══════════════════════════════════════════════════════════════
  verification: {
    levels: {
      0: { name: 'unverified', trustModifier: -10, responseWeight: 0.5 },
      1: { name: 'email_verified', trustModifier: 0, responseWeight: 1.0 },
      2: { name: 'phone_verified', trustModifier: 10, responseWeight: 1.1 },
      3: { name: 'id_verified', trustModifier: 20, responseWeight: 1.2 },
      4: { name: 'fully_verified', trustModifier: 30, responseWeight: 1.5 }
    },
    defaultTrustScore: 50
  },

  // ═══════════════════════════════════════════════════════════════
  // AUTHENTICATION - Ref: bible-005.md, bible-017.md
  // ═══════════════════════════════════════════════════════════════
  auth: {
    password: {
      minLength: 10,
      maxLength: 128,
      minCharacterClasses: 3,
      historyCount: 5,
      // Character classes: lowercase, uppercase, digit, special
      requiredPatterns: [
        /[a-z]/, // lowercase
        /[A-Z]/, // uppercase
        /[0-9]/, // digit
        /[^a-zA-Z0-9]/ // special character
      ]
    },
    lockout: {
      maxAttempts: 5,
      durationSteps: [900, 3600, 86400], // seconds: 15min, 1hr, 24hr
      resetAfter: 86400 // 24 hours
    },
    otp: {
      length: 6,
      expiry: {
        sms: 600,      // 10 minutes
        email: 900,    // 15 minutes
        verification: 86400 // 24 hours
      },
      maxAttempts: 3,
      cooldown: 3600 // 1 hour
    },
    session: {
      inactivityTimeout: 86400,  // 24 hours
      absoluteTimeout: 2592000   // 30 days
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // QUALITY & FRAUD DETECTION - Ref: bible-003.md, bible-009.md, bible-020.md
  // [AUTHORITATIVE] This section is the single source of truth for all
  // quality and fraud thresholds across the application.
  // ═══════════════════════════════════════════════════════════════
  quality: {
    // [DECISION P-028] Unified Quality Thresholds by Content Type
    // These thresholds determine response validity and inclusion in results
    thresholds: {
      // SURVEY (Enterprise Tier) - Highest rigor for B2B research
      survey: {
        include: 60,           // Score >= 60: Include in results
        review: 40,            // Score 40-59: Flag for manual review
        exclude: 39,           // Score < 40: Exclude from results
        criticalFlagOverride: true  // Critical flags force exclusion
      },
      // POLL (Validated Tier) - Balanced quality for public engagement
      poll: {
        include: 40,           // Score >= 40: Include in results
        review: 20,            // Score 20-39: Flag for review
        exclude: 19,           // Score < 20: Exclude from results
        criticalFlagOverride: false
      },
      // TEST (Validated Tier) - Similar to poll but pattern-weighted
      test: {
        include: 40,
        review: 25,
        exclude: 24,
        criticalFlagOverride: false
      },
      // QUICK POLL (Fraud-only) - Minimal validation for simple polls
      quickPoll: {
        include: 0,            // No quality threshold
        fraudOnly: true,       // Only fraud score matters
        fraudThreshold: 70     // Fraud score must be >= 70
      }
    },
    timing: {
      readingWordsPerMinute: 200,
      minQuestionTimeMs: 2000,
      maxQuestionTimeMs: 300000, // 5 minutes
      speedingThreshold: 0.3,
      slowpokeThreshold: 5.0 // 5x expected time
    },
    patterns: {
      straightLining: {
        warning: 0.6,
        high: 0.8,
        critical: 0.9
      },
      alternatingThreshold: 0.7
    },
    fraud: {
      blockThreshold: 30,
      highRiskThreshold: 50,
      mediumRiskThreshold: 70,
      ipPenalties: {
        knownBad: -50,
        vpn: -20,
        tor: -40,
        datacenter: -25,
        proxy: -15
      }
    },
    attentionCheck: {
      includeThreshold: 0.7,  // 70% pass rate to include
      reviewThreshold: 0.4    // 40% pass rate to review
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // STATISTICAL CONSTANTS - Ref: bible-003.md, bible-020.md
  // ═══════════════════════════════════════════════════════════════
  statistics: {
    zScores: {
      0.80: 1.282,
      0.85: 1.440,
      0.90: 1.645,
      0.95: 1.960,
      0.99: 2.576
    },
    sampleSizes: {
      enterprise: { display: 10, reliable: 30, confident: 100, robust: 384 },
      validated: { display: 5, reliable: 20, confident: 50, robust: 200 },
      quick: { display: 1, reliable: 10, confident: 30, robust: 100 }
    },
    marginOfErrorSamples: {
      0.10: 96,
      0.07: 196,
      0.05: 384,
      0.03: 1067,
      0.02: 2401,
      0.01: 9604
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // QUALITY SCORE CALCULATION
  // Composite score formula for response quality assessment
  // [REFERENCE: BIBLE-003, BIBLE-009, BIBLE-020]
  // ═══════════════════════════════════════════════════════════════
  qualityScoring: {
    // Component weights (must sum to 1.0)
    weights: {
      timing: 0.25,           // Speed/reading time analysis
      patterns: 0.30,         // Straight-lining, alternating detection
      attention: 0.25,        // Attention check performance
      fraud: 0.20             // IP/device fraud signals
    },

    // Individual component score ranges (0-100)
    componentFormulas: {
      // Timing Score (0-100)
      // Based on how close response time is to expected reading time
      timing: {
        perfect: 100,         // Time within 80-120% of expected
        good: 80,             // Time within 60-150% of expected
        acceptable: 60,       // Time within 30-200% of expected
        poor: 30,             // Time outside acceptable range
        speeder: 0            // Below speeding threshold
      },

      // Pattern Score (0-100)
      // Inverse of suspicious pattern detection
      patterns: {
        noPatterns: 100,      // No suspicious patterns
        lowStraightLine: 80,  // < 60% straight-lining
        mediumStraightLine: 50, // 60-80% straight-lining
        highStraightLine: 20, // 80-90% straight-lining
        criticalStraightLine: 0 // > 90% straight-lining
      },

      // Attention Score (0-100)
      // Based on attention check pass rate
      attention: {
        allPassed: 100,       // 100% attention checks correct
        mostPassed: 80,       // >= 70% correct
        somePassed: 40,       // 40-70% correct
        fewPassed: 10,        // < 40% correct
        allFailed: 0          // 0% correct
      },

      // Fraud Score (0-100)
      // Starts at 100, penalties subtracted
      fraud: {
        baseScore: 100,
        // Penalties (subtracted from base)
        penalties: {
          knownBadIP: -50,
          vpnDetected: -20,
          torDetected: -40,
          datacenterIP: -25,
          proxyDetected: -15,
          deviceFingerprint: -30, // Previously flagged device
          geolocationMismatch: -15,
          rapidFireSubmission: -40
        }
      }
    },

    // Final score thresholds
    thresholds: {
      excellent: 85,          // >= 85: High confidence
      good: 70,               // 70-84: Acceptable quality
      review: 50,             // 50-69: Manual review suggested
      poor: 30,               // 30-49: Flag for review
      reject: 0               // < 30: Auto-reject/exclude
    },

    // Actions based on final score
    actions: {
      excellent: "INCLUDE",
      good: "INCLUDE",
      review: "REVIEW",
      poor: "FLAG",
      reject: "EXCLUDE"
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TEXT CONSTRAINTS - Ref: bible-005.md, bible-006.md
  // ═══════════════════════════════════════════════════════════════
  text: {
    user: {
      username: { min: 3, max: 30, pattern: '^[a-zA-Z0-9_]+$' },
      displayName: { min: 2, max: 50 },
      bio: { max: 500 },
      email: { max: 255 },
      phone: { max: 20 }
    },
    poll: {
      question: { min: 10, max: 500 },
      option: { min: 1, max: 200 },
      description: { max: 2000 }
    },
    survey: {
      title: { min: 5, max: 200 },
      description: { max: 5000 }
    },
    search: {
      query: { max: 200 }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // MEDIA CONSTRAINTS - Ref: bible-005.md, bible-006.md, bible-010.md
  // ═══════════════════════════════════════════════════════════════
  media: {
    avatar: {
      maxSizeMB: 2,
      formats: ['image/jpeg', 'image/png', 'image/webp'],
      dimensions: { min: 100, max: 1000 }
    },
    pollImage: {
      maxSizeMB: 5,
      formats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    },
    surveyAttachment: {
      maxSizeMB: 10,
      formats: ['application/pdf', 'image/jpeg', 'image/png']
    },
    comment: {
      maxImages: 4,
      maxImageMB: 5,
      maxGifMB: 10,
      formats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      gifProvider: 'giphy'
    },
    qrCode: {
      minSize: 100,
      maxSize: 1000,
      defaultSize: 300,
      format: 'png'
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // NOTIFICATION CONFIG - Ref: bible-012.md
  // ═══════════════════════════════════════════════════════════════
  notifications: {
    aggregation: {
      windowMs: 3600000, // 1 hour
      maxCounts: {
        followers: 50,
        comments: 20,
        likes: 100
      }
    },
    retention: {
      userActivity: 30,
      system: 90,
      security: 365
    },
    channels: {
      push: { enabled: true, batchInterval: 60000 },
      email: { enabled: true, digestInterval: 86400000 },
      sms: { enabled: true, rateLimit: 10 } // per day
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // FEED ALGORITHM - Ref: bible-011.md
  // ═══════════════════════════════════════════════════════════════
  feed: {
    hotScore: {
      halfLifeHours: 12,
      weights: {
        participation: 1.0,
        completion: 0.8,
        share: 0.5,
        discussion: 0.3
      },
      boosts: {
        reliabilityThreshold: 70,
        reliabilityMultiplier: 1.1,
        verifiedCreator: 1.05,
        organization: 1.02,
        minParticipants: 10
      },
      recency: {
        boostHours: 2,
        multiplier: 1.3
      }
    },
    composition: {
      sponsored: 0.40,
      trending: 0.30,
      category: 0.20,
      geographic: 0.10
    },
    pagination: {
      defaultPageSize: 20,
      maxPageSize: 100
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // GAMIFICATION - Ref: bible-015.md
  // ═══════════════════════════════════════════════════════════════
  gamification: {
    xp: {
      pollCreated: 50,
      pollParticipated: 10,
      testCompleted: 15,
      surveyCompleted: 25,
      commentPosted: 5,
      upvoteReceived: 2,
      badgeEarned: 100
    },
    levels: {
      baseXP: 100,
      exponent: 1.5
      // Formula: level N requires 100 × N^1.5 XP
    },
    badges: {
      pollCreator: { threshold: 1, type: 'achievement' },
      surveyMaster: { threshold: 10, minReliability: 75, type: 'skill' },
      centuryClub: { threshold: 100, type: 'milestone' },
      streak30: { threshold: 30, type: 'streak' },
      activeVoice: { threshold: 50, type: 'community' }
    },
    milestones: [100, 500, 1000, 5000, 10000, 50000, 100000]
  },

  // ═══════════════════════════════════════════════════════════════
  // LIVE POLL - Ref: bible-006.md, bible-021.md
  // ═══════════════════════════════════════════════════════════════
  livePoll: {
    maxParticipants: 10000,
    joinCodeLength: 6,
    joinCodeCharset: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // No 0,O,I,1 for clarity
    autoCloseMinutes: 240,
    privateLink: {
      codeLength: 12,
      maxUsesDefault: -1, // unlimited
      expiryDays: 7
    },
    websocket: {
      heartbeatInterval: 30000,
      reconnectAttempts: 5,
      reconnectDelay: 1000,

      // Soketi Scaling Limits - CRITICAL for capacity planning
      soketi: {
        // Per-instance limits
        maxConnectionsPerInstance: 10000,
        maxChannelsPerInstance: 100000,
        maxPresenceUsersPerChannel: 1000,
        maxMessageSize: 65536,              // 64KB
        maxMessagesPerSecond: 100,          // Per connection

        // Cluster configuration
        instances: {
          minimum: 2,                        // HA requirement
          maximum: 10,                       // Horizontal scale limit
          autoScale: {
            enabled: true,
            cpuThreshold: 70,               // Scale up at 70% CPU
            connectionThreshold: 8000,      // Scale up at 80% capacity
            cooldownSeconds: 300
          }
        },

        // Channel limits per poll type
        channelLimits: {
          livePoll: 10000,                  // Max concurrent per live poll
          standardPoll: 1000,               // Max concurrent per regular poll
          notification: 50000               // Broadcast channels
        },

        // Graceful degradation thresholds
        degradation: {
          updateThrottleAt: 8000,           // Throttle updates at 80%
          broadcastOnlyAt: 9000,            // No individual messages at 90%
          rejectNewAt: 9500                 // Reject new connections at 95%
        }
      }
    },
    waitingRoom: {
      enabled: true,
      threshold: 8000, // Enable at 80% capacity
      maxWaitTime: 300000 // 5 minutes
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // DATABASE & CACHE - Ref: bible-002.md
  // ═══════════════════════════════════════════════════════════════
  database: {
    pool: {
      // Connection pool sizing for 10K concurrent users
      // Formula: (cores * 2) + spindle_count, adjusted for cloud DB limits
      min: 10,                  // Minimum idle connections
      max: 100,                 // Max connections per app instance
      acquireTimeout: 10000,    // 10s to acquire connection
      idleTimeout: 30000,       // 30s idle before release
      maxLifetime: 1800000,     // 30min max connection lifetime

      // Per-environment overrides
      environments: {
        development: { min: 2, max: 10 },
        staging: { min: 5, max: 50 },
        production: { min: 10, max: 100 }
      },

      // Connection overflow handling
      overflow: {
        enabled: true,
        maxOverflow: 20,        // Allow 20 extra during spikes
        overflowTimeout: 5000   // Wait 5s for overflow connection
      },

      // Health check configuration
      healthCheck: {
        enabled: true,
        interval: 30000,        // Check every 30s
        query: 'SELECT 1',
        timeout: 5000
      }
    },
    retry: {
      maxAttempts: 3,
      initialDelay: 100,
      maxDelay: 5000,
      backoff: 'exponential'    // Exponential backoff strategy
    },

    // Query performance limits
    queryLimits: {
      defaultLimit: 50,         // Default pagination limit
      maxLimit: 1000,           // Maximum allowed limit
      slowQueryThreshold: 1000  // Log queries taking >1s
    }
  },
  cache: {
    ttl: {
      default: 300,           // 5 minutes
      analytics: 60,          // 1 minute (frequently updated)
      user: 600,              // 10 minutes
      config: 60,             // 1 minute
      pollResults: 30,        // 30 seconds (real-time updates)
      surveyResults: 60,      // 1 minute
      trending: 60,           // 1 minute
      feed: 180,              // 3 minutes
      permissions: 300        // 5 minutes
    },
    prefix: 'voxpoll:',

    // Cache Invalidation Rules - CRITICAL for data consistency
    invalidation: {
      // Write-through invalidation: invalidate immediately on write
      writeThrough: [
        'user:profile',       // Invalidate on profile update
        'user:settings',      // Invalidate on settings change
        'poll:metadata',      // Invalidate on poll edit
        'survey:metadata',    // Invalidate on survey edit
        'org:settings'        // Invalidate on org settings change
      ],

      // Event-driven invalidation triggers
      triggers: {
        pollVote: ['poll:results:{pollId}', 'poll:stats:{pollId}', 'trending:*'],
        surveySubmit: ['survey:results:{surveyId}', 'survey:stats:{surveyId}'],
        userFollow: ['user:followers:{userId}', 'user:following:{followerId}', 'feed:user:{userId}'],
        commentCreate: ['content:comments:{contentId}', 'content:stats:{contentId}'],
        membershipChange: ['org:members:{orgId}', 'user:orgs:{userId}', 'permissions:{userId}']
      },

      // Batch invalidation for bulk operations
      batchSize: 100,         // Max keys per batch invalidation
      batchDelay: 50,         // ms between batches

      // Cascading invalidation patterns
      cascade: {
        pollDelete: ['poll:*:{pollId}', 'feed:*', 'trending:*', 'user:content:{creatorId}'],
        userDelete: ['user:*:{userId}', 'feed:*', 'content:*:{userId}'],
        orgDelete: ['org:*:{orgId}', 'user:orgs:*']
      },

      // Stale-while-revalidate strategy for high-traffic keys
      staleWhileRevalidate: {
        enabled: true,
        staleTtl: 60,         // Serve stale for 60s while refreshing
        keys: ['trending:*', 'feed:discover', 'poll:popular:*']
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // SECURITY - Ref: bible-017.md
  // ═══════════════════════════════════════════════════════════════
  security: {
    hashing: {
      algorithm: 'argon2id',
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
      hashLength: 32
    },
    rateLimit: {
      windowMs: 60000,
      global: {
        authenticated: 1000,
        anonymous: 100
      },
      endpoints: {
        // Authentication endpoints
        login: { requests: 10, windowMs: 900000 },           // 10 per 15 min
        register: { requests: 5, windowMs: 3600000 },        // 5 per hour
        passwordReset: { requests: 3, windowMs: 3600000 },   // 3 per hour
        otp: { requests: 5, windowMs: 300000 },              // 5 per 5 min

        // Voting/Response endpoints - Critical for abuse prevention
        pollVote: { requests: 60, windowMs: 60000 },         // 60 per minute (prevents spam voting)
        surveySubmit: { requests: 10, windowMs: 60000 },     // 10 per minute
        surveyAnswer: { requests: 120, windowMs: 60000 },    // 120 per minute (per question)
        testSubmit: { requests: 10, windowMs: 60000 },       // 10 per minute

        // Content creation endpoints
        pollCreate: { requests: 10, windowMs: 3600000 },     // 10 per hour
        surveyCreate: { requests: 5, windowMs: 3600000 },    // 5 per hour
        commentCreate: { requests: 30, windowMs: 60000 },    // 30 per minute

        // Social endpoints
        follow: { requests: 100, windowMs: 3600000 },        // 100 per hour
        friendRequest: { requests: 50, windowMs: 3600000 },  // 50 per hour
        directMessage: { requests: 60, windowMs: 60000 }     // 60 per minute (tier-dependent)
      }
    },
    cors: {
      // Primary domains
      allowedOrigins: [
        'https://voxpoll.com',
        'https://www.voxpoll.com',
        'https://app.voxpoll.com',
        'https://embed.voxpoll.com',     // For iframe embeds
        'https://api.voxpoll.com'
      ],
      // Development origins (only in non-production)
      devOrigins: [
        'http://localhost:3000',
        'http://localhost:5173'
      ],
      // Allowed HTTP methods
      allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      // Headers client can send
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-ID',
        'X-Client-Version',
        'Accept-Language'
      ],
      // Headers exposed to client
      exposedHeaders: [
        'X-Request-ID',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset'
      ],
      // Allow cookies/auth headers
      credentials: true,
      // Preflight cache duration (24 hours)
      maxAge: 86400,
      // Organization white-label custom domains handled dynamically
      dynamicOriginValidation: true
    },
    headers: {
      hsts: { maxAge: 31536000, includeSubDomains: true },
      csp: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://cdn.voxpoll.com'],
        connectSrc: ["'self'", 'https://api.voxpoll.com']
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // RETENTION & COMPLIANCE - Ref: bible-017.md
  // ═══════════════════════════════════════════════════════════════
  retention: {
    userData: 365,
    auditLogs: 730,
    backups: 30,
    applicationLogs: 90,
    securityLogs: 2555 // 7 years
  },
  compliance: {
    kvkk: {
      responseDeadlineDays: 30,
      breachNotificationHours: 72
    },
    gdpr: {
      responseDeadlineDays: 30,
      breachNotificationHours: 72
    }
  }
} as const;

export type Config = typeof DEFAULT_CONFIG;
```



# ══════════════════════════════════════════════════════════════════════════════
# 23.4 INTERNATIONALIZATION (i18n) SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 23.4.1 i18n Architecture

```typescript
// File: src/i18n/index.ts

import { z } from 'zod';

// Supported locales
export const SUPPORTED_LOCALES = ['tr', 'en'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

// Default locale
export const DEFAULT_LOCALE: Locale = 'tr';

// Translation key type safety
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K
      : never
    }[keyof T]
  : never;

// i18n class
class I18n {
  private translations: Map<Locale, Record<string, unknown>> = new Map();
  private currentLocale: Locale = DEFAULT_LOCALE;

  async loadLocale(locale: Locale): Promise<void> {
    if (this.translations.has(locale)) return;

    const translations = await import(`./locales/${locale}.json`);
    this.translations.set(locale, translations.default);
  }

  setLocale(locale: Locale): void {
    if (SUPPORTED_LOCALES.includes(locale)) {
      this.currentLocale = locale;
    }
  }

  getLocale(): Locale {
    return this.currentLocale;
  }

  t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getNestedValue(
      this.translations.get(this.currentLocale),
      key
    );

    if (!translation) {
      // Fallback to default locale
      const fallback = this.getNestedValue(
        this.translations.get(DEFAULT_LOCALE),
        key
      );
      if (!fallback) return key;
      return this.interpolate(String(fallback), params);
    }

    return this.interpolate(String(translation), params);
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((acc, part) => {
      if (acc && typeof acc === 'object' && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  }

  private interpolate(str: string, params?: Record<string, string | number>): string {
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (_, key) =>
      params[key]?.toString() ?? `{${key}}`
    );
  }
}

export const i18n = new I18n();
```

## 23.4.2 User-Generated Content Language Policy

### [DECISION P-038] UGC Language Handling

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// USER-GENERATED CONTENT (UGC) LANGUAGE POLICY
// Defines how user-created content handles multiple languages
// ═══════════════════════════════════════════════════════════════════════════════

const UGC_LANGUAGE_POLICY = {
  // ─────────────────────────────────────────────────────────────────────────────
  // CONTENT CREATION
  // ─────────────────────────────────────────────────────────────────────────────

  contentCreation: {
    // Language detection
    autoDetect: true,                 // Detect language from content
    detectionProvider: "browser",     // browser | cld3 | langdetect
    confidenceThreshold: 0.8,         // Min confidence to set language

    // Creator can manually set language
    creatorOverride: true,
    supportedLanguages: ["tr", "en"], // MVP: Turkish and English only

    // What gets stored
    storage: {
      originalLanguage: true,         // Store detected/selected language
      originalContent: true,          // Always store original text
      translatedContent: false        // No auto-translation in MVP
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTENT DISPLAY
  // ─────────────────────────────────────────────────────────────────────────────

  contentDisplay: {
    // How users see content
    showOriginalLanguage: true,       // Always show in original language
    showLanguageIndicator: true,      // Show "🇹🇷 Turkish" badge
    showTranslateButton: false,       // No translation button in MVP

    // Language mismatch handling
    userLanguageMismatch: {
      // When content is in different language than user preference
      action: "SHOW_ORIGINAL",        // SHOW_ORIGINAL | HIDE | TRANSLATE
      showWarning: false,             // Don't warn "This is in Turkish"
      allowUserTranslate: false       // No manual translate option in MVP
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TRANSLATION (Future Feature)
  // ─────────────────────────────────────────────────────────────────────────────

  translation: {
    enabled: false,                   // NOT in MVP
    futureFeature: {
      version: "2.0",
      provider: "google-translate",   // or deepl, azure
      cacheTranslations: true,
      creatorCanDisable: true         // Creator can say "don't translate"
    },

    // When enabled, these rules apply
    rules: {
      autoTranslate: false,           // Never auto-translate
      onDemand: true,                 // User clicks "Translate"
      showBothVersions: true,         // Show original + translation
      translationDisclaimer: true     // "Translated by machine"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SEARCH & DISCOVERY
  // ─────────────────────────────────────────────────────────────────────────────

  searchAndDiscovery: {
    // Language-based filtering
    filterByLanguage: true,           // Users can filter by language
    defaultLanguageFilter: "USER_PREFERENCE", // USER_PREFERENCE | ALL | SPECIFIC

    // Search behavior
    search: {
      searchAllLanguages: true,       // Search finds content in any language
      boostUserLanguage: true,        // Prioritize user's language
      languageBoostFactor: 1.5        // 50% boost for matching language
    },

    // Feed algorithm
    feed: {
      languageMix: "PREFER_USER",     // PREFER_USER | STRICT_USER | ALL
      userLanguageWeight: 0.7,        // 70% user language
      otherLanguageWeight: 0.3        // 30% other languages
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTENT TYPES
  // Per-content-type language handling
  // ─────────────────────────────────────────────────────────────────────────────

  contentTypes: {
    poll: {
      detectLanguage: true,
      showLanguageIndicator: true,
      searchable: true
    },
    test: {
      detectLanguage: true,
      showLanguageIndicator: true,
      searchable: true
    },
    survey: {
      detectLanguage: true,
      showLanguageIndicator: true,
      // Organizations may have multi-language surveys
      multiLanguageSupport: true,     // Can have TR and EN versions
      linkedVersions: true            // Link TR/EN versions together
    },
    comment: {
      detectLanguage: false,          // Don't detect for comments
      showLanguageIndicator: false,
      searchable: false
    },
    profile: {
      detectLanguage: false,
      showLanguageIndicator: false,
      searchable: true
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // MODERATION
  // Language-aware content moderation
  // ─────────────────────────────────────────────────────────────────────────────

  moderation: {
    // Language detection for moderation
    detectForModeration: true,

    // Per-language moderation
    languageSpecificRules: {
      tr: {
        profanityList: "tr_profanity",
        customRules: true
      },
      en: {
        profanityList: "en_profanity",
        customRules: true
      }
    },

    // Mixed language content
    mixedLanguageHandling: "MODERATE_ALL"  // Apply rules for all detected languages
  }
}

// Detect content language
function detectContentLanguage(text: string): DetectedLanguage {
  if (!UGC_LANGUAGE_POLICY.contentCreation.autoDetect) {
    return { language: "unknown", confidence: 0 }
  }

  // Use browser's language detection or external service
  // This is a placeholder - actual implementation would use a library
  const detected = detectLanguage(text)

  if (detected.confidence >= UGC_LANGUAGE_POLICY.contentCreation.confidenceThreshold) {
    return detected
  }

  return { language: "unknown", confidence: detected.confidence }
}

interface DetectedLanguage {
  language: "tr" | "en" | "unknown"
  confidence: number
}

// Get feed content with language preferences
function getFeedLanguageQuery(userLanguage: "tr" | "en"): object {
  const policy = UGC_LANGUAGE_POLICY.searchAndDiscovery.feed

  if (policy.languageMix === "STRICT_USER") {
    return { language: userLanguage }
  }

  if (policy.languageMix === "ALL") {
    return {}
  }

  // PREFER_USER - use scoring
  return {
    OR: [
      { language: userLanguage, _relevance: { boost: policy.userLanguageWeight } },
      { language: { not: userLanguage }, _relevance: { boost: policy.otherLanguageWeight } }
    ]
  }
}

export { UGC_LANGUAGE_POLICY, detectContentLanguage, getFeedLanguageQuery }
export type { DetectedLanguage }
```

## 23.4.3 Turkish Translations (tr.json)

```json
{
  "common": {
    "loading": "Yükleniyor...",
    "error": "Bir hata oluştu",
    "success": "Başarılı",
    "cancel": "İptal",
    "confirm": "Onayla",
    "save": "Kaydet",
    "delete": "Sil",
    "edit": "Düzenle",
    "view": "Görüntüle",
    "close": "Kapat",
    "back": "Geri",
    "next": "İleri",
    "submit": "Gönder",
    "search": "Ara",
    "filter": "Filtrele",
    "sort": "Sırala",
    "clear": "Temizle",
    "refresh": "Yenile"
  },

  "auth": {
    "login": "Giriş Yap",
    "logout": "Çıkış Yap",
    "register": "Kayıt Ol",
    "forgotPassword": "Şifremi Unuttum",
    "resetPassword": "Şifre Sıfırla",
    "email": "E-posta",
    "password": "Şifre",
    "confirmPassword": "Şifre Tekrar",
    "rememberMe": "Beni Hatırla",

    "errors": {
      "invalidCredentials": "E-posta veya şifre hatalı",
      "accountLocked": "Hesabınız geçici olarak kilitlendi. {minutes} dakika sonra tekrar deneyin.",
      "sessionExpired": "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
      "passwordTooShort": "Şifre en az {min} karakter olmalı",
      "passwordTooLong": "Şifre en fazla {max} karakter olabilir",
      "passwordTooWeak": "Şifre en az {count} farklı karakter türü içermeli (küçük harf, büyük harf, rakam, özel karakter)",
      "passwordReused": "Bu şifre daha önce kullanılmış. Lütfen farklı bir şifre seçin.",
      "emailInUse": "Bu e-posta adresi zaten kullanımda",
      "invalidEmail": "Geçersiz e-posta adresi",
      "otpExpired": "Doğrulama kodu süresi doldu",
      "otpInvalid": "Geçersiz doğrulama kodu",
      "tooManyAttempts": "Çok fazla deneme yaptınız. {minutes} dakika sonra tekrar deneyin."
    },

    "success": {
      "loginSuccess": "Başarıyla giriş yaptınız",
      "registerSuccess": "Hesabınız oluşturuldu. Lütfen e-postanızı doğrulayın.",
      "passwordReset": "Şifreniz başarıyla değiştirildi",
      "emailVerified": "E-posta adresiniz doğrulandı"
    }
  },

  "validation": {
    "required": "Bu alan zorunludur",
    "minLength": "En az {min} karakter girilmeli",
    "maxLength": "En fazla {max} karakter girilebilir",
    "minValue": "Değer en az {min} olmalı",
    "maxValue": "Değer en fazla {max} olabilir",
    "invalidFormat": "Geçersiz format",
    "invalidPhone": "Geçersiz telefon numarası",
    "invalidUrl": "Geçersiz URL"
  },

  "poll": {
    "create": "Anket Oluştur",
    "question": "Soru",
    "options": "Seçenekler",
    "addOption": "Seçenek Ekle",
    "removeOption": "Seçeneği Kaldır",
    "vote": "Oy Ver",
    "results": "Sonuçlar",
    "totalVotes": "Toplam Oy: {count}",
    "endTime": "Bitiş Zamanı",
    "active": "Aktif",
    "ended": "Sona Erdi",
    "draft": "Taslak",

    "errors": {
      "questionTooShort": "Soru en az {min} karakter olmalı",
      "questionTooLong": "Soru en fazla {max} karakter olabilir",
      "minOptions": "En az {min} seçenek eklemelisiniz",
      "maxOptions": "En fazla {max} seçenek ekleyebilirsiniz",
      "optionTooShort": "Seçenek en az {min} karakter olmalı",
      "optionTooLong": "Seçenek en fazla {max} karakter olabilir",
      "duplicateOption": "Bu seçenek zaten eklenmiş",
      "alreadyVoted": "Bu ankete zaten oy verdiniz",
      "pollEnded": "Bu anket sona erdi",
      "dailyLimitReached": "Günlük anket oluşturma limitinize ulaştınız ({limit} anket)"
    },

    "success": {
      "created": "Anket başarıyla oluşturuldu",
      "voted": "Oyunuz kaydedildi",
      "deleted": "Anket silindi"
    }
  },

  "survey": {
    "create": "Anket Oluştur",
    "title": "Başlık",
    "description": "Açıklama",
    "questions": "Sorular",
    "responses": "Yanıtlar",
    "analytics": "Analizler",
    "export": "Dışa Aktar",
    "preview": "Önizleme",
    "publish": "Yayınla",

    "errors": {
      "titleRequired": "Başlık zorunludur",
      "minQuestions": "En az {min} soru eklemelisiniz",
      "maxQuestions": "En fazla {max} soru ekleyebilirsiniz",
      "monthlyLimitReached": "Aylık anket oluşturma limitinize ulaştınız ({limit} anket)",
      "responseLimitReached": "Yanıt limitinize ulaştınız ({limit} yanıt)"
    }
  },

  "test": {
    "create": "Test Oluştur",
    "start": "Teste Başla",
    "submit": "Testi Bitir",
    "score": "Puan",
    "badge": "Rozet",
    "correctAnswers": "Doğru Cevap: {count}",
    "wrongAnswers": "Yanlış Cevap: {count}",
    "timeSpent": "Geçen Süre: {time}",

    "errors": {
      "weeklyLimitReached": "Haftalık test oluşturma limitinize ulaştınız ({limit} test)"
    }
  },

  "quality": {
    "warnings": {
      "speeding": "Tamamlama süresi beklenenin %{percent}'i. Lütfen soruları dikkatli okuyun.",
      "slowpoke": "Çok uzun sürede tamamlandı",
      "straightLining": "Yanıtların %{percent}'i aynı. Lütfen her soruyu ayrı değerlendirin.",
      "attentionCheckFailed": "{count} dikkat sorusu başarısız",
      "inconsistentResponses": "Bazı yanıtlar tutarsız görünüyor"
    },
    "interpretations": {
      "gradeA": "Bu {type} yüksek güvenilirliğe sahip. Sonuçlar güvenle kullanılabilir.",
      "gradeB": "Bu {type} iyi güvenilirliğe sahip. Sonuçlar genel değerlendirme için uygundur.",
      "gradeC": "Bu {type} orta güvenilirliğe sahip. Sonuçlar dikkatli yorumlanmalıdır.",
      "gradeD": "Bu {type} düşük güvenilirliğe sahip. Sonuçlar yalnızca gösterge niteliğindedir.",
      "gradeF": "Bu {type} yetersiz güvenilirliğe sahip. Sonuçlar karar verme için uygun değildir."
    }
  },

  "notifications": {
    "commentReply": {
      "title": "Yorumunuza yanıt geldi",
      "body": "{user} yanıt verdi: {preview}"
    },
    "pollEnded": {
      "title": "Anket sonuçları hazır",
      "body": "'{title}' sona erdi. Sonuçları görüntüle."
    },
    "newFollower": {
      "title": "Yeni takipçi",
      "body": "{user} sizi takip etmeye başladı"
    },
    "mention": {
      "title": "Bir yorumda bahsedildiniz",
      "body": "{user} sizi bir yorumda etiketledi"
    },
    "milestoneReached": {
      "title": "Kilometre taşı!",
      "body": "'{title}' {count} katılıma ulaştı!"
    },
    "badgeEarned": {
      "title": "Yeni rozet kazandınız!",
      "body": "'{badge}' rozetini kazandınız"
    }
  },

  "errors": {
    "generic": "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
    "network": "Bağlantı hatası. İnternet bağlantınızı kontrol edin.",
    "notFound": "Aradığınız sayfa bulunamadı",
    "unauthorized": "Bu işlem için giriş yapmanız gerekiyor",
    "forbidden": "Bu işlemi yapmaya yetkiniz yok",
    "serverError": "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
    "maintenance": "Sistem bakımda. Lütfen daha sonra tekrar deneyin.",
    "rateLimited": "Çok fazla istek gönderdiniz. Lütfen {seconds} saniye bekleyin."
  },

  "live": {
    "join": "Katıl",
    "joinCode": "Katılım Kodu",
    "participants": "{count} Katılımcı",
    "waiting": "Bekleme Odası",
    "started": "Başladı",
    "ended": "Sona Erdi",

    "errors": {
      "invalidCode": "Geçersiz katılım kodu",
      "sessionEnded": "Bu oturum sona erdi",
      "sessionFull": "Maksimum katılımcı sayısına ulaşıldı",
      "waitingRoom": "Oturum dolu. Bekleme odasına alındınız. Sıranız: {position}"
    }
  },

  "contentTypes": {
    "poll": "anket",
    "survey": "araştırma",
    "test": "test"
  },

  "time": {
    "justNow": "Az önce",
    "minutesAgo": "{count} dakika önce",
    "hoursAgo": "{count} saat önce",
    "daysAgo": "{count} gün önce",
    "weeksAgo": "{count} hafta önce",
    "monthsAgo": "{count} ay önce",
    "yearsAgo": "{count} yıl önce"
  }
}
```

## 23.4.3 English Translations (en.json)

```json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "clear": "Clear",
    "refresh": "Refresh"
  },

  "auth": {
    "login": "Log In",
    "logout": "Log Out",
    "register": "Sign Up",
    "forgotPassword": "Forgot Password",
    "resetPassword": "Reset Password",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "rememberMe": "Remember Me",

    "errors": {
      "invalidCredentials": "Invalid email or password",
      "accountLocked": "Your account is temporarily locked. Try again in {minutes} minutes.",
      "sessionExpired": "Your session has expired. Please log in again.",
      "passwordTooShort": "Password must be at least {min} characters",
      "passwordTooLong": "Password must be at most {max} characters",
      "passwordTooWeak": "Password must contain at least {count} character types (lowercase, uppercase, digit, special)",
      "passwordReused": "This password was used before. Please choose a different password.",
      "emailInUse": "This email address is already in use",
      "invalidEmail": "Invalid email address",
      "otpExpired": "Verification code has expired",
      "otpInvalid": "Invalid verification code",
      "tooManyAttempts": "Too many attempts. Try again in {minutes} minutes."
    },

    "success": {
      "loginSuccess": "Successfully logged in",
      "registerSuccess": "Account created. Please verify your email.",
      "passwordReset": "Password successfully changed",
      "emailVerified": "Email address verified"
    }
  },

  "validation": {
    "required": "This field is required",
    "minLength": "Must be at least {min} characters",
    "maxLength": "Must be at most {max} characters",
    "minValue": "Value must be at least {min}",
    "maxValue": "Value must be at most {max}",
    "invalidFormat": "Invalid format",
    "invalidPhone": "Invalid phone number",
    "invalidUrl": "Invalid URL"
  },

  "poll": {
    "create": "Create Poll",
    "question": "Question",
    "options": "Options",
    "addOption": "Add Option",
    "removeOption": "Remove Option",
    "vote": "Vote",
    "results": "Results",
    "totalVotes": "Total Votes: {count}",
    "endTime": "End Time",
    "active": "Active",
    "ended": "Ended",
    "draft": "Draft",

    "errors": {
      "questionTooShort": "Question must be at least {min} characters",
      "questionTooLong": "Question must be at most {max} characters",
      "minOptions": "You must add at least {min} options",
      "maxOptions": "You can add at most {max} options",
      "optionTooShort": "Option must be at least {min} characters",
      "optionTooLong": "Option must be at most {max} characters",
      "duplicateOption": "This option already exists",
      "alreadyVoted": "You have already voted on this poll",
      "pollEnded": "This poll has ended",
      "dailyLimitReached": "You have reached your daily poll creation limit ({limit} polls)"
    },

    "success": {
      "created": "Poll created successfully",
      "voted": "Your vote has been recorded",
      "deleted": "Poll deleted"
    }
  },

  "survey": {
    "create": "Create Survey",
    "title": "Title",
    "description": "Description",
    "questions": "Questions",
    "responses": "Responses",
    "analytics": "Analytics",
    "export": "Export",
    "preview": "Preview",
    "publish": "Publish",

    "errors": {
      "titleRequired": "Title is required",
      "minQuestions": "You must add at least {min} questions",
      "maxQuestions": "You can add at most {max} questions",
      "monthlyLimitReached": "You have reached your monthly survey limit ({limit} surveys)",
      "responseLimitReached": "You have reached your response limit ({limit} responses)"
    }
  },

  "test": {
    "create": "Create Test",
    "start": "Start Test",
    "submit": "Submit Test",
    "score": "Score",
    "badge": "Badge",
    "correctAnswers": "Correct: {count}",
    "wrongAnswers": "Wrong: {count}",
    "timeSpent": "Time Spent: {time}",

    "errors": {
      "weeklyLimitReached": "You have reached your weekly test creation limit ({limit} tests)"
    }
  },

  "quality": {
    "warnings": {
      "speeding": "Completion time is {percent}% of expected. Please read questions carefully.",
      "slowpoke": "Took too long to complete",
      "straightLining": "{percent}% of responses are identical. Please consider each question individually.",
      "attentionCheckFailed": "{count} attention check(s) failed",
      "inconsistentResponses": "Some responses appear inconsistent"
    },
    "interpretations": {
      "gradeA": "This {type} has high reliability. Results can be used confidently.",
      "gradeB": "This {type} has good reliability. Results are suitable for general assessment.",
      "gradeC": "This {type} has moderate reliability. Results should be interpreted carefully.",
      "gradeD": "This {type} has low reliability. Results are indicative only.",
      "gradeF": "This {type} has insufficient reliability. Results are not suitable for decision-making."
    }
  },

  "notifications": {
    "commentReply": {
      "title": "Reply to your comment",
      "body": "{user} replied: {preview}"
    },
    "pollEnded": {
      "title": "Poll results are ready",
      "body": "'{title}' has ended. View results now."
    },
    "newFollower": {
      "title": "New follower",
      "body": "{user} started following you"
    },
    "mention": {
      "title": "You were mentioned",
      "body": "{user} mentioned you in a comment"
    },
    "milestoneReached": {
      "title": "Milestone reached!",
      "body": "'{title}' reached {count} participations!"
    },
    "badgeEarned": {
      "title": "New badge earned!",
      "body": "You earned the '{badge}' badge"
    }
  },

  "errors": {
    "generic": "An error occurred. Please try again later.",
    "network": "Connection error. Check your internet connection.",
    "notFound": "Page not found",
    "unauthorized": "Please log in to continue",
    "forbidden": "You don't have permission to do this",
    "serverError": "Server error. Please try again later.",
    "maintenance": "System under maintenance. Please try again later.",
    "rateLimited": "Too many requests. Please wait {seconds} seconds."
  },

  "live": {
    "join": "Join",
    "joinCode": "Join Code",
    "participants": "{count} Participants",
    "waiting": "Waiting Room",
    "started": "Started",
    "ended": "Ended",

    "errors": {
      "invalidCode": "Invalid join code",
      "sessionEnded": "This session has ended",
      "sessionFull": "Maximum participants reached",
      "waitingRoom": "Session is full. You've been placed in the waiting room. Position: {position}"
    }
  },

  "contentTypes": {
    "poll": "poll",
    "survey": "survey",
    "test": "test"
  },

  "time": {
    "justNow": "Just now",
    "minutesAgo": "{count} minutes ago",
    "hoursAgo": "{count} hours ago",
    "daysAgo": "{count} days ago",
    "weeksAgo": "{count} weeks ago",
    "monthsAgo": "{count} months ago",
    "yearsAgo": "{count} years ago"
  }
}
```

## 23.4.4 Pluralization Support

```typescript
// File: src/i18n/plurals.ts

type PluralRule = (count: number) => 'zero' | 'one' | 'few' | 'many' | 'other';

const pluralRules: Record<Locale, PluralRule> = {
  en: (count) => count === 1 ? 'one' : 'other',
  tr: (count) => count === 1 ? 'one' : 'other'
};

export function getPlural(locale: Locale, count: number): string {
  return pluralRules[locale](count);
}

// Usage in translations:
// "participants": {
//   "one": "{count} Participant",
//   "other": "{count} Participants"
// }
```


## 23.4.5 Quality Score Calculation Functions

```typescript
// File: src/quality/calculate-quality-score.ts
// [REFERENCE: BIBLE-003, BIBLE-009, BIBLE-020]

import { DEFAULT_CONFIG } from './config'

interface ResponseMetrics {
  // Timing metrics
  totalResponseTimeMs: number
  expectedReadTimeMs: number
  questionTimings: number[]  // Time spent on each question

  // Pattern metrics
  answers: (string | number)[]  // Sequence of answers
  straightLineRatio: number     // Calculated by pattern detector

  // Attention check metrics
  attentionChecksPassed: number
  attentionChecksTotal: number

  // Fraud metrics
  ipSignals: {
    isVPN: boolean
    isTor: boolean
    isDatacenter: boolean
    isProxy: boolean
    isKnownBad: boolean
  }
  deviceFlags: {
    previouslyFlagged: boolean
    geolocationMismatch: boolean
    rapidFireSubmission: boolean
  }
}

interface QualityScoreResult {
  finalScore: number                 // 0-100 composite score
  componentScores: {
    timing: number                   // 0-100
    patterns: number                 // 0-100
    attention: number                // 0-100
    fraud: number                    // 0-100
  }
  action: "INCLUDE" | "REVIEW" | "FLAG" | "EXCLUDE"
  flags: string[]                    // Human-readable flag descriptions
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT SCORE CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function calculateTimingScore(metrics: ResponseMetrics): number {
  const { totalResponseTimeMs, expectedReadTimeMs } = metrics
  const config = DEFAULT_CONFIG.quality.timing

  // Calculate ratio of actual to expected time
  const timeRatio = totalResponseTimeMs / expectedReadTimeMs

  // Speeding check (below threshold = 0 score)
  if (timeRatio < config.speedingThreshold) {
    return 0 // Speeder
  }

  // Slowpoke check (way too slow might be suspicious)
  if (timeRatio > config.slowpokeThreshold) {
    return 30 // Poor
  }

  // Perfect range: 80-120% of expected
  if (timeRatio >= 0.8 && timeRatio <= 1.2) {
    return 100
  }

  // Good range: 60-150%
  if (timeRatio >= 0.6 && timeRatio <= 1.5) {
    return 80
  }

  // Acceptable range: 30-200%
  if (timeRatio >= 0.3 && timeRatio <= 2.0) {
    return 60
  }

  return 30 // Poor
}

function calculatePatternScore(metrics: ResponseMetrics): number {
  const config = DEFAULT_CONFIG.quality.patterns

  // No straight-lining detected
  if (metrics.straightLineRatio < config.straightLining.warning) {
    return 100
  }

  // Low straight-lining (warning level)
  if (metrics.straightLineRatio < config.straightLining.high) {
    return 80
  }

  // Medium straight-lining (high level)
  if (metrics.straightLineRatio < config.straightLining.critical) {
    return 50
  }

  // High straight-lining (critical level)
  if (metrics.straightLineRatio < 0.95) {
    return 20
  }

  // Critical - nearly all same answers
  return 0
}

function calculateAttentionScore(metrics: ResponseMetrics): number {
  const { attentionChecksPassed, attentionChecksTotal } = metrics
  const config = DEFAULT_CONFIG.quality.attentionCheck

  // No attention checks = full score (can't penalize)
  if (attentionChecksTotal === 0) {
    return 100
  }

  const passRate = attentionChecksPassed / attentionChecksTotal

  if (passRate === 1.0) return 100          // All passed
  if (passRate >= config.includeThreshold) return 80  // Most passed
  if (passRate >= config.reviewThreshold) return 40   // Some passed
  if (passRate > 0) return 10               // Few passed
  return 0                                   // All failed
}

function calculateFraudScore(metrics: ResponseMetrics): number {
  const config = DEFAULT_CONFIG.quality.fraud
  const scoring = DEFAULT_CONFIG.qualityScoring.componentFormulas.fraud

  let score = scoring.baseScore // Start at 100

  // Apply IP-based penalties
  if (metrics.ipSignals.isKnownBad) score += scoring.penalties.knownBadIP
  if (metrics.ipSignals.isVPN) score += scoring.penalties.vpnDetected
  if (metrics.ipSignals.isTor) score += scoring.penalties.torDetected
  if (metrics.ipSignals.isDatacenter) score += scoring.penalties.datacenterIP
  if (metrics.ipSignals.isProxy) score += scoring.penalties.proxyDetected

  // Apply device/behavior penalties
  if (metrics.deviceFlags.previouslyFlagged) score += scoring.penalties.deviceFingerprint
  if (metrics.deviceFlags.geolocationMismatch) score += scoring.penalties.geolocationMismatch
  if (metrics.deviceFlags.rapidFireSubmission) score += scoring.penalties.rapidFireSubmission

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score))
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSITE SCORE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

function calculateQualityScore(metrics: ResponseMetrics): QualityScoreResult {
  const weights = DEFAULT_CONFIG.qualityScoring.weights
  const thresholds = DEFAULT_CONFIG.qualityScoring.thresholds
  const actions = DEFAULT_CONFIG.qualityScoring.actions

  // Calculate component scores
  const componentScores = {
    timing: calculateTimingScore(metrics),
    patterns: calculatePatternScore(metrics),
    attention: calculateAttentionScore(metrics),
    fraud: calculateFraudScore(metrics)
  }

  // Calculate weighted composite score
  const finalScore = Math.round(
    componentScores.timing * weights.timing +
    componentScores.patterns * weights.patterns +
    componentScores.attention * weights.attention +
    componentScores.fraud * weights.fraud
  )

  // Determine action based on threshold
  let action: "INCLUDE" | "REVIEW" | "FLAG" | "EXCLUDE"
  if (finalScore >= thresholds.excellent) {
    action = actions.excellent as "INCLUDE"
  } else if (finalScore >= thresholds.good) {
    action = actions.good as "INCLUDE"
  } else if (finalScore >= thresholds.review) {
    action = actions.review as "REVIEW"
  } else if (finalScore >= thresholds.poor) {
    action = actions.poor as "FLAG"
  } else {
    action = actions.reject as "EXCLUDE"
  }

  // Generate human-readable flags
  const flags: string[] = []
  if (componentScores.timing < 60) flags.push("TIMING_SUSPICIOUS")
  if (componentScores.patterns < 50) flags.push("STRAIGHT_LINING_DETECTED")
  if (componentScores.attention < 70) flags.push("ATTENTION_CHECK_FAILURES")
  if (componentScores.fraud < 70) flags.push("FRAUD_SIGNALS_DETECTED")

  return {
    finalScore,
    componentScores,
    action,
    flags
  }
}

export {
  calculateQualityScore,
  calculateTimingScore,
  calculatePatternScore,
  calculateAttentionScore,
  calculateFraudScore
}
export type { ResponseMetrics, QualityScoreResult }
```

## 23.4.5 Number & Date Formatting

```typescript
// File: src/i18n/formatters.ts

export const formatters = {
  number: (value: number, locale: Locale, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, options).format(value);
  },

  currency: (value: number, locale: Locale, currency: string = 'USD') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(value);
  },

  percent: (value: number, locale: Locale) => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1
    }).format(value);
  },

  date: (value: Date, locale: Locale, options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat(locale, options ?? defaultOptions).format(value);
  },

  relativeTime: (value: Date, locale: Locale): string => {
    const now = new Date();
    const diffMs = now.getTime() - value.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffSec < 60) return i18n.t('time.justNow');
    if (diffMin < 60) return rtf.format(-diffMin, 'minute');
    if (diffHour < 24) return rtf.format(-diffHour, 'hour');
    if (diffDay < 7) return rtf.format(-diffDay, 'day');
    if (diffWeek < 4) return rtf.format(-diffWeek, 'week');
    if (diffMonth < 12) return rtf.format(-diffMonth, 'month');
    return rtf.format(-diffYear, 'year');
  }
};
```



# ══════════════════════════════════════════════════════════════════════════════
# 23.17 EDGE CASES & WORST CASE SAFEGUARDS
# ══════════════════════════════════════════════════════════════════════════════

## 23.17.1 Concurrent User Limits

```typescript
// File: src/safeguards/capacity.ts

interface CapacityConfig {
  maxParticipants: number;
  warningThreshold: number;  // percentage (0.8 = 80%)
  criticalThreshold: number; // percentage (0.95 = 95%)
  waitingRoomEnabled: boolean;
  maxWaitTime: number;       // milliseconds
}

class CapacityManager {
  private currentCount: number = 0;
  private waitingQueue: Map<string, { userId: string; joinedAt: number }> = new Map();

  constructor(private config: CapacityConfig) {}

  async tryJoin(userId: string, sessionId: string): Promise<JoinResult> {
    const capacity = this.currentCount / this.config.maxParticipants;

    // Under warning threshold - allow immediately
    if (capacity < this.config.warningThreshold) {
      this.currentCount++;
      return { status: 'joined', position: null };
    }

    // Between warning and critical - allow but warn
    if (capacity < this.config.criticalThreshold) {
      this.currentCount++;
      return { status: 'joined', warning: 'approaching_capacity' };
    }

    // At or over capacity - waiting room
    if (this.config.waitingRoomEnabled && capacity >= this.config.criticalThreshold) {
      const position = this.addToWaitingRoom(userId);
      return {
        status: 'waiting',
        position,
        estimatedWait: this.estimateWaitTime(position)
      };
    }

    // No waiting room - reject
    return { status: 'rejected', reason: 'session_full' };
  }

  private addToWaitingRoom(userId: string): number {
    const ticket = crypto.randomUUID();
    this.waitingQueue.set(ticket, { userId, joinedAt: Date.now() });
    return this.waitingQueue.size;
  }

  private estimateWaitTime(position: number): number {
    // Estimate based on average participation duration
    const avgParticipationMs = 60000; // 1 minute average
    const turnoverRate = 0.1; // 10% turnover per minute
    return Math.ceil(position / (this.config.maxParticipants * turnoverRate)) * avgParticipationMs;
  }

  // Called when participant leaves
  onParticipantLeave(): void {
    this.currentCount = Math.max(0, this.currentCount - 1);
    this.processWaitingQueue();
  }

  private async processWaitingQueue(): Promise<void> {
    if (this.waitingQueue.size === 0) return;
    if (this.currentCount >= this.config.maxParticipants * this.config.criticalThreshold) return;

    // Get first in queue
    const [ticket, entry] = this.waitingQueue.entries().next().value;

    // Check if waited too long
    if (Date.now() - entry.joinedAt > this.config.maxWaitTime) {
      this.waitingQueue.delete(ticket);
      // Notify user of timeout
      await this.notifyWaitTimeout(entry.userId);
      this.processWaitingQueue(); // Process next
      return;
    }

    // Allow entry
    this.waitingQueue.delete(ticket);
    this.currentCount++;
    await this.notifyWaitComplete(entry.userId);
  }
}
```

## 23.17.1.1 Live Poll WebSocket Protocol

```typescript
// File: src/livepoll/websocket-protocol.ts
// [REFERENCE: BIBLE-006 Section 6.4.4 Live Poll, BIBLE-021 Link-based Participation]

// ═══════════════════════════════════════════════════════════════════════════════
// WEBSOCKET CONNECTION LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════════

interface WebSocketConfig {
  heartbeatIntervalMs: 30000,           // Send heartbeat every 30s
  heartbeatTimeoutMs: 10000,            // Wait 10s for heartbeat response
  reconnectAttempts: 5,                 // Max reconnection attempts
  reconnectDelayMs: 1000,               // Initial delay between attempts
  reconnectBackoffMultiplier: 2,        // Exponential backoff multiplier
  maxReconnectDelayMs: 30000,           // Cap delay at 30s
  messageQueueSize: 100,                // Queue messages during reconnect
  messageRetryAttempts: 3,              // Retry failed message sends
}

// CONNECTION STATE MACHINE
type ConnectionState =
  | "CONNECTING"      // Initial connection attempt
  | "CONNECTED"       // Successfully connected
  | "RECONNECTING"    // Lost connection, attempting reconnect
  | "DISCONNECTED"    // Intentionally disconnected
  | "FAILED"          // All reconnection attempts exhausted

interface ConnectionStateMachine {
  currentState: ConnectionState
  reconnectAttempt: number
  lastHeartbeat: number
  pendingMessages: LivePollMessage[]

  // State transitions
  onConnect(): void        // CONNECTING -> CONNECTED
  onDisconnect(): void     // CONNECTED -> RECONNECTING
  onReconnectFail(): void  // RECONNECTING -> FAILED (after max attempts)
  onReconnectSuccess(): void // RECONNECTING -> CONNECTED
  onIntentionalClose(): void // * -> DISCONNECTED
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type LivePollMessage =
  // Client -> Server
  | { type: "JOIN", sessionCode: string, fingerprint: string }
  | { type: "VOTE", optionId: string, timestamp: number }
  | { type: "HEARTBEAT" }
  | { type: "LEAVE" }

  // Server -> Client
  | { type: "JOIN_ACK", participantId: string, sessionState: SessionState }
  | { type: "JOIN_WAITING", position: number, estimatedWaitMs: number }
  | { type: "JOIN_REJECTED", reason: "SESSION_FULL" | "SESSION_ENDED" | "DUPLICATE" }
  | { type: "VOTE_ACK", voteId: string, accepted: boolean }
  | { type: "STATE_UPDATE", state: SessionState }
  | { type: "HEARTBEAT_ACK" }
  | { type: "SESSION_ENDED", finalResults: PollResults }
  | { type: "ERROR", code: string, message: string }

interface SessionState {
  currentQuestionId: string | null
  questionIndex: number
  totalQuestions: number
  participantCount: number
  voteCounts: Record<string, number>
  percentages: Record<string, number>
  timeRemainingMs: number | null
  status: "WAITING" | "ACTIVE" | "REVEALING" | "ENDED"
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECONNECTION LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

class LivePollConnection {
  private ws: WebSocket | null = null
  private state: ConnectionState = "DISCONNECTED"
  private reconnectAttempt = 0
  private messageQueue: LivePollMessage[] = []
  private heartbeatTimer: NodeJS.Timer | null = null
  private reconnectTimer: NodeJS.Timer | null = null

  async connect(sessionCode: string, fingerprint: string): Promise<void> {
    this.state = "CONNECTING"

    try {
      this.ws = new WebSocket(`wss://api.voxpoll.com/live/${sessionCode}`)

      this.ws.onopen = () => {
        this.state = "CONNECTED"
        this.reconnectAttempt = 0
        this.send({ type: "JOIN", sessionCode, fingerprint })
        this.startHeartbeat()
        this.flushMessageQueue()
      }

      this.ws.onclose = (event) => {
        if (event.code === 1000) {
          // Normal closure
          this.state = "DISCONNECTED"
        } else {
          // Unexpected closure - attempt reconnect
          this.handleDisconnect()
        }
      }

      this.ws.onerror = () => {
        this.handleDisconnect()
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data))
      }
    } catch (error) {
      this.handleDisconnect()
    }
  }

  private handleDisconnect(): void {
    this.stopHeartbeat()

    if (this.reconnectAttempt >= WebSocketConfig.reconnectAttempts) {
      this.state = "FAILED"
      this.onConnectionFailed()
      return
    }

    this.state = "RECONNECTING"
    this.reconnectAttempt++

    // Calculate delay with exponential backoff
    const delay = Math.min(
      WebSocketConfig.reconnectDelayMs *
        Math.pow(WebSocketConfig.reconnectBackoffMultiplier, this.reconnectAttempt - 1),
      WebSocketConfig.maxReconnectDelayMs
    )

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.sessionCode, this.fingerprint)
    }, delay)
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: "HEARTBEAT" })

        // Set timeout for response
        setTimeout(() => {
          if (Date.now() - this.lastHeartbeatAck > WebSocketConfig.heartbeatTimeoutMs) {
            // No heartbeat response - connection likely dead
            this.ws?.close()
            this.handleDisconnect()
          }
        }, WebSocketConfig.heartbeatTimeoutMs)
      }
    }, WebSocketConfig.heartbeatIntervalMs)
  }

  private send(message: LivePollMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else if (this.state === "RECONNECTING") {
      // Queue message for later delivery
      if (this.messageQueue.length < WebSocketConfig.messageQueueSize) {
        this.messageQueue.push(message)
      }
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) this.send(message)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOTE DEDUPLICATION & ORDERING
// ═══════════════════════════════════════════════════════════════════════════════

interface VoteRecord {
  participantId: string
  optionId: string
  clientTimestamp: number    // Client-side timestamp
  serverTimestamp: number    // Server receipt timestamp
  sequence: bigint           // Global sequence number for ordering
}

class VoteProcessor {
  private votes = new Map<string, VoteRecord>()
  private sequence = BigInt(0)

  processVote(participantId: string, optionId: string, clientTimestamp: number): VoteRecord {
    // Check for duplicate
    if (this.votes.has(participantId)) {
      const existing = this.votes.get(participantId)!
      // Only allow vote change if within grace period (2 seconds)
      if (Date.now() - existing.serverTimestamp > 2000) {
        throw new Error("VOTE_ALREADY_SUBMITTED")
      }
    }

    this.sequence++
    const record: VoteRecord = {
      participantId,
      optionId,
      clientTimestamp,
      serverTimestamp: Date.now(),
      sequence: this.sequence
    }

    this.votes.set(participantId, record)
    return record
  }

  // For race condition handling during poll close
  getVotesBeforeClose(closeTimestamp: number): VoteRecord[] {
    return Array.from(this.votes.values())
      .filter(v => v.serverTimestamp <= closeTimestamp)
      .sort((a, b) => Number(a.sequence - b.sequence))
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERCENTAGE CALCULATION (REAL-TIME)
// ═══════════════════════════════════════════════════════════════════════════════

interface VoteCountState {
  counts: Record<string, number>
  total: number
}

function calculatePercentages(state: VoteCountState): Record<string, number> {
  const percentages: Record<string, number> = {}

  for (const [optionId, count] of Object.entries(state.counts)) {
    if (state.total === 0) {
      percentages[optionId] = 0
    } else {
      // Use floor for all except last option (to ensure sum = 100)
      percentages[optionId] = Math.floor((count / state.total) * 100)
    }
  }

  // Adjust for rounding errors to ensure sum = 100
  const sum = Object.values(percentages).reduce((a, b) => a + b, 0)
  if (sum !== 100 && state.total > 0) {
    // Add difference to option with highest remainder
    const remainders = Object.entries(state.counts)
      .map(([id, count]) => ({
        id,
        remainder: ((count / state.total) * 100) - Math.floor((count / state.total) * 100)
      }))
      .sort((a, b) => b.remainder - a.remainder)

    percentages[remainders[0].id] += (100 - sum)
  }

  return percentages
}

export {
  WebSocketConfig,
  LivePollConnection,
  VoteProcessor,
  calculatePercentages
}
export type {
  ConnectionState,
  LivePollMessage,
  SessionState,
  VoteRecord
}
```

## 23.17.2 Data Overflow Protection

```typescript
// File: src/safeguards/overflow.ts

// Milestone generation for viral content
function generateDynamicMilestones(currentCount: number): number[] {
  const baseMilestones = [100, 500, 1000, 5000, 10000];
  const dynamicMilestones: number[] = [...baseMilestones];

  // Generate additional milestones for viral content
  if (currentCount > 10000) {
    let milestone = 50000;
    while (milestone <= currentCount * 2) {
      dynamicMilestones.push(milestone);
      if (milestone < 100000) milestone += 50000;
      else if (milestone < 1000000) milestone += 100000;
      else milestone += 1000000;
    }
  }

  return dynamicMilestones.filter(m => m > currentCount);
}

// XP calculation with overflow protection
function calculateLevelXP(level: number): number {
  const config = DEFAULT_CONFIG.gamification.levels;
  const maxLevel = 1000; // Prevent overflow
  const cappedLevel = Math.min(level, maxLevel);

  const xp = config.baseXP * Math.pow(cappedLevel, config.exponent);

  // Prevent Number.MAX_VALUE overflow
  return Math.min(xp, Number.MAX_SAFE_INTEGER);
}

// BigInt for very large vote counts
interface VoteCounts {
  total: bigint;
  byOption: Map<string, bigint>;
}

function incrementVote(counts: VoteCounts, optionId: string): void {
  counts.total += 1n;
  const current = counts.byOption.get(optionId) ?? 0n;
  counts.byOption.set(optionId, current + 1n);
}
```

## 23.17.3 Rate Limit Edge Cases

```typescript
// File: src/safeguards/ratelimit.ts

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // seconds
}

class SmartRateLimiter {
  constructor(
    private redis: Redis,
    private config: typeof DEFAULT_CONFIG.security.rateLimit
  ) {}

  async check(
    identifier: string,
    endpoint: string,
    context: RateLimitContext
  ): Promise<RateLimitResult> {
    // Composite key: IP + fingerprint for better accuracy
    const key = this.buildKey(identifier, context.fingerprint, endpoint);

    // Check for whitelist (internal services, admins)
    if (await this.isWhitelisted(context)) {
      return { allowed: true, remaining: Infinity, resetAt: new Date() };
    }

    // Get endpoint-specific or global limit
    const limit = this.config.endpoints[endpoint] ?? {
      requests: context.authenticated
        ? this.config.global.authenticated
        : this.config.global.anonymous,
      windowMs: this.config.windowMs
    };

    // Sliding window counter
    const now = Date.now();
    const windowStart = now - limit.windowMs;

    // Use Redis sorted set for sliding window
    const multi = this.redis.multi();
    multi.zremrangebyscore(key, '-inf', windowStart);
    multi.zadd(key, now, `${now}-${crypto.randomUUID()}`);
    multi.zcard(key);
    multi.pexpire(key, limit.windowMs);

    const [, , count] = await multi.exec();

    if (count > limit.requests) {
      const oldestInWindow = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const retryAfter = oldestInWindow.length > 0
        ? Math.ceil((parseInt(oldestInWindow[1]) + limit.windowMs - now) / 1000)
        : Math.ceil(limit.windowMs / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(now + retryAfter * 1000),
        retryAfter
      };
    }

    return {
      allowed: true,
      remaining: limit.requests - count,
      resetAt: new Date(now + limit.windowMs)
    };
  }

  // Graceful degradation for organization limits
  async checkOrganizationLimit(
    orgId: string,
    limitType: 'survey' | 'response'
  ): Promise<{ allowed: boolean; warning?: string; remaining: number }> {
    const usage = await this.getOrganizationUsage(orgId, limitType);
    const limit = await this.getOrganizationLimit(orgId, limitType);

    if (limit === -1) {
      return { allowed: true, remaining: Infinity };
    }

    const remaining = limit - usage;

    // Soft limit warning at 80%
    if (remaining <= limit * 0.2 && remaining > 0) {
      return {
        allowed: true,
        warning: 'approaching_limit',
        remaining
      };
    }

    // Hard limit
    if (remaining <= 0) {
      return {
        allowed: false,
        remaining: 0
      };
    }

    return { allowed: true, remaining };
  }
}
```

## 23.17.4 Fraud Detection False Positive Mitigation

```typescript
// File: src/safeguards/fraud.ts

interface FraudCheckContext {
  userId?: string;
  isNewAccount: boolean;
  accountAgeDays: number;
  previousParticipations: number;
  previousFraudFlags: number;
}

class AdaptiveFraudDetector {
  constructor(private config: typeof DEFAULT_CONFIG.quality.fraud) {}

  async evaluate(
    signals: FraudSignals,
    context: FraudCheckContext
  ): Promise<FraudEvaluation> {
    let score = 100; // Start with full trust
    const flags: FraudFlag[] = [];

    // Apply penalties
    for (const [signal, value] of Object.entries(signals)) {
      const penalty = this.calculatePenalty(signal, value, context);
      score -= penalty.amount;
      if (penalty.flag) flags.push(penalty.flag);
    }

    // Apply context-based adjustments
    score = this.applyContextAdjustments(score, context);

    // Determine action
    const action = this.determineAction(score, flags, context);

    return { score, flags, action };
  }

  private applyContextAdjustments(
    score: number,
    context: FraudCheckContext
  ): number {
    // Reduce penalty for established users
    if (context.previousParticipations > 50 && context.previousFraudFlags === 0) {
      // Trusted user bonus
      score = Math.min(100, score + 10);
    }

    // New account penalty (but not too harsh)
    if (context.isNewAccount && context.accountAgeDays < 7) {
      // Only apply if score is already suspicious
      if (score < 70) {
        score -= 5;
      }
    }

    // Rehabilitation: reduce penalty if user has improved
    if (context.previousFraudFlags > 0 && context.previousParticipations > context.previousFraudFlags * 10) {
      score = Math.min(100, score + 5);
    }

    return Math.max(0, Math.min(100, score));
  }

  private determineAction(
    score: number,
    flags: FraudFlag[],
    context: FraudCheckContext
  ): FraudAction {
    // Never auto-block established users
    if (context.previousParticipations > 100 && context.previousFraudFlags < 3) {
      if (score < this.config.blockThreshold) {
        return 'manual_review';
      }
    }

    if (score < this.config.blockThreshold) return 'block';
    if (score < this.config.highRiskThreshold) return 'flag_for_review';
    if (score < this.config.mediumRiskThreshold) return 'warn';
    return 'allow';
  }
}
```

## 23.17.5 Database Connection Resilience

```typescript
// File: src/safeguards/database.ts

class ResilientDatabaseClient {
  private connectionPool: DrizzleClient;
  private readonly config = DEFAULT_CONFIG.database;

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    const maxAttempts = options?.maxAttempts ?? this.config.retry.maxAttempts;
    const initialDelay = options?.initialDelay ?? this.config.retry.initialDelay;
    const maxDelay = options?.maxDelay ?? this.config.retry.maxDelay;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry non-transient errors
        if (!this.isTransientError(error)) {
          throw error;
        }

        if (attempt < maxAttempts) {
          await this.sleep(delay);
          delay = Math.min(delay * 2, maxDelay); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  private isTransientError(error: unknown): boolean {
    // Check for PostgreSQL connection errors (Drizzle-style)
    const pgErrorCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', '57P03'];
    if (error instanceof Error && 'code' in error) {
      return pgErrorCodes.includes((error as any).code);
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```



# ══════════════════════════════════════════════════════════════════════════════
# 23.18 GRACEFUL DEGRADATION PATTERNS
# ══════════════════════════════════════════════════════════════════════════════

## 23.18.1 Circuit Breaker Pattern

```typescript
// File: src/patterns/circuit-breaker.ts

enum CircuitState {
  CLOSED = 'closed',     // Normal operation
  OPEN = 'open',         // Failing, reject requests
  HALF_OPEN = 'half_open' // Testing if recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number;    // Failures before opening
  successThreshold: number;    // Successes to close
  timeout: number;             // Time in OPEN state before HALF_OPEN
  monitorInterval: number;     // Health check interval
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number = 0;

  constructor(
    private name: string,
    private config: CircuitBreakerConfig
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.timeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new CircuitOpenError(this.name);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.successes = 0;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Usage
const analyticsCircuit = new CircuitBreaker('analytics', {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000,
  monitorInterval: 5000
});
```

## 23.18.2 Fallback Strategies

```typescript
// File: src/patterns/fallback.ts

interface FallbackConfig<T> {
  primary: () => Promise<T>;
  fallback: () => Promise<T>;
  cache?: () => Promise<T | null>;
  default?: T;
  timeout?: number;
}

async function withFallback<T>(config: FallbackConfig<T>): Promise<T> {
  // Try cache first if available
  if (config.cache) {
    const cached = await config.cache();
    if (cached !== null) return cached;
  }

  // Try primary with timeout
  try {
    if (config.timeout) {
      const result = await Promise.race([
        config.primary(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), config.timeout)
        )
      ]);
      return result;
    }
    return await config.primary();
  } catch (primaryError) {
    console.warn('Primary operation failed, trying fallback:', primaryError);

    // Try fallback
    try {
      return await config.fallback();
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);

      // Return default if available
      if (config.default !== undefined) {
        return config.default;
      }

      throw fallbackError;
    }
  }
}

// Example: Analytics with graceful degradation
async function getAnalytics(contentId: string): Promise<Analytics> {
  return withFallback({
    primary: () => fetchDetailedAnalytics(contentId),
    fallback: () => fetchBasicAnalytics(contentId),
    cache: () => getCachedAnalytics(contentId),
    default: getEmptyAnalytics(contentId),
    timeout: 5000
  });
}
```

## 23.18.3 Feature Flags for Graceful Degradation

```typescript
// File: src/patterns/feature-flags.ts

interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  userSegments?: string[];
  fallbackBehavior: 'disable' | 'degrade' | 'cache';
}

class FeatureFlags {
  private flags: Map<string, FeatureFlag> = new Map();

  async isEnabled(
    flagName: string,
    context?: { userId?: string; segment?: string }
  ): Promise<boolean> {
    const flag = this.flags.get(flagName);
    if (!flag) return false;
    if (!flag.enabled) return false;

    // Check user segment
    if (flag.userSegments && context?.segment) {
      if (!flag.userSegments.includes(context.segment)) return false;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100 && context?.userId) {
      const hash = this.hashUserId(context.userId, flagName);
      if (hash > flag.rolloutPercentage) return false;
    }

    return true;
  }

  private hashUserId(userId: string, flagName: string): number {
    // Consistent hashing for stable rollout
    const combined = `${userId}:${flagName}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 100;
  }
}

// Predefined feature flags
const FEATURE_FLAGS: FeatureFlag[] = [
  {
    name: 'live_poll_waiting_room',
    enabled: true,
    rolloutPercentage: 100,
    fallbackBehavior: 'disable'
  },
  {
    name: 'advanced_fraud_detection',
    enabled: true,
    rolloutPercentage: 100,
    fallbackBehavior: 'degrade'
  },
  {
    name: 'real_time_analytics',
    enabled: true,
    rolloutPercentage: 80,
    fallbackBehavior: 'cache'
  }
];
```



# ══════════════════════════════════════════════════════════════════════════════
# 23.19 CONFIGURATION VALIDATION
# ══════════════════════════════════════════════════════════════════════════════

## 23.19.1 Startup Validation

```typescript
// File: src/config/validate.ts

import { z } from 'zod';

const configSchema = z.object({
  pricing: z.object({
    currency: z.string().length(3),
    individual: z.object({
      plus: z.object({ monthly: z.number().positive() }),
      premium: z.object({ monthly: z.number().positive() })
    })
  }),

  limits: z.object({
    poll: z.object({
      creationDaily: z.record(z.number().int()),
      optionsMin: z.number().int().min(2),
      optionsMax: z.number().int().max(20)
    })
  }),

  auth: z.object({
    password: z.object({
      minLength: z.number().int().min(8).max(128),
      maxLength: z.number().int().min(8).max(256)
    }).refine(
      data => data.minLength < data.maxLength,
      'minLength must be less than maxLength'
    )
  }),

  quality: z.object({
    fraud: z.object({
      blockThreshold: z.number().min(0).max(100),
      highRiskThreshold: z.number().min(0).max(100),
      mediumRiskThreshold: z.number().min(0).max(100)
    }).refine(
      data => data.blockThreshold < data.highRiskThreshold &&
              data.highRiskThreshold < data.mediumRiskThreshold,
      'Thresholds must be in ascending order: block < highRisk < mediumRisk'
    )
  })
});

export function validateConfig(config: unknown): void {
  const result = configSchema.safeParse(config);
  if (!result.success) {
    console.error('Configuration validation failed:');
    console.error(result.error.format());
    process.exit(1);
  }
  console.log('Configuration validated successfully');
}
```

## 23.19.2 Runtime Configuration Updates

```typescript
// File: src/config/runtime-updates.ts

interface ConfigUpdateEvent {
  key: string;
  oldValue: unknown;
  newValue: unknown;
  updatedBy: string;
  timestamp: Date;
}

class ConfigUpdateManager {
  private subscribers: Map<string, Set<(event: ConfigUpdateEvent) => void>> = new Map();

  subscribe(keyPattern: string, callback: (event: ConfigUpdateEvent) => void): () => void {
    if (!this.subscribers.has(keyPattern)) {
      this.subscribers.set(keyPattern, new Set());
    }
    this.subscribers.get(keyPattern)!.add(callback);

    // Return unsubscribe function
    return () => this.subscribers.get(keyPattern)?.delete(callback);
  }

  async updateConfig(
    key: string,
    value: unknown,
    updatedBy: string
  ): Promise<void> {
    // Validate new value
    await this.validateUpdate(key, value);

    // Get old value
    const oldValue = await config.get(key, null);

    // Store in database (Drizzle-style)
    await db.insert(runtimeConfigs)
      .values({ key, value, createdBy: updatedBy, active: true })
      .onConflictDoUpdate({
        target: runtimeConfigs.key,
        set: { value, updatedBy, updatedAt: new Date() }
      });

    // Invalidate cache
    config.invalidateCache(key);

    // Notify subscribers
    const event: ConfigUpdateEvent = {
      key,
      oldValue,
      newValue: value,
      updatedBy,
      timestamp: new Date()
    };

    this.notifySubscribers(event);

    // Audit log
    await this.logConfigChange(event);
  }

  private notifySubscribers(event: ConfigUpdateEvent): void {
    for (const [pattern, callbacks] of this.subscribers) {
      if (this.matchesPattern(event.key, pattern)) {
        callbacks.forEach(cb => cb(event));
      }
    }
  }

  private matchesPattern(key: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return key.startsWith(prefix);
    }
    return key === pattern;
  }
}
```



# ══════════════════════════════════════════════════════════════════════════════
# 23.20 CROSS-REFERENCE INDEX
# ══════════════════════════════════════════════════════════════════════════════

## Configuration References by Bible Section

| Config Area              | Bible References                    | Config Keys                           |
|--------------------------|-------------------------------------|---------------------------------------|
| Pricing                  | BIBLE-000, BIBLE-005                | `pricing.*`                           |
| Content Limits           | BIBLE-006, BIBLE-015                | `limits.poll.*`, `limits.survey.*`    |
| Verification             | BIBLE-004, BIBLE-005                | `verification.*`                      |
| Authentication           | BIBLE-005, BIBLE-017                | `auth.*`                              |
| Quality/Fraud            | BIBLE-003, BIBLE-009, BIBLE-020     | `quality.*`                           |
| Statistics               | BIBLE-003, BIBLE-020                | `statistics.*`                        |
| Text Constraints         | BIBLE-005, BIBLE-006, BIBLE-010     | `text.*`                              |
| Media Limits             | BIBLE-005, BIBLE-006, BIBLE-010     | `media.*`                             |
| Notifications            | BIBLE-012                           | `notifications.*`                     |
| Feed Algorithm           | BIBLE-011                           | `feed.*`                              |
| Gamification             | BIBLE-015                           | `gamification.*`                      |
| Live Poll                | BIBLE-006, BIBLE-021                | `livePoll.*`                          |
| Database                 | BIBLE-002                           | `database.*`                          |
| Cache                    | BIBLE-002, BIBLE-008                | `cache.*`                             |
| Security                 | BIBLE-017                           | `security.*`                          |
| Retention                | BIBLE-017                           | `retention.*`                         |
| Compliance               | BIBLE-017                           | `compliance.*`                        |
| i18n Messages            | All user-facing sections            | Locale files (tr.json, en.json)       |

## Decision References

| Decision | Description                           | Config Impact                          |
|----------|---------------------------------------|----------------------------------------|
| P-022    | Externalize all hardcoded values      | All `DEFAULT_CONFIG` values            |
| P-023    | i18n support for TR/EN               | Locale files, formatters               |
| P-024    | Graceful degradation patterns         | Circuit breakers, fallbacks            |
| P-025    | Edge case safeguards                  | Capacity, overflow, rate limit handlers|

---

# END OF SECTION 23
# BIBLE-023: CONFIGURATION SYSTEM, i18n & SCALABILITY PATTERNS
