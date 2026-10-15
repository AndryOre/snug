import { defineConfig } from '@playwright/test'

import { LAYOUT_SPECS, LEAN_LAYOUT_SPECS } from './playwright.layout-specs'

const isLeanTier = process.env.BROWSERSTACK_TIER === 'lean'

/**
 * Runs the layout specs on the real platforms listed in `browserstack.yml`.
 * The BrowserStack SDK fans this single project out across those platforms and
 * tunnels the remote browsers to the local `astro preview` server through
 * BrowserStack Local.
 *
 * `BROWSERSTACK_TIER=lean` drops `accessibility.spec.ts`; any other value runs
 * every layout spec. In CI the `list` reporter prints failures in the job log
 * and `browserstack-timing-reporter.ts` records per-test durations.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: isLeanTier ? LEAN_LAYOUT_SPECS : LAYOUT_SPECS,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { open: 'never' }],
        ['./browserstack-timing-reporter.ts'],
      ]
    : 'list',
  use: { baseURL: 'http://localhost:4399' },
  projects: [{ name: 'browserstack' }],
  webServer: {
    command: 'bun run preview --port 4399 --ignore-lock',
    url: 'http://localhost:4399',
    reuseExistingServer: !process.env.CI,
  },
})
