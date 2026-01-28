// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ALGORITHM SERVICE
// Integrates @voxpoll/algorithms for scoring, voting, and statistics
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  sql,
  gte,
  users,
  polls,
  pollResponses,
  surveyResponses,
  reports,
  comments,
  userTrustScores,
} from '@voxpoll/database'
import {
  // Scoring
  calculateTrustScore,
  calculateWilsonScore,
  calculateHotScore,
  calculateControversy,
  calculateBestScore,
  type TrustScoreInput,
  type TrustScoreResult,
  type HotScoreInput,
  // Voting
  calculateSimpleVote,
  calculateRankedChoice,
  calculateBordaCount,
  calculateApprovalVoting,
  type Vote,
  type SimpleVoteOutput,
  type RankedChoiceResult,
  type BordaCountResult,
  type ApprovalResult,
  // Statistics
  mean,
  median,
  mode,
  variance,
  standardDeviation,
  percentile,
  quartiles,
  calculateMarginOfError,
  calculateConfidenceInterval,
  chiSquareTest,
  type ConfidenceInterval,
} from '@voxpoll/algorithms'
import { cacheService } from './cache.service'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PollStatistics {
  totalVotes: number
  mean: number
  median: number
  mode: number[]
  standardDeviation: number
  variance: number
  percentiles: {
    p25: number
    p50: number
    p75: number
    p90: number
  }
  marginOfError: number
  confidenceInterval: ConfidenceInterval
}

export interface CommentRanking {
  commentId: string
  wilsonScore: number
  controversyScore: number
  hotScore: number
  bestScore: number
}

export interface ReliabilityResult {
  overallScore: number
  components: {
    sampleQuality: number
    responseQuality: number
    methodology: number
    verification: number
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Algorithm Service Class
// ─────────────────────────────────────────────────────────────────────────────

class AlgorithmServiceClass {
  // ═══════════════════════════════════════════════════════════════════════════
  // USER TRUST SCORING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate trust score for a user
   * Cached for 5 minutes to avoid recalculation
   */
  async calculateUserTrustScore(userId: string): Promise<TrustScoreResult> {
    const cacheKey = `trust_score:${userId}`

    // Check cache first
    const cached = await cacheService.get<TrustScoreResult>(cacheKey)
    if (cached) return cached

    // Fetch user data
    const [user] = await db
      .select({
        createdAt: users.createdAt,
        emailVerified: users.emailVerified,
        phoneVerified: users.phoneVerified,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return {
        score: 0,
        level: 'untrusted',
        factors: { accountAge: 0, verification: 0, activity: 0, reputation: 0 },
      }
    }

    // Get counts for user activities
    const [pollsCountResult] = await db.select({ count: sql<number>`count(*)::int` }).from(polls).where(eq(polls.creatorId, userId))
    // Note: Poll responses are anonymous (use participantHash), so we can't count per-user directly
    const pollResponsesCountResult = { count: 0 }
    const [commentsCountResult] = await db.select({ count: sql<number>`count(*)::int` }).from(comments).where(eq(comments.authorId, userId))
    const [reportFiledCountResult] = await db.select({ count: sql<number>`count(*)::int` }).from(reports).where(eq(reports.reporterId, userId))

    // Calculate account age in days
    const accountAge = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Get reports against user
    const [reportsAgainstResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(and(eq(reports.targetId, userId), eq(reports.targetType, 'USER')))
    const reportsAgainst = reportsAgainstResult?.count ?? 0

    // Get accurate reports (those that resulted in action)
    const [accurateReportsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(and(
        eq(reports.reporterId, userId),
        sql`${reports.resolution} IN ('WARNING_ISSUED', 'CONTENT_REMOVED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_BANNED')`
      ))
    const accurateReports = accurateReportsResult?.count ?? 0

    // Get warnings received
    const [warningsReceivedResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(and(eq(reports.targetId, userId), eq(reports.targetType, 'USER'), eq(reports.resolution, 'WARNING_ISSUED')))

    const warningsReceived = warningsReceivedResult?.count ?? 0

    const input: TrustScoreInput = {
      accountAge,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified ?? false,
      pollsCreated: pollsCountResult?.count ?? 0,
      pollsParticipated: pollResponsesCountResult?.count ?? 0,
      commentsCount: commentsCountResult?.count ?? 0,
      reportsAgainst,
      reportsSubmitted: reportFiledCountResult?.count ?? 0,
      accurateReports,
      warningsReceived,
      bansReceived: user.status === 'BANNED' ? 1 : 0,
    }

    const result = calculateTrustScore(input)

    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, 300)

    return result
  }

  /**
   * Update and store trust score in database
   */
  async updateStoredTrustScore(userId: string): Promise<number> {
    const trustResult = await this.calculateUserTrustScore(userId)

    // Check if exists
    const [existing] = await db
      .select({ id: userTrustScores.id })
      .from(userTrustScores)
      .where(eq(userTrustScores.userId, userId))
      .limit(1)

    if (existing) {
      await db
        .update(userTrustScores)
        .set({
          overallScore: trustResult.score,
          accountAge: trustResult.factors.accountAge,
          verificationLevel: trustResult.factors.verification,
          activityConsistency: trustResult.factors.activity,
          socialTrust: trustResult.factors.reputation,
          lastCalculatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userTrustScores.userId, userId))
    } else {
      await db
        .insert(userTrustScores)
        .values({
          userId,
          overallScore: trustResult.score,
          accountAge: trustResult.factors.accountAge,
          verificationLevel: trustResult.factors.verification,
          activityConsistency: trustResult.factors.activity,
          socialTrust: trustResult.factors.reputation,
        })
    }

    return trustResult.score
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT HOT SCORING (Trending)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate hot score for a poll
   */
  calculatePollHotScore(
    participantCount: number,
    viewCount: number,
    createdAt: Date
  ): number {
    // Treat participants as upvotes, views/10 as implicit interest
    const upvotes = participantCount + Math.floor(viewCount / 10)
    return calculateHotScore({ upvotes, downvotes: 0, createdAt })
  }

  /**
   * Update poll's hot score in database
   */
  async updatePollHotScore(pollId: string): Promise<number> {
    const [poll] = await db
      .select({
        participantCount: polls.participantCount,
        viewCount: polls.viewCount,
        createdAt: polls.createdAt,
      })
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1)

    if (!poll) return 0

    const hotScore = this.calculatePollHotScore(
      poll.participantCount,
      poll.viewCount,
      poll.createdAt
    )

    await db
      .update(polls)
      .set({ hotScore })
      .where(eq(polls.id, pollId))

    return hotScore
  }

  /**
   * Batch update hot scores for trending calculation
   */
  async updateTrendingScores(): Promise<number> {
    // Get polls from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentPolls = await db
      .select({
        id: polls.id,
        participantCount: polls.participantCount,
        viewCount: polls.viewCount,
        createdAt: polls.createdAt,
      })
      .from(polls)
      .where(and(eq(polls.status, 'ACTIVE'), gte(polls.createdAt, sevenDaysAgo)))

    let updated = 0
    for (const poll of recentPolls) {
      const hotScore = this.calculatePollHotScore(
        poll.participantCount,
        poll.viewCount,
        poll.createdAt
      )

      await db
        .update(polls)
        .set({ hotScore })
        .where(eq(polls.id, poll.id))
      updated++
    }

    return updated
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMENT RANKING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate Wilson score for a comment
   */
  calculateCommentWilsonScore(upvotes: number, downvotes: number): number {
    return calculateWilsonScore({ positive: upvotes, negative: downvotes })
  }

  /**
   * Calculate all ranking scores for a comment
   */
  calculateCommentRankings(
    upvotes: number,
    downvotes: number,
    createdAt: Date
  ): Omit<CommentRanking, 'commentId'> {
    const input: HotScoreInput = { upvotes, downvotes, createdAt }

    return {
      wilsonScore: calculateWilsonScore({ positive: upvotes, negative: downvotes }),
      controversyScore: calculateControversy(upvotes, downvotes),
      hotScore: calculateHotScore(input),
      bestScore: calculateBestScore(input),
    }
  }

  /**
   * Update comment ranking scores in database
   */
  async updateCommentRankings(commentId: string): Promise<void> {
    const [comment] = await db
      .select({
        upvoteCount: comments.upvotes,
        downvoteCount: comments.downvotes,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)

    if (!comment) return

    const rankings = this.calculateCommentRankings(
      comment.upvoteCount,
      comment.downvoteCount,
      comment.createdAt
    )

    await db
      .update(comments)
      .set({
        wilsonScore: rankings.wilsonScore,
        controversyScore: rankings.controversyScore,
      })
      .where(eq(comments.id, commentId))
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POLL VOTING ALGORITHMS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate poll results based on voting algorithm
   */
  async calculatePollResults(
    pollId: string,
    algorithm: 'SIMPLE' | 'RANKED' | 'BORDA' | 'APPROVAL' = 'SIMPLE'
  ): Promise<SimpleVoteOutput | RankedChoiceResult | BordaCountResult | ApprovalResult> {
    // Poll responses are anonymous (no userId), so we can't weight by verification level
    const responses = await db
      .select({
        answers: pollResponses.answers,
      })
      .from(pollResponses)
      .where(and(eq(pollResponses.pollId, pollId), eq(pollResponses.isValid, true)))

    // Transform responses to votes (all equal weight since anonymous)
    const votes: Vote[] = responses.flatMap((response) => {
      const answers = response.answers as { optionId: string; rank?: number }[]

      return answers.map((answer) => ({
        optionId: answer.optionId,
        weight: 1,
        rank: answer.rank,
      }))
    })

    // Get unique option IDs from all votes
    const optionIds = [...new Set(votes.map(v => v.optionId))]

    switch (algorithm) {
      case 'RANKED': {
        // Transform to ranked votes with rankings array
        const rankedVotes = responses.map((r) => {
          const answers = r.answers as { optionId: string; rank: number }[]
          return {
            rankings: answers.sort((a, b) => a.rank - b.rank).map((a) => a.optionId),
          }
        })
        return calculateRankedChoice(rankedVotes, optionIds)
      }
      case 'BORDA': {
        // Transform to ranked votes with rankings array
        const bordaVotes = responses.map((r) => {
          const answers = r.answers as { optionId: string; rank: number }[]
          return {
            rankings: answers.sort((a, b) => a.rank - b.rank).map((a) => a.optionId),
          }
        })
        return calculateBordaCount(bordaVotes, optionIds)
      }
      case 'APPROVAL': {
        // Transform to approval votes with approvedOptions array
        const approvalVotes = responses.map((r) => {
          const answers = r.answers as { optionId: string; approved?: boolean }[]
          return {
            approvedOptions: answers.filter((a) => a.approved).map((a) => a.optionId),
          }
        })
        return calculateApprovalVoting(approvalVotes, optionIds)
      }
      default:
        return calculateSimpleVote(votes)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATISTICAL ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate comprehensive statistics for poll results
   */
  async getPollStatistics(pollId: string): Promise<PollStatistics> {
    const [poll] = await db
      .select({
        options: polls.options,
        participantCount: polls.participantCount,
      })
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1)

    if (!poll) {
      return {
        totalVotes: 0,
        mean: 0,
        median: 0,
        mode: [],
        standardDeviation: 0,
        variance: 0,
        percentiles: { p25: 0, p50: 0, p75: 0, p90: 0 },
        marginOfError: 0,
        confidenceInterval: { lower: 0, upper: 0, marginOfError: 0, confidence: 0.95 },
      }
    }

    const options = poll.options as { id: string; text: string; voteCount: number }[]
    const voteCounts = options.map((o) => o.voteCount)

    if (voteCounts.length === 0 || poll.participantCount === 0) {
      return {
        totalVotes: 0,
        mean: 0,
        median: 0,
        mode: [],
        standardDeviation: 0,
        variance: 0,
        percentiles: { p25: 0, p50: 0, p75: 0, p90: 0 },
        marginOfError: 0,
        confidenceInterval: { lower: 0, upper: 0, marginOfError: 0, confidence: 0.95 },
      }
    }

    const q = quartiles(voteCounts)
    const sampleProportion = (voteCounts[0] ?? 0) / poll.participantCount

    return {
      totalVotes: poll.participantCount,
      mean: mean(voteCounts),
      median: median(voteCounts),
      mode: mode(voteCounts),
      standardDeviation: standardDeviation(voteCounts),
      variance: variance(voteCounts),
      percentiles: {
        p25: q.q1,
        p50: q.q2,
        p75: q.q3,
        p90: percentile(voteCounts, 90),
      },
      marginOfError: calculateMarginOfError(poll.participantCount, sampleProportion),
      confidenceInterval: calculateConfidenceInterval(
        poll.participantCount,
        sampleProportion
      ),
    }
  }

  /**
   * Calculate chi-square test for independence between two variables
   */
  async calculateCategoryIndependence(
    pollId: string,
    categoryField: 'gender' | 'ageGroup' | 'education'
  ): Promise<{ isSignificant: boolean; pValue: number; chiSquare: number }> {
    // Get responses with demographic snapshot (poll responses are anonymous but may capture demographics at response time)
    const responses = await db
      .select({
        answers: pollResponses.answers,
        demographicSnapshot: pollResponses.demographicSnapshot,
      })
      .from(pollResponses)
      .where(and(eq(pollResponses.pollId, pollId), eq(pollResponses.isValid, true)))

    // Build contingency table
    const contingency: number[][] = []
    // Implementation depends on specific requirements
    // This is a placeholder for the chi-square calculation

    const observed = contingency.flat()
    const expected = observed.map(() => mean(observed))

    const result = chiSquareTest(observed, expected)

    return {
      isSignificant: result.significant,
      pValue: result.pValue,
      chiSquare: result.chiSquare,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RELIABILITY SCORING (Bible T-009)
  // Weights: Sample Quality 35%, Response Quality 30%, Methodology 20%, Verification 15%
  // ═══════════════════════════════════════════════════════════════════════════

  static readonly RELIABILITY_WEIGHTS = {
    SAMPLE_QUALITY: 0.35,
    RESPONSE_QUALITY: 0.30,
    METHODOLOGY: 0.20,
    VERIFICATION: 0.15,
  }

  async calculateReliabilityScore(pollId: string): Promise<ReliabilityResult> {
    const [poll] = await db
      .select({
        participantCount: polls.participantCount,
        options: polls.options,
        requireAuth: polls.requireAuth,
        hasPreTest: polls.hasPreTest,
      })
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1)

    if (!poll) {
      return {
        overallScore: 0,
        components: { sampleQuality: 0, responseQuality: 0, methodology: 0, verification: 0 },
      }
    }

    const sampleQuality = await this.calculateSampleQuality(pollId, poll.participantCount)
    const responseQuality = await this.calculateResponseQuality(pollId, poll.participantCount)
    const methodology = this.calculateMethodologyScore(poll)
    const verification = await this.calculateVerificationScore(pollId)

    const overallScore = Math.round(
      sampleQuality * AlgorithmServiceClass.RELIABILITY_WEIGHTS.SAMPLE_QUALITY +
      responseQuality * AlgorithmServiceClass.RELIABILITY_WEIGHTS.RESPONSE_QUALITY +
      methodology * AlgorithmServiceClass.RELIABILITY_WEIGHTS.METHODOLOGY +
      verification * AlgorithmServiceClass.RELIABILITY_WEIGHTS.VERIFICATION
    )

    return {
      overallScore,
      components: {
        sampleQuality: Math.round(sampleQuality),
        responseQuality: Math.round(responseQuality),
        methodology: Math.round(methodology),
        verification: Math.round(verification),
      },
    }
  }

  private async calculateSampleQuality(pollId: string, participantCount: number): Promise<number> {
    const MIN_SAMPLE = 30
    const GOOD_SAMPLE = 100
    const EXCELLENT_SAMPLE = 384

    if (participantCount < MIN_SAMPLE) {
      return (participantCount / MIN_SAMPLE) * 30
    }

    if (participantCount < GOOD_SAMPLE) {
      return 30 + ((participantCount - MIN_SAMPLE) / (GOOD_SAMPLE - MIN_SAMPLE)) * 40
    }

    if (participantCount < EXCELLENT_SAMPLE) {
      return 70 + ((participantCount - GOOD_SAMPLE) / (EXCELLENT_SAMPLE - GOOD_SAMPLE)) * 20
    }

    return Math.min(100, 90 + (participantCount / 1000) * 10)
  }

  private async calculateResponseQuality(pollId: string, participantCount: number): Promise<number> {
    if (participantCount === 0) return 0

    const [avgQuality] = await db
      .select({ avg: sql<number>`COALESCE(AVG(${pollResponses.qualityScore}), 0)` })
      .from(pollResponses)
      .where(and(eq(pollResponses.pollId, pollId), eq(pollResponses.isValid, true)))

    const [flaggedResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pollResponses)
      .where(and(eq(pollResponses.pollId, pollId), gte(pollResponses.fraudScore, 50)))

    const flaggedRatio = (flaggedResult?.count ?? 0) / participantCount
    const fraudPenalty = flaggedRatio * 30

    return Math.max(0, (avgQuality?.avg ?? 50) - fraudPenalty)
  }

  private calculateMethodologyScore(poll: { requireAuth: boolean; hasPreTest: boolean }): number {
    let score = 50

    if (poll.requireAuth) score += 25
    if (poll.hasPreTest) score += 25

    return Math.min(100, score)
  }

  private async calculateVerificationScore(pollId: string): Promise<number> {
    const responses = await db
      .select({ demographicSnapshot: pollResponses.demographicSnapshot })
      .from(pollResponses)
      .where(and(eq(pollResponses.pollId, pollId), eq(pollResponses.isValid, true)))

    if (responses.length === 0) return 0

    const levelScores: Record<string, number> = {
      NONE: 0,
      BASIC: 25,
      VERIFIED: 50,
      IDENTITY: 75,
      FULLY_VERIFIED: 100,
    }

    const totalScore = responses.reduce((sum, r) => {
      const snapshot = r.demographicSnapshot as { verificationLevel?: string } | null
      const level = snapshot?.verificationLevel ?? 'NONE'
      return sum + (levelScores[level] ?? 0)
    }, 0)

    return totalScore / responses.length
  }

  async updatePollReliability(pollId: string): Promise<void> {
    const reliability = await this.calculateReliabilityScore(pollId)

    await db
      .update(polls)
      .set({
        reliabilityScore: reliability.overallScore,
        reliabilityFactors: reliability.components,
        reliabilityUpdatedAt: new Date(),
      })
      .where(eq(polls.id, pollId))
  }
}

// Export singleton
export const algorithmService = new AlgorithmServiceClass()
