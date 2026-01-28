// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL - COMMENT RANKING ALGORITHM
// Bible: T-002 (Wilson Score for Comments)
// ═══════════════════════════════════════════════════════════════════════════════

import { calculateWilsonScore } from './wilson-score.js'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CommentRankingInput {
  id: string
  upvotes: number
  downvotes: number
  createdAt: Date
  replyCount?: number
  authorVerificationLevel?: number
  isCreatorComment?: boolean
  isPinned?: boolean
}

export interface CommentRankingResult {
  id: string
  score: number
  wilsonScore: number
  timeDecayFactor: number
  engagementBonus: number
  verificationBonus: number
  rank: number
}

export type CommentSortMode = 'best' | 'top' | 'new' | 'controversial' | 'qa'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const WILSON_CONFIDENCE = 0.95

const TIME_DECAY = {
  halfLifeHours: 24,
  maxDecay: 0.3,
}

const BONUSES = {
  replyWeight: 0.02,
  maxReplyBonus: 0.15,
  verificationLevels: {
    0: 0,
    1: 0.02,
    2: 0.04,
    3: 0.06,
    4: 0.08,
  } as Record<number, number>,
  creatorBonus: 0.10,
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Scoring Functions
// ─────────────────────────────────────────────────────────────────────────────

function calculateTimeDecay(createdAt: Date, referenceDate: Date = new Date()): number {
  const ageHours = (referenceDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

  if (ageHours <= 0) return 1

  const decay = Math.pow(0.5, ageHours / TIME_DECAY.halfLifeHours)

  return Math.max(TIME_DECAY.maxDecay, decay)
}

function calculateEngagementBonus(replyCount: number): number {
  const rawBonus = replyCount * BONUSES.replyWeight
  return Math.min(rawBonus, BONUSES.maxReplyBonus)
}

function calculateVerificationBonus(level: number, isCreator: boolean): number {
  const levelBonus = BONUSES.verificationLevels[level] ?? 0
  const creatorBonus = isCreator ? BONUSES.creatorBonus : 0
  return levelBonus + creatorBonus
}

function calculateControversy(upvotes: number, downvotes: number): number {
  const total = upvotes + downvotes
  if (total === 0) return 0

  const balance = Math.min(upvotes, downvotes) / Math.max(upvotes, downvotes, 1)

  return Math.pow(total, balance)
}

// ─────────────────────────────────────────────────────────────────────────────
// Ranking Functions by Mode
// ─────────────────────────────────────────────────────────────────────────────

function rankByBest(
  comments: CommentRankingInput[],
  referenceDate: Date = new Date()
): CommentRankingResult[] {
  return comments.map(comment => {
    const wilson = calculateWilsonScore({
      positive: comment.upvotes,
      negative: comment.downvotes,
      confidence: WILSON_CONFIDENCE,
    })

    const timeFactor = calculateTimeDecay(comment.createdAt, referenceDate)
    const engagementBonus = calculateEngagementBonus(comment.replyCount ?? 0)
    const verificationBonus = calculateVerificationBonus(
      comment.authorVerificationLevel ?? 0,
      comment.isCreatorComment ?? false
    )

    const score = wilson * (0.7 + 0.3 * timeFactor) + engagementBonus + verificationBonus

    return {
      id: comment.id,
      score: comment.isPinned ? score + 1000 : score,
      wilsonScore: wilson,
      timeDecayFactor: timeFactor,
      engagementBonus,
      verificationBonus,
      rank: 0,
    }
  }).sort((a, b) => b.score - a.score)
    .map((result, index) => ({ ...result, rank: index + 1 }))
}

function rankByTop(comments: CommentRankingInput[]): CommentRankingResult[] {
  return comments.map(comment => {
    const wilson = calculateWilsonScore({
      positive: comment.upvotes,
      negative: comment.downvotes,
      confidence: WILSON_CONFIDENCE,
    })

    return {
      id: comment.id,
      score: comment.isPinned ? wilson + 1000 : wilson,
      wilsonScore: wilson,
      timeDecayFactor: 1,
      engagementBonus: 0,
      verificationBonus: 0,
      rank: 0,
    }
  }).sort((a, b) => b.score - a.score)
    .map((result, index) => ({ ...result, rank: index + 1 }))
}

function rankByNew(comments: CommentRankingInput[]): CommentRankingResult[] {
  return comments.map(comment => {
    const score = comment.createdAt.getTime()

    return {
      id: comment.id,
      score: comment.isPinned ? score + Number.MAX_SAFE_INTEGER / 2 : score,
      wilsonScore: 0,
      timeDecayFactor: 1,
      engagementBonus: 0,
      verificationBonus: 0,
      rank: 0,
    }
  }).sort((a, b) => b.score - a.score)
    .map((result, index) => ({ ...result, rank: index + 1 }))
}

function rankByControversial(comments: CommentRankingInput[]): CommentRankingResult[] {
  return comments.map(comment => {
    const controversy = calculateControversy(comment.upvotes, comment.downvotes)

    return {
      id: comment.id,
      score: comment.isPinned ? controversy + 1000000 : controversy,
      wilsonScore: 0,
      timeDecayFactor: 1,
      engagementBonus: 0,
      verificationBonus: 0,
      rank: 0,
    }
  }).sort((a, b) => b.score - a.score)
    .map((result, index) => ({ ...result, rank: index + 1 }))
}

function rankByQA(
  comments: CommentRankingInput[],
  referenceDate: Date = new Date()
): CommentRankingResult[] {
  return comments.map(comment => {
    const wilson = calculateWilsonScore({
      positive: comment.upvotes,
      negative: comment.downvotes,
      confidence: WILSON_CONFIDENCE,
    })

    const verificationBonus = calculateVerificationBonus(
      comment.authorVerificationLevel ?? 0,
      comment.isCreatorComment ?? false
    )

    const creatorMultiplier = comment.isCreatorComment ? 2 : 1
    const score = (wilson + verificationBonus) * creatorMultiplier

    return {
      id: comment.id,
      score: comment.isPinned ? score + 1000 : score,
      wilsonScore: wilson,
      timeDecayFactor: 1,
      engagementBonus: 0,
      verificationBonus,
      rank: 0,
    }
  }).sort((a, b) => b.score - a.score)
    .map((result, index) => ({ ...result, rank: index + 1 }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Ranking Function
// ─────────────────────────────────────────────────────────────────────────────

export function rankComments(
  comments: CommentRankingInput[],
  mode: CommentSortMode = 'best',
  referenceDate: Date = new Date()
): CommentRankingResult[] {
  switch (mode) {
    case 'best':
      return rankByBest(comments, referenceDate)
    case 'top':
      return rankByTop(comments)
    case 'new':
      return rankByNew(comments)
    case 'controversial':
      return rankByControversial(comments)
    case 'qa':
      return rankByQA(comments, referenceDate)
    default:
      return rankByBest(comments, referenceDate)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Get Comment Score for Single Comment
// ─────────────────────────────────────────────────────────────────────────────

export function getCommentScore(
  comment: CommentRankingInput,
  mode: CommentSortMode = 'best',
  referenceDate: Date = new Date()
): number {
  const [result] = rankComments([comment], mode, referenceDate)
  return result?.score ?? 0
}
