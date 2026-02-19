#!/usr/bin/env bash
set -euo pipefail

URL="${1:-https://npln.tech/}"
TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

HTTP_CODE="$(curl -sS -L --connect-timeout 10 --max-time 25 -w '%{http_code}' -o "$TMP_FILE" "$URL")"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "HTTP status is not 200. Got: $HTTP_CODE"
  exit 1
fi

MIN_BYTES=25000
BYTES="$(wc -c < "$TMP_FILE" | tr -d ' ')"
if (( BYTES < MIN_BYTES )); then
  echo "Response is too small: ${BYTES} bytes (expected >= ${MIN_BYTES})"
  exit 1
fi

required_content=(
  "NPLN Tech"
  'id="services"'
  'id="cases"'
  'id="contact"'
  'id="leadForm"'
  '/files/npln-logo.webp'
)

for token in "${required_content[@]}"; do
  if ! grep -Fq "$token" "$TMP_FILE"; then
    echo "Missing required content token: $token"
    exit 1
  fi
done

echo "Site check passed for $URL"
echo "HTTP: $HTTP_CODE"
echo "Bytes: $BYTES"
