import { youtubeWatchUrl } from '../i18n/landing'
import {
  languageTag,
  type Locale,
  localePath,
  ogImagePath,
  SITE_ORIGIN,
} from '../i18n/locales'
import { STORE_FACTS } from './store-facts'

/**
 * Locale-specific page facts that feed the `WebPage` and `VideoObject` nodes.
 */
export interface StructuredDataPage {
  title: string
  videoId: string
  videoDescription: string
}

/**
 * One schema.org `@graph` for a locale's page. The `WebSite`,
 * `SoftwareApplication` and author `Person` share one `@id` across every
 * locale; the locale is expressed by the `WebPage` and `VideoObject` nodes.
 * Carries no `aggregateRating`, `review` or `FAQPage`, and never points at
 * `/install`.
 * @param locale - A supported locale code.
 * @param description - The locale's meta description.
 * @param featureList - The locale's feature titles.
 * @param page - The locale's title and walkthrough video facts.
 * @returns A JSON-LD object ready to serialize.
 */
export function buildStructuredData(
  locale: Locale,
  description: string,
  featureList: readonly string[],
  page: StructuredDataPage,
) {
  const pageUrl = `${SITE_ORIGIN}${localePath(locale)}`
  const authorId = `${SITE_ORIGIN}/#author`
  const websiteId = `${SITE_ORIGIN}/#website`
  const softwareId = `${SITE_ORIGIN}/#software`
  const videoId = `${pageUrl}#video`
  const language = languageTag(locale)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: STORE_FACTS.name,
        url: `${SITE_ORIGIN}/`,
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.title,
        description,
        inLanguage: language,
        isPartOf: { '@id': websiteId },
        about: { '@id': softwareId },
        video: { '@id': videoId },
      },
      {
        '@type': 'VideoObject',
        '@id': videoId,
        name: page.title,
        description: page.videoDescription,
        thumbnailUrl: `https://i.ytimg.com/vi/${page.videoId}/maxresdefault.jpg`,
        uploadDate: STORE_FACTS.promoVideoUploadDate,
        embedUrl: `https://www.youtube-nocookie.com/embed/${page.videoId}`,
        contentUrl: youtubeWatchUrl(page.videoId),
        inLanguage: language,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': softwareId,
        name: STORE_FACTS.name,
        description,
        url: `${SITE_ORIGIN}/`,
        inLanguage: language,
        sameAs: [STORE_FACTS.storeUrl, STORE_FACTS.sourceUrl],
        applicationCategory: STORE_FACTS.category,
        operatingSystem: STORE_FACTS.operatingSystem,
        browserRequirements: STORE_FACTS.browserRequirements,
        downloadUrl: STORE_FACTS.storeUrl,
        installUrl: STORE_FACTS.storeUrl,
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
