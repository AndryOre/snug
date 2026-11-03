// @vitest-environment jsdom
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { autoExportConfigStore } from '@/lib/storage'
import { createDomHarness } from '@/lib/testing/dom-harness'
import type { DomHarness } from '@/lib/testing/dom-harness'
import { resetFakeI18n } from '@/lib/testing/fake-i18n'
import en from '@/locales/en.json' with { type: 'json' }

import { AutoExportStatusItem } from './auto-export-status-item'

const harnesses: DomHarness[] = []

async function mountItem(config: {
  enabled: boolean
  destination: 'downloads' | 'folder'
}) {
  await autoExportConfigStore.setValue({
    ...(await autoExportConfigStore.getValue()),
    ...config,
  })
  const harness = createDomHarness()
  harnesses.push(harness)
  await harness.render(<AutoExportStatusItem />)
  await act(async () => {})
}

beforeEach(() => {
  fakeBrowser.reset()
  resetFakeI18n()
})

afterEach(() => {
  for (const harness of harnesses.splice(0)) harness.unmount()
  document.body.replaceChildren()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('AutoExportStatusItem Downloads access row', () => {
  it('shows the row when enabled on Downloads without access, then clears it once access is added', async () => {
    vi.mocked(browser.permissions.contains).mockResolvedValue(false as never)
    type AddedListener = Parameters<
      typeof browser.permissions.onAdded.addListener
    >[0]
    const addListener = vi.fn<(listener: AddedListener) => void>()
    browser.permissions.onAdded.addListener = addListener
    await mountItem({ enabled: true, destination: 'downloads' })

    expect(document.body.textContent).toContain(
      en.popup_statusDownloadsAccessTitle.message,
    )
    expect(document.body.textContent).toContain(
      en.popup_statusDownloadsAccessAction.message,
    )

    const onAdded = addListener.mock.calls[0]?.[0]
    if (!onAdded) throw new Error('listener missing')
    await act(async () => {
      onAdded({
        permissions: ['downloads'],
      })
    })

    expect(document.body.textContent).not.toContain(
      en.popup_statusDownloadsAccessTitle.message,
    )
    expect(document.body.querySelector('a[href*="auto-export"]')).not.toBeNull()
  })

  it('does not show the row when Downloads access is held', async () => {
    vi.mocked(browser.permissions.contains).mockResolvedValue(true as never)
    await mountItem({ enabled: true, destination: 'downloads' })

    expect(document.body.textContent).not.toContain(
      en.popup_statusDownloadsAccessTitle.message,
    )
  })

  it('does not show the row while Auto-export is off', async () => {
    vi.mocked(browser.permissions.contains).mockResolvedValue(false as never)
    await mountItem({ enabled: false, destination: 'downloads' })

    expect(document.body.textContent).not.toContain(
      en.popup_statusDownloadsAccessTitle.message,
    )
    expect(document.body.textContent).toContain(en.popup_statusOffTitle.message)
  })
})
