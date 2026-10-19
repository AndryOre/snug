import { describe, expect, it } from 'vitest'

import { SITE_ORIGIN } from '../i18n/locales'
import { markExternalLinks } from './external-links'

describe('markExternalLinks', () => {
  it('opens an external link in a new tab with icon and hint', () => {
    const result = markExternalLinks(
      '<p><a href="https://example.com/x">Example</a></p>',
    )
    expect(result).toContain('href="https://example.com/x"')
    expect(result).toContain('target="_blank"')
    expect(result).toContain('rel="noopener noreferrer"')
    expect(result).toContain('<svg')
    expect(result).toContain('aria-hidden="true"')
    expect(result).toContain(
      '<span class="sr-only" lang="en"> (opens in a new tab)</span>',
    )
  })

  it('marks GitHub blob links', () => {
    const result = markExternalLinks(
      '<a href="https://github.com/AndryOre/snug/blob/main/LICENSE">License</a>',
    )
    expect(result).toContain('target="_blank"')
  })

  it.each([
    '<a href="/guide/">Guide</a>',
    '<a href="../guide/">Guide</a>',
    '<a href="#install">Install</a>',
    '<a href="mailto:hi@example.com">Mail</a>',
    `<a href="${SITE_ORIGIN}/guide/">Guide</a>`,
    '<a>No href</a>',
  ])('leaves %s unchanged', (html) => {
    expect(markExternalLinks(html)).toBe(html)
  })

  it('merges an existing rel', () => {
    const result = markExternalLinks(
      '<a rel="author noopener" href="https://example.com">A</a>',
    )
    expect(result).toContain('rel="author noopener noreferrer"')
    expect(result.match(/rel=/g)).toHaveLength(1)
  })

  it('replaces an existing target', () => {
    const result = markExternalLinks(
      '<a href="https://example.com" target="_self">A</a>',
    )
    expect(result).toContain('target="_blank"')
    expect(result).not.toContain('_self')
  })

  it('leaves literal anchors in code blocks untouched', () => {
    const html =
      '<pre><code>&lt;a href="https://example.com"&gt;x&lt;/a&gt;</code></pre><p><code><a href="https://example.com">y</a></code></p>'
    expect(markExternalLinks(html)).toBe(html)
  })

  it('marks external links whose text is inline code', () => {
    const result = markExternalLinks(
      '<p><a href="https://github.com/x/blob/main/CONTEXT.md"><code>CONTEXT.md</code></a></p>',
    )
    expect(result).toContain('target="_blank"')
    expect(result).toContain('<code>CONTEXT.md</code>')
    expect(result).toContain('<svg')
  })

  it('skips the icon for image links but keeps the attributes', () => {
    const result = markExternalLinks(
      '<a href="https://example.com"><img src="/a.png" alt=""></a>',
    )
    expect(result).toContain('target="_blank"')
    expect(result).not.toContain('<svg')
  })
})
