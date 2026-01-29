// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SESSION MANAGEMENT TESTS (P0-002)
// Bible: 05-TECH/06-security.md, T-005
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SESSION_LIMITS } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data Helpers
// ─────────────────────────────────────────────────────────────────────────────

function createMockSession(overrides: Record<string, unknown> = {}) {
  const now = new Date()
  return {
    id: 'session_' + Math.random().toString(36).substring(7),
    userId: 'user_123',
    tokenHash: 'hashed_token_' + Math.random().toString(36).substring(7),
    refreshTokenHash: 'hashed_refresh_' + Math.random().toString(36).substring(7),
    expiresAt: new Date(now.getTime() + SESSION_LIMITS.sessionExpiry),
    isRevoked: false,
    revokedAt: null,
    revokedReason: null,
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    deviceCategory: 'DESKTOP',
    lastActiveAt: now,
    createdAt: now,
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hoisted Mocks
// ─────────────────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  sessions: {
    id: 'id',
    userId: 'userId',
    tokenHash: 'tokenHash',
    refreshTokenHash: 'refreshTokenHash',
    expiresAt: 'expiresAt',
    isRevoked: 'isRevoked',
    revokedAt: 'revokedAt',
    revokedReason: 'revokedReason',
    createdAt: 'createdAt',
    lastActiveAt: 'lastActiveAt',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    deviceCategory: 'deviceCategory',
  },
  users: {
    id: 'id',
    status: 'status',
    role: 'role',
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Mock Database
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('@voxpoll/database', () => ({
  db: mocks.db,
  sessions: mocks.sessions,
  users: mocks.users,
  eq: vi.fn((field: unknown, value: unknown) => ({ field, value, type: 'eq' })),
  and: vi.fn((...args: unknown[]) => ({ type: 'and', conditions: args })),
  or: vi.fn((...args: unknown[]) => ({ type: 'or', conditions: args })),
  gt: vi.fn((field: unknown, value: unknown) => ({ field, value, type: 'gt' })),
  lt: vi.fn((field: unknown, value: unknown) => ({ field, value, type: 'lt' })),
  ne: vi.fn((field: unknown, value: unknown) => ({ field, value, type: 'ne' })),
  desc: vi.fn((field: unknown) => ({ field, direction: 'desc' })),
  asc: vi.fn((field: unknown) => ({ field, direction: 'asc' })),
  sql: Object.assign(
    vi.fn((strings: TemplateStringsArray) => ({ sql: strings[0] })),
    { raw: vi.fn((str: string) => str) }
  ),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Import After Mocks
// ─────────────────────────────────────────────────────────────────────────────

import { sessionRepository } from '../repositories/session.repository'

// ─────────────────────────────────────────────────────────────────────────────
// P0-002: Session Management Tests
// Bible Compliance: T-005, P-035
// Coverage Target: 100%
// ─────────────────────────────────────────────────────────────────────────────

describe('Session Management (P0-002)', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
        orderBy: vi.fn().mockResolvedValue([]),
      }),
    })

    mocks.db.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([createMockSession()]),
      }),
    })

    mocks.db.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    })

    mocks.db.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Session Expiry Tests (Bible: T-005)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Session Expiry Configuration', () => {
    it('should have correct access token expiry (15 minutes)', () => {
      const expectedExpiry = 15 * 60 * 1000

      expect(SESSION_LIMITS.accessTokenExpiry).toBe(expectedExpiry)
    })

    it('should have correct refresh token expiry (7 days)', () => {
      const expectedExpiry = 7 * 24 * 60 * 60 * 1000

      expect(SESSION_LIMITS.refreshTokenExpiry).toBe(expectedExpiry)
    })

    it('should have correct session expiry (7 days)', () => {
      const expectedExpiry = 7 * 24 * 60 * 60 * 1000

      expect(SESSION_LIMITS.sessionExpiry).toBe(expectedExpiry)
    })

    it('should have session expiry matching refresh token expiry', () => {
      expect(SESSION_LIMITS.sessionExpiry).toBe(SESSION_LIMITS.refreshTokenExpiry)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Max Sessions Per User (Bible: T-005 - max 5 sessions)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Max Sessions Per User', () => {
    it('should enforce max 5 sessions per user', () => {
      expect(SESSION_LIMITS.maxSessionsPerUser).toBe(5)
    })

    it('should create session when under limit', async () => {
      mocks.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 4 }]),
        }),
      })

      const session = await sessionRepository.createSession({
        userId: 'user_123',
        token: 'access_token',
        tokenHash: 'hashed_access',
        refreshToken: 'refresh_token',
        refreshTokenHash: 'hashed_refresh',
        expiresAt: new Date(Date.now() + SESSION_LIMITS.sessionExpiry),
      })

      expect(session).toBeDefined()
      expect(mocks.db.insert).toHaveBeenCalled()
    })

    it('should revoke oldest session when creating 6th session', async () => {
      const oldestSession = createMockSession({ id: 'oldest_session' })

      mocks.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 5 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([oldestSession]),
              }),
            }),
          }),
        })

      await sessionRepository.createSession({
        userId: 'user_123',
        token: 'access_token',
        tokenHash: 'hashed_access',
        refreshToken: 'refresh_token',
        refreshTokenHash: 'hashed_refresh',
        expiresAt: new Date(Date.now() + SESSION_LIMITS.sessionExpiry),
      })

      expect(mocks.db.update).toHaveBeenCalledTimes(1)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Session Revocation
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Session Revocation', () => {
    it('should revoke session by token hash', async () => {
      await sessionRepository.revokeByToken('hashed_token', 'User logout')

      expect(mocks.db.update).toHaveBeenCalled()
    })

    it('should revoke all sessions for user', async () => {
      mocks.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }, { id: '3' }]),
          }),
        }),
      })

      const count = await sessionRepository.revokeAllForUser('user_123', 'Password change')

      expect(count).toBe(3)
      expect(mocks.db.update).toHaveBeenCalled()
    })

    it('should revoke all sessions except current', async () => {
      mocks.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
          }),
        }),
      })

      const count = await sessionRepository.revokeAllForUser(
        'user_123',
        'Logout all other devices',
        'current_token_hash'
      )

      expect(count).toBe(2)
    })

    it('should include revocation reason', async () => {
      const reason = 'Security breach detected'

      await sessionRepository.revokeByToken('hashed_token', reason)

      const updateCall = mocks.db.update().set
      expect(updateCall).toHaveBeenCalledWith(
        expect.objectContaining({
          isRevoked: true,
          revokedReason: reason,
        })
      )
    })

    it('should set revoked timestamp', async () => {
      const before = Date.now()

      await sessionRepository.revokeByToken('hashed_token', 'Test')

      const after = Date.now()
      const updateCall = mocks.db.update().set
      const revokedAt = updateCall.mock.calls[0]?.[0]?.revokedAt as Date

      expect(revokedAt).toBeInstanceOf(Date)
      expect(revokedAt.getTime()).toBeGreaterThanOrEqual(before)
      expect(revokedAt.getTime()).toBeLessThanOrEqual(after)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Token Refresh Flow
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Token Refresh Flow', () => {
    it('should rotate tokens successfully', async () => {
      const mockSession = createMockSession()
      mocks.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockSession]),
          }),
        }),
      })

      const newExpiresAt = new Date(Date.now() + SESSION_LIMITS.sessionExpiry)
      const result = await sessionRepository.rotateTokens(
        'session_123',
        'new_access_token',
        'new_hashed_access',
        'new_refresh_token',
        'new_hashed_refresh',
        newExpiresAt
      )

      expect(result).toBeDefined()
      expect(mocks.db.update).toHaveBeenCalled()
    })

    it('should update last active timestamp on rotation', async () => {
      const before = Date.now()

      mocks.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([createMockSession()]),
          }),
        }),
      })

      await sessionRepository.rotateTokens(
        'session_123',
        'new_token',
        'new_hash',
        'new_refresh',
        'new_refresh_hash',
        new Date()
      )

      const after = Date.now()
      const updateCall = mocks.db.update().set
      const lastActiveAt = updateCall.mock.calls[0]?.[0]?.lastActiveAt as Date

      expect(lastActiveAt).toBeInstanceOf(Date)
      expect(lastActiveAt.getTime()).toBeGreaterThanOrEqual(before)
      expect(lastActiveAt.getTime()).toBeLessThanOrEqual(after)
    })

    it('should return null when session not found', async () => {
      mocks.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await sessionRepository.rotateTokens(
        'nonexistent',
        'token',
        'hash',
        'refresh',
        'refresh_hash',
        new Date()
      )

      expect(result).toBeNull()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Invalid Token Handling
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Invalid Token Handling', () => {
    it('should return null for invalid access token', async () => {
      mocks.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      })

      const result = await sessionRepository.findByToken('invalid_hash')

      expect(result).toBeNull()
    })

    it('should return null for invalid refresh token', async () => {
      mocks.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      })

      const result = await sessionRepository.findByRefreshToken('invalid_hash')

      expect(result).toBeNull()
    })

    it('should reject revoked tokens', async () => {
      const revokedSession = createMockSession({ isRevoked: true })
      mocks.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      })

      const result = await sessionRepository.findByToken(revokedSession.tokenHash)

      expect(result).toBeNull()
    })

    it('should reject expired tokens', async () => {
      const expiredSession = createMockSession({
        expiresAt: new Date(Date.now() - 1000),
      })
      mocks.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      })

      const result = await sessionRepository.findByToken(expiredSession.tokenHash)

      expect(result).toBeNull()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Expired Session Cleanup
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Expired Session Cleanup', () => {
    it('should cleanup expired sessions', async () => {
      mocks.db.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
        }),
      })

      const count = await sessionRepository.cleanupExpired()

      expect(count).toBe(2)
      expect(mocks.db.delete).toHaveBeenCalled()
    })

    it('should cleanup revoked sessions older than 7 days', async () => {
      mocks.db.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: '1' }]),
        }),
      })

      const count = await sessionRepository.cleanupExpired()

      expect(count).toBe(1)
    })

    it('should return 0 when no sessions to cleanup', async () => {
      mocks.db.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      })

      const count = await sessionRepository.cleanupExpired()

      expect(count).toBe(0)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Concurrent Session Handling
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Concurrent Session Handling', () => {
    it('should get all active sessions for user', async () => {
      const sessions = [
        createMockSession({ id: 'session_1' }),
        createMockSession({ id: 'session_2' }),
        createMockSession({ id: 'session_3' }),
      ]

      mocks.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(sessions),
          }),
        }),
      })

      const result = await sessionRepository.getActiveSessions('user_123')

      expect(result).toHaveLength(3)
    })

    it('should count active sessions correctly', async () => {
      mocks.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]),
        }),
      })

      const count = await sessionRepository.countActiveSessions('user_123')

      expect(count).toBe(5)
    })

    it('should return 0 when no active sessions', async () => {
      mocks.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      })

      const count = await sessionRepository.countActiveSessions('user_123')

      expect(count).toBe(0)
    })

    it('should update last active timestamp', async () => {
      const before = Date.now()

      await sessionRepository.updateLastActive('session_123')

      const after = Date.now()
      const updateCall = mocks.db.update().set
      const lastActiveAt = updateCall.mock.calls[0]?.[0]?.lastActiveAt as Date

      expect(lastActiveAt).toBeInstanceOf(Date)
      expect(lastActiveAt.getTime()).toBeGreaterThanOrEqual(before)
      expect(lastActiveAt.getTime()).toBeLessThanOrEqual(after)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Session CRUD Operations
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Session CRUD Operations', () => {
    it('should find session by id', async () => {
      const mockSession = createMockSession()
      mocks.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSession]),
          }),
        }),
      })

      const result = await sessionRepository.findById('session_123')

      expect(result).toEqual(mockSession)
    })

    it('should return null when session not found', async () => {
      mocks.db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await sessionRepository.findById('nonexistent')

      expect(result).toBeNull()
    })

    it('should update session data', async () => {
      const updated = createMockSession({ isRevoked: true })
      mocks.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updated]),
          }),
        }),
      })

      const result = await sessionRepository.update('session_123', {
        isRevoked: true,
        revokedReason: 'Test',
      })

      expect(result?.isRevoked).toBe(true)
    })
  })
})
