#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - START WEB ONLY
# ══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════════════"
echo "  VOXPOLL - Web Development"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "  Web: http://localhost:3000"
echo ""
echo "NOTE: Make sure API is running (dev-api.sh)"
echo ""

cd "$ROOT_DIR/packages/web"
pnpm dev
