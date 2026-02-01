// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - LIVE POLL WAITING ROOM TESTS
// Bible: 03-FEATURES/04-live-polls.md, P-040
// Test Coverage: P1-004 - Live Poll Waiting Room Tests
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  livePollWaitingRoomService,
  CAPACITY_LIMITS,
  WAITING_ROOM_CONFIG,
} from '../services/livepoll-waitingroom.service'
import { getRedis } from '../lib/redis'

const mockRedis = {
  zadd: vi.fn().mockResolvedValue(1),
  zrange: vi.fn().mockResolvedValue([]),
  zrem: vi.fn().mockResolvedValue(1),
  zcard: vi.fn().mockResolvedValue(0),
  zremrangebyscore: vi.fn().mockResolvedValue(0),
  set: vi.fn().mockResolvedValue('OK'),
  get: vi.fn().mockResolvedValue(null),
  exists: vi.fn().mockResolvedValue(0),
  del: vi.fn().mockResolvedValue(1),
  expire: vi.fn().mockResolvedValue(1),
  sadd: vi.fn().mockResolvedValue(1),
  srem: vi.fn().mockResolvedValue(1),
  scard: vi.fn().mockResolvedValue(0),
  smembers: vi.fn().mockResolvedValue([]),
}

vi.mock('../lib/redis', () => ({
  getRedis: vi.fn(() => mockRedis),
}))

describe('[P1-004] Live Poll Waiting Room Service', () => {
  const sessionCode = 'ABC123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-040: Capacity Tiers
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-040] Capacity Status Calculation', () => {
    it('should return NORMAL tier when below 80% capacity', async () => {
      const result = await livePollWaitingRoomService.getCapacityStatus(sessionCode, 7000)

      expect(result.tier).toBe('NORMAL')
      expect(result.action).toBe('ALLOW')
      expect(result.capacityPercent).toBe(0.7)
      expect(result.currentCount).toBe(7000)
      expect(result.maxCapacity).toBe(10000)
    })

    it('should return WARNING tier at 80% capacity (8,000 participants)', async () => {
      const result = await livePollWaitingRoomService.getCapacityStatus(sessionCode, 8000)

      expect(result.tier).toBe('WARNING')
      expect(result.action).toBe('ALLOW')
      expect(result.capacityPercent).toBe(0.8)
    })

    it('should return WARNING tier between 80-89% capacity', async () => {
      const result = await livePollWaitingRoomService.getCapacityStatus(sessionCode, 8500)

      expect(result.tier).toBe('WARNING')
      expect(result.action).toBe('ALLOW')
      expect(result.capacityPercent).toBe(0.85)
    })

    it('should return SOFT_CAP tier at 90% capacity (9,000 participants)', async () => {
      const result = await livePollWaitingRoomService.getCapacityStatus(sessionCode, 9000)

      expect(result.tier).toBe('SOFT_CAP')
      expect(result.action).toBe('WAITING_ROOM')
      expect(result.capacityPercent).toBe(0.9)
    })

    it('should return SOFT_CAP tier between 90-99% capacity', async () => {
      const result = await livePollWaitingRoomService.getCapacityStatus(sessionCode, 9500)

      expect(result.tier).toBe('SOFT_CAP')
      expect(result.action).toBe('WAITING_ROOM')
      expect(result.capacityPercent).toBe(0.95)
    })

    it('should return HARD_CAP tier at 100% capacity (10,000 participants)', async () => {
      const result = await livePollWaitingRoomService.getCapacityStatus(sessionCode, 10000)

      expect(result.tier).toBe('HARD_CAP')
      expect(result.action).toBe('SPECTATOR_MODE')
      expect(result.capacityPercent).toBe(1.0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-040: Waiting Room Queue (Redis Sorted Set - FIFO)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-040] FIFO Queue Management', () => {
    it('should add participant to waiting room queue with timestamp score', async () => {
      mockRedis.zadd.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(1)
      mockRedis.zcard.mockResolvedValue(1)
      mockRedis.zrange.mockResolvedValue([
        JSON.stringify({ participantId: 'participant-1', userId: 'user-1', joinedAt: Date.now() }),
      ])

      const participantId = 'participant-1'
      const userId = 'user-1'

      const result = await livePollWaitingRoomService.addToWaitingRoom(sessionCode, participantId, userId)

      expect(mockRedis.zadd).toHaveBeenCalledWith(
        `live:waitingRoom:${sessionCode}`,
        expect.any(Number),
        expect.stringContaining(participantId)
      )
      expect(mockRedis.expire).toHaveBeenCalledWith(
        `live:waitingRoom:${sessionCode}`,
        WAITING_ROOM_CONFIG.maxWaitingTimeSeconds + 60
      )
      expect(result.participantId).toBe(participantId)
      expect(result.userId).toBe(userId)
      expect(result.joinedAt).toBeGreaterThan(0)
    })

    it('should return correct queue position (1-indexed)', async () => {
      const entries = [
        JSON.stringify({ participantId: 'p1', joinedAt: 1000 }),
        JSON.stringify({ participantId: 'p2', joinedAt: 2000 }),
        JSON.stringify({ participantId: 'p3', joinedAt: 3000 }),
      ]
      mockRedis.zrange.mockResolvedValue(entries)

      const position = await livePollWaitingRoomService.getQueuePosition(sessionCode, 'p2')

      expect(position).toBe(2)
    })

    it('should return -1 for participant not in queue', async () => {
      mockRedis.zrange.mockResolvedValue([])

      const position = await livePollWaitingRoomService.getQueuePosition(sessionCode, 'not-exist')

      expect(position).toBe(-1)
    })

    it('should remove participant from waiting room queue', async () => {
      const entry = JSON.stringify({ participantId: 'p1', joinedAt: 1000 })
      mockRedis.zrange.mockResolvedValue([entry])
      mockRedis.zrem.mockResolvedValue(1)

      await livePollWaitingRoomService.removeFromWaitingRoom(sessionCode, 'p1')

      expect(mockRedis.zrem).toHaveBeenCalledWith(`live:waitingRoom:${sessionCode}`, entry)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-040: Auto-Promote from Queue (FIFO)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-040] Auto-Promote on Participant Leave', () => {
    it('should promote next participant from queue (FIFO order)', async () => {
      const firstEntry = JSON.stringify({ participantId: 'p1', userId: 'u1', joinedAt: 1000 })
      mockRedis.zrange.mockResolvedValue([firstEntry])
      mockRedis.zrem.mockResolvedValue(1)
      mockRedis.set.mockResolvedValue('OK')

      const promoted = await livePollWaitingRoomService.promoteNextFromQueue(sessionCode)

      expect(promoted).not.toBeNull()
      expect(promoted?.participantId).toBe('p1')
      expect(promoted?.userId).toBe('u1')
      expect(mockRedis.zrem).toHaveBeenCalledWith(`live:waitingRoom:${sessionCode}`, firstEntry)
      expect(mockRedis.set).toHaveBeenCalledWith(
        `live:promoted:${sessionCode}:p1`,
        '1',
        'EX',
        60
      )
    })

    it('should return null when queue is empty', async () => {
      mockRedis.zrange.mockResolvedValue([])

      const promoted = await livePollWaitingRoomService.promoteNextFromQueue(sessionCode)

      expect(promoted).toBeNull()
      expect(mockRedis.zrem).not.toHaveBeenCalled()
    })

    it('should check if participant is promoted', async () => {
      mockRedis.exists.mockResolvedValue(1)

      const isPromoted = await livePollWaitingRoomService.isPromoted(sessionCode, 'p1')

      expect(isPromoted).toBe(true)
      expect(mockRedis.exists).toHaveBeenCalledWith(`live:promoted:${sessionCode}:p1`)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-040: Position Updates & Estimated Wait Time
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-040] Position Tracking and Estimated Wait Time', () => {
    it('should calculate estimated wait time based on queue position', async () => {
      const oldTimestamp = Date.now() - 60000
      mockRedis.zcard.mockResolvedValue(3)
      mockRedis.zrange.mockResolvedValue([
        JSON.stringify({ participantId: 'p1', joinedAt: oldTimestamp }),
        oldTimestamp.toString(),
      ])

      const estimatedWait = await livePollWaitingRoomService.estimateWaitTime(sessionCode, 2)

      expect(estimatedWait).toBeGreaterThan(0)
      expect(estimatedWait).toBeLessThanOrEqual(WAITING_ROOM_CONFIG.maxWaitingTimeSeconds)
    })

    it('should return position update with queue stats', async () => {
      const entries = [
        JSON.stringify({ participantId: 'p1', joinedAt: 1000 }),
        JSON.stringify({ participantId: 'p2', joinedAt: 2000 }),
      ]
      mockRedis.zcard.mockResolvedValue(2)
      mockRedis.zrange.mockImplementation((async (...args: any[]) => {
        if (args[3] === 'WITHSCORES') {
          return [entries[0], '1000']
        }
        return entries
      }) as any)

      const update = await livePollWaitingRoomService.getPositionUpdate(sessionCode, 'p2')

      expect(update).not.toBeNull()
      expect(update?.position).toBe(2)
      expect(update?.queueLength).toBe(2)
      expect(update?.estimatedWaitSeconds).toBeGreaterThanOrEqual(0)
    })

    it('should return null for position update if participant not in queue', async () => {
      mockRedis.zrange.mockResolvedValue([])

      const update = await livePollWaitingRoomService.getPositionUpdate(sessionCode, 'not-exist')

      expect(update).toBeNull()
    })

    it('should enforce max wait time of 5 minutes (300 seconds)', async () => {
      const oldTimestamp = Date.now() - 30000000
      const firstEntry = JSON.stringify({ participantId: 'p0', joinedAt: oldTimestamp })
      mockRedis.zcard.mockResolvedValue(100)
      mockRedis.zrange.mockResolvedValue([firstEntry, oldTimestamp.toString()])

      const estimatedWait = await livePollWaitingRoomService.estimateWaitTime(sessionCode, 100)

      expect(estimatedWait).toBeLessThanOrEqual(WAITING_ROOM_CONFIG.maxWaitingTimeSeconds)
      expect(estimatedWait).toBe(WAITING_ROOM_CONFIG.maxWaitingTimeSeconds)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-040: Queue Expiry & Cleanup
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-040] Queue Expiry and Cleanup', () => {
    it('should cleanup entries older than max wait time (5 minutes)', async () => {
      mockRedis.zremrangebyscore.mockResolvedValue(3)

      const removed = await livePollWaitingRoomService.cleanupExpiredEntries(sessionCode)

      expect(removed).toBe(3)
      expect(mockRedis.zremrangebyscore).toHaveBeenCalledWith(
        `live:waitingRoom:${sessionCode}`,
        0,
        expect.any(Number)
      )
    })

    it('should clear entire waiting room', async () => {
      mockRedis.del.mockResolvedValue(1)

      await livePollWaitingRoomService.clearWaitingRoom(sessionCode)

      expect(mockRedis.del).toHaveBeenCalledWith(`live:waitingRoom:${sessionCode}`)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-040: Spectator Mode (100% Capacity - View Only)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-040] Spectator Mode at 100% Capacity', () => {
    it('should add participant as spectator at hard cap', async () => {
      const participantId = 'spectator-1'
      const userId = 'user-1'
      mockRedis.sadd.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(1)

      await livePollWaitingRoomService.addSpectator(sessionCode, participantId, userId)

      expect(mockRedis.sadd).toHaveBeenCalledWith(
        `live:spectators:${sessionCode}`,
        expect.stringContaining(participantId)
      )
      expect(mockRedis.expire).toHaveBeenCalledWith(`live:spectators:${sessionCode}`, 86400)
    })

    it('should remove spectator', async () => {
      const spectatorEntry = JSON.stringify({ participantId: 's1', joinedAt: 1000 })
      mockRedis.smembers.mockResolvedValue([spectatorEntry])
      mockRedis.srem.mockResolvedValue(1)

      await livePollWaitingRoomService.removeSpectator(sessionCode, 's1')

      expect(mockRedis.srem).toHaveBeenCalledWith(`live:spectators:${sessionCode}`, spectatorEntry)
    })

    it('should get spectator count', async () => {
      mockRedis.scard.mockResolvedValue(25)

      const count = await livePollWaitingRoomService.getSpectatorCount(sessionCode)

      expect(count).toBe(25)
      expect(mockRedis.scard).toHaveBeenCalledWith(`live:spectators:${sessionCode}`)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-040: Waiting Room Stats
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-040] Waiting Room Statistics', () => {
    it('should return empty stats when queue is empty', async () => {
      mockRedis.zcard.mockResolvedValue(0)

      const stats = await livePollWaitingRoomService.getWaitingRoomStats(sessionCode)

      expect(stats.queueLength).toBe(0)
      expect(stats.avgWaitTimeSeconds).toBe(0)
      expect(stats.oldestEntryAge).toBe(0)
    })

    it('should calculate waiting room stats correctly', async () => {
      const oldestTimestamp = Date.now() - 120000
      const oldestEntry = JSON.stringify({ participantId: 'p1', joinedAt: oldestTimestamp })
      mockRedis.zcard.mockResolvedValue(10)
      mockRedis.zrange.mockResolvedValue([oldestEntry, oldestTimestamp.toString()])

      const stats = await livePollWaitingRoomService.getWaitingRoomStats(sessionCode)

      expect(stats.queueLength).toBe(10)
      expect(stats.oldestEntryAge).toBeGreaterThan(0)
      expect(stats.avgWaitTimeSeconds).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-040: Configuration Validation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-040] Configuration Constants', () => {
    it('should have correct capacity limits per Bible', () => {
      expect(CAPACITY_LIMITS.maxParticipantsPerPoll).toBe(10000)
      expect(CAPACITY_LIMITS.warningThreshold).toBe(0.8)
      expect(CAPACITY_LIMITS.softCapThreshold).toBe(0.9)
      expect(CAPACITY_LIMITS.hardCapThreshold).toBe(1.0)
    })

    it('should have correct waiting room config per Bible', () => {
      expect(WAITING_ROOM_CONFIG.maxWaitingTimeSeconds).toBe(300)
      expect(WAITING_ROOM_CONFIG.positionUpdateIntervalSeconds).toBe(5)
      expect(WAITING_ROOM_CONFIG.allowLeaveQueue).toBe(true)
      expect(WAITING_ROOM_CONFIG.admissionOrder).toBe('FIFO')
    })
  })
})
