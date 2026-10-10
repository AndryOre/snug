import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

import { chromeTranslationsLoader } from './docs/chrome-translations'
import { catalogLoader } from './docs/loader'

const translationFields = z.object({
  translationStatus: z
    .enum(['translated', 'missing', 'stale'])
    .default('translated'),
  englishPath: z.string().optional(),
})

export const collections = {
  docs: defineCollection({
    loader: catalogLoader(),
    schema: docsSchema({ extend: translationFields }),
  }),
  i18n: defineCollection({
    loader: chromeTranslationsLoader(),
    schema: i18nSchema(),
  }),
}
