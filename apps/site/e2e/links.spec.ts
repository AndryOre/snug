import { expect, test } from '@playwright/test'

import { localePath, LOCALES } from '../src/i18n/locales'

const SERVER_HANDLED_PATHS = new Set(['/install', '/reviews'])

const PATHS = LOCALES.map((locale) => localePath(locale))

for (const path of PATHS) {
  test(`${path} internal links answer 200 without redirecting`, async ({
    page,
    request,
    baseURL,
  }) => {
    await page.goto(path)
    const origin = new URL(baseURL ?? '').origin
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((anchors) =>
        anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
      )

    const targets = new Set<string>()
    for (const href of hrefs) {
      const url = new URL(href)
      if (url.origin !== origin || SERVER_HANDLED_PATHS.has(url.pathname))
        continue
      targets.add(`${url.pathname}${url.search}`)
    }
    expect(targets.size).toBeGreaterThan(0)

    for (const target of targets) {
      const response = await request.get(target, { maxRedirects: 0 })
      expect(response.status(), target).toBe(200)
    }
  })
}
