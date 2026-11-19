#!/usr/bin/env bash
# Decodes the supplied vertical-footage plates into deterministic JPEG frame
# sequences (12 fps, 9:16 cover crop at 1440x2560) so the Node frame renderer
# has random access to every still without a video-decode dependency.
#
# Clip audio is discarded here and nowhere else — the only audio that reaches the
# final master is public/assets/processed/master-audio-45s.mp3.
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=build/footage
SRC=public/assets/aistudio
FPS=12
W=1080
H=1920

mkdir -p "$OUT"

prep() {
  name="$1"; start="$2"; dur="$3"; extra="${4:-}"
  dir="$OUT/$name"
  if [ -f "$dir/.done" ]; then echo "skip $name"; return; fi
  rm -rf "$dir" && mkdir -p "$dir"
  ffmpeg -v error -y -ss "$start" -t "$dur" -i "$SRC/$name.mp4" \
    -an -vf "fps=$FPS,crop=ih*9/16:ih,scale=$W:$H:flags=lanczos,eq=contrast=1.06:saturation=0.86:brightness=-0.02,unsharp=5:5:0.35:5:5:0.0${extra:+,$extra}" \
    -q:v 5 "$dir/f%03d.jpg"
  touch "$dir/.done"
  echo "done $name ($(ls "$dir" | grep -c jpg) frames)"
}

# scene 2 — browsing a page, then waiting for a reply
prep 02_competitor_browse_25f450a5 1.0 12
prep 06_clock_ticking_ba4c8ffa 1.0 12
# scene 3 — writing down ideas while the problem stays unsolved
prep 03_write_idea_091f514a 1.0 12
prep 10_hourglass_time_76fb56b9 1.0 12
# scene 4 — the Sudan Digital team working on content/design/page management
prep 11_team_sticky_notes_30a1b442 1.0 12
prep 12_team_whiteboard_9e1fc0fb 1.0 12
prep 13_design_layout_66c45f85 1.0 12
# scene 5 — the clear path from first visit to order
prep 15_website_monitor_f71a509e 1.0 12
prep 05_calendar_flip_58950def 1.0 12

echo "footage ready:"
du -sh "$OUT"/*
