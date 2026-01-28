# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - START API ONLY
# ══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$rootPath = Split-Path -Parent $PSScriptRoot

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VOXPOLL - API Development" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Ensure Docker services are running
Write-Host "Checking Docker services..." -ForegroundColor Yellow
Set-Location $rootPath
$runningContainers = docker compose ps --services --filter "status=running" 2>&1
if ($runningContainers -notcontains "postgres") {
    Write-Host "  Starting Docker services..." -ForegroundColor Gray
    docker compose up -d
    Start-Sleep -Seconds 3
}
Write-Host "  Docker services running" -ForegroundColor Green
Write-Host ""

Write-Host "Starting API server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  API:    http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Docs:   http://localhost:3001/api/docs" -ForegroundColor Cyan
Write-Host ""

Set-Location (Join-Path $rootPath "packages/api")
pnpm dev
