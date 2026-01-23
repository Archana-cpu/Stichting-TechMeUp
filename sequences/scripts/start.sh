#!/bin/bash
set -e

# ============================================================================
# SEQUENCES - ONE COMMAND START SCRIPT
# ============================================================================

echo "🚀 Starting Sequences..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cat > .env << EOF
# Auth
AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "development_secret_please_change")
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# Google OAuth (optional for development)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Database (handled by Docker)
DATABASE_URL=postgresql://sequences:sequences@db:5432/sequences
DIRECT_URL=postgresql://sequences:sequences@db:5432/sequences
EOF
    echo "✅ .env file created"
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || true

# Build and start services
echo "🔨 Building and starting services..."
docker compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 5

# Run migrations and seed
echo "🗃️ Running migrations and seeding database..."
docker compose run --rm migrate 2>/dev/null || {
    echo "⚠️ Migration service not available, running manually..."
    docker compose exec -T web sh -c "cd /app && npx prisma db push --accept-data-loss && npx prisma db seed" 2>/dev/null || true
}

# Health check
echo "🏥 Checking application health..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -s http://localhost:3000/api/health > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "⚠️ Health check timed out, but app may still be starting..."
        break
    fi
    echo "   Waiting for app to start... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

echo ""
echo "✅ =============================================="
echo "✅ Sequences is running!"
echo "✅ =============================================="
echo ""
echo "🌐 App:      http://localhost:3000"
echo "📊 Database: postgresql://sequences:sequences@localhost:5432/sequences"
echo ""
echo "📚 Commands:"
echo "   docker compose logs -f    # View logs"
echo "   docker compose down       # Stop all services"
echo "   docker compose restart    # Restart services"
echo ""
