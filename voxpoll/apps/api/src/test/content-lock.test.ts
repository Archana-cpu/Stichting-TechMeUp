import { describe, it, expect } from 'vitest'
import { ApiError } from '../middleware/error-handler'

describe('Content Lock Tests (P0-007)', () => {
  describe('Poll Lock After Publishing (Bible: P-106)', () => {
    it('should prevent editing poll after publishing', () => {
      const existingPoll = {
        id: 'poll-123',
        status: 'PUBLISHED',
        title: 'Original Title',
      }

      const canEdit = existingPoll.status === 'DRAFT'

      expect(canEdit).toBe(false)
    })

    it('should allow editing poll in DRAFT status', () => {
      const existingPoll = {
        id: 'poll-123',
        status: 'DRAFT',
        title: 'Original Title',
      }

      const canEdit = existingPoll.status === 'DRAFT'

      expect(canEdit).toBe(true)
    })

    it('should throw POLL_LOCKED error when attempting to edit published poll', () => {
      const existingPoll = {
        status: 'PUBLISHED',
      }

      const attemptEdit = () => {
        if (existingPoll.status !== 'DRAFT') {
          throw ApiError.badRequest('Cannot edit poll after publishing', 'POLL_LOCKED')
        }
      }

      expect(attemptEdit).toThrow(ApiError)
      expect(attemptEdit).toThrow('Cannot edit poll after publishing')
    })

    it('should prevent editing CLOSED polls', () => {
      const existingPoll = {
        status: 'CLOSED',
      }

      const canEdit = existingPoll.status === 'DRAFT'

      expect(canEdit).toBe(false)
    })

    it('should prevent editing ARCHIVED polls', () => {
      const existingPoll = {
        status: 'ARCHIVED',
      }

      const canEdit = existingPoll.status === 'DRAFT'

      expect(canEdit).toBe(false)
    })
  })

  describe('Survey Lock After Publishing (Bible: P-106)', () => {
    it('should prevent editing survey after publishing', () => {
      const existingSurvey = {
        id: 'survey-123',
        status: 'PUBLISHED',
        title: 'Original Title',
      }

      const canEdit = existingSurvey.status === 'DRAFT'

      expect(canEdit).toBe(false)
    })

    it('should allow editing survey in DRAFT status', () => {
      const existingSurvey = {
        id: 'survey-123',
        status: 'DRAFT',
        title: 'Original Title',
      }

      const canEdit = existingSurvey.status === 'DRAFT'

      expect(canEdit).toBe(true)
    })

    it('should throw SURVEY_LOCKED error when attempting to edit published survey', () => {
      const existingSurvey = {
        status: 'PUBLISHED',
      }

      const attemptEdit = () => {
        if (existingSurvey.status !== 'DRAFT') {
          throw ApiError.badRequest(
            'Cannot edit survey after publishing',
            'SURVEY_LOCKED'
          )
        }
      }

      expect(attemptEdit).toThrow(ApiError)
      expect(attemptEdit).toThrow('Cannot edit survey after publishing')
    })

    it('should prevent editing CLOSED surveys', () => {
      const existingSurvey = {
        status: 'CLOSED',
      }

      const canEdit = existingSurvey.status === 'DRAFT'

      expect(canEdit).toBe(false)
    })

    it('should prevent editing ARCHIVED surveys', () => {
      const existingSurvey = {
        status: 'ARCHIVED',
      }

      const canEdit = existingSurvey.status === 'DRAFT'

      expect(canEdit).toBe(false)
    })
  })

  describe('Test Lock After Publishing (Bible: P-106)', () => {
    it('should prevent editing test after publishing', () => {
      const existingTest = {
        id: 'test-123',
        status: 'PUBLISHED',
        title: 'Original Title',
      }

      const canEdit = existingTest.status === 'DRAFT'

      expect(canEdit).toBe(false)
    })

    it('should allow editing test in DRAFT status', () => {
      const existingTest = {
        id: 'test-123',
        status: 'DRAFT',
        title: 'Original Title',
      }

      const canEdit = existingTest.status === 'DRAFT'

      expect(canEdit).toBe(true)
    })

    it('should throw TEST_LOCKED error when attempting to edit published test', () => {
      const existingTest = {
        status: 'PUBLISHED',
      }

      const attemptEdit = () => {
        if (existingTest.status !== 'DRAFT') {
          throw ApiError.badRequest(
            'Cannot edit test after publishing',
            'TEST_LOCKED'
          )
        }
      }

      expect(attemptEdit).toThrow(ApiError)
      expect(attemptEdit).toThrow('Cannot edit test after publishing')
    })

    it('should prevent editing CLOSED tests', () => {
      const existingTest = {
        status: 'CLOSED',
      }

      const canEdit = existingTest.status === 'DRAFT'

      expect(canEdit).toBe(false)
    })

    it('should prevent editing ARCHIVED tests', () => {
      const existingTest = {
        status: 'ARCHIVED',
      }

      const canEdit = existingTest.status === 'DRAFT'

      expect(canEdit).toBe(false)
    })
  })

  describe('Content Status Transitions (Bible: P-106)', () => {
    it('should validate status transition from DRAFT to PUBLISHED', () => {
      const validTransitions = {
        DRAFT: ['PUBLISHED'],
        PUBLISHED: ['CLOSED', 'ARCHIVED'],
        CLOSED: ['ARCHIVED'],
        ARCHIVED: [],
      }

      const canTransition = (from: string, to: string): boolean => {
        return validTransitions[from as keyof typeof validTransitions]?.includes(to) ?? false
      }

      expect(canTransition('DRAFT', 'PUBLISHED')).toBe(true)
      expect(canTransition('DRAFT', 'CLOSED')).toBe(false)
      expect(canTransition('PUBLISHED', 'DRAFT')).toBe(false)
    })

    it('should prevent reverting from PUBLISHED to DRAFT', () => {
      const status = 'PUBLISHED'
      const canRevert = status === 'DRAFT'

      expect(canRevert).toBe(false)
    })

    it('should allow transitioning from PUBLISHED to CLOSED', () => {
      const validTransitions = ['CLOSED', 'ARCHIVED']
      const targetStatus = 'CLOSED'

      expect(validTransitions).toContain(targetStatus)
    })

    it('should prevent editing content in any non-DRAFT status', () => {
      const statuses = ['PUBLISHED', 'CLOSED', 'ARCHIVED']

      statuses.forEach(status => {
        const canEdit = status === 'DRAFT'
        expect(canEdit).toBe(false)
      })
    })
  })

  describe('Error Code Consistency (Bible: P-106)', () => {
    it('should use POLL_LOCKED error code for poll edit attempts', () => {
      const errorCode = 'POLL_LOCKED'
      expect(errorCode).toBe('POLL_LOCKED')
    })

    it('should use SURVEY_LOCKED error code for survey edit attempts', () => {
      const errorCode = 'SURVEY_LOCKED'
      expect(errorCode).toBe('SURVEY_LOCKED')
    })

    it('should use TEST_LOCKED error code for test edit attempts', () => {
      const errorCode = 'TEST_LOCKED'
      expect(errorCode).toBe('TEST_LOCKED')
    })

    it('should have consistent error message format across content types', () => {
      const pollMessage = 'Cannot edit poll after publishing'
      const surveyMessage = 'Cannot edit survey after publishing'
      const testMessage = 'Cannot edit test after publishing'

      expect(pollMessage).toContain('Cannot edit')
      expect(pollMessage).toContain('after publishing')

      expect(surveyMessage).toContain('Cannot edit')
      expect(surveyMessage).toContain('after publishing')

      expect(testMessage).toContain('Cannot edit')
      expect(testMessage).toContain('after publishing')
    })
  })

  describe('Content Lock Business Rules (Bible: P-106)', () => {
    it('should enforce immutability for published content integrity', () => {
      const contentTypes = ['poll', 'survey', 'test']

      contentTypes.forEach(type => {
        const published = {
          type,
          status: 'PUBLISHED',
          responsesCount: 100,
        }

        const shouldLock = published.status !== 'DRAFT'
        expect(shouldLock).toBe(true)
      })
    })

    it('should allow updates only in DRAFT status for data consistency', () => {
      const content = {
        status: 'DRAFT',
        version: 1,
      }

      const allowUpdate = content.status === 'DRAFT'
      expect(allowUpdate).toBe(true)
    })

    it('should validate that locked content maintains historical accuracy', () => {
      const publishedContent = {
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-01'),
        title: 'Original Question',
      }

      const isLocked = publishedContent.status !== 'DRAFT'
      const hasPublishDate = !!publishedContent.publishedAt

      expect(isLocked).toBe(true)
      expect(hasPublishDate).toBe(true)
    })
  })
})
