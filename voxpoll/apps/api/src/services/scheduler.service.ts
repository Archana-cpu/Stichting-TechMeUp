// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SCHEDULER SERVICE
// Business logic for scheduled job operations
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, sql, isNull } from '@voxpoll/database'
import { polls, surveys, tests } from '@voxpoll/database'
import { ApiError } from '../middleware/error-handler'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type JobType = 'PUBLISH_POLL' | 'CLOSE_POLL' | 'PUBLISH_SURVEY' | 'CLOSE_SURVEY' | 'PUBLISH_TEST' | 'SEND_REMINDER' | 'SEND_DIGEST' | 'CLEANUP_EXPIRED'
type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
type EntityType = 'POLL' | 'SURVEY' | 'TEST' | 'SYSTEM'

interface ScheduledJob {
  id: string
  jobType: string
  entityType: string
  entityId: string
  scheduledFor: Date
  timezone: string
  status: string
  startedAt: Date | null
  completedAt: Date | null
  error: string | null
  retryCount: number
  maxRetries: number
  payload: Record<string, unknown>
  result: Record<string, unknown> | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface CreateScheduledJobInput {
  jobType: JobType
  entityType: EntityType
  entityId: string
  scheduledFor: Date
  timezone?: string
  payload?: Record<string, unknown>
  createdBy: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Scheduler Service Class
// ─────────────────────────────────────────────────────────────────────────────

class SchedulerServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Schedule Poll Publish
  // ─────────────────────────────────────────────────────────────────────────────

  async schedulePublish(
    entityType: 'POLL' | 'SURVEY' | 'TEST',
    entityId: string,
    publishAt: Date,
    userId: string
  ): Promise<ScheduledJob> {
    const entity = await this.getEntityAndVerifyOwnership(entityType, entityId, userId)
    if (!entity) {
      throw ApiError.notFound(`${entityType} not found`, `${entityType}_NOT_FOUND`)
    }

    const existing = await this.getExistingJob(entityType, entityId, `PUBLISH_${entityType}`)
    if (existing && existing.status === 'PENDING') {
      await this.cancelJob(existing.id, userId)
    }

    const jobType = `PUBLISH_${entityType}` as JobType
    const id = crypto.randomUUID()

    await db.execute(sql`
      INSERT INTO scheduled_jobs (id, job_type, entity_type, entity_id, scheduled_for, timezone, status, payload, created_by, created_at, updated_at)
      VALUES (${id}, ${jobType}, ${entityType}, ${entityId}, ${publishAt}, 'UTC', 'PENDING', '{}'::jsonb, ${userId}, NOW(), NOW())
    `)

    return {
      id,
      jobType,
      entityType,
      entityId,
      scheduledFor: publishAt,
      timezone: 'UTC',
      status: 'PENDING',
      startedAt: null,
      completedAt: null,
      error: null,
      retryCount: 0,
      maxRetries: 3,
      payload: {},
      result: null,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Schedule Poll Close
  // ─────────────────────────────────────────────────────────────────────────────

  async scheduleClose(
    pollId: string,
    closeAt: Date,
    userId: string
  ): Promise<ScheduledJob> {
    const poll = await this.getEntityAndVerifyOwnership('POLL', pollId, userId)
    if (!poll) {
      throw ApiError.notFound('Poll not found', 'POLL_NOT_FOUND')
    }

    const existing = await this.getExistingJob('POLL', pollId, 'CLOSE_POLL')
    if (existing && existing.status === 'PENDING') {
      await this.cancelJob(existing.id, userId)
    }

    const id = crypto.randomUUID()

    await db.execute(sql`
      INSERT INTO scheduled_jobs (id, job_type, entity_type, entity_id, scheduled_for, timezone, status, payload, created_by, created_at, updated_at)
      VALUES (${id}, 'CLOSE_POLL', 'POLL', ${pollId}, ${closeAt}, 'UTC', 'PENDING', '{}'::jsonb, ${userId}, NOW(), NOW())
    `)

    return {
      id,
      jobType: 'CLOSE_POLL',
      entityType: 'POLL',
      entityId: pollId,
      scheduledFor: closeAt,
      timezone: 'UTC',
      status: 'PENDING',
      startedAt: null,
      completedAt: null,
      error: null,
      retryCount: 0,
      maxRetries: 3,
      payload: {},
      result: null,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Cancel Schedule
  // ─────────────────────────────────────────────────────────────────────────────

  async cancelJob(jobId: string, userId: string): Promise<void> {
    const result = await db.execute(sql`
      SELECT * FROM scheduled_jobs WHERE id = ${jobId} LIMIT 1
    `)

    const rows = (result as unknown as { rows: Record<string, unknown>[] }).rows
    const job = rows?.[0]

    if (!job) {
      throw ApiError.notFound('Scheduled job not found', 'JOB_NOT_FOUND')
    }

    if (job['created_by'] !== userId) {
      throw ApiError.forbidden('You can only cancel your own scheduled jobs', 'NOT_OWNER')
    }

    if (job['status'] !== 'PENDING') {
      throw ApiError.badRequest('Only pending jobs can be cancelled', 'JOB_NOT_PENDING')
    }

    await db.execute(sql`
      UPDATE scheduled_jobs SET status = 'CANCELLED', updated_at = NOW() WHERE id = ${jobId}
    `)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Scheduled Jobs for User
  // ─────────────────────────────────────────────────────────────────────────────

  async getScheduledJobs(
    userId: string,
    status?: JobStatus
  ): Promise<ScheduledJob[]> {
    let query = sql`
      SELECT * FROM scheduled_jobs WHERE created_by = ${userId}
    `

    if (status) {
      query = sql`
        SELECT * FROM scheduled_jobs WHERE created_by = ${userId} AND status = ${status}
      `
    }

    query = sql`${query} ORDER BY scheduled_for DESC`

    const result = await db.execute(query)
    const rows = (result as unknown as { rows: Record<string, unknown>[] }).rows || []

    return rows.map(this.formatJobFromRow)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Pending Jobs to Process
  // ─────────────────────────────────────────────────────────────────────────────

  async getPendingJobs(limit: number = 100): Promise<ScheduledJob[]> {
    const result = await db.execute(sql`
      SELECT * FROM scheduled_jobs
      WHERE status = 'PENDING' AND scheduled_for <= NOW()
      ORDER BY scheduled_for ASC
      LIMIT ${limit}
    `)

    const rows = (result as unknown as { rows: Record<string, unknown>[] }).rows || []
    return rows.map(this.formatJobFromRow)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Process Jobs (Called by Cron/Worker)
  // ─────────────────────────────────────────────────────────────────────────────

  async processJobs(): Promise<{ processed: number; failed: number }> {
    const pendingJobs = await this.getPendingJobs()
    let processed = 0
    let failed = 0

    for (const job of pendingJobs) {
      try {
        await this.markJobProcessing(job.id)
        await this.executeJob(job)
        await this.markJobCompleted(job.id)
        processed++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        await this.markJobFailed(job.id, errorMessage)
        failed++
      }
    }

    return { processed, failed }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Execute Single Job
  // ─────────────────────────────────────────────────────────────────────────────

  private async executeJob(job: ScheduledJob): Promise<void> {
    switch (job.jobType) {
      case 'PUBLISH_POLL':
        await this.executePublishPoll(job.entityId)
        break
      case 'CLOSE_POLL':
        await this.executeClosePoll(job.entityId)
        break
      case 'PUBLISH_SURVEY':
        await this.executePublishSurvey(job.entityId)
        break
      case 'CLOSE_SURVEY':
        await this.executeCloseSurvey(job.entityId)
        break
      case 'PUBLISH_TEST':
        await this.executePublishTest(job.entityId)
        break
      default:
        throw new Error(`Unknown job type: ${job.jobType}`)
    }
  }

  private async executePublishPoll(pollId: string): Promise<void> {
    await db
      .update(polls)
      .set({
        status: 'ACTIVE',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(polls.id, pollId))
  }

  private async executeClosePoll(pollId: string): Promise<void> {
    await db
      .update(polls)
      .set({
        status: 'ENDED',
        updatedAt: new Date(),
      })
      .where(eq(polls.id, pollId))
  }

  private async executePublishSurvey(surveyId: string): Promise<void> {
    await db
      .update(surveys)
      .set({
        status: 'ACTIVE',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, surveyId))
  }

  private async executeCloseSurvey(surveyId: string): Promise<void> {
    await db
      .update(surveys)
      .set({
        status: 'ENDED',
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, surveyId))
  }

  private async executePublishTest(testId: string): Promise<void> {
    await db
      .update(tests)
      .set({
        status: 'ACTIVE',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tests.id, testId))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Mark Job Status
  // ─────────────────────────────────────────────────────────────────────────────

  private async markJobProcessing(jobId: string): Promise<void> {
    await db.execute(sql`
      UPDATE scheduled_jobs SET status = 'PROCESSING', started_at = NOW(), updated_at = NOW()
      WHERE id = ${jobId}
    `)
  }

  private async markJobCompleted(jobId: string): Promise<void> {
    await db.execute(sql`
      UPDATE scheduled_jobs SET status = 'COMPLETED', completed_at = NOW(), result = '{}'::jsonb, updated_at = NOW()
      WHERE id = ${jobId}
    `)
  }

  private async markJobFailed(jobId: string, error: string): Promise<void> {
    const result = await db.execute(sql`
      SELECT retry_count, max_retries FROM scheduled_jobs WHERE id = ${jobId} LIMIT 1
    `)

    const rows = (result as unknown as { rows: { retry_count: number; max_retries: number }[] }).rows
    const job = rows?.[0]
    const shouldRetry = job && job.retry_count < job.max_retries

    await db.execute(sql`
      UPDATE scheduled_jobs SET
        status = ${shouldRetry ? 'PENDING' : 'FAILED'},
        error = ${error},
        retry_count = retry_count + 1,
        last_retry_at = NOW(),
        updated_at = NOW()
      WHERE id = ${jobId}
    `)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Get Entity and Verify Ownership
  // ─────────────────────────────────────────────────────────────────────────────

  private async getEntityAndVerifyOwnership(
    entityType: EntityType,
    entityId: string,
    userId: string
  ): Promise<{ id: string; creatorId: string } | null> {
    let result: { id: string; creatorId: string }[] = []

    switch (entityType) {
      case 'POLL':
        result = await db
          .select({ id: polls.id, creatorId: polls.creatorId })
          .from(polls)
          .where(and(eq(polls.id, entityId), isNull(polls.deletedAt)))
          .limit(1)
        break
      case 'SURVEY':
        result = await db
          .select({ id: surveys.id, creatorId: surveys.creatorId })
          .from(surveys)
          .where(and(eq(surveys.id, entityId), isNull(surveys.deletedAt)))
          .limit(1)
        break
      case 'TEST':
        result = await db
          .select({ id: tests.id, creatorId: tests.creatorId })
          .from(tests)
          .where(and(eq(tests.id, entityId), isNull(tests.deletedAt)))
          .limit(1)
        break
    }

    const entity = result[0]
    if (!entity) return null

    if (entity.creatorId !== userId) {
      throw ApiError.forbidden('You can only schedule jobs for your own content', 'NOT_OWNER')
    }

    return entity
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Get Existing Job
  // ─────────────────────────────────────────────────────────────────────────────

  private async getExistingJob(
    entityType: EntityType,
    entityId: string,
    jobType: string
  ): Promise<ScheduledJob | null> {
    const result = await db.execute(sql`
      SELECT * FROM scheduled_jobs
      WHERE entity_type = ${entityType} AND entity_id = ${entityId} AND job_type = ${jobType} AND status = 'PENDING'
      LIMIT 1
    `)

    const rows = (result as unknown as { rows: Record<string, unknown>[] }).rows
    const job = rows?.[0]

    return job ? this.formatJobFromRow(job) : null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Format Job from Database Row
  // ─────────────────────────────────────────────────────────────────────────────

  private formatJobFromRow(row: Record<string, unknown>): ScheduledJob {
    return {
      id: row['id'] as string,
      jobType: row['job_type'] as string,
      entityType: row['entity_type'] as string,
      entityId: row['entity_id'] as string,
      scheduledFor: new Date(row['scheduled_for'] as string),
      timezone: row['timezone'] as string || 'UTC',
      status: row['status'] as string,
      startedAt: row['started_at'] ? new Date(row['started_at'] as string) : null,
      completedAt: row['completed_at'] ? new Date(row['completed_at'] as string) : null,
      error: row['error'] as string | null,
      retryCount: row['retry_count'] as number || 0,
      maxRetries: row['max_retries'] as number || 3,
      payload: (row['payload'] || {}) as Record<string, unknown>,
      result: row['result'] as Record<string, unknown> | null,
      createdBy: row['created_by'] as string,
      createdAt: new Date(row['created_at'] as string),
      updatedAt: new Date(row['updated_at'] as string),
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const schedulerService = new SchedulerServiceClass()
export type { ScheduledJob, CreateScheduledJobInput, JobType, JobStatus, EntityType }
