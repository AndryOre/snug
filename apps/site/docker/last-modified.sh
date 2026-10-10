#!/usr/bin/env bash
# Prints a JSON map of source path -> last commit date (YYYY-MM-DD) for the
# files the sitemap stamps with lastmod. The image build has no git history, so
# callers pass this output as the LAST_MODIFIED_DATES build argument:
#   docker build --build-arg LAST_MODIFIED_DATES="$(bash apps/site/docker/last-modified.sh)" ...
# Keys are relative to apps/site, matching src/seo/last-modified.ts.
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
if [ "$(git -C "$root" rev-parse --is-shallow-repository)" = true ]; then
  echo "Shallow clone: per-file dates would all equal the latest commit. Fetch full history (fetch-depth: 0)." >&2
  exit 1
fi

cd "$root/apps/site"
sources=(
  src/content
  src/pages/privacy.astro
  ../../PRIVACY_POLICY.md
  ../../CHANGELOG.md
  ../../docs/usage.md
  ../../docs/guide
)

map='{}'
while IFS= read -r file; do
  date="$(git log -1 --format=%cs -- "$file")"
  [ -n "$date" ] || continue
  map="$(jq -c --arg file "$file" --arg date "$date" '. + {($file): $date}' <<<"$map")"
done < <(git ls-files -- "${sources[@]}")

echo "$map"
