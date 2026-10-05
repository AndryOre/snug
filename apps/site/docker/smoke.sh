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
if grep -i '^content-security-policy:' <<<"$headers" | grep -Eq 'https?://'; then
  fail "CSP names a third-party origin"
fi

logs="$(docker logs "$name" 2>&1)"
grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+\.0 ' <<<"$logs" || fail "log not masked"
if grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+\.[1-9][0-9]* ' <<<"$logs"; then
  fail "log has a full IP"
fi

echo "OK"
