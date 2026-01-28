# ═══════════════════════════════════════════════════════════════════════════════
# DATA - Response Collection System
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-007.md
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# RESPONSE COLLECTION ARCHITECTURE
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   RESPONSE COLLECTION ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        USER STARTS CONTENT                          │   │
│  │  (Poll / Survey / Test)                                             │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    RESPONSE SESSION CREATED                         │   │
│  │  - Generate session ID                                              │   │
│  │  - Link to user (if authenticated) or device fingerprint            │   │
│  │  - Record start timestamp                                           │   │
│  │  - Store client metadata (device, browser, IP hash)                 │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PRE-TEST SCREENING (if enabled)                  │   │
│  │  - Eligibility questions                                            │   │
│  │  - Demographic filters                                              │   │
│  │  - Quota checks                                                     │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │                                          │
│              ┌───────────────────┴───────────────────┐                      │
│              │ Eligible?                             │                      │
│              └───────────────────┬───────────────────┘                      │
│         NO   │                                       │ YES                  │
│              ▼                                       ▼                      │
│  ┌─────────────────┐              ┌─────────────────────────────────────┐   │
│  │  SCREEN OUT     │              │         MAIN CONTENT                │   │
│  │  - Thank user   │              │  - Present questions sequentially   │   │
│  │  - Record       │              │  - Track time per question          │   │
│  │    screening    │              │  - Auto-save progress               │   │
│  │    data         │              │  - Behavioral tracking              │   │
│  └─────────────────┘              └───────────────────┬─────────────────┘   │
│                                                       │                     │
│                                                       ▼                     │
│                                  ┌─────────────────────────────────────┐   │
│                                  │         SUBMISSION                  │   │
│                                  │  - Validate all required fields     │   │
│                                  │  - Calculate completion time        │   │
│                                  │  - Run quality checks               │   │
│                                  │  - Fraud detection                  │   │
│                                  └───────────────────┬─────────────────┘   │
│                                                       │                     │
│                                                       ▼                     │
│                                  ┌─────────────────────────────────────┐   │
│                                  │      POST-SUBMISSION PROCESSING     │   │
│                                  │  - Update aggregate statistics      │   │
│                                  │  - Calculate response quality score │   │
│                                  │  - Trigger notifications            │   │
│                                  │  - Award XP/badges (if applicable)  │   │
│                                  └─────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# RESPONSE TYPES
# ═══════════════════════════════════════════════════════════════════════════════

| Response Type | Description | Use Case |
|---------------|-------------|----------|
| AUTHENTICATED | Full user identity linked | Default for logged-in users |
| ANONYMOUS | No identity linking, device fingerprint only | Sensitive surveys |
| SEMI_ANONYMOUS | Organization membership verified, but individual identity not linked | Internal org surveys |



# ═══════════════════════════════════════════════════════════════════════════════
# RESPONSE STATE MACHINE
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RESPONSE STATE MACHINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    Pass    ┌─────────────┐    Complete   ┌─────────────┐  │
│  │  SCREENING  │ ─────────▶ │ IN_PROGRESS │ ───────────▶  │  SUBMITTED  │  │
│  └─────────────┘            └─────────────┘               └─────────────┘  │
│        │                          │                             │          │
│        │ Fail                     │ Pause                       │ Validate │
│        ▼                          ▼                             ▼          │
│  ┌─────────────┐            ┌─────────────┐               ┌─────────────┐  │
│  │ SCREENED_OUT│            │   PAUSED    │               │  VALIDATED  │  │
│  └─────────────┘            └─────────────┘               └─────────────┘  │
│                                   │                             │          │
│                                   │ Resume                      │ Process  │
│                                   │                             ▼          │
│                                   └──────────▶ IN_PROGRESS ┌─────────────┐ │
│                                                            │  COMPLETED  │ │
│                                                            └─────────────┘ │
│                                                                             │
│  Special States:                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │   EXPIRED   │    │  ABANDONED  │    │  FLAGGED    │                     │
│  │ (timeout)   │    │ (no submit) │    │ (fraud)     │                     │
│  └─────────────┘    └─────────────┘    └─────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## State Definitions

| State | Description | Can Transition To |
|-------|-------------|-------------------|
| SCREENING | Pre-test questions being answered | IN_PROGRESS, SCREENED_OUT |
| SCREENED_OUT | Failed pre-test eligibility | Terminal |
| IN_PROGRESS | Actively answering questions | PAUSED, SUBMITTED, ABANDONED |
| PAUSED | User paused, can resume later | IN_PROGRESS, EXPIRED |
| SUBMITTED | Answers submitted, pending validation | VALIDATED, FLAGGED |
| VALIDATED | Passed quality checks | COMPLETED |
| COMPLETED | Fully processed, included in results | Terminal |
| ABANDONED | No activity, never submitted | Terminal |
| EXPIRED | Session timed out | Terminal |
| FLAGGED | Fraud/quality concerns | REVIEW, EXCLUDED |



# ═══════════════════════════════════════════════════════════════════════════════
# RESPONSE SESSION INITIALIZATION
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE SESSION INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

const ResponseSessionSchema = z.object({
  id: z.string().cuid(),
  contentId: z.string().cuid(),
  contentType: z.enum(["POLL", "SURVEY", "TEST"]),

  userId: z.string().cuid().nullable(),
  deviceFingerprint: z.string().max(256),
  participantToken: z.string().max(256).nullable(),

  status: z.enum([
    "SCREENING",
    "SCREENED_OUT",
    "IN_PROGRESS",
    "PAUSED",
    "SUBMITTED",
    "VALIDATED",
    "COMPLETED",
    "ABANDONED",
    "EXPIRED",
    "FLAGGED"
  ]),

  metadata: z.object({
    ipHash: z.string().max(64),
    userAgent: z.string().max(512),
    platform: z.enum(["WEB", "MOBILE_WEB", "IOS", "ANDROID"]),
    screenResolution: z.string().max(20).nullable(),
    timezone: z.string().max(64).nullable(),
    language: z.string().max(10)
  }),

  timing: z.object({
    startedAt: z.date(),
    lastActivityAt: z.date(),
    submittedAt: z.date().nullable(),
    completedAt: z.date().nullable(),
    totalDurationMs: z.number().int().nullable()
  }),

  progress: z.object({
    currentQuestionIndex: z.number().int().min(0),
    answeredQuestions: z.number().int().min(0),
    totalQuestions: z.number().int().min(1),
    percentComplete: z.number().min(0).max(100)
  }),

  qualityMetrics: z.object({
    fraudScore: z.number().min(0).max(100).nullable(),
    qualityScore: z.number().min(0).max(100).nullable(),
    attentionChecksPassed: z.number().int().nullable(),
    attentionChecksFailed: z.number().int().nullable()
  }).nullable()
})

type ResponseSession = z.infer<typeof ResponseSessionSchema>


async function initializeResponseSession(
  contentId: string,
  userId: string | null,
  deviceFingerprint: string,
  metadata: ResponseSession["metadata"]
): Promise<ResponseSession> {
  const content = await getContentById(contentId)

  if (!content) {
    throw new Error("Content not found")
  }

  if (content.status !== "PUBLISHED") {
    throw new Error("Content is not available for responses")
  }

  if (content.endsAt && content.endsAt < new Date()) {
    throw new Error("Content has ended")
  }

  const existingSession = await findExistingSession(
    contentId,
    userId,
    deviceFingerprint
  )

  if (existingSession) {
    if (existingSession.status === "COMPLETED") {
      if (!content.allowRetake) {
        throw new Error("You have already completed this content")
      }
    }

    if (["IN_PROGRESS", "PAUSED"].includes(existingSession.status)) {
      return existingSession
    }
  }

  const session: ResponseSession = {
    id: generateCuid(),
    contentId,
    contentType: content.type,
    userId,
    deviceFingerprint,
    participantToken: generateParticipantToken(),
    status: content.pretest ? "SCREENING" : "IN_PROGRESS",
    metadata,
    timing: {
      startedAt: new Date(),
      lastActivityAt: new Date(),
      submittedAt: null,
      completedAt: null,
      totalDurationMs: null
    },
    progress: {
      currentQuestionIndex: 0,
      answeredQuestions: 0,
      totalQuestions: content.questions.length,
      percentComplete: 0
    },
    qualityMetrics: null
  }

  await saveResponseSession(session)

  return session
}

export { ResponseSessionSchema, initializeResponseSession }
export type { ResponseSession }
```



# ═══════════════════════════════════════════════════════════════════════════════
# ANSWER SUBMISSION HANDLING
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ANSWER SUBMISSION HANDLER
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

const AnswerSubmissionSchema = z.object({
  sessionId: z.string().cuid(),
  questionId: z.string().cuid(),
  value: z.unknown(),
  timeSpentMs: z.number().int().min(0),
  interactionCount: z.number().int().min(0).optional()
})

const AnswerRecordSchema = z.object({
  id: z.string().cuid(),
  sessionId: z.string().cuid(),
  questionId: z.string().cuid(),
  value: z.unknown(),
  timeSpentMs: z.number().int().min(0),
  submittedAt: z.date(),
  version: z.number().int().min(1)
})

type AnswerSubmission = z.infer<typeof AnswerSubmissionSchema>
type AnswerRecord = z.infer<typeof AnswerRecordSchema>


async function submitAnswer(input: AnswerSubmission): Promise<AnswerRecord> {
  const validated = AnswerSubmissionSchema.parse(input)

  const session = await getResponseSession(validated.sessionId)

  if (!session) {
    throw new Error("Session not found")
  }

  if (!["IN_PROGRESS", "SCREENING"].includes(session.status)) {
    throw new Error("Session is not active")
  }

  const question = await getQuestion(validated.questionId)

  if (!question) {
    throw new Error("Question not found")
  }

  const validationErrors = validateAnswer(question, validated.value)

  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(", ")}`)
  }

  const existingAnswer = await findExistingAnswer(
    validated.sessionId,
    validated.questionId
  )

  const answerRecord: AnswerRecord = {
    id: existingAnswer?.id ?? generateCuid(),
    sessionId: validated.sessionId,
    questionId: validated.questionId,
    value: validated.value,
    timeSpentMs: validated.timeSpentMs,
    submittedAt: new Date(),
    version: (existingAnswer?.version ?? 0) + 1
  }

  await saveAnswer(answerRecord)

  await updateSessionProgress(session.id)

  return answerRecord
}

export { AnswerSubmissionSchema, AnswerRecordSchema, submitAnswer }
export type { AnswerSubmission, AnswerRecord }
```



# ═══════════════════════════════════════════════════════════════════════════════
# ANONYMOUS RESPONSE SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════

For surveys requiring anonymity, the system uses a participant token that cannot be linked back to user identity.

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ANONYMOUS RESPONSE CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const AnonymousResponseConfigSchema = z.object({
  enabled: z.boolean(),
  verificationLevel: z.enum(["NONE", "DEVICE_ONLY", "ORG_MEMBERSHIP"]),
  allowMultipleFromDevice: z.boolean(),
  minResponsesBeforeResults: z.number().int().min(1).default(5),
  minGroupSizeForDemographics: z.number().int().min(1).default(10)
})

type AnonymousResponseConfig = z.infer<typeof AnonymousResponseConfigSchema>


function generateAnonymousParticipantToken(
  contentId: string,
  deviceFingerprint: string,
  salt: string
): string {
  const input = `${contentId}:${deviceFingerprint}:${salt}`
  return hashSha256(input)
}


async function recordAnonymousResponse(
  contentId: string,
  participantToken: string,
  answers: AnswerRecord[]
): Promise<void> {
  const existingParticipation = await checkAnonymousParticipation(
    contentId,
    participantToken
  )

  if (existingParticipation) {
    throw new Error("You have already participated in this survey")
  }

  const anonymousResponse = {
    id: generateCuid(),
    contentId,
    participantToken,
    answers: answers.map(a => ({
      questionId: a.questionId,
      value: a.value
    })),
    submittedAt: new Date()
  }

  await saveAnonymousResponse(anonymousResponse)
}

export { AnonymousResponseConfigSchema, generateAnonymousParticipantToken, recordAnonymousResponse }
export type { AnonymousResponseConfig }
```



# ═══════════════════════════════════════════════════════════════════════════════
# SEMI-ANONYMOUS RESPONSE SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════

For organization surveys that need to verify membership without identifying individuals.

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SEMI-ANONYMOUS RESPONSE SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

const SemiAnonymousVerificationSchema = z.object({
  surveyId: z.string().cuid(),
  organizationId: z.string().cuid(),
  membershipProof: z.string().max(512),
  blindedToken: z.string().max(256)
})

const SemiAnonymousResponseSchema = z.object({
  surveyId: z.string().cuid(),
  organizationId: z.string().cuid(),
  blindedToken: z.string().max(256),
  verifiedAt: z.date(),
  membershipValid: z.boolean()
})

type SemiAnonymousVerification = z.infer<typeof SemiAnonymousVerificationSchema>
type SemiAnonymousResponse = z.infer<typeof SemiAnonymousResponseSchema>


async function verifySemiAnonymousMembership(
  input: SemiAnonymousVerification
): Promise<SemiAnonymousResponse> {
  const validated = SemiAnonymousVerificationSchema.parse(input)

  const membershipValid = await verifyBlindedMembershipProof(
    validated.membershipProof,
    validated.organizationId
  )

  return {
    surveyId: validated.surveyId,
    organizationId: validated.organizationId,
    blindedToken: validated.blindedToken,
    verifiedAt: new Date(),
    membershipValid
  }
}


async function recordSemiAnonymousParticipation(
  surveyId: string,
  organizationId: string,
  blindedToken: string
): Promise<void> {
  await db.insert(semiAnonymousParticipations)
    .values({
      surveyId,
      organizationId,
      blindedToken,
      participatedAt: new Date()
    })
}


async function checkSemiAnonymousDuplicate(
  surveyId: string,
  blindedToken: string
): Promise<boolean> {
  const [existing] = await db.select()
    .from(semiAnonymousParticipations)
    .where(and(
      eq(semiAnonymousParticipations.surveyId, surveyId),
      eq(semiAnonymousParticipations.blindedToken, blindedToken)
    ))

  return existing !== null
}

export {
  SemiAnonymousVerificationSchema,
  SemiAnonymousResponseSchema,
  verifySemiAnonymousMembership,
  recordSemiAnonymousParticipation,
  checkSemiAnonymousDuplicate
}
export type {
  SemiAnonymousVerification,
  SemiAnonymousResponse
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# VALIDATION ARCHITECTURE
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       VALIDATION ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     CLIENT-SIDE VALIDATION                          │   │
│  │                      (First Line of Defense)                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  - Immediate feedback to user                                       │   │
│  │  - Format validation (email, phone, etc.)                           │   │
│  │  - Required field checks                                            │   │
│  │  - Length limits                                                    │   │
│  │  - Pattern matching                                                 │   │
│  │  - NOT a security measure - can be bypassed                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     SERVER-SIDE VALIDATION                          │   │
│  │                       (Source of Truth)                             │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  - All client validations repeated                                  │   │
│  │  - Business logic validation                                        │   │
│  │  - Cross-field validation                                           │   │
│  │  - Database constraint validation                                   │   │
│  │  - Anti-abuse validation                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     POST-SUBMISSION VALIDATION                      │   │
│  │                       (Quality Assurance)                           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  - Consistency checks across answers                                │   │
│  │  - Pattern detection (straight-lining, etc.)                        │   │
│  │  - Outlier detection                                                │   │
│  │  - Text quality analysis (for open-ended)                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# ANSWER VALIDATION ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ANSWER VALIDATION ENGINE
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"


const ValidationRuleSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("REQUIRED"),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("MIN_LENGTH"),
    value: z.number().int().min(1),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("MAX_LENGTH"),
    value: z.number().int().min(1),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("MIN_VALUE"),
    value: z.number(),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("MAX_VALUE"),
    value: z.number(),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("PATTERN"),
    value: z.string(),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("EMAIL"),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("URL"),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("PHONE"),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("MIN_SELECTIONS"),
    value: z.number().int().min(1),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("MAX_SELECTIONS"),
    value: z.number().int().min(1),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("DATE_RANGE"),
    minDate: z.string().optional(),
    maxDate: z.string().optional(),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("FILE_TYPE"),
    allowedTypes: z.array(z.string()),
    message: z.string().optional()
  }),
  z.object({
    type: z.literal("FILE_SIZE"),
    maxSizeBytes: z.number().int().min(1),
    message: z.string().optional()
  })
])

const ValidationErrorSchema = z.object({
  field: z.string(),
  rule: z.string(),
  message: z.string()
})

const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(ValidationErrorSchema)
})

type ValidationRule = z.infer<typeof ValidationRuleSchema>
type ValidationError = z.infer<typeof ValidationErrorSchema>
type ValidationResult = z.infer<typeof ValidationResultSchema>


function validateAnswer(
  question: {
    id: string
    type: string
    isRequired: boolean
    validationRules: ValidationRule[]
  },
  answer: unknown
): ValidationError[] {
  const errors: ValidationError[] = []

  if (question.isRequired) {
    if (answer === null || answer === undefined || answer === "") {
      errors.push({
        field: question.id,
        rule: "REQUIRED",
        message: "This question requires an answer"
      })
      return errors
    }

    if (Array.isArray(answer) && answer.length === 0) {
      errors.push({
        field: question.id,
        rule: "REQUIRED",
        message: "Please select at least one option"
      })
      return errors
    }
  }

  if (answer === null || answer === undefined || answer === "") {
    return errors
  }

  for (const rule of question.validationRules) {
    const error = applyValidationRule(question.id, answer, rule)
    if (error) {
      errors.push(error)
    }
  }

  return errors
}

export {
  ValidationRuleSchema,
  ValidationErrorSchema,
  ValidationResultSchema,
  validateAnswer
}
export type {
  ValidationRule,
  ValidationError,
  ValidationResult
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# CROSS-FIELD VALIDATION
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CROSS-FIELD VALIDATION
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"


const CrossFieldRuleSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("COMPARE"),
    field1: z.string(),
    operator: z.enum(["EQUALS", "NOT_EQUALS", "GREATER", "LESS", "GREATER_OR_EQUAL", "LESS_OR_EQUAL"]),
    field2: z.string(),
    message: z.string()
  }),
  z.object({
    type: z.literal("SUM_EQUALS"),
    fields: z.array(z.string()),
    targetValue: z.number(),
    message: z.string()
  }),
  z.object({
    type: z.literal("MUTUALLY_EXCLUSIVE"),
    fields: z.array(z.string()),
    message: z.string()
  }),
  z.object({
    type: z.literal("CONDITIONAL_REQUIRED"),
    triggerField: z.string(),
    triggerValue: z.unknown(),
    requiredField: z.string(),
    message: z.string()
  })
])

type CrossFieldRule = z.infer<typeof CrossFieldRuleSchema>


function validateCrossFieldRules(
  answers: Map<string, unknown>,
  rules: CrossFieldRule[]
): ValidationError[] {
  const errors: ValidationError[] = []

  for (const rule of rules) {
    const error = applyCrossFieldRule(answers, rule)
    if (error) {
      errors.push(error)
    }
  }

  return errors
}

export {
  CrossFieldRuleSchema,
  validateCrossFieldRules
}
export type {
  CrossFieldRule
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# RATE LIMITING ARCHITECTURE
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RATE LIMITING ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       RATE LIMIT LAYERS                             │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  Layer 1: GLOBAL RATE LIMIT                                         │   │
│  │  - 1000 requests/minute per IP (all endpoints)                     │   │
│  │  - Implemented at load balancer level                              │   │
│  │  - Protects against DDoS attacks                                   │   │
│  │                                                                     │   │
│  │  Layer 2: ENDPOINT RATE LIMIT                                       │   │
│  │  - Response submission: 60 requests/minute per IP                  │   │
│  │  - Survey loading: 100 requests/minute per IP                      │   │
│  │  - Prevents automated scraping/submission                          │   │
│  │                                                                     │   │
│  │  Layer 3: SURVEY-SPECIFIC RATE LIMIT                                │   │
│  │  - 5 incomplete responses per device per survey                    │   │
│  │  - 1 complete response per device per survey (if restricted)       │   │
│  │  - Prevents ballot stuffing                                        │   │
│  │                                                                     │   │
│  │  Layer 4: USER RATE LIMIT (Authenticated)                           │   │
│  │  - 100 responses/day per user account                              │   │
│  │  - 10 responses/hour per user per organization                     │   │
│  │  - Prevents abuse by authenticated users                           │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## Rate Limit Presets

```typescript
const RATE_LIMIT_PRESETS = {
  GLOBAL_IP: {
    limit: 1000,
    windowMs: 60 * 1000,
    blockDurationMs: 5 * 60 * 1000
  },
  RESPONSE_SUBMISSION: {
    limit: 60,
    windowMs: 60 * 1000,
    blockDurationMs: 2 * 60 * 1000
  },
  SURVEY_LOADING: {
    limit: 100,
    windowMs: 60 * 1000
  },
  DEVICE_PER_SURVEY: {
    limit: 5,
    windowMs: 24 * 60 * 60 * 1000
  },
  USER_DAILY: {
    limit: 100,
    windowMs: 24 * 60 * 60 * 1000
  },
  USER_PER_ORG_HOURLY: {
    limit: 10,
    windowMs: 60 * 60 * 1000
  }
} as const
```
