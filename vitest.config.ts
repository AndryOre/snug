import { defineConfig } from 'vitest/config'

/**
 * Keeps `isolate: true`: `isolate: false` gave no consistent speed-up on the
 * tooling suites (import-bound, 22 files), so the safer default stays.
 */
export default defineConfig({
  test: {
    isolate: true,
    include: [
      'scripts/**/*.test.ts',
      'eslint-rules/**/*.test.ts',
      'oxlint-plugins/**/*.test.ts',
      'docs/adr/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      include: [
        'scripts/**/*.ts',
        'eslint-rules/**/*.mjs',
        'oxlint-plugins/**/*.mjs',
      ],
      exclude: [
        'scripts/**/*.test.ts',
        'eslint-rules/**/*.test.ts',
        'oxlint-plugins/**/*.test.ts',
        'scripts/lint-parity-run.ts',
      ],
      reporter: ['text', 'lcov'],
      thresholds: { lines: 65, statements: 65, branches: 63, functions: 83 },
    },
  },
})
