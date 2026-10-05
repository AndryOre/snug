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
export interface ProofCopy {
  heading: string
  numbers: string
  renameNote: string
  reviewsLead: string
  link: string
}

/**
 * Question and answer of one FAQ entry.
 */
interface FaqEntry {
  question: string
  answer: string
}

/**
 * Copy for the FAQ section of one locale, entries in display order.
 */
export interface FaqCopy {
  heading: string
  items: Record<string, FaqEntry>
}

/**
 * Copy for the final install call to action of one locale.
 */
export interface FinalCopy {
  heading: string
  line: string
  button: string
}

/**
 * Copy for the footer of one locale.
 */
export interface FooterCopy {
  source: string
  privacy: string
  listing: string
  changelog: string
  note: string
}

/**
 * Proof, FAQ, final call to action and footer copy for one locale.
 * @param locale - A supported locale code.
 * @returns The locale's `proof`, `faq`, `final` and `footer` content.
 */
export function getClosingCopy(locale: Locale): {
  proof: ProofCopy
  faq: FaqCopy
  final: FinalCopy
  footer: FooterCopy
} {
  const content = getContent(locale)
  return {
    proof: content.proof as unknown as ProofCopy,
    faq: content.faq as unknown as FaqCopy,
    final: content.final as unknown as FinalCopy,
    footer: content.footer as unknown as FooterCopy,
  }
}

/**
 * External and site targets of the footer links.
 */
export const FOOTER_LINK_HREFS = {
  source: TRUST_LINK_HREFS.source,
  privacy: '/privacy',
  changelog: 'https://github.com/AndryOre/snug/blob/main/CHANGELOG.md',
} as const
