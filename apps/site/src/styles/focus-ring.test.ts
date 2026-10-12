import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const SOLID_FOCUS_SOURCES = [
  '../components/FaqAccordion.tsx',
  '../components/Header.astro',
  '../components/InstallButton.astro',
  '../components/LanguageSwitcher.tsx',
  '../components/TextLink.astro',
  '../components/ThemeMenu.tsx',
  '../docs/components/DocumentationPagination.astro',
  '../docs/components/DocumentationTranslationNotice.astro',
]

describe.each(SOLID_FOCUS_SOURCES)('%s', (relativePath) => {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8')

  it('takes the solid focus ring from the shared utility', () => {
    expect(source).toContain('focus-ring-solid')
  })

  it('never falls back to the translucent registry ring', () => {
    expect(source).not.toContain('ring-ring/50')
  })
})
