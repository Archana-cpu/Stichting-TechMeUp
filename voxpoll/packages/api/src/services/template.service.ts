// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TEMPLATE SERVICE
// Business logic for poll template operations
// ══════════════════════════════════════════════════════════════════════════════

import { db, eq, and, sql, desc, isNull, or, ilike } from '@voxpoll/database'
import { pollTemplates, pollTemplateUsages, polls, organizations, organizationMembers } from '@voxpoll/database'
import { ApiError } from '../middleware/error-handler'
import { generateSlug } from '../lib/hash'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TemplateType = 'POLL' | 'SURVEY' | 'TEST'
type TemplateVisibility = 'PRIVATE' | 'ORGANIZATION' | 'PUBLIC'

interface TemplateOption {
  id: string
  text: string
  imageUrl?: string
}

interface TemplateSettings {
  allowMultipleVotes?: boolean
  maxVotesPerUser?: number
  showResultsBeforeVote?: boolean
  allowDiscussion?: boolean
  isAnonymous?: boolean
}

interface CreateTemplateInput {
  creatorId: string
  organizationId?: string
  name: string
  description?: string
  templateType?: TemplateType
  visibility?: TemplateVisibility
  title?: string
  pollDescription?: string
  options?: TemplateOption[]
  settings?: TemplateSettings
  category?: string
  tags?: string[]
  thumbnailUrl?: string
}

interface UpdateTemplateInput {
  name?: string
  description?: string
  visibility?: TemplateVisibility
  title?: string
  pollDescription?: string
  options?: TemplateOption[]
  settings?: TemplateSettings
  category?: string
  tags?: string[]
  thumbnailUrl?: string
  isActive?: boolean
}

interface TemplateFilters {
  creatorId?: string
  organizationId?: string
  visibility?: TemplateVisibility
  templateType?: TemplateType
  category?: string
  isFeatured?: boolean
  isActive?: boolean
  search?: string
}

interface PollTemplate {
  id: string
  creatorId: string
  organizationId: string | null
  name: string
  description: string | null
  templateType: string
  visibility: string
  title: string | null
  pollDescription: string | null
  options: TemplateOption[]
  settings: TemplateSettings
  category: string | null
  tags: string[]
  thumbnailUrl: string | null
  usageCount: number
  lastUsedAt: Date | null
  isFeatured: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// Template Service Class
// ─────────────────────────────────────────────────────────────────────────────

class TemplateServiceClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // List Templates
  // ─────────────────────────────────────────────────────────────────────────────

  async listTemplates(
    userId: string,
    filters: TemplateFilters = {},
    page: number = 1,
    limit: number = PAGINATION.defaultLimit
  ): Promise<{ items: PollTemplate[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const offset = (page - 1) * limit
    const conditions: ReturnType<typeof eq>[] = []

    conditions.push(eq(pollTemplates.isActive, true))

    if (filters.creatorId) {
      conditions.push(eq(pollTemplates.creatorId, filters.creatorId))
    }

    if (filters.organizationId) {
      conditions.push(eq(pollTemplates.organizationId, filters.organizationId))
    }

    if (filters.templateType) {
      conditions.push(eq(pollTemplates.templateType, filters.templateType))
    }

    if (filters.category) {
      conditions.push(eq(pollTemplates.category, filters.category))
    }

    if (filters.isFeatured !== undefined) {
      conditions.push(eq(pollTemplates.isFeatured, filters.isFeatured))
    }

    const userOrgIds = await this.getUserOrganizationIds(userId)
    const visibilityCondition = or(
      eq(pollTemplates.visibility, 'PUBLIC'),
      eq(pollTemplates.creatorId, userId),
      userOrgIds.length > 0
        ? and(
            eq(pollTemplates.visibility, 'ORGANIZATION'),
            sql`${pollTemplates.organizationId} IN (${sql.join(userOrgIds.map(id => sql`${id}`), sql`, `)})`
          )
        : sql`false`
    )

    const items = await db
      .select()
      .from(pollTemplates)
      .where(and(...conditions, visibilityCondition))
      .orderBy(desc(pollTemplates.usageCount), desc(pollTemplates.createdAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(pollTemplates)
      .where(and(...conditions, visibilityCondition))

    const total = countResult?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      items: items.map(t => this.formatTemplate(t)),
      meta: { page, limit, total, totalPages },
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Template by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getTemplate(templateId: string, userId: string): Promise<PollTemplate> {
    const [template] = await db
      .select()
      .from(pollTemplates)
      .where(eq(pollTemplates.id, templateId))
      .limit(1)

    if (!template || !template.isActive) {
      throw ApiError.notFound('Template not found', 'TEMPLATE_NOT_FOUND')
    }

    const hasAccess = await this.checkTemplateAccess(template, userId)
    if (!hasAccess) {
      throw ApiError.forbidden('You do not have access to this template', 'NO_ACCESS')
    }

    return this.formatTemplate(template)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create Template
  // ─────────────────────────────────────────────────────────────────────────────

  async createTemplate(input: CreateTemplateInput): Promise<PollTemplate> {
    if (input.organizationId) {
      const isMember = await this.isOrganizationMember(input.creatorId, input.organizationId)
      if (!isMember) {
        throw ApiError.forbidden('You are not a member of this organization', 'NOT_MEMBER')
      }
    }

    const [template] = await db
      .insert(pollTemplates)
      .values({
        creatorId: input.creatorId,
        organizationId: input.organizationId || null,
        name: input.name,
        description: input.description || null,
        templateType: input.templateType || 'POLL',
        visibility: input.visibility || 'PRIVATE',
        title: input.title || null,
        pollDescription: input.pollDescription || null,
        options: input.options || [],
        settings: input.settings || {},
        category: input.category || null,
        tags: input.tags || [],
        thumbnailUrl: input.thumbnailUrl || null,
        usageCount: 0,
        isFeatured: false,
        isActive: true,
      })
      .returning()

    return this.formatTemplate(template!)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Template
  // ─────────────────────────────────────────────────────────────────────────────

  async updateTemplate(
    templateId: string,
    userId: string,
    input: UpdateTemplateInput
  ): Promise<PollTemplate> {
    const [existing] = await db
      .select()
      .from(pollTemplates)
      .where(eq(pollTemplates.id, templateId))
      .limit(1)

    if (!existing) {
      throw ApiError.notFound('Template not found', 'TEMPLATE_NOT_FOUND')
    }

    if (existing.creatorId !== userId) {
      throw ApiError.forbidden('You can only update your own templates', 'NOT_OWNER')
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (input.name !== undefined) updateData['name'] = input.name
    if (input.description !== undefined) updateData['description'] = input.description
    if (input.visibility !== undefined) updateData['visibility'] = input.visibility
    if (input.title !== undefined) updateData['title'] = input.title
    if (input.pollDescription !== undefined) updateData['pollDescription'] = input.pollDescription
    if (input.options !== undefined) updateData['options'] = input.options
    if (input.settings !== undefined) updateData['settings'] = input.settings
    if (input.category !== undefined) updateData['category'] = input.category
    if (input.tags !== undefined) updateData['tags'] = input.tags
    if (input.thumbnailUrl !== undefined) updateData['thumbnailUrl'] = input.thumbnailUrl
    if (input.isActive !== undefined) updateData['isActive'] = input.isActive

    const [updated] = await db
      .update(pollTemplates)
      .set(updateData)
      .where(eq(pollTemplates.id, templateId))
      .returning()

    return this.formatTemplate(updated!)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete Template
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(pollTemplates)
      .where(eq(pollTemplates.id, templateId))
      .limit(1)

    if (!existing) {
      throw ApiError.notFound('Template not found', 'TEMPLATE_NOT_FOUND')
    }

    if (existing.creatorId !== userId) {
      throw ApiError.forbidden('You can only delete your own templates', 'NOT_OWNER')
    }

    await db
      .update(pollTemplates)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(pollTemplates.id, templateId))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Use Template (Create Poll from Template)
  // ─────────────────────────────────────────────────────────────────────────────

  async useTemplate(
    templateId: string,
    userId: string,
    overrides?: {
      title?: string
      description?: string
      options?: TemplateOption[]
      organizationId?: string
    }
  ): Promise<{ pollId: string; slug: string }> {
    const template = await this.getTemplate(templateId, userId)

    const title = overrides?.title || template.title || template.name
    const description = overrides?.description || template.pollDescription
    const options = overrides?.options || template.options
    const settings = template.settings

    const slug = generateSlug(title, true)

    const pollOptions = options.map((opt, index) => ({
      id: `opt_${index}_${Date.now().toString(36)}`,
      text: opt.text,
      imageUrl: opt.imageUrl || null,
      voteCount: 0,
    }))

    const [poll] = await db
      .insert(polls)
      .values({
        creatorId: userId,
        organizationId: overrides?.organizationId || null,
        title,
        description: description || null,
        slug,
        type: 'STANDARD',
        votingSystem: 'SINGLE_CHOICE',
        status: 'DRAFT',
        visibility: 'PUBLIC',
        options: pollOptions,
        allowMultipleVotes: settings.allowMultipleVotes ?? false,
        maxVotesPerUser: settings.maxVotesPerUser ?? 1,
        showResultsBeforeVote: settings.showResultsBeforeVote ?? false,
        allowDiscussion: settings.allowDiscussion ?? true,
        isAnonymous: settings.isAnonymous ?? true,
        templateId,
      })
      .returning()

    await db.insert(pollTemplateUsages).values({
      templateId,
      userId,
      contentType: 'POLL',
      contentId: poll!.id,
    })

    await db
      .update(pollTemplates)
      .set({
        usageCount: sql`${pollTemplates.usageCount} + 1`,
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pollTemplates.id, templateId))

    return {
      pollId: poll!.id,
      slug: poll!.slug,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Duplicate Poll as Template
  // ─────────────────────────────────────────────────────────────────────────────

  async createTemplateFromPoll(
    pollId: string,
    userId: string,
    options: {
      name: string
      description?: string
      visibility?: TemplateVisibility
    }
  ): Promise<PollTemplate> {
    const [poll] = await db
      .select()
      .from(polls)
      .where(and(eq(polls.id, pollId), isNull(polls.deletedAt)))
      .limit(1)

    if (!poll) {
      throw ApiError.notFound('Poll not found', 'POLL_NOT_FOUND')
    }

    if (poll.creatorId !== userId) {
      throw ApiError.forbidden('You can only create templates from your own polls', 'NOT_OWNER')
    }

    const pollOptions = poll.options as TemplateOption[]

    const [template] = await db
      .insert(pollTemplates)
      .values({
        creatorId: userId,
        organizationId: poll.organizationId,
        name: options.name,
        description: options.description || null,
        templateType: 'POLL',
        visibility: options.visibility || 'PRIVATE',
        title: poll.title,
        pollDescription: poll.description,
        options: pollOptions.map(opt => ({
          id: opt.id,
          text: opt.text,
          imageUrl: opt.imageUrl,
        })),
        settings: {
          allowMultipleVotes: poll.allowMultipleVotes,
          maxVotesPerUser: poll.maxVotesPerUser,
          showResultsBeforeVote: poll.showResultsBeforeVote,
          allowDiscussion: poll.allowDiscussion,
          isAnonymous: poll.isAnonymous,
        },
        category: poll.categoryId,
        tags: poll.tags || [],
        thumbnailUrl: poll.coverImageUrl,
        usageCount: 0,
        isFeatured: false,
        isActive: true,
      })
      .returning()

    return this.formatTemplate(template!)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Duplicate Poll (Direct Copy)
  // ─────────────────────────────────────────────────────────────────────────────

  async duplicatePoll(
    pollId: string,
    userId: string,
    options?: {
      title?: string
      organizationId?: string
    }
  ): Promise<{ pollId: string; slug: string }> {
    const [poll] = await db
      .select()
      .from(polls)
      .where(and(eq(polls.id, pollId), isNull(polls.deletedAt)))
      .limit(1)

    if (!poll) {
      throw ApiError.notFound('Poll not found', 'POLL_NOT_FOUND')
    }

    if (poll.creatorId !== userId && poll.visibility === 'PRIVATE') {
      throw ApiError.forbidden('You cannot duplicate a private poll', 'PRIVATE_POLL')
    }

    const title = options?.title || `${poll.title} (Copy)`
    const slug = generateSlug(title, true)

    const pollOptions = (poll.options as Array<{ id: string; text: string; imageUrl?: string }>).map((opt, index) => ({
      id: `opt_${index}_${Date.now().toString(36)}`,
      text: opt.text,
      imageUrl: opt.imageUrl || null,
      voteCount: 0,
    }))

    const [newPoll] = await db
      .insert(polls)
      .values({
        creatorId: userId,
        organizationId: options?.organizationId || null,
        title,
        description: poll.description,
        slug,
        type: poll.type,
        votingSystem: poll.votingSystem,
        status: 'DRAFT',
        visibility: 'PRIVATE',
        options: pollOptions,
        categoryId: poll.categoryId,
        tags: poll.tags,
        coverImageUrl: poll.coverImageUrl,
        allowMultipleVotes: poll.allowMultipleVotes,
        maxVotesPerUser: poll.maxVotesPerUser,
        showResultsBeforeVote: poll.showResultsBeforeVote,
        allowDiscussion: poll.allowDiscussion,
        isAnonymous: poll.isAnonymous,
        requireAuth: poll.requireAuth,
        hasPreTest: poll.hasPreTest,
        preTestQuestions: poll.preTestQuestions,
        preTestPassingScore: poll.preTestPassingScore,
      })
      .returning()

    return {
      pollId: newPoll!.id,
      slug: newPoll!.slug,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Featured Templates
  // ─────────────────────────────────────────────────────────────────────────────

  async getFeaturedTemplates(limit: number = 10): Promise<PollTemplate[]> {
    const templates = await db
      .select()
      .from(pollTemplates)
      .where(
        and(
          eq(pollTemplates.isFeatured, true),
          eq(pollTemplates.isActive, true),
          eq(pollTemplates.visibility, 'PUBLIC')
        )
      )
      .orderBy(desc(pollTemplates.usageCount))
      .limit(limit)

    return templates.map(t => this.formatTemplate(t))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Check Template Access
  // ─────────────────────────────────────────────────────────────────────────────

  private async checkTemplateAccess(
    template: typeof pollTemplates.$inferSelect,
    userId: string
  ): Promise<boolean> {
    if (template.visibility === 'PUBLIC') return true
    if (template.creatorId === userId) return true

    if (template.visibility === 'ORGANIZATION' && template.organizationId) {
      return this.isOrganizationMember(userId, template.organizationId)
    }

    return false
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Get User Organization IDs
  // ─────────────────────────────────────────────────────────────────────────────

  private async getUserOrganizationIds(userId: string): Promise<string[]> {
    const memberships = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId))

    return memberships.map(m => m.organizationId)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Check Organization Membership
  // ─────────────────────────────────────────────────────────────────────────────

  private async isOrganizationMember(userId: string, organizationId: string): Promise<boolean> {
    const [membership] = await db
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .limit(1)

    return !!membership
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Format Template
  // ─────────────────────────────────────────────────────────────────────────────

  private formatTemplate(template: typeof pollTemplates.$inferSelect): PollTemplate {
    return {
      id: template.id,
      creatorId: template.creatorId,
      organizationId: template.organizationId,
      name: template.name,
      description: template.description,
      templateType: template.templateType,
      visibility: template.visibility,
      title: template.title,
      pollDescription: template.pollDescription,
      options: (template.options || []) as TemplateOption[],
      settings: (template.settings || {}) as TemplateSettings,
      category: template.category,
      tags: template.tags || [],
      thumbnailUrl: template.thumbnailUrl,
      usageCount: template.usageCount,
      lastUsedAt: template.lastUsedAt,
      isFeatured: template.isFeatured,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const templateService = new TemplateServiceClass()
export type { CreateTemplateInput, UpdateTemplateInput, TemplateFilters, PollTemplate, TemplateOption, TemplateSettings }
