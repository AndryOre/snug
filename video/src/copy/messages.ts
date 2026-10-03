import de from '../../../locales/de.json'
import en from '../../../locales/en.json'
import es from '../../../locales/es.json'
import fr from '../../../locales/fr.json'
import it from '../../../locales/it.json'
import ja from '../../../locales/ja.json'
import ko from '../../../locales/ko.json'
import pt_BR from '../../../locales/pt_BR.json'
import ru from '../../../locales/ru.json'
import zh_CN from '../../../locales/zh_CN.json'
import type { Locale } from './locales'

type Catalog = typeof en

/**
 * Keys of plain (non-plural) messages; plural entries have per-count forms
 * and are not addressable through `message`.
 */
export type MessageKey = {
  [K in keyof Catalog]: Catalog[K] extends { message: string } ? K : never
}[keyof Catalog]

type MessageCatalog = Record<string, unknown>

const CATALOGS: Record<Locale, MessageCatalog> = {
  en,
  es,
  de,
  fr,
  it,
  ja,
  ko,
  pt_BR,
  ru,
  zh_CN,
}

/**
 * Reads one extension UI string from `locales/<locale>.json`, the same files
 * the extension ships, so the video never duplicates product copy.
 */
export const message = (locale: Locale, key: MessageKey): string => {
  const entry = CATALOGS[locale][key]
  if (
    typeof entry === 'object' &&
    entry !== null &&
    'message' in entry &&
    typeof entry.message === 'string'
  ) {
    return entry.message
  }
  throw new Error(`Missing message "${key}" for locale "${locale}"`)
}
