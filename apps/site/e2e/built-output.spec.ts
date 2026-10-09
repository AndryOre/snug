import { expect, test } from '@playwright/test'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  DEFAULT_LOCALE,
  hreflangAlternates,
  languageTag,
  LOCALE_CONFIG,
  localePath,
  LOCALES,
  ogImagePath,
  SITE_ORIGIN,
} from '../src/i18n/locales'
import { REVIEWS } from '../src/i18n/proof'
import { ogLocale, ogLocaleAlternates } from '../src/seo/open-graph'
import { STORE_FACTS } from '../src/seo/store-facts'
import {
  UMAMI_DOMAINS,
  UMAMI_SCRIPT_URL,
  UMAMI_WEBSITE_ID,
} from '../src/seo/umami'

const siteRoot = fileURLToPath(new URL('..', import.meta.url))
const builtSite = path.join(siteRoot, 'dist')

const PRIVACY_PAGE_LOCALES = LOCALES.filter(
  (locale) =>
    locale === DEFAULT_LOCALE ||
    existsSync(path.join(siteRoot, 'src/content/privacy', `${locale}.md`)),
)

function privacyPath(locale: (typeof LOCALES)[number]): string {
  return locale !== DEFAULT_LOCALE && PRIVACY_PAGE_LOCALES.includes(locale)
    ? `/${languageTag(locale).toLowerCase()}/privacy/`
    : '/privacy/'
}

function readBuilt(relativePath: string): string {
  return readFileSync(path.join(builtSite, relativePath), 'utf8')
}

function pageFile(locale: (typeof LOCALES)[number]): string {
  return `${localePath(locale).slice(1)}index.html`
}

function metaContent(html: string, attribute: string, name: string): string {
  const pattern = new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"`)
  const match = pattern.exec(html)
  if (!match) throw new Error(`Missing <meta ${attribute}="${name}">`)
  return match[1] ?? ''
}

type GraphNode = Record<string, unknown>

function jsonLdGraph(html: string): GraphNode[] {
  const match = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(
    html,
  )
  if (!match) throw new Error('Missing JSON-LD')
  const data = JSON.parse(match[1] ?? '') as { '@graph': GraphNode[] }
  return data['@graph']
}

test.describe('built pages', () => {
  for (const locale of LOCALES) {
    test(`${locale} keeps every FAQ answer in the server-rendered markup`, () => {
      const html = readBuilt(pageFile(locale))
        .replaceAll(/<script type="application\/ld\+json">.*?<\/script>/gs, '')
        .replaceAll('&#39;', "'")
        .replaceAll('&quot;', '"')
        .replaceAll('&amp;', '&')
      const content = JSON.parse(
        readFileSync(
          path.join(siteRoot, 'src/content', `${locale}.json`),
          'utf8',
        ),
      ) as { faq: { items: Record<string, { answer: string }> } }
      for (const entry of Object.values(content.faq.items)) {
        expect(html).toContain(entry.answer)
      }
    })

    test(`${locale} server-renders every collapsed FAQ panel as hidden until found`, () => {
      const html = readBuilt(pageFile(locale))
      const panels = html.match(
        /<div\b[^>]*\bdata-slot="accordion-content"[^>]*>/g,
      )
      const content = JSON.parse(
        readFileSync(
          path.join(siteRoot, 'src/content', `${locale}.json`),
          'utf8',
        ),
      ) as { faq: { items: Record<string, unknown> } }
      expect(panels).toHaveLength(Object.keys(content.faq.items).length)
      const panelTags = panels ?? []
      for (const panel of panelTags) {
        expect(panel).toContain('hidden="until-found"')
      }
    })

    test(`${locale} has metadata, social tags and JSON-LD`, () => {
      const html = readBuilt(pageFile(locale))
      const canonical = `${SITE_ORIGIN}${localePath(locale)}`
      const image = `${SITE_ORIGIN}${ogImagePath(locale)}`

      expect(html).toMatch(/<title>.+<\/title>/)
      expect(metaContent(html, 'name', 'description').length).toBeGreaterThan(
        20,
      )
      expect(html).toContain(`<link rel="canonical" href="${canonical}"`)
      expect(metaContent(html, 'property', 'og:image')).toBe(image)
      const imageFile = path.join(builtSite, ogImagePath(locale))
      expect(existsSync(imageFile)).toBe(true)
      expect(metaContent(html, 'name', 'twitter:image')).toBe(image)
      expect(metaContent(html, 'property', 'og:url')).toBe(canonical)
      expect(metaContent(html, 'property', 'og:locale')).toBe(ogLocale(locale))
      expect(html).toContain(
        `<meta property="og:locale:alternate" content="${ogLocaleAlternates(locale)[0]}"`,
      )
      expect(html.match(/property="og:locale:alternate"/g)).toHaveLength(
        LOCALES.length - 1,
      )
      expect(metaContent(html, 'property', 'og:image:width')).toBe('1200')
      expect(metaContent(html, 'property', 'og:image:height')).toBe('630')
      expect(metaContent(html, 'property', 'og:image:type')).toBe('image/png')
      expect(metaContent(html, 'property', 'og:image:alt')).not.toBe(
        metaContent(html, 'name', 'description'),
      )
      expect(
        metaContent(html, 'property', 'og:image:alt').length,
      ).toBeGreaterThan(20)
      expect(metaContent(html, 'name', 'twitter:image:alt')).toBe(
        metaContent(html, 'property', 'og:image:alt'),
      )
      expect(html).toContain('<link rel="icon" href="/favicon.svg"')
      expect(html).toContain('<link rel="icon" href="/favicon.ico"')
      expect(html).toContain(
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png"',
      )
      expect(html).toContain(
        '<link rel="manifest" href="/manifest.webmanifest"',
      )
      expect(html).toMatch(/<meta name="theme-color" content="#[0-9a-f]{6}"/)
      expect(html).toContain(`dir="${LOCALE_CONFIG[locale].dir}"`)
      const preloads = html
        .matchAll(/<link rel="preload" as="font"[^>]*href="([^"]+)"/g)
        .map((match) => match[1])
        .toArray()
      const expectedPreloads =
        locale === 'ru'
          ? ['geist-cyrillic-wght-normal']
          : LOCALE_CONFIG[locale].preloadFonts.length > 0
            ? ['space-grotesk-latin-wght-normal']
            : []
      expect(preloads).toHaveLength(expectedPreloads.length)
      for (const [index, name] of expectedPreloads.entries()) {
        expect(preloads[index]).toContain(name)
      }

      expect(html).toContain('<link rel="describedby" href="/llms.txt"')

      const graph = jsonLdGraph(html)
      const nodeOf = (type: string): GraphNode => {
        const node = graph.find((entry) => entry['@type'] === type)
        if (!node) throw new Error(`Missing ${type} node`)
        return node
      }
      const app = nodeOf('SoftwareApplication')
      expect(nodeOf('WebSite')).toMatchObject({
        '@id': `${SITE_ORIGIN}/#website`,
        url: `${SITE_ORIGIN}/`,
      })
      expect(nodeOf('WebPage')).toMatchObject({
        url: canonical,
        inLanguage: languageTag(locale),
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      })
      expect(app['@id']).toBe(`${SITE_ORIGIN}/#software`)
      expect(app.sameAs).toEqual([STORE_FACTS.sourceUrl])
      expect(nodeOf('VideoObject')).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
        thumbnailUrl: expect.stringMatching(
          /^https:\/\/i\.ytimg\.com\/vi\/[\w-]+\//,
        ),
        uploadDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        embedUrl: expect.stringMatching(
          /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]+$/,
        ),
      })
      expect(JSON.stringify(graph)).not.toContain('chromewebstore.google.com')
      expect(app.isAccessibleForFree).toBe(true)
      expect(app.author).toEqual({ '@id': nodeOf('Person')['@id'] })
      expect(app.installUrl).toBe(`${SITE_ORIGIN}/install`)
      expect(app.featureList).toHaveLength(6)
      expect(app).not.toHaveProperty('aggregateRating')
      expect(app).toHaveProperty('interactionStatistic')
      expect(JSON.stringify(graph)).not.toContain('FAQPage')
    })
  }

  test('gives every page a unique title, description and canonical', () => {
    const pages = LOCALES.map((locale) => readBuilt(pageFile(locale)))
    const titles = pages.map((html) => /<title>(.+)<\/title>/.exec(html)?.[1])
    const descriptions = pages.map((html) =>
      metaContent(html, 'name', 'description'),
    )
    expect(new Set(titles).size).toBe(LOCALES.length)
    expect(new Set(descriptions).size).toBe(LOCALES.length)
  })
})

test.describe('Umami tracker', () => {
  const pages = [
    ...LOCALES.map((locale) => pageFile(locale)),
    'privacy/index.html',
    '404.html',
  ]

  for (const page of pages) {
    test(`${page} carries exactly one tracker tag`, () => {
      const tags = readBuilt(page).match(/<script\b[^>]*\bsrc="[^"]*"[^>]*>/g)
      expect(tags).toHaveLength(1)
      const [tag] = tags ?? []
      expect(tag).toContain(`src="${UMAMI_SCRIPT_URL}"`)
      expect(tag).toMatch(/\bdefer\b/)
      expect(tag).toContain(`data-website-id="${UMAMI_WEBSITE_ID}"`)
      expect(tag).toContain('data-do-not-track="true"')
      expect(tag).toContain(`data-domains="${UMAMI_DOMAINS}"`)
    })
  }

  test('uses the documented website ID and domain', () => {
    expect(UMAMI_WEBSITE_ID).toBe('3c1202a5-f999-425c-936c-c7e4642223ad')
    expect(UMAMI_DOMAINS).toBe('snug.andryore.dev')
  })
})

test.describe('root files', () => {
  test('lists every locale with alternates in the sitemap', () => {
    const sitemap = readBuilt('sitemap.xml')
    for (const locale of LOCALES) {
      expect(sitemap).toContain(
        `<loc>${SITE_ORIGIN}${localePath(locale)}</loc>`,
      )
    }
    for (const { hreflang, href } of hreflangAlternates()) {
      expect(sitemap).toContain(
        `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`,
      )
    }
  })

  test('allows search crawlers and disallows training crawlers in robots.txt', () => {
    const robots = readBuilt('robots.txt')
    const groups = robots.split('\n\n')
    const groupFor = (agent: string): string =>
      groups.find((entry) => entry.includes(`User-agent: ${agent}\n`)) ?? ''
    expect(groupFor('OAI-SearchBot')).toContain('Allow: /')
    expect(groupFor('OAI-SearchBot')).not.toContain('Disallow: /')
    expect(groupFor('GPTBot')).toContain('Disallow: /')
    expect(groupFor('GPTBot')).not.toContain('Allow: /')
    expect(robots).not.toContain('User-agent: Google-Extended')
    expect(robots).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)
  })

  test('serves llms.txt and a noindex 404', () => {
    const llms = readBuilt('llms.txt')
    expect(llms).toMatch(/^# Snug/)
    for (const locale of LOCALES) {
      expect(llms).toContain(`(${SITE_ORIGIN}${localePath(locale)})`)
    }
    const llmsFull = readBuilt('llms-full.txt')
    expect(llmsFull).toMatch(/^# Snug/)
    for (const file of [llms, llmsFull]) {
      expect(file).toContain(`${SITE_ORIGIN}/install`)
      expect(file).not.toContain('chromewebstore.google.com')
    }
    expect(llmsFull).toContain(REVIEWS[0]!.quote)
    expect(llmsFull).toMatch(/https:\/\/www\.youtube\.com\/watch\?v=[\w-]+/)
    expect(llmsFull.match(/^## Move your bookmarks\. /gm)).toHaveLength(1)
    const lastmods = readBuilt('sitemap.xml')
      .matchAll(/<lastmod>([^<]+)</g)
      .map((match) => match[1])
      .toArray()
    expect(lastmods.length).toBeGreaterThan(0)
    for (const stamp of lastmods) expect(stamp).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(readBuilt('404.html')).toContain(
      '<meta name="robots" content="noindex"',
    )
  })
})

test.describe('privacy page', () => {
  const policy = readFileSync(
    path.join(siteRoot, '../../PRIVACY_POLICY.md'),
    'utf8',
  )
  const headings = policy
    .matchAll(/^##+ (.+)$/gm)
    .map((match) => match[1])
    .toArray()

  test('renders every policy heading from PRIVACY_POLICY.md', () => {
    const html = readBuilt('privacy/index.html')
    expect(headings.length).toBeGreaterThan(3)
    for (const heading of headings) {
      expect(html).toContain(`>${heading}</h`)
    }
  })

  test('states the Umami disclosure and the log fields without a translation notice', () => {
    const html = readBuilt('privacy/index.html')
    expect(html).toContain('<html lang="en"')
    expect(html).not.toContain('English only')
    expect(html).not.toContain('translation-notice')
    expect(html).toContain('Umami Cloud')
    expect(html).toContain('Pageviews')
    expect(html).toContain('Browser, operating system and device type')
    expect(html).toContain('Country')
    expect(html).toContain('sets no cookies')
    expect(html).toContain('Do Not Track')
    expect(html).toContain('referer')
    expect(html).toContain('user-agent')
    expect(html).toContain('masked')
    expect(html).not.toMatch(/Plausible|PostHog|Google Analytics/)
  })

  test('serves the Spanish policy with the notice, the English link and the Umami disclosure', () => {
    const html = readBuilt('es/privacy/index.html')
    expect(html).toContain('<html lang="es"')
    expect(html).toContain('translation-notice')
    expect(html).toContain('prevalece la versión en inglés')
    expect(html).toMatch(
      /<a[^>]*href="\/privacy\/"[^>]*>Leer la versión en inglés/,
    )
    expect(html).toContain('Umami Cloud')
    expect(html).toContain('Respeta la opción No rastrear')
    expect(html).toContain(
      `<link rel="canonical" href="${SITE_ORIGIN}/es/privacy/"`,
    )
  })

  test('lists hreflang and og:locale alternates for the translated locales only', () => {
    const alternates = hreflangAlternates('/privacy/', PRIVACY_PAGE_LOCALES)
    for (const file of ['privacy/index.html', 'es/privacy/index.html']) {
      const html = readBuilt(file)
      for (const { hreflang, href } of alternates) {
        expect(html).toContain(
          `<link rel="alternate" hreflang="${hreflang}" href="${href}"`,
        )
      }
      expect(html).toContain(
        `<link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/privacy/"`,
      )
      expect(html.match(/rel="alternate" hreflang=/g)).toHaveLength(
        alternates.length,
      )
      expect(html.match(/property="og:locale:alternate"/g)).toHaveLength(
        PRIVACY_PAGE_LOCALES.length - 1,
      )
    }
    expect(readBuilt('privacy/index.html')).toContain(
      `<meta property="og:locale:alternate" content="${ogLocale('es')}"`,
    )
  })

  test('points the footer links and language list at privacy pages, marking the current locale', () => {
    const html = readBuilt('es/privacy/index.html')
    const footer = html.slice(html.indexOf('<footer'))
    expect(footer).toMatch(
      /<a[^>]*href="\/es\/privacy\/"[^>]*data-footer-link="privacy"|<a[^>]*data-footer-link="privacy"[^>]*href="\/es\/privacy\/"/,
    )
    for (const locale of LOCALES) {
      expect(footer).toContain(`href="${privacyPath(locale)}"`)
    }
    expect(footer).toMatch(
      /<a[^>]*href="\/es\/privacy\/"[^>]*aria-current="page"|<a[^>]*aria-current="page"[^>]*href="\/es\/privacy\/"/,
    )
    expect(footer.match(/aria-current="page"/g)).toHaveLength(1)
    const header = html.slice(
      html.indexOf('<header'),
      html.indexOf('</header>'),
    )
    expect(header).toContain('/es/privacy/')
    expect(header).not.toContain('/es/&quot;')
  })

  test('is canonical, indexed and listed in the sitemap', () => {
    const html = readBuilt('privacy/index.html')
    expect(html).toContain(
      `<link rel="canonical" href="${SITE_ORIGIN}/privacy/"`,
    )
    const sitemap = readBuilt('sitemap.xml')
    for (const locale of PRIVACY_PAGE_LOCALES) {
      expect(sitemap).toContain(
        `<loc>${SITE_ORIGIN}${privacyPath(locale)}</loc>`,
      )
    }
    expect(sitemap).toContain(
      `<xhtml:link rel="alternate" hreflang="es" href="${SITE_ORIGIN}/es/privacy/"/>`,
    )
  })

  for (const locale of LOCALES) {
    test(`${locale} links the trust section and footer to its privacy page`, () => {
      const html = readBuilt(pageFile(locale))
      const link = `href="${privacyPath(locale)}"`
      expect(html.split(link).length - 1).toBeGreaterThanOrEqual(2)
    })
  }
})

test.describe('site stylesheet', () => {
  const stylesheet = readdirSync(path.join(builtSite, '_astro'))
    .filter((file) => file.endsWith('.css'))
    .map((file) => readBuilt(path.join('_astro', file)))
    .join('\n')

  for (const slot of ['sidebar', 'tabs', 'toast', 'select', 'input-group']) {
    test(`omits ${slot} rules of unused shared components`, () => {
      expect(stylesheet).not.toContain(`data-slot=${slot}`)
      expect(stylesheet).not.toContain(`data-slot="${slot}`)
    })
  }

  test('omits sidebar utilities and sidebar component selectors', () => {
    expect(stylesheet).not.toMatch(/\.(bg|text|border)-sidebar/)
    expect(stylesheet).not.toContain('data-sidebar')
    expect(stylesheet).not.toContain('sidebar-wrapper')
  })

  test('declares metric-matched fallback faces for both families', () => {
    for (const family of ['Geist Fallback', 'Space Grotesk Fallback']) {
      const face = new RegExp(
        String.raw`@font-face\{[^}]*font-family:"?${family}"?[^}]*size-adjust:`,
      )
      expect(stylesheet).toMatch(face)
    }
  })

  test('keeps Cyrillic out of the Space Grotesk fallback face', () => {
    const face = stylesheet.match(
      /@font-face\{[^}]*font-family:"?Space Grotesk Fallback"?[^}]*\}/,
    )?.[0]
    expect(face).toBeDefined()
    const range = face!.match(/unicode-range:([^;}]+)/)?.[1]
    expect(range).toBeDefined()
    expect(range).not.toMatch(/U\+04/i)
  })

  test('ships only the latin subset of Geist Mono', () => {
    expect(stylesheet).toContain('geist-mono-latin-wght-normal')
    expect(stylesheet).not.toContain('geist-mono-latin-ext')
    expect(stylesheet).not.toContain('geist-mono-cyrillic')
  })
})

test.describe('font requests', () => {
  for (const route of ['/', '/de/']) {
    test(`${route} downloads neither geist-cyrillic nor geist-mono-latin-ext`, async ({
      page,
    }) => {
      const fontUrls: string[] = []
      page.on('request', (request) => {
        if (request.resourceType() === 'font') fontUrls.push(request.url())
      })
      await page.goto(route, { waitUntil: 'networkidle' })
      expect(fontUrls.length).toBeGreaterThan(0)
      for (const url of fontUrls) {
        expect(url).not.toContain('geist-cyrillic')
        expect(url).not.toContain('geist-mono-latin-ext')
      }
    })
  }
})
