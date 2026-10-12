import { SITE_ORIGIN } from '../i18n/locales'
import { STORE_FACTS } from './store-facts'

const VALIDITY_DAYS = 180

/**
 * The `/.well-known/security.txt` body (RFC 9116).
 * @param now - The build time; `Expires` is set 180 days after it.
 * @returns The file contents.
 */
export function buildSecurityTxt(now: Date = new Date()): string {
  const expires = new Date(now.getTime() + VALIDITY_DAYS * 86_400_000)
  return [
    `Contact: ${STORE_FACTS.sourceUrl}/security/advisories/new`,
    'Contact: mailto:hello@andryore.dev',
    `Expires: ${expires.toISOString()}`,
    `Policy: ${STORE_FACTS.sourceUrl}/blob/main/.github/SECURITY.md`,
    'Preferred-Languages: en',
    `Canonical: ${SITE_ORIGIN}/.well-known/security.txt`,
    '',
  ].join('\n')
}
