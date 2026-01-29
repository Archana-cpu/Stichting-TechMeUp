// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - RECONNECTION SERVICE
// Bible: P-031
// 30-second grace period for live poll reconnections
// ═══════════════════════════════════════════════════════════════════════════════

import { getRedis } from '../lib/redis'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DisconnectedParticipant {
  participantId: string
  sessionCode: string
  userId?: string
  disconnectedAt: number
  votedOptionId?: string
  isHost: boolean
}

export interface ReconnectionResult {
  success: boolean
  restored: boolean
  votedOptionId?: string
  reason?: 'grace_period_expired' | 'session_ended' | 'not_found'
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants (Bible: P-031)
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
  gracePeriodMs: 30 * 1000,
  keyPrefix: 'live:reconnect:',
  hostOrphanPrefix: 'live:orphan:',
  checkIntervalMs: 5000,
}

// ─────────────────────────────────────────────────────────────────────────────
// Reconnection Service Class
// ─────────────────────────────────────────────────────────────────────────────

class ReconnectionServiceClass {
  // ═══════════════════════════════════════════════════════════════════════════
  // DISCONNECT HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  async recordDisconnect(
    sessionCode: string,
    participantId: string,
    userId?: string,
    votedOptionId?: string,
    isHost: boolean = false
  ): Promise<void> {
    const redis = getRedis()
    const key = `${CONFIG.keyPrefix}${sessionCode}:${participantId}`

    const data: DisconnectedParticipant = {
      participantId,
      sessionCode,
      userId,
      disconnectedAt: Date.now(),
      votedOptionId,
      isHost,
    }

    await redis.setex(key, Math.ceil(CONFIG.gracePeriodMs / 1000), JSON.stringify(data))

    if (isHost) {
      await this.markSessionOrphaned(sessionCode)
    }
  }

  async attemptReconnect(
    sessionCode: string,
    participantId: string,
    sessionStatus: string
  ): Promise<ReconnectionResult> {
    if (sessionStatus === 'ENDED') {
      return {
        success: false,
        restored: false,
        reason: 'session_ended',
      }
    }

    const redis = getRedis()
    const key = `${CONFIG.keyPrefix}${sessionCode}:${participantId}`

    const dataStr = await redis.get(key)
    if (!dataStr) {
      return {
        success: true,
        restored: false,
        reason: 'not_found',
      }
    }

    try {
      const data: DisconnectedParticipant = JSON.parse(dataStr)
      const elapsed = Date.now() - data.disconnectedAt

      if (elapsed > CONFIG.gracePeriodMs) {
        await redis.del(key)
        return {
          success: false,
          restored: false,
          reason: 'grace_period_expired',
        }
      }

      await redis.del(key)

      if (data.isHost) {
        await this.clearSessionOrphaned(sessionCode)
      }

      return {
        success: true,
        restored: true,
        votedOptionId: data.votedOptionId,
      }
    } catch {
      return {
        success: true,
        restored: false,
        reason: 'not_found',
      }
    }
  }

  async isWithinGracePeriod(sessionCode: string, participantId: string): Promise<boolean> {
    const redis = getRedis()
    const key = `${CONFIG.keyPrefix}${sessionCode}:${participantId}`
    return (await redis.exists(key)) === 1
  }

  async getDisconnectedParticipant(
    sessionCode: string,
    participantId: string
  ): Promise<DisconnectedParticipant | null> {
    const redis = getRedis()
    const key = `${CONFIG.keyPrefix}${sessionCode}:${participantId}`

    const dataStr = await redis.get(key)
    if (!dataStr) return null

    try {
      return JSON.parse(dataStr)
    } catch {
      return null
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HOST DISCONNECT / ORPHAN MODE
  // ═══════════════════════════════════════════════════════════════════════════

  private async markSessionOrphaned(sessionCode: string): Promise<void> {
    const redis = getRedis()
    const key = `${CONFIG.hostOrphanPrefix}${sessionCode}`

    await redis.setex(key, Math.ceil(CONFIG.gracePeriodMs / 1000), Date.now().toString())
  }

  private async clearSessionOrphaned(sessionCode: string): Promise<void> {
    const redis = getRedis()
    const key = `${CONFIG.hostOrphanPrefix}${sessionCode}`
    await redis.del(key)
  }

  async isSessionOrphaned(sessionCode: string): Promise<boolean> {
    const redis = getRedis()
    const key = `${CONFIG.hostOrphanPrefix}${sessionCode}`
    return (await redis.exists(key)) === 1
  }

  async getOrphanedSince(sessionCode: string): Promise<number | null> {
    const redis = getRedis()
    const key = `${CONFIG.hostOrphanPrefix}${sessionCode}`

    const timestamp = await redis.get(key)
    if (!timestamp) return null

    return parseInt(timestamp, 10)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VOTE RESTORATION
  // ═══════════════════════════════════════════════════════════────────────────

  async restoreVote(sessionCode: string, participantId: string, optionId: string): Promise<void> {
    const redis = getRedis()
    const voteKey = `live:${sessionCode}:voted:${participantId}`

    const existingVote = await redis.get(voteKey)
    if (existingVote) {
      return
    }

    await redis.set(voteKey, optionId, 'EX', 86400)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════

  async cleanupSession(sessionCode: string): Promise<void> {
    const redis = getRedis()

    const reconnectKeys = await redis.keys(`${CONFIG.keyPrefix}${sessionCode}:*`)
    if (reconnectKeys.length > 0) {
      await redis.del(...reconnectKeys)
    }

    await redis.del(`${CONFIG.hostOrphanPrefix}${sessionCode}`)
  }

  async getGracePeriodRemainingMs(sessionCode: string, participantId: string): Promise<number> {
    const data = await this.getDisconnectedParticipant(sessionCode, participantId)
    if (!data) return 0

    const elapsed = Date.now() - data.disconnectedAt
    return Math.max(0, CONFIG.gracePeriodMs - elapsed)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const reconnectionService = new ReconnectionServiceClass()
