// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - ORGANIZATION REPOSITORY
// Data access layer for organization operations
// ══════════════════════════════════════════════════════════════════════════════

import {
  db,
  eq,
  and,
  desc,
  sql,
  organizations,
  organizationMembers,
  organizationInvitations,
  users,
  polls,
  surveys,
  type OrganizationRole,
  type OrganizationType,
} from '@voxpoll/database'
import type { InferSelectModel } from 'drizzle-orm'
import type { PaginationMeta } from './base.repository'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Organization = InferSelectModel<typeof organizations>
export type OrganizationMember = InferSelectModel<typeof organizationMembers>
export type OrganizationInvitation = InferSelectModel<typeof organizationInvitations>

// ─────────────────────────────────────────────────────────────────────────────
// Organization Repository Class
// ─────────────────────────────────────────────────────────────────────────────

class OrganizationRepositoryClass {
  async findById(id: string) {
    const result = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1)

    if (!result[0]) return null

    const [membersCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, id))

    const [pollsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(polls)
      .where(eq(polls.organizationId, id))

    const [surveysCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(surveys)
      .where(eq(surveys.organizationId, id))

    return {
      ...result[0],
      _count: {
        members: membersCount?.count ?? 0,
        polls: pollsCount?.count ?? 0,
        surveys: surveysCount?.count ?? 0,
      },
    }
  }

  async findBySlug(slug: string) {
    const result = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1)

    if (!result[0]) return null

    const [membersCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, result[0].id))

    const [pollsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(polls)
      .where(eq(polls.organizationId, result[0].id))

    const [surveysCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(surveys)
      .where(eq(surveys.organizationId, result[0].id))

    return {
      ...result[0],
      _count: {
        members: membersCount?.count ?? 0,
        polls: pollsCount?.count ?? 0,
        surveys: surveysCount?.count ?? 0,
      },
    }
  }

  async findByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const items = await db
      .select({
        member: organizationMembers,
        organization: organizations,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(eq(organizationMembers.userId, userId))
      .orderBy(desc(organizationMembers.joinedAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId))

    const total = totalResult?.count ?? 0

    // Get member counts for each organization
    const itemsWithCounts = await Promise.all(
      items.map(async (item) => {
        const [membersCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(organizationMembers)
          .where(eq(organizationMembers.organizationId, item.organization.id))

        return {
          ...item.member,
          organization: {
            ...item.organization,
            _count: { members: membersCount?.count ?? 0 },
          },
        }
      })
    )

    const meta: PaginationMeta = {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }
    return { items: itemsWithCounts, meta }
  }

  async create(data: {
    name: string
    slug: string
    description?: string
    logoUrl?: string
    website?: string
    ownerId: string
    type: OrganizationType
  }) {
    return db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organizations)
        .values({
          name: data.name,
          slug: data.slug,
          description: data.description,
          logoUrl: data.logoUrl,
          website: data.website,
          type: data.type,
        })
        .returning()

      if (!org) throw new Error('Failed to create organization')

      await tx
        .insert(organizationMembers)
        .values({
          organizationId: org.id,
          userId: data.ownerId,
          role: 'OWNER',
          joinedAt: new Date(),
        })

      return org
    })
  }

  async update(id: string, data: Partial<{
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
    website: string | null
    settings: Record<string, unknown>
  }>) {
    const [result] = await db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning()

    return result ?? null
  }

  async delete(id: string) {
    const [result] = await db
      .update(organizations)
      .set({ deletedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning()

    return result ?? null
  }

  async getMembers(organizationId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const items = await db
      .select({
        member: organizationMembers,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          email: users.email,
        },
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, organizationId))
      .orderBy(desc(organizationMembers.joinedAt))
      .offset(skip)
      .limit(limit)

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId))

    const total = totalResult?.count ?? 0

    const meta: PaginationMeta = {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }
    return {
      items: items.map((item) => ({
        ...item.member,
        user: item.user,
      })),
      meta,
    }
  }

  async getMember(organizationId: string, userId: string) {
    const result = await db
      .select({
        member: organizationMembers,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId)
        )
      )
      .limit(1)

    if (!result[0]) return null

    return {
      ...result[0].member,
      user: result[0].user,
    }
  }

  async updateMemberRole(organizationId: string, userId: string, role: OrganizationRole) {
    const [result] = await db
      .update(organizationMembers)
      .set({ role, updatedAt: new Date() })
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId)
        )
      )
      .returning()

    return result ?? null
  }

  async removeMember(organizationId: string, userId: string) {
    const [result] = await db
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId)
        )
      )
      .returning()

    return result ?? null
  }

  async createInvitation(data: {
    organizationId: string
    email: string
    role: OrganizationRole
    invitedById: string
    expiresAt: Date
    token: string
  }) {
    const [result] = await db
      .insert(organizationInvitations)
      .values({
        organizationId: data.organizationId,
        email: data.email,
        role: data.role,
        invitedById: data.invitedById,
        expiresAt: data.expiresAt,
        token: data.token,
        status: 'PENDING',
      })
      .returning()

    return result
  }

  async findInvitationByToken(token: string) {
    const result = await db
      .select({
        invitation: organizationInvitations,
        organization: organizations,
      })
      .from(organizationInvitations)
      .innerJoin(organizations, eq(organizationInvitations.organizationId, organizations.id))
      .where(eq(organizationInvitations.token, token))
      .limit(1)

    if (!result[0]) return null

    return {
      ...result[0].invitation,
      organization: result[0].organization,
    }
  }

  async updateInvitationStatus(id: string, status: string) {
    const [result] = await db
      .update(organizationInvitations)
      .set({ status, respondedAt: new Date() })
      .where(eq(organizationInvitations.id, id))
      .returning()

    return result ?? null
  }

  async addMember(organizationId: string, userId: string, role: OrganizationRole) {
    const [result] = await db
      .insert(organizationMembers)
      .values({ organizationId, userId, role, joinedAt: new Date() })
      .returning()

    return result
  }

  async countOwners(organizationId: string) {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.role, 'OWNER')
        )
      )

    return result?.count ?? 0
  }
}

export const organizationRepository = new OrganizationRepositoryClass()
export { OrganizationRepositoryClass as OrganizationRepository }
