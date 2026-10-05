import {
  languageTag,
  type Locale,
  localePath,
  ogImagePath,
  SITE_ORIGIN,
} from '../i18n/locales'
import { STORE_FACTS, STORE_LISTING_URL } from './store-facts'

/**
 * `SoftwareApplication` JSON-LD for one locale's page. Name and description
 * come from the locale's content file; the rest are store listing facts.
 * @param locale - A supported locale code.
 * @param description - The locale's meta description.
 * @returns A JSON-LD object ready to serialize.
 */
export function buildSoftwareAppJsonLd(locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: STORE_FACTS.name,
    description,
    url: `${SITE_ORIGIN}${localePath(locale)}`,
    inLanguage: languageTag(locale),
    applicationCategory: STORE_FACTS.category,
    operatingSystem: STORE_FACTS.operatingSystem,
    browserRequirements: STORE_FACTS.browserRequirements,
    downloadUrl: STORE_LISTING_URL,
    screenshot: `${SITE_ORIGIN}${ogImagePath(locale)}`,
    author: {
      '@type': 'Person',
      name: STORE_FACTS.author.name,
      url: STORE_FACTS.author.url,
    },
    license: STORE_FACTS.license,
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/InstallAction',
      userInteractionCount: STORE_FACTS.userCount,
    },
  }
}
