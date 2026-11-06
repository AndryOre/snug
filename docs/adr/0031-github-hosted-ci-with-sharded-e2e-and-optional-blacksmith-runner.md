# 0031: GitHub-hosted CI with sharded E2E and an optional Blacksmith runner

## Status

Accepted.

Date: 2026-11-06

## Context

A full CI run took about 23 minutes per PR (median of 15 runs). About 21 of
those minutes were the site E2E suite: 4169 Playwright tests on 2 workers in a
single `e2e` job. Every other job finishes in a few minutes.

The andryorelabs CI runner standard v1.1 applies to every repository in the
organization:

- Light jobs (lint, format, title and link checks, aggregators) may run on a
  Blacksmith runner, chosen by the optional `BLACKSMITH_RUNNER` repository
  variable. When the variable is unset, they run on `ubuntu-latest`.
- Pull requests from forks always run on `ubuntu-latest`, so outside code never
  reaches a paid runner.
- Heavy jobs, release and deploy jobs, CodeQL, Scorecard and Lighthouse keep a
  literal `ubuntu-latest`.
- No job runs on a VPS or a self-hosted runner.

Snug is a public repository, and that changes the cost picture:

- GitHub-hosted runners are free for public repositories, with no minute limit.
  Blacksmith minutes are not.
- A GitHub-hosted runner for a public repository has 4 vCPU. The Blacksmith
  runner the standard names, `blacksmith-2vcpu-ubuntu-2404`, has 2.
- Snug's light jobs alone use about 3,700 minutes a month, more than the 3,000
  Blacksmith minutes the organization shares across all its repositories.
- A self-hosted runner or VPS on a public repository would run code from any
  pull request on a machine we own. That is a security risk we don't take.

## Decision

Snug stays on GitHub-hosted runners and applies the standard in its optional
form:

- **Sharded E2E.** The `e2e` job in `ci.yml` is a matrix of 4 shards
  (`fail-fast: false`), named `E2E (Playwright N/4)`. Each shard runs
  `turbo run test:e2e` with `--shard=N/4` forwarded to Playwright, and the site
  Playwright config sets `fullyParallel: true` so a shard splits inside files.
  Failure reports upload under per-shard artifact names. `CI passed` keeps its
  name, needs `e2e`, and fails when any shard fails or is cancelled.
- **Routed light jobs.** Only these jobs use
  `${{ github.event.pull_request.head.repo.fork && 'ubuntu-latest' || vars.BLACKSMITH_RUNNER || 'ubuntu-latest' }}`:
  `ci.yml:quality`, `ci.yml:changes`, `ci.yml:commitlint`, `ci.yml:ci-passed`,
  `lint-pr.yml:validate-title`, `lint-docs.yml:check-links`,
  `lint-workflows.yml:lint` and `labels.yml:sync`. On `push`, `schedule` and
  `workflow_dispatch`, `github.event.pull_request` is null, so the expression
  falls through to the variable and then to `ubuntu-latest`.
- **Literal `ubuntu-latest` everywhere else.** `ci.yml:build`, the `ci.yml:e2e`
  shards, all of `browserstack.yml`, `site-quality.yml` (Lighthouse),
  `release.yml`, `deploy-site.yml`, `scorecard.yml` and `codeql.yml`.
- **The variable stays unset in snug.** Every job runs on `ubuntu-latest` today.

`scripts/workflows-invariants.test.ts` guards this. `ROUTED_JOBS` lists the
routed jobs as `<file>:<job>`, and the test fails when a routed job does not use
`ROUTED_RUNS_ON` exactly, when any other job has a `runs-on` that is not a
literal `ubuntu-latest` or reads `vars.BLACKSMITH_RUNNER`, or when a runner
label matches `vps-*` or `self-hosted`.

To turn routing on:

```sh
gh variable set BLACKSMITH_RUNNER --body blacksmith-2vcpu-ubuntu-2404
```

To roll back:

```sh
gh variable delete BLACKSMITH_RUNNER
```

Neither step needs a code change.

### Considered options

- **Route the light jobs to Blacksmith now** — follows the standard to the
  letter, but pays for minutes GitHub gives a public repository for free, on
  half the vCPU, and uses more than the organization's shared quota.
- **Run E2E on a VPS or self-hosted runner** — faster hardware, but it runs
  pull-request code on a machine we own.
- **Keep one E2E job** — no change, and every PR keeps waiting about 21 minutes
  on a single job.

## Consequences

- E2E wall time drops to about a quarter of the old site suite, plus setup per
  shard. Four shards use more total runner minutes than one job, which costs
  nothing on a public repository.
- A shard can be empty (an `--affected` run that touches one package, or the
  extension's few specs split 4 ways) and must still pass.
- Snug matches the organization standard. Turning Blacksmith on, or off again,
  is one repository variable.
- Adding a job means choosing: add it to `ROUTED_JOBS` and use the routed
  expression, or give it a literal `ubuntu-latest`. The invariant test rejects
  anything else.
- No required status check was added or renamed.
