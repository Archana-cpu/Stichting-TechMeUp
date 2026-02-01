import { describe, it, expect } from 'vitest'
import {
  calculateWilsonScore,
  calculateWilsonInterval,
  rankComments,
  getCommentScore,
  type CommentRankingInput,
  type CommentSortMode,
} from '@voxpoll/algorithms/scoring'

describe('Wilson Score & Comment Ranking Tests (P1-007)', () => {
  describe('Wilson Score Interval Calculation (Bible: T-002)', () => {
    it('should return 0 for zero votes', () => {
      const score = calculateWilsonScore({ positive: 0, negative: 0 })
      expect(score).toBe(0)
    })

    it('should return lower score for fewer votes with same ratio', () => {
      const score1 = calculateWilsonScore({ positive: 10, negative: 0 })
      const score2 = calculateWilsonScore({ positive: 100, negative: 0 })

      expect(score2).toBeGreaterThan(score1)
    })

    it('should handle all positive votes correctly', () => {
      const score = calculateWilsonScore({ positive: 100, negative: 0 })

      expect(score).toBeGreaterThan(0.8)
      expect(score).toBeLessThanOrEqual(1)
    })

    it('should handle all negative votes correctly', () => {
      const score = calculateWilsonScore({ positive: 0, negative: 100 })

      expect(score).toBe(0)
    })

    it('should handle 50/50 split conservatively', () => {
      const score = calculateWilsonScore({ positive: 50, negative: 50 })

      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThan(0.6)
    })

    it('should use 95% confidence by default', () => {
      const scoreDefault = calculateWilsonScore({ positive: 10, negative: 2 })
      const score95 = calculateWilsonScore({
        positive: 10,
        negative: 2,
        confidence: 0.95,
      })

      expect(scoreDefault).toBe(score95)
    })

    it('should support different confidence levels', () => {
      const score80 = calculateWilsonScore({
        positive: 10,
        negative: 2,
        confidence: 0.80,
      })
      const score95 = calculateWilsonScore({
        positive: 10,
        negative: 2,
        confidence: 0.95,
      })
      const score99 = calculateWilsonScore({
        positive: 10,
        negative: 2,
        confidence: 0.99,
      })

      expect(score80).toBeGreaterThan(score95)
      expect(score95).toBeGreaterThan(score99)
    })

    it('should calculate both lower and upper bounds', () => {
      const interval = calculateWilsonInterval({ positive: 10, negative: 2 })

      expect(interval.lower).toBeGreaterThan(0)
      expect(interval.upper).toBeLessThanOrEqual(1)
      expect(interval.upper).toBeGreaterThan(interval.lower)
    })

    it('should return 0 interval for zero votes', () => {
      const interval = calculateWilsonInterval({ positive: 0, negative: 0 })

      expect(interval.lower).toBe(0)
      expect(interval.upper).toBe(0)
    })
  })

  describe('Sort Mode: BEST (Bible: T-002)', () => {
    const createComment = (
      id: string,
      upvotes: number,
      downvotes: number,
      hoursAgo: number = 0,
      options: Partial<CommentRankingInput> = {}
    ): CommentRankingInput => ({
      id,
      upvotes,
      downvotes,
      createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      ...options,
    })

    it('should rank higher quality comments first', () => {
      const comments: CommentRankingInput[] = [
        createComment('low', 10, 10),
        createComment('high', 100, 10),
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].id).toBe('high')
      expect(ranked[1].id).toBe('low')
    })

    it('should apply time decay (24h half-life)', () => {
      const referenceDate = new Date('2024-01-01T12:00:00Z')
      const oldDate = new Date('2024-01-01T12:00:00Z')
      oldDate.setHours(oldDate.getHours() - 48)
      const newDate = new Date('2024-01-01T12:00:00Z')

      const comments: CommentRankingInput[] = [
        {
          id: 'old',
          upvotes: 100,
          downvotes: 10,
          createdAt: oldDate,
        },
        {
          id: 'new',
          upvotes: 100,
          downvotes: 10,
          createdAt: newDate,
        },
      ]

      const ranked = rankComments(comments, 'best', referenceDate)

      expect(ranked[0].id).toBe('new')
      expect(ranked[0].timeDecayFactor).toBe(1)
      expect(ranked[1].id).toBe('old')
      expect(ranked[1].timeDecayFactor).toBeLessThan(1)
      expect(ranked[1].timeDecayFactor).toBeGreaterThanOrEqual(0.3)
    })

    it('should not decay below 30%', () => {
      const referenceDate = new Date('2024-01-01T12:00:00Z')
      const comments: CommentRankingInput[] = [
        createComment('very-old', 100, 10, 240),
      ]

      const ranked = rankComments(comments, 'best', referenceDate)

      expect(ranked[0].timeDecayFactor).toBeGreaterThanOrEqual(0.3)
    })

    it('should apply engagement bonus for replies', () => {
      const comments: CommentRankingInput[] = [
        createComment('no-replies', 50, 5, 0, { replyCount: 0 }),
        createComment('with-replies', 50, 5, 0, { replyCount: 10 }),
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].id).toBe('with-replies')
      expect(ranked[0].engagementBonus).toBeGreaterThan(0)
      expect(ranked[1].engagementBonus).toBe(0)
    })

    it('should cap engagement bonus at 15%', () => {
      const comments: CommentRankingInput[] = [
        createComment('many-replies', 50, 5, 0, { replyCount: 100 }),
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].engagementBonus).toBeLessThanOrEqual(0.15)
    })

    it('should apply verification level bonus', () => {
      const comments: CommentRankingInput[] = [
        createComment('unverified', 50, 5, 0, { authorVerificationLevel: 0 }),
        createComment('verified', 50, 5, 0, { authorVerificationLevel: 4 }),
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].id).toBe('verified')
      expect(ranked[0].verificationBonus).toBeGreaterThan(
        ranked[1].verificationBonus
      )
    })

    it('should apply creator comment bonus (10%)', () => {
      const comments: CommentRankingInput[] = [
        createComment('regular', 50, 5, 0, { isCreatorComment: false }),
        createComment('creator', 50, 5, 0, { isCreatorComment: true }),
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].id).toBe('creator')
      expect(ranked[0].verificationBonus).toBeGreaterThanOrEqual(0.10)
    })

    it('should prioritize pinned comments', () => {
      const comments: CommentRankingInput[] = [
        createComment('unpinned', 1000, 0, 0, { isPinned: false }),
        createComment('pinned', 10, 0, 0, { isPinned: true }),
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].id).toBe('pinned')
      expect(ranked[0].score).toBeGreaterThan(1000)
    })
  })

  describe('Sort Mode: TOP (Bible: T-002)', () => {
    const createComment = (
      id: string,
      upvotes: number,
      downvotes: number
    ): CommentRankingInput => ({
      id,
      upvotes,
      downvotes,
      createdAt: new Date(),
    })

    it('should rank by Wilson score only', () => {
      const comments: CommentRankingInput[] = [
        createComment('low', 10, 5),
        createComment('high', 100, 10),
      ]

      const ranked = rankComments(comments, 'top')

      expect(ranked[0].id).toBe('high')
      expect(ranked[0].timeDecayFactor).toBe(1)
      expect(ranked[0].engagementBonus).toBe(0)
      expect(ranked[0].verificationBonus).toBe(0)
    })

    it('should not apply time decay', () => {
      const oldDate = new Date('2020-01-01T00:00:00Z')
      const comments: CommentRankingInput[] = [
        { id: 'old', upvotes: 100, downvotes: 10, createdAt: oldDate },
      ]

      const ranked = rankComments(comments, 'top')

      expect(ranked[0].timeDecayFactor).toBe(1)
    })

    it('should prioritize pinned comments', () => {
      const comments: CommentRankingInput[] = [
        createComment('unpinned', 1000, 0),
        { ...createComment('pinned', 10, 0), isPinned: true },
      ]

      const ranked = rankComments(comments, 'top')

      expect(ranked[0].id).toBe('pinned')
    })
  })

  describe('Sort Mode: NEW (Bible: T-002)', () => {
    it('should rank by creation time (newest first)', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'old',
          upvotes: 1000,
          downvotes: 0,
          createdAt: new Date('2020-01-01T00:00:00Z'),
        },
        {
          id: 'new',
          upvotes: 1,
          downvotes: 0,
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]

      const ranked = rankComments(comments, 'new')

      expect(ranked[0].id).toBe('new')
      expect(ranked[0].wilsonScore).toBe(0)
    })

    it('should ignore vote counts', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'many-votes',
          upvotes: 1000,
          downvotes: 0,
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
        {
          id: 'no-votes',
          upvotes: 0,
          downvotes: 0,
          createdAt: new Date('2024-01-01T01:00:00Z'),
        },
      ]

      const ranked = rankComments(comments, 'new')

      expect(ranked[0].id).toBe('no-votes')
    })

    it('should prioritize pinned comments', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'newest',
          upvotes: 0,
          downvotes: 0,
          createdAt: new Date('2024-01-01T12:00:00Z'),
          isPinned: false,
        },
        {
          id: 'pinned-old',
          upvotes: 0,
          downvotes: 0,
          createdAt: new Date('2020-01-01T00:00:00Z'),
          isPinned: true,
        },
      ]

      const ranked = rankComments(comments, 'new')

      expect(ranked[0].id).toBe('pinned-old')
    })
  })

  describe('Sort Mode: CONTROVERSIAL (Bible: T-002)', () => {
    it('should rank balanced votes higher', () => {
      const comments: CommentRankingInput[] = [
        { id: 'one-sided', upvotes: 100, downvotes: 10, createdAt: new Date() },
        { id: 'balanced', upvotes: 50, downvotes: 50, createdAt: new Date() },
      ]

      const ranked = rankComments(comments, 'controversial')

      expect(ranked[0].id).toBe('balanced')
    })

    it('should favor high vote counts with balance', () => {
      const comments: CommentRankingInput[] = [
        { id: 'low-volume', upvotes: 5, downvotes: 5, createdAt: new Date() },
        { id: 'high-volume', upvotes: 50, downvotes: 50, createdAt: new Date() },
      ]

      const ranked = rankComments(comments, 'controversial')

      expect(ranked[0].id).toBe('high-volume')
    })

    it('should return 0 for no votes', () => {
      const comments: CommentRankingInput[] = [
        { id: 'no-votes', upvotes: 0, downvotes: 0, createdAt: new Date() },
      ]

      const ranked = rankComments(comments, 'controversial')

      expect(ranked[0].score).toBe(0)
    })

    it('should prioritize pinned comments', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'very-controversial',
          upvotes: 100,
          downvotes: 100,
          createdAt: new Date(),
          isPinned: false,
        },
        {
          id: 'pinned-mild',
          upvotes: 5,
          downvotes: 5,
          createdAt: new Date(),
          isPinned: true,
        },
      ]

      const ranked = rankComments(comments, 'controversial')

      expect(ranked[0].id).toBe('pinned-mild')
      expect(ranked[0].score).toBeGreaterThan(1000000)
    })
  })

  describe('Sort Mode: QA (Bible: T-002)', () => {
    it('should boost creator comments (2x multiplier)', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'regular',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date(),
          isCreatorComment: false,
        },
        {
          id: 'creator',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date(),
          isCreatorComment: true,
        },
      ]

      const ranked = rankComments(comments, 'qa')

      expect(ranked[0].id).toBe('creator')
      expect(ranked[0].score).toBeGreaterThan(ranked[1].score * 1.5)
    })

    it('should apply verification bonus', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'unverified',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date(),
          authorVerificationLevel: 0,
        },
        {
          id: 'verified',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date(),
          authorVerificationLevel: 4,
        },
      ]

      const ranked = rankComments(comments, 'qa')

      expect(ranked[0].id).toBe('verified')
      expect(ranked[0].verificationBonus).toBeGreaterThan(
        ranked[1].verificationBonus
      )
    })

    it('should not apply time decay', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'old',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date('2020-01-01T00:00:00Z'),
        },
      ]

      const ranked = rankComments(comments, 'qa')

      expect(ranked[0].timeDecayFactor).toBe(1)
    })

    it('should prioritize pinned comments', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'high-score',
          upvotes: 100,
          downvotes: 0,
          createdAt: new Date(),
          isCreatorComment: true,
          isPinned: false,
        },
        {
          id: 'pinned',
          upvotes: 10,
          downvotes: 0,
          createdAt: new Date(),
          isPinned: true,
        },
      ]

      const ranked = rankComments(comments, 'qa')

      expect(ranked[0].id).toBe('pinned')
    })
  })

  describe('Edge Cases (Bible: T-002)', () => {
    it('should handle empty comment list', () => {
      const ranked = rankComments([], 'best')

      expect(ranked).toEqual([])
    })

    it('should handle single comment', () => {
      const comments: CommentRankingInput[] = [
        { id: 'only', upvotes: 10, downvotes: 2, createdAt: new Date() },
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked).toHaveLength(1)
      expect(ranked[0].rank).toBe(1)
    })

    it('should handle all zero votes', () => {
      const comments: CommentRankingInput[] = [
        { id: 'a', upvotes: 0, downvotes: 0, createdAt: new Date() },
        { id: 'b', upvotes: 0, downvotes: 0, createdAt: new Date() },
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked).toHaveLength(2)
      expect(ranked[0].wilsonScore).toBe(0)
      expect(ranked[1].wilsonScore).toBe(0)
    })

    it('should handle all downvotes (0 upvotes)', () => {
      const comments: CommentRankingInput[] = [
        { id: 'hated', upvotes: 0, downvotes: 100, createdAt: new Date() },
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].wilsonScore).toBe(0)
    })

    it('should assign sequential ranks', () => {
      const comments: CommentRankingInput[] = [
        { id: 'a', upvotes: 100, downvotes: 0, createdAt: new Date() },
        { id: 'b', upvotes: 50, downvotes: 0, createdAt: new Date() },
        { id: 'c', upvotes: 10, downvotes: 0, createdAt: new Date() },
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].rank).toBe(1)
      expect(ranked[1].rank).toBe(2)
      expect(ranked[2].rank).toBe(3)
    })

    it('should handle future dates (negative time decay)', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const comments: CommentRankingInput[] = [
        { id: 'future', upvotes: 10, downvotes: 0, createdAt: futureDate },
      ]

      const ranked = rankComments(comments, 'best', new Date())

      expect(ranked[0].timeDecayFactor).toBe(1)
    })
  })

  describe('Utility: getCommentScore (Bible: T-002)', () => {
    it('should return score for single comment', () => {
      const comment: CommentRankingInput = {
        id: 'test',
        upvotes: 100,
        downvotes: 10,
        createdAt: new Date(),
      }

      const score = getCommentScore(comment, 'best')

      expect(score).toBeGreaterThan(0)
    })

    it('should support all sort modes', () => {
      const comment: CommentRankingInput = {
        id: 'test',
        upvotes: 100,
        downvotes: 10,
        createdAt: new Date(),
      }

      const modes: CommentSortMode[] = ['best', 'top', 'new', 'controversial', 'qa']

      modes.forEach(mode => {
        const score = getCommentScore(comment, mode)
        expect(typeof score).toBe('number')
      })
    })
  })

  describe('Verification Level Bonuses (Bible: T-002, P-004)', () => {
    it('should apply 0% bonus for Level 0 (NONE)', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'level0',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date(),
          authorVerificationLevel: 0,
        },
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].verificationBonus).toBe(0)
    })

    it('should apply 2% bonus for Level 1 (BASIC)', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'level1',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date(),
          authorVerificationLevel: 1,
        },
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].verificationBonus).toBe(0.02)
    })

    it('should apply 4% bonus for Level 2 (VERIFIED)', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'level2',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date(),
          authorVerificationLevel: 2,
        },
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].verificationBonus).toBe(0.04)
    })

    it('should apply 6% bonus for Level 3 (IDENTITY)', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'level3',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date(),
          authorVerificationLevel: 3,
        },
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].verificationBonus).toBe(0.06)
    })

    it('should apply 8% bonus for Level 4 (FULLY_VERIFIED)', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'level4',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date(),
          authorVerificationLevel: 4,
        },
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].verificationBonus).toBe(0.08)
    })

    it('should stack verification and creator bonuses', () => {
      const comments: CommentRankingInput[] = [
        {
          id: 'stacked',
          upvotes: 50,
          downvotes: 5,
          createdAt: new Date(),
          authorVerificationLevel: 4,
          isCreatorComment: true,
        },
      ]

      const ranked = rankComments(comments, 'best')

      expect(ranked[0].verificationBonus).toBe(0.18)
    })
  })
})
