// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE VISITS INTEGRATION TESTS
// Bible: 03-FEATURES/08-social.md#Profile-Visits, TASK-007
// Test Coverage: Profile visit tracking, tier-based access, anonymous visits
// Created: 2026-01-29 by Claude DEV 1 (NyoWorks)
// ═══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { profileVisitService } from '../services/profilevisit.service'
import { ApiError } from '../middleware/error-handler'

// ─────────────────────────────────────────────────────────────────────────────
// Mock Setup
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('@voxpoll/database', () => {
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
  }

  return {
    db: mockDb,
    eq: vi.fn(),
    and: vi.fn(),
    desc: vi.fn(),
    gte: vi.fn(),
    users: {
      id: 'id',
      subscriptionTier: 'subscriptionTier',
      username: 'username',
      displayName: 'displayName',
      avatarUrl: 'avatarUrl',
      verificationLevel: 'verificationLevel',
    },
    profileVisits: {
      id: 'id',
      visitorId: 'visitorId',
      profileId: 'profileId',
      source: 'source',
      isAnonymous: 'isAnonymous',
      visitedAt: 'visitedAt',
    },
  }
})

import { db } from '@voxpoll/database'

// ─────────────────────────────────────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────────────────────────────────────

const freeUserId = 'user-free-123'
const plusUserId = 'user-plus-456'
const premiumUserId = 'user-premium-789'
const targetUserId = 'user-target-101'

const mockFreeUser = {
  id: freeUserId,
  username: 'freeuser',
  displayName: 'Free User',
  subscriptionTier: 'FREE',
  verificationLevel: 0,
  avatarUrl: null,
}

const mockPlusUser = {
  id: plusUserId,
  username: 'plususer',
  displayName: 'Plus User',
  subscriptionTier: 'PLUS',
  verificationLevel: 1,
  avatarUrl: null,
}

const mockPremiumUser = {
  id: premiumUserId,
  username: 'premiumuser',
  displayName: 'Premium User',
  subscriptionTier: 'PREMIUM',
  verificationLevel: 2,
  avatarUrl: null,
}

const mockTargetUser = {
  id: targetUserId,
  username: 'targetuser',
  displayName: 'Target User',
  subscriptionTier: 'PLUS',
  verificationLevel: 1,
  avatarUrl: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// Profile Visit Tracking Tests (Bible: P-022)
// ─────────────────────────────────────────────────────────────────────────────

describe('Profile Visit Tracking (TASK-007, P-022)', () => {
  it('should track profile visit with source', async () => {
    const mockVisit = {
      id: 'visit-123',
      profileId: targetUserId,
      visitorId: freeUserId,
      source: 'SEARCH',
      isAnonymous: false,
      visitedAt: new Date(),
    }

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockVisit]),
      }),
    })

    const visit = await profileVisitService.trackVisit(
      targetUserId,
      freeUserId,
      'SEARCH',
      false
    )

    expect(visit).toBeDefined()
    expect(visit.profileId).toBe(targetUserId)
    expect(visit.visitorId).toBe(freeUserId)
    expect(visit.source).toBe('SEARCH')
    expect(visit.isAnonymous).toBe(false)
  })

  it('should prevent self-visit tracking', async () => {
    await expect(
      profileVisitService.trackVisit(targetUserId, targetUserId, 'DIRECT', false)
    ).rejects.toThrow('Cannot track self-visit')
  })

  it('should track anonymous visit (Premium feature)', async () => {
    const mockVisit = {
      id: 'visit-anon-456',
      profileId: targetUserId,
      visitorId: null,
      source: 'DIRECT',
      isAnonymous: true,
      visitedAt: new Date(),
    }

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockVisit]),
      }),
    })

    const visit = await profileVisitService.trackVisit(
      targetUserId,
      premiumUserId,
      'DIRECT',
      true
    )

    expect(visit).toBeDefined()
    expect(visit.profileId).toBe(targetUserId)
    expect(visit.visitorId).toBeNull()
    expect(visit.isAnonymous).toBe(true)
  })

  it('should track visit from non-logged-in user', async () => {
    const mockVisit = {
      id: 'visit-external-789',
      profileId: targetUserId,
      visitorId: null,
      source: 'EXTERNAL',
      isAnonymous: false,
      visitedAt: new Date(),
    }

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockVisit]),
      }),
    })

    const visit = await profileVisitService.trackVisit(
      targetUserId,
      null,
      'EXTERNAL',
      false
    )

    expect(visit).toBeDefined()
    expect(visit.profileId).toBe(targetUserId)
    expect(visit.visitorId).toBeNull()
    expect(visit.source).toBe('EXTERNAL')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Get Visitors Tests (Bible: Tier-based access)
// ─────────────────────────────────────────────────────────────────────────────

describe('Get Profile Visitors - Tier-Based Access (TASK-007)', () => {
  it('should allow PLUS user to see visitors (7 days)', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPlusUser]),
        }),
      }),
    })

    const mockVisitors = [
      {
        id: 'visit-1',
        visitorId: freeUserId,
        profileId: plusUserId,
        source: 'SEARCH',
        isAnonymous: false,
        visitedAt: new Date(),
        visitor: mockFreeUser,
      },
    ]

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPlusUser]),
        }),
      }),
    }).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockVisitors),
              }),
            }),
          }),
        }),
      }),
    })

    const visitors = await profileVisitService.getVisitors(
      plusUserId,
      plusUserId,
      20,
      0
    )

    expect(visitors).toBeDefined()
    expect(Array.isArray(visitors)).toBe(true)
  })

  it('should allow PREMIUM user to see visitors (30 days)', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPremiumUser]),
        }),
      }),
    })

    const mockVisitors = [
      {
        id: 'visit-2',
        visitorId: plusUserId,
        profileId: premiumUserId,
        source: 'FEED',
        isAnonymous: false,
        visitedAt: new Date(),
        visitor: mockPlusUser,
      },
    ]

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPremiumUser]),
        }),
      }),
    }).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockVisitors),
              }),
            }),
          }),
        }),
      }),
    })

    const visitors = await profileVisitService.getVisitors(
      premiumUserId,
      premiumUserId,
      20,
      0
    )

    expect(visitors).toBeDefined()
    expect(Array.isArray(visitors)).toBe(true)
  })

  it('should reject FREE user trying to see visitors (Bible: Tier restriction)', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockFreeUser]),
        }),
      }),
    })

    await expect(
      profileVisitService.getVisitors(freeUserId, freeUserId, 20, 0)
    ).rejects.toThrow('Profil ziyaretçilerini görmek için Plus veya Premium üyelik gereklidir.')
  })

  it('should return error for non-existent user', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    })

    await expect(
      profileVisitService.getVisitors('non-existent', 'non-existent', 20, 0)
    ).rejects.toThrow('Kullanıcı bulunamadı.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Visitor Count Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Get Visitor Count (TASK-007)', () => {
  it('should return total and unique visitor counts', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPlusUser]),
        }),
      }),
    })

    const mockVisits = [
      {
        id: 'visit-1',
        visitorId: freeUserId,
        profileId: plusUserId,
        source: 'SEARCH',
        isAnonymous: false,
        visitedAt: new Date(),
      },
      {
        id: 'visit-2',
        visitorId: freeUserId,
        profileId: plusUserId,
        source: 'FEED',
        isAnonymous: false,
        visitedAt: new Date(),
      },
      {
        id: 'visit-3',
        visitorId: premiumUserId,
        profileId: plusUserId,
        source: 'DIRECT',
        isAnonymous: false,
        visitedAt: new Date(),
      },
    ]

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPlusUser]),
        }),
      }),
    }).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockVisits),
      }),
    })

    const count = await profileVisitService.getVisitorCount(plusUserId, plusUserId)

    expect(count).toBeDefined()
    expect(count.total).toBe(3)
    expect(count.unique).toBe(2)
    expect(count.period).toBe('7 days')
  })

  it('should respect PLUS tier period (7 days)', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPlusUser]),
        }),
      }),
    })

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPlusUser]),
        }),
      }),
    }).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    })

    const count = await profileVisitService.getVisitorCount(plusUserId, plusUserId)
    expect(count.period).toBe('7 days')
  })

  it('should respect PREMIUM tier period (30 days)', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPremiumUser]),
        }),
      }),
    })

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPremiumUser]),
        }),
      }),
    }).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    })

    const count = await profileVisitService.getVisitorCount(premiumUserId, premiumUserId)
    expect(count.period).toBe('30 days')
  })

  it('should reject FREE user (Bible: Tier restriction)', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockFreeUser]),
        }),
      }),
    })

    await expect(
      profileVisitService.getVisitorCount(freeUserId, freeUserId)
    ).rejects.toThrow('Profil ziyaretçi sayısını görmek için Plus veya Premium üyelik gereklidir.')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Anonymous Visit Tests (Bible: Premium-only feature)
// ─────────────────────────────────────────────────────────────────────────────

describe('Anonymous Visit Feature - Premium Only (TASK-007)', () => {
  it('should allow PREMIUM user to visit anonymously', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPremiumUser]),
        }),
      }),
    })

    const canVisit = await profileVisitService.canVisitAnonymously(premiumUserId)
    expect(canVisit).toBe(true)
  })

  it('should deny PLUS user from visiting anonymously', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPlusUser]),
        }),
      }),
    })

    const canVisit = await profileVisitService.canVisitAnonymously(plusUserId)
    expect(canVisit).toBe(false)
  })

  it('should deny FREE user from visiting anonymously', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockFreeUser]),
        }),
      }),
    })

    const canVisit = await profileVisitService.canVisitAnonymously(freeUserId)
    expect(canVisit).toBe(false)
  })

  it('should return false for non-existent user', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    })

    const canVisit = await profileVisitService.canVisitAnonymously('non-existent')
    expect(canVisit).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Feature Access Tests (Bible: Tier-based features)
// ─────────────────────────────────────────────────────────────────────────────

describe('Profile Visit Features by Tier (TASK-007)', () => {
  it('should return FREE tier features (0 days history)', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockFreeUser]),
        }),
      }),
    })

    const features = await profileVisitService.getFeatures(freeUserId)

    expect(features).toEqual({
      canSeeVisitors: false,
      canVisitAnonymously: false,
      visitHistoryDays: 0,
    })
  })

  it('should return PLUS tier features (7 days history)', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPlusUser]),
        }),
      }),
    })

    const features = await profileVisitService.getFeatures(plusUserId)

    expect(features).toEqual({
      canSeeVisitors: true,
      canVisitAnonymously: false,
      visitHistoryDays: 7,
    })
  })

  it('should return PREMIUM tier features (30 days history + anonymous)', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPremiumUser]),
        }),
      }),
    })

    const features = await profileVisitService.getFeatures(premiumUserId)

    expect(features).toEqual({
      canSeeVisitors: true,
      canVisitAnonymously: true,
      visitHistoryDays: 30,
    })
  })

  it('should return FREE features for non-existent user', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    })

    const features = await profileVisitService.getFeatures('non-existent')

    expect(features).toEqual({
      canSeeVisitors: false,
      canVisitAnonymously: false,
      visitHistoryDays: 0,
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Source Tracking Tests (Bible: All 6 sources)
// ─────────────────────────────────────────────────────────────────────────────

describe('Visit Source Tracking (TASK-007)', () => {
  const sources = ['SEARCH', 'FEED', 'COMMENT', 'MENTION', 'DIRECT', 'EXTERNAL'] as const

  sources.forEach((source) => {
    it(`should track visit from ${source}`, async () => {
      const mockVisit = {
        id: `visit-${source.toLowerCase()}`,
        profileId: targetUserId,
        visitorId: freeUserId,
        source,
        isAnonymous: false,
        visitedAt: new Date(),
      }

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockVisit]),
        }),
      })

      const visit = await profileVisitService.trackVisit(
        targetUserId,
        freeUserId,
        source,
        false
      )

      expect(visit.source).toBe(source)
    })
  })
})
