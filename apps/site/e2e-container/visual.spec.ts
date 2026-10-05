import { expect, type Page, test } from '@playwright/test'

const pagePaths = [
  { name: 'en', path: '/' },
  { name: 'de', path: '/de/' },
] as const

const viewportWidths = [1280, 768, 375, 320] as const
const colorSchemes = ['light', 'dark'] as const

async function settlePage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const { document: doc, window: win } = globalThis
    await doc.fonts.ready
    const step = win.innerHeight
    for (let y = 0; y < doc.body.scrollHeight; y += step) {
      win.scrollTo(0, y)
      await new Promise((resolve) => globalThis.setTimeout(resolve, 50))
    }
    win.scrollTo(0, 0)
    for (const image of doc.images) image.loading = 'eager'
  })
  await page.waitForLoadState('networkidle')
  await expect
    .poll(() =>
      page.evaluate(() => {
        const { document: doc } = globalThis
        return [...doc.images].every(
          (image) => image.complete && image.naturalWidth > 0,
        )
      }),
    )
    .toBe(true)
}

for (const { name, path } of pagePaths) {
  for (const colorScheme of colorSchemes) {
    test.describe(`${name} ${colorScheme}`, () => {
      test.use({ colorScheme, reducedMotion: 'reduce' })

      for (const width of viewportWidths) {
        test(`${width}px`, { tag: '@visual' }, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 })
          await page.goto(path, { waitUntil: 'networkidle' })
          await settlePage(page)
          await expect(page.locator('astro-island[ssr]')).toHaveCount(0)

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
