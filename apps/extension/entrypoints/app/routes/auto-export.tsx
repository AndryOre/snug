import { i18n } from '#i18n'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@workspace/ui/components/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@workspace/ui/components/input-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@workspace/ui/components/item'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Spinner } from '@workspace/ui/components/spinner'
import { Switch } from '@workspace/ui/components/switch'
import { toast } from '@workspace/ui/components/toast'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@workspace/ui/components/toggle-group'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  DownloadIcon,
  FolderIcon,
  InfoIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  AccessInlineMessage,
  AutoExportAccessAlert,
  didCommitWithAccess,
} from '@/components/auto-export-access-alert'
import { NotificationAccessAlert } from '@/components/notification-access-alert'
import { TimePicker } from '@/components/time-picker'
import {
  readAutoExportLastRun,
  RUN_MANUAL_EXPORT_MESSAGE_TYPE,
  type RunManualExportMessage,
  type RunManualExportResponse,
} from '@/lib/auto-export'
import { getAutoExportErrorMessage } from '@/lib/auto-export-error'
import {
  parseKeepLast,
  resolveEffectiveDestination,
  resolveFolder,
  resolveFormats,
} from '@/lib/auto-export-form'
import {
  EXPORT_FORMAT_INFO,
  EXPORT_FORMATS,
  type ExportFormat,
} from '@/lib/export-formats'
import {
  allowFolderAccess,
  readFolderAccess,
  resolveFolderAccessAlert,
} from '@/lib/folder-access-recovery'
import {
  canPickFolder,
  clearFolderHandle,
  type FolderAccess,
  pickFolder,
  saveFolderHandle,
} from '@/lib/folder-handle'
import { resolveNextRunStatus } from '@/lib/next-run-status'
import {
  didUserGrantAccess,
  hasDownloadsAccess,
  hasNotificationAccess,
  watchAccessChanges,
} from '@/lib/permission-access'
import {
  autoExportConfigStore,
  autoExportLastRunStore,
  autoExportNextRunStore,
  autoExportNotifyOnFailureStore,
} from '@/lib/storage'
import type {
  AutoExportConfig,
  AutoExportInterval,
  AutoExportLastRun,
  DayOfWeek,
  ExportDestination,
} from '@/lib/types'
import { useStorageItem } from '@/lib/use-storage-item'

const INTERVAL_OPTIONS: { value: AutoExportInterval; label: string }[] = [
  { value: '1h', label: 'autoExportPage_interval1h' },
  { value: '12h', label: 'autoExportPage_interval12h' },
  { value: '1d', label: 'autoExportPage_interval1d' },
  { value: '3d', label: 'autoExportPage_interval3d' },
  { value: '7d', label: 'autoExportPage_interval7d' },
]

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 1, label: 'autoExportPage_day1' },
  { value: 2, label: 'autoExportPage_day2' },
  { value: 3, label: 'autoExportPage_day3' },
  { value: 4, label: 'autoExportPage_day4' },
  { value: 5, label: 'autoExportPage_day5' },
  { value: 6, label: 'autoExportPage_day6' },
  { value: 0, label: 'autoExportPage_day0' },
]

/**
 * Mirrors the normalized last run as React state, re-reading it whenever
 * `autoExportLastRunStore` changes (the read performs a legacy migration, so
 * a raw storage read is not enough).
 * @returns The last auto-export run, or `null` if it never ran.
 */
function useLastRun(): AutoExportLastRun | null {
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
 * Formats an epoch-millisecond timestamp as a locale-aware date and time.
 * @param at Epoch milliseconds.
 * @returns The formatted string.
 */
function formatDateTime(at: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(at))
}

/**
 * Shows the discreet "Saved" toast after a setting persists.
 */
function notifySaved(): void {
  toast.add({ title: i18n.t('autoExportPage_saved'), timeout: 1500 })
}

interface StatusCardProperties {
  config: AutoExportConfig
  folder: string
  destination: ExportDestination
  isFolderMissing: boolean
}

/**
 * The status card: last-run badge, failure details, next run, and the
 * "Export now" button. Export now uses the on-screen formats, destination and
 * folder and never moves the schedule.
 * @param properties The persisted config and the on-screen folder text.
 * @param properties.config The persisted auto-export config.
 * @param properties.folder The folder text currently on screen.
 * @param properties.destination The Export destination in effect on screen.
 * @param properties.isFolderMissing Whether Custom folder is selected without
 *   a chosen folder, which blocks Export now.
 * @returns The status card element.
 */
function StatusCard({
  config,
  folder,
  destination,
  isFolderMissing,
}: StatusCardProperties) {
  const [nextRun] = useStorageItem(autoExportNextRunStore)
  const lastRun = useLastRun()
  const [isRunning, setIsRunning] = useState(false)
  const [isAccessDenied, setIsAccessDenied] = useState(false)

  const runExport = async () => {
    setIsRunning(true)
    const message: RunManualExportMessage = {
      type: RUN_MANUAL_EXPORT_MESSAGE_TYPE,
      formats: config.formats,
      path: resolveFolder(folder, config.path),
      destination,
    }
    try {
      const response = await browser.runtime.sendMessage<
        RunManualExportMessage,
        RunManualExportResponse | undefined
      >(message)
      if (response?.ok) {
        toast.add({
          title: i18n.t('exportNowSuccess'),
          type: 'success',
        })
      } else {
        toast.add({
          title: i18n.t('exportNowFailed'),
          description: getAutoExportErrorMessage(
            response?.error,
            response?.error ?? '',
          ),
          type: 'error',
        })
      }
    } catch (error) {
      toast.add({
        title: i18n.t('exportNowFailed'),
        description: error instanceof Error ? error.message : String(error),
        type: 'error',
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleExportNow = async () => {
    if (destination !== 'downloads') {
      setIsAccessDenied(false)
      await runExport()
      return
    }
    const isGranted = await didCommitWithAccess(['downloads'], runExport)
    setIsAccessDenied(!isGranted)
  }

  let lastRunBadge: React.ReactNode
  if (lastRun === null) {
    lastRunBadge = (
      <Badge variant="outline">{i18n.t('autoExportNeverRun')}</Badge>
    )
  } else if (lastRun.ok) {
    lastRunBadge = (
      <Badge variant="secondary">
        <CircleCheckIcon data-icon="inline-start" />
        {i18n.t('autoExportPage_succeeded')}
      </Badge>
    )
  } else {
    lastRunBadge = (
      <Badge variant="destructive">
        <CircleAlertIcon data-icon="inline-start" />
        {i18n.t('autoExportPage_failed')}
      </Badge>
    )
  }

  const nextRunStatus = resolveNextRunStatus(config.enabled, nextRun)
  let nextRunText: string
  if (nextRunStatus.kind === 'off') {
    nextRunText = i18n.t('autoExportPage_off')
  } else if (nextRunStatus.kind === 'scheduling') {
    nextRunText = i18n.t('autoExportScheduling')
  } else {
    nextRunText = formatDateTime(nextRunStatus.nextRun)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{i18n.t('autoExportPage_statusTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">
                {i18n.t('autoExportPage_lastRun')}
              </dt>
              <dd className="flex items-center gap-2">
                {lastRunBadge}
                {lastRun !== null && (
                  <span className="text-muted-foreground">
                    {formatDateTime(lastRun.at)}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">
                {i18n.t('autoExportPage_nextRun')}
              </dt>
              <dd>{nextRunText}</dd>
            </div>
          </dl>
          {lastRun !== null && !lastRun.ok && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>{i18n.t('autoExportPage_failureTitle')}</AlertTitle>
              <AlertDescription>
                {getAutoExportErrorMessage(
                  lastRun.errorCode,
                  lastRun.error || i18n.t('exportNowFailed'),
                )}
              </AlertDescription>
            </Alert>
          )}
          {isAccessDenied && (
            <AccessInlineMessage>
              {i18n.t('autoExportPage_accessDeniedExport')}
            </AccessInlineMessage>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={() => void handleExportNow()}
          disabled={isRunning || isFolderMissing}
        >
          {isRunning ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <DownloadIcon data-icon="inline-start" />
          )}
          {i18n.t('exportNow')}
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * The Auto-export screen: a status card above a settings card whose every
 * control persists on change (no draft, no Save button) and shows a
 * discreet "Saved" toast. The background watcher re-arms the alarm.
 * @returns The Auto-export page.
 */
export function AutoExportRoute() {
  const [config, setConfig] = useStorageItem(autoExportConfigStore)
  const [notifyOnFailure, setNotifyOnFailure] = useStorageItem(
    autoExportNotifyOnFailureStore,
  )
  const [folderDraft, setFolderDraft] = useState<string | null>(null)

  const [keepLastDraft, setKeepLastDraft] = useState<string | null>(null)

  const folder = folderDraft ?? config.path
  const isPickerAvailable = canPickFolder()
  const destination = resolveEffectiveDestination(
    config.destination,
    isPickerAvailable,
  )
  const folderName = destination === 'folder' ? config.folderName : null
  const isFolderMissing = destination === 'folder' && folderName === null
  const [folderAccess, setFolderAccess] = useState<FolderAccess | null>(null)
  const [wasAccessRefused, setWasAccessRefused] = useState(false)
  const [downloadsAccess, setDownloadsAccess] = useState<boolean | null>(null)
  const [notificationAccess, setNotificationAccess] = useState<boolean | null>(
    null,
  )
  const [accessMessage, setAccessMessage] = useState<
    'enable' | 'destination' | 'notify' | null
  >(null)
  const [isRequestingEnable, setIsRequestingEnable] = useState(false)
  const hasChosenFolder = folderName !== null
  const accessAlert = resolveFolderAccessAlert({
    isFolderDestination: hasChosenFolder,
    access: folderAccess,
    wasRefused: wasAccessRefused,
  })

  useEffect(() => {
    if (!hasChosenFolder) return
    let isMounted = true
    const refresh = async () => {
      try {
        const access = await readFolderAccess()
        if (isMounted) setFolderAccess(access)
      } catch (error) {
        console.error(error)
      }
    }
    void refresh()
    const onFocus = () => void refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      isMounted = false
      window.removeEventListener('focus', onFocus)
    }
  }, [hasChosenFolder, folderName])

  useEffect(() => {
    let isMounted = true
    const refresh = async () => {
      const [hasDownloads, hasNotifications] = await Promise.all([
        hasDownloadsAccess(),
        hasNotificationAccess(),
      ])
      if (!isMounted) return
      setDownloadsAccess(hasDownloads)
      setNotificationAccess(hasNotifications)
    }
    void refresh()
    const unwatch = watchAccessChanges((change) => {
      if (change.permission === 'downloads') {
        setDownloadsAccess(change.isGranted)
      } else {
        setNotificationAccess(change.isGranted)
      }
    })
    return () => {
      isMounted = false
      unwatch()
    }
  }, [])
  const isDownloadsAccessMissing =
    destination === 'downloads' && downloadsAccess === false
  const isNotificationAccessMissing = notificationAccess === false
  const isNotifySwitchOn = notifyOnFailure && !isNotificationAccessMissing
  const keepLast = config.keepLast ?? 10
  const keepLastText = keepLastDraft ?? String(keepLast)
  const isKeepLastInvalid = parseKeepLast(keepLastText) === null
  const isOff = !config.enabled
  const isTimeUnused = config.interval === '1h' || config.interval === '12h'
  const isWeekly = config.interval === '7d'
  const dayItems = DAY_OPTIONS.map(({ value, label }) => ({
    value: String(value),
    label: i18n.t(label as 'autoExportPage_day0'),
  }))

  const save = async (patch: Partial<AutoExportConfig>) => {
    await setConfig({ ...(await autoExportConfigStore.getValue()), ...patch })
    notifySaved()
  }

  const changeDestination = async (next: ExportDestination) => {
    if (next === destination) return
    if (next === 'downloads') {
      setAccessMessage(null)
      const isGranted = await didCommitWithAccess(['downloads'], async () => {
        await clearFolderHandle()
        await save({ destination: 'downloads', folderName: null })
      })
      if (!isGranted) setAccessMessage('destination')
      return
    }
    await save({ destination: 'folder' })
  }

  const changeEnabled = async (isEnabled: boolean) => {
    if (!isEnabled || destination !== 'downloads') {
      await save({ enabled: isEnabled })
      return
    }
    setAccessMessage(null)
    setIsRequestingEnable(true)
    try {
      const isGranted = await didCommitWithAccess(
        notifyOnFailure ? ['downloads', 'notifications'] : ['downloads'],
        () => save({ enabled: true }),
      )
      if (isGranted) return
      if (notifyOnFailure && (await hasDownloadsAccess())) {
        await setNotifyOnFailure(false)
        await save({ enabled: true })
        setAccessMessage('notify')
        return
      }
      setAccessMessage('enable')
    } finally {
      setIsRequestingEnable(false)
    }
  }

  const changeNotifyOnFailure = async (isOn: boolean) => {
    if (!isOn) {
      await setNotifyOnFailure(false)
      notifySaved()
      return
    }
    setAccessMessage(null)
    const isGranted = await didCommitWithAccess(['notifications'], async () => {
      if (!notifyOnFailure) await setNotifyOnFailure(true)
      notifySaved()
    })
    if (isGranted) setNotificationAccess(true)
    else setAccessMessage('notify')
  }

  const allowNotificationAccess = async () => {
    setAccessMessage(null)
    const isGranted = await didUserGrantAccess('notifications')
    setNotificationAccess(isGranted)
    if (!isGranted) setAccessMessage('notify')
  }

  const allowDownloadsAccess = async () => {
    const isGranted = await didUserGrantAccess('downloads')
    setDownloadsAccess(isGranted)
  }

  const chooseFolder = async () => {
    let handle: FileSystemDirectoryHandle
    try {
      handle = await pickFolder()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.add({
        title: i18n.t('exportNowFailed'),
        description: error instanceof Error ? error.message : String(error),
        type: 'error',
      })
      return
    }
    await saveFolderHandle(handle)
    await save({ destination: 'folder', folderName: handle.name })
  }

  const allowAccess = async () => {
    try {
      const result = await allowFolderAccess()
      if (result === 'missing') {
        setWasAccessRefused(false)
        await save({ folderName: null })
        return
      }
      setWasAccessRefused(result === 'refused')
      setFolderAccess(result === 'granted' ? 'granted' : 'prompt')
    } catch (error) {
      toast.add({
        title: i18n.t('exportNowFailed'),
        description: error instanceof Error ? error.message : String(error),
        type: 'error',
      })
    }
  }

  const commitFolder = async () => {
    const next = resolveFolder(folder, config.path)
    setFolderDraft(null)
    if (next !== config.path) await save({ path: next })
  }

  const commitKeepLast = async () => {
    const parsed = parseKeepLast(keepLastText)
    if (parsed === null) return
    setKeepLastDraft(null)
    if (parsed !== keepLast) await save({ keepLast: parsed })
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <StatusCard
        config={config}
        folder={folder}
        destination={destination}
        isFolderMissing={isFolderMissing}
      />
      <Card>
        <CardHeader>
          <CardTitle>{i18n.t('autoExportPage_settingsTitle')}</CardTitle>
          <CardDescription>
            {i18n.t('autoExportPage_settingsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="auto-export-enabled">
                  {i18n.t('enableAutoExport')}
                </FieldLabel>
                <FieldDescription>
                  {i18n.t('enableAutoExportDescription')}
                </FieldDescription>
              </FieldContent>
              <div className="flex items-center gap-2">
                {isRequestingEnable && <Spinner />}
                <Switch
                  id="auto-export-enabled"
                  checked={config.enabled || isRequestingEnable}
                  aria-busy={isRequestingEnable || undefined}
                  disabled={isRequestingEnable}
                  onCheckedChange={(isEnabled) => void changeEnabled(isEnabled)}
                />
              </div>
            </Field>

            {config.enabled && isDownloadsAccessMissing && (
              <AutoExportAccessAlert
                onAllow={() => void allowDownloadsAccess()}
              />
            )}

            {(accessMessage === 'enable' ||
              accessMessage === 'destination') && (
              <AccessInlineMessage>
                {i18n.t(
                  accessMessage === 'enable'
                    ? 'autoExportPage_accessDeniedEnable'
                    : 'autoExportPage_accessDeniedDestination',
                )}
              </AccessInlineMessage>
            )}

            <FieldSet data-disabled={isOff || undefined} disabled={isOff}>
              <FieldLegend variant="label">
                {i18n.t('autoExportPage_frequency')}
              </FieldLegend>
              <ToggleGroup
                variant="outline"
                aria-label={i18n.t('autoExportPage_frequency')}
                value={[config.interval]}
                disabled={isOff}
                onValueChange={(value) => {
                  const [interval] = value as AutoExportInterval[]
                  if (interval) void save({ interval })
                }}
              >
                {INTERVAL_OPTIONS.map(({ value, label }) => (
                  <ToggleGroupItem key={value} value={value}>
                    {i18n.t(label as 'autoExportPage_interval1d')}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FieldSet>

            {isWeekly && (
              <Field data-disabled={isOff || undefined}>
                <FieldLabel htmlFor="auto-export-day">
                  {i18n.t('autoExportPage_dayOfWeek')}
                </FieldLabel>
                <Select
                  items={dayItems}
                  value={String(config.dayOfWeek)}
                  disabled={isOff}
                  onValueChange={(value) =>
                    void save({ dayOfWeek: Number(value) as DayOfWeek })
                  }
                >
                  <SelectTrigger id="auto-export-day" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {dayItems.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field data-disabled={isOff || isTimeUnused || undefined}>
              <FieldLabel htmlFor="auto-export-time">
                {i18n.t('preferredExportTime')}
              </FieldLabel>
              <TimePicker
                id="auto-export-time"
                value={config.preferredTime}
                onChange={(preferredTime) => void save({ preferredTime })}
                hourLabel={i18n.t('hoursLabel')}
                minuteLabel={i18n.t('minutesLabel')}
                periodLabel={i18n.t('periodLabel')}
                disabled={isOff || isTimeUnused}
              />
              {isTimeUnused && (
                <FieldDescription>
                  {i18n.t('timeSelectionUnavailable')}
                </FieldDescription>
              )}
            </Field>

            {isPickerAvailable && (
              <FieldSet data-disabled={isOff || undefined} disabled={isOff}>
                <FieldLegend variant="label">
                  {i18n.t('autoExportPage_saveTo')}
                </FieldLegend>
                <ToggleGroup
                  variant="outline"
                  aria-label={i18n.t('autoExportPage_saveTo')}
                  value={[destination]}
                  disabled={isOff}
                  onValueChange={(value) => {
                    const [next] = value as ExportDestination[]
                    if (next) void changeDestination(next)
                  }}
                >
                  <ToggleGroupItem value="downloads">
                    {i18n.t('autoExportPage_destinationDownloads')}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="folder">
                    {i18n.t('autoExportPage_destinationFolder')}
                  </ToggleGroupItem>
                </ToggleGroup>
              </FieldSet>
            )}

            {isFolderMissing && (
              <Field data-disabled={isOff || undefined}>
                <FieldDescription>
                  {i18n.t('autoExportPage_chooseFolderDescription')}
                </FieldDescription>
                <div>
                  <Button
                    variant="outline"
                    disabled={isOff}
                    onClick={() => void chooseFolder()}
                  >
                    <FolderIcon data-icon="inline-start" />
                    {i18n.t('autoExportPage_chooseFolder')}
                  </Button>
                </div>
              </Field>
            )}

            {accessAlert !== 'hidden' && folderName !== null && (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>
                  {i18n.t('autoExportPage_folderAccessTitle')}
                </AlertTitle>
                <AlertDescription>
                  {accessAlert === 'refused'
                    ? i18n.t('autoExportPage_folderAccessRefused')
                    : i18n.t('autoExportPage_folderAccessDescription', [
                        folderName,
                      ])}
                </AlertDescription>
                <AlertAction>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void allowAccess()}
                  >
                    {i18n.t('autoExportPage_allowAccess')}
                  </Button>
                </AlertAction>
              </Alert>
            )}

            {folderName !== null && (
              <Item variant="outline" size="sm">
                <ItemMedia variant="icon">
                  <FolderIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{folderName}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isOff}
                    onClick={() => void chooseFolder()}
                  >
                    {i18n.t('autoExportPage_changeFolder')}
                  </Button>
                </ItemActions>
              </Item>
            )}

            {!isFolderMissing && (
              <Field data-disabled={isOff || undefined}>
                <FieldLabel htmlFor="auto-export-folder">
                  {i18n.t('exportPath')}
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>
                      {folderName === null
                        ? i18n.t('autoExportPage_downloadsPrefix')
                        : `${folderName}/`}
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="auto-export-folder"
                    value={folder}
                    disabled={isOff}
                    onChange={(event) => setFolderDraft(event.target.value)}
                    onBlur={() => void commitFolder()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur()
                    }}
                  />
                </InputGroup>
                <FieldDescription>
                  {folderName === null
                    ? i18n.t('autoExportPage_folderDescription')
                    : i18n.t('autoExportPage_folderChosenDescription', [
                        folderName,
                      ])}
                </FieldDescription>
              </Field>
            )}

            {folderName !== null && (
              <Alert>
                <InfoIcon />
                <AlertDescription>
                  {i18n.t('autoExportPage_folderRestartHint')}
                </AlertDescription>
              </Alert>
            )}

            <FieldSet data-disabled={isOff || undefined} disabled={isOff}>
              <FieldLegend variant="label">
                {i18n.t('autoExportFormats')}
              </FieldLegend>
              <ToggleGroup
                multiple
                variant="outline"
                aria-label={i18n.t('autoExportFormats')}
                value={config.formats}
                disabled={isOff}
                onValueChange={(value) =>
                  void save({
                    formats: resolveFormats(
                      value as ExportFormat[],
                      config.formats,
                    ),
                  })
                }
              >
                {EXPORT_FORMATS.map((value) => (
                  <ToggleGroupItem key={value} value={value}>
                    {EXPORT_FORMAT_INFO[value].label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FieldDescription>
                {i18n.t('autoExportPage_formatsDescription')}
              </FieldDescription>
            </FieldSet>

            <Field
              data-disabled={isOff || undefined}
              data-invalid={isKeepLastInvalid || undefined}
            >
              <FieldLabel htmlFor="auto-export-keep-last">
                {i18n.t('autoExportPage_keepLast')}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="auto-export-keep-last"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={keepLastText}
                  disabled={isOff}
                  aria-invalid={isKeepLastInvalid}
                  onChange={(event) => setKeepLastDraft(event.target.value)}
                  onBlur={() => {
                    if (isKeepLastInvalid) setKeepLastDraft(null)
                    else void commitKeepLast()
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur()
                  }}
                />
              </InputGroup>
              {isKeepLastInvalid ? (
                <FieldError>
                  {i18n.t('autoExportPage_keepLastInvalid')}
                </FieldError>
              ) : (
                <FieldDescription>
                  {i18n.t('autoExportPage_keepLastDescription')}
                </FieldDescription>
              )}
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="auto-export-notify-on-failure">
                  {i18n.t('autoExportPage_notifyOnFailure')}
                </FieldLabel>
                <FieldDescription>
                  {i18n.t('autoExportPage_notifyOnFailureDescription')}
                </FieldDescription>
              </FieldContent>
              <Switch
                id="auto-export-notify-on-failure"
                checked={isNotifySwitchOn}
                onCheckedChange={(isOn) => void changeNotifyOnFailure(isOn)}
              />
            </Field>

            {!isOff && notifyOnFailure && isNotificationAccessMissing && (
              <NotificationAccessAlert
                onAllow={() => void allowNotificationAccess()}
              />
            )}

            {accessMessage === 'notify' && (
              <AccessInlineMessage>
                {i18n.t('autoExportPage_accessDeniedNotify')}
              </AccessInlineMessage>
            )}
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
