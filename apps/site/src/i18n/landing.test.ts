import { describe, expect, it } from 'vitest'

import {
  FEATURE_KEYS,
  getLandingCopy,
  installHref,
  PROMO_VIDEO_IDS,
  SHOT_KEYS,
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
      expect(PROMO_VIDEO_IDS[locale]).toMatch(/^[\w-]{11}$/)
    }
  })

  it('builds YouTube URLs from a video id', () => {
    expect(youtubeWatchUrl('abc')).toBe('https://www.youtube.com/watch?v=abc')
    expect(youtubeEmbedUrl('abc')).toContain(
      'https://www.youtube-nocookie.com/embed/abc?autoplay=1',
    )
  })
})
