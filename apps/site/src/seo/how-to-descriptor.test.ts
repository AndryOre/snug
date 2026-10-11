import { describe, expect, it } from 'vitest'

import { HOW_TO_SLUGS, howToPageLocales, howToPath } from '../i18n/how-to'
import { SITE_ORIGIN } from '../i18n/locales'
import { howToCrumbs, howToPageDescriptor } from './how-to-descriptor'

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
