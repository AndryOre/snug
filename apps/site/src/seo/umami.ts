import { SITE_ORIGIN } from '../i18n/locales'

export const UMAMI_WEBSITE_ID = '3c1202a5-f999-425c-936c-c7e4642223ad'

export const UMAMI_SCRIPT_ORIGIN = 'https://cloud.umami.is'

export const UMAMI_SCRIPT_URL = `${UMAMI_SCRIPT_ORIGIN}/script.js`

/**
 * Origin the Umami Cloud script posts events to (`/api/send`), taken from the
 * live script's default host.
 */
export const UMAMI_COLLECT_ORIGIN = 'https://gateway.umami.is'

export const UMAMI_DOMAINS = new URL(SITE_ORIGIN).hostname
