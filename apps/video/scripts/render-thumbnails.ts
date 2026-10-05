import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import { mkdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { LOCALES } from '../src/copy'
import { THUMBNAIL_SIZE } from '../src/thumbnail/Thumbnail'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.resolve(
  ROOT,
  '..',
  '..',
  'docs',
  'brand',
  'youtube',
  'thumbnails',
)
const MAX_BYTES = 2 * 1024 * 1024

const main = async () => {
  mkdirSync(OUT_DIR, { recursive: true })
  const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null

  console.log('Bundling…')
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, 'src', 'index.ts'),
  })

  const failures: string[] = []
  for (const locale of LOCALES) {
    const inputProps = { locale }
    const composition = await selectComposition({
      serveUrl,
      id: 'Thumbnail',
      inputProps,
      browserExecutable,
    })
    if (
      composition.width !== THUMBNAIL_SIZE.width ||
      composition.height !== THUMBNAIL_SIZE.height
    ) {
      failures.push(
        `${locale}: composition is ${composition.width}x${composition.height}`,
      )
      continue
    }
    const output = path.join(OUT_DIR, `${locale}.png`)
    await renderStill({
      composition,
      serveUrl,
      output,
      inputProps,
      browserExecutable,
      imageFormat: 'png',
    })
    const bytes = statSync(output).size
    if (bytes > MAX_BYTES) {
      failures.push(`${locale}: ${bytes} bytes exceeds ${MAX_BYTES}`)
    } else {
      console.log(`${locale}: ok (${Math.round(bytes / 1024)} KB) -> ${output}`)
    }
  }

  if (failures.length > 0) {
    throw new Error(`Verification failed:\n${failures.join('\n')}`)
  }
}

try {
  await main()
} catch (error: unknown) {
  console.error(error)
  process.exitCode = 1
}
