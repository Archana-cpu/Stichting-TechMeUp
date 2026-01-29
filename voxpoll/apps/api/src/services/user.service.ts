// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - USER SERVICE
// Business logic for user profiles, follows, and blocks
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, or, sql, desc, ilike } from '@voxpoll/database'
import { users, follows, blocks, polls, userBadges, badges, pollResponses } from '@voxpoll/database'
import { userRepository } from '../repositories/user.repository'
import { ApiError } from '../middleware/error-handler'
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { buildPaginationMeta } from '../repositories/base.repository'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UpdateProfileInput {
  displayName?: string
  bio?: string
  avatarUrl?: string
  website?: string
  location?: string
}

export interface UserSettingsInput {
  emailNotifications?: boolean
  pushNotifications?: boolean
  marketingEmails?: boolean
  profileVisibility?: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'
}

// ─────────────────────────────────────────────────────────────────────────────
// User Service Class
// ─────────────────────────────────────────────────────────────────────────────

class UserServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Profile
  // ─────────────────────────────────────────────────────────────────────────────

  async getProfile(username: string, currentUserId?: string) {
    // Get user with counts
    const userResult = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        website: users.website,
        location: users.location,
        verificationLevel: users.verificationLevel,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1)

    const user = userResult[0]

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    // Get counts separately
    const [pollCountResult, followerCountResult, followingCountResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(polls).where(eq(polls.creatorId, user.id)),
      db.select({ count: sql<number>`count(*)::int` }).from(follows).where(and(eq(follows.followingId, user.id), eq(follows.status, 'ACTIVE'))),
      db.select({ count: sql<number>`count(*)::int` }).from(follows).where(and(eq(follows.followerId, user.id), eq(follows.status, 'ACTIVE'))),
    ])

    // Check relationships with current user
    let isFollowing = false
    let isBlocked = false
    let isBlockedBy = false

    if (currentUserId && currentUserId !== user.id) {
      const [followRelation, blockRelation, blockedByRelation] = await Promise.all([
        db
          .select()
          .from(follows)
          .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, user.id)))
          .limit(1),
        db
          .select()
          .from(blocks)
          .where(and(eq(blocks.blockerId, currentUserId), eq(blocks.blockedId, user.id)))
          .limit(1),
        db
          .select()
          .from(blocks)
          .where(and(eq(blocks.blockerId, user.id), eq(blocks.blockedId, currentUserId)))
          .limit(1),
      ])

      isFollowing = followRelation[0]?.status === 'ACTIVE'
      isBlocked = !!blockRelation[0]
      isBlockedBy = !!blockedByRelation[0]
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      website: user.website,
      location: user.location,
      verificationLevel: user.verificationLevel,
      createdAt: user.createdAt,
      stats: {
        polls: pollCountResult[0]?.count ?? 0,
        followers: followerCountResult[0]?.count ?? 0,
        following: followingCountResult[0]?.count ?? 0,
      },
      isFollowing,
      isBlocked,
      isBlockedBy,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Profile
  // ─────────────────────────────────────────────────────────────────────────────

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const result = await db
      .update(users)
      .set(input)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        website: users.website,
        location: users.location,
      })

    return result[0]
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Settings
  // ─────────────────────────────────────────────────────────────────────────────

  async getSettings(userId: string) {
    const result = await db
      .select({
        notificationSettings: users.notificationSettings,
        privacySettings: users.privacySettings,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    const user = result[0]

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    return {
      notifications: user.notificationSettings ?? {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
      },
      privacy: user.privacySettings ?? {
        profileVisibility: 'PUBLIC',
      },
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Settings
  // ─────────────────────────────────────────────────────────────────────────────

  async updateSettings(userId: string, input: UserSettingsInput) {
    const { emailNotifications, pushNotifications, marketingEmails, profileVisibility } = input

    const notificationSettings = {
      ...(emailNotifications !== undefined && { emailNotifications }),
      ...(pushNotifications !== undefined && { pushNotifications }),
      ...(marketingEmails !== undefined && { marketingEmails }),
    }

    const privacySettings = {
      ...(profileVisibility !== undefined && { profileVisibility }),
    }

    await db
      .update(users)
      .set({
        ...(Object.keys(notificationSettings).length > 0 && { notificationSettings }),
        ...(Object.keys(privacySettings).length > 0 && { privacySettings }),
      })
      .where(eq(users.id, userId))

    return { message: SUCCESS_MESSAGES.SETTINGS_UPDATED }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Follow User
  // ─────────────────────────────────────────────────────────────────────────────

  async followUser(followerId: string, username: string) {
    const userToFollow = await userRepository.findByUsername(username)

    if (!userToFollow) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    if (userToFollow.id === followerId) {
      throw ApiError.badRequest('Cannot follow yourself', 'CANNOT_FOLLOW_SELF')
    }

    // Check if blocked
    const blocked = await db
      .select()
      .from(blocks)
      .where(
        or(
          and(eq(blocks.blockerId, followerId), eq(blocks.blockedId, userToFollow.id)),
          and(eq(blocks.blockerId, userToFollow.id), eq(blocks.blockedId, followerId))
        )
      )
      .limit(1)

    if (blocked[0]) {
      throw ApiError.forbidden('Cannot follow this user', 'BLOCKED_USER')
    }

    // Check if already following
    const existing = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, userToFollow.id)))
      .limit(1)

    if (existing[0]) {
      if (existing[0].status === 'ACTIVE') {
        throw ApiError.conflict('Already following this user', 'ALREADY_FOLLOWING')
      }
      // Reactivate follow
      await db
        .update(follows)
        .set({ status: 'ACTIVE' })
        .where(eq(follows.id, existing[0].id))
    } else {
      await db.insert(follows).values({
        followerId,
        followingId: userToFollow.id,
        status: 'ACTIVE',
      })
    }

    return { message: SUCCESS_MESSAGES.FOLLOW_SUCCESS }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Unfollow User
  // ─────────────────────────────────────────────────────────────────────────────

  async unfollowUser(followerId: string, username: string) {
    const userToUnfollow = await userRepository.findByUsername(username)

    if (!userToUnfollow) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    // Delete the follow relationship
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, userToUnfollow.id)))

    return { message: SUCCESS_MESSAGES.UNFOLLOW_SUCCESS }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Followers
  // ─────────────────────────────────────────────────────────────────────────────

  async getFollowers(username: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const user = await userRepository.findByUsername(username)

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    const offset = (page - 1) * limit

    const [followersResult, totalResult] = await Promise.all([
      db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          verificationLevel: users.verificationLevel,
        })
        .from(follows)
        .innerJoin(users, eq(follows.followerId, users.id))
        .where(and(eq(follows.followingId, user.id), eq(follows.status, 'ACTIVE')))
        .orderBy(desc(follows.createdAt))
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(follows)
        .where(and(eq(follows.followingId, user.id), eq(follows.status, 'ACTIVE'))),
    ])

    return {
      items: followersResult,
      meta: buildPaginationMeta(page, limit, totalResult[0]?.count ?? 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Following
  // ─────────────────────────────────────────────────────────────────────────────

  async getFollowing(username: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const user = await userRepository.findByUsername(username)

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    const offset = (page - 1) * limit

    const [followingResult, totalResult] = await Promise.all([
      db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          verificationLevel: users.verificationLevel,
        })
        .from(follows)
        .innerJoin(users, eq(follows.followingId, users.id))
        .where(and(eq(follows.followerId, user.id), eq(follows.status, 'ACTIVE')))
        .orderBy(desc(follows.createdAt))
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(follows)
        .where(and(eq(follows.followerId, user.id), eq(follows.status, 'ACTIVE'))),
    ])

    return {
      items: followingResult,
      meta: buildPaginationMeta(page, limit, totalResult[0]?.count ?? 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Block User
  // ─────────────────────────────────────────────────────────────────────────────

  async blockUser(blockerId: string, username: string) {
    const userToBlock = await userRepository.findByUsername(username)

    if (!userToBlock) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    if (userToBlock.id === blockerId) {
      throw ApiError.badRequest('Cannot block yourself', 'CANNOT_BLOCK_SELF')
    }

    // Check if already blocked
    const existing = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, userToBlock.id)))
      .limit(1)

    if (existing[0]) {
      throw ApiError.conflict('User is already blocked', 'ALREADY_BLOCKED')
    }

    // Block user and remove any existing follow relationships
    await db.transaction(async (tx) => {
      await tx.insert(blocks).values({
        blockerId,
        blockedId: userToBlock.id,
      })
      // Remove follows in both directions
      await tx
        .delete(follows)
        .where(
          or(
            and(eq(follows.followerId, blockerId), eq(follows.followingId, userToBlock.id)),
            and(eq(follows.followerId, userToBlock.id), eq(follows.followingId, blockerId))
          )
        )
    })

    return { message: SUCCESS_MESSAGES.BLOCK_SUCCESS }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Unblock User
  // ─────────────────────────────────────────────────────────────────────────────

  async unblockUser(blockerId: string, username: string) {
    const userToUnblock = await userRepository.findByUsername(username)

    if (!userToUnblock) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    await db
      .delete(blocks)
      .where(and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, userToUnblock.id)))

    return { message: SUCCESS_MESSAGES.UNBLOCK_SUCCESS }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Blocked Users
  // ─────────────────────────────────────────────────────────────────────────────

  async getBlockedUsers(userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const offset = (page - 1) * limit

    const [blocksResult, totalResult] = await Promise.all([
      db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          blockedAt: blocks.createdAt,
        })
        .from(blocks)
        .innerJoin(users, eq(blocks.blockedId, users.id))
        .where(eq(blocks.blockerId, userId))
        .orderBy(desc(blocks.createdAt))
        .offset(offset)
        .limit(limit),
      db.select({ count: sql<number>`count(*)::int` }).from(blocks).where(eq(blocks.blockerId, userId)),
    ])

    return {
      items: blocksResult,
      meta: buildPaginationMeta(page, limit, totalResult[0]?.count ?? 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Search Users
  // ─────────────────────────────────────────────────────────────────────────────

  async searchUsers(query: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    if (!query || query.length < 2) {
      return {
        items: [],
        meta: buildPaginationMeta(page, limit, 0),
      }
    }

    const offset = (page - 1) * limit
    const searchPattern = `%${query}%`

    const [usersResult, totalResult] = await Promise.all([
      db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          verificationLevel: users.verificationLevel,
        })
        .from(users)
        .where(
          and(
            or(ilike(users.username, searchPattern), ilike(users.displayName, searchPattern)),
            eq(users.status, 'ACTIVE')
          )
        )
        .orderBy(desc(users.verificationLevel), users.username)
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(
          and(
            or(ilike(users.username, searchPattern), ilike(users.displayName, searchPattern)),
            eq(users.status, 'ACTIVE')
          )
        ),
    ])

    return {
      items: usersResult,
      meta: buildPaginationMeta(page, limit, totalResult[0]?.count ?? 0),
    }
  }
  // ─────────────────────────────────────────────────────────────────────────────
  // Check Username Availability
  // ─────────────────────────────────────────────────────────────────────────────

  async checkUsernameAvailability(username: string) {
    const existing = await userRepository.findByUsername(username.toLowerCase())
    return {
      username: username.toLowerCase(),
      available: !existing,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Polls
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserPolls(userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const offset = (page - 1) * limit

    const [pollsResult, totalResult] = await Promise.all([
      db
        .select({
          id: polls.id,
          title: polls.title,
          slug: polls.slug,
          type: polls.type,
          status: polls.status,
          visibility: polls.visibility,
          participantCount: polls.participantCount,
          createdAt: polls.createdAt,
          endsAt: polls.endsAt,
        })
        .from(polls)
        .where(and(eq(polls.creatorId, userId), sql`${polls.deletedAt} IS NULL`))
        .orderBy(desc(polls.createdAt))
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(and(eq(polls.creatorId, userId), sql`${polls.deletedAt} IS NULL`)),
    ])

    return {
      items: pollsResult.map((poll) => ({
        id: poll.id,
        title: poll.title,
        slug: poll.slug,
        type: poll.type,
        status: poll.status,
        visibility: poll.visibility,
        participantCount: poll.participantCount,
        createdAt: poll.createdAt,
        endsAt: poll.endsAt,
      })),
      meta: buildPaginationMeta(page, limit, totalResult[0]?.count ?? 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Saved Polls - Note: SavedPoll model not in schema
  // ─────────────────────────────────────────────────────────────────────────────

  async getSavedPolls(_userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    // SavedPoll model doesn't exist in schema - feature not implemented
    // Return empty result until schema is updated
    return {
      items: [],
      meta: buildPaginationMeta(page, limit, 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Save Poll - Feature not available (no SavedPoll model)
  // ─────────────────────────────────────────────────────────────────────────────

  async savePoll(_userId: string, _pollId: string) {
    throw ApiError.badRequest('Save poll feature not available', 'FEATURE_NOT_AVAILABLE')
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Unsave Poll - Feature not available (no SavedPoll model)
  // ─────────────────────────────────────────────────────────────────────────────

  async unsavePoll(_userId: string, _pollId: string) {
    throw ApiError.badRequest('Save poll feature not available', 'FEATURE_NOT_AVAILABLE')
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserBadges(userId: string) {
    const userBadgesResult = await db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        iconUrl: badges.iconUrl,
        rarity: badges.rarity,
        category: badges.category,
        earnedAt: userBadges.earnedAt,
        isDisplayed: userBadges.isDisplayed,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt))

    return {
      items: userBadgesResult,
      total: userBadgesResult.length,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Public User Polls
  // ─────────────────────────────────────────────────────────────────────────────

  async getPublicUserPolls(username: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const user = await userRepository.findByUsername(username)

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    const offset = (page - 1) * limit

    const [pollsResult, totalResult] = await Promise.all([
      db
        .select({
          id: polls.id,
          title: polls.title,
          slug: polls.slug,
          type: polls.type,
          status: polls.status,
          participantCount: polls.participantCount,
          createdAt: polls.createdAt,
          endsAt: polls.endsAt,
        })
        .from(polls)
        .where(
          and(
            eq(polls.creatorId, user.id),
            eq(polls.visibility, 'PUBLIC'),
            sql`${polls.status} IN ('ACTIVE', 'ENDED')`,
            sql`${polls.deletedAt} IS NULL`
          )
        )
        .orderBy(desc(polls.createdAt))
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(
          and(
            eq(polls.creatorId, user.id),
            eq(polls.visibility, 'PUBLIC'),
            sql`${polls.status} IN ('ACTIVE', 'ENDED')`,
            sql`${polls.deletedAt} IS NULL`
          )
        ),
    ])

    return {
      items: pollsResult,
      meta: buildPaginationMeta(page, limit, totalResult[0]?.count ?? 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Public User Badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getPublicUserBadges(username: string) {
    const user = await userRepository.findByUsername(username)

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    const userBadgesResult = await db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        iconUrl: badges.iconUrl,
        rarity: badges.rarity,
        category: badges.category,
        earnedAt: userBadges.earnedAt,
        isDisplayed: userBadges.isDisplayed,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, user.id))
      .orderBy(desc(userBadges.isDisplayed), desc(userBadges.earnedAt))

    return {
      items: userBadgesResult,
      total: userBadgesResult.length,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Vote History
  // ─────────────────────────────────────────────────────────────────────────────

  async getVoteHistory(userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const offset = (page - 1) * limit

    const [votesResult, totalResult] = await Promise.all([
      db
        .select({
          id: pollResponses.id,
          pollId: pollResponses.pollId,
          answers: pollResponses.answers,
          completedAt: pollResponses.completedAt,
          poll: {
            id: polls.id,
            title: polls.title,
            slug: polls.slug,
            type: polls.type,
            status: polls.status,
          },
        })
        .from(pollResponses)
        .innerJoin(polls, eq(pollResponses.pollId, polls.id))
        .where(sql`${pollResponses.participantHash} LIKE ${userId + ':%'}`)
        .orderBy(desc(pollResponses.completedAt))
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(pollResponses)
        .where(sql`${pollResponses.participantHash} LIKE ${userId + ':%'}`),
    ])

    return {
      items: votesResult,
      meta: buildPaginationMeta(page, limit, totalResult[0]?.count ?? 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Activity Feed
  // ─────────────────────────────────────────────────────────────────────────────

  async getActivityFeed(userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const offset = (page - 1) * limit

    const [pollsCreated, votesResult] = await Promise.all([
      db
        .select({
          type: sql<string>`'poll_created'`,
          id: polls.id,
          title: polls.title,
          slug: polls.slug,
          createdAt: polls.createdAt,
        })
        .from(polls)
        .where(and(eq(polls.creatorId, userId), sql`${polls.deletedAt} IS NULL`))
        .orderBy(desc(polls.createdAt))
        .limit(limit),
      db
        .select({
          type: sql<string>`'vote'`,
          id: pollResponses.id,
          pollId: pollResponses.pollId,
          pollTitle: polls.title,
          pollSlug: polls.slug,
          createdAt: pollResponses.completedAt,
        })
        .from(pollResponses)
        .innerJoin(polls, eq(pollResponses.pollId, polls.id))
        .where(sql`${pollResponses.participantHash} LIKE ${userId + ':%'}`)
        .orderBy(desc(pollResponses.completedAt))
        .limit(limit),
    ])

    const activities = [
      ...pollsCreated.map(p => ({ ...p, activityType: 'poll_created' as const })),
      ...votesResult.map(v => ({ ...v, activityType: 'vote' as const })),
    ].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(offset, offset + limit)

    return {
      items: activities,
      meta: buildPaginationMeta(page, limit, pollsCreated.length + votesResult.length),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Demographics
  // ─────────────────────────────────────────────────────────────────────────────

  async getDemographics(userId: string) {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    return {
      birthDate: user.birthDate,
      gender: user.gender,
      country: user.country,
      city: user.city,
      profession: user.profession,
      educationLevel: user.educationLevel,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Demographics
  // ─────────────────────────────────────────────────────────────────────────────

  async updateDemographics(userId: string, data: {
    profession?: string
    city?: string
  }) {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (data.profession !== undefined) {
      updateData['profession'] = data.profession
    }
    if (data.city !== undefined) {
      updateData['city'] = data.city
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        profession: users.profession,
        educationLevel: users.educationLevel,
        city: users.city,
      })

    return updatedUser
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Badge Visibility
  // ─────────────────────────────────────────────────────────────────────────────

  async updateBadgeVisibility(userId: string, badgeId: string, data: { visible?: boolean; displayOrder?: number }) {
    const existingBadge = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
      .limit(1)

    if (!existingBadge[0]) {
      throw ApiError.notFound('Badge not found', 'BADGE_NOT_FOUND')
    }

    const updateData: Record<string, unknown> = {}

    if (data.visible !== undefined) {
      updateData['isDisplayed'] = data.visible
    }
    if (data.displayOrder !== undefined) {
      updateData['displayOrder'] = data.displayOrder
    }

    if (Object.keys(updateData).length === 0) {
      return existingBadge[0]
    }

    const [updated] = await db
      .update(userBadges)
      .set(updateData)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
      .returning()

    return updated
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GDPR: Export User Data (Bible: 05-TECH)
  // ─────────────────────────────────────────────────────────────────────────────

  async exportUserData(userId: string) {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    const [pollsData, responsesData, followersData, followingData, badgesData] = await Promise.all([
      db.select().from(polls).where(eq(polls.creatorId, userId)),
      db.select().from(pollResponses).where(
        sql`${pollResponses.participantHash} IN (
          SELECT DISTINCT participant_hash FROM poll_responses
          WHERE participant_hash LIKE ${'%' + userId.substring(0, 8) + '%'}
        )`
      ),
      db.select().from(follows).where(eq(follows.followingId, userId)),
      db.select().from(follows).where(eq(follows.followerId, userId)),
      db.select().from(userBadges).where(eq(userBadges.userId, userId)),
    ])

    return {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        website: user.website,
        birthDate: user.birthDate,
        gender: user.gender,
        country: user.country,
        city: user.city,
        profession: user.profession,
        educationLevel: user.educationLevel,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        verificationLevel: user.verificationLevel,
        subscriptionTier: user.subscriptionTier,
        locale: user.locale,
        timezone: user.timezone,
        privacySettings: user.privacySettings,
        notificationSettings: user.notificationSettings,
        contentPreferences: user.contentPreferences,
      },
      polls: pollsData.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        type: p.type,
        status: p.status,
        visibility: p.visibility,
        createdAt: p.createdAt,
        publishedAt: p.publishedAt,
        participantCount: p.participantCount,
      })),
      responses: responsesData.length,
      followers: followersData.length,
      following: followingData.length,
      badges: badgesData.map(b => ({
        badgeId: b.badgeId,
        earnedAt: b.earnedAt,
      })),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GDPR: Request Account Deletion (Bible: 05-TECH - 30 day grace period)
  // ─────────────────────────────────────────────────────────────────────────────

  async requestAccountDeletion(userId: string, password: string) {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    if (user.passwordHash) {
      const { verify } = await import('@node-rs/argon2')
      const isValid = await verify(user.passwordHash, password)
      if (!isValid) {
        throw ApiError.unauthorized('Invalid password', 'INVALID_PASSWORD')
      }
    }

    const deletionDate = new Date()
    deletionDate.setDate(deletionDate.getDate() + 30)

    await db
      .update(users)
      .set({
        deletionRequestedAt: new Date(),
        status: 'DEACTIVATED' as never,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    return {
      message: 'Account deletion scheduled',
      deletionDate: deletionDate.toISOString(),
      gracePeriodDays: 30,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GDPR: Cancel Account Deletion
  // ─────────────────────────────────────────────────────────────────────────────

  async cancelAccountDeletion(userId: string) {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    if (!user.deletionRequestedAt) {
      throw ApiError.badRequest('No deletion request found', 'NO_DELETION_REQUEST')
    }

    await db
      .update(users)
      .set({
        deletionRequestedAt: null,
        status: 'ACTIVE' as never,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    return {
      message: 'Account deletion cancelled',
    }
  }
}

// Export singleton
export const userService = new UserServiceClass()

// Export class for testing
export { UserServiceClass as UserService }
