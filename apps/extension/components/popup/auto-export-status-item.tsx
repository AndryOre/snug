import { i18n } from '#i18n'
import { Button } from '@workspace/ui/components/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@workspace/ui/components/item'
import {
  CalendarClockIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { APP_ROUTES, getAppUrl } from '@/lib/app-url'
import { readAutoExportLastRun } from '@/lib/auto-export'
import { getAutoExportErrorMessage } from '@/lib/auto-export-error'
import { resolveEffectiveDestination } from '@/lib/auto-export-form'
import { canPickFolder, queryStoredFolderAccess } from '@/lib/folder-handle'
import type { FolderAccess } from '@/lib/folder-handle'
import { hasDownloadsAccess, watchAccessChanges } from '@/lib/permission-access'
import { resolvePopupStatus } from '@/lib/popup-status'
import {
  autoExportConfigStore,
  autoExportLastRunStore,
  autoExportNextRunStore,
} from '@/lib/storage'
import type { AutoExportLastRun } from '@/lib/types'
import { useStorageItem } from '@/lib/use-storage-item'

/**
 * Reactively reads the last Auto-export run, migrating legacy stored shapes.
 * @returns The last run, or `null` when none has run.
 */
export function useAutoExportLastRun(): AutoExportLastRun | null {
  const [lastRun, setLastRun] = useState<AutoExportLastRun | null>(null)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      const value = await readAutoExportLastRun()
      if (isMounted) setLastRun(value)
    }
    void load()
    const unwatch = autoExportLastRunStore.watch(() => {
      void load()
    })
    return () => {
      isMounted = false
      unwatch()
    }
  }, [])

  return lastRun
}

/**
 * Reads the Custom folder's Folder access once, only when the destination is a
 * Custom folder.
 * @param isFolderDestination Whether the Export destination is a Custom folder.
 * @returns The Folder access, or `null` while unknown or not applicable.
 */
function useFolderAccess(isFolderDestination: boolean): FolderAccess | null {
  const [folderAccess, setFolderAccess] = useState<FolderAccess | null>(null)

  useEffect(() => {
    if (!isFolderDestination) return
    let isMounted = true
    const load = async () => {
      try {
        const access = await queryStoredFolderAccess()
        if (isMounted) setFolderAccess(access)
      } catch (error) {
        console.error(error)
      }
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [isFolderDestination])

  return isFolderDestination ? folderAccess : null
}

/**
 * Reads whether Downloads access is held, and keeps it current as the user
 * grants or revokes it.
 * @param isDownloadsDestination Whether the Export destination is Downloads.
 * @returns `false` only once Downloads access is known to be missing.
 */
function useHasDownloadsAccess(isDownloadsDestination: boolean): boolean {
  const [hasAccess, setHasAccess] = useState(true)

  useEffect(() => {
    if (!isDownloadsDestination) return
    let isMounted = true
    const load = async () => {
      const isHeld = await hasDownloadsAccess()
      if (isMounted) setHasAccess(isHeld)
    }
    void load()
    const unwatch = watchAccessChanges((change) => {
      if (change.permission === 'downloads') setHasAccess(change.isGranted)
    })
    return () => {
      isMounted = false
      unwatch()
    }
  }, [isDownloadsDestination])

  return hasAccess
}

function formatShortDateTime(at: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(at))
}

/**
 * Popup status item reporting auto-export's state (next run, off, last
 * run failed, or Folder access needed) as a muted `Item`. Except for the
 * Folder access row, whose button opens the Auto-export route, it opens the App's Auto-export route in a
 * new tab.
 * @returns The status item link.
 */
export function AutoExportStatusItem() {
  const [config] = useStorageItem(autoExportConfigStore)
  const [nextRun] = useStorageItem(autoExportNextRunStore)
  const lastRun = useAutoExportLastRun()
  const destination = resolveEffectiveDestination(
    config.destination,
    canPickFolder(),
  )
  const folderAccess = useFolderAccess(destination === 'folder')
  const status = resolvePopupStatus({
    config: { ...config, destination },
    nextRun,
    lastRun,
    folderAccess,
  })
  const isDownloadsExport = config.enabled && destination === 'downloads'
  const hasDownloads = useHasDownloadsAccess(isDownloadsExport)

  if (!hasDownloads && isDownloadsExport) {
    return (
      <Item variant="muted" size="sm">
        <ItemMedia variant="icon">
          <TriangleAlertIcon className="size-3.5 text-destructive" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{i18n.t('popup_statusDownloadsAccessTitle')}</ItemTitle>
          <Button
            variant="outline"
            size="sm"
            className="mt-1 self-start"
            render={
              // eslint-disable-next-line jsx-a11y-js/anchor-has-content -- Button's render prop injects the children into this anchor
              <a
                href={getAppUrl(APP_ROUTES.autoExport)}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            {i18n.t('popup_statusDownloadsAccessAction')}
          </Button>
        </ItemContent>
      </Item>
    )
  }

  if (status.kind === 'folder-access') {
    return (
      <Item variant="muted" size="sm">
        <ItemMedia variant="icon">
          <TriangleAlertIcon className="text-destructive" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{i18n.t('popup_statusFolderAccessTitle')}</ItemTitle>
          <ItemDescription>
            {i18n.t('popup_statusFolderAccessDescription', [status.folderName])}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            variant="outline"
            size="sm"
            render={
              // eslint-disable-next-line jsx-a11y-js/anchor-has-content -- Button's render prop injects the children into this anchor
              <a
                href={getAppUrl(APP_ROUTES.autoExport)}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            {i18n.t('popup_statusFolderAccessAction')}
          </Button>
        </ItemActions>
      </Item>
    )
  }

  let title: string
  let description: string
  switch (status.kind) {
    case 'failed': {
      title = i18n.t('popup_statusFailedTitle')
      description = getAutoExportErrorMessage(
        lastRun?.errorCode,
        i18n.t('popup_statusFailedDescription'),
      )
      break
    }
    case 'next-run': {
      title = i18n.t('popup_statusNextRunTitle')
      description = formatShortDateTime(status.nextRun)
      break
    }
    case 'off': {
      title = i18n.t('popup_statusOffTitle')
      description = i18n.t('popup_statusOffDescription')
      break
    }
  }

  return (
    <Item
      variant="muted"
      size="sm"
      render={
        // eslint-disable-next-line jsx-a11y-js/anchor-has-content -- Item's render prop injects the children into this anchor
        <a
          href={getAppUrl(APP_ROUTES.autoExport)}
          target="_blank"
          rel="noreferrer"
        />
      }
    >
      <ItemMedia variant="icon">
        {status.kind === 'failed' ? (
          <CircleAlertIcon className="text-destructive" />
        ) : (
          <CalendarClockIcon />
        )}
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon />
      </ItemActions>
    </Item>
  )
}
