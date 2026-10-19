import { configDefaults, defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'

export default defineConfig({
  plugins: [WxtVitest({ root: import.meta.dirname })],
  test: {
    setupFiles: ['./lib/testing/setup-locks.ts'],
    testTimeout: 20_000,
    exclude: [...configDefaults.exclude, 'e2e/**', 'e2e-store/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['lib/**'],
      thresholds: { lines: 94, statements: 93, branches: 86, functions: 93 },
    },
  },
})
