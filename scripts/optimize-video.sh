#!/usr/bin/env bash
# Regenera el video del producto y su poster a partir del original.
# Requiere ffmpeg y Pillow. El resultado se versiona en public/video/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FFMPEG="${FFMPEG:-ffmpeg}"
SOURCE="$ROOT/assets/producto/plato-hoja-video.mp4"
OUTPUT="$ROOT/public/video/plato-hoja.mp4"
POSTER="$ROOT/public/img/producto/plato-hoja-video-poster.webp"
TMP="$(mktemp --suffix=.png)"
trap 'rm -f "$TMP"' EXIT

mkdir -p "$(dirname "$OUTPUT")" "$(dirname "$POSTER")"

"$FFMPEG" -y -hide_banner -loglevel error -i "$SOURCE" \
  -vf "fps=30" -c:v libx264 -crf 24 -preset slow -an -movflags +faststart "$OUTPUT"

"$FFMPEG" -y -hide_banner -loglevel error -ss 0.5 -i "$SOURCE" \
  -frames:v 1 -vf "scale=848:-2" "$TMP"

python3 - "$POSTER" "$TMP" <<'PY'
import sys
from PIL import Image

output, source = sys.argv[1], sys.argv[2]
Image.open(source).convert('RGB').save(output, 'WEBP', quality=82, method=6)
PY

echo "Listo: $OUTPUT y $POSTER"
