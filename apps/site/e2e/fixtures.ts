import { test as base } from '@playwright/test'

import { blockUmami } from './umami-helpers'

export { expect } from '@playwright/test'

/**
 * Playwright `test` for the layout specs. It answers every Umami request
 * locally before each test, so `page.goto` never waits on the real Umami
 * script over a BrowserStack tunnel, where that request is slow or lost.
 */
export const test = base.extend<{ umamiBlocked: undefined }>({
  umamiBlocked: [
    async ({ page }, provide) => {
      await blockUmami(page)
      await provide(undefined)
    },
    { auto: true },
  ],
})
