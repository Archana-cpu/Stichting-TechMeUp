// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUTH MIDDLEWARE
// ══════════════════════════════════════════════════════════════════════════════

import { createMiddleware } from 'hono/factory'
import { db, sessions, users, eq, and, gt } from '@voxpoll/database'
import { ApiError } from './error-handler'
import { hashToken } from '../lib/hash'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Auth Middleware - Validates session and attaches user
// SECURITY: Uses tokenHash for lookups - never stores/queries plain tokens
// ─────────────────────────────────────────────────────────────────────────────

export const auth = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or invalid authorization header')
  }

  const token = authHeader.slice(7)

  if (!token) {
    throw ApiError.unauthorized('Missing token')
  }

  // SECURITY: Hash the token before lookup to prevent plain text token exposure
  const tokenHash = hashToken(token)

  // Find valid session using hash (indexed for performance)
  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date()),
        eq(sessions.isRevoked, false)
      )
    )
    .limit(1)

  const session = result[0]

  if (!session) {
    throw ApiError.unauthorized('Invalid or expired session')
  }

  // Check user status
  if (session.user.status !== 'ACTIVE') {
    throw ApiError.forbidden(`Account is ${session.user.status.toLowerCase()}`)
  }

  // Attach user to context
  c.set('user', session.user)
  c.set('userId', session.user.id)

  await next()
})

// ─────────────────────────────────────────────────────────────────────────────
// Optional Auth - Attaches user if token present, but doesn't require it
// ─────────────────────────────────────────────────────────────────────────────

export const optionalAuth = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)

    if (token) {
      // SECURITY: Hash token before lookup
      const tokenHash = hashToken(token)

      const result = await db
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(
          and(
            eq(sessions.tokenHash, tokenHash),
            gt(sessions.expiresAt, new Date()),
            eq(sessions.isRevoked, false)
          )
        )
        .limit(1)

      const session = result[0]

      if (session && session.user.status === 'ACTIVE') {
        c.set('user', session.user)
        c.set('userId', session.user.id)
      }
    }
  }

  await next()
})

// ─────────────────────────────────────────────────────────────────────────────
// Require Verified Email
// ─────────────────────────────────────────────────────────────────────────────

export const requireVerified = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user')

  if (!user) {
    throw ApiError.unauthorized('Authentication required')
  }

  if (!user.emailVerified) {
    throw ApiError.forbidden('Email verification required', 'EMAIL_NOT_VERIFIED')
  }

  await next()
})
