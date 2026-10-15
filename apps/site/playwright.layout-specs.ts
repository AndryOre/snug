/**
 * Spec files that exercise the site's layout across viewports. Shared by the
 * local multi-project run (`playwright.config.ts`) and the BrowserStack run
 * (`playwright.browserstack.config.ts`) so both select the same specs.
 */
export const LAYOUT_SPECS =
  /(responsive|accessibility|hero-trust|closing|theme|theme-menu|layout-matrix|page-scroll-motion)\.spec\.ts$/
