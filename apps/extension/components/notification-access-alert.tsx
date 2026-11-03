import { i18n } from '#i18n'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import { CircleAlertIcon } from 'lucide-react'

interface NotificationAccessAlertProperties {
  onAllow: () => void
}

/**
 * Alert shown while the failure notification setting is on but Notification
 * access is missing, with an Allow button that asks for it.
 * @param properties The component props.
 * @param properties.onAllow Called from the button's click handler.
 * @returns The alert element.
 */
export function NotificationAccessAlert({
  onAllow,
}: NotificationAccessAlertProperties) {
  return (
    <Alert>
      <CircleAlertIcon />
      <AlertTitle>
        {i18n.t('autoExportPage_notificationAccessTitle')}
      </AlertTitle>
      <AlertDescription>
        {i18n.t('autoExportPage_notificationAccessDescription')}
      </AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm" onClick={onAllow}>
          {i18n.t('autoExportPage_notificationAccessAllow')}
        </Button>
      </AlertAction>
    </Alert>
  )
}
