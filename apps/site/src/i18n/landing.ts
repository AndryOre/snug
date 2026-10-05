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
 * Hero and trust copy for one locale. Key parity across locales is enforced
 * by `loadAllContent`, so the English shape holds for every locale.
 * @param locale - A supported locale code.
 * @returns The locale's `hero` and `trust` content.
 */
export function getLandingCopy(locale: Locale): {
  hero: HeroCopy
  trust: TrustCopy
} {
  const content = getContent(locale)
  return {
    hero: content.hero as unknown as HeroCopy,
    trust: content.trust as unknown as TrustCopy,
  }
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
