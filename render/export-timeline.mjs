/**
 * Exports the single source of truth (src/remotion/timelineData.ts) to JSON so the
 * deterministic Python/Node renderer and the Remotion composition stay in sync.
 *
 *   npx tsx render/export-timeline.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  BRAND_COLORS,
  CAPTION_PHRASES,
  FOUR_K_DIMENSIONS,
  HD_DIMENSIONS,
  SCENES,
  TOTAL_FRAMES,
  VIDEO_DURATION_SECONDS,
  VIDEO_FPS,
  validateTimeline,
} from '../src/remotion/timelineData.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../build/render-data');
fs.mkdirSync(outDir, {recursive: true});

const validation = validateTimeline();
if (!validation.valid) {
  console.error('Timeline invalid:', validation.errors);
  process.exit(1);
}

const payload = {
  fps: VIDEO_FPS,
  durationSeconds: VIDEO_DURATION_SECONDS,
  totalFrames: TOTAL_FRAMES,
  hd: HD_DIMENSIONS,
  fourK: FOUR_K_DIMENSIONS,
  colors: BRAND_COLORS,
  scenes: SCENES,
  captions: CAPTION_PHRASES,
};

fs.writeFileSync(path.join(outDir, 'timeline.json'), JSON.stringify(payload, null, 2));
console.log(
  `timeline.json written — ${SCENES.length} scenes, ${CAPTION_PHRASES.length} caption phrases, ${TOTAL_FRAMES} frames @ ${VIDEO_FPS}fps`,
);
