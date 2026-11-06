import { execFileSync } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const repositoryRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)

const QUERY = 'query { affectedTasks(base: "HEAD") { items { fullName } } }'

const probes = [
  ['apps/site/affected-probe.txt', '@snug/site'],
  ['apps/extension/lib/affected-probe.txt', '@snug/extension'],
] as const

function affectedTasksFor(probeRelativePath: string): string[] {
  const probePath = path.join(repositoryRoot, probeRelativePath)
  writeFileSync(probePath, 'affected probe\n')
  try {
    const output = execFileSync('bunx', ['turbo', 'query', QUERY], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    })
    const parsed = JSON.parse(output) as {
      data: { affectedTasks: { items: { fullName: string }[] } }
    }
    return parsed.data.affectedTasks.items.map((item) => item.fullName)
  } finally {
    rmSync(probePath, { force: true })
  }
}

describe('turbo --affected selection', () => {
  afterEach(() => {
    for (const [probe] of probes) {
      rmSync(path.join(repositoryRoot, probe), { force: true })
    }
  })

  it.each(probes)(
    'a change at %s selects %s test and test:e2e',
    (probe, workspace) => {
      const tasks = affectedTasksFor(probe)
      expect(tasks).toContain(`${workspace}#test`)
      expect(tasks).toContain(`${workspace}#test:e2e`)
    },
    60_000,
  )
})
