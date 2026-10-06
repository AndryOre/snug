import { expect, test } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
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

const siteRoot = fileURLToPath(new URL('..', import.meta.url))
const builtSite = path.join(siteRoot, 'dist')

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
      expect(/rel="preload" as="font"/.test(html)).toBe(
        LOCALE_CONFIG[locale].preloadLatinFont,
      )

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
      expect(app.sameAs).toEqual([STORE_FACTS.storeUrl, STORE_FACTS.sourceUrl])
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
      expect(JSON.stringify(graph)).not.toContain('/install')
      expect(app.isAccessibleForFree).toBe(true)
      expect(app.author).toEqual({ '@id': nodeOf('Person')['@id'] })
      expect(app.installUrl).toBe(STORE_FACTS.storeUrl)
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
      expect(file).toContain(STORE_FACTS.storeUrl)
      expect(file).not.toMatch(/snug\.andryore\.dev\/(install|reviews)/)
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

  test('states the English-only scope and the log-only visit counting', () => {
    const html = readBuilt('privacy/index.html')
    expect(html).toContain('<html lang="en"')
    expect(html).toContain('English only')
    expect(html).toContain('no analytics')
    expect(html).toContain('masked')
    expect(html).not.toMatch(/Plausible|PostHog|Umami|Google Analytics/)
    expect(html).not.toMatch(/<script src=/)
  })

  test('has no og:locale:alternate', () => {
    expect(readBuilt('privacy/index.html')).not.toContain('og:locale:alternate')
  })

  test('is canonical, indexed and listed in the sitemap', () => {
    const html = readBuilt('privacy/index.html')
    expect(html).toContain(
      `<link rel="canonical" href="${SITE_ORIGIN}/privacy/"`,
    )
    expect(readBuilt('sitemap.xml')).toContain(
      `<loc>${SITE_ORIGIN}/privacy/</loc>`,
    )
  })

  for (const locale of LOCALES) {
    test(`${locale} links the trust section to /privacy`, () => {
      expect(readBuilt(pageFile(locale))).toContain('href="/privacy/"')
    })
  }
})
