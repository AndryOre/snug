import { DEFAULT_LOCALE, localePath, type Locale, LOCALES } from './locales'

/**
 * Leaving reason ids, in display order. They are the Umami `reason` property
 * values, so they never change with the locale.
 */
export const GOODBYE_REASON_IDS = [
  'didnt-recognize',
  'permissions',
  'one-time',
  'missing-feature',
  'bug',
  'switched',
  'other',
] as const

export type GoodbyeReasonId = (typeof GOODBYE_REASON_IDS)[number]

/**
 * Install redirect URL for the Goodbye page, tagged with the Campaign `goodbye`
 * so the server log counts reinstalls from this page.
 */
export const GOODBYE_REINSTALL_HREF = '/install?c=goodbye'

/**
 * Where the feature-request and bug templates live on GitHub.
 */
export const GOODBYE_FEATURE_REQUEST_HREF =
  'https://github.com/AndryOre/snug/issues/new?template=2-feature-request.yml'
export const GOODBYE_BUG_REPORT_HREF =
  'https://github.com/AndryOre/snug/issues/new?template=1-bug-report.yml'

/**
 * Contact address shown in the replies.
 */
export const GOODBYE_EMAIL = 'hello@andryore.dev'

/**
 * Which actions follow each reason's reply.
 */
export const GOODBYE_REPLY_ACTIONS: Record<
  GoodbyeReasonId,
  {
    reinstall?: 'button' | 'link'
    github?: 'feature' | 'bug'
    email: boolean
  }
> = {
  'didnt-recognize': { reinstall: 'button', email: false },
  permissions: { reinstall: 'button', email: false },
  'one-time': { reinstall: 'link', email: false },
  'missing-feature': { github: 'feature', email: true },
  bug: { github: 'bug', email: true },
  switched: { email: true },
  other: { email: true },
}

/**
 * All copy of the Goodbye page for one locale.
 */
export interface GoodbyeCopy {
  meta: { title: string; description: string }
  notice: { title: string; body: string }
  headline: string
  lead: string
  question: string
  reasons: Record<GoodbyeReasonId, string>
  replies: Record<GoodbyeReasonId, string>
  replyLabel: string
  reinstall: string
  featureLink: string
  bugLink: string
  emailLead: string
  disclosure: {
    template: string
    yes: string
    no: string
    notProvided: string
    privacyLink: string
  }
}

/**
 * English Goodbye copy. The disclosure template carries `{version}`,
 * `{language}` and `{backups}` tokens that the page replaces with emphasized
 * values.
 */
export const GOODBYE_COPY_EN: GoodbyeCopy = {
  meta: {
    title: 'Goodbye | Snug',
    description: 'Thanks for trying Snug. Tell us why you left, if you like.',
  },
  notice: {
    title: 'Your scheduled backups have stopped',
    body: "Files already saved stay in your folder. Snug's internal safety snapshots were removed with the extension.",
  },
  headline: 'Sorry to see you go',
  lead: 'Your bookmarks were never touched. If you have a minute, one click tells us what went wrong.',
  question: 'Why did you remove Snug?',
  reasons: {
    'didnt-recognize': "I didn't recognize it (new name or icon)",
    permissions: 'It asked for new permissions or got disabled',
    'one-time': 'I only needed it once',
    'missing-feature': 'It was missing a feature',
    bug: "Something didn't work",
    switched: 'I switched to another tool',
    other: 'Other',
  },
  replies: {
    'didnt-recognize':
      'Snug, formerly Bookmarks Import & Export, is the same extension with a new name and icon. Your bookmarks were never touched.',
    permissions:
      'Snug asks to save backups to Downloads and to notify you if one fails. Both are optional now and everything stays on your device.',
    'one-time': 'Your files are yours. Come back anytime.',
    'missing-feature':
      'Thanks for telling us. Describe the feature you need and we will read it.',
    bug: 'Sorry about that. A short report with the steps helps us fix it.',
    switched: 'Thanks for telling us. We wish you well with it.',
    other: 'Thanks for telling us. Write to us if you want to say more.',
  },
  replyLabel: 'Our reply',
  reinstall: 'Reinstall Snug',
  featureLink: 'Request a feature on GitHub',
  bugLink: 'Report a bug on GitHub',
  emailLead: 'Or write to',
  disclosure: {
    template:
      'This page received only: version {version}, language {language}, scheduled backups {backups}. No identifier. Umami counts this visit and the reason you pick, without cookies.',
    yes: 'yes',
    no: 'no',
    notProvided: 'not provided',
    privacyLink: 'Privacy policy',
  },
}

/**
 * Translated Goodbye copy by locale. A locale missing here shows English.
 */
const TRANSLATIONS: Partial<Record<Locale, GoodbyeCopy>> = {}

/**
 * Goodbye copy for a locale, English when the locale has no translation yet.
 * @param locale - A supported locale code.
 * @returns The locale's copy, or the English copy.
 */
export function getGoodbyeCopy(locale: Locale): GoodbyeCopy {
  return TRANSLATIONS[locale] ?? GOODBYE_COPY_EN
}

/**
 * Site-relative path of the Goodbye page for a locale.
 * @param locale - A supported locale code.
 * @returns `/goodbye/` or `/<locale>/goodbye/`.
 */
export function goodbyePath(locale: Locale): string {
  return localePath(locale, '/goodbye/')
}

/**
 * The values the Goodbye page received in its URL, each `null` when absent or
 * not valid.
 */
export interface GoodbyeParameters {
  version: string | null
  language: Locale | null
  scheduledBackups: boolean | null
}

const VERSION_PATTERN = /^\d{1,4}(?:\.\d{1,4}){0,3}$/

/**
 * Reads `v`, `lang` and `ae` from a query string. Anything that is not a
 * dotted version, a supported locale code or `0`/`1` becomes `null`, so a
 * malformed value is never shown.
 * @param search - A query string such as `location.search`.
 * @returns The validated values.
 */
export function parseGoodbyeParameters(search: string): GoodbyeParameters {
  const parameters = new URLSearchParams(search)
  const version = parameters.get('v')
  const language = parameters.get('lang')
  const backups = parameters.get('ae')
  return {
    version: version !== null && VERSION_PATTERN.test(version) ? version : null,
    language: LOCALES.find((locale) => locale === language) ?? null,
    scheduledBackups: backups === '1' ? true : backups === '0' ? false : null,
  }
}

/**
 * Where a visit to the unprefixed English page should go when its `lang`
 * names another locale. Pages that already carry a locale path stay put.
 * @param locale - The locale of the page being shown.
 * @param search - The page's query string.
 * @returns The locale page URL with the same query, or `null` to stay.
 */
export function goodbyeRedirectTarget(
  locale: Locale,
  search: string,
): string | null {
  if (locale !== DEFAULT_LOCALE) return null
  const { language } = parseGoodbyeParameters(search)
  return language === null || language === DEFAULT_LOCALE
    ? null
    : `${goodbyePath(language)}${search}`
}
