import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import {
  Download,
  Film,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {SudanDigitalPromo} from '../remotion/SudanDigitalPromo';
import {
  CAPTION_PHRASES,
  SCENES,
  TOTAL_FRAMES,
  VIDEO_FPS,
  formatTimecode,
  getActiveScene,
  type SceneId,
} from '../remotion/timelineData';

interface VideoInfo {
  ready: boolean;
  filename: string;
  sizeBytes: number;
  durationSeconds: number;
  fps: number;
  resolution: string;
  downloadUrl: string;
  publicUrl: string;
}

export const StudioPreview: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);
  const frameReadoutRef = useRef<HTMLSpanElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSceneId, setActiveSceneId] = useState<SceneId>('intro');
  const [viewMode, setViewMode] = useState<'remotion' | 'mp4'>('remotion');
  const [exportTarget, setExportTarget] = useState<'1080p' | '4k'>('1080p');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/video-info')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: VideoInfo | null) => {
        if (!cancelled && data?.ready) {
          setVideoInfo(data);
        }
      })
      .catch(() => {
        // Ignore if MP4 is still being rendered
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Separate Remotion frame updates from React render cycles to avoid 60Hz re-renders
  useEffect(() => {
    const player = playerRef.current;
    if (!player || viewMode !== 'remotion') {
      return;
    }

    const onFrameUpdate = (e: {detail: {frame: number}}) => {
      const f = e.detail.frame;
      if (timecodeRef.current) {
        timecodeRef.current.textContent = formatTimecode(f);
      }
      if (frameReadoutRef.current) {
        frameReadoutRef.current.textContent = `${String(Math.floor(f)).padStart(4, '0')} / ${TOTAL_FRAMES}`;
      }
      if (rangeRef.current) {
        rangeRef.current.value = String(f);
      }
      const nextScene = getActiveScene(f).id;
      setActiveSceneId((prev) => (prev === nextScene ? prev : nextScene));
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    player.addEventListener('frameupdate', onFrameUpdate);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    player.addEventListener('ended', onEnded);

    return () => {
      player.removeEventListener('frameupdate', onFrameUpdate);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
      player.removeEventListener('ended', onEnded);
    };
  }, [viewMode]);

  const handleTogglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) {
      player.pause();
    } else {
      player.play();
    }
  }, []);

  const handleRestart = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(0);
    setActiveSceneId('intro');
    if (timecodeRef.current) {
      timecodeRef.current.textContent = formatTimecode(0);
    }
    if (frameReadoutRef.current) {
      frameReadoutRef.current.textContent = `0000 / ${TOTAL_FRAMES}`;
    }
    if (rangeRef.current) {
      rangeRef.current.value = '0';
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted()) {
      player.unmute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  }, []);

  const handleScrub = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const targetFrame = Number(e.target.value);
    playerRef.current?.seekTo(targetFrame);
    setActiveSceneId(getActiveScene(targetFrame).id);
    if (timecodeRef.current) {
      timecodeRef.current.textContent = formatTimecode(targetFrame);
    }
    if (frameReadoutRef.current) {
      frameReadoutRef.current.textContent = `${String(targetFrame).padStart(4, '0')} / ${TOTAL_FRAMES}`;
    }
  }, []);

  const handleJumpScene = useCallback((startFrame: number, sceneId: SceneId) => {
    if (viewMode !== 'remotion') {
      setViewMode('remotion');
      setTimeout(() => {
        playerRef.current?.seekTo(startFrame);
      }, 60);
    } else {
      playerRef.current?.seekTo(startFrame);
    }
    setActiveSceneId(sceneId);
    if (timecodeRef.current) {
      timecodeRef.current.textContent = formatTimecode(startFrame);
    }
    if (frameReadoutRef.current) {
      frameReadoutRef.current.textContent = `${String(startFrame).padStart(4, '0')} / ${TOTAL_FRAMES}`;
    }
    if (rangeRef.current) {
      rangeRef.current.value = String(startFrame);
    }
  }, [viewMode]);

  const activeSceneObj =
    SCENES.find((s) => s.id === activeSceneId) ?? SCENES[0];
  const activeScript = CAPTION_PHRASES.filter(
    (p) => p.sceneId === activeSceneObj.id,
  )
    .map((p) => p.words.map((w) => w.text).join(' '))
    .join(' ');

  const fileSizeMb = videoInfo
    ? (videoInfo.sizeBytes / (1024 * 1024)).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-[#08070d] text-slate-100 flex flex-col">
      {/* Clean 3-Zone Top Bar */}
      <header className="border-b border-white/10 bg-[#0c0916]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1380px] mx-auto px-6 py-4 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#preview-stage"
            className="flex items-center gap-3 whitespace-nowrap shrink-0 text-white"
          >
            <img
              src="/assets/processed/logo-mark-darkbg.png"
              alt="Sudan Digital"
              className="w-8 h-8 object-contain"
            />
            <span className="font-display text-lg font-extrabold tracking-tight">
              Sudan Digital Studio
            </span>
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a
              href="#preview-stage"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              المعاينة التفاعلية
            </a>
            <a
              href="#scenes-timeline"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              توزيع المشاهد
            </a>
            <a
              href="#export-section"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              تصدير الجوال
            </a>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <a
              href="/api/download-mp4"
              download="sudan-digital-45s-60fps.mp4"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#6d28d9] hover:bg-[#7c3aed] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download MP4</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Right/Primary Column in RTL: Vertical 9:16 Broadcast Monitor */}
        <section
          id="preview-stage"
          className="lg:col-span-5 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1 bg-[#140f24] rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('remotion')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  viewMode === 'remotion'
                    ? 'bg-[#6d28d9] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                معاينة Remotion
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mp4')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  viewMode === 'mp4'
                    ? 'bg-[#6d28d9] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                ملف MP4 النهائي
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono-num">
              <span>{exportTarget === '1080p' ? '1080×1920' : '2160×3840'}</span>
              <span className="mx-1.5">·</span>
              <span>60fps</span>
            </div>
          </div>

          {/* 9:16 Player Frame */}
          <div className="bg-[#120d21] border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3">
            <div
              dir="ltr"
              className="w-full max-w-[316px] aspect-[9/16] rounded-xl overflow-hidden bg-black border border-violet-500/25 relative"
              data-testid="video-stage"
            >
              {viewMode === 'remotion' ? (
                <Player
                  ref={playerRef}
                  component={SudanDigitalPromo}
                  inputProps={{scaleFactor: 1}}
                  durationInFrames={TOTAL_FRAMES}
                  fps={VIDEO_FPS}
                  compositionWidth={1080}
                  compositionHeight={1920}
                  style={{width: '100%', height: '100%'}}
                  controls={false}
                  clickToPlay
                  acknowledgeRemotionLicense
                />
              ) : (
                <video
                  src="/out/sudan-digital-45s.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain bg-black"
                />
              )}
            </div>

            {/* Custom Transport Controls for Remotion Player */}
            {viewMode === 'remotion' && (
              <div className="w-full flex flex-col gap-3 pt-1">
                <input
                  ref={rangeRef}
                  type="range"
                  aria-label="شريط تقديم الفيديو"
                  min={0}
                  max={TOTAL_FRAMES - 1}
                  defaultValue={0}
                  onChange={handleScrub}
                  className="w-full accent-[#8b5cf6] cursor-pointer"
                />

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#6d28d9] hover:bg-[#7c3aed] text-white transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleRestart}
                      aria-label="إعادة من البداية"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleMute}
                      aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono-num text-slate-300">
                    <span ref={timecodeRef}>00:00.00</span>
                    <span className="text-slate-600">/</span>
                    <span>00:45.00</span>
                    <span className="text-slate-600">·</span>
                    <span ref={frameReadoutRef} className="text-violet-300">
                      0000 / {TOTAL_FRAMES}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Left Editorial Details, Scenes & Direct Export */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Editorial Header */}
          <section className="flex flex-col gap-4 border-b border-white/10 pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>إنتاج إعلاني عمودي 9:16</span>
              <span aria-hidden="true">·</span>
              <span>45 ثانية متصلة (2700 إطار)</span>
              <span aria-hidden="true">·</span>
              <span>موشن جرافيكس 2D خالص</span>
              <span aria-hidden="true">·</span>
              <span>هوية سودان ديجيتال</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              الفيلم الترويجي الرسمي — سودان ديجيتال
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              مونتاج متكامل بسرعة 60 إطار/ثانية يمزج لقطات الفريق والعمل الواقعية
              مع مشاهد موشن جرافيكس 2D تحريرية وكابشنات عربية متزامنة كلمة بكلمة
              مع الفويس أوفر وهوية الشعار.
            </p>

            {/* Active Scene Script Callout */}
            <div className="bg-[#120d21] border border-violet-500/25 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-violet-300">
                <span className="font-semibold">
                  المشهد النشط: 0{activeSceneObj.index} — {activeSceneObj.titleAr}
                </span>
                <span className="font-mono-num">
                  Frames {activeSceneObj.startFrame}–{activeSceneObj.endFrame}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {activeScript || activeSceneObj.subtitleAr}
              </p>
            </div>
          </section>

          {/* 6-Scene Interactive Chapter Timeline */}
          <section id="scenes-timeline" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-400" />
                <span>خطة المشاهد والربط البصري</span>
              </h2>
              <span className="text-xs text-slate-400">
                اضغط على أي مشهد للانتقال الفوري
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCENES.map((scene) => {
                const isActive = scene.id === activeSceneId;
                const durationSec = (scene.durationFrames / VIDEO_FPS).toFixed(1);
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => handleJumpScene(scene.startFrame, scene.id)}
                    className={`text-right rounded-xl p-4 border transition-colors flex flex-col gap-2 ${
                      isActive
                        ? 'bg-[#1a1330] border-violet-400 text-white'
                        : 'bg-[#120d21] border-white/10 text-slate-300 hover:border-violet-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="font-display text-base font-bold text-white">
                        0{scene.index}. {scene.titleAr}
                      </span>
                      <span className="font-mono-num text-xs text-violet-300 shrink-0">
                        {durationSec}s
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {scene.subtitleAr}
                    </p>
                    <div
                      dir="ltr"
                      className="text-[11px] text-slate-500 font-mono-num pt-1 border-t border-white/5 w-full truncate text-right"
                    >
                      {scene.clipsUsed.join(' · ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Export & Mobile Download Section */}
          <section
            id="export-section"
            className="bg-[#120d21] border border-violet-500/30 rounded-2xl p-6 flex flex-col gap-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-violet-400" />
                  <span>التصدير المباشر للهاتف (MP4)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  ترميز H.264 (yuv420p) + صوت AAC متوافق 100% مع iPhone و Android
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#08070d] rounded-lg border border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setExportTarget('1080p')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    exportTarget === '1080p'
                      ? 'bg-[#6d28d9] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1080×1920
                </button>
                <button
                  type="button"
                  onClick={() => setExportTarget('4k')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    exportTarget === '4k'
                      ? 'bg-[#6d28d9] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  4K (2160×3840)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-white/10 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-slate-400">المدة الدقيقة</span>
                <span className="font-mono-num text-sm font-bold text-white">
                  45.00s (2700f)
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-400">معدل الإطارات</span>
                <span className="font-mono-num text-sm font-bold text-white">
                  60 fps
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-400">صيغة التصدير</span>
                <span className="font-mono-num text-sm font-bold text-white">
                  H.264 / AAC
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-400">حجم الملف الجاهز</span>
                <span className="font-mono-num text-sm font-bold text-violet-300">
                  {fileSizeMb ? `${fileSizeMb} MB` : 'جاهز للتحميل'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/api/download-mp4"
                download="sudan-digital-45s-60fps.mp4"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#6d28d9] hover:bg-[#7c3aed] text-white text-sm font-bold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download MP4 (45s · 60fps)</span>
              </a>

              <button
                type="button"
                onClick={() => setViewMode('mp4')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-sm font-semibold transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>معاينة الـ MP4 المُصدّر</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
