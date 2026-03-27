#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

mkdir -p deploy/backup
backup_file="deploy/backup/stage_workflow_$(date +%Y%m%d_%H%M%S).sql"

echo "[stage-workflow] backing up postgres to ${backup_file}"
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-stage_workflow}" > "${backup_file}"
echo "[stage-workflow] backup complete"
