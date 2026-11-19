#!/usr/bin/env bash
# Muxes the deterministic PNG/JPEG frame sequence + the supplied mastered VO into
# the deliverable iPhone/Android-compatible MP4:
#
#   H.264 High 4.2 · yuv420p · 1080x1920 · 60fps · 2700 frames · AAC 192k 44.1k stereo
#
# Usage: bash render/render-final.sh [--4k]
set -euo pipefail
cd "$(dirname "$0")/.."

SCALE=1080x1920
FRAMES=build/frames
OUT=public/out/sudan-digital-45s.mp4
AUDIO=public/assets/processed/master-audio-45s.mp3

if [ "${1:-}" = "--4k" ]; then
  SCALE=2160x3840
  FRAMES=build/frames-4k
  OUT=public/out/sudan-digital-45s-4k.mp4
fi

mkdir -p public/out
COUNT=$(find "$FRAMES" -maxdepth 1 \( -name 'f*.jpg' -o -name 'f*.png' \) | wc -l | tr -d ' ')
echo "frames: $COUNT  target: $SCALE  60fps"
if [ "$COUNT" -ne 2700 ]; then
  echo "ERROR: expected exactly 2700 frames, found $COUNT" >&2
  exit 1
fi
FIRST=$(find "$FRAMES" -maxdepth 1 -name 'f*' -print -quit)
PATTERN="$FRAMES/f%05d.jpg"
case "$FIRST" in *.png) PATTERN="$FRAMES/f%05d.png";; esac

ffmpeg -v warning -y \
  -framerate 60 -start_number 0 -i "$PATTERN" \
  -i "$AUDIO" \
  -map 0:v:0 -map 1:a:0 \
  -vf "scale=${SCALE}:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:v libx264 -preset slow -crf 19 \
  -profile:v high -level:v 4.2 \
  -pix_fmt yuv420p \
  -x264-params "keyint=120:min-keyint=60:scenecut=0" \
  -r 60 -frames:v 2700 \
  -af "atrim=0:45,asetpts=N/SR/TB,aresample=44100" \
  -c:a aac -b:a 192k -ac 2 -ar 44100 \
  -movflags +faststart \
  -metadata title="Sudan Digital — 45s Vertical Promo" \
  -metadata comment="Deterministic 2D motion render · VO: master-audio-45s.mp3" \
  "$OUT"

echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
