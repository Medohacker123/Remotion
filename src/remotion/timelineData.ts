export const VIDEO_FPS = 60;
export const VIDEO_DURATION_SECONDS = 45;
export const TOTAL_FRAMES = VIDEO_FPS * VIDEO_DURATION_SECONDS; // 2700 frames

export const HD_DIMENSIONS = {
  width: 1080,
  height: 1920,
} as const;

export const FOUR_K_DIMENSIONS = {
  width: 2160,
  height: 3840,
} as const;

/**
 * Brand color palette extracted directly from Sudan Digital logo (IMG-20261022-WA0043_30c75cc0.jpg):
 * - Primary Purple: #431874 -> #6D28D9 -> #8B5CF6 (vibrant dark-surface variants)
 * - Deep Background: #08070D / #0F0B1A
 * - Structural Ink / White: #F8FAFC
 */
export const BRAND_COLORS = {
  bgObsidian: '#08070D',
  bgSurface: '#120D21',
  bgElevated: '#1A1330',
  primaryDeep: '#431874',
  primaryMid: '#6D28D9',
  primaryBright: '#8B5CF6',
  secondaryLavender: '#C4B5FD',
  accentAmber: '#F59E0B',
  alertCoral: '#F43F5E',
  successEmerald: '#10B981',
  inkWhite: '#F8FAFC',
  inkMuted: '#A1A1AA',
  borderSubtle: 'rgba(167, 139, 250, 0.22)',
} as const;

export type SceneId =
  | 'intro'
  | 'dropoff'
  | 'diagnosis'
  | 'solution'
  | 'experience'
  | 'endcard';

export interface SceneDefinition {
  id: SceneId;
  index: number;
  titleAr: string;
  subtitleAr: string;
  startFrame: number;
  durationFrames: number;
  endFrame: number;
  clipsUsed: string[];
  hasMotionScene: boolean;
}

export interface WordTiming {
  text: string;
  startSec: number;
  endSec: number;
  highlight?: boolean;
}

export interface CaptionPhrase {
  id: string;
  sceneId: SceneId;
  startSec: number;
  endSec: number;
  words: WordTiming[];
}

export const SCENES: SceneDefinition[] = [
  {
    id: 'intro',
    index: 1,
    titleAr: 'الافتتاحية والهوية البصرية',
    subtitleAr: 'كشف شعار سودان ديجيتال + سؤال الافتتاح الحركي',
    startFrame: 0,
    durationFrames: 240,
    endFrame: 240,
    clipsUsed: ['2D Motion Bumper'],
    hasMotionScene: true,
  },
  {
    id: 'dropoff',
    index: 2,
    titleAr: 'الزبون دخل.. واختفى',
    subtitleAr: 'تصفح الصفحة والسؤال عن السعر ثم التوقف دون شراء',
    startFrame: 240,
    durationFrames: 450,
    endFrame: 690,
    clipsUsed: ['02_competitor_browse', '06_clock_ticking', '10_hourglass_time'],
    hasMotionScene: true,
  },
  {
    id: 'diagnosis',
    index: 3,
    titleAr: 'التشخيص الحقيقي للمشكلة',
    subtitleAr: 'المشكلة ليست السعر أو المنتج.. بل غياب سبب الشراء',
    startFrame: 690,
    durationFrames: 480,
    endFrame: 1170,
    clipsUsed: ['03_write_idea', '2D Page Audit Motion'],
    hasMotionScene: true,
  },
  {
    id: 'solution',
    index: 4,
    titleAr: 'منهجية سودان ديجيتال',
    subtitleAr: 'المحتوى والتصميم وإدارة الصفحات في منظومة واحدة',
    startFrame: 1170,
    durationFrames: 570,
    endFrame: 1740,
    clipsUsed: ['11_team_sticky_notes', '13_design_layout', '15_website_monitor', '12_team_whiteboard'],
    hasMotionScene: true,
  },
  {
    id: 'experience',
    index: 5,
    titleAr: 'تجربة العميل المتكاملة',
    subtitleAr: 'مسار واضح وسهل من أول زيارة حتى إتمام الطلب',
    startFrame: 1740,
    durationFrames: 510,
    endFrame: 2250,
    clipsUsed: ['02_competitor_browse', '15_website_monitor', '2D Conversion Funnel'],
    hasMotionScene: true,
  },
  {
    id: 'endcard',
    index: 6,
    titleAr: 'شاشة الختام والدعوة للبدء',
    subtitleAr: 'سودان ديجيتال — خيارك الأفضل',
    startFrame: 2250,
    durationFrames: 450,
    endFrame: 2700,
    clipsUsed: ['2D Broadcast End-Card'],
    hasMotionScene: true,
  },
];

/**
 * Word-by-word Arabic captions calibrated precisely against the voiceover RMS energy
 * inside master-audio-45s.mp3.
 */
export const CAPTION_PHRASES: CaptionPhrase[] = [
  {
    id: 'p1',
    sceneId: 'dropoff',
    startSec: 4.15,
    endSec: 9.25,
    words: [
      {text: 'الزبون', startSec: 4.22, endSec: 4.88, highlight: true},
      {text: 'دخل', startSec: 5.09, endSec: 5.47},
      {text: 'صفحتك،', startSec: 5.47, endSec: 5.95},
      {text: 'شاف', startSec: 6.12, endSec: 6.42},
      {text: 'المنتج،', startSec: 6.42, endSec: 6.88},
      {text: 'وسأل', startSec: 7.06, endSec: 7.37},
      {text: 'عن', startSec: 7.37, endSec: 7.54},
      {text: 'السعر،', startSec: 7.54, endSec: 7.95, highlight: true},
      {text: 'وبعدها', startSec: 8.16, endSec: 8.62},
      {text: 'اختفى.', startSec: 8.76, endSec: 9.20, highlight: true},
    ],
  },
  {
    id: 'p2a',
    sceneId: 'diagnosis',
    startSec: 11.75,
    endSec: 14.05,
    words: [
      {text: 'المشكلة', startSec: 11.82, endSec: 12.37, highlight: true},
      {text: 'ما', startSec: 12.37, endSec: 12.60},
      {text: 'شرط', startSec: 12.60, endSec: 12.87},
      {text: 'تكون', startSec: 12.87, endSec: 13.22},
      {text: 'في', startSec: 13.25, endSec: 13.40},
      {text: 'السعر', startSec: 13.40, endSec: 13.66, highlight: true},
      {text: 'أو', startSec: 13.66, endSec: 13.78},
      {text: 'المنتج،', startSec: 13.78, endSec: 14.00, highlight: true},
    ],
  },
  {
    id: 'p2b',
    sceneId: 'diagnosis',
    startSec: 14.35,
    endSec: 17.55,
    words: [
      {text: 'ممكن', startSec: 14.42, endSec: 14.79},
      {text: 'تكون', startSec: 14.79, endSec: 15.09},
      {text: 'صفحتك', startSec: 15.09, endSec: 15.54, highlight: true},
      {text: 'ما', startSec: 15.66, endSec: 15.90},
      {text: 'ادتو', startSec: 15.90, endSec: 16.28},
      {text: 'سبب', startSec: 16.36, endSec: 16.69, highlight: true},
      {text: 'كافي', startSec: 16.69, endSec: 16.96, highlight: true},
      {text: 'يشتري', startSec: 16.96, endSec: 17.24},
      {text: 'منك.', startSec: 17.24, endSec: 17.48},
    ],
  },
  {
    id: 'p3',
    sceneId: 'solution',
    startSec: 19.95,
    endSec: 26.40,
    words: [
      {text: 'عشان', startSec: 20.02, endSec: 20.25},
      {text: 'كدة،', startSec: 20.25, endSec: 20.52},
      {text: 'نحن', startSec: 20.78, endSec: 20.96},
      {text: 'في', startSec: 20.96, endSec: 21.12},
      {text: 'سودان', startSec: 21.12, endSec: 21.42, highlight: true},
      {text: 'ديجيتال', startSec: 21.42, endSec: 21.78, highlight: true},
      {text: 'بنشتغل', startSec: 22.04, endSec: 22.36},
      {text: 'على', startSec: 22.36, endSec: 22.52},
      {text: 'المحتوى', startSec: 22.52, endSec: 23.08, highlight: true},
      {text: 'والتصميم', startSec: 23.27, endSec: 24.32, highlight: true},
      {text: 'وإدارة', startSec: 24.42, endSec: 24.87, highlight: true},
      {text: 'الصفحات', startSec: 24.87, endSec: 25.36, highlight: true},
      {text: 'مع بعض.', startSec: 25.42, endSec: 26.32},
    ],
  },
  {
    id: 'p4',
    sceneId: 'experience',
    startSec: 29.45,
    endSec: 33.30,
    words: [
      {text: 'وعشان', startSec: 29.52, endSec: 29.87},
      {text: 'نخلي', startSec: 29.87, endSec: 30.17},
      {text: 'تجربة', startSec: 30.17, endSec: 30.45},
      {text: 'العميل', startSec: 30.45, endSec: 30.75},
      {text: 'أوضح', startSec: 30.77, endSec: 31.02, highlight: true},
      {text: 'وأسهل،', startSec: 31.02, endSec: 31.34, highlight: true},
      {text: 'من', startSec: 31.48, endSec: 31.65},
      {text: 'أول', startSec: 31.65, endSec: 31.87},
      {text: 'زيارة', startSec: 31.87, endSec: 32.42, highlight: true},
      {text: 'لحد', startSec: 32.54, endSec: 32.82},
      {text: 'الطلب.', startSec: 32.82, endSec: 33.24, highlight: true},
    ],
  },
  {
    id: 'p5',
    sceneId: 'endcard',
    startSec: 38.55,
    endSec: 40.75,
    words: [
      {text: 'سودان', startSec: 38.62, endSec: 39.00, highlight: true},
      {text: 'ديجيتال..', startSec: 39.00, endSec: 39.42, highlight: true},
      {text: 'خيارك', startSec: 39.71, endSec: 40.15, highlight: true},
      {text: 'الأفضل.', startSec: 40.15, endSec: 40.65, highlight: true},
    ],
  },
];

export function frameToSeconds(frame: number, fps = VIDEO_FPS): number {
  return frame / fps;
}

export function formatTimecode(frame: number, fps = VIDEO_FPS): string {
  const clamped = Math.max(0, Math.min(TOTAL_FRAMES, Math.floor(frame)));
  const totalSeconds = Math.floor(clamped / fps);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const remFrames = clamped % fps;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(remFrames).padStart(2, '0')}`;
}

export function getActiveScene(frame: number): SceneDefinition {
  const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, frame));
  return (
    SCENES.find((s) => clamped >= s.startFrame && clamped < s.endFrame) ??
    SCENES[SCENES.length - 1]
  );
}

export function getActiveCaptionPhrase(timeSec: number): CaptionPhrase | null {
  return (
    CAPTION_PHRASES.find((p) => timeSec >= p.startSec && timeSec <= p.endSec) ??
    null
  );
}

export function validateTimeline(): {valid: boolean; errors: string[]} {
  const errors: string[] = [];
  if (SCENES.length === 0) {
    errors.push('SCENES must not be empty');
    return {valid: false, errors};
  }

  let cursor = 0;
  for (const scene of SCENES) {
    if (scene.startFrame !== cursor) {
      errors.push(`Scene ${scene.id} startFrame ${scene.startFrame} != expected ${cursor}`);
    }
    if (scene.endFrame !== scene.startFrame + scene.durationFrames) {
      errors.push(`Scene ${scene.id} endFrame mismatch`);
    }
    cursor = scene.endFrame;
  }

  if (cursor !== TOTAL_FRAMES) {
    errors.push(`Total scene frames ${cursor} != TOTAL_FRAMES ${TOTAL_FRAMES}`);
  }

  for (const phrase of CAPTION_PHRASES) {
    if (phrase.startSec < 0 || phrase.endSec > VIDEO_DURATION_SECONDS) {
      errors.push(`Phrase ${phrase.id} out of 0..${VIDEO_DURATION_SECONDS}s bounds`);
    }
    let prevEnd = phrase.startSec;
    for (const w of phrase.words) {
      if (w.startSec < prevEnd - 0.05 || w.endSec <= w.startSec) {
        errors.push(`Word "${w.text}" in ${phrase.id} has invalid timing`);
      }
      if (w.endSec > phrase.endSec + 0.05) {
        errors.push(`Word "${w.text}" exceeds phrase ${phrase.id} endSec`);
      }
      prevEnd = w.endSec;
    }
  }

  return {valid: errors.length === 0, errors};
}
