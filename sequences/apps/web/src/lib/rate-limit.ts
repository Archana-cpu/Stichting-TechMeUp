import { Redis } from '@upstash/redis';

// ============================================================================
// CONFIGURATION
// ============================================================================

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Development fallback
const memoryStore = new Map<string, { count: number; resetAt: number }>();

// ============================================================================
// TYPES
// ============================================================================

export type RateLimitConfig = {
  uniqueTokenPerInterval: number; // Max istek sayısı
  interval: number; // Saniye cinsinden pencere
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
};

// ============================================================================
// PRESETS
// ============================================================================

export const RATE_LIMITS = {
  // Sequence işlemleri
  'sequence:create': { uniqueTokenPerInterval: 10, interval: 60 }, // 10/dk
  'sequence:update': { uniqueTokenPerInterval: 30, interval: 60 }, // 30/dk
  'sequence:delete': { uniqueTokenPerInterval: 5, interval: 60 }, // 5/dk

  // Person işlemleri
  'person:create': { uniqueTokenPerInterval: 20, interval: 60 }, // 20/dk
  'person:update': { uniqueTokenPerInterval: 60, interval: 60 }, // 60/dk (pozisyon dahil)

  // Auth işlemleri
  'auth:login': { uniqueTokenPerInterval: 5, interval: 300 }, // 5/5dk
  'auth:verify-email': { uniqueTokenPerInterval: 3, interval: 3600 }, // 3/saat

  // Upload işlemleri
  'upload:image': { uniqueTokenPerInterval: 20, interval: 3600 }, // 20/saat

  // Message işlemleri
  'message:send': { uniqueTokenPerInterval: 30, interval: 60 }, // 30/dk

  // Admin işlemleri
  'admin:settings': { uniqueTokenPerInterval: 10, interval: 60 }, // 10/dk
  'admin:users': { uniqueTokenPerInterval: 30, interval: 60 }, // 30/dk

  // API genel
  'api:general': { uniqueTokenPerInterval: 100, interval: 60 }, // 100/dk
} as const;

// ============================================================================
// SLIDING WINDOW RATE LIMITER
// ============================================================================

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { uniqueTokenPerInterval, interval } = config;
  const key = `rate_limit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);

  // Redis varsa kullan
  if (redis) {
    try {
      // Sliding window: Zaman damgalı kayıtlar
      const windowStart = now - interval;

      // Eski kayıtları temizle
      await redis.zremrangebyscore(key, 0, windowStart);

      // Mevcut sayıyı al
      const count = await redis.zcard(key);

      if (count >= uniqueTokenPerInterval) {
        // Limit aşıldı
        const oldestEntry = await redis.zrange(key, 0, 0, { withScores: true });
        const resetTime =
          oldestEntry[0]?.score != null
            ? Math.ceil(Number(oldestEntry[0].score) + interval)
            : now + interval;

        return {
          success: false,
          remaining: 0,
          reset: resetTime,
          limit: uniqueTokenPerInterval,
        };
      }

      // Yeni kayıt ekle
      await redis.zadd(key, { score: now, member: `${now}:${Math.random()}` });
      await redis.expire(key, interval);

      return {
        success: true,
        remaining: uniqueTokenPerInterval - count - 1,
        reset: now + interval,
        limit: uniqueTokenPerInterval,
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Redis hatası - fallback'e geç
    }
  }

  // Memory fallback (development veya Redis hatası)
  const record = memoryStore.get(key);

  if (!record || record.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + interval });
    return {
      success: true,
      remaining: uniqueTokenPerInterval - 1,
      reset: now + interval,
      limit: uniqueTokenPerInterval,
    };
  }

  if (record.count >= uniqueTokenPerInterval) {
    return {
      success: false,
      remaining: 0,
      reset: record.resetAt,
      limit: uniqueTokenPerInterval,
    };
  }

  record.count++;
  return {
    success: true,
    remaining: uniqueTokenPerInterval - record.count,
    reset: record.resetAt,
    limit: uniqueTokenPerInterval,
  };
}

// ============================================================================
// HELPER: Clear memory store (for testing)
// ============================================================================

export function clearRateLimitStore() {
  memoryStore.clear();
}
