import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import {
  collectMetaScriptHashes,
  findInlineScriptHashes,
  renderSecurityHeaders,
  SCRIPT_HASHES_PLACEHOLDER,
} from './security-headers'

const sha = (body: string) =>
  `'sha256-${createHash('sha256').update(body).digest('base64')}'`

const page = (hashes: string) =>
  `<html><head><meta http-equiv="content-security-policy" content="script-src 'self' ${hashes}; style-src 'self' 'unsafe-inline' ;"></head><body></body></html>`

describe('collectMetaScriptHashes', () => {
  it('reads only the script-src hashes from the Astro meta tag', () => {
    expect(
      collectMetaScriptHashes(page("'sha256-aaa=' 'sha256-bbb='")),
    ).toEqual(["'sha256-aaa='", "'sha256-bbb='"])
  })

  it('returns nothing when the page has no CSP meta tag', () => {
    expect(collectMetaScriptHashes('<html></html>')).toEqual([])
  })
})

describe('findInlineScriptHashes', () => {
  it('hashes executable inline scripts and skips data blocks and external scripts', () => {
    const html =
      '<script>a()</script><script type="application/ld+json">{}</script><script src="/x.js"></script><script type="module">b()</script>'
    expect(findInlineScriptHashes(html)).toEqual([sha('a()'), sha('b()')])
  })
})

describe('renderSecurityHeaders', () => {
  it('replaces the placeholder with the sorted unique hashes', () => {
    const template = `script-src 'self' ${SCRIPT_HASHES_PLACEHOLDER};`
    expect(
      renderSecurityHeaders(template, [
        "'sha256-b='",
        "'sha256-a='",
        "'sha256-b='",
      ]),
    ).toBe("script-src 'self' 'sha256-a=' 'sha256-b=';")
  })

  it('refuses to render without hashes', () => {
    expect(() => renderSecurityHeaders(SCRIPT_HASHES_PLACEHOLDER, [])).toThrow(
      /no script hashes/i,
    )
  })
})
