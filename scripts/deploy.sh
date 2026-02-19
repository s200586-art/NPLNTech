#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REMOTE="origin"
BRANCH="main"
HEALTH_URL="https://npln.tech/"
SKIP_HEALTH=0

usage() {
  cat <<'EOF'
Usage:
  scripts/deploy.sh [options]

Options:
  --remote <name>      Git remote (default: origin)
  --branch <name>      Git branch (default: main)
  --url <url>          Health-check URL (default: https://npln.tech/)
  --skip-health        Skip final HTTP/content health check
  -h, --help           Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote)
      REMOTE="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --url)
      HEALTH_URL="${2:-}"
      shift 2
      ;;
    --skip-health)
      SKIP_HEALTH=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

echo "== NPLN deploy =="
echo "Repo:   $ROOT_DIR"
echo "Remote: $REMOTE"
echo "Branch: $BRANCH"

echo "[step 1/3] Safe git pull"
bash scripts/safe_git_pull.sh "$REMOTE" "$BRANCH"

echo "[step 2/3] Static validation"
bash scripts/validate_static.sh

if (( SKIP_HEALTH == 0 )); then
  echo "[step 3/3] Site health check: $HEALTH_URL"
  bash scripts/check_site.sh "$HEALTH_URL"
else
  echo "[step 3/3] Health check skipped (--skip-health)"
fi

echo "Deploy completed."
echo "HEAD: $(git rev-parse --short HEAD)"
