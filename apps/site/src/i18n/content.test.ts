import { describe, expect, it } from 'vitest'

import {
  assertSameKeys,
  flattenKeys,
  getContent,
  loadAllContent,
} from './content'
import { LOCALES } from './locales'

function flattenValues(node: unknown, prefix = ''): [string, string][] {
  if (typeof node === 'string') return [[prefix, node]]
  const entries: [string, string][] = []
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    entries.push(...flattenValues(value, prefix ? `${prefix}.${key}` : key))
  }
  return entries
}

describe('content', () => {
  it('flattens nested keys', () => {
    expect(flattenKeys({ b: 'x', a: { c: 'y' } })).toEqual(['a.c', 'b'])
  })

  it('fails on a missing key', () => {
    expect(() =>
      assertSameKeys({ meta: { title: 'a', description: 'b' } }, 'es', {
        meta: { title: 'a' },
      }),
    ).toThrow(/missing \[meta\.description\]/)
  })

  it('fails on an unexpected key', () => {
    expect(() => assertSameKeys({ a: 'x' }, 'es', { a: 'x', b: 'y' })).toThrow(
      /unexpected \[b\]/,
    )
  })

  it('fails when a locale file is absent', () => {
    expect(() => loadAllContent({})).toThrow(/Missing content file/)
  })

  it('has complete content for every locale', () => {
    expect(
      Object.keys(loadAllContent()).toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(LOCALES.toSorted((a, b) => a.localeCompare(b)))
  })

  it('memoizes the bundled content', () => {
    expect(loadAllContent()).toBe(loadAllContent())
    expect(getContent('en')).toBe(getContent('en'))
  })

  it('has no backtick in any content value of any locale', () => {
    for (const locale of LOCALES) {
      const offenders = flattenValues(getContent(locale))
        .filter(([, value]) => value.includes('`'))
        .map(([key]) => `${locale}:${key}`)
      expect(offenders).toEqual([])
    }
  })

  it('has no leaked authoring note, TODO or straight double quote in any prose value', () => {
    const forbidden = /Sources:|Context:|Product:|TODO|"/
    for (const locale of LOCALES) {
      const offenders = flattenValues(getContent(locale))
        .filter(([, value]) => forbidden.test(value))
        .map(([key]) => `${locale}:${key}`)
      expect(offenders).toEqual([])
    }
  })

  it('gives every locale its own non-empty OG image alt', () => {
    const alts = LOCALES.map((locale) => getContent(locale).seo.ogImageAlt)
    for (const alt of alts) expect(alt.trim().length).toBeGreaterThan(20)
    expect(new Set(alts).size).toBe(LOCALES.length)
  })

  it('quotes the Bookmarks file name in the preview card and formats FAQ', () => {
    const quoted = /[“«„「]\u{A0}?Bookmarks\u{A0}?[”»“」]/u
    for (const locale of LOCALES) {
      const content = getContent(locale)
      expect(content.features.items.preview.body).toMatch(quoted)
      expect(content.faq.items.formats.answer).toMatch(quoted)
    }
  })
})
