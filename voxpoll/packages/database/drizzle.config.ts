// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL - DRIZZLE CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

import { defineConfig } from "drizzle-kit"
import { readFileSync } from "fs"
import { resolve } from "path"

// Load .env file from project root
const envPath = resolve(__dirname, "../../.env")
try {
  const envContent = readFileSync(envPath, "utf-8")
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=")
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "")
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value
      }
    }
  })
} catch {
  // .env file not found, rely on environment variables
}

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ WHAT: Drizzle Kit configuration for migrations and studio                   │
// │ WHY:  Defines database connection and migration output settings             │
// │ HOW:  Run `pnpm db:generate` to create migrations from schema changes       │
// └─────────────────────────────────────────────────────────────────────────────┘

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  verbose: true,
  strict: true
})

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • dialect: "postgresql"                                                     │
// │   └─ Tells Drizzle we're using PostgreSQL                                   │
// │                                                                             │
// │ • schema: "./src/db/schema/index.ts"                                        │
// │   └─ Path to schema barrel export (all tables exported from here)           │
// │                                                                             │
// │ • out: "./drizzle/migrations"                                               │
// │   └─ Where SQL migration files are generated                                │
// │   └─ These are pure SQL - you can inspect and modify them                   │
// │                                                                             │
// │ • verbose: true                                                             │
// │   └─ Shows detailed output during migration generation                      │
// │                                                                             │
// │ • strict: true                                                              │
// │   └─ Fails on warnings (recommended for production)                         │
// │                                                                             │
// │ COMMANDS:                                                                   │
// │ • pnpm db:generate  → Generate migrations from schema changes               │
// │ • pnpm db:push      → Push schema directly to DB (dev only)                 │
// │ • pnpm db:migrate   → Run pending migrations                                │
// │ • pnpm db:studio    → Open Drizzle Studio GUI                               │
// └─────────────────────────────────────────────────────────────────────────────┘
