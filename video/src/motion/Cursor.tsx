import { interpolate, useCurrentFrame } from 'remotion'
import { EASE, progressBetween } from './easing'

export type Waypoint = {
  /** Frame the cursor arrives at this point. */
  frame: number
  x: number
  y: number
}

const RIPPLE_FRAMES = 16
const PRESS_FRAMES = 6

/**
 * Cursor position at a frame: eased travel between waypoints, held before the
 * first and after the last.
 */
export const cursorPositionAt = (
  waypoints: readonly Waypoint[],
  frame: number,
): { x: number; y: number } => {
  const first = waypoints[0]
  if (!first) return { x: 0, y: 0 }
  let index = 0
  waypoints.forEach((waypoint, position) => {
    if (waypoint.frame <= frame) index = position
  })
  const from = waypoints[index] ?? first
  const to = waypoints[index + 1]
  if (!to) return { x: from.x, y: from.y }
  const amount = progressBetween(frame, from.frame, to.frame, EASE.standard)
  return {
    x: interpolate(amount, [0, 1], [from.x, to.x]),
    y: interpolate(amount, [0, 1], [from.y, to.y]),
  }
}

/**
 * How many of the click frames have happened by `frame`. Scenes use it (or
 * `clicks.includes`) to flip UI state in sync with the cursor.
 */
export const clicksBy = (clicks: readonly number[], frame: number): number =>
  clicks.filter((click) => click <= frame).length

export type CursorProps = {
  waypoints: readonly Waypoint[]
  /** Frames at which a click lands. */
  clicks?: readonly number[]
  /** Arrow scale, 1 is 20x28 px. Default 1.4. */
  scale?: number
}

/**
 * Arrow cursor on a waypoint path with a ripple per click. Absolutely
 * positioned in its parent's coordinates; render it inside the Camera layer.
 */
export const Cursor = ({
  waypoints,
  clicks = [],
  scale = 1.4,
}: CursorProps) => {
  const frame = useCurrentFrame()
  const position = cursorPositionAt(waypoints, frame)
  const pressing = clicks.some(
    (click) => frame >= click && frame < click + PRESS_FRAMES,
  )
  return (
    <>
      {clicks.map((click) => {
        const age = frame - click
        if (age < 0 || age > RIPPLE_FRAMES) return null
        const at = cursorPositionAt(waypoints, click)
        const growth = progressBetween(age, 0, RIPPLE_FRAMES, EASE.settle)
        const size = 12 + growth * 64
        return (
          <div
            key={click}
            style={{
              position: 'absolute',
              left: at.x - size / 2,
              top: at.y - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              border: '3px solid rgba(255, 162, 48, 0.9)',
              opacity: 1 - growth,
            }}
          />
        )
      })}
      <svg
        width={20 * scale}
        height={28 * scale}
        viewBox="0 0 20 28"
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          transformOrigin: '0 0',
          transform: `scale(${pressing ? 0.88 : 1})`,
          filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.5))',
        }}
      >
        <path
          d="M1.5 1.5 L1.5 22 L7 17 L11 26 L14.5 24.5 L10.5 15.8 L18 15.8 Z"
          fill="#fff"
          stroke="#17120A"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
    </>
  )
}
