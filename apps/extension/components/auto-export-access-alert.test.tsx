// @vitest-environment jsdom
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createDomHarness } from '@/lib/testing/dom-harness'
import type { DomHarness } from '@/lib/testing/dom-harness'
import { resetFakeI18n } from '@/lib/testing/fake-i18n'

import en from '../locales/en.json' with { type: 'json' }
import {
  AccessInlineMessage,
  AutoExportAccessAlert,
  didCommitWithAccess,
} from './auto-export-access-alert'

const MESSAGE = 'hello'
const harnesses: DomHarness[] = []

beforeEach(() => {
  resetFakeI18n()
})

afterEach(() => {
  for (const harness of harnesses.splice(0)) harness.unmount()
  document.body.replaceChildren()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('didCommitWithAccess', () => {
  it('requests permissions before any await, then commits', async () => {
    vi.mocked(browser.permissions.request).mockResolvedValue(true as never)
    const commit = vi.fn(async () => {})

    const pending = didCommitWithAccess(['downloads', 'notifications'], commit)
    expect(browser.permissions.request).toHaveBeenCalledExactlyOnceWith({
      permissions: ['downloads', 'notifications'],
    })
    expect(commit).not.toHaveBeenCalled()

    expect(await pending).toBe(true)
    const [requestOrder] = vi.mocked(browser.permissions.request).mock
      .invocationCallOrder
    const [commitOrder] = commit.mock.invocationCallOrder
    expect(requestOrder).toBeLessThan(commitOrder ?? 0)
  })

  it('commits nothing when access is denied', async () => {
    vi.mocked(browser.permissions.request).mockResolvedValue(false as never)
    const commit = vi.fn(async () => {})

    expect(await didCommitWithAccess(['notifications'], commit)).toBe(false)
    expect(commit).not.toHaveBeenCalled()
  })

  it('treats a rejected request as denied', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(browser.permissions.request).mockRejectedValue(new Error('x'))
    const commit = vi.fn(async () => {})

    expect(await didCommitWithAccess(['downloads'], commit)).toBe(false)
    expect(commit).not.toHaveBeenCalled()
  })
})

describe('AutoExportAccessAlert', () => {
  it('renders the alert and calls onAllow from the button', async () => {
    const onAllow = vi.fn()
    const harness = createDomHarness()
    harnesses.push(harness)
    await harness.render(<AutoExportAccessAlert onAllow={onAllow} />)

    expect(document.body.textContent).toContain(
      en.autoExportPage_downloadsAccessTitle.message,
    )
    expect(document.body.textContent).toContain(
      en.autoExportPage_downloadsAccessDescription.message,
    )
    await act(async () => {
      document.body.querySelector('button')?.click()
    })
    expect(onAllow).toHaveBeenCalledOnce()
  })
})

describe('AccessInlineMessage', () => {
  it('is a non-destructive status region', async () => {
    const harness = createDomHarness()
    harnesses.push(harness)
    await harness.render(<AccessInlineMessage>{MESSAGE}</AccessInlineMessage>)

    const status = document.body.querySelector('[role="status"]')
    expect(status?.textContent).toBe(MESSAGE)
    expect(document.body.querySelector('[role="alert"]')).toBeNull()
  })
})
