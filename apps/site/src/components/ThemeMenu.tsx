import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useEffect, useSyncExternalStore } from 'react'

const THEME_STORAGE_KEY = 'snug:theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

type ThemeChoice = 'system' | 'light' | 'dark'

const CHOICES: readonly ThemeChoice[] = ['system', 'light', 'dark']

const CHOICE_ICONS = {
  system: MonitorIcon,
  light: SunIcon,
  dark: MoonIcon,
} as const

/**
 * Localized names of the theme menu and its three choices.
 */
export interface ThemeMenuCopy {
  label: string
  system: string
  light: string
  dark: string
}

function isThemeChoice(value: unknown): value is ThemeChoice {
  return CHOICES.includes(value as ThemeChoice)
}

function readStoredChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

const choiceListeners = new Set<() => void>()
const memory: { choice?: ThemeChoice } = {}

function readChoice(): ThemeChoice {
  return memory.choice ?? readStoredChoice()
}

function subscribeToChoice(listener: () => void) {
  choiceListeners.add(listener)
  return () => {
    choiceListeners.delete(listener)
  }
}

function writeChoice(choice: ThemeChoice) {
  memory.choice = choice
  try {
    localStorage.setItem(THEME_STORAGE_KEY, choice)
  } catch {
    return
  } finally {
    for (const listener of choiceListeners) listener()
  }
}
function applyChoice(choice: ThemeChoice) {
  const isDark =
    choice === 'dark' || (choice === 'system' && matchMedia(DARK_QUERY).matches)
  const root = document.documentElement
  root.classList.add('theme-switching')
  root.classList.toggle('dark', isDark)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.remove('theme-switching'))
  })
}

function selectChoice(value: string) {
  if (!isThemeChoice(value)) return
  writeChoice(value)
  applyChoice(value)
}

/**
 * Header theme menu built on the shared DropdownMenu radio group. The choice
 * is stored in `localStorage` and applied to `<html>` at once; while on System
 * the page follows operating system changes. Hidden until the head script sets
 * the `js` class, since the theme only switches with JavaScript.
 * @param properties - Localized copy.
 * @param properties.copy - Menu label and the System, Light and Dark names.
 * @returns The icon trigger and the menu with the three choices.
 */
export default function ThemeMenu({ copy }: { copy: ThemeMenuCopy }) {
  const choice = useSyncExternalStore(
    subscribeToChoice,
    readChoice,
    (): ThemeChoice => 'system',
  )

  useEffect(() => {
    if (choice !== 'system') return
    const query = matchMedia(DARK_QUERY)
    const follow = () => applyChoice('system')
    query.addEventListener('change', follow)
    return () => query.removeEventListener('change', follow)
  }, [choice])

  const ActiveIcon = CHOICE_ICONS[choice]
  return (
    <div className="hidden shrink-0 js:block" data-theme-menu>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label={copy.label}
            />
          }
        >
          <ActiveIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-46">
          <DropdownMenuRadioGroup value={choice} onValueChange={selectChoice}>
            {CHOICES.map((value) => {
              const Icon = CHOICE_ICONS[value]
              return (
                <DropdownMenuRadioItem
                  key={value}
                  value={value}
                  data-umami-event="theme-change"
                  data-umami-event-theme={value}
                  closeOnClick
                  className="min-h-11"
                >
                  <Icon aria-hidden="true" />
                  {copy[value]}
                </DropdownMenuRadioItem>
              )
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
