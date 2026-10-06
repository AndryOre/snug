import { Button, buttonVariants } from '@workspace/ui/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'

interface LanguageOption {
  code: string
  href: string
  tag: string
  name: string
}

export interface LanguageSwitcherProperties {
  current: string
  currentTag: string
  currentName: string
  label: string
  separator: string
  options: readonly LanguageOption[]
  markCurrent: boolean
}

/**
 * Header language menu built on the shared Popover. The trigger and every item
 * are ghost buttons; each item is a plain link, so the footer list covers
 * visitors without JavaScript.
 * @param props - Current locale, localized labels and every locale option.
 * @param props.current - Active locale code.
 * @param props.currentTag - BCP 47 tag of the active locale.
 * @param props.currentName - Native name of the active locale.
 * @param props.label - Accessible name of the menu.
 * @param props.separator - Locale glue between the label and the active name.
 * @param props.options - Every locale with its link target.
 * @param props.markCurrent - Whether the active locale link is marked current.
 * @returns The trigger and the popover listing every locale.
 */
export default function LanguageSwitcher({
  current,
  currentTag,
  currentName,
  label,
  separator,
  options,
  markCurrent,
}: LanguageSwitcherProperties) {
  const accessibleLabel = `${label}${separator}`
  return (
    <div className="min-w-0" data-language-switcher>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="ghost" size="touch" className="max-w-full" />
          }
        >
          <span className="sr-only">{accessibleLabel}</span>
          <span lang={currentTag} className="min-w-0 truncate">
            {currentName}
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 font-mono text-sm text-primary-text"
          >
            {currentTag}
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          aria-label={label}
          className="w-56"
          data-language-menu
        >
          <ul>
            {options.map((option) => (
              <li key={option.code}>
                <a
                  href={option.href}
                  lang={option.tag}
                  hrefLang={option.tag}
                  aria-current={
                    markCurrent && option.code === current ? 'page' : undefined
                  }
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'touch',
                    className:
                      'w-full justify-start aria-[current=page]:text-primary-text',
                  })}
                >
                  {option.name}
                </a>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}
