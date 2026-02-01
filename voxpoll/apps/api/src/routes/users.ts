// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - USER ROUTES
// Route definitions with controller delegation
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth, optionalAuth } from '../middleware/auth'
import { userController } from '../controllers/user.controller'
import {
  updateProfileSchema,
  updateSettingsSchema,
  searchUsersSchema,
  paginationSchema,
  trackVisitSchema,
} from '../validators/user.validators'
import type { AppEnv } from '../types'

export const userRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Static Routes (must be before :username to avoid conflict)
// ─────────────────────────────────────────────────────────────────────────────

// GET /users/search - Search users
userRoutes.get(
  '/search',
  zValidator('query', searchUsersSchema),
  (c) => userController.searchUsers(c)
)

// GET /users/check-username/:username - Check username availability
userRoutes.get(
  '/check-username/:username',
  (c) => userController.checkUsername(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Current User Routes (/users/me/*) - Must be before /:username
// ─────────────────────────────────────────────────────────────────────────────

// PATCH /users/me - Update current user profile
userRoutes.patch(
  '/me',
  auth,
  zValidator('json', updateProfileSchema),
  (c) => userController.updateProfile(c)
)

// GET /users/me/settings - Get user settings
userRoutes.get(
  '/me/settings',
  auth,
  (c) => userController.getSettings(c)
)

// PATCH /users/me/settings - Update user settings
userRoutes.patch(
  '/me/settings',
  auth,
  zValidator('json', updateSettingsSchema),
  (c) => userController.updateSettings(c)
)

// GET /users/me/blocked - Get blocked users list
userRoutes.get(
  '/me/blocked',
  auth,
  zValidator('query', paginationSchema),
  (c) => userController.getBlockedUsers(c)
)

// GET /users/me/polls - Get current user's polls
userRoutes.get(
  '/me/polls',
  auth,
  zValidator('query', paginationSchema),
  (c) => userController.getMyPolls(c)
)

// GET /users/me/saved - Get saved polls
userRoutes.get(
  '/me/saved',
  auth,
  zValidator('query', paginationSchema),
  (c) => userController.getSavedPolls(c)
)

// POST /users/me/saved/:pollId - Save poll
userRoutes.post(
  '/me/saved/:pollId',
  auth,
  (c) => userController.savePoll(c)
)

// DELETE /users/me/saved/:pollId - Unsave poll
userRoutes.delete(
  '/me/saved/:pollId',
  auth,
  (c) => userController.unsavePoll(c)
)

// GET /users/me/badges - Get current user's badges
userRoutes.get(
  '/me/badges',
  auth,
  (c) => userController.getMyBadges(c)
)

// PATCH /users/me/badges/:id - Update badge visibility
userRoutes.patch(
  '/me/badges/:id',
  auth,
  (c) => userController.updateBadge(c)
)

// GET /users/me/votes - Get vote history
userRoutes.get(
  '/me/votes',
  auth,
  zValidator('query', paginationSchema),
  (c) => userController.getMyVotes(c)
)

// GET /users/me/activity - Get activity feed
userRoutes.get(
  '/me/activity',
  auth,
  zValidator('query', paginationSchema),
  (c) => userController.getMyActivity(c)
)

// GET /users/me/demographics - Get demographics
userRoutes.get(
  '/me/demographics',
  auth,
  (c) => userController.getDemographics(c)
)

// PATCH /users/me/demographics - Update demographics
userRoutes.patch(
  '/me/demographics',
  auth,
  (c) => userController.updateDemographics(c)
)

// GET /users/me/notification-preferences - Get notification preferences
userRoutes.get(
  '/me/notification-preferences',
  auth,
  (c) => userController.getNotificationPreferences(c)
)

// PATCH /users/me/notification-preferences - Update notification preferences
userRoutes.patch(
  '/me/notification-preferences',
  auth,
  (c) => userController.updateNotificationPreferences(c)
)

// GET /users/me/visitors - Get my profile visitors (Plus/Premium only)
userRoutes.get(
  '/me/visitors',
  auth,
  zValidator('query', paginationSchema),
  (c) => userController.getMyVisitors(c)
)

// GET /users/me/visitors/count - Get visitor count (Plus/Premium only)
userRoutes.get(
  '/me/visitors/count',
  auth,
  (c) => userController.getVisitorCount(c)
)

// GET /users/me/profile-visit-features - Get profile visit tier features
userRoutes.get(
  '/me/profile-visit-features',
  auth,
  (c) => userController.getProfileVisitFeatures(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// GDPR Compliance Routes (Bible: 05-TECH)
// ─────────────────────────────────────────────────────────────────────────────

// GET /users/me/data-export - Export all user data
userRoutes.get(
  '/me/data-export',
  auth,
  (c) => userController.exportData(c)
)

// DELETE /users/me - Request account deletion (30 day grace period)
userRoutes.delete(
  '/me',
  auth,
  (c) => userController.requestDeletion(c)
)

// POST /users/me/cancel-deletion - Cancel account deletion
userRoutes.post(
  '/me/cancel-deletion',
  auth,
  (c) => userController.cancelDeletion(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// User Profile Routes (/users/:username/*)
// ─────────────────────────────────────────────────────────────────────────────

// GET /users/:username - Get user profile
userRoutes.get(
  '/:username',
  optionalAuth,
  (c) => userController.getProfile(c)
)

// GET /users/:username/followers - Get followers list
userRoutes.get(
  '/:username/followers',
  zValidator('query', paginationSchema),
  (c) => userController.getFollowers(c)
)

// GET /users/:username/following - Get following list
userRoutes.get(
  '/:username/following',
  zValidator('query', paginationSchema),
  (c) => userController.getFollowing(c)
)

// POST /users/:username/follow - Follow user
userRoutes.post(
  '/:username/follow',
  auth,
  (c) => userController.followUser(c)
)

// DELETE /users/:username/follow - Unfollow user
userRoutes.delete(
  '/:username/follow',
  auth,
  (c) => userController.unfollowUser(c)
)

// POST /users/:username/block - Block user
userRoutes.post(
  '/:username/block',
  auth,
  (c) => userController.blockUser(c)
)

// DELETE /users/:username/block - Unblock user
userRoutes.delete(
  '/:username/block',
  auth,
  (c) => userController.unblockUser(c)
)

// GET /users/:username/polls - Get user's public polls
userRoutes.get(
  '/:username/polls',
  optionalAuth,
  zValidator('query', paginationSchema),
  (c) => userController.getUserPolls(c)
)

// GET /users/:username/badges - Get user's badges
userRoutes.get(
  '/:username/badges',
  (c) => userController.getUserBadges(c)
)

// POST /users/:username/visit - Track profile visit (Bible: 03-FEATURES/08-social.md)
userRoutes.post(
  '/:username/visit',
  optionalAuth,
  zValidator('query', trackVisitSchema),
  (c) => userController.trackProfileVisit(c)
)
