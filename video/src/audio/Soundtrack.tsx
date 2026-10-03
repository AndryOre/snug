import { Audio } from '@remotion/media'
import { interpolate, Sequence, staticFile, useVideoConfig } from 'remotion'
import { sfxPath, type SfxSet } from '../schema'
import { TOTAL_FRAMES } from '../timing'
import { FIRST_BEAT_FRAME } from './beats'
import { SFX_CUES } from './cues'

const FADE_IN_SECONDS = 1
const FADE_OUT_SECONDS = 2
const SFX_FRAMES = 30
const MUSIC_PEAK = 0.9
const TRACK_FIRST_BEAT_FRAME = 1

/**
 * Music gain at a final-cut frame: linear fade in over `fadeInFrames` from
 * frame 0 and linear fade out ending at `totalFrames`.
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
 * Music bed (1 s fade in, 2 s fade out, delayed so the track's beat grid
 * matches `beats.ts`) plus the low-volume SFX layer. With a null `music` the
 * video is SFX only.
 */
export const Soundtrack = ({
  music,
  sfxSet,
}: {
  music: string | null
  sfxSet: SfxSet
}) => {
  const { fps } = useVideoConfig()
  const fadeIn = FADE_IN_SECONDS * fps
  const fadeOut = FADE_OUT_SECONDS * fps
  const delay = FIRST_BEAT_FRAME - TRACK_FIRST_BEAT_FRAME
  return (
    <>
      {music ? (
        <Sequence
          from={delay}
          durationInFrames={TOTAL_FRAMES - delay}
          layout="none"
        >
          <Audio
            src={staticFile(music)}
            volume={(frame) =>
              musicVolumeAt(frame + delay, fadeIn, fadeOut, TOTAL_FRAMES)
            }
          />
        </Sequence>
      ) : null}
      {SFX_CUES.map((cue) => (
        <Sequence
          key={`${cue.sfx}-${cue.frame}`}
          from={cue.frame}
          durationInFrames={SFX_FRAMES}
          layout="none"
        >
          <Audio
            src={staticFile(sfxPath(sfxSet, cue.sfx))}
            volume={cue.volume}
          />
        </Sequence>
      ))}
    </>
  )
}
