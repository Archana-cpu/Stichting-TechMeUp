// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TWO-FACTOR AUTHENTICATION SERVICE
// Bible: 02-USERS, 05-TECH (TOTP with backup codes)
// ══════════════════════════════════════════════════════════════════════════════

import * as OTPAuth from 'otpauth'
import { createHash, randomBytes } from 'node:crypto'
import { toDataURL } from 'qrcode'
import { db, eq } from '@voxpoll/database'
import { users } from '@voxpoll/database'
import { ApiError } from '../middleware/error-handler'
import { ERROR_CODES } from '../constants/messages'

// ─────────────────────────────────────────────────────────────────────────────
// User Type Extension (includes 2FA fields)
// ─────────────────────────────────────────────────────────────────────────────

interface TwoFactorUser {
  id: string
  email: string | null
  username: string
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
  twoFactorBackupCodes: string[] | null
  twoFactorVerifiedAt: Date | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ISSUER = 'VoxPoll'
const BACKUP_CODE_COUNT = 10
const BACKUP_CODE_LENGTH = 8

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TwoFactorSetupResult {
  secret: string
  qrCodeDataUrl: string
  backupCodes: string[]
}

interface TwoFactorStatus {
  enabled: boolean
  verifiedAt: Date | null
  backupCodesRemaining: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function generateBackupCodes(count: number = BACKUP_CODE_COUNT): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = randomBytes(BACKUP_CODE_LENGTH / 2).toString('hex').toUpperCase()
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
  }
  return codes
}

function hashBackupCode(code: string): string {
  return createHash('sha256').update(code.replace('-', '').toLowerCase()).digest('hex')
}

function createTotpInstance(secret: string, account: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: account,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  })
}

function generateTotpSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 })
  return secret.base32
}

function verifyTotpCode(token: string, secret: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: ISSUER,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    })
    const delta = totp.validate({ token, window: 1 })
    return delta !== null
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Two-Factor Service Class
// ─────────────────────────────────────────────────────────────────────────────

class TwoFactorServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Generate Setup (Step 1: Generate secret and QR code)
  // ─────────────────────────────────────────────────────────────────────────────

  async generateSetup(user: TwoFactorUser): Promise<TwoFactorSetupResult> {
    if (user.twoFactorEnabled) {
      throw ApiError.badRequest(
        '2FA is already enabled. Disable it first to reconfigure.',
        ERROR_CODES.TWO_FACTOR_ALREADY_ENABLED
      )
    }

    const secret = generateTotpSecret()
    const totp = createTotpInstance(secret, user.email || user.username)
    const otpAuthUrl = totp.toString()

    const qrCodeDataUrl = await toDataURL(otpAuthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    const backupCodes = generateBackupCodes()
    const hashedBackupCodes = backupCodes.map(hashBackupCode)

    await db.update(users)
      .set({
        twoFactorSecret: secret,
        twoFactorBackupCodes: hashedBackupCodes,
      } as Record<string, unknown>)
      .where(eq(users.id, user.id))

    return {
      secret,
      qrCodeDataUrl,
      backupCodes,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Verify and Enable (Step 2: Verify TOTP code and enable 2FA)
  // ─────────────────────────────────────────────────────────────────────────────

  async verifyAndEnable(user: TwoFactorUser, code: string): Promise<void> {
    if (user.twoFactorEnabled) {
      throw ApiError.badRequest(
        '2FA is already enabled',
        ERROR_CODES.TWO_FACTOR_ALREADY_ENABLED
      )
    }

    if (!user.twoFactorSecret) {
      throw ApiError.badRequest(
        '2FA setup not initiated. Please start setup first.',
        ERROR_CODES.TWO_FACTOR_NOT_SETUP
      )
    }

    const isValid = verifyTotpCode(code, user.twoFactorSecret)

    if (!isValid) {
      throw ApiError.badRequest(
        'Invalid verification code',
        ERROR_CODES.INVALID_TWO_FACTOR_CODE
      )
    }

    await db.update(users)
      .set({
        twoFactorEnabled: true,
        twoFactorVerifiedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(users.id, user.id))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Verify Code (for login and sensitive operations)
  // ─────────────────────────────────────────────────────────────────────────────

  async verifyCode(user: TwoFactorUser, code: string): Promise<boolean> {
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return true
    }

    if (code.includes('-') || code.length === 9) {
      return this.verifyBackupCode(user, code)
    }

    return verifyTotpCode(code, user.twoFactorSecret)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Verify Backup Code
  // ─────────────────────────────────────────────────────────────────────────────

  private async verifyBackupCode(user: TwoFactorUser, code: string): Promise<boolean> {
    const hashedCode = hashBackupCode(code)
    const backupCodes = user.twoFactorBackupCodes || []

    const codeIndex = backupCodes.findIndex(
      (storedHash: string) => storedHash === hashedCode
    )

    if (codeIndex === -1) {
      return false
    }

    const updatedCodes = [...backupCodes]
    updatedCodes.splice(codeIndex, 1)

    await db.update(users)
      .set({ twoFactorBackupCodes: updatedCodes } as Record<string, unknown>)
      .where(eq(users.id, user.id))

    return true
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Disable 2FA
  // ─────────────────────────────────────────────────────────────────────────────

  async disable(user: TwoFactorUser, code: string): Promise<void> {
    if (!user.twoFactorEnabled) {
      throw ApiError.badRequest(
        '2FA is not enabled',
        ERROR_CODES.TWO_FACTOR_NOT_ENABLED
      )
    }

    const isValid = await this.verifyCode(user, code)
    if (!isValid) {
      throw ApiError.badRequest(
        'Invalid verification code',
        ERROR_CODES.INVALID_TWO_FACTOR_CODE
      )
    }

    await db.update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
        twoFactorVerifiedAt: null,
      } as Record<string, unknown>)
      .where(eq(users.id, user.id))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Regenerate Backup Codes
  // ─────────────────────────────────────────────────────────────────────────────

  async regenerateBackupCodes(user: TwoFactorUser, code: string): Promise<string[]> {
    if (!user.twoFactorEnabled) {
      throw ApiError.badRequest(
        '2FA is not enabled',
        ERROR_CODES.TWO_FACTOR_NOT_ENABLED
      )
    }

    const isValid = await this.verifyCode(user, code)
    if (!isValid) {
      throw ApiError.badRequest(
        'Invalid verification code',
        ERROR_CODES.INVALID_TWO_FACTOR_CODE
      )
    }

    const backupCodes = generateBackupCodes()
    const hashedBackupCodes = backupCodes.map(hashBackupCode)

    await db.update(users)
      .set({ twoFactorBackupCodes: hashedBackupCodes } as Record<string, unknown>)
      .where(eq(users.id, user.id))

    return backupCodes
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get 2FA Status
  // ─────────────────────────────────────────────────────────────────────────────

  getStatus(user: TwoFactorUser): TwoFactorStatus {
    return {
      enabled: user.twoFactorEnabled,
      verifiedAt: user.twoFactorVerifiedAt,
      backupCodesRemaining: user.twoFactorBackupCodes?.length || 0,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Check if 2FA Required for Operation
  // ─────────────────────────────────────────────────────────────────────────────

  requiresTwoFactor(user: TwoFactorUser): boolean {
    return user.twoFactorEnabled === true
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

const twoFactorService = new TwoFactorServiceClass()

export { twoFactorService, TwoFactorServiceClass as TwoFactorService }
export type { TwoFactorSetupResult, TwoFactorStatus, TwoFactorUser }
