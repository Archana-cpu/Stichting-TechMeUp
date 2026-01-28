# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - DATABASE OPERATIONS
# Usage: .\scripts\db.ps1 <command>
# Commands: push, generate, studio, seed, reset
# ══════════════════════════════════════════════════════════════════════════════

param(
    [Parameter(Position=0)]
    [ValidateSet("push", "generate", "studio", "seed", "reset", "migrate")]
    [string]$Command = "push"
)

$ErrorActionPreference = "Stop"
$rootPath = Split-Path -Parent $PSScriptRoot
$dbPath = Join-Path $rootPath "packages/database"

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VOXPOLL - Database: $Command" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location $dbPath

switch ($Command) {
    "push" {
        Write-Host "Pushing schema to database..." -ForegroundColor Yellow
        pnpm db:push
        Write-Host "  Schema pushed successfully" -ForegroundColor Green
    }
    "generate" {
        Write-Host "Generating migration..." -ForegroundColor Yellow
        pnpm db:generate
        Write-Host "  Migration generated" -ForegroundColor Green
    }
    "studio" {
        Write-Host "Opening Drizzle Studio..." -ForegroundColor Yellow
        Write-Host "  Studio: https://local.drizzle.studio" -ForegroundColor Cyan
        pnpm db:studio
    }
    "seed" {
        Write-Host "Seeding database..." -ForegroundColor Yellow
        pnpm db:seed
        Write-Host "  Database seeded" -ForegroundColor Green
    }
    "reset" {
        Write-Host "WARNING: This will drop all tables!" -ForegroundColor Red
        $confirm = Read-Host "Type 'yes' to confirm"
        if ($confirm -eq "yes") {
            docker compose exec -T postgres psql -U voxpoll -d voxpoll -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
            Write-Host "  Database reset" -ForegroundColor Green
            Write-Host "  Run 'db.ps1 push' to recreate schema" -ForegroundColor Gray
        } else {
            Write-Host "Cancelled." -ForegroundColor Gray
        }
    }
    "migrate" {
        Write-Host "Running migrations..." -ForegroundColor Yellow
        pnpm db:migrate
        Write-Host "  Migrations complete" -ForegroundColor Green
    }
}

Write-Host ""
Set-Location $rootPath
