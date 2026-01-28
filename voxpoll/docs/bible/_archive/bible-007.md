# ██████████████████████████████████████████████████████████████████████████████
# ██████████████████████████████████████████████████████████████████████████████
# ██                                                                          ██
# ██                              SECTION 07                                  ██
# ██                      RESPONSE & DATA COLLECTION                          ██
# ██                                                                          ██
# ██████████████████████████████████████████████████████████████████████████████
# ██████████████████████████████████████████████████████████████████████████████




---

# 7.1 Response Collection Overview

## 7.1.1 Response Collection Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     RESPONSE COLLECTION ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Mobile    │    │   Desktop   │    │   Embed     │    │    API      │  │
│  │    App      │    │    Web      │    │   Widget    │    │   Direct    │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │         │
│         └──────────────────┴──────────────────┴──────────────────┘         │
│                                    │                                        │
│                                    ▼                                        │
│                    ┌───────────────────────────────┐                       │
│                    │      Response Gateway         │                       │
│                    │   (Rate Limit + Validation)   │                       │
│                    └───────────────┬───────────────┘                       │
│                                    │                                        │
│                    ┌───────────────┼───────────────┐                       │
│                    ▼               ▼               ▼                       │
│           ┌───────────────┐ ┌───────────────┐ ┌───────────────┐           │
│           │   Screening   │ │   Response    │ │    Fraud      │           │
│           │   Validator   │ │   Processor   │ │   Detector    │           │
│           └───────┬───────┘ └───────┬───────┘ └───────┬───────┘           │
│                   │                 │                 │                    │
│                   └─────────────────┼─────────────────┘                    │
│                                     ▼                                      │
│                    ┌───────────────────────────────┐                       │
│                    │      Response Aggregator      │                       │
│                    │    (Real-time + Batch)        │                       │
│                    └───────────────┬───────────────┘                       │
│                                    │                                        │
│                    ┌───────────────┼───────────────┐                       │
│                    ▼               ▼               ▼                       │
│           ┌───────────────┐ ┌───────────────┐ ┌───────────────┐           │
│           │  PostgreSQL   │ │     Redis     │ │   Analytics   │           │
│           │  (Permanent)  │ │   (Cache)     │ │    Queue      │           │
│           └───────────────┘ └───────────────┘ └───────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.1.2 Response Types

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RESPONSE TYPE MATRIX                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    AUTHENTICATED RESPONSES                          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • User identity is known and verified                              │   │
│  │  • Response linked to user account                                  │   │
│  │  • Used for: Organization surveys, member-only surveys              │   │
│  │  • Tracking: Full user history, response patterns                   │   │
│  │  • Privacy: User aware their identity is recorded                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     ANONYMOUS RESPONSES                             │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • User identity is NOT stored with response                        │   │
│  │  • Device fingerprint used only for duplicate prevention            │   │
│  │  • Used for: Public surveys, sensitive internal surveys             │   │
│  │  • Tracking: Anonymous participation token only                     │   │
│  │  • Privacy: Complete anonymity guaranteed                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   SEMI-ANONYMOUS RESPONSES                          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • User verified as organization member                             │   │
│  │  • Response NOT linked to specific user                             │   │
│  │  • Used for: Internal feedback, employee surveys                    │   │
│  │  • Tracking: Member verification only, no identity link             │   │
│  │  • Privacy: Organization knows member responded, not which response │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.1.3 Response State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RESPONSE STATE MACHINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              ┌─────────┐                                    │
│                              │  START  │                                    │
│                              └────┬────┘                                    │
│                                   │                                         │
│                                   ▼                                         │
│                          ┌───────────────┐                                  │
│                          │   SCREENING   │──────┐                           │
│                          └───────┬───────┘      │                           │
│                                  │              │ (Disqualified)            │
│                          (Passed)│              ▼                           │
│                                  │      ┌───────────────┐                   │
│                                  │      │  DISQUALIFIED │                   │
│                                  │      └───────────────┘                   │
│                                  ▼                                          │
│                          ┌───────────────┐                                  │
│                          │  IN_PROGRESS  │◄─────────────┐                   │
│                          └───────┬───────┘              │                   │
│                                  │                      │                   │
│                    ┌─────────────┼─────────────┐        │                   │
│                    │             │             │        │                   │
│                    ▼             ▼             ▼        │                   │
│            ┌─────────────┐ ┌─────────┐ ┌───────────┐    │                   │
│            │   PAUSED    │ │ TIMEOUT │ │ ABANDONED │    │                   │
│            └──────┬──────┘ └─────────┘ └───────────┘    │                   │
│                   │                                     │                   │
│                   └─────────────────────────────────────┘                   │
│                          (Resume)                                           │
│                                                                             │
│                          ┌───────────────┐                                  │
│                          │  IN_PROGRESS  │                                  │
│                          └───────┬───────┘                                  │
│                                  │                                          │
│                                  ▼ (Submit)                                 │
│                          ┌───────────────┐                                  │
│                          │   SUBMITTED   │                                  │
│                          └───────┬───────┘                                  │
│                                  │                                          │
│                    ┌─────────────┼─────────────┐                            │
│                    ▼             ▼             ▼                            │
│            ┌─────────────┐ ┌─────────┐ ┌───────────────┐                    │
│            │  VALIDATED  │ │ INVALID │ │ FRAUD_FLAGGED │                    │
│            └──────┬──────┘ └─────────┘ └───────────────┘                    │
│                   │                                                         │
│                   ▼                                                         │
│            ┌─────────────┐                                                  │
│            │  COMPLETED  │                                                  │
│            └─────────────┘                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.1.4 Response Collection Modes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RESPONSE COLLECTION MODES                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  SINGLE SESSION MODE                                                  ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║  • Survey must be completed in one sitting                            ║  │
│  ║  • No save/resume functionality                                       ║  │
│  ║  • Progress lost if user leaves                                       ║  │
│  ║  • Best for: Short surveys (< 10 questions)                           ║  │
│  ║  • Timeout: 30 minutes default                                        ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  MULTI SESSION MODE                                                   ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║  • Survey can be paused and resumed                                   ║  │
│  ║  • Progress saved automatically                                       ║  │
│  ║  • Resume link sent to user (if email provided)                       ║  │
│  ║  • Best for: Long surveys (10+ questions)                             ║  │
│  ║  • Expiry: 7 days default for incomplete responses                    ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  OFFLINE MODE (Mobile Only)                                           ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║  • Responses stored locally on device                                 ║  │
│  ║  • Synced when connection restored                                    ║  │
│  ║  • Conflict resolution for duplicate submissions                      ║  │
│  ║  • Best for: Field surveys, areas with poor connectivity              ║  │
│  ║  • Local storage limit: 50 pending responses                          ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```




---

# 7.2 Response Submission Flow

## 7.2.1 Complete Submission Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RESPONSE SUBMISSION FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USER ACTION                    SYSTEM PROCESS                              │
│  ───────────                    ──────────────                              │
│                                                                             │
│  ┌─────────────┐                                                            │
│  │ Open Survey │                                                            │
│  └──────┬──────┘                                                            │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 1: Initialize Response Session                                │   │
│  │  ├─ Generate response session ID                                    │   │
│  │  ├─ Capture device fingerprint                                      │   │
│  │  ├─ Check for existing incomplete response                          │   │
│  │  ├─ Validate survey is active and accepting responses               │   │
│  │  └─ Load survey structure and questions                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 2: Screening Questions (If Configured)                        │   │
│  │  ├─ Present screening questions                                     │   │
│  │  ├─ Evaluate qualification criteria                                 │   │
│  │  ├─ PASS → Continue to main survey                                  │   │
│  │  └─ FAIL → Show disqualification message, end session               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 3: Answer Collection Loop                                     │   │
│  │  ├─ Present question based on display logic                         │   │
│  │  ├─ Capture user answer                                             │   │
│  │  ├─ Client-side validation                                          │   │
│  │  ├─ Auto-save answer (if multi-session mode)                        │   │
│  │  ├─ Evaluate skip/branch logic                                      │   │
│  │  ├─ Determine next question                                         │   │
│  │  └─ REPEAT until all questions answered or survey ends              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 4: Pre-Submission Validation                                  │   │
│  │  ├─ Verify all required questions answered                          │   │
│  │  ├─ Server-side answer validation                                   │   │
│  │  ├─ Check response completeness                                     │   │
│  │  └─ Generate response checksum                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 5: Fraud Detection                                            │   │
│  │  ├─ Check completion time (too fast = suspicious)                   │   │
│  │  ├─ Analyze answer patterns (all same = suspicious)                 │   │
│  │  ├─ Verify device fingerprint consistency                           │   │
│  │  ├─ Check IP rate limits                                            │   │
│  │  └─ Calculate fraud risk score                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 6: Response Persistence                                       │   │
│  │  ├─ Store response in PostgreSQL                                    │   │
│  │  ├─ Update real-time aggregations in Redis                          │   │
│  │  ├─ Queue analytics processing                                      │   │
│  │  ├─ Update survey response count                                    │   │
│  │  └─ Trigger completion webhooks (if configured)                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────┐                                                            │
│  │   Complete  │                                                            │
│  └─────────────┘                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.2.2 Response Session Initialization

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE SESSION INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"


const InitializeResponseSessionInputSchema = z.object({
  surveyId: z.string().cuid(),
  deviceFingerprint: z.string().min(32).max(128),
  userAgent: z.string().max(500),
  ipAddress: z.string().ip(),
  referrer: z.string().url().optional(),
  utmParams: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional()
  }).optional()
})

const ResponseSessionSchema = z.object({
  sessionId: z.string().cuid(),
  surveyId: z.string().cuid(),
  responseId: z.string().cuid().nullable(),
  status: z.enum(["INITIALIZED", "SCREENING", "IN_PROGRESS", "PAUSED", "SUBMITTED"]),
  startedAt: z.date(),
  expiresAt: z.date(),
  currentQuestionIndex: z.number().int().min(0),
  answeredQuestionIds: z.array(z.string()),
  isResumed: z.boolean(),
  deviceFingerprint: z.string()
})

type InitializeResponseSessionInput = z.infer<typeof InitializeResponseSessionInputSchema>
type ResponseSession = z.infer<typeof ResponseSessionSchema>


async function initializeResponseSession(
  input: InitializeResponseSessionInput
): Promise<ResponseSession> {
  const validated = InitializeResponseSessionInputSchema.parse(input)
  
  const [survey] = await db.select()
    .from(surveys)
    .where(eq(surveys.id, validated.surveyId))

  const surveyQuestions = await db.select()
    .from(questions)
    .where(eq(questions.surveyId, validated.surveyId))
    .orderBy(asc(questions.position))

  const surveyScreeningQuestions = await db.select()
    .from(screeningQuestions)
    .where(eq(screeningQuestions.surveyId, validated.surveyId))
    .orderBy(asc(screeningQuestions.position))
  
  if (!survey) {
    throw new Error("SURVEY_NOT_FOUND")
  }
  
  if (survey.status !== "ACTIVE") {
    throw new Error("SURVEY_NOT_ACTIVE")
  }
  
  if (survey.closesAt && survey.closesAt < new Date()) {
    throw new Error("SURVEY_CLOSED")
  }
  
  if (survey.maxResponses && survey.responseCount >= survey.maxResponses) {
    throw new Error("SURVEY_RESPONSE_LIMIT_REACHED")
  }
  
  const [existingIncomplete] = await db.select()
    .from(responses)
    .where(and(
      eq(responses.surveyId, validated.surveyId),
      eq(responses.deviceFingerprint, validated.deviceFingerprint),
      inArray(responses.status, ["IN_PROGRESS", "PAUSED"])
    ))
  
  if (existingIncomplete && survey.allowMultiSession) {
    return {
      sessionId: generateCuid(),
      surveyId: validated.surveyId,
      responseId: existingIncomplete.id,
      status: "IN_PROGRESS",
      startedAt: existingIncomplete.startedAt,
      expiresAt: existingIncomplete.expiresAt,
      currentQuestionIndex: existingIncomplete.lastQuestionIndex,
      answeredQuestionIds: existingIncomplete.answeredQuestionIds,
      isResumed: true,
      deviceFingerprint: validated.deviceFingerprint
    }
  }
  
  const [existingComplete] = await db.select()
    .from(responses)
    .where(and(
      eq(responses.surveyId, validated.surveyId),
      eq(responses.deviceFingerprint, validated.deviceFingerprint),
      eq(responses.status, "COMPLETED")
    ))
  
  if (existingComplete && !survey.allowMultipleResponses) {
    throw new Error("ALREADY_RESPONDED")
  }
  
  const sessionDuration = survey.allowMultiSession
    ? 7 * 24 * 60 * 60 * 1000
    : 30 * 60 * 1000
  
  return {
    sessionId: generateCuid(),
    surveyId: validated.surveyId,
    responseId: null,
    status: survey.screeningQuestions.length > 0 ? "SCREENING" : "IN_PROGRESS",
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + sessionDuration),
    currentQuestionIndex: 0,
    answeredQuestionIds: [],
    isResumed: false,
    deviceFingerprint: validated.deviceFingerprint
  }
}

export {
  InitializeResponseSessionInputSchema,
  ResponseSessionSchema,
  initializeResponseSession
}
export type {
  InitializeResponseSessionInput,
  ResponseSession
}
```


## 7.2.3 Answer Submission Handler

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ANSWER SUBMISSION HANDLER
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"


const SubmitAnswerInputSchema = z.object({
  sessionId: z.string().cuid(),
  responseId: z.string().cuid().nullable(),
  questionId: z.string().cuid(),
  answer: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.object({
      latitude: z.number(),
      longitude: z.number()
    }),
    z.object({
      fileId: z.string(),
      fileName: z.string(),
      fileSize: z.number()
    })
  ]),
  timeSpentMs: z.number().int().min(0).max(3600000)
})

const SubmitAnswerResultSchema = z.object({
  success: z.boolean(),
  responseId: z.string().cuid(),
  answerId: z.string().cuid(),
  nextQuestionId: z.string().cuid().nullable(),
  isComplete: z.boolean(),
  validationErrors: z.array(z.object({
    field: z.string(),
    message: z.string()
  })).optional()
})

type SubmitAnswerInput = z.infer<typeof SubmitAnswerInputSchema>
type SubmitAnswerResult = z.infer<typeof SubmitAnswerResultSchema>


async function submitAnswer(
  input: SubmitAnswerInput
): Promise<SubmitAnswerResult> {
  const validated = SubmitAnswerInputSchema.parse(input)
  
  const session = await getResponseSession(validated.sessionId)
  if (!session) {
    throw new Error("SESSION_NOT_FOUND")
  }
  
  if (session.expiresAt < new Date()) {
    throw new Error("SESSION_EXPIRED")
  }
  
  const [question] = await db.select()
    .from(questions)
    .where(eq(questions.id, validated.questionId))

  const questionValidationRules = await db.select()
    .from(validationRules)
    .where(eq(validationRules.questionId, validated.questionId))
  
  if (!question) {
    throw new Error("QUESTION_NOT_FOUND")
  }
  
  const validationErrors = validateAnswer(question, validated.answer)
  if (validationErrors.length > 0) {
    return {
      success: false,
      responseId: validated.responseId ?? "",
      answerId: "",
      nextQuestionId: null,
      isComplete: false,
      validationErrors
    }
  }
  
  let response
  if (validated.responseId) {
    const [found] = await db.select()
      .from(responses)
      .where(eq(responses.id, validated.responseId))
    response = found
  } else {
    const [created] = await db.insert(responses)
      .values({
        surveyId: session.surveyId,
        deviceFingerprint: session.deviceFingerprint,
        status: "IN_PROGRESS",
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        lastQuestionIndex: 0,
        answeredQuestionIds: [],
        metadata: {}
      })
      .returning()
    response = created
  }
  
  if (!response) {
    throw new Error("RESPONSE_NOT_FOUND")
  }
  
  const [answer] = await db.insert(answers)
    .values({
      responseId: response.id,
      questionId: validated.questionId,
      value: validated.answer,
      timeSpentMs: validated.timeSpentMs
    })
    .onConflictDoUpdate({
      target: [answers.responseId, answers.questionId],
      set: {
        value: validated.answer,
        timeSpentMs: validated.timeSpentMs,
        updatedAt: new Date()
      }
    })
    .returning()
  
  const updatedAnsweredIds = [...new Set([...response.answeredQuestionIds, validated.questionId])]
  
  await db.update(responses)
    .set({
      answeredQuestionIds: updatedAnsweredIds,
      lastQuestionIndex: updatedAnsweredIds.length
    })
    .where(eq(responses.id, response.id))
  
  const nextQuestion = await determineNextQuestion(
    session.surveyId,
    validated.questionId,
    validated.answer,
    updatedAnsweredIds
  )
  
  return {
    success: true,
    responseId: response.id,
    answerId: answer.id,
    nextQuestionId: nextQuestion?.id ?? null,
    isComplete: nextQuestion === null
  }
}

export {
  SubmitAnswerInputSchema,
  SubmitAnswerResultSchema,
  submitAnswer
}
export type {
  SubmitAnswerInput,
  SubmitAnswerResult
}
```


## 7.2.4 Response Completion Handler

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE COMPLETION HANDLER
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"


const CompleteResponseInputSchema = z.object({
  sessionId: z.string().cuid(),
  responseId: z.string().cuid(),
  clientChecksum: z.string().length(64)
})

const CompleteResponseResultSchema = z.object({
  success: z.boolean(),
  responseId: z.string().cuid(),
  completedAt: z.date(),
  confirmationCode: z.string(),
  fraudScore: z.number().min(0).max(100),
  isFlagged: z.boolean(),
  message: z.string().optional()
})

type CompleteResponseInput = z.infer<typeof CompleteResponseInputSchema>
type CompleteResponseResult = z.infer<typeof CompleteResponseResultSchema>


async function completeResponse(
  input: CompleteResponseInput
): Promise<CompleteResponseResult> {
  const validated = CompleteResponseInputSchema.parse(input)
  
  const [response] = await db.select()
    .from(responses)
    .where(eq(responses.id, validated.responseId))

  const responseAnswers = await db.select()
    .from(answers)
    .where(eq(answers.responseId, validated.responseId))

  const [survey] = await db.select()
    .from(surveys)
    .where(eq(surveys.id, response.surveyId))

  const requiredQuestions = await db.select()
    .from(questions)
    .where(and(
      eq(questions.surveyId, response.surveyId),
      eq(questions.isRequired, true)
    ))
  
  if (!response) {
    throw new Error("RESPONSE_NOT_FOUND")
  }
  
  if (response.status === "COMPLETED") {
    throw new Error("RESPONSE_ALREADY_COMPLETED")
  }
  
  const requiredQuestionIds = response.survey.questions.map(q => q.id)
  const answeredQuestionIds = response.answers.map(a => a.questionId)
  const missingRequired = requiredQuestionIds.filter(
    id => !answeredQuestionIds.includes(id)
  )
  
  if (missingRequired.length > 0) {
    throw new Error(`MISSING_REQUIRED_QUESTIONS: ${missingRequired.join(", ")}`)
  }
  
  const serverChecksum = generateResponseChecksum(response.answers)
  if (serverChecksum !== validated.clientChecksum) {
    throw new Error("CHECKSUM_MISMATCH")
  }
  
  const fraudAnalysis = await analyzeFraudIndicators(response)
  
  const completedAt = new Date()
  const confirmationCode = generateConfirmationCode()
  
  await db.transaction(async (tx) => {
    await tx.update(responses)
      .set({
        status: fraudAnalysis.isFlagged ? "FRAUD_FLAGGED" : "COMPLETED",
        completedAt,
        confirmationCode,
        fraudScore: fraudAnalysis.score,
        totalTimeMs: completedAt.getTime() - response.startedAt.getTime()
      })
      .where(eq(responses.id, response.id))

    await tx.update(surveys)
      .set({
        responseCount: sql`${surveys.responseCount} + 1`
      })
      .where(eq(surveys.id, response.surveyId))

    await queueAggregationUpdate(response.surveyId, responseAnswers)

    await updateRealTimeCache(response.surveyId, responseAnswers)
  })
  
  return {
    success: true,
    responseId: response.id,
    completedAt,
    confirmationCode,
    fraudScore: fraudAnalysis.score,
    isFlagged: fraudAnalysis.isFlagged,
    message: fraudAnalysis.isFlagged
      ? "Your response has been received and is under review."
      : "Thank you for completing the survey!"
  }
}

function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function generateResponseChecksum(answers: Array<{ questionId: string; value: unknown }>): string {
  const sortedAnswers = [...answers].sort((a, b) => a.questionId.localeCompare(b.questionId))
  const data = JSON.stringify(sortedAnswers.map(a => ({ q: a.questionId, v: a.value })))
  return createHash("sha256").update(data).digest("hex")
}

export {
  CompleteResponseInputSchema,
  CompleteResponseResultSchema,
  completeResponse,
  generateConfirmationCode,
  generateResponseChecksum
}
export type {
  CompleteResponseInput,
  CompleteResponseResult
}
```




---

# 7.3 Anonymous Response System

## 7.3.1 Anonymity Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ANONYMITY ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    ANONYMITY GUARANTEE LAYERS                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  Layer 1: DATA SEPARATION                                           │   │
│  │  ├─ Response data stored separately from user identity              │   │
│  │  ├─ No foreign key linking response to user account                 │   │
│  │  └─ Anonymous participation token is one-way hash                   │   │
│  │                                                                     │   │
│  │  Layer 2: DEVICE FINGERPRINT HASHING                                │   │
│  │  ├─ Device fingerprint is hashed with survey-specific salt          │   │
│  │  ├─ Same device has different hash per survey                       │   │
│  │  └─ Cannot correlate responses across surveys                       │   │
│  │                                                                     │   │
│  │  Layer 3: TEMPORAL DECOUPLING                                       │   │
│  │  ├─ Response timestamps are bucketed (not exact)                    │   │
│  │  ├─ Submission time rounded to 15-minute intervals                  │   │
│  │  └─ Prevents timing-based identification                            │   │
│  │                                                                     │   │
│  │  Layer 4: METADATA SANITIZATION                                     │   │
│  │  ├─ IP addresses not stored for anonymous surveys                   │   │
│  │  ├─ User agent generalized to browser family only                   │   │
│  │  └─ Location data aggregated to region level                        │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.3.2 Device Fingerprinting Strategy

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DEVICE FINGERPRINTING STRATEGY
// ══════════════════════════════════════════════════════════════════════════════
// [REFERENCE] Full DeviceFingerprintComponentsSchema defined in BIBLE-009 Section 9.2.1
// This is a simplified subset for anonymous response tracking

import { z } from "zod"
import { createHash, createHmac } from "crypto"


const DeviceFingerprintComponentsSchema = z.object({
  screenResolution: z.string(),
  colorDepth: z.number(),
  timezone: z.string(),
  language: z.string(),
  platform: z.string(),
  hardwareConcurrency: z.number(),
  deviceMemory: z.number().optional(),
  touchSupport: z.boolean(),
  webglVendor: z.string().optional(),
  webglRenderer: z.string().optional(),
  canvasFingerprint: z.string(),
  audioFingerprint: z.string().optional(),
  fonts: z.array(z.string())
})

const AnonymousParticipantTokenSchema = z.object({
  token: z.string().length(64),
  surveyId: z.string().cuid(),
  createdAt: z.date(),
  expiresAt: z.date()
})

type DeviceFingerprintComponents = z.infer<typeof DeviceFingerprintComponentsSchema>
type AnonymousParticipantToken = z.infer<typeof AnonymousParticipantTokenSchema>


function generateDeviceFingerprint(components: DeviceFingerprintComponents): string {
  const validated = DeviceFingerprintComponentsSchema.parse(components)
  
  const fingerprintData = [
    validated.screenResolution,
    validated.colorDepth.toString(),
    validated.timezone,
    validated.language,
    validated.platform,
    validated.hardwareConcurrency.toString(),
    validated.deviceMemory?.toString() ?? "unknown",
    validated.touchSupport.toString(),
    validated.webglVendor ?? "unknown",
    validated.webglRenderer ?? "unknown",
    validated.canvasFingerprint,
    validated.audioFingerprint ?? "unknown",
    validated.fonts.sort().join(",")
  ].join("|")
  
  return createHash("sha256").update(fingerprintData).digest("hex")
}


function generateAnonymousParticipantToken(
  deviceFingerprint: string,
  surveyId: string,
  surveySalt: string
): AnonymousParticipantToken {
  const tokenData = `${deviceFingerprint}:${surveyId}`
  const token = createHmac("sha256", surveySalt)
    .update(tokenData)
    .digest("hex")
  
  return {
    token,
    surveyId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
}


function verifyParticipantToken(
  deviceFingerprint: string,
  surveyId: string,
  surveySalt: string,
  providedToken: string
): boolean {
  const expectedToken = generateAnonymousParticipantToken(
    deviceFingerprint,
    surveyId,
    surveySalt
  )
  return expectedToken.token === providedToken
}


async function checkAnonymousDuplicateParticipation(
  surveyId: string,
  participantToken: string
): Promise<boolean> {
  const [existingResponse] = await db.select()
    .from(responses)
    .where(and(
      eq(responses.surveyId, surveyId),
      eq(responses.anonymousToken, participantToken),
      eq(responses.status, "COMPLETED")
    ))
  
  return existingResponse !== null
}

export {
  DeviceFingerprintComponentsSchema,
  AnonymousParticipantTokenSchema,
  generateDeviceFingerprint,
  generateAnonymousParticipantToken,
  verifyParticipantToken,
  checkAnonymousDuplicateParticipation
}
export type {
  DeviceFingerprintComponents,
  AnonymousParticipantToken
}
```


## 7.3.3 Anonymous Response Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ANONYMOUS RESPONSE FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐                                                            │
│  │   Client    │                                                            │
│  └──────┬──────┘                                                            │
│         │                                                                   │
│         │ 1. Collect device fingerprint components                          │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CLIENT-SIDE FINGERPRINTING                                         │   │
│  │  ├─ Canvas rendering hash                                           │   │
│  │  ├─ WebGL renderer info                                             │   │
│  │  ├─ Audio context fingerprint                                       │   │
│  │  ├─ Screen and display properties                                   │   │
│  │  ├─ Installed fonts detection                                       │   │
│  │  └─ Hardware capabilities                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         │ 2. Send fingerprint components to server                          │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SERVER-SIDE PROCESSING                                             │   │
│  │  ├─ Generate device fingerprint hash                                │   │
│  │  ├─ Create survey-specific participant token                        │   │
│  │  ├─ Check for existing participation                                │   │
│  │  └─ Return participation token to client                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         │ 3. Store token in local storage                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  RESPONSE SUBMISSION                                                │   │
│  │  ├─ Include participation token with each answer                    │   │
│  │  ├─ Server verifies token matches fingerprint                       │   │
│  │  ├─ Response stored with token, NOT fingerprint                     │   │
│  │  └─ No user identity linked to response                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         │ 4. Complete survey                                                │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  POST-COMPLETION                                                    │   │
│  │  ├─ Token marked as used for this survey                            │   │
│  │  ├─ Future attempts with same token rejected                        │   │
│  │  └─ User cannot trace back which response is theirs                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.3.4 Semi-Anonymous Organization Responses

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SEMI-ANONYMOUS ORGANIZATION RESPONSES
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"


const SemiAnonymousVerificationSchema = z.object({
  organizationId: z.string().cuid(),
  surveyId: z.string().cuid(),
  membershipProof: z.string(),
  blindedToken: z.string()
})

const SemiAnonymousResponseSchema = z.object({
  surveyId: z.string().cuid(),
  organizationId: z.string().cuid(),
  blindedToken: z.string(),
  verifiedAt: z.date(),
  membershipValid: z.boolean()
})

type SemiAnonymousVerification = z.infer<typeof SemiAnonymousVerificationSchema>
type SemiAnonymousResponse = z.infer<typeof SemiAnonymousResponseSchema>


async function verifySemiAnonymousMembership(
  input: SemiAnonymousVerification
): Promise<SemiAnonymousResponse> {
  const validated = SemiAnonymousVerificationSchema.parse(input)
  
  const [membership] = await db.select({
    id: organizationMemberships.id,
    organizationId: organizationMemberships.organizationId
  })
    .from(organizationMemberships)
    .where(and(
      eq(organizationMemberships.organizationId, validated.organizationId),
      eq(organizationMemberships.status, "ACTIVE")
    ))
  
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


async function verifyBlindedMembershipProof(
  proof: string,
  organizationId: string
): Promise<boolean> {
  return true
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
  verifyBlindedMembershipProof,
  recordSemiAnonymousParticipation,
  checkSemiAnonymousDuplicate
}
export type {
  SemiAnonymousVerification,
  SemiAnonymousResponse
}
```




---

# 7.4 Response Validation Rules

## 7.4.1 Validation Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       VALIDATION ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     CLIENT-SIDE VALIDATION                          │   │
│  │                      (First Line of Defense)                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • Immediate feedback to user                                       │   │
│  │  • Format validation (email, phone, etc.)                           │   │
│  │  • Required field checks                                            │   │
│  │  • Length limits                                                    │   │
│  │  • Pattern matching                                                 │   │
│  │  • NOT a security measure - can be bypassed                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     SERVER-SIDE VALIDATION                          │   │
│  │                       (Source of Truth)                             │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • All client validations repeated                                  │   │
│  │  • Business logic validation                                        │   │
│  │  • Cross-field validation                                           │   │
│  │  • Database constraint validation                                   │   │
│  │  • Anti-abuse validation                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     POST-SUBMISSION VALIDATION                      │   │
│  │                       (Quality Assurance)                           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • Consistency checks across answers                                │   │
│  │  • Pattern detection (straight-lining, etc.)                        │   │
│  │  • Outlier detection                                                │   │
│  │  • Text quality analysis (for open-ended)                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.4.2 Answer Validation Engine

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


function applyValidationRule(
  fieldId: string,
  answer: unknown,
  rule: ValidationRule
): ValidationError | null {
  switch (rule.type) {
    case "MIN_LENGTH":
      if (typeof answer === "string" && answer.length < rule.value) {
        return {
          field: fieldId,
          rule: "MIN_LENGTH",
          message: rule.message ?? `Minimum length is ${rule.value} characters`
        }
      }
      break
      
    case "MAX_LENGTH":
      if (typeof answer === "string" && answer.length > rule.value) {
        return {
          field: fieldId,
          rule: "MAX_LENGTH",
          message: rule.message ?? `Maximum length is ${rule.value} characters`
        }
      }
      break
      
    case "MIN_VALUE":
      if (typeof answer === "number" && answer < rule.value) {
        return {
          field: fieldId,
          rule: "MIN_VALUE",
          message: rule.message ?? `Minimum value is ${rule.value}`
        }
      }
      break
      
    case "MAX_VALUE":
      if (typeof answer === "number" && answer > rule.value) {
        return {
          field: fieldId,
          rule: "MAX_VALUE",
          message: rule.message ?? `Maximum value is ${rule.value}`
        }
      }
      break
      
    case "PATTERN":
      if (typeof answer === "string") {
        const regex = new RegExp(rule.value)
        if (!regex.test(answer)) {
          return {
            field: fieldId,
            rule: "PATTERN",
            message: rule.message ?? "Invalid format"
          }
        }
      }
      break
      
    case "EMAIL":
      if (typeof answer === "string") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(answer)) {
          return {
            field: fieldId,
            rule: "EMAIL",
            message: rule.message ?? "Invalid email address"
          }
        }
      }
      break
      
    case "URL":
      if (typeof answer === "string") {
        try {
          new URL(answer)
        } catch {
          return {
            field: fieldId,
            rule: "URL",
            message: rule.message ?? "Invalid URL"
          }
        }
      }
      break
      
    case "PHONE":
      if (typeof answer === "string") {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/
        if (!phoneRegex.test(answer.replace(/[\s\-\(\)]/g, ""))) {
          return {
            field: fieldId,
            rule: "PHONE",
            message: rule.message ?? "Invalid phone number"
          }
        }
      }
      break
      
    case "MIN_SELECTIONS":
      if (Array.isArray(answer) && answer.length < rule.value) {
        return {
          field: fieldId,
          rule: "MIN_SELECTIONS",
          message: rule.message ?? `Please select at least ${rule.value} options`
        }
      }
      break
      
    case "MAX_SELECTIONS":
      if (Array.isArray(answer) && answer.length > rule.value) {
        return {
          field: fieldId,
          rule: "MAX_SELECTIONS",
          message: rule.message ?? `Please select at most ${rule.value} options`
        }
      }
      break
      
    case "DATE_RANGE":
      if (typeof answer === "string") {
        const date = new Date(answer)
        if (rule.minDate && date < new Date(rule.minDate)) {
          return {
            field: fieldId,
            rule: "DATE_RANGE",
            message: rule.message ?? `Date must be after ${rule.minDate}`
          }
        }
        if (rule.maxDate && date > new Date(rule.maxDate)) {
          return {
            field: fieldId,
            rule: "DATE_RANGE",
            message: rule.message ?? `Date must be before ${rule.maxDate}`
          }
        }
      }
      break
      
    case "FILE_TYPE":
      if (typeof answer === "object" && answer !== null && "fileName" in answer) {
        const fileAnswer = answer as { fileName: string }
        const extension = fileAnswer.fileName.split(".").pop()?.toLowerCase()
        if (extension && !rule.allowedTypes.includes(extension)) {
          return {
            field: fieldId,
            rule: "FILE_TYPE",
            message: rule.message ?? `Allowed file types: ${rule.allowedTypes.join(", ")}`
          }
        }
      }
      break
      
    case "FILE_SIZE":
      if (typeof answer === "object" && answer !== null && "fileSize" in answer) {
        const fileAnswer = answer as { fileSize: number }
        if (fileAnswer.fileSize > rule.maxSizeBytes) {
          const maxSizeMB = (rule.maxSizeBytes / (1024 * 1024)).toFixed(1)
          return {
            field: fieldId,
            rule: "FILE_SIZE",
            message: rule.message ?? `Maximum file size is ${maxSizeMB} MB`
          }
        }
      }
      break
  }
  
  return null
}

export {
  ValidationRuleSchema,
  ValidationErrorSchema,
  ValidationResultSchema,
  validateAnswer,
  applyValidationRule
}
export type {
  ValidationRule,
  ValidationError,
  ValidationResult
}
```


## 7.4.3 Cross-Field Validation

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


function applyCrossFieldRule(
  answers: Map<string, unknown>,
  rule: CrossFieldRule
): ValidationError | null {
  switch (rule.type) {
    case "COMPARE": {
      const value1 = answers.get(rule.field1)
      const value2 = answers.get(rule.field2)
      
      if (value1 === undefined || value2 === undefined) {
        return null
      }
      
      let isValid = false
      switch (rule.operator) {
        case "EQUALS":
          isValid = value1 === value2
          break
        case "NOT_EQUALS":
          isValid = value1 !== value2
          break
        case "GREATER":
          isValid = Number(value1) > Number(value2)
          break
        case "LESS":
          isValid = Number(value1) < Number(value2)
          break
        case "GREATER_OR_EQUAL":
          isValid = Number(value1) >= Number(value2)
          break
        case "LESS_OR_EQUAL":
          isValid = Number(value1) <= Number(value2)
          break
      }
      
      if (!isValid) {
        return {
          field: rule.field1,
          rule: "COMPARE",
          message: rule.message
        }
      }
      break
    }
    
    case "SUM_EQUALS": {
      const values = rule.fields.map(f => Number(answers.get(f) ?? 0))
      const sum = values.reduce((a, b) => a + b, 0)
      
      if (sum !== rule.targetValue) {
        return {
          field: rule.fields[0],
          rule: "SUM_EQUALS",
          message: rule.message
        }
      }
      break
    }
    
    case "MUTUALLY_EXCLUSIVE": {
      const answeredFields = rule.fields.filter(f => {
        const value = answers.get(f)
        return value !== undefined && value !== null && value !== ""
      })
      
      if (answeredFields.length > 1) {
        return {
          field: answeredFields[0],
          rule: "MUTUALLY_EXCLUSIVE",
          message: rule.message
        }
      }
      break
    }
    
    case "CONDITIONAL_REQUIRED": {
      const triggerValue = answers.get(rule.triggerField)
      const requiredValue = answers.get(rule.requiredField)
      
      if (triggerValue === rule.triggerValue) {
        if (requiredValue === undefined || requiredValue === null || requiredValue === "") {
          return {
            field: rule.requiredField,
            rule: "CONDITIONAL_REQUIRED",
            message: rule.message
          }
        }
      }
      break
    }
  }
  
  return null
}

export {
  CrossFieldRuleSchema,
  validateCrossFieldRules,
  applyCrossFieldRule
}
export type {
  CrossFieldRule
}
```




---

# 7.5 Rate Limiting & Fraud Prevention

## 7.5.1 Rate Limiting Architecture

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
│  │  ├─ 1000 requests/minute per IP (all endpoints)                     │   │
│  │  ├─ Implemented at load balancer level                              │   │
│  │  └─ Protects against DDoS attacks                                   │   │
│  │                                                                     │   │
│  │  Layer 2: ENDPOINT RATE LIMIT                                       │   │
│  │  ├─ Response submission: 60 requests/minute per IP                  │   │
│  │  ├─ Survey loading: 100 requests/minute per IP                      │   │
│  │  └─ Prevents automated scraping/submission                          │   │
│  │                                                                     │   │
│  │  Layer 3: SURVEY-SPECIFIC RATE LIMIT                                │   │
│  │  ├─ 5 incomplete responses per device per survey                    │   │
│  │  ├─ 1 complete response per device per survey (if restricted)       │   │
│  │  └─ Prevents ballot stuffing                                        │   │
│  │                                                                     │   │
│  │  Layer 4: USER RATE LIMIT (Authenticated)                           │   │
│  │  ├─ 100 responses/day per user account                              │   │
│  │  ├─ 10 responses/hour per user per organization                     │   │
│  │  └─ Prevents abuse by authenticated users                           │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.5.2 Rate Limiter Implementation

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RATE LIMITER IMPLEMENTATION
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"
import { Redis } from "ioredis"


const RateLimitConfigSchema = z.object({
  key: z.string(),
  limit: z.number().int().positive(),
  windowMs: z.number().int().positive(),
  blockDurationMs: z.number().int().positive().optional()
})

const RateLimitResultSchema = z.object({
  allowed: z.boolean(),
  remaining: z.number().int().min(0),
  resetAt: z.date(),
  retryAfterMs: z.number().int().min(0).optional()
})

type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>
type RateLimitResult = z.infer<typeof RateLimitResultSchema>


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


class RateLimiter {
  private redis: Redis
  
  constructor(redis: Redis) {
    this.redis = redis
  }
  
  async checkLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    const validated = RateLimitConfigSchema.parse(config)
    const now = Date.now()
    const windowStart = now - validated.windowMs
    
    const blockedKey = `ratelimit:blocked:${validated.key}`
    const blocked = await this.redis.get(blockedKey)
    
    if (blocked) {
      const blockedUntil = parseInt(blocked, 10)
      if (blockedUntil > now) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: new Date(blockedUntil),
          retryAfterMs: blockedUntil - now
        }
      }
    }
    
    const countKey = `ratelimit:count:${validated.key}`
    
    await this.redis.zremrangebyscore(countKey, 0, windowStart)
    
    const currentCount = await this.redis.zcard(countKey)
    
    if (currentCount >= validated.limit) {
      if (validated.blockDurationMs) {
        const blockedUntil = now + validated.blockDurationMs
        await this.redis.set(
          blockedKey,
          blockedUntil.toString(),
          "PX",
          validated.blockDurationMs
        )
      }
      
      const oldestEntry = await this.redis.zrange(countKey, 0, 0, "WITHSCORES")
      const resetAt = oldestEntry.length >= 2
        ? parseInt(oldestEntry[1], 10) + validated.windowMs
        : now + validated.windowMs
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(resetAt),
        retryAfterMs: resetAt - now
      }
    }
    
    const requestId = `${now}:${Math.random().toString(36).substring(2)}`
    await this.redis.zadd(countKey, now.toString(), requestId)
    await this.redis.pexpire(countKey, validated.windowMs)
    
    return {
      allowed: true,
      remaining: validated.limit - currentCount - 1,
      resetAt: new Date(now + validated.windowMs)
    }
  }
  
  async resetLimit(key: string): Promise<void> {
    await this.redis.del(`ratelimit:count:${key}`)
    await this.redis.del(`ratelimit:blocked:${key}`)
  }
}


function buildRateLimitKey(
  type: keyof typeof RATE_LIMIT_PRESETS,
  ...identifiers: string[]
): string {
  return `${type}:${identifiers.join(":")}`
}

export {
  RateLimitConfigSchema,
  RateLimitResultSchema,
  RATE_LIMIT_PRESETS,
  RateLimiter,
  buildRateLimitKey
}
export type {
  RateLimitConfig,
  RateLimitResult
}
```


## 7.5.3 Fraud Detection Engine

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// FRAUD DETECTION ENGINE
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"


const FraudIndicatorSchema = z.object({
  type: z.enum([
    "COMPLETION_TOO_FAST",
    "COMPLETION_TOO_SLOW",
    "STRAIGHT_LINING",
    "RANDOM_PATTERN",
    "DUPLICATE_FINGERPRINT",
    "SUSPICIOUS_IP",
    "BOT_LIKE_BEHAVIOR",
    "INCONSISTENT_ANSWERS",
    "GIBBERISH_TEXT"
  ]),
  score: z.number().min(0).max(100),
  details: z.string()
})

const FraudAnalysisResultSchema = z.object({
  totalScore: z.number().min(0).max(100),
  isFlagged: z.boolean(),
  indicators: z.array(FraudIndicatorSchema),
  recommendation: z.enum(["ACCEPT", "REVIEW", "REJECT"])
})

type FraudIndicator = z.infer<typeof FraudIndicatorSchema>
type FraudAnalysisResult = z.infer<typeof FraudAnalysisResultSchema>


const FRAUD_THRESHOLDS = {
  FLAG_THRESHOLD: 50,
  REJECT_THRESHOLD: 80,
  MIN_COMPLETION_TIME_MS: 30 * 1000,
  MAX_COMPLETION_TIME_MS: 4 * 60 * 60 * 1000,
  STRAIGHT_LINE_THRESHOLD: 0.8,
  MIN_TEXT_LENGTH_FOR_ANALYSIS: 20
} as const


async function analyzeFraudIndicators(
  response: {
    id: string
    surveyId: string
    startedAt: Date
    answers: Array<{
      questionId: string
      value: unknown
      timeSpentMs: number
    }>
    deviceFingerprint: string
    metadata: Record<string, unknown>
  }
): Promise<FraudAnalysisResult> {
  const indicators: FraudIndicator[] = []
  
  const completionTimeIndicator = analyzeCompletionTime(response)
  if (completionTimeIndicator) {
    indicators.push(completionTimeIndicator)
  }
  
  const straightLiningIndicator = analyzeStraightLining(response.answers)
  if (straightLiningIndicator) {
    indicators.push(straightLiningIndicator)
  }
  
  const textQualityIndicators = analyzeTextQuality(response.answers)
  indicators.push(...textQualityIndicators)
  
  const duplicateIndicator = await analyzeDuplicatePatterns(
    response.surveyId,
    response.deviceFingerprint
  )
  if (duplicateIndicator) {
    indicators.push(duplicateIndicator)
  }
  
  const totalScore = Math.min(
    100,
    indicators.reduce((sum, ind) => sum + ind.score, 0)
  )
  
  let recommendation: "ACCEPT" | "REVIEW" | "REJECT"
  if (totalScore >= FRAUD_THRESHOLDS.REJECT_THRESHOLD) {
    recommendation = "REJECT"
  } else if (totalScore >= FRAUD_THRESHOLDS.FLAG_THRESHOLD) {
    recommendation = "REVIEW"
  } else {
    recommendation = "ACCEPT"
  }
  
  return {
    totalScore,
    isFlagged: totalScore >= FRAUD_THRESHOLDS.FLAG_THRESHOLD,
    indicators,
    recommendation
  }
}


function analyzeCompletionTime(
  response: {
    startedAt: Date
    answers: Array<{ timeSpentMs: number }>
  }
): FraudIndicator | null {
  const totalTimeMs = response.answers.reduce(
    (sum, a) => sum + a.timeSpentMs,
    0
  )
  
  if (totalTimeMs < FRAUD_THRESHOLDS.MIN_COMPLETION_TIME_MS) {
    return {
      type: "COMPLETION_TOO_FAST",
      score: 40,
      details: `Completed in ${Math.round(totalTimeMs / 1000)} seconds, minimum expected is ${FRAUD_THRESHOLDS.MIN_COMPLETION_TIME_MS / 1000} seconds`
    }
  }
  
  if (totalTimeMs > FRAUD_THRESHOLDS.MAX_COMPLETION_TIME_MS) {
    return {
      type: "COMPLETION_TOO_SLOW",
      score: 10,
      details: `Completion time of ${Math.round(totalTimeMs / 3600000)} hours exceeds expected maximum`
    }
  }
  
  return null
}


function analyzeStraightLining(
  answers: Array<{ questionId: string; value: unknown }>
): FraudIndicator | null {
  const scaleAnswers = answers.filter(
    a => typeof a.value === "number" || typeof a.value === "string"
  )
  
  if (scaleAnswers.length < 5) {
    return null
  }
  
  const valueGroups = new Map<string, number>()
  for (const answer of scaleAnswers) {
    const key = String(answer.value)
    valueGroups.set(key, (valueGroups.get(key) ?? 0) + 1)
  }
  
  const maxSameValue = Math.max(...valueGroups.values())
  const straightLineRatio = maxSameValue / scaleAnswers.length
  
  if (straightLineRatio >= FRAUD_THRESHOLDS.STRAIGHT_LINE_THRESHOLD) {
    return {
      type: "STRAIGHT_LINING",
      score: 35,
      details: `${Math.round(straightLineRatio * 100)}% of scale questions have the same answer`
    }
  }
  
  return null
}


function analyzeTextQuality(
  answers: Array<{ questionId: string; value: unknown }>
): FraudIndicator[] {
  const indicators: FraudIndicator[] = []
  
  const textAnswers = answers.filter(
    a => typeof a.value === "string" &&
         a.value.length >= FRAUD_THRESHOLDS.MIN_TEXT_LENGTH_FOR_ANALYSIS
  )
  
  for (const answer of textAnswers) {
    const text = answer.value as string
    
    if (isGibberish(text)) {
      indicators.push({
        type: "GIBBERISH_TEXT",
        score: 25,
        details: `Answer to question ${answer.questionId} appears to be gibberish`
      })
    }
  }
  
  return indicators
}


function isGibberish(text: string): boolean {
  const consonantRatio = (text.match(/[bcdfghjklmnpqrstvwxyz]/gi)?.length ?? 0) / text.length
  if (consonantRatio > 0.8) {
    return true
  }
  
  const words = text.split(/\s+/)
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length
  if (avgWordLength > 15 || avgWordLength < 2) {
    return true
  }
  
  const repeatedChars = text.match(/(.)\1{4,}/g)
  if (repeatedChars && repeatedChars.length > 0) {
    return true
  }
  
  return false
}


async function analyzeDuplicatePatterns(
  surveyId: string,
  deviceFingerprint: string
): Promise<FraudIndicator | null> {
  const [{ count: recentAttempts }] = await db.select({ count: sql<number>`count(*)` })
    .from(responses)
    .where(and(
      eq(responses.surveyId, surveyId),
      eq(responses.deviceFingerprint, deviceFingerprint),
      gte(responses.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
    ))
  
  if (recentAttempts > 3) {
    return {
      type: "DUPLICATE_FINGERPRINT",
      score: 30,
      details: `${recentAttempts} response attempts from same device in 24 hours`
    }
  }
  
  return null
}

export {
  FraudIndicatorSchema,
  FraudAnalysisResultSchema,
  FRAUD_THRESHOLDS,
  analyzeFraudIndicators,
  analyzeCompletionTime,
  analyzeStraightLining,
  analyzeTextQuality,
  isGibberish,
  analyzeDuplicatePatterns
}
export type {
  FraudIndicator,
  FraudAnalysisResult
}
```




---

# 7.6 Response Storage Strategy

## 7.6.1 Storage Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STORAGE ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         HOT STORAGE                                 │   │
│  │                    (Active Data - Fast Access)                      │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  ┌─────────────────────┐    ┌─────────────────────┐                │   │
│  │  │      Redis          │    │    PostgreSQL       │                │   │
│  │  │   (Real-time)       │    │   (Primary DB)      │                │   │
│  │  ├─────────────────────┤    ├─────────────────────┤                │   │
│  │  │ • Live aggregations │    │ • Responses < 90d   │                │   │
│  │  │ • Session data      │    │ • All active surveys│                │   │
│  │  │ • Rate limit counts │    │ • User data         │                │   │
│  │  │ • Recent responses  │    │ • Full ACID support │                │   │
│  │  │   (last 1 hour)     │    │                     │                │   │
│  │  └─────────────────────┘    └─────────────────────┘                │   │
│  │                                                                     │   │
│  │  Retention: Immediate to 90 days                                    │   │
│  │  Access Time: < 10ms (Redis), < 50ms (PostgreSQL)                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         WARM STORAGE                                │   │
│  │                   (Historical - Regular Access)                     │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────┐               │   │
│  │  │           PostgreSQL Partitioned Tables          │               │   │
│  │  ├─────────────────────────────────────────────────┤               │   │
│  │  │ • Responses 90d - 2 years old                   │               │   │
│  │  │ • Monthly partitions                            │               │   │
│  │  │ • Compressed storage                            │               │   │
│  │  │ • Indexes on common query patterns              │               │   │
│  │  └─────────────────────────────────────────────────┘               │   │
│  │                                                                     │   │
│  │  Retention: 90 days to 2 years                                      │   │
│  │  Access Time: < 200ms                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         COLD STORAGE                                │   │
│  │                    (Archive - Rare Access)                          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────┐               │   │
│  │  │                 AWS S3 Glacier                   │               │   │
│  │  ├─────────────────────────────────────────────────┤               │   │
│  │  │ • Responses > 2 years old                       │               │   │
│  │  │ • Parquet format for efficiency                 │               │   │
│  │  │ • Yearly archives                               │               │   │
│  │  │ • Compliance retention (7 years)                │               │   │
│  │  └─────────────────────────────────────────────────┘               │   │
│  │                                                                     │   │
│  │  Retention: 2 - 7 years                                             │   │
│  │  Access Time: Minutes to hours (retrieval required)                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.6.2 Data Partitioning Strategy

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DATA PARTITIONING STRATEGY
// ══════════════════════════════════════════════════════════════════════════════

const PARTITION_CONFIG = {
  RESPONSE_TABLE: {
    partitionBy: "RANGE",
    column: "created_at",
    interval: "MONTH",
    retention: {
      hot: 90,
      warm: 730,
      cold: 2555
    }
  },
  
  ANSWER_TABLE: {
    partitionBy: "RANGE",
    column: "created_at",
    interval: "MONTH",
    retention: {
      hot: 90,
      warm: 730,
      cold: 2555
    }
  },
  
  AGGREGATION_TABLE: {
    partitionBy: "LIST",
    column: "survey_id",
    retention: {
      hot: 365,
      warm: 1095,
      cold: 2555
    }
  }
} as const


const CREATE_PARTITIONED_RESPONSES_SQL = `
CREATE TABLE responses (
  id              TEXT PRIMARY KEY,
  survey_id       TEXT NOT NULL,
  anonymous_token TEXT,
  status          TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fraud_score     SMALLINT,
  total_time_ms   INTEGER,
  metadata        JSONB DEFAULT '{}'
) PARTITION BY RANGE (created_at);

CREATE TABLE responses_2025_01 PARTITION OF responses
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE responses_2025_02 PARTITION OF responses
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
`


const CREATE_PARTITIONED_ANSWERS_SQL = `
CREATE TABLE answers (
  id              TEXT PRIMARY KEY,
  response_id     TEXT NOT NULL,
  question_id     TEXT NOT NULL,
  value           JSONB NOT NULL,
  time_spent_ms   INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (response_id, question_id)
) PARTITION BY RANGE (created_at);

CREATE TABLE answers_2025_01 PARTITION OF answers
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE answers_2025_02 PARTITION OF answers
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
`


async function createNextMonthPartitions(): Promise<void> {
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  
  const year = nextMonth.getFullYear()
  const month = String(nextMonth.getMonth() + 1).padStart(2, "0")
  const partitionName = `${year}_${month}`
  
  const startDate = `${year}-${month}-01`
  const endMonth = nextMonth.getMonth() + 2
  const endYear = endMonth > 12 ? year + 1 : year
  const endMonthStr = String(endMonth > 12 ? 1 : endMonth).padStart(2, "0")
  const endDate = `${endYear}-${endMonthStr}-01`
  
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS responses_${partitionName}
    PARTITION OF responses
    FOR VALUES FROM ('${startDate}') TO ('${endDate}');
  `))

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS answers_${partitionName}
    PARTITION OF answers
    FOR VALUES FROM ('${startDate}') TO ('${endDate}');
  `))
}


async function archiveOldPartitions(olderThanDays: number): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
  
  const year = cutoffDate.getFullYear()
  const month = String(cutoffDate.getMonth() + 1).padStart(2, "0")
  const partitionName = `${year}_${month}`
  
  await exportPartitionToS3(`responses_${partitionName}`)
  await exportPartitionToS3(`answers_${partitionName}`)
  
  await db.execute(sql.raw(`
    DROP TABLE IF EXISTS responses_${partitionName};
  `))

  await db.execute(sql.raw(`
    DROP TABLE IF EXISTS answers_${partitionName};
  `))
}


async function exportPartitionToS3(tableName: string): Promise<void> {
  console.log(`Exporting ${tableName} to S3...`)
}

export {
  PARTITION_CONFIG,
  CREATE_PARTITIONED_RESPONSES_SQL,
  CREATE_PARTITIONED_ANSWERS_SQL,
  createNextMonthPartitions,
  archiveOldPartitions,
  exportPartitionToS3
}
```


## 7.6.3 Response Caching Strategy

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE CACHING STRATEGY
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"
import { Redis } from "ioredis"


const CacheConfigSchema = z.object({
  prefix: z.string(),
  ttlSeconds: z.number().int().positive(),
  maxEntries: z.number().int().positive().optional()
})

type CacheConfig = z.infer<typeof CacheConfigSchema>


const CACHE_CONFIGS: Record<string, CacheConfig> = {
  RESPONSE_SESSION: {
    prefix: "session",
    ttlSeconds: 30 * 60,
    maxEntries: 100000
  },
  
  SURVEY_STRUCTURE: {
    prefix: "survey:structure",
    ttlSeconds: 5 * 60,
    maxEntries: 10000
  },
  
  LIVE_AGGREGATION: {
    prefix: "agg:live",
    ttlSeconds: 60,
    maxEntries: 50000
  },
  
  RESPONSE_COUNT: {
    prefix: "count",
    ttlSeconds: 30,
    maxEntries: 100000
  }
}


class ResponseCache {
  private redis: Redis
  
  constructor(redis: Redis) {
    this.redis = redis
  }
  
  async cacheResponseSession(
    sessionId: string,
    session: Record<string, unknown>
  ): Promise<void> {
    const config = CACHE_CONFIGS.RESPONSE_SESSION
    const key = `${config.prefix}:${sessionId}`
    await this.redis.setex(key, config.ttlSeconds, JSON.stringify(session))
  }
  
  async getResponseSession(
    sessionId: string
  ): Promise<Record<string, unknown> | null> {
    const config = CACHE_CONFIGS.RESPONSE_SESSION
    const key = `${config.prefix}:${sessionId}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }
  
  async cacheSurveyStructure(
    surveyId: string,
    structure: Record<string, unknown>
  ): Promise<void> {
    const config = CACHE_CONFIGS.SURVEY_STRUCTURE
    const key = `${config.prefix}:${surveyId}`
    await this.redis.setex(key, config.ttlSeconds, JSON.stringify(structure))
  }
  
  async getSurveyStructure(
    surveyId: string
  ): Promise<Record<string, unknown> | null> {
    const config = CACHE_CONFIGS.SURVEY_STRUCTURE
    const key = `${config.prefix}:${surveyId}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }
  
  async invalidateSurveyStructure(surveyId: string): Promise<void> {
    const config = CACHE_CONFIGS.SURVEY_STRUCTURE
    const key = `${config.prefix}:${surveyId}`
    await this.redis.del(key)
  }
  
  async updateLiveAggregation(
    surveyId: string,
    questionId: string,
    aggregation: Record<string, unknown>
  ): Promise<void> {
    const config = CACHE_CONFIGS.LIVE_AGGREGATION
    const key = `${config.prefix}:${surveyId}:${questionId}`
    await this.redis.setex(key, config.ttlSeconds, JSON.stringify(aggregation))
  }
  
  async getLiveAggregation(
    surveyId: string,
    questionId: string
  ): Promise<Record<string, unknown> | null> {
    const config = CACHE_CONFIGS.LIVE_AGGREGATION
    const key = `${config.prefix}:${surveyId}:${questionId}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }
  
  async incrementResponseCount(surveyId: string): Promise<number> {
    const config = CACHE_CONFIGS.RESPONSE_COUNT
    const key = `${config.prefix}:${surveyId}`
    const count = await this.redis.incr(key)
    await this.redis.expire(key, config.ttlSeconds)
    return count
  }
  
  async getResponseCount(surveyId: string): Promise<number> {
    const config = CACHE_CONFIGS.RESPONSE_COUNT
    const key = `${config.prefix}:${surveyId}`
    const count = await this.redis.get(key)
    return count ? parseInt(count, 10) : 0
  }
}

export {
  CacheConfigSchema,
  CACHE_CONFIGS,
  ResponseCache
}
export type {
  CacheConfig
}
```




---

# 7.7 Real-time Processing Pipeline

## 7.7.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REAL-TIME PROCESSING PIPELINE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐                                                            │
│  │  Response   │                                                            │
│  │  Submitted  │                                                            │
│  └──────┬──────┘                                                            │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      EVENT EMITTER                                  │   │
│  │              (Publish response events)                              │   │
│  └───────────────────────────┬─────────────────────────────────────────┘   │
│                              │                                              │
│              ┌───────────────┼───────────────┐                              │
│              │               │               │                              │
│              ▼               ▼               ▼                              │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                     │
│  │  Aggregation  │ │   Webhook     │ │  Notification │                     │
│  │   Processor   │ │   Dispatcher  │ │    Service    │                     │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘                     │
│          │                 │                 │                              │
│          ▼                 ▼                 ▼                              │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                     │
│  │    Redis      │ │   External    │ │    Push       │                     │
│  │    Cache      │ │   Endpoints   │ │  Notifications│                     │
│  └───────────────┘ └───────────────┘ └───────────────┘                     │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                        BATCH PROCESSING (Background)                        │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                     │
│  │   Analytics   │ │    Report     │ │    Data       │                     │
│  │   Aggregator  │ │   Generator   │ │    Exporter   │                     │
│  └───────────────┘ └───────────────┘ └───────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.7.2 Event System

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE EVENT SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"
import { EventEmitter } from "events"


const ResponseEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("RESPONSE_STARTED"),
    payload: z.object({
      responseId: z.string(),
      surveyId: z.string(),
      startedAt: z.date()
    })
  }),
  z.object({
    type: z.literal("ANSWER_SUBMITTED"),
    payload: z.object({
      responseId: z.string(),
      surveyId: z.string(),
      questionId: z.string(),
      answerId: z.string()
    })
  }),
  z.object({
    type: z.literal("RESPONSE_COMPLETED"),
    payload: z.object({
      responseId: z.string(),
      surveyId: z.string(),
      completedAt: z.date(),
      totalTimeMs: z.number()
    })
  }),
  z.object({
    type: z.literal("RESPONSE_FLAGGED"),
    payload: z.object({
      responseId: z.string(),
      surveyId: z.string(),
      fraudScore: z.number(),
      indicators: z.array(z.string())
    })
  }),
  z.object({
    type: z.literal("RESPONSE_ABANDONED"),
    payload: z.object({
      responseId: z.string(),
      surveyId: z.string(),
      lastQuestionId: z.string().nullable(),
      abandonedAt: z.date()
    })
  })
])

type ResponseEvent = z.infer<typeof ResponseEventSchema>


class ResponseEventEmitter extends EventEmitter {
  emit(event: ResponseEvent["type"], payload: ResponseEvent["payload"]): boolean {
    return super.emit(event, payload)
  }
  
  on(
    event: ResponseEvent["type"],
    listener: (payload: ResponseEvent["payload"]) => void
  ): this {
    return super.on(event, listener)
  }
}

const responseEvents = new ResponseEventEmitter()


function emitResponseStarted(
  responseId: string,
  surveyId: string
): void {
  responseEvents.emit("RESPONSE_STARTED", {
    responseId,
    surveyId,
    startedAt: new Date()
  })
}

function emitAnswerSubmitted(
  responseId: string,
  surveyId: string,
  questionId: string,
  answerId: string
): void {
  responseEvents.emit("ANSWER_SUBMITTED", {
    responseId,
    surveyId,
    questionId,
    answerId
  })
}

function emitResponseCompleted(
  responseId: string,
  surveyId: string,
  totalTimeMs: number
): void {
  responseEvents.emit("RESPONSE_COMPLETED", {
    responseId,
    surveyId,
    completedAt: new Date(),
    totalTimeMs
  })
}

function emitResponseFlagged(
  responseId: string,
  surveyId: string,
  fraudScore: number,
  indicators: string[]
): void {
  responseEvents.emit("RESPONSE_FLAGGED", {
    responseId,
    surveyId,
    fraudScore,
    indicators
  })
}

function emitResponseAbandoned(
  responseId: string,
  surveyId: string,
  lastQuestionId: string | null
): void {
  responseEvents.emit("RESPONSE_ABANDONED", {
    responseId,
    surveyId,
    lastQuestionId,
    abandonedAt: new Date()
  })
}

export {
  ResponseEventSchema,
  ResponseEventEmitter,
  responseEvents,
  emitResponseStarted,
  emitAnswerSubmitted,
  emitResponseCompleted,
  emitResponseFlagged,
  emitResponseAbandoned
}
export type {
  ResponseEvent
}
```


## 7.7.3 Real-time Aggregation Processor

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// REAL-TIME AGGREGATION PROCESSOR
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"
import { Redis } from "ioredis"


const QuestionAggregationSchema = z.object({
  questionId: z.string(),
  questionType: z.string(),
  totalResponses: z.number().int().min(0),
  lastUpdated: z.date(),
  data: z.union([
    z.object({
      type: z.literal("CHOICE"),
      optionCounts: z.record(z.string(), z.number())
    }),
    z.object({
      type: z.literal("SCALE"),
      average: z.number(),
      median: z.number(),
      distribution: z.record(z.string(), z.number())
    }),
    z.object({
      type: z.literal("TEXT"),
      responseCount: z.number(),
      averageLength: z.number()
    }),
    z.object({
      type: z.literal("RATING"),
      average: z.number(),
      distribution: z.array(z.number())
    })
  ])
})

type QuestionAggregation = z.infer<typeof QuestionAggregationSchema>


class RealTimeAggregator {
  private redis: Redis
  
  constructor(redis: Redis) {
    this.redis = redis
  }
  
  async processAnswer(
    surveyId: string,
    questionId: string,
    questionType: string,
    answer: unknown
  ): Promise<void> {
    const aggKey = `agg:realtime:${surveyId}:${questionId}`
    
    switch (questionType) {
      case "SINGLE_CHOICE":
      case "MULTIPLE_CHOICE":
      case "DROPDOWN":
        await this.updateChoiceAggregation(aggKey, answer)
        break
        
      case "LINEAR_SCALE":
      case "RATING":
        await this.updateScaleAggregation(aggKey, answer as number)
        break
        
      case "SHORT_TEXT":
      case "LONG_TEXT":
        await this.updateTextAggregation(aggKey, answer as string)
        break
        
      case "YES_NO":
        await this.updateYesNoAggregation(aggKey, answer as boolean)
        break
    }
    
    await this.redis.hincrby(aggKey, "totalResponses", 1)
    await this.redis.hset(aggKey, "lastUpdated", new Date().toISOString())
    await this.redis.expire(aggKey, 86400)
  }
  
  private async updateChoiceAggregation(
    key: string,
    answer: unknown
  ): Promise<void> {
    const options = Array.isArray(answer) ? answer : [answer]
    
    for (const option of options) {
      await this.redis.hincrby(key, `option:${String(option)}`, 1)
    }
  }
  
  private async updateScaleAggregation(
    key: string,
    value: number
  ): Promise<void> {
    await this.redis.hincrby(key, `scale:${value}`, 1)
    await this.redis.hincrbyfloat(key, "scaleSum", value)
  }
  
  private async updateTextAggregation(
    key: string,
    text: string
  ): Promise<void> {
    await this.redis.hincrby(key, "textCount", 1)
    await this.redis.hincrby(key, "textLengthSum", text.length)
  }
  
  private async updateYesNoAggregation(
    key: string,
    value: boolean
  ): Promise<void> {
    const field = value ? "yesCount" : "noCount"
    await this.redis.hincrby(key, field, 1)
  }
  
  async getAggregation(
    surveyId: string,
    questionId: string,
    questionType: string
  ): Promise<QuestionAggregation | null> {
    const aggKey = `agg:realtime:${surveyId}:${questionId}`
    const data = await this.redis.hgetall(aggKey)
    
    if (!data || Object.keys(data).length === 0) {
      return null
    }
    
    const totalResponses = parseInt(data.totalResponses ?? "0", 10)
    const lastUpdated = data.lastUpdated
      ? new Date(data.lastUpdated)
      : new Date()
    
    let aggregationData: QuestionAggregation["data"]
    
    switch (questionType) {
      case "SINGLE_CHOICE":
      case "MULTIPLE_CHOICE":
      case "DROPDOWN": {
        const optionCounts: Record<string, number> = {}
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith("option:")) {
            const optionId = key.replace("option:", "")
            optionCounts[optionId] = parseInt(value, 10)
          }
        }
        aggregationData = { type: "CHOICE", optionCounts }
        break
      }
      
      case "LINEAR_SCALE":
      case "RATING": {
        const sum = parseFloat(data.scaleSum ?? "0")
        const average = totalResponses > 0 ? sum / totalResponses : 0
        const distribution: Record<string, number> = {}
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith("scale:")) {
            const scaleValue = key.replace("scale:", "")
            distribution[scaleValue] = parseInt(value, 10)
          }
        }
        aggregationData = {
          type: "SCALE",
          average,
          median: this.calculateMedian(distribution),
          distribution
        }
        break
      }
      
      case "SHORT_TEXT":
      case "LONG_TEXT": {
        const textCount = parseInt(data.textCount ?? "0", 10)
        const lengthSum = parseInt(data.textLengthSum ?? "0", 10)
        aggregationData = {
          type: "TEXT",
          responseCount: textCount,
          averageLength: textCount > 0 ? lengthSum / textCount : 0
        }
        break
      }
      
      default:
        return null
    }
    
    return {
      questionId,
      questionType,
      totalResponses,
      lastUpdated,
      data: aggregationData
    }
  }
  
  private calculateMedian(distribution: Record<string, number>): number {
    const values: number[] = []
    for (const [value, count] of Object.entries(distribution)) {
      for (let i = 0; i < count; i++) {
        values.push(parseInt(value, 10))
      }
    }
    
    if (values.length === 0) return 0
    
    values.sort((a, b) => a - b)
    const mid = Math.floor(values.length / 2)
    
    return values.length % 2 === 0
      ? (values[mid - 1] + values[mid]) / 2
      : values[mid]
  }
}

export {
  QuestionAggregationSchema,
  RealTimeAggregator
}
export type {
  QuestionAggregation
}
```




---

# 7.8 Response API Endpoints

## 7.8.1 API Endpoint Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RESPONSE API ENDPOINTS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PUBLIC ENDPOINTS (No Authentication Required)                      │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  POST /api/v1/responses/start                                       │   │
│  │       Initialize a new response session                             │   │
│  │                                                                     │   │
│  │  POST /api/v1/responses/{responseId}/answers                        │   │
│  │       Submit an answer to a question                                │   │
│  │                                                                     │   │
│  │  POST /api/v1/responses/{responseId}/complete                       │   │
│  │       Complete and submit the response                              │   │
│  │                                                                     │   │
│  │  GET  /api/v1/responses/{responseId}/resume                         │   │
│  │       Resume an incomplete response                                 │   │
│  │                                                                     │   │
│  │  POST /api/v1/responses/{responseId}/save-draft                     │   │
│  │       Save current progress as draft                                │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AUTHENTICATED ENDPOINTS (User or Organization Auth Required)       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  GET  /api/v1/surveys/{surveyId}/responses                          │   │
│  │       List all responses for a survey                               │   │
│  │                                                                     │   │
│  │  GET  /api/v1/surveys/{surveyId}/responses/{responseId}             │   │
│  │       Get detailed response data                                    │   │
│  │                                                                     │   │
│  │  DELETE /api/v1/surveys/{surveyId}/responses/{responseId}           │   │
│  │       Delete a response (admin only)                                │   │
│  │                                                                     │   │
│  │  GET  /api/v1/surveys/{surveyId}/responses/export                   │   │
│  │       Export responses in CSV/JSON format                           │   │
│  │                                                                     │   │
│  │  GET  /api/v1/surveys/{surveyId}/aggregations                       │   │
│  │       Get real-time response aggregations                           │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 7.8.2 Response API Server Actions

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE API SERVER ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

"use server"

import { z } from "zod"


const StartResponseInputSchema = z.object({
  surveyId: z.string().cuid(),
  deviceFingerprint: z.string().min(32).max(128),
  metadata: z.object({
    userAgent: z.string().max(500),
    referrer: z.string().url().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional()
  }).optional()
})

const StartResponseResultSchema = z.object({
  success: z.boolean(),
  sessionId: z.string().cuid().optional(),
  responseId: z.string().cuid().optional(),
  isResumed: z.boolean().optional(),
  currentQuestionIndex: z.number().int().min(0).optional(),
  error: z.string().optional()
})

type StartResponseInput = z.infer<typeof StartResponseInputSchema>
type StartResponseResult = z.infer<typeof StartResponseResultSchema>


async function startResponseAction(
  input: StartResponseInput
): Promise<StartResponseResult> {
  try {
    const validated = StartResponseInputSchema.parse(input)
    
    const rateLimitResult = await checkRateLimit(
      "RESPONSE_SUBMISSION",
      validated.deviceFingerprint
    )
    
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later."
      }
    }
    
    const session = await initializeResponseSession({
      surveyId: validated.surveyId,
      deviceFingerprint: validated.deviceFingerprint,
      userAgent: validated.metadata?.userAgent ?? "Unknown",
      ipAddress: "0.0.0.0",
      referrer: validated.metadata?.referrer,
      utmParams: validated.metadata ? {
        source: validated.metadata.utmSource,
        medium: validated.metadata.utmMedium,
        campaign: validated.metadata.utmCampaign
      } : undefined
    })
    
    return {
      success: true,
      sessionId: session.sessionId,
      responseId: session.responseId ?? undefined,
      isResumed: session.isResumed,
      currentQuestionIndex: session.currentQuestionIndex
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return {
      success: false,
      error: errorMessage
    }
  }
}


const SubmitAnswerActionInputSchema = z.object({
  sessionId: z.string().cuid(),
  responseId: z.string().cuid().nullable(),
  questionId: z.string().cuid(),
  answer: z.unknown(),
  timeSpentMs: z.number().int().min(0).max(3600000)
})

type SubmitAnswerActionInput = z.infer<typeof SubmitAnswerActionInputSchema>


async function submitAnswerAction(
  input: SubmitAnswerActionInput
): Promise<SubmitAnswerResult> {
  try {
    const validated = SubmitAnswerActionInputSchema.parse(input)
    
    const result = await submitAnswer({
      sessionId: validated.sessionId,
      responseId: validated.responseId,
      questionId: validated.questionId,
      answer: validated.answer,
      timeSpentMs: validated.timeSpentMs
    })
    
    if (result.success) {
      emitAnswerSubmitted(
        result.responseId,
        validated.sessionId,
        validated.questionId,
        result.answerId
      )
    }
    
    return result
  } catch (error) {
    return {
      success: false,
      responseId: "",
      answerId: "",
      nextQuestionId: null,
      isComplete: false,
      validationErrors: [{
        field: "general",
        message: error instanceof Error ? error.message : "Unknown error"
      }]
    }
  }
}


const CompleteResponseActionInputSchema = z.object({
  sessionId: z.string().cuid(),
  responseId: z.string().cuid(),
  clientChecksum: z.string().length(64)
})

type CompleteResponseActionInput = z.infer<typeof CompleteResponseActionInputSchema>


async function completeResponseAction(
  input: CompleteResponseActionInput
): Promise<CompleteResponseResult> {
  try {
    const validated = CompleteResponseActionInputSchema.parse(input)
    
    const result = await completeResponse({
      sessionId: validated.sessionId,
      responseId: validated.responseId,
      clientChecksum: validated.clientChecksum
    })
    
    if (result.success && !result.isFlagged) {
      emitResponseCompleted(
        result.responseId,
        validated.sessionId,
        0
      )
    } else if (result.isFlagged) {
      emitResponseFlagged(
        result.responseId,
        validated.sessionId,
        result.fraudScore,
        []
      )
    }
    
    return result
  } catch (error) {
    return {
      success: false,
      responseId: "",
      completedAt: new Date(),
      confirmationCode: "",
      fraudScore: 0,
      isFlagged: false,
      message: error instanceof Error ? error.message : "Unknown error"
    }
  }
}


const SaveDraftActionInputSchema = z.object({
  sessionId: z.string().cuid(),
  responseId: z.string().cuid(),
  email: z.string().email().optional()
})

const SaveDraftResultSchema = z.object({
  success: z.boolean(),
  resumeToken: z.string().optional(),
  expiresAt: z.date().optional(),
  error: z.string().optional()
})

type SaveDraftActionInput = z.infer<typeof SaveDraftActionInputSchema>
type SaveDraftResult = z.infer<typeof SaveDraftResultSchema>


async function saveDraftAction(
  input: SaveDraftActionInput
): Promise<SaveDraftResult> {
  try {
    const validated = SaveDraftActionInputSchema.parse(input)
    
    const resumeToken = generateResumeToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    
    await db.update(responses)
      .set({
        status: "PAUSED",
        resumeToken,
        expiresAt
      })
      .where(eq(responses.id, validated.responseId))
    
    if (validated.email) {
      await queueResumeEmail(validated.email, resumeToken)
    }
    
    return {
      success: true,
      resumeToken,
      expiresAt
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

function generateResumeToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let token = ""
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

async function queueResumeEmail(email: string, token: string): Promise<void> {
  console.log(`Queuing resume email to ${email} with token ${token}`)
}

async function checkRateLimit(
  type: string,
  identifier: string
): Promise<{ allowed: boolean }> {
  return { allowed: true }
}

export {
  StartResponseInputSchema,
  StartResponseResultSchema,
  SubmitAnswerActionInputSchema,
  CompleteResponseActionInputSchema,
  SaveDraftActionInputSchema,
  SaveDraftResultSchema,
  startResponseAction,
  submitAnswerAction,
  completeResponseAction,
  saveDraftAction
}
export type {
  StartResponseInput,
  StartResponseResult,
  SubmitAnswerActionInput,
  CompleteResponseActionInput,
  SaveDraftActionInput,
  SaveDraftResult
}
```


## 7.8.3 Response Query Endpoints

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE QUERY ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

"use server"

import { z } from "zod"


const ListResponsesQuerySchema = z.object({
  surveyId: z.string().cuid(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  status: z.enum(["ALL", "COMPLETED", "IN_PROGRESS", "FLAGGED"]).default("ALL"),
  sortBy: z.enum(["completedAt", "startedAt", "fraudScore"]).default("completedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().max(100).optional()
})

const ResponseListItemSchema = z.object({
  id: z.string(),
  status: z.string(),
  startedAt: z.date(),
  completedAt: z.date().nullable(),
  totalTimeMs: z.number().nullable(),
  fraudScore: z.number().nullable(),
  confirmationCode: z.string().nullable(),
  answerCount: z.number()
})

const ListResponsesResultSchema = z.object({
  responses: z.array(ResponseListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number()
})

type ListResponsesQuery = z.infer<typeof ListResponsesQuerySchema>
type ResponseListItem = z.infer<typeof ResponseListItemSchema>
type ListResponsesResult = z.infer<typeof ListResponsesResultSchema>


async function listResponsesAction(
  query: ListResponsesQuery,
  userId: string
): Promise<ListResponsesResult> {
  const validated = ListResponsesQuerySchema.parse(query)
  
  const hasAccess = await checkSurveyAccess(validated.surveyId, userId)
  if (!hasAccess) {
    throw new Error("ACCESS_DENIED")
  }
  
  const whereClause: Record<string, unknown> = {
    surveyId: validated.surveyId
  }
  
  if (validated.status !== "ALL") {
    whereClause.status = validated.status === "FLAGGED"
      ? "FRAUD_FLAGGED"
      : validated.status
  }
  
  const whereConditions = [eq(responses.surveyId, validated.surveyId)]
  if (validated.status !== "ALL") {
    whereConditions.push(eq(responses.status, validated.status === "FLAGGED" ? "FRAUD_FLAGGED" : validated.status))
  }

  const [responseList, [{ count: total }]] = await Promise.all([
    db.select({
      id: responses.id,
      status: responses.status,
      startedAt: responses.startedAt,
      completedAt: responses.completedAt,
      totalTimeMs: responses.totalTimeMs,
      fraudScore: responses.fraudScore,
      confirmationCode: responses.confirmationCode
    })
      .from(responses)
      .where(and(...whereConditions))
      .orderBy(validated.sortOrder === "desc" ? desc(responses[validated.sortBy]) : asc(responses[validated.sortBy]))
      .offset((validated.page - 1) * validated.pageSize)
      .limit(validated.pageSize),
    db.select({ count: sql<number>`count(*)` })
      .from(responses)
      .where(and(...whereConditions))
  ])
  
  return {
    responses: responses.map(r => ({
      id: r.id,
      status: r.status,
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      totalTimeMs: r.totalTimeMs,
      fraudScore: r.fraudScore,
      confirmationCode: r.confirmationCode,
      answerCount: r._count.answers
    })),
    total,
    page: validated.page,
    pageSize: validated.pageSize,
    totalPages: Math.ceil(total / validated.pageSize)
  }
}


const GetResponseDetailQuerySchema = z.object({
  surveyId: z.string().cuid(),
  responseId: z.string().cuid()
})

const ResponseDetailSchema = z.object({
  id: z.string(),
  status: z.string(),
  startedAt: z.date(),
  completedAt: z.date().nullable(),
  totalTimeMs: z.number().nullable(),
  fraudScore: z.number().nullable(),
  confirmationCode: z.string().nullable(),
  answers: z.array(z.object({
    id: z.string(),
    questionId: z.string(),
    questionText: z.string(),
    questionType: z.string(),
    value: z.unknown(),
    timeSpentMs: z.number().nullable()
  }))
})

type GetResponseDetailQuery = z.infer<typeof GetResponseDetailQuerySchema>
type ResponseDetail = z.infer<typeof ResponseDetailSchema>


async function getResponseDetailAction(
  query: GetResponseDetailQuery,
  userId: string
): Promise<ResponseDetail> {
  const validated = GetResponseDetailQuerySchema.parse(query)
  
  const hasAccess = await checkSurveyAccess(validated.surveyId, userId)
  if (!hasAccess) {
    throw new Error("ACCESS_DENIED")
  }
  
  const [response] = await db.select()
    .from(responses)
    .where(eq(responses.id, validated.responseId))

  const responseAnswersWithQuestions = await db.select({
    id: answers.id,
    questionId: answers.questionId,
    value: answers.value,
    timeSpentMs: answers.timeSpentMs,
    questionText: questions.text,
    questionType: questions.type
  })
    .from(answers)
    .innerJoin(questions, eq(answers.questionId, questions.id))
    .where(eq(answers.responseId, validated.responseId))
  
  if (!response || response.surveyId !== validated.surveyId) {
    throw new Error("RESPONSE_NOT_FOUND")
  }
  
  return {
    id: response.id,
    status: response.status,
    startedAt: response.startedAt,
    completedAt: response.completedAt,
    totalTimeMs: response.totalTimeMs,
    fraudScore: response.fraudScore,
    confirmationCode: response.confirmationCode,
    answers: response.answers.map(a => ({
      id: a.id,
      questionId: a.questionId,
      questionText: a.question.text,
      questionType: a.question.type,
      value: a.value,
      timeSpentMs: a.timeSpentMs
    }))
  }
}

async function checkSurveyAccess(surveyId: string, userId: string): Promise<boolean> {
  const [survey] = await db.select({
    creatorId: surveys.creatorId,
    organizationId: surveys.organizationId
  })
    .from(surveys)
    .where(eq(surveys.id, surveyId))

  if (!survey) return false
  if (survey.creatorId === userId) return true

  if (survey.organizationId) {
    const [membership] = await db.select()
      .from(organizationMemberships)
      .where(and(
        eq(organizationMemberships.organizationId, survey.organizationId),
        eq(organizationMemberships.userId, userId),
        inArray(organizationMemberships.role, ["OWNER", "ADMIN", "ANALYST"])
      ))
    return membership !== undefined
  }

  return false
}

export {
  ListResponsesQuerySchema,
  ResponseListItemSchema,
  ListResponsesResultSchema,
  GetResponseDetailQuerySchema,
  ResponseDetailSchema,
  listResponsesAction,
  getResponseDetailAction,
  checkSurveyAccess
}
export type {
  ListResponsesQuery,
  ResponseListItem,
  ListResponsesResult,
  GetResponseDetailQuery,
  ResponseDetail
}
```




---

# 7.9 Response Data Models

## 7.9.1 Drizzle Response Models

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DRIZZLE RESPONSE MODELS
// ══════════════════════════════════════════════════════════════════════════════

/*
model Response {
  id                  String          @id @default(cuid())
  surveyId            String
  userId              String?
  
  anonymousToken      String?         @db.VarChar(64)
  deviceFingerprint   String          @db.VarChar(64)
  
  status              ResponseStatus  @default(IN_PROGRESS)
  
  startedAt           DateTime        @default(now())
  completedAt         DateTime?
  expiresAt           DateTime?
  
  lastQuestionIndex   Int             @default(0)
  answeredQuestionIds String[]        @default([])
  
  totalTimeMs         Int?
  fraudScore          Int?            @db.SmallInt
  confirmationCode    String?         @db.VarChar(10)
  resumeToken         String?         @db.VarChar(24)
  
  metadata            Json            @default("{}")
  
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  
  survey              Survey          @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  user                User?           @relation(fields: [userId], references: [id], onDelete: SetNull)
  answers             Answer[]
  
  @@unique([surveyId, anonymousToken])
  @@index([surveyId, status])
  @@index([surveyId, completedAt])
  @@index([deviceFingerprint])
  @@index([userId])
  @@index([resumeToken])
  @@index([createdAt])
}

// ResponseStatus enum - AUTHORITATIVE DEFINITION in BIBLE-013.md
enum ResponseStatus {
  SCREENING         // In pre-qualification
  IN_PROGRESS       // Currently answering
  PAUSED            // Can resume within session
  SUBMITTED         // Awaiting validation
  VALIDATED         // Passed quality checks
  COMPLETED         // Successfully finished
  ABANDONED         // User left
  DISQUALIFIED      // Failed quality checks (includes INVALID, FRAUD_FLAGGED)
  TIMEOUT           // Session expired
  QUOTA_FULL        // Survey quota reached
}
*/
```


## 7.9.2 Drizzle Answer Models

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DRIZZLE ANSWER MODELS
// ══════════════════════════════════════════════════════════════════════════════

/*
model Answer {
  id              String      @id @default(cuid())
  responseId      String
  questionId      String
  
  value           Json
  
  timeSpentMs     Int?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  response        Response    @relation(fields: [responseId], references: [id], onDelete: Cascade)
  question        Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@unique([responseId, questionId])
  @@index([responseId])
  @@index([questionId])
  @@index([createdAt])
}

model AnswerHistory {
  id              String      @id @default(cuid())
  answerId        String
  
  previousValue   Json
  newValue        Json
  
  changedAt       DateTime    @default(now())
  
  @@index([answerId])
  @@index([changedAt])
}
*/
```


## 7.9.3 Drizzle Semi-Anonymous Participation Model

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DRIZZLE SEMI-ANONYMOUS PARTICIPATION MODEL
// ══════════════════════════════════════════════════════════════════════════════

/*
model SemiAnonymousParticipation {
  id              String      @id @default(cuid())
  surveyId        String
  organizationId  String
  
  blindedToken    String      @db.VarChar(64)
  
  participatedAt  DateTime    @default(now())
  
  survey          Survey      @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@unique([surveyId, blindedToken])
  @@index([surveyId, organizationId])
  @@index([participatedAt])
}
*/
```


## 7.9.4 TypeScript Response Types

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TYPESCRIPT RESPONSE TYPES
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"


// ResponseStatus - AUTHORITATIVE DEFINITION in BIBLE-013.md
const ResponseStatusSchema = z.enum([
  "SCREENING",      // In pre-qualification/screening questions
  "IN_PROGRESS",    // Currently answering
  "PAUSED",         // User paused, can resume within session
  "SUBMITTED",      // Answers submitted, awaiting quality validation
  "VALIDATED",      // Passed quality checks
  "COMPLETED",      // Successfully finished
  "ABANDONED",      // User left without completing
  "DISQUALIFIED",   // Failed quality/fraud checks (includes INVALID, FRAUD_FLAGGED cases)
  "TIMEOUT",        // Session expired
  "QUOTA_FULL"      // Survey quota reached, response not needed
])

const ResponseMetadataSchema = z.object({
  userAgent: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  device: z.string().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  ipCountry: z.string().optional(),
  ipRegion: z.string().optional(),
  language: z.string().optional()
})

const ResponseSchema = z.object({
  id: z.string().cuid(),
  surveyId: z.string().cuid(),
  userId: z.string().cuid().nullable(),
  anonymousToken: z.string().max(64).nullable(),
  deviceFingerprint: z.string().max(64),
  status: ResponseStatusSchema,
  startedAt: z.date(),
  completedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
  lastQuestionIndex: z.number().int().min(0),
  answeredQuestionIds: z.array(z.string()),
  totalTimeMs: z.number().int().nullable(),
  fraudScore: z.number().int().min(0).max(100).nullable(),
  confirmationCode: z.string().max(10).nullable(),
  resumeToken: z.string().max(24).nullable(),
  metadata: ResponseMetadataSchema,
  createdAt: z.date(),
  updatedAt: z.date()
})

const AnswerValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  z.object({
    fileId: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    fileType: z.string()
  }),
  z.object({
    rows: z.array(z.record(z.string(), z.string()))
  })
])

const AnswerSchema = z.object({
  id: z.string().cuid(),
  responseId: z.string().cuid(),
  questionId: z.string().cuid(),
  value: AnswerValueSchema,
  timeSpentMs: z.number().int().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

type ResponseStatus = z.infer<typeof ResponseStatusSchema>
type ResponseMetadata = z.infer<typeof ResponseMetadataSchema>
type Response = z.infer<typeof ResponseSchema>
type Answer = z.infer<typeof AnswerSchema>

export {
  ResponseStatusSchema,
  ResponseMetadataSchema,
  ResponseSchema,
  AnswerValueSchema,
  AnswerSchema
}
export type {
  ResponseStatus,
  ResponseMetadata,
  Response,
  Answer
}
```




# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 07
# ══════════════════════════════════════════════════════════════════════════════