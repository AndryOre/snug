// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createDomHarness } from '@/lib/testing/dom-harness'
import type { DomHarness } from '@/lib/testing/dom-harness'
import { resetFakeI18n } from '@/lib/testing/fake-i18n'

import en from '../locales/en.json' with { type: 'json' }
import { NotificationAccessAlert } from './notification-access-alert'

const harnesses: DomHarness[] = []

beforeEach(() => {
  resetFakeI18n()
})

afterEach(() => {
  for (const harness of harnesses.splice(0)) harness.unmount()
  document.body.replaceChildren()
})

describe('NotificationAccessAlert', () => {
  it('shows the copy and calls onAllow from the Allow button', async () => {
    const onAllow = vi.fn()
    const harness = createDomHarness()
    harnesses.push(harness)
    await harness.render(<NotificationAccessAlert onAllow={onAllow} />)

    expect(document.body.textContent).toContain(
      en.autoExportPage_notificationAccessTitle.message,
    )
    expect(document.body.textContent).toContain(
      en.autoExportPage_notificationAccessDescription.message,
    )
    const button = document.querySelector('button')
    expect(button?.textContent).toBe('Allow')
    button?.click()
    expect(onAllow).toHaveBeenCalledOnce()
  })
})
