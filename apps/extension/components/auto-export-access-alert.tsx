import { i18n } from '#i18n'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import { CircleAlertIcon, InfoIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { didUserGrantAccess } from '@/lib/permission-access'
import type { AccessPermission } from '@/lib/permission-access'

/**
 * Asks for the named permissions as the very first step, then runs `commit`
 * only when the user approved them. The request is issued synchronously, so a
 * click handler that returns this call keeps the browser's user gesture.
 * @param permissions The permissions to request in one prompt.
 * @param commit The change to apply once access is granted.
 * @returns `true` when access was granted and `commit` ran, `false` when it
 *   was denied and nothing was committed.
 */
export async function didCommitWithAccess(
  permissions: AccessPermission[],
  commit: () => Promise<void>,
): Promise<boolean> {
  const isGranted = await didUserGrantAccess(...permissions)
  if (!isGranted) return false
  await commit()
  return true
}

interface AutoExportAccessAlertProperties {
  onAllow: () => void
}

/**
 * Alert shown while the Export destination is Downloads and Downloads access
 * is missing, with an Allow button that asks for it again.
 * @param properties The component props.
 * @param properties.onAllow Called from the button's click handler.
 * @returns The destructive alert element.
 */
export function AutoExportAccessAlert({
  onAllow,
}: AutoExportAccessAlertProperties) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{i18n.t('autoExportPage_downloadsAccessTitle')}</AlertTitle>
      <AlertDescription>
        {i18n.t('autoExportPage_downloadsAccessDescription')}
      </AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm" onClick={onAllow}>
          {i18n.t('autoExportPage_allowAccess')}
        </Button>
      </AlertAction>
    </Alert>
  )
}

/**
 * Quiet, non-destructive status line explaining why a change was not saved.
 * @param properties The component props.
 * @param properties.children The message text.
 * @returns The inline message element.
 */
export function AccessInlineMessage({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="flex items-start gap-1.5 text-xs text-muted-foreground"
    >
      <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
