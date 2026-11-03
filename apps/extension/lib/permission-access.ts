/**
 * The optional permissions Snug asks for at the moment a feature needs them:
 * `downloads` is Downloads access, `notifications` is Notification access.
 */
export type AccessPermission = 'downloads' | 'notifications'

/**
 * A change reported by {@link watchAccessChanges}.
 */
export interface AccessChange {
  permission: AccessPermission
  isGranted: boolean
}

const ACCESS_PERMISSIONS: readonly AccessPermission[] = [
  'downloads',
  'notifications',
]

/**
 * Whether every named permission is currently granted. Never throws: a missing
 * `browser.permissions` API or a rejected lookup counts as not granted (the
 * rejection is logged).
 * @param permissions The permissions to check.
 * @returns `true` only when all of them are granted.
 */
async function hasAccess(...permissions: AccessPermission[]): Promise<boolean> {
  try {
    return await browser.permissions.contains({ permissions })
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Whether Downloads access is granted.
 * @returns `true` when the `downloads` permission is held.
 */
export function hasDownloadsAccess(): Promise<boolean> {
  return hasAccess('downloads')
}

/**
 * Whether Notification access is granted.
 * @returns `true` when the `notifications` permission is held.
 */
export function hasNotificationAccess(): Promise<boolean> {
  return hasAccess('notifications')
}

/**
 * Asks the browser for the named permissions in one prompt. Call it
 * synchronously from a user gesture, before any `await`, or the browser
 * rejects the request. Never throws: a rejected request counts as denied
 * (the rejection is logged).
 * @param permissions The permissions to request together.
 * @returns `true` when the user approved all of them.
 */
export async function didUserGrantAccess(
  ...permissions: AccessPermission[]
): Promise<boolean> {
  try {
    return await browser.permissions.request({ permissions })
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Subscribes to grants and revocations of Downloads and Notification access.
 * Other permission changes are ignored.
 * @param listener Called once per affected access permission.
 * @returns A function that removes both subscriptions.
 */
export function watchAccessChanges(
  listener: (change: AccessChange) => void,
): () => void {
  const report =
    (isGranted: boolean) => (changed: { permissions?: string[] }) => {
      for (const permission of ACCESS_PERMISSIONS) {
        if (changed.permissions?.includes(permission)) {
          listener({ permission, isGranted })
        }
      }
    }
  const onAdded = report(true)
  const onRemoved = report(false)
  browser.permissions.onAdded.addListener(onAdded)
  browser.permissions.onRemoved.addListener(onRemoved)
  return () => {
    browser.permissions.onAdded.removeListener(onAdded)
    browser.permissions.onRemoved.removeListener(onRemoved)
  }
}
