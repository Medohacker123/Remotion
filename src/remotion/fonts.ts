import {loadFont as loadAlexandria} from '@remotion/google-fonts/Alexandria';
import {loadFont as loadIbmPlexArabic} from '@remotion/google-fonts/IBMPlexSansArabic';

const alexandria = loadAlexandria('normal', {
  weights: ['600', '700', '800', '900'],
  subsets: ['arabic', 'latin'],
});

const ibmPlexArabic = loadIbmPlexArabic('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['arabic', 'latin'],
});

export const FONT_DISPLAY = alexandria.fontFamily;
export const FONT_BODY = ibmPlexArabic.fontFamily;
export const FONT_MONO = "'JetBrains Mono', monospace";
