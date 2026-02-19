#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-s200586-art/NPLNTech}"

echo "== GH CLI check =="
if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is not installed."
  exit 1
fi

echo "== Auth status =="
if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub auth is invalid. Run:"
  echo "  gh auth login -h github.com"
  exit 1
fi
gh auth status

echo "== Workflows =="
gh workflow list -R "$REPO"

echo "== Secrets present (names only) =="
gh secret list -R "$REPO" || true

echo "Done."
