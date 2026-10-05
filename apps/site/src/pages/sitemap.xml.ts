import {
  hreflangAlternates,
  localePath,
  LOCALES,
  SITE_ORIGIN,
} from '../i18n/locales'
import { buildSitemapXml } from '../seo/crawlers'

export function GET() {
  const entries = LOCALES.map((locale) => `${SITE_ORIGIN}${localePath(locale)}`)
  const buildDate = new Date().toISOString().slice(0, 10)
  return new Response(
    buildSitemapXml(
      entries,
      hreflangAlternates(),
      [`${SITE_ORIGIN}/privacy/`],
      buildDate,
    ),
    {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    },
  )
}
