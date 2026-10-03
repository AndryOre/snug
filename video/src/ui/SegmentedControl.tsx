import { theme } from '../theme'

export type SegmentedControlProps = {
  /** Option labels, e.g. merge / replace / new folder, already localized. */
  options: readonly string[]
  /** Active option as a fractional index; animate it for a sliding thumb. */
  position?: number
  /** Width of every segment in px. Default 220. */
  segmentWidth?: number
}

const HEIGHT = 56
const INSET = 5

/**
 * Segmented control with a sliding amber thumb driven by `position`.
 */
export const SegmentedControl = ({
  options,
  position = 0,
  segmentWidth = 220,
}: SegmentedControlProps) => (
  <div
    style={{
      position: 'relative',
      display: 'inline-flex',
      height: HEIGHT,
      boxSizing: 'border-box',
      padding: INSET,
      borderRadius: 14,
      background: theme.ui.surfaceMuted,
      border: `1.5px solid ${theme.ui.border}`,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: INSET,
        left: INSET,
        width: segmentWidth,
        height: HEIGHT - INSET * 2 - 3,
        borderRadius: 10,
        background: theme.colors.accent,
        transform: `translateX(${position * segmentWidth}px)`,
      }}
    />
    {options.map((label, index) => {
      const activeness = Math.max(0, 1 - Math.abs(position - index))
      return (
        <div
          key={label}
          style={{
            position: 'relative',
            width: segmentWidth,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 12px',
            boxSizing: 'border-box',
            fontSize: 20,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color:
              activeness > 0.5 ? theme.ui.onAccent : theme.colors.secondary,
          }}
        >
          {label}
        </div>
      )
    })}
  </div>
)
