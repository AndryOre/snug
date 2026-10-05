import { createHash } from 'node:crypto'

/**
 * Token in `docker/security-headers.conf` replaced with the built script
 * hashes.
 */
export const SCRIPT_HASHES_PLACEHOLDER = '__SCRIPT_HASHES__'

const HASH_SOURCE = /'sha(?:256|384|512)-[^']+'/g
const INLINE_SCRIPT =
  /<script\b(?<attributes>[^>]*)>(?<body>[\s\S]*?)<\/script\s*>/gi
const META_CSP =
  /<meta http-equiv="content-security-policy" content="(?<policy>[^"]*)"/

/**
 * Hash sources in the `script-src` directive of the Astro-emitted CSP meta tag.
 * @param html - A built page.
 * @returns The quoted hash sources, or an empty list without a CSP meta tag.
 */
export function collectMetaScriptHashes(html: string): string[] {
  const policy = META_CSP.exec(html)?.groups?.['policy'] ?? ''
  const scriptDirective = policy
    .split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith('script-src '))
  return scriptDirective?.match(HASH_SOURCE) ?? []
}

/**
 * SHA-256 CSP sources for every executable inline script in a page.
 * @param html - A built page.
 * @returns One quoted hash source per inline script that is not a data block.
 */
export function findInlineScriptHashes(html: string): string[] {
  return html
    .matchAll(INLINE_SCRIPT)
    .filter(({ groups }) => {
      const attributes = groups?.['attributes'] ?? ''
      const type = /\btype="([^"]*)"/.exec(attributes)?.[1]
      return !/\bsrc=/.test(attributes) && (!type || type === 'module')
    })
    .map(({ groups }) => {
      const digest = createHash('sha256')
        .update(groups?.['body'] ?? '')
        .digest('base64')
      return `'sha256-${digest}'`
    })
    .toArray()
}

/**
 * Fills the header template with the sorted, de-duplicated script hashes.
 * @param template - The nginx header snippet containing the placeholder.
 * @param hashes - Quoted hash sources to allow.
 * @returns The rendered snippet.
 * @throws {Error} When no hashes are given, which would silently block every script.
 */
export function renderSecurityHeaders(
  template: string,
  hashes: readonly string[],
): string {
  if (hashes.length === 0) {
    throw new Error('No script hashes found in the built pages')
  }
  const rendered = [...new Set(hashes)]
    .toSorted((first, second) => first.localeCompare(second))
    .join(' ')
  return template.replace(SCRIPT_HASHES_PLACEHOLDER, () => rendered)
}
