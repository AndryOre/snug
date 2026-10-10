import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
import { defineCollection } from 'astro:content'

import { chromeTranslationsLoader } from './docs/chrome-translations'
import { usageOverviewLoader } from './docs/usage-loader'

export const collections = {
  docs: defineCollection({
    loader: usageOverviewLoader(),
    schema: docsSchema(),
  }),
  i18n: defineCollection({
    loader: chromeTranslationsLoader(),
    schema: i18nSchema(),
  }),
}
