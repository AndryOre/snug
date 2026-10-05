import { theme } from '../theme'
import { Checkbox } from './Checkbox'
import { Icon } from './Icon'

export type TreeRowProps = {
  kind: 'folder' | 'bookmark'
  label: string
  /**
  Indent level, 0 is a root.
   */
  depth?: number
  /**
  Folder chevron state; ignored for bookmarks.
   */
  expanded?: boolean
  /**
  0..1 check animation; omit to hide the checkbox.
   */
  checkProgress?: number
  /**
  0..1 hover/focus highlight, e.g. while the cursor is on the row.
   */
  highlight?: number
}

const ROW_HEIGHT = 52
const INDENT = 36

const FolderGlyph = () => (
  <svg width={26} height={26} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      d="M3 6a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.6.8l.8 1.2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      fill={theme.ui.bookmarkFolder}
    />
  </svg>
)

const BookmarkGlyph = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      d="M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
      fill={theme.ui.bookmarkFile}
    />
    <path d="M14 3v5h5" fill="rgba(255,255,255,0.35)" />
  </svg>
)

/**
 * One row of the export bookmark tree: chevron, optional checkbox, icon and
 * label. Height is fixed at 52px so stacks line up.
 */
export const TreeRow = ({
  kind,
  label,
  depth = 0,
  expanded = false,
  checkProgress,
  highlight = 0,
}: TreeRowProps) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      height: ROW_HEIGHT,
      boxSizing: 'border-box',
      paddingLeft: 12 + depth * INDENT,
      paddingRight: 16,
      borderRadius: 10,
      background: `color-mix(in oklch, ${theme.ui.surfaceMuted} ${highlight * 100}%, transparent)`,
      color: theme.colors.text,
      fontSize: 22,
      whiteSpace: 'nowrap',
    }}
  >
    <div
      style={{
        width: 22,
        flexShrink: 0,
        color: theme.ui.mutedText,
        opacity: kind === 'folder' ? 1 : 0,
        transform: `rotate(${expanded ? 90 : 0}deg)`,
      }}
    >
      <Icon name="chevron" size={22} />
    </div>
    {checkProgress === undefined ? null : <Checkbox progress={checkProgress} />}
    {kind === 'folder' ? <FolderGlyph /> : <BookmarkGlyph />}
    <span
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: 0,
      }}
    >
      {label}
    </span>
  </div>
)
