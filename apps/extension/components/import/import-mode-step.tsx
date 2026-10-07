import { i18n } from '#i18n'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@workspace/ui/components/field'
import {
  RadioGroup,
  RadioGroupItem,
} from '@workspace/ui/components/radio-group'
import { TriangleAlertIcon } from 'lucide-react'

import type { ImportMode } from '@/lib/types'

interface ModeOption {
  value: ImportMode
  label: string
  description: string
}

interface ImportModeStepProperties {
  value: ImportMode
  onChange: (mode: ImportMode) => void
  hasLocationData: boolean
  isReplaceDisabled?: boolean
  disabled: boolean
}

function getModeOptions(): ModeOption[] {
  return [
    {
      value: 'folder',
      label: i18n.t('importModeFolder'),
      description: i18n.t('importModeFolderDescription'),
    },
    {
      value: 'restore-merge',
      label: i18n.t('importModeRestoreMerge'),
      description: i18n.t('importModeRestoreMergeDescription'),
    },
    {
      value: 'restore-replace',
      label: i18n.t('importModeRestoreReplace'),
      description: i18n.t('importModeRestoreReplaceDescription'),
    },
  ]
}

/**
 * Radio choice cards for how the file is written into the existing
 * bookmarks. The two restore modes are disabled, with the reason shown on the
 * card, when the file has no location data. Choosing "Restore - replace"
 * surfaces a destructive warning.
 * @param root0 This component's properties.
 * @param root0.value The selected mode.
 * @param root0.onChange Called with the newly selected mode.
 * @param root0.hasLocationData Whether the restore modes are available.
 * @param root0.isReplaceDisabled Whether "Restore - replace" is unavailable
 * because two or more files are chosen.
 * @param root0.disabled Whether the whole group is disabled (import in flight).
 * @returns The mode choice cards.
 */
export function ImportModeStep({
  value,
  onChange,
  hasLocationData,
  isReplaceDisabled = false,
  disabled,
}: ImportModeStepProperties) {
  return (
    <div className="flex flex-col gap-3">
      <RadioGroup
        value={value}
        disabled={disabled}
        aria-label={i18n.t('importMode')}
        onValueChange={(next) => onChange(next as ImportMode)}
      >
        {getModeOptions().map((option) => {
          const isRestoreUnavailable =
            !hasLocationData && option.value !== 'folder'
          const isBatchBlocked =
            isReplaceDisabled && option.value === 'restore-replace'
          const isUnavailable = isRestoreUnavailable || isBatchBlocked
          const id = `import-mode-${option.value}`

          return (
            <FieldLabel key={option.value} htmlFor={id}>
              <Field
                orientation="horizontal"
                data-disabled={isUnavailable || undefined}
              >
                <FieldContent>
                  <FieldTitle>{option.label}</FieldTitle>
                  <FieldDescription>
                    {isUnavailable
                      ? i18n.t(
                          isRestoreUnavailable
                            ? 'import_restoreUnavailable'
                            : 'importBatchReplaceNeedsOneFile',
                        )
                      : option.description}
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem
                  value={option.value}
                  id={id}
                  aria-label={option.label}
                  disabled={isUnavailable}
                />
              </Field>
            </FieldLabel>
          )
        })}
      </RadioGroup>

      {value === 'restore-replace' && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertDescription>
            {i18n.t('importModeRestoreReplaceWarning')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
