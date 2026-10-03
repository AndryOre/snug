import { AbsoluteFill } from 'remotion'
import { VIDEO_COPY, type Locale } from '../copy'
import { FontGate } from '../FontGate'
import { fontStackFor } from '../fonts'
import type { SceneProps } from '../schema'
import { theme } from '../theme'
import { AppWindow, BlobMark } from '../ui'

export const THUMBNAIL_SIZE = { width: 1280, height: 720 } as const

const PADDING_X = 64
const HOOK_WIDTH = 640
const LATIN_HOOK_SIZE = 92
const CJK_HOOK_SIZE = 88
const JA_HOOK_SIZE = 80
const RU_HOOK_SIZE = 80
const WINDOW_SCALE = 0.64
const WINDOW_LEFT = 740
const WINDOW_TOP = 200
const BLOB_SIZE = 76
const WORDMARK_SIZE = 56

const isCjk = (locale: Locale): boolean =>
  locale === 'ja' || locale === 'ko' || locale === 'zh_CN'

/**
 * Hook font size for a locale. CJK glyphs are visually lighter per character
 * than Latin ones, so they get a slightly larger size.
 */
export const hookSizeFor = (locale: Locale): number => {
  if (locale === 'ja') return JA_HOOK_SIZE
  if (locale === 'ru') return RU_HOOK_SIZE
  return isCjk(locale) ? CJK_HOOK_SIZE : LATIN_HOOK_SIZE
}

/**
 * Hook split into display lines. Japanese breaks at the comma so no word is
 * cut mid-phrase, and Russian keeps the dash on the line it ends.
 */
export const hookLinesFor = (locale: Locale): string[] => {
  const hook = VIDEO_COPY[locale].hook
  if (locale === 'ja') return hook.split(/(?<=、)/)
  if (locale === 'ru') return [hook.replace(' — ', '\u00A0— ')]
  return [hook]
}

/**
 * 1280x720 YouTube thumbnail: BlobMark lockup and the localized promo hook on
 * the left, a cropped Snug window bleeding off the right edge. Nothing sits in
 * the bottom-right 20% where YouTube overlays the duration badge.
 */
export const Thumbnail = ({ locale }: SceneProps) => {
  const fonts = fontStackFor(locale)
  return (
    <FontGate locale={locale}>
      <AbsoluteFill style={{ backgroundColor: theme.colors.ground }}>
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(ellipse 760px 560px at 74% 46%, rgba(255,162,48,0.38), rgba(255,162,48,0.1) 55%, transparent 80%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: WINDOW_LEFT,
            top: WINDOW_TOP,
            transform: `scale(${WINDOW_SCALE})`,
            transformOrigin: 'top left',
          }}
        >
          <AppWindow locale={locale} active="export" />
        </div>
        <div
          style={{
            position: 'absolute',
            left: PADDING_X,
            top: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <BlobMark size={BLOB_SIZE} />
          <span
            style={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: WORDMARK_SIZE,
              color: theme.colors.text,
              letterSpacing: '-0.02em',
            }}
          >
            Snug
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: PADDING_X,
            top: 190,
            width: HOOK_WIDTH,
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: hookSizeFor(locale),
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: theme.colors.text,
            textWrap: 'balance',
            wordBreak: 'keep-all',
          }}
        >
          {hookLinesFor(locale).map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </AbsoluteFill>
    </FontGate>
  )
}
