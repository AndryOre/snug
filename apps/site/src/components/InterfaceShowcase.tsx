import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import type { ReactNode } from 'react'

/**
 * Screenshot keys shown by the showcase, in tab order. They double as the slot
 * names the Astro section fills.
 */
const SHOWCASE_SHOTS = ['export', 'import', 'autoExport', 'popup'] as const

type ShowcaseShot = (typeof SHOWCASE_SHOTS)[number]

interface InterfaceShowcaseProperties extends Partial<
  Record<ShowcaseShot, ReactNode>
> {
  labels: Record<ShowcaseShot, string>
  listLabel: string
}

/**
 * Tabs over the real-interface screenshots. Every pane stays mounted in one
 * grid cell and only the active one is visible, so switching never shifts
 * layout and the crossfade is driven by the pane's data attribute.
 * @param properties - The tab and pane props.
 * @param properties.labels - Visible tab labels by screenshot.
 * @param properties.listLabel - Accessible name of the tab list.
 * @returns The tabs and their screenshot panes.
 */
export default function InterfaceShowcase({
  labels,
  listLabel,
  ...panes
}: InterfaceShowcaseProperties) {
  return (
    <Tabs
      defaultValue="export"
      className="mt-10 max-w-3xl flex-col"
      data-showcase
    >
      <TabsList
        variant="line"
        activateOnFocus
        aria-label={listLabel}
        className="h-auto max-w-full flex-wrap justify-start group-data-[orientation=horizontal]/tabs:h-auto"
      >
        {SHOWCASE_SHOTS.map((shot) => (
          <TabsTrigger key={shot} value={shot}>
            {labels[shot]}
          </TabsTrigger>
        ))}
      </TabsList>
      <div data-showcase-panes className="mt-4 grid w-full">
        {SHOWCASE_SHOTS.map((shot) => (
          <TabsContent
            key={shot}
            value={shot}
            keepMounted
            data-showcase-pane={shot}
            render={(properties, state) => (
              <div
                {...properties}
                hidden={undefined}
                data-pane-hidden={state.hidden ? '' : undefined}
              />
            )}
          >
            {panes[shot]}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
