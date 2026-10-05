import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'

interface FaqEntry {
  question: string
  answer: string
}

interface FaqAccordionProperties {
  entries: FaqEntry[]
}

export default function FaqAccordion({ entries }: FaqAccordionProperties) {
  return (
    <Accordion
      variant="faq"
      hiddenUntilFound
      keepMounted
      className="mt-10 max-w-3xl"
    >
      {entries.map((entry, index) => (
        <AccordionItem key={entry.question} value={`faq-${index}`}>
          <AccordionTrigger>{entry.question}</AccordionTrigger>
          <AccordionContent>{entry.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
