// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - REDIS CLIENT
// Reference: https://github.com/redis/ioredis
// ══════════════════════════════════════════════════════════════════════════════

import Redis from 'ioredis'

// ─────────────────────────────────────────────────────────────────────────────
// Redis Client Singleton
// ─────────────────────────────────────────────────────────────────────────────

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379'

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      enableReadyCheck: true,
      lazyConnect: true,
    })

    redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message)
    })

    redis.on('connect', () => {
      console.log('[Redis] Connected successfully')
    })

    redis.on('ready', () => {
      console.log('[Redis] Ready to accept commands')
    })
  }

  return redis
}

// ─────────────────────────────────────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────────────────────────────────────

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
    console.log('[Redis] Connection closed')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────────────────────

export async function pingRedis(): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now()
  try {
    const r = getRedis()
    await r.ping()
    return { ok: true, latency: Date.now() - start }
  } catch {
    return { ok: false, latency: Date.now() - start }
  }
}

export { redis }
