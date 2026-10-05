import type { ReactNode } from 'react'

import { type Locale, message, type MessageKey } from '../copy'
import { fontStackFor } from '../fonts'
import { theme } from '../theme'
import { BlobMark } from './BlobMark'
import { Icon, type IconName } from './Icon'

export type NavId =
  'export' | 'import' | 'duplicates' | 'autoExport' | 'settings' | 'whatsNew'

const NAV: { id: NavId; key: MessageKey; icon: IconName }[] = [
  { id: 'export', key: 'shell_navExport', icon: 'download' },
  { id: 'import', key: 'shell_navImport', icon: 'upload' },
  { id: 'duplicates', key: 'shell_navDuplicates', icon: 'duplicates' },
  { id: 'autoExport', key: 'shell_navAutoExport', icon: 'refresh' },
  { id: 'settings', key: 'shell_navSettings', icon: 'settings' },
  { id: 'whatsNew', key: 'shell_navWhatsNew', icon: 'history' },
]

export const APP_WINDOW_SIZE = { width: 1520, height: 860 } as const
const TITLE_BAR = 56
const TITLE_BAR_BORDER = 1.5
const SIDEBAR = 300
const SIDEBAR_PADDING_TOP = 28
const BRAND_ROW = 72
const NAV_GAP = 10
const NAV_ITEM = 52
const BRAND_NAME = 'Snug'

/**
 * Layer coordinates of each nav entry's centre, for Cursor waypoints and
 * Camera focus.
 */
export const navItemCenter = (id: NavId): { x: number; y: number } => ({
  x: SIDEBAR / 2,
  y:
    TITLE_BAR +
    TITLE_BAR_BORDER +
    SIDEBAR_PADDING_TOP +
    BRAND_ROW +
    NAV_GAP +
    NAV.findIndex((item) => item.id === id) * (NAV_ITEM + NAV_GAP) +
    NAV_ITEM / 2,
})

export type AppWindowProps = {
  locale: Locale
  /**
   * Highlighted nav entry; its label is also the page heading.
   */
  active: NavId
  /**
   * 0..1 amber highlight on a hovered nav entry, per id.
   */
  hover?: Partial<Record<NavId, number>>
  /**
   * Content area, laid out below the page heading.
   */
  children?: ReactNode
}

/**
 * Snug app shell: title bar, localized left nav, and a content area. Fixed at
 * 1520x860 in layer coordinates; scale it with a Camera.
 */
export const AppWindow = ({
  locale,
  active,
  hover = {},
  children,
}: AppWindowProps) => {
  const fonts = fontStackFor(locale)
  return (
    <div
      style={{
        position: 'relative',
        width: APP_WINDOW_SIZE.width,
        height: APP_WINDOW_SIZE.height,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 22,
        background: theme.colors.ground,
        border: `1.5px solid ${theme.ui.borderStrong}`,
        boxShadow: '0 40px 90px rgba(0,0,0,0.55)',
        color: theme.colors.text,
        fontFamily: fonts.body,
      }}
    >
      <div
        style={{
          height: TITLE_BAR,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 22px',
          background: theme.ui.sidebar,
          borderBottom: `1.5px solid ${theme.ui.border}`,
        }}
      >
        {['#FF5F57', '#FEBC2E', '#28C840'].map((color) => (
          <div
            key={color}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: color,
              opacity: 0.85,
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div
          style={{
            width: SIDEBAR,
            flexShrink: 0,
            boxSizing: 'border-box',
            padding: '28px 20px',
            background: theme.ui.sidebar,
            borderRight: `1.5px solid ${theme.ui.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              height: 72,
              padding: '0 8px',
              fontFamily: fonts.display,
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            <BlobMark size={48} />
            {BRAND_NAME}
          </div>
          {NAV.map((item) => {
            const isActive = item.id === active
            const hovered = hover[item.id] ?? 0
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  height: 52,
                  boxSizing: 'border-box',
                  padding: '0 16px',
                  borderRadius: 12,
                  fontSize: 22,
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  background: isActive
                    ? theme.ui.surfaceMuted
                    : `color-mix(in oklch, ${theme.ui.surface} ${hovered * 100}%, transparent)`,
                  color: isActive ? theme.colors.text : theme.ui.mutedText,
                }}
              >
                <Icon
                  name={item.icon}
                  size={24}
                  color={isActive ? theme.colors.accent : 'currentColor'}
                />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {message(locale, item.key)}
                </span>
              </div>
            )
          })}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            boxSizing: 'border-box',
            padding: '36px 44px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div
            style={{
              fontFamily: fonts.display,
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {message(
              locale,
              NAV.find((item) => item.id === active)?.key ?? 'shell_navExport',
            )}
          </div>
          <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
