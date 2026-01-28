// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUTO APPROVAL REPOSITORY
// Data access layer for auto approval rules
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  desc,
  isNull,
  or,
  autoApprovalRules,
  userTrustScores,
  users,
  type ContentType,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AutoApprovalRule = InferSelectModel<typeof autoApprovalRules>

// ─────────────────────────────────────────────────────────────────────────────
// Auto Approval Repository Class
// ─────────────────────────────────────────────────────────────────────────────

class AutoApprovalRepositoryClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Create Rule
  // ─────────────────────────────────────────────────────────────────────────────

  async create(data: {
    organizationId?: string
    name: string
    description?: string
    contentType?: ContentType
    minTrustScore?: number
    requiresVerification?: boolean
    minAccountAgeDays?: number
    maxPendingReports?: number
    conditions?: object
    priority?: number
    createdBy: string
  }) {
    const [result] = await db
      .insert(autoApprovalRules)
      .values({
        organizationId: data.organizationId,
        name: data.name,
        description: data.description,
        contentType: data.contentType,
        minTrustScore: data.minTrustScore,
        requiresVerification: data.requiresVerification ?? false,
        minAccountAgeDays: data.minAccountAgeDays,
        maxPendingReports: data.maxPendingReports,
        conditions: data.conditions ?? {},
        priority: data.priority ?? 0,
        isActive: true,
        createdBy: data.createdBy,
      })
      .returning()

    return result
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Rule by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getById(id: string) {
    const result = await db
      .select()
      .from(autoApprovalRules)
      .where(eq(autoApprovalRules.id, id))
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Rules
  // ─────────────────────────────────────────────────────────────────────────────

  async getRules(organizationId?: string, contentType?: ContentType) {
    const conditions = [eq(autoApprovalRules.isActive, true)]

    if (organizationId) {
      conditions.push(
        or(
          eq(autoApprovalRules.organizationId, organizationId),
          isNull(autoApprovalRules.organizationId)
        )!
      )
    } else {
      conditions.push(isNull(autoApprovalRules.organizationId))
    }

    if (contentType) {
      conditions.push(
        or(
          eq(autoApprovalRules.contentType, contentType),
          isNull(autoApprovalRules.contentType)
        )!
      )
    }

    const rules = await db
      .select()
      .from(autoApprovalRules)
      .where(and(...conditions))
      .orderBy(desc(autoApprovalRules.priority))

    return rules
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get All Rules for Organization
  // ─────────────────────────────────────────────────────────────────────────────

  async getAllForOrganization(organizationId?: string) {
    const conditions = organizationId
      ? or(
          eq(autoApprovalRules.organizationId, organizationId),
          isNull(autoApprovalRules.organizationId)
        )
      : isNull(autoApprovalRules.organizationId)

    const rules = await db
      .select()
      .from(autoApprovalRules)
      .where(conditions)
      .orderBy(desc(autoApprovalRules.priority))

    return rules
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Rule
  // ─────────────────────────────────────────────────────────────────────────────

  async update(id: string, data: {
    name?: string
    description?: string
    contentType?: ContentType | null
    minTrustScore?: number | null
    requiresVerification?: boolean
    minAccountAgeDays?: number | null
    maxPendingReports?: number | null
    conditions?: object
    priority?: number
  }) {
    const [result] = await db
      .update(autoApprovalRules)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(autoApprovalRules.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Toggle Rule
  // ─────────────────────────────────────────────────────────────────────────────

  async toggle(id: string, isActive: boolean) {
    const [result] = await db
      .update(autoApprovalRules)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(autoApprovalRules.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete Rule
  // ─────────────────────────────────────────────────────────────────────────────

  async delete(id: string) {
    const [result] = await db
      .delete(autoApprovalRules)
      .where(eq(autoApprovalRules.id, id))
      .returning()

    return result ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Trust Score
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserTrustScore(userId: string) {
    const result = await db
      .select()
      .from(userTrustScores)
      .where(eq(userTrustScores.userId, userId))
      .limit(1)

    return result[0] ?? null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get User Details for Auto Approval Check
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserDetails(userId: string) {
    const result = await db
      .select({
        id: users.id,
        isVerified: users.isVerified,
        verificationLevel: users.verificationLevel,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return result[0] ?? null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const autoApprovalRepository = new AutoApprovalRepositoryClass()

export { AutoApprovalRepositoryClass as AutoApprovalRepository }
