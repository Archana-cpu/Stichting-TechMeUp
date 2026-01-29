// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - KUBERNETES-STYLE HEALTH CHECK ROUTES
// Best Practice: Separate liveness, readiness, and startup probes
// Reference: https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-setting-up-health-checks-with-readiness-and-liveness-probes
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { db, sql } from "@voxpoll/database"
import { pingRedis } from '../lib/redis'
import type { AppEnv } from '../types'

export const healthRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Health Check Types
// ─────────────────────────────────────────────────────────────────────────────

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency?: number
  error?: string
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  uptime: number
  checks?: Record<string, HealthCheck>
}

const startTime = Date.now()

// ─────────────────────────────────────────────────────────────────────────────
// GET /health - Basic Health Check (Default)
// Use for: Quick status check, load balancer health
// ─────────────────────────────────────────────────────────────────────────────

healthRoutes.get('/', (c) => {
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
  }

  return c.json({
    success: true,
    data: response,
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /health/live - Liveness Probe (Kubernetes)
// Purpose: Check if the application is running (not deadlocked)
// If fails: Kubernetes will RESTART the container
// Best Practice: Keep lightweight, don't check external dependencies
// Reference: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
// ─────────────────────────────────────────────────────────────────────────────

healthRoutes.get('/live', (c) => {
  // Liveness should only check if the process is running
  // Don't check external dependencies (DB, Redis) here
  // Those belong in readiness probe
  return c.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /health/ready - Readiness Probe (Kubernetes)
// Purpose: Check if the application can handle traffic
// If fails: Kubernetes will REMOVE from service endpoints (no traffic)
// Best Practice: Check all critical dependencies
// Reference: https://betterstack.com/community/guides/monitoring/kubernetes-health-checks/
// ─────────────────────────────────────────────────────────────────────────────

healthRoutes.get('/ready', async (c) => {
  const checks: Record<string, HealthCheck> = {}
  let allHealthy = true

  // Check database connection
  const dbStart = Date.now()
  try {
    await db.execute(sql`SELECT 1`)
    checks['database'] = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    }
  } catch (err) {
    allHealthy = false
    checks['database'] = {
      status: 'unhealthy',
      latency: Date.now() - dbStart,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }

  // Check Redis connection
  const redisResult = await pingRedis()
  if (redisResult.ok) {
    checks['redis'] = {
      status: 'healthy',
      latency: redisResult.latency,
    }
  } else {
    // Redis failure is degraded, not unhealthy (we can operate without it)
    checks['redis'] = {
      status: 'degraded',
      latency: redisResult.latency,
      error: 'Redis connection failed',
    }
  }

  const overallStatus = !allHealthy ? 'unhealthy' :
    Object.values(checks).some(c => c.status === 'degraded') ? 'degraded' : 'healthy'

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  }

  // Return 503 if unhealthy (Kubernetes will remove from endpoints)
  // Return 200 for healthy or degraded (can still serve traffic)
  const statusCode = overallStatus === 'unhealthy' ? 503 : 200

  return c.json({
    success: overallStatus !== 'unhealthy',
    data: response,
  }, statusCode)
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /health/startup - Startup Probe (Kubernetes)
// Purpose: Check if application has finished initializing
// If fails: Kubernetes will RESTART the container
// Best Practice: Use for slow-starting applications
// ─────────────────────────────────────────────────────────────────────────────

healthRoutes.get('/startup', async (c) => {
  // For startup probe, we verify all critical services are initialized
  const checks: Record<string, HealthCheck> = {}
  let ready = true

  // Check database is accessible
  try {
    await db.execute(sql`SELECT 1`)
    checks['database'] = { status: 'healthy' }
  } catch {
    ready = false
    checks['database'] = { status: 'unhealthy', error: 'Database not ready' }
  }

  // Check Redis is accessible
  const redisResult = await pingRedis()
  if (redisResult.ok) {
    checks['redis'] = { status: 'healthy' }
  } else {
    // Redis is optional for startup
    checks['redis'] = { status: 'degraded', error: 'Redis not ready' }
  }

  return c.json({
    success: ready,
    data: {
      status: ready ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    },
  }, ready ? 200 : 503)
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /health/deep - Deep Health Check (Manual/Monitoring)
// Purpose: Comprehensive check with detailed metrics
// Use for: Monitoring dashboards, debugging
// ─────────────────────────────────────────────────────────────────────────────

healthRoutes.get('/deep', async (c) => {
  const checks: Record<string, HealthCheck & { extra?: Record<string, unknown> }> = {}

  // Database check with extra info
  const dbStart = Date.now()
  try {
    const result = await db.execute(sql`SELECT version()`)
    checks['database'] = {
      status: 'healthy',
      latency: Date.now() - dbStart,
      extra: {
        version: (result[0] as { version?: string })?.version,
      },
    }
  } catch (err) {
    checks['database'] = {
      status: 'unhealthy',
      latency: Date.now() - dbStart,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }

  // Redis check
  const redisResult = await pingRedis()
  checks['redis'] = {
    status: redisResult.ok ? 'healthy' : 'degraded',
    latency: redisResult.latency,
    ...(redisResult.ok ? {} : { error: 'Redis connection failed' }),
  }

  // Memory usage
  const memUsage = process.memoryUsage()
  checks['memory'] = {
    status: memUsage.heapUsed / memUsage.heapTotal < 0.9 ? 'healthy' : 'degraded',
    extra: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      external: Math.round(memUsage.external / 1024 / 1024) + 'MB',
    },
  }

  const allHealthy = Object.values(checks).every((c) => c.status === 'healthy')
  const anyUnhealthy = Object.values(checks).some((c) => c.status === 'unhealthy')

  const response: HealthResponse = {
    status: anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  }

  return c.json({
    success: !anyUnhealthy,
    data: response,
  }, anyUnhealthy ? 503 : 200)
})
