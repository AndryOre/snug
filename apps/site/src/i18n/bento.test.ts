import { describe, expect, it } from 'vitest'

import { BENTO_KEYS, bentoTitles, getBentoCopy } from './bento'
import { LOCALES } from './locales'

describe('bento copy', () => {
  it('has a title and a sentence for every card in every locale', () => {
    for (const locale of LOCALES) {
      const copy = getBentoCopy(locale)
      for (const key of BENTO_KEYS) {
        expect(copy[key].title.length).toBeGreaterThan(0)
        expect(copy[key].body.length).toBeGreaterThan(0)
      }
    }
  })

  it('lists the four titles in card order for the feature list', () => {
    expect(bentoTitles('en')).toEqual([
      'Export anything',
      'Import with a preview',
      'Back up on a schedule',
      'Drop files in the popup',
    ])
  })
})
