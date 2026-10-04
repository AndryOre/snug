import { interpolate, useCurrentFrame } from 'remotion'

import { theme } from '../theme'

export type BlobMarkProps = {
  size?: number
  /** Frames for one full morph cycle. Default 90. */
  period?: number
}

const parseRadii = (value: string): number[] =>
  value.match(/\d+/g)?.map(Number) ?? []

const FROM = parseRadii(theme.blobRadius)
const TO = parseRadii(theme.blobRadiusAlt)

/**
 * Brand mark: amber gradient blob whose border-radius morphs on a loop, with
 * the bookmark glyph from `docs/brand/logo/mark.svg` cut out in ground colour.
 */
export const BlobMark = ({ size = 120, period = 90 }: BlobMarkProps) => {
  const frame = useCurrentFrame()
  const phase = (1 - Math.cos((frame / period) * Math.PI * 2)) / 2
  const radii = FROM.map((from, index) =>
    interpolate(phase, [0, 1], [from, TO[index] ?? from], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  )
  const [a = 50, b = 50, c = 50, d = 50, e = 50, f = 50, g = 50, h = 50] = radii
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: `${a}% ${b}% ${c}% ${d}% / ${e}% ${f}% ${g}% ${h}%`,
        background: theme.markGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="14 8 56 70">
        <path
          d="M20 8 L64 8 Q70 8 70 14 L70 68 Q70 78 61 72 L42 59 L23 72 Q14 78 14 68 L14 14 Q14 8 20 8 Z"
          fill={theme.colors.ground}
        />
      </svg>
    </div>
  )
}
