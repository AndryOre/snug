import { defineConfig } from '@playwright/test'

/**
 * Smoke run against the site as the container serves it (nginx), not the
 * Astro preview server. Start the container first and point `SITE_URL` at it.
 */
export default defineConfig({
  testDir: './e2e-container',
  snapshotPathTemplate: '{testDir}/{testFileName}-snapshots/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002 } },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',
  use: { baseURL: process.env.SITE_URL ?? 'http://127.0.0.1:8080' },
})
