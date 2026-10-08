# 17. Landing uses Umami Cloud cookieless analytics

## Status

Accepted. Partially supersedes
[ADR 0011](0011-landing-static-site-no-third-party-scripts.md) for the website
only: its "no third-party scripts" and "no analytics" clauses no longer hold for
`apps/site`. The extension clause (no analytics inside the extension, now or
later) and the access-log and `/install` redirect measurement still stand.

## Context

Server logs count requests, not people, and common blockers hide nothing from
them but also tell us nothing about which buttons, FAQ entries or languages
visitors use. The landing needs per-click events to learn which parts work.
Self-hosting Umami or GoatCounter was the option ADR 0011 kept in the backlog;
the VPS is at capacity, so a hosted service is the only practical route.

## Decision

- The landing loads one script from Umami Cloud (Hobby plan). Umami is
  cookieless: it sets no cookies and stores nothing in the visitor's browser.
- The tracker runs with `data-do-not-track="true"` so visitors who send Do Not
  Track are not counted, and `data-domains="snug.andryore.dev"` so previews and
  local builds are not counted.
- Events are attribute-only (`data-umami-event`), with kebab-case names and
  locale-independent property values. No custom tracking code is added.
- The Content-Security-Policy stays strict: `script-src` is `'self'`, hashes and
  the single Umami origin, with no `'unsafe-inline'` and Trusted Types kept.
- The nginx access log and the `/install` redirect stay as an adblock-proof
  cross-check. The log format adds the referer and user-agent; IP addresses stay
  masked.
- The privacy page names Umami Cloud as processor and lists what is collected.
- No analytics are added inside the extension, now or later.

### Considered options

- **Keep log-only measurement** — nothing leaves the site, but there are no
  click events, so we cannot tell which buttons or sections work.
- **Self-hosted Umami or GoatCounter** — same data, no processor, but the VPS is
  at capacity.
- **PostHog** — autocapture and session replay are on by default and the script
  is 50 to 89 KB.
- **Cloudflare Web Analytics** — no custom events.

## Consequences

- The landing makes one third-party script request on load, and the privacy page
  must keep matching what the tracker collects.
- Blockers will hide some visitors from Umami, so its counts undercount. The log
  and the Chrome Web Store UTM report remain the cross-check.
- Adding any other third-party script still requires revisiting this decision.
