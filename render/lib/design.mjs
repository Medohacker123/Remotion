/**
 * Deterministic design system for the Sudan Digital promo renderer.
 *
 * Everything here is resolution independent: the design canvas is authored at
 * 1080x1920 and every primitive receives a `u` scale unit so the exact same
 * frame code can be replayed at 2160x3840 (the optional 4K composition).
 */
import {createCanvas, GlobalFonts, Image, loadImage} from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');

export const W = 1080;
export const H = 1920;

/* ------------------------------------------------------------------ colors */
export const C = {
  bg: '#08070D',
  surface: '#120D21',
  elevated: '#1A1330',
  deep: '#431874',
  primary: '#6D28D9',
  bright: '#8B5CF6',
  lavender: '#C4B5FD',
  white: '#F8FAFC',
  muted: '#A1A1AA',
  amber: '#F59E0B',
  coral: '#F43F5E',
  emerald: '#10B981',
  ink2: 'rgba(248,250,252,0.78)',
  ink3: 'rgba(248,250,252,0.55)',
  hair: 'rgba(167,139,250,0.22)',
  hairStrong: 'rgba(167,139,250,0.42)',
};

/* ------------------------------------------------------------------- easing */
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t) => Math.pow(clamp(t), 3);
export const easeInOut = (t) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOutExpo = (t) => {
  const x = clamp(t);
  return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
};
export const easeOutBack = (t, s = 1.70158) => {
  const x = clamp(t) - 1;
  return x * x * ((s + 1) * x + s) + 1;
};
/** deterministic pseudo random in [0,1) */
export const rand = (seed) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/* -------------------------------------------------------------------- fonts */
const FONT_DIR = path.join(__dirname, '../fonts');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'alexandria-400.ttf'), 'Alexandria');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'alexandria-600.ttf'), 'AlexandriaSemi');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'alexandria-700.ttf'), 'AlexandriaBold');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'alexandria-800.ttf'), 'AlexandriaExtra');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'alexandria-900.ttf'), 'AlexandriaBlack');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'ibm-plex-sans-arabic-400.ttf'), 'Plex');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'ibm-plex-sans-arabic-500.ttf'), 'PlexMedium');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'ibm-plex-sans-arabic-600.ttf'), 'PlexSemi');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'ibm-plex-sans-arabic-700.ttf'), 'PlexBold');

export const F = {
  display: 'AlexandriaBlack',
  displayBold: 'AlexandriaExtra',
  displayMid: 'AlexandriaBold',
  displaySemi: 'AlexandriaSemi',
  body: 'Plex',
  bodyMed: 'PlexMedium',
  bodySemi: 'PlexSemi',
  bodyBold: 'PlexBold',
};

export function font(size, family = F.display, weight = '') {
  return `${weight ? weight + ' ' : ''}${Math.round(size)}px ${family}`;
}

/* ------------------------------------------------------------------ canvases */
export function canvas(w = W, h = H) {
  const cv = createCanvas(w, h);
  const ctx = cv.getContext('2d');
  return {cv, ctx};
}

export const rgba = (hex, a) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/* ------------------------------------------------------------------ textures */
export const TEX = {};
export function grainTile(size = 256) {
  const key = `grain${size}`;
  if (TEX[key]) return TEX[key];
  const {cv, ctx} = canvas(size, size);
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = rand(i + 1) * 255;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  TEX[key] = cv;
  return cv;
}

export function halftoneTile(size = 14) {
  const key = `half${size}`;
  if (TEX[key]) return TEX[key];
  const {cv, ctx} = canvas(size, size);
  ctx.fillStyle = 'rgba(196,181,253,0.5)';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 1.35, 0, Math.PI * 2);
  ctx.fill();
  TEX[key] = cv;
  return cv;
}

/* -------------------------------------------------------------------- images */
const IMG_CACHE = new Map();
export async function image(rel) {
  if (IMG_CACHE.has(rel)) return IMG_CACHE.get(rel);
  const buf = fs.readFileSync(path.join(ROOT, rel));
  const im = await loadImage(buf);
  IMG_CACHE.set(rel, im);
  return im;
}

export function svgImage(svg) {
  return loadImage(Buffer.from(svg));
}

export function svgDoc(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
}

/* --------------------------------------------------------------- primitives */
export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function fillRR(ctx, x, y, w, h, r, fill) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function strokeRR(ctx, x, y, w, h, r, stroke, lw = 2) {
  rr(ctx, x, y, w, h, r);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
}

/** Modern glass panel with hairline + inner highlight */
export function panel(ctx, x, y, w, h, r, opts = {}) {
  const {
    fill = 'rgba(18,13,33,0.92)',
    stroke = C.hair,
    lw = 2,
    shadow = 'rgba(0,0,0,0.55)',
    shadowBlur = 40,
    shadowY = 18,
    gradient = null,
    innerHighlight = true,
  } = opts;
  ctx.save();
  if (shadow) {
    ctx.shadowColor = shadow;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetY = shadowY;
  }
  rr(ctx, x, y, w, h, r);
  if (gradient) {
    const g = ctx.createLinearGradient(x, y, x + w * 0.4, y + h);
    gradient.forEach(([p, c]) => g.addColorStop(p, c));
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = fill;
  }
  ctx.fill();
  ctx.restore();

  if (stroke) strokeRR(ctx, x, y, w, h, r, stroke, lw);

  if (innerHighlight) {
    ctx.save();
    rr(ctx, x, y, w, h, r);
    ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + Math.min(h * 0.5, 160));
    g.addColorStop(0, 'rgba(255,255,255,0.075)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}

export function text(ctx, str, x, y, o = {}) {
  const {
    size = 40,
    family = F.body,
    color = C.white,
    align = 'right',
    dir = 'rtl',
    baseline = 'alphabetic',
    weight = '',
    letterSpacing = 0,
    alpha = 1,
    shadow = null,
    shadowBlur = 0,
    maxWidth = 0,
  } = o;
  ctx.save();
  ctx.globalAlpha = ctx.globalAlpha * alpha;
  ctx.direction = dir;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.font = font(size, family, weight);
  if (letterSpacing) ctx.letterSpacing = `${letterSpacing}px`;
  ctx.fillStyle = color;
  if (shadow) {
    ctx.shadowColor = shadow;
    ctx.shadowBlur = shadowBlur;
  }
  if (maxWidth) ctx.fillText(str, x, y, maxWidth);
  else ctx.fillText(str, x, y);
  if (letterSpacing) ctx.letterSpacing = '0px';
  ctx.restore();
}


export function measure(ctx, str, size, family = F.body, weight = '', letterSpacing = 0) {
  ctx.save();
  ctx.font = font(size, family, weight);
  if (letterSpacing) ctx.letterSpacing = `${letterSpacing}px`;
  const w = ctx.measureText(str).width;
  ctx.restore();
  return w;
}

/** Greedy Arabic word wrap that respects measured widths. */
export function wrap(ctx, str, maxWidth, size, family = F.body, weight = '', letterSpacing = 0) {
  const words = str.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (measure(ctx, test, size, family, weight, letterSpacing) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Word-level layout for kinetic captions (RTL, right aligned). */
export function layoutWords(ctx, words, x, y, size, opts = {}) {
  const {
    family = F.displayBold,
    weight = '',
    gap = 14,
    lineGap = 18,
    maxWidth = 900,
    align = 'center',
  } = opts;
  const lines = [];
  let cur = [];
  let curW = 0;
  for (const w of words) {
    const ww = measure(ctx, w.text, size, family, weight);
    if (curW + ww + (cur.length ? gap : 0) > maxWidth && cur.length) {
      lines.push({words: cur, width: curW});
      cur = [];
      curW = 0;
    }
    curW += ww + (cur.length ? gap : 0);
    cur.push({...w, w: ww});
  }
  if (cur.length) lines.push({words: cur, width: curW});

  const lineH = size * 1.3;
  const totalH = lines.length * lineH + (lines.length - 1) * lineGap;
  const placed = [];
  let top = y - totalH / 2;
  for (const line of lines) {
    // RTL: words are placed right-to-left starting from the line's right edge
    let cursor = align === 'right' ? x : align === 'left' ? x + line.width : x + line.width / 2;
    for (const w of line.words) {
      placed.push({...w, left: cursor - w.w, top, baseline: top + size * 0.98});
      cursor -= w.w + gap;
    }
    top += lineH + lineGap;
  }
  return placed;
}

/* --------------------------------------------------------------- gradients */
export function vGrad(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([p, c]) => g.addColorStop(p, c));
  return g;
}

export function hGrad(ctx, x0, x1, stops) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  stops.forEach(([p, c]) => g.addColorStop(p, c));
  return g;
}

export function radial(ctx, x, y, r0, r1, stops) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  stops.forEach(([p, c]) => g.addColorStop(p, c));
  return g;
}

/* ------------------------------------------------------------------ glow dot */
export function glowDot(ctx, x, y, r, color, blur = 40) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* --------------------------------------------------------------- svg helpers */
export function icon(defs) {
  // returns an Image ready to drawImage — every icon is authored as 2D SVG
  return loadImage(Buffer.from(defs));
}

export const ICON_PATHS = {
  clock: '<circle cx="32" cy="32" r="23"/><path d="M32 19v14l10 6"/>',
  hourglass: '<path d="M20 12h24M20 52h24M22 12c0 11 10 14 10 20s-10 9-10 20M42 12c0 11-10 14-10 20s10 9 10 20"/>',
  user: '<circle cx="32" cy="23" r="10"/><path d="M14 54c0-10 8-16 18-16s18 6 18 16"/>',
  cart: '<path d="M10 12h7l6 28h26l6-20H20"/><circle cx="26" cy="52" r="4"/><circle cx="46" cy="52" r="4"/>',
  check: '<path d="M14 34l11 11 23-24"/>',
  x: '<path d="M20 20l24 24M44 20L20 44"/>',
  chart: '<path d="M12 52V30M26 52V20M40 52V36M54 52V14"/>',
  spark: '<path d="M32 8l6 18 18 6-18 6-6 18-6-18-18-6 18-6z"/>',
  phone: '<rect x="18" y="8" width="28" height="48" rx="6"/><path d="M28 48h8"/>',
  layers: '<path d="M32 10l22 11-22 11-22-11z"/><path d="M10 32l22 11 22-11"/><path d="M10 42l22 11 22-11"/>',
  design: '<rect x="10" y="12" width="44" height="40" rx="5"/><path d="M10 24h44M24 24v28"/>',
  share: '<circle cx="46" cy="16" r="7"/><circle cx="18" cy="32" r="7"/><circle cx="46" cy="48" r="7"/><path d="M24 28l16-8M24 36l16 8"/>',
  shield: '<path d="M32 9l19 7v16c0 13-8 21-19 26-11-5-19-13-19-26V16z"/><path d="M23 32l7 7 12-13"/>',
  eye: '<path d="M8 32s9-14 24-14 24 14 24 14-9 14-24 14S8 32 8 32z"/><circle cx="32" cy="32" r="7"/>',
  bolt: '<path d="M36 8L16 36h14l-4 20 20-28H32z"/>',
};

export function svgIcon(name, color = C.lavender, strokeWidth = 3.4, size = 64) {
  const body = ICON_PATHS[name];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

const ICON_CACHE = new Map();
export async function iconFor(name, color = C.lavender, strokeWidth = 3.4) {
  const key = `${name}|${color}|${strokeWidth}`;
  if (!ICON_CACHE.has(key)) {
    ICON_CACHE.set(key, await svgImage(svgIcon(name, color, strokeWidth)));
  }
  return ICON_CACHE.get(key);
}

/** Draw a rounded "icon tile" with an SVG icon inside. */
export async function iconTile(ctx, name, x, y, size, opts = {}) {
  const {
    radius = size * 0.28,
    tint = C.bright,
    fill = 'rgba(109,40,217,0.20)',
    stroke = C.hairStrong,
    strokeWidth = 2.5,
    iconScale = 0.56,
  } = opts;
  fillRR(ctx, x - size / 2, y - size / 2, size, size, radius, fill);
  if (stroke) strokeRR(ctx, x - size / 2, y - size / 2, size, size, radius, stroke, strokeWidth);
  const im = await iconFor(name, tint);
  const is = size * iconScale;
  ctx.drawImage(im, x - is / 2, y - is / 2, is, is);
}

/* --------------------------------------------------------- shared overlays */
export function vignette(ctx, strength = 0.62, cx = W / 2, cy = H / 2) {
  ctx.save();
  ctx.fillStyle = radial(ctx, cx, cy, H * 0.18, H * 0.78, [
    [0, 'rgba(8,7,13,0)'],
    [0.62, `rgba(8,7,13,${strength * 0.35})`],
    [1, `rgba(8,7,13,${strength})`],
  ]);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function grain(ctx, alpha = 0.05) {
  const tile = grainTile();
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'overlay';
  const p = ctx.createPattern(tile, 'repeat');
  ctx.fillStyle = p;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/**
 * Purple cinematic grade + top/bottom legibility scrim. Applied on top of every
 * footage plate (real clips and 2D motion plates alike).
 */
const GRADE_CACHE = new Map();
export function grade(ctx, opts = {}) {
  const {
    violet = 0.34,
    top = 0.44,
    bottom = 0.78,
    wash = 0.34,
  } = opts;
  const key = `${violet}|${top}|${bottom}|${wash}|${H}`;
  let g = GRADE_CACHE.get(key);
  if (!g) {
    const scrim = ctx.createLinearGradient(0, 0, 0, H);
    scrim.addColorStop(0, `rgba(8,7,13,${Math.min(0.95, top + 0.12)})`);
    scrim.addColorStop(0.22, `rgba(11,9,18,${0.30 + wash * 0.5})`);
    scrim.addColorStop(0.5, `rgba(20,14,38,${0.34 + violet * 0.35})`);
    scrim.addColorStop(0.78, `rgba(30,16,58,${0.40 + violet * 0.4})`);
    scrim.addColorStop(1, `rgba(8,7,13,${Math.min(0.96, bottom + 0.1)})`);
    g = scrim;
    GRADE_CACHE.set(key, g);
  }
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** Diagonal broadcast light sweep band. */
export function lightSweep(ctx, progress, opts = {}) {
  const {
    width = 460,
    angle = -18,
    alpha = 0.5,
    color = '255,255,255',
    extra = null,
  } = opts;
  ctx.save();
  ctx.translate(progress * (W + width * 2) - width, H / 2);
  ctx.rotate((angle * Math.PI) / 180);
  const g = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
  g.addColorStop(0, `rgba(${color},0)`);
  g.addColorStop(0.45, `rgba(${color},${alpha * 0.55})`);
  g.addColorStop(0.5, `rgba(${color},${alpha})`);
  g.addColorStop(0.55, `rgba(${color},${alpha * 0.5})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(-width / 2, -H * 1.2, width, H * 2.4);
  ctx.restore();
  if (extra) extra();
}

/** Thin brand ring / arc used across bumpers. */
export function broadcastRings(ctx, cx, cy, r, rot, opts = {}) {
  const {alpha = 0.4, alpha2 = 0.5} = opts;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.strokeStyle = rgba(C.bright, alpha);
  ctx.lineWidth = 2.4;
  ctx.setLineDash([20, 26]);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([130, 46]);
  ctx.strokeStyle = rgba(C.lavender, alpha2);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.79, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

export function gridLines(ctx, alpha = 0.055, step = 90, offset = 0) {
  ctx.save();
  ctx.strokeStyle = `rgba(196,181,253,${alpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = (offset % step) - step; x < W + step; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
  }
  for (let y = (offset % step) - step; y < H + step; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  ctx.stroke();
  ctx.restore();
}

export function halftone(ctx, x, y, w, h, alpha = 0.16) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const p = ctx.createPattern(halftoneTile(), 'repeat');
  ctx.fillStyle = p;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/* ------------------------------------------------------------------ numbers */
export const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
export const toArabicDigits = (n) => String(n).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);
export const pad2 = (n) => String(n).padStart(2, '0');
