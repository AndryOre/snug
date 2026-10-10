import { COMPETITORS } from '../content/competitors'
import {
  alternativesPath,
  COMPARISON_PAGE_LOCALES,
  type ComparisonSlug,
  getComparisonContent,
  getComparisonMeta,
} from '../i18n/comparisons'
import { type Locale, localePath } from '../i18n/locales'
import type { PageDescriptor } from './page-descriptor'
import { buildComparisonStructuredData } from './structured-data'

/**
 * The page descriptor `Layout.astro` needs for the Alternatives page
 * (`slug` omitted) or one comparison page: metadata, hreflang alternates and a
 * `WebPage` plus `BreadcrumbList` JSON-LD graph.
 * @param locale - A supported locale code.
 * @param slug - A comparison slug; omit for the Alternatives page.
 * @returns The descriptor for that page in that locale.
 */
export function comparisonPageDescriptor(
  locale: Locale,
  slug?: ComparisonSlug,
): PageDescriptor {
  const meta = getComparisonMeta(locale, slug ?? 'alternatives')
  const { breadcrumb } = getComparisonContent(locale).shared
  const path = alternativesPath(locale, slug)
  const trail = [
    { name: breadcrumb.home, path: localePath(locale) },
    { name: breadcrumb.alternatives, path: alternativesPath(locale) },
    ...(slug ? [{ name: COMPETITORS[slug].name, path }] : []),
  ]
  return {
    meta,
    path: (code) => alternativesPath(code, slug),
    alternateLocales: COMPARISON_PAGE_LOCALES,
    jsonLd: buildComparisonStructuredData(locale, {
      ...meta,
      path,
      breadcrumbs: trail,
    }),
  }
}
