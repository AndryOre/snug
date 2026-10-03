import {
  AbsoluteFill,
  Img,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import type { Locale } from '../copy'
import { message, VIDEO_COPY } from '../copy'
import { fontStackFor } from '../fonts'
import { EASE, KineticText, progressBetween, SPRING } from '../motion'
import type { SceneProps } from '../schema'
import { theme } from '../theme'

const SHOTS = ['01-export', '02-import', '03-auto-export', '04-popup'] as const
const SHOT_WIDTH = 760
const SHOT_HEIGHT = 475
const GRID_GAP = 48
const DRIFT_END = 60
const SAFE_X = 80
const CONTENT_WIDTH = 1920 - SAFE_X * 2
const LOCKUP_WIDTH = 480
const LOCKUP_HEIGHT = (LOCKUP_WIDTH * 84) / 267

const shotPath = (locale: Locale, shot: string): string =>
  staticFile(`screenshots/${locale}/${shot}.png`)

/**
 * Closing scene: localized store screenshots drift in a tilted 3D grid behind
 * the lockup, the store title and the availability line. All motion settles
 * by frame 60, so the last 45 frames hold still.
 */
export const CtaScene = ({ locale }: SceneProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const drift = progressBetween(frame, 0, DRIFT_END, EASE.settle)
  const lockupIn = spring({ frame: frame - 8, fps, config: SPRING.settle })
  const ctaIn = spring({ frame: frame - 38, fps, config: SPRING.settle })
  const body = fontStackFor(locale).body

  return (
    <AbsoluteFill
      style={{ backgroundColor: theme.colors.ground, overflow: 'hidden' }}
    >
      <AbsoluteFill style={{ perspective: 1800 }}>
        <div
          style={{
            position: 'absolute',
            left: 960 - SHOT_WIDTH - GRID_GAP / 2,
            top: 540 - SHOT_HEIGHT - GRID_GAP / 2,
            width: SHOT_WIDTH * 2 + GRID_GAP,
            display: 'grid',
            gridTemplateColumns: `repeat(2, ${SHOT_WIDTH}px)`,
            gap: GRID_GAP,
            transformStyle: 'preserve-3d',
            transform: `translate3d(${-140 + drift * 120}px, ${60 - drift * 90}px, 0) rotateX(52deg) rotateZ(-22deg) scale(1.15)`,
          }}
        >
          {SHOTS.map((shot, index) => {
            const enter = spring({
              frame: frame - index * 5,
              fps,
              config: SPRING.gentle,
            })
            return (
              <Img
                key={shot}
                src={shotPath(locale, shot)}
                style={{
                  width: SHOT_WIDTH,
                  height: SHOT_HEIGHT,
                  borderRadius: 18,
                  border: `1px solid ${theme.ui.borderStrong}`,
                  boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
                  opacity: enter * 0.9,
                  transform: `translateZ(${(1 - enter) * -300}px)`,
                }}
              />
            )
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 1100px 620px at 50% 50%, rgba(23,18,10,0.92), rgba(23,18,10,0.7) 60%, rgba(23,18,10,0.42))',
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 40,
          padding: '100px 80px',
        }}
      >
        <Img
          src={staticFile('brand/lockup-horizontal.svg')}
          style={{
            width: LOCKUP_WIDTH,
            height: LOCKUP_HEIGHT,
            opacity: lockupIn,
            transform: `translateY(${(1 - lockupIn) * 24}px) scale(${0.92 + lockupIn * 0.08})`,
          }}
        />
        <KineticText
          text={message(locale, 'extensionManifestName')}
          locale={locale}
          maxWidth={1400}
          fontSize={64}
          delay={20}
        />
        <div
          style={{
            fontFamily: body,
            fontSize: 44,
            fontWeight: 500,
            color: theme.colors.accent,
            opacity: ctaIn,
            transform: `translateY(${(1 - ctaIn) * 20}px)`,
            maxWidth: CONTENT_WIDTH,
            textAlign: 'center',
          }}
        >
          {VIDEO_COPY[locale].cta}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
