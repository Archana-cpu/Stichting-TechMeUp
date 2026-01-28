// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PULSE SERVICE
// Bible: P-013, P-056
// Spotify Wrap-style results visualization with real-time demographics
// ═══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, sql } from '@voxpoll/database'
import { polls, pollResponses } from '@voxpoll/database'
import type { Poll, PollResponse } from '@voxpoll/database'
import { count } from 'drizzle-orm'
import { getRedis } from '../lib/redis'
import { cacheService } from './cache.service'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PulseTheme {
  primaryColor: string
  secondaryColor: string
  backgroundGradient: string[]
  animationStyle: 'slide' | 'fade' | 'bounce' | 'reveal'
}

export interface PersonalResultData {
  selectedOptionId: string
  selectedOptionText: string
  percentage: number
  rank: number
  totalVoters: number
  sameCohortCount: number
  comparisonText: string
}

export interface AggregateChartData {
  options: Array<{
    id: string
    text: string
    votes: number
    percentage: number
  }>
  totalVotes: number
}

export interface DemographicSegment {
  label: string
  distribution: Array<{
    optionId: string
    optionText: string
    percentage: number
    count: number
  }>
  sampleSize: number
}

export interface DemographicBreakdown {
  category: 'age' | 'gender' | 'location' | 'education'
  segments: DemographicSegment[]
}

export interface PulseComparison {
  type: 'vs_average' | 'vs_demographic' | 'vs_followers'
  userChoice: string
  comparisonGroup: string
  userPercentage: number
  groupPercentage: number
  differenceText: string
}

export interface PulseHighlight {
  type: 'majority' | 'minority' | 'divided' | 'consensus' | 'surprising'
  text: string
  icon: string
}

export interface ShareCard {
  imageUrl: string | null
  title: string
  description: string
  shareText: string
  pollUrl: string
}

export interface PulseData {
  contentId: string
  contentType: 'POLL' | 'SURVEY' | 'TEST'
  theme: PulseTheme
  personalResult?: PersonalResultData
  aggregateChart: AggregateChartData
  demographics: DemographicBreakdown[]
  comparisons: PulseComparison[]
  highlights: PulseHighlight[]
  shareCard: ShareCard
  generatedAt: number
  cacheExpiry: number
}

export interface PulseAccessResult {
  canAccess: boolean
  reason: 'participated' | 'premium_tier' | 'creator' | 'denied'
  requiresParticipation?: boolean
}

interface PollOption {
  id: string
  text: string
  imageUrl?: string
  order?: number
  voteCount: number
}

interface DemographicSnapshot {
  ageRange?: string
  gender?: string
  country?: string
  region?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
  cacheKeyPrefix: 'pulse:',
  cacheTtlMs: 60 * 1000,
  sseBroadcastIntervalMs: 2000,
  demographicMinSampleSize: 10,
}

const DEFAULT_THEME: PulseTheme = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  backgroundGradient: ['#1e1b4b', '#312e81', '#4338ca'],
  animationStyle: 'reveal',
}

// ─────────────────────────────────────────────────────────────────────────────
// PULSE Service Class
// ─────────────────────────────────────────────────────────────────────────────

class PulseServiceClass {
  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESS CONTROL (Bible: P-013, P-016)
  // ═══════════════════════════════════════════════════════════════════════════

  async checkPulseAccess(
    pollId: string,
    userId: string | null,
    userTier: string | null,
    creatorId: string,
    participantHash?: string
  ): Promise<PulseAccessResult> {
    if (userId && userId === creatorId) {
      return { canAccess: true, reason: 'creator' }
    }

    if (userTier === 'PLUS' || userTier === 'PREMIUM') {
      return { canAccess: true, reason: 'premium_tier' }
    }

    if (participantHash) {
      const hasParticipated = await this.hasParticipantHashVoted(pollId, participantHash)
      if (hasParticipated) {
        return { canAccess: true, reason: 'participated' }
      }
    }

    return {
      canAccess: false,
      reason: 'denied',
      requiresParticipation: true,
    }
  }

  private async hasParticipantHashVoted(pollId: string, participantHash: string): Promise<boolean> {
    const [response] = await db
      .select({ id: pollResponses.id })
      .from(pollResponses)
      .where(
        and(eq(pollResponses.pollId, pollId), eq(pollResponses.participantHash, participantHash))
      )
      .limit(1)

    return !!response
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PULSE DATA GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  async generatePulseData(pollId: string, participantHash?: string): Promise<PulseData> {
    const cacheKey = `${CONFIG.cacheKeyPrefix}${pollId}`
    const cached = await cacheService.get<PulseData>(cacheKey)

    if (cached && Date.now() < cached.cacheExpiry) {
      if (participantHash) {
        cached.personalResult = await this.getPersonalResult(
          pollId,
          participantHash,
          cached.aggregateChart
        )
      }
      return cached
    }

    const [poll] = await db.select().from(polls).where(eq(polls.id, pollId)).limit(1)

    if (!poll) {
      throw new Error('Poll not found')
    }

    const options = poll.options as PollOption[]
    const aggregateChart = await this.calculateAggregateChart(pollId, options)
    const demographics = await this.calculateDemographics(pollId, options)
    const highlights = this.generateHighlights(aggregateChart)
    const shareCard = this.generateShareCard(poll, aggregateChart)

    let personalResult: PersonalResultData | undefined
    if (participantHash) {
      personalResult = await this.getPersonalResult(pollId, participantHash, aggregateChart)
    }

    const comparisons: PulseComparison[] = []
    if (personalResult && demographics.length > 0) {
      comparisons.push(...this.generateComparisons(personalResult, demographics))
    }

    const pulseData: PulseData = {
      contentId: pollId,
      contentType: 'POLL',
      theme: DEFAULT_THEME,
      personalResult,
      aggregateChart,
      demographics,
      comparisons,
      highlights,
      shareCard,
      generatedAt: Date.now(),
      cacheExpiry: Date.now() + CONFIG.cacheTtlMs,
    }

    await cacheService.set(cacheKey, pulseData, Math.ceil(CONFIG.cacheTtlMs / 1000))

    return pulseData
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AGGREGATE CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════

  private async calculateAggregateChart(
    pollId: string,
    options: PollOption[]
  ): Promise<AggregateChartData> {
    const responses = await db
      .select({ answers: pollResponses.answers })
      .from(pollResponses)
      .where(and(eq(pollResponses.pollId, pollId), eq(pollResponses.isValid, true)))

    const voteCountMap = new Map<string, number>()
    for (const response of responses) {
      const answers = response.answers as { optionId?: string }
      if (answers?.optionId) {
        voteCountMap.set(answers.optionId, (voteCountMap.get(answers.optionId) || 0) + 1)
      }
    }

    const totalVotes = responses.length

    const aggregateOptions = options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      votes: voteCountMap.get(opt.id) || 0,
      percentage: totalVotes > 0 ? Math.round(((voteCountMap.get(opt.id) || 0) / totalVotes) * 100) : 0,
    }))

    aggregateOptions.sort((a, b) => b.votes - a.votes)

    return {
      options: aggregateOptions,
      totalVotes,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DEMOGRAPHIC BREAKDOWN (using demographicSnapshot from responses)
  // ═══════════════════════════════════════════════════════════════════════════

  private async calculateDemographics(
    pollId: string,
    options: PollOption[]
  ): Promise<DemographicBreakdown[]> {
    const breakdowns: DemographicBreakdown[] = []

    const responses = await db
      .select({
        answers: pollResponses.answers,
        demographicSnapshot: pollResponses.demographicSnapshot,
      })
      .from(pollResponses)
      .where(and(eq(pollResponses.pollId, pollId), eq(pollResponses.isValid, true)))

    const ageBreakdown = this.calculateAgeBreakdownFromSnapshots(responses, options)
    if (ageBreakdown.segments.length > 0) {
      breakdowns.push(ageBreakdown)
    }

    const genderBreakdown = this.calculateGenderBreakdownFromSnapshots(responses, options)
    if (genderBreakdown.segments.length > 0) {
      breakdowns.push(genderBreakdown)
    }

    return breakdowns
  }

  private calculateAgeBreakdownFromSnapshots(
    responses: Array<{ answers: unknown; demographicSnapshot: unknown }>,
    options: PollOption[]
  ): DemographicBreakdown {
    const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+']
    const segments: DemographicSegment[] = []

    for (const range of ageRanges) {
      const rangeResponses = responses.filter((r) => {
        const snapshot = r.demographicSnapshot as DemographicSnapshot | null
        return snapshot?.ageRange === range
      })

      if (rangeResponses.length >= CONFIG.demographicMinSampleSize) {
        const voteCounts = new Map<string, number>()
        for (const r of rangeResponses) {
          const answers = r.answers as { optionId?: string }
          if (answers?.optionId) {
            voteCounts.set(answers.optionId, (voteCounts.get(answers.optionId) || 0) + 1)
          }
        }

        const distribution = options.map((opt) => ({
          optionId: opt.id,
          optionText: opt.text,
          percentage: Math.round(((voteCounts.get(opt.id) || 0) / rangeResponses.length) * 100),
          count: voteCounts.get(opt.id) || 0,
        }))

        distribution.sort((a, b) => b.percentage - a.percentage)

        segments.push({
          label: range,
          distribution,
          sampleSize: rangeResponses.length,
        })
      }
    }

    return { category: 'age', segments }
  }

  private calculateGenderBreakdownFromSnapshots(
    responses: Array<{ answers: unknown; demographicSnapshot: unknown }>,
    options: PollOption[]
  ): DemographicBreakdown {
    const genders = [
      { value: 'MALE', label: 'Male' },
      { value: 'FEMALE', label: 'Female' },
      { value: 'NON_BINARY', label: 'Non-binary' },
    ]
    const segments: DemographicSegment[] = []

    for (const { value, label } of genders) {
      const genderResponses = responses.filter((r) => {
        const snapshot = r.demographicSnapshot as DemographicSnapshot | null
        return snapshot?.gender === value
      })

      if (genderResponses.length >= CONFIG.demographicMinSampleSize) {
        const voteCounts = new Map<string, number>()
        for (const r of genderResponses) {
          const answers = r.answers as { optionId?: string }
          if (answers?.optionId) {
            voteCounts.set(answers.optionId, (voteCounts.get(answers.optionId) || 0) + 1)
          }
        }

        const distribution = options.map((opt) => ({
          optionId: opt.id,
          optionText: opt.text,
          percentage: Math.round(((voteCounts.get(opt.id) || 0) / genderResponses.length) * 100),
          count: voteCounts.get(opt.id) || 0,
        }))

        distribution.sort((a, b) => b.percentage - a.percentage)

        segments.push({
          label,
          distribution,
          sampleSize: genderResponses.length,
        })
      }
    }

    return { category: 'gender', segments }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONAL RESULT
  // ═══════════════════════════════════════════════════════════════════════════

  private async getPersonalResult(
    pollId: string,
    participantHash: string,
    aggregateChart: AggregateChartData
  ): Promise<PersonalResultData | undefined> {
    const [response] = await db
      .select({ answers: pollResponses.answers })
      .from(pollResponses)
      .where(
        and(eq(pollResponses.pollId, pollId), eq(pollResponses.participantHash, participantHash))
      )
      .limit(1)

    if (!response) return undefined

    const answers = response.answers as { optionId?: string }
    if (!answers?.optionId) return undefined

    const selectedOption = aggregateChart.options.find((o) => o.id === answers.optionId)
    if (!selectedOption) return undefined

    const rank = aggregateChart.options.findIndex((o) => o.id === answers.optionId) + 1 || 1

    const comparisonText = this.generateComparisonText(
      selectedOption.percentage,
      rank,
      aggregateChart.options.length
    )

    return {
      selectedOptionId: selectedOption.id,
      selectedOptionText: selectedOption.text,
      percentage: selectedOption.percentage,
      rank,
      totalVoters: aggregateChart.totalVotes,
      sameCohortCount: selectedOption.votes,
      comparisonText,
    }
  }

  private generateComparisonText(percentage: number, rank: number, totalOptions: number): string {
    if (rank === 1) {
      if (percentage >= 60) return "You're with the strong majority!"
      if (percentage >= 40) return "You're with the plurality!"
      return 'You picked the leading choice!'
    }
    if (rank === totalOptions) {
      return "You're in a select minority!"
    }
    if (percentage >= 30) {
      return "You're with a significant group!"
    }
    return 'You have a unique perspective!'
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPARISONS
  // ═══════════════════════════════════════════════════════════════════════════

  private generateComparisons(
    personalResult: PersonalResultData,
    demographics: DemographicBreakdown[]
  ): PulseComparison[] {
    const comparisons: PulseComparison[] = []

    comparisons.push({
      type: 'vs_average',
      userChoice: personalResult.selectedOptionText,
      comparisonGroup: 'all voters',
      userPercentage: personalResult.percentage,
      groupPercentage: personalResult.percentage,
      differenceText:
        personalResult.rank === 1
          ? 'Most popular choice overall'
          : `#${personalResult.rank} choice overall`,
    })

    for (const breakdown of demographics.slice(0, 2)) {
      const firstSegment = breakdown.segments[0]
      if (!firstSegment) continue

      const userOptionInSegment = firstSegment.distribution.find(
        (d) => d.optionId === personalResult.selectedOptionId
      )

      if (userOptionInSegment) {
        const diff = userOptionInSegment.percentage - personalResult.percentage
        let differenceText = ''
        if (Math.abs(diff) < 5) {
          differenceText = `Similar to ${firstSegment.label} group`
        } else if (diff > 0) {
          differenceText = `${diff}% more popular among ${firstSegment.label}`
        } else {
          differenceText = `${Math.abs(diff)}% less popular among ${firstSegment.label}`
        }

        comparisons.push({
          type: 'vs_demographic',
          userChoice: personalResult.selectedOptionText,
          comparisonGroup: `${firstSegment.label} (${breakdown.category})`,
          userPercentage: personalResult.percentage,
          groupPercentage: userOptionInSegment.percentage,
          differenceText,
        })
      }
    }

    return comparisons
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HIGHLIGHTS
  // ═══════════════════════════════════════════════════════════════════════════

  private generateHighlights(aggregateChart: AggregateChartData): PulseHighlight[] {
    const highlights: PulseHighlight[] = []

    if (aggregateChart.options.length === 0) return highlights

    const topOption = aggregateChart.options[0]
    const secondOption = aggregateChart.options[1]

    if (!topOption) return highlights

    if (topOption.percentage >= 70) {
      highlights.push({
        type: 'consensus',
        text: `Strong consensus: ${topOption.percentage}% chose "${topOption.text}"`,
        icon: 'check-circle',
      })
    } else if (secondOption && Math.abs(topOption.percentage - secondOption.percentage) <= 5) {
      highlights.push({
        type: 'divided',
        text: `Close race between "${topOption.text}" and "${secondOption.text}"`,
        icon: 'scale',
      })
    } else if (topOption.percentage < 30 && aggregateChart.options.length >= 4) {
      highlights.push({
        type: 'divided',
        text: 'Opinions are spread across many options',
        icon: 'pie-chart',
      })
    }

    if (aggregateChart.totalVotes >= 1000) {
      highlights.push({
        type: 'majority',
        text: `${aggregateChart.totalVotes.toLocaleString()} people have voted`,
        icon: 'users',
      })
    }

    return highlights
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SHARE CARD
  // ═══════════════════════════════════════════════════════════════════════════

  private generateShareCard(poll: Poll, aggregateChart: AggregateChartData): ShareCard {
    const topOption = aggregateChart.options[0]
    const description = topOption
      ? `${topOption.percentage}% voted for "${topOption.text}"`
      : 'See what others think!'

    return {
      imageUrl: null,
      title: poll.title,
      description,
      shareText: `I voted in "${poll.title}" on VoxPoll. ${description}`,
      pollUrl: `https://voxpoll.com/p/${poll.slug}`,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REAL-TIME UPDATES (SSE Support - Bible: P-056)
  // ═══════════════════════════════════════════════════════════════════════════

  async subscribeToUpdates(
    pollId: string
  ): Promise<{ channel: string; initialData: AggregateChartData }> {
    const channel = `pulse:updates:${pollId}`
    const [poll] = await db.select().from(polls).where(eq(polls.id, pollId)).limit(1)

    if (!poll) {
      throw new Error('Poll not found')
    }

    const options = poll.options as PollOption[]
    const initialData = await this.calculateAggregateChart(pollId, options)

    return { channel, initialData }
  }

  async broadcastUpdate(pollId: string): Promise<void> {
    const redis = getRedis()
    const channel = `pulse:updates:${pollId}`

    const [poll] = await db.select().from(polls).where(eq(polls.id, pollId)).limit(1)

    if (!poll) return

    const options = poll.options as PollOption[]
    const aggregateChart = await this.calculateAggregateChart(pollId, options)

    await redis.publish(
      channel,
      JSON.stringify({
        type: 'PULSE_UPDATE',
        data: aggregateChart,
        timestamp: Date.now(),
      })
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CACHE INVALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  async invalidateCache(pollId: string): Promise<void> {
    const cacheKey = `${CONFIG.cacheKeyPrefix}${pollId}`
    await cacheService.del(cacheKey)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const pulseService = new PulseServiceClass()
