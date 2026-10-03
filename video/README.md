# Snug promo video

Remotion project that renders the 30 s, 1920x1080, 30 fps H.264 Chrome Web Store
promo, one file per locale (en, es, de, fr, it, ja, ko, pt_BR, ru, zh_CN). It is
an isolated bun package, not a workspace: see
[ADR 0009](../docs/adr/0009-promo-video-isolated-remotion-package.md).

## Setup

From the repo root:

```sh
bun run video:install
bun run video:check
```

The first still or render downloads Chrome Headless Shell. If that fails on
missing system libraries, point Remotion at the Playwright headless shell and
never use sudo:

```sh
export REMOTION_BROWSER_EXECUTABLE=$(ls ~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell | tail -1)
```

`render-all.ts` honours this variable. For `still`, pass
`--browser-executable=$REMOTION_BROWSER_EXECUTABLE`.

## Studio

Over Tailscale, always start Studio through the package script, which runs
`remotion-studio src/index.ts --port 3123`. Never run a bare `remotion studio`:
it listens on all interfaces.

```sh
bun run video:studio
```

Studio has the `Promo` composition, a `Scenes` folder (one composition per
scene) and a `Locales` folder (one connected composition per locale).

## Stills and renders

```sh
bun run video:still -- Promo out/f.png --frame=0 --props='{"locale":"ja"}'
bun run video:render
bun run video:render -- --locales en,ja
```

`video:render` bundles once, renders `out/snug-promo-<locale>.mp4` for each
locale, then checks every file with ffprobe: duration 30 s +/- 0.1, 1920x1080,
30 fps, and an audio stream when `public/music/track.mp3` exists.

## Layout

- `src/Promo.tsx` wires the scenes with `TransitionSeries` (12-frame
  transitions, durations inline so Studio can edit them).
- `src/scenes/{hook,export,import,auto-export,local,cta}.tsx` one file per scene.
- `src/copy/` typed access to `../locales/*.json` and
  `../e2e-store/captions.ts`; video-only strings are in `video-copy.ts`.
- `src/theme.ts` brand tokens ported from `docs/brand/tokens.css`.
- `public/fonts/` vendored Geist, Geist Mono and Space Grotesk (OFL). ja, ko and
  zh_CN use Noto Sans via `@remotion/google-fonts`; ru uses Geist for display
  text because Space Grotesk has no Cyrillic.

## Storyboard

900 frames at 30 fps.

| Scene       | Frames  | File                     |
| ----------- | ------- | ------------------------ |
| Hook        | 0-105   | `scenes/hook.tsx`        |
| Export      | 105-330 | `scenes/export.tsx`      |
| Import      | 330-540 | `scenes/import.tsx`      |
| Auto-export | 540-705 | `scenes/auto-export.tsx` |
| Local       | 705-795 | `scenes/local.tsx`       |
| Proof + CTA | 795-900 | `scenes/cta.tsx`         |
