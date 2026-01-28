# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - STOP DOCKER SERVICES
# ══════════════════════════════════════════════════════════════════════════════

$rootPath = Split-Path -Parent $PSScriptRoot

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VOXPOLL - Stopping Services" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location $rootPath
docker compose stop

Write-Host ""
Write-Host "  Services stopped (data preserved)" -ForegroundColor Green
Write-Host "  Run '.\scripts\start.ps1' to restart" -ForegroundColor Gray
Write-Host ""
