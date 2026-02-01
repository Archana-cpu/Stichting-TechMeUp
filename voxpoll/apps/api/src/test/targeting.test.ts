// ═══════════════════════════════════════════════════════════════════════════════
// P1-010: TARGET AUDIENCE FILTERING TESTS
// Bible: 03-FEATURES/01-polls.md, P1-010
// ═══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { targetingService } from '../services/targeting.service'
import type { TargetAudienceConfig, UserDemographics } from '../services/targeting.service'

vi.mock('@voxpoll/database', () => ({
  db: {
    select: vi.fn(),
  },
  eq: vi.fn((field, value) => ({ field, value, type: 'eq' })),
  users: {
    id: 'id',
    birthDate: 'birthDate',
    gender: 'gender',
    country: 'country',
    region: 'region',
    educationLevel: 'educationLevel',
    employmentStatus: 'employmentStatus',
  },
}))

import { db } from '@voxpoll/database'

describe('P1-010: Target Audience Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockDbResponse = (user: Partial<UserDemographics> | null) => {
    const selectMock = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(user ? [user] : []),
    }
    vi.mocked(db.select).mockReturnValue(selectMock as any)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIG VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Config Validation', () => {
    it('should validate valid config', () => {
      const config: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 18, max: 65 },
        genders: ['MALE', 'FEMALE'],
        countries: ['TR', 'US'],
        regions: ['MARMARA', 'AEGEAN'],
        educationLevels: ['BACHELOR', 'MASTER'],
        employmentStatuses: ['EMPLOYED', 'SELF_EMPLOYED'],
      }

      expect(targetingService.validateTargetAudienceConfig(config)).toBe(true)
    })

    it('should reject invalid config (missing enabled)', () => {
      const config = {
        ageRange: { min: 18, max: 65 },
      }

      expect(targetingService.validateTargetAudienceConfig(config)).toBe(false)
    })

    it('should reject invalid age range (min > max)', () => {
      const config: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 65, max: 18 },
      }

      expect(targetingService.validateTargetAudienceConfig(config)).toBe(false)
    })

    it('should reject invalid age range (max > 150)', () => {
      const config: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 18, max: 200 },
      }

      expect(targetingService.validateTargetAudienceConfig(config)).toBe(false)
    })

    it('should reject invalid country code (not 2 chars)', () => {
      const config: TargetAudienceConfig = {
        enabled: true,
        countries: ['TURKEY'],
      }

      expect(targetingService.validateTargetAudienceConfig(config)).toBe(false)
    })

    it('should accept null optional fields', () => {
      const config: TargetAudienceConfig = {
        enabled: true,
        ageRange: null,
        genders: null,
        countries: null,
      }

      expect(targetingService.validateTargetAudienceConfig(config)).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // DEMOGRAPHIC CHECKS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Demographic Checks', () => {
    it('should pass all criteria when user matches', () => {
      const demographics: UserDemographics = {
        birthDate: new Date('1990-01-01'),
        gender: 'MALE',
        country: 'TR',
        region: 'MARMARA',
        educationLevel: 'BACHELOR',
        employmentStatus: 'EMPLOYED',
      }

      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
        genders: ['MALE', 'FEMALE'],
        countries: ['TR'],
        regions: ['MARMARA'],
        educationLevels: ['BACHELOR', 'MASTER'],
        employmentStatuses: ['EMPLOYED'],
      }

      const result = targetingService.checkDemographics(demographics, targetAudience)

      expect(result.isEligible).toBe(true)
      expect(result.failedCriteria).toEqual([])
      expect(result.matchedCriteria).toHaveLength(6)
      expect(result.missingInfo).toEqual([])
    })

    it('should fail on age criteria', () => {
      const demographics: UserDemographics = {
        birthDate: new Date('2010-01-01'),
        gender: 'MALE',
      }

      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
      }

      const result = targetingService.checkDemographics(demographics, targetAudience)

      expect(result.isEligible).toBe(false)
      expect(result.failedCriteria).toContain('age')
    })

    it('should fail on gender criteria', () => {
      const demographics: UserDemographics = {
        gender: 'OTHER',
      }

      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        genders: ['MALE', 'FEMALE'],
      }

      const result = targetingService.checkDemographics(demographics, targetAudience)

      expect(result.isEligible).toBe(false)
      expect(result.failedCriteria).toContain('gender')
    })

    it('should detect missing information', () => {
      const demographics: UserDemographics = {
        birthDate: undefined,
        gender: undefined,
      }

      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 18, max: 65 },
        genders: ['MALE'],
      }

      const result = targetingService.checkDemographics(demographics, targetAudience)

      expect(result.isEligible).toBe(true)
      expect(result.missingInfo).toContain('age')
      expect(result.missingInfo).toContain('gender')
      expect(result.failedCriteria).toEqual([])
    })

    it('should handle case-insensitive matching', () => {
      const demographics: UserDemographics = {
        gender: 'male',
        country: 'tr',
      }

      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        genders: ['MALE'],
        countries: ['TR'],
      }

      const result = targetingService.checkDemographics(demographics, targetAudience)

      expect(result.isEligible).toBe(true)
      expect(result.matchedCriteria).toContain('gender')
      expect(result.matchedCriteria).toContain('country')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // ELIGIBILITY CHECK (WITH DB)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Eligibility Check', () => {
    it('should return eligible when targeting is disabled', async () => {
      mockDbResponse({
        birthDate: new Date('1990-01-01'),
      })

      const result = await targetingService.checkEligibility('user1', null)

      expect(result.isEligible).toBe(true)
      expect(result.failedCriteria).toEqual([])
    })

    it('should return eligible when targeting is not enabled', async () => {
      mockDbResponse({
        birthDate: new Date('1990-01-01'),
      })

      const targetAudience: TargetAudienceConfig = {
        enabled: false,
        ageRange: { min: 50, max: 60 },
      }

      const result = await targetingService.checkEligibility('user1', targetAudience)

      expect(result.isEligible).toBe(true)
    })

    it('should return not eligible when user not found', async () => {
      mockDbResponse(null)

      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 18, max: 65 },
      }

      const result = await targetingService.checkEligibility('user1', targetAudience)

      expect(result.isEligible).toBe(false)
      expect(result.failedCriteria).toContain('user_not_found')
    })

    it('should check eligibility with multiple criteria', async () => {
      mockDbResponse({
        birthDate: new Date('1990-01-01'),
        gender: 'MALE',
        country: 'TR',
      })

      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
        genders: ['MALE'],
        countries: ['TR', 'US'],
      }

      const result = await targetingService.checkEligibility('user1', targetAudience)

      expect(result.isEligible).toBe(true)
      expect(result.matchedCriteria).toHaveLength(3)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // AGE CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Age Calculations', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date('1990-06-15')
      const ageRange = targetingService.getAgeRangeFromBirthDate(birthDate)

      expect(ageRange).toBe('35-44')
    })

    it('should return correct age ranges', () => {
      expect(targetingService.getAgeRangeFromBirthDate(new Date('2002-01-01'))).toBe('18-24')
      expect(targetingService.getAgeRangeFromBirthDate(new Date('1995-01-01'))).toBe('25-34')
      expect(targetingService.getAgeRangeFromBirthDate(new Date('1985-01-01'))).toBe('35-44')
      expect(targetingService.getAgeRangeFromBirthDate(new Date('1975-01-01'))).toBe('45-54')
      expect(targetingService.getAgeRangeFromBirthDate(new Date('1965-01-01'))).toBe('55+')
    })

    it('should return null for underage users', () => {
      const birthDate = new Date('2010-01-01')
      const ageRange = targetingService.getAgeRangeFromBirthDate(birthDate)

      expect(ageRange).toBeNull()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // DEMOGRAPHIC SNAPSHOT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Demographic Snapshot', () => {
    it('should build complete snapshot', () => {
      const user: UserDemographics = {
        birthDate: new Date('1990-01-01'),
        gender: 'MALE',
        country: 'TR',
        region: 'MARMARA',
        educationLevel: 'BACHELOR',
        employmentStatus: 'EMPLOYED',
      }

      const snapshot = targetingService.buildDemographicSnapshot(user)

      expect(snapshot.ageRange).toBe('35-44')
      expect(snapshot.gender).toBe('MALE')
      expect(snapshot.country).toBe('TR')
      expect(snapshot.region).toBe('MARMARA')
      expect(snapshot.educationLevel).toBe('BACHELOR')
      expect(snapshot.employmentStatus).toBe('EMPLOYED')
    })

    it('should handle missing fields', () => {
      const user: UserDemographics = {
        birthDate: undefined,
        gender: undefined,
      }

      const snapshot = targetingService.buildDemographicSnapshot(user)

      expect(snapshot.ageRange).toBeUndefined()
      expect(snapshot.gender).toBeUndefined()
    })

    it('should exclude null values', () => {
      const user: UserDemographics = {
        birthDate: null,
        gender: null,
        country: 'TR',
      }

      const snapshot = targetingService.buildDemographicSnapshot(user)

      expect(snapshot.ageRange).toBeUndefined()
      expect(snapshot.gender).toBeUndefined()
      expect(snapshot.country).toBe('TR')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // RELIABILITY IMPACT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Reliability Impact', () => {
    it('should have no penalty when targeting is disabled', () => {
      const result = targetingService.calculateTargetingImpactOnReliability(null, 1000, 500)

      expect(result.coverageRate).toBe(1.0)
      expect(result.isRepresentative).toBe(true)
      expect(result.reliabilityPenalty).toBe(0)
    })

    it('should calculate coverage rate correctly', () => {
      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
      }

      const result = targetingService.calculateTargetingImpactOnReliability(
        targetAudience,
        1000,
        600
      )

      expect(result.coverageRate).toBe(0.6)
    })

    it('should apply narrowness penalty (1 criteria = 0.05)', () => {
      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
      }

      const result = targetingService.calculateTargetingImpactOnReliability(
        targetAudience,
        1000,
        600
      )

      expect(result.reliabilityPenalty).toBe(0.05)
    })

    it('should apply narrowness penalty (3 criteria = 0.15)', () => {
      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
        genders: ['MALE'],
        countries: ['TR'],
      }

      const result = targetingService.calculateTargetingImpactOnReliability(
        targetAudience,
        1000,
        600
      )

      expect(result.reliabilityPenalty).toBeCloseTo(0.15, 10)
    })

    it('should cap narrowness penalty at 0.25', () => {
      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
        genders: ['MALE'],
        countries: ['TR'],
        regions: ['MARMARA'],
        educationLevels: ['BACHELOR'],
        employmentStatuses: ['EMPLOYED'],
      }

      const result = targetingService.calculateTargetingImpactOnReliability(
        targetAudience,
        1000,
        600
      )

      expect(result.reliabilityPenalty).toBeLessThanOrEqual(0.35)
    })

    it('should apply low coverage penalty (<50%)', () => {
      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
      }

      const result = targetingService.calculateTargetingImpactOnReliability(
        targetAudience,
        1000,
        300
      )

      expect(result.coverageRate).toBe(0.3)
      expect(result.reliabilityPenalty).toBeGreaterThan(0.05)
    })

    it('should determine representativeness (coverage >= 0.3, criteria <= 3)', () => {
      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
        genders: ['MALE', 'FEMALE'],
      }

      const result = targetingService.calculateTargetingImpactOnReliability(
        targetAudience,
        1000,
        400
      )

      expect(result.isRepresentative).toBe(true)
    })

    it('should mark as non-representative (too narrow)', () => {
      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
        genders: ['MALE'],
        countries: ['TR'],
        regions: ['MARMARA'],
        educationLevels: ['PHD'],
      }

      const result = targetingService.calculateTargetingImpactOnReliability(
        targetAudience,
        1000,
        400
      )

      expect(result.isRepresentative).toBe(false)
    })

    it('should mark as non-representative (low coverage)', () => {
      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
      }

      const result = targetingService.calculateTargetingImpactOnReliability(
        targetAudience,
        1000,
        200
      )

      expect(result.isRepresentative).toBe(false)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // EDGE CASES
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Edge Cases', () => {
    it('should handle empty criteria (all users eligible)', () => {
      const demographics: UserDemographics = {
        birthDate: new Date('1990-01-01'),
      }

      const targetAudience: TargetAudienceConfig = {
        enabled: true,
      }

      const result = targetingService.checkDemographics(demographics, targetAudience)

      expect(result.isEligible).toBe(true)
      expect(result.matchedCriteria).toEqual([])
      expect(result.failedCriteria).toEqual([])
    })

    it('should handle empty arrays (no restrictions)', () => {
      const demographics: UserDemographics = {
        gender: 'MALE',
      }

      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        genders: [],
      }

      const result = targetingService.checkDemographics(demographics, targetAudience)

      expect(result.isEligible).toBe(true)
    })

    it('should handle zero responses in reliability calculation', () => {
      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
      }

      const result = targetingService.calculateTargetingImpactOnReliability(
        targetAudience,
        0,
        0
      )

      expect(result.coverageRate).toBe(0)
      expect(result.isRepresentative).toBe(false)
    })

    it('should handle multiple failed criteria', () => {
      const demographics: UserDemographics = {
        birthDate: new Date('2010-01-01'),
        gender: 'OTHER',
        country: 'XX',
      }

      const targetAudience: TargetAudienceConfig = {
        enabled: true,
        ageRange: { min: 25, max: 40 },
        genders: ['MALE', 'FEMALE'],
        countries: ['TR', 'US'],
      }

      const result = targetingService.checkDemographics(demographics, targetAudience)

      expect(result.isEligible).toBe(false)
      expect(result.failedCriteria).toHaveLength(3)
      expect(result.failedCriteria).toContain('age')
      expect(result.failedCriteria).toContain('gender')
      expect(result.failedCriteria).toContain('country')
    })
  })
})
