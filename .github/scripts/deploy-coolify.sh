#!/usr/bin/env bash
# Triggers a Coolify deploy and waits for its result.
# Requires COOLIFY_API_TOKEN (from dotenvx) and COOLIFY_APP_UUID (repo variable).
set -euo pipefail

api_base="https://app.coolify.io/api/v1"
poll_interval_seconds=10
max_polls=90

if [[ -z "${COOLIFY_API_TOKEN:-}" || -z "${COOLIFY_APP_UUID:-}" ]]; then
  echo "::error::COOLIFY_API_TOKEN or COOLIFY_APP_UUID is missing."
  exit 1
fi

coolify_request() {
  local method="$1"
  local path="$2"
  curl --silent --show-error --fail --max-time 30 \
    --request "${method}" \
    --header "Authorization: Bearer ${COOLIFY_API_TOKEN}" \
    "${api_base}/${path}"
}

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
