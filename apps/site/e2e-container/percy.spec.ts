import percySnapshot from '@percy/playwright'
import { expect, test } from '@playwright/test'

import { settlePage } from './settle-page'

const percyWidths = [320, 375, 768, 1280]
const colorSchemes = ['light', 'dark'] as const

const pages = [
  { name: 'home-en', path: '/' },
  { name: 'home-de', path: '/de/' },
  { name: 'guide', path: '/guide/' },
  { name: '404', path: '/404.html' },
] as const

test.skip(
  !process.env.PERCY_TOKEN,
  'PERCY_TOKEN is not set, so Percy snapshots are skipped',
)

test.beforeAll(() => {
  expect(
    process.env.PERCY_BUILD_ID,
    'Percy did not start: run this spec through `percy exec`, and check that PERCY_TOKEN is valid',
  ).toBeTruthy()
})

for (const { name, path } of pages) {
  for (const colorScheme of colorSchemes) {
    test.describe(`${name} ${colorScheme}`, () => {
      test.use({ colorScheme, reducedMotion: 'reduce' })

      test('percy snapshot', { tag: '@percy' }, async ({ page }) => {
        await page.goto(path, { waitUntil: 'networkidle' })
        await settlePage(page)
        await expect(
          page.locator('astro-island[ssr]:not([client="interaction"])'),
        ).toHaveCount(0)

        await percySnapshot(page, `${name} ${colorScheme}`, {
          widths: percyWidths,
          percyCSS: '[data-video-poster], iframe, time { visibility: hidden; }',
        })
      })
    })
  }
}
