#!/usr/bin/env bash
set -euo pipefail

mode="${1:-test}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
playwright_version="$(grep -o '"@playwright/test@[0-9.]*"' "${repo_root}/bun.lock" | head -1 | sed 's/.*@\([0-9.]*\)"/\1/')"
if [ -z "$playwright_version" ]; then
  echo "Could not resolve the @playwright/test version from bun.lock" >&2
  exit 1
fi
image="mcr.microsoft.com/playwright:v${playwright_version}-noble"
site_image="snug-site:visual"
site_container="snug-site-visual"
site_port="${VISUAL_PORT:-8081}"

cleanup() {
  docker rm -f "$site_container" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker build -f "${repo_root}/apps/site/Dockerfile" -t "$site_image" "$repo_root"
docker rm -f "$site_container" >/dev/null 2>&1 || true
docker run -d --name "$site_container" -p "127.0.0.1:${site_port}:80" "$site_image" >/dev/null

for _ in $(seq 1 30); do
  curl -fs -o /dev/null "http://127.0.0.1:${site_port}/" && break
  sleep 1
done

playwright_args=(test -c playwright.container.config.ts visual.spec.ts)
if [ "$mode" = "update" ]; then
  playwright_args+=(--update-snapshots)
fi

docker run --rm --network host --ipc host --init \
  -v "${repo_root}:/work" -w /work/apps/site \
  -e CI="${CI:-}" -e SITE_URL="http://127.0.0.1:${site_port}" \
  -e HOST_UID="$(id -u)" -e HOST_GID="$(id -g)" \
  "$image" bash -c '
    npx playwright "$@"
    status=$?
    chown -R "$HOST_UID:$HOST_GID" e2e-container test-results playwright-report 2>/dev/null
    exit $status
  ' playwright "${playwright_args[@]}"
