// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ORGANIZATION ROUTES
// Route definitions for organization endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { auth } from '../middleware/auth'
import { organizationController } from '../controllers/organization.controller'
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../validators/organization.validators'
import type { AppEnv } from '../types'

export const organizationRoutes = new Hono<AppEnv>()

// All routes require authentication
organizationRoutes.use('/*', auth)

// ─────────────────────────────────────────────────────────────────────────────
// Organization Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /organizations - Get user's organizations
organizationRoutes.get('/', (c) => organizationController.getUserOrganizations(c))

// POST /organizations - Create organization
organizationRoutes.post(
  '/',
  zValidator('json', createOrganizationSchema),
  (c) => organizationController.createOrganization(c)
)

// GET /organizations/:id - Get organization details
organizationRoutes.get('/:id', (c) => organizationController.getOrganization(c))

// PATCH /organizations/:id - Update organization
organizationRoutes.patch(
  '/:id',
  zValidator('json', updateOrganizationSchema),
  (c) => organizationController.updateOrganization(c)
)

// DELETE /organizations/:id - Delete organization
organizationRoutes.delete('/:id', (c) => organizationController.deleteOrganization(c))

// ─────────────────────────────────────────────────────────────────────────────
// Member Routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /organizations/:id/members - Get members
organizationRoutes.get('/:id/members', (c) => organizationController.getMembers(c))

// POST /organizations/:id/invitations - Invite member
organizationRoutes.post(
  '/:id/invitations',
  zValidator('json', inviteMemberSchema),
  (c) => organizationController.inviteMember(c)
)

// PATCH /organizations/:id/members/:userId/role - Update member role
organizationRoutes.patch(
  '/:id/members/:userId/role',
  zValidator('json', updateMemberRoleSchema),
  (c) => organizationController.updateMemberRole(c)
)

// DELETE /organizations/:id/members/:userId - Remove member
organizationRoutes.delete('/:id/members/:userId', (c) => organizationController.removeMember(c))

// POST /organizations/:id/leave - Leave organization
organizationRoutes.post('/:id/leave', (c) => organizationController.leaveOrganization(c))

// ─────────────────────────────────────────────────────────────────────────────
// Invitation Routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /organizations/invitations/:token/accept - Accept invitation
organizationRoutes.post('/invitations/:token/accept', (c) => organizationController.acceptInvitation(c))
