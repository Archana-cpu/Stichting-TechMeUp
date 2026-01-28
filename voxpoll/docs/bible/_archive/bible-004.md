# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 04                                    █
# █                   RELIABILITY & TRUST SCORING SYSTEM                       █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████

# The Reliability Score is VOXPOLL's core differentiator. It provides users with
# a transparent, quantifiable measure of data quality that enables informed
# interpretation of results.




# ══════════════════════════════════════════════════════════════════════════════
# 4.1 RELIABILITY SCORE OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

## 4.1.1 What is the Reliability Score?

The Reliability Score is a 0-100 numerical rating that indicates the overall
trustworthiness and data quality of a poll, survey, or test's results.

✅ DECISION (T-009): Reliability score range is 0-100 for intuitive interpretation.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        RELIABILITY SCORE SCALE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Score Range  │ Label        │ Visual     │ Interpretation                     │
│  ─────────────┼──────────────┼────────────┼────────────────────────────────────│
│  90-100       │ Excellent    │ 🟢🟢🟢🟢🟢 │ Research-grade, highly reliable    │
│  75-89        │ Good         │ 🟢🟢🟢🟢⚪ │ Solid methodology, trustworthy     │
│  60-74        │ Moderate     │ 🟡🟡🟡⚪⚪ │ Acceptable, interpret with care    │
│  40-59        │ Limited      │ 🟠🟠⚪⚪⚪ │ Significant limitations            │
│  0-39         │ Low          │ 🔴⚪⚪⚪⚪ │ Entertainment only, not reliable   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 4.1.2 Score Visibility Rules

| Viewer Type | Can See Score? | Can See Breakdown? |
|-------------|----------------|--------------------|
| Content Creator | Yes | Yes (full detail) |
| Participant | Yes | Yes (summary) |
| Premium User (non-participant) | Yes | Yes (summary) |
| Free User (non-participant) | Yes (badge only) | No |
| Public/Anonymous | Yes (badge only) | No |


## 4.1.3 Score Display in UI

```
┌─────────────────────────────────────────────────────┐
│  "Should remote work be permanent?"                 │
│  ───────────────────────────────────────────────    │
│                                                     │
│  Reliability Score: 78/100 🟢🟢🟢🟢⚪              │
│  ─────────────────────────────                      │
│  ✓ 2,341 verified participants                     │
│  ✓ Demographic pre-test applied                    │
│  ✓ 97.2% response quality rate                     │
│                                                     │
│  [View Methodology]                                 │
└─────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 4.2 SCORING FACTORS & WEIGHTS
# ══════════════════════════════════════════════════════════════════════════════

## 4.2.1 Factor Categories

The Reliability Score is composed of four main categories:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       RELIABILITY SCORE COMPOSITION                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │   SAMPLE QUALITY (35%)                                                  │   │
│  │   ├── Sample Size Adequacy           (15%)                             │   │
│  │   ├── Response Rate                  (10%)  [Private surveys only]     │   │
│  │   └── Demographic Coverage           (10%)                             │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │   RESPONSE QUALITY (30%)                                                │   │
│  │   ├── Completion Rate                (10%)                             │   │
│  │   ├── Response Time Validity         (10%)                             │   │
│  │   └── Attention Check Pass Rate      (10%)                             │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │   METHODOLOGY (20%)                                                     │   │
│  │   ├── Sampling Method                (8%)                              │   │
│  │   ├── Question Quality               (7%)                              │   │
│  │   └── Pre-test Usage                 (5%)                              │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │   PARTICIPANT VERIFICATION (15%)                                        │   │
│  │   ├── User Verification Level        (8%)                              │   │
│  │   └── Fraud Detection Pass Rate      (7%)                              │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Total: 100%                                                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 4.2.2 Factor Definitions & Scoring Rules

### SAMPLE QUALITY FACTORS (35%)

#### Sample Size Adequacy (15%)

Scores based on achieving statistically meaningful sample size:

| Condition | Score | Formula |
|-----------|-------|--------|
| n ≥ Recommended (95% CI, ±5%) | 100 | Full marks |
| n ≥ 75% of recommended | 80 | Linear interpolation |
| n ≥ 50% of recommended | 60 | Linear interpolation |
| n ≥ 25% of recommended | 40 | Linear interpolation |
| n < 25% of recommended | 20 | Minimum viable |
| n < 30 (absolute minimum) | 0 | Insufficient data |

```typescript
function scoreSampleSize(
  actualSampleSize: number,
  recommendedSampleSize: number
): number {
  if (actualSampleSize < 30) return 0
  
  const ratio = actualSampleSize / recommendedSampleSize
  
  if (ratio >= 1) return 100
  if (ratio >= 0.75) return 80 + (ratio - 0.75) * 80
  if (ratio >= 0.50) return 60 + (ratio - 0.50) * 80
  if (ratio >= 0.25) return 40 + (ratio - 0.25) * 80
  
  return 20 + (ratio / 0.25) * 20
}
```


#### Response Rate (10%) - Private Surveys Only

| Response Rate | Score | Context |
|---------------|-------|--------|
| ≥ 70% | 100 | Excellent engagement |
| 50-69% | 80 | Good engagement |
| 30-49% | 60 | Moderate engagement |
| 15-29% | 40 | Low engagement |
| < 15% | 20 | Very low engagement |

[NOTE] For public polls (no invitation list), this factor is replaced with
"Organic Reach" - ratio of participants to content views.


#### Demographic Coverage (10%)

Measures how well the sample represents intended demographics:

| Condition | Score |
|-----------|-------|
| All target demographics represented | 100 |
| ≥ 80% of target demographics represented | 80 |
| ≥ 60% of target demographics represented | 60 |
| ≥ 40% of target demographics represented | 40 |
| < 40% or no demographic tracking | 20 |


### RESPONSE QUALITY FACTORS (30%)

#### Completion Rate (10%)

| Completion Rate | Score |
|-----------------|-------|
| ≥ 95% | 100 |
| 85-94% | 85 |
| 75-84% | 70 |
| 60-74% | 50 |
| < 60% | 30 |


#### Response Time Validity (10%)

Percentage of responses that passed timing checks (not speeders):

| Valid Response % | Score |
|------------------|-------|
| ≥ 98% | 100 |
| 95-97% | 85 |
| 90-94% | 70 |
| 80-89% | 50 |
| < 80% | 30 |


#### Attention Check Pass Rate (10%)

| Pass Rate | Score |
|-----------|-------|
| ≥ 95% | 100 |
| 90-94% | 85 |
| 85-89% | 70 |
| 75-84% | 50 |
| < 75% | 30 |

[NOTE] If no attention checks were used, this factor scores 50 (neutral).


### METHODOLOGY FACTORS (20%)

#### Sampling Method (8%)

| Method | Score | Rationale |
|--------|-------|----------|
| Probability (Random/Stratified) | 100 | Gold standard |
| Quota Sampling | 75 | Controlled representation |
| Purposive Sampling | 60 | Targeted but limited |
| Convenience/Voluntary | 40 | Self-selection bias |
| Unknown/Not specified | 20 | Cannot evaluate |


#### Question Quality (7%)

Based on automated question quality checks:

| Condition | Score |
|-----------|-------|
| All questions pass validation | 100 |
| Minor warnings only | 80 |
| 1-2 quality issues | 60 |
| 3+ quality issues | 40 |
| Critical issues (leading, double-barreled) | 20 |


#### Pre-test Usage (5%)

| Pre-test Configuration | Score |
|------------------------|-------|
| Multi-layer pre-test (demographic + screening + knowledge) | 100 |
| Two-layer pre-test | 80 |
| Single-layer pre-test | 60 |
| No pre-test but has eligibility criteria | 40 |
| Open to all, no filtering | 20 |


### PARTICIPANT VERIFICATION FACTORS (15%)

#### User Verification Level (8%)

Average verification level of participants:

| Average Level | Score | Description |
|---------------|-------|------------|
| ≥ 3.5 | 100 | Mostly e-Government verified |
| 2.5-3.4 | 80 | Mostly phone + email verified |
| 1.5-2.4 | 60 | Mostly phone verified |
| 0.5-1.4 | 40 | Mostly email only |
| < 0.5 | 20 | Minimal verification |

Verification levels:
- Level 0: Email only
- Level 1: Phone verified
- Level 2: Phone + Profile complete
- Level 3: Phone + e-Government verified
- Level 4: Phone + e-Government + Organization member


#### Fraud Detection Pass Rate (7%)

| Pass Rate | Score |
|-----------|-------|
| ≥ 99% | 100 |
| 97-98% | 85 |
| 95-96% | 70 |
| 90-94% | 50 |
| < 90% | 30 |




# ══════════════════════════════════════════════════════════════════════════════
# 4.3 SCORE CALCULATION ENGINE
# ══════════════════════════════════════════════════════════════════════════════

## 4.3.1 Main Calculation Algorithm

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RELIABILITY SCORE CALCULATOR
// ══════════════════════════════════════════════════════════════════════════════

interface ReliabilityFactors {
  sampleQuality: {
    sampleSizeAdequacy: number
    responseRate: number | null
    demographicCoverage: number
  }
  responseQuality: {
    completionRate: number
    responseTimeValidity: number
    attentionCheckPassRate: number | null
  }
  methodology: {
    samplingMethod: number
    questionQuality: number
    pretestUsage: number
  }
  participantVerification: {
    userVerificationLevel: number
    fraudDetectionPassRate: number
  }
}

interface ReliabilityScoreResult {
  overallScore: number
  categoryScores: {
    sampleQuality: number
    responseQuality: number
    methodology: number
    participantVerification: number
  }
  factors: ReliabilityFactors
  label: "Excellent" | "Good" | "Moderate" | "Limited" | "Low"
  confidenceLevel: "High" | "Medium" | "Low"
}

const WEIGHTS = {
  sampleQuality: {
    total: 0.35,
    sampleSizeAdequacy: 0.15,
    responseRate: 0.10,
    demographicCoverage: 0.10
  },
  responseQuality: {
    total: 0.30,
    completionRate: 0.10,
    responseTimeValidity: 0.10,
    attentionCheckPassRate: 0.10
  },
  methodology: {
    total: 0.20,
    samplingMethod: 0.08,
    questionQuality: 0.07,
    pretestUsage: 0.05
  },
  participantVerification: {
    total: 0.15,
    userVerificationLevel: 0.08,
    fraudDetectionPassRate: 0.07
  }
}

function calculateReliabilityScore(factors: ReliabilityFactors): ReliabilityScoreResult {
  const sampleQualityScore = calculateCategoryScore(
    factors.sampleQuality,
    WEIGHTS.sampleQuality
  )

  const responseQualityScore = calculateCategoryScore(
    factors.responseQuality,
    WEIGHTS.responseQuality
  )

  const methodologyScore = calculateCategoryScore(
    factors.methodology,
    WEIGHTS.methodology
  )

  const participantVerificationScore = calculateCategoryScore(
    factors.participantVerification,
    WEIGHTS.participantVerification
  )

  const overallScore = Math.round(
    sampleQualityScore * WEIGHTS.sampleQuality.total +
    responseQualityScore * WEIGHTS.responseQuality.total +
    methodologyScore * WEIGHTS.methodology.total +
    participantVerificationScore * WEIGHTS.participantVerification.total
  )

  return {
    overallScore,
    categoryScores: {
      sampleQuality: sampleQualityScore,
      responseQuality: responseQualityScore,
      methodology: methodologyScore,
      participantVerification: participantVerificationScore
    },
    factors,
    label: getScoreLabel(overallScore),
    confidenceLevel: getConfidenceLevel(overallScore)
  }
}

function getScoreLabel(score: number): ReliabilityScoreResult["label"] {
  if (score >= 90) return "Excellent"
  if (score >= 75) return "Good"
  if (score >= 60) return "Moderate"
  if (score >= 40) return "Limited"
  return "Low"
}

function getConfidenceLevel(score: number): ReliabilityScoreResult["confidenceLevel"] {
  if (score >= 75) return "High"
  if (score >= 50) return "Medium"
  return "Low"
}

export { calculateReliabilityScore, WEIGHTS }
export type { ReliabilityFactors, ReliabilityScoreResult }
```


## 4.3.2 Category Score Calculation

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CATEGORY SCORE CALCULATION
// ══════════════════════════════════════════════════════════════════════════════

function calculateCategoryScore(
  factors: Record<string, number | null>,
  weights: Record<string, number>
): number {
  let totalWeight = 0
  let weightedSum = 0

  for (const [key, value] of Object.entries(factors)) {
    if (key === "total") continue
    
    const weight = weights[key]
    if (!weight) continue

    if (value !== null) {
      weightedSum += value * weight
      totalWeight += weight
    }
  }

  if (totalWeight === 0) return 50

  const normalizedWeight = weights.total
  const adjustedScore = (weightedSum / totalWeight) * 100

  return Math.round(adjustedScore)
}

export { calculateCategoryScore }
```


## 4.3.3 Real-time Score Updates

[MUST] Update reliability score in real-time as responses come in:

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// REAL-TIME SCORE UPDATER
// ══════════════════════════════════════════════════════════════════════════════

interface ScoreUpdateEvent {
  contentId: string
  previousScore: number
  newScore: number
  changedFactors: string[]
  timestamp: Date
}

async function updateReliabilityScoreOnResponse(
  contentId: string,
  responseMetrics: ResponseMetrics
): Promise<ScoreUpdateEvent> {
  const content = await getContentWithMetrics(contentId)
  
  const updatedMetrics = mergeMetrics(content.metrics, responseMetrics)
  
  const factors = computeFactorsFromMetrics(updatedMetrics, content)
  const newScoreResult = calculateReliabilityScore(factors)
  
  await updateContentReliabilityScore(contentId, newScoreResult)
  
  await publishScoreUpdate(contentId, newScoreResult.overallScore)
  
  return {
    contentId,
    previousScore: content.reliabilityScore,
    newScore: newScoreResult.overallScore,
    changedFactors: identifyChangedFactors(content.factors, factors),
    timestamp: new Date()
  }
}

export { updateReliabilityScoreOnResponse }
export type { ScoreUpdateEvent }
```




# ══════════════════════════════════════════════════════════════════════════════
# 4.4 SCORE DISPLAY & VISUALIZATION
# ══════════════════════════════════════════════════════════════════════════════

## 4.4.1 Score Badge Component

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       RELIABILITY BADGE VARIANTS                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  COMPACT (Feed/List View):                                                      │
│  ┌──────────────┐                                                              │
│  │ 🟢 78        │  ← Score + color indicator                                   │
│  └──────────────┘                                                              │
│                                                                                 │
│  STANDARD (Content Header):                                                     │
│  ┌──────────────────────────┐                                                  │
│  │ Reliability: 78/100      │                                                  │
│  │ 🟢🟢🟢🟢⚪ Good          │                                                  │
│  └──────────────────────────┘                                                  │
│                                                                                 │
│  EXPANDED (Detail View):                                                        │
│  ┌───────────────────────────────────────────────────────┐                     │
│  │ Reliability Score: 78/100                             │                     │
│  │ ████████████████████████████████░░░░░░░░  78%         │                     │
│  │                                                       │                     │
│  │ Sample Quality      ███████████████░░░░░  75          │                     │
│  │ Response Quality    █████████████████░░░  85          │                     │
│  │ Methodology         ████████████████░░░░  80          │                     │
│  │ Verification        ██████████████░░░░░░  70          │                     │
│  │                                                       │                     │
│  │ [View Detailed Breakdown]                             │                     │
│  └───────────────────────────────────────────────────────┘                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 4.4.2 Score Breakdown Modal

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  📊 Reliability Score Breakdown                                          [X]   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Overall Score: 78/100 (Good)                                                  │
│  ════════════════════════════════════════════════════════════════════          │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ SAMPLE QUALITY (35% weight)                              Score: 75/100 │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ ✓ Sample Size: 1,247 of 385 recommended (100%)                         │   │
│  │ ✓ Response Rate: N/A (Public poll)                                     │   │
│  │ ⚠ Demographic Coverage: 68% of target groups represented              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ RESPONSE QUALITY (30% weight)                            Score: 85/100 │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ ✓ Completion Rate: 94% (1,172 of 1,247)                               │   │
│  │ ✓ Valid Response Timing: 97.3%                                        │   │
│  │ ✓ Attention Check Pass Rate: 96.1%                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ METHODOLOGY (20% weight)                                 Score: 80/100 │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ ⚠ Sampling Method: Voluntary (40 points)                              │   │
│  │ ✓ Question Quality: All questions pass validation (100 points)        │   │
│  │ ✓ Pre-test: Demographic filtering applied (60 points)                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ PARTICIPANT VERIFICATION (15% weight)                    Score: 70/100 │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ ✓ Average Verification Level: 2.1 (Phone + Profile)                   │   │
│  │ ✓ Fraud Detection Pass Rate: 98.7%                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ───────────────────────────────────────────────────────────────────────────    │
│  💡 How to improve this score:                                                 │
│  • Use stratified sampling for higher methodology score                        │
│  • Enable e-Government verification for higher verification score              │
│  • Add knowledge pre-test for better participant qualification                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 4.4.3 Score History Chart

For content creators, show how score evolved over time:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  📈 Score History                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  100 ┤                                                                         │
│   90 ┤                                         ●────●────●────●               │
│   80 ┤                           ●────●────●──●                                │
│   70 ┤                 ●────●────●                                             │
│   60 ┤       ●────●────●                                                       │
│   50 ┤  ●────●                                                                 │
│   40 ┤                                                                         │
│      └─────────────────────────────────────────────────────────────────────     │
│         0    100   250   500   750  1000  1250                                 │
│                         Responses                                              │
│                                                                                 │
│  Key Events:                                                                   │
│  • 250 responses: Crossed statistical threshold                               │
│  • 500 responses: Score stabilized                                             │
│  • 1,000 responses: Reached "Good" category                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 4.5 CONTENT-TYPE SPECIFIC SCORING
# ══════════════════════════════════════════════════════════════════════════════

## 4.5.1 Poll Scoring Adjustments

Polls are typically casual and have lower baseline expectations:

| Factor | Standard Weight | Poll Adjustment | Rationale |
|--------|-----------------|-----------------|----------|
| Sample Size | 15% | 12% | Lower expectations |
| Response Rate | 10% | 0% (replaced) | No invite list |
| Sampling Method | 8% | 5% | Usually voluntary |
| Pre-test Usage | 5% | 8% | More important for quality |

[NOTE] Maximum achievable score for polls without pre-test: ~75


## 4.5.2 Survey Scoring Adjustments

Surveys (B2B) have higher standards and full factor application:

| Factor | Standard Weight | Survey Adjustment | Rationale |
|--------|-----------------|-------------------|----------|
| Response Rate | 10% | 12% | Critical for org surveys |
| User Verification | 8% | 10% | Org membership matters |
| Pre-test Usage | 5% | 5% | Standard |

[NOTE] Internal surveys with SSO get automatic verification boost.


## 4.5.3 Test Scoring Adjustments

Tests focus on psychometric quality rather than sampling:

| Factor | Standard Weight | Test Adjustment | Rationale |
|--------|-----------------|-----------------|----------|
| Sample Size | 15% | 10% | Less critical for individual results |
| Internal Consistency | 0% | 15% | Cronbach's alpha importance |
| Completion Rate | 10% | 15% | Full completion matters |

Additional Test-specific factors:
- **Internal Consistency (Cronbach's α)**: Measures how well items correlate
- **Result Stability**: How consistent are results for similar respondents


## 4.5.4 Score Multipliers

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CONTENT-TYPE SCORE ADJUSTMENTS
// ══════════════════════════════════════════════════════════════════════════════

type ContentType = "POLL" | "SURVEY" | "TEST"

interface ScoreMultipliers {
  sampleQuality: number
  responseQuality: number
  methodology: number
  participantVerification: number
}

const CONTENT_TYPE_MULTIPLIERS: Record<ContentType, ScoreMultipliers> = {
  POLL: {
    sampleQuality: 0.9,
    responseQuality: 1.0,
    methodology: 0.8,
    participantVerification: 1.0
  },
  SURVEY: {
    sampleQuality: 1.1,
    responseQuality: 1.0,
    methodology: 1.1,
    participantVerification: 1.1
  },
  TEST: {
    sampleQuality: 0.8,
    responseQuality: 1.2,
    methodology: 1.0,
    participantVerification: 0.9
  }
}

function applyContentTypeAdjustments(
  baseScore: ReliabilityScoreResult,
  contentType: ContentType
): ReliabilityScoreResult {
  const multipliers = CONTENT_TYPE_MULTIPLIERS[contentType]
  
  const adjustedCategoryScores = {
    sampleQuality: Math.min(100, baseScore.categoryScores.sampleQuality * multipliers.sampleQuality),
    responseQuality: Math.min(100, baseScore.categoryScores.responseQuality * multipliers.responseQuality),
    methodology: Math.min(100, baseScore.categoryScores.methodology * multipliers.methodology),
    participantVerification: Math.min(100, baseScore.categoryScores.participantVerification * multipliers.participantVerification)
  }
  
  const adjustedOverall = Math.round(
    adjustedCategoryScores.sampleQuality * WEIGHTS.sampleQuality.total +
    adjustedCategoryScores.responseQuality * WEIGHTS.responseQuality.total +
    adjustedCategoryScores.methodology * WEIGHTS.methodology.total +
    adjustedCategoryScores.participantVerification * WEIGHTS.participantVerification.total
  )
  
  return {
    ...baseScore,
    overallScore: Math.min(100, adjustedOverall),
    categoryScores: adjustedCategoryScores,
    label: getScoreLabel(adjustedOverall),
    confidenceLevel: getConfidenceLevel(adjustedOverall)
  }
}

export { applyContentTypeAdjustments, CONTENT_TYPE_MULTIPLIERS }
```




# ══════════════════════════════════════════════════════════════════════════════
# 4.6 QUALITY BADGES & CERTIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 4.6.1 Badge Types

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           QUALITY BADGES                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  VERIFICATION BADGES                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ [BadgeCheck] Verified Creator    Identity verification complete      │   │
│  │ [Building2] Organization         Survey from verified organization   │   │
│  │ [Landmark] Government Partner    Municipal or government entity      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  METHODOLOGY BADGES                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ [BarChart3] Statistically Valid  Sample size requirements met       │   │
│  │ [Target] Targeted Sample         Pre-test filtering applied          │   │
│  │ [FlaskConical] Research Grade    Academic research standards met     │   │
│  │ [ShieldCheck] Fraud Protected    Advanced fraud detection enabled    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  QUALITY BADGES                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ [Star] High Quality              Reliability score >= 80             │   │
│  │ [CheckCircle2] Complete Data     98%+ completion rate                 │   │
│  │ [Lock] Anonymous Verified        Anonymity architecture verified     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 4.6.2 Badge Earning Criteria

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// BADGE CRITERIA DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

interface BadgeCriteria {
  id: string
  name: string
  icon: string
  category: "VERIFICATION" | "METHODOLOGY" | "QUALITY"
  criteria: (content: Content, metrics: ContentMetrics) => boolean
  description: string
}

const BADGE_DEFINITIONS: BadgeCriteria[] = [
  {
    id: "verified_creator",
    name: "Verified Creator",
    icon: "BadgeCheck",
    category: "VERIFICATION",
    criteria: (content) => content.creator.verificationLevel >= 3,
    description: "Creator has completed identity verification"
  },
  {
    id: "organization_badge",
    name: "Organization",
    icon: "Building2",
    category: "VERIFICATION",
    criteria: (content) => content.organizationId !== null && content.organization?.isVerified,
    description: "Survey from verified organization"
  },
  {
    id: "statistically_valid",
    name: "Statistically Valid",
    icon: "BarChart3",
    category: "METHODOLOGY",
    criteria: (_, metrics) => {
      const recommended = metrics.recommendedSampleSize
      return metrics.responseCount >= recommended
    },
    description: "Meets sample size requirements for statistical validity"
  },
  {
    id: "targeted_sample",
    name: "Targeted Sample",
    icon: "Target",
    category: "METHODOLOGY",
    criteria: (content) => content.pretest !== null && content.pretest.layers.length > 0,
    description: "Pre-test filtering applied to ensure qualified respondents"
  },
  {
    id: "research_grade",
    name: "Research Grade",
    icon: "FlaskConical",
    category: "METHODOLOGY",
    criteria: (content, metrics) => {
      return (
        metrics.reliabilityScore >= 85 &&
        content.pretest?.layers.length >= 2 &&
        metrics.attentionCheckPassRate >= 0.95 &&
        metrics.responseQualityScore >= 90
      )
    },
    description: "Meets academic research standards"
  },
  {
    id: "fraud_protected",
    name: "Fraud Protected",
    icon: "ShieldCheck",
    category: "METHODOLOGY",
    criteria: (_, metrics) => metrics.fraudDetectionEnabled && metrics.fraudPassRate >= 0.98,
    description: "Advanced fraud detection enabled with high pass rate"
  },
  {
    id: "high_quality",
    name: "High Quality",
    icon: "Star",
    category: "QUALITY",
    criteria: (_, metrics) => metrics.reliabilityScore >= 80,
    description: "Reliability score of 80 or higher"
  },
  {
    id: "complete_data",
    name: "Complete Data",
    icon: "CheckCircle2",
    category: "QUALITY",
    criteria: (_, metrics) => metrics.completionRate >= 0.98,
    description: "98%+ completion rate"
  },
  {
    id: "anonymous_verified",
    name: "Anonymous Verified",
    icon: "Lock",
    category: "QUALITY",
    criteria: (content) => content.isAnonymous && content.anonymityVerified,
    description: "Anonymity architecture verified"
  }
]

function evaluateBadges(content: Content, metrics: ContentMetrics): BadgeCriteria[] {
  return BADGE_DEFINITIONS.filter(badge => badge.criteria(content, metrics))
}

export { evaluateBadges, BADGE_DEFINITIONS }
export type { BadgeCriteria }
```


## 4.6.3 Badge Display in UI

```
┌─────────────────────────────────────────────────────────────────┐
│  "Employee Satisfaction Survey 2026"                            │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  [Building2] Organization    [BarChart3] Statistically Valid   │
│  [ShieldCheck] Fraud Protected    [Star] High Quality           │
│  [Lock] Anonymous Verified                                      │
│                                                                 │
│  Reliability: 87/100  [████░] Good                              │
└─────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 4.7 USER TRUST SCORING
# ══════════════════════════════════════════════════════════════════════════════

## 4.7.1 User Trust Score Overview

Separate from content reliability, each user has a Trust Score that reflects
their history of quality participation.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          USER TRUST SCORE                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Purpose:                                                                       │
│  • Weight individual responses in aggregate calculations                        │
│  • Prioritize trusted users for stratified sampling                            │
│  • Identify and flag potentially problematic users                             │
│  • Reward quality participation behavior                                       │
│                                                                                 │
│  Score Range: 0-100                                                            │
│  Default (new users): 50                                                       │
│                                                                                 │
│  [!] IMPORTANT: User Trust Score is NEVER displayed publicly.                  │
│  It is used only for internal quality weighting and is invisible to users.     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 4.7.2 User Trust Score Factors

| Factor | Weight | Positive Impact | Negative Impact |
|--------|--------|-----------------|----------------|
| Account Age | 10% | Longer = better | New accounts start neutral |
| Verification Level | 20% | Higher = better | Unverified = penalty |
| Response Quality History | 30% | Consistent quality | Failed attention checks |
| Completion Rate | 15% | High completion | Frequent abandonment |
| Fraud Flags | 25% | No flags | Any flag = major penalty |


## 4.7.3 Trust Score Calculation

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// USER TRUST SCORE CALCULATOR
// ══════════════════════════════════════════════════════════════════════════════

interface UserTrustFactors {
  accountAgeMonths: number
  verificationLevel: 0 | 1 | 2 | 3 | 4
  totalResponses: number
  qualityResponseRate: number
  completionRate: number
  fraudFlagCount: number
  attentionCheckFailRate: number
}

interface UserTrustResult {
  score: number
  tier: "Trusted" | "Standard" | "Probation" | "Restricted"
  canParticipateInPremium: boolean
  weightMultiplier: number
}

const TRUST_WEIGHTS = {
  accountAge: 0.10,
  verificationLevel: 0.20,
  responseQuality: 0.30,
  completionRate: 0.15,
  fraudHistory: 0.25
}

function calculateUserTrustScore(factors: UserTrustFactors): UserTrustResult {
  let accountAgeScore = Math.min(100, factors.accountAgeMonths * 5)
  
  const verificationScores = { 0: 20, 1: 40, 2: 60, 3: 80, 4: 100 }
  let verificationScore = verificationScores[factors.verificationLevel]
  
  let responseQualityScore = factors.totalResponses >= 5 
    ? factors.qualityResponseRate * 100 
    : 50
  
  let completionScore = factors.completionRate * 100
  
  let fraudScore = 100
  if (factors.fraudFlagCount > 0) {
    fraudScore = Math.max(0, 100 - (factors.fraudFlagCount * 25))
  }
  if (factors.attentionCheckFailRate > 0.1) {
    fraudScore = Math.max(0, fraudScore - 20)
  }
  
  const rawScore = 
    accountAgeScore * TRUST_WEIGHTS.accountAge +
    verificationScore * TRUST_WEIGHTS.verificationLevel +
    responseQualityScore * TRUST_WEIGHTS.responseQuality +
    completionScore * TRUST_WEIGHTS.completionRate +
    fraudScore * TRUST_WEIGHTS.fraudHistory

  const score = Math.round(Math.max(0, Math.min(100, rawScore)))
  
  return {
    score,
    tier: getTrustTier(score),
    canParticipateInPremium: score >= 60,
    weightMultiplier: getWeightMultiplier(score)
  }
}

function getTrustTier(score: number): UserTrustResult["tier"] {
  if (score >= 80) return "Trusted"
  if (score >= 50) return "Standard"
  if (score >= 30) return "Probation"
  return "Restricted"
}

function getWeightMultiplier(score: number): number {
  if (score >= 80) return 1.2
  if (score >= 60) return 1.0
  if (score >= 40) return 0.8
  return 0.5
}

export { calculateUserTrustScore, TRUST_WEIGHTS }
export type { UserTrustFactors, UserTrustResult }
```


## 4.7.4 Trust Score Impact

### Response Weighting

In aggregate calculations, responses from high-trust users count more:

```
Weighted Result = Σ(response × user_weight) / Σ(user_weight)
```

| Trust Tier | Weight Multiplier | Effect |
|------------|-------------------|--------|
| Trusted (80+) | 1.2x | Response counts 20% more |
| Standard (50-79) | 1.0x | Normal weighting |
| Probation (30-49) | 0.8x | Response counts 20% less |
| Restricted (<30) | 0.5x | Response counts 50% less |


### Participation Restrictions

| Trust Tier | Restrictions |
|------------|-------------|
| Trusted | None - eligible for all content |
| Standard | None - eligible for all content |
| Probation | Cannot participate in "Research Grade" surveys |
| Restricted | Can only participate in public polls, additional CAPTCHA required |




# ══════════════════════════════════════════════════════════════════════════════
# 4.8 CREATOR REPUTATION SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 4.8.1 Creator Reputation Overview

Content creators (individuals and organizations) have a public reputation
score based on their track record.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        CREATOR REPUTATION                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Visible To:  Public (on creator profile and content)                          │
│  Updates:     After each content completion                                    │
│  Range:       0-100 (same as reliability score)                                │
│                                                                                 │
│  Calculation: Weighted average of last 20 content reliability scores           │
│               with recency weighting                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 4.8.2 Creator Reputation Factors

| Factor | Weight | Description |
|--------|--------|------------|
| Average Reliability Score | 50% | Mean of last 20 content scores |
| Consistency | 20% | Low variance in scores = better |
| Volume | 10% | More content = higher trust |
| Verification Status | 10% | Verified creators get boost |
| User Engagement | 10% | Participation and discussion quality |


## 4.8.3 Creator Reputation Display

```
┌─────────────────────────────────────────────────────────────────┐
│  [User] Acme Corporation                    [BadgeCheck] Verified │
│  ───────────────────────────────────────────────────────────      │
│                                                                   │
│  Creator Reputation: 82/100  [████░] Good                         │
│  ─────────────────────────────────                                │
│  [BarChart3] 47 surveys created                                   │
│  [TrendingUp] Average reliability: 79                             │
│  [Users] 12,847 total participants                                │
│                                                                 │
│  Recent Content:                                                │
│  • Employee Satisfaction Q4 2025 (Score: 85)                   │
│  • Product Feedback Survey (Score: 78)                         │
│  • Team Pulse Check (Score: 81)                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 4.9 SCORING TRANSPARENCY & APPEALS
# ══════════════════════════════════════════════════════════════════════════════

## 4.9.1 Transparency Principles

[MUST] The reliability scoring system must be transparent:

1. **Formula Visibility**: All scoring formulas are documented publicly
2. **Factor Explanation**: Each factor includes clear explanation
3. **Score Breakdown**: Creators can see exactly how score was calculated
4. **Improvement Guidance**: System provides actionable improvement tips


## 4.9.2 Score Dispute Process

Creators can dispute scores they believe are incorrect:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SCORE DISPUTE PROCESS                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Step 1: Review Score Breakdown                                                │
│  └─→ Creator reviews detailed breakdown in dashboard                           │
│                                                                                 │
│  Step 2: Identify Dispute Reason                                               │
│  └─→ Select category:                                                          │
│      • Calculation error                                                       │
│      • Unfair factor application                                               │
│      • Technical issue affected metrics                                        │
│      • Other (explain)                                                         │
│                                                                                 │
│  Step 3: Submit Evidence                                                       │
│  └─→ Provide supporting information                                            │
│                                                                                 │
│  Step 4: Review (within 48 hours)                                              │
│  └─→ VOXPOLL team reviews and responds                                         │
│                                                                                 │
│  Step 5: Resolution                                                            │
│  └─→ Score adjusted if warranted, explanation provided                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 4.9.3 Automatic Score Recalculation

[MUST] Recalculate scores when:
- System bugs are identified and fixed
- Factor weights are adjusted (applied retroactively)
- New data quality issues are discovered in responses




# ══════════════════════════════════════════════════════════════════════════════
# 4.10 RELIABILITY SCORE CONSTANTS
# ══════════════════════════════════════════════════════════════════════════════

## 4.10.1 Configuration Constants

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RELIABILITY SCORE CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════

export const RELIABILITY_CONSTANTS = {
  SCORE_RANGE: {
    MIN: 0,
    MAX: 100,
    DEFAULT: 50
  },

  THRESHOLDS: {
    EXCELLENT: 90,
    GOOD: 75,
    MODERATE: 60,
    LIMITED: 40
  },

  MINIMUM_REQUIREMENTS: {
    ABSOLUTE_MIN_RESPONSES: 30,
    MIN_FOR_CONFIDENCE_INTERVAL: 100,
    MIN_FOR_DEMOGRAPHIC_BREAKDOWN: 50,
    MIN_PER_DEMOGRAPHIC_GROUP: 10
  },

  FACTOR_WEIGHTS: {
    SAMPLE_QUALITY: 0.35,
    RESPONSE_QUALITY: 0.30,
    METHODOLOGY: 0.20,
    PARTICIPANT_VERIFICATION: 0.15
  },

  UPDATE_FREQUENCY: {
    REAL_TIME_THRESHOLD: 100,
    BATCH_UPDATE_INTERVAL_MS: 60000
  },

  BADGES: {
    HIGH_QUALITY_THRESHOLD: 80,
    RESEARCH_GRADE_THRESHOLD: 85,
    FRAUD_PROTECTED_PASS_RATE: 0.98
  },

  USER_TRUST: {
    DEFAULT_SCORE: 50,
    TRUSTED_THRESHOLD: 80,
    PROBATION_THRESHOLD: 30,
    RESTRICTED_THRESHOLD: 20
  },

  CREATOR_REPUTATION: {
    HISTORY_LENGTH: 20,
    RECENCY_DECAY: 0.95
  }
} as const

export type ReliabilityConstants = typeof RELIABILITY_CONSTANTS
```


## 4.10.2 Score Label Mappings

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SCORE LABEL MAPPINGS
// ══════════════════════════════════════════════════════════════════════════════

export const SCORE_LABELS = {
  EXCELLENT: {
    label: "Excellent",
    description: "Research-grade, highly reliable data",
    color: "green",
    filledBars: 5,
    totalBars: 5
  },
  GOOD: {
    label: "Good",
    description: "Solid methodology, trustworthy results",
    color: "green",
    filledBars: 4,
    totalBars: 5
  },
  MODERATE: {
    label: "Moderate",
    description: "Acceptable quality, interpret with care",
    color: "yellow",
    filledBars: 3,
    totalBars: 5
  },
  LIMITED: {
    label: "Limited",
    description: "Significant limitations, use cautiously",
    color: "orange",
    filledBars: 2,
    totalBars: 5
  },
  LOW: {
    label: "Low",
    description: "Entertainment only, not reliable for decisions",
    color: "red",
    filledBars: 1,
    totalBars: 5
  }
} as const

export function getScoreLabelInfo(score: number) {
  if (score >= RELIABILITY_CONSTANTS.THRESHOLDS.EXCELLENT) return SCORE_LABELS.EXCELLENT
  if (score >= RELIABILITY_CONSTANTS.THRESHOLDS.GOOD) return SCORE_LABELS.GOOD
  if (score >= RELIABILITY_CONSTANTS.THRESHOLDS.MODERATE) return SCORE_LABELS.MODERATE
  if (score >= RELIABILITY_CONSTANTS.THRESHOLDS.LIMITED) return SCORE_LABELS.LIMITED
  return SCORE_LABELS.LOW
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 4.10 INCREMENTAL SCORING ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 4.10.1 Problem Statement

At scale (10K+ concurrent users), recalculating all reliability factors on every
response creates CPU bottlenecks. The solution is incremental scoring with
background reconciliation.

## 4.10.2 Incremental Update Strategy

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// INCREMENTAL SCORE UPDATE - O(1) per response instead of O(n)
// ══════════════════════════════════════════════════════════════════════════════

interface IncrementalScoreState {
  contentId: string
  currentScore: number
  factorSums: {
    sampleQuality: { sum: number; count: number }
    responseQuality: { sum: number; count: number }
    methodology: { sum: number; count: number }
    participantVerification: { sum: number; count: number }
  }
  lastFullRecalculation: Date
  lastIncrementalUpdate: Date
  driftDetected: boolean
}

const INCREMENTAL_SCORING_CONFIG = {
  // Redis key pattern
  cacheKey: (contentId: string) => `score:incremental:${contentId}`,

  // When to trigger full recalculation
  reconciliation: {
    // Max time between full recalculations
    maxAge: 60 * 60 * 1000, // 1 hour

    // Max drift before forcing recalc (percentage points)
    maxDrift: 3, // If incremental differs from full by >3 points

    // Every N responses, do a full recalc
    responseInterval: 100,

    // Background job schedule
    cronSchedule: "*/15 * * * *" // Every 15 minutes
  },

  // TTL for incremental state
  stateTTL: 24 * 60 * 60 // 24 hours
}

// Fast O(1) update on each response
async function incrementalScoreUpdate(
  contentId: string,
  newResponse: ResponseMetrics
): Promise<{ score: number; isApproximate: boolean }> {
  const redis = getRedisClient()
  const stateKey = INCREMENTAL_SCORING_CONFIG.cacheKey(contentId)

  // Get or initialize state
  let state = await redis.get<IncrementalScoreState>(stateKey)

  if (!state) {
    // First response or state expired - do full calculation
    const fullResult = await calculateFullReliabilityScore(contentId)
    state = initializeIncrementalState(contentId, fullResult)
    await redis.set(stateKey, state, { ex: INCREMENTAL_SCORING_CONFIG.stateTTL })
    return { score: fullResult.overallScore, isApproximate: false }
  }

  // Update running averages with new response data
  const updatedState = updateFactorSums(state, newResponse)

  // Calculate new score from running averages
  const newScore = calculateFromSums(updatedState.factorSums)

  updatedState.currentScore = newScore
  updatedState.lastIncrementalUpdate = new Date()

  // Check if reconciliation needed
  const needsReconciliation = shouldReconcile(updatedState)

  if (needsReconciliation) {
    // Queue background reconciliation job
    await queueReconciliationJob(contentId)
    updatedState.driftDetected = true
  }

  // Save state
  await redis.set(stateKey, updatedState, { ex: INCREMENTAL_SCORING_CONFIG.stateTTL })

  return {
    score: newScore,
    isApproximate: !needsReconciliation
  }
}

function updateFactorSums(
  state: IncrementalScoreState,
  response: ResponseMetrics
): IncrementalScoreState {
  const updated = { ...state, factorSums: { ...state.factorSums } }

  // Response quality factors (direct from response)
  if (response.completionTime !== null) {
    const responseTimeScore = calculateResponseTimeScore(response.completionTime, response.expectedTime)
    updated.factorSums.responseQuality.sum += responseTimeScore
    updated.factorSums.responseQuality.count++
  }

  // Sample quality factors (aggregated)
  if (response.demographicData) {
    updated.factorSums.sampleQuality.sum += calculateDemographicContribution(response.demographicData)
    updated.factorSums.sampleQuality.count++
  }

  // Participant verification (from fraud checks)
  if (response.fraudScore !== undefined) {
    const verificationScore = 100 - (response.fraudScore * 100)
    updated.factorSums.participantVerification.sum += verificationScore
    updated.factorSums.participantVerification.count++
  }

  return updated
}

function calculateFromSums(factorSums: IncrementalScoreState["factorSums"]): number {
  const categoryScores = {
    sampleQuality: factorSums.sampleQuality.count > 0
      ? factorSums.sampleQuality.sum / factorSums.sampleQuality.count
      : 50,
    responseQuality: factorSums.responseQuality.count > 0
      ? factorSums.responseQuality.sum / factorSums.responseQuality.count
      : 50,
    methodology: factorSums.methodology.count > 0
      ? factorSums.methodology.sum / factorSums.methodology.count
      : 50,
    participantVerification: factorSums.participantVerification.count > 0
      ? factorSums.participantVerification.sum / factorSums.participantVerification.count
      : 50
  }

  return Math.round(
    categoryScores.sampleQuality * WEIGHTS.sampleQuality.total +
    categoryScores.responseQuality * WEIGHTS.responseQuality.total +
    categoryScores.methodology * WEIGHTS.methodology.total +
    categoryScores.participantVerification * WEIGHTS.participantVerification.total
  )
}

function shouldReconcile(state: IncrementalScoreState): boolean {
  const { reconciliation } = INCREMENTAL_SCORING_CONFIG

  // Time-based reconciliation
  const timeSinceFullRecalc = Date.now() - state.lastFullRecalculation.getTime()
  if (timeSinceFullRecalc > reconciliation.maxAge) {
    return true
  }

  // Response count based reconciliation
  const totalResponses = state.factorSums.responseQuality.count
  if (totalResponses > 0 && totalResponses % reconciliation.responseInterval === 0) {
    return true
  }

  return false
}
```


## 4.10.3 Background Reconciliation Job

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// BACKGROUND RECONCILIATION - Corrects drift between incremental and full scores
// ══════════════════════════════════════════════════════════════════════════════

interface ReconciliationJob {
  contentId: string
  priority: "high" | "normal" | "low"
  reason: "time_based" | "count_based" | "drift_detected" | "manual"
  scheduledAt: Date
}

const RECONCILIATION_QUEUE = "queue:score:reconciliation"

async function queueReconciliationJob(
  contentId: string,
  reason: ReconciliationJob["reason"] = "drift_detected"
): Promise<void> {
  const redis = getRedisClient()

  const job: ReconciliationJob = {
    contentId,
    priority: reason === "drift_detected" ? "high" : "normal",
    reason,
    scheduledAt: new Date()
  }

  // Add to sorted set with priority score
  const priorityScore = job.priority === "high" ? 0 : job.priority === "normal" ? 1 : 2
  await redis.zadd(RECONCILIATION_QUEUE, { score: priorityScore, member: JSON.stringify(job) })
}

// Worker process (runs every 15 minutes via cron)
async function processReconciliationQueue(): Promise<void> {
  const redis = getRedisClient()
  const batchSize = 50 // Process up to 50 content items per run

  // Get highest priority jobs
  const jobs = await redis.zpopmin(RECONCILIATION_QUEUE, batchSize)

  for (const jobJson of jobs) {
    const job: ReconciliationJob = JSON.parse(jobJson.member)

    try {
      await reconcileScore(job.contentId)
    } catch (error) {
      // Re-queue with lower priority on failure
      await queueReconciliationJob(job.contentId, "manual")
      console.error(`Reconciliation failed for ${job.contentId}:`, error)
    }
  }
}

async function reconcileScore(contentId: string): Promise<void> {
  const redis = getRedisClient()
  const stateKey = INCREMENTAL_SCORING_CONFIG.cacheKey(contentId)

  // Get current incremental state
  const state = await redis.get<IncrementalScoreState>(stateKey)
  const incrementalScore = state?.currentScore ?? null

  // Do full recalculation
  const fullResult = await calculateFullReliabilityScore(contentId)

  // Check drift
  if (incrementalScore !== null) {
    const drift = Math.abs(fullResult.overallScore - incrementalScore)

    if (drift > INCREMENTAL_SCORING_CONFIG.reconciliation.maxDrift) {
      // Log significant drift for monitoring
      await logScoringDrift({
        contentId,
        incrementalScore,
        fullScore: fullResult.overallScore,
        drift,
        timestamp: new Date()
      })
    }
  }

  // Reset incremental state with correct values
  const newState = initializeIncrementalState(contentId, fullResult)
  await redis.set(stateKey, newState, { ex: INCREMENTAL_SCORING_CONFIG.stateTTL })

  // Update database with authoritative score
  await db.update(content)
    .set({
      reliabilityScore: fullResult.overallScore,
      reliabilityFactors: fullResult.factors,
      lastScoreUpdate: new Date()
    })
    .where(eq(content.id, contentId))
}

function initializeIncrementalState(
  contentId: string,
  fullResult: ReliabilityScoreResult
): IncrementalScoreState {
  return {
    contentId,
    currentScore: fullResult.overallScore,
    factorSums: {
      sampleQuality: {
        sum: fullResult.categoryScores.sampleQuality,
        count: 1
      },
      responseQuality: {
        sum: fullResult.categoryScores.responseQuality,
        count: 1
      },
      methodology: {
        sum: fullResult.categoryScores.methodology,
        count: 1
      },
      participantVerification: {
        sum: fullResult.categoryScores.participantVerification,
        count: 1
      }
    },
    lastFullRecalculation: new Date(),
    lastIncrementalUpdate: new Date(),
    driftDetected: false
  }
}
```


## 4.10.4 API Integration

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// API LAYER - Uses incremental scoring for real-time, full for display
// ══════════════════════════════════════════════════════════════════════════════

// Called on every response submission
async function onResponseSubmitted(
  contentId: string,
  response: SurveyResponse | PollVote
): Promise<void> {
  const metrics = extractResponseMetrics(response)

  // Fast incremental update (O(1))
  const { score, isApproximate } = await incrementalScoreUpdate(contentId, metrics)

  // Broadcast real-time update via SSE
  await broadcastScoreUpdate({
    contentId,
    score,
    isApproximate,
    timestamp: new Date()
  })
}

// Called when displaying detailed results
async function getReliabilityScoreForDisplay(
  contentId: string
): Promise<ReliabilityScoreResult> {
  // Check if we have recent full calculation
  const [contentRecord] = await db.select({
    reliabilityScore: content.reliabilityScore,
    reliabilityFactors: content.reliabilityFactors,
    lastScoreUpdate: content.lastScoreUpdate
  })
    .from(content)
    .where(eq(content.id, contentId))

  const maxAge = 5 * 60 * 1000 // 5 minutes for display
  const isStale = !content?.lastScoreUpdate ||
    Date.now() - content.lastScoreUpdate.getTime() > maxAge

  if (isStale) {
    // Trigger background recalc but return cached for now
    await queueReconciliationJob(contentId, "time_based")
  }

  // Return cached or incremental
  const redis = getRedisClient()
  const state = await redis.get<IncrementalScoreState>(
    INCREMENTAL_SCORING_CONFIG.cacheKey(contentId)
  )

  return {
    overallScore: state?.currentScore ?? content?.reliabilityScore ?? 50,
    categoryScores: content?.reliabilityFactors?.categoryScores ?? getDefaultCategoryScores(),
    factors: content?.reliabilityFactors ?? getDefaultFactors(),
    label: getScoreLabel(state?.currentScore ?? 50),
    confidenceLevel: getConfidenceLevel(state?.currentScore ?? 50)
  }
}
```


## 4.10.5 Monitoring & Alerts

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SCORING SYSTEM MONITORING
// ══════════════════════════════════════════════════════════════════════════════

const SCORING_METRICS = {
  // Prometheus metrics
  incrementalUpdatesTotal: new Counter({
    name: "voxpoll_score_incremental_updates_total",
    help: "Total incremental score updates"
  }),

  reconciliationsTotal: new Counter({
    name: "voxpoll_score_reconciliations_total",
    help: "Total full score reconciliations",
    labelNames: ["reason"]
  }),

  driftHistogram: new Histogram({
    name: "voxpoll_score_drift",
    help: "Score drift between incremental and full calculation",
    buckets: [0.5, 1, 2, 3, 5, 10]
  }),

  reconciliationLatency: new Histogram({
    name: "voxpoll_score_reconciliation_latency_ms",
    help: "Time to complete full score reconciliation",
    buckets: [50, 100, 200, 500, 1000, 2000]
  }),

  queueDepth: new Gauge({
    name: "voxpoll_score_reconciliation_queue_depth",
    help: "Number of pending reconciliation jobs"
  })
}

// Alert thresholds
const SCORING_ALERTS = {
  // High drift rate suggests algorithm issue
  highDriftRate: {
    threshold: 0.1, // >10% of reconciliations have drift > 3 points
    window: "1h",
    severity: "warning"
  },

  // Queue backing up
  queueBacklog: {
    threshold: 1000, // >1000 pending jobs
    severity: "critical"
  },

  // Reconciliation taking too long
  slowReconciliation: {
    threshold: 5000, // >5 seconds average
    window: "15m",
    severity: "warning"
  }
}
```




# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 04
# ══════════════════════════════════════════════════════════════════════════════
# Status: COMPLETE
# Last Updated: January 2026
# Next Section: SECTION 05 - USER & ORGANIZATION MANAGEMENT
# ══════════════════════════════════════════════════════════════════════════════