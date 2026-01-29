// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TEMPLATE CONTROLLER
// HTTP request/response handling for template operations
// ══════════════════════════════════════════════════════════════════════════════

import type { Context } from 'hono'
import { templateService, type CreateTemplateInput, type UpdateTemplateInput, type TemplateFilters } from '../services/template.service'
import type { AppEnv } from '../types'
import { PAGINATION } from '../constants/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Template Controller Class
// ─────────────────────────────────────────────────────────────────────────────

class TemplateControllerClass {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /templates - List templates
  // ─────────────────────────────────────────────────────────────────────────────

  async listTemplates(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const query = c.req.query()

    const page = parseInt(query['page'] || '1', 10)
    const limit = Math.min(parseInt(query['limit'] || String(PAGINATION.defaultLimit), 10), PAGINATION.maxLimit)

    const filters: TemplateFilters = {}
    if (query['category']) filters.category = query['category']
    if (query['templateType']) filters.templateType = query['templateType'] as 'POLL' | 'SURVEY' | 'TEST'
    if (query['visibility']) filters.visibility = query['visibility'] as 'PRIVATE' | 'ORGANIZATION' | 'PUBLIC'
    if (query['isFeatured'] === 'true') filters.isFeatured = true
    if (query['mine'] === 'true') filters.creatorId = userId
    if (query['organizationId']) filters.organizationId = query['organizationId']

    const result = await templateService.listTemplates(userId, filters, page, limit)

    return c.json({
      success: true,
      data: result.items,
      meta: result.meta,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /templates/featured - Get featured templates
  // ─────────────────────────────────────────────────────────────────────────────

  async getFeaturedTemplates(c: Context<AppEnv>) {
    const query = c.req.query()
    const limit = Math.min(parseInt(query['limit'] || '10', 10), 50)

    const templates = await templateService.getFeaturedTemplates(limit)

    return c.json({
      success: true,
      data: templates,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /templates/:id - Get template by ID
  // ─────────────────────────────────────────────────────────────────────────────

  async getTemplate(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    const template = await templateService.getTemplate(id, userId)

    return c.json({
      success: true,
      data: template,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /templates - Create template
  // ─────────────────────────────────────────────────────────────────────────────

  async createTemplate(c: Context<AppEnv>) {
    const userId = c.get('userId')!
    const body = await c.req.json<Omit<CreateTemplateInput, 'creatorId'>>()

    const template = await templateService.createTemplate({
      ...body,
      creatorId: userId,
    })

    return c.json({
      success: true,
      data: template,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /templates/:id - Update template
  // ─────────────────────────────────────────────────────────────────────────────

  async updateTemplate(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<UpdateTemplateInput>()

    const template = await templateService.updateTemplate(id, userId, body)

    return c.json({
      success: true,
      data: template,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /templates/:id - Delete template
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteTemplate(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!

    await templateService.deleteTemplate(id, userId)

    return c.json({
      success: true,
      message: 'Template deleted successfully',
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /templates/:id/use - Create poll from template
  // ─────────────────────────────────────────────────────────────────────────────

  async useTemplate(c: Context<AppEnv>) {
    const id = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<{
      title?: string
      description?: string
      organizationId?: string
    }>()

    const result = await templateService.useTemplate(id, userId, body)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /templates/from-poll/:pollId - Create template from poll
  // ─────────────────────────────────────────────────────────────────────────────

  async createTemplateFromPoll(c: Context<AppEnv>) {
    const pollId = c.req.param('pollId')
    const userId = c.get('userId')!
    const body = await c.req.json<{
      name: string
      description?: string
      visibility?: 'PRIVATE' | 'ORGANIZATION' | 'PUBLIC'
    }>()

    const template = await templateService.createTemplateFromPoll(pollId, userId, body)

    return c.json({
      success: true,
      data: template,
    }, 201)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /polls/:id/duplicate - Duplicate poll
  // ─────────────────────────────────────────────────────────────────────────────

  async duplicatePoll(c: Context<AppEnv>) {
    const pollId = c.req.param('id')
    const userId = c.get('userId')!
    const body = await c.req.json<{
      title?: string
      organizationId?: string
    }>()

    const result = await templateService.duplicatePoll(pollId, userId, body)

    return c.json({
      success: true,
      data: result,
    }, 201)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const templateController = new TemplateControllerClass()
