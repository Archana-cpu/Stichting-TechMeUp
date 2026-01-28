#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - START MOBILE (EXPO)
# ══════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════════════"
echo "  VOXPOLL - Mobile Development (Expo)"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "  Scan QR code with Expo Go app"
echo "  Or press 'a' for Android emulator"
echo "  Or press 'i' for iOS simulator"
echo ""
echo "NOTE: Make sure API is running (dev-api.sh)"
echo "NOTE: Update EXPO_PUBLIC_API_URL with your machine's IP for physical devices"
echo ""

cd "$ROOT_DIR/packages/mobile"
pnpm start
