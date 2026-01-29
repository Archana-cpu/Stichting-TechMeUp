// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - EXPORT CONTROLLER
// HTTP request/response handling for export operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { exportService, type ExportFormat } from '../services/export.service'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Export Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class ExportControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /exports/polls/:id - Export poll results
  // ─────────────────────────────────────────────────────────────────────────────

  async exportPollResults(c: Context<AppEnv>) {
    const pollId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<{
      format?: ExportFormat
      includeInvalid?: boolean
      dateRange?: { start: string; end: string }
    }>()

    const exportRecord = await exportService.exportPollResults(
      pollId,
      userId,
      body.format || 'JSON',
      {
        includeInvalid: body.includeInvalid,
        dateRange: body.dateRange ? {
          start: new Date(body.dateRange.start),
          end: new Date(body.dateRange.end),
        } : undefined,
      }
    )

    return c.json({
      success: true,
      data: exportRecord,
    }, 202)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /exports/surveys/:id - Export survey responses
  // ─────────────────────────────────────────────────────────────────────────────

  async exportSurveyResponses(c: Context<AppEnv>) {
    const surveyId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<{ format?: ExportFormat }>()

    const exportRecord = await exportService.exportSurveyResponses(
      surveyId,
      userId,
      body.format || 'JSON'
    )

    return c.json({
      success: true,
      data: exportRecord,
    }, 202)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /exports/tests/:id - Export test results
  // ─────────────────────────────────────────────────────────────────────────────

  async exportTestResults(c: Context<AppEnv>) {
    const testId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<{ format?: ExportFormat }>()

    const exportRecord = await exportService.exportTestResults(
      testId,
      userId,
      body.format || 'JSON'
    )

    return c.json({
      success: true,
      data: exportRecord,
    }, 202)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /exports - Get user's exports
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserExports(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const query = c.req.query()
    const limit = Math.min(parseInt(query['limit'] || '20', 10), 100)

    const exports = await exportService.getUserExports(userId, limit)

    return c.json({
      success: true,
      data: exports,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /exports/:id - Get export status
  // ─────────────────────────────────────────────────────────────────────────────

  async getExportStatus(c: Context<AppEnv>) {
    const exportId = c.req.param('id')
    const userId = c.get('userId')!

    const exportRecord = await exportService.getExportStatus(exportId, userId)

    return c.json({
      success: true,
      data: exportRecord,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /exports/:id/download - Download export
  // ─────────────────────────────────────────────────────────────────────────────

  async downloadExport(c: Context<AppEnv>) {
    const exportId = c.req.param('id')
    const userId = c.get('userId')!

    const { data, format, fileName, contentType } = await exportService.getExportData(exportId, userId)

    c.header('Content-Type', contentType)
    c.header('Content-Disposition', `attachment; filename="${fileName}"`)

    return c.body(data)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const exportController = new ExportControllerClass()
