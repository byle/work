#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[stage-workflow] stopping services..."
docker compose down
