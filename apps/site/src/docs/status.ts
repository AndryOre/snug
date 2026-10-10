import { DEFAULT_LOCALE, LOCALES } from '../i18n/locales'
import type { LocalizedPage } from './catalog'

/**
 * Renders the `i18n:status` report: for every non-English locale, its totals
 * and each page still missing or stale.
 * @param pages - The pages from `loadLocalizedCatalog`.
 * @returns The report text, ending with a newline.
 */
export function formatStatusReport(pages: readonly LocalizedPage[]): string {
  const lines: string[] = []
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue
    const localePages = pages.filter((page) => page.locale === locale)
    const outstanding = localePages.filter(
      (page) => page.status !== 'translated',
    )
    const missing = outstanding.filter((page) => page.status === 'missing')
    const stale = outstanding.length - missing.length
    const upToDate = localePages.length - outstanding.length
    lines.push(
      `${locale}: ${String(missing.length)} missing, ${String(stale)} stale, ${String(upToDate)} up to date`,
      ...outstanding.map(
        (page) => `  ${page.status.padEnd(7)} ${page.sourcePath}`,
      ),
    )
  }
  return `${lines.join('\n')}\n`
}
