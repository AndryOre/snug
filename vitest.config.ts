import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'scripts/**/*.test.ts',
      'eslint-rules/**/*.test.ts',
      'docs/adr/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      include: ['scripts/**/*.ts', 'eslint-rules/**/*.mjs'],
      exclude: ['scripts/**/*.test.ts', 'eslint-rules/**/*.test.ts'],
      reporter: ['text', 'lcov'],
      thresholds: { lines: 67, statements: 67, branches: 65, functions: 86 },
    },
  },
})
