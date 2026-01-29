// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - OAUTH UTILITIES
// [P-049] Only Google, Apple, e-Devlet supported
// ══════════════════════════════════════════════════════════════════════════════

import { createHash, randomBytes } from 'node:crypto'
import * as jose from 'jose'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type OAuthPlatform = 'web' | 'platform' | 'mobile'

export interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name?: string
  family_name?: string
  picture?: string
  locale?: string
}

export interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope: string
  token_type: string
  id_token?: string
}

export interface AppleUserInfo {
  id: string // sub
  email: string
  email_verified: boolean
  name?: string
  given_name?: string
  family_name?: string
}

export interface AppleTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  id_token: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

interface GoogleOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

function getGoogleConfig(platform: OAuthPlatform): GoogleOAuthConfig {
  switch (platform) {
    case 'web':
      return {
        clientId: process.env['GOOGLE_CLIENT_ID_WEB'] || '',
        clientSecret: process.env['GOOGLE_CLIENT_SECRET_WEB'] || '',
        redirectUri: process.env['GOOGLE_REDIRECT_URI_WEB'] || 'http://localhost:3000/api/auth/callback/google',
      }
    case 'platform':
      return {
        clientId: process.env['GOOGLE_CLIENT_ID_PLATFORM'] || '',
        clientSecret: process.env['GOOGLE_CLIENT_SECRET_PLATFORM'] || '',
        redirectUri: process.env['GOOGLE_REDIRECT_URI_PLATFORM'] || 'http://localhost:3001/api/auth/callback/google',
      }
    case 'mobile':
      return {
        clientId: process.env['GOOGLE_CLIENT_ID_MOBILE'] || '',
        clientSecret: '', // Mobile uses ID token verification, no secret needed
        redirectUri: '',
      }
    default:
      throw new Error(`Unknown OAuth platform: ${platform}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// State Generation (CSRF protection)
// ─────────────────────────────────────────────────────────────────────────────

export function generateOAuthState(): string {
  return randomBytes(32).toString('base64url')
}

export function hashState(state: string): string {
  return createHash('sha256').update(state).digest('hex')
}

// ─────────────────────────────────────────────────────────────────────────────
// Google OAuth URLs
// ─────────────────────────────────────────────────────────────────────────────

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
const GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo'

export function getGoogleAuthUrl(platform: OAuthPlatform, state: string): string {
  const config = getGoogleConfig(platform)

  if (!config.clientId) {
    throw new Error(`Google OAuth not configured for platform: ${platform}`)
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Exchange Authorization Code for Tokens
// ─────────────────────────────────────────────────────────────────────────────

export async function exchangeGoogleCode(
  code: string,
  platform: OAuthPlatform
): Promise<GoogleTokenResponse> {
  const config = getGoogleConfig(platform)

  if (!config.clientId || !config.clientSecret) {
    throw new Error(`Google OAuth not configured for platform: ${platform}`)
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  return response.json() as Promise<GoogleTokenResponse>
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Google User Info
// ─────────────────────────────────────────────────────────────────────────────

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user info from Google')
  }

  return response.json() as Promise<GoogleUserInfo>
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify Google ID Token (for mobile)
// ─────────────────────────────────────────────────────────────────────────────

export async function verifyGoogleIdToken(
  idToken: string,
  platform: OAuthPlatform = 'mobile'
): Promise<GoogleUserInfo> {
  const config = getGoogleConfig(platform)

  const response = await fetch(`${GOOGLE_TOKEN_INFO_URL}?id_token=${idToken}`)

  if (!response.ok) {
    throw new Error('Invalid ID token')
  }

  interface GoogleIdTokenPayload {
    sub: string
    email: string
    email_verified: boolean | string
    name?: string
    given_name?: string
    family_name?: string
    picture?: string
    locale?: string
    aud: string
  }

  const payload = await response.json() as GoogleIdTokenPayload

  // Verify audience matches our client ID
  const validClientIds = [
    process.env['GOOGLE_CLIENT_ID_WEB'],
    process.env['GOOGLE_CLIENT_ID_PLATFORM'],
    process.env['GOOGLE_CLIENT_ID_MOBILE'],
  ].filter(Boolean)

  if (!validClientIds.includes(payload.aud)) {
    throw new Error('Token audience mismatch')
  }

  // Verify email is verified
  if (payload.email_verified !== 'true' && payload.email_verified !== true) {
    throw new Error('Email not verified')
  }

  const emailPrefix = payload.email.split('@')[0] || 'user'
  return {
    id: payload.sub,
    email: payload.email,
    verified_email: true,
    name: payload.name || emailPrefix,
    given_name: payload.given_name,
    family_name: payload.family_name,
    picture: payload.picture,
    locale: payload.locale,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Username from Email/Name
// ─────────────────────────────────────────────────────────────────────────────

export function generateUsername(email: string, name?: string): string {
  // Try to use name first
  if (name) {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 20)

    if (base.length >= 3) {
      return `${base}_${randomBytes(3).toString('hex')}`
    }
  }

  // Fall back to email
  const emailPrefix = email.split('@')[0] || 'user'
  const base = emailPrefix
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 20)

  return `${base}_${randomBytes(3).toString('hex')}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Apple Sign-In Configuration
// ─────────────────────────────────────────────────────────────────────────────

interface AppleOAuthConfig {
  clientId: string
  teamId: string
  keyId: string
  privateKey: string
  redirectUri: string
}

function getAppleConfig(platform: OAuthPlatform): AppleOAuthConfig {
  // Apple uses different client IDs for web vs mobile
  const clientId = platform === 'mobile'
    ? process.env['APPLE_CLIENT_ID_MOBILE'] || process.env['APPLE_APP_ID'] || ''
    : process.env['APPLE_CLIENT_ID_WEB'] || process.env['APPLE_SERVICE_ID'] || ''

  return {
    clientId,
    teamId: process.env['APPLE_TEAM_ID'] || '',
    keyId: process.env['APPLE_KEY_ID'] || '',
    privateKey: process.env['APPLE_PRIVATE_KEY'] || '',
    redirectUri: process.env['APPLE_REDIRECT_URI'] || 'https://api.voxpoll.com/api/v1/auth/oauth/apple/callback',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Apple OAuth URLs
// ─────────────────────────────────────────────────────────────────────────────

const APPLE_AUTH_URL = 'https://appleid.apple.com/auth/authorize'
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token'
const APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys'

// Cache Apple public keys
let appleJWKS: jose.JWK[] | null = null
let appleJWKSFetchedAt = 0
const JWKS_CACHE_DURATION = 3600 * 1000 // 1 hour

async function getApplePublicKeys(): Promise<jose.JWK[]> {
  // Use cached keys if still valid
  if (appleJWKS && Date.now() - appleJWKSFetchedAt < JWKS_CACHE_DURATION) {
    return appleJWKS
  }

  const response = await fetch(APPLE_KEYS_URL)
  if (!response.ok) {
    throw new Error('Failed to fetch Apple public keys')
  }

  const data = await response.json() as { keys: jose.JWK[] }
  appleJWKS = data.keys
  appleJWKSFetchedAt = Date.now()

  return appleJWKS
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Apple Client Secret (JWT)
// Apple requires a signed JWT as client_secret
// ─────────────────────────────────────────────────────────────────────────────

async function generateAppleClientSecret(platform: OAuthPlatform): Promise<string> {
  const config = getAppleConfig(platform)

  if (!config.privateKey || !config.teamId || !config.keyId) {
    throw new Error('Apple OAuth not fully configured')
  }

  // Parse the private key (ES256)
  const privateKey = await jose.importPKCS8(
    config.privateKey.replace(/\\n/g, '\n'),
    'ES256'
  )

  // Create JWT
  const jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: config.keyId })
    .setIssuer(config.teamId)
    .setAudience('https://appleid.apple.com')
    .setSubject(config.clientId)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey)

  return jwt
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Apple Auth URL
// ─────────────────────────────────────────────────────────────────────────────

export function getAppleAuthUrl(platform: OAuthPlatform, state: string): string {
  const config = getAppleConfig(platform)

  if (!config.clientId) {
    throw new Error(`Apple OAuth not configured for platform: ${platform}`)
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
    state,
  })

  return `${APPLE_AUTH_URL}?${params.toString()}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Exchange Apple Authorization Code for Tokens
// ─────────────────────────────────────────────────────────────────────────────

export async function exchangeAppleCode(
  code: string,
  platform: OAuthPlatform
): Promise<AppleTokenResponse> {
  const config = getAppleConfig(platform)
  const clientSecret = await generateAppleClientSecret(platform)

  const response = await fetch(APPLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange Apple code: ${error}`)
  }

  return response.json() as Promise<AppleTokenResponse>
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify Apple ID Token
// ─────────────────────────────────────────────────────────────────────────────

export interface AppleIdTokenPayload {
  iss: string
  aud: string
  exp: number
  iat: number
  sub: string
  email?: string
  email_verified?: boolean | string
  is_private_email?: boolean | string
  nonce?: string
  nonce_supported?: boolean
  real_user_status?: number
}

export async function verifyAppleIdToken(
  idToken: string,
  platform: OAuthPlatform = 'mobile'
): Promise<AppleUserInfo> {
  const config = getAppleConfig(platform)
  const keys = await getApplePublicKeys()

  // Decode header to find the right key
  const header = jose.decodeProtectedHeader(idToken)
  const key = keys.find((k) => k.kid === header.kid)

  if (!key) {
    throw new Error('Apple public key not found')
  }

  // Import the public key
  const publicKey = await jose.importJWK(key, 'ES256')

  // Verify the token
  const { payload } = await jose.jwtVerify(idToken, publicKey, {
    issuer: 'https://appleid.apple.com',
    audience: config.clientId,
  })

  const applePayload = payload as unknown as AppleIdTokenPayload

  // Verify the token is from Apple
  if (applePayload.iss !== 'https://appleid.apple.com') {
    throw new Error('Invalid token issuer')
  }

  // Check audience
  const validClientIds = [
    process.env['APPLE_CLIENT_ID_WEB'],
    process.env['APPLE_SERVICE_ID'],
    process.env['APPLE_CLIENT_ID_MOBILE'],
    process.env['APPLE_APP_ID'],
  ].filter(Boolean)

  if (!validClientIds.includes(applePayload.aud)) {
    throw new Error('Token audience mismatch')
  }

  return {
    id: applePayload.sub,
    email: applePayload.email || '',
    email_verified: applePayload.email_verified === true || applePayload.email_verified === 'true',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse Apple User Data (from form_post response)
// Apple only sends user data on first sign-in
// ─────────────────────────────────────────────────────────────────────────────

export interface AppleUserData {
  name?: {
    firstName?: string
    lastName?: string
  }
  email?: string
}

export function parseAppleUserData(userJson: string | undefined): AppleUserData | null {
  if (!userJson) return null

  try {
    return JSON.parse(userJson) as AppleUserData
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// e-Devlet (Turkish Government) OAuth Integration
// https://giris.turkiye.gov.tr/OAuth
// ─────────────────────────────────────────────────────────────────────────────

export interface EDevletUserInfo {
  tcKimlikNo: string
  ad: string
  soyad: string
  dogumTarihi: string
  cinsiyet: 'E' | 'K'
  email?: string
  telefon?: string
}

export interface EDevletTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

interface EDevletOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string
}

function getEDevletConfig(): EDevletOAuthConfig {
  return {
    clientId: process.env['EDEVLET_CLIENT_ID'] || '',
    clientSecret: process.env['EDEVLET_CLIENT_SECRET'] || '',
    redirectUri: process.env['EDEVLET_REDIRECT_URI'] || 'https://api.voxpoll.com/api/v1/auth/oauth/edevlet/callback',
    scope: process.env['EDEVLET_SCOPE'] || 'Ad Soyad TCKimlikNo DogumTarihi',
  }
}

const EDEVLET_AUTH_URL = 'https://giris.turkiye.gov.tr/OAuth/AuthorizationServer/AuthorizationEndpoint'
const EDEVLET_TOKEN_URL = 'https://giris.turkiye.gov.tr/OAuth/AuthorizationServer/TokenEndpoint'
const EDEVLET_USERINFO_URL = 'https://giris.turkiye.gov.tr/OAuth/ResourceServer/UserInfoEndpoint'

export function getEDevletAuthUrl(state: string): string {
  const config = getEDevletConfig()

  if (!config.clientId) {
    throw new Error('e-Devlet OAuth not configured')
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state,
  })

  return `${EDEVLET_AUTH_URL}?${params.toString()}`
}

export async function exchangeEDevletCode(code: string): Promise<EDevletTokenResponse> {
  const config = getEDevletConfig()

  if (!config.clientId || !config.clientSecret) {
    throw new Error('e-Devlet OAuth not configured')
  }

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')

  const response = await fetch(EDEVLET_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange e-Devlet code: ${error}`)
  }

  return response.json() as Promise<EDevletTokenResponse>
}

export async function getEDevletUserInfo(accessToken: string): Promise<EDevletUserInfo> {
  const response = await fetch(EDEVLET_USERINFO_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user info from e-Devlet')
  }

  interface EDevletApiResponse {
    TCKimlikNo: string
    Ad: string
    Soyad: string
    DogumTarihi: string
    Cinsiyet: 'E' | 'K'
    EPosta?: string
    CepTelefonu?: string
  }

  const data = await response.json() as EDevletApiResponse

  return {
    tcKimlikNo: data.TCKimlikNo,
    ad: data.Ad,
    soyad: data.Soyad,
    dogumTarihi: data.DogumTarihi,
    cinsiyet: data.Cinsiyet,
    email: data.EPosta,
    telefon: data.CepTelefonu,
  }
}

export function validateTCKimlikNo(tcNo: string): boolean {
  if (!/^\d{11}$/.test(tcNo)) return false
  if (tcNo[0] === '0') return false

  const digits = tcNo.split('').map(Number)

  const sumOdd = digits[0]! + digits[2]! + digits[4]! + digits[6]! + digits[8]!
  const sumEven = digits[1]! + digits[3]! + digits[5]! + digits[7]!

  const check10 = (sumOdd * 7 - sumEven) % 10
  if (check10 !== digits[9]) return false

  const sumFirst10 = digits.slice(0, 10).reduce((a, b) => a + b, 0)
  if (sumFirst10 % 10 !== digits[10]) return false

  return true
}

export function calculateBirthYearFromTCDate(dogumTarihi: string): number {
  const parts = dogumTarihi.split('/')
  if (parts.length !== 3) {
    const dateParts = dogumTarihi.split('-')
    if (dateParts.length === 3) {
      return parseInt(dateParts[0]!, 10)
    }
    throw new Error('Invalid birth date format')
  }
  return parseInt(parts[2]!, 10)
}

// ─────────────────────────────────────────────────────────────────────────────
// SSO (Enterprise Single Sign-On) Integration
// Supports SAML 2.0 and OIDC for enterprise customers
// ─────────────────────────────────────────────────────────────────────────────

export interface SSOConfig {
  organizationId: string
  provider: 'SAML' | 'OIDC'
  issuer: string
  ssoUrl: string
  certificate?: string
  clientId?: string
  clientSecret?: string
  callbackUrl: string
  attributeMapping: {
    email: string
    firstName?: string
    lastName?: string
    employeeId?: string
  }
}

export interface SSOUserInfo {
  email: string
  firstName?: string
  lastName?: string
  employeeId?: string
  organizationId: string
  rawAttributes: Record<string, unknown>
}

export function getSSOAuthUrl(config: SSOConfig, state: string): string {
  if (config.provider === 'OIDC') {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId || '',
      redirect_uri: config.callbackUrl,
      scope: 'openid email profile',
      state,
    })
    return `${config.ssoUrl}?${params.toString()}`
  }

  const params = new URLSearchParams({
    SAMLRequest: '',
    RelayState: state,
  })
  return `${config.ssoUrl}?${params.toString()}`
}

export async function exchangeSSOCode(
  code: string,
  config: SSOConfig
): Promise<{ accessToken: string; idToken?: string }> {
  if (config.provider !== 'OIDC') {
    throw new Error('Code exchange only supported for OIDC')
  }

  const tokenUrl = config.ssoUrl.replace('/authorize', '/token')

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.callbackUrl,
      client_id: config.clientId || '',
      client_secret: config.clientSecret || '',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange SSO code')
  }

  const data = await response.json() as { access_token: string; id_token?: string }
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
  }
}

export function parseSAMLResponse(samlResponse: string): SSOUserInfo {
  const decoded = Buffer.from(samlResponse, 'base64').toString('utf8')

  const emailMatch = decoded.match(/<saml:Attribute Name="email"[^>]*>[\s\S]*?<saml:AttributeValue[^>]*>([^<]+)<\/saml:AttributeValue>/i)
  const firstNameMatch = decoded.match(/<saml:Attribute Name="firstName"[^>]*>[\s\S]*?<saml:AttributeValue[^>]*>([^<]+)<\/saml:AttributeValue>/i)
  const lastNameMatch = decoded.match(/<saml:Attribute Name="lastName"[^>]*>[\s\S]*?<saml:AttributeValue[^>]*>([^<]+)<\/saml:AttributeValue>/i)
  const orgIdMatch = decoded.match(/<saml:Issuer[^>]*>([^<]+)<\/saml:Issuer>/i)

  if (!emailMatch) {
    throw new Error('Email not found in SAML response')
  }

  return {
    email: emailMatch[1]!,
    firstName: firstNameMatch?.[1],
    lastName: lastNameMatch?.[1],
    organizationId: orgIdMatch?.[1] || '',
    rawAttributes: {},
  }
}
