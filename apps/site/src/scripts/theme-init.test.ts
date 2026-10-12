import { describe, expect, it } from 'vitest'

import { THEME_COLORS } from './theme-color'
import { THEME_INIT_SCRIPT } from './theme-init'

function runInit(options: { stored: string | null; systemDark: boolean }) {
  const classes = new Set<string>()
  const metas: { content: string }[] = [
    { content: THEME_COLORS.light },
    { content: THEME_COLORS.dark },
  ]
  const dataset: Record<string, string> = {}
  const changeListeners: ((event: { matches: boolean }) => void)[] = []
  const fakeDocument = {
    documentElement: {
      dataset,
      classList: {
        toggle: (name: string, isForced: boolean) =>
          isForced ? classes.add(name) : classes.delete(name),
        add: (name: string) => classes.add(name),
      },
    },
    querySelectorAll: () =>
      metas.map((meta) => ({
        setAttribute: (_name: string, value: string) => {
          meta.content = value
        },
      })),
  }
  const fakeStorage = { getItem: () => options.stored }
  const fakeMatchMedia = () => ({
    matches: options.systemDark,
    addEventListener: (
      _type: string,
      listener: (event: { matches: boolean }) => void,
    ) => {
      changeListeners.push(listener)
    },
  })
  new Function('document', 'localStorage', 'matchMedia', THEME_INIT_SCRIPT)(
    fakeDocument,
    fakeStorage,
    fakeMatchMedia,
  )
  const changeSystem = (isDark: boolean) => {
    for (const listener of changeListeners) listener({ matches: isDark })
  }
  return { classes, metas, dataset, changeSystem }
}

describe('theme init script', () => {
  it('rewrites both theme-color metas to dark for a stored dark override', () => {
    const { classes, metas } = runInit({ stored: 'dark', systemDark: false })
    expect(classes.has('dark')).toBe(true)
    expect(metas.map((meta) => meta.content)).toEqual(['#17120a', '#17120a'])
  })

  it('rewrites both theme-color metas to light for a stored light override on a dark system', () => {
    const { classes, metas } = runInit({ stored: 'light', systemDark: true })
    expect(classes.has('dark')).toBe(false)
    expect(metas.map((meta) => meta.content)).toEqual(['#f1ece4', '#f1ece4'])
  })

  it('leaves the media-specific metas alone without an override', () => {
    const { metas } = runInit({ stored: null, systemDark: true })
    expect(metas.map((meta) => meta.content)).toEqual(['#f1ece4', '#17120a'])
  })

  it('follows live system changes only while the choice is System', () => {
    const system = runInit({ stored: null, systemDark: false })
    expect(system.dataset.themeChoice).toBe('system')
    system.changeSystem(true)
    expect(system.classes.has('dark')).toBe(true)

    const override = runInit({ stored: 'light', systemDark: false })
    expect(override.dataset.themeChoice).toBe('light')
    override.changeSystem(true)
    expect(override.classes.has('dark')).toBe(false)
  })
})
