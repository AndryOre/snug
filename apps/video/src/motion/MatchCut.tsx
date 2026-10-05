import type { ReactNode } from 'react'

/**
 * Named screen positions shared by the end of one scene and the start of the
 * next, so a match cut lands pixel-exact.
 */
export const MATCH_POINTS = {
  fileChip: { x: 960, y: 540 },
  center: { x: 960, y: 540 },
} as const

export type MatchPoint = { x: number; y: number }

export type MatchCutProps = {
  /**
   * Screen position (1920x1080 space) of the element's centre.
   */
  at: MatchPoint
  scale?: number
  children: ReactNode
}

/**
 * Pins its children's centre to a fixed screen position. Render the same
 * element with the same `at` and `scale` at the end of scene A and the start
 * of scene B, outside any Camera, and the cut is invisible.
 */
export const MatchCut = ({ at, scale = 1, children }: MatchCutProps) => (
  <div
    style={{
      position: 'absolute',
      left: at.x,
      top: at.y,
      transform: `translate(-50%, -50%) scale(${scale})`,
    }}
  >
    {children}
  </div>
)
