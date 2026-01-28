// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - MAIN HONO APPLICATION
// Best Practice: Layered middleware with proper ordering
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { timeout } from 'hono/timeout'

import { errorHandler } from './middleware/error-handler'
import { requestId, requestLogger } from './middleware/request-logger'
import { rateLimit, RATE_LIMITS } from './middleware/rate-limit'
import { authRoutes } from './routes/auth'
import { oauthRoutes } from './routes/oauth'
import { healthRoutes } from './routes/health'
import { pollRoutes } from './routes/polls'
import { userRoutes } from './routes/users'
import { surveyRoutes } from './routes/surveys'
import { testRoutes } from './routes/tests'
import { commentRoutes } from './routes/comments'
import { notificationRoutes } from './routes/notifications'
import { gamificationRoutes } from './routes/gamification'
import { organizationRoutes } from './routes/organizations'
import { paymentRoutes } from './routes/payments'
import { moderationRoutes } from './routes/moderation'
import { categoryRoutes } from './routes/categories'
import { statsRoutes } from './routes/stats'
import { liveRoutes } from './routes/live'
import { uploadRoutes } from './routes/uploads'
import { searchRoutes } from './routes/search'
import { feedRoutes } from './routes/feed'
import { contentApprovalRoutes } from './routes/content-approval'
import { appealRoutes } from './routes/appeals'
import { auditLogRoutes } from './routes/audit-logs'
import { shareRoutes } from './routes/share'
import { templateRoutes } from './routes/templates'
import { analyticsRoutes } from './routes/analytics'
import { exportRoutes } from './routes/exports'
import { setupOpenAPI } from './lib/openapi'
import { logger } from './lib/logger'

import type { AppEnv } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Create Hono App
// ─────────────────────────────────────────────────────────────────────────────

const app = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Global Middleware (Order matters!)
// 1. Request ID (first, for tracing)
// 2. Security headers
// 3. CORS
// 4. Timeout
// 5. Logging (last, to capture response)
// ─────────────────────────────────────────────────────────────────────────────

// 1. Request ID - Must be first for tracing
app.use('*', requestId)

// 2. Security headers
app.use('*', secureHeaders({
  // Content Security Policy
  contentSecurityPolicy: process.env['NODE_ENV'] === 'production' ? {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
  } : undefined,
  // Strict Transport Security (HTTPS only)
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  // Prevent clickjacking
  xFrameOptions: 'DENY',
  // Prevent MIME sniffing
  xContentTypeOptions: 'nosniff',
  // Referrer policy
  referrerPolicy: 'strict-origin-when-cross-origin',
}))

// 3. CORS - Production-safe configuration
app.use('*', cors({
  origin: (origin) => {
    // Development: allow all localhost origins
    if (process.env['NODE_ENV'] === 'development') {
      if (!origin) return '*' // Allow no-origin requests (Postman, curl)
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return origin
      }
    }

    // Production: strict origin checking
    const allowedOrigins = (process.env['ALLOWED_ORIGINS'] || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)

    // Check exact match or wildcard subdomain
    for (const allowed of allowedOrigins) {
      if (allowed === origin) return origin
      if (allowed.startsWith('*.')) {
        const domain = allowed.slice(2)
        if (origin.endsWith(domain)) return origin
      }
    }

    return null // Reject
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Requested-With',
  ],
  exposeHeaders: [
    'X-Request-ID',
    'X-Response-Time',
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours preflight cache
}))

// 4. Timeout - Prevent hanging requests
app.use('*', timeout(30000)) // 30 second timeout

// 5. Request logging - After other middleware to capture full context
app.use('*', requestLogger)

// ─────────────────────────────────────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────────────────────────────────────

app.onError(errorHandler)

// ─────────────────────────────────────────────────────────────────────────────
// API Routes (v1)
// ─────────────────────────────────────────────────────────────────────────────

const v1 = new Hono<AppEnv>()

// Apply general rate limit to all v1 routes
v1.use('*', rateLimit(RATE_LIMITS.api))

// Mount route handlers
v1.route('/health', healthRoutes)
v1.route('/auth', authRoutes)
v1.route('/auth/oauth', oauthRoutes)
v1.route('/users', userRoutes)
v1.route('/polls', pollRoutes)
v1.route('/surveys', surveyRoutes)
v1.route('/tests', testRoutes)
v1.route('/discussions', commentRoutes)
v1.route('/notifications', notificationRoutes)
v1.route('/gamification', gamificationRoutes)
v1.route('/organizations', organizationRoutes)
v1.route('/payments', paymentRoutes)
v1.route('/moderation', moderationRoutes)
v1.route('/categories', categoryRoutes)
v1.route('/stats', statsRoutes)
v1.route('/live', liveRoutes)
v1.route('/uploads', uploadRoutes)
v1.route('/search', searchRoutes)
v1.route('/feed', feedRoutes)
v1.route('/content-approvals', contentApprovalRoutes)
v1.route('/appeals', appealRoutes)
v1.route('/audit-logs', auditLogRoutes)
v1.route('/share', shareRoutes)
v1.route('/templates', templateRoutes)
v1.route('/analytics', analyticsRoutes)
v1.route('/exports', exportRoutes)

// Mount v1 under /api/v1
app.route('/api/v1', v1)

// ─────────────────────────────────────────────────────────────────────────────
// OpenAPI Documentation
// ─────────────────────────────────────────────────────────────────────────────

setupOpenAPI(app)
logger.info('OpenAPI documentation available at /api/docs')

// ─────────────────────────────────────────────────────────────────────────────
// Root & Fallback Routes
// ─────────────────────────────────────────────────────────────────────────────

// Root - API info
app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      name: 'VoxPoll API',
      version: '1.0.0',
      documentation: '/api/docs',
      openapi: '/api/openapi.json',
      endpoints: {
        health: '/api/v1/health',
        auth: '/api/v1/auth',
        oauth: '/api/v1/auth/oauth',
        users: '/api/v1/users',
        polls: '/api/v1/polls',
        surveys: '/api/v1/surveys',
        tests: '/api/v1/tests',
        discussions: '/api/v1/discussions',
        notifications: '/api/v1/notifications',
        gamification: '/api/v1/gamification',
        organizations: '/api/v1/organizations',
        payments: '/api/v1/payments',
        moderation: '/api/v1/moderation',
        categories: '/api/v1/categories',
        stats: '/api/v1/stats',
        live: '/api/v1/live',
        uploads: '/api/v1/uploads',
        search: '/api/v1/search',
        feed: '/api/v1/feed',
        contentApprovals: '/api/v1/content-approvals',
        appeals: '/api/v1/appeals',
        auditLogs: '/api/v1/audit-logs',
        share: '/api/v1/share',
        templates: '/api/v1/templates',
        analytics: '/api/v1/analytics',
        exports: '/api/v1/exports',
        websocket: '/ws',
      },
    },
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
  }, 404)
})

export default app
export { app }
export type { AppEnv }
