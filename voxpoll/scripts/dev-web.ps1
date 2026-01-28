# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - START WEB ONLY
# ══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$rootPath = Split-Path -Parent $PSScriptRoot

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VOXPOLL - Web Development" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Web app..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Web:    http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: Make sure API is running (dev-api.ps1)" -ForegroundColor Gray
Write-Host ""

Set-Location (Join-Path $rootPath "packages/web")
pnpm dev
