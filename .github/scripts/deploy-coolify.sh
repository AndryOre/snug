#!/usr/bin/env bash
# Publishes LAST_MODIFIED_DATES as the app's build-time variable, then triggers
# a Coolify deploy and waits for its result. Coolify builds from a shallow clone
# without git history, so the sitemap dates must arrive as a build variable.
# Requires COOLIFY_API_TOKEN (from dotenvx, with the `write` ability),
# COOLIFY_APP_UUID (repo variable) and LAST_MODIFIED_DATES (the JSON printed by
# apps/site/docker/last-modified.sh).
set -euo pipefail

api_base="https://app.coolify.io/api/v1"
poll_interval_seconds=10
max_polls=90

if [[ -z "${COOLIFY_API_TOKEN:-}" || -z "${COOLIFY_APP_UUID:-}" ]]; then
  echo "::error::COOLIFY_API_TOKEN or COOLIFY_APP_UUID is missing."
  exit 1
fi

if ! jq -e 'type == "object" and length > 0' >/dev/null 2>&1 <<<"${LAST_MODIFIED_DATES:-}"; then
  echo "::error::LAST_MODIFIED_DATES is missing or is not a non-empty JSON object."
  exit 1
fi

coolify_request() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local args=(
    --silent --show-error --fail --max-time 30
    --request "${method}"
    --header "Authorization: Bearer ${COOLIFY_API_TOKEN}"
  )
  if [[ -n "${body}" ]]; then
    args+=(--header "Content-Type: application/json" --data "${body}")
  fi
  curl "${args[@]}" "${api_base}/${path}"
}

envs_payload=$(jq -cn --arg value "${LAST_MODIFIED_DATES}" \
  '{data: [{key: "LAST_MODIFIED_DATES", value: $value, is_buildtime: true, is_runtime: false, is_literal: true}]}')

coolify_request PATCH "applications/${COOLIFY_APP_UUID}/envs/bulk" "${envs_payload}" >/dev/null || {
  echo "::error::Coolify rejected the LAST_MODIFIED_DATES update. Check that the token has the write ability."
  exit 1
}
echo "LAST_MODIFIED_DATES updated ($(jq 'length' <<<"${LAST_MODIFIED_DATES}") entries)."

trigger_response=$(coolify_request POST "deploy?uuid=${COOLIFY_APP_UUID}&force=false") || {
  echo "::error::Coolify rejected the deploy request."
  exit 1
}

deployment_uuid=$(jq -r '.deployments[0].deployment_uuid // empty' <<<"${trigger_response}")
if [[ -z "${deployment_uuid}" ]]; then
  echo "::error::Coolify did not return a deployment uuid."
  exit 1
fi
echo "Deployment queued: ${deployment_uuid}"

for ((poll = 1; poll <= max_polls; poll++)); do
  status=$(coolify_request GET "deployments/${deployment_uuid}" | jq -r '.status // "unknown"') || status="unknown"
  echo "Deployment status: ${status}"
  case "${status}" in
    finished)
      echo "Deploy succeeded."
      exit 0
      ;;
    failed | cancelled-by-user)
      echo "::error::Coolify deployment ${deployment_uuid} ended with status '${status}'. Check the build logs in Coolify."
      exit 1
      ;;
  esac
  sleep "${poll_interval_seconds}"
done

echo "::error::Coolify deployment ${deployment_uuid} did not finish within $((max_polls * poll_interval_seconds)) seconds."
exit 1
