import { getContent } from './content'
import type { Locale } from './locales'

/**
 * Copy for the hero section of one locale.
 */
export interface HeroCopy {
  eyebrow: string
  headlineLead: string
  headlineAccent: string
  subheadline: string
  install: string
  note: string
  source: string
}

/**
 * Title and body of one trust point.
 */
interface TrustPoint {
  title: string
  body: string
}

/**
 * Copy for the trust proof section of one locale.
 */
export interface TrustCopy {
  heading: string
  intro: string
  points: { network: TrustPoint; account: TrustPoint; source: TrustPoint }
  access: string
  links: {
    source: string
    scorecard: string
    bestPractices: string
    ci: string
    privacy: string
  }
}

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
export interface FeaturesCopy {
  heading: string
  items: Record<(typeof FEATURE_KEYS)[number], TrustPoint>
}

/**
 * Copy for the real-interface section of one locale.
 */
export interface InterfaceCopy {
  heading: string
  shots: Record<(typeof SHOT_KEYS)[number], string>
}

/**
 * Copy for the click-to-load video section of one locale.
 */
export interface VideoCopy {
  heading: string
  caption: string
  note: string
  play: string
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
  features: FeaturesCopy
  interface: InterfaceCopy
  video: VideoCopy
} {
  const content = getContent(locale)
  return {
    hero: content.hero as unknown as HeroCopy,
    trust: content.trust as unknown as TrustCopy,
    features: content.features as unknown as FeaturesCopy,
    interface: content.interface as unknown as InterfaceCopy,
    video: content.video as unknown as VideoCopy,
  }
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
  en: '2F3DndQFCLY',
  es: 'jolFPCjmpO4',
  de: '_V8AzYPQE7Y',
  fr: 'Dhack45iK_8',
  it: 'ucqSd0kdy_8',
  ja: 'bdsNWmhinC0',
  ko: 'LBz7s79Mzc0',
  pt_BR: 'c2wUbmYZAj8',
  ru: 'LObFipCZA4g',
  zh_CN: 'HtxCtXPZcYE',
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
  source: 'https://github.com/AndryOre/snug',
  scorecard: 'https://scorecard.dev/viewer/?uri=github.com/AndryOre/snug',
  bestPractices: 'https://www.bestpractices.dev/projects/15093',
  ci: 'https://github.com/AndryOre/snug/actions/workflows/ci.yml',
  privacy: 'https://github.com/AndryOre/snug/blob/main/PRIVACY_POLICY.md',
} as const

/**
 * Placements that tag an install button for the counted redirect.
 */
export type InstallPlacement = 'hero' | 'trust'

/**
 * Site-relative install URL carrying a placement tag.
 * @param placement - Where the button sits on the page.
 * @returns `/install?c=<placement>`.
 */
export function installHref(placement: InstallPlacement): string {
  return `/install?c=${placement}`
}
