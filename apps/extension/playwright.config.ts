import { defineConfig } from '@playwright/test'

/**
 * Stays at one worker: every spec launches a persistent Chromium context with
 * the built extension and shares the same extension storage and downloads
 * flow; a trial with 2 workers failed 5 specs (import page, popup import,
 * auto-export now) that pass serially.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',
  use: {
    trace: 'retain-on-failure',
  },
})
