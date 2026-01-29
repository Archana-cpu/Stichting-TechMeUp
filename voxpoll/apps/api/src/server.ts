// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - STANDALONE SERVER WITH GRACEFUL SHUTDOWN
// Best Practice: Kubernetes-style graceful shutdown
// Reference: https://github.com/orgs/honojs/discussions/3756
// ══════════════════════════════════════════════════════════════════════════════

import { serve } from '@hono/node-server'
import type { Server } from 'http'
import { db, client, sql } from "@voxpoll/database"
import app from './index'
import { closeRedis, getRedis } from './lib/redis'
import { websocketService } from './services/websocket.service'
import { logger } from './lib/logger'
import { initSentry, flushSentry, captureError } from './lib/sentry'

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env['API_PORT'] || '4000', 10)
const HOST = process.env['API_HOST'] || '0.0.0.0'
const SHUTDOWN_TIMEOUT = parseInt(process.env['SHUTDOWN_TIMEOUT'] || '30000', 10)

// ─────────────────────────────────────────────────────────────────────────────
// Server State
// ─────────────────────────────────────────────────────────────────────────────

let server: Server | null = null
let isShuttingDown = false
let activeConnections = 0

// ─────────────────────────────────────────────────────────────────────────────
// Graceful Shutdown Handler
// Best Practice: Complete in-flight requests before closing
// Reference: https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-terminating-with-grace
// ─────────────────────────────────────────────────────────────────────────────

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.info(`Already shutting down, ignoring ${signal}`)
    return
  }

  isShuttingDown = true
  logger.info({ signal }, 'Starting graceful shutdown...')

  // Create a timeout to force shutdown if graceful shutdown takes too long
  const forceShutdownTimer = setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded, forcing exit')
    process.exit(1)
  }, SHUTDOWN_TIMEOUT)

  try {
    // Step 1: Stop accepting new connections
    if (server) {
      logger.info('Stopping new connections...')
      server.close()
    }

    // Step 2: Wait for active connections to complete (with timeout)
    if (activeConnections > 0) {
      logger.info({ activeConnections }, 'Waiting for active connections...')

      // Wait max 10 seconds for connections
      await Promise.race([
        new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (activeConnections === 0) {
              clearInterval(checkInterval)
              resolve()
            }
          }, 100)
        }),
        new Promise<void>((resolve) => setTimeout(resolve, 10000)),
      ])
    }

    // Step 3: Close WebSocket connections
    logger.info('Closing WebSocket connections...')
    websocketService.shutdown()

    // Step 4: Flush Sentry events
    logger.info('Flushing Sentry events...')
    await flushSentry()

    // Step 5: Close Redis connection
    logger.info('Closing Redis connection...')
    await closeRedis()

    // Step 6: Close database connection
    logger.info('Closing database connection...')
    await client.end()

    // Step 7: Clean shutdown
    clearTimeout(forceShutdownTimer)
    logger.info('Graceful shutdown complete')
    process.exit(0)
  } catch (error) {
    logger.error({ err: error }, 'Error during shutdown')
    clearTimeout(forceShutdownTimer)
    process.exit(1)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Startup
// ─────────────────────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  try {
    // Initialize Sentry first (to capture startup errors)
    logger.info('Initializing Sentry...')
    initSentry()

    // Initialize Redis connection (lazy connect)
    logger.info('Initializing Redis...')
    const redis = getRedis()
    await redis.connect()

    // Verify database connection
    logger.info('Verifying database connection...')
    await db.execute(sql`SELECT 1`)

    // Start HTTP server
    server = serve({
      fetch: app.fetch,
      port: PORT,
      hostname: HOST,
    }) as Server

    // Initialize WebSocket service for live polls
    logger.info('Initializing WebSocket service...')
    websocketService.initialize(server)

    // Track active connections (for graceful shutdown)
    const originalFetch = app.fetch
    app.fetch = async (request, env) => {
      if (isShuttingDown) {
        return new Response('Service Unavailable', {
          status: 503,
          headers: { 'Retry-After': '30' },
        })
      }
      activeConnections++
      try {
        return await originalFetch(request, env)
      } finally {
        activeConnections--
      }
    }

    logger.info({
      host: HOST,
      port: PORT,
      environment: process.env['NODE_ENV'] || 'development',
      endpoints: {
        health: `http://${HOST}:${PORT}/api/v1/health`,
        docs: `http://${HOST}:${PORT}/api/docs`,
        websocket: `ws://${HOST}:${PORT}/ws`,
      },
    }, 'VoxPoll API Server started')

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                     VOXPOLL API SERVER                       ║
╠══════════════════════════════════════════════════════════════╣
║  Host: ${HOST.padEnd(54)}║
║  Port: ${PORT.toString().padEnd(54)}║
║  Environment: ${(process.env['NODE_ENV'] || 'development').padEnd(47)}║
╠══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                  ║
║  - Health: http://${HOST}:${PORT}/api/v1/health${' '.repeat(Math.max(0, 27 - HOST.length - PORT.toString().length))}║
║  - Docs:   http://${HOST}:${PORT}/api/docs${' '.repeat(Math.max(0, 33 - HOST.length - PORT.toString().length))}║
║  - WS:     ws://${HOST}:${PORT}/ws${' '.repeat(Math.max(0, 37 - HOST.length - PORT.toString().length))}║
╚══════════════════════════════════════════════════════════════╝
`)
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server')
    captureError(error instanceof Error ? error : new Error(String(error)))
    await flushSentry()
    process.exit(1)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Signal Handlers (Kubernetes-compatible)
// SIGTERM: Kubernetes sends this before killing pod
// SIGINT: Ctrl+C in development
// ─────────────────────────────────────────────────────────────────────────────

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception')
  captureError(error, { tags: { type: 'uncaughtException' } })
  gracefulShutdown('UNCAUGHT_EXCEPTION')
})

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled rejection')
  captureError(reason instanceof Error ? reason : new Error(String(reason)), {
    tags: { type: 'unhandledRejection' },
  })
  gracefulShutdown('UNHANDLED_REJECTION')
})

// Start the server
start()
