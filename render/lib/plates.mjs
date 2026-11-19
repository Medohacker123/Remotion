/**
 * Reusable 2D broadcast plates: phone/chat mock, counters, audit cards,
 * "شنو المانع تبدأ؟" sheet, service tiles, journey/funnel, end-card and the
 * persistent on-screen chrome (bug + lower third + kinetic captions).
 */
import {
  C,
  F,
  H,
  W,
  clamp,
  easeIn,
  easeOut,
  easeOutBack,
  easeOutExpo,
  fillRR,
  font,
  hGrad,
  halftone,
  iconTile,
  inv,
  layoutWords,
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
  vGrad,
  wrap,
} from './design.mjs';

/* --------------------------------------------------------------- chrome: bug */
export function cornerBug(ctx, t, opts = {}) {
  const {opacity = 1, chapter = '01', chapterTitle = 'الافتتاحية', progress = 0} = opts;
  if (opacity <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = opacity;

  // top broadcast progress hairline
  const x0 = 56;
  const x1 = W - 56;
  fillRR(ctx, x0, 66, x1 - x0, 4, 2, 'rgba(255,255,255,0.12)');
  const pw = (x1 - x0) * clamp(progress);
  if (pw > 2) {
    fillRR(ctx, x0, 66, pw, 4, 2, hGrad(ctx, x0, x0 + pw, [
      [0, C.primary],
      [1, C.lavender],
    ]));
  }

  // right: brand lockup
  const bw = 320;
  const bh = 74;
  const bx = W - 56 - bw;
  panel(ctx, bx, 92, bw, bh, 20, {
    fill: 'rgba(8,7,13,0.72)',
    shadow: 'rgba(0,0,0,0.35)',
    shadowBlur: 22,
    shadowY: 8,
  });
  fillRR(ctx, bx + bw - 62, 111, 42, 36, 9, rgba(C.primary, 0.9));
  text(ctx, 'S', bx + bw - 41, 138, {
    size: 25, family: F.displayBold, align: 'center', dir: 'ltr', color: C.white,
  });
  text(ctx, 'سودان ديجيتال', bx + bw - 78, 126, {size: 25, family: F.displayBold});
  text(ctx, 'SUDAN DIGITAL', bx + bw - 78, 148, {
    size: 13, family: F.bodyBold, align: 'right', color: C.lavender, letterSpacing: 2.4, dir: 'ltr',
  });

  // left: chapter chip (kept compact so it never collides with lower thirds)
  const cw = 246;
  panel(ctx, 56, 92, cw, bh, 20, {
    fill: 'rgba(18,13,33,0.78)',
    shadow: 'rgba(0,0,0,0.35)',
    shadowBlur: 22,
    shadowY: 8,
  });
  fillRR(ctx, 56 + cw - 62, 110, 40, 38, 11, 'rgba(109,40,217,0.55)');
  text(ctx, chapter, 56 + cw - 42, 137, {
    size: 22, family: F.bodyBold, align: 'center', dir: 'ltr', color: C.lavender,
  });
  text(ctx, chapterTitle, 56 + cw - 76, 137, {size: 22, family: F.bodySemi, align: 'right'});
  ctx.restore();
}

/* ------------------------------------------------- chrome: lower third banner */
export function lowerThird(ctx, p, opts = {}) {
  const {step = '01', title = '', subtitle = '', accent = C.bright} = opts;
  if (p <= 0.001) return;
  const e = easeOutBack(clamp(p));
  const off = (1 - e) * 120;
  const w = 660;
  const h = 112;
  const x = W - 64 - w + off;
  const y = 196;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 3);
  panel(ctx, x, y, w, h, 26, {
    fill: 'rgba(8,7,13,0.88)',
    stroke: rgba(accent, 0.6),
    shadow: 'rgba(0,0,0,0.5)',
    shadowBlur: 34,
    shadowY: 14,
  });
  // accent spine on the right (RTL)
  fillRR(ctx, x + w - 8, y + 14, 6, h - 28, 3, accent);
  // number chip
  const chip = 66;
  const cx = x + w - 30 - chip;
  fillRR(ctx, cx, y + (h - chip) / 2, chip, chip, 18, hGrad(ctx, cx, cx + chip, [
    [0, C.deep], [1, C.bright],
  ]));
  text(ctx, step, cx + chip / 2, y + h / 2 + 10, {
    size: 27, family: F.bodyBold, align: 'center', dir: 'ltr', color: C.white,
  });
  text(ctx, title, cx - 24, y + 50, {size: 32, family: F.displayBold});
  text(ctx, subtitle, cx - 24, y + 86, {size: 22, family: F.body, color: C.lavender});
  ctx.restore();
}

/* ----------------------------------------------------------- chrome: captions */
export {drawCaptions as captions} from './captions.mjs';

/* --------------------------------------------------------------- phone mockup */
export async function phoneFrame(ctx, x, y, w, h, opts = {}) {
  const {glow = 0.5, screen = true, radius = w * 0.1} = opts;
  ctx.save();
  if (glow) {
    ctx.shadowColor = rgba(C.bright, 0.6);
    ctx.shadowBlur = 90;
    ctx.shadowOffsetY = 30;
  }
  fillRR(ctx, x, y, w, h, radius, '#0B0912');
  ctx.restore();
  fillRR(ctx, x + 5, y + 5, w - 10, h - 10, radius - 4, '#12111A');
  if (screen) {
    fillRR(ctx, x + 12, y + 12, w - 24, h - 24, radius - 8, '#0A0812');
  }
  // notch
  fillRR(ctx, x + w / 2 - 44, y + 20, 88, 18, 9, '#1A1330');
  return {sx: x + 12, sy: y + 12, sw: w - 24, sh: h - 24};
}

/** Phone storefront page with a moving scroll + chat overlay. */
export async function phonePage(ctx, opts = {}) {
  const {
    x = W / 2 - 205, y = 470, w = 410, h = 830,
    scroll = 0, reveal = 1, chat = 0, chatText = 'السعر كم؟', you = false,
    vanished = 0, ctaPulse = 0,
  } = opts;
  const s = await phoneFrame(ctx, x, y, w, h);
  ctx.save();
  rr(ctx, s.sx, s.sy, s.sw, s.sh, 30);
  ctx.clip();

  // bg
  ctx.fillStyle = vGrad(ctx, s.sy, s.sy + s.sh, [
    [0, '#151027'], [0.5, '#100C1C'], [1, '#0A0812'],
  ]);
  ctx.fillRect(s.sx, s.sy, s.sw, s.sh);

  ctx.save();
  ctx.translate(0, -scroll);

  // status bar
  text(ctx, '٩:٤١', s.sx + 24, s.sy + 46, {size: 18, family: F.bodyBold, align: 'left', color: 'rgba(248,250,252,0.8)'});
  fillRR(ctx, s.sx + s.sw - 56, s.sy + 34, 30, 12, 4, 'rgba(248,250,252,0.5)');

  // header
  fillRR(ctx, s.sx, s.sy + 66, s.sw, 92, 0, 'rgba(18,13,33,0.95)');
  fillRR(ctx, s.sx + s.sw - 66, s.sy + 88, 40, 40, 12, hGrad(ctx, s.sx, s.sx + s.sw, [[0, C.deep], [1, C.bright]]));
  text(ctx, 'SD', s.sx + s.sw - 46, s.sy + 114, {size: 15, family: F.displayBold, align: 'center', dir: 'ltr'});
  text(ctx, 'متجر الهوية', s.sx + s.sw - 82, s.sy + 104, {size: 19, family: F.displayBold});
  text(ctx, 'متصل الآن', s.sx + s.sw - 82, s.sy + 128, {size: 12, family: F.body, color: C.emerald});

  // hero
  const hy = s.sy + 170;
  fillRR(ctx, s.sx + 16, hy, s.sw - 32, 200, 20, vGrad(ctx, hy, hy + 200, [
    [0, 'rgba(109,40,217,0.55)'], [1, 'rgba(67,24,116,0.25)'],
  ]));
  halftone(ctx, s.sx + 16, hy, s.sw - 32, 200, 0.12);
  text(ctx, 'تشكيلة جديدة', s.sx + s.sw - 36, hy + 62, {size: 25, family: F.displayBold});
  text(ctx, 'خصم حتى ٣٠٪ هذا الأسبوع', s.sx + s.sw - 36, hy + 94, {size: 14, family: F.body, color: C.lavender});
  fillRR(ctx, s.sx + s.sw - 148, hy + 128, 112, 40, 14, C.white);
  text(ctx, 'تسوق الآن', s.sx + s.sw - 92, hy + 155, {size: 15, family: F.bodyBold, align: 'center', color: C.deep});

  // product grid
  for (let i = 0; i < 4; i++) {
    const gx = s.sx + 16 + (i % 2) * ((s.sw - 44) / 2 + 12);
    const gy = hy + 220 + Math.floor(i / 2) * 196;
    fillRR(ctx, gx, gy, (s.sw - 44) / 2, 180, 16, 'rgba(255,255,255,0.045)');
    strokeRR(ctx, gx, gy, (s.sw - 44) / 2, 180, 16, 'rgba(167,139,250,0.16)', 1.2);
    fillRR(ctx, gx + 10, gy + 10, (s.sw - 44) / 2 - 20, 104, 12, ['#241a3d', '#2b1f4a', '#1d1733', '#2a2046'][i]);
    text(ctx, ['حقيبة جلد', 'ساعة أنيقة', 'عطر فاخر', 'حذاء رياضي'][i], gx + (s.sw - 44) / 2 - 12, gy + 142, {size: 14, family: F.bodySemi});
    text(ctx, ['٢٤٥ ر.س', '٤٩٠ ر.س', '١٨٠ ر.س', '٣٢٠ ر.س'][i], gx + (s.sw - 44) / 2 - 12, gy + 166, {size: 13, family: F.bodyBold, color: C.amber});
  }

  // page bottom CTA
  const by = hy + 220 + 2 * 196 + 8;
  fillRR(ctx, s.sx + 16, by, s.sw - 32, 52, 16, `rgba(109,40,217,${0.35 + ctaPulse * 0.45})`);
  text(ctx, 'أضف إلى السلة', s.sx + s.sw / 2, by + 34, {size: 17, family: F.bodyBold, align: 'center'});
  ctx.restore();

  // ---- chat overlay
  if (chat > 0) {
    ctx.save();
    ctx.globalAlpha *= clamp(chat);
    const cy = s.sy + s.sh - 268 + (1 - easeOutExpo(chat)) * 40;
    panel(ctx, s.sx + 14, cy, s.sw - 28, 240, 22, {
      fill: 'rgba(10,8,18,0.94)',
      stroke: 'rgba(167,139,250,0.28)',
      shadow: 'rgba(0,0,0,0.6)',
      shadowBlur: 30,
    });
    text(ctx, 'المحادثة', s.sx + s.sw - 32, cy + 34, {size: 15, family: F.bodySemi, color: C.ink3});
    // customer bubble
    fillRR(ctx, s.sx + 26, cy + 52, 250, 62, 18, 'rgba(248,250,252,0.10)');
    text(ctx, chatText, s.sx + 26 + 230, cy + 92, {size: 22, family: F.displayBold, color: C.white});
    // reply / typing
    const ry = cy + 132;
    if (you) {
      fillRR(ctx, s.sx + s.sw - 300, ry, 274, 56, 18, rgba(C.primary, 0.85));
      text(ctx, 'أهلاً، السعر ٢٤٥ ر.س', s.sx + s.sw - 50, ry + 38, {size: 19, family: F.bodySemi, color: C.white});
    } else {
      fillRR(ctx, s.sx + 26, ry, 92, 52, 18, 'rgba(248,250,252,0.08)');
      for (let i = 0; i < 3; i++) {
        const a = 0.35 + 0.55 * Math.abs(Math.sin(chat * 6 + i * 0.9));
        ctx.globalAlpha = clamp(chat) * a;
        ctx.fillStyle = C.lavender;
        ctx.beginPath();
        ctx.arc(s.sx + 54 + i * 20, ry + 26, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha *= clamp(chat);
    }
    // vanishing state
    if (vanished > 0) {
      ctx.fillStyle = `rgba(10,8,18,${0.9 * vanished})`;
      ctx.fillRect(s.sx, s.sy + s.sh - 268, s.sw, 268);
      ctx.globalAlpha = clamp(vanished) * clamp(chat);
      text(ctx, 'المحادثة', s.sx + s.sw - 32, cy + 34, {size: 15, family: F.bodySemi, color: C.ink3});
      fillRR(ctx, s.sx + 26, cy + 52, 250, 62, 18, 'rgba(248,250,252,0.10)');
      text(ctx, chatText, s.sx + 26 + 230, cy + 92, {size: 22, family: F.displayBold, color: C.white});
      text(ctx, 'آخر ظهور: ٣ أيام', s.sx + s.sw / 2, cy + 156, {
        size: 20, family: F.bodySemi, align: 'center', color: C.muted,
      });
      text(ctx, 'بدون رد · بدون طلب', s.sx + s.sw / 2, cy + 196, {
        size: 19, family: F.bodySemi, align: 'center', color: C.coral,
      });
    }
    ctx.restore();
  }
  ctx.restore();

  // frame highlight
  ctx.save();
  strokeRR(ctx, x, y, w, h, w * 0.1, 'rgba(196,181,253,0.45)', 2.5);
  ctx.restore();
}

/* ----------------------------------------------------------- counters block */
export function counterCard(ctx, p, opts = {}) {
  const {
    x = 64, y = 1220, w = W - 128, h = 150,
    items = [], accent = C.bright,
  } = opts;
  if (p <= 0.001) return;
  const e = easeOutExpo(clamp(p));
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  panel(ctx, x, y, w, h, 26, {
    fill: 'rgba(12,9,22,0.95)',
    stroke: rgba(accent, 0.35),
    shadow: 'rgba(0,0,0,0.55)',
    shadowBlur: 38,
    shadowY: 16,
  });
  const colW = w / items.length;
  items.forEach((it, i) => {
    const cx = x + w - colW * (i + 0.5);
    text(ctx, it.label, cx, y + 44, {size: 21, family: F.bodySemi, align: 'center', color: C.ink3});
    const val = typeof it.value === 'number' ? Math.round(it.value * e * (it.k || 1)) : it.value;
    const str = it.format ? it.format(val) : String(val);
    text(ctx, str, cx, y + 104, {
      size: 52, family: F.displayBlack, align: 'center', dir: 'ltr',
      color: it.color || C.white,
    });
    if (i < items.length - 1) {
      ctx.fillStyle = 'rgba(167,139,250,0.2)';
      ctx.fillRect(x + w - colW * (i + 1), y + 34, 1.5, h - 68);
    }
  });
  ctx.restore();
}

/* -------------------------------------------------------------- sheet reveal */
/** ورقة «شنو المانع تبدأ؟» with the three blockers. */
export async function blockerSheet(ctx, p, opts = {}) {
  const {
    x = 80, y = 560, w = W - 160, h = 640,
    items = [
      {icon: 'clock', label: 'الوقت', note: 'مشروعي يحتاج وقت ما عندي'},
      {icon: 'chart', label: 'النتيجة', note: 'ما شفت نتيجة تخليني أستمر'},
      {icon: 'eye', label: 'الخوف من التجربة', note: 'خايف أدفع ولا يجيب نتيجة'},
    ],
    accent = C.amber,
  } = opts;
  if (p <= 0.001) return;
  const e = easeOutExpo(clamp(p));
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2.2);

  // paper drop shadow + sheet
  ctx.save();
  ctx.translate(0, (1 - e) * 46);
  ctx.rotate((1 - e) * 0.014);
  panel(ctx, x, y, w, h, 34, {
    fill: 'rgba(248,250,252,0.97)',
    stroke: 'rgba(196,181,253,0.85)',
    lw: 2,
    shadow: 'rgba(0,0,0,0.62)',
    shadowBlur: 60,
    shadowY: 26,
    innerHighlight: false,
  });
  // torn-tape / pin accents
  fillRR(ctx, x + w / 2 - 70, y - 14, 140, 28, 8, 'rgba(196,181,253,0.75)');

  text(ctx, 'شنو المانع تبدأ؟', x + w - 44, y + 92, {size: 52, family: F.displayBlack, color: '#171029'});
  text(ctx, 'ثلاثة أسباب نسمعها كل يوم', x + w - 44, y + 128, {size: 22, family: F.bodyMed, color: 'rgba(23,16,41,0.6)'});
  ctx.fillStyle = 'rgba(23,16,41,0.14)';
  ctx.fillRect(x + 40, y + 150, w - 80, 2);

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const ip = clamp((p - 0.14 - i * 0.12) / 0.34);
    if (ip <= 0) continue;
    const iy = y + 192 + i * 138;
    ctx.save();
    ctx.globalAlpha *= clamp(p * 2.2) * clamp(ip * 1.3);
    ctx.translate((1 - easeOutBack(ip)) * -70, 0);
    const tileFill = ['rgba(245,158,11,0.18)', 'rgba(139,92,246,0.16)', 'rgba(244,63,94,0.14)'][i];
    const tint = [C.amber, C.primary, C.coral][i];
    fillRR(ctx, x + w - 44 - 78, iy - 40, 78, 78, 22, tileFill);
    strokeRR(ctx, x + w - 44 - 78, iy - 40, 78, 78, 22, rgba(tint, 0.5), 1.6);
    await iconTile(ctx, it.icon, x + w - 44 - 39, iy - 1, 62, {
      fill: 'rgba(0,0,0,0)', stroke: null, tint,
    });
    text(ctx, it.label, x + w - 44 - 98, iy + 4, {size: 34, family: F.displayBold, color: '#171029'});
    text(ctx, it.note, x + w - 44 - 98, iy + 40, {size: 21, family: F.body, color: 'rgba(23,16,41,0.62)'});
    // checkbox
    strokeRR(ctx, x + 44, iy - 26, 52, 52, 12, 'rgba(23,16,41,0.28)', 2.4);
    if (ip > 0.55) {
      ctx.save();
      ctx.globalAlpha *= clamp((ip - 0.55) / 0.3);
      fillRR(ctx, x + 44, iy - 26, 52, 52, 12, C.primary);
      const im = await iconForCheck();
      ctx.drawImage(im, x + 52, iy - 18, 36, 36);
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
}

let CHECK_IMG = null;
async function iconForCheck() {
  if (CHECK_IMG) return CHECK_IMG;
  const {svgImage, svgIcon} = await import('./design.mjs');
  CHECK_IMG = await svgImage(svgIcon('check', '#FFFFFF', 6, 64));
  return CHECK_IMG;
}

/* --------------------------------------------------------------- audit cards */
export function checkCard(ctx, p, opts = {}) {
  const {
    x = 76, y = 700, w = W - 152, h = 132,
    title = '', note = '', ok = true, accent = C.emerald,
  } = opts;
  if (p <= 0.001) return;
  const e = easeOutBack(clamp(p));
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  ctx.translate((1 - e) * 60, 0);
  panel(ctx, x, y, w, h, 26, {
    fill: ok ? 'rgba(16,30,26,0.94)' : 'rgba(28,14,30,0.95)',
    stroke: rgba(accent, 0.5),
    shadow: 'rgba(0,0,0,0.5)',
    shadowBlur: 30,
    shadowY: 14,
  });
  fillRR(ctx, x + w - 92, y + (h - 68) / 2, 68, 68, 20, rgba(accent, 0.18));
  strokeRR(ctx, x + w - 92, y + (h - 68) / 2, 68, 68, 20, rgba(accent, 0.55), 1.8);
  text(ctx, ok ? '✓' : '✕', x + w - 58, y + h / 2 + 14, {
    size: 38, family: F.displayBold, align: 'center', dir: 'ltr', color: accent,
  });
  text(ctx, title, x + w - 112, y + 54, {size: 31, family: F.displayBold});
  text(ctx, note, x + w - 112, y + 92, {size: 20, family: F.body, color: 'rgba(248,250,252,0.7)'});
  if (!ok) {
    // strike-through for the "this is not the problem" reading
    ctx.save();
    ctx.globalAlpha = clamp(p * 2) * 0.55;
    ctx.fillStyle = accent;
    ctx.fillRect(x + 40, y + h / 2 - 2, w - 180, 3);
    ctx.restore();
  }
  ctx.restore();
}

/* ---------------------------------------------------------------- service tile */
export async function serviceTile(ctx, p, opts = {}) {
  const {
    x = 84, y = 720, w = W - 168, h = 148,
    icon = 'layers', title = '', note = '', accent = C.bright, index = 0,
  } = opts;
  if (p <= 0.001) return;
  const e = easeOutBack(clamp(p));
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  ctx.translate((1 - e) * 80, 0);
  panel(ctx, x, y, w, h, 28, {
    fill: 'rgba(26,19,48,0.94)',
    stroke: rgba(accent, 0.45),
    shadow: 'rgba(0,0,0,0.5)',
    shadowBlur: 34,
    shadowY: 14,
  });
  fillRR(ctx, x + w - 30 - 88, y + (h - 88) / 2, 88, 88, 26, hGrad(ctx, x + w - 118, x + w - 30, [
    [0, rgba(C.deep, 0.95)], [1, rgba(accent, 0.85)],
  ]));
  await iconTile(ctx, icon, x + w - 74, y + h / 2, 88, {
    fill: 'rgba(0,0,0,0)', stroke: null, tint: '#FFFFFF', iconScale: 0.52,
  });
  text(ctx, title, x + w - 142, y + 62, {size: 34, family: F.displayBold});
  text(ctx, note, x + w - 142, y + 104, {size: 21, family: F.body, color: C.lavender});
  // index tag
  text(ctx, `0${index + 1}`, x + 40, y + h / 2 + 10, {
    size: 24, family: F.bodyBold, align: 'left', dir: 'ltr', color: 'rgba(196,181,253,0.5)',
  });
  ctx.restore();
}

/* ------------------------------------------------------------------ unit cards */
export async function pillarCard(ctx, p, opts = {}) {
  const {
    x = 84, y = 900, w = W - 168, h = 132,
    num = '01', title = '', accent = C.bright, icon = 'spark',
  } = opts;
  if (p <= 0.001) return;
  const e = easeOutBack(clamp(p));
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  ctx.translate(0, (1 - e) * 40);
  panel(ctx, x, y, w, h, 26, {
    fill: 'rgba(26,19,48,0.95)',
    stroke: rgba(accent, 0.42),
    shadow: 'rgba(0,0,0,0.45)',
    shadowBlur: 28,
    shadowY: 12,
  });
  fillRR(ctx, x + w - 100, y + (h - 68) / 2, 68, 68, 20, rgba(accent, 0.18));
  await iconTile(ctx, icon, x + w - 66, y + h / 2, 68, {
    fill: 'rgba(0,0,0,0)', stroke: null, tint: accent, iconScale: 0.55,
  });
  text(ctx, title, x + w - 124, y + 78, {size: 33, family: F.displayBold});
  text(ctx, num, x + 46, y + 80, {size: 30, family: F.displayBold, align: 'left', dir: 'ltr', color: rgba(accent, 0.65)});
  ctx.restore();
}

/* -------------------------------------------------------------- delivery card */
/** "تم تأكيد الطلب بنجاح ✓" confirmation card. */
export async function confirmCard(ctx, p, opts = {}) {
  const {x = 108, y = 860, w = W - 216, h = 300} = opts;
  if (p <= 0.001) return;
  const e = easeOutBack(clamp(p));
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2.4);
  ctx.translate(W / 2, y + h / 2);
  ctx.scale(lerp(0.9, 1, e), lerp(0.9, 1, e));
  ctx.translate(-W / 2, -(y + h / 2));
  panel(ctx, x, y, w, h, 34, {
    fill: 'rgba(11,26,22,0.96)',
    stroke: 'rgba(16,185,129,0.6)',
    shadow: 'rgba(16,185,129,0.35)',
    shadowBlur: 70,
    shadowY: 24,
  });
  // check badge
  const cx = W / 2;
  const cy = y + 84;
  ctx.save();
  ctx.shadowColor = 'rgba(16,185,129,0.8)';
  ctx.shadowBlur = 46;
  fillRR(ctx, cx - 44, cy - 44, 88, 88, 28, hGrad(ctx, cx - 44, cx + 44, [
    [0, '#059669'], [1, C.emerald],
  ]));
  ctx.restore();
  const im = await iconForCheck();
  ctx.drawImage(im, cx - 26, cy - 26, 52, 52);
  text(ctx, 'تم تأكيد الطلب بنجاح', cx, y + 186, {size: 38, family: F.displayBold, align: 'center'});
  text(ctx, 'رقم الطلب ٢٧٠٠ · سيصلك خلال ٢٤ ساعة', cx, y + 224, {
    size: 20, family: F.body, align: 'center', color: 'rgba(248,250,252,0.72)',
  });
  fillRR(ctx, x + 40, y + 250, w - 80, 6, 3, 'rgba(16,185,129,0.22)');
  fillRR(ctx, x + 40, y + 250, (w - 80) * clamp(inv(p, 0.3, 1)), 6, 3, C.emerald);
  ctx.restore();
}

/* ------------------------------------------------------------------- journey */
export function journeyLine(ctx, p, opts = {}) {
  const {
    y = 900, x0 = 132, x1 = W - 132,
    stages = [
      {icon: 'eye', label: 'زيارة'},
      {icon: 'phone', label: 'تصفح'},
      {icon: 'cart', label: 'طلب'},
      {icon: 'check', label: 'تسليم'},
    ],
    active = 0, accent = C.bright,
  } = opts;
  const fill = clamp(p);
  ctx.save();
  // rail
  fillRR(ctx, x0, y - 4, x1 - x0, 8, 4, 'rgba(255,255,255,0.12)');
  if (fill > 0.005) {
    fillRR(ctx, x0, y - 4, (x1 - x0) * fill, 8, 4, hGrad(ctx, x0, x1, [
      [0, C.primary], [0.6, C.bright], [1, C.lavender],
    ]));
  }
  const n = stages.length;
  stages.forEach((s, i) => {
    const t = i / (n - 1);
    const cx = x0 + (x1 - x0) * t;
    const reached = fill >= t - 0.001;
    const isActive = i === active;
    const scale = isActive ? 1.12 : 1;
    ctx.save();
    ctx.translate(cx, y);
    ctx.scale(scale, scale);
    if (reached) {
      ctx.shadowColor = rgba(accent, 0.85);
      ctx.shadowBlur = isActive ? 44 : 24;
    }
    fillRR(ctx, -46, -46, 92, 92, 28, reached ? hGrad(ctx, -46, 46, [[0, C.deep], [1, accent]]) : 'rgba(26,19,48,0.95)');
    ctx.restore();
    if (reached) {
      ctx.save();
      ctx.strokeStyle = rgba(C.lavender, 0.5);
      ctx.lineWidth = 1.6;
      rr(ctx, cx - 46, y - 46, 92, 92, 28);
      ctx.stroke();
      ctx.restore();
    }
    drawIconSync(ctx, s.icon, cx, y, 44, reached ? '#FFFFFF' : 'rgba(248,250,252,0.35)');
    text(ctx, s.label, cx, y + 88, {
      size: 24, family: F.bodySemi, align: 'center',
      color: reached ? C.white : 'rgba(248,250,252,0.4)',
    });
  });
  ctx.restore();
}

const ICON_IMG = {};
export function drawIconSync(ctx, name, cx, cy, size, color) {
  // icons are registered synchronously up-front in render-frames.mjs
  const im = ICON_IMG[`${name}|${color}`];
  if (!im) return;
  ctx.drawImage(im, cx - size / 2, cy - size / 2, size, size);
}
export function registerIcons(map) {
  Object.assign(ICON_IMG, map);
}

/* -------------------------------------------------------------------- funnel */
export function funnel(ctx, p, opts = {}) {
  const {
    x = 120, y = 660, w = W - 240,
    rows = [
      {label: 'زيارات الصفحة', value: 1240, color: C.bright},
      {label: 'محادثات واتساب', value: 380, color: C.lavender},
      {label: 'طلبات مكتملة', value: 96, color: C.amber},
    ],
  } = opts;
  const e = easeOutExpo(clamp(p));
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  rows.forEach((r, i) => {
    const rw = w * (1 - i * 0.17);
    const rx = x + (w - rw) / 2;
    const ry = y + i * 150;
    const eff = clamp((p - i * 0.1) / 0.7);
    fillRR(ctx, rx, ry, rw, 116, 26, rgba(r.color, 0.16));
    strokeRR(ctx, rx, ry, rw, 116, 26, rgba(r.color, 0.45), 1.6);
    fillRR(ctx, rx, ry, rw * clamp(eff), 116, 26, rgba(r.color, 0.3));
    text(ctx, r.label, rx + rw - 28, ry + 46, {size: 24, family: F.bodySemi});
    text(ctx, Math.round(r.value * eff).toLocaleString('en-US'), rx + rw - 28, ry + 88, {
      size: 40, family: F.displayBlack, align: 'right', dir: 'ltr', color: r.color,
    });
    if (i < rows.length - 1) {
      const ax = W / 2;
      ctx.fillStyle = 'rgba(196,181,253,0.4)';
      ctx.beginPath();
      ctx.moveTo(ax - 9, ry + 124);
      ctx.lineTo(ax + 9, ry + 124);
      ctx.lineTo(ax, ry + 142);
      ctx.closePath();
      ctx.fill();
    }
  });
  ctx.restore();
}

/* ---------------------------------------------------------------- end card CTA */
export function ctaButton(ctx, p, opts = {}) {
  const {
    x = 190, y = 1320, w = W - 380, h = 108, label = 'ابدأ مشروعك الآن',
    pulse = 0, accent = C.bright,
  } = opts;
  if (p <= 0.001) return;
  const e = easeOutBack(clamp(p));
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  ctx.translate(0, (1 - e) * 30);
  ctx.save();
  ctx.shadowColor = rgba(accent, 0.85);
  ctx.shadowBlur = 54 + pulse * 20;
  fillRR(ctx, x, y, w, h, 30, hGrad(ctx, x, x + w, [
    [0, C.deep], [0.55, C.primary], [1, C.bright],
  ]));
  ctx.restore();
  strokeRR(ctx, x, y, w, h, 30, 'rgba(248,250,252,0.35)', 1.6);
  text(ctx, label, W / 2, y + h / 2 + 14, {size: 36, family: F.displayBold, align: 'center'});
  ctx.restore();
}

/* ------------------------------------------------------------- brand end lockup */
export async function brandLockup(ctx, p, opts = {}) {
  const {cx = W / 2, cy = 720, scale = 1, alpha = 1, logo = null} = opts;
  const e = easeOutExpo(clamp(p));
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  const w = 640 * scale * lerp(0.94, 1, e);
  const h = (660 / 1390) * w;
  ctx.save();
  ctx.shadowColor = 'rgba(139,92,246,0.55)';
  ctx.shadowBlur = 70;
  if (logo) ctx.drawImage(logo, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
  ctx.restore();
}
