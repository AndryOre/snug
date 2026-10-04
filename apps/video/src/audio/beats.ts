import { FPS, SCENE_RANGES, TOTAL_FRAMES } from '../timing'

/**
 * Tempo of the default track (Comes Back Around, Mindme). At 120 BPM a beat is
 * exactly 15 frames, so every storyboard cut lands on a beat. Update this
 * together with `FIRST_BEAT_FRAME` when you swap tracks.
 */
export const BPM = 120

/**
 * Video frame at which the first beat lands. The Epidemic edit starts on a
 * bar, so the track plays from frame 0 and the grid starts there.
 */
export const FIRST_BEAT_FRAME = 0

/** Frames per beat, fractional on purpose: do not round before summing. */
export const FRAMES_PER_BEAT = (60 / BPM) * FPS

/** Frame of beat `index` (0 is the first beat), rounded to a whole frame. */
export const beatFrame = (index: number): number =>
  Math.round(FIRST_BEAT_FRAME + index * FRAMES_PER_BEAT)

/** Frames of every beat inside the video, in order. */
export const BEAT_FRAMES: readonly number[] = Array.from(
  { length: Math.ceil((TOTAL_FRAMES - FIRST_BEAT_FRAME) / FRAMES_PER_BEAT) },
  (_, index) => beatFrame(index),
)

/**
 * Frame of the nearest half-beat to `frame`. Scene cuts land on half-beats
 * because the storyboard lengths are fixed by the brief.
 */
export const nearestHalfBeat = (frame: number): number => {
  const half = FRAMES_PER_BEAT / 2
  return Math.round(
    FIRST_BEAT_FRAME + Math.round((frame - FIRST_BEAT_FRAME) / half) * half,
  )
}

/**
 * Signed distance in frames from each scene cut to its nearest half-beat.
 */
export const cutAlignment = (): Record<string, number> =>
  Object.fromEntries(
    Object.entries(SCENE_RANGES)
      .filter(([, range]) => range.from > 0)
      .map(([id, range]) => [id, nearestHalfBeat(range.from) - range.from]),
  )
