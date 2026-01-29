// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - LIVE POLL WAITING ROOM SERVICE
// Bible: 03-FEATURES/04-live-polls.md, P-040
// Capacity handling: 80% WARNING, 90% SOFT CAP (Waiting Room), 100% HARD CAP
// ══════════════════════════════════════════════════════════════════════════════

import { getRedis } from '../lib/redis'
import { ApiError } from '../middleware/error-handler'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WaitingRoomEntry {
  participantId: string
  userId?: string
  joinedAt: number
  position: number
  estimatedWaitSeconds: number
}

export interface CapacityStatus {
  currentCount: number
  maxCapacity: number
  capacityPercent: number
  tier: 'NORMAL' | 'WARNING' | 'SOFT_CAP' | 'HARD_CAP'
  action: 'ALLOW' | 'WAITING_ROOM' | 'SPECTATOR_MODE'
}

export interface WaitingRoomStats {
  queueLength: number
  avgWaitTimeSeconds: number
  oldestEntryAge: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants (Bible P-040)
// ─────────────────────────────────────────────────────────────────────────────

export const CAPACITY_LIMITS = {
  maxParticipantsPerPoll: 10000,
  warningThreshold: 0.8,
  softCapThreshold: 0.9,
  hardCapThreshold: 1.0,
}

export const WAITING_ROOM_CONFIG = {
  maxWaitingTimeSeconds: 300,
  positionUpdateIntervalSeconds: 5,
  allowLeaveQueue: true,
  admissionOrder: 'FIFO' as const,
}

const QUEUE_KEY_PREFIX = 'live:waitingRoom'
const PROMOTED_KEY_PREFIX = 'live:promoted'

// ─────────────────────────────────────────────────────────────────────────────
// Waiting Room Service Class
// ─────────────────────────────────────────────────────────────────────────────

class LivePollWaitingRoomServiceClass {
  // ═══════════════════════════════════════════════════════════════════════════
  // CAPACITY CHECKING
  // ═══════════════════════════════════════════════════════════════════════════

  async getCapacityStatus(sessionCode: string, currentCount: number): Promise<CapacityStatus> {
    const maxCapacity = CAPACITY_LIMITS.maxParticipantsPerPoll
    const capacityPercent = currentCount / maxCapacity

    let tier: CapacityStatus['tier']
    let action: CapacityStatus['action']

    if (capacityPercent >= CAPACITY_LIMITS.hardCapThreshold) {
      tier = 'HARD_CAP'
      action = 'SPECTATOR_MODE'
    } else if (capacityPercent >= CAPACITY_LIMITS.softCapThreshold) {
      tier = 'SOFT_CAP'
      action = 'WAITING_ROOM'
    } else if (capacityPercent >= CAPACITY_LIMITS.warningThreshold) {
      tier = 'WARNING'
      action = 'ALLOW'
    } else {
      tier = 'NORMAL'
      action = 'ALLOW'
    }

    return {
      currentCount,
      maxCapacity,
      capacityPercent: Math.round(capacityPercent * 100) / 100,
      tier,
      action,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WAITING ROOM QUEUE MANAGEMENT (Redis Sorted Set - FIFO)
  // ═══════════════════════════════════════════════════════════════════════════

  async addToWaitingRoom(
    sessionCode: string,
    participantId: string,
    userId?: string
  ): Promise<WaitingRoomEntry> {
    const redis = getRedis()
    const queueKey = `${QUEUE_KEY_PREFIX}:${sessionCode}`
    const timestamp = Date.now()

    const entry = {
      participantId,
      userId,
      joinedAt: timestamp,
    }

    await redis.zadd(queueKey, timestamp, JSON.stringify(entry))

    await redis.expire(queueKey, WAITING_ROOM_CONFIG.maxWaitingTimeSeconds + 60)

    const position = await this.getQueuePosition(sessionCode, participantId)
    const estimatedWaitSeconds = await this.estimateWaitTime(sessionCode, position)

    return {
      participantId,
      userId,
      joinedAt: timestamp,
      position,
      estimatedWaitSeconds,
    }
  }

  async removeFromWaitingRoom(sessionCode: string, participantId: string): Promise<void> {
    const redis = getRedis()
    const queueKey = `${QUEUE_KEY_PREFIX}:${sessionCode}`

    const entries = await redis.zrange(queueKey, 0, -1)
    for (const entryStr of entries) {
      const entry = JSON.parse(entryStr)
      if (entry.participantId === participantId) {
        await redis.zrem(queueKey, entryStr)
        break
      }
    }
  }

  async getQueuePosition(sessionCode: string, participantId: string): Promise<number> {
    const redis = getRedis()
    const queueKey = `${QUEUE_KEY_PREFIX}:${sessionCode}`

    const entries = await redis.zrange(queueKey, 0, -1)

    for (let i = 0; i < entries.length; i++) {
      const entry = JSON.parse(entries[i] as string)
      if (entry.participantId === participantId) {
        return i + 1
      }
    }

    return -1
  }

  async getWaitingRoomStats(sessionCode: string): Promise<WaitingRoomStats> {
    const redis = getRedis()
    const queueKey = `${QUEUE_KEY_PREFIX}:${sessionCode}`

    const queueLength = await redis.zcard(queueKey)

    if (queueLength === 0) {
      return {
        queueLength: 0,
        avgWaitTimeSeconds: 0,
        oldestEntryAge: 0,
      }
    }

    const oldestEntry = await redis.zrange(queueKey, 0, 0, 'WITHSCORES')
    const oldestTimestamp = oldestEntry[1] ? parseInt(oldestEntry[1] as string, 10) : Date.now()
    const oldestEntryAge = Math.floor((Date.now() - oldestTimestamp) / 1000)

    const avgWaitTimeSeconds = Math.min(oldestEntryAge / queueLength, WAITING_ROOM_CONFIG.maxWaitingTimeSeconds)

    return {
      queueLength,
      avgWaitTimeSeconds: Math.round(avgWaitTimeSeconds),
      oldestEntryAge,
    }
  }

  async estimateWaitTime(sessionCode: string, position: number): Promise<number> {
    const stats = await this.getWaitingRoomStats(sessionCode)

    if (stats.queueLength === 0 || position <= 0) {
      return 0
    }

    const avgWaitPerPosition = stats.avgWaitTimeSeconds / stats.queueLength
    const estimatedWait = Math.ceil(avgWaitPerPosition * position)

    return Math.min(estimatedWait, WAITING_ROOM_CONFIG.maxWaitingTimeSeconds)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-PROMOTE FROM QUEUE (FIFO)
  // ═══════════════════════════════════════════════════════════════════════════

  async promoteNextFromQueue(sessionCode: string): Promise<WaitingRoomEntry | null> {
    const redis = getRedis()
    const queueKey = `${QUEUE_KEY_PREFIX}:${sessionCode}`

    const entries = await redis.zrange(queueKey, 0, 0)
    if (!entries || entries.length === 0) {
      return null
    }

    const entryStr = entries[0] as string
    const entry = JSON.parse(entryStr)

    await redis.zrem(queueKey, entryStr)

    const promotedKey = `${PROMOTED_KEY_PREFIX}:${sessionCode}:${entry.participantId}`
    await redis.set(promotedKey, '1', 'EX', 60)

    return {
      participantId: entry.participantId,
      userId: entry.userId,
      joinedAt: entry.joinedAt,
      position: 1,
      estimatedWaitSeconds: 0,
    }
  }

  async isPromoted(sessionCode: string, participantId: string): Promise<boolean> {
    const redis = getRedis()
    const promotedKey = `${PROMOTED_KEY_PREFIX}:${sessionCode}:${participantId}`
    const exists = await redis.exists(promotedKey)
    return exists === 1
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUEUE CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════

  async cleanupExpiredEntries(sessionCode: string): Promise<number> {
    const redis = getRedis()
    const queueKey = `${QUEUE_KEY_PREFIX}:${sessionCode}`
    const maxAgeMs = WAITING_ROOM_CONFIG.maxWaitingTimeSeconds * 1000
    const cutoffTimestamp = Date.now() - maxAgeMs

    const removed = await redis.zremrangebyscore(queueKey, 0, cutoffTimestamp)

    return removed
  }

  async clearWaitingRoom(sessionCode: string): Promise<void> {
    const redis = getRedis()
    const queueKey = `${QUEUE_KEY_PREFIX}:${sessionCode}`
    await redis.del(queueKey)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POSITION UPDATES (Broadcast every 5s per Bible)
  // ═══════════════════════════════════════════════════════════════════════════

  async getPositionUpdate(sessionCode: string, participantId: string): Promise<{
    position: number
    queueLength: number
    estimatedWaitSeconds: number
  } | null> {
    const position = await this.getQueuePosition(sessionCode, participantId)

    if (position === -1) {
      return null
    }

    const stats = await this.getWaitingRoomStats(sessionCode)
    const estimatedWaitSeconds = await this.estimateWaitTime(sessionCode, position)

    return {
      position,
      queueLength: stats.queueLength,
      estimatedWaitSeconds,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SPECTATOR MODE (100% capacity - View only)
  // ═══════════════════════════════════════════════════════════════════════════

  async addSpectator(sessionCode: string, participantId: string, userId?: string): Promise<void> {
    const redis = getRedis()
    const spectatorKey = `live:spectators:${sessionCode}`

    const spectator = {
      participantId,
      userId,
      joinedAt: Date.now(),
    }

    await redis.sadd(spectatorKey, JSON.stringify(spectator))
    await redis.expire(spectatorKey, 86400)
  }

  async removeSpectator(sessionCode: string, participantId: string): Promise<void> {
    const redis = getRedis()
    const spectatorKey = `live:spectators:${sessionCode}`

    const spectators = await redis.smembers(spectatorKey)
    for (const spectatorStr of spectators) {
      const spectator = JSON.parse(spectatorStr)
      if (spectator.participantId === participantId) {
        await redis.srem(spectatorKey, spectatorStr)
        break
      }
    }
  }

  async getSpectatorCount(sessionCode: string): Promise<number> {
    const redis = getRedis()
    const spectatorKey = `live:spectators:${sessionCode}`
    return await redis.scard(spectatorKey)
  }
}

export const livePollWaitingRoomService = new LivePollWaitingRoomServiceClass()
