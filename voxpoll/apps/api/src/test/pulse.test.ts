// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PULSE SYSTEM TESTS
// Bible: P-013, P-056, P-060
// Test Coverage: P1-006 - PULSE System Tests
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { pulseService } from '../services/pulse.service'
import type { PulseData, PulseAccessResult, PulseHighlight } from '../services/pulse.service'

vi.mock('@voxpoll/database', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  },
  eq: vi.fn((field, value) => ({ field, value, op: 'eq' })),
  and: vi.fn((...conditions) => ({ conditions, op: 'and' })),
  sql: vi.fn(),
  count: vi.fn(),
  polls: { id: 'polls.id', slug: 'polls.slug', title: 'polls.title', options: 'polls.options' },
  pollResponses: {
    id: 'pollResponses.id',
    pollId: 'pollResponses.pollId',
    participantHash: 'pollResponses.participantHash',
    answers: 'pollResponses.answers',
    demographicSnapshot: 'pollResponses.demographicSnapshot',
    isValid: 'pollResponses.isValid',
  },
}))

const sharedRedis = {
  publish: vi.fn().mockResolvedValue(1),
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
  setex: vi.fn().mockResolvedValue('OK'),
}

vi.mock('../lib/redis', () => ({
  getRedis: vi.fn(() => sharedRedis),
}))

vi.mock('../services/cache.service', () => ({
  cacheService: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    del: vi.fn().mockResolvedValue(undefined),
  },
}))

import { db } from '@voxpoll/database'
import { getRedis } from '../lib/redis'
import { cacheService } from '../services/cache.service'

describe('[P1-006] PULSE System Service', () => {
  const pollId = 'poll-123'
  const userId = 'user-456'
  const creatorId = 'creator-789'
  const participantHash = 'hash-abc'

  let mockDb: any
  let mockCacheService: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = vi.mocked(db)
    mockCacheService = vi.mocked(cacheService)
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-060: Tier-Based Access Control
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-060] Tier-Based Access Control', () => {
    it('should grant access to creator regardless of participation', async () => {
      const result = await pulseService.checkPulseAccess(
        pollId,
        creatorId,
        null,
        creatorId,
        undefined
      )

      expect(result.canAccess).toBe(true)
      expect(result.reason).toBe('creator')
    })

    it('should grant access to PLUS tier users without participation', async () => {
      const result = await pulseService.checkPulseAccess(
        pollId,
        userId,
        'PLUS',
        creatorId,
        undefined
      )

      expect(result.canAccess).toBe(true)
      expect(result.reason).toBe('premium_tier')
    })

    it('should grant access to PREMIUM tier users without participation', async () => {
      const result = await pulseService.checkPulseAccess(
        pollId,
        userId,
        'PREMIUM',
        creatorId,
        undefined
      )

      expect(result.canAccess).toBe(true)
      expect(result.reason).toBe('premium_tier')
    })

    it('should grant access to FREE tier users who participated', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'response-1' }]),
          }),
        }),
      })

      const result = await pulseService.checkPulseAccess(
        pollId,
        userId,
        'FREE',
        creatorId,
        participantHash
      )

      expect(result.canAccess).toBe(true)
      expect(result.reason).toBe('participated')
    })

    it('should deny access to FREE tier users who did not participate', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await pulseService.checkPulseAccess(
        pollId,
        userId,
        'FREE',
        creatorId,
        participantHash
      )

      expect(result.canAccess).toBe(false)
      expect(result.reason).toBe('denied')
      expect(result.requiresParticipation).toBe(true)
    })

    it('should deny access when no participant hash provided and not premium', async () => {
      const result = await pulseService.checkPulseAccess(
        pollId,
        userId,
        'FREE',
        creatorId,
        undefined
      )

      expect(result.canAccess).toBe(false)
      expect(result.reason).toBe('denied')
      expect(result.requiresParticipation).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-013: Personal Result with Comparison
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-013] Personal Result Generation', () => {
    it('should generate personal result with comparison text for majority vote', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Best Framework',
        slug: 'best-framework',
        options: [
          { id: 'opt1', text: 'React', voteCount: 0 },
          { id: 'opt2', text: 'Vue', voteCount: 0 },
        ],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt2' } },
          ]),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { answers: { optionId: 'opt1' }, demographicSnapshot: null },
          ]),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ answers: { optionId: 'opt1' } }]),
          }),
        }),
      })

      const pulseData = await pulseService.generatePulseData(pollId, participantHash)

      expect(pulseData.personalResult).toBeDefined()
      expect(pulseData.personalResult?.selectedOptionText).toBe('React')
      expect(pulseData.personalResult?.percentage).toBe(75)
      expect(pulseData.personalResult?.rank).toBe(1)
      expect(pulseData.personalResult?.comparisonText).toContain('majority')
    })

    it('should generate personal result for minority vote', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Best Framework',
        slug: 'best-framework',
        options: [
          { id: 'opt1', text: 'React', voteCount: 0 },
          { id: 'opt2', text: 'Vue', voteCount: 0 },
          { id: 'opt3', text: 'Angular', voteCount: 0 },
        ],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt2' } },
            { answers: { optionId: 'opt3' } },
          ]),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { answers: { optionId: 'opt1' }, demographicSnapshot: null },
          ]),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ answers: { optionId: 'opt3' } }]),
          }),
        }),
      })

      const pulseData = await pulseService.generatePulseData(pollId, participantHash)

      expect(pulseData.personalResult).toBeDefined()
      expect(pulseData.personalResult?.rank).toBe(3)
      expect(pulseData.personalResult?.comparisonText).toContain('minority')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-013: Aggregate Charts with Vote Counts
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-013] Aggregate Chart Calculation', () => {
    it('should calculate aggregate chart with correct vote counts and percentages', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Best Framework',
        slug: 'best-framework',
        options: [
          { id: 'opt1', text: 'React', voteCount: 0 },
          { id: 'opt2', text: 'Vue', voteCount: 0 },
          { id: 'opt3', text: 'Angular', voteCount: 0 },
        ],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt2' } },
            { answers: { optionId: 'opt2' } },
            { answers: { optionId: 'opt3' } },
            { answers: { optionId: 'opt3' } },
          ]),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const pulseData = await pulseService.generatePulseData(pollId)

      expect(pulseData.aggregateChart).toBeDefined()
      expect(pulseData.aggregateChart.totalVotes).toBe(10)
      expect(pulseData.aggregateChart.options[0]?.text).toBe('React')
      expect(pulseData.aggregateChart.options[0]?.votes).toBe(6)
      expect(pulseData.aggregateChart.options[0]?.percentage).toBe(60)
      expect(pulseData.aggregateChart.options[1]?.votes).toBe(2)
      expect(pulseData.aggregateChart.options[2]?.votes).toBe(2)
    })

    it('should sort options by vote count descending', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Favorite Color',
        slug: 'favorite-color',
        options: [
          { id: 'opt1', text: 'Red', voteCount: 0 },
          { id: 'opt2', text: 'Blue', voteCount: 0 },
          { id: 'opt3', text: 'Green', voteCount: 0 },
        ],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { answers: { optionId: 'opt2' } },
            { answers: { optionId: 'opt2' } },
            { answers: { optionId: 'opt2' } },
            { answers: { optionId: 'opt2' } },
            { answers: { optionId: 'opt2' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt3' } },
          ]),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const pulseData = await pulseService.generatePulseData(pollId)

      expect(pulseData.aggregateChart.options[0]?.text).toBe('Blue')
      expect(pulseData.aggregateChart.options[0]?.votes).toBe(5)
      expect(pulseData.aggregateChart.options[1]?.text).toBe('Red')
      expect(pulseData.aggregateChart.options[1]?.votes).toBe(3)
      expect(pulseData.aggregateChart.options[2]?.text).toBe('Green')
      expect(pulseData.aggregateChart.options[2]?.votes).toBe(1)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-013: Demographic Breakdown
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-013] Demographic Breakdown', () => {
    it('should calculate age-based demographic breakdown with min sample size', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Test Poll',
        slug: 'test-poll',
        options: [
          { id: 'opt1', text: 'Yes', voteCount: 0 },
          { id: 'opt2', text: 'No', voteCount: 0 },
        ],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(
            Array(20).fill({ answers: { optionId: 'opt1' } })
          ),
        }),
      })

      const responses = []
      for (let i = 0; i < 15; i++) {
        responses.push({
          answers: { optionId: 'opt1' },
          demographicSnapshot: { ageRange: '18-24' },
        })
      }
      for (let i = 0; i < 5; i++) {
        responses.push({
          answers: { optionId: 'opt2' },
          demographicSnapshot: { ageRange: '18-24' },
        })
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(responses),
        }),
      })

      const pulseData = await pulseService.generatePulseData(pollId)

      expect(pulseData.demographics).toBeDefined()
      const ageBreakdown = pulseData.demographics.find((d) => d.category === 'age')
      expect(ageBreakdown).toBeDefined()
      expect(ageBreakdown?.segments.length).toBeGreaterThan(0)
      const segment = ageBreakdown?.segments[0]
      expect(segment?.label).toBe('18-24')
      expect(segment?.sampleSize).toBe(20)
    })

    it('should skip demographics with sample size below 10', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Test Poll',
        slug: 'test-poll',
        options: [{ id: 'opt1', text: 'Yes', voteCount: 0 }],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
          ]),
        }),
      })

      const smallSample = [
        { answers: { optionId: 'opt1' }, demographicSnapshot: { ageRange: '18-24' } },
        { answers: { optionId: 'opt1' }, demographicSnapshot: { ageRange: '18-24' } },
      ]

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(smallSample),
        }),
      })

      const pulseData = await pulseService.generatePulseData(pollId)

      const ageBreakdown = pulseData.demographics.find((d) => d.category === 'age')
      expect(ageBreakdown?.segments.length || 0).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-013: Highlights (Consensus, Divided, etc.)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-013] Highlights Generation', () => {
    it('should generate consensus highlight when option has >= 70% votes', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Test Poll',
        slug: 'test-poll',
        options: [
          { id: 'opt1', text: 'Yes', voteCount: 0 },
          { id: 'opt2', text: 'No', voteCount: 0 },
        ],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            ...Array(70).fill({ answers: { optionId: 'opt1' } }),
            ...Array(30).fill({ answers: { optionId: 'opt2' } }),
          ]),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const pulseData = await pulseService.generatePulseData(pollId)

      const consensusHighlight = pulseData.highlights.find((h) => h.type === 'consensus')
      expect(consensusHighlight).toBeDefined()
      expect(consensusHighlight?.text).toContain('consensus')
      expect(consensusHighlight?.text).toContain('70%')
    })

    it('should generate divided highlight when top two options are within 5%', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Test Poll',
        slug: 'test-poll',
        options: [
          { id: 'opt1', text: 'Option A', voteCount: 0 },
          { id: 'opt2', text: 'Option B', voteCount: 0 },
        ],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            ...Array(51).fill({ answers: { optionId: 'opt1' } }),
            ...Array(49).fill({ answers: { optionId: 'opt2' } }),
          ]),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const pulseData = await pulseService.generatePulseData(pollId)

      const dividedHighlight = pulseData.highlights.find((h) => h.type === 'divided')
      expect(dividedHighlight).toBeDefined()
      expect(dividedHighlight?.text).toContain('Close race')
    })

    it('should generate majority highlight when >= 1000 votes', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Test Poll',
        slug: 'test-poll',
        options: [{ id: 'opt1', text: 'Yes', voteCount: 0 }],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(Array(1200).fill({ answers: { optionId: 'opt1' } })),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const pulseData = await pulseService.generatePulseData(pollId)

      const majorityHighlight = pulseData.highlights.find((h) => h.type === 'majority')
      expect(majorityHighlight).toBeDefined()
      expect(majorityHighlight?.text).toContain('1,200')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-013: Shareable Card Generation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-013] Shareable Card Generation', () => {
    it('should generate shareable card with poll info', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Best Framework 2026',
        slug: 'best-framework-2026',
        options: [
          { id: 'opt1', text: 'React', voteCount: 0 },
          { id: 'opt2', text: 'Vue', voteCount: 0 },
        ],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt2' } },
          ]),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const pulseData = await pulseService.generatePulseData(pollId)

      expect(pulseData.shareCard).toBeDefined()
      expect(pulseData.shareCard.title).toBe('Best Framework 2026')
      expect(pulseData.shareCard.description).toContain('React')
      expect(pulseData.shareCard.description).toContain('67%')
      expect(pulseData.shareCard.pollUrl).toContain('best-framework-2026')
      expect(pulseData.shareCard.shareText).toContain('VoxPoll')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-056: Real-Time Updates (SSE + Redis Pub/Sub)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-056] Real-Time Updates (SSE + Redis Pub/Sub)', () => {
    it('should subscribe to pulse updates channel with initial data', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Test Poll',
        slug: 'test-poll',
        options: [{ id: 'opt1', text: 'Yes', voteCount: 0 }],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ answers: { optionId: 'opt1' } }]),
        }),
      })

      const subscription = await pulseService.subscribeToUpdates(pollId)

      expect(subscription.channel).toBe(`pulse:updates:${pollId}`)
      expect(subscription.initialData).toBeDefined()
      expect(subscription.initialData.totalVotes).toBe(1)
    })

    it('should broadcast update to Redis pub/sub channel', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Test Poll',
        slug: 'test-poll',
        options: [{ id: 'opt1', text: 'Yes', voteCount: 0 }],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ answers: { optionId: 'opt1' } }]),
        }),
      })

      await pulseService.broadcastUpdate(pollId)

      expect(sharedRedis.publish).toHaveBeenCalledWith(
        `pulse:updates:${pollId}`,
        expect.stringContaining('PULSE_UPDATE')
      )
    })

    it('should include aggregate data in broadcast message', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Test Poll',
        slug: 'test-poll',
        options: [{ id: 'opt1', text: 'Yes', voteCount: 0 }],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { answers: { optionId: 'opt1' } },
            { answers: { optionId: 'opt1' } },
          ]),
        }),
      })

      await pulseService.broadcastUpdate(pollId)

      const publishedData = JSON.parse(sharedRedis.publish.mock.calls[0]?.[1] as string)
      expect(publishedData.type).toBe('PULSE_UPDATE')
      expect(publishedData.data).toBeDefined()
      expect(publishedData.data.totalVotes).toBe(2)
      expect(publishedData.timestamp).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-034: Cache with TTL
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-034] Cache with TTL', () => {
    it('should cache PULSE data with expiry timestamp', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Test Poll',
        slug: 'test-poll',
        options: [{ id: 'opt1', text: 'Yes', voteCount: 0 }],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ answers: { optionId: 'opt1' } }]),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const beforeTime = Date.now()
      const pulseData = await pulseService.generatePulseData(pollId)
      const afterTime = Date.now()

      expect(pulseData.generatedAt).toBeGreaterThanOrEqual(beforeTime)
      expect(pulseData.generatedAt).toBeLessThanOrEqual(afterTime)
      expect(pulseData.cacheExpiry).toBeGreaterThan(pulseData.generatedAt)
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `pulse:${pollId}`,
        expect.any(Object),
        expect.any(Number)
      )
    })

    it('should return cached data when cache is valid', async () => {
      const cachedData: PulseData = {
        contentId: pollId,
        contentType: 'POLL',
        theme: {
          primaryColor: '#6366f1',
          secondaryColor: '#8b5cf6',
          backgroundGradient: ['#1e1b4b'],
          animationStyle: 'reveal',
        },
        aggregateChart: {
          options: [{ id: 'opt1', text: 'Yes', votes: 10, percentage: 100 }],
          totalVotes: 10,
        },
        demographics: [],
        comparisons: [],
        highlights: [],
        shareCard: {
          imageUrl: null,
          title: 'Test',
          description: 'Test',
          shareText: 'Test',
          pollUrl: 'https://voxpoll.com',
        },
        generatedAt: Date.now() - 30000,
        cacheExpiry: Date.now() + 30000,
      }

      mockCacheService.get.mockResolvedValueOnce(cachedData)

      const pulseData = await pulseService.generatePulseData(pollId)

      expect(pulseData).toEqual(cachedData)
      expect(mockDb.select).not.toHaveBeenCalled()
    })

    it('should invalidate cache when requested', async () => {
      await pulseService.invalidateCache(pollId)

      expect(mockCacheService.del).toHaveBeenCalledWith(`pulse:${pollId}`)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // BIBLE P-013: Edge Cases
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[BIBLE P-013] Edge Cases', () => {
    it('should handle poll with no votes gracefully', async () => {
      const mockPoll = {
        id: pollId,
        title: 'Test Poll',
        slug: 'test-poll',
        options: [{ id: 'opt1', text: 'Yes', voteCount: 0 }],
      }

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPoll]),
          }),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const pulseData = await pulseService.generatePulseData(pollId)

      expect(pulseData.aggregateChart.totalVotes).toBe(0)
      expect(pulseData.aggregateChart.options[0]?.percentage).toBe(0)
    })

    it('should throw error when poll not found', async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(pulseService.generatePulseData(pollId)).rejects.toThrow('Poll not found')
    })

    it('should handle subscription to non-existent poll gracefully', async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(pulseService.subscribeToUpdates(pollId)).rejects.toThrow('Poll not found')
    })
  })
})
