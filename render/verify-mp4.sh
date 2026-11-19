#!/usr/bin/env bash
# Final QA gate: ffprobe assertions + verification stills + manifest for the studio.
set -euo pipefail
cd "$(dirname "$0")/.."

MP4="${1:-public/out/sudan-digital-45s.mp4}"
MANIFEST="${MP4%.mp4}.manifest.json"
STILLS=build/verification
mkdir -p "$STILLS"

echo "== ffprobe =="
ffprobe -v error \
  -show_entries format=duration,size,bit_rate,format_name \
  -show_entries stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate,nb_frames,duration,sample_rate,channels,profile,level \
  -of default=noprint_wrappers=1 "$MP4" | tee "$STILLS/ffprobe.txt"

python3 - "$MP4" "$MANIFEST" <<'PY'
import json, subprocess, sys
mp4, manifest_path = sys.argv[1], sys.argv[2]
data = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-print_format', 'json',
    '-show_format', '-show_streams', mp4,
]))
fmt = data['format']
v = next(s for s in data['streams'] if s['codec_type'] == 'video')
a = next((s for s in data['streams'] if s['codec_type'] == 'audio'), None)
num, den = v['r_frame_rate'].split('/')
fps = float(num) / float(den)
frames = int(v.get('nb_frames') or round(float(fmt['duration']) * fps))
checks = {
    'duration_is_45s': abs(float(fmt['duration']) - 45.0) < 0.05,
    'frames_2700': frames == 2700,
    'fps_60': abs(fps - 60.0) < 1e-6,
    'size_1080x1920': (v['width'], v['height']) == (1080, 1920),
    'pix_fmt_yuv420p': v['pix_fmt'] == 'yuv420p',
    'codec_h264': v['codec_name'] == 'h264',
    'audio_aac': bool(a) and a['codec_name'] == 'aac',
    'audio_44k_stereo': bool(a) and int(a['sample_rate']) == 44100 and int(a['channels']) == 2,
}
manifest = {
    'file': mp4.split('/')[-1],
    'durationSeconds': round(float(fmt['duration']), 3),
    'totalFrames': frames,
    'fps': fps,
    'resolution': f"{v['width']}x{v['height']}",
    'videoCodec': v['codec_name'],
    'videoProfile': f"High {v.get('level', '')}".strip(),
    'pixelFormat': v['pix_fmt'],
    'audioCodec': a['codec_name'] if a else None,
    'audioSampleRate': int(a['sample_rate']) if a else None,
    'audioChannels': int(a['channels']) if a else None,
    'sizeBytes': int(fmt['size']),
    'bitRate': int(fmt.get('bit_rate') or 0),
    'checks': checks,
    'allChecksPassed': all(checks.values()),
}
json.dump(manifest, open(manifest_path, 'w'), indent=2, ensure_ascii=False)
print('\n== assertions ==')
for k, ok in checks.items():
    print(f"  {'PASS' if ok else 'FAIL'}  {k}")
print(f"\nmanifest: {manifest_path}")
print(f"allChecksPassed: {manifest['allChecksPassed']}")
sys.exit(0 if manifest['allChecksPassed'] else 1)
PY

echo "== verification stills =="
for t in 1.0 3.2 6.5 9.0 12.5 16.0 18.8 22.0 25.5 28.0 31.0 34.0 37.0 39.0 41.5 44.0; do
  ffmpeg -v error -y -ss "$t" -i "$MP4" -frames:v 1 "$STILLS/still-${t}s.png"
done
ls "$STILLS" | sed 's/^/  /'
