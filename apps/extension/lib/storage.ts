import { storage } from '#imports'

import type { ExportFormat } from '@/lib/export-formats'
import type {
  AutoExportConfig,
  AutoExportLastRun,
  ImportMode,
  ReviewPromptState,
} from '@/lib/types'

/**
 * All persisted extension settings, defined with `storage.defineItem` so
 * every store lives under a `local:` key (per-browser-profile storage, not
 * synced). `entrypoints/background.ts` watches {@link autoExportConfigStore}
 * specifically, so any change to auto-export settings re-syncs the
 * `auto-export` alarm without waiting for the next `onStartup`.
 */
export const themeStore = storage.defineItem<'dark' | 'light' | 'system'>(
  'local:theme',
  { fallback: 'system' },
)

export const showBookmarkIconStore = storage.defineItem<boolean>(
  'local:showBookmarkIcon',
  { fallback: true },
)

export const autoExpandFoldersStore = storage.defineItem<boolean>(
  'local:autoExpandFolders',
  { fallback: false },
)

export const includeIconDataStore = storage.defineItem<boolean>(
  'local:includeIconData',
  { fallback: true },
)

export const includeDateAddedStore = storage.defineItem<boolean>(
  'local:includeDateAdded',
  { fallback: true },
)

export const includeDateLastUsedStore = storage.defineItem<boolean>(
  'local:includeDateLastUsed',
  { fallback: false },
)

export const includeDateGroupModifiedStore = storage.defineItem<boolean>(
  'local:includeDateGroupModified',
  { fallback: true },
)

export const hideOtherBookmarksStore = storage.defineItem<boolean>(
  'local:hideOtherBookmarks',
  { fallback: true },
)

export const hideParentFolderStore = storage.defineItem<boolean>(
  'local:hideParentFolder',
  { fallback: false },
)

export const exportFilenameTemplateStore = storage.defineItem<string>(
  'local:exportFilenameTemplate',
  { fallback: 'Bookmarks_%yyyy-%mm-%dd_%hh-%min-%sec' },
)

/**
 * The format last chosen in the popup's Export section, so a one-click
 * "Export all" repeats it next time.
 */
export const lastExportFormatStore = storage.defineItem<ExportFormat>(
  'local:lastExportFormat',
  { fallback: 'html' },
)

const DEFAULT_AUTO_EXPORT_CONFIG: AutoExportConfig = {
  enabled: false,
  interval: '1d',
  preferredTime: '00:00',
  dayOfWeek: 1,
  path: 'bookmarks-backup/',
  formats: ['html'],
  keepLast: 10,
  destination: 'downloads',
  folderName: null,
}

export const autoExportConfigStore = storage.defineItem<AutoExportConfig>(
  'local:autoExportConfig',
  {
    fallback: DEFAULT_AUTO_EXPORT_CONFIG,
    version: 4,
    migrations: {
      2: (stored: Omit<AutoExportConfig, 'dayOfWeek'>): AutoExportConfig => ({
        ...stored,
        dayOfWeek: DEFAULT_AUTO_EXPORT_CONFIG.dayOfWeek,
      }),
      3: (stored: Omit<AutoExportConfig, 'keepLast'>): AutoExportConfig => ({
        ...stored,
        keepLast: DEFAULT_AUTO_EXPORT_CONFIG.keepLast,
      }),
      4: (
        stored: Omit<AutoExportConfig, 'destination' | 'folderName'>,
      ): AutoExportConfig => ({
        ...stored,
        destination: DEFAULT_AUTO_EXPORT_CONFIG.destination,
        folderName: DEFAULT_AUTO_EXPORT_CONFIG.folderName,
      }),
    },
  },
)

/**
 * Whether a failed Auto-export run shows the Failure notification. Kept apart
 * from the config so existing users get the default (on) without a migration.
 */
export const autoExportNotifyOnFailureStore = storage.defineItem<boolean>(
  'local:autoExportNotifyOnFailure',
  { fallback: true },
)

export const autoExportLastRunStore = storage.defineItem<
  AutoExportLastRun | number | null
>('local:autoExportLastRun', { fallback: null })

/**
 * The Downloads files one auto-export run saved: every id of a run is grouped
 * so retention counts runs, not files.
 */
export interface AutoExportDownloadsRun {
  destination: 'downloads'
  runAt: number
  ids: number[]
}

/**
 * The Custom folder files one auto-export run saved. `paths` are relative to
 * the folder's root; `folderId` names the folder's identity in
 * `lib/folder-run-identity.ts`, so retention can tell whether the run lives in
 * the folder that is current now.
 */
export interface AutoExportFolderRun {
  destination: 'folder'
  runAt: number
  folderId: string
  paths: string[]
}

/**
 * One auto-export run in the retention history, tagged by Export destination.
 */
export type AutoExportRun = AutoExportDownloadsRun | AutoExportFolderRun

/**
 * Runs Snug itself saved for auto-export in either Export destination, oldest
 * run first. Persisted so retention still knows which files are Snug's own
 * after the service worker restarts. Version 1 was a flat id list, each legacy
 * id migrating to its own run; version 2 grouped ids per run; version 3 tags
 * every run with its destination, so each existing group becomes a Downloads
 * run. The key predates Custom folder runs and is kept for that migration. See
 * `lib/auto-export-retention.ts`.
 */
export const autoExportRunsStore = storage.defineItem<AutoExportRun[]>(
  'local:autoExportDownloadIds',
  {
    fallback: [],
    version: 3,
    migrations: {
      2: (legacyIds: number[]): { runAt: number; ids: number[] }[] =>
        legacyIds.map((id) => ({ runAt: 0, ids: [id] })),
      3: (runs: { runAt: number; ids: number[] }[]): AutoExportDownloadsRun[] =>
        runs.map((run) => ({ destination: 'downloads', ...run })),
    },
  },
)

/**
 * The authoritative next due time for auto-export, in epoch milliseconds.
 * `null` means auto-export is disabled (or has zero formats selected) — see
 * `syncAlarm` in `lib/auto-export.ts`, which is the only writer besides
 * `runAutoExport` re-arming after a scheduled/catch-up run.
 */
export const autoExportNextRunStore = storage.defineItem<number | null>(
  'local:autoExportNextRun',
  { fallback: null },
)

/**
 * Epoch milliseconds at which a scheduled/catch-up auto-export run started,
 * or `null` when none is in flight. Written by `runAutoExport` and treated
 * as stale after `RUN_IN_FLIGHT_TTL_MS` so a service worker killed mid-run
 * cannot block future runs forever.
 */
export const autoExportRunInFlightStore = storage.defineItem<number | null>(
  'local:autoExportRunInFlight',
  { fallback: null },
)

/**
 * The last extension version whose changelog the user has seen in the App.
 * `null` until the What's new screen is first visited; the sidebar shows an
 * unseen dot while this differs from the installed version.
 */
export const lastSeenVersionStore = storage.defineItem<string | null>(
  'local:lastSeenVersion',
  { fallback: null },
)

export const defaultImportModeStore = storage.defineItem<ImportMode>(
  'local:defaultImportMode',
  { fallback: 'restore-merge' },
)

/**
 * Whether imports skip bookmarks whose URL already exists. Shared by the
 * Import page switch and the popup quick import; on by default.
 */
export const skipDuplicatesStore = storage.defineItem<boolean>(
  'local:skipDuplicates',
  { fallback: true },
)

/**
 * Local state of the one-time Review prompt. A fresh profile is neither
 * eligible nor dismissed. See `lib/review-prompt.ts` for the rules.
 */
export const reviewPromptStore = storage.defineItem<ReviewPromptState>(
  'local:reviewPrompt',
  { fallback: { eligibleAt: null, dismissedAt: null } },
)
