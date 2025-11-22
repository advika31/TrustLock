#!/usr/bin/env bash
set -euo pipefail

HOST=${ORCHESTRATOR_HOST:-localhost}
PORT=${ORCHESTRATOR_PORT:-8000}
BASE_URL="http://${HOST}:${PORT}"

echo "[1/5] Registering demo user"
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/user/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}' || true)
echo "${REGISTER_RESPONSE}"

echo "[2/5] Logging in"
TOKEN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}' | jq -r '.access_token')
echo "Token acquired"

echo "[3/5] Starting KYC"
APPLICATION_ID=$(curl -s -X POST "${BASE_URL}/kyc/start" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"method":"doc"}' | jq -r '.application_id')
echo "Application ID: ${APPLICATION_ID}"

echo "[4/5] Uploading docs"
curl -s -X POST "${BASE_URL}/kyc/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "application_id=${APPLICATION_ID}" \
  -F "id_front=@demo_files/id_front.jpg" \
  -F "selfie=@demo_files/selfie.jpg" > /dev/null
echo "Upload complete, waiting for processing..."

for i in {1..12}; do
  STATUS=$(curl -s "${BASE_URL}/kyc/status/${APPLICATION_ID}" \
    -H "Authorization: Bearer ${TOKEN}" | jq -r '.status')
  echo "Status: ${STATUS}"
  if [[ "${STATUS}" == "APPROVED" || "${STATUS}" == "FLAGGED" ]]; then
    break
  fi
  sleep 5
done

echo "[5/5] Fetch final result"
curl -s "${BASE_URL}/kyc/result/${APPLICATION_ID}" \
  -H "Authorization: Bearer ${TOKEN}"

