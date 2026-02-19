#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-s200586-art/NPLNTech}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is not installed."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub auth is invalid. Run:"
  echo "  gh auth login -h github.com"
  exit 1
fi

echo "Triggering workflows for $REPO..."
gh workflow run "ci-static.yml" -R "$REPO"
gh workflow run "uptime-monitor.yml" -R "$REPO"
gh workflow run "lighthouse-audit.yml" -R "$REPO"

echo
echo "Recent runs:"
gh run list -R "$REPO" --limit 10
