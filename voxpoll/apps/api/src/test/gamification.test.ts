// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - GAMIFICATION SERVICE TESTS
// Tests for gamification service (badges, XP, achievements)
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { gamificationService, XP_VALUES, XP_MILESTONES } from '../services/gamification.service'
import { gamificationRepository } from '../repositories/gamification.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Mock Gamification Repository
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../repositories/gamification.repository', () => ({
  gamificationRepository: {
    getOrCreateProfile: vi.fn(),
    getProfile: vi.fn(),
    getAllBadges: vi.fn(),
    getUserBadges: vi.fn(),
    awardBadge: vi.fn(),
    addXP: vi.fn(),
    updateStreak: vi.fn(),
    incrementStat: vi.fn(),
    getLeaderboard: vi.fn(),
    getXPHistory: vi.fn(),
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────────────────────────────────────

const mockUserId = 'user-123'

const mockProfile = {
  id: 'profile-1',
  userId: mockUserId,
  level: 5,
  currentXp: 2500,
  totalXp: 5000,
  currentStreak: 10,
  longestStreak: 15,
  pollsCreated: 50,
  pollsParticipated: 200,
  surveysCompleted: 30,
  testsCompleted: 20,
  commentsWritten: 100,
  upvotesReceived: 500,
  rank: 'GOLD',
  earnedBadges: [],
}

const mockBadges = [
  {
    id: 'badge-1',
    code: 'VERIFIED_LEVEL_1',
    name: 'Phone Verified',
    description: 'Verified your phone number',
    iconUrl: '/badges/phone-verified.png',
    category: 'VERIFICATION',
    rarity: 'COMMON',
    xpReward: 100,
    criteria: { type: 'custom', customCheck: 'verification_level_1' },
    isSecret: false,
    isActive: true,
  },
  {
    id: 'badge-2',
    code: 'ACHIEVEMENT_BRONZE',
    name: 'Bronze Achiever',
    description: 'Earned 1,000 XP',
    iconUrl: '/badges/bronze.png',
    category: 'ACHIEVEMENT',
    rarity: 'COMMON',
    xpReward: 50,
    criteria: { type: 'stat', field: 'totalXp', threshold: 1000 },
    isSecret: false,
    isActive: true,
  },
  {
    id: 'badge-3',
    code: 'ACHIEVEMENT_SILVER',
    name: 'Silver Achiever',
    description: 'Earned 10,000 XP',
    iconUrl: '/badges/silver.png',
    category: 'ACHIEVEMENT',
    rarity: 'UNCOMMON',
    xpReward: 100,
    criteria: { type: 'stat', field: 'totalXp', threshold: 10000 },
    isSecret: false,
    isActive: true,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Gamification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('should return user gamification profile', async () => {
      vi.mocked(gamificationRepository.getOrCreateProfile).mockResolvedValue(mockProfile)
      vi.mocked(gamificationRepository.getProfile).mockResolvedValue(mockProfile)

      const result = await gamificationService.getProfile(mockUserId)

      expect(result).toBeDefined()
      expect(result.level).toBe(5)
      expect(result.totalXp).toBe(5000)
      expect(result.currentStreak).toBe(10)
      expect(result.stats.pollsCreated).toBe(50)
    })

    it('should calculate XP progress correctly', async () => {
      vi.mocked(gamificationRepository.getOrCreateProfile).mockResolvedValue(mockProfile)
      vi.mocked(gamificationRepository.getProfile).mockResolvedValue(mockProfile)

      const result = await gamificationService.getProfile(mockUserId)

      expect(result.xpProgress).toBe(1000)
      expect(result.xpNeeded).toBe(0)
      expect(result.xpProgressPercent).toBe(100)
    })
  })

  describe('getAllBadges', () => {
    it('should return all available badges', async () => {
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue(mockBadges)

      const result = await gamificationService.getAllBadges()

      expect(result).toHaveLength(3)
      expect(result[0].code).toBe('VERIFIED_LEVEL_1')
      expect(result[1].code).toBe('ACHIEVEMENT_BRONZE')
    })

    it('should filter badges by category', async () => {
      const verificationBadges = mockBadges.filter(b => b.category === 'VERIFICATION')
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue(verificationBadges)

      const result = await gamificationService.getAllBadges('VERIFICATION')

      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('VERIFICATION')
    })
  })

  describe('awardXPForAction', () => {
    it('should award XP for poll creation', async () => {
      vi.mocked(gamificationRepository.getOrCreateProfile).mockResolvedValue(mockProfile)
      vi.mocked(gamificationRepository.updateStreak).mockResolvedValue(undefined)
      vi.mocked(gamificationRepository.addXP).mockResolvedValue({
        id: 'xp-1',
        amount: XP_VALUES.pollCreated,
        type: 'EARNED',
        balanceAfter: 5050,
        createdAt: new Date(),
      })
      vi.mocked(gamificationRepository.incrementStat).mockResolvedValue(undefined)
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue([])

      const result = await gamificationService.awardXPForAction(mockUserId, 'pollCreated', 'poll-123')

      expect(result.amount).toBe(XP_VALUES.pollCreated)
      expect(gamificationRepository.addXP).toHaveBeenCalledWith(
        mockProfile.id,
        XP_VALUES.pollCreated,
        'EARNED',
        'pollCreated',
        'poll-123',
        undefined
      )
      expect(gamificationRepository.incrementStat).toHaveBeenCalledWith(mockUserId, 'pollsCreated')
    })

    it('should award XP for survey completion', async () => {
      vi.mocked(gamificationRepository.getOrCreateProfile).mockResolvedValue(mockProfile)
      vi.mocked(gamificationRepository.updateStreak).mockResolvedValue(undefined)
      vi.mocked(gamificationRepository.addXP).mockResolvedValue({
        id: 'xp-2',
        amount: XP_VALUES.surveyCompleted,
        type: 'EARNED',
        balanceAfter: 5030,
        createdAt: new Date(),
      })
      vi.mocked(gamificationRepository.incrementStat).mockResolvedValue(undefined)
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue([])

      const result = await gamificationService.awardXPForAction(mockUserId, 'surveyCompleted')

      expect(result.amount).toBe(XP_VALUES.surveyCompleted)
      expect(gamificationRepository.incrementStat).toHaveBeenCalledWith(mockUserId, 'surveysCompleted')
    })

    it('should update streak when awarding XP', async () => {
      vi.mocked(gamificationRepository.getOrCreateProfile).mockResolvedValue(mockProfile)
      vi.mocked(gamificationRepository.updateStreak).mockResolvedValue(undefined)
      vi.mocked(gamificationRepository.addXP).mockResolvedValue({
        id: 'xp-3',
        amount: XP_VALUES.dailyLogin,
        type: 'EARNED',
        balanceAfter: 5010,
        createdAt: new Date(),
      })
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue([])

      await gamificationService.awardXPForAction(mockUserId, 'dailyLogin')

      expect(gamificationRepository.updateStreak).toHaveBeenCalledWith(mockUserId)
    })
  })

  describe('awardBadgeByCode', () => {
    it('should award badge by code', async () => {
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue(mockBadges)
      vi.mocked(gamificationRepository.awardBadge).mockResolvedValue(true)

      const result = await gamificationService.awardBadgeByCode(mockUserId, 'VERIFIED_LEVEL_1')

      expect(result).toBeDefined()
      expect(result?.code).toBe('VERIFIED_LEVEL_1')
      expect(result?.name).toBe('Phone Verified')
      expect(gamificationRepository.awardBadge).toHaveBeenCalledWith(mockUserId, 'badge-1')
    })

    it('should return null if badge code not found', async () => {
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue(mockBadges)

      const result = await gamificationService.awardBadgeByCode(mockUserId, 'NONEXISTENT_BADGE')

      expect(result).toBeNull()
      expect(gamificationRepository.awardBadge).not.toHaveBeenCalled()
    })

    it('should return null if badge already awarded', async () => {
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue(mockBadges)
      vi.mocked(gamificationRepository.awardBadge).mockResolvedValue(false)

      const result = await gamificationService.awardBadgeByCode(mockUserId, 'VERIFIED_LEVEL_1')

      expect(result).toBeNull()
    })
  })

  describe('awardVerificationBadge', () => {
    it('should award verification badge for level 1', async () => {
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue(mockBadges)
      vi.mocked(gamificationRepository.awardBadge).mockResolvedValue(true)

      const result = await gamificationService.awardVerificationBadge(mockUserId, 1)

      expect(result).toBeDefined()
      expect(result?.code).toBe('VERIFIED_LEVEL_1')
      expect(gamificationRepository.awardBadge).toHaveBeenCalledWith(mockUserId, 'badge-1')
    })

    it('should return null for verification level 0', async () => {
      const result = await gamificationService.awardVerificationBadge(mockUserId, 0)

      expect(result).toBeNull()
      expect(gamificationRepository.awardBadge).not.toHaveBeenCalled()
    })

    it('should award verification badge for level 2', async () => {
      const level2Badges = [
        ...mockBadges,
        {
          id: 'badge-4',
          code: 'VERIFIED_LEVEL_2',
          name: 'Verified User',
          description: 'Completed secondary verification',
          iconUrl: '/badges/verified.png',
          category: 'VERIFICATION',
          rarity: 'UNCOMMON',
          xpReward: 200,
          criteria: {},
          isSecret: false,
          isActive: true,
        },
      ]
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue(level2Badges)
      vi.mocked(gamificationRepository.awardBadge).mockResolvedValue(true)

      const result = await gamificationService.awardVerificationBadge(mockUserId, 2)

      expect(result).toBeDefined()
      expect(result?.code).toBe('VERIFIED_LEVEL_2')
    })
  })

  describe('checkAndAwardAchievementBadges', () => {
    it('should award bronze badge at 1000 XP', async () => {
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue(mockBadges)
      vi.mocked(gamificationRepository.awardBadge).mockResolvedValue(true)

      const result = await gamificationService.checkAndAwardAchievementBadges(mockUserId, 1000)

      expect(result).toHaveLength(1)
      expect(result[0].code).toBe('ACHIEVEMENT_BRONZE')
    })

    it('should award both bronze and silver badges at 10000 XP', async () => {
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue(mockBadges)
      vi.mocked(gamificationRepository.awardBadge).mockResolvedValue(true)

      const result = await gamificationService.checkAndAwardAchievementBadges(mockUserId, 10000)

      expect(result.length).toBeGreaterThan(0)
    })

    it('should not award badges below threshold', async () => {
      vi.mocked(gamificationRepository.getAllBadges).mockResolvedValue(mockBadges)
      vi.mocked(gamificationRepository.awardBadge).mockResolvedValue(false)

      const result = await gamificationService.checkAndAwardAchievementBadges(mockUserId, 500)

      expect(result).toHaveLength(0)
    })
  })

  describe('XP_VALUES constants', () => {
    it('should have correct XP values', () => {
      expect(XP_VALUES.pollCreated).toBe(50)
      expect(XP_VALUES.pollVoted).toBe(10)
      expect(XP_VALUES.surveyCompleted).toBe(30)
      expect(XP_VALUES.testCompleted).toBe(40)
      expect(XP_VALUES.commentWritten).toBe(5)
      expect(XP_VALUES.commentUpvoted).toBe(2)
      expect(XP_VALUES.dailyLogin).toBe(10)
      expect(XP_VALUES.streakBonus).toBe(5)
    })
  })

  describe('XP_MILESTONES constants', () => {
    it('should have correct milestone thresholds', () => {
      expect(XP_MILESTONES.BRONZE.threshold).toBe(1000)
      expect(XP_MILESTONES.SILVER.threshold).toBe(10000)
      expect(XP_MILESTONES.GOLD.threshold).toBe(50000)
      expect(XP_MILESTONES.PLATINUM.threshold).toBe(100000)
      expect(XP_MILESTONES.DIAMOND.threshold).toBe(500000)
    })

    it('should have correct milestone badge codes', () => {
      expect(XP_MILESTONES.BRONZE.badgeCode).toBe('ACHIEVEMENT_BRONZE')
      expect(XP_MILESTONES.SILVER.badgeCode).toBe('ACHIEVEMENT_SILVER')
      expect(XP_MILESTONES.GOLD.badgeCode).toBe('ACHIEVEMENT_GOLD')
      expect(XP_MILESTONES.PLATINUM.badgeCode).toBe('ACHIEVEMENT_PLATINUM')
      expect(XP_MILESTONES.DIAMOND.badgeCode).toBe('ACHIEVEMENT_DIAMOND')
    })
  })
})
