#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[stage-workflow] starting services..."
docker compose up --build -d

echo "[stage-workflow] services started"
echo "admin-web:  http://localhost:${ADMIN_WEB_PORT:-8080}"
echo "mobile-h5:  http://localhost:${MOBILE_H5_PORT:-8081}"
echo "server:     http://localhost:${SERVER_PORT:-3000}"
