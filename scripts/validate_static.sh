#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

required_files=(
  "index.html"
  "learning-hub.html"
  "calculator.html"
  "claims.html"
  "npln-pay.html"
)

for file in "${required_files[@]}"; do
  [[ -f "$file" ]] || fail "Missing required file: $file"
done

if grep -nE '^(<<<<<<<|=======|>>>>>>>)' ./*.html >/tmp/npln_conflicts.txt; then
  cat /tmp/npln_conflicts.txt >&2
  fail "Found merge conflict markers in HTML files."
fi

required_tokens=(
  'id="services"'
  'id="cases"'
  'id="clients"'
  'id="process"'
  'id="faq"'
  'id="contact"'
  'id="leadForm"'
  '/files/npln-logo.webp'
  'data-case-filter'
  'lead_form_submit'
  'cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz'
  'cdn.amplitude.com/libs/plugin-autocapture-browser-0.9.0-min.js.gz'
  'analytics.js'
)

for token in "${required_tokens[@]}"; do
  grep -Fq "$token" index.html || fail "index.html missing token: $token"
done

echo "Static validation passed."
