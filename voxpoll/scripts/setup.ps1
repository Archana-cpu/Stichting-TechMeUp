# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - FIRST TIME SETUP
# Run this once when you clone the project
# ══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VOXPOLL - First Time Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "[1/6] Checking Docker..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Gray
    exit 1
}

$dockerStatus = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "  Docker is running" -ForegroundColor Green

# Check Node.js
Write-Host "[2/6] Checking Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed." -ForegroundColor Red
    Write-Host "Download: https://nodejs.org (v22+ recommended)" -ForegroundColor Gray
    exit 1
}
$nodeVersion = node -v
Write-Host "  Node.js $nodeVersion" -ForegroundColor Green

# Check pnpm
Write-Host "[3/6] Checking pnpm..." -ForegroundColor Yellow
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "  Installing pnpm..." -ForegroundColor Gray
    npm install -g pnpm
}
$pnpmVersion = pnpm -v
Write-Host "  pnpm $pnpmVersion" -ForegroundColor Green

# Create .env if not exists
Write-Host "[4/6] Setting up environment..." -ForegroundColor Yellow
$rootPath = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $rootPath ".env"
$envExamplePath = Join-Path $rootPath ".env.example"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath

        # Generate random secrets
        $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        $jwtRefreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        $participantSalt = -join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
        $fraudSalt = -join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})

        # Update .env with Docker values
        $content = Get-Content $envPath -Raw
        $content = $content -replace 'DATABASE_URL="postgresql://user:password@localhost:5432/voxpoll"', 'DATABASE_URL="postgresql://voxpoll:voxpoll123@localhost:5432/voxpoll"'
        $content = $content -replace 'REDIS_URL="redis://localhost:6379"', 'REDIS_URL="redis://:voxpoll123@localhost:6379"'
        $content = $content -replace 'JWT_SECRET=', "JWT_SECRET=$jwtSecret"
        $content = $content -replace 'JWT_REFRESH_SECRET=', "JWT_REFRESH_SECRET=$jwtRefreshSecret"
        $content = $content -replace 'PARTICIPANT_HASH_SALT=', "PARTICIPANT_HASH_SALT=$participantSalt"
        $content = $content -replace 'FRAUD_DETECTION_SALT=', "FRAUD_DETECTION_SALT=$fraudSalt"
        $content = $content -replace 'MEILISEARCH_API_KEY=', 'MEILISEARCH_API_KEY=voxpoll_search_key'
        Set-Content $envPath $content

        Write-Host "  Created .env with generated secrets" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: .env.example not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "  .env already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "[5/6] Installing dependencies..." -ForegroundColor Yellow
Set-Location $rootPath
pnpm install
Write-Host "  Dependencies installed" -ForegroundColor Green

# Start Docker services
Write-Host "[6/6] Starting Docker services..." -ForegroundColor Yellow
docker compose up -d
Write-Host "  Docker services started" -ForegroundColor Green

# Wait for PostgreSQL
Write-Host ""
Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    $attempt++
    Start-Sleep -Seconds 1
    $result = docker compose exec -T postgres pg_isready -U voxpoll 2>&1
} while ($LASTEXITCODE -ne 0 -and $attempt -lt $maxAttempts)

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: PostgreSQL is taking longer than expected to start." -ForegroundColor Yellow
} else {
    Write-Host "  PostgreSQL is ready" -ForegroundColor Green
}

# Run migrations
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow
Set-Location (Join-Path $rootPath "packages/database")
pnpm db:push
Write-Host "  Migrations complete" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Services running:" -ForegroundColor Cyan
Write-Host "    PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "    Redis:      localhost:6379" -ForegroundColor White
Write-Host "    Meilisearch: localhost:7700" -ForegroundColor White
Write-Host "    MinIO:      localhost:9000 (console: 9001)" -ForegroundColor White
Write-Host "    Mailpit:    localhost:8025 (SMTP: 1025)" -ForegroundColor White
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Cyan
Write-Host "    .\scripts\dev.ps1          - Start development servers" -ForegroundColor White
Write-Host "    .\scripts\dev-api.ps1      - Start only API" -ForegroundColor White
Write-Host "    .\scripts\dev-web.ps1      - Start only Web" -ForegroundColor White
Write-Host "    .\scripts\stop.ps1         - Stop Docker services" -ForegroundColor White
Write-Host ""

Set-Location $rootPath
