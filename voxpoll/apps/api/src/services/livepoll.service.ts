// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - LIVE POLL SERVICE
// Business logic for live poll sessions
// Per bible spec: 10K max participants, 6-char join codes, no auth required to join
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, inArray, sql, desc } from '@voxpoll/database'
import { livePollSessions, polls } from '@voxpoll/database'
import { websocketService } from './websocket.service'
import { pollRepository } from '../repositories/poll.repository'
import { ApiError } from '../middleware/error-handler'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateSessionInput {
  pollId: string
}

export interface JoinSessionResult {
  sessionId: string
  sessionCode: string
  poll: {
    id: string
    title: string
    description: string | null
    options: unknown[]
  }
  status: string
  participantCount: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_PARTICIPANTS = 10000
const SESSION_DURATION_HOURS = 24

// ─────────────────────────────────────────────────────────────────────────────
// Live Poll Service Class
// ─────────────────────────────────────────────────────────────────────────────

class LivePollServiceClass {
  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a new live poll session
   * Only poll owner can create a session
   */
  async createSession(pollId: string, hostId: string): Promise<{ sessionId: string; sessionCode: string }> {
    // Verify poll exists and user is owner
    const poll = await pollRepository.findById(pollId)
    if (!poll) {
      throw ApiError.notFound('Poll not found', 'POLL_NOT_FOUND')
    }

    if (poll.creatorId !== hostId) {
      throw ApiError.forbidden('Only the poll owner can create a live session', 'NOT_POLL_OWNER')
    }

    // Check if poll is suitable for live session
    if (poll.type !== 'LIVE_POLL' && poll.type !== 'STANDARD') {
      throw ApiError.badRequest('This poll type does not support live sessions', 'INVALID_POLL_TYPE')
    }

    // Check for existing active session
    const existingSessionResult = await db
      .select()
      .from(livePollSessions)
      .where(
        eq(livePollSessions.pollId, pollId)
      )
      .limit(1)

    // Filter for active status in JavaScript since we can't use IN easily
    const existingSession = existingSessionResult.find(
      (s) => ['WAITING', 'ACTIVE', 'PAUSED'].includes(s.status)
    )

    if (existingSession) {
      throw ApiError.conflict('An active session already exists for this poll', 'SESSION_EXISTS')
    }

    // Generate unique 6-character session code
    let sessionCode: string = ''
    let attempts = 0
    do {
      sessionCode = websocketService.generateSessionCode()
      const existsResult = await db
        .select()
        .from(livePollSessions)
        .where(eq(livePollSessions.sessionCode, sessionCode))
        .limit(1)

      if (!existsResult[0]) break
      attempts++
    } while (attempts < 10)

    if (attempts >= 10) {
      throw ApiError.internal('Failed to generate unique session code', 'CODE_GENERATION_FAILED')
    }

    // Create session in database
    const joinUrl = `${process.env['FRONTEND_URL'] || 'https://voxpoll.com'}/live/${sessionCode}`
    const sessionResult = await db
      .insert(livePollSessions)
      .values({
        pollId,
        hostId,
        sessionCode,
        joinUrl,
        status: 'WAITING',
        maxParticipants: MAX_PARTICIPANTS,
        autoEndAt: new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000),
      })
      .returning()

    const session = sessionResult[0]
    if (!session) {
      throw ApiError.internal('Failed to create session', 'SESSION_CREATE_FAILED')
    }

    // Initialize session state in Redis (for real-time operations)
    await websocketService.createSession(sessionCode, pollId, hostId)

    return {
      sessionId: session.id,
      sessionCode: session.sessionCode,
    }
  }

  /**
   * Join a live poll session (NO AUTH REQUIRED per bible spec)
   * Returns poll data and session status
   */
  async joinSession(sessionCode: string, participantId: string, userId?: string): Promise<JoinSessionResult> {
    // Find session by code with poll data
    const sessionResult = await db
      .select({
        id: livePollSessions.id,
        sessionCode: livePollSessions.sessionCode,
        status: livePollSessions.status,
        maxParticipants: livePollSessions.maxParticipants,
        autoEndAt: livePollSessions.autoEndAt,
        pollId: polls.id,
        pollTitle: polls.title,
        pollDescription: polls.description,
        pollOptions: polls.options,
      })
      .from(livePollSessions)
      .innerJoin(polls, eq(livePollSessions.pollId, polls.id))
      .where(eq(livePollSessions.sessionCode, sessionCode))
      .limit(1)

    const session = sessionResult[0]

    if (!session) {
      throw ApiError.notFound('Session not found', 'SESSION_NOT_FOUND')
    }

    if (session.status === 'ENDED') {
      throw ApiError.badRequest('This session has ended', 'SESSION_ENDED')
    }

    if (session.autoEndAt && session.autoEndAt < new Date()) {
      throw ApiError.badRequest('This session has expired', 'SESSION_EXPIRED')
    }

    // Check capacity
    const currentCount = websocketService.getSessionConnectionCount(sessionCode)
    if (currentCount >= session.maxParticipants) {
      throw ApiError.badRequest(
        'This session is at capacity. Please try again later.',
        'SESSION_FULL'
      )
    }

    // Get session state from Redis
    const sessionState = await websocketService.getSessionState(sessionCode)

    return {
      sessionId: session.id,
      sessionCode: session.sessionCode,
      poll: {
        id: session.pollId,
        title: session.pollTitle,
        description: session.pollDescription,
        options: session.pollOptions as unknown[],
      },
      status: sessionState?.status || session.status,
      participantCount: currentCount,
    }
  }

  /**
   * Start a live poll session
   */
  async startSession(sessionCode: string, hostId: string): Promise<void> {
    const session = await this.verifyHost(sessionCode, hostId)

    if (session.status !== 'WAITING') {
      throw ApiError.badRequest('Session can only be started from WAITING status', 'INVALID_STATUS')
    }

    await db
      .update(livePollSessions)
      .set({
        status: 'ACTIVE',
        startedAt: new Date(),
      })
      .where(eq(livePollSessions.id, session.id))

    // WebSocket broadcast is handled by the websocket service when host sends START action
  }

  /**
   * Pause a live poll session
   */
  async pauseSession(sessionCode: string, hostId: string): Promise<void> {
    const session = await this.verifyHost(sessionCode, hostId)

    if (session.status !== 'ACTIVE') {
      throw ApiError.badRequest('Session can only be paused when ACTIVE', 'INVALID_STATUS')
    }

    await db
      .update(livePollSessions)
      .set({ status: 'PAUSED' })
      .where(eq(livePollSessions.id, session.id))
  }

  /**
   * Resume a paused live poll session
   */
  async resumeSession(sessionCode: string, hostId: string): Promise<void> {
    const session = await this.verifyHost(sessionCode, hostId)

    if (session.status !== 'PAUSED') {
      throw ApiError.badRequest('Session can only be resumed from PAUSED status', 'INVALID_STATUS')
    }

    await db
      .update(livePollSessions)
      .set({ status: 'ACTIVE' })
      .where(eq(livePollSessions.id, session.id))
  }

  /**
   * End a live poll session
   * Converts live session results to regular poll
   */
  async endSession(sessionCode: string, hostId: string): Promise<void> {
    const session = await this.verifyHost(sessionCode, hostId)

    if (session.status === 'ENDED') {
      throw ApiError.badRequest('Session is already ended', 'ALREADY_ENDED')
    }

    // Get final vote counts from Redis
    const sessionState = await websocketService.getSessionState(sessionCode)
    const finalVotes = sessionState?.votes || {}

    // Update session in database
    await db
      .update(livePollSessions)
      .set({
        status: 'ENDED',
        endedAt: new Date(),
        peakParticipants: sessionState?.participantCount || 0,
      })
      .where(eq(livePollSessions.id, session.id))

    // Update poll with final results
    const pollResult = await db
      .select({ options: polls.options })
      .from(polls)
      .where(eq(polls.id, session.pollId))
      .limit(1)

    const poll = pollResult[0]

    if (poll) {
      const options = poll.options as { id: string; text: string; voteCount: number }[]
      const updatedOptions = options.map((opt) => ({
        ...opt,
        voteCount: (finalVotes[opt.id] || 0) + opt.voteCount, // Add live votes to existing
      }))

      await db
        .update(polls)
        .set({
          options: updatedOptions,
          participantCount: sql`${polls.participantCount} + ${sessionState?.participantCount || 0}`,
        })
        .where(eq(polls.id, session.pollId))
    }

    // WebSocket broadcast is handled by the websocket service when host sends END action
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionCode: string): Promise<{
    sessionId: string
    status: string
    participantCount: number
    startedAt: Date | null
    endedAt: Date | null
  }> {
    const sessionResult = await db
      .select()
      .from(livePollSessions)
      .where(eq(livePollSessions.sessionCode, sessionCode))
      .limit(1)

    const session = sessionResult[0]

    if (!session) {
      throw ApiError.notFound('Session not found', 'SESSION_NOT_FOUND')
    }

    const currentCount = websocketService.getSessionConnectionCount(sessionCode)

    return {
      sessionId: session.id,
      status: session.status,
      participantCount: currentCount || session.currentParticipants,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    }
  }

  /**
   * Get host's active sessions
   */
  async getHostSessions(hostId: string): Promise<{
    id: string
    sessionCode: string
    pollId: string
    status: string
    participantCount: number
    createdAt: Date
  }[]> {
    const sessions = await db
      .select({
        id: livePollSessions.id,
        sessionCode: livePollSessions.sessionCode,
        pollId: livePollSessions.pollId,
        status: livePollSessions.status,
        currentParticipants: livePollSessions.currentParticipants,
        createdAt: livePollSessions.createdAt,
      })
      .from(livePollSessions)
      .where(eq(livePollSessions.hostId, hostId))
      .orderBy(desc(livePollSessions.createdAt))

    // Filter for active statuses
    const activeSessions = sessions.filter((s) => ['WAITING', 'ACTIVE', 'PAUSED'].includes(s.status))

    // Enrich with real-time participant counts
    return activeSessions.map((session) => ({
      id: session.id,
      sessionCode: session.sessionCode,
      pollId: session.pollId,
      status: session.status,
      participantCount: websocketService.getSessionConnectionCount(session.sessionCode) || session.currentParticipants,
      createdAt: session.createdAt,
    }))
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BROADCAST METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Broadcast vote update to all participants
   */
  broadcastVote(sessionCode: string, votes: Record<string, number>): void {
    websocketService.broadcastToSession(sessionCode, {
      type: 'VOTE_UPDATE',
      payload: { votes },
      timestamp: Date.now(),
    })
  }

  /**
   * Broadcast results to all participants
   */
  broadcastResults(sessionCode: string, results: { votes: Record<string, number>; totalVotes: number }): void {
    websocketService.broadcastToSession(sessionCode, {
      type: 'RESULTS_UPDATE',
      payload: results,
      timestamp: Date.now(),
    })
  }

  /**
   * Kick a participant from the session
   */
  async kickParticipant(sessionCode: string, hostId: string, participantId: string): Promise<void> {
    await this.verifyHost(sessionCode, hostId)

    websocketService.broadcastToSession(sessionCode, {
      type: 'PARTICIPANT_KICKED',
      payload: { participantId },
      timestamp: Date.now(),
    })
  }

  /**
   * Clear all votes for the current question
   */
  async clearVotes(sessionCode: string, hostId: string): Promise<void> {
    await this.verifyHost(sessionCode, hostId)

    const { getRedis } = await import('../lib/redis')
    const redis = getRedis()

    await redis.del(`live:${sessionCode}:votes`)

    const votedKeys = await redis.keys(`live:${sessionCode}:voted:*`)
    if (votedKeys.length > 0) {
      await redis.del(...votedKeys)
    }

    websocketService.broadcastToSession(sessionCode, {
      type: 'VOTES_CLEARED',
      payload: { votes: {} },
      timestamp: Date.now(),
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Verify user is the host of the session
   */
  private async verifyHost(sessionCode: string, hostId: string) {
    const sessionResult = await db
      .select()
      .from(livePollSessions)
      .where(eq(livePollSessions.sessionCode, sessionCode))
      .limit(1)

    const session = sessionResult[0]

    if (!session) {
      throw ApiError.notFound('Session not found', 'SESSION_NOT_FOUND')
    }

    if (session.hostId !== hostId) {
      throw ApiError.forbidden('Only the host can perform this action', 'NOT_HOST')
    }

    return session
  }
}

// Export singleton
export const livePollService = new LivePollServiceClass()
