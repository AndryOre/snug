import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

import { hiddenUntilFound } from './src/scripts/hidden-until-found'
import { THEME_INIT_HASH } from './src/scripts/theme-init'
import { UMAMI_COLLECT_ORIGIN, UMAMI_SCRIPT_ORIGIN } from './src/seo/umami'

export default defineConfig({
  site: 'https://snug.andryore.dev',
  trailingSlash: 'always',
  security: {
    csp: {
      scriptDirective: {
        resources: ["'self'", UMAMI_SCRIPT_ORIGIN],
        hashes: [THEME_INIT_HASH],
      },
      directives: [`connect-src 'self' ${UMAMI_COLLECT_ORIGIN}`],
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
    },
  },
  integrations: [react(), hiddenUntilFound()],
  vite: { plugins: [tailwindcss()] },
})
