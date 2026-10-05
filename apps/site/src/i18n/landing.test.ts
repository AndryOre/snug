import { describe, expect, it } from 'vitest'

import { getLandingCopy, installHref } from './landing'
import { LOCALES } from './locales'

describe('landing copy', () => {
  it('has non-empty hero and trust copy in every locale', () => {
    for (const locale of LOCALES) {
      const { hero, trust } = getLandingCopy(locale)
      expect(hero.headlineLead.length).toBeGreaterThan(0)
      expect(hero.headlineAccent.length).toBeGreaterThan(0)
      expect(hero.install.length).toBeGreaterThan(0)
      expect(trust.points.network.title.length).toBeGreaterThan(0)
      expect(trust.links.privacy.length).toBeGreaterThan(0)
    }
  })

  it('tags install links with the placement', () => {
    expect(installHref('hero')).toBe('/install?c=hero')
    expect(installHref('trust')).toBe('/install?c=trust')
  })
})
