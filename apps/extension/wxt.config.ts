import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'wxt'

import { SITE_URL } from './lib/brand'

export default defineConfig({
  modules: [
    '@wxt-dev/module-react',
    '@wxt-dev/i18n/module',
    '@wxt-dev/auto-icons',
  ],
  zip: {
    name: 'snug',
    zipSources: true,
    sourcesRoot: fileURLToPath(new URL('../..', import.meta.url)),
    includeSources: [
      'package.json',
      'bun.lock',
      'bunfig.toml',
      'tsconfig.base.json',
      'turbo.json',
      'apps/extension/**',
      'apps/video/package.json',
      'packages/**',
    ],
    excludeSources: [
      'apps/extension/.output/**',
      'apps/extension/.wxt/**',
      'apps/extension/coverage/**',
      'apps/extension/test-results/**',
      'apps/extension/playwright-report/**',
    ],
  },
  imports: {
    eslintrc: {
      enabled: 9,
    },
  },
  manifest: ({ browser }) => ({
    name: '__MSG_extensionManifestName__',
    description:
      browser === 'edge'
        ? '__MSG_extensionDescriptionEdge__'
        : '__MSG_extensionDescription__',
    default_locale: 'en',
    minimum_chrome_version: '119',
    homepage_url: SITE_URL,
    options_ui: { page: 'app.html', open_in_tab: true },
    permissions: [
      'bookmarks',
      'favicon',
      'storage',
      'alarms',
      'downloads',
      'offscreen',
      'unlimitedStorage',
      'notifications',
    ],
  }),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
})
