import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['scripts/**/*.test.ts', 'eslint-rules/**/*.test.ts'],
  },
})
