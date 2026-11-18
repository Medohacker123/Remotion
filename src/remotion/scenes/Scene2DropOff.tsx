import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
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
 * Scene 2 (4.00s - 11.50s | 450 frames):
 * "الزبون دخل صفحتك، شاف المنتج، وسأل عن السعر، وبعدها اختفى."
 */
export const Scene2DropOff: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Sub-beat A (0..160): Browsing page & viewing product (02_competitor_browse)
  // Sub-beat B (160..300): Clock ticking + hourglass + Chat message "بكم السعر؟"
  // Sub-beat C (300..450): Pure 2D Drop-Off Funnel Motion Scene ("اختفى بعد السؤال")

  const chatBubbleIn = spring({
    frame: Math.max(0, frame - 165),
    fps,
    config: {damping: 15, stiffness: 200},
  });
  const replySeenIn = spring({
    frame: Math.max(0, frame - 215),
    fps,
    config: {damping: 15, stiffness: 180},
  });

  // Drop-off bars animation in sub-beat C (300..450)
  const cFrame = Math.max(0, frame - 300);
  const cSpring = spring({
    frame: cFrame,
    fps,
    config: {damping: 15, stiffness: 165},
  });

  const visitorsBar = interpolate(cFrame, [15, 55], [0, 92], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const askedBar = interpolate(cFrame, [30, 75], [0, 38], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const boughtBar = interpolate(cFrame, [45, 90], [0, 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <BroadcastBackground />

      {/* 0..160: Competitor/Product Page Browsing Clip */}
      <Sequence from={0} durationInFrames={160}>
        <GradedVideoClip
          src="assets/aistudio/02_competitor_browse_25f450a5.mp4"
          startFrom={25}
          zoomFrom={1.08}
          zoomTo={1.2}
          panX={-24}
          durationInFrames={160}
          overlayOpacity={0.46}
        />
        {/* 2D Scanner Reticle Frame over center */}
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 820,
              height: 520,
              borderRadius: 32,
              border: `2px solid rgba(196, 181, 253, 0.52)`,
              backgroundColor: 'rgba(8, 7, 13, 0.22)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 32,
            }}
          >
            <div
              dir="rtl"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 28,
                  fontWeight: 700,
                  color: BRAND_COLORS.inkWhite,
                  backgroundColor: 'rgba(109, 40, 217, 0.85)',
                  padding: '8px 22px',
                  borderRadius: 14,
                }}
              >
                زائر جديد في صفحتك
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 22,
                  color: BRAND_COLORS.secondaryLavender,
                }}
              >
                01 / BROWSE
              </span>
            </div>

            <div
              dir="rtl"
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(8, 7, 13, 0.82)',
                border: `1.5px solid ${BRAND_COLORS.borderSubtle}`,
                borderRadius: 18,
                padding: '14px 24px',
              }}
            >
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 26,
                  fontWeight: 600,
                  color: BRAND_COLORS.inkWhite,
                }}
              >
                يتصفح الصور والمنشورات… ويبحث عن سبب للشراء
              </span>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* 160..230: Clock ticking (hesitation / waiting) */}
      <Sequence from={160} durationInFrames={70}>
        <GradedVideoClip
          src="assets/aistudio/06_clock_ticking_ba4c8ffa.mp4"
          startFrom={15}
          playbackRate={1.25}
          zoomFrom={1.12}
          zoomTo={1.26}
          durationInFrames={70}
          overlayOpacity={0.55}
        />
      </Sequence>

      {/* 230..300: Hourglass time slipping */}
      <Sequence from={230} durationInFrames={70}>
        <GradedVideoClip
          src="assets/aistudio/10_hourglass_time_76fb56b9.mp4"
          startFrom={40}
          playbackRate={1.3}
          zoomFrom={1.1}
          zoomTo={1.22}
          durationInFrames={70}
          overlayOpacity={0.55}
        />
      </Sequence>

      {/* 160..300: Floating 2D DM Chat Overlay ("كم السعر؟" -> "تمت المشاهدة") */}
      {frame >= 160 && frame < 300 && (
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
              width: '100%',
              maxWidth: 860,
              backgroundColor: 'rgba(14, 10, 26, 0.92)',
              border: `2px solid ${BRAND_COLORS.primaryBright}`,
              borderRadius: 32,
              padding: 36,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.72)',
              transform: `scale(${interpolate(chatBubbleIn, [0, 1], [0.88, 1])})`,
              opacity: chatBubbleIn,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 28,
                  fontWeight: 700,
                  color: BRAND_COLORS.inkWhite,
                }}
              >
                رسائل الصفحة المباشرة
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 20,
                  color: BRAND_COLORS.secondaryLavender,
                }}
              >
                INBOX
              </span>
            </div>

            {/* Customer bubble */}
            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: BRAND_COLORS.primaryMid,
                borderRadius: '24px 24px 6px 24px',
                padding: '22px 32px',
              }}
            >
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 40,
                  fontWeight: 800,
                  color: BRAND_COLORS.inkWhite,
                }}
              >
                لو سمحت.. بكم السعر؟
              </span>
            </div>

            {/* Price reply + ghosted status */}
            <div
              style={{
                alignSelf: 'flex-end',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1.5px solid rgba(255,255,255,0.16)',
                borderRadius: '24px 24px 24px 6px',
                padding: '20px 30px',
                opacity: replySeenIn,
                transform: `translateY(${interpolate(replySeenIn, [0, 1], [18, 0])}px)`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 32,
                  fontWeight: 600,
                  color: BRAND_COLORS.inkWhite,
                }}
              >
                السعر كذا وكذا...
              </span>
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 22,
                  color: BRAND_COLORS.alertCoral,
                  fontWeight: 700,
                }}
              >
                تمت المشاهدة · لم يعد هناك رد!
              </span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* 300..450: Pure 2D Broadcast Funnel Drop-Off Scene */}
      {frame >= 300 && (
        <AbsoluteFill
          dir="rtl"
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 72px',
          }}
        >
          <div
            style={{
              width: '100%',
              backgroundColor: 'rgba(18, 13, 33, 0.94)',
              border: `2px solid rgba(244, 63, 94, 0.5)`,
              borderRadius: 36,
              padding: '44px 42px',
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
              opacity: cSpring,
              transform: `translateY(${interpolate(cSpring, [0, 1], [48, 0])}px)`,
              boxShadow: '0 32px 90px rgba(0, 0, 0, 0.72)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 44,
                  fontWeight: 900,
                  color: BRAND_COLORS.inkWhite,
                  margin: 0,
                }}
              >
                نتيجة التجربة الحالية
              </h2>
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 24,
                  fontWeight: 700,
                  color: BRAND_COLORS.alertCoral,
                  backgroundColor: 'rgba(244, 63, 94, 0.14)',
                  border: `1.5px solid rgba(244, 63, 94, 0.45)`,
                  padding: '8px 18px',
                  borderRadius: 12,
                }}
              >
                تسرب العملاء
              </span>
            </div>

            {/* Funnel Metrics Bars */}
            {[
              {
                label: 'مشاهدة المنشور والمنتج',
                pct: visitorsBar,
                color: BRAND_COLORS.secondaryLavender,
              },
              {
                label: 'السؤال عن السعر في الخاص',
                pct: askedBar,
                color: BRAND_COLORS.accentAmber,
              },
              {
                label: 'إتمام الشراء الفعلي',
                pct: boughtBar,
                color: BRAND_COLORS.alertCoral,
              },
            ].map((row, i) => (
              <div
                key={i}
                style={{display: 'flex', flexDirection: 'column', gap: 12}}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: 30,
                      fontWeight: 600,
                      color: BRAND_COLORS.inkWhite,
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 32,
                      fontWeight: 700,
                      color: row.color,
                    }}
                  >
                    {Math.round(row.pct)}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 22,
                    borderRadius: 999,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${row.pct}%`,
                      height: '100%',
                      borderRadius: 999,
                      backgroundColor: row.color,
                    }}
                  />
                </div>
              </div>
            ))}

            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.12)',
                paddingTop: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 32,
                  fontWeight: 800,
                  color: BRAND_COLORS.alertCoral,
                }}
              >
                العميل يسأل… ثم يختفي قبل الشراء
              </span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      <LowerThirdBanner
        stepNumber="01"
        titleAr="بداية المشكلة"
        subtitleAr="زيارات واستفسارات بدون إغلاق بيعي"
        enterFrame={10}
      />
      <LightSweep startFrame={305} durationFrames={36} opacity={0.26} />
    </AbsoluteFill>
  );
};
