// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUTH UTILITIES
// Bible: T-006 (Argon2id), 05-TECH (Password requirements)
// ══════════════════════════════════════════════════════════════════════════════

import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2'
import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

// ─────────────────────────────────────────────────────────────────────────────
// Common Password List (Top 1000 most common)
// ─────────────────────────────────────────────────────────────────────────────

const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '123456789', '12345678910',
  'qwerty1234', 'letmein123', 'welcome123', 'admin12345', 'iloveyou1',
  'sunshine12', 'princess1', 'football12', 'monkey1234', 'shadow1234',
  'master1234', 'dragon1234', 'michael123', 'jennifer1', 'trustno12',
  'baseball12', 'superman12', 'qwertyuiop', 'asdfghjkl1', 'zxcvbnm123',
  'password12', 'password!1', 'passw0rd12', 'p@ssword12', 'p@ssw0rd12',
  '1234567890', '0987654321', 'abcdefghij', 'abc1234567', '1q2w3e4r5t',
  'qwerty12345', 'admin123456', 'root123456', 'login12345', 'welcome1234',
  'changeme12', 'letmein1234', 'hello12345', 'test123456', 'guest12345',
  'default123', 'secret1234', 'access1234', 'temp123456', 'sample1234',
])

// ─────────────────────────────────────────────────────────────────────────────
// Password Validation (Bible: 05-TECH)
// ─────────────────────────────────────────────────────────────────────────────

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

export interface PasswordValidationOptions {
  checkHIBP?: boolean
  passwordHistory?: string[]
}

export async function validatePassword(
  password: string,
  options: PasswordValidationOptions = {}
): Promise<PasswordValidationResult> {
  const errors: string[] = []

  if (password.length < 10) {
    errors.push('Password must be at least 10 characters')
  }

  if (password.length > 128) {
    errors.push('Password must be at most 128 characters')
  }

  let charClasses = 0
  if (/[a-z]/.test(password)) charClasses++
  if (/[A-Z]/.test(password)) charClasses++
  if (/[0-9]/.test(password)) charClasses++
  if (/[^a-zA-Z0-9]/.test(password)) charClasses++

  if (charClasses < 3) {
    errors.push('Password must contain at least 3 character types (lowercase, uppercase, number, symbol)')
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common')
  }

  if (options.checkHIBP !== false && errors.length === 0) {
    const isBreached = await checkHaveIBeenPwned(password)
    if (isBreached) {
      errors.push('This password has been found in data breaches')
    }
  }

  if (options.passwordHistory && options.passwordHistory.length > 0) {
    for (const oldHash of options.passwordHistory.slice(0, 5)) {
      const isReused = await verifyPassword(password, oldHash)
      if (isReused) {
        errors.push('Cannot reuse one of your last 5 passwords')
        break
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HaveIBeenPwned API Check (k-anonymity model)
// ─────────────────────────────────────────────────────────────────────────────

async function checkHaveIBeenPwned(password: string): Promise<boolean> {
  try {
    const sha1 = createHash('sha1').update(password).digest('hex').toUpperCase()
    const prefix = sha1.substring(0, 5)
    const suffix = sha1.substring(5)

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'User-Agent': 'VoxPoll-PasswordCheck' },
      signal: AbortSignal.timeout(3000),
    })

    if (!response.ok) {
      return false
    }

    const text = await response.text()
    const lines = text.split('\n')

    for (const line of lines) {
      const [hashSuffix] = line.split(':')
      if (hashSuffix?.trim() === suffix) {
        return true
      }
    }

    return false
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Password Hashing (Argon2id - Bible T-006)
// ─────────────────────────────────────────────────────────────────────────────

const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
  outputLen: 32,
}

export async function hashPassword(password: string): Promise<string> {
  return argon2Hash(password, ARGON2_OPTIONS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (hash.startsWith('$argon2')) {
      return argon2Verify(hash, password)
    }

    if (hash.startsWith('$scrypt$')) {
      return verifyScryptPassword(password, hash)
    }

    return false
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Scrypt Verification (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

const KEY_LENGTH = 64

async function verifyScryptPassword(password: string, hash: string): Promise<boolean> {
  const parts = hash.split('$')

  if (parts[1] !== 'scrypt' || !parts[2] || !parts[3] || !parts[4] || !parts[5] || !parts[6]) {
    return false
  }

  const salt = Buffer.from(parts[5], 'base64')
  const storedKey = Buffer.from(parts[6], 'base64')

  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH) as Buffer

  return timingSafeEqual(storedKey, derivedKey)
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Token Generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url')
}

// ─────────────────────────────────────────────────────────────────────────────
// Verification Code Generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateVerificationCode(length: number = 6): string {
  const chars = '0123456789'
  let code = ''
  const bytes = randomBytes(length)

  for (let i = 0; i < length; i++) {
    const byte = bytes[i]
    if (byte !== undefined) {
      code += chars[byte % chars.length]
    }
  }

  return code
}

// ─────────────────────────────────────────────────────────────────────────────
// Secure Random String
// ─────────────────────────────────────────────────────────────────────────────

export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('base64url')
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT Token Generation & Verification (Bible: T-005 - jose library)
// ─────────────────────────────────────────────────────────────────────────────

import { SignJWT, jwtVerify } from 'jose'
import { SESSION_LIMITS } from '../constants/limits'

const JWT_SECRET = new TextEncoder().encode(process.env['JWT_SECRET'] || 'voxpoll-dev-secret-change-in-production')

export interface JWTPayload {
  sub: string
  sessionId: string
  iat?: number
  exp?: number
}

export async function generateAccessToken(userId: string, sessionId: string): Promise<string> {
  return new SignJWT({ sub: userId, sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + SESSION_LIMITS.accessTokenExpiry) / 1000))
    .sign(JWT_SECRET)
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      sub: payload.sub as string,
      sessionId: payload['sessionId'] as string,
      iat: payload.iat,
      exp: payload.exp,
    }
  } catch {
    return null
  }
}
