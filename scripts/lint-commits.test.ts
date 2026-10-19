import { readFileSync } from 'node:fs'
import { describe, expect, test, vi } from 'vitest'

import {
  buildCommitlintCommand,
  type GitResult,
  type GitRunner,
  resolveCommitlintBase,
  runLintCommits,
} from './lint-commits'

function findCommitlintRunCommand(): string {
  const workflow = readFileSync(
    new URL('../.github/workflows/ci.yml', import.meta.url),
    'utf8',
  ).replaceAll(/\s+/g, ' ')
  const match = /bunx commitlint .*? --verbose/.exec(workflow)
  if (match === null) {
    throw new Error('ci.yml has no commitlint run step.')
  }
  return match[0]
}

describe('buildCommitlintCommand', () => {
  test('uses the same invocation and flags as the ci.yml commitlint job', () => {
    const workflowCommand = findCommitlintRunCommand()
      .replace('${{ github.event.pull_request.base.sha }}', 'BASE')
      .replace('${{ github.event.pull_request.head.sha }}', 'HEAD')
    expect(buildCommitlintCommand('BASE', 'HEAD').join(' ')).toBe(
      workflowCommand,
    )
  })
})

function createGitRunner(responses: Record<string, GitResult>): {
  git: GitRunner
  calls: string[][]
} {
  const calls: string[][] = []
  const git: GitRunner = (arguments_) => {
    calls.push(arguments_)
    return responses[arguments_.join(' ')] ?? { ok: false, output: 'nope' }
  }
  return { git, calls }
}

describe('resolveCommitlintBase', () => {
  test('prefers origin/main', () => {
    const { git, calls } = createGitRunner({
      'merge-base origin/main HEAD': { ok: true, output: 'aaa' },
      'merge-base main HEAD': { ok: true, output: 'bbb' },
    })
    expect(resolveCommitlintBase(git)).toBe('aaa')
    expect(calls).toEqual([['merge-base', 'origin/main', 'HEAD']])
  })

  test('falls back to main when origin/main is missing', () => {
    const { git, calls } = createGitRunner({
      'merge-base main HEAD': { ok: true, output: 'bbb' },
    })
    expect(resolveCommitlintBase(git)).toBe('bbb')
    expect(calls.map((call) => call[1])).toEqual(['origin/main', 'main'])
  })

  test('throws when neither ref resolves', () => {
    const { git } = createGitRunner({})
    expect(() => resolveCommitlintBase(git)).toThrow(
      /could not resolve a merge-base/,
    )
  })
})

describe('runLintCommits', () => {
  test('spawns commitlint between the merge-base and HEAD', async () => {
    const { git } = createGitRunner({
      'merge-base origin/main HEAD': { ok: true, output: 'base' },
      'rev-parse HEAD': { ok: true, output: 'head' },
    })
    const spawnCommand = vi.fn().mockResolvedValue(3)
    await expect(runLintCommits({ git, spawnCommand })).resolves.toBe(3)
    expect(spawnCommand).toHaveBeenCalledWith('bunx', [
      'commitlint',
      '--from',
      'base',
      '--to',
      'HEAD',
      '--verbose',
    ])
  })

  test('skips linting when HEAD is the merge-base', async () => {
    const { git } = createGitRunner({
      'merge-base origin/main HEAD': { ok: true, output: 'same' },
      'rev-parse HEAD': { ok: true, output: 'same' },
    })
    const spawnCommand = vi.fn()
    const log = vi.spyOn(console, 'log').mockImplementation(vi.fn())
    await expect(runLintCommits({ git, spawnCommand })).resolves.toBe(0)
    expect(spawnCommand).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('nothing to lint'))
    log.mockRestore()
  })

  test('throws when HEAD cannot be resolved', async () => {
    const { git } = createGitRunner({
      'merge-base origin/main HEAD': { ok: true, output: 'base' },
    })
    await expect(
      runLintCommits({ git, spawnCommand: vi.fn() }),
    ).rejects.toThrow(/could not resolve HEAD/)
  })
})
