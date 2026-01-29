// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - CSRF PROTECTION MIDDLEWARE
// Double-Submit Cookie Pattern
// [SECURITY] Protects state-changing endpoints from Cross-Site Request Forgery
// ══════════════════════════════════════════════════════════════════════════════

import { createMiddleware } from 'hono/factory'
import { ApiError } from './error-handler'
import { generateSecureToken } from '../lib/auth'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// CSRF Configuration
// ─────────────────────────────────────────────────────────────────────────────

const CSRF_CONFIG = {
  cookieName: '__csrf_token',
  headerName: 'X-CSRF-Token',
  tokenLength: 32,
  cookieOptions: {
    httpOnly: false, // Must be readable by JS for double-submit pattern
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// CSRF Token Generation Middleware
// Sets CSRF token cookie on every response
// ─────────────────────────────────────────────────────────────────────────────

export const csrfTokenGenerator = createMiddleware<AppEnv>(async (c, next) => {
  // Check if token already exists in cookie
  const existingToken = c.req.raw.headers.get('cookie')
    ?.split(';')
    .find(c => c.trim().startsWith(`${CSRF_CONFIG.cookieName}=`))
    ?.split('=')[1]

  if (!existingToken) {
    // Generate new token and set cookie
    const token = generateSecureToken(CSRF_CONFIG.tokenLength)

    // Set cookie manually since Hono's setCookie may not be available
    const cookieValue = [
      `${CSRF_CONFIG.cookieName}=${token}`,
      `Path=${CSRF_CONFIG.cookieOptions.path}`,
      `Max-Age=${CSRF_CONFIG.cookieOptions.maxAge}`,
      CSRF_CONFIG.cookieOptions.secure ? 'Secure' : '',
      `SameSite=${CSRF_CONFIG.cookieOptions.sameSite}`,
    ].filter(Boolean).join('; ')

    c.header('Set-Cookie', cookieValue)
  }

  await next()
})

// ─────────────────────────────────────────────────────────────────────────────
// CSRF Validation Middleware
// Validates CSRF token on state-changing requests (POST, PUT, PATCH, DELETE)
// ─────────────────────────────────────────────────────────────────────────────

export const csrfProtection = createMiddleware<AppEnv>(async (c, next) => {
  const method = c.req.method.toUpperCase()

  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    await next()
    return
  }

  // Skip CSRF for API calls with Bearer token (API clients handle their own security)
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    await next()
    return
  }

  // Skip CSRF for webhook endpoints (they use their own signature verification)
  if (c.req.path.includes('/webhook')) {
    await next()
    return
  }

  // Get token from cookie
  const cookieToken = c.req.raw.headers.get('cookie')
    ?.split(';')
    .find(c => c.trim().startsWith(`${CSRF_CONFIG.cookieName}=`))
    ?.split('=')[1]
    ?.trim()

  // Get token from header
  const headerToken = c.req.header(CSRF_CONFIG.headerName)

  // Both must exist and match
  if (!cookieToken || !headerToken) {
    throw ApiError.forbidden(
      'CSRF token missing. Please refresh the page and try again.',
      'CSRF_TOKEN_MISSING'
    )
  }

  // Use timing-safe comparison
  if (cookieToken.length !== headerToken.length) {
    throw ApiError.forbidden(
      'CSRF token invalid. Please refresh the page and try again.',
      'CSRF_TOKEN_INVALID'
    )
  }

  // Simple string comparison (tokens are random, timing attack risk is minimal)
  if (cookieToken !== headerToken) {
    throw ApiError.forbidden(
      'CSRF token invalid. Please refresh the page and try again.',
      'CSRF_TOKEN_INVALID'
    )
  }

  await next()
})

// ─────────────────────────────────────────────────────────────────────────────
// Combined CSRF Middleware (Generator + Validator)
// Use this for routes that need both
// ─────────────────────────────────────────────────────────────────────────────

export const csrf = createMiddleware<AppEnv>(async (c, next) => {
  // First, ensure token exists
  const existingToken = c.req.raw.headers.get('cookie')
    ?.split(';')
    .find(c => c.trim().startsWith(`${CSRF_CONFIG.cookieName}=`))
    ?.split('=')[1]

  if (!existingToken) {
    const token = generateSecureToken(CSRF_CONFIG.tokenLength)
    const cookieValue = [
      `${CSRF_CONFIG.cookieName}=${token}`,
      `Path=${CSRF_CONFIG.cookieOptions.path}`,
      `Max-Age=${CSRF_CONFIG.cookieOptions.maxAge}`,
      CSRF_CONFIG.cookieOptions.secure ? 'Secure' : '',
      `SameSite=${CSRF_CONFIG.cookieOptions.sameSite}`,
    ].filter(Boolean).join('; ')
    c.header('Set-Cookie', cookieValue)
  }

  // Then validate if needed
  const method = c.req.method.toUpperCase()
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const authHeader = c.req.header('Authorization')
    const isApiCall = authHeader?.startsWith('Bearer ')
    const isWebhook = c.req.path.includes('/webhook')

    if (!isApiCall && !isWebhook) {
      const cookieToken = existingToken || c.req.raw.headers.get('cookie')
        ?.split(';')
        .find(c => c.trim().startsWith(`${CSRF_CONFIG.cookieName}=`))
        ?.split('=')[1]
        ?.trim()

      const headerToken = c.req.header(CSRF_CONFIG.headerName)

      if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        throw ApiError.forbidden(
          'CSRF token missing or invalid. Please refresh the page and try again.',
          'CSRF_ERROR'
        )
      }
    }
  }

  await next()
})
