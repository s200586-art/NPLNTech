#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SORA_CLI="${SORA_CLI:-$HOME/.codex/skills/sora/scripts/sora.py}"
PROMPT_FILE="${PROMPT_FILE:-$ROOT_DIR/scripts/prompts/sora-logo-premium.txt}"
SOURCE_IMAGE="${SOURCE_IMAGE:-$ROOT_DIR/files/learning-hub-og.png}"
MODEL="${MODEL:-sora-2-pro}"
CLIP_SECONDS="${CLIP_SECONDS:-8}"
SIZE="${SIZE:-1280x720}"
OUT_VIDEO="${OUT_VIDEO:-$ROOT_DIR/files/npln-logo-hero-premium.mp4}"
JSON_OUT="${JSON_OUT:-/tmp/sora-logo-premium-job.json}"
DRY_RUN="${DRY_RUN:-0}"

usage() {
  cat <<'EOF'
Usage:
  scripts/sora_logo_premium.sh [--dry-run]

Env overrides:
  SORA_CLI      Path to sora.py (default: ~/.codex/skills/sora/scripts/sora.py)
  PROMPT_FILE   Prompt file path
  SOURCE_IMAGE  Source image for reference
  MODEL         sora-2 or sora-2-pro (default: sora-2-pro)
  CLIP_SECONDS  4|8|12 (default: 8)
  SIZE          Output size (default: 1280x720)
  OUT_VIDEO     Output mp4 path
  JSON_OUT      Output job json path
  DRY_RUN       1 to preview request without API call
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ ! -f "$SORA_CLI" ]]; then
  echo "Missing Sora CLI: $SORA_CLI" >&2
  exit 1
fi

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Missing prompt file: $PROMPT_FILE" >&2
  exit 1
fi

if [[ ! -f "$SOURCE_IMAGE" ]]; then
  echo "Missing source image: $SOURCE_IMAGE" >&2
  exit 1
fi

if [[ "$DRY_RUN" != "1" && -z "${OPENAI_API_KEY:-}" ]]; then
  echo "OPENAI_API_KEY is not set. Export it in shell and retry." >&2
  exit 1
fi

if ! python3 - <<'PY' >/dev/null 2>&1
import openai
PY
then
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "openai package is missing, but dry-run can continue."
  else
    echo "Installing openai package..."
    python3 -m pip install --user openai
  fi
fi

mkdir -p "$(dirname "$OUT_VIDEO")" "$(dirname "$JSON_OUT")"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
TMP_CROP="$TMP_DIR/logo-crop.png"
REF_PNG="$TMP_DIR/logo-ref-1280x720.png"

# Keep a wide cinematic crop when possible, then resize to required Sora dimensions.
if ! sips -c 900 1600 "$SOURCE_IMAGE" --out "$TMP_CROP" >/dev/null 2>&1; then
  sips -s format png "$SOURCE_IMAGE" --out "$TMP_CROP" >/dev/null
fi
sips -s format png --resampleHeightWidth 720 1280 "$TMP_CROP" --out "$REF_PNG" >/dev/null

CMD=(
  python3 "$SORA_CLI" create-and-poll
  --model "$MODEL"
  --size "$SIZE"
  --seconds "$CLIP_SECONDS"
  --input-reference "$REF_PNG"
  --prompt-file "$PROMPT_FILE"
  --no-augment
  --download
  --variant video
  --out "$OUT_VIDEO"
  --json-out "$JSON_OUT"
  --timeout 1800
)

if [[ "$DRY_RUN" == "1" ]]; then
  CMD+=(--dry-run)
fi

echo "Running Sora pipeline..."
printf '  %q' "${CMD[@]}"
echo
"${CMD[@]}"

if [[ "$DRY_RUN" == "1" ]]; then
  echo "Dry run complete."
else
  echo "Video saved to: $OUT_VIDEO"
  echo "Job json saved to: $JSON_OUT"
fi
