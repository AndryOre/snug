/**
 * The `target` and `rel` attributes of a link that opens in a new tab.
 */
export interface ExternalLinkAttributes {
  target: '_blank'
  rel: string
}

/**
 * Tells whether an href points off the site, that is, it is an absolute
 * `http(s)` URL. Relative paths, fragments and `mailto:` links are internal.
 * @param href - The link target.
 * @returns `true` for an absolute `http` or `https` URL.
 */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

/**
 * Builds the attributes for an external link: `target="_blank"` plus a `rel`
 * that merges any existing tokens (such as `author`) with `noopener` and
 * `noreferrer`, without duplicates.
 * @param existingRelationship - Space-separated `rel` tokens the link already needs.
 * @returns The `target` and merged `rel` attributes.
 */
export function externalLinkAttributes(
  existingRelationship = '',
): ExternalLinkAttributes {
  const tokens = [
    ...existingRelationship.split(/\s+/),
    'noopener',
    'noreferrer',
  ].filter((token) => token !== '')
  return { target: '_blank', rel: [...new Set(tokens)].join(' ') }
}
