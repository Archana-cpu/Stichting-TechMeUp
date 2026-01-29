// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - STRUCTURED LOGGER
// Production-ready logging with pino
// ══════════════════════════════════════════════════════════════════════════════

import pino from 'pino'

// ─────────────────────────────────────────────────────────────────────────────
// Environment Configuration
// ─────────────────────────────────────────────────────────────────────────────

const isProduction = process.env['NODE_ENV'] === 'production'
const logLevel = process.env['LOG_LEVEL'] || (isProduction ? 'info' : 'debug')

// ─────────────────────────────────────────────────────────────────────────────
// Logger Instance
// ─────────────────────────────────────────────────────────────────────────────

export const logger = pino({
  level: logLevel,

  // Base context included in every log
  base: {
    service: 'voxpoll-api',
    version: process.env['npm_package_version'] || '1.0.0',
    env: process.env['NODE_ENV'] || 'development',
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,

  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },

  // Serializers for common objects
  serializers: {
    err: pino.stdSerializers.err,
    req: (req) => ({
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      params: req.params,
      headers: {
        'user-agent': req.headers?.['user-agent'],
        'content-type': req.headers?.['content-type'],
        'x-request-id': req.headers?.['x-request-id'],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  // Pretty print in development
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname,service,version,env',
        },
      },
})

// ─────────────────────────────────────────────────────────────────────────────
// Child Loggers for Different Contexts
// ─────────────────────────────────────────────────────────────────────────────

export const createLogger = (context: string) => {
  return logger.child({ context })
}

// Pre-configured loggers for common contexts
export const authLogger = createLogger('auth')
export const dbLogger = createLogger('database')
export const cacheLogger = createLogger('cache')
export const paymentLogger = createLogger('payment')
export const wsLogger = createLogger('websocket')
export const pushLogger = createLogger('push')
export const emailLogger = createLogger('email')

// ─────────────────────────────────────────────────────────────────────────────
// Request Logging Helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface RequestLogContext {
  requestId: string
  method: string
  path: string
  userId?: string
  ip?: string
  userAgent?: string
}

export const logRequest = (ctx: RequestLogContext, message: string) => {
  logger.info({ ...ctx, type: 'request' }, message)
}

export const logResponse = (
  ctx: RequestLogContext,
  statusCode: number,
  durationMs: number
) => {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
  logger[level](
    { ...ctx, statusCode, durationMs, type: 'response' },
    `${ctx.method} ${ctx.path} ${statusCode} ${durationMs}ms`
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Logging Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const logError = (
  error: Error,
  context?: Record<string, unknown>
) => {
  logger.error({ err: error, ...context }, error.message)
}

export const logFatal = (
  error: Error,
  context?: Record<string, unknown>
) => {
  logger.fatal({ err: error, ...context }, error.message)
}

// ─────────────────────────────────────────────────────────────────────────────
// Business Event Logging
// ─────────────────────────────────────────────────────────────────────────────

export interface BusinessEvent {
  event: string
  userId?: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
}

export const logBusinessEvent = (event: BusinessEvent) => {
  logger.info({ type: 'business_event', ...event }, event.event)
}

// Common business events
export const BusinessEvents = {
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  PASSWORD_RESET: 'user.password_reset',

  POLL_CREATED: 'poll.created',
  POLL_PUBLISHED: 'poll.published',
  POLL_VOTED: 'poll.voted',
  POLL_CLOSED: 'poll.closed',

  SURVEY_CREATED: 'survey.created',
  SURVEY_COMPLETED: 'survey.completed',

  TEST_CREATED: 'test.created',
  TEST_COMPLETED: 'test.completed',

  SUBSCRIPTION_STARTED: 'subscription.started',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',

  ORG_CREATED: 'organization.created',
  ORG_MEMBER_ADDED: 'organization.member_added',
  ORG_MEMBER_REMOVED: 'organization.member_removed',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Metrics Logging (for external aggregation)
// ─────────────────────────────────────────────────────────────────────────────

export const logMetric = (
  name: string,
  value: number,
  tags?: Record<string, string>
) => {
  logger.info({ type: 'metric', metric: name, value, tags }, `metric:${name}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Export default logger
// ─────────────────────────────────────────────────────────────────────────────

export default logger
