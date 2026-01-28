// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - STRUCTURED REQUEST LOGGING MIDDLEWARE
// Best Practice: Structured JSON logs with pino for observability
// ══════════════════════════════════════════════════════════════════════════════

import { createMiddleware } from 'hono/factory'
import { v4 as uuidv4 } from 'uuid'
import { logger, logResponse, type RequestLogContext } from '../lib/logger'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Logger Configuration
// ─────────────────────────────────────────────────────────────────────────────

const LOG_CONFIG = {
  // Skip logging for these paths (health checks, etc.)
  skipPaths: ['/api/v1/health/live', '/favicon.ico'],

  // Minimum duration to log (ms) - skip fast requests in production
  minDuration: process.env['NODE_ENV'] === 'production' ? 100 : 0,
}

// ─────────────────────────────────────────────────────────────────────────────
// Request ID Middleware
// Generates or uses existing X-Request-ID header
// ─────────────────────────────────────────────────────────────────────────────

export const requestId = createMiddleware<AppEnv>(async (c, next) => {
  // Use existing request ID or generate new one
  const existingId = c.req.header('x-request-id')
  const id = existingId || uuidv4()

  // Store in context for other middleware/handlers
  c.set('requestId', id)

  // Add to response headers
  c.header('X-Request-ID', id)

  await next()
})

// ─────────────────────────────────────────────────────────────────────────────
// Request Logger Middleware
// ─────────────────────────────────────────────────────────────────────────────

export const requestLogger = createMiddleware<AppEnv>(async (c, next) => {
  const startTime = Date.now()
  const path = c.req.path

  // Skip logging for certain paths
  if (LOG_CONFIG.skipPaths.some((p) => path.startsWith(p))) {
    await next()
    return
  }

  // Get request info
  const requestId = c.get('requestId') || 'unknown'
  const method = c.req.method
  const ip =
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown'

  const logContext: RequestLogContext = {
    requestId,
    method,
    path,
    ip,
    userAgent: c.req.header('user-agent'),
  }

  let responseStatus = 200
  let error: Error | undefined

  try {
    await next()
    responseStatus = c.res.status
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err))
    responseStatus = 500
    throw err
  } finally {
    const duration = Date.now() - startTime

    // Add response time header
    c.header('X-Response-Time', `${duration}ms`)

    // Skip logging if duration is below threshold and no error
    if (duration < LOG_CONFIG.minDuration && !error) {
      return
    }

    // Add user ID if authenticated
    const userId = c.get('userId')
    if (userId) {
      logContext.userId = userId
    }

    // Log the response
    if (error) {
      logger.error(
        {
          ...logContext,
          err: error,
          statusCode: responseStatus,
          durationMs: duration,
          type: 'request',
        },
        `${method} ${path} ${responseStatus} ${duration}ms`
      )
    } else {
      logResponse(logContext, responseStatus, duration)
    }
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Re-export logger for convenience
// ─────────────────────────────────────────────────────────────────────────────

export { logger, logResponse }
