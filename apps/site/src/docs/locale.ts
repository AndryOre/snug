import { languageTag, type Locale, LOCALES } from '../i18n/locales'

/**
 * Maps the BCP 47 tag Starlight reports for a route (`pt-BR`) back to the
 * site's locale code (`pt_BR`).
 * @param tag - The `lang` of the current Starlight route.
 * @returns The matching locale.
 * @throws {Error} When the tag matches no supported locale.
 */
export function resolveDocumentationLocale(tag: string): Locale {
  const locale = LOCALES.find((candidate) => languageTag(candidate) === tag)
  if (!locale) throw new Error(`Unknown documentation locale "${tag}"`)
  return locale
}
