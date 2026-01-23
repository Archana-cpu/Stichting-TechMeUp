import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// MOCKS - Use vi.hoisted to ensure variables are available during mock hoisting
// ============================================================================

const { mockAuthFn, mockRateLimitFn, mockUserDb, mockUserSettingsDb } = vi.hoisted(() => ({
  mockAuthFn: vi.fn(),
  mockRateLimitFn: vi.fn(),
  mockUserDb: {
    update: vi.fn(),
    findUnique: vi.fn(),
  },
  mockUserSettingsDb: {
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
    user: mockUserDb,
    userSettings: mockUserSettingsDb,
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
import { updateUserSettings, getUserSettings } from '@/app/actions';

// ============================================================================
// TEST DATA
// ============================================================================

const validSettingsInput = {
  theme: 'dark-calm',
  locale: 'en' as const,
  emailNotifications: true,
  pushNotifications: false,
  publicProfile: true,
  showInPeopleSearch: false,
};

// ============================================================================
// TESTS
// ============================================================================

describe('Settings Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock return values
    mockRateLimitFn.mockResolvedValue({ success: true, remaining: 29 });
  });

  describe('updateUserSettings', () => {
    it('yetkisiz kullanıcı için UNAUTHORIZED dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await updateUserSettings(validSettingsInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED');
      }
    });

    it('geçersiz locale için VALIDATION_ERROR dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });

      const result = await updateUserSettings({
        ...validSettingsInput,
        locale: 'invalid' as any,
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
        limit: 30,
      });

      const result = await updateUserSettings(validSettingsInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('RATE_LIMITED');
      }
    });

    it('theme ve locale güncellemesi başarılı olmalı', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 29 });
      mockUserDb.update.mockResolvedValue({ id: 'user1' });

      const result = await updateUserSettings({
        theme: 'light',
        locale: 'tr',
      });

      expect(result.success).toBe(true);
      expect(mockUserDb.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { theme: 'light', locale: 'tr' },
      });
    });

    it('userSettings güncellemesi başarılı olmalı', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 29 });
      mockUserSettingsDb.upsert.mockResolvedValue({ id: 'settings1' });

      const result = await updateUserSettings({
        emailNotifications: false,
        pushNotifications: true,
      });

      expect(result.success).toBe(true);
      expect(mockUserSettingsDb.upsert).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        update: { emailNotifications: false, pushNotifications: true },
        create: { userId: 'user1', emailNotifications: false, pushNotifications: true },
      });
    });

    it('hem user hem userSettings güncellemesi başarılı olmalı', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockRateLimitFn.mockResolvedValue({ success: true, remaining: 29 });
      mockUserDb.update.mockResolvedValue({ id: 'user1' });
      mockUserSettingsDb.upsert.mockResolvedValue({ id: 'settings1' });

      const result = await updateUserSettings(validSettingsInput);

      expect(result.success).toBe(true);
      expect(mockUserDb.update).toHaveBeenCalled();
      expect(mockUserSettingsDb.upsert).toHaveBeenCalled();
    });
  });

  describe('getUserSettings', () => {
    it('yetkisiz kullanıcı için null dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const result = await getUserSettings();

      expect(result).toBeNull();
    });

    it('kullanıcı ayarlarını başarıyla getirmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockUserDb.findUnique.mockResolvedValue({
        id: 'user1',
        theme: 'dark-calm',
        locale: 'en',
      });
      mockUserSettingsDb.findUnique.mockResolvedValue({
        id: 'settings1',
        emailNotifications: true,
        pushNotifications: true,
      });

      const result = await getUserSettings();

      expect(result).not.toBeNull();
      expect(result?.user).toEqual({
        id: 'user1',
        theme: 'dark-calm',
        locale: 'en',
      });
      expect(result?.settings).toEqual({
        id: 'settings1',
        emailNotifications: true,
        pushNotifications: true,
      });
    });

    it('settings yoksa null dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'user1' } });
      mockUserDb.findUnique.mockResolvedValue({
        id: 'user1',
        theme: 'dark-calm',
        locale: 'en',
      });
      mockUserSettingsDb.findUnique.mockResolvedValue(null);

      const result = await getUserSettings();

      expect(result).not.toBeNull();
      expect(result?.user).toBeDefined();
      expect(result?.settings).toBeNull();
    });
  });
});
