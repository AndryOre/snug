# Architecture decision records

The rules for writing, editing and replacing ADRs are in
[`AGENTS.md`](../../AGENTS.md#architecture-decision-records).
`adr-invariants.test.ts` enforces them and that this index lists every ADR.

To add one, take the next number, write the file, and add a row below.

| Number | Title                                                                                                                                  | Status     | Superseded or amended by |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------ |
| 0001   | [Public repo security posture](0001-public-repo-security-posture.md)                                                                   | Accepted   | 0004 (partly)            |
| 0002   | [TSDoc-only code comments](0002-tsdoc-only-code-comments.md)                                                                           | Accepted   | -                        |
| 0003   | [E2E against the built extension](0003-e2e-against-built-extension.md)                                                                 | Accepted   | -                        |
| 0004   | [Enable CodeQL SAST](0004-enable-codeql-sast.md)                                                                                       | Accepted   | -                        |
| 0005   | [Store publishing via CWS API v2 from the release workflow](0005-store-publishing-via-cws-api-v2.md)                                   | Accepted   | -                        |
| 0006   | [Single hash-routed App shell](0006-single-app-hash-routed-shell.md)                                                                   | Accepted   | 0007                     |
| 0007   | [Legacy page redirects are the only extra entrypoints](0007-legacy-page-redirects.md)                                                  | Accepted   | -                        |
| 0008   | [Safety snapshot lives in extension storage and in a download](0008-safety-snapshot-in-extension-storage.md)                           | Accepted   | 0016                     |
| 0009   | [Promo video is an isolated Remotion package](0009-promo-video-isolated-remotion-package.md)                                           | Superseded | 0010                     |
| 0010   | [Bun workspaces monorepo with Turborepo](0010-bun-workspaces-monorepo.md)                                                              | Accepted   | -                        |
| 0011   | [Landing page is a static site with no third-party scripts](0011-landing-static-site-no-third-party-scripts.md)                        | Accepted   | 0017 (partly)            |
| 0012   | [Deploy secrets are dotenvx-encrypted in the repository](0012-dotenvx-encrypted-deploy-secrets.md)                                     | Superseded | 0022                     |
| 0013   | [Landing uses two React islands: FAQ accordion and language popover](0013-landing-islands-for-faq-and-language-switcher.md)            | Accepted   | 0019                     |
| 0014   | [Landing theme follows the system, with a stored override](0014-landing-theme-follows-system-with-stored-override.md)                  | Accepted   | -                        |
| 0015   | [Edge Add-ons publishing from the release workflow](0015-edge-add-ons-publishing.md)                                                   | Accepted   | -                        |
| 0016   | [Keep the latest five Safety snapshots](0016-keep-five-safety-snapshots.md)                                                            | Accepted   | -                        |
| 0017   | [Landing uses Umami Cloud cookieless analytics](0017-landing-umami-cloud-cookieless-analytics.md)                                      | Accepted   | -                        |
| 0018   | [The privacy policy is translated and the English text prevails](0018-translated-privacy-policy-english-prevails.md)                   | Accepted   | -                        |
| 0019   | [The Guide and Release notes live on the Website, built with Starlight](0019-guide-and-release-notes-on-the-website-with-starlight.md) | Accepted   | -                        |
| 0020   | [Save Auto-export to a Custom folder with the File System Access API](0020-custom-folder-via-file-system-access.md)                    | Accepted   | -                        |
| 0021   | [How-to pages are curated, data-driven pages, not a blog](0021-how-to-pages-are-curated-data-driven-pages-not-a-blog.md)               | Accepted   | -                        |
| 0022   | [The Coolify token is a GitHub secret, not a dotenvx-encrypted file](0022-coolify-token-as-github-secret.md)                           | Accepted   | -                        |
| 0023   | [Landing motion is CSS scroll-driven, no motion library](0023-landing-motion-is-css-scroll-driven-no-motion-library.md)                | Accepted   | -                        |
| 0024   | [Cross-browser coverage runs on BrowserStack, informational and tiered](0024-cross-browser-coverage-on-browserstack.md)                | Accepted   | 0025 (partly)            |
| 0025   | [A real iPhone is not automated on BrowserStack](0025-real-iphone-is-not-automated-on-browserstack.md)                                 | Accepted   | -                        |
| 0026   | [A store release is gated on a verified tag](0026-store-release-is-gated-on-a-verified-tag.md)                                         | Accepted   | -                        |
| 0027   | [Practices parity with Animated Fluent Emojis](0027-practices-parity-with-afe.md)                                                      | Accepted   | -                        |
