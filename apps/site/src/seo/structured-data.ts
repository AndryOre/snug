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
 * Carries no `aggregateRating`, `review` or `FAQPage`. Install links use the
 * counted `/install` redirect, never the raw store URL.
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
  const installUrl = `${SITE_ORIGIN}/install`
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
        sameAs: [STORE_FACTS.sourceUrl],
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

/**
 * One step of a comparison page's breadcrumb trail.
 */
interface ComparisonBreadcrumb {
  name: string
  path: string
}

/**
 * Locale-specific facts that feed a comparison page's `WebPage` and
 * `BreadcrumbList` nodes.
 */
export interface ComparisonStructuredDataPage {
  title: string
  description: string
  path: string
  breadcrumbs: readonly ComparisonBreadcrumb[]
  /**
   * Drops the `about` link to the shared `SoftwareApplication`.
   */
  omitAbout?: boolean
  /**
   * `YYYY-MM-DD` date of the last commit behind the page, when known.
   */
  dateModified?: string | undefined
}

/**
 * One schema.org `@graph` for the Alternatives page or a comparison page: a
 * `WebPage` that is `about` the shared `SoftwareApplication` and a
 * `BreadcrumbList`. It never carries a competitor `AggregateRating`, `Review`
 * or `Product`.
 * @param locale - A supported locale code.
 * @param page - The page's title, description, path and breadcrumb trail.
 * @returns A JSON-LD object ready to serialize.
 */
export function buildComparisonStructuredData(
  locale: Locale,
  page: ComparisonStructuredDataPage,
) {
  const pageUrl = `${SITE_ORIGIN}${page.path}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.title,
        description: page.description,
        inLanguage: languageTag(locale),
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        ...(!page.omitAbout && {
          about: { '@id': `${SITE_ORIGIN}/#software` },
        }),
        ...(page.dateModified && { dateModified: page.dateModified }),
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: page.breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${SITE_ORIGIN}${crumb.path}`,
        })),
      },
    ],
  }
}

/**
 * One page listed on the How-to index.
 */
interface HowToIndexItem {
  name: string
  path: string
}

/**
 * Facts that feed the How-to index's `CollectionPage`, `ItemList` and
 * `BreadcrumbList` nodes.
 */
export interface HowToIndexStructuredDataPage extends ComparisonStructuredDataPage {
  items: readonly HowToIndexItem[]
}

/**
 * One schema.org `@graph` for the How-to index: a `CollectionPage` whose main
 * entity is an `ItemList` of every How-to page, plus a `BreadcrumbList`. It
 * never carries `HowTo`, `FAQPage`, `AggregateRating` or `Review` data.
 * @param locale - A supported locale code.
 * @param page - The index's title, description, path, breadcrumb trail and
 * listed pages.
 * @returns A JSON-LD object ready to serialize.
 */
export function buildHowToIndexStructuredData(
  locale: Locale,
  page: HowToIndexStructuredDataPage,
) {
  const pageUrl = `${SITE_ORIGIN}${page.path}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.title,
        description: page.description,
        inLanguage: languageTag(locale),
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        ...(page.dateModified && { dateModified: page.dateModified }),
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        mainEntity: { '@id': `${pageUrl}#list` },
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#list`,
        numberOfItems: page.items.length,
        itemListElement: page.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: `${SITE_ORIGIN}${item.path}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: page.breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${SITE_ORIGIN}${crumb.path}`,
        })),
      },
    ],
  }
}

/**
 * Facts that feed a How-to page's `WebPage` and `BreadcrumbList` nodes.
 */
export interface HowToStructuredDataPage extends ComparisonStructuredDataPage {
  /**
   * Whether the page has a With Snug section, which is what makes it `about`
   * the shared `SoftwareApplication`.
   */
  hasSnugSection: boolean
}

/**
 * One schema.org `@graph` for a How-to page: a `WebPage` (`about` the shared
 * `SoftwareApplication` only when the page has a Snug section) and a
 * `BreadcrumbList`. It never carries `HowTo`, `FAQPage`, `AggregateRating` or
 * `Review` data.
 * @param locale - A supported locale code.
 * @param page - The page's title, description, path, breadcrumb trail and
 * whether it has a Snug section.
 * @returns A JSON-LD object ready to serialize.
 */
export function buildHowToStructuredData(
  locale: Locale,
  page: HowToStructuredDataPage,
) {
  return buildComparisonStructuredData(locale, {
    ...page,
    omitAbout: !page.hasSnugSection,
  })
}
