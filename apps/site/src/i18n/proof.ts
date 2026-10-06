/**
 * One public Chrome Web Store review, quoted verbatim in every locale.
 */
export interface Review {
  quote: string
  author: string
  date: string
}

/**
 * The reviews as the store shows them, in `docs/landing/content.md` order.
 * `[...]` marks text left out of a longer review. They are never translated.
 */
export const REVIEWS: readonly Review[] = [
  {
    quote:
      'My Dia beta browser (based on Chromium) has no way to export bookmarks. [...] It quickly created the HTML bookmarks file I needed.',
    author: 'Birdman',
    date: 'Jun 2025',
  },
  {
    quote:
      'I could not get Vivaldi to import bookmarks from Chrome - crashed every time. [...] Installed this in Vivaldi and it imported the export file in a flash. Painless.',
    author: 'Sean Frey',
    date: 'Sep 2024',
  },
  {
    quote:
      'I wanted to export bookmarks from a certain folder. This extension can do it.',
    author: 'Karol Darvaš',
    date: 'Feb 2026',
  },
  {
    quote: 'Used the HTML export and it worked awesome.',
    author: 'Jacob Hanson',
    date: 'Jun 2026',
  },
]

/**
 * Where "read all reviews" points: the counted `/reviews` redirect, which the
 * server answers with a 302 to the store listing's reviews tab.
 */
export const STORE_REVIEWS_URL = '/reviews?c=proof'

/**
 * The day the store figures were read, as an ISO date.
 */
const RATINGS_DATE = '2026-10-05'

/**
 * Fills the `{date}` placeholder of the ratings sentence with the read date,
 * formatted for the page locale.
 * @param template - The locale's `proof.numbers` copy.
 * @param languageTag - BCP 47 tag of the page locale.
 * @returns The sentence with a locale-formatted date.
 */
export function formatRatingsSentence(
  template: string,
  languageTag: string,
): string {
  const date = new Intl.DateTimeFormat(languageTag, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${RATINGS_DATE}T00:00:00Z`))
  return template.replace('{date}', () => date)
}
