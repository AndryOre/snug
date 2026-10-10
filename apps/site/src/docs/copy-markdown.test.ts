import { describe, expect, it, vi } from 'vitest'

import { copyMarkdownTwin } from './copy-markdown'

function fetchReturning(body: string, isOk = true): typeof fetch {
  return vi.fn(async () => new Response(body, { status: isOk ? 200 : 404 }))
}

const failingFetch: typeof fetch = async () => {
  throw new TypeError('offline')
}

describe('copyMarkdownTwin', () => {
  it('writes the fetched Markdown to the clipboard', async () => {
    const writeText = vi.fn(async () => {})
    const result = await copyMarkdownTwin(
      '/guide/exporting.md',
      fetchReturning('# Exporting\n'),
      writeText,
    )
    expect(result).toBe('copied')
    expect(writeText).toHaveBeenCalledWith('# Exporting\n')
  })

  it('fails when the clipboard is blocked', async () => {
    const result = await copyMarkdownTwin(
      '/guide/exporting.md',
      fetchReturning('# Exporting\n'),
      async () => {
        throw new DOMException('blocked', 'NotAllowedError')
      },
    )
    expect(result).toBe('failed')
  })

  it('fails without touching the clipboard when the twin is missing', async () => {
    const writeText = vi.fn(async () => {})
    const result = await copyMarkdownTwin(
      '/guide/missing.md',
      fetchReturning('', false),
      writeText,
    )
    expect(result).toBe('failed')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('fails when the request errors', async () => {
    const result = await copyMarkdownTwin(
      '/guide/exporting.md',
      failingFetch,
      async () => {},
    )
    expect(result).toBe('failed')
  })
})
