import { describe, expect, it } from 'vitest'

import { collectStarlightInlineScriptHashes } from './starlight-inline-hashes'

describe('collectStarlightInlineScriptHashes', () => {
  it('hashes the two inline scripts of the sidebar persister', () => {
    const hashes = collectStarlightInlineScriptHashes()
    expect(hashes).toHaveLength(2)
    for (const hash of hashes) expect(hash).toMatch(/^sha256-[\w+/]{43}=$/)
  })

  it('returns each hash once', () => {
    const hashes = collectStarlightInlineScriptHashes()
    expect(new Set(hashes).size).toBe(hashes.length)
  })
})
