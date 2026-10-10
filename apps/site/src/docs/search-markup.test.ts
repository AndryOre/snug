import { describe, expect, it } from 'vitest'

import { restrictToMarkTags } from './search-markup'

describe('restrictToMarkTags', () => {
  it('keeps the highlight tags Pagefind puts around matches', () => {
    expect(restrictToMarkTags('Two <mark>duplicates</mark> match')).toBe(
      'Two <mark>duplicates</mark> match',
    )
  })

  it('keeps character references untouched', () => {
    expect(restrictToMarkTags('Fish &amp; chips &lt;3')).toBe(
      'Fish &amp; chips &lt;3',
    )
  })

  it('turns every other tag into inert text', () => {
    expect(restrictToMarkTags('<img src=x onerror=alert(1)>')).toBe(
      '&lt;img src=x onerror=alert(1)>',
    )
    expect(restrictToMarkTags('<script>alert(1)</script>')).toBe(
      '&lt;script>alert(1)&lt;/script>',
    )
  })

  it('does not let a mark tag carry attributes', () => {
    expect(restrictToMarkTags('<mark onclick="x()">hit</mark>')).toBe(
      '&lt;mark onclick="x()">hit</mark>',
    )
  })
})
