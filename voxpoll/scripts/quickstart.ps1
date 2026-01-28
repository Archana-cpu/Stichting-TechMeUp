# ════════════════════════════════════════════════════════════════════════════
# VOXPOLL - QUICK START SCRIPT (Windows PowerShell)
# One command to set up the entire development environment
# ════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VOXPOLL - Quick Start Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# Check Prerequisites
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "[1/7] Checking prerequisites..." -ForegroundColor Yellow

# Check Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop." -ForegroundColor Red
    Write-Host "   Download: https://www.docker.com/products/docker-desktop/" -ForegroundColor Gray
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 22+." -ForegroundColor Red
    Write-Host "   Download: https://nodejs.org/" -ForegroundColor Gray
    exit 1
}

$nodeVersion = node -v
Write-Host "   ✓ Docker is running" -ForegroundColor Green
Write-Host "   ✓ Node.js $nodeVersion" -ForegroundColor Green

# Check pnpm
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "   Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}
Write-Host "   ✓ pnpm is available" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Setup Environment
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[2/7] Setting up environment..." -ForegroundColor Yellow

$rootDir = Split-Path -Parent $PSScriptRoot

# Create .env if not exists
if (!(Test-Path "$rootDir\.env")) {
    Copy-Item "$rootDir\.env.example" "$rootDir\.env"

    # Generate random secrets
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $jwtRefreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $participantSalt = -join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    $fraudSalt = -join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})

    # Update .env file
    $envContent = Get-Content "$rootDir\.env" -Raw
    $envContent = $envContent -replace "JWT_SECRET=", "JWT_SECRET=$jwtSecret"
    $envContent = $envContent -replace "JWT_REFRESH_SECRET=", "JWT_REFRESH_SECRET=$jwtRefreshSecret"
    $envContent = $envContent -replace "PARTICIPANT_HASH_SALT=", "PARTICIPANT_HASH_SALT=$participantSalt"
    $envContent = $envContent -replace "FRAUD_DETECTION_SALT=", "FRAUD_DETECTION_SALT=$fraudSalt"
    Set-Content "$rootDir\.env" $envContent

    Write-Host "   ✓ Created .env with generated secrets" -ForegroundColor Green
} else {
    Write-Host "   ✓ .env file exists" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────────────────
# Start Docker Services
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[3/7] Starting Docker services..." -ForegroundColor Yellow

Set-Location $rootDir
docker compose up -d

# Wait for services to be healthy
Write-Host "   Waiting for services to be ready..." -ForegroundColor Gray
$maxRetries = 30
$retries = 0

while ($retries -lt $maxRetries) {
    try {
        $result = docker compose ps --format json | ConvertFrom-Json
        $allHealthy = $true
        foreach ($service in $result) {
            if ($service.Health -and $service.Health -ne "healthy") {
                $allHealthy = $false
                break
            }
        }
        if ($allHealthy) { break }
    } catch {}
    Start-Sleep -Seconds 2
    $retries++
}

Write-Host "   ✓ Docker services are running" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Install Dependencies
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[4/7] Installing dependencies..." -ForegroundColor Yellow

pnpm install
Write-Host "   ✓ Dependencies installed" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Run Migrations
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[5/7] Running database migrations..." -ForegroundColor Yellow

Set-Location "$rootDir\packages\database"
pnpm run db:migrate:deploy
Write-Host "   ✓ Migrations completed" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Seed Database
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[6/7] Seeding database..." -ForegroundColor Yellow

pnpm run db:seed
Write-Host "   ✓ Database seeded" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Build Packages
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[7/7] Building packages..." -ForegroundColor Yellow

Set-Location $rootDir
pnpm run build --filter=@voxpoll/database
Write-Host "   ✓ Packages built" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# Done!
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Services running:" -ForegroundColor White
Write-Host "    • PostgreSQL:   localhost:5432" -ForegroundColor Gray
Write-Host "    • Redis:        localhost:6379" -ForegroundColor Gray
Write-Host "    • Meilisearch:  localhost:7700" -ForegroundColor Gray
Write-Host "    • MinIO:        localhost:9000 (Console: 9001)" -ForegroundColor Gray
Write-Host "    • Mailpit:      localhost:8025" -ForegroundColor Gray
Write-Host ""
Write-Host "  Demo Accounts (password: password123):" -ForegroundColor White
Write-Host "    • admin@voxpoll.local       (Admin)" -ForegroundColor Gray
Write-Host "    • moderator@voxpoll.local   (Moderator)" -ForegroundColor Gray
Write-Host "    • premium@voxpoll.local     (Premium User)" -ForegroundColor Gray
Write-Host "    • plus@voxpoll.local        (Plus User)" -ForegroundColor Gray
Write-Host "    • free@voxpoll.local        (Free User)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "    1. Start API:  pnpm --filter @voxpoll/api dev" -ForegroundColor Cyan
Write-Host "    2. Start Web:  pnpm --filter @voxpoll/web dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Useful commands:" -ForegroundColor White
Write-Host "    • pnpm db:studio   - Open Drizzle Studio" -ForegroundColor Gray
Write-Host "    • pnpm test        - Run tests" -ForegroundColor Gray
Write-Host "    • docker compose logs -f  - View service logs" -ForegroundColor Gray
Write-Host ""
