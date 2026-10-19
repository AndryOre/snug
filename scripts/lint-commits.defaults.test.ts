import { beforeEach, describe, expect, test, vi } from 'vitest'

import { resolveCommitlintBase, runLintCommits } from './lint-commits'

function fakeChild(event: string, payload: unknown): object {
  const child = {
    on(name: string, listener: (value: unknown) => void) {
      if (name === event)
        queueMicrotask(() => {
          listener(payload)
        })
      return child
    },
  }
  return child
}

const childProcess = vi.hoisted(() => ({
  spawn: vi.fn(),
  spawnSync: vi.fn(),
}))

vi.mock('node:child_process', () => childProcess)

function stubGit(responses: Record<string, string | undefined>): void {
  childProcess.spawnSync.mockImplementation(
    (_command: string, arguments_: string[]) => {
      const stdout = responses[arguments_.join(' ')]
      return stdout === undefined
        ? { status: 128, stdout: '', stderr: ' fatal \n' }
        : { status: 0, stdout: `${stdout}\n`, stderr: '' }
    },
  )
}

function stubChild(exitCode: number | null): void {
  childProcess.spawn.mockImplementation(() => {
    return fakeChild('close', exitCode)
  })
}

describe('default dependencies', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('runs the real git runner and trims its output', () => {
    stubGit({ 'merge-base origin/main HEAD': 'abc123' })
    expect(resolveCommitlintBase()).toBe('abc123')
    expect(childProcess.spawnSync).toHaveBeenCalledWith(
      'git',
      ['merge-base', 'origin/main', 'HEAD'],
      { encoding: 'utf8' },
    )
  })

  test('propagates the commitlint exit code from the spawned process', async () => {
    stubGit({
      'merge-base origin/main HEAD': 'base',
      'rev-parse HEAD': 'head',
    })
    stubChild(5)
    await expect(runLintCommits()).resolves.toBe(5)
    expect(childProcess.spawn).toHaveBeenCalledWith(
      'bunx',
      ['commitlint', '--from', 'base', '--to', 'HEAD', '--verbose'],
      { stdio: 'inherit' },
    )
  })

  test('maps a signal exit to code 1', async () => {
    stubGit({
      'merge-base origin/main HEAD': 'base',
      'rev-parse HEAD': 'head',
    })
    stubChild(null)
    await expect(runLintCommits()).resolves.toBe(1)
  })

  test('rejects when the process fails to spawn', async () => {
    stubGit({
      'merge-base origin/main HEAD': 'base',
      'rev-parse HEAD': 'head',
    })
    childProcess.spawn.mockImplementation(() => {
      return fakeChild('error', new Error('spawn failed'))
    })
    await expect(runLintCommits()).rejects.toThrow('spawn failed')
  })
})
