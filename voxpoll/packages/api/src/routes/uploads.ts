// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - FILE UPLOAD ROUTES
// ══════════════════════════════════════════════════════════════════════════════

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { auth } from '../middleware/auth'
import { rateLimit, RATE_LIMITS } from '../middleware/rate-limit'
import { uploadService, type UploadType } from '../services/upload.service'
import type { AppEnv } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Validators
// ─────────────────────────────────────────────────────────────────────────────

const presignedUrlSchema = z.object({
  uploadType: z.enum(['avatar', 'poll_image', 'organization_logo', 'attachment']),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  contentLength: z.number().int().positive(),
})

const deleteFileSchema = z.object({
  fileKey: z.string().min(1),
})

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

export const uploadRoutes = new Hono<AppEnv>()

// All routes require authentication
uploadRoutes.use('*', auth)

/**
 * POST /uploads/presigned-url
 * Get a presigned URL for uploading a file
 */
uploadRoutes.post(
  '/presigned-url',
  rateLimit(RATE_LIMITS.upload),
  zValidator('json', presignedUrlSchema),
  async (c) => {
    const user = c.get('user')!
    const { uploadType, filename, contentType, contentLength } = c.req.valid('json')

    // Validate the upload
    const validation = uploadService.validateUpload(
      uploadType as UploadType,
      contentType,
      contentLength
    )

    if (!validation.valid) {
      return c.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error,
        },
      }, 400)
    }

    try {
      const result = await uploadService.getPresignedUploadUrl(
        user.id,
        uploadType as UploadType,
        contentType,
        filename
      )

      return c.json({
        success: true,
        data: {
          uploadUrl: result.uploadUrl,
          fileKey: result.fileKey,
          publicUrl: result.publicUrl,
          expiresAt: result.expiresAt.toISOString(),
        },
      })
    } catch (error) {
      console.error('[Upload] Presigned URL error:', error)
      return c.json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Failed to generate upload URL',
        },
      }, 500)
    }
  }
)

/**
 * POST /uploads/avatar
 * Shortcut for avatar upload (applies stricter rate limit)
 */
uploadRoutes.post(
  '/avatar',
  rateLimit(RATE_LIMITS.avatarUpload),
  zValidator('json', z.object({
    filename: z.string().min(1).max(255),
    contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    contentLength: z.number().int().positive().max(5 * 1024 * 1024), // 5MB max
  })),
  async (c) => {
    const user = c.get('user')!
    const { filename, contentType, contentLength } = c.req.valid('json')

    try {
      const result = await uploadService.getPresignedUploadUrl(
        user.id,
        'avatar',
        contentType,
        filename
      )

      return c.json({
        success: true,
        data: {
          uploadUrl: result.uploadUrl,
          fileKey: result.fileKey,
          publicUrl: result.publicUrl,
          expiresAt: result.expiresAt.toISOString(),
        },
      })
    } catch (error) {
      console.error('[Upload] Avatar presigned URL error:', error)
      return c.json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Failed to generate upload URL',
        },
      }, 500)
    }
  }
)

/**
 * DELETE /uploads/:fileKey
 * Delete an uploaded file (only owner can delete)
 */
uploadRoutes.delete(
  '/:fileKey{.+}',
  async (c) => {
    const user = c.get('user')!
    const fileKey = c.req.param('fileKey')

    // Verify ownership by checking if fileKey contains user ID
    if (!fileKey.includes(user.id)) {
      return c.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own files',
        },
      }, 403)
    }

    try {
      await uploadService.deleteFile(fileKey)

      return c.json({
        success: true,
        data: {
          message: 'File deleted successfully',
        },
      })
    } catch (error) {
      console.error('[Upload] Delete file error:', error)
      return c.json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete file',
        },
      }, 500)
    }
  }
)

/**
 * GET /uploads/config
 * Get upload configuration (allowed types, sizes)
 */
uploadRoutes.get('/config', async (c) => {
  const configs = uploadService.getSupportedTypes()

  const formatted = Object.entries(configs).map(([type, config]) => ({
    type,
    maxSizeMB: Math.round(config.maxSizeBytes / 1024 / 1024),
    maxSizeBytes: config.maxSizeBytes,
    allowedMimeTypes: config.allowedMimeTypes,
  }))

  return c.json({
    success: true,
    data: formatted,
  })
})

/**
 * POST /uploads/download-url
 * Get a presigned download URL for a private file
 */
uploadRoutes.post(
  '/download-url',
  zValidator('json', z.object({
    fileKey: z.string().min(1),
    expiresIn: z.number().int().positive().max(86400).optional(), // Max 24 hours
  })),
  async (c) => {
    const user = c.get('user')!
    const { fileKey, expiresIn } = c.req.valid('json')

    // Verify ownership or access rights
    if (!fileKey.includes(user.id)) {
      return c.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this file',
        },
      }, 403)
    }

    try {
      const downloadUrl = await uploadService.getPresignedDownloadUrl(
        fileKey,
        expiresIn || 3600
      )

      return c.json({
        success: true,
        data: {
          downloadUrl,
          expiresIn: expiresIn || 3600,
        },
      })
    } catch (error) {
      console.error('[Upload] Download URL error:', error)
      return c.json({
        success: false,
        error: {
          code: 'DOWNLOAD_ERROR',
          message: 'Failed to generate download URL',
        },
      }, 500)
    }
  }
)
