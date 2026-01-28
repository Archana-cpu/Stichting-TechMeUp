#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - START ALL DEVELOPMENT SERVERS
# ══════════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════════════"
echo "  VOXPOLL - Development Mode"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Ensure Docker services are running
echo "Checking Docker services..."
cd "$ROOT_DIR"
if ! docker compose ps --services --filter "status=running" | grep -q "postgres"; then
    echo "  Starting Docker services..."
    docker compose up -d
    sleep 3
fi
echo "  ✓ Docker services running"
echo ""

echo "Starting development servers..."
echo ""
echo "  API:    http://localhost:3001"
echo "  Web:    http://localhost:3000"
echo "  Docs:   http://localhost:3001/api/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

pnpm dev
