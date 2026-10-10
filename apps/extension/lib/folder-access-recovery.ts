import { clearFailureBadge } from '@/lib/auto-export'
import {
  loadFolderHandle,
  queryFolderAccess,
  requestFolderAccess,
} from '@/lib/folder-handle'
import type { FolderAccess } from '@/lib/folder-handle'

/**
 * What the Auto-export page shows for the Folder access recovery alert.
 * `hidden` means access is granted (or the destination is not a Custom
 * folder), `needed` is the first prompt, `refused` follows a declined request.
 */
export type FolderAccessAlertState = 'hidden' | 'needed' | 'refused'

/**
 * Outcome of one Allow access attempt. `missing` means no handle is stored, so
 * the page falls back to the Choose folder state.
 */
export type AllowAccessResult = 'granted' | 'refused' | 'missing'

/**
 * Decides whether the recovery alert is shown.
 * @param input The destination, the queried access and whether the last
 *   Allow access request was declined.
 * @param input.isFolderDestination Whether the Custom folder is the Export
 *   destination and a folder is chosen.
 * @param input.access The queried Folder access, `null` while unknown.
 * @param input.wasRefused Whether the last Allow access request was declined.
 * @returns The alert state.
 */
export function resolveFolderAccessAlert(input: {
  isFolderDestination: boolean
  access: FolderAccess | null
  wasRefused: boolean
}): FolderAccessAlertState {
  const { isFolderDestination, access, wasRefused } = input
  if (!isFolderDestination || access === null || access === 'granted') {
    return 'hidden'
  }
  return wasRefused ? 'refused' : 'needed'
}

/**
 * Requests Folder access for the stored handle. Call it directly inside the
 * Allow access click so the browser sees the user gesture. Granting access
 * clears the extension badge; nothing is ever written to Downloads instead.
 * @returns `granted`, `refused`, or `missing` when no handle is stored.
 */
export async function allowFolderAccess(): Promise<AllowAccessResult> {
  const handle = await loadFolderHandle()
  if (!handle) return 'missing'
  const state = await requestFolderAccess(handle)
  if (state !== 'granted') return 'refused'
  await clearFailureBadge()
  return 'granted'
}

/**
 * Queries the stored folder's Folder access without prompting.
 * @returns The access, or `missing` when no handle is stored.
 */
export async function readFolderAccess(): Promise<FolderAccess> {
  const handle = await loadFolderHandle()
  return handle ? queryFolderAccess(handle) : 'missing'
}
