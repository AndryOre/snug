import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import type { ReactNode } from 'react'

/**
 * Export formats shown by the playground, in tab order. The keys double as the
 * slot names the Astro section fills and the locale-independent event values.
 */
const PLAYGROUND_FORMATS = [
  'html',
  'json',
  'csv',
  'markdown',
  'opml',
  'xbel',
] as const

type PlaygroundFormat = (typeof PLAYGROUND_FORMATS)[number]

interface FormatPlaygroundProperties extends Partial<
  Record<PlaygroundFormat, ReactNode>
> {
  labels: Record<PlaygroundFormat, string>
  listLabel: string
}

/**
 * Format tabs over build-time highlighted sample panes. Every pane is rendered
 * and stays in the DOM; switching only changes which one is visible.
 * @param properties - The tab and pane props.
 * @param properties.labels - Visible tab labels by format.
 * @param properties.listLabel - Accessible name of the tab list.
 * @returns The tabs and their panes.
 */
export default function FormatPlayground({
  labels,
  listLabel,
  ...panes
}: FormatPlaygroundProperties) {
  return (
    <Tabs defaultValue="html" className="mt-10" data-playground>
      <TabsList
        variant="line"
        activateOnFocus
        aria-label={listLabel}
        className="h-auto max-w-full flex-wrap justify-start"
      >
        {PLAYGROUND_FORMATS.map((format) => (
          <TabsTrigger
            key={format}
            value={format}
            data-umami-event="playground-format"
            data-umami-event-format={format}
            translate="no"
          >
            {labels[format]}
          </TabsTrigger>
        ))}
      </TabsList>
      <div
        data-playground-panes
        className="mt-4 grid h-80 overflow-hidden rounded-lg border border-border sm:h-96"
      >
        {PLAYGROUND_FORMATS.map((format) => (
          <TabsContent
            key={format}
            value={format}
            keepMounted
            data-playground-pane={format}
            render={(properties, state) => (
              <div
                {...properties}
                hidden={undefined}
                data-pane-hidden={state.hidden ? '' : undefined}
              />
            )}
          >
            {panes[format]}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
