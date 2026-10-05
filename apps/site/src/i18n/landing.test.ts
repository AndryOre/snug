import { describe, expect, it } from 'vitest'

import { STORE_FACTS } from '../seo/store-facts'
import {
  FEATURE_KEYS,
  FOOTER_LINK_HREFS,
  getClosingCopy,
  getLandingCopy,
  installHref,
  PROMO_VIDEO_IDS,
  SHOT_KEYS,
  TRUST_LINK_HREFS,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from './landing'
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

  it('has features, interface and video copy in every locale', () => {
    for (const locale of LOCALES) {
      const { features, interface: shots, video } = getLandingCopy(locale)
      for (const key of FEATURE_KEYS) {
        expect(features.items[key].title.length).toBeGreaterThan(0)
        expect(features.items[key].body.length).toBeGreaterThan(0)
      }
      for (const key of SHOT_KEYS) {
        expect(shots.shots[key].length).toBeGreaterThan(0)
      }
      expect(video.note.length).toBeGreaterThan(0)
      expect(video.play.length).toBeGreaterThan(0)
      expect(video.labelSeparator.length).toBeGreaterThan(0)
      expect(PROMO_VIDEO_IDS[locale]).toMatch(/^[\w-]{11}$/)
    }
  })

  it('builds YouTube URLs from a video id', () => {
    expect(youtubeWatchUrl('abc')).toBe('https://www.youtube.com/watch?v=abc')
    expect(youtubeEmbedUrl('abc')).toContain(
      'https://www.youtube-nocookie.com/embed/abc?autoplay=1',
    )
  })

  it('has distinct image descriptions for every screenshot', () => {
    for (const locale of LOCALES) {
      const { interface: shots } = getLandingCopy(locale)
      for (const key of SHOT_KEYS) {
        expect(shots.alts[key].length).toBeGreaterThan(0)
        expect(shots.alts[key]).not.toBe(shots.shots[key])
      }
    }
  })

  it('has header, footer navigation and not-found copy in every locale', () => {
    for (const locale of LOCALES) {
      const { header, notFound, footer } = getClosingCopy(locale)
      expect(header.languageLabel.length).toBeGreaterThan(0)
      expect(header.languageSeparator.length).toBeGreaterThan(0)
      expect(header.skipLink.length).toBeGreaterThan(0)
      expect(header.homeLabel.length).toBeGreaterThan(0)
      expect(footer.navLabel.length).toBeGreaterThan(0)
      expect(notFound.title.length).toBeGreaterThan(0)
      expect(notFound.body.length).toBeGreaterThan(0)
      expect(notFound.backLink.length).toBeGreaterThan(0)
    }
  })

  it('links the privacy page with a trailing slash everywhere', () => {
    expect(TRUST_LINK_HREFS.privacy).toBe('/privacy/')
    expect(FOOTER_LINK_HREFS.privacy).toBe('/privacy/')
  })

  it('shares one source url between the trust links and the store facts', () => {
    expect(STORE_FACTS.sourceUrl).toBe(TRUST_LINK_HREFS.source)
  })
})
