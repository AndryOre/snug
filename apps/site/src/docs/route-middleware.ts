import { defineRouteMiddleware } from '@astrojs/starlight/route-data'

import { getPageMeta } from '../i18n/content'
import { resolveDocumentationLocale } from './locale'

/**
 * Gives every Guide page a meta description from its locale's site
 * description, and marks the content of a page that renders the English text
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
  if (route.entry.data.translationStatus === 'translated') return
  route.entryMeta = { ...route.entryMeta, lang: 'en', dir: 'ltr' }
})
