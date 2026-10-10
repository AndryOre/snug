import type { FolderAccess } from '@/lib/folder-handle'
import type { AutoExportConfig, AutoExportLastRun } from '@/lib/types'

export type PopupStatus =
  | { kind: 'folder-access'; folderName: string }
  | { kind: 'failed' }
  | { kind: 'next-run'; nextRun: number }
  | { kind: 'off' }

interface PopupStatusInput {
  config: AutoExportConfig
  nextRun: number | null
  lastRun: AutoExportLastRun | null
  folderAccess?: FolderAccess | null
}

/**
 * Decides which auto-export state the popup status item shows. Missing
 * Folder access for an enabled Custom folder takes priority over everything;
 * a failed last run takes priority over a scheduled next run; auto-export
 * counts as off when disabled or when nothing is scheduled.
 * @param input The stored config, next due time, normalized last run and the
 *   Custom folder's Folder access (`null` while still unknown).
 * @returns The status variant to render.
 */
export function resolvePopupStatus(input: PopupStatusInput): PopupStatus {
  const { config, nextRun, lastRun, folderAccess } = input
  const requiresFolderAccess =
    folderAccess !== null &&
    folderAccess !== undefined &&
    folderAccess !== 'granted'
  if (
    requiresFolderAccess &&
    config.enabled &&
    config.destination === 'folder'
  ) {
    return { kind: 'folder-access', folderName: config.folderName ?? '' }
  }
  if (lastRun !== null && !lastRun.ok) return { kind: 'failed' }
  return nextRun !== null && config.enabled
    ? { kind: 'next-run', nextRun }
    : { kind: 'off' }
}
