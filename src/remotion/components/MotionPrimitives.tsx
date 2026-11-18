import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {FONT_BODY, FONT_DISPLAY, FONT_MONO} from '../fonts';
import {
  BRAND_COLORS,
  TOTAL_FRAMES,
  getActiveCaptionPhrase,
  getActiveScene,
} from '../timelineData';

export const BroadcastBackground: React.FC<{
  accentIntensity?: number;
}> = ({accentIntensity = 1}) => {
  const frame = useCurrentFrame();
  const driftX = Math.sin(frame * 0.014) * 60;
  const driftY = Math.cos(frame * 0.011) * 45;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND_COLORS.bgObsidian,
        overflow: 'hidden',
      }}
    >
      {/* Primary Royal Purple Aura */}
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          borderRadius: '50%',
          top: -220 + driftY,
          left: -140 + driftX,
          background:
            'radial-gradient(circle, rgba(109, 40, 217, 0.36) 0%, rgba(67, 24, 116, 0.14) 45%, transparent 72%)',
          opacity: accentIntensity,
        }}
      />
      {/* Secondary Deep Violet Lower Aura */}
      <div
        style={{
          position: 'absolute',
          width: 960,
          height: 960,
          borderRadius: '50%',
          bottom: -240 - driftY * 0.6,
          right: -180 - driftX * 0.7,
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.24) 0%, rgba(67, 24, 116, 0.1) 50%, transparent 75%)',
          opacity: accentIntensity,
        }}
      />
      {/* Subtle 2D Architectural Hairline Grid */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{position: 'absolute', inset: 0, opacity: 0.16}}
      >
        <defs>
          <pattern
            id="sd-grid"
            width="90"
            height="90"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 90 0 L 0 0 0 90"
              fill="none"
              stroke="rgba(196, 181, 253, 0.26)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#sd-grid)" />
      </svg>
    </AbsoluteFill>
  );
};

export const LightSweep: React.FC<{
  startFrame: number;
  durationFrames?: number;
  opacity?: number;
}> = ({startFrame, durationFrames = 42, opacity = 0.28}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [-0.4, 1.4],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  if (frame < startFrame || frame > startFrame + durationFrames) {
    return null;
  }

  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          top: -300,
          bottom: -300,
          width: 320,
          left: `${progress * 100}%`,
          transform: 'rotate(22deg)',
          background: `linear-gradient(90deg, transparent 0%, rgba(196, 181, 253, ${opacity}) 50%, transparent 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const GradedVideoClip: React.FC<{
  src: string;
  startFrom?: number;
  playbackRate?: number;
  zoomFrom?: number;
  zoomTo?: number;
  panX?: number;
  panY?: number;
  durationInFrames: number;
  overlayOpacity?: number;
}> = ({
  src,
  startFrom = 0,
  playbackRate = 1,
  zoomFrom = 1.08,
  zoomTo = 1.18,
  panX = 0,
  panY = 0,
  durationInFrames,
  overlayOpacity = 0.44,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tx = interpolate(frame, [0, durationInFrames], [0, panX], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ty = interpolate(frame, [0, durationInFrames], [0, panY], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: BRAND_COLORS.bgObsidian}}>
      <OffthreadVideo
        src={staticFile(src)}
        startFrom={startFrom}
        playbackRate={playbackRate}
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
          filter: 'contrast(1.08) saturate(0.84) brightness(0.86)',
        }}
      />
      {/* Brand Violet / Dark Contrast Scrim */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(8,7,13,0.72) 0%, rgba(67,24,116,${overlayOpacity * 0.45}) 45%, rgba(8,7,13,0.88) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const DiagonalShutterTransition: React.FC<{
  triggerFrame: number;
  durationFrames?: number;
}> = ({triggerFrame, durationFrames = 26}) => {
  const frame = useCurrentFrame();
  const rel = frame - (triggerFrame - Math.floor(durationFrames / 2));
  if (rel < 0 || rel > durationFrames) {
    return null;
  }

  const p = rel / durationFrames;
  // Sweep across from -110% to +110%
  const slideX = interpolate(p, [0, 0.48, 0.52, 1], [-125, -4, 4, 125], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden', zIndex: 40}}>
      <div
        style={{
          position: 'absolute',
          top: -220,
          bottom: -220,
          left: 0,
          right: 0,
          transform: `translateX(${slideX}%) skewX(-14deg)`,
          background: `linear-gradient(90deg, ${BRAND_COLORS.primaryDeep} 0%, ${BRAND_COLORS.primaryMid} 45%, ${BRAND_COLORS.bgObsidian} 100%)`,
          borderLeft: `10px solid ${BRAND_COLORS.secondaryLavender}`,
          borderRight: `10px solid ${BRAND_COLORS.primaryBright}`,
        }}
      />
    </AbsoluteFill>
  );
};

export const BrandCornerBug: React.FC = () => {
  const frame = useCurrentFrame();
  const activeScene = getActiveScene(frame);

  // Show smoothly after intro (frame 240) and hide cleanly before endcard (frame 2230)
  const opacity = interpolate(
    frame,
    [230, 260, 2220, 2255],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  if (opacity <= 0.01) {
    return null;
  }

  const totalProgress = frame / TOTAL_FRAMES;

  return (
    <div
      style={{
        position: 'absolute',
        top: 68,
        left: 56,
        right: 56,
        zIndex: 35,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Top Edge Broadcast Progress Hairline */}
      <div
        style={{
          width: '100%',
          height: 4,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${totalProgress * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${BRAND_COLORS.primaryMid}, ${BRAND_COLORS.secondaryLavender})`,
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          direction: 'rtl',
        }}
      >
        {/* Right side: Sudan Digital Monogram Lockup */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            backgroundColor: 'rgba(8, 7, 13, 0.72)',
            border: `1.5px solid ${BRAND_COLORS.borderSubtle}`,
            borderRadius: 18,
            padding: '10px 20px',
          }}
        >
          <Img
            src={staticFile('assets/processed/logo-mark-darkbg.png')}
            style={{width: 44, height: 48, objectFit: 'contain'}}
          />
          <div style={{display: 'flex', flexDirection: 'column', textAlign: 'right'}}>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 22,
                fontWeight: 800,
                color: BRAND_COLORS.inkWhite,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
              }}
            >
              سودان ديجيتال
            </span>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 13,
                fontWeight: 700,
                color: BRAND_COLORS.secondaryLavender,
                letterSpacing: '0.12em',
              }}
            >
              SUDAN DIGITAL
            </span>
          </div>
        </div>

        {/* Left side: Clean chapter label */}
        <div
          style={{
            backgroundColor: 'rgba(18, 13, 33, 0.78)',
            border: `1.5px solid ${BRAND_COLORS.borderSubtle}`,
            borderRadius: 16,
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 18,
              fontWeight: 700,
              color: BRAND_COLORS.secondaryLavender,
            }}
          >
            0{activeScene.index}
          </span>
          <span style={{color: 'rgba(255,255,255,0.3)', fontSize: 18}}>/</span>
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: 20,
              fontWeight: 600,
              color: BRAND_COLORS.inkWhite,
            }}
          >
            {activeScene.titleAr}
          </span>
        </div>
      </div>
    </div>
  );
};

export const KineticArabicCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const timeSec = frame / fps;
  const phrase = getActiveCaptionPhrase(timeSec);

  if (!phrase) {
    return null;
  }

  const phraseProgress = interpolate(
    timeSec,
    [phrase.startSec, phrase.endSec],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const enterOpacity = interpolate(
    timeSec,
    [phrase.startSec, phrase.startSec + 0.14, phrase.endSec - 0.12, phrase.endSec],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Slightly higher placement on endcard so it sits neatly above bottom CTA
  const bottomOffset = phrase.sceneId === 'endcard' ? 230 : 145;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: 64,
        right: 64,
        zIndex: 38,
        opacity: enterOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        dir="rtl"
        style={{
          backgroundColor: 'rgba(8, 7, 13, 0.86)',
          border: '2px solid rgba(139, 92, 246, 0.42)',
          borderRadius: 28,
          padding: '24px 36px 20px',
          boxShadow: '0 22px 60px rgba(0, 0, 0, 0.65)',
          width: '100%',
          maxWidth: 940,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px 14px',
            lineHeight: 1.45,
          }}
        >
          {phrase.words.map((word, idx) => {
            const isSpoken = timeSec >= word.startSec;
            const isCurrent =
              timeSec >= word.startSec && timeSec <= word.endSec + 0.08;
            const wordPop = spring({
              frame: Math.max(0, Math.round((timeSec - word.startSec) * fps)),
              fps,
              config: {damping: 14, stiffness: 260, mass: 0.6},
            });
            const scale = isCurrent ? 1 + 0.08 * wordPop : 1;

            let color = 'rgba(248, 250, 252, 0.42)';
            let textShadow = 'none';
            if (isCurrent) {
              color = word.highlight
                ? BRAND_COLORS.secondaryLavender
                : BRAND_COLORS.inkWhite;
              textShadow = '0 0 22px rgba(139, 92, 246, 0.78)';
            } else if (isSpoken) {
              color = word.highlight
                ? '#D8B4FE'
                : 'rgba(248, 250, 252, 0.94)';
            }

            return (
              <span
                key={`${phrase.id}-${idx}`}
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 44,
                  fontWeight: word.highlight ? 800 : 700,
                  color,
                  textShadow,
                  transform: `scale(${scale})`,
                  display: 'inline-block',
                  padding: isCurrent ? '2px 10px' : '2px 4px',
                  borderRadius: 12,
                  backgroundColor: isCurrent
                    ? 'rgba(109, 40, 217, 0.34)'
                    : 'transparent',
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>

        {/* Animated bottom progress bar */}
        <div
          style={{
            width: '100%',
            height: 5,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${phraseProgress * 100}%`,
              height: '100%',
              borderRadius: 999,
              background: `linear-gradient(90deg, ${BRAND_COLORS.primaryMid}, ${BRAND_COLORS.secondaryLavender})`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const LowerThirdBanner: React.FC<{
  stepNumber: string;
  titleAr: string;
  subtitleAr: string;
  enterFrame?: number;
}> = ({stepNumber, titleAr, subtitleAr, enterFrame = 8}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const spr = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: {damping: 16, stiffness: 180},
  });
  const translateX = interpolate(spr, [0, 1], [140, 0]);
  const opacity = interpolate(spr, [0, 1], [0, 1]);

  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        top: 210,
        right: 64,
        zIndex: 28,
        opacity,
        transform: `translateX(${translateX}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        backgroundColor: 'rgba(8, 7, 13, 0.86)',
        border: `2px solid ${BRAND_COLORS.primaryBright}`,
        borderRadius: 22,
        padding: '18px 28px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${BRAND_COLORS.primaryDeep}, ${BRAND_COLORS.primaryBright})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT_MONO,
          fontSize: 28,
          fontWeight: 700,
          color: BRAND_COLORS.inkWhite,
          flexShrink: 0,
        }}
      >
        {stepNumber}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 34,
            fontWeight: 800,
            color: BRAND_COLORS.inkWhite,
            lineHeight: 1.15,
          }}
        >
          {titleAr}
        </span>
        <span
          style={{
            fontFamily: FONT_BODY,
            fontSize: 23,
            fontWeight: 500,
            color: BRAND_COLORS.secondaryLavender,
          }}
        >
          {subtitleAr}
        </span>
      </div>
    </div>
  );
};
