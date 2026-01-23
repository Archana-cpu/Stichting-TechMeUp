import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  isStorageConfigured,
  getKeyFromUrl,
} from '@/lib/storage';

// Mock AWS S3 Client
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({})),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://mock-signed-url.com'),
}));

describe('Storage Constants', () => {
  describe('ALLOWED_IMAGE_TYPES', () => {
    it('jpeg dahil olmalı', () => {
      expect(ALLOWED_IMAGE_TYPES).toContain('image/jpeg');
    });

    it('png dahil olmalı', () => {
      expect(ALLOWED_IMAGE_TYPES).toContain('image/png');
    });

    it('webp dahil olmalı', () => {
      expect(ALLOWED_IMAGE_TYPES).toContain('image/webp');
    });

    it('gif dahil olmalı', () => {
      expect(ALLOWED_IMAGE_TYPES).toContain('image/gif');
    });
  });

  describe('MAX_FILE_SIZE', () => {
    it('10MB olmalı', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });
  });
});

describe('isStorageConfigured', () => {
  it('R2 configure edilmemişse falsy döndürmeli', () => {
    // Environment variables set olmadığı için false/undefined dönmeli
    // Bu test environment'ta R2 config yok
    const result = isStorageConfigured();
    // R2 config yoksa falsy değer döner
    expect(result).toBeFalsy();
  });
});

describe('getKeyFromUrl', () => {
  it('null döndürmeli boş URL için', () => {
    expect(getKeyFromUrl('')).toBeNull();
  });

  it('URL\'den key çıkarmalı', () => {
    const url = 'https://bucket.r2.cloudflarestorage.com/images/user1/123-abc.jpg';
    const result = getKeyFromUrl(url);
    expect(result).toBe('images/user1/123-abc.jpg');
  });

  it('geçersiz URL için null döndürmeli', () => {
    const result = getKeyFromUrl('not-a-valid-url');
    expect(result).toBeNull();
  });
});
