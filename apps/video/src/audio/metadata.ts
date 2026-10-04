import { type CalculateMetadataFunction, staticFile } from 'remotion'

import { type PromoProps, SFX_PROBE_FILE } from '../schema'

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
 * Drops the `music` prop and turns `sfx` off when the local-only Epidemic
 * files are absent, so a clean clone renders silent instead of failing. Each
 * missing layer warns once.
 */
export const calculatePromoMetadata: CalculateMetadataFunction<
  PromoProps
> = async ({ props }) => {
  let { music, sfx } = props
  if (music && !(await fileExists(music))) {
    warnOnce(
      music,
      `[promo] No music at public/${music}; rendering without a music bed.`,
    )
    music = null
  }
  if (sfx && !(await fileExists(SFX_PROBE_FILE))) {
    warnOnce(
      'sfx',
      '[promo] No sound effects in public/sfx/epidemic; rendering without them.',
    )
    sfx = false
  }
  return { props: { ...props, music, sfx } }
}
