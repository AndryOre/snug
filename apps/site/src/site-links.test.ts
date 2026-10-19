import { describe, expect, it } from 'vitest'

import { externalLinkAttributes, isExternalHref } from './site-links'

describe('isExternalHref', () => {
  it.each(['https://example.com', 'HTTP://example.com/x'])(
    'treats %s as external',
    (href) => {
      expect(isExternalHref(href)).toBe(true)
    },
  )

  it.each(['/guide/', '../guide/', '#install', 'mailto:hi@example.com'])(
    'treats %s as internal',
    (href) => {
      expect(isExternalHref(href)).toBe(false)
    },
  )
})

describe('externalLinkAttributes', () => {
  it('opens a new tab without leaking the opener or referrer', () => {
    expect(externalLinkAttributes()).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })

  it('merges existing rel tokens without duplicates', () => {
    expect(externalLinkAttributes('author noopener').rel).toBe(
      'author noopener noreferrer',
    )
  })
})
