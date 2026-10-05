import type { ReactNode } from 'react'

import { theme } from '../theme'
import { type ExportFormat, FORMAT_LABELS } from './FileIcon'

export type ChipProps = {
  format: ExportFormat
  /**
  `active` is the amber selected state.
   */
  tone?: 'default' | 'active'
}

const ChipRoot = ({
  tone,
  children,
}: {
  tone: 'default' | 'active'
  children: ReactNode
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 44,
      boxSizing: 'border-box',
      padding: '0 20px',
      borderRadius: 999,
      fontSize: 20,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      border: `1.5px solid ${tone === 'active' ? theme.colors.accent : theme.ui.borderStrong}`,
      background: tone === 'active' ? theme.colors.accent : 'transparent',
      color: tone === 'active' ? theme.ui.onAccent : theme.colors.secondary,
    }}
  >
    {children}
  </div>
)

/**
 * Format chip (HTML, JSON, CSV, Markdown, OPML, XBEL).
 */
export const Chip = ({ format, tone = 'default' }: ChipProps) => (
  <ChipRoot tone={tone}>{FORMAT_LABELS[format]}</ChipRoot>
)
