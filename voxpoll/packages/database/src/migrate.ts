// ════════════════════════════════════════════════════════════════════════════
// VOXPOLL DATABASE - MIGRATION RUNNER
// ════════════════════════════════════════════════════════════════════════════

import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

const connectionString = process.env["DATABASE_URL"]

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set")
  process.exit(1)
}

const migrationClient = postgres(connectionString, { max: 1 })

async function main() {
  console.log("Running migrations...")

  const db = drizzle(migrationClient)

  await migrate(db, { migrationsFolder: "./drizzle/migrations" })

  console.log("Migrations completed successfully!")

  await migrationClient.end()
  process.exit(0)
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
