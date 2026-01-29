// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - HASHING UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

import { createHash, randomBytes } from 'node:crypto'

// ─────────────────────────────────────────────────────────────────────────────
// SHA-256 Hash
// ─────────────────────────────────────────────────────────────────────────────

export function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

// ─────────────────────────────────────────────────────────────────────────────
// Token Hash (for secure storage)
// ─────────────────────────────────────────────────────────────────────────────

export function hashToken(token: string): string {
  return sha256(token)
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Random Token
// ─────────────────────────────────────────────────────────────────────────────

export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('base64url')
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Random Code (numeric)
// ─────────────────────────────────────────────────────────────────────────────

export function generateCode(length: number = 6): string {
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
// Generate Participant Hash (for anonymous voting)
// Privacy-preserving hash: SHA256(salt:userId:pollId)
// ─────────────────────────────────────────────────────────────────────────────

// Cache the salt to avoid repeated env lookups
let _participantSalt: string | null = null

function getParticipantSalt(): string {
  if (_participantSalt !== null) return _participantSalt

  const salt = process.env['PARTICIPANT_HASH_SALT']

  // CRITICAL: In production, salt MUST be configured
  if (!salt) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('[SECURITY] PARTICIPANT_HASH_SALT must be set in production')
    }
    console.warn('[DEV] PARTICIPANT_HASH_SALT not set - using development fallback')
    _participantSalt = 'dev-only-participant-salt-not-for-production'
  } else {
    _participantSalt = salt
  }

  return _participantSalt
}

export function generateParticipantHash(userId: string, contentId: string): string {
  const salt = getParticipantSalt()
  return sha256(`${salt}:${userId}:${contentId}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Fraud Detection Hash (for FraudDetectionLog)
// Privacy-preserving: SEPARATE salt from participant hash to prevent correlation
// [SECURITY: P-057] FraudDetectionLog MUST NOT be linkable to participant data
// ─────────────────────────────────────────────────────────────────────────────

let _fraudDetectionSalt: string | null = null

function getFraudDetectionSalt(): string {
  if (_fraudDetectionSalt !== null) return _fraudDetectionSalt

  const salt = process.env['FRAUD_DETECTION_SALT']

  if (!salt) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('[SECURITY] FRAUD_DETECTION_SALT must be set in production')
    }
    console.warn('[DEV] FRAUD_DETECTION_SALT not set - using development fallback')
    _fraudDetectionSalt = 'dev-only-fraud-detection-salt-not-for-production'
  } else {
    _fraudDetectionSalt = salt
  }

  return _fraudDetectionSalt
}

export function generateFraudDetectionHash(deviceFingerprint: string): string {
  const salt = getFraudDetectionSalt()
  return sha256(`${salt}:fraud:${deviceFingerprint}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Slug
// ─────────────────────────────────────────────────────────────────────────────

export function generateSlug(title: string, randomSuffix: boolean = true): string {
  let slug = title
    .toLowerCase()
    .trim()
    // Replace Turkish characters
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    // Replace special characters
    .replace(/[^\w\s-]/g, '')
    // Replace whitespace with hyphens
    .replace(/\s+/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')

  // Truncate to reasonable length
  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-+$/, '')
  }

  // Add random suffix for uniqueness
  if (randomSuffix) {
    const suffix = randomBytes(4).toString('hex')
    slug = `${slug}-${suffix}`
  }

  return slug
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Join Code (for live polls)
// 6 character alphanumeric, easy to type
// ─────────────────────────────────────────────────────────────────────────────

export function generateJoinCode(): string {
  // Use only uppercase letters and numbers, excluding confusing chars (0, O, I, 1, L)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  const bytes = randomBytes(6)

  for (let i = 0; i < 6; i++) {
    const byte = bytes[i]
    if (byte !== undefined) {
      code += chars[byte % chars.length]
    }
  }

  return code
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Share Token (for private links)
// ─────────────────────────────────────────────────────────────────────────────

export function generateShareToken(): string {
  return randomBytes(16).toString('base64url')
}

// ─────────────────────────────────────────────────────────────────────────────
// MD5 Hash (for Gravatar, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export function md5(data: string): string {
  return createHash('md5').update(data).digest('hex')
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Gravatar URL
// ─────────────────────────────────────────────────────────────────────────────

export function getGravatarUrl(email: string, size: number = 200): string {
  const hash = md5(email.toLowerCase().trim())
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`
}
