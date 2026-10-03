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
30 fps, and an audio stream when `public/music/track.wav` exists.

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

`Promo` mixes a music bed and a low-volume SFX layer (`src/audio/`). All
audio is Epidemic Sound (Pro plan, content published while subscribed stays
cleared) and **local only**: the repo is public, so `public/music/` and
`public/sfx/epidemic/` are gitignored. A clean clone renders silent and warns
once per missing layer (`music` prop falls back to `null`, `sfx` to `false`).

- **Music:** `public/music/track.wav` through `@remotion/media` `Audio`, 1 s
  fade in, 2 s fade out, gain 0.6 so the master (about -9.5 LUFS) lands near
  -14 LUFS. The last measured `en` render was -13.9 LUFS, true peak -2.3 dBTP.
- **Beats:** `src/audio/beats.ts`. The track is 120 BPM, so a beat is 15
  frames and every storyboard cut (105, 330, 540, 705, 795) is on a beat. The
  Epidemic edit starts on a bar, so `FIRST_BEAT_FRAME` is 0; confirm by ear if
  you swap tracks.
- **SFX:** cues in `src/audio/cues.ts` (cursor clicks, row ticks, chip pops,
  the file landing, the Import toast, the CTA chime, and a whoosh before each
  cut that peaks on the cut). The six production files are peak-normalized to
  -3 dBFS at 48 kHz; the `VOLUME` table assumes that. Originals are in
  `public/sfx/epidemic/raw/`, alternates in `candidates/`. Normalize a
  replacement with:

  ```sh
  ffmpeg -i raw/<name>.wav -af "aresample=48000,volume=<-3 - peak>dB" -c:a pcm_s16le <name>.wav
  ```

  Measure `<peak>` with `ffmpeg -i raw/<name>.wav -af volumedetect -f null -`.

### Epidemic assets

Re-download through the Epidemic MCP server (`DownloadRecordingEdit`,
`DownloadSoundEffect`, WAV).

| File                 | Epidemic title                                              | ID                                     |
| -------------------- | ----------------------------------------------------------- | -------------------------------------- |
| `music/track.wav`    | Comes Back Around (Instrumental Version), Mindme, 30 s edit | `de69a51e-c47f-4432-8240-f10a669bb442` |
| `sfx/.../click.wav`  | User Interface, Click, UI Buttons, Glassy, Touch            | `45c94b43-2fb0-4970-98db-cc0fe6ea3678` |
| `sfx/.../tick.wav`   | User Interface, Click, UI Buttons, Simple, Select           | `d637e4e8-6846-496b-84f9-19f3f7b59539` |
| `sfx/.../pop.wav`    | User Interface, Click, UI Buttons, Bubbly, Option           | `19edc18a-387f-4987-9110-75d1abecc3fa` |
| `sfx/.../whoosh.wav` | Designed, Whoosh, Soft Airy                                 | `073cf199-3d1b-4a67-9128-a5abd13870ff` |
| `sfx/.../chime.wav`  | User Interface, Alert, Tonal, Soft Digital Confirm          | `d75eba4a-a132-4973-93b7-fabc9c748e4c` |
| `sfx/.../thud.wav`   | User Interface, Click, UI Buttons, Confirm, Dull            | `46216b97-17a4-48ec-a7ec-999132ef096a` |

The music is a server-side edit: run `EditRecording` on the recording ID with
`targetDurationMs` 30000 and `forceDuration`, then `DownloadRecordingEdit`.

## Render performance

`remotion benchmark` on the 16-core host (one run each, ja): concurrency 4
took 32.0 s, 8 took 25.8 s, 12 took 24.4 s. `render-all.ts` defaults to
`--concurrency 8`: the gain beyond it is small and it leaves memory for other
processes. Override with `bun run video:render -- --concurrency 12`.

Motion blur was not added: no scene has a move fast enough to smear at 30 fps,
and the cross-fade hand-offs (hook to export, export to import match-cut, local
to proof) were checked frame by frame and read cleanly.
