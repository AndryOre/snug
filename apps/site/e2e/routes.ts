import {
  DEFAULT_LOCALE,
  type Locale,
  localePath,
  LOCALES,
} from '../src/i18n/locales'
import { COMPARISON_PAGES } from './comparison-paths'
import {
  HOW_TO_INDEX_LOCALES,
  HOW_TO_PAGE_LIST,
  howToIndexPath,
} from './how-to-paths'

/**
 * English plus one CJK (`ja`), one Cyrillic (`ru`) and one Latin (`de`)
 * locale: the sample pull requests scan.
 */
const SAMPLED_LOCALES: readonly Locale[] = ['en', 'ja', 'ru', 'de']

/**
 * Whether the axe matrix covers every locale. Set `AXE_MATRIX=full` on `main`
 * and the nightly run; pull requests and local runs scan the sample.
 */
const IS_FULL_MATRIX = process.env.AXE_MATRIX === 'full'

/**
 * The locales the current mode scans.
 */
const SCANNED_LOCALES: readonly Locale[] = IS_FULL_MATRIX
  ? LOCALES
  : SAMPLED_LOCALES

/**
 * Pages every locale carries, as locale-relative paths.
 */
const LOCALE_PAGES = ['/', '/privacy/', '/guide/', '/guide/exporting/']

/**
 * Pages only the default locale carries.
 */
const ENGLISH_ONLY_PATHS = ['/changelog/']

/**
 * Every route the current mode scans, once: the shared pages in each scanned
 * locale, the Alternatives and How-to pages each locale carries, and the
 * English-only pages.
 */
export const SCANNED_PATHS: readonly string[] = [
  ...new Set([
    ...SCANNED_LOCALES.flatMap((locale) =>
      LOCALE_PAGES.map((page) => localePath(locale, page)),
    ),
    ...COMPARISON_PAGES.filter((page) =>
      SCANNED_LOCALES.includes(page.locale),
    ).map((page) => page.path),
    ...HOW_TO_INDEX_LOCALES.filter((locale) =>
      SCANNED_LOCALES.includes(locale),
    ).map((locale) => howToIndexPath(locale)),
    ...HOW_TO_PAGE_LIST.filter((page) =>
      SCANNED_LOCALES.includes(page.locale),
    ).map((page) => page.path),
    ...ENGLISH_ONLY_PATHS.map((page) => localePath(DEFAULT_LOCALE, page)),
  ]),
]

/**
 * The landing page, privacy page, Alternatives and How-to pages in the
 * scanned locales: the pages that get a heading-order and 320px check.
 */
export const CONTENT_PATHS: readonly string[] = SCANNED_PATHS.filter(
  (path) => !path.includes('/guide/') && !ENGLISH_ONLY_PATHS.includes(path),
)

/**
 * `CONTENT_PATHS` without the English landing page, which has its own
 * responsive specs: the pages that also get a 320px axe and overflow check.
 */
export const WIDTH_CHECK_PATHS: readonly string[] = CONTENT_PATHS.filter(
  (path) => path !== localePath(DEFAULT_LOCALE),
)
