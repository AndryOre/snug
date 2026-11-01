const config = {
  '*.{js,jsx,ts,tsx,mjs}': [
    'bunx --bun oxfmt --no-error-on-unmatched-pattern',
    'bunx oxlint --type-aware --deny-warnings --fix',
  ],
  '*.astro': [
    'bunx --bun oxfmt --no-error-on-unmatched-pattern',
    'bunx oxlint --type-aware --deny-warnings --fix',
    'bunx eslint --fix --max-warnings=0 --no-warn-ignored',
  ],
  '*.{json,json5,md,mdx,css,scss,yml,yaml}': [
    'bunx --bun oxfmt --no-error-on-unmatched-pattern',
  ],
}

export default config
