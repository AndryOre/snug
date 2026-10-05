import { expect, type Page } from '@playwright/test'

const ELEMENT_SWEEP_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'button',
  '[data-slot="button"]',
  '[data-slot="card"]',
  '[data-slot="badge"]',
].join(',')

/**
 * Minimum touch target edge in CSS px, less 0.5px of tolerance for the
 * sub-pixel rounding fractional device pixel ratios introduce (a 44px box
 * measures 43.99999 at DPR 2.625).
 */
export const MIN_TOUCH_TARGET = 43.5

/**
 * Asserts the page never scrolls horizontally (`scrollWidth <= innerWidth`).
 * @param page - The page under test.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: globalThis.document.documentElement.scrollWidth,
    innerWidth: globalThis.innerWidth,
  }))
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth)
}

/**
 * Sweeps headings, buttons, cards and badges and asserts none clips its own
 * content (`scrollWidth > clientWidth`). Zero-width and 1px (screen-reader
 * only) boxes are ignored.
 * @param page - The page under test.
 */
export async function expectNoElementOverflow(page: Page): Promise<void> {
  const offenders = await page.evaluate((selector) => {
    const found: string[] = []
    for (const element of globalThis.document.querySelectorAll(selector)) {
      if (
        element.clientWidth <= 1 ||
        element.scrollWidth <= element.clientWidth
      )
        continue
      const text = (element.textContent ?? '').trim().slice(0, 40)
      found.push(
        `<${element.tagName.toLowerCase()}> "${text}" ${element.scrollWidth}>${element.clientWidth}`,
      )
    }
    return found
  }, ELEMENT_SWEEP_SELECTOR)
  expect(offenders).toEqual([])
}
