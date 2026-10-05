import { describe, expect, it } from 'vitest'

import { hreflangAlternates, LOCALES, SITE_ORIGIN } from '../i18n/locales'
import { GET as getLlmsTxt } from '../pages/llms.txt'
import { GET as getRobotsTxt } from '../pages/robots.txt'
import { GET as getSitemapXml } from '../pages/sitemap.xml'
import { buildLlmsTxt, buildRobotsTxt, buildSitemapXml } from './crawlers'
import { STORE_FACTS } from './store-facts'
import { buildSoftwareAppJsonLd } from './structured-data'

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

  it('points at the sitemap', () => {
    expect(buildRobotsTxt()).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)
  })
})

describe('buildLlmsTxt', () => {
  it('starts with the product name and embeds the description', () => {
    const body = buildLlmsTxt('A short description.')
    expect(body).toMatch(/^# Snug\n/)
    expect(body).toContain('> A short description.')
    expect(body).toContain(`${SITE_ORIGIN}/install`)
    expect(body).toContain(`${SITE_ORIGIN}/privacy/`)
  })
})

describe('buildSitemapXml', () => {
  it('lists every entry with every alternate', () => {
    const entries = ['https://example.test/', 'https://example.test/es/']
    const alternates = [
      { hreflang: 'en', href: 'https://example.test/' },
      { hreflang: 'es', href: 'https://example.test/es/' },
    ]
    const xml = buildSitemapXml(entries, alternates)

    expect(xml.match(/<url>/g)).toHaveLength(entries.length)
    expect(xml.match(/<xhtml:link /g)).toHaveLength(
      entries.length * alternates.length,
    )
  })
})

describe('buildSoftwareAppJsonLd', () => {
  it.each(LOCALES)('%s carries the store facts', (locale) => {
    const data = buildSoftwareAppJsonLd(locale, 'Description')

    expect(data['@type']).toBe('SoftwareApplication')
    expect(data.name).toBe(STORE_FACTS.name)
    expect(data.isAccessibleForFree).toBe(true)
    expect(data.offers.price).toBe('0')
  })

  it.each(LOCALES)(
    '%s omits aggregateRating and keeps interactionStatistic',
    (locale) => {
      const data: Record<string, unknown> = buildSoftwareAppJsonLd(
        locale,
        'Description',
      )

      expect(data).not.toHaveProperty('aggregateRating')
      expect(data).toHaveProperty('interactionStatistic')
    },
  )

  it.each(LOCALES)('%s points screenshot at its OG image', (locale) => {
    const data = buildSoftwareAppJsonLd(locale, 'Description')

    expect(data.screenshot).toBe(`${SITE_ORIGIN}/og/og-${locale}.png`)
  })

  it('credits the author as a Person', () => {
    const data = buildSoftwareAppJsonLd('en', 'Description')

    expect(data.author).toMatchObject({
      '@type': 'Person',
      name: STORE_FACTS.author.name,
      url: STORE_FACTS.author.url,
    })
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
    expect(await response.text()).toMatch(/^# Snug\n/)
  })

  it('serves a sitemap with one url per locale plus the privacy page', async () => {
    const response = getSitemapXml()
    expect(response.headers.get('Content-Type')).toContain('application/xml')
    const xml = await response.text()
    expect(xml.match(/<url>/g)).toHaveLength(LOCALES.length + 1)
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/privacy/</loc>`)
    expect(xml.match(/<xhtml:link /g)).toHaveLength(
      LOCALES.length * hreflangAlternates().length,
    )
  })
})
