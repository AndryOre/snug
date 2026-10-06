import { expect, test } from '@playwright/test'

import { languageTag, localePath, LOCALES } from '../src/i18n/locales'

const ROUTES = LOCALES.map((locale) => ({
  path: localePath(locale),
  lang: languageTag(locale),
}))

const EXPECTED_HREFLANGS = [...ROUTES.map((route) => route.lang), 'x-default']

for (const { path, lang } of ROUTES) {
  test(`${path} renders lang="${lang}" with the full hreflang set`, async ({
    page,
  }) => {
    await page.goto(path)
    await expect(page.locator('html')).toHaveAttribute('lang', lang)

    const alternates = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute('hreflang') ?? ''),
      )
    expect(new Set(alternates)).toEqual(new Set(EXPECTED_HREFLANGS))
    expect(alternates).toHaveLength(EXPECTED_HREFLANGS.length)
  })
}

test('ja renders its own folder names in both journey trees', async ({
  page,
}) => {
  await page.goto(localePath('ja'))
  const folders = page.locator('[data-section="hero"] ul li', {
    hasText: /リサーチ|求職/,
  })
  await expect(folders).toHaveText(['リサーチ', '求職', 'リサーチ', '求職'])
})

test('de formats the ratings date for its locale', async ({ page }) => {
  await page.goto(localePath('de'))
  const numbers = page.locator('[data-proof="numbers"]')
  await expect(numbers).toContainText('05.10.2026')
  await expect(numbers).not.toContainText('2026-10-05')
})

test('does not redirect by browser language', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'es-ES' })
  const page = await context.newPage()
  await page.goto('/')
  expect(new URL(page.url()).pathname).toBe('/')
  await context.close()
})
