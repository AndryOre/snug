import { createHash } from 'node:crypto'

/**
 * How a locale's page relates to the English source.
 */
export type TranslationStatus = 'translated' | 'missing' | 'stale'

/**
 * A translation file after parsing its frontmatter.
 */
export interface ParsedTranslation {
  title: string
  sourceHash: string
  body: string
  description?: string
  seoTitle?: string
}

/**
 * Thrown when a translation file cannot be parsed. Every other status is
 * data; only an unreadable file is an error.
 */
export class MalformedTranslationError extends Error {
  constructor(label: string, reason: string) {
    super(`${label}: ${reason}`)
    this.name = 'MalformedTranslationError'
  }
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

/**
 * Hash of an English source file, stored in a translation's `sourceHash`
 * frontmatter. Line endings are normalised so the hash is stable across
 * platforms.
 * @param source - The full text of the English source file.
 * @returns The first 16 hex characters of its SHA-256.
 */
export function hashSource(source: string): string {
  return createHash('sha256')
    .update(source.replaceAll('\r\n', '\n'))
    .digest('hex')
    .slice(0, 16)
}

function unquote(value: string): string {
  const quote = value[0]
  if (!(quote === '"' || quote === "'") || !value.endsWith(quote)) return value
  const inner = value.slice(1, -1)
  return quote === "'" ? inner.replaceAll("''", "'") : inner
}

/**
 * Parses a translation: simple `key: value` frontmatter with a required
 * `title` and `sourceHash` and an optional `description` and `seoTitle`, then
 * the Markdown body.
 * @param text - The file contents.
 * @param label - The file name, used in error messages.
 * @returns The parsed translation.
 * @throws {MalformedTranslationError} When the frontmatter is missing or
 * incomplete.
 */
export function parseTranslation(
  text: string,
  label: string,
): ParsedTranslation {
  const match = FRONTMATTER.exec(text)
  if (!match) throw new MalformedTranslationError(label, 'missing frontmatter')
  const fields = new Map<string, string>()
  const lines = (match[1] ?? '').split(/\r?\n/)
  let continuedKey: string | undefined
  for (const line of lines) {
    if (line.trim() === '') continue
    if (continuedKey !== undefined && /^\s/.test(line)) {
      const previous = fields.get(continuedKey) ?? ''
      fields.set(continuedKey, `${previous} ${line.trim()}`.trim())
      continue
    }
    const separator = line.indexOf(':')
    if (separator < 1) {
      throw new MalformedTranslationError(label, `invalid line "${line}"`)
    }
    continuedKey = line.slice(0, separator).trim()
    fields.set(continuedKey, line.slice(separator + 1).trim())
  }
  for (const [key, value] of fields) fields.set(key, unquote(value))
  const title = fields.get('title')
  if (!title) throw new MalformedTranslationError(label, 'missing title')
  const sourceHash = fields.get('sourceHash')
  if (!sourceHash) {
    throw new MalformedTranslationError(label, 'missing sourceHash')
  }
  const description = fields.get('description')
  const seoTitle = fields.get('seoTitle')
  return {
    title,
    sourceHash,
    body: match[2] ?? '',
    ...(description && { description }),
    ...(seoTitle && { seoTitle }),
  }
}

/**
 * Counts the ATX headings of a Markdown body, skipping fenced code. Used to
 * check that a translation keeps the structure of its English source.
 * @param markdown - A Markdown body.
 * @returns How many `#` headings it has.
 */
export function countHeadings(markdown: string): number {
  let isInsideFence = false
  let count = 0
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      isInsideFence = !isInsideFence
    } else if (!isInsideFence && /^#{1,6}\s+\S/.test(line)) {
      count += 1
    }
  }
  return count
}

/**
 * Classifies a locale's page against the current English source.
 * @param translation - The parsed translation, or undefined when none exists.
 * @param englishHash - The current hash of the English source.
 * @returns `missing` without a file, `stale` when its hash no longer matches,
 * otherwise `translated`.
 */
export function classifyTranslation(
  translation: Pick<ParsedTranslation, 'sourceHash'> | undefined,
  englishHash: string,
): TranslationStatus {
  if (!translation) return 'missing'
  return translation.sourceHash === englishHash ? 'translated' : 'stale'
}
