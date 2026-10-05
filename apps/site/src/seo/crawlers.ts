import { SITE_ORIGIN } from '../i18n/locales'

const SEARCH_AND_ANSWER_CRAWLERS = [
  'Googlebot',
  'Bingbot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
] as const

const TRAINING_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'CCBot',
  'Applebot-Extended',
  'Bytespider',
] as const

function group(agents: readonly string[], rule: string): string {
  return `${agents.map((agent) => `User-agent: ${agent}`).join('\n')}\n${rule}\n`
}

/**
 * The `robots.txt` body: search and answer crawlers are allowed, training
 * crawlers are disallowed in their own explicit group, everything else is
 * allowed.
 * @returns The file contents.
 */
export function buildRobotsTxt(): string {
  return [
    '# Search and answer crawlers: allowed.',
    group(SEARCH_AND_ANSWER_CRAWLERS, 'Allow: /'),
    '# Model-training crawlers: disallowed. The groups above are unaffected.',
    group(TRAINING_CRAWLERS, 'Disallow: /'),
    group(['*'], 'Allow: /'),
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml\n`,
  ].join('\n')
}

/**
 * The `llms.txt` body summarizing the product and linking the key pages.
 * @param description - The English meta description.
 * @returns The file contents.
 */
export function buildLlmsTxt(description: string): string {
  return `# Snug

> ${description}

Snug is a free, open-source Chromium browser extension. It makes no network calls and needs no account.

## Pages

- [Snug landing page (English)](${SITE_ORIGIN}/): what Snug does and how to install it
- [Install](${SITE_ORIGIN}/install): redirects to the Chrome Web Store listing
- [Source code](https://github.com/AndryOre/snug): MIT-licensed repository
- [Sitemap](${SITE_ORIGIN}/sitemap.xml): all ten language versions

## Optional

- [Chrome Web Store listing](https://chromewebstore.google.com/detail/gdhpeilfkeeajillmcncaelnppiakjhn)
`
}

/**
 * The XML sitemap listing every locale page with `xhtml:link` alternates.
 * @param entries - Absolute page URLs.
 * @param alternates - The hreflang alternates shared by every page.
 * @returns A complete `sitemap.xml` document.
 */
export function buildSitemapXml(
  entries: readonly string[],
  alternates: readonly { hreflang: string; href: string }[],
): string {
  const links = alternates
    .map(
      ({ hreflang, href }) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`,
    )
    .join('\n')
  const urls = entries
    .map((loc) => `  <url>\n    <loc>${loc}</loc>\n${links}\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
}
