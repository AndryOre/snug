#!/usr/bin/env bash
# Builds the site image from the repo root and checks redirect, headers, 404
# and masked logs. Not part of `bun run check`: run it by hand or from CI.
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
image="snug-site-smoke"
name="snug-site-smoke-$$"
store="https://chromewebstore.google.com/detail/gdhpeilfkeeajillmcncaelnppiakjhn"

docker build -f "$root/apps/site/Dockerfile" -t "$image" "$root"
docker run -d --rm --name "$name" -p 127.0.0.1:0:80 "$image" >/dev/null
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT
port="$(docker port "$name" 80/tcp | head -n1 | sed 's/.*://')"
base="http://127.0.0.1:$port"

for _ in $(seq 1 30); do
  curl -fs -o /dev/null "$base/" && break
  sleep 0.5
done

fail() { echo "FAIL: $*" >&2; exit 1; }

location() { curl -s -o /dev/null -D - "$1" | tr -d '\r' | awk 'tolower($1)=="location:"{print $2}'; }
status() { curl -s -o /dev/null -w '%{http_code}' "$1"; }

[ "$(status "$base/install")" = 302 ] || fail "/install is not 302"
[ "$(location "$base/install")" = "$store?utm_source=landing&utm_medium=web&utm_campaign=direct" ] || fail "default campaign"
[ "$(location "$base/install?c=hero")" = "$store?utm_source=landing&utm_medium=web&utm_campaign=hero" ] || fail "c=hero"
case "$(location "$base/install?c=a%26b")" in *campaign=direct) ;; *) fail "unsafe tag not rejected" ;; esac
[ "$(status "$base/nope")" = 404 ] || fail "missing page is not 404"

headers="$(curl -s -o /dev/null -D - "$base/" | tr -d '\r')"
for header in content-security-policy x-content-type-options referrer-policy permissions-policy; do
  grep -qi "^$header:" <<<"$headers" || fail "missing $header"
done
csp="$(grep -i '^content-security-policy:' <<<"$headers")"
if sed 's#frame-src https://www\.youtube-nocookie\.com\(;\|$\)#frame-src\1#' <<<"$csp" | grep -Eq 'https?://'; then
  fail "CSP names a third-party origin"
fi
grep -q 'frame-src https://www.youtube-nocookie.com' <<<"$csp" || fail "CSP lacks the YouTube frame-src"
for header in cross-origin-opener-policy cross-origin-resource-policy strict-transport-security; do
  grep -qi "^$header:" <<<"$headers" || fail "missing $header"
done

[ "$(status "$base/de")" = 301 ] || fail "/de is not 301"
[ "$(location "$base/de")" = "/de/" ] || fail "/de does not redirect to /de/"
[ "$(status "$base/de/")" = 200 ] || fail "/de/ is not 200"
for file in robots.txt sitemap.xml llms.txt; do
  [ "$(status "$base/$file")" = 200 ] || fail "$file is not 200"
done

logs="$(docker logs "$name" 2>&1)"
grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+\.0 ' <<<"$logs" || fail "log not masked"
if grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+\.[1-9][0-9]* ' <<<"$logs"; then
  fail "log has a full IP"
fi

echo "OK"
