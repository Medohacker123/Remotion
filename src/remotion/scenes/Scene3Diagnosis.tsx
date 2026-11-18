import React from 'react';
import {
  AbsoluteFill,
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
 * Scene 3 (11.50s - 19.50s | 480 frames):
 * "المشكلة ما شرط تكون في السعر أو المنتج، ممكن تكون صفحتك ما ادتو سبب كافي يشتري منك."
 */
export const Scene3Diagnosis: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Phase A (0..180): Split comparison ("السعر ✓ · المنتج ✓" vs "تجربة الصفحة ✕")
  // Phase B (180..360): Pure 2D Mobile Page Audit Scanner ("لماذا لم يشترِ العميل؟")
  // Phase C (360..480): 3 Missing Reasons Reveal ("وضوح القيمة · ثقة العميل · سهولة القرار")

  const cardA = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: {damping: 16, stiffness: 175},
  });
  const cardB = spring({
    frame: Math.max(0, frame - 42),
    fps,
    config: {damping: 16, stiffness: 175},
  });

  const auditIn = spring({
    frame: Math.max(0, frame - 182),
    fps,
    config: {damping: 16, stiffness: 175},
  });
  const scanY = interpolate(frame, [195, 345], [0, 540], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pillarsIn = spring({
    frame: Math.max(0, frame - 362),
    fps,
    config: {damping: 16, stiffness: 175},
  });

  return (
    <AbsoluteFill>
      <BroadcastBackground accentIntensity={1.1} />

      {/* Subtle atmospheric background footage in Phase A */}
      {frame < 185 && (
        <AbsoluteFill style={{opacity: 0.34}}>
          <GradedVideoClip
            src="assets/aistudio/03_write_idea_091f514a.mp4"
            startFrom={30}
            zoomFrom={1.06}
            zoomTo={1.16}
            durationInFrames={185}
            overlayOpacity={0.62}
          />
        </AbsoluteFill>
      )}

      {/* Phase A (0..180): Price & Product vs Page Experience */}
      {frame < 185 && (
        <AbsoluteFill
          dir="rtl"
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 72px',
            gap: 28,
          }}
        >
          {/* Card 1: Price & Product are NOT the problem */}
          <div
            style={{
              width: '100%',
              backgroundColor: 'rgba(18, 13, 33, 0.92)',
              border: `2px solid rgba(16, 185, 129, 0.48)`,
              borderRadius: 30,
              padding: '32px 36px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: cardA,
              transform: `translateY(${interpolate(cardA, [0, 1], [40, 0])}px)`,
            }}
          >
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 40,
                  fontWeight: 800,
                  color: BRAND_COLORS.inkWhite,
                }}
              >
                السعر مناسب والمنتج ممتاز
              </span>
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 26,
                  color: 'rgba(248, 250, 252, 0.76)',
                }}
              >
                ليست هذه هي العقبة الأساسية أمام الزبون
              </span>
            </div>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: 'rgba(16, 185, 129, 0.16)',
                border: `2px solid ${BRAND_COLORS.successEmerald}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_MONO,
                fontSize: 38,
                fontWeight: 700,
                color: BRAND_COLORS.successEmerald,
                flexShrink: 0,
              }}
            >
              ✓
            </div>
          </div>

          {/* Card 2: The REAL gap */}
          <div
            style={{
              width: '100%',
              backgroundColor: 'rgba(28, 14, 46, 0.95)',
              border: `2.5px solid ${BRAND_COLORS.primaryBright}`,
              borderRadius: 32,
              padding: '38px 36px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: cardB,
              transform: `translateY(${interpolate(cardB, [0, 1], [44, 0])}px)`,
              boxShadow: '0 24px 70px rgba(67, 24, 116, 0.5)',
            }}
          >
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 42,
                  fontWeight: 900,
                  color: BRAND_COLORS.secondaryLavender,
                }}
              >
                صفحتك ما أعطته سبب كافي للشراء
              </span>
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 27,
                  color: BRAND_COLORS.inkWhite,
                }}
              >
                غياب الإقناع البصري والثقة في العرض الرقمي
              </span>
            </div>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: 'rgba(244, 63, 94, 0.18)',
                border: `2px solid ${BRAND_COLORS.alertCoral}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_MONO,
                fontSize: 36,
                fontWeight: 700,
                color: BRAND_COLORS.alertCoral,
                flexShrink: 0,
              }}
            >
              !
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Phase B (180..360): Pure 2D Mobile Page Audit Wireframe & Scanner */}
      {frame >= 180 && frame < 360 && (
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
              width: 820,
              backgroundColor: 'rgba(14, 10, 26, 0.95)',
              border: `2px solid ${BRAND_COLORS.borderSubtle}`,
              borderRadius: 42,
              padding: 40,
              position: 'relative',
              overflow: 'hidden',
              opacity: auditIn,
              transform: `scale(${interpolate(auditIn, [0, 1], [0.92, 1])})`,
              boxShadow: '0 32px 96px rgba(0,0,0,0.75)',
            }}
          >
            {/* Moving Diagnostic Laser Glow (behind text rows for crisp readability) */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 90 + scanY,
                height: 60,
                background: `linear-gradient(180deg, transparent, rgba(167, 139, 250, 0.22), transparent)`,
                borderTop: `2px solid rgba(196, 181, 253, 0.55)`,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            <div
              style={{
                position: 'relative',
                zIndex: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 34,
                  fontWeight: 800,
                  color: BRAND_COLORS.inkWhite,
                }}
              >
                فحص تجربة الصفحة الحالية
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 20,
                  color: BRAND_COLORS.alertCoral,
                }}
              >
                AUDIT REPORT
              </span>
            </div>

            {/* 3 Audit Defect Rows */}
            <div style={{position: 'relative', zIndex: 4, display: 'flex', flexDirection: 'column', gap: 22}}>
              {[
                {
                  frameStart: 205,
                  title: 'تصميم عشوائي بدون هوية موحدة',
                  detail: 'لا يبني انطباع احترافي من النظرة الأولى',
                },
                {
                  frameStart: 245,
                  title: 'محتوى يركز على الشكل لا الفائدة',
                  detail: 'الزبون لا يفهم لماذا يختارك دون منافسك',
                },
                {
                  frameStart: 285,
                  title: 'تشتت في خطوات التواصل والطلب',
                  detail: 'كثرة الأسئلة ترفع احتمالية التراجع والانسحاب',
                },
              ].map((item, idx) => {
                const s = spring({
                  frame: Math.max(0, frame - item.frameStart),
                  fps,
                  config: {damping: 16, stiffness: 180},
                });
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1.5px solid rgba(244, 63, 94, 0.42)',
                      borderRadius: 22,
                      padding: '22px 26px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 20,
                      opacity: s,
                      transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: 'rgba(244, 63, 94, 0.18)',
                        color: BRAND_COLORS.alertCoral,
                        fontFamily: FONT_MONO,
                        fontSize: 24,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                      <span
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 28,
                          fontWeight: 700,
                          color: BRAND_COLORS.inkWhite,
                        }}
                      >
                        {item.title}
                      </span>
                      <span
                        style={{
                          fontFamily: FONT_BODY,
                          fontSize: 22,
                          color: 'rgba(248,250,252,0.72)',
                        }}
                      >
                        {item.detail}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Phase C (360..480): What the customer actually needs */}
      {frame >= 360 && (
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
              display: 'flex',
              flexDirection: 'column',
              gap: 26,
              opacity: pillarsIn,
              transform: `translateY(${interpolate(pillarsIn, [0, 1], [36, 0])}px)`,
            }}
          >
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 48,
                fontWeight: 900,
                color: BRAND_COLORS.inkWhite,
                textAlign: 'center',
                margin: '0 0 12px',
              }}
            >
              ما الذي يحتاجه الزبون{' '}
              <span style={{color: BRAND_COLORS.secondaryLavender}}>
                ليشتري فوراً؟
              </span>
            </h2>

            {[
              {num: '01', text: 'وضوح القيمة والميزة التنافسية'},
              {num: '02', text: 'ثقة بصرية تعكس احترافية مشروعك'},
              {num: '03', text: 'تجربة سريعة تقوده مباشرة للطلب'},
            ].map((p, idx) => {
              const pSpr = spring({
                frame: Math.max(0, frame - (370 + idx * 14)),
                fps,
                config: {damping: 15, stiffness: 190},
              });
              return (
                <div
                  key={p.num}
                  style={{
                    backgroundColor: 'rgba(26, 19, 48, 0.94)',
                    border: `2px solid ${BRAND_COLORS.primaryBright}`,
                    borderRadius: 26,
                    padding: '26px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 22,
                    opacity: pSpr,
                    transform: `scale(${interpolate(pSpr, [0, 1], [0.92, 1])})`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 30,
                      fontWeight: 700,
                      color: BRAND_COLORS.secondaryLavender,
                      backgroundColor: 'rgba(109, 40, 217, 0.35)',
                      padding: '10px 18px',
                      borderRadius: 14,
                    }}
                  >
                    {p.num}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 34,
                      fontWeight: 800,
                      color: BRAND_COLORS.inkWhite,
                    }}
                  >
                    {p.text}
                  </span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      <LowerThirdBanner
        stepNumber="02"
        titleAr="تشخيص التجربة"
        subtitleAr="ليست مشكلة سعر.. بل وضوح وإقناع"
        enterFrame={8}
      />
      <LightSweep startFrame={185} durationFrames={35} opacity={0.28} />
    </AbsoluteFill>
  );
};
