import {
  hreflangAlternates,
  localePath,
  LOCALES,
  SITE_ORIGIN,
} from '../i18n/locales'
import {
  ENGLISH_PRIVACY_PATH,
  PRIVACY_PAGE_LOCALES,
  privacyPath,
} from '../i18n/privacy'
import { buildSitemapXml } from '../seo/crawlers'
import { documentationSitemapEntries } from '../seo/documentation-pages'
import { lastCommitDate } from '../seo/last-modified'

export function GET() {
  const homeEntries = LOCALES.map((locale) => ({
    loc: `${SITE_ORIGIN}${localePath(locale)}`,
    lastmod: lastCommitDate([`src/content/${locale}.json`]),
    alternates: hreflangAlternates(),
  }))
  const privacyAlternates = hreflangAlternates(
    ENGLISH_PRIVACY_PATH,
    PRIVACY_PAGE_LOCALES,
  )
  const privacyLastmod = lastCommitDate([
    'src/content/privacy',
    'src/components/PrivacyPage.astro',
    'src/pages/privacy.astro',
    '../../PRIVACY_POLICY.md',
  ])
  const privacyEntries = PRIVACY_PAGE_LOCALES.map((locale) => ({
    loc: `${SITE_ORIGIN}${privacyPath(locale)}`,
    lastmod: privacyLastmod,
    alternates: privacyAlternates,
  }))
  const entries = [
    ...homeEntries,
    ...privacyEntries,
    ...documentationSitemapEntries(),
  ]
  return new Response(buildSitemapXml(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
