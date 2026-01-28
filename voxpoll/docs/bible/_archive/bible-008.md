# ██████████████████████████████████████████████████████████████████████████████
# ██                                                                          ██
# ██  ███████╗███████╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗     ██████╗  █████╗   ██
# ██  ██╔════╝██╔════╝██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║    ██╔═████╗██╔══██╗  ██
# ██  ███████╗█████╗  ██║        ██║   ██║██║   ██║██╔██╗ ██║    ██║██╔██║╚█████╔╝  ██
# ██  ╚════██║██╔══╝  ██║        ██║   ██║██║   ██║██║╚██╗██║    ████╔╝██║██╔══██╗  ██
# ██  ███████║███████╗╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║    ╚██████╔╝╚█████╔╝  ██
# ██  ╚══════╝╚══════╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝     ╚═════╝  ╚════╝   ██
# ██                                                                          ██
# ██  ANALYTICS & REPORTING                                                   ██
# ██                                                                          ██
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 8.1 ANALYTICS OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

## 8.1.1 Analytics Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ANALYTICS ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA COLLECTION LAYER                           │   │
│  ├─────────────────┬─────────────────┬─────────────────┬──────────────────┤   │
│  │   Poll Votes    │ Survey Responses│   Test Results  │   User Events    │   │
│  └────────┬────────┴────────┬────────┴────────┬────────┴────────┬─────────┘   │
│           │                 │                 │                 │             │
│           ▼                 ▼                 ▼                 ▼             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         PROCESSING LAYER                                │   │
│  ├─────────────────┬─────────────────┬─────────────────┬──────────────────┤   │
│  │   Aggregation   │   Calculation   │   Enrichment    │   Anonymization  │   │
│  └────────┬────────┴────────┬────────┴────────┬────────┴────────┬─────────┘   │
│           │                 │                 │                 │             │
│           ▼                 ▼                 ▼                 ▼             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         STORAGE LAYER                                   │   │
│  ├─────────────────┬─────────────────┬─────────────────┬──────────────────┤   │
│  │   Raw Data      │   Aggregates    │   Time Series   │   Cached Stats   │   │
│  │   (PostgreSQL)  │   (PostgreSQL)  │   (TimescaleDB) │   (Redis)        │   │
│  └────────┬────────┴────────┬────────┴────────┬────────┴────────┬─────────┘   │
│           │                 │                 │                 │             │
│           ▼                 ▼                 ▼                 ▼             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         PRESENTATION LAYER                              │   │
│  ├─────────────────┬─────────────────┬─────────────────┬──────────────────┤   │
│  │   Dashboards    │   Reports       │   Exports       │   API            │   │
│  └─────────────────┴─────────────────┴─────────────────┴──────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 8.1.2 Analytics by Content Type

| Metric Category | Poll | Survey | Test |
|-----------------|------|--------|------|
| Response count | ✓ | ✓ | ✓ |
| Completion rate | - | ✓ | ✓ |
| Average time | - | ✓ | ✓ |
| Option distribution | ✓ | ✓ | - |
| Question analysis | - | ✓ | ✓ |
| Drop-off funnel | - | ✓ | ✓ |
| Result distribution | - | - | ✓ |
| Share tracking | - | - | ✓ |
| Demographics | ✓ | ✓ | ✓ |
| Device/Location | ✓ | ✓ | ✓ |


## 8.1.3 Real-time vs Batch Analytics

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ANALYTICS PROCESSING MODES
// ══════════════════════════════════════════════════════════════════════════════

type AnalyticsMode = "REAL_TIME" | "NEAR_REAL_TIME" | "BATCH"

interface AnalyticsConfig {
  mode: AnalyticsMode
  
  realTimeMetrics: string[]
  batchMetrics: string[]
  
  batchSchedule: string
  
  cacheTTLSeconds: number
  
  retentionDays: number
}

const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  mode: "NEAR_REAL_TIME",
  
  realTimeMetrics: [
    "totalResponses",
    "activeUsers",
    "optionCounts"
  ],
  
  batchMetrics: [
    "completionRate",
    "averageTime",
    "dropOffAnalysis",
    "demographicBreakdown",
    "crossTabulation"
  ],
  
  batchSchedule: "0 */15 * * * *",
  
  cacheTTLSeconds: 60,
  
  retentionDays: 365
}

const REAL_TIME_METRICS = [
  "response_count",
  "vote_count",
  "active_sessions",
  "option_distribution"
] as const

const BATCH_METRICS = [
  "completion_funnel",
  "demographic_analysis",
  "cross_tabulation",
  "trend_analysis",
  "sentiment_analysis"
] as const

export type { AnalyticsMode, AnalyticsConfig }
export { DEFAULT_ANALYTICS_CONFIG, REAL_TIME_METRICS, BATCH_METRICS }
```




# ══════════════════════════════════════════════════════════════════════════════
# 8.2 POLL ANALYTICS
# ══════════════════════════════════════════════════════════════════════════════

## 8.2.1 Poll Statistics

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// POLL ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

interface PollAnalytics {
  pollId: string
  
  totalVotes: number
  uniqueVoters: number
  
  optionStats: PollOptionStats[]
  
  votesOverTime: TimeSeriesData[]
  
  demographics: DemographicBreakdown
  
  deviceBreakdown: DeviceBreakdown
  
  geographicBreakdown: GeographicBreakdown
  
  trafficSources: TrafficSource[]
  
  lastUpdatedAt: Date
}

interface PollOptionStats {
  optionId: string
  optionText: string
  voteCount: number
  percentage: number
  isLeading: boolean
  trend: "UP" | "DOWN" | "STABLE"
  trendPercentage: number
}

interface TimeSeriesData {
  timestamp: Date
  value: number
  label: string | null
}

function calculatePollAnalytics(votes: PollVote[], options: PollOption[]): PollAnalytics {
  const totalVotes = votes.length
  const uniqueVoters = new Set(votes.map(v => v.sessionId)).size
  
  const optionCounts = new Map<string, number>()
  options.forEach(o => optionCounts.set(o.id, 0))
  votes.forEach(v => {
    const count = optionCounts.get(v.optionId) || 0
    optionCounts.set(v.optionId, count + 1)
  })
  
  let maxCount = 0
  optionCounts.forEach(count => {
    if (count > maxCount) maxCount = count
  })
  
  const optionStats: PollOptionStats[] = options.map(option => {
    const count = optionCounts.get(option.id) || 0
    return {
      optionId: option.id,
      optionText: option.text,
      voteCount: count,
      percentage: totalVotes > 0 ? (count / totalVotes) * 100 : 0,
      isLeading: count === maxCount && maxCount > 0,
      trend: "STABLE",
      trendPercentage: 0
    }
  })
  
  return {
    pollId: "",
    totalVotes,
    uniqueVoters,
    optionStats,
    votesOverTime: [],
    demographics: { age: [], gender: [], location: [] },
    deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
    geographicBreakdown: { countries: [], regions: [], cities: [] },
    trafficSources: [],
    lastUpdatedAt: new Date()
  }
}

interface PollVote {
  id: string
  optionId: string
  sessionId: string

  // Additional fields for analytics - aligned with Drizzle schema
  userId: string | null            // null for anonymous votes
  participantHash: string          // For duplicate detection
  createdAt: Date                  // Vote timestamp (for votesOverTime)

  // Device & location data for fraud detection and geo analytics
  deviceFingerprint: string | null // Hashed device identifier
  deviceType: 'MOBILE' | 'TABLET' | 'DESKTOP' | 'UNKNOWN'
  ipAddress: string | null         // For rate limiting (not stored long-term)

  // Geographic data
  geoData: {
    countryCode: string | null     // ISO 3166-1 alpha-2
    regionCode: string | null      // ISO 3166-2 (e.g., "TR-34" for Istanbul)
    city: string | null
    timezone: string | null
  } | null

  // Quality signals
  qualityScore: number | null      // 0-100, from quality scoring system
  isValid: boolean                 // false if flagged as fraudulent
}

interface PollOption {
  id: string
  text: string
  imageUrl: string | null          // For visual polls
  position: number                 // Display order
  colorHex: string | null          // Brand color for charts
}

export type { PollAnalytics, PollOptionStats, TimeSeriesData }
export { calculatePollAnalytics }
```


## 8.2.2 Real-time Vote Tracking

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// REAL-TIME VOTE TRACKING
// ══════════════════════════════════════════════════════════════════════════════

interface RealTimeVoteUpdate {
  pollId: string
  timestamp: Date
  type: "VOTE_ADDED" | "VOTE_CHANGED" | "VOTE_REMOVED"
  optionId: string
  previousOptionId: string | null
  newTotals: Record<string, number>
}

interface LivePollState {
  pollId: string
  isActive: boolean
  totalVotes: number
  options: LiveOptionState[]
  lastVoteAt: Date | null
  votesPerMinute: number
}

interface LiveOptionState {
  optionId: string
  text: string
  votes: number
  percentage: number
  recentVotes: number
}

function calculateVotesPerMinute(
  votes: { createdAt: Date }[],
  windowMinutes: number = 5
): number {
  const now = Date.now()
  const windowStart = now - (windowMinutes * 60 * 1000)
  
  const recentVotes = votes.filter(
    v => v.createdAt.getTime() >= windowStart
  ).length
  
  return recentVotes / windowMinutes
}

function buildLivePollState(
  pollId: string,
  options: PollOption[],
  votes: (PollVote & { createdAt: Date })[]
): LivePollState {
  const totalVotes = votes.length
  
  const optionVotes = new Map<string, number>()
  const recentWindow = Date.now() - (60 * 1000)
  const recentVotesByOption = new Map<string, number>()
  
  options.forEach(o => {
    optionVotes.set(o.id, 0)
    recentVotesByOption.set(o.id, 0)
  })
  
  votes.forEach(v => {
    const count = optionVotes.get(v.optionId) || 0
    optionVotes.set(v.optionId, count + 1)
    
    if (v.createdAt.getTime() >= recentWindow) {
      const recent = recentVotesByOption.get(v.optionId) || 0
      recentVotesByOption.set(v.optionId, recent + 1)
    }
  })
  
  const liveOptions: LiveOptionState[] = options.map(o => ({
    optionId: o.id,
    text: o.text,
    votes: optionVotes.get(o.id) || 0,
    percentage: totalVotes > 0 
      ? ((optionVotes.get(o.id) || 0) / totalVotes) * 100 
      : 0,
    recentVotes: recentVotesByOption.get(o.id) || 0
  }))
  
  const lastVote = votes.length > 0 
    ? votes.reduce((a, b) => a.createdAt > b.createdAt ? a : b)
    : null
  
  return {
    pollId,
    isActive: true,
    totalVotes,
    options: liveOptions,
    lastVoteAt: lastVote?.createdAt || null,
    votesPerMinute: calculateVotesPerMinute(votes)
  }
}

export type { RealTimeVoteUpdate, LivePollState, LiveOptionState }
export { calculateVotesPerMinute, buildLivePollState }
```




# ══════════════════════════════════════════════════════════════════════════════
# 8.3 SURVEY ANALYTICS
# ══════════════════════════════════════════════════════════════════════════════

## 8.3.1 Survey Statistics

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SURVEY ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

interface SurveyAnalytics {
  surveyId: string
  
  totalResponses: number
  completedResponses: number
  inProgressResponses: number
  abandonedResponses: number
  disqualifiedResponses: number
  
  completionRate: number
  averageCompletionTimeSeconds: number
  medianCompletionTimeSeconds: number
  
  responsesByStatus: Record<string, number>
  
  questionAnalytics: QuestionAnalytics[]
  
  pageAnalytics: PageAnalytics[]
  
  completionFunnel: FunnelStep[]
  
  responsesOverTime: TimeSeriesData[]
  
  demographics: DemographicBreakdown
  
  lastUpdatedAt: Date
}

interface QuestionAnalytics {
  questionId: string
  questionText: string
  questionType: string
  
  totalAnswers: number
  skipCount: number
  skipRate: number
  
  averageTimeSeconds: number
  
  answerDistribution: AnswerDistribution[] | null
  
  textResponses: TextResponseSummary | null
  
  numericStats: NumericStats | null
}

interface AnswerDistribution {
  value: string
  label: string
  count: number
  percentage: number
}

interface TextResponseSummary {
  totalResponses: number
  averageLength: number
  wordCloud: WordCloudItem[]
  commonPhrases: string[]
}

interface WordCloudItem {
  word: string
  count: number
  weight: number
}

interface NumericStats {
  min: number
  max: number
  mean: number
  median: number
  mode: number
  standardDeviation: number
  distribution: { range: string, count: number }[]
}

interface PageAnalytics {
  pageIndex: number
  pageTitle: string | null
  
  viewCount: number
  completionCount: number
  dropOffCount: number
  dropOffRate: number
  
  averageTimeSeconds: number
  
  questionsOnPage: number
}

interface FunnelStep {
  stepName: string
  stepIndex: number
  count: number
  percentage: number
  dropOffCount: number
  dropOffRate: number
}

export type { 
  SurveyAnalytics, 
  QuestionAnalytics, 
  AnswerDistribution, 
  TextResponseSummary,
  NumericStats,
  PageAnalytics,
  FunnelStep
}
```


## 8.3.2 Question-Level Analysis

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// QUESTION-LEVEL ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════

function analyzeChoiceQuestion(
  answers: { value: string | string[] }[],
  options: { id: string, text: string }[]
): AnswerDistribution[] {
  const counts = new Map<string, number>()
  options.forEach(o => counts.set(o.id, 0))
  
  let totalSelections = 0
  
  answers.forEach(answer => {
    const values = Array.isArray(answer.value) ? answer.value : [answer.value]
    values.forEach(v => {
      const current = counts.get(v) || 0
      counts.set(v, current + 1)
      totalSelections++
    })
  })
  
  return options.map(option => ({
    value: option.id,
    label: option.text,
    count: counts.get(option.id) || 0,
    percentage: totalSelections > 0 
      ? ((counts.get(option.id) || 0) / totalSelections) * 100 
      : 0
  }))
}

function analyzeNumericQuestion(
  answers: { value: number }[]
): NumericStats {
  if (answers.length === 0) {
    return {
      min: 0, max: 0, mean: 0, median: 0, mode: 0,
      standardDeviation: 0, distribution: []
    }
  }
  
  const values = answers.map(a => a.value).sort((a, b) => a - b)
  const n = values.length
  
  const min = values[0]
  const max = values[n - 1]
  const sum = values.reduce((a, b) => a + b, 0)
  const mean = sum / n
  
  const median = n % 2 === 0
    ? (values[n / 2 - 1] + values[n / 2]) / 2
    : values[Math.floor(n / 2)]
  
  const frequency = new Map<number, number>()
  values.forEach(v => {
    frequency.set(v, (frequency.get(v) || 0) + 1)
  })
  
  let mode = values[0]
  let maxFreq = 0
  frequency.forEach((freq, val) => {
    if (freq > maxFreq) {
      maxFreq = freq
      mode = val
    }
  })
  
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / n
  const standardDeviation = Math.sqrt(avgSquaredDiff)
  
  const range = max - min
  const bucketSize = range > 0 ? range / 10 : 1
  const distribution: { range: string, count: number }[] = []
  
  for (let i = 0; i < 10; i++) {
    const bucketMin = min + (i * bucketSize)
    const bucketMax = min + ((i + 1) * bucketSize)
    const count = values.filter(v => v >= bucketMin && (i === 9 ? v <= bucketMax : v < bucketMax)).length
    distribution.push({
      range: `${bucketMin.toFixed(1)}-${bucketMax.toFixed(1)}`,
      count
    })
  }
  
  return { min, max, mean, median, mode, standardDeviation, distribution }
}

function analyzeTextQuestion(
  answers: { value: string }[]
): TextResponseSummary {
  const totalResponses = answers.length
  
  const lengths = answers.map(a => a.value.length)
  const averageLength = lengths.length > 0 
    ? lengths.reduce((a, b) => a + b, 0) / lengths.length 
    : 0
  
  const wordCounts = new Map<string, number>()
  // Turkish + English stop words
  const stopWords = new Set([
    // English
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "it", "this", "that",
    // Turkish
    "bir", "ve", "ile", "için", "bu", "da", "de", "mi", "mı", "mu", "mü", "gibi", "daha", "en", "çok", "var", "yok", "olan", "olarak", "ama", "ancak", "fakat", "kadar", "sonra", "önce", "üzere", "ile", "dolayı", "göre", "içinde", "üzerinde", "altında", "arasında"
  ])

  answers.forEach(answer => {
    const words = answer.value.toLowerCase()
      .replace(/[^a-zğüşıöçİĞÜŞÖÇ\s]/gi, "")
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
    
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
    })
  })
  
  const sortedWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
  
  const maxCount = sortedWords.length > 0 ? sortedWords[0][1] : 1
  
  const wordCloud: WordCloudItem[] = sortedWords.map(([word, count]) => ({
    word,
    count,
    weight: count / maxCount
  }))

  // Extract common phrases (bigrams and trigrams)
  const commonPhrases = extractCommonPhrases(answers.map(a => a.value), stopWords)

  return {
    totalResponses,
    averageLength,
    wordCloud,
    commonPhrases
  }
}

/**
 * Extract common phrases (n-grams) from text responses
 * Uses bigrams and trigrams to find recurring multi-word expressions
 */
function extractCommonPhrases(
  texts: string[],
  stopWords: Set<string>,
  minOccurrences: number = 3,
  maxPhrases: number = 10
): string[] {
  const bigramCounts = new Map<string, number>()
  const trigramCounts = new Map<string, number>()

  texts.forEach(text => {
    const words = text.toLowerCase()
      .replace(/[^a-zğüşıöç\s]/gi, "")
      .split(/\s+/)
      .filter(w => w.length > 1)

    // Extract bigrams (2-word phrases)
    for (let i = 0; i < words.length - 1; i++) {
      // At least one word should not be a stop word
      if (!stopWords.has(words[i]) || !stopWords.has(words[i + 1])) {
        const bigram = `${words[i]} ${words[i + 1]}`
        bigramCounts.set(bigram, (bigramCounts.get(bigram) || 0) + 1)
      }
    }

    // Extract trigrams (3-word phrases)
    for (let i = 0; i < words.length - 2; i++) {
      // At least two words should not be stop words
      const nonStopCount = [words[i], words[i + 1], words[i + 2]]
        .filter(w => !stopWords.has(w)).length
      if (nonStopCount >= 2) {
        const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
        trigramCounts.set(trigram, (trigramCounts.get(trigram) || 0) + 1)
      }
    }
  })

  // Combine and sort by frequency
  const allPhrases: Array<{ phrase: string; count: number; length: number }> = []

  bigramCounts.forEach((count, phrase) => {
    if (count >= minOccurrences) {
      allPhrases.push({ phrase, count, length: 2 })
    }
  })

  trigramCounts.forEach((count, phrase) => {
    if (count >= minOccurrences) {
      allPhrases.push({ phrase, count, length: 3 })
    }
  })

  // Sort by count (descending), then by length (prefer longer phrases)
  allPhrases.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return b.length - a.length
  })

  // Remove phrases that are substrings of higher-ranked phrases
  const result: string[] = []
  for (const item of allPhrases) {
    const isSubstring = result.some(existing => existing.includes(item.phrase))
    if (!isSubstring && result.length < maxPhrases) {
      result.push(item.phrase)
    }
  }

  return result
}

export { analyzeChoiceQuestion, analyzeNumericQuestion, analyzeTextQuestion }
```


## 8.3.3 Cross-Tabulation

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CROSS-TABULATION ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════

interface CrossTabulation {
  rowQuestionId: string
  columnQuestionId: string
  rowLabel: string
  columnLabel: string
  
  rows: CrossTabRow[]
  totals: CrossTabTotals
  
  chiSquare: number | null
  pValue: number | null
  cramersV: number | null
}

interface CrossTabRow {
  rowValue: string
  rowLabel: string
  cells: CrossTabCell[]
  rowTotal: number
  rowPercentage: number
}

interface CrossTabCell {
  columnValue: string
  count: number
  rowPercentage: number
  columnPercentage: number
  totalPercentage: number
  expected: number
  residual: number
}

interface CrossTabTotals {
  columnTotals: { columnValue: string, count: number, percentage: number }[]
  grandTotal: number
}

function buildCrossTabulation(
  responses: { rowValue: string, columnValue: string }[],
  rowOptions: { value: string, label: string }[],
  columnOptions: { value: string, label: string }[]
): CrossTabulation {
  const grandTotal = responses.length
  
  const counts = new Map<string, Map<string, number>>()
  rowOptions.forEach(r => {
    const colMap = new Map<string, number>()
    columnOptions.forEach(c => colMap.set(c.value, 0))
    counts.set(r.value, colMap)
  })
  
  responses.forEach(r => {
    const rowMap = counts.get(r.rowValue)
    if (rowMap) {
      const current = rowMap.get(r.columnValue) || 0
      rowMap.set(r.columnValue, current + 1)
    }
  })
  
  const rowTotals = new Map<string, number>()
  const columnTotals = new Map<string, number>()
  
  columnOptions.forEach(c => columnTotals.set(c.value, 0))
  
  rowOptions.forEach(r => {
    let rowSum = 0
    const rowMap = counts.get(r.value)!
    columnOptions.forEach(c => {
      const count = rowMap.get(c.value) || 0
      rowSum += count
      columnTotals.set(c.value, (columnTotals.get(c.value) || 0) + count)
    })
    rowTotals.set(r.value, rowSum)
  })
  
  const rows: CrossTabRow[] = rowOptions.map(r => {
    const rowTotal = rowTotals.get(r.value) || 0
    const rowMap = counts.get(r.value)!
    
    const cells: CrossTabCell[] = columnOptions.map(c => {
      const count = rowMap.get(c.value) || 0
      const colTotal = columnTotals.get(c.value) || 0
      const expected = grandTotal > 0 ? (rowTotal * colTotal) / grandTotal : 0
      
      return {
        columnValue: c.value,
        count,
        rowPercentage: rowTotal > 0 ? (count / rowTotal) * 100 : 0,
        columnPercentage: colTotal > 0 ? (count / colTotal) * 100 : 0,
        totalPercentage: grandTotal > 0 ? (count / grandTotal) * 100 : 0,
        expected,
        residual: count - expected
      }
    })
    
    return {
      rowValue: r.value,
      rowLabel: r.label,
      cells,
      rowTotal,
      rowPercentage: grandTotal > 0 ? (rowTotal / grandTotal) * 100 : 0
    }
  })
  
  const columnTotalsArray = columnOptions.map(c => ({
    columnValue: c.value,
    count: columnTotals.get(c.value) || 0,
    percentage: grandTotal > 0 ? ((columnTotals.get(c.value) || 0) / grandTotal) * 100 : 0
  }))
  
  return {
    rowQuestionId: "",
    columnQuestionId: "",
    rowLabel: "",
    columnLabel: "",
    rows,
    totals: {
      columnTotals: columnTotalsArray,
      grandTotal
    },
    chiSquare: calculateChiSquare(rows, columnTotalsArray, grandTotal),
    pValue: null, // Set after chiSquare calculation
    cramersV: null // Set after chiSquare calculation
  }

  // Calculate statistical significance
  const stats = crossTab
  if (stats.chiSquare !== null) {
    const df = (rows.length - 1) * (columnTotalsArray.length - 1)
    stats.pValue = chiSquarePValue(stats.chiSquare, df)
    stats.cramersV = calculateCramersV(stats.chiSquare, grandTotal, rows.length, columnTotalsArray.length)
  }

  return stats
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICAL SIGNIFICANCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Chi-Square Test statistic
function calculateChiSquare(
  rows: CrossTabRow[],
  columnTotals: number[],
  grandTotal: number
): number | null {
  if (grandTotal === 0) return null

  let chiSquare = 0
  const rowTotals = rows.map(r => r.cells.reduce((sum, c) => sum + c.count, 0))

  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < columnTotals.length; j++) {
      const observed = rows[i].cells[j].count
      const expected = (rowTotals[i] * columnTotals[j]) / grandTotal

      if (expected > 0) {
        chiSquare += Math.pow(observed - expected, 2) / expected
      }
    }
  }

  return chiSquare
}

// Chi-Square p-value using gamma function approximation
function chiSquarePValue(chiSquare: number, df: number): number {
  if (df <= 0 || chiSquare < 0) return 1

  // Regularized incomplete gamma function approximation
  // Using series expansion for small x and continued fraction for large x
  const a = df / 2
  const x = chiSquare / 2

  if (x < a + 1) {
    // Series expansion
    let sum = 0, term = 1 / a
    sum = term
    for (let n = 1; n < 100; n++) {
      term *= x / (a + n)
      sum += term
      if (Math.abs(term) < 1e-10) break
    }
    const lnGamma = gammaLn(a)
    return 1 - sum * Math.exp(-x + a * Math.log(x) - lnGamma)
  } else {
    // Continued fraction (Lentz's algorithm)
    let f = 1, c = 1, d = 1 / (x - a + 1)
    f = d
    for (let n = 1; n < 100; n++) {
      const an = -n * (n - a)
      const bn = x - a + 2 * n + 1
      d = 1 / (bn + an * d)
      c = bn + an / c
      const delta = c * d
      f *= delta
      if (Math.abs(delta - 1) < 1e-10) break
    }
    const lnGamma = gammaLn(a)
    return f * Math.exp(-x + a * Math.log(x) - lnGamma)
  }
}

// Cramér's V - effect size measure for chi-square
function calculateCramersV(
  chiSquare: number,
  n: number,
  numRows: number,
  numCols: number
): number | null {
  if (n === 0) return null
  const minDim = Math.min(numRows - 1, numCols - 1)
  if (minDim === 0) return null
  return Math.sqrt(chiSquare / (n * minDim))
}

// Log-gamma function (shared with bible-020)
function gammaLn(x: number): number {
  const g = 7
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916059059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ]

  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - gammaLn(1 - x)
  }

  x -= 1
  let a = c[0]
  for (let i = 1; i < g + 2; i++) {
    a += c[i] / (x + i)
  }
  const t = x + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}

export type { CrossTabulation, CrossTabRow, CrossTabCell, CrossTabTotals }
export { buildCrossTabulation, calculateChiSquare, chiSquarePValue, calculateCramersV }
```




# ══════════════════════════════════════════════════════════════════════════════
# 8.4 TEST ANALYTICS
# ══════════════════════════════════════════════════════════════════════════════

## 8.4.1 Test Result Statistics

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TEST ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

interface TestAnalytics {
  testId: string
  
  totalCompletions: number
  uniqueParticipants: number
  
  averageCompletionTimeSeconds: number
  medianCompletionTimeSeconds: number
  
  resultDistribution: ResultDistribution[]
  
  scoreDistribution: ScoreDistribution
  
  questionAnalytics: TestQuestionAnalytics[]
  
  shareStats: ShareStats
  
  viralCoefficient: number
  
  completionsOverTime: TimeSeriesData[]
  
  demographics: DemographicBreakdown
  
  lastUpdatedAt: Date
}

interface ResultDistribution {
  categoryId: string
  categoryName: string
  categoryColor: string
  count: number
  percentage: number
  averageScore: number
}

interface ScoreDistribution {
  min: number
  max: number
  mean: number
  median: number
  standardDeviation: number
  buckets: { range: string, count: number, percentage: number }[]
}

interface TestQuestionAnalytics {
  questionId: string
  questionText: string
  
  optionDistribution: {
    optionId: string
    optionText: string
    count: number
    percentage: number
    averageCategoryScores: Record<string, number>
  }[]
  
  discriminationIndex: number
  difficultyIndex: number
}

interface ShareStats {
  totalShares: number
  shareRate: number
  sharesByPlatform: Record<string, number>
  conversionsFromShares: number
  conversionRate: number
}

function calculateViralCoefficient(
  totalCompletions: number,
  totalShares: number,
  conversionsFromShares: number
): number {
  if (totalCompletions === 0 || totalShares === 0) return 0
  
  const shareRate = totalShares / totalCompletions
  const conversionRate = conversionsFromShares / totalShares
  
  return shareRate * conversionRate
}

function analyzeResultDistribution(
  results: { categoryId: string, totalScore: number }[],
  categories: { id: string, name: string, color: string }[]
): ResultDistribution[] {
  const total = results.length
  
  const categoryCounts = new Map<string, { count: number, scores: number[] }>()
  categories.forEach(c => categoryCounts.set(c.id, { count: 0, scores: [] }))
  
  results.forEach(r => {
    const data = categoryCounts.get(r.categoryId)
    if (data) {
      data.count++
      data.scores.push(r.totalScore)
    }
  })
  
  return categories.map(cat => {
    const data = categoryCounts.get(cat.id) || { count: 0, scores: [] }
    const avgScore = data.scores.length > 0
      ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      : 0
    
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color,
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      averageScore: avgScore
    }
  })
}

// ══════════════════════════════════════════════════════════════════════════════
// DISCRIMINATION & DIFFICULTY INDEX CALCULATIONS
// ══════════════════════════════════════════════════════════════════════════════
// Item Analysis metrics from Classical Test Theory (CTT)
// Used to evaluate question quality in Quiz Tests
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Difficulty Index (p)
 * Measures how easy/hard a question is.
 * Range: 0.0 (nobody answered correctly) to 1.0 (everybody answered correctly)
 * Ideal range: 0.3 - 0.7 for good discrimination
 *
 * Formula: p = (number of correct answers) / (total attempts)
 */
function calculateDifficultyIndex(
  correctCount: number,
  totalAttempts: number
): number {
  if (totalAttempts === 0) return 0
  return correctCount / totalAttempts
}

/**
 * Discrimination Index (D)
 * Measures how well a question differentiates between high and low performers.
 * Range: -1.0 to +1.0
 *   > 0.40: Excellent discrimination
 *   0.30-0.39: Good discrimination
 *   0.20-0.29: Acceptable, consider revision
 *   < 0.20: Poor, needs revision or removal
 *   Negative: Question favors low performers - likely flawed
 *
 * Method: Split participants into upper and lower 27% groups by total score
 * Formula: D = (upper group correct %) - (lower group correct %)
 */
function calculateDiscriminationIndex(
  questionResponses: Array<{
    isCorrect: boolean
    participantTotalScore: number
  }>
): number {
  if (questionResponses.length < 10) {
    // Not enough data for meaningful discrimination
    return 0
  }

  // Sort by total score descending
  const sorted = [...questionResponses].sort(
    (a, b) => b.participantTotalScore - a.participantTotalScore
  )

  // Take upper and lower 27% (standard in CTT)
  const groupSize = Math.ceil(questionResponses.length * 0.27)

  const upperGroup = sorted.slice(0, groupSize)
  const lowerGroup = sorted.slice(-groupSize)

  const upperCorrect = upperGroup.filter(r => r.isCorrect).length / groupSize
  const lowerCorrect = lowerGroup.filter(r => r.isCorrect).length / groupSize

  return upperCorrect - lowerCorrect
}

/**
 * Point-Biserial Correlation (rpb)
 * Alternative discrimination measure - correlation between item score and total score
 * Range: -1.0 to +1.0
 * Interpretation same as discrimination index
 *
 * Formula: rpb = (M_p - M_q) / S_t * sqrt(p * q)
 * Where:
 *   M_p = mean total score of participants who answered correctly
 *   M_q = mean total score of participants who answered incorrectly
 *   S_t = standard deviation of total scores
 *   p = proportion answering correctly
 *   q = 1 - p
 */
function calculatePointBiserialCorrelation(
  questionResponses: Array<{
    isCorrect: boolean
    participantTotalScore: number
  }>
): number {
  if (questionResponses.length < 10) return 0

  const correct = questionResponses.filter(r => r.isCorrect)
  const incorrect = questionResponses.filter(r => !r.isCorrect)

  if (correct.length === 0 || incorrect.length === 0) return 0

  const meanCorrect = correct.reduce((sum, r) => sum + r.participantTotalScore, 0) / correct.length
  const meanIncorrect = incorrect.reduce((sum, r) => sum + r.participantTotalScore, 0) / incorrect.length

  const allScores = questionResponses.map(r => r.participantTotalScore)
  const mean = allScores.reduce((sum, s) => sum + s, 0) / allScores.length
  const variance = allScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / allScores.length
  const stdDev = Math.sqrt(variance)

  if (stdDev === 0) return 0

  const p = correct.length / questionResponses.length
  const q = 1 - p

  return ((meanCorrect - meanIncorrect) / stdDev) * Math.sqrt(p * q)
}

/**
 * Distractor Analysis
 * Evaluates the effectiveness of wrong answer options.
 * Good distractors should attract low performers more than high performers.
 */
interface DistractorAnalysis {
  optionId: string
  optionText: string
  selectedCount: number
  selectedPercentage: number
  upperGroupPercentage: number  // % of top performers who selected this
  lowerGroupPercentage: number  // % of bottom performers who selected this
  effectiveness: 'EFFECTIVE' | 'NEUTRAL' | 'INEFFECTIVE' | 'CORRECT'
}

function analyzeDistractors(
  questionResponses: Array<{
    selectedOptionId: string
    correctOptionId: string
    participantTotalScore: number
  }>,
  options: Array<{ id: string; text: string }>
): DistractorAnalysis[] {
  if (questionResponses.length < 10) {
    return options.map(opt => ({
      optionId: opt.id,
      optionText: opt.text,
      selectedCount: 0,
      selectedPercentage: 0,
      upperGroupPercentage: 0,
      lowerGroupPercentage: 0,
      effectiveness: 'NEUTRAL' as const
    }))
  }

  // Sort by total score and split into groups
  const sorted = [...questionResponses].sort(
    (a, b) => b.participantTotalScore - a.participantTotalScore
  )
  const groupSize = Math.ceil(questionResponses.length * 0.27)
  const upperGroup = sorted.slice(0, groupSize)
  const lowerGroup = sorted.slice(-groupSize)

  return options.map(opt => {
    const selectedCount = questionResponses.filter(r => r.selectedOptionId === opt.id).length
    const upperSelected = upperGroup.filter(r => r.selectedOptionId === opt.id).length
    const lowerSelected = lowerGroup.filter(r => r.selectedOptionId === opt.id).length

    const isCorrect = questionResponses[0]?.correctOptionId === opt.id

    // Calculate effectiveness
    let effectiveness: DistractorAnalysis['effectiveness']
    if (isCorrect) {
      effectiveness = 'CORRECT'
    } else {
      const upperPct = upperSelected / groupSize
      const lowerPct = lowerSelected / groupSize

      if (lowerPct > upperPct * 1.5) {
        // Low performers select it more - good distractor
        effectiveness = 'EFFECTIVE'
      } else if (upperPct > lowerPct * 1.5) {
        // High performers select it more - problematic
        effectiveness = 'INEFFECTIVE'
      } else {
        effectiveness = 'NEUTRAL'
      }
    }

    return {
      optionId: opt.id,
      optionText: opt.text,
      selectedCount,
      selectedPercentage: (selectedCount / questionResponses.length) * 100,
      upperGroupPercentage: (upperSelected / groupSize) * 100,
      lowerGroupPercentage: (lowerSelected / groupSize) * 100,
      effectiveness
    }
  })
}

/**
 * Question Quality Assessment
 * Combines metrics to provide actionable recommendations
 */
interface QuestionQualityAssessment {
  questionId: string
  difficulty: number
  difficultyLabel: 'TOO_EASY' | 'EASY' | 'MODERATE' | 'HARD' | 'TOO_HARD'
  discrimination: number
  discriminationLabel: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'NEGATIVE'
  pointBiserial: number
  distractorAnalysis: DistractorAnalysis[]
  recommendation: string
  needsReview: boolean
}

function assessQuestionQuality(
  questionId: string,
  responses: Array<{
    isCorrect: boolean
    selectedOptionId: string
    correctOptionId: string
    participantTotalScore: number
  }>,
  options: Array<{ id: string; text: string }>
): QuestionQualityAssessment {
  const correctCount = responses.filter(r => r.isCorrect).length
  const difficulty = calculateDifficultyIndex(correctCount, responses.length)
  const discrimination = calculateDiscriminationIndex(responses)
  const pointBiserial = calculatePointBiserialCorrelation(responses)
  const distractorAnalysis = analyzeDistractors(responses, options)

  // Categorize difficulty
  let difficultyLabel: QuestionQualityAssessment['difficultyLabel']
  if (difficulty > 0.9) difficultyLabel = 'TOO_EASY'
  else if (difficulty > 0.7) difficultyLabel = 'EASY'
  else if (difficulty >= 0.3) difficultyLabel = 'MODERATE'
  else if (difficulty >= 0.1) difficultyLabel = 'HARD'
  else difficultyLabel = 'TOO_HARD'

  // Categorize discrimination
  let discriminationLabel: QuestionQualityAssessment['discriminationLabel']
  if (discrimination < 0) discriminationLabel = 'NEGATIVE'
  else if (discrimination < 0.2) discriminationLabel = 'POOR'
  else if (discrimination < 0.3) discriminationLabel = 'ACCEPTABLE'
  else if (discrimination < 0.4) discriminationLabel = 'GOOD'
  else discriminationLabel = 'EXCELLENT'

  // Generate recommendation
  const issues: string[] = []

  if (difficultyLabel === 'TOO_EASY') {
    issues.push('Soru çok kolay, zorluğu artırın')
  } else if (difficultyLabel === 'TOO_HARD') {
    issues.push('Soru çok zor, basitleştirin veya ipucu ekleyin')
  }

  if (discriminationLabel === 'NEGATIVE') {
    issues.push('KRİTİK: Soru düşük performanslıları ödüllendiriyor - soruyu gözden geçirin')
  } else if (discriminationLabel === 'POOR') {
    issues.push('Soru iyi ayırt edemiyor - revize edin veya kaldırın')
  }

  const ineffectiveDistractors = distractorAnalysis.filter(d => d.effectiveness === 'INEFFECTIVE')
  if (ineffectiveDistractors.length > 0) {
    issues.push(`Şu seçenekler etkisiz: ${ineffectiveDistractors.map(d => d.optionText).join(', ')}`)
  }

  const recommendation = issues.length > 0
    ? issues.join('. ')
    : 'Soru kaliteli, değişiklik gerekmiyor.'

  return {
    questionId,
    difficulty,
    difficultyLabel,
    discrimination,
    discriminationLabel,
    pointBiserial,
    distractorAnalysis,
    recommendation,
    needsReview: discriminationLabel === 'NEGATIVE' ||
                 discriminationLabel === 'POOR' ||
                 difficultyLabel === 'TOO_EASY' ||
                 difficultyLabel === 'TOO_HARD'
  }
}

export type {
  TestAnalytics,
  ResultDistribution,
  ScoreDistribution,
  TestQuestionAnalytics,
  ShareStats,
  DistractorAnalysis,
  QuestionQualityAssessment
}
export {
  calculateViralCoefficient,
  analyzeResultDistribution,
  calculateDifficultyIndex,
  calculateDiscriminationIndex,
  calculatePointBiserialCorrelation,
  analyzeDistractors,
  assessQuestionQuality
}
```


## 8.4.2 Share & Viral Tracking

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SHARE & VIRAL TRACKING
// ══════════════════════════════════════════════════════════════════════════════

interface ShareEvent {
  id: string
  testResultId: string
  platform: SharePlatform
  sharedAt: Date
  
  referralCode: string
  
  clickCount: number
  conversionCount: number
}

type SharePlatform = "TWITTER" | "FACEBOOK" | "LINKEDIN" | "WHATSAPP" | "COPY_LINK" | "OTHER"

interface ViralFunnel {
  completions: number
  shares: number
  shareRate: number
  clicks: number
  clickThroughRate: number
  conversions: number
  conversionRate: number
  viralCoefficient: number
}

interface PlatformPerformance {
  platform: SharePlatform
  shares: number
  clicks: number
  conversions: number
  clickThroughRate: number
  conversionRate: number
}

function buildViralFunnel(
  completions: number,
  shares: ShareEvent[]
): ViralFunnel {
  const totalShares = shares.length
  const totalClicks = shares.reduce((sum, s) => sum + s.clickCount, 0)
  const totalConversions = shares.reduce((sum, s) => sum + s.conversionCount, 0)
  
  const shareRate = completions > 0 ? totalShares / completions : 0
  const clickThroughRate = totalShares > 0 ? totalClicks / totalShares : 0
  const conversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0
  
  return {
    completions,
    shares: totalShares,
    shareRate,
    clicks: totalClicks,
    clickThroughRate,
    conversions: totalConversions,
    conversionRate,
    viralCoefficient: shareRate * clickThroughRate * conversionRate
  }
}

function analyzePlatformPerformance(
  shares: ShareEvent[]
): PlatformPerformance[] {
  const platforms: SharePlatform[] = ["TWITTER", "FACEBOOK", "LINKEDIN", "WHATSAPP", "COPY_LINK", "OTHER"]
  
  return platforms.map(platform => {
    const platformShares = shares.filter(s => s.platform === platform)
    const shareCount = platformShares.length
    const clicks = platformShares.reduce((sum, s) => sum + s.clickCount, 0)
    const conversions = platformShares.reduce((sum, s) => sum + s.conversionCount, 0)
    
    return {
      platform,
      shares: shareCount,
      clicks,
      conversions,
      clickThroughRate: shareCount > 0 ? clicks / shareCount : 0,
      conversionRate: clicks > 0 ? conversions / clicks : 0
    }
  }).filter(p => p.shares > 0)
}

export type { ShareEvent, SharePlatform, ViralFunnel, PlatformPerformance }
export { buildViralFunnel, analyzePlatformPerformance }
```




# ══════════════════════════════════════════════════════════════════════════════
# 8.5 DEMOGRAPHIC & DEVICE ANALYTICS
# ══════════════════════════════════════════════════════════════════════════════

## 8.5.1 Demographic Breakdown

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DEMOGRAPHIC ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

interface DemographicBreakdown {
  age: AgeGroup[]
  gender: GenderGroup[]
  location: LocationGroup[]
}

interface AgeGroup {
  range: string
  count: number
  percentage: number
}

interface GenderGroup {
  gender: string
  count: number
  percentage: number
}

interface LocationGroup {
  country: string
  countryCode: string
  count: number
  percentage: number
  regions: { region: string, count: number, percentage: number }[]
}

const AGE_RANGES = [
  { min: 0, max: 17, label: "Under 18" },
  { min: 18, max: 24, label: "18-24" },
  { min: 25, max: 34, label: "25-34" },
  { min: 35, max: 44, label: "35-44" },
  { min: 45, max: 54, label: "45-54" },
  { min: 55, max: 64, label: "55-64" },
  { min: 65, max: 150, label: "65+" }
] as const

function categorizeAge(age: number): string {
  for (const range of AGE_RANGES) {
    if (age >= range.min && age <= range.max) {
      return range.label
    }
  }
  return "Unknown"
}

function buildDemographicBreakdown(
  responses: {
    age?: number
    gender?: string
    country?: string
    countryCode?: string
    region?: string
  }[]
): DemographicBreakdown {
  const total = responses.length
  
  const ageCounts = new Map<string, number>()
  AGE_RANGES.forEach(r => ageCounts.set(r.label, 0))
  
  const genderCounts = new Map<string, number>()
  
  const locationCounts = new Map<string, {
    count: number
    countryCode: string
    regions: Map<string, number>
  }>()
  
  responses.forEach(r => {
    if (r.age !== undefined) {
      const ageRange = categorizeAge(r.age)
      ageCounts.set(ageRange, (ageCounts.get(ageRange) || 0) + 1)
    }
    
    if (r.gender) {
      genderCounts.set(r.gender, (genderCounts.get(r.gender) || 0) + 1)
    }
    
    if (r.country) {
      if (!locationCounts.has(r.country)) {
        locationCounts.set(r.country, {
          count: 0,
          countryCode: r.countryCode || "",
          regions: new Map()
        })
      }
      const loc = locationCounts.get(r.country)!
      loc.count++
      
      if (r.region) {
        loc.regions.set(r.region, (loc.regions.get(r.region) || 0) + 1)
      }
    }
  })
  
  const age: AgeGroup[] = AGE_RANGES.map(r => ({
    range: r.label,
    count: ageCounts.get(r.label) || 0,
    percentage: total > 0 ? ((ageCounts.get(r.label) || 0) / total) * 100 : 0
  }))
  
  const gender: GenderGroup[] = Array.from(genderCounts.entries()).map(([g, count]) => ({
    gender: g,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0
  }))
  
  const location: LocationGroup[] = Array.from(locationCounts.entries())
    .map(([country, data]) => ({
      country,
      countryCode: data.countryCode,
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      regions: Array.from(data.regions.entries())
        .map(([region, count]) => ({
          region,
          count,
          percentage: data.count > 0 ? (count / data.count) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
    }))
    .sort((a, b) => b.count - a.count)
  
  return { age, gender, location }
}

export type { DemographicBreakdown, AgeGroup, GenderGroup, LocationGroup }
export { AGE_RANGES, categorizeAge, buildDemographicBreakdown }
```


## 8.5.2 Device & Browser Analytics

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DEVICE & BROWSER ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

interface DeviceBreakdown {
  desktop: number
  mobile: number
  tablet: number
}

interface DeviceAnalytics {
  deviceTypes: DeviceTypeStats[]
  browsers: BrowserStats[]
  operatingSystems: OSStats[]
  screenResolutions: ScreenResolutionStats[]
}

interface DeviceTypeStats {
  type: "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN"
  count: number
  percentage: number
  completionRate: number
  averageTimeSeconds: number
}

interface BrowserStats {
  browser: string
  version: string | null
  count: number
  percentage: number
}

interface OSStats {
  os: string
  version: string | null
  count: number
  percentage: number
}

interface ScreenResolutionStats {
  resolution: string
  width: number
  height: number
  count: number
  percentage: number
}

function buildDeviceAnalytics(
  responses: {
    deviceType: string
    browser: string | null
    browserVersion: string | null
    os: string | null
    osVersion: string | null
    screenWidth: number | null
    screenHeight: number | null
    completionTimeSeconds: number | null
    status: string
  }[]
): DeviceAnalytics {
  const total = responses.length
  
  const deviceTypeCounts = new Map<string, {
    count: number
    completed: number
    totalTime: number
    timeCount: number
  }>()
  
  const browserCounts = new Map<string, number>()
  const osCounts = new Map<string, number>()
  const resolutionCounts = new Map<string, { width: number, height: number, count: number }>()
  
  responses.forEach(r => {
    if (!deviceTypeCounts.has(r.deviceType)) {
      deviceTypeCounts.set(r.deviceType, { count: 0, completed: 0, totalTime: 0, timeCount: 0 })
    }
    const deviceData = deviceTypeCounts.get(r.deviceType)!
    deviceData.count++
    if (r.status === "COMPLETED") deviceData.completed++
    if (r.completionTimeSeconds) {
      deviceData.totalTime += r.completionTimeSeconds
      deviceData.timeCount++
    }
    
    if (r.browser) {
      const browserKey = r.browserVersion ? `${r.browser} ${r.browserVersion}` : r.browser
      browserCounts.set(browserKey, (browserCounts.get(browserKey) || 0) + 1)
    }
    
    if (r.os) {
      const osKey = r.osVersion ? `${r.os} ${r.osVersion}` : r.os
      osCounts.set(osKey, (osCounts.get(osKey) || 0) + 1)
    }
    
    if (r.screenWidth && r.screenHeight) {
      const resKey = `${r.screenWidth}x${r.screenHeight}`
      if (!resolutionCounts.has(resKey)) {
        resolutionCounts.set(resKey, { width: r.screenWidth, height: r.screenHeight, count: 0 })
      }
      resolutionCounts.get(resKey)!.count++
    }
  })
  
  const deviceTypes: DeviceTypeStats[] = Array.from(deviceTypeCounts.entries())
    .map(([type, data]) => ({
      type: type as "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN",
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      completionRate: data.count > 0 ? (data.completed / data.count) * 100 : 0,
      averageTimeSeconds: data.timeCount > 0 ? data.totalTime / data.timeCount : 0
    }))
  
  const browsers: BrowserStats[] = Array.from(browserCounts.entries())
    .map(([browser, count]) => ({
      browser: browser.split(" ")[0],
      version: browser.includes(" ") ? browser.split(" ").slice(1).join(" ") : null,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  const operatingSystems: OSStats[] = Array.from(osCounts.entries())
    .map(([os, count]) => ({
      os: os.split(" ")[0],
      version: os.includes(" ") ? os.split(" ").slice(1).join(" ") : null,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  const screenResolutions: ScreenResolutionStats[] = Array.from(resolutionCounts.entries())
    .map(([resolution, data]) => ({
      resolution,
      width: data.width,
      height: data.height,
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  return { deviceTypes, browsers, operatingSystems, screenResolutions }
}

export type { DeviceBreakdown, DeviceAnalytics, DeviceTypeStats, BrowserStats, OSStats, ScreenResolutionStats }
export { buildDeviceAnalytics }
```


## 8.5.3 Geographic Analytics

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// GEOGRAPHIC ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

interface GeographicBreakdown {
  countries: CountryStats[]
  regions: RegionStats[]
  cities: CityStats[]
}

interface CountryStats {
  country: string
  countryCode: string
  count: number
  percentage: number
  completionRate: number
}

interface RegionStats {
  region: string
  country: string
  countryCode: string
  count: number
  percentage: number
}

interface CityStats {
  city: string
  region: string | null
  country: string
  countryCode: string
  count: number
  percentage: number
  latitude: number | null
  longitude: number | null
}

interface TrafficSource {
  source: string
  medium: string | null
  campaign: string | null
  count: number
  percentage: number
  completionRate: number
}

function buildGeographicBreakdown(
  responses: {
    country?: string
    countryCode?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
    status: string
  }[]
): GeographicBreakdown {
  const total = responses.length
  
  const countryData = new Map<string, {
    countryCode: string
    count: number
    completed: number
  }>()
  
  const regionData = new Map<string, {
    country: string
    countryCode: string
    count: number
  }>()
  
  const cityData = new Map<string, {
    region: string | null
    country: string
    countryCode: string
    count: number
    latitude: number | null
    longitude: number | null
  }>()
  
  responses.forEach(r => {
    if (r.country) {
      if (!countryData.has(r.country)) {
        countryData.set(r.country, {
          countryCode: r.countryCode || "",
          count: 0,
          completed: 0
        })
      }
      const cd = countryData.get(r.country)!
      cd.count++
      if (r.status === "COMPLETED") cd.completed++
    }
    
    if (r.region && r.country) {
      const regionKey = `${r.region}, ${r.country}`
      if (!regionData.has(regionKey)) {
        regionData.set(regionKey, {
          country: r.country,
          countryCode: r.countryCode || "",
          count: 0
        })
      }
      regionData.get(regionKey)!.count++
    }
    
    if (r.city && r.country) {
      const cityKey = `${r.city}, ${r.country}`
      if (!cityData.has(cityKey)) {
        cityData.set(cityKey, {
          region: r.region || null,
          country: r.country,
          countryCode: r.countryCode || "",
          count: 0,
          latitude: r.latitude || null,
          longitude: r.longitude || null
        })
      }
      cityData.get(cityKey)!.count++
    }
  })
  
  const countries: CountryStats[] = Array.from(countryData.entries())
    .map(([country, data]) => ({
      country,
      countryCode: data.countryCode,
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      completionRate: data.count > 0 ? (data.completed / data.count) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
  
  const regions: RegionStats[] = Array.from(regionData.entries())
    .map(([key, data]) => ({
      region: key.split(", ")[0],
      country: data.country,
      countryCode: data.countryCode,
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
  
  const cities: CityStats[] = Array.from(cityData.entries())
    .map(([key, data]) => ({
      city: key.split(", ")[0],
      region: data.region,
      country: data.country,
      countryCode: data.countryCode,
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      latitude: data.latitude,
      longitude: data.longitude
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)
  
  return { countries, regions, cities }
}

export type { GeographicBreakdown, CountryStats, RegionStats, CityStats, TrafficSource }
export { buildGeographicBreakdown }
```




# ══════════════════════════════════════════════════════════════════════════════
# 8.6 REPORT GENERATION
# ══════════════════════════════════════════════════════════════════════════════

## 8.6.1 Report Types

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// REPORT TYPES & CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

type ReportType = 
  | "SUMMARY"
  | "DETAILED"
  | "RAW_DATA"
  | "CROSS_TAB"
  | "TREND"
  | "COMPARISON"
  | "CUSTOM"

type ReportFormat = "PDF" | "XLSX" | "CSV" | "JSON" | "PPTX"

interface ReportConfig {
  type: ReportType
  format: ReportFormat
  
  title: string
  description: string | null
  
  dateRange: {
    start: Date | null
    end: Date | null
  }
  
  filters: ReportFilter[]
  
  sections: ReportSection[]
  
  branding: ReportBranding | null
  
  schedule: ReportSchedule | null
}

interface ReportFilter {
  field: string
  operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "GREATER_THAN" | "LESS_THAN" | "IN" | "NOT_IN"
  value: unknown
}

interface ReportSection {
  id: string
  type: "SUMMARY" | "CHART" | "TABLE" | "TEXT" | "RAW_DATA"
  title: string
  config: Record<string, unknown>
  order: number
}

interface ReportBranding {
  logoUrl: string | null
  primaryColor: string
  companyName: string | null
  footerText: string | null
}

interface ReportSchedule {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY"
  dayOfWeek: number | null
  dayOfMonth: number | null
  time: string
  timezone: string
  recipients: string[]
}

const DEFAULT_REPORT_SECTIONS: Record<ReportType, ReportSection[]> = {
  SUMMARY: [
    { id: "overview", type: "SUMMARY", title: "Overview", config: {}, order: 1 },
    { id: "response_chart", type: "CHART", title: "Responses Over Time", config: { chartType: "line" }, order: 2 },
    { id: "completion_funnel", type: "CHART", title: "Completion Funnel", config: { chartType: "funnel" }, order: 3 }
  ],
  DETAILED: [
    { id: "overview", type: "SUMMARY", title: "Overview", config: {}, order: 1 },
    { id: "questions", type: "TABLE", title: "Question Analysis", config: {}, order: 2 },
    { id: "demographics", type: "CHART", title: "Demographics", config: { chartType: "pie" }, order: 3 },
    { id: "devices", type: "CHART", title: "Devices", config: { chartType: "bar" }, order: 4 }
  ],
  RAW_DATA: [
    { id: "raw_responses", type: "RAW_DATA", title: "All Responses", config: {}, order: 1 }
  ],
  CROSS_TAB: [
    { id: "cross_tab", type: "TABLE", title: "Cross-Tabulation", config: {}, order: 1 }
  ],
  TREND: [
    { id: "trend_overview", type: "SUMMARY", title: "Trend Overview", config: {}, order: 1 },
    { id: "trend_chart", type: "CHART", title: "Response Trends", config: { chartType: "line" }, order: 2 }
  ],
  COMPARISON: [
    { id: "comparison_table", type: "TABLE", title: "Comparison", config: {}, order: 1 },
    { id: "comparison_chart", type: "CHART", title: "Visual Comparison", config: { chartType: "grouped_bar" }, order: 2 }
  ],
  CUSTOM: []
}

export type { ReportType, ReportFormat, ReportConfig, ReportFilter, ReportSection, ReportBranding, ReportSchedule }
export { DEFAULT_REPORT_SECTIONS }
```


## 8.6.2 Report Generation

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// REPORT GENERATION
// ══════════════════════════════════════════════════════════════════════════════

interface GeneratedReport {
  id: string
  contentId: string
  contentType: "POLL" | "SURVEY" | "TEST"
  
  config: ReportConfig
  
  status: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED"
  
  fileUrl: string | null
  fileSize: number | null
  
  generatedAt: Date | null
  expiresAt: Date | null
  
  error: string | null
}

interface ReportGenerationRequest {
  contentId: string
  contentType: "POLL" | "SURVEY" | "TEST"
  config: ReportConfig
  requestedBy: string
}

async function generateReport(
  request: ReportGenerationRequest
): Promise<GeneratedReport> {
  const reportId = generateReportId()
  
  const report: GeneratedReport = {
    id: reportId,
    contentId: request.contentId,
    contentType: request.contentType,
    config: request.config,
    status: "PENDING",
    fileUrl: null,
    fileSize: null,
    generatedAt: null,
    expiresAt: null,
    error: null
  }
  
  return report
}

function generateReportId(): string {
  return `rpt_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: ReportType
  config: Partial<ReportConfig>
  isDefault: boolean
  createdBy: string | null
}

const BUILT_IN_TEMPLATES: ReportTemplate[] = [
  {
    id: "summary_pdf",
    name: "Summary Report (PDF)",
    description: "High-level overview with key metrics and charts",
    type: "SUMMARY",
    config: {
      format: "PDF",
      sections: DEFAULT_REPORT_SECTIONS.SUMMARY
    },
    isDefault: true,
    createdBy: null
  },
  {
    id: "detailed_pdf",
    name: "Detailed Report (PDF)",
    description: "Comprehensive analysis with all metrics",
    type: "DETAILED",
    config: {
      format: "PDF",
      sections: DEFAULT_REPORT_SECTIONS.DETAILED
    },
    isDefault: true,
    createdBy: null
  },
  {
    id: "raw_data_xlsx",
    name: "Raw Data Export (Excel)",
    description: "All response data in spreadsheet format",
    type: "RAW_DATA",
    config: {
      format: "XLSX"
    },
    isDefault: true,
    createdBy: null
  },
  {
    id: "raw_data_csv",
    name: "Raw Data Export (CSV)",
    description: "All response data in CSV format",
    type: "RAW_DATA",
    config: {
      format: "CSV"
    },
    isDefault: true,
    createdBy: null
  }
]

export type { GeneratedReport, ReportGenerationRequest, ReportTemplate }
export { generateReport, BUILT_IN_TEMPLATES }
```


## 8.6.3 Export Formats

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// EXPORT FORMATS
// ══════════════════════════════════════════════════════════════════════════════

interface ExportConfig {
  format: ReportFormat
  
  includeHeaders: boolean
  includeMetadata: boolean
  
  dateFormat: string
  timezone: string
  
  encoding: "UTF-8" | "UTF-16" | "ISO-8859-1"
  
  csvDelimiter: "," | ";" | "\t"
  
  anonymize: boolean
  fieldsToExclude: string[]
  fieldsToHash: string[]
}

const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: "CSV",
  includeHeaders: true,
  includeMetadata: true,
  dateFormat: "YYYY-MM-DD HH:mm:ss",
  timezone: "UTC",
  encoding: "UTF-8",
  csvDelimiter: ",",
  anonymize: false,
  fieldsToExclude: [],
  fieldsToHash: []
}

interface ExportField {
  key: string
  label: string
  type: "STRING" | "NUMBER" | "DATE" | "BOOLEAN" | "JSON"
  format: string | null
}

const SURVEY_EXPORT_FIELDS: ExportField[] = [
  { key: "responseId", label: "Response ID", type: "STRING", format: null },
  { key: "confirmationCode", label: "Confirmation Code", type: "STRING", format: null },
  { key: "status", label: "Status", type: "STRING", format: null },
  { key: "startedAt", label: "Started At", type: "DATE", format: null },
  { key: "completedAt", label: "Completed At", type: "DATE", format: null },
  { key: "completionTimeSeconds", label: "Completion Time (s)", type: "NUMBER", format: null },
  { key: "deviceType", label: "Device Type", type: "STRING", format: null },
  { key: "browser", label: "Browser", type: "STRING", format: null },
  { key: "country", label: "Country", type: "STRING", format: null },
  { key: "region", label: "Region", type: "STRING", format: null }
]

const POLL_EXPORT_FIELDS: ExportField[] = [
  { key: "voteId", label: "Vote ID", type: "STRING", format: null },
  { key: "optionId", label: "Option ID", type: "STRING", format: null },
  { key: "optionText", label: "Option", type: "STRING", format: null },
  { key: "createdAt", label: "Voted At", type: "DATE", format: null },
  { key: "deviceType", label: "Device Type", type: "STRING", format: null },
  { key: "country", label: "Country", type: "STRING", format: null }
]

const TEST_EXPORT_FIELDS: ExportField[] = [
  { key: "resultId", label: "Result ID", type: "STRING", format: null },
  { key: "categoryName", label: "Result Category", type: "STRING", format: null },
  { key: "totalScore", label: "Total Score", type: "NUMBER", format: null },
  { key: "createdAt", label: "Completed At", type: "DATE", format: null },
  { key: "completionTimeSeconds", label: "Completion Time (s)", type: "NUMBER", format: null },
  { key: "shared", label: "Shared", type: "BOOLEAN", format: null },
  { key: "deviceType", label: "Device Type", type: "STRING", format: null },
  { key: "country", label: "Country", type: "STRING", format: null }
]

export type { ExportConfig, ExportField }
export { DEFAULT_EXPORT_CONFIG, SURVEY_EXPORT_FIELDS, POLL_EXPORT_FIELDS, TEST_EXPORT_FIELDS }
```




# ══════════════════════════════════════════════════════════════════════════════
# 8.7 DASHBOARD CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

## 8.7.1 Dashboard Widgets

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD WIDGETS
// ══════════════════════════════════════════════════════════════════════════════

type WidgetType = 
  | "METRIC_CARD"
  | "LINE_CHART"
  | "BAR_CHART"
  | "PIE_CHART"
  | "DONUT_CHART"
  | "FUNNEL_CHART"
  | "TABLE"
  | "MAP"
  | "WORD_CLOUD"
  | "HEATMAP"
  | "GAUGE"

interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  
  config: WidgetConfig
  
  refreshInterval: number | null
}

interface WidgetConfig {
  metric: string | null
  
  dataSource: {
    type: "POLL" | "SURVEY" | "TEST" | "ALL"
    contentId: string | null
    questionId: string | null
  }
  
  dateRange: {
    type: "LAST_24H" | "LAST_7D" | "LAST_30D" | "LAST_90D" | "ALL_TIME" | "CUSTOM"
    start: Date | null
    end: Date | null
  }
  
  visualization: {
    colors: string[] | null
    showLabels: boolean
    showLegend: boolean
    showValues: boolean
    animate: boolean
  }
  
  comparison: {
    enabled: boolean
    type: "PREVIOUS_PERIOD" | "SAME_PERIOD_LAST_YEAR" | null
  }
}

interface MetricCardConfig extends WidgetConfig {
  metric: string
  format: "NUMBER" | "PERCENTAGE" | "DURATION" | "CURRENCY"
  prefix: string | null
  suffix: string | null
  trend: boolean
}

interface ChartConfig extends WidgetConfig {
  xAxis: { field: string, label: string }
  yAxis: { field: string, label: string }
  groupBy: string | null
  sortBy: "VALUE" | "LABEL" | "NATURAL"
  limit: number | null
}

const DEFAULT_WIDGETS: Record<string, Partial<DashboardWidget>> = {
  total_responses: {
    type: "METRIC_CARD",
    title: "Total Responses",
    config: {
      metric: "total_responses",
      dataSource: { type: "ALL", contentId: null, questionId: null },
      dateRange: { type: "ALL_TIME", start: null, end: null },
      visualization: { colors: null, showLabels: true, showLegend: false, showValues: true, animate: true },
      comparison: { enabled: true, type: "PREVIOUS_PERIOD" }
    }
  },
  completion_rate: {
    type: "GAUGE",
    title: "Completion Rate",
    config: {
      metric: "completion_rate",
      dataSource: { type: "SURVEY", contentId: null, questionId: null },
      dateRange: { type: "LAST_30D", start: null, end: null },
      visualization: { colors: ["#ef4444", "#f59e0b", "#22c55e"], showLabels: true, showLegend: false, showValues: true, animate: true },
      comparison: { enabled: false, type: null }
    }
  },
  responses_over_time: {
    type: "LINE_CHART",
    title: "Responses Over Time",
    config: {
      metric: null,
      dataSource: { type: "ALL", contentId: null, questionId: null },
      dateRange: { type: "LAST_30D", start: null, end: null },
      visualization: { colors: null, showLabels: true, showLegend: true, showValues: false, animate: true },
      comparison: { enabled: false, type: null }
    }
  }
}

export type { WidgetType, DashboardWidget, WidgetConfig, MetricCardConfig, ChartConfig }
export { DEFAULT_WIDGETS }
```


## 8.7.2 Dashboard Layout

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD LAYOUT
// ══════════════════════════════════════════════════════════════════════════════

interface Dashboard {
  id: string
  name: string
  description: string | null
  
  organizationId: string | null
  createdBy: string
  
  layout: DashboardLayout
  widgets: DashboardWidget[]
  
  filters: DashboardFilter[]
  
  isDefault: boolean
  isShared: boolean
  
  createdAt: Date
  updatedAt: Date
}

interface DashboardLayout {
  columns: number
  rowHeight: number
  gap: number
  breakpoints: {
    lg: number
    md: number
    sm: number
  }
}

interface DashboardFilter {
  id: string
  field: string
  label: string
  type: "SELECT" | "MULTI_SELECT" | "DATE_RANGE" | "SEARCH"
  options: { value: string, label: string }[] | null
  defaultValue: unknown
}

const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  columns: 12,
  rowHeight: 100,
  gap: 16,
  breakpoints: {
    lg: 1200,
    md: 996,
    sm: 768
  }
}

interface DashboardTemplate {
  id: string
  name: string
  description: string
  contentType: "POLL" | "SURVEY" | "TEST" | "ALL"
  layout: DashboardLayout
  widgets: Omit<DashboardWidget, "id">[]
  thumbnail: string | null
}

const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: "poll_overview",
    name: "Poll Overview",
    description: "Real-time poll results and voter analytics",
    contentType: "POLL",
    layout: DEFAULT_DASHBOARD_LAYOUT,
    widgets: [
      {
        type: "METRIC_CARD",
        title: "Total Votes",
        position: { x: 0, y: 0, width: 3, height: 1 },
        config: {
          metric: "total_votes",
          dataSource: { type: "POLL", contentId: null, questionId: null },
          dateRange: { type: "ALL_TIME", start: null, end: null },
          visualization: { colors: null, showLabels: true, showLegend: false, showValues: true, animate: true },
          comparison: { enabled: true, type: "PREVIOUS_PERIOD" }
        },
        refreshInterval: 5
      },
      {
        type: "PIE_CHART",
        title: "Vote Distribution",
        position: { x: 0, y: 1, width: 6, height: 3 },
        config: {
          metric: null,
          dataSource: { type: "POLL", contentId: null, questionId: null },
          dateRange: { type: "ALL_TIME", start: null, end: null },
          visualization: { colors: null, showLabels: true, showLegend: true, showValues: true, animate: true },
          comparison: { enabled: false, type: null }
        },
        refreshInterval: 5
      }
    ],
    thumbnail: null
  },
  {
    id: "survey_analytics",
    name: "Survey Analytics",
    description: "Comprehensive survey response analytics",
    contentType: "SURVEY",
    layout: DEFAULT_DASHBOARD_LAYOUT,
    widgets: [],
    thumbnail: null
  },
  {
    id: "test_results",
    name: "Test Results",
    description: "Personality test results and viral metrics",
    contentType: "TEST",
    layout: DEFAULT_DASHBOARD_LAYOUT,
    widgets: [],
    thumbnail: null
  }
]

export type { Dashboard, DashboardLayout, DashboardFilter, DashboardTemplate }
export { DEFAULT_DASHBOARD_LAYOUT, DASHBOARD_TEMPLATES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 8.8 ANALYTICS DATA MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 8.8.1 Aggregated Statistics Model

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// AGGREGATED STATISTICS MODEL (Drizzle-style)
// ══════════════════════════════════════════════════════════════════════════════

/*
model ContentStats {
  id              String          @id @default(cuid())
  contentId       String          @unique
  contentType     ContentType
  
  totalResponses  Int             @default(0)
  completedResponses Int          @default(0)
  abandonedResponses Int          @default(0)
  
  completionRate  Float           @default(0)
  
  averageCompletionTimeSeconds Int?
  medianCompletionTimeSeconds Int?
  
  uniqueParticipants Int          @default(0)
  
  lastResponseAt  DateTime?
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([contentType])
  @@index([updatedAt])
}

model DailyStats {
  id              String          @id @default(cuid())
  contentId       String
  contentType     ContentType
  date            DateTime        @db.Date
  
  responses       Int             @default(0)
  completions     Int             @default(0)
  abandons        Int             @default(0)
  
  uniqueVisitors  Int             @default(0)
  
  averageTimeSeconds Int?
  
  @@unique([contentId, date])
  @@index([contentId])
  @@index([date])
}

model QuestionStats {
  id              String          @id @default(cuid())
  questionId      String          @unique
  contentId       String
  
  totalAnswers    Int             @default(0)
  skipCount       Int             @default(0)
  
  averageTimeSeconds Int?
  
  answerDistribution Json?
  
  updatedAt       DateTime        @updatedAt
  
  @@index([contentId])
}

model OptionStats {
  id              String          @id @default(cuid())
  optionId        String          @unique
  questionId      String
  contentId       String
  
  selectCount     Int             @default(0)
  percentage      Float           @default(0)
  
  updatedAt       DateTime        @updatedAt
  
  @@index([questionId])
  @@index([contentId])
}
*/
```


## 8.8.2 Report & Export Models

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// REPORT & EXPORT DATA MODELS (Drizzle-style)
// ══════════════════════════════════════════════════════════════════════════════

/*
model Report {
  id              String          @id @default(cuid())
  contentId       String
  contentType     ContentType
  
  type            ReportType
  format          ReportFormat
  
  title           String          @db.VarChar(200)
  description     String?         @db.Text
  
  config          Json
  
  status          ReportStatus    @default(PENDING)
  
  fileUrl         String?
  fileSize        Int?
  
  generatedBy     String
  generatedAt     DateTime?
  expiresAt       DateTime?
  
  error           String?         @db.Text
  
  createdAt       DateTime        @default(now())
  
  @@index([contentId])
  @@index([generatedBy])
  @@index([status])
  @@index([createdAt])
}

model ScheduledReport {
  id              String          @id @default(cuid())
  contentId       String
  contentType     ContentType
  
  config          Json
  
  frequency       ReportFrequency
  dayOfWeek       Int?
  dayOfMonth      Int?
  time            String          @db.VarChar(5)
  timezone        String          @db.VarChar(50)
  
  recipients      String[]
  
  isActive        Boolean         @default(true)
  
  lastRunAt       DateTime?
  nextRunAt       DateTime?
  
  createdBy       String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([contentId])
  @@index([isActive])
  @@index([nextRunAt])
}

model DataExport {
  id              String          @id @default(cuid())
  contentId       String
  contentType     ContentType
  
  format          ExportFormat
  config          Json
  
  status          ExportStatus    @default(PENDING)
  
  fileUrl         String?
  fileSize        Int?
  rowCount        Int?
  
  requestedBy     String
  requestedAt     DateTime        @default(now())
  completedAt     DateTime?
  expiresAt       DateTime?
  
  error           String?         @db.Text
  
  @@index([contentId])
  @@index([requestedBy])
  @@index([status])
}

enum ReportType {
  SUMMARY
  DETAILED
  RAW_DATA
  CROSS_TAB
  TREND
  COMPARISON
  CUSTOM
}

enum ReportFormat {
  PDF
  XLSX
  CSV
  JSON
  PPTX
}

enum ReportStatus {
  PENDING
  GENERATING
  COMPLETED
  FAILED
  EXPIRED
}

enum ReportFrequency {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
}

enum ExportFormat {
  CSV
  XLSX
  JSON
}

enum ExportStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  EXPIRED
}
*/
```


## 8.8.3 Dashboard Models

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD DATA MODELS (Drizzle-style)
// ══════════════════════════════════════════════════════════════════════════════

/*
model Dashboard {
  id              String          @id @default(cuid())
  
  name            String          @db.VarChar(100)
  description     String?         @db.VarChar(500)
  
  organizationId  String?
  createdBy       String
  
  layout          Json
  filters         Json
  
  isDefault       Boolean         @default(false)
  isShared        Boolean         @default(false)
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  widgets         DashboardWidget[]
  
  organization    Organization?   @relation(fields: [organizationId], references: [id])
  creator         User            @relation(fields: [createdBy], references: [id])
  
  @@index([organizationId])
  @@index([createdBy])
}

model DashboardWidget {
  id              String          @id @default(cuid())
  dashboardId     String
  
  type            WidgetType
  title           String          @db.VarChar(100)
  
  position        Json
  config          Json
  
  refreshInterval Int?
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  dashboard       Dashboard       @relation(fields: [dashboardId], references: [id], onDelete: Cascade)
  
  @@index([dashboardId])
}

enum WidgetType {
  METRIC_CARD
  LINE_CHART
  BAR_CHART
  PIE_CHART
  DONUT_CHART
  FUNNEL_CHART
  TABLE
  MAP
  WORD_CLOUD
  HEATMAP
  GAUGE
}
*/
```




# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 8.12 REAL-TIME EVENT CATALOG                                                │
# └─────────────────────────────────────────────────────────────────────────────┘

## 8.12.1 Event Transport Strategy

```typescript
const REALTIME_TRANSPORT_CONFIG = {
  // Primary: Server-Sent Events (most use cases)
  sse: {
    endpoint: "/api/sse/connect",
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
    useCases: ["Feed", "Notifications", "Poll results", "Comments"]
  },

  // Secondary: WebSocket (Live Poll only)
  websocket: {
    endpoint: "/api/ws",
    pingInterval: 25000,
    pongTimeout: 5000,
    useCases: ["Live Poll voting", "Live Chat", "Typing indicators"]
  },

  // Fallback: Long polling
  longPolling: {
    endpoint: "/api/poll",
    pollInterval: 5000,
    timeout: 30000
  }
} as const
```

## 8.12.2 SSE Event Catalog

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// COMPLETE SSE EVENT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

const SSE_EVENTS = {
  // ─────────────────────────────────────────────────────────────────────────
  // NOTIFICATION EVENTS
  // ─────────────────────────────────────────────────────────────────────────
  NOTIFICATION: {
    NEW: "notification:new",
    READ: "notification:read",
    BATCH_READ: "notification:batch_read",
    COUNT_UPDATE: "notification:count_update"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FEED EVENTS
  // ─────────────────────────────────────────────────────────────────────────
  FEED: {
    NEW_CONTENT: "feed:new_content",
    CONTENT_UPDATED: "feed:content_updated",
    CONTENT_REMOVED: "feed:content_removed",
    TRENDING_UPDATE: "feed:trending_update"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // POLL EVENTS
  // ─────────────────────────────────────────────────────────────────────────
  POLL: {
    VOTE_COUNT_UPDATE: "poll:vote_count_update",
    STATUS_CHANGE: "poll:status_change",
    RESULTS_AVAILABLE: "poll:results_available",
    MILESTONE_REACHED: "poll:milestone_reached"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SURVEY EVENTS
  // ─────────────────────────────────────────────────────────────────────────
  SURVEY: {
    RESPONSE_MILESTONE: "survey:response_milestone",
    STATUS_CHANGE: "survey:status_change",
    QUOTA_WARNING: "survey:quota_warning",
    QUOTA_REACHED: "survey:quota_reached"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COMMENT EVENTS
  // ─────────────────────────────────────────────────────────────────────────
  COMMENT: {
    NEW: "comment:new",
    REPLY: "comment:reply",
    REACTION: "comment:reaction",
    MENTION: "comment:mention",
    PINNED: "comment:pinned",
    DELETED: "comment:deleted"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // USER EVENTS
  // ─────────────────────────────────────────────────────────────────────────
  USER: {
    NEW_FOLLOWER: "user:new_follower",
    BADGE_EARNED: "user:badge_earned",
    LEVEL_UP: "user:level_up",
    VERIFICATION_UPDATE: "user:verification_update"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DM EVENTS
  // ─────────────────────────────────────────────────────────────────────────
  DM: {
    NEW_MESSAGE: "dm:new_message",
    MESSAGE_READ: "dm:message_read",
    TYPING: "dm:typing",
    CONVERSATION_UPDATED: "dm:conversation_updated"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SYSTEM EVENTS
  // ─────────────────────────────────────────────────────────────────────────
  SYSTEM: {
    MAINTENANCE: "system:maintenance",
    FEATURE_ANNOUNCEMENT: "system:feature_announcement",
    SESSION_EXPIRING: "system:session_expiring",
    FORCE_LOGOUT: "system:force_logout"
  }
} as const

// ═══════════════════════════════════════════════════════════════════════════
// SSE EVENT PAYLOADS
// ═══════════════════════════════════════════════════════════════════════════

interface SSEPayloads {
  "notification:new": {
    id: string
    type: NotificationType
    title: string
    body: string
    imageUrl?: string
    actionUrl: string
    createdAt: string
  }

  "notification:count_update": {
    unreadCount: number
    byCategory: Record<string, number>
  }

  "feed:new_content": {
    contentType: "POLL" | "SURVEY" | "TEST"
    contentId: string
    preview: {
      title: string
      authorUsername: string
      authorAvatar?: string
    }
    position: "top" | "inline"
  }

  "feed:trending_update": {
    items: Array<{
      contentType: string
      contentId: string
      title: string
      rank: number
      previousRank?: number
      voteCount: number
    }>
  }

  "poll:vote_count_update": {
    pollId: string
    totalVotes: number
    options: Array<{
      id: string
      voteCount: number
      percentage: number
    }>
    updatedAt: string
  }

  "poll:status_change": {
    pollId: string
    oldStatus: PollStatus
    newStatus: PollStatus
    reason?: string
  }

  "comment:new": {
    commentId: string
    contentType: string
    contentId: string
    author: {
      id: string
      username: string
      displayName: string
      avatarUrl?: string
    }
    text: string
    parentId?: string
    createdAt: string
  }

  "user:new_follower": {
    followerId: string
    followerUsername: string
    followerDisplayName: string
    followerAvatarUrl?: string
    totalFollowers: number
  }

  "user:badge_earned": {
    badgeId: string
    badgeName: string
    badgeIcon: string
    badgeDescription: string
    rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY"
  }

  "dm:new_message": {
    conversationId: string
    messageId: string
    senderId: string
    senderUsername: string
    preview: string
    createdAt: string
  }

  "system:maintenance": {
    scheduledAt: string
    estimatedDuration: number
    message: string
  }

  "system:session_expiring": {
    expiresAt: string
    minutesRemaining: number
  }
}
```

## 8.12.3 WebSocket Event Catalog (Live Poll)

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// WEBSOCKET EVENTS - LIVE POLL ONLY
// ═══════════════════════════════════════════════════════════════════════════

const WS_EVENTS = {
  // ─────────────────────────────────────────────────────────────────────────
  // CONNECTION
  // ─────────────────────────────────────────────────────────────────────────
  CONNECTION: {
    CONNECTED: "ws:connected",
    DISCONNECTED: "ws:disconnected",
    RECONNECTING: "ws:reconnecting",
    ERROR: "ws:error"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIVE POLL
  // ─────────────────────────────────────────────────────────────────────────
  LIVEPOLL: {
    JOINED: "livepoll:joined",
    LEFT: "livepoll:left",
    PARTICIPANT_COUNT: "livepoll:participant_count",
    VOTE_RECEIVED: "livepoll:vote_received",
    VOTE_BURST: "livepoll:vote_burst",
    RESULTS_TICK: "livepoll:results_tick",
    STARTED: "livepoll:started",
    PAUSED: "livepoll:paused",
    RESUMED: "livepoll:resumed",
    ENDED: "livepoll:ended",
    QUESTION_CHANGED: "livepoll:question_changed",
    COUNTDOWN: "livepoll:countdown",
    WAITING_ROOM: "livepoll:waiting_room"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIVE CHAT
  // ─────────────────────────────────────────────────────────────────────────
  LIVECHAT: {
    MESSAGE: "livechat:message",
    REACTION: "livechat:reaction",
    TYPING: "livechat:typing",
    STOPPED_TYPING: "livechat:stopped_typing",
    DELETED: "livechat:deleted",
    PINNED: "livechat:pinned"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HOST CONTROLS
  // ─────────────────────────────────────────────────────────────────────────
  HOST: {
    ANNOUNCEMENT: "host:announcement",
    SPOTLIGHT_USER: "host:spotlight_user",
    MUTE_CHAT: "host:mute_chat",
    KICK_USER: "host:kick_user"
  }
} as const

// ═══════════════════════════════════════════════════════════════════════════
// WEBSOCKET PAYLOADS
// ═══════════════════════════════════════════════════════════════════════════

interface WSPayloads {
  "ws:connected": {
    sessionId: string
    serverTime: string
    reconnectToken: string
  }

  "ws:error": {
    code: string
    message: string
    retryAfter?: number
  }

  "livepoll:joined": {
    pollId: string
    userId: string
    username: string
    participantNumber: number
    totalParticipants: number
  }

  "livepoll:participant_count": {
    pollId: string
    total: number
    active: number
    voted: number
    watching: number
  }

  "livepoll:vote_received": {
    pollId: string
    optionId: string
    voterHash: string
    timestamp: string
    newTotal: number
    optionTotal: number
  }

  "livepoll:vote_burst": {
    pollId: string
    votes: Array<{ optionId: string; count: number }>
    totalInBurst: number
    grandTotal: number
    timestamp: string
  }

  "livepoll:results_tick": {
    pollId: string
    options: Array<{
      id: string
      label: string
      votes: number
      percentage: number
      trend: "up" | "down" | "stable"
    }>
    totalVotes: number
    votesPerSecond: number
    timestamp: string
  }

  "livepoll:countdown": {
    pollId: string
    secondsRemaining: number
    phase: "starting" | "ending"
  }

  "livepoll:ended": {
    pollId: string
    finalResults: Array<{
      id: string
      label: string
      votes: number
      percentage: number
      rank: number
    }>
    totalVotes: number
    totalParticipants: number
    duration: number
    pulseUrl: string
  }

  "livepoll:waiting_room": {
    pollId: string
    position: number
    estimatedWait: number
    message: string
  }

  "livechat:message": {
    id: string
    pollId: string
    author: {
      id: string
      username: string
      displayName: string
      avatarUrl?: string
      isHost: boolean
      isModerator: boolean
    }
    text: string
    replyTo?: string
    timestamp: string
  }

  "host:announcement": {
    pollId: string
    message: string
    type: "info" | "warning" | "celebration"
    duration?: number
  }
}
```

## 8.12.4 Event Subscription & Rate Limiting

```typescript
const EVENT_CONFIG = {
  // Auto-subscribe based on auth state
  autoSubscribe: {
    authenticated: [
      "notification:new",
      "notification:count_update",
      "user:new_follower",
      "user:badge_earned",
      "dm:new_message",
      "system:maintenance",
      "system:session_expiring"
    ],
    anonymous: ["system:maintenance"]
  },

  // Rate limits per event type
  rateLimits: {
    "poll:vote_count_update": { maxPerSecond: 2, batchWindow: 500 },
    "livepoll:vote_received": { maxPerSecond: 50, switchToBurst: 100 },
    "livechat:typing": { maxPerSecond: 1, dedupeWindow: 3000 },
    "feed:new_content": { maxPerSecond: 5, batchWindow: 1000 }
  },

  // Message format
  messageFormat: {
    sse: { id: "string", event: "string", data: "JSON", retry: "number?" },
    ws: { type: "string", payload: "object", timestamp: "ISO8601", correlationId: "string?" }
  }
} as const
```



# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 08
# ══════════════════════════════════════════════════════════════════════════════