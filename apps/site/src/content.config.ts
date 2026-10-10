import { docsSchema } from '@astrojs/starlight/schema'
import { defineCollection } from 'astro:content'

import { usageOverviewLoader } from './docs/usage-loader'

export const collections = {
  docs: defineCollection({
    loader: usageOverviewLoader(),
    schema: docsSchema(),
  }),
}
