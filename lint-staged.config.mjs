const config = {
  '*.{js,jsx,ts,tsx,mjs,astro}': [
    'bunx --bun oxfmt --no-error-on-unmatched-pattern',
    'bunx oxlint --type-aware --deny-warnings --fix',
  ],
  '*.astro': ['bunx eslint --fix --max-warnings=0 --no-warn-ignored'],
  '*.{json,json5,md,mdx,css,scss,yml,yaml}': [
    'bunx --bun oxfmt --no-error-on-unmatched-pattern',
  ],
}

export default config
