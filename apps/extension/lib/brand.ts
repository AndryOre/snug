import type { GeneratedI18nStructure } from '#i18n'
import { createI18n } from '@wxt-dev/i18n'

/**
 * The extension's published Chrome Web Store item ID. Stable across listing
 * renames, unlike the store slug embedded in {@link CHROME_WEB_STORE_URL}'s
 * alternate, human-readable URL form.
 */
export const CHROME_WEB_STORE_EXTENSION_ID = 'gdhpeilfkeeajillmcncaelnppiakjhn'

/**
 * The Chrome Web Store listing URL, in its slugless form
 * (`.../detail/<extension-id>`). Chrome redirects this form to the
 * slugged URL, so it keeps working even after the listing's name — and
 * therefore its slug — changes.
 */
export const CHROME_WEB_STORE_URL = `https://chromewebstore.google.com/detail/${CHROME_WEB_STORE_EXTENSION_ID}`

/**
 * The Chrome Web Store reviews tab for the listing. Opened by the popup
 * Review prompt; carries no UTM or tracking parameters.
 */
export const CHROME_WEB_STORE_REVIEWS_URL = `${CHROME_WEB_STORE_URL}/reviews`

/**
 * The extension's Microsoft Edge Add-ons item ID.
 */
export const EDGE_ADD_ONS_EXTENSION_ID = 'efknehclgcncocgochoibgiiagklcnho'

/**
 * The Microsoft Edge Add-ons listing URL. Edge has no separate reviews page,
 * so this is also the review destination.
 */
export const EDGE_ADD_ONS_URL = `https://microsoftedge.microsoft.com/addons/detail/${EDGE_ADD_ONS_EXTENSION_ID}`

/**
 * Whether this bundle was built for Microsoft Edge (`wxt build -b edge`).
 * @returns True on the Edge build target.
 */
function isEdgeBuild(): boolean {
  return import.meta.env.BROWSER === 'edge'
}

/**
 * The store listing URL for the build target: Edge Add-ons on Edge, the Chrome
 * Web Store otherwise.
 * @returns The URL to open for the listing.
 */
export function getStoreListingUrl(): string {
  return isEdgeBuild() ? EDGE_ADD_ONS_URL : CHROME_WEB_STORE_URL
}

/**
 * The store reviews URL for the build target: the Edge Add-ons listing on Edge,
 * the Chrome Web Store reviews tab otherwise.
 * @returns The URL to open for leaving a review.
 */
export function getStoreReviewsUrl(): string {
  return isEdgeBuild() ? EDGE_ADD_ONS_URL : CHROME_WEB_STORE_REVIEWS_URL
}

/**
 * The product name. Never translated, so every locale's `extensionName`
 * message must equal it.
 */
export const PRODUCT_NAME = 'Snug'

/**
 * The product's official homepage: the live landing site.
 */
export const SITE_URL = 'https://snug.andryore.dev/'

/**
 * The landing site's privacy policy page. English only, so it is the same in
 * every locale.
 */
export const SITE_PRIVACY_URL = 'https://snug.andryore.dev/privacy/'

const i18n = createI18n<GeneratedI18nStructure>()

/**
 * The landing site's URL in the active UI language: the site origin plus the
 * locale's `siteLocalePath` message (`/`, `/es/`, `/pt-br/`, ...).
 * @returns The localized landing page URL.
 */
export function getSiteUrl(): string {
  return `${new URL(SITE_URL).origin}${i18n.t('siteLocalePath')}`
}

/**
 * The project's GitHub repository URL.
 */
export const GITHUB_URL = 'https://github.com/AndryOre/snug'

/**
 * The project's X (formerly Twitter) profile URL.
 */
export const TWITTER_URL = 'https://x.com/andryore'
