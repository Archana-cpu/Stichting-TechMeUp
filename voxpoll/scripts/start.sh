#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - START DOCKER SERVICES
# ══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════════════"
echo "  VOXPOLL - Starting Services"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

cd "$ROOT_DIR"
docker compose up -d

echo ""
echo "  Services:"
echo "    PostgreSQL:  localhost:5432"
echo "    Redis:       localhost:6379"
echo "    Meilisearch: localhost:7700"
echo "    MinIO:       localhost:9000 (console: 9001)"
echo "    Mailpit:     localhost:8025 (SMTP: 1025)"
echo ""
