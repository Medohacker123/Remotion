import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {FONT_BODY, FONT_DISPLAY, FONT_MONO} from '../fonts';
import {BRAND_COLORS} from '../timelineData';
import {BroadcastBackground, LightSweep} from '../components/MotionPrimitives';

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Phase A (0..115): Geometric SD Logo Reveal
  const lineGrow = spring({
    frame,
    fps,
    config: {damping: 16, stiffness: 160},
  });
  const logoReveal = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: {damping: 14, stiffness: 150},
  });
  const logoExit = interpolate(frame, [105, 130], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const logoScaleOut = interpolate(frame, [105, 130], [1, 0.9], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase B (120..240): Opening Hook Title Card
  const hookSpring = spring({
    frame: Math.max(0, frame - 122),
    fps,
    config: {damping: 15, stiffness: 170},
  });
  const subSpring = spring({
    frame: Math.max(0, frame - 146),
    fps,
    config: {damping: 18, stiffness: 150},
  });

  const ringRotate = interpolate(frame, [0, 240], [0, 90]);
  const accentBarWidth = interpolate(
    frame,
    [136, 178],
    [0, 320],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill>
      <BroadcastBackground accentIntensity={1.2} />

      {/* Geometric Rotating 2D Broadcast Rings */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <svg
          width="820"
          height="820"
          viewBox="0 0 820 820"
          style={{
            transform: `rotate(${ringRotate}deg) scale(${interpolate(lineGrow, [0, 1], [0.7, 1])})`,
            opacity: interpolate(frame, [0, 20, 220, 240], [0, 0.45, 0.45, 0.15]),
          }}
        >
          <circle
            cx="410"
            cy="410"
            r="360"
            fill="none"
            stroke={BRAND_COLORS.primaryBright}
            strokeWidth="2"
            strokeDasharray="18 24"
          />
          <circle
            cx="410"
            cy="410"
            r="285"
            fill="none"
            stroke={BRAND_COLORS.secondaryLavender}
            strokeWidth="1.5"
            strokeDasharray="120 40"
            opacity="0.5"
          />
        </svg>
      </AbsoluteFill>

      {/* Phase A: Sudan Digital Logo Intro Bumper */}
      {frame < 135 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: logoExit,
            transform: `scale(${logoScaleOut})`,
          }}
        >
          {/* Central vertical laser line */}
          <div
            style={{
              width: 4,
              height: interpolate(lineGrow, [0, 1], [0, 520]),
              background: `linear-gradient(180deg, transparent, ${BRAND_COLORS.secondaryLavender}, ${BRAND_COLORS.primaryBright}, transparent)`,
              position: 'absolute',
              opacity: interpolate(frame, [0, 25, 65, 90], [0, 0.9, 0.4, 0], {
                extrapolateRight: 'clamp',
              }),
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 36,
              transform: `scale(${interpolate(logoReveal, [0, 1], [0.78, 1])}) translateY(${interpolate(logoReveal, [0, 1], [40, 0])}px)`,
              opacity: logoReveal,
            }}
          >
            <div
              style={{
                padding: '38px 54px',
                borderRadius: 36,
                backgroundColor: 'rgba(18, 13, 33, 0.78)',
                border: `2px solid rgba(167, 139, 250, 0.35)`,
                boxShadow: '0 30px 90px rgba(67, 24, 116, 0.55)',
              }}
            >
              <Img
                src={staticFile('assets/processed/logo-full-darkbg.png')}
                style={{
                  width: 680,
                  height: 320,
                  objectFit: 'contain',
                }}
              />
            </div>

            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.26em',
                color: BRAND_COLORS.secondaryLavender,
                opacity: interpolate(frame, [35, 58], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              DIGITAL GROWTH STUDIO
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Phase B: Opening Kinetic Arabic Hook */}
      {frame >= 115 && (
        <AbsoluteFill
          dir="rtl"
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 84px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 28,
              opacity: hookSpring,
              transform: `translateY(${interpolate(hookSpring, [0, 1], [56, 0])}px) scale(${interpolate(hookSpring, [0, 1], [0.94, 1])})`,
            }}
          >
            {/* Brand small monogram badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 26px',
                borderRadius: 16,
                backgroundColor: 'rgba(109, 40, 217, 0.22)',
                border: `1.5px solid ${BRAND_COLORS.primaryBright}`,
              }}
            >
              <Img
                src={staticFile('assets/processed/logo-mark-darkbg.png')}
                style={{width: 38, height: 42, objectFit: 'contain'}}
              />
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 26,
                  fontWeight: 700,
                  color: BRAND_COLORS.secondaryLavender,
                }}
              >
                لماذا تتوقف المبيعات في صفحتك؟
              </span>
            </div>

            <h1
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 82,
                fontWeight: 900,
                lineHeight: 1.25,
                color: BRAND_COLORS.inkWhite,
                margin: 0,
                textShadow: '0 12px 44px rgba(0,0,0,0.6)',
              }}
            >
              تفاعل عالي…
              <br />
              <span style={{color: BRAND_COLORS.secondaryLavender}}>
                بس وين المبيعات؟
              </span>
            </h1>

            {/* Animated underline accent */}
            <div
              style={{
                width: accentBarWidth,
                height: 7,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${BRAND_COLORS.primaryMid}, ${BRAND_COLORS.secondaryLavender})`,
              }}
            />

            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: 34,
                fontWeight: 500,
                color: 'rgba(248, 250, 252, 0.82)',
                margin: 0,
                opacity: subSpring,
                transform: `translateY(${interpolate(subSpring, [0, 1], [20, 0])}px)`,
              }}
            >
              خلينا نتابع رحلة الزبون خطوة بخطوة
            </p>
          </div>
        </AbsoluteFill>
      )}

      <LightSweep startFrame={22} durationFrames={38} opacity={0.34} />
      <LightSweep startFrame={134} durationFrames={40} opacity={0.28} />
    </AbsoluteFill>
  );
};
