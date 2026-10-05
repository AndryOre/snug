import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  collectMetaScriptHashes,
  findInlineScriptHashes,
  renderSecurityHeaders,
} from './security-headers'

const [distributionDirectory, templatePath, outputPath] = process.argv.slice(2)
if (!distributionDirectory || !templatePath || !outputPath) {
  throw new Error('Usage: render-security-headers <dist> <template> <output>')
}

const pages = readdirSync(distributionDirectory, {
  recursive: true,
  encoding: 'utf8',
})
  .filter((file) => file.endsWith('.html'))
  .map((file) => ({
    file,
    html: readFileSync(path.join(distributionDirectory, file), 'utf8'),
  }))

const allowed = new Set(
  pages.flatMap(({ html }) => collectMetaScriptHashes(html)),
)
const unhashed = pages.flatMap(({ file, html }) =>
  findInlineScriptHashes(html)
    .filter((hash) => !allowed.has(hash))
    .map((hash) => `${file} ${hash}`),
)
if (unhashed.length > 0) {
  throw new Error(
    `Inline scripts missing from the CSP:\n${unhashed.join('\n')}`,
  )
}

writeFileSync(
  outputPath,
  renderSecurityHeaders(readFileSync(templatePath, 'utf8'), [...allowed]),
)
console.log(`CSP: ${allowed.size} script hashes from ${pages.length} pages`)
