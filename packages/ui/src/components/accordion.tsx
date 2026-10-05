import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { cn } from '@workspace/ui/lib/utils'
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from 'lucide-react'

type AccordionVariant = 'default' | 'faq'

function Accordion({
  className,
  variant = 'default',
  ...properties
}: AccordionPrimitive.Root.Props & { variant?: AccordionVariant }) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-variant={variant}
      className={cn(
        'group/accordion flex w-full flex-col data-[variant=faq]:border-y data-[variant=faq]:border-border',
        className,
      )}
      {...properties}
    />
  )
}

function AccordionItem({
  className,
  ...properties
}: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('not-last:border-b', className)}
      {...properties}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...properties
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none group-data-[variant=faq]/accordion:min-h-12 group-data-[variant=faq]/accordion:items-center group-data-[variant=faq]/accordion:gap-4 group-data-[variant=faq]/accordion:py-4 group-data-[variant=faq]/accordion:font-heading group-data-[variant=faq]/accordion:text-xl group-data-[variant=faq]/accordion:leading-tight hover:underline group-data-[variant=faq]/accordion:hover:no-underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground motion-reduce:transition-none motion-reduce:duration-0',
          className,
        )}
        {...properties}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden group-data-[variant=faq]/accordion:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline group-data-[variant=faq]/accordion:hidden!"
        />
        <PlusIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 text-primary-text! transition-transform group-aria-expanded/accordion-trigger:rotate-45 group-data-[variant=faq]/accordion:block motion-reduce:transition-none motion-reduce:duration-0"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...properties
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-sm motion-reduce:animate-none! data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...properties}
    >
      <div
        className={cn(
          'h-(--accordion-panel-height) pt-0 pb-2.5 group-data-[variant=faq]/accordion:pb-5 group-data-[variant=faq]/accordion:text-base group-data-[variant=faq]/accordion:leading-body group-data-[variant=faq]/accordion:text-muted-foreground data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
