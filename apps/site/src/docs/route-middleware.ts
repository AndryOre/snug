import { defineRouteMiddleware } from '@astrojs/starlight/route-data'

import { getContent, getPageMeta } from '../i18n/content'
import { lastCommitDate } from '../seo/last-modified'
import {
  buildDocumentationHead,
  buildPaginationHead,
  replaceOrPushHead,
} from './head-tags'
import { resolveDocumentationLocale } from './locale'
import { applySeoTitle } from './page-meta'
import { PUBLISHED_SOURCES } from './published'

/**
 * Adds a Guide page's Open Graph image, locale, Twitter and JSON-LD tags,
 * swaps its `<title>` and `og:title` for its SEO title, falls back to
 * the locale's site description only when a page has no description of its
 * own, and marks the content of a page that renders the English text
 * as English, so the content wrapper carries `lang="en"` and assistive
 * technology switches voice. The page chrome keeps the locale of the route.
 */
export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute
  const hasDescription = route.head.some(
    (entry) => entry.tag === 'meta' && entry.attrs?.name === 'description',
  )
  if (!hasDescription) {
    const { description } = getPageMeta(resolveDocumentationLocale(route.lang))
    route.head.push(
      { tag: 'meta', attrs: { name: 'description', content: description } },
      {
        tag: 'meta',
        attrs: { property: 'og:description', content: description },
      },
    )
  }
  const { seoTitle, title } = route.entry.data
  route.head = applySeoTitle(route.head, title, seoTitle)
  const source = PUBLISHED_SOURCES.find(
    (candidate) =>
      route.entry.id === candidate.id ||
      route.entry.id.endsWith(`/${candidate.id}`),
  )
  if (source) {
    const locale = resolveDocumentationLocale(route.lang)
    route.head = replaceOrPushHead(
      route.head,
      buildDocumentationHead({
        locale,
        sourceId: source.id,
        title,
        seoTitle,
        description: route.entry.data.description ?? '',
        imageAlt: getContent(locale).seo.ogImageAlt,
        dateModified: lastCommitDate([`../../${source.sourcePath}`]),
      }),
    )
  }
  route.head = replaceOrPushHead(
    route.head,
    buildPaginationHead(route.pagination),
  )
  if (route.entry.data.translationStatus === 'translated') return
  route.entryMeta = { ...route.entryMeta, lang: 'en', dir: 'ltr' }
})
