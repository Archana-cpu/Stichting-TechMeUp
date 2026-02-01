// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - BADGE CARD SERVICE
// Business logic for generating shareable badge cards
// ══════════════════════════════════════════════════════════════════════════════

import sharp from 'sharp'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ShareCardTemplate = 'MINIMAL' | 'DETAILED' | 'VISUAL' | 'COMPARISON' | 'STORY'

export interface ShareCardInput {
  testId: string
  resultId: string
  userId: string | null
  resultTitle: string
  resultDescription?: string
  resultImageUrl?: string
  testTitle: string
  matchPercentage?: number
  template: ShareCardTemplate
  comparisonData?: {
    userResult: string
    results: { label: string; percentage: number }[]
  }
}

export interface ShareCard {
  imageUrl: string
  dimensions: { width: number; height: number }
  metadata: {
    ogTitle: string
    ogDescription: string
    ogImage: string
    twitterCard: 'summary_large_image'
  }
  shareUrls: {
    twitter: string
    facebook: string
    whatsapp: string
    telegram: string
    copyLink: string
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CARD_DIMENSIONS = {
  MINIMAL: { width: 1200, height: 630 },
  DETAILED: { width: 1200, height: 630 },
  VISUAL: { width: 1200, height: 630 },
  COMPARISON: { width: 1200, height: 630 },
  STORY: { width: 1080, height: 1920 },
}

const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  background: '#ffffff',
  text: '#1f2937',
  textLight: '#6b7280',
  border: '#e5e7eb',
}

const FONTS = {
  heading: 'Arial Bold',
  body: 'Arial',
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge Card Service Class
// ─────────────────────────────────────────────────────────────────────────────

class BadgeCardServiceClass {
  private s3Client: S3Client | null = null

  constructor() {
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
      })
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Generate Card
  // ─────────────────────────────────────────────────────────────────────────────

  async generateCard(input: ShareCardInput): Promise<ShareCard> {
    const imageBuffer = await this.generateImage(input)

    const imageUrl = await this.uploadImage(imageBuffer, input.testId, input.resultId, input.template)

    const metadata = this.generateMetadata(input, imageUrl)

    const shareUrls = this.generateShareUrls(input, imageUrl)

    return {
      imageUrl,
      dimensions: CARD_DIMENSIONS[input.template],
      metadata,
      shareUrls,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Generate Image Based on Template
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateImage(input: ShareCardInput): Promise<Buffer> {
    switch (input.template) {
      case 'MINIMAL':
        return this.generateMinimalCard(input)
      case 'DETAILED':
        return this.generateDetailedCard(input)
      case 'VISUAL':
        return this.generateVisualCard(input)
      case 'COMPARISON':
        return this.generateComparisonCard(input)
      case 'STORY':
        return this.generateStoryCard(input)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Template: Minimal Card (Clean Design)
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateMinimalCard(input: ShareCardInput): Promise<Buffer> {
    const { width, height } = CARD_DIMENSIONS.MINIMAL

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#grad)" />

        <text x="${width / 2}" y="${height / 2 - 30}"
              font-family="${FONTS.heading}" font-size="72" fill="white"
              text-anchor="middle" font-weight="bold">
          ${this.escapeXml(input.resultTitle)}
        </text>

        <text x="${width / 2}" y="${height / 2 + 40}"
              font-family="${FONTS.body}" font-size="36" fill="white"
              text-anchor="middle" opacity="0.9">
          ${this.escapeXml(input.testTitle)}
        </text>

        <text x="${width / 2}" y="${height - 80}"
              font-family="${FONTS.body}" font-size="24" fill="white"
              text-anchor="middle" opacity="0.7">
          voxpoll.com
        </text>
      </svg>
    `

    return sharp(Buffer.from(svg)).png().toBuffer()
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Template: Detailed Card (Result + Description)
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateDetailedCard(input: ShareCardInput): Promise<Buffer> {
    const { width, height } = CARD_DIMENSIONS.DETAILED
    const description = input.resultDescription || ''
    const truncatedDesc = this.truncateText(description, 150)

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${COLORS.background}" />

        <rect x="0" y="0" width="${width}" height="160" fill="${COLORS.primary}" />

        <text x="60" y="100"
              font-family="${FONTS.heading}" font-size="64" fill="white"
              font-weight="bold">
          ${this.escapeXml(input.resultTitle)}
        </text>

        <text x="60" y="240"
              font-family="${FONTS.body}" font-size="32" fill="${COLORS.text}">
          ${this.escapeXml(input.testTitle)}
        </text>

        ${this.renderMultilineText(truncatedDesc, 60, 320, 32, COLORS.textLight, width - 120)}

        ${input.matchPercentage ? `
          <rect x="60" y="${height - 180}" width="400" height="100" rx="12" fill="${COLORS.primary}" opacity="0.1" />
          <text x="260" y="${height - 115}"
                font-family="${FONTS.heading}" font-size="48" fill="${COLORS.primary}"
                text-anchor="middle" font-weight="bold">
            ${input.matchPercentage}% Match
          </text>
        ` : ''}

        <text x="${width - 60}" y="${height - 60}"
              font-family="${FONTS.body}" font-size="24" fill="${COLORS.textLight}"
              text-anchor="end">
          voxpoll.com
        </text>
      </svg>
    `

    return sharp(Buffer.from(svg)).png().toBuffer()
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Template: Visual Card (Full Image Card)
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateVisualCard(input: ShareCardInput): Promise<Buffer> {
    const { width, height } = CARD_DIMENSIONS.VISUAL

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#grad)" />

        <rect x="${width / 2 - 250}" y="${height / 2 - 250}"
              width="500" height="500" rx="250"
              fill="white" opacity="0.2" />

        <text x="${width / 2}" y="${height / 2 - 30}"
              font-family="${FONTS.heading}" font-size="96" fill="white"
              text-anchor="middle" font-weight="bold">
          ${this.escapeXml(input.resultTitle)}
        </text>

        <text x="${width / 2}" y="${height / 2 + 50}"
              font-family="${FONTS.body}" font-size="36" fill="white"
              text-anchor="middle" opacity="0.9">
          ${this.escapeXml(input.testTitle)}
        </text>

        <rect x="${width / 2 - 150}" y="${height - 180}"
              width="300" height="80" rx="40"
              fill="white" opacity="0.2" />
        <text x="${width / 2}" y="${height - 125}"
              font-family="${FONTS.body}" font-size="32" fill="white"
              text-anchor="middle">
          voxpoll.com
        </text>
      </svg>
    `

    return sharp(Buffer.from(svg)).png().toBuffer()
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Template: Comparison Card (User vs Population)
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateComparisonCard(input: ShareCardInput): Promise<Buffer> {
    const { width, height } = CARD_DIMENSIONS.COMPARISON
    const compData = input.comparisonData

    if (!compData) {
      return this.generateDetailedCard(input)
    }

    const barHeight = 40
    const barSpacing = 60
    const startY = 280
    const maxBarWidth = width - 400

    const bars = compData.results.map((result, index) => {
      const barWidth = (result.percentage / 100) * maxBarWidth
      const y = startY + index * (barHeight + barSpacing)
      const isUserResult = result.label === compData.userResult
      const fillColor = isUserResult ? COLORS.primary : COLORS.border

      return `
        <rect x="280" y="${y}" width="${barWidth}" height="${barHeight}" rx="8" fill="${fillColor}" />
        <text x="60" y="${y + 28}" font-family="${FONTS.body}" font-size="28" fill="${COLORS.text}">
          ${this.escapeXml(result.label)}
        </text>
        <text x="${width - 60}" y="${y + 28}" font-family="${FONTS.body}" font-size="28" fill="${COLORS.text}" text-anchor="end">
          ${result.percentage}%
        </text>
        ${isUserResult ? `
          <text x="260" y="${y + 28}" font-family="${FONTS.body}" font-size="24" fill="${COLORS.primary}" text-anchor="end" font-weight="bold">
            ← You
          </text>
        ` : ''}
      `
    }).join('')

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${COLORS.background}" />

        <rect x="0" y="0" width="${width}" height="200" fill="${COLORS.primary}" />

        <text x="60" y="80" font-family="${FONTS.heading}" font-size="56" fill="white" font-weight="bold">
          ${this.escapeXml(input.resultTitle)}
        </text>
        <text x="60" y="140" font-family="${FONTS.body}" font-size="32" fill="white" opacity="0.9">
          ${this.escapeXml(input.testTitle)}
        </text>

        <text x="60" y="240" font-family="${FONTS.body}" font-size="28" fill="${COLORS.textLight}">
          How You Compare
        </text>

        ${bars}

        <text x="${width - 60}" y="${height - 40}" font-family="${FONTS.body}" font-size="24" fill="${COLORS.textLight}" text-anchor="end">
          voxpoll.com
        </text>
      </svg>
    `

    return sharp(Buffer.from(svg)).png().toBuffer()
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Template: Story Card (Instagram Stories Format)
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateStoryCard(input: ShareCardInput): Promise<Buffer> {
    const { width, height } = CARD_DIMENSIONS.STORY

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="storyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#storyGrad)" />

        <rect x="${width / 2 - 300}" y="${height / 2 - 300}"
              width="600" height="600" rx="300"
              fill="white" opacity="0.15" />

        <text x="${width / 2}" y="${height / 2 - 100}"
              font-family="${FONTS.heading}" font-size="120" fill="white"
              text-anchor="middle" font-weight="bold">
          ${this.escapeXml(input.resultTitle)}
        </text>

        <text x="${width / 2}" y="${height / 2 + 50}"
              font-family="${FONTS.body}" font-size="48" fill="white"
              text-anchor="middle" opacity="0.9">
          ${this.escapeXml(input.testTitle)}
        </text>

        ${input.matchPercentage ? `
          <text x="${width / 2}" y="${height / 2 + 150}"
                font-family="${FONTS.heading}" font-size="72" fill="white"
                text-anchor="middle" font-weight="bold" opacity="0.95">
            ${input.matchPercentage}% Match
          </text>
        ` : ''}

        <rect x="${width / 2 - 200}" y="${height - 300}"
              width="400" height="100" rx="50"
              fill="white" opacity="0.2" />
        <text x="${width / 2}" y="${height - 235}"
              font-family="${FONTS.body}" font-size="48" fill="white"
              text-anchor="middle">
          voxpoll.com
        </text>
      </svg>
    `

    return sharp(Buffer.from(svg)).png().toBuffer()
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Upload Image to S3
  // ─────────────────────────────────────────────────────────────────────────────

  private async uploadImage(
    imageBuffer: Buffer,
    testId: string,
    resultId: string,
    template: ShareCardTemplate
  ): Promise<string> {
    const filename = `badge-cards/${testId}/${resultId}_${template.toLowerCase()}.png`

    if (this.s3Client && process.env.AWS_S3_BUCKET) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: filename,
          Body: imageBuffer,
          ContentType: 'image/png',
          CacheControl: 'public, max-age=31536000',
        })
      )

      const cdnUrl = process.env.AWS_CLOUDFRONT_URL || `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com`
      return `${cdnUrl}/${filename}`
    }

    return `/api/badge-cards/${testId}/${resultId}/${template.toLowerCase()}`
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Generate Metadata
  // ─────────────────────────────────────────────────────────────────────────────

  private generateMetadata(input: ShareCardInput, imageUrl: string) {
    const ogTitle = `${input.resultTitle} - ${input.testTitle}`
    const ogDescription = input.resultDescription
      ? this.truncateText(input.resultDescription, 200)
      : `I got ${input.resultTitle} on ${input.testTitle}! Take the test to find out your result.`

    return {
      ogTitle,
      ogDescription,
      ogImage: imageUrl,
      twitterCard: 'summary_large_image' as const,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Generate Share URLs
  // ─────────────────────────────────────────────────────────────────────────────

  private generateShareUrls(input: ShareCardInput, imageUrl: string) {
    const baseUrl = process.env.APP_URL || 'https://voxpoll.com'
    const testUrl = `${baseUrl}/tests/${input.testId}`

    const shareText = `I got ${input.resultTitle} on ${input.testTitle}!`
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(testUrl)

    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      copyLink: testUrl,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Escape XML
  // ─────────────────────────────────────────────────────────────────────────────

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Truncate Text
  // ─────────────────────────────────────────────────────────────────────────────

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Render Multiline Text
  // ─────────────────────────────────────────────────────────────────────────────

  private renderMultilineText(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string,
    maxWidth: number
  ): string {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    const avgCharWidth = fontSize * 0.5

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const testWidth = testLine.length * avgCharWidth

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    return lines
      .slice(0, 3)
      .map(
        (line, i) => `
        <text x="${x}" y="${y + i * (fontSize + 10)}"
              font-family="${FONTS.body}" font-size="${fontSize}" fill="${color}">
          ${this.escapeXml(line)}
        </text>
      `
      )
      .join('')
  }
}

export const badgeCardService = new BadgeCardServiceClass()

export { BadgeCardServiceClass as BadgeCardService }
