import { describe, expect, it } from 'vitest'

import { STORE_FACTS } from '../seo/store-facts'
import { getBentoCopy } from './bento'
import {
  countUpParts,
  FOOTER_LINK_HREFS,
  fullHeadline,
  getClosingCopy,
  getLandingCopy,
  installHref,
  PROMO_VIDEO_IDS,
  resolveHref,
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
      expect(hero.headline.length).toBeGreaterThan(0)
      expect(hero.cta.length).toBeGreaterThan(0)
      expect(hero.folders.research.length).toBeGreaterThan(0)
      expect(trust.links.privacy.length).toBeGreaterThan(0)
    }
  })

  it('has the v3 fidelity copy keys in every locale', () => {
    for (const locale of LOCALES) {
      const { hero, howItWorks, folders } = getLandingCopy(locale)
      const copy = [
        hero.eyebrow,
        hero.headline,
        hero.headlineAccent,
        howItWorks.eyebrow,
        howItWorks.heading,
        howItWorks.lead,
        folders.bookmarksBar,
        folders.otherBookmarks,
        getBentoCopy(locale).heading,
      ]
      for (const value of copy) {
        expect(value.trim().length).toBeGreaterThan(0)
      }
      expect(howItWorks.eyebrow).not.toBe(howItWorks.heading)
    }
  })

  it('joins the headline lead and accent per script', () => {
    const hero = getLandingCopy('en').hero
    expect(fullHeadline(hero, 'en')).toBe('Move your bookmarks to any browser.')
    expect(fullHeadline(getLandingCopy('ja').hero, 'ja')).toBe(
      'ブックマークを、どのブラウザーにも。',
    )
    expect(fullHeadline(getLandingCopy('zh_CN').hero, 'zh_CN')).toBe(
      '把书签带到任何浏览器。',
    )
  })

  it('tags install links with the placement', () => {
    expect(installHref('hero')).toBe('/install?c=hero')
    expect(installHref('footer')).toBe('/install?c=footer')
  })

  it('has interface and video copy in every locale', () => {
    for (const locale of LOCALES) {
      const { interface: shots, video } = getLandingCopy(locale)
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
      for (const key of Object.values(header.theme)) {
        expect(key.length).toBeGreaterThan(0)
      }
      expect(footer.navLabel.length).toBeGreaterThan(0)
      expect(notFound.title.length).toBeGreaterThan(0)
      expect(notFound.body.length).toBeGreaterThan(0)
      expect(notFound.backLink.length).toBeGreaterThan(0)
    }
  })

  it('resolves the privacy links per locale with a trailing slash', () => {
    for (const links of [TRUST_LINK_HREFS, FOOTER_LINK_HREFS]) {
      expect(resolveHref(links.privacy, 'en')).toBe('/privacy/')
      expect(resolveHref(links.privacy, 'es')).toBe('/es/privacy/')
      expect(resolveHref(links.privacy, 'de')).toBe('/de/privacy/')
    }
  })

  it("resolves the Guide and What's new footer links per locale", () => {
    expect(resolveHref(FOOTER_LINK_HREFS.guide, 'en')).toBe('/guide/')
    expect(resolveHref(FOOTER_LINK_HREFS.guide, 'pt_BR')).toBe('/pt-br/guide/')
    expect(resolveHref(FOOTER_LINK_HREFS.changelog, 'en')).toBe('/changelog/')
    expect(resolveHref(FOOTER_LINK_HREFS.changelog, 'ja')).toBe(
      '/ja/changelog/',
    )
  })

  it('leaves fixed hrefs untouched', () => {
    expect(resolveHref(TRUST_LINK_HREFS.source, 'es')).toBe(
      TRUST_LINK_HREFS.source,
    )
  })

  it('shares one source url between the trust links and the store facts', () => {
    expect(STORE_FACTS.sourceUrl).toBe(TRUST_LINK_HREFS.source)
  })
})

describe('countUpParts', () => {
  it.each([
    ['5,000', '5000', 'grouped', ','],
    ['5 000', '5000', 'grouped', ' '],
    ['4.8', '48', 'tenths', '.'],
    ['4,8', '48', 'tenths', ','],
    ['6', '6', 'plain', ''],
    ['0', '0', 'plain', ''],
  ])('splits %s', (value, target, format, separator) => {
    expect(countUpParts(value)).toEqual({ target, format, separator })
  })
})
