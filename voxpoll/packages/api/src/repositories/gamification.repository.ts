// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - GAMIFICATION REPOSITORY
// Data access layer for gamification operations
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  desc,
  asc,
  sql,
  userGamification,
  badges,
  userBadges,
  xpTransactions,
  users,
  type BadgeCategory,
  type XpTransactionType,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import type { PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type UserGamification = InferSelectModel<typeof userGamification>
export type Badge = InferSelectModel<typeof badges>
export type UserBadge = InferSelectModel<typeof userBadges>
export type XpTransaction = InferSelectModel<typeof xpTransactions>

// ─────────────────────────────────────────────────────────────────────────────
// Gamification Repository Class
// ─────────────────────────────────────────────────────────────────────────────

class GamificationRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Gamification Profile
  // ─────────────────────────────────────────────────────────────────────────────

  async getProfile(userId: string) {
    const result = await db
      .select()
      .from(userGamification)
      .where(eq(userGamification.userId, userId))
      .limit(1)

    if (!result[0]) return null

    const earnedBadges = await db
      .select({
        userBadge: userBadges,
        badge: badges,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.gamificationId, result[0].id))
      .orderBy(desc(userBadges.earnedAt))

    return {
      ...result[0],
      earnedBadges: earnedBadges.map((eb) => ({
        ...eb.userBadge,
        badge: eb.badge,
      })),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create User Gamification Profile
  // ─────────────────────────────────────────────────────────────────────────────

  async createProfile(userId: string) {
    const [result] = await db
      .insert(userGamification)
      .values({ userId })
      .returning()

    if (!result) throw new Error('Failed to create gamification profile')
    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get or Create Profile
  // ─────────────────────────────────────────────────────────────────────────────

  async getOrCreateProfile(userId: string) {
    const existing = await this.getProfile(userId)
    if (existing) return existing
    return this.createProfile(userId)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Add XP
  // ─────────────────────────────────────────────────────────────────────────────

  async addXP(
    gamificationId: string,
    amount: number,
    type: string,
    source: string,
    sourceId?: string,
    description?: string
  ) {
    // Get current profile
    const profileResult = await db
      .select()
      .from(userGamification)
      .where(eq(userGamification.id, gamificationId))
      .limit(1)

    const profile = profileResult[0]
    if (!profile) return null

    const newCurrentXp = profile.currentXp + amount
    const newTotalXp = profile.totalXp + amount

    // Calculate new level (simple formula: 1000 XP per level)
    const xpPerLevel = 1000
    const newLevel = Math.floor(newTotalXp / xpPerLevel) + 1

    // Update profile
    const [updated] = await db
      .update(userGamification)
      .set({
        currentXp: newCurrentXp,
        totalXp: newTotalXp,
        level: newLevel,
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userGamification.id, gamificationId))
      .returning()

    // Create XP transaction
    await db
      .insert(xpTransactions)
      .values({
        gamificationId,
        amount,
        type: type as XpTransactionType,
        source,
        sourceId,
        description,
        balanceAfter: newCurrentXp,
      })

    return {
      ...updated,
      leveledUp: newLevel > profile.level,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get All Badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getAllBadges(category?: string) {
    const conditions = [
      eq(badges.isActive, true),
      eq(badges.isSecret, false),
    ]

    if (category) {
      conditions.push(eq(badges.category, category as BadgeCategory))
    }

    return db
      .select()
      .from(badges)
      .where(and(...conditions))
      .orderBy(asc(badges.category), asc(badges.orderIndex))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Earned Badges
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserBadges(userId: string) {
    const profileResult = await db
      .select()
      .from(userGamification)
      .where(eq(userGamification.userId, userId))
      .limit(1)

    if (!profileResult[0]) return []

    const earnedBadges = await db
      .select({
        userBadge: userBadges,
        badge: badges,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.gamificationId, profileResult[0].id))
      .orderBy(desc(userBadges.earnedAt))

    return earnedBadges.map((eb) => ({
      ...eb.userBadge,
      badge: eb.badge,
    }))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Award Badge
  // ─────────────────────────────────────────────────────────────────────────────

  async awardBadge(userId: string, badgeId: string) {
    const profile = await this.getOrCreateProfile(userId)
    if (!profile) return null

    const existingResult = await db
      .select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badgeId)
        )
      )
      .limit(1)

    if (existingResult[0]) return null

    const badgeResult = await db
      .select()
      .from(badges)
      .where(eq(badges.id, badgeId))
      .limit(1)

    const badge = badgeResult[0]
    if (!badge) return null

    // Award badge
    const [userBadge] = await db
      .insert(userBadges)
      .values({
        userId,
        badgeId,
        gamificationId: profile.id,
      })
      .returning()

    // Add XP reward
    if (badge.xpReward > 0) {
      await this.addXP(
        profile.id,
        badge.xpReward,
        'BONUS',
        'badge',
        badgeId,
        `Badge earned: ${badge.name}`
      )
    }

    return {
      ...userBadge,
      badge,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Leaderboard
  // ─────────────────────────────────────────────────────────────────────────────

  async getLeaderboard(page: number, limit: number, period?: 'daily' | 'weekly' | 'monthly' | 'allTime') {
    const skip = (page - 1) * limit

    // For allTime, just use totalXp
    // For period-based, would need to aggregate from XPTransaction
    const items = await db
      .select({
        gamification: userGamification,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(userGamification)
      .innerJoin(users, eq(userGamification.userId, users.id))
      .orderBy(desc(userGamification.totalXp))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userGamification)

    const total = totalResult?.count ?? 0

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }

    return {
      items: items.map((item, index) => ({
        rank: skip + index + 1,
        user: item.user,
        level: item.gamification.level,
        totalXp: item.gamification.totalXp,
        currentStreak: item.gamification.currentStreak,
      })),
      meta,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get XP History
  // ─────────────────────────────────────────────────────────────────────────────

  async getXPHistory(userId: string, page: number, limit: number) {
    const profileResult = await db
      .select()
      .from(userGamification)
      .where(eq(userGamification.userId, userId))
      .limit(1)

    if (!profileResult[0]) {
      return { items: [], meta: { page, limit, total: 0, totalPages: 0, hasMore: false } }
    }

    const skip = (page - 1) * limit

    const items = await db
      .select()
      .from(xpTransactions)
      .where(eq(xpTransactions.gamificationId, profileResult[0].id))
      .orderBy(desc(xpTransactions.createdAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(xpTransactions)
      .where(eq(xpTransactions.gamificationId, profileResult[0].id))

    const total = totalResult?.count ?? 0

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }

    return { items, meta }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Streak
  // ─────────────────────────────────────────────────────────────────────────────

  async updateStreak(userId: string) {
    const profile = await this.getOrCreateProfile(userId)
    if (!profile) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastActivity = profile.lastActivityDate
    let newStreak = 1

    if (lastActivity) {
      const lastDate = new Date(lastActivity)
      lastDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        // Same day, no change
        return profile
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak = profile.currentStreak + 1
      }
      // else reset to 1 (diffDays > 1)
    }

    const [result] = await db
      .update(userGamification)
      .set({
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, profile.longestStreak),
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userGamification.id, profile.id))
      .returning()

    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Increment Stats
  // ─────────────────────────────────────────────────────────────────────────────

  async incrementStat(userId: string, stat: 'pollsCreated' | 'pollsParticipated' | 'surveysCompleted' | 'testsCompleted' | 'commentsWritten') {
    const profile = await this.getOrCreateProfile(userId)
    if (!profile) return null

    const [result] = await db
      .update(userGamification)
      .set({
        [stat]: sql`${userGamification[stat]} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userGamification.id, profile.id))
      .returning()

    return result
  }
}

// Export singleton
export const gamificationRepository = new GamificationRepositoryClass()

// Export class for testing
export { GamificationRepositoryClass as GamificationRepository }
