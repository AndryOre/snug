import { Audio } from '@remotion/media'
import { interpolate, Sequence, staticFile, useVideoConfig } from 'remotion'
import { sfxPath } from '../schema'
import { TOTAL_FRAMES } from '../timing'
import { SFX_CUES } from './cues'

const FADE_IN_SECONDS = 1
const FADE_OUT_SECONDS = 2
const SFX_FRAMES = 30
const MUSIC_PEAK = 0.6

/**
 * Music gain at a frame: linear fade in over `fadeInFrames` from frame 0 and
 * linear fade out ending at `totalFrames`. The peak trims the loud master
 * (about -9.5 LUFS) to roughly -14 LUFS, YouTube's normalization target.
 */
export const musicVolumeAt = (
  frame: number,
  fadeInFrames: number,
  fadeOutFrames: number,
  totalFrames: number,
): number =>
  interpolate(
    frame,
    [0, fadeInFrames, totalFrames - fadeOutFrames, totalFrames],
    [0, MUSIC_PEAK, MUSIC_PEAK, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

/**
 * Music bed (1 s fade in, 2 s fade out, beat 0 on frame 0) plus the
 * low-volume SFX layer. Either layer is skipped when its prop says so.
 */
export const Soundtrack = ({
  music,
  sfx,
}: {
  music: string | null
  sfx: boolean
}) => {
  const { fps } = useVideoConfig()
  const fadeIn = FADE_IN_SECONDS * fps
  const fadeOut = FADE_OUT_SECONDS * fps
  return (
    <>
      {music ? (
        <Audio
          src={staticFile(music)}
          volume={(frame) =>
            musicVolumeAt(frame, fadeIn, fadeOut, TOTAL_FRAMES)
          }
        />
      ) : null}
      {sfx
        ? SFX_CUES.map((cue) => (
            <Sequence
              key={`${cue.sfx}-${cue.frame}`}
              from={cue.frame}
              durationInFrames={SFX_FRAMES}
              layout="none"
            >
              <Audio src={staticFile(sfxPath(cue.sfx))} volume={cue.volume} />
            </Sequence>
          ))
        : null}
    </>
  )
}
