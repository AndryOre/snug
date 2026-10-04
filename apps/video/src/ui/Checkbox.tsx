import { interpolate } from 'remotion'

import { theme } from '../theme'

export type CheckboxProps = {
  /** 0 is unchecked, 1 is checked; animate it with `progressBetween`. */
  progress?: number
  size?: number
}

const CHECK_PATH_LENGTH = 22

/**
 * Checkbox whose fill and tick draw in as `progress` goes 0 to 1.
 */
export const Checkbox = ({ progress = 0, size = 26 }: CheckboxProps) => {
  const fill = interpolate(progress, [0, 0.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tick = interpolate(progress, [0.3, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: size * 0.22,
        border: `2px solid ${fill > 0.5 ? theme.colors.accent : theme.ui.borderStrong}`,
        background: theme.colors.accent,
        backgroundClip: 'padding-box',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -2,
          borderRadius: size * 0.22,
          background: theme.ui.surface,
          opacity: 1 - fill,
          border: `2px solid ${theme.ui.borderStrong}`,
        }}
      />
      <svg
        viewBox="0 0 24 24"
        width={size - 4}
        height={size - 4}
        fill="none"
        stroke={theme.ui.onAccent}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          strokeDasharray={CHECK_PATH_LENGTH}
          strokeDashoffset={CHECK_PATH_LENGTH * (1 - tick)}
        />
      </svg>
    </div>
  )
}
