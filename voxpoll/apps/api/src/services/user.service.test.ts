// @ts-nocheck
// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - USER SERVICE TESTS
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockUser, createMockPaginatedResult } from '../test/factories'

// ─────────────────────────────────────────────────────────────────────────────
// Hoisted Mocks
// ─────────────────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  userRepository: {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByUsername: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Apply Mocks
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../repositories/user.repository', () => ({
  userRepository: mocks.userRepository,
}))

vi.mock('@voxpoll/database', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    transaction: vi.fn(),
  },
  eq: vi.fn((a, b) => ({ type: 'eq', a, b })),
  and: vi.fn((...args) => ({ type: 'and', args })),
  or: vi.fn((...args) => ({ type: 'or', args })),
  sql: vi.fn((strings, ...values) => ({ strings, values })),
  desc: vi.fn((col) => ({ type: 'desc', col })),
  ilike: vi.fn((col, pattern) => ({ type: 'ilike', col, pattern })),
  inArray: vi.fn((col, values) => ({ type: 'inArray', col, values })),
  users: { id: 'users.id', username: 'users.username' },
  follows: { id: 'follows.id', followerId: 'follows.followerId' },
  blocks: { id: 'blocks.id', blockerId: 'blocks.blockerId' },
  polls: { id: 'polls.id', creatorId: 'polls.creatorId' },
  userBadges: { id: 'userBadges.id', userId: 'userBadges.userId' },
  badges: { id: 'badges.id' },
  pollResponses: { id: 'pollResponses.id' },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Import Service After Mocks
// ─────────────────────────────────────────────────────────────────────────────

import { userService } from './user.service'

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // checkUsernameAvailability
  // ─────────────────────────────────────────────────────────────────────────────

  describe('checkUsernameAvailability', () => {
    it('should return available: true for non-existent username', async () => {
      mocks.userRepository.findByUsername.mockResolvedValue(null)

      const result = await userService.checkUsernameAvailability('newuser')

      expect(mocks.userRepository.findByUsername).toHaveBeenCalledWith('newuser')
      expect(result).toEqual({
        username: 'newuser',
        available: true,
      })
    })

    it('should return available: false for existing username', async () => {
      const existingUser = createMockUser({ username: 'testuser' })
      mocks.userRepository.findByUsername.mockResolvedValue(existingUser)

      const result = await userService.checkUsernameAvailability('testuser')

      expect(result).toEqual({
        username: 'testuser',
        available: false,
      })
    })

    it('should normalize username to lowercase', async () => {
      mocks.userRepository.findByUsername.mockResolvedValue(null)

      const result = await userService.checkUsernameAvailability('TestUser')

      expect(mocks.userRepository.findByUsername).toHaveBeenCalledWith('testuser')
      expect(result.username).toBe('testuser')
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // followUser
  // ─────────────────────────────────────────────────────────────────────────────

  describe('followUser', () => {
    it('should throw NOT_FOUND for non-existent user', async () => {
      mocks.userRepository.findByUsername.mockResolvedValue(null)

      await expect(
        userService.followUser('user_123', 'nonexistent')
      ).rejects.toThrow()
    })

    it('should throw error when trying to follow self', async () => {
      const mockUser = createMockUser({ id: 'user_123', username: 'testuser' })
      mocks.userRepository.findByUsername.mockResolvedValue(mockUser)

      await expect(
        userService.followUser('user_123', 'testuser')
      ).rejects.toThrow('Cannot follow yourself')
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // unfollowUser
  // ─────────────────────────────────────────────────────────────────────────────

  describe('unfollowUser', () => {
    it('should throw NOT_FOUND for non-existent user', async () => {
      mocks.userRepository.findByUsername.mockResolvedValue(null)

      await expect(
        userService.unfollowUser('user_123', 'nonexistent')
      ).rejects.toThrow()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // blockUser
  // ─────────────────────────────────────────────────────────────────────────────

  describe('blockUser', () => {
    it('should throw NOT_FOUND for non-existent user', async () => {
      mocks.userRepository.findByUsername.mockResolvedValue(null)

      await expect(
        userService.blockUser('user_123', 'nonexistent')
      ).rejects.toThrow()
    })

    it('should throw error when trying to block self', async () => {
      const mockUser = createMockUser({ id: 'user_123', username: 'testuser' })
      mocks.userRepository.findByUsername.mockResolvedValue(mockUser)

      await expect(
        userService.blockUser('user_123', 'testuser')
      ).rejects.toThrow('Cannot block yourself')
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // unblockUser
  // ─────────────────────────────────────────────────────────────────────────────

  describe('unblockUser', () => {
    it('should throw NOT_FOUND for non-existent user', async () => {
      mocks.userRepository.findByUsername.mockResolvedValue(null)

      await expect(
        userService.unblockUser('user_123', 'nonexistent')
      ).rejects.toThrow()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // searchUsers
  // ─────────────────────────────────────────────────────────────────────────────

  describe('searchUsers', () => {
    it('should return empty results for short query', async () => {
      const result = await userService.searchUsers('a')

      expect(result).toEqual({
        items: [],
        meta: expect.objectContaining({
          page: 1,
          total: 0,
        }),
      })
    })

    it('should return empty results for empty query', async () => {
      const result = await userService.searchUsers('')

      expect(result.items).toEqual([])
      expect(result.meta.total).toBe(0)
    })

    it('should accept valid pagination parameters', async () => {
      const result = await userService.searchUsers('test', 2, 10)

      expect(result.meta.page).toBe(2)
      expect(result.meta.limit).toBe(10)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // savePoll / unsavePoll
  // ─────────────────────────────────────────────────────────────────────────────

  describe('savePoll', () => {
    it('should throw FEATURE_NOT_AVAILABLE error', async () => {
      await expect(
        userService.savePoll('user_123', 'poll_123')
      ).rejects.toThrow('Save poll feature not available')
    })
  })

  describe('unsavePoll', () => {
    it('should throw FEATURE_NOT_AVAILABLE error', async () => {
      await expect(
        userService.unsavePoll('user_123', 'poll_123')
      ).rejects.toThrow('Save poll feature not available')
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // getSavedPolls
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getSavedPolls', () => {
    it('should return empty results', async () => {
      const result = await userService.getSavedPolls('user_123')

      expect(result.items).toEqual([])
      expect(result.meta.total).toBe(0)
    })

    it('should respect pagination parameters', async () => {
      const result = await userService.getSavedPolls('user_123', 2, 10)

      expect(result.meta.page).toBe(2)
      expect(result.meta.limit).toBe(10)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // getDemographics
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getDemographics', () => {
    it('should throw NOT_FOUND for non-existent user', async () => {
      mocks.userRepository.findById.mockResolvedValue(null)

      await expect(
        userService.getDemographics('nonexistent')
      ).rejects.toThrow()
    })

    it('should return user demographics', async () => {
      const mockUser = createMockUser({
        birthDate: new Date('1990-01-01'),
        gender: 'MALE',
        country: 'TR',
        city: 'Istanbul',
      })
      mocks.userRepository.findById.mockResolvedValue(mockUser)

      const result = await userService.getDemographics('user_123')

      expect(result).toEqual({
        birthDate: mockUser.birthDate,
        gender: mockUser.gender,
        country: mockUser.country,
        city: mockUser.city,
        profession: undefined,
        educationLevel: undefined,
      })
    })

    it('should return null fields for incomplete demographics', async () => {
      const mockUser = createMockUser({
        birthDate: null,
        gender: null,
        country: null,
        city: null,
      })
      mocks.userRepository.findById.mockResolvedValue(mockUser)

      const result = await userService.getDemographics('user_123')

      expect(result.birthDate).toBeNull()
      expect(result.gender).toBeNull()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // updateDemographics
  // ─────────────────────────────────────────────────────────────────────────────

  describe('updateDemographics', () => {
    it('should throw NOT_FOUND for non-existent user', async () => {
      mocks.userRepository.findById.mockResolvedValue(null)

      await expect(
        userService.updateDemographics('nonexistent', { country: 'TR' })
      ).rejects.toThrow()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Username Validation Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Username Validation', () => {
  const validateUsername = (username: string): void => {
    if (!username || username.length < 3 || username.length > 30) {
      throw new Error('Invalid username length')
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Invalid username characters')
    }
    const reserved = ['admin', 'system', 'root', 'voxpoll', 'api']
    if (reserved.includes(username.toLowerCase())) {
      throw new Error('Reserved username')
    }
  }

  it('should accept valid usernames', () => {
    const validUsernames = [
      'john',
      'john_doe',
      'john123',
      'john_doe_123',
      'abc',
      'a'.repeat(30),
    ]

    validUsernames.forEach((username) => {
      expect(() => validateUsername(username)).not.toThrow()
    })
  })

  it('should reject usernames that are too short', () => {
    expect(() => validateUsername('ab')).toThrow('Invalid username length')
    expect(() => validateUsername('')).toThrow('Invalid username length')
  })

  it('should reject usernames that are too long', () => {
    expect(() => validateUsername('a'.repeat(31))).toThrow('Invalid username length')
  })

  it('should reject usernames with invalid characters', () => {
    const invalidUsernames = ['john doe', 'john@doe', 'john.doe', 'john-doe']

    invalidUsernames.forEach((username) => {
      expect(() => validateUsername(username)).toThrow('Invalid username characters')
    })
  })

  it('should reject reserved usernames', () => {
    const reservedUsernames = ['admin', 'system', 'root', 'voxpoll', 'api']

    reservedUsernames.forEach((username) => {
      expect(() => validateUsername(username)).toThrow('Reserved username')
    })
  })

  it('should reject reserved usernames case-insensitively', () => {
    expect(() => validateUsername('ADMIN')).toThrow('Reserved username')
    expect(() => validateUsername('Admin')).toThrow('Reserved username')
  })
})
