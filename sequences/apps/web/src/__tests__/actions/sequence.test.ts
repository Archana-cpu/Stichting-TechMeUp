import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// MOCKS - Use vi.hoisted to ensure variables are available during mock hoisting
// ============================================================================

const { mockAuthFn, mockRateLimitFn, mockSequenceDb, mockTransactionFn } = vi.hoisted(() => ({
  mockAuthFn: vi.fn(),
  mockRateLimitFn: vi.fn(),
  mockSequenceDb: {
    create: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    aggregate: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  mockTransactionFn: vi.fn(),
}));

// Mock modules
vi.mock('@seq/auth', () => ({
  auth: () => mockAuthFn(),
}));

vi.mock('@seq/database', () => ({
  db: {
    sequence: mockSequenceDb,
    $transaction: mockTransactionFn,
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: () => mockRateLimitFn(),
  RATE_LIMITS: {
    'sequence:create': { uniqueTokenPerInterval: 10, interval: 60 },
    'sequence:update': { uniqueTokenPerInterval: 30, interval: 60 },
    'sequence:delete': { uniqueTokenPerInterval: 5, interval: 60 },
    'person:update': { uniqueTokenPerInterval: 60, interval: 60 },
  },
}));

vi.mock('@/lib/sanitize', () => ({
  sanitizeHtml: (s: string) => s,
  sanitizeText: (s: string) => s?.trim() || '',
}));

vi.mock('@/lib/storage', () => ({
  createUploadUrl: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendVerificationEmail: vi.fn(),
  generateVerificationCode: () => '123456',
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Import actions after mocks are set up
import { createSequence, deleteSequence, getSequences, updateSequencePosition } from '@/app/actions';

// ============================================================================
// TEST DATA
// ============================================================================

// Use 'any' for test data since we're testing Zod validation which handles transforms
const validSequenceInput: any = {
  eventDate: new Date().toISOString(),
  title: 'Test Sequence',
  summary: 'This is a test summary for the sequence.',
  emotionId: 1,
  emotionPolarity: 0,
  emotionIntensity: 5,
  triggerId: 1,
  thoughtContent: 'Test thought content',
  thoughtPolarity: 0,
  thoughtIntensity: 5,
  behaviorContent: 'Test behavior content',
  behaviorPolarity: 0,
  behaviorImpact: 5,
  isPublic: false,
};

// ============================================================================
// TESTS
// ============================================================================

describe('Sequence Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock return values
    mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
  });

  describe('createSequence', () => {
    it('yetkisiz kullanıcı için UNAUTHORIZED dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await createSequence(validSequenceInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED');
      }
    });

    it('boş title için VALIDATION_ERROR dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });

      const result = await createSequence({
        ...validSequenceInput,
        title: '', // Boş title
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR');
      }
    });

    it('200 karakterden uzun title için VALIDATION_ERROR dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });

      const result = await createSequence({
        ...validSequenceInput,
        title: 'a'.repeat(201), // 201 karakter
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR');
      }
    });

    it('geçersiz emotionPolarity için VALIDATION_ERROR dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });

      const result = await createSequence({
        ...validSequenceInput,
        emotionPolarity: 100, // -50 to 50 dışında
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR');
      }
    });

    it('rate limit aşıldığında RATE_LIMITED dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({
        success: false,
        remaining: 0,
        reset: Date.now() + 60000,
        limit: 10,
      });

      const result = await createSequence(validSequenceInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('RATE_LIMITED');
      }
    });

    it('başarılı oluşturma sequence ID dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockSequenceDb.aggregate.mockResolvedValue({
        _max: { storyboardOrder: 5 },
      });
      mockSequenceDb.create.mockResolvedValue({ id: 'seq123' });

      const result = await createSequence(validSequenceInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.id).toBe('seq123');
      }
    });

    it('storyboardOrder doğru hesaplanmalı', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockSequenceDb.aggregate.mockResolvedValue({
        _max: { storyboardOrder: 10 },
      });
      mockSequenceDb.create.mockResolvedValue({ id: 'seq123' });

      await createSequence(validSequenceInput);

      expect(mockSequenceDb.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            storyboardOrder: 11, // 10 + 1
          }),
        })
      );
    });
  });

  describe('deleteSequence', () => {
    it("başka kullanıcının sequence'ı için FORBIDDEN dönmeli", async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockSequenceDb.findUnique.mockResolvedValue({ userId: 'user2' }); // Farklı user

      const result = await deleteSequence('seq123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('FORBIDDEN');
      }
    });

    it('olmayan sequence için NOT_FOUND dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockSequenceDb.findUnique.mockResolvedValue(null);

      const result = await deleteSequence('nonexistent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND');
      }
    });

    it("kendi sequence'ı başarıyla silinmeli", async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockSequenceDb.findUnique.mockResolvedValue({ userId: 'user1' });
      mockSequenceDb.delete.mockResolvedValue({ id: 'seq123' });

      const result = await deleteSequence('seq123');

      expect(result.success).toBe(true);
      expect(mockSequenceDb.delete).toHaveBeenCalledWith({
        where: { id: 'seq123' },
      });
    });
  });

  describe('getSequences', () => {
    it('yetkisiz kullanıcı için boş array dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await getSequences();

      expect(result).toEqual([]);
    });

    it("doğru sıralama ile sequence'lar dönmeli", async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockSequenceDb.findMany.mockResolvedValue([
        { id: 'seq1', storyboardOrder: 1 },
        { id: 'seq2', storyboardOrder: 2 },
      ]);

      await getSequences();

      expect(mockSequenceDb.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { storyboardOrder: 'asc' },
        })
      );
    });
  });

  describe('updateSequencePosition', () => {
    it('yetkisiz kullanıcı için UNAUTHORIZED dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await updateSequencePosition({
        id: 'seq123',
        positionX: 100,
        positionY: 200,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED');
      }
    });

    it('rate limit aşıldığında RATE_LIMITED dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({
        success: false,
        remaining: 0,
        reset: Date.now() + 60000,
        limit: 60,
      });

      const result = await updateSequencePosition({
        id: 'seq123',
        positionX: 100,
        positionY: 200,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('RATE_LIMITED');
      }
    });

    it("başka kullanıcının sequence'ı için NOT_FOUND dönmeli", async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 59 });
      mockSequenceDb.findUnique.mockResolvedValue({ userId: 'user2' });

      const result = await updateSequencePosition({
        id: 'seq123',
        positionX: 100,
        positionY: 200,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND');
      }
    });

    it('pozisyon başarıyla güncellenmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 59 });
      mockSequenceDb.findUnique.mockResolvedValue({ userId: 'user1' });
      mockSequenceDb.update.mockResolvedValue({ id: 'seq123' });

      const result = await updateSequencePosition({
        id: 'seq123',
        positionX: 100,
        positionY: 200,
      });

      expect(result.success).toBe(true);
      expect(mockSequenceDb.update).toHaveBeenCalledWith({
        where: { id: 'seq123' },
        data: { positionX: 100, positionY: 200 },
      });
    });
  });
});
