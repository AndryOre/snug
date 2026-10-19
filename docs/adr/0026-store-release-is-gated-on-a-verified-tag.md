# 26. A store release is gated on a verified tag

## Status

Accepted.

## Context

`release.yml` builds the extension and publishes it to the Chrome Web Store and
Edge Add-ons. Today nothing checks that the tag points at a commit on `main`, or
that CI passed on that commit, before the publish jobs run. A tag pushed from a
side branch, or from a commit whose checks are red, would reach both stores.

Store publishing cannot be rolled back: a published version stays in review
history, and users on the stable channel receive it.

## Decision

- `release.yml` gets a read-only `verify` job that every publish job needs.
- `verify` fails unless all of these hold:
  - the tagged commit is an ancestor of `main`;
  - the `CI passed` check is green on that SHA, polled until it settles;
  - `check`, `test` and the build pass again on the tagged commit.
- Publishing a version that a store already has is a no-op, so re-running a
  release does not fail.
- The workflow invariants test covers the job, so removing the gate fails CI.

## Alternatives considered

- **Branch protection on tags only.** It stops who can tag, not what is tagged,
  and says nothing about CI state.
- **Trust the person tagging.** This is the current behavior; it fails the first
  time someone tags the wrong commit.

## Consequences

- A release takes a few minutes longer, mostly polling and the repeated build.
- A red or off-`main` tag stops before any store sees it.
