# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - START MOBILE (EXPO)
# ══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$rootPath = Split-Path -Parent $PSScriptRoot

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VOXPOLL - Mobile Development (Expo)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Expo server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Scan QR code with Expo Go app" -ForegroundColor Cyan
Write-Host "  Or press 'a' for Android emulator" -ForegroundColor Cyan
Write-Host "  Or press 'i' for iOS simulator (macOS only)" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: Make sure API is running (dev-api.ps1)" -ForegroundColor Gray
Write-Host "NOTE: Update EXPO_PUBLIC_API_URL with your machine's IP for physical devices" -ForegroundColor Gray
Write-Host ""

Set-Location (Join-Path $rootPath "packages/mobile")
pnpm start
