import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// MOCKS - Use vi.hoisted to ensure variables are available during mock hoisting
// ============================================================================

const { mockAuthFn, mockRateLimitFn, mockSystemSettingsDb } = vi.hoisted(() => ({
  mockAuthFn: vi.fn(),
  mockRateLimitFn: vi.fn(),
  mockSystemSettingsDb: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
  },
}));

// Mock modules
vi.mock('@seq/auth', () => ({
  auth: () => mockAuthFn(),
}));

vi.mock('@seq/database', () => ({
  db: {
    systemSettings: mockSystemSettingsDb,
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: () => mockRateLimitFn(),
  RATE_LIMITS: {
    'admin:settings': { uniqueTokenPerInterval: 10, interval: 60 },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Import actions after mocks are set up
import { updateAdminSettings, getAdminSettings } from '@/app/actions';

// ============================================================================
// TEST DATA
// ============================================================================

const validAdminSettingsInput = {
  appName: 'Test App',
  appDescription: 'Test description',
  primaryColor: '262 83% 58%',
  accentColor: '262 83% 58%',
  defaultTheme: 'dark-calm',
  defaultLocale: 'en' as const,
  maintenanceMode: false,
  registrationEnabled: true,
  inviteOnlyMode: false,
  quotesEnabled: true,
  maxSequencesPerUser: 100,
  maxPeoplePerUser: 50,
  maxMemoriesPerUser: 20,
};

// ============================================================================
// TESTS
// ============================================================================

describe('Admin Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock return values
    mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
  });

  describe('updateAdminSettings', () => {
    it('yetkisiz kullanıcı için UNAUTHORIZED dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await updateAdminSettings(validAdminSettingsInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED');
      }
    });

    it('admin olmayan kullanıcı için FORBIDDEN dönmeli', async () => {
      // requireAdmin calls requireAuth, then checks isAdmin
      // If isAdmin is false, it throws 'FORBIDDEN' which gets caught
      mockAuthFn.mockResolvedValue({ user: { id: 'user1', isAdmin: false } });

      const result = await updateAdminSettings(validAdminSettingsInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('FORBIDDEN');
      }
    });

    it('geçersiz appName için VALIDATION_ERROR dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1', isAdmin: true } });

      const result = await updateAdminSettings({
        appName: '', // Empty string - should fail min(1)
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR');
      }
    });

    it('geçersiz locale için VALIDATION_ERROR dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1', isAdmin: true } });

      const result = await updateAdminSettings({
        defaultLocale: 'invalid' as any,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR');
      }
    });

    it('rate limit aşıldığında RATE_LIMITED dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1', isAdmin: true } });
      mockRateLimitFn.mockResolvedValue({
        success: false,
        remaining: 0,
        reset: Date.now() + 60000,
        limit: 10,
      });

      const result = await updateAdminSettings(validAdminSettingsInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('RATE_LIMITED');
      }
    });

    it('admin ayarları başarıyla güncellenmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1', isAdmin: true } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockSystemSettingsDb.upsert.mockResolvedValue({ id: 'system' });

      const result = await updateAdminSettings({
        appName: 'Updated App Name',
        maintenanceMode: true,
      });

      expect(result.success).toBe(true);
      expect(mockSystemSettingsDb.upsert).toHaveBeenCalledWith({
        where: { id: 'system' },
        update: {
          appName: 'Updated App Name',
          maintenanceMode: true,
        },
        create: {
          id: 'system',
          appName: 'Updated App Name',
          maintenanceMode: true,
        },
      });
    });

    it('tüm alanlar ile başarıyla güncellenmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1', isAdmin: true } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 9 });
      mockSystemSettingsDb.upsert.mockResolvedValue({ id: 'system' });

      const result = await updateAdminSettings(validAdminSettingsInput);

      expect(result.success).toBe(true);
      expect(mockSystemSettingsDb.upsert).toHaveBeenCalledWith({
        where: { id: 'system' },
        update: validAdminSettingsInput,
        create: { id: 'system', ...validAdminSettingsInput },
      });
    });
  });

  describe('getAdminSettings', () => {
    it('yetkisiz kullanıcı için null dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await getAdminSettings();

      expect(result).toBeNull();
    });

    it('admin olmayan kullanıcı için null dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1', isAdmin: false } });

      const result = await getAdminSettings();

      expect(result).toBeNull();
    });

    it('admin kullanıcı ayarları başarıyla getirmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1', isAdmin: true } });
      mockSystemSettingsDb.findUnique.mockResolvedValue({
        id: 'system',
        appName: 'Sequences',
        maintenanceMode: false,
        registrationEnabled: true,
      });

      const result = await getAdminSettings();

      expect(result).not.toBeNull();
      expect(result?.id).toBe('system');
      expect(result?.appName).toBe('Sequences');
    });

    it('ayarlar yoksa null dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1', isAdmin: true } });
      mockSystemSettingsDb.findUnique.mockResolvedValue(null);

      const result = await getAdminSettings();

      expect(result).toBeNull();
    });
  });
});
