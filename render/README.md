# Sudan Digital — 45s Vertical Promo (deterministic render pipeline)

The deliverable master is **`public/out/sudan-digital-45s.mp4`**:

| spec | value |
| --- | --- |
| duration | 45.000 s (`2700` frames) |
| fps | 60 |
| resolution | 1080 × 1920 (9:16 vertical) |
| video | H.264 High, level 4.2, `yuv420p`, faststart |
| audio | AAC 192 kbps, 44.1 kHz, stereo |
| audio source | `public/assets/processed/master-audio-45s.mp3` (never re-synthesised) |
| captions | Arabic word-by-word, timings taken verbatim from `src/remotion/timelineData.ts` |

Optional 4K composition: **2160 × 3840** (`SudanDigitalPromo4K` in Remotion, and
`npm run render:frames:4k && bash render/render-final.sh --4k`).

## Why there are two renderers

`src/remotion/**` stays the authoring surface (Studio preview, timeline, tests).
The final MP4 is produced by the **deterministic Node + ffmpeg pipeline** in
`render/`, because it needs no browser: Chromium cannot be downloaded in this
environment (`storage.googleapis.com` / `remotion.media` are unreachable), and a
pure-function frame renderer also guarantees the exact same 2700 frames on every
run. The two paths share one source of truth — `render/export-timeline.mjs`
compiles `src/remotion/timelineData.ts` into `build/render-data/timeline.json`,
which drives every caption, scene boundary and colour in the renderer.

## Pipeline

```bash
npm run render:timeline   # timelineData.ts  -> build/render-data/timeline.json
npm run render:footage    # supplied clips  -> build/footage/*/f*.jpg (9:16 cover, graded, muted)
npm run render:frames     # 2700 stills     -> build/frames/f*.jpg  (0.1 s/frame)
npm run render:mux        # ffmpeg          -> public/out/sudan-digital-45s.mp4
npm run render:verify     # ffprobe asserts -> manifest + verification stills
# or all of it:
npm run render:final
```

`render/frame.mjs` accepts `--width` / `--height` (1080×1920 default, 2160×3840 for
4K) and `--frames 0,600,1200` to render individual verification stills.

## Scene map (frames @ 60 fps)

| scene | frames | seconds | content |
| --- | --- | --- | --- |
| 1 intro | 0–240 | 0.00–4.00 | logo bumper → hook «بتأجل تطوير مشروعك لحدي متين؟» |
| 2 drop-off | 240–690 | 4.00–11.50 | storefront page, «السعر كم؟» chat, journey counters, customer disappears |
| 3 diagnosis | 690–1170 | 11.50–19.50 | السعر ✓ / المنتج ✓ → «صفحتك ما ادتو سبب كافي» + ورقة «شنو المانع تبدأ؟» (الوقت · النتيجة · الخوف من التجربة) |
| 4 solution | 1170–1740 | 19.50–29.00 | team footage → المحتوى / التصميم / إدارة الصفحات → sorted page handoff |
| 5 experience | 1740–2250 | 29.00–37.50 | funnel + journey rail → «تم تأكيد الطلب بنجاح» |
| 6 end card | 2250–2700 | 37.50–45.00 | logo lockup, «خيارك الأفضل», tagline + CTA + contacts |

Audio is the supplied VO untouched; video-plate audio is discarded twice
(`-an` in `prep-footage.sh`, and only the mastered MP3 is muxed in `render-final.sh`).

## Gotcha: never end a text wipe mask at the baseline

The kinetic title card in scene 1 reveals each line by drawing it inside a
`rect` clip. Alexandria carries every Arabic descender / joiner tail about
`0.30em` **below** the baseline, so a mask whose bottom edge sits on the
baseline shaves the joiners off every glyph in the line. The result looks
exactly like broken Arabic shaping — «بتأجل تطوير» reads as «شأجل ت طهب» —
even though the shaping is perfect and the run's bounding box is unchanged.
That single bug shipped in the first cut of this render and was only visible
after a still-by-still QA pass.

Keep at least `1.9em` of headroom under the baseline (`frame.mjs`,
`sceneIntro` → hook title card). The same applies to any future
`ctx.clip()` used as a text mask.

## Studio (web preview + download)

```bash
npm run dev   # binds 0.0.0.0:3000
```

* `GET /api/video-info` — readiness + verified specs from the render manifest
* `GET /api/download-mp4` — streams the master with `Content-Disposition: attachment`
* `GET /out/sudan-digital-45s.mp4` — direct playable copy (`Accept-Ranges: bytes`)

The verified master is also mirrored to `artifacts/sudan-digital-45s.mp4` so it
can be downloaded straight out of the workspace, next to its manifest.

## Checks

```bash
npx tsc --noEmit
npx vitest run
```
