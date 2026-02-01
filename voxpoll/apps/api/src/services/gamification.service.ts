// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - GAMIFICATION SERVICE
// Business logic for gamification operations
// ══════════════════════════════════════════════════════════════════════════════

import { gamificationRepository } from '../repositories/gamification.repository'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime'

interface BadgeCriteria {
  type: 'stat' | 'streak' | 'level' | 'custom'
  field?: string
  threshold?: number
  customCheck?: string
}

interface AwardedBadge {
  id: string
  code: string
  name: string
  description: string
  iconUrl: string
  category: string
  rarity: string
  xpReward: number
  earnedAt: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// XP Values
// ─────────────────────────────────────────────────────────────────────────────

export const XP_VALUES = {
  pollCreated: 50,
  pollVoted: 10,
  surveyCompleted: 30,
  testCompleted: 40,
  commentWritten: 5,
  commentUpvoted: 2,
  dailyLogin: 10,
  streakBonus: 5,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Achievement Milestones (XP-based)
// ─────────────────────────────────────────────────────────────────────────────

export const XP_MILESTONES = {
  BRONZE: { threshold: 1000, badgeCode: 'ACHIEVEMENT_BRONZE' },
  SILVER: { threshold: 10000, badgeCode: 'ACHIEVEMENT_SILVER' },
  GOLD: { threshold: 50000, badgeCode: 'ACHIEVEMENT_GOLD' },
  PLATINUM: { threshold: 100000, badgeCode: 'ACHIEVEMENT_PLATINUM' },
  DIAMOND: { threshold: 500000, badgeCode: 'ACHIEVEMENT_DIAMOND' },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Gamification Service Class
// ─────────────────────────────────────────────────────────────────────────────

class GamificationServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Profile
  // ─────────────────────────────────────────────────────────────────────────────

  async getProfile(userId: string) {
    // Ensure profile exists first
    await gamificationRepository.getOrCreateProfile(userId)
    // Then get full profile with badges
    const profile = await gamificationRepository.getProfile(userId)
    if (!profile) {
      throw new Error('Failed to get gamification profile')
    }

    // Calculate XP needed for next level
    const xpPerLevel = 1000
    const xpForCurrentLevel = (profile.level - 1) * xpPerLevel
    const xpForNextLevel = profile.level * xpPerLevel
    const xpProgress = profile.totalXp - xpForCurrentLevel
    const xpNeeded = xpForNextLevel - profile.totalXp

    return {
      level: profile.level,
      currentXp: profile.currentXp,
      totalXp: profile.totalXp,
      xpProgress,
      xpNeeded,
      xpProgressPercent: Math.round((xpProgress / xpPerLevel) * 100),
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      stats: {
        pollsCreated: profile.pollsCreated,
        pollsParticipated: profile.pollsParticipated,
        surveysCompleted: profile.surveysCompleted,
        testsCompleted: profile.testsCompleted,
        commentsWritten: profile.commentsWritten,
        upvotesReceived: profile.upvotesReceived,
      },
      rank: profile.rank,
      badgeCount: profile.earnedBadges?.length || 0,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get All Badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getAllBadges(category?: string) {
    const badges = await gamificationRepository.getAllBadges(category)

    return badges.map((badge) => ({
      id: badge.id,
      code: badge.code,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      category: badge.category,
      rarity: badge.rarity,
      xpReward: badge.xpReward,
    }))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Earned Badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserBadges(userId: string) {
    const badges = await gamificationRepository.getUserBadges(userId)

    return badges.map((ub) => ({
      id: ub.id,
      badge: {
        id: ub.badge.id,
        code: ub.badge.code,
        name: ub.badge.name,
        description: ub.badge.description,
        iconUrl: ub.badge.iconUrl,
        category: ub.badge.category,
        rarity: ub.badge.rarity,
      },
      earnedAt: ub.earnedAt,
      isDisplayed: ub.isDisplayed,
    }))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Leaderboard
  // ─────────────────────────────────────────────────────────────────────────────

  async getLeaderboard(
    page: number = 1,
    limit: number = PAGINATION.defaultLimit,
    period: LeaderboardPeriod = 'allTime'
  ) {
    return gamificationRepository.getLeaderboard(page, limit, period)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get XP History
  // ─────────────────────────────────────────────────────────────────────────────

  async getXPHistory(userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const result = await gamificationRepository.getXPHistory(userId, page, limit)

    return {
      items: result.items.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        source: tx.source,
        description: tx.description,
        balanceAfter: tx.balanceAfter,
        createdAt: tx.createdAt,
      })),
      meta: result.meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Award XP for Actions (Internal use)
  // ─────────────────────────────────────────────────────────────────────────────

  async awardXPForAction(
    userId: string,
    action: keyof typeof XP_VALUES,
    sourceId?: string,
    description?: string
  ) {
    const profile = await gamificationRepository.getOrCreateProfile(userId)
    const xpAmount = XP_VALUES[action]

    // Update streak
    await gamificationRepository.updateStreak(userId)

    // Add XP
    const result = await gamificationRepository.addXP(
      profile.id,
      xpAmount,
      'EARNED',
      action,
      sourceId,
      description
    )

    // Increment stat if applicable
    const statMap: Partial<Record<keyof typeof XP_VALUES, 'pollsCreated' | 'pollsParticipated' | 'surveysCompleted' | 'testsCompleted' | 'commentsWritten'>> = {
      pollCreated: 'pollsCreated',
      pollVoted: 'pollsParticipated',
      surveyCompleted: 'surveysCompleted',
      testCompleted: 'testsCompleted',
      commentWritten: 'commentsWritten',
    }

    const stat = statMap[action]
    if (stat) {
      await gamificationRepository.incrementStat(userId, stat)
    }

    // Check and award any new badges earned
    const newBadges = await this.checkAndAwardBadges(userId)

    // Check and award achievement badges based on new total XP
    const achievementBadges = await this.checkAndAwardAchievementBadges(userId, result.balanceAfter)

    return {
      ...result,
      newBadges: [...newBadges, ...achievementBadges],
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Check and Award Badges (Internal use)
  // ─────────────────────────────────────────────────────────────────────────────

  async checkAndAwardBadges(userId: string): Promise<AwardedBadge[]> {
    const profile = await gamificationRepository.getProfile(userId)
    if (!profile) return []

    const earnedBadgeIds = new Set(
      (profile.earnedBadges || []).map((eb: { badgeId: string }) => eb.badgeId)
    )

    const allBadges = await gamificationRepository.getAllBadges()
    const awardedBadges: AwardedBadge[] = []

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue

      const criteria = badge.criteria as BadgeCriteria
      const meetsRequirement = this.checkBadgeCriteria(criteria, profile)

      if (meetsRequirement) {
        const awarded = await gamificationRepository.awardBadge(userId, badge.id)
        if (awarded) {
          awardedBadges.push({
            id: badge.id,
            code: badge.code,
            name: badge.name,
            description: badge.description,
            iconUrl: badge.iconUrl,
            category: badge.category,
            rarity: badge.rarity,
            xpReward: badge.xpReward,
            earnedAt: new Date(),
          })
        }
      }
    }

    return awardedBadges
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Check Badge Criteria (Private)
  // ─────────────────────────────────────────────────────────────────────────────

  private checkBadgeCriteria(
    criteria: BadgeCriteria,
    profile: {
      level: number
      totalXp: number
      pollsCreated: number
      pollsParticipated: number
      surveysCompleted: number
      testsCompleted: number
      commentsWritten: number
      upvotesReceived: number
      currentStreak: number
      longestStreak: number
    }
  ): boolean {
    if (!criteria || !criteria.type) return false

    const threshold = criteria.threshold || 0

    switch (criteria.type) {
      case 'stat': {
        const fieldMap: Record<string, number> = {
          pollsCreated: profile.pollsCreated,
          pollsParticipated: profile.pollsParticipated,
          surveysCompleted: profile.surveysCompleted,
          testsCompleted: profile.testsCompleted,
          commentsWritten: profile.commentsWritten,
          upvotesReceived: profile.upvotesReceived,
          totalXp: profile.totalXp,
        }

        const field = criteria.field || ''
        const value = fieldMap[field] ?? 0
        return value >= threshold
      }

      case 'streak': {
        const streakMap: Record<string, number> = {
          currentStreak: profile.currentStreak,
          longestStreak: profile.longestStreak,
        }

        const field = criteria.field || 'currentStreak'
        const value = streakMap[field] ?? 0
        return value >= threshold
      }

      case 'level': {
        return profile.level >= threshold
      }

      case 'custom': {
        return this.checkCustomCriteria(criteria.customCheck || '', profile)
      }

      default:
        return false
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Check Custom Badge Criteria (Private)
  // ─────────────────────────────────────────────────────────────────────────────

  private checkCustomCriteria(
    checkType: string,
    profile: {
      pollsCreated: number
      pollsParticipated: number
      surveysCompleted: number
      testsCompleted: number
      commentsWritten: number
      currentStreak: number
    }
  ): boolean {
    switch (checkType) {
      case 'first_vote':
        return profile.pollsParticipated >= 1

      case 'first_poll':
        return profile.pollsCreated >= 1

      case 'first_survey':
        return profile.surveysCompleted >= 1

      case 'first_test':
        return profile.testsCompleted >= 1

      case 'first_comment':
        return profile.commentsWritten >= 1

      case 'active_participant':
        return (
          profile.pollsParticipated >= 10 &&
          profile.surveysCompleted >= 5 &&
          profile.testsCompleted >= 3
        )

      case 'prolific_creator':
        return profile.pollsCreated >= 25

      case 'engagement_master':
        return (
          profile.pollsParticipated >= 100 &&
          profile.commentsWritten >= 50
        )

      case 'streak_warrior':
        return profile.currentStreak >= 30

      default:
        return false
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Award Specific Badge (Public)
  // ─────────────────────────────────────────────────────────────────────────────

  async awardBadgeByCode(userId: string, badgeCode: string): Promise<AwardedBadge | null> {
    const allBadges = await gamificationRepository.getAllBadges()
    const badge = allBadges.find((b) => b.code === badgeCode)
    if (!badge) return null

    const awarded = await gamificationRepository.awardBadge(userId, badge.id)
    if (!awarded) return null

    return {
      id: badge.id,
      code: badge.code,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      category: badge.category,
      rarity: badge.rarity,
      xpReward: badge.xpReward,
      earnedAt: new Date(),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Award Verification Badge on Level Change
  // ─────────────────────────────────────────────────────────────────────────────

  async awardVerificationBadge(userId: string, verificationLevel: 0 | 1 | 2 | 3 | 4): Promise<AwardedBadge | null> {
    if (verificationLevel === 0) return null

    const badgeCodeMap: Record<1 | 2 | 3 | 4, string> = {
      1: 'VERIFIED_LEVEL_1',
      2: 'VERIFIED_LEVEL_2',
      3: 'VERIFIED_LEVEL_3',
      4: 'VERIFIED_LEVEL_4',
    }

    const badgeCode = badgeCodeMap[verificationLevel]
    return this.awardBadgeByCode(userId, badgeCode)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Check and Award Achievement Badges (XP Milestones)
  // ─────────────────────────────────────────────────────────────────────────────

  async checkAndAwardAchievementBadges(userId: string, totalXp: number): Promise<AwardedBadge[]> {
    const awardedBadges: AwardedBadge[] = []

    for (const [key, milestone] of Object.entries(XP_MILESTONES)) {
      if (totalXp >= milestone.threshold) {
        const badge = await this.awardBadgeByCode(userId, milestone.badgeCode)
        if (badge) {
          awardedBadges.push(badge)
        }
      }
    }

    return awardedBadges
  }
}

// Export singleton
export const gamificationService = new GamificationServiceClass()

// Export class for testing
export { GamificationServiceClass as GamificationService }
