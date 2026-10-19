import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import {
  collectMetaScriptHashes,
  findInlineScriptHashes,
} from '../scripts/security-headers'
import { UMAMI_SCRIPT_ORIGIN } from './umami'

const ALLOWED_THIRD_PARTY_ORIGINS: ReadonlySet<string> = new Set([
  UMAMI_SCRIPT_ORIGIN,
  'https://www.youtube-nocookie.com',
])

const LOADING_RELATIONS = new Set([
  'stylesheet',
  'preload',
  'modulepreload',
  'prefetch',
  'preconnect',
  'dns-prefetch',
  'icon',
  'apple-touch-icon',
  'manifest',
])
const FORBIDDEN_RELATIONS = [
  'modulepreload',
  'prefetch',
  'preconnect',
  'dns-prefetch',
]
const SOURCE_TAG =
  /<(?:script|img|iframe|source|video|audio|embed|object|track|input)\b[^>]*>/gi
const LINK_TAG = /<link\b[^>]*>/gi
const CSS_URL = /url\(\s*['"]?([^'")\s]+)/gi
const CSS_IMPORT = /@import\s+['"]([^'"]+)/gi

function attribute(tag: string, name: string): string | undefined {
  const match = new RegExp(
    String.raw`\s${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`,
    'i',
  ).exec(tag)
  return match?.[1] ?? match?.[2] ?? match?.[3]
}

function relations(tag: string): string[] {
  return (attribute(tag, 'rel') ?? '').toLowerCase().split(/\s+/)
}

function isDisallowedOrigin(reference: string): boolean {
  if (!/^(?:https?:)?\/\//i.test(reference)) return false
  try {
    const { origin } = new URL(reference, 'https://self.invalid')
    return !ALLOWED_THIRD_PARTY_ORIGINS.has(origin)
  } catch {
    return true
  }
}

function srcsetUrls(value: string): string[] {
  return value
    .split(',')
    .flatMap((candidate) => candidate.trim().split(/\s+/).slice(0, 1))
}

function requestedUrls(html: string): string[] {
  const urls: string[] = []
  for (const [tag] of html.matchAll(SOURCE_TAG)) {
    const source = attribute(tag, 'src')
    if (source) urls.push(source)
    const srcset = attribute(tag, 'srcset')
    if (srcset) urls.push(...srcsetUrls(srcset))
  }
  for (const [tag] of html.matchAll(LINK_TAG)) {
    const href = attribute(tag, 'href')
    if (
      href &&
      relations(tag).some((relation) => LOADING_RELATIONS.has(relation))
    ) {
      urls.push(href)
    }
  }
  return urls
}

function unexpectedLoadingLinks(html: string): string[] {
  return html
    .matchAll(LINK_TAG)
    .map(([tag]) => tag)
    .filter((tag) => {
      const rels = relations(tag)
      return rels.includes('preload')
        ? attribute(tag, 'as') !== 'font'
        : FORBIDDEN_RELATIONS.some((relation) => rels.includes(relation))
    })
    .toArray()
}

function cssUrls(css: string): string[] {
  return [...css.matchAll(CSS_URL), ...css.matchAll(CSS_IMPORT)].map(
    (match) => match[1] ?? '',
  )
}

function builtFiles(distribution: string): string[] {
  return readdirSync(distribution, { recursive: true, encoding: 'utf8' })
    .filter((entry) => /\.(?:html|css)$/.test(entry))
    .map((entry) => path.join(distribution, entry))
}

function thirdPartyProblems(route: string, urls: string[]): string[] {
  return urls
    .filter((url) => isDisallowedOrigin(url))
    .map((url) => `${route}: third-party request to ${url}`)
}

function auditHtml(route: string, html: string): string[] {
  const allowedHashes = new Set(collectMetaScriptHashes(html))
  return [
    ...thirdPartyProblems(route, requestedUrls(html)),
    ...unexpectedLoadingLinks(html).map(
      (tag) => `${route}: unexpected loading link ${tag}`,
    ),
    ...findInlineScriptHashes(html)
      .filter((hash) => !allowedHashes.has(hash))
      .map(
        (hash) =>
          `${route}: inline script not allowed by the content security policy: ${hash}`,
      ),
  ]
}

/**
 * Audits a built site folder for distribution drift. Pages and stylesheets
 * may request only same-origin resources plus the Umami Cloud script origin and
 * the click-to-load YouTube nocookie origin,
 * loading links are limited to stylesheets, icons, the manifest and font
 * preloads, and every inline script hash must appear in that page's own CSP
 * meta tag. Metadata checks stay in `e2e/built-output.spec.ts`.
 * @param distribution - The build output folder.
 * @returns One message per problem, empty when the build is clean.
 */
export function auditDistribution(distribution: string): string[] {
  if (!existsSync(distribution)) {
    return [`${distribution}: build output folder does not exist`]
  }
  return builtFiles(distribution).flatMap((file) => {
    const route = path.relative(distribution, file)
    const content = readFileSync(file, 'utf8')
    return file.endsWith('.css')
      ? thirdPartyProblems(route, cssUrls(content))
      : auditHtml(route, content)
  })
}
