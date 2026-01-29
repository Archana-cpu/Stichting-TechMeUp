// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ANALYTICS SERVICE
// Business logic for analytics operations
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, sql, desc, isNull, gte, lte } from '@voxpoll/database'
import { polls, pollResponses, surveys, surveyResponses, tests, personalityTestResults, quizAttempts, contentViews, users } from '@voxpoll/database'
import { ApiError } from '../middleware/error-handler'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TimeRange {
  startDate?: Date
  endDate?: Date
}

interface PollAnalytics {
  pollId: string
  title: string
  totalResponses: number
  uniqueVoters: number
  viewCount: number
  shareCount: number
  optionBreakdown: Array<{
    optionId: string
    text: string
    voteCount: number
    percentage: number
  }>
  timeline: Array<{
    date: string
    responses: number
    views: number
  }>
  demographics: {
    deviceBreakdown: Record<string, number>
    qualityScoreDistribution: Record<string, number>
  }
  engagement: {
    avgResponseTime: number
    completionRate: number
    conversionRate: number
  }
}

interface SurveyAnalytics {
  surveyId: string
  title: string
  totalResponses: number
  completedResponses: number
  completionRate: number
  avgCompletionTime: number
  questionStats: Array<{
    questionId: string
    questionText: string
    responseCount: number
    avgScore?: number
    answerDistribution: Record<string, number>
  }>
  timeline: Array<{
    date: string
    started: number
    completed: number
  }>
}

interface TestAnalytics {
  testId: string
  title: string
  totalAttempts: number
  avgScore: number
  passRate: number
  resultDistribution: Record<string, number>
  questionStats: Array<{
    questionId: string
    questionText: string
    correctRate: number
    avgTimeSpent: number
  }>
  timeline: Array<{
    date: string
    attempts: number
    avgScore: number
  }>
}

interface UserAnalytics {
  userId: string
  pollsCreated: number
  surveysCreated: number
  testsCreated: number
  totalResponses: number
  totalViews: number
  avgEngagementRate: number
  topPoll: { id: string; title: string; responses: number } | null
  activityTimeline: Array<{
    date: string
    pollsCreated: number
    responsesReceived: number
  }>
}

interface PlatformStats {
  totalUsers: number
  activeUsers30d: number
  totalPolls: number
  totalSurveys: number
  totalTests: number
  totalResponses: number
  avgResponsesPerPoll: number
  topCategories: Array<{ categoryId: string; name: string; pollCount: number }>
  dailyStats: Array<{
    date: string
    newUsers: number
    newPolls: number
    responses: number
  }>
}

type TimelineQueryRow = { date: string; responses: string }
type ViewsQueryRow = { date: string; views: string }
type TimelineWithViewsRow = { date: string; responses: string; views: string; shares: string }
type SurveyTimelineRow = { date: string; started: string; completed: string }
type TestTimelineRow = { date: string; attempts: string; avg_score: string }
type ResponseCountRow = { count: string }

// ─────────────────────────────────────────────────────────────────────────────
// Analytics Service Class
// ─────────────────────────────────────────────────────────────────────────────

class AnalyticsServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Get Poll Analytics
  // ─────────────────────────────────────────────────────────────────────────────

  async getPollAnalytics(pollId: string, userId: string, timeRange?: TimeRange): Promise<PollAnalytics> {
    const [poll] = await db
      .select()
      .from(polls)
      .where(and(eq(polls.id, pollId), isNull(polls.deletedAt)))
      .limit(1)

    if (!poll) {
      throw ApiError.notFound('Poll not found', 'POLL_NOT_FOUND')
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('You can only view analytics for your own polls', 'NOT_OWNER')
    }

    const conditions = [eq(pollResponses.pollId, pollId), eq(pollResponses.isValid, true)]
    if (timeRange?.startDate) {
      conditions.push(gte(pollResponses.createdAt, timeRange.startDate))
    }
    if (timeRange?.endDate) {
      conditions.push(lte(pollResponses.createdAt, timeRange.endDate))
    }

    const responses = await db
      .select()
      .from(pollResponses)
      .where(and(...conditions))

    const options = (poll.options || []) as Array<{ id: string; text: string; voteCount: number }>
    const totalResponses = responses.length

    const optionVotes = new Map<string, number>()
    options.forEach(opt => optionVotes.set(opt.id, 0))

    responses.forEach(response => {
      const answer = response.answers as { optionId?: string }
      if (answer?.optionId && optionVotes.has(answer.optionId)) {
        optionVotes.set(answer.optionId, (optionVotes.get(answer.optionId) || 0) + 1)
      }
    })

    const optionBreakdown = options.map(opt => ({
      optionId: opt.id,
      text: opt.text,
      voteCount: optionVotes.get(opt.id) || 0,
      percentage: totalResponses > 0 ? Math.round(((optionVotes.get(opt.id) || 0) / totalResponses) * 100) : 0,
    }))

    const timelineResult = await db.execute<TimelineQueryRow>(sql`
      SELECT
        DATE(created_at)::text as date,
        COUNT(*)::text as responses
      FROM poll_responses
      WHERE poll_id = ${pollId} AND is_valid = true
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `)

    const viewsResult = await db.execute<ViewsQueryRow>(sql`
      SELECT
        DATE(viewed_at)::text as date,
        COUNT(*)::text as views
      FROM content_views
      WHERE content_type = 'POLL' AND content_id = ${pollId}
      GROUP BY DATE(viewed_at)
      ORDER BY date DESC
      LIMIT 30
    `)

    const viewsMap = new Map(viewsResult.map((r) => [r.date, parseInt(r.views, 10)]))
    const timeline = timelineResult.map((r) => ({
      date: r.date,
      responses: parseInt(r.responses, 10),
      views: viewsMap.get(r.date) || 0,
    }))

    const deviceBreakdown: Record<string, number> = {}
    const qualityScores: number[] = []

    responses.forEach(response => {
      const device = response.deviceCategory || 'UNKNOWN'
      deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1
      if (response.qualityScore !== null) {
        qualityScores.push(response.qualityScore)
      }
    })

    const qualityScoreDistribution: Record<string, number> = {
      'excellent': 0,
      'good': 0,
      'fair': 0,
      'poor': 0,
    }

    qualityScores.forEach(score => {
      if (score >= 0.8) qualityScoreDistribution['excellent'] = (qualityScoreDistribution['excellent'] || 0) + 1
      else if (score >= 0.6) qualityScoreDistribution['good'] = (qualityScoreDistribution['good'] || 0) + 1
      else if (score >= 0.4) qualityScoreDistribution['fair'] = (qualityScoreDistribution['fair'] || 0) + 1
      else qualityScoreDistribution['poor'] = (qualityScoreDistribution['poor'] || 0) + 1
    })

    const avgResponseTime = responses.length > 0
      ? responses.reduce((acc, r) => acc + (r.durationSeconds || 0), 0) / responses.length
      : 0

    const conversionRate = poll.viewCount > 0 ? (totalResponses / poll.viewCount) * 100 : 0

    return {
      pollId,
      title: poll.title,
      totalResponses,
      uniqueVoters: totalResponses,
      viewCount: poll.viewCount,
      shareCount: poll.shareCount,
      optionBreakdown,
      timeline,
      demographics: {
        deviceBreakdown,
        qualityScoreDistribution,
      },
      engagement: {
        avgResponseTime: Math.round(avgResponseTime),
        completionRate: 100,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Poll Demographics
  // ─────────────────────────────────────────────────────────────────────────────

  async getPollDemographics(pollId: string, userId: string): Promise<{
    deviceBreakdown: Record<string, number>
    qualityDistribution: Record<string, number>
    fraudRiskDistribution: Record<string, number>
    responseTimeDistribution: Array<{ range: string; count: number }>
  }> {
    const [poll] = await db
      .select({ creatorId: polls.creatorId })
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1)

    if (!poll) {
      throw ApiError.notFound('Poll not found', 'POLL_NOT_FOUND')
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('You can only view demographics for your own polls', 'NOT_OWNER')
    }

    const responses = await db
      .select()
      .from(pollResponses)
      .where(and(eq(pollResponses.pollId, pollId), eq(pollResponses.isValid, true)))

    const deviceBreakdown: Record<string, number> = {}
    const qualityDistribution: Record<string, number> = { excellent: 0, good: 0, fair: 0, poor: 0 }
    const fraudRiskDistribution: Record<string, number> = { low: 0, medium: 0, high: 0 }
    const responseTimeRanges = [
      { range: '0-10s', min: 0, max: 10, count: 0 },
      { range: '10-30s', min: 10, max: 30, count: 0 },
      { range: '30-60s', min: 30, max: 60, count: 0 },
      { range: '1-2m', min: 60, max: 120, count: 0 },
      { range: '2m+', min: 120, max: Infinity, count: 0 },
    ]

    responses.forEach(response => {
      const device = response.deviceCategory || 'UNKNOWN'
      deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1

      if (response.qualityScore !== null) {
        if (response.qualityScore >= 0.8) qualityDistribution['excellent'] = (qualityDistribution['excellent'] || 0) + 1
        else if (response.qualityScore >= 0.6) qualityDistribution['good'] = (qualityDistribution['good'] || 0) + 1
        else if (response.qualityScore >= 0.4) qualityDistribution['fair'] = (qualityDistribution['fair'] || 0) + 1
        else qualityDistribution['poor'] = (qualityDistribution['poor'] || 0) + 1
      }

      const riskLevel = response.fraudRiskLevel || 'low'
      fraudRiskDistribution[riskLevel] = (fraudRiskDistribution[riskLevel] || 0) + 1

      const duration = response.durationSeconds || 0
      for (const range of responseTimeRanges) {
        if (duration >= range.min && duration < range.max) {
          range.count++
          break
        }
      }
    })

    return {
      deviceBreakdown,
      qualityDistribution,
      fraudRiskDistribution,
      responseTimeDistribution: responseTimeRanges.map(r => ({ range: r.range, count: r.count })),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Poll Timeline
  // ─────────────────────────────────────────────────────────────────────────────

  async getPollTimeline(pollId: string, userId: string, days: number = 30): Promise<Array<{
    date: string
    responses: number
    views: number
    shares: number
  }>> {
    const [poll] = await db
      .select({ creatorId: polls.creatorId })
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1)

    if (!poll) {
      throw ApiError.notFound('Poll not found', 'POLL_NOT_FOUND')
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('You can only view timeline for your own polls', 'NOT_OWNER')
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await db.execute<TimelineWithViewsRow>(sql`
      WITH dates AS (
        SELECT generate_series(
          ${startDate}::date,
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      ),
      response_counts AS (
        SELECT DATE(created_at) as date, COUNT(*) as responses
        FROM poll_responses
        WHERE poll_id = ${pollId} AND is_valid = true AND created_at >= ${startDate}
        GROUP BY DATE(created_at)
      ),
      view_counts AS (
        SELECT DATE(viewed_at) as date, COUNT(*) as views
        FROM content_views
        WHERE content_type = 'POLL' AND content_id = ${pollId} AND viewed_at >= ${startDate}
        GROUP BY DATE(viewed_at)
      )
      SELECT
        d.date::text,
        COALESCE(r.responses, 0)::text as responses,
        COALESCE(v.views, 0)::text as views,
        '0'::text as shares
      FROM dates d
      LEFT JOIN response_counts r ON d.date = r.date
      LEFT JOIN view_counts v ON d.date = v.date
      ORDER BY d.date
    `)

    return result.map((r) => ({
      date: r.date,
      responses: parseInt(r.responses, 10),
      views: parseInt(r.views, 10),
      shares: parseInt(r.shares, 10),
    }))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Survey Analytics
  // ─────────────────────────────────────────────────────────────────────────────

  async getSurveyAnalytics(surveyId: string, userId: string): Promise<SurveyAnalytics> {
    const [survey] = await db
      .select()
      .from(surveys)
      .where(and(eq(surveys.id, surveyId), isNull(surveys.deletedAt)))
      .limit(1)

    if (!survey) {
      throw ApiError.notFound('Survey not found', 'SURVEY_NOT_FOUND')
    }

    if (survey.creatorId !== userId) {
      throw ApiError.forbidden('You can only view analytics for your own surveys', 'NOT_OWNER')
    }

    const responses = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId))

    const completedResponses = responses.filter(r => r.status === 'COMPLETED')
    const totalResponses = responses.length
    const completionRate = totalResponses > 0 ? (completedResponses.length / totalResponses) * 100 : 0

    const avgCompletionTime = completedResponses.length > 0
      ? completedResponses.reduce((acc, r) => acc + (r.durationSeconds || 0), 0) / completedResponses.length
      : 0

    const timelineResult = await db.execute<SurveyTimelineRow>(sql`
      SELECT
        DATE(created_at)::text as date,
        COUNT(*)::text as started,
        COUNT(*) FILTER (WHERE status = 'COMPLETED')::text as completed
      FROM survey_responses
      WHERE survey_id = ${surveyId}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `)

    return {
      surveyId,
      title: survey.title,
      totalResponses,
      completedResponses: completedResponses.length,
      completionRate: Math.round(completionRate * 100) / 100,
      avgCompletionTime: Math.round(avgCompletionTime),
      questionStats: [],
      timeline: timelineResult.map((r) => ({
        date: r.date,
        started: parseInt(r.started, 10),
        completed: parseInt(r.completed, 10),
      })),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Test Analytics
  // ─────────────────────────────────────────────────────────────────────────────

  async getTestAnalytics(testId: string, userId: string): Promise<TestAnalytics> {
    const [test] = await db
      .select()
      .from(tests)
      .where(and(eq(tests.id, testId), isNull(tests.deletedAt)))
      .limit(1)

    if (!test) {
      throw ApiError.notFound('Test not found', 'TEST_NOT_FOUND')
    }

    if (test.creatorId !== userId) {
      throw ApiError.forbidden('You can only view analytics for your own tests', 'NOT_OWNER')
    }

    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.testId, testId))

    const totalAttempts = attempts.length
    const passedAttempts = attempts.filter(a => a.passed).length
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0

    const avgScore = totalAttempts > 0
      ? attempts.reduce((acc, a) => acc + (a.percentageScore || 0), 0) / totalAttempts
      : 0

    const resultDistribution: Record<string, number> = {
      'A (90-100%)': 0,
      'B (80-89%)': 0,
      'C (70-79%)': 0,
      'D (60-69%)': 0,
      'F (<60%)': 0,
    }

    attempts.forEach(attempt => {
      const score = attempt.percentageScore || 0
      if (score >= 90) resultDistribution['A (90-100%)'] = (resultDistribution['A (90-100%)'] || 0) + 1
      else if (score >= 80) resultDistribution['B (80-89%)'] = (resultDistribution['B (80-89%)'] || 0) + 1
      else if (score >= 70) resultDistribution['C (70-79%)'] = (resultDistribution['C (70-79%)'] || 0) + 1
      else if (score >= 60) resultDistribution['D (60-69%)'] = (resultDistribution['D (60-69%)'] || 0) + 1
      else resultDistribution['F (<60%)'] = (resultDistribution['F (<60%)'] || 0) + 1
    })

    const timelineResult = await db.execute<TestTimelineRow>(sql`
      SELECT
        DATE(completed_at)::text as date,
        COUNT(*)::text as attempts,
        AVG(score_percentage)::text as avg_score
      FROM quiz_attempts
      WHERE test_id = ${testId}
      GROUP BY DATE(completed_at)
      ORDER BY date DESC
      LIMIT 30
    `)

    return {
      testId,
      title: test.title,
      totalAttempts,
      avgScore: Math.round(avgScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      resultDistribution,
      questionStats: [],
      timeline: timelineResult.map((r) => ({
        date: r.date,
        attempts: parseInt(r.attempts, 10),
        avgScore: Math.round(parseFloat(r.avg_score) * 100) / 100,
      })),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Analytics
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const [pollsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(polls)
      .where(and(eq(polls.creatorId, userId), isNull(polls.deletedAt)))

    const [surveysCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(surveys)
      .where(and(eq(surveys.creatorId, userId), isNull(surveys.deletedAt)))

    const [testsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tests)
      .where(and(eq(tests.creatorId, userId), isNull(tests.deletedAt)))

    const userPolls = await db
      .select({ id: polls.id })
      .from(polls)
      .where(and(eq(polls.creatorId, userId), isNull(polls.deletedAt)))

    let totalResponses = 0
    let totalViews = 0

    if (userPolls.length > 0) {
      const pollIds = userPolls.map(p => p.id)
      const responsesCountResult = await db.execute<ResponseCountRow>(sql`
        SELECT COUNT(*)::text as count FROM poll_responses
        WHERE poll_id = ANY(${pollIds}) AND is_valid = true
      `)
      totalResponses = responsesCountResult[0] ? parseInt(responsesCountResult[0].count, 10) : 0

      const viewsResult = await db
        .select({ viewCount: sql<number>`SUM(view_count)` })
        .from(polls)
        .where(and(eq(polls.creatorId, userId), isNull(polls.deletedAt)))
      totalViews = Number(viewsResult[0]?.viewCount || 0)
    }

    const avgEngagementRate = totalViews > 0 ? (totalResponses / totalViews) * 100 : 0

    const [topPoll] = await db
      .select({ id: polls.id, title: polls.title, participantCount: polls.participantCount })
      .from(polls)
      .where(and(eq(polls.creatorId, userId), isNull(polls.deletedAt)))
      .orderBy(desc(polls.participantCount))
      .limit(1)

    return {
      userId,
      pollsCreated: pollsCount?.count || 0,
      surveysCreated: surveysCount?.count || 0,
      testsCreated: testsCount?.count || 0,
      totalResponses,
      totalViews,
      avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
      topPoll: topPoll ? { id: topPoll.id, title: topPoll.title, responses: topPoll.participantCount } : null,
      activityTimeline: [],
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Platform Stats (Admin)
  // ─────────────────────────────────────────────────────────────────────────────

  async getPlatformStats(): Promise<PlatformStats> {
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [activeUserCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(gte(users.lastActiveAt, thirtyDaysAgo))

    const [pollCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(polls)
      .where(isNull(polls.deletedAt))

    const [surveyCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(surveys)
      .where(isNull(surveys.deletedAt))

    const [testCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tests)
      .where(isNull(tests.deletedAt))

    const [responseCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pollResponses)
      .where(eq(pollResponses.isValid, true))

    const totalPolls = pollCount?.count || 0
    const totalResponses = responseCount?.count || 0
    const avgResponsesPerPoll = totalPolls > 0 ? totalResponses / totalPolls : 0

    return {
      totalUsers: userCount?.count || 0,
      activeUsers30d: activeUserCount?.count || 0,
      totalPolls,
      totalSurveys: surveyCount?.count || 0,
      totalTests: testCount?.count || 0,
      totalResponses,
      avgResponsesPerPoll: Math.round(avgResponsesPerPoll * 100) / 100,
      topCategories: [],
      dailyStats: [],
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const analyticsService = new AnalyticsServiceClass()
export type { PollAnalytics, SurveyAnalytics, TestAnalytics, UserAnalytics, PlatformStats, TimeRange }
