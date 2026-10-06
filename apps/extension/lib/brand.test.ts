import { beforeEach, describe, expect, it } from 'vitest'

import { resetFakeI18n } from '@/lib/testing/fake-i18n'

import {
  CHROME_WEB_STORE_EXTENSION_ID,
  CHROME_WEB_STORE_URL,
  getSiteUrl,
  GITHUB_URL,
  PRODUCT_NAME,
  SITE_PRIVACY_URL,
  SITE_URL,
  TWITTER_URL,
} from './brand'

const localeMessages = import.meta.glob<{
  extensionName: { message: string }
}>('../locales/*.json', { eager: true, import: 'default' })

describe('PRODUCT_NAME', () => {
  it('finds the locale files', () => {
    expect(Object.keys(localeMessages).length).toBeGreaterThanOrEqual(2)
  })

  it.each(Object.entries(localeMessages))(
    'equals extensionName in %s',
    (_path, messages) => {
      expect(messages.extensionName.message).toBe(PRODUCT_NAME)
    },
  )
})

describe('CHROME_WEB_STORE_URL', () => {
  it('contains the extension ID', () => {
    expect(CHROME_WEB_STORE_URL).toContain(CHROME_WEB_STORE_EXTENSION_ID)
  })

  it('does not contain the store slug, so a listing rename cannot break it', () => {
    expect(CHROME_WEB_STORE_URL).not.toContain('bookmark-importexport')
  })

  it('is the slugless detail URL form', () => {
    expect(CHROME_WEB_STORE_URL).toBe(
      `https://chromewebstore.google.com/detail/${CHROME_WEB_STORE_EXTENSION_ID}`,
    )
  })
})

describe('GITHUB_URL', () => {
  it('points at the project repository', () => {
    expect(GITHUB_URL).toBe('https://github.com/AndryOre/snug')
  })
})

describe('TWITTER_URL', () => {
  it('points at the project X profile', () => {
    expect(TWITTER_URL).toBe('https://x.com/andryore')
  })
})

const SITE_LOCALE_PATHS: Record<string, string> = {
  en: '/',
  es: '/es/',
  de: '/de/',
  fr: '/fr/',
  it: '/it/',
  ja: '/ja/',
  ko: '/ko/',
  pt_BR: '/pt-br/',
  ru: '/ru/',
  zh_CN: '/zh-cn/',
}

describe('getSiteUrl', () => {
  beforeEach(() => {
    resetFakeI18n()
  })

  it('is the site root for English', () => {
    expect(getSiteUrl()).toBe(SITE_URL)
  })

  it.each(Object.entries(SITE_LOCALE_PATHS))(
    'appends the %s locale path',
    (locale, path) => {
      resetFakeI18n(locale)
      expect(getSiteUrl()).toBe(`https://snug.andryore.dev${path}`)
    },
  )
})

describe('SITE_PRIVACY_URL', () => {
  it('points at the English privacy page', () => {
    expect(SITE_PRIVACY_URL).toBe('https://snug.andryore.dev/privacy/')
  })
})
