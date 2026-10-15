/**
 * Spec file stems that exercise the site's layout across viewports. Shared by
 * the local multi-project run (`playwright.config.ts`) and the BrowserStack
 * run (`playwright.browserstack.config.ts`) so both select the same specs.
 */
const LAYOUT_SPEC_NAMES = [
  'responsive',
  'accessibility',
  'hero-trust',
  'closing',
  'theme',
  'theme-menu',
  'layout-matrix',
  'page-scroll-motion',
] as const

/**
 * The per-page axe and 320px checks: 728 of the 932 tests per platform.
 */
const ACCESSIBILITY_SPEC_NAME = 'accessibility'

function specPattern(names: readonly string[]): RegExp {
  return new RegExp(String.raw`(${names.join('|')})\.spec\.ts$`)
}

/**
 * Every layout spec, accessibility included (the full BrowserStack tier).
 */
export const LAYOUT_SPECS = specPattern(LAYOUT_SPEC_NAMES)

/**
 * Every layout spec except `accessibility.spec.ts` (the lean BrowserStack
 * tier that runs on PRs). The full tier still runs the accessibility spec, so no
 * test is excluded from every tier.
 */
export const LEAN_LAYOUT_SPECS = specPattern(
  LAYOUT_SPEC_NAMES.filter((name) => name !== ACCESSIBILITY_SPEC_NAME),
)
