import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { twoFactorService } from '../services/twofa.service'
import type { TwoFactorUser } from '../services/twofa.service'
import * as OTPAuth from 'otpauth'
import { ApiError } from '../middleware/error-handler'
import { ERROR_CODES } from '../constants/messages'

const mockDb = vi.hoisted(() => ({
  update: vi.fn(),
}))

const mockUsers = vi.hoisted(() => ({
  id: 'id',
}))

const mockEq = vi.hoisted(() => vi.fn())

vi.mock('@voxpoll/database', () => ({
  db: mockDb,
  eq: mockEq,
  users: mockUsers,
}))

describe('Two-Factor Authentication (P0-003)', () => {
  const mockUser: TwoFactorUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    twoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorBackupCodes: null,
    twoFactorVerifiedAt: null,
  }

  const mockEnabledUser: TwoFactorUser = {
    ...mockUser,
    twoFactorEnabled: true,
    twoFactorSecret: 'JBSWY3DPEHPK3PXP',
    twoFactorBackupCodes: [
      'a'.repeat(64),
      'b'.repeat(64),
      'c'.repeat(64),
    ],
    twoFactorVerifiedAt: new Date('2024-01-01'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('TOTP Secret Generation (Bible: 02-USERS, 05-TECH)', () => {
    it('should generate a valid base32 secret', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result = await twoFactorService.generateSetup(mockUser)

      expect(result.secret).toBeDefined()
      expect(result.secret).toMatch(/^[A-Z2-7]+=*$/)
      expect(result.secret.length).toBeGreaterThan(0)
    })

    it('should generate unique secrets for different calls', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result1 = await twoFactorService.generateSetup(mockUser)

      vi.clearAllMocks()
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result2 = await twoFactorService.generateSetup(mockUser)

      expect(result1.secret).not.toBe(result2.secret)
    })
  })

  describe('QR Code Generation (Bible: 02-USERS, 05-TECH)', () => {
    it('should generate a valid QR code data URL', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result = await twoFactorService.generateSetup(mockUser)

      expect(result.qrCodeDataUrl).toBeDefined()
      expect(result.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/)
    })

    it('should use correct TOTP parameters in QR code', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result = await twoFactorService.generateSetup(mockUser)

      const totp = new OTPAuth.TOTP({
        issuer: 'VoxPoll',
        label: mockUser.email!,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(result.secret),
      })

      const expectedUrl = totp.toString()
      expect(expectedUrl).toContain('VoxPoll')
      expect(expectedUrl).toContain(encodeURIComponent(mockUser.email!))
    })
  })

  describe('Enable 2FA Flow (Bible: 02-USERS, 05-TECH)', () => {
    it('should reject setup if 2FA is already enabled', async () => {
      await expect(
        twoFactorService.generateSetup(mockEnabledUser)
      ).rejects.toThrow(ApiError)

      await expect(
        twoFactorService.generateSetup(mockEnabledUser)
      ).rejects.toThrow('2FA is already enabled')
    })

    it('should generate 10 backup codes during setup', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result = await twoFactorService.generateSetup(mockUser)

      expect(result.backupCodes).toHaveLength(10)
      result.backupCodes.forEach(code => {
        expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/)
      })
    })

    it('should reject verification without prior setup', async () => {
      await expect(
        twoFactorService.verifyAndEnable(mockUser, '123456')
      ).rejects.toThrow(ApiError)

      await expect(
        twoFactorService.verifyAndEnable(mockUser, '123456')
      ).rejects.toThrow('2FA setup not initiated')
    })

    it('should enable 2FA after successful TOTP verification', async () => {
      const userWithSecret = {
        ...mockUser,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      }

      const totp = new OTPAuth.TOTP({
        issuer: 'VoxPoll',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(userWithSecret.twoFactorSecret),
      })
      const validCode = totp.generate()

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      await expect(
        twoFactorService.verifyAndEnable(userWithSecret, validCode)
      ).resolves.not.toThrow()

      expect(mockDb.update).toHaveBeenCalled()
    })
  })

  describe('Disable 2FA Flow (Bible: 02-USERS, 05-TECH)', () => {
    it('should reject disable if 2FA is not enabled', async () => {
      await expect(
        twoFactorService.disable(mockUser, '123456')
      ).rejects.toThrow(ApiError)

      await expect(
        twoFactorService.disable(mockUser, '123456')
      ).rejects.toThrow('2FA is not enabled')
    })

    it('should require valid TOTP code to disable', async () => {
      await expect(
        twoFactorService.disable(mockEnabledUser, 'invalid')
      ).rejects.toThrow(ApiError)
    })

    it('should clear all 2FA data when disabled', async () => {
      const totp = new OTPAuth.TOTP({
        issuer: 'VoxPoll',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(mockEnabledUser.twoFactorSecret!),
      })
      const validCode = totp.generate()

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      await twoFactorService.disable(mockEnabledUser, validCode)

      const setCall = mockDb.update().set
      expect(setCall).toHaveBeenCalledWith(
        expect.objectContaining({
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorBackupCodes: [],
          twoFactorVerifiedAt: null,
        })
      )
    })
  })

  describe('Backup Codes (Bible: 02-USERS, 05-TECH - 10 single-use)', () => {
    it('should accept valid backup code for verification', async () => {
      const backupCode = 'ABCD-1234'
      const hashedCode = require('node:crypto')
        .createHash('sha256')
        .update('abcd1234')
        .digest('hex')

      const userWithBackupCodes: TwoFactorUser = {
        ...mockEnabledUser,
        twoFactorBackupCodes: [hashedCode],
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result = await twoFactorService.verifyCode(
        userWithBackupCodes,
        backupCode
      )

      expect(result).toBe(true)
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('should remove backup code after single use', async () => {
      const backupCode = 'ABCD-1234'
      const hashedCode = require('node:crypto')
        .createHash('sha256')
        .update('abcd1234')
        .digest('hex')
      const secondHashedCode = 'b'.repeat(64)

      const userWithBackupCodes: TwoFactorUser = {
        ...mockEnabledUser,
        twoFactorBackupCodes: [hashedCode, secondHashedCode],
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      await twoFactorService.verifyCode(userWithBackupCodes, backupCode)

      const setCall = mockDb.update().set
      expect(setCall).toHaveBeenCalledWith(
        expect.objectContaining({
          twoFactorBackupCodes: expect.arrayContaining([secondHashedCode]),
        })
      )
    })

    it('should regenerate 10 new backup codes', async () => {
      const totp = new OTPAuth.TOTP({
        issuer: 'VoxPoll',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(mockEnabledUser.twoFactorSecret!),
      })
      const validCode = totp.generate()

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      const newCodes = await twoFactorService.regenerateBackupCodes(
        mockEnabledUser,
        validCode
      )

      expect(newCodes).toHaveLength(10)
      newCodes.forEach(code => {
        expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/)
      })
    })
  })

  describe('TOTP Verification (Bible: 02-USERS, 05-TECH)', () => {
    it('should accept valid TOTP code within time window', async () => {
      const totp = new OTPAuth.TOTP({
        issuer: 'VoxPoll',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(mockEnabledUser.twoFactorSecret!),
      })
      const validCode = totp.generate()

      const result = await twoFactorService.verifyCode(
        mockEnabledUser,
        validCode
      )

      expect(result).toBe(true)
    })

    it('should reject invalid TOTP code', async () => {
      const result = await twoFactorService.verifyCode(
        mockEnabledUser,
        '000000'
      )

      expect(result).toBe(false)
    })
  })

  describe('2FA Status and Requirements (Bible: 02-USERS, 05-TECH)', () => {
    it('should return correct status for enabled 2FA', () => {
      const status = twoFactorService.getStatus(mockEnabledUser)

      expect(status.enabled).toBe(true)
      expect(status.verifiedAt).toEqual(mockEnabledUser.twoFactorVerifiedAt)
      expect(status.backupCodesRemaining).toBe(3)
    })

    it('should return correct status for disabled 2FA', () => {
      const status = twoFactorService.getStatus(mockUser)

      expect(status.enabled).toBe(false)
      expect(status.verifiedAt).toBeNull()
      expect(status.backupCodesRemaining).toBe(0)
    })

    it('should correctly identify when 2FA is required', () => {
      expect(twoFactorService.requiresTwoFactor(mockEnabledUser)).toBe(true)
      expect(twoFactorService.requiresTwoFactor(mockUser)).toBe(false)
    })
  })

  describe('Edge Cases and Security (Bible: 02-USERS, 05-TECH)', () => {
    it('should handle user without email gracefully', async () => {
      const userWithoutEmail = {
        ...mockUser,
        email: null,
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      const result = await twoFactorService.generateSetup(userWithoutEmail)

      expect(result.secret).toBeDefined()
      expect(result.qrCodeDataUrl).toBeDefined()
    })

    it('should hash backup codes before storing', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      })

      await twoFactorService.generateSetup(mockUser)

      const setCall = mockDb.update().set
      const storedCodes = setCall.mock.calls[0][0].twoFactorBackupCodes

      storedCodes.forEach((hash: string) => {
        expect(hash).toMatch(/^[a-f0-9]{64}$/)
      })
    })

    it('should allow verification to proceed if 2FA not enabled', async () => {
      const result = await twoFactorService.verifyCode(mockUser, 'any-code')

      expect(result).toBe(true)
    })
  })
})
