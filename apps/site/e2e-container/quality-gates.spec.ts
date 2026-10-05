import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { languageTag, localePath, LOCALES } from '../src/i18n/locales'

const LOCALE_PATHS = LOCALES.map((locale) => localePath(locale))

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

test('/install/ answers exactly like /install', async ({ request }) => {
  const plain = await request.get('/install', { maxRedirects: 0 })
  const slashed = await request.get('/install/', { maxRedirects: 0 })
  expect(slashed.status()).toBe(302)
  expect(slashed.headers()['location']).toBe(plain.headers()['location'])
})

test('/reviews redirects to the store reviews with the UTM tags', async ({
  request,
}) => {
  const response = await request.get('/reviews?c=proof', { maxRedirects: 0 })
  expect(response.status()).toBe(302)

  const location = new URL(response.headers()['location'] ?? '')
  expect(location.hostname).toBe('chromewebstore.google.com')
  expect(location.pathname.endsWith('/reviews')).toBe(true)
  expect(location.searchParams.get('utm_source')).toBe('landing')
  expect(location.searchParams.get('utm_medium')).toBe('web')
  expect(location.searchParams.get('utm_campaign')).toBe('proof')

  const slashed = await request.get('/reviews/', { maxRedirects: 0 })
  expect(slashed.status()).toBe(302)
})

test('no raw store URL remains in the page, JSON-LD or llms.txt', async ({
  request,
}) => {
  for (const path of ['/', '/llms.txt']) {
    const response = await request.get(path)
    const body = await response.text()
    expect(body).not.toContain('chromewebstore.google.com')
  }
})

const ALIASES = LOCALES.flatMap((locale) => {
  const canonical = localePath(locale)
  if (canonical === '/') return []
  const code = languageTag(locale)
  return [...new Set([`/${code}/`, `/${code.replace('-', '_')}/`])]
    .filter((alias) => alias !== canonical)
    .map((alias) => ({ alias, canonical }))
})

for (const { alias, canonical } of ALIASES) {
  test(`${alias} redirects to ${canonical}`, async ({ request }) => {
    const response = await request.get(alias, { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers()['location']).toBe(canonical)
  })
}

for (const locale of LOCALES) {
  const prefix = localePath(locale)
  const contentFile = fileURLToPath(
    new URL(`../src/content/${locale}.json`, import.meta.url),
  )
  const { notFound } = JSON.parse(readFileSync(contentFile, 'utf8')) as {
    notFound: { title: string }
  }

  test(`an unknown path under ${prefix} gets the ${locale} 404`, async ({
    page,
  }) => {
    const missing = `${prefix}no-such-page/`
    const response = await page.goto(missing)
    expect(response?.status()).toBe(404)
    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      languageTag(locale),
    )
    await expect(page).toHaveTitle(`${notFound.title} | Snug`)
    await expect(page.locator('h1')).toHaveText(notFound.title)
  })
}

test('/og/* is cross-origin readable and every other path is not', async ({
  request,
}) => {
  const image = await request.get('/og/og-en.png')
  expect(image.status()).toBe(200)
  expect(image.headers()['cross-origin-resource-policy']).toBe('cross-origin')

  for (const path of ['/', '/llms.txt', '/privacy/', '/nope/']) {
    const response = await request.get(path)
    expect(response.headers()['cross-origin-resource-policy']).toBe(
      'same-origin',
    )
  }
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

for (const path of ['/', '/privacy/']) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    const { violations } = await new AxeBuilder({ page })
      .withTags(AXE_TAGS)
      .analyze()
    expect(violations).toEqual([])
  })
}
