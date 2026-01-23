import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// MOCKS - Use vi.hoisted to ensure variables are available during mock hoisting
// ============================================================================

const { mockAuthFn, mockRateLimitFn, mockPersonDb, mockSequenceDb } = vi.hoisted(() => ({
  mockAuthFn: vi.fn(),
  mockRateLimitFn: vi.fn(),
  mockPersonDb: {
    create: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  mockSequenceDb: {
    aggregate: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}));

// Mock modules
vi.mock('@seq/auth', () => ({
  auth: () => mockAuthFn(),
}));

vi.mock('@seq/database', () => ({
  db: {
    person: mockPersonDb,
    sequence: mockSequenceDb,
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: () => mockRateLimitFn(),
  RATE_LIMITS: {
    'person:create': { uniqueTokenPerInterval: 20, interval: 60 },
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
import { createPerson, updatePerson, deletePerson, getPeople } from '@/app/actions';

// ============================================================================
// TEST DATA
// ============================================================================

const validPersonInput = {
  name: 'John Doe',
  relationship: 'friend' as const,
  notes: 'A good friend',
};

// ============================================================================
// TESTS
// ============================================================================

describe('People Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock return values
    mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
  });

  describe('createPerson', () => {
    it('yetkisiz kullanıcı için UNAUTHORIZED dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await createPerson(validPersonInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED');
      }
    });

    it('boş name için VALIDATION_ERROR dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });

      const result = await createPerson({
        ...validPersonInput,
        name: '', // Boş name
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR');
      }
    });

    it('geçersiz relationship için VALIDATION_ERROR dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });

      const result = await createPerson({
        name: 'Test',
        relationship: 'invalid' as any,
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
        limit: 20,
      });

      const result = await createPerson(validPersonInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('RATE_LIMITED');
      }
    });

    it('başarılı oluşturma person ID dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockPersonDb.create.mockResolvedValue({ id: 'person123' });

      const result = await createPerson(validPersonInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.id).toBe('person123');
      }
    });

    it('userId doğru atanmalı', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockPersonDb.create.mockResolvedValue({ id: 'person123' });

      await createPerson(validPersonInput);

      expect(mockPersonDb.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user1',
          }),
        })
      );
    });
  });

  describe('updatePerson', () => {
    it('yetkisiz kullanıcı için UNAUTHORIZED dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await updatePerson('person123', { name: 'New Name' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED');
      }
    });

    it("başka kullanıcının person'ı için NOT_FOUND dönmeli", async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user2' });

      const result = await updatePerson('person123', { name: 'New Name' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND');
      }
    });

    it("olmayan person için NOT_FOUND dönmeli", async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockPersonDb.findUnique.mockResolvedValue(null);

      const result = await updatePerson('nonexistent', { name: 'New Name' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND');
      }
    });

    it('başarılı güncelleme', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user1' });
      mockPersonDb.update.mockResolvedValue({ id: 'person123' });

      const result = await updatePerson('person123', { name: 'New Name' });

      expect(result.success).toBe(true);
    });
  });

  describe('deletePerson', () => {
    it('yetkisiz kullanıcı için UNAUTHORIZED dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await deletePerson('person123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED');
      }
    });

    it("başka kullanıcının person'ı için NOT_FOUND dönmeli", async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user2' });

      const result = await deletePerson('person123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND');
      }
    });

    it('başarılı silme', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user1' });
      mockPersonDb.delete.mockResolvedValue({ id: 'person123' });

      const result = await deletePerson('person123');

      expect(result.success).toBe(true);
      expect(mockPersonDb.delete).toHaveBeenCalledWith({
        where: { id: 'person123' },
      });
    });
  });

  describe('getPeople', () => {
    it('yetkisiz kullanıcı için boş array dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await getPeople();

      expect(result).toEqual([]);
    });

    it("kullanıcının person'ları dönmeli", async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      const mockPeople = [
        { id: 'person1', name: 'John' },
        { id: 'person2', name: 'Jane' },
      ];
      mockPersonDb.findMany.mockResolvedValue(mockPeople);

      const result = await getPeople();

      expect(result).toEqual(mockPeople);
      expect(mockPersonDb.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1' },
        })
      );
    });
  });
});
