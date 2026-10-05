import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'
import { expectNoElementOverflow, MIN_TOUCH_TARGET } from './layout-helpers'

const PATHS = LOCALES.map((locale) => localePath(locale))
const SWEEP_WIDTHS = [320, 768]
const SCHEMES = ['light', 'dark'] as const
const TOUCH_LAYOUT_MAX_WIDTH = 1024

const TOUCH_TARGETS = {
  'install buttons': '[data-install]',
  'FAQ triggers': '[data-section="faq"] button',
  'footer links': 'footer a',
  'header menus': 'header button',
}

for (const colorScheme of SCHEMES) {
  for (const width of SWEEP_WIDTHS) {
    for (const path of PATHS) {
      test(`${path} clips no heading, button, card or badge at ${width}px in ${colorScheme}`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme })
        await page.setViewportSize({ width, height: 900 })
        await page.goto(path)
        await expect(page.locator('h1')).toBeVisible()
        await expectNoElementOverflow(page)
      })
    }
  }
}

test.describe('breakpoint at 767 vs 768', () => {
  test('RealInterface grid is one column at 767 and two at 768', async ({
    page,
  }) => {
    const columnCount = () =>
      page
        .locator('[data-section="interface"] .grid')
        .first()
        .evaluate(
          (grid) =>
            getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        )
    await page.setViewportSize({ width: 767, height: 900 })
    await page.goto('/')
    expect(await columnCount()).toBe(1)
    await page.setViewportSize({ width: 768, height: 900 })
    expect(await columnCount()).toBe(2)
  })

  test('hero journey stacks at 767 and runs in a row at 768', async ({
    page,
  }) => {
    const direction = () =>
      page
        .locator('[data-section="hero"] .journey-boundary > .flex')
        .evaluate((flex) => getComputedStyle(flex).flexDirection)
    await page.setViewportSize({ width: 767, height: 900 })
    await page.goto('/')
    expect(await direction()).toBe('column')
    await page.setViewportSize({ width: 768, height: 900 })
    expect(await direction()).toBe('row')
  })
})

test.describe('touch targets', () => {
  test.beforeEach(({ viewport }) => {
    test.skip(
      !viewport || viewport.width > TOUCH_LAYOUT_MAX_WIDTH,
      'touch target sizing applies to touch-sized viewports',
    )
  })

  for (const [label, selector] of Object.entries(TOUCH_TARGETS)) {
    test(`${label} are at least 44px tall and wide`, async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('header astro-island')).not.toHaveAttribute(
        'ssr',
        '',
      )
      const targets = page.locator(selector)
      const count = await targets.count()
      expect(count).toBeGreaterThan(0)
      for (let index = 0; index < count; index++) {
        const target = targets.nth(index)
        await target.scrollIntoViewIfNeeded()
        const box = await target.boundingBox()
        expect(box, `${label} #${index} has a box`).not.toBeNull()
        expect(box!.height, `${label} #${index} height`).toBeGreaterThanOrEqual(
          MIN_TOUCH_TARGET,
        )
        expect(box!.width, `${label} #${index} width`).toBeGreaterThanOrEqual(
          MIN_TOUCH_TARGET,
        )
      }
    })
  }
})
