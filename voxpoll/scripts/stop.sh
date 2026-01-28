#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - STOP DOCKER SERVICES
# ══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════════════"
echo "  VOXPOLL - Stopping Services"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

cd "$ROOT_DIR"
docker compose stop

echo ""
echo "  ✓ Services stopped (data preserved)"
echo "  Run './scripts/start.sh' to restart"
echo ""
