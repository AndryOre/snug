import type { ReactNode } from 'react'
import { spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { SPRING } from './easing'

export type CameraKeyframe = {
  /** Frame at which the move to this keyframe starts. */
  frame: number
  /** Point of the layer, in layer coordinates, that lands on the anchor. */
  x: number
  y: number
  zoom: number
}

export type CameraState = { x: number; y: number; zoom: number }

const mix = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount

/**
 * Camera state at a frame: holds each keyframe, then spring-moves to the next
 * over `moveFrames`. Long holds and short moves keep text from shimmering.
 */
export const cameraStateAt = (
  keyframes: readonly CameraKeyframe[],
  frame: number,
  fps: number,
  moveFrames: number,
): CameraState => {
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame)
  const first = sorted[0]
  if (!first) return { x: 0, y: 0, zoom: 1 }
  let index = 0
  sorted.forEach((keyframe, position) => {
    if (keyframe.frame <= frame) index = position
  })
  const current = sorted[index] ?? first
  const previous = sorted[index - 1]
  if (!previous) return current
  const amount = spring({
    frame: frame - current.frame,
    fps,
    config: SPRING.settle,
    durationInFrames: moveFrames,
  })
  return {
    x: mix(previous.x, current.x, amount),
    y: mix(previous.y, current.y, amount),
    zoom: mix(previous.zoom, current.zoom, amount),
  }
}

export type CameraProps = {
  keyframes: readonly CameraKeyframe[]
  /** Frames a move takes. Default 24. */
  moveFrames?: number
  /** Screen point (viewport pixels) the focus lands on. Default: centre. */
  anchor?: { x: number; y: number }
  /** Viewport size. Default: the composition size. */
  width?: number
  height?: number
  /** Size of the transformed layer. Default: the viewport size. */
  layer?: { width: number; height: number }
  children: ReactNode
}

/**
 * Virtual camera: clips to its viewport and transforms a layer so the
 * keyframe's focus point sits on the anchor at the keyframe's zoom.
 */
export const Camera = ({
  keyframes,
  moveFrames = 24,
  anchor,
  width,
  height,
  layer,
  children,
}: CameraProps) => {
  const frame = useCurrentFrame()
  const config = useVideoConfig()
  const viewportWidth = width ?? config.width
  const viewportHeight = height ?? config.height
  const anchorX = anchor?.x ?? viewportWidth / 2
  const anchorY = anchor?.y ?? viewportHeight / 2
  const state = cameraStateAt(keyframes, frame, config.fps, moveFrames)
  return (
    <div
      style={{
        position: 'relative',
        width: viewportWidth,
        height: viewportHeight,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: layer?.width ?? viewportWidth,
          height: layer?.height ?? viewportHeight,
          transformOrigin: '0 0',
          transform: `translate(${anchorX - state.x * state.zoom}px, ${anchorY - state.y * state.zoom}px) scale(${state.zoom})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
