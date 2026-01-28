// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUTO APPROVAL SERVICE
// Business logic for auto approval rule evaluation
// ══════════════════════════════════════════════════════════════════════════════

import { type ContentType } from '@voxpoll/database'
import { autoApprovalRepository, type AutoApprovalRule } from '../repositories/auto-approval.repository'
import { ApiError } from '../middleware/error-handler'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AutoApprovalResult {
  approved: boolean
  reason?: string
  matchedRuleId?: string
}

export interface CreateAutoApprovalRuleInput {
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
}

export interface UpdateAutoApprovalRuleInput {
  name?: string
  description?: string
  contentType?: ContentType | null
  minTrustScore?: number | null
  requiresVerification?: boolean
  minAccountAgeDays?: number | null
  maxPendingReports?: number | null
  conditions?: object
  priority?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto Approval Service Class
// ─────────────────────────────────────────────────────────────────────────────

class AutoApprovalServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // Evaluate Content for Auto Approval
  // ─────────────────────────────────────────────────────────────────────────────

  async evaluateContent(
    contentType: ContentType,
    contentId: string,
    creatorId: string,
    organizationId?: string
  ): Promise<AutoApprovalResult> {
    const rules = await autoApprovalRepository.getRules(organizationId, contentType)

    if (rules.length === 0) {
      return { approved: false, reason: 'No auto-approval rules configured' }
    }

    const userTrustScore = await autoApprovalRepository.getUserTrustScore(creatorId)
    const userDetails = await autoApprovalRepository.getUserDetails(creatorId)

    if (!userDetails) {
      return { approved: false, reason: 'User not found' }
    }

    const accountAgeDays = Math.floor(
      (Date.now() - new Date(userDetails.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    for (const rule of rules) {
      const result = this.evaluateRule(rule, {
        trustScore: userTrustScore?.overallScore ?? 50,
        isVerified: userDetails.isVerified,
        accountAgeDays,
        pendingReports: userTrustScore?.reportCount ?? 0,
      })

      if (result.passed) {
        return {
          approved: true,
          reason: `Auto-approved by rule: ${rule.name}`,
          matchedRuleId: rule.id,
        }
      }
    }

    return { approved: false, reason: 'No matching auto-approval rules' }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Evaluate Single Rule
  // ─────────────────────────────────────────────────────────────────────────────

  private evaluateRule(
    rule: AutoApprovalRule,
    userData: {
      trustScore: number
      isVerified: boolean
      accountAgeDays: number
      pendingReports: number
    }
  ): { passed: boolean; failedCondition?: string } {
    if (rule.minTrustScore !== null && rule.minTrustScore !== undefined) {
      if (userData.trustScore < rule.minTrustScore) {
        return { passed: false, failedCondition: 'Trust score too low' }
      }
    }

    if (rule.requiresVerification && !userData.isVerified) {
      return { passed: false, failedCondition: 'Verification required' }
    }

    if (rule.minAccountAgeDays !== null && rule.minAccountAgeDays !== undefined) {
      if (userData.accountAgeDays < rule.minAccountAgeDays) {
        return { passed: false, failedCondition: 'Account too new' }
      }
    }

    if (rule.maxPendingReports !== null && rule.maxPendingReports !== undefined) {
      if (userData.pendingReports > rule.maxPendingReports) {
        return { passed: false, failedCondition: 'Too many pending reports' }
      }
    }

    return { passed: true }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Rules
  // ─────────────────────────────────────────────────────────────────────────────

  async getRules(organizationId?: string) {
    return autoApprovalRepository.getAllForOrganization(organizationId)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Rule by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getRule(ruleId: string) {
    const rule = await autoApprovalRepository.getById(ruleId)

    if (!rule) {
      throw ApiError.notFound('Auto-approval rule not found', 'RULE_NOT_FOUND')
    }

    return rule
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Rule
  // ─────────────────────────────────────────────────────────────────────────────

  async createRule(creatorId: string, input: CreateAutoApprovalRuleInput) {
    const rule = await autoApprovalRepository.create({
      ...input,
      createdBy: creatorId,
    })

    if (!rule) {
      throw ApiError.internal('Failed to create auto-approval rule', 'RULE_CREATE_FAILED')
    }

    return rule
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Rule
  // ─────────────────────────────────────────────────────────────────────────────

  async updateRule(ruleId: string, input: UpdateAutoApprovalRuleInput) {
    const existing = await autoApprovalRepository.getById(ruleId)

    if (!existing) {
      throw ApiError.notFound('Auto-approval rule not found', 'RULE_NOT_FOUND')
    }

    const updated = await autoApprovalRepository.update(ruleId, input)

    if (!updated) {
      throw ApiError.internal('Failed to update auto-approval rule', 'RULE_UPDATE_FAILED')
    }

    return updated
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Toggle Rule
  // ─────────────────────────────────────────────────────────────────────────────

  async toggleRule(ruleId: string, isActive: boolean) {
    const existing = await autoApprovalRepository.getById(ruleId)

    if (!existing) {
      throw ApiError.notFound('Auto-approval rule not found', 'RULE_NOT_FOUND')
    }

    const updated = await autoApprovalRepository.toggle(ruleId, isActive)

    if (!updated) {
      throw ApiError.internal('Failed to toggle auto-approval rule', 'RULE_TOGGLE_FAILED')
    }

    return updated
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete Rule
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteRule(ruleId: string) {
    const existing = await autoApprovalRepository.getById(ruleId)

    if (!existing) {
      throw ApiError.notFound('Auto-approval rule not found', 'RULE_NOT_FOUND')
    }

    await autoApprovalRepository.delete(ruleId)

    return { message: 'Auto-approval rule deleted successfully' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const autoApprovalService = new AutoApprovalServiceClass()

export { AutoApprovalServiceClass as AutoApprovalService }
