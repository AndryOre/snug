import { theme } from '../theme'

export type ExportFormat = 'html' | 'json' | 'csv' | 'md' | 'opml' | 'xbel'

export const FORMAT_LABELS: Record<ExportFormat, string> = {
  html: 'HTML',
  json: 'JSON',
  csv: 'CSV',
  md: 'Markdown',
  opml: 'OPML',
  xbel: 'XBEL',
}

const EXTENSIONS: Record<ExportFormat, string> = {
  html: '.html',
  json: '.json',
  csv: '.csv',
  md: '.md',
  opml: '.opml',
  xbel: '.xbel',
}

export type FileIconProps = {
  format: ExportFormat
  /**
   * Width in px; height is 1.25x. Default 96.
   */
  size?: number
}

/**
 * Document silhouette with a folded corner and the format extension on it.
 */
export const FileIcon = ({ format, size = 96 }: FileIconProps) => (
  <div
    style={{
      position: 'relative',
      width: size,
      height: size * 1.25,
      flexShrink: 0,
    }}
  >
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 80 100"
      style={{ position: 'absolute', inset: 0 }}
    >
      <path
        d="M8 0h46l26 26v66a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8z"
        fill={theme.ui.surfaceMuted}
        stroke={theme.ui.borderStrong}
        strokeWidth={2}
      />
      <path d="M54 0v18a8 8 0 0 0 8 8h18z" fill={theme.colors.accent} />
    </svg>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: size * 0.16,
        textAlign: 'center',
        fontFamily: "'Geist Mono', ui-monospace, monospace",
        fontWeight: 600,
        fontSize: size * 0.2,
        color: theme.colors.text,
      }}
    >
      {EXTENSIONS[format]}
    </div>
  </div>
)
