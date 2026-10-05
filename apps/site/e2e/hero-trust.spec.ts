import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'

const PATHS = LOCALES.map((locale) => localePath(locale))

for (const path of PATHS) {
  test(`${path} renders hero, trust proof and tagged install actions`, async ({
    page,
  }) => {
    const origins = new Set<string>()
    page.on('request', (request) => {
      const url = new URL(request.url())
      if (url.protocol.startsWith('http')) origins.add(url.origin)
    })

    await page.goto(path)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('[data-section="hero"]')).toBeVisible()
    await expect(page.locator('[data-section="trust"]')).toBeVisible()
    await expect(page.locator('[data-section="trust"] ol > li')).toHaveCount(3)
    await expect(page.locator('[data-section="trust"] ul a')).toHaveCount(5)

    await expect(page.locator('a[data-install="hero"]')).toHaveAttribute(
      'href',
      '/install?c=hero',
    )
    await expect(page.locator('a[data-install="trust"]')).toHaveAttribute(
      'href',
      '/install?c=trust',
    )
    const storeLinks = await page
      .locator('a[href*="chromewebstore.google.com"]:not([data-reviews-link])')
      .count()
    expect(storeLinks).toBe(0)

    expect([...origins]).toEqual(['http://localhost:4399'])
  })
}

test('install button shows a visible keyboard focus ring', async ({ page }) => {
  await page.goto('/')
  const install = page.locator('a[data-install="hero"]')
  await install.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(install).toBeFocused()
  const boxShadow = await install.evaluate(
    (element) => getComputedStyle(element).boxShadow,
  )
  expect(boxShadow).not.toBe('none')
})

test('works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('a[data-install="hero"]')).toBeVisible()
  await expect(page.locator('[data-section="trust"]')).toBeVisible()
  await context.close()
})
