import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'src/__tests__/**',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@seq/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@seq/database': path.resolve(__dirname, '../../packages/database/src'),
      '@seq/i18n': path.resolve(__dirname, '../../packages/i18n/src'),
      '@seq/config': path.resolve(__dirname, '../../packages/config/src'),
      '@seq/auth': path.resolve(__dirname, '../../packages/auth/src'),
    },
  },
});
