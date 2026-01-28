# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 19                                    █
# █        SURVEY & POLL METHODOLOGIES - ACADEMIC STANDARDS                    █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 19.1 ACADEMIC FOUNDATION & RESEARCH BASE
# ══════════════════════════════════════════════════════════════════════════════

## 19.1.1 Methodology Overview

This section defines academically-validated survey methodologies, question types,
scoring algorithms, and statistical analysis methods for VOXPOLL platform.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ACADEMIC SURVEY METHODOLOGY HIERARCHY                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TIER 1: PSYCHOMETRIC INSTRUMENTS                                   │   │
│  │  • Big Five (OCEAN) - Most scientifically validated                 │   │
│  │  • Validated Likert scales with proven reliability                  │   │
│  │  • Research-grade instruments (α > 0.80)                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TIER 2: INDUSTRY STANDARD METRICS                                  │   │
│  │  • NPS (Net Promoter Score) - Bain & Company standard               │   │
│  │  • CSAT (Customer Satisfaction) - Industry standard                 │   │
│  │  • CES (Customer Effort Score) - Gartner validated                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TIER 3: ADVANCED CHOICE METHODOLOGIES                              │   │
│  │  • MaxDiff (Best-Worst Scaling) - Academic gold standard            │   │
│  │  • Conjoint Analysis - Trade-off measurement                        │   │
│  │  • Ranked Choice Voting - Electoral science                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TIER 4: ENGAGEMENT-FOCUSED METHODS                                 │   │
│  │  • Character matching tests (entertainment focus)                   │   │
│  │  • Spectrum tests (simplified personality)                          │   │
│  │  • Quick polls (social engagement)                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 19.1.2 Key Academic References

```typescript
const ACADEMIC_REFERENCES = {
  LIKERT_SCALE: {
    originator: "Rensis Likert (1932)",
    publication: "A Technique for the Measurement of Attitudes",
    keyFindings: [
      "5-point scales most widely adopted for simplicity",
      "7-point scales provide finer granularity with equivalent validity",
      "Odd-numbered scales (5, 7) perform better than even-numbered"
    ],
    metaAnalysis: "2012-2021 review of 60 articles confirmed 7-point optimal"
  },

  BIG_FIVE_OCEAN: {
    model: "Five Factor Model (FFM)",
    developers: "Costa & McCrae (1992)",
    validation: "Most empirically validated personality model",
    reliability: "Cronbach's α typically 0.80-0.90",
    crossCultural: "Validated across 50+ cultures"
  },

  NET_PROMOTER_SCORE: {
    originator: "Fred Reichheld / Bain & Company (2003)",
    publication: "Harvard Business Review - 'One Number You Need to Grow'",
    validation: "Correlated with revenue growth across industries",
    adoption: "Used by 66% of Fortune 1000 companies"
  },

  MAXDIFF: {
    methodology: "Best-Worst Scaling",
    developers: "Louviere & Woodworth (1991)",
    advantage: "Eliminates scale-use bias, forces differentiation",
    mathematicalBasis: "Special case of choice-based conjoint analysis"
  },

  CUSTOMER_EFFORT_SCORE: {
    originator: "CEB (now Gartner) (2010)",
    publication: "Harvard Business Review - 'Stop Trying to Delight Your Customers'",
    finding: "Effort reduction 40% better predictor of loyalty than satisfaction"
  }
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 19.2 LIKERT SCALE SPECIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 19.2.1 Scale Type Definitions

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// LIKERT SCALE TYPE SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

type LikertScaleType =
  | "AGREEMENT_5"      // Strongly Disagree to Strongly Agree (5-point)
  | "AGREEMENT_7"      // Extended agreement scale (7-point)
  | "FREQUENCY_5"      // Never to Always (5-point)
  | "FREQUENCY_7"      // Extended frequency (7-point)
  | "SATISFACTION_5"   // Very Dissatisfied to Very Satisfied (5-point)
  | "SATISFACTION_7"   // Extended satisfaction (7-point)
  | "IMPORTANCE_5"     // Not Important to Very Important (5-point)
  | "LIKELIHOOD_5"     // Very Unlikely to Very Likely (5-point)
  | "QUALITY_5"        // Very Poor to Excellent (5-point)
  | "CUSTOM"           // User-defined labels

interface LikertScaleConfig {
  type: LikertScaleType
  points: 5 | 7
  labels: string[]
  numericValues: number[]
  includeNeutral: boolean
  neutralLabel: string | null
  reverseScored: boolean
}

// ══════════════════════════════════════════════════════════════════════════════
// STANDARD LIKERT SCALE DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

const LIKERT_SCALES: Record<LikertScaleType, LikertScaleConfig> = {
  AGREEMENT_5: {
    type: "AGREEMENT_5",
    points: 5,
    labels: [
      "Kesinlikle Katılmıyorum",
      "Katılmıyorum",
      "Kararsızım",
      "Katılıyorum",
      "Kesinlikle Katılıyorum"
    ],
    numericValues: [1, 2, 3, 4, 5],
    includeNeutral: true,
    neutralLabel: "Kararsızım",
    reverseScored: false
  },

  AGREEMENT_7: {
    type: "AGREEMENT_7",
    points: 7,
    labels: [
      "Kesinlikle Katılmıyorum",
      "Katılmıyorum",
      "Biraz Katılmıyorum",
      "Kararsızım",
      "Biraz Katılıyorum",
      "Katılıyorum",
      "Kesinlikle Katılıyorum"
    ],
    numericValues: [1, 2, 3, 4, 5, 6, 7],
    includeNeutral: true,
    neutralLabel: "Kararsızım",
    reverseScored: false
  },

  FREQUENCY_5: {
    type: "FREQUENCY_5",
    points: 5,
    labels: [
      "Hiçbir Zaman",
      "Nadiren",
      "Bazen",
      "Sık Sık",
      "Her Zaman"
    ],
    numericValues: [1, 2, 3, 4, 5],
    includeNeutral: true,
    neutralLabel: "Bazen",
    reverseScored: false
  },

  FREQUENCY_7: {
    type: "FREQUENCY_7",
    points: 7,
    labels: [
      "Hiçbir Zaman",
      "Çok Nadiren",
      "Nadiren",
      "Bazen",
      "Sık Sık",
      "Çok Sık",
      "Her Zaman"
    ],
    numericValues: [1, 2, 3, 4, 5, 6, 7],
    includeNeutral: true,
    neutralLabel: "Bazen",
    reverseScored: false
  },

  SATISFACTION_5: {
    type: "SATISFACTION_5",
    points: 5,
    labels: [
      "Çok Memnuniyetsiz",
      "Memnuniyetsiz",
      "Ne Memnun Ne Memnuniyetsiz",
      "Memnun",
      "Çok Memnun"
    ],
    numericValues: [1, 2, 3, 4, 5],
    includeNeutral: true,
    neutralLabel: "Ne Memnun Ne Memnuniyetsiz",
    reverseScored: false
  },

  SATISFACTION_7: {
    type: "SATISFACTION_7",
    points: 7,
    labels: [
      "Çok Memnuniyetsiz",
      "Memnuniyetsiz",
      "Biraz Memnuniyetsiz",
      "Nötr",
      "Biraz Memnun",
      "Memnun",
      "Çok Memnun"
    ],
    numericValues: [1, 2, 3, 4, 5, 6, 7],
    includeNeutral: true,
    neutralLabel: "Nötr",
    reverseScored: false
  },

  IMPORTANCE_5: {
    type: "IMPORTANCE_5",
    points: 5,
    labels: [
      "Hiç Önemli Değil",
      "Az Önemli",
      "Orta Derecede Önemli",
      "Önemli",
      "Çok Önemli"
    ],
    numericValues: [1, 2, 3, 4, 5],
    includeNeutral: true,
    neutralLabel: "Orta Derecede Önemli",
    reverseScored: false
  },

  LIKELIHOOD_5: {
    type: "LIKELIHOOD_5",
    points: 5,
    labels: [
      "Kesinlikle Olmaz",
      "Muhtemelen Olmaz",
      "Belki",
      "Muhtemelen Olur",
      "Kesinlikle Olur"
    ],
    numericValues: [1, 2, 3, 4, 5],
    includeNeutral: true,
    neutralLabel: "Belki",
    reverseScored: false
  },

  QUALITY_5: {
    type: "QUALITY_5",
    points: 5,
    labels: [
      "Çok Kötü",
      "Kötü",
      "Orta",
      "İyi",
      "Mükemmel"
    ],
    numericValues: [1, 2, 3, 4, 5],
    includeNeutral: true,
    neutralLabel: "Orta",
    reverseScored: false
  },

  CUSTOM: {
    type: "CUSTOM",
    points: 5,
    labels: [],
    numericValues: [],
    includeNeutral: false,
    neutralLabel: null,
    reverseScored: false
  }
}

export { LIKERT_SCALES }
export type { LikertScaleType, LikertScaleConfig }
```

## 19.2.2 Likert Scale Scoring Algorithm

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// LIKERT SCALE SCORING ENGINE
// ══════════════════════════════════════════════════════════════════════════════

interface LikertItem {
  questionId: string
  response: number
  scale: LikertScaleConfig
  isReverseCoded: boolean
  weight: number
}

interface LikertScoreResult {
  rawScore: number
  normalizedScore: number
  percentileScore: number
  interpretation: string
}

function reverseScore(value: number, scalePoints: number): number {
  return (scalePoints + 1) - value
}

function calculateLikertScore(items: LikertItem[]): LikertScoreResult {
  let totalWeightedScore = 0
  let totalWeight = 0
  const maxPossible = items.reduce((sum, item) =>
    sum + (item.scale.points * item.weight), 0)
  const minPossible = items.reduce((sum, item) => sum + item.weight, 0)

  for (const item of items) {
    let score = item.response

    if (item.isReverseCoded) {
      score = reverseScore(score, item.scale.points)
    }

    totalWeightedScore += score * item.weight
    totalWeight += item.weight
  }

  const rawScore = totalWeightedScore / totalWeight
  const normalizedScore = ((totalWeightedScore - minPossible) /
    (maxPossible - minPossible)) * 100

  return {
    rawScore: Math.round(rawScore * 100) / 100,
    normalizedScore: Math.round(normalizedScore * 100) / 100,
    percentileScore: 0,
    interpretation: interpretLikertScore(normalizedScore)
  }
}

function interpretLikertScore(normalizedScore: number): string {
  if (normalizedScore >= 80) return "Çok Yüksek"
  if (normalizedScore >= 60) return "Yüksek"
  if (normalizedScore >= 40) return "Orta"
  if (normalizedScore >= 20) return "Düşük"
  return "Çok Düşük"
}

export { calculateLikertScore, reverseScore }
export type { LikertItem, LikertScoreResult }
```

## 19.2.3 Scale Selection Guidelines

```typescript
const SCALE_SELECTION_GUIDE = {
  WHEN_TO_USE_5_POINT: {
    scenarios: [
      "Quick surveys (<10 questions)",
      "Mobile-first surveys",
      "General population research",
      "Customer feedback forms",
      "Employee pulse checks"
    ],
    advantages: [
      "Easier for respondents to differentiate options",
      "Higher completion rates",
      "Lower cognitive load",
      "Better for less educated populations"
    ]
  },

  WHEN_TO_USE_7_POINT: {
    scenarios: [
      "Academic research requiring precision",
      "Brand perception studies",
      "Psychological assessments",
      "When small opinion differences matter",
      "Longitudinal studies tracking change"
    ],
    advantages: [
      "Finer granularity in responses",
      "Better statistical discrimination",
      "More sensitive to attitude changes",
      "Preferred for factor analysis"
    ]
  },

  AVOID: {
    evenNumberedScales: "Forces choice when respondent may be genuinely neutral",
    scalesOver10Points: "Cognitive overload, unreliable differentiation",
    inconsistentScales: "Mixing different scale types within same survey"
  }
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 19.3 INDUSTRY STANDARD METRICS (NPS, CSAT, CES)
# ══════════════════════════════════════════════════════════════════════════════

## 19.3.1 Net Promoter Score (NPS)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// NET PROMOTER SCORE (NPS) - BAIN & COMPANY STANDARD
// ══════════════════════════════════════════════════════════════════════════════

interface NPSQuestion {
  type: "NPS"
  text: string
  scale: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  followUpQuestion: string | null
}

interface NPSResponse {
  score: number
  category: "DETRACTOR" | "PASSIVE" | "PROMOTER"
  followUpText: string | null
}

interface NPSResult {
  totalResponses: number
  promoters: { count: number, percentage: number }
  passives: { count: number, percentage: number }
  detractors: { count: number, percentage: number }
  npsScore: number
  interpretation: NPSInterpretation
  confidenceInterval: { lower: number, upper: number }
}

type NPSInterpretation =
  | "WORLD_CLASS"      // 70+
  | "EXCELLENT"        // 50-69
  | "GREAT"            // 30-49
  | "GOOD"             // 0-29
  | "NEEDS_IMPROVEMENT" // -100 to -1

const NPS_STANDARD_QUESTION = {
  en: "How likely are you to recommend [Company/Product] to a friend or colleague?",
  tr: "Bir arkadaşınıza veya meslektaşınıza [Şirket/Ürün]'ü tavsiye etme olasılığınız nedir?"
}

const NPS_FOLLOW_UP_QUESTIONS = {
  promoter: {
    en: "What do you love most about us?",
    tr: "En çok neyi beğendiniz?"
  },
  passive: {
    en: "What would make you rate us higher?",
    tr: "Puanınızı artırmamız için ne yapmalıyız?"
  },
  detractor: {
    en: "What went wrong?",
    tr: "Hangi konuda sizi hayal kırıklığına uğrattık?"
  }
}

function categorizeNPSResponse(score: number): "DETRACTOR" | "PASSIVE" | "PROMOTER" {
  if (score >= 9) return "PROMOTER"
  if (score >= 7) return "PASSIVE"
  return "DETRACTOR"
}

function calculateNPS(responses: number[]): NPSResult {
  const total = responses.length
  if (total === 0) {
    return {
      totalResponses: 0,
      promoters: { count: 0, percentage: 0 },
      passives: { count: 0, percentage: 0 },
      detractors: { count: 0, percentage: 0 },
      npsScore: 0,
      interpretation: "NEEDS_IMPROVEMENT",
      confidenceInterval: { lower: 0, upper: 0 }
    }
  }

  const categorized = responses.map(categorizeNPSResponse)

  const promoterCount = categorized.filter(c => c === "PROMOTER").length
  const passiveCount = categorized.filter(c => c === "PASSIVE").length
  const detractorCount = categorized.filter(c => c === "DETRACTOR").length

  const promoterPct = (promoterCount / total) * 100
  const passivePct = (passiveCount / total) * 100
  const detractorPct = (detractorCount / total) * 100

  const npsScore = Math.round(promoterPct - detractorPct)

  const marginOfError = calculateNPSMarginOfError(total, promoterPct, detractorPct)

  return {
    totalResponses: total,
    promoters: { count: promoterCount, percentage: Math.round(promoterPct * 10) / 10 },
    passives: { count: passiveCount, percentage: Math.round(passivePct * 10) / 10 },
    detractors: { count: detractorCount, percentage: Math.round(detractorPct * 10) / 10 },
    npsScore,
    interpretation: interpretNPS(npsScore),
    confidenceInterval: {
      lower: Math.max(-100, npsScore - marginOfError),
      upper: Math.min(100, npsScore + marginOfError)
    }
  }
}

function interpretNPS(score: number): NPSInterpretation {
  if (score >= 70) return "WORLD_CLASS"
  if (score >= 50) return "EXCELLENT"
  if (score >= 30) return "GREAT"
  if (score >= 0) return "GOOD"
  return "NEEDS_IMPROVEMENT"
}

function calculateNPSMarginOfError(
  n: number,
  promoterPct: number,
  detractorPct: number
): number {
  const pP = promoterPct / 100
  const pD = detractorPct / 100
  const variance = (pP * (1 - pP) + pD * (1 - pD) + 2 * pP * pD) / n
  const standardError = Math.sqrt(variance) * 100
  return Math.round(1.96 * standardError)
}

export { calculateNPS, categorizeNPSResponse, interpretNPS }
export type { NPSQuestion, NPSResponse, NPSResult, NPSInterpretation }
```

## 19.3.2 Customer Satisfaction Score (CSAT)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER SATISFACTION SCORE (CSAT) - INDUSTRY STANDARD
// ══════════════════════════════════════════════════════════════════════════════

type CSATScale = "SCALE_5" | "SCALE_7" | "SCALE_10"

interface CSATQuestion {
  type: "CSAT"
  text: string
  scale: CSATScale
  context: string
}

interface CSATResult {
  totalResponses: number
  satisfiedCount: number
  csatScore: number
  averageRating: number
  distribution: { rating: number, count: number, percentage: number }[]
  interpretation: CSATInterpretation
}

type CSATInterpretation =
  | "EXCEPTIONAL"     // 90%+
  | "EXCELLENT"       // 80-89%
  | "GOOD"            // 70-79%
  | "FAIR"            // 60-69%
  | "POOR"            // <60%

const CSAT_THRESHOLDS: Record<CSATScale, { satisfiedMin: number }> = {
  SCALE_5: { satisfiedMin: 4 },
  SCALE_7: { satisfiedMin: 5 },
  SCALE_10: { satisfiedMin: 7 }
}

const CSAT_STANDARD_QUESTIONS = {
  general: {
    en: "How satisfied are you with your experience?",
    tr: "Deneyiminizden ne kadar memnunsunuz?"
  },
  product: {
    en: "How satisfied are you with [Product]?",
    tr: "[Ürün]'den ne kadar memnunsunuz?"
  },
  service: {
    en: "How satisfied were you with the service you received?",
    tr: "Aldığınız hizmetten ne kadar memnun kaldınız?"
  },
  support: {
    en: "How satisfied are you with our support team?",
    tr: "Destek ekibimizden ne kadar memnunsunuz?"
  }
}

function calculateCSAT(responses: number[], scale: CSATScale): CSATResult {
  const total = responses.length
  if (total === 0) {
    return {
      totalResponses: 0,
      satisfiedCount: 0,
      csatScore: 0,
      averageRating: 0,
      distribution: [],
      interpretation: "POOR"
    }
  }

  const threshold = CSAT_THRESHOLDS[scale].satisfiedMin
  const maxScore = scale === "SCALE_5" ? 5 : scale === "SCALE_7" ? 7 : 10

  const satisfiedCount = responses.filter(r => r >= threshold).length
  const csatScore = Math.round((satisfiedCount / total) * 100)
  const averageRating = Math.round((responses.reduce((a, b) => a + b, 0) / total) * 100) / 100

  const distributionMap = new Map<number, number>()
  for (let i = 1; i <= maxScore; i++) {
    distributionMap.set(i, 0)
  }
  responses.forEach(r => {
    distributionMap.set(r, (distributionMap.get(r) || 0) + 1)
  })

  const distribution = Array.from(distributionMap.entries()).map(([rating, count]) => ({
    rating,
    count,
    percentage: Math.round((count / total) * 1000) / 10
  }))

  return {
    totalResponses: total,
    satisfiedCount,
    csatScore,
    averageRating,
    distribution,
    interpretation: interpretCSAT(csatScore)
  }
}

function interpretCSAT(score: number): CSATInterpretation {
  if (score >= 90) return "EXCEPTIONAL"
  if (score >= 80) return "EXCELLENT"
  if (score >= 70) return "GOOD"
  if (score >= 60) return "FAIR"
  return "POOR"
}

export { calculateCSAT, interpretCSAT, CSAT_STANDARD_QUESTIONS }
export type { CSATQuestion, CSATResult, CSATScale, CSATInterpretation }
```

## 19.3.3 Customer Effort Score (CES)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER EFFORT SCORE (CES) - GARTNER VALIDATED
// ══════════════════════════════════════════════════════════════════════════════

type CESScale = "SCALE_5" | "SCALE_7"

interface CESQuestion {
  type: "CES"
  text: string
  scale: CESScale
  context: "SUPPORT" | "PURCHASE" | "ONBOARDING" | "GENERAL"
}

interface CESResult {
  totalResponses: number
  averageScore: number
  lowEffortPercentage: number
  distribution: { score: number, count: number, percentage: number }[]
  interpretation: CESInterpretation
}

type CESInterpretation =
  | "EFFORTLESS"      // Avg 6+ (7-scale) or 4.5+ (5-scale)
  | "EASY"            // Avg 5-5.9 (7-scale) or 3.5-4.4 (5-scale)
  | "MODERATE"        // Avg 4-4.9 (7-scale) or 2.5-3.4 (5-scale)
  | "DIFFICULT"       // Avg <4 (7-scale) or <2.5 (5-scale)

const CES_LABELS: Record<CESScale, string[]> = {
  SCALE_5: [
    "Çok Zor",
    "Zor",
    "Ne Kolay Ne Zor",
    "Kolay",
    "Çok Kolay"
  ],
  SCALE_7: [
    "Kesinlikle Katılmıyorum",
    "Katılmıyorum",
    "Biraz Katılmıyorum",
    "Kararsızım",
    "Biraz Katılıyorum",
    "Katılıyorum",
    "Kesinlikle Katılıyorum"
  ]
}

const CES_STANDARD_QUESTIONS = {
  agreement: {
    en: "[Company] made it easy for me to handle my issue.",
    tr: "[Şirket] sorunumu çözmemi kolaylaştırdı."
  },
  effort: {
    en: "How easy was it to resolve your issue today?",
    tr: "Bugün sorununuzu çözmek ne kadar kolay oldu?"
  },
  interaction: {
    en: "How much effort did you have to put forth to handle your request?",
    tr: "Talebinizi halletmek için ne kadar çaba sarf ettiniz?"
  }
}

function calculateCES(responses: number[], scale: CESScale): CESResult {
  const total = responses.length
  if (total === 0) {
    return {
      totalResponses: 0,
      averageScore: 0,
      lowEffortPercentage: 0,
      distribution: [],
      interpretation: "DIFFICULT"
    }
  }

  const maxScore = scale === "SCALE_5" ? 5 : 7
  const lowEffortThreshold = scale === "SCALE_5" ? 4 : 5

  const sum = responses.reduce((a, b) => a + b, 0)
  const averageScore = Math.round((sum / total) * 100) / 100

  const lowEffortCount = responses.filter(r => r >= lowEffortThreshold).length
  const lowEffortPercentage = Math.round((lowEffortCount / total) * 100)

  const distributionMap = new Map<number, number>()
  for (let i = 1; i <= maxScore; i++) {
    distributionMap.set(i, 0)
  }
  responses.forEach(r => {
    distributionMap.set(r, (distributionMap.get(r) || 0) + 1)
  })

  const distribution = Array.from(distributionMap.entries()).map(([score, count]) => ({
    score,
    count,
    percentage: Math.round((count / total) * 1000) / 10
  }))

  return {
    totalResponses: total,
    averageScore,
    lowEffortPercentage,
    distribution,
    interpretation: interpretCES(averageScore, scale)
  }
}

function interpretCES(average: number, scale: CESScale): CESInterpretation {
  if (scale === "SCALE_7") {
    if (average >= 6) return "EFFORTLESS"
    if (average >= 5) return "EASY"
    if (average >= 4) return "MODERATE"
    return "DIFFICULT"
  } else {
    if (average >= 4.5) return "EFFORTLESS"
    if (average >= 3.5) return "EASY"
    if (average >= 2.5) return "MODERATE"
    return "DIFFICULT"
  }
}

export { calculateCES, interpretCES, CES_STANDARD_QUESTIONS, CES_LABELS }
export type { CESQuestion, CESResult, CESScale, CESInterpretation }
```

## 19.3.4 CX Metrics Comparison & Selection

```typescript
const CX_METRICS_COMPARISON = {
  NPS: {
    measures: "Overall loyalty and brand advocacy",
    timeframe: "Relationship/brand level (long-term)",
    bestFor: [
      "Brand health tracking",
      "Competitive benchmarking",
      "Executive reporting",
      "Correlation with revenue growth"
    ],
    limitations: [
      "Doesn't reveal specific issues",
      "Ignores passives in calculation",
      "Cultural variations in scoring"
    ],
    frequency: "Quarterly or bi-annually"
  },

  CSAT: {
    measures: "Satisfaction with specific interaction/product",
    timeframe: "Transactional (immediate)",
    bestFor: [
      "Post-purchase feedback",
      "Service interaction quality",
      "Product satisfaction",
      "Touchpoint optimization"
    ],
    limitations: [
      "Point-in-time snapshot only",
      "Doesn't predict retention",
      "Subject to recency bias"
    ],
    frequency: "After each interaction"
  },

  CES: {
    measures: "Ease of completing task/resolving issue",
    timeframe: "Transactional (process-focused)",
    bestFor: [
      "Support experience optimization",
      "Process friction identification",
      "Self-service effectiveness",
      "Onboarding experience"
    ],
    limitations: [
      "Limited to effort dimension",
      "Doesn't capture emotional satisfaction",
      "Context-dependent interpretation"
    ],
    frequency: "After support/process interactions"
  },

  RECOMMENDED_COMBINATION: {
    holistic: "NPS (quarterly) + CSAT (transactional) + CES (support)",
    minimal: "NPS (relationship) + CES (support)",
    reasoning: "NPS provides strategic view, CES/CSAT provide tactical improvement data"
  }
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 19.4 MAXDIFF (BEST-WORST SCALING)
# ══════════════════════════════════════════════════════════════════════════════

## 19.4.1 MaxDiff Methodology

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// MAXDIFF (BEST-WORST SCALING) - ACADEMIC GOLD STANDARD FOR PRIORITIZATION
// ══════════════════════════════════════════════════════════════════════════════

interface MaxDiffConfig {
  items: MaxDiffItem[]
  tasksPerRespondent: number
  itemsPerTask: number
  designType: "BALANCED_INCOMPLETE_BLOCK" | "RANDOM"
}

interface MaxDiffItem {
  id: string
  text: string
  category: string | null
}

interface MaxDiffTask {
  taskId: string
  items: MaxDiffItem[]
}

interface MaxDiffResponse {
  taskId: string
  bestItemId: string
  worstItemId: string
}

interface MaxDiffResult {
  items: MaxDiffItemScore[]
  rawCounts: { itemId: string, bestCount: number, worstCount: number }[]
  modelFit: number | null
}

interface MaxDiffItemScore {
  itemId: string
  text: string
  utilityScore: number
  rescaledScore: number
  rank: number
  bestCount: number
  worstCount: number
  bestWorstDiff: number
}

// ══════════════════════════════════════════════════════════════════════════════
// MAXDIFF DESIGN PARAMETERS
// ══════════════════════════════════════════════════════════════════════════════

const MAXDIFF_DESIGN_GUIDELINES = {
  itemCount: {
    minimum: 5,
    recommended: "12-25",
    maximum: 30,
    reasoning: "12-25 items provides optimal comparison opportunities"
  },

  itemsPerTask: {
    minimum: 3,
    recommended: 4,
    maximum: 5,
    reasoning: "4 items balances cognitive load with discrimination power"
  },

  tasksPerRespondent: {
    formula: "(items × 3) / itemsPerTask",
    minimum: 8,
    recommended: "10-15",
    maximum: 20,
    reasoning: "Each item should appear ~3 times for reliable estimation"
  },

  sampleSize: {
    minimum: 100,
    recommended: "200-300",
    forSegmentation: "300+ per segment",
    reasoning: "Hierarchical Bayes estimation requires adequate sample"
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAXDIFF TASK GENERATION (BALANCED INCOMPLETE BLOCK DESIGN)
// ══════════════════════════════════════════════════════════════════════════════

function generateMaxDiffTasks(config: MaxDiffConfig): MaxDiffTask[] {
  const { items, tasksPerRespondent, itemsPerTask } = config
  const tasks: MaxDiffTask[] = []

  const itemAppearances = new Map<string, number>()
  items.forEach(item => itemAppearances.set(item.id, 0))

  for (let t = 0; t < tasksPerRespondent; t++) {
    const sortedItems = [...items].sort((a, b) => {
      return (itemAppearances.get(a.id) || 0) - (itemAppearances.get(b.id) || 0)
    })

    const selectedItems = sortedItems.slice(0, itemsPerTask)

    for (let i = selectedItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedItems[i], selectedItems[j]] = [selectedItems[j], selectedItems[i]]
    }

    selectedItems.forEach(item => {
      itemAppearances.set(item.id, (itemAppearances.get(item.id) || 0) + 1)
    })

    tasks.push({
      taskId: `task_${t + 1}`,
      items: selectedItems
    })
  }

  return tasks
}

// ══════════════════════════════════════════════════════════════════════════════
// MAXDIFF SCORING (COUNT ANALYSIS METHOD)
// ══════════════════════════════════════════════════════════════════════════════

function calculateMaxDiffScores(
  items: MaxDiffItem[],
  responses: MaxDiffResponse[]
): MaxDiffResult {
  const counts = new Map<string, { best: number, worst: number, appearances: number }>()

  items.forEach(item => {
    counts.set(item.id, { best: 0, worst: 0, appearances: 0 })
  })

  responses.forEach(response => {
    const bestCounts = counts.get(response.bestItemId)
    const worstCounts = counts.get(response.worstItemId)

    if (bestCounts) bestCounts.best++
    if (worstCounts) worstCounts.worst++
  })

  const itemScores: MaxDiffItemScore[] = items.map(item => {
    const itemCounts = counts.get(item.id) || { best: 0, worst: 0, appearances: 0 }
    const bestWorstDiff = itemCounts.best - itemCounts.worst

    return {
      itemId: item.id,
      text: item.text,
      utilityScore: 0,
      rescaledScore: 0,
      rank: 0,
      bestCount: itemCounts.best,
      worstCount: itemCounts.worst,
      bestWorstDiff
    }
  })

  itemScores.sort((a, b) => b.bestWorstDiff - a.bestWorstDiff)

  const maxDiff = Math.max(...itemScores.map(s => s.bestWorstDiff))
  const minDiff = Math.min(...itemScores.map(s => s.bestWorstDiff))
  const range = maxDiff - minDiff || 1

  itemScores.forEach((score, index) => {
    score.rank = index + 1
    score.utilityScore = score.bestWorstDiff
    score.rescaledScore = Math.round(((score.bestWorstDiff - minDiff) / range) * 100)
  })

  return {
    items: itemScores,
    rawCounts: items.map(item => ({
      itemId: item.id,
      bestCount: counts.get(item.id)?.best || 0,
      worstCount: counts.get(item.id)?.worst || 0
    })),
    modelFit: null
  }
}

export { generateMaxDiffTasks, calculateMaxDiffScores, MAXDIFF_DESIGN_GUIDELINES }
export type { MaxDiffConfig, MaxDiffItem, MaxDiffTask, MaxDiffResponse, MaxDiffResult }
```

## 19.4.2 MaxDiff vs Traditional Ranking

```typescript
const MAXDIFF_VS_RANKING = {
  maxDiffAdvantages: [
    "Eliminates scale-use bias (no 'everything is important' problem)",
    "Lower cognitive burden than full ranking",
    "Provides metric-level data (distance between items)",
    "Works with more items (up to 30 vs 7-10 for ranking)",
    "Cross-cultural validity (forced choice is universal)"
  ],

  rankingAdvantages: [
    "Simpler to explain to respondents",
    "Faster for small item sets (<7 items)",
    "More intuitive results interpretation"
  ],

  whenToUseMaxDiff: [
    "Feature prioritization (12+ features)",
    "Brand attribute importance",
    "Message testing",
    "Product benefit ranking",
    "When precise importance scores needed"
  ],

  whenToUseRanking: [
    "Small item sets (3-7 items)",
    "Quick preference capture",
    "When order matters more than magnitude"
  ]
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 19.5 CONJOINT ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

## 19.5.1 Choice-Based Conjoint (CBC)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CHOICE-BASED CONJOINT ANALYSIS - TRADE-OFF MEASUREMENT
// ══════════════════════════════════════════════════════════════════════════════

interface ConjointAttribute {
  id: string
  name: string
  levels: ConjointLevel[]
}

interface ConjointLevel {
  id: string
  attributeId: string
  label: string
  value: string | number
}

interface ConjointProfile {
  profileId: string
  levels: { attributeId: string, levelId: string }[]
}

interface ConjointTask {
  taskId: string
  profiles: ConjointProfile[]
  includeNoneOption: boolean
}

interface ConjointResponse {
  taskId: string
  chosenProfileId: string | null
}

interface ConjointResult {
  attributeImportance: { attributeId: string, name: string, importance: number }[]
  partWorths: { levelId: string, attributeId: string, label: string, utility: number }[]
  simulatedShares: { profileId: string, share: number }[] | null
}

// ══════════════════════════════════════════════════════════════════════════════
// CONJOINT DESIGN PARAMETERS
// ══════════════════════════════════════════════════════════════════════════════

const CONJOINT_DESIGN_GUIDELINES = {
  attributeCount: {
    minimum: 3,
    recommended: "4-6",
    maximum: 8,
    reasoning: "Beyond 6, respondents use simplification strategies"
  },

  levelsPerAttribute: {
    minimum: 2,
    recommended: "3-5",
    maximum: 7,
    reasoning: "More levels = more profiles needed for estimation"
  },

  profilesPerTask: {
    minimum: 2,
    recommended: 3,
    maximum: 4,
    reasoning: "3 profiles balances discrimination with cognitive load"
  },

  tasksPerRespondent: {
    minimum: 8,
    recommended: "10-15",
    maximum: 20,
    reasoning: "More tasks improve estimation accuracy"
  },

  sampleSize: {
    perParameter: "50-100 responses per estimated parameter",
    minimum: 200,
    forSegmentation: "300+ per segment"
  },

  noneOption: {
    when: "When respondents might realistically choose no option",
    benefit: "Captures purchase probability, not just preference"
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SIMPLIFIED CONJOINT SCORING (COUNT-BASED)
// ══════════════════════════════════════════════════════════════════════════════

function calculateConjointImportance(
  attributes: ConjointAttribute[],
  tasks: ConjointTask[],
  responses: ConjointResponse[]
): ConjointResult {
  const levelChoiceCounts = new Map<string, number>()
  const levelAppearanceCounts = new Map<string, number>()

  attributes.forEach(attr => {
    attr.levels.forEach(level => {
      levelChoiceCounts.set(level.id, 0)
      levelAppearanceCounts.set(level.id, 0)
    })
  })

  responses.forEach(response => {
    const task = tasks.find(t => t.taskId === response.taskId)
    if (!task || !response.chosenProfileId) return

    task.profiles.forEach(profile => {
      profile.levels.forEach(({ levelId }) => {
        levelAppearanceCounts.set(
          levelId,
          (levelAppearanceCounts.get(levelId) || 0) + 1
        )
      })
    })

    const chosenProfile = task.profiles.find(p => p.profileId === response.chosenProfileId)
    if (chosenProfile) {
      chosenProfile.levels.forEach(({ levelId }) => {
        levelChoiceCounts.set(
          levelId,
          (levelChoiceCounts.get(levelId) || 0) + 1
        )
      })
    }
  })

  const partWorths: ConjointResult["partWorths"] = []
  const attributeRanges: { attributeId: string, range: number }[] = []

  attributes.forEach(attr => {
    const levelUtilities = attr.levels.map(level => {
      const choices = levelChoiceCounts.get(level.id) || 0
      const appearances = levelAppearanceCounts.get(level.id) || 1
      const utility = (choices / appearances) * 100

      partWorths.push({
        levelId: level.id,
        attributeId: attr.id,
        label: level.label,
        utility: Math.round(utility * 100) / 100
      })

      return utility
    })

    const range = Math.max(...levelUtilities) - Math.min(...levelUtilities)
    attributeRanges.push({ attributeId: attr.id, range })
  })

  const totalRange = attributeRanges.reduce((sum, a) => sum + a.range, 0) || 1

  const attributeImportance = attributeRanges.map(({ attributeId, range }) => {
    const attr = attributes.find(a => a.id === attributeId)!
    return {
      attributeId,
      name: attr.name,
      importance: Math.round((range / totalRange) * 1000) / 10
    }
  }).sort((a, b) => b.importance - a.importance)

  return {
    attributeImportance,
    partWorths,
    simulatedShares: null
  }
}

export { calculateConjointImportance, CONJOINT_DESIGN_GUIDELINES }
export type {
  ConjointAttribute, ConjointLevel, ConjointProfile,
  ConjointTask, ConjointResponse, ConjointResult
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 19.6 VOTING METHODOLOGIES
# ══════════════════════════════════════════════════════════════════════════════

## 19.6.1 Single Choice & Multiple Choice

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// BASIC POLL METHODOLOGIES
// ══════════════════════════════════════════════════════════════════════════════

interface SingleChoiceResult {
  totalVotes: number
  options: {
    optionId: string
    text: string
    voteCount: number
    percentage: number
    isWinner: boolean
  }[]
  winner: string | null
  isTied: boolean
  marginOfVictory: number
}

interface MultipleChoiceResult {
  totalResponses: number
  totalSelections: number
  averageSelectionsPerResponse: number
  options: {
    optionId: string
    text: string
    selectionCount: number
    selectionPercentage: number
    responsePercentage: number
  }[]
  topOptions: string[]
}

function calculateSingleChoice(
  votes: { optionId: string }[],
  options: { id: string, text: string }[]
): SingleChoiceResult {
  const total = votes.length
  const counts = new Map<string, number>()

  options.forEach(opt => counts.set(opt.id, 0))
  votes.forEach(vote => {
    counts.set(vote.optionId, (counts.get(vote.optionId) || 0) + 1)
  })

  const optionResults = options.map(opt => ({
    optionId: opt.id,
    text: opt.text,
    voteCount: counts.get(opt.id) || 0,
    percentage: total > 0 ? Math.round(((counts.get(opt.id) || 0) / total) * 1000) / 10 : 0,
    isWinner: false
  })).sort((a, b) => b.voteCount - a.voteCount)

  const maxVotes = optionResults[0]?.voteCount || 0
  const winners = optionResults.filter(o => o.voteCount === maxVotes)
  winners.forEach(w => w.isWinner = true)

  const secondPlace = optionResults.find(o => !o.isWinner)?.voteCount || 0
  const marginOfVictory = total > 0
    ? Math.round(((maxVotes - secondPlace) / total) * 1000) / 10
    : 0

  return {
    totalVotes: total,
    options: optionResults,
    winner: winners.length === 1 ? winners[0].optionId : null,
    isTied: winners.length > 1,
    marginOfVictory
  }
}

function calculateMultipleChoice(
  responses: { optionIds: string[] }[],
  options: { id: string, text: string }[]
): MultipleChoiceResult {
  const totalResponses = responses.length
  let totalSelections = 0
  const counts = new Map<string, number>()

  options.forEach(opt => counts.set(opt.id, 0))

  responses.forEach(response => {
    totalSelections += response.optionIds.length
    response.optionIds.forEach(optionId => {
      counts.set(optionId, (counts.get(optionId) || 0) + 1)
    })
  })

  const optionResults = options.map(opt => ({
    optionId: opt.id,
    text: opt.text,
    selectionCount: counts.get(opt.id) || 0,
    selectionPercentage: totalSelections > 0
      ? Math.round(((counts.get(opt.id) || 0) / totalSelections) * 1000) / 10
      : 0,
    responsePercentage: totalResponses > 0
      ? Math.round(((counts.get(opt.id) || 0) / totalResponses) * 1000) / 10
      : 0
  })).sort((a, b) => b.selectionCount - a.selectionCount)

  return {
    totalResponses,
    totalSelections,
    averageSelectionsPerResponse: totalResponses > 0
      ? Math.round((totalSelections / totalResponses) * 100) / 100
      : 0,
    options: optionResults,
    topOptions: optionResults.slice(0, 3).map(o => o.optionId)
  }
}

export { calculateSingleChoice, calculateMultipleChoice }
export type { SingleChoiceResult, MultipleChoiceResult }
```

## 19.6.2 Ranked Choice Voting (Instant Runoff)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RANKED CHOICE VOTING (INSTANT RUNOFF) - ELECTORAL SCIENCE STANDARD
// ══════════════════════════════════════════════════════════════════════════════

interface RankedChoiceBallot {
visitorId: string
  rankings: { optionId: string, rank: number }[]
}

interface RCVRound {
  roundNumber: number
  voteCounts: { optionId: string, votes: number, percentage: number }[]
  eliminated: string | null
  winner: string | null
}

interface RCVResult {
  totalBallots: number
  majorityThreshold: number
  rounds: RCVRound[]
  winner: string | null
  exhaustedBallots: number
  finalRoundVotes: number
}

function calculateRankedChoiceVoting(
  ballots: RankedChoiceBallot[],
  options: { id: string, text: string }[]
): RCVResult {
  const totalBallots = ballots.length
  const majorityThreshold = Math.floor(totalBallots / 2) + 1
  const rounds: RCVRound[] = []

  let activeCandidates = new Set(options.map(o => o.id))
  let currentBallots = ballots.map(b => ({
    ...b,
    activeRanking: [...b.rankings].sort((a, b) => a.rank - b.rank)
  }))
  let exhaustedCount = 0
  let roundNumber = 0

  while (activeCandidates.size > 1) {
    roundNumber++
    const voteCounts = new Map<string, number>()

    activeCandidates.forEach(id => voteCounts.set(id, 0))

    currentBallots.forEach(ballot => {
      const validChoices = ballot.activeRanking.filter(r => activeCandidates.has(r.optionId))
      if (validChoices.length > 0) {
        const firstChoice = validChoices[0].optionId
        voteCounts.set(firstChoice, (voteCounts.get(firstChoice) || 0) + 1)
      }
    })

    const activeVotes = Array.from(voteCounts.values()).reduce((a, b) => a + b, 0)

    const roundVoteCounts = Array.from(voteCounts.entries())
      .map(([optionId, votes]) => ({
        optionId,
        votes,
        percentage: activeVotes > 0 ? Math.round((votes / activeVotes) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.votes - a.votes)

    const leader = roundVoteCounts[0]
    if (leader && leader.votes >= majorityThreshold) {
      rounds.push({
        roundNumber,
        voteCounts: roundVoteCounts,
        eliminated: null,
        winner: leader.optionId
      })

      return {
        totalBallots,
        majorityThreshold,
        rounds,
        winner: leader.optionId,
        exhaustedBallots: totalBallots - activeVotes,
        finalRoundVotes: activeVotes
      }
    }

    const minVotes = Math.min(...roundVoteCounts.map(r => r.votes))
    const toEliminate = roundVoteCounts.filter(r => r.votes === minVotes)
    const eliminated = toEliminate[toEliminate.length - 1].optionId

    rounds.push({
      roundNumber,
      voteCounts: roundVoteCounts,
      eliminated,
      winner: null
    })

    activeCandidates.delete(eliminated)
  }

  const finalWinner = activeCandidates.values().next().value || null

  return {
    totalBallots,
    majorityThreshold,
    rounds,
    winner: finalWinner,
    exhaustedBallots: exhaustedCount,
    finalRoundVotes: totalBallots - exhaustedCount
  }
}

export { calculateRankedChoiceVoting }
export type { RankedChoiceBallot, RCVRound, RCVResult }
```

## 19.6.3 Approval Voting

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// APPROVAL VOTING - SOCIAL CHOICE THEORY VALIDATED
// ══════════════════════════════════════════════════════════════════════════════

interface ApprovalBallot {
  visitorId: string
  approvedOptions: string[]
}

interface ApprovalVotingResult {
  totalBallots: number
  options: {
    optionId: string
    text: string
    approvalCount: number
    approvalPercentage: number
    rank: number
  }[]
  winner: string | null
  isTied: boolean
  averageApprovalsPerBallot: number
}

function calculateApprovalVoting(
  ballots: ApprovalBallot[],
  options: { id: string, text: string }[]
): ApprovalVotingResult {
  const totalBallots = ballots.length
  const approvalCounts = new Map<string, number>()
  let totalApprovals = 0

  options.forEach(opt => approvalCounts.set(opt.id, 0))

  ballots.forEach(ballot => {
    totalApprovals += ballot.approvedOptions.length
    ballot.approvedOptions.forEach(optionId => {
      approvalCounts.set(optionId, (approvalCounts.get(optionId) || 0) + 1)
    })
  })

  const optionResults = options.map(opt => ({
    optionId: opt.id,
    text: opt.text,
    approvalCount: approvalCounts.get(opt.id) || 0,
    approvalPercentage: totalBallots > 0
      ? Math.round(((approvalCounts.get(opt.id) || 0) / totalBallots) * 1000) / 10
      : 0,
    rank: 0
  })).sort((a, b) => b.approvalCount - a.approvalCount)

  optionResults.forEach((opt, index) => {
    opt.rank = index + 1
  })

  const maxApprovals = optionResults[0]?.approvalCount || 0
  const winners = optionResults.filter(o => o.approvalCount === maxApprovals)

  return {
    totalBallots,
    options: optionResults,
    winner: winners.length === 1 ? winners[0].optionId : null,
    isTied: winners.length > 1,
    averageApprovalsPerBallot: totalBallots > 0
      ? Math.round((totalApprovals / totalBallots) * 100) / 100
      : 0
  }
}

export { calculateApprovalVoting }
export type { ApprovalBallot, ApprovalVotingResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 19.7 PERSONALITY TEST SCORING ALGORITHMS
# ══════════════════════════════════════════════════════════════════════════════

## 19.7.1 Big Five (OCEAN) Scoring

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// BIG FIVE (OCEAN) PERSONALITY MODEL - ACADEMIC GOLD STANDARD
// ══════════════════════════════════════════════════════════════════════════════

type BigFiveTrait =
  | "OPENNESS"          // Openness to Experience
  | "CONSCIENTIOUSNESS" // Conscientiousness
  | "EXTRAVERSION"      // Extraversion
  | "AGREEABLENESS"     // Agreeableness
  | "NEUROTICISM"       // Neuroticism (vs Emotional Stability)

interface BigFiveItem {
  itemId: string
  trait: BigFiveTrait
  text: string
  isReverseCoded: boolean
  facet: string | null
}

interface BigFiveResponse {
  itemId: string
  response: 1 | 2 | 3 | 4 | 5
}

interface BigFiveResult {
  traits: {
    trait: BigFiveTrait
    rawScore: number
    normalizedScore: number
    percentile: number
    interpretation: "VERY_LOW" | "LOW" | "AVERAGE" | "HIGH" | "VERY_HIGH"
    facetScores: { facet: string, score: number }[]
  }[]
  profileDescription: string
  reliability: number | null
}

const BIG_FIVE_TRAIT_INFO: Record<BigFiveTrait, {
  name: string
  nameTr: string
  lowDescription: string
  highDescription: string
  facets: string[]
}> = {
  OPENNESS: {
    name: "Openness to Experience",
    nameTr: "Deneyime Açıklık",
    lowDescription: "Pratik, geleneksel, tanıdık olana yönelik",
    highDescription: "Yaratıcı, meraklı, yeni fikirlere açık",
    facets: ["Imagination", "Artistic Interests", "Emotionality", "Adventurousness", "Intellect", "Liberalism"]
  },
  CONSCIENTIOUSNESS: {
    name: "Conscientiousness",
    nameTr: "Sorumluluk",
    lowDescription: "Esnek, spontan, düzensiz",
    highDescription: "Organize, disiplinli, hedefe yönelik",
    facets: ["Self-Efficacy", "Orderliness", "Dutifulness", "Achievement-Striving", "Self-Discipline", "Cautiousness"]
  },
  EXTRAVERSION: {
    name: "Extraversion",
    nameTr: "Dışadönüklük",
    lowDescription: "Sessiz, içe dönük, bağımsız",
    highDescription: "Sosyal, enerjik, konuşkan",
    facets: ["Friendliness", "Gregariousness", "Assertiveness", "Activity Level", "Excitement-Seeking", "Cheerfulness"]
  },
  AGREEABLENESS: {
    name: "Agreeableness",
    nameTr: "Uyumluluk",
    lowDescription: "Rekabetçi, şüpheci, doğrudan",
    highDescription: "İşbirlikçi, güvenilir, empatik",
    facets: ["Trust", "Morality", "Altruism", "Cooperation", "Modesty", "Sympathy"]
  },
  NEUROTICISM: {
    name: "Neuroticism",
    nameTr: "Nevrotiklik",
    lowDescription: "Sakin, duygusal olarak stabil, güvenli",
    highDescription: "Kaygılı, strese yatkın, hassas",
    facets: ["Anxiety", "Anger", "Depression", "Self-Consciousness", "Immoderation", "Vulnerability"]
  }
}

function calculateBigFiveScores(
  items: BigFiveItem[],
  responses: BigFiveResponse[]
): BigFiveResult {
  const responseMap = new Map(responses.map(r => [r.itemId, r.response]))

  const traitScores: Map<BigFiveTrait, number[]> = new Map()
  const facetScores: Map<string, number[]> = new Map()

  const traits: BigFiveTrait[] = [
    "OPENNESS", "CONSCIENTIOUSNESS", "EXTRAVERSION", "AGREEABLENESS", "NEUROTICISM"
  ]

  traits.forEach(trait => traitScores.set(trait, []))

  items.forEach(item => {
    const response = responseMap.get(item.itemId)
    if (response === undefined) return

    let score = response
    if (item.isReverseCoded) {
      score = 6 - response
    }

    traitScores.get(item.trait)?.push(score)

    if (item.facet) {
      if (!facetScores.has(`${item.trait}:${item.facet}`)) {
        facetScores.set(`${item.trait}:${item.facet}`, [])
      }
      facetScores.get(`${item.trait}:${item.facet}`)?.push(score)
    }
  })

  const results = traits.map(trait => {
    const scores = traitScores.get(trait) || []
    const rawScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 3

    const normalizedScore = ((rawScore - 1) / 4) * 100
    const percentile = normalizeToPercentile(normalizedScore)

    const traitInfo = BIG_FIVE_TRAIT_INFO[trait]
    const traitFacetScores = traitInfo.facets.map(facet => {
      const facetKey = `${trait}:${facet}`
      const fScores = facetScores.get(facetKey) || []
      const fScore = fScores.length > 0
        ? fScores.reduce((a, b) => a + b, 0) / fScores.length
        : 3
      return { facet, score: Math.round(((fScore - 1) / 4) * 100) }
    })

    return {
      trait,
      rawScore: Math.round(rawScore * 100) / 100,
      normalizedScore: Math.round(normalizedScore),
      percentile,
      interpretation: interpretBigFiveScore(normalizedScore),
      facetScores: traitFacetScores
    }
  })

  return {
    traits: results,
    profileDescription: generateBigFiveProfile(results),
    reliability: null
  }
}

function interpretBigFiveScore(
  normalizedScore: number
): "VERY_LOW" | "LOW" | "AVERAGE" | "HIGH" | "VERY_HIGH" {
  if (normalizedScore >= 80) return "VERY_HIGH"
  if (normalizedScore >= 60) return "HIGH"
  if (normalizedScore >= 40) return "AVERAGE"
  if (normalizedScore >= 20) return "LOW"
  return "VERY_LOW"
}

function normalizeToPercentile(normalizedScore: number): number {
  return Math.round(normalizedScore)
}

function generateBigFiveProfile(
  results: BigFiveResult["traits"]
): string {
  const highTraits = results.filter(r => r.interpretation === "HIGH" || r.interpretation === "VERY_HIGH")
  const lowTraits = results.filter(r => r.interpretation === "LOW" || r.interpretation === "VERY_LOW")

  let description = ""

  if (highTraits.length > 0) {
    const highNames = highTraits.map(t => BIG_FIVE_TRAIT_INFO[t.trait].nameTr)
    description += `Yüksek ${highNames.join(", ")} özellikleri gösteriyorsunuz. `
  }

  if (lowTraits.length > 0) {
    const lowNames = lowTraits.map(t => BIG_FIVE_TRAIT_INFO[t.trait].nameTr)
    description += `Düşük ${lowNames.join(", ")} özellikleri gösteriyorsunuz.`
  }

  return description.trim() || "Ortalama bir kişilik profili sergiliyorsunuz."
}

export { calculateBigFiveScores, BIG_FIVE_TRAIT_INFO }
export type { BigFiveTrait, BigFiveItem, BigFiveResponse, BigFiveResult }
```

## 19.7.2 MBTI-Style Axis Scoring

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// MBTI-STYLE DICHOTOMY SCORING
// ══════════════════════════════════════════════════════════════════════════════

type MBTIDimension = "EI" | "SN" | "TF" | "JP"

interface MBTIItem {
  itemId: string
  dimension: MBTIDimension
  polarity: "POSITIVE" | "NEGATIVE"
  text: string
}

interface MBTIResponse {
  itemId: string
  response: 1 | 2 | 3 | 4 | 5
}

interface MBTIResult {
  type: string
  dimensions: {
    dimension: MBTIDimension
    leftPole: string
    rightPole: string
    leftScore: number
    rightScore: number
    dominantPole: string
    clarity: number
  }[]
  description: string
}

const MBTI_DIMENSIONS: Record<MBTIDimension, { left: string, right: string, leftCode: string, rightCode: string }> = {
  EI: { left: "Extraversion", right: "Introversion", leftCode: "E", rightCode: "I" },
  SN: { left: "Sensing", right: "Intuition", leftCode: "S", rightCode: "N" },
  TF: { left: "Thinking", right: "Feeling", leftCode: "T", rightCode: "F" },
  JP: { left: "Judging", right: "Perceiving", leftCode: "J", rightCode: "P" }
}

function calculateMBTIScores(
  items: MBTIItem[],
  responses: MBTIResponse[]
): MBTIResult {
  const responseMap = new Map(responses.map(r => [r.itemId, r.response]))

  const dimensionScores: Map<MBTIDimension, { positive: number[], negative: number[] }> = new Map()

  const dimensions: MBTIDimension[] = ["EI", "SN", "TF", "JP"]
  dimensions.forEach(dim => {
    dimensionScores.set(dim, { positive: [], negative: [] })
  })

  items.forEach(item => {
    const response = responseMap.get(item.itemId)
    if (response === undefined) return

    const scores = dimensionScores.get(item.dimension)
    if (!scores) return

    if (item.polarity === "POSITIVE") {
      scores.positive.push(response)
    } else {
      scores.negative.push(response)
    }
  })

  let typeCode = ""
  const dimensionResults = dimensions.map(dimension => {
    const scores = dimensionScores.get(dimension)!
    const dimInfo = MBTI_DIMENSIONS[dimension]

    const positiveAvg = scores.positive.length > 0
      ? scores.positive.reduce((a, b) => a + b, 0) / scores.positive.length
      : 3
    const negativeAvg = scores.negative.length > 0
      ? scores.negative.reduce((a, b) => a + b, 0) / scores.negative.length
      : 3

    const leftScore = Math.round(((positiveAvg - 1) / 4) * 100)
    const rightScore = 100 - leftScore

    const dominantPole = leftScore >= 50 ? dimInfo.leftCode : dimInfo.rightCode
    const clarity = Math.abs(leftScore - 50)

    typeCode += dominantPole

    return {
      dimension,
      leftPole: dimInfo.left,
      rightPole: dimInfo.right,
      leftScore,
      rightScore,
      dominantPole,
      clarity
    }
  })

  return {
    type: typeCode,
    dimensions: dimensionResults,
    description: getMBTIDescription(typeCode)
  }
}

function getMBTIDescription(type: string): string {
  const descriptions: Record<string, string> = {
    "INTJ": "Stratejist - Bağımsız, stratejik düşünen, kararlı",
    "INTP": "Mantıkçı - Analitik, yaratıcı, teorik",
    "ENTJ": "Komutan - Lider, stratejik, kararlı",
    "ENTP": "Tartışmacı - Yaratıcı, zeki, meydan okuyucu",
    "INFJ": "Savunucu - İdealist, prensipli, karmaşık",
    "INFP": "Arabulucu - İdealist, empatik, yaratıcı",
    "ENFJ": "Kahraman - Karizmatik, empatik, lider",
    "ENFP": "Aktivist - Coşkulu, yaratıcı, sosyal",
    "ISTJ": "Lojistikçi - Güvenilir, pratik, gerçekçi",
    "ISFJ": "Savunucu - Koruyucu, destekleyici, güvenilir",
    "ESTJ": "Yönetici - Organize, mantıklı, assertif",
    "ESFJ": "Danışman - Özenli, sosyal, geleneksel",
    "ISTP": "Usta - Pratik, gözlemci, analitik",
    "ISFP": "Maceracı - Esnek, çekici, hassas",
    "ESTP": "Girişimci - Enerjik, algılayıcı, doğrudan",
    "ESFP": "Şovmen - Spontan, enerjik, eğlenceli"
  }

  return descriptions[type] || "Benzersiz kişilik profili"
}

export { calculateMBTIScores, MBTI_DIMENSIONS }
export type { MBTIDimension, MBTIItem, MBTIResponse, MBTIResult }
```

## 19.7.3 Character Matching Algorithm

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CHARACTER MATCHING ALGORITHM - ENTERTAINMENT PERSONALITY TESTS
// ══════════════════════════════════════════════════════════════════════════════

interface Character {
  id: string
  name: string
  description: string
  traitWeights: Map<string, number>
  imageUrl: string
}

interface CharacterMatchItem {
  itemId: string
  text: string
  options: {
    optionId: string
    text: string
    traitImpacts: { traitId: string, weight: number }[]
  }[]
}

interface CharacterMatchResponse {
  itemId: string
  selectedOptionId: string
}

interface CharacterMatchResult {
  primaryMatch: {
    character: Character
    matchPercentage: number
  }
  secondaryMatches: {
    character: Character
    matchPercentage: number
  }[]
  traitScores: { traitId: string, score: number }[]
}

function calculateCharacterMatch(
  characters: Character[],
  items: CharacterMatchItem[],
  responses: CharacterMatchResponse[]
): CharacterMatchResult {
  const traitScores = new Map<string, number>()

  responses.forEach(response => {
    const item = items.find(i => i.itemId === response.itemId)
    if (!item) return

    const selectedOption = item.options.find(o => o.optionId === response.selectedOptionId)
    if (!selectedOption) return

    selectedOption.traitImpacts.forEach(({ traitId, weight }) => {
      traitScores.set(traitId, (traitScores.get(traitId) || 0) + weight)
    })
  })

  const maxTraitValue = Math.max(...Array.from(traitScores.values()), 1)
  const normalizedTraits = new Map<string, number>()
  traitScores.forEach((value, key) => {
    normalizedTraits.set(key, (value / maxTraitValue) * 100)
  })

  const characterScores = characters.map(character => {
    let matchScore = 0
    let totalWeight = 0

    character.traitWeights.forEach((weight, traitId) => {
      const userScore = normalizedTraits.get(traitId) || 0
      const characterScore = weight

      const similarity = 100 - Math.abs(userScore - characterScore)
      matchScore += similarity * (weight / 100)
      totalWeight += weight / 100
    })

    const finalScore = totalWeight > 0 ? matchScore / totalWeight : 0

    return {
      character,
      matchPercentage: Math.round(finalScore)
    }
  }).sort((a, b) => b.matchPercentage - a.matchPercentage)

  return {
    primaryMatch: characterScores[0],
    secondaryMatches: characterScores.slice(1, 4),
    traitScores: Array.from(normalizedTraits.entries()).map(([traitId, score]) => ({
      traitId,
      score: Math.round(score)
    }))
  }
}

export { calculateCharacterMatch }
export type { Character, CharacterMatchItem, CharacterMatchResponse, CharacterMatchResult }
```

## 19.7.4 Spectrum (Single Dimension) Scoring

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SPECTRUM SCORING - SINGLE DIMENSION PERCENTAGE SCALE
// ══════════════════════════════════════════════════════════════════════════════

interface SpectrumConfig {
  leftLabel: string
  rightLabel: string
  segments: SpectrumSegment[]
}

interface SpectrumSegment {
  id: string
  name: string
  description: string
  minPercentage: number
  maxPercentage: number
}

interface SpectrumItem {
  itemId: string
  text: string
  leftWeight: number
  rightWeight: number
}

interface SpectrumResponse {
  itemId: string
  response: number
}

interface SpectrumResult {
  percentage: number
  segment: SpectrumSegment
  leftLabel: string
  rightLabel: string
  interpretation: string
}

function calculateSpectrumScore(
  config: SpectrumConfig,
  items: SpectrumItem[],
  responses: SpectrumResponse[]
): SpectrumResult {
  const responseMap = new Map(responses.map(r => [r.itemId, r.response]))

  let totalLeftWeight = 0
  let totalRightWeight = 0
  let weightedSum = 0
  let totalWeight = 0

  items.forEach(item => {
    const response = responseMap.get(item.itemId)
    if (response === undefined) return

    const normalizedResponse = (response - 1) / 4

    const itemWeight = item.leftWeight + item.rightWeight
    const rightContribution = normalizedResponse * item.rightWeight
    const leftContribution = (1 - normalizedResponse) * item.leftWeight

    weightedSum += (rightContribution - leftContribution + item.leftWeight)
    totalWeight += itemWeight
  })

  const percentage = totalWeight > 0
    ? Math.round((weightedSum / totalWeight) * 100)
    : 50

  const segment = config.segments.find(
    s => percentage >= s.minPercentage && percentage <= s.maxPercentage
  ) || config.segments[Math.floor(config.segments.length / 2)]

  return {
    percentage,
    segment,
    leftLabel: config.leftLabel,
    rightLabel: config.rightLabel,
    interpretation: segment.description
  }
}

export { calculateSpectrumScore }
export type { SpectrumConfig, SpectrumSegment, SpectrumItem, SpectrumResponse, SpectrumResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 19.8 STATISTICAL ANALYSIS UTILITIES
# ══════════════════════════════════════════════════════════════════════════════

## 19.8.1 Descriptive Statistics

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DESCRIPTIVE STATISTICS ENGINE
// ══════════════════════════════════════════════════════════════════════════════

interface DescriptiveStats {
  count: number
  sum: number
  mean: number
  median: number
  mode: number[]
  min: number
  max: number
  range: number
  variance: number
  standardDeviation: number
  skewness: number
  kurtosis: number
}

function calculateDescriptiveStats(data: number[]): DescriptiveStats {
  const n = data.length
  if (n === 0) {
    return {
      count: 0, sum: 0, mean: 0, median: 0, mode: [], min: 0, max: 0,
      range: 0, variance: 0, standardDeviation: 0, skewness: 0, kurtosis: 0
    }
  }

  const sorted = [...data].sort((a, b) => a - b)
  const sum = data.reduce((a, b) => a + b, 0)
  const mean = sum / n
  const min = sorted[0]
  const max = sorted[n - 1]

  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)]

  const frequency = new Map<number, number>()
  data.forEach(v => frequency.set(v, (frequency.get(v) || 0) + 1))
  const maxFreq = Math.max(...frequency.values())
  const mode = Array.from(frequency.entries())
    .filter(([_, freq]) => freq === maxFreq)
    .map(([value, _]) => value)

  const squaredDiffs = data.map(v => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (n - 1)
  const standardDeviation = Math.sqrt(variance)

  const cubedDiffs = data.map(v => Math.pow((v - mean) / standardDeviation, 3))
  const skewness = cubedDiffs.reduce((a, b) => a + b, 0) / n

  const fourthDiffs = data.map(v => Math.pow((v - mean) / standardDeviation, 4))
  const kurtosis = fourthDiffs.reduce((a, b) => a + b, 0) / n - 3

  return {
    count: n,
    sum: Math.round(sum * 1000) / 1000,
    mean: Math.round(mean * 1000) / 1000,
    median: Math.round(median * 1000) / 1000,
    mode,
    min,
    max,
    range: max - min,
    variance: Math.round(variance * 1000) / 1000,
    standardDeviation: Math.round(standardDeviation * 1000) / 1000,
    skewness: Math.round(skewness * 1000) / 1000,
    kurtosis: Math.round(kurtosis * 1000) / 1000
  }
}

export { calculateDescriptiveStats }
export type { DescriptiveStats }
```

## 19.8.2 Confidence Intervals

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CONFIDENCE INTERVAL CALCULATIONS
// ══════════════════════════════════════════════════════════════════════════════

type ConfidenceLevel = 0.90 | 0.95 | 0.99

interface ConfidenceInterval {
  point: number
  lower: number
  upper: number
  marginOfError: number
  confidenceLevel: ConfidenceLevel
}

const Z_SCORES: Record<ConfidenceLevel, number> = {
  0.90: 1.645,
  0.95: 1.96,
  0.99: 2.576
}

function calculateMeanCI(
  data: number[],
  confidenceLevel: ConfidenceLevel = 0.95
): ConfidenceInterval {
  const n = data.length
  if (n === 0) {
    return { point: 0, lower: 0, upper: 0, marginOfError: 0, confidenceLevel }
  }

  const mean = data.reduce((a, b) => a + b, 0) / n
  const variance = data.map(v => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) / (n - 1)
  const standardError = Math.sqrt(variance / n)

  const z = Z_SCORES[confidenceLevel]
  const marginOfError = z * standardError

  return {
    point: Math.round(mean * 1000) / 1000,
    lower: Math.round((mean - marginOfError) * 1000) / 1000,
    upper: Math.round((mean + marginOfError) * 1000) / 1000,
    marginOfError: Math.round(marginOfError * 1000) / 1000,
    confidenceLevel
  }
}

function calculateProportionCI(
  successes: number,
  total: number,
  confidenceLevel: ConfidenceLevel = 0.95
): ConfidenceInterval {
  if (total === 0) {
    return { point: 0, lower: 0, upper: 0, marginOfError: 0, confidenceLevel }
  }

  const p = successes / total
  const z = Z_SCORES[confidenceLevel]
  const standardError = Math.sqrt((p * (1 - p)) / total)
  const marginOfError = z * standardError

  return {
    point: Math.round(p * 1000) / 10,
    lower: Math.max(0, Math.round((p - marginOfError) * 1000) / 10),
    upper: Math.min(100, Math.round((p + marginOfError) * 1000) / 10),
    marginOfError: Math.round(marginOfError * 1000) / 10,
    confidenceLevel
  }
}

export { calculateMeanCI, calculateProportionCI, Z_SCORES }
export type { ConfidenceInterval, ConfidenceLevel }
```

## 19.8.3 Sample Size Calculator

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SAMPLE SIZE CALCULATIONS
// ══════════════════════════════════════════════════════════════════════════════

interface SampleSizeParams {
  populationSize: number | null
  confidenceLevel: ConfidenceLevel
  marginOfError: number
  expectedProportion: number
}

interface SampleSizeResult {
  requiredSample: number
  adjustedForPopulation: number | null
  effectiveMarginOfError: number
}

function calculateRequiredSampleSize(params: SampleSizeParams): SampleSizeResult {
  const { populationSize, confidenceLevel, marginOfError, expectedProportion } = params

  const z = Z_SCORES[confidenceLevel]
  const p = expectedProportion
  const e = marginOfError / 100

  const n0 = Math.ceil((z * z * p * (1 - p)) / (e * e))

  let adjustedN: number | null = null
  if (populationSize !== null && populationSize > 0) {
    adjustedN = Math.ceil(n0 / (1 + ((n0 - 1) / populationSize)))
  }

  const effectiveME = Math.round(z * Math.sqrt((p * (1 - p)) / n0) * 1000) / 10

  return {
    requiredSample: n0,
    adjustedForPopulation: adjustedN,
    effectiveMarginOfError: effectiveME
  }
}

const SAMPLE_SIZE_GUIDELINES = {
  minimumForStatistics: 30,
  recommendedForSurveys: 100,
  minimumForSegmentation: 50,
  recommendedPerSegment: 100,
  forMaxDiff: 200,
  forConjoint: 300,
  forFactorAnalysis: 300
}

export { calculateRequiredSampleSize, SAMPLE_SIZE_GUIDELINES }
export type { SampleSizeParams, SampleSizeResult }
```

## 19.8.4 Reliability Calculations (Cronbach's Alpha)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RELIABILITY ANALYSIS (CRONBACH'S ALPHA)
// ══════════════════════════════════════════════════════════════════════════════

interface ReliabilityResult {
  cronbachAlpha: number
  interpretation: "UNACCEPTABLE" | "POOR" | "QUESTIONABLE" | "ACCEPTABLE" | "GOOD" | "EXCELLENT"
  itemAnalysis: {
    itemId: string
    itemTotalCorrelation: number
    alphaIfDeleted: number
    shouldConsiderRemoving: boolean
  }[]
}

function calculateCronbachAlpha(
  responses: Map<string, number[]>
): ReliabilityResult {
  const itemIds = Array.from(responses.keys())
  const k = itemIds.length

  if (k < 2) {
    return {
      cronbachAlpha: 0,
      interpretation: "UNACCEPTABLE",
      itemAnalysis: []
    }
  }

  const n = responses.get(itemIds[0])?.length || 0
  if (n < 2) {
    return {
      cronbachAlpha: 0,
      interpretation: "UNACCEPTABLE",
      itemAnalysis: []
    }
  }

  const itemVariances = itemIds.map(itemId => {
    const scores = responses.get(itemId) || []
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    return scores.map(s => Math.pow(s - mean, 2)).reduce((a, b) => a + b, 0) / (scores.length - 1)
  })
  const sumItemVariances = itemVariances.reduce((a, b) => a + b, 0)

  const totalScores = Array(n).fill(0)
  itemIds.forEach(itemId => {
    const scores = responses.get(itemId) || []
    scores.forEach((score, i) => {
      totalScores[i] += score
    })
  })
  const totalMean = totalScores.reduce((a, b) => a + b, 0) / n
  const totalVariance = totalScores.map(s => Math.pow(s - totalMean, 2)).reduce((a, b) => a + b, 0) / (n - 1)

  const alpha = (k / (k - 1)) * (1 - sumItemVariances / totalVariance)

  const itemAnalysis = itemIds.map((itemId, index) => {
    const kReduced = k - 1
    const reducedSumVariances = sumItemVariances - itemVariances[index]

    const reducedTotalScores = totalScores.map((total, i) => {
      const itemScores = responses.get(itemId) || []
      return total - (itemScores[i] || 0)
    })
    const reducedMean = reducedTotalScores.reduce((a, b) => a + b, 0) / n
    const reducedVariance = reducedTotalScores.map(s => Math.pow(s - reducedMean, 2)).reduce((a, b) => a + b, 0) / (n - 1)

    const alphaIfDeleted = kReduced > 1
      ? (kReduced / (kReduced - 1)) * (1 - reducedSumVariances / reducedVariance)
      : 0

    const itemScores = responses.get(itemId) || []
    const itemMean = itemScores.reduce((a, b) => a + b, 0) / n
    const covariance = itemScores.map((s, i) => (s - itemMean) * (totalScores[i] - totalMean)).reduce((a, b) => a + b, 0) / (n - 1)
    const itemSD = Math.sqrt(itemVariances[index])
    const totalSD = Math.sqrt(totalVariance)
    const itemTotalCorrelation = itemSD > 0 && totalSD > 0 ? covariance / (itemSD * totalSD) : 0

    return {
      itemId,
      itemTotalCorrelation: Math.round(itemTotalCorrelation * 1000) / 1000,
      alphaIfDeleted: Math.round(alphaIfDeleted * 1000) / 1000,
      shouldConsiderRemoving: alphaIfDeleted > alpha + 0.05 || itemTotalCorrelation < 0.3
    }
  })

  return {
    cronbachAlpha: Math.round(alpha * 1000) / 1000,
    interpretation: interpretAlpha(alpha),
    itemAnalysis
  }
}

function interpretAlpha(alpha: number): ReliabilityResult["interpretation"] {
  if (alpha >= 0.9) return "EXCELLENT"
  if (alpha >= 0.8) return "GOOD"
  if (alpha >= 0.7) return "ACCEPTABLE"
  if (alpha >= 0.6) return "QUESTIONABLE"
  if (alpha >= 0.5) return "POOR"
  return "UNACCEPTABLE"
}

export { calculateCronbachAlpha, interpretAlpha }
export type { ReliabilityResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 19.9 RESPONSE WEIGHTING & BIAS CORRECTION
# ══════════════════════════════════════════════════════════════════════════════

## 19.9.1 Post-Stratification Weighting

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// POST-STRATIFICATION WEIGHTING - GALLUP/PEW METHODOLOGY
// ══════════════════════════════════════════════════════════════════════════════

interface PopulationTarget {
  dimension: string
  categories: { value: string, targetPercentage: number }[]
}

interface WeightedResponse {
  responseId: string
  originalWeight: number
  adjustedWeight: number
  demographicValues: Map<string, string>
}

interface WeightingResult {
  responses: WeightedResponse[]
  weightingSummary: {
    dimension: string
    categories: {
      value: string
      sampleCount: number
      samplePercentage: number
      targetPercentage: number
      weightFactor: number
    }[]
  }[]
  designEffect: number
  effectiveSampleSize: number
}

function calculatePostStratificationWeights(
  responses: { responseId: string, demographics: Map<string, string> }[],
  targets: PopulationTarget[]
): WeightingResult {
  const n = responses.length

  const weights = new Map<string, number>()
  responses.forEach(r => weights.set(r.responseId, 1.0))

  const summaries: WeightingResult["weightingSummary"] = []

  targets.forEach(target => {
    const categoryCounts = new Map<string, number>()
    target.categories.forEach(cat => categoryCounts.set(cat.value, 0))

    responses.forEach(response => {
      const value = response.demographics.get(target.dimension)
      if (value && categoryCounts.has(value)) {
        categoryCounts.set(value, (categoryCounts.get(value) || 0) + 1)
      }
    })

    const categoryDetails = target.categories.map(cat => {
      const count = categoryCounts.get(cat.value) || 0
      const samplePct = n > 0 ? (count / n) * 100 : 0
      const weightFactor = samplePct > 0 ? cat.targetPercentage / samplePct : 1

      return {
        value: cat.value,
        sampleCount: count,
        samplePercentage: Math.round(samplePct * 10) / 10,
        targetPercentage: cat.targetPercentage,
        weightFactor: Math.round(weightFactor * 1000) / 1000
      }
    })

    responses.forEach(response => {
      const value = response.demographics.get(target.dimension)
      const catDetail = categoryDetails.find(c => c.value === value)
      if (catDetail) {
        const currentWeight = weights.get(response.responseId) || 1
        weights.set(response.responseId, currentWeight * catDetail.weightFactor)
      }
    })

    summaries.push({
      dimension: target.dimension,
      categories: categoryDetails
    })
  })

  const weightValues = Array.from(weights.values())
  const sumWeights = weightValues.reduce((a, b) => a + b, 0)
  const sumSquaredWeights = weightValues.reduce((a, b) => a + b * b, 0)
  const designEffect = (n * sumSquaredWeights) / (sumWeights * sumWeights)
  const effectiveSampleSize = Math.round(n / designEffect)

  const weightedResponses: WeightedResponse[] = responses.map(r => ({
    responseId: r.responseId,
    originalWeight: 1,
    adjustedWeight: Math.round((weights.get(r.responseId) || 1) * 1000) / 1000,
    demographicValues: r.demographics
  }))

  return {
    responses: weightedResponses,
    weightingSummary: summaries,
    designEffect: Math.round(designEffect * 1000) / 1000,
    effectiveSampleSize
  }
}

function calculateWeightedMean(
  values: number[],
  weights: number[]
): number {
  if (values.length !== weights.length || values.length === 0) return 0

  const weightedSum = values.reduce((sum, val, i) => sum + val * weights[i], 0)
  const totalWeight = weights.reduce((a, b) => a + b, 0)

  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

function calculateWeightedPercentage(
  values: boolean[],
  weights: number[]
): number {
  if (values.length !== weights.length || values.length === 0) return 0

  const trueWeightSum = values.reduce((sum, val, i) => sum + (val ? weights[i] : 0), 0)
  const totalWeight = weights.reduce((a, b) => a + b, 0)

  return totalWeight > 0 ? (trueWeightSum / totalWeight) * 100 : 0
}

export { calculatePostStratificationWeights, calculateWeightedMean, calculateWeightedPercentage }
export type { PopulationTarget, WeightedResponse, WeightingResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 19.10 ATTENTION CHECKS & DATA QUALITY
# ══════════════════════════════════════════════════════════════════════════════

## 19.10.1 Attention Check Types

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ATTENTION CHECK IMPLEMENTATION
// ══════════════════════════════════════════════════════════════════════════════

type AttentionCheckType =
  | "DIRECT_INSTRUCTION"     // "Please select 'Agree' for this question"
  | "REVERSE_CONSISTENCY"    // Compare with reverse-coded item
  | "INSTRUCTED_RESPONSE"    // "Instead of rating, select 'Strongly Disagree'"
  | "TRAP_QUESTION"          // "I have never used a computer" (should be false)
  | "CAPTCHA_LIKE"           // Simple math or pattern recognition

interface AttentionCheck {
  id: string
  type: AttentionCheckType
  questionText: string
  expectedResponse: string | number | boolean
  tolerance: number
  weight: number
}

interface AttentionCheckResult {
  checkId: string
  passed: boolean
  response: unknown
  expectedResponse: unknown
}

interface DataQualityAssessment {
  responseId: string
  attentionCheckResults: AttentionCheckResult[]
  passedChecks: number
  totalChecks: number
  passRate: number
  speedingDetected: boolean
  straightLiningDetected: boolean
  overallQuality: "HIGH" | "MEDIUM" | "LOW" | "FAIL"
  shouldExclude: boolean
}

const ATTENTION_CHECK_TEMPLATES = {
  DIRECT_INSTRUCTION: {
    tr: "Kalite kontrolü için lütfen bu soru için 'Katılıyorum' seçeneğini işaretleyin.",
    en: "For quality control, please select 'Agree' for this question."
  },

  REVERSE_TRAP: {
    tr: "Ben bir robotum ve rastgele cevaplar veriyorum.",
    en: "I am a robot responding randomly to this survey.",
    expectedDisagree: true
  },

  IMPOSSIBLE_CLAIM: {
    tr: "Hayatımda hiç su içmedim.",
    en: "I have never consumed water in my life.",
    expectedDisagree: true
  },

  INSTRUCTED_RESPONSE: {
    tr: "Bu soru dikkatinizi test etmektedir. Lütfen 1 numaralı seçeneği işaretleyin.",
    en: "This question tests your attention. Please select option 1."
  }
}

function evaluateAttentionChecks(
  checks: AttentionCheck[],
  responses: Map<string, unknown>
): AttentionCheckResult[] {
  return checks.map(check => {
    const response = responses.get(check.id)
    let passed = false

    if (typeof check.expectedResponse === "number" && typeof response === "number") {
      passed = Math.abs(response - check.expectedResponse) <= check.tolerance
    } else {
      passed = response === check.expectedResponse
    }

    return {
      checkId: check.id,
      passed,
      response,
      expectedResponse: check.expectedResponse
    }
  })
}

function assessDataQuality(
  responseId: string,
  attentionResults: AttentionCheckResult[],
  completionTimeSeconds: number,
  expectedTimeSeconds: number,
  responses: number[]
): DataQualityAssessment {
  const passedChecks = attentionResults.filter(r => r.passed).length
  const totalChecks = attentionResults.length
  const passRate = totalChecks > 0 ? passedChecks / totalChecks : 1

  const speedingDetected = completionTimeSeconds < expectedTimeSeconds * 0.3

  let straightLiningDetected = false
  if (responses.length >= 5) {
    const uniqueResponses = new Set(responses)
    straightLiningDetected = uniqueResponses.size === 1
  }

  let overallQuality: DataQualityAssessment["overallQuality"]
  if (passRate < 0.5 || (speedingDetected && straightLiningDetected)) {
    overallQuality = "FAIL"
  } else if (passRate < 0.75 || speedingDetected || straightLiningDetected) {
    overallQuality = "LOW"
  } else if (passRate < 1.0) {
    overallQuality = "MEDIUM"
  } else {
    overallQuality = "HIGH"
  }

  return {
    responseId,
    attentionCheckResults: attentionResults,
    passedChecks,
    totalChecks,
    passRate: Math.round(passRate * 100),
    speedingDetected,
    straightLiningDetected,
    overallQuality,
    shouldExclude: overallQuality === "FAIL"
  }
}

export { evaluateAttentionChecks, assessDataQuality, ATTENTION_CHECK_TEMPLATES }
export type { AttentionCheck, AttentionCheckType, AttentionCheckResult, DataQualityAssessment }
```




# ══════════════════════════════════════════════════════════════════════════════
# 19.11 QUESTION TYPE SELECTION MATRIX
# ══════════════════════════════════════════════════════════════════════════════

```typescript
const QUESTION_TYPE_SELECTION_MATRIX = {
  // ─────────────────────────────────────────────────────────────────────────────
  // PREFERENCE & PRIORITIZATION
  // ─────────────────────────────────────────────────────────────────────────────

  PRIORITIZATION: {
    fewItems_3_7: {
      recommended: "RANKING",
      alternative: "SINGLE_CHOICE",
      avoid: "MAXDIFF"
    },
    manyItems_8_30: {
      recommended: "MAXDIFF",
      alternative: "RATING_MATRIX",
      avoid: "RANKING"
    },
    tradeoffs: {
      recommended: "CONJOINT",
      alternative: "MAXDIFF",
      avoid: "RANKING"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SATISFACTION & EXPERIENCE
  // ─────────────────────────────────────────────────────────────────────────────

  SATISFACTION: {
    overallRelationship: {
      recommended: "NPS",
      alternative: "LIKERT_AGREEMENT_5",
      metric: "Brand health, loyalty"
    },
    specificInteraction: {
      recommended: "CSAT",
      alternative: "LIKERT_SATISFACTION_5",
      metric: "Touchpoint quality"
    },
    processEffort: {
      recommended: "CES",
      alternative: "LIKERT_AGREEMENT_7",
      metric: "Friction identification"
    },
    multiAttribute: {
      recommended: "MATRIX_SINGLE",
      alternative: "SEMANTIC_DIFFERENTIAL",
      metric: "Attribute-level satisfaction"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // OPINION & ATTITUDE
  // ─────────────────────────────────────────────────────────────────────────────

  OPINION: {
    generalAttitude: {
      recommended: "LIKERT_AGREEMENT_5",
      alternative: "LIKERT_AGREEMENT_7",
      scales: "5-point for simplicity, 7-point for precision"
    },
    frequencyBehavior: {
      recommended: "LIKERT_FREQUENCY_5",
      alternative: "MULTIPLE_CHOICE",
      scales: "Captures behavioral patterns"
    },
    importanceRating: {
      recommended: "LIKERT_IMPORTANCE_5",
      alternative: "MAXDIFF",
      scales: "Use MaxDiff to avoid 'everything important' bias"
    },
    likelihood: {
      recommended: "LIKERT_LIKELIHOOD_5",
      alternative: "SLIDER_0_100",
      scales: "Slider for probability estimates"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PERSONALITY & PSYCHOMETRICS
  // ─────────────────────────────────────────────────────────────────────────────

  PERSONALITY: {
    scientificAssessment: {
      recommended: "BIG_FIVE_ITEMS",
      scale: "LIKERT_5",
      validation: "α > 0.80 required"
    },
    entertainmentTest: {
      recommended: "CHARACTER_MATCH",
      alternative: "SPECTRUM",
      engagement: "Optimized for shareability"
    },
    dimensionalAnalysis: {
      recommended: "AXIS_TEST",
      alternative: "MBTI_STYLE",
      output: "Quadrant placement or type code"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // VOTING & ELECTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  VOTING: {
    singleWinner: {
      recommended: "SINGLE_CHOICE",
      alternative: "RANKED_CHOICE",
      context: "Simple majority decisions"
    },
    majorityRequired: {
      recommended: "RANKED_CHOICE",
      alternative: "APPROVAL",
      context: "Ensures majority support"
    },
    multipleAcceptable: {
      recommended: "APPROVAL",
      alternative: "MULTIPLE_CHOICE",
      context: "When multiple options acceptable"
    },
    featureVoting: {
      recommended: "MAXDIFF",
      alternative: "RANKING",
      context: "Product feature prioritization"
    }
  }
}

export { QUESTION_TYPE_SELECTION_MATRIX }
```




# [REFERENCE: bible-006.md - Content Type Definitions for Poll/Survey/Test]
# [REFERENCE: bible-013.md - Database Schema for Question Models]
# [REFERENCE: bible-014.md - API Contracts for Survey Actions]
# [REFERENCE: bible-015.md - Business Logic Rules]
