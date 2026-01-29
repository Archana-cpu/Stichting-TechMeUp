// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TEST SETUP
// ══════════════════════════════════════════════════════════════════════════════

import { beforeAll, afterAll, vi } from 'vitest'

// ─────────────────────────────────────────────────────────────────────────────
// Environment Variables for Testing
// ─────────────────────────────────────────────────────────────────────────────

process.env['NODE_ENV'] = 'test'
process.env['JWT_SECRET'] = 'test-jwt-secret-at-least-32-chars-long'
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5434/test'
process.env['REDIS_URL'] = 'redis://localhost:6379'

// ─────────────────────────────────────────────────────────────────────────────
// Mock Redis (for unit tests without Redis)
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../lib/redis', () => ({
  getRedis: vi.fn(() => ({
    eval: vi.fn().mockResolvedValue([1, 99, 1000]),
    ping: vi.fn().mockResolvedValue('PONG'),
    quit: vi.fn().mockResolvedValue('OK'),
    connect: vi.fn().mockResolvedValue(undefined),
  })),
  closeRedis: vi.fn().mockResolvedValue(undefined),
  pingRedis: vi.fn().mockResolvedValue({ ok: true, latency: 1 }),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Global Setup
// ─────────────────────────────────────────────────────────────────────────────

beforeAll(() => {
  // Any global setup before all tests
})

afterAll(() => {
  // Any global cleanup after all tests
})
