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

/**
 * Scene 6 (37.50s - 45.00s | 450 frames):
 * Standalone 2D Broadcast End-Card:
 * "سودان ديجيتال.. خيارك الأفضل"
 * + "بنفهم احتياج مشروعك ونشتغل معاك خطوة بخطوة لحدي ما تحول أفكارك لواقع"
 */
export const Scene6EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const logoIn = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: {damping: 14, stiffness: 150},
  });
  const titleIn = spring({
    frame: Math.max(0, frame - 48),
    fps,
    config: {damping: 16, stiffness: 165},
  });
  const taglineIn = spring({
    frame: Math.max(0, frame - 85),
    fps,
    config: {damping: 16, stiffness: 155},
  });
  const ctaIn = spring({
    frame: Math.max(0, frame - 128),
    fps,
    config: {damping: 15, stiffness: 170},
  });

  const ringRotate = interpolate(frame, [0, 450], [0, -45]);
  const ctaPulse = 1 + Math.sin(frame * 0.08) * 0.015;

  return (
    <AbsoluteFill>
      <BroadcastBackground accentIntensity={1.35} />

      {/* 2D Architectural Rays & Rings */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <svg
          width="960"
          height="960"
          viewBox="0 0 960 960"
          style={{
            transform: `rotate(${ringRotate}deg)`,
            opacity: 0.28,
          }}
        >
          <circle
            cx="480"
            cy="480"
            r="430"
            fill="none"
            stroke={BRAND_COLORS.primaryBright}
            strokeWidth="2"
            strokeDasharray="24 20"
          />
          <circle
            cx="480"
            cy="480"
            r="340"
            fill="none"
            stroke={BRAND_COLORS.secondaryLavender}
            strokeWidth="1.5"
            strokeDasharray="140 30"
          />
        </svg>
      </AbsoluteFill>

      <AbsoluteFill
        dir="rtl"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '120px 72px 260px',
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 36,
          }}
        >
          {/* Logo Hero Card */}
          <div
            style={{
              padding: '40px 56px',
              borderRadius: 38,
              backgroundColor: 'rgba(18, 13, 33, 0.88)',
              border: `2px solid rgba(167, 139, 250, 0.42)`,
              boxShadow: '0 32px 96px rgba(67, 24, 116, 0.6)',
              opacity: logoIn,
              transform: `scale(${interpolate(logoIn, [0, 1], [0.84, 1])})`,
            }}
          >
            <Img
              src={staticFile('assets/processed/logo-full-darkbg.png')}
              style={{
                width: 640,
                height: 300,
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Main Signature Headline */}
          <div
            style={{
              opacity: titleIn,
              transform: `translateY(${interpolate(titleIn, [0, 1], [30, 0])}px)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.24em',
                color: BRAND_COLORS.secondaryLavender,
              }}
            >
              YOUR DIGITAL PARTNER
            </span>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 66,
                fontWeight: 900,
                lineHeight: 1.25,
                color: BRAND_COLORS.inkWhite,
                margin: 0,
              }}
            >
              سودان ديجيتال
              <br />
              <span style={{color: BRAND_COLORS.secondaryLavender}}>
                خيارك الأفضل
              </span>
            </h2>
          </div>

          {/* Core Brand Promise from Brief */}
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: 34,
              fontWeight: 600,
              lineHeight: 1.55,
              color: 'rgba(248, 250, 252, 0.92)',
              maxWidth: 860,
              margin: 0,
              opacity: taglineIn,
              transform: `translateY(${interpolate(taglineIn, [0, 1], [24, 0])}px)`,
            }}
          >
            بنفهم احتياج مشروعك ونشتغل معاك خطوة بخطوة لحدي ما تحول أفكارك لواقع
          </p>

          {/* 3 Service Pillars Summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              fontFamily: FONT_BODY,
              fontSize: 26,
              fontWeight: 600,
              color: BRAND_COLORS.secondaryLavender,
              opacity: taglineIn,
            }}
          >
            <span>المحتوى</span>
            <span style={{opacity: 0.45}}>·</span>
            <span>التصميم</span>
            <span style={{opacity: 0.45}}>·</span>
            <span>إدارة الصفحات</span>
          </div>
        </div>
      </AbsoluteFill>

      {/* Bottom CTA Bar */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          bottom: 92,
          left: 84,
          right: 84,
          opacity: ctaIn,
          transform: `scale(${ctaPulse}) translateY(${interpolate(ctaIn, [0, 1], [32, 0])}px)`,
        }}
      >
        <div
          style={{
            background: `linear-gradient(90deg, ${BRAND_COLORS.primaryDeep}, ${BRAND_COLORS.primaryMid}, ${BRAND_COLORS.primaryBright})`,
            border: `2px solid ${BRAND_COLORS.secondaryLavender}`,
            borderRadius: 26,
            padding: '26px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 24px 60px rgba(109, 40, 217, 0.55)',
          }}
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 36,
              fontWeight: 900,
              color: BRAND_COLORS.inkWhite,
            }}
          >
            تواصل معنا وابدأ تطوير مشروعك
          </span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 28,
              fontWeight: 700,
              color: BRAND_COLORS.inkWhite,
            }}
          >
            ←
          </span>
        </div>
      </div>

      <LightSweep startFrame={24} durationFrames={42} opacity={0.34} />
      <LightSweep startFrame={160} durationFrames={46} opacity={0.28} />
      <LightSweep startFrame={300} durationFrames={46} opacity={0.25} />
    </AbsoluteFill>
  );
};
