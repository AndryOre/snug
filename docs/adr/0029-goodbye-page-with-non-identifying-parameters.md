# 0029: A Goodbye page opens on uninstall with non-identifying parameters

## Status

Accepted. Partly supersedes
[0017](0017-landing-umami-cloud-cookieless-analytics.md): the Website now also
reads three parameters from the uninstall URL and counts the reason a visitor
picks.

Date: 2026-11-03

## Context

Release 2.0.1 added two warning permissions, a new name and an auto-opened
What's new tab. Uninstalls spiked and weekly users fell from 5.1K to 3.9K, and
we cannot tell why people leave. The extension cannot ask them: it is gone, and
ADR 0017 and the privacy policy rule out analytics inside it. Browsers do offer
one hook that outlives the extension, a page opened on uninstall.

## Decision

The extension registers an uninstall URL that opens the Website's Goodbye page.
The URL carries exactly three values: the extension locale code, the extension
version and whether Auto-export was on. Nothing that identifies a person,
device, profile or install is ever added. The URL is refreshed at service-worker
start, on install and when the Auto-export configuration changes, falls back to
the bare Goodbye URL if the browser rejects it or it is too long, and is empty
in development builds.

The Goodbye page asks one optional question, "Why did you remove Snug?", with a
fixed set of Leaving reasons. Each click is an Umami attribute event with the
reason id, using the cookieless Umami Cloud script ADR 0017 already allows.
There is no backend, no form and no custom tracking code. The page replies
according to the reason, warns when Auto-export was on that scheduled backups
stopped, shows the received values in a visible disclosure, and offers
reinstalling through the Install redirect with Campaign tag `goodbye`. It is
`noindex` and left out of the sitemap and the `llms` files.

### Considered options

- **No uninstall page** — keeps the extension fully silent, but leaves the cause
  of the spike unknown.
- **A survey form or backend** — richer answers, but stores free text and needs
  a service to run and a privacy story.
- **An identifier in the URL** — could link a reason to an install, which the
  project does not want to be able to do.

## Consequences

- The privacy policy lists the uninstall URL contents and that the Goodbye page
  uses Umami for visits and reason clicks.
- The extension still has no analytics: it only hands the browser a URL.
- Answers are anonymous counts per reason, not per person, so they show a trend
  and not a cause for any single user.
- The Goodbye page needs all ten Website locales; the extension locale code maps
  to the Website locale path, with English as the fallback.
