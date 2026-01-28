// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - WAITING ROOM SERVICE
// Bible: 03-FEATURES, P-057
// FIFO queue for live poll sessions at 90% capacity
// ═══════════════════════════════════════════════════════════════════════════════

import { getRedis } from '../lib/redis'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WaitingParticipant {
  participantId: string
  userId?: string
  deviceId?: string
  joinedQueueAt: number
  position: number
  estimatedWaitMs: number
}

export interface WaitingRoomStatus {
  isActive: boolean
  queueLength: number
  position?: number
  estimatedWaitMs?: number
  isSpectator: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants (Bible: P-057)
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
  maxParticipants: 10000,
  softCapPercent: 0.9,
  maxWaitTimeMs: 5 * 60 * 1000,
  positionUpdateIntervalMs: 5000,
  avgTurnoverPerMinute: 10,
  queueKeyPrefix: 'live:waitingroom:',
  spectatorKeyPrefix: 'live:spectators:',
}

// ─────────────────────────────────────────────────────────────────────────────
// Waiting Room Service Class
// ─────────────────────────────────────────────────────────────────────────────

class WaitingRoomServiceClass {
  // ═══════════════════════════════════════════════════════════════════════════
  // QUEUE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async shouldEnterWaitingRoom(sessionCode: string, currentCount: number): Promise<boolean> {
    const softCap = Math.floor(CONFIG.maxParticipants * CONFIG.softCapPercent)
    return currentCount >= softCap
  }

  async addToQueue(
    sessionCode: string,
    participantId: string,
    userId?: string,
    deviceId?: string
  ): Promise<WaitingParticipant> {
    const redis = getRedis()
    const queueKey = `${CONFIG.queueKeyPrefix}${sessionCode}`
    const now = Date.now()

    const participant: Omit<WaitingParticipant, 'position' | 'estimatedWaitMs'> = {
      participantId,
      userId,
      deviceId,
      joinedQueueAt: now,
    }

    await redis.zadd(queueKey, now, JSON.stringify(participant))

    const position = await this.getQueuePosition(sessionCode, participantId)
    const estimatedWaitMs = this.calculateEstimatedWait(position)

    await redis.expire(queueKey, 3600)

    return {
      ...participant,
      position,
      estimatedWaitMs,
    }
  }

  async removeFromQueue(sessionCode: string, participantId: string): Promise<void> {
    const redis = getRedis()
    const queueKey = `${CONFIG.queueKeyPrefix}${sessionCode}`

    const members = await redis.zrange(queueKey, 0, -1)
    for (const member of members) {
      try {
        const data = JSON.parse(member)
        if (data.participantId === participantId) {
          await redis.zrem(queueKey, member)
          break
        }
      } catch {
        continue
      }
    }

    await this.removeSpectator(sessionCode, participantId)
  }

  async getQueuePosition(sessionCode: string, participantId: string): Promise<number> {
    const redis = getRedis()
    const queueKey = `${CONFIG.queueKeyPrefix}${sessionCode}`

    const members = await redis.zrange(queueKey, 0, -1)
    for (let i = 0; i < members.length; i++) {
      try {
        const data = JSON.parse(members[i] ?? '')
        if (data.participantId === participantId) {
          return i + 1
        }
      } catch {
        continue
      }
    }

    return -1
  }

  async getQueueLength(sessionCode: string): Promise<number> {
    const redis = getRedis()
    const queueKey = `${CONFIG.queueKeyPrefix}${sessionCode}`
    return await redis.zcard(queueKey)
  }

  async getNextInQueue(sessionCode: string): Promise<WaitingParticipant | null> {
    const redis = getRedis()
    const queueKey = `${CONFIG.queueKeyPrefix}${sessionCode}`

    const members = await redis.zrange(queueKey, 0, 0)
    if (members.length === 0) return null

    try {
      const data = JSON.parse(members[0] ?? '')
      return {
        ...data,
        position: 1,
        estimatedWaitMs: 0,
      }
    } catch {
      return null
    }
  }

  async promoteFromQueue(sessionCode: string): Promise<WaitingParticipant | null> {
    const redis = getRedis()
    const queueKey = `${CONFIG.queueKeyPrefix}${sessionCode}`

    const members = await redis.zrange(queueKey, 0, 0)
    if (members.length === 0) return null

    await redis.zrem(queueKey, members[0] ?? '')

    try {
      const data = JSON.parse(members[0] ?? '')
      await this.removeSpectator(sessionCode, data.participantId)
      return {
        ...data,
        position: 0,
        estimatedWaitMs: 0,
      }
    } catch {
      return null
    }
  }

  async checkQueueExpiry(sessionCode: string): Promise<string[]> {
    const redis = getRedis()
    const queueKey = `${CONFIG.queueKeyPrefix}${sessionCode}`
    const expiredIds: string[] = []
    const now = Date.now()

    const members = await redis.zrange(queueKey, 0, -1, 'WITHSCORES')

    for (let i = 0; i < members.length; i += 2) {
      const member = members[i]
      const score = parseInt(members[i + 1] ?? '0', 10)

      if (now - score > CONFIG.maxWaitTimeMs) {
        try {
          const data = JSON.parse(member ?? '')
          expiredIds.push(data.participantId)
          await redis.zrem(queueKey, member ?? '')
        } catch {
          continue
        }
      }
    }

    return expiredIds
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SPECTATOR MODE
  // ═══════════════════════════════════════════════════════════════════════════

  async addSpectator(sessionCode: string, participantId: string): Promise<void> {
    const redis = getRedis()
    const spectatorKey = `${CONFIG.spectatorKeyPrefix}${sessionCode}`
    await redis.sadd(spectatorKey, participantId)
    await redis.expire(spectatorKey, 3600)
  }

  async removeSpectator(sessionCode: string, participantId: string): Promise<void> {
    const redis = getRedis()
    const spectatorKey = `${CONFIG.spectatorKeyPrefix}${sessionCode}`
    await redis.srem(spectatorKey, participantId)
  }

  async isSpectator(sessionCode: string, participantId: string): Promise<boolean> {
    const redis = getRedis()
    const spectatorKey = `${CONFIG.spectatorKeyPrefix}${sessionCode}`
    return (await redis.sismember(spectatorKey, participantId)) === 1
  }

  async getSpectatorCount(sessionCode: string): Promise<number> {
    const redis = getRedis()
    const spectatorKey = `${CONFIG.spectatorKeyPrefix}${sessionCode}`
    return await redis.scard(spectatorKey)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS & UPDATES
  // ═══════════════════════════════════════════════════════════════════════════

  async getWaitingRoomStatus(
    sessionCode: string,
    participantId: string,
    currentParticipantCount: number
  ): Promise<WaitingRoomStatus> {
    const isActive = await this.shouldEnterWaitingRoom(sessionCode, currentParticipantCount)

    if (!isActive) {
      return {
        isActive: false,
        queueLength: 0,
        isSpectator: false,
      }
    }

    const position = await this.getQueuePosition(sessionCode, participantId)
    const queueLength = await this.getQueueLength(sessionCode)
    const isSpectator = await this.isSpectator(sessionCode, participantId)

    return {
      isActive: true,
      queueLength,
      position: position > 0 ? position : undefined,
      estimatedWaitMs: position > 0 ? this.calculateEstimatedWait(position) : undefined,
      isSpectator,
    }
  }

  async getAllQueuePositions(sessionCode: string): Promise<Map<string, WaitingParticipant>> {
    const redis = getRedis()
    const queueKey = `${CONFIG.queueKeyPrefix}${sessionCode}`
    const positions = new Map<string, WaitingParticipant>()

    const members = await redis.zrange(queueKey, 0, -1)

    for (let i = 0; i < members.length; i++) {
      try {
        const data = JSON.parse(members[i] ?? '')
        const position = i + 1
        positions.set(data.participantId, {
          ...data,
          position,
          estimatedWaitMs: this.calculateEstimatedWait(position),
        })
      } catch {
        continue
      }
    }

    return positions
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CAPACITY THRESHOLDS (Bible P-057)
  // ═══════════════════════════════════════════════════════════════════════════

  getCapacityThreshold(currentCount: number): 'normal' | 'soft_cap' | 'hard_cap' | 'at_capacity' {
    const softCap = Math.floor(CONFIG.maxParticipants * 0.9)
    const hardCap = Math.floor(CONFIG.maxParticipants * 0.95)

    if (currentCount >= CONFIG.maxParticipants) return 'at_capacity'
    if (currentCount >= hardCap) return 'hard_cap'
    if (currentCount >= softCap) return 'soft_cap'
    return 'normal'
  }

  getCapacityWarning(currentCount: number): string | null {
    const threshold = this.getCapacityThreshold(currentCount)
    const percent = Math.round((currentCount / CONFIG.maxParticipants) * 100)

    switch (threshold) {
      case 'soft_cap':
        return `${percent}% capacity reached. New participants will enter waiting room.`
      case 'hard_cap':
        return `${percent}% capacity reached. Session approaching maximum capacity.`
      case 'at_capacity':
        return 'Maximum capacity reached. No new participants can join.'
      default:
        return null
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private calculateEstimatedWait(position: number): number {
    const avgWaitPerPerson = 60000 / CONFIG.avgTurnoverPerMinute
    return Math.min(position * avgWaitPerPerson, CONFIG.maxWaitTimeMs)
  }

  async cleanupSession(sessionCode: string): Promise<void> {
    const redis = getRedis()
    await redis.del(`${CONFIG.queueKeyPrefix}${sessionCode}`)
    await redis.del(`${CONFIG.spectatorKeyPrefix}${sessionCode}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const waitingRoomService = new WaitingRoomServiceClass()
