// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SOCIAL SERVICE
// Bible: 03-FEATURES, P-022
// Follow, Block, and Friend functionality
// ═══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, or, desc, sql, ne } from '@voxpoll/database'
import { users, follows, blocks } from '@voxpoll/database'
import { ApiError } from '../middleware/error-handler'
import { ERROR_MESSAGES, ERROR_CODES } from '../constants/messages'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type FollowStatus = 'PENDING' | 'ACTIVE' | 'REJECTED'

export interface FollowResult {
  status: FollowStatus
  followId: string
  isPending: boolean
  isMutual: boolean
}

export interface FollowRequest {
  id: string
  followerId: string
  follower: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
  }
  requestedAt: Date
}

export interface FollowerInfo {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  isFollowing: boolean
  isMutual: boolean
  followedAt: Date
}

export interface UserPrivacySettings {
  isPrivate?: boolean
  showActivity?: boolean
  allowDMs?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Social Service Class
// ─────────────────────────────────────────────────────────────────────────────

class SocialServiceClass {
  // ═══════════════════════════════════════════════════════════════════════════
  // FOLLOW SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

  async followUser(followerId: string, targetUserId: string): Promise<FollowResult> {
    if (followerId === targetUserId) {
      throw ApiError.badRequest(ERROR_MESSAGES.CANNOT_FOLLOW_SELF, ERROR_CODES.CANNOT_FOLLOW_SELF)
    }

    const [targetUser] = await db
      .select({
        id: users.id,
        privacySettings: users.privacySettings,
      })
      .from(users)
      .where(and(eq(users.id, targetUserId), sql`${users.deletedAt} IS NULL`))
      .limit(1)

    if (!targetUser) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    const isBlocked = await this.isBlocked(targetUserId, followerId)
    if (isBlocked) {
      throw ApiError.forbidden(ERROR_MESSAGES.USER_BLOCKED, ERROR_CODES.USER_BLOCKED)
    }

    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, targetUserId)))
      .limit(1)

    if (existingFollow) {
      if (existingFollow.status === 'ACTIVE') {
        throw ApiError.conflict(ERROR_MESSAGES.ALREADY_FOLLOWING, ERROR_CODES.ALREADY_FOLLOWING)
      }
      if (existingFollow.status === 'PENDING') {
        const isMutual = await this.checkMutualFollow(followerId, targetUserId)
        return {
          status: 'PENDING',
          followId: existingFollow.id,
          isPending: true,
          isMutual,
        }
      }
    }

    const privacySettings = (targetUser.privacySettings || {}) as UserPrivacySettings
    const isPrivate = privacySettings.isPrivate === true

    const status: FollowStatus = isPrivate ? 'PENDING' : 'ACTIVE'
    const now = new Date()

    if (existingFollow) {
      await db
        .update(follows)
        .set({
          status,
          requestedAt: isPrivate ? now : null,
          acceptedAt: isPrivate ? null : now,
          updatedAt: now,
        })
        .where(eq(follows.id, existingFollow.id))

      const isMutual = status === 'ACTIVE' && (await this.checkMutualFollow(followerId, targetUserId))

      return {
        status,
        followId: existingFollow.id,
        isPending: isPrivate,
        isMutual,
      }
    }

    const [newFollow] = await db
      .insert(follows)
      .values({
        followerId,
        followingId: targetUserId,
        status,
        requestedAt: isPrivate ? now : null,
        acceptedAt: isPrivate ? null : now,
      })
      .returning()

    const isMutual = status === 'ACTIVE' && (await this.checkMutualFollow(followerId, targetUserId))

    return {
      status,
      followId: newFollow!.id,
      isPending: isPrivate,
      isMutual,
    }
  }

  async unfollowUser(followerId: string, targetUserId: string): Promise<void> {
    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, targetUserId),
          or(eq(follows.status, 'ACTIVE'), eq(follows.status, 'PENDING'))
        )
      )
      .limit(1)

    if (!existingFollow) {
      throw ApiError.badRequest(ERROR_MESSAGES.NOT_FOLLOWING, ERROR_CODES.NOT_FOLLOWING)
    }

    await db.delete(follows).where(eq(follows.id, existingFollow.id))
  }

  async acceptFollowRequest(userId: string, requesterId: string): Promise<void> {
    const [followRequest] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, requesterId),
          eq(follows.followingId, userId),
          eq(follows.status, 'PENDING')
        )
      )
      .limit(1)

    if (!followRequest) {
      throw ApiError.notFound('Follow request not found', 'FOLLOW_REQUEST_NOT_FOUND')
    }

    await db
      .update(follows)
      .set({
        status: 'ACTIVE',
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(follows.id, followRequest.id))
  }

  async rejectFollowRequest(userId: string, requesterId: string): Promise<void> {
    const [followRequest] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, requesterId),
          eq(follows.followingId, userId),
          eq(follows.status, 'PENDING')
        )
      )
      .limit(1)

    if (!followRequest) {
      throw ApiError.notFound('Follow request not found', 'FOLLOW_REQUEST_NOT_FOUND')
    }

    await db
      .update(follows)
      .set({
        status: 'REJECTED',
        updatedAt: new Date(),
      })
      .where(eq(follows.id, followRequest.id))
  }

  async getPendingFollowRequests(
    userId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit
  ): Promise<{ items: FollowRequest[]; meta: { page: number; limit: number; total: number } }> {
    const offset = (page - 1) * limit

    const requests = await db
      .select({
        id: follows.id,
        followerId: follows.followerId,
        requestedAt: follows.requestedAt,
        follower: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(and(eq(follows.followingId, userId), eq(follows.status, 'PENDING')))
      .orderBy(desc(follows.requestedAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(and(eq(follows.followingId, userId), eq(follows.status, 'PENDING')))

    return {
      items: requests.map((r) => ({
        id: r.id,
        followerId: r.followerId,
        follower: r.follower,
        requestedAt: r.requestedAt || new Date(),
      })),
      meta: {
        page,
        limit,
        total: countResult?.count || 0,
      },
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FOLLOWERS / FOLLOWING LISTS
  // ═══════════════════════════════════════════════════════════════════════════

  async getFollowers(
    userId: string,
    viewerId: string | null,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit
  ): Promise<{ items: FollowerInfo[]; meta: { page: number; limit: number; total: number } }> {
    const offset = (page - 1) * limit

    const followerRows = await db
      .select({
        followerId: follows.followerId,
        acceptedAt: follows.acceptedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(and(eq(follows.followingId, userId), eq(follows.status, 'ACTIVE')))
      .orderBy(desc(follows.acceptedAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(and(eq(follows.followingId, userId), eq(follows.status, 'ACTIVE')))

    const items: FollowerInfo[] = []

    for (const row of followerRows) {
      let isFollowing = false
      let isMutual = false

      if (viewerId) {
        isFollowing = await this.isFollowing(viewerId, row.followerId)
        isMutual = await this.checkMutualFollow(userId, row.followerId)
      }

      items.push({
        id: row.user.id,
        username: row.user.username,
        displayName: row.user.displayName,
        avatarUrl: row.user.avatarUrl,
        isFollowing,
        isMutual,
        followedAt: row.acceptedAt || new Date(),
      })
    }

    return {
      items,
      meta: {
        page,
        limit,
        total: countResult?.count || 0,
      },
    }
  }

  async getFollowing(
    userId: string,
    viewerId: string | null,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit
  ): Promise<{ items: FollowerInfo[]; meta: { page: number; limit: number; total: number } }> {
    const offset = (page - 1) * limit

    const followingRows = await db
      .select({
        followingId: follows.followingId,
        acceptedAt: follows.acceptedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(and(eq(follows.followerId, userId), eq(follows.status, 'ACTIVE')))
      .orderBy(desc(follows.acceptedAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(and(eq(follows.followerId, userId), eq(follows.status, 'ACTIVE')))

    const items: FollowerInfo[] = []

    for (const row of followingRows) {
      let isFollowing = true
      let isMutual = false

      if (viewerId && viewerId !== userId) {
        isFollowing = await this.isFollowing(viewerId, row.followingId)
      }
      isMutual = await this.checkMutualFollow(userId, row.followingId)

      items.push({
        id: row.user.id,
        username: row.user.username,
        displayName: row.user.displayName,
        avatarUrl: row.user.avatarUrl,
        isFollowing,
        isMutual,
        followedAt: row.acceptedAt || new Date(),
      })
    }

    return {
      items,
      meta: {
        page,
        limit,
        total: countResult?.count || 0,
      },
    }
  }

  async getMutualFriends(
    userId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit
  ): Promise<{ items: FollowerInfo[]; meta: { page: number; limit: number; total: number } }> {
    const offset = (page - 1) * limit

    const mutualQuery = sql`
      SELECT f1.following_id as user_id, f1.accepted_at
      FROM follows f1
      INNER JOIN follows f2 ON f1.following_id = f2.follower_id
        AND f1.follower_id = f2.following_id
      WHERE f1.follower_id = ${userId}
        AND f1.status = 'ACTIVE'
        AND f2.status = 'ACTIVE'
      ORDER BY f1.accepted_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const mutualRows = (await db.execute(mutualQuery)) as Array<{ user_id: string; accepted_at: Date }>

    const countQuery = sql`
      SELECT COUNT(*) as count
      FROM follows f1
      INNER JOIN follows f2 ON f1.following_id = f2.follower_id
        AND f1.follower_id = f2.following_id
      WHERE f1.follower_id = ${userId}
        AND f1.status = 'ACTIVE'
        AND f2.status = 'ACTIVE'
    `

    const countResult = (await db.execute(countQuery)) as Array<{ count: number }>
    const total = countResult[0]?.count || 0

    if (mutualRows.length === 0) {
      return {
        items: [],
        meta: { page, limit, total: Number(total) },
      }
    }

    const userIds = mutualRows.map((r) => r.user_id)
    const userDetails = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(sql`${users.id} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`)

    const userMap = new Map(userDetails.map((u) => [u.id, u]))

    const items: FollowerInfo[] = mutualRows.map((row) => {
      const user = userMap.get(row.user_id)
      return {
        id: row.user_id,
        username: user?.username || '',
        displayName: user?.displayName || '',
        avatarUrl: user?.avatarUrl || null,
        isFollowing: true,
        isMutual: true,
        followedAt: row.accepted_at,
      }
    })

    return {
      items,
      meta: { page, limit, total: Number(total) },
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCK SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

  async blockUser(blockerId: string, targetUserId: string, reason?: string): Promise<void> {
    if (blockerId === targetUserId) {
      throw ApiError.badRequest('You cannot block yourself', 'CANNOT_BLOCK_SELF')
    }

    const [targetUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, targetUserId), sql`${users.deletedAt} IS NULL`))
      .limit(1)

    if (!targetUser) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    const [existingBlock] = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, targetUserId)))
      .limit(1)

    if (existingBlock) {
      return
    }

    await db.transaction(async (tx) => {
      await tx.insert(blocks).values({
        blockerId,
        blockedId: targetUserId,
        reason: reason || null,
      })

      await tx
        .delete(follows)
        .where(
          or(
            and(eq(follows.followerId, blockerId), eq(follows.followingId, targetUserId)),
            and(eq(follows.followerId, targetUserId), eq(follows.followingId, blockerId))
          )
        )
    })
  }

  async unblockUser(blockerId: string, targetUserId: string): Promise<void> {
    const [existingBlock] = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, targetUserId)))
      .limit(1)

    if (!existingBlock) {
      throw ApiError.notFound('User is not blocked', 'NOT_BLOCKED')
    }

    await db.delete(blocks).where(eq(blocks.id, existingBlock.id))
  }

  async getBlockedUsers(
    userId: string,
    page: number = 1,
    limit: number = PAGINATION.defaultLimit
  ): Promise<{
    items: Array<{
      id: string
      username: string
      displayName: string
      avatarUrl: string | null
      blockedAt: Date
    }>
    meta: { page: number; limit: number; total: number }
  }> {
    const offset = (page - 1) * limit

    const blockedRows = await db
      .select({
        blockedId: blocks.blockedId,
        createdAt: blocks.createdAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(blocks)
      .innerJoin(users, eq(blocks.blockedId, users.id))
      .where(eq(blocks.blockerId, userId))
      .orderBy(desc(blocks.createdAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blocks)
      .where(eq(blocks.blockerId, userId))

    return {
      items: blockedRows.map((r) => ({
        id: r.user.id,
        username: r.user.username,
        displayName: r.user.displayName,
        avatarUrl: r.user.avatarUrl,
        blockedAt: r.createdAt,
      })),
      meta: {
        page,
        limit,
        total: countResult?.count || 0,
      },
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select({ id: follows.id })
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId),
          eq(follows.status, 'ACTIVE')
        )
      )
      .limit(1)

    return !!follow
  }

  async checkMutualFollow(userId1: string, userId2: string): Promise<boolean> {
    const [f1] = await db
      .select({ id: follows.id })
      .from(follows)
      .where(
        and(eq(follows.followerId, userId1), eq(follows.followingId, userId2), eq(follows.status, 'ACTIVE'))
      )
      .limit(1)

    if (!f1) return false

    const [f2] = await db
      .select({ id: follows.id })
      .from(follows)
      .where(
        and(eq(follows.followerId, userId2), eq(follows.followingId, userId1), eq(follows.status, 'ACTIVE'))
      )
      .limit(1)

    return !!f2
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const [block] = await db
      .select({ id: blocks.id })
      .from(blocks)
      .where(and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId)))
      .limit(1)

    return !!block
  }

  async isBlockedBidirectional(userId1: string, userId2: string): Promise<boolean> {
    const [block] = await db
      .select({ id: blocks.id })
      .from(blocks)
      .where(
        or(
          and(eq(blocks.blockerId, userId1), eq(blocks.blockedId, userId2)),
          and(eq(blocks.blockerId, userId2), eq(blocks.blockedId, userId1))
        )
      )
      .limit(1)

    return !!block
  }

  async getFollowCounts(userId: string): Promise<{ followers: number; following: number; friends: number }> {
    const [followersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(and(eq(follows.followingId, userId), eq(follows.status, 'ACTIVE')))

    const [followingResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(and(eq(follows.followerId, userId), eq(follows.status, 'ACTIVE')))

    const friendsQuery = sql`
      SELECT COUNT(*) as count
      FROM follows f1
      INNER JOIN follows f2 ON f1.following_id = f2.follower_id
        AND f1.follower_id = f2.following_id
      WHERE f1.follower_id = ${userId}
        AND f1.status = 'ACTIVE'
        AND f2.status = 'ACTIVE'
    `
    const friendsResult = (await db.execute(friendsQuery)) as Array<{ count: number }>

    return {
      followers: followersResult?.count || 0,
      following: followingResult?.count || 0,
      friends: Number(friendsResult[0]?.count || 0),
    }
  }

  async getRelationship(
    viewerId: string,
    targetUserId: string
  ): Promise<{
    isFollowing: boolean
    isFollowedBy: boolean
    isPending: boolean
    isBlocked: boolean
    isBlockedBy: boolean
    isFriend: boolean
  }> {
    const [viewerFollow] = await db
      .select({ status: follows.status })
      .from(follows)
      .where(and(eq(follows.followerId, viewerId), eq(follows.followingId, targetUserId)))
      .limit(1)

    const [targetFollow] = await db
      .select({ status: follows.status })
      .from(follows)
      .where(
        and(eq(follows.followerId, targetUserId), eq(follows.followingId, viewerId), eq(follows.status, 'ACTIVE'))
      )
      .limit(1)

    const [viewerBlocked] = await db
      .select({ id: blocks.id })
      .from(blocks)
      .where(and(eq(blocks.blockerId, viewerId), eq(blocks.blockedId, targetUserId)))
      .limit(1)

    const [blockedByTarget] = await db
      .select({ id: blocks.id })
      .from(blocks)
      .where(and(eq(blocks.blockerId, targetUserId), eq(blocks.blockedId, viewerId)))
      .limit(1)

    const isFollowing = viewerFollow?.status === 'ACTIVE'
    const isFollowedBy = !!targetFollow
    const isPending = viewerFollow?.status === 'PENDING'
    const isBlocked = !!viewerBlocked
    const isBlockedBy = !!blockedByTarget
    const isFriend = isFollowing && isFollowedBy

    return {
      isFollowing,
      isFollowedBy,
      isPending,
      isBlocked,
      isBlockedBy,
      isFriend,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const socialService = new SocialServiceClass()
