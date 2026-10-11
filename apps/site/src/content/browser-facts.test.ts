import { describe, expect, it } from 'vitest'

import { BROWSER_FACTS, BROWSER_SLUGS, sourcedFacts } from './browser-facts'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

describe('BROWSER_FACTS', () => {
  it('covers the six browsers', () => {
    expect([...BROWSER_SLUGS].toSorted((a, b) => a.localeCompare(b))).toEqual([
      'brave',
      'chrome',
      'edge',
      'firefox',
      'opera',
      'safari',
    ])
  })

  it.each(Object.entries(BROWSER_FACTS))('%s is dated', (_slug, facts) => {
    expect(facts.verifiedOn).toMatch(ISO_DATE)
    expect(facts.versionChecked).not.toBe('')
  })

  it.each(Object.entries(BROWSER_FACTS))(
    '%s sources every listed fact from an https page',
    (_slug, facts) => {
      for (const { label, fact } of sourcedFacts(facts)) {
        expect(`${label} ${fact.sourceUrl}`).toMatch(/ https:\/\/\S+$/)
      }
    },
  )

  it('lists at least one sourced fact per browser', () => {
    for (const facts of Object.values(BROWSER_FACTS)) {
      expect(sourcedFacts(facts).length).toBeGreaterThan(0)
    }
  })

  it('never states absence as false', () => {
    for (const facts of Object.values(BROWSER_FACTS)) {
      expect(JSON.stringify(facts)).not.toContain('false')
    }
  })

  it('keeps menu paths as lists of non-empty labels', () => {
    for (const facts of Object.values(BROWSER_FACTS)) {
      for (const fact of [facts.exportPath, facts.importPath]) {
        if (fact === 'not-listed') continue
        expect(fact.value.length).toBeGreaterThan(1)
        expect(fact.value.every((label) => label.trim() !== '')).toBe(true)
      }
    }
  })

  it('sources the HTML export format of Chrome', () => {
    expect(BROWSER_FACTS.chrome.exportFormats).toEqual({
      value: ['HTML'],
      sourceUrl: 'https://support.google.com/chrome/answer/96816',
    })
  })
})
