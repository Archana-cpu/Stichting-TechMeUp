# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - RESET EVERYTHING (DESTRUCTIVE!)
# Removes all Docker volumes and reinstalls
# ══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$rootPath = Split-Path -Parent $PSScriptRoot

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host "  VOXPOLL - RESET (DESTRUCTIVE!)" -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host ""
Write-Host "  WARNING: This will delete ALL data:" -ForegroundColor Yellow
Write-Host "    - Database data" -ForegroundColor White
Write-Host "    - Redis cache" -ForegroundColor White
Write-Host "    - Search indexes" -ForegroundColor White
Write-Host "    - Uploaded files" -ForegroundColor White
Write-Host "    - node_modules" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Type 'yes' to confirm"
if ($confirm -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "Stopping and removing containers..." -ForegroundColor Yellow
Set-Location $rootPath
docker compose down -v --remove-orphans

Write-Host "Removing node_modules..." -ForegroundColor Yellow
Get-ChildItem -Path $rootPath -Recurse -Directory -Filter "node_modules" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Removing pnpm-lock.yaml..." -ForegroundColor Yellow
Remove-Item -Path (Join-Path $rootPath "pnpm-lock.yaml") -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Reset complete. Run '.\scripts\setup.ps1' to start fresh." -ForegroundColor Green
Write-Host ""
