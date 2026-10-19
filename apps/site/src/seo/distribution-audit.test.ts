import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { findInlineScriptHashes } from '../scripts/security-headers'
import { THEME_INIT_HASH } from '../scripts/theme-init'
import { auditDistribution } from './distribution-audit'

const builtSite = path.join(import.meta.dirname, '../../dist')

function page(body: string, head = '', scriptHashes: string[] = []): string {
  const policy = `default-src 'none'; script-src 'self' ${scriptHashes.join(' ')}`
  return `<!doctype html><html><head><meta http-equiv="content-security-policy" content="${policy}">${head}</head><body>${body}</body></html>`
}

describe('auditDistribution', () => {
  let distribution = ''

  function write(relative: string, content: string) {
    const file = path.join(distribution, relative)
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, content)
  }

  beforeEach(() => {
    distribution = mkdtempSync(path.join(tmpdir(), 'distribution-audit-'))
    write('index.html', page('ok'))
  })

  afterEach(() => {
    rmSync(distribution, { recursive: true, force: true })
  })

  it('passes a clean build', () => {
    expect(auditDistribution(distribution)).toEqual([])
  })

  it('reports a missing build output folder', () => {
    expect(auditDistribution(path.join(distribution, 'nope'))).toEqual([
      expect.stringContaining('does not exist'),
    ])
  })

  it('allows the Umami script and the YouTube nocookie embed', () => {
    write(
      'index.html',
      page(
        '<script defer src="https://cloud.umami.is/script.js"></script><iframe src="https://www.youtube-nocookie.com/embed/abc"></iframe>',
      ),
    )
    expect(auditDistribution(distribution)).toEqual([])
  })

  it.each([
    ['script', '<script src="https://evil.example/x.js"></script>'],
    ['image', '<img src="https://cdn.example/a.png">'],
    ['srcset', '<img src="/a.png" srcset="https://cdn.example/a.png 2x">'],
    ['iframe', '<iframe src="//evil.example/embed"></iframe>'],
    [
      'YouTube embed without nocookie',
      '<iframe src="https://www.youtube.com/embed/a"></iframe>',
    ],
    [
      'Umami lookalike',
      '<script src="https://cloud.umami.is.evil.example/s.js"></script>',
    ],
  ])('fails on a third-party %s', (_label, body) => {
    write('index.html', page(body))
    expect(auditDistribution(distribution)).toEqual([
      expect.stringContaining('index.html: third-party request to'),
    ])
  })

  it('fails on a third-party stylesheet link and CSS url or import', () => {
    write(
      'index.html',
      page('', '<link rel="stylesheet" href="https://fonts.example/a.css">'),
    )
    write(
      'assets/a.css',
      '@import "https://x.example/b.css";a{background:url(https://x.example/i.png)}',
    )
    expect(auditDistribution(distribution)).toHaveLength(3)
  })

  it('ignores external anchors and non-loading links', () => {
    write(
      'index.html',
      page(
        '<a href="https://github.com/x">x</a>',
        '<link rel="canonical" href="https://other.example/"><link rel="alternate" href="https://other.example/">',
      ),
    )
    expect(auditDistribution(distribution)).toEqual([])
  })

  it.each([
    '<link rel="prefetch" href="/next/">',
    '<link rel="dns-prefetch" href="/x">',
    '<link rel="preconnect" href="/x">',
    '<link rel="modulepreload" href="/x.js">',
    '<link rel="preload" as="script" href="/x.js">',
  ])('fails on the unexpected loading link %s', (link) => {
    write('index.html', page('', link))
    expect(auditDistribution(distribution)).toEqual([
      expect.stringContaining('index.html: unexpected loading link'),
    ])
  })

  it('allows font preloads', () => {
    write(
      'index.html',
      page(
        '',
        '<link rel="preload" as="font" type="font/woff2" href="/f.woff2" crossorigin>',
      ),
    )
    expect(auditDistribution(distribution)).toEqual([])
  })

  it('allows an inline script whose hash is in the page policy', () => {
    const script = '<script>window.a=1</script>'
    write('index.html', page(script, '', findInlineScriptHashes(script)))
    expect(auditDistribution(distribution)).toEqual([])
  })

  it('fails on an inline script whose hash drifted from the policy', () => {
    write(
      'index.html',
      page('<script>window.a=1</script>', '', [THEME_INIT_HASH]),
    )
    expect(auditDistribution(distribution)).toEqual([
      expect.stringContaining('index.html: inline script not allowed'),
    ])
  })

  it('fails on an inline script in a page without a policy meta tag', () => {
    write('index.html', '<html><body><script>window.a=1</script></body></html>')
    expect(auditDistribution(distribution)).toEqual([
      expect.stringContaining('inline script not allowed'),
    ])
  })
})

describe.runIf(existsSync(builtSite) || process.env['REQUIRE_DIST'] === '1')(
  'the built site',
  () => {
    it('has a build output folder', () => {
      expect(existsSync(builtSite)).toBe(true)
    })

    it('requests nothing outside the allowlist and hashes every inline script', () => {
      expect(auditDistribution(builtSite)).toEqual([])
    })
  },
)
