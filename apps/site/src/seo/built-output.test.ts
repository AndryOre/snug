import { build } from 'astro'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  hreflangAlternates,
  localePath,
  LOCALES,
  ogImagePath,
  SITE_ORIGIN,
} from '../i18n/locales'

const siteRoot = fileURLToPath(new URL('../..', import.meta.url))
const builtSite = path.join(siteRoot, 'dist-test')

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

function jsonLd(html: string): Record<string, unknown> {
  const match = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(
    html,
  )
  if (!match) throw new Error('Missing JSON-LD')
  return JSON.parse(match[1] ?? '') as Record<string, unknown>
}

beforeAll(async () => {
  await build({ root: siteRoot, outDir: builtSite, logLevel: 'error' })
}, 180_000)

afterAll(() => {
  rmSync(builtSite, { recursive: true, force: true })
})

describe('built pages', () => {
  it.each(LOCALES)('%s has metadata, social tags and JSON-LD', (locale) => {
    const html = readBuilt(pageFile(locale))
    const canonical = `${SITE_ORIGIN}${localePath(locale)}`
    const image = `${SITE_ORIGIN}${ogImagePath(locale)}`

    expect(html).toMatch(/<title>.+<\/title>/)
    expect(metaContent(html, 'name', 'description').length).toBeGreaterThan(20)
    expect(html).toContain(`<link rel="canonical" href="${canonical}"`)
    expect(metaContent(html, 'property', 'og:image')).toBe(image)
    const imageFile = path.join(builtSite, ogImagePath(locale))
    expect(existsSync(imageFile)).toBe(true)
    expect(metaContent(html, 'name', 'twitter:image')).toBe(image)
    expect(metaContent(html, 'property', 'og:url')).toBe(canonical)

    const data = jsonLd(html)
    expect(data['@type']).toBe('SoftwareApplication')
    expect(data.url).toBe(canonical)
    expect(data.isAccessibleForFree).toBe(true)
    expect(data.aggregateRating).toMatchObject({
      ratingValue: 4.8,
      ratingCount: 20,
    })
  })

  it('gives every page a unique title, description and canonical', () => {
    const pages = LOCALES.map((locale) => readBuilt(pageFile(locale)))
    const titles = pages.map((html) => /<title>(.+)<\/title>/.exec(html)?.[1])
    const descriptions = pages.map((html) =>
      metaContent(html, 'name', 'description'),
    )
    expect(new Set(titles).size).toBe(LOCALES.length)
    expect(new Set(descriptions).size).toBe(LOCALES.length)
  })
})

describe('root files', () => {
  it('lists every locale with alternates in the sitemap', () => {
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

  it('allows search crawlers and disallows training crawlers in robots.txt', () => {
    const robots = readBuilt('robots.txt')
    const groups = robots.split('\n\n')
    const groupFor = (agent: string): string =>
      groups.find((entry) => entry.includes(`User-agent: ${agent}\n`)) ?? ''
    expect(groupFor('OAI-SearchBot')).toContain('Allow: /')
    expect(groupFor('OAI-SearchBot')).not.toContain('Disallow: /')
    expect(groupFor('GPTBot')).toContain('Disallow: /')
    expect(groupFor('GPTBot')).not.toContain('Allow: /')
    expect(robots).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)
  })

  it('serves llms.txt and a noindex 404', () => {
    expect(readBuilt('llms.txt')).toMatch(/^# Snug/)
    expect(readBuilt('404.html')).toContain(
      '<meta name="robots" content="noindex"',
    )
  })
})

describe('privacy page', () => {
  const policy = readFileSync(
    path.join(siteRoot, '../../PRIVACY_POLICY.md'),
    'utf8',
  )
  const headings = policy
    .matchAll(/^##+ (.+)$/gm)
    .map((match) => match[1])
    .toArray()

  it('renders every policy heading from PRIVACY_POLICY.md', () => {
    const html = readBuilt('privacy/index.html')
    expect(headings.length).toBeGreaterThan(3)
    for (const heading of headings) {
      expect(html).toContain(`>${heading}</h`)
    }
  })

  it('states the English-only scope and the log-only visit counting', () => {
    const html = readBuilt('privacy/index.html')
    expect(html).toContain('<html lang="en"')
    expect(html).toContain('English only')
    expect(html).toContain('no analytics')
    expect(html).toContain('masked')
    expect(html).not.toMatch(/Plausible|PostHog|Umami|Google Analytics/)
    expect(html).not.toMatch(/<script src=/)
  })

  it('is canonical, indexed and listed in the sitemap', () => {
    const html = readBuilt('privacy/index.html')
    expect(html).toContain(
      `<link rel="canonical" href="${SITE_ORIGIN}/privacy/"`,
    )
    expect(readBuilt('sitemap.xml')).toContain(
      `<loc>${SITE_ORIGIN}/privacy/</loc>`,
    )
  })

  it.each(LOCALES)('%s links the trust section to /privacy', (locale) => {
    expect(readBuilt(pageFile(locale))).toContain('href="/privacy/"')
  })
})
