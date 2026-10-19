import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
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
