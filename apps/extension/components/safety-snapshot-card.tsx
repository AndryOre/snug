import { i18n } from '#i18n'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
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
  ItemMedia,
  ItemTitle,
} from '@workspace/ui/components/item'
import { Spinner } from '@workspace/ui/components/spinner'
import { ArchiveIcon, CircleAlertIcon } from 'lucide-react'
import { useRef, useState } from 'react'

import { countBookmarks } from '@/lib/count-bookmarks'
import { formatCount } from '@/lib/format-count'
import { formatSnapshotDate } from '@/lib/format-snapshot-date'
import {
  restoreSafetySnapshot,
  safetySnapshotStore,
} from '@/lib/safety-snapshot'
import { useStorageItem } from '@/lib/use-storage-item'

type RestoreStatus = 'idle' | 'restoring' | 'restored' | 'error'

/**
 * The Settings card for the Safety snapshot: when it was taken, how many
 * bookmarks it holds, that the same copy is a file in Downloads, and a
 * Restore snapshot button behind its own confirmation. Shows an empty state
 * until a first snapshot exists. Restoring takes a new snapshot first, so the
 * card then shows that newer one.
 * @returns The snapshot details and restore action.
 */
export function SafetySnapshotCard() {
  const [snapshot] = useStorageItem(safetySnapshotStore)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [status, setStatus] = useState<RestoreStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const restoreGuard = useRef(false)
  const isRestoring = status === 'restoring'

  const handleRestore = async () => {
    if (!snapshot || restoreGuard.current) return
    restoreGuard.current = true
    setIsConfirmOpen(false)
    setStatus('restoring')
    setErrorMessage('')
    try {
      await restoreSafetySnapshot(snapshot)
      setStatus('restored')
    } catch (error) {
      setStatus('error')
      setErrorMessage((error as Error).message)
    } finally {
      restoreGuard.current = false
    }
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
          {snapshot ? (
            <Item variant="muted">
              <ItemMedia variant="icon">
                <ArchiveIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{formatSnapshotDate(snapshot.takenAt)}</ItemTitle>
                <ItemDescription>
                  <span className="block">
                    {i18n.t(
                      'importPreviewCount',
                      countBookmarks(snapshot.roots),
                      [formatCount(countBookmarks(snapshot.roots))],
                    )}
                  </span>
                  <span className="block">
                    {i18n.t('safetySnapshot_fileNote')}
                  </span>
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  variant="outline"
                  disabled={isRestoring}
                  onClick={() => setIsConfirmOpen(true)}
                >
                  {isRestoring && <Spinner data-icon="inline-start" />}
                  {i18n.t('safetySnapshot_restore')}
                </Button>
              </ItemActions>
            </Item>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ArchiveIcon />
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
          {status === 'error' && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {i18n.t('safetySnapshot_restoreTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {i18n.t('safetySnapshot_restoreDescription', [
                snapshot ? formatSnapshotDate(snapshot.takenAt) : '',
              ])}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n.t('cancel')}</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isRestoring}
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
