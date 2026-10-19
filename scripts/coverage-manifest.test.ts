import { readdirSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from 'vitest'

const REPOSITORY_ROOT = path.resolve(import.meta.dirname, '..')

const SOURCE_ROOTS = [
  'apps/extension/lib',
  'apps/site/src',
  'scripts',
  'eslint-rules',
] as const

const ASTRO_REASON =
  'Presentational Astro component or route with no logic of its own; its inputs are tested in the colocated i18n, seo and docs modules and verified through the site build output.'
const ISLAND_REASON =
  'React island with browser-only behavior, exercised in a real browser by the site e2e specs; its pure logic lives in colocated modules with their own tests.'
const ENDPOINT_REASON =
  'Thin Astro endpoint that feeds a tested builder, verified through the site build output.'
const SITE_MODULE_REASON =
  'Site module exercised through the tests of its consumers and the site build output; a colocated test retires this exemption on the ramp toward 95/95/90/95.'
const EXTENSION_LIB_REASON =
  'Extension module exercised through the tests of its consumers in apps/extension/lib; a colocated test retires this exemption on the ramp toward 95/95/90/95.'
const TEST_SUPPORT_REASON =
  'Test-support helper shared by the extension tests, with no behavior of its own.'

const EXEMPTIONS: Readonly<Record<string, string>> = {
  'apps/extension/lib/bookmark-tree-nodes.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/csv-escaping.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/custom-folder-writer.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/export-all-bookmarks.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/export-control.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/export-formats.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/exporters/export-tree.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/folder-run-identity.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/format-snapshot-date.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/import-control.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/import-duplicates.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/import-mode-items.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/importers/import-chrome.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/importers/import-safari.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/importers/import-xbel.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/importers/mobile-root.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/importers/parse-import.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/parse-json-once.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/render-export.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/root-folders.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/testing/dom-harness.ts': TEST_SUPPORT_REASON,
  'apps/extension/lib/testing/fake-bookmarks.ts': TEST_SUPPORT_REASON,
  'apps/extension/lib/testing/fake-directory-handle.ts': TEST_SUPPORT_REASON,
  'apps/extension/lib/testing/fake-folder-run-identity.ts': TEST_SUPPORT_REASON,
  'apps/extension/lib/testing/fake-i18n.ts': TEST_SUPPORT_REASON,
  'apps/extension/lib/testing/fake-locks.ts': TEST_SUPPORT_REASON,
  'apps/extension/lib/testing/setup-locks.ts': TEST_SUPPORT_REASON,
  'apps/extension/lib/types.ts':
    'Type-only module with the shared extension types, no runtime behavior to test.',
  'apps/extension/lib/use-operation-progress.ts': EXTENSION_LIB_REASON,
  'apps/extension/lib/use-slash-to-focus.ts': EXTENSION_LIB_REASON,
  'apps/site/src/components/AlternativesPage.astro': ASTRO_REASON,
  'apps/site/src/components/Bento.astro': ASTRO_REASON,
  'apps/site/src/components/ComparisonBreadcrumb.astro': ASTRO_REASON,
  'apps/site/src/components/ComparisonCell.astro': ASTRO_REASON,
  'apps/site/src/components/ComparisonPage.astro': ASTRO_REASON,
  'apps/site/src/components/ComparisonTable.astro': ASTRO_REASON,
  'apps/site/src/components/CopyMarkdownButton.tsx': ISLAND_REASON,
  'apps/site/src/components/Eyebrow.astro': ASTRO_REASON,
  'apps/site/src/components/Faq.astro': ASTRO_REASON,
  'apps/site/src/components/FinalCta.astro': ASTRO_REASON,
  'apps/site/src/components/FolderTree.astro': ASTRO_REASON,
  'apps/site/src/components/Footer.astro': ASTRO_REASON,
  'apps/site/src/components/Header.astro': ASTRO_REASON,
  'apps/site/src/components/HeaderMenus.tsx': ISLAND_REASON,
  'apps/site/src/components/Hero.astro': ASTRO_REASON,
  'apps/site/src/components/HeroJourney.astro': ASTRO_REASON,
  'apps/site/src/components/HowItWorks.astro': ASTRO_REASON,
  'apps/site/src/components/HowToIndexPage.astro': ASTRO_REASON,
  'apps/site/src/components/HowToPage.astro': ASTRO_REASON,
  'apps/site/src/components/InstallButton.astro': ASTRO_REASON,
  'apps/site/src/components/InstallDock.astro': ASTRO_REASON,
  'apps/site/src/components/LanguageSwitcher.tsx': ISLAND_REASON,
  'apps/site/src/components/NotFoundPage.astro': ASTRO_REASON,
  'apps/site/src/components/PrivacyPage.astro': ASTRO_REASON,
  'apps/site/src/components/RealInterface.astro': ASTRO_REASON,
  'apps/site/src/components/Section.astro': ASTRO_REASON,
  'apps/site/src/components/SectionHeading.astro': ASTRO_REASON,
  'apps/site/src/components/SocialProof.astro': ASTRO_REASON,
  'apps/site/src/components/TextLink.astro': ASTRO_REASON,
  'apps/site/src/components/TrustProof.astro': ASTRO_REASON,
  'apps/site/src/components/VideoFacade.tsx': ISLAND_REASON,
  'apps/site/src/content/how-to-pages.ts': SITE_MODULE_REASON,
  'apps/site/src/content.config.ts': SITE_MODULE_REASON,
  'apps/site/src/docs/components/DocumentationEditLink.astro': ASTRO_REASON,
  'apps/site/src/docs/components/DocumentationFooter.astro': ASTRO_REASON,
  'apps/site/src/docs/components/DocumentationHeader.astro': ASTRO_REASON,
  'apps/site/src/docs/components/DocumentationMobileMenuFooter.astro':
    ASTRO_REASON,
  'apps/site/src/docs/components/DocumentationMobileMenuToggle.astro':
    ASTRO_REASON,
  'apps/site/src/docs/components/DocumentationPageTitle.astro': ASTRO_REASON,
  'apps/site/src/docs/components/DocumentationPagination.astro': ASTRO_REASON,
  'apps/site/src/docs/components/DocumentationSearch.astro': ASTRO_REASON,
  'apps/site/src/docs/components/DocumentationTableOfContents.astro':
    ASTRO_REASON,
  'apps/site/src/docs/components/DocumentationThemeProvider.astro':
    ASTRO_REASON,
  'apps/site/src/docs/components/DocumentationThemeSelect.astro': ASTRO_REASON,
  'apps/site/src/docs/components/DocumentationTranslationNotice.astro':
    ASTRO_REASON,
  'apps/site/src/docs/i18n-status.ts': SITE_MODULE_REASON,
  'apps/site/src/docs/loader.ts': SITE_MODULE_REASON,
  'apps/site/src/docs/markdown.ts': SITE_MODULE_REASON,
  'apps/site/src/docs/paths.ts': SITE_MODULE_REASON,
  'apps/site/src/docs/published.ts': SITE_MODULE_REASON,
  'apps/site/src/docs/route-middleware.ts': SITE_MODULE_REASON,
  'apps/site/src/docs/sidebar.ts': SITE_MODULE_REASON,
  'apps/site/src/i18n/docs-ui.ts': SITE_MODULE_REASON,
  'apps/site/src/i18n/faq-keys.ts': SITE_MODULE_REASON,
  'apps/site/src/i18n/faq.ts': SITE_MODULE_REASON,
  'apps/site/src/layouts/Layout.astro': ASTRO_REASON,
  'apps/site/src/pages/.well-known/security.txt.ts': ENDPOINT_REASON,
  'apps/site/src/pages/404.astro': ASTRO_REASON,
  'apps/site/src/pages/[...slug].md.ts': ENDPOINT_REASON,
  'apps/site/src/pages/[locale]/404.astro': ASTRO_REASON,
  'apps/site/src/pages/[locale]/alternatives/[slug].astro': ASTRO_REASON,
  'apps/site/src/pages/[locale]/alternatives/index.astro': ASTRO_REASON,
  'apps/site/src/pages/[locale]/how-to/[slug].astro': ASTRO_REASON,
  'apps/site/src/pages/[locale]/how-to/index.astro': ASTRO_REASON,
  'apps/site/src/pages/[locale]/index.astro': ASTRO_REASON,
  'apps/site/src/pages/[locale]/privacy.astro': ASTRO_REASON,
  'apps/site/src/pages/alternatives/[slug].astro': ASTRO_REASON,
  'apps/site/src/pages/alternatives/index.astro': ASTRO_REASON,
  'apps/site/src/pages/how-to/[slug].astro': ASTRO_REASON,
  'apps/site/src/pages/how-to/index.astro': ASTRO_REASON,
  'apps/site/src/pages/index.astro': ASTRO_REASON,
  'apps/site/src/pages/llms-full.txt.ts': ENDPOINT_REASON,
  'apps/site/src/pages/llms.txt.ts': ENDPOINT_REASON,
  'apps/site/src/pages/privacy.astro': ASTRO_REASON,
  'apps/site/src/pages/robots.txt.ts': ENDPOINT_REASON,
  'apps/site/src/pages/sitemap.xml.ts': ENDPOINT_REASON,
  'apps/site/src/scripts/interaction-directive.ts': SITE_MODULE_REASON,
  'apps/site/src/scripts/interaction-integration.ts': SITE_MODULE_REASON,
  'apps/site/src/scripts/render-security-headers.ts': SITE_MODULE_REASON,
  'apps/site/src/scripts/theme-color.ts': SITE_MODULE_REASON,
  'apps/site/src/seo/comparison-pages.ts': SITE_MODULE_REASON,
  'apps/site/src/seo/crawlers.ts': SITE_MODULE_REASON,
  'apps/site/src/seo/documentation-pages.ts': SITE_MODULE_REASON,
  'apps/site/src/seo/how-to-pages.ts': SITE_MODULE_REASON,
  'apps/site/src/seo/page-descriptor.ts': SITE_MODULE_REASON,
  'apps/site/src/seo/store-facts.ts': SITE_MODULE_REASON,
  'apps/site/src/seo/structured-data.ts': SITE_MODULE_REASON,
  'apps/site/src/seo/umami.ts': SITE_MODULE_REASON,
  'scripts/workflow-files.ts':
    'Workflow loader used by workflows-invariants.test.ts, which exercises it against the real workflows.',
}

const exemptedFiles = new Set(Object.keys(EXEMPTIONS))

const isTestFile = (file: string) => /\.test\.(tsx?|mjs)$/.test(file)
const isSourceModule = (file: string) =>
  /\.(tsx?|mjs|astro)$/.test(file) &&
  !/\.d\.m?ts$/.test(file) &&
  !isTestFile(file)

const listFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      return entry.name === 'node_modules' ? [] : listFiles(absolute)
    }
    return absolute
  })

const allFiles = SOURCE_ROOTS.flatMap((root) =>
  listFiles(path.join(REPOSITORY_ROOT, root)),
).map((file) => path.relative(REPOSITORY_ROOT, file).split(path.sep).join('/'))

const modules = allFiles.filter((file) => isSourceModule(file))
const testFiles = new Set(allFiles.filter((file) => isTestFile(file)))

const hasColocatedTest = (file: string) => {
  const base = file.replace(/\.(tsx?|mjs|astro)$/, '')
  return ['ts', 'tsx', 'mjs'].some((extension) =>
    testFiles.has(`${base}.test.${extension}`),
  )
}

test('every module has a colocated test or a written exemption', () => {
  const uncovered = modules.filter(
    (file) => !hasColocatedTest(file) && !exemptedFiles.has(file),
  )

  expect(uncovered).toEqual([])
})

test('exemptions are justified and not stale', () => {
  const stale = Object.entries(EXEMPTIONS)
    .filter(
      ([file, reason]) =>
        !modules.includes(file) ||
        hasColocatedTest(file) ||
        reason.trim() === '',
    )
    .map(([file]) => file)

  expect(stale).toEqual([])
})
