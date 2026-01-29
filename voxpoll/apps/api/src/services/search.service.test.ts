// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SEARCH SERVICE TESTS
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockUser,
  createMockPoll,
  createMockPaginatedResult,
} from '../test/factories'

// ─────────────────────────────────────────────────────────────────────────────
// Hoisted Mocks
// ─────────────────────────────────────────────────────────────────────────────

const mockDbChain = vi.hoisted(() => ({
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  leftJoin: vi.fn().mockReturnThis(),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Apply Mocks
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('@voxpoll/database', () => ({
  db: mockDbChain,
  eq: vi.fn((a, b) => ({ type: 'eq', a, b })),
  and: vi.fn((...args) => ({ type: 'and', args })),
  or: vi.fn((...args) => ({ type: 'or', args })),
  sql: vi.fn((strings, ...values) => ({ strings, values })),
  desc: vi.fn((col) => ({ type: 'desc', col })),
  ilike: vi.fn((col, pattern) => ({ type: 'ilike', col, pattern })),
  polls: {
    id: 'polls.id',
    title: 'polls.title',
    description: 'polls.description',
    slug: 'polls.slug',
    visibility: 'polls.visibility',
    status: 'polls.status',
    participantCount: 'polls.participantCount',
    deletedAt: 'polls.deletedAt',
    tags: 'polls.tags',
  },
  users: {
    id: 'users.id',
    username: 'users.username',
    displayName: 'users.displayName',
    avatarUrl: 'users.avatarUrl',
    status: 'users.status',
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Import Service After Mocks
// ─────────────────────────────────────────────────────────────────────────────

import { searchService } from './search.service'

// ─────────────────────────────────────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────────────────────────────────────

const createMockPollSearchResult = () => ({
  id: createMockPoll().id,
  title: 'Test Poll',
  slug: 'test-poll',
  participantCount: 100,
})

const createMockUserSearchResult = () => ({
  id: createMockUser().id,
  username: 'testuser',
  displayName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
})

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('SearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDbChain.limit.mockReturnValue(Promise.resolve([]))
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // search
  // ─────────────────────────────────────────────────────────────────────────────

  describe('search', () => {
    it('should search polls when type is "polls"', async () => {
      const mockPolls = [createMockPollSearchResult(), createMockPollSearchResult()]
      mockDbChain.limit.mockResolvedValueOnce(mockPolls)

      const result = await searchService.search('test', 'polls', 1, 20)

      expect(result.items).toBeDefined()
      expect(result.meta).toBeDefined()
      expect(result.meta.page).toBe(1)
    })

    it('should search users when type is "users"', async () => {
      const mockUsers = [createMockUserSearchResult(), createMockUserSearchResult()]
      mockDbChain.limit.mockResolvedValueOnce(mockUsers)

      const result = await searchService.search('test', 'users', 1, 20)

      expect(result.items).toBeDefined()
      expect(result.meta).toBeDefined()
    })

    it('should search all types when type is "all"', async () => {
      const mockPolls = [createMockPollSearchResult()]
      const mockUsers = [createMockUserSearchResult()]
      mockDbChain.limit
        .mockResolvedValueOnce(mockPolls)
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([])

      const result = await searchService.search('test', 'all', 1, 20)

      expect(result.items).toBeDefined()
      expect(result.meta).toBeDefined()
    })

    it('should use default pagination values', async () => {
      mockDbChain.limit.mockResolvedValue([])

      const result = await searchService.search('test')

      expect(result.meta.page).toBe(1)
    })

    it('should return empty items for no matches', async () => {
      mockDbChain.limit.mockResolvedValue([])

      const result = await searchService.search('nonexistent', 'polls', 1, 20)

      expect(result.items).toEqual([])
      expect(result.meta.total).toBe(0)
    })

    it('should handle pagination correctly', async () => {
      mockDbChain.limit.mockResolvedValue([])

      const result = await searchService.search('test', 'polls', 3, 25)

      expect(result.meta.page).toBe(3)
      expect(result.meta.limit).toBe(25)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // searchTags
  // ─────────────────────────────────────────────────────────────────────────────

  describe('searchTags', () => {
    it('should return tags matching query', async () => {
      const mockTags = [{ name: 'technology' }, { name: 'tech-news' }]
      mockDbChain.limit.mockResolvedValueOnce(mockTags)

      const result = await searchService.searchTags('tech', 10)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should use default limit when not specified', async () => {
      mockDbChain.limit.mockResolvedValueOnce([])

      const result = await searchService.searchTags('test')

      expect(result).toEqual([])
    })

    it('should return tags with count property', async () => {
      const mockTags = [{ name: 'politics' }]
      mockDbChain.limit.mockResolvedValueOnce(mockTags)

      const result = await searchService.searchTags('pol', 10)

      expect(result[0]).toHaveProperty('name')
      expect(result[0]).toHaveProperty('count')
    })

    it('should return empty array for no matches', async () => {
      mockDbChain.limit.mockResolvedValueOnce([])

      const result = await searchService.searchTags('xyz123nonexistent', 10)

      expect(result).toEqual([])
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // getSuggestions
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getSuggestions', () => {
    it('should return poll and user suggestions', async () => {
      const mockPollSuggestions = [{ title: 'Test Poll' }]
      const mockUserSuggestions = [{ username: 'testuser', displayName: 'Test User' }]

      mockDbChain.limit
        .mockResolvedValueOnce(mockPollSuggestions)
        .mockResolvedValueOnce(mockUserSuggestions)

      const result = await searchService.getSuggestions('test', 10)

      expect(result).toHaveProperty('polls')
      expect(result).toHaveProperty('users')
    })

    it('should use default limit when not specified', async () => {
      mockDbChain.limit
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await searchService.getSuggestions('test')

      expect(result.polls).toEqual([])
      expect(result.users).toEqual([])
    })

    it('should return poll titles as strings', async () => {
      const mockPollSuggestions = [{ title: 'Poll 1' }, { title: 'Poll 2' }]
      mockDbChain.limit
        .mockResolvedValueOnce(mockPollSuggestions)
        .mockResolvedValueOnce([])

      const result = await searchService.getSuggestions('poll', 10)

      expect(result.polls).toEqual(['Poll 1', 'Poll 2'])
    })

    it('should return user objects with username and displayName', async () => {
      const mockUserSuggestions = [
        { username: 'user1', displayName: 'User One' },
        { username: 'user2', displayName: 'User Two' },
      ]
      mockDbChain.limit
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockUserSuggestions)

      const result = await searchService.getSuggestions('user', 10)

      expect(result.users).toEqual([
        { username: 'user1', displayName: 'User One' },
        { username: 'user2', displayName: 'User Two' },
      ])
    })

    it('should handle empty suggestions', async () => {
      mockDbChain.limit
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await searchService.getSuggestions('xyz123', 10)

      expect(result.polls).toEqual([])
      expect(result.users).toEqual([])
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Search Result Type Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Search Result Types', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDbChain.limit.mockReturnValue(Promise.resolve([]))
  })

  it('poll results should have correct type', async () => {
    const mockPolls = [createMockPollSearchResult(), createMockPollSearchResult()]
    mockDbChain.limit.mockResolvedValueOnce(mockPolls)

    const result = await searchService.search('test', 'polls', 1, 20)

    result.items.forEach((item) => {
      expect(item.type).toBe('poll')
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('slug')
    })
  })

  it('user results should have correct type', async () => {
    const mockUsers = [createMockUserSearchResult(), createMockUserSearchResult()]
    mockDbChain.limit.mockResolvedValueOnce(mockUsers)

    const result = await searchService.search('test', 'users', 1, 20)

    result.items.forEach((item) => {
      expect(item.type).toBe('user')
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('username')
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Edge Cases
// ─────────────────────────────────────────────────────────────────────────────

describe('Search Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDbChain.limit.mockReturnValue(Promise.resolve([]))
  })

  it('should handle special characters in query', async () => {
    const result = await searchService.search('test@#$%', 'polls', 1, 20)

    expect(result.items).toBeDefined()
    expect(result.meta).toBeDefined()
  })

  it('should handle unicode characters in query', async () => {
    const result = await searchService.search('türkçe test', 'polls', 1, 20)

    expect(result.items).toBeDefined()
    expect(result.meta).toBeDefined()
  })

  it('should handle very long queries gracefully', async () => {
    const longQuery = 'a'.repeat(500)
    const result = await searchService.search(longQuery, 'polls', 1, 20)

    expect(result.items).toBeDefined()
    expect(result.meta).toBeDefined()
  })
})
