# ═══════════════════════════════════════════════════════════════════════════════
# DATA - Response Quality Scoring
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-003.md, bible-009.md
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# RESPONSE QUALITY OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

Response Quality Score measures the quality of individual responses based on
timing, consistency, engagement, and attention check performance.

| Score Range | Label | Recommendation |
|-------------|-------|----------------|
| 70-100 | High Quality | INCLUDE |
| 40-69 | Moderate Quality | REVIEW |
| 0-39 | Low Quality | EXCLUDE |



# ═══════════════════════════════════════════════════════════════════════════════
# QUALITY SCORING COMPONENTS
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE QUALITY SCORING
// ══════════════════════════════════════════════════════════════════════════════

interface ResponseQualityScore {
  overallScore: number
  components: {
    timing: number
    consistency: number
    engagement: number
    attentionChecks: number
  }
  flags: string[]
  recommendation: "INCLUDE" | "REVIEW" | "EXCLUDE"
}

const QUALITY_WEIGHTS = {
  timing: 0.25,
  consistency: 0.25,
  engagement: 0.25,
  attentionChecks: 0.25
}

const QUALITY_THRESHOLDS = {
  include: 70,
  review: 40
}

function calculateResponseQuality(
  timingScore: number,
  consistencyScore: number,
  engagementScore: number,
  attentionScore: number
): ResponseQualityScore {

  const overallScore =
    timingScore * QUALITY_WEIGHTS.timing +
    consistencyScore * QUALITY_WEIGHTS.consistency +
    engagementScore * QUALITY_WEIGHTS.engagement +
    attentionScore * QUALITY_WEIGHTS.attentionChecks

  const flags: string[] = []
  if (timingScore < 50) flags.push("SPEEDING")
  if (consistencyScore < 50) flags.push("INCONSISTENT")
  if (engagementScore < 50) flags.push("STRAIGHT_LINING")
  if (attentionScore < 50) flags.push("FAILED_ATTENTION")

  let recommendation: "INCLUDE" | "REVIEW" | "EXCLUDE"
  if (overallScore >= QUALITY_THRESHOLDS.include) {
    recommendation = "INCLUDE"
  } else if (overallScore >= QUALITY_THRESHOLDS.review) {
    recommendation = "REVIEW"
  } else {
    recommendation = "EXCLUDE"
  }

  return {
    overallScore,
    components: {
      timing: timingScore,
      consistency: consistencyScore,
      engagement: engagementScore,
      attentionChecks: attentionScore
    },
    flags,
    recommendation
  }
}

export { calculateResponseQuality, QUALITY_WEIGHTS, QUALITY_THRESHOLDS }
export type { ResponseQualityScore }
```



# ═══════════════════════════════════════════════════════════════════════════════
# RESPONSE TIME TRACKING
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE TIME TRACKING
// ══════════════════════════════════════════════════════════════════════════════

interface ResponseTiming {
  questionId: string
  startTime: number
  endTime: number
  duration: number
  wordCount: number
  expectedMinTime: number
  isSpeeder: boolean
}

const READING_SPEED = {
  wordsPerMinute: 200,
  minimumTimePerQuestion: 2000,
  speedingThreshold: 0.3
}

function calculateExpectedTime(question: Question): number {
  const textWordCount = question.text.split(/\s+/).length
  const optionsWordCount = question.options?.reduce(
    (sum, opt) => sum + opt.text.split(/\s+/).length,
    0
  ) || 0

  const totalWords = textWordCount + optionsWordCount
  const readingTime = (totalWords / READING_SPEED.wordsPerMinute) * 60 * 1000

  return Math.max(READING_SPEED.minimumTimePerQuestion, readingTime)
}

function detectSpeeding(timing: ResponseTiming): boolean {
  return timing.duration < timing.expectedMinTime * READING_SPEED.speedingThreshold
}

export { calculateExpectedTime, detectSpeeding, READING_SPEED }
export type { ResponseTiming }
```



# ═══════════════════════════════════════════════════════════════════════════════
# STRAIGHT-LINING DETECTION
# ═══════════════════════════════════════════════════════════════════════════════

Straight-lining occurs when respondents select the same answer repeatedly without engaging.

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// STRAIGHT-LINING DETECTION
// ══════════════════════════════════════════════════════════════════════════════

interface StraightLineResult {
  detected: boolean
  pattern: string | null
  consecutiveCount: number
  variance: number
}

const STRAIGHT_LINE_THRESHOLDS = {
  MIN_QUESTIONS_FOR_DETECTION: 5,
  SAME_ANSWER_RATIO_WARNING: 0.6,
  SAME_ANSWER_RATIO_CRITICAL: 0.8,
  POSITION_BIAS_THRESHOLD: 0.7
}

function detectStraightLining(
  responses: Array<{ questionId: string, value: number | string }>,
  threshold: number = 0.8
): StraightLineResult {

  const numericResponses = responses
    .filter(r => typeof r.value === "number")
    .map(r => r.value as number)

  if (numericResponses.length < 5) {
    return { detected: false, pattern: null, consecutiveCount: 0, variance: 1 }
  }

  const mean = numericResponses.reduce((a, b) => a + b, 0) / numericResponses.length
  const variance = numericResponses.reduce((sum, val) =>
    sum + Math.pow(val - mean, 2), 0
  ) / numericResponses.length

  let maxConsecutive = 1
  let currentConsecutive = 1
  let currentValue = numericResponses[0]

  for (let i = 1; i < numericResponses.length; i++) {
    if (numericResponses[i] === currentValue) {
      currentConsecutive++
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
    } else {
      currentValue = numericResponses[i]
      currentConsecutive = 1
    }
  }

  const straightLineRatio = maxConsecutive / numericResponses.length
  const detected = variance < 0.5 || straightLineRatio >= threshold

  return {
    detected,
    pattern: detected ? `Same answer ${maxConsecutive} times consecutively` : null,
    consecutiveCount: maxConsecutive,
    variance
  }
}

export { detectStraightLining, STRAIGHT_LINE_THRESHOLDS }
export type { StraightLineResult }
```



# ═══════════════════════════════════════════════════════════════════════════════
# POSITION BIAS DETECTION
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
function detectPositionBias(
  answers: Array<{
    questionId: string
    value: unknown
    options?: Array<{ id: string; position: number }>
  }>
): number {
  const answersWithPosition = answers.filter(a => a.options && a.options.length > 0)

  if (answersWithPosition.length < 5) {
    return 0
  }

  const positions: number[] = []
  for (const answer of answersWithPosition) {
    const selectedOption = answer.options?.find(o => o.id === String(answer.value))
    if (selectedOption) {
      const normalizedPosition = selectedOption.position / (answer.options!.length - 1)
      positions.push(normalizedPosition)
    }
  }

  if (positions.length < 5) {
    return 0
  }

  const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length

  const firstPositionCount = positions.filter(p => p === 0).length
  const lastPositionCount = positions.filter(p => p === 1).length

  const extremeBias = Math.max(firstPositionCount, lastPositionCount) / positions.length

  return Math.max(extremeBias, Math.abs(avgPosition - 0.5) * 2)
}

export { detectPositionBias }
```



# ═══════════════════════════════════════════════════════════════════════════════
# SPEEDING DETECTION
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const SPEEDING_THRESHOLDS = {
  MIN_SECONDS_PER_QUESTION: 2,
  MIN_SECONDS_PER_CHARACTER_READ: 0.05,
  MIN_TOTAL_COMPLETION_SECONDS: 30,
  WARNING_SPEED_MULTIPLIER: 0.5,
  CRITICAL_SPEED_MULTIPLIER: 0.25
} as const


interface QuestionTiming {
  questionId: string
  questionType: string
  textLength: number
  optionCount: number
  timeSpentMs: number
  expectedMinTimeMs: number
}


function calculateExpectedMinTime(
  questionType: string,
  textLength: number,
  optionCount: number
): number {
  const readingTimeMs = textLength * SPEEDING_THRESHOLDS.MIN_SECONDS_PER_CHARACTER_READ * 1000

  let answeringTimeMs = SPEEDING_THRESHOLDS.MIN_SECONDS_PER_QUESTION * 1000

  switch (questionType) {
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      answeringTimeMs += optionCount * 500
      break
    case "LIKERT":
    case "RATING":
    case "LINEAR_SCALE":
      answeringTimeMs += 1000
      break
    case "SHORT_TEXT":
      answeringTimeMs += 3000
      break
    case "LONG_TEXT":
      answeringTimeMs += 10000
      break
    case "MATRIX":
      answeringTimeMs += optionCount * 1500
      break
    case "RANKING":
      answeringTimeMs += optionCount * 1000
      break
  }

  return readingTimeMs + answeringTimeMs
}


function detectSpeeding(
  timings: QuestionTiming[],
  totalCompletionTimeMs: number
): PatternDetectionResult | null {
  if (timings.length < 3) {
    return null
  }

  const totalExpectedMinTime = timings.reduce((sum, t) => sum + t.expectedMinTimeMs, 0)
  const overallSpeedRatio = totalCompletionTimeMs / totalExpectedMinTime

  let speedingQuestions: string[] = []
  let severeSpeedingCount = 0

  for (const timing of timings) {
    const questionSpeedRatio = timing.timeSpentMs / timing.expectedMinTimeMs

    if (questionSpeedRatio < SPEEDING_THRESHOLDS.CRITICAL_SPEED_MULTIPLIER) {
      speedingQuestions.push(timing.questionId)
      severeSpeedingCount++
    } else if (questionSpeedRatio < SPEEDING_THRESHOLDS.WARNING_SPEED_MULTIPLIER) {
      speedingQuestions.push(timing.questionId)
    }
  }

  const speedingRatio = speedingQuestions.length / timings.length

  if (speedingRatio < 0.2 && overallSpeedRatio > SPEEDING_THRESHOLDS.WARNING_SPEED_MULTIPLIER) {
    return null
  }

  let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW"
  let score = 15

  if (overallSpeedRatio < SPEEDING_THRESHOLDS.CRITICAL_SPEED_MULTIPLIER || speedingRatio > 0.5) {
    severity = "CRITICAL"
    score = 45
  } else if (overallSpeedRatio < SPEEDING_THRESHOLDS.WARNING_SPEED_MULTIPLIER || speedingRatio > 0.3) {
    severity = "HIGH"
    score = 35
  } else if (speedingRatio > 0.2) {
    severity = "MEDIUM"
    score = 25
  }

  return {
    patternType: "SPEEDING",
    severity,
    confidence: Math.min(0.95, 0.5 + speedingRatio * 0.5),
    affectedQuestions: speedingQuestions,
    description: `Completed ${Math.round((1 - overallSpeedRatio) * 100)}% faster than expected minimum time`,
    score
  }
}

export {
  SPEEDING_THRESHOLDS,
  calculateExpectedMinTime,
  detectSpeeding
}
export type {
  QuestionTiming
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# TEXT QUALITY ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const TEXT_QUALITY_THRESHOLDS = {
  MIN_TEXT_LENGTH_FOR_ANALYSIS: 20,
  GIBBERISH_CONSONANT_RATIO: 0.75,
  GIBBERISH_VOWEL_RATIO: 0.15,
  MIN_WORD_LENGTH: 2,
  MAX_AVG_WORD_LENGTH: 15,
  REPEATED_CHAR_THRESHOLD: 4,
  KEYBOARD_SMASH_PATTERNS: ["asdf", "qwer", "zxcv", "hjkl", "uiop"]
} as const


function analyzeTextQuality(
  answers: Array<{
    questionId: string
    value: string
  }>
): PatternDetectionResult[] {
  const results: PatternDetectionResult[] = []

  const textAnswers = answers.filter(
    a => typeof a.value === "string" &&
         a.value.length >= TEXT_QUALITY_THRESHOLDS.MIN_TEXT_LENGTH_FOR_ANALYSIS
  )

  const gibberishQuestions: string[] = []

  for (const answer of textAnswers) {
    const text = answer.value.toLowerCase()

    const consonants = (text.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length
    const vowels = (text.match(/[aeiou]/g) || []).length
    const letters = consonants + vowels

    if (letters > 0) {
      const consonantRatio = consonants / letters
      const vowelRatio = vowels / letters

      if (consonantRatio > TEXT_QUALITY_THRESHOLDS.GIBBERISH_CONSONANT_RATIO ||
          vowelRatio < TEXT_QUALITY_THRESHOLDS.GIBBERISH_VOWEL_RATIO) {
        gibberishQuestions.push(answer.questionId)
        continue
      }
    }

    const words = text.split(/\s+/).filter(w => w.length > 0)
    if (words.length > 0) {
      const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length

      if (avgWordLength > TEXT_QUALITY_THRESHOLDS.MAX_AVG_WORD_LENGTH ||
          avgWordLength < TEXT_QUALITY_THRESHOLDS.MIN_WORD_LENGTH) {
        gibberishQuestions.push(answer.questionId)
        continue
      }
    }

    const repeatedChars = text.match(new RegExp(`(.)\\1{${TEXT_QUALITY_THRESHOLDS.REPEATED_CHAR_THRESHOLD},}`, "g"))
    if (repeatedChars && repeatedChars.length > 0) {
      gibberishQuestions.push(answer.questionId)
      continue
    }

    for (const pattern of TEXT_QUALITY_THRESHOLDS.KEYBOARD_SMASH_PATTERNS) {
      if (text.includes(pattern)) {
        gibberishQuestions.push(answer.questionId)
        break
      }
    }
  }

  if (gibberishQuestions.length > 0) {
    const ratio = gibberishQuestions.length / textAnswers.length

    let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW"
    let score = 15

    if (ratio > 0.5) {
      severity = "CRITICAL"
      score = 40
    } else if (ratio > 0.3) {
      severity = "HIGH"
      score = 30
    } else if (ratio > 0.1) {
      severity = "MEDIUM"
      score = 20
    }

    results.push({
      patternType: "GIBBERISH_TEXT",
      severity,
      confidence: 0.8,
      affectedQuestions: gibberishQuestions,
      description: `${gibberishQuestions.length} of ${textAnswers.length} text answers appear to be gibberish`,
      score
    })
  }

  return results
}

export {
  TEXT_QUALITY_THRESHOLDS,
  analyzeTextQuality
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# ATTENTION CHECK EVALUATION
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const AttentionCheckResultSchema = z.object({
  questionId: z.string(),
  checkType: z.enum([
    "INSTRUCTED_RESPONSE",
    "CONSISTENCY_CHECK",
    "REVERSED_ITEM",
    "OPEN_ENDED_TRAP",
    "TIME_TRAP"
  ]),
  passed: z.boolean(),
  expectedValue: z.unknown(),
  actualValue: z.unknown()
})

type AttentionCheckResult = z.infer<typeof AttentionCheckResultSchema>


function evaluateAttentionChecks(
  responses: Array<{
    questionId: string
    value: unknown
    timeSpentMs: number
  }>,
  attentionCheckConfig: Array<{
    questionId: string
    checkType: AttentionCheckResult["checkType"]
    expectedValue?: unknown
    relatedQuestionId?: string
    minTimeMs?: number
  }>
): PatternDetectionResult | null {
  const results: AttentionCheckResult[] = []

  for (const config of attentionCheckConfig) {
    const response = responses.find(r => r.questionId === config.questionId)
    if (!response) continue

    let passed = false

    switch (config.checkType) {
      case "INSTRUCTED_RESPONSE":
        passed = response.value === config.expectedValue
        break

      case "CONSISTENCY_CHECK":
        if (config.relatedQuestionId) {
          const relatedResponse = responses.find(r => r.questionId === config.relatedQuestionId)
          if (relatedResponse) {
            passed = response.value === relatedResponse.value
          }
        }
        break

      case "REVERSED_ITEM":
        if (config.relatedQuestionId) {
          const relatedResponse = responses.find(r => r.questionId === config.relatedQuestionId)
          if (relatedResponse && typeof response.value === "number" && typeof relatedResponse.value === "number") {
            const diff = Math.abs(response.value - relatedResponse.value)
            passed = diff >= 3
          }
        }
        break

      case "OPEN_ENDED_TRAP":
        if (typeof response.value === "string") {
          passed = response.value.toLowerCase().includes(String(config.expectedValue).toLowerCase())
        }
        break

      case "TIME_TRAP":
        if (config.minTimeMs) {
          passed = response.timeSpentMs >= config.minTimeMs
        }
        break
    }

    results.push({
      questionId: config.questionId,
      checkType: config.checkType,
      passed,
      expectedValue: config.expectedValue,
      actualValue: response.value
    })
  }

  if (results.length === 0) {
    return null
  }

  const failedChecks = results.filter(r => !r.passed)

  if (failedChecks.length === 0) {
    return null
  }

  const failureRate = failedChecks.length / results.length

  let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW"
  let score = 20

  if (failureRate >= 0.75) {
    severity = "CRITICAL"
    score = 50
  } else if (failureRate >= 0.5) {
    severity = "HIGH"
    score = 40
  } else if (failureRate >= 0.25) {
    severity = "MEDIUM"
    score = 30
  }

  return {
    patternType: "ATTENTION_CHECK_FAIL",
    severity,
    confidence: 0.95,
    affectedQuestions: failedChecks.map(c => c.questionId),
    description: `Failed ${failedChecks.length} of ${results.length} attention checks`,
    score
  }
}

export {
  AttentionCheckResultSchema,
  evaluateAttentionChecks
}
export type {
  AttentionCheckResult
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# PATTERN DETECTION TYPES
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const PatternTypeSchema = z.enum([
  "STRAIGHT_LINING",
  "DIAGONAL_LINING",
  "CHRISTMAS_TREE",
  "ZIGZAG",
  "RANDOM_CLICKING",
  "SPEEDING",
  "EXTREME_SLOWNESS",
  "GIBBERISH_TEXT",
  "COPY_PASTE_TEXT",
  "ATTENTION_CHECK_FAIL",
  "INCONSISTENT_ANSWERS",
  "REPEATED_PATTERNS"
])

const PatternDetectionResultSchema = z.object({
  patternType: PatternTypeSchema,
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  confidence: z.number().min(0).max(1),
  affectedQuestions: z.array(z.string()),
  description: z.string(),
  score: z.number().min(0).max(100)
})

const ResponsePatternAnalysisSchema = z.object({
  responseId: z.string().cuid(),
  totalScore: z.number().min(0).max(100),
  patterns: z.array(PatternDetectionResultSchema),
  recommendation: z.enum(["ACCEPT", "REVIEW", "REJECT"]),
  analyzedAt: z.date()
})

type PatternType = z.infer<typeof PatternTypeSchema>
type PatternDetectionResult = z.infer<typeof PatternDetectionResultSchema>
type ResponsePatternAnalysis = z.infer<typeof ResponsePatternAnalysisSchema>
```
