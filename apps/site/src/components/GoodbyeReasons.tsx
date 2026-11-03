import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { buttonVariants } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { CheckIcon, TriangleAlertIcon } from 'lucide-react'
import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'

import {
  GOODBYE_BUG_REPORT_HREF,
  GOODBYE_EMAIL,
  GOODBYE_FEATURE_REQUEST_HREF,
  GOODBYE_REASON_IDS,
  GOODBYE_REINSTALL_HREF,
  GOODBYE_REPLY_ACTIONS,
  goodbyeRedirectTarget,
  parseGoodbyeParameters,
  type GoodbyeCopy,
  type GoodbyeParameters,
  type GoodbyeReasonId,
} from '../i18n/goodbye'
import type { Locale } from '../i18n/locales'

interface GoodbyeReasonsProperties {
  locale: Locale
  copy: GoodbyeCopy
  privacyHref: string
}

function noop(): void {}

function subscribeToNothing(): () => void {
  return noop
}

function readSearch(): string {
  return globalThis.location.search
}

function readServerSearch(): string {
  return ''
}

const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-md text-foreground underline decoration-muted-foreground underline-offset-4 focus-ring-solid hover:decoration-primary'

const TOKEN_PATTERN = /(\{version\}|\{language\}|\{backups\})/

interface DisclosureProperties {
  copy: GoodbyeCopy['disclosure']
  parameters: GoodbyeParameters
}

function backupsText(
  copy: GoodbyeCopy['disclosure'],
  scheduledBackups: boolean | null,
): string {
  if (scheduledBackups === null) return copy.notProvided
  return scheduledBackups ? copy.yes : copy.no
}

function Disclosure({ copy, parameters }: DisclosureProperties) {
  const valueFor = (token: string): string | null => {
    switch (token) {
      case '{version}': {
        return parameters.version ?? copy.notProvided
      }
      case '{language}': {
        return parameters.language ?? copy.notProvided
      }
      case '{backups}': {
        return backupsText(copy, parameters.scheduledBackups)
      }
      default: {
        return null
      }
    }
  }
  const segments = copy.template
    .split(TOKEN_PATTERN)
    .map((text, position) => ({ key: `segment-${position}`, text }))
  return (
    <>
      {segments.map(({ key, text }) => {
        const value = valueFor(text)
        return value === null ? (
          <Fragment key={key}>{text}</Fragment>
        ) : (
          <strong key={key} className="font-semibold text-foreground">
            {value}
          </strong>
        )
      })}
    </>
  )
}

interface ReplyProperties {
  reason: GoodbyeReasonId
  copy: GoodbyeCopy
}

function Reply({ reason, copy }: ReplyProperties) {
  const actions = GOODBYE_REPLY_ACTIONS[reason]
  return (
    <div
      data-reply={reason}
      className="flex flex-col items-start gap-3 rounded-2xl bg-card px-5 py-4 text-card-foreground ring-1 ring-card-border motion-safe:animate-in motion-safe:duration-150 motion-safe:fade-in-0"
    >
      <p className="leading-prose">{copy.replies[reason]}</p>
      {actions.reinstall === 'button' && (
        <a
          href={GOODBYE_REINSTALL_HREF}
          className={cn(buttonVariants({ size: 'touch' }), 'focus-ring-solid')}
        >
          {copy.reinstall}
        </a>
      )}
      {actions.reinstall === 'link' && (
        <a href={GOODBYE_REINSTALL_HREF} className={LINK_CLASS}>
          {copy.reinstall}
        </a>
      )}
      {actions.github && (
        <a
          href={
            actions.github === 'feature'
              ? GOODBYE_FEATURE_REQUEST_HREF
              : GOODBYE_BUG_REPORT_HREF
          }
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS}
        >
          {actions.github === 'feature' ? copy.featureLink : copy.bugLink}
        </a>
      )}
      {actions.email && (
        <p className="text-sm text-muted-foreground">
          {copy.emailLead}{' '}
          <a
            href={`mailto:${GOODBYE_EMAIL}`}
            className="text-foreground underline underline-offset-4"
          >
            {GOODBYE_EMAIL}
          </a>
        </p>
      )}
    </div>
  )
}

export default function GoodbyeReasons({
  locale,
  copy,
  privacyHref,
}: GoodbyeReasonsProperties) {
  const search = useSyncExternalStore(
    subscribeToNothing,
    readSearch,
    readServerSearch,
  )
  const parameters = useMemo(() => parseGoodbyeParameters(search), [search])
  const [selected, setSelected] = useState<GoodbyeReasonId | null>(null)

  useEffect(() => {
    const target = goodbyeRedirectTarget(locale, search)
    if (target !== null) globalThis.location.replace(target)
  }, [locale, search])

  const hasOwnReinstall =
    selected !== null && GOODBYE_REPLY_ACTIONS[selected].reinstall !== undefined

  return (
    <div className="mx-auto flex w-full max-w-180 flex-1 flex-col gap-8 px-4 py-10 md:px-14 md:py-14">
      {parameters.scheduledBackups === true && (
        <Alert data-goodbye-notice>
          <TriangleAlertIcon aria-hidden="true" />
          <AlertTitle>{copy.notice.title}</AlertTitle>
          <AlertDescription>{copy.notice.body}</AlertDescription>
        </Alert>
      )}
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-medium text-balance wrap-anywhere md:text-4xl">
          {copy.headline}
        </h1>
        <p className="leading-prose wrap-anywhere text-muted-foreground">
          {copy.lead}
        </p>
      </header>
      <section
        aria-labelledby="goodbye-question"
        className="flex flex-col gap-4"
      >
        <h2
          id="goodbye-question"
          className="font-heading text-xl font-medium wrap-anywhere"
        >
          {copy.question}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {GOODBYE_REASON_IDS.map((reason) => (
            <button
              key={reason}
              type="button"
              aria-pressed={selected === reason}
              data-umami-event="uninstall-reason"
              data-umami-event-reason={reason}
              onClick={() => {
                setSelected(reason)
              }}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'touch' }),
                'h-full min-h-14 w-full justify-between rounded-xl py-3 text-left whitespace-normal focus-ring-solid aria-pressed:border-primary aria-pressed:bg-primary/10',
              )}
            >
              <span className="wrap-anywhere">{copy.reasons[reason]}</span>
              <CheckIcon
                aria-hidden="true"
                className={cn(
                  'shrink-0 text-primary',
                  selected !== reason && 'invisible',
                )}
              />
            </button>
          ))}
        </div>
        <div aria-live="polite" data-goodbye-reply-region>
          {selected !== null && (
            <Reply key={selected} reason={selected} copy={copy} />
          )}
        </div>
      </section>
      {!hasOwnReinstall && (
        <a
          href={GOODBYE_REINSTALL_HREF}
          className={cn(LINK_CLASS, 'self-start')}
        >
          {copy.reinstall}
        </a>
      )}
      <footer className="mt-auto flex flex-col gap-2 border-t border-border pt-6 text-sm leading-prose wrap-anywhere text-muted-foreground">
        <p data-goodbye-disclosure>
          <Disclosure copy={copy.disclosure} parameters={parameters} />
        </p>
        <a href={privacyHref} className={cn(LINK_CLASS, 'self-start')}>
          {copy.disclosure.privacyLink}
        </a>
      </footer>
    </div>
  )
}
