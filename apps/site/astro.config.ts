import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://snug.andryore.dev',
  trailingSlash: 'always',
  security: {
    csp: {
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
    },
  },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})
