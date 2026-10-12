import { COMPETITORS } from '../content/competitors'
import {
  alternativesPath,
  COMPARISON_PAGE_LOCALES,
  COMPARISON_SLUGS,
  type ComparisonSlug,
  getComparisonContent,
  getComparisonMeta,
  interpolateComparison,
} from '../i18n/comparisons'
import {
  DEFAULT_LOCALE,
  hreflangAlternates,
  SITE_ORIGIN,
} from '../i18n/locales'
import type {
  LlmsComparisonPage,
  LlmsFullSection,
  SitemapEntry,
} from './crawlers'
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

function bulleted(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join('\n')
}

/**
 * The English Alternatives and Comparison pages as `llms-full.txt` sections:
 * the summary with its checked date, who each option suits, and how to switch.
 * @returns The Alternatives page, then each comparison.
 */
export function comparisonLlmsFullSections(): LlmsFullSection[] {
  const { shared, alternatives, pages } = getComparisonContent(DEFAULT_LOCALE)
  const latest = COMPARISON_SLUGS.map((slug) => COMPETITORS[slug].verifiedOn)
    .toSorted((a, b) => a.localeCompare(b))
    .at(-1)
  const fillAlternatives = (template: string) =>
    interpolateComparison(template, DEFAULT_LOCALE, { date: latest })
  const overview: LlmsFullSection = {
    title: alternatives.title,
    url: `${SITE_ORIGIN}${alternativesPath(DEFAULT_LOCALE)}`,
    body: [
      fillAlternatives(alternatives.lede),
      `### ${alternatives.whatToLookFor.title}`,
      bulleted(alternatives.whatToLookFor.items),
      fillAlternatives(shared.checkedNote),
    ].join('\n\n'),
  }
  const comparisons = COMPARISON_SLUGS.map((slug) => {
    const facts = COMPETITORS[slug]
    const copy = pages[slug]
    const fill = (template: string) =>
      interpolateComparison(template, DEFAULT_LOCALE, {
        users: facts.userCount,
        rating: facts.ratingValue,
        languages:
          facts.languageCount === 'not-listed'
            ? undefined
            : facts.languageCount,
        historyMonths: facts.historyLimitMonths,
        date: facts.verifiedOn,
        name: facts.shortName,
      })
    return {
      title: copy.title,
      url: `${SITE_ORIGIN}${alternativesPath(DEFAULT_LOCALE, slug)}`,
      body: [
        fill(copy.tldr),
        `### ${copy.whyLook.title}`,
        fill(copy.whyLook.body),
        `### ${fill(shared.pickSnug)}`,
        bulleted(copy.pickSnug.map((item) => fill(item))),
        `### ${fill(shared.pickOther)}`,
        bulleted(copy.pickOther.map((item) => fill(item))),
        `### ${shared.switching}`,
        copy.switching.steps
          .map((step, index) => `${index + 1}. ${fill(step)}`)
          .join('\n'),
        fill(shared.checkedNote),
      ].join('\n\n'),
    }
  })
  return [overview, ...comparisons]
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
