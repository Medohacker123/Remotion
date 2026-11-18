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
 * Scene 5 (29.00s - 37.50s | 510 frames):
 * "وعشان نخلي تجربة العميل أوضح وأسهل، من أول زيارة لحد الطلب."
 */
export const Scene5Experience: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Phase A (0..255): Ordered Website Showcase + 4-step Customer Journey Line
  // Phase B (255..510): Conversion Impact Counters + "تم الطلب بنجاح ✓" 2D Card
  const journeyLine = interpolate(frame, [20, 210], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bFrame = Math.max(0, frame - 255);
  const bSpring = spring({
    frame: bFrame,
    fps,
    config: {damping: 15, stiffness: 170},
  });
  const kpiClarity = Math.round(
    interpolate(bFrame, [15, 75], [0, 340], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const kpiTrust = Math.round(
    interpolate(bFrame, [25, 85], [0, 100], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  const confirmSpr = spring({
    frame: Math.max(0, bFrame - 95),
    fps,
    config: {damping: 13, stiffness: 190},
  });

  return (
    <AbsoluteFill>
      <BroadcastBackground accentIntensity={1.2} />

      {/* Phase A (0..255): Organized Digital Presence + 4-step Path */}
      {frame < 255 && (
        <>
          <Sequence from={0} durationInFrames={130}>
            <GradedVideoClip
              src="assets/aistudio/15_website_monitor_f71a509e.mp4"
              startFrom={850}
              playbackRate={1.2}
              zoomFrom={1.06}
              zoomTo={1.15}
              durationInFrames={130}
              overlayOpacity={0.5}
            />
          </Sequence>
          <Sequence from={130} durationInFrames={125}>
            <GradedVideoClip
              src="assets/aistudio/02_competitor_browse_25f450a5.mp4"
              startFrom={110}
              playbackRate={1.2}
              zoomFrom={1.08}
              zoomTo={1.18}
              durationInFrames={125}
              overlayOpacity={0.5}
            />
          </Sequence>

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
                backgroundColor: 'rgba(14, 10, 26, 0.92)',
                border: `2px solid ${BRAND_COLORS.primaryBright}`,
                borderRadius: 34,
                padding: '40px 38px',
                display: 'flex',
                flexDirection: 'column',
                gap: 28,
                boxShadow: '0 30px 90px rgba(0, 0, 0, 0.72)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 40,
                    fontWeight: 900,
                    color: BRAND_COLORS.inkWhite,
                  }}
                >
                  رحلة العميل الجديدة
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 20,
                    color: BRAND_COLORS.successEmerald,
                    fontWeight: 700,
                  }}
                >
                  OPTIMIZED UX
                </span>
              </div>

              {/* 4-Step Vertical Progress Path */}
              <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: 22}}>
                {[
                  {step: '01', title: 'أول زيارة', desc: 'هوية واضحة تجذب الانتباه فوراً', at: 15},
                  {step: '02', title: 'تصفح منظم', desc: 'تفاصيل المنتج والقيمة أمام العميل', at: 55},
                  {step: '03', title: 'ثقة وقناعة', desc: 'تصميم احترافي يزيل أي تردد', at: 105},
                  {step: '04', title: 'إتمام الطلب', desc: 'خطوة سريعة ومباشرة نحو الشراء ✓', at: 155},
                ].map((item, idx) => {
                  const s = spring({
                    frame: Math.max(0, frame - item.at),
                    fps,
                    config: {damping: 15, stiffness: 190},
                  });
                  const isLast = idx === 3;
                  return (
                    <div
                      key={item.step}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20,
                        opacity: s,
                        transform: `translateX(${interpolate(s, [0, 1], [-28, 0])}px)`,
                        backgroundColor: isLast
                          ? 'rgba(16, 185, 129, 0.14)'
                          : 'rgba(255, 255, 255, 0.04)',
                        border: isLast
                          ? `2px solid ${BRAND_COLORS.successEmerald}`
                          : '1.5px solid rgba(196, 181, 253, 0.22)',
                        borderRadius: 22,
                        padding: '18px 24px',
                      }}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 16,
                          backgroundColor: isLast
                            ? BRAND_COLORS.successEmerald
                            : BRAND_COLORS.primaryMid,
                          color: BRAND_COLORS.inkWhite,
                          fontFamily: FONT_MONO,
                          fontSize: 24,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {item.step}
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <span
                          style={{
                            fontFamily: FONT_DISPLAY,
                            fontSize: 30,
                            fontWeight: 800,
                            color: BRAND_COLORS.inkWhite,
                          }}
                        >
                          {item.title}
                        </span>
                        <span
                          style={{
                            fontFamily: FONT_BODY,
                            fontSize: 23,
                            color: isLast
                              ? '#A7F3D0'
                              : 'rgba(248, 250, 252, 0.78)',
                          }}
                        >
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall journey completion bar */}
              <div
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${journeyLine * 100}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${BRAND_COLORS.primaryBright}, ${BRAND_COLORS.successEmerald})`,
                  }}
                />
              </div>
            </div>
          </AbsoluteFill>
        </>
      )}

      {/* Phase B (255..510): Conversion Results & Order Confirmation Card */}
      {frame >= 255 && (
        <AbsoluteFill
          dir="rtl"
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 68px',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
              opacity: bSpring,
              transform: `translateY(${interpolate(bSpring, [0, 1], [42, 0])}px)`,
            }}
          >
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 50,
                fontWeight: 900,
                color: BRAND_COLORS.inkWhite,
                textAlign: 'center',
                margin: 0,
              }}
            >
              صفحة مرتبة ={' '}
              <span style={{color: BRAND_COLORS.secondaryLavender}}>
                قرار شراء أسرع
              </span>
            </h2>

            {/* 2 Clean KPI Metric Cards */}
            <div style={{display: 'flex', gap: 22}}>
              <div
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(26, 19, 48, 0.94)',
                  border: `2px solid ${BRAND_COLORS.primaryBright}`,
                  borderRadius: 28,
                  padding: '32px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 64,
                    fontWeight: 700,
                    color: BRAND_COLORS.secondaryLavender,
                  }}
                >
                  +{kpiClarity}%
                </span>
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 26,
                    fontWeight: 600,
                    color: BRAND_COLORS.inkWhite,
                  }}
                >
                  وضوح تجربة العميل
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(26, 19, 48, 0.94)',
                  border: `2px solid ${BRAND_COLORS.primaryBright}`,
                  borderRadius: 28,
                  padding: '32px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 64,
                    fontWeight: 700,
                    color: BRAND_COLORS.successEmerald,
                  }}
                >
                  {kpiTrust}%
                </span>
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 26,
                    fontWeight: 600,
                    color: BRAND_COLORS.inkWhite,
                  }}
                >
                  تناسق الهوية والمحتوى
                </span>
              </div>
            </div>

            {/* Order Confirmed Pop Card */}
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.16)',
                border: `2.5px solid ${BRAND_COLORS.successEmerald}`,
                borderRadius: 30,
                padding: '32px 36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: confirmSpr,
                transform: `scale(${interpolate(confirmSpr, [0, 1], [0.88, 1])})`,
                boxShadow: '0 24px 70px rgba(16, 185, 129, 0.25)',
              }}
            >
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 38,
                    fontWeight: 900,
                    color: BRAND_COLORS.inkWhite,
                  }}
                >
                  تم تأكيد الطلب بنجاح
                </span>
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 25,
                    color: '#A7F3D0',
                  }}
                >
                  من أول زيارة.. إلى عميل دائم لمشروعك
                </span>
              </div>
              <div
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: 22,
                  backgroundColor: BRAND_COLORS.successEmerald,
                  color: '#042f2e',
                  fontFamily: FONT_MONO,
                  fontSize: 42,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      <LowerThirdBanner
        stepNumber="04"
        titleAr="النتيجة النهائية"
        subtitleAr="تجربة أسهل تقود إلى الشراء"
        enterFrame={8}
      />
      <LightSweep startFrame={265} durationFrames={38} opacity={0.3} />
    </AbsoluteFill>
  );
};
