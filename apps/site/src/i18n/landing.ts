import { STORE_FACTS } from '../seo/store-facts'
import { getContent, type SiteContent } from './content'
import { languageTag, type Locale } from './locales'
import { formatRatingsSentence } from './proof'

/**
 * Copy for the hero section of one locale.
 */
export type HeroCopy = SiteContent['hero']

/**
 * Copy for the trust proof section of one locale.
 */
export type TrustCopy = SiteContent['trust']

/**
 * Keys of the feature cards, in display order.
 */
export const FEATURE_KEYS = [
  'export',
  'preview',
  'undo',
  'duplicates',
  'backup',
  'works',
] as const

/**
 * Keys of the real-interface screenshots, in display order.
 */
export const SHOT_KEYS = ['export', 'import', 'autoExport', 'popup'] as const

/**
 * Copy for the features section of one locale.
 */
export type FeaturesCopy = SiteContent['features']

/**
 * Copy for the real-interface section of one locale.
 */
export type InterfaceCopy = SiteContent['interface']

/**
 * Copy for the click-to-load video section of one locale.
 */
export type VideoCopy = SiteContent['video']

/**
 * Landing copy for one locale. Key parity across locales is enforced by
 * `loadAllContent`, so the English shape holds for every locale.
 * @param locale - A supported locale code.
 * @returns The locale's section content.
 */
export function getLandingCopy(locale: Locale): {
  hero: HeroCopy
  trust: TrustCopy
  features: FeaturesCopy
  interface: InterfaceCopy
  video: VideoCopy
} {
  const { hero, trust, features, interface: shots, video } = getContent(locale)
  return { hero, trust, features, interface: shots, video }
}

/**
 * Format names shown as chips on the feature cards that list formats.
 */
export const FEATURE_FORMATS: Partial<
  Record<(typeof FEATURE_KEYS)[number], readonly string[]>
> = {
  export: ['HTML', 'JSON', 'CSV', 'Markdown', 'OPML', 'XBEL'],
  preview: ['HTML', 'JSON', 'CSV', 'XBEL'],
}

/**
 * Public YouTube video id of the promo in each locale.
 */
export const PROMO_VIDEO_IDS: Record<Locale, string> = {
  en: 'r89MCN-oLCw',
  es: 'qzCYxsfvBLo',
  de: 'MesCh6THh1Q',
  fr: 'd7IXJ6pkCv8',
  it: '9S1wtSk2CPk',
  ja: 'qCIqpym3W4s',
  ko: 'ByqVc8TM28Y',
  pt_BR: 'xuEPZSVCHIY',
  ru: 'ddrwmovswog',
  zh_CN: 'Mbd5-PEHbI8',
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
  privacy: '/privacy/',
} as const

/**
 * Placements that tag an install button for the counted redirect.
 */
export type InstallPlacement = 'hero' | 'trust' | 'final' | 'footer'

/**
 * Site-relative install URL carrying a placement tag.
 * @param placement - Where the button sits on the page.
 * @returns `/install?c=<placement>`.
 */
export function installHref(placement: InstallPlacement): string {
  return `/install?c=${placement}`
}

/**
 * Copy for the social proof section of one locale. `reviewsLead` is empty
 * where the rename note already introduces the reviews.
 */
export type ProofCopy = SiteContent['proof']

/**
 * Copy for the FAQ section of one locale, entries in display order.
 */
export type FaqCopy = SiteContent['faq']

/**
 * Copy for the final install call to action of one locale.
 */
export type FinalCopy = SiteContent['final']

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
 * Proof, FAQ, final call to action, footer, header and 404 copy for one locale.
 * @param locale - A supported locale code.
 * @returns The locale's `proof`, `faq`, `final`, `footer`, `header` and `notFound` content.
 */
export function getClosingCopy(locale: Locale): {
  proof: ProofCopy
  faq: FaqCopy
  final: FinalCopy
  footer: FooterCopy
  header: HeaderCopy
  notFound: NotFoundCopy
} {
  const { proof, faq, final, footer, header, notFound } = getContent(locale)
  return {
    proof: {
      ...proof,
      numbers: formatRatingsSentence(proof.numbers, languageTag(locale)),
    },
    faq,
    final,
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
  privacy: TRUST_LINK_HREFS.privacy,
  changelog: 'https://github.com/AndryOre/snug/blob/main/CHANGELOG.md',
} as const
