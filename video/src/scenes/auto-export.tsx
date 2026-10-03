import { useMemo } from 'react'
import { fitText } from '@remotion/layout-utils'
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { message, storeCaptions, type Locale } from '../copy'
import { fontStackFor } from '../fonts'
import {
  Camera,
  EASE,
  KineticText,
  SPRING,
  progressBetween,
  type CameraKeyframe,
} from '../motion'
import type { SceneProps } from '../schema'
import { theme } from '../theme'
import { AppWindow, FileIcon, SegmentedControl } from '../ui'

const SAFE_SIDE = 80
const SAFE_TOP = 100
const VIEW_WIDTH = 1920 - SAFE_SIDE * 2
const TEXT_BLOCK_HEIGHT = 250
const VIEW_TOP = SAFE_TOP + TEXT_BLOCK_HEIGHT + 20
const VIEW_HEIGHT = 1080 - 100 - VIEW_TOP
const ROW_HEIGHT = 84
const VISIBLE_BACKUPS = 3
const SWEEP_FROM = 38
const SWEEP_TO = 104
const ARRIVALS = [58, 82, 106, 130] as const
const REMOVAL_FROM = 130
const REMOVAL_TO = 152

const CAMERA: CameraKeyframe[] = [
  { frame: 0, x: 760, y: 430, zoom: 0.68 },
  { frame: 22, x: 760, y: 330, zoom: 0.95 },
  { frame: 112, x: 760, y: 360, zoom: 1 },
]

const fitSize = (
  text: string,
  fontFamily: string,
  weight: number,
  width: number,
  preferred: number,
): number =>
  Math.floor(
    Math.min(
      preferred,
      fitText({
        text,
        withinWidth: width,
        fontFamily,
        fontWeight: weight,
        validateFontIsLoaded: false,
      }).fontSize,
    ),
  )

const Clock = ({ turn }: { turn: number }) => (
  <svg width={220} height={220} viewBox="-110 -110 220 220">
    <circle
      r={100}
      fill={theme.ui.surface}
      stroke={theme.ui.borderStrong}
      strokeWidth={3}
    />
    {Array.from({ length: 12 }, (_, tick) => (
      <line
        key={tick}
        x1={0}
        y1={-84}
        x2={0}
        y2={tick % 3 === 0 ? -68 : -76}
        stroke={theme.ui.mutedText}
        strokeWidth={tick % 3 === 0 ? 4 : 2}
        strokeLinecap="round"
        transform={`rotate(${tick * 30})`}
      />
    ))}
    <line
      x1={0}
      y1={0}
      x2={0}
      y2={-44}
      stroke={theme.colors.text}
      strokeWidth={6}
      strokeLinecap="round"
      transform={`rotate(${turn * 90})`}
    />
    <line
      x1={0}
      y1={0}
      x2={0}
      y2={-70}
      stroke={theme.colors.accent}
      strokeWidth={4}
      strokeLinecap="round"
      transform={`rotate(${turn * 1080})`}
    />
    <circle r={7} fill={theme.colors.accent} />
  </svg>
)

const BackupRow = ({
  index,
  shift,
  locale,
}: {
  index: number
  shift: number
  locale: Locale
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const arrival = spring({
    frame: frame - (ARRIVALS[index] ?? 0),
    fps,
    config: SPRING.settle,
  })
  const fading = index === 0 ? 1 - shift : 1
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: (index - shift) * ROW_HEIGHT,
        height: ROW_HEIGHT - 12,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '0 18px',
        borderRadius: 14,
        boxSizing: 'border-box',
        background: theme.ui.surfaceMuted,
        border: `1.5px solid ${theme.ui.border}`,
        opacity: arrival * fading,
        transform: `translateX(${(1 - arrival) * 40}px)`,
        fontFamily: fontStackFor(locale).mono,
        fontSize: 22,
        color: theme.colors.text,
        whiteSpace: 'nowrap',
      }}
    >
      <FileIcon format="json" size={40} />
      {`snug-backup-${String(index + 1).padStart(4, '0')}.json`}
    </div>
  )
}

const DownloadsCard = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame()
  const fonts = fontStackFor(locale)
  const removal = progressBetween(frame, REMOVAL_FROM, REMOVAL_TO, EASE.settle)
  const keepLabel = message(locale, 'autoExportPage_keepLast')
  const labelSize = useMemo(
    () => fitSize(keepLabel, fonts.body, 500, 300, 24),
    [keepLabel, fonts.body],
  )
  return (
    <div
      style={{
        position: 'absolute',
        left: 690,
        top: 0,
        width: 442,
        boxSizing: 'border-box',
        padding: 24,
        borderRadius: 18,
        background: theme.ui.surface,
        border: `1.5px solid ${theme.ui.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 28,
          fontWeight: 600,
          color: theme.colors.accent,
        }}
      >
        {message(locale, 'autoExportPage_downloadsPrefix')}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            flex: 1,
            fontSize: labelSize,
            fontWeight: 500,
            color: theme.colors.secondary,
            whiteSpace: 'nowrap',
          }}
        >
          {keepLabel}
        </div>
        <div
          style={{
            width: 64,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            background: theme.ui.surfaceMuted,
            border: `1.5px solid ${theme.ui.borderStrong}`,
            fontFamily: fonts.mono,
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          {VISIBLE_BACKUPS}
        </div>
      </div>
      <div
        style={{ position: 'relative', height: ROW_HEIGHT * VISIBLE_BACKUPS }}
      >
        {ARRIVALS.map((_, index) => (
          <BackupRow
            key={index}
            index={index}
            shift={removal}
            locale={locale}
          />
        ))}
      </div>
    </div>
  )
}

const ScheduleColumn = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame()
  const fonts = fontStackFor(locale)
  const sweep = progressBetween(frame, SWEEP_FROM, SWEEP_TO, EASE.standard)
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 640 }}>
      <div
        style={{
          fontSize: 26,
          fontWeight: 600,
          color: theme.colors.secondary,
          marginBottom: 16,
          fontFamily: fonts.body,
        }}
      >
        {message(locale, 'autoExportPage_frequency')}
      </div>
      <SegmentedControl
        options={[
          message(locale, 'autoExportPage_interval1h'),
          message(locale, 'autoExportPage_interval1d'),
          message(locale, 'autoExportPage_interval7d'),
        ]}
        position={sweep * 2}
        segmentWidth={200}
      />
      <div style={{ marginTop: 44, marginLeft: 20 }}>
        <Clock turn={sweep} />
      </div>
    </div>
  )
}

const Subtitle = ({ text, locale }: { text: string; locale: Locale }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fonts = fontStackFor(locale)
  const width = VIEW_WIDTH - 200
  const size = useMemo(
    () => fitSize(text, fonts.body, 500, width, 38),
    [text, fonts.body, width],
  )
  const enter = spring({ frame: frame - 18, fps, config: SPRING.settle })
  return (
    <div
      style={{
        width,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        fontFamily: fonts.body,
        fontSize: size,
        fontWeight: 500,
        color: theme.colors.secondary,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 16}px)`,
      }}
    >
      {text}
    </div>
  )
}

/**
 * Auto-export scene: the schedule sweeps hourly to weekly while backups pile
 * into Downloads and retention retires the oldest.
 */
export const AutoExportScene = ({ locale }: SceneProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const captions = storeCaptions(locale).autoExport
  const windowIn = spring({ frame, fps, config: SPRING.settle })
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.ground }}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 75%, rgba(255,162,48,0.12), transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: SAFE_SIDE,
          top: SAFE_TOP,
          width: VIEW_WIDTH,
          height: TEXT_BLOCK_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        <KineticText
          text={captions.headline}
          locale={locale}
          maxWidth={VIEW_WIDTH}
          fontSize={96}
          delay={4}
        />
        <Subtitle text={captions.subtitle} locale={locale} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: SAFE_SIDE,
          top: VIEW_TOP,
          opacity: windowIn,
        }}
      >
        <Camera
          keyframes={CAMERA}
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          layer={{ width: 1520, height: 860 }}
          moveFrames={30}
        >
          <AppWindow locale={locale} active="autoExport">
            <ScheduleColumn locale={locale} />
            <DownloadsCard locale={locale} />
          </AppWindow>
        </Camera>
      </div>
    </AbsoluteFill>
  )
}
