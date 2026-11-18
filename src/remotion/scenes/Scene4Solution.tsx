import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {FONT_BODY, FONT_DISPLAY, FONT_MONO} from '../fonts';
import {BRAND_COLORS} from '../timelineData';
import {
  BroadcastBackground,
  GradedVideoClip,
  LightSweep,
  LowerThirdBanner,
} from '../components/MotionPrimitives';

/**
 * Scene 4 (19.50s - 29.00s | 570 frames):
 * "عشان كدة، نحن في سودان ديجيتال، بنشتغل على المحتوى والتصميم وإدارة الصفحات مع بعض"
 */
export const Scene4Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const synergyIn = spring({
    frame: Math.max(0, frame - 425),
    fps,
    config: {damping: 15, stiffness: 165},
  });

  const lineDraw = interpolate(frame, [440, 505], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <BroadcastBackground accentIntensity={1.15} />

      {/* 0..150: Content Strategy (11_team_sticky_notes) */}
      <Sequence from={0} durationInFrames={150}>
        <GradedVideoClip
          src="assets/aistudio/11_team_sticky_notes_30a1b442.mp4"
          startFrom={60}
          playbackRate={1.25}
          zoomFrom={1.06}
          zoomTo={1.18}
          panX={18}
          durationInFrames={150}
          overlayOpacity={0.45}
        />
        <PillarSpotlight
          index="01"
          titleAr="المحتوى التسويقي"
          descAr="رسائل واضحة تجيب عن كل أسئلة العميل وتدفعه للشراء"
        />
      </Sequence>

      {/* 150..225: Design Layout Jump Cut 1 (13_design_layout) */}
      <Sequence from={150} durationInFrames={75}>
        <GradedVideoClip
          src="assets/aistudio/13_design_layout_66c45f85.mp4"
          startFrom={40}
          playbackRate={1.3}
          zoomFrom={1.1}
          zoomTo={1.22}
          durationInFrames={75}
          overlayOpacity={0.48}
        />
        <DesignSwatchOverlay />
        <PillarSpotlight
          index="02"
          titleAr="التصميم والهوية"
          descAr="مظهر بصري متناسق يرفع قيمة مشروعك من النظرة الأولى"
        />
      </Sequence>

      {/* 225..295: Design Monitor Jump Cut 2 (15_website_monitor) */}
      <Sequence from={225} durationInFrames={70}>
        <GradedVideoClip
          src="assets/aistudio/15_website_monitor_f71a509e.mp4"
          startFrom={460}
          playbackRate={1.35}
          zoomFrom={1.12}
          zoomTo={1.24}
          panX={-16}
          durationInFrames={70}
          overlayOpacity={0.46}
        />
        <DesignSwatchOverlay />
        <PillarSpotlight
          index="02"
          titleAr="التصميم والهوية"
          descAr="واجهات ومنشورات مصممة لتحقيق أعلى ثقة وتفاعل"
        />
      </Sequence>

      {/* 295..420: Page Management (12_team_whiteboard) */}
      <Sequence from={295} durationInFrames={125}>
        <GradedVideoClip
          src="assets/aistudio/12_team_whiteboard_9e1fc0fb.mp4"
          startFrom={15}
          playbackRate={1.25}
          zoomFrom={1.08}
          zoomTo={1.18}
          durationInFrames={125}
          overlayOpacity={0.48}
        />
        <PillarSpotlight
          index="03"
          titleAr="إدارة الصفحات"
          descAr="نشر منظم ومتابعة مستمرة تحول المتابعين إلى عملاء"
        />
      </Sequence>

      {/* 420..570: Pure 2D 3-Pillar Integrated Ecosystem Diagram */}
      {frame >= 420 && (
        <AbsoluteFill
          dir="rtl"
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 64px',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 52,
              opacity: synergyIn,
              transform: `scale(${interpolate(synergyIn, [0, 1], [0.92, 1])})`,
            }}
          >
            <div style={{textAlign: 'center'}}>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 22,
                  fontWeight: 700,
                  color: BRAND_COLORS.secondaryLavender,
                  letterSpacing: '0.18em',
                }}
              >
                INTEGRATED 360° SYSTEM
              </span>
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 50,
                  fontWeight: 900,
                  color: BRAND_COLORS.inkWhite,
                  margin: '12px 0 0',
                }}
              >
                ثلاث ركائز تعمل{' '}
                <span style={{color: BRAND_COLORS.secondaryLavender}}>
                  معاً بتكامل تام
                </span>
              </h2>
            </div>

            {/* Central SD Monogram + 3 Connected Pillars */}
            <div
              style={{
                position: 'relative',
                width: 860,
                height: 620,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* Connecting SVG Energy Lines */}
              <svg
                width="860"
                height="620"
                viewBox="0 0 860 620"
                style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
              >
                <line
                  x1="430"
                  y1="300"
                  x2="430"
                  y2="70"
                  stroke={BRAND_COLORS.primaryBright}
                  strokeWidth="4"
                  strokeDasharray="240"
                  strokeDashoffset={240 * (1 - lineDraw)}
                />
                <line
                  x1="430"
                  y1="300"
                  x2="205"
                  y2="560"
                  stroke={BRAND_COLORS.secondaryLavender}
                  strokeWidth="4"
                  strokeDasharray="360"
                  strokeDashoffset={360 * (1 - lineDraw)}
                />
                <line
                  x1="430"
                  y1="300"
                  x2="655"
                  y2="560"
                  stroke={BRAND_COLORS.secondaryLavender}
                  strokeWidth="4"
                  strokeDasharray="360"
                  strokeDashoffset={360 * (1 - lineDraw)}
                />
                <circle
                  cx="430"
                  cy="300"
                  r="116"
                  fill="rgba(26, 19, 48, 0.96)"
                  stroke={BRAND_COLORS.primaryBright}
                  strokeWidth="4"
                />
              </svg>

              {/* Top Pillar: Content */}
              <SynergyNode
                num="01"
                label="المحتوى"
                delay={432}
                fps={fps}
                frame={frame}
              />

              {/* Center SD Monogram */}
              <div
                style={{
                  position: 'absolute',
                  top: 215,
                  left: 345,
                  width: 170,
                  height: 170,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 5,
                }}
              >
                <Img
                  src={staticFile('assets/processed/logo-mark-darkbg.png')}
                  style={{width: 118, height: 128, objectFit: 'contain'}}
                />
              </div>

              {/* Bottom 2 Pillars: Design & Page Management */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0 24px',
                }}
              >
                <SynergyNode
                  num="02"
                  label="التصميم"
                  delay={448}
                  fps={fps}
                  frame={frame}
                />
                <SynergyNode
                  num="03"
                  label="إدارة الصفحات"
                  delay={464}
                  fps={fps}
                  frame={frame}
                />
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      <LowerThirdBanner
        stepNumber="03"
        titleAr="منهجية سودان ديجيتال"
        subtitleAr="تكامل المحتوى والتصميم وإدارة الصفحات"
        enterFrame={8}
      />
      <LightSweep startFrame={155} durationFrames={32} opacity={0.25} />
      <LightSweep startFrame={425} durationFrames={42} opacity={0.32} />
    </AbsoluteFill>
  );
};

const PillarSpotlight: React.FC<{
  index: string;
  titleAr: string;
  descAr: string;
}> = ({index, titleAr, descAr}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const spr = spring({frame, fps, config: {damping: 15, stiffness: 190}});

  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        top: 640,
        left: 64,
        right: 64,
        backgroundColor: 'rgba(14, 10, 26, 0.88)',
        border: `2px solid ${BRAND_COLORS.primaryBright}`,
        borderRadius: 30,
        padding: '32px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity: spr,
        transform: `translateY(${interpolate(spr, [0, 1], [36, 0])}px)`,
        boxShadow: '0 24px 70px rgba(0,0,0,0.68)',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 28,
            fontWeight: 700,
            color: BRAND_COLORS.inkWhite,
            backgroundColor: BRAND_COLORS.primaryMid,
            padding: '8px 18px',
            borderRadius: 14,
          }}
        >
          {index}
        </span>
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 42,
            fontWeight: 900,
            color: BRAND_COLORS.inkWhite,
          }}
        >
          {titleAr}
        </span>
      </div>
      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: 28,
          fontWeight: 500,
          color: BRAND_COLORS.secondaryLavender,
          margin: 0,
        }}
      >
        {descAr}
      </p>
    </div>
  );
};

const DesignSwatchOverlay: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 430,
        left: 64,
        display: 'flex',
        gap: 12,
        backgroundColor: 'rgba(8, 7, 13, 0.84)',
        border: `1.5px solid ${BRAND_COLORS.borderSubtle}`,
        borderRadius: 18,
        padding: '12px 18px',
      }}
    >
      {[
        BRAND_COLORS.primaryDeep,
        BRAND_COLORS.primaryBright,
        BRAND_COLORS.secondaryLavender,
        BRAND_COLORS.inkWhite,
      ].map((hex) => (
        <div
          key={hex}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: hex,
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        />
      ))}
    </div>
  );
};

const SynergyNode: React.FC<{
  num: string;
  label: string;
  delay: number;
  fps: number;
  frame: number;
}> = ({num, label, delay, fps, frame}) => {
  const spr = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: {damping: 14, stiffness: 200},
  });
  return (
    <div
      style={{
        backgroundColor: 'rgba(26, 19, 48, 0.96)',
        border: `2px solid ${BRAND_COLORS.primaryBright}`,
        borderRadius: 24,
        padding: '22px 34px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        zIndex: 4,
        opacity: spr,
        transform: `scale(${interpolate(spr, [0, 1], [0.84, 1])})`,
        boxShadow: '0 18px 46px rgba(67, 24, 116, 0.45)',
      }}
    >
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 24,
          fontWeight: 700,
          color: BRAND_COLORS.secondaryLavender,
        }}
      >
        {num}
      </span>
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 34,
          fontWeight: 800,
          color: BRAND_COLORS.inkWhite,
        }}
      >
        {label}
      </span>
    </div>
  );
};
