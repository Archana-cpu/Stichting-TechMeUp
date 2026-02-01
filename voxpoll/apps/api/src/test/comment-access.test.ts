// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - COMMENT ACCESS RULES TESTS
// [BIBLE: P-060 - Plus Tier Access Rules, P-109 - Premium Cannot Bypass Participation]
// Bible Source: 00-MASTER/DECISIONS.md, P-060, P-109
// Bible Source: 03-FEATURES/05-pulse-comments.md
// Implementation: apps/api/src/middleware/permissions.ts (line 582-776)
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkCommentAccess,
  requireCommentReadAccess,
  requireCommentWriteAccess,
  type CommentAccessResult,
} from '../middleware/permissions'
import type { Context } from 'hono'
import type { AppEnv } from '../types'

// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────────────────

vi.mock('@voxpoll/database', async () => {
  const actual = await vi.importActual('@voxpoll/database')
  return {
    ...actual,
    db: {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    },
  }
})

const mockDb = {
  select: vi.fn(),
}

function createMockContext(overrides?: Partial<Context<AppEnv>>): Context<AppEnv> {
  const variables = new Map<string, unknown>()
  return {
    req: {
      header: vi.fn(),
      query: vi.fn(),
      param: vi.fn(),
    },
    get: vi.fn((key: string) => variables.get(key)),
    set: vi.fn((key: string, value: unknown) => variables.set(key, value)),
    ...overrides,
  } as unknown as Context<AppEnv>
}

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Comment Access Rules - READ Access (Bible P-060)
// Bible: P-060 access matrix - READ access rules
// ──────────────────────────────────────────────────────────────────────────────

describe('Comment Access Rules - READ Access (P-060)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FREE User - No Participation', () => {
    it('should deny READ access (P-060: Free no part. = No)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        'hash123'
      )

      expect(result.canRead).toBe(false)
      expect(result.requiresParticipation).toBe(true)
    })
  })

  describe('FREE User - Participated', () => {
    it('should allow READ access (P-060: Free participated = Yes)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'response1' }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        'hash123'
      )

      expect(result.canRead).toBe(true)
      expect(result.readReason).toBe('participated')
      expect(result.requiresParticipation).toBe(false)
    })
  })

  describe('PLUS User - No Participation', () => {
    it('should allow READ access (P-060: Plus no part. = Yes)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'PLUS',
            }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1'
      )

      expect(result.canRead).toBe(true)
      expect(result.readReason).toBe('premium_access')
      expect(result.requiresParticipation).toBe(true)
    })
  })

  describe('PLUS User - Participated', () => {
    it('should allow READ access (P-060: Plus participated = Yes)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'PLUS',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'response1' }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        'hash123'
      )

      expect(result.canRead).toBe(true)
      expect(result.readReason).toBe('premium_access')
      expect(result.requiresParticipation).toBe(false)
    })
  })

  describe('PREMIUM User - No Participation', () => {
    it('should allow READ access (P-060: Premium no part. = Yes)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'PREMIUM',
            }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1'
      )

      expect(result.canRead).toBe(true)
      expect(result.readReason).toBe('premium_access')
      expect(result.requiresParticipation).toBe(true)
    })
  })

  describe('PREMIUM User - Participated', () => {
    it('should allow READ access (P-060: Premium participated = Yes)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'PREMIUM',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'response1' }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        'hash123'
      )

      expect(result.canRead).toBe(true)
      expect(result.readReason).toBe('premium_access')
      expect(result.requiresParticipation).toBe(false)
    })
  })

  describe('Creator', () => {
    it('should allow READ access (creator always has access)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'creator1',
              role: 'USER',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'creator1',
        'poll1',
        'POLL',
        'creator1'
      )

      expect(result.canRead).toBe(true)
      expect(result.readReason).toBe('creator')
    })
  })

  describe('Admin', () => {
    it('should allow READ access (admin always has access)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'admin1',
              role: 'ADMIN',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'admin1',
        'poll1',
        'POLL',
        'creator1'
      )

      expect(result.canRead).toBe(true)
      expect(result.readReason).toBe('admin')
    })

    it('should allow READ access for SUPER_ADMIN', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'superadmin1',
              role: 'SUPER_ADMIN',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'superadmin1',
        'poll1',
        'POLL',
        'creator1'
      )

      expect(result.canRead).toBe(true)
      expect(result.readReason).toBe('admin')
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Comment Access Rules - WRITE Access (Bible P-060 + P-109)
// Bible: P-060 access matrix - WRITE requires participation
// Bible: P-109 - Premium CANNOT bypass participation for WRITE
// ──────────────────────────────────────────────────────────────────────────────

describe('Comment Access Rules - WRITE Access (P-060 + P-109)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FREE User - No Participation', () => {
    it('should deny WRITE access (P-060: Free no part. = No)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        'hash123'
      )

      expect(result.canWrite).toBe(false)
      expect(result.requiresParticipation).toBe(true)
    })
  })

  describe('FREE User - Participated', () => {
    it('should allow WRITE access with voice access requirement (P-060: Request Required)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'response1' }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        'hash123'
      )

      expect(result.canWrite).toBe(true)
      expect(result.writeReason).toBe('participated')
      expect(result.requiresVoiceAccess).toBe(true)
    })
  })

  describe('PLUS User - No Participation (P-109 Compliance)', () => {
    it('should deny WRITE access (P-109: Premium CANNOT bypass participation)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'PLUS',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        'hash123'
      )

      expect(result.canWrite).toBe(false)
      expect(result.requiresParticipation).toBe(true)
    })
  })

  describe('PLUS User - Participated', () => {
    it('should allow WRITE access without voice access requirement', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'PLUS',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'response1' }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        'hash123'
      )

      expect(result.canWrite).toBe(true)
      expect(result.writeReason).toBe('participated')
      expect(result.requiresVoiceAccess).toBe(false)
    })
  })

  describe('PREMIUM User - No Participation (P-109 Compliance)', () => {
    it('should deny WRITE access (P-109: Premium CANNOT bypass participation)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'PREMIUM',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        'hash123'
      )

      expect(result.canWrite).toBe(false)
      expect(result.requiresParticipation).toBe(true)
    })
  })

  describe('PREMIUM User - Participated', () => {
    it('should allow WRITE access without voice access requirement', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'PREMIUM',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'response1' }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        'hash123'
      )

      expect(result.canWrite).toBe(true)
      expect(result.writeReason).toBe('participated')
      expect(result.requiresVoiceAccess).toBe(false)
    })
  })

  describe('Creator', () => {
    it('should allow WRITE access (creator always has access)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'creator1',
              role: 'USER',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'creator1',
        'poll1',
        'POLL',
        'creator1'
      )

      expect(result.canWrite).toBe(true)
      expect(result.writeReason).toBe('creator')
      expect(result.requiresVoiceAccess).toBeUndefined()
    })
  })

  describe('Admin', () => {
    it('should allow WRITE access (admin always has access)', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'admin1',
              role: 'ADMIN',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'admin1',
        'poll1',
        'POLL',
        'creator1'
      )

      expect(result.canWrite).toBe(true)
      expect(result.writeReason).toBe('admin')
      expect(result.requiresVoiceAccess).toBeUndefined()
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Content Type Support (POLL, SURVEY, TEST)
// ──────────────────────────────────────────────────────────────────────────────

describe('Comment Access Rules - Content Types', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POLL Content Type', () => {
    it('should check participation via pollResponses table', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'response1' }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        'hash123'
      )

      expect(result.canRead).toBe(true)
      expect(result.canWrite).toBe(true)
    })
  })

  describe('SURVEY Content Type', () => {
    it('should check participation via surveyResponses table', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'response1' }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'survey1',
        'SURVEY',
        'creator1',
        'hash123'
      )

      expect(result.canRead).toBe(true)
      expect(result.canWrite).toBe(true)
    })
  })

  describe('TEST Content Type', () => {
    it('should check participation via personalityTestResults table', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'PREMIUM',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'result1' }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'test1',
        'TEST',
        'creator1'
      )

      expect(result.canRead).toBe(true)
      expect(result.canWrite).toBe(true)
    })

    it('should fallback to quizAttempts table if personalityTestResults not found', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'PREMIUM',
            }]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never)

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'attempt1' }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'test1',
        'TEST',
        'creator1'
      )

      expect(result.canRead).toBe(true)
      expect(result.canWrite).toBe(true)
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Error Cases
// ──────────────────────────────────────────────────────────────────────────────

describe('Comment Access Rules - Error Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('No User ID', () => {
    it('should deny all access when userId is null', async () => {
      const result = await checkCommentAccess(
        null,
        'poll1',
        'POLL',
        'creator1'
      )

      expect(result.canRead).toBe(false)
      expect(result.canWrite).toBe(false)
      expect(result.requiresParticipation).toBe(true)
    })
  })

  describe('User Not Found', () => {
    it('should deny all access when user not found in database', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'nonexistent',
        'poll1',
        'POLL',
        'creator1'
      )

      expect(result.canRead).toBe(false)
      expect(result.canWrite).toBe(false)
      expect(result.requiresParticipation).toBe(true)
    })
  })

  describe('No Participant Hash', () => {
    it('should not detect participation without participantHash', async () => {
      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: 'FREE',
            }]),
          }),
        }),
      } as never)

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1'
      )

      expect(result.canRead).toBe(false)
      expect(result.canWrite).toBe(false)
      expect(result.requiresParticipation).toBe(true)
    })
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Middleware - requireCommentReadAccess
// ──────────────────────────────────────────────────────────────────────────────

describe('Middleware - requireCommentReadAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow request when user has READ access', async () => {
    const { db } = await import('@voxpoll/database')
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 'user1',
            role: 'USER',
            subscriptionTier: 'PLUS',
          }]),
        }),
      } as never)
    })

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      } as never)
    })

    const getContentInfo = async () => ({
      contentId: 'poll1',
      contentType: 'POLL' as const,
      creatorId: 'creator1',
    })

    const middleware = requireCommentReadAccess(getContentInfo)
    const c = createMockContext()
    c.get = vi.fn((key) => {
      if (key === 'user') return { id: 'user1' }
      return undefined
    }) as never
    c.req.header = vi.fn(() => undefined) as never
    c.req.query = vi.fn(() => undefined) as never

    const next = vi.fn()

    await middleware(c, next)

    expect(next).toHaveBeenCalled()
  })

  it('should reject request when user lacks READ access', async () => {
    const { db } = await import('@voxpoll/database')
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 'user1',
            role: 'USER',
            subscriptionTier: 'FREE',
          }]),
        }),
      } as never)
    })

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      } as never)
    })

    const getContentInfo = async () => ({
      contentId: 'poll1',
      contentType: 'POLL' as const,
      creatorId: 'creator1',
    })

    const middleware = requireCommentReadAccess(getContentInfo)
    const c = createMockContext()
    c.get = vi.fn((key) => {
      if (key === 'user') return { id: 'user1' }
      return undefined
    }) as never
    c.req.header = vi.fn(() => 'hash123') as never

    const next = vi.fn()

    await expect(middleware(c, next)).rejects.toThrow('You must participate in this content to read comments')
    expect(next).not.toHaveBeenCalled()
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Middleware - requireCommentWriteAccess
// ──────────────────────────────────────────────────────────────────────────────

describe('Middleware - requireCommentWriteAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow request when user has WRITE access', async () => {
    const { db } = await import('@voxpoll/database')
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 'user1',
            role: 'USER',
            subscriptionTier: 'PLUS',
          }]),
        }),
      } as never)
    })

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 'response1' }]),
        }),
      } as never)
    })

    const getContentInfo = async () => ({
      contentId: 'poll1',
      contentType: 'POLL' as const,
      creatorId: 'creator1',
    })

    const middleware = requireCommentWriteAccess(getContentInfo)
    const c = createMockContext()
    c.get = vi.fn((key) => {
      if (key === 'user') return { id: 'user1' }
      return undefined
    }) as never
    c.req.header = vi.fn(() => 'hash123') as never

    const next = vi.fn()

    await middleware(c, next)

    expect(next).toHaveBeenCalled()
  })

  it('should reject request when PREMIUM user has not participated (P-109)', async () => {
    const { db } = await import('@voxpoll/database')
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 'user1',
            role: 'USER',
            subscriptionTier: 'PREMIUM',
          }]),
        }),
      } as never)
    })

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      } as never)
    })

    const getContentInfo = async () => ({
      contentId: 'poll1',
      contentType: 'POLL' as const,
      creatorId: 'creator1',
    })

    const middleware = requireCommentWriteAccess(getContentInfo)
    const c = createMockContext()
    c.get = vi.fn((key) => {
      if (key === 'user') return { id: 'user1' }
      return undefined
    }) as never
    c.req.header = vi.fn(() => 'hash123') as never

    const next = vi.fn()

    await expect(middleware(c, next)).rejects.toThrow('You must participate in this content to write comments')
    expect(next).not.toHaveBeenCalled()
  })

  it('should set requiresVoiceAccess flag for FREE participated users', async () => {
    const { db } = await import('@voxpoll/database')
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 'user1',
            role: 'USER',
            subscriptionTier: 'FREE',
          }]),
        }),
      } as never)
    })

    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 'response1' }]),
        }),
      } as never)
    })

    const getContentInfo = async () => ({
      contentId: 'poll1',
      contentType: 'POLL' as const,
      creatorId: 'creator1',
    })

    const middleware = requireCommentWriteAccess(getContentInfo)
    const c = createMockContext()
    const mockSet = vi.fn()
    c.get = vi.fn((key) => {
      if (key === 'user') return { id: 'user1' }
      return undefined
    }) as never
    c.set = mockSet as never
    c.req.header = vi.fn(() => 'hash123') as never

    const next = vi.fn()

    await middleware(c, next)

    expect(mockSet).toHaveBeenCalledWith('requiresVoiceAccess', true)
    expect(next).toHaveBeenCalled()
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Access Matrix Verification (Bible P-060)
// Comprehensive matrix check
// ──────────────────────────────────────────────────────────────────────────────

describe('Comment Access Rules - P-060 Access Matrix Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should match complete P-060 access matrix', async () => {
    const accessMatrix = [
      { user: 'FREE', participated: false, canRead: false, canWrite: false },
      { user: 'FREE', participated: true, canRead: true, canWrite: true },
      { user: 'PLUS', participated: false, canRead: true, canWrite: false },
      { user: 'PLUS', participated: true, canRead: true, canWrite: true },
      { user: 'PREMIUM', participated: false, canRead: true, canWrite: false },
      { user: 'PREMIUM', participated: true, canRead: true, canWrite: true },
    ]

    for (const { user, participated, canRead, canWrite } of accessMatrix) {
      vi.clearAllMocks()

      const { db } = await import('@voxpoll/database')
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 'user1',
              role: 'USER',
              subscriptionTier: user,
            }]),
          }),
        }),
      } as never)

      if (participated) {
        vi.mocked(db.select).mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'response1' }]),
            }),
          }),
        } as never)
      } else {
        vi.mocked(db.select).mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as never)
      }

      const result = await checkCommentAccess(
        'user1',
        'poll1',
        'POLL',
        'creator1',
        participated ? 'hash123' : undefined
      )

      expect(result.canRead).toBe(canRead)
      expect(result.canWrite).toBe(canWrite)
    }
  })
})
