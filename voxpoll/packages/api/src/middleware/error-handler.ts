// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ERROR HANDLER MIDDLEWARE
// [AUTHORITATIVE: bible-031 - Error Sanitization]
// ══════════════════════════════════════════════════════════════════════════════

import type { ErrorHandler } from 'hono'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Custom API Error Class
// ─────────────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: Record<string, unknown>) {
    return new ApiError(code, message, 400, details)
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new ApiError(code, message, 401)
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new ApiError(code, message, 403)
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(code, message, 404)
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new ApiError(code, message, 409)
  }

  static tooManyRequests(message = 'Too many requests', code = 'RATE_LIMIT_EXCEEDED') {
    return new ApiError(code, message, 429)
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new ApiError(code, message, 500)
  }

  static serviceUnavailable(message = 'Service unavailable', code = 'SERVICE_UNAVAILABLE') {
    return new ApiError(code, message, 503)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Handler [AUTHORITATIVE: bible-031 §31.2]
// - Never expose internal error details in production
// - Log full errors server-side
// - Return sanitized errors to client
// ─────────────────────────────────────────────────────────────────────────────

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  const requestId = c.get('requestId') || 'unknown'
  const isDev = process.env['NODE_ENV'] === 'development'

  // Log full error server-side
  console.error(`[${requestId}] Error:`, {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  })

  // Handle known API errors
  if (err instanceof ApiError) {
    return c.json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    }, err.statusCode as 400)
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return c.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: isDev ? (err as unknown as { errors: unknown }).errors : undefined,
      },
    }, 400)
  }

  // Handle PostgreSQL/Drizzle database errors
  const dbError = err as unknown as { code?: string; constraint?: string }
  if (dbError.code) {
    // Unique constraint violation (PostgreSQL error code 23505)
    if (dbError.code === '23505') {
      return c.json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'A record with this value already exists',
        },
      }, 409)
    }

    // Foreign key violation (PostgreSQL error code 23503)
    if (dbError.code === '23503') {
      return c.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Referenced record not found',
        },
      }, 404)
    }

    // Not null violation (PostgreSQL error code 23502)
    if (dbError.code === '23502') {
      return c.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Required field is missing',
        },
      }, 400)
    }
  }

  // Generic error - sanitize in production [bible-031 §31.2]
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev ? err.message : 'An unexpected error occurred',
      ...(isDev && { stack: err.stack }),
    },
  }, 500)
}
