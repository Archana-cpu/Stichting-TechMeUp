// ═══════════════════════════════════════════════════════════════════════════════
// P2-001: Follow System Tests
// Bible: 03-FEATURES/08-social.md, P-022
// NYOWORKS QA: Test suite for Twitter-style follow system
// ═══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { socialService } from '../services/social.service'
import { db, eq, and } from '@voxpoll/database'
import { ApiError } from '../middleware/error-handler'

vi.mock('@voxpoll/database', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
    execute: vi.fn(),
  },
  eq: vi.fn((...args) => ({ eq: args })),
  and: vi.fn((...args) => ({ and: args })),
  or: vi.fn((...args) => ({ or: args })),
  desc: vi.fn((arg) => ({ desc: arg })),
  sql: Object.assign(
    vi.fn((strings, ...values) => ({ strings, values })),
    {
      join: vi.fn(),
    }
  ),
  ne: vi.fn((...args) => ({ ne: args })),
  users: { id: 'id', username: 'username', displayName: 'displayName', avatarUrl: 'avatarUrl', privacySettings: 'privacySettings', deletedAt: 'deletedAt', subscriptionTier: 'subscriptionTier' },
  follows: { id: 'id', followerId: 'followerId', followingId: 'followingId', status: 'status', requestedAt: 'requestedAt', acceptedAt: 'acceptedAt', updatedAt: 'updatedAt', createdAt: 'createdAt' },
  blocks: { id: 'id', blockerId: 'blockerId', blockedId: 'blockedId', reason: 'reason', createdAt: 'createdAt' },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Test Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mockDbSelect(data: any) {
  return {
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(data),
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue(data),
          }),
        }),
      }),
      innerJoin: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue(data),
            }),
          }),
        }),
      }),
    }),
  }
}

function mockDbInsert(returnData: any) {
  return {
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([returnData]),
    }),
  }
}

function mockDbUpdate(returnData: any) {
  return {
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(returnData),
    }),
  }
}

function mockDbDelete() {
  return {
    where: vi.fn().mockResolvedValue({}),
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FOLLOW SYSTEM TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('P2-001: Follow System Tests (Bible P-022)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ───────────────────────────────────────────────────────────────────────────
  // One-Way Follow (Twitter-Style)
  // ───────────────────────────────────────────────────────────────────────────

  describe('One-Way Follow (Twitter-Style)', () => {
    it('should allow user to follow another user (public profile)', async () => {
      const followerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: targetUserId,
            privacySettings: { isPrivate: false },
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.insert).mockReturnValue(
        mockDbInsert({
          id: 'follow1',
          followerId,
          followingId: targetUserId,
          status: 'ACTIVE',
          acceptedAt: new Date(),
        })
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      const result = await socialService.followUser(followerId, targetUserId)

      expect(result.status).toBe('ACTIVE')
      expect(result.isPending).toBe(false)
      expect(result.isMutual).toBe(false)
    })

    it('should create PENDING follow for private profile (Bible P-022)', async () => {
      const followerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: targetUserId,
            privacySettings: { isPrivate: true },
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.insert).mockReturnValue(
        mockDbInsert({
          id: 'follow1',
          followerId,
          followingId: targetUserId,
          status: 'PENDING',
          requestedAt: new Date(),
        })
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      const result = await socialService.followUser(followerId, targetUserId)

      expect(result.status).toBe('PENDING')
      expect(result.isPending).toBe(true)
    })

    it('should throw error when user tries to follow themselves', async () => {
      const userId = 'user1'

      await expect(socialService.followUser(userId, userId)).rejects.toThrow(ApiError)
    })

    it('should throw error when target user does not exist', async () => {
      const followerId = 'user1'
      const targetUserId = 'nonexistent'

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      await expect(socialService.followUser(followerId, targetUserId)).rejects.toThrow(ApiError)
    })

    it('should throw error when trying to follow blocked user', async () => {
      const followerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: targetUserId,
            privacySettings: {},
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'block1',
            blockerId: targetUserId,
            blockedId: followerId,
          },
        ])
      )

      await expect(socialService.followUser(followerId, targetUserId)).rejects.toThrow(ApiError)
    })

    it('should throw error when already following (ACTIVE)', async () => {
      const followerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: targetUserId,
            privacySettings: {},
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'follow1',
            followerId,
            followingId: targetUserId,
            status: 'ACTIVE',
          },
        ])
      )

      await expect(socialService.followUser(followerId, targetUserId)).rejects.toThrow(ApiError)
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // Mutual Follow = Friends
  // ───────────────────────────────────────────────────────────────────────────

  describe('Mutual Follow = Friends (Bible P-022)', () => {
    it('should detect mutual follow as friendship', async () => {
      const userId1 = 'user1'
      const userId2 = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'follow1',
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'follow2',
          },
        ])
      )

      const isFriend = await socialService.checkMutualFollow(userId1, userId2)

      expect(isFriend).toBe(true)
    })

    it('should return false if only one-way follow exists', async () => {
      const userId1 = 'user1'
      const userId2 = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'follow1',
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      const isFriend = await socialService.checkMutualFollow(userId1, userId2)

      expect(isFriend).toBe(false)
    })

    it('should return mutual friends list (Bible P-022)', async () => {
      const userId = 'user1'

      vi.mocked(db.execute).mockResolvedValueOnce([
        { user_id: 'friend1', accepted_at: new Date() },
        { user_id: 'friend2', accepted_at: new Date() },
      ])

      vi.mocked(db.execute).mockResolvedValueOnce([{ count: 2 }])

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          { id: 'friend1', username: 'friend1_user', displayName: 'Friend 1', avatarUrl: null },
          { id: 'friend2', username: 'friend2_user', displayName: 'Friend 2', avatarUrl: null },
        ])
      )

      const result = await socialService.getMutualFriends(userId, 1, 20)

      expect(result.items).toHaveLength(2)
      expect(result.items[0].isMutual).toBe(true)
      expect(result.items[1].isMutual).toBe(true)
      expect(result.meta.total).toBe(2)
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // Follow Request Approval (Private Profiles)
  // ───────────────────────────────────────────────────────────────────────────

  describe('Follow Request Approval (Private Profiles)', () => {
    it('should accept follow request (PENDING → ACTIVE)', async () => {
      const userId = 'user1'
      const requesterId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'follow1',
            followerId: requesterId,
            followingId: userId,
            status: 'PENDING',
          },
        ])
      )

      vi.mocked(db.update).mockReturnValue(mockDbUpdate({}))

      await socialService.acceptFollowRequest(userId, requesterId)

      expect(db.update).toHaveBeenCalled()
    })

    it('should reject follow request (PENDING → REJECTED)', async () => {
      const userId = 'user1'
      const requesterId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'follow1',
            followerId: requesterId,
            followingId: userId,
            status: 'PENDING',
          },
        ])
      )

      vi.mocked(db.update).mockReturnValue(mockDbUpdate({}))

      await socialService.rejectFollowRequest(userId, requesterId)

      expect(db.update).toHaveBeenCalled()
    })

    it('should throw error if follow request does not exist', async () => {
      const userId = 'user1'
      const requesterId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      await expect(socialService.acceptFollowRequest(userId, requesterId)).rejects.toThrow(ApiError)
    })

    it('should get pending follow requests with pagination', async () => {
      const userId = 'user1'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'follow1',
            followerId: 'requester1',
            requestedAt: new Date(),
            follower: {
              id: 'requester1',
              username: 'requester1_user',
              displayName: 'Requester 1',
              avatarUrl: null,
            },
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([{ count: 1 }]))

      const result = await socialService.getPendingFollowRequests(userId, 1, 20)

      expect(result.items).toHaveLength(1)
      expect(result.items[0].followerId).toBe('requester1')
      expect(result.meta.total).toBe(1)
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // Unfollow Flow
  // ───────────────────────────────────────────────────────────────────────────

  describe('Unfollow Flow', () => {
    it('should allow user to unfollow (delete follow)', async () => {
      const followerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'follow1',
            followerId,
            followingId: targetUserId,
            status: 'ACTIVE',
          },
        ])
      )

      vi.mocked(db.delete).mockReturnValue(mockDbDelete())

      await socialService.unfollowUser(followerId, targetUserId)

      expect(db.delete).toHaveBeenCalled()
    })

    it('should throw error when not following', async () => {
      const followerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      await expect(socialService.unfollowUser(followerId, targetUserId)).rejects.toThrow(ApiError)
    })

    it('should allow unfollow for PENDING follow request', async () => {
      const followerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'follow1',
            followerId,
            followingId: targetUserId,
            status: 'PENDING',
          },
        ])
      )

      vi.mocked(db.delete).mockReturnValue(mockDbDelete())

      await socialService.unfollowUser(followerId, targetUserId)

      expect(db.delete).toHaveBeenCalled()
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // Followers / Following Lists
  // ───────────────────────────────────────────────────────────────────────────

  describe('Followers / Following Lists', () => {
    it('should get followers list with pagination', async () => {
      const userId = 'user1'
      const viewerId = 'viewer1'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            followerId: 'follower1',
            acceptedAt: new Date(),
            user: {
              id: 'follower1',
              username: 'follower1_user',
              displayName: 'Follower 1',
              avatarUrl: null,
            },
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([{ count: 1 }]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      const result = await socialService.getFollowers(userId, viewerId, 1, 20)

      expect(result.items).toHaveLength(1)
      expect(result.items[0].id).toBe('follower1')
      expect(result.meta.total).toBe(1)
    })

    it('should get following list with pagination', async () => {
      const userId = 'user1'
      const viewerId = 'viewer1'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            followingId: 'following1',
            acceptedAt: new Date(),
            user: {
              id: 'following1',
              username: 'following1_user',
              displayName: 'Following 1',
              avatarUrl: null,
            },
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([{ count: 1 }]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      const result = await socialService.getFollowing(userId, viewerId, 1, 20)

      expect(result.items).toHaveLength(1)
      expect(result.items[0].id).toBe('following1')
      expect(result.meta.total).toBe(1)
    })

    it('should get follow counts (followers, following, friends)', async () => {
      const userId = 'user1'

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([{ count: 10 }]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([{ count: 15 }]))

      vi.mocked(db.execute).mockResolvedValueOnce([{ count: 5 }])

      const counts = await socialService.getFollowCounts(userId)

      expect(counts.followers).toBe(10)
      expect(counts.following).toBe(15)
      expect(counts.friends).toBe(5)
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // getRelationship Utility (All States)
  // ───────────────────────────────────────────────────────────────────────────

  describe('getRelationship Utility (Bible P-022)', () => {
    it('should return full relationship status (following, followed by, friend)', async () => {
      const viewerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            status: 'ACTIVE',
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            status: 'ACTIVE',
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      const relationship = await socialService.getRelationship(viewerId, targetUserId)

      expect(relationship.isFollowing).toBe(true)
      expect(relationship.isFollowedBy).toBe(true)
      expect(relationship.isFriend).toBe(true)
      expect(relationship.isPending).toBe(false)
      expect(relationship.isBlocked).toBe(false)
      expect(relationship.isBlockedBy).toBe(false)
    })

    it('should detect PENDING follow request', async () => {
      const viewerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            status: 'PENDING',
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      const relationship = await socialService.getRelationship(viewerId, targetUserId)

      expect(relationship.isPending).toBe(true)
      expect(relationship.isFollowing).toBe(false)
      expect(relationship.isFriend).toBe(false)
    })

    it('should detect block status', async () => {
      const viewerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'block1',
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      const relationship = await socialService.getRelationship(viewerId, targetUserId)

      expect(relationship.isBlocked).toBe(true)
      expect(relationship.isFollowing).toBe(false)
    })

    it('should detect blocked by status', async () => {
      const viewerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'block1',
          },
        ])
      )

      const relationship = await socialService.getRelationship(viewerId, targetUserId)

      expect(relationship.isBlockedBy).toBe(true)
      expect(relationship.isFollowing).toBe(false)
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // Block Removes Follows (Bible P-022)
  // ───────────────────────────────────────────────────────────────────────────

  describe('Block Removes Follows (Bible P-022)', () => {
    it('should remove all follow relationships when blocking user', async () => {
      const blockerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: targetUserId,
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      const mockTransaction = vi.fn(async (callback) => {
        await callback({
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockResolvedValue({}),
          }),
          delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue({}),
          }),
        })
      })

      vi.mocked(db.transaction).mockImplementation(mockTransaction as any)

      await socialService.blockUser(blockerId, targetUserId)

      expect(db.transaction).toHaveBeenCalled()
    })

    it('should throw error when trying to block self', async () => {
      const userId = 'user1'

      await expect(socialService.blockUser(userId, userId)).rejects.toThrow(ApiError)
    })

    it('should not throw if user already blocked', async () => {
      const blockerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: targetUserId,
          },
        ])
      )

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'block1',
            blockerId,
            blockedId: targetUserId,
          },
        ])
      )

      await expect(socialService.blockUser(blockerId, targetUserId)).resolves.not.toThrow()
    })

    it('should unblock user successfully', async () => {
      const blockerId = 'user1'
      const targetUserId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'block1',
            blockerId,
            blockedId: targetUserId,
          },
        ])
      )

      vi.mocked(db.delete).mockReturnValue(mockDbDelete())

      await socialService.unblockUser(blockerId, targetUserId)

      expect(db.delete).toHaveBeenCalled()
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // Helper Methods
  // ───────────────────────────────────────────────────────────────────────────

  describe('Helper Methods', () => {
    it('should check if user is following (isFollowing)', async () => {
      const followerId = 'user1'
      const followingId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'follow1',
          },
        ])
      )

      const result = await socialService.isFollowing(followerId, followingId)

      expect(result).toBe(true)
    })

    it('should return false if not following', async () => {
      const followerId = 'user1'
      const followingId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(mockDbSelect([]))

      const result = await socialService.isFollowing(followerId, followingId)

      expect(result).toBe(false)
    })

    it('should check if user is blocked (isBlocked)', async () => {
      const blockerId = 'user1'
      const blockedId = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'block1',
          },
        ])
      )

      const result = await socialService.isBlocked(blockerId, blockedId)

      expect(result).toBe(true)
    })

    it('should check bidirectional block (isBlockedBidirectional)', async () => {
      const userId1 = 'user1'
      const userId2 = 'user2'

      vi.mocked(db.select).mockReturnValueOnce(
        mockDbSelect([
          {
            id: 'block1',
          },
        ])
      )

      const result = await socialService.isBlockedBidirectional(userId1, userId2)

      expect(result).toBe(true)
    })
  })
})
