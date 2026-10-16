import { BENTO_KEYS } from '../i18n/bento'
import type { SiteContent } from '../i18n/content'
import { fullHeadline, PROMO_VIDEO_IDS, youtubeWatchUrl } from '../i18n/landing'
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

const REDIRECT_ONLY_PATHS = ['/install', '/reviews'] as const

function group(agents: readonly string[], rule: string): string {
  const rules = [
    rule,
    ...REDIRECT_ONLY_PATHS.map((path) => `Disallow: ${path}`),
  ]
  return `${agents.map((agent) => `User-agent: ${agent}`).join('\n')}\n${rules.join('\n')}\n`
}

/**
 * The `robots.txt` body: search and answer crawlers are allowed, training
 * crawlers are disallowed in their own explicit group, everything else is
 * allowed. `/install` and `/reviews` are disallowed in every group: they only
 * redirect to the store. `Google-Extended` is not listed: blocking it also removes Gemini
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
 * One English Guide page or What's new, as listed in `llms.txt`: its
 * description and the link to its Markdown copy. `secondary` pages go under
 * `## Optional`.
 */
export interface LlmsDocumentationPage {
  title: string
  description: string
  markdownUrl: string
  secondary?: boolean
}

/**
 * One page's Markdown, appended to `llms-full.txt` under an
 * `## <title> (<url>)` heading.
 */
export interface LlmsFullSection {
  title: string
  url: string
  body: string
}

/**
 * One Alternatives or Comparison page, as listed in `llms.txt`.
 */
export interface LlmsComparisonPage {
  title: string
  description: string
  url: string
}

/**
 * One How-to page, as listed in `llms.txt`.
 */
export type LlmsHowToPage = LlmsComparisonPage

/**
 * The `llms.txt` body summarizing the product and linking the key pages.
 * @param description - The English meta description.
 * @param localePages - Every locale's landing page.
 * @param documentationPages - The English Guide pages and What's new.
 * @param comparisonPages - The Alternatives page and each Comparison page.
 * @param howToPages - Each English How-to page.
 * @returns The file contents.
 */
export function buildLlmsTxt(
  description: string,
  localePages: readonly LlmsLocalePage[],
  documentationPages: readonly LlmsDocumentationPage[] = [],
  comparisonPages: readonly LlmsComparisonPage[] = [],
  howToPages: readonly LlmsHowToPage[] = [],
): string {
  const howToLines = howToPages
    .map(
      ({ title, description: summary, url }) =>
        `- [${title}](${url}): ${summary}`,
    )
    .join('\n')
  const howToSection = howToLines === '' ? '' : `## How-to\n\n${howToLines}\n\n`
  const comparisonLines = comparisonPages
    .map(
      ({ title, description: summary, url }) =>
        `- [${title}](${url}): ${summary}`,
    )
    .join('\n')
  const comparisonSection =
    comparisonLines === '' ? '' : `## Comparisons\n\n${comparisonLines}\n\n`
  const documentationLine = ({
    title,
    description: summary,
    markdownUrl,
  }: LlmsDocumentationPage): string =>
    `- [${title}](${markdownUrl}): ${summary}`
  const guideLines = documentationPages
    .filter(({ secondary }) => !secondary)
    .map((page) => documentationLine(page))
  const documentationSection =
    guideLines.length === 0
      ? ''
      : `## Guide\n\n${guideLines.join('\n')}\n\nThe Guide is translated: every page exists under \`/<locale>/\`, for example \`${SITE_ORIGIN}/es/guide/\`.\n\n`
  const optionalLines = [
    ...documentationPages
      .filter(({ secondary }) => secondary)
      .map((page) => documentationLine(page)),
    `- [Chrome Web Store reviews](${SITE_ORIGIN}/reviews): what users say about Snug`,
  ].join('\n')
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

${documentationSection}${comparisonSection}${howToSection}## Pages

- [Full English page content](${SITE_ORIGIN}/llms-full.txt): the landing page, How-to answers, comparisons and Guide as Markdown
- [Install](${SITE_ORIGIN}/install): redirects to the Chrome Web Store or Microsoft Edge Add-ons listing
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/efknehclgcncocgochoibgiiagklcnho): the Edge listing
- [Privacy policy](${SITE_ORIGIN}/privacy/): what Snug stores and what it never sends
- [Source code](${STORE_FACTS.sourceUrl}): MIT-licensed repository
- [Sitemap](${SITE_ORIGIN}/sitemap.xml): all ten language versions

## Optional

${optionalLines}
`
}

function section(heading: string, ...blocks: string[]): string {
  return [`## ${heading}`, ...blocks].join('\n\n')
}

/**
 * The `llms-full.txt` body: the English landing page flattened to Markdown,
 * then each extra page under its own `## <title> (<url>)` heading.
 * @param content - The English content tree.
 * @param extraSections - How-to, comparison and Guide pages to append.
 * @returns The file contents.
 */
export function buildLlmsFullTxt(
  content: SiteContent,
  extraSections: readonly LlmsFullSection[] = [],
): string {
  const { landing } = content
  const bentoCards = BENTO_KEYS.map((key) => {
    const { title, body } = landing.bento[key]
    return `### ${title}\n\n${body}`
  })
  const stats = Object.values(landing.stats)
    .map(({ label, value }) => `- ${label}: ${value}`)
    .join('\n')
  const faqItems = Object.values(content.faq.items).map(
    ({ question, answer }) => `### ${question}\n\n${answer}`,
  )
  const reviewQuotes = REVIEWS.map(
    ({ quote, author, date }) => `> ${quote}\n>\n> ${author}, ${date}`,
  )
  const sections = [
    `# Snug\n\n> ${content.meta.description}`,
    section(
      fullHeadline(landing.hero, 'en'),
      landing.hero.subheadline,
      Object.values(landing.hero.chips).join(', '),
      stats,
      ...bentoCards,
    ),
    section(landing.showcase.heading, ...Object.values(content.interface.alts)),
    section(
      content.video.heading,
      content.video.caption,
      `[Watch the walkthrough on YouTube](${youtubeWatchUrl(PROMO_VIDEO_IDS.en)})`,
    ),
    section(
      landing.reviews.heading,
      landing.reviews.note,
      ...reviewQuotes,
      `[${content.proof.link}](${SITE_ORIGIN}/reviews)`,
    ),
    section(landing.faq.heading, ...faqItems),
    section(
      landing.closing.heading,
      landing.closing.line,
      `[${landing.closing.button}](${SITE_ORIGIN}/install)`,
    ),
    ...extraSections.map(
      ({ title, url, body }) => `## ${title} (${url})\n\n${body.trim()}`,
    ),
  ]
  return `${sections.join('\n\n')}\n`
}

/**
 * One sitemap URL; `lastmod` is omitted when no real change date is known and
 * `alternates` when the page has no translations.
 */
export interface SitemapEntry {
  loc: string
  lastmod?: string
  alternates?: readonly { hreflang: string; href: string }[]
}

function lastmodLine(lastmod: string | undefined): string {
  return lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''
}

function alternateLines(alternates: SitemapEntry['alternates']): string {
  return (alternates ?? [])
    .map(
      ({ hreflang, href }) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>\n`,
    )
    .join('')
}

/**
 * The XML sitemap listing every page with its `xhtml:link` alternates.
 * @param entries - Pages with their change dates and alternates.
 * @returns A complete `sitemap.xml` document.
 */
export function buildSitemapXml(entries: readonly SitemapEntry[]): string {
  const allUrls = entries
    .map(
      ({ loc, lastmod, alternates }) =>
        `  <url>\n    <loc>${loc}</loc>\n${lastmodLine(lastmod)}${alternateLines(alternates)}  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls}
</urlset>
`
}
