# 15. Edge Add-ons publishing from the release workflow

## Status

Accepted

## Context

Snug has an Edge Add-ons listing that stopped receiving updates, while releases
only reached the Chrome Web Store (see
[ADR 0005](0005-store-publishing-via-cws-api-v2.md)). Edge is the only Chromium
store besides the Chrome Web Store worth the maintenance cost.

Edge Add-ons policy 1.1.2 forbids a listing from referencing other browsers, so
the Edge package cannot share the Chrome build: store links and copy are chosen
at build time from the target browser.

The Edge Add-ons API (v1.1) covers package lifecycle only: upload and publish.
It exposes no listing text, screenshots, or privacy fields. It authenticates
with a client ID and an API key generated in Partner Center, and the key expires
every 72 days.

## Decision

- Edge uses its own build: `bun run zip` runs `wxt zip && wxt zip -b edge`,
  yielding `snug-X.Y.Z-chrome.zip`, `snug-X.Y.Z-edge.zip`, and a single sources
  zip.
- `release.yml` attests both zips and attaches them to the GitHub Release, then
  uploads the Edge zip as the `edge-extension-zip` artifact.
- A dedicated job, `publish-edge-add-ons`, runs `wxt submit --edge-zip` and
  depends only on the `release` job, never on the Chrome Web Store job.
- Its secrets (`EDGE_PRODUCT_ID`, `EDGE_CLIENT_ID`, `EDGE_API_KEY`) live in a
  dedicated `edge-add-ons` GitHub Environment, with a guard step that names any
  missing secret.
- Authentication is API key based and the key is rotated every 72 days in
  Partner Center (Publish API); Microsoft emails reminders.
- **Out of scope:** listing metadata, which the Edge API does not cover. It
  stays Partner Center-managed.

## Consequences

- A signed `v*` tag drives the GitHub Release, the Chrome Web Store, and Edge
  Add-ons from one workflow run.
- A failure or an expired key on one store does not block the other.
- The 72-day key rotation is a recurring manual task; an expired key surfaces as
  a failed `publish-edge-add-ons` job.

### Rejected alternatives

- **Opera and Whale**: not worth the maintenance for their user share.
- **A single shared zip**: Edge policy 1.1.2 forbids references to other
  browsers in the listing, so the Chrome build cannot ship there.
- **Adding Edge to the existing Chrome Web Store job**: one store failing would
  block the other.
