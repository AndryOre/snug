import {
  languageTag,
  type Locale,
  localePath,
  ogImagePath,
  SITE_ORIGIN,
} from '../i18n/locales'
import { STORE_FACTS } from './store-facts'

/**
 * One schema.org `@graph` for a locale's page: the `WebSite` (so Google can
 * pick the site name), the `SoftwareApplication` and its author `Person`,
 * linked by `@id`. Carries no `aggregateRating`, `review` or `FAQPage`.
 * @param locale - A supported locale code.
 * @param description - The locale's meta description.
 * @param featureList - The locale's feature titles.
 * @returns A JSON-LD object ready to serialize.
 */
export function buildStructuredData(
  locale: Locale,
  description: string,
  featureList: readonly string[],
) {
  const pageUrl = `${SITE_ORIGIN}${localePath(locale)}`
  const authorId = `${SITE_ORIGIN}/#author`
  const installUrl = `${SITE_ORIGIN}/install`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${pageUrl}#website`,
        name: STORE_FACTS.name,
        url: pageUrl,
        inLanguage: languageTag(locale),
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${pageUrl}#software`,
        name: STORE_FACTS.name,
        description,
        url: pageUrl,
        inLanguage: languageTag(locale),
        applicationCategory: STORE_FACTS.category,
        operatingSystem: STORE_FACTS.operatingSystem,
        browserRequirements: STORE_FACTS.browserRequirements,
        downloadUrl: installUrl,
        installUrl,
        featureList,
        screenshot: `${SITE_ORIGIN}${ogImagePath(locale)}`,
        author: { '@id': authorId },
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
      },
      {
        '@type': 'Person',
        '@id': authorId,
        name: STORE_FACTS.author.name,
        url: STORE_FACTS.author.url,
        sameAs: [STORE_FACTS.author.url],
      },
    ],
  }
}
