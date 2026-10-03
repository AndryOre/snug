import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { message, storeCaptions, type Locale } from '../copy'
import { fontStackFor } from '../fonts'
import {
  Camera,
  Cursor,
  EASE,
  KineticText,
  MatchCut,
  SPRING,
  progressBetween,
  type CameraKeyframe,
  type Waypoint,
} from '../motion'
import type { SceneProps } from '../schema'
import { theme } from '../theme'
import {
  APP_WINDOW_SIZE,
  AppWindow,
  Chip,
  FileIcon,
  Icon,
  TreeRow,
  type ExportFormat,
} from '../ui'

/**
 * Where the exported JSON file rests when the Export scene ends: screen
 * position of its centre in 1920x1080 space, and the `FileIcon` width in px.
 * The Import scene starts from the same place with
 * `<MatchCut at={EXPORT_FILE_END.at}><FileIcon format="json" size={EXPORT_FILE_END.size} /></MatchCut>`.
 */
export const EXPORT_FILE_END = {
  at: { x: 1660, y: 850 },
  size: 120,
} as const

const FOCUS = {
  x: APP_WINDOW_SIZE.width / 2,
  y: APP_WINDOW_SIZE.height / 2,
}
const ANCHOR = { x: 860, y: 720 }
const FINAL_ZOOM = 0.6
const CAMERA_MOVE_FRAMES = 40
const CAMERA_KEYFRAMES: readonly CameraKeyframe[] = [
  { frame: 0, ...FOCUS, zoom: 0.67 },
  { frame: 14, ...FOCUS, zoom: FINAL_ZOOM },
]

const CONTENT_ORIGIN = { x: 346, y: 162 }
const ROW_HEIGHT = 52
const PANEL_LEFT = 640
const CHIP_SCALE = 1.25
const CHIP_TOP = 56

type TreeEntry = {
  label: string
  kind: 'folder' | 'bookmark'
  depth: number
  expanded?: boolean
  cascadeIndex?: number
}

const TREE: readonly TreeEntry[] = [
  { label: 'Bookmarks bar', kind: 'folder', depth: 0, expanded: true },
  { label: 'Development', kind: 'folder', depth: 1, expanded: true },
  { label: 'GitHub', kind: 'bookmark', depth: 2, cascadeIndex: 0 },
  { label: 'MDN Web Docs', kind: 'bookmark', depth: 2, cascadeIndex: 1 },
  { label: 'Stack Overflow', kind: 'bookmark', depth: 2, cascadeIndex: 2 },
  { label: 'TypeScript Handbook', kind: 'bookmark', depth: 2, cascadeIndex: 3 },
  { label: 'Design', kind: 'folder', depth: 1 },
  { label: 'Reading list', kind: 'folder', depth: 1 },
]
const DEVELOPMENT_ROW = 1

const FORMATS: readonly { format: ExportFormat; x: number; y: number }[] = [
  { format: 'html', x: 0, y: 0 },
  { format: 'json', x: 125, y: 0 },
  { format: 'csv', x: 250, y: 0 },
  { format: 'md', x: 0, y: 70 },
  { format: 'opml', x: 150, y: 70 },
  { format: 'xbel', x: 285, y: 70 },
]
const JSON_SLOT = FORMATS[1] ?? { format: 'json' as const, x: 125, y: 0 }
const JSON_CHIP_WIDTH = 96

const SLIDE_END = 30
const SELECT_FRAME = 62
const CASCADE_START = 70
const CASCADE_STEP = 7
const CHIPS_START = 104
const CHIP_STEP = 5
const JSON_CLICK = 142
const FILE_START = 148
const FILE_FLIGHT_FRAMES = 44

/**
 * Scene-local frames the soundtrack hooks onto: cursor clicks, the cascade of
 * row ticks, the chip fan-out pops and the file landing.
 */
export const EXPORT_AUDIO_FRAMES = {
  clicks: [SELECT_FRAME, JSON_CLICK],
  cascadeTicks: [0, 1, 2, 3].map(
    (index) => CASCADE_START + index * CASCADE_STEP,
  ),
  chipPops: [0, 1, 2, 3, 4, 5].map((index) => CHIPS_START + index * CHIP_STEP),
  fileLanding: FILE_START + FILE_FLIGHT_FRAMES - 6,
} as const

const developmentTarget = {
  x: 230,
  y: DEVELOPMENT_ROW * ROW_HEIGHT + ROW_HEIGHT / 2,
}
const jsonChipCenter = {
  x: PANEL_LEFT + (JSON_SLOT.x + JSON_CHIP_WIDTH / 2) * CHIP_SCALE,
  y: CHIP_TOP + (JSON_SLOT.y + 22) * CHIP_SCALE,
}

const CURSOR_WAYPOINTS: readonly Waypoint[] = [
  { frame: 28, x: 760, y: 470 },
  { frame: SELECT_FRAME - 4, ...developmentTarget },
  { frame: 112, ...developmentTarget },
  { frame: JSON_CLICK - 4, x: jsonChipCenter.x + 6, y: jsonChipCenter.y + 6 },
]

const mix = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount

/**
 * Screen position of a point given in the window content area's coordinates,
 * at the camera's resting state.
 */
const contentToScreen = (point: {
  x: number
  y: number
}): { x: number; y: number } => ({
  x: ANCHOR.x + (CONTENT_ORIGIN.x + point.x - FOCUS.x) * FINAL_ZOOM,
  y: ANCHOR.y + (CONTENT_ORIGIN.y + point.y - FOCUS.y) * FINAL_ZOOM,
})

const FlyingFile = ({ frame }: { frame: number }) => {
  const { fps } = useVideoConfig()
  const flight = spring({
    frame: frame - FILE_START,
    fps,
    config: SPRING.settle,
    durationInFrames: FILE_FLIGHT_FRAMES,
  })
  if (frame < FILE_START) return null
  const start = contentToScreen(jsonChipCenter)
  const end = EXPORT_FILE_END.at
  const arc = Math.sin(Math.PI * flight) * 90
  const appear = progressBetween(frame, FILE_START, FILE_START + 6, EASE.snappy)
  return (
    <MatchCut
      at={{
        x: mix(start.x, end.x, flight),
        y: mix(start.y, end.y, flight) - arc,
      }}
      scale={mix(0.3, 1, flight)}
    >
      <div style={{ opacity: appear }}>
        <FileIcon format="json" size={EXPORT_FILE_END.size} />
      </div>
    </MatchCut>
  )
}

const DownloadsTray = ({ frame }: { frame: number }) => {
  const { fps } = useVideoConfig()
  const enter = spring({
    frame: frame - 118,
    fps,
    config: SPRING.settle,
    durationInFrames: 30,
  })
  const received = progressBetween(
    frame,
    FILE_START + FILE_FLIGHT_FRAMES - 10,
    FILE_START + FILE_FLIGHT_FRAMES + 6,
    EASE.settle,
  )
  return (
    <div
      style={{
        position: 'absolute',
        left: 1480,
        top: 820,
        width: 360,
        height: 140,
        boxSizing: 'border-box',
        borderRadius: 24,
        border: `2px ${received > 0.5 ? 'solid' : 'dashed'} ${received > 0.5 ? theme.colors.accent : theme.ui.borderStrong}`,
        background: theme.ui.sidebar,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 60}px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: 36,
        color: received > 0.5 ? theme.colors.accent : theme.ui.mutedText,
      }}
    >
      <Icon name="download" size={36} />
    </div>
  )
}

const ExportContent = ({
  locale,
  frame,
}: {
  locale: Locale
  frame: number
}) => {
  const { fps } = useVideoConfig()
  const fonts = fontStackFor(locale)
  const highlight = progressBetween(frame, 48, SELECT_FRAME, EASE.standard)
  const jsonActive = frame >= JSON_CLICK
  const fileLeft = frame >= FILE_START
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 580 }}>
        {TREE.map((entry, index) => {
          const isDevelopment = index === DEVELOPMENT_ROW
          const start =
            entry.cascadeIndex === undefined
              ? SELECT_FRAME
              : CASCADE_START + entry.cascadeIndex * CASCADE_STEP
          const checked =
            isDevelopment || entry.cascadeIndex !== undefined
              ? progressBetween(frame, start, start + 14, EASE.snappy)
              : 0
          return (
            <TreeRow
              key={entry.label}
              kind={entry.kind}
              label={entry.label}
              depth={entry.depth}
              expanded={entry.expanded}
              checkProgress={checked}
              highlight={isDevelopment ? highlight : 0}
            />
          )
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: PANEL_LEFT,
          top: 0,
          width: 470,
          fontFamily: fonts.body,
          fontSize: 22,
          fontWeight: 600,
          color: theme.ui.mutedText,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {message(locale, 'exportPage_formatLabel')}
      </div>
      {FORMATS.map((slot, index) => {
        const progress = spring({
          frame: frame - CHIPS_START - index * CHIP_STEP,
          fps,
          config: SPRING.snappy,
        })
        const isJson = slot.format === 'json'
        return (
          <div
            key={slot.format}
            style={{
              position: 'absolute',
              left: mix(
                developmentTarget.x,
                PANEL_LEFT + slot.x * CHIP_SCALE,
                progress,
              ),
              top: mix(
                developmentTarget.y - 22,
                CHIP_TOP + slot.y * CHIP_SCALE,
                progress,
              ),
              transformOrigin: '0 0',
              transform: `scale(${mix(0.4, CHIP_SCALE, progress)})`,
              opacity: isJson && fileLeft ? 0 : Math.min(1, progress * 2),
            }}
          >
            <Chip
              format={slot.format}
              tone={isJson && jsonActive ? 'active' : 'default'}
            />
          </div>
        )
      })}
      <Cursor
        waypoints={CURSOR_WAYPOINTS}
        clicks={[SELECT_FRAME, JSON_CLICK]}
      />
    </>
  )
}

/**
 * Export scene: the app window rises, Development gets selected, six format
 * chips fan out and the JSON export lands in the Downloads tray, ending at
 * `EXPORT_FILE_END`.
 */
export const ExportScene = ({ locale }: SceneProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const captions = storeCaptions(locale).export
  const slide = spring({
    frame,
    fps,
    config: SPRING.settle,
    durationInFrames: SLIDE_END,
  })
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.ground }}>
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 80,
          width: 1760,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <KineticText
          text={captions.headline}
          locale={locale}
          maxWidth={1760}
          fontSize={92}
          delay={4}
        />
        <KineticText
          text={captions.subtitle}
          locale={locale}
          maxWidth={1400}
          fontSize={36}
          weight={500}
          family="body"
          color={theme.colors.secondary}
          delay={18}
          stagger={2}
        />
      </div>
      <Camera
        keyframes={CAMERA_KEYFRAMES}
        moveFrames={CAMERA_MOVE_FRAMES}
        anchor={ANCHOR}
        layer={APP_WINDOW_SIZE}
      >
        <div style={{ transform: `translateY(${(1 - slide) * 1100}px)` }}>
          <AppWindow locale={locale} active="export">
            <ExportContent locale={locale} frame={frame} />
          </AppWindow>
        </div>
      </Camera>
      <DownloadsTray frame={frame} />
      <FlyingFile frame={frame} />
    </AbsoluteFill>
  )
}
