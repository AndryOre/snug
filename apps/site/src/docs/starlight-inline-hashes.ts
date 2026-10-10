import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const requireFromHere = createRequire(import.meta.url)

const COMPONENTS_WITH_INLINE_SCRIPTS = [
  '@astrojs/starlight/components/SidebarPersister.astro',
] as const

const INLINE_SCRIPT = /<script is:inline[^>]*>(?<body>[\s\S]*?)<\/script>/g

/**
 * CSP hash sources (without quotes) for the inline scripts Starlight ships in
 * the components the Guide keeps: the sidebar state persister. Astro does not hash them into the policy itself, and they are read
 * from the installed package so a Starlight upgrade cannot leave them stale.
 * @returns One `sha256-...` source per `is:inline` script, without duplicates.
 */
export function collectStarlightInlineScriptHashes(): `sha256-${string}`[] {
  const hashes = COMPONENTS_WITH_INLINE_SCRIPTS.flatMap((specifier) => {
    const source = readFileSync(requireFromHere.resolve(specifier), 'utf8')
    return source
      .matchAll(INLINE_SCRIPT)
      .map(
        ({ groups }) =>
          `sha256-${createHash('sha256')
            .update(groups?.['body'] ?? '')
            .digest('base64')}` as const,
      )
      .toArray()
  })
  return [...new Set(hashes)]
}
