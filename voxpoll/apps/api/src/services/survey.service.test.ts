// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SURVEY SERVICE TESTS
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { surveyService } from './survey.service'
import {
  createMockSurvey,
  createMockUser,
  createMockOrganization,
  createMockPaginatedResult,
} from '../test/factories'

// ─────────────────────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../repositories/survey.repository', () => ({
  surveyRepository: {
    findMany: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    findResponse: vi.fn(),
    createResponse: vi.fn(),
  },
}))

vi.mock('./cache.service', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@voxpoll/database', async () => {
  const actual = await vi.importActual('@voxpoll/database')
  const mockMembership = {
    id: 'member_123',
    userId: 'user_123',
    organizationId: 'org_123',
    role: 'CREATOR',
    joinedAt: new Date(),
  }
  return {
    ...actual,
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockMembership]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    },
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('SurveyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // listSurveys
  // ─────────────────────────────────────────────────────────────────────────────

  describe('listSurveys', () => {
    it('should return paginated surveys with default filters', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')
      const mockSurvey = createMockSurvey()
      const mockResult = {
        items: [{
          ...mockSurvey,
          creator: createMockUser(),
          organization: createMockOrganization(),
          category: null,
          _count: { sections: 3 },
        }],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      }

      vi.mocked(surveyRepository.findMany).mockResolvedValue(mockResult as never)

      const result = await surveyService.listSurveys()

      expect(surveyRepository.findMany).toHaveBeenCalled()
      expect(result.items).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })

    it('should apply organization filter', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')

      vi.mocked(surveyRepository.findMany).mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      } as never)

      await surveyService.listSurveys(1, 20, 'recent', { organizationId: 'org_123' })

      expect(surveyRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org_123' }),
        expect.any(Number),
        expect.any(Number),
        expect.any(String)
      )
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // getSurvey
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getSurvey', () => {
    it('should return survey by id', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')
      const mockSurvey = createMockSurvey()
      const mockResult = {
        ...mockSurvey,
        creator: createMockUser(),
        organization: createMockOrganization(),
        category: null,
        sections: [],
      }

      vi.mocked(surveyRepository.findById).mockResolvedValue(mockResult as never)
      vi.mocked(surveyRepository.findResponse).mockResolvedValue(null)

      const result = await surveyService.getSurvey(mockSurvey.id)

      expect(surveyRepository.findById).toHaveBeenCalledWith(mockSurvey.id)
      expect(result).toBeDefined()
      expect(result.id).toBe(mockSurvey.id)
    })

    it('should throw NOT_FOUND for non-existent survey', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')

      vi.mocked(surveyRepository.findById).mockResolvedValue(null)

      await expect(surveyService.getSurvey('nonexistent')).rejects.toThrow()
    })

    it('should throw NOT_FOUND for deleted survey', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')
      const mockSurvey = createMockSurvey({ deletedAt: new Date() })

      vi.mocked(surveyRepository.findById).mockResolvedValue({
        ...mockSurvey,
        creator: createMockUser(),
        organization: createMockOrganization(),
        category: null,
        sections: [],
      } as never)

      await expect(surveyService.getSurvey(mockSurvey.id)).rejects.toThrow()
    })

    it('should include hasResponded flag when user has responded', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')
      const mockSurvey = createMockSurvey()
      const mockResponse = { id: 'response_123' }

      vi.mocked(surveyRepository.findById).mockResolvedValue({
        ...mockSurvey,
        creator: createMockUser(),
        organization: createMockOrganization(),
        category: null,
        sections: [],
      } as never)
      vi.mocked(surveyRepository.findResponse).mockResolvedValue(mockResponse as never)

      const result = await surveyService.getSurvey(mockSurvey.id, 'user_123')

      expect(result.hasResponded).toBe(true)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // createSurvey
  // ─────────────────────────────────────────────────────────────────────────────

  describe('createSurvey', () => {
    const validInput = {
      organizationId: 'org_123',
      title: 'New Survey',
      description: 'A test survey',
    }

    it('should create survey with valid input', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')
      const mockSurvey = createMockSurvey({ title: 'New Survey' })

      vi.mocked(surveyRepository.create).mockResolvedValue(mockSurvey as never)

      const result = await surveyService.createSurvey('user_123', validInput)

      expect(surveyRepository.create).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should generate a slug from title', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')
      const mockSurvey = createMockSurvey({ title: 'New Survey' })
      vi.mocked(surveyRepository.create).mockResolvedValue(mockSurvey as never)

      await surveyService.createSurvey('user_123', validInput)

      expect(surveyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Survey',
          slug: expect.stringContaining('new-survey'),
        })
      )
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // updateSurvey
  // ─────────────────────────────────────────────────────────────────────────────

  describe('updateSurvey', () => {
    it('should update survey for authorized user', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')
      const creatorId = 'user_123'
      const mockSurvey = createMockSurvey({ creatorId, status: 'DRAFT' })

      vi.mocked(surveyRepository.findById).mockResolvedValue({
        ...mockSurvey,
        creator: createMockUser({ id: creatorId }),
        organization: createMockOrganization(),
        category: null,
        sections: [],
      } as never)
      vi.mocked(surveyRepository.update).mockResolvedValue(mockSurvey as never)

      const result = await surveyService.updateSurvey(mockSurvey.id, creatorId, { title: 'Updated' })

      expect(surveyRepository.update).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should reject update for non-creator without org permissions', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')
      const mockSurvey = createMockSurvey({ creatorId: 'other_user' })

      vi.mocked(surveyRepository.findById).mockResolvedValue({
        ...mockSurvey,
        creator: createMockUser({ id: 'other_user' }),
        organization: createMockOrganization(),
        category: null,
        sections: [],
      } as never)

      await expect(
        surveyService.updateSurvey(mockSurvey.id, 'user_123', { title: 'Updated' })
      ).rejects.toThrow()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // deleteSurvey
  // ─────────────────────────────────────────────────────────────────────────────

  describe('deleteSurvey', () => {
    it('should soft delete survey for creator', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')
      const { cacheService } = await import('./cache.service')
      const creatorId = 'user_123'
      const mockSurvey = createMockSurvey({ creatorId })

      vi.mocked(surveyRepository.findById).mockResolvedValue({
        ...mockSurvey,
        creator: createMockUser({ id: creatorId }),
        organization: createMockOrganization(),
        category: null,
        sections: [],
      } as never)
      vi.mocked(surveyRepository.softDelete).mockResolvedValue(mockSurvey as never)
      vi.mocked(cacheService.del).mockResolvedValue(true)

      await surveyService.deleteSurvey(mockSurvey.id, creatorId)

      expect(surveyRepository.softDelete).toHaveBeenCalledWith(mockSurvey.id)
    })

    it('should reject delete for non-creator', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')
      const mockSurvey = createMockSurvey({ creatorId: 'other_user' })

      vi.mocked(surveyRepository.findById).mockResolvedValue({
        ...mockSurvey,
        creator: createMockUser({ id: 'other_user' }),
        organization: createMockOrganization(),
        category: null,
        sections: [],
      } as never)

      await expect(
        surveyService.deleteSurvey(mockSurvey.id, 'user_123')
      ).rejects.toThrow()
    })
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // submitResponse
  // ─────────────────────────────────────────────────────────────────────────────

  describe('submitResponse', () => {
    it('should reject response submission for non-existent survey', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')

      vi.mocked(surveyRepository.findById).mockResolvedValue(null)

      await expect(
        surveyService.submitResponse('survey_123', 'user_123', { answers: {} })
      ).rejects.toThrow()
    })

    it('should reject response for draft survey', async () => {
      const { surveyRepository } = await import('../repositories/survey.repository')
      const mockSurvey = createMockSurvey({ status: 'DRAFT' })

      vi.mocked(surveyRepository.findById).mockResolvedValue({
        ...mockSurvey,
        creator: createMockUser(),
        organization: createMockOrganization(),
        category: null,
        sections: [],
      } as never)

      await expect(
        surveyService.submitResponse(mockSurvey.id, 'user_123', { answers: {} })
      ).rejects.toThrow()
    })
  })
})
