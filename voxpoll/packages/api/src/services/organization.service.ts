// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ORGANIZATION SERVICE
// Business logic for organization operations
// ══════════════════════════════════════════════════════════════════════════════

import { randomBytes } from 'crypto'
import { type OrganizationRole, type OrganizationType } from '@voxpoll/database'
import { organizationRepository } from '../repositories/organization.repository'
import { ApiError } from '../middleware/error-handler'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateOrganizationInput {
  name: string
  slug: string
  description?: string
  logoUrl?: string
  website?: string
  type: OrganizationType
}

export interface UpdateOrganizationInput {
  name?: string
  slug?: string
  description?: string | null
  logoUrl?: string | null
  website?: string | null
  settings?: object
}

export interface InviteMemberInput {
  email: string
  role: OrganizationRole
}

// Role hierarchy: OWNER > ADMIN > MANAGER > ANALYST > CREATOR > MEMBER
const ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  ANALYST: 2,
  CREATOR: 1,
  MEMBER: 0,
}

function hasHigherOrEqualRole(userRole: OrganizationRole, requiredRole: OrganizationRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

function canManageRole(userRole: OrganizationRole, targetRole: OrganizationRole): boolean {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole]
}

// ─────────────────────────────────────────────────────────────────────────────
// Organization Service Class
// ─────────────────────────────────────────────────────────────────────────────

class OrganizationServiceClass {
  async getUserOrganizations(userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    const result = await organizationRepository.findByUser(userId, page, limit)

    return {
      items: result.items.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        logoUrl: m.organization.logoUrl,
        role: m.role,
        memberCount: m.organization._count.members,
        joinedAt: m.joinedAt,
      })),
      meta: result.meta,
    }
  }

  async getOrganization(orgId: string, userId: string) {
    const org = await organizationRepository.findById(orgId)
    if (!org || org.deletedAt) {
      throw ApiError.notFound('Organization not found', 'ORG_NOT_FOUND')
    }

    const member = await organizationRepository.getMember(orgId, userId)
    if (!member) {
      throw ApiError.forbidden('Not a member of this organization', 'NOT_A_MEMBER')
    }

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description,
      logoUrl: org.logoUrl,
      website: org.website,
      type: org.type,
      settings: org.settings,
      stats: {
        members: org._count.members,
        polls: org._count.polls,
        surveys: org._count.surveys,
      },
      userRole: member.role,
      createdAt: org.createdAt,
    }
  }

  async createOrganization(userId: string, input: CreateOrganizationInput) {
    const existing = await organizationRepository.findBySlug(input.slug)
    if (existing) {
      throw ApiError.conflict('Organization slug already taken', 'SLUG_TAKEN')
    }

    const org = await organizationRepository.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      logoUrl: input.logoUrl,
      website: input.website,
      ownerId: userId,
      type: input.type,
    })

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      createdAt: org.createdAt,
    }
  }

  async updateOrganization(orgId: string, userId: string, input: UpdateOrganizationInput) {
    await this.requireRole(orgId, userId, 'ADMIN')

    if (input.slug) {
      const existing = await organizationRepository.findBySlug(input.slug)
      if (existing && existing.id !== orgId) {
        throw ApiError.conflict('Organization slug already taken', 'SLUG_TAKEN')
      }
    }

    const updated = await organizationRepository.update(orgId, {
      name: input.name,
      slug: input.slug,
      description: input.description,
      logoUrl: input.logoUrl,
      website: input.website,
    })

    if (!updated) {
      throw ApiError.internal('Failed to update organization', 'UPDATE_FAILED')
    }

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      logoUrl: updated.logoUrl,
      website: updated.website,
    }
  }

  async deleteOrganization(orgId: string, userId: string) {
    await this.requireRole(orgId, userId, 'OWNER')
    await organizationRepository.delete(orgId)
    return { success: true }
  }

  async getMembers(orgId: string, userId: string, page: number = 1, limit: number = PAGINATION.defaultLimit) {
    await this.requireRole(orgId, userId, 'MEMBER')
    const result = await organizationRepository.getMembers(orgId, page, limit)

    return {
      items: result.items.map((m) => ({
        id: m.id,
        user: m.user,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      meta: result.meta,
    }
  }

  async inviteMember(orgId: string, userId: string, input: InviteMemberInput) {
    const userMember = await this.requireRole(orgId, userId, 'ADMIN')

    if (!canManageRole(userMember.role, input.role)) {
      throw ApiError.forbidden('Cannot invite members with equal or higher role', 'CANNOT_INVITE_HIGHER_ROLE')
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await organizationRepository.createInvitation({
      organizationId: orgId,
      email: input.email,
      role: input.role,
      invitedById: userId,
      token,
      expiresAt,
    })

    if (!invitation) {
      throw ApiError.internal('Failed to create invitation', 'INVITATION_FAILED')
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    }
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await organizationRepository.findInvitationByToken(token)

    if (!invitation) {
      throw ApiError.notFound('Invitation not found', 'INVITATION_NOT_FOUND')
    }

    if (invitation.status !== 'PENDING') {
      throw ApiError.badRequest('Invitation already used', 'INVITATION_USED')
    }

    if (invitation.expiresAt < new Date()) {
      throw ApiError.badRequest('Invitation expired', 'INVITATION_EXPIRED')
    }

    const existingMember = await organizationRepository.getMember(invitation.organizationId, userId)
    if (existingMember) {
      throw ApiError.conflict('Already a member', 'ALREADY_MEMBER')
    }

    await organizationRepository.addMember(invitation.organizationId, userId, invitation.role)
    await organizationRepository.updateInvitationStatus(invitation.id, 'ACCEPTED')

    return {
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name,
        slug: invitation.organization.slug,
      },
      role: invitation.role,
    }
  }

  async updateMemberRole(orgId: string, userId: string, targetUserId: string, newRole: OrganizationRole) {
    const userMember = await this.requireRole(orgId, userId, 'ADMIN')
    const targetMember = await organizationRepository.getMember(orgId, targetUserId)

    if (!targetMember) {
      throw ApiError.notFound('Member not found', 'MEMBER_NOT_FOUND')
    }

    if (userId === targetUserId) {
      throw ApiError.badRequest('Cannot change your own role', 'CANNOT_CHANGE_OWN_ROLE')
    }

    if (!canManageRole(userMember.role, targetMember.role)) {
      throw ApiError.forbidden('Cannot manage members with equal or higher role', 'CANNOT_MANAGE_HIGHER_ROLE')
    }

    if (!canManageRole(userMember.role, newRole)) {
      throw ApiError.forbidden('Cannot promote to equal or higher role', 'CANNOT_PROMOTE_HIGHER')
    }

    if (targetMember.role === 'OWNER' && newRole !== 'OWNER') {
      const ownerCount = await organizationRepository.countOwners(orgId)
      if (ownerCount <= 1) {
        throw ApiError.badRequest('Organization must have at least one owner', 'LAST_OWNER')
      }
    }

    const updated = await organizationRepository.updateMemberRole(orgId, targetUserId, newRole)

    if (!updated) {
      throw ApiError.internal('Failed to update member role', 'UPDATE_ROLE_FAILED')
    }

    return { userId: targetUserId, role: updated.role }
  }

  async removeMember(orgId: string, userId: string, targetUserId: string) {
    const userMember = await this.requireRole(orgId, userId, 'ADMIN')
    const targetMember = await organizationRepository.getMember(orgId, targetUserId)

    if (!targetMember) {
      throw ApiError.notFound('Member not found', 'MEMBER_NOT_FOUND')
    }

    if (userId === targetUserId) {
      throw ApiError.badRequest('Use leave instead to remove yourself', 'USE_LEAVE')
    }

    if (!canManageRole(userMember.role, targetMember.role)) {
      throw ApiError.forbidden('Cannot remove members with equal or higher role', 'CANNOT_REMOVE_HIGHER')
    }

    await organizationRepository.removeMember(orgId, targetUserId)
    return { success: true }
  }

  async leaveOrganization(orgId: string, userId: string) {
    const member = await organizationRepository.getMember(orgId, userId)

    if (!member) {
      throw ApiError.notFound('Not a member', 'NOT_A_MEMBER')
    }

    if (member.role === 'OWNER') {
      const ownerCount = await organizationRepository.countOwners(orgId)
      if (ownerCount <= 1) {
        throw ApiError.badRequest('Cannot leave as the only owner. Transfer ownership first.', 'LAST_OWNER')
      }
    }

    await organizationRepository.removeMember(orgId, userId)
    return { success: true }
  }

  private async requireRole(orgId: string, userId: string, requiredRole: OrganizationRole) {
    const org = await organizationRepository.findById(orgId)
    if (!org || org.deletedAt) {
      throw ApiError.notFound('Organization not found', 'ORG_NOT_FOUND')
    }

    const member = await organizationRepository.getMember(orgId, userId)
    if (!member) {
      throw ApiError.forbidden('Not a member of this organization', 'NOT_A_MEMBER')
    }

    if (!hasHigherOrEqualRole(member.role, requiredRole)) {
      throw ApiError.forbidden(`Requires ${requiredRole} role or higher`, 'INSUFFICIENT_ROLE')
    }

    return member
  }
}

export const organizationService = new OrganizationServiceClass()
export { OrganizationServiceClass as OrganizationService }
