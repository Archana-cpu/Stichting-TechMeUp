# ═══════════════════════════════════════════════════════════════════════════════
# DATA - Reliability Scoring System
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-004.md
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# RELIABILITY SCORE OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

The Reliability Score is VOXPOLL's core differentiator. It provides users with
a transparent, quantifiable measure of data quality that enables informed
interpretation of results.

The Reliability Score is a 0-100 numerical rating that indicates the overall
trustworthiness and data quality of a poll, survey, or test's results.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        RELIABILITY SCORE SCALE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Score Range  │ Label        │ Visual     │ Interpretation                     │
│  ─────────────┼──────────────┼────────────┼────────────────────────────────────│
│  90-100       │ Excellent    │ Green x5   │ Research-grade, highly reliable    │
│  75-89        │ Good         │ Green x4   │ Solid methodology, trustworthy     │
│  60-74        │ Moderate     │ Yellow x3  │ Acceptable, interpret with care    │
│  40-59        │ Limited      │ Orange x2  │ Significant limitations            │
│  0-39         │ Low          │ Red x1     │ Entertainment only, not reliable   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# SCORE VISIBILITY RULES
# ═══════════════════════════════════════════════════════════════════════════════

| Viewer Type | Can See Score? | Can See Breakdown? |
|-------------|----------------|--------------------|
| Content Creator | Yes | Yes (full detail) |
| Participant | Yes | Yes (summary) |
| Premium User (non-participant) | Yes | Yes (summary) |
| Free User (non-participant) | Yes (badge only) | No |
| Public/Anonymous | Yes (badge only) | No |



# ═══════════════════════════════════════════════════════════════════════════════
# SCORE DISPLAY IN UI
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────┐
│  "Should remote work be permanent?"                 │
│  ───────────────────────────────────────────────    │
│                                                     │
│  Reliability Score: 78/100 [Green x4]              │
│  ─────────────────────────────                      │
│  - 2,341 verified participants                     │
│  - Demographic pre-test applied                    │
│  - 97.2% response quality rate                     │
│                                                     │
│  [View Methodology]                                 │
└─────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# SCORING FACTORS & WEIGHTS
# ═══════════════════════════════════════════════════════════════════════════════

The Reliability Score is composed of four main categories:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       RELIABILITY SCORE COMPOSITION                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │   SAMPLE QUALITY (35%)                                                  │   │
│  │   - Sample Size Adequacy           (15%)                               │   │
│  │   - Response Rate                  (10%)  [Private surveys only]       │   │
│  │   - Demographic Coverage           (10%)                               │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │   RESPONSE QUALITY (30%)                                                │   │
│  │   - Completion Rate                (10%)                               │   │
│  │   - Response Time Validity         (10%)                               │   │
│  │   - Attention Check Pass Rate      (10%)                               │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │   METHODOLOGY (20%)                                                     │   │
│  │   - Sampling Method                (8%)                                │   │
│  │   - Question Quality               (7%)                                │   │
│  │   - Pre-test Usage                 (5%)                                │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │   PARTICIPANT VERIFICATION (15%)                                        │   │
│  │   - User Verification Level        (8%)                                │   │
│  │   - Fraud Detection Pass Rate      (7%)                                │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Total: 100%                                                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# FACTOR DEFINITIONS & SCORING RULES
# ═══════════════════════════════════════════════════════════════════════════════

## Sample Quality Factors (35%)

### Sample Size Adequacy (15%)

| Condition | Score | Formula |
|-----------|-------|--------|
| n >= Recommended (95% CI, +-5%) | 100 | Full marks |
| n >= 75% of recommended | 80 | Linear interpolation |
| n >= 50% of recommended | 60 | Linear interpolation |
| n >= 25% of recommended | 40 | Linear interpolation |
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


### Response Rate (10%) - Private Surveys Only

| Response Rate | Score | Context |
|---------------|-------|--------|
| >= 70% | 100 | Excellent engagement |
| 50-69% | 80 | Good engagement |
| 30-49% | 60 | Moderate engagement |
| 15-29% | 40 | Low engagement |
| < 15% | 20 | Very low engagement |

For public polls (no invitation list), this factor is replaced with
"Organic Reach" - ratio of participants to content views.


### Demographic Coverage (10%)

| Condition | Score |
|-----------|-------|
| All target demographics represented | 100 |
| >= 80% of target demographics represented | 80 |
| >= 60% of target demographics represented | 60 |
| >= 40% of target demographics represented | 40 |
| < 40% or no demographic tracking | 20 |


## Response Quality Factors (30%)

### Completion Rate (10%)

| Completion Rate | Score |
|-----------------|-------|
| >= 95% | 100 |
| 85-94% | 85 |
| 75-84% | 70 |
| 60-74% | 50 |
| < 60% | 30 |


### Response Time Validity (10%)

| Valid Response % | Score |
|------------------|-------|
| >= 98% | 100 |
| 95-97% | 85 |
| 90-94% | 70 |
| 80-89% | 50 |
| < 80% | 30 |


### Attention Check Pass Rate (10%)

| Pass Rate | Score |
|-----------|-------|
| >= 95% | 100 |
| 90-94% | 85 |
| 85-89% | 70 |
| 75-84% | 50 |
| < 75% | 30 |

If no attention checks were used, this factor scores 50 (neutral).


## Methodology Factors (20%)

### Sampling Method (8%)

| Method | Score | Rationale |
|--------|-------|----------|
| Probability (Random/Stratified) | 100 | Gold standard |
| Quota Sampling | 75 | Controlled representation |
| Purposive Sampling | 60 | Targeted but limited |
| Convenience/Voluntary | 40 | Self-selection bias |
| Unknown/Not specified | 20 | Cannot evaluate |


### Question Quality (7%)

| Condition | Score |
|-----------|-------|
| All questions pass validation | 100 |
| Minor warnings only | 80 |
| 1-2 quality issues | 60 |
| 3+ quality issues | 40 |
| Critical issues (leading, double-barreled) | 20 |


### Pre-test Usage (5%)

| Pre-test Configuration | Score |
|------------------------|-------|
| Multi-layer pre-test (demographic + screening + knowledge) | 100 |
| Two-layer pre-test | 80 |
| Single-layer pre-test | 60 |
| No pre-test but has eligibility criteria | 40 |
| Open to all, no filtering | 20 |


## Participant Verification Factors (15%)

### User Verification Level (8%)

| Average Level | Score | Description |
|---------------|-------|------------|
| >= 3.5 | 100 | Mostly e-Government verified |
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


### Fraud Detection Pass Rate (7%)

| Pass Rate | Score |
|-----------|-------|
| >= 99% | 100 |
| 97-98% | 85 |
| 95-96% | 70 |
| 90-94% | 50 |
| < 90% | 30 |



# ═══════════════════════════════════════════════════════════════════════════════
# SCORE CALCULATION ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

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



# ═══════════════════════════════════════════════════════════════════════════════
# SCORE DISPLAY & VISUALIZATION
# ═══════════════════════════════════════════════════════════════════════════════

## Score Badge Variants

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       RELIABILITY BADGE VARIANTS                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  COMPACT (Feed/List View):                                                      │
│  ┌──────────────┐                                                              │
│  │ [Green] 78   │  <- Score + color indicator                                  │
│  └──────────────┘                                                              │
│                                                                                 │
│  STANDARD (Content Header):                                                     │
│  ┌──────────────────────────┐                                                  │
│  │ Reliability: 78/100      │                                                  │
│  │ [Green x4] Good          │                                                  │
│  └──────────────────────────┘                                                  │
│                                                                                 │
│  EXPANDED (Detail View):                                                        │
│  ┌───────────────────────────────────────────────────────┐                     │
│  │ Reliability Score: 78/100                             │                     │
│  │ [Progress Bar 78%]                                    │                     │
│  │                                                       │                     │
│  │ Sample Quality      [Bar 75]                          │                     │
│  │ Response Quality    [Bar 85]                          │                     │
│  │ Methodology         [Bar 80]                          │                     │
│  │ Verification        [Bar 70]                          │                     │
│  │                                                       │                     │
│  │ [View Detailed Breakdown]                             │                     │
│  └───────────────────────────────────────────────────────┘                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Score Breakdown Modal

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Reliability Score Breakdown                                              [X]   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Overall Score: 78/100 (Good)                                                  │
│  ════════════════════════════════════════════════════════════════════          │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ SAMPLE QUALITY (35% weight)                              Score: 75/100 │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ [Check] Sample Size: 1,247 of 385 recommended (100%)                   │   │
│  │ [Check] Response Rate: N/A (Public poll)                               │   │
│  │ [Warning] Demographic Coverage: 68% of target groups represented       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ RESPONSE QUALITY (30% weight)                            Score: 85/100 │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ [Check] Completion Rate: 94% (1,172 of 1,247)                          │   │
│  │ [Check] Valid Response Timing: 97.3%                                   │   │
│  │ [Check] Attention Check Pass Rate: 96.1%                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ METHODOLOGY (20% weight)                                 Score: 80/100 │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ [Warning] Sampling Method: Voluntary (40 points)                       │   │
│  │ [Check] Question Quality: All questions pass validation (100 points)   │   │
│  │ [Check] Pre-test: Demographic filtering applied (60 points)            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ PARTICIPANT VERIFICATION (15% weight)                    Score: 70/100 │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ [Check] Average Verification Level: 2.1 (Phone + Profile)              │   │
│  │ [Check] Fraud Detection Pass Rate: 98.7%                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ───────────────────────────────────────────────────────────────────────────    │
│  How to improve this score:                                                    │
│  - Use stratified sampling for higher methodology score                        │
│  - Enable e-Government verification for higher verification score              │
│  - Add knowledge pre-test for better participant qualification                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# CONTENT-TYPE SPECIFIC SCORING
# ═══════════════════════════════════════════════════════════════════════════════

## Poll Scoring Adjustments

Polls are typically casual and have lower baseline expectations:

| Factor | Standard Weight | Poll Adjustment | Rationale |
|--------|-----------------|-----------------|----------|
| Sample Size | 15% | 12% | Lower expectations |
| Response Rate | 10% | 0% (replaced) | No invite list |
| Sampling Method | 8% | 5% | Usually voluntary |
| Pre-test Usage | 5% | 8% | More important for quality |

Maximum achievable score for polls without pre-test: ~75


## Survey Scoring Adjustments

Surveys (B2B) have higher standards and full factor application:

| Factor | Standard Weight | Survey Adjustment | Rationale |
|--------|-----------------|-------------------|----------|
| Response Rate | 10% | 12% | Critical for org surveys |
| User Verification | 8% | 10% | Org membership matters |
| Pre-test Usage | 5% | 5% | Standard |

Internal surveys with SSO get automatic verification boost.


## Test Scoring Adjustments

Tests focus on psychometric quality rather than sampling:

| Factor | Standard Weight | Test Adjustment | Rationale |
|--------|-----------------|-----------------|----------|
| Sample Size | 15% | 10% | Less critical for individual results |
| Internal Consistency | 0% | 15% | Cronbach's alpha importance |
| Completion Rate | 10% | 15% | Full completion matters |

Additional Test-specific factors:
- **Internal Consistency (Cronbach's alpha)**: Measures how well items correlate
- **Result Stability**: How consistent are results for similar respondents


## Score Multipliers

```typescript
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
```



# ═══════════════════════════════════════════════════════════════════════════════
# QUALITY BADGES & CERTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

## Badge Types

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           QUALITY BADGES                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  VERIFICATION BADGES                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ [BadgeCheck] Verified Creator    Identity verification complete         │   │
│  │ [Building2] Organization         Survey from verified organization      │   │
│  │ [Landmark] Government Partner    Municipal or government entity         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  METHODOLOGY BADGES                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ [BarChart3] Statistically Valid  Sample size requirements met           │   │
│  │ [Target] Targeted Sample         Pre-test filtering applied             │   │
│  │ [FlaskConical] Research Grade    Academic research standards met        │   │
│  │ [ShieldCheck] Fraud Protected    Advanced fraud detection enabled       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  QUALITY BADGES                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ [Star] High Quality              Reliability score >= 80                │   │
│  │ [CheckCircle2] Complete Data     98%+ completion rate                   │   │
│  │ [Lock] Anonymous Verified        Anonymity architecture verified        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Badge Earning Criteria

```typescript
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
    id: "high_quality",
    name: "High Quality",
    icon: "Star",
    category: "QUALITY",
    criteria: (_, metrics) => metrics.reliabilityScore >= 80,
    description: "Reliability score of 80 or higher"
  }
]
```



# ═══════════════════════════════════════════════════════════════════════════════
# USER TRUST SCORING
# ═══════════════════════════════════════════════════════════════════════════════

Separate from content reliability, each user has a Trust Score that reflects
their history of quality participation.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          USER TRUST SCORE                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Purpose:                                                                       │
│  - Weight individual responses in aggregate calculations                        │
│  - Prioritize trusted users for stratified sampling                            │
│  - Identify and flag potentially problematic users                             │
│  - Reward quality participation behavior                                       │
│                                                                                 │
│  Score Range: 0-100                                                            │
│  Default (new users): 50                                                       │
│                                                                                 │
│  IMPORTANT: User Trust Score is NEVER displayed publicly.                      │
│  It is used only for internal quality weighting and is invisible to users.     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## User Trust Score Factors

| Factor | Weight | Positive Impact | Negative Impact |
|--------|--------|-----------------|----------------|
| Account Age | 10% | Longer = better | New accounts start neutral |
| Verification Level | 20% | Higher = better | Unverified = penalty |
| Response Quality History | 30% | Consistent quality | Failed attention checks |
| Completion Rate | 15% | High completion | Frequent abandonment |
| Fraud Flags | 25% | No flags | Any flag = major penalty |


## Trust Score Calculation

```typescript
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

  const verificationScore = factors.verificationLevel * 25

  const responseQualityScore = factors.qualityResponseRate * 100

  const completionScore = factors.completionRate * 100

  let fraudScore = 100
  if (factors.fraudFlagCount > 0) {
    fraudScore = Math.max(0, 100 - factors.fraudFlagCount * 30)
  }

  const overallScore = Math.round(
    accountAgeScore * TRUST_WEIGHTS.accountAge +
    verificationScore * TRUST_WEIGHTS.verificationLevel +
    responseQualityScore * TRUST_WEIGHTS.responseQuality +
    completionScore * TRUST_WEIGHTS.completionRate +
    fraudScore * TRUST_WEIGHTS.fraudHistory
  )

  let tier: UserTrustResult["tier"]
  if (overallScore >= 80) tier = "Trusted"
  else if (overallScore >= 50) tier = "Standard"
  else if (overallScore >= 30) tier = "Probation"
  else tier = "Restricted"

  return {
    score: overallScore,
    tier,
    canParticipateInPremium: overallScore >= 60,
    weightMultiplier: overallScore / 100
  }
}

export { calculateUserTrustScore, TRUST_WEIGHTS }
export type { UserTrustFactors, UserTrustResult }
```
