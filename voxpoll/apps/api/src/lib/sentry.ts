// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SENTRY ERROR TRACKING
// Production-ready error monitoring and performance tracking
// ══════════════════════════════════════════════════════════════════════════════

import * as Sentry from '@sentry/node'
import { logger } from './logger'

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const SENTRY_DSN = process.env['SENTRY_DSN']
const isProduction = process.env['NODE_ENV'] === 'production'
const isEnabled = !!SENTRY_DSN

// ─────────────────────────────────────────────────────────────────────────────
// Initialize Sentry
// ─────────────────────────────────────────────────────────────────────────────

export function initSentry(): void {
  if (!isEnabled) {
    logger.info('[Sentry] Disabled - no SENTRY_DSN configured')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env['NODE_ENV'] || 'development',
    release: `voxpoll-api@${process.env['npm_package_version'] || '1.0.0'}`,

    // Performance monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in prod, 100% in dev
    profilesSampleRate: isProduction ? 0.1 : 1.0,

    // Error filtering
    beforeSend(event, hint) {
      // Don't send expected errors
      const error = hint.originalException as Error | undefined
      if (error?.name === 'ApiError') {
        // Only send 5xx errors to Sentry
        const status = (error as Error & { status?: number }).status
        if (status && status < 500) {
          return null
        }
      }

      // Redact sensitive data
      if (event.request?.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
      }

      return event
    },

    // Integrations
    integrations: [
      // Node-specific integrations
      Sentry.httpIntegration(),
      Sentry.onUncaughtExceptionIntegration(),
      Sentry.onUnhandledRejectionIntegration(),
    ],

    // Ignore common errors
    ignoreErrors: [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'Request aborted',
      'socket hang up',
    ],
  })

  logger.info('[Sentry] Initialized successfully')
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Capture Helpers
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorContext {
  userId?: string
  requestId?: string
  path?: string
  method?: string
  extra?: Record<string, unknown>
  tags?: Record<string, string>
}

export function captureError(error: Error, context?: ErrorContext): string | undefined {
  if (!isEnabled) {
    logger.error({ err: error, ...context }, 'Error captured (Sentry disabled)')
    return undefined
  }

  return Sentry.withScope((scope) => {
    // Set user context
    if (context?.userId) {
      scope.setUser({ id: context.userId })
    }

    // Set tags
    if (context?.tags) {
      for (const [key, value] of Object.entries(context.tags)) {
        scope.setTag(key, value)
      }
    }

    // Set request context
    if (context?.requestId) {
      scope.setTag('requestId', context.requestId)
    }
    if (context?.path) {
      scope.setTag('path', context.path)
    }
    if (context?.method) {
      scope.setTag('method', context.method)
    }

    // Set extra data
    if (context?.extra) {
      scope.setExtras(context.extra)
    }

    return Sentry.captureException(error)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Capture
// ─────────────────────────────────────────────────────────────────────────────

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: ErrorContext
): string | undefined {
  if (!isEnabled) {
    logger.info({ ...context }, message)
    return undefined
  }

  return Sentry.withScope((scope) => {
    if (context?.userId) {
      scope.setUser({ id: context.userId })
    }
    if (context?.tags) {
      for (const [key, value] of Object.entries(context.tags)) {
        scope.setTag(key, value)
      }
    }
    if (context?.extra) {
      scope.setExtras(context.extra)
    }

    return Sentry.captureMessage(message, level)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumbs
// ─────────────────────────────────────────────────────────────────────────────

export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info'
): void {
  if (!isEnabled) return

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction/Span Helpers (Performance Monitoring)
// ─────────────────────────────────────────────────────────────────────────────

export function startTransaction(
  name: string,
  op: string,
  data?: Record<string, string | number | boolean>
) {
  if (!isEnabled) {
    return {
      finish: () => {},
      setStatus: () => {},
      startChild: () => ({ finish: () => {} }),
    }
  }

  return Sentry.startInactiveSpan({
    name,
    op,
    attributes: data,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Flush (for graceful shutdown)
// ─────────────────────────────────────────────────────────────────────────────

export async function flushSentry(timeout = 2000): Promise<boolean> {
  if (!isEnabled) return true

  logger.info('[Sentry] Flushing pending events...')
  return Sentry.flush(timeout)
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-export Sentry for advanced usage
// ─────────────────────────────────────────────────────────────────────────────

export { Sentry }
export default Sentry
