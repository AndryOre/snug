import { EXPORT_AUDIO_FRAMES } from '../scenes/export'
import { IMPORT_AUDIO_FRAMES } from '../scenes/import'
import { SCENE_RANGES } from '../timing'

export type SfxName = 'click' | 'whoosh' | 'pop' | 'tick' | 'chime' | 'thud'

export type SfxCue = {
  /** Frame in the final cut. */
  frame: number
  sfx: SfxName
  /** 0 to 1, kept low so the music stays in front. */
  volume: number
}

/**
 * Gains for SFX files peak-normalized to -3 dBFS (see README), so each value
 * is its own peak level relative to full scale.
 */
const VOLUME = {
  click: 0.3,
  whoosh: 0.35,
  pop: 0.25,
  tick: 0.2,
  chime: 0.3,
  thud: 0.3,
} as const satisfies Record<SfxName, number>

const WHOOSH_PEAK_FRAMES = 12

const cue = (frame: number, sfx: SfxName): SfxCue => ({
  frame,
  sfx,
  volume: VOLUME[sfx],
})

const atScene = (
  scene: keyof typeof SCENE_RANGES,
  localFrames: readonly number[],
  sfx: SfxName,
): SfxCue[] =>
  localFrames.map((local) => cue(SCENE_RANGES[scene].from + local, sfx))

const TRANSITION_WHOOSHES: SfxCue[] = [
  SCENE_RANGES.export,
  SCENE_RANGES.import,
  SCENE_RANGES.autoExport,
  SCENE_RANGES.local,
  SCENE_RANGES.cta,
].map((range) => cue(range.from - WHOOSH_PEAK_FRAMES, 'whoosh'))

/** Every sound effect of the promo, in final-cut frames. */
export const SFX_CUES: readonly SfxCue[] = [
  ...TRANSITION_WHOOSHES,
  ...atScene('export', EXPORT_AUDIO_FRAMES.clicks, 'click'),
  ...atScene('export', EXPORT_AUDIO_FRAMES.cascadeTicks, 'tick'),
  ...atScene('export', EXPORT_AUDIO_FRAMES.chipPops, 'pop'),
  ...atScene('export', [EXPORT_AUDIO_FRAMES.fileLanding], 'thud'),
  ...atScene('import', IMPORT_AUDIO_FRAMES.clicks, 'click'),
  ...atScene('import', [IMPORT_AUDIO_FRAMES.toast], 'chime'),
  cue(SCENE_RANGES.cta.from + 14, 'chime'),
].sort((a, b) => a.frame - b.frame)
