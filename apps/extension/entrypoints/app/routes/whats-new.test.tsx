// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

import { createDomHarness } from '@/lib/testing/dom-harness'
import type { DomHarness } from '@/lib/testing/dom-harness'
import { resetFakeI18n } from '@/lib/testing/fake-i18n'
import en from '@/locales/en.json' with { type: 'json' }

import { WhatsNewRoute } from './whats-new'

const harnesses: DomHarness[] = []

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

describe('WhatsNewRoute', () => {
  it('renders the whatsNew_intro line', async () => {
    fakeBrowser.runtime.getManifest = vi.fn().mockReturnValue({
      version: '2.3.0',
    }) as typeof fakeBrowser.runtime.getManifest
    vi.spyOn(fakeBrowser.i18n, 'getUILanguage').mockReturnValue('en')
    const harness = createDomHarness()
    harnesses.push(harness)

    await harness.render(<WhatsNewRoute />)

    expect(document.body.textContent).toContain(en.whatsNew_intro.message)
  })
})
