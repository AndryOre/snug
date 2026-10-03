import { linearTiming, TransitionSeries } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { Soundtrack } from './audio/Soundtrack'
import { FontGate } from './FontGate'
import type { PromoProps } from './schema'
import { AutoExportScene } from './scenes/auto-export'
import { CtaScene } from './scenes/cta'
import { ExportScene } from './scenes/export'
import { HookScene } from './scenes/hook'
import { ImportScene } from './scenes/import'
import { LocalScene } from './scenes/local'
import { TRANSITION_FRAMES } from './timing'

const transition = (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
  />
)

export const Promo = ({ locale, music, sfxSet }: PromoProps) => (
  <FontGate locale={locale}>
    <Soundtrack music={music} sfxSet={sfxSet} />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={117}>
        <HookScene locale={locale} />
      </TransitionSeries.Sequence>
      {transition}
      <TransitionSeries.Sequence durationInFrames={237}>
        <ExportScene locale={locale} />
      </TransitionSeries.Sequence>
      {transition}
      <TransitionSeries.Sequence durationInFrames={222}>
        <ImportScene locale={locale} />
      </TransitionSeries.Sequence>
      {transition}
      <TransitionSeries.Sequence durationInFrames={177}>
        <AutoExportScene locale={locale} />
      </TransitionSeries.Sequence>
      {transition}
      <TransitionSeries.Sequence durationInFrames={102}>
        <LocalScene locale={locale} />
      </TransitionSeries.Sequence>
      {transition}
      <TransitionSeries.Sequence durationInFrames={105}>
        <CtaScene locale={locale} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </FontGate>
)
