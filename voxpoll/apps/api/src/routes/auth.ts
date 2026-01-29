// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUTH ROUTES
// Route definitions only - delegates to AuthController
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authController } from '../controllers/auth.controller'
import { auth } from '../middleware/auth'
import { rateLimit, RATE_LIMITS } from '../middleware/rate-limit'
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  setPasswordSchema,
  twoFactorVerifySchema,
  twoFactorDisableSchema,
  twoFactorRegenerateSchema,
} from '../validators/auth.validators'
import type { AppEnv } from '../types'

export const authRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /auth/register - Create new account
authRoutes.post(
  '/register',
  rateLimit(RATE_LIMITS.register),
  zValidator('json', registerSchema),
  (c) => authController.register(c)
)

// POST /auth/login - Authenticate user
authRoutes.post(
  '/login',
  rateLimit(RATE_LIMITS.login),
  zValidator('json', loginSchema),
  (c) => authController.login(c)
)

// POST /auth/refresh - Refresh access token
authRoutes.post(
  '/refresh',
  rateLimit({ limit: 10, window: 3600, prefix: 'rl:auth:refresh' }),
  zValidator('json', refreshSchema),
  (c) => authController.refresh(c)
)

// POST /auth/password/forgot - Request password reset
authRoutes.post(
  '/password/forgot',
  rateLimit(RATE_LIMITS.passwordReset),
  zValidator('json', forgotPasswordSchema),
  (c) => authController.forgotPassword(c)
)

// POST /auth/password/reset - Reset password with token
authRoutes.post(
  '/password/reset',
  rateLimit(RATE_LIMITS.passwordReset),
  zValidator('json', resetPasswordSchema),
  (c) => authController.resetPassword(c)
)

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /auth/logout - End current session
authRoutes.post('/logout', auth, (c) => authController.logout(c))

// POST /auth/logout-all - End all sessions
authRoutes.post('/logout-all', auth, (c) => authController.logoutAll(c))

// GET /auth/me - Get current user
authRoutes.get('/me', auth, (c) => authController.me(c))

// ─────────────────────────────────────────────────────────────────────────────
// Session Management
// ─────────────────────────────────────────────────────────────────────────────

// GET /auth/sessions - List active sessions
authRoutes.get('/sessions', auth, (c) => authController.sessions(c))

// DELETE /auth/sessions/:id - Revoke specific session
authRoutes.delete('/sessions/:id', auth, (c) => authController.revokeSession(c))

// ─────────────────────────────────────────────────────────────────────────────
// Email Verification
// ─────────────────────────────────────────────────────────────────────────────

// POST /auth/verify/send-code - Send verification code
authRoutes.post(
  '/verify/send-code',
  auth,
  rateLimit({ limit: 3, window: 3600, prefix: 'rl:auth:verify:send' }),
  (c) => authController.sendVerificationCode(c)
)

// POST /auth/verify/confirm - Verify email with code
authRoutes.post(
  '/verify/confirm',
  auth,
  rateLimit({ limit: 5, window: 3600, prefix: 'rl:auth:verify:confirm' }),
  zValidator('json', verifyCodeSchema),
  (c) => authController.verifyEmail(c)
)

// GET /auth/verify/status - Check verification status
authRoutes.get('/verify/status', auth, (c) => authController.verificationStatus(c))

// ─────────────────────────────────────────────────────────────────────────────
// Password Management (Authenticated)
// ─────────────────────────────────────────────────────────────────────────────

// POST /auth/password/change - Change password (requires current password)
authRoutes.post(
  '/password/change',
  auth,
  rateLimit({ limit: 5, window: 3600, prefix: 'rl:auth:password:change' }),
  zValidator('json', changePasswordSchema),
  (c) => authController.changePassword(c)
)

// POST /auth/password/set - Set password (for OAuth users without password)
authRoutes.post(
  '/password/set',
  auth,
  rateLimit({ limit: 5, window: 3600, prefix: 'rl:auth:password:set' }),
  zValidator('json', setPasswordSchema),
  (c) => authController.setPassword(c)
)

// GET /auth/password/status - Check if user has password set
authRoutes.get('/password/status', auth, (c) => authController.passwordStatus(c))

// ─────────────────────────────────────────────────────────────────────────────
// Two-Factor Authentication (Bible: 02-USERS, 05-TECH)
// ─────────────────────────────────────────────────────────────────────────────

// POST /auth/2fa/setup - Initiate 2FA setup (get QR code and backup codes)
authRoutes.post(
  '/2fa/setup',
  auth,
  rateLimit({ limit: 5, window: 3600, prefix: 'rl:auth:2fa:setup' }),
  (c) => authController.twoFactorSetup(c)
)

// POST /auth/2fa/verify - Verify TOTP code and enable 2FA
authRoutes.post(
  '/2fa/verify',
  auth,
  rateLimit({ limit: 10, window: 3600, prefix: 'rl:auth:2fa:verify' }),
  zValidator('json', twoFactorVerifySchema),
  (c) => authController.twoFactorVerify(c)
)

// POST /auth/2fa/disable - Disable 2FA (requires current 2FA code)
authRoutes.post(
  '/2fa/disable',
  auth,
  rateLimit({ limit: 5, window: 3600, prefix: 'rl:auth:2fa:disable' }),
  zValidator('json', twoFactorDisableSchema),
  (c) => authController.twoFactorDisable(c)
)

// POST /auth/2fa/backup-codes/regenerate - Generate new backup codes
authRoutes.post(
  '/2fa/backup-codes/regenerate',
  auth,
  rateLimit({ limit: 3, window: 3600, prefix: 'rl:auth:2fa:regenerate' }),
  zValidator('json', twoFactorRegenerateSchema),
  (c) => authController.twoFactorRegenerateBackupCodes(c)
)

// GET /auth/2fa/status - Get 2FA status
authRoutes.get('/2fa/status', auth, (c) => authController.twoFactorStatus(c))
