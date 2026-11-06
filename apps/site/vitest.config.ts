import { defineConfig } from 'vitest/config'

/**
 * `isolate: false` reuses each worker's module registry across files; measured
 * about 0.7-2 s faster on this suite, which keeps no shared module state.
 */
export default defineConfig({
  test: {
    isolate: false,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/**/*.ts',
        'src/components/ThemeMenu.tsx',
        'src/components/FaqAccordion.tsx',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/scripts/render-security-headers.ts',
      ],
      thresholds: { lines: 89, statements: 89, branches: 84, functions: 90 },
    },
  },
})
