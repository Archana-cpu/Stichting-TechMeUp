// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - WEBSOCKET SERVICE
// Real-time communication for live polls
// Per bible spec: 10K max concurrent participants per session
// ══════════════════════════════════════════════════════════════════════════════

import { WebSocketServer, WebSocket } from 'ws'
import type { Server as HTTPServer } from 'http'
import { getRedis } from '../lib/redis'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WSConnection {
  ws: WebSocket
  sessionCode: string
  participantId: string
  isHost: boolean
  userId?: string
  connectedAt: Date
}

export interface WSMessage {
  type: string
  payload?: unknown
  timestamp?: number
}

export interface SessionState {
  sessionCode: string
  pollId: string
  hostId: string
  status: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'ENDED'
  currentQuestionIndex: number
  participantCount: number
  votes: Record<string, number>
  startedAt?: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_PARTICIPANTS_PER_SESSION = 10000
const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const SESSION_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No ambiguous chars (I,O,0,1,L)

// ─────────────────────────────────────────────────────────────────────────────
// WebSocket Service Class
// ─────────────────────────────────────────────────────────────────────────────

class WebSocketServiceClass {
  private wss: WebSocketServer | null = null
  private connections: Map<string, Set<WSConnection>> = new Map() // sessionCode -> connections
  private connectionToSession: Map<WebSocket, string> = new Map() // ws -> sessionCode
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map()

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize WebSocket server attached to HTTP server
   */
  initialize(server: HTTPServer): void {
    if (this.wss) {
      console.warn('[WebSocket] Already initialized')
      return
    }

    this.wss = new WebSocketServer({
      server,
      path: '/ws',
      maxPayload: 64 * 1024, // 64KB max message size
    })

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req)
    })

    this.wss.on('error', (error) => {
      console.error('[WebSocket] Server error:', error)
    })

    console.log('[WebSocket] Server initialized on /ws')
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, req: { url?: string }): void {
    // Parse session code from URL query params
    const url = new URL(req.url || '', 'ws://localhost')
    const sessionCode = url.searchParams.get('session')

    if (!sessionCode) {
      ws.close(4000, 'Missing session code')
      return
    }

    // Store connection temporarily until JOIN message
    ws.on('message', (data) => this.handleMessage(ws, data, sessionCode))
    ws.on('close', () => this.handleDisconnect(ws))
    ws.on('error', (error) => {
      console.error('[WebSocket] Connection error:', error)
      this.handleDisconnect(ws)
    })

    // Send welcome message
    this.sendToConnection(ws, {
      type: 'CONNECTED',
      payload: { sessionCode },
      timestamp: Date.now(),
    })
  }

  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(ws: WebSocket, data: Buffer | ArrayBuffer | Buffer[], sessionCode: string): Promise<void> {
    try {
      const message: WSMessage = JSON.parse(data.toString())

      switch (message.type) {
        case 'JOIN':
          await this.handleJoin(ws, sessionCode, message.payload as { participantId: string; userId?: string; isHost?: boolean })
          break
        case 'VOTE':
          await this.handleVote(ws, sessionCode, message.payload as { optionId: string })
          break
        case 'HOST_ACTION':
          await this.handleHostAction(ws, sessionCode, message.payload as { action: string; data?: unknown })
          break
        case 'PING':
          this.sendToConnection(ws, { type: 'PONG', timestamp: Date.now() })
          break
        default:
          console.warn('[WebSocket] Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('[WebSocket] Error handling message:', error)
      this.sendToConnection(ws, {
        type: 'ERROR',
        payload: { message: 'Invalid message format' },
      })
    }
  }

  /**
   * Handle participant joining a session
   */
  private async handleJoin(
    ws: WebSocket,
    sessionCode: string,
    payload: { participantId: string; userId?: string; isHost?: boolean }
  ): Promise<void> {
    const { participantId, userId, isHost = false } = payload

    // Check session exists and is joinable
    const sessionState = await this.getSessionState(sessionCode)
    if (!sessionState) {
      this.sendToConnection(ws, {
        type: 'ERROR',
        payload: { code: 'SESSION_NOT_FOUND', message: 'Session not found' },
      })
      ws.close(4004, 'Session not found')
      return
    }

    if (sessionState.status === 'ENDED') {
      this.sendToConnection(ws, {
        type: 'ERROR',
        payload: { code: 'SESSION_ENDED', message: 'Session has ended' },
      })
      ws.close(4001, 'Session ended')
      return
    }

    // Check capacity
    const currentConnections = this.connections.get(sessionCode)?.size || 0
    if (currentConnections >= MAX_PARTICIPANTS_PER_SESSION && !isHost) {
      this.sendToConnection(ws, {
        type: 'ERROR',
        payload: { code: 'SESSION_FULL', message: 'Session is at capacity' },
      })
      ws.close(4002, 'Session full')
      return
    }

    // Create connection record
    const connection: WSConnection = {
      ws,
      sessionCode,
      participantId,
      isHost,
      userId,
      connectedAt: new Date(),
    }

    // Add to session connections
    if (!this.connections.has(sessionCode)) {
      this.connections.set(sessionCode, new Set())
    }
    this.connections.get(sessionCode)!.add(connection)
    this.connectionToSession.set(ws, sessionCode)

    // Update participant count in Redis
    const redis = getRedis()
    await redis.incr(`live:${sessionCode}:participants`)

    // Send current state to new participant
    this.sendToConnection(ws, {
      type: 'JOINED',
      payload: {
        sessionCode,
        status: sessionState.status,
        currentQuestionIndex: sessionState.currentQuestionIndex,
        participantCount: currentConnections + 1,
        votes: sessionState.votes,
      },
      timestamp: Date.now(),
    })

    // Broadcast participant count update to all
    this.broadcastToSession(sessionCode, {
      type: 'PARTICIPANT_COUNT',
      payload: { count: currentConnections + 1 },
      timestamp: Date.now(),
    })

    console.log(`[WebSocket] Participant ${participantId} joined session ${sessionCode}`)
  }

  /**
   * Handle vote submission
   */
  private async handleVote(
    ws: WebSocket,
    sessionCode: string,
    payload: { optionId: string }
  ): Promise<void> {
    const connection = this.findConnection(ws)
    if (!connection) {
      this.sendToConnection(ws, {
        type: 'ERROR',
        payload: { code: 'NOT_JOINED', message: 'You must join the session first' },
      })
      return
    }

    const sessionState = await this.getSessionState(sessionCode)
    if (!sessionState || sessionState.status !== 'ACTIVE') {
      this.sendToConnection(ws, {
        type: 'ERROR',
        payload: { code: 'SESSION_NOT_ACTIVE', message: 'Session is not active' },
      })
      return
    }

    // Check if already voted
    const redis = getRedis()
    const voteKey = `live:${sessionCode}:voted:${connection.participantId}`
    const hasVoted = await redis.exists(voteKey)
    if (hasVoted) {
      this.sendToConnection(ws, {
        type: 'ERROR',
        payload: { code: 'ALREADY_VOTED', message: 'You have already voted' },
      })
      return
    }

    // Record vote
    await redis.set(voteKey, payload.optionId, 'EX', 86400) // Expires in 24 hours
    await redis.hincrby(`live:${sessionCode}:votes`, payload.optionId, 1)

    // Get updated vote counts
    const votes = await redis.hgetall(`live:${sessionCode}:votes`)
    const voteNumbers: Record<string, number> = {}
    for (const [key, value] of Object.entries(votes)) {
      voteNumbers[key] = parseInt(value, 10)
    }

    // Broadcast vote update to all participants
    this.broadcastToSession(sessionCode, {
      type: 'VOTE_UPDATE',
      payload: { votes: voteNumbers },
      timestamp: Date.now(),
    })

    // Confirm vote to sender
    this.sendToConnection(ws, {
      type: 'VOTE_CONFIRMED',
      payload: { optionId: payload.optionId },
      timestamp: Date.now(),
    })
  }

  /**
   * Handle host actions (start, pause, resume, next question, end)
   */
  private async handleHostAction(
    ws: WebSocket,
    sessionCode: string,
    payload: { action: string; data?: unknown }
  ): Promise<void> {
    const connection = this.findConnection(ws)
    if (!connection || !connection.isHost) {
      this.sendToConnection(ws, {
        type: 'ERROR',
        payload: { code: 'NOT_HOST', message: 'Only the host can perform this action' },
      })
      return
    }

    const redis = getRedis()
    const stateKey = `live:${sessionCode}:state`

    switch (payload.action) {
      case 'START':
        await redis.hset(stateKey, 'status', 'ACTIVE', 'startedAt', Date.now().toString())
        this.broadcastToSession(sessionCode, {
          type: 'SESSION_STARTED',
          timestamp: Date.now(),
        })
        break

      case 'PAUSE':
        await redis.hset(stateKey, 'status', 'PAUSED')
        this.broadcastToSession(sessionCode, {
          type: 'SESSION_PAUSED',
          timestamp: Date.now(),
        })
        break

      case 'RESUME':
        await redis.hset(stateKey, 'status', 'ACTIVE')
        this.broadcastToSession(sessionCode, {
          type: 'SESSION_RESUMED',
          timestamp: Date.now(),
        })
        break

      case 'NEXT_QUESTION':
        const currentIndex = parseInt(await redis.hget(stateKey, 'currentQuestionIndex') || '0', 10)
        await redis.hset(stateKey, 'currentQuestionIndex', (currentIndex + 1).toString())
        // Clear votes for new question
        await redis.del(`live:${sessionCode}:votes`)
        // Clear voted markers
        const votedKeys = await redis.keys(`live:${sessionCode}:voted:*`)
        if (votedKeys.length > 0) {
          await redis.del(...votedKeys)
        }
        this.broadcastToSession(sessionCode, {
          type: 'NEXT_QUESTION',
          payload: { questionIndex: currentIndex + 1 },
          timestamp: Date.now(),
        })
        break

      case 'END':
        await redis.hset(stateKey, 'status', 'ENDED', 'endedAt', Date.now().toString())
        const finalVotes = await redis.hgetall(`live:${sessionCode}:votes`)
        this.broadcastToSession(sessionCode, {
          type: 'SESSION_ENDED',
          payload: { finalVotes },
          timestamp: Date.now(),
        })
        // Schedule cleanup after 5 minutes
        setTimeout(() => this.cleanupSession(sessionCode), 5 * 60 * 1000)
        break

      default:
        this.sendToConnection(ws, {
          type: 'ERROR',
          payload: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${payload.action}` },
        })
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  private async handleDisconnect(ws: WebSocket): Promise<void> {
    const sessionCode = this.connectionToSession.get(ws)
    if (!sessionCode) return

    const sessionConnections = this.connections.get(sessionCode)
    if (sessionConnections) {
      // Find and remove the connection
      for (const conn of sessionConnections) {
        if (conn.ws === ws) {
          sessionConnections.delete(conn)
          console.log(`[WebSocket] Participant ${conn.participantId} disconnected from ${sessionCode}`)
          break
        }
      }

      // Update participant count
      const redis = getRedis()
      await redis.decr(`live:${sessionCode}:participants`)

      // Broadcast updated count
      this.broadcastToSession(sessionCode, {
        type: 'PARTICIPANT_COUNT',
        payload: { count: sessionConnections.size },
        timestamp: Date.now(),
      })

      // Clean up if no connections left
      if (sessionConnections.size === 0) {
        this.connections.delete(sessionCode)
      }
    }

    this.connectionToSession.delete(ws)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate a unique 6-character session code
   */
  generateSessionCode(): string {
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += SESSION_CODE_CHARS[Math.floor(Math.random() * SESSION_CODE_CHARS.length)]
    }
    return code
  }

  /**
   * Create a new live session state in Redis
   */
  async createSession(sessionCode: string, pollId: string, hostId: string): Promise<void> {
    const redis = getRedis()
    const stateKey = `live:${sessionCode}:state`

    await redis.hmset(stateKey, {
      sessionCode,
      pollId,
      hostId,
      status: 'WAITING',
      currentQuestionIndex: '0',
      createdAt: Date.now().toString(),
    })

    // Session expires after 24 hours
    await redis.expire(stateKey, 86400)
  }

  /**
   * Get session state from Redis
   */
  async getSessionState(sessionCode: string): Promise<SessionState | null> {
    const redis = getRedis()
    const stateKey = `live:${sessionCode}:state`

    const state = await redis.hgetall(stateKey)
    if (!state || !state['sessionCode']) return null

    const votes = await redis.hgetall(`live:${sessionCode}:votes`) || {}
    const voteNumbers: Record<string, number> = {}
    for (const [key, value] of Object.entries(votes)) {
      voteNumbers[key] = parseInt(value, 10)
    }

    return {
      sessionCode: state['sessionCode'] ?? sessionCode,
      pollId: state['pollId'] ?? '',
      hostId: state['hostId'] ?? '',
      status: state['status'] as SessionState['status'],
      currentQuestionIndex: parseInt(state['currentQuestionIndex'] || '0', 10),
      participantCount: parseInt(await redis.get(`live:${sessionCode}:participants`) || '0', 10),
      votes: voteNumbers,
      startedAt: state['startedAt'] ? new Date(parseInt(state['startedAt'], 10)) : undefined,
    }
  }

  /**
   * Broadcast message to all connections in a session
   */
  broadcastToSession(sessionCode: string, message: WSMessage): void {
    const sessionConnections = this.connections.get(sessionCode)
    if (!sessionConnections) return

    const data = JSON.stringify(message)
    for (const conn of sessionConnections) {
      if (conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(data)
      }
    }
  }

  /**
   * Send message to a specific connection
   */
  private sendToConnection(ws: WebSocket, message: WSMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  /**
   * Find connection by WebSocket
   */
  private findConnection(ws: WebSocket): WSConnection | undefined {
    const sessionCode = this.connectionToSession.get(ws)
    if (!sessionCode) return undefined

    const sessionConnections = this.connections.get(sessionCode)
    if (!sessionConnections) return undefined

    for (const conn of sessionConnections) {
      if (conn.ws === ws) return conn
    }

    return undefined
  }

  /**
   * Clean up session data from Redis
   */
  private async cleanupSession(sessionCode: string): Promise<void> {
    const redis = getRedis()

    // Close all connections
    const sessionConnections = this.connections.get(sessionCode)
    if (sessionConnections) {
      for (const conn of sessionConnections) {
        conn.ws.close(1000, 'Session cleaned up')
      }
      this.connections.delete(sessionCode)
    }

    // Clean up Redis keys
    const keys = await redis.keys(`live:${sessionCode}:*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }

    console.log(`[WebSocket] Session ${sessionCode} cleaned up`)
  }

  /**
   * Get connection count for a session
   */
  getSessionConnectionCount(sessionCode: string): number {
    return this.connections.get(sessionCode)?.size || 0
  }

  /**
   * Shutdown WebSocket server
   */
  shutdown(): void {
    if (this.wss) {
      this.wss.close()
      this.wss = null
      this.connections.clear()
      this.connectionToSession.clear()
      console.log('[WebSocket] Server shut down')
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL POLL EVENTS (for non-live polls)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Broadcast poll vote update to all subscribers
   */
  broadcastPollVote(pollId: string, voteData: {
    optionId: string
    optionVotes: number
    totalVotes: number
  }): void {
    this.broadcastToChannel(`poll:${pollId}`, {
      type: 'POLL_VOTE',
      payload: voteData,
      timestamp: Date.now(),
    })
  }

  /**
   * Broadcast new comment to poll/survey/test subscribers
   */
  broadcastComment(contentType: 'poll' | 'survey' | 'test', contentId: string, comment: {
    id: string
    content: string
    authorId: string
    authorName: string
    createdAt: Date
  }): void {
    this.broadcastToChannel(`${contentType}:${contentId}:comments`, {
      type: 'NEW_COMMENT',
      payload: comment,
      timestamp: Date.now(),
    })
  }

  /**
   * Broadcast poll results update
   */
  broadcastPollResults(pollId: string, results: {
    options: Array<{ id: string; text: string; voteCount: number; percentage: number }>
    totalVotes: number
  }): void {
    this.broadcastToChannel(`poll:${pollId}:results`, {
      type: 'RESULTS_UPDATE',
      payload: results,
      timestamp: Date.now(),
    })
  }

  /**
   * Broadcast notification to user
   */
  broadcastNotification(userId: string, notification: {
    id: string
    type: string
    title: string
    message: string
    data?: unknown
  }): void {
    this.broadcastToChannel(`user:${userId}:notifications`, {
      type: 'NOTIFICATION',
      payload: notification,
      timestamp: Date.now(),
    })
  }

  /**
   * Broadcast to Redis channel (for cross-server communication)
   */
  private broadcastToChannel(channel: string, message: WSMessage): void {
    const redis = getRedis()
    redis.publish(channel, JSON.stringify(message)).catch((err) => {
      console.error('[WebSocket] Failed to publish to channel:', err)
    })
  }

  /**
   * Subscribe to Redis channel for incoming messages
   */
  async subscribeToChannel(channel: string): Promise<void> {
    const redis = getRedis()
    const subscriber = redis.duplicate()

    await subscriber.subscribe(channel, (err) => {
      if (err) {
        console.error('[WebSocket] Failed to subscribe to channel:', err)
      }
    })

    subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        try {
          const message = JSON.parse(msg)
          this.broadcastToSession(channel, message)
        } catch {
          console.error('[WebSocket] Failed to parse channel message')
        }
      }
    })
  }
}

// Export singleton
export const websocketService = new WebSocketServiceClass()
