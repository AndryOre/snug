import react from '@astrojs/react'
import starlight from '@astrojs/starlight'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

import { buildSidebar } from './src/docs/sidebar'
import { collectStarlightInlineScriptHashes } from './src/docs/starlight-inline-hashes'
import { languageTag, LOCALE_NAMES, LOCALES } from './src/i18n/locales'
import { hiddenUntilFound } from './src/scripts/hidden-until-found'
import { THEME_INIT_HASH } from './src/scripts/theme-init'
import { UMAMI_COLLECT_ORIGIN, UMAMI_SCRIPT_ORIGIN } from './src/seo/umami'

const starlightLocales = Object.fromEntries(
  LOCALES.map((locale) => [
    locale === 'en' ? 'root' : languageTag(locale).toLowerCase(),
    { label: LOCALE_NAMES[locale], lang: languageTag(locale) },
  ]),
)

export default defineConfig({
  site: 'https://snug.andryore.dev',
  trailingSlash: 'always',
  prefetch: false,
  security: {
    csp: {
      scriptDirective: {
        resources: ["'self'", UMAMI_SCRIPT_ORIGIN, "'wasm-unsafe-eval'"],
        hashes: [THEME_INIT_HASH, ...collectStarlightInlineScriptHashes()],
      },
      directives: [`connect-src 'self' ${UMAMI_COLLECT_ORIGIN}`],
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
    },
  },
  integrations: [
    react(),
    starlight({
      title: 'Snug',
      disable404Route: true,
      defaultLocale: 'root',
      locales: starlightLocales,
      customCss: ['./src/styles/docs.css'],
      expressiveCode: {
        themes: ['github-light', 'github-dark'],
        themeCssSelector: (theme) =>
          theme.type === 'dark' ? '.dark' : ':root:not(.dark)',
        useDarkModeMediaQuery: false,
        useStarlightDarkModeSwitch: false,
        useStarlightUiThemeColors: false,
      },
      routeMiddleware: './src/docs/route-middleware.ts',
      sidebar: buildSidebar(),
      lastUpdated: false,
      favicon: '/favicon.svg',
      head: [
        {
          tag: 'link',
          attrs: { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        },
        {
          tag: 'link',
          attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        },
      ],
      components: {
        MobileMenuToggle:
          './src/docs/components/DocumentationMobileMenuToggle.astro',
        MobileMenuFooter:
          './src/docs/components/DocumentationMobileMenuFooter.astro',
        Footer: './src/docs/components/DocumentationFooter.astro',
        Header: './src/docs/components/DocumentationHeader.astro',
        PageTitle: './src/docs/components/DocumentationPageTitle.astro',
        Pagination: './src/docs/components/DocumentationPagination.astro',
        ThemeProvider: './src/docs/components/DocumentationThemeProvider.astro',
        ThemeSelect: './src/docs/components/DocumentationThemeSelect.astro',
      },
    }),
    hiddenUntilFound(),
  ],
  vite: { plugins: [tailwindcss()] },
})
