import { AbsoluteFill } from 'remotion'
import type { Locale } from '../copy'
import { fontStackFor } from '../fonts'
import { theme } from '../theme'

/**
 * Stand-in body shared by the skeleton scenes until each scene file gets its
 * real implementation.
 */
export const Placeholder = ({
  name,
  headline,
  locale,
}: {
  name: string
  headline: string
  locale: Locale
}) => {
  const fonts = fontStackFor(locale)
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.ground,
        color: theme.colors.text,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        padding: 120,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 36,
          color: theme.colors.accent,
          textTransform: 'uppercase',
          letterSpacing: 6,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 96,
          fontWeight: 700,
          lineHeight: 1.1,
          color: theme.colors.text,
        }}
      >
        {headline}
      </div>
    </AbsoluteFill>
  )
}
