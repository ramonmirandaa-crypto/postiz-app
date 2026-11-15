#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/var/autototem-generated"
UPLOAD_DIR="${UPLOAD_DIR:-/var/lib/docker/volumes/postiz_postiz-uploads/_data/autototem-generated}"
PUBLIC_UPLOAD_PATH="${PUBLIC_UPLOAD_PATH:-/uploads/autototem-generated}"
COMPOSITION_DIR="${ROOT_DIR}/scripts/autototem-media"
WORK_DIR="${WORK_DIR:-/tmp/autototem-html-media}"
FPS="${FPS:-24}"

mkdir -p "${OUT_DIR}" "${WORK_DIR}"

require_tools() {
  for tool in node ffmpeg; do
    if ! command -v "${tool}" >/dev/null 2>&1; then
      echo "${tool} is required to generate media assets." >&2
      exit 1
    fi
  done

  if [ ! -x /snap/bin/chromium ] && ! command -v chromium >/dev/null 2>&1 && ! command -v google-chrome >/dev/null 2>&1; then
    echo "Chromium or Chrome is required to render the HTML composition." >&2
    exit 1
  fi
}

encode_video() {
  local frame_dir="$1"
  local output="$2"

  ffmpeg -hide_banner -loglevel error -y \
    -framerate "${FPS}" \
    -i "${frame_dir}/%04d.png" \
    -c:v libx264 \
    -preset slow \
    -crf 17 \
    -profile:v high \
    -pix_fmt yuv420p \
    -movflags +faststart \
    "${OUT_DIR}/${output}"
}

write_manifest() {
  cat >"${OUT_DIR}/manifest.json" <<EOF
{
  "campaign": "autototem",
  "styleSource": "https://autototem.com.br",
  "generatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "assets": [
    { "name": "instagram-post-fila", "type": "image", "path": "${PUBLIC_UPLOAD_PATH}/instagram-post-fila.png", "format": "square" },
    { "name": "instagram-story-cardapio", "type": "image", "path": "${PUBLIC_UPLOAD_PATH}/instagram-story-cardapio.png", "format": "story" },
    { "name": "facebook-post-operacao", "type": "image", "path": "${PUBLIC_UPLOAD_PATH}/facebook-post-operacao.png", "format": "facebook" },
    { "name": "youtube-thumb-demo", "type": "image", "path": "${PUBLIC_UPLOAD_PATH}/youtube-thumb-demo.png", "format": "youtube" },
    { "name": "autototem-reels-fila-pico", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-reels-fila-pico.mp4", "format": "reels", "durationSeconds": 8 },
    { "name": "autototem-youtube-fila-pico", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-youtube-fila-pico.mp4", "format": "youtube", "durationSeconds": 8 },
    { "name": "autototem-reels-gargalo", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-reels-gargalo.mp4", "format": "reels", "durationSeconds": 8 },
    { "name": "autototem-youtube-gargalo", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-youtube-gargalo.mp4", "format": "youtube", "durationSeconds": 8 },
    { "name": "autototem-reels-6-motivos", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-reels-6-motivos.mp4", "format": "reels", "durationSeconds": 8 },
    { "name": "autototem-youtube-6-motivos", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-youtube-6-motivos.mp4", "format": "youtube", "durationSeconds": 8 },
    { "name": "autototem-reels-onde-usar", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-reels-onde-usar.mp4", "format": "reels", "durationSeconds": 8 },
    { "name": "autototem-youtube-onde-usar", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-youtube-onde-usar.mp4", "format": "youtube", "durationSeconds": 8 },
    { "name": "autototem-reels-restaurante", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-reels-restaurante.mp4", "format": "reels", "durationSeconds": 8 },
    { "name": "autototem-youtube-restaurante", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-youtube-restaurante.mp4", "format": "youtube", "durationSeconds": 8 },
    { "name": "autototem-reels-hardware-real", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-reels-hardware-real.mp4", "format": "reels", "durationSeconds": 8 },
    { "name": "autototem-youtube-hardware-real", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-youtube-hardware-real.mp4", "format": "youtube", "durationSeconds": 8 },
    { "name": "autototem-reels-pix-balcao", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-reels-pix-balcao.mp4", "format": "reels", "durationSeconds": 8 },
    { "name": "autototem-youtube-pix-balcao", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-youtube-pix-balcao.mp4", "format": "youtube", "durationSeconds": 8 },
    { "name": "autototem-reels-clinicas", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-reels-clinicas.mp4", "format": "reels", "durationSeconds": 8 },
    { "name": "autototem-youtube-clinicas", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-youtube-clinicas.mp4", "format": "youtube", "durationSeconds": 8 },
    { "name": "autototem-reels-varejo-cadastro", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-reels-varejo-cadastro.mp4", "format": "reels", "durationSeconds": 8 },
    { "name": "autototem-youtube-varejo-cadastro", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-youtube-varejo-cadastro.mp4", "format": "youtube", "durationSeconds": 8 },
    { "name": "autototem-reels-checklist-implantacao", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-reels-checklist-implantacao.mp4", "format": "reels", "durationSeconds": 8 },
    { "name": "autototem-youtube-checklist-implantacao", "type": "video", "path": "${PUBLIC_UPLOAD_PATH}/autototem-youtube-checklist-implantacao.mp4", "format": "youtube", "durationSeconds": 8 }
  ]
}
EOF
}

publish_assets() {
  if [ -d "$(dirname "${UPLOAD_DIR}")" ] && [ -w "$(dirname "${UPLOAD_DIR}")" ]; then
    mkdir -p "${UPLOAD_DIR}"
    cp "${OUT_DIR}"/*.png "${OUT_DIR}"/*.mp4 "${OUT_DIR}/manifest.json" "${UPLOAD_DIR}/"
    echo "Published media to ${UPLOAD_DIR}"
  fi
}

require_tools

node "${COMPOSITION_DIR}/render-assets.mjs" \
  --composition "${COMPOSITION_DIR}/render.html" \
  --out "${OUT_DIR}" \
  --work "${WORK_DIR}" \
  --fps "${FPS}"

video_assets=(
  "autototem-reels-fila-pico"
  "autototem-youtube-fila-pico"
  "autototem-reels-gargalo"
  "autototem-youtube-gargalo"
  "autototem-reels-6-motivos"
  "autototem-youtube-6-motivos"
  "autototem-reels-onde-usar"
  "autototem-youtube-onde-usar"
  "autototem-reels-restaurante"
  "autototem-youtube-restaurante"
  "autototem-reels-hardware-real"
  "autototem-youtube-hardware-real"
  "autototem-reels-pix-balcao"
  "autototem-youtube-pix-balcao"
  "autototem-reels-clinicas"
  "autototem-youtube-clinicas"
  "autototem-reels-varejo-cadastro"
  "autototem-youtube-varejo-cadastro"
  "autototem-reels-checklist-implantacao"
  "autototem-youtube-checklist-implantacao"
)

if [ -n "${ONLY_ASSETS:-}" ]; then
  selected_assets=" ${ONLY_ASSETS//,/ } "
  filtered_video_assets=()
  for asset in "${video_assets[@]}"; do
    if [[ "${selected_assets}" == *" ${asset} "* ]]; then
      filtered_video_assets+=("${asset}")
    fi
  done
  video_assets=("${filtered_video_assets[@]}")
fi

for asset in "${video_assets[@]}"; do
  encode_video "${WORK_DIR}/${asset}" "${asset}.mp4"
done

write_manifest
publish_assets

find "${OUT_DIR}" -maxdepth 1 -type f \( -name '*.png' -o -name '*.mp4' -o -name 'manifest.json' \) -printf '%f %s bytes\n' | sort
