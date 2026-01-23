import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit, RATE_LIMITS, clearRateLimitStore } from '@/lib/rate-limit';

// Mock Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => null), // Force memory fallback
}));

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearRateLimitStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Memory Fallback', () => {
    it('ilk istek başarılı olmalı', async () => {
      const result = await rateLimit(
        'test:user:1',
        RATE_LIMITS['sequence:create']
      );

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9); // 10 - 1
      expect(result.limit).toBe(10);
    });

    it('limit dahilinde istekler başarılı olmalı', async () => {
      const config = RATE_LIMITS['sequence:create'];

      // İlk istek: 10 limitten 1 kullanılır, 9 kalır
      const first = await rateLimit('test:user:2', config);
      expect(first.success).toBe(true);
      expect(first.remaining).toBe(9);

      // 8 istek daha yap (toplam 9)
      for (let i = 1; i < 9; i++) {
        const result = await rateLimit('test:user:2', config);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(9 - i);
      }
    });

    it('limit aşıldığında başarısız olmalı', async () => {
      const config = { uniqueTokenPerInterval: 3, interval: 60 };

      // 3 istek yap
      await rateLimit('test:user:3', config);
      await rateLimit('test:user:3', config);
      await rateLimit('test:user:3', config);

      // 4. istek başarısız olmalı
      const result = await rateLimit('test:user:3', config);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('interval sonrası limit sıfırlanmalı', async () => {
      const config = { uniqueTokenPerInterval: 2, interval: 60 };

      // 2 istek yap
      await rateLimit('test:user:4', config);
      await rateLimit('test:user:4', config);

      // 3. istek başarısız
      let result = await rateLimit('test:user:4', config);
      expect(result.success).toBe(false);

      // 61 saniye ileri git
      vi.advanceTimersByTime(61 * 1000);

      // Yeni istek başarılı olmalı
      result = await rateLimit('test:user:4', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it("farklı identifier'lar bağımsız olmalı", async () => {
      const config = { uniqueTokenPerInterval: 1, interval: 60 };

      // User 1 için 1 istek
      const result1 = await rateLimit('test:userA', config);
      expect(result1.success).toBe(true);

      // User 1 için 2. istek - başarısız
      const result2 = await rateLimit('test:userA', config);
      expect(result2.success).toBe(false);

      // User 2 için 1. istek - başarılı olmalı
      const result3 = await rateLimit('test:userB', config);
      expect(result3.success).toBe(true);
    });
  });

  describe('RATE_LIMITS Presets', () => {
    it('sequence:create preset doğru olmalı', () => {
      expect(RATE_LIMITS['sequence:create']).toEqual({
        uniqueTokenPerInterval: 10,
        interval: 60,
      });
    });

    it('auth:login preset doğru olmalı', () => {
      expect(RATE_LIMITS['auth:login']).toEqual({
        uniqueTokenPerInterval: 5,
        interval: 300,
      });
    });

    it('upload:image preset doğru olmalı', () => {
      expect(RATE_LIMITS['upload:image']).toEqual({
        uniqueTokenPerInterval: 20,
        interval: 3600,
      });
    });
  });
});
