import { i18n } from '#i18n'

/**
 * Maps a typed Auto-export failure code to the key of its localized message.
 */
const ERROR_MESSAGE_KEYS = {
  'downloads-access-needed': 'autoExportError_downloadsAccessNeeded',
} as const

function isKnownErrorCode(
  errorCode: string,
): errorCode is keyof typeof ERROR_MESSAGE_KEYS {
  return Object.hasOwn(ERROR_MESSAGE_KEYS, errorCode)
}

/**
 * Resolves the text to show for a failed Auto-export run. A known typed code
 * becomes its localized sentence so the raw code is never rendered; any other
 * failure keeps the supplied text. The manual-export reply carries the code in
 * its `error` field, so that value can be passed as the code too.
 * @param errorCode The run's typed `errorCode`, if any.
 * @param fallback The text to show when the code is absent or unknown.
 * @returns The localized message, or `fallback`.
 */
export function getAutoExportErrorMessage(
  errorCode: string | undefined,
  fallback: string,
): string {
  return errorCode !== undefined && isKnownErrorCode(errorCode)
    ? i18n.t(ERROR_MESSAGE_KEYS[errorCode])
    : fallback
}
