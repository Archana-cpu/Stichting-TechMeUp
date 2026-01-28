// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - REDIS RATE LIMIT MIDDLEWARE
// [AUTHORITATIVE: bible-031 - Rate Limits]
// Best Practice: Token Bucket with Redis for distributed rate limiting
// Reference: https://dev.to/hexshift/rate-limiting-in-nodejs-using-redis-and-token-bucket-algorithm-30ah
// ══════════════════════════════════════════════════════════════════════════════

import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import { ApiError } from './error-handler'
import { getRedis } from '../lib/redis'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Token Bucket Lua Script (Atomic Operation)
// Reference: https://github.com/koshnic/ratelimit
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_BUCKET_SCRIPT = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

-- Get current bucket state
local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1])
local last_refill = tonumber(bucket[2])

-- Initialize bucket if not exists
if tokens == nil then
  tokens = capacity
  last_refill = now
end

-- Calculate tokens to add based on time passed
local time_passed = now - last_refill
local tokens_to_add = math.floor(time_passed * refill_rate / 1000)
tokens = math.min(capacity, tokens + tokens_to_add)

-- Update last refill time only if tokens were added
if tokens_to_add > 0 then
  last_refill = now
end

-- Check if enough tokens
local allowed = 0
local remaining = tokens

if tokens >= requested then
  tokens = tokens - requested
  remaining = tokens
  allowed = 1
end

-- Save bucket state with TTL (2x window for cleanup)
local ttl = math.ceil(capacity / refill_rate * 2)
redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)
redis.call('EXPIRE', key, ttl)

-- Return: allowed (1/0), remaining tokens, reset time (ms until full)
local reset_time = math.ceil((capacity - remaining) / refill_rate * 1000)
return {allowed, remaining, reset_time}
`

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit Configuration [AUTHORITATIVE: bible-031 §31.1]
// ─────────────────────────────────────────────────────────────────────────────

export interface RateLimitConfig {
  /** Max tokens (requests) in the bucket */
  limit: number
  /** Window size in seconds (for calculating refill rate) */
  window: number
  /** Key prefix for namespacing */
  prefix?: string
  /** Skip rate limiting for certain conditions */
  skip?: (c: unknown) => boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier-Based Limits (Bible P-027, P-101)
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionTier = 'FREE' | 'PLUS' | 'PREMIUM'

// [AUTHORITATIVE: P-027, P-058] Tier-based limits
export const TIER_LIMITS = {
  FREE: {
    pollsPerDay: 3,              // P-058: 3/day
    testsPerWeek: 3,             // P-058: 3/week
    surveysPerMonth: 0,          // P-015: Surveys B2B only
    dmsPerDay: 0,                // P-058: FREE=0 DMs
    maxPollOptions: 4,           // P-027: 2-4 options (Quick Poll)
    livePollsPerDay: 0,          // P-014: Live Poll PREMIUM only
    commentsPerHour: 30,         // P-058: 30/hour
  },
  PLUS: {
    pollsPerDay: 10,             // P-058: 10/day
    testsPerWeek: 10,            // P-058: 10/week
    surveysPerMonth: 0,          // P-015: Surveys B2B only
    dmsPerDay: 25,               // P-058: 25/day
    maxPollOptions: 4,           // P-027: 2-4 options (Quick Poll only)
    livePollsPerDay: 0,          // P-014: Live Poll PREMIUM only
    commentsPerHour: 30,         // P-058: 30/hour
  },
  PREMIUM: {
    pollsPerDay: Infinity,       // P-058: unlimited
    testsPerWeek: Infinity,      // P-058: unlimited
    surveysPerMonth: 0,          // P-015: Surveys B2B only (org context)
    dmsPerDay: 1000,             // P-058: 1000/day (effectively unlimited)
    maxPollOptions: 10,          // P-027: 2-10 options (Extended Poll)
    livePollsPerDay: Infinity,   // P-014: PREMIUM feature
    commentsPerHour: 100,        // P-058: higher limit for premium
  },
} as const

// Default limits from bible-031
export const RATE_LIMITS = {
  // Auth endpoints (strict)
  login: { limit: 5, window: 900, prefix: 'rl:auth:login' },           // 5 per 15min
  register: { limit: 3, window: 3600, prefix: 'rl:auth:register' },   // 3 per hour
  passwordReset: { limit: 3, window: 3600, prefix: 'rl:auth:reset' }, // 3 per hour
  oauth: { limit: 10, window: 900, prefix: 'rl:auth:oauth' },         // 10 per 15min

  // Content creation (moderate) - Base limits, overridden by tier
  createPoll: { limit: 10, window: 3600, prefix: 'rl:poll:create' },  // 10 per hour
  createSurvey: { limit: 5, window: 3600, prefix: 'rl:survey:create' }, // 5 per hour
  createTest: { limit: 3, window: 3600, prefix: 'rl:test:create' },   // 3 per hour
  vote: { limit: 30, window: 3600, prefix: 'rl:vote' },               // 30 per hour (reduced from 100)
  votePerPoll: { limit: 1, window: 60, prefix: 'rl:vote:poll' },      // 1 per poll per minute (prevents rapid voting)
  comment: { limit: 20, window: 3600, prefix: 'rl:comment' },         // 20 per hour

  // Live poll operations
  livePollCreate: { limit: 5, window: 3600, prefix: 'rl:live:create' }, // 5 per hour
  livePollJoin: { limit: 30, window: 60, prefix: 'rl:live:join' },     // 30 per minute
  livePollVote: { limit: 60, window: 60, prefix: 'rl:live:vote' },     // 60 per minute

  // File uploads
  upload: { limit: 20, window: 3600, prefix: 'rl:upload' },           // 20 per hour
  avatarUpload: { limit: 5, window: 3600, prefix: 'rl:avatar' },      // 5 per hour

  // General API (lenient)
  api: { limit: 100, window: 60, prefix: 'rl:api' },                  // 100 per minute
  apiAuthenticated: { limit: 300, window: 60, prefix: 'rl:api:auth' }, // 300 per minute (authenticated)
  search: { limit: 30, window: 60, prefix: 'rl:search' },             // 30 per minute

  // Social actions
  follow: { limit: 50, window: 3600, prefix: 'rl:follow' },           // 50 per hour
  block: { limit: 20, window: 3600, prefix: 'rl:block' },             // 20 per hour
  report: { limit: 10, window: 3600, prefix: 'rl:report' },           // 10 per hour
  dm: { limit: 5, window: 86400, prefix: 'rl:dm' },                   // Base: 5 per day

  // Notifications
  notification: { limit: 60, window: 60, prefix: 'rl:notif' },        // 60 per minute

  // Sensitive operations
  deleteAccount: { limit: 1, window: 86400, prefix: 'rl:delete' },    // 1 per day
  exportData: { limit: 2, window: 86400, prefix: 'rl:export' },       // 2 per day
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit Middleware Factory (Redis Token Bucket)
// Best Practice: User ID > API Key > IP for identification
// Reference: https://dev.to/fiberplane/an-introduction-to-rate-limiting-3j0
// ─────────────────────────────────────────────────────────────────────────────

export function rateLimit(config: RateLimitConfig) {
  return createMiddleware<AppEnv>(async (c, next) => {
    // Allow skipping rate limit for certain conditions
    if (config.skip?.(c)) {
      await next()
      return
    }

    // Best Practice: Prefer user ID over IP (IPs can be shared via NAT/VPN)
    const userId = c.get('userId')
    const ip =
      c.req.header('cf-connecting-ip') || // Cloudflare
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      'unknown'

    const identifier = userId || ip
    const key = `${config.prefix || 'rl'}:${identifier}`

    const redis = getRedis()
    const now = Date.now()

    // Calculate refill rate (tokens per second)
    const refillRate = config.limit / config.window

    try {
      // Execute Lua script atomically
      const result = (await redis.eval(
        TOKEN_BUCKET_SCRIPT,
        1,
        key,
        config.limit.toString(),
        refillRate.toString(),
        now.toString(),
        '1' // Request 1 token
      )) as [number, number, number]

      const [allowed, remaining, resetTimeMs] = result
      const resetTime = Math.ceil((now + resetTimeMs) / 1000)

      // Set standard rate limit headers (draft-7)
      // Reference: https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-07.html
      c.header('RateLimit-Limit', config.limit.toString())
      c.header('RateLimit-Remaining', remaining.toString())
      c.header('RateLimit-Reset', resetTime.toString())

      // Legacy headers for compatibility
      c.header('X-RateLimit-Limit', config.limit.toString())
      c.header('X-RateLimit-Remaining', remaining.toString())
      c.header('X-RateLimit-Reset', resetTime.toString())

      if (!allowed) {
        const retryAfter = Math.ceil(resetTimeMs / 1000)
        c.header('Retry-After', retryAfter.toString())

        throw ApiError.tooManyRequests(
          `Rate limit exceeded. Try again in ${retryAfter} seconds.`
        )
      }

      await next()
    } catch (err) {
      // If Redis fails, log and allow request (fail-open for availability)
      // Best Practice: Decide fail-open vs fail-closed based on endpoint sensitivity
      if (err instanceof ApiError) {
        throw err
      }

      console.error('[RateLimit] Redis error, allowing request:', err)
      await next()
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined Rate Limiter (Multiple limits for same route)
// Example: Login has both per-user and per-IP limits
// ─────────────────────────────────────────────────────────────────────────────

export function combinedRateLimit(configs: RateLimitConfig[]) {
  return createMiddleware<AppEnv>(async (c, next) => {
    for (const config of configs) {
      const middleware = rateLimit(config)
      await new Promise<void>((resolve, reject) => {
        middleware(c, () => {
          resolve()
          return Promise.resolve()
        }).catch(reject)
      })
    }
    await next()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-Resource Rate Limiter (includes resource ID in key)
// Example: 1 vote per poll per minute per user
// ─────────────────────────────────────────────────────────────────────────────

export function perResourceRateLimit(
  config: RateLimitConfig,
  getResourceId: (c: Context<AppEnv>) => string
) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const resourceId = getResourceId(c)
    const resourceConfig = {
      ...config,
      prefix: `${config.prefix}:${resourceId}`,
    }

    const middleware = rateLimit(resourceConfig)
    await new Promise<void>((resolve, reject) => {
      middleware(c, () => {
        resolve()
        return Promise.resolve()
      }).catch(reject)
    })
    await next()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier-Aware Rate Limiter (Bible P-027, P-101)
// Applies different limits based on user's subscription tier
// ─────────────────────────────────────────────────────────────────────────────

type TierLimitType = keyof typeof TIER_LIMITS.FREE

interface TierRateLimitConfig {
  type: TierLimitType
  window: number
  prefix: string
}

export function tierRateLimit(config: TierRateLimitConfig) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')
    const tier: SubscriptionTier = (user?.subscriptionTier as SubscriptionTier) ?? 'FREE'

    const limit = TIER_LIMITS[tier][config.type]

    if (limit === Infinity) {
      await next()
      return
    }

    const rateLimitConfig: RateLimitConfig = {
      limit: limit as number,
      window: config.window,
      prefix: `${config.prefix}:${tier.toLowerCase()}`,
    }

    const middleware = rateLimit(rateLimitConfig)
    await new Promise<void>((resolve, reject) => {
      middleware(c, () => {
        resolve()
        return Promise.resolve()
      }).catch(reject)
    })
    await next()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-configured Tier Rate Limits
// ─────────────────────────────────────────────────────────────────────────────

export const TIER_RATE_LIMITS = {
  createPoll: () => tierRateLimit({
    type: 'pollsPerDay',
    window: 86400,
    prefix: 'rl:tier:poll:create',
  }),

  createTest: () => tierRateLimit({
    type: 'testsPerWeek',
    window: 604800,
    prefix: 'rl:tier:test:create',
  }),

  createSurvey: () => tierRateLimit({
    type: 'surveysPerMonth',
    window: 2592000,
    prefix: 'rl:tier:survey:create',
  }),

  createLivePoll: () => tierRateLimit({
    type: 'livePollsPerDay',
    window: 86400,
    prefix: 'rl:tier:live:create',
  }),

  sendDM: () => tierRateLimit({
    type: 'dmsPerDay',
    window: 86400,
    prefix: 'rl:tier:dm',
  }),

  comment: () => tierRateLimit({
    type: 'commentsPerHour',
    window: 3600,
    prefix: 'rl:tier:comment',
  }),
}

// ─────────────────────────────────────────────────────────────────────────────
// Poll Option Limit Validator (Bible P-027)
// ─────────────────────────────────────────────────────────────────────────────

export function validatePollOptionCount(tier: SubscriptionTier, optionCount: number): boolean {
  const maxOptions = TIER_LIMITS[tier].maxPollOptions
  return optionCount <= maxOptions
}

export function getMaxPollOptions(tier: SubscriptionTier): number {
  return TIER_LIMITS[tier].maxPollOptions
}
