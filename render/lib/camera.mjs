/**
 * Shot list: which plate, which slice of it, and how the 2D camera moves.
 *
 * Every entry is expressed in *video* seconds so the cut list can be reasoned
 * about against the voiceover, then converted to frames by the renderer.
 *
 * Camera language (all 2D — crops, pans and zooms of flat plates):
 *   push    — slow ken-burns push-in, the default broadcast move
 *   drift   — lateral glide across the plate
 *   reveal  — pull-back from a tight crop to the full frame
 *   whip    — fast lateral travel cut on a beat
 */
/** Decoded stills per supplied clip (12 fps plates → 146 stills each). */
export const PLATES = {
  browse: {name: '02_competitor_browse_25f450a5', frames: 146},
  write: {name: '03_write_idea_091f514a', frames: 146},
  calendar: {name: '05_calendar_flip_58950def', frames: 146},
  clock: {name: '06_clock_ticking_ba4c8ffa', frames: 146},
  hourglass: {name: '10_hourglass_time_76fb56b9', frames: 146},
  sticky: {name: '11_team_sticky_notes_30a1b442', frames: 146},
  whiteboard: {name: '12_team_whiteboard_9e1fc0fb', frames: 146},
  design: {name: '13_design_layout_66c45f85', frames: 146},
  website: {name: '15_website_monitor_f71a509e', frames: 146},
};

export const SHOTS = [
  // ---- scene 2 · الزبون دخل صفحتك.. وبعدها اختفى (4.00 – 11.50s)
  {scene: 'dropoff', key: 'browse', in: 4.0, out: 8.3, move: 'push', zoom: [1.03, 1.13], pan: [0, -30]},
  {scene: 'dropoff', key: 'browse', in: 8.3, out: 10.2, move: 'drift', zoom: [1.12, 1.2], pan: [40, 0], flip: true},
  {scene: 'dropoff', key: 'clock', in: 10.2, out: 11.5, move: 'push', zoom: [1.14, 1.26], pan: [0, 20]},

  // ---- scene 3 · التشخيص (11.50 – 19.50s)
  {scene: 'diagnosis', key: 'write', in: 11.5, out: 14.3, move: 'push', zoom: [1.06, 1.16], pan: [24, -18]},
  {scene: 'diagnosis', key: 'hourglass', in: 14.3, out: 16.1, move: 'drift', zoom: [1.1, 1.18], pan: [-36, 12]},
  {scene: 'diagnosis', key: 'write', in: 16.1, out: 19.5, move: 'push', zoom: [1.02, 1.1], pan: [0, 26], flip: true},

  // ---- scene 4 · منهجية سودان ديجيتال (19.50 – 29.00s)
  {scene: 'solution', key: 'sticky', in: 19.5, out: 22.0, move: 'drift', zoom: [1.04, 1.14], pan: [36, -20]},
  {scene: 'solution', key: 'whiteboard', in: 22.0, out: 24.6, move: 'push', zoom: [1.06, 1.18], pan: [-24, 18]},
  {scene: 'solution', key: 'design', in: 24.6, out: 27.2, move: 'push', zoom: [1.04, 1.16], pan: [18, -14]},
  {scene: 'solution', key: 'design', in: 27.2, out: 29.0, move: 'drift', zoom: [1.16, 1.24], pan: [-30, 0], flip: true},

  // ---- scene 5 · تجربة العميل (29.00 – 37.50s)
  {scene: 'experience', key: 'website', in: 29.0, out: 32.6, move: 'push', zoom: [1.05, 1.17], pan: [26, -16]},
  {scene: 'experience', key: 'calendar', in: 32.6, out: 34.6, move: 'drift', zoom: [1.08, 1.18], pan: [-34, 14]},
  {scene: 'experience', key: 'website', in: 34.6, out: 37.5, move: 'reveal', zoom: [1.3, 1.12], pan: [0, 24], flip: true},
];

/** Plates that make up a scene's background bed, in playback order. */
export const BEDS = {
  dropoff: ['browse', 'browse', 'clock'],
  diagnosis: ['write', 'hourglass', 'write'],
  solution: ['sticky', 'whiteboard', 'design', 'design'],
  experience: ['website', 'calendar', 'website'],
};

export function shotAt(scene, t) {
  const shots = SHOTS.filter((s) => s.scene === scene);
  for (let i = 0; i < shots.length; i++) {
    const s = shots[i];
    if (t >= s.in && t < s.out) {
      const progress = (t - s.in) / (s.out - s.in);
      return {...s, index: i, progress};
    }
  }
  const last = shots[shots.length - 1];
  return {...last, index: shots.length - 1, progress: 1};
}
