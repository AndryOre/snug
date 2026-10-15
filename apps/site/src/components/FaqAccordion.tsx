import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'

interface FaqEntry {
  id: string
  question: string
  answer: string
}

interface FaqAccordionProperties {
  entries: FaqEntry[]
}

export default function FaqAccordion({ entries }: FaqAccordionProperties) {
  return (
    <Accordion variant="faq" hiddenUntilFound keepMounted className="max-w-208">
      {entries.map((entry, index) => (
        <AccordionItem key={entry.id} value={`faq-${index}`}>
          <AccordionTrigger
            className="focus-ring-solid accordion-icon-sync"
            data-umami-event="faq-open"
            data-umami-event-question={entry.id}
          >
            {entry.question}
          </AccordionTrigger>
          <AccordionContent>{entry.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
