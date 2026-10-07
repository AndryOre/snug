import { i18n } from '#i18n'
import { Link } from '@tanstack/react-router'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import { useState } from 'react'

import { APP_ROUTES } from '@/lib/app-url'
import { snapshotFileName } from '@/lib/safety-snapshot'

/**
 * @param message The localized note with the file name inlined.
 * @param fileName The file name inlined in `message`.
 * @returns The note split around the file name so the name can be styled.
 */
function splitAroundFileName(
  message: string,
  fileName: string,
): [string, string] {
  const index = message.indexOf(fileName)
  return index === -1
    ? [message, '']
    : [message.slice(0, index), message.slice(index + fileName.length)]
}

/**
 * Second paragraph of the Restore-replace warning: names the Safety snapshot
 * file saved to Downloads, says it is kept in Settings, and links there.
 * The App links in the same tab; the popup passes `onOpenSettings` to open
 * the App in a new tab instead.
 * @param props The component props.
 * @param props.onOpenSettings Opens Settings from the popup, where a router
 * link cannot navigate the App.
 * @returns The note and its Settings link.
 */
export function ReplaceSnapshotNote({
  onOpenSettings,
}: {
  onOpenSettings?: () => void
}) {
  const [fileName] = useState(() => snapshotFileName(Date.now()))
  const [before, after] = splitAroundFileName(
    i18n.t('replaceSnapshotNote', [fileName]),
    fileName,
  )
  const linkLabel = i18n.t('replaceSnapshotSettingsLink')

  return (
    <div className="flex flex-col items-start gap-1">
      <p>
        {before}
        <span className="font-mono text-xs break-all">{fileName}</span>
        {after}
      </p>
      {onOpenSettings ? (
        <Button variant="link" size="sm" onClick={onOpenSettings}>
          {linkLabel}
        </Button>
      ) : (
        <Link
          to={APP_ROUTES.settings}
          className={buttonVariants({ variant: 'link', size: 'sm' })}
        >
          {linkLabel}
        </Link>
      )}
    </div>
  )
}
