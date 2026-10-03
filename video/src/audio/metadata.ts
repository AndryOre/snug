import { staticFile, type CalculateMetadataFunction } from 'remotion'
import type { PromoProps } from '../schema'

const warnedAbout = new Set<string>()

const trackExists = async (music: string): Promise<boolean> => {
  try {
    const response = await fetch(staticFile(music), { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Drops the `music` prop when the track file is absent so the render stays
 * silent instead of failing, and warns once per missing path.
 */
export const calculatePromoMetadata: CalculateMetadataFunction<
  PromoProps
> = async ({ props }) => {
  if (!props.music || (await trackExists(props.music))) return { props }
  if (!warnedAbout.has(props.music)) {
    warnedAbout.add(props.music)
    console.warn(
      `[promo] No music at public/${props.music}; rendering without a music bed.`,
    )
  }
  return { props: { ...props, music: null } }
}
