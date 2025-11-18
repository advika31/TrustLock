#!/usr/bin/env bash

set -euo pipefail

BASE_URL=${1:-http://localhost:3000}

echo "Seeding mock data at $BASE_URL/api/mock/demo/seed"
curl -s -X POST "$BASE_URL/api/mock/demo/seed" | jq .



