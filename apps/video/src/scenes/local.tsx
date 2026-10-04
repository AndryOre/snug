import { fitText } from '@remotion/layout-utils'
import { type ReactNode, useMemo } from 'react'
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion'

import { type Locale, storeCaptions } from '../copy'
import { fontStackFor } from '../fonts'
import {
  Camera,
  type CameraKeyframe,
  EASE,
  KineticText,
  progressBetween,
  SPRING,
} from '../motion'
import type { SceneProps } from '../schema'
import { theme } from '../theme'
import { Icon } from '../ui'

const SAFE_SIDE = 80
const SAFE_TOP = 100
const VIEW_WIDTH = 1920 - SAFE_SIDE * 2
const PANEL_WIDTH = 1320
const PANEL_TOP = 400
const ROW_HEIGHT = 100
const PANEL_PADDING = 28
const PANEL_HEIGHT = ROW_HEIGHT * 4 + PANEL_PADDING * 2 - 14
const ROW_START = 10
const ROW_STEP = 12
const CHECK_LAG = 8
const OUTLINE_FROM = 62
const OUTLINE_TO = 86
const TEXT_WIDTH = 1010

const CAMERA: CameraKeyframe[] = [
  { frame: 0, x: 960, y: 540, zoom: 1 },
  { frame: 56, x: 960, y: 560, zoom: 1.04 },
]

type ClaimGlyph = 'account' | 'upload' | 'tracking' | 'source'

const GLYPHS: Record<ClaimGlyph, { paths: ReactNode; struck: boolean }> = {
  account: {
    paths: (
      <>
        <circle cx={12} cy={8} r={4} />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    struck: true,
  },
  upload: {
    paths: (
      <path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4.5 12.5 3.5 3.5 0 0 0 6 19z" />
    ),
    struck: true,
  },
  tracking: {
    paths: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx={12} cy={12} r={3} />
      </>
    ),
    struck: true,
  },
  source: {
    paths: (
      <>
        <path d="M16 18l6-6-6-6" />
        <path d="M8 6l-6 6 6 6" />
      </>
    ),
    struck: false,
  },
}

const GLYPH_ORDER: ClaimGlyph[] = ['account', 'upload', 'tracking', 'source']

const ClaimGlyphIcon = ({ glyph }: { glyph: ClaimGlyph }) => (
  <svg
    width={40}
    height={40}
    viewBox="0 0 24 24"
    fill="none"
    stroke={theme.colors.accent}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {GLYPHS[glyph].paths}
    {GLYPHS[glyph].struck ? <path d="M3 3l18 18" /> : null}
  </svg>
)

const ClaimRow = ({
  index,
  text,
  locale,
}: {
  index: number
  text: string
  locale: Locale
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fonts = fontStackFor(locale)
  const enter = spring({
    frame: frame - (ROW_START + index * ROW_STEP),
    fps,
    config: SPRING.settle,
  })
  const check = spring({
    frame: frame - (ROW_START + index * ROW_STEP + CHECK_LAG),
    fps,
    config: SPRING.snappy,
  })
  const size = useMemo(
    () =>
      Math.floor(
        Math.min(
          46,
          fitText({
            text,
            withinWidth: TEXT_WIDTH,
            fontFamily: fonts.body,
            fontWeight: 600,
            validateFontIsLoaded: false,
          }).fontSize,
        ),
      ),
    [text, fonts.body],
  )
  const glyph = GLYPH_ORDER[index] ?? 'source'
  return (
    <div
      style={{
        height: ROW_HEIGHT - 14,
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        padding: '0 28px',
        boxSizing: 'border-box',
        borderRadius: 18,
        background: theme.ui.surfaceMuted,
        border: `1.5px solid ${theme.ui.border}`,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 28}px)`,
      }}
    >
      <ClaimGlyphIcon glyph={glyph} />
      <div
        style={{
          width: TEXT_WIDTH,
          fontFamily: fonts.body,
          fontSize: size,
          fontWeight: 600,
          color: theme.colors.text,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
      <div
        style={{
          marginLeft: 'auto',
          width: 52,
          height: 52,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.colors.accent,
          color: theme.ui.onAccent,
          transform: `scale(${check})`,
          opacity: Math.min(1, check * 2),
        }}
      >
        <Icon name="check" size={30} strokeWidth={3} />
      </div>
    </div>
  )
}

const DeviceOutline = () => {
  const frame = useCurrentFrame()
  const draw = progressBetween(frame, OUTLINE_FROM, OUTLINE_TO, EASE.settle)
  const base = progressBetween(frame, OUTLINE_TO - 6, OUTLINE_TO + 6)
  const margin = 28
  const width = PANEL_WIDTH + margin * 2
  const height = PANEL_HEIGHT + margin * 2
  return (
    <svg
      width={width}
      height={height + 24}
      viewBox={`0 0 ${width} ${height + 24}`}
      style={{
        position: 'absolute',
        left: -margin,
        top: -margin,
        overflow: 'visible',
      }}
    >
      <rect
        x={2}
        y={2}
        width={width - 4}
        height={height - 4}
        rx={40}
        fill="none"
        stroke={theme.colors.accent}
        strokeWidth={4}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        strokeLinecap="round"
      />
      <path
        d={`M${width * 0.3} ${height + 10} H${width * 0.7}`}
        stroke={theme.colors.accent}
        strokeWidth={4}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - base}
      />
    </svg>
  )
}

/**
 * Local scene: four privacy claims check in one by one, then a device outline
 * closes around them.
 */
export const LocalScene = ({ locale }: SceneProps) => {
  const captions = storeCaptions(locale).local
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.ground }}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,162,48,0.10), transparent)',
        }}
      />
      <Camera keyframes={CAMERA} moveFrames={34}>
        <div
          style={{
            position: 'absolute',
            left: SAFE_SIDE,
            top: SAFE_TOP,
            width: VIEW_WIDTH,
            height: 230,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <KineticText
            text={captions.headline}
            locale={locale}
            maxWidth={VIEW_WIDTH}
            fontSize={104}
            delay={2}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: (1920 - PANEL_WIDTH) / 2,
            top: PANEL_TOP,
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            boxSizing: 'border-box',
            padding: PANEL_PADDING,
            paddingBottom: 0,
          }}
        >
          <DeviceOutline />
          {captions.claims.map((claim, index) => (
            <ClaimRow key={index} index={index} text={claim} locale={locale} />
          ))}
        </div>
      </Camera>
    </AbsoluteFill>
  )
}
