import { describe, expect, it } from 'vitest'

import {
  getHowToIndexMeta,
  HOW_TO_INDEX_LOCALES,
  HOW_TO_SLUGS,
  howToPageLocales,
  howToPath,
} from '../i18n/how-to'
import { SITE_ORIGIN } from '../i18n/locales'
import {
  howToCrumbs,
  howToIndexDescriptor,
  howToPageDescriptor,
} from './how-to-descriptor'

const SLUG = HOW_TO_SLUGS[0] ?? ''

describe('howToPageDescriptor', () => {
  it('uses the page path and only the locales that carry the page', () => {
    const page = howToPageDescriptor('en', SLUG)
    expect(page.path('en')).toBe(`/how-to/${SLUG}/`)
    expect(page.alternateLocales).toEqual(howToPageLocales(SLUG))
  })

  it('serializes a WebPage and a BreadcrumbList with the page last', () => {
    const page = howToPageDescriptor('en', SLUG)
    const graph = (
      page.jsonLd as {
        '@graph': {
          '@type': string
          itemListElement?: { position: number; item: string }[]
        }[]
      }
    )['@graph']
    expect(graph.map((node) => node['@type'])).toEqual([
      'WebPage',
      'BreadcrumbList',
    ])
    const items = graph[1]?.itemListElement ?? []
    expect(items.map((item) => item.position)).toEqual([1, 2, 3])
    expect(items[2]?.item).toBe(`${SITE_ORIGIN}${howToPath('en', SLUG)}`)
  })
})

describe('howToIndexDescriptor', () => {
  it('lives at the locale index path and lists the locales that have it', () => {
    const page = howToIndexDescriptor('de')
    expect(page.path('en')).toBe('/how-to/')
    expect(page.path('de')).toBe('/de/how-to/')
    expect(page.alternateLocales).toEqual(HOW_TO_INDEX_LOCALES)
    expect(page.meta.title).toBe(getHowToIndexMeta('de').title)
  })

  it('serializes CollectionPage, ItemList and BreadcrumbList with every page once', () => {
    const page = howToIndexDescriptor('en')
    const graph = (
      page.jsonLd as {
        '@graph': {
          '@type': string
          itemListElement?: { position: number; url?: string; item?: string }[]
        }[]
      }
    )['@graph']
    expect(graph.map((node) => node['@type'])).toEqual([
      'CollectionPage',
      'ItemList',
      'BreadcrumbList',
    ])
    const urls = (graph[1]?.itemListElement ?? []).map((item) => item.url)
    expect(urls.toSorted((a, b) => String(a).localeCompare(String(b)))).toEqual(
      HOW_TO_SLUGS.map(
        (slug) => `${SITE_ORIGIN}${howToPath('en', slug)}`,
      ).toSorted((a, b) => a.localeCompare(b)),
    )
    const crumbs = graph[2]?.itemListElement ?? []
    expect(crumbs.map((crumb) => crumb.item)).toEqual([
      `${SITE_ORIGIN}/`,
      `${SITE_ORIGIN}/how-to/`,
    ])
  })
})

describe('howToCrumbs', () => {
  it('links Snug and How-to and leaves the page itself last', () => {
    const crumbs = howToCrumbs('en', SLUG)
    expect(crumbs.map((crumb) => crumb.path)).toEqual([
      '/',
      '/how-to/',
      howToPath('en', SLUG),
    ])
  })
})
