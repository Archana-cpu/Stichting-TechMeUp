// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - OAUTH ROUTES
// [P-049] Only Google, Apple, e-Devlet supported
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createHash } from 'node:crypto'
import { db, eq, and, or } from "@voxpoll/database"
import { users, accounts, sessions, organizations, organizationMembers, ssoConfigs } from "@voxpoll/database"
import { ApiError } from '../middleware/error-handler'
import { auth } from '../middleware/auth'
import { rateLimit, RATE_LIMITS } from '../middleware/rate-limit'
import { generateSessionToken } from '../lib/auth'
import {
  generateOAuthState,
  hashState,
  getGoogleAuthUrl,
  exchangeGoogleCode,
  getGoogleUserInfo,
  verifyGoogleIdToken,
  getAppleAuthUrl,
  exchangeAppleCode,
  verifyAppleIdToken,
  parseAppleUserData,
  generateUsername,
  getEDevletAuthUrl,
  exchangeEDevletCode,
  getEDevletUserInfo,
  validateTCKimlikNo,
  calculateBirthYearFromTCDate,
  getSSOAuthUrl,
  exchangeSSOCode,
  parseSAMLResponse,
  type OAuthPlatform,
  type SSOConfig,
} from '../lib/oauth'
import { getRedis } from '../lib/redis'
import type { AppEnv } from '../types'

// Helper: Generate token hash for secure storage
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export const oauthRoutes = new Hono<AppEnv>()

// ─────────────────────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────────────────────

const initiateSchema = z.object({
  returnUrl: z.string().url().optional(),
  platform: z.enum(['web', 'platform']).default('web'),
})

const callbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State is required'),
})

const mobileTokenSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
})

const appleCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State is required'),
  id_token: z.string().optional(), // Apple sends id_token in form_post
  user: z.string().optional(), // Apple sends user data only on first auth
})

const appleMobileSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
  fullName: z.object({
    givenName: z.string().optional(),
    familyName: z.string().optional(),
  }).optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/oauth/google/initiate
// Start Google OAuth flow
// ─────────────────────────────────────────────────────────────────────────────

oauthRoutes.get(
  '/google/initiate',
  zValidator('query', initiateSchema),
  async (c) => {
    const { returnUrl, platform } = c.req.valid('query')

    // Generate state for CSRF protection
    const state = generateOAuthState()
    const stateHash = hashState(state)

    // Store state in Redis (5 minute expiry)
    const redis = getRedis()
    const stateData = JSON.stringify({
      returnUrl: returnUrl || '/',
      platform,
      createdAt: Date.now(),
    })
    await redis.setex(`oauth:state:${stateHash}`, 300, stateData)

    // Generate Google OAuth URL
    const authUrl = getGoogleAuthUrl(platform as OAuthPlatform, state)

    return c.json({
      success: true,
      data: {
        authUrl,
        state,
      },
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/oauth/google/callback
// Handle Google OAuth callback
// ─────────────────────────────────────────────────────────────────────────────

oauthRoutes.post(
  '/google/callback',
  rateLimit(RATE_LIMITS.login),
  zValidator('json', callbackSchema),
  async (c) => {
    const { code, state } = c.req.valid('json')

    // Verify state
    const stateHash = hashState(state)
    const redis = getRedis()
    const stateDataStr = await redis.get(`oauth:state:${stateHash}`)

    if (!stateDataStr) {
      throw ApiError.badRequest('Invalid or expired state', 'INVALID_STATE')
    }

    // Delete state to prevent reuse
    await redis.del(`oauth:state:${stateHash}`)

    const stateData = JSON.parse(stateDataStr) as {
      returnUrl: string
      platform: OAuthPlatform
      createdAt: number
    }

    // Exchange code for tokens
    let googleTokens
    try {
      googleTokens = await exchangeGoogleCode(code, stateData.platform)
    } catch (error) {
      throw ApiError.badRequest('Failed to exchange authorization code', 'OAUTH_EXCHANGE_FAILED')
    }

    // Get user info from Google
    let googleUser
    try {
      googleUser = await getGoogleUserInfo(googleTokens.access_token)
    } catch (error) {
      throw ApiError.badRequest('Failed to get user info from Google', 'OAUTH_USERINFO_FAILED')
    }

    // Check if user exists with this email
    const userResult = await db.select().from(users).where(eq(users.email, googleUser.email.toLowerCase())).limit(1)
    let user = userResult[0] ?? null

    // Fetch accounts if user exists
    let userAccounts: typeof accounts.$inferSelect[] = []
    if (user) {
      userAccounts = await db.select().from(accounts).where(eq(accounts.userId, user.id))
    }

    const isNewUser = !user

    if (user) {
      // Check if Google OAuth is already linked
      const existingOAuth = userAccounts.find(
        (acc) => acc.provider === 'GOOGLE' && acc.providerAccountId === googleUser.id
      )

      if (!existingOAuth) {
        // Link Google to existing account
        await db.insert(accounts).values({
          userId: user.id,
          provider: 'GOOGLE',
          providerAccountId: googleUser.id,
          accessToken: googleTokens.access_token,
          refreshToken: googleTokens.refresh_token,
          expiresAt: googleTokens.expires_in
            ? new Date(Date.now() + googleTokens.expires_in * 1000)
            : null,
        })
      } else {
        // Update existing OAuth tokens
        await db.update(accounts).set({
          accessToken: googleTokens.access_token,
          refreshToken: googleTokens.refresh_token || existingOAuth.refreshToken,
          expiresAt: googleTokens.expires_in
            ? new Date(Date.now() + googleTokens.expires_in * 1000)
            : existingOAuth.expiresAt,
        }).where(eq(accounts.id, existingOAuth.id))
      }

      // Check user status
      if (user.status === 'BANNED') {
        throw ApiError.forbidden('Account has been banned', 'ACCOUNT_BANNED')
      }
      if (user.status === 'SUSPENDED') {
        throw ApiError.forbidden('Account is suspended', 'ACCOUNT_SUSPENDED')
      }
    } else {
      // Create new user with Google account
      const username = generateUsername(googleUser.email, googleUser.name)

      const newUserResult = await db.insert(users).values({
        email: googleUser.email.toLowerCase(),
        username,
        displayName: googleUser.name || username,
        avatarUrl: googleUser.picture,
        emailVerified: googleUser.verified_email,
        status: googleUser.verified_email ? 'ACTIVE' : 'PENDING_VERIFICATION',
      }).returning()
      user = newUserResult[0]!

      // Create the account separately
      await db.insert(accounts).values({
        userId: user.id,
        provider: 'GOOGLE',
        providerAccountId: googleUser.id,
        accessToken: googleTokens.access_token,
        refreshToken: googleTokens.refresh_token,
        expiresAt: googleTokens.expires_in
          ? new Date(Date.now() + googleTokens.expires_in * 1000)
          : null,
      })
    }

    // Create session
    const token = generateSessionToken()
    const tokenHash = hashToken(token)
    const refreshToken = generateSessionToken()
    const refreshTokenHash = hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] ||
                      c.req.header('x-real-ip') || null
    const userAgent = c.req.header('user-agent') || null

    const sessionResult = await db.insert(sessions).values({
      tokenHash,
      refreshTokenHash,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    }).returning()
    const session = sessionResult[0]!

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
          verificationLevel: user.verificationLevel,
          isNewUser,
        },
        session: {
          token,
          refreshToken,
          expiresAt: session.expiresAt.toISOString(),
        },
        returnUrl: stateData.returnUrl,
      },
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/oauth/google/mobile
// Handle Google Sign-In from mobile (ID token verification)
// ─────────────────────────────────────────────────────────────────────────────

oauthRoutes.post(
  '/google/mobile',
  rateLimit(RATE_LIMITS.login),
  zValidator('json', mobileTokenSchema),
  async (c) => {
    const { idToken } = c.req.valid('json')

    // Verify ID token with Google
    let googleUser
    try {
      googleUser = await verifyGoogleIdToken(idToken, 'mobile')
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired ID token', 'INVALID_ID_TOKEN')
    }

    // Check if user exists with this email
    const userResult = await db.select().from(users).where(eq(users.email, googleUser.email.toLowerCase())).limit(1)
    let user = userResult[0] ?? null

    // Fetch accounts if user exists
    let userAccounts: typeof accounts.$inferSelect[] = []
    if (user) {
      userAccounts = await db.select().from(accounts).where(eq(accounts.userId, user.id))
    }

    const isNewUser = !user

    if (user) {
      // Check if Google OAuth is already linked
      const existingOAuth = userAccounts.find(
        (acc) => acc.provider === 'GOOGLE' && acc.providerAccountId === googleUser.id
      )

      if (!existingOAuth) {
        // Link Google to existing account
        await db.insert(accounts).values({
          userId: user.id,
          provider: 'GOOGLE',
          providerAccountId: googleUser.id,
        })
      }

      // Check user status
      if (user.status === 'BANNED') {
        throw ApiError.forbidden('Account has been banned', 'ACCOUNT_BANNED')
      }
      if (user.status === 'SUSPENDED') {
        throw ApiError.forbidden('Account is suspended', 'ACCOUNT_SUSPENDED')
      }
    } else {
      // Create new user with Google account
      const username = generateUsername(googleUser.email, googleUser.name)

      const newUserResult = await db.insert(users).values({
        email: googleUser.email.toLowerCase(),
        username,
        displayName: googleUser.name || username,
        avatarUrl: googleUser.picture,
        emailVerified: true,
        status: 'ACTIVE',
      }).returning()
      user = newUserResult[0]!

      // Create the account separately
      await db.insert(accounts).values({
        userId: user.id,
        provider: 'GOOGLE',
        providerAccountId: googleUser.id,
      })
    }

    // Create session
    const token = generateSessionToken()
    const tokenHash = hashToken(token)
    const refreshToken = generateSessionToken()
    const refreshTokenHash = hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] ||
                      c.req.header('x-real-ip') || null
    const userAgent = c.req.header('user-agent') || null

    const sessionResult = await db.insert(sessions).values({
      tokenHash,
      refreshTokenHash,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    }).returning()
    const session = sessionResult[0]!

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
          verificationLevel: user.verificationLevel,
          isNewUser,
        },
        session: {
          token,
          refreshToken,
          expiresAt: session.expiresAt.toISOString(),
        },
      },
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/oauth/apple/initiate
// Start Apple Sign-In flow
// ─────────────────────────────────────────────────────────────────────────────

oauthRoutes.get(
  '/apple/initiate',
  zValidator('query', initiateSchema),
  async (c) => {
    const { returnUrl, platform } = c.req.valid('query')

    // Generate state for CSRF protection
    const state = generateOAuthState()
    const stateHash = hashState(state)

    // Store state in Redis (5 minute expiry)
    const redis = getRedis()
    const stateData = JSON.stringify({
      returnUrl: returnUrl || '/',
      platform,
      createdAt: Date.now(),
    })
    await redis.setex(`oauth:state:${stateHash}`, 300, stateData)

    // Generate Apple OAuth URL
    const authUrl = getAppleAuthUrl(platform as OAuthPlatform, state)

    return c.json({
      success: true,
      data: {
        authUrl,
        state,
      },
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/oauth/apple/callback
// Handle Apple Sign-In callback (form_post response mode)
// ─────────────────────────────────────────────────────────────────────────────

oauthRoutes.post(
  '/apple/callback',
  rateLimit(RATE_LIMITS.login),
  zValidator('form', appleCallbackSchema),
  async (c) => {
    const { code, state, id_token, user: userJson } = c.req.valid('form')

    // Verify state
    const stateHash = hashState(state)
    const redis = getRedis()
    const stateDataStr = await redis.get(`oauth:state:${stateHash}`)

    if (!stateDataStr) {
      throw ApiError.badRequest('Invalid or expired state', 'INVALID_STATE')
    }

    // Delete state to prevent reuse
    await redis.del(`oauth:state:${stateHash}`)

    const stateData = JSON.parse(stateDataStr) as {
      returnUrl: string
      platform: OAuthPlatform
      createdAt: number
    }

    // Parse user data (only sent on first authorization)
    const appleUserData = parseAppleUserData(userJson)

    // Verify the ID token if provided, otherwise exchange the code
    let appleUser
    if (id_token) {
      try {
        appleUser = await verifyAppleIdToken(id_token, stateData.platform)
      } catch (error) {
        throw ApiError.badRequest('Invalid Apple ID token', 'INVALID_ID_TOKEN')
      }
    } else {
      // Exchange code for tokens
      try {
        const tokens = await exchangeAppleCode(code, stateData.platform)
        appleUser = await verifyAppleIdToken(tokens.id_token, stateData.platform)
      } catch (error) {
        throw ApiError.badRequest('Failed to exchange authorization code', 'OAUTH_EXCHANGE_FAILED')
      }
    }

    // Merge user data (Apple only sends name on first auth)
    if (appleUserData?.name) {
      appleUser.given_name = appleUserData.name.firstName
      appleUser.family_name = appleUserData.name.lastName
      appleUser.name = [appleUserData.name.firstName, appleUserData.name.lastName]
        .filter(Boolean)
        .join(' ') || undefined
    }

    // Check if user exists with this Apple ID
    // First try to find by email
    let user: typeof users.$inferSelect | null = null
    let userAccounts: typeof accounts.$inferSelect[] = []

    if (appleUser.email) {
      const userByEmailResult = await db.select().from(users).where(eq(users.email, appleUser.email.toLowerCase())).limit(1)
      user = userByEmailResult[0] ?? null
    }

    // If not found by email, try to find by Apple account
    if (!user) {
      const accountResult = await db.select().from(accounts).where(
        and(eq(accounts.provider, 'APPLE'), eq(accounts.providerAccountId, appleUser.id))
      ).limit(1)
      const appleAccount = accountResult[0]
      if (appleAccount) {
        const userByAccountResult = await db.select().from(users).where(eq(users.id, appleAccount.userId)).limit(1)
        user = userByAccountResult[0] ?? null
      }
    }

    // Fetch accounts if user exists
    if (user) {
      userAccounts = await db.select().from(accounts).where(eq(accounts.userId, user.id))
    }

    const isNewUser = !user

    if (user) {
      // Check if Apple OAuth is already linked
      const existingOAuth = userAccounts.find(
        (acc) => acc.provider === 'APPLE' && acc.providerAccountId === appleUser.id
      )

      if (!existingOAuth) {
        // Link Apple to existing account
        await db.insert(accounts).values({
          userId: user.id,
          provider: 'APPLE',
          providerAccountId: appleUser.id,
        })
      }

      // Check user status
      if (user.status === 'BANNED') {
        throw ApiError.forbidden('Account has been banned', 'ACCOUNT_BANNED')
      }
      if (user.status === 'SUSPENDED') {
        throw ApiError.forbidden('Account is suspended', 'ACCOUNT_SUSPENDED')
      }
    } else {
      // Create new user with Apple account
      // Apple may use private relay email, so use Apple ID as fallback
      const email = appleUser.email || `${appleUser.id}@privaterelay.appleid.com`
      const username = generateUsername(email, appleUser.name)

      const newUserResult = await db.insert(users).values({
        email: email.toLowerCase(),
        username,
        displayName: appleUser.name || username,
        emailVerified: appleUser.email_verified,
        status: appleUser.email_verified ? 'ACTIVE' : 'PENDING_VERIFICATION',
      }).returning()
      user = newUserResult[0]!

      // Create the account separately
      await db.insert(accounts).values({
        userId: user.id,
        provider: 'APPLE',
        providerAccountId: appleUser.id,
      })
    }

    // Create session
    const token = generateSessionToken()
    const tokenHash = hashToken(token)
    const refreshToken = generateSessionToken()
    const refreshTokenHash = hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] ||
                      c.req.header('x-real-ip') || null
    const userAgent = c.req.header('user-agent') || null

    const sessionResult = await db.insert(sessions).values({
      tokenHash,
      refreshTokenHash,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    }).returning()
    const session = sessionResult[0]!

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
          verificationLevel: user.verificationLevel,
          isNewUser,
        },
        session: {
          token,
          refreshToken,
          expiresAt: session.expiresAt.toISOString(),
        },
        returnUrl: stateData.returnUrl,
      },
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/oauth/apple/mobile
// Handle Apple Sign-In from iOS (ID token verification)
// ─────────────────────────────────────────────────────────────────────────────

oauthRoutes.post(
  '/apple/mobile',
  rateLimit(RATE_LIMITS.login),
  zValidator('json', appleMobileSchema),
  async (c) => {
    const { idToken, fullName } = c.req.valid('json')

    // Verify ID token with Apple
    let appleUser
    try {
      appleUser = await verifyAppleIdToken(idToken, 'mobile')
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired ID token', 'INVALID_ID_TOKEN')
    }

    // Merge name data (only provided on first sign-in)
    if (fullName) {
      appleUser.given_name = fullName.givenName
      appleUser.family_name = fullName.familyName
      appleUser.name = [fullName.givenName, fullName.familyName]
        .filter(Boolean)
        .join(' ') || undefined
    }

    // Check if user exists with this Apple ID
    // First try to find by email
    let user: typeof users.$inferSelect | null = null
    let userAccounts: typeof accounts.$inferSelect[] = []

    if (appleUser.email) {
      const userByEmailResult = await db.select().from(users).where(eq(users.email, appleUser.email.toLowerCase())).limit(1)
      user = userByEmailResult[0] ?? null
    }

    // If not found by email, try to find by Apple account
    if (!user) {
      const accountResult = await db.select().from(accounts).where(
        and(eq(accounts.provider, 'APPLE'), eq(accounts.providerAccountId, appleUser.id))
      ).limit(1)
      const appleAccount = accountResult[0]
      if (appleAccount) {
        const userByAccountResult = await db.select().from(users).where(eq(users.id, appleAccount.userId)).limit(1)
        user = userByAccountResult[0] ?? null
      }
    }

    // Fetch accounts if user exists
    if (user) {
      userAccounts = await db.select().from(accounts).where(eq(accounts.userId, user.id))
    }

    const isNewUser = !user

    if (user) {
      // Check if Apple OAuth is already linked
      const existingOAuth = userAccounts.find(
        (acc) => acc.provider === 'APPLE' && acc.providerAccountId === appleUser.id
      )

      if (!existingOAuth) {
        // Link Apple to existing account
        await db.insert(accounts).values({
          userId: user.id,
          provider: 'APPLE',
          providerAccountId: appleUser.id,
        })
      }

      // Check user status
      if (user.status === 'BANNED') {
        throw ApiError.forbidden('Account has been banned', 'ACCOUNT_BANNED')
      }
      if (user.status === 'SUSPENDED') {
        throw ApiError.forbidden('Account is suspended', 'ACCOUNT_SUSPENDED')
      }
    } else {
      // Create new user with Apple account
      const email = appleUser.email || `${appleUser.id}@privaterelay.appleid.com`
      const username = generateUsername(email, appleUser.name)

      const newUserResult = await db.insert(users).values({
        email: email.toLowerCase(),
        username,
        displayName: appleUser.name || username,
        emailVerified: appleUser.email_verified,
        status: appleUser.email_verified ? 'ACTIVE' : 'PENDING_VERIFICATION',
      }).returning()
      user = newUserResult[0]!

      // Create the account separately
      await db.insert(accounts).values({
        userId: user.id,
        provider: 'APPLE',
        providerAccountId: appleUser.id,
      })
    }

    // Create session
    const token = generateSessionToken()
    const tokenHash = hashToken(token)
    const refreshToken = generateSessionToken()
    const refreshTokenHash = hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] ||
                      c.req.header('x-real-ip') || null
    const userAgent = c.req.header('user-agent') || null

    const sessionResult = await db.insert(sessions).values({
      tokenHash,
      refreshTokenHash,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    }).returning()
    const session = sessionResult[0]!

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
          verificationLevel: user.verificationLevel,
          isNewUser,
        },
        session: {
          token,
          refreshToken,
          expiresAt: session.expiresAt.toISOString(),
        },
      },
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/oauth/providers
// List linked OAuth providers for current user
// ─────────────────────────────────────────────────────────────────────────────

oauthRoutes.get('/providers', auth, async (c) => {
  const user = c.get('user')!

  const oauthAccounts = await db.select({
    id: accounts.id,
    provider: accounts.provider,
    providerAccountId: accounts.providerAccountId,
    createdAt: accounts.createdAt,
  }).from(accounts).where(eq(accounts.userId, user.id))

  return c.json({
    success: true,
    data: {
      providers: oauthAccounts,
    },
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /auth/oauth/:provider
// Unlink OAuth provider from account
// ─────────────────────────────────────────────────────────────────────────────

const unlinkSchema = z.object({
  provider: z.enum(['GOOGLE', 'APPLE', 'E_DEVLET']),
})

oauthRoutes.delete(
  '/:provider',
  auth,
  zValidator('param', unlinkSchema),
  async (c) => {
    const user = c.get('user')!
    const { provider } = c.req.valid('param')

    // Check if user has password set (cannot unlink last auth method)
    const fullUserResult = await db.select().from(users).where(eq(users.id, user.id)).limit(1)
    const fullUser = fullUserResult[0]

    if (!fullUser) {
      throw ApiError.notFound('User not found')
    }

    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, user.id))

    const hasPassword = !!fullUser.passwordHash
    const oauthCount = userAccounts.length

    if (!hasPassword && oauthCount <= 1) {
      throw ApiError.badRequest(
        'Cannot unlink last authentication method. Set a password first.',
        'CANNOT_UNLINK_LAST_AUTH'
      )
    }

    // Find and delete OAuth account
    const oauthAccountResult = await db.select().from(accounts).where(
      and(eq(accounts.userId, user.id), eq(accounts.provider, provider))
    ).limit(1)
    const oauthAccount = oauthAccountResult[0]

    if (!oauthAccount) {
      throw ApiError.notFound(`${provider} is not linked to your account`)
    }

    await db.delete(accounts).where(eq(accounts.id, oauthAccount.id))

    return c.json({
      success: true,
      data: {
        message: `${provider} unlinked successfully`,
      },
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/oauth/edevlet/initiate
// Start e-Devlet OAuth flow (Turkish Government Authentication)
// ─────────────────────────────────────────────────────────────────────────────

oauthRoutes.get(
  '/edevlet/initiate',
  zValidator('query', initiateSchema),
  async (c) => {
    const { returnUrl } = c.req.valid('query')

    const state = generateOAuthState()
    const stateHash = hashState(state)

    const redis = getRedis()
    const stateData = JSON.stringify({
      returnUrl: returnUrl || '/',
      createdAt: Date.now(),
    })
    await redis.setex(`oauth:state:${stateHash}`, 300, stateData)

    try {
      const authUrl = getEDevletAuthUrl(state)

      return c.json({
        success: true,
        data: {
          authUrl,
          state,
        },
      })
    } catch (error) {
      throw ApiError.serviceUnavailable('e-Devlet authentication is not configured', 'EDEVLET_NOT_CONFIGURED')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/oauth/edevlet/callback
// Handle e-Devlet OAuth callback
// ─────────────────────────────────────────────────────────────────────────────

oauthRoutes.post(
  '/edevlet/callback',
  rateLimit(RATE_LIMITS.login),
  zValidator('json', callbackSchema),
  async (c) => {
    const { code, state } = c.req.valid('json')

    const stateHash = hashState(state)
    const redis = getRedis()
    const stateDataStr = await redis.get(`oauth:state:${stateHash}`)

    if (!stateDataStr) {
      throw ApiError.badRequest('Invalid or expired state', 'INVALID_STATE')
    }

    await redis.del(`oauth:state:${stateHash}`)

    const stateData = JSON.parse(stateDataStr) as {
      returnUrl: string
      createdAt: number
    }

    let edevletTokens
    try {
      edevletTokens = await exchangeEDevletCode(code)
    } catch (error) {
      throw ApiError.badRequest('Failed to exchange authorization code', 'OAUTH_EXCHANGE_FAILED')
    }

    let edevletUser
    try {
      edevletUser = await getEDevletUserInfo(edevletTokens.access_token)
    } catch (error) {
      throw ApiError.badRequest('Failed to get user info from e-Devlet', 'OAUTH_USERINFO_FAILED')
    }

    if (!validateTCKimlikNo(edevletUser.tcKimlikNo)) {
      throw ApiError.badRequest('Invalid TC Kimlik No received', 'INVALID_TC_KIMLIK')
    }

    const existingAccountResult = await db.select().from(accounts).where(
      and(eq(accounts.provider, 'E_DEVLET'), eq(accounts.tcKimlikNo, edevletUser.tcKimlikNo))
    ).limit(1)
    const existingAccount = existingAccountResult[0]

    let user: typeof users.$inferSelect | null = null
    let userAccounts: typeof accounts.$inferSelect[] = []
    const isNewUser = !existingAccount

    if (existingAccount) {
      const userResult = await db.select().from(users).where(eq(users.id, existingAccount.userId)).limit(1)
      user = userResult[0] ?? null

      if (!user) {
        throw ApiError.notFound('User account not found')
      }

      userAccounts = await db.select().from(accounts).where(eq(accounts.userId, user.id))

      if (user.status === 'BANNED') {
        throw ApiError.forbidden('Account has been banned', 'ACCOUNT_BANNED')
      }
      if (user.status === 'SUSPENDED') {
        throw ApiError.forbidden('Account is suspended', 'ACCOUNT_SUSPENDED')
      }

      await db.update(accounts).set({
        accessToken: edevletTokens.access_token,
        refreshToken: edevletTokens.refresh_token,
        eDevletVerified: true,
        eDevletVerifiedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(accounts.id, existingAccount.id))
    } else {
      const displayName = `${edevletUser.ad} ${edevletUser.soyad}`
      const username = generateUsername(
        edevletUser.email || `${edevletUser.tcKimlikNo}@edevlet.gov.tr`,
        displayName
      )

      let birthYear: number | null = null
      try {
        birthYear = calculateBirthYearFromTCDate(edevletUser.dogumTarihi)
      } catch {
        // Ignore birth year parsing errors
      }

      const newUserResult = await db.insert(users).values({
        email: edevletUser.email?.toLowerCase() || null,
        phone: edevletUser.telefon || null,
        username,
        displayName,
        emailVerified: !!edevletUser.email,
        phoneVerified: !!edevletUser.telefon,
        status: 'ACTIVE',
        isVerified: true,
        verifiedAt: new Date(),
        verificationLevel: 'IDENTITY',
        verificationMethod: 'GOVERNMENT_ID',
        gender: edevletUser.cinsiyet === 'E' ? 'MALE' : 'FEMALE',
        birthYear,
        country: 'TR',
      }).returning()
      user = newUserResult[0]!

      await db.insert(accounts).values({
        userId: user.id,
        provider: 'E_DEVLET',
        providerAccountId: edevletUser.tcKimlikNo,
        tcKimlikNo: edevletUser.tcKimlikNo,
        accessToken: edevletTokens.access_token,
        refreshToken: edevletTokens.refresh_token,
        eDevletVerified: true,
        eDevletVerifiedAt: new Date(),
      })
    }

    const token = generateSessionToken()
    const tokenHash = hashToken(token)
    const refreshToken = generateSessionToken()
    const refreshTokenHash = hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] ||
                      c.req.header('x-real-ip') || null
    const userAgent = c.req.header('user-agent') || null

    const sessionResult = await db.insert(sessions).values({
      tokenHash,
      refreshTokenHash,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    }).returning()
    const session = sessionResult[0]!

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
          verificationLevel: user.verificationLevel,
          isNewUser,
          isGovernmentVerified: true,
        },
        session: {
          token,
          refreshToken,
          expiresAt: session.expiresAt.toISOString(),
        },
        returnUrl: stateData.returnUrl,
      },
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/oauth/edevlet/link
// Link e-Devlet to existing account (requires authentication)
// ─────────────────────────────────────────────────────────────────────────────

oauthRoutes.post(
  '/edevlet/link',
  auth,
  rateLimit(RATE_LIMITS.login),
  zValidator('json', callbackSchema),
  async (c) => {
    const user = c.get('user')!
    const { code, state } = c.req.valid('json')

    const stateHash = hashState(state)
    const redis = getRedis()
    const stateDataStr = await redis.get(`oauth:state:${stateHash}`)

    if (!stateDataStr) {
      throw ApiError.badRequest('Invalid or expired state', 'INVALID_STATE')
    }

    await redis.del(`oauth:state:${stateHash}`)

    let edevletTokens
    try {
      edevletTokens = await exchangeEDevletCode(code)
    } catch (error) {
      throw ApiError.badRequest('Failed to exchange authorization code', 'OAUTH_EXCHANGE_FAILED')
    }

    let edevletUser
    try {
      edevletUser = await getEDevletUserInfo(edevletTokens.access_token)
    } catch (error) {
      throw ApiError.badRequest('Failed to get user info from e-Devlet', 'OAUTH_USERINFO_FAILED')
    }

    if (!validateTCKimlikNo(edevletUser.tcKimlikNo)) {
      throw ApiError.badRequest('Invalid TC Kimlik No received', 'INVALID_TC_KIMLIK')
    }

    const existingAccountResult = await db.select().from(accounts).where(
      and(eq(accounts.provider, 'E_DEVLET'), eq(accounts.tcKimlikNo, edevletUser.tcKimlikNo))
    ).limit(1)

    if (existingAccountResult[0]) {
      throw ApiError.conflict('This e-Devlet account is already linked to another user', 'EDEVLET_ALREADY_LINKED')
    }

    await db.insert(accounts).values({
      userId: user.id,
      provider: 'E_DEVLET',
      providerAccountId: edevletUser.tcKimlikNo,
      tcKimlikNo: edevletUser.tcKimlikNo,
      accessToken: edevletTokens.access_token,
      refreshToken: edevletTokens.refresh_token,
      eDevletVerified: true,
      eDevletVerifiedAt: new Date(),
    })

    await db.update(users).set({
      isVerified: true,
      verifiedAt: new Date(),
      verificationLevel: 'IDENTITY',
      verificationMethod: 'GOVERNMENT_ID',
      updatedAt: new Date(),
    }).where(eq(users.id, user.id))

    return c.json({
      success: true,
      data: {
        message: 'e-Devlet account linked successfully',
        verificationLevel: 'IDENTITY',
      },
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/oauth/sso/:slug/initiate
// Start SSO flow for organization (Enterprise Feature)
// ─────────────────────────────────────────────────────────────────────────────

const ssoSlugSchema = z.object({
  slug: z.string().min(1).max(100),
})

oauthRoutes.get(
  '/sso/:slug/initiate',
  zValidator('param', ssoSlugSchema),
  zValidator('query', initiateSchema),
  async (c) => {
    const { slug } = c.req.valid('param')
    const { returnUrl } = c.req.valid('query')

    const orgResult = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1)
    const org = orgResult[0]

    if (!org) {
      throw ApiError.notFound('Organization not found')
    }

    const ssoConfigResult = await db.select().from(ssoConfigs).where(
      and(eq(ssoConfigs.organizationId, org.id), eq(ssoConfigs.isActive, true))
    ).limit(1)
    const ssoConfig = ssoConfigResult[0]

    if (!ssoConfig) {
      throw ApiError.notFound('SSO is not configured for this organization')
    }

    const state = generateOAuthState()
    const stateHash = hashState(state)

    const redis = getRedis()
    const stateData = JSON.stringify({
      returnUrl: returnUrl || '/',
      organizationId: org.id,
      ssoConfigId: ssoConfig.id,
      provider: ssoConfig.provider,
      createdAt: Date.now(),
    })
    await redis.setex(`oauth:state:${stateHash}`, 300, stateData)

    const config: SSOConfig = {
      organizationId: org.id,
      provider: ssoConfig.provider as 'SAML' | 'OIDC',
      issuer: ssoConfig.issuer,
      ssoUrl: ssoConfig.ssoUrl,
      certificate: ssoConfig.certificate || undefined,
      clientId: ssoConfig.clientId || undefined,
      clientSecret: ssoConfig.clientSecret || undefined,
      callbackUrl: ssoConfig.callbackUrl,
      attributeMapping: ssoConfig.attributeMapping as SSOConfig['attributeMapping'],
    }

    const authUrl = getSSOAuthUrl(config, state)

    return c.json({
      success: true,
      data: {
        authUrl,
        state,
        provider: ssoConfig.provider,
      },
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/oauth/sso/callback
// Handle SSO callback (OIDC code exchange)
// ─────────────────────────────────────────────────────────────────────────────

oauthRoutes.post(
  '/sso/callback',
  rateLimit(RATE_LIMITS.login),
  zValidator('json', callbackSchema),
  async (c) => {
    const { code, state } = c.req.valid('json')

    const stateHash = hashState(state)
    const redis = getRedis()
    const stateDataStr = await redis.get(`oauth:state:${stateHash}`)

    if (!stateDataStr) {
      throw ApiError.badRequest('Invalid or expired state', 'INVALID_STATE')
    }

    await redis.del(`oauth:state:${stateHash}`)

    const stateData = JSON.parse(stateDataStr) as {
      returnUrl: string
      organizationId: string
      ssoConfigId: string
      provider: string
      createdAt: number
    }

    if (stateData.provider !== 'OIDC') {
      throw ApiError.badRequest('Invalid callback for SAML provider, use /saml/callback', 'WRONG_CALLBACK')
    }

    const ssoConfigResult = await db.select().from(ssoConfigs).where(
      and(eq(ssoConfigs.id, stateData.ssoConfigId), eq(ssoConfigs.isActive, true))
    ).limit(1)
    const ssoConfig = ssoConfigResult[0]

    if (!ssoConfig) {
      throw ApiError.notFound('SSO configuration not found or inactive')
    }

    const config: SSOConfig = {
      organizationId: ssoConfig.organizationId,
      provider: 'OIDC',
      issuer: ssoConfig.issuer,
      ssoUrl: ssoConfig.ssoUrl,
      clientId: ssoConfig.clientId || undefined,
      clientSecret: ssoConfig.clientSecret || undefined,
      callbackUrl: ssoConfig.callbackUrl,
      attributeMapping: ssoConfig.attributeMapping as SSOConfig['attributeMapping'],
    }

    let tokens
    try {
      tokens = await exchangeSSOCode(code, config)
    } catch (error) {
      throw ApiError.badRequest('Failed to exchange SSO code', 'SSO_EXCHANGE_FAILED')
    }

    let ssoUserEmail: string
    let ssoUserFirstName: string | undefined
    let ssoUserLastName: string | undefined

    if (tokens.idToken) {
      const parts = tokens.idToken.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1]!, 'base64').toString('utf8')) as Record<string, unknown>
        const mapping = config.attributeMapping
        ssoUserEmail = (payload[mapping.email] as string) || ''
        ssoUserFirstName = mapping.firstName ? (payload[mapping.firstName] as string) : undefined
        ssoUserLastName = mapping.lastName ? (payload[mapping.lastName] as string) : undefined
      } else {
        throw ApiError.badRequest('Invalid ID token format', 'INVALID_ID_TOKEN')
      }
    } else {
      throw ApiError.badRequest('No ID token received', 'MISSING_ID_TOKEN')
    }

    if (!ssoUserEmail) {
      throw ApiError.badRequest('Email not found in SSO response', 'MISSING_EMAIL')
    }

    const allowedDomains = ssoConfig.allowedDomains as string[] | null
    if (allowedDomains && allowedDomains.length > 0) {
      const emailDomain = ssoUserEmail.split('@')[1]?.toLowerCase()
      if (!emailDomain || !allowedDomains.map(d => d.toLowerCase()).includes(emailDomain)) {
        throw ApiError.forbidden('Email domain not allowed for this organization', 'DOMAIN_NOT_ALLOWED')
      }
    }

    let user: typeof users.$inferSelect | null = null
    const userResult = await db.select().from(users).where(eq(users.email, ssoUserEmail.toLowerCase())).limit(1)
    user = userResult[0] ?? null

    const isNewUser = !user

    if (!user && ssoConfig.autoProvisionUsers) {
      const displayName = [ssoUserFirstName, ssoUserLastName].filter(Boolean).join(' ') || ssoUserEmail.split('@')[0]!
      const username = generateUsername(ssoUserEmail, displayName)

      const newUserResult = await db.insert(users).values({
        email: ssoUserEmail.toLowerCase(),
        username,
        displayName,
        emailVerified: true,
        status: 'ACTIVE',
      }).returning()
      user = newUserResult[0]!

      await db.insert(organizationMembers).values({
        organizationId: stateData.organizationId,
        userId: user.id,
        role: ssoConfig.defaultRole,
        invitedBy: 'SSO',
      })
    } else if (!user) {
      throw ApiError.forbidden('User provisioning is disabled. Contact your administrator.', 'USER_NOT_PROVISIONED')
    }

    const membershipResult = await db.select().from(organizationMembers).where(
      and(eq(organizationMembers.organizationId, stateData.organizationId), eq(organizationMembers.userId, user.id))
    ).limit(1)

    if (!membershipResult[0]) {
      if (ssoConfig.autoProvisionUsers) {
        await db.insert(organizationMembers).values({
          organizationId: stateData.organizationId,
          userId: user.id,
          role: ssoConfig.defaultRole,
          invitedBy: 'SSO',
        })
      } else {
        throw ApiError.forbidden('You are not a member of this organization', 'NOT_ORG_MEMBER')
      }
    }

    if (user.status === 'BANNED') {
      throw ApiError.forbidden('Account has been banned', 'ACCOUNT_BANNED')
    }
    if (user.status === 'SUSPENDED') {
      throw ApiError.forbidden('Account is suspended', 'ACCOUNT_SUSPENDED')
    }

    const token = generateSessionToken()
    const tokenHash = hashToken(token)
    const refreshToken = generateSessionToken()
    const refreshTokenHash = hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] ||
                      c.req.header('x-real-ip') || null
    const userAgent = c.req.header('user-agent') || null

    const sessionResult = await db.insert(sessions).values({
      tokenHash,
      refreshTokenHash,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    }).returning()
    const session = sessionResult[0]!

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
          verificationLevel: user.verificationLevel,
          isNewUser,
        },
        session: {
          token,
          refreshToken,
          expiresAt: session.expiresAt.toISOString(),
        },
        returnUrl: stateData.returnUrl,
        organizationId: stateData.organizationId,
      },
    })
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/oauth/sso/saml/callback
// Handle SAML SSO callback
// ─────────────────────────────────────────────────────────────────────────────

const samlCallbackSchema = z.object({
  SAMLResponse: z.string().min(1, 'SAML response is required'),
  RelayState: z.string().min(1, 'Relay state is required'),
})

oauthRoutes.post(
  '/sso/saml/callback',
  rateLimit(RATE_LIMITS.login),
  zValidator('form', samlCallbackSchema),
  async (c) => {
    const { SAMLResponse, RelayState } = c.req.valid('form')

    const stateHash = hashState(RelayState)
    const redis = getRedis()
    const stateDataStr = await redis.get(`oauth:state:${stateHash}`)

    if (!stateDataStr) {
      throw ApiError.badRequest('Invalid or expired state', 'INVALID_STATE')
    }

    await redis.del(`oauth:state:${stateHash}`)

    const stateData = JSON.parse(stateDataStr) as {
      returnUrl: string
      organizationId: string
      ssoConfigId: string
      provider: string
      createdAt: number
    }

    if (stateData.provider !== 'SAML') {
      throw ApiError.badRequest('Invalid callback for OIDC provider', 'WRONG_CALLBACK')
    }

    const ssoConfigResult = await db.select().from(ssoConfigs).where(
      and(eq(ssoConfigs.id, stateData.ssoConfigId), eq(ssoConfigs.isActive, true))
    ).limit(1)
    const ssoConfig = ssoConfigResult[0]

    if (!ssoConfig) {
      throw ApiError.notFound('SSO configuration not found or inactive')
    }

    let ssoUser
    try {
      ssoUser = parseSAMLResponse(SAMLResponse)
    } catch (error) {
      throw ApiError.badRequest('Failed to parse SAML response', 'SAML_PARSE_FAILED')
    }

    if (!ssoUser.email) {
      throw ApiError.badRequest('Email not found in SAML response', 'MISSING_EMAIL')
    }

    const allowedDomains = ssoConfig.allowedDomains as string[] | null
    if (allowedDomains && allowedDomains.length > 0) {
      const emailDomain = ssoUser.email.split('@')[1]?.toLowerCase()
      if (!emailDomain || !allowedDomains.map(d => d.toLowerCase()).includes(emailDomain)) {
        throw ApiError.forbidden('Email domain not allowed for this organization', 'DOMAIN_NOT_ALLOWED')
      }
    }

    let user: typeof users.$inferSelect | null = null
    const userResult = await db.select().from(users).where(eq(users.email, ssoUser.email.toLowerCase())).limit(1)
    user = userResult[0] ?? null

    const isNewUser = !user

    if (!user && ssoConfig.autoProvisionUsers) {
      const displayName = [ssoUser.firstName, ssoUser.lastName].filter(Boolean).join(' ') || ssoUser.email.split('@')[0]!
      const username = generateUsername(ssoUser.email, displayName)

      const newUserResult = await db.insert(users).values({
        email: ssoUser.email.toLowerCase(),
        username,
        displayName,
        emailVerified: true,
        status: 'ACTIVE',
      }).returning()
      user = newUserResult[0]!

      await db.insert(organizationMembers).values({
        organizationId: stateData.organizationId,
        userId: user.id,
        role: ssoConfig.defaultRole,
        invitedBy: 'SSO',
      })
    } else if (!user) {
      throw ApiError.forbidden('User provisioning is disabled. Contact your administrator.', 'USER_NOT_PROVISIONED')
    }

    const membershipResult = await db.select().from(organizationMembers).where(
      and(eq(organizationMembers.organizationId, stateData.organizationId), eq(organizationMembers.userId, user.id))
    ).limit(1)

    if (!membershipResult[0]) {
      if (ssoConfig.autoProvisionUsers) {
        await db.insert(organizationMembers).values({
          organizationId: stateData.organizationId,
          userId: user.id,
          role: ssoConfig.defaultRole,
          invitedBy: 'SSO',
        })
      } else {
        throw ApiError.forbidden('You are not a member of this organization', 'NOT_ORG_MEMBER')
      }
    }

    if (user.status === 'BANNED') {
      throw ApiError.forbidden('Account has been banned', 'ACCOUNT_BANNED')
    }
    if (user.status === 'SUSPENDED') {
      throw ApiError.forbidden('Account is suspended', 'ACCOUNT_SUSPENDED')
    }

    const token = generateSessionToken()
    const tokenHash = hashToken(token)
    const refreshToken = generateSessionToken()
    const refreshTokenHash = hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] ||
                      c.req.header('x-real-ip') || null
    const userAgent = c.req.header('user-agent') || null

    const sessionResult = await db.insert(sessions).values({
      tokenHash,
      refreshTokenHash,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    }).returning()
    const session = sessionResult[0]!

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
          verificationLevel: user.verificationLevel,
          isNewUser,
        },
        session: {
          token,
          refreshToken,
          expiresAt: session.expiresAt.toISOString(),
        },
        returnUrl: stateData.returnUrl,
        organizationId: stateData.organizationId,
      },
    })
  }
)
