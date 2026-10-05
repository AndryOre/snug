import { describe, expect, it } from 'vitest'

import { getContent } from '../i18n/content'
import {
  hreflangAlternates,
  languageTag,
  localePath,
  LOCALES,
  SITE_ORIGIN,
} from '../i18n/locales'
import { GET as getLlmsFullTxt } from '../pages/llms-full.txt'
import { GET as getLlmsTxt } from '../pages/llms.txt'
import { GET as getRobotsTxt } from '../pages/robots.txt'
import { GET as getSitemapXml } from '../pages/sitemap.xml'
import {
  buildLlmsFullTxt,
  buildLlmsTxt,
  buildRobotsTxt,
  buildSitemapXml,
} from './crawlers'
import { STORE_FACTS } from './store-facts'
import { buildStructuredData } from './structured-data'

describe('buildRobotsTxt', () => {
  it('keeps search crawlers and training crawlers in separate groups', () => {
    const groups = buildRobotsTxt().split('\n\n')
    const groupFor = (agent: string): string =>
      groups.find((entry) => entry.includes(`User-agent: ${agent}\n`)) ?? ''

    expect(groupFor('Googlebot')).toContain('Allow: /')
    expect(groupFor('Googlebot')).not.toContain('Disallow: /')
    expect(groupFor('ClaudeBot')).toContain('Disallow: /')
    expect(groupFor('ClaudeBot')).not.toContain('Allow: /')
  })

  it('does not block Google-Extended, which feeds Gemini grounding', () => {
    expect(buildRobotsTxt()).not.toContain('User-agent: Google-Extended')
  })

  it('points at the sitemap', () => {
    expect(buildRobotsTxt()).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)
  })
})

describe('buildLlmsTxt', () => {
  const pages = [
    { languageTag: 'en', title: 'Snug EN', url: `${SITE_ORIGIN}/` },
    { languageTag: 'es', title: 'Snug ES', url: `${SITE_ORIGIN}/es/` },
  ]

  it('starts with the product name and embeds the description', () => {
    const body = buildLlmsTxt('A short description.', pages)
    expect(body).toMatch(/^# Snug\n/)
    expect(body).toContain('> A short description.')
    expect(body).toContain(`${SITE_ORIGIN}/install`)
    expect(body).toContain(`${SITE_ORIGIN}/privacy/`)
  })

  it('lists every locale page', () => {
    const body = buildLlmsTxt('A short description.', pages)
    expect(body).toContain(`[Snug EN](${SITE_ORIGIN}/)`)
    expect(body).toContain(`[Snug ES](${SITE_ORIGIN}/es/)`)
  })

  it('points at llms-full.txt', () => {
    expect(buildLlmsTxt('d', pages)).toContain(`${SITE_ORIGIN}/llms-full.txt`)
  })
})

describe('buildLlmsFullTxt', () => {
  const body = buildLlmsFullTxt(getContent('en'))

  it('flattens the English page to Markdown', () => {
    expect(body).toMatch(/^# Snug\n/)
    expect(body).toContain(`## ${getContent('en').features.heading}`)
    expect(body).toContain(getContent('en').hero.subheadline)
  })

  it('keeps every FAQ question and answer', () => {
    for (const item of Object.values(getContent('en').faq.items)) {
      expect(body).toContain(`### ${item.question}`)
      expect(body).toContain(item.answer)
    }
  })
})

describe('buildSitemapXml', () => {
  it('lists every entry with every alternate', () => {
    const entries = ['https://example.test/', 'https://example.test/es/']
    const alternates = [
      { hreflang: 'en', href: 'https://example.test/' },
      { hreflang: 'es', href: 'https://example.test/es/' },
    ]
    const xml = buildSitemapXml(entries, alternates, [], '2026-10-05')

    expect(xml.match(/<url>/g)).toHaveLength(entries.length)
    expect(xml.match(/<xhtml:link /g)).toHaveLength(
      entries.length * alternates.length,
    )
  })
})

const FEATURES = ['Export what you choose', 'Undo a replace']

function graphNodes(locale: (typeof LOCALES)[number]) {
  const data = buildStructuredData(locale, 'Description', FEATURES)
  const find = (type: string) =>
    data['@graph'].find((node) => node['@type'] === type)
  return {
    data,
    app: find('SoftwareApplication') as Record<string, unknown> & {
      offers: { price: string }
    },
    site: find('WebSite'),
    person: find('Person'),
  }
}

describe('buildStructuredData', () => {
  it.each(LOCALES)('%s emits one @graph of linked nodes', (locale) => {
    const { data, app, site, person } = graphNodes(locale)

    expect(data['@context']).toBe('https://schema.org')
    expect(data['@graph']).toHaveLength(3)
    expect(app['@id']).toBe(`${SITE_ORIGIN}${localePath(locale)}#software`)
    expect(site?.['@id']).toBe(`${SITE_ORIGIN}${localePath(locale)}#website`)
    expect(app.author).toEqual({ '@id': person?.['@id'] })
  })

  it.each(LOCALES)('%s carries the store facts', (locale) => {
    const { app } = graphNodes(locale)

    expect(app.name).toBe(STORE_FACTS.name)
    expect(app.applicationCategory).toBe('BrowserApplication')
    expect(app.operatingSystem).toBe(STORE_FACTS.operatingSystem)
    expect(app.isAccessibleForFree).toBe(true)
    expect(app.offers.price).toBe('0')
    expect(app.featureList).toEqual(FEATURES)
  })

  it.each(LOCALES)('%s points the install links at /install', (locale) => {
    const { app } = graphNodes(locale)

    expect(app.downloadUrl).toBe('https://snug.andryore.dev/install')
    expect(app.installUrl).toBe('https://snug.andryore.dev/install')
  })

  it.each(LOCALES)('%s names the site in its own language', (locale) => {
    const { site } = graphNodes(locale)

    expect(site).toMatchObject({
      '@type': 'WebSite',
      name: STORE_FACTS.name,
      url: `${SITE_ORIGIN}${localePath(locale)}`,
      inLanguage: languageTag(locale),
    })
  })

  it.each(LOCALES)(
    '%s omits aggregateRating and keeps interactionStatistic',
    (locale) => {
      const { app } = graphNodes(locale)

      expect(app).not.toHaveProperty('aggregateRating')
      expect(app).not.toHaveProperty('review')
      expect(app).toHaveProperty('interactionStatistic')
      expect(JSON.stringify(graphNodes(locale).data)).not.toContain('FAQPage')
    },
  )

  it.each(LOCALES)('%s points screenshot at its OG image', (locale) => {
    const { app } = graphNodes(locale)

    expect(app.screenshot).toBe(`${SITE_ORIGIN}/og/og-${locale}.png`)
  })

  it('credits the author as a Person linked to GitHub', () => {
    const { person } = graphNodes('en')

    expect(person).toMatchObject({
      '@type': 'Person',
      name: STORE_FACTS.author.name,
      url: STORE_FACTS.author.url,
      sameAs: [STORE_FACTS.author.url],
    })
  })
})

describe('buildSitemapXml lastmod', () => {
  it('stamps every url, standalone ones included', () => {
    const xml = buildSitemapXml(
      ['https://example.test/'],
      [],
      ['https://example.test/privacy/'],
      '2026-10-05',
    )

    expect(xml.match(/<lastmod>2026-10-05<\/lastmod>/g)).toHaveLength(2)
  })
})

describe('root file routes', () => {
  it('serves robots.txt as plain text', async () => {
    const response = getRobotsTxt()
    expect(response.headers.get('Content-Type')).toContain('text/plain')
    expect(await response.text()).toBe(buildRobotsTxt())
  })

  it('serves llms.txt as plain text', async () => {
    const response = getLlmsTxt()
    expect(response.headers.get('Content-Type')).toContain('text/plain')
    const text = await response.text()
    expect(text).toMatch(/^# Snug\n/)
    expect(text).not.toContain('chromewebstore.google.com')
    for (const locale of LOCALES) {
      expect(text).toContain(`(${SITE_ORIGIN}${localePath(locale)})`)
    }
  })

  it('serves llms-full.txt as plain text', async () => {
    const response = getLlmsFullTxt()
    expect(response.headers.get('Content-Type')).toContain('text/plain')
    expect(await response.text()).toBe(buildLlmsFullTxt(getContent('en')))
  })

  it('serves a sitemap with one url per locale plus the privacy page', async () => {
    const response = getSitemapXml()
    expect(response.headers.get('Content-Type')).toContain('application/xml')
    const xml = await response.text()
    expect(xml.match(/<url>/g)).toHaveLength(LOCALES.length + 1)
    expect(xml.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)).toHaveLength(
      LOCALES.length + 1,
    )
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/privacy/</loc>`)
    expect(xml.match(/<xhtml:link /g)).toHaveLength(
      LOCALES.length * hreflangAlternates().length,
    )
  })
})
