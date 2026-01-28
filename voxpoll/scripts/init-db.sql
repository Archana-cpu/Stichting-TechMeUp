-- ══════════════════════════════════════════════════════════════════════════════
-- VOXPOLL - DATABASE INITIALIZATION
-- This script runs automatically when PostgreSQL container starts
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE voxpoll TO voxpoll;
