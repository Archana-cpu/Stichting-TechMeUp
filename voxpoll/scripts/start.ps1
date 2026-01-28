# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - START DOCKER SERVICES
# ══════════════════════════════════════════════════════════════════════════════

$rootPath = Split-Path -Parent $PSScriptRoot

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VOXPOLL - Starting Services" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location $rootPath
docker compose up -d

Write-Host ""
Write-Host "  Services:" -ForegroundColor Green
Write-Host "    PostgreSQL:  localhost:5432" -ForegroundColor White
Write-Host "    Redis:       localhost:6379" -ForegroundColor White
Write-Host "    Meilisearch: localhost:7700" -ForegroundColor White
Write-Host "    MinIO:       localhost:9000 (console: 9001)" -ForegroundColor White
Write-Host "    Mailpit:     localhost:8025 (SMTP: 1025)" -ForegroundColor White
Write-Host ""
