import { useEffect, useState, type ReactNode } from 'react'
import { cancelRender, continueRender, delayRender } from 'remotion'
import type { Locale } from './copy'
import { loadFontsFor } from './fonts'

/**
 * Holds the first paint until the locale's fonts are loaded.
 */
export const FontGate = ({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) => {
  const [handle] = useState(() => delayRender(`Loading fonts for ${locale}`))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadFontsFor(locale)
      .then(() => {
        setReady(true)
        continueRender(handle)
      })
      .catch((error: unknown) => cancelRender(error))
  }, [locale, handle])

  return ready ? <>{children}</> : null
}
