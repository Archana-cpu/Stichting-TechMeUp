#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - START API ONLY
# ══════════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════════════"
echo "  VOXPOLL - API Development"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Ensure Docker services are running
cd "$ROOT_DIR"
if ! docker compose ps --services --filter "status=running" | grep -q "postgres"; then
    echo "Starting Docker services..."
    docker compose up -d
    sleep 3
fi
echo "✓ Docker services running"
echo ""

echo "Starting API server..."
echo ""
echo "  API:    http://localhost:3001"
echo "  Docs:   http://localhost:3001/api/docs"
echo ""

cd "$ROOT_DIR/packages/api"
pnpm dev
