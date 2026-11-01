const config = {
  '*.{js,jsx,ts,tsx,mjs,astro}': [
    'bunx --bun oxfmt',
    'bunx eslint --fix --max-warnings=0 --no-warn-ignored',
  ],
  '*.{json,json5,md,mdx,css,scss,yml,yaml}': ['bunx --bun oxfmt'],
}

export default config
