import { expect, test } from '@playwright/test'

const ROUTES = [
  { path: '/', lang: 'en' },
  { path: '/es/', lang: 'es' },
  { path: '/de/', lang: 'de' },
  { path: '/fr/', lang: 'fr' },
  { path: '/it/', lang: 'it' },
  { path: '/ja/', lang: 'ja' },
  { path: '/ko/', lang: 'ko' },
  { path: '/pt-br/', lang: 'pt-BR' },
  { path: '/ru/', lang: 'ru' },
  { path: '/zh-cn/', lang: 'zh-CN' },
]

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
