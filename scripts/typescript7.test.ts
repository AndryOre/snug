import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(import.meta.dirname, '..')
const typescript7Bin = path.join(repoRoot, 'node_modules/typescript7/bin/tsc')
const typescript6Bin = path.join(repoRoot, 'node_modules/typescript/bin/tsc')

const typecheckScripts = [
  ['package.json', 'check:root'],
  ['package.json', 'typecheck'],
  ['packages/ui/package.json', 'check'],
  ['apps/extension/package.json', 'check'],
  ['apps/video/package.json', 'check'],
] as const

/**
 * Runs a tsc entry point with `--version`.
 * @param binPath Absolute path of the tsc script.
 * @returns The trimmed version banner.
 */
function readTscVersion(binPath: string): string {
  const result = spawnSync(process.execPath, [binPath, '--version'], {
    encoding: 'utf8',
  })
  expect(result.status).toBe(0)
  return result.stdout.trim()
}

describe('TypeScript 7 typecheck alias', () => {
  it('reports 7.1 from the aliased bin', () => {
    expect(readTscVersion(typescript7Bin)).toMatch(/^Version 7\.1\./)
  })

  it('keeps typescript on 6.x for tools needing the classic API', () => {
    expect(readTscVersion(typescript6Bin)).toMatch(/^Version 6\./)
  })

  it.each(typecheckScripts)(
    'calls the typescript7 bin explicitly in %s "%s"',
    (manifestPath, scriptName) => {
      const manifest = JSON.parse(
        readFileSync(path.join(repoRoot, manifestPath), 'utf8'),
      ) as { scripts: Record<string, string> }
      const script = manifest.scripts[scriptName] ?? ''
      expect(script).toContain('node_modules/typescript7/bin/tsc --noEmit')
      expect(script).not.toMatch(/(^|[\s&])tsc --noEmit/)
    },
  )
})
