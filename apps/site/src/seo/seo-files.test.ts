import { describe, expect, it } from 'vitest'

import { getContent } from '../i18n/content'
import { PROMO_VIDEO_IDS } from '../i18n/landing'
import {
  hreflangAlternates,
  languageTag,
  localePath,
  LOCALES,
  SITE_ORIGIN,
} from '../i18n/locales'
import { PRIVACY_PAGE_LOCALES, privacyPath } from '../i18n/privacy'
import { REVIEWS } from '../i18n/proof'
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
import { lastCommitDate } from './last-modified'
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

  it('links the counted redirects, never the raw store URL', () => {
    expect(body).toContain(`${SITE_ORIGIN}/reviews`)
    expect(body).not.toContain('chromewebstore.google.com')
  })

  it('quotes every review with attribution and links the video', () => {
    for (const { quote, author, date } of REVIEWS) {
      expect(body).toContain(quote)
      expect(body).toContain(`${author}, ${date}`)
    }
    expect(body).toContain(
      `https://www.youtube.com/watch?v=${PROMO_VIDEO_IDS.en}`,
    )
  })

  it('joins the hero headline into one heading', () => {
    const { headlineLead, headlineAccent } = getContent('en').hero
    expect(body).toContain(`## ${headlineLead} ${headlineAccent}\n`)
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
    const alternates = [
      { hreflang: 'en', href: 'https://example.test/' },
      { hreflang: 'es', href: 'https://example.test/es/' },
    ]
    const entries = [
      { loc: 'https://example.test/', lastmod: '2026-10-05', alternates },
      { loc: 'https://example.test/es/', alternates },
    ]
    const xml = buildSitemapXml(entries)

    expect(xml.match(/<url>/g)).toHaveLength(entries.length)
    expect(xml.match(/<xhtml:link /g)).toHaveLength(
      entries.length * alternates.length,
    )
  })

  it('omits lastmod for entries without a known date', () => {
    const xml = buildSitemapXml([{ loc: 'https://example.test/' }])

    expect(xml).not.toContain('<lastmod>')
  })
})

const FEATURES = ['Export what you choose', 'Undo a replace']

function graphNodes(locale: (typeof LOCALES)[number]) {
  const data = buildStructuredData(locale, 'Description', FEATURES, {
    title: `Snug ${locale}`,
    videoId: PROMO_VIDEO_IDS[locale],
    videoDescription: `Walkthrough ${locale}`,
  })
  const find = (type: string) =>
    data['@graph'].find((node) => node['@type'] === type)
  return {
    data,
    app: find('SoftwareApplication') as Record<string, unknown> & {
      offers: { price: string }
    },
    site: find('WebSite'),
    person: find('Person'),
    page: find('WebPage'),
    video: find('VideoObject'),
  }
}

describe('buildStructuredData', () => {
  it.each(LOCALES)('%s emits one @graph of linked nodes', (locale) => {
    const { data, app, site, person } = graphNodes(locale)

    expect(data['@context']).toBe('https://schema.org')
    expect(data['@graph']).toHaveLength(5)
    expect(app['@id']).toBe(`${SITE_ORIGIN}/#software`)
    expect(site?.['@id']).toBe(`${SITE_ORIGIN}/#website`)
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
    const { app, data } = graphNodes(locale)

    expect(app.downloadUrl).toBe(`${SITE_ORIGIN}/install`)
    expect(app.installUrl).toBe(`${SITE_ORIGIN}/install`)
    expect(app.sameAs).toEqual([STORE_FACTS.sourceUrl])
    expect(JSON.stringify(data)).not.toContain('chromewebstore.google.com')
  })

  it.each(LOCALES)('%s expresses the locale on a WebPage node', (locale) => {
    const { page, site } = graphNodes(locale)

    expect(page).toMatchObject({
      '@type': 'WebPage',
      url: `${SITE_ORIGIN}${localePath(locale)}`,
      inLanguage: languageTag(locale),
      isPartOf: { '@id': site?.['@id'] },
    })
  })

  it.each(LOCALES)('%s has a complete VideoObject', (locale) => {
    const { video } = graphNodes(locale)

    expect(video).toMatchObject({
      '@type': 'VideoObject',
      name: `Snug ${locale}`,
      description: `Walkthrough ${locale}`,
      thumbnailUrl: expect.stringContaining(PROMO_VIDEO_IDS[locale]),
      uploadDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      embedUrl: `https://www.youtube-nocookie.com/embed/${PROMO_VIDEO_IDS[locale]}`,
    })
  })

  it.each(LOCALES)('%s names the site in its own language', (locale) => {
    const { site } = graphNodes(locale)

    expect(site).toMatchObject({
      '@type': 'WebSite',
      name: STORE_FACTS.name,
      url: `${SITE_ORIGIN}/`,
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
  it('stamps every url that has a date', () => {
    const xml = buildSitemapXml([
      { loc: 'https://example.test/', lastmod: '2026-10-05' },
      { loc: 'https://example.test/privacy/', lastmod: '2026-10-05' },
    ])

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
    expect(text).toContain(`${SITE_ORIGIN}/install`)
    expect(text).not.toContain('chromewebstore.google.com')
    expect(text).toContain(
      'redirects to the Chrome Web Store or Microsoft Edge Add-ons listing',
    )
    expect(text).toContain(
      'microsoftedge.microsoft.com/addons/detail/efknehclgcncocgochoibgiiagklcnho',
    )
    for (const locale of LOCALES) {
      expect(text).toContain(`(${SITE_ORIGIN}${localePath(locale)})`)
    }
    expect(text).toContain(`${SITE_ORIGIN}/privacy/`)
  })

  it('serves llms-full.txt as plain text', async () => {
    const response = getLlmsFullTxt()
    expect(response.headers.get('Content-Type')).toContain('text/plain')
    expect(await response.text()).toBe(buildLlmsFullTxt(getContent('en')))
  })

  it('serves a sitemap with one url per locale plus the privacy pages', async () => {
    const response = getSitemapXml()
    expect(response.headers.get('Content-Type')).toContain('application/xml')
    const xml = await response.text()
    expect(xml.match(/<url>/g)).toHaveLength(
      LOCALES.length + PRIVACY_PAGE_LOCALES.length,
    )
    for (const locale of LOCALES) {
      const expected = lastCommitDate([`src/content/${locale}.json`])
      expect(expected).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(xml).toContain(
        `<loc>${SITE_ORIGIN}${localePath(locale)}</loc>\n    <lastmod>${expected}</lastmod>`,
      )
    }
    const privacyAlternates = hreflangAlternates(
      '/privacy/',
      PRIVACY_PAGE_LOCALES,
    )
    for (const locale of PRIVACY_PAGE_LOCALES) {
      expect(xml).toContain(`<loc>${SITE_ORIGIN}${privacyPath(locale)}</loc>`)
    }
    expect(xml).toContain(
      `<xhtml:link rel="alternate" hreflang="es" href="${SITE_ORIGIN}/es/privacy/"/>`,
    )
    expect(xml).toContain(
      `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/privacy/"/>`,
    )
    expect(xml).toContain(`${SITE_ORIGIN}/de/privacy/`)
    expect(xml.match(/<xhtml:link /g)).toHaveLength(
      LOCALES.length * hreflangAlternates().length +
        PRIVACY_PAGE_LOCALES.length * privacyAlternates.length,
    )
    const privacyBlock = xml.slice(xml.indexOf(`<loc>${SITE_ORIGIN}/privacy/`))
    expect(privacyBlock).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/)
  })
})

describe('lastCommitDate', () => {
  it('returns the commit date of a tracked file', () => {
    expect(lastCommitDate(['src/content/en.json'])).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    )
  })

  it('returns undefined for a path git has never seen', () => {
    expect(lastCommitDate(['src/content/never-committed.json'])).toBeUndefined()
  })
})
