import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// MOCKS - Use vi.hoisted to ensure variables are available during mock hoisting
// ============================================================================

const { mockAuthFn, mockRateLimitFn, mockInvitationDb } = vi.hoisted(() => ({
  mockAuthFn: vi.fn(),
  mockRateLimitFn: vi.fn(),
  mockInvitationDb: {
    createMany: vi.fn(),
  },
}));

// Mock modules
vi.mock('@seq/auth', () => ({
  auth: () => mockAuthFn(),
}));

vi.mock('@seq/database', () => ({
  db: {
    invitation: mockInvitationDb,
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: () => mockRateLimitFn(),
  RATE_LIMITS: {
    'invitation:send': { uniqueTokenPerInterval: 10, interval: 3600 },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock crypto.randomUUID
const mockRandomUUID = vi.fn(() => 'test-uuid-123');
vi.stubGlobal('crypto', {
  randomUUID: mockRandomUUID,
});

// Import actions after mocks are set up
import { sendInvitations } from '@/app/actions';

// ============================================================================
// TEST DATA
// ============================================================================

const validInvitationInput = {
  emails: ['test1@example.com', 'test2@example.com'],
};

// ============================================================================
// TESTS
// ============================================================================

describe('Invitation Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock return values
    mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
    mockRandomUUID.mockReturnValue('test-uuid-123');
  });

  describe('sendInvitations', () => {
    it('yetkisiz kullanıcı için UNAUTHORIZED dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await sendInvitations(validInvitationInput);

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
        reset: Date.now() + 3600000,
        limit: 10,
      });

      const result = await sendInvitations(validInvitationInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('RATE_LIMITED');
      }
    });

    it('geçersiz email listesi için VALIDATION_ERROR dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });

      const result = await sendInvitations({
        emails: ['invalid-email'], // Geçersiz email
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR');
      }
    });

    it('boş email listesi için başarılı olmalı (boş array kabul edilir)', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockInvitationDb.createMany.mockResolvedValue({ count: 0 }); // Boş array için 0 count

      const result = await sendInvitations({
        emails: [], // Boş liste - Zod bunu kabul eder
      });

      // Boş array kabul edilir, createMany çağrılır ama 0 count döner
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.count).toBe(0);
      }
    });

    it('başarılı invitation oluşturma - inviterId doğru atanmalı', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockInvitationDb.createMany.mockResolvedValue({ count: 2 });

      const result = await sendInvitations(validInvitationInput);

      expect(result.success).toBe(true);
      expect(mockInvitationDb.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              email: 'test1@example.com',
              inviterId: 'user1', // ✓ DOĞRU FIELD ADI (invitedById değil)
              token: expect.any(String), // ✓ TOKEN ZORUNLU FIELD
              expiresAt: expect.any(Date),
            }),
            expect.objectContaining({
              email: 'test2@example.com',
              inviterId: 'user1',
              token: expect.any(String),
              expiresAt: expect.any(Date),
            }),
          ]),
          skipDuplicates: true,
        })
      );
    });

    it('her invitation için unique token oluşturulmalı', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockInvitationDb.createMany.mockResolvedValue({ count: 2 });

      // Mock farklı UUID'ler döndürsün
      const tokens = ['token-1', 'token-2'];
      let callCount = 0;
      mockRandomUUID.mockImplementation(() => tokens[callCount++] || 'default-token');

      await sendInvitations(validInvitationInput);

      const callArgs = mockInvitationDb.createMany.mock.calls[0][0];
      const invitationData = callArgs.data as Array<{ token: string }>;

      // Her invitation'ın farklı token'ı olmalı
      expect(invitationData[0].token).toBe('token-1');
      expect(invitationData[1].token).toBe('token-2');
      expect(invitationData[0].token).not.toBe(invitationData[1].token);
    });

    it('expiresAt 7 gün sonrası olmalı', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockInvitationDb.createMany.mockResolvedValue({ count: 1 });

      const now = Date.now();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      await sendInvitations({
        emails: ['test@example.com'],
      });

      const callArgs = mockInvitationDb.createMany.mock.calls[0][0];
      const invitationData = callArgs.data as Array<{ expiresAt: Date }>;
      const expiresAt = invitationData[0].expiresAt.getTime();
      const expectedExpiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

      // 1 saniye tolerans ile kontrol et
      expect(Math.abs(expiresAt - expectedExpiresAt)).toBeLessThan(1000);

      vi.useRealTimers();
    });

    it('başarılı oluşturma invitation count dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockInvitationDb.createMany.mockResolvedValue({ count: 2 });

      const result = await sendInvitations(validInvitationInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.count).toBe(2);
      }
    });

    it('skipDuplicates true olmalı', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockInvitationDb.createMany.mockResolvedValue({ count: 1 });

      await sendInvitations(validInvitationInput);

      expect(mockInvitationDb.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skipDuplicates: true,
        })
      );
    });
  });
});
