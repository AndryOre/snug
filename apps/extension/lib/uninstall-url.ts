import { autoExportConfigStore } from '@/lib/storage'

const GOODBYE_BASE_URL = 'https://snug.andryore.dev/goodbye/'
const MAX_UNINSTALL_URL_LENGTH = 1023
const FALLBACK_LOCALE = 'en'
const SHIPPED_LOCALES = [
  'de',
  'en',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'pt_BR',
  'ru',
  'zh_CN',
] as const

/**
 * Resolves a browser UI language to the extension locale code Snug ships,
 * mirroring Chrome's lookup: exact locale, then base language, then English.
 * @param uiLanguage A BCP 47 tag such as `pt-BR` or `de-AT`.
 * @returns A shipped locale code such as `pt_BR`, or `en`.
 */
function resolveLocaleCode(uiLanguage: string): string {
  const normalized = uiLanguage.replaceAll('-', '_')
  const [baseLanguage = ''] = normalized.split('_', 1)
  return (
    SHIPPED_LOCALES.find(
      (locale) => locale === normalized || locale === baseLanguage,
    ) ?? FALLBACK_LOCALE
  )
}

/**
 * Builds the Goodbye page URL Chrome opens on uninstall. It carries only the
 * extension locale code, the manifest version and whether Auto-export is on;
 * nothing identifying is ever added.
 * @param parameters The inputs.
 * @param parameters.uiLanguage The browser UI language.
 * @param parameters.version The manifest version.
 * @param parameters.isAutoExportEnabled Whether Auto-export is on.
 * @returns The full uninstall URL, e.g. `...?lang=pt_BR&v=2.2.0&ae=1`.
 */
export function buildUninstallUrl(parameters: {
  uiLanguage: string
  version: string
  isAutoExportEnabled: boolean
}): string {
  const query = new URLSearchParams({
    lang: resolveLocaleCode(parameters.uiLanguage),
    v: parameters.version,
    ae: parameters.isAutoExportEnabled ? '1' : '0',
  })
  return `${GOODBYE_BASE_URL}?${query.toString()}`
}

/**
 * Registers the uninstall URL with the browser. Dev builds register an empty
 * string; a URL at or over the length limit, or one the browser rejects, falls
 * back to the bare Goodbye URL. Never throws: failures are logged.
 * @returns Resolves once registration has settled.
 */
export async function registerUninstallUrl(): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      await browser.runtime.setUninstallURL('')
      return
    }
    const config = await autoExportConfigStore.getValue()
    const url = buildUninstallUrl({
      uiLanguage: browser.i18n.getUILanguage(),
      version: browser.runtime.getManifest().version,
      isAutoExportEnabled: config.enabled,
    })
    if (url.length >= MAX_UNINSTALL_URL_LENGTH) {
      await browser.runtime.setUninstallURL(GOODBYE_BASE_URL)
      return
    }
    try {
      await browser.runtime.setUninstallURL(url)
    } catch (error) {
      console.error(error)
      await browser.runtime.setUninstallURL(GOODBYE_BASE_URL)
    }
  } catch (error) {
    console.error(error)
  }
}
