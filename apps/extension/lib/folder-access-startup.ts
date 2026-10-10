import { i18n } from '#i18n'

import { setFailureBadge } from '@/lib/auto-export'
import { notifyAutoExportFailure } from '@/lib/auto-export-notification'
import { loadFolderHandle, queryFolderAccess } from '@/lib/folder-handle'
import { autoExportConfigStore } from '@/lib/storage'

/**
 * Warns on browser start when Auto-export targets a Custom folder whose
 * Folder access is not `granted`, so the user finds out before a run fails.
 * Shows the Failure notification (when enabled) and sets the failure badge.
 * Never throws.
 * @returns Resolves once the check, and any warning, has settled.
 */
export async function checkFolderAccessAtStartup(): Promise<void> {
  try {
    const config = await autoExportConfigStore.getValue()
    if (!config.enabled || config.destination !== 'folder') return
    const handle = await loadFolderHandle()
    const access = handle ? await queryFolderAccess(handle) : 'missing'
    if (access === 'granted') return
    const folderName = handle?.name ?? config.folderName ?? ''
    await notifyAutoExportFailure(
      i18n.t('autoExportFailure_folderAccessNeeded', [folderName]),
    )
    await setFailureBadge()
  } catch (error) {
    console.error(error)
  }
}
