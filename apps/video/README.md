# Snug promo video

Remotion project that renders the 30 s, 1920x1080, 30 fps H.264 Chrome Web Store
promo, one file per locale (en, es, de, fr, it, ja, ko, pt_BR, ru, zh_CN). It is
a bun workspace (`@snug/video`): see
[ADR 0010](../../docs/adr/0010-bun-workspaces-monorepo.md).

## Setup

One `bun install` at the repo root sets up the video. Then:

```sh
bun run check
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

## YouTube thumbnails

```sh
bun run video:thumbnails
```

Renders the `Thumbnail` still (1280x720, `locale` prop, hook from `VIDEO_COPY`)
for all 10 locales through `renderStill` into
`docs/brand/youtube/thumbnails/<locale>.png`, failing if any is not 1280x720 or
exceeds 2 MB. Text stays out of the bottom-right 20%, where YouTube overlays the
duration badge. Set `REMOTION_BROWSER_EXECUTABLE` as in Setup if needed.

## Layout

- `src/Promo.tsx` wires the scenes with `TransitionSeries` (12-frame
  transitions, durations inline so Studio can edit them).
- `src/scenes/{hook,export,import,auto-export,local,cta}.tsx` one file per
  scene.
- `src/copy/` typed access to `../../extension/locales/*.json` and
  `../../extension/e2e-store/captions.ts`; video-only strings are in
  `video-copy.ts`.
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

`Promo` mixes a music bed and a low-volume SFX layer (`src/audio/`). All audio
is Epidemic Sound (Pro plan, content published while subscribed stays cleared)
and **local only**: the repo is public, so `public/music/` and
`public/sfx/epidemic/` are gitignored. A clean clone renders silent and warns
once per missing layer (`music` prop falls back to `null`, `sfx` to `false`).

- **Music:** `public/music/track.wav` through `@remotion/media` `Audio`, 1 s
  fade in, 2 s fade out, gain 0.42 so the master (about -9.5 LUFS) sits calmly
  under the SFX. The last `en` render measured -16.7 LUFS, sample peak -3.8
  dBFS.
- **Beats:** `src/audio/beats.ts`. The track is 120 BPM, so a beat is 15 frames
  and every storyboard cut (105, 330, 540, 705, 795) is on a beat. The Epidemic
  edit starts on a bar, so `FIRST_BEAT_FRAME` is 0; confirm by ear if you swap
  tracks.
- **SFX:** cues in `src/audio/cues.ts` (cursor clicks, row ticks, chip pops, the
  file landing, the Import toast, the CTA chime, and a whoosh before each cut
  that peaks on the cut). The six production files are peak-normalized to -3
  dBFS at 48 kHz; the `VOLUME` table assumes that. After re-downloading a sound
  (IDs below), normalize it with:

  ```sh
  ffmpeg -i <download>.wav -af "aresample=48000,volume=<-3 - peak>dB" -c:a pcm_s16le public/sfx/epidemic/<name>.wav
  ```

  Measure `<peak>` with `ffmpeg -i <download>.wav -af volumedetect -f null -`.

### Epidemic assets

Re-download through the Epidemic MCP server (`DownloadRecordingEdit`,
`DownloadSoundEffect`, WAV).

| File                 | Epidemic title                                                     | ID                                     |
| -------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| `music/track.wav`    | Comes Back Around (Instrumental Version), Mindme, 30 s edit        | `de69a51e-c47f-4432-8240-f10a669bb442` |
| `sfx/.../click.wav`  | Computers, Keyboard & Mouse, Mouse, Apple, Mighty Mouse, Click     | `78e23a2d-c645-491d-b826-c5ca15d1efdd` |
| `sfx/.../tick.wav`   | User Interface, Alert, Notifications, Notification, Digital, Tick  | `045d6e1e-742f-4cbb-98b3-6fe37fb84eae` |
| `sfx/.../pop.wav`    | User Interface, Alert, Notifications, Notification, Alert, Digital | `bd861aa9-7b82-4f9f-afaa-355c83984107` |
| `sfx/.../whoosh.wav` | Designed, Whoosh, Soft Resonant                                    | `3eb43b90-168b-404b-b6c2-28c69e53754b` |
| `sfx/.../chime.wav`  | Musical, Chime, Twinkle, Wood, Positive, Short 02                  | `fa5cf124-455f-48af-a76f-74672dcf88f8` |
| `sfx/.../thud.wav`   | User Interface, Alert, Warnings, Dull, Info                        | `a5dfd170-3cda-4a57-a99f-42a6928d44f1` |

The music is a server-side edit: run `EditRecording` on the recording ID with
`targetDurationMs` 30000 and `forceDuration`, then `DownloadRecordingEdit`.

## Render performance

`remotion benchmark` on the 16-core host (one run each, ja): concurrency 4 took
32.0 s, 8 took 25.8 s, 12 took 24.4 s. `render-all.ts` defaults to
`--concurrency 8`: the gain beyond it is small and it leaves memory for other
processes. Override with `bun run video:render -- --concurrency 12`.

Motion blur was not added: no scene has a move fast enough to smear at 30 fps,
and the cross-fade hand-offs (hook to export, export to import match-cut, local
to proof) were checked frame by frame and read cleanly.
