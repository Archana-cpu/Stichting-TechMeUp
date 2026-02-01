// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - BADGE CARD SERVICE TESTS
// Tests for badge card generation service
// ══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { badgeCardService, type ShareCardInput } from '../services/badge-card.service'

// ─────────────────────────────────────────────────────────────────────────────
// Mock AWS S3
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({
    send: vi.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: vi.fn(),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────────────────────────────────────

const mockShareCardInput: ShareCardInput = {
  testId: 'test-123',
  resultId: 'result-456',
  userId: 'user-789',
  resultTitle: 'Gryffindor',
  resultDescription: 'Brave and daring, you belong in Gryffindor where courage and chivalry rule.',
  resultImageUrl: 'https://example.com/gryffindor.png',
  testTitle: 'Which Hogwarts House Are You?',
  matchPercentage: 85,
  template: 'VISUAL',
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Badge Card Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateCard', () => {
    it('should generate MINIMAL template card', async () => {
      const input: ShareCardInput = {
        ...mockShareCardInput,
        template: 'MINIMAL',
      }

      const result = await badgeCardService.generateCard(input)

      expect(result).toBeDefined()
      expect(result.imageUrl).toBeDefined()
      expect(result.dimensions).toEqual({ width: 1200, height: 630 })
      expect(result.metadata.ogTitle).toBe('Gryffindor - Which Hogwarts House Are You?')
      expect(result.metadata.twitterCard).toBe('summary_large_image')
      expect(result.shareUrls.twitter).toContain('twitter.com/intent/tweet')
    })

    it('should generate DETAILED template card', async () => {
      const input: ShareCardInput = {
        ...mockShareCardInput,
        template: 'DETAILED',
      }

      const result = await badgeCardService.generateCard(input)

      expect(result).toBeDefined()
      expect(result.imageUrl).toBeDefined()
      expect(result.dimensions).toEqual({ width: 1200, height: 630 })
      expect(result.metadata.ogDescription).toContain('Brave and daring')
    })

    it('should generate VISUAL template card', async () => {
      const input: ShareCardInput = {
        ...mockShareCardInput,
        template: 'VISUAL',
      }

      const result = await badgeCardService.generateCard(input)

      expect(result).toBeDefined()
      expect(result.imageUrl).toBeDefined()
      expect(result.dimensions).toEqual({ width: 1200, height: 630 })
    })

    it('should generate COMPARISON template card with comparison data', async () => {
      const input: ShareCardInput = {
        ...mockShareCardInput,
        template: 'COMPARISON',
        comparisonData: {
          userResult: 'Gryffindor',
          results: [
            { label: 'Gryffindor', percentage: 38 },
            { label: 'Ravenclaw', percentage: 28 },
            { label: 'Hufflepuff', percentage: 19 },
            { label: 'Slytherin', percentage: 15 },
          ],
        },
      }

      const result = await badgeCardService.generateCard(input)

      expect(result).toBeDefined()
      expect(result.imageUrl).toBeDefined()
      expect(result.dimensions).toEqual({ width: 1200, height: 630 })
    })

    it('should generate STORY template card for Instagram Stories', async () => {
      const input: ShareCardInput = {
        ...mockShareCardInput,
        template: 'STORY',
      }

      const result = await badgeCardService.generateCard(input)

      expect(result).toBeDefined()
      expect(result.imageUrl).toBeDefined()
      expect(result.dimensions).toEqual({ width: 1080, height: 1920 })
    })

    it('should handle missing optional fields gracefully', async () => {
      const input: ShareCardInput = {
        testId: 'test-123',
        resultId: 'result-456',
        userId: null,
        resultTitle: 'INTJ',
        testTitle: 'MBTI Personality Test',
        template: 'MINIMAL',
      }

      const result = await badgeCardService.generateCard(input)

      expect(result).toBeDefined()
      expect(result.imageUrl).toBeDefined()
      expect(result.metadata.ogDescription).toBeDefined()
    })

    it('should truncate long descriptions', async () => {
      const longDescription = 'A'.repeat(300)
      const input: ShareCardInput = {
        ...mockShareCardInput,
        resultDescription: longDescription,
        template: 'DETAILED',
      }

      const result = await badgeCardService.generateCard(input)

      expect(result.metadata.ogDescription).toBeTruthy()
      expect(result.metadata.ogDescription.length).toBeLessThanOrEqual(203)
    })
  })

  describe('share URLs', () => {
    it('should generate correct Twitter share URL', async () => {
      const result = await badgeCardService.generateCard(mockShareCardInput)

      expect(result.shareUrls.twitter).toContain('twitter.com/intent/tweet')
      expect(result.shareUrls.twitter).toContain('Gryffindor')
      expect(result.shareUrls.twitter).toContain('Which%20Hogwarts%20House')
    })

    it('should generate correct Facebook share URL', async () => {
      const result = await badgeCardService.generateCard(mockShareCardInput)

      expect(result.shareUrls.facebook).toContain('facebook.com/sharer')
      expect(result.shareUrls.facebook).toContain('test-123')
    })

    it('should generate correct WhatsApp share URL', async () => {
      const result = await badgeCardService.generateCard(mockShareCardInput)

      expect(result.shareUrls.whatsapp).toContain('wa.me')
      expect(result.shareUrls.whatsapp).toContain('Gryffindor')
    })

    it('should generate correct Telegram share URL', async () => {
      const result = await badgeCardService.generateCard(mockShareCardInput)

      expect(result.shareUrls.telegram).toContain('t.me/share')
      expect(result.shareUrls.telegram).toContain('Gryffindor')
    })

    it('should generate copyLink with test URL', async () => {
      const result = await badgeCardService.generateCard(mockShareCardInput)

      expect(result.shareUrls.copyLink).toContain('test-123')
    })
  })

  describe('metadata generation', () => {
    it('should generate correct OG metadata', async () => {
      const result = await badgeCardService.generateCard(mockShareCardInput)

      expect(result.metadata.ogTitle).toBe('Gryffindor - Which Hogwarts House Are You?')
      expect(result.metadata.ogDescription).toContain('Brave and daring')
      expect(result.metadata.ogImage).toBeDefined()
      expect(result.metadata.twitterCard).toBe('summary_large_image')
    })

    it('should generate default description when not provided', async () => {
      const input: ShareCardInput = {
        ...mockShareCardInput,
        resultDescription: undefined,
      }

      const result = await badgeCardService.generateCard(input)

      expect(result.metadata.ogDescription).toContain('I got Gryffindor')
      expect(result.metadata.ogDescription).toContain('Which Hogwarts House Are You?')
    })
  })

  describe('image dimensions', () => {
    it('should return correct dimensions for MINIMAL template', async () => {
      const input = { ...mockShareCardInput, template: 'MINIMAL' as const }
      const result = await badgeCardService.generateCard(input)
      expect(result.dimensions).toEqual({ width: 1200, height: 630 })
    })

    it('should return correct dimensions for DETAILED template', async () => {
      const input = { ...mockShareCardInput, template: 'DETAILED' as const }
      const result = await badgeCardService.generateCard(input)
      expect(result.dimensions).toEqual({ width: 1200, height: 630 })
    })

    it('should return correct dimensions for VISUAL template', async () => {
      const input = { ...mockShareCardInput, template: 'VISUAL' as const }
      const result = await badgeCardService.generateCard(input)
      expect(result.dimensions).toEqual({ width: 1200, height: 630 })
    })

    it('should return correct dimensions for COMPARISON template', async () => {
      const input = { ...mockShareCardInput, template: 'COMPARISON' as const }
      const result = await badgeCardService.generateCard(input)
      expect(result.dimensions).toEqual({ width: 1200, height: 630 })
    })

    it('should return correct dimensions for STORY template', async () => {
      const input = { ...mockShareCardInput, template: 'STORY' as const }
      const result = await badgeCardService.generateCard(input)
      expect(result.dimensions).toEqual({ width: 1080, height: 1920 })
    })
  })

  describe('special characters handling', () => {
    it('should escape XML special characters in text', async () => {
      const input: ShareCardInput = {
        ...mockShareCardInput,
        resultTitle: 'Test & <Special> "Characters"',
        testTitle: "Test's Title with 'quotes'",
      }

      const result = await badgeCardService.generateCard(input)

      expect(result).toBeDefined()
      expect(result.imageUrl).toBeDefined()
    })
  })
})
