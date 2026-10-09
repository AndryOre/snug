import {
  hreflangAlternates,
  localePath,
  LOCALES,
  SITE_ORIGIN,
} from '../i18n/locales'
import { buildSitemapXml } from '../seo/crawlers'
import { lastCommitDate } from '../seo/last-modified'

export function GET() {
  const entries = LOCALES.map((locale) => ({
    loc: `${SITE_ORIGIN}${localePath(locale)}`,
    lastmod: lastCommitDate([`src/content/${locale}.json`]),
  }))
  const standalone = [
    {
      loc: `${SITE_ORIGIN}/privacy/`,
      lastmod: lastCommitDate([
        'src/content/privacy',
        'src/components/PrivacyPage.astro',
        'src/pages/privacy.astro',
        '../../PRIVACY_POLICY.md',
      ]),
    },
  ]
  return new Response(
    buildSitemapXml(entries, hreflangAlternates(), standalone),
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  )
}
