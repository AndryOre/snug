import { z } from 'zod'
import { LOCALES, type Locale } from './copy'

export const DEFAULT_MUSIC = 'music/track.mp3'

export const SFX_SETS = ['epidemic', 'kenney'] as const
export type SfxSet = (typeof SFX_SETS)[number]

export const SFX_PROBE_FILE: Record<SfxSet, string> = {
  epidemic: 'sfx/epidemic/click.wav',
  kenney: 'sfx/click.ogg',
}

export const sfxPath = (set: SfxSet, name: string): string =>
  set === 'epidemic' ? `sfx/epidemic/${name}.wav` : `sfx/${name}.ogg`

export const promoSchema = z.object({
  locale: z.enum(LOCALES),
  music: z.string().nullable().default(DEFAULT_MUSIC),
  sfxSet: z.enum(SFX_SETS).default('epidemic'),
})

export type PromoProps = z.infer<typeof promoSchema>

export type SceneProps = { locale: Locale }
