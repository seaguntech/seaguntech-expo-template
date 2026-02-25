import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'node',
    passWithNoTests: true,
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@': path.resolve(__dirname, './src'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/context': path.resolve(__dirname, './src/context'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/tw': path.resolve(__dirname, './src/tw'),
      '@/locales': path.resolve(__dirname, './src/locales'),
      '@/config': path.resolve(__dirname, './src/config'),
    },
  },
})
