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
[ "$(status "$base/install/")" = 302 ] || fail "/install/ is not 302"
[ "$(location "$base/install/")" = "$(location "$base/install")" ] || fail "/install/ differs from /install"
[ "$(status "$base/reviews")" = 302 ] || fail "/reviews is not 302"
[ "$(location "$base/reviews?c=proof")" = "$store/reviews?utm_source=landing&utm_medium=web&utm_campaign=proof" ] || fail "/reviews campaign"
for alias in pt-BR pt_BR; do
  [ "$(status "$base/$alias/")" = 301 ] || fail "/$alias/ is not 301"
  [ "$(location "$base/$alias/")" = "/pt-br/" ] || fail "/$alias/ does not redirect to /pt-br/"
done
for alias in zh-CN zh_CN; do
  [ "$(status "$base/$alias/")" = 301 ] || fail "/$alias/ is not 301"
  [ "$(location "$base/$alias/")" = "/zh-cn/" ] || fail "/$alias/ does not redirect to /zh-cn/"
done
[ "$(status "$base/nope/")" = 404 ] || fail "missing page is not 404"

headers="$(curl -s -o /dev/null -D - "$base/" | tr -d '\r')"
for header in content-security-policy x-content-type-options referrer-policy permissions-policy; do
  grep -qi "^$header:" <<<"$headers" || fail "missing $header"
done
csp="$(grep -i '^content-security-policy:' <<<"$headers")"
if sed 's#frame-src https://www\.youtube-nocookie\.com\(;\|$\)#frame-src\1#' <<<"$csp" | grep -Eq 'https?://'; then
  fail "CSP names a third-party origin"
fi
grep -q 'frame-src https://www.youtube-nocookie.com' <<<"$csp" || fail "CSP lacks the YouTube frame-src"
script_src="$(tr ';' '\n' <<<"$csp" | grep -E '^ ?script-src ')"
case "$script_src" in *"'unsafe-inline'"*) fail "script-src allows unsafe-inline" ;; esac
grep -q "'sha256-" <<<"$script_src" || fail "script-src has no hashes"
for header in cross-origin-opener-policy cross-origin-resource-policy strict-transport-security; do
  grep -qi "^$header:" <<<"$headers" || fail "missing $header"
done

for prefix in es de fr it ja ko pt-br ru zh-cn; do
  [ "$(status "$base/$prefix/nope/")" = 404 ] || fail "/$prefix/nope/ is not 404"
  page="$(curl -s "$base/$prefix/nope/")"
  grep -q "<html lang=\"$(sed 's/-br/-BR/;s/-cn/-CN/' <<<"$prefix")\"" <<<"$page" || fail "/$prefix/nope/ is not the $prefix 404"
done
grep -q '<html lang="en"' <<<"$(curl -s "$base/nope/")" || fail "root 404 is not English"

corp() { curl -s -o /dev/null -D - "$1" | tr -d '\r' | awk 'tolower($1)=="cross-origin-resource-policy:"{print $2}'; }
[ "$(corp "$base/og/og-en.png")" = cross-origin ] || fail "/og/ CORP is not cross-origin"
for path in / /llms.txt /privacy/ /nope/; do
  [ "$(corp "$base$path")" = same-origin ] || fail "$path CORP is not same-origin"
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
