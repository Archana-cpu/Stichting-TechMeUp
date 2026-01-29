// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - FRAUD DETECTION SERVICE
// Two-phase fraud detection system per bible-031 specification
// Phase 1: Real-time pre-action checks (synchronous, <50ms)
// Phase 2: Post-action deep analysis (asynchronous, background)
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq } from '@voxpoll/database'
import { ipReputations, pollResponses, surveyResponses, moderationQueue, fraudDetectionLogs } from '@voxpoll/database'
import { getRedis } from '../lib/redis'
import { algorithmService } from './algorithm.service'
import { generateFraudDetectionHash } from '../lib/hash'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type FraudAction = 'VOTE' | 'COMMENT' | 'REGISTER' | 'LOGIN' | 'CREATE_POLL'

export type FraudDecision = 'ALLOW' | 'SOFT_REJECT' | 'HARD_REJECT' | 'REVIEW'

export interface FraudMetadata {
  ip?: string
  userAgent?: string
  deviceFingerprint?: string
  contentId?: string
  contentType?: string
}

export interface FraudCheckResult {
  decision: FraudDecision
  score: number // 0-100, higher = more suspicious
  reasons: string[]
  requiresManualReview: boolean
}

export interface Phase2AnalysisResult {
  fraudScore: number
  qualityScore: number
  riskFactors: string[]
  shouldInvalidate: boolean
  shouldFlag: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const THRESHOLDS = {
  // Phase 1 thresholds
  autoReject: 80,      // Score >= 80: Hard reject
  softReject: 60,      // Score 60-79: Soft reject (captcha, etc.)
  review: 40,          // Score 40-59: Allow but flag for review
  // Phase 2 thresholds
  invalidate: 70,      // Auto-invalidate responses
  flag: 50,            // Flag for moderation
}

const VELOCITY_LIMITS = {
  VOTE: { count: 30, windowMs: 60000 },       // 30 votes per minute
  COMMENT: { count: 10, windowMs: 60000 },    // 10 comments per minute
  REGISTER: { count: 3, windowMs: 3600000 },  // 3 registrations per hour
  LOGIN: { count: 10, windowMs: 900000 },     // 10 logins per 15 minutes
  CREATE_POLL: { count: 5, windowMs: 3600000 }, // 5 polls per hour
}

// ─────────────────────────────────────────────────────────────────────────────
// Fraud Service Class
// ─────────────────────────────────────────────────────────────────────────────

class FraudServiceClass {
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: REAL-TIME PRE-ACTION CHECKS (Synchronous, <50ms target)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Quick pre-action fraud check
   * Run this BEFORE allowing an action
   */
  async preActionCheck(
    userId: string | null,
    action: FraudAction,
    metadata: FraudMetadata
  ): Promise<FraudCheckResult> {
    const reasons: string[] = []
    let score = 0

    const redis = getRedis()
    const identifier = userId || metadata.ip || metadata.deviceFingerprint || 'unknown'

    // 1. Check IP blocklist (fast Redis lookup)
    if (metadata.ip) {
      const isBlocked = await redis.sismember('fraud:ip:blocklist', metadata.ip)
      if (isBlocked) {
        score += 100
        reasons.push('IP is blocklisted')
      }
    }

    // 2. Check device blocklist
    if (metadata.deviceFingerprint) {
      const isBlocked = await redis.sismember('fraud:device:blocklist', metadata.deviceFingerprint)
      if (isBlocked) {
        score += 100
        reasons.push('Device is blocklisted')
      }
    }

    // 3. Check velocity (action rate limiting)
    const velocityScore = await this.checkVelocity(identifier, action)
    score += velocityScore
    if (velocityScore > 0) {
      reasons.push(`High action velocity (${velocityScore} points)`)
    }

    // 4. Check user trust score (if authenticated)
    if (userId) {
      const trustResult = await algorithmService.calculateUserTrustScore(userId)
      if (trustResult.score < 25) {
        score += 30
        reasons.push('Low user trust score')
      } else if (trustResult.level === 'untrusted') {
        score += 50
        reasons.push('User marked as untrusted')
      }
    } else {
      // Anonymous users get a base penalty
      score += 10
      reasons.push('Anonymous user')
    }

    // 5. Check IP reputation (cached)
    if (metadata.ip) {
      const ipScore = await this.checkIPReputation(metadata.ip)
      score += ipScore
      if (ipScore > 0) {
        reasons.push(`Suspicious IP (${ipScore} points)`)
      }
    }

    // 6. Check for duplicate participation (content-specific)
    if (metadata.contentId && (action === 'VOTE' || action === 'COMMENT')) {
      const isDuplicate = await this.checkDuplicateParticipation(
        identifier,
        metadata.contentId,
        action
      )
      if (isDuplicate) {
        score += 50
        reasons.push('Duplicate participation detected')
      }
    }

    // Determine decision
    let decision: FraudDecision
    if (score >= THRESHOLDS.autoReject) {
      decision = 'HARD_REJECT'
    } else if (score >= THRESHOLDS.softReject) {
      decision = 'SOFT_REJECT'
    } else if (score >= THRESHOLDS.review) {
      decision = 'REVIEW'
    } else {
      decision = 'ALLOW'
    }

    return {
      decision,
      score: Math.min(100, score),
      reasons,
      requiresManualReview: decision === 'REVIEW',
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: POST-ACTION DEEP ANALYSIS (Asynchronous, Background)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Deep analysis after action completion
   * Run this in a background job AFTER the action is recorded
   */
  async postActionAnalysis(
    responseId: string,
    entityType: 'POLL_RESPONSE' | 'SURVEY_RESPONSE' | 'COMMENT',
    metadata: FraudMetadata
  ): Promise<Phase2AnalysisResult> {
    const riskFactors: string[] = []
    let fraudScore = 0
    let qualityScore = 100

    // 1. Behavioral analysis (timing patterns)
    const timingScore = await this.analyzeTiming(responseId, entityType)
    fraudScore += timingScore.fraudContribution
    qualityScore -= timingScore.qualityPenalty
    if (timingScore.suspicious) {
      riskFactors.push(timingScore.reason)
    }

    // 2. Pattern analysis (straight-lining, etc.)
    if (entityType === 'POLL_RESPONSE' || entityType === 'SURVEY_RESPONSE') {
      const patternScore = await this.analyzePatterns(responseId, entityType)
      fraudScore += patternScore.fraudContribution
      qualityScore -= patternScore.qualityPenalty
      if (patternScore.suspicious) {
        riskFactors.push(patternScore.reason)
      }
    }

    // 3. Network analysis (multiple users from same device/IP)
    if (metadata.ip || metadata.deviceFingerprint) {
      const networkScore = await this.analyzeNetwork(metadata)
      fraudScore += networkScore.fraudContribution
      if (networkScore.suspicious) {
        riskFactors.push(networkScore.reason)
      }
    }

    // 4. Determine actions
    const shouldInvalidate = fraudScore >= THRESHOLDS.invalidate
    const shouldFlag = fraudScore >= THRESHOLDS.flag && !shouldInvalidate

    // 5. Update response record with scores
    await this.updateResponseScores(responseId, entityType, fraudScore, qualityScore)

    // 6. If flagged, add to moderation queue
    if (shouldFlag || shouldInvalidate) {
      await this.addToModerationQueue(
        responseId,
        entityType,
        fraudScore,
        riskFactors,
        shouldInvalidate ? 'AUTO_INVALIDATED' : 'FLAGGED'
      )
    }

    // 7. Log for analytics (privacy-preserving)
    await this.logFraudDetection(responseId, entityType, metadata, fraudScore, riskFactors)

    return {
      fraudScore: Math.min(100, fraudScore),
      qualityScore: Math.max(0, qualityScore),
      riskFactors,
      shouldInvalidate,
      shouldFlag,
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check action velocity (rate limiting)
   */
  private async checkVelocity(identifier: string, action: FraudAction): Promise<number> {
    const redis = getRedis()
    const limit = VELOCITY_LIMITS[action]
    const key = `fraud:velocity:${action}:${identifier}`

    const count = await redis.incr(key)
    if (count === 1) {
      await redis.pexpire(key, limit.windowMs)
    }

    // Calculate score based on how far over limit
    if (count > limit.count * 2) return 50
    if (count > limit.count * 1.5) return 30
    if (count > limit.count) return 15
    return 0
  }

  /**
   * Check IP reputation (from cache or database)
   */
  private async checkIPReputation(ip: string): Promise<number> {
    const redis = getRedis()
    const cacheKey = `fraud:ip:reputation:${ip}`

    // Check cache first
    const cached = await redis.get(cacheKey)
    if (cached !== null) {
      return parseInt(cached, 10)
    }

    // Check database
    const ipRecordResult = await db
      .select({ reputationScore: ipReputations.reputationScore, type: ipReputations.type })
      .from(ipReputations)
      .where(eq(ipReputations.ipAddress, ip))
      .limit(1)

    const ipRecord = ipRecordResult[0]

    let score = 0
    if (ipRecord) {
      // Lower reputation = higher fraud score
      score = Math.max(0, 50 - ipRecord.reputationScore / 2)

      // Datacenter IPs get extra penalty
      if (ipRecord.type === 'DATACENTER') {
        score += 20
      }
    }

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, score.toString())

    return score
  }

  /**
   * Check for duplicate participation
   */
  private async checkDuplicateParticipation(
    identifier: string,
    contentId: string,
    action: FraudAction
  ): Promise<boolean> {
    const redis = getRedis()
    const key = `fraud:participation:${contentId}:${action}:${identifier}`

    const exists = await redis.exists(key)
    if (exists) return true

    // Mark participation (expires in 24 hours)
    await redis.setex(key, 86400, '1')
    return false
  }

  /**
   * Analyze timing patterns
   */
  private async analyzeTiming(
    responseId: string,
    entityType: string
  ): Promise<{ fraudContribution: number; qualityPenalty: number; suspicious: boolean; reason: string }> {
    // Get response timing data
    let response: { startedAt: Date | null; completedAt: Date | null } | null = null

    if (entityType === 'POLL_RESPONSE') {
      const result = await db
        .select({ startedAt: pollResponses.startedAt, completedAt: pollResponses.completedAt })
        .from(pollResponses)
        .where(eq(pollResponses.id, responseId))
        .limit(1)
      response = result[0] ?? null
    } else if (entityType === 'SURVEY_RESPONSE') {
      const result = await db
        .select({ startedAt: surveyResponses.startedAt, completedAt: surveyResponses.completedAt })
        .from(surveyResponses)
        .where(eq(surveyResponses.id, responseId))
        .limit(1)
      response = result[0] ?? null
    }

    if (!response || !response.startedAt || !response.completedAt) {
      return { fraudContribution: 0, qualityPenalty: 0, suspicious: false, reason: '' }
    }

    const durationMs = response.completedAt.getTime() - response.startedAt.getTime()
    const durationSeconds = durationMs / 1000

    // Too fast = suspicious (< 5 seconds for poll, < 30 seconds for survey)
    const minExpected = entityType === 'POLL_RESPONSE' ? 5 : 30

    if (durationSeconds < minExpected * 0.3) {
      return {
        fraudContribution: 30,
        qualityPenalty: 40,
        suspicious: true,
        reason: `Response completed too quickly (${durationSeconds.toFixed(1)}s)`,
      }
    }

    if (durationSeconds < minExpected) {
      return {
        fraudContribution: 10,
        qualityPenalty: 20,
        suspicious: true,
        reason: `Response completed faster than expected`,
      }
    }

    return { fraudContribution: 0, qualityPenalty: 0, suspicious: false, reason: '' }
  }

  /**
   * Analyze response patterns (straight-lining, etc.)
   */
  private async analyzePatterns(
    responseId: string,
    entityType: string
  ): Promise<{ fraudContribution: number; qualityPenalty: number; suspicious: boolean; reason: string }> {
    // Get response answers
    let response: { answers: unknown } | null = null

    if (entityType === 'POLL_RESPONSE') {
      const result = await db
        .select({ answers: pollResponses.answers })
        .from(pollResponses)
        .where(eq(pollResponses.id, responseId))
        .limit(1)
      response = result[0] ?? null
    } else {
      const result = await db
        .select({ answers: surveyResponses.answers })
        .from(surveyResponses)
        .where(eq(surveyResponses.id, responseId))
        .limit(1)
      response = result[0] ?? null
    }

    if (!response || !response.answers) {
      return { fraudContribution: 0, qualityPenalty: 0, suspicious: false, reason: '' }
    }

    const answers = response.answers as { optionId?: string; value?: unknown }[]

    // Check for straight-lining (all same answer)
    if (answers.length >= 3) {
      const uniqueAnswers = new Set(answers.map((a) => JSON.stringify(a.optionId || a.value)))
      if (uniqueAnswers.size === 1) {
        return {
          fraudContribution: 20,
          qualityPenalty: 30,
          suspicious: true,
          reason: 'Straight-lining detected (all same answer)',
        }
      }
    }

    return { fraudContribution: 0, qualityPenalty: 0, suspicious: false, reason: '' }
  }

  /**
   * Analyze network patterns
   */
  private async analyzeNetwork(
    metadata: FraudMetadata
  ): Promise<{ fraudContribution: number; suspicious: boolean; reason: string }> {
    const redis = getRedis()

    // Check how many users from same device
    if (metadata.deviceFingerprint) {
      const deviceKey = `fraud:device:users:${metadata.deviceFingerprint}`
      const userCount = await redis.scard(deviceKey)

      if (userCount > 5) {
        return {
          fraudContribution: 30,
          suspicious: true,
          reason: `Multiple accounts from same device (${userCount})`,
        }
      }
    }

    // Check how many users from same IP
    if (metadata.ip) {
      const ipKey = `fraud:ip:users:${metadata.ip}`
      const userCount = await redis.scard(ipKey)

      if (userCount > 20) {
        return {
          fraudContribution: 20,
          suspicious: true,
          reason: `Many users from same IP (${userCount})`,
        }
      }
    }

    return { fraudContribution: 0, suspicious: false, reason: '' }
  }

  /**
   * Update response with fraud/quality scores
   */
  private async updateResponseScores(
    responseId: string,
    entityType: string,
    fraudScore: number,
    qualityScore: number
  ): Promise<void> {
    if (entityType === 'POLL_RESPONSE') {
      await db
        .update(pollResponses)
        .set({ fraudScore, qualityScore })
        .where(eq(pollResponses.id, responseId))
    } else if (entityType === 'SURVEY_RESPONSE') {
      await db
        .update(surveyResponses)
        .set({ fraudScore, qualityScore })
        .where(eq(surveyResponses.id, responseId))
    }
  }

  /**
   * Add flagged response to moderation queue
   */
  private async addToModerationQueue(
    entityId: string,
    entityType: string,
    fraudScore: number,
    reasons: string[],
    status: 'FLAGGED' | 'AUTO_INVALIDATED'
  ): Promise<void> {
    await db
      .insert(moderationQueue)
      .values({
        entityType,
        entityId,
        reason: `Fraud detection: ${reasons.join(', ')}`,
        fraudScore,
        status: 'PENDING',
        priority: fraudScore >= 70 ? 'HIGH' : 'NORMAL',
        metadata: { autoStatus: status, riskFactors: reasons },
      })
  }

  /**
   * Log fraud detection for analytics (privacy-preserving)
   * [SECURITY: P-057] Uses separate FRAUD_DETECTION_SALT (NOT participant salt)
   */
  private async logFraudDetection(
    responseId: string,
    entityType: string,
    metadata: FraudMetadata,
    fraudScore: number,
    riskFactors: string[]
  ): Promise<void> {
    const fingerprintHash = metadata.deviceFingerprint
      ? generateFraudDetectionHash(metadata.deviceFingerprint)
      : generateFraudDetectionHash(`unknown-${Date.now()}`)

    // Truncate IP to first 3 octets for privacy
    const ipPrefix = metadata.ip
      ? metadata.ip.split('.').slice(0, 3).join('.') + '.0'
      : null

    // Map entityType to contentType enum value
    const contentTypeMap: Record<string, 'POLL' | 'QUICK_POLL' | 'LIVE_POLL' | 'SURVEY' | 'TEST'> = {
      POLL_RESPONSE: 'POLL',
      SURVEY_RESPONSE: 'SURVEY',
      TEST_RESPONSE: 'TEST',
    }

    // Set expiry to 30 days from now (P-057)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await db
      .insert(fraudDetectionLogs)
      .values({
        contentType: contentTypeMap[entityType] || 'POLL',
        contentId: metadata.contentId || responseId,
        fingerprintHash,
        ipPrefix,
        fraudScore,
        riskFactors,
        deviceCategory: 'UNKNOWN',
        expiresAt,
        // Note: No responseId stored to maintain unlinkability
      })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCKLIST MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add IP to blocklist
   */
  async blockIP(ip: string, reason: string, duration?: number): Promise<void> {
    const redis = getRedis()
    await redis.sadd('fraud:ip:blocklist', ip)

    if (duration) {
      // Auto-expire after duration (in seconds)
      await redis.expire('fraud:ip:blocklist', duration)
    }

    // Log the action
    console.log(`[FraudService] IP blocked: ${ip}, reason: ${reason}`)
  }

  /**
   * Add device to blocklist
   */
  async blockDevice(fingerprint: string, reason: string, duration?: number): Promise<void> {
    const redis = getRedis()
    await redis.sadd('fraud:device:blocklist', fingerprint)

    if (duration) {
      await redis.expire('fraud:device:blocklist', duration)
    }

    console.log(`[FraudService] Device blocked: ${fingerprint.substring(0, 8)}..., reason: ${reason}`)
  }

  /**
   * Remove IP from blocklist
   */
  async unblockIP(ip: string): Promise<void> {
    const redis = getRedis()
    await redis.srem('fraud:ip:blocklist', ip)
  }

  /**
   * Remove device from blocklist
   */
  async unblockDevice(fingerprint: string): Promise<void> {
    const redis = getRedis()
    await redis.srem('fraud:device:blocklist', fingerprint)
  }
}

// Export singleton
export const fraudService = new FraudServiceClass()
