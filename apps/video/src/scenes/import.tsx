import { measureText } from '@remotion/layout-utils'
import { useMemo } from 'react'
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion'

import de from '../../../extension/locales/de.json'
import en from '../../../extension/locales/en.json'
import es from '../../../extension/locales/es.json'
import fr from '../../../extension/locales/fr.json'
import it from '../../../extension/locales/it.json'
import ja from '../../../extension/locales/ja.json'
import ko from '../../../extension/locales/ko.json'
import pt_BR from '../../../extension/locales/pt_BR.json'
import ru from '../../../extension/locales/ru.json'
import zh_CN from '../../../extension/locales/zh_CN.json'
import { type Locale, message, storeCaptions } from '../copy'
import { fontStackFor } from '../fonts'
import {
  Camera,
  type CameraKeyframe,
  cameraStateAt,
  clicksBy,
  Cursor,
  EASE,
  KineticText,
  MatchCut,
  progressBetween,
  SPRING,
  type Waypoint,
} from '../motion'
import type { SceneProps } from '../schema'
import { theme } from '../theme'
import {
  AppWindow,
  Button,
  FileIcon,
  SegmentedControl,
  Toast,
  TreeRow,
  type TreeRowProps,
} from '../ui'
import { EXPORT_FILE_END } from './export'

/**
 * The Export scene's closing file chip, reused so the match cut lines up.
 */
export const IMPORT_FILE_START = {
  ...EXPORT_FILE_END,
  scale: 1,
  format: 'json',
} as const

const PLURAL_CATALOGS: Record<Locale, Record<string, unknown>> = {
  en,
  es,
  de,
  fr,
  it,
  ja,
  ko,
  pt_BR,
  ru,
  zh_CN,
}

/**
 * Resolves a plural entry (`1` / `n` forms with `$1`, `$2` placeholders) from
 * the shipped locale catalog; `message` only addresses plain strings.
 */
const plural = (
  locale: Locale,
  key: string,
  count: number,
  values: readonly string[],
): string => {
  const entry = PLURAL_CATALOGS[locale][key] as Record<string, string>
  const template = (count === 1 ? entry['1'] : undefined) ?? entry['n']
  if (template === undefined)
    throw new Error(`No plural "${key}" for ${locale}`)
  let text = template
  for (const [index, value] of values.entries()) {
    text = text.replace(`$${index + 1}`, () => value)
  }
  return text
}

const VIEWPORT = { left: 80, top: 376, width: 1760, height: 604 } as const
const ANCHOR = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 } as const
const LAYER = { width: 1520, height: 860 } as const
const ORIGIN = { x: 344, y: 158 } as const

const FILE_ICON = 44
const FILE_ROW = { height: 72, gap: 8, width: 640 } as const
const IMPORT_FILES = [
  { name: 'bookmarks.json', format: 'json', count: 8 },
  { name: 'chrome-export.html', format: 'html', count: 6 },
  { name: 'work-links.csv', format: 'csv', count: 4 },
] as const
const FILE_CENTER = {
  x: ORIGIN.x + 16 + FILE_ICON / 2,
  y: ORIGIN.y + 36,
} as const
const MODE_TOP = 252
const SEGMENT_TOP = MODE_TOP + 34
const TREE_TOP = 366
const TREE_WIDTH = 600
const RIGHT_LEFT = 680
const RIGHT_WIDTH = 452
const BUTTON_TOP = TREE_TOP + 36
const TOAST_TOP = BUTTON_TOP + 100

const BOOKMARKS_BAR_COUNT = 11
const OTHER_BOOKMARKS_COUNT = 7
const DUPLICATE_COUNT = 2
const NEW_COUNT = BOOKMARKS_BAR_COUNT + OTHER_BOOKMARKS_COUNT - DUPLICATE_COUNT
const REPLACE_ADDED_COUNT = IMPORT_FILES[0].count
const REMOVED_COUNT = 42

const T = {
  windowIn: 4,
  flyStart: 12,
  land: 40,
  secondFile: 50,
  thirdFile: 56,
  treeStart: 62,
  treeStagger: 5,
  cursorModeArrive: 104,
  modeClick: 112,
  buttonArrive: 150,
  buttonClick: 158,
  toastIn: 164,
} as const

/**
 * Scene-local frames the soundtrack hooks onto.
 */
export const IMPORT_AUDIO_FRAMES = {
  clicks: [T.modeClick, T.buttonClick],
  toast: T.toastIn,
  fileLanding: T.land,
} as const

const CAMERA: CameraKeyframe[] = [
  { frame: 0, x: 760, y: 430, zoom: 0.68 },
  { frame: 82, x: 760, y: 440, zoom: 0.85 },
  { frame: 140, x: 760, y: 500, zoom: 0.85 },
]

const TREE: (Pick<TreeRowProps, 'kind' | 'label' | 'depth'> & {
  duplicate?: boolean
})[] = [
  { kind: 'folder', label: 'Reading list', depth: 0 },
  { kind: 'bookmark', label: 'MDN Web Docs', depth: 1 },
  { kind: 'bookmark', label: 'Remotion', depth: 1, duplicate: true },
  { kind: 'folder', label: 'Design', depth: 0 },
  { kind: 'bookmark', label: 'Figma', depth: 1 },
]

const layerPoint = (x: number, y: number): { x: number; y: number } => ({
  x: ORIGIN.x + x,
  y: ORIGIN.y + y,
})

const segmentWidthFor = (
  labels: readonly string[],
  family: string,
): { width: number; fontSize: number } => {
  const widest = Math.max(
    ...labels.map(
      (label) =>
        measureText({
          text: label,
          fontFamily: family,
          fontSize: 20,
          fontWeight: '600',
          validateFontIsLoaded: false,
        }).width,
    ),
  )
  const width = Math.min(372, Math.max(220, Math.ceil(widest) + 56))
  const available = width - 28
  const fontSize =
    widest > available ? Math.floor((20 * available) / widest) : 20
  return { width, fontSize }
}

const SectionLabel = ({
  children,
  family,
}: {
  children: string
  family: string
}) => (
  <div
    style={{
      fontFamily: family,
      fontSize: 22,
      fontWeight: 600,
      color: theme.colors.secondary,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
)

const FileRow = ({
  locale,
  index,
  visible,
  hidden,
}: {
  locale: Locale
  index: number
  visible: number
  hidden: number
}) => {
  const file = IMPORT_FILES[index]
  if (file === undefined) return null
  const opacity = visible * (1 - hidden)
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: index * (FILE_ROW.height + FILE_ROW.gap),
        width: FILE_ROW.width,
        height: FILE_ROW.height,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '0 16px',
        borderRadius: 14,
        background: theme.ui.surface,
        border: `1.5px solid ${theme.ui.border}`,
        opacity: index === 0 ? 1 : opacity,
        transform: `translateY(${(1 - visible) * 14}px)`,
      }}
    >
      <div style={{ width: FILE_ICON, opacity: index === 0 ? visible : 1 }}>
        <FileIcon format={file.format} size={FILE_ICON} />
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700 }}>{file.name}</div>
        <div style={{ fontSize: 18, color: theme.ui.mutedText }}>
          {plural(locale, 'importPreviewCount', file.count, [
            String(file.count),
          ])}
        </div>
      </div>
    </div>
  )
}

const PreviewSummary = ({
  locale,
  enter,
}: {
  locale: Locale
  enter: number
}) => {
  const rootsText = `${message(locale, 'bookmarksBar')} ${BOOKMARKS_BAR_COUNT} · ${message(locale, 'otherBookmarks')} ${OTHER_BOOKMARKS_COUNT}`
  return (
    <div
      style={{
        position: 'absolute',
        left: RIGHT_LEFT,
        top: 0,
        width: RIGHT_WIDTH,
        boxSizing: 'border-box',
        padding: '16px 20px',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: theme.ui.surfaceMuted,
        opacity: enter,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700 }}>{rootsText}</div>
      <div style={{ fontSize: 18, color: theme.ui.mutedText }}>
        {[
          plural(locale, 'import_previewNew', NEW_COUNT, [String(NEW_COUNT)]),
          plural(locale, 'import_previewDuplicates', DUPLICATE_COUNT, [
            String(DUPLICATE_COUNT),
          ]),
        ].join(' · ')}
      </div>
    </div>
  )
}

const DeletionCard = ({ locale, enter }: { locale: Locale; enter: number }) => (
  <div
    style={{
      position: 'absolute',
      left: RIGHT_LEFT,
      top: 0,
      width: RIGHT_WIDTH,
      boxSizing: 'border-box',
      padding: '16px 20px',
      borderRadius: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      background: 'oklch(0.3 0.08 25 / 45%)',
      border: '1.5px solid oklch(0.65 0.2 25 / 60%)',
      opacity: enter,
      transform: `translateY(${(1 - enter) * 18}px)`,
    }}
  >
    <div
      style={{
        fontSize: 22,
        fontWeight: 700,
        color: 'oklch(0.8 0.14 25)',
      }}
    >
      {plural(locale, 'import_deleteTitle', REMOVED_COUNT, [
        String(REMOVED_COUNT),
      ])}
    </div>
    <div
      style={{
        fontSize: 18,
        lineHeight: 1.35,
        color: theme.colors.secondary,
      }}
    >
      {plural(locale, 'import_deleteDescription', REPLACE_ADDED_COUNT, [
        String(REPLACE_ADDED_COUNT),
      ])}
    </div>
  </div>
)

const DuplicateBadge = ({ locale }: { locale: Locale }) => (
  <div
    style={{
      position: 'absolute',
      right: 14,
      top: 11,
      padding: '4px 12px',
      borderRadius: 999,
      fontSize: 16,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      color: theme.ui.mutedText,
      border: `1.5px solid ${theme.ui.borderStrong}`,
    }}
  >
    {message(locale, 'import_duplicateBadge')}
  </div>
)

/**
 * Import scene (local frames 0-209): the exported file lands on the Import
 * page, two more files join it, the selection tree builds with checkboxes and
 * a skipped duplicate, the mode flips to replace (one file, deletion card),
 * and the Undo toast follows the confirm click.
 */
export const ImportScene = ({ locale }: SceneProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const captions = storeCaptions(locale).import
  const family = fontStackFor(locale).body

  const modeLabels = [
    message(locale, 'importModeRestoreMerge'),
    message(locale, 'importModeRestoreReplace'),
    message(locale, 'importModeFolder'),
  ]
  const modeLabelsKey = JSON.stringify(modeLabels)
  const segments = useMemo(
    () => segmentWidthFor(JSON.parse(modeLabelsKey) as string[], family),
    [modeLabelsKey, family],
  )

  const modeProgress = spring({
    frame: frame - T.modeClick,
    fps,
    config: SPRING.snappy,
  })
  const replaced = clicksBy([T.modeClick], frame) > 0
  const confirmed = clicksBy([T.buttonClick], frame) > 0
  const panelEnter = spring({
    frame: frame - T.treeStart,
    fps,
    config: SPRING.settle,
  })
  const deletionEnter = spring({
    frame: frame - T.modeClick - 6,
    fps,
    config: SPRING.settle,
  })
  const toastEnter = spring({
    frame: frame - T.toastIn,
    fps,
    config: SPRING.snappy,
  })
  const windowEnter = spring({
    frame: frame - T.windowIn,
    fps,
    config: SPRING.settle,
  })
  const press = progressBetween(frame, T.buttonClick, T.buttonClick + 4)
  const pressRelease = progressBetween(
    frame,
    T.buttonClick + 4,
    T.buttonClick + 10,
  )
  const extraFilesHidden = progressBetween(
    frame,
    T.modeClick + 2,
    T.modeClick + 14,
  )

  const camera = cameraStateAt(CAMERA, frame, fps, 24)
  const landed = frame >= T.land
  const flight = progressBetween(frame, T.flyStart, T.land, EASE.settle)
  const landingScreen = {
    x:
      VIEWPORT.left +
      ANCHOR.x -
      camera.x * camera.zoom +
      FILE_CENTER.x * camera.zoom,
    y:
      VIEWPORT.top +
      ANCHOR.y -
      camera.y * camera.zoom +
      FILE_CENTER.y * camera.zoom,
  }
  const chipScale =
    IMPORT_FILE_START.scale +
    ((FILE_ICON * camera.zoom) / IMPORT_FILE_START.size -
      IMPORT_FILE_START.scale) *
      flight
  const chipOffset = {
    x: (landingScreen.x - IMPORT_FILE_START.at.x) * flight,
    y: (landingScreen.y - IMPORT_FILE_START.at.y) * flight,
  }

  const segmentCenter = (index: number) =>
    layerPoint(5 + segments.width * (index + 0.5), SEGMENT_TOP + 28)
  const buttonCenter = layerPoint(RIGHT_LEFT + 190, BUTTON_TOP + 30)
  const replaceTarget = segmentCenter(1)
  const waypoints: Waypoint[] = [
    { frame: 0, x: 1120, y: 560 },
    { frame: T.cursorModeArrive, x: replaceTarget.x, y: replaceTarget.y },
    {
      frame: T.modeClick + 24,
      x: replaceTarget.x + 10,
      y: replaceTarget.y + 6,
    },
    { frame: T.buttonArrive, x: buttonCenter.x, y: buttonCenter.y },
  ]

  return (
    <AbsoluteFill style={{ background: theme.colors.ground }}>
      <div
        style={{
          position: 'absolute',
          left: VIEWPORT.left,
          top: VIEWPORT.top,
          opacity: windowEnter,
        }}
      >
        <Camera
          keyframes={CAMERA}
          anchor={ANCHOR}
          width={VIEWPORT.width}
          height={VIEWPORT.height}
          layer={LAYER}
        >
          <AppWindow locale={locale} active="import">
            <FileRow
              locale={locale}
              index={0}
              visible={landed ? 1 : 0}
              hidden={0}
            />
            <FileRow
              locale={locale}
              index={1}
              visible={progressBetween(frame, T.secondFile, T.secondFile + 10)}
              hidden={extraFilesHidden}
            />
            <FileRow
              locale={locale}
              index={2}
              visible={progressBetween(frame, T.thirdFile, T.thirdFile + 10)}
              hidden={extraFilesHidden}
            />
            <div style={{ position: 'absolute', left: 0, top: MODE_TOP }}>
              <SectionLabel family={family}>
                {message(locale, 'importMode')}
              </SectionLabel>
            </div>
            <div style={{ position: 'absolute', left: 0, top: SEGMENT_TOP }}>
              <SegmentedControl
                options={modeLabels}
                position={modeProgress}
                segmentWidth={segments.width}
                fontSize={segments.fontSize}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: TREE_TOP,
                width: TREE_WIDTH,
              }}
            >
              <SectionLabel family={family}>
                {message(locale, 'importPreview')}
              </SectionLabel>
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: TREE_TOP + 36,
                width: TREE_WIDTH,
              }}
            >
              {TREE.map((row, index) => {
                const start = T.treeStart + index * T.treeStagger
                const enter = spring({
                  frame: frame - start,
                  fps,
                  config: SPRING.settle,
                })
                return (
                  <div
                    key={row.label}
                    style={{
                      position: 'relative',
                      opacity: enter,
                      transform: `translateX(${(1 - enter) * -24}px)`,
                    }}
                  >
                    <TreeRow
                      kind={row.kind}
                      label={row.label}
                      depth={row.depth}
                      expanded={row.kind === 'folder'}
                      checkProgress={
                        row.duplicate === true
                          ? 0
                          : progressBetween(frame, start + 8, start + 20)
                      }
                    />
                    {!replaced && row.duplicate === true ? (
                      <DuplicateBadge locale={locale} />
                    ) : null}
                  </div>
                )
              })}
            </div>
            {replaced ? (
              <DeletionCard locale={locale} enter={deletionEnter} />
            ) : (
              <PreviewSummary locale={locale} enter={panelEnter} />
            )}
            <div
              style={{
                position: 'absolute',
                left: RIGHT_LEFT,
                top: BUTTON_TOP,
                opacity: progressBetween(
                  frame,
                  T.treeStart + 20,
                  T.treeStart + 36,
                ),
              }}
            >
              <Button press={press - pressRelease}>
                {replaced
                  ? message(locale, 'import_replaceConfirm')
                  : plural(locale, 'import_submit', NEW_COUNT, [
                      String(NEW_COUNT),
                    ])}
              </Button>
            </div>
            {confirmed ? (
              <div
                style={{
                  position: 'absolute',
                  left: 1132 - 640,
                  top: TOAST_TOP,
                  width: 640,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Toast enter={toastEnter}>
                  <Toast.Message>
                    {message(locale, 'safetySnapshot_title')}
                  </Toast.Message>
                  <Toast.Action>{message(locale, 'import_undo')}</Toast.Action>
                </Toast>
              </div>
            ) : null}
          </AppWindow>
          <Cursor waypoints={waypoints} clicks={[T.modeClick, T.buttonClick]} />
        </Camera>
      </div>

      {landed ? null : (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${chipOffset.x}px, ${chipOffset.y}px)`,
          }}
        >
          <MatchCut at={IMPORT_FILE_START.at} scale={chipScale}>
            <FileIcon
              format={IMPORT_FILE_START.format}
              size={IMPORT_FILE_START.size}
            />
          </MatchCut>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 100,
          width: 1760,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <KineticText
          text={captions.headline}
          locale={locale}
          maxWidth={1760}
          fontSize={92}
          delay={8}
        />
        <KineticText
          text={captions.subtitle}
          locale={locale}
          maxWidth={1500}
          fontSize={36}
          weight={500}
          family="body"
          color={theme.colors.secondary}
          delay={24}
          stagger={2}
        />
      </div>
    </AbsoluteFill>
  )
}
