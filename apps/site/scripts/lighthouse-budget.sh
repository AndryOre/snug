#!/usr/bin/env bash
# Runs Lighthouse (mobile defaults) against SITE_URL, LIGHTHOUSE_RUNS times per
# page, and fails when a category's median score drops below its budget.
# Needs CHROME_PATH and jq.
set -euo pipefail

base="${SITE_URL:-http://127.0.0.1:8080}"
out="$(mktemp -d)"
declare -A budget=([performance]=90 [accessibility]=100 [best-practices]=95 [seo]=100)
failed=0

runs="${LIGHTHOUSE_RUNS:-5}"

median_score() {
  local category="$1"
  shift
  jq -r --arg c "$category" '.categories[$c].score // "null"' "$@" |
    sort -g | awk '{ scores[NR] = $1 } END { print scores[int((NR + 1) / 2)] }'
}

for path in / /ru/ /ja/ /privacy/; do
  reports=()
  for run in $(seq 1 "$runs"); do
    report="$out/report-$run.json"
    bunx lighthouse "$base$path" \
      --quiet --output=json --output-path="$report" \
      --only-categories=performance,accessibility,best-practices,seo \
      --chrome-flags="--headless=new --no-sandbox"
    reports+=("$report")
  done
  for category in "${!budget[@]}"; do
    raw="$(median_score "$category" "${reports[@]}")"
    if [ "$raw" = "null" ]; then
      echo "FAIL $path $category score is null (Lighthouse could not compute it)" >&2
      failed=1
      continue
    fi
    score="$(awk -v s="$raw" 'BEGIN { printf "%d", s * 100 + 0.5 }')"
    if [ "$score" -lt "${budget[$category]}" ]; then
      echo "FAIL $path $category $score < ${budget[$category]} (median of $runs)" >&2
      failed=1
    else
      echo "ok   $path $category $score >= ${budget[$category]} (median of $runs)"
    fi
  done
done

exit "$failed"
