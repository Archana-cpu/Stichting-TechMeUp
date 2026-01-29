// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - FILE UPLOAD SERVICE (S3 Presigned URLs)
// ══════════════════════════════════════════════════════════════════════════════

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UploadConfig {
  maxSizeBytes: number
  allowedMimeTypes: string[]
  expiresIn: number // seconds
}

export interface PresignedUrlResult {
  uploadUrl: string
  fileKey: string
  publicUrl: string
  expiresAt: Date
}

export interface UploadConfirmation {
  fileKey: string
  url: string
  contentType: string
  size: number
}

export type UploadType = 'avatar' | 'poll_image' | 'organization_logo' | 'attachment'

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const UPLOAD_CONFIGS: Record<UploadType, UploadConfig> = {
  avatar: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    expiresIn: 300, // 5 minutes
  },
  poll_image: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    expiresIn: 300,
  },
  organization_logo: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    expiresIn: 300,
  },
  attachment: {
    maxSizeBytes: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/csv',
    ],
    expiresIn: 600, // 10 minutes
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// S3 Client (Lazy initialization)
// ─────────────────────────────────────────────────────────────────────────────

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    const region = process.env['AWS_REGION'] || 'us-east-1'
    const accessKeyId = process.env['AWS_ACCESS_KEY_ID']
    const secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY']
    const endpoint = process.env['S3_ENDPOINT'] // For S3-compatible services like MinIO

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured')
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      ...(endpoint && { endpoint, forcePathStyle: true }),
    })
  }
  return s3Client
}

function getBucketName(): string {
  const bucket = process.env['S3_BUCKET']
  if (!bucket) {
    throw new Error('S3_BUCKET not configured')
  }
  return bucket
}

function getCdnUrl(): string {
  return process.env['CDN_URL'] || `https://${getBucketName()}.s3.amazonaws.com`
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Class
// ─────────────────────────────────────────────────────────────────────────────

class UploadService {
  /**
   * Validate upload request
   */
  validateUpload(
    uploadType: UploadType,
    contentType: string,
    contentLength: number
  ): { valid: boolean; error?: string } {
    const config = UPLOAD_CONFIGS[uploadType]
    if (!config) {
      return { valid: false, error: 'Invalid upload type' }
    }

    if (!config.allowedMimeTypes.includes(contentType)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${config.allowedMimeTypes.join(', ')}`,
      }
    }

    if (contentLength > config.maxSizeBytes) {
      const maxMB = Math.round(config.maxSizeBytes / 1024 / 1024)
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxMB}MB`,
      }
    }

    return { valid: true }
  }

  /**
   * Generate presigned URL for upload
   */
  async getPresignedUploadUrl(
    userId: string,
    uploadType: UploadType,
    contentType: string,
    filename: string
  ): Promise<PresignedUrlResult> {
    const config = UPLOAD_CONFIGS[uploadType]
    const client = getS3Client()
    const bucket = getBucketName()

    // Generate unique file key with path structure
    const ext = filename.split('.').pop() || this.getExtensionFromMime(contentType)
    const uniqueId = uuidv4()
    const fileKey = `${uploadType}s/${userId}/${uniqueId}.${ext}`

    // Create presigned URL
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      ContentType: contentType,
      // Metadata for tracking
      Metadata: {
        'user-id': userId,
        'upload-type': uploadType,
        'original-filename': encodeURIComponent(filename),
      },
    })

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: config.expiresIn,
    })

    const expiresAt = new Date(Date.now() + config.expiresIn * 1000)
    const publicUrl = `${getCdnUrl()}/${fileKey}`

    return {
      uploadUrl,
      fileKey,
      publicUrl,
      expiresAt,
    }
  }

  /**
   * Generate presigned URL for download (private files)
   */
  async getPresignedDownloadUrl(
    fileKey: string,
    expiresIn: number = 3600 // 1 hour
  ): Promise<string> {
    const client = getS3Client()
    const bucket = getBucketName()

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    })

    return getSignedUrl(client, command, { expiresIn })
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(fileKey: string): Promise<void> {
    const client = getS3Client()
    const bucket = getBucketName()

    await client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    }))
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(fileKey: string): string {
    return `${getCdnUrl()}/${fileKey}`
  }

  /**
   * Extract file key from full URL
   */
  extractFileKey(url: string): string | null {
    const cdnUrl = getCdnUrl()
    if (url.startsWith(cdnUrl)) {
      return url.slice(cdnUrl.length + 1)
    }
    // Try to extract from S3 URL pattern
    const match = url.match(/\.s3\.[^/]+\.amazonaws\.com\/(.+)$/)
    return match ? (match[1] ?? null) : null
  }

  /**
   * Get MIME extension mapping
   */
  private getExtensionFromMime(mimeType: string): string {
    const mapping: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'text/csv': 'csv',
    }
    return mapping[mimeType] || 'bin'
  }

  /**
   * Get upload configuration
   */
  getUploadConfig(uploadType: UploadType): UploadConfig {
    return UPLOAD_CONFIGS[uploadType]
  }

  /**
   * Get all supported upload types and their configs
   */
  getSupportedTypes(): Record<UploadType, UploadConfig> {
    return { ...UPLOAD_CONFIGS }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Export Singleton
// ─────────────────────────────────────────────────────────────────────────────

export const uploadService = new UploadService()
