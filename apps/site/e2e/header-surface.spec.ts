import { expect, type Page, test } from '@playwright/test'

const SURFACE = '[data-header-surface]'
const SCROLL_RANGE_PX = 64

async function surfaceOpacity(page: Page) {
  return page.locator(SURFACE).evaluate((element) => {
    return Number(globalThis.getComputedStyle(element).opacity)
  })
}

async function scrollToOffset(page: Page, offset: number) {
  await page.evaluate((top) => globalThis.scrollTo(0, top), offset)
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        globalThis.requestAnimationFrame(() =>
          globalThis.requestAnimationFrame(resolve),
        )
      }),
  )
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(`reducedMotion: ${reducedMotion}`, () => {
    test.use({ reducedMotion })

    test('the header surface fades from 0 to 1 over the first 64px of scroll', async ({
      page,
    }) => {
      await page.goto('/')
      await scrollToOffset(page, 0)
      expect(await surfaceOpacity(page)).toBe(0)
      await scrollToOffset(page, SCROLL_RANGE_PX / 2)
      const halfway = await surfaceOpacity(page)
      expect(halfway).toBeGreaterThan(0)
      expect(halfway).toBeLessThan(1)
      await scrollToOffset(page, SCROLL_RANGE_PX)
      expect(await surfaceOpacity(page)).toBe(1)
    })

    test('the header does not move while the surface fades', async ({
      page,
    }) => {
      await page.goto('/')
      const header = page.locator('[data-section="header"]')
      const before = await header.boundingBox()
      await scrollToOffset(page, SCROLL_RANGE_PX)
      const after = await header.boundingBox()
      expect(after?.y).toBe(before?.y)
    })
  })
}
