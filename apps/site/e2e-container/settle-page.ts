import { expect, type Page } from '@playwright/test'

/**
 * Scrolls the whole page so `client:visible` islands hydrate and lazy images
 * load, then waits until fonts and images are ready and returns to the top.
 * @param page - The page to settle.
 */
export async function settlePage(page: Page): Promise<void> {
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
