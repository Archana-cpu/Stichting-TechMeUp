// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUTH CONTROLLER
// HTTP request/response handling for authentication
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { authService } from '../services/auth.service'
import { twoFactorService, type TwoFactorUser } from '../services/twofa.service'
import type { AppEnv } from '../types'
import { SUCCESS_MESSAGES } from '../constants/messages'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RegisterBody {
  email: string
  password: string
  username: string
  displayName?: string
}

interface LoginBody {
  email: string
  password: string
}

interface RefreshBody {
  refreshToken: string
}

interface VerifyCodeBody {
  code: string
}

interface ForgotPasswordBody {
  email: string
}

interface ResetPasswordBody {
  token: string
  password: string
}

interface ChangePasswordBody {
  currentPassword: string
  newPassword: string
}

interface SetPasswordBody {
  password: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Extract Client Info
// ─────────────────────────────────────────────────────────────────────────────

function getClientInfo(c: Context) {
  return {
    ip: c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
        c.req.header('x-real-ip') ||
        null,
    userAgent: c.req.header('user-agent') || null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class AuthControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/register
  // ─────────────────────────────────────────────────────────────────────────────

  async register(c: Context<AppEnv>) {
    const body = await c.req.json() as RegisterBody
    const result = await authService.register(body)

    return c.json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          displayName: result.user.displayName,
          createdAt: result.user.createdAt,
        },
        message: result.message,
      },
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/login
  // ─────────────────────────────────────────────────────────────────────────────

  async login(c: Context<AppEnv>) {
    const body = await c.req.json() as LoginBody
    const clientInfo = getClientInfo(c)

    const { user, session } = await authService.login(body, clientInfo)

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          status: user.status,
        },
        session: {
          token: session.token,
          refreshToken: session.refreshToken,
          expiresAt: session.expiresAt.toISOString(),
        },
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/logout
  // ─────────────────────────────────────────────────────────────────────────────

  async logout(c: Context<AppEnv>) {
    const token = c.req.header('Authorization')?.slice(7)
    if (token) {
      await authService.logout(token)
    }

    return c.json({
      success: true,
      data: { message: SUCCESS_MESSAGES.LOGOUT_SUCCESS },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/logout-all
  // ─────────────────────────────────────────────────────────────────────────────

  async logoutAll(c: Context<AppEnv>) {
    const user = c.get('user')!
    const currentToken = c.req.header('Authorization')?.slice(7)

    const count = await authService.logoutAll(user.id, currentToken)

    return c.json({
      success: true,
      data: {
        message: SUCCESS_MESSAGES.LOGOUT_ALL_SUCCESS,
        sessionsRevoked: count,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/refresh
  // ─────────────────────────────────────────────────────────────────────────────

  async refresh(c: Context<AppEnv>) {
    const { refreshToken } = await c.req.json() as RefreshBody

    const session = await authService.refreshSession(refreshToken)

    return c.json({
      success: true,
      data: {
        session: {
          token: session.token,
          refreshToken: session.refreshToken,
          expiresAt: session.expiresAt.toISOString(),
        },
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /auth/me
  // ─────────────────────────────────────────────────────────────────────────────

  async me(c: Context<AppEnv>) {
    const user = c.get('user')!
    const data = await authService.getCurrentUser(user)

    return c.json({
      success: true,
      data,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /auth/sessions
  // ─────────────────────────────────────────────────────────────────────────────

  async sessions(c: Context<AppEnv>) {
    const user = c.get('user')!
    const currentToken = c.req.header('Authorization')?.slice(7)

    const sessions = await authService.getActiveSessions(user.id, currentToken)

    return c.json({
      success: true,
      data: { sessions },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /auth/sessions/:id
  // ─────────────────────────────────────────────────────────────────────────────

  async revokeSession(c: Context<AppEnv>) {
    const user = c.get('user')!
    const sessionId = c.req.param('id')

    await authService.revokeSession(user.id, sessionId)

    return c.json({
      success: true,
      data: { message: SUCCESS_MESSAGES.SESSION_REVOKED },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/verify/send-code
  // ─────────────────────────────────────────────────────────────────────────────

  async sendVerificationCode(c: Context<AppEnv>) {
    const user = c.get('user')!

    if (user.emailVerified) {
      return c.json({
        success: true,
        data: { message: 'Email is already verified' },
      })
    }

    const result = await authService.sendVerificationCode(user)

    return c.json({
      success: true,
      data: {
        message: SUCCESS_MESSAGES.VERIFICATION_SENT,
        expiresAt: result.expiresAt.toISOString(),
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/verify/confirm
  // ─────────────────────────────────────────────────────────────────────────────

  async verifyEmail(c: Context<AppEnv>) {
    const user = c.get('user')!
    const { code } = await c.req.json() as VerifyCodeBody

    if (user.emailVerified) {
      return c.json({
        success: true,
        data: { message: 'Email is already verified' },
      })
    }

    await authService.verifyEmail(user, code)

    return c.json({
      success: true,
      data: {
        message: SUCCESS_MESSAGES.EMAIL_VERIFIED,
        emailVerified: true,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /auth/verify/status
  // ─────────────────────────────────────────────────────────────────────────────

  async verificationStatus(c: Context<AppEnv>) {
    const user = c.get('user')!

    return c.json({
      success: true,
      data: {
        emailVerified: user.emailVerified,
        emailVerifiedAt: user.emailVerifiedAt?.toISOString() || null,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/password/forgot
  // ─────────────────────────────────────────────────────────────────────────────

  async forgotPassword(c: Context<AppEnv>) {
    const { email } = await c.req.json() as ForgotPasswordBody

    await authService.requestPasswordReset(email)

    // Always return success to prevent email enumeration
    return c.json({
      success: true,
      data: {
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/password/reset
  // ─────────────────────────────────────────────────────────────────────────────

  async resetPassword(c: Context<AppEnv>) {
    const { token, password } = await c.req.json() as ResetPasswordBody

    await authService.resetPassword(token, password)

    return c.json({
      success: true,
      data: {
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/password/change
  // ─────────────────────────────────────────────────────────────────────────────

  async changePassword(c: Context<AppEnv>) {
    const user = c.get('user')!
    const { currentPassword, newPassword } = await c.req.json() as ChangePasswordBody
    const currentToken = c.req.header('Authorization')?.slice(7)

    await authService.changePassword(user, currentPassword, newPassword, currentToken)

    return c.json({
      success: true,
      data: {
        message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/password/set
  // ─────────────────────────────────────────────────────────────────────────────

  async setPassword(c: Context<AppEnv>) {
    const user = c.get('user')!
    const { password } = await c.req.json() as SetPasswordBody

    await authService.setPassword(user, password)

    return c.json({
      success: true,
      data: {
        message: SUCCESS_MESSAGES.PASSWORD_SET,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /auth/password/status
  // ─────────────────────────────────────────────────────────────────────────────

  async passwordStatus(c: Context<AppEnv>) {
    const user = c.get('user')!

    return c.json({
      success: true,
      data: {
        hasPassword: !!user.passwordHash,
        passwordChangedAt: user.passwordChangedAt?.toISOString() || null,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Two-Factor Authentication (Bible: 02-USERS, 05-TECH)
  // ─────────────────────────────────────────────────────────────────────────────

  // POST /auth/2fa/setup - Initiate 2FA setup
  async twoFactorSetup(c: Context<AppEnv>) {
    const user = c.get('user')! as unknown as TwoFactorUser

    const result = await twoFactorService.generateSetup(user)

    return c.json({
      success: true,
      data: {
        message: SUCCESS_MESSAGES.TWO_FACTOR_SETUP_INITIATED,
        secret: result.secret,
        qrCode: result.qrCodeDataUrl,
        backupCodes: result.backupCodes,
      },
    })
  }

  // POST /auth/2fa/verify - Verify code and enable 2FA
  async twoFactorVerify(c: Context<AppEnv>) {
    const user = c.get('user')! as unknown as TwoFactorUser
    const { code } = await c.req.json() as { code: string }

    await twoFactorService.verifyAndEnable(user, code)

    return c.json({
      success: true,
      data: {
        message: SUCCESS_MESSAGES.TWO_FACTOR_ENABLED,
        enabled: true,
      },
    })
  }

  // POST /auth/2fa/disable - Disable 2FA
  async twoFactorDisable(c: Context<AppEnv>) {
    const user = c.get('user')! as unknown as TwoFactorUser
    const { code } = await c.req.json() as { code: string }

    await twoFactorService.disable(user, code)

    return c.json({
      success: true,
      data: {
        message: SUCCESS_MESSAGES.TWO_FACTOR_DISABLED,
        enabled: false,
      },
    })
  }

  // POST /auth/2fa/backup-codes/regenerate - Generate new backup codes
  async twoFactorRegenerateBackupCodes(c: Context<AppEnv>) {
    const user = c.get('user')! as unknown as TwoFactorUser
    const { code } = await c.req.json() as { code: string }

    const backupCodes = await twoFactorService.regenerateBackupCodes(user, code)

    return c.json({
      success: true,
      data: {
        message: SUCCESS_MESSAGES.BACKUP_CODES_REGENERATED,
        backupCodes,
      },
    })
  }

  // GET /auth/2fa/status - Get 2FA status
  async twoFactorStatus(c: Context<AppEnv>) {
    const user = c.get('user')! as unknown as TwoFactorUser

    const status = twoFactorService.getStatus(user)

    return c.json({
      success: true,
      data: {
        enabled: status.enabled,
        verifiedAt: status.verifiedAt?.toISOString() || null,
        backupCodesRemaining: status.backupCodesRemaining,
      },
    })
  }
}

// Export singleton
export const authController = new AuthControllerClass()

// Export class for testing
export { AuthControllerClass as AuthController }
