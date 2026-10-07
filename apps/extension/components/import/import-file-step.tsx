import { i18n } from '#i18n'
import { Button } from '@workspace/ui/components/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@workspace/ui/components/item'
import { cn } from '@workspace/ui/lib/utils'
import {
  CircleAlertIcon,
  FileIcon,
  FileUpIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

const ACCEPTED_FILE_TYPES = '.csv,.json,.html,.htm,.xbel,.xml'

/**
 * One row of the file step: a chosen file with its format and bookmark count,
 * or the reason it cannot be imported.
 */
export interface ImportFileRow {
  id: string
  name: string
  description: string
  isInvalid: boolean
}

interface ImportFileStepProperties {
  rows: ImportFileRow[]
  onFiles: (files: File[]) => void
  onRemove: (id: string) => void
  disabled: boolean
}

/**
 * Lets the user provide several bookmark files by dropping them on a dashed
 * zone or opening the native multi-file picker. Chosen files become a list of
 * rows (format and count, or the reason the file is invalid) each with a
 * remove button, followed by an "Add files" action; dropping on the list adds
 * files too. The file input stays in the accessibility tree (visually hidden)
 * so the zone is keyboard-operable.
 * @param root0 This component's properties.
 * @param root0.rows The chosen files as rows, in pick order.
 * @param root0.onFiles Called with every dropped or picked file.
 * @param root0.onRemove Called with the id of the row to remove.
 * @param root0.disabled Whether picking is disabled (import in flight).
 * @returns The drop zone, or the file rows with the add action.
 */
export function ImportFileStep({
  rows,
  onFiles,
  onRemove,
  disabled,
}: ImportFileStepProperties) {
  const inputId = useId()
  const inputReference = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const focusRestoreRequest = useRef(false)
  const pickerButtonReference = useRef<HTMLButtonElement | null>(null)

  const restoreFocusToPicker = (element: HTMLButtonElement | null) => {
    pickerButtonReference.current = element
    if (!element || element.disabled || !focusRestoreRequest.current) return
    focusRestoreRequest.current = false
    element.focus()
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    const dropped = [...event.dataTransfer.files]
    if (!disabled && dropped.length > 0) onFiles(dropped)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = [...(event.target.files ?? [])]
    if (selected.length > 0) {
      const activeElement = document.activeElement
      focusRestoreRequest.current =
        activeElement === event.target ||
        (activeElement !== null &&
          activeElement === pickerButtonReference.current)
      onFiles(selected)
    }
    event.target.value = ''
  }

  const fileInput = (
    <input
      id={inputId}
      ref={inputReference}
      type="file"
      multiple
      accept={ACCEPTED_FILE_TYPES}
      className="peer sr-only"
      disabled={disabled}
      aria-label={i18n.t('import_fileInputLabel')}
      onChange={handleChange}
    />
  )

  const body =
    rows.length > 0 ? (
      <div
        className={cn(
          'flex flex-col gap-3 rounded-lg',
          isDragging && 'ring-2 ring-primary',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ItemGroup>
          {rows.map((row) => (
            <Item key={row.id} variant="outline" size="sm">
              <ItemMedia variant="icon">
                {row.isInvalid ? (
                  <CircleAlertIcon className="text-destructive" />
                ) : (
                  <FileIcon />
                )}
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="break-all">{row.name}</ItemTitle>
                <ItemDescription>
                  {row.isInvalid ? (
                    <span className="text-destructive">{row.description}</span>
                  ) : (
                    row.description
                  )}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  aria-label={i18n.t('import_removeFile', [row.name])}
                  onClick={() => onRemove(row.id)}
                >
                  <XIcon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
        <div>
          <Button
            ref={restoreFocusToPicker}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputReference.current?.click()}
          >
            <PlusIcon data-icon="inline-start" />
            {i18n.t('import_addFiles')}
          </Button>
        </div>
      </div>
    ) : (
      <label
        htmlFor={inputId}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors select-none peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 hover:bg-muted/50',
          isDragging ? 'border-primary bg-primary/5' : 'border-border',
        )}
      >
        <FileUpIcon className="size-8 text-muted-foreground" aria-hidden />
        <span className="text-sm font-medium">{i18n.t('dropFileHere')}</span>
        <span className="text-xs text-muted-foreground">
          {i18n.t('orClickToSelect')}
        </span>
        <span className="text-xs text-muted-foreground">
          {i18n.t('supportedFormats')}
        </span>
      </label>
    )

  return (
    <>
      {fileInput}
      {body}
    </>
  )
}
