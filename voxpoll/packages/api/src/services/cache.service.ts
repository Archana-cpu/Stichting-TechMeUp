// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - CACHE SERVICE
// Redis-based caching with cache-aside pattern
// ══════════════════════════════════════════════════════════════════════════════

import { getRedis } from '../lib/redis'
import { CACHE_TTL } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Cache Service Class
// ─────────────────────────────────────────────────────────────────────────────

class CacheServiceClass {
  private get redis() {
    return getRedis()
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Basic Operations
  // ─────────────────────────────────────────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key)
      if (!data) return null
      return JSON.parse(data) as T
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await this.redis.setex(key, ttl, serialized)
      } else {
        await this.redis.set(key, serialized)
      }
      return true
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.error(`Cache del error for key ${key}:`, error)
      return false
    }
  }

  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
      return keys.length
    } catch (error) {
      console.error(`Cache delPattern error for pattern ${pattern}:`, error)
      return 0
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error)
      return false
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Cache-Aside Pattern
  // ─────────────────────────────────────────────────────────────────────────────

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch fresh data
    const data = await fetcher()

    // Store in cache (don't await, fire and forget)
    this.set(key, data, ttl).catch(() => {
      // Silently ignore cache write errors
    })

    return data
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Key Builders
  // ─────────────────────────────────────────────────────────────────────────────

  // User keys
  userKey(userId: string, suffix?: string): string {
    return suffix ? `user:${userId}:${suffix}` : `user:${userId}`
  }

  userProfileKey(userId: string): string {
    return this.userKey(userId, 'profile')
  }

  userSettingsKey(userId: string): string {
    return this.userKey(userId, 'settings')
  }

  // Poll keys
  pollKey(pollId: string, suffix?: string): string {
    return suffix ? `poll:${pollId}:${suffix}` : `poll:${pollId}`
  }

  pollResultsKey(pollId: string): string {
    return this.pollKey(pollId, 'results')
  }

  pollAnalyticsKey(pollId: string): string {
    return this.pollKey(pollId, 'analytics')
  }

  // Survey keys
  surveyKey(surveyId: string, suffix?: string): string {
    return suffix ? `survey:${surveyId}:${suffix}` : `survey:${surveyId}`
  }

  surveyAnalyticsKey(surveyId: string): string {
    return this.surveyKey(surveyId, 'analytics')
  }

  // Feed keys
  feedKey(userId: string, feedType: string): string {
    return `feed:${userId}:${feedType}`
  }

  // Leaderboard keys
  leaderboardKey(type: string, period?: string): string {
    return period ? `leaderboard:${type}:${period}` : `leaderboard:${type}`
  }

  // Organization keys
  orgKey(orgId: string, suffix?: string): string {
    return suffix ? `org:${orgId}:${suffix}` : `org:${orgId}`
  }

  orgMembershipKey(orgId: string, userId: string): string {
    return `org:${orgId}:member:${userId}`
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Invalidation Methods
  // ─────────────────────────────────────────────────────────────────────────────

  async invalidateUser(userId: string): Promise<void> {
    await this.delPattern(`user:${userId}:*`)
  }

  async invalidatePoll(pollId: string): Promise<void> {
    await this.delPattern(`poll:${pollId}:*`)
  }

  async invalidateSurvey(surveyId: string): Promise<void> {
    await this.delPattern(`survey:${surveyId}:*`)
  }

  async invalidateOrganization(orgId: string): Promise<void> {
    await this.delPattern(`org:${orgId}:*`)
  }

  async invalidateFeed(userId: string): Promise<void> {
    await this.delPattern(`feed:${userId}:*`)
  }

  async invalidateAll(): Promise<void> {
    // Dangerous! Only use in development
    if (process.env['NODE_ENV'] === 'development') {
      await this.redis.flushdb()
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Convenience Methods
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserProfile<T>(userId: string, fetcher: () => Promise<T>): Promise<T> {
    return this.getOrSet(
      this.userProfileKey(userId),
      fetcher,
      CACHE_TTL.userProfile
    )
  }

  async getPollResults<T>(pollId: string, fetcher: () => Promise<T>): Promise<T> {
    return this.getOrSet(
      this.pollResultsKey(pollId),
      fetcher,
      CACHE_TTL.pollResults
    )
  }

  async getSurveyAnalytics<T>(surveyId: string, fetcher: () => Promise<T>): Promise<T> {
    return this.getOrSet(
      this.surveyAnalyticsKey(surveyId),
      fetcher,
      CACHE_TTL.surveyAnalytics
    )
  }

  async getLeaderboard<T>(type: string, fetcher: () => Promise<T>): Promise<T> {
    return this.getOrSet(
      this.leaderboardKey(type),
      fetcher,
      CACHE_TTL.leaderboard
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Counter Operations
  // ─────────────────────────────────────────────────────────────────────────────

  async increment(key: string, by: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, by)
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error)
      return 0
    }
  }

  async decrement(key: string, by: number = 1): Promise<number> {
    try {
      return await this.redis.decrby(key, by)
    } catch (error) {
      console.error(`Cache decrement error for key ${key}:`, error)
      return 0
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Set Operations (for unique lists, e.g., online users)
  // ─────────────────────────────────────────────────────────────────────────────

  async addToSet(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.sadd(key, ...members)
    } catch (error) {
      console.error(`Cache addToSet error for key ${key}:`, error)
      return 0
    }
  }

  async removeFromSet(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.srem(key, ...members)
    } catch (error) {
      console.error(`Cache removeFromSet error for key ${key}:`, error)
      return 0
    }
  }

  async getSetMembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key)
    } catch (error) {
      console.error(`Cache getSetMembers error for key ${key}:`, error)
      return []
    }
  }

  async isInSet(key: string, member: string): Promise<boolean> {
    try {
      return (await this.redis.sismember(key, member)) === 1
    } catch (error) {
      console.error(`Cache isInSet error for key ${key}:`, error)
      return false
    }
  }
}

// Export singleton instance
export const cacheService = new CacheServiceClass()

// Export class for testing
export { CacheServiceClass as CacheService }
