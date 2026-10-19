# 27. Practices parity with Animated Fluent Emojis

## Status

Accepted.

## Context

Snug and Animated Fluent Emojis (AFE) are maintained by the same person and
started from the same template. They drifted: AFE enforces more invariants in
tests (ADRs, workflows, coverage), and Snug runs more checks on the site (device
matrix, CSP header, structured data). A fix in one repo rarely reached the
other.

## Decision

- Parity is the default. Both repos use the same tooling, gates, docs layout and
  style unless a practice does not apply to the repo's domain.
- A difference is allowed only when it is written in the table below, as `N/A`,
  `Deferred` or `Equivalent`, with the reason. Cost and preference are not
  reasons.
- AFE records the same table in its own ADR; the two copies are mirrors.

| Practice                                  | Snug        | AFE        | Reason                                                                                                      |
| ----------------------------------------- | ----------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| Build-time code highlighting              | N/A         | Applies    | Snug shows no code outside Starlight                                                                        |
| Dynamic OG images                         | N/A         | Applies    | Snug has a handful of pages, AFE has one per emoji                                                          |
| Privacy page                              | Applies     | N/A        | AFE has no analytics                                                                                        |
| Launch kit and store runbooks             | Applies     | N/A        | AFE publishes to npm, not to stores                                                                         |
| Build provenance                          | Attestation | Equivalent | npm trusted publishing already gives AFE provenance                                                         |
| BrowserStack and Percy                    | Applies     | Deferred   | BrowserStack OSS approval is per repo and AFE has none yet                                                  |
| `FUNDING.yml`                             | None        | None       | Removed from AFE; neither repo asks for sponsors                                                            |
| Docs testing checklist                    | Applies     | N/A        | Tied to BrowserStack, which AFE defers                                                                      |
| Package gates (publint, attw, size-limit) | N/A         | Applies    | Snug ships no npm package; AO-2172 adds a size budget on the extension zip, which makes this row Equivalent |
| Asset pipeline and sync-assets            | N/A         | Applies    | Only AFE builds and publishes emoji assets                                                                  |
| Promo video (Remotion)                    | Applies     | N/A        | Only Snug has a promo video                                                                                 |
| Extension and store E2E                   | Applies     | N/A        | AFE is a library, not an extension                                                                          |
| Umami analytics                           | Applies     | N/A        | AFE has no analytics, same reason as the privacy page                                                       |
| Cross-browser library tests               | N/A         | Applies    | Snug is Chromium-only; AFE is a multi-browser library                                                       |
| typescript-eslint preset                  | Deferred    | Applies    | Snug is on `recommendedTypeChecked`; `strictTypeChecked` is a follow-up ramp                                |

## Alternatives considered

- **Keep the repos independent.** Each fix would be rediscovered by hand and the
  gap would keep growing.
- **Extract a shared template repo.** Too much machinery for two repos; the
  mirrored table is enough to keep them honest.

## Consequences

- A new practice in one repo is a ticket in the other, or a row in the table.
- Review of either repo can check the table instead of rediscovering the gap.
