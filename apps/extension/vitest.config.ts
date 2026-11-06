import { configDefaults, defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'

/**
 * Keeps `isolate: true`: with `isolate: false` the suite ran slower (about 24 s
 * against 14-18 s) and `run-import` and `auto-export-folder` failed
 * intermittently because fakeBrowser, fake locks and module-level state leak
 * between files even with an after-file reset.
 */
export default defineConfig({
  plugins: [WxtVitest({ root: import.meta.dirname })],
  test: {
    isolate: true,
    setupFiles: [
      './lib/testing/setup-locks.ts',
      './lib/testing/fake-permissions.ts',
    ],
    testTimeout: 20_000,
    exclude: [...configDefaults.exclude, 'e2e/**', 'e2e-store/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['lib/**'],
      thresholds: { lines: 93, statements: 93, branches: 86, functions: 93 },
    },
  },
})
