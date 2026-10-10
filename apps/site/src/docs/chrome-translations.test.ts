import { describe, expect, it } from 'vitest'

import { formatZeroResults } from './chrome-translations'

describe('formatZeroResults', () => {
  it('joins the sentence and the hint with the Pagefind placeholder', () => {
    expect(
      formatZeroResults({
        noResults: 'No results for {query}.',
        hint: 'Try a shorter word.',
      }),
    ).toBe('No results for [SEARCH_TERM]. Try a shorter word.')
  })
})
