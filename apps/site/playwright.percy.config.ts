import { defineConfig } from '@playwright/test'

/**
 * Captures DOM snapshots for Percy, which renders them in Chrome, Firefox, Edge
 * and Safari. Run it through `percy exec`, which supplies the build. Without
 * `PERCY_TOKEN` the spec skips itself.
 */
export default defineConfig({
  testDir: './e2e-container',
  testMatch: /percy\.spec\.ts$/,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:4399' },
  webServer: {
    command: 'bun run preview --port 4399 --ignore-lock',
    url: 'http://localhost:4399',
    reuseExistingServer: !process.env.CI,
  },
})
