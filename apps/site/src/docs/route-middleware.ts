import { defineRouteMiddleware } from '@astrojs/starlight/route-data'

/**
 * Marks the content of a page that renders the English text as English, so
 * the content wrapper carries `lang="en"` and assistive technology switches
 * voice. The page chrome keeps the locale of the route.
 */
export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute
  if (route.entry.data.translationStatus === 'translated') return
  route.entryMeta = { ...route.entryMeta, lang: 'en', dir: 'ltr' }
})
