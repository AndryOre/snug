import {
  getHowToContent,
  getHowToIndexMeta,
  getHowToMeta,
  HOW_TO_INDEX_LOCALES,
  HOW_TO_SLUGS,
  howToIndexPath,
  howToPageLocales,
  howToPath,
  howToValues,
  interpolateHowTo,
} from '../i18n/how-to'
import {
  DEFAULT_LOCALE,
  hreflangAlternates,
  SITE_ORIGIN,
} from '../i18n/locales'
import type { LlmsFullSection, LlmsHowToPage, SitemapEntry } from './crawlers'
import { lastCommitDate } from './last-modified'

/**
 * Sources whose last commit stamps a How-to page's `lastmod` and
 * `dateModified`.
 */
export const HOW_TO_SOURCES: readonly string[] = [
  'src/content/how-to',
  'src/content/how-to-pages.ts',
  'src/content/browser-facts.ts',
]

/**
 * One sitemap entry per How-to page in every locale that carries it.
 * Alternates list only those locales plus `x-default`.
 * @returns The entries, per page in registry order, then per locale.
 */
export function howToSitemapEntries(): SitemapEntry[] {
  const lastmod = lastCommitDate(HOW_TO_SOURCES)
  const indexAlternates = hreflangAlternates(
    howToIndexPath(DEFAULT_LOCALE),
    HOW_TO_INDEX_LOCALES,
  )
  const indexEntries = HOW_TO_INDEX_LOCALES.map((locale) => ({
    loc: `${SITE_ORIGIN}${howToIndexPath(locale)}`,
    lastmod,
    alternates: indexAlternates,
  }))
  const pageEntries = HOW_TO_SLUGS.flatMap((slug) => {
    const locales = howToPageLocales(slug)
    const alternates = hreflangAlternates(
      howToPath(DEFAULT_LOCALE, slug),
      locales,
    )
    return locales.map((locale) => ({
      loc: `${SITE_ORIGIN}${howToPath(locale, slug)}`,
      lastmod,
      alternates,
    }))
  })
  return [...indexEntries, ...pageEntries]
}

function numbered(steps: readonly string[]): string {
  return steps.map((step, index) => `${index + 1}. ${step}`).join('\n')
}

function bulleted(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join('\n')
}

/**
 * The English How-to pages as `llms-full.txt` sections: the short answer, the
 * built-in steps, the Snug steps and what to do when something goes wrong, with
 * the date the browser facts were verified.
 * @returns One section per page, in registry order.
 */
export function howToLlmsFullSections(): LlmsFullSection[] {
  return HOW_TO_SLUGS.map((slug) => {
    const copy = getHowToContent(DEFAULT_LOCALE, slug)
    const values = howToValues(DEFAULT_LOCALE, slug) as unknown as Record<
      string,
      string
    >
    const fill = (template: string) =>
      interpolateHowTo(template, DEFAULT_LOCALE, values)
    const snug = 'withSnug' in copy ? copy.withSnug : undefined
    const blocks = [
      fill(copy.directAnswer),
      `### ${copy.builtIn.title}`,
      fill(copy.builtIn.intro),
      numbered(copy.builtIn.steps.map((item) => fill(item))),
      ...(snug
        ? [
            `### ${snug.title}`,
            fill(snug.intro),
            numbered(snug.steps.map((item) => fill(item))),
            fill(snug.snapshot),
          ]
        : []),
      `### ${copy.goesWrong.title}`,
      bulleted(copy.goesWrong.items.map((item) => fill(item))),
      fill(copy.verified),
    ]
    return {
      title: copy.title,
      url: `${SITE_ORIGIN}${howToPath(DEFAULT_LOCALE, slug)}`,
      body: blocks.join('\n\n'),
    }
  })
}

/**
 * One `llms.txt` line for the English How-to index, then one per English
 * How-to page.
 * @returns The index, then the pages in registry order.
 */
export function howToLlmsPages(): LlmsHowToPage[] {
  const index = getHowToIndexMeta(DEFAULT_LOCALE)
  const indexPage = {
    ...index,
    url: `${SITE_ORIGIN}${howToIndexPath(DEFAULT_LOCALE)}`,
  }
  const pages = HOW_TO_SLUGS.map((slug) => {
    const { title, description } = getHowToMeta(DEFAULT_LOCALE, slug)
    return {
      title,
      description,
      url: `${SITE_ORIGIN}${howToPath(DEFAULT_LOCALE, slug)}`,
    }
  })
  return [indexPage, ...pages]
}
