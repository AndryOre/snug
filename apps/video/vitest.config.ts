import { defineConfig } from 'vitest/config'

/**
 * Keeps `isolate: true`: the suite is a single test file, so sharing the
 * module registry saves nothing measurable.
 */
export default defineConfig({
  test: {
    isolate: true,
    include: ['src/**/*.test.ts'],
  },
})
