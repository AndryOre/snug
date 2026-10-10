import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
import { defineCollection } from 'astro:content'

import { chromeTranslationsLoader } from './docs/chrome-translations'
import { catalogLoader } from './docs/loader'

export const collections = {
  docs: defineCollection({
    loader: catalogLoader(),
    schema: docsSchema(),
  }),
  i18n: defineCollection({
    loader: chromeTranslationsLoader(),
    schema: i18nSchema(),
  }),
}
