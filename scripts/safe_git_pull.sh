#!/usr/bin/env bash
set -euo pipefail

REMOTE="${1:-origin}"
BRANCH="${2:-main}"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_ROOT=".pull-backups/${STAMP}"

if [[ ! -d .git ]]; then
  echo "Run this script from repository root." >&2
  exit 1
fi

echo "[1/5] fetch ${REMOTE}/${BRANCH}"
git fetch "$REMOTE" "$BRANCH"

TARGET_REF="${REMOTE}/${BRANCH}"
INCOMING_FILES="$(git diff --name-only HEAD.."${TARGET_REF}" || true)"

if [[ -z "$INCOMING_FILES" ]]; then
  echo "Nothing to update. HEAD is already up to date."
  exit 0
fi

echo "[2/5] incoming files:"
echo "$INCOMING_FILES" | sed 's/^/ - /'

TRACKED_MODS="$(git diff --name-only || true)"
TO_STASH=()
while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if echo "$TRACKED_MODS" | grep -Fxq "$file"; then
    TO_STASH+=("$file")
  fi
done <<< "$INCOMING_FILES"

if (( ${#TO_STASH[@]} > 0 )); then
  echo "[3/5] stashing tracked local edits that conflict with incoming files"
  git stash push -m "safe-pull-${STAMP}" -- "${TO_STASH[@]}"
else
  echo "[3/5] no tracked conflicting edits"
fi

UNTRACKED_FILES="$(git ls-files --others --exclude-standard || true)"
MOVED_ANY=0
while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if echo "$UNTRACKED_FILES" | grep -Fxq "$file"; then
    mkdir -p "${BACKUP_ROOT}/$(dirname "$file")"
    mv "$file" "${BACKUP_ROOT}/${file}"
    echo "moved untracked conflicting file: $file -> ${BACKUP_ROOT}/${file}"
    MOVED_ANY=1
  fi
done <<< "$INCOMING_FILES"

if (( MOVED_ANY == 0 )); then
  echo "[4/5] no untracked conflicting files"
else
  echo "[4/5] untracked conflicting files moved to ${BACKUP_ROOT}"
fi

echo "[5/5] pulling ${REMOTE}/${BRANCH}"
git pull "$REMOTE" "$BRANCH"

echo "Done."
echo "Current HEAD: $(git rev-parse --short HEAD)"
echo "Branch status:"
git status --short --branch
