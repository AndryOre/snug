import { describe, expect, it } from 'vitest'

import { COMPETITORS, SNUG_FACTS } from '../content/competitors'
import {
  comparisonSubjects,
  CRITERION_KEYS,
  factCell,
} from './comparison-table'
import { COMPARISON_SLUGS } from './comparisons'

const capabilityKeys = CRITERION_KEYS.filter((key) => key !== 'dataDisclosure')

describe('factCell', () => {
  it('renders a fact the listing does not state as not-listed', () => {
    const maple = COMPETITORS['maple-backup']
    expect(factCell('exportFormats', maple, 'en')).toEqual({
      kind: 'not-listed',
    })
    expect(factCell('import', maple, 'en')).toEqual({ kind: 'not-listed' })
  })

  it('never renders a competitor capability as absent', () => {
    for (const slug of COMPARISON_SLUGS) {
      const kinds = capabilityKeys.map(
        (key) => factCell(key, COMPETITORS[slug], 'en').kind,
      )
      expect(kinds).not.toContain('none')
    }
  })

  it('joins listed formats and flags English store text', () => {
    expect(factCell('exportFormats', SNUG_FACTS, 'en')).toEqual({
      kind: 'text',
      text: 'HTML, JSON, CSV, Markdown, OPML, XBEL',
      isEnglish: false,
    })
    expect(
      factCell('dataDisclosure', COMPETITORS['maple-backup'], 'de'),
    ).toEqual({
      kind: 'text',
      text: 'Personally identifiable information, Authentication information, Website content',
      isEnglish: true,
    })
  })

  it('renders confirmed capabilities as yes and declared absence as none', () => {
    expect(factCell('schedule', SNUG_FACTS, 'en')).toEqual({ kind: 'yes' })
    expect(factCell('cloudCopies', SNUG_FACTS, 'en')).toEqual({ kind: 'none' })
    expect(factCell('dataDisclosure', COMPETITORS['101-export'], 'en')).toEqual(
      { kind: 'none-declared' },
    )
  })

  it('formats users and rating with the locale', () => {
    expect(factCell('usersRating', COMPETITORS['101-export'], 'en')).toEqual({
      kind: 'text',
      text: '30,000 / 3.1 (71)',
      isEnglish: false,
    })
    expect(factCell('usersRating', COMPETITORS['101-export'], 'de')).toEqual({
      kind: 'text',
      text: '30.000 / 3,1 (71)',
      isEnglish: false,
    })
  })

  it('renders the language count as a number', () => {
    expect(factCell('languages', SNUG_FACTS, 'en')).toEqual({
      kind: 'text',
      text: '10',
      isEnglish: false,
    })
  })
})

describe('comparisonSubjects', () => {
  it('lists Snug first, then each comparison competitor', () => {
    const subjects = comparisonSubjects()
    expect(subjects[0]).toMatchObject({ isSnug: true, name: 'Snug' })
    expect(subjects.slice(1).map((subject) => subject.slug)).toEqual([
      ...COMPARISON_SLUGS,
    ])
  })
})
