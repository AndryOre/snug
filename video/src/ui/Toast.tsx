import type { ReactNode } from 'react'
import { theme } from '../theme'
import { Icon } from './Icon'

export type ToastProps = {
  /** 0..1 entrance; slides up and fades in. Default 1. */
  enter?: number
  /** Content, normally `Toast.Message` and `Toast.Action`. */
  children: ReactNode
}

const ToastRoot = ({ enter = 1, children }: ToastProps) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 24,
      padding: '18px 22px 18px 26px',
      borderRadius: 16,
      boxSizing: 'border-box',
      maxWidth: 640,
      background: theme.ui.surface,
      border: `1.5px solid ${theme.ui.borderStrong}`,
      boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
      fontSize: 22,
      color: theme.colors.text,
      opacity: enter,
      transform: `translateY(${(1 - enter) * 28}px)`,
    }}
  >
    {children}
  </div>
)

const ToastMessage = ({ children }: { children: ReactNode }) => (
  <span style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>{children}</span>
)

const ToastAction = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
      fontWeight: 700,
      color: theme.colors.accent,
      whiteSpace: 'nowrap',
    }}
  >
    <Icon name="undo" size={22} />
    {children}
  </span>
)

/**
 * Toast replica for the Undo snapshot notice.
 * Compose as `<Toast><Toast.Message>…</Toast.Message><Toast.Action>Undo</Toast.Action></Toast>`.
 */
export const Toast = Object.assign(ToastRoot, {
  Message: ToastMessage,
  Action: ToastAction,
})
