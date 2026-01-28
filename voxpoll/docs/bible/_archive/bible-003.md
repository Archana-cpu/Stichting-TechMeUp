# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 03                                    █
# █                   SURVEY METHODOLOGY & DATA QUALITY                        █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████

# 📚 REFERENCES:
# - AAPOR (American Association for Public Opinion Research) Standards
# - Cochran, W.G. (1977). Sampling Techniques
# - Krosnick, J.A. (1999). Survey Research. Annual Review of Psychology
# - Groves, R.M. et al. (2009). Survey Methodology




# ══════════════════════════════════════════════════════════════════════════════
# 3.1 SAMPLING FUNDAMENTALS
# ══════════════════════════════════════════════════════════════════════════════

## 3.1.1 Sampling Methods Overview

VOXPOLL supports different sampling approaches depending on the content type and
creator's needs. Understanding these methods is critical for interpreting results.

┌──────────────────────────────────────────────────────────────────────────────────┐
│                           SAMPLING METHODS COMPARISON                            │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  METHOD              │ DESCRIPTION              │ USE CASE        │ RELIABILITY │
│  ────────────────────┼──────────────────────────┼─────────────────┼─────────────│
│  Probability         │                          │                 │             │
│  ├─ Simple Random    │ Every member has equal   │ General public  │ Highest     │
│  │                   │ chance of selection      │ opinion polls   │             │
│  ├─ Stratified       │ Population divided into  │ Demographic     │ High        │
│  │                   │ subgroups, sample from   │ representation  │             │
│  │                   │ each proportionally      │ studies         │             │
│  └─ Cluster          │ Groups selected, all     │ Geographic      │ Medium-High │
│                      │ members in group sampled │ surveys         │             │
│                                                                                  │
│  Non-Probability     │                          │                 │             │
│  ├─ Convenience      │ Whoever is available     │ Quick polls,    │ Low         │
│  │                   │ and willing              │ social media    │             │
│  ├─ Voluntary        │ Self-selected            │ Online polls    │ Low         │
│  │                   │ participants             │                 │             │
│  ├─ Quota            │ Non-random selection     │ Market research │ Medium      │
│  │                   │ to match demographics    │                 │             │
│  └─ Purposive        │ Specific criteria        │ Expert panels,  │ Medium      │
│                      │ for selection            │ niche surveys   │             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘


## 3.1.2 VOXPOLL Sampling Classification

### Content Type → Default Sampling Method

| Content Type | Default Method | Rationale | Can Upgrade? |
|--------------|----------------|-----------|-------------|
| Poll (Public) | Convenience/Voluntary | Open participation, social discovery | No |
| Poll (with Pre-test) | Quota/Purposive | Filtered by demographics or criteria | Yes |
| Survey (Internal) | Census or Stratified | Organization members, controlled | Yes |
| Survey (External) | Quota/Purposive | Pre-test defines target population | Yes |
| Test | N/A | Not statistical inference, individual results | N/A |

### Sampling Method Indicator in UI

[MUST] Display sampling method badge on all content:

```
┌─────────────────────────────────────────┐
│  📊 Poll Results                        │
│  ─────────────────────────────────────  │
│  Sample: 1,247 participants             │
│  Method: 🎯 Voluntary (Self-Selected)   │
│  ─────────────────────────────────────  │
│  ⚠️ Results may not represent the       │
│     general population                  │
└─────────────────────────────────────────┘
```


## 3.1.3 Population & Sample Definitions

| Term | Definition | VOXPOLL Context |
|------|------------|----------------|
| Population | Complete set of individuals of interest | All potential respondents |
| Target Population | Specific subset the survey aims to represent | Defined by pre-test criteria |
| Sampling Frame | List from which sample is drawn | VOXPOLL user base |
| Sample | Actual respondents who complete the survey | Completed responses |
| Response Rate | Sample / Invited × 100 | For private surveys only |




# ══════════════════════════════════════════════════════════════════════════════
# 3.2 SAMPLE SIZE CALCULATION
# ══════════════════════════════════════════════════════════════════════════════

## 3.2.1 Cochran Formula (Infinite Population)

📚 REFERENCE: Cochran, W.G. (1977). Sampling Techniques, 3rd Edition

For large or unknown populations, use the Cochran formula:

```
        z² × p × (1 - p)
  n₀ = ───────────────────
              e²

Where:
  n₀ = Required sample size
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


## 3.2.2 Finite Population Correction

When the population size (N) is known and the sample represents more than 5% of
the population, apply the finite population correction:

```
              n₀
  n = ─────────────────
        1 + (n₀ - 1) / N

Where:
  n  = Adjusted sample size
  n₀ = Sample size from Cochran formula
  N  = Total population size
```


## 3.2.3 Sample Size Reference Table

┌──────────────────────────────────────────────────────────────────────────────────┐
│                    SAMPLE SIZE REQUIREMENTS (95% Confidence)                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Population    │ ±3% MoE  │ ±5% MoE  │ ±7% MoE  │ ±10% MoE │ Notes              │
│  ──────────────┼──────────┼──────────┼──────────┼──────────┼────────────────────│
│  100           │ 92       │ 80       │ 67       │ 49       │ Small org          │
│  500           │ 341      │ 217      │ 145      │ 81       │ Medium org         │
│  1,000         │ 516      │ 278      │ 169      │ 88       │ Large org          │
│  5,000         │ 879      │ 357      │ 196      │ 94       │ Enterprise         │
│  10,000        │ 964      │ 370      │ 200      │ 95       │ Large enterprise   │
│  100,000       │ 1,056    │ 383      │ 204      │ 96       │ City               │
│  1,000,000     │ 1,066    │ 384      │ 204      │ 96       │ National           │
│  ∞ (Infinite)  │ 1,068    │ 385      │ 204      │ 96       │ Very large         │
│                                                                                  │
│  📚 Calculated using Cochran formula with p=0.5, z=1.96                         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘


## 3.2.4 VOXPOLL Sample Size Implementation

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SAMPLE SIZE CALCULATION UTILITY
// ══════════════════════════════════════════════════════════════════════════════

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

  // [EDGE CASE] Validate inputs to prevent division by zero
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


## 3.2.5 Sample Size Recommendations in UI

When creators set up content, provide guidance:

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Sample Size Recommendation                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Your Settings:                                                 │
│  • Target Population: 5,000 employees                          │
│  • Desired Confidence: 95%                                     │
│  • Acceptable Error: ±5%                                       │
│                                                                 │
│  Recommended Minimum: 357 responses                            │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  📈 If you get more responses:                                 │
│  • 400 responses → ±4.7% margin of error                       │
│  • 500 responses → ±4.1% margin of error                       │
│  • 750 responses → ±3.3% margin of error                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 3.3 MARGIN OF ERROR & CONFIDENCE INTERVALS
# ══════════════════════════════════════════════════════════════════════════════

## 3.3.1 Margin of Error Calculation

The margin of error represents the range within which the true population value
is expected to fall.

```
             _______________
            /  p × (1 - p)
  MoE = z × / ─────────────
          √        n

Where:
  MoE = Margin of Error
  z   = Z-score for confidence level
  p   = Sample proportion
  n   = Sample size
```


## 3.3.2 Confidence Interval Display

[MUST] Display confidence intervals for all quantitative results:

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// MARGIN OF ERROR CALCULATION
// ══════════════════════════════════════════════════════════════════════════════

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


## 3.3.3 Result Display with Confidence Intervals

```
┌─────────────────────────────────────────────────────────────────┐
│  "Should we implement a 4-day work week?"                       │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Yes     ████████████████████████░░░░░  62% (59-65%)           │
│  No      ██████████████░░░░░░░░░░░░░░░  38% (35-41%)           │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│  📊 1,247 responses │ 95% CI │ ±3% margin of error             │
│                                                                 │
│  ℹ️ We're 95% confident the true value falls within            │
│     the ranges shown in parentheses                            │
└─────────────────────────────────────────────────────────────────┘
```


## 3.3.4 Statistical Significance Indicator

When comparing groups or tracking changes over time:

```
┌─────────────────────────────────────────────────────────────────┐
│  Support by Department                                          │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Engineering    ████████████████████░░░░░  67% (61-73%)        │
│  Marketing      ████████████████░░░░░░░░░  54% (47-61%)        │
│  Sales          █████████████████████████  82% (76-88%) ⬆️     │
│  Operations     ███████████████░░░░░░░░░░  49% (42-56%)        │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│  ⬆️ Statistically significant difference from company average   │
│  (p < 0.05, non-overlapping confidence intervals)              │
└─────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 3.4 BIAS TYPES & PREVENTION
# ══════════════════════════════════════════════════════════════════════════════

## 3.4.1 Comprehensive Bias Taxonomy

┌──────────────────────────────────────────────────────────────────────────────────┐
│                              SURVEY BIAS TYPES                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  CATEGORY              │ BIAS TYPE           │ VOXPOLL MITIGATION               │
│  ──────────────────────┼─────────────────────┼──────────────────────────────────│
│                        │                     │                                  │
│  SELECTION BIAS        │                     │                                  │
│  (Who responds)        │                     │                                  │
│  ├─────────────────────┼─────────────────────┼──────────────────────────────────│
│  │                     │ Self-selection      │ Pre-test filtering               │
│  │                     │ Undercoverage       │ Multiple distribution channels   │
│  │                     │ Survivorship        │ Track dropouts, display rates    │
│  │                     │ Volunteer bias      │ Display sampling method warning  │
│                        │                     │                                  │
│  RESPONSE BIAS         │                     │                                  │
│  (How they respond)    │                     │                                  │
│  ├─────────────────────┼─────────────────────┼──────────────────────────────────│
│  │                     │ Social desirability │ Anonymity guarantees + education │
│  │                     │ Acquiescence        │ Balanced scales, reverse items   │
│  │                     │ Extreme responding  │ Midpoint options, scale variety  │
│  │                     │ Satisficing         │ Attention checks, time tracking  │
│  │                     │ Straight-lining     │ Pattern detection + flagging     │
│                        │                     │                                  │
│  QUESTION BIAS         │                     │                                  │
│  (Question design)     │                     │                                  │
│  ├─────────────────────┼─────────────────────┼──────────────────────────────────│
│  │                     │ Leading questions   │ Question quality guidelines      │
│  │                     │ Double-barreled     │ Validation rules during creation │
│  │                     │ Loaded language     │ Neutral language recommendations │
│  │                     │ Ambiguity           │ Clear, specific wording guides   │
│                        │                     │                                  │
│  ORDER EFFECTS         │                     │                                  │
│  (Sequence matters)    │                     │                                  │
│  ├─────────────────────┼─────────────────────┼──────────────────────────────────│
│  │                     │ Primacy effect      │ Option randomization             │
│  │                     │ Recency effect      │ Option randomization             │
│  │                     │ Context effect      │ Question randomization (optional)│
│  │                     │ Anchoring           │ Rotate scale directions          │
│                        │                     │                                  │
│  NON-RESPONSE BIAS     │                     │                                  │
│  (Who doesn't respond) │                     │                                  │
│  ├─────────────────────┼─────────────────────┼──────────────────────────────────│
│  │                     │ Unit non-response   │ Response rate display            │
│  │                     │ Item non-response   │ Completion rate tracking         │
│  │                     │ Dropout patterns    │ Progress point analysis          │
│                        │                     │                                  │
└──────────────────────────────────────────────────────────────────────────────────┘


## 3.4.2 Bias Mitigation Features in VOXPOLL

### Option Randomization

[MUST] Randomize option order by default for single/multiple choice questions:

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// OPTION RANDOMIZATION
// ══════════════════════════════════════════════════════════════════════════════

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


### Question Randomization

[MAY] Allow question randomization within sections:

```
Randomization Settings:
├─ Randomize options within questions: ✅ ON (default)
├─ Randomize questions within sections: ⬜ OFF (optional)
├─ Preserve "None of the above" position: ✅ ON (default)
└─ Preserve "Other" position: ✅ ON (default)
```


### Balanced Scales

[SHOULD] Use balanced scales with equal positive and negative options:

```
✅ GOOD: Balanced 5-point Likert
   Strongly Disagree | Disagree | Neutral | Agree | Strongly Agree
   
❌ BAD: Unbalanced scale
   Disagree | Neutral | Slightly Agree | Agree | Strongly Agree
```


## 3.4.3 Social Desirability Bias Mitigation

For sensitive topics, VOXPOLL implements multiple strategies:

1. **Anonymity Assurance**: Clear explanation of how anonymity works
2. **Indirect Questioning**: Option to ask about "people in your situation"
3. **Randomized Response Technique**: For highly sensitive surveys (Enterprise)
4. **Item Count Technique**: Alternative method for sensitive topics

```
┌─────────────────────────────────────────────────────────────────┐
│  🔒 Your Response is Anonymous                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Your answers cannot be linked to your identity:                │
│  • Responses stored separately from user data                   │
│  • No IP addresses or device IDs saved with answers             │
│  • Minimum 5 responses before any results shown                 │
│  • Demographic breakdowns hidden if group < 10                  │
│                                                                 │
│  [Learn More About Our Anonymity Guarantee]                     │
└─────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 3.5 QUESTION DESIGN STANDARDS
# ══════════════════════════════════════════════════════════════════════════════

## 3.5.1 Question Quality Guidelines

📚 REFERENCE: Krosnick, J.A. & Presser, S. (2010). Question and Questionnaire Design

### The BRUSO Framework

| Principle | Description | Example |
|-----------|-------------|--------|
| **B**rief | Keep questions short and simple | ❌ "Taking into account all factors..." |
| **R**elevant | Every question serves a purpose | Remove "nice to know" questions |
| **U**nambiguous | One clear interpretation only | ❌ "Do you regularly exercise?" → ✅ "How many days per week..." |
| **S**pecific | Concrete, not abstract | ❌ "Are you satisfied?" → ✅ "Rate your satisfaction with..." |
| **O**bjective | Neutral, non-leading | ❌ "Don't you agree that..." |


## 3.5.2 Question Type Guidelines

### Single Choice Questions

```
✅ GOOD Practice:
  "What is your primary mode of transportation to work?"
  ○ Personal car
  ○ Public transit
  ○ Bicycle
  ○ Walking
  ○ Work from home
  ○ Other

❌ BAD Practice:
  "How do you usually commute?"  ← Ambiguous (to where?)
  ○ Car                          ← Missing specifics
  ○ Bus                          ← Incomplete options
  ○ Train
```

### Likert Scale Questions

```
✅ GOOD Practice:
  "I feel valued by my manager."
  ○ Strongly disagree
  ○ Disagree
  ○ Neither agree nor disagree
  ○ Agree
  ○ Strongly agree

❌ BAD Practice:
  "My manager values me and provides good feedback."  ← Double-barreled
  ○ Disagree
  ○ Somewhat agree                                     ← Unbalanced scale
  ○ Agree
  ○ Strongly agree
```

### Rating Scale Questions

```
✅ GOOD Practice:
  "On a scale of 1-10, how likely are you to recommend our
   product to a friend or colleague?"
  
  ← Not at all likely                    Extremely likely →
  [ 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 ]

❌ BAD Practice:
  "Rate our product:"                     ← Vague attribute
  [ 1 | 2 | 3 | 4 | 5 ]                   ← No anchor labels
```


## 3.5.3 Question Validation Rules

[MUST] Validate questions during creation:

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// QUESTION VALIDATION RULES
// ══════════════════════════════════════════════════════════════════════════════

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


## 3.5.4 Mutually Exclusive & Exhaustive Options

[MUST] Ensure options are mutually exclusive and collectively exhaustive:

```
❌ BAD: Overlapping options
  "What is your age?"
  ○ 18-25
  ○ 25-35     ← What if someone is 25?
  ○ 35-45
  ○ 45+

✅ GOOD: Mutually exclusive
  "What is your age?"
  ○ 18-24
  ○ 25-34
  ○ 35-44
  ○ 45-54
  ○ 55-64
  ○ 65 or older
  ○ Prefer not to say
```

```
❌ BAD: Not exhaustive
  "What industry do you work in?"
  ○ Technology
  ○ Finance
  ○ Healthcare

✅ GOOD: Exhaustive with escape valve
  "What industry do you work in?"
  ○ Technology
  ○ Finance
  ○ Healthcare
  ○ Education
  ○ Manufacturing
  ○ Retail
  ○ Other (please specify)
```




# ══════════════════════════════════════════════════════════════════════════════
# 3.6 ATTENTION CHECKS & QUALITY CONTROL
# ══════════════════════════════════════════════════════════════════════════════

## 3.6.1 Attention Check Types

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


## 3.6.2 Attention Check Implementation

[SHOULD] Include 1-2 attention checks per survey:

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ATTENTION CHECK CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

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


## 3.6.3 Response Time Analysis

[MUST] Track response time per question for quality assessment:

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


## 3.6.4 Straight-lining Detection

[MUST] Detect patterns indicating non-engagement:

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

export { detectStraightLining }
export type { StraightLineResult }
```


## 3.6.5 Response Quality Scoring

[MUST] Calculate per-response quality score:

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




# ══════════════════════════════════════════════════════════════════════════════
# 3.7 DATA QUALITY INDICATORS
# ══════════════════════════════════════════════════════════════════════════════

## 3.7.1 Quality Metrics Dashboard

For Survey creators (B2B), display comprehensive quality metrics:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  📊 Response Quality Dashboard                                                  │
│  ───────────────────────────────────────────────────────────────────────────    │
│                                                                                 │
│  Overview:                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │    847      │  │    92%      │  │    4.2      │  │    3.1%     │           │
│  │  Responses  │  │  Complete   │  │  Avg Min    │  │  Flagged    │           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                                 │
│  Quality Breakdown:                                                             │
│  ├─ High Quality (Score ≥70)     ████████████████████████  756 (89.3%)         │
│  ├─ Needs Review (40-69)         ████░░░░░░░░░░░░░░░░░░░░   65 (7.7%)          │
│  └─ Excluded (Score <40)         █░░░░░░░░░░░░░░░░░░░░░░░   26 (3.1%)          │
│                                                                                 │
│  Issues Detected:                                                               │
│  ├─ Speeding                     18 responses (2.1%)                           │
│  ├─ Straight-lining              12 responses (1.4%)                           │
│  ├─ Failed Attention Checks       8 responses (0.9%)                           │
│  └─ Inconsistent Responses        4 responses (0.5%)                           │
│                                                                                 │
│  [Download Quality Report]  [Review Flagged Responses]                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 3.7.2 Response Rate Tracking (Private Surveys)

[MUST] Track and display response rates for invitation-based surveys:

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE RATE CALCULATION
// ══════════════════════════════════════════════════════════════════════════════

interface ResponseRateMetrics {
  invited: number
  started: number
  completed: number
  responseRate: number
  completionRate: number
  dropoffRate: number
}

function calculateResponseRates(
  invited: number,
  started: number,
  completed: number
): ResponseRateMetrics {
  return {
    invited,
    started,
    completed,
    responseRate: invited > 0 ? (completed / invited) * 100 : 0,
    completionRate: started > 0 ? (completed / started) * 100 : 0,
    dropoffRate: started > 0 ? ((started - completed) / started) * 100 : 0
  }
}

export { calculateResponseRates }
export type { ResponseRateMetrics }
```


## 3.7.3 Completion Funnel Analysis

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  📊 Completion Funnel                                                           │
│  ───────────────────────────────────────────────────────────────────────────    │
│                                                                                 │
│  Invited                    ████████████████████████████████  1,000 (100%)      │
│                                      ↓                                          │
│  Opened Link                ████████████████████████████░░░░    891 (89.1%)     │
│                                      ↓                                          │
│  Passed Pre-test            ██████████████████████████░░░░░░    834 (83.4%)     │
│                                      ↓                                          │
│  Started Survey             ████████████████████████░░░░░░░░    812 (81.2%)     │
│                                      ↓                                          │
│  Reached 50%                █████████████████████░░░░░░░░░░░    778 (77.8%)     │
│                                      ↓                                          │
│  Reached 75%                ██████████████████░░░░░░░░░░░░░░    756 (75.6%)     │
│                                      ↓                                          │
│  Completed                  █████████████████░░░░░░░░░░░░░░░    721 (72.1%)     │
│                                                                                 │
│  📍 Drop-off Points:                                                            │
│  • Pre-test filtering: 57 users didn't qualify                                 │
│  • Question 8: 22 users dropped (longest question)                             │
│  • Question 15: 18 users dropped (sensitive topic)                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 3.7.4 Data Export with Quality Flags

[MUST] Include quality metadata in all data exports:

```csv
response_id,user_hash,q1_answer,q2_answer,q3_answer,...,quality_score,flags,timing_total,timing_per_question,recommendation
"r_abc123","h_xyz789","Agree","3","Marketing",...,85,[],245000,"[12000,8000,15000,...]","INCLUDE"
"r_def456","h_uvw012","Agree","4","Sales",...,52,"[SPEEDING]",89000,"[3000,2000,4000,...]","REVIEW"
"r_ghi789","h_rst345","Agree","3","Agree",...,28,"[STRAIGHT_LINING,FAILED_ATTENTION]",67000,"[2000,2000,2000,...]","EXCLUDE"
```




# ══════════════════════════════════════════════════════════════════════════════
# 3.8 METHODOLOGY TRANSPARENCY
# ══════════════════════════════════════════════════════════════════════════════

## 3.8.1 Public Methodology Display

[MUST] Make methodology transparent to all users:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  📋 Survey Methodology                                                          │
│  ───────────────────────────────────────────────────────────────────────────    │
│                                                                                 │
│  Sampling Method:     Voluntary (Self-Selected)                                │
│  Target Population:   VOXPOLL users aged 18+                                   │
│  Collection Period:   Jan 15-22, 2026                                          │
│  Total Responses:     1,247                                                    │
│  Confidence Level:    95%                                                      │
│  Margin of Error:     ±2.8%                                                    │
│                                                                                 │
│  Quality Measures:                                                              │
│  • Attention checks included: Yes                                              │
│  • Response time monitored: Yes                                                │
│  • Responses flagged for quality: 3.2%                                         │
│  • Options randomized: Yes                                                     │
│                                                                                 │
│  ⚠️ Limitations:                                                               │
│  This poll used voluntary sampling. Results may not be representative          │
│  of the general population due to self-selection bias.                         │
│                                                                                 │
│  [View Full Methodology Report]                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 3.8.2 AAPOR Transparency Initiative Compliance

📚 REFERENCE: AAPOR Transparency Initiative Standards

[SHOULD] For high-stakes surveys, follow AAPOR disclosure standards:

| Disclosure Element | Required For | VOXPOLL Implementation |
|--------------------|--------------|------------------------|
| Sponsor identity | All surveys | Creator profile visible |
| Population definition | All surveys | Pre-test criteria displayed |
| Sample size | All surveys | Always displayed |
| Sampling method | All surveys | Method badge + explanation |
| Margin of error | Quantitative | Auto-calculated and shown |
| Dates of data collection | All surveys | Start/end dates visible |
| Question wording | On request | Available via "View Questions" |
| Weighting procedures | If applied | Methodology report |


## 3.8.3 Result Interpretation Guidance

[MUST] Help users interpret results correctly:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  💡 How to Interpret These Results                                              │
│  ───────────────────────────────────────────────────────────────────────────    │
│                                                                                 │
│  What the results mean:                                                         │
│  • 62% of respondents selected "Yes"                                           │
│  • With 95% confidence, the true value is between 59% and 65%                  │
│  • 1,247 people participated in this poll                                      │
│                                                                                 │
│  What to consider:                                                              │
│  ⚠️ This poll was open to all VOXPOLL users who chose to participate           │
│  ⚠️ Results reflect the opinions of participants, not necessarily              │
│     the general population                                                      │
│  ⚠️ Demographic breakdown may differ from population demographics              │
│                                                                                 │
│  For representative results:                                                    │
│  Look for polls with 🎯 Stratified or Random sampling badges                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 3.9 PSYCHOMETRIC STANDARDS (FOR TESTS)
# ══════════════════════════════════════════════════════════════════════════════

## 3.9.1 Test Validity Types

📚 REFERENCE: American Psychological Association Standards for Educational and
              Psychological Testing

| Validity Type | Definition | VOXPOLL Application |
|---------------|------------|---------------------|
| Face Validity | Appears to measure what it claims | Question review guidelines |
| Content Validity | Covers full domain of construct | Comprehensive item pools |
| Construct Validity | Measures theoretical construct | Factor analysis (future) |
| Criterion Validity | Correlates with external measure | Validation studies (future) |


## 3.9.2 Reliability Measures

### Cronbach's Alpha

For multi-item scales measuring a single construct:

```
              k          Σσ²ᵢ
  α = ─────────── × (1 - ────)
        k - 1           σ²ₜ

Where:
  α   = Cronbach's alpha
  k   = Number of items
  σ²ᵢ = Variance of item i
  σ²ₜ = Total variance of all items

Interpretation:
  α ≥ 0.9   = Excellent
  0.8 ≤ α < 0.9 = Good
  0.7 ≤ α < 0.8 = Acceptable
  0.6 ≤ α < 0.7 = Questionable
  α < 0.6   = Poor
```

[MAY] Calculate and display Cronbach's alpha for personality tests:

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CRONBACH'S ALPHA CALCULATION
// ══════════════════════════════════════════════════════════════════════════════

function calculateCronbachAlpha(itemScores: number[][]): number {
  const k = itemScores[0].length
  const n = itemScores.length

  const itemVariances = Array(k).fill(0).map((_, i) => {
    const itemValues = itemScores.map(row => row[i])
    return calculateVariance(itemValues)
  })

  const rowTotals = itemScores.map(row => row.reduce((a, b) => a + b, 0))
  const totalVariance = calculateVariance(rowTotals)

  const sumItemVariances = itemVariances.reduce((a, b) => a + b, 0)

  const alpha = (k / (k - 1)) * (1 - sumItemVariances / totalVariance)

  return Math.max(0, Math.min(1, alpha))
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
}

export { calculateCronbachAlpha }
```


## 3.9.3 Test Result Normalization

For personality tests comparing individual to aggregate:

```
                x - μ
  Z-score = ─────────
                σ

Where:
  x = Individual's raw score
  μ = Population mean
  σ = Population standard deviation

Percentile conversion:
  Z = -3 → ~0.1 percentile
  Z = -2 → ~2.3 percentile  
  Z = -1 → ~15.9 percentile
  Z = 0  → 50 percentile
  Z = +1 → ~84.1 percentile
  Z = +2 → ~97.7 percentile
  Z = +3 → ~99.9 percentile
```


## 3.9.4 Test Result Display

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🎯 Your Leadership Style: Transformational                                     │
│  ───────────────────────────────────────────────────────────────────────────    │
│                                                                                 │
│  Your Scores:                                                                   │
│                                                                                 │
│  Vision          ██████████████████████████████░░░░  78/100 (Top 23%)          │
│  Empathy         ████████████████████████░░░░░░░░░░  62/100 (Top 44%)          │
│  Decisiveness    ████████████████████████████░░░░░░  71/100 (Top 31%)          │
│  Communication   ██████████████████████████████████  89/100 (Top 8%)           │
│                                                                                 │
│  ───────────────────────────────────────────────────────────────────────────    │
│  📊 Based on 12,847 test takers                                                │
│  📈 Internal consistency (α): 0.84 (Good)                                      │
│                                                                                 │
│  [Share Result]  [View Detailed Analysis]  [Retake Test]                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 3.10 METHODOLOGY LIMITATIONS & DISCLAIMERS
# ══════════════════════════════════════════════════════════════════════════════

## 3.10.1 Platform Limitations

[MUST] Clearly communicate platform limitations:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ⚠️ Important Limitations                                                       │
│  ───────────────────────────────────────────────────────────────────────────    │
│                                                                                 │
│  VOXPOLL is designed for gathering opinions and feedback, not for:             │
│                                                                                 │
│  ✗ Clinical psychological assessment                                           │
│  ✗ Medical diagnosis                                                           │
│  ✗ Legal evidence                                                              │
│  ✗ Academic peer-reviewed research (without proper validation)                 │
│                                                                                 │
│  All results should be interpreted with consideration of:                       │
│  • Sampling methodology limitations                                            │
│  • Self-report bias                                                            │
│  • Platform user demographics                                                  │
│  • Response quality filtering applied                                          │
│                                                                                 │
│  For scientific research, consult with a methodologist and consider            │
│  additional validation steps.                                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 3.10.2 Disclaimer Templates

### For Poll Results

```
"This poll reflects the opinions of [N] self-selected VOXPOLL users who 
chose to participate between [dates]. Results may not be representative 
of any specific population. Margin of error calculations assume random 
sampling and may not apply to voluntary samples."
```

### For Survey Results (B2B)

```
"This survey was conducted among [target population description] using 
[sampling method]. [N] responses were collected between [dates] with a 
[response rate if applicable]. Results have a margin of error of ±[X]% 
at a [confidence level]% confidence level. [Quality flags applied, if any]."
```

### For Test Results

```
"This personality assessment is for entertainment and self-reflection 
purposes only. Results are based on your self-reported answers and 
compared against [N] other test takers. This is not a validated 
psychological instrument and should not be used for clinical, 
educational, or employment decisions."
```




# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 03
# ══════════════════════════════════════════════════════════════════════════════