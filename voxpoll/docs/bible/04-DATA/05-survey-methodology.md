# ═══════════════════════════════════════════════════════════════════════════════
# DATA - Survey Methodology & Data Quality
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-003.md
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════

# References:
# - AAPOR (American Association for Public Opinion Research) Standards
# - Cochran, W.G. (1977). Sampling Techniques
# - Krosnick, J.A. (1999). Survey Research. Annual Review of Psychology
# - Groves, R.M. et al. (2009). Survey Methodology



# ═══════════════════════════════════════════════════════════════════════════════
# SAMPLING FUNDAMENTALS
# ═══════════════════════════════════════════════════════════════════════════════

## Sampling Methods Overview

VOXPOLL supports different sampling approaches depending on the content type and
creator's needs. Understanding these methods is critical for interpreting results.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           SAMPLING METHODS COMPARISON                            │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  METHOD              │ DESCRIPTION              │ USE CASE        │ RELIABILITY │
│  ────────────────────┼──────────────────────────┼─────────────────┼─────────────│
│  Probability         │                          │                 │             │
│  - Simple Random     │ Every member has equal   │ General public  │ Highest     │
│                      │ chance of selection      │ opinion polls   │             │
│  - Stratified        │ Population divided into  │ Demographic     │ High        │
│                      │ subgroups, sample from   │ representation  │             │
│                      │ each proportionally      │ studies         │             │
│  - Cluster           │ Groups selected, all     │ Geographic      │ Medium-High │
│                      │ members in group sampled │ surveys         │             │
│                                                                                  │
│  Non-Probability     │                          │                 │             │
│  - Convenience       │ Whoever is available     │ Quick polls,    │ Low         │
│                      │ and willing              │ social media    │             │
│  - Voluntary         │ Self-selected            │ Online polls    │ Low         │
│                      │ participants             │                 │             │
│  - Quota             │ Non-random selection     │ Market research │ Medium      │
│                      │ to match demographics    │                 │             │
│  - Purposive         │ Specific criteria        │ Expert panels,  │ Medium      │
│                      │ for selection            │ niche surveys   │             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```


## VOXPOLL Sampling Classification

### Content Type -> Default Sampling Method

| Content Type | Default Method | Rationale | Can Upgrade? |
|--------------|----------------|-----------|-------------|
| Poll (Public) | Convenience/Voluntary | Open participation, social discovery | No |
| Poll (with Pre-test) | Quota/Purposive | Filtered by demographics or criteria | Yes |
| Survey (Internal) | Census or Stratified | Organization members, controlled | Yes |
| Survey (External) | Quota/Purposive | Pre-test defines target population | Yes |
| Test | N/A | Not statistical inference, individual results | N/A |


### Sampling Method Indicator in UI

Display sampling method badge on all content:

```
┌─────────────────────────────────────────┐
│  Poll Results                           │
│  ─────────────────────────────────────  │
│  Sample: 1,247 participants             │
│  Method: Voluntary (Self-Selected)      │
│  ─────────────────────────────────────  │
│  Warning: Results may not represent the │
│     general population                  │
└─────────────────────────────────────────┘
```


## Population & Sample Definitions

| Term | Definition | VOXPOLL Context |
|------|------------|----------------|
| Population | Complete set of individuals of interest | All potential respondents |
| Target Population | Specific subset the survey aims to represent | Defined by pre-test criteria |
| Sampling Frame | List from which sample is drawn | VOXPOLL user base |
| Sample | Actual respondents who complete the survey | Completed responses |
| Response Rate | Sample / Invited x 100 | For private surveys only |



# ═══════════════════════════════════════════════════════════════════════════════
# SAMPLE SIZE CALCULATION
# ═══════════════════════════════════════════════════════════════════════════════

## Cochran Formula (Infinite Population)

Reference: Cochran, W.G. (1977). Sampling Techniques, 3rd Edition

For large or unknown populations, use the Cochran formula:

```
        z^2 x p x (1 - p)
  n0 = ───────────────────
              e^2

Where:
  n0 = Required sample size
  z  = Z-score for desired confidence level
  p  = Estimated proportion (use 0.5 for maximum variability)
  e  = Desired margin of error (as decimal)
```


### Z-Score Values by Confidence Level

| Confidence Level | Z-Score | Common Use |
|-----------------|---------|------------|
| 80% | 1.282 | Quick estimates |
| 85% | 1.440 | Preliminary research |
| 90% | 1.645 | General surveys |
| 95% | 1.960 | Standard research |
| 99% | 2.576 | High-stakes decisions |


## Finite Population Correction

When the population size (N) is known and the sample represents more than 5% of
the population, apply the finite population correction:

```
              n0
  n = ─────────────────
        1 + (n0 - 1) / N

Where:
  n  = Adjusted sample size
  n0 = Sample size from Cochran formula
  N  = Total population size
```


## Sample Size Reference Table

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    SAMPLE SIZE REQUIREMENTS (95% Confidence)                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Population    │ +-3% MoE │ +-5% MoE │ +-7% MoE │ +-10% MoE │ Notes             │
│  ──────────────┼──────────┼──────────┼──────────┼───────────┼───────────────────│
│  100           │ 92       │ 80       │ 67       │ 49        │ Small org         │
│  500           │ 341      │ 217      │ 145      │ 81        │ Medium org        │
│  1,000         │ 516      │ 278      │ 169      │ 88        │ Large org         │
│  5,000         │ 879      │ 357      │ 196      │ 94        │ Enterprise        │
│  10,000        │ 964      │ 370      │ 200      │ 95        │ Large enterprise  │
│  100,000       │ 1,056    │ 383      │ 204      │ 96        │ City              │
│  1,000,000     │ 1,066    │ 384      │ 204      │ 96        │ National          │
│  Infinite      │ 1,068    │ 385      │ 204      │ 96        │ Very large        │
│                                                                                  │
│  Calculated using Cochran formula with p=0.5, z=1.96                            │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```


## Sample Size Implementation

```typescript
type ConfidenceLevel = 80 | 85 | 90 | 95 | 99

const Z_SCORES: Record<ConfidenceLevel, number> = {
  80: 1.282,
  85: 1.440,
  90: 1.645,
  95: 1.960,
  99: 2.576
}

interface SampleSizeParams {
  confidenceLevel: ConfidenceLevel
  marginOfError: number
  populationProportion?: number
  populationSize?: number
}

interface SampleSizeResult {
  requiredSampleSize: number
  infiniteSampleSize: number
  appliedCorrection: boolean
  formula: string
}

function calculateSampleSize(params: SampleSizeParams): SampleSizeResult {
  const {
    confidenceLevel,
    marginOfError,
    populationProportion = 0.5,
    populationSize
  } = params

  if (marginOfError <= 0 || marginOfError > 1) {
    throw new Error("marginOfError must be between 0 (exclusive) and 1 (inclusive)")
  }
  if (populationProportion < 0 || populationProportion > 1) {
    throw new Error("populationProportion must be between 0 and 1")
  }
  if (populationSize !== undefined && populationSize < 1) {
    throw new Error("populationSize must be at least 1")
  }

  const z = Z_SCORES[confidenceLevel]
  const p = populationProportion
  const e = marginOfError

  const n0 = (z * z * p * (1 - p)) / (e * e)

  let n = n0
  let appliedCorrection = false

  if (populationSize && n0 / populationSize > 0.05) {
    n = n0 / (1 + (n0 - 1) / populationSize)
    appliedCorrection = true
  }

  return {
    requiredSampleSize: Math.ceil(n),
    infiniteSampleSize: Math.ceil(n0),
    appliedCorrection,
    formula: appliedCorrection ? "Cochran with FPC" : "Cochran"
  }
}

export { calculateSampleSize, Z_SCORES }
export type { SampleSizeParams, SampleSizeResult, ConfidenceLevel }
```



# ═══════════════════════════════════════════════════════════════════════════════
# MARGIN OF ERROR & CONFIDENCE INTERVALS
# ═══════════════════════════════════════════════════════════════════════════════

## Margin of Error Calculation

The margin of error represents the range within which the true population value
is expected to fall.

```
             _______________
            /  p x (1 - p)
  MoE = z x / ─────────────
          V        n

Where:
  MoE = Margin of Error
  z   = Z-score for confidence level
  p   = Sample proportion
  n   = Sample size
```


## Margin of Error Implementation

```typescript
interface MarginOfErrorParams {
  sampleProportion: number
  sampleSize: number
  confidenceLevel: ConfidenceLevel
  populationSize?: number
}

interface MarginOfErrorResult {
  marginOfError: number
  lowerBound: number
  upperBound: number
  confidenceLevel: number
}

function calculateMarginOfError(params: MarginOfErrorParams): MarginOfErrorResult {
  const { sampleProportion, sampleSize, confidenceLevel, populationSize } = params

  const z = Z_SCORES[confidenceLevel]
  const p = sampleProportion
  const n = sampleSize

  let moe = z * Math.sqrt((p * (1 - p)) / n)

  if (populationSize && n / populationSize > 0.05) {
    const fpc = Math.sqrt((populationSize - n) / (populationSize - 1))
    moe = moe * fpc
  }

  return {
    marginOfError: moe,
    lowerBound: Math.max(0, p - moe),
    upperBound: Math.min(1, p + moe),
    confidenceLevel
  }
}

export { calculateMarginOfError }
export type { MarginOfErrorParams, MarginOfErrorResult }
```


## Result Display with Confidence Intervals

```
┌─────────────────────────────────────────────────────────────────┐
│  "Should we implement a 4-day work week?"                       │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Yes     [████████████████████████░░░░░]  62% (59-65%)         │
│  No      [██████████████░░░░░░░░░░░░░░░]  38% (35-41%)         │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│  1,247 responses │ 95% CI │ +-3% margin of error               │
│                                                                 │
│  We're 95% confident the true value falls within               │
│  the ranges shown in parentheses                               │
└─────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# BIAS TYPES & PREVENTION
# ═══════════════════════════════════════════════════════════════════════════════

## Comprehensive Bias Taxonomy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              SURVEY BIAS TYPES                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  CATEGORY              │ BIAS TYPE           │ VOXPOLL MITIGATION               │
│  ──────────────────────┼─────────────────────┼──────────────────────────────────│
│                        │                     │                                  │
│  SELECTION BIAS        │                     │                                  │
│  (Who responds)        │                     │                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                        │ Self-selection      │ Pre-test filtering               │
│                        │ Undercoverage       │ Multiple distribution channels   │
│                        │ Survivorship        │ Track dropouts, display rates    │
│                        │ Volunteer bias      │ Display sampling method warning  │
│                        │                     │                                  │
│  RESPONSE BIAS         │                     │                                  │
│  (How they respond)    │                     │                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                        │ Social desirability │ Anonymity guarantees + education │
│                        │ Acquiescence        │ Balanced scales, reverse items   │
│                        │ Extreme responding  │ Midpoint options, scale variety  │
│                        │ Satisficing         │ Attention checks, time tracking  │
│                        │ Straight-lining     │ Pattern detection + flagging     │
│                        │                     │                                  │
│  QUESTION BIAS         │                     │                                  │
│  (Question design)     │                     │                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                        │ Leading questions   │ Question quality guidelines      │
│                        │ Double-barreled     │ Validation rules during creation │
│                        │ Loaded language     │ Neutral language recommendations │
│                        │ Ambiguity           │ Clear, specific wording guides   │
│                        │                     │                                  │
│  ORDER EFFECTS         │                     │                                  │
│  (Sequence matters)    │                     │                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                        │ Primacy effect      │ Option randomization             │
│                        │ Recency effect      │ Option randomization             │
│                        │ Context effect      │ Question randomization (optional)│
│                        │ Anchoring           │ Rotate scale directions          │
│                        │                     │                                  │
│  NON-RESPONSE BIAS     │                     │                                  │
│  (Who doesn't respond) │                     │                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                        │ Unit non-response   │ Response rate display            │
│                        │ Item non-response   │ Completion rate tracking         │
│                        │ Dropout patterns    │ Progress point analysis          │
│                        │                     │                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```


## Option Randomization

Randomize option order by default for single/multiple choice questions:

```typescript
interface RandomizationConfig {
  enabled: boolean
  preserveNoneOfAbove: boolean
  preserveOther: boolean
  seed?: string
}

function randomizeOptions<T extends { id: string, isNoneOfAbove?: boolean, isOther?: boolean }>(
  options: T[],
  config: RandomizationConfig,
  userId: string
): T[] {
  if (!config.enabled) return options

  const seed = config.seed || userId
  const rng = createSeededRandom(seed)

  const specialOptions: T[] = []
  const regularOptions: T[] = []

  for (const option of options) {
    if ((config.preserveNoneOfAbove && option.isNoneOfAbove) ||
        (config.preserveOther && option.isOther)) {
      specialOptions.push(option)
    } else {
      regularOptions.push(option)
    }
  }

  const shuffled = shuffleWithSeed(regularOptions, rng)

  return [...shuffled, ...specialOptions]
}

export { randomizeOptions }
export type { RandomizationConfig }
```


## Question Randomization Settings

```
Randomization Settings:
- Randomize options within questions: ON (default)
- Randomize questions within sections: OFF (optional)
- Preserve "None of the above" position: ON (default)
- Preserve "Other" position: ON (default)
```


## Social Desirability Bias Mitigation

For sensitive topics, implement multiple strategies:

1. **Anonymity Assurance**: Clear explanation of how anonymity works
2. **Indirect Questioning**: Option to ask about "people in your situation"
3. **Randomized Response Technique**: For highly sensitive surveys (Enterprise)
4. **Item Count Technique**: Alternative method for sensitive topics

```
┌─────────────────────────────────────────────────────────────────┐
│  Your Response is Anonymous                                      │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Your answers cannot be linked to your identity:                │
│  - Responses stored separately from user data                   │
│  - No IP addresses or device IDs saved with answers             │
│  - Minimum 5 responses before any results shown                 │
│  - Demographic breakdowns hidden if group < 10                  │
│                                                                 │
│  [Learn More About Our Anonymity Guarantee]                     │
└─────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# QUESTION DESIGN STANDARDS
# ═══════════════════════════════════════════════════════════════════════════════

## The BRUSO Framework

Reference: Krosnick, J.A. & Presser, S. (2010). Question and Questionnaire Design

| Principle | Description | Example |
|-----------|-------------|--------|
| **B**rief | Keep questions short and simple | Bad: "Taking into account all factors..." |
| **R**elevant | Every question serves a purpose | Remove "nice to know" questions |
| **U**nambiguous | One clear interpretation only | Bad: "Do you regularly exercise?" -> Good: "How many days per week..." |
| **S**pecific | Concrete, not abstract | Bad: "Are you satisfied?" -> Good: "Rate your satisfaction with..." |
| **O**bjective | Neutral, non-leading | Bad: "Don't you agree that..." |


## Question Type Guidelines

### Single Choice Questions

```
GOOD Practice:
  "What is your primary mode of transportation to work?"
  - Personal car
  - Public transit
  - Bicycle
  - Walking
  - Work from home
  - Other

BAD Practice:
  "How do you usually commute?"  <- Ambiguous (to where?)
  - Car                          <- Missing specifics
  - Bus                          <- Incomplete options
  - Train
```


### Likert Scale Questions

```
GOOD Practice:
  "I feel valued by my manager."
  - Strongly disagree
  - Disagree
  - Neither agree nor disagree
  - Agree
  - Strongly agree

BAD Practice:
  "My manager values me and provides good feedback."  <- Double-barreled
  - Disagree
  - Somewhat agree                                     <- Unbalanced scale
  - Agree
  - Strongly agree
```


### Balanced Scales

Use balanced scales with equal positive and negative options:

```
GOOD: Balanced 5-point Likert
   Strongly Disagree | Disagree | Neutral | Agree | Strongly Agree

BAD: Unbalanced scale
   Disagree | Neutral | Slightly Agree | Agree | Strongly Agree
```


## Question Validation Rules

Validate questions during creation:

```typescript
interface QuestionValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

const QUESTION_RULES = {
  minLength: 10,
  maxLength: 500,
  minOptions: 2,
  maxOptions: 20,

  patterns: {
    leadingQuestion: /^(don't you|isn't it|wouldn't you|aren't you)/i,
    doubleBarreled: /\b(and|or)\b.*\?$/,
    loadedLanguage: /(obviously|clearly|everyone knows|of course)/i,
    absoluteTerms: /\b(always|never|all|none|every)\b/i
  },

  warnings: {
    tooLong: 200,
    tooManyOptions: 10,
    noNeutralOption: true
  }
}

function validateQuestion(question: Question): QuestionValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  if (question.text.length < QUESTION_RULES.minLength) {
    errors.push({ code: "TOO_SHORT", message: "Question is too short" })
  }

  if (QUESTION_RULES.patterns.leadingQuestion.test(question.text)) {
    errors.push({ code: "LEADING", message: "Question appears to be leading" })
  }

  if (QUESTION_RULES.patterns.doubleBarreled.test(question.text)) {
    warnings.push({
      code: "DOUBLE_BARRELED",
      message: "Question may be asking about multiple things"
    })
  }

  if (question.text.length > QUESTION_RULES.warnings.tooLong) {
    warnings.push({
      code: "LONG",
      message: "Consider shortening for better comprehension"
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export { validateQuestion, QUESTION_RULES }
```


## Mutually Exclusive & Exhaustive Options

Ensure options are mutually exclusive and collectively exhaustive:

```
BAD: Overlapping options
  "What is your age?"
  - 18-25
  - 25-35     <- What if someone is 25?
  - 35-45
  - 45+

GOOD: Mutually exclusive
  "What is your age?"
  - 18-24
  - 25-34
  - 35-44
  - 45-54
  - 55-64
  - 65 or older
  - Prefer not to say
```

```
BAD: Not exhaustive
  "What industry do you work in?"
  - Technology
  - Finance
  - Healthcare

GOOD: Exhaustive with escape valve
  "What industry do you work in?"
  - Technology
  - Finance
  - Healthcare
  - Education
  - Manufacturing
  - Retail
  - Other (please specify)
```



# ═══════════════════════════════════════════════════════════════════════════════
# ATTENTION CHECKS & QUALITY CONTROL
# ═══════════════════════════════════════════════════════════════════════════════

## Attention Check Types

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           ATTENTION CHECK METHODS                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  TYPE                  │ DESCRIPTION                │ EXAMPLE                    │
│  ──────────────────────┼────────────────────────────┼────────────────────────────│
│  Instructional         │ Direct instruction to      │ "Please select 'Agree'     │
│  Manipulation Check    │ select specific answer     │ for this question."        │
│  (IMC)                 │                            │                            │
│  ──────────────────────┼────────────────────────────┼────────────────────────────│
│  Bogus Item            │ Question with obvious      │ "I have been to Mars in    │
│                        │ correct answer             │ the past year."            │
│  ──────────────────────┼────────────────────────────┼────────────────────────────│
│  Consistency Check     │ Repeat question in         │ Same question asked twice, │
│                        │ different form             │ compare answers            │
│  ──────────────────────┼────────────────────────────┼────────────────────────────│
│  Open-ended Screener   │ Simple open question       │ "What is 2 + 2?" (text)    │
│                        │ requiring reading          │                            │
│  ──────────────────────┼────────────────────────────┼────────────────────────────│
│  CAPTCHA/reCAPTCHA     │ Bot detection             │ Image selection, checkbox   │
│  (External)            │                            │                            │
│  ──────────────────────┼────────────────────────────┼────────────────────────────│
│  Honeypot              │ Hidden fields that bots    │ Invisible form field       │
│                        │ fill, humans don't         │                            │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```


## Attention Check Implementation

Include 1-2 attention checks per survey:

```typescript
interface AttentionCheckConfig {
  enabled: boolean
  type: "IMC" | "BOGUS" | "CONSISTENCY" | "OPEN_ENDED"
  position: "RANDOM" | "MIDDLE" | "SPECIFIC"
  specificIndex?: number
  failureAction: "FLAG" | "EXCLUDE" | "WARN_AND_CONTINUE"
  maxFailures: number
}

const DEFAULT_ATTENTION_CHECKS: AttentionCheckConfig[] = [
  {
    enabled: true,
    type: "IMC",
    position: "RANDOM",
    failureAction: "FLAG",
    maxFailures: 1
  },
  {
    enabled: true,
    type: "CONSISTENCY",
    position: "RANDOM",
    failureAction: "FLAG",
    maxFailures: 1
  }
]

const ATTENTION_CHECK_TEMPLATES = {
  IMC: [
    {
      text: "Please read carefully: To show you are paying attention, select 'Strongly Agree' below.",
      correctAnswer: "STRONGLY_AGREE"
    },
    {
      text: "This is an attention check. Please select 'Disagree' for this item.",
      correctAnswer: "DISAGREE"
    }
  ],
  BOGUS: [
    {
      text: "I have visited every country on Earth.",
      correctAnswer: "STRONGLY_DISAGREE"
    },
    {
      text: "I can run faster than the speed of light.",
      correctAnswer: "STRONGLY_DISAGREE"
    }
  ]
}

export { DEFAULT_ATTENTION_CHECKS, ATTENTION_CHECK_TEMPLATES }
export type { AttentionCheckConfig }
```
