import { defineConfig } from '@playwright/test'

import { LAYOUT_SPECS } from './playwright.layout-specs'

/**
 * Runs the layout specs on the real platforms listed in `browserstack.yml`.
 * The BrowserStack SDK fans this single project out across those platforms and
 * tunnels the remote browsers to the local `astro preview` server through
 * BrowserStack Local.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: LAYOUT_SPECS,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:4399' },
  projects: [{ name: 'browserstack' }],
  webServer: {
    command: 'bun run preview --port 4399 --ignore-lock',
    url: 'http://localhost:4399',
    reuseExistingServer: !process.env.CI,
  },
})
