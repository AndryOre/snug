import type { ReactNode } from 'react'
import { theme } from '../theme'

export type ButtonProps = {
  variant?: 'primary' | 'outline' | 'ghost'
  /** 0..1 press squash, e.g. driven by a Cursor click frame. */
  press?: number
  children: ReactNode
}

const STYLES = {
  primary: {
    background: theme.colors.accent,
    color: theme.ui.onAccent,
    border: `1.5px solid ${theme.colors.accent}`,
  },
  outline: {
    background: 'transparent',
    color: theme.colors.text,
    border: `1.5px solid ${theme.ui.borderStrong}`,
  },
  ghost: {
    background: 'transparent',
    color: theme.colors.secondary,
    border: '1.5px solid transparent',
  },
} as const

/**
 * Button replica; label is the children, so pass a localized string.
 */
export const Button = ({
  variant = 'primary',
  press = 0,
  children,
}: ButtonProps) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      height: 52,
      boxSizing: 'border-box',
      padding: '0 26px',
      borderRadius: 12,
      fontSize: 22,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      transform: `scale(${1 - press * 0.05})`,
      ...STYLES[variant],
    }}
  >
    {children}
  </div>
)
