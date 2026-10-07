import { i18n } from '#i18n'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@workspace/ui/components/item'
import { Spinner } from '@workspace/ui/components/spinner'
import {
  CircleAlertIcon,
  DownloadIcon,
  ShieldIcon,
  Undo2Icon,
} from 'lucide-react'
import { useRef, useState } from 'react'

import { countBookmarks } from '@/lib/count-bookmarks'
import { formatCount } from '@/lib/format-count'
import { formatSnapshotDate } from '@/lib/format-snapshot-date'
import { withImportLock } from '@/lib/import-lock'
import {
  downloadSafetySnapshot,
  restoreSafetySnapshot,
  safetySnapshotStore,
  takeSafetySnapshot,
} from '@/lib/safety-snapshot'
import type { SafetySnapshot } from '@/lib/safety-snapshot'
import { useStorageItem } from '@/lib/use-storage-item'

type CardStatus =
  | 'idle'
  | 'restoring'
  | 'restored'
  | 'taking'
  | 'take-error'
  | 'download-error'
  | 'restore-error'

/**
 * The Settings card for Safety snapshots: a Take a snapshot now button and
 * the stored list, newest first, each row with its date, bookmark count and
 * Download and Restore actions (Restore behind its own confirmation). The
 * newest row carries a Latest badge. Shows an empty state until a first
 * snapshot exists. Restoring takes a new snapshot first, which joins the
 * list; the other snapshots are kept.
 * @returns The snapshot list and its actions.
 */
export function SafetySnapshotCard() {
  const [snapshots] = useStorageItem(safetySnapshotStore)
  const [restoreTarget, setRestoreTarget] = useState<SafetySnapshot | null>(
    null,
  )
  const [status, setStatus] = useState<CardStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const busyGuard = useRef(false)
  const isBusy = status === 'restoring' || status === 'taking'

  const runExclusive = async (
    busyStatus: CardStatus,
    failedStatus: CardStatus,
    successStatus: CardStatus,
    action: () => Promise<unknown>,
  ) => {
    if (busyGuard.current) return
    busyGuard.current = true
    setStatus(busyStatus)
    setErrorMessage('')
    try {
      await action()
      setStatus(successStatus)
    } catch (error) {
      setStatus(failedStatus)
      setErrorMessage((error as Error).message)
    } finally {
      busyGuard.current = false
    }
  }

  const handleTake = () =>
    runExclusive('taking', 'take-error', 'idle', () =>
      withImportLock(takeSafetySnapshot),
    )

  const handleDownload = (snapshot: SafetySnapshot) =>
    runExclusive('idle', 'download-error', 'idle', () =>
      downloadSafetySnapshot(snapshot),
    )

  const handleRestore = () => {
    const target = restoreTarget
    if (!target) return Promise.resolve()
    setRestoreTarget(null)
    return runExclusive('restoring', 'restore-error', 'restored', () =>
      restoreSafetySnapshot(target),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{i18n.t('safetySnapshot_title')}</CardTitle>
        <CardDescription>
          {i18n.t('safetySnapshot_description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="self-start"
            disabled={isBusy}
            onClick={() => void handleTake()}
          >
            {status === 'taking' ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <ShieldIcon data-icon="inline-start" />
            )}
            {i18n.t(
              status === 'taking'
                ? 'safetySnapshot_taking'
                : 'safetySnapshot_take',
            )}
          </Button>

          {status === 'take-error' || status === 'download-error' ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>
                {i18n.t(
                  status === 'take-error'
                    ? 'safetySnapshot_takeFailedTitle'
                    : 'safetySnapshot_downloadFailedTitle',
                )}
              </AlertTitle>
              <AlertDescription>
                {i18n.t('safetySnapshot_failedDescription')}
              </AlertDescription>
            </Alert>
          ) : null}

          {snapshots.length > 0 ? (
            <ItemGroup>
              {snapshots.map((snapshot, index) => {
                const count = countBookmarks(snapshot.roots)
                return (
                  <Item
                    key={snapshot.takenAt}
                    variant="muted"
                    data-testid="safety-snapshot-row"
                  >
                    <ItemMedia variant="icon">
                      <ShieldIcon />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>
                        {formatSnapshotDate(snapshot.takenAt)}
                        {index === 0 && (
                          <Badge>{i18n.t('safetySnapshot_latest')}</Badge>
                        )}
                      </ItemTitle>
                      <ItemDescription>
                        {i18n.t('importPreviewCount', count, [
                          formatCount(count),
                        ])}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => void handleDownload(snapshot)}
                      >
                        <DownloadIcon data-icon="inline-start" />
                        {i18n.t('safetySnapshot_download')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => setRestoreTarget(snapshot)}
                      >
                        <Undo2Icon data-icon="inline-start" />
                        {i18n.t('safetySnapshot_restore')}
                      </Button>
                    </ItemActions>
                  </Item>
                )
              })}
            </ItemGroup>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShieldIcon />
                </EmptyMedia>
                <EmptyTitle>{i18n.t('safetySnapshot_emptyTitle')}</EmptyTitle>
                <EmptyDescription>
                  {i18n.t('safetySnapshot_emptyDescription')}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {status === 'restored' && (
            <Alert role="status">
              <AlertDescription>
                {i18n.t('safetySnapshot_restored')}
              </AlertDescription>
            </Alert>
          )}
          {status === 'restore-error' && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>

      <AlertDialog
        open={restoreTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {i18n.t('safetySnapshot_restoreTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {i18n.t('safetySnapshot_restoreDescription', [
                restoreTarget ? formatSnapshotDate(restoreTarget.takenAt) : '',
              ])}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n.t('cancel')}</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isBusy}
              onClick={() => void handleRestore()}
            >
              {i18n.t('safetySnapshot_restoreConfirm')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
