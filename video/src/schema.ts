import { z } from 'zod'
import { LOCALES, type Locale } from './copy'

export const DEFAULT_MUSIC = 'music/track.mp3'

export const promoSchema = z.object({
  locale: z.enum(LOCALES),
  music: z.string().nullable().default(DEFAULT_MUSIC),
})

export type PromoProps = z.infer<typeof promoSchema>

export type SceneProps = { locale: Locale }
