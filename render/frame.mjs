/**
 * Deterministic frame renderer for the Sudan Digital 45s vertical promo.
 *
 *   node render/render-frames.mjs --width 1080 --height 1920 --out build/frames
 *
 * Every frame is a pure function of its frame number: no clocks, no random
 * state, no browser. Rendering 1080x1920 is the identical code path as
 * 2160x3840 (the optional 4K composition) because every draw call is scaled by
 * `u = width / 1080`.
 */
import {createCanvas} from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  C,
  F,
  clamp,
  easeIn,
  easeInOut,
  easeOut,
  easeOutBack,
  easeOutExpo,
  fillRR,
  font,
  hGrad,
  halftone,
  iconTile,
  image,
  inv,
  lerp,
  lightSweep,
  measure,
  panel,
  radial,
  rand,
  rgba,
  rr,
  smooth,
  strokeRR,
  text,
  toArabicDigits,
  vGrad,
  wrap,
  svgIcon,
  svgImage,
  canvas as makeCanvas,
  broadcastRings,
  grain,
  grade,
  vignette,
  gridLines,
} from './lib/design.mjs';
import {PLATES, SHOTS, shotAt} from './lib/camera.mjs';
import {
  blockerSheet,
  brandLockup,
  captions,
  checkCard,
  confirmCard,
  cornerBug,
  counterCard,
  ctaButton,
  funnel,
  journeyLine,
  lowerThird,
  phonePage,
  pillarCard,
  registerIcons,
  serviceTile,
} from './lib/plates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'build/render-data/timeline.json'), 'utf8'));
const FPS = DATA.fps;
const W = 1080;
const H = 1920;
const FOOT_DIR = path.join(ROOT, 'build/footage');

/* --------------------------------------------------------------- arg parsing */
const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : dflt;
};
const OUT_W = Number(arg('width', 1080));
const OUT_H = Number(arg('height', 1920));
const OUT_DIR = path.resolve(arg('out', 'build/frames'));
const ONLY = arg('frames', null); // e.g. "0,600,1200" for verification stills
const START = Number(arg('start', 0));
const END = Number(arg('end', DATA.totalFrames));

const U = OUT_W / W;

/* ------------------------------------------------------------------ footage */
const FOOT = new Map();
const FOOT_LAST = new Map();
function foot(name) {
  if (FOOT.has(name)) return FOOT.get(name);
  const dir = path.join(FOOT_DIR, name);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.jpg'))
    .sort()
    .map((f) => path.join(dir, f));
  const imgs = files.map((f) => {
    const buf = fs.readFileSync(f);
    return {f, buf};
  });
  FOOT.set(name, imgs);
  return imgs;
}

const IMG = new Map();
const IMG_LIMIT = 160;
const loadImg = async (p) => {
  if (IMG.has(p)) {
    const v = IMG.get(p);
    IMG.delete(p);
    IMG.set(p, v); // LRU refresh
    return v;
  }
  const v = await svgImageSafe(p);
  IMG.set(p, v);
  if (IMG.size > IMG_LIMIT) IMG.delete(IMG.keys().next().value);
  return v;
};
async function svgImageSafe(p) {
  const {loadImage} = await import('@napi-rs/canvas');
  return loadImage(p);
}

const CHECK_ICON_PATH = path.join(ROOT, 'build/render-assets/check-white.png');
const LOGO_FULL = path.join(ROOT, 'public/assets/processed/logo-full-darkbg.png');
const LOGO_MARK = path.join(ROOT, 'public/assets/processed/logo-mark-darkbg.png');

/* ------------------------------------------------------- footage plate helper */
/**
 * Draw one graded vertical-footage plate as a full-bleed background layer.
 * `t` is the global time in seconds, `from`/`dur` are the clip in-point and
 * out-point (seconds inside the footage sequence) and `z` is the ken-burns
 * zoom range. The clip's own audio is never decoded — only stills.
 */
async function footagePlate(ctx, t, name, o = {}) {
  const {
    from = 0, dur = 5, z = [1.06, 1.16], pan = [0, 0], alpha = 1, flip = false,
  } = o;
  const frames = foot(name);
  const local = clamp((t - from) / dur, 0, 0.999);
  const idx = Math.min(frames.length - 1, Math.floor(local * (frames.length - 1)));
  let cached = FOOT_LAST.get(name);
  if (!cached || cached.idx !== idx) {
    cached = {idx, img: await loadImg(frames[idx].f)};
    FOOT_LAST.set(name, cached);
  }
  const im = cached.img;
  const zoom = lerp(z[0], z[1], local);
  const dw = OUT_W * zoom;
  const dh = OUT_H * zoom;
  const dx = (OUT_W - dw) / 2 + pan[0] * U * local;
  const dy = (OUT_H - dh) / 2 + pan[1] * U * local;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (flip) {
    // 2D mirror to refresh the frame after a cut (keeps the plate readable)
    ctx.translate(OUT_W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(im, dx, dy, dw, dh);
  ctx.restore();
  return idx;
}

/**
 * Draws the shot that is live at time `t` for a scene: the plate for the shot,
 * its ken-burns camera move and the mirror flag, then the purple grade bed.
 */
async function sceneBed(ctx, sceneId, t, opts = {}) {
  const shot = shotAt(sceneId, t);
  const plate = PLATES[shot.key];
  // map the shot's own timeline onto the 146 decoded stills of that plate
  const local = (t - plateOffset(sceneId, shot)) / (shot.out - shot.in);
  const frames = foot(plate.name);
  const idx = Math.max(0, Math.min(frames.length - 1, Math.floor(clamp(local) * (frames.length - 1))));
  let cached = FOOT_LAST.get(plate.name);
  if (!cached || cached.idx !== idx) {
    cached = {idx, img: await loadImg(frames[idx].f)};
    FOOT_LAST.set(plate.name, cached);
  }
  const im = cached.img;
  const zoom = lerp(shot.zoom[0], shot.zoom[1], shot.progress);
  const dw = OUT_W * zoom;
  const dh = OUT_H * zoom;
  const dx = (OUT_W - dw) / 2 + shot.pan[0] * U * shot.progress;
  const dy = (OUT_H - dh) / 2 + shot.pan[1] * U * shot.progress;
  ctx.save();
  ctx.globalAlpha *= opts.alpha ?? 1;
  if (shot.flip) {
    ctx.translate(OUT_W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(im, dx, dy, dw, dh);
  ctx.restore();
  return shot;
}

/** Start time of the shot that owns this plate, used to advance its stills. */
function plateOffset(sceneId, shot) {
  const shots = SHOTS.filter((s) => s.scene === sceneId);
  const same = shots.filter((s) => s.key === shot.key);
  const first = same[0] ?? shot;
  return first.in;
}

/* --------------------------------------------------------------- backgrounds */
function darkBG(ctx, t, o = {}) {
  const {violet = 0.42, glowY = 0.22, drift = 1} = o;
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, OUT_W, OUT_H);

  const dx = Math.sin(t * 0.9) * 60 * drift;
  const dy = Math.cos(t * 0.7) * 40 * drift;
  ctx.fillStyle = radial(ctx, OUT_W * 0.3 + dx * U, OUT_H * glowY + dy * U, 20, OUT_W * 1.05, [
    [0, rgba(C.primary, 0.42 * violet + 0.14)],
    [0.45, rgba(C.deep, 0.22)],
    [1, 'rgba(8,7,13,0)'],
  ]);
  ctx.fillRect(0, 0, OUT_W, OUT_H);

  ctx.fillStyle = radial(ctx, OUT_W * 0.92 - dx * U, OUT_H * 0.82 - dy * U, 20, OUT_W * 0.9, [
    [0, rgba(C.bright, 0.24)],
    [0.5, rgba(C.deep, 0.12)],
    [1, 'rgba(8,7,13,0)'],
  ]);
  ctx.fillRect(0, 0, OUT_W, OUT_H);

  gridLines(ctx, 0.045, 90 * U, t * 14);
}

/* --------------------------------------------------------------- transitions */
function diagonalShutter(ctx, p) {
  const e = easeInOut(p);
  const x = lerp(-1.25, 1.25, e) * OUT_W;
  ctx.save();
  ctx.translate(x, OUT_H / 2);
  ctx.transform(1, 0, -0.36, 1, 0, 0);
  ctx.translate(0, -OUT_H / 2);
  ctx.fillStyle = vGrad(ctx, 0, OUT_H, [
    [0, C.deep],
    [0.45, C.primary],
    [1, C.bg],
  ]);
  ctx.fillRect(-OUT_W * 0.55, -60, OUT_W * 1.1, OUT_H + 120);
  ctx.fillStyle = C.lavender;
  ctx.fillRect(OUT_W * 0.55 - 14, -60, 14, OUT_H + 120);
  ctx.fillStyle = rgba(C.bright, 0.7);
  ctx.fillRect(-OUT_W * 0.55, -60, 7, OUT_H + 120);
  ctx.restore();
}

function whipBars(ctx, p, dir = 1) {
  const e = Math.sin(clamp(p) * Math.PI);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const n = 16;
  for (let i = 0; i < n; i++) {
    const y = ((i / n) * OUT_H + rand(i) * 60) % OUT_H;
    const hh = (6 + rand(i + 3) * 26) * U;
    const off = (rand(i + 7) - 0.5) * OUT_W * 2 * e * dir;
    const w = OUT_W * (0.3 + rand(i + 11) * 0.7);
    const x = (i % 2 === 0 ? off : -off) - w / 2;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, 'rgba(196,181,253,0)');
    g.addColorStop(0.5, `rgba(196,181,253,${0.34 * e})`);
    g.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, hh);
  }
  ctx.restore();
  ctx.fillStyle = `rgba(255,255,255,${0.30 * e * e})`;
  ctx.fillRect(0, 0, OUT_W, OUT_H);
}

function zoomTransition(ctx, p) {
  const e = clamp(p);
  // radial white/violet bloom that collapses onto the cut
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const a = Math.sin(e * Math.PI);
  ctx.fillStyle = radial(ctx, OUT_W / 2, OUT_H / 2, OUT_W * 0.02, OUT_W * 0.85, [
    [0, `rgba(255,255,255,${0.55 * a * a})`],
    [0.25, `rgba(196,181,253,${0.30 * a})`],
    [1, 'rgba(109,40,217,0)'],
  ]);
  ctx.fillRect(0, 0, OUT_W, OUT_H);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = a * 0.9;
  ctx.strokeStyle = rgba(C.lavender, 0.85);
  ctx.lineWidth = 4 * U;
  ctx.beginPath();
  ctx.arc(OUT_W / 2, OUT_H / 2, lerp(OUT_W * 0.1, OUT_W * 0.95, easeOutExpo(e)), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/* --------------------------------------------------------------- scene 1 (0-4s) */
async function sceneIntro(ctx, f, t) {
  const u = f / 240;

  // ---------- ultra-dark bumper open (0-10f) with a 2D logo line reveal
  darkBG(ctx, t, {violet: 0.6, glowY: 0.3});
  ctx.save();
  broadcastRings(ctx, OUT_W / 2, OUT_H * 0.5, 380 * U, t * 0.12, {alpha: 0.3, alpha2: 0.35});
  ctx.restore();
  halftone(ctx, 0, OUT_H * 0.62, OUT_W, OUT_H * 0.38, 0.1);

  // bumper (frames 0..128)
  if (f < 116) {
    const out = 1 - easeIn(inv(f, 92, 114));
    const e = easeOutExpo(inv(f, 2, 40));
    const logo = await loadImg(LOGO_FULL);
    const w = 720 * U;
    const h = (660 / 1390) * w;
    ctx.save();
    ctx.globalAlpha = out;
    // soft stage plate behind logo
    panel(ctx, OUT_W / 2 - 400 * U, OUT_H * 0.5 - 250 * U, 800 * U, 500 * U, 46 * U, {
      fill: 'rgba(18,13,33,0.66)',
      stroke: rgba(C.lavender, 0.24),
      shadow: 'rgba(67,24,116,0.6)',
      shadowBlur: 90,
      shadowY: 30,
    });
    // rotating rings behind the lockup
    broadcastRings(ctx, OUT_W / 2, OUT_H * 0.5, 430 * U, -t * 0.35, {alpha: 0.35, alpha2: 0.5});
    broadcastRings(ctx, OUT_W / 2, OUT_H * 0.5, 320 * U, t * 0.55, {alpha: 0.18, alpha2: 0.3});

    // logo reveal: clip wipe + scale
    const clipW = w * e;
    ctx.save();
    ctx.beginPath();
    ctx.rect(OUT_W / 2 - clipW / 2, OUT_H * 0.5 - h, clipW, h * 2);
    ctx.clip();
    ctx.shadowColor = 'rgba(139,92,246,0.55)';
    ctx.shadowBlur = 70 * U;
    ctx.drawImage(logo, OUT_W / 2 - w / 2, OUT_H * 0.5 - h / 2, w, h);
    ctx.restore();

    // laser line that opens the wipe
    if (e < 0.999) {
      const lx = OUT_W / 2 + clipW / 2;
      ctx.fillStyle = C.lavender;
      ctx.shadowColor = C.lavender;
      ctx.shadowBlur = 40 * U;
      ctx.fillRect(lx - 2 * U, OUT_H * 0.5 - 190 * U, 4 * U, 380 * U);
      ctx.shadowBlur = 0;
    }

    const tagIn = easeOutExpo(inv(f, 26, 52));
    text(ctx, 'STUDIO FOR DIGITAL GROWTH', OUT_W / 2, OUT_H * 0.5 + 250 * U, {
      size: 21 * U, family: F.bodyBold, align: 'center', dir: 'ltr',
      color: C.lavender, letterSpacing: 6 * U, alpha: tagIn,
    });
    ctx.fillStyle = rgba(C.lavender, 0.55 * tagIn);
    ctx.fillRect(OUT_W / 2 - 120 * U * tagIn, OUT_H * 0.5 + 278 * U, 240 * U * tagIn, 2 * U);
    text(ctx, 'سودان ديجيتال · السودان', OUT_W / 2, OUT_H * 0.5 + 330 * U, {
      size: 26 * U, family: F.bodySemi, align: 'center', color: 'rgba(248,250,252,0.75)', alpha: tagIn,
    });
    ctx.restore();
    lightSweep(ctx, easeInOut(inv(f, 8, 60)), {width: 520 * U, alpha: 0.30});
    lightSweep(ctx, easeInOut(inv(f, 62, 104)), {width: 420 * U, alpha: 0.20});
  }

  // ---------- hook title card (frames 118..240)
  if (f >= 108) {
    const L = [
      {txt: 'بتأجل تطوير', size: 84, color: C.white, y: 0.395, delay: 0.02},
      {txt: 'مشروعك', size: 104, color: null, y: 0.487, delay: 0.1},
      {txt: 'لحدي متين؟', size: 94, color: C.white, y: 0.588, delay: 0.18},
    ];
    const local = inv(f, 108, 240);
    // badge
    const be = easeOutExpo(inv(f, 112, 136));
    ctx.save();
    ctx.globalAlpha = be;
    const bw = 470 * U;
    panel(ctx, OUT_W / 2 - bw / 2, OUT_H * 0.285, bw, 74 * U, 22 * U, {
      fill: 'rgba(109,40,217,0.24)',
      stroke: rgba(C.lavender, 0.55),
      shadow: 'rgba(67,24,116,0.5)',
      shadowBlur: 40,
      shadowY: 12,
    });
    ctx.drawImage(await loadImg(LOGO_MARK), OUT_W / 2 + bw / 2 - 56 * U, OUT_H * 0.285 + 14 * U, 34 * U, 46 * U);
    text(ctx, 'سؤال قبل أي حاجة', OUT_W / 2 + bw / 2 - 72 * U, OUT_H * 0.285 + 48 * U, {
      size: 27 * U, family: F.bodySemi, color: C.lavender,
    });
    ctx.restore();

    for (const line of L) {
      const e = easeOutExpo(inv(local, line.delay, line.delay + 0.28));
      const eb = easeOutBack(inv(local, line.delay, line.delay + 0.3));
      if (e <= 0) continue;
      const cy = OUT_H * line.y;
      ctx.save();
      ctx.globalAlpha = clamp(e * 1.4);
      ctx.translate(0, (1 - e) * 46 * U);
      ctx.beginPath();
      // The mask must reach below the baseline: Alexandria carries every Arabic
      // descender / joiner tail ~0.30em under it, so a mask that stops at the
      // baseline shaves the joiners off and the line reads as broken shaping
      // («بتأجل تطوير» -> «شأجل ت طهب»). Keep >= 1.9em of headroom.
      ctx.rect(0, cy - line.size * U * 1.15, OUT_W, line.size * U * 2.05);
      ctx.clip();
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.font = font(line.size * U, F.display);
      if (line.color) {
        ctx.fillStyle = line.color;
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = 30 * U;
      } else {
        const g = ctx.createLinearGradient(OUT_W / 2, cy - 90 * U, OUT_W / 2, cy + 40 * U);
        g.addColorStop(0, '#E9D5FF');
        g.addColorStop(0.55, C.lavender);
        g.addColorStop(1, C.bright);
        ctx.fillStyle = g;
        ctx.shadowColor = 'rgba(139,92,246,0.7)';
        ctx.shadowBlur = 50 * U;
      }
      ctx.fillText(line.txt, OUT_W / 2, cy + line.size * U * 0.36);
      ctx.restore();
    }

    // underline sweep under the question
    const ue = easeOutExpo(inv(local, 0.3, 0.55));
    if (ue > 0) {
      const uw = 420 * U * ue;
      ctx.fillStyle = hGrad(ctx, OUT_W / 2 - uw / 2, OUT_W / 2 + uw / 2, [
        [0, 'rgba(139,92,246,0)'], [0.5, C.lavender], [1, 'rgba(139,92,246,0)'],
      ]);
      ctx.fillRect(OUT_W / 2 - uw / 2, OUT_H * 0.648, uw, 5 * U);
    }

    const se = easeOutExpo(inv(local, 0.42, 0.7));
    text(ctx, '٤٥ ثانية تغيّر مسار مشروعك', OUT_W / 2, OUT_H * 0.712, {
      size: 30 * U, family: F.bodySemi, align: 'center',
      color: 'rgba(248,250,252,0.8)', alpha: se,
    });
    lightSweep(ctx, easeInOut(inv(local, 0.0, 0.5)), {width: 520 * U, alpha: 0.26});
    lightSweep(ctx, easeInOut(inv(local, 0.62, 1.0)), {width: 480 * U, alpha: 0.2});
  }
  grain(ctx, 0.05);
  vignette(ctx, 0.7);
}

/* --------------------------------------------------------------- scene 2 (4-11.5s) */
async function sceneDropoff(ctx, f, t, t0) {
  const local = (f - 240) / 450; // 0..1
  await footagePlate(ctx, t, '02_competitor_browse_25f450a5', {
    from: 240 / FPS, dur: 5.2, z: [1.07, 1.17], pan: [-14, 8],
  });
  await footagePlate(ctx, t, '06_clock_ticking_ba4c8ffa', {
    from: 240 / FPS + 5.1, dur: 2.4, z: [1.1, 1.2], alpha: easeInOut(inv(local, 0.56, 0.66)),
  });
  grade(ctx, {top: 0.5, violet: 0.34, bottom: 0.86, scrim: 0.9});
  halftone(ctx, 0, OUT_H * 0.66, OUT_W, OUT_H * 0.3, 0.08);

  // phone + conversation
  const phP = easeOutExpo(inv(local, 0.06, 0.24));
  if (phP > 0) {
    ctx.save();
    ctx.globalAlpha = phP;
    ctx.translate(0, (1 - phP) * 90 * U);
    ctx.scale(U, U);
    await phonePage(ctx, {
      x: W / 2 - 205,
      y: 330,
      w: 400,
      h: 782,
      scroll: 30 * easeInOut(inv(local, 0.1, 0.62)),
      chat: easeOutExpo(inv(local, 0.3, 0.42)),
      chatText: 'السعر كم؟',
      vanished: easeInOut(inv(local, 0.62, 0.74)),
      ctaPulse: 0.5 + 0.5 * Math.sin(t * 4),
    });
    ctx.restore();
  }

  // journey counters
  counterCard(ctx, inv(local, 0.2, 0.42), {
    x: 64 * U, y: 1152 * U, w: (W - 128) * U, h: 146 * U,
    items: [
      {label: 'زيارات الصفحة', value: 1240},
      {label: 'سألوا عن السعر', value: 380, color: C.lavender},
      {label: 'أكملوا الطلب', value: 7, color: C.coral},
    ],
  });

  // status ticks
  const ticks = [
    {label: 'شاف المنتج', ok: true, at: 0.14},
    {label: 'سأل عن السعر', ok: true, at: 0.24},
    {label: 'اختفى بدون طلب', ok: false, at: 0.66},
  ];
  const ty = 1320 * U;
  ctx.save();
  ticks.forEach((tk, i) => {
    const p = inv(local, tk.at, tk.at + 0.1);
    if (p <= 0) return;
    const w = 292 * U;
    const x = OUT_W - 64 * U - w - i * (w + 14 * U);
    ctx.globalAlpha = clamp(p * 2);
    fillRR(ctx, x, ty, w, 58 * U, 18 * U, tk.ok ? 'rgba(16,185,129,0.14)' : 'rgba(244,63,94,0.18)');
    strokeRR(ctx, x, ty, w, 58 * U, 18 * U, tk.ok ? 'rgba(16,185,129,0.45)' : 'rgba(244,63,94,0.55)', 1.4 * U);
    text(ctx, `${tk.ok ? '✓' : '✕'}  ${tk.label}`, x + w - 18 * U, ty + 38 * U, {
      size: 20 * U, family: F.bodySemi, color: tk.ok ? '#6EE7B7' : '#FDA4AF',
    });
  });
  ctx.restore();

  // whip light streak on the "disappear" beat
  const wk = clamp(1 - Math.abs(local - 0.7) / 0.05);
  if (wk > 0) whipBars(ctx, wk * 0.5, 1);
  lightSweep(ctx, easeInOut(inv(local, 0.34, 0.62)), {width: 460 * U, alpha: 0.22});
  grain(ctx, 0.05);
  vignette(ctx, 0.55);
}

/* --------------------------------------------------------------- scene 3 (11.5-19.5s) */
async function sceneDiagnosis(ctx, f, t) {
  const local = (f - 690) / 480; // 0..1
  const tA = t;

  // ---------- Phase A: "المشكلة ما شرط تكون في السعر أو المنتج" (0 .. 0.5)
  if (local < 0.52) {
    await footagePlate(ctx, tA, '03_write_idea_091f514a', {
      from: 690 / FPS, dur: 4.2, z: [1.1, 1.22], pan: [10, -6], alpha: 0.55,
    });
    grade(ctx, {top: 0.62, violet: 0.4, bottom: 0.88});
  } else {
    darkBG(ctx, tA, {violet: 0.7});
  }

  const pOut = 1 - easeIn(inv(local, 0.2, 0.28));
  if (pOut > 0) {
    ctx.save();
    ctx.globalAlpha = pOut;
    checkCard(ctx, inv(local, 0.03, 0.18), {
      x: 76 * U, y: 620 * U, w: (W - 152) * U, h: 126 * U,
      title: 'السعر مناسب', note: 'المنتج كمان ممتاز', ok: true, accent: C.emerald,
    });
    checkCard(ctx, inv(local, 0.13, 0.28), {
      x: 76 * U, y: 766 * U, w: (W - 152) * U, h: 126 * U,
      title: 'المنتج ممتاز', note: 'لا السعر ولا المنتج هو العقبة', ok: true, accent: C.emerald,
    });
    checkCard(ctx, inv(local, 0.27, 0.42), {
      x: 76 * U, y: 912 * U, w: (W - 152) * U, h: 150 * U,
      title: 'صفحتك ما ادتو سبب كافي', note: 'غياب الإقناع والثقة في العرض', ok: false, accent: C.coral,
    });
    // headline
    const he = easeOutExpo(inv(local, 0.05, 0.25));
    text(ctx, 'المشكلة مش في', OUT_W / 2, 470 * U, {
      size: 46 * U, family: F.displayBold, align: 'center', color: 'rgba(248,250,252,0.72)', alpha: he,
    });
    text(ctx, 'السعر أو المنتج', OUT_W / 2, 552 * U, {
      size: 64 * U, family: F.display, align: 'center', color: C.white, alpha: easeOutExpo(inv(local, 0.12, 0.32)),
    });
    ctx.restore();
  }

  // ---------- Phase B: the "شنو المانع تبدأ؟" sheet (0.5 .. 1)
  const sheetP = inv(local, 0.26, 0.42);
  if (sheetP > 0) {
    // label above the sheet
    const le = easeOutExpo(inv(local, 0.54, 0.68));
    text(ctx, 'التشخيص الحقيقي', OUT_W / 2, 430 * U, {
      size: 40 * U, family: F.displayBold, align: 'center', color: C.lavender, alpha: le,
    });
    ctx.save();
    ctx.scale(U, U);
    await blockerSheet(ctx, inv(local, 0.28, 0.52), {x: 76, y: 486, w: W - 152, h: 648});
    ctx.restore();
    const ce = easeOutExpo(inv(local, 0.62, 0.78));
    text(ctx, 'كل واحد منها بيتحل بشغل واضح على الصفحة', OUT_W / 2, 1210 * U, {
      size: 27 * U, family: F.bodySemi, align: 'center', color: 'rgba(248,250,252,0.78)', alpha: ce,
    });
  }

  const wk = clamp(1 - Math.abs(local - 0.52) / 0.045);
  if (wk > 0) zoomTransition(ctx, wk);
  lightSweep(ctx, easeInOut(inv(local, 0.16, 0.42)), {width: 470 * U, alpha: 0.2});
  lightSweep(ctx, easeInOut(inv(local, 0.6, 0.86)), {width: 430 * U, alpha: 0.16});
  grain(ctx, 0.05);
  vignette(ctx, 0.62);
}

/* --------------------------------------------------------------- scene 4 (19.5-29s) */
async function sceneSolution(ctx, f, t) {
  const local = (f - 1170) / 570; // 0..1

  const team = local < 0.42 ? '11_team_sticky_notes_30a1b442' : '12_team_whiteboard_9e1fc0fb';
  await footagePlate(ctx, t, team, {
    from: 1170 / FPS + (local < 0.42 ? 0 : 2.6),
    dur: local < 0.42 ? 2.8 : 2.4,
    z: [1.06, 1.16],
    pan: [12, -8],
  });
  if (local >= 0.56) {
    await footagePlate(ctx, t, '13_design_layout_66c45f85', {
      from: 1170 / FPS + 5.4, dur: 4.3, z: [1.08, 1.18], pan: [-10, 6],
      alpha: easeInOut(inv(local, 0.56, 0.64)),
    });
  }
  grade(ctx, {top: 0.56, violet: 0.36, bottom: 0.9});
  halftone(ctx, 0, OUT_H * 0.6, OUT_W, OUT_H * 0.36, 0.07);

  // headline
  const he = easeOutExpo(inv(local, 0.02, 0.16));
  if (local < 0.56) {
    text(ctx, 'عشان كدة نحن في', OUT_W / 2, 430 * U, {
      size: 34 * U, family: F.bodySemi, align: 'center', color: 'rgba(248,250,252,0.72)', alpha: he,
    });
    const wm = easeOutExpo(inv(local, 0.06, 0.24));
    ctx.save();
    ctx.globalAlpha = wm;
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.font = font(72 * U, F.display);
    const g = ctx.createLinearGradient(OUT_W / 2, 492 * U, OUT_W / 2, 584 * U);
    g.addColorStop(0, '#F5F3FF');
    g.addColorStop(1, C.lavender);
    ctx.fillStyle = g;
    ctx.shadowColor = 'rgba(139,92,246,0.75)';
    ctx.shadowBlur = 46 * U;
    ctx.fillText('سودان ديجيتال', OUT_W / 2, 540 * U);
    ctx.restore();
  }

  // 3 services
  const services = [
    {icon: 'layers', title: 'المحتوى', note: 'رسالة واضحة تبيع بدالك', at: 0.06},
    {icon: 'design', title: 'التصميم', note: 'هوية بصرية بمستوى براند', at: 0.18},
    {icon: 'share', title: 'إدارة الصفحات', note: 'رد ومتابعة ومسار طلب منظم', at: 0.3},
  ];
  const svcOut = 1 - easeIn(inv(local, 0.44, 0.54));
  ctx.save();
  ctx.scale(U, U);
  ctx.globalAlpha = svcOut;
  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await serviceTile(ctx, inv(local, s.at, s.at + 0.16), {
      x: 84, y: 646 + i * 162, w: W - 168, h: 144,
      icon: s.icon, title: s.title, note: s.note, index: i,
    });
  }
  ctx.restore();

  // ---------- delivery motion (0.56 .. 1): a sorted page handoff
  if (local >= 0.56) {
    const dp = inv(local, 0.5, 0.64);
    const dOut = 1 - easeIn(inv(local, 0.94, 1));
    ctx.save();
    ctx.globalAlpha = clamp(dp * 1.3) * dOut;
    ctx.scale(U, U);
    // clean wireframe page card
    const cx = W / 2;
    const cy = 960;
    panel(ctx, cx - 300, cy - 300, 600, 640, 34, {
      fill: 'rgba(10,8,18,0.9)',
      stroke: rgba(C.lavender, 0.35),
      shadow: 'rgba(0,0,0,0.6)',
      shadowBlur: 60,
      shadowY: 24,
    });
    // browser chrome
    fillRR(ctx, cx - 300, cy - 300, 600, 56, 34, 'rgba(109,40,217,0.25)');
    [C.coral, C.amber, C.emerald].forEach((c, i) => {
      ctx.fillStyle = rgba(c, 0.85);
      ctx.beginPath();
      ctx.arc(cx + 260 - i * 26, cy - 272, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    text(ctx, 'sudan-digital.com', cx + 130, cy - 262, {
      size: 18, family: F.bodySemi, align: 'right', dir: 'ltr', color: 'rgba(248,250,252,0.6)',
    });
    // blocks assembling
    const blocks = [
      {x: cx - 272, y: cy - 214, w: 544, h: 96, fill: 'rgba(139,92,246,0.22)'},
      {x: cx - 272, y: cy - 100, w: 260, h: 130, fill: 'rgba(196,181,253,0.14)'},
      {x: cx + 10, y: cy - 100, w: 262, h: 130, fill: 'rgba(196,181,253,0.14)'},
      {x: cx - 272, y: cy + 48, w: 544, h: 52, fill: 'rgba(16,185,129,0.16)'},
      {x: cx - 272, y: cy + 116, w: 380, h: 40, fill: 'rgba(248,250,252,0.08)'},
    ];
    blocks.forEach((b, i) => {
      const bp = easeOutExpo(inv(dp, 0.02 + i * 0.06, 0.22 + i * 0.06));
      if (bp <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(bp * 1.6);
      ctx.translate(0, (1 - bp) * 24);
      fillRR(ctx, b.x, b.y, b.w, b.h, 14, b.fill);
      ctx.restore();
    });
    // sorted checkmarks (inside the page card)
    const checks = ['محتوى واضح', 'تصميم مرتب', 'مسار طلب سهل'];
    checks.forEach((c, i) => {
      const cp = easeOutBack(inv(dp, 0.42 + i * 0.09, 0.55 + i * 0.09));
      if (cp <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(cp);
      const y = cy + 196;
      const x = cx + 272 - i * 186;
      fillRR(ctx, x - 172, y - 24, 172, 48, 15, 'rgba(16,185,129,0.16)');
      strokeRR(ctx, x - 172, y - 24, 172, 48, 15, 'rgba(16,185,129,0.4)', 1.3);
      text(ctx, `✓ ${c}`, x - 14, y + 7, {size: 17, family: F.bodySemi, color: '#6EE7B7'});
      ctx.restore();
    });
    // delivered stamp
    const sp = easeOutBack(inv(dp, 0.66, 0.84));
    if (sp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(sp);
      ctx.translate(cx, cy + 300);
      ctx.rotate(-0.06);
      ctx.scale(lerp(0.8, 1, sp), lerp(0.8, 1, sp));
      fillRR(ctx, -180, -34, 360, 68, 18, rgba(C.primary, 0.9));
      strokeRR(ctx, -180, -34, 360, 68, 18, rgba(C.lavender, 0.8), 2);
      text(ctx, 'صفحة مرتبة وجاهزة', 0, 10, {size: 26, family: F.displayBold, align: 'center'});
      ctx.restore();
    }
    ctx.restore();
  }

  // team chip (only while the team footage / services are on screen)
  const te = easeOutExpo(inv(local, 0.02, 0.14)) * (1 - easeIn(inv(local, 0.5, 0.6)));
  ctx.save();
  ctx.globalAlpha = te;
  const tw = 380 * U;
  panel(ctx, OUT_W / 2 - tw / 2, 1240 * U, tw, 62 * U, 20 * U, {
    fill: 'rgba(8,7,13,0.82)',
    stroke: rgba(C.bright, 0.45),
    shadow: 'rgba(0,0,0,0.45)',
    shadowBlur: 26,
    shadowY: 10,
  });
  text(ctx, 'فريق سودان ديجيتال', OUT_W / 2, 1281 * U, {
    size: 26 * U, family: F.displayBold, align: 'center', color: C.white,
  });
  ctx.restore();

  lightSweep(ctx, easeInOut(inv(local, 0.2, 0.46)), {width: 500 * U, alpha: 0.2});
  lightSweep(ctx, easeInOut(inv(local, 0.6, 0.86)), {width: 460 * U, alpha: 0.18});
  grain(ctx, 0.05);
  vignette(ctx, 0.55);
}

/* --------------------------------------------------------------- scene 5 (29-37.5s) */
async function sceneExperience(ctx, f, t) {
  const local = (f - 1740) / 510; // 0..1

  if (local < 0.5) {
    await footagePlate(ctx, t, '15_website_monitor_f71a509e', {
      from: 1740 / FPS, dur: 4.3, z: [1.08, 1.2], pan: [-12, 6], alpha: 0.85,
    });
    grade(ctx, {top: 0.6, violet: 0.4, bottom: 0.9});
  } else {
    await footagePlate(ctx, t, '05_calendar_flip_58950def', {
      from: 1740 / FPS + 4.2, dur: 4.2, z: [1.1, 1.2], pan: [8, -6], alpha: 0.8,
    });
    grade(ctx, {top: 0.62, violet: 0.4, bottom: 0.9});
  }

  // headline
  const he = easeOutExpo(inv(local, 0.02, 0.16));
  text(ctx, 'تجربة عميل أوضح وأسهل', OUT_W / 2, 452 * U, {
    size: 52 * U, family: F.display, align: 'center', color: C.white, alpha: he,
    shadow: 'rgba(0,0,0,0.5)', shadowBlur: 24 * U,
  });

  // funnel
  const halfOut = 1 - easeIn(inv(local, 0.36, 0.46));
  const fp = inv(local, 0.08, 0.3);
  if (fp > 0 && halfOut > 0.01) {
    ctx.save();
    ctx.scale(U, U);
    ctx.globalAlpha = halfOut;
    funnel(ctx, fp, {x: 130, y: 536, w: W - 260});
    ctx.restore();
  }

  // journey rail from first visit to order
  const jp = inv(local, 0.26, 0.52);
  if (jp > 0 && halfOut > 0.01) {
    ctx.save();
    ctx.globalAlpha = halfOut;
    ctx.save();
    ctx.scale(U, U);
    ctx.fillStyle = 'rgba(8,7,13,0.5)';
    ctx.fillRect(0, 1010, W, 200);
    journeyLine(ctx, jp, {
      y: 1078,
      active: Math.min(3, Math.floor(jp * 3.99)),
    });
    ctx.restore();
    ctx.restore();
  }

  // confirmation + phone (second half) — mirrors the first half's template
  if (local >= 0.42) {
    const cp = inv(local, 0.44, 0.6);
    ctx.save();
    ctx.scale(U, U);
    await phonePage(ctx, {
      x: W / 2 - 190, y: 520, w: 380, h: 700,
      scroll: 120 * easeInOut(inv(local, 0.44, 0.8)),
      chat: 1, chatText: 'أبغى أطلب', you: true,
    });
    ctx.restore();

    // floating confirmation card docked to the phone
    const cardP = easeOutBack(inv(local, 0.56, 0.7));
    if (cardP > 0) {
      ctx.save();
      ctx.scale(U, U);
      ctx.translate(0, (1 - cardP) * 40);
      const w = 470;
      const x = W / 2 - 235;
      const y = 1252;
      panel(ctx, x, y, w, 178, 26, {
        fill: 'rgba(11,26,22,0.95)',
        stroke: 'rgba(16,185,129,0.6)',
        shadow: 'rgba(16,185,129,0.35)',
        shadowBlur: 44,
        shadowY: 18,
      });
      ctx.save();
      ctx.shadowColor = 'rgba(16,185,129,0.8)';
      ctx.shadowBlur = 30;
      fillRR(ctx, x + w - 96, y + 34, 62, 62, 20, hGrad(ctx, x + w - 96, x + w - 34, [[0, '#059669'], [1, C.emerald]]));
      ctx.restore();
      const im = await loadImg(CHECK_ICON_PATH);
      ctx.drawImage(im, x + w - 81, y + 49, 32, 32);
      text(ctx, 'تم تأكيد الطلب', x + w - 112, y + 66, {size: 30, family: F.displayBold});
      text(ctx, 'بنجاح ✓', x + w - 112, y + 104, {size: 24, family: F.bodySemi, color: '#6EE7B7'});
      // centred underneath the confirmation copy: right-aligning it on the
      // card's left edge pushed the whole run outside the card (RTL runs grow
      // leftwards from their anchor) and it collided with the evidence chip.
      text(ctx, 'رقم الطلب ٢٧٠٠ · خلال ٢٤ ساعة', x + w - 24, y + 152, {
        size: 19, family: F.body, align: 'right',
        color: 'rgba(248,250,252,0.75)',
      });
      ctx.restore();
    }

  }

  lightSweep(ctx, easeInOut(inv(local, 0.16, 0.44)), {width: 470 * U, alpha: 0.18});
  lightSweep(ctx, easeInOut(inv(local, 0.62, 0.9)), {width: 440 * U, alpha: 0.16});
  grain(ctx, 0.05);
  vignette(ctx, 0.5);
}

/* -------------------------------------------------------------- scene 6 (37.5-45s) */
async function sceneEndCard(ctx, f, t) {
  const local = (f - 2250) / 450; // 0..1
  darkBG(ctx, t, {violet: 0.75, glowY: 0.3, drift: 0.6});
  halftone(ctx, 0, OUT_H * 0.55, OUT_W, OUT_H * 0.45, 0.12);

  // rotating broadcast rings
  const ringP = easeOutExpo(inv(local, 0.0, 0.3));
  ctx.save();
  ctx.globalAlpha = 0.55 * ringP;
  broadcastRings(ctx, OUT_W / 2, OUT_H * 0.3, 300 * U * lerp(0.8, 1, ringP), t * 0.18, {alpha: 0.4, alpha2: 0.5});
  broadcastRings(ctx, OUT_W / 2, OUT_H * 0.3, 420 * U * lerp(0.7, 1, ringP), -t * 0.12, {alpha: 0.2, alpha2: 0.3});
  ctx.restore();

  // brand lockup
  const lp = inv(local, 0.02, 0.2);
  const outLogo = 1 - easeIn(inv(local, 0.88, 1)) * 0.0;
  if (lp > 0) {
    const logo = await loadImg(LOGO_FULL);
    const e = easeOutExpo(lp);
    const w = 660 * U * lerp(0.9, 1, e);
    const h = (660 / 1390) * w;
    const cy = OUT_H * 0.3;
    ctx.save();
    ctx.globalAlpha = clamp(e) * outLogo;
    panel(ctx, OUT_W / 2 - w / 2 - 44 * U, cy - h / 2 - 40 * U, w + 88 * U, h + 80 * U, 40 * U, {
      fill: 'rgba(18,13,33,0.55)',
      stroke: rgba(C.lavender, 0.22),
      shadow: 'rgba(67,24,116,0.65)',
      shadowBlur: 90,
      shadowY: 26,
    });
    ctx.shadowColor = 'rgba(139,92,246,0.6)';
    ctx.shadowBlur = 60 * U;
    ctx.drawImage(logo, OUT_W / 2 - w / 2, cy - h / 2, w, h);
    ctx.restore();

    const we = easeOutExpo(inv(local, 0.14, 0.32));
    text(ctx, 'سودان ديجيتال · السودان', OUT_W / 2, OUT_H * 0.3 + h / 2 + 66 * U, {
      size: 28 * U, family: F.bodySemi, align: 'center', color: C.lavender, alpha: we,
    });
    text(ctx, 'SUDAN DIGITAL — CONTENT · DESIGN · PAGES', OUT_W / 2, OUT_H * 0.3 + h / 2 + 106 * U, {
      size: 15 * U, family: F.bodyBold, align: 'center', dir: 'ltr',
      color: 'rgba(196,181,253,0.65)', letterSpacing: 3.4 * U, alpha: we,
    });
  }

  // tagline (verbatim) — appears after the "خيارك الأفضل" line finishes at 40.75s
  const tag = [
    'بنفهم احتياج مشروعك',
    'ونشتغل معاك خطوة بخطوة',
    'لحدي ما تحول أفكارك لواقع',
  ];
  const tagStart = inv(local, 0.42, 0.5);
  if (tagStart > 0) {
    tag.forEach((line, i) => {
      const e = easeOutExpo(inv(local, 0.44 + i * 0.09, 0.62 + i * 0.09));
      if (e <= 0) return;
      text(ctx, line, OUT_W / 2, 992 * U + i * 62 * U, {
        size: 33 * U, family: F.displayBold, align: 'center',
        color: i === 2 ? C.lavender : C.white, alpha: clamp(e),
        shadow: 'rgba(0,0,0,0.5)', shadowBlur: 22 * U,
      });
    });
  }

  // CTA
  ctx.save();
  ctx.scale(U, U);
  ctaButton(ctx, inv(local, 0.62, 0.78), {
    x: 150, y: 1218, w: W - 300, h: 110, label: 'ابدأ مشروعك الآن',
    pulse: 0.5 + 0.5 * Math.sin(t * 3.4),
  });
  ctx.restore();

  // contact strip
  const cs = easeOutExpo(inv(local, 0.72, 0.86));
  if (cs > 0) {
    ctx.save();
    ctx.globalAlpha = cs;
    const w = 760 * U;
    const x = OUT_W / 2 - w / 2;
    const y = 1352 * U;
    panel(ctx, x, y, w, 84 * U, 26 * U, {
      fill: 'rgba(10,8,18,0.8)',
      stroke: rgba(C.bright, 0.4),
      shadow: 'rgba(0,0,0,0.5)',
      shadowBlur: 30,
      shadowY: 12,
    });
    text(ctx, 'sudandigital', x + w - 34 * U, y + 54 * U, {
      size: 27 * U, family: F.bodyBold, align: 'right', dir: 'ltr', color: C.amber, letterSpacing: 1.6 * U,
    });
    text(ctx, '@', x + w - 232 * U, y + 52 * U, {size: 26 * U, family: F.bodyBold, align: 'center', dir: 'ltr', color: C.lavender});
    text(ctx, 'واتساب · انستقرام · فيسبوك', x + 60 * U, y + 52 * U, {
      size: 21 * U, family: F.body, align: 'right', color: 'rgba(248,250,252,0.7)',
    });
    ctx.restore();
  }

  lightSweep(ctx, easeInOut(inv(local, 0.05, 0.45)), {width: 600 * U, alpha: 0.3});
  lightSweep(ctx, easeInOut(inv(local, 0.55, 0.95)), {width: 520 * U, alpha: 0.22});
  grain(ctx, 0.055);
  vignette(ctx, 0.68);
}

/* ------------------------------------------------------------------ captions */
function captionAt(t) {
  for (const p of DATA.captions) {
    if (t >= p.startSec - 0.12 && t <= p.endSec + 0.12) return p;
  }
  return null;
}

/* --------------------------------------------------------- chrome (bug + L3s) */
const LOWER_THIRDS = [
  {start: 4.15, end: 6.6, step: '02', title: 'الزبون دخل.. واختفى', subtitle: 'مسار الشراء انكسر من أول خطوة'},
  {start: 11.9, end: 14.35, step: '03', title: 'التشخيص الحقيقي', subtitle: 'ليست مشكلة سعر.. بل وضوح وإقناع'},
  {start: 20.1, end: 22.6, step: '04', title: 'منهجية سودان ديجيتال', subtitle: 'محتوى · تصميم · إدارة صفحات'},
  {start: 29.6, end: 32.0, step: '05', title: 'تجربة العميل', subtitle: 'من أول زيارة لحد الطلب'},
];

const CHAPTERS = [
  {id: 'dropoff', label: 'الزبون دخل.. واختفى'},
  {id: 'diagnosis', label: 'التشخيص الحقيقي'},
  {id: 'solution', label: 'منهجية سودان ديجيتال'},
  {id: 'experience', label: 'تجربة العميل'},
];

function chrome(ctx, f, t) {
  const scene = DATA.scenes.find((s) => f >= s.startFrame && f < s.endFrame) ?? DATA.scenes[DATA.scenes.length - 1];
  const bugA = Math.min(
    smooth(inv(f, 236, 262)),
    1 - smooth(inv(f, 2226, 2252)),
  );
  const ch = CHAPTERS.find((c) => c.id === scene.id) ?? CHAPTERS[0];
  cornerBug(ctx, t, {
    opacity: bugA,
    chapter: `0${scene.index}`,
    chapterTitle: ch.label,
    progress: f / DATA.totalFrames,
  });

  for (const lt of LOWER_THIRDS) {
    if (t >= lt.start - 0.2 && t <= lt.end) {
      const p = Math.min(inv(t, lt.start - 0.18, lt.start + 0.16), 1 - inv(t, lt.end - 0.2, lt.end));
      ctx.save();
      ctx.scale(U, U);
      lowerThird(ctx, p, lt);
      ctx.restore();
    }
  }

  const ph = captionAt(t);
  if (ph) {
    ctx.save();
    ctx.scale(U, U);
    const bottom = ph.sceneId === 'endcard' ? 300 : 150;
    captions(ctx, ph, t, {bottom});
    ctx.restore();
  }
}

/* ---------------------------------------------------------------- transitions */
const TRANSITIONS = [
  {frame: 240, kind: 'diag'},
  {frame: 690, kind: 'whip'},
  {frame: 1170, kind: 'zoom'},
  {frame: 1740, kind: 'diag'},
  {frame: 2250, kind: 'whip'},
];

function transition(ctx, f) {
  for (const tr of TRANSITIONS) {
    const span = 26;
    const d = f - (tr.frame - span / 2);
    if (d < 0 || d > span) continue;
    const p = d / span;
    if (tr.kind === 'diag') diagonalShutter(ctx, p);
    if (tr.kind === 'whip') whipBars(ctx, p, tr.frame === 690 ? 1 : -1);
    if (tr.kind === 'zoom') zoomTransition(ctx, p);
  }
}

/* --------------------------------------------------------------------- render */
async function renderFrame(ctx, f) {
  const t = f / FPS;
  ctx.save();
  ctx.scale(1, 1);
  // reset transform/state each frame
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, OUT_W, OUT_H);
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, OUT_W, OUT_H);

  if (f < 240) await sceneIntro(ctx, f, t);
  else if (f < 690) await sceneDropoff(ctx, f, t);
  else if (f < 1170) await sceneDiagnosis(ctx, f, t);
  else if (f < 1740) await sceneSolution(ctx, f, t);
  else if (f < 2250) await sceneExperience(ctx, f, t);
  else await sceneEndCard(ctx, f, t);

  transition(ctx, f);
  chrome(ctx, f, t);
  ctx.restore();
}

async function init() {
  const {svgIcon: si} = await import('./lib/design.mjs');
  // pre-bake the white check used on the confirmation card
  const {createCanvas: cc} = await import('@napi-rs/canvas');
  const ck = cc(64, 64);
  const cctx = ck.getContext('2d');
  cctx.drawImage(await svgImage(si('check', '#FFFFFF', 7, 64)), 0, 0, 64, 64);
  fs.mkdirSync(path.dirname(CHECK_ICON_PATH), {recursive: true});
  fs.writeFileSync(CHECK_ICON_PATH, ck.toBuffer('image/png'));
  const colors = ['#FFFFFF', 'rgba(248,250,252,0.35)', C.lavender, C.bright, C.amber, C.coral, C.emerald, C.primary];
  const names = ['clock', 'hourglass', 'user', 'cart', 'check', 'x', 'chart', 'spark', 'phone', 'layers', 'design', 'share', 'shield', 'eye', 'bolt'];
  const map = {};
  for (const n of names) {
    for (const c of colors) {
      map[`${n}|${c}`] = await svgImage(si(n, c));
    }
  }
  registerIcons(map);
  fs.mkdirSync(OUT_DIR, {recursive: true});
}

async function main() {
  await init();
  const frameList = ONLY
    ? ONLY.split(',').map((s) => Number(s.trim()))
    : Array.from({length: END - START}, (_, i) => START + i);

  const cv = createCanvas(OUT_W, OUT_H);
  const ctx = cv.getContext('2d');

  const t0 = Date.now();
  let done = 0;
  for (const f of frameList) {
    await renderFrame(ctx, f);
    const out = path.join(OUT_DIR, `f${String(f).padStart(5, '0')}.png`);
    const buf = ONLY
      ? cv.toBuffer('image/png')
      : cv.toBuffer('image/jpeg', 96);
    fs.writeFileSync(out.replace(/\.png$/, ONLY ? '.png' : '.jpg'), buf);
    done++;
    if (done % 60 === 0 || ONLY) {
      const el = (Date.now() - t0) / 1000;
      console.log(`frame ${f} (${done}/${frameList.length}) ${(el / done).toFixed(2)}s/frame`);
    }
  }
  console.log(`rendered ${done} frames to ${OUT_DIR} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
