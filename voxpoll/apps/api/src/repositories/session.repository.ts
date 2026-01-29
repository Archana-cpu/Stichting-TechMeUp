// ════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SESSION REPOSITORY
// Bible: T-005 (Session limits: max 5 sessions, 1 per device)
// ════════════════════════════════════════════════════════════════════════════

import { db, eq, and, gt, lt, or, ne, desc, asc, sql } from "@voxpoll/database"
import { sessions, users } from "@voxpoll/database"
import type { InferSelectModel, InferInsertModel } from "drizzle-orm"
import { SESSION_LIMITS } from "../constants/limits"

type Session = InferSelectModel<typeof sessions>

// ────────────────────────────────────────────────────────────────────────────
// Session Repository
// ────────────────────────────────────────────────────────────────────────────

class SessionRepositoryClass {
  // ────────────────────────────────────────────────────────────────────────────
  // Find by ID
  // ────────────────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Session | null> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1)
    return result[0] ?? null
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Update
  // ────────────────────────────────────────────────────────────────────────────

  async update(id: string, data: {
    isRevoked?: boolean
    revokedAt?: Date
    revokedReason?: string
  }): Promise<Session | null> {
    const result = await db.update(sessions)
      .set(data)
      .where(eq(sessions.id, id))
      .returning()
    return result[0] ?? null
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Find by Token Hash
  // ────────────────────────────────────────────────────────────────────────────

  async findByToken(tokenHash: string) {
    const result = await db.select({
      session: sessions,
      user: {
        id: users.id,
        status: users.status,
        role: users.role
      }
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(
      eq(sessions.tokenHash, tokenHash),
      eq(sessions.isRevoked, false),
      gt(sessions.expiresAt, new Date())
    ))
    .limit(1)

    const item = result[0]
    if (!item) return null
    return { ...item.session, user: item.user }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Find by Refresh Token Hash
  // ────────────────────────────────────────────────────────────────────────────

  async findByRefreshToken(refreshTokenHash: string) {
    const result = await db.select({
      session: sessions,
      user: users
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(
      eq(sessions.refreshTokenHash, refreshTokenHash),
      eq(sessions.isRevoked, false),
      gt(sessions.expiresAt, new Date())
    ))
    .limit(1)

    const item = result[0]
    if (!item) return null
    return { ...item.session, user: item.user }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Get Active Sessions for User
  // ────────────────────────────────────────────────────────────────────────────

  async getActiveSessions(userId: string) {
    return db.select({
      id: sessions.id,
      userAgent: sessions.userAgent,
      ipAddress: sessions.ipAddress,
      lastActiveAt: sessions.lastActiveAt,
      createdAt: sessions.createdAt,
      tokenHash: sessions.tokenHash
    })
    .from(sessions)
    .where(and(
      eq(sessions.userId, userId),
      eq(sessions.isRevoked, false),
      gt(sessions.expiresAt, new Date())
    ))
    .orderBy(desc(sessions.lastActiveAt))
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Revoke Session by Token Hash
  // ────────────────────────────────────────────────────────────────────────────

  async revokeByToken(tokenHash: string, reason: string): Promise<void> {
    await db.update(sessions)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason
      })
      .where(eq(sessions.tokenHash, tokenHash))
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Revoke All Sessions for User
  // ────────────────────────────────────────────────────────────────────────────

  async revokeAllForUser(userId: string, reason: string, exceptTokenHash?: string): Promise<number> {
    const conditions = [
      eq(sessions.userId, userId),
      eq(sessions.isRevoked, false)
    ]

    if (exceptTokenHash) {
      conditions.push(ne(sessions.tokenHash, exceptTokenHash))
    }

    const result = await db.update(sessions)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason
      })
      .where(and(...conditions))
      .returning({ id: sessions.id })

    return result.length
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Update Last Active
  // ────────────────────────────────────────────────────────────────────────────

  async updateLastActive(sessionId: string): Promise<void> {
    await db.update(sessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(sessions.id, sessionId))
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Create Session (Bible: T-005 - max 5 sessions, oldest terminated on 6th)
  // ────────────────────────────────────────────────────────────────────────────

  async createSession(data: {
    userId: string
    token: string
    tokenHash: string
    refreshToken: string
    refreshTokenHash: string
    expiresAt: Date
    ipAddress?: string | null
    userAgent?: string | null
    deviceCategory?: string
  }): Promise<Session> {
    // Bible T-005: Enforce max sessions limit
    const activeCount = await this.countActiveSessions(data.userId)
    if (activeCount >= SESSION_LIMITS.maxSessionsPerUser) {
      // Terminate oldest session (6th device login terminates oldest)
      await this.revokeOldestSession(data.userId)
    }

    const result = await db.insert(sessions).values({
      userId: data.userId,
      tokenHash: data.tokenHash,
      refreshTokenHash: data.refreshTokenHash,
      expiresAt: data.expiresAt,
      ipAddress: data.ipAddress ?? undefined,
      userAgent: data.userAgent ?? undefined,
      deviceCategory: (data.deviceCategory as 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN') ?? 'UNKNOWN',
    }).returning()
    if (!result[0]) throw new Error('Failed to create session')
    return result[0]
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Revoke Oldest Session (Bible: T-005 - 6th device terminates oldest)
  // ────────────────────────────────────────────────────────────────────────────

  async revokeOldestSession(userId: string): Promise<void> {
    const oldestSession = await db.select({ id: sessions.id })
      .from(sessions)
      .where(and(
        eq(sessions.userId, userId),
        eq(sessions.isRevoked, false),
        gt(sessions.expiresAt, new Date())
      ))
      .orderBy(asc(sessions.createdAt))
      .limit(1)

    if (oldestSession[0]) {
      await db.update(sessions)
        .set({
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'Session limit exceeded - oldest session terminated'
        })
        .where(eq(sessions.id, oldestSession[0].id))
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Rotate Tokens
  // ────────────────────────────────────────────────────────────────────────────

  async rotateTokens(
    sessionId: string,
    newToken: string,
    newTokenHash: string,
    newRefreshToken: string,
    newRefreshTokenHash: string,
    newExpiresAt: Date
  ): Promise<Session | null> {
    const result = await db.update(sessions)
      .set({
        tokenHash: newTokenHash,
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: newExpiresAt,
        lastActiveAt: new Date()
      })
      .where(eq(sessions.id, sessionId))
      .returning()
    return result[0] ?? null
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Count Active Sessions
  // ────────────────────────────────────────────────────────────────────────────

  async countActiveSessions(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(sessions)
      .where(and(
        eq(sessions.userId, userId),
        eq(sessions.isRevoked, false),
        gt(sessions.expiresAt, new Date())
      ))
    return result[0]?.count ?? 0
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Cleanup Expired Sessions
  // ────────────────────────────────────────────────────────────────────────────

  async cleanupExpired(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const result = await db.delete(sessions)
      .where(or(
        lt(sessions.expiresAt, new Date()),
        and(
          eq(sessions.isRevoked, true),
          lt(sessions.revokedAt, sevenDaysAgo)
        )
      ))
      .returning({ id: sessions.id })

    return result.length
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Exports
// ────────────────────────────────────────────────────────────────────────────

const sessionRepository = new SessionRepositoryClass()

export { sessionRepository, SessionRepositoryClass as SessionRepository }
