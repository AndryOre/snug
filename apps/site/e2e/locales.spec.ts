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

test('does not redirect by browser language', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'es-ES' })
  const page = await context.newPage()
  await page.goto('/')
  expect(new URL(page.url()).pathname).toBe('/')
  await context.close()
})
