/**
 * Chrome Web Store listing URL, the source of every fact in the page's
 * structured data.
 */
export const STORE_LISTING_URL =
  'https://chromewebstore.google.com/detail/gdhpeilfkeeajillmcncaelnppiakjhn'

/**
 * Facts shown on the store listing, read on 2026-10-05
 * (see `docs/landing/content.md`). Re-check before launch.
 */
export const STORE_FACTS = {
  name: 'Snug',
  category: 'BrowserApplication',
  operatingSystem: 'Windows, macOS, Linux, ChromeOS',
  browserRequirements:
    'Requires a Chromium browser (Chrome 119 or later, Edge, Brave, Opera)',
  ratingValue: 4.8,
  ratingCount: 20,
  userCount: 5000,
  license: 'https://opensource.org/license/mit',
  sourceUrl: 'https://github.com/AndryOre/snug',
} as const
