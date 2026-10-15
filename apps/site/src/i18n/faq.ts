import { getContent } from './content'
import { LANDING_FAQ_KEYS } from './faq-keys'
import { type Locale, localePath } from './locales'

/**
 * One landing FAQ entry.
 */
interface LandingFaqEntry {
  id: (typeof LANDING_FAQ_KEYS)[number]
  question: string
  answer: string
}

/**
 * Copy of the landing FAQ section for one locale.
 */
export interface LandingFaqCopy {
  heading: string
  more: string
  moreHref: string
  entries: LandingFaqEntry[]
}

/**
 * Landing FAQ copy for one locale: the six kept items plus the link to the
 * locale's Guide FAQ page.
 * @param locale - A supported locale code.
 * @returns Heading, "More questions" label and target, and the six entries.
 */
export function getLandingFaqCopy(locale: Locale): LandingFaqCopy {
  const content = getContent(locale)
  return {
    heading: content.landing.faq.heading,
    more: content.landing.faq.more,
    moreHref: localePath(locale, '/guide/faq/'),
    entries: LANDING_FAQ_KEYS.map((id) => ({
      id,
      ...content.faq.items[id],
    })),
  }
}
