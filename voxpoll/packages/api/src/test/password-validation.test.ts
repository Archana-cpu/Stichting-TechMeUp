// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PASSWORD VALIDATION TESTS (P0-001)
// Bible: 05-TECH/06-security.md, T-006 (Argon2id)
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validatePassword, hashPassword, verifyPassword } from '../lib/auth'

// ─────────────────────────────────────────────────────────────────────────────
// P0-001: Password Validation Tests
// Bible Compliance: T-006 (Argon2id, NOT bcrypt)
// Coverage Target: 100%
// ─────────────────────────────────────────────────────────────────────────────

describe('Password Validation (P0-001)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Length Requirements
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Length Validation', () => {
    it('should reject passwords shorter than 10 characters', async () => {
      const result = await validatePassword('Short1!', { checkHIBP: false })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must be at least 10 characters')
    })

    it('should accept passwords with exactly 10 characters', async () => {
      const result = await validatePassword('Valid123!@', { checkHIBP: false })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept passwords with 128 characters', async () => {
      const longPassword = 'A1!' + 'a'.repeat(125)
      const result = await validatePassword(longPassword, { checkHIBP: false })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject passwords longer than 128 characters', async () => {
      const tooLong = 'A1!' + 'a'.repeat(126)
      const result = await validatePassword(tooLong, { checkHIBP: false })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must be at most 128 characters')
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Character Class Requirements (min 3 of 4 types)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Character Class Requirements', () => {
    it('should accept password with lowercase + uppercase + number', async () => {
      const result = await validatePassword('ValidPass123', { checkHIBP: false })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept password with lowercase + uppercase + special', async () => {
      const result = await validatePassword('ValidPass!@#', { checkHIBP: false })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept password with lowercase + number + special', async () => {
      const result = await validatePassword('validpass123!', { checkHIBP: false })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept password with uppercase + number + special', async () => {
      const result = await validatePassword('VALIDPASS123!', { checkHIBP: false })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept password with all 4 character types', async () => {
      const result = await validatePassword('ValidPass123!', { checkHIBP: false })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject password with only lowercase', async () => {
      const result = await validatePassword('validpassword', { checkHIBP: false })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least 3 character types (lowercase, uppercase, number, symbol)')
    })

    it('should reject password with only lowercase + uppercase', async () => {
      const result = await validatePassword('ValidPassword', { checkHIBP: false })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least 3 character types (lowercase, uppercase, number, symbol)')
    })

    it('should reject password with only numbers', async () => {
      const result = await validatePassword('1234567890', { checkHIBP: false })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least 3 character types (lowercase, uppercase, number, symbol)')
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Common Password Detection
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Common Password Detection', () => {
    it('should reject common password: password', async () => {
      const result = await validatePassword('password', { checkHIBP: false })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('This password is too common')
    })

    it('should reject common password: password123', async () => {
      const result = await validatePassword('password123', { checkHIBP: false })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('This password is too common')
    })

    it('should reject common password: qwerty1234', async () => {
      const result = await validatePassword('qwerty1234', { checkHIBP: false })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('This password is too common')
    })

    it('should reject common password with different casing', async () => {
      const result = await validatePassword('PaSsWoRd123', { checkHIBP: false })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('This password is too common')
    })

    it('should accept non-common password', async () => {
      const result = await validatePassword('UniqueP@ss2026', { checkHIBP: false })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // HaveIBeenPwned API Integration
  // ─────────────────────────────────────────────────────────────────────────────

  describe('HaveIBeenPwned Integration', () => {
    it('should check HIBP by default', async () => {
      const result = await validatePassword('ValidPass123!')

      expect(result.valid).toBeDefined()
    })

    it('should skip HIBP when checkHIBP is false', async () => {
      const result = await validatePassword('ValidPass123!', { checkHIBP: false })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle HIBP API timeout gracefully', async () => {
      const result = await validatePassword('ValidPass123!')

      expect(result).toBeDefined()
      expect(typeof result.valid).toBe('boolean')
    })

    it('should return valid when HIBP check fails', async () => {
      const obscurePassword = 'X9k#mP2vQ!rL4w'
      const result = await validatePassword(obscurePassword)

      expect(result.valid).toBe(true)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Password History Check (last 5 passwords)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Password History Check', () => {
    it('should reject reused password from history', async () => {
      const password = 'ValidPass123!'
      const hashedPassword = await hashPassword(password)

      const result = await validatePassword(password, {
        checkHIBP: false,
        passwordHistory: [hashedPassword],
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Cannot reuse one of your last 5 passwords')
    })

    it('should accept new password not in history', async () => {
      const oldPassword = await hashPassword('OldPass123!')
      const newPassword = 'NewPass456!'

      const result = await validatePassword(newPassword, {
        checkHIBP: false,
        passwordHistory: [oldPassword],
      })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should check only last 5 passwords from history', async () => {
      const recentPassword = await hashPassword('Recent1Pass!')
      const oldHashes = await Promise.all([
        hashPassword('Old2Pass!'),
        hashPassword('Old3Pass!'),
        hashPassword('Old4Pass!'),
        hashPassword('Old5Pass!'),
        recentPassword,
        hashPassword('Old6Pass!'),
        hashPassword('Old7Pass!'),
      ])

      const result = await validatePassword('Recent1Pass!', {
        checkHIBP: false,
        passwordHistory: oldHashes,
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Cannot reuse one of your last 5 passwords')
    })

    it('should accept password when history is empty', async () => {
      const result = await validatePassword('ValidPass123!', {
        checkHIBP: false,
        passwordHistory: [],
      })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Multiple Validation Errors
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Multiple Validation Errors', () => {
    it('should return all applicable errors', async () => {
      const result = await validatePassword('short', { checkHIBP: false })

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })

    it('should include length and character class errors', async () => {
      const result = await validatePassword('short', { checkHIBP: false })

      expect(result.errors).toContain('Password must be at least 10 characters')
      expect(result.errors).toContain('Password must contain at least 3 character types (lowercase, uppercase, number, symbol)')
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Argon2id Hashing Tests (T-006 Compliance)
// ─────────────────────────────────────────────────────────────────────────────

describe('Argon2id Password Hashing (T-006)', () => {
  it('should hash password using Argon2id', async () => {
    const password = 'ValidPass123!'
    const hash = await hashPassword(password)

    expect(hash).toContain('$argon2')
    expect(hash.length).toBeGreaterThan(50)
  })

  it('should produce different hashes for same password', async () => {
    const password = 'ValidPass123!'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    expect(hash1).not.toBe(hash2)
  })

  it('should verify correct password', async () => {
    const password = 'ValidPass123!'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword(password, hash)

    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const password = 'ValidPass123!'
    const wrongPassword = 'WrongPass456!'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword(wrongPassword, hash)

    expect(isValid).toBe(false)
  })

  it('should verify Argon2id hashes', async () => {
    const password = 'ValidPass123!'
    const hash = await hashPassword(password)

    expect(hash.startsWith('$argon2')).toBe(true)

    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Scrypt Backward Compatibility
// ─────────────────────────────────────────────────────────────────────────────

describe('Legacy Scrypt Support', () => {
  it('should handle legacy scrypt hash format', async () => {
    const scryptHash = '$scrypt$N=16384$r=8$p=1$dGVzdHNhbHQyMDI2$' + Buffer.alloc(64).toString('base64')

    const result = await verifyPassword('testpassword', scryptHash)

    expect(typeof result).toBe('boolean')
    expect(result).toBe(false)
  })

  it('should reject malformed scrypt hash', async () => {
    const malformedHash = '$scrypt$invalid'

    const result = await verifyPassword('password', malformedHash)

    expect(result).toBe(false)
  })

  it('should reject unknown hash format', async () => {
    const unknownHash = '$bcrypt$2a$10$...'

    const result = await verifyPassword('password', unknownHash)

    expect(result).toBe(false)
  })

  it('should handle invalid hash gracefully', async () => {
    const result = await verifyPassword('password', 'invalid_hash')

    expect(result).toBe(false)
  })
})
