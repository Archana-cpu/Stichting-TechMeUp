// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - RATE LIMIT TESTS
// [BIBLE: P-058 - Rate Limiting Thresholds]
// Bible Source: 00-MASTER/DECISIONS.md, P-058
// Implementation: apps/api/src/middleware/rate-limit.ts
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Context } from 'hono'
import {
  rateLimit,
  combinedRateLimit,
  perResourceRateLimit,
  tierRateLimit,
  exponentialBackoff,
  RATE_LIMITS,
  TIER_LIMITS,
  TIER_RATE_LIMITS,
  EXPONENTIAL_BACKOFF_LIMITS,
  validatePollOptionCount,
  getMaxPollOptions,
} from '../middleware/rate-limit'
import type { AppEnv } from '../types'

// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────────────────

vi.mock('../lib/redis', () => ({
  getRedis: vi.fn(() => mockRedis),
}))

const mockRedis = {
  eval: vi.fn(),
  hmget: vi.fn(),
  hmset: vi.fn(),
  expire: vi.fn(),
}

function createMockContext(overrides?: Partial<Context<AppEnv>>): Context<AppEnv> {
  const headers: Record<string, string> = {}
  const variables = new Map<string, unknown>()

  return {
    req: {
      header: vi.fn((key: string) => headers[key]),
    },
    get: vi.fn((key: string) => variables.get(key)),
    set: vi.fn((key: string, value: unknown) => variables.set(key, value)),
    header: vi.fn((key: string, value: string) => {
      headers[key] = value
    }),
    ...overrides,
  } as unknown as Context<AppEnv>
}

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Token Bucket Algorithm
// Bible: P-058 (rate limiting foundation)
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit Middleware - Token Bucket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Token Bucket Algorithm', () => {
    it('should allow request when tokens are available', async () => {
      mockRedis.eval.mockResolvedValue([1, 4, 60000])

      const middleware = rateLimit({
        limit: 5,
        window: 60,
        prefix: 'rl:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await middleware(c, next)

      expect(next).toHaveBeenCalled()
      expect(c.header).toHaveBeenCalledWith('RateLimit-Limit', '5')
      expect(c.header).toHaveBeenCalledWith('RateLimit-Remaining', '4')
    })

    it('should reject request when no tokens available (429)', async () => {
      mockRedis.eval.mockResolvedValue([0, 0, 30000])

      const middleware = rateLimit({
        limit: 5,
        window: 60,
        prefix: 'rl:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await expect(middleware(c, next)).rejects.toThrow('Rate limit exceeded')
      expect(next).not.toHaveBeenCalled()
      expect(c.header).toHaveBeenCalledWith('Retry-After', '30')
    })

    it('should consume exactly 1 token per request', async () => {
      mockRedis.eval.mockResolvedValue([1, 4, 60000])

      const middleware = rateLimit({
        limit: 5,
        window: 60,
        prefix: 'rl:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await middleware(c, next)

      const evalCall = mockRedis.eval.mock.calls[0]
      expect(evalCall[6]).toBe('1')
    })

    it('should calculate correct refill rate', async () => {
      mockRedis.eval.mockResolvedValue([1, 99, 60000])

      const middleware = rateLimit({
        limit: 100,
        window: 60,
        prefix: 'rl:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await middleware(c, next)

      const evalCall = mockRedis.eval.mock.calls[0]
      const refillRate = parseFloat(evalCall[4] as string)
      expect(refillRate).toBeCloseTo(100 / 60, 2)
    })
  })

  describe('Rate Limit Headers (IETF draft-7)', () => {
    it('should set standard RateLimit-* headers', async () => {
      mockRedis.eval.mockResolvedValue([1, 4, 60000])

      const middleware = rateLimit({
        limit: 5,
        window: 60,
        prefix: 'rl:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await middleware(c, next)

      expect(c.header).toHaveBeenCalledWith('RateLimit-Limit', '5')
      expect(c.header).toHaveBeenCalledWith('RateLimit-Remaining', '4')
      expect(c.header).toHaveBeenCalledWith('RateLimit-Reset', expect.any(String))
    })

    it('should set legacy X-RateLimit-* headers for compatibility', async () => {
      mockRedis.eval.mockResolvedValue([1, 4, 60000])

      const middleware = rateLimit({
        limit: 5,
        window: 60,
        prefix: 'rl:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await middleware(c, next)

      expect(c.header).toHaveBeenCalledWith('X-RateLimit-Limit', '5')
      expect(c.header).toHaveBeenCalledWith('X-RateLimit-Remaining', '4')
      expect(c.header).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String))
    })

    it('should set Retry-After header on 429', async () => {
      mockRedis.eval.mockResolvedValue([0, 0, 30000])

      const middleware = rateLimit({
        limit: 5,
        window: 60,
        prefix: 'rl:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await expect(middleware(c, next)).rejects.toThrow()
      expect(c.header).toHaveBeenCalledWith('Retry-After', '30')
    })
  })

  describe('Fail-Open Behavior', () => {
    it('should allow request if Redis fails', async () => {
      mockRedis.eval.mockRejectedValue(new Error('Redis connection error'))

      const middleware = rateLimit({
        limit: 5,
        window: 60,
        prefix: 'rl:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await middleware(c, next)

      expect(next).toHaveBeenCalled()
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Global Rate Limits
// Bible: P-058 - Global: anonymous 100/min, authenticated 300/min
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Global Limits (P-058)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should enforce anonymous global limit: 100/min', () => {
    expect(RATE_LIMITS.api.limit).toBe(100)
    expect(RATE_LIMITS.api.window).toBe(60)
  })

  it('should enforce authenticated global limit: 300/min', () => {
    expect(RATE_LIMITS.apiAuthenticated.limit).toBe(300)
    expect(RATE_LIMITS.apiAuthenticated.window).toBe(60)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Auth Rate Limits
// Bible: P-058 - Auth: login 5/15min, register 3/hour, passwordReset 3/hour, otpVerify 3/10min
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Auth Endpoints (P-058)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should enforce login limit: 5/15min', () => {
    expect(RATE_LIMITS.login.limit).toBe(5)
    expect(RATE_LIMITS.login.window).toBe(900)
  })

  it('should enforce register limit: 3/hour', () => {
    expect(RATE_LIMITS.register.limit).toBe(3)
    expect(RATE_LIMITS.register.window).toBe(3600)
  })

  it('should enforce passwordReset limit: 3/hour', () => {
    expect(RATE_LIMITS.passwordReset.limit).toBe(3)
    expect(RATE_LIMITS.passwordReset.window).toBe(3600)
  })

  it('should enforce otpVerify limit: 3/10min', () => {
    expect(RATE_LIMITS.otpVerify.limit).toBe(3)
    expect(RATE_LIMITS.otpVerify.window).toBe(600)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Creation Rate Limits (Tier-Aware)
// Bible: P-058 - Creation: poll (free 3/day, plus 10/day, premium unlimited)
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Content Creation (P-058 Tier-Aware)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Poll Creation Limits', () => {
    it('should enforce FREE tier: 3/day', () => {
      expect(TIER_LIMITS.FREE.pollsPerDay).toBe(3)
    })

    it('should enforce PLUS tier: 10/day', () => {
      expect(TIER_LIMITS.PLUS.pollsPerDay).toBe(10)
    })

    it('should enforce PREMIUM tier: unlimited', () => {
      expect(TIER_LIMITS.PREMIUM.pollsPerDay).toBe(Infinity)
    })

    it('should bypass rate limiting for PREMIUM tier', async () => {
      const c = createMockContext()
      c.get = vi.fn((key: string) => {
        if (key === 'user') return { subscriptionTier: 'PREMIUM' }
        return undefined
      })

      const middleware = TIER_RATE_LIMITS.createPoll()
      const next = vi.fn()

      await middleware(c, next)

      expect(next).toHaveBeenCalled()
      expect(mockRedis.eval).not.toHaveBeenCalled()
    })
  })

  describe('Test Creation Limits', () => {
    it('should enforce FREE tier: 3/week', () => {
      expect(TIER_LIMITS.FREE.testsPerWeek).toBe(3)
    })

    it('should enforce PLUS tier: 10/week', () => {
      expect(TIER_LIMITS.PLUS.testsPerWeek).toBe(10)
    })

    it('should enforce PREMIUM tier: unlimited', () => {
      expect(TIER_LIMITS.PREMIUM.testsPerWeek).toBe(Infinity)
    })
  })

  describe('Live Poll Creation Limits', () => {
    it('should enforce FREE tier: 0/day (no access)', () => {
      expect(TIER_LIMITS.FREE.livePollsPerDay).toBe(0)
    })

    it('should enforce PLUS tier: 0/day (no access)', () => {
      expect(TIER_LIMITS.PLUS.livePollsPerDay).toBe(0)
    })

    it('should enforce PREMIUM tier: unlimited', () => {
      expect(TIER_LIMITS.PREMIUM.livePollsPerDay).toBe(Infinity)
    })
  })

  describe('Poll Option Count Validation (P-027)', () => {
    it('should validate FREE tier: max 4 options', () => {
      expect(validatePollOptionCount('FREE', 4)).toBe(true)
      expect(validatePollOptionCount('FREE', 5)).toBe(false)
      expect(getMaxPollOptions('FREE')).toBe(4)
    })

    it('should validate PLUS tier: max 4 options', () => {
      expect(validatePollOptionCount('PLUS', 4)).toBe(true)
      expect(validatePollOptionCount('PLUS', 5)).toBe(false)
      expect(getMaxPollOptions('PLUS')).toBe(4)
    })

    it('should validate PREMIUM tier: max 10 options', () => {
      expect(validatePollOptionCount('PREMIUM', 10)).toBe(true)
      expect(validatePollOptionCount('PREMIUM', 11)).toBe(false)
      expect(getMaxPollOptions('PREMIUM')).toBe(10)
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Participation Rate Limits
// Bible: P-058 - Participation: vote 1/forever, pretest 3/24h, comment 30/hour
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Participation (P-058)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should enforce vote per poll: 1/forever (1 year window)', () => {
    expect(RATE_LIMITS.votePerPoll.limit).toBe(1)
    expect(RATE_LIMITS.votePerPoll.window).toBe(31536000)
  })

  it('should enforce pretest submit: 3/24h', () => {
    expect(RATE_LIMITS.pretestSubmit.limit).toBe(3)
    expect(RATE_LIMITS.pretestSubmit.window).toBe(86400)
  })

  it('should enforce comment: 30/hour (tier-aware)', () => {
    expect(TIER_LIMITS.FREE.commentsPerHour).toBe(30)
    expect(TIER_LIMITS.PLUS.commentsPerHour).toBe(30)
    expect(TIER_LIMITS.PREMIUM.commentsPerHour).toBe(100)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Live Poll Rate Limits
// Bible: P-058 - Live Poll: create 5/day, join 10/min, vote 60/min
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Live Poll (P-058)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should enforce live poll create: 5/day', () => {
    expect(RATE_LIMITS.livePollCreate.limit).toBe(5)
    expect(RATE_LIMITS.livePollCreate.window).toBe(86400)
  })

  it('should enforce live poll join: 10/min', () => {
    expect(RATE_LIMITS.livePollJoin.limit).toBe(10)
    expect(RATE_LIMITS.livePollJoin.window).toBe(60)
  })

  it('should enforce live poll vote: 60/min', () => {
    expect(RATE_LIMITS.livePollVote.limit).toBe(60)
    expect(RATE_LIMITS.livePollVote.window).toBe(60)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Social DM Rate Limits (Tier-Aware)
// Bible: P-058 - Social DM: free 0, plus 25/day, premium 1000/day
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Social DM (P-058 Tier-Aware)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should enforce FREE tier: 0/day (no DM access)', () => {
    expect(TIER_LIMITS.FREE.dmsPerDay).toBe(0)
  })

  it('should enforce PLUS tier: 25/day', () => {
    expect(TIER_LIMITS.PLUS.dmsPerDay).toBe(25)
  })

  it('should enforce PREMIUM tier: 1000/day', () => {
    expect(TIER_LIMITS.PREMIUM.dmsPerDay).toBe(1000)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Exponential Backoff (Brute Force Protection)
// Bible: P-058 - Backoff: Exponential backoff for brute force (login, OTP, live poll code)
// Pattern: 0s, 1s, 2s, 4s, 8s, 16s (max)
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Exponential Backoff (P-058 Brute Force)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Exponential Backoff Pattern', () => {
    it('should allow 1st attempt immediately (0s delay)', async () => {
      mockRedis.eval.mockResolvedValue([1, 1, 0, 0])

      const middleware = exponentialBackoff({
        baseDelayMs: 1000,
        maxDelayMs: 16000,
        resetWindowMs: 300000,
        prefix: 'exp-backoff:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await middleware(c, next)

      expect(next).toHaveBeenCalled()
    })

    it('should enforce 1s delay after 1st failed attempt', async () => {
      mockRedis.eval.mockResolvedValue([0, 1, 500, 1000])

      const middleware = exponentialBackoff({
        baseDelayMs: 1000,
        maxDelayMs: 16000,
        resetWindowMs: 300000,
        prefix: 'exp-backoff:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await expect(middleware(c, next)).rejects.toThrow('Too many attempts')
      expect(c.header).toHaveBeenCalledWith('Retry-After', '1')
    })

    it('should enforce max delay (16s) after multiple attempts', async () => {
      mockRedis.eval.mockResolvedValue([0, 5, 16000, 16000])

      const middleware = exponentialBackoff({
        baseDelayMs: 1000,
        maxDelayMs: 16000,
        resetWindowMs: 300000,
        prefix: 'exp-backoff:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await expect(middleware(c, next)).rejects.toThrow()
      expect(c.header).toHaveBeenCalledWith('Retry-After', '16')
    })

    it('should reset attempts after reset window', async () => {
      mockRedis.eval.mockResolvedValue([1, 0, 0, 0])

      const middleware = exponentialBackoff({
        baseDelayMs: 1000,
        maxDelayMs: 16000,
        resetWindowMs: 300000,
        prefix: 'exp-backoff:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await middleware(c, next)

      expect(next).toHaveBeenCalled()
    })
  })

  describe('Live Poll Code Guessing Protection', () => {
    it('should create exponential backoff middleware for live poll code', () => {
      const getCode = (c: Context<AppEnv>) => 'ABC123'
      const middleware = EXPONENTIAL_BACKOFF_LIMITS.livePollCodeGuessing(getCode)

      expect(middleware).toBeDefined()
    })

    it('should use correct config: base 1s, max 16s, reset 5min', async () => {
      mockRedis.eval.mockResolvedValue([1, 1, 0, 0])

      const getCode = (c: Context<AppEnv>) => 'ABC123'
      const middleware = EXPONENTIAL_BACKOFF_LIMITS.livePollCodeGuessing(getCode)

      const c = createMockContext()
      const next = vi.fn()

      await middleware(c, next)

      const evalCall = mockRedis.eval.mock.calls[0]
      expect(evalCall[4]).toBe('1000')
      expect(evalCall[5]).toBe('16000')
      expect(evalCall[6]).toBe('300000')
    })
  })

  describe('OTP Verification Protection', () => {
    it('should create exponential backoff middleware for OTP', () => {
      const middleware = EXPONENTIAL_BACKOFF_LIMITS.otpVerification()

      expect(middleware).toBeDefined()
    })

    it('should use correct config: base 1s, max 16s, reset 10min', async () => {
      mockRedis.eval.mockResolvedValue([1, 1, 0, 0])

      const middleware = EXPONENTIAL_BACKOFF_LIMITS.otpVerification()

      const c = createMockContext()
      const next = vi.fn()

      await middleware(c, next)

      const evalCall = mockRedis.eval.mock.calls[0]
      expect(evalCall[4]).toBe('1000')
      expect(evalCall[5]).toBe('16000')
      expect(evalCall[6]).toBe('600000')
    })
  })

  describe('Backoff Callback', () => {
    it('should trigger onBackoff callback when blocked', async () => {
      mockRedis.eval.mockResolvedValue([0, 3, 4000, 4000])

      const onBackoff = vi.fn()
      const middleware = exponentialBackoff({
        baseDelayMs: 1000,
        maxDelayMs: 16000,
        resetWindowMs: 300000,
        prefix: 'exp-backoff:test',
        onBackoff,
      })

      const c = createMockContext()
      const next = vi.fn()

      await expect(middleware(c, next)).rejects.toThrow()
      expect(onBackoff).toHaveBeenCalledWith(c, 3, 4000)
    })
  })

  describe('Fail-Open Behavior', () => {
    it('should allow request if Redis fails during backoff', async () => {
      mockRedis.eval.mockRejectedValue(new Error('Redis error'))

      const middleware = exponentialBackoff({
        baseDelayMs: 1000,
        maxDelayMs: 16000,
        resetWindowMs: 300000,
        prefix: 'exp-backoff:test',
      })

      const c = createMockContext()
      const next = vi.fn()

      await middleware(c, next)

      expect(next).toHaveBeenCalled()
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Per-Resource Rate Limiting
// Bible: P-058 - vote 1/forever (per poll)
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Per-Resource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should enforce rate limit per resource (vote per poll)', async () => {
    mockRedis.eval.mockResolvedValue([1, 0, 31536000000])

    const middleware = perResourceRateLimit(
      {
        limit: 1,
        window: 31536000,
        prefix: 'rl:vote:poll',
      },
      (c) => 'poll-123'
    )

    const c = createMockContext()
    const next = vi.fn()

    await middleware(c, next)

    expect(mockRedis.eval).toHaveBeenCalled()
    const evalCall = mockRedis.eval.mock.calls[0]
    const key = evalCall[2] as string
    expect(key).toContain('poll-123')
  })

  it('should isolate limits between different resources', async () => {
    mockRedis.eval.mockResolvedValueOnce([1, 0, 31536000000])
    mockRedis.eval.mockResolvedValueOnce([1, 0, 31536000000])

    const middleware1 = perResourceRateLimit(
      {
        limit: 1,
        window: 31536000,
        prefix: 'rl:vote:poll',
      },
      () => 'poll-123'
    )

    const middleware2 = perResourceRateLimit(
      {
        limit: 1,
        window: 31536000,
        prefix: 'rl:vote:poll',
      },
      () => 'poll-456'
    )

    const c1 = createMockContext()
    const c2 = createMockContext()
    const next1 = vi.fn()
    const next2 = vi.fn()

    await middleware1(c1, next1)
    await middleware2(c2, next2)

    expect(next1).toHaveBeenCalled()
    expect(next2).toHaveBeenCalled()

    const key1 = mockRedis.eval.mock.calls[0][2] as string
    const key2 = mockRedis.eval.mock.calls[1][2] as string
    expect(key1).toContain('poll-123')
    expect(key2).toContain('poll-456')
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Combined Rate Limiting
// Multiple limits for same endpoint
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Combined Limits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should apply all limits sequentially', async () => {
    mockRedis.eval.mockResolvedValue([1, 4, 60000])

    const middleware = combinedRateLimit([
      { limit: 5, window: 60, prefix: 'rl:limit1' },
      { limit: 10, window: 60, prefix: 'rl:limit2' },
    ])

    const c = createMockContext()
    const next = vi.fn()

    await middleware(c, next)

    expect(mockRedis.eval).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenCalled()
  })

  it('should reject if any limit is exceeded', async () => {
    mockRedis.eval.mockResolvedValueOnce([1, 4, 60000])
    mockRedis.eval.mockResolvedValueOnce([0, 0, 30000])

    const middleware = combinedRateLimit([
      { limit: 5, window: 60, prefix: 'rl:limit1' },
      { limit: 10, window: 60, prefix: 'rl:limit2' },
    ])

    const c = createMockContext()
    const next = vi.fn()

    await expect(middleware(c, next)).rejects.toThrow('Rate limit exceeded')
    expect(next).not.toHaveBeenCalled()
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Identifier Priority
// Best Practice: User ID > API Key > IP
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Identifier Priority', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should prefer userId over IP when available', async () => {
    mockRedis.eval.mockResolvedValue([1, 4, 60000])

    const middleware = rateLimit({
      limit: 5,
      window: 60,
      prefix: 'rl:test',
    })

    const c = createMockContext()
    c.get = vi.fn((key: string) => {
      if (key === 'userId') return 'user-123'
      return undefined
    })
    c.req.header = vi.fn(() => '192.168.1.1')

    const next = vi.fn()

    await middleware(c, next)

    const evalCall = mockRedis.eval.mock.calls[0]
    const key = evalCall[2] as string
    expect(key).toContain('user-123')
    expect(key).not.toContain('192.168.1.1')
  })

  it('should fall back to IP when userId not available', async () => {
    mockRedis.eval.mockResolvedValue([1, 4, 60000])

    const middleware = rateLimit({
      limit: 5,
      window: 60,
      prefix: 'rl:test',
    })

    const c = createMockContext()
    c.get = vi.fn(() => undefined)
    c.req.header = vi.fn((key: string) => {
      if (key === 'x-real-ip') return '192.168.1.1'
      return undefined
    })

    const next = vi.fn()

    await middleware(c, next)

    const evalCall = mockRedis.eval.mock.calls[0]
    const key = evalCall[2] as string
    expect(key).toContain('192.168.1.1')
  })

  it('should handle Cloudflare cf-connecting-ip header', async () => {
    mockRedis.eval.mockResolvedValue([1, 4, 60000])

    const middleware = rateLimit({
      limit: 5,
      window: 60,
      prefix: 'rl:test',
    })

    const c = createMockContext()
    c.get = vi.fn(() => undefined)
    c.req.header = vi.fn((key: string) => {
      if (key === 'cf-connecting-ip') return '1.2.3.4'
      return undefined
    })

    const next = vi.fn()

    await middleware(c, next)

    const evalCall = mockRedis.eval.mock.calls[0]
    const key = evalCall[2] as string
    expect(key).toContain('1.2.3.4')
  })

  it('should handle x-forwarded-for with multiple IPs', async () => {
    mockRedis.eval.mockResolvedValue([1, 4, 60000])

    const middleware = rateLimit({
      limit: 5,
      window: 60,
      prefix: 'rl:test',
    })

    const c = createMockContext()
    c.get = vi.fn(() => undefined)
    c.req.header = vi.fn((key: string) => {
      if (key === 'x-forwarded-for') return '1.2.3.4, 5.6.7.8'
      return undefined
    })

    const next = vi.fn()

    await middleware(c, next)

    const evalCall = mockRedis.eval.mock.calls[0]
    const key = evalCall[2] as string
    expect(key).toContain('1.2.3.4')
    expect(key).not.toContain('5.6.7.8')
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Skip Conditions
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Skip Conditions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should skip rate limiting when skip function returns true', async () => {
    const middleware = rateLimit({
      limit: 5,
      window: 60,
      prefix: 'rl:test',
      skip: () => true,
    })

    const c = createMockContext()
    const next = vi.fn()

    await middleware(c, next)

    expect(mockRedis.eval).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should apply rate limiting when skip function returns false', async () => {
    mockRedis.eval.mockResolvedValue([1, 4, 60000])

    const middleware = rateLimit({
      limit: 5,
      window: 60,
      prefix: 'rl:test',
      skip: () => false,
    })

    const c = createMockContext()
    const next = vi.fn()

    await middleware(c, next)

    expect(mockRedis.eval).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Error Message Sanitization (P-059)
// Bible: P-059 - Error messages MUST NOT expose numeric thresholds
// ──────────────────────────────────────────────────────────────────────────────

describe('Rate Limit - Error Message Sanitization (P-059)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not expose numeric thresholds in error message', async () => {
    mockRedis.eval.mockResolvedValue([0, 0, 30000])

    const middleware = rateLimit({
      limit: 5,
      window: 60,
      prefix: 'rl:test',
    })

    const c = createMockContext()
    const next = vi.fn()

    try {
      await middleware(c, next)
    } catch (error: unknown) {
      const err = error as Error
      expect(err.message).not.toMatch(/\d+/)
      expect(err.message).toBe('Rate limit exceeded. Please try again later.')
    }
  })

  it('should use generic error message for exponential backoff', async () => {
    mockRedis.eval.mockResolvedValue([0, 3, 4000, 4000])

    const middleware = exponentialBackoff({
      baseDelayMs: 1000,
      maxDelayMs: 16000,
      resetWindowMs: 300000,
      prefix: 'exp-backoff:test',
    })

    const c = createMockContext()
    const next = vi.fn()

    try {
      await middleware(c, next)
    } catch (error: unknown) {
      const err = error as Error
      expect(err.message).toBe('Too many attempts. Please try again later.')
      expect(err.message).not.toMatch(/\d+ attempts/)
      expect(err.message).not.toMatch(/\d+s delay/)
    }
  })
})
