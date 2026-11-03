// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  GOODBYE_COPY_EN,
  GOODBYE_REASON_IDS,
  GOODBYE_REINSTALL_HREF,
} from '../i18n/goodbye'
import type { Locale } from '../i18n/locales'
import GoodbyeReasons from './GoodbyeReasons'

const mounted: { container?: HTMLElement; root?: Root } = {}

function currentContainer() {
  return mounted.container as HTMLElement
}

async function mount(search: string, locale: Locale = 'en') {
  globalThis.history.replaceState({}, '', `/goodbye/${search}`)
  await act(async () => {
    mounted.root?.unmount()
  })
  const root = createRoot(currentContainer())
  mounted.root = root
  await act(async () => {
    root.render(
      createElement(GoodbyeReasons, {
        locale,
        copy: GOODBYE_COPY_EN,
        privacyHref: '/privacy/',
      }),
    )
  })
}

function reasonButton(reason: string) {
  const buttons = [
    ...currentContainer().querySelectorAll<HTMLButtonElement>(
      'button[data-umami-event-reason]',
    ),
  ]
  return buttons.find(
    (button) => button.dataset.umamiEventReason === reason,
  ) as HTMLButtonElement
}

async function click(element: HTMLElement) {
  await act(async () => {
    element.click()
  })
}

function replyRegion() {
  return currentContainer().querySelector(
    '[data-goodbye-reply-region]',
  ) as HTMLElement
}

describe('GoodbyeReasons', () => {
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    const container = document.createElement('div')
    document.body.append(container)
    mounted.container = container
    mounted.root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      mounted.root?.unmount()
    })
    mounted.container?.remove()
    vi.unstubAllGlobals()
  })

  it('renders seven reason buttons with the uninstall-reason event', async () => {
    await mount('')
    const buttons = [
      ...currentContainer().querySelectorAll<HTMLButtonElement>(
        'button[data-umami-event]',
      ),
    ]
    expect(buttons.map((button) => button.dataset.umamiEvent)).toEqual(
      GOODBYE_REASON_IDS.map(() => 'uninstall-reason'),
    )
    expect(buttons.map((button) => button.dataset.umamiEventReason)).toEqual([
      ...GOODBYE_REASON_IDS,
    ])
  })

  it('shows the backups notice only when ae is 1', async () => {
    await mount('?ae=1')
    expect(currentContainer().textContent).toContain(
      GOODBYE_COPY_EN.notice.title,
    )
    await mount('?ae=0')
    expect(currentContainer().textContent).not.toContain(
      GOODBYE_COPY_EN.notice.title,
    )
  })

  it('discloses the values received, or not provided', async () => {
    await mount('?lang=es&v=2.2.0&ae=1', 'es')
    const disclosure = currentContainer().querySelector(
      '[data-goodbye-disclosure]',
    )
    expect(disclosure?.textContent).toBe(
      'This page received only: version 2.2.0, language es, scheduled backups yes. No identifier. Umami counts this visit and the reason you pick, without cookies.',
    )
    await mount('')
    const empty = currentContainer().querySelector('[data-goodbye-disclosure]')
    expect(empty?.textContent).toContain('version not provided')
    expect(empty?.textContent).toContain('language not provided')
    expect(empty?.textContent).toContain('scheduled backups not provided')
  })

  it('never renders a bad value as markup', async () => {
    await mount('?v=%3Cb%3Ex%3C%2Fb%3E&lang=%3Cimg%3E&ae=%3Ci%3E')
    expect(currentContainer().querySelector('b, img, i')).toBeNull()
    expect(currentContainer().textContent).toContain('version not provided')
  })

  it('shows the matching reply when a reason is clicked', async () => {
    await mount('')
    expect(replyRegion().getAttribute('aria-live')).toBe('polite')
    expect(replyRegion().textContent).toBe('')
    for (const reason of GOODBYE_REASON_IDS) {
      await click(reasonButton(reason))
      expect(replyRegion().textContent).toContain(
        GOODBYE_COPY_EN.replies[reason],
      )
      expect(reasonButton(reason).getAttribute('aria-pressed')).toBe('true')
    }
  })

  it('links reinstall through the tagged install redirect', async () => {
    await mount('')
    await click(reasonButton('didnt-recognize'))
    const link = replyRegion().querySelector('a')
    expect(link?.getAttribute('href')).toBe(GOODBYE_REINSTALL_HREF)
    expect(GOODBYE_REINSTALL_HREF).toBe('/install?c=goodbye')
  })

  it('links the GitHub template and the email for a bug', async () => {
    await mount('')
    await click(reasonButton('bug'))
    const hrefs = [...replyRegion().querySelectorAll('a')].map((anchor) =>
      anchor.getAttribute('href'),
    )
    expect(hrefs).toEqual([
      expect.stringContaining('github.com/AndryOre/snug/issues/new'),
      'mailto:hello@andryore.dev',
    ])
  })

  it('offers only the email for switched and other', async () => {
    await mount('')
    for (const reason of ['switched', 'other']) {
      await click(reasonButton(reason))
      const hrefs = [...replyRegion().querySelectorAll('a')].map((anchor) =>
        anchor.getAttribute('href'),
      )
      expect(hrefs).toEqual(['mailto:hello@andryore.dev'])
    }
  })
})
