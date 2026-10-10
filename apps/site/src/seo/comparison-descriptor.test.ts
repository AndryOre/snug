import { describe, expect, it } from 'vitest'

import { COMPARISON_PAGE_LOCALES, COMPARISON_SLUGS } from '../i18n/comparisons'
import { comparisonPageDescriptor } from './comparison-descriptor'

describe('comparisonPageDescriptor', () => {
  it('describes the Alternatives page with a two-step breadcrumb', () => {
    const page = comparisonPageDescriptor('en')
    expect(page.path('en')).toBe('/alternatives/')
    expect(page.alternateLocales).toEqual(COMPARISON_PAGE_LOCALES)
    const graph = (page.jsonLd as { '@graph': { '@type': string }[] })['@graph']
    expect(graph.map((node) => node['@type'])).toEqual([
      'WebPage',
      'BreadcrumbList',
    ])
    expect(JSON.stringify(page.jsonLd)).not.toContain('aggregateRating')
  })

  it('ends a comparison breadcrumb on the competitor and its own path', () => {
    const slug = COMPARISON_SLUGS[0]
    expect(slug).toBeDefined()
    const page = comparisonPageDescriptor('en', slug)
    const list = (
      page.jsonLd as {
        '@graph': { itemListElement?: { name: string; item: string }[] }[]
      }
    )['@graph'][1]?.itemListElement
    expect(list).toHaveLength(3)
    expect(list?.[2]?.item).toContain(`/alternatives/${slug}/`)
  })
})
