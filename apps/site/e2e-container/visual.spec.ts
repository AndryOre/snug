import { expect, test } from '@playwright/test'

import { settlePage } from './settle-page'

const pagePaths = [
  { name: 'en', path: '/' },
  { name: 'de', path: '/de/' },
] as const

const viewportWidths = [1280, 768, 375, 320] as const
const colorSchemes = ['light', 'dark'] as const

for (const { name, path } of pagePaths) {
  for (const colorScheme of colorSchemes) {
    test.describe(`${name} ${colorScheme}`, () => {
      test.use({ colorScheme, reducedMotion: 'reduce' })

      for (const width of viewportWidths) {
        test(`${width}px`, { tag: '@visual' }, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 })
          await page.goto(path, { waitUntil: 'networkidle' })
          await settlePage(page)
          await expect(
            page.locator('astro-island[ssr]:not([client="interaction"])'),
          ).toHaveCount(0)

          await expect(page).toHaveScreenshot(
            `${name}-${colorScheme}-${width}.png`,
            {
              fullPage: true,
              animations: 'disabled',
              caret: 'hide',
              mask: [
                page.locator('[data-video-poster]'),
                page.locator('iframe'),
                page.locator('time'),
              ],
            },
          )
        })
      }
    })
  }
}
