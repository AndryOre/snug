import { getContent, getPageMeta } from '../i18n/content'
import { languageTag, localePath, LOCALES, SITE_ORIGIN } from '../i18n/locales'
import { buildLlmsTxt } from '../seo/crawlers'
import { documentationLlmsPages } from '../seo/documentation-pages'

export function GET() {
  const localePages = LOCALES.map((locale) => ({
    languageTag: languageTag(locale),
    title: getContent(locale).meta.title,
    url: `${SITE_ORIGIN}${localePath(locale)}`,
  }))
  return new Response(
    buildLlmsTxt(
      getPageMeta('en').description,
      localePages,
      documentationLlmsPages(),
    ),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
}
