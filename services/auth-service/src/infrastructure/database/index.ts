import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import { config } from "../../config"
import type { Database } from "./types"
import { logger } from "../../utils/logger"

// Create a connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
})

// Log connection events
pool.on("connect", () => {
  logger.debug("Connected to PostgreSQL database")
})

pool.on("error", (err) => {
  logger.error("PostgreSQL pool error", { error: err.message })
})

// Initialize kysely with the postgres dialect
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
})

// Function to close the database connection
export async function closeDatabase() {
  await db.destroy()
  logger.info("Database connections closed")
}
