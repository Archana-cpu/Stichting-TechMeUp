// ════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - DRIZZLE CLIENT
// ════════════════════════════════════════════════════════════════════════════

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./db/schema"

// ────────────────────────────────────────────────────────────────────────────
// Connection Configuration
// ────────────────────────────────────────────────────────────────────────────

const connectionString = process.env["DATABASE_URL"]

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// ────────────────────────────────────────────────────────────────────────────
// PostgreSQL Client (postgres.js)
// ────────────────────────────────────────────────────────────────────────────

const client = postgres(connectionString, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: false
})

// ────────────────────────────────────────────────────────────────────────────
// Drizzle ORM Instance
// ────────────────────────────────────────────────────────────────────────────

const db = drizzle(client, {
  schema,
  logger: process.env["NODE_ENV"] === "development"
})

// ────────────────────────────────────────────────────────────────────────────
// Exports
// ────────────────────────────────────────────────────────────────────────────

export { db, client }
