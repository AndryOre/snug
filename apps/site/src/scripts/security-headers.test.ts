import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { UMAMI_COLLECT_ORIGIN, UMAMI_SCRIPT_ORIGIN } from '../seo/umami'
import {
  collectMetaScriptHashes,
  findInlineScriptHashes,
  renderSecurityHeaders,
  SCRIPT_HASHES_PLACEHOLDER,
} from './security-headers'
import { THEME_INIT_HASH, THEME_INIT_SCRIPT } from './theme-init'

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

  it('matches script tags regardless of case and closing-tag spacing', () => {
    expect(
      findInlineScriptHashes('<SCRIPT>c()</SCRIPT ><script>d()</script>'),
    ).toEqual([sha('c()'), sha('d()')])
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

describe('theme init script', () => {
  it('has a CSP hash that matches the script exactly as it is inlined', () => {
    expect(
      findInlineScriptHashes(`<script>${THEME_INIT_SCRIPT}</script>`),
    ).toEqual([`'${THEME_INIT_HASH}'`])
  })
})

describe('nginx header template', () => {
  const template = readFileSync(
    new URL('../../docker/security-headers.conf', import.meta.url),
    'utf8',
  )

  it('allows the Umami script and collect origins and nothing inline', () => {
    expect(template).toContain(
      `script-src 'self' ${UMAMI_SCRIPT_ORIGIN} ${SCRIPT_HASHES_PLACEHOLDER};`,
    )
    expect(template).toContain(`connect-src 'self' ${UMAMI_COLLECT_ORIGIN};`)
    expect(template).toContain("require-trusted-types-for 'script'")
    const scriptSource = /script-src [^;]*/.exec(template)?.[0] ?? ''
    expect(scriptSource).not.toContain("'unsafe-inline'")
  })
})
