# 0025: A real iPhone is not automated on BrowserStack

## Status

Accepted. Partly supersedes
[0024](0024-cross-browser-coverage-on-browserstack.md): the iPhone 15 part.

Date: 2026-10-17

Revised: 2026-10-21, Status relation wording now uses the linked phrase form,
recorded on both sides.

## Context

ADR 0024 put a real iPhone 15 in the full tier, sharded four ways. Every full
run of it failed 196 to 234 tests per shard. A lean run from a branch with skips
for iOS limits still ended with 88 failures, 85 flaky and 2 passed in 2.4 hours.

BrowserStack does not run full Playwright on iOS. It translates a subset of the
Playwright commands to Safari:

- `page.emulateMedia` is rejected ("Unsupported Playwright command on iOS").
- A second browser context is rejected ("Only one browser context is allowed"),
  so one failed test leaves its context open and the next tests fail in fixture
  setup.
- Chained locators such as `locator(a).locator(b)` resolve to "Element not found
  or stale", and `click` and `focus` report "No elements found".

The layout specs use all three, so most of them cannot run on an iPhone.

## Decision

- The iPhone leaves the automated BrowserStack matrix, the `iphone` option of
  `workflow_dispatch` and `apps/site/browserstack.yml`.
- A real iPhone stays covered by hand in the Live checklist
  ([`docs/testing/browserstack-live-checklist.md`](../testing/browserstack-live-checklist.md)).
- Safari macOS keeps covering WebKit behavior; Pixel 8 keeps covering a real
  mobile device.

## Alternatives considered

- **Patch each failing spec for iOS.** About 90 cases, each found only after a 2
  hour run, and the result would test less than it appears to.
- **A small iOS smoke subset.** Possible later, written for the commands iOS
  supports; not needed to get a reliable signal now.

## Consequences

- The full run drops from about 4 hours to about 1.5 hours and no longer depends
  on sharding for one platform.
- iOS-only regressions are found by the manual checklist, not by CI.
