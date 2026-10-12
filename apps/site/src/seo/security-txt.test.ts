import { describe, expect, it } from 'vitest'

import { GET } from '../pages/.well-known/security.txt'
import { buildSecurityTxt } from './security-txt'

describe('buildSecurityTxt', () => {
  const now = new Date('2026-10-12T00:00:00.000Z')
  const lines = buildSecurityTxt(now).split('\n')

  it('lists the advisory URL and the mailto contact', () => {
    const contacts = lines.filter((line) => line.startsWith('Contact: '))
    expect(contacts).toEqual([
      'Contact: https://github.com/AndryOre/snug/security/advisories/new',
      'Contact: mailto:hello@andryore.dev',
    ])
  })

  it('has one Expires in the future and under one year ahead', () => {
    const expiresLines = lines.filter((line) => line.startsWith('Expires: '))
    expect(expiresLines).toHaveLength(1)
    const expires = new Date((expiresLines[0] ?? '').slice('Expires: '.length))
    const days = (expires.getTime() - now.getTime()) / 86_400_000
    expect(days).toBeGreaterThan(0)
    expect(days).toBeLessThan(365)
  })

  it('links the policy and the canonical URL', () => {
    expect(lines).toContain(
      'Policy: https://github.com/AndryOre/snug/blob/main/.github/SECURITY.md',
    )
    expect(lines).toContain(
      'Canonical: https://snug.andryore.dev/.well-known/security.txt',
    )
  })

  it('is served as UTF-8 plain text', async () => {
    const response = GET()
    expect(response.headers.get('Content-Type')).toBe(
      'text/plain; charset=utf-8',
    )
    expect(await response.text()).toContain('Contact: ')
  })
})
