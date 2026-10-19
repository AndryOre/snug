import { DOCS_UI } from '../i18n/docs-ui'
import { SITE_ORIGIN } from '../i18n/locales'
import { externalLinkAttributes, isExternalHref } from '../site-links'

const PROTECTED_SEGMENT = /<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>/gi
const ANCHOR = /<a\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/a>/gi
const ATTRIBUTE =
  /\s([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g

const OPENS_IN_NEW_TAB_HINT = DOCS_UI.opensInNewTab

const EXTERNAL_LINK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline;margin-inline-start:0.25rem;vertical-align:-0.125em"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>'

function readAttributes(source: string): Map<string, string> {
  const attributes = new Map<string, string>()
  for (const match of source.matchAll(ATTRIBUTE)) {
    const name = match[1]?.toLowerCase()
    if (name) {
      attributes.set(name, match[2] ?? match[3] ?? match[4] ?? '')
    }
  }
  return attributes
}

function isOffSite(href: string): boolean {
  return (
    isExternalHref(href) &&
    href !== SITE_ORIGIN &&
    !href.startsWith(`${SITE_ORIGIN}/`)
  )
}

function markAnchor(
  match: string,
  attributeSource: string,
  content: string,
): string {
  const attributes = readAttributes(attributeSource)
  const href = attributes.get('href')?.trim()
  if (href === undefined || !isOffSite(href)) {
    return match
  }
  const { target, rel } = externalLinkAttributes(attributes.get('rel'))
  const kept = attributeSource
    .replaceAll(ATTRIBUTE, (attribute: string, name: string) =>
      ['target', 'rel'].includes(name.toLowerCase()) ? '' : attribute,
    )
    .trimEnd()
  const icon = /<img\b/i.test(content) ? '' : EXTERNAL_LINK_ICON
  return `<a${kept} target="${target}" rel="${rel}">${content}${icon}<span class="sr-only" lang="en"> (${OPENS_IN_NEW_TAB_HINT})</span></a>`
}

/**
 * Opens off-site links of rendered docs HTML in a new tab. Every `<a>` whose
 * `href` is an absolute `http(s)` URL outside the site origin gets
 * `target="_blank"`, a `rel` merged with `noopener noreferrer`, an inline
 * external-link icon and a screen-reader hint. The hint is English, like the
 * rest of the Guide chrome. Internal, relative, fragment and `mailto:` links,
 * and anything inside `<pre>` or `<code>`, are left untouched.
 * @param html - The rendered Markdown HTML.
 * @returns The HTML with its external links marked.
 */
export function markExternalLinks(html: string): string {
  const protectedRanges = html
    .matchAll(PROTECTED_SEGMENT)
    .map(
      (segment) => [segment.index, segment.index + segment[0].length] as const,
    )
    .toArray()
  return html.replaceAll(
    ANCHOR,
    (
      match: string,
      attributeSource: string,
      content: string,
      offset: number,
    ) =>
      protectedRanges.some(([start, end]) => offset >= start && offset < end)
        ? match
        : markAnchor(match, attributeSource, content),
  )
}
