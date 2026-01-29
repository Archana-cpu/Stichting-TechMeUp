// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUTH SERVICE TESTS
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockUser,
  createMockSession,
} from '../test/factories'

// ─────────────────────────────────────────────────────────────────────────────
// Hoisted Mocks
// ─────────────────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
  userRepository: {
    findByEmail: vi.fn(),
    findByUsername: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    getOAuthProviders: vi.fn(),
    updatePassword: vi.fn(),
  },
  sessionRepository: {
    createSession: vi.fn(),
    findByRefreshToken: vi.fn(),
    findById: vi.fn(),
    revokeByToken: vi.fn(),
    revokeAllForUser: vi.fn(),
    rotateTokens: vi.fn(),
    getActiveSessions: vi.fn(),
    update: vi.fn(),
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Apply Mocks
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../repositories/user.repository', () => ({
  userRepository: mocks.userRepository,
}))

vi.mock('../repositories/session.repository', () => ({
  sessionRepository: mocks.sessionRepository,
}))

vi.mock('../lib/auth', () => ({
  hashPassword: vi.fn((p: string) => Promise.resolve(`hashed_${p}`)),
  verifyPassword: vi.fn((p: string, h: string) => Promise.resolve(h === `hashed_${p}`)),
  validatePassword: vi.fn(() => Promise.resolve({ valid: true, errors: [] })),
  generateSessionToken: vi.fn(() => 'mock_session_token'),
  generateVerificationCode: vi.fn(() => '123456'),
  generateSecureToken: vi.fn(() => 'secure_token'),
}))

vi.mock('../lib/hash', () => ({
  hashToken: vi.fn((t: string) => `hashed_${t}`),
  generateSlug: vi.fn(() => 'slug'),
}))

vi.mock('../lib/email', () => ({
  sendVerificationCode: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordChangedEmail: vi.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@voxpoll/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@voxpoll/database')>()
  return {
    ...actual,
    db: {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([]),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
      })),
      transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn({})),
    },
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Import Service After Mocks
// ─────────────────────────────────────────────────────────────────────────────

import { authService } from './auth.service'
import type { User } from '@voxpoll/database'

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  const mockClientInfo = {
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // register
  // ─────────────────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = createMockUser({
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
      })

      mocks.userRepository.findByEmail.mockResolvedValue(null)
      mocks.userRepository.findByUsername.mockResolvedValue(null)
      mocks.userRepository.create.mockResolvedValue(mockUser)

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        displayName: 'Test User',
      })

      expect(result.user).toBeDefined()
      expect(result.message).toContain('Registration')
      expect(mocks.userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          username: 'testuser',
        })
      )
    })

    it('should throw error if email already exists', async () => {
      const existingUser = createMockUser({ email: 'test@example.com' })
      mocks.userRepository.findByEmail.mockResolvedValue(existingUser)

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          username: 'newuser',
        })
      ).rejects.toThrow()
    })

    it('should throw error if username already exists', async () => {
      const existingUser = createMockUser({ username: 'testuser' })
      mocks.userRepository.findByEmail.mockResolvedValue(null)
      mocks.userRepository.findByUsername.mockResolvedValue(existingUser)

      await expect(
        authService.register({
          email: 'new@example.com',
          password: 'password123',
          username: 'testuser',
        })
      ).rejects.toThrow()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // login
  // ─────────────────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = createMockUser({
        email: 'test@example.com',
        passwordHash: 'hashed_password123',
      })

      mocks.userRepository.findByEmail.mockResolvedValue(mockUser)
      mocks.sessionRepository.createSession.mockResolvedValue({})

      const result = await authService.login(
        { email: 'test@example.com', password: 'password123' },
        mockClientInfo
      )

      expect(result.user).toBeDefined()
      expect(result.user.email).toBe('test@example.com')
      expect(result.session).toBeDefined()
      expect(result.session.token).toBe('mock_session_token')
    })

    it('should throw error for invalid email', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(null)

      await expect(
        authService.login(
          { email: 'wrong@example.com', password: 'password123' },
          mockClientInfo
        )
      ).rejects.toThrow()
    })

    it('should throw error for banned user', async () => {
      const bannedUser = createMockUser({ status: 'BANNED' })
      mocks.userRepository.findByEmail.mockResolvedValue(bannedUser)

      await expect(
        authService.login(
          { email: 'test@example.com', password: 'password123' },
          mockClientInfo
        )
      ).rejects.toThrow()
    })

    it('should throw error for suspended user', async () => {
      const suspendedUser = createMockUser({
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        suspensionReason: 'Policy violation',
      })
      mocks.userRepository.findByEmail.mockResolvedValue(suspendedUser)

      await expect(
        authService.login(
          { email: 'test@example.com', password: 'password123' },
          mockClientInfo
        )
      ).rejects.toThrow()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // logout
  // ─────────────────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should logout successfully', async () => {
      mocks.sessionRepository.revokeByToken.mockResolvedValue(undefined)

      await authService.logout('mock_token')

      expect(mocks.sessionRepository.revokeByToken).toHaveBeenCalledWith(
        'mock_token',
        'User logout'
      )
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // logoutAll
  // ─────────────────────────────────────────────────────────────────────────────

  describe('logoutAll', () => {
    it('should logout all sessions', async () => {
      mocks.sessionRepository.revokeAllForUser.mockResolvedValue(5)

      const result = await authService.logoutAll('user_123')

      expect(result).toBe(5)
      expect(mocks.sessionRepository.revokeAllForUser).toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // refreshSession
  // ─────────────────────────────────────────────────────────────────────────────

  describe('refreshSession', () => {
    it('should throw error for invalid refresh token', async () => {
      mocks.sessionRepository.findByRefreshToken.mockResolvedValue(null)

      await expect(authService.refreshSession('invalid_token')).rejects.toThrow()
    })

    it('should throw error for revoked session', async () => {
      const revokedSession = createMockSession({ isRevoked: true })
      mocks.sessionRepository.findByRefreshToken.mockResolvedValue(revokedSession)

      await expect(authService.refreshSession('revoked_token')).rejects.toThrow()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // getCurrentUser
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getCurrentUser', () => {
    it('should return user profile with OAuth providers', async () => {
      const mockUser = createMockUser() as User
      mocks.userRepository.getOAuthProviders.mockResolvedValue(['google', 'github'])

      const result = await authService.getCurrentUser(mockUser)

      expect(result.id).toBe(mockUser.id)
      expect(result.linkedProviders).toEqual(['google', 'github'])
    })

    it('should return empty providers for user without OAuth', async () => {
      const mockUser = createMockUser() as User
      mocks.userRepository.getOAuthProviders.mockResolvedValue([])

      const result = await authService.getCurrentUser(mockUser)

      expect(result.linkedProviders).toEqual([])
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // getActiveSessions
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getActiveSessions', () => {
    it('should return session list', async () => {
      const mockSessions = [
        createMockSession({ userId: 'user_123' }),
        createMockSession({ userId: 'user_123' }),
      ]
      mocks.sessionRepository.getActiveSessions.mockResolvedValue(mockSessions)

      const result = await authService.getActiveSessions('user_123')

      expect(result).toHaveLength(2)
      expect(mocks.sessionRepository.getActiveSessions).toHaveBeenCalledWith('user_123')
    })

    it('should return empty array for user with no sessions', async () => {
      mocks.sessionRepository.getActiveSessions.mockResolvedValue([])

      const result = await authService.getActiveSessions('user_123')

      expect(result).toEqual([])
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // revokeSession
  // ─────────────────────────────────────────────────────────────────────────────

  describe('revokeSession', () => {
    it('should revoke user session', async () => {
      const mockSession = createMockSession({ userId: 'user_123' })
      mocks.sessionRepository.findById.mockResolvedValue(mockSession)
      mocks.sessionRepository.update.mockResolvedValue(undefined)

      await authService.revokeSession('user_123', mockSession.id)

      expect(mocks.sessionRepository.update).toHaveBeenCalled()
    })

    it('should throw if session not found', async () => {
      mocks.sessionRepository.findById.mockResolvedValue(null)

      await expect(
        authService.revokeSession('user_123', 'nonexistent')
      ).rejects.toThrow()
    })

    it('should throw if session belongs to different user', async () => {
      const otherUserSession = createMockSession({ userId: 'other_user' })
      mocks.sessionRepository.findById.mockResolvedValue(otherUserSession)

      await expect(
        authService.revokeSession('user_123', otherUserSession.id)
      ).rejects.toThrow()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // setPassword
  // ─────────────────────────────────────────────────────────────────────────────

  describe('setPassword', () => {
    it('should set password for OAuth user without password', async () => {
      const oauthUser = createMockUser({ passwordHash: null }) as User
      mocks.userRepository.updatePassword.mockResolvedValue(undefined)

      await authService.setPassword(oauthUser, 'newpassword123')

      expect(mocks.userRepository.updatePassword).toHaveBeenCalled()
    })

    it('should throw if user already has password', async () => {
      const userWithPassword = createMockUser() as User

      await expect(
        authService.setPassword(userWithPassword, 'newpassword')
      ).rejects.toThrow()
    })
  })
})
