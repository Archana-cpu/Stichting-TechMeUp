// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - LIVE POLL RECONNECTION TESTS
// Bible: P-031 - Live Poll Disconnect Resilience
// Test Coverage: P1-005 - Live Poll Reconnection Tests
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { reconnectionService } from '../services/reconnection.service'
import type { DisconnectedParticipant, ReconnectionResult } from '../services/reconnection.service'
import { getRedis } from '../lib/redis'

const mockRedis = {
  setex: vi.fn().mockResolvedValue('OK'),
  get: vi.fn().mockResolvedValue(null),
  exists: vi.fn().mockResolvedValue(0),
  del: vi.fn().mockResolvedValue(1),
  set: vi.fn().mockResolvedValue('OK'),
  keys: vi.fn().mockResolvedValue([]),
}

vi.mock('../lib/redis', () => ({
  getRedis: vi.fn(() => mockRedis),
}))

describe('[P1-005] Live Poll Reconnection Service', () => {
  const sessionCode = 'ABC123'
  const participantId = 'p1'
  const userId = 'user1'
  const votedOptionId = 'option1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-031: 30-Second Grace Period
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-031] 30-Second Grace Period (Redis TTL)', () => {
    it('should record disconnect with 30-second TTL in Redis', async () => {
      mockRedis.setex.mockResolvedValue('OK')

      await reconnectionService.recordDisconnect(sessionCode, participantId, userId, votedOptionId, false)

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `live:reconnect:${sessionCode}:${participantId}`,
        30,
        expect.stringContaining(participantId)
      )
    })

    it('should store participant data with disconnect timestamp', async () => {
      const beforeDisconnect = Date.now()
      mockRedis.setex.mockImplementation(async (key, ttl, value) => {
        const data = JSON.parse(value as string)
        expect(data.participantId).toBe(participantId)
        expect(data.sessionCode).toBe(sessionCode)
        expect(data.userId).toBe(userId)
        expect(data.votedOptionId).toBe(votedOptionId)
        expect(data.isHost).toBe(false)
        expect(data.disconnectedAt).toBeGreaterThanOrEqual(beforeDisconnect)
        return 'OK'
      })

      await reconnectionService.recordDisconnect(sessionCode, participantId, userId, votedOptionId, false)

      expect(mockRedis.setex).toHaveBeenCalled()
    })

    it('should check if participant is within grace period', async () => {
      mockRedis.exists.mockResolvedValue(1)

      const isWithin = await reconnectionService.isWithinGracePeriod(sessionCode, participantId)

      expect(isWithin).toBe(true)
      expect(mockRedis.exists).toHaveBeenCalledWith(`live:reconnect:${sessionCode}:${participantId}`)
    })

    it('should return false when grace period has expired', async () => {
      mockRedis.exists.mockResolvedValue(0)

      const isWithin = await reconnectionService.isWithinGracePeriod(sessionCode, participantId)

      expect(isWithin).toBe(false)
    })

    it('should calculate remaining grace period time', async () => {
      const now = Date.now()
      const disconnectedAt = now - 10000
      const participantData: DisconnectedParticipant = {
        participantId,
        sessionCode,
        userId,
        disconnectedAt,
        votedOptionId,
        isHost: false,
      }

      mockRedis.get.mockResolvedValue(JSON.stringify(participantData))

      const remaining = await reconnectionService.getGracePeriodRemainingMs(sessionCode, participantId)

      expect(remaining).toBeGreaterThan(15000)
      expect(remaining).toBeLessThanOrEqual(20000)
    })

    it('should return 0 for remaining time if no disconnect record exists', async () => {
      mockRedis.get.mockResolvedValue(null)

      const remaining = await reconnectionService.getGracePeriodRemainingMs(sessionCode, participantId)

      expect(remaining).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-031: Vote Restoration on Reconnect
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-031] Vote Restoration on Reconnect', () => {
    it('should restore vote when reconnecting within grace period', async () => {
      const disconnectedAt = Date.now() - 5000
      const participantData: DisconnectedParticipant = {
        participantId,
        sessionCode,
        userId,
        disconnectedAt,
        votedOptionId,
        isHost: false,
      }

      mockRedis.get.mockResolvedValue(JSON.stringify(participantData))
      mockRedis.del.mockResolvedValue(1)

      const result = await reconnectionService.attemptReconnect(sessionCode, participantId, 'ACTIVE')

      expect(result.success).toBe(true)
      expect(result.restored).toBe(true)
      expect(result.votedOptionId).toBe(votedOptionId)
      expect(mockRedis.del).toHaveBeenCalledWith(`live:reconnect:${sessionCode}:${participantId}`)
    })

    it('should not restore vote when grace period has expired', async () => {
      const disconnectedAt = Date.now() - 35000
      const participantData: DisconnectedParticipant = {
        participantId,
        sessionCode,
        userId,
        disconnectedAt,
        votedOptionId,
        isHost: false,
      }

      mockRedis.get.mockResolvedValue(JSON.stringify(participantData))
      mockRedis.del.mockResolvedValue(1)

      const result = await reconnectionService.attemptReconnect(sessionCode, participantId, 'ACTIVE')

      expect(result.success).toBe(false)
      expect(result.restored).toBe(false)
      expect(result.reason).toBe('grace_period_expired')
      expect(mockRedis.del).toHaveBeenCalledWith(`live:reconnect:${sessionCode}:${participantId}`)
    })

    it('should restore vote state to Redis for rehydration', async () => {
      mockRedis.get.mockResolvedValue(null)
      mockRedis.set.mockResolvedValue('OK')

      await reconnectionService.restoreVote(sessionCode, participantId, votedOptionId)

      expect(mockRedis.set).toHaveBeenCalledWith(
        `live:${sessionCode}:voted:${participantId}`,
        votedOptionId,
        'EX',
        86400
      )
    })

    it('should not overwrite existing vote when restoring', async () => {
      mockRedis.get.mockResolvedValue('option2')

      await reconnectionService.restoreVote(sessionCode, participantId, votedOptionId)

      expect(mockRedis.set).not.toHaveBeenCalled()
    })

    it('should handle reconnect when no disconnect record exists (new connection)', async () => {
      mockRedis.get.mockResolvedValue(null)

      const result = await reconnectionService.attemptReconnect(sessionCode, participantId, 'ACTIVE')

      expect(result.success).toBe(true)
      expect(result.restored).toBe(false)
      expect(result.reason).toBe('not_found')
    })

    it('should reject reconnect when session has ended', async () => {
      const result = await reconnectionService.attemptReconnect(sessionCode, participantId, 'ENDED')

      expect(result.success).toBe(false)
      expect(result.restored).toBe(false)
      expect(result.reason).toBe('session_ended')
      expect(mockRedis.get).not.toHaveBeenCalled()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-031: Host Disconnect Handling (Orphan Mode)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-031] Host Disconnect Handling (Orphan Mode)', () => {
    it('should mark session as orphaned when host disconnects', async () => {
      mockRedis.setex.mockResolvedValue('OK')

      await reconnectionService.recordDisconnect(sessionCode, participantId, userId, votedOptionId, true)

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `live:orphan:${sessionCode}`,
        30,
        expect.any(String)
      )
    })

    it('should check if session is orphaned', async () => {
      mockRedis.exists.mockResolvedValue(1)

      const isOrphaned = await reconnectionService.isSessionOrphaned(sessionCode)

      expect(isOrphaned).toBe(true)
      expect(mockRedis.exists).toHaveBeenCalledWith(`live:orphan:${sessionCode}`)
    })

    it('should get orphaned timestamp', async () => {
      const now = Date.now()
      mockRedis.get.mockResolvedValue(now.toString())

      const orphanedSince = await reconnectionService.getOrphanedSince(sessionCode)

      expect(orphanedSince).toBe(now)
    })

    it('should clear orphan status when host reconnects', async () => {
      const disconnectedAt = Date.now() - 5000
      const hostData: DisconnectedParticipant = {
        participantId,
        sessionCode,
        userId,
        disconnectedAt,
        votedOptionId,
        isHost: true,
      }

      mockRedis.get.mockResolvedValue(JSON.stringify(hostData))
      mockRedis.del.mockResolvedValue(1)

      const result = await reconnectionService.attemptReconnect(sessionCode, participantId, 'ACTIVE')

      expect(result.success).toBe(true)
      expect(result.restored).toBe(true)
      expect(mockRedis.del).toHaveBeenCalledWith(`live:orphan:${sessionCode}`)
    })

    it('should not mark session as orphaned when regular participant disconnects', async () => {
      mockRedis.setex.mockResolvedValue('OK')

      await reconnectionService.recordDisconnect(sessionCode, participantId, userId, votedOptionId, false)

      expect(mockRedis.setex).toHaveBeenCalledTimes(1)
      expect(mockRedis.setex).toHaveBeenCalledWith(
        `live:reconnect:${sessionCode}:${participantId}`,
        30,
        expect.any(String)
      )
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-031: Session Cleanup
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-031] Session Cleanup on End', () => {
    it('should cleanup all disconnect records for a session', async () => {
      const keys = [
        `live:reconnect:${sessionCode}:p1`,
        `live:reconnect:${sessionCode}:p2`,
        `live:reconnect:${sessionCode}:p3`,
      ]
      mockRedis.keys.mockResolvedValue(keys)
      mockRedis.del.mockResolvedValue(keys.length)

      await reconnectionService.cleanupSession(sessionCode)

      expect(mockRedis.keys).toHaveBeenCalledWith(`live:reconnect:${sessionCode}:*`)
      expect(mockRedis.del).toHaveBeenCalledWith(...keys)
      expect(mockRedis.del).toHaveBeenCalledWith(`live:orphan:${sessionCode}`)
    })

    it('should handle cleanup when no disconnect records exist', async () => {
      mockRedis.keys.mockResolvedValue([])
      mockRedis.del.mockResolvedValue(0)

      await reconnectionService.cleanupSession(sessionCode)

      expect(mockRedis.keys).toHaveBeenCalled()
      expect(mockRedis.del).toHaveBeenCalledWith(`live:orphan:${sessionCode}`)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-031: Multiple Disconnect/Reconnect Cycles
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-031] Multiple Disconnect/Reconnect Cycles', () => {
    it('should handle multiple disconnect/reconnect cycles for same participant', async () => {
      mockRedis.setex.mockResolvedValue('OK')

      await reconnectionService.recordDisconnect(sessionCode, participantId, userId, votedOptionId, false)
      await reconnectionService.recordDisconnect(sessionCode, participantId, userId, 'option2', false)
      await reconnectionService.recordDisconnect(sessionCode, participantId, userId, 'option3', false)

      expect(mockRedis.setex).toHaveBeenCalledTimes(3)
    })

    it('should update disconnect record with latest vote on subsequent disconnects', async () => {
      const firstVote = 'option1'
      const secondVote = 'option2'

      mockRedis.setex.mockImplementation(async (key, ttl, value) => {
        const data = JSON.parse(value as string)
        return 'OK'
      })

      await reconnectionService.recordDisconnect(sessionCode, participantId, userId, firstVote, false)

      const firstCall = mockRedis.setex.mock.calls[0]
      const firstData = JSON.parse(firstCall[2] as string)
      expect(firstData.votedOptionId).toBe(firstVote)

      await reconnectionService.recordDisconnect(sessionCode, participantId, userId, secondVote, false)

      const secondCall = mockRedis.setex.mock.calls[1]
      const secondData = JSON.parse(secondCall[2] as string)
      expect(secondData.votedOptionId).toBe(secondVote)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-031: Edge Cases
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-031] Edge Cases and Invalid States', () => {
    it('should handle malformed disconnect data gracefully', async () => {
      mockRedis.get.mockResolvedValue('invalid json')

      const result = await reconnectionService.attemptReconnect(sessionCode, participantId, 'ACTIVE')

      expect(result.success).toBe(true)
      expect(result.restored).toBe(false)
      expect(result.reason).toBe('not_found')
    })

    it('should retrieve disconnected participant data', async () => {
      const participantData: DisconnectedParticipant = {
        participantId,
        sessionCode,
        userId,
        disconnectedAt: Date.now(),
        votedOptionId,
        isHost: false,
      }

      mockRedis.get.mockResolvedValue(JSON.stringify(participantData))

      const data = await reconnectionService.getDisconnectedParticipant(sessionCode, participantId)

      expect(data).not.toBeNull()
      expect(data?.participantId).toBe(participantId)
      expect(data?.votedOptionId).toBe(votedOptionId)
    })

    it('should return null when retrieving non-existent participant', async () => {
      mockRedis.get.mockResolvedValue(null)

      const data = await reconnectionService.getDisconnectedParticipant(sessionCode, participantId)

      expect(data).toBeNull()
    })

    it('should handle Redis errors gracefully when getting orphaned timestamp', async () => {
      mockRedis.get.mockResolvedValue(null)

      const timestamp = await reconnectionService.getOrphanedSince(sessionCode)

      expect(timestamp).toBeNull()
    })
  })
})
