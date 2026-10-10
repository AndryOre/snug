import { describe, expect, it } from 'vitest'

import {
  classifyTranslation,
  countHeadings,
  hashSource,
  MalformedTranslationError,
  parseTranslation,
} from './translations'

describe('hashSource', () => {
  it('returns 16 hex characters', () => {
    expect(hashSource('# Title\n')).toMatch(/^[0-9a-f]{16}$/)
  })

  it('ignores the line ending style', () => {
    expect(hashSource('a\r\nb\r\n')).toBe(hashSource('a\nb\n'))
  })

  it('changes when the text changes', () => {
    expect(hashSource('a')).not.toBe(hashSource('b'))
  })
})

describe('parseTranslation', () => {
  it('reads title, sourceHash and body', () => {
    const parsed = parseTranslation(
      '---\ntitle: "Exportar"\nsourceHash: abc123\n---\nHola\n',
      'es/docs/guide/exporting.md',
    )
    expect(parsed).toEqual({
      title: 'Exportar',
      sourceHash: 'abc123',
      body: 'Hola\n',
    })
  })

  it('rejects a file without frontmatter', () => {
    expect(() => parseTranslation('Hola', 'es/x.md')).toThrow(
      MalformedTranslationError,
    )
  })

  it('rejects a missing sourceHash', () => {
    expect(() =>
      parseTranslation('---\ntitle: T\n---\nbody', 'es/x.md'),
    ).toThrow(/missing sourceHash/)
  })

  it('rejects a missing title', () => {
    expect(() =>
      parseTranslation('---\nsourceHash: a\n---\nbody', 'es/x.md'),
    ).toThrow(/missing title/)
  })
})

describe('countHeadings', () => {
  it('counts headings of every level', () => {
    expect(countHeadings('# A\n\ntext\n\n## B\n\n### C\n')).toBe(3)
  })

  it('skips fenced code and hashes without a space', () => {
    expect(
      countHeadings('```\n# not a heading\n```\n\n#tag\n\n## Real\n'),
    ).toBe(1)
  })
})

describe('classifyTranslation', () => {
  it('is missing without a translation', () => {
    expect(classifyTranslation(undefined, 'abc')).toBe('missing')
  })

  it('is translated when the hash matches', () => {
    expect(classifyTranslation({ sourceHash: 'abc' }, 'abc')).toBe('translated')
  })

  it('is stale when the hash differs', () => {
    expect(classifyTranslation({ sourceHash: 'old' }, 'abc')).toBe('stale')
  })
})
