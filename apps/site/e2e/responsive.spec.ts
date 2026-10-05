import { expect, type Page, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'
import { firstFaqTrigger } from './faq-helpers'

const PATHS = LOCALES.map((locale) => localePath(locale))

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: globalThis.document.documentElement.scrollWidth,
    innerWidth: globalThis.innerWidth,
  }))
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth)
}

test('/privacy/ has no horizontal overflow', async ({ page }) => {
  await page.goto('/privacy/')
  await expect(page.locator('h1')).toBeVisible()
  await expectNoHorizontalOverflow(page)
})

for (const path of PATHS) {
  test(`${path} has no horizontal overflow`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('h1')).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })

  test(`${path} has no horizontal overflow with the language switcher open`, async ({
    page,
  }) => {
    await page.goto(path)
    const switcher = page.locator('[data-language-switcher]')
    await switcher.getByRole('button').click()
    await expect(switcher.locator('nav')).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })

  test(`${path} has no horizontal overflow at 320px with a FAQ answer open`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto(path)
    const first = await firstFaqTrigger(page)
    await first.click()
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await expectNoHorizontalOverflow(page)
  })
}
