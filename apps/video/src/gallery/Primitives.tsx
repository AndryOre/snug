import type { ReactNode } from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'

import { message } from '../copy'
import { VIDEO_COPY } from '../copy'
import { fontStackFor } from '../fonts'
import {
  Camera,
  type CameraKeyframe,
  clicksBy,
  Cursor,
  EASE,
  KineticText,
  MatchCut,
  progressBetween,
  type Waypoint,
} from '../motion'
import type { SceneProps } from '../schema'
import { theme } from '../theme'
import {
  AppWindow,
  BlobMark,
  Button,
  Checkbox,
  Chip,
  type ExportFormat,
  FileIcon,
  navItemCenter,
  SegmentedControl,
  Toast,
  TreeRow,
} from '../ui'

const FORMATS: ExportFormat[] = ['html', 'json', 'csv', 'md', 'opml', 'xbel']

const CAMERA: CameraKeyframe[] = [
  { frame: 0, x: 760, y: 430, zoom: 0.59 },
  { frame: 40, x: 640, y: 300, zoom: 1.1 },
  { frame: 100, x: 760, y: 430, zoom: 0.59 },
]

const CLICKS = [80]

const Section = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div
      style={{
        fontFamily: "'Geist Mono', ui-monospace, monospace",
        fontSize: 15,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: theme.colors.muted,
      }}
    >
      {title}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {children}
    </div>
  </div>
)

/**
 * Studio gallery: every motion and UI primitive in its states, for eyeballing
 * localized text fit. Not part of the shipped video.
 */
export const PrimitivesGallery = ({ locale }: SceneProps) => {
  const frame = useCurrentFrame()
  const rowCenter = { x: 420, y: 182 }
  const waypoints: Waypoint[] = [
    { frame: 0, x: 1300, y: 700 },
    {
      frame: 40,
      x: navItemCenter('export').x,
      y: navItemCenter('export').y,
    },
    { frame: 80, ...rowCenter },
  ]
  const checked = clicksBy(CLICKS, frame) > 0
  const checkProgress = checked
    ? progressBetween(frame, CLICKS[0] ?? 0, (CLICKS[0] ?? 0) + 12)
    : 0
  const enter = progressBetween(frame, 20, 50, EASE.settle)
  const segment = progressBetween(frame, 40, 70, EASE.snappy)
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.ground,
        color: theme.colors.text,
        fontFamily: fontStackFor(locale).body,
        padding: 48,
        flexDirection: 'row',
        gap: 48,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Camera
          keyframes={CAMERA}
          width={900}
          height={520}
          layer={{ width: 1520, height: 860 }}
        >
          <AppWindow
            locale={locale}
            active="export"
            hover={{ export: progressBetween(frame, 40, 52) }}
          >
            <TreeRow
              kind="folder"
              depth={0}
              expanded
              checkProgress={checkProgress}
              highlight={checked ? 0.6 : 0}
              label={message(locale, 'bookmarksBar')}
            />
            <TreeRow kind="bookmark" depth={1} label="MDN Web Docs" />
            <TreeRow
              kind="folder"
              depth={1}
              label={message(locale, 'importedBookmarks')}
            />
          </AppWindow>
          <Cursor waypoints={waypoints} clicks={CLICKS} />
        </Camera>
        <Section title="Toast">
          <Toast enter={enter}>
            <Toast.Message>
              {message(locale, 'safetySnapshot_title')}
            </Toast.Message>
            <Toast.Action>{message(locale, 'import_undo')}</Toast.Action>
          </Toast>
        </Section>
        <Section title="Button">
          <Button>{message(locale, 'exportNow')}</Button>
          <Button variant="outline">{message(locale, 'cancel')}</Button>
          <Button variant="ghost">
            {message(locale, 'import_changeFile')}
          </Button>
        </Section>
        <Section title="SegmentedControl">
          <SegmentedControl
            segmentWidth={290}
            position={segment * 1}
            options={[
              message(locale, 'importModeRestoreMerge'),
              message(locale, 'importModeRestoreReplace'),
              message(locale, 'importModeFolder'),
            ]}
          />
        </Section>
      </div>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 26, flex: 1 }}
      >
        <Section title="BlobMark / KineticText">
          <BlobMark size={110} />
          <KineticText
            text={VIDEO_COPY[locale].hook}
            locale={locale}
            maxWidth={640}
            fontSize={56}
            align="left"
          />
        </Section>
        <Section title="Chip">
          {FORMATS.map((format, index) => (
            <Chip
              key={format}
              format={format}
              tone={index === 0 ? 'active' : 'default'}
            />
          ))}
        </Section>
        <Section title="FileIcon / MatchCut">
          {FORMATS.map((format) => (
            <FileIcon key={format} format={format} size={72} />
          ))}
          <div style={{ position: 'relative', width: 90, height: 100 }}>
            <MatchCut at={{ x: 45, y: 50 }} scale={0.8}>
              <FileIcon format="html" size={72} />
            </MatchCut>
          </div>
        </Section>
        <Section title="Checkbox 0 / 0.5 / 1">
          <Checkbox progress={0} />
          <Checkbox progress={0.5} />
          <Checkbox progress={1} />
        </Section>
        <Section title="TreeRow">
          <div style={{ width: 840 }}>
            <TreeRow
              kind="folder"
              label={message(locale, 'bookmarksBar')}
              expanded
              checkProgress={1}
            />
            <TreeRow
              kind="bookmark"
              depth={1}
              label="MDN Web Docs"
              checkProgress={1}
            />
            <TreeRow
              kind="folder"
              depth={1}
              label={message(locale, 'importedBookmarks')}
              checkProgress={0}
              highlight={1}
            />
            <TreeRow
              kind="bookmark"
              depth={2}
              label="github.com"
              checkProgress={0}
            />
          </div>
        </Section>
      </div>
    </AbsoluteFill>
  )
}
