import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const LOCALE_PATHS = [
  '/',
  '/es/',
  '/de/',
  '/fr/',
  '/it/',
  '/ja/',
  '/ko/',
  '/pt-br/',
  '/ru/',
  '/zh-cn/',
]

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

for (const path of LOCALE_PATHS) {
  test(`${path} responds with a page`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toBeVisible()
  })
}

test('/install redirects with the three UTM tags', async ({ request }) => {
  const response = await request.get('/install', { maxRedirects: 0 })
  expect(response.status()).toBe(302)

  const location = new URL(response.headers()['location'] ?? '')
  expect(location.hostname).toBe('chromewebstore.google.com')
  expect(location.searchParams.get('utm_source')).toBe('landing')
  expect(location.searchParams.get('utm_medium')).toBe('web')
  expect(location.searchParams.get('utm_campaign')).toBe('direct')
})

for (const path of LOCALE_PATHS) {
  test(`${path} makes no third-party request on load`, async ({
    page,
    baseURL,
  }) => {
    const siteOrigin = new URL(baseURL ?? '').origin
    const foreignRequests: string[] = []
    page.on('request', (request) => {
      const { protocol, origin } = new URL(request.url())
      if (protocol !== 'data:' && protocol !== 'blob:' && origin !== siteOrigin)
        foreignRequests.push(request.url())
    })

    await page.goto(path, { waitUntil: 'networkidle' })
    expect(foreignRequests).toEqual([])
  })
}

for (const path of ['/', '/privacy']) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    const { violations } = await new AxeBuilder({ page })
      .withTags(AXE_TAGS)
      .analyze()
    expect(violations).toEqual([])
  })
}
