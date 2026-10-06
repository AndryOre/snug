import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

import { hiddenUntilFound } from './src/scripts/hidden-until-found'
import { THEME_INIT_HASH } from './src/scripts/theme-init'

export default defineConfig({
  site: 'https://snug.andryore.dev',
  trailingSlash: 'always',
  security: {
    csp: {
      scriptDirective: { hashes: [THEME_INIT_HASH] },
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
    },
  },
  integrations: [react(), hiddenUntilFound()],
  vite: { plugins: [tailwindcss()] },
})
