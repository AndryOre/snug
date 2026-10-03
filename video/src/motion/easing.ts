import { Easing, interpolate, type SpringConfig } from 'remotion'

/**
 * Named bezier presets. `standard` for travel, `snappy` for UI that reacts,
 * `settle` for long gentle arrivals.
 */
export const EASE = {
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  snappy: Easing.bezier(0.2, 0.9, 0.1, 1),
  settle: Easing.bezier(0.16, 1, 0.3, 1),
} as const

/**
 * Spring configs. `settle` has no overshoot (damping 200), the default for
 * entrances; `snappy` overshoots slightly; `gentle` is slow and soft.
 */
export const SPRING = {
  settle: { damping: 200 },
  snappy: { damping: 20, stiffness: 200 },
  gentle: { damping: 30, stiffness: 90 },
} as const satisfies Record<string, Partial<SpringConfig>>

/**
 * Clamped 0..1 progress of `frame` between two frames, optionally eased.
 */
export const progressBetween = (
  frame: number,
  from: number,
  to: number,
  easing: (input: number) => number = EASE.standard,
): number =>
  interpolate(frame, [from, to], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
