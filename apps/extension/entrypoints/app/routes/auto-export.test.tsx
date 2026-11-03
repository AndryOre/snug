// @vitest-environment jsdom
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import type * as FolderAccessRecoveryModule from '@/lib/folder-access-recovery'
import type * as FolderHandleModule from '@/lib/folder-handle'
import {
  autoExportConfigStore,
  autoExportLastRunStore,
  autoExportNotifyOnFailureStore,
} from '@/lib/storage'
import { createDomHarness } from '@/lib/testing/dom-harness'
import type { DomHarness } from '@/lib/testing/dom-harness'
import { resetFakeI18n } from '@/lib/testing/fake-i18n'
import en from '@/locales/en.json' with { type: 'json' }

import { AutoExportRoute } from './auto-export'

vi.mock('@/lib/folder-handle', async (importOriginal) => ({
  ...(await importOriginal<typeof FolderHandleModule>()),
  clearFolderHandle: vi.fn(async () => {
    events.push('clearFolderHandle')
  }),
}))

vi.mock('@/lib/folder-access-recovery', async (importOriginal) => ({
  ...(await importOriginal<typeof FolderAccessRecoveryModule>()),
  readFolderAccess: vi.fn(async () => 'granted' as const),
}))

const events: string[] = []
const harnesses: DomHarness[] = []

type PermissionName = 'downloads' | 'notifications'

function installPermissions(options: {
  held: PermissionName[]
  isRequestGranted: boolean
}) {
  Object.assign(browser.permissions, {
    contains: vi.fn((query: { permissions?: string[] }) => {
      events.push('contains')
      return Promise.resolve(
        (query.permissions ?? []).every((name) =>
          options.held.includes(name as PermissionName),
        ),
      )
    }),
    request: vi.fn(() => {
      events.push('request')
      return Promise.resolve(options.isRequestGranted)
    }),
  })
}

async function mountRoute(
  config: Partial<Awaited<ReturnType<typeof autoExportConfigStore.getValue>>>,
  isNotifyOnFailure = true,
) {
  await autoExportConfigStore.setValue({
    ...(await autoExportConfigStore.getValue()),
    ...config,
  })
  await autoExportNotifyOnFailureStore.setValue(isNotifyOnFailure)
  const harness = createDomHarness()
  harnesses.push(harness)
  await harness.render(<AutoExportRoute />)
  await act(async () => {})
  events.length = 0
  const originalGetValue = autoExportConfigStore.getValue.bind(
    autoExportConfigStore,
  )
  vi.spyOn(autoExportConfigStore, 'getValue').mockImplementation(async () => {
    events.push('config.getValue')
    return await originalGetValue()
  })
  return harness
}

async function click(element: Element | null) {
  if (!element) throw new Error('element missing')
  await act(async () => {
    ;(element as HTMLElement).click()
  })
  await act(async () => {})
}

function findByText(text: string): Element | null {
  return (
    [...document.body.querySelectorAll('button, [role="radio"]')].find(
      (element) => element.textContent?.trim() === text,
    ) ?? null
  )
}

function notifySwitchState() {
  return document
    .querySelector('#auto-export-notify-on-failure')
    ?.matches(':checked')
}

beforeEach(() => {
  fakeBrowser.reset()
  resetFakeI18n()
  events.length = 0
  vi.stubGlobal('showDirectoryPicker', vi.fn())
  vi.spyOn(fakeBrowser.runtime, 'sendMessage').mockResolvedValue({
    ok: true,
  } as never)
})

afterEach(() => {
  for (const harness of harnesses.splice(0)) harness.unmount()
  document.body.replaceChildren()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('AutoExportRoute permission requests', () => {
  it('requests access first when enabling and writes nothing on denial', async () => {
    installPermissions({ held: [], isRequestGranted: false })
    await mountRoute({ enabled: false, destination: 'downloads' })
    const setConfig = vi.spyOn(autoExportConfigStore, 'setValue')
    const setNotify = vi.spyOn(autoExportNotifyOnFailureStore, 'setValue')

    await click(document.querySelector('#auto-export-enabled'))

    expect(events[0]).toBe('request')
    expect(browser.permissions.request).toHaveBeenCalledExactlyOnceWith({
      permissions: ['downloads', 'notifications'],
    })
    expect(setConfig).not.toHaveBeenCalled()
    expect(setNotify).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain(
      en.autoExportPage_accessDeniedEnable.message,
    )
  })

  it('keeps Auto-export on and turns notifications off when only Notification access is denied', async () => {
    installPermissions({ held: ['downloads'], isRequestGranted: false })
    await mountRoute({ enabled: false, destination: 'downloads' }, true)

    await click(document.querySelector('#auto-export-enabled'))

    expect(events[0]).toBe('request')
    const stored = await autoExportConfigStore.getValue()
    expect(stored.enabled).toBe(true)
    expect(await autoExportNotifyOnFailureStore.getValue()).toBe(false)
    expect(document.body.textContent).toContain(
      en.autoExportPage_accessDeniedNotify.message,
    )
    expect(document.body.textContent).not.toContain(
      en.autoExportPage_accessDeniedEnable.message,
    )
  })

  it('requests access first when switching to Downloads and writes nothing on denial', async () => {
    installPermissions({ held: [], isRequestGranted: false })
    await mountRoute({
      enabled: true,
      destination: 'folder',
      folderName: 'Backups',
    })
    const setConfig = vi.spyOn(autoExportConfigStore, 'setValue')

    await click(findByText(en.autoExportPage_destinationDownloads.message))

    expect(events[0]).toBe('request')
    expect(events).not.toContain('clearFolderHandle')
    expect(setConfig).not.toHaveBeenCalled()
    const stored = await autoExportConfigStore.getValue()
    expect(stored.destination).toBe('folder')
    expect(document.body.textContent).toContain(
      en.autoExportPage_accessDeniedDestination.message,
    )
  })

  it('requests access first when turning notifications on and writes nothing on denial', async () => {
    installPermissions({ held: [], isRequestGranted: false })
    await mountRoute({ destination: 'downloads' }, false)
    const setNotify = vi.spyOn(autoExportNotifyOnFailureStore, 'setValue')

    await click(document.querySelector('#auto-export-notify-on-failure'))

    expect(events[0]).toBe('request')
    expect(browser.permissions.request).toHaveBeenCalledExactlyOnceWith({
      permissions: ['notifications'],
    })
    expect(setNotify).not.toHaveBeenCalled()
    expect(await autoExportNotifyOnFailureStore.getValue()).toBe(false)
    expect(document.body.textContent).toContain(
      en.autoExportPage_accessDeniedNotify.message,
    )
  })

  it('requests access first on Export now and runs nothing on denial', async () => {
    installPermissions({ held: [], isRequestGranted: false })
    await mountRoute({ enabled: false, destination: 'downloads' })

    await click(findByText(en.exportNow.message))

    expect(events[0]).toBe('request')
    expect(browser.runtime.sendMessage).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain(
      en.autoExportPage_accessDeniedExport.message,
    )
  })

  it('requests access synchronously on Export now while the access check is still loading', async () => {
    installPermissions({ held: [], isRequestGranted: true })
    Object.assign(browser.permissions, {
      contains: vi.fn(() => new Promise<boolean>(() => {})),
    })
    await mountRoute({ enabled: false, destination: 'downloads' })

    const button = findByText(en.exportNow.message)
    if (!button) throw new Error('button missing')
    ;(button as HTMLElement).click()

    expect(browser.permissions.request).toHaveBeenCalledExactlyOnceWith({
      permissions: ['downloads'],
    })
    await act(async () => {})
    expect(browser.runtime.sendMessage).toHaveBeenCalledOnce()
  })

  it('runs the export after Export now access is granted', async () => {
    installPermissions({ held: [], isRequestGranted: true })
    await mountRoute({ enabled: false, destination: 'downloads' })

    await click(findByText(en.exportNow.message))

    expect(events[0]).toBe('request')
    expect(browser.runtime.sendMessage).toHaveBeenCalledOnce()
  })
})

describe('AutoExportRoute without prompts', () => {
  it('does not request access when disabling Auto-export', async () => {
    installPermissions({ held: ['downloads'], isRequestGranted: true })
    await mountRoute({ enabled: true, destination: 'downloads' })

    await click(document.querySelector('#auto-export-enabled'))

    expect(browser.permissions.request).not.toHaveBeenCalled()
    const stored = await autoExportConfigStore.getValue()
    expect(stored.enabled).toBe(false)
  })
})

describe('AutoExportRoute typed failure', () => {
  it('shows the localized sentence in the failure alert and the toast, never the raw code', async () => {
    installPermissions({ held: ['downloads'], isRequestGranted: true })
    await autoExportLastRunStore.setValue({
      ok: false,
      at: 1,
      error: 'downloads-access-needed',
      errorCode: 'downloads-access-needed',
      trigger: 'scheduled',
    })
    vi.spyOn(fakeBrowser.runtime, 'sendMessage').mockResolvedValue({
      ok: false,
      error: 'downloads-access-needed',
    } as never)
    await mountRoute({ enabled: false, destination: 'downloads' })

    expect(document.body.textContent).toContain(
      en.autoExportError_downloadsAccessNeeded.message,
    )
    await click(findByText(en.exportNow.message))

    expect(document.body.textContent).not.toContain('downloads-access-needed')
  })
})

describe('AutoExportRoute Downloads access alert', () => {
  it('shows the Downloads access alert when Downloads access is missing', async () => {
    installPermissions({ held: ['notifications'], isRequestGranted: true })
    await mountRoute({ enabled: true, destination: 'downloads' })

    expect(document.body.textContent).toContain(
      en.autoExportPage_downloadsAccessTitle.message,
    )
  })

  it('hides the Downloads access alert when Downloads access is held', async () => {
    installPermissions({
      held: ['downloads', 'notifications'],
      isRequestGranted: true,
    })
    await mountRoute({ enabled: true, destination: 'downloads' })

    expect(document.body.textContent).not.toContain(
      en.autoExportPage_downloadsAccessTitle.message,
    )
  })
})

describe('AutoExportRoute Notification access alert', () => {
  it('reads the switch off and shows the alert while Notification access is missing', async () => {
    installPermissions({ held: ['downloads'], isRequestGranted: true })
    await mountRoute({ enabled: true, destination: 'downloads' }, true)

    expect(notifySwitchState()).toBe(false)
    expect(document.body.textContent).toContain(
      en.autoExportPage_notificationAccessTitle.message,
    )
    expect(await autoExportNotifyOnFailureStore.getValue()).toBe(true)
  })

  it('requests before any await, turns the switch on on grant and never rewrites the setting', async () => {
    installPermissions({ held: ['downloads'], isRequestGranted: true })
    await mountRoute({ enabled: true, destination: 'downloads' }, true)
    const setNotify = vi.spyOn(autoExportNotifyOnFailureStore, 'setValue')

    await click(findByText(en.autoExportPage_notificationAccessAllow.message))

    expect(events[0]).toBe('request')
    expect(browser.permissions.request).toHaveBeenCalledExactlyOnceWith({
      permissions: ['notifications'],
    })
    expect(setNotify).not.toHaveBeenCalled()
    expect(document.body.textContent).not.toContain(
      en.autoExportPage_notificationAccessTitle.message,
    )
    expect(notifySwitchState()).toBe(true)
  })

  it('keeps the switch off with an inline message on denial', async () => {
    installPermissions({ held: ['downloads'], isRequestGranted: false })
    await mountRoute({ enabled: true, destination: 'downloads' }, true)

    await click(findByText(en.autoExportPage_notificationAccessAllow.message))

    expect(events[0]).toBe('request')
    expect(notifySwitchState()).toBe(false)
    expect(document.body.textContent).toContain(
      en.autoExportPage_accessDeniedNotify.message,
    )
    expect(await autoExportNotifyOnFailureStore.getValue()).toBe(true)
  })

  it('updates the page when access is revoked', async () => {
    installPermissions({
      held: ['downloads', 'notifications'],
      isRequestGranted: true,
    })
    const addListener = vi.fn()
    Object.assign(browser.permissions, {
      onAdded: { addListener: vi.fn(), removeListener: vi.fn() },
      onRemoved: { addListener, removeListener: vi.fn() },
    })
    await mountRoute({ enabled: true, destination: 'downloads' }, true)
    expect(notifySwitchState()).toBe(true)

    await act(async () => {
      const [onRemoved] = addListener.mock.calls[0] as [
        (changed: { permissions: string[] }) => void,
      ]
      onRemoved({ permissions: ['notifications'] })
    })

    expect(notifySwitchState()).toBe(false)
    expect(document.body.textContent).toContain(
      en.autoExportPage_notificationAccessTitle.message,
    )
  })
})
