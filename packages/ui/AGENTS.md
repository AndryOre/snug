# AGENTS.md — `packages/ui`

Stack rules for `@workspace/ui`. Repo-wide rules are in the root
[`AGENTS.md`](../../AGENTS.md).

## Stack

The shared shadcn/ui registry layer and theme tokens: `src/components/**`,
`src/hooks/**`, `src/lib/utils.ts` and `src/styles/globals.css`, consumed by
workspaces as `@workspace/ui/*`.

## `src/components/**` is untouchable

This is the shadcn/ui-generated registry layer. Do not hand-edit it — add or
change components via `shadcn` CLI conventions instead, and keep customizations
in consumer components.
