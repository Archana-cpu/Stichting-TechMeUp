#!/bin/bash
# ════════════════════════════════════════════════════════════════════════════
# VOXPOLL - QUICK START SCRIPT (Unix/macOS/Linux)
# One command to set up the entire development environment
# ════════════════════════════════════════════════════════════════════════════

set -e

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  VOXPOLL - Quick Start Setup"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ─────────────────────────────────────────────────────────────────────────────
# Check Prerequisites
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\033[33m[1/7] Checking prerequisites...\033[0m"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "\033[31m❌ Docker is not installed. Please install Docker.\033[0m"
    echo "   Download: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "\033[31m❌ Docker is not running. Please start Docker.\033[0m"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "\033[31m❌ Node.js is not installed. Please install Node.js 22+.\033[0m"
    echo "   Download: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "\033[32m   ✓ Docker is running\033[0m"
echo -e "\033[32m   ✓ Node.js $NODE_VERSION\033[0m"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "\033[33m   Installing pnpm...\033[0m"
    npm install -g pnpm
fi
echo -e "\033[32m   ✓ pnpm is available\033[0m"

# ─────────────────────────────────────────────────────────────────────────────
# Setup Environment
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "\033[33m[2/7] Setting up environment...\033[0m"

# Create .env if not exists
if [ ! -f "$ROOT_DIR/.env" ]; then
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"

    # Generate random secrets
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    PARTICIPANT_SALT=$(openssl rand -hex 32)
    FRAUD_SALT=$(openssl rand -hex 32)

    # Update .env file (macOS compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|JWT_SECRET=|JWT_SECRET=$JWT_SECRET|" "$ROOT_DIR/.env"
        sed -i '' "s|JWT_REFRESH_SECRET=|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" "$ROOT_DIR/.env"
        sed -i '' "s|PARTICIPANT_HASH_SALT=|PARTICIPANT_HASH_SALT=$PARTICIPANT_SALT|" "$ROOT_DIR/.env"
        sed -i '' "s|FRAUD_DETECTION_SALT=|FRAUD_DETECTION_SALT=$FRAUD_SALT|" "$ROOT_DIR/.env"
    else
        sed -i "s|JWT_SECRET=|JWT_SECRET=$JWT_SECRET|" "$ROOT_DIR/.env"
        sed -i "s|JWT_REFRESH_SECRET=|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" "$ROOT_DIR/.env"
        sed -i "s|PARTICIPANT_HASH_SALT=|PARTICIPANT_HASH_SALT=$PARTICIPANT_SALT|" "$ROOT_DIR/.env"
        sed -i "s|FRAUD_DETECTION_SALT=|FRAUD_DETECTION_SALT=$FRAUD_SALT|" "$ROOT_DIR/.env"
    fi

    echo -e "\033[32m   ✓ Created .env with generated secrets\033[0m"
else
    echo -e "\033[32m   ✓ .env file exists\033[0m"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Start Docker Services
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "\033[33m[3/7] Starting Docker services...\033[0m"

cd "$ROOT_DIR"
docker compose up -d

# Wait for services to be healthy
echo -e "\033[90m   Waiting for services to be ready...\033[0m"
sleep 10

echo -e "\033[32m   ✓ Docker services are running\033[0m"

# ─────────────────────────────────────────────────────────────────────────────
# Install Dependencies
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "\033[33m[4/7] Installing dependencies...\033[0m"

pnpm install
echo -e "\033[32m   ✓ Dependencies installed\033[0m"

# ─────────────────────────────────────────────────────────────────────────────
# Run Migrations
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "\033[33m[5/7] Running database migrations...\033[0m"

cd "$ROOT_DIR/packages/database"
pnpm run db:migrate:deploy
echo -e "\033[32m   ✓ Migrations completed\033[0m"

# ─────────────────────────────────────────────────────────────────────────────
# Seed Database
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "\033[33m[6/7] Seeding database...\033[0m"

pnpm run db:seed
echo -e "\033[32m   ✓ Database seeded\033[0m"

# ─────────────────────────────────────────────────────────────────────────────
# Build Packages
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "\033[33m[7/7] Building packages...\033[0m"

cd "$ROOT_DIR"
pnpm run build --filter=@voxpoll/database
echo -e "\033[32m   ✓ Packages built\033[0m"

# ─────────────────────────────────────────────────────────────────────────────
# Done!
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "\033[32m═══════════════════════════════════════════════════════════════════\033[0m"
echo -e "\033[32m  ✅ SETUP COMPLETE!\033[0m"
echo -e "\033[32m═══════════════════════════════════════════════════════════════════\033[0m"
echo ""
echo "  Services running:"
echo -e "\033[90m    • PostgreSQL:   localhost:5432\033[0m"
echo -e "\033[90m    • Redis:        localhost:6379\033[0m"
echo -e "\033[90m    • Meilisearch:  localhost:7700\033[0m"
echo -e "\033[90m    • MinIO:        localhost:9000 (Console: 9001)\033[0m"
echo -e "\033[90m    • Mailpit:      localhost:8025\033[0m"
echo ""
echo "  Demo Accounts (password: password123):"
echo -e "\033[90m    • admin@voxpoll.local       (Admin)\033[0m"
echo -e "\033[90m    • moderator@voxpoll.local   (Moderator)\033[0m"
echo -e "\033[90m    • premium@voxpoll.local     (Premium User)\033[0m"
echo -e "\033[90m    • plus@voxpoll.local        (Plus User)\033[0m"
echo -e "\033[90m    • free@voxpoll.local        (Free User)\033[0m"
echo ""
echo "  Next steps:"
echo -e "\033[36m    1. Start API:  pnpm --filter @voxpoll/api dev\033[0m"
echo -e "\033[36m    2. Start Web:  pnpm --filter @voxpoll/web dev\033[0m"
echo ""
echo "  Useful commands:"
echo -e "\033[90m    • pnpm db:studio   - Open Drizzle Studio\033[0m"
echo -e "\033[90m    • pnpm test        - Run tests\033[0m"
echo -e "\033[90m    • docker compose logs -f  - View service logs\033[0m"
echo ""
