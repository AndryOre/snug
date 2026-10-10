import {
  alternativesPath,
  COMPARISON_PAGE_LOCALES,
  COMPARISON_SLUGS,
  type ComparisonSlug,
  getComparisonMeta,
} from '../i18n/comparisons'
import {
  DEFAULT_LOCALE,
  hreflangAlternates,
  SITE_ORIGIN,
} from '../i18n/locales'
import type { LlmsComparisonPage, SitemapEntry } from './crawlers'
import { lastCommitDate } from './last-modified'

const PAGE_SLUGS: readonly (ComparisonSlug | undefined)[] = [
  undefined,
  ...COMPARISON_SLUGS,
]

/**
 * One sitemap entry per Alternatives and Comparison page in every locale that
 * has copy for it. Alternates list only those locales plus `x-default`.
 * @returns The entries: the Alternatives page, then each comparison, per
 * locale.
 */
export function comparisonSitemapEntries(): SitemapEntry[] {
  const lastmod = lastCommitDate([
    'src/content/comparisons',
    'src/content/competitors.ts',
  ])
  return PAGE_SLUGS.flatMap((slug) => {
    const alternates = hreflangAlternates(
      alternativesPath(DEFAULT_LOCALE, slug),
      COMPARISON_PAGE_LOCALES,
    )
    return COMPARISON_PAGE_LOCALES.map((locale) => ({
      loc: `${SITE_ORIGIN}${alternativesPath(locale, slug)}`,
      lastmod,
      alternates,
    }))
  })
}

/**
 * One `llms.txt` line per English Alternatives and Comparison page.
 * @returns The Alternatives page, then each comparison.
 */
export function comparisonLlmsPages(): LlmsComparisonPage[] {
  return PAGE_SLUGS.map((slug) => {
    const { title, description } = getComparisonMeta(
      DEFAULT_LOCALE,
      slug ?? 'alternatives',
    )
    return {
      title,
      description,
      url: `${SITE_ORIGIN}${alternativesPath(DEFAULT_LOCALE, slug)}`,
    }
  })
}
