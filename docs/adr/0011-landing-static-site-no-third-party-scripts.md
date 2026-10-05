# 11. Landing page is a static site with no third-party scripts

## Status

Accepted.

## Context

Snug's central claim is that it sends nothing anywhere: no network calls, no
account, no data collection. A landing page that loaded an analytics script
would contradict that claim on the very page that makes it, and the privacy
policy would need a second set of exceptions. The page also needs a way to learn
which install buttons work.

## Decision

- The landing page (`apps/site`) is a static Astro site, served by nginx from a
  Docker image on Coolify. It makes no third-party requests on load. The promo
  video loads from YouTube only after the visitor clicks it.
- Visits are measured from the server's own access log, with IP addresses masked
  in the log format. Install clicks go through an Install redirect (`/install`)
  that answers 302 to the Chrome Web Store listing with `utm_source`,
  `utm_medium` and `utm_campaign`, so every click appears in the log. Listing
  views by campaign come from the Chrome Web Store dashboard.
- No analytics are added inside the extension, now or later: that would end the
  no-network-calls claim and require new permissions and store disclosures.

### Considered options

- **Umami or GoatCounter, self-hosted on Coolify** — cookieless, small scripts
  and per-click events, but still a script on the page and one more service to
  run. Kept as a backlog item to revisit with real traffic data.
- **PostHog** — cookieless mode needs two settings, autocapture and session
  replay are on by default, and the script is 50 to 89 KB, close to the size of
  the page itself.
- **Cloudflare Web Analytics** — no custom events, so install clicks cannot be
  counted, and common blockers remove its beacon.
- **Plausible** — not available as a one-click Coolify service and heavy to
  self-host.

## Consequences

- The privacy page can state that the site runs no analytics scripts.
- Counts come from logs, so they include bots and exclude nothing a blocker
  would remove; they are a trend, not an exact visitor count.
- The access log must be kept short-lived and written to a place Coolify
  retains.
- Adding any script later means revisiting this decision and the privacy page.
