export const FPS = 30
export const WIDTH = 1920
export const HEIGHT = 1080
export const TOTAL_FRAMES = 900
export const TRANSITION_FRAMES = 12

/**
 * Visible frame range of each scene in the final cut (start inclusive, end
 * exclusive). Each `TransitionSeries.Sequence` is its range plus the overlap
 * of the transition that follows it.
 */
export const SCENE_RANGES = {
  hook: { from: 0, to: 105 },
  export: { from: 105, to: 330 },
  import: { from: 330, to: 540 },
  autoExport: { from: 540, to: 705 },
  local: { from: 705, to: 795 },
  cta: { from: 795, to: 900 },
} as const

export type SceneId = keyof typeof SCENE_RANGES

export const sceneLength = (id: SceneId): number =>
  SCENE_RANGES[id].to - SCENE_RANGES[id].from
