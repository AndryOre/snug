const TAG_OPEN_OUTSIDE_MARK = /<(?!\/?mark>)/gi

/**
 * Reduces an HTML string to text plus bare `<mark>` and `</mark>` tags, the
 * only markup Pagefind's result excerpts and messages carry. Every other `<`
 * becomes `&lt;`, so the string cannot start an element, attribute or script
 * when it reaches `innerHTML`.
 * @param html - The string a page script assigns to an HTML sink.
 * @returns The same text with every tag but `<mark>` neutralized.
 */
export function restrictToMarkTags(html: string): string {
  return html.replaceAll(TAG_OPEN_OUTSIDE_MARK, '&lt;')
}
