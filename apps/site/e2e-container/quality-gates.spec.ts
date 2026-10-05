import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { hydratedFaq } from '../e2e/faq-helpers'
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

test('the served CSP allows scripts by hash only', async ({ request }) => {
  for (const path of ['/', '/privacy/', '/nope/', '/de/nope/']) {
    const response = await request.get(path)
    const policy = response.headers()['content-security-policy'] ?? ''
    const scriptSource = policy
      .split(';')
      .map((directive) => directive.trim())
      .find((directive) => directive.startsWith('script-src '))
    expect(scriptSource, path).toMatch(/'sha256-[^']+'/)
    expect(scriptSource, path).not.toContain("'unsafe-inline'")
  }
})

const EXECUTABLE_INLINE_SCRIPT =
  /<script(?![^>]*\bsrc=)(?![^>]*\btype="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g

test('every inline script in the built page is hash-allowed by the header', async ({
  request,
}) => {
  const response = await request.get('/')
  const policy = response.headers()['content-security-policy'] ?? ''
  const html = await response.text()
  const hashes = html
    .matchAll(EXECUTABLE_INLINE_SCRIPT)
    .map((match) => {
      const digest = createHash('sha256')
        .update(match[1] ?? '')
        .digest('base64')
      return `'sha256-${digest}'`
    })
    .toArray()
  expect(hashes.length).toBeGreaterThan(0)
  for (const hash of hashes) expect(policy).toContain(hash)
})

const CSP_PAGES = [
  ...LOCALE_PATHS.map((path) => ({ path, interactive: true })),
  { path: '/privacy/', interactive: false },
  { path: '/nope/', interactive: false },
]

for (const { path, interactive } of CSP_PAGES) {
  test(`${path} raises no CSP violation`, async ({ page }) => {
    const problems: string[] = []
    page.on('console', (message) => {
      if (
        (message.type() === 'error' &&
          !message.text().includes('status of 404')) ||
        /content security/i.test(message.text())
      )
        problems.push(`console: ${message.text()}`)
    })
    page.on('pageerror', (error) => {
      problems.push(`pageerror: ${error.message}`)
    })
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (event) => {
        console.error(
          `securitypolicyviolation ${event.violatedDirective} ${event.blockedURI}`,
        )
      })
    })

    await page.goto(path, { waitUntil: 'networkidle' })
    if (interactive) {
      const faq = await hydratedFaq(page)
      const trigger = faq.getByRole('button').first()
      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(
        page.locator('astro-island:has([data-language-switcher])'),
      ).not.toHaveAttribute('ssr', '')
      await page.locator('[data-language-switcher]').getByRole('button').click()
      await expect(page.locator('[data-language-menu]')).toBeVisible()
    }
    await page.waitForTimeout(250)
    expect(problems).toEqual([])
  })
}
