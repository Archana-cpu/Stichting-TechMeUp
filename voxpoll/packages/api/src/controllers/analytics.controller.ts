// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ANALYTICS CONTROLLER
// HTTP request/response handling for analytics operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { analyticsService } from '../services/analytics.service'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Analytics Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class AnalyticsControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /analytics/polls/:id - Get poll analytics
  // ─────────────────────────────────────────────────────────────────────────────

  async getPollAnalytics(c: Context<AppEnv>) {
    const pollId = c.req.param('id')
    const userId = c.get('userId')!
    const query = c.req.query()

    const timeRange = query['startDate'] && query['endDate']
      ? {
          startDate: new Date(query['startDate']),
          endDate: new Date(query['endDate']),
        }
      : undefined

    const analytics = await analyticsService.getPollAnalytics(pollId, userId, timeRange)

    return c.json({
      success: true,
      data: analytics,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /analytics/polls/:id/demographics - Get poll demographics
  // ─────────────────────────────────────────────────────────────────────────────

  async getPollDemographics(c: Context<AppEnv>) {
    const pollId = c.req.param('id')
    const userId = c.get('userId')!

    const demographics = await analyticsService.getPollDemographics(pollId, userId)

    return c.json({
      success: true,
      data: demographics,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /analytics/polls/:id/timeline - Get poll timeline
  // ─────────────────────────────────────────────────────────────────────────────

  async getPollTimeline(c: Context<AppEnv>) {
    const pollId = c.req.param('id')
    const userId = c.get('userId')!
    const query = c.req.query()
    const days = parseInt(query['days'] || '30', 10)

    const timeline = await analyticsService.getPollTimeline(pollId, userId, days)

    return c.json({
      success: true,
      data: timeline,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /analytics/surveys/:id - Get survey analytics
  // ─────────────────────────────────────────────────────────────────────────────

  async getSurveyAnalytics(c: Context<AppEnv>) {
    const surveyId = c.req.param('id')
    const userId = c.get('userId')!

    const analytics = await analyticsService.getSurveyAnalytics(surveyId, userId)

    return c.json({
      success: true,
      data: analytics,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /analytics/tests/:id - Get test analytics
  // ─────────────────────────────────────────────────────────────────────────────

  async getTestAnalytics(c: Context<AppEnv>) {
    const testId = c.req.param('id')
    const userId = c.get('userId')!

    const analytics = await analyticsService.getTestAnalytics(testId, userId)

    return c.json({
      success: true,
      data: analytics,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /analytics/me - Get user analytics
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserAnalytics(c: Context<AppEnv>) {
    const userId = c.get('userId')!

    const analytics = await analyticsService.getUserAnalytics(userId)

    return c.json({
      success: true,
      data: analytics,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /analytics/platform - Get platform stats (admin)
  // ─────────────────────────────────────────────────────────────────────────────

  async getPlatformStats(c: Context<AppEnv>) {
    const stats = await analyticsService.getPlatformStats()

    return c.json({
      success: true,
      data: stats,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const analyticsController = new AnalyticsControllerClass()
