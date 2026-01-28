// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUTH SERVICE
// Business logic for authentication and authorization
// ══════════════════════════════════════════════════════════════════════════════

import type { User } from '@voxpoll/database'
import { db, eq, and, gt, ne } from '@voxpoll/database'
import { users, sessions, verificationTokens, UserStatusValues } from '@voxpoll/database'
import { userRepository } from '../repositories/user.repository'
import { sessionRepository } from '../repositories/session.repository'
import { hashPassword, verifyPassword, generateSessionToken, generateVerificationCode, generateSecureToken, validatePassword } from '../lib/auth'
import { hashToken, generateSlug } from '../lib/hash'
import { sendVerificationCode, sendPasswordResetEmail, sendPasswordChangedEmail, sendWelcomeEmail } from '../lib/email'
import { ApiError } from '../middleware/error-handler'
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { SESSION_LIMITS } from '../constants/limits'
import type { ClientInfo } from '../types/common.types'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string
  password: string
  username: string
  displayName?: string
}

export interface LoginInput {
  email: string
  password: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Account Lockout Configuration [SECURITY]
// ─────────────────────────────────────────────────────────────────────────────

const LOCKOUT_CONFIG = {
  maxAttempts: 5,                    // Lock after 5 failed attempts
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes lockout
  resetWindowMs: 30 * 60 * 1000,     // Reset counter after 30 min of no attempts
}

export interface SessionData {
  token: string
  refreshToken: string
  expiresAt: Date
}

export interface AuthResult {
  user: User
  session: SessionData
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth Service Class
// ─────────────────────────────────────────────────────────────────────────────

class AuthServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Register
  // ─────────────────────────────────────────────────────────────────────────────

  async register(input: RegisterInput): Promise<{ user: User; message: string }> {
    const { email, password, username, displayName } = input

    // Validate password (Bible: 05-TECH - 10 chars, 3 classes, HIBP, common check)
    const passwordValidation = await validatePassword(password, { checkHIBP: true })
    if (!passwordValidation.valid) {
      throw ApiError.badRequest(
        passwordValidation.errors[0] || 'Invalid password',
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    // Check if email already exists
    const existingEmail = await userRepository.findByEmail(email)
    if (existingEmail) {
      throw ApiError.conflict(
        ERROR_MESSAGES.EMAIL_EXISTS,
        ERROR_CODES.EMAIL_EXISTS
      )
    }

    // Check if username already exists
    const existingUsername = await userRepository.findByUsername(username)
    if (existingUsername) {
      throw ApiError.conflict(
        ERROR_MESSAGES.USERNAME_EXISTS,
        ERROR_CODES.USERNAME_EXISTS
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await userRepository.create({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      displayName: displayName || username,
      passwordHash,
      status: UserStatusValues.PENDING_VERIFICATION,
    })

    return {
      user,
      message: SUCCESS_MESSAGES.REGISTER_SUCCESS,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Login [SECURITY: Account lockout after failed attempts]
  // ─────────────────────────────────────────────────────────────────────────────

  async login(input: LoginInput, clientInfo: ClientInfo): Promise<AuthResult> {
    const { email, password } = input

    // Find user
    const user = await userRepository.findByEmail(email)
    if (!user || !user.passwordHash) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        ERROR_CODES.INVALID_CREDENTIALS
      )
    }

    // SECURITY: Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now()
      const remainingMins = Math.ceil(remainingMs / 60000)
      throw ApiError.tooManyRequests(
        `Account is temporarily locked. Try again in ${remainingMins} minute${remainingMins > 1 ? 's' : ''}.`
      )
    }

    // Check if failed attempts should be reset (after reset window)
    const shouldResetAttempts = user.lastFailedLoginAt &&
      (Date.now() - user.lastFailedLoginAt.getTime()) > LOCKOUT_CONFIG.resetWindowMs

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      // SECURITY: Track failed login attempt
      const newAttempts = shouldResetAttempts ? 1 : (user.failedLoginAttempts || 0) + 1
      const shouldLock = newAttempts >= LOCKOUT_CONFIG.maxAttempts

      await db.update(users)
        .set({
          failedLoginAttempts: newAttempts,
          lastFailedLoginAt: new Date(),
          ...(shouldLock ? { lockedUntil: new Date(Date.now() + LOCKOUT_CONFIG.lockoutDurationMs) } : {}),
        })
        .where(eq(users.id, user.id))

      if (shouldLock) {
        console.warn(`[SECURITY] Account locked after ${newAttempts} failed attempts: ${user.email}`)
        throw ApiError.tooManyRequests(
          `Account locked due to too many failed attempts. Try again in ${Math.ceil(LOCKOUT_CONFIG.lockoutDurationMs / 60000)} minutes.`
        )
      }

      throw ApiError.unauthorized(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        ERROR_CODES.INVALID_CREDENTIALS
      )
    }

    // SECURITY: Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await db.update(users)
        .set({
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastFailedLoginAt: null,
        })
        .where(eq(users.id, user.id))
    }

    // Check user status
    this.checkUserStatus(user)

    // Create session
    const session = await this.createSession(user.id, clientInfo)

    return { user, session }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────────────────────────

  async logout(token: string): Promise<void> {
    await sessionRepository.revokeByToken(token, 'User logout')
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Logout All Sessions
  // ─────────────────────────────────────────────────────────────────────────────

  async logoutAll(userId: string, exceptToken?: string): Promise<number> {
    return sessionRepository.revokeAllForUser(userId, 'Logout from all devices', exceptToken)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Refresh Session
  // ─────────────────────────────────────────────────────────────────────────────

  async refreshSession(refreshToken: string): Promise<SessionData> {
    const session = await sessionRepository.findByRefreshToken(refreshToken)

    if (!session) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
        ERROR_CODES.INVALID_REFRESH_TOKEN
      )
    }

    // Check user status
    this.checkUserStatus(session.user)

    // Generate new tokens
    const newToken = generateSessionToken()
    const newRefreshToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + SESSION_LIMITS.sessionExpiry)

    // Rotate tokens
    await sessionRepository.rotateTokens(
      session.id,
      newToken,
      hashToken(newToken),
      newRefreshToken,
      hashToken(newRefreshToken),
      expiresAt
    )

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Current User
  // ─────────────────────────────────────────────────────────────────────────────

  async getCurrentUser(user: User) {
    const oauthProviders = await userRepository.getOAuthProviders(user.id)

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      status: user.status,
      role: user.role,
      verificationLevel: user.verificationLevel,
      emailVerified: user.emailVerified,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt,
      hasPassword: !!user.passwordHash,
      linkedProviders: oauthProviders,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Active Sessions
  // ─────────────────────────────────────────────────────────────────────────────

  async getActiveSessions(userId: string, currentToken?: string) {
    const sessions = await sessionRepository.getActiveSessions(userId)

    return sessions.map((s) => ({
      id: s.id,
      device: this.parseUserAgent(s.userAgent),
      ipAddress: s.ipAddress,
      lastActivityAt: s.lastActiveAt?.toISOString() || s.createdAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      isCurrent: currentToken ? s.tokenHash === hashToken(currentToken) : false,
    }))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Revoke Session
  // ─────────────────────────────────────────────────────────────────────────────

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await sessionRepository.findById(sessionId)

    if (!session || session.userId !== userId) {
      throw ApiError.notFound(
        ERROR_MESSAGES.SESSION_NOT_FOUND,
        ERROR_CODES.SESSION_NOT_FOUND
      )
    }

    await sessionRepository.update(sessionId, {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: 'Revoked by user',
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Email Verification
  // ─────────────────────────────────────────────────────────────────────────────

  async sendVerificationCode(user: User): Promise<{ expiresAt: Date }> {
    if (user.emailVerified || !user.email) {
      return { expiresAt: new Date() }
    }

    const userEmail = user.email

    // Delete existing verification tokens
    await db.delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, userEmail),
          eq(verificationTokens.type, 'EMAIL_VERIFICATION')
        )
      )

    // Generate code
    const code = generateVerificationCode(6)
    const expiresAt = new Date(Date.now() + SESSION_LIMITS.verificationCodeExpiry)

    // Store token
    await db.insert(verificationTokens)
      .values({
        identifier: userEmail,
        tokenHash: hashToken(code),
        type: 'EMAIL_VERIFICATION',
        expiresAt,
      })

    // Send email
    await sendVerificationCode(userEmail, code)

    return { expiresAt }
  }

  async verifyEmail(user: User, code: string): Promise<void> {
    if (user.emailVerified || !user.email) {
      return
    }

    const userEmail = user.email

    // Find token
    const tokenHash = hashToken(code)
    const tokenResult = await db.select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, userEmail),
          eq(verificationTokens.tokenHash, tokenHash),
          eq(verificationTokens.type, 'EMAIL_VERIFICATION'),
          gt(verificationTokens.expiresAt, new Date())
        )
      )
      .limit(1)

    const token = tokenResult[0] ?? null

    if (!token) {
      throw ApiError.badRequest(
        ERROR_MESSAGES.INVALID_VERIFICATION_CODE,
        ERROR_CODES.INVALID_VERIFICATION_CODE
      )
    }

    // Update user and delete token in a transaction
    await db.transaction(async (tx) => {
      await tx.delete(verificationTokens)
        .where(eq(verificationTokens.id, token.id))

      await tx.update(users)
        .set({
          emailVerified: true,
          emailVerifiedAt: new Date(),
          status: 'ACTIVE',
        })
        .where(eq(users.id, user.id))
    })

    // Send welcome email
    sendWelcomeEmail(userEmail, user.displayName || user.username).catch(console.error)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Password Reset
  // ─────────────────────────────────────────────────────────────────────────────

  async requestPasswordReset(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email)

    // Always return success to prevent email enumeration
    if (!user || !user.passwordHash || !user.email) {
      return
    }

    const userEmail = user.email

    // Delete existing tokens
    await db.delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, userEmail),
          eq(verificationTokens.type, 'PASSWORD_RESET')
        )
      )

    // Generate token
    const token = generateSecureToken(32)
    const expiresAt = new Date(Date.now() + SESSION_LIMITS.passwordResetExpiry)

    // Store token
    await db.insert(verificationTokens)
      .values({
        identifier: userEmail,
        tokenHash: hashToken(token),
        type: 'PASSWORD_RESET',
        expiresAt,
      })

    // Build reset URL and send email
    const baseUrl = process.env['FRONTEND_URL'] || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`
    await sendPasswordResetEmail(userEmail, resetUrl)
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find token
    const tokenHash = hashToken(token)
    const resetTokenResult = await db.select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.tokenHash, tokenHash),
          eq(verificationTokens.type, 'PASSWORD_RESET'),
          gt(verificationTokens.expiresAt, new Date())
        )
      )
      .limit(1)

    const resetToken = resetTokenResult[0] ?? null

    if (!resetToken) {
      throw ApiError.badRequest(
        ERROR_MESSAGES.INVALID_RESET_TOKEN,
        ERROR_CODES.INVALID_RESET_TOKEN
      )
    }

    // Find user by identifier (email)
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, resetToken.identifier))
      .limit(1)

    const user = userResult[0] ?? null

    if (!user || !user.email) {
      throw ApiError.badRequest(
        ERROR_MESSAGES.INVALID_RESET_TOKEN,
        ERROR_CODES.INVALID_RESET_TOKEN
      )
    }

    const userEmail = user.email

    // Validate new password (Bible: 05-TECH)
    const passwordHistory = (user as { passwordHistory?: string[] }).passwordHistory || []
    const currentHash = (user as { passwordHash?: string }).passwordHash
    const historyToCheck = currentHash ? [currentHash, ...passwordHistory] : passwordHistory
    const passwordValidation = await validatePassword(newPassword, {
      checkHIBP: true,
      passwordHistory: historyToCheck,
    })
    if (!passwordValidation.valid) {
      throw ApiError.badRequest(
        passwordValidation.errors[0] || 'Invalid password',
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update password and revoke all sessions in a transaction
    await db.transaction(async (tx) => {
      await tx.delete(verificationTokens)
        .where(eq(verificationTokens.id, resetToken.id))

      await tx.update(users)
        .set({
          passwordHash,
          passwordChangedAt: new Date(),
        })
        .where(eq(users.id, user.id))

      await tx.update(sessions)
        .set({
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'Password reset',
        })
        .where(
          and(
            eq(sessions.userId, user.id),
            eq(sessions.isRevoked, false)
          )
        )
    })

    // Send notification
    sendPasswordChangedEmail(userEmail).catch(console.error)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Change Password
  // ─────────────────────────────────────────────────────────────────────────────

  async changePassword(
    user: User,
    currentPassword: string,
    newPassword: string,
    currentToken?: string
  ): Promise<void> {
    if (!user.passwordHash) {
      throw ApiError.badRequest(
        ERROR_MESSAGES.NO_PASSWORD_SET,
        ERROR_CODES.NO_PASSWORD_SET
      )
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash)
    if (!isValid) {
      throw ApiError.unauthorized(
        'Current password is incorrect',
        ERROR_CODES.INVALID_CREDENTIALS
      )
    }

    // Validate new password (Bible: 05-TECH - includes history check)
    const passwordHistory = user.passwordHistory || []
    const passwordValidation = await validatePassword(newPassword, {
      checkHIBP: true,
      passwordHistory: [user.passwordHash, ...passwordHistory],
    })
    if (!passwordValidation.valid) {
      throw ApiError.badRequest(
        passwordValidation.errors[0] || 'Invalid password',
        ERROR_CODES.VALIDATION_ERROR
      )
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update password history (keep last 5)
    const newPasswordHistory = [user.passwordHash, ...passwordHistory].slice(0, 5)

    // Update password and revoke other sessions in a transaction
    await db.transaction(async (tx) => {
      await tx.update(users)
        .set({
          passwordHash,
          passwordHistory: newPasswordHistory,
          passwordChangedAt: new Date(),
        })
        .where(eq(users.id, user.id))

      // Revoke all sessions except current one
      if (currentToken) {
        await tx.update(sessions)
          .set({
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'Password changed',
          })
          .where(
            and(
              eq(sessions.userId, user.id),
              eq(sessions.isRevoked, false),
              ne(sessions.tokenHash, hashToken(currentToken))
            )
          )
      } else {
        await tx.update(sessions)
          .set({
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'Password changed',
          })
          .where(
            and(
              eq(sessions.userId, user.id),
              eq(sessions.isRevoked, false)
            )
          )
      }
    })

    // Send notification
    if (user.email) {
      sendPasswordChangedEmail(user.email).catch(console.error)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Set Password (for OAuth users)
  // ─────────────────────────────────────────────────────────────────────────────

  async setPassword(user: User, password: string): Promise<void> {
    if (user.passwordHash) {
      throw ApiError.badRequest(
        ERROR_MESSAGES.PASSWORD_ALREADY_SET,
        ERROR_CODES.PASSWORD_ALREADY_SET
      )
    }

    const passwordHash = await hashPassword(password)

    await userRepository.updatePassword(user.id, passwordHash)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private checkUserStatus(user: User): void {
    switch (user.status) {
      case 'BANNED':
        throw ApiError.forbidden(
          ERROR_MESSAGES.ACCOUNT_BANNED,
          ERROR_CODES.ACCOUNT_BANNED
        )
      case 'SUSPENDED':
        throw ApiError.forbidden(
          ERROR_MESSAGES.ACCOUNT_SUSPENDED,
          ERROR_CODES.ACCOUNT_SUSPENDED
        )
      case 'DEACTIVATED':
        throw ApiError.forbidden(
          ERROR_MESSAGES.ACCOUNT_DEACTIVATED,
          ERROR_CODES.ACCOUNT_DEACTIVATED
        )
    }
  }

  private async createSession(userId: string, clientInfo: ClientInfo): Promise<SessionData> {
    const token = generateSessionToken()
    const refreshToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + SESSION_LIMITS.sessionExpiry)

    await sessionRepository.createSession({
      userId,
      token,
      tokenHash: hashToken(token),
      refreshToken,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt,
      ipAddress: clientInfo.ip,
      userAgent: clientInfo.userAgent,
    })

    return { token, refreshToken, expiresAt }
  }

  private parseUserAgent(ua: string | null): string {
    if (!ua) return 'Unknown device'

    if (ua.includes('iPhone')) return 'iPhone'
    if (ua.includes('iPad')) return 'iPad'
    if (ua.includes('Android')) return 'Android device'
    if (ua.includes('Windows')) {
      if (ua.includes('Edge')) return 'Edge on Windows'
      if (ua.includes('Chrome')) return 'Chrome on Windows'
      if (ua.includes('Firefox')) return 'Firefox on Windows'
      return 'Windows'
    }
    if (ua.includes('Mac')) {
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari on Mac'
      if (ua.includes('Chrome')) return 'Chrome on Mac'
      if (ua.includes('Firefox')) return 'Firefox on Mac'
      return 'Mac'
    }
    if (ua.includes('Linux')) return 'Linux'

    return 'Unknown device'
  }
}

// Export singleton
export const authService = new AuthServiceClass()

// Export class for testing
export { AuthServiceClass as AuthService }
