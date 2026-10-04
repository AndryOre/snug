import { z } from 'zod'

import { type Locale, LOCALES } from './copy'

export const DEFAULT_MUSIC = 'music/track.wav'

export const SFX_PROBE_FILE = 'sfx/epidemic/click.wav'

export const sfxPath = (name: string): string => `sfx/epidemic/${name}.wav`

export const promoSchema = z.object({
  locale: z.enum(LOCALES),
  music: z.string().nullable().default(DEFAULT_MUSIC),
  sfx: z.boolean().default(true),
})

export type PromoProps = z.infer<typeof promoSchema>

export type SceneProps = { locale: Locale }
