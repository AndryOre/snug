import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { hydratedFaq } from '../e2e/faq-helpers'
import { blockUmami, UMAMI_ORIGINS } from '../e2e/umami-helpers'
import { languageTag, localePath, LOCALES } from '../src/i18n/locales'
import { UMAMI_COLLECT_ORIGIN, UMAMI_SCRIPT_ORIGIN } from '../src/seo/umami'

const LOCALE_PATHS = LOCALES.map((locale) => localePath(locale))

const STORE_LISTING_PATH =
  '/detail/snug-bookmark-export-impo/gdhpeilfkeeajillmcncaelnppiakjhn'

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
  expect(location.pathname).toBe(STORE_LISTING_PATH)
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
  expect(location.pathname).toBe(`${STORE_LISTING_PATH}/reviews`)
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
  test(`${path} makes no third-party request on load except Umami`, async ({
    page,
    baseURL,
  }) => {
    await blockUmami(page)
    const siteOrigin = new URL(baseURL ?? '').origin
    const foreignRequests: string[] = []
    page.on('request', (request) => {
      const { protocol, origin } = new URL(request.url())
      if (protocol !== 'data:' && protocol !== 'blob:' && origin !== siteOrigin)
        foreignRequests.push(request.url())
    })

    await page.goto(path, { waitUntil: 'networkidle' })
    const foreignOrigins = foreignRequests.map((url) => new URL(url).origin)
    expect(
      foreignOrigins.filter((origin) => !UMAMI_ORIGINS.includes(origin)),
    ).toEqual([])
    expect(foreignOrigins).toContain(UMAMI_SCRIPT_ORIGIN)
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

test('the served CSP allows exactly the Umami script and connect origins', async ({
  request,
}) => {
  for (const path of ['/', '/privacy/', '/nope/', '/de/nope/']) {
    const response = await request.get(path)
    const policy = response.headers()['content-security-policy'] ?? ''
    const origins = policy
      .matchAll(/https:\/\/[^\s;]+/g)
      .map((match) => match[0])
      .toArray()
    expect(
      origins.toSorted((first, second) => first.localeCompare(second)),
      path,
    ).toEqual(
      [
        UMAMI_SCRIPT_ORIGIN,
        UMAMI_COLLECT_ORIGIN,
        'https://www.youtube-nocookie.com',
      ].toSorted((first, second) => first.localeCompare(second)),
    )
    const directives = policy.split(';').map((directive) => directive.trim())
    expect(
      directives.find((directive) => directive.startsWith('script-src ')),
    ).toContain(UMAMI_SCRIPT_ORIGIN)
    expect(
      directives.find((directive) => directive.startsWith('connect-src ')),
    ).toBe(`connect-src 'self' ${UMAMI_COLLECT_ORIGIN}`)
  }
})

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
    await blockUmami(page)
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

test('the served CSP carries the hardening directives and no strict-dynamic', async ({
  request,
}) => {
  const response = await request.get('/')
  const policy = response.headers()['content-security-policy'] ?? ''
  const directives = policy.split(';').map((directive) => directive.trim())
  expect(directives).toContain("base-uri 'none'")
  expect(directives).toContain('upgrade-insecure-requests')
  expect(directives).toContain("require-trusted-types-for 'script'")
  expect(policy).not.toContain('strict-dynamic')
  expect(policy).not.toContain('report-to')
})

test('the speculation rules resolve with the right MIME type', async ({
  request,
}) => {
  const page = await request.get('/')
  expect(page.headers()['speculation-rules']).toBe('"/speculation-rules.json"')

  const rules = await request.get('/speculation-rules.json')
  expect(rules.status()).toBe(200)
  expect(rules.headers()['content-type']).toContain(
    'application/speculationrules+json',
  )
  const parsed = (await rules.json()) as {
    prefetch: { eagerness: string; where: unknown }[]
  }
  expect(parsed).not.toHaveProperty('prerender')
  expect(parsed.prefetch[0]?.eagerness).toBe('moderate')
  const serialized = JSON.stringify(parsed.prefetch[0]?.where)
  expect(serialized).toContain('/install')
  expect(serialized).toContain('/reviews')
})

test('og images, favicons and the manifest are cached for a day', async ({
  request,
}) => {
  const paths = [
    '/og/og-en.png',
    '/favicon.ico',
    '/favicon.svg',
    '/apple-touch-icon.png',
    '/manifest.webmanifest',
  ]
  for (const path of paths) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    expect(response.headers()['cache-control'], path).toBe(
      'public, max-age=86400',
    )
  }
})

test('activating the video raises no CSP or Trusted Types violation', async ({
  page,
}) => {
  await page.route('https://www.youtube-nocookie.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>mock player</title>',
    }),
  )
  const problems: string[] = []
  page.on('console', (message) => {
    if (/content security|trusted ?type/i.test(message.text()))
      problems.push(message.text())
  })
  page.on('pageerror', (error) => {
    problems.push(error.message)
  })
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      console.error(
        `securitypolicyviolation ${event.violatedDirective} ${event.blockedURI}`,
      )
    })
  })

  await page.goto('/', { waitUntil: 'networkidle' })
  const poster = page.locator('[data-video-poster]')
  await poster.scrollIntoViewIfNeeded()
  await expect(
    page.locator('astro-island:has([data-video-poster])'),
  ).not.toHaveAttribute('ssr', '')
  await poster.click()
  await expect(page.locator('iframe[data-video-player]')).toBeVisible()
  await page.waitForTimeout(250)
  expect(problems).toEqual([])
})

for (const path of [
  '/llms.txt',
  '/llms-full.txt',
  '/robots.txt',
  '/sitemap.xml',
]) {
  test(`${path} is served as utf-8`, async ({ request }) => {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toMatch(/charset=utf-8/i)
  })
}

test('the manifest is served as application/manifest+json', async ({
  request,
}) => {
  const response = await request.get('/manifest.webmanifest')
  expect(response.headers()['content-type']).toMatch(
    /^application\/manifest\+json/,
  )
})

for (const { duplicate, canonical } of [
  { duplicate: '/index.html', canonical: '/' },
  { duplicate: '/es/index.html', canonical: '/es/' },
]) {
  test(`${duplicate} redirects to ${canonical}`, async ({ request }) => {
    const response = await request.get(duplicate, { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers()['location']).toBe(canonical)
  })
}

test('the locale 404 routes are internal', async ({ request }) => {
  const response = await request.get('/es/404/', { maxRedirects: 0 })
  expect(response.status()).toBe(404)
})

test('every 404 sends Cache-Control: no-cache', async ({ request }) => {
  for (const path of ['/nope/', '/ja/nope/']) {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
    expect(response.headers()['cache-control']).toBe('no-cache')
  }
})

test('HSTS includes subdomains and is not preload', async ({ request }) => {
  const response = await request.get('/')
  expect(response.headers()['strict-transport-security']).toBe(
    'max-age=63072000; includeSubDomains',
  )
})

test('the served sitemap stamps every url with a valid lastmod', async ({
  request,
}) => {
  const response = await request.get('/sitemap.xml')
  const xml = await response.text()
  const urls = xml.match(/<url>[\s\S]*?<\/url>/g) ?? []
  expect(urls.length).toBeGreaterThan(LOCALES.length)
  for (const url of urls) {
    const lastmod = url.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1]
    expect(lastmod, url).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Number.isNaN(Date.parse(`${lastmod}T00:00:00Z`)), url).toBe(false)
  }
})

test('the container gzips text and leaves binaries alone', async ({
  request,
}) => {
  for (const path of ['/', '/llms.txt', '/sitemap.xml']) {
    const response = await request.get(path, {
      headers: { 'accept-encoding': 'gzip' },
    })
    expect(response.headers()['content-encoding']).toBe('gzip')
  }
  const page = await request.get('/')
  const html = await page.text()
  const font = html.match(/\/_astro\/[^"']+\.woff2/)?.[0]
  expect(font).toBeDefined()
  const response = await request.get(font!, {
    headers: { 'accept-encoding': 'gzip' },
  })
  expect(response.headers()['content-encoding']).toBeUndefined()
})
