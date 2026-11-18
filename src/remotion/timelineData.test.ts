import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAPTION_PHRASES,
  SCENES,
  TOTAL_FRAMES,
  VIDEO_DURATION_SECONDS,
  VIDEO_FPS,
  formatTimecode,
  frameToSeconds,
  getActiveCaptionPhrase,
  getActiveScene,
  validateTimeline,
} from './timelineData';

test('timeline sums cleanly to exact 45s (2700 frames @ 60fps)', () => {
  assert.equal(VIDEO_FPS, 60);
  assert.equal(VIDEO_DURATION_SECONDS, 45);
  assert.equal(TOTAL_FRAMES, 2700);
  const validation = validateTimeline();
  assert.equal(validation.valid, true, validation.errors.join('; '));
});

test('getActiveScene maps boundary frames accurately', () => {
  assert.equal(getActiveScene(0).id, 'intro');
  assert.equal(getActiveScene(239).id, 'intro');
  assert.equal(getActiveScene(240).id, 'dropoff');
  assert.equal(getActiveScene(690).id, 'diagnosis');
  assert.equal(getActiveScene(1170).id, 'solution');
  assert.equal(getActiveScene(1740).id, 'experience');
  assert.equal(getActiveScene(2250).id, 'endcard');
  assert.equal(getActiveScene(2699).id, 'endcard');
});

test('getActiveCaptionPhrase matches voiceover segments cleanly', () => {
  assert.equal(getActiveCaptionPhrase(1.5), null);
  assert.equal(getActiveCaptionPhrase(5.2)?.id, 'p1');
  assert.equal(getActiveCaptionPhrase(12.4)?.id, 'p2a');
  assert.equal(getActiveCaptionPhrase(16.0)?.id, 'p2b');
  assert.equal(getActiveCaptionPhrase(22.6)?.id, 'p3');
  assert.equal(getActiveCaptionPhrase(31.1)?.id, 'p4');
  assert.equal(getActiveCaptionPhrase(39.8)?.id, 'p5');
  assert.equal(getActiveCaptionPhrase(43.5), null);
});

test('timecode and frame conversion utilities behave deterministically', () => {
  assert.equal(frameToSeconds(150), 2.5);
  assert.equal(formatTimecode(0), '00:00.00');
  assert.equal(formatTimecode(240), '00:04.00');
  assert.equal(formatTimecode(2700), '00:45.00');
  assert.ok(CAPTION_PHRASES.every((p) => p.words.length > 0));
  assert.ok(SCENES.every((s) => s.durationFrames > 0));
});
