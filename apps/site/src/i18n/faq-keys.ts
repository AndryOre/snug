/**
 * Keys of the FAQ items kept on the landing page, in display order. The other
 * six live on the Guide FAQ page. Kept free of imports so Playwright specs can
 * read it.
 */
export const LANDING_FAQ_KEYS = [
  'network',
  'account',
  'sync',
  'overwrite',
  'builtin',
  'cost',
] as const
