import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const PAGES = [...LOCALES.map((locale) => localePath(locale)), '/privacy/']

async function expectNoViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    .analyze()
  expect(violations).toEqual([])
}

for (const path of PAGES) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path)
    await expectNoViolations(page)
  })
}

test('the 404 page has no accessibility violations', async ({ page }) => {
  const response = await page.goto('/nope')
  expect(response?.status()).toBe(404)
  await expectNoViolations(page)
})

test.describe('opened states', () => {
  test('FAQ open has no accessibility violations', async ({ page }) => {
    await page.goto('/')
    const first = page.locator('[data-section="faq"] details').first()
    await first.locator('summary').click()
    await expect(first).toHaveAttribute('open', '')
    await expectNoViolations(page)
  })

  test('language switcher open has no accessibility violations', async ({
    page,
  }) => {
    await page.goto('/')
    const switcher = page.locator('[data-language-switcher]')
    await switcher.getByRole('button').click()
    await expect(switcher.locator('nav')).toBeVisible()
    await expectNoViolations(page)
  })

  test('activated video has no accessibility violations', async ({ page }) => {
    await page.route('https://www.youtube-nocookie.com/**', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>mock player</title>',
      }),
    )
    await page.goto('/')
    const poster = page.locator('[data-video-poster]')
    await poster.scrollIntoViewIfNeeded()
    await expect(
      page.locator('astro-island[client="visible"]'),
    ).not.toHaveAttribute('ssr', '')
    await poster.click()
    await expect(page.locator('iframe[data-video-player]')).toBeVisible()
    await expectNoViolations(page)
  })
})
