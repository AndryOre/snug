import { describe, expect, it } from 'vitest'

import { getPageMeta } from '../i18n/content'
import { DEFAULT_LOCALE, LOCALES } from '../i18n/locales'
import { loadLocalizedCatalog } from './catalog'
import { applySeoTitle } from './page-meta'
import { parseTranslation } from './translations'

const SITE_TITLE_SUFFIX_LENGTH = ' | Snug'.length
const pages = loadLocalizedCatalog()

describe('per-page description and SEO title', () => {
  for (const locale of LOCALES) {
    const localePages = pages.filter((page) => page.locale === locale)

    describe(`locale ${locale}`, () => {
      it('gives every page a description that is not the home description', () => {
        const homeDescription = getPageMeta(locale).description
        expect(localePages).toHaveLength(7)
        for (const page of localePages) {
          expect(page.description.length).toBeGreaterThan(20)
          expect(page.description.length).toBeLessThanOrEqual(155)
          expect(page.description).not.toBe(homeDescription)
        }
      })

      it('gives every page a unique description and SEO title', () => {
        const descriptions = localePages.map((page) => page.description)
        const seoTitles = localePages.map((page) => page.seoTitle)
        expect(new Set(descriptions).size).toBe(descriptions.length)
        expect(new Set(seoTitles).size).toBe(seoTitles.length)
      })

      it('keeps the full document title within 60 characters', () => {
        for (const page of localePages) {
          expect(
            page.seoTitle.length + SITE_TITLE_SUFFIX_LENGTH,
          ).toBeLessThanOrEqual(60)
        }
      })

      if (locale !== DEFAULT_LOCALE) {
        it('translates the copy instead of reusing the English text', () => {
          const english = pages.filter((page) => page.locale === DEFAULT_LOCALE)
          for (const page of localePages) {
            const source = english.find(
              (candidate) => candidate.sourcePath === page.sourcePath,
            )
            expect(page.description).not.toBe(source?.description)
            expect(page.seoTitle).not.toBe(source?.seoTitle)
          }
        })
      }
    })
  }

  it('titles the Guide overview with more than "Usage"', () => {
    const guide = pages.find(
      (page) => page.locale === 'en' && page.sourcePath === 'docs/usage.md',
    )
    expect(guide?.title).toBe('Usage')
    expect(guide?.seoTitle).not.toBe('Usage')
    expect(guide?.seoTitle.length).toBeGreaterThan('Usage'.length)
  })
})

describe('parseTranslation search copy', () => {
  it('reads an optional description and seoTitle', () => {
    const parsed = parseTranslation(
      '---\ntitle: T\nsourceHash: a\ndescription: "D"\nseoTitle: "S"\n---\nbody',
      'es/x.md',
    )
    expect(parsed).toMatchObject({ description: 'D', seoTitle: 'S' })
  })

  it('joins a value that a formatter wrapped onto indented lines', () => {
    const parsed = parseTranslation(
      "---\ntitle: T\nsourceHash: a\ndescription:\n  'It''s one\n  sentence.'\n---\nb",
      'es/x.md',
    )
    expect(parsed.description).toBe("It's one sentence.")
  })

  it('leaves them undefined when absent', () => {
    const parsed = parseTranslation('---\ntitle: T\nsourceHash: a\n---\nb', 'x')
    expect(parsed.description).toBeUndefined()
    expect(parsed.seoTitle).toBeUndefined()
  })
})

describe('applySeoTitle', () => {
  it('swaps the page title in <title> and og:title and keeps the suffix', () => {
    const head = [
      { tag: 'title', content: 'Usage | Snug' },
      { tag: 'meta', attrs: { property: 'og:title', content: 'Usage' } },
      { tag: 'meta', attrs: { name: 'generator', content: 'x' } },
    ]
    expect(applySeoTitle(head, 'Usage', 'How to Use Snug')).toEqual([
      { tag: 'title', content: 'How to Use Snug | Snug' },
      {
        tag: 'meta',
        attrs: { property: 'og:title', content: 'How to Use Snug' },
      },
      { tag: 'meta', attrs: { name: 'generator', content: 'x' } },
    ])
  })

  it('returns the head unchanged without a SEO title', () => {
    const head = [{ tag: 'title', content: 'Usage | Snug' }]
    expect(applySeoTitle(head, 'Usage', undefined)).toEqual(head)
  })
})
