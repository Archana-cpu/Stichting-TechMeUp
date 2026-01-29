// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PRE-TEST SCREENING SERVICE
// Bible: P-007, P-014, P-030, P-108
// ═══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, sql, desc } from '@voxpoll/database'
import { polls, pretestAttempts } from '@voxpoll/database'
import { ApiError } from '../middleware/error-handler'
import { ERROR_CODES } from '../constants/messages'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PretestQuestion {
  id: string
  question: string
  options: PretestOption[]
  correctOptionId: string
}

export interface PretestOption {
  id: string
  text: string
}

export interface PretestConfig {
  enabled: boolean
  questions: PretestQuestion[]
  passingThreshold: number
  maxAttempts: number
}

export interface PretestAnswer {
  questionId: string
  selectedOptionId: string
  timeSpentMs: number
}

export interface PretestAttemptResult {
  passed: boolean
  score: number
  attemptNumber: number
  attemptsRemaining: number
  cooldownUntil: Date | null
  message: string
}

export interface PretestStatus {
  hasAttempted: boolean
  passed: boolean
  attemptCount: number
  attemptsRemaining: number
  canAttempt: boolean
  cooldownUntil: Date | null
  nextAttemptAt: Date | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants (Bible: P-007, P-030)
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
  minQuestions: 1,
  maxQuestions: 5,
  minThreshold: 50,
  maxThreshold: 100,
  defaultThreshold: 60,
  maxAttempts: 3,
  minTimePerQuestionMs: 2000,

  cooldowns: {
    1: 60,
    2: 120,
    3: 1440,
  } as Record<number, number>,
}

const MESSAGES = {
  passed: 'Ön test başarılı. Ankete katılabilirsiniz.',
  failed: 'Bu anket için belirlenen kriterleri karşılamıyorsunuz. Katılımınız için teşekkür ederiz.',
  maxAttemptsReached: 'Bu anket için maksimum deneme sayısına ulaştınız.',
  cooldownActive: 'Yeniden denemek için lütfen bekleyin.',
  tooFast: 'Yanıtlarınız beklenenden hızlı değerlendirildi.',
  premiumRequired: 'Pre-test özelliği Premium üyelik gerektirir.',
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j] as T
    shuffled[j] = temp as T
  }
  return shuffled
}

function calculateCooldownMinutes(attemptNumber: number): number {
  return CONFIG.cooldowns[attemptNumber] ?? CONFIG.cooldowns[3] ?? 1440
}

function isInCooldown(lastAttemptAt: Date, cooldownMinutes: number): boolean {
  const cooldownEndsAt = new Date(lastAttemptAt.getTime() + cooldownMinutes * 60 * 1000)
  return new Date() < cooldownEndsAt
}

function getCooldownEndTime(lastAttemptAt: Date, cooldownMinutes: number): Date {
  return new Date(lastAttemptAt.getTime() + cooldownMinutes * 60 * 1000)
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-test Service Class
// ─────────────────────────────────────────────────────────────────────────────

class PretestServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Get Pre-test Questions (shuffled for anti-gaming)
  // ─────────────────────────────────────────────────────────────────────────────

  async getQuestions(pollId: string, userId: string): Promise<{
    questions: Array<{ id: string; question: string; options: PretestOption[] }>
    config: { totalQuestions: number; passingThreshold: number }
  }> {
    const status = await this.getStatus(pollId, userId)

    if (!status.canAttempt) {
      if (status.passed) {
        throw ApiError.badRequest(
          'Ön testi zaten geçtiniz.',
          'PRETEST_ALREADY_PASSED'
        )
      }
      if (status.attemptsRemaining <= 0) {
        throw ApiError.badRequest(
          MESSAGES.maxAttemptsReached,
          ERROR_CODES.PRETEST_MAX_ATTEMPTS
        )
      }
      if (status.cooldownUntil) {
        throw ApiError.badRequest(
          MESSAGES.cooldownActive,
          'PRETEST_COOLDOWN',
        )
      }
    }

    const poll = await this.getPollWithPretest(pollId)

    if (!poll.hasPreTest || !poll.preTestQuestions || (poll.preTestQuestions as PretestQuestion[]).length === 0) {
      throw ApiError.badRequest(
        'Bu anket için ön test yapılandırılmamış.',
        'PRETEST_NOT_CONFIGURED'
      )
    }

    const questions = poll.preTestQuestions as PretestQuestion[]
    const passingScore = poll.preTestPassingScore ?? CONFIG.defaultThreshold

    const shuffledQuestions = shuffleArray(questions).map(q => ({
      id: q.id,
      question: q.question,
      options: shuffleArray(q.options),
    }))

    return {
      questions: shuffledQuestions,
      config: {
        totalQuestions: questions.length,
        passingThreshold: passingScore,
      },
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Submit Pre-test Answers
  // ─────────────────────────────────────────────────────────────────────────────

  async submitAnswers(
    pollId: string,
    userId: string,
    deviceCategory: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN' | null,
    answers: PretestAnswer[]
  ): Promise<PretestAttemptResult> {
    const status = await this.getStatus(pollId, userId)

    if (status.passed) {
      return {
        passed: true,
        score: 100,
        attemptNumber: status.attemptCount,
        attemptsRemaining: 0,
        cooldownUntil: null,
        message: MESSAGES.passed,
      }
    }

    if (!status.canAttempt) {
      if (status.attemptsRemaining <= 0) {
        throw ApiError.badRequest(
          MESSAGES.maxAttemptsReached,
          ERROR_CODES.PRETEST_MAX_ATTEMPTS
        )
      }
      throw ApiError.badRequest(
        MESSAGES.cooldownActive,
        'PRETEST_COOLDOWN'
      )
    }

    const poll = await this.getPollWithPretest(pollId)
    const questions = poll.preTestQuestions as PretestQuestion[]
    const passingScore = poll.preTestPassingScore ?? CONFIG.defaultThreshold

    const tooFastAnswers = answers.filter(a => a.timeSpentMs < CONFIG.minTimePerQuestionMs)
    if (tooFastAnswers.length > 0) {
      throw ApiError.badRequest(
        MESSAGES.tooFast,
        'PRETEST_TOO_FAST'
      )
    }

    let correctCount = 0
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId)
      if (question && question.correctOptionId === answer.selectedOptionId) {
        correctCount++
      }
    }

    const score = Math.round((correctCount / questions.length) * 100)
    const passed = score >= passingScore
    const attemptNumber = status.attemptCount + 1
    const attemptsRemaining = CONFIG.maxAttempts - attemptNumber

    await db.insert(pretestAttempts).values({
      pollId,
      participantId: userId,
      deviceCategory,
      attemptNumber,
      score,
      passed,
      answersJson: answers,
    })

    let cooldownUntil: Date | null = null
    let message: string

    if (passed) {
      message = MESSAGES.passed
    } else if (attemptsRemaining <= 0) {
      const cooldownMinutes = calculateCooldownMinutes(attemptNumber)
      cooldownUntil = getCooldownEndTime(new Date(), cooldownMinutes)
      message = MESSAGES.maxAttemptsReached
    } else {
      const cooldownMinutes = calculateCooldownMinutes(attemptNumber)
      cooldownUntil = getCooldownEndTime(new Date(), cooldownMinutes)
      message = MESSAGES.failed
    }

    return {
      passed,
      score,
      attemptNumber,
      attemptsRemaining: Math.max(0, attemptsRemaining),
      cooldownUntil,
      message,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Pre-test Status for User
  // ─────────────────────────────────────────────────────────────────────────────

  async getStatus(pollId: string, userId: string): Promise<PretestStatus> {
    const attempts = await db
      .select()
      .from(pretestAttempts)
      .where(
        and(
          eq(pretestAttempts.pollId, pollId),
          eq(pretestAttempts.participantId, userId)
        )
      )
      .orderBy(desc(pretestAttempts.createdAt))

    if (attempts.length === 0) {
      return {
        hasAttempted: false,
        passed: false,
        attemptCount: 0,
        attemptsRemaining: CONFIG.maxAttempts,
        canAttempt: true,
        cooldownUntil: null,
        nextAttemptAt: null,
      }
    }

    const latestAttempt = attempts[0]!
    const attemptCount = attempts.length
    const passed = attempts.some(a => a.passed)

    if (passed) {
      return {
        hasAttempted: true,
        passed: true,
        attemptCount,
        attemptsRemaining: 0,
        canAttempt: false,
        cooldownUntil: null,
        nextAttemptAt: null,
      }
    }

    const attemptsRemaining = CONFIG.maxAttempts - attemptCount
    const cooldownMinutes = calculateCooldownMinutes(attemptCount)
    const lastAttemptAt = latestAttempt.createdAt as Date

    if (attemptsRemaining <= 0) {
      return {
        hasAttempted: true,
        passed: false,
        attemptCount,
        attemptsRemaining: 0,
        canAttempt: false,
        cooldownUntil: getCooldownEndTime(lastAttemptAt, cooldownMinutes),
        nextAttemptAt: null,
      }
    }

    const inCooldown = isInCooldown(lastAttemptAt, cooldownMinutes)
    const cooldownEndTime = getCooldownEndTime(lastAttemptAt, cooldownMinutes)

    return {
      hasAttempted: true,
      passed: false,
      attemptCount,
      attemptsRemaining,
      canAttempt: !inCooldown,
      cooldownUntil: inCooldown ? cooldownEndTime : null,
      nextAttemptAt: inCooldown ? cooldownEndTime : null,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Validate Pre-test Questions
  // ─────────────────────────────────────────────────────────────────────────────

  validateQuestions(questions: PretestQuestion[]): void {
    if (questions.length < CONFIG.minQuestions || questions.length > CONFIG.maxQuestions) {
      throw ApiError.badRequest(
        `Ön test ${CONFIG.minQuestions}-${CONFIG.maxQuestions} soru içermelidir.`,
        'INVALID_PRETEST_QUESTION_COUNT'
      )
    }

    for (const q of questions) {
      if (!q.question || q.question.trim().length === 0) {
        throw ApiError.badRequest(
          'Tüm sorular metin içermelidir.',
          'INVALID_PRETEST_QUESTION'
        )
      }
      if (!q.options || q.options.length < 2) {
        throw ApiError.badRequest(
          'Her soru en az 2 seçenek içermelidir.',
          'INVALID_PRETEST_OPTIONS'
        )
      }
      if (!q.correctOptionId || !q.options.some(o => o.id === q.correctOptionId)) {
        throw ApiError.badRequest(
          'Her soru için geçerli bir doğru cevap belirtilmelidir.',
          'INVALID_PRETEST_CORRECT_ANSWER'
        )
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Validate Pre-test Passing Score
  // ─────────────────────────────────────────────────────────────────────────────

  validatePassingScore(score: number): void {
    if (score < CONFIG.minThreshold || score > CONFIG.maxThreshold) {
      throw ApiError.badRequest(
        `Geçme eşiği ${CONFIG.minThreshold}-${CONFIG.maxThreshold} arasında olmalıdır.`,
        'INVALID_PRETEST_THRESHOLD'
      )
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Check if User Can Participate (passed pretest or no pretest required)
  // ─────────────────────────────────────────────────────────────────────────────

  async canParticipate(pollId: string, userId: string): Promise<{
    canParticipate: boolean
    reason?: string
  }> {
    const poll = await this.getPollWithPretest(pollId)

    if (!poll.hasPreTest || !poll.preTestQuestions || (poll.preTestQuestions as PretestQuestion[]).length === 0) {
      return { canParticipate: true }
    }

    const status = await this.getStatus(pollId, userId)

    if (status.passed) {
      return { canParticipate: true }
    }

    if (status.attemptsRemaining <= 0) {
      return {
        canParticipate: false,
        reason: MESSAGES.maxAttemptsReached,
      }
    }

    return {
      canParticipate: false,
      reason: 'Ankete katılmak için önce ön testi geçmelisiniz.',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private: Get Poll with Pretest Config
  // ─────────────────────────────────────────────────────────────────────────────

  private async getPollWithPretest(pollId: string) {
    const [poll] = await db
      .select({
        id: polls.id,
        hasPreTest: polls.hasPreTest,
        preTestQuestions: polls.preTestQuestions,
        preTestPassingScore: polls.preTestPassingScore,
      })
      .from(polls)
      .where(eq(polls.id, pollId))
      .limit(1)

    if (!poll) {
      throw ApiError.notFound('Anket bulunamadı.', 'POLL_NOT_FOUND')
    }

    return poll
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const pretestService = new PretestServiceClass()
export { PretestServiceClass as PretestService }
