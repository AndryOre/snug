import { describe, expect, it } from 'vitest'

import {
  BUILT_IN_EXPORT,
  COMPARISON_PAGE_SLUGS,
  COMPETITORS,
  SNUG_FACTS,
} from './competitors'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const STORE_URL = /^https:\/\/chromewebstore\.google\.com\/detail\/[a-p]{32}$/

describe('COMPETITORS', () => {
  const entries = Object.entries(COMPETITORS)

  it('holds the six tracked listings', () => {
    expect(
      Object.keys(COMPETITORS).toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(
      [
        '101-export',
        'bookmark-folder-import-export',
        'bookmarks-exporter',
        'export-selective-bookmarks',
        'maple-backup',
        'selective-bookmarks-export-tool',
      ].toSorted((a, b) => a.localeCompare(b)),
    )
  })

  it.each(entries)('%s is dated and linked to the store', (_slug, entry) => {
    expect(entry.verifiedOn).toMatch(ISO_DATE)
    expect(entry.lastUpdated).toMatch(ISO_DATE)
    expect(entry.storeUrl).toMatch(STORE_URL)
  })

  it.each(entries)('%s never states absence as false', (_slug, entry) => {
    const capabilities = [
      entry.import,
      entry.chooseFolders,
      entry.schedule,
      entry.cloudCopies,
      entry.browsers,
      entry.exportFormats,
      entry.languageCount,
      entry.dataDisclosure,
    ]
    expect(capabilities).not.toContain(false)
  })

  it('enables comparison pages for exactly three slugs', () => {
    const withPage = entries
      .filter(([, entry]) => entry.comparisonPage)
      .map(([slug]) => slug)
      .toSorted((a, b) => a.localeCompare(b))
    expect(withPage).toEqual([
      '101-export',
      'maple-backup',
      'selective-bookmarks-export-tool',
    ])
    expect(
      [...COMPARISON_PAGE_SLUGS].toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(withPage)
  })
})

describe('SNUG_FACTS', () => {
  it('is dated and linked to the store', () => {
    expect(SNUG_FACTS.verifiedOn).toMatch(ISO_DATE)
    expect(SNUG_FACTS.storeUrl).toMatch(STORE_URL)
  })

  it('lists the six export formats the extension ships', () => {
    expect(SNUG_FACTS.exportFormats).toEqual([
      'HTML',
      'JSON',
      'CSV',
      'Markdown',
      'OPML',
      'XBEL',
    ])
  })

  it('counts the extension locales', () => {
    expect(SNUG_FACTS.languageCount).toBe(10)
  })
})

describe('BUILT_IN_EXPORT', () => {
  it('is dated', () => {
    expect(BUILT_IN_EXPORT.verifiedOn).toMatch(ISO_DATE)
  })
})
