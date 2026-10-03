import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { message, VIDEO_COPY } from '../copy'
import { Camera, EASE, KineticText, progressBetween, SPRING } from '../motion'
import type { SceneProps } from '../schema'
import { theme } from '../theme'
import { BlobMark } from '../ui'

const SAFE_X = 80
const CONTENT_WIDTH = 1920 - SAFE_X * 2
const HEADLINE_WIDTH = 1480
const BLOB_SIZE = 260
const BLOB_CENTER = { x: 960, y: 330 }
const HANDOFF_START = 93
const HANDOFF_END = 117
const HANDOFF_TARGET = { x: 250, y: 170, scale: 0.34 }
const HEADLINE_SIZE = 112
const SUPPORT_SIZE = 46

const CAMERA_KEYFRAMES = [
  { frame: 0, x: 960, y: 540, zoom: 1 },
  { frame: 1, x: 960, y: 540, zoom: 1.07 },
] as const

/**
 * Opening scene: the brand blob springs in, the hook line and the store
 * tagline land word by word, then the blob shrinks toward the top-left corner
 * where the Export scene's window picks it up.
 */
export const HookScene = ({ locale }: SceneProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: SPRING.snappy })
  const tilt = interpolate(enter, [0, 1], [-28, 0])
  const handoff = progressBetween(
    frame,
    HANDOFF_START,
    HANDOFF_END,
    EASE.standard,
  )
  const glow = 0.35 + 0.65 * progressBetween(frame, 0, 40, EASE.settle)
  const textOut = 1 - progressBetween(frame, HANDOFF_START, HANDOFF_START + 8)
  const blobScale =
    interpolate(enter, [0, 1], [0.15, 1]) *
    (1 - handoff * (1 - HANDOFF_TARGET.scale))
  const blobX = BLOB_CENTER.x + (HANDOFF_TARGET.x - BLOB_CENTER.x) * handoff
  const blobY = BLOB_CENTER.y + (HANDOFF_TARGET.y - BLOB_CENTER.y) * handoff

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.ground }}>
      <AbsoluteFill
        style={{
          opacity: glow,
          background:
            'radial-gradient(ellipse 900px 640px at 50% 34%, rgba(255,162,48,0.34), rgba(255,162,48,0.08) 55%, transparent 80%)',
        }}
      />
      <Camera keyframes={CAMERA_KEYFRAMES} moveFrames={110}>
        <div
          style={{
            position: 'absolute',
            left: blobX - BLOB_SIZE / 2,
            top: blobY - BLOB_SIZE / 2,
            opacity: interpolate(enter, [0, 0.3], [0, 1], {
              extrapolateRight: 'clamp',
            }),
            transform: `scale(${blobScale}) rotate(${tilt}deg)`,
          }}
        >
          <BlobMark size={BLOB_SIZE} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: SAFE_X,
            top: 540,
            width: CONTENT_WIDTH,
            opacity: textOut,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 36,
          }}
        >
          <KineticText
            text={VIDEO_COPY[locale].hook}
            locale={locale}
            maxWidth={HEADLINE_WIDTH}
            fontSize={HEADLINE_SIZE}
            delay={14}
          />
          <KineticText
            text={message(locale, 'welcomeSubtitle')}
            locale={locale}
            maxWidth={1500}
            fontSize={SUPPORT_SIZE}
            weight={400}
            family="body"
            color={theme.colors.secondary}
            delay={34}
            stagger={2}
          />
        </div>
      </Camera>
    </AbsoluteFill>
  )
}
