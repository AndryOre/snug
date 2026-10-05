import {
  languageTag,
  type Locale,
  localePath,
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
    license: STORE_FACTS.license,
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: STORE_FACTS.ratingValue,
      ratingCount: STORE_FACTS.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/InstallAction',
      userInteractionCount: STORE_FACTS.userCount,
    },
  }
}
