import { describe, expect, it } from 'vitest'

import { resolveDocumentationLocale } from './locale'

describe('resolveDocumentationLocale', () => {
  it('maps hyphenated tags back to locale codes', () => {
    expect(resolveDocumentationLocale('pt-BR')).toBe('pt_BR')
    expect(resolveDocumentationLocale('zh-CN')).toBe('zh_CN')
    expect(resolveDocumentationLocale('en')).toBe('en')
  })

  it('rejects unknown tags', () => {
    expect(() => resolveDocumentationLocale('xx')).toThrow(/xx/)
  })
})
