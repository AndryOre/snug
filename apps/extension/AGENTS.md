# AGENTS.md — `apps/extension`

Stack rules for `@snug/extension`. Repo-wide rules (scripts, commits, comments,
`@shadcn/lint`) are in the root [`AGENTS.md`](../../AGENTS.md).

## Stack

A Chrome MV3 web extension built with WXT (`@wxt-dev/module-react`), React 19,
TypeScript and Tailwind CSS v4. UI primitives and the theme come from
`@workspace/ui` ([`packages/ui/AGENTS.md`](../../packages/ui/AGENTS.md)). No
backend, no network calls — every operation reads and writes the browser's own
bookmarks tree. The code map is
[`docs/architecture.md`](../../docs/architecture.md).

## Rules

- The service worker (`entrypoints/background.ts`) has no DOM: anything needing
  `DOMParser` or `URL.createObjectURL` goes through a page or the offscreen
  document.
- Persist settings only through `storage.defineItem` with a `local:` key
  (`lib/storage.ts`).
- Every user-facing string goes through `@wxt-dev/i18n`; new locales follow
  [`docs/how-to/add-a-locale.md`](../../docs/how-to/add-a-locale.md).
- `lib/**` unit tests run on `fakeBrowser`; E2E specs in `e2e/**` run against
  the built extension. Detail:
  [`docs/development.md`](../../docs/development.md#fakebrowser-testing).
