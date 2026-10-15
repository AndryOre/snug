# 24. Cross-browser coverage runs on BrowserStack, informational and tiered

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
  and Edge on Windows 11, a real iPhone 15 (Safari) and a real Pixel 8 (Chrome).
- The platforms live in `apps/site/browserstack.yml` and run through the
  BrowserStack Node SDK with its own Playwright config. BrowserStack Local
  tunnels the remote browsers to the existing `astro preview` server.
- The run is informational and never blocks a merge. `ci.yml` calls the reusable
  `browserstack.yml` workflow for pull requests only, and neither it nor its
  `changes` gate is in the `needs` of `CI passed`; a failure shows as a red,
  non-required check. The first real run (PR #238) showed a full run is far too
  slow to gate PRs.
- The full tier does not run from `ci.yml`. `browserstack.yml` has its own
  `push` (to `main`, site and UI paths), `schedule` and `workflow_dispatch`
  triggers, because a multi-hour run inside the `CI` workflow would hold its
  per-ref concurrency group on `main` and leave later pushes without
  `CI passed`.
- `fullyParallel` is on in the BrowserStack Playwright config so `--shard` can
  split inside `accessibility.spec.ts`; without it all 728 tests land in one
  shard.
- Nothing is skipped; the same tests run on different triggers (tiers):
  - **Lean** (204 tests per platform: every layout spec except
    `accessibility.spec.ts`, via `BROWSERSTACK_TIER=lean`): PRs touching
    `apps/site/**` or `packages/ui/**`, on Safari, Firefox, Edge and Pixel 8.
    About 10 to 20 minutes per platform, all four in parallel.
  - **Full** (all 932 tests per platform, accessibility included): nightly,
    pushes to `main` and manual dispatch.
- `workflow_dispatch` takes `tier` (`lean`|`full`) and `platform`
  (`all`|`safari`|`firefox`|`edge`|`pixel`|`iphone`), so one platform can be run
  on demand.
- A `plan` job builds a matrix of single-platform jobs (the SDK config is
  narrowed to that platform with `yq`), capped at `max-parallel: 5` to match the
  plan's parallels. Full-tier runs share one non-cancelling concurrency group so
  they queue instead of oversubscribing; lean PR runs cancel superseded runs of
  the same PR.
- When the secrets are unavailable (fork PRs), the plan job skips everything
  with a notice.

## Timings and sharding

Measured per test on this plan (932 tests per platform in the full tier, 728 of
them `accessibility.spec.ts`):

| Platform     | Per test | Lean (204) | Full (932) |
| ------------ | -------- | ---------- | ---------- |
| Edge         | ~3s      | ~10 min    | ~47 min    |
| Firefox      | ~4s      | ~14 min    | ~62 min    |
| Safari macOS | ~5s      | ~17 min    | ~78 min    |
| Pixel 8      | ~6s      | ~20 min    | ~93 min    |
| iPhone 15    | ~27s     | ~92 min    | ~7 h       |

The real iPhone full suite does not fit the 6 h hosted-job limit, so it is split
with Playwright `--shard` into four jobs of about 105 minutes. With the four
other platforms that is eight jobs under five parallel sessions, about 3 hours
of wall time per full run, well inside the nightly window and without rotating
shards across nights. The iPhone is not part of the lean tier (~92 min); it can
still be dispatched on demand.

## iPhone per-test duration

`apps/site/browserstack-timing-reporter.ts` logs each test's duration split into
`pw:api` calls (tunnel round trips to the device) and fixtures (remote page and
context setup), prints mean, p50 and p95, and writes the numbers to the job
summary and to a `browserstack-timings-*` artifact. Finding: pending the first
run with the reporter; the numbers are recorded in this section from the iPhone
shards' job summary.

## Alternatives considered

- **Playwright WebKit and Firefox on Linux.** Free and hermetic, but WebKit on
  Linux is not Safari, and it covers neither Edge nor real mobile devices.
- **Blocking gate on every PR.** The full suite is hours long, so it cannot gate
  merges; the lean tier is the PR signal instead.
- **Nightly only.** Cheap, but regressions would land on `main` and be found
  after the fact, so the lean tier on PRs complements the nightly full run.

## Consequences

- Real-engine regressions are visible on the PR (lean) and on `main`/nightly
  (full), but do not stop a merge; a maintainer must look at the red check.
- CI depends on a sponsored third-party service. If the plan lapses on
  2027-10-10 and is not renewed, the workflow must be removed.
- Fork PRs get no cross-browser signal until a maintainer re-runs the workflow
  with secrets available.
- Several concurrent PRs can exceed 5 parallels (4 sessions per lean run);
  BrowserStack queues the extra sessions, which only lengthens wall time.
- Failures print in the job log (`list` reporter) and the HTML report is
  uploaded on failure.
