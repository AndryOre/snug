import { useEffect } from 'react'

import { themeStore } from '@/lib/storage'
import {
  applyResolvedTheme,
  readCachedTheme,
  writeCachedTheme,
} from '@/lib/theme-cache'
import { useStorageItem } from '@/lib/use-storage-item'

interface ThemeProviderProperties {
  children: React.ReactNode
}

/**
 * Applies the persisted theme preference to the document root and keeps it
 * in sync with the operating system's color scheme when the preference is
 * `"system"`. The first render starts from the synchronous theme cache so the
 * saved theme is not replaced by the default while the async read resolves.
 * @param root0 This component's properties.
 * @param root0.children The subtree rendered under the applied theme.
 * @returns The `children`, rendered as-is.
 */
export function ThemeProvider({ children }: ThemeProviderProperties) {
  const [theme] = useStorageItem(themeStore, readCachedTheme())

  useEffect(() => {
    writeCachedTheme(theme)
  }, [theme])

  useEffect(() => {
    if (theme === 'system') {
      const mql = globalThis.matchMedia('(prefers-color-scheme: dark)')

      applyResolvedTheme(mql.matches ? 'dark' : 'light')

      /**
       * Reacts to OS-level color scheme changes while the preference is
       * `"system"`, so the applied theme stays live instead of only being
       * resolved once when the effect first runs.
       * @param event The OS color-scheme change event.
       */
      const handleChange = (event: MediaQueryListEvent) => {
        applyResolvedTheme(event.matches ? 'dark' : 'light')
      }

      mql.addEventListener('change', handleChange)
      return () => mql.removeEventListener('change', handleChange)
    }
    applyResolvedTheme(theme)
  }, [theme])

  return children
}
