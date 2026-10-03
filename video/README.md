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

## Audio

`Promo` mixes a music bed and a low-volume SFX layer (`src/audio/`).

- **Music:** `public/music/track.mp3` through `@remotion/media` `Audio`, 1 s
  fade in, 2 s fade out. The `music` prop (default `music/track.mp3`) is
  dropped to `null` when the file is missing, so the render is silent and logs
  one warning instead of failing. Pass `--props='{"locale":"en","music":null}'`
  to force it.
- **Beats:** `src/audio/beats.ts` holds the BPM, the first-beat frame and
  `BEAT_FRAMES`. The storyboard cuts (105, 330, 540, 705, 795) land within 5
  frames of a half-beat at 79 BPM; the track is delayed so the grid matches.
  The tempo is an onset-autocorrelation estimate, so confirm by ear and update
  `BPM` and `FIRST_BEAT_FRAME` when you swap tracks.
- **SFX:** `public/sfx/*.ogg`, CC0 from Kenney (see `public/sfx/LICENSE.md`),
  cued in `src/audio/cues.ts` on cursor clicks, the row ticks and chip fan-out
  in Export, the file landing, the Import toast, and each scene transition.
  Scenes export their cue frames (`EXPORT_AUDIO_FRAMES`, `IMPORT_AUDIO_FRAMES`).

### Music credit

Needed to dispute a Content ID claim on YouTube.

- Title: Calm Piano 1 (Vaporware)
- Artist: cynicmusic (The Cynic Project)
- Source: https://opengameart.org/content/calm-piano-1-vaporware
- License: CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/
- File: `public/music/track.mp3` (first 40 s of candidate 1)

Pixabay Music sits behind a Cloudflare challenge that blocks headless
browsers, so the shortlist comes from OpenGameArt (CC0). The other two
candidates, `candidates/2-another-august-cynicmusic.mp3` and
`candidates/3-contemplation-cynicmusic.mp3`, stay in
`public/music/candidates/` until a track is chosen. To switch, copy the pick
over `track.mp3` and update this credit and `beats.ts`.

## Render performance

`remotion benchmark` on the 16-core host (one run each, ja): concurrency 4
took 32.0 s, 8 took 25.8 s, 12 took 24.4 s. `render-all.ts` defaults to
`--concurrency 8`: the gain beyond it is small and it leaves memory for other
processes. Override with `bun run video:render -- --concurrency 12`.

Motion blur was not added: no scene has a move fast enough to smear at 30 fps,
and the cross-fade hand-offs (hook to export, export to import match-cut, local
to proof) were checked frame by frame and read cleanly.
