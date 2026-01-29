// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - HEALTH ROUTES TESTS
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { healthRoutes } from './health'

// Response type for health endpoints
interface HealthResponse {
  success: boolean
  data: {
    status: string
    timestamp?: string
    version?: string
    uptime?: number
    checks?: Record<string, { status: string; latency?: number; extra?: unknown }>
  }
}

// Mock Drizzle
vi.mock('@voxpoll/database', () => ({
  db: {
    execute: vi.fn().mockResolvedValue([{ version: 'PostgreSQL 16.0' }]),
  },
  sql: vi.fn((strings: TemplateStringsArray) => strings.join('')),
}))

describe('Health Routes', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.route('/health', healthRoutes)
  })

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await app.request('/health')
      expect(res.status).toBe(200)

      const json = (await res.json()) as HealthResponse
      expect(json.success).toBe(true)
      expect(json.data.status).toBe('healthy')
      expect(json.data.version).toBeDefined()
      expect(json.data.uptime).toBeDefined()
    })
  })

  describe('GET /health/live', () => {
    it('should return healthy status (liveness probe)', async () => {
      const res = await app.request('/health/live')
      expect(res.status).toBe(200)

      const json = (await res.json()) as HealthResponse
      expect(json.success).toBe(true)
      expect(json.data.status).toBe('healthy')
    })
  })

  describe('GET /health/ready', () => {
    it('should check database and redis connectivity', async () => {
      const res = await app.request('/health/ready')
      // May be 200 or 503 depending on mock setup
      expect([200, 503]).toContain(res.status)

      const json = (await res.json()) as HealthResponse
      expect(json.data.checks).toBeDefined()
    })
  })

  describe('GET /health/startup', () => {
    it('should verify startup dependencies', async () => {
      const res = await app.request('/health/startup')
      expect([200, 503]).toContain(res.status)

      const json = (await res.json()) as HealthResponse
      expect(json.data.checks).toBeDefined()
    })
  })

  describe('GET /health/deep', () => {
    it('should return detailed health metrics', async () => {
      const res = await app.request('/health/deep')
      expect([200, 503]).toContain(res.status)

      const json = (await res.json()) as HealthResponse
      expect(json.data.checks).toBeDefined()
      expect(json.data.checks?.['memory']).toBeDefined()
    })
  })
})
