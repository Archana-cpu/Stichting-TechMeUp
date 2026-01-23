# ============================================================================
# SEQUENCES - ONE COMMAND START SCRIPT (Windows PowerShell)
# ============================================================================

Write-Host "🚀 Starting Sequences..." -ForegroundColor Cyan

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Docker is not running. Starting Docker Desktop..." -ForegroundColor Yellow
    
    # Try to find and start Docker Desktop
    $dockerPaths = @(
        "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
        "$env:LOCALAPPDATA\Docker\Docker Desktop.exe"
    )
    
    $dockerExe = $dockerPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
    
    if ($dockerExe) {
        Write-Host "🐳 Starting Docker Desktop..." -ForegroundColor Cyan
        Start-Process $dockerExe
        
        # Wait for Docker to start (max 60 seconds)
        Write-Host "⏳ Waiting for Docker to start..." -ForegroundColor Yellow
        $maxWait = 60
        $waited = 0
        while ($waited -lt $maxWait) {
            Start-Sleep -Seconds 2
            $waited += 2
            $dockerCheck = docker info 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Docker Desktop is now running!" -ForegroundColor Green
                break
            }
            Write-Host "   Still waiting... ($waited/$maxWait seconds)" -ForegroundColor Gray
        }
        
        if ($waited -ge $maxWait) {
            Write-Host "❌ Docker Desktop took too long to start. Please check manually." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Docker Desktop executable not found. Please start Docker Desktop manually." -ForegroundColor Red
        exit 1
    }
}

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    $secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    @"
# Auth
AUTH_SECRET=$secret
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# Google OAuth (optional for development)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Database (handled by Docker)
DATABASE_URL=postgresql://sequences:sequences@db:5432/sequences
DIRECT_URL=postgresql://sequences:sequences@db:5432/sequences
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker compose down --remove-orphans 2>$null

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
docker compose up -d --build

# Wait for database
Write-Host "⏳ Waiting for database..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Run migrations
Write-Host "🗃️ Running migrations and seeding database..." -ForegroundColor Yellow
docker compose --profile setup run --rm migrate 2>$null

# Health check
Write-Host "🏥 Checking application health..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0
do {
    Start-Sleep -Seconds 2
    $retryCount++
    Write-Host "   Waiting for app to start... ($retryCount/$maxRetries)"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) { break }
    } catch {}
} while ($retryCount -lt $maxRetries)

Write-Host ""
Write-Host "✅ ==============================================" -ForegroundColor Green
Write-Host "✅ Sequences is running!" -ForegroundColor Green
Write-Host "✅ ==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 App:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 Database: postgresql://sequences:sequences@localhost:5432/sequences" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Commands:" -ForegroundColor Yellow
Write-Host "   docker compose logs -f    # View logs"
Write-Host "   docker compose down       # Stop all services"
Write-Host "   docker compose restart    # Restart services"
Write-Host ""

# Open browser
Start-Process "http://localhost:3000"
