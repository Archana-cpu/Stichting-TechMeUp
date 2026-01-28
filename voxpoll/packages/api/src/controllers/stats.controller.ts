// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - STATS CONTROLLER
// HTTP request/response handling for platform statistics
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { db, eq, and, sql, desc, isNull, gte, inArray } from '@voxpoll/database'
import { users, polls, pollResponses, categories, follows, comments, reports, auditLogs } from '@voxpoll/database'
import type { AppEnv } from '../types'
import { ApiError } from '../middleware/error-handler'
import { algorithmService } from '../services/algorithm.service'

// ─────────────────────────────────────────────────────────────────────────────
// Stats Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class StatsControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /stats/platform - Platform-wide statistics
  // ─────────────────────────────────────────────────────────────────────────────

  async getPlatformStats(c: Context<AppEnv>) {
    const [totalUsersResult, totalPollsResult, totalVotesResult, activePollsResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.status, 'ACTIVE')),
      db.select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(isNull(polls.deletedAt)),
      db.select({ count: sql<number>`count(*)::int` })
        .from(pollResponses),
      db.select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(and(eq(polls.status, 'ACTIVE'), isNull(polls.deletedAt))),
    ])

    return c.json({
      success: true,
      data: {
        totalUsers: totalUsersResult[0]?.count ?? 0,
        totalPolls: totalPollsResult[0]?.count ?? 0,
        totalVotes: totalVotesResult[0]?.count ?? 0,
        activePolls: activePollsResult[0]?.count ?? 0,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /stats/trending - Trending topics/tags
  // ─────────────────────────────────────────────────────────────────────────────

  async getTrending(c: Context<AppEnv>) {
    // Get top polls by hot score
    const trendingPolls = await db.select({
      id: polls.id,
      title: polls.title,
      slug: polls.slug,
      participantCount: polls.participantCount,
      hotScore: polls.hotScore,
      categoryId: polls.categoryId,
    })
    .from(polls)
    .where(and(
      eq(polls.status, 'ACTIVE'),
      eq(polls.visibility, 'PUBLIC'),
      isNull(polls.deletedAt)
    ))
    .orderBy(desc(polls.hotScore))
    .limit(10)

    // Get category info for polls
    const categoryIds = [...new Set(trendingPolls.map(p => p.categoryId).filter(Boolean))] as string[]
    const categoriesResult = categoryIds.length > 0
      ? await db.select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .where(sql`${categories.id} = ANY(${categoryIds})`)
      : []

    const categoryMap = new Map(categoriesResult.map(c => [c.id, c]))

    const pollsWithCategories = trendingPolls.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      participantCount: p.participantCount,
      hotScore: p.hotScore,
      category: p.categoryId ? categoryMap.get(p.categoryId) ?? null : null,
    }))

    // Get trending categories - categories with most polls, ordered by poll count
    // Since Drizzle doesn't support ordering by a relation count directly, we use a subquery
    const trendingCategoriesResult = await db.select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      iconName: categories.iconName,
    })
    .from(categories)
    .where(and(
      eq(categories.isActive, true),
      isNull(categories.parentId)
    ))
    .limit(5)

    // Get poll counts for these categories
    const trendingCategoryIds = trendingCategoriesResult.map(c => c.id)
    const categoriesPollCounts = trendingCategoryIds.length > 0
      ? await db.select({
          categoryId: polls.categoryId,
          count: sql<number>`count(*)::int`,
        })
        .from(polls)
        .where(sql`${polls.categoryId} = ANY(${trendingCategoryIds})`)
        .groupBy(polls.categoryId)
      : []

    const pollCountMap = new Map(categoriesPollCounts.map(pc => [pc.categoryId, pc.count]))

    // Sort categories by poll count
    const trendingCategories = trendingCategoriesResult
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        iconName: cat.iconName,
        pollCount: pollCountMap.get(cat.id) ?? 0,
      }))
      .sort((a, b) => b.pollCount - a.pollCount)

    return c.json({
      success: true,
      data: {
        polls: pollsWithCategories,
        categories: trendingCategories,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /stats/me - Current user's statistics
  // ─────────────────────────────────────────────────────────────────────────────

  async getMyStats(c: Context<AppEnv>) {
    const user = c.get('user')!

    // Get user's poll IDs first for participation count
    const userPollIds = await db.select({ id: polls.id })
      .from(polls)
      .where(eq(polls.creatorId, user.id))

    const pollIds = userPollIds.map(p => p.id)

    const [pollsCreatedResult, totalParticipationsResult, followersCountResult, followingCountResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(and(eq(polls.creatorId, user.id), isNull(polls.deletedAt))),
      pollIds.length > 0
        ? db.select({ count: sql<number>`count(*)::int` })
            .from(pollResponses)
            .where(sql`${pollResponses.pollId} = ANY(${pollIds})`)
        : Promise.resolve([{ count: 0 }]),
      db.select({ count: sql<number>`count(*)::int` })
        .from(follows)
        .where(and(eq(follows.followingId, user.id), eq(follows.status, 'ACTIVE'))),
      db.select({ count: sql<number>`count(*)::int` })
        .from(follows)
        .where(and(eq(follows.followerId, user.id), eq(follows.status, 'ACTIVE'))),
    ])

    return c.json({
      success: true,
      data: {
        pollsCreated: pollsCreatedResult[0]?.count ?? 0,
        totalParticipations: totalParticipationsResult[0]?.count ?? 0,
        followersCount: followersCountResult[0]?.count ?? 0,
        followingCount: followingCountResult[0]?.count ?? 0,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /stats/me/activity - User's activity summary
  // ─────────────────────────────────────────────────────────────────────────────

  async getMyActivity(c: Context<AppEnv>) {
    const user = c.get('user')!

    // Get recent polls created
    const recentPolls = await db.select({
      id: polls.id,
      title: polls.title,
      slug: polls.slug,
      status: polls.status,
      participantCount: polls.participantCount,
      createdAt: polls.createdAt,
    })
    .from(polls)
    .where(and(eq(polls.creatorId, user.id), isNull(polls.deletedAt)))
    .orderBy(desc(polls.createdAt))
    .limit(5)

    return c.json({
      success: true,
      data: {
        recentPolls,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /stats/admin/overview - Admin dashboard statistics
  // ─────────────────────────────────────────────────────────────────────────────

  async getAdminOverview(c: Context<AppEnv>) {
    const user = c.get('user')!

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Admin access required', 'ADMIN_REQUIRED')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalUsersResult,
      newUsersTodayResult,
      totalPollsResult,
      newPollsTodayResult,
      totalResponsesResult,
      activeUsersResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(gte(users.createdAt, today)),
      db.select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(isNull(polls.deletedAt)),
      db.select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(and(gte(polls.createdAt, today), isNull(polls.deletedAt))),
      db.select({ count: sql<number>`count(*)::int` }).from(pollResponses),
      db.select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.status, 'ACTIVE')),
    ])

    return c.json({
      success: true,
      data: {
        totalUsers: totalUsersResult[0]?.count ?? 0,
        newUsersToday: newUsersTodayResult[0]?.count ?? 0,
        totalPolls: totalPollsResult[0]?.count ?? 0,
        newPollsToday: newPollsTodayResult[0]?.count ?? 0,
        totalResponses: totalResponsesResult[0]?.count ?? 0,
        activeUsers: activeUsersResult[0]?.count ?? 0,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /stats/admin/users - User statistics for admin
  // ─────────────────────────────────────────────────────────────────────────────

  async getAdminUserStats(c: Context<AppEnv>) {
    const user = c.get('user')!

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Admin access required', 'ADMIN_REQUIRED')
    }

    // Group users by status using raw SQL
    const usersByStatus = await db.select({
      status: users.status,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .groupBy(users.status)

    // Group users by verification level
    const usersByVerification = await db.select({
      verificationLevel: users.verificationLevel,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .groupBy(users.verificationLevel)

    return c.json({
      success: true,
      data: {
        byStatus: usersByStatus.map((s) => ({
          status: s.status,
          count: s.count,
        })),
        byVerification: usersByVerification.map((v) => ({
          level: v.verificationLevel,
          count: v.count,
        })),
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /stats/admin/content - Content statistics for admin
  // ─────────────────────────────────────────────────────────────────────────────

  async getAdminContentStats(c: Context<AppEnv>) {
    const user = c.get('user')!

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Admin access required', 'ADMIN_REQUIRED')
    }

    // Group polls by status
    const pollsByStatus = await db.select({
      status: polls.status,
      count: sql<number>`count(*)::int`,
    })
    .from(polls)
    .where(isNull(polls.deletedAt))
    .groupBy(polls.status)

    // Group polls by type
    const pollsByType = await db.select({
      type: polls.type,
      count: sql<number>`count(*)::int`,
    })
    .from(polls)
    .where(isNull(polls.deletedAt))
    .groupBy(polls.type)

    return c.json({
      success: true,
      data: {
        pollsByStatus: pollsByStatus.map((s) => ({
          status: s.status,
          count: s.count,
        })),
        pollsByType: pollsByType.map((t) => ({
          type: t.type,
          count: t.count,
        })),
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /stats/polls/:id - Detailed poll statistics (using algorithms)
  // ─────────────────────────────────────────────────────────────────────────────

  async getPollStatistics(c: Context<AppEnv>) {
    const pollId = c.req.param('id')

    // Get poll with options
    const pollResult = await db.select()
      .from(polls)
      .where(and(eq(polls.id, pollId), isNull(polls.deletedAt)))
      .limit(1)

    const poll = pollResult[0]

    if (!poll) {
      throw ApiError.notFound('Poll not found')
    }

    // Check if user has access (public poll or owner)
    const user = c.get('user')
    if (poll.visibility !== 'PUBLIC') {
      if (!user || poll.creatorId !== user.id) {
        throw ApiError.forbidden('You do not have access to this poll')
      }
    }

    // Get response count
    const responseCountResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(pollResponses)
      .where(eq(pollResponses.pollId, pollId))

    // Get responses for time series
    const responses = await db.select({
      createdAt: pollResponses.createdAt,
      answers: pollResponses.answers,
    })
    .from(pollResponses)
    .where(eq(pollResponses.pollId, pollId))
    .orderBy(pollResponses.createdAt)

    // Get options from poll
    const options = (poll.options as unknown as Array<{ id: string; text: string; imageUrl?: string; voteCount: number }>)

    // Calculate statistics using algorithm service
    const stats = await algorithmService.getPollStatistics(pollId)

    // Build time series (group by hour)
    const timeSeries = this.buildTimeSeries(responses.map(r => ({
      createdAt: r.createdAt,
      selectedOptions: r.answers,
    })))

    // Calculate option percentages
    const totalVotes = stats.totalVotes
    const optionStats = options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      imageUrl: opt.imageUrl,
      voteCount: opt.voteCount,
      percentage: totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 10000) / 100 : 0,
    }))

    return c.json({
      success: true,
      data: {
        pollId: poll.id,
        title: poll.title,
        type: poll.type,
        totalResponses: responseCountResult[0]?.count ?? 0,
        uniqueParticipants: poll.participantCount,
        statistics: {
          totalVotes: stats.totalVotes,
          mean: stats.mean,
          median: stats.median,
          mode: stats.mode,
          standardDeviation: stats.standardDeviation,
          variance: stats.variance,
          marginOfError: stats.marginOfError,
          percentiles: {
            p25: stats.percentiles?.p25 ?? null,
            p50: stats.percentiles?.p50 ?? null,
            p75: stats.percentiles?.p75 ?? null,
            p90: stats.percentiles?.p90 ?? null,
          },
        },
        options: optionStats,
        timeSeries,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /stats/me/trust-score - User's trust score breakdown
  // ─────────────────────────────────────────────────────────────────────────────

  async getMyTrustScore(c: Context<AppEnv>) {
    const user = c.get('user')!

    const [
      pollsCreatedResult,
      pollsParticipatedResult,
      commentsCountResult,
      reportsAgainstResult,
      reportsSubmittedResult,
      accurateReportsResult,
      warningsCountResult,
      bansCountResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(polls)
        .where(and(eq(polls.creatorId, user.id), isNull(polls.deletedAt))),
      db.select({ count: sql<number>`count(*)::int` })
        .from(pollResponses)
        .where(sql`${pollResponses.participantHash} = ${user.id}`),
      db.select({ count: sql<number>`count(*)::int` })
        .from(comments)
        .where(and(eq(comments.authorId, user.id), isNull(comments.deletedAt))),
      db.select({ count: sql<number>`count(*)::int` })
        .from(reports)
        .where(eq(reports.reportedUserId, user.id)),
      db.select({ count: sql<number>`count(*)::int` })
        .from(reports)
        .where(eq(reports.reporterId, user.id)),
      db.select({ count: sql<number>`count(*)::int` })
        .from(reports)
        .where(and(
          eq(reports.reporterId, user.id),
          eq(reports.status, 'RESOLVED')
        )),
      // Count warnings from audit logs
      db.select({ count: sql<number>`count(*)::int` })
        .from(auditLogs)
        .where(and(
          eq(auditLogs.entityId, user.id),
          eq(auditLogs.action, 'WARNING')
        )),
      // Count bans from audit logs
      db.select({ count: sql<number>`count(*)::int` })
        .from(auditLogs)
        .where(and(
          eq(auditLogs.entityId, user.id),
          inArray(auditLogs.action, ['TEMP_BAN', 'PERMANENT_BAN'])
        )),
    ])

    // Calculate account age in days
    const accountAge = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Calculate trust score using algorithm service
    const trustScore = await algorithmService.calculateUserTrustScore(user.id)

    return c.json({
      success: true,
      data: {
        score: trustScore.score,
        level: trustScore.level,
        factors: trustScore.factors,
        breakdown: {
          accountAge,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          pollsCreated: pollsCreatedResult[0]?.count ?? 0,
          pollsParticipated: pollsParticipatedResult[0]?.count ?? 0,
          commentsCount: commentsCountResult[0]?.count ?? 0,
          reportsAgainst: reportsAgainstResult[0]?.count ?? 0,
          reportsSubmitted: reportsSubmittedResult[0]?.count ?? 0,
          accurateReports: accurateReportsResult[0]?.count ?? 0,
          warningsReceived: warningsCountResult[0]?.count ?? 0,
          bansReceived: bansCountResult[0]?.count ?? 0,
        },
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /stats/leaderboard - Top users leaderboard
  // ─────────────────────────────────────────────────────────────────────────────

  async getLeaderboard(c: Context<AppEnv>) {
    const period = c.req.query('period') || 'week' // week, month, all
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 100)

    let startDate: Date | undefined
    if (period === 'week') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === 'month') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    // Top poll creators
    const topCreators = await db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      trustScoreValue: users.trustScoreValue,
      verificationLevel: users.verificationLevel,
    })
    .from(users)
    .where(eq(users.status, 'ACTIVE'))
    .orderBy(desc(users.trustScoreValue))
    .limit(limit)

    // Get poll counts and follower counts for these users
    const userIds = topCreators.map(u => u.id)

    const pollCountsResult = userIds.length > 0
      ? await db.select({
          creatorId: polls.creatorId,
          count: sql<number>`count(*)::int`,
        })
        .from(polls)
        .where(and(
          sql`${polls.creatorId} = ANY(${userIds})`,
          startDate ? gte(polls.createdAt, startDate) : sql`true`
        ))
        .groupBy(polls.creatorId)
      : []

    const followerCountsResult = userIds.length > 0
      ? await db.select({
          followingId: follows.followingId,
          count: sql<number>`count(*)::int`,
        })
        .from(follows)
        .where(and(
          sql`${follows.followingId} = ANY(${userIds})`,
          eq(follows.status, 'ACTIVE')
        ))
        .groupBy(follows.followingId)
      : []

    const pollCountMap = new Map(pollCountsResult.map(p => [p.creatorId, p.count]))
    const followerCountMap = new Map(followerCountsResult.map(f => [f.followingId, f.count]))

    return c.json({
      success: true,
      data: {
        period,
        leaderboard: topCreators.map((user, index) => ({
          rank: index + 1,
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          trustScore: user.trustScoreValue,
          verificationLevel: user.verificationLevel,
          pollsCreated: pollCountMap.get(user.id) ?? 0,
          followersCount: followerCountMap.get(user.id) ?? 0,
        })),
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Build time series from responses
  // ─────────────────────────────────────────────────────────────────────────────

  private buildTimeSeries(responses: Array<{ createdAt: Date; selectedOptions: unknown }>) {
    if (responses.length === 0) return []

    const hourlyData = new Map<string, number>()

    for (const response of responses) {
      const hour = new Date(response.createdAt)
      hour.setMinutes(0, 0, 0)
      const key = hour.toISOString()
      hourlyData.set(key, (hourlyData.get(key) || 0) + 1)
    }

    return Array.from(hourlyData.entries())
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }
}

// Export singleton
export const statsController = new StatsControllerClass()

// Export class for testing
export { StatsControllerClass as StatsController }
