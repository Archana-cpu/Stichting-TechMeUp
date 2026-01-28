// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - USER CONTROLLER
// HTTP request/response handling for user operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { userService } from '../services/user.service'
import { notificationService } from '../services/notification.service'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UpdateProfileBody {
  displayName?: string
  bio?: string
  avatarUrl?: string
  website?: string
  location?: string
}

interface UpdateSettingsBody {
  emailNotifications?: boolean
  pushNotifications?: boolean
  marketingEmails?: boolean
  profileVisibility?: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'
}

// ─────────────────────────────────────────────────────────────────────────────
// User Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class UserControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/:username - Get user profile
  // ─────────────────────────────────────────────────────────────────────────────

  async getProfile(c: Context<AppEnv>) {
    const username = c.req.param('username')
    const currentUserId = c.get('userId')

    const profile = await userService.getProfile(username, currentUserId)

    return c.json({
      success: true,
      data: profile,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /users/me - Update current user profile
  // ─────────────────────────────────────────────────────────────────────────────

  async updateProfile(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    // Body is already validated by zValidator in routes
    const body = await c.req.json<UpdateProfileBody>()

    const user = await userService.updateProfile(userId, body)

    return c.json({
      success: true,
      data: user,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/me/settings - Get user settings
  // ─────────────────────────────────────────────────────────────────────────────

  async getSettings(c: Context<AppEnv>) {
    const userId = c.get('userId')!

    const settings = await userService.getSettings(userId)

    return c.json({
      success: true,
      data: settings,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /users/me/settings - Update user settings
  // ─────────────────────────────────────────────────────────────────────────────

  async updateSettings(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    // Body is already validated by zValidator in routes
    const body = await c.req.json<UpdateSettingsBody>()

    const result = await userService.updateSettings(userId, body)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /users/:username/follow - Follow user
  // ─────────────────────────────────────────────────────────────────────────────

  async followUser(c: Context<AppEnv>) {
    const username = c.req.param('username')
    const followerId = c.get('userId')!

    const result = await userService.followUser(followerId, username)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /users/:username/follow - Unfollow user
  // ─────────────────────────────────────────────────────────────────────────────

  async unfollowUser(c: Context<AppEnv>) {
    const username = c.req.param('username')
    const followerId = c.get('userId')!

    const result = await userService.unfollowUser(followerId, username)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/:username/followers - Get followers list
  // ─────────────────────────────────────────────────────────────────────────────

  async getFollowers(c: Context<AppEnv>) {
    const username = c.req.param('username')
    const { page, limit } = this.getPaginationParams(c)

    const result = await userService.getFollowers(username, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/:username/following - Get following list
  // ─────────────────────────────────────────────────────────────────────────────

  async getFollowing(c: Context<AppEnv>) {
    const username = c.req.param('username')
    const { page, limit } = this.getPaginationParams(c)

    const result = await userService.getFollowing(username, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /users/:username/block - Block user
  // ─────────────────────────────────────────────────────────────────────────────

  async blockUser(c: Context<AppEnv>) {
    const username = c.req.param('username')
    const blockerId = c.get('userId')!

    const result = await userService.blockUser(blockerId, username)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /users/:username/block - Unblock user
  // ─────────────────────────────────────────────────────────────────────────────

  async unblockUser(c: Context<AppEnv>) {
    const username = c.req.param('username')
    const blockerId = c.get('userId')!

    const result = await userService.unblockUser(blockerId, username)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/me/blocked - Get blocked users list
  // ─────────────────────────────────────────────────────────────────────────────

  async getBlockedUsers(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const { page, limit } = this.getPaginationParams(c)

    const result = await userService.getBlockedUsers(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/search - Search users
  // ─────────────────────────────────────────────────────────────────────────────

  async searchUsers(c: Context<AppEnv>) {
    const query = c.req.query('q') || ''
    const { page, limit } = this.getPaginationParams(c)

    const result = await userService.searchUsers(query, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/check-username/:username - Check username availability
  // ─────────────────────────────────────────────────────────────────────────────

  async checkUsername(c: Context<AppEnv>) {
    const username = c.req.param('username')

    const result = await userService.checkUsernameAvailability(username)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/me/polls - Get current user's polls
  // ─────────────────────────────────────────────────────────────────────────────

  async getMyPolls(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const { page, limit } = this.getPaginationParams(c)

    const result = await userService.getUserPolls(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/me/saved - Get saved polls
  // ─────────────────────────────────────────────────────────────────────────────

  async getSavedPolls(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const { page, limit } = this.getPaginationParams(c)

    const result = await userService.getSavedPolls(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /users/me/saved/:pollId - Save poll
  // ─────────────────────────────────────────────────────────────────────────────

  async savePoll(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const pollId = c.req.param('pollId')

    const result = await userService.savePoll(userId, pollId)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /users/me/saved/:pollId - Unsave poll
  // ─────────────────────────────────────────────────────────────────────────────

  async unsavePoll(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const pollId = c.req.param('pollId')

    const result = await userService.unsavePoll(userId, pollId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/me/badges - Get current user's badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getMyBadges(c: Context<AppEnv>) {
    const userId = c.get('userId')!

    const result = await userService.getUserBadges(userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/:username/polls - Get user's public polls
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserPolls(c: Context<AppEnv>) {
    const username = c.req.param('username')
    const { page, limit } = this.getPaginationParams(c)

    const result = await userService.getPublicUserPolls(username, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/:username/badges - Get user's badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserBadges(c: Context<AppEnv>) {
    const username = c.req.param('username')

    const result = await userService.getPublicUserBadges(username)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/me/votes - Get user's vote history
  // ─────────────────────────────────────────────────────────────────────────────

  async getMyVotes(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const { page, limit } = this.getPaginationParams(c)

    const result = await userService.getVoteHistory(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/me/activity - Get user's activity feed
  // ─────────────────────────────────────────────────────────────────────────────

  async getMyActivity(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const { page, limit } = this.getPaginationParams(c)

    const result = await userService.getActivityFeed(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/me/demographics - Get user's demographics
  // ─────────────────────────────────────────────────────────────────────────────

  async getDemographics(c: Context<AppEnv>) {
    const userId = c.get('userId')!

    const result = await userService.getDemographics(userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /users/me/demographics - Update user's demographics
  // ─────────────────────────────────────────────────────────────────────────────

  async updateDemographics(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const body = await c.req.json()

    const result = await userService.updateDemographics(userId, body)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /users/me/badges/:id - Update badge visibility
  // ─────────────────────────────────────────────────────────────────────────────

  async updateBadge(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const badgeId = c.req.param('id')
    const body = await c.req.json<{ visible?: boolean; displayOrder?: number }>()

    const result = await userService.updateBadgeVisibility(userId, badgeId, body)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GDPR: Export User Data (Bible: 05-TECH)
  // ─────────────────────────────────────────────────────────────────────────────

  async exportData(c: Context<AppEnv>) {
    const userId = c.get('userId')!

    const result = await userService.exportUserData(userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GDPR: Request Account Deletion (Bible: 05-TECH - 30 day grace period)
  // ─────────────────────────────────────────────────────────────────────────────

  async requestDeletion(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const body = await c.req.json<{ password: string }>()

    const result = await userService.requestAccountDeletion(userId, body.password)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GDPR: Cancel Account Deletion
  // ─────────────────────────────────────────────────────────────────────────────

  async cancelDeletion(c: Context<AppEnv>) {
    const userId = c.get('userId')!

    const result = await userService.cancelAccountDeletion(userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /users/me/notification-preferences - Get notification preferences
  // ─────────────────────────────────────────────────────────────────────────────

  async getNotificationPreferences(c: Context<AppEnv>) {
    const userId = c.get('userId')!

    const preferences = await notificationService.getPreferences(userId)

    return c.json({
      success: true,
      data: preferences,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /users/me/notification-preferences - Update notification preferences
  // ─────────────────────────────────────────────────────────────────────────────

  async updateNotificationPreferences(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const body = await c.req.json()

    const preferences = await notificationService.updatePreferences(userId, body)

    return c.json({
      success: true,
      data: preferences,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private getPaginationParams(c: Context) {
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )
    return { page, limit }
  }
}

// Export singleton
export const userController = new UserControllerClass()

// Export class for testing
export { UserControllerClass as UserController }
