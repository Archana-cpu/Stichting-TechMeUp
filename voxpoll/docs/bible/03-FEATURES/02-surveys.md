# ═══════════════════════════════════════════════════════════════════════════════
# FEATURES - Survey System (B2B SaaS Only)
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-006.md (section 6.3)
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# SURVEY = B2B SAAS ONLY
# ═══════════════════════════════════════════════════════════════════════════════

[DECISION P-015] Surveys are EXCLUSIVELY available to B2B SaaS customers.
Regular users CANNOT create surveys - only organizations with paid plans.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SURVEY = B2B SaaS ONLY                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  WHY SURVEYS ARE B2B ONLY:                                                      │
│  ─────────────────────────                                                      │
│  - Surveys require advanced features (branching, screening, analytics)          │
│  - Data quality requirements need organizational accountability                 │
│  - Complex survey creation needs professional-grade tools                       │
│  - Clear product differentiation: Polls = Users, Surveys = Organizations       │
│  - Revenue model: Surveys are enterprise feature, not consumer feature          │
│                                                                                 │
│  CONTENT TYPE OWNERSHIP:                                                        │
│  ─────────────────────────                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │     POLLS       │  │    SURVEYS      │  │     TESTS       │                 │
│  │  ─────────────  │  │  ─────────────  │  │  ─────────────  │                 │
│  │  Any User       │  │  B2B SaaS ONLY  │  │  Any User       │                 │
│  │  (Free/Premium) │  │  (Organization) │  │  (Free/Premium) │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                 │
│  ORGANIZATION SURVEY TIERS:                                                     │
│  ───────────────────────────                                                    │
│  - Starter ($99/mo): 10 surveys/month, 1,000 responses                         │
│  - Professional ($299/mo): 50 surveys/month, 10,000 responses                  │
│  - Enterprise ($999/mo): Unlimited surveys, 100,000 responses                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# SURVEY DATA MODEL
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
interface Survey {
  id: string
  creatorId: string
  organizationId: string                // REQUIRED - not null (B2B only)

  title: string
  description: string | null
  coverImageUrl: string | null

  pages: SurveyPage[]
  screeningQuestions: ScreeningQuestion[]
  settings: SurveySettings

  status: ContentStatus
  visibility: VisibilityLevel
  targetAudience: TargetAudience | null

  responseCount: number
  completionRate: number
  averageCompletionTime: number

  createdAt: Date
  publishedAt: Date | null
  closesAt: Date | null
  closedAt: Date | null
}

interface SurveyPage {
  id: string
  surveyId: string
  title: string | null
  description: string | null
  position: number
  questions: SurveyQuestion[]
}

interface SurveyQuestion {
  id: string
  pageId: string
  type: QuestionType
  question: string
  description: string | null
  required: boolean
  position: number
  options: QuestionOption[] | null
  validation: QuestionValidation | null
  logic: QuestionLogic | null
  settings: QuestionSettings
}

type QuestionType =
  | "SINGLE_CHOICE"       // Radio buttons
  | "MULTIPLE_CHOICE"     // Checkboxes
  | "SHORT_TEXT"          // Single line text (280 chars)
  | "LONG_TEXT"           // Multi-line text (2000 chars)
  | "RATING"              // Star rating (1-5 or 1-10)
  | "LIKERT"              // 5 or 7 point scale
  | "SLIDER"              // 0-100 slider
  | "RANKING"             // Drag and drop ordering
  | "MATRIX"              // Grid of questions
  | "DATE"                // Date picker
  | "TIME"                // Time picker
  | "DATETIME"            // Date and time
  | "NPS"                 // Net Promoter Score (0-10)
  | "IMAGE_CHOICE"        // Choose from images
  | "FILE_UPLOAD"         // Upload file
  | "DROPDOWN"            // Select dropdown
  | "SEMANTIC_DIFF"       // Bipolar scale (hot <-> cold)

interface QuestionOption {
  id: string
  text: string
  imageUrl: string | null
  value: string | number
  position: number
}

interface QuestionValidation {
  minLength: number | null
  maxLength: number | null
  minValue: number | null
  maxValue: number | null
  minSelections: number | null
  maxSelections: number | null
  regex: string | null
  regexMessage: string | null
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# SURVEY SETTINGS
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
interface SurveySettings {
  allowAnonymous: boolean
  requireAuth: boolean
  oneResponsePerUser: boolean
  allowEditResponse: boolean
  showProgressBar: boolean
  showPageNumbers: boolean
  randomizeQuestions: boolean
  randomizeWithinPage: boolean
  timeLimitMinutes: number | null
  showEstimatedTime: boolean
  redirectUrl: string | null
  confirmationMessage: string
  notifyOnResponse: boolean
  notifyOnCompletion: boolean
  showResultsToRespondent: boolean
  collectDeviceInfo: boolean
  collectLocationInfo: boolean

  // Anonymity & Verification Settings
  allowAnonymousParticipation: boolean
  requireVerificationLevel: 0 | 1 | 2 | 3 | 4 | null
  anonymityRejectionMessage: string | null
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# SURVEY BRANCHING LOGIC
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
interface QuestionLogic {
  showIf: LogicCondition[]
  skipTo: SkipLogic[]
}

interface LogicCondition {
  questionId: string
  operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "GREATER_THAN" | "LESS_THAN"
  value: string | number | string[]
  connector: "AND" | "OR"
}

interface SkipLogic {
  condition: LogicCondition[]
  targetPageId: string | null
  targetQuestionId: string | null
  action: "SKIP_TO_PAGE" | "SKIP_TO_QUESTION" | "END_SURVEY"
}
```

## Logic Builder Example

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SURVEY BRANCHING LOGIC                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Example: Employee Satisfaction Survey                                          │
│                                                                                 │
│  Q1: What department do you work in?                                           │
│      [Engineering] [Sales] [Marketing] [HR]                                     │
│                                                                                 │
│      LOGIC: If "Engineering" -> Show Q2-A                                       │
│             If "Sales" -> Show Q2-B                                             │
│             Otherwise -> Skip to Q3                                             │
│                                                                                 │
│  Q2-A: Rate your coding tools satisfaction (1-5)                               │
│        [Only shown to Engineering]                                              │
│                                                                                 │
│  Q2-B: Rate your CRM satisfaction (1-5)                                        │
│        [Only shown to Sales]                                                    │
│                                                                                 │
│  Q3: How likely are you to recommend our company? (NPS)                        │
│      [Shown to everyone]                                                        │
│                                                                                 │
│      LOGIC: If score < 7 -> Show Q4 (Why are you dissatisfied?)                │
│             If score >= 7 -> Skip to Q5                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# SURVEY SCREENING QUESTIONS (PRE-TEST)
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
interface ScreeningQuestion {
  id: string
  surveyId: string
  question: string
  options: ScreeningOption[]
  required: boolean
  position: number
  eliminationLogic: EliminationLogic
}

interface ScreeningOption {
  id: string
  text: string
  eliminates: boolean            // If selected, user is screened out
  customMessage: string | null   // Custom rejection message
}

interface EliminationLogic {
  type: "ANY_ELIMINATES" | "ALL_REQUIRED" | "CUSTOM"
  customConditions: LogicCondition[] | null
}
```

## Screening Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      SURVEY SCREENING PROCESS                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  User clicks       Screening         Pass?      Main Survey    PULSE            │
│  on Survey    ---->  Questions   ---->  Y    ---->  Pages   ---->  Results      │
│                        │                                                        │
│                        │                                                        │
│                        v Fail                                                   │
│                   Polite rejection                                              │
│                   "Thank you for your interest, but this survey                 │
│                    is looking for a different audience."                        │
│                                                                                 │
│  SCREENING TYPES:                                                               │
│  ────────────────                                                               │
│                                                                                 │
│  1. DEMOGRAPHIC SCREENING                                                       │
│     - Age verification (Are you 18+?)                                           │
│     - Location verification (Do you live in Turkey?)                            │
│     - Employment status (Are you currently employed?)                           │
│                                                                                 │
│  2. BEHAVIOR SCREENING                                                          │
│     - Product usage (Have you used X in the last 30 days?)                      │
│     - Purchase history (Have you purchased X recently?)                         │
│     - Service interaction (Do you use our service?)                             │
│                                                                                 │
│  3. KNOWLEDGE SCREENING                                                         │
│     - Industry knowledge (Do you work in tech industry?)                        │
│     - Product familiarity (Are you familiar with product X?)                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# SURVEY RESPONSE COLLECTION
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
interface SurveyResponse {
  id: string
  surveyId: string
  respondentId: string | null     // Null for anonymous
  isAnonymous: boolean

  answers: SurveyAnswer[]

  startedAt: Date
  completedAt: Date | null
  totalTimeSeconds: number
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED"

  metadata: {
    deviceType: "DESKTOP" | "MOBILE" | "TABLET"
    browser: string
    os: string
    ipCountry: string | null
    referrer: string | null
  }

  qualityFlags: {
    speedingFlag: boolean         // Completed too fast
    straightLiningFlag: boolean   // Same answer for all questions
    inconsistencyFlag: boolean    // Contradictory answers
  }
}

interface SurveyAnswer {
  questionId: string
  questionType: QuestionType
  value: string | number | string[] | Record<string, unknown>
  timeSpentSeconds: number
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# SURVEY ANALYTICS
# ═══════════════════════════════════════════════════════════════════════════════

## Analytics Dashboard Components

| Component | Description | Available Tiers |
|-----------|-------------|-----------------|
| Response Summary | Total responses, completion rate, avg time | All |
| Question Breakdown | Response distribution per question | All |
| Cross-tabulation | Compare responses across demographics | Professional+ |
| Trend Analysis | Response patterns over time | Professional+ |
| Export to CSV/Excel | Raw data export | All |
| API Access | Programmatic data access | Professional+ |
| Custom Reports | Build custom dashboards | Enterprise |
| Real-time Streaming | Live response updates | Enterprise |


## Survey Analytics Structure

```typescript
interface SurveyAnalytics {
  surveyId: string
  generatedAt: Date

  summary: {
    totalResponses: number
    completedResponses: number
    abandonedResponses: number
    completionRate: number
    averageTimeMinutes: number
    medianTimeMinutes: number
  }

  questions: QuestionAnalytics[]

  demographics: {
    byAge: Record<string, number>
    byGender: Record<string, number>
    byCountry: Record<string, number>
  }

  timeline: {
    date: string
    responses: number
    completions: number
  }[]

  quality: {
    speedingRate: number
    straightLiningRate: number
    averageQualityScore: number
  }
}

interface QuestionAnalytics {
  questionId: string
  questionText: string
  questionType: QuestionType

  responseCount: number
  skipCount: number

  distribution: {
    option: string
    count: number
    percentage: number
  }[]

  stats: {
    mean: number | null         // For numeric questions
    median: number | null
    stdDev: number | null
    mode: string | null
  }
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# SURVEY VISIBILITY & DISTRIBUTION
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      SURVEY DISTRIBUTION OPTIONS                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. INTERNAL SURVEYS (Organization Members Only)                                │
│     - Visible only to org members via SSO                                       │
│     - Employee satisfaction, internal feedback                                  │
│     - 100% anonymity guaranteed within org                                      │
│                                                                                 │
│  2. PUBLIC SURVEYS (Open to Platform Users)                                     │
│     - Shown in Discover feed as "Sponsored"                                     │
│     - Target audience filtering applies                                         │
│     - Pay for visibility (CPM/CPA model)                                        │
│                                                                                 │
│  3. PRIVATE LINK SURVEYS                                                        │
│     - Not listed publicly                                                       │
│     - Accessible only via private link                                          │
│     - For customer feedback, specific audiences                                 │
│                                                                                 │
│  4. EMBEDDED SURVEYS                                                            │
│     - Embed in external websites                                                │
│     - White-label option (Enterprise)                                           │
│     - iframe or JavaScript widget                                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```
