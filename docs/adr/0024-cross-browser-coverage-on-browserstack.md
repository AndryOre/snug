# 24. Cross-browser coverage runs on BrowserStack and blocks CI

## Status

Accepted.

## Context

The landing page is only ever exercised in Playwright's bundled Chromium (plus
device emulation on top of it). Real Safari, Firefox, Edge, iOS and Android
engines are never run, although the README states the project is tested with
BrowserStack. BrowserStack sponsors this project until 2027-10-10 with Live,
Automate (5 parallels, unlimited minutes) and Percy.

## Decision

- The site's layout specs (the same `LAYOUT_SPECS` selection as the local
  multi-project run, shared through `apps/site/playwright.layout-specs.ts`) run
  on five real platforms through BrowserStack Automate: Safari on macOS, Firefox
  and Edge on Windows 11, a real iPhone (Safari) and a real Pixel (Chrome).
- The platforms live in `apps/site/browserstack.yml` and run through the
  BrowserStack Node SDK with its own Playwright config. BrowserStack Local
  tunnels the remote browsers to the existing `astro preview` server.
- The job is blocking: `ci.yml` calls the reusable `browserstack.yml` workflow
  and `CI passed` aggregates it. The same workflow also runs nightly and on
  manual dispatch.
- The job only runs when `apps/site/**` or `packages/ui/**` changed. When the
  paths do not match, or the secrets are unavailable (fork PRs), it is skipped
  with a notice and counts as green.

## Alternatives considered

- **Playwright WebKit and Firefox on Linux.** Free and hermetic, but WebKit on
  Linux is not Safari, and it covers neither Edge nor real mobile devices.
- **Nightly only.** Cheap, but regressions would land on `main` and be found
  after the fact, so the nightly schedule is kept as a complement, not the gate.

## Consequences

- Real-engine regressions fail the PR instead of reaching users.
- CI depends on a sponsored third-party service. If the plan lapses on
  2027-10-10 and is not renewed, the job must be made non-blocking or removed.
- Fork PRs get no cross-browser signal until a maintainer re-runs the workflow
  with secrets available.
- Remote runs are slower than local ones, so the job runs in parallel with the
  other `ci.yml` jobs and only for site changes.
