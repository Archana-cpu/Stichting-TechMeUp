// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - EXPORT SERVICE
// Business logic for data export operations
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, sql, desc, isNull } from '@voxpoll/database'
import { polls, pollResponses, surveys, surveyResponses, tests, quizAttempts, personalityTestResults, dataExports } from '@voxpoll/database'
import { ApiError } from '../middleware/error-handler'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ExportFormat = 'JSON' | 'CSV' | 'XLSX' | 'PDF'
type ExportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
type ExportEntityType = 'POLL' | 'POLL_RESPONSES' | 'SURVEY' | 'SURVEY_RESPONSES' | 'TEST' | 'TEST_RESULTS' | 'ANALYTICS' | 'USER_DATA'

interface DataExport {
  id: string
  userId: string
  organizationId: string | null
  entityType: string
  entityId: string | null
  format: string
  filters: Record<string, unknown>
  columns: string[] | null
  status: string
  totalRecords: number | null
  processedRecords: number
  fileUrl: string | null
  fileSize: number | null
  fileName: string | null
  error: string | null
  expiresAt: Date | null
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
}

interface CreateExportInput {
  userId: string
  organizationId?: string
  entityType: ExportEntityType
  entityId?: string
  format: ExportFormat
  filters?: Record<string, unknown>
  columns?: string[]
}

interface ExportResult {
  data: Record<string, unknown>[]
  totalRecords: number
  format: ExportFormat
}

// ─────────────────────────────────────────────────────────────────────────────
// Export Service Class
// ─────────────────────────────────────────────────────────────────────────────

class ExportServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Create Export Request
  // ─────────────────────────────────────────────────────────────────────────────

  async createExport(input: CreateExportInput): Promise<DataExport> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    const id = crypto.randomUUID()

    const result = await db.execute(sql`
      INSERT INTO data_exports (id, user_id, organization_id, entity_type, entity_id, format, filters, columns, status, processed_records, expires_at, created_at)
      VALUES (
        ${id},
        ${input.userId},
        ${input.organizationId || null},
        ${input.entityType},
        ${input.entityId || null},
        ${input.format},
        ${JSON.stringify(input.filters || {})}::jsonb,
        ${input.columns ? `{${input.columns.join(',')}}` : null},
        'PENDING',
        0,
        ${expiresAt},
        NOW()
      )
      RETURNING *
    `)

    const row = (result as unknown as { rows: Record<string, unknown>[] }).rows?.[0] || { id }
    return {
      id: row['id'] as string || id,
      userId: input.userId,
      organizationId: input.organizationId || null,
      entityType: input.entityType,
      entityId: input.entityId || null,
      format: input.format,
      filters: input.filters || {},
      columns: input.columns || null,
      status: 'PENDING',
      totalRecords: null,
      processedRecords: 0,
      fileUrl: null,
      fileSize: null,
      fileName: null,
      error: null,
      expiresAt,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Export Poll Results
  // ─────────────────────────────────────────────────────────────────────────────

  async exportPollResults(
    pollId: string,
    userId: string,
    format: ExportFormat = 'JSON',
    options?: { includeInvalid?: boolean; dateRange?: { start: Date; end: Date } }
  ): Promise<DataExport> {
    const [poll] = await db
      .select()
      .from(polls)
      .where(and(eq(polls.id, pollId), isNull(polls.deletedAt)))
      .limit(1)

    if (!poll) {
      throw ApiError.notFound('Poll not found', 'POLL_NOT_FOUND')
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('You can only export your own poll data', 'NOT_OWNER')
    }

    const exportRecord = await this.createExport({
      userId,
      entityType: 'POLL_RESPONSES',
      entityId: pollId,
      format,
      filters: {
        includeInvalid: options?.includeInvalid || false,
        dateRange: options?.dateRange,
      },
    })

    this.processExportAsync(exportRecord.id, 'POLL_RESPONSES', pollId, format)

    return exportRecord
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Export Survey Responses
  // ─────────────────────────────────────────────────────────────────────────────

  async exportSurveyResponses(
    surveyId: string,
    userId: string,
    format: ExportFormat = 'JSON'
  ): Promise<DataExport> {
    const [survey] = await db
      .select()
      .from(surveys)
      .where(and(eq(surveys.id, surveyId), isNull(surveys.deletedAt)))
      .limit(1)

    if (!survey) {
      throw ApiError.notFound('Survey not found', 'SURVEY_NOT_FOUND')
    }

    if (survey.creatorId !== userId) {
      throw ApiError.forbidden('You can only export your own survey data', 'NOT_OWNER')
    }

    const exportRecord = await this.createExport({
      userId,
      entityType: 'SURVEY_RESPONSES',
      entityId: surveyId,
      format,
    })

    this.processExportAsync(exportRecord.id, 'SURVEY_RESPONSES', surveyId, format)

    return exportRecord
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Export Test Results
  // ─────────────────────────────────────────────────────────────────────────────

  async exportTestResults(
    testId: string,
    userId: string,
    format: ExportFormat = 'JSON'
  ): Promise<DataExport> {
    const [test] = await db
      .select()
      .from(tests)
      .where(and(eq(tests.id, testId), isNull(tests.deletedAt)))
      .limit(1)

    if (!test) {
      throw ApiError.notFound('Test not found', 'TEST_NOT_FOUND')
    }

    if (test.creatorId !== userId) {
      throw ApiError.forbidden('You can only export your own test data', 'NOT_OWNER')
    }

    const exportRecord = await this.createExport({
      userId,
      entityType: 'TEST_RESULTS',
      entityId: testId,
      format,
    })

    this.processExportAsync(exportRecord.id, 'TEST_RESULTS', testId, format)

    return exportRecord
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Export Status
  // ─────────────────────────────────────────────────────────────────────────────

  async getExportStatus(exportId: string, userId: string): Promise<DataExport> {
    const [exportRecord] = await db
      .select()
      .from(dataExports)
      .where(eq(dataExports.id, exportId))
      .limit(1)

    if (!exportRecord) {
      throw ApiError.notFound('Export not found', 'EXPORT_NOT_FOUND')
    }

    if (exportRecord.userId !== userId) {
      throw ApiError.forbidden('You can only view your own exports', 'NOT_OWNER')
    }

    return this.formatExport(exportRecord)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Exports
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserExports(userId: string, limit: number = 20): Promise<DataExport[]> {
    const exports = await db
      .select()
      .from(dataExports)
      .where(eq(dataExports.userId, userId))
      .orderBy(desc(dataExports.createdAt))
      .limit(limit)

    return exports.map(e => this.formatExport(e))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Download Export (Get Data)
  // ─────────────────────────────────────────────────────────────────────────────

  async getExportData(exportId: string, userId: string): Promise<{
    data: string
    format: string
    fileName: string
    contentType: string
  }> {
    const exportRecord = await this.getExportStatus(exportId, userId)

    if (exportRecord.status !== 'COMPLETED') {
      throw ApiError.badRequest('Export is not ready', 'EXPORT_NOT_READY')
    }

    if (exportRecord.expiresAt && new Date() > new Date(exportRecord.expiresAt)) {
      throw ApiError.badRequest('Export has expired', 'EXPORT_EXPIRED')
    }

    const data = await this.fetchExportData(exportRecord)

    const contentTypes: Record<string, string> = {
      JSON: 'application/json',
      CSV: 'text/csv',
      XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      PDF: 'application/pdf',
    }

    return {
      data,
      format: exportRecord.format,
      fileName: exportRecord.fileName || `export-${exportId}.${exportRecord.format.toLowerCase()}`,
      contentType: contentTypes[exportRecord.format] || 'application/octet-stream',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Process Export Async
  // ─────────────────────────────────────────────────────────────────────────────

  private async processExportAsync(
    exportId: string,
    entityType: ExportEntityType,
    entityId: string,
    format: ExportFormat
  ): Promise<void> {
    setImmediate(async () => {
      try {
        await this.updateExportStatus(exportId, 'PROCESSING')

        const result = await this.generateExportData(entityType, entityId, format)

        const fileName = `${entityType.toLowerCase()}-${entityId}-${Date.now()}.${format.toLowerCase()}`
        const fileData = this.formatDataForExport(result.data, format)

        await db
          .update(dataExports)
          .set({
            status: 'COMPLETED',
            totalRecords: result.totalRecords,
            processedRecords: result.totalRecords,
            fileName,
            fileSize: Buffer.byteLength(fileData, 'utf8'),
            completedAt: new Date(),
          })
          .where(eq(dataExports.id, exportId))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        await db
          .update(dataExports)
          .set({
            status: 'FAILED',
            error: errorMessage,
          })
          .where(eq(dataExports.id, exportId))
      }
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Generate Export Data
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateExportData(
    entityType: ExportEntityType,
    entityId: string,
    format: ExportFormat
  ): Promise<ExportResult> {
    let data: Record<string, unknown>[] = []

    switch (entityType) {
      case 'POLL_RESPONSES':
        data = await this.getPollResponsesData(entityId)
        break
      case 'SURVEY_RESPONSES':
        data = await this.getSurveyResponsesData(entityId)
        break
      case 'TEST_RESULTS':
        data = await this.getTestResultsData(entityId)
        break
      default:
        throw new Error(`Unsupported entity type: ${entityType}`)
    }

    return {
      data,
      totalRecords: data.length,
      format,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Poll Responses Data
  // ─────────────────────────────────────────────────────────────────────────────

  private async getPollResponsesData(pollId: string): Promise<Record<string, unknown>[]> {
    const [poll] = await db
      .select()
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1)

    if (!poll) return []

    const responses = await db
      .select()
      .from(pollResponses)
      .where(and(eq(pollResponses.pollId, pollId), eq(pollResponses.isValid, true)))
      .orderBy(desc(pollResponses.createdAt))

    const options = (poll.options || []) as Array<{ id: string; text: string }>
    const optionMap = new Map(options.map(o => [o.id, o.text]))

    return responses.map(response => {
      const answer = response.answers as { optionId?: string }
      return {
        responseId: response.id,
        createdAt: response.createdAt.toISOString(),
        optionId: answer?.optionId || null,
        optionText: answer?.optionId ? optionMap.get(answer.optionId) || 'Unknown' : null,
        deviceCategory: response.deviceCategory,
        qualityScore: response.qualityScore,
        durationSeconds: response.durationSeconds,
      }
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Survey Responses Data
  // ─────────────────────────────────────────────────────────────────────────────

  private async getSurveyResponsesData(surveyId: string): Promise<Record<string, unknown>[]> {
    const responses = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId))
      .orderBy(desc(surveyResponses.createdAt))

    return responses.map(response => ({
      responseId: response.id,
      status: response.status,
      createdAt: response.createdAt.toISOString(),
      completedAt: response.completedAt?.toISOString() || null,
      completionTimeSeconds: response.durationSeconds,
      answers: response.answers,
    }))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Test Results Data
  // ─────────────────────────────────────────────────────────────────────────────

  private async getTestResultsData(testId: string): Promise<Record<string, unknown>[]> {
    const [test] = await db
      .select({ testCategory: tests.testCategory })
      .from(tests)
      .where(eq(tests.id, testId))
      .limit(1)

    if (!test) return []

    if (test.testCategory === 'QUIZ') {
      const attempts = await db
        .select()
        .from(quizAttempts)
        .where(eq(quizAttempts.testId, testId))
        .orderBy(desc(quizAttempts.completedAt))

      return attempts.map(attempt => ({
        attemptId: attempt.id,
        completedAt: attempt.completedAt?.toISOString() || null,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentageScore: attempt.percentageScore,
        passed: attempt.passed,
        timeSpentSeconds: attempt.timeSpentSeconds,
      }))
    } else {
      const results = await db
        .select()
        .from(personalityTestResults)
        .where(eq(personalityTestResults.testId, testId))
        .orderBy(desc(personalityTestResults.completedAt))

      return results.map(result => ({
        resultId: result.id,
        completedAt: result.completedAt?.toISOString() || null,
        testType: result.testType,
        typeCode: result.typeCode,
        calculatedResult: result.calculatedResult,
        axisScores: result.axisScores,
      }))
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Format Data for Export
  // ─────────────────────────────────────────────────────────────────────────────

  private formatDataForExport(data: Record<string, unknown>[], format: ExportFormat): string {
    switch (format) {
      case 'JSON':
        return JSON.stringify(data, null, 2)

      case 'CSV':
        return this.convertToCSV(data)

      default:
        return JSON.stringify(data, null, 2)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Convert to CSV
  // ─────────────────────────────────────────────────────────────────────────────

  private convertToCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0] as Record<string, unknown>)
    const headerRow = headers.map(h => `"${h}"`).join(',')

    const rows = data.map(row => {
      return headers.map(header => {
        const value = (row as Record<string, unknown>)[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(',')
    })

    return [headerRow, ...rows].join('\n')
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch Export Data (for download)
  // ─────────────────────────────────────────────────────────────────────────────

  private async fetchExportData(exportRecord: DataExport): Promise<string> {
    if (!exportRecord.entityId) {
      throw ApiError.badRequest('Invalid export record', 'INVALID_EXPORT')
    }

    const result = await this.generateExportData(
      exportRecord.entityType as ExportEntityType,
      exportRecord.entityId,
      exportRecord.format as ExportFormat
    )

    return this.formatDataForExport(result.data, exportRecord.format as ExportFormat)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Export Status
  // ─────────────────────────────────────────────────────────────────────────────

  private async updateExportStatus(exportId: string, status: ExportStatus): Promise<void> {
    const updateData: Record<string, unknown> = { status }

    if (status === 'PROCESSING') {
      updateData['startedAt'] = new Date()
    }

    await db
      .update(dataExports)
      .set(updateData)
      .where(eq(dataExports.id, exportId))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Format Export
  // ─────────────────────────────────────────────────────────────────────────────

  private formatExport(record: typeof dataExports.$inferSelect): DataExport {
    return {
      id: record.id,
      userId: record.userId,
      organizationId: record.organizationId,
      entityType: record.entityType,
      entityId: record.entityId,
      format: record.format,
      filters: (record.filters || {}) as Record<string, unknown>,
      columns: record.columns,
      status: record.status,
      totalRecords: record.totalRecords,
      processedRecords: record.processedRecords,
      fileUrl: record.fileUrl,
      fileSize: record.fileSize,
      fileName: record.fileName,
      error: record.error,
      expiresAt: record.expiresAt,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      createdAt: record.createdAt,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const exportService = new ExportServiceClass()
export type { DataExport, CreateExportInput, ExportFormat, ExportStatus, ExportEntityType }
