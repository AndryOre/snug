# 19. The Guide and Release notes live on the Website, built with Starlight

## Status

Accepted. Extends
[ADR 0013](0013-landing-islands-for-faq-and-language-switcher.md) and keeps
[ADR 0011](0011-landing-static-site-no-third-party-scripts.md) and
[ADR 0017](0017-landing-umami-cloud-cookieless-analytics.md) intact.

## Context

The Website sent visitors to GitHub for the usage guide and the changelog, both
English only, and the guide was not linked at all. AO-1267 brings them onto the
Website in every locale. The sibling project animated-fluent-emojis already
solved the same problem with Astro and Starlight on the same Astro version.

## Decision

- The Guide (`/guide/`) and What's new (`/changelog/`) are built with Starlight,
  with the Website's header, footer and theme overriding Starlight's chrome.
- The English source is the repository itself: `docs/usage.md`,
  `docs/guide/*.md` and `CHANGELOG.md` are read at build time through an
  allowlist. Nothing is copied into the site.
- Translations live in `apps/site/src/content/translations/<locale>/` with a
  `sourceHash` of the English source. A missing or stale translation renders the
  English text with a notice, so no locale ever lacks a page. Translations are
  AI-made with no human review, as in
  [ADR 0018](0018-translated-privacy-policy-english-prevails.md).
- The App's What's new keeps the highlights; the Website shows the full Release
  notes from `CHANGELOG.md`.
- Starlight's search (Pagefind, self-hosted), table of contents, mobile sidebar
  and Copy Markdown button are sanctioned scripts on these pages, in addition to
  the islands in ADR 0013. No third-party request is added.
- Search needs `'wasm-unsafe-eval'` in `script-src` (Pagefind runs as
  WebAssembly) and nothing else: `'unsafe-eval'` stays out.
- `require-trusted-types-for 'script'` (ADR 0017) stays. Pagefind writes result
  excerpts through `innerHTML` and starts its search worker with
  `new Worker(url)`, both Trusted Types sinks. The Guide registers one `default`
  policy (`src/docs/search-trusted-types.ts`): HTML passes only with every tag
  but `<mark>` turned into text, and the only script URL it lets through is the
  same-origin `/pagefind/pagefind-worker.js`. It defines no script callback.
  Without Trusted Types support the policy is not registered and is not needed.

## Considered Options

- **Hand-built Astro pages on the privacy pattern**: rejected. Cheaper for one
  page, but search, sidebar, pagination and room for more guides would all be
  rebuilt by hand.
- **One structured source generating CHANGELOG.md and What's new**: rejected for
  now. It would merge two documents with different lengths on purpose.

## Consequences

- Cutting a release adds a translation step for the new CHANGELOG section in
  nine locales; a drift test fails the build when a `sourceHash` no longer
  matches.
- The site carries Starlight's chrome CSS, ported from animated-fluent-emojis,
  next to the landing styles, and its inline scripts need CSP hashes.
