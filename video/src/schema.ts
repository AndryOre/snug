import { z } from 'zod'
import { LOCALES, type Locale } from './copy'

export const promoSchema = z.object({
  locale: z.enum(LOCALES),
})

export type PromoProps = z.infer<typeof promoSchema>

export type SceneProps = { locale: Locale }
