// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - POLL SERVICE TESTS
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pollService } from './poll.service'
import {
  createMockPollWithRelations,
  createMockPaginatedResult,
  createMockVoteMetadata,
  type PollWithRelations,
} from '../test/factories'

// ─────────────────────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../repositories/poll.repository', () => ({
  pollRepository: {
    findMany: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    findResponse: vi.fn(),
    incrementViewCount: vi.fn().mockResolvedValue(undefined),
    getUserVote: vi.fn().mockResolvedValue(null),
  },
  PollRepository: vi.fn(),
}))

vi.mock('./cache.service', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    delete: vi.fn(),
    invalidatePoll: vi.fn(),
  },
}))

vi.mock('./fraud.service', () => ({
  fraudService: {
    checkVoteValidity: vi.fn().mockResolvedValue({
      isValid: true,
      fraudScore: 0,
      signals: [],
    }),
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('PollService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // listPolls
  // ─────────────────────────────────────────────────────────────────────────────

  describe('listPolls', () => {
    it('should return paginated polls with default filters', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')
      const mockPolls = [
        createMockPollWithRelations(),
        createMockPollWithRelations(),
      ]

      vi.mocked(pollRepository.findMany).mockResolvedValue(
        createMockPaginatedResult(mockPolls, { total: 2 })
      )

      const result = await pollService.listPolls()

      expect(pollRepository.findMany).toHaveBeenCalled()
      expect(result.items).toHaveLength(2)
      expect(result.meta.total).toBe(2)
    })

    it('should apply category filter', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')

      vi.mocked(pollRepository.findMany).mockResolvedValue(
        createMockPaginatedResult([])
      )

      await pollService.listPolls(1, 20, 'recent', { categoryId: 'cat_123' })

      expect(pollRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat_123' }),
        expect.any(Number),
        expect.any(Number),
        expect.any(String)
      )
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // getPoll
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getPoll', () => {
    it('should return poll by id', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')
      const mockPoll = createMockPollWithRelations()

      vi.mocked(pollRepository.findById).mockResolvedValue(mockPoll as unknown as ReturnType<typeof pollRepository.findById> extends Promise<infer T> ? T : never)

      const result = await pollService.getPoll(mockPoll.id)

      expect(pollRepository.findById).toHaveBeenCalledWith(mockPoll.id)
      expect(result).toBeDefined()
      expect(result.id).toBe(mockPoll.id)
    })

    it('should throw NOT_FOUND for non-existent poll', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')

      vi.mocked(pollRepository.findById).mockResolvedValue(null)

      await expect(pollService.getPoll('nonexistent')).rejects.toThrow()
    })

    it('should throw FORBIDDEN for private poll without access', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')
      const mockPoll = createMockPollWithRelations({
        visibility: 'PRIVATE',
        creatorId: 'other_user',
      })

      vi.mocked(pollRepository.findById).mockResolvedValue(mockPoll as unknown as ReturnType<typeof pollRepository.findById> extends Promise<infer T> ? T : never)

      await expect(pollService.getPoll(mockPoll.id, 'user_456')).rejects.toThrow()
    })

    it('should allow creator to access private poll', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')
      const creatorId = 'user_123'
      const mockPoll = createMockPollWithRelations({
        visibility: 'PRIVATE',
        creatorId,
      })

      vi.mocked(pollRepository.findById).mockResolvedValue(mockPoll as unknown as ReturnType<typeof pollRepository.findById> extends Promise<infer T> ? T : never)

      const result = await pollService.getPoll(mockPoll.id, creatorId)

      expect(result).toBeDefined()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // createPoll
  // ─────────────────────────────────────────────────────────────────────────────

  describe('createPoll', () => {
    const validInput = {
      title: 'New Poll',
      options: [{ text: 'Option A' }, { text: 'Option B' }],
    }

    it('should create poll with valid input', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')
      const mockPoll = createMockPollWithRelations({ title: 'New Poll' })

      vi.mocked(pollRepository.create).mockResolvedValue(mockPoll as unknown as ReturnType<typeof pollRepository.create> extends Promise<infer T> ? T : never)

      const result = await pollService.createPoll('user_123', validInput)

      expect(pollRepository.create).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should call repository create with processed options', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')
      const mockPoll = createMockPollWithRelations({ title: 'New Poll' })
      vi.mocked(pollRepository.create).mockResolvedValue(mockPoll as unknown as ReturnType<typeof pollRepository.create> extends Promise<infer T> ? T : never)

      const input = {
        title: 'New Poll',
        options: [{ text: 'Option A' }, { text: 'Option B' }],
      }

      await pollService.createPoll('user_123', input)

      expect(pollRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Poll',
        })
      )
    })

    it('should accept poll with valid option count', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')
      const mockPoll = createMockPollWithRelations({ title: 'Multi Option Poll' })
      vi.mocked(pollRepository.create).mockResolvedValue(mockPoll as unknown as ReturnType<typeof pollRepository.create> extends Promise<infer T> ? T : never)

      const fourOptions = Array.from({ length: 4 }, (_, i) => ({
        text: `Option ${i + 1}`,
      }))

      const input = {
        title: 'Multi Option Poll',
        options: fourOptions,
      }

      const result = await pollService.createPoll('user_123', input)
      expect(result).toBeDefined()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // vote
  // ─────────────────────────────────────────────────────────────────────────────

  describe('vote', () => {
    it('should reject vote on non-existent poll', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')

      vi.mocked(pollRepository.findById).mockResolvedValue(null)

      await expect(
        pollService.vote('poll_123', 'user_123', 'opt_1', createMockVoteMetadata())
      ).rejects.toThrow()
    })

    it('should reject vote on ended poll', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')
      const mockPoll = createMockPollWithRelations({ status: 'ENDED' })

      vi.mocked(pollRepository.findById).mockResolvedValue(mockPoll as unknown as ReturnType<typeof pollRepository.findById> extends Promise<infer T> ? T : never)

      await expect(
        pollService.vote(mockPoll.id, 'user_123', 'opt_1', createMockVoteMetadata())
      ).rejects.toThrow()
    })

    it('should reject vote for invalid option', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')
      const mockPoll = createMockPollWithRelations()

      vi.mocked(pollRepository.findById).mockResolvedValue(mockPoll as unknown as ReturnType<typeof pollRepository.findById> extends Promise<infer T> ? T : never)
      vi.mocked(pollRepository.findResponse).mockResolvedValue(null)

      await expect(
        pollService.vote(mockPoll.id, 'user_123', 'invalid_option', createMockVoteMetadata())
      ).rejects.toThrow()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // deletePoll
  // ─────────────────────────────────────────────────────────────────────────────

  describe('deletePoll', () => {
    it('should soft delete poll for owner', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')
      const { cacheService } = await import('./cache.service')
      const creatorId = 'user_123'
      const mockPoll = createMockPollWithRelations({ creatorId })

      vi.mocked(pollRepository.findById).mockResolvedValue(mockPoll as unknown as ReturnType<typeof pollRepository.findById> extends Promise<infer T> ? T : never)
      vi.mocked(pollRepository.softDelete).mockResolvedValue(mockPoll as unknown as ReturnType<typeof pollRepository.softDelete> extends Promise<infer T> ? T : never)
      vi.mocked(cacheService.del).mockResolvedValue(true)

      await pollService.deletePoll(mockPoll.id, creatorId)

      expect(pollRepository.softDelete).toHaveBeenCalledWith(mockPoll.id)
    })

    it('should reject delete for non-owner', async () => {
      const { pollRepository } = await import('../repositories/poll.repository')
      const mockPoll = createMockPollWithRelations({ creatorId: 'other_user' })

      vi.mocked(pollRepository.findById).mockResolvedValue(mockPoll as unknown as ReturnType<typeof pollRepository.findById> extends Promise<infer T> ? T : never)

      await expect(
        pollService.deletePoll(mockPoll.id, 'user_123')
      ).rejects.toThrow()
    })
  })
})
