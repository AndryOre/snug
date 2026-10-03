import { staticFile, type CalculateMetadataFunction } from 'remotion'
import { SFX_PROBE_FILE, type PromoProps } from '../schema'

const warnedAbout = new Set<string>()

const fileExists = async (file: string): Promise<boolean> => {
  try {
    const response = await fetch(staticFile(file), { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

const warnOnce = (key: string, message: string): void => {
  if (warnedAbout.has(key)) return
  warnedAbout.add(key)
  console.warn(message)
}

/**
 * Drops the `music` prop when the track file is absent so the render stays
 * silent instead of failing, and falls back from the local-only Epidemic
 * sound effects to the committed Kenney set when they are not downloaded.
 * Each fallback warns once.
 */
export const calculatePromoMetadata: CalculateMetadataFunction<
  PromoProps
> = async ({ props }) => {
  let { music, sfxSet } = props
  if (music && !(await fileExists(music))) {
    warnOnce(
      music,
      `[promo] No music at public/${music}; rendering without a music bed.`,
    )
    music = null
  }
  if (sfxSet === 'epidemic' && !(await fileExists(SFX_PROBE_FILE.epidemic))) {
    warnOnce(
      'sfx-epidemic',
      '[promo] No Epidemic sound effects in public/sfx/epidemic; using the Kenney set.',
    )
    sfxSet = 'kenney'
  }
  return { props: { ...props, music, sfxSet } }
}
