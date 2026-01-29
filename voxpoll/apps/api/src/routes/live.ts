// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - LIVE POLL ROUTES
// Real-time live polling with 6-character join codes
// Per bible spec: No auth required for joining, 10K max participants
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { auth, optionalAuth } from '../middleware/auth'
import { rateLimit, RATE_LIMITS } from '../middleware/rate-limit'
import { livePollService } from '../services/livepoll.service'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Validators
// ─────────────────────────────────────────────────────────────────────────────

const createSessionSchema = z.object({
  pollId: z.string().min(1, 'Poll ID is required'),
})

const joinSessionSchema = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
})

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

export const liveRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// POST /live/sessions - Create a new live session (Authenticated)
// ─────────────────────────────────────────────────────────────────────────────

liveRoutes.post(
  '/sessions',
  auth,
  rateLimit(RATE_LIMITS.livePollCreate),
  zValidator('json', createSessionSchema),
  async (c) => {
    const userId = c.get('userId')!
    const { pollId } = c.req.valid('json')

    const result = await livePollService.createSession(pollId, userId)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// POST /live/sessions/:code/join - Join a session (NO AUTH REQUIRED)
// ─────────────────────────────────────────────────────────────────────────────

liveRoutes.post(
  '/sessions/:code/join',
  optionalAuth,
  rateLimit(RATE_LIMITS.livePollJoin),
  zValidator('json', joinSessionSchema),
  async (c) => {
    const code = c.req.param('code').toUpperCase()
    const userId = c.get('userId') // May be undefined for anonymous
    const { participantId } = c.req.valid('json')

    const result = await livePollService.joinSession(code, participantId, userId)

    return c.json({
      success: true,
      data: result,
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// GET /live/sessions/:code - Get session status
// ─────────────────────────────────────────────────────────────────────────────

liveRoutes.get('/sessions/:code', async (c) => {
  const code = c.req.param('code').toUpperCase()

  const result = await livePollService.getSessionStatus(code)

  return c.json({
    success: true,
    data: result,
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /live/sessions/:code/start - Start the session (Host only)
// ─────────────────────────────────────────────────────────────────────────────

liveRoutes.post('/sessions/:code/start', auth, async (c) => {
  const code = c.req.param('code').toUpperCase()
  const userId = c.get('userId')!

  await livePollService.startSession(code, userId)

  return c.json({
    success: true,
    message: 'Session started',
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /live/sessions/:code/pause - Pause the session (Host only)
// ─────────────────────────────────────────────────────────────────────────────

liveRoutes.post('/sessions/:code/pause', auth, async (c) => {
  const code = c.req.param('code').toUpperCase()
  const userId = c.get('userId')!

  await livePollService.pauseSession(code, userId)

  return c.json({
    success: true,
    message: 'Session paused',
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /live/sessions/:code/resume - Resume the session (Host only)
// ─────────────────────────────────────────────────────────────────────────────

liveRoutes.post('/sessions/:code/resume', auth, async (c) => {
  const code = c.req.param('code').toUpperCase()
  const userId = c.get('userId')!

  await livePollService.resumeSession(code, userId)

  return c.json({
    success: true,
    message: 'Session resumed',
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /live/sessions/:code/end - End the session (Host only)
// ─────────────────────────────────────────────────────────────────────────────

liveRoutes.post('/sessions/:code/end', auth, async (c) => {
  const code = c.req.param('code').toUpperCase()
  const userId = c.get('userId')!

  await livePollService.endSession(code, userId)

  return c.json({
    success: true,
    message: 'Session ended',
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /live/my-sessions - Get host's active sessions (Authenticated)
// ─────────────────────────────────────────────────────────────────────────────

liveRoutes.get('/my-sessions', auth, async (c) => {
  const userId = c.get('userId')!

  const sessions = await livePollService.getHostSessions(userId)

  return c.json({
    success: true,
    data: sessions,
  })
})
