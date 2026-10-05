import { describe, expect, it } from 'vitest'

import {
  assertSameKeys,
  flattenKeys,
  getContent,
  loadAllContent,
} from './content'
import { LOCALES } from './locales'

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
})
