import { i18n } from '#i18n'
import { Button } from '@workspace/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import { CircleCheckIcon } from 'lucide-react'

interface ImportAllDuplicatesProperties {
  onTurnOffSkipDuplicates: () => void
}

/**
 * Empty state of the Import preview when Skip duplicates leaves nothing to
 * create: every bookmark in the file is already in the browser. Offers to
 * turn Skip duplicates off so they can be imported again.
 * @param root0 This component's properties.
 * @param root0.onTurnOffSkipDuplicates Called when the action is pressed.
 * @returns The empty state.
 */
export function ImportAllDuplicates({
  onTurnOffSkipDuplicates,
}: ImportAllDuplicatesProperties) {
  return (
    <div className="rounded-lg border">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleCheckIcon />
          </EmptyMedia>
          <EmptyTitle>{i18n.t('import_allDuplicatesTitle')}</EmptyTitle>
          <EmptyDescription>
            {i18n.t('import_allDuplicatesDescription')}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTurnOffSkipDuplicates}
          >
            {i18n.t('import_allDuplicatesAction')}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
