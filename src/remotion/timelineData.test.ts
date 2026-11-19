import {describe, expect, test} from 'vitest';
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

describe('timeline', () => {
  test('timeline sums cleanly to exact 45s (2700 frames @ 60fps)', () => {
    expect(VIDEO_FPS).toBe(60);
    expect(VIDEO_DURATION_SECONDS).toBe(45);
    expect(TOTAL_FRAMES).toBe(2700);
    const validation = validateTimeline();
    expect(validation.valid, validation.errors.join('; ')).toBe(true);
  });

  test('getActiveScene maps boundary frames accurately', () => {
    expect(getActiveScene(0).id).toBe('intro');
    expect(getActiveScene(239).id).toBe('intro');
    expect(getActiveScene(240).id).toBe('dropoff');
    expect(getActiveScene(690).id).toBe('diagnosis');
    expect(getActiveScene(1170).id).toBe('solution');
    expect(getActiveScene(1740).id).toBe('experience');
    expect(getActiveScene(2250).id).toBe('endcard');
    expect(getActiveScene(2699).id).toBe('endcard');
  });

  test('getActiveCaptionPhrase matches voiceover segments cleanly', () => {
    expect(getActiveCaptionPhrase(1.5)).toBeNull();
    expect(getActiveCaptionPhrase(5.2)?.id).toBe('p1');
    expect(getActiveCaptionPhrase(12.4)?.id).toBe('p2a');
    expect(getActiveCaptionPhrase(16.0)?.id).toBe('p2b');
    expect(getActiveCaptionPhrase(22.6)?.id).toBe('p3');
    expect(getActiveCaptionPhrase(31.1)?.id).toBe('p4');
    expect(getActiveCaptionPhrase(39.8)?.id).toBe('p5');
    expect(getActiveCaptionPhrase(43.5)).toBeNull();
  });

  test('timecode and frame conversion utilities behave deterministically', () => {
    expect(frameToSeconds(150)).toBe(2.5);
    expect(formatTimecode(0)).toBe('00:00.00');
    expect(formatTimecode(240)).toBe('00:04.00');
    expect(formatTimecode(2700)).toBe('00:45.00');
    expect(CAPTION_PHRASES.every((p) => p.words.length > 0)).toBe(true);
    expect(SCENES.every((s) => s.durationFrames > 0)).toBe(true);
  });

  test('every caption word is inside its phrase and the 45s master', () => {
    for (const phrase of CAPTION_PHRASES) {
      expect(phrase.endSec).toBeLessThanOrEqual(VIDEO_DURATION_SECONDS);
      expect(phrase.startSec).toBeGreaterThanOrEqual(0);
      for (const word of phrase.words) {
        expect(word.startSec).toBeGreaterThanOrEqual(phrase.startSec - 0.05);
        expect(word.endSec).toBeLessThanOrEqual(phrase.endSec + 0.05);
        expect(word.endSec).toBeGreaterThan(word.startSec);
      }
    }
  });
});
