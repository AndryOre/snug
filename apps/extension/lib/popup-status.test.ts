import { describe, expect, it } from 'vitest'

import { resolvePopupStatus } from '@/lib/popup-status'
import type { AutoExportConfig, AutoExportLastRun } from '@/lib/types'

const enabledConfig: AutoExportConfig = {
  enabled: true,
  interval: '1d',
  preferredTime: '00:00',
  dayOfWeek: 1,
  path: 'bookmarks-backup/',
  formats: ['html'],
  keepLast: 10,
  destination: 'downloads',
  folderName: null,
}

const failedRun: AutoExportLastRun = {
  at: 1000,
  ok: false,
  error: 'Download failed',
  trigger: 'scheduled',
}

describe('resolvePopupStatus', () => {
  it('reports off when auto-export is disabled', () => {
    expect(
      resolvePopupStatus({
        config: { ...enabledConfig, enabled: false },
        nextRun: null,
        lastRun: null,
      }),
    ).toEqual({ kind: 'off' })
  })

  it('reports the next run when enabled and scheduled', () => {
    expect(
      resolvePopupStatus({
        config: enabledConfig,
        nextRun: 5000,
        lastRun: null,
      }),
    ).toEqual({ kind: 'next-run', nextRun: 5000 })
  })

  it('reports off when enabled but nothing is scheduled', () => {
    expect(
      resolvePopupStatus({
        config: enabledConfig,
        nextRun: null,
        lastRun: null,
      }),
    ).toEqual({ kind: 'off' })
  })

  it('prioritizes a failed last run over the next run', () => {
    expect(
      resolvePopupStatus({
        config: enabledConfig,
        nextRun: 5000,
        lastRun: failedRun,
      }),
    ).toEqual({ kind: 'failed' })
  })

  it('ignores a successful last run', () => {
    expect(
      resolvePopupStatus({
        config: enabledConfig,
        nextRun: 5000,
        lastRun: { at: 1, ok: true, trigger: 'manual' },
      }),
    ).toEqual({ kind: 'next-run', nextRun: 5000 })
  })

  it.each(['prompt', 'denied', 'missing'] as const)(
    'reports folder access needed for a Custom folder with %s access, over a failed run',
    (folderAccess) => {
      expect(
        resolvePopupStatus({
          config: {
            ...enabledConfig,
            destination: 'folder',
            folderName: 'Backups',
          },
          nextRun: 5000,
          lastRun: failedRun,
          folderAccess,
        }),
      ).toEqual({ kind: 'folder-access', folderName: 'Backups' })
    },
  )

  it('ignores folder access when granted, unknown, or for Downloads', () => {
    const folderConfig = {
      ...enabledConfig,
      destination: 'folder',
      folderName: 'Backups',
    } as const
    const expected = { kind: 'next-run', nextRun: 5000 }
    expect(
      resolvePopupStatus({
        config: folderConfig,
        nextRun: 5000,
        lastRun: null,
        folderAccess: 'granted',
      }),
    ).toEqual(expected)
    expect(
      resolvePopupStatus({
        config: folderConfig,
        nextRun: 5000,
        lastRun: null,
        folderAccess: null,
      }),
    ).toEqual(expected)
    expect(
      resolvePopupStatus({
        config: enabledConfig,
        nextRun: 5000,
        lastRun: null,
        folderAccess: 'prompt',
      }),
    ).toEqual(expected)
  })
})
