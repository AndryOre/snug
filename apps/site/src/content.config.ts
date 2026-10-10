import { docsSchema } from '@astrojs/starlight/schema'
import { defineCollection } from 'astro:content'

import { catalogLoader } from './docs/loader'

export const collections = {
  docs: defineCollection({
    loader: catalogLoader(),
    schema: docsSchema(),
  }),
}
