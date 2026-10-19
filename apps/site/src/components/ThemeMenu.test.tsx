// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { THEME_COLORS } from '../scripts/theme-color'
import ThemeMenu from './ThemeMenu'

const COPY = {
  label: 'Theme',
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}
const STORAGE_KEY = 'snug:theme'

const environment: {
  container?: HTMLElement
  root?: Root
  isDarkPreferred: boolean
  mediaListeners: Array<() => void>
} = { isDarkPreferred: false, mediaListeners: [] }

function currentContainer() {
  return environment.container as HTMLElement
}

function stubMatchMedia() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches:
      query.includes('prefers-color-scheme') && environment.isDarkPreferred,
    addEventListener: (_type: string, listener: () => void) => {
      environment.mediaListeners.push(listener)
    },
    removeEventListener: (_type: string, listener: () => void) => {
      environment.mediaListeners = environment.mediaListeners.filter(
        (entry) => entry !== listener,
      )
    },
  }))
}

async function mount() {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  environment.container = container
  environment.root = root
  await act(async () => {
    root.render(createElement(ThemeMenu, { copy: COPY }))
  })
}

function trigger() {
  return currentContainer().querySelector<HTMLButtonElement>('button')!
}

async function openMenu() {
  await act(async () => {
    trigger().click()
  })
}

function radios() {
  return [...document.querySelectorAll<HTMLElement>('[role="menuitemradio"]')]
}

async function choose(name: string) {
  await openMenu()
  const item = radios().find((radio) => radio.textContent === name)
  await act(async () => {
    item?.click()
  })
}

function metaColors() {
  return [...document.querySelectorAll('meta[name="theme-color"]')].map(
    (meta) => meta.getAttribute('content'),
  )
}

describe('ThemeMenu', () => {
  beforeEach(async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    environment.isDarkPreferred = false
    environment.mediaListeners = []
    stubMatchMedia()
    localStorage.clear()
    document.head.innerHTML =
      '<meta name="theme-color" content="" media="(prefers-color-scheme: light)">' +
      '<meta name="theme-color" content="" media="(prefers-color-scheme: dark)">'
    await mount()
  })

  afterEach(async () => {
    await choose('System')
    act(() => environment.root?.unmount())
    environment.container?.remove()
    document.body.replaceChildren()
    document.documentElement.removeAttribute('class')
    delete document.documentElement.dataset.theme
    delete document.documentElement.dataset.themeChoice
    vi.unstubAllGlobals()
  })

  it('labels the icon trigger and hides decorative icons', () => {
    expect(trigger().getAttribute('aria-label')).toBe('Theme')
    for (const icon of trigger().querySelectorAll('svg')) {
      expect(icon.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('lists the three choices as a radio group with System checked', async () => {
    await openMenu()
    expect(radios().map((radio) => radio.textContent)).toEqual([
      'System',
      'Light',
      'Dark',
    ])
    expect(radios().map((radio) => radio.getAttribute('aria-checked'))).toEqual(
      ['true', 'false', 'false'],
    )
  })

  it('applies and stores the dark choice', async () => {
    await choose('Dark')
    const html = document.documentElement
    expect(html.classList.contains('dark')).toBe(true)
    expect(html.dataset.theme).toBe('dark')
    expect(html.dataset.themeChoice).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
    expect(metaColors()).toEqual([THEME_COLORS.dark, THEME_COLORS.dark])
  })

  it('applies the light choice and checks its radio', async () => {
    await choose('Dark')
    await choose('Light')
    const html = document.documentElement
    expect(html.classList.contains('dark')).toBe(false)
    expect(html.dataset.theme).toBe('light')
    await openMenu()
    const light = radios().find((radio) => radio.textContent === 'Light')
    expect(light?.getAttribute('aria-checked')).toBe('true')
  })

  it('follows the operating system while on System', async () => {
    await choose('System')
    environment.isDarkPreferred = true
    await act(async () => {
      for (const listener of environment.mediaListeners) listener()
    })
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(metaColors()).toEqual([THEME_COLORS.light, THEME_COLORS.dark])
  })

  it('stops following the system once a fixed choice is made', async () => {
    await choose('Light')
    expect(environment.mediaListeners).toHaveLength(0)
  })

  it('uses a view transition when available and motion is allowed', async () => {
    const startViewTransition = vi.fn((update: () => void) => update())
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: startViewTransition,
    })
    try {
      await choose('Dark')
      expect(startViewTransition).toHaveBeenCalledTimes(1)
      expect(document.documentElement.dataset.theme).toBe('dark')
    } finally {
      Reflect.deleteProperty(document, 'startViewTransition')
    }
  })

  it('still switches when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    try {
      await choose('Dark')
      expect(document.documentElement.dataset.theme).toBe('dark')
    } finally {
      vi.restoreAllMocks()
    }
  })
})
