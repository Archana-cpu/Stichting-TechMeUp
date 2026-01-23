import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { sanitizeFilename } from './sanitize';

// ============================================================================
// CONFIGURATION
// ============================================================================

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'sequences';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Check if R2 is configured
const isR2Configured = R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY;

// S3 Client for Cloudflare R2
const s3Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

// ============================================================================
// CONSTANTS
// ============================================================================

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

// ============================================================================
// TYPES
// ============================================================================

export type UploadUrlResult = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
};

export type StorageError = {
  code: 'NOT_CONFIGURED' | 'INVALID_TYPE' | 'SIZE_EXCEEDED' | 'UPLOAD_FAILED' | 'DELETE_FAILED';
  message: string;
};

// ============================================================================
// HELPERS
// ============================================================================

function generateKey(userId: string, filename: string, folder: string = 'images'): string {
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(filename);
  const extension = sanitized.split('.').pop() || 'jpg';
  const uniqueId = Math.random().toString(36).substring(2, 8);
  return `${folder}/${userId}/${timestamp}-${uniqueId}.${extension}`;
}

function validateFile(contentType: string, size: number): StorageError | null {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType as AllowedImageType)) {
    return {
      code: 'INVALID_TYPE',
      message: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  if (size > MAX_FILE_SIZE) {
    return {
      code: 'SIZE_EXCEEDED',
      message: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return null;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Create a presigned URL for uploading a file to R2
 */
export async function createUploadUrl(
  userId: string,
  filename: string,
  contentType: string,
  size: number,
  folder: string = 'images'
): Promise<{ success: true; data: UploadUrlResult } | { success: false; error: StorageError }> {
  // Check if R2 is configured
  if (!s3Client) {
    return {
      success: false,
      error: {
        code: 'NOT_CONFIGURED',
        message: 'R2 storage is not configured',
      },
    };
  }

  // Validate file
  const validationError = validateFile(contentType, size);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const key = generateKey(userId, filename, folder);

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Construct public URL
    const publicUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

    return {
      success: true,
      data: {
        uploadUrl,
        publicUrl,
        key,
      },
    };
  } catch (error) {
    console.error('Failed to create upload URL:', error);
    return {
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to create upload URL',
      },
    };
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<{ success: true } | { success: false; error: StorageError }> {
  if (!s3Client) {
    return {
      success: false,
      error: {
        code: 'NOT_CONFIGURED',
        message: 'R2 storage is not configured',
      },
    };
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete file:', error);
    return {
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete file',
      },
    };
  }
}

/**
 * Get a signed URL for reading a private file
 */
export async function getReadUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
  if (!s3Client) {
    return null;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Failed to get read URL:', error);
    return null;
  }
}

/**
 * Extract the key from a public URL
 */
export function getKeyFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    // Remove leading slash
    return urlObj.pathname.slice(1);
  } catch {
    return null;
  }
}

/**
 * Check if R2 storage is configured
 */
export function isStorageConfigured(): boolean {
  return isR2Configured;
}
