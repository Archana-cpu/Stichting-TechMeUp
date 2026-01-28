#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - FIRST TIME SETUP
# Run this once when you clone the project
# ══════════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════════════"
echo "  VOXPOLL - First Time Setup"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Check Docker
echo "[1/6] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    echo "Download: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "ERROR: Docker is not running. Please start Docker."
    exit 1
fi
echo "  ✓ Docker is running"

# Check Node.js
echo "[2/6] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Download: https://nodejs.org (v22+ recommended)"
    exit 1
fi
echo "  ✓ Node.js $(node -v)"

# Check pnpm
echo "[3/6] Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "  Installing pnpm..."
    npm install -g pnpm
fi
echo "  ✓ pnpm $(pnpm -v)"

# Create .env if not exists
echo "[4/6] Setting up environment..."
if [ ! -f "$ROOT_DIR/.env" ]; then
    if [ -f "$ROOT_DIR/.env.example" ]; then
        cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"

        # Generate random secrets
        JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
        JWT_REFRESH_SECRET=$(openssl rand -base64 32 | tr -d '\n')
        PARTICIPANT_SALT=$(openssl rand -hex 32)
        FRAUD_SALT=$(openssl rand -hex 32)

        # Update .env with Docker values
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|DATABASE_URL=\"postgresql://user:password@localhost:5432/voxpoll\"|DATABASE_URL=\"postgresql://voxpoll:voxpoll123@localhost:5432/voxpoll\"|" "$ROOT_DIR/.env"
            sed -i '' "s|REDIS_URL=\"redis://localhost:6379\"|REDIS_URL=\"redis://:voxpoll123@localhost:6379\"|" "$ROOT_DIR/.env"
            sed -i '' "s|JWT_SECRET=|JWT_SECRET=$JWT_SECRET|" "$ROOT_DIR/.env"
            sed -i '' "s|JWT_REFRESH_SECRET=|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" "$ROOT_DIR/.env"
            sed -i '' "s|PARTICIPANT_HASH_SALT=|PARTICIPANT_HASH_SALT=$PARTICIPANT_SALT|" "$ROOT_DIR/.env"
            sed -i '' "s|FRAUD_DETECTION_SALT=|FRAUD_DETECTION_SALT=$FRAUD_SALT|" "$ROOT_DIR/.env"
            sed -i '' "s|MEILISEARCH_API_KEY=|MEILISEARCH_API_KEY=voxpoll_search_key|" "$ROOT_DIR/.env"
        else
            sed -i "s|DATABASE_URL=\"postgresql://user:password@localhost:5432/voxpoll\"|DATABASE_URL=\"postgresql://voxpoll:voxpoll123@localhost:5432/voxpoll\"|" "$ROOT_DIR/.env"
            sed -i "s|REDIS_URL=\"redis://localhost:6379\"|REDIS_URL=\"redis://:voxpoll123@localhost:6379\"|" "$ROOT_DIR/.env"
            sed -i "s|JWT_SECRET=|JWT_SECRET=$JWT_SECRET|" "$ROOT_DIR/.env"
            sed -i "s|JWT_REFRESH_SECRET=|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" "$ROOT_DIR/.env"
            sed -i "s|PARTICIPANT_HASH_SALT=|PARTICIPANT_HASH_SALT=$PARTICIPANT_SALT|" "$ROOT_DIR/.env"
            sed -i "s|FRAUD_DETECTION_SALT=|FRAUD_DETECTION_SALT=$FRAUD_SALT|" "$ROOT_DIR/.env"
            sed -i "s|MEILISEARCH_API_KEY=|MEILISEARCH_API_KEY=voxpoll_search_key|" "$ROOT_DIR/.env"
        fi

        echo "  ✓ Created .env with generated secrets"
    else
        echo "  ⚠ WARNING: .env.example not found"
    fi
else
    echo "  ✓ .env already exists"
fi

# Install dependencies
echo "[5/6] Installing dependencies..."
cd "$ROOT_DIR"
pnpm install
echo "  ✓ Dependencies installed"

# Start Docker services
echo "[6/6] Starting Docker services..."
docker compose up -d
echo "  ✓ Docker services started"

# Wait for PostgreSQL
echo ""
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U voxpoll &> /dev/null; then
        echo "  ✓ PostgreSQL is ready"
        break
    fi
    sleep 1
done

# Run migrations
echo ""
echo "Running database migrations..."
cd "$ROOT_DIR/packages/database"
pnpm db:push
echo "  ✓ Migrations complete"

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  SETUP COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "  Services running:"
echo "    PostgreSQL:  localhost:5432"
echo "    Redis:       localhost:6379"
echo "    Meilisearch: localhost:7700"
echo "    MinIO:       localhost:9000 (console: 9001)"
echo "    Mailpit:     localhost:8025 (SMTP: 1025)"
echo ""
echo "  Next steps:"
echo "    ./scripts/dev.sh          - Start development servers"
echo "    ./scripts/dev-api.sh      - Start only API"
echo "    ./scripts/dev-web.sh      - Start only Web"
echo "    ./scripts/stop.sh         - Stop Docker services"
echo ""

cd "$ROOT_DIR"
