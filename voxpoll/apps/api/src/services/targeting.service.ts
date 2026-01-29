// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TARGETING SERVICE
// Bible: P1-010, 03-FEATURES/01-polls.md
// Target audience filtering for polls and surveys
// ═══════════════════════════════════════════════════════════════════════════════

import { db, eq } from '@voxpoll/database'
import { users } from '@voxpoll/database'
import type { User } from '@voxpoll/database'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TargetAudienceConfig {
  enabled: boolean
  ageRange?: { min: number; max: number } | null
  genders?: string[] | null
  countries?: string[] | null
  regions?: string[] | null
  educationLevels?: string[] | null
  employmentStatuses?: string[] | null
}

export interface TargetingCheckResult {
  isEligible: boolean
  failedCriteria: string[]
  matchedCriteria: string[]
  missingInfo: string[]
}

export interface UserDemographics {
  birthDate?: Date | null
  gender?: string | null
  country?: string | null
  region?: string | null
  educationLevel?: string | null
  employmentStatus?: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'] as const

// ─────────────────────────────────────────────────────────────────────────────
// Targeting Service Class
// ─────────────────────────────────────────────────────────────────────────────

class TargetingServiceClass {
  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK ELIGIBILITY
  // ═══════════════════════════════════════════════════════════════════════════

  async checkEligibility(
    userId: string,
    targetAudience: TargetAudienceConfig | null
  ): Promise<TargetingCheckResult> {
    if (!targetAudience || !targetAudience.enabled) {
      return {
        isEligible: true,
        failedCriteria: [],
        matchedCriteria: [],
        missingInfo: [],
      }
    }

    const [user] = await db
      .select({
        birthDate: users.birthDate,
        gender: users.gender,
        country: users.country,
        region: users.region,
        educationLevel: users.educationLevel,
        employmentStatus: users.employmentStatus,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return {
        isEligible: false,
        failedCriteria: ['user_not_found'],
        matchedCriteria: [],
        missingInfo: [],
      }
    }

    return this.checkDemographics(user, targetAudience)
  }

  checkDemographics(
    demographics: UserDemographics,
    targetAudience: TargetAudienceConfig
  ): TargetingCheckResult {
    const failedCriteria: string[] = []
    const matchedCriteria: string[] = []
    const missingInfo: string[] = []

    if (targetAudience.ageRange) {
      const ageCheck = this.checkAge(demographics.birthDate, targetAudience.ageRange)
      if (ageCheck === 'missing') {
        missingInfo.push('age')
      } else if (ageCheck === 'failed') {
        failedCriteria.push('age')
      } else {
        matchedCriteria.push('age')
      }
    }

    if (targetAudience.genders && targetAudience.genders.length > 0) {
      const genderCheck = this.checkArrayMatch(
        demographics.gender,
        targetAudience.genders,
        'gender'
      )
      if (genderCheck === 'missing') {
        missingInfo.push('gender')
      } else if (genderCheck === 'failed') {
        failedCriteria.push('gender')
      } else {
        matchedCriteria.push('gender')
      }
    }

    if (targetAudience.countries && targetAudience.countries.length > 0) {
      const countryCheck = this.checkArrayMatch(
        demographics.country,
        targetAudience.countries,
        'country'
      )
      if (countryCheck === 'missing') {
        missingInfo.push('country')
      } else if (countryCheck === 'failed') {
        failedCriteria.push('country')
      } else {
        matchedCriteria.push('country')
      }
    }

    if (targetAudience.regions && targetAudience.regions.length > 0) {
      const regionCheck = this.checkArrayMatch(
        demographics.region,
        targetAudience.regions,
        'region'
      )
      if (regionCheck === 'missing') {
        missingInfo.push('region')
      } else if (regionCheck === 'failed') {
        failedCriteria.push('region')
      } else {
        matchedCriteria.push('region')
      }
    }

    if (targetAudience.educationLevels && targetAudience.educationLevels.length > 0) {
      const eduCheck = this.checkArrayMatch(
        demographics.educationLevel,
        targetAudience.educationLevels,
        'education'
      )
      if (eduCheck === 'missing') {
        missingInfo.push('education')
      } else if (eduCheck === 'failed') {
        failedCriteria.push('education')
      } else {
        matchedCriteria.push('education')
      }
    }

    if (targetAudience.employmentStatuses && targetAudience.employmentStatuses.length > 0) {
      const empCheck = this.checkArrayMatch(
        demographics.employmentStatus,
        targetAudience.employmentStatuses,
        'employment'
      )
      if (empCheck === 'missing') {
        missingInfo.push('employment')
      } else if (empCheck === 'failed') {
        failedCriteria.push('employment')
      } else {
        matchedCriteria.push('employment')
      }
    }

    return {
      isEligible: failedCriteria.length === 0,
      failedCriteria,
      matchedCriteria,
      missingInfo,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private checkAge(
    birthDate: Date | null | undefined,
    ageRange: { min: number; max: number }
  ): 'passed' | 'failed' | 'missing' {
    if (!birthDate) return 'missing'

    const age = this.calculateAge(birthDate)
    if (age >= ageRange.min && age <= ageRange.max) {
      return 'passed'
    }
    return 'failed'
  }

  private checkArrayMatch(
    value: string | null | undefined,
    allowedValues: string[],
    _criteriaName: string
  ): 'passed' | 'failed' | 'missing' {
    if (!value) return 'missing'

    const normalizedValue = value.toUpperCase()
    const normalizedAllowed = allowedValues.map((v) => v.toUpperCase())

    if (normalizedAllowed.includes(normalizedValue)) {
      return 'passed'
    }
    return 'failed'
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  getAgeRangeFromBirthDate(birthDate: Date): (typeof AGE_RANGES)[number] | null {
    const age = this.calculateAge(birthDate)

    if (age >= 18 && age <= 24) return '18-24'
    if (age >= 25 && age <= 34) return '25-34'
    if (age >= 35 && age <= 44) return '35-44'
    if (age >= 45 && age <= 54) return '45-54'
    if (age >= 55) return '55+'

    return null
  }

  buildDemographicSnapshot(user: UserDemographics): {
    ageRange?: string
    gender?: string
    country?: string
    region?: string
    educationLevel?: string
    employmentStatus?: string
  } {
    return {
      ageRange: user.birthDate
        ? this.getAgeRangeFromBirthDate(user.birthDate) || undefined
        : undefined,
      gender: user.gender || undefined,
      country: user.country || undefined,
      region: user.region || undefined,
      educationLevel: user.educationLevel || undefined,
      employmentStatus: user.employmentStatus || undefined,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  validateTargetAudienceConfig(config: unknown): config is TargetAudienceConfig {
    if (!config || typeof config !== 'object') return false

    const cfg = config as TargetAudienceConfig

    if (typeof cfg.enabled !== 'boolean') return false

    if (cfg.ageRange !== undefined && cfg.ageRange !== null) {
      if (
        typeof cfg.ageRange.min !== 'number' ||
        typeof cfg.ageRange.max !== 'number' ||
        cfg.ageRange.min < 0 ||
        cfg.ageRange.max < cfg.ageRange.min ||
        cfg.ageRange.max > 150
      ) {
        return false
      }
    }

    if (cfg.genders !== undefined && cfg.genders !== null) {
      if (!Array.isArray(cfg.genders)) return false
      if (!cfg.genders.every((g: unknown) => typeof g === 'string')) return false
    }

    if (cfg.countries !== undefined && cfg.countries !== null) {
      if (!Array.isArray(cfg.countries)) return false
      if (!cfg.countries.every((c: unknown) => typeof c === 'string' && (c as string).length === 2))
        return false
    }

    if (cfg.regions !== undefined && cfg.regions !== null) {
      if (!Array.isArray(cfg.regions)) return false
      if (!cfg.regions.every((r: unknown) => typeof r === 'string')) return false
    }

    if (cfg.educationLevels !== undefined && cfg.educationLevels !== null) {
      if (!Array.isArray(cfg.educationLevels)) return false
      if (!cfg.educationLevels.every((e: unknown) => typeof e === 'string')) return false
    }

    if (cfg.employmentStatuses !== undefined && cfg.employmentStatuses !== null) {
      if (!Array.isArray(cfg.employmentStatuses)) return false
      if (!cfg.employmentStatuses.every((e: unknown) => typeof e === 'string')) return false
    }

    return true
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RELIABILITY IMPACT (Bible: P1-010)
  // ═══════════════════════════════════════════════════════════════════════════

  calculateTargetingImpactOnReliability(
    targetAudience: TargetAudienceConfig | null,
    totalResponses: number,
    targetedResponses: number
  ): {
    coverageRate: number
    isRepresentative: boolean
    reliabilityPenalty: number
  } {
    if (!targetAudience || !targetAudience.enabled) {
      return {
        coverageRate: 1.0,
        isRepresentative: true,
        reliabilityPenalty: 0,
      }
    }

    const coverageRate = totalResponses > 0 ? targetedResponses / totalResponses : 0

    let criteriaCount = 0
    if (targetAudience.ageRange) criteriaCount++
    if (targetAudience.genders?.length) criteriaCount++
    if (targetAudience.countries?.length) criteriaCount++
    if (targetAudience.regions?.length) criteriaCount++
    if (targetAudience.educationLevels?.length) criteriaCount++
    if (targetAudience.employmentStatuses?.length) criteriaCount++

    const narrownessPenalty = Math.min(criteriaCount * 0.05, 0.25)

    const lowCoveragePenalty = coverageRate < 0.5 ? (0.5 - coverageRate) * 0.2 : 0

    const reliabilityPenalty = narrownessPenalty + lowCoveragePenalty

    const isRepresentative = coverageRate >= 0.3 && criteriaCount <= 3

    return {
      coverageRate,
      isRepresentative,
      reliabilityPenalty: Math.min(reliabilityPenalty, 0.35),
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const targetingService = new TargetingServiceClass()
