// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - DRIZZLE CLIENT
// ══════════════════════════════════════════════════════════════════════════════

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// ─────────────────────────────────────────────────────────────────────────────
// Connection Configuration
// ─────────────────────────────────────────────────────────────────────────────

const connectionString = process.env['DATABASE_URL']

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// ─────────────────────────────────────────────────────────────────────────────
// PostgreSQL Client (postgres.js)
// ─────────────────────────────────────────────────────────────────────────────

const client = postgres(connectionString, {
  max: 10, // Connection pool size
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Disable prepared statements for edge compatibility
})

// ─────────────────────────────────────────────────────────────────────────────
// Drizzle ORM Instance
// ─────────────────────────────────────────────────────────────────────────────

export const db = drizzle(client, {
  schema,
  logger: process.env['NODE_ENV'] === 'development',
})

export type DrizzleDB = typeof db

// ─────────────────────────────────────────────────────────────────────────────
// Connection Management
// ─────────────────────────────────────────────────────────────────────────────

export async function closeConnection(): Promise<void> {
  await client.end()
}

// Export the raw client for direct SQL queries if needed
export { client as pgClient }
