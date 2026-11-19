/**
 * Arabic word-by-word kinetic captions.
 *
 * Timings come verbatim from CAPTION_PHRASES (src/remotion/timelineData.ts) which
 * is calibrated against the RMS energy of public/assets/processed/master-audio-45s.mp3.
 * Nothing here invents a timing: the renderer only decides how a spoken word looks.
 *
 * Visual grammar:
 *   upcoming word  → 32% white (reads ahead with the voice)
 *   spoken word    → solid white, key words are lavender
 *   current word   → lavender/white + violet baseline highlight + glow
 */
import {
  C,
  F,
  H,
  W,
  clamp,
  easeOutExpo,
  fillRR,
  font,
  hGrad,
  inv,
  layoutWords,
  panel,
  radial,
  rr,
  smooth,
} from './design.mjs';

export const CAPTION_METRICS = {
  size: 38,
  maxWidth: 792,
  gap: 21,
  lineGap: 12,
  padX: 44,
  padY: 26,
  boxWidth: 908,
  radius: 30,
};

export function captionAt(captions, t) {
  for (const p of captions) {
    if (t >= p.startSec - 0.12 && t <= p.endSec + 0.12) return p;
  }
  return null;
}

export function captionBoxHeight(ctx, phrase) {
  const m = CAPTION_METRICS;
  const layout = layoutWords(ctx, phrase.words, W / 2, 0, m.size, {
    family: F.displayBold,
    maxWidth: m.maxWidth,
    gap: m.gap,
    lineGap: m.lineGap,
  });
  const rows = new Set(layout.map((w) => Math.round(w.top))).size || 1;
  return rows * m.size * 1.3 + (rows - 1) * m.lineGap + m.padY * 2;
}

/**
 * @param {object} o
 * @param {number} o.bottom  distance from the bottom edge of the 1080x1920 frame
 * @param {number} o.alpha   scene-level opacity multiplier
 */
export function drawCaptions(ctx, phrase, t, o = {}) {
  if (!phrase) return;
  const {bottom = 148, alpha = 1} = o;
  const m = CAPTION_METRICS;

  const enter = smooth(inv(t, phrase.startSec - 0.06, phrase.startSec + 0.16));
  const exit = 1 - smooth(inv(t, phrase.endSec - 0.16, phrase.endSec + 0.05));
  const a = clamp(Math.min(enter, exit)) * alpha;
  if (a <= 0.01) return;

  const boxH = captionBoxHeight(ctx, phrase);
  const yOff = (1 - easeOutExpo(enter)) * 30;
  const boxX = (W - m.boxWidth) / 2;
  const boxY = H - bottom - boxH + yOff;

  ctx.save();
  ctx.globalAlpha *= a;

  panel(ctx, boxX, boxY, m.boxWidth, boxH, m.radius, {
    fill: 'rgba(8,7,13,0.85)',
    stroke: 'rgba(139,92,246,0.45)',
    shadow: 'rgba(0,0,0,0.6)',
    shadowBlur: 46,
    shadowY: 20,
  });

  ctx.save();
  rr(ctx, boxX, boxY, m.boxWidth, boxH, m.radius);
  ctx.clip();
  ctx.fillStyle = radial(ctx, W / 2, boxY + boxH + 40, 10, m.boxWidth * 0.8, [
    [0, 'rgba(109,40,217,0.34)'],
    [1, 'rgba(109,40,217,0)'],
  ]);
  ctx.fillRect(boxX, boxY, m.boxWidth, boxH);
  ctx.restore();

  const placed = layoutWords(ctx, phrase.words, W / 2, boxY + boxH / 2, m.size, {
    family: F.displayBold,
    maxWidth: m.maxWidth,
    gap: m.gap,
    lineGap: m.lineGap,
  });

  for (const word of placed) {
    const spoken = t >= word.startSec;
    const current = t >= word.startSec - 0.02 && t <= word.endSec + 0.06;
    let color = 'rgba(248,250,252,0.34)';
    if (current) color = word.highlight ? C.lavender : C.white;
    else if (spoken) color = word.highlight ? '#D8B4FE' : 'rgba(248,250,252,0.95)';

    if (current) {
      ctx.save();
      ctx.shadowColor = 'rgba(139,92,246,0.7)';
      ctx.shadowBlur = 28;
      fillRR(ctx, word.left - 3, word.top + m.size * 0.16, word.w + 6, m.size * 1.2, 12, 'rgba(109,40,217,0.42)');
      ctx.restore();
    }

    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.font = font(m.size, F.displayBold);
    ctx.fillStyle = color;
    if (current) {
      ctx.shadowColor = 'rgba(139,92,246,0.85)';
      ctx.shadowBlur = 24;
    }
    ctx.fillText(word.text, word.left + word.w, word.baseline);
    ctx.shadowBlur = 0;
  }

  const prog = clamp((t - phrase.startSec) / (phrase.endSec - phrase.startSec));
  const barW = m.boxWidth - m.padX * 2;
  fillRR(ctx, boxX + m.padX, boxY + boxH - 14, barW, 4, 2, 'rgba(255,255,255,0.12)');
  if (prog > 0.005) {
    fillRR(ctx, boxX + m.padX, boxY + boxH - 14, barW * prog, 4, 2, hGrad(ctx, boxX + m.padX, boxX + m.padX + barW, [
      [0, C.primary],
      [1, C.lavender],
    ]));
  }
  ctx.restore();
}
