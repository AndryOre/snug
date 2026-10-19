import { describe, expect, it } from 'vitest'

import { LOCALES } from '../i18n/locales'
import {
  buildDocumentationHead,
  buildPaginationHead,
  type DocumentationHeadInput,
  replaceOrPushHead,
} from './head-tags'
import type { HeadEntry } from './page-meta'

interface JsonLdGraph {
  '@context': string
  '@graph': {
    '@type': string
    itemListElement: { item: string }[]
  }[]
}

function parseGraph(content: string | undefined): JsonLdGraph {
  return JSON.parse(content ?? '{}') as JsonLdGraph
}

const input: DocumentationHeadInput = {
  locale: 'es',
  sourceId: 'guide/exporting',
  title: 'Exporting',
  seoTitle: 'Export Chrome Bookmarks',
  description: 'Export your bookmarks.',
  imageAlt: 'Logotipo de Snug',
  dateModified: '2026-10-01',
}

function contents(head: HeadEntry[], key: 'name' | 'property', value: string) {
  return head
    .filter((entry) => entry.attrs?.[key] === value)
    .map((entry) => entry.attrs?.['content'])
}

describe('buildDocumentationHead', () => {
  const head = buildDocumentationHead(input)

  it('emits the full Open Graph image set and Twitter tags', () => {
    const image = 'https://snug.andryore.dev/og/og-es.png'
    expect(contents(head, 'property', 'og:image')).toEqual([image])
    expect(contents(head, 'property', 'og:image:width')).toEqual(['1200'])
    expect(contents(head, 'property', 'og:image:height')).toEqual(['630'])
    expect(contents(head, 'property', 'og:image:type')).toEqual(['image/png'])
    expect(contents(head, 'property', 'og:image:alt')).toEqual([
      'Logotipo de Snug',
    ])
    expect(contents(head, 'name', 'twitter:image')).toEqual([image])
    expect(contents(head, 'name', 'twitter:image:alt')).toEqual([
      'Logotipo de Snug',
    ])
    expect(contents(head, 'name', 'twitter:title')).toEqual([
      'Export Chrome Bookmarks',
    ])
  })

  it('localizes og:locale and lists every other locale as an alternate', () => {
    expect(contents(head, 'property', 'og:locale')).toEqual(['es_ES'])
    const alternates = contents(head, 'property', 'og:locale:alternate')
    expect(alternates).toHaveLength(LOCALES.length - 1)
    expect(alternates).toContain('en_US')
    expect(alternates).not.toContain('es_ES')
  })

  it('emits one WebPage and BreadcrumbList graph with no HowTo or FAQ', () => {
    const scripts = head.filter((entry) => entry.tag === 'script')
    expect(scripts).toHaveLength(1)
    const graph = parseGraph(scripts[0]?.content)
    expect(graph['@context']).toBe('https://schema.org')
    const [page, breadcrumb] = graph['@graph']
    expect(page).toMatchObject({
      '@type': 'WebPage',
      url: 'https://snug.andryore.dev/es/guide/exporting/',
      name: 'Export Chrome Bookmarks',
      inLanguage: 'es',
      dateModified: '2026-10-01',
      isPartOf: { '@id': 'https://snug.andryore.dev/#website' },
    })
    expect(breadcrumb?.['@type']).toBe('BreadcrumbList')
    expect(breadcrumb?.itemListElement.map((item) => item.item)).toEqual([
      'https://snug.andryore.dev/es/',
      'https://snug.andryore.dev/es/guide/',
      'https://snug.andryore.dev/es/guide/exporting/',
    ])
    expect(JSON.stringify(graph)).not.toMatch(/HowTo|FAQPage/)
  })

  it("gives What's new a two-step trail", () => {
    const changelog = buildDocumentationHead({
      ...input,
      locale: 'en',
      sourceId: 'changelog',
    })
    const graph = parseGraph(changelog.at(-1)?.content)
    expect(graph['@graph'][1]?.itemListElement).toHaveLength(2)
  })
})

describe('replaceOrPushHead', () => {
  it('replaces tags that share a name or property and keeps the rest', () => {
    const head: HeadEntry[] = [
      { tag: 'meta', attrs: { property: 'og:locale', content: 'es' } },
      { tag: 'meta', attrs: { name: 'twitter:card', content: 'x' } },
      { tag: 'link', attrs: { rel: 'canonical', href: '/a/' } },
    ]
    const result = replaceOrPushHead(head, [
      { tag: 'meta', attrs: { property: 'og:locale', content: 'es_ES' } },
    ])
    expect(result).toEqual([
      { tag: 'meta', attrs: { name: 'twitter:card', content: 'x' } },
      { tag: 'link', attrs: { rel: 'canonical', href: '/a/' } },
      { tag: 'meta', attrs: { property: 'og:locale', content: 'es_ES' } },
    ])
  })
})

describe('buildPaginationHead', () => {
  it('links the previous and next pages by absolute URL', () => {
    expect(
      buildPaginationHead({
        prev: { href: '/es/guide/exporting/' },
        next: { href: '/es/guide/settings/' },
      }),
    ).toEqual([
      {
        tag: 'link',
        attrs: {
          rel: 'prev',
          href: 'https://snug.andryore.dev/es/guide/exporting/',
        },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'next',
          href: 'https://snug.andryore.dev/es/guide/settings/',
        },
      },
    ])
  })

  it('emits only the neighbour that exists', () => {
    expect(buildPaginationHead({ next: { href: '/guide/faq/' } })).toEqual([
      {
        tag: 'link',
        attrs: { rel: 'next', href: 'https://snug.andryore.dev/guide/faq/' },
      },
    ])
    expect(buildPaginationHead({})).toEqual([])
  })

  it('keeps an absolute href as it is', () => {
    const [entry] = buildPaginationHead({
      prev: { href: 'https://example.com/a/' },
    })
    expect(entry?.attrs.href).toBe('https://example.com/a/')
  })
})
