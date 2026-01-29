// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ORGANIZATION CONTROLLER
// HTTP request/response handling for organization operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { organizationService } from '../services/organization.service'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Organization Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class OrganizationControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /organizations - Get user's organizations
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserOrganizations(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const result = await organizationService.getUserOrganizations(userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /organizations/:id - Get organization details
  // ─────────────────────────────────────────────────────────────────────────────

  async getOrganization(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const orgId = c.req.param('id')

    const result = await organizationService.getOrganization(orgId, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /organizations - Create organization
  // ─────────────────────────────────────────────────────────────────────────────

  async createOrganization(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const input = c.req.valid('json' as never)

    const result = await organizationService.createOrganization(userId, input)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /organizations/:id - Update organization
  // ─────────────────────────────────────────────────────────────────────────────

  async updateOrganization(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const orgId = c.req.param('id')
    const input = c.req.valid('json' as never)

    const result = await organizationService.updateOrganization(orgId, userId, input)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /organizations/:id - Delete organization
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteOrganization(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const orgId = c.req.param('id')

    const result = await organizationService.deleteOrganization(orgId, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /organizations/:id/members - Get members
  // ─────────────────────────────────────────────────────────────────────────────

  async getMembers(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const orgId = c.req.param('id')
    const query = c.req.query()
    const page = Math.max(1, parseInt(query['page'] || '', 10) || 1)
    const limit = Math.min(
      Math.max(1, parseInt(query['limit'] || '', 10) || PAGINATION.defaultLimit),
      PAGINATION.maxLimit
    )

    const result = await organizationService.getMembers(orgId, userId, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /organizations/:id/invitations - Invite member
  // ─────────────────────────────────────────────────────────────────────────────

  async inviteMember(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const orgId = c.req.param('id')
    const input = c.req.valid('json' as never)

    const result = await organizationService.inviteMember(orgId, userId, input)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /organizations/invitations/:token/accept - Accept invitation
  // ─────────────────────────────────────────────────────────────────────────────

  async acceptInvitation(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const token = c.req.param('token')

    const result = await organizationService.acceptInvitation(token, userId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /organizations/:id/members/:userId/role - Update member role
  // ─────────────────────────────────────────────────────────────────────────────

  async updateMemberRole(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const orgId = c.req.param('id')
    const targetUserId = c.req.param('userId')
    const input = c.req.valid('json' as never) as { role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'ANALYST' | 'CREATOR' | 'MEMBER' }

    const result = await organizationService.updateMemberRole(orgId, userId, targetUserId, input.role)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /organizations/:id/members/:userId - Remove member
  // ─────────────────────────────────────────────────────────────────────────────

  async removeMember(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const orgId = c.req.param('id')
    const targetUserId = c.req.param('userId')

    const result = await organizationService.removeMember(orgId, userId, targetUserId)

    return c.json({
      success: true,
      data: result,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /organizations/:id/leave - Leave organization
  // ─────────────────────────────────────────────────────────────────────────────

  async leaveOrganization(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const orgId = c.req.param('id')

    const result = await organizationService.leaveOrganization(orgId, userId)

    return c.json({
      success: true,
      data: result,
    })
  }
}

// Export singleton
export const organizationController = new OrganizationControllerClass()

// Export class for testing
export { OrganizationControllerClass as OrganizationController }
