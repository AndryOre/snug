#!/usr/bin/env bash
# Runs Lighthouse (mobile defaults) against SITE_URL and fails when a category
# score drops below its budget. Needs CHROME_PATH and jq.
set -euo pipefail

base="${SITE_URL:-http://127.0.0.1:8080}"
out="$(mktemp -d)"
declare -A budget=([performance]=95 [accessibility]=100 [best-practices]=95 [seo]=100)
failed=0

for path in / /ru/ /ja/ /privacy/; do
  report="$out/report.json"
  bunx lighthouse "$base$path" \
    --quiet --output=json --output-path="$report" \
    --only-categories=performance,accessibility,best-practices,seo \
    --chrome-flags="--headless=new --no-sandbox"
  for category in "${!budget[@]}"; do
    score="$(jq -r --arg c "$category" '(.categories[$c].score * 100) | round' "$report")"
    if [ "$score" -lt "${budget[$category]}" ]; then
      echo "FAIL $path $category $score < ${budget[$category]}" >&2
      failed=1
    else
      echo "ok   $path $category $score >= ${budget[$category]}"
    fi
  done
done

exit "$failed"
