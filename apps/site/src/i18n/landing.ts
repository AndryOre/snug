import { STORE_FACTS } from '../seo/store-facts'
import { alternativesPath } from './comparisons'
import { getContent, type SiteContent } from './content'
import { DOCS_PATHS } from './docs-ui'
import { howToIndexPath } from './how-to'
import { type Locale, localePath } from './locales'
import { privacyPath } from './privacy'

/**
 * Copy for the hero section of one locale.
 */
export type HeroCopy = SiteContent['landing']['hero']

/**
 * Copy for the folder names of the browser's bookmark tree in one locale.
 */
export type FoldersCopy = SiteContent['landing']['folders']

/**
 * Copy for the trust links of one locale.
 */
export type TrustCopy = SiteContent['trust']

/**
 * Copy for the stats strip of one locale.
 */
export type StatsCopy = SiteContent['landing']['stats']

/**
 * Copy for the browser marquee of one locale.
 */
export type MarqueeCopy = SiteContent['landing']['marquee']

/**
 * Keys of the real-interface screenshots, in display order.
 */
export const SHOT_KEYS = ['export', 'import', 'autoExport', 'popup'] as const

/**
 * Export format names shown as chips in the hero.
 */
export const EXPORT_FORMATS = [
  'HTML',
  'JSON',
  'CSV',
  'Markdown',
  'OPML',
  'XBEL',
] as const

/**
 * Copy for the real-interface captions and alt texts of one locale.
 */
export type InterfaceCopy = SiteContent['interface']

/**
 * Copy for the How it works section of one locale.
 */
export type HowItWorksCopy = SiteContent['landing']['howItWorks']

/**
 * Copy for the click-to-load video section of one locale.
 */
export type VideoCopy = SiteContent['video']

const UNSPACED_HEADLINE_LOCALES = new Set<Locale>(['ja', 'zh_CN'])

/**
 * Joins the hero headline lead and its accent phrase into the full H1 text.
 * @param hero - The locale's hero copy.
 * @param locale - The locale of that copy, which decides the separator.
 * @returns The lead and the accent, spaced as the locale's script requires.
 */
export function fullHeadline(hero: HeroCopy, locale: Locale): string {
  const separator = UNSPACED_HEADLINE_LOCALES.has(locale) ? '' : ' '
  return `${hero.headline}${separator}${hero.headlineAccent}`
}

/**
 * Landing copy for one locale. Key parity across locales is enforced by
 * `loadAllContent`, so the English shape holds for every locale.
 * @param locale - A supported locale code.
 * @returns The locale's section content.
 */
export function getLandingCopy(locale: Locale): {
  hero: HeroCopy
  trust: TrustCopy
  interface: InterfaceCopy
  video: VideoCopy
  stats: StatsCopy
  marquee: MarqueeCopy
  howItWorks: HowItWorksCopy
  folders: FoldersCopy
} {
  const { trust, interface: shots, video, landing } = getContent(locale)
  return {
    hero: landing.hero,
    trust,
    interface: shots,
    video,
    stats: landing.stats,
    marquee: landing.marquee,
    howItWorks: landing.howItWorks,
    folders: landing.folders,
  }
}

/**
 * Public YouTube video id of the promo in each locale.
 */
export const PROMO_VIDEO_IDS: Record<Locale, string> = {
  en: 'GA7bAMIAvI0',
  es: 'La7EjhTzxoU',
  de: 'SIfAAZpUMLg',
  fr: '_iBXTZA2aAg',
  it: 'cP3M2rjeK-U',
  ja: 'NdaSMcf-BbM',
  ko: 'jBg4AfJ5Nqw',
  pt_BR: 'UKOl-2k2o7E',
  ru: 'eCbFkhZzQro',
  zh_CN: 'EkrTNApjyW8',
}

/**
 * Watch-page URL of a video, used as the no-JavaScript fallback.
 * @param videoId - YouTube video id.
 * @returns The `youtube.com/watch` URL.
 */
export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/**
 * Privacy-enhanced embed URL that starts playing on load.
 * @param videoId - YouTube video id.
 * @returns The `youtube-nocookie.com/embed` URL with autoplay.
 */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
}

/**
 * External targets of the trust links.
 */
export const TRUST_LINK_HREFS = {
  source: STORE_FACTS.sourceUrl,
  scorecard: 'https://scorecard.dev/viewer/?uri=github.com/AndryOre/snug',
  bestPractices: 'https://www.bestpractices.dev/projects/15093',
  ci: 'https://github.com/AndryOre/snug/actions/workflows/ci.yml',
  privacy: privacyPath,
} as const

/**
 * Resolves a link target that may depend on the locale.
 * @param href - A fixed URL, or a function of the locale.
 * @param locale - The page's locale.
 * @returns The URL for that locale.
 */
export function resolveHref(
  href: string | ((locale: Locale) => string),
  locale: Locale,
): string {
  return typeof href === 'function' ? href(locale) : href
}

/**
 * Placements that tag an install button for the counted redirect.
 */
export type InstallPlacement = 'hero' | 'final' | 'dock' | 'footer'

/**
 * Site-relative install URL carrying a placement tag.
 * @param placement - Where the button sits on the page.
 * @returns `/install?c=<placement>`.
 */
export function installHref(placement: InstallPlacement): string {
  return `/install?c=${placement}`
}

/**
 * Copy for the social proof section of one locale.
 */
export type ProofCopy = SiteContent['proof']

/**
 * Copy for the FAQ section of one locale, entries in display order.
 */
export type FaqCopy = SiteContent['faq']

/**
 * Copy for the closing install panel of one locale.
 */
export type ClosingPanelCopy = SiteContent['landing']['closing']

/**
 * Copy for the footer of one locale.
 */
export type FooterCopy = SiteContent['footer']

/**
 * Copy for the page header of one locale.
 */
export type HeaderCopy = SiteContent['header']

/**
 * Copy for the 404 page of one locale.
 */
export type NotFoundCopy = SiteContent['notFound']

/**
 * Proof, FAQ, closing panel, footer, header and 404 copy for one locale.
 * @param locale - A supported locale code.
 * @returns The locale's `proof`, `faq`, `closing`, `footer`, `header` and `notFound` content.
 */
export function getClosingCopy(locale: Locale): {
  proof: ProofCopy
  faq: FaqCopy
  closing: ClosingPanelCopy
  footer: FooterCopy
  header: HeaderCopy
  notFound: NotFoundCopy
} {
  const { proof, faq, landing, footer, header, notFound } = getContent(locale)
  return {
    proof,
    faq,
    closing: landing.closing,
    footer,
    header,
    notFound,
  }
}

/**
 * External and site targets of the footer links.
 */
export const FOOTER_LINK_HREFS = {
  source: TRUST_LINK_HREFS.source,
  scorecard: TRUST_LINK_HREFS.scorecard,
  bestPractices: TRUST_LINK_HREFS.bestPractices,
  ci: TRUST_LINK_HREFS.ci,
  privacy: TRUST_LINK_HREFS.privacy,
  guide: (locale: Locale) => localePath(locale, DOCS_PATHS.guide),
  changelog: (locale: Locale) => localePath(locale, DOCS_PATHS.whatsNew),
  alternatives: (locale: Locale) => alternativesPath(locale),
  howTo: (locale: Locale) => howToIndexPath(locale),
} as const

/**
 * Splits a localized stat value into the integer a CSS counter animates and
 * the separator it re-inserts, so the animated number matches the copy.
 * @param value - The localized stat text, such as `5,000` or `4,8`.
 * @returns The digits, the counter format and the separator character.
 */
export function countUpParts(value: string): {
  target: string
  format: 'tenths' | 'grouped' | 'plain'
  separator: string
} {
  const target = value.replaceAll(/\D/g, '')
  const mark = /^\d+([.,])\d$/.exec(value)?.[1]
  const group = /^\d{1,3}(\D)\d{3}$/.exec(value)?.[1]
  return {
    target,
    format: mark ? 'tenths' : group ? 'grouped' : 'plain',
    separator: mark ?? group ?? '',
  }
}
