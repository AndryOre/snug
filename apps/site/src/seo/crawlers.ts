import type { SiteContent } from '../i18n/content'
import { PROMO_VIDEO_IDS, youtubeWatchUrl } from '../i18n/landing'
import { SITE_ORIGIN } from '../i18n/locales'
import { REVIEWS } from '../i18n/proof'
import { STORE_FACTS } from './store-facts'

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
 * allowed. `Google-Extended` is not listed: blocking it also removes Gemini
 * grounding and does not affect Search.
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
 * One localized landing page, as listed in `llms.txt`.
 */
export interface LlmsLocalePage {
  languageTag: string
  title: string
  url: string
}

/**
 * The `llms.txt` body summarizing the product and linking the key pages.
 * @param description - The English meta description.
 * @param localePages - Every locale's landing page.
 * @returns The file contents.
 */
export function buildLlmsTxt(
  description: string,
  localePages: readonly LlmsLocalePage[],
): string {
  const localeLines = localePages
    .map(
      ({ languageTag, title, url }) => `- [${title}](${url}): ${languageTag}`,
    )
    .join('\n')
  return `# Snug

> ${description}

Snug is a free, open-source Chromium browser extension. It makes no network calls and needs no account.

## Landing pages

${localeLines}

## Pages

- [Full English page content](${SITE_ORIGIN}/llms-full.txt): the landing page as Markdown
- [Install](${SITE_ORIGIN}/install): redirects to the Chrome Web Store listing
- [Privacy policy](${SITE_ORIGIN}/privacy/): what Snug stores and what it never sends
- [Source code](${STORE_FACTS.sourceUrl}): MIT-licensed repository
- [Sitemap](${SITE_ORIGIN}/sitemap.xml): all ten language versions

## Optional

- [Chrome Web Store reviews](${SITE_ORIGIN}/reviews): what users say about Snug
`
}

function section(heading: string, ...blocks: string[]): string {
  return [`## ${heading}`, ...blocks].join('\n\n')
}

/**
 * The `llms-full.txt` body: the English landing page flattened to Markdown.
 * @param content - The English content tree.
 * @returns The file contents.
 */
export function buildLlmsFullTxt(content: SiteContent): string {
  const titled = (
    entries: Record<string, { title: string; body: string }>,
  ): string[] =>
    Object.values(entries).map(({ title, body }) => `### ${title}\n\n${body}`)
  const faqItems = Object.values(content.faq.items).map(
    ({ question, answer }) => `### ${question}\n\n${answer}`,
  )
  const reviewQuotes = REVIEWS.map(
    ({ quote, author, date }) => `> ${quote}\n>\n> ${author}, ${date}`,
  )
  const sections = [
    `# Snug\n\n> ${content.meta.description}`,
    section(
      `${content.hero.headlineLead} ${content.hero.headlineAccent}`,
      content.hero.subheadline,
      content.hero.note,
    ),
    section(content.features.heading, ...titled(content.features.items)),
    section(
      content.trust.heading,
      content.trust.intro,
      ...titled(content.trust.points),
      content.trust.access,
    ),
    section(
      content.interface.heading,
      ...Object.values(content.interface.alts),
    ),
    section(
      content.video.heading,
      content.video.caption,
      `[Watch the walkthrough on YouTube](${youtubeWatchUrl(PROMO_VIDEO_IDS.en)})`,
    ),
    section(
      content.proof.heading,
      content.proof.numbers,
      content.proof.renameNote,
      ...reviewQuotes,
      `[${content.proof.link}](${SITE_ORIGIN}/reviews)`,
    ),
    section(content.faq.heading, ...faqItems),
    section(
      content.final.heading,
      content.final.line,
      `[${content.final.button}](${SITE_ORIGIN}/install)`,
    ),
  ]
  return `${sections.join('\n\n')}\n`
}

/**
 * One sitemap URL; `lastmod` is omitted when no real change date is known.
 */
export interface SitemapEntry {
  loc: string
  lastmod?: string
}

function lastmodLine(lastmod: string | undefined): string {
  return lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''
}

/**
 * The XML sitemap listing every locale page with `xhtml:link` alternates.
 * @param entries - Locale pages with their content change dates.
 * @param alternates - The hreflang alternates shared by every locale page.
 * @param standaloneEntries - Pages with no translations, listed without
 * alternates.
 * @returns A complete `sitemap.xml` document.
 */
export function buildSitemapXml(
  entries: readonly SitemapEntry[],
  alternates: readonly { hreflang: string; href: string }[],
  standaloneEntries: readonly SitemapEntry[],
): string {
  const links = alternates
    .map(
      ({ hreflang, href }) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`,
    )
    .join('\n')
  const urls = entries
    .map(
      ({ loc, lastmod }) =>
        `  <url>\n    <loc>${loc}</loc>\n${lastmodLine(lastmod)}${links}\n  </url>`,
    )
    .join('\n')
  const standaloneUrls = standaloneEntries.map(
    ({ loc, lastmod }) =>
      `  <url>\n    <loc>${loc}</loc>\n${lastmodLine(lastmod)}  </url>`,
  )
  const allUrls = [urls, ...standaloneUrls].join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls}
</urlset>
`
}
