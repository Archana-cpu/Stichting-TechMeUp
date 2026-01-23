import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    console.error("DATABASE_URL is not set, using empty string")
  }

  const pool = new Pool({ connectionString: connectionString || "" })
  const adapter = new PrismaPg(pool)

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()
export const db = prisma

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export * from "@prisma/client"
