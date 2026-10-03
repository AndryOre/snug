import { loadFont } from '@remotion/fonts'
import { loadFont as loadGeistGoogle } from '@remotion/google-fonts/Geist'
import { loadFont as loadNotoSansJP } from '@remotion/google-fonts/NotoSansJP'
import { loadFont as loadNotoSansKR } from '@remotion/google-fonts/NotoSansKR'
import { loadFont as loadNotoSansSC } from '@remotion/google-fonts/NotoSansSC'
import { staticFile } from 'remotion'
import type { Locale } from './copy'

export type FontStack = {
  display: string
  body: string
  mono: string
}

type CjkLocale = 'ja' | 'ko' | 'zh_CN'

const GEIST = 'Geist'
const GEIST_MONO = 'Geist Mono'
const SPACE_GROTESK = 'Space Grotesk'
const FALLBACK = 'system-ui, sans-serif'
const MONO_FALLBACK = 'ui-monospace, monospace'

const NOTO: Record<CjkLocale, string> = {
  ja: 'Noto Sans JP',
  ko: 'Noto Sans KR',
  zh_CN: 'Noto Sans SC',
}

const isCjk = (locale: Locale): locale is CjkLocale =>
  locale === 'ja' || locale === 'ko' || locale === 'zh_CN'

const stack = (display: string, body: string): FontStack => ({
  display: `'${display}', ${FALLBACK}`,
  body: `'${body}', ${FALLBACK}`,
  mono: `'${GEIST_MONO}', ${MONO_FALLBACK}`,
})

/**
 * The font families a locale renders with. Space Grotesk has no Cyrillic, so
 * Russian uses Geist for display text; CJK locales use Noto Sans.
 */
export const fontStackFor = (locale: Locale): FontStack => {
  if (isCjk(locale)) return stack(NOTO[locale], NOTO[locale])
  if (locale === 'ru') return stack(GEIST, GEIST)
  return stack(SPACE_GROTESK, GEIST)
}

const loadBrandFonts = (): Promise<void[]> =>
  Promise.all([
    loadFont({
      family: GEIST,
      url: staticFile('fonts/Geist-var.woff2'),
      weight: '100 900',
    }),
    loadFont({
      family: GEIST_MONO,
      url: staticFile('fonts/GeistMono-var.woff2'),
      weight: '100 900',
    }),
    loadFont({
      family: SPACE_GROTESK,
      url: staticFile('fonts/SpaceGrotesk-var.woff2'),
      weight: '300 700',
    }),
  ])

const loadCjkFont = (locale: CjkLocale): Promise<unknown> => {
  const options = {
    weights: ['400', '700'] as ('400' | '700')[],
    ignoreTooManyRequestsWarning: true,
  }
  if (locale === 'ja') return loadNotoSansJP('normal', options).waitUntilDone()
  if (locale === 'ko') return loadNotoSansKR('normal', options).waitUntilDone()
  return loadNotoSansSC('normal', options).waitUntilDone()
}

const loadCyrillicGeist = (): Promise<unknown> =>
  loadGeistGoogle('normal', {
    weights: ['400', '500', '600', '700'],
    subsets: ['cyrillic'],
    ignoreTooManyRequestsWarning: true,
  }).waitUntilDone()

const pending = new Map<Locale, Promise<unknown>>()

/**
 * Loads every font a locale needs once and resolves when all are ready.
 */
export const loadFontsFor = (locale: Locale): Promise<unknown> => {
  const existing = pending.get(locale)
  if (existing) return existing
  const brand = loadBrandFonts()
  const loading = isCjk(locale)
    ? Promise.all([brand, loadCjkFont(locale)])
    : locale === 'ru'
      ? Promise.all([brand, loadCyrillicGeist()])
      : brand
  pending.set(locale, loading)
  return loading
}
