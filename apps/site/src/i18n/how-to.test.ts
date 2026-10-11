import { describe, expect, it } from 'vitest'

import { HOW_TO_PAGES, type HowToPageDefinition } from '../content/how-to-pages'
import { PUBLISHED_SOURCES } from '../docs/published'
import { flattenKeys } from './content'
import {
  getHowToContent,
  getHowToMeta,
  getHowToPage,
  getHowToSharedContent,
  HOW_TO_LOCALES,
  HOW_TO_SLUGS,
  type HowToFiles,
  howToPageLocales,
  howToPath,
  howToSlugsForGuideEntry,
  howToSources,
  howToValues,
  interpolateHowTo,
  loadHowToContent,
} from './how-to'
import { LOCALES } from './locales'

const SLUG = 'move-bookmarks-from-firefox-to-chrome'
const CJK_LOCALES = new Set(['ja', 'ko', 'zh_CN'])
const guideIds = new Set(PUBLISHED_SOURCES.map((source) => source.id))
const english = getHowToContent('en', SLUG)
const sharedEnglish = getHowToSharedContent('en')

function visualWidth(text: string): number {
  let width = 0
  for (const character of text) {
    width += /[\u{2E80}-\u{9FFF}\u{AC00}-\u{D7AF}\u{FF00}-\u{FFEF}]/u.test(
      character,
    )
      ? 2
      : 1
  }
  return width
}

function files(entries: Record<string, Record<string, unknown>>): HowToFiles {
  return Object.fromEntries(
    Object.entries(entries).flatMap(([folder, byLocale]) =>
      Object.entries(byLocale).map(([locale, content]) => [
        `../content/how-to/${folder}/${locale}.json`,
        { default: content },
      ]),
    ),
  )
}

const firstPageOnly = { [SLUG]: HOW_TO_PAGES[SLUG] as HowToPageDefinition }

function load(
  entries: Record<string, Record<string, unknown>>,
  pages: typeof HOW_TO_PAGES = firstPageOnly,
) {
  return () =>
    loadHowToContent({
      files: files(entries),
      pages,
      publishedGuideIds: guideIds,
    })
}

const base = { shared: { en: sharedEnglish }, [SLUG]: { en: english } }

function withoutKey(tree: Record<string, unknown>, key: string) {
  return Object.fromEntries(Object.entries(tree).filter(([k]) => k !== key))
}

function placeholdersIn(node: unknown): string[] {
  const children =
    typeof node === 'string'
      ? []
      : Object.values(node as Record<string, unknown>)
  const own =
    typeof node === 'string'
      ? node
          .matchAll(/\{(\w+)\}/g)
          .map((match) => match[1] ?? '')
          .toArray()
      : []
  return [...own, ...children.flatMap((child) => placeholdersIn(child))]
}

describe('loadHowToContent', () => {
  it('loads English alone', () => {
    expect(load(base)().pages[SLUG]).toBeDefined()
  })

  it('accepts a translation with the same keys', () => {
    const loaded = load({
      shared: { en: sharedEnglish, es: sharedEnglish },
      [SLUG]: { en: english, es: english },
    })()

    expect(Object.keys(loaded.pages[SLUG] ?? {})).toEqual(['en', 'es'])
  })

  it('throws on missing English page copy', () => {
    expect(load({ shared: { en: sharedEnglish } })).toThrow(/no English copy/)
  })

  it('throws on missing English shared copy', () => {
    expect(load({ [SLUG]: { en: english } })).toThrow(/English.*shared/)
  })

  it('throws on a missing key in a translation', () => {
    const drifted = withoutKey(english, 'verified')

    expect(load({ ...base, [SLUG]: { en: english, de: drifted } })).toThrow(
      /missing \[verified\]/,
    )
  })

  it('throws on an unexpected key in shared strings', () => {
    const drifted = { ...sharedEnglish, extra: 'x' }

    expect(
      load({ ...base, shared: { en: sharedEnglish, fr: drifted } }),
    ).toThrow(/unexpected \[extra\]/)
  })

  it('throws on a file that is not a locale', () => {
    expect(load({ ...base, [SLUG]: { en: english, xx: english } })).toThrow(
      /xx/,
    )
  })

  it('throws on copy without a page definition', () => {
    expect(load({ ...base, orphan: { en: english } })).toThrow(
      /no page definition/,
    )
  })

  it('throws on an unknown related Guide page', () => {
    const pages = {
      [SLUG]: { ...getHowToPage(SLUG), relatedGuide: ['guide/nope'] },
    }

    expect(load(base, pages)).toThrow(/unknown Guide page "guide\/nope"/)
  })

  it('throws on an unknown related How-to slug', () => {
    const pages = {
      [SLUG]: { ...getHowToPage(SLUG), relatedHowTo: ['nope'] },
    }

    expect(load(base, pages)).toThrow(/unknown How-to page "nope"/)
  })
})

describe('bundled copy', () => {
  it('has the Firefox to Chrome page in every locale with key parity', () => {
    expect(howToPageLocales(SLUG)).toEqual([...LOCALES])
    for (const locale of LOCALES) {
      expect(flattenKeys(getHowToContent(locale, SLUG) as never)).toEqual(
        flattenKeys(english as never),
      )
      expect(flattenKeys(getHowToSharedContent(locale) as never)).toEqual(
        flattenKeys(sharedEnglish as never),
      )
    }
  })

  it.each([
    'move-bookmarks-from-edge-to-chrome',
    'move-bookmarks-from-chrome-to-brave',
  ])('has %s in every locale with key parity', (slug) => {
    expect(howToPageLocales(slug)).toEqual([...LOCALES])
    for (const locale of LOCALES) {
      expect(flattenKeys(getHowToContent(locale, slug) as never)).toEqual(
        flattenKeys(getHowToContent('en', slug) as never),
      )
    }
  })

  it('registers every page and lists English first', () => {
    expect(HOW_TO_SLUGS).toEqual(Object.keys(HOW_TO_PAGES))
    expect(HOW_TO_LOCALES[0]).toBe('en')
  })

  it('resolves every placeholder of every page and locale', () => {
    for (const slug of HOW_TO_SLUGS) {
      for (const locale of howToPageLocales(slug)) {
        const known = Object.keys(howToValues(locale, slug))
        const keys = [
          ...placeholdersIn(getHowToContent(locale, slug)),
          ...placeholdersIn(getHowToSharedContent(locale)),
        ]
        for (const key of keys) {
          expect(known, `${locale}/${slug} {${key}}`).toContain(key)
        }
      }
    }
  })

  it('keeps every meta title and description within the content rules', () => {
    const violations: string[] = []
    for (const slug of HOW_TO_SLUGS) {
      for (const locale of LOCALES) {
        const { title, description } = getHowToMeta(locale, slug)
        const label = `${locale}/${slug}`
        const length = [...description].length
        const checks: [string, boolean][] = [
          ['title suffix', / \| Snug$/u.test(title)],
          ['title starts with Snug', !title.startsWith('Snug')],
          ['title width', visualWidth(title) <= 60],
          [
            'description names the destination',
            description.includes(howToValues('en', slug).toName),
          ],
          ['description placeholder', !description.includes('{')],
          [
            'description length',
            CJK_LOCALES.has(locale) || (length >= 140 && length <= 160),
          ],
        ]
        for (const [rule, passed] of checks) {
          if (!passed) violations.push(`${label}: ${rule}`)
        }
      }
    }

    expect(violations).toEqual([])
  })

  it('writes every page title as a question', () => {
    for (const slug of HOW_TO_SLUGS) {
      for (const locale of LOCALES) {
        expect(getHowToContent(locale, slug).title).toMatch(/[?？]$/u)
      }
    }
  })

  it('never states a menu path or file name inline', () => {
    for (const slug of HOW_TO_SLUGS) {
      for (const locale of LOCALES) {
        const text = JSON.stringify(getHowToContent(locale, slug))
        expect(text).not.toContain('bookmarks.html')
        expect(text).not.toContain('bookmarks_<date>.html')
        expect(text).not.toContain('Import and Backup')
        expect(text).not.toContain('Import bookmarks and settings')
        expect(text).not.toContain('Import browser data')
      }
    }
  })
})

describe('howToValues and interpolateHowTo', () => {
  it('resolves menu paths and file names from the facts', () => {
    const values = howToValues('en', SLUG)

    expect(values.fromExportPath).toBe(
      'Bookmarks > Manage bookmarks > Import and Backup > Export Bookmarks to HTML',
    )
    expect(values.fromExportFile).toBe('bookmarks.html')
    expect(values.toImportPath).toBe(
      'More > Bookmarks and lists > Import bookmarks and settings',
    )
  })

  it('lists the import sources of the destination browser', () => {
    expect(
      howToValues('en', 'move-bookmarks-from-chrome-to-edge').toImportSources,
    ).toBe('Google Chrome, IE11, and Favorites or bookmarks HTML file')
  })

  it('resolves import sources and the Edge export from the facts', () => {
    const brave = howToValues('en', 'move-bookmarks-from-chrome-to-brave')
    const edge = howToValues('en', 'move-bookmarks-from-edge-to-chrome')

    expect(brave.toImportSources).toBe(
      'Browsers detected on this computer and Bookmarks HTML file',
    )
    expect(brave.toImportPath).toBe(
      'Main menu > Bookmarks > Import Bookmarks and Settings',
    )
    expect(edge.toImportSources).toBe('Bookmarks HTML file')
    expect(edge.fromExportPath).toBe('Not listed')
  })

  it('writes a fact that is not listed as the locale string', () => {
    expect(howToValues('en', SLUG).fromHtmlKeeps).toBe('Not listed')
    expect(howToValues('de', SLUG).fromHtmlKeeps).toBe(
      getHowToSharedContent('de').notListed,
    )
  })

  it('formats the date in UTC for the locale', () => {
    expect(interpolateHowTo('{date}', 'en', { date: '2026-10-11' })).toBe(
      'October 11, 2026',
    )
    expect(interpolateHowTo('{date}', 'de', { date: '2026-10-11' })).toBe(
      '11. Oktober 2026',
    )
  })

  it('throws on a placeholder without a value', () => {
    expect(() => interpolateHowTo('{nope}', 'en', {})).toThrow(/nope/)
  })
})

describe('paths and sources', () => {
  it('returns the page path with a trailing slash', () => {
    expect(howToPath('en', SLUG)).toBe(`/how-to/${SLUG}/`)
    expect(howToPath('pt_BR', SLUG)).toBe(`/pt-br/how-to/${SLUG}/`)
  })

  it('lists an official source for each browser on the page', () => {
    for (const { urls } of howToSources(SLUG)) {
      expect(urls.length).toBeGreaterThan(0)
      for (const url of urls) expect(url).toMatch(/^https:\/\//)
    }
  })
})

describe('howToSlugsForGuideEntry', () => {
  const pages: Record<string, HowToPageDefinition> = {
    a: { ...HOW_TO_PAGES[SLUG]!, relatedGuide: ['guide/importing'] },
    b: {
      ...HOW_TO_PAGES[SLUG]!,
      relatedGuide: ['guide/importing', 'guide/duplicates'],
    },
    c: { ...HOW_TO_PAGES[SLUG]!, relatedGuide: ['guide'] },
  }

  it('inverts the related Guide pages in registry order', () => {
    expect(howToSlugsForGuideEntry('guide/importing', pages)).toEqual([
      'a',
      'b',
    ])
    expect(howToSlugsForGuideEntry('guide/duplicates', pages)).toEqual(['b'])
  })

  it('ignores the locale prefix of a translated entry', () => {
    expect(howToSlugsForGuideEntry('pt-br/guide/importing', pages)).toEqual([
      'a',
      'b',
    ])
    expect(howToSlugsForGuideEntry('es/guide', pages)).toEqual(['c'])
  })

  it('returns nothing for a page without related How-to pages', () => {
    expect(howToSlugsForGuideEntry('guide/settings', pages)).toEqual([])
    expect(howToSlugsForGuideEntry('es/changelog', pages)).toEqual([])
    expect(howToSlugsForGuideEntry('guide/exporting', pages)).toEqual([])
  })

  it('maps the bundled registry to the Firefox to Chrome page', () => {
    expect(howToSlugsForGuideEntry('de/guide/importing')).toContain(SLUG)
  })
})
